/** The people who helped set up the shop, credited on /the-build. */

export type Helper = {
  /** A slug: the helper's anchor on /the-build. */
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
    link: {
      href: "https://www.instagram.com/thelittlehill/",
      label: "Instagram",
    },
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
    link: {
      href: "https://www.instagram.com/heather_hardison/",
      label: "Instagram",
    },
  },
  {
    id: "rookie-ceramics",
    name: "Rookie Ceramics",
    role: "Ceramic address numbers",
    link: {
      href: "https://www.instagram.com/rookie.ceramics",
      label: "Instagram",
    },
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
  /** One photo, or two that stand side by side over one caption. */
  photos: MadeOfPhoto[];
};

export type MadeOfPhoto = {
  src: string;
  alt: string;
  /** The photo's own shape, as a CSS aspect ratio; it's never cropped. */
  ratio: "2/3" | "4/3" | "3/2";
};

/**
 * The stories behind the shop's fixtures, shown above the helpers on
 * /the-build, in rows. The photos in a row share one height, so keep each
 * row's photos about the same total width: two wide photos, or four tall.
 */
export const MADE_OF: MadeOfEntry[][] = [
  [
    {
      id: "big-table",
      name: "The big table",
      provenance:
        "Made from reclaimed wood flooring from the Sears Factory in San Leandro.",
      creditedAs: "Sourced by",
      helpers: ["thelumberbaron"],
      photos: [
        {
          src: "/assets/photos/build/big-table-tight.jpg",
          alt: "The big table's long honey-colored top of reclaimed wood flooring in the foreground, with the pine shelving, the orange sofa, the arched pony wall and the sunlit front window behind it.",
          ratio: "4/3",
        },
      ],
    },
    {
      id: "window-sign",
      name: "The window sign",
      provenance: "Designed and hand-painted right on the glass.",
      creditedAs: "Painted by",
      helpers: ["heather-hardison"],
      photos: [
        {
          src: "/assets/photos/shop/window-lettering.jpg",
          alt: "The finished hand-painted window sign: El Cerrito Supply Co. in white block letters with an orange and pink drop shade, over the script line Community, Collaboration, Co-op.",
          ratio: "3/2",
        },
      ],
    },
  ],
  [
    {
      id: "shelves",
      name: "The shelves",
      // TODO: which high school, if we can name it.
      provenance:
        "Built from reclaimed high school bleacher seats, and home to the work of our Shelfie Members.",
      creditedAs: "Sourced by",
      helpers: ["thelumberbaron"],
      photos: [
        {
          src: "/assets/photos/build/shelves-books.jpg",
          ratio: "2/3",
          alt: "Reclaimed wood shelves on white wall brackets, the top one holding design books between orange acrylic bookends, with a pothos trailing down from a pink pot.",
        },
        {
          src: "/assets/photos/build/shelves-bleachers.jpg",
          ratio: "2/3",
          alt: "Reclaimed bleacher-seat shelves with rounded edges on white wall brackets, one labeled with blue painter's tape reading Kieran.",
        },
      ],
    },
    {
      id: "address-numbers",
      name: "The address numbers",
      provenance: "Each digit shaped by hand from clay.",
      creditedAs: "Crafted by",
      helpers: ["rookie-ceramics"],
      photos: [
        {
          src: "/assets/photos/build/address-numbers-door.jpg",
          ratio: "2/3",
          alt: "Glossy orange ceramic numbers reading 7523A, stacked down the white door frame beside the blue door, with their reflection in the front window.",
        },
      ],
    },
    {
      id: "pony-wall",
      name: "The pony wall",
      provenance:
        "Gives the lounge a little room of its own, and gets pushed aside when a crowd needs the whole floor.",
      creditedAs: "Built by",
      helpers: ["william-pryor"],
      photos: [
        {
          src: "/assets/photos/build/pony-wall.jpg",
          ratio: "2/3",
          alt: "The arched plywood pony wall, with a round window cut through it and two small shelves, beside the rust velvet sofa and the rainbow acrylic coffee table.",
        },
      ],
    },
  ],
];
