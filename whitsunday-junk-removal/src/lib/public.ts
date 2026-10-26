import "server-only";
import { DEFAULT_TRAILER, type PricingConfig } from "./junk-pricing";
import { createAdminClient } from "./supabase/server";

export type PublicInfo = {
  businessName: string;
  phone: string | null;
  email: string | null;
  abn: string | null;
  prices: { full: number; three_quarter: number; half: number; quarter: number };
  googleProfileUrl: string | null;
  insured: boolean;
  insuranceNote: string | null;
  hours: string | null;
  gallery: { before: string; after: string; suburb: string | null }[];
  pricing: PricingConfig;
};

const FALLBACK: PublicInfo = {
  businessName: "Whitsunday Junk Removal",
  phone: null,
  email: null,
  abn: null,
  prices: { full: 650, three_quarter: 500, half: 330, quarter: 180 },
  googleProfileUrl: null,
  insured: false,
  insuranceNote: null,
  hours: null,
  gallery: [],
  pricing: {
    prices: { full: 650, three_quarter: 500, half: 330, quarter: 180 },
    trailer: DEFAULT_TRAILER,
    tipRatePerTonne: null,
    includedKgFullLoad: null,
    itemFees: {},
  },
};

/** Public-safe business details for the marketing site (never bank details). */
export async function getPublicInfo(): Promise<PublicInfo> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return FALLBACK;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("settings")
      .select("business_name, phone, email, abn, price_full, price_three_quarter, price_half, price_quarter, google_profile_url, insured, insurance_note, business_hours, trailer_length_m, trailer_width_m, trailer_height_m, trailer_atm_kg, trailer_tare_kg, tip_rate_per_tonne, tip_included_kg_full_load, tip_item_fees")
      .eq("id", 1)
      .single();
    if (!data) return FALLBACK;
    return {
      businessName: data.business_name,
      phone: data.phone,
      email: data.email,
      abn: data.abn,
      prices: {
        full: Number(data.price_full),
        three_quarter: Number(data.price_three_quarter),
        half: Number(data.price_half),
        quarter: Number(data.price_quarter),
      },
      googleProfileUrl: data.google_profile_url,
      insured: data.insured,
      insuranceNote: data.insurance_note,
      hours: data.business_hours,
      gallery: await loadGallery(admin),
      pricing: {
        prices: {
          full: Number(data.price_full),
          three_quarter: Number(data.price_three_quarter),
          half: Number(data.price_half),
          quarter: Number(data.price_quarter),
        },
        trailer: {
          lengthM: Number(data.trailer_length_m),
          widthM: Number(data.trailer_width_m),
          heightM: Number(data.trailer_height_m),
          atmKg: Number(data.trailer_atm_kg),
          tareKg: data.trailer_tare_kg,
        },
        tipRatePerTonne: data.tip_rate_per_tonne === null ? null : Number(data.tip_rate_per_tonne),
        includedKgFullLoad: data.tip_included_kg_full_load,
        itemFees: data.tip_item_fees ?? {},
      },
    };
  } catch {
    return FALLBACK;
  }
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Jobs with at least one before AND one after photo ticked "Show on website". */
async function loadGallery(admin: ReturnType<typeof createAdminClient>): Promise<PublicInfo["gallery"]> {
  const { data } = await admin
    .from("job_photos")
    .select("job_id, kind, storage_path, created_at, jobs(address)")
    .eq("show_on_website", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (!data?.length) return [];

  const byJob = new Map<string, { before?: string; after?: string; address: string | null }>();
  for (const p of data as unknown as { job_id: string; kind: "before" | "after"; storage_path: string; jobs: { address: string | null } | null }[]) {
    const e = byJob.get(p.job_id) ?? { address: p.jobs?.address ?? null };
    if (!e[p.kind]) e[p.kind] = p.storage_path;
    byJob.set(p.job_id, e);
  }
  const pairs = [...byJob.values()].filter((e) => e.before && e.after).slice(0, 6);
  if (!pairs.length) return [];

  // Signed links last a day; the page re-renders every 5 minutes so they never go stale.
  const paths = pairs.flatMap((p) => [p.before!, p.after!]);
  const { data: signed } = await admin.storage.from("job-photos").createSignedUrls(paths, 86400);
  const url = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return pairs
    .filter((p) => url.get(p.before!) && url.get(p.after!))
    .map((p) => ({
      before: url.get(p.before!)!,
      after: url.get(p.after!)!,
      // Only the suburb (last part of the address) — never a street address.
      suburb: suburbOnly(p.address),
    }));
}

function suburbOnly(address: string | null): string | null {
  const last = address?.split(",").pop()?.trim();
  // Anything with a number in it is probably a street address — don't publish it.
  return last && !/\d/.test(last) ? last : null;
}
