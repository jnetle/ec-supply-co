import {
  CATEGORIES,
  SHOP_TIME_ZONE,
  type Availability,
  type CalendarEvent,
} from "@/lib/content/calendar";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");

/** "18:30" → "6:30pm"; a whole hour drops the minutes. */
export function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = ((h + 11) % 12) + 1;
  return m ? `${hour}:${pad(m)}${suffix}` : `${hour}${suffix}`;
}

/** Today as an ISO date key, in the visitor's own time zone. */
export function todayKey(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Today as an ISO date key in the shop's own time zone, for server renders
 * where the machine's clock is UTC and would roll over at 5pm Pacific.
 */
export function shopTodayKey(now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIME_ZONE,
  }).format(now);
}

/** The next `count` events on or after `today`, soonest first. */
export function upcomingEvents(
  events: CalendarEvent[],
  today: string,
  count: number,
) {
  return events
    .filter((e) => e.date >= today)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
    )
    .slice(0, count);
}

/** The ISO day after `date`, for an all-day event's exclusive end. */
export function nextDay(date: string) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

const HOUR = 60 * 60 * 1_000;

/** An ISO instant as Google's UTC stamp: "2026-12-13T19:00:00.000Z" → "20261213T190000Z". */
const utcStamp = (iso: string) =>
  iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * A Google Calendar link that opens the event, filled in, ready to save. An
 * event with no end gets an hour, and one whose time isn't set yet is saved
 * as all day.
 */
export function googleCalendarUrl(
  event: Pick<
    CalendarEvent,
    "title" | "date" | "startsAt" | "endsAt" | "timeTba" | "description"
  >,
  location: string,
) {
  const end =
    event.endsAt ??
    new Date(new Date(event.startsAt).getTime() + HOUR).toISOString();

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: event.timeTba
      ? `${event.date.replace(/-/g, "")}/${nextDay(event.date).replace(/-/g, "")}`
      : `${utcStamp(event.startsAt)}/${utcStamp(end)}`,
    ctz: SHOP_TIME_ZONE,
    details: event.description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Months since year 0, so navigation is one number to clamp. */
export const monthIndex = (year: number, month: number) => year * 12 + month;

export type DecoratedEvent = CalendarEvent & {
  past: boolean;
  /** Seats this visitor has already saved. */
  mine: number;
  dropIn: boolean;
  /** Where sign-ups stand; null for a drop-in event. */
  availability: Availability | null;
  /** Seats one sign-up may save. */
  maxSeats: number;
  categoryLabel: string;
  categoryColor: string;
  categoryInk: string;
  dow: string;
  day: number;
  longDate: string;
  time: string;
  shortTime: string;
  priceLabel: string;
  spotsLabel: string;
  cta: string;
  /** Details-only buttons step back to an outline. */
  ctaVariant: "solid" | "outline";
  ctaColor: string;
  ctaInk: string;
};

/**
 * Everything the list, grid and modal need to render one event — derived
 * rather than stored, because it depends on today's date and on the seats
 * this visitor has saved.
 */
export function decorate(
  event: CalendarEvent,
  mySeats: Record<string, number>,
  today: string,
): DecoratedEvent {
  const category = CATEGORIES[event.category];
  const past = event.date < today;
  const mine = mySeats[event.id] ?? 0;
  const dropIn = event.seats.kind === "drop-in";
  const availability =
    event.seats.kind === "rsvp" ? event.seats.availability : null;

  // Noon avoids the date shifting under time zones either side of UTC.
  const date = new Date(`${event.date}T12:00:00`);

  const spotsLabel = availability ? SPOTS_LABELS[availability] : "Drop in";

  const cta = past
    ? "Past"
    : mine
      ? "You're in"
      : availability
        ? CTA_LABELS[availability]
        : "Details";

  return {
    ...event,
    past,
    mine,
    dropIn,
    availability,
    maxSeats: event.seats.kind === "rsvp" ? event.seats.maxSeats : 0,
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryInk: category.ink,
    dow: WEEKDAYS[date.getDay()].toUpperCase(),
    day: date.getDate(),
    longDate: `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`,
    // Empty while the time isn't set yet; every view then shows the date alone.
    time: event.timeTba
      ? ""
      : event.end
        ? `${formatTime(event.start)}–${formatTime(event.end)}`
        : formatTime(event.start),
    shortTime: event.timeTba ? "" : formatTime(event.start),
    priceLabel: event.price ? `$${event.price}` : "Free",
    spotsLabel,
    cta,
    ctaVariant: cta === "Details" ? "outline" : "solid",
    ctaColor: past
      ? "var(--color-ecs-ply-pale)"
      : mine
        ? "var(--color-ecs-teal-pale)"
        : "var(--color-ecs-teal)",
    ctaInk: past
      ? "var(--color-ecs-ply-ink)"
      : mine
        ? "var(--color-ecs-teal-deep)"
        : "#ffffff",
  };
}

const SPOTS_LABELS: Record<Availability, string> = {
  open: "Spots open",
  waitlist: "Waitlist open",
  full: "Full",
  closed: "Sign-ups closed",
};

const CTA_LABELS: Record<Availability, string> = {
  open: "Sign up",
  waitlist: "Waitlist",
  full: "Details",
  closed: "Details",
};

export type MonthCell = {
  key: string;
  /** Empty for leading and trailing padding cells. */
  day: number | null;
  isToday: boolean;
  events: DecoratedEvent[];
};

/** One 7-column grid of whole weeks covering the month. */
export function buildMonthGrid(
  year: number,
  month: number,
  events: DecoratedEvent[],
  today: string,
): MonthCell[] {
  const ym = `${year}-${pad(month + 1)}`;
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + days) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const day = i - lead + 1;
    const inside = day >= 1 && day <= days;
    const key = inside ? `${ym}-${pad(day)}` : `pad-${i}`;

    return {
      key,
      day: inside ? day : null,
      isToday: key === today,
      events: inside ? events.filter((e) => e.date === key) : [],
    };
  });
}
