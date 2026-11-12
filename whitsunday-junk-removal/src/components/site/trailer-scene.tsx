"use client";

import type { Sprite } from "@/lib/junk-pricing";
import { SPRITE_ASPECT, SpriteArt } from "./item-sprites";

export type Piece = { key: string; sprite: Sprite; m3: number; label: string };

type Placed = Piece & { x: number; y: number; w: number; h: number; rotated: boolean };

const COLS = 72;

/**
 * Packs item drawings into a side view of the trailer (bottom-up, from the hitch
 * end). Each item's side area = its volume ÷ trailer width, so a full trailer
 * of items roughly fills the cage. Anything that doesn't fit is heaped on top.
 */
function pack(pieces: Piece[], lengthM: number, widthM: number, heightM: number): Placed[] {
  const sky = new Array<number>(COLS).fill(0);
  const colW = lengthM / COLS;
  const fit = (w: number) => {
    const span = Math.max(1, Math.ceil(w / colW));
    // lowest spot; ties go to the hitch end (right)
    let col = COLS - span;
    let y = Infinity;
    for (let c = COLS - span; c >= 0; c--) {
      let top = 0;
      for (let k = c; k < c + span; k++) top = Math.max(top, sky[k]);
      if (top < y - 1e-6) {
        y = top;
        col = c;
      }
    }
    return { span, col, y };
  };
  return pieces.map((p) => {
    const area = (p.m3 / widthM) * 0.9;
    const aspect = SPRITE_ASPECT[p.sprite];
    let w = Math.min(lengthM * 0.95, Math.sqrt(area * aspect));
    let h = area / w;
    if (h > heightM * 0.95) {
      h = heightM * 0.95;
      w = Math.min(lengthM * 0.95, area / h);
    }
    // Stand it up as drawn, or lay it down if that sits lower in the cage
    const upright = fit(w);
    const laidDown = h > w && h <= lengthM * 0.95 ? fit(h) : null;
    let spot = upright;
    let rotated = false;
    if (laidDown && laidDown.y + w < upright.y + h - 1e-6) {
      spot = laidDown;
      rotated = true;
    }
    const [pw, ph] = rotated ? [h, w] : [w, h];
    for (let k = spot.col; k < spot.col + spot.span; k++) sky[k] = spot.y + ph;
    return { ...p, x: spot.col * colW, y: spot.y, w: pw, h: ph, rotated };
  });
}

