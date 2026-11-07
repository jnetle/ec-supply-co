"use client";

import { useEffect, useState } from "react";

import type { OpenPeriod, ShopHours } from "@/lib/google-hours";

import styles from "./visit.module.css";

const WEEK = 7 * 24 * 60;

/** Now in the shop's time zone, as minutes since Sunday midnight. */
function shopNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday"),
  );
  return {
    day,
    minute: day * 24 * 60 + Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function isOpen(periods: OpenPeriod[], now: number) {
  return periods.some((period) => {
    if (period.closeDay === undefined || period.closeMinute === undefined) {
      return true;
    }
    const open = period.openDay * 24 * 60 + period.openMinute;
    let close = period.closeDay * 24 * 60 + period.closeMinute;
    if (close <= open) close += WEEK;
    return (
      (now >= open && now < close) || (now + WEEK >= open && now + WEEK < close)
    );
  });
}

/**
 * The week's hours from Google. Today and open-or-closed are worked out in
 * the browser, so a cached page never shows yesterday as today.
 */
export function HoursTable({ hours }: { hours: ShopHours }) {
  const [now, setNow] = useState<{ day: number; minute: number } | null>(null);

  useEffect(() => {
    const tick = () => setNow(shopNow());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const open = now ? isOpen(hours.periods, now.minute) : null;

  return (
    <>
      {open !== null && (
        <p className={styles.status} data-open={open}>
          {open ? "Open now" : "Closed now"}
        </p>
      )}
      <dl className={styles.week}>
        {hours.days.map(({ day, name, hours: text }) => (
          <div
            key={day}
            className={styles.day}
            aria-current={now?.day === day ? "date" : undefined}
          >
            <dt>{name}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
