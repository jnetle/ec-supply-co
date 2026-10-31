import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { CalendarEvent } from "@/lib/content/calendar";
import { describeWixError } from "@/lib/wix";
import { getWixCalendarEvents } from "@/lib/wix-events";

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
 * The calendar's events: published Wix events, from the shared cache. If Wix
 * fails, the calendar falls back to its empty state rather than an error page.
 */
export const getCalendarEvents = cache(
  async (): Promise<CalendarEvent[]> => {
    try {
      return await cachedWixEvents();
    } catch (error) {
      console.error("Loading Wix events failed", describeWixError(error));
      return [];
    }
  },
);
