import type { Metadata } from "next";
import { Bitter, Caveat, Jost } from "next/font/google";

import {
  SHARE_IMAGE,
  allowIndexing,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

import "./globals.css";

// Exposed as CSS variables so globals.css can bind them to the --font-*
// theme tokens; nothing references these families by name.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${bitter.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
