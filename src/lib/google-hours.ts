import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { SHOP_ADDRESS } from "@/lib/content/nav";
import { env } from "@/lib/env";

const PLACES = "https://places.googleapis.com/v1";

/** One opening span. `day` is 0 for Sunday; minutes count from midnight. */
export type OpenPeriod = {
  openDay: number;
  openMinute: number;
  /** Missing when the shop is open around the clock. */
  closeDay?: number;
  closeMinute?: number;
};

export type ShopHours = {
  /** Seven rows, Monday first, as Google words them ("11:00 AM – 6:00 PM"). */
  days: { day: number; name: string; hours: string }[];
  periods: OpenPeriod[];
};

type PlacePoint = { day?: number; hour?: number; minute?: number };
type PlaceHours = {
  weekdayDescriptions?: string[];
  periods?: { open?: PlacePoint; close?: PlacePoint }[];
};

async function placesFetch<T>(path: string, fields: string) {
  const key = env.googlePlacesApiKey();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const response = await fetch(`${PLACES}${path}`, {
    cache: "no-store",
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fields,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Places API ${response.status}: ${(await response.text()).slice(0, 300)}`,
    );
  }
  return (await response.json()) as T;
}

function toPoint(point: PlacePoint) {
  return {
    day: point.day ?? 0,
    minute: (point.hour ?? 0) * 60 + (point.minute ?? 0),
  };
}

function toShopHours(hours: PlaceHours | undefined): ShopHours | null {
  const lines = hours?.weekdayDescriptions;
  if (!lines || lines.length !== 7) return null;

  return {
    days: lines.map((line, index) => {
      const split = line.indexOf(": ");
      return {
        // Google lists Monday first; Monday is day 1.
        day: (index + 1) % 7,
        name: split === -1 ? "" : line.slice(0, split),
        hours: split === -1 ? line : line.slice(split + 2),
      };
    }),
    periods: (hours.periods ?? []).flatMap(({ open, close }) => {
      if (!open) return [];
      const start = toPoint(open);
      const end = close ? toPoint(close) : undefined;
      return [
        {
          openDay: start.day,
          openMinute: start.minute,
          closeDay: end?.day,
          closeMinute: end?.minute,
        },
      ];
    }),
  };
}

// Hours refresh hourly, which keeps the page within an hour of the profile
// and well inside Google's free monthly allowance. It caches the raw load,
// which throws on failure, so an outage is never stored as "no hours".
const cachedHours = unstable_cache(
  async () => {
    // The current week's hours include special hours and holiday closures.
    const place = await placesFetch<{
      currentOpeningHours?: PlaceHours;
      regularOpeningHours?: PlaceHours;
    }>(
      `/places/${SHOP_ADDRESS.googlePlaceId}?languageCode=en`,
      "currentOpeningHours,regularOpeningHours",
    );
    return (
      toShopHours(place.currentOpeningHours) ??
      toShopHours(place.regularOpeningHours)
    );
  },
  ["google-shop-hours"],
  { revalidate: 60 * 60 },
);

/**
 * The shop's hours from its Google Business Profile, or null when there's no
 * key, no hours on the profile, or Google fails. Callers fall back to a link.
 */
export const getShopHours = cache(async (): Promise<ShopHours | null> => {
  if (!env.googlePlacesApiKey()) return null;
  try {
    return await cachedHours();
  } catch (error) {
    console.error("Loading Google hours failed", error);
    return null;
  }
});
