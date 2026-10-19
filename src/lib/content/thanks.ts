/**
 * The people who helped set up the shop, credited on /the-build, and the photos
 * around the site that each photographer took.
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
  {
    id: "william-pryor",
    name: "William Pryor",
    role: "Pony wall",
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
  /** `portrait` gives a tall photo a tall frame instead of cropping it wide. */
  photo?: { src: string; alt: string; portrait?: boolean };
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
      src: "/assets/photos/build/big-table-tight.jpg",
      alt: "The big table's long honey-colored top of reclaimed wood flooring in the foreground, with the pine shelving, the orange sofa, the arched pony wall and the sunlit front window behind it.",
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
      src: "/assets/photos/build/shelves-bleachers.jpg",
      alt: "Reclaimed bleacher-seat shelves with rounded edges on white wall brackets, one labeled with blue painter's tape reading Kieran.",
    },
  },
  {
    id: "window-sign",
    name: "The window sign",
    provenance: "Designed and hand-painted right on the glass.",
    creditedAs: "Painted by",
    helpers: ["heather-hardison"],
    photo: {
      src: "/assets/photos/shop/window-lettering.jpg",
      alt: "The finished hand-painted window sign: El Cerrito Supply Co. in white block letters with an orange and pink drop shade, over the script line Community, Collaboration, Co-op.",
    },
  },
  {
    id: "address-numbers",
    name: "The address numbers",
    provenance: "Each digit shaped by hand from clay.",
    creditedAs: "Crafted by",
    helpers: ["rookie-ceramics"],
    photo: {
      src: "/assets/photos/build/address-numbers-door.jpg",
      portrait: true,
      alt: "Glossy orange ceramic numbers reading 7523A, stacked down the white door frame beside the blue door, with their reflection in the front window.",
    },
  },
  {
    id: "pony-wall",
    name: "The pony wall",
    provenance:
      "An arched plywood wall with a round window and two little shelves, standing between the lounge and the shelving.",
    creditedAs: "Built by",
    helpers: ["william-pryor"],
    photo: {
      src: "/assets/photos/build/pony-wall.jpg",
      portrait: true,
      alt: "The arched plywood pony wall, with a round window cut through it and two small shelves, beside the rust velvet sofa and the rainbow acrylic coffee table.",
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
