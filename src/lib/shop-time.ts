import { SHOP_TIME_ZONE } from "@/lib/content/calendar";

const wallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: SHOP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

/** How far the shop's clock is ahead of UTC (negative here) at an instant. */
function shopOffset(instant: number): number {
  const part = Object.fromEntries(
    wallClock
      .formatToParts(instant)
      .map(({ type, value }) => [type, Number(value)]),
  );
  const wall = Date.UTC(
    part.year,
    part.month - 1,
    part.day,
    part.hour,
    part.minute,
  );
  return wall - Math.floor(instant / 60_000) * 60_000;
}

/**
 * "2026-12-13" + "11:00" in shop time → its ISO instant. The offset is
 * checked again at the result, so a time on a clock-change day lands on the
 * right side of it.
 */
export function shopInstant(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  let instant = asUtc - shopOffset(asUtc);
  const settled = shopOffset(instant);
  if (settled !== asUtc - instant) instant = asUtc - settled;
  return new Date(instant).toISOString();
}

// en-CA formats as YYYY-MM-DD.
const shopDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
});

/** An instant's day in shop time, as YYYY-MM-DD. */
export const shopDateOf = (instant: Date | string) =>
  shopDateFormat.format(new Date(instant));
