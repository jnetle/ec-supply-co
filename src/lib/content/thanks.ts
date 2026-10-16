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
    id: "rachel",
    name: "Rachel",
    role: "Community builder, El Cerrito superfan. @thelittlehill",
    link: { href: "https://www.instagram.com/thelittlehill/", label: "Instagram" },
  },
  {
    id: "thelumberbaron",
    name: "The Lumber Baron",
    role: "Reclaimed wood for the big table + shelves",
    link: { href: "https://thelumberbaron.com/", label: "Website" },
  },
  {
    id: "stephanie-dolen",
    name: "Stephanie Dolen",
    role: "Photography",
    link: { href: "https://www.stephaniedolen.com/", label: "Website" },
  },
  {
    id: "placeholder-builder",
    name: "Builder name",
    role: "Shelving + carpentry",
  },
  {
    id: "heather-hardison",
    name: "Heather Hardison",
    role: "Window sign design + painting",
    link: { href: "https://www.instagram.com/heather_hardison/", label: "Instagram" },
  },
  {
    id: "rookie-ceramics",
    name: "Rookie Ceramics",
    role: "Ceramic address numbers",
    link: { href: "https://www.instagram.com/rookie.ceramics", label: "Instagram" },
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
  /** How the helpers are credited, e.g. "Built by" or "Sourced by". */
  creditedAs: string;
  /** The helpers who sourced or built it, by `Helper["id"]`. */
  helpers: Helper["id"][];
  photo?: { src: string; alt: string };
};

/**
 * The stories behind the shop's fixtures, shown above the helpers on /the-build.
 */
export const MADE_OF: MadeOfEntry[] = [
  {
    id: "big-table",
    name: "The big table",
    provenance:
      "Made from reclaimed wood flooring from the Sears Factory in San Leandro.",
    creditedAs: "Sourced by",
    helpers: ["thelumberbaron"],
    photo: {
      src: "/assets/photos/build/big-table.jpg",
      alt: "A long table of honey-colored reclaimed wood flooring, still dotted with old nail holes, on black steel legs in the shop.",
    },
  },
  {
    id: "shelves",
    name: "The shelves",
    // TODO: which high school, if we can name it.
    provenance:
      "Built from reclaimed high school bleacher seats, and home to the work of our Shelfie Members.",
    creditedAs: "Sourced by",
    helpers: ["thelumberbaron"],
    photo: {
      src: "/assets/photos/build/shelves.jpg",
      alt: "Rows of warm, reclaimed-wood shelves on metal brackets along a cream wall, with a few books on the top shelf.",
    },
  },
  {
    id: "window-sign",
    name: "The window sign",
    provenance: "Designed and hand-painted right on the glass.",
    creditedAs: "Painted by",
    helpers: ["heather-hardison"],
    photo: {
      src: "/assets/photos/build/window-sign.jpg",
      alt: "Heather Hardison painting the El Cerrito Supply Co. sign on the shop's front window, seen from the sidewalk.",
    },
  },
  {
    id: "address-numbers",
    name: "The address numbers",
    provenance: "Each digit shaped by hand from clay.",
    creditedAs: "Crafted by",
    helpers: ["rookie-ceramics"],
    photo: {
      src: "/assets/photos/build/address-numbers.jpg",
      alt: "Glossy red ceramic numbers reading 7523A, stacked down the shop's white door frame, with their reflection in the front window.",
    },
  },
];

/**
 * Which helper took each photo, keyed by the image's `src` exactly as the page
 * passes it. A photo left out here simply shows no credit.
 */
export const PHOTO_CREDITS: Record<string, Helper["id"]> = {
  // "/assets/photos/id-42-1600-1000.jpg": "stephanie-dolen",
};

export function photoCredit(src: string | undefined): Helper | undefined {
  const id = src && PHOTO_CREDITS[src];
  return id ? HELPERS.find((helper) => helper.id === id) : undefined;
}
