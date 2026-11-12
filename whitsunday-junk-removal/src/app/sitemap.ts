import type { MetadataRoute } from "next";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;
  return [
    { url: site, changeFrequency: "monthly", priority: 1 },
    ...LANDING_PAGES.map((p) => ({ url: `${site}/${p.slug}`, changeFrequency: "monthly" as const, priority: p.kind === "area" ? 0.9 : 0.8 })),
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
