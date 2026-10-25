import Link from "next/link";
import { GstMeter } from "@/components/admin/gst-meter";
import { Card, PageHeader, Stat } from "@/components/admin/ui";
import { getSettings, getTeam } from "@/lib/auth";
import { GST_ALERT_AT, GST_THRESHOLD } from "@/lib/constants";
import { gstStatus, loadLedger } from "@/lib/finance";
import { aud, dmy } from "@/lib/format";

export const metadata = { title: "GST tracker" };

export default async function GstPage() {
  const { supabase } = await getTeam();
  const settings = await getSettings();
  const gst = gstStatus(await loadLedger(supabase));
  const max = Math.max(1, ...gst.monthly.map((m) => m.amount));

  return (
    <>
      <PageHeader title="GST tracker" subtitle={`Rolling 12 months: ${dmy(gst.from)} – ${dmy(gst.to)}`} />

      {settings.gst_registered && (
        <p className="mb-5 rounded-xl border border-teal-700/30 bg-teal-700/10 px-4 py-3 text-sm text-teal-800">
          GST mode is on — new invoices charge {Number(settings.gst_rate)}% GST and are titled &quot;Tax Invoice&quot;.
        </p>
      )}

      <Card className="mb-5">
        <GstMeter gst={gst} />
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Left before threshold" value={aud(gst.remaining, true)} />
        <Stat label="Alert level (80%)" value={aud(GST_ALERT_AT, true)} />
        <Stat label="Current pace / year" value={aud(gst.projectedAnnual, true)} hint="based on last 90 days" tone={gst.projectedAnnual >= GST_THRESHOLD ? "warn" : "default"} />
        <Stat label="Average per week" value={aud(gst.dailyRate * 7, true)} />
      </div>

      <Card title="Invoiced per month (ex GST)">
        <div className="flex h-48 items-end gap-1.5 sm:gap-3">
          {gst.monthly.map((m) => (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="text-[10px] tabular-nums text-slate-500">{m.amount > 0 ? `${Math.round(m.amount / 100) / 10}k` : ""}</div>
              <div className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-aqua-400" style={{ height: `${(m.amount / max) * 100}%`, minHeight: m.amount > 0 ? 4 : 0 }} title={aud(m.amount)} />
              <div className="text-[10px] text-slate-500">
                {new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="What to know" className="mt-5">
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink-soft">
          <li>
            You must register for GST within 21 days of your GST turnover reaching (or being likely to reach) {aud(GST_THRESHOLD, true)} — that includes
            <em> projected</em> turnover for the next 12 months, not just past income.
          </li>
          <li>Turnover here = invoices issued (excluding drafts and voided invoices), before GST, in the last 12 months.</li>
          <li>
            Once registered, turn on GST mode in{" "}
            <Link href="/admin/settings" className="text-teal-700 hover:underline">
              Settings
            </Link>
            . Decide with your accountant whether your load prices go up by 10% or stay the same (GST-inclusive).
          </li>
          <li>Until registered, never charge GST or call your invoices &quot;Tax Invoices&quot;.</li>
        </ul>
      </Card>
    </>
  );
}
