import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GST_ALERT_AT, GST_THRESHOLD, PARTNER_COUNT } from "./constants";
import { addDays, addMonths, daysBetween, inRange, round2, sum, todayISO } from "./format";
import type { Expense, ExpenseCategory, PartnerPayout, Payment, Profile } from "./types";

type InvoiceLite = { id: string; issue_date: string; subtotal: number; total: number; status: string };

export type Ledger = {
  payments: Pick<Payment, "id" | "invoice_id" | "paid_on" | "amount" | "method">[];
  expenses: Expense[];
  payouts: PartnerPayout[];
  invoices: InvoiceLite[];
};

/** PostgREST caps responses at 1000 rows — page through everything. */
export async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const page = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += page) {
    const res = await build(from, from + page - 1);
    if (res.error) throw new Error(res.error.message);
    const data = (res.data ?? []) as T[];
    out.push(...data);
    if (data.length < page) return out;
  }
}

export async function loadLedger(supabase: SupabaseClient): Promise<Ledger> {
  const [payments, expenses, payouts, invoices] = await Promise.all([
    fetchAll<Ledger["payments"][number]>((a, b) =>
      supabase.from("payments").select("id, invoice_id, paid_on, amount, method").order("paid_on").range(a, b),
    ),
    fetchAll<Expense>((a, b) => supabase.from("expenses").select("*").order("expense_date").range(a, b)),
    fetchAll<PartnerPayout>((a, b) => supabase.from("partner_payouts").select("*").order("paid_on").range(a, b)),
    fetchAll<InvoiceLite>((a, b) =>
      supabase.from("invoices").select("id, issue_date, subtotal, total, status").order("issue_date").range(a, b),
    ),
  ]);
  return { payments, expenses, payouts, invoices };
}

export type PeriodTotals = {
  income: number; // cash received
  invoiced: number; // invoices issued (ex GST), excluding drafts/void
  expenses: number;
  profit: number;
  byCategory: Record<ExpenseCategory, number>;
};

export function periodTotals(l: Ledger, from: string, to: string): PeriodTotals {
  const income = sum(l.payments.filter((p) => inRange(p.paid_on, from, to)), (p) => p.amount);
  const invoiced = sum(
    l.invoices.filter((i) => (i.status === "sent" || i.status === "paid") && inRange(i.issue_date, from, to)),
    (i) => i.subtotal,
  );
  const exp = l.expenses.filter((e) => inRange(e.expense_date, from, to));
  const byCategory = { fuel: 0, dump_fees: 0, insurance: 0, advertising: 0, equipment: 0, other: 0 };
  for (const e of exp) byCategory[e.category] = round2(byCategory[e.category] + Number(e.amount));
  const expenses = sum(exp, (e) => e.amount);
  return { income, invoiced, expenses, profit: round2(income - expenses), byCategory };
}

export type PartnerBalance = {
  partner: Profile;
  shareAllTime: number;
  payoutsAllTime: number;
  available: number; // profit share not yet paid out
  reimbursementOwed: number;
  totalOwed: number;
  fyShare: number;
  fyPayouts: number;
  fyReimbursed: number;
  taxSetAside: number;
};

export function partnerBalances(
  l: Ledger,
  team: Profile[],
  taxRate: number,
  fy: { from: string; to: string },
): PartnerBalance[] {
  const allTime = periodTotals(l, "0000-01-01", "9999-12-31");
  const fyTotals = periodTotals(l, fy.from, fy.to);
  const shareAllTime = round2(allTime.profit / PARTNER_COUNT);
  const fyShare = round2(fyTotals.profit / PARTNER_COUNT);

  return team.map((partner) => {
    const mine = l.payouts.filter((p) => p.profile_id === partner.id);
    const payoutsAllTime = sum(mine, (p) => p.amount);
    const fyPayouts = sum(mine.filter((p) => inRange(p.paid_on, fy.from, fy.to)), (p) => p.amount);
    const personal = l.expenses.filter((e) => e.paid_by === partner.id);
    const reimbursementOwed = sum(personal.filter((e) => !e.reimbursed_on), (e) => e.amount);
    const fyReimbursed = sum(
      personal.filter((e) => e.reimbursed_on && inRange(e.reimbursed_on, fy.from, fy.to)),
      (e) => e.amount,
    );
    const available = round2(shareAllTime - payoutsAllTime);
    return {
      partner,
      shareAllTime,
      payoutsAllTime,
      available,
      reimbursementOwed,
      totalOwed: round2(available + reimbursementOwed),
      fyShare,
      fyPayouts,
      fyReimbursed,
      taxSetAside: round2(Math.max(0, fyShare) * (Number(taxRate) / 100)),
    };
  });
}

/** What should be sitting in the business account if every record is entered. */
export function expectedBankBalance(l: Ledger): number {
  const received = sum(l.payments.filter((p) => p.method === "bank_transfer"), (p) => p.amount);
  const cash = sum(l.payments.filter((p) => p.method === "cash"), (p) => p.amount);
  const businessPaid = sum(l.expenses.filter((e) => !e.paid_by), (e) => e.amount);
  const reimbursed = sum(l.expenses.filter((e) => e.paid_by && e.reimbursed_on), (e) => e.amount);
  const payouts = sum(l.payouts, (p) => p.amount);
  return round2(received + cash - businessPaid - reimbursed - payouts);
}

export type GstStatus = {
  turnover: number;
  from: string;
  to: string;
  pct: number;
  remaining: number;
  alert: boolean;
  over: boolean;
  dailyRate: number;
  projectedAnnual: number;
  projectedDate: string | null;
  monthly: { month: string; amount: number }[];
};

/**
 * GST turnover = invoices issued (ex GST) in the last 12 months.
 * Projection uses the pace of the last 90 days (or since the first invoice, if newer).
 */
export function gstStatus(l: Ledger, today: string = todayISO()): GstStatus {
  const from = addDays(addMonths(today, -12), 1);
  const issued = l.invoices.filter((i) => i.status === "sent" || i.status === "paid");
  const turnover = sum(issued.filter((i) => inRange(i.issue_date, from, today)), (i) => i.subtotal);

  const first = issued[0]?.issue_date;
  const windowStart = first && first > addDays(today, -89) ? first : addDays(today, -89);
  const windowDays = Math.max(1, daysBetween(windowStart, today) + 1);
  const windowTotal = sum(issued.filter((i) => inRange(i.issue_date, windowStart, today)), (i) => i.subtotal);
  const dailyRate = windowTotal / windowDays;

  let projectedDate: string | null = null;
  if (turnover >= GST_THRESHOLD) projectedDate = today;
  else if (dailyRate > 0) {
    const days = Math.ceil((GST_THRESHOLD - turnover) / dailyRate);
    if (days <= 3650) projectedDate = addDays(today, days);
  }

  const monthly: GstStatus["monthly"] = [];
  for (let k = 11; k >= 0; k--) {
    const ym = addMonths(`${today.slice(0, 7)}-01`, -k).slice(0, 7);
    monthly.push({ month: ym, amount: sum(issued.filter((i) => i.issue_date.startsWith(ym)), (i) => i.subtotal) });
  }

  return {
    turnover,
    from,
    to: today,
    pct: Math.min(100, (turnover / GST_THRESHOLD) * 100),
    remaining: Math.max(0, round2(GST_THRESHOLD - turnover)),
    alert: turnover >= GST_ALERT_AT,
    over: turnover >= GST_THRESHOLD,
    dailyRate,
    projectedAnnual: round2(dailyRate * 365),
    projectedDate,
    monthly,
  };
}
