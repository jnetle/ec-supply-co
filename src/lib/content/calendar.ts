/** The shop's calendar of workshops, popups and community nights. */

/**
 * "pickup" is a preorder collected at the shop: no money changes hands here,
 * so it never shows a price.
 */
export type EventCategory = "workshop" | "community" | "popup" | "pickup";

/** Whether a sign-up event can still take people, as Wix reports it. */
export type Availability = "open" | "waitlist" | "full" | "closed";

/**
 * How people come: just turn up, RSVP through Wix, or sign up or order on
 * the host's own site (a vendor's workshop, a pick-up's preorder). The shop
 * takes no sign-ups or payments for an "external" event; it only links out.
 */
export type Seats =
  | { kind: "drop-in" }
  | {
      kind: "external";
      /** The host's sign-up or order page, from Wix's external registration link.
       * Unset shows no button. */
      url?: string;
    }
  | {
      kind: "rsvp";
      availability: Availability;
      /** Seats one RSVP may save: 1, plus any guests the Wix form allows. */
      maxSeats: number;
    };

/** A run of text in an event's About section, with the styling it keeps. */
export type AboutText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** Only http(s) and mailto links are kept. */
  href?: string;
};

/**
 * One block of an event's About section ("About the event" in Wix), reduced
 * to text: images, galleries, videos, embeds and the like are dropped, so
 * nothing posted there can break the page.
 */
export type AboutBlock =
  | { kind: "paragraph" | "heading"; content: AboutText[] }
  | { kind: "list"; ordered: boolean; items: AboutText[][] };

/** The About section as plain text, for the blurb when there's no teaser. */
export function aboutPlainText(blocks: AboutBlock[]): string {
  return blocks
    .flatMap((block) => (block.kind === "list" ? block.items : [block.content]))
    .map((runs) => runs.map((run) => run.text).join("").trim())
    .filter(Boolean)
    .join("\n");
}

export type CalendarEvent = {
  id: string;
  /** ISO date, no time zone — the shop's own local day. */
  date: string;
  /** 24-hour "HH:MM". */
  start: string;
  /** Unset when the event has no set end time. */
  end?: string;
  /**
   * The last day of an event that runs over several days (a coffee bar in
   * for the month), as an ISO date. Unset for a one-day event. Its daily
   * hours vary, so a run shows its dates and no time.
   */
  lastDate?: string;
  /**
   * The exact start and end, as ISO instants, for calendar files and links:
   * `date`/`start`/`end` are wall-clock text, and can't say when an event
   * ends the next day or which side of a clock change it falls on.
   */
  startsAt: string;
  endsAt?: string;
  /** The day is set but the time isn't yet (a 12am start in Wix): the date
   * shows without a time. */
  timeTba?: boolean;
  category: EventCategory;
  title: string;
  /** A list-view thumbnail; decorative, since the title sits beside it. */
  photo?: string;
  /** The photo's width over its height, when known. Instagram-sized flyers
   * (4:5 portrait) are common, so the frame follows the photo. */
  photoRatio?: number;
  /** 0 means free. */
  price: number;
  seats: Seats;
  description: string;
  /** The full About section, shown in the event pop-up. Unset when empty. */
  about?: AboutBlock[];
  /**
   * Tagged "IN DRAFT MODE - TESTING ONLY" in Wix: only the local draft
   * preview shows it.
   */
  draft?: true;
};

/** Where the shop's events happen, for turning Wix's UTC times into days. */
export const SHOP_TIME_ZONE = "America/Los_Angeles";

/**
 * ?preview=mock fills /calendar with made-up events, one per state, to try
 * the list and the event dialog. Never on the production site, and its
 * sign-ups go nowhere.
 */
export const MOCK_EVENTS_PREVIEW = {
  param: "preview",
  value: "mock",
  allowed: process.env.VERCEL_ENV !== "production",
} as const;

/**
 * ?preview=drafts adds Wix events tagged "IN DRAFT MODE - TESTING ONLY"
 * to /calendar, marked "Draft", so a new event can be checked before the tag
 * comes off and it goes live. `next dev` only.
 */
export const DRAFT_EVENTS_PREVIEW = {
  param: "preview",
  value: "drafts",
  allowed: process.env.NODE_ENV === "development",
} as const;

export const CATEGORIES: Record<
  EventCategory,
  { label: string; color: string; ink: string }
> = {
  workshop: {
    label: "Workshop",
    color: "var(--color-ecs-pink)",
    ink: "var(--color-ecs-plum-ink)",
  },
  community: {
    label: "Community",
    color: "var(--color-ecs-cobalt)",
    ink: "#ffffff",
  },
  popup: {
    label: "Food popup",
    color: "var(--color-ecs-magenta)",
    ink: "#ffffff",
  },
  pickup: {
    label: "Pick-up",
    color: "var(--color-ecs-marigold)",
    ink: "var(--color-ecs-ink)",
  },
};

/**
 * TODO: turn back on once the .ics feed is tested in Google, Apple and
 * Outlook. Hidden for launch: it shows the subscribe box on /calendar and the
 * "Subscribe to the calendar" links on the home page. The feed itself stays
 * at /api/events.ics.
 */
export const CALENDAR_SUBSCRIBE_ENABLED = false;

/** Where a visitor's own seat reservations are remembered, per browser. */
export const SIGNUPS_STORAGE_KEY = "ecs-cal-signups-v1";
