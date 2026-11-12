import Link from "next/link";
import { AlertTriangle, ArrowRight, Inbox, Plus } from "lucide-react";
import { GstMeter } from "@/components/admin/gst-meter";
import { Card, Empty, JobStatusBadge, Stat } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { LOAD_SIZES } from "@/lib/constants";
import { gstStatus, loadLedger, partnerBalances, periodTotals } from "@/lib/finance";
import { aud, fyRange, fyStartYear, monthRange, shortDate, sum, todayISO } from "@/lib/format";
import type { InvoiceSummary, JobSummary } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase, me, team } = await getTeam();
  const settings = await getSettings();
  const today = todayISO();
  const month = monthRange(today);
  const fy = fyRange(fyStartYear(today));

  const [ledger, { data: openInv }, { data: upcoming }, { count: newQuotes }] = await Promise.all([
    loadLedger(supabase),
    supabase.from("invoice_summary").select("id, balance, display_status").eq("status", "sent"),
    supabase
      .from("job_summary")
      .select("*")
      .in("status", ["quoted", "booked", "done"])
      .order("job_date")
      .limit(8),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const m = periodTotals(ledger, month.from, month.to);
  const y = periodTotals(ledger, fy.from, fy.to);
  const outstanding = (openInv ?? []) as Pick<InvoiceSummary, "id" | "balance" | "display_status">[];
  const overdue = outstanding.filter((i) => i.display_status === "overdue");
  const gst = gstStatus(ledger, today);
  const partners = partnerBalances(ledger, team, settings.tax_set_aside_rate, fy);
  const jobs = (upcoming ?? []) as JobSummary[];
  const toInvoice = jobs.filter((j) => j.status === "done").length;
  const noReceipt = ledger.expenses.filter((e) => !e.receipt_path && e.expense_date >= fy.from).length;
  const setupMissing = !settings.abn || !settings.bank_bsb || !settings.bank_account_number || !settings.phone;

  const hour = Number(new Intl.DateTimeFormat("en-AU", { hour: "numeric", hour12: false, timeZone: "Australia/Brisbane" }).format(new Date()));
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Arvo" : "Evening";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{new Date(`${today}T00:00:00Z`).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-gradient">{me.display_name}</span>
          </h1>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link href="/admin/expenses/new" className="btn btn-ghost">
            <Plus size={18} /> Expense
          </Link>
          <Link href="/admin/jobs/new" className="btn btn-primary">
            <Plus size={18} /> Job
          </Link>
        </div>
      </div>

      <div className="mb-5 space-y-2">
        {setupMissing && (
          <Alert href="/admin/settings" tone="amber">
            Finish setup: add your ABN, phone and bank details so invoices are complete.
          </Alert>
        )}
        {overdue.length > 0 && (
          <Alert href="/admin/invoices?tab=overdue" tone="red">
            {overdue.length} overdue invoice{overdue.length === 1 ? "" : "s"} · {aud(sum(overdue, (i) => i.balance))} to chase
          </Alert>
        )}
        {(newQuotes ?? 0) > 0 && (
          <Alert href="/admin/quotes" tone="teal" icon={<Inbox size={18} />}>
            {newQuotes} new quote request{newQuotes === 1 ? "" : "s"} from the website
          </Alert>
        )}
        {gst.alert && (
          <Alert href="/admin/gst" tone={gst.over ? "red" : "amber"}>
            GST turnover is {aud(gst.turnover, true)} ({gst.pct.toFixed(0)}% of $75k) — time to talk to your accountant.
          </Alert>
        )}
        {noReceipt > 0 && (
          <Alert href="/admin/expenses?flag=noreceipt" tone="amber">
            {noReceipt} expense{noReceipt === 1 ? "" : "s"} this FY without a receipt
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={`Income · ${month.label}`} value={aud(m.income, true)} hint={`${fy.label}: ${aud(y.income, true)}`} tone="good" href="/admin/reports" />
        <Stat label={`Expenses · ${month.label}`} value={aud(m.expenses, true)} hint={`${fy.label}: ${aud(y.expenses, true)}`} href="/admin/expenses?period=month" />
        <Stat label={`Profit · ${month.label}`} value={aud(m.profit, true)} hint={`${fy.label}: ${aud(y.profit, true)}`} tone={m.profit >= 0 ? "good" : "bad"} href="/admin/reports" />
        <Stat
          label="Outstanding"
          value={aud(sum(outstanding, (i) => i.balance), true)}
          hint={overdue.length ? <span className="text-red-700">{overdue.length} overdue</span> : `${outstanding.length} invoices`}
          tone={overdue.length ? "bad" : "default"}
          href="/admin/invoices"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Card
          title="Coming up"
          className="lg:col-span-3"
          action={
            <Link href="/admin/jobs" className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
              All jobs <ArrowRight size={14} />
            </Link>
          }
        >
          {toInvoice > 0 && (
            <p className="mb-3 text-sm text-amber-900">
              {toInvoice} finished job{toInvoice === 1 ? "" : "s"} still need an invoice.
            </p>
          )}
          {jobs.length === 0 ? (
            <Empty action={<Link href="/admin/jobs/new" className="btn btn-primary btn-sm">Book a job</Link>}>No open jobs.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {jobs.map((j) => (
                <li key={j.id}>
                  <Link href={`/admin/jobs/${j.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-teal-800">
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold ${j.job_date === today ? "text-teal-700" : j.job_date < today ? "text-amber-700" : "text-slate-500"}`}>
                        {j.job_date === today ? "Today" : shortDate(j.job_date)}
                      </div>
                      <div className="truncate font-medium">{j.client_name}</div>
                      <div className="truncate text-xs text-slate-500">
                        {LOAD_SIZES[j.load_size]}
                        {j.address && ` · ${j.address}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold tabular-nums">{aud(j.price, true)}</div>
                      <JobStatusBadge status={j.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card title="GST threshold">
            <GstMeter gst={gst} compact />
          </Card>
          <Card
            title="Partner balances"
            action={
              <Link href="/admin/partners" className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
                Details <ArrowRight size={14} />
              </Link>
            }
          >
            <ul className="space-y-3">
              {partners.map((p) => (
                <li key={p.partner.id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.partner.display_name}</div>
                    <div className="text-xs text-slate-500">
                      Tax set-aside {aud(p.taxSetAside, true)}
                      {p.reimbursementOwed > 0 && <span className="text-amber-700"> · {aud(p.reimbursementOwed)} to reimburse</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold tabular-nums text-teal-700">{aud(p.totalOwed, true)}</div>
                    <div className="text-[11px] text-slate-500">owed</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function Alert({ href, tone, icon, children }: { href: string; tone: "red" | "amber" | "teal"; icon?: React.ReactNode; children: React.ReactNode }) {
  const cls = {
    red: "border-red-300 bg-red-50 text-red-800",
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    teal: "border-teal-700/30 bg-teal-700/10 text-teal-800",
  }[tone];
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${cls}`}>
      {icon ?? <AlertTriangle size={18} />}
      <span className="flex-1">{children}</span>
      <ArrowRight size={16} />
    </Link>
  );
}
