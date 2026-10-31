import type { Metadata, Viewport } from "next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

import { Analytics } from "@/components/site/analytics";
import { vercel } from "@/lib/env";
import { FONT_VARIABLES } from "@/lib/fonts";
import {
  GA_MEASUREMENT_ID,
  SHARE_IMAGE,
  allowIndexing,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // No canonical here: it would be inherited by any page that forgets its
  // own, pointing that page at the home page. Pages set it via pageMetadata.
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE] },
  // Hidden from search until production is served on the real domain.
  robots: allowIndexing()
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

// Draws the page up under the iPhone status bar, so the sticky header can
// carry the awning to the top of the screen; see site-header.module.css.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={FONT_VARIABLES}>
      <body>
        {children}
        {/* Cookieless page views; see /privacy. */}
        <VercelAnalytics />
        {/* Production only, so previews and local runs stay out of the
            numbers. Asks first outside the US; see /privacy. */}
        {vercel.isProduction() && <Analytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
