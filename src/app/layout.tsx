import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Figtree, Hammersmith_One, Playfair_Display } from "next/font/google";

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
// The site's sans, chosen to sit quietly beside Hammersmith One. Regular for
// body text; SemiBold for headings, buttons and labels; ExtraBold for the
// mixed-case headlines still set in it. Variable, so every weight comes from
// one file.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  // Italic for the homepage marquee.
  style: ["normal", "italic"],
});

// Hammersmith One: one weight. Used via --font-hero for the homepage
// wordmark and via --font-display wherever titles are set in capitals.
const hammersmith = Hammersmith_One({
  variable: "--font-hammersmith",
  subsets: ["latin"],
  weight: "400",
});

// Playfair Display: the vintage storefront serif that sits beside the cursive
// tagline in the logo. Italic for the event host and board lines. Variable,
// so no weights listed.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      className={`${figtree.variable} ${hammersmith.variable} ${playfair.variable}`}
    >
      <body>
        {children}
        {/* Cookieless page views; see /privacy. */}
        <Analytics />
      </body>
    </html>
  );
}
