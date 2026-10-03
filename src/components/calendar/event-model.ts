import {
  CATEGORIES,
  type CalendarEvent,
  type EventCategory,
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
    timeZone: "America/Los_Angeles",
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
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
    .slice(0, count);
}

/** Months since year 0, so navigation is one number to clamp. */
export const monthIndex = (year: number, month: number) => year * 12 + month;

export type DecoratedEvent = CalendarEvent & {
  past: boolean;
  /** Seats still available, or null for a drop-in event. */
  left: number | null;
  /** Seats this visitor has already saved. */
  mine: number;
  dropIn: boolean;
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
  const category = CATEGORIES[event.category as EventCategory];
  const past = event.date < today;
  const mine = mySeats[event.id] ?? 0;
  const dropIn = event.capacity === 0;
  const left = dropIn ? null : Math.max(0, event.capacity - event.taken - mine);

  // Noon avoids the date shifting under time zones either side of UTC.
  const date = new Date(`${event.date}T12:00:00`);

  const spotsLabel = dropIn
    ? "Drop in"
    : left === 0
      ? "Full"
      : `${left} ${left === 1 ? "spot" : "spots"} left`;

  const cta = past
    ? "Past"
    : mine
      ? "You're in"
      : dropIn
        ? "Details"
        : left === 0
          ? "Waitlist"
          : "Sign up";

  return {
    ...event,
    past,
    left,
    mine,
    dropIn,
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryInk: category.ink,
    dow: WEEKDAYS[date.getDay()].toUpperCase(),
    day: date.getDate(),
    longDate: `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`,
    time: `${formatTime(event.start)}–${formatTime(event.end)}`,
    shortTime: formatTime(event.start),
    priceLabel: event.price ? `$${event.price}` : "Free",
    spotsLabel,
    cta,
    ctaColor: past
      ? "var(--color-ecs-ply-pale)"
      : mine
        ? "var(--color-ecs-teal-pale)"
        : dropIn
          ? "transparent"
          : "var(--color-ecs-teal)",
    ctaInk:
      past || mine || dropIn
        ? past
          ? "var(--color-ecs-ply-ink)"
          : "var(--color-ecs-teal-deep)"
        : "#ffffff",
  };
}

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
