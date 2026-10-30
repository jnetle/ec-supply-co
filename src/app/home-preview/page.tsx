import type { Metadata } from "next";
import { connection } from "next/server";

import { HomePage } from "@/components/home/home-page";
import { SITE_NAME, pageMetadata } from "@/lib/site";

// Served for /?preview=events (a rewrite in next.config.ts), so the real home
// page stays a static page that reads no query string.
export const metadata: Metadata = {
  ...pageMetadata({
    title: { absolute: `Preview · ${SITE_NAME}` },
    description: "A preview of the home page with Wix events.",
    path: "/",
  }),
  robots: { index: false, follow: false },
};

export default async function HomePreviewPage() {
  // Rendered per request, so an event edited in Wix shows on the next reload.
  await connection();
  return <HomePage previewEvents />;
}
