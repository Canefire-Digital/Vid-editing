import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, Empty, JobStatusBadge, PageHeader, TableWrap } from "@/components/admin/ui";
import { getTeam } from "@/lib/auth";
import { JOB_STATUSES, LOAD_SIZES } from "@/lib/constants";
import { aud, shortDate, sum, todayISO } from "@/lib/format";
import type { JobStatus, JobSummary } from "@/lib/types";

export const metadata = { title: "Jobs" };

const FILTERS: { key: string; label: string }[] = [
  { key: "open", label: "Upcoming & open" },
  { key: "all", label: "All" },
  ...(Object.keys(JOB_STATUSES) as JobStatus[]).map((s) => ({ key: s, label: JOB_STATUSES[s] })),
];

export default async function JobsPage({ searchParams }: PageProps<"/admin/jobs">) {
  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "open";
  const { supabase } = await getTeam();

  let q = supabase.from("job_summary").select("*").limit(300);
  if (filter === "open") q = q.in("status", ["quoted", "booked", "done"]).order("job_date", { ascending: true });
  else if (filter in JOB_STATUSES) q = q.eq("status", filter).order("job_date", { ascending: false });
  else q = q.order("job_date", { ascending: false });
  const { data } = await q;
  const jobs = (data ?? []) as JobSummary[];
  const today = todayISO();

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle={`${jobs.length} job${jobs.length === 1 ? "" : "s"} · ${aud(sum(jobs, (j) => j.price))} · profit ${aud(sum(jobs, (j) => j.profit))}`}
        actions={
          <Link href="/admin/jobs/new" className="btn btn-primary">
            <Plus size={18} /> New job
          </Link>
        }
      />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/jobs?status=${f.key}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              filter === f.key ? "bg-teal-400 text-navy-950" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <Empty action={<Link href="/admin/jobs/new" className="btn btn-primary btn-sm">Book a job</Link>}>No jobs here.</Empty>
        </Card>
      ) : (
        <>
          {/* Phone: cards */}
          <div className="space-y-2.5 md:hidden">
            {jobs.map((j) => (
              <Link key={j.id} href={`/admin/jobs/${j.id}`} className="card block active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold ${j.job_date === today ? "text-teal-300" : "text-white/50"}`}>
                      {j.job_date === today ? "Today" : shortDate(j.job_date)} · #{j.job_number}
                    </div>
                    <div className="truncate font-semibold">{j.client_name}</div>
                    <div className="truncate text-sm text-white/55">{j.address ?? LOAD_SIZES[j.load_size]}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold tabular-nums">{aud(j.price, true)}</div>
                    <div className="mt-1">
                      <JobStatusBadge status={j.status} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden md:block">
            <TableWrap>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>#</th>
                    <th>Client</th>
                    <th>Load</th>
                    <th>Status</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Expenses</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td className={`whitespace-nowrap ${j.job_date === today ? "font-semibold text-teal-300" : ""}`}>
                        {j.job_date === today ? "Today" : shortDate(j.job_date)}
                      </td>
                      <td className="text-white/50">{j.job_number}</td>
                      <td>
                        <Link href={`/admin/jobs/${j.id}`} className="font-medium hover:text-teal-300">
                          {j.client_name}
                        </Link>
                        {j.address && <div className="max-w-xs truncate text-xs text-white/50">{j.address}</div>}
                      </td>
                      <td className="whitespace-nowrap">{LOAD_SIZES[j.load_size]}</td>
                      <td>
                        <JobStatusBadge status={j.status} />
                      </td>
                      <td className="text-right tabular-nums">{aud(j.price)}</td>
                      <td className="text-right tabular-nums text-white/60">{aud(j.expenses_total)}</td>
                      <td className={`text-right font-semibold tabular-nums ${j.profit < 0 ? "text-red-300" : "text-teal-300"}`}>{aud(j.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </Card>
        </>
      )}
    </>
  );
}
