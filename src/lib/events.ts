import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import {
  CALENDAR_EVENTS,
  EVENTS_ENABLED,
  type CalendarEvent,
} from "@/lib/content/calendar";
import { describeWixError } from "@/lib/wix";
import { getWixCalendarEvents } from "@/lib/wix-events";

async function loadWixEvents(): Promise<CalendarEvent[]> {
  try {
    return await getWixCalendarEvents();
  } catch (error) {
    // The calendar falls back to its empty state rather than an error page.
    console.error("Loading Wix events failed", describeWixError(error));
    return [];
  }
}

// Public visitors share one copy for a minute, so a busy day isn't a Wix call
// per page view. Spots left can lag Wix by that long. It caches the raw load,
// which throws on failure, so a Wix hiccup is never stored as "no events".
const cachedWixEvents = unstable_cache(
  getWixCalendarEvents,
  ["wix-calendar-events"],
  { revalidate: 60 },
);

/** Published Wix events from the shared one-minute cache. Throws if Wix does. */
export const getCachedWixEvents = () => cachedWixEvents();

/**
 * The calendar's events. Wix Events once EVENTS_ENABLED is on; before that,
 * only for a preview, and otherwise the (empty) built-in list. A preview skips
 * the cache, so an event edited in Wix shows up on the next reload.
 */
export const getCalendarEvents = cache(
  async (preview: boolean): Promise<CalendarEvent[]> => {
    if (preview) return loadWixEvents();
    if (!EVENTS_ENABLED) return CALENDAR_EVENTS;
    try {
      return await cachedWixEvents();
    } catch (error) {
      // The calendar falls back to its empty state rather than an error page.
      console.error("Loading Wix events failed", describeWixError(error));
      return [];
    }
  },
);
