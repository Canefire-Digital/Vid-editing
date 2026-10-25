"use client";

import { useState } from "react";

/** Drag the handle to wipe between the before and after photo. */
export function BeforeAfter({ before, after, label }: { before: string; after: string; label: string | null }) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="glass-card overflow-hidden rounded-3xl p-2">
      <div className="relative aspect-[4/3] select-none overflow-hidden rounded-2xl bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={`After${label ? ` — ${label}` : ""}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt={`Before${label ? ` — ${label}` : ""}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold">Before</span>
        <span className="absolute right-3 top-3 rounded-full bg-sun px-2.5 py-1 text-xs font-semibold text-sun-ink">After</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold text-ocean shadow-lg">
            ⇆
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Slide to compare before and after"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {label && <figcaption className="px-2 pb-1 pt-2.5 text-sm font-semibold text-ink-soft">{label}</figcaption>}
    </figure>
  );
}
