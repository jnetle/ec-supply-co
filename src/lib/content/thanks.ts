/**
 * The people who helped set up the shop, credited on /the-build, and the photos
 * around the site that each photographer took.
 *
 * PLACEHOLDERS: the helpers named "… name" are stand-ins until the real names
 * and links come in. Replace them rather than adding alongside. The Lumber
 * Baron is real.
 */

export type Helper = {
  /** A slug: the helper's anchor on /the-build, and the key `PHOTO_CREDITS` uses. */
  id: string;
  name: string;
  /** What they helped with, e.g. "Photography" or "Shelving". */
  role: string;
  /** Their site or Instagram. */
  link?: { href: string; label: string };
};

export const HELPERS: Helper[] = [
  {
    id: "thelumberbaron",
    name: "The Lumber Baron",
    role: "Reclaimed wood",
    link: { href: "https://instagram.com/thelumberbaron", label: "Instagram" },
  },
  {
    id: "placeholder-photographer",
    name: "Photographer name",
    role: "Photography",
    link: { href: "https://instagram.com/", label: "Instagram" },
  },
  {
    id: "placeholder-builder",
    name: "Builder name",
    role: "Shelving + carpentry",
  },
  {
    id: "placeholder-painter",
    name: "Sign painter name",
    role: "Signage",
    link: { href: "https://example.com/", label: "Website" },
  },
];

/** A piece of the shop with a history: what it's made of and who found it. */
export type MadeOfEntry = {
  /** A slug, used as the entry's anchor on /the-build. */
  id: string;
  /** What the piece is, e.g. "The big table". */
  name: string;
  /** Where its materials came from. */
  provenance: string;
  /** The helpers who sourced or built it, by `Helper["id"]`. */
  helpers: Helper["id"][];
  photo?: { src: string; alt: string };
};

/**
 * The stories behind the shop's fixtures, shown above the helpers on /the-build.
 *
 * PLACEHOLDERS: the photos are Unsplash stand-ins until the real ones come in.
 */
export const MADE_OF: MadeOfEntry[] = [
  {
    id: "big-table",
    name: "The big table",
    provenance:
      "Made from reclaimed wood flooring from the Sears Factory in San Leandro.",
    helpers: ["thelumberbaron"],
    photo: {
      src: "https://images.unsplash.com/photo-1625744070229-bb3f58a97e03",
      alt: "A long table of weathered reclaimed wood with metal chairs in a workshop.",
    },
  },
  {
    id: "shelves",
    name: "The shelves",
    // TODO: where the wood came from, and who sourced it.
    provenance: "Built from reclaimed wood.",
    helpers: [],
    photo: {
      src: "https://images.unsplash.com/photo-1765835065498-5df7ae12bcf2",
      alt: "Tall wooden shelves lined with ceramics, behind a leafy plant.",
    },
  },
  {
    id: "window-sign",
    name: "The window sign",
    // TODO: the sign painter, once they're booked (add them to HELPERS).
    provenance: "Hand-painted on the glass, coming soon.",
    helpers: [],
    photo: {
      src: "https://images.unsplash.com/photo-1689643724283-2552a0f6b4d5",
      alt: "The word hello hand-lettered in yellow on a shop window.",
    },
  },
  {
    id: "address-numbers",
    name: "The address numbers",
    // TODO: who made them, if they'd like the credit (add them to HELPERS).
    provenance: "Made of ceramic.",
    helpers: [],
    photo: {
      src: "https://images.unsplash.com/photo-1779480391842-dfeeda2ca88e",
      alt: "A ceramic house number tile with a colorful mosaic border on a stucco wall.",
    },
  },
];

/**
 * Which helper took each photo, keyed by the image's `src` exactly as the page
 * passes it. A photo left out here simply shows no credit.
 */
export const PHOTO_CREDITS: Record<string, Helper["id"]> = {
  // "/assets/photos/id-42-1600-1000.jpg": "placeholder-photographer",
};

export function photoCredit(src: string | undefined): Helper | undefined {
  const id = src && PHOTO_CREDITS[src];
  return id ? HELPERS.find((helper) => helper.id === id) : undefined;
}
