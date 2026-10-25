import Link from "next/link";
import type { ReactNode } from "react";
import { CLIENT_TYPES, INVOICE_STATUSES, JOB_STATUSES } from "@/lib/constants";
import type { ClientType, InvoiceDisplayStatus, JobStatus } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 md:mb-7">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ocean md:text-3xl">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-ink-soft">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="font-display text-base font-semibold text-ocean">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "good" | "bad" | "warn";
  href?: string;
}) {
  const toneClass =
    tone === "good" ? "text-teal-700" : tone === "bad" ? "text-red-700" : tone === "warn" ? "text-amber-700" : "text-ocean";
  const body = (
    <div className="card h-full transition hover:border-teal-700/40">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold tabular-nums md:text-2xl ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

const BADGE_TONES: Record<string, string> = {
  teal: "bg-teal-50 text-teal-800 ring-teal-600/25",
  blue: "bg-sky-50 text-sky-800 ring-sky-600/25",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
  red: "bg-red-50 text-red-700 ring-red-600/25",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/25",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tone = { quoted: "violet", booked: "blue", done: "amber", invoiced: "gray", paid: "teal" }[status];
  return <Badge tone={tone}>{JOB_STATUSES[status]}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceDisplayStatus }) {
  const tone = { draft: "gray", sent: "blue", overdue: "red", paid: "teal", void: "gray" }[status];
  return <Badge tone={tone}>{INVOICE_STATUSES[status]}</Badge>;
}

export function ClientTypeBadge({ type }: { type: ClientType }) {
  const tone = { real_estate: "violet", commercial: "blue", residential: "gray" }[type];
  return <Badge tone={tone}>{CLIENT_TYPES[type]}</Badge>;
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-slate-500">
      <p>{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, children, hint, className = "" }: { label: string; children: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function DefList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k}</dt>
          <dd className="mt-0.5 break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProgressBar({ pct, tone = "teal" }: { pct: number; tone?: "teal" | "amber" | "red" }) {
  const bar =
    tone === "red"
      ? "from-red-400 to-rose-500"
      : tone === "amber"
        ? "from-amber-300 to-orange-400"
        : "from-teal-500 to-teal-700";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all`} style={{ width: `${Math.max(1.5, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function AuditLine({ createdBy, createdAt, updatedBy, updatedAt }: { createdBy: string; createdAt: string; updatedBy: string; updatedAt: string }) {
  return (
    <p className="mt-6 text-xs text-slate-500">
      Created by {createdBy} · {createdAt}
      {updatedAt !== createdAt && (
        <>
          {" "}· Last edited by {updatedBy} · {updatedAt}
        </>
      )}
    </p>
  );
}

/** Scrollable table wrapper that never causes page-level horizontal scroll. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">{children}</div>;
}
