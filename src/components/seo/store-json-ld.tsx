import { SHOP_ADDRESS } from "@/lib/content/nav";
import {
  SHARE_IMAGE,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/**
 * Describes the shop to search engines as a local store. Opening hours are
 * left out until they're decided: Google treats them as fact, and wrong
 * hours do more harm than none.
 */
export function StoreJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    email: SITE_EMAIL,
    image: new URL(SHARE_IMAGE.url, SITE_URL).toString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP_ADDRESS.street,
      addressLocality: SHOP_ADDRESS.locality,
      addressRegion: SHOP_ADDRESS.region,
      postalCode: SHOP_ADDRESS.postalCode,
      addressCountry: "US",
    },
    sameAs: [SHOP_ADDRESS.instagram],
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string in the payload can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