export function TrailerScene({
  pieces,
  trailer,
  kg,
  payloadKg,
  fillPct,
  loadNo,
  loads,
}: {
  pieces: Piece[];
  trailer: { lengthM: number; widthM: number; heightM: number };
  kg: number;
  payloadKg: number | null;
  fillPct: number;
  loadNo: number;
  loads: number;
}) {
  const placed = pack(pieces, trailer.lengthM, trailer.widthM, trailer.heightM);
  const weightRatio = payloadKg ? kg / payloadKg : 0;
  const sag = Math.min(1.15, weightRatio) * 2.2; // % of scene height
  const gaugeTone = weightRatio > 1 ? "#dc2626" : weightRatio > 0.85 ? "#f59e0b" : "#0f766e";

  // Bed sits inside the scene at these percentages (scene is 100 × 56 units)
  const BED = { left: 4, width: 56, bottom: 30, height: 34 };

  return (
    <div className="relative w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-sky-50 to-white" style={{ aspectRatio: "100 / 56" }}>
      {/* sky + ground */}
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-slate-200 to-slate-300" />
      <div className="absolute inset-x-0 bottom-[20%] h-[2%] bg-slate-400/40" />
      <div className="absolute bottom-[9%] left-0 right-0 flex gap-[4%] px-[2%] opacity-60">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-[3px] flex-1 rounded bg-white" />
        ))}
      </div>

      {/* trailer body (sags with weight) */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out" style={{ transform: `translateY(${sag}%)` }}>
        {/* cage back panel */}
        <div
          className="absolute rounded-t-md border-2 border-ocean/70 bg-[repeating-linear-gradient(90deg,rgb(11_37_69/0.06)_0_2px,transparent_2px_14px),repeating-linear-gradient(0deg,rgb(11_37_69/0.06)_0_2px,transparent_2px_14px)]"
          style={{ left: `${BED.left}%`, width: `${BED.width}%`, bottom: `${BED.bottom}%`, height: `${BED.height}%` }}
        />
        {/* items */}
        <div className="absolute" style={{ left: `${BED.left}%`, width: `${BED.width}%`, bottom: `${BED.bottom}%`, height: `${BED.height}%` }}>
          {placed.map((p) => (
            <div
              key={p.key}
              title={p.label}
              className="wjr-drop absolute transition-all duration-500 ease-out"
              style={{
                left: `${(p.x / trailer.lengthM) * 100}%`,
                width: `${(p.w / trailer.lengthM) * 100}%`,
                bottom: `${(p.y / trailer.heightM) * 100}%`,
                height: `${(p.h / trailer.heightM) * 100}%`,
                filter: "drop-shadow(0 2px 2px rgb(11 37 69 / 0.25))",
              }}
            >
              {p.rotated ? (
                // Drawn upright, then tipped onto its side to fill the wide, short box
                <div className="absolute left-1/2 top-1/2" style={{ width: `${(p.h / p.w) * 100}%`, height: `${(p.w / p.h) * 100}%`, transform: "translate(-50%, -50%) rotate(-90deg)" }}>
                  <SpriteArt sprite={p.sprite} />
                </div>
              ) : (
                <SpriteArt sprite={p.sprite} />
              )}
            </div>
          ))}
        </div>
        {/* cage front rails (drawn over the load) */}
        <div className="pointer-events-none absolute" style={{ left: `${BED.left}%`, width: `${BED.width}%`, bottom: `${BED.bottom}%`, height: `${BED.height}%` }}>
          <div className="absolute inset-x-0 top-0 h-[5%] rounded-sm bg-ocean" />
          <div className="absolute inset-x-0 top-[48%] h-[3%] bg-ocean/40" />
          {[0, 25, 50, 75, 100].map((x) => (
            <div key={x} className="absolute top-0 h-full w-[1.4%] -translate-x-1/2 bg-ocean" style={{ left: `${x}%` }} />
          ))}
          {/* fill line */}
          {fillPct > 0 && (
            <div className="absolute inset-x-0 border-t-2 border-dashed border-sun transition-all duration-700" style={{ bottom: `${Math.min(100, fillPct)}%` }}>
              <span className="absolute -top-[1.35em] right-1 rounded bg-sun px-1.5 text-[clamp(9px,1.5vw,12px)] font-extrabold text-sun-ink">{Math.round(fillPct)}%</span>
            </div>
          )}
        </div>
        {/* chassis + drawbar */}
        <div className="absolute rounded-sm bg-slate-600" style={{ left: `${BED.left - 1}%`, width: `${BED.width + 2}%`, bottom: `${BED.bottom - 3.5}%`, height: "3.5%" }} />
        <div className="absolute bg-slate-600" style={{ left: `${BED.left + BED.width}%`, width: "6%", bottom: `${BED.bottom - 2.6}%`, height: "1.8%" }} />
        {/* mudguard */}
        <div className="absolute rounded-t-full bg-slate-700" style={{ left: `${BED.left + BED.width / 2 - 9}%`, width: "18%", bottom: `${BED.bottom - 3.5}%`, height: "6%" }} />
      </div>

      {/* trailer wheels (tandem) — don't sag */}
      {[BED.left + BED.width / 2 - 3.8, BED.left + BED.width / 2 + 3.8].map((x) => (
        <Wheel key={x} leftPct={x} size={7.2} />
      ))}

      {/* ute */}
      <svg className="absolute" style={{ left: "62%", bottom: "17%", width: "36%" }} viewBox="0 0 160 70" aria-hidden="true">
        <defs>
          <linearGradient id="scene-ute" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        <rect x="2" y="26" width="62" height="24" rx="3" fill="url(#scene-ute)" stroke="#0b2545" strokeWidth="1.5" />
        <path d="M64 50 V 22 Q 64 10 76 9 L 96 8 Q 106 8 112 16 L 124 32 L 146 36 Q 156 38 156 48 V 50 Z" fill="url(#scene-ute)" stroke="#0b2545" strokeWidth="1.5" />
        <path d="M72 30 V 18 Q 72 14 78 14 L 95 13 Q 101 13 104 18 L 113 30 Z" fill="#0b2545" opacity="0.85" />
        <rect x="150" y="40" width="7" height="5" rx="2" fill="#fbbf24" />
        <rect x="0" y="30" width="4" height="8" rx="1" fill="#ef4444" />
        <rect x="0" y="48" width="158" height="6" rx="2" fill="#334155" />
        <text x="30" y="42" fontSize="8" fontWeight="800" fill="#0f766e" textAnchor="middle">WJR</text>
      </svg>
      <Wheel leftPct={68} size={8.5} />
      <Wheel leftPct={90} size={8.5} />

      {/* payload gauge */}
      <div className="absolute right-[3%] top-[5%] w-[34%] rounded-xl bg-white/90 p-[1.6%] shadow-sm backdrop-blur">
        <div className="flex items-baseline justify-between text-[clamp(9px,1.5vw,12px)] font-bold text-ocean">
          <span>Weight</span>
          <span className="tabular-nums">
            {Math.round(kg).toLocaleString()} kg{payloadKg ? <span className="font-medium text-ink-soft"> / {payloadKg.toLocaleString()}</span> : null}
          </span>
        </div>
        {payloadKg && (
          <div className="mt-1 h-[clamp(5px,1vw,8px)] overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, weightRatio * 100)}%`, background: gaugeTone }} />
          </div>
        )}
      </div>
      {loads > 1 && (
        <div className="absolute left-[3%] top-[5%] rounded-full bg-ocean px-3 py-1 text-[clamp(9px,1.5vw,12px)] font-bold text-white">
          Load {loadNo} of {loads}
        </div>
      )}
      {pieces.length === 0 && (
        <div className="absolute left-[4%] top-[34%] w-[56%] text-center text-[clamp(11px,1.8vw,15px)] font-semibold text-ink-soft">
          Tap + on your items to load the trailer
        </div>
      )}
    </div>
  );
}

function Wheel({ leftPct, size }: { leftPct: number; size: number }) {
  return (
    <div
      className="absolute -translate-x-1/2 rounded-full border-[3px] border-slate-700 bg-slate-900"
      style={{ left: `${leftPct}%`, bottom: "14%", width: `${size}%`, aspectRatio: "1" }}
    >
      <div className="absolute inset-[28%] rounded-full bg-slate-400" />
    </div>
  );
}
