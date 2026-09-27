/**
 * The maker roster. `photoId` keys the placeholder portraits in
 * public/assets/photos; swap it for a real image path when the photography
 * arrives. `featured` picks the four shown in the home page spotlight.
 */

export type Maker = {
  name: string;
  craft: string;
  /** Year they started making. */
  since: number;
  bio: string;
  photoId: number;
  featured?: boolean;
};

export const MAKERS: Maker[] = [
  {
    name: "Rosa Delgado",
    craft: "Ceramics",
    since: 2019,
    bio: "Throws in a garage two blocks east. Teaches the clay nights and refuses to make anything that can't go in a dishwasher.",
    photoId: 64,
    featured: true,
  },
  {
    name: "Ninth St. Press",
    craft: "Print",
    since: 2021,
    bio: "Two people, one four-color carousel. They print the event posters you see taped in our window.",
    photoId: 91,
    featured: true,
  },
  {
    name: "Hana Ito",
    craft: "Textiles",
    since: 2020,
    bio: "Keeps a live indigo vat going year-round and will happily explain the smell to anyone who asks.",
    photoId: 65,
    featured: true,
  },
  {
    name: "Marisol Vega",
    craft: "Jewelry",
    since: 2018,
    bio: "Hammered brass and recycled silver, cut and finished at a bench off San Pablo.",
    photoId: 177,
    featured: true,
  },
  {
    name: "Oak + Iron Co.",
    craft: "Woodwork",
    since: 2017,
    bio: "Cutting boards and stools from street trees the city takes down.",
    photoId: 1062,
  },
  {
    name: "Dev Patel",
    craft: "Candles",
    since: 2022,
    bio: "Small-batch soy candles scented after Bay Area trails.",
    photoId: 1080,
  },
  {
    name: "Little Fern Studio",
    craft: "Textiles",
    since: 2020,
    bio: "Quilted pouches and baby blankets from deadstock cotton.",
    photoId: 1025,
  },
  {
    name: "Jonah Reyes",
    craft: "Ceramics",
    since: 2021,
    bio: "Speckled bud vases and planters, fired in a shared kiln in Richmond.",
    photoId: 1074,
  },
  {
    name: "Paper Kite",
    craft: "Print",
    since: 2019,
    bio: "Risograph zines, cards and calendars with a soft spot for local birds.",
    photoId: 1015,
  },
  {
    name: "Aiyana Brooks",
    craft: "Jewelry",
    since: 2023,
    bio: "Beaded earrings in colors pulled from her grandmother’s quilts.",
    photoId: 1027,
  },
  {
    name: "Elm Street Soap",
    craft: "Bath + body",
    since: 2016,
    bio: "Cold-process soaps cured for six weeks, wrapped in paper she prints herself.",
    photoId: 1060,
  },
  {
    name: "Tomás Ortega",
    craft: "Woodwork",
    since: 2020,
    bio: "Hand-carved spoons and spatulas from cherry and walnut offcuts.",
    photoId: 1069,
  },
  {
    name: "Bay Leaf Botanicals",
    craft: "Bath + body",
    since: 2021,
    bio: "Balms and salves from herbs grown in an El Cerrito backyard.",
    photoId: 1043,
  },
  {
    name: "Grace Kim",
    craft: "Illustration",
    since: 2019,
    bio: "Prints and stickers of corner stores, bungalows and the Plaza.",
    photoId: 1011,
  },
  {
    name: "Loop + Knot",
    craft: "Textiles",
    since: 2022,
    bio: "Chunky hand-knit hats and scarves, one colorway at a time.",
    photoId: 1005,
  },
  {
    name: "Sam Whitfield",
    craft: "Leather",
    since: 2018,
    bio: "Wallets and key fobs stitched by hand with waxed linen thread.",
    photoId: 1084,
  },
  {
    name: "Fern + Fable",
    craft: "Illustration",
    since: 2023,
    bio: "Picture-book style art prints for kids’ rooms.",
    photoId: 1041,
  },
  {
    name: "Clay Collective",
    craft: "Ceramics",
    since: 2022,
    bio: "Four potters sharing a studio and a glaze shelf.",
    photoId: 1050,
  },
  {
    name: "Nadia Rahman",
    craft: "Candles",
    since: 2020,
    bio: "Hand-poured beeswax tapers from a family apiary in Sonoma.",
    photoId: 1036,
  },
  {
    name: "Westside Leather",
    craft: "Leather",
    since: 2021,
    bio: "Dog collars and leashes that last longer than the dog is a puppy.",
    photoId: 1024,
  },
];

/** The four makers on the home page, in roster order. */
export const SPOTLIGHT_MAKERS = MAKERS.filter((m) => m.featured).slice(0, 4);

/** Portraits ship at two sizes; the home spotlight uses the larger one. */
export function makerPhoto(maker: Maker, size: 600 | 700) {
  return `/assets/photos/id-${maker.photoId}-${size}-${size}.jpg`;
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
