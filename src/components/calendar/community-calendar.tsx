"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { button } from "@/components/ui/button";
import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";
import {
  CALENDAR_SUBSCRIBE_ENABLED,
  CATEGORIES,
  type CalendarEvent,
  type EventCategory,
} from "@/lib/content/calendar";

import styles from "./calendar.module.css";
import { CalendarSubscriptions } from "./calendar-subscriptions";
import { EventCard } from "./event-card";
import { EventDialog } from "./event-dialog";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  byListDate,
  decorate,
  lastDayOf,
  listDate,
  monthIndex,
  type DecoratedEvent,
  type MonthCell,
} from "./event-model";
import { useToday } from "./use-today";

type Filter = "all" | EventCategory;

type View = "list" | "calendar";

const FILTERS: { key: Filter; label: string; dot: string }[] = [
  { key: "all", label: "All", dot: "var(--color-ecs-sky-line)" },
  { key: "workshop", label: "Workshops", dot: CATEGORIES.workshop.color },
  { key: "popup", label: "Food popups", dot: CATEGORIES.popup.color },
  { key: "pickup", label: "Pick-ups", dot: CATEGORIES.pickup.color },
  { key: "community", label: "Community", dot: CATEGORIES.community.color },
];

const arrowButton = button({
  variant: "outline",
  tone: "navy",
  size: "sm",
  icon: true,
});
const filterButton = button({ variant: "outline", tone: "navy", size: "sm" });
const viewButton = button({
  variant: "outline",
  tone: "navy",
  size: "sm",
  icon: true,
});

export function CommunityCalendar({
  events,
  mock = false,
}: {
  events: CalendarEvent[];
  /** Made-up events: sign-ups are faked instead of sent to Wix. */
  mock?: boolean;
}) {
  // Navigation spans the current month plus every month that has events
  // (from a run's first day to its last), and always opens on the current
  // month.
  const [{ MIN_INDEX, MAX_INDEX, START_INDEX }] = useState(() => {
    const now = new Date();
    const current = monthIndex(now.getFullYear(), now.getMonth());
    const months = [
      current,
      ...events.flatMap((e) =>
        [e.date, lastDayOf(e)].map((day) =>
          monthIndex(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1),
        ),
      ),
    ];
    return {
      MIN_INDEX: Math.min(...months),
      MAX_INDEX: Math.max(...months),
      START_INDEX: current,
    };
  });

  const [index, setIndex] = useState(START_INDEX);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // From the browser, so empty on the server and filled in on hydration.
  const today = useToday();

  const year = Math.floor(index / 12);
  const month = index % 12;
  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

  const visible = useMemo(
    () =>
      events
        .filter((e) => filter === "all" || e.category === filter)
        .map((e) => decorate(e, today)),
    [events, filter, today],
  );

  // Anything on during the month, a run that started before it included.
  const inMonth = useMemo(
    () =>
      visible.filter(
        (e) => e.date.slice(0, 7) <= ym && lastDayOf(e).slice(0, 7) >= ym,
      ),
    [visible, ym],
  );

  // The list shows everything still to come, a section per month.
  const months = useMemo(
    () =>
      groupByMonth(
        visible.filter((e) => !e.past),
        today,
      ),
    [visible, today],
  );

  // A run across most of the month would stripe week after week of the
  // grid, so it's pinned above the month instead; shorter runs stay as
  // tape on their days.
  const pinned = useMemo(
    () => inMonth.filter((e) => isLongRun(e, year, month)),
    [inMonth, year, month],
  );
  const cells = useMemo(
    () =>
      buildMonthGrid(
        year,
        month,
        inMonth.filter((e) => !isLongRun(e, year, month)),
        today,
      ),
    [year, month, inMonth, today],
  );

  const selected = selectedId
    ? (visible.find((e) => e.id === selectedId) ??
      events
        .filter((e) => e.id === selectedId)
        .map((e) => decorate(e, today))[0])
    : null;

  const atFirst = index <= MIN_INDEX;
  const atLast = index >= MAX_INDEX;

  const goPrev = () => setIndex(Math.max(MIN_INDEX, index - 1));
  const goNext = () => setIndex(Math.min(MAX_INDEX, index + 1));

  return (
    <section id="calendar" className={styles.section}>
      <div className={styles.controls}>
        <div
          role="group"
          aria-label="Filter by type"
          className={styles.filters}
        >
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={filterButton}
            >
              <span
                className={styles.filterDot}
                style={{ "--dot-color": option.dot } as CSSProperties}
              />
              {option.label}
            </button>
          ))}
        </div>

        <div role="group" aria-label="View" className={styles.views}>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            aria-label="List view"
            title="List view"
            className={viewButton}
          >
            <ListIcon />
          </button>
          <button
            type="button"
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
            aria-label="Calendar view"
            title="Calendar view"
            className={viewButton}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>

      {view === "calendar" && (
        // The month grid is too cramped on phones, which get the list instead.
        <div className={styles.calendarView}>
          <div className={styles.toolbar}>
            <div className={styles.monthNav}>
              <button
                type="button"
                aria-label="Previous month"
                onClick={goPrev}
                disabled={atFirst}
                className={arrowButton}
              >
                ←
              </button>
              <h2 className={styles.monthLabel}>
                <span className={styles.monthName}>{MONTHS[month]}</span>{" "}
                <span className={styles.monthYear}>{year}</span>
                <svg
                  className={styles.monthScribble}
                  viewBox="0 0 220 14"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9c22-6 41 4 63-1s35-5 55-1 38 4 58-2 28 1 38 3"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </h2>
              <button
                type="button"
                aria-label="Next month"
                onClick={goNext}
                disabled={atLast}
                className={arrowButton}
              >
                →
              </button>
            </div>
            <p className={styles.hint}>Tap an event for the details.</p>
          </div>

          {inMonth.length > 0 ? (
            <MonthGrid
              cells={cells}
              pinned={pinned}
              ym={ym}
              onSelect={setSelectedId}
            />
          ) : (
            <EmptyMonth
              month={MONTHS[month]}
              filter={filter}
              onShowAll={() => setFilter("all")}
            />
          )}
        </div>
      )}

      <div className={view === "calendar" ? styles.phoneOnly : undefined}>
        {months.length > 0 ? (
          <MonthList months={months} onSelect={setSelectedId} />
        ) : (
          <EmptyMonth filter={filter} onShowAll={() => setFilter("all")} />
        )}
      </div>

      {CALENDAR_SUBSCRIBE_ENABLED && <CalendarSubscriptions />}

      <EventDialog
        event={selected}
        onClose={() => setSelectedId(null)}
        mock={mock}
      />
    </section>
  );
}

