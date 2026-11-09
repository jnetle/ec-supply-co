"use client";

import { useEffect, useState } from "react";

import type { ShopHours } from "@/lib/google-hours";

import styles from "./visit.module.css";

/** Today's weekday in the shop's time zone (0 = Sunday). */
function shopToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

/**
 * The week's hours from Google. Today is worked out in the browser, so a
 * cached page never shows yesterday as today.
 */
export function HoursTable({ hours }: { hours: ShopHours }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setToday(shopToday());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <dl className={styles.week}>
      {hours.days.map(({ day, name, hours: text }) => (
        <div
          key={day}
          className={styles.day}
          aria-current={today === day ? "date" : undefined}
        >
          <dt>{name}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}
