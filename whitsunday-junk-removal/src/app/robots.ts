import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/no-access", "/auth"] },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
