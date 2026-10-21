import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { ActionButton } from "@/components/admin/forms";
import { Badge, Card, Empty, PageHeader } from "@/components/admin/ui";
import { getTeam, nameOf } from "@/lib/auth";
import { dateTime, dmy } from "@/lib/format";
import type { QuoteRequest } from "@/lib/types";
import { setQuoteStatusAction } from "./actions";

export const metadata = { title: "Quote requests" };

const TONES = { new: "teal", contacted: "blue", quoted: "violet", won: "teal", lost: "gray" } as const;

export default async function QuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  const sp = await searchParams;
  const showAll = sp.all === "1";
  const { supabase, team } = await getTeam();
  let q = supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (!showAll) q = q.in("status", ["new", "contacted", "quoted"]);
  const { data } = await q;
  const quotes = (data ?? []) as QuoteRequest[];

  return (
    <>
      <PageHeader
        title="Quote requests"
        subtitle="Sent from the website form"
        actions={
          <Link href={showAll ? "/admin/quotes" : "/admin/quotes?all=1"} className="btn btn-ghost btn-sm">
            {showAll ? "Open only" : "Show won / lost too"}
          </Link>
        }
      />
      {quotes.length === 0 ? (
        <Card>
          <Empty>No open quote requests.</Empty>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{r.name}</h2>
                    <Badge tone={TONES[r.status]}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-white/50">
                    {dateTime(r.created_at)}
                    {r.updated_by && <> · updated by {nameOf(team, r.updated_by)}</>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${r.phone}`} className="btn btn-primary btn-sm">
                    <Phone size={15} /> {r.phone}
                  </a>
                  <a href={`sms:${r.phone}`} className="btn btn-ghost btn-sm">
                    <MessageSquare size={15} /> Text
                  </a>
                  {r.email && (
                    <a href={`mailto:${r.email}?subject=${encodeURIComponent("Your junk removal quote")}`} className="btn btn-ghost btn-sm">
                      <Mail size={15} /> Email
                    </a>
                  )}
                </div>
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-white/45">Suburb</dt>
                  <dd>{r.suburb ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/45">Load size guess</dt>
                  <dd>{r.load_size_guess ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/45">Preferred date</dt>
                  <dd>{dmy(r.preferred_date)}</dd>
                </div>
              </dl>
              {r.message && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-navy-950/50 p-3 text-sm text-white/80">{r.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                {r.client_id ? (
                  <Link href={`/admin/jobs/new?client=${r.client_id}`} className="btn btn-ghost btn-sm">
                    Book job
                  </Link>
                ) : (
                  <Link href={`/admin/clients/new?quote=${r.id}`} className="btn btn-ghost btn-sm">
                    Make client & book job
                  </Link>
                )}
                {(["contacted", "quoted", "won", "lost"] as const)
                  .filter((s) => s !== r.status)
                  .map((s) => (
                    <ActionButton key={s} action={setQuoteStatusAction} fields={{ id: r.id, status: s }} className="btn btn-ghost btn-sm capitalize">
                      Mark {s}
                    </ActionButton>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
