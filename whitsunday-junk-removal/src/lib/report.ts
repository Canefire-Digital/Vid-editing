import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "./constants";
import { fetchAll, loadLedger, partnerBalances, periodTotals, type PartnerBalance, type PeriodTotals } from "./finance";
import { fyRange, sum } from "./format";
import type { Expense, ExpenseCategory, InvoiceSummary, PartnerPayout, Profile, Settings } from "./types";

export type IncomeRow = { paid_on: string; invoice_number: string; client: string; method: string; amount: number };

export type FyReport = {
  fy: { from: string; to: string; label: string; startYear: number };
  totals: PeriodTotals;
  income: IncomeRow[];
  invoices: InvoiceSummary[];
  expenses: Expense[];
  payouts: PartnerPayout[];
  partners: PartnerBalance[];
  reimbursedInFy: Expense[];
  owedAtEnd: Expense[];
  outstandingAtEnd: { invoice_number: string; client: string; due_date: string; balance: number }[];
  missingReceipts: Expense[];
  categories: { key: ExpenseCategory; label: string; total: number; count: number }[];
};

export async function buildFyReport(supabase: SupabaseClient, team: Profile[], settings: Settings, startYear: number): Promise<FyReport> {
  const range = fyRange(startYear);
  const fy = { ...range, startYear };
  const ledger = await loadLedger(supabase);

  const [paymentRows, invoices] = await Promise.all([
    fetchAll<{ paid_on: string; amount: number; method: "bank_transfer" | "cash"; invoices: { invoice_number: string; clients: { name: string } | null } | null }>((a, b) =>
      supabase
        .from("payments")
        .select("paid_on, amount, method, invoices(invoice_number, clients(name))")
        .gte("paid_on", fy.from)
        .lte("paid_on", fy.to)
        .order("paid_on")
        .range(a, b),
    ),
    fetchAll<InvoiceSummary>((a, b) =>
      supabase.from("invoice_summary").select("*").gte("issue_date", fy.from).lte("issue_date", fy.to).order("number_seq").range(a, b),
    ),
  ]);

  // Balances owing as at 30 June (payments after year end don't count)
  const allInvoices = await fetchAll<InvoiceSummary>((a, b) =>
    supabase.from("invoice_summary").select("*").lte("issue_date", fy.to).in("status", ["sent", "paid"]).range(a, b),
  );
  const paidByInvoiceAtEnd = new Map<string, number>();
  for (const p of ledger.payments) {
    if (p.paid_on <= fy.to) paidByInvoiceAtEnd.set(p.invoice_id, (paidByInvoiceAtEnd.get(p.invoice_id) ?? 0) + Number(p.amount));
  }
  const outstandingAtEnd = allInvoices
    .map((i) => ({ invoice_number: i.invoice_number, client: i.client_name, due_date: i.due_date, balance: Math.round((Number(i.total) - (paidByInvoiceAtEnd.get(i.id) ?? 0)) * 100) / 100 }))
    .filter((i) => i.balance > 0.004);

  const expenses = ledger.expenses.filter((e) => e.expense_date >= fy.from && e.expense_date <= fy.to);
  const categories = (Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((key) => {
    const rows = expenses.filter((e) => e.category === key);
    return { key, label: EXPENSE_CATEGORIES[key], total: sum(rows, (e) => e.amount), count: rows.length };
  });

  return {
    fy,
    totals: periodTotals(ledger, fy.from, fy.to),
    income: paymentRows.map((p) => ({
      paid_on: p.paid_on,
      amount: Number(p.amount),
      method: PAYMENT_METHODS[p.method],
      invoice_number: p.invoices?.invoice_number ?? "",
      client: p.invoices?.clients?.name ?? "",
    })),
    invoices,
    expenses,
    payouts: ledger.payouts.filter((p) => p.paid_on >= fy.from && p.paid_on <= fy.to),
    partners: partnerBalances(ledger, team, settings.tax_set_aside_rate, fy),
    reimbursedInFy: ledger.expenses.filter((e) => e.paid_by && e.reimbursed_on && e.reimbursed_on >= fy.from && e.reimbursed_on <= fy.to),
    owedAtEnd: ledger.expenses.filter((e) => e.paid_by && e.expense_date <= fy.to && (!e.reimbursed_on || e.reimbursed_on > fy.to)),
    outstandingAtEnd,
    missingReceipts: expenses.filter((e) => !e.receipt_path),
    categories,
  };
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = v === null || v === undefined ? "" : String(v);
          return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\r\n");
}
