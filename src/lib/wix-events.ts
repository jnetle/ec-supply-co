import "server-only";

import type { wixEventsV2 } from "@wix/events";

import {
  CATEGORIES,
  SHOP_TIME_ZONE,
  type Availability,
  type CalendarEvent,
  type EventCategory,
  type Seats,
} from "@/lib/content/calendar";
import { MAX_RSVP_SEATS } from "@/lib/form-limits";
import type { IcsEvent } from "@/lib/ics";
import { getMakers } from "@/lib/makers";
import { SITE_NAME } from "@/lib/site";
import { getWixClient } from "@/lib/wix";
import { WIX_MEDIA } from "@/lib/wix-media";

/** A Wix Events category naming who runs the event: "Host: Rosa Delgado". */
const HOST_CATEGORY = /^host:\s*(.+)$/i;

/** "Food Pop-up" → "foodpopup", so a category matches however it's typed. */
const squash = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

/**
 * Wix Events category name, squashed → the calendar category it sets. Both
 * the label ("Food popup") and the key ("Popup") count.
 */
const TYPE_CATEGORIES = new Map(
  (Object.keys(CATEGORIES) as EventCategory[]).flatMap((key) => [
    [squash(CATEGORIES[key].label), key] as const,
    [squash(key), key] as const,
  ]),
);

type RichNode = NonNullable<wixEventsV2.RichContent["nodes"]>[number];

function nodeText(node: RichNode): string {
  const ownText = node.textData?.text ?? "";
  const childText = node.nodes?.map(nodeText).join("") ?? "";
  return ownText + childText;
}

function descriptionText(event: wixEventsV2.Event): string | undefined {
  const richText = event.description?.nodes
    ?.map(nodeText)
    .map((text) => text.trim())
    .filter(Boolean)
    .join("\n");

  return richText || event.shortDescription || undefined;
}

function locationText(event: wixEventsV2.Event): string | undefined {
  const location = event.location;
  if (!location) return undefined;
  if (location.type === "ONLINE") return location.name || "Online event";

  const values = [location.name, location.address?.formatted].filter(
    (value): value is string => Boolean(value),
  );

  return [...new Set(values)].join(", ") || undefined;
}

function toIcsEvent(event: wixEventsV2.Event): IcsEvent | undefined {
  const start = event.dateAndTimeSettings?.startDate;
  if (!event._id || !event.title || !start) return undefined;

  return {
    id: event._id,
    title: event.title,
    description: descriptionText(event),
    location: locationText(event),
    start,
    end: event.dateAndTimeSettings?.endDate ?? undefined,
    created: event._createdDate ?? undefined,
    updated: event._updatedDate ?? undefined,
    url: event.eventPageUrl || undefined,
    canceled: event.status === "CANCELED",
  };
}

async function queryPublishedEvents(
  fields: wixEventsV2.RequestedFieldsWithLiterals[],
): Promise<wixEventsV2.Event[]> {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1_000);

  let page = await getWixClient()
    .wixEventsV2.queryEvents({ fields, includeDrafts: false })
    .ge("dateAndTimeSettings.startDate", sixtyDaysAgo)
    .ascending("dateAndTimeSettings.startDate")
    .limit(100)
    .find();

  const events = [...page.items];
  while (page.hasNext()) {
    page = await page.next();
    events.push(...page.items);
  }

  return events;
}

export async function getPublishedWixEvents(): Promise<IcsEvent[]> {
  const events = await queryPublishedEvents(["DETAILS", "TEXTS", "URLS"]);

  return events.flatMap((event) => {
    const normalized = toIcsEvent(event);
    return normalized ? [normalized] : [];
  });
}

// en-CA formats as YYYY-MM-DD; en-GB with h23 as "18:30".
const shopDate = new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIME_ZONE });
const shopTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: SHOP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * The event's category names. The CATEGORIES fieldset returns them, but the
 * SDK's Event type leaves the field out, so it is read defensively.
 */
function categoryNames(event: wixEventsV2.Event): string[] {
  const { categories } = event as {
    categories?: { categories?: { name?: string }[] } | { name?: string }[];
  };
  const list = Array.isArray(categories) ? categories : categories?.categories;
  return (list ?? []).flatMap((category) => {
    const name = category.name?.trim();
    return name ? [name] : [];
  });
}

/**
 * The SDK hands images over as "wix:image://v1/<media id>/<file>#…"; the
 * original upload lives at WIX_MEDIA + media id, which WixImage resizes.
 */
