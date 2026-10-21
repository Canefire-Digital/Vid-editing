import type { JobSummary, LoadSize, Settings } from "./types";

const PRESET: Partial<Record<LoadSize, number>> = { full: 1, three_quarter: 0.75, half: 0.5, quarter: 0.25 };

/** How much of one trailer a job takes (1 = full trailer). */
export function trailerShare(job: Pick<JobSummary, "load_size" | "load_fraction" | "price">, settings: Pick<Settings, "price_full">): number {
  if (job.load_fraction) return Number(job.load_fraction);
  const preset = PRESET[job.load_size];
  if (preset) return preset;
  // Custom price with no space set: estimate from price vs a full load, nearest quarter.
  const est = Number(job.price) / Math.max(1, Number(settings.price_full));
  return Math.max(0.25, Math.round(est * 4) / 4);
}

export type Segment = { job: JobSummary; share: number; colour: number; continued: boolean };
export type Trip = { segments: Segment[]; used: number };

/**
 * Fills trailers in job order. When the trailer is full it's a tip run and the
 * next trailer starts; a job bigger than the space left carries over.
 */
export function packTrips(jobs: JobSummary[], settings: Pick<Settings, "price_full">): Trip[] {
  const trips: Trip[] = [];
  let current: Trip = { segments: [], used: 0 };
  jobs.forEach((job, colour) => {
    let left = trailerShare(job, settings);
    let continued = false;
    while (left > 0.0001) {
      if (current.used >= 0.9999) {
        trips.push(current);
        current = { segments: [], used: 0 };
      }
      const take = Math.min(left, 1 - current.used);
      current.segments.push({ job, share: take, colour, continued });
      current.used += take;
      left -= take;
      continued = true;
    }
  });
  if (current.segments.length) trips.push(current);
  return trips;
}

export function sortForDay(jobs: JobSummary[]): JobSummary[] {
  return [...jobs].sort(
    (a, b) => (a.start_time ?? "99").localeCompare(b.start_time ?? "99") || a.job_number - b.job_number,
  );
}

export function fractionLabel(share: number): string {
  const whole = Math.floor(share + 0.0001);
  const rest = Math.round((share - whole) * 100);
  const frac = { 0: "", 25: "¼", 50: "½", 75: "¾" }[rest as 0 | 25 | 50 | 75];
  if (frac === undefined) return `${Math.round(share * 100)}%`;
  if (!whole) return frac;
  return `${whole}${frac}`;
}

export function timeLabel(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

/** Monday of the week containing iso (YYYY-MM-DD). */
export function weekStart(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

// Distinct, readable on navy. Fill + text colour.
export const SEGMENT_COLOURS = [
  { fill: "#2dd4bf", text: "#042f2e" },
  { fill: "#38bdf8", text: "#082f49" },
  { fill: "#a78bfa", text: "#2e1065" },
  { fill: "#fbbf24", text: "#451a03" },
  { fill: "#f472b6", text: "#500724" },
  { fill: "#a3e635", text: "#1a2e05" },
  { fill: "#fb923c", text: "#431407" },
  { fill: "#e2e8f0", text: "#0f172a" },
];
