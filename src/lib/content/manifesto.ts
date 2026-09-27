/**
 * The nine manifesto rules.
 *
 * The design file for this page uses a second, later palette (Baloo 2 and a
 * brighter teal/marigold) that no other page shares. Its colours are mapped
 * onto the shop palette here so the site reads as one brand, which means this
 * page deliberately departs from its own screenshots.
 */

export type ManifestoRule = {
  number: string;
  title: string;
  body: string;
  /** The card's fill. */
  background: string;
  /** The big numeral's colour. */
  numberColor: string;
};

export const MANIFESTO_RULES: ManifestoRule[] = [
  {
    number: "01",
    title: "Every object has a name attached.",
    body: "If we can't tell you who made it and roughly where they made it, it doesn't go on the shelf. No unattributed imports, no house brand pretending to be somebody's studio.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-teal)",
  },
  {
    number: "02",
    title: "The room is not precious.",
    body: "Shelves roll, chairs fold, the register moves. Saturday should look nothing like Thursday. A store that can only be one thing is a store that sits empty five nights a week.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-red)",
  },
  {
    number: "03",
    title: "Tools get borrowed, not bought four times over.",
    body: "A block has no business owning six tile saws. The library is free with a library card, and the deposit comes back when the tool does.",
    background: "var(--color-ecs-wood-pale)",
    numberColor: "#7a4d20",
  },
  {
    number: "04",
    title: "Consignment, not wholesale.",
    body: "Makers set their own price and keep the larger half of it. We take a cut that covers the lights and the rent, and we tell you exactly what it is before you sign anything.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-magenta)",
  },
  {
    number: "05",
    title: "Coffee is a doorway, not a business plan.",
    body: "Two dollars, one roaster, no laptop rules and no shame in nursing it for an hour. It exists so people have a reason to walk in without needing to buy anything.",
    background: "var(--color-ecs-pink)",
    numberColor: "var(--color-ecs-pink-deep)",
  },
  {
    number: "06",
    title: "Teach it before you sell it.",
    body: "Anyone stocked here is welcome to teach here. Skills that stay in one pair of hands die with that pair of hands.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-red)",
  },
  {
    number: "07",
    title: "Repair before replace.",
    body: "We'll re-handle the knife, patch the tote and re-sole the boot before we sell you new ones. Bring it in on a repair night and we'll try it together.",
    background: "var(--color-ecs-teal-pale)",
    numberColor: "var(--color-ecs-teal-deep)",
  },
  {
    number: "08",
    title: "Free to stand around in.",
    body: "Sitting down, using the bathroom, waiting out the rain and asking a question are all free forever. A neighborhood needs rooms that don't charge admission.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-pink-deep)",
  },
  {
    number: "09",
    title: "Small on purpose.",
    body: "One room, one block, one zip code. Growth here means more makers on the shelf and more nights the lights are on \u2014 not a second location.",
    background: "var(--color-ecs-surface)",
    numberColor: "var(--color-ecs-marigold)",
  },
];
