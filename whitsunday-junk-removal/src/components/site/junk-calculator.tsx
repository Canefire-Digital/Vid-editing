"use client";

import { useState } from "react";
import {
  Armchair,
  ArrowRight,
  Boxes,
  Hammer,
  Minus,
  Plus,
  RotateCcw,
  Scale,
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
  payloadKg,
  quoteLoadOption,
  trailerM3,
  type CategoryKey,
  type Item,
  type PricingConfig,
  type Prefill,
} from "@/lib/junk-pricing";
import { AnimatedNumber } from "./animated-number";
import { TrailerScene, type Piece } from "./trailer-scene";

const ICONS: Record<CategoryKey, LucideIcon> = {
  furniture: Armchair,
  appliances: WashingMachine,
  garden: Sprout,
  boxes: Boxes,
  reno: Hammer,
};

/** Most drawings shown in the trailer for one item (keeps 30 boxes readable). */
const MAX_SPRITES_PER_ITEM = 12;

const money = (n: number) => aud(Math.round(n), true);
const cents = (n: number) => aud(n);

export function JunkCalculator({ pricing }: { pricing: PricingConfig }) {
  const [tab, setTab] = useState<CategoryKey>("furniture");
  // Order items were added, so new ones drop in on top
  const [order, setOrder] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [viewLoad, setViewLoad] = useState<number | null>(null);

  const est = estimate(counts, pricing);
  const cap = trailerM3(pricing.trailer);
  const payload = payloadKg(pricing.trailer);
  const itemCount = Object.values(counts).reduce((a, n) => a + n, 0);
  const overPayload = est.tripsByWeight !== null && est.tripsByWeight > est.tripsBySpace;

  // Split the pieces into trailer loads by volume, in the order they were added
  const loads: { pieces: Piece[]; m3: number; kg: number }[] = [{ pieces: [], m3: 0, kg: 0 }];
  for (const id of order) {
    const item = ITEMS.find((i) => i.id === id) as Item;
    const n = counts[id] ?? 0;
    for (let k = 0; k < n; k++) {
      let load = loads[loads.length - 1];
      if (load.m3 + item.m3 > cap + 1e-6 && load.pieces.length) {
        load = { pieces: [], m3: 0, kg: 0 };
        loads.push(load);
      }
      load.m3 += item.m3;
      load.kg += item.kg;
      if (k < MAX_SPRITES_PER_ITEM || n <= MAX_SPRITES_PER_ITEM) {
        load.pieces.push({ key: `${id}-${k}`, sprite: item.sprite, m3: item.m3, label: item.name });
      }
    }
  }
  const shownLoad = Math.min(viewLoad ?? loads.length - 1, loads.length - 1);
  const current = loads[shownLoad];

  const bump = (id: string, d: number) => {
    setViewLoad(null);
    setCounts((c) => {
      const n = Math.max(0, Math.min(60, (c[id] ?? 0) + d));
      const next = { ...c };
      if (n) next[id] = n;
      else delete next[id];
      return next;
    });
    setOrder((o) => {
      const has = o.includes(id);
      const willHave = (counts[id] ?? 0) + d > 0;
      if (willHave && !has) return [...o, id];
      if (!willHave && has) return o.filter((x) => x !== id);
      return o;
    });
  };

  function reset() {
    setCounts({});
    setOrder([]);
    setViewLoad(null);
  }

  function book() {
    const list = order.map((id) => `${counts[id]} × ${ITEMS.find((i) => i.id === id)?.name}`).join(", ");
    const detail: Prefill = {
      load: quoteLoadOption(est),
      message: `From the price calculator: ${list}. About ${est.m3.toFixed(1)} m³ / ${Math.round(est.kg)} kg. Estimate ${money(est.total)} (${est.label} ${money(est.loadPrice)} + tip fees ${cents(est.tipTotal)}${est.discount ? ` − ${money(est.discount)} discount` : ""}).`,
    };
    window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail }));
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  }

  const visible = ITEMS.filter((i) => i.category === tab);

  return (
    <div className="glass-card shadow-lift rounded-[2rem] p-3 sm:p-6 lg:p-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:gap-8">
        {/* ── Trailer scene (sticky on phones so you can watch it fill) ── */}
        <div className="sticky top-16 z-10 -mx-3 bg-white/95 px-3 pb-2 pt-1 backdrop-blur sm:relative sm:top-0 sm:mx-0 sm:bg-transparent sm:p-0 lg:sticky lg:order-2 lg:top-24 lg:self-start">
          <TrailerScene
            pieces={current.pieces}
            trailer={pricing.trailer}
            kg={current.kg}
            payloadKg={payload}
            fillPct={(current.m3 / cap) * 100}
            loadNo={shownLoad + 1}
            loads={loads.length}
          />
          {itemCount > 0 && (
            <div className={`pointer-events-none absolute left-[calc(0.75rem+3%)] rounded-xl bg-ocean px-3 py-1.5 text-white shadow-lg sm:left-[3%] lg:hidden ${loads.length > 1 ? "top-[calc(0.25rem+17%)]" : "top-[calc(0.25rem+5%)]"}`}>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/70">Estimate</span>
              <span key={est.total} className="wjr-pop block font-display text-xl font-extrabold">
                <AnimatedNumber value={est.total} format={money} />
              </span>
            </div>
          )}
          {loads.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {loads.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setViewLoad(i)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${i === shownLoad ? "bg-ocean text-white" : "bg-paper text-ink-soft ring-1 ring-line hover:text-teal-700"}`}
                >
                  Load {i + 1} · {Math.round((l.m3 / cap) * 100)}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Item picker ── */}
        <div className="min-w-0 lg:order-1 lg:row-span-2">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible" role="tablist" aria-label="Item categories">
            {CATEGORIES.map((c) => {
              const Icon = ICONS[c.key];
              const n = ITEMS.filter((i) => i.category === c.key).reduce((a, i) => a + (counts[i.id] ?? 0), 0);
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
              const tipNote = item.each ? `${aud(pricing.eachFees[item.each], true)} tip fee` : pricing.tipRates[item.stream] === 0 ? "free at the tip" : null;
              return (
                <li
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 transition ${n ? "border-teal-700/40 bg-[#eef8f6]" : "border-line bg-white"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                    <span className="flex flex-wrap items-center gap-x-1 text-xs text-ink-soft">
                      ~{item.m3 < 0.1 ? item.m3.toFixed(2) : item.m3.toFixed(1)} m³ · {item.kg} kg
                      {tipNote && <span className={item.each ? "text-amber-700" : "text-teal-700"}>· {tipNote}</span>}
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

        {/* ── Price, worked out step by step ── */}
        <div className="lg:order-3">
          <div className="rounded-[1.5rem] border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">How your price adds up</span>
              {itemCount > 0 && (
                <button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-teal-700">
                  <RotateCcw size={13} /> Start again
                </button>
              )}
            </div>

            {itemCount === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Add a few items and watch the trailer fill — your price builds here.</p>
            ) : (
              <ol className="mt-3 space-y-1 text-sm">
                <Step key={`load-${est.label}`} n={1} title={est.share > 1 ? `${est.label} — ${est.m3.toFixed(1)} m³` : `${est.label} — ${est.m3.toFixed(1)} of ${cap.toFixed(1)} m³`} value={money(est.loadPrice)} />
                <li className="pt-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ocean text-[11px] text-white">2</span>
                  Tip fees at council rates
                </li>
                {est.tipLines.map((l) => (
                  <li key={l.kind === "weight" ? l.stream : l.fee} className="wjr-line-in flex justify-between gap-3 rounded-lg py-0.5 pl-7">
                    <span className="text-ink-soft">
                      {l.kind === "weight" ? (
                        <>
                          {l.label}: {Math.round(l.kg)} kg {l.rate ? <>× ${l.rate}/t</> : null}
                        </>
                      ) : (
                        <>
                          {l.count} × {l.label} @ ${l.each}
                        </>
                      )}
                    </span>
                    <span className={`font-semibold tabular-nums ${l.cost === 0 ? "text-teal-700" : "text-ink"}`}>{l.cost === 0 ? "free" : <AnimatedNumber value={l.cost} format={cents} />}</span>
                  </li>
                ))}
                {est.discount > 0 && (
                  <Step n={3} title={`Big-load discount (tip fees over ${money(pricing.discountThreshold)})`} value={`− ${money(est.discount)}`} good />
                )}
              </ol>
            )}

            <div className="mt-4 flex items-end justify-between gap-2 border-t border-line pt-3">
              <span>
                <span className="block font-display text-lg font-bold text-ink">Your estimate</span>
                {itemCount > 0 && (
                  <span className="text-xs text-ink-soft">
                    {money(est.loadPrice)} + {cents(est.tipTotal)} tip{est.discount ? ` − ${money(est.discount)}` : ""}
                  </span>
                )}
              </span>
              <span key={est.total} className="wjr-pop font-display text-4xl font-extrabold tracking-tight text-ocean">
                {itemCount ? <AnimatedNumber value={est.total} format={money} /> : "—"}
              </span>
            </div>

            {overPayload && (
              <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                <Scale size={15} className="mt-0.5 shrink-0" />
                About {Math.round(est.kg).toLocaleString()} kg is over our trailer&apos;s {payload?.toLocaleString()} kg legal payload, so it&apos;s {est.tripsByWeight} trips by weight. We&apos;ll confirm the price.
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
  );
}

function Step({ n, title, value, good }: { n: number; title: string; value: string; good?: boolean }) {
  return (
    <li className="wjr-line-in flex justify-between gap-3 rounded-lg py-0.5">
      <span className="flex items-center gap-1.5 font-semibold text-ink">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ocean text-[11px] font-bold text-white">{n}</span>
        {title}
      </span>
      <span className={`font-semibold tabular-nums ${good ? "text-teal-700" : "text-ink"}`}>{value}</span>
    </li>
  );
}
