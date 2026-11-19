"use client";

import { useState } from "react";

import {
  MONTHS,
  WEEKDAYS,
  formatTime,
  monthDays,
} from "@/components/calendar/event-model";
import { chooseInquiryWhen } from "@/components/host-with-us/inquiry-form";
import { button } from "@/components/ui/button";
import type { AvailabilityDay, FreeWindow } from "@/lib/shop-availability";

import styles from "./availability-calendar.module.css";

const arrowButton = button({
  variant: "outline",
  tone: "tealDeep",
  size: "sm",
  icon: true,
});

const pad = (n: number) => String(n).padStart(2, "0");

/** Minutes from midnight as "HH:MM". */
const clock = (minute: number) =>
  `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;

/** "8–10:30am", "6:30–10pm", "11am–2pm": one suffix when both share it. */
function windowLabel({ start, end }: FreeWindow) {
  const from = formatTime(clock(start));
  const to = formatTime(clock(end));
  const sameHalf = from.slice(-2) === to.slice(-2);
  return `${sameHalf ? from.slice(0, -2) : from}–${to}`;
}

/** "Thursday, November 19" for a date key, read as a plain date. */
function longDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** "Thu 19". */
function shortDate(date: string) {
  const day = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAYS[day.getUTCDay()]} ${day.getUTCDate()}`;
}

/** One free window: jumps to the form with its start already filled in. */
function WindowChip({ date, window }: { date: string; window: FreeWindow }) {
  const label = windowLabel(window);
  return (
    <a
      href="#inquiry"
      className={styles.chip}
      aria-label={`${longDate(date)}, ${label}: ask about this time`}
      onClick={() => chooseInquiryWhen(`${date}T${clock(window.start)}`)}
    >
      {label}
    </a>
  );
}

/**
 * The shop's free windows for the coming weeks, a month at a time: a grid on
 * wide screens, a list of the free days on phones. Every window is a link to
 * the inquiry form with the date filled in.
 */
export function AvailabilityCalendar({
  days,
  today,
}: {
  days: AvailabilityDay[];
  today: string;
}) {
  const byDate = new Map(days.map((day) => [day.date, day.windows]));
  const closed = new Set(
    days.filter((day) => day.closed).map((day) => day.date),
  );
  const first = days[0]?.date ?? today;
  const last = days.at(-1)?.date ?? today;
  const monthIndexOf = (date: string) =>
    Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;
  const minIndex = monthIndexOf(first);
  const maxIndex = monthIndexOf(last);

  const [index, setIndex] = useState(minIndex);
  const year = Math.floor(index / 12);
  const month = index % 12;
  const cells = monthDays(year, month, today);
  const freeDays = cells.filter(
    (cell) => cell.day !== null && (byDate.get(cell.key)?.length ?? 0) > 0,
  );

  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setIndex(index - 1)}
          disabled={index <= minIndex}
          className={arrowButton}
        >
          ←
        </button>
        <h3 className={styles.month} aria-live="polite">
          {MONTHS[month]} <span className={styles.year}>{year}</span>
        </h3>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setIndex(index + 1)}
          disabled={index >= maxIndex}
          className={arrowButton}
        >
          →
        </button>
      </div>

      {/* Wide screens: the month as a grid. */}
      <div className={styles.grid}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((name) => (
            <div key={name} className={styles.weekday}>
              {name}
            </div>
          ))}
        </div>
        <div className={styles.days}>
          {cells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} className={styles.pad} />;
            }
            const windows = byDate.get(cell.key);
            const known = windows !== undefined;
            return (
              <div
                key={cell.key}
                className={styles.cell}
                data-today={cell.isToday || undefined}
                data-past={cell.past || undefined}
                data-booked={(known && windows.length === 0) || undefined}
              >
                <span className={styles.date}>
                  <span className="sr-only">{longDate(cell.key)}</span>
                  <span aria-hidden="true">{cell.day}</span>
                </span>
                {known && windows.length === 0 && (
                  <span className={styles.booked}>
                    {closed.has(cell.key) ? "Closed" : "Booked"}
                  </span>
                )}
                {windows?.map((window) => (
                  <WindowChip
                    key={window.start}
                    date={cell.key}
                    window={window}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phones: just the days with room, in a list. */}
      <ul className={styles.list}>
        {freeDays.map((cell) => (
          <li key={cell.key} className={styles.row}>
            <span className={styles.rowDate} aria-hidden="true">
              {shortDate(cell.key)}
            </span>
            <div className={styles.rowWindows}>
              {byDate.get(cell.key)!.map((window) => (
                <WindowChip
                  key={window.start}
                  date={cell.key}
                  window={window}
                />
              ))}
            </div>
          </li>
        ))}
        {freeDays.length === 0 && (
          <li className={styles.none}>Nothing free this month.</li>
        )}
      </ul>

      <p className={styles.note}>
        A guide, not a booking. Tap a time to ask about it, and we&rsquo;ll
        confirm when we reply.
      </p>
    </div>
  );
}
