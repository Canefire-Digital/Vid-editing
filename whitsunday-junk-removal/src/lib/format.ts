const TZ = "Australia/Brisbane";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const moneyRound = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function aud(n: number | string | null | undefined, round = false): string {
  const v = Number(n ?? 0);
  return (round ? moneyRound : money).format(Number.isFinite(v) ? v : 0);
}

/** Today's date (YYYY-MM-DD) in Queensland time. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}

/** 21/10/2026 */
export function dmy(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Tue 21 Oct */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** 21 Oct 2026 */
export function longDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function dateTime(ts: string | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-AU", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Financial year: 1 July – 30 June. FY is identified by its starting year. ──

export function fyStartYear(iso: string = todayISO()): number {
  const [y, m] = iso.split("-").map(Number);
  return m >= 7 ? y : y - 1;
}

export function fyRange(startYear: number): { from: string; to: string; label: string } {
  return {
    from: `${startYear}-07-01`,
    to: `${startYear + 1}-06-30`,
    label: `FY ${startYear}–${String(startYear + 1).slice(2)}`,
  };
}

export function monthRange(iso: string = todayISO()): { from: string; to: string; label: string } {
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return {
    from: `${y}-${mm}-01`,
    to: `${y}-${mm}-${String(last).padStart(2, "0")}`,
    label: new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-AU", { month: "long", timeZone: "UTC" }),
  };
}

export function inRange(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function sum<T>(rows: T[], pick: (r: T) => number | string | null | undefined): number {
  return round2(rows.reduce((acc, r) => acc + Number(pick(r) ?? 0), 0));
}
