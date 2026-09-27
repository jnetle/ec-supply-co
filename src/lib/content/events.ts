/** The four events spotlighted on the home page. */

export type HomeEvent = {
  month: string;
  day: string;
  /** Day, time and price, as one line. */
  meta: string;
  title: string;
  blurb: string;
  photo: string;
  alt: string;
  /** The date badge's fill. */
  badgeColor: string;
};

export const HOME_EVENTS: HomeEvent[] = [
  {
    month: "SEP",
    day: "19",
    meta: "Fri · 6–10pm · Free",
    title: "Zine & Print Fair",
    blurb:
      "Twenty tables of risograph, photocopy and letterpress. Trade a zine, take a zine.",
    photo: "/assets/photos/id-24-800-1000.jpg",
    alt: "Tables of printed zines at the fair",
    badgeColor: "#c23a21",
  },
  {
    month: "SEP",
    day: "27",
    meta: "Sat · 1–4pm · $65",
    title: "Clay Night: Hand-building",
    blurb:
      "Pinch, coil, slab. Twelve seats with Rosa Delgado; clay and firing included.",
    photo: "/assets/photos/id-326-800-1000.jpg",
    alt: "Hands shaping clay at the workbench",
    badgeColor: "#c23a21",
  },
  {
    month: "OCT",
    day: "04",
    meta: "Sat · 10am–2pm · Free",
    title: "Neighborhood Swap Meet",
    blurb:
      "Bring what you don't need, leave with what you do. Sidewalk and back room both open.",
    photo: "/assets/photos/id-342-800-1000.jpg",
    alt: "Neighbours browsing swap meet tables on the sidewalk",
    badgeColor: "#c23a21",
  },
  {
    month: "OCT",
    day: "11",
    meta: "Sat · 7pm · $40",
    title: "Supper Club No. 7",
    blurb:
      "One long table, thirty chairs, whatever the farmers market gave us that morning.",
    photo: "/assets/photos/id-292-800-1000.jpg",
    alt: "One long table set for the supper club",
    badgeColor: "#c23a21",
  },
];
