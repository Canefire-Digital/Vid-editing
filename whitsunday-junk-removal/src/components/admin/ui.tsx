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
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-teal-300 hover:text-teal-200">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-white/60">{subtitle}</div>}
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
          {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
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
    tone === "good" ? "text-teal-300" : tone === "bad" ? "text-red-300" : tone === "warn" ? "text-amber-300" : "text-white";
  const body = (
    <div className="card h-full transition hover:border-teal-400/30">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold tabular-nums md:text-2xl ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-white/50">{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

const BADGE_TONES: Record<string, string> = {
  teal: "bg-teal-400/15 text-teal-300 ring-teal-400/30",
  blue: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  amber: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  red: "bg-red-400/15 text-red-300 ring-red-400/30",
  gray: "bg-white/10 text-white/70 ring-white/15",
  violet: "bg-violet-400/15 text-violet-300 ring-violet-400/30",
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
    <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-white/55">
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
      {hint && <span className="mt-1 block text-xs text-white/45">{hint}</span>}
    </label>
  );
}

export function DefList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/45">{k}</dt>
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
        : "from-teal-300 to-aqua-400";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all`} style={{ width: `${Math.max(1.5, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function AuditLine({ createdBy, createdAt, updatedBy, updatedAt }: { createdBy: string; createdAt: string; updatedBy: string; updatedAt: string }) {
  return (
    <p className="mt-6 text-xs text-white/40">
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
