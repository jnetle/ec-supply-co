import "server-only";

import { cache } from "react";

import { shopTodayKey } from "@/components/calendar/event-model";
import type { Maker } from "@/lib/content/makers";
import { getWixClient } from "@/lib/wix";
import { WIX_MEDIA } from "@/lib/wix-media";

/** The Wix CMS collection ID, from the collection's settings in the dashboard. */
const LOCAL_MAKERS_COLLECTION = "LocalMakers";

/** How many makers the home page spotlight shows. */
const SPOTLIGHT_SIZE = 4;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

// Editors type addresses by hand: "rosaceramics.com" would otherwise become a
// relative link, and anything that isn't http(s) has no place in an href.
function websiteUrl(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
  try {
    const url = new URL(hasScheme ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

// CMS fields can be left blank, so every one is checked rather than trusted.
function fromWix(item: Record<string, unknown>): Maker | undefined {
  const name = text(item.title);
  if (!name) return undefined;

  const image = item.image as { id?: unknown; altText?: unknown } | undefined;
  const imageId = text(image?.id);
  const makerName = text(item.makerName);

  return {
    id: String(item._id),
    name,
    makerName: makerName === name ? undefined : makerName,
    craft: text(item.category) ?? "",
    since: typeof item.since === "number" ? item.since : undefined,
    bio: text(item.description) ?? "",
    // The original upload rather than Wix's pre-cropped URL; WixImage asks
    // Wix's CDN for each size the page needs.
    photo: imageId
      ? {
          src: `${WIX_MEDIA}${imageId}`,
          alt: text(image?.altText) ?? `Portrait of ${name}`,
        }
      : undefined,
    website: websiteUrl(item.website),
    featured: item.featured === true,
    added: item._createdDate instanceof Date ? shopTodayKey(item._createdDate) : undefined,
  };
}

/**
 * Every maker from Wix, in the order they were added. Pages show them through
 * getSpotlightMakers or getDirectoryMakers, which rotate the order. If Wix is
 * unconfigured, the roster comes back empty. If Wix is unreachable, this
 * throws: a background regeneration then keeps serving the last good page
 * instead of caching an empty roster, and a build fails rather than deploy
 * one. Memoized per request.
 */
export const getMakers = cache(async (): Promise<Maker[]> => {
  let client: ReturnType<typeof getWixClient>;
  try {
    client = getWixClient();
  } catch (error) {
    console.error(`Loading the ${LOCAL_MAKERS_COLLECTION} collection skipped`, error);
    return [];
  }

  try {
    const { items } = await client.items
      .query(LOCAL_MAKERS_COLLECTION)
      .ascending("_createdDate")
      .limit(1000)
      .find();
    return items.map(fromWix).filter((maker) => maker !== undefined);
  } catch (error) {
    console.error(`Loading the ${LOCAL_MAKERS_COLLECTION} collection failed`, error);
    throw error;
  }
});

/** 2024-01-01, day 0 of the rotation. */
const DAY_EPOCH = Date.UTC(2024, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

/** The day the site went live, where the spotlight's turn-taking starts. */
const LAUNCH_DAY = "2026-10-19";

/** Whole days from the epoch to a YYYY-MM-DD shop day. */
function dayOf(key: string) {
  return Math.round((Date.parse(key) - DAY_EPOCH) / DAY_MS);
}

/** Whole days since the epoch, turning over at midnight Pacific. */
function dayNumber(now: Date) {
  return dayOf(shopTodayKey(now));
}

/** Fisher–Yates driven by mulberry32, so the same seed gives the same order. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sorted by id first, so the order doesn't hang on how Wix returns items.
function byId(makers: Maker[]) {
  return [...makers].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Four makers, changing daily: whoever has waited longest since their last
 * turn, with the day's shuffle settling ties. Nothing is stored, so every
 * render replays the line from launch day, letting each maker join the day
 * after they were added to Wix. A new maker therefore goes straight to the
 * front, and nobody loses their place when the roster grows. The first card,
 * the one phones show first and the 404 page borrows, goes to whichever of the
 * four has waited longest for it. Deterministic, so every render on a given
 * day agrees.
 */
export async function getSpotlightMakers(now = new Date()): Promise<Maker[]> {
  const makers = byId(await getMakers());
  const launch = dayOf(LAUNCH_DAY);
  const today = Math.max(dayNumber(now), launch);
  // Joining the next day keeps today's four from changing mid-day.
  const joins = new Map(
    makers.map((m) => [m, m.added ? Math.max(dayOf(m.added) + 1, launch) : launch]),
  );

  const lastTurn = new Map<Maker, number>();
  const lastFirst = new Map<Maker, number>();
  const waited = (last: Map<Maker, number>) => (a: Maker, b: Maker) =>
    (last.get(a) ?? -1) - (last.get(b) ?? -1);

  for (let day = launch; ; day++) {
    const picked = seededShuffle(
      makers.filter((m) => joins.get(m)! <= day),
      day,
    )
      .sort(waited(lastTurn))
      .slice(0, SPOTLIGHT_SIZE);
    const [first] = [...picked].sort(waited(lastFirst));

    if (day === today) return first ? [first, ...picked.filter((m) => m !== first)] : [];
    for (const maker of picked) lastTurn.set(maker, day);
    if (first) lastFirst.set(first, day);
  }
}

/** The whole roster in a fresh order each day, so nobody always heads the page. */
export async function getDirectoryMakers(now = new Date()): Promise<Maker[]> {
  return seededShuffle(byId(await getMakers()), dayNumber(now));
}
