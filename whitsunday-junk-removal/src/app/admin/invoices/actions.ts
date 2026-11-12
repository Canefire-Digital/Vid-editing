"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSettings, getTeam } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email";
import { addDays, aud, dmy, todayISO } from "@/lib/format";
import { bool, isISODate, num, oneOf, str } from "@/lib/form";
import { loadInvoice } from "@/lib/invoices";
import { renderInvoicePdf } from "@/lib/pdf/invoice";
import type { ActionResult } from "@/lib/types";

type ItemIn = { description: string; quantity: number; unit_price: number };

function parseItems(fd: FormData): ItemIn[] | string {
  try {
    const raw = JSON.parse(String(fd.get("items") ?? "[]")) as ItemIn[];
    const items = raw
      .map((i) => ({ description: String(i.description ?? "").trim(), quantity: Number(i.quantity) || 0, unit_price: Number(i.unit_price) || 0 }))
      .filter((i) => i.description);
    if (!items.length) return "Add at least one line item.";
    return items;
  } catch {
    return "Line items couldn't be read. Refresh and try again.";
  }
}

async function invoiceFields(fd: FormData) {
  const settings = await getSettings();
  const issue = str(fd, "issue_date");
  const issue_date = isISODate(issue) ? issue : todayISO();
  const terms = Math.max(0, Math.round(num(fd, "payment_terms_days") ?? 0));
  const gst_enabled = bool(fd, "gst_enabled");
  return {
    client_id: str(fd, "client_id"),
    job_id: str(fd, "job_id"),
    issue_date,
    payment_terms_days: terms,
    due_date: addDays(issue_date, terms),
    gst_enabled,
    gst_rate: gst_enabled ? Number(settings.gst_rate) : 0,
    notes: str(fd, "notes"),
  };
}

async function writeItems(invoiceId: string, items: ItemIn[]) {
  const { supabase } = await getTeam();
  await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  const { error } = await supabase
    .from("invoice_items")
    .insert(items.map((i, position) => ({ ...i, position, invoice_id: invoiceId })));
  if (error) throw new Error(error.message);
}

export async function createInvoiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const fields = await invoiceFields(fd);
  if (!fields.client_id) return { error: "Choose a client." };
  const items = parseItems(fd);
  if (typeof items === "string") return { error: items };
  const { data, error } = await supabase.from("invoices").insert({ ...fields, status: "draft" }).select("id").single();
  if (error) return { error: error.message };
  await writeItems(data.id, items);
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${data.id}`);
}

export async function updateInvoiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const fields = await invoiceFields(fd);
  if (!fields.client_id) return { error: "Choose a client." };
  const items = parseItems(fd);
  if (typeof items === "string") return { error: items };
  const { data: current } = await supabase.from("invoices").select("status").eq("id", id).single();
  if (current?.status === "void") return { error: "Void invoices can't be edited." };
  const { error } = await supabase.from("invoices").update(fields).eq("id", id);
  if (error) return { error: error.message };
  await writeItems(id, items);
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${id}`);
}

export async function markSentAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const { error } = await supabase.from("invoices").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id).eq("status", "draft");
  if (error) return { error: error.message };
  revalidatePath(`/admin/invoices/${id}`);
  return { ok: "Marked as sent." };
}

export async function sendInvoiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase, me } = await getTeam();
  const settings = await getSettings();
  const id = str(fd, "id")!;
  const to = (str(fd, "to") ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  if (!to.length) return { error: "Enter at least one email address." };
  const message = str(fd, "message");

  const bundle = await loadInvoice(supabase, id);
  if (!bundle) return { error: "Invoice not found." };
  const { invoice } = bundle;
  if (invoice.status === "void") return { error: "This invoice is void." };
  if (!bundle.items.length) return { error: "Add a line item before sending." };

  const pdf = await renderInvoicePdf({ settings, ...bundle });
  const due = invoice.payment_terms_days === 0 ? "on receipt" : `by ${dmy(invoice.due_date)}`;
  const balance = invoice.status === "paid" ? 0 : Number(invoice.balance);
  const bank =
    settings.bank_bsb && settings.bank_account_number
      ? `Bank transfer: ${settings.bank_account_name ?? settings.business_name}, BSB ${settings.bank_bsb}, Account ${settings.bank_account_number}. Reference: ${invoice.invoice_number}.`
      : "";
  const greeting = bundle.client.contact_person ? `Hi ${bundle.client.contact_person.split(" ")[0]},` : "Hi there,";
  const lines = [
    greeting,
    "",
    message ??
      (balance > 0
        ? `Please find attached invoice ${invoice.invoice_number} for ${aud(invoice.total)}, due ${due}.`
        : `Please find attached invoice ${invoice.invoice_number} for your records — it's been paid in full. Thank you!`),
    "",
    balance > 0 ? bank : "",
    "",
    "Thanks for your business,",
    `${me.display_name} — ${settings.business_name}`,
    settings.phone ?? "",
  ].filter((l, i, arr) => !(l === "" && arr[i - 1] === ""));

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#0f172a">${lines
    .map((l) => (l ? `<p style="margin:0 0 4px">${escapeHtml(l)}</p>` : "<br>"))
    .join("")}</div>`;

  const err = await sendEmail({
    to,
    subject: `Invoice ${invoice.invoice_number} from ${settings.business_name}${balance > 0 ? ` — ${aud(balance)} due ${due}` : ""}`,
    text: lines.join("\n"),
    html,
    replyTo: settings.email,
    attachments: [{ filename: `${invoice.invoice_number}.pdf`, content: pdf }],
  });
  if (err) return { error: err };

  await supabase
    .from("invoices")
    .update({ status: invoice.status === "draft" ? "sent" : invoice.status, sent_at: new Date().toISOString(), sent_to: to.join(", ") })
    .eq("id", id);
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  return { ok: `Sent to ${to.join(", ")}.` };
}

export async function recordPaymentAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "invoice_id")!;
  const amount = num(fd, "amount");
  const paid = str(fd, "paid_on");
  if (!amount || amount <= 0) return { error: "Enter the amount received." };
  const { data: inv } = await supabase.from("invoices").select("status").eq("id", id).single();
  if (inv?.status === "void") return { error: "Can't record a payment on a void invoice." };
  if (inv?.status === "draft") await supabase.from("invoices").update({ status: "sent" }).eq("id", id);
  const { error } = await supabase.from("payments").insert({
    invoice_id: id,
    amount,
    paid_on: isISODate(paid) ? paid : todayISO(),
    method: oneOf(fd, "method", ["bank_transfer", "cash"] as const, "bank_transfer"),
    reference: str(fd, "reference"),
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  return { ok: `Payment of ${aud(amount)} recorded.` };
}

export async function deletePaymentAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const { data } = await supabase.from("payments").select("invoice_id").eq("id", id).single();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return { error: error.message };
  if (data) revalidatePath(`/admin/invoices/${data.invoice_id}`);
  return { ok: "Payment removed." };
}

export async function voidInvoiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const { count } = await supabase.from("payments").select("id", { count: "exact", head: true }).eq("invoice_id", id);
  if (count) return { error: "Remove the payments on this invoice before voiding it." };
  const { data: inv, error } = await supabase.from("invoices").update({ status: "void" }).eq("id", id).select("job_id").single();
  if (error) return { error: error.message };
  if (inv?.job_id) await supabase.from("jobs").update({ status: "done" }).eq("id", inv.job_id).eq("status", "invoiced");
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin/invoices");
  return { ok: "Invoice voided. The number stays used so your sequence has no gaps." };
}
