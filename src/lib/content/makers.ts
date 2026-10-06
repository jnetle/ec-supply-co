/**
 * The maker roster's shape, loaded from the Wix `LocalMakers` collection (see
 * src/lib/makers.ts). `featured` picks the makers shown in the home page
 * spotlight.
 */

export type Maker = {
  id: string;
  /** The shop or studio name, shown as the card heading. */
  name: string;
  /** The person behind it, when that differs from `name`. */
  makerName?: string;
  craft: string;
  /** Year they started making. */
  since?: number;
  bio: string;
  photo?: { src: string; alt: string };
  website?: string;
  featured?: boolean;
};

/** "Ceramics · since 2019", skipping whichever half the CMS left blank. */
export function makerByline(maker: Maker) {
  return [maker.craft, maker.since && `since ${maker.since}`]
    .filter(Boolean)
    .join(" · ");
}

/**
 * The four organic mask shapes, cycled by card index so neighbouring
 * portraits never share a silhouette.
 */
export const MAKER_RADII = [
  "48% 52% 38% 62% / 56% 42% 58% 44%",
  "62% 38% 58% 42% / 42% 60% 40% 58%",
  "38% 62% 46% 54% / 58% 44% 56% 42%",
  "54% 46% 42% 58% / 46% 54% 46% 54%",
];

/** Staggers each portrait's morph so the grid doesn't pulse in unison. */
export function makerMorphDelay(index: number) {
  return `${(-(index * 2.3) % 18).toFixed(1)}s`;
}
