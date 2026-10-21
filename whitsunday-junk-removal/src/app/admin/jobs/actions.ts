"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSettings, getTeam } from "@/lib/auth";
import { loadPrice, LOAD_SIZES } from "@/lib/constants";
import { addDays, todayISO } from "@/lib/format";
import { isISODate, num, oneOf, str } from "@/lib/form";
import type { ActionResult, JobStatus, LoadSize } from "@/lib/types";

const STATUSES = ["quoted", "booked", "done", "invoiced", "paid"] as const satisfies readonly JobStatus[];
const SIZES = ["full", "three_quarter", "half", "quarter", "custom"] as const satisfies readonly LoadSize[];

async function jobFields(fd: FormData) {
  const settings = await getSettings();
  const load_size = oneOf(fd, "load_size", SIZES, "full");
  const custom = num(fd, "price");
  const preset = loadPrice(settings, load_size);
  const price = load_size === "custom" || custom !== null ? custom ?? 0 : preset ?? 0;
  const job_date = str(fd, "job_date");
  return {
    client_id: str(fd, "client_id"),
    job_date: isISODate(job_date) ? job_date : todayISO(),
    address: str(fd, "address"),
    description: str(fd, "description"),
    load_size,
    price: Math.max(0, price),
    status: oneOf(fd, "status", STATUSES, "booked"),
    notes: str(fd, "notes"),
  };
}

async function saveWorkers(jobId: string, fd: FormData) {
  const { supabase } = await getTeam();
  const workers = fd.getAll("workers").map(String).filter(Boolean);
  await supabase.from("job_workers").delete().eq("job_id", jobId);
  if (workers.length) {
    await supabase.from("job_workers").insert(workers.map((profile_id) => ({ job_id: jobId, profile_id })));
  }
}

export async function createJobAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const fields = await jobFields(fd);
  if (!fields.client_id) return { error: "Pick a client (or add a new one first)." };
  const { data, error } = await supabase.from("jobs").insert(fields).select("id").single();
  if (error) return { error: error.message };
  await saveWorkers(data.id, fd);
  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${data.id}`);
}

export async function updateJobAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id");
  const fields = await jobFields(fd);
  if (!id || !fields.client_id) return { error: "Pick a client." };
  const { error } = await supabase.from("jobs").update(fields).eq("id", id);
  if (error) return { error: error.message };
  await saveWorkers(id, fd);
  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${id}`);
}

export async function setJobStatusAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const status = oneOf(fd, "status", STATUSES, "done");
  const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/admin/jobs");
  return { ok: "Status updated." };
}

export async function deleteJobAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const { count } = await supabase.from("invoices").select("id", { count: "exact", head: true }).eq("job_id", id);
  if (count) return { error: "This job has an invoice. Void the invoice instead of deleting the job." };
  const { data: photos } = await supabase.from("job_photos").select("storage_path").eq("job_id", id);
  if (photos?.length) await supabase.storage.from("job-photos").remove(photos.map((p) => p.storage_path));
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function addJobPhotoAction(jobId: string, kind: "before" | "after", storagePath: string) {
  const { supabase } = await getTeam();
  const { error } = await supabase.from("job_photos").insert({ job_id: jobId, kind, storage_path: storagePath });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function deleteJobPhotoAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const { data } = await supabase.from("job_photos").select("job_id, storage_path").eq("id", id).maybeSingle();
  if (!data) return { error: "Photo not found." };
  await supabase.storage.from("job-photos").remove([data.storage_path]);
  await supabase.from("job_photos").delete().eq("id", id);
  revalidatePath(`/admin/jobs/${data.job_id}`);
  return { ok: "Photo removed." };
}

/**
 * Build an invoice from a job. mode = "draft" opens it for editing;
 * "cash" / "bank_transfer" marks it sent and paid in full on the spot.
 */
export async function invoiceJobAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const jobId = str(fd, "id")!;
  const mode = oneOf(fd, "mode", ["draft", "cash", "bank_transfer"] as const, "draft");

  const { data: job } = await supabase
    .from("jobs")
    .select("*, clients(payment_terms_days)")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return { error: "Job not found." };

  const { data: existing } = await supabase.from("invoices").select("id").eq("job_id", jobId).neq("status", "void").limit(1);
  if (existing?.length) redirect(`/admin/invoices/${existing[0].id}`);

  const today = todayISO();
  const terms = mode === "draft" ? Number(job.clients?.payment_terms_days ?? 0) : 0;
  const { data: inv, error } = await supabase
    .from("invoices")
    .insert({
      client_id: job.client_id,
      job_id: jobId,
      issue_date: today,
      payment_terms_days: terms,
      due_date: addDays(today, terms),
      gst_enabled: settings.gst_registered,
      gst_rate: settings.gst_registered ? settings.gst_rate : 0,
      status: mode === "draft" ? "draft" : "sent",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const label = job.load_size === "custom" ? "Junk removal" : `Junk removal — ${LOAD_SIZES[job.load_size as LoadSize].toLowerCase()}`;
  const description = [label, job.address ? `at ${job.address}` : null].filter(Boolean).join(" ");
  const { error: itemErr } = await supabase.from("invoice_items").insert({
    invoice_id: inv.id,
    position: 0,
    description: job.description ? `${description}\n${job.description}` : description,
    quantity: 1,
    unit_price: job.price,
  });
  if (itemErr) return { error: itemErr.message };

  if (mode !== "draft") {
    const { data: totals } = await supabase.from("invoices").select("total").eq("id", inv.id).single();
    if (totals && Number(totals.total) > 0) {
      await supabase.from("payments").insert({ invoice_id: inv.id, amount: totals.total, method: mode, paid_on: today });
    }
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/jobs/${jobId}`);
  redirect(`/admin/invoices/${inv.id}${mode === "draft" ? "/edit" : ""}`);
}
