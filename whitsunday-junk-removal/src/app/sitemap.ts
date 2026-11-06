import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;
  return [
    { url: site, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
