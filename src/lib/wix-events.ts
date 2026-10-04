import "server-only";

import type { wixEventsV2 } from "@wix/events";

import type { IcsEvent } from "@/lib/ics";
import { getWixClient } from "@/lib/wix";

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

export async function getPublishedWixEvents(): Promise<IcsEvent[]> {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1_000);

  let page = await getWixClient()
    .wixEventsV2.queryEvents({
      fields: ["DETAILS", "TEXTS", "URLS"],
      includeDrafts: false,
    })
    .ge("dateAndTimeSettings.startDate", sixtyDaysAgo)
    .ascending("dateAndTimeSettings.startDate")
    .limit(100)
    .find();

  const events = [...page.items];
  while (page.hasNext()) {
    page = await page.next();
    events.push(...page.items);
  }

  return events.flatMap((event) => {
    const normalized = toIcsEvent(event);
    return normalized ? [normalized] : [];
  });
}
