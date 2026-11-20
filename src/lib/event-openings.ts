import type { CalendarEvent } from "@/lib/content/calendar";
import { shopDateOf, shopInstant } from "@/lib/shop-time";

/**
 * A sign-up link can carry its go-live time, so it can be put in Wix ahead of
 * time: `https://luma.com/abc?utm_source=website#opens=2026-11-20T12:00`,
 * in shop time (Pacific), 24-hour. Until then the event shows as a save the
 * date with no link; see `applyOpenings`.
 */
const OPENS_TAG = /#opens=(.*)$/;
const OPENS_VALUE =
  /^(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))T((?:[01]\d|2[0-3]):[0-5]\d)$/;

/**
 * The link without its `#opens=` tag, and the tag's instant. A tag that
 * doesn't read as a date and time is dropped with a warning, and the link
 * goes up straight away: better early than hidden forever by a typo.
 */
export function splitOpens(
  url: string,
  title: string,
): { url: string; opensAt?: string } {
  const tag = url.match(OPENS_TAG);
  if (!tag) return { url };

  const bare = url.slice(0, tag.index);
  const value = tag[1].match(OPENS_VALUE);
  if (!value) {
    console.warn(
      `Wix event "${title}" has a sign-up link tagged "#opens=${tag[1]}"; write it as #opens=YYYY-MM-DDTHH:MM (Pacific). Showing the link now.`,
    );
    return { url: bare };
  }
  return { url: bare, opensAt: shopInstant(value[1], value[2]) };
}

/**
 * Holds back each sign-up link whose go-live time hasn't come: the event
 * shows as a save the date ("Sign-ups open Nov 20, 12pm") and the link is
 * dropped here, on the server, so it isn't in the page for anyone to find.
 * Run on every request, after any cache, so the button shows on time.
 */
export function applyOpenings(
  events: CalendarEvent[],
  now = new Date(),
): CalendarEvent[] {
  return events.map((event) => {
    const { seats } = event;
    if (seats.kind !== "external" || !seats.opensAt) return event;
    if (Date.parse(seats.opensAt) <= now.getTime()) return event;
    return {
      ...event,
      seats: {
        kind: "soon",
        opens: shopDateOf(seats.opensAt),
        opensAt: seats.opensAt,
      },
    };
  });
}
