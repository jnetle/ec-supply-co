/** The shop's calendar of workshops, popups and community nights. */

export type EventCategory = "workshop" | "community" | "popup";

/** Whether a sign-up event can still take people, as Wix reports it. */
export type Availability = "open" | "waitlist" | "full" | "closed";

/** How people come: just turn up, or RSVP through Wix. */
export type Seats =
  | { kind: "drop-in" }
  | {
      kind: "rsvp";
      availability: Availability;
      /** Seats one RSVP may save: 1, plus any guests the Wix form allows. */
      maxSeats: number;
    };

export type CalendarEvent = {
  id: string;
  /** ISO date, no time zone — the shop's own local day. */
  date: string;
  /** 24-hour "HH:MM". */
  start: string;
  /** Unset when the event has no set end time. */
  end?: string;
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
  host: string;
  /** The host's own site; unset when the shop runs the event itself. */
  hostUrl?: string;
  /** A list-view thumbnail; decorative, since the title sits beside it. */
  photo?: string;
  /** 0 means free. */
  price: number;
  seats: Seats;
  description: string;
};

/**
 * Empty: real events come from Wix Events (see `getWixCalendarEvents`). Every
 * view that reads this has a zero-event state, and the .ics feed serves an
 * empty calendar to match.
 */
export const CALENDAR_EVENTS: CalendarEvent[] = [];

/** Where the shop's events happen, for turning Wix's UTC times into days. */
export const SHOP_TIME_ZONE = "America/Los_Angeles";

/**
 * TODO: turn on once free events are set up in Wix and tested through the
 * preview. Shows Wix Events on /calendar, and the "What's coming up" section
 * on the home page, for everyone. While off, both show them only with
 * `?preview=events` (EVENTS_PREVIEW): the home section is hidden, and nobody
 * else sees a difference.
 */
export const EVENTS_ENABLED = false;

/** The query string that previews Wix events on /calendar: ?preview=events. */
export const EVENTS_PREVIEW = { param: "preview", value: "events" } as const;

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
