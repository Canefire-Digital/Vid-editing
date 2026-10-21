import Link from "next/link";
import { Card, Empty, PageHeader } from "@/components/admin/ui";
import { getTeam, nameOf } from "@/lib/auth";
import { dateTime } from "@/lib/format";

export const metadata = { title: "Activity log" };

const LINKS: Record<string, (id: string) => string> = {
  clients: (id) => `/admin/clients/${id}`,
  jobs: (id) => `/admin/jobs/${id}`,
  invoices: (id) => `/admin/invoices/${id}`,
  expenses: (id) => `/admin/expenses/${id}`,
};

const LABEL: Record<string, string> = {
  clients: "client",
  jobs: "job",
  job_photos: "job photo",
  invoices: "invoice",
  payments: "payment",
  expenses: "expense",
  partner_payouts: "payout",
  quote_requests: "quote request",
  settings: "settings",
};

type Row = { id: number; table_name: string; record_id: string; action: string; actor: string | null; at: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null };

function describe(r: Row): string {
  const d = r.new_data ?? r.old_data ?? {};
  const bits = [d.invoice_number, d.name, d.job_number ? `#${d.job_number}` : null, d.amount ? `$${d.amount}` : null, d.price ? `$${d.price}` : null].filter(Boolean);
  if (r.action === "update" && r.old_data && r.new_data) {
    const changed = Object.keys(r.new_data).filter(
      (k) => !["updated_at", "updated_by"].includes(k) && JSON.stringify(r.new_data![k]) !== JSON.stringify(r.old_data![k]),
    );
    if (changed.length) bits.push(`changed ${changed.slice(0, 4).join(", ")}${changed.length > 4 ? "…" : ""}`);
  }
  return bits.join(" · ");
}

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page) || 0);
  const { supabase, team } = await getTeam();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("at", { ascending: false })
    .range(page * 100, page * 100 + 99);
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Activity log" subtitle="Every create, edit and delete — and who did it" />
      <Card>
        {rows.length === 0 ? (
          <Empty>No activity yet.</Empty>
        ) : (
          <ul className="divide-y divide-white/5">
            {rows.map((r) => {
              const href = r.action !== "delete" && LINKS[r.table_name]?.(r.record_id);
              const verb = r.action === "create" ? "added" : r.action === "update" ? "edited" : "deleted";
              const body = (
                <>
                  <strong className="text-white">{r.actor ? nameOf(team, r.actor) : "Website / system"}</strong> {verb} {LABEL[r.table_name] ?? r.table_name}
                  <span className="text-white/50"> {describe(r)}</span>
                </>
              );
              return (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
                  {href ? (
                    <Link href={href} className="text-white/80 hover:text-teal-300">
                      {body}
                    </Link>
                  ) : (
                    <span className="text-white/80">{body}</span>
                  )}
                  <span className="text-xs text-white/40">{dateTime(r.at)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 flex justify-between">
          {page > 0 ? (
            <Link href={`/admin/activity?page=${page - 1}`} className="btn btn-ghost btn-sm">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {rows.length === 100 && (
            <Link href={`/admin/activity?page=${page + 1}`} className="btn btn-ghost btn-sm">
              Older →
            </Link>
          )}
        </div>
      </Card>
    </>
  );
}
