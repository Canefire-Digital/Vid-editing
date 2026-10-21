import "server-only";
import { createAdminClient } from "./supabase/server";

export type PublicInfo = {
  businessName: string;
  phone: string | null;
  email: string | null;
  abn: string | null;
  prices: { full: number; three_quarter: number; half: number; quarter: number };
};

const FALLBACK: PublicInfo = {
  businessName: "Whitsunday Junk Removal",
  phone: null,
  email: null,
  abn: null,
  prices: { full: 650, three_quarter: 500, half: 330, quarter: 180 },
};

/** Public-safe business details for the marketing site (never bank details). */
export async function getPublicInfo(): Promise<PublicInfo> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return FALLBACK;
  try {
    const { data } = await createAdminClient()
      .from("settings")
      .select("business_name, phone, email, abn, price_full, price_three_quarter, price_half, price_quarter")
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
    };
  } catch {
    return FALLBACK;
  }
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