function photoUrl(image: string | undefined): string | undefined {
  const mediaId = image?.match(/^wix:image:\/\/v1\/([^/#]+)/)?.[1];
  return mediaId ? `${WIX_MEDIA}${mediaId}` : undefined;
}

function availability(registration: wixEventsV2.Registration): Availability {
  if (registration.registrationDisabled || registration.registrationPaused) {
    return "closed";
  }

  switch (registration.status) {
    case "OPEN_RSVP":
      return "open";
    case "OPEN_RSVP_WAITLIST_ONLY":
      return "waitlist";
    default:
      // Closed by hand, not open yet, or closed automatically once the guest
      // limit or the deadline is reached — Wix doesn't say which.
      return "closed";
  }
}

/**
 * Seats one RSVP may save. Extra guests need the RSVP form's guests question
 * (Wix rejects them otherwise), and its names field caps how many.
 */
function maxSeats(form: wixEventsV2.Form | undefined): number {
  const guests = form?.controls?.find(
    (control) => control.type === "GUEST_CONTROL",
  );
  if (!guests) return 1;
  const names = guests.inputs?.find((input) => input.name === "guestNames");
  return Math.min(MAX_RSVP_SEATS, 1 + (names?.maxSize ?? MAX_RSVP_SEATS));
}

/**
 * Free events only, for now: paid tickets and outside sign-ups are skipped.
 * A "Drop-in" category makes any event drop-in, since Wix's dashboard doesn't
 * always offer an event with no registration at all.
 */
function seatsFor(
  event: wixEventsV2.Event,
  names: string[],
): Seats | undefined {
  const registration = event.registration;
  if (
    !registration?.type ||
    registration.type === "NONE" ||
    names.some((name) => squash(name) === "dropin")
  ) {
    return { kind: "drop-in" };
  }
  if (registration.type === "RSVP") {
    return {
      kind: "rsvp",
      availability: availability(registration),
      maxSeats: maxSeats(event.form),
    };
  }

  console.warn(
    `Skipping Wix event "${event.title}": only RSVP and no-registration events are supported, not ${registration.type}`,
  );
  return undefined;
}

function toCalendarEvent(event: wixEventsV2.Event): CalendarEvent | undefined {
  const start = event.dateAndTimeSettings?.startDate;
  const end = event.dateAndTimeSettings?.endDate;
  if (!event._id || !event.title || !start) return undefined;
  if (event.status === "CANCELED") return undefined;

  const names = categoryNames(event);
  const seats = seatsFor(event, names);
  if (!seats) return undefined;

  const category = names
    .map((name) => TYPE_CATEGORIES.get(squash(name)))
    .find((key) => key !== undefined);
  if (!category) {
    console.warn(
      `Wix event "${event.title}" has none of the categories ${Object.values(
        CATEGORIES,
      )
        .map(({ label }) => `"${label}"`)
        .join(", ")}, so it is shown as Community`,
    );
  }

  const host = names
    .map((name) => name.match(HOST_CATEGORY)?.[1]?.trim())
    .find(Boolean);

  return {
    id: event._id,
    date: shopDate.format(start),
    start: shopTime.format(start),
    end: end ? shopTime.format(end) : undefined,
    startsAt: start.toISOString(),
    endsAt: end?.toISOString(),
    // Nothing at the shop starts at midnight, so a 12am start means the time
    // isn't set yet. Wix's own "TBD" setting would hide the date as well.
    timeTba: shopTime.format(start) === "00:00" || undefined,
    category: category ?? "community",
    title: event.title,
    host: host ?? SITE_NAME,
    photo: photoUrl(event.mainImage),
    price: 0,
    seats,
    description: event.shortDescription?.trim() || descriptionText(event) || "",
  };
}

/** Links a host who is also one of the shop's makers to the maker's website. */
async function withHostWebsites(
  events: CalendarEvent[],
): Promise<CalendarEvent[]> {
  let websites: Map<string, string>;
  try {
    const makers = await getMakers();
    websites = new Map(
      makers.flatMap((maker) =>
        maker.website
          ? [[maker.name.toLowerCase(), maker.website] as const]
          : [],
      ),
    );
  } catch (error) {
    console.error("Loading makers for event hosts failed", error);
    return events;
  }

  return events.map((event) => {
    const hostUrl = websites.get(event.host.toLowerCase());
    return hostUrl ? { ...event, hostUrl } : event;
  });
}

/** Published free Wix events, shaped for the calendar. */
export async function getWixCalendarEvents(): Promise<CalendarEvent[]> {
  const events = await queryPublishedEvents([
    "DETAILS",
    "TEXTS",
    "REGISTRATION",
    "FORM",
    "CATEGORIES",
  ]);

  return withHostWebsites(
    events.flatMap((event) => {
      const mapped = toCalendarEvent(event);
      return mapped ? [mapped] : [];
    }),
  );
}
