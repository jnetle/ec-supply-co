import type { MetadataRoute } from "next";

import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";
import { MANIFESTO_ENABLED } from "@/lib/content/manifesto";
import { SITE_URL } from "@/lib/site";

type Route = {
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

// Every page on the site. Add new routes here as they ship.
const ROUTES: Route[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/makers", changeFrequency: "weekly", priority: 0.8 },
  { path: "/calendar", changeFrequency: "weekly", priority: 0.8 },
  ...(MANIFESTO_ENABLED
    ? [
        {
          path: "/manifesto",
          changeFrequency: "monthly",
          priority: 0.5,
        } as const,
      ]
    : []),
  ...(HOST_WITH_US_ENABLED
    ? [
        {
          path: "/host-with-us",
          changeFrequency: "monthly",
          priority: 0.6,
        } as const,
      ]
    : []),
  { path: "/sell-with-us", changeFrequency: "monthly", priority: 0.6 },
  { path: "/the-build", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.1 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency,
    priority,
  }));
}
