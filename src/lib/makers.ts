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
  };
}

/**
 * Every maker from Wix, in the order they were added. Pages show them through
 * getSpotlightMakers or getDirectoryMakers, which rotate the order. If Wix is
 * unreachable or unconfigured, the roster comes back empty rather than failing
 * the page. Memoized per request.
 */
export const getMakers = cache(async (): Promise<Maker[]> => {
  try {
    const { items } = await getWixClient()
      .items.query(LOCAL_MAKERS_COLLECTION)
      .ascending("_createdDate")
      .limit(1000)
      .find();
    return items.map(fromWix).filter((maker) => maker !== undefined);
  } catch (error) {
    console.error(`Loading the ${LOCAL_MAKERS_COLLECTION} collection failed`, error);
    return [];
  }
});

/** 2024-01-01, day 0 of the rotation. */
const DAY_EPOCH = Date.UTC(2024, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days since the epoch, turning over at midnight Pacific. */
function dayNumber(now: Date) {
  return Math.round((Date.parse(shopTodayKey(now)) - DAY_EPOCH) / DAY_MS);
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
 * Four makers, changing daily. The roster is reshuffled once per cycle and the
 * cycles are laid end to end, so each day takes the next four in line and
 * everyone gets the same number of turns, whatever the roster's size. The
 * reshuffle means nobody is stuck with the same weekday, card position or
 * neighbours. Deterministic rather than random, so every render on a given day
 * agrees.
 */
export async function getSpotlightMakers(now = new Date()): Promise<Maker[]> {
  const makers = byId(await getMakers());
  if (makers.length <= SPOTLIGHT_SIZE) return seededShuffle(makers, dayNumber(now));

  const cycles = new Map<number, Maker[]>();
  const inLine = (position: number) => {
    const cycle = Math.floor(position / makers.length);
    if (!cycles.has(cycle)) cycles.set(cycle, seededShuffle(makers, cycle));
    return cycles.get(cycle)![position % makers.length];
  };

  // A day that straddles two cycles can meet the same maker twice; the repeat
  // is skipped for whoever comes next.
  const picked: Maker[] = [];
  for (let p = dayNumber(now) * SPOTLIGHT_SIZE; picked.length < SPOTLIGHT_SIZE; p++) {
    const maker = inLine(p);
    if (!picked.includes(maker)) picked.push(maker);
  }
  return picked;
}

/** The whole roster in a fresh order each day, so nobody always heads the page. */
export async function getDirectoryMakers(now = new Date()): Promise<Maker[]> {
  return seededShuffle(byId(await getMakers()), dayNumber(now));
}
