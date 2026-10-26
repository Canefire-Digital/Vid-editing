/**
 * Website price estimator.
 *
 * Space: each item has a typical *loaded* volume (m³ it really takes up in the
 * cage, gaps included) measured against the trailer's volume (12×6 ft × 1.2 m
 * cage ≈ 8.0 m³). Weight: each item has a typical weight, because the tip
 * charges per tonne and the trailer has a legal payload limit.
 *
 * Volumes and weights are typical-size estimates — check them against real
 * loads and adjust here.
 */

export type Prices = { full: number; three_quarter: number; half: number; quarter: number };

export type SurchargeKey = "mattress" | "tyre" | "gas_appliance" | "ewaste";

/** Per-item tip fees on top of the load price (from the council fee schedule). */
export const SURCHARGES: { key: SurchargeKey; label: string; hint: string }[] = [
  { key: "mattress", label: "Mattress / bed base", hint: "per mattress or ensemble base" },
  { key: "tyre", label: "Tyre", hint: "per car tyre (off rim)" },
  { key: "gas_appliance", label: "Fridge / freezer / air-con", hint: "per appliance with refrigerant gas" },
  { key: "ewaste", label: "E-waste (TV, computer)", hint: "per item" },
];

export type PricingConfig = {
  prices: Prices;
  trailer: { lengthM: number; widthM: number; heightM: number; atmKg: number; tareKg: number | null };
  /** Tip rate per tonne. null = not set yet. */
  tipRatePerTonne: number | null;
  /** Tip weight already covered by the full-load price. null = no weight surcharge. */
  includedKgFullLoad: number | null;
  itemFees: Partial<Record<SurchargeKey, number | null>>;
};

export const DEFAULT_TRAILER = { lengthM: 3.66, widthM: 1.83, heightM: 1.2, atmKg: 2000, tareKg: null };

export type CategoryKey = "furniture" | "appliances" | "garden" | "boxes" | "reno";

export const CATEGORIES: { key: CategoryKey; label: string; colour: string }[] = [
  { key: "furniture", label: "Furniture", colour: "#0f766e" },
  { key: "appliances", label: "Appliances", colour: "#0ea5e9" },
  { key: "garden", label: "Garden & outdoor", colour: "#65a30d" },
  { key: "boxes", label: "Boxes & bags", colour: "#d97706" },
  { key: "reno", label: "Reno & heavy", colour: "#7c3aed" },
];

export type Item = {
  id: string;
  name: string;
  category: CategoryKey;
  /** Loaded volume in m³ */
  m3: number;
  /** Typical weight in kg */
  kg: number;
  surcharge?: SurchargeKey;
};

