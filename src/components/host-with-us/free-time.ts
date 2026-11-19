import { formatTime } from "@/components/calendar/event-model";
import type { FreeWindow } from "@/lib/shop-availability";

const pad = (n: number) => String(n).padStart(2, "0");

/** Minutes from midnight as "HH:MM". */
export const clock = (minute: number) =>
  `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;

/** Minutes from midnight as "4:30pm". */
export const timeLabel = (minute: number) => formatTime(clock(minute));

/** "8–10:30am", "6:30–10pm", "11am–2pm": one suffix when both share it. */
export function windowLabel({ start, end }: FreeWindow) {
  const from = timeLabel(start);
  const to = timeLabel(end);
  const sameHalf = from.slice(-2) === to.slice(-2);
  return `${sameHalf ? from.slice(0, -2) : from}–${to}`;
}

/** A date key read as a plain date, whatever the visitor's time zone. */
const asDate = (date: string) => new Date(`${date}T12:00:00Z`);

/** "Thursday, November 19". */
export function longDate(date: string) {
  return asDate(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** "Thu, Nov 19". */
export function mediumDate(date: string) {
  return asDate(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Blocks snap to the half hour. */
export const STEP_MINUTES = 30;

/** The shortest event a block can be. */
export const SHORTEST_EVENT_MINUTES = 60;

/** The length an event starts at when a day is picked. */
export const DEFAULT_EVENT_MINUTES = 2 * 60;

/** Rounds minutes to the nearest step. */
export const snap = (minutes: number) =>
  Math.round(minutes / STEP_MINUTES) * STEP_MINUTES;

/** "1 hr", "2½ hrs", "3 hrs". */
export function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const half = minutes % 60 >= 30 ? "½" : "";
  return `${hours}${half} ${hours === 1 && !half ? "hr" : "hrs"}`;
}

/** A picked time: one day, from `start` to `end` in minutes from midnight. */
export type PickedSlot = { date: string; start: number; end: number };

/** "Tue, Nov 24 · 4:30–7:30pm (3 hrs)". */
export function slotLabel({ date, start, end }: PickedSlot) {
  return `${mediumDate(date)} · ${windowLabel({ start, end })} (${durationLabel(end - start)})`;
}
