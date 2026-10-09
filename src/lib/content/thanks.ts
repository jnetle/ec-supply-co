/**
 * The people who helped set up the shop, credited on /thanks, and the photos
 * around the site that each photographer took.
 *
 * PLACEHOLDERS: every helper below is a stand-in until the real names, notes,
 * portraits and links come in. Replace them rather than adding alongside.
 */

export type Helper = {
  /** A slug: the card's anchor on /thanks, and the key `PHOTO_CREDITS` uses. */
  id: string;
  name: string;
  /** What they helped with, e.g. "Photography" or "Shelving". */
  role: string;
  /** A sentence or two of thanks. */
  note: string;
  photo?: { src: string; alt: string };
  /** Their site or Instagram. */
  link?: { href: string; label: string };
};

export const HELPERS: Helper[] = [
  {
    id: "placeholder-photographer",
    name: "Photographer name",
    role: "Photography",
    note: "Shot the shop before the paint was dry, and made a half-finished room look like a place you'd want to spend a Saturday.",
    link: { href: "https://instagram.com/", label: "Instagram" },
  },
  {
    id: "placeholder-builder",
    name: "Builder name",
    role: "Shelving + carpentry",
    note: "Built every shelf the makers' work sits on, out of wood salvaged from two blocks away.",
  },
  {
    id: "placeholder-painter",
    name: "Sign painter name",
    role: "Signage",
    note: "Hand-lettered the window and the awning, and didn't charge us for the second coat.",
    link: { href: "https://example.com/", label: "Website" },
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
