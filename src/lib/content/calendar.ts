/** The shop's calendar of workshops, popups and community nights. */

export type EventCategory = "workshop" | "community" | "popup";

export type CalendarEvent = {
  id: string;
  /** ISO date, no time zone — the shop's own local day. */
  date: string;
  /** 24-hour "HH:MM". */
  start: string;
  end: string;
  category: EventCategory;
  title: string;
  host: string;
  /** The host's own site; unset when the shop runs the event itself. */
  hostUrl?: string;
  /** A list-view thumbnail; decorative, since the title sits beside it. */
  photo: string;
  /** 0 means free. */
  price: number;
  /** 0 means drop-in: no sign-up, no seat limit. */
  capacity: number;
  /** Seats already taken by other people. */
  taken: number;
  description: string;
};

/**
 * Empty until phase two connects Wix Events. Every view that reads this has a
 * zero-event state, and the .ics feed serves an empty calendar to match.
 */
export const CALENDAR_EVENTS: CalendarEvent[] = [];

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
    color: "var(--color-ecs-marigold)",
    ink: "var(--color-ecs-ink)",
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

/**
 * TODO: turn back on once real events are on the calendar (Wix Events, phase
 * two). Hidden for launch: it hides the "What's coming up" section on the home
 * page. /calendar stays up and linked from the nav.
 */
export const HOME_EVENTS_ENABLED = false;

/** Where a visitor's own seat reservations are remembered, per browser. */
export const SIGNUPS_STORAGE_KEY = "ecs-cal-signups-v1";
