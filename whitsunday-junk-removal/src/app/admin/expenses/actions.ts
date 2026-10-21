"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTeam } from "@/lib/auth";
import { aud, todayISO } from "@/lib/format";
import { bool, isISODate, num, oneOf, str } from "@/lib/form";
import type { ActionResult, ExpenseCategory } from "@/lib/types";

const CATS = ["fuel", "dump_fees", "insurance", "advertising", "equipment", "other"] as const satisfies readonly ExpenseCategory[];

function expenseFields(fd: FormData) {
  const date = str(fd, "expense_date");
  const paidBy = str(fd, "paid_by");
  return {
    expense_date: isISODate(date) ? date : todayISO(),
    category: oneOf(fd, "category", CATS, "other"),
    amount: num(fd, "amount"),
    supplier: str(fd, "supplier"),
    description: str(fd, "description"),
    job_id: str(fd, "job_id"),
    receipt_path: str(fd, "receipt_path"),
    no_receipt: bool(fd, "no_receipt"),
    paid_by: paidBy === "business" ? null : paidBy,
  };
}

function validate(f: ReturnType<typeof expenseFields>): string | null {
  if (!f.amount || f.amount <= 0) return "Enter the amount.";
  if (!f.receipt_path && !f.no_receipt) return "Add a photo of the receipt, or tick “No receipt” (you can't claim it without one).";
  return null;
}

export async function createExpenseAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const f = expenseFields(fd);
  const err = validate(f);
  if (err) return { error: err };
  const { error } = await supabase.from("expenses").insert({ ...f, no_receipt: !f.receipt_path && f.no_receipt });
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  if (f.job_id) redirect(`/admin/jobs/${f.job_id}`);
  if (str(fd, "again") === "1") redirect(`/admin/expenses/new?saved=${encodeURIComponent(aud(f.amount))}&t=${Date.now()}`);
  redirect("/admin/expenses");
}

export async function updateExpenseAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const id = str(fd, "id")!;
  const f = expenseFields(fd);
  const err = validate(f);
  if (err) return { error: err };
  const reimbursed = str(fd, "reimbursed_on");
  const { error } = await supabase
    .from("expenses")
    .update({ ...f, no_receipt: !f.receipt_path && f.no_receipt, reimbursed_on: f.paid_by && isISODate(reimbursed) ? reimbursed : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

export async function deleteExpenseAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const { error } = await supabase.from("expenses").delete().eq("id", str(fd, "id")!);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  redirect("/admin/expenses");
}

export async function markReimbursedAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const { supabase } = await getTeam();
  const date = str(fd, "reimbursed_on");
  const on = isISODate(date) ? date : todayISO();
  const expenseId = str(fd, "id");
  const partnerId = str(fd, "partner_id");
  let q = supabase.from("expenses").update({ reimbursed_on: on }).is("reimbursed_on", null);
  if (expenseId) q = q.eq("id", expenseId);
  else if (partnerId) q = q.eq("paid_by", partnerId);
  else return { error: "Nothing selected." };
  const { error } = await q;
  if (error) return { error: error.message };
  revalidatePath("/admin/partners");
  revalidatePath("/admin/expenses");
  return { ok: "Marked as paid back." };
}
