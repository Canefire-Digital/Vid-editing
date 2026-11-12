import type { Sprite } from "@/lib/junk-pricing";

/** Width ÷ height of each drawing, used to size it from the item's volume. */
export const SPRITE_ASPECT: Record<Sprite, number> = {
  sofa: 2.2,
  armchair: 1,
  mattress: 4,
  frame: 3,
  cabinet: 0.55,
  drawers: 1.1,
  table: 1.8,
  chair: 0.7,
  fridge: 0.48,
  washer: 1,
  screen: 1.5,
  aircon: 1.6,
  box: 1.1,
  bag: 1,
  bike: 1.6,
  branches: 2.2,
  bin: 0.65,
  tyre: 1,
  roll: 3.5,
  planks: 4,
  rubble: 1.6,
  stump: 1.4,
};

const S = { stroke: "#0b2545", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Simple side-on drawings of junk, drawn to fill their box. */
export function SpriteArt({ sprite }: { sprite: Sprite }) {
  switch (sprite) {
    case "sofa":
      return (
        <svg viewBox="0 0 220 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="14" y="10" width="192" height="50" rx="14" fill="#2c7a7b" {...S} />
          <rect x="4" y="38" width="36" height="52" rx="10" fill="#28706f" {...S} />
          <rect x="180" y="38" width="36" height="52" rx="10" fill="#28706f" {...S} />
          <rect x="36" y="52" width="148" height="34" rx="8" fill="#38a3a5" {...S} />
          <line x1="110" y1="54" x2="110" y2="84" {...S} />
          <rect x="30" y="88" width="10" height="10" fill="#0b2545" />
          <rect x="180" y="88" width="10" height="10" fill="#0b2545" />
        </svg>
      );
    case "armchair":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="14" y="6" width="72" height="56" rx="14" fill="#b45309" {...S} />
          <rect x="4" y="40" width="22" height="50" rx="8" fill="#a1470a" {...S} />
          <rect x="74" y="40" width="22" height="50" rx="8" fill="#a1470a" {...S} />
          <rect x="24" y="56" width="52" height="30" rx="6" fill="#d97706" {...S} />
        </svg>
      );
    case "mattress":
      return (
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="8" width="392" height="84" rx="22" fill="#e0f2fe" {...S} />
          {[80, 160, 240, 320].map((x) => (
            <line key={x} x1={x} y1="14" x2={x} y2="86" stroke="#7dd3fc" strokeWidth="3" />
          ))}
          <line x1="12" y1="50" x2="388" y2="50" stroke="#7dd3fc" strokeWidth="3" strokeDasharray="10 10" />
        </svg>
      );
    case "frame":
      return (
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="8" y="30" width="284" height="18" rx="4" fill="#a16207" {...S} />
          <rect x="8" y="62" width="284" height="14" rx="4" fill="#854d0e" {...S} />
          {[16, 150, 276].map((x) => (
            <rect key={x} x={x} y="10" width="12" height="84" rx="3" fill="#713f12" {...S} />
          ))}
        </svg>
      );
    case "cabinet":
      return (
        <svg viewBox="0 0 55 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="3" y="3" width="49" height="94" rx="3" fill="#c08457" {...S} />
          <line x1="27.5" y1="6" x2="27.5" y2="94" {...S} />
          <circle cx="22" cy="50" r="2.5" fill="#0b2545" />
          <circle cx="33" cy="50" r="2.5" fill="#0b2545" />
        </svg>
      );
    case "drawers":
      return (
        <svg viewBox="0 0 110 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="4" width="102" height="92" rx="4" fill="#d6a46c" {...S} />
          {[34, 64].map((y) => (
            <line key={y} x1="6" y1={y} x2="104" y2={y} {...S} />
          ))}
          {[19, 49, 79].map((y) => (
            <rect key={y} x="45" y={y - 3} width="20" height="6" rx="3" fill="#0b2545" />
          ))}
        </svg>
      );
    case "table":
      return (
        <svg viewBox="0 0 180 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="8" width="172" height="16" rx="4" fill="#92400e" {...S} />
          <rect x="18" y="24" width="12" height="72" fill="#78350f" {...S} />
          <rect x="150" y="24" width="12" height="72" fill="#78350f" {...S} />
        </svg>
      );
    case "chair":
      return (
        <svg viewBox="0 0 70 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="8" y="4" width="12" height="92" rx="3" fill="#a16207" {...S} />
          <rect x="8" y="52" width="56" height="10" rx="3" fill="#ca8a04" {...S} />
          <rect x="52" y="60" width="10" height="36" rx="3" fill="#a16207" {...S} />
        </svg>
      );
    case "fridge":
      return (
        <svg viewBox="0 0 48 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="3" y="3" width="42" height="94" rx="6" fill="#f8fafc" {...S} />
          <line x1="4" y1="36" x2="44" y2="36" {...S} />
          <rect x="36" y="14" width="4" height="14" rx="2" fill="#0b2545" />
          <rect x="36" y="44" width="4" height="20" rx="2" fill="#0b2545" />
        </svg>
      );
    case "washer":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="4" width="92" height="92" rx="8" fill="#e2e8f0" {...S} />
          <line x1="6" y1="24" x2="94" y2="24" {...S} />
          <circle cx="50" cy="60" r="24" fill="#93c5fd" {...S} />
          <circle cx="20" cy="14" r="4" fill="#0b2545" />
        </svg>
      );
    case "screen":
      return (
        <svg viewBox="0 0 150 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="4" width="142" height="76" rx="6" fill="#1e293b" {...S} />
          <rect x="12" y="12" width="126" height="60" rx="3" fill="#38bdf8" opacity="0.5" />
          <rect x="60" y="80" width="30" height="10" fill="#334155" />
          <rect x="40" y="90" width="70" height="7" rx="3" fill="#334155" />
        </svg>
      );
    case "aircon":
      return (
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="6" width="152" height="88" rx="8" fill="#f1f5f9" {...S} />
          <circle cx="60" cy="50" r="30" fill="#cbd5e1" {...S} />
          <path d="M60 22 L60 78 M32 50 L88 50" {...S} />
          <rect x="108" y="22" width="34" height="56" rx="4" fill="#e2e8f0" {...S} />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 110 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="4" y="6" width="102" height="90" rx="3" fill="#d4a373" {...S} />
          <rect x="44" y="6" width="22" height="90" fill="#e9c46a" opacity="0.8" />
          <line x1="4" y1="22" x2="106" y2="22" stroke="#0b2545" strokeWidth="2" />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <path d="M14 96 Q4 60 22 34 Q36 20 50 22 Q64 20 78 34 Q96 60 86 96 Z" fill="#1f2937" {...S} />
          <path d="M40 22 Q50 4 60 22" fill="none" {...S} />
          <path d="M30 52 Q40 60 34 80" fill="none" stroke="#4b5563" strokeWidth="3" />
        </svg>
      );
    case "bike":
      return (
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="h-full w-full">
          <circle cx="36" cy="64" r="28" fill="none" {...S} strokeWidth={6} />
          <circle cx="124" cy="64" r="28" fill="none" {...S} strokeWidth={6} />
          <path d="M36 64 L66 22 L110 22 L124 64 M66 22 L84 64 L110 22 M60 14 L76 14" fill="none" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case "branches":
      return (
        <svg viewBox="0 0 220 100" preserveAspectRatio="none" className="h-full w-full">
          <path d="M6 92 L214 40" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          {[30, 70, 110, 150, 190].map((x, i) => (
            <g key={x}>
              <path d={`M${x} ${86 - i * 10} Q${x - 10} ${40 - i * 6} ${x + 20} ${20 - i * 2}`} fill="none" stroke="#4d7c0f" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx={x + 10} cy={52 - i * 8} rx="22" ry="12" fill="#65a30d" stroke="#365314" strokeWidth="2" />
            </g>
          ))}
        </svg>
      );
    case "bin":
      return (
        <svg viewBox="0 0 65 100" preserveAspectRatio="none" className="h-full w-full">
          <path d="M8 18 L57 18 L52 92 L13 92 Z" fill="#166534" {...S} />
          <rect x="3" y="8" width="59" height="12" rx="3" fill="#84cc16" {...S} />
          <circle cx="18" cy="92" r="6" fill="#0b2545" />
          <path d="M18 30 Q30 50 22 70 M40 34 Q34 56 44 76" fill="none" stroke="#86efac" strokeWidth="3" />
        </svg>
      );
    case "tyre":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="#111827" {...S} />
          <circle cx="50" cy="50" r="22" fill="#9ca3af" {...S} />
          <circle cx="50" cy="50" r="8" fill="#374151" />
        </svg>
      );
    case "roll":
      return (
        <svg viewBox="0 0 350 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="30" y="10" width="300" height="80" fill="#a78bfa" {...S} />
          <ellipse cx="30" cy="50" rx="24" ry="40" fill="#c4b5fd" {...S} />
          <path d="M30 30 Q44 50 30 70" fill="none" {...S} />
          <ellipse cx="330" cy="50" rx="14" ry="40" fill="#8b5cf6" {...S} />
        </svg>
      );
    case "planks":
      return (
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-full w-full">
          {[8, 38, 68].map((y, i) => (
            <rect key={y} x={4 + i * 8} y={y} width={388 - i * 16} height="26" rx="3" fill={["#d97706", "#b45309", "#e0a458"][i]} {...S} />
          ))}
        </svg>
      );
    case "rubble":
      return (
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="h-full w-full">
          <path d="M4 96 L20 50 L50 30 L80 40 L110 18 L140 44 L156 96 Z" fill="#9ca3af" {...S} />
          <path d="M30 70 L50 56 L66 72 M92 60 L112 48 L126 70" fill="none" stroke="#4b5563" strokeWidth="3" />
          <rect x="60" y="78" width="26" height="14" fill="#b91c1c" opacity="0.7" />
        </svg>
      );
    case "stump":
      return (
        <svg viewBox="0 0 140 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="10" y="20" width="110" height="74" rx="10" fill="#92400e" {...S} />
          <ellipse cx="120" cy="57" rx="16" ry="37" fill="#fbbf24" {...S} />
          <ellipse cx="120" cy="57" rx="8" ry="20" fill="none" stroke="#b45309" strokeWidth="3" />
        </svg>
      );
  }
}
