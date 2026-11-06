/**
 * Website price estimator.
 *
 * Price = load price (by how much of the trailer it fills)
 *       + tip fees at cost (council rates by material, plus per-item fees)
 *       − a discount when the tip fees are big.
 *
 * Space: each item has a typical *loaded* volume (m³ incl. gaps) measured
 * against the trailer (12×6 ft × 1.2 m cage ≈ 8.0 m³).
 * Weight: each item has a typical weight; the tip charges by the tonne and
 * the rate depends on what it is (Whitsunday Regional Council 2025-26, commercial).
 *
 * Volumes and weights are typical-size estimates — check them against real
 * weighbridge dockets and adjust here.
 */

export type Prices = { full: number; three_quarter: number; half: number; quarter: number };

/** How the tip charges for an item. */
export type Stream = "general" | "construction" | "green" | "stumps" | "concrete" | "metal" | "ewaste";
/** Items the tip charges per piece instead of by weight. */
export type EachFee = "mattress" | "fridge" | "aircon" | "tyre" | "tyre_rim" | "tyre_4wd" | "tyre_4wd_rim";

export const STREAMS: Record<Stream, { label: string; councilName: string }> = {
  general: { label: "General waste", councilName: "C&I mixed waste" },
  construction: { label: "Reno / building waste", councilName: "C&D mixed waste" },
  green: { label: "Green waste", councilName: "Green waste" },
  stumps: { label: "Stumps & big branches", councilName: "Tree stumps/branches >300mm" },
  concrete: { label: "Clean concrete", councilName: "Concrete" },
  metal: { label: "Scrap metal", councilName: "Scrap metal" },
  ewaste: { label: "E-waste", councilName: "E-waste" },
};

export const EACH_FEES: Record<EachFee, { label: string }> = {
  mattress: { label: "Mattress / ensemble base" },
  fridge: { label: "Fridge / freezer" },
  aircon: { label: "Air conditioner" },
  tyre: { label: "Car tyre" },
  tyre_rim: { label: "Car tyre on rim" },
  tyre_4wd: { label: "4WD tyre" },
  tyre_4wd_rim: { label: "4WD tyre on rim" },
};

/** Whitsunday Regional Council commercial fees 2025-26, inc GST and waste levy. */
export const DEFAULT_TIP_RATES: Record<Stream, number> = {
  general: 400,
  construction: 400,
  green: 75,
  stumps: 122,
  concrete: 70,
  metal: 0,
  ewaste: 0,
};
export const DEFAULT_EACH_FEES: Record<EachFee, number> = {
  mattress: 54,
  fridge: 13,
  aircon: 16,
  tyre: 12,
  tyre_rim: 29,
  tyre_4wd: 21,
  tyre_4wd_rim: 52,
};

export type PricingConfig = {
  prices: Prices;
  trailer: { lengthM: number; widthM: number; heightM: number; atmKg: number; tareKg: number | null };
  /** $ per tonne by material */
  tipRates: Record<Stream, number>;
  /** $ per item */
  eachFees: Record<EachFee, number>;
  /** When tip fees are over this, take `discount` off the load price. */
  discountThreshold: number;
  discount: number;
};

export const DEFAULT_TRAILER = { lengthM: 3.66, widthM: 1.83, heightM: 1.2, atmKg: 2000, tareKg: 800 };
export const DEFAULT_DISCOUNT_THRESHOLD = 100;
export const DEFAULT_DISCOUNT = 50;

export type CategoryKey = "furniture" | "appliances" | "garden" | "boxes" | "reno";

export const CATEGORIES: { key: CategoryKey; label: string; colour: string }[] = [
  { key: "furniture", label: "Furniture", colour: "#0f766e" },
  { key: "appliances", label: "Appliances", colour: "#0ea5e9" },
  { key: "garden", label: "Garden & outdoor", colour: "#65a30d" },
  { key: "boxes", label: "Boxes & bags", colour: "#d97706" },
  { key: "reno", label: "Reno & heavy", colour: "#7c3aed" },
];

/** Drawing used for the item in the trailer animation. */
export type Sprite =
  | "sofa" | "armchair" | "mattress" | "frame" | "cabinet" | "drawers" | "table" | "chair" | "fridge" | "washer"
  | "screen" | "aircon" | "box" | "bag" | "bike" | "branches" | "bin" | "tyre" | "roll" | "planks" | "rubble" | "stump";

