import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { EmptyTrailer, TrailerGraphic } from "@/components/admin/trailer";
import { Card, JobStatusBadge, PageHeader, Stat } from "@/components/admin/ui";
import { getSettings, getTeam, nameOf } from "@/lib/auth";
import { LOAD_SIZES } from "@/lib/constants";
import { isISODate } from "@/lib/form";
import { addDays, aud, longDate, sum, todayISO } from "@/lib/format";
import { fractionLabel, packTrips, SEGMENT_COLOURS, sortForDay, timeLabel, trailerShare, weekStart } from "@/lib/plan";
import type { JobSummary, Profile, Settings } from "@/lib/types";

export const metadata = { title: "Planner" };

type DayPlan = {
  date: string;
  jobs: JobSummary[];
  trips: ReturnType<typeof packTrips>;
  load: number;
  value: number;
  crew: string[];
};

function planDay(date: string, all: JobSummary[], workers: Map<string, string[]>, settings: Settings, team: Profile[]): DayPlan {
  const jobs = sortForDay(all.filter((j) => j.job_date === date));
  const crew = [...new Set(jobs.flatMap((j) => workers.get(j.id) ?? []))].map((id) => nameOf(team, id));
  return {
    date,
    jobs,
    trips: packTrips(jobs, settings),
    load: jobs.reduce((a, j) => a + trailerShare(j, settings), 0),
    value: sum(jobs, (j) => j.price),
    crew,
  };
}

