"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActionForm } from "./forms";
import { JOB_STATUSES, LOAD_SIZES } from "@/lib/constants";
import { aud } from "@/lib/format";
import type { ActionResult, Client, Job, JobStatus, LoadSize, Profile } from "@/lib/types";

const TRAILER_SPACE = [
  ["0.25", "¼ trailer"],
  ["0.5", "½ trailer"],
  ["0.75", "¾ trailer"],
  ["1", "Full trailer"],
  ["1.25", "1¼ trailers"],
  ["1.5", "1½ trailers"],
  ["2", "2 trailers"],
  ["2.5", "2½ trailers"],
  ["3", "3 trailers"],
];

type Props = {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  clients: Pick<Client, "id" | "name" | "address">[];
  team: Profile[];
  prices: Record<Exclude<LoadSize, "custom">, number>;
  job?: Job;
  workers?: string[];
  defaultClientId?: string;
  defaultDate: string;
  meId: string;
};

export function JobForm({ action, clients, team, prices, job, workers, defaultClientId, defaultDate, meId }: Props) {
  const [clientId, setClientId] = useState(job?.client_id ?? defaultClientId ?? "");
  const [address, setAddress] = useState(job?.address ?? clients.find((c) => c.id === defaultClientId)?.address ?? "");
  const [size, setSize] = useState<LoadSize>(job?.load_size ?? "full");
  const [price, setPrice] = useState<string>(String(job?.price ?? prices.full));
  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  function pickSize(s: LoadSize) {
    setSize(s);
    if (s !== "custom") setPrice(String(prices[s]));
  }

  return (
    <ActionForm action={action} submitLabel={job ? "Save job" : "Create job"}>
      {job && <input type="hidden" name="id" value={job.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label">Client *</span>
          <div className="flex gap-2">
            <select
              className="input"
              name="client_id"
              required
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const a = clientMap.get(e.target.value)?.address;
                if (a && !address) setAddress(a);
              }}
            >
              <option value="">Choose a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!job && (
              <Link href="/admin/clients/new?return=job" className="btn btn-ghost shrink-0">
                + New
              </Link>
            )}
          </div>
        </label>

        <label className="block">
          <span className="label">Date</span>
          <input className="input" type="date" name="job_date" defaultValue={job?.job_date ?? defaultDate} required />
        </label>
        <label className="block">
          <span className="label">Start time (optional)</span>
          <input className="input" type="time" name="start_time" defaultValue={job?.start_time?.slice(0, 5) ?? ""} step={900} />
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input" name="status" defaultValue={job?.status ?? "booked"}>
            {(Object.keys(JOB_STATUSES) as JobStatus[]).map((s) => (
              <option key={s} value={s}>
                {JOB_STATUSES[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="label">Job address</span>
          <input className="input" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, suburb" />
        </label>

        <div className="md:col-span-2">
          <span className="label">Load size</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(Object.keys(LOAD_SIZES) as LoadSize[]).map((s) => (
              <label
                key={s}
                className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center transition ${
                  size === s ? "border-teal-700 bg-teal-700/10" : "border-line bg-slate-100 hover:border-slate-300"
                }`}
              >
                <input type="radio" name="load_size" value={s} checked={size === s} onChange={() => pickSize(s)} className="sr-only" />
                <span className="block text-sm font-semibold">{LOAD_SIZES[s]}</span>
                <span className="block text-xs text-slate-500">{s === "custom" ? "Set below" : aud(prices[s], true)}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="label">Price {size !== "custom" && <span className="font-normal text-slate-500">(change to override)</span>}</span>
          <input
            className="input"
            name="price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>

        {size === "custom" && (
          <label className="block">
            <span className="label">Trailer space (for the planner)</span>
            <select className="input" name="load_fraction" defaultValue={job?.load_fraction ? String(Number(job.load_fraction)) : ""}>
              <option value="">Estimate from price</option>
              {TRAILER_SPACE.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className={size === "custom" ? "md:col-span-2" : ""}>
          <span className="label">Who worked it</span>
          <div className="flex flex-wrap gap-2">
            {team.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-slate-100 px-3 py-2.5 text-sm has-checked:border-teal-700 has-checked:bg-teal-700/10">
                <input
                  type="checkbox"
                  name="workers"
                  value={p.id}
                  defaultChecked={workers ? workers.includes(p.id) : p.id === meId}
                  className="accent-teal-700"
                />
                {p.display_name}
              </label>
            ))}
          </div>
        </div>

        <label className="block md:col-span-2">
          <span className="label">What&apos;s going (shows on the invoice)</span>
          <textarea className="input" name="description" defaultValue={job?.description ?? ""} placeholder="e.g. Old lounge, 2 mattresses, green waste from backyard" />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Internal notes</span>
          <textarea className="input" name="notes" defaultValue={job?.notes ?? ""} placeholder="Access, gate codes, contact on the day…" />
        </label>
      </div>
    </ActionForm>
  );
}
