import type { Metadata } from "next";

import { vercel } from "@/lib/env";

export const SITE_URL = "https://www.elcerritosupplyco.com";
export const SITE_NAME = "El Cerrito Supply Co.";
export const SITE_EMAIL = "info@elcerritosupplyco.com";
export const SITE_DESCRIPTION =
  "Local makers, a tool library and a place to sit down, built by neighbors at 7523A Fairmount Ave in El Cerrito.";

/**
 * The link-preview image for every page: the logo lockup and address,
 * rendered by `npm run og:image`. Keep the size and alt text in step with it.
 */
export const SHARE_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "El Cerrito Supply Co., 7523A Fairmount Ave, El Cerrito, CA",
};

/**
 * Whether search engines may index this deployment: only the production
 * build, and only once a custom domain is attached in Vercel. Until then the
 * site stays hidden, so Google never lists the vercel.app address. Read at
 * build time — redeploy after attaching the domain.
 */
export function allowIndexing(): boolean {
  const host = vercel.productionHost();
  // Vercel reports the shortest domain attached to production, counting
  // redirect-only domains, so this can be any of them rather than SITE_URL's.
  // Redirect domains never serve pages, so any custom domain will do.
  return (
    vercel.isProduction() &&
    host !== undefined &&
    !host.endsWith(".vercel.app")
  );
}

type PageMetadataInput = {
  /**
   * Filled into the layout's "%s · El Cerrito Supply Co." template. Pass
   * `{ absolute }` for a title that skips it, as the home page does.
   */
  title: string | { absolute: string };
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
  const fullTitle =
    typeof title === "string" ? `${title} · ${SITE_NAME}` : title.absolute;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
  };
}
