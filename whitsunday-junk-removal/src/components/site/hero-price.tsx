"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { aud } from "@/lib/format";
import type { Prices } from "@/lib/junk-pricing";
import { LiveTrailer } from "./live-trailer";

const STEPS = [
  { key: "quarter", label: "Quarter load", hint: "A few bulky items — a fridge, a couch, a bed." },
  { key: "half", label: "Half load", hint: "A small room's worth or a garage corner." },
  { key: "three_quarter", label: "3/4 load", hint: "Most of a garage, or a small unit clear-out." },
  { key: "full", label: "Full load", hint: "Whole-house cleanouts and big yard jobs." },
] as const;

/** Drag-to-price card in the hero. */
export function HeroPrice({ prices, capacityM3 }: { prices: Prices; capacityM3: number }) {
  const [i, setI] = useState(1);
  const step = STEPS[i];
  const share = (i + 1) / 4;

  return (
    <div className="glass-dark rounded-[2rem] p-5 text-white shadow-2xl sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Drag to see your price</span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-sun" /> Booking this week
        </span>
      </div>

      <LiveTrailer tone="dark" className="mt-3" blocks={[{ key: "load", share, colour: "linear-gradient(180deg,#fcd34d,#f59e0b)", label: step.label }]} />

      <div className="mt-1 flex items-end justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">
            {step.label} · {(capacityM3 * share).toFixed(1)} m³
          </div>
          <div className="font-display text-5xl font-extrabold tabular-nums tracking-tight">{aud(prices[step.key], true)}</div>
        </div>
        <p className="max-w-[12rem] text-right text-xs text-white/70">{step.hint}</p>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Load size</span>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          className="slider"
          style={{ ["--fill" as string]: `${(i / 3) * 100}%` }}
          aria-valuetext={`${step.label}, ${aud(prices[step.key], true)}`}
        />
      </label>
      <div className="mt-2 grid grid-cols-4 text-center text-[11px] font-semibold text-white/60">
        {STEPS.map((s, k) => (
          <button key={s.key} type="button" onClick={() => setI(k)} className={k === i ? "text-sun" : "hover:text-white"}>
            {s.label.replace(" load", "")}
          </button>
        ))}
      </div>

      <a href="#calculator" className="btn btn-sun mt-5 w-full">
        Not sure? Build your load <ArrowRight size={18} />
      </a>
    </div>
  );
}
