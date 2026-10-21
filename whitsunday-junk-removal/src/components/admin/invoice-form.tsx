"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ActionForm } from "./forms";
import { addDays, aud, dmy, round2 } from "@/lib/format";
import type { ActionResult, Client, Invoice, InvoiceItem, Job } from "@/lib/types";

type Line = { key: string; description: string; quantity: string; unit_price: string };

type Props = {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  clients: Pick<Client, "id" | "name" | "payment_terms_days" | "email">[];
  jobs: Pick<Job, "id" | "job_number" | "client_id" | "job_date" | "price" | "description" | "address">[];
  invoice?: Invoice;
  items?: InvoiceItem[];
  defaults: { clientId?: string; jobId?: string; issueDate: string; lines?: Omit<Line, "key">[] };
  gstRegistered: boolean;
  gstRate: number;
};

let n = 0;
const newKey = () => `l${++n}`;

export function InvoiceForm({ action, clients, jobs, invoice, items, defaults, gstRegistered, gstRate }: Props) {
  const [clientId, setClientId] = useState(invoice?.client_id ?? defaults.clientId ?? "");
  const [jobId, setJobId] = useState(invoice?.job_id ?? defaults.jobId ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? defaults.issueDate);
  const [terms, setTerms] = useState<number>(
    invoice?.payment_terms_days ?? clients.find((c) => c.id === (defaults.clientId ?? ""))?.payment_terms_days ?? 0,
  );
  const [gst, setGst] = useState(invoice ? invoice.gst_enabled : gstRegistered);
  const [lines, setLines] = useState<Line[]>(() => {
    if (items?.length) {
      return items.map((i) => ({ key: newKey(), description: i.description, quantity: String(i.quantity), unit_price: String(i.unit_price) }));
    }
    if (defaults.lines?.length) return defaults.lines.map((l) => ({ ...l, key: newKey() }));
    return [{ key: newKey(), description: "", quantity: "1", unit_price: "" }];
  });

  const clientJobs = useMemo(() => jobs.filter((j) => j.client_id === clientId), [jobs, clientId]);
  const subtotal = round2(lines.reduce((acc, l) => acc + round2((Number(l.quantity) || 0) * (Number(l.unit_price) || 0)), 0));
  const rate = invoice?.gst_rate && invoice.gst_enabled ? Number(invoice.gst_rate) : gstRate;
  const gstAmount = gst ? round2((subtotal * rate) / 100) : 0;

  const update = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  return (
    <ActionForm action={action} submitLabel={invoice ? "Save invoice" : "Create invoice"}>
      {invoice && <input type="hidden" name="id" value={invoice.id} />}
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(lines.map(({ description, quantity, unit_price }) => ({ description, quantity: Number(quantity) || 0, unit_price: Number(unit_price) || 0 })))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Client *</span>
          <select
            className="input"
            name="client_id"
            required
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setJobId("");
              const c = clients.find((x) => x.id === e.target.value);
              if (c) setTerms(c.payment_terms_days);
            }}
          >
            <option value="">Choose a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Job (optional)</span>
          <select
            className="input"
            name="job_id"
            value={jobId}
            onChange={(e) => {
              setJobId(e.target.value);
              const j = jobs.find((x) => x.id === e.target.value);
              if (j && lines.length === 1 && !lines[0].description && !lines[0].unit_price) {
                setLines([
                  {
                    key: newKey(),
                    description: ["Junk removal", j.address ? `at ${j.address}` : null, j.description ? `\n${j.description}` : null].filter(Boolean).join(" "),
                    quantity: "1",
                    unit_price: String(j.price),
                  },
                ]);
              }
            }}
          >
            <option value="">— None —</option>
            {clientJobs.map((j) => (
              <option key={j.id} value={j.id}>
                #{j.job_number} · {dmy(j.job_date)} · {aud(j.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Issue date</span>
          <input className="input" type="date" name="issue_date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
        </label>
        <label className="block">
          <span className="label">Payment terms (days)</span>
          <input className="input" type="number" min={0} name="payment_terms_days" value={terms} onChange={(e) => setTerms(Number(e.target.value) || 0)} />
          <span className="mt-1 block text-xs text-white/50">
            Due {terms === 0 ? "on receipt" : ""} {dmy(addDays(issueDate, terms))}
          </span>
        </label>
      </div>

      <div className="mt-6">
        <span className="label">Line items</span>
        <div className="space-y-3">
          {lines.map((l, idx) => (
            <div key={l.key} className="rounded-xl border border-white/10 bg-navy-950/40 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_80px_120px_auto]">
                <textarea
                  className="input min-h-[44px]"
                  rows={1}
                  placeholder={`Item ${idx + 1} description`}
                  value={l.description}
                  onChange={(e) => update(l.key, { description: e.target.value })}
                  required
                />
                <div className="grid grid-cols-[80px_1fr_auto] gap-2 sm:contents">
                  <input className="input" inputMode="decimal" aria-label="Quantity" placeholder="Qty" value={l.quantity} onChange={(e) => update(l.key, { quantity: e.target.value })} />
                  <input className="input" inputMode="decimal" aria-label="Unit price" placeholder="Price" value={l.unit_price} onChange={(e) => update(l.key, { unit_price: e.target.value })} required />
                  <button
                    type="button"
                    className="btn btn-ghost px-3"
                    aria-label="Remove line"
                    disabled={lines.length === 1}
                    onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-1 text-right text-xs text-white/50">
                {aud(round2((Number(l.quantity) || 0) * (Number(l.unit_price) || 0)))}
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => setLines((ls) => [...ls, { key: newKey(), description: "", quantity: "1", unit_price: "" }])}>
          <Plus size={16} /> Add line
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Notes on invoice</span>
          <textarea className="input" name="notes" defaultValue={invoice?.notes ?? ""} placeholder="Optional — e.g. property manager reference" />
        </label>
        <div className="rounded-xl border border-white/10 bg-navy-950/40 p-4 text-sm">
          <label className="mb-3 flex items-center gap-2">
            <input type="checkbox" name="gst_enabled" checked={gst} onChange={(e) => setGst(e.target.checked)} className="h-4 w-4 accent-teal-400" />
            Charge GST ({rate}%)
            {!gstRegistered && gst && <span className="text-xs text-amber-300">Not registered for GST yet!</span>}
          </label>
          <div className="flex justify-between py-1">
            <span className="text-white/60">Subtotal</span>
            <span className="tabular-nums">{aud(subtotal)}</span>
          </div>
          {gst && (
            <div className="flex justify-between py-1">
              <span className="text-white/60">GST</span>
              <span className="tabular-nums">{aud(gstAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-white/10 pt-2 font-display text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums text-teal-300">{aud(subtotal + gstAmount)}</span>
          </div>
        </div>
      </div>
    </ActionForm>
  );
}
