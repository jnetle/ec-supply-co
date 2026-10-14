import type { Metadata } from "next";
import { Caveat, Rubik } from "next/font/google";
import localFont from "next/font/local";

import {
  SHARE_IMAGE,
  allowIndexing,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

import { InkRoughFilter } from "@/components/site/ink-rough-filter";

import "./globals.css";

// Exposed as CSS variables so globals.css can bind them to the --font-*
// theme tokens; nothing references these families by name.
// The site's sans. Regular for body text; SemiBold for headings, buttons and
// labels; ExtraBold for the mixed-case headlines beside the all-caps Grit
// Thick titles, which share its weight and round O. Variable, so every weight
// comes from one file.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

// Texture Fonts' Grit Thick: one weight, capitals only, no en/em dash, ellipsis
// or middle dot. Used via --font-hero for the homepage wordmark and via
// --font-display wherever titles are set in capitals.
const gritThick = localFont({
  variable: "--font-grit-thick",
  src: "./fonts/grit-thick.woff2",
  display: "swap",
  // Missing glyphs fall through to Rubik via --font-display, not to the
  // adjusted Arial next/font would otherwise slot in first.
  adjustFontFallback: false,
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
      className={`${caveat.variable} ${rubik.variable} ${gritThick.variable}`}
    >
      <body>
        <InkRoughFilter />
        {children}
      </body>
    </html>
  );
}
