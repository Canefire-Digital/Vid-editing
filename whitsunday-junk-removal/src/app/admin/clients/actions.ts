"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTeam } from "@/lib/auth";
import { bool, num, oneOf, str } from "@/lib/form";
import type { ActionResult, ClientType } from "@/lib/types";

const TYPES = ["real_estate", "commercial", "residential"] as const satisfies readonly ClientType[];

function clientFields(fd: FormData) {
  return {
    name: str(fd, "name"),
    type: oneOf(fd, "type", TYPES, "residential"),
    contact_person: str(fd, "contact_person"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    address: str(fd, "address"),
    notes: str(fd, "notes"),
    payment_terms_days: Math.max(0, Math.round(num(fd, "payment_terms_days") ?? 0)),
  };
}

export async function createClientAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const fields = clientFields(fd);
  if (!fields.name) return { error: "Client name is required." };
  const { data, error } = await supabase.from("clients").insert(fields).select("id").single();
  if (error) return { error: error.message };

  const quoteId = str(fd, "quote_request_id");
  if (quoteId) await supabase.from("quote_requests").update({ client_id: data.id, status: "quoted" }).eq("id", quoteId);

  revalidatePath("/admin/clients");
  const returnTo = str(fd, "return_to");
  redirect(returnTo === "job" ? `/admin/jobs/new?client=${data.id}` : `/admin/clients/${data.id}`);
}

export async function updateClientAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id");
  const fields = { ...clientFields(fd), archived: bool(fd, "archived") };
  if (!id || !fields.name) return { error: "Client name is required." };
  const { error } = await supabase.from("clients").update(fields).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${id}`);
}

export async function deleteClientAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id");
  const { error } = await supabase.from("clients").delete().eq("id", id!);
  if (error) {
    return { error: "This client has jobs or invoices, so it can't be deleted. Archive it instead (Edit → Archived)." };
  }
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}
