import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Pencil, Phone, Plus, Star, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/admin/forms";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import {
  AuditLine,
  Card,
  DefList,
  Empty,
  InvoiceStatusBadge,
  JobStatusBadge,
  PageHeader,
  Stat,
} from "@/components/admin/ui";
import { getSettings, getTeam, nameOf } from "@/lib/auth";
import { EXPENSE_CATEGORIES, JOB_STATUSES, LOAD_SIZES } from "@/lib/constants";
import { aud, dateTime, dmy, longDate } from "@/lib/format";
import { fractionLabel, timeLabel, trailerShare } from "@/lib/plan";
import type { Expense, InvoiceSummary, JobStatus, JobSummary } from "@/lib/types";
import { addJobPhotoAction, deleteJobPhotoAction, invoiceJobAction, setJobStatusAction, toggleJobPhotoPublicAction } from "../actions";

export default async function JobPage({ params }: PageProps<"/admin/jobs/[id]">) {
  const { id } = await params;
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const [{ data: j }, { data: workers }, { data: photos }, { data: exp }, { data: inv }] = await Promise.all([
    supabase.from("job_summary").select("*").eq("id", id).maybeSingle(),
    supabase.from("job_workers").select("profile_id").eq("job_id", id),
    supabase.from("job_photos").select("*").eq("job_id", id).order("created_at"),
    supabase.from("expenses").select("*").eq("job_id", id).order("expense_date"),
    supabase.from("invoice_summary").select("*").eq("job_id", id).order("number_seq"),
  ]);
  if (!j) notFound();
  const job = j as JobSummary;
  const { data: client } = await supabase.from("clients").select("phone, contact_person, name").eq("id", job.client_id).single();
  const firstName = (client?.contact_person ?? client?.name ?? "").split(" ")[0];
  const reviewSms =
    client?.phone && settings.google_review_url
      ? `sms:${client.phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(
          `Hi ${firstName}, thanks for choosing ${settings.business_name}! If you were happy with the job, a quick Google review would really help our small local business: ${settings.google_review_url}`,
        )}`
      : null;
  const expenses = (exp ?? []) as Expense[];
  const invoices = (inv ?? []) as InvoiceSummary[];
  const liveInvoice = invoices.find((i) => i.status !== "void");

  const paths = (photos ?? []).map((p) => p.storage_path as string);
  const signed = paths.length ? (await supabase.storage.from("job-photos").createSignedUrls(paths, 3600)).data ?? [] : [];
  const urlFor = new Map(signed.map((s) => [s.path, s.signedUrl ?? undefined]));
  const byKind = (k: "before" | "after") => (photos ?? []).filter((p) => p.kind === k);

  const nextStatus: Partial<Record<JobStatus, JobStatus>> = { quoted: "booked", booked: "done" };
  const advance = nextStatus[job.status];

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {job.client_name} <JobStatusBadge status={job.status} />
          </span>
        }
        subtitle={
          <>
            Job #{job.job_number} · {longDate(job.job_date)}
            {timeLabel(job.start_time) && ` · ${timeLabel(job.start_time)}`} · {LOAD_SIZES[job.load_size]} ({fractionLabel(trailerShare(job, settings))} trailer) ·{" "}
            <Link href={`/admin/plan?view=day&date=${job.job_date}`} className="text-teal-300 hover:underline">
              See day plan
            </Link>
          </>
        }
        back={{ href: "/admin/jobs", label: "Jobs" }}
        actions={
          <>
            {client?.phone && (
              <a href={`tel:${client.phone}`} className="btn btn-ghost btn-sm">
                <Phone size={16} /> Call
              </a>
            )}
            {job.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <MapPin size={16} /> Map
              </a>
            )}
            <Link href={`/admin/jobs/${id}/edit`} className="btn btn-ghost btn-sm">
              <Pencil size={16} /> Edit
            </Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Price" value={aud(job.price)} />
        <Stat label="Expenses" value={aud(job.expenses_total)} />
        <Stat label="Profit" value={aud(job.profit)} tone={job.profit < 0 ? "bad" : "good"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Invoice">
            {liveInvoice ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/admin/invoices/${liveInvoice.id}`} className="font-display text-lg font-bold hover:text-teal-300">
                    {liveInvoice.invoice_number}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
                    <InvoiceStatusBadge status={liveInvoice.display_status} /> {aud(liveInvoice.total)} · due {dmy(liveInvoice.due_date)}
                  </div>
                </div>
                <Link href={`/admin/invoices/${liveInvoice.id}`} className="btn btn-ghost btn-sm">
                  Open invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/60">No invoice yet. Paid on the spot? One tap records the invoice and payment together.</p>
                <div className="flex flex-wrap gap-2">
                  <ActionButton action={invoiceJobAction} fields={{ id, mode: "draft" }} className="btn btn-primary btn-sm">
                    Create invoice
                  </ActionButton>
                  <ActionButton
                    action={invoiceJobAction}
                    fields={{ id, mode: "cash" }}
                    confirm={`Record ${aud(job.price)} paid in cash today?`}
                    className="btn btn-ghost btn-sm"
                  >
                    Paid cash now
                  </ActionButton>
                  <ActionButton
                    action={invoiceJobAction}
                    fields={{ id, mode: "bank_transfer" }}
                    confirm={`Record ${aud(job.price)} paid by bank transfer today?`}
                    className="btn btn-ghost btn-sm"
                  >
                    Paid by transfer now
                  </ActionButton>
                </div>
              </div>
            )}
          </Card>

          <p className="-mb-2 text-xs text-white/45">
            Tap &quot;Show on website&quot; on a before <em>and</em> an after photo to add this job to the website gallery. Check the client is OK with it first.
          </p>
          {(["before", "after"] as const).map((kind) => (
            <Card key={kind} title={kind === "before" ? "Before photos" : "After photos"} action={<PhotoUploader jobId={id} kind={kind} onUploaded={addJobPhotoAction} />}>
              {byKind(kind).length === 0 ? (
                <p className="text-sm text-white/45">No {kind} photos yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {byKind(kind).map((p) => (
                    <div key={p.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
                      {urlFor.get(p.storage_path) && (
                        <a href={urlFor.get(p.storage_path)} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={urlFor.get(p.storage_path)} alt={`${kind} photo`} className="h-full w-full object-cover" loading="lazy" />
                        </a>
                      )}
                      <div className="absolute left-1.5 top-1.5">
                        <ActionButton
                          action={toggleJobPhotoPublicAction}
                          fields={{ id: p.id, show: p.show_on_website ? "0" : "1" }}
                          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${p.show_on_website ? "bg-teal-400 text-navy-950" : "bg-black/60 text-white/80 hover:text-teal-200"}`}
                        >
                          <Globe size={12} /> {p.show_on_website ? "On website" : "Show on website"}
                        </ActionButton>
                      </div>
                      <div className="absolute right-1.5 top-1.5">
                        <ActionButton
                          action={deleteJobPhotoAction}
                          fields={{ id: p.id }}
                          confirm="Delete this photo?"
                          className="rounded-lg bg-black/60 p-1.5 text-white/80 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          <Card
            title="Job expenses"
            action={
              <Link href={`/admin/expenses/new?job=${id}`} className="btn btn-ghost btn-sm">
                <Plus size={16} /> Add
              </Link>
            }
          >
            {expenses.length === 0 ? (
              <Empty>Add fuel and dump fees here to see true profit for this job.</Empty>
            ) : (
              <ul className="divide-y divide-white/5">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <Link href={`/admin/expenses/${e.id}`} className="hover:text-teal-300">
                      <span className="font-medium">{EXPENSE_CATEGORIES[e.category]}</span>
                      {e.description && <span className="text-white/50"> · {e.description}</span>}
                    </Link>
                    <span className="tabular-nums">{aud(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {(job.status === "done" || job.status === "invoiced" || job.status === "paid") && (
            <Card>
              {reviewSms ? (
                <a href={reviewSms} className="btn btn-ghost w-full">
                  <Star size={16} className="text-amber-300" /> Ask for a Google review
                </a>
              ) : (
                <p className="text-xs text-white/50">
                  {client?.phone ? (
                    <>
                      Add your Google review link in <Link href="/admin/settings" className="text-teal-300 underline">Settings</Link> to text clients a review request in one tap.
                    </>
                  ) : (
                    "Add a phone number to this client to text them a review request."
                  )}
                </p>
              )}
            </Card>
          )}
          {advance && (
            <Card>
              <ActionButton action={setJobStatusAction} fields={{ id, status: advance }} className="btn btn-primary w-full">
                Mark as {JOB_STATUSES[advance].toLowerCase()}
              </ActionButton>
            </Card>
          )}
          <Card title="Details">
            <DefList
              items={[
                ["Client", <Link key="c" href={`/admin/clients/${job.client_id}`} className="text-teal-300 hover:underline">{job.client_name}</Link>],
                ["Address", job.address],
                ["Worked by", (workers ?? []).map((w) => nameOf(team, w.profile_id)).join(", ")],
                ["Description", job.description && <span className="whitespace-pre-wrap">{job.description}</span>],
                ["Notes", job.notes && <span className="whitespace-pre-wrap">{job.notes}</span>],
              ]}
            />
          </Card>
        </div>
      </div>

      <AuditLine
        createdBy={nameOf(team, job.created_by)}
        createdAt={dateTime(job.created_at)}
        updatedBy={nameOf(team, job.updated_by)}
        updatedAt={dateTime(job.updated_at)}
      />
    </>
  );
}
