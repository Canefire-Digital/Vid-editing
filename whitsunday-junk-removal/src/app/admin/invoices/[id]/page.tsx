import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { ActionButton, ActionForm, Disclosure } from "@/components/admin/forms";
import { AuditLine, Card, Empty, InvoiceStatusBadge, PageHeader, Stat } from "@/components/admin/ui";
import { getSettings, getTeam, nameOf } from "@/lib/auth";
import { PAYMENT_METHODS } from "@/lib/constants";
import { aud, dateTime, daysBetween, dmy, todayISO } from "@/lib/format";
import { loadInvoice } from "@/lib/invoices";
import {
  deletePaymentAction,
  markSentAction,
  recordPaymentAction,
  sendInvoiceAction,
  voidInvoiceAction,
} from "../actions";

export default async function InvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  const { id } = await params;
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const bundle = await loadInvoice(supabase, id);
  if (!bundle) notFound();
  const { invoice, items, payments, client } = bundle;
  const today = todayISO();
  const late = invoice.display_status === "overdue" ? daysBetween(invoice.due_date, today) : 0;
  const open = invoice.status === "draft" || invoice.status === "sent";
  const bankMissing = !settings.bank_bsb || !settings.bank_account_number;

  const chaseMessage =
    invoice.display_status === "overdue"
      ? `Just a friendly reminder that invoice ${invoice.invoice_number} for ${aud(invoice.balance)} was due on ${dmy(invoice.due_date)}. A copy is attached — if it's already been paid, thank you and please ignore this email.`
      : "";

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {invoice.invoice_number} <InvoiceStatusBadge status={invoice.display_status} />
          </span>
        }
        subtitle={
          <>
            <Link href={`/admin/clients/${client.id}`} className="text-teal-700 hover:underline">
              {client.name}
            </Link>{" "}
            · issued {dmy(invoice.issue_date)} · {invoice.payment_terms_days === 0 ? "due on receipt" : `due ${dmy(invoice.due_date)}`}
            {late > 0 && <span className="text-red-700"> · {late} days overdue</span>}
          </>
        }
        back={{ href: "/admin/invoices", label: "Invoices" }}
        actions={
          <>
            <a href={`/admin/invoices/${id}/pdf`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <Eye size={16} /> View PDF
            </a>
            <a href={`/admin/invoices/${id}/pdf?download=1`} className="btn btn-ghost btn-sm">
              <Download size={16} /> Download
            </a>
            {invoice.status !== "void" && (
              <Link href={`/admin/invoices/${id}/edit`} className="btn btn-ghost btn-sm">
                <Pencil size={16} /> Edit
              </Link>
            )}
          </>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Total" value={aud(invoice.total)} hint={invoice.gst_enabled ? `inc ${aud(invoice.gst_amount)} GST` : "no GST"} />
        <Stat label="Paid" value={aud(invoice.amount_paid)} tone="good" />
        <Stat label="Balance" value={aud(invoice.status === "void" ? 0 : invoice.balance)} tone={invoice.display_status === "overdue" ? "bad" : Number(invoice.balance) > 0 ? "warn" : "default"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {invoice.status !== "void" && (
            <Card title={invoice.sent_at ? "Send again" : "Send to client"}>
              {bankMissing && (
                <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Bank details aren&apos;t set yet, so the invoice won&apos;t show how to pay.{" "}
                  <Link href="/admin/settings" className="underline">
                    Add them in Settings
                  </Link>
                  .
                </p>
              )}
              {invoice.sent_at && (
                <p className="mb-3 text-sm text-slate-500">
                  Last emailed {dateTime(invoice.sent_at)}
                  {invoice.sent_to && <> to {invoice.sent_to}</>}
                </p>
              )}
              <ActionForm action={sendInvoiceAction} submitLabel={invoice.display_status === "overdue" ? "Send reminder" : "Email invoice"}>
                <input type="hidden" name="id" value={id} />
                <div className="grid gap-3">
                  <label className="block">
                    <span className="label">To</span>
                    <input className="input" name="to" type="text" defaultValue={invoice.sent_to ?? client.email ?? ""} placeholder="client@email.com" required />
                  </label>
                  <label className="block">
                    <span className="label">Message (optional — a standard message is used if blank)</span>
                    <textarea className="input" name="message" defaultValue={chaseMessage} />
                  </label>
                </div>
              </ActionForm>
              {invoice.status === "draft" && (
                <div className="mt-3 border-t border-line pt-3">
                  <ActionButton action={markSentAction} fields={{ id }} className="text-sm text-ink-soft hover:text-ocean">
                    Sent it another way? Mark as sent →
                  </ActionButton>
                </div>
              )}
            </Card>
          )}

          <Card title="Line items">
            <ul className="divide-y divide-line text-sm">
              {items.map((it) => (
                <li key={it.id} className="flex justify-between gap-4 py-2.5">
                  <span className="whitespace-pre-wrap">
                    {it.description}
                    {Number(it.quantity) !== 1 && (
                      <span className="text-slate-500">
                        {" "}
                        × {Number(it.quantity)} @ {aud(it.unit_price)}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">{aud(it.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="tabular-nums">{aud(invoice.subtotal)}</span>
              </div>
              {invoice.gst_enabled && (
                <div className="flex justify-between text-ink-soft">
                  <span>GST ({Number(invoice.gst_rate)}%)</span>
                  <span className="tabular-nums">{aud(invoice.gst_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span className="tabular-nums">{aud(invoice.total)}</span>
              </div>
            </div>
            {invoice.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-ink-soft">{invoice.notes}</p>}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Payments">
            {payments.length === 0 ? (
              <Empty>No payments yet.</Empty>
            ) : (
              <ul className="mb-3 divide-y divide-line text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <div className="font-semibold tabular-nums">{aud(p.amount)}</div>
                      <div className="text-xs text-slate-500">
                        {dmy(p.paid_on)} · {PAYMENT_METHODS[p.method]} · by {nameOf(team, p.created_by)}
                        {p.reference && <> · {p.reference}</>}
                      </div>
                    </div>
                    <ActionButton action={deletePaymentAction} fields={{ id: p.id }} confirm="Remove this payment?" className="rounded-lg p-2 text-slate-500 hover:text-red-700">
                      <Trash2 size={15} />
                    </ActionButton>
                  </li>
                ))}
              </ul>
            )}
            {open && (
              <Disclosure label="Record payment" defaultOpen={payments.length === 0 && invoice.status === "sent"} buttonClassName="btn btn-primary btn-sm w-full">
                <ActionForm action={recordPaymentAction} submitLabel="Save payment">
                  <input type="hidden" name="invoice_id" value={id} />
                  <div className="grid gap-3">
                    <label className="block">
                      <span className="label">Amount</span>
                      <input className="input" name="amount" inputMode="decimal" defaultValue={Number(invoice.balance).toFixed(2)} required />
                    </label>
                    <label className="block">
                      <span className="label">Date received</span>
                      <input className="input" name="paid_on" type="date" defaultValue={today} required />
                    </label>
                    <div>
                      <span className="label">Method</span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PAYMENT_METHODS).map(([k, v], idx) => (
                          <label key={k} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-slate-100 px-3 py-2.5 text-sm has-checked:border-teal-700 has-checked:bg-teal-700/10">
                            <input type="radio" name="method" value={k} defaultChecked={idx === 0} className="sr-only" />
                            {v}
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="block">
                      <span className="label">Reference (optional)</span>
                      <input className="input" name="reference" />
                    </label>
                  </div>
                </ActionForm>
              </Disclosure>
            )}
          </Card>

          {invoice.job_id && (
            <Card>
              <Link href={`/admin/jobs/${invoice.job_id}`} className="text-sm text-teal-700 hover:underline">
                View linked job →
              </Link>
            </Card>
          )}

          {open && payments.length === 0 && (
            <ActionButton
              action={voidInvoiceAction}
              fields={{ id }}
              confirm={`Void ${invoice.invoice_number}? It stays on record (numbers can't be reused) but won't count as income.`}
              className="btn btn-danger btn-sm"
            >
              Void invoice
            </ActionButton>
          )}
        </div>
      </div>

      <AuditLine
        createdBy={nameOf(team, invoice.created_by)}
        createdAt={dateTime(invoice.created_at)}
        updatedBy={nameOf(team, invoice.updated_by)}
        updatedAt={dateTime(invoice.updated_at)}
      />
    </>
  );
}
