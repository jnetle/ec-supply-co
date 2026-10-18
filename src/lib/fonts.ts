import { Figtree, Hammersmith_One } from "next/font/google";

// Exposed as CSS variables so globals.css can bind them to the --font-*
// theme tokens; nothing references these families by name.
// The site's sans, chosen to sit quietly beside Hammersmith One. Regular for
// body text; SemiBold for headings, buttons and labels; ExtraBold for the
// mixed-case headlines still set in it. Variable, so every weight comes from
// one file.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  // Italic for the homepage marquee and the events' host and board lines.
  style: ["normal", "italic"],
});

// Hammersmith One: one weight. Used via --font-hero for the homepage
// wordmark and via --font-display wherever titles are set in capitals.
const hammersmith = Hammersmith_One({
  variable: "--font-hammersmith",
  subsets: ["latin"],
  weight: "400",
});

/** For the <html> of every document: the root layout and global-error. */
export const FONT_VARIABLES = `${figtree.variable} ${hammersmith.variable}`;
