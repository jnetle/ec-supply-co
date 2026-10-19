import type { MetadataRoute } from "next";

import { SITE_URL, allowIndexing } from "@/lib/site";

// /api/events.ics isn't disallowed, in case a calendar app's fetcher honours
// robots.txt; its own X-Robots-Tag header keeps it out of search results.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
