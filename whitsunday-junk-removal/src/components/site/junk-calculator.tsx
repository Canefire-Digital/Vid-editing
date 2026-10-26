"use client";

import { useState } from "react";
import {
  Armchair,
  ArrowRight,
  Boxes,
  Hammer,
  Minus,
  Plus,
  Scale,
  RotateCcw,
  Sprout,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import { aud } from "@/lib/format";
import {
  CATEGORIES,
  ITEMS,
  PREFILL_EVENT,
  estimate,
  quoteLoadOption,
  trailerM3,
  type CategoryKey,
  type PricingConfig,
  type Prefill,
} from "@/lib/junk-pricing";
import { LiveTrailer } from "./live-trailer";

const HEAVY_KG = 1000;

const ICONS: Record<CategoryKey, LucideIcon> = {
  furniture: Armchair,
  appliances: WashingMachine,
  garden: Sprout,
  boxes: Boxes,
  reno: Hammer,
};

export function JunkCalculator({ pricing }: { pricing: PricingConfig }) {
  const [tab, setTab] = useState<CategoryKey>("furniture");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const est = estimate(counts, pricing);
  const cap = trailerM3(pricing.trailer);
  const chosen = ITEMS.filter((i) => counts[i.id]);
  const itemCount = chosen.reduce((a, i) => a + counts[i.id], 0);
  const loadsNeeded = est.tripsBySpace;
  const shownShare = est.share > 1 ? est.share - (loadsNeeded - 1) : est.share;
  const overPayload = est.tripsByWeight !== null && est.tripsByWeight > est.tripsBySpace;
  // Until the trailer's tare weight is set, flag anything over a tonne for a weight check.
  const heavy = overPayload || (est.tripsByWeight === null && est.kg > HEAVY_KG);

  // One coloured block per category in the trailer (the last trailer when it's more than one load)
  const byCat = CATEGORIES.map((c) => ({
    key: c.key,
    colour: c.colour,
    label: c.label.split(" ")[0],
    share: chosen.filter((i) => i.category === c.key).reduce((a, i) => a + i.m3 * counts[i.id], 0) / cap,
  })).filter((b) => b.share > 0);
  const blocks = est.share <= 1 ? byCat : byCat.map((b) => ({ ...b, share: (b.share * shownShare) / est.share }));

  const bump = (id: string, d: number) =>
    setCounts((c) => {
      const n = Math.max(0, Math.min(50, (c[id] ?? 0) + d));
      const next = { ...c };
      if (n) next[id] = n;
      else delete next[id];
      return next;
    });

  function book() {
    const list = chosen.map((i) => `${counts[i.id]} × ${i.name}`).join(", ");
    const detail: Prefill = {
      load: quoteLoadOption(est),
      message: `From the price calculator: ${list}. About ${est.m3.toFixed(1)} m³ / ${Math.round(est.kg)} kg. Estimate: ${est.label} — ${aud(est.total, true)}${est.itemFeesPending ? " + tip fees to confirm" : ""}.`,
    };
    window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail }));
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  }

  const visible = ITEMS.filter((i) => i.category === tab);

  return (
    <div className="glass-card shadow-lift rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        {/* Item picker */}
        <div className="min-w-0">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible" role="tablist" aria-label="Item categories">
            {CATEGORIES.map((c) => {
              const Icon = ICONS[c.key];
              const n = chosen.filter((i) => i.category === c.key).reduce((a, i) => a + counts[i.id], 0);
              const active = tab === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(c.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active ? "border-transparent bg-ocean text-white shadow-md" : "border-line bg-white text-ink-soft hover:border-teal-700 hover:text-teal-700"
                  }`}
                >
                  <Icon size={16} style={{ color: active ? "#fcd34d" : c.colour }} />
                  {c.label}
                  {n > 0 && <span className={`rounded-full px-1.5 text-xs ${active ? "bg-sun text-sun-ink" : "bg-teal-700 text-white"}`}>{n}</span>}
                </button>
              );
            })}
          </div>

          <ul className="mt-3 grid gap-2 sm:grid-cols-2" role="tabpanel">
            {visible.map((item) => {
              const n = counts[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 transition ${n ? "border-teal-700/40 bg-[#eef8f6]" : "border-line bg-white"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      ~{item.m3 < 0.1 ? item.m3.toFixed(2) : item.m3.toFixed(1)} m³ · {item.kg} kg
                      {item.surcharge && <span className="text-amber-700">· tip fee</span>}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => bump(item.id, -1)}
                      disabled={!n}
                      aria-label={`Remove one ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-teal-700 disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-display text-lg font-bold tabular-nums" aria-live="polite">
                      {n}
                    </span>
                    <button
                      type="button"
                      onClick={() => bump(item.id, 1)}
                      aria-label={`Add one ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white transition hover:bg-teal-800 active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-soft">Can&apos;t see it? Add the closest match, or describe it in the quote form.</p>
        </div>

        {/* Live result */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">
                Our 12×6 ft trailer · {cap.toFixed(1)} m³
              </span>
              {itemCount > 0 && (
                <button type="button" onClick={() => setCounts({})} className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-teal-700">
                  <RotateCcw size={13} /> Start again
                </button>
              )}
            </div>
            <LiveTrailer className="mt-2" blocks={blocks} />
            {est.share > 1 && (
              <p className="-mt-1 text-center text-xs font-semibold text-teal-700">
                Showing load {loadsNeeded} of {loadsNeeded} — the first {loadsNeeded - 1 === 1 ? "is" : `${loadsNeeded - 1} are`} full
              </p>
            )}

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="Space" value={itemCount ? `${Math.round(est.share * 100)}%` : "—"} />
              <Metric label="Volume" value={itemCount ? `${est.m3.toFixed(1)} m³` : "—"} />
              <Metric label="Weight" value={itemCount ? `${Math.round(est.kg)} kg` : "—"} />
            </div>

            <div className="mt-4 border-t border-line pt-4">
              {itemCount ? (
                <dl className="space-y-1.5 text-sm">
                  <Line k={est.label} v={aud(est.loadPrice, true)} />
                  {est.weightCharge > 0 && <Line k="Heavy load (extra tip weight)" v={aud(est.weightCharge, true)} />}
                  {est.itemFees.map((f) => (
                    <Line key={f.key} k={`${f.count} × ${f.label} tip fee`} v={f.each === null ? "on quote" : aud(f.each * f.count, true)} muted={f.each === null} />
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-ink-soft">Add items to see your price.</p>
              )}
              <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-3">
                <span className="font-display text-lg font-bold text-ink">Estimate</span>
                <span className="font-display text-4xl font-extrabold tabular-nums tracking-tight text-ocean">
                  {itemCount ? aud(est.total, true) : "—"}
                  {itemCount > 0 && est.itemFeesPending && <span className="align-top text-base text-amber-700">*</span>}
                </span>
              </div>
              {est.itemFeesPending && <p className="mt-1 text-right text-xs text-amber-700">* plus tip fees for flagged items, confirmed on your quote</p>}
              {heavy && (
                <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                  <Scale size={15} className="mt-0.5 shrink-0" />
                  {overPayload
                    ? `That's about ${Math.round(est.kg)} kg — over our trailer's legal payload, so it needs ${est.tripsByWeight} trips by weight. We'll confirm the price.`
                    : `That's a heavy load (about ${Math.round(est.kg)} kg). Tip fees are charged by weight, so we'll confirm the price.`}
                </p>
              )}
              <button type="button" onClick={book} disabled={!itemCount} className="btn btn-sun mt-4 w-full text-base">
                Book this load <ArrowRight size={18} />
              </button>
              <p className="mt-2 text-center text-xs text-ink-soft">Estimate only — we confirm the exact price on site before lifting a thing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper px-2 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</div>
      <div className="font-display text-lg font-bold tabular-nums text-ocean">{value}</div>
    </div>
  );
}

function Line({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={`tabular-nums font-semibold ${muted ? "text-amber-700" : "text-ink"}`}>{v}</dd>
    </div>
  );
}
