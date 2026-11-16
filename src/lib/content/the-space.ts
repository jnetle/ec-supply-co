/**
 * The photo shoots on /the-space, newest first, undated and untitled. Each
 * shoot is a run of rows; the photos in a row share one height, so a row's width splits by
 * each photo's shape. Adding a shoot is a new entry
 * here; the page needs no changes.
 */

import type { Helper } from "./thanks";

export type SpacePhoto = {
  src: string;
  alt: string;
  /** The photo's own shape, as a CSS aspect ratio. */
  ratio: "2/3" | "4/5" | "3/2" | "5/4";
};

export type Shoot = {
  /** A slug, used as the shoot's anchor and React key. Never shown. */
  id: string;
  photographer: Helper["id"];
  /**
   * Three photos each (or four tall ones, or a landscape and a portrait), a
   * landscape first when there is one: rows have no height cap, so two
   * portraits alone would stand taller than the screen. On a phone the first
   * photo gets a line of its own.
   */
  rows: SpacePhoto[][];
};

const DAY_BEFORE = "/assets/photos/the-space/day-before";

export const SHOOTS: Shoot[] = [
  {
    id: "first-shoot",
    photographer: "stephanie-dolen",
    rows: [
      [
        {
          src: `${DAY_BEFORE}/storefront.jpg`,
          alt: "The storefront in full sun under its striped awning, with a blue bistro set and a gumball machine out front, a rack of tie-dye shirts by the door and Supply Co. lettered on the window",
          ratio: "2/3",
        },
        {
          src: `${DAY_BEFORE}/hennai-corner.jpg`,
          alt: "Hennai's corner: pale wood shelving full of vases, books, candles and cookbooks under a paper lantern, with plants and a round table by the front window",
          ratio: "2/3",
        },
        {
          src: `${DAY_BEFORE}/hennai-sign.jpg`,
          alt: "Hennai's round wood sign above pale pine shelving of candles, incense, tea tins, books and ceramic lamps, with a monstera and potted succulents on top",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/hennai-books.jpg`,
          alt: "Hennai's shelves of ribbed ceramic vases, cookbooks, bottled cocktail mixers, skincare and candles",
          ratio: "2/3",
        },
        {
          src: `${DAY_BEFORE}/front-window.jpg`,
          alt: "Tie-dye shirts on a rack in the front window, backlit by the street, with hanging planters and a monstera beside them",
          ratio: "2/3",
        },
        {
          src: `${DAY_BEFORE}/lounge-mirror.jpg`,
          alt: "The plywood pony wall's round window, looking through to Hennai's shelves, with a glowing globe lamp, small plants and the orange couch below",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/gallery-wall.jpg`,
          alt: "A gallery wall of macramé, weavings, paintings, stained glass and a mirror above an acrylic table of jewelry and stacked books",
          ratio: "5/4",
        },
        {
          src: `${DAY_BEFORE}/lounge.jpg`,
          alt: "The lounge: an orange velvet couch with plaid pillows, a rainbow glass coffee table on a jute rug, a fringed wall hanging, and shirts and a round mirror on either side",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/cabinet-ceramics.jpg`,
          alt: "Inside a lit cabinet: speckled stoneware mugs, bowls and vases, a carved dark vase and a jar of orange marigolds, with a pothos trailing down",
          ratio: "3/2",
        },
        {
          src: `${DAY_BEFORE}/merch-cabinet.jpg`,
          alt: "A lit shelving cabinet of mugs, vases, framed prints and small treasures, with hats and totes on top and shirts hanging alongside",
          ratio: "2/3",
        },
        {
          src: `${DAY_BEFORE}/merch-wall.jpg`,
          alt: "Pine shelving with shop T-shirts on a rail, stacked totes and a glass-front cabinet of goods, beside the orange couch and framed paintings",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/browsing.jpg`,
          alt: "A visitor in a red shirt browsing the sticker and card shelf, beside a rack of clothing and straw hats and painted clocks on the wall",
          ratio: "5/4",
        },
        {
          src: `${DAY_BEFORE}/east-bay-tote.jpg`,
          alt: "A stack of canvas totes printed “It’s always a lovely day in the East Bay” beside folded bleach-dyed shirts",
          ratio: "4/5",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/creative-commons-wide.jpg`,
          alt: "The whole Creative Commons wall of local work: a long paper-collage mountain and two botanical paintings above shelves of painted earrings, small landscape paintings, patterned pouches, stained glass, pins and patches, with small pumpkins and marigolds",
          ratio: "3/2",
        },
        {
          src: `${DAY_BEFORE}/card-rack.jpg`,
          alt: "A tall wood rack of greeting cards and art prints, from line drawings of local buildings to bay sunsets",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/mugs.jpg`,
          alt: "Speckled ceramic mugs painted with tomatoes and fried eggs on a wood shelf, with matching plates in a rack and tiny traffic cones",
          ratio: "3/2",
        },
        {
          src: `${DAY_BEFORE}/sticker-shelf.jpg`,
          alt: "A shelf of tomato and fried-egg mugs and plates above a display of stickers, greeting cards and folded black T-shirts",
          ratio: "4/5",
        },
        {
          src: `${DAY_BEFORE}/clocks.jpg`,
          alt: "Three painted round clocks in bright zigzag patterns on a wall, above a shelf of pink caps and sandwich-shaped soaps",
          ratio: "2/3",
        },
      ],
      [
        {
          src: `${DAY_BEFORE}/coffee-bar.jpg`,
          alt: "The coffee bar in use: a barista in a straw hat pulling a shot at the espresso machine, another working beside him, and a customer paying, under an old El Cerrito city sign",
          ratio: "3/2",
        },
        {
          src: `${DAY_BEFORE}/charm-sign.jpg`,
          alt: "A letterboard sign reading “Make a charm $6 ea, keychain $2” in front of strands of colorful beads",
          ratio: "2/3",
        },
      ],
    ],
  },
];
