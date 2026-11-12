import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceItem, InvoiceSummary, Payment } from "./types";

export async function loadInvoice(supabase: SupabaseClient, id: string) {
  const [{ data: inv }, { data: items }, { data: payments }] = await Promise.all([
    supabase.from("invoice_summary").select("*").eq("id", id).maybeSingle(),
    supabase.from("invoice_items").select("*").eq("invoice_id", id).order("position"),
    supabase.from("payments").select("*").eq("invoice_id", id).order("paid_on"),
  ]);
  if (!inv) return null;
  const invoice = inv as InvoiceSummary;
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, contact_person, address, email, phone")
    .eq("id", invoice.client_id)
    .single();
  return {
    invoice,
    items: (items ?? []) as InvoiceItem[],
    payments: (payments ?? []) as Payment[],
    client: client as { id: string; name: string; contact_person: string | null; address: string | null; email: string | null; phone: string | null },
  };
}
