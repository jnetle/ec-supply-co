import type { Metadata } from "next";

import { vercel } from "@/lib/env";

export const SITE_URL = "https://www.elcerritosupplyco.com";
export const SITE_NAME = "El Cerrito Supply Co.";
export const SITE_EMAIL = "hello@elcerritosupplyco.com";
export const SITE_DESCRIPTION =
  "Built by neighbors, at 7523 A Fairmount Ave in El Cerrito. Local makers, workshops, a tool library and a place to sit down.";

/**
 * The link-preview image for every page. Temporary until the wordmark is
 * settled: replace public/og-image.jpg (ideally 1200×630) and update the
 * size and alt text here.
 */
export const SHARE_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 900,
  alt: "The El Cerrito Supply Co. storefront on Fairmount Ave",
};

/**
 * Whether search engines may index this deployment: only the production
 * build, and only once it is served on SITE_URL's domain. Until the domain is
 * attached in Vercel the site stays hidden, so Google never lists the
 * vercel.app address. Read at build time — redeploy after attaching the domain.
 */
export function allowIndexing(): boolean {
  return (
    vercel.isProduction() && vercel.productionHost() === new URL(SITE_URL).host
  );
}

type PageMetadataInput = {
  /** Omit on the home page so the layout's default title is used. */
  title?: string;
  description: string;
  /** Route path, e.g. "/makers". Resolved against `metadataBase`. */
  path: string;
};

/**
 * A page's metadata with its canonical URL and Open Graph tags filled in.
 * Segments merge metadata shallowly, so a page that sets `openGraph` replaces
 * the layout's whole object — this rebuilds every field, image included.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [SHARE_IMAGE],
    },
  };
}
