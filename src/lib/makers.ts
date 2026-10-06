import "server-only";

import { cache } from "react";

import type { Maker } from "@/lib/content/makers";
import { getWixClient } from "@/lib/wix";
import { WIX_MEDIA } from "@/lib/wix-media";

/** The Wix CMS collection ID, from the collection's settings in the dashboard. */
const LOCAL_MAKERS_COLLECTION = "LocalMakers";

/** How many makers the home page spotlight shows. */
const SPOTLIGHT_SIZE = 4;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

// Editors type addresses by hand: "rosaceramics.com" would otherwise become a
// relative link, and anything that isn't http(s) has no place in an href.
function websiteUrl(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
  try {
    const url = new URL(hasScheme ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

// CMS fields can be left blank, so every one is checked rather than trusted.
function fromWix(item: Record<string, unknown>): Maker | undefined {
  const name = text(item.title);
  if (!name) return undefined;

  const image = item.image as { id?: unknown; altText?: unknown } | undefined;
  const imageId = text(image?.id);
  const makerName = text(item.makerName);

  return {
    id: String(item._id),
    name,
    makerName: makerName === name ? undefined : makerName,
    craft: text(item.category) ?? "",
    since: typeof item.since === "number" ? item.since : undefined,
    bio: text(item.description) ?? "",
    // The original upload rather than Wix's pre-cropped URL; WixImage asks
    // Wix's CDN for each size the page needs.
    photo: imageId
      ? {
          src: `${WIX_MEDIA}${imageId}`,
          alt: text(image?.altText) ?? `Portrait of ${name}`,
        }
      : undefined,
    website: websiteUrl(item.website),
    featured: item.featured === true,
  };
}

/**
 * Every maker from Wix, in the order they were added. If Wix is unreachable or
 * unconfigured, the roster comes back empty rather than failing the page.
 * Memoized per request, since the home page asks for it twice.
 */
export const getMakers = cache(async (): Promise<Maker[]> => {
  try {
    const { items } = await getWixClient()
      .items.query(LOCAL_MAKERS_COLLECTION)
      .ascending("_createdDate")
      .limit(1000)
      .find();
    return items.map(fromWix).filter((maker) => maker !== undefined);
  } catch (error) {
    console.error(`Loading the ${LOCAL_MAKERS_COLLECTION} collection failed`, error);
    return [];
  }
});

/** The featured makers, topped up from the rest of the roster if too few are. */
export async function getSpotlightMakers(): Promise<Maker[]> {
  const makers = await getMakers();
  const featured = makers.filter((maker) => maker.featured);
  const rest = makers.filter((maker) => !maker.featured);

  return [...featured, ...rest].slice(0, SPOTLIGHT_SIZE);
}
