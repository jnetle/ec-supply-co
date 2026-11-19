import "server-only";

import ICAL from "ical.js";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { SHOP_TIME_ZONE } from "@/lib/content/calendar";
import {
  AVAILABILITY_DAYS,
  BOOKING_BUFFER_MINUTES,
  MIN_WINDOW_MINUTES,
  RENTAL_DAY,
} from "@/lib/content/host-with-us";
import { env } from "@/lib/env";

/** A free stretch of one day, in minutes from midnight, shop time. */
export type FreeWindow = { start: number; end: number };

/** One day of the availability calendar; no windows means it's booked up. */
export type AvailabilityDay = {
  date: string;
  windows: FreeWindow[];
  /**
   * An all-day event covers it, such as the weekly no-events day: shown as
   * "Closed" rather than "Booked".
   */
  closed?: true;
};

/**
 * What /host-with-us shows. Only the free windows: nothing about what's on
 * the calendar (titles, notes, guests) ever leaves this file.
 */
export type ShopAvailability = { days: AvailabilityDay[] };

type Span = { start: number; end: number; allDay?: true };

const DAY_MINUTES = 24 * 60;

/**
 * Stops a runaway rule from spinning forever. Occurrences are walked from the
 * series' first day, so this has to cover years of a daily shift.
 */
const MAX_OCCURRENCES_PER_EVENT = 20_000;

const shopParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** An instant as its shop-time date key and minute of the day. */
function toShopTime(date: Date): { day: string; minute: number } {
  const parts = Object.fromEntries(
    shopParts.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** The ISO date `count` days after `date`. */
function addDays(date: string, count: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + count);
  return next.toISOString().slice(0, 10);
}

/** Every date key from `first` up to, but not including, `end`. */
function* daysBetween(first: string, end: string) {
  for (let day = first; day < end; day = addDays(day, 1)) yield day;
}

/**
 * Adds one occurrence to the busy spans of each shop day it touches. All-day
 * events block their whole days; timed ones crossing midnight are split.
 */
function markBusy(busy: Map<string, Span[]>, start: ICAL.Time, end: ICAL.Time) {
  const add = (day: string, span: Span) => {
    if (!busy.has(day)) return; // Outside the window we show.
    busy.get(day)!.push(span);
  };

  if (start.isDate) {
    // An all-day end is exclusive; a missing or equal end still covers the day.
    const first = start.toString().slice(0, 10);
    const last = end.isDate ? end.toString().slice(0, 10) : first;
    for (const day of daysBetween(
      first,
      last > first ? last : addDays(first, 1),
    )) {
      add(day, { start: 0, end: DAY_MINUTES, allDay: true });
    }
    return;
  }

  const from = toShopTime(start.toJSDate());
  const to = toShopTime(end.toJSDate());
  if (from.day === to.day) {
    add(from.day, {
      start: from.minute,
      end: Math.max(to.minute, from.minute),
    });
    return;
  }
  add(from.day, { start: from.minute, end: DAY_MINUTES });
  for (const day of daysBetween(addDays(from.day, 1), to.day)) {
    add(day, { start: 0, end: DAY_MINUTES });
  }
  if (to.minute > 0) add(to.day, { start: 0, end: to.minute });
}

/** Whether an occurrence takes up time: not cancelled, not marked "Free". */
function blocksTime(component: ICAL.Component) {
  const status = String(component.getFirstPropertyValue("status") ?? "");
  const transp = String(component.getFirstPropertyValue("transp") ?? "");
  return (
    status.toUpperCase() !== "CANCELLED" &&
    transp.toUpperCase() !== "TRANSPARENT"
  );
}

/** The rental day minus the (padded) busy spans, keeping the long gaps. */
function freeWindows(spans: Span[]): FreeWindow[] {
  const padded = spans
    .map((span) => ({
      start: span.start - BOOKING_BUFFER_MINUTES,
      end: span.end + BOOKING_BUFFER_MINUTES,
    }))
    .sort((a, b) => a.start - b.start);

  const windows: FreeWindow[] = [];
  let cursor = RENTAL_DAY.startMinute;
  for (const span of padded) {
    if (span.start > cursor) {
      windows.push({
        start: cursor,
        end: Math.min(span.start, RENTAL_DAY.endMinute),
      });
    }
    cursor = Math.max(cursor, span.end);
    if (cursor >= RENTAL_DAY.endMinute) break;
  }
  if (cursor < RENTAL_DAY.endMinute) {
    windows.push({ start: cursor, end: RENTAL_DAY.endMinute });
  }
  return windows.filter(
    (window) => window.end - window.start >= MIN_WINDOW_MINUTES,
  );
}

/** Parses the calendar and works out each day's free windows from `today`. */
export function availabilityFromIcs(
  ics: string,
  today: string,
): ShopAvailability {
  const calendar = new ICAL.Component(ICAL.parse(ics));

  // Google sends the zones its events use; register them so local times convert.
  for (const zone of calendar.getAllSubcomponents("vtimezone")) {
    ICAL.TimezoneService.register(zone);
  }

  const end = addDays(today, AVAILABILITY_DAYS);
  const busy = new Map<string, Span[]>(
    [...daysBetween(today, end)].map((day) => [day, []]),
  );
  // An instant safely past the last day shown, in any zone.
  const horizon = new Date(`${addDays(end, 1)}T12:00:00Z`).getTime();
  // An instant safely before today, so overnight events from yesterday count.
  const since = new Date(`${addDays(today, -1)}T00:00:00Z`).getTime();

  // Group by UID: a repeating event's moved or edited occurrences come as
  // separate VEVENTs that share its UID and carry a RECURRENCE-ID.
  const byUid = new Map<
    string,
    { master?: ICAL.Event; exceptions: ICAL.Event[] }
  >();
  for (const component of calendar.getAllSubcomponents("vevent")) {
    const event = new ICAL.Event(component);
    const entry = byUid.get(event.uid) ?? { exceptions: [] };
    if (event.isRecurrenceException()) entry.exceptions.push(event);
    else entry.master = event;
    byUid.set(event.uid, entry);
  }

  for (const { master, exceptions } of byUid.values()) {
    if (!master) {
      // An edited occurrence whose series isn't in the feed: take it as it is.
      for (const event of exceptions) {
        if (blocksTime(event.component))
          markBusy(busy, event.startDate, event.endDate);
      }
      continue;
    }

    if (!master.isRecurring()) {
      if (blocksTime(master.component))
        markBusy(busy, master.startDate, master.endDate);
      continue;
    }

    for (const exception of exceptions) master.relateException(exception);
    const iterator = master.iterator();
    for (let i = 0; i < MAX_OCCURRENCES_PER_EVENT; i++) {
      const next = iterator.next();
      if (!next) break;
      const details = master.getOccurrenceDetails(next);
      if (details.startDate.toJSDate().getTime() > horizon) break;
      if (details.endDate.toJSDate().getTime() < since) continue;
      if (blocksTime(details.item.component)) {
        markBusy(busy, details.startDate, details.endDate);
      }
    }
  }

  return {
    days: [...busy].map(([date, spans]) => ({
      date,
      windows: freeWindows(spans),
      ...(spans.some((span) => span.allDay) && { closed: true as const }),
    })),
  };
}

async function loadIcs(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Shop calendar ${response.status}`);
  const text = await response.text();
  // The calendar's settings page lists several links; only the iCal ones
  // (ending in .ics) are feeds. The embed and public URLs are web pages.
  if (!text.trimStart().startsWith("BEGIN:VCALENDAR")) {
    throw new Error(
      "GOOGLE_CALENDAR_ICS_URL isn't a calendar feed. Use the calendar's “Public address in iCal format” or “Secret address in iCal format”, ending in .ics.",
    );
  }
  return text;
}

// Reloads every 15 minutes, so a new booking shows within the quarter hour.
// It caches the worked-out windows (the raw feed can outgrow the data
// cache), and throws on failure, so an outage is never stored as "wide open".
const cachedAvailability = unstable_cache(
  async (today: string) => {
    const url = env.googleCalendarIcsUrl();
    if (!url) throw new Error("GOOGLE_CALENDAR_ICS_URL is not set");
    return availabilityFromIcs(await loadIcs(url), today);
  },
  ["shop-availability"],
  { revalidate: 15 * 60 },
);

/**
 * Free windows for the coming weeks, from the shop's Google Calendar, or
 * null when there's no calendar address or it can't be read. Callers fall
 * back to asking for a date in the form.
 */
export const getShopAvailability = cache(
  async (today: string): Promise<ShopAvailability | null> => {
    if (!env.googleCalendarIcsUrl()) return null;
    try {
      return await cachedAvailability(today);
    } catch (error) {
      // Only the message: never anything that could carry the address, which
      // works as a password to the calendar.
      console.error(
        "Loading shop availability failed:",
        error instanceof Error ? error.message : "unknown error",
      );
      return null;
    }
  },
);