export const ITEMS: Item[] = [
  // Furniture
  { id: "couch3", name: "3-seater couch", category: "furniture", m3: 1.4, kg: 45 },
  { id: "couch2", name: "2-seater couch", category: "furniture", m3: 1.0, kg: 35 },
  { id: "modular", name: "Corner / modular lounge", category: "furniture", m3: 2.5, kg: 80 },
  { id: "armchair", name: "Armchair / recliner", category: "furniture", m3: 0.6, kg: 30 },
  { id: "mattressQ", name: "Queen / king mattress", category: "furniture", m3: 0.8, kg: 35, surcharge: "mattress" },
  { id: "mattressS", name: "Single / double mattress", category: "furniture", m3: 0.5, kg: 22, surcharge: "mattress" },
  { id: "ensemble", name: "Ensemble / bed base", category: "furniture", m3: 0.6, kg: 35, surcharge: "mattress" },
  { id: "bedframe", name: "Bed frame (dismantled)", category: "furniture", m3: 0.4, kg: 30 },
  { id: "wardrobe", name: "Wardrobe", category: "furniture", m3: 0.9, kg: 60 },
  { id: "drawers", name: "Chest of drawers", category: "furniture", m3: 0.4, kg: 40 },
  { id: "bedside", name: "Bedside table", category: "furniture", m3: 0.12, kg: 12 },
  { id: "table", name: "Dining table", category: "furniture", m3: 0.6, kg: 40 },
  { id: "chair", name: "Dining chair", category: "furniture", m3: 0.15, kg: 6 },
  { id: "desk", name: "Desk", category: "furniture", m3: 0.45, kg: 30 },
  { id: "shelf", name: "Bookshelf / TV unit", category: "furniture", m3: 0.4, kg: 35 },
  { id: "coffee", name: "Coffee table", category: "furniture", m3: 0.25, kg: 15 },

  // Appliances
  { id: "fridge", name: "Fridge / upright freezer", category: "appliances", m3: 0.9, kg: 70, surcharge: "gas_appliance" },
  { id: "chestfreezer", name: "Chest freezer", category: "appliances", m3: 0.6, kg: 45, surcharge: "gas_appliance" },
  { id: "aircon", name: "Split-system air-con", category: "appliances", m3: 0.35, kg: 45, surcharge: "gas_appliance" },
  { id: "washer", name: "Washing machine", category: "appliances", m3: 0.33, kg: 70 },
  { id: "dryer", name: "Dryer / dishwasher", category: "appliances", m3: 0.3, kg: 40 },
  { id: "oven", name: "Oven / stove", category: "appliances", m3: 0.35, kg: 55 },
  { id: "tv", name: "TV", category: "appliances", m3: 0.15, kg: 15, surcharge: "ewaste" },
  { id: "computer", name: "Computer / monitor / printer", category: "appliances", m3: 0.08, kg: 8, surcharge: "ewaste" },
  { id: "bbq", name: "BBQ (no gas bottle)", category: "appliances", m3: 0.6, kg: 40 },
  { id: "small", name: "Microwave / small appliance", category: "appliances", m3: 0.06, kg: 10 },
  { id: "hws", name: "Hot water system", category: "appliances", m3: 0.3, kg: 50 },

  // Garden & outdoor
  { id: "greenbin", name: "Wheelie bin of green waste", category: "garden", m3: 0.24, kg: 30 },
  { id: "fronds", name: "Palm fronds / branches (armful)", category: "garden", m3: 0.5, kg: 20 },
  { id: "outdoorset", name: "Outdoor table + 4 chairs", category: "garden", m3: 1.2, kg: 50 },
  { id: "trampoline", name: "Trampoline (dismantled)", category: "garden", m3: 0.8, kg: 60 },
  { id: "play", name: "Swing set / play equipment", category: "garden", m3: 0.8, kg: 40 },
  { id: "mower", name: "Lawn mower", category: "garden", m3: 0.25, kg: 30 },
  { id: "tyre", name: "Car tyre", category: "garden", m3: 0.1, kg: 9, surcharge: "tyre" },

  // Boxes & bags
  { id: "box", name: "Moving box", category: "boxes", m3: 0.07, kg: 12 },
  { id: "bag", name: "Rubbish bag (70 L)", category: "boxes", m3: 0.07, kg: 6 },
  { id: "suitcase", name: "Suitcase / storage tub", category: "boxes", m3: 0.08, kg: 8 },
  { id: "bike", name: "Bike", category: "boxes", m3: 0.3, kg: 13 },

  // Reno & heavy
  { id: "carpet", name: "Carpet + underlay (one bedroom)", category: "reno", m3: 0.4, kg: 40 },
  { id: "timber", name: "Timber offcuts (armful)", category: "reno", m3: 0.3, kg: 40 },
  { id: "cabinets", name: "Kitchen cabinets (small kitchen)", category: "reno", m3: 2.0, kg: 200 },
  { id: "vanity", name: "Bathroom vanity", category: "reno", m3: 0.4, kg: 40 },
  { id: "door", name: "Internal door", category: "reno", m3: 0.08, kg: 20 },
  { id: "plaster", name: "Plasterboard sheet", category: "reno", m3: 0.03, kg: 25 },
  { id: "rubble", name: "Wheelbarrow of tiles / rubble", category: "reno", m3: 0.08, kg: 130 },
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

export type Estimate = {
  m3: number;
  kg: number;
  share: number;
  fullLoads: number;
  remainderTier: (typeof TIERS)[number] | null;
  label: string;
  loadPrice: number;
  /** Extra tip cost for weight beyond what the load price covers */
  weightCharge: number;
  itemFees: { key: SurchargeKey; label: string; count: number; each: number | null }[];
  itemFeesKnown: number;
  /** Item fees still to be confirmed (rate not set yet) */
  itemFeesPending: boolean;
  /** Trips needed if the load is limited by weight rather than space */
  tripsByWeight: number | null;
  tripsBySpace: number;
  total: number;
};

const EMPTY: Omit<Estimate, "itemFees"> = {
  m3: 0, kg: 0, share: 0, fullLoads: 0, remainderTier: null, label: "Nothing yet", loadPrice: 0, weightCharge: 0,
  itemFeesKnown: 0, itemFeesPending: false, tripsByWeight: null, tripsBySpace: 0, total: 0,
};

export function estimate(counts: Record<string, number>, cfg: PricingConfig): Estimate {
  const chosen = ITEMS.filter((i) => counts[i.id]);
  if (!chosen.length) return { ...EMPTY, itemFees: [] };

  const m3 = chosen.reduce((a, i) => a + i.m3 * counts[i.id], 0);
  const kg = chosen.reduce((a, i) => a + i.kg * counts[i.id], 0);
  const share = m3 / trailerM3(cfg.trailer);

  // Space → load price (rounded up to the next quarter load)
  const fullLoads = Math.floor(share + 1e-9);
  const rest = share - fullLoads;
  const remainderTier = rest > 1e-9 ? TIERS.find((t) => rest <= t.max + 1e-9) ?? TIERS[3] : null;
  const loadPrice = fullLoads * cfg.prices.full + (remainderTier ? cfg.prices[remainderTier.key] : 0);
  const loadFraction = fullLoads + (remainderTier?.max ?? 0);
  const parts: string[] = [];
  if (fullLoads) parts.push(fullLoads === 1 ? "1 full load" : `${fullLoads} full loads`);
  if (remainderTier) parts.push(remainderTier.label.toLowerCase());
  const label = parts.join(" + ");

  // Weight → tip surcharge for heavy loads
  let weightCharge = 0;
  if (cfg.tipRatePerTonne && cfg.includedKgFullLoad !== null) {
    const included = cfg.includedKgFullLoad * loadFraction;
    weightCharge = Math.max(0, kg - included) * (cfg.tipRatePerTonne / 1000);
  }

  // Per-item tip fees
  const itemFees = SURCHARGES.map((s) => ({
    key: s.key,
    label: s.label,
    count: chosen.filter((i) => i.surcharge === s.key).reduce((a, i) => a + counts[i.id], 0),
    each: cfg.itemFees[s.key] ?? null,
  })).filter((f) => f.count > 0);
  const itemFeesKnown = itemFees.reduce((a, f) => a + (f.each ?? 0) * f.count, 0);
  const itemFeesPending = itemFees.some((f) => f.each === null);

  const payload = payloadKg(cfg.trailer);
  const tripsBySpace = Math.max(1, Math.ceil(share - 1e-9));
  const tripsByWeight = payload ? Math.max(1, Math.ceil(kg / payload)) : null;

  const round = (n: number) => Math.round(n);
  return {
    m3,
    kg,
    share,
    fullLoads,
    remainderTier,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    loadPrice,
    weightCharge: round(weightCharge),
    itemFees,
    itemFeesKnown: round(itemFeesKnown),
    itemFeesPending,
    tripsByWeight,
    tripsBySpace,
    total: loadPrice + round(weightCharge) + round(itemFeesKnown),
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
