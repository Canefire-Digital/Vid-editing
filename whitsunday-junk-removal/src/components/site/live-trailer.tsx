/**
 * Ute + trailer drawing whose load animates as it fills. The frame is SVG; the
 * load is HTML laid over the trailer bed so widths can transition smoothly.
 */
export type LoadBlock = { key: string; share: number; colour: string; label?: string };

export function LiveTrailer({ blocks, tone = "light", className = "" }: { blocks: LoadBlock[]; tone?: "light" | "dark"; className?: string }) {
  const used = Math.min(1, blocks.reduce((a, b) => a + b.share, 0));
  const frame = tone === "dark" ? "#e2e8f0" : "#0b2545";
  const body = tone === "dark" ? ["#ffffff", "#cbd5e1"] : ["#ffffff", "#c7d2de"];
  const empty = tone === "dark" ? "rgb(255 255 255 / 0.08)" : "rgb(11 37 69 / 0.05)";
  // Lay blocks out from the hitch end; anything past a full trailer is clipped.
  const placed: (LoadBlock & { right: number; w: number })[] = [];
  let usedSoFar = 0;
  for (const b of blocks) {
    const w = Math.max(0, Math.min(b.share, 1 - usedSoFar));
    placed.push({ ...b, right: usedSoFar, w });
    usedSoFar += w;
  }

  return (
    <div className={`relative w-full ${className}`}>
      <svg viewBox="0 0 400 150" className="block w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`ute-${tone}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={body[0]} />
            <stop offset="1" stopColor={body[1]} />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="140" rx="190" ry="6" fill={tone === "dark" ? "rgb(0 0 0 / 0.25)" : "rgb(11 37 69 / 0.1)"} />
        {/* trailer bed */}
        <rect x="14" y="34" width="196" height="70" rx="4" fill={empty} />
        <rect x="14" y="34" width="196" height="70" rx="4" fill="none" stroke={frame} strokeWidth="3.5" />
        {[0.25, 0.5, 0.75].map((q) => (
          <line key={q} x1={14 + 196 * q} y1="34" x2={14 + 196 * q} y2="104" stroke={frame} strokeOpacity="0.25" strokeDasharray="3 4" />
        ))}
        <rect x="12" y="104" width="200" height="8" rx="2" fill="#475569" />
        <path d="M212 108 L 236 110" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <g className="animate-bob" style={{ transformBox: "fill-box" }}>
          <rect x="234" y="72" width="70" height="34" rx="3" fill={`url(#ute-${tone})`} stroke="rgb(11 37 69 / 0.15)" />
          <path d="M304 106 V 70 Q 304 56 318 54 L 338 52 Q 348 52 354 60 L 368 80 L 384 84 Q 392 86 392 96 V 106 Z" fill={`url(#ute-${tone})`} stroke="rgb(11 37 69 / 0.15)" />
          <path d="M312 78 V 66 Q 312 61 318 60 L 337 59 Q 343 59 346 64 L 356 78 Z" fill="#0b2545" opacity="0.85" />
          <rect x="386" y="92" width="8" height="6" rx="2" fill="#fbbf24" />
          <rect x="230" y="78" width="5" height="10" rx="1.5" fill="#ef4444" />
          <rect x="232" y="104" width="162" height="8" rx="3" fill="#334155" />
        </g>
        {[
          [112, 124, 13],
          [262, 120, 16],
          [364, 120, 16],
        ].map(([cx, cy, r]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" />
            <circle cx={cx} cy={cy} r={r * 0.45} fill="#94a3b8" />
          </g>
        ))}
      </svg>

      {/* the load: fills from the hitch end (right) toward the tailgate */}
      <div className="absolute overflow-hidden rounded-[3px]" style={{ left: "4%", top: "23.5%", width: "48%", height: "45%" }}>
        {placed.map((b) => (
          <div
            key={b.key}
            className="absolute inset-y-0 flex items-center justify-center overflow-hidden text-[clamp(9px,1.6vw,13px)] font-bold text-white transition-all duration-500 ease-out"
            style={{ right: `${b.right * 100}%`, width: `${b.w * 100}%`, background: b.colour, boxShadow: "inset -2px 0 0 rgb(255 255 255 / 0.35)" }}
            title={b.label}
          >
            {b.w > 0.12 && b.label ? <span className="truncate px-1">{b.label}</span> : null}
          </div>
        ))}
      </div>

      <div className="sr-only" aria-live="polite">
        Trailer {Math.round(used * 100)}% full
      </div>
    </div>
  );
}
