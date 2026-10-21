import { fractionLabel, SEGMENT_COLOURS, type Trip } from "@/lib/plan";

/**
 * Side-on ute towing a box trailer. The trailer bed fills from the front
 * (next to the ute) with one coloured block per job.
 */
export function TrailerGraphic({
  trip,
  index,
  total,
  compact = false,
}: {
  trip: Trip;
  index: number;
  total: number;
  compact?: boolean;
}) {
  // Trailer bed geometry inside the 400×150 viewBox
  const bedX = 14;
  const bedY = 34;
  const bedW = 196;
  const bedH = 70;

  // Front of trailer is the right-hand side (hitched to the ute), so fill right → left.
  const blocks = trip.segments.map((s, i) => {
    const before = trip.segments.slice(0, i + 1).reduce((a, x) => a + x.share, 0);
    const w = bedW * Math.min(1, s.share);
    return { ...s, x: bedX + bedW - bedW * before, w, key: `${s.job.id}-${i}` };
  });

  return (
    <figure className="w-full">
      <svg viewBox="0 0 400 150" className="w-full" role="img" aria-label={`Trailer ${index + 1} of ${total}: ${Math.round(trip.used * 100)}% full`}>
        <defs>
          <linearGradient id="ute-body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
          <pattern id="empty-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgb(255 255 255 / 0.07)" strokeWidth="3" />
          </pattern>
        </defs>

        {/* ground */}
        <line x1="0" y1="137" x2="400" y2="137" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.5" strokeDasharray="6 6" />

        {/* ── trailer ── */}
        <rect x={bedX} y={bedY} width={bedW} height={bedH} rx="3" fill="url(#empty-hatch)" />
        {blocks.map((b) => {
          const c = SEGMENT_COLOURS[b.colour % SEGMENT_COLOURS.length];
          const label = b.w > 34;
          return (
            <g key={b.key}>
              <title>{`${b.job.client_name} · ${fractionLabel(b.share)} load${b.continued ? " (continued)" : ""}`}</title>
              <rect x={b.x + 1} y={bedY + 1} width={Math.max(0, b.w - 2)} height={bedH - 2} rx="2" fill={c.fill} opacity={b.job.status === "paid" || b.job.status === "invoiced" ? 0.45 : 0.95} />
              {label && (
                <>
                  <text x={b.x + b.w / 2} y={bedY + bedH / 2 - 4} textAnchor="middle" fontSize={compact ? 15 : 13} fontWeight="700" fill={c.text}>
                    {fractionLabel(b.share)}
                  </text>
                  {!compact && (
                    <text x={b.x + b.w / 2} y={bedY + bedH / 2 + 13} textAnchor="middle" fontSize="10" fontWeight="600" fill={c.text}>
                      {initials(b.job.client_name)}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
        {/* trailer cage + rails */}
        <rect x={bedX} y={bedY} width={bedW} height={bedH} rx="3" fill="none" stroke="#cbd5e1" strokeWidth="3" />
        {[0.25, 0.5, 0.75].map((q) => (
          <line key={q} x1={bedX + bedW * q} y1={bedY} x2={bedX + bedW * q} y2={bedY + bedH} stroke="rgb(203 213 225 / 0.35)" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <rect x={bedX - 2} y={bedY + bedH} width={bedW + 4} height="8" rx="2" fill="#64748b" />
        {/* drawbar to ute */}
        <path d={`M${bedX + bedW + 2} ${bedY + bedH + 4} L 236 ${bedY + bedH + 6}`} stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        {/* trailer wheel */}
        <Wheel cx={bedX + bedW / 2} cy={124} r={13} />

        {/* ── ute ── */}
        <g>
          {/* tray */}
          <rect x="234" y="72" width="70" height="34" rx="3" fill="url(#ute-body)" />
          {/* cab */}
          <path d="M304 106 V 70 Q 304 56 318 54 L 338 52 Q 348 52 354 60 L 368 80 L 384 84 Q 392 86 392 96 V 106 Z" fill="url(#ute-body)" />
          {/* window */}
          <path d="M312 78 V 66 Q 312 61 318 60 L 337 59 Q 343 59 346 64 L 356 78 Z" fill="#0f2240" opacity="0.85" />
          {/* bumper / lights */}
          <rect x="386" y="92" width="8" height="6" rx="2" fill="#fbbf24" />
          <rect x="230" y="78" width="5" height="10" rx="1.5" fill="#f87171" />
          {/* underbody */}
          <rect x="232" y="104" width="162" height="8" rx="3" fill="#334155" />
          <Wheel cx={262} cy={120} r={16} />
          <Wheel cx={364} cy={120} r={16} />
        </g>

        {/* capacity readout */}
        <text x={bedX} y="22" fontSize="12" fontWeight="700" fill="#5eead4">
          {total > 1 ? `Tip run ${index + 1} of ${total} · ` : ""}
          {Math.round(trip.used * 100)}% full
        </text>
        {trip.used < 0.999 && (
          <text x={bedX + bedW} y="22" fontSize="11" textAnchor="end" fill="rgb(255 255 255 / 0.5)">
            {fractionLabel(Math.max(0, 1 - trip.used))} free
          </text>
        )}
      </svg>
    </figure>
  );
}

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0b1220" stroke="#1e293b" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="#94a3b8" />
    </g>
  );
}

export function initials(name: string): string {
  const words = name.replace(/[^a-z0-9 ]/gi, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 5);
  return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
}

/** Empty trailer for days with nothing booked. */
export function EmptyTrailer({ compact = false }: { compact?: boolean }) {
  return <TrailerGraphic trip={{ segments: [], used: 0 }} index={0} total={1} compact={compact} />;
}
