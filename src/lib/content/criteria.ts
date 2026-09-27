/** What the shop looks for in a maker submission, numbered 01–09. */

export type Criterion = { title: string; body: string };

export const SUBMISSION_CRITERIA: Criterion[] = [
  {
    title: "Fits the shop",
    body: "Does it sit well alongside what is already on our shelves?",
  },
  {
    title: "Fits the mission",
    body: "Handmade, made to last, and good for the community.",
  },
  {
    title: "Quality, inside and out",
    body: "Well-made product and packaging that looks the part.",
  },
  { title: "Something new", body: "Different from what we already carry." },
  {
    title: "A cohesive brand",
    body: "Your pieces feel like they belong together.",
  },
  {
    title: "A price that works here",
    body: "Our customers can say yes to it.",
  },
  {
    title: "Made nearby",
    body: "Not required, but local makers get priority.",
  },
  {
    title: "More than ten pieces",
    body: "Show us enough to get a real feel for your work.",
  },
  {
    title: "A link to your work",
    body: "Required. No link means we cannot review it.",
  },
];