/**
 * Nothing to show: in one month of the calendar view, or (without a month)
 * nothing coming up at all. With a filter on, it offers to drop the filter;
 * otherwise it says we're still filling the calendar.
 */
function EmptyMonth({
  month,
  filter,
  onShowAll,
}: {
  month?: string;
  filter: Filter;
  onShowAll: () => void;
}) {
  if (filter !== "all") {
    const label = FILTERS.find((option) => option.key === filter)?.label;
    return (
      <div className={styles.emptyMonth}>
        <p className={styles.emptyCopy}>
          No {label?.toLowerCase()} {month ? `in ${month}` : "coming up"} yet.
        </p>
        <div className={styles.emptyActions}>
          <button
            type="button"
            onClick={onShowAll}
            className={button({ variant: "link", tone: "teal" })}
          >
            {month ? `Show everything in ${month}` : "Show everything"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.emptyMonth}>
      <h3 className={styles.emptyHeading}>
        The board’s clear for {month ?? "now"}
      </h3>
      {HOST_WITH_US_ENABLED ? (
        <>
          <p className={styles.emptyCopy}>
            We’re still lining up the pop-ups, workshops and neighborhood
            nights. Got a food pop-up, a class or a night you’d like to run
            here? Tell us, and help us fill the calendar.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/host-with-us" className={button({ tone: "tealDeep" })}>
              Pitch a pop-up →
            </Link>
            <Link
              href="/#signup"
              className={button({ variant: "outline", tone: "tealDeep" })}
            >
              Get the newsletter
            </Link>
          </div>
        </>
      ) : (
        // Until the pitch form opens, point popups and makers at the
        // applications that are open, and everyone else at the newsletter.
        <>
          <p className={styles.emptyCopy}>
            We’re still lining up the pop-ups, workshops and neighborhood
            nights. Run a food popup or make something for the shelves? We’re
            taking applications now. Or get the newsletter and hear first when
            new dates go up.
          </p>
          <div className={styles.emptyActions}>
            <Link
              href="/popup-with-us"
              className={button({ tone: "tealDeep" })}
            >
              Pop up with us →
            </Link>
            <Link
              href="/sell-with-us"
              className={button({ variant: "outline", tone: "tealDeep" })}
            >
              Sell with us →
            </Link>
            <Link
              href="/#signup"
              className={button({ variant: "outline", tone: "tealDeep" })}
            >
              Get the newsletter
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

type MonthGroup = { key: string; label: string; events: DecoratedEvent[] };

/**
 * Events in date order, split into one group per month; a run that's already
 * going sits with today's (see `listDate`). The first month and
 * any month that starts a new year carry the year ("November 2026",
 * "December", "January 2027"), so it's always on screen without repeating.
 */
function groupByMonth(events: DecoratedEvent[], today: string): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const sorted = events.toSorted(byListDate(today));
  for (const event of sorted) {
    const key = listDate(event, today).slice(0, 7);
    let group = groups.at(-1);
    if (group?.key !== key) {
      const year = key.slice(0, 4);
      const name = MONTHS[Number(key.slice(5, 7)) - 1];
      const newYear = group?.key.slice(0, 4) !== year;
      group = {
        key,
        label: newYear ? `${name} ${year}` : name,
        events: [],
      };
      groups.push(group);
    }
    group.events.push(event);
  }
  return groups;
}

/** Months with this many events or fewer show them as wide cards. */
const WIDE_MAX = 2;

/** Everything coming up, a heading and a row of cards per month. */
function MonthList({
  months,
  onSelect,
}: {
  months: MonthGroup[];
  onSelect: (eventId: string) => void;
}) {
  return (
    <div className={styles.months}>
      {months.map((group) => (
        <section key={group.key} aria-labelledby={`month-${group.key}`}>
          <h2 id={`month-${group.key}`} className={styles.monthHeading}>
            {group.label}
          </h2>
          {/* A quiet month gives each event a wide card with room for its
              full details, rather than one small card and an empty row. */}
          <div
            className={`${styles.list} ${
              group.events.length <= WIDE_MAX ? styles.wide : ""
            }`}
            style={{ "--count": group.events.length } as CSSProperties}
          >
            {group.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelect}
                layout={group.events.length <= WIDE_MAX ? "wide" : "stacked"}
                sizes={
                  group.events.length <= WIDE_MAX
                    ? "(max-width: 640px) 100vw, 420px"
                    : "(max-width: 560px) 100vw, (max-width: 860px) 50vw, (max-width: 1100px) 33vw, 25vw"
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const BLOB_ALIGN = ["flex-start", "center", "flex-end"] as const;

/** A stable 0–1 number from a string, so a blob keeps its shape and tilt. */
function jitter(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

/** Runs that cross this many weeks (rows) of the month grid are pinned above it. */
const LONG_RUN_WEEKS = 3;

/**
 * Whether a run crosses LONG_RUN_WEEKS or more rows of this month's grid.
 * Counted by rows, not days: a week-long run over one or two rows is easy
 * to read as tape, while a long one stripes the whole month.
 */
function isLongRun(event: DecoratedEvent, year: number, month: number) {
  if (!event.lastDate) return false;
  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
  const lead = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const first =
    event.date.slice(0, 7) < ym ? 1 : Number(event.date.slice(8, 10));
  const last =
    event.lastDate.slice(0, 7) > ym
      ? days
      : Number(event.lastDate.slice(8, 10));
  const row = (day: number) => Math.floor((lead + day - 1) / 7);
  return row(last) - row(first) + 1 >= LONG_RUN_WEEKS;
}

/** A pinned run's dates as seen from month `ym`: "All month", "Thru Nov 22", "From Nov 10" or "Nov 3–22". */
function pinnedWhen(event: DecoratedEvent, ym: string) {
  const first = event.date;
  const last = lastDayOf(event);
  const short = (key: string) =>
    `${MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3)} ${Number(key.slice(8, 10))}`;
  const startsBefore = first.slice(0, 7) < ym;
  const endsAfter = last.slice(0, 7) > ym;
  const monthLength = new Date(
    Number(ym.slice(0, 4)),
    Number(ym.slice(5, 7)),
    0,
  ).getDate();
  const fromStart = startsBefore || Number(first.slice(8, 10)) === 1;
  const toEnd = endsAfter || Number(last.slice(8, 10)) === monthLength;
  if (fromStart && toEnd) return "All month";
  if (fromStart) return `Thru ${short(last)}`;
  if (toEnd) return `From ${short(first)}`;
  return `${short(first)}–${Number(last.slice(8, 10))}`;
}

/** How many days a run carries on from cell `i` without leaving its week. */
function tapeSpan(cells: MonthCell[], i: number, eventId: string) {
  let span = 1;
  while (
    (i + span) % 7 !== 0 &&
    cells[i + span]?.events.some((e) => e.id === eventId)
  ) {
    span++;
  }
  return span;
}

/**
 * The month as a wall calendar: each one-off event a dab of its category's
 * colour on its day, and each run of days a strip of tape across
 * the days it's on.
 */
function MonthGrid({
  cells,
  pinned,
  ym,
  onSelect,
}: {
  cells: MonthCell[];
  pinned: DecoratedEvent[];
  ym: string;
  onSelect: (eventId: string) => void;
}) {
  const rows = cells.length / 7;
  const seed = cells.find((cell) => cell.day !== null)?.key ?? "";
  const corners = useMemo(() => dayCorners(rows, seed), [rows, seed]);

  return (
    <div className={styles.grid}>
      {pinned.length > 0 && (
        <div className={styles.pinned}>
          {pinned.map((event) => (
            <button
              key={event.id}
              type="button"
              title={event.title}
              aria-label={`${event.title}, ${event.longDate}`}
              onClick={() => onSelect(event.id)}
              className={`${styles.tape} ${styles.tornStart} ${styles.tornEnd} ${styles.pinnedTape} ${event.past ? styles.pinnedPast : ""}`}
              style={
                {
                  "--chip-color": event.categoryColor,
                  "--tilt": `${(jitter(`${event.id}:pin`) * 2 - 1) * 1.5}deg`,
                } as CSSProperties
              }
            >
              <span className={styles.pinnedWhen} aria-hidden="true">
                {pinnedWhen(event, ym)}
              </span>
              <span className={styles.tapeLabel} aria-hidden="true">
                {event.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.days}>
        <GridLines rows={rows} seed={seed} />
        {cells.map((cell, i) => {
          const blobs = cell.events.filter((e) => !e.lastDate);
          const runs = cell.events.filter((e) => e.lastDate);
          return (
            <div
              key={cell.key}
              className={`${styles.cell} ${cell.past ? styles.cellPast : ""}`}
            >
              <div
                className={`${styles.cellDay} ${cell.isToday ? styles.cellToday : ""}`}
                style={
                  {
                    "--corner-x": corners[i].x.toFixed(2),
                    "--corner-y": corners[i].y.toFixed(2),
                    "--day-gap": `${5 + jitter(`${cell.key}:day`) * 4}px`,
                  } as CSSProperties
                }
              >
                {cell.day ?? ""}
                {cell.isToday && <TodayCircle />}
              </div>

              {blobs.map((event) => {
                const a = jitter(event.id);
                const b = jitter(`${event.id}:nudge`);
                // Eight corner radii, a sticker cut to its own shape:, each 14–34%: nearly a rectangle, still lumpy.
                const r = (k: number) =>
                  `${Math.round(14 + jitter(`${event.id}:r${k}`) * 20)}%`;
                return (
                  <button
                    key={event.id}
                    type="button"
                    title={event.title}
                    onClick={() => onSelect(event.id)}
                    className={styles.blob}
                    style={
                      {
                        "--chip-color": event.categoryColor,
                        "--chip-ink": event.categoryInk,
                        "--tilt": `${(a * 2 - 1) * 5}deg`,
                        "--nudge": `${(b * 2 - 1) * 10}px`,
                        borderRadius: `${r(0)} ${r(1)} ${r(2)} ${r(3)} / ${r(4)} ${r(5)} ${r(6)} ${r(7)}`,
                        alignSelf: BLOB_ALIGN[Math.floor(b * 3)],
                      } as CSSProperties
                    }
                  >
                    {event.shortTime && (
                      <span className={styles.blobTime}>{event.shortTime}</span>
                    )}
                    <span className={styles.blobTitle}>{event.title}</span>
                  </button>
                );
              })}

              {runs.length > 0 && (
                <div className={styles.tapes}>
                  {runs.map((event) => {
                    const first = cell.key === event.date;
                    const last = cell.key === lastDayOf(event);
                    // The name goes where the strip starts, and again at
                    // the start of each week it carries on into.
                    const labelled = first || i % 7 === 0 || cell.day === 1;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        title={event.title}
                        aria-label={`${event.title}, ${event.longDate}`}
                        onClick={() => onSelect(event.id)}
                        className={`${styles.tape} ${first ? styles.tornStart : ""} ${last ? styles.tornEnd : ""} ${labelled ? styles.tapeLabelled : ""}`}
                        style={
                          {
                            "--chip-color": event.categoryColor,
                            "--span": tapeSpan(cells, i, event.id),
                          } as CSSProperties
                        }
                      >
                        {labelled && (
                          <span className={styles.tapeLabel} aria-hidden="true">
                            {event.title}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Point = [number, number];
type Curve = [Point, Point, Point];

/**
 * The month's rules as quadratic curves (start, control, end) in
 * GridLines' box: 100 units a day each way, `rows` weeks tall.
 */
function gridGeometry(rows: number, seed: string) {
  const width = 700;
  const height = rows * 100;
  const over = 5;
  const bend = (key: string, amount: number) =>
    (jitter(`${seed}:${key}`) * 2 - 1) * amount;

  const across = Array.from({ length: rows + 1 }, (_, i): Curve => {
    const y = i * 100;
    return [
      [-over, y + bend(`h${i}a`, 4)],
      [width / 2 + bend(`h${i}m`, 160), y + bend(`h${i}b`, 13)],
      [width + over, y + bend(`h${i}c`, 4)],
    ];
  });
  const down = Array.from({ length: 8 }, (_, i): Curve => {
    const x = i * 100;
    return [
      [x + bend(`v${i}a`, 4), -over],
      [x + bend(`v${i}b`, 11), height / 2 + bend(`v${i}m`, height / 5)],
      [x + bend(`v${i}c`, 4), height + over],
    ];
  });
  return { across, down };
}

/** The point on a curve whose `axis` coordinate is `value` (it runs one way along it). */
function along(curve: Curve, axis: 0 | 1, value: number): Point {
  const at = (t: number): Point => {
    const u = 1 - t;
    return [0, 1].map(
      (k) =>
        u * u * curve[0][k] + 2 * u * t * curve[1][k] + t * t * curve[2][k],
    ) as Point;
  };
  let lo = 0;
  let hi = 1;
  for (let n = 0; n < 24; n++) {
    const mid = (lo + hi) / 2;
    if (at(mid)[axis] < value) lo = mid;
    else hi = mid;
  }
  return at((lo + hi) / 2);
}

/**
 * Where each day's top-right rules actually cross, as a percentage of its
 * own cell, so the date can sit tucked into that corner and follow the
 * bow of the lines instead of lining up with every other date.
 */
function dayCorners(rows: number, seed: string) {
  const { across, down } = gridGeometry(rows, seed);
  return Array.from({ length: rows * 7 }, (_, i) => {
    const row = Math.floor(i / 7);
    const col = i % 7;
    // Settle onto the crossing: a couple of passes is plenty for curves this gentle.
    let x = (col + 1) * 100;
    let y = row * 100;
    for (let n = 0; n < 3; n++) {
      y = along(across[row], 0, x)[1];
      x = along(down[col + 1], 1, y)[0];
    }
    return { x: x - col * 100, y: y - row * 100 };
  });
}

/**
 * The month's rules: bold, smooth lines, each with its own gentle bow and
 * running a touch past the corners, like a quick marker line rather than a
 * ruler. Drawn in a 100-units-per-day box stretched over the days (rows are
 * all one height, see .days), with the stroke kept at its own width. The bow
 * of each line is fixed per month, so a month always looks the same.
 */
function GridLines({ rows, seed }: { rows: number; seed: string }) {
  const { across, down } = gridGeometry(rows, seed);
  const path = ([a, m, b]: Curve) =>
    `M${a[0]} ${a[1]} Q${m[0]} ${m[1]} ${b[0]} ${b[1]}`;

  return (
    <svg
      className={styles.gridLines}
      viewBox={`0 0 700 ${rows * 100}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {[...across, ...down].map(path).map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** A thick loop of the shop's iridescent film (--ec-film's stops) around today's date. */
function TodayCircle() {
  return (
    <svg
      className={styles.todayCircle}
      viewBox="0 0 48 36"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cal-today-film" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#8ee6d8" />
          <stop offset="0.17" stopColor="#a9b6ff" />
          <stop offset="0.33" stopColor="#f2a9de" />
          <stop offset="0.5" stopColor="#ffe1a4" />
          <stop offset="0.67" stopColor="#a2f0cb" />
          <stop offset="0.83" stopColor="#9cc3ff" />
          <stop offset="1" stopColor="#8ee6d8" />
        </linearGradient>
      </defs>
      <path
        d="M36 6C25 0 6 3 4 16c-2 13 17 18 30 15 12-3 12-17 3-23-5-3-12-4-18-3"
        stroke="url(#cal-today-film)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
