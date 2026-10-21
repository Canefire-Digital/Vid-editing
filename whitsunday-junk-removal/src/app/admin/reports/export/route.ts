import { getSettings, getTeam, nameOf } from "@/lib/auth";
import { EXPENSE_CATEGORIES, INVOICE_STATUSES } from "@/lib/constants";
import { fyStartYear } from "@/lib/format";
import { buildFyReport, toCsv } from "@/lib/report";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "summary";
  const fyParam = Number(url.searchParams.get("fy"));
  const startYear = Number.isInteger(fyParam) && fyParam > 2000 ? fyParam : fyStartYear();
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const r = await buildFyReport(supabase, team, settings, startYear);

  let rows: (string | number | null)[][];
  switch (type) {
    case "income":
      rows = [["Date received", "Invoice", "Client", "Method", "Amount"], ...r.income.map((p) => [p.paid_on, p.invoice_number, p.client, p.method, p.amount.toFixed(2)])];
      break;
    case "invoices":
      rows = [
        ["Invoice", "Issue date", "Due date", "Client", "Status", "Subtotal", "GST", "Total", "Paid to date", "Balance"],
        ...r.invoices.map((i) => [i.invoice_number, i.issue_date, i.due_date, i.client_name, INVOICE_STATUSES[i.display_status], i.subtotal, i.gst_amount, i.total, i.amount_paid, i.status === "void" ? 0 : i.balance]),
      ];
      break;
    case "expenses":
      rows = [
        ["Date", "Category", "Supplier", "Description", "Amount", "Paid by", "Reimbursed on", "Receipt"],
        ...r.expenses.map((e) => [
          e.expense_date,
          EXPENSE_CATEGORIES[e.category],
          e.supplier,
          e.description,
          Number(e.amount).toFixed(2),
          e.paid_by ? nameOf(team, e.paid_by) : "Business account",
          e.reimbursed_on,
          e.receipt_path ? "Yes" : "MISSING",
        ]),
      ];
      break;
    case "payouts":
      rows = [["Date", "Partner", "Amount", "Notes"], ...r.payouts.map((p) => [p.paid_on, nameOf(team, p.profile_id), Number(p.amount).toFixed(2), p.notes])];
      break;
    default:
      rows = [
        [settings.business_name, r.fy.label],
        [],
        ["Income received (cash basis)", r.totals.income.toFixed(2)],
        ["Invoiced in year (ex GST)", r.totals.invoiced.toFixed(2)],
        ["Total expenses", r.totals.expenses.toFixed(2)],
        ["Net profit", r.totals.profit.toFixed(2)],
        [],
        ["Expenses by category", "Count", "Amount"],
        ...r.categories.map((c) => [c.label, c.count, c.total.toFixed(2)]),
        [],
        ["Partner", "Share of profit (1/3)", "Payouts in FY", "Reimbursed in FY", `Tax set-aside estimate (${Number(settings.tax_set_aside_rate)}%)`],
        ...r.partners.map((p) => [p.partner.display_name, p.fyShare.toFixed(2), p.fyPayouts.toFixed(2), p.fyReimbursed.toFixed(2), p.taxSetAside.toFixed(2)]),
        [],
        ["Invoices unpaid at 30 June", "Client", "Balance"],
        ...r.outstandingAtEnd.map((i) => [i.invoice_number, i.client, i.balance.toFixed(2)]),
      ];
  }

  const slug = `wjr-fy${startYear}-${String(startYear + 1).slice(2)}-${type}.csv`;
  return new Response("﻿" + toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
