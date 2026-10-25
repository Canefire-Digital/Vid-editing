import Link from "next/link";
import { GST_ALERT_AT, GST_THRESHOLD } from "@/lib/constants";
import type { GstStatus } from "@/lib/finance";
import { aud, longDate } from "@/lib/format";
import { ProgressBar } from "./ui";

export function GstMeter({ gst, compact = false }: { gst: GstStatus; compact?: boolean }) {
  const tone = gst.over ? "red" : gst.alert ? "amber" : "teal";
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-bold tabular-nums">{aud(gst.turnover, true)}</div>
          <div className="text-xs text-slate-500">GST turnover, last 12 months</div>
        </div>
        <div className="text-right">
          <div className={`font-display text-lg font-bold ${gst.over ? "text-red-700" : gst.alert ? "text-amber-700" : "text-teal-700"}`}>{gst.pct.toFixed(0)}%</div>
          <div className="text-xs text-slate-500">of {aud(GST_THRESHOLD, true)}</div>
        </div>
      </div>
      <div className="relative">
        <ProgressBar pct={gst.pct} tone={tone} />
        <div className="absolute -top-1 h-5 w-0.5 bg-amber-300/80" style={{ left: `${(GST_ALERT_AT / GST_THRESHOLD) * 100}%` }} title="80% alert" />
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {gst.over ? (
          <span className="text-red-800">Over the threshold — you must register for GST within 21 days.</span>
        ) : gst.alert ? (
          <span className="text-amber-900">Past 80%. Talk to your accountant about registering for GST now.</span>
        ) : gst.projectedDate ? (
          <>At the current pace you&apos;ll reach {aud(GST_THRESHOLD, true)} around <strong className="text-ocean">{longDate(gst.projectedDate)}</strong>.</>
        ) : (
          <>Not enough invoices yet to project a date.</>
        )}
        {compact && (
          <>
            {" "}
            <Link href="/admin/gst" className="text-teal-700 hover:underline">
              Details →
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