export default async function PlanPage({ searchParams }: PageProps<"/admin/plan">) {
  const sp = await searchParams;
  const view = sp.view === "day" ? "day" : "week";
  const today = todayISO();
  const anchor = typeof sp.date === "string" && isISODate(sp.date) ? sp.date : today;
  const from = view === "week" ? weekStart(anchor) : anchor;
  const to = view === "week" ? addDays(from, 6) : anchor;

  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const { data } = await supabase
    .from("job_summary")
    .select("*")
    .gte("job_date", from)
    .lte("job_date", to)
    .order("job_date")
    .order("start_time", { nullsFirst: false })
    .order("job_number");
  const jobs = (data ?? []) as JobSummary[];
  const { data: w } = jobs.length
    ? await supabase.from("job_workers").select("job_id, profile_id").in("job_id", jobs.map((j) => j.id))
    : { data: [] as { job_id: string; profile_id: string }[] };
  const workers = new Map<string, string[]>();
  for (const r of w ?? []) workers.set(r.job_id, [...(workers.get(r.job_id) ?? []), r.profile_id]);

  const days = Array.from({ length: view === "week" ? 7 : 1 }, (_, i) => planDay(addDays(from, i), jobs, workers, settings, team));
  const totalTrips = days.reduce((a, d) => a + d.trips.length, 0);
  const totalLoad = days.reduce((a, d) => a + d.load, 0);
  const step = view === "week" ? 7 : 1;
  const href = (date: string, v = view) => `/admin/plan?view=${v}&date=${date}`;
  const rangeLabel =
    view === "week"
      ? `${new Date(`${from}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })} – ${longDate(to)}`
      : longDate(from);

  return (
    <>
      <PageHeader
        title="Planner"
        subtitle={rangeLabel}
        actions={
          <Link href={`/admin/jobs/new?date=${view === "day" ? from : today}`} className="btn btn-primary">
            <Plus size={18} /> Book job
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-white/5 p-1">
          {(["day", "week"] as const).map((v) => (
            <Link key={v} href={href(anchor, v)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize ${view === v ? "bg-teal-400 text-navy-950" : "text-white/70"}`}>
              {v}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link href={href(addDays(from, -step))} className="btn btn-ghost btn-sm px-2.5" aria-label="Previous">
            <ChevronLeft size={18} />
          </Link>
          <Link href={href(today)} className="btn btn-ghost btn-sm">
            Today
          </Link>
          <Link href={href(addDays(from, step))} className="btn btn-ghost btn-sm px-2.5" aria-label="Next">
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Jobs" value={jobs.length} />
        <Stat label="Booked value" value={aud(sum(jobs, (j) => j.price), true)} tone="good" />
        <Stat label="Total load" value={totalLoad ? `${fractionLabel(Math.round(totalLoad * 4) / 4)} trailers` : "—"} />
        <Stat label="Tip runs" value={totalTrips} hint="full trailers + part loads" />
      </div>

      {view === "day" ? (
        <DayDetail day={days[0]} workers={workers} team={team} settings={settings} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          {days.map((d) => (
            <DayCard key={d.date} day={d} today={today} href={href(d.date, "day")} />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-white/40">
        Trailers fill in job order (by start time). When one is full, that&apos;s a tip run and the next job starts a new trailer. Faded blocks are jobs already invoiced or paid.
        Custom-price jobs use the &quot;trailer space&quot; set on the job (or an estimate from the price).
      </p>
    </>
  );
}

function DayCard({ day, today, href }: { day: DayPlan; today: string; href: string }) {
  const d = new Date(`${day.date}T00:00:00Z`);
  const isToday = day.date === today;
  return (
    <Link href={href} className={`card block transition hover:border-teal-400/40 ${isToday ? "border-teal-400/50 bg-teal-400/[0.06]" : ""} ${day.date < today ? "opacity-70" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className={`font-display text-lg font-bold ${isToday ? "text-teal-300" : ""}`}>{d.toLocaleDateString("en-AU", { weekday: "long", timeZone: "UTC" })}</span>
          <span className="ml-2 text-sm text-white/50">{d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })}</span>
        </div>
        {day.jobs.length > 0 && <span className="font-semibold tabular-nums text-teal-300">{aud(day.value, true)}</span>}
      </div>
      <div className="mt-2 space-y-1">
        {day.trips.length ? day.trips.map((t, i) => <TrailerGraphic key={i} trip={t} index={i} total={day.trips.length} compact />) : <EmptyTrailer compact />}
      </div>
      {day.jobs.length ? (
        <ul className="mt-2 space-y-1">
          {day.jobs.map((j, i) => (
            <li key={j.id} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: SEGMENT_COLOURS[i % SEGMENT_COLOURS.length].fill }} />
              <span className="min-w-0 flex-1 truncate">
                {timeLabel(j.start_time) && <span className="text-white/50">{timeLabel(j.start_time)} · </span>}
                {j.client_name}
              </span>
              <span className="shrink-0 text-xs text-white/50">{LOAD_SIZES[j.load_size].replace(" load", "")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-white/40">Nothing booked — trailer&apos;s free.</p>
      )}
      {day.crew.length > 0 && <p className="mt-2 text-xs text-white/45">Crew: {day.crew.join(", ")}</p>}
    </Link>
  );
}

function DayDetail({ day, workers, team, settings }: { day: DayPlan; workers: Map<string, string[]>; team: Profile[]; settings: Settings }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] [&>*]:min-w-0">
      <Card title={day.trips.length > 1 ? `${day.trips.length} tip runs` : "Trailer"}>
        <div className="space-y-4">
          {day.trips.length ? day.trips.map((t, i) => <TrailerGraphic key={i} trip={t} index={i} total={day.trips.length} />) : <EmptyTrailer />}
        </div>
        {day.crew.length > 0 && <p className="mt-3 text-sm text-white/60">Crew: {day.crew.join(", ")}</p>}
      </Card>

      <Card
        title="Run sheet"
        action={
          <Link href={`/admin/jobs/new?date=${day.date}`} className="btn btn-ghost btn-sm">
            <Plus size={16} /> Add
          </Link>
        }
      >
        {day.jobs.length === 0 ? (
          <p className="text-sm text-white/50">No jobs booked for this day.</p>
        ) : (
          <ol className="space-y-2">
            {day.jobs.map((j, i) => {
              const c = SEGMENT_COLOURS[i % SEGMENT_COLOURS.length];
              const crew = (workers.get(j.id) ?? []).map((id) => nameOf(team, id)).join(", ");
              return (
                <li key={j.id}>
                  <Link href={`/admin/jobs/${j.id}`} className="flex gap-3 rounded-xl border border-white/5 bg-navy-950/40 p-3 transition hover:border-teal-400/30">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ background: c.fill, color: c.text }}>
                      {fractionLabel(trailerShare(j, settings))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="truncate">{j.client_name}</strong>
                        <span className="shrink-0 font-semibold tabular-nums">{aud(j.price, true)}</span>
                      </span>
                      <span className="block truncate text-sm text-white/55">
                        {timeLabel(j.start_time) ?? "Any time"} · {LOAD_SIZES[j.load_size]}
                        {j.address && ` · ${j.address}`}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-white/45">
                        <JobStatusBadge status={j.status} />
                        {crew && <>Crew: {crew}</>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
