/**
 * The site's information architecture, in one place. The design duplicates
 * this list three times — desktop dropdowns, mobile drawer and footer
 * sitemap — so every consumer reads it from here instead.
 */

export type NavLink = {
  label: string;
  /** Sub-label shown in the desktop dropdown; the drawer and footer omit it. */
  note: string;
  href: string;
};

export type NavGroup = {
  key: string;
  label: string;
  /** Chip fill, also used as the dot colour in the drawer and footer. */
  color: string;
  /** Chip text colour against `color`. */
  ink: string;
  /** The chip's hand-cut, asymmetric corner radii. */
  radius: string;
  /** Resting tilt in degrees; hover straightens it. */
  tilt: number;
  /** Which edge the dropdown panel hangs from. */
  align: "left" | "right";
  links: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "shop",
    label: "At the shop",
    color: "var(--color-ecs-marigold)",
    ink: "#22201c",
    radius: "8px 17px 7px 15px",
    tilt: -1.4,
    align: "left",
    links: [
      {
        label: "Hennai Home + Garden",
        note: "Plants, pots + home goods",
        href: "/#hennai",
      },
      {
        label: "Popup vendors",
        note: "Coffee + food, always rotating",
        href: "/#carts",
      },
      {
        label: "Tool library",
        note: "Borrow it, do not buy it twice",
        href: "/#tools",
      },
    ],
  },
  {
    key: "events",
    label: "Events + popups",
    color: "var(--color-ecs-magenta)",
    ink: "#ffffff",
    radius: "16px 8px 15px 7px",
    tilt: 1.3,
    align: "left",
    links: [
      {
        label: "Community calendar",
        note: "Workshops, classes + popups",
        href: "/calendar",
      },
      {
        label: "Private workshops",
        note: "Your group, after hours",
        href: "/private-events#workshops",
      },
      {
        label: "Rent the space",
        note: "Meetings, classes + parties",
        href: "/private-events#rental",
      },
    ],
  },
  {
    key: "makers",
    label: "Makers",
    color: "var(--color-ecs-pink)",
    ink: "#4a1f30",
    radius: "15px 7px 17px 9px",
    tilt: -1.1,
    align: "right",
    links: [
      { label: "Meet the makers", note: "Everyone on the shelves", href: "/makers" },
      { label: "Sell with us", note: "Maker submissions", href: "/sell-with-us" },
    ],
  },
  {
    key: "about",
    label: "About",
    color: "var(--color-ecs-teal-pale)",
    ink: "var(--color-ecs-teal-deep)",
    radius: "17px 9px 14px 8px",
    tilt: 1.6,
    align: "right",
    links: [
      { label: "Our story", note: "Why we are here", href: "/#about" },
      {
        label: "Manifesto",
        note: "Keep the money close to home",
        href: "/manifesto",
      },
      {
        label: "How we built it",
        note: "The wood, the hands, the history",
        href: "/the-build",
      },
      { label: "Newsletter", note: "Hear it here first", href: "/#signup" },
    ],
  },
];

export const VISIT_HREF = "/#visit";

/**
 * Links the footer sitemap carries that the dropdowns don't, keyed by group.
 * The nav chips stay short; the footer can afford the extra row.
 */
export const FOOTER_EXTRA_LINKS: Record<string, NavLink[]> = {
  shop: [{ label: "Hours + directions", note: "", href: "/#visit" }],
};

export const SHOP_ADDRESS = {
  street: "7523 A Fairmount Ave",
  city: "El Cerrito, CA 94530",
  locality: "El Cerrito",
  region: "CA",
  postalCode: "94530",
  hours: "Thu–Sun",
  instagram: "https://instagram.com/elcerritosupplyco",
};
