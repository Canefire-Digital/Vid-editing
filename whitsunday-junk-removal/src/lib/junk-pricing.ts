/**
 * Website price estimator. Shares are fractions of one full trailer load —
 * rough averages, tune them as you learn your own loads.
 */

export type Prices = { full: number; three_quarter: number; half: number; quarter: number };

export type CategoryKey = "furniture" | "appliances" | "garden" | "boxes" | "reno";

export const CATEGORIES: { key: CategoryKey; label: string; colour: string }[] = [
  { key: "furniture", label: "Furniture", colour: "#0f766e" },
  { key: "appliances", label: "Appliances", colour: "#0ea5e9" },
  { key: "garden", label: "Garden & outdoor", colour: "#65a30d" },
  { key: "boxes", label: "Boxes & bags", colour: "#d97706" },
  { key: "reno", label: "Reno & other", colour: "#7c3aed" },
];

export type Item = {
  id: string;
  name: string;
  category: CategoryKey;
  share: number;
  /** Tips charge extra for some items — we flag it so nobody's surprised. */
  surcharge?: boolean;
};

export const ITEMS: Item[] = [
  { id: "couch3", name: "3-seater couch", category: "furniture", share: 0.18 },
  { id: "couch2", name: "2-seater / armchair", category: "furniture", share: 0.1 },
  { id: "mattressQ", name: "Queen / king mattress", category: "furniture", share: 0.1, surcharge: true },
  { id: "mattressS", name: "Single mattress", category: "furniture", share: 0.07, surcharge: true },
  { id: "bedbase", name: "Bed base / frame", category: "furniture", share: 0.08 },
  { id: "wardrobe", name: "Wardrobe", category: "furniture", share: 0.15 },
  { id: "drawers", name: "Chest of drawers", category: "furniture", share: 0.07 },
  { id: "table", name: "Dining table", category: "furniture", share: 0.1 },
  { id: "chair", name: "Dining chair", category: "furniture", share: 0.02 },
  { id: "desk", name: "Desk", category: "furniture", share: 0.07 },
  { id: "shelf", name: "Bookshelf / TV unit", category: "furniture", share: 0.06 },

  { id: "fridge", name: "Fridge / freezer", category: "appliances", share: 0.12, surcharge: true },
  { id: "washer", name: "Washing machine", category: "appliances", share: 0.06 },
  { id: "dryer", name: "Dryer / dishwasher", category: "appliances", share: 0.05 },
  { id: "tv", name: "TV", category: "appliances", share: 0.03 },
  { id: "aircon", name: "Air-con unit", category: "appliances", share: 0.04, surcharge: true },
  { id: "bbq", name: "BBQ", category: "appliances", share: 0.06 },
  { id: "small", name: "Small appliance", category: "appliances", share: 0.01 },

  { id: "greenbag", name: "Bag of green waste", category: "garden", share: 0.03 },
  { id: "fronds", name: "Palm fronds / branches (bundle)", category: "garden", share: 0.06 },
  { id: "outdoorset", name: "Outdoor table setting", category: "garden", share: 0.12 },
  { id: "trampoline", name: "Trampoline", category: "garden", share: 0.15 },
  { id: "mower", name: "Lawn mower", category: "garden", share: 0.04 },
  { id: "tyre", name: "Tyre", category: "garden", share: 0.03, surcharge: true },

  { id: "box", name: "Moving box", category: "boxes", share: 0.015 },
  { id: "bag", name: "Bag of household rubbish", category: "boxes", share: 0.02 },
  { id: "suitcase", name: "Suitcase / tub", category: "boxes", share: 0.02 },
  { id: "bike", name: "Bike / kids toys", category: "boxes", share: 0.04 },

  { id: "carpet", name: "Carpet (one room)", category: "reno", share: 0.08 },
  { id: "timber", name: "Timber offcuts (bundle)", category: "reno", share: 0.05 },
  { id: "cabinets", name: "Kitchen cabinets", category: "reno", share: 0.2 },
  { id: "vanity", name: "Bathroom vanity", category: "reno", share: 0.05 },
  { id: "door", name: "Door / panel", category: "reno", share: 0.03 },
];

export const TIERS = [
  { key: "quarter", label: "Quarter load", max: 0.25 },
  { key: "half", label: "Half load", max: 0.5 },
  { key: "three_quarter", label: "3/4 load", max: 0.75 },
  { key: "full", label: "Full load", max: 1 },
] as const;

export type Estimate = {
  share: number;
  fullLoads: number;
  remainderTier: (typeof TIERS)[number] | null;
  label: string;
  price: number;
};

/** Rounds a load up to the next quarter and prices it from the load rates. */
export function estimate(share: number, prices: Prices): Estimate {
  if (share <= 0) return { share: 0, fullLoads: 0, remainderTier: null, label: "Nothing yet", price: 0 };
  const fullLoads = Math.floor(share + 1e-9);
  const rest = share - fullLoads;
  const remainderTier = rest > 1e-9 ? TIERS.find((t) => rest <= t.max + 1e-9) ?? TIERS[3] : null;
  const price = fullLoads * prices.full + (remainderTier ? prices[remainderTier.key] : 0);
  const parts: string[] = [];
  if (fullLoads) parts.push(fullLoads === 1 ? "1 full load" : `${fullLoads} full loads`);
  if (remainderTier) parts.push(remainderTier.label.toLowerCase());
  const label = parts.join(" + ");
  return { share, fullLoads, remainderTier, label: label.charAt(0).toUpperCase() + label.slice(1), price };
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
