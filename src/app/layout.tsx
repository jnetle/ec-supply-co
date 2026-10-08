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

// Output levels for 33 evenly spaced inputs (0, 1/32 … 1). Black starts
// lifted to 8% for a matte finish. Very dark hair sits in the bottom ~6% of
// a photo, so the curve is steepest there to pull those tones apart, then
// meets the straight line at 50%. It lifts the darker mids as a side effect,
// which .washed offsets with its contrast. Below 50% it is
// 0.5·(2x)^0.7 + 0.08·(1 − 2x).
const SHADOW_CURVE =
  "0.08 0.147 0.187 0.22 0.249 0.276 0.302 0.325 0.348 0.369 0.39 0.41 0.429 " +
  "0.447 0.465 0.483 0.5 0.531 0.562 0.594 0.625 0.656 0.688 0.719 0.75 0.781 " +
  "0.812 0.844 0.875 0.906 0.938 0.969 1";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${bitter.variable} ${caveat.variable}`}
    >
      <body>
        {/* Filters referenced from CSS by id; see .washed in globals.css. */}
        <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
          <filter id="ecs-lift-shadows" colorInterpolationFilters="sRGB">
            {/* Stretches only the darkest tones (black hair, dark clothing)
                so their detail survives the low-contrast wash that follows.
                The curve rejoins the identity line at 50%, leaving skin
                tones and highlights untouched. */}
            <feComponentTransfer>
              <feFuncR type="table" tableValues={SHADOW_CURVE} />
              <feFuncG type="table" tableValues={SHADOW_CURVE} />
              <feFuncB type="table" tableValues={SHADOW_CURVE} />
            </feComponentTransfer>
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