export type Item = {
  id: string;
  name: string;
  category: CategoryKey;
  /** Loaded volume in m³ */
  m3: number;
  /** Typical weight in kg */
  kg: number;
  /** How the tip charges it by weight (ignored when `each` is set) */
  stream: Stream;
  /** Charged per piece instead of by weight */
  each?: EachFee;
  sprite: Sprite;
};

export const ITEMS: Item[] = [
  // Furniture
  { id: "couch3", name: "3-seater couch", category: "furniture", m3: 1.4, kg: 45, stream: "general", sprite: "sofa" },
  { id: "couch2", name: "2-seater couch", category: "furniture", m3: 1.0, kg: 35, stream: "general", sprite: "sofa" },
  { id: "modular", name: "Corner / modular lounge", category: "furniture", m3: 2.5, kg: 80, stream: "general", sprite: "sofa" },
  { id: "armchair", name: "Armchair / recliner", category: "furniture", m3: 0.6, kg: 30, stream: "general", sprite: "armchair" },
  { id: "mattressQ", name: "Queen / king mattress", category: "furniture", m3: 0.8, kg: 35, stream: "general", each: "mattress", sprite: "mattress" },
  { id: "mattressS", name: "Single / double mattress", category: "furniture", m3: 0.5, kg: 22, stream: "general", each: "mattress", sprite: "mattress" },
  { id: "ensemble", name: "Ensemble / bed base", category: "furniture", m3: 0.6, kg: 35, stream: "general", each: "mattress", sprite: "mattress" },
  { id: "bedframe", name: "Bed frame (dismantled)", category: "furniture", m3: 0.4, kg: 30, stream: "general", sprite: "frame" },
  { id: "wardrobe", name: "Wardrobe", category: "furniture", m3: 0.9, kg: 60, stream: "general", sprite: "cabinet" },
  { id: "drawers", name: "Chest of drawers", category: "furniture", m3: 0.4, kg: 40, stream: "general", sprite: "drawers" },
  { id: "bedside", name: "Bedside table", category: "furniture", m3: 0.12, kg: 12, stream: "general", sprite: "drawers" },
  { id: "table", name: "Dining table", category: "furniture", m3: 0.6, kg: 40, stream: "general", sprite: "table" },
  { id: "chair", name: "Dining chair", category: "furniture", m3: 0.15, kg: 6, stream: "general", sprite: "chair" },
  { id: "desk", name: "Desk", category: "furniture", m3: 0.45, kg: 30, stream: "general", sprite: "table" },
  { id: "shelf", name: "Bookshelf / TV unit", category: "furniture", m3: 0.4, kg: 35, stream: "general", sprite: "cabinet" },
  { id: "coffee", name: "Coffee table", category: "furniture", m3: 0.25, kg: 15, stream: "general", sprite: "table" },

  // Appliances
  { id: "fridge", name: "Fridge / upright freezer", category: "appliances", m3: 0.9, kg: 70, stream: "metal", each: "fridge", sprite: "fridge" },
  { id: "chestfreezer", name: "Chest freezer", category: "appliances", m3: 0.6, kg: 45, stream: "metal", each: "fridge", sprite: "fridge" },
  { id: "aircon", name: "Air-con unit", category: "appliances", m3: 0.35, kg: 45, stream: "metal", each: "aircon", sprite: "aircon" },
  { id: "washer", name: "Washing machine", category: "appliances", m3: 0.33, kg: 70, stream: "metal", sprite: "washer" },
  { id: "dryer", name: "Dryer / dishwasher", category: "appliances", m3: 0.3, kg: 40, stream: "metal", sprite: "washer" },
  { id: "oven", name: "Oven / stove", category: "appliances", m3: 0.35, kg: 55, stream: "metal", sprite: "washer" },
  { id: "hws", name: "Hot water system", category: "appliances", m3: 0.3, kg: 50, stream: "metal", sprite: "washer" },
  { id: "bbq", name: "BBQ (no gas bottle)", category: "appliances", m3: 0.6, kg: 40, stream: "metal", sprite: "washer" },
  { id: "tv", name: "TV", category: "appliances", m3: 0.15, kg: 15, stream: "ewaste", sprite: "screen" },
  { id: "computer", name: "Computer / monitor / printer", category: "appliances", m3: 0.08, kg: 8, stream: "ewaste", sprite: "screen" },
  { id: "small", name: "Microwave / small appliance", category: "appliances", m3: 0.06, kg: 10, stream: "ewaste", sprite: "aircon" },

  // Garden & outdoor
  { id: "greenbin", name: "Wheelie bin of green waste", category: "garden", m3: 0.24, kg: 30, stream: "green", sprite: "bin" },
  { id: "fronds", name: "Palm fronds / branches (armful)", category: "garden", m3: 0.5, kg: 20, stream: "green", sprite: "branches" },
  { id: "stump", name: "Tree stump / log (over 300 mm)", category: "garden", m3: 0.3, kg: 150, stream: "stumps", sprite: "stump" },
  { id: "outdoorset", name: "Outdoor table + 4 chairs", category: "garden", m3: 1.2, kg: 50, stream: "general", sprite: "table" },
  { id: "trampoline", name: "Trampoline (dismantled)", category: "garden", m3: 0.8, kg: 60, stream: "metal", sprite: "frame" },
  { id: "play", name: "Swing set / play equipment", category: "garden", m3: 0.8, kg: 40, stream: "general", sprite: "frame" },
  { id: "mower", name: "Lawn mower (drained)", category: "garden", m3: 0.25, kg: 30, stream: "metal", sprite: "bike" },
  { id: "tyre", name: "Car tyre", category: "garden", m3: 0.1, kg: 9, stream: "general", each: "tyre", sprite: "tyre" },
  { id: "tyreRim", name: "Car tyre on rim", category: "garden", m3: 0.1, kg: 18, stream: "general", each: "tyre_rim", sprite: "tyre" },
  { id: "tyre4wd", name: "4WD tyre", category: "garden", m3: 0.15, kg: 15, stream: "general", each: "tyre_4wd", sprite: "tyre" },
  { id: "tyre4wdRim", name: "4WD tyre on rim", category: "garden", m3: 0.15, kg: 30, stream: "general", each: "tyre_4wd_rim", sprite: "tyre" },

  // Boxes & bags
  { id: "box", name: "Moving box", category: "boxes", m3: 0.07, kg: 12, stream: "general", sprite: "box" },
  { id: "bag", name: "Rubbish bag (70 L)", category: "boxes", m3: 0.07, kg: 6, stream: "general", sprite: "bag" },
  { id: "suitcase", name: "Suitcase / storage tub", category: "boxes", m3: 0.08, kg: 8, stream: "general", sprite: "box" },
  { id: "bike", name: "Bike", category: "boxes", m3: 0.3, kg: 13, stream: "metal", sprite: "bike" },

  // Reno & heavy
  { id: "carpet", name: "Carpet + underlay (one bedroom)", category: "reno", m3: 0.4, kg: 40, stream: "general", sprite: "roll" },
  { id: "timber", name: "Timber offcuts (armful)", category: "reno", m3: 0.3, kg: 40, stream: "construction", sprite: "planks" },
  { id: "cabinets", name: "Kitchen cabinets (small kitchen)", category: "reno", m3: 2.0, kg: 200, stream: "construction", sprite: "cabinet" },
  { id: "vanity", name: "Bathroom vanity", category: "reno", m3: 0.4, kg: 40, stream: "construction", sprite: "drawers" },
  { id: "door", name: "Internal door", category: "reno", m3: 0.08, kg: 20, stream: "construction", sprite: "planks" },
  { id: "plaster", name: "Plasterboard sheet", category: "reno", m3: 0.03, kg: 25, stream: "construction", sprite: "planks" },
  { id: "rubble", name: "Wheelbarrow of tiles / rubble", category: "reno", m3: 0.08, kg: 130, stream: "construction", sprite: "rubble" },
  { id: "concrete", name: "Wheelbarrow of clean concrete", category: "reno", m3: 0.08, kg: 160, stream: "concrete", sprite: "rubble" },
  { id: "metalScrap", name: "Scrap metal (armful)", category: "reno", m3: 0.2, kg: 40, stream: "metal", sprite: "planks" },
];

