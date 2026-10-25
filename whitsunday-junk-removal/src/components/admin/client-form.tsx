"use client";

import { useState } from "react";
import { ActionForm } from "./forms";
import { CLIENT_TYPES } from "@/lib/constants";
import type { ActionResult, Client, ClientType } from "@/lib/types";

type Props = {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  client?: Partial<Client>;
  defaultTerms: Record<ClientType, number>;
  hidden?: Record<string, string>;
  submitLabel?: string;
};

export function ClientForm({ action, client, defaultTerms, hidden = {}, submitLabel = "Save client" }: Props) {
  const [type, setType] = useState<ClientType>(client?.type ?? "residential");
  const [terms, setTerms] = useState<number>(client?.payment_terms_days ?? defaultTerms[client?.type ?? "residential"]);
  const [termsTouched, setTermsTouched] = useState(Boolean(client?.id));

  return (
    <ActionForm action={action} submitLabel={submitLabel}>
      {client?.id && <input type="hidden" name="id" value={client.id} />}
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label">Client / business name *</span>
          <input className="input" name="name" defaultValue={client?.name ?? ""} required autoFocus={!client?.id} />
        </label>
        <div className="md:col-span-2">
          <span className="label">Type</span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CLIENT_TYPES) as ClientType[]).map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                  type === t ? "border-teal-700 bg-teal-700/10 text-teal-800" : "border-line bg-slate-100 text-ink-soft"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => {
                    setType(t);
                    if (!termsTouched) setTerms(defaultTerms[t]);
                  }}
                  className="sr-only"
                />
                {CLIENT_TYPES[t]}
              </label>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="label">Contact person</span>
          <input className="input" name="contact_person" defaultValue={client?.contact_person ?? ""} />
        </label>
        <label className="block">
          <span className="label">Phone</span>
          <input className="input" name="phone" type="tel" defaultValue={client?.phone ?? ""} />
        </label>
        <label className="block">
          <span className="label">Email (invoices go here)</span>
          <input className="input" name="email" type="email" defaultValue={client?.email ?? ""} />
        </label>
        <label className="block">
          <span className="label">Payment terms (days)</span>
          <input
            className="input"
            name="payment_terms_days"
            type="number"
            min={0}
            inputMode="numeric"
            value={terms}
            onChange={(e) => {
              setTermsTouched(true);
              setTerms(Number(e.target.value));
            }}
          />
          <span className="mt-1 block text-xs text-slate-500">0 = due on receipt</span>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Address</span>
          <input className="input" name="address" defaultValue={client?.address ?? ""} />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Notes</span>
          <textarea className="input" name="notes" defaultValue={client?.notes ?? ""} />
        </label>
        {client?.id && (
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="archived" defaultChecked={client.archived} className="h-4 w-4 accent-teal-700" />
            Archived (hide from pick lists)
          </label>
        )}
      </div>
    </ActionForm>
  );
}
