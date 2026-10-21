"use server";

import { revalidatePath } from "next/cache";
import { getSettings, getTeam } from "@/lib/auth";
import { bool, num, str } from "@/lib/form";
import type { ActionResult } from "@/lib/types";

export async function saveSettingsAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const current = await getSettings();

  const nextNumber = Math.round(num(fd, "invoice_next_number") ?? current.invoice_next_number);
  if (nextNumber !== current.invoice_next_number) {
    const { data: maxRow } = await supabase.from("invoices").select("number_seq").order("number_seq", { ascending: false }).limit(1);
    const max = maxRow?.[0]?.number_seq ?? 0;
    if (nextNumber <= max) return { error: `Next invoice number must be higher than ${max} (already used).` };
  }
  const pct = (k: string, fallback: number) => {
    const v = num(fd, k);
    return v === null ? fallback : Math.min(100, Math.max(0, v));
  };
  const money = (k: string, fallback: number) => {
    const v = num(fd, k);
    return v === null ? fallback : Math.max(0, v);
  };
  const days = (k: string, fallback: number) => Math.max(0, Math.round(num(fd, k) ?? fallback));

  const { error } = await supabase
    .from("settings")
    .update({
      business_name: str(fd, "business_name") ?? current.business_name,
      abn: str(fd, "abn"),
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      postal_address: str(fd, "postal_address"),
      bank_account_name: str(fd, "bank_account_name"),
      bank_bsb: str(fd, "bank_bsb"),
      bank_account_number: str(fd, "bank_account_number"),
      invoice_prefix: str(fd, "invoice_prefix") ?? current.invoice_prefix,
      invoice_next_number: Math.max(1, nextNumber),
      invoice_footer: str(fd, "invoice_footer"),
      gst_registered: bool(fd, "gst_registered"),
      gst_rate: pct("gst_rate", current.gst_rate),
      tax_set_aside_rate: pct("tax_set_aside_rate", current.tax_set_aside_rate),
      terms_real_estate: days("terms_real_estate", current.terms_real_estate),
      terms_commercial: days("terms_commercial", current.terms_commercial),
      terms_residential: days("terms_residential", current.terms_residential),
      price_full: money("price_full", current.price_full),
      price_three_quarter: money("price_three_quarter", current.price_three_quarter),
      price_half: money("price_half", current.price_half),
      price_quarter: money("price_quarter", current.price_quarter),
      quote_notify_email: str(fd, "quote_notify_email"),
    })
    .eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: "Settings saved." };
}

export async function saveProfileAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase, me } = await getTeam();
  const name = str(fd, "display_name");
  if (!name) return { error: "Enter a name." };
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", me.id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: "Name updated." };
}

export async function changePasswordAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const pw = String(fd.get("password") ?? "");
  if (pw.length < 10) return { error: "Use at least 10 characters." };
  if (pw !== String(fd.get("confirm") ?? "")) return { error: "Passwords don't match." };
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { error: error.message };
  return { ok: "Password changed." };
}
