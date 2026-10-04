import type { MetadataRoute } from "next";

import { SITE_URL, allowIndexing } from "@/lib/site";

// /api/events.ics stays crawlable: calendar apps subscribe to it directly.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
