import Link from "next/link";
import { AlertTriangle, Paperclip, Plus } from "lucide-react";
import { Badge, Card, Empty, PageHeader, Stat, TableWrap } from "@/components/admin/ui";
import { getTeam, nameOf } from "@/lib/auth";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { fetchAll } from "@/lib/finance";
import { aud, dmy, fyRange, fyStartYear, monthRange, sum } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: PageProps<"/admin/expenses">) {
  const sp = await searchParams;
  const period = typeof sp.period === "string" ? sp.period : "fy";
  const cat = typeof sp.category === "string" && sp.category in EXPENSE_CATEGORIES ? (sp.category as ExpenseCategory) : null;
  const flag = typeof sp.flag === "string" ? sp.flag : "";
  const { supabase, team } = await getTeam();

  const range = period === "month" ? monthRange() : period === "all" ? { from: "2000-01-01", to: "2999-12-31", label: "All time" } : fyRange(fyStartYear());
  const rows = await fetchAll<Expense>((a, b) => {
    let q = supabase.from("expenses").select("*").gte("expense_date", range.from).lte("expense_date", range.to);
    if (cat) q = q.eq("category", cat);
    if (flag === "owed") q = q.not("paid_by", "is", null).is("reimbursed_on", null);
    if (flag === "noreceipt") q = q.is("receipt_path", null);
    return q.order("expense_date", { ascending: false }).range(a, b);
  });

  const byCat = Object.keys(EXPENSE_CATEGORIES).map((k) => ({
    key: k as ExpenseCategory,
    total: sum(rows.filter((r) => r.category === k), (r) => r.amount),
  }));
  const missing = rows.filter((r) => !r.receipt_path).length;
  const link = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const merged = { period, category: cat, flag, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin/expenses?${p}`;
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={`${range.label} · ${rows.length} expense${rows.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/expenses/new" className="btn btn-primary">
            <Plus size={18} /> New expense
          </Link>
        }
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {[
          ["month", "This month"],
          ["fy", "This financial year"],
          ["all", "All time"],
        ].map(([k, l]) => (
          <Link key={k} href={link({ period: k })} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${period === k ? "bg-teal-400 text-navy-950" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
            {l}
          </Link>
        ))}
        <span className="mx-1 w-px shrink-0 bg-white/10" />
        <Link href={link({ flag: flag === "owed" ? null : "owed" })} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${flag === "owed" ? "bg-amber-300 text-navy-950" : "bg-white/5 text-white/70"}`}>
          Owed to partners
        </Link>
        <Link href={link({ flag: flag === "noreceipt" ? null : "noreceipt" })} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${flag === "noreceipt" ? "bg-red-300 text-navy-950" : "bg-white/5 text-white/70"}`}>
          Missing receipt
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <Stat label="Total" value={aud(sum(rows, (r) => r.amount), true)} tone="warn" href={link({ category: null })} />
        {byCat.map((c) => (
          <Stat key={c.key} label={EXPENSE_CATEGORIES[c.key]} value={aud(c.total, true)} href={link({ category: cat === c.key ? null : c.key })} tone={cat === c.key ? "good" : "default"} />
        ))}
      </div>

      {missing > 0 && flag !== "noreceipt" && (
        <Link href={link({ flag: "noreceipt" })} className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={18} /> {missing} expense{missing === 1 ? " has" : "s have"} no receipt — the ATO may not accept these.
        </Link>
      )}

      <Card>
        {rows.length === 0 ? (
          <Empty action={<Link href="/admin/expenses/new" className="btn btn-primary btn-sm">Add an expense</Link>}>No expenses for this filter.</Empty>
        ) : (
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Expense</th>
                  <th className="hidden md:table-cell">Paid by</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{dmy(e.expense_date)}</td>
                    <td>
                      <Link href={`/admin/expenses/${e.id}`} className="font-medium hover:text-teal-300">
                        {EXPENSE_CATEGORIES[e.category]}
                        {e.supplier && <span className="text-white/60"> · {e.supplier}</span>}
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/50">
                        {e.receipt_path ? <Paperclip size={12} className="text-teal-300" /> : <Badge tone="red">No receipt</Badge>}
                        {e.description}
                        {e.paid_by && !e.reimbursed_on && <Badge tone="amber">Owed to {nameOf(team, e.paid_by)}</Badge>}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">{e.paid_by ? nameOf(team, e.paid_by) : "Business"}</td>
                    <td className="text-right tabular-nums">{aud(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
