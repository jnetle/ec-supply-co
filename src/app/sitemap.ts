import type { MetadataRoute } from "next";

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
  { path: "/manifesto", changeFrequency: "monthly", priority: 0.5 },
  { path: "/private-events", changeFrequency: "monthly", priority: 0.6 },
  { path: "/sell-with-us", changeFrequency: "monthly", priority: 0.6 },
  { path: "/the-build", changeFrequency: "monthly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency,
    priority,
  }));
}
