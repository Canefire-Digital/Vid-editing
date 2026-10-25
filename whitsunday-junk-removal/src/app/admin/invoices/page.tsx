import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import { Card, Empty, InvoiceStatusBadge, PageHeader, Stat, TableWrap } from "@/components/admin/ui";
import { getTeam } from "@/lib/auth";
import { aud, daysBetween, dmy, sum, todayISO } from "@/lib/format";
import type { InvoiceSummary } from "@/lib/types";

export const metadata = { title: "Invoices" };

const TABS = [
  { key: "outstanding", label: "Outstanding" },
  { key: "overdue", label: "Overdue" },
  { key: "draft", label: "Drafts" },
  { key: "paid", label: "Paid" },
  { key: "all", label: "All" },
];

export default async function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "outstanding";
  const { supabase } = await getTeam();
  const { data } = await supabase.from("invoice_summary").select("*").order("number_seq", { ascending: false }).limit(1000);
  const all = (data ?? []) as InvoiceSummary[];
  const today = todayISO();

  const outstanding = all.filter((i) => i.status === "sent");
  const overdue = all.filter((i) => i.display_status === "overdue");
  const drafts = all.filter((i) => i.status === "draft");
  const list =
    tab === "overdue"
      ? overdue
      : tab === "draft"
        ? drafts
        : tab === "paid"
          ? all.filter((i) => i.status === "paid")
          : tab === "all"
            ? all
            : outstanding;

  return (
    <>
      <PageHeader
        title="Invoices"
        actions={
          <Link href="/admin/invoices/new" className="btn btn-primary">
            <Plus size={18} /> New invoice
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Outstanding" value={aud(sum(outstanding, (i) => i.balance), true)} hint={`${outstanding.length} invoices`} href="/admin/invoices?tab=outstanding" />
        <Stat label="Overdue" value={aud(sum(overdue, (i) => i.balance), true)} hint={`${overdue.length} invoices`} tone={overdue.length ? "bad" : "default"} href="/admin/invoices?tab=overdue" />
        <Stat label="Drafts" value={drafts.length} hint="not sent yet" tone={drafts.length ? "warn" : "default"} href="/admin/invoices?tab=draft" />
      </div>

      {overdue.length > 0 && tab !== "overdue" && (
        <Link href="/admin/invoices?tab=overdue" className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle size={18} /> {overdue.length} overdue invoice{overdue.length === 1 ? "" : "s"} — tap to chase them up.
        </Link>
      )}

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/invoices?tab=${t.key}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${tab === t.key ? "bg-ocean text-white" : "bg-white text-ink-soft ring-1 ring-line hover:text-teal-700"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card>
        {list.length === 0 ? (
          <Empty>Nothing here.</Empty>
        ) : (
          <TableWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th className="hidden sm:table-cell">Due</th>
                  <th>Status</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => {
                  const late = i.display_status === "overdue" ? daysBetween(i.due_date, today) : 0;
                  return (
                    <tr key={i.id}>
                      <td>
                        <Link href={`/admin/invoices/${i.id}`} className="font-semibold hover:text-teal-800">
                          {i.invoice_number}
                        </Link>
                        <div className="text-xs text-slate-500">{dmy(i.issue_date)}</div>
                      </td>
                      <td className="max-w-[10rem] truncate">{i.client_name}</td>
                      <td className="hidden whitespace-nowrap sm:table-cell">
                        {dmy(i.due_date)}
                        {late > 0 && <div className="text-xs text-red-700">{late} days late</div>}
                      </td>
                      <td>
                        <InvoiceStatusBadge status={i.display_status} />
                      </td>
                      <td className="text-right tabular-nums">
                        {i.status === "void" ? "—" : aud(i.status === "paid" ? i.total : i.balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
