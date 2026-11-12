/**
 * The site's public address, no trailing slash. Set NEXT_PUBLIC_SITE_URL in
 * Netlify; otherwise Netlify's own build variable (URL) is used, so links,
 * the sitemap and canonical tags never point at localhost on the live site.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");
