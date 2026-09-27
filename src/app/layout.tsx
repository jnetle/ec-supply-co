import type { Metadata } from "next";
import { Bitter, Caveat, Jost } from "next/font/google";

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
  title: {
    default: "El Cerrito Supply Co.",
    template: "%s · El Cerrito Supply Co.",
  },
  description:
    "Built by neighbors, at 7523 Fairmount Ave in El Cerrito. Local makers, workshops, a tool library and a place to sit down.",
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
