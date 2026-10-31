import {
  lastDayOf,
  nextDay,
  shopTodayKey,
} from "@/components/calendar/event-model";
import {
  MOCK_EVENTS_PREVIEW,
  type CalendarEvent,
} from "@/lib/content/calendar";
import { SHOP_ADDRESS } from "@/lib/content/nav";
import { createCalendar, type IcsEvent } from "@/lib/ics";
import { mockCalendarEvents } from "@/lib/mock-events";
import { SITE_NAME } from "@/lib/site";
import { describeWixError } from "@/lib/wix";
import { getCachedWixEvents } from "@/lib/events";

const LOCATION = `${SITE_NAME}, ${SHOP_ADDRESS.street}, ${SHOP_ADDRESS.city}`;

/** Wix event IDs are GUIDs; anything else is turned away before calling Wix. */
const WIX_EVENT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A calendar event as an .ics entry. One without a set time is all day, and
 * so is a run of days, across all of them, since its hours vary.
 */
function toIcsEvent(event: CalendarEvent): IcsEvent {
  const shared = {
    id: event.id,
    title: event.title,
    description: event.description,
    location: LOCATION,
  };
  if (event.timeTba || event.lastDate) {
    return {
      ...shared,
      allDay: true,
      start: new Date(`${event.date}T00:00:00Z`),
      end: new Date(`${nextDay(lastDayOf(event))}T00:00:00Z`),
    };
  }
  return {
    ...shared,
    start: new Date(event.startsAt),
    end: event.endsAt ? new Date(event.endsAt) : undefined,
  };
}

/**
 * One event as an .ics file, for "Add to calendar" in the event dialog. Apple
 * Calendar opens it straight from the link; Outlook and others import it.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/events/[id]">,
) {
  const { id } = await ctx.params;

  let event: CalendarEvent | undefined;
  if (MOCK_EVENTS_PREVIEW.allowed && id.startsWith("mock-")) {
    event = mockCalendarEvents(shopTodayKey()).find((e) => e.id === id);
  } else if (WIX_EVENT_ID.test(id)) {
    try {
      event = (await getCachedWixEvents()).find((e) => e.id === id);
    } catch (error) {
      console.error(
        "Loading a Wix event for its .ics failed",
        describeWixError(error),
      );
      return new Response("Couldn't load this event. Please try again.", {
        status: 502,
      });
    }
  }

  if (!event) return new Response("Event not found.", { status: 404 });

  const filename =
    event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "event";

  return new Response(createCalendar([toIcsEvent(event)]), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Content-Disposition": `inline; filename="${filename}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
