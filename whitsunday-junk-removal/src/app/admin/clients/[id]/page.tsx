import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Pencil, Phone, Plus } from "lucide-react";
import {
  AuditLine,
  Card,
  ClientTypeBadge,
  DefList,
  Empty,
  InvoiceStatusBadge,
  JobStatusBadge,
  PageHeader,
  Stat,
  TableWrap,
} from "@/components/admin/ui";
import { getTeam, nameOf } from "@/lib/auth";
import { LOAD_SIZES } from "@/lib/constants";
import { aud, dateTime, dmy, sum } from "@/lib/format";
import type { Client, InvoiceSummary, JobSummary } from "@/lib/types";

export default async function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  const { id } = await params;
  const { supabase, team } = await getTeam();
  const [{ data: c }, { data: jobsData }, { data: invData }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("job_summary").select("*").eq("client_id", id).order("job_date", { ascending: false }),
    supabase.from("invoice_summary").select("*").eq("client_id", id).order("number_seq", { ascending: false }),
  ]);
  if (!c) notFound();
  const client = c as Client;
  const jobs = (jobsData ?? []) as JobSummary[];
  const invoices = (invData ?? []) as InvoiceSummary[];
  const live = invoices.filter((i) => i.status !== "void");
  const spent = sum(live, (i) => i.amount_paid);
  const owing = sum(live.filter((i) => i.status === "sent"), (i) => i.balance);
  const overdue = live.filter((i) => i.display_status === "overdue").length;

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <ClientTypeBadge type={client.type} />
            {client.payment_terms_days === 0 ? "Due on receipt" : `${client.payment_terms_days}-day terms`}
            {client.archived && <span className="text-amber-700">· Archived</span>}
          </span>
        }
        back={{ href: "/admin/clients", label: "Clients" }}
        actions={
          <>
            {client.phone && (
              <a href={`tel:${client.phone}`} className="btn btn-ghost btn-sm">
                <Phone size={16} /> Call
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="btn btn-ghost btn-sm">
                <Mail size={16} /> Email
              </a>
            )}
            <Link href={`/admin/clients/${id}/edit`} className="btn btn-ghost btn-sm">
              <Pencil size={16} /> Edit
            </Link>
            <Link href={`/admin/jobs/new?client=${id}`} className="btn btn-primary btn-sm">
              <Plus size={16} /> New job
            </Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total spent" value={aud(spent)} tone="good" />
        <Stat label="Amount owing" value={aud(owing)} tone={owing > 0 ? "warn" : "default"} />
        <Stat label="Overdue invoices" value={overdue} tone={overdue > 0 ? "bad" : "default"} />
        <Stat label="Jobs" value={jobs.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Details" className="lg:col-span-1">
          <DefList
            items={[
              ["Contact", client.contact_person],
              ["Phone", client.phone],
              ["Email", client.email],
              ["Address", client.address],
              ["Notes", client.notes && <span className="whitespace-pre-wrap">{client.notes}</span>],
            ]}
          />
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card title="Jobs">
            {jobs.length === 0 ? (
              <Empty>No jobs yet.</Empty>
            ) : (
              <TableWrap>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Job</th>
                      <th>Status</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j.id}>
                        <td className="whitespace-nowrap">{dmy(j.job_date)}</td>
                        <td>
                          <Link href={`/admin/jobs/${j.id}`} className="font-medium hover:text-teal-800">
                            #{j.job_number} · {LOAD_SIZES[j.load_size]}
                          </Link>
                          {j.address && <div className="text-xs text-slate-500">{j.address}</div>}
                        </td>
                        <td>
                          <JobStatusBadge status={j.status} />
                        </td>
                        <td className="text-right tabular-nums">{aud(j.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>

          <Card title="Invoices">
            {invoices.length === 0 ? (
              <Empty>No invoices yet.</Empty>
            ) : (
              <TableWrap>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Due</th>
                      <th>Status</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <Link href={`/admin/invoices/${i.id}`} className="font-medium hover:text-teal-800">
                            {i.invoice_number}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap">{dmy(i.due_date)}</td>
                        <td>
                          <InvoiceStatusBadge status={i.display_status} />
                        </td>
                        <td className="text-right tabular-nums">{aud(i.total)}</td>
                        <td className="text-right tabular-nums">{i.status === "void" ? "—" : aud(i.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
        </div>
      </div>

      <AuditLine
        createdBy={nameOf(team, client.created_by)}
        createdAt={dateTime(client.created_at)}
        updatedBy={nameOf(team, client.updated_by)}
        updatedAt={dateTime(client.updated_at)}
      />
    </>
  );
}