export const TIERS = [
  { key: "quarter", label: "Quarter load", max: 0.25 },
  { key: "half", label: "Half load", max: 0.5 },
  { key: "three_quarter", label: "3/4 load", max: 0.75 },
  { key: "full", label: "Full load", max: 1 },
] as const;

export function trailerM3(t: PricingConfig["trailer"]): number {
  return t.lengthM * t.widthM * t.heightM;
}

export function payloadKg(t: PricingConfig["trailer"]): number | null {
  return t.tareKg ? Math.max(0, t.atmKg - t.tareKg) : null;
}

export type TipLine =
  | { kind: "weight"; stream: Stream; label: string; kg: number; rate: number; cost: number }
  | { kind: "each"; fee: EachFee; label: string; count: number; each: number; cost: number };

export type Estimate = {
  m3: number;
  kg: number;
  share: number;
  fullLoads: number;
  remainderTier: (typeof TIERS)[number] | null;
  label: string;
  loadPrice: number;
  tipLines: TipLine[];
  tipTotal: number;
  discount: number;
  tripsBySpace: number;
  /** Trips needed if limited by the trailer's legal payload */
  tripsByWeight: number | null;
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function estimate(counts: Record<string, number>, cfg: PricingConfig): Estimate {
  const chosen = ITEMS.filter((i) => counts[i.id]);
  const m3 = chosen.reduce((a, i) => a + i.m3 * counts[i.id], 0);
  const kg = chosen.reduce((a, i) => a + i.kg * counts[i.id], 0);
  const share = m3 / trailerM3(cfg.trailer);

  // Space → load price (rounded up to the next quarter load)
  const fullLoads = Math.floor(share + 1e-9);
  const rest = share - fullLoads;
  const remainderTier = rest > 1e-9 ? TIERS.find((t) => rest <= t.max + 1e-9) ?? TIERS[3] : null;
  const loadPrice = fullLoads * cfg.prices.full + (remainderTier ? cfg.prices[remainderTier.key] : 0);
  // A remainder that rounds up to a full load reads as another full load
  const wholeLoads = fullLoads + (remainderTier?.key === "full" ? 1 : 0);
  const parts: string[] = [];
  if (wholeLoads) parts.push(wholeLoads === 1 ? "1 full load" : `${wholeLoads} full loads`);
  if (remainderTier && remainderTier.key !== "full") parts.push(remainderTier.label.toLowerCase());
  const label = parts.length ? parts.join(" + ").replace(/^./, (c) => c.toUpperCase()) : "Nothing yet";

  // Tip fees: by weight per material, or per piece
  const tipLines: TipLine[] = [];
  for (const stream of Object.keys(STREAMS) as Stream[]) {
    const w = chosen.filter((i) => !i.each && i.stream === stream).reduce((a, i) => a + i.kg * counts[i.id], 0);
    if (!w) continue;
    const rate = cfg.tipRates[stream] ?? 0;
    tipLines.push({ kind: "weight", stream, label: STREAMS[stream].label, kg: w, rate, cost: round2((w / 1000) * rate) });
  }
  for (const fee of Object.keys(EACH_FEES) as EachFee[]) {
    const n = chosen.filter((i) => i.each === fee).reduce((a, i) => a + counts[i.id], 0);
    if (!n) continue;
    const each = cfg.eachFees[fee] ?? 0;
    tipLines.push({ kind: "each", fee, label: EACH_FEES[fee].label, count: n, each, cost: round2(n * each) });
  }
  const tipTotal = round2(tipLines.reduce((a, l) => a + l.cost, 0));
  const discount = loadPrice > 0 && tipTotal > cfg.discountThreshold ? Math.min(cfg.discount, loadPrice) : 0;

  const payload = payloadKg(cfg.trailer);
  return {
    m3,
    kg,
    share,
    fullLoads,
    remainderTier,
    label,
    loadPrice,
    tipLines,
    tipTotal,
    discount,
    tripsBySpace: Math.max(1, Math.ceil(share - 1e-9)),
    tripsByWeight: payload ? Math.max(1, Math.ceil(kg / payload)) : null,
    total: Math.round(loadPrice + tipTotal - discount),
  };
}

/** Text for the quote form's load size dropdown. */
export function quoteLoadOption(e: Estimate): string {
  if (e.fullLoads >= 1 && (e.fullLoads > 1 || e.remainderTier)) return "More than one load";
  if (e.fullLoads === 1) return "Full load";
  if (!e.remainderTier) return "";
  return {
    quarter: "Quarter load (a few items)",
    half: "Half load",
    three_quarter: "3/4 load",
    full: "Full load",
  }[e.remainderTier.key];
}

export type Prefill = { load: string; message: string };
export const PREFILL_EVENT = "wjr:prefill";
