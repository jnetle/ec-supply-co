import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";
import { SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: { absolute: `${SITE_NAME} · Local makers shop in El Cerrito, CA` },
  description: SITE_DESCRIPTION,
  path: "/",
});

// Picks up maker edits in the Wix CMS, turns the daily maker spotlight over,
// and rolls the upcoming events forward, within five minutes.
export const revalidate = 300;

export default function Page() {
  return <HomePage />;
}
