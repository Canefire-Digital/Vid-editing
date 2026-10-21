"use server";

import { revalidatePath } from "next/cache";
import { getTeam } from "@/lib/auth";
import { aud, todayISO } from "@/lib/format";
import { isISODate, num, str } from "@/lib/form";
import type { ActionResult } from "@/lib/types";

export async function recordPayoutAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase, team } = await getTeam();
  const date = str(fd, "paid_on");
  const amount = num(fd, "amount");
  const notes = str(fd, "notes");
  const who = fd.getAll("profile_id").map(String).filter((id) => team.some((t) => t.id === id));
  if (!who.length) return { error: "Pick who was paid." };
  if (!amount || amount <= 0) return { error: "Enter the amount." };
  const { error } = await supabase
    .from("partner_payouts")
    .insert(who.map((profile_id) => ({ profile_id, amount, notes, paid_on: isISODate(date) ? date : todayISO() })));
  if (error) return { error: error.message };
  revalidatePath("/admin/partners");
  return { ok: `Recorded ${aud(amount)} to ${who.length === 1 ? team.find((t) => t.id === who[0])?.display_name : `each of ${who.length} partners`}.` };
}

export async function deletePayoutAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const { error } = await supabase.from("partner_payouts").delete().eq("id", str(fd, "id")!);
  if (error) return { error: error.message };
  revalidatePath("/admin/partners");
  return { ok: "Payout removed." };
}
