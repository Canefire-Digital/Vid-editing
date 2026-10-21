import Link from "next/link";
import { FileDown, FileText } from "lucide-react";
import { ReceiptsZip } from "@/components/admin/receipts-zip";
import { Card, PageHeader, Stat, TableWrap } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { aud, dmy, fyRange, fyStartYear, sum } from "@/lib/format";
import { buildFyReport } from "@/lib/report";

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const current = fyStartYear();
  const requested = Number(sp.fy);
  const startYear = Number.isInteger(requested) && requested > 2000 && requested <= current ? requested : current;
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const r = await buildFyReport(supabase, team, settings, startYear);

  const withReceipts = r.expenses.filter((e) => e.receipt_path);
  const signed = withReceipts.length
    ? (await supabase.storage.from("receipts").createSignedUrls(withReceipts.map((e) => e.receipt_path!), 3600)).data ?? []
    : [];
  const urlByPath = new Map(signed.map((x) => [x.path, x.signedUrl]));
  const zipItems = withReceipts
    .map((e) => {
      const url = urlByPath.get(e.receipt_path!);
      const ext = e.receipt_path!.split(".").pop();
      const label = `${e.expense_date}_${e.category}_${Number(e.amount).toFixed(2)}_${(e.supplier ?? "").replace(/[^a-z0-9]+/gi, "-")}`.replace(/-+$/, "");
      return url ? { url, name: `${label}_${e.id.slice(0, 6)}.${ext}` } : null;
    })
    .filter((x): x is { url: string; name: string } => !!x);

  const years = Array.from({ length: Math.max(1, current - 2024 + 1) }, (_, i) => current - i);
  const csv = (type: string) => `/admin/reports/export?fy=${startYear}&type=${type}`;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`${r.fy.label}: ${dmy(r.fy.from)} – ${dmy(r.fy.to)}`}
        actions={
          <form className="flex gap-2">
            <select name="fy" defaultValue={startYear} className="input w-auto">
              {years.map((y) => (
                <option key={y} value={y}>
                  {fyRange(y).label}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost">Show</button>
          </form>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Income received" value={aud(r.totals.income, true)} tone="good" />
        <Stat label="Expenses" value={aud(r.totals.expenses, true)} />
        <Stat label="Net profit" value={aud(r.totals.profit, true)} tone={r.totals.profit >= 0 ? "good" : "bad"} />
        <Stat label="Invoiced (ex GST)" value={aud(r.totals.invoiced, true)} />
      </div>

      <Card title="For your accountant" className="mb-5">
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/reports/pdf?fy=${startYear}`} target="_blank" rel="noreferrer" className="btn btn-primary">
            <FileText size={18} /> End-of-year report (PDF)
          </a>
          <a href={csv("summary")} className="btn btn-ghost">
            <FileDown size={18} /> Summary CSV
          </a>
          <a href={csv("income")} className="btn btn-ghost">
            <FileDown size={18} /> Income CSV
          </a>
          <a href={csv("expenses")} className="btn btn-ghost">
            <FileDown size={18} /> Expenses CSV
          </a>
          <a href={csv("invoices")} className="btn btn-ghost">
            <FileDown size={18} /> Invoices CSV
          </a>
          <a href={csv("payouts")} className="btn btn-ghost">
            <FileDown size={18} /> Payouts CSV
          </a>
        </div>
        <div className="mt-4 border-t border-white/5 pt-4">
          <ReceiptsZip items={zipItems} filename={`wjr-receipts-fy${startYear}-${String(startYear + 1).slice(2)}.zip`} />
        </div>
        {r.missingReceipts.length > 0 && (
          <p className="mt-3 text-sm text-amber-200">
            {r.missingReceipts.length} expense{r.missingReceipts.length === 1 ? "" : "s"} ({aud(sum(r.missingReceipts, (e) => e.amount))}) have no receipt.{" "}
            <Link href="/admin/expenses?flag=noreceipt&period=all" className="underline">
              Review
            </Link>
          </p>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Expenses by category">
          <ul className="space-y-2.5">
            {r.categories.map((c) => (
              <li key={c.key}>
                <div className="flex justify-between text-sm">
                  <span>
                    {c.label} <span className="text-white/40">({c.count})</span>
                  </span>
                  <span className="tabular-nums">{aud(c.total)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-teal-400" style={{ width: `${r.totals.expenses ? (c.total / r.totals.expenses) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{aud(r.totals.expenses)}</span>
          </div>
        </Card>

        <Card title="Each partner's share">
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th className="text-right">1/3 profit</th>
                  <th className="text-right">Payouts</th>
                  <th className="text-right">Reimbursed</th>
                  <th className="text-right">Tax est.</th>
                </tr>
              </thead>
              <tbody>
                {r.partners.map((p) => (
                  <tr key={p.partner.id}>
                    <td className="font-medium">{p.partner.display_name}</td>
                    <td className="text-right tabular-nums">{aud(p.fyShare)}</td>
                    <td className="text-right tabular-nums">{aud(p.fyPayouts)}</td>
                    <td className="text-right tabular-nums">{aud(p.fyReimbursed)}</td>
                    <td className="text-right tabular-nums text-amber-200">{aud(p.taxSetAside)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          {r.outstandingAtEnd.length > 0 && (
            <p className="mt-3 text-sm text-white/60">
              {r.outstandingAtEnd.length} invoice{r.outstandingAtEnd.length === 1 ? " was" : "s were"} unpaid at 30 June ({aud(sum(r.outstandingAtEnd, (i) => i.balance))}) — not counted as income for this year.
            </p>
          )}
        </Card>
      </div>

      <p className="mt-6 text-xs text-white/40">
        Records are kept indefinitely in the database and receipts are never deleted from storage. The ATO requires 5 years — keep the Supabase project on a paid plan (or export
        these files each year) so nothing is lost.
      </p>
    </>
  );
}
