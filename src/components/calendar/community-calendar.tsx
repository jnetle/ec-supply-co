"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  CALENDAR_EVENTS,
  CATEGORIES,
  FIRST_MONTH,
  LAST_MONTH,
  type EventCategory,
} from "@/lib/content/calendar";

import styles from "./calendar.module.css";
import { EventDialog } from "./event-dialog";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  decorate,
  monthIndex,
} from "./event-model";
import { useMySeats, useToday } from "./signups-store";

type Filter = "all" | EventCategory;

const FILTERS: { key: Filter; label: string; dot: string }[] = [
  { key: "all", label: "All", dot: "var(--color-ecs-ply-ink)" },
  { key: "workshop", label: "Workshops", dot: CATEGORIES.workshop.color },
  { key: "popup", label: "Food popups", dot: CATEGORIES.popup.color },
  { key: "community", label: "Community", dot: CATEGORIES.community.color },
];

const MIN_INDEX = monthIndex(FIRST_MONTH.year, FIRST_MONTH.month);
const MAX_INDEX = monthIndex(LAST_MONTH.year, LAST_MONTH.month);

export function CommunityCalendar() {
  // Start on the current month, clamped to the months that have events.
  const [index, setIndex] = useState(() => {
    const now = new Date();
    return Math.min(
      MAX_INDEX,
      Math.max(MIN_INDEX, monthIndex(now.getFullYear(), now.getMonth())),
    );
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Both come from the browser, so both are empty on the server and fill in
  // on hydration.
  const { seats: mySeats, reserve } = useMySeats();
  const today = useToday();

  const year = Math.floor(index / 12);
  const month = index % 12;
  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

  const visible = useMemo(
    () =>
      CALENDAR_EVENTS.filter(
        (e) => filter === "all" || e.category === filter,
      ).map((e) => decorate(e, mySeats, today)),
    [filter, mySeats, today],
  );

  const inMonth = useMemo(
    () => visible.filter((e) => e.date.startsWith(ym)),
    [visible, ym],
  );

  const cells = useMemo(
    () => buildMonthGrid(year, month, inMonth, today),
    [year, month, inMonth, today],
  );

  const selected = selectedId
    ? (visible.find((e) => e.id === selectedId) ??
      CALENDAR_EVENTS.filter((e) => e.id === selectedId).map((e) =>
        decorate(e, mySeats, today),
      )[0])
    : null;

  /* Changing month from the lower arrows keeps the grid where it is on
     screen, even though the list above it changes height. */
  const monthViewRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<number | null>(null);

  const shiftKeepingGrid = (nextIndex: number) => {
    keepRef.current =
      monthViewRef.current?.getBoundingClientRect().top ?? null;
    setIndex(nextIndex);
  };

  useLayoutEffect(() => {
    const screenTop = keepRef.current;
    keepRef.current = null;
    const element = monthViewRef.current;
    if (screenTop === null || !element) return;

    const documentTop = element.getBoundingClientRect().top + window.scrollY;
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.max(0, documentTop - screenTop));
    html.style.scrollBehavior = previous;
  }, [index]);

  const atFirst = index <= MIN_INDEX;
  const atLast = index >= MAX_INDEX;
  const monthLabel = `${MONTHS[month]} ${year}`;

  const goPrev = () => setIndex(Math.max(MIN_INDEX, index - 1));
  const goNext = () => setIndex(Math.min(MAX_INDEX, index + 1));

  return (
    <section id="calendar" className={styles.section}>
      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button
            type="button"
            aria-label="Previous month"
            onClick={goPrev}
            disabled={atFirst}
            className={styles.arrow}
          >
            ←
          </button>
          <h2 className={styles.monthLabel}>{monthLabel}</h2>
          <button
            type="button"
            aria-label="Next month"
            onClick={goNext}
            disabled={atLast}
            className={styles.arrow}
          >
            →
          </button>
        </div>

        <div role="group" aria-label="Filter by type" className={styles.filters}>
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={styles.filter}
            >
              <span
                className={styles.filterDot}
                style={{ "--dot-color": option.dot } as CSSProperties}
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.listHeader}>
        <h3 className={styles.listHeading}>In {MONTHS[month]}</h3>
        <a href="#month-view" className={styles.jumpLink}>
          <CalendarIcon />
          See the month view ↓
        </a>
      </div>

      {inMonth.length === 0 ? (
        <p className={styles.empty}>
          Nothing on the calendar for this filter yet.
        </p>
      ) : (
        <div className={styles.list}>
          {inMonth.map((event) => (
            <article
              key={event.id}
              className={styles.row}
              style={
                { "--row-opacity": event.past ? 0.5 : 1 } as CSSProperties
              }
            >
              <div
                className={styles.dateChip}
                style={
                  {
                    "--chip-color": event.categoryColor,
                    "--chip-ink": event.categoryInk,
                  } as CSSProperties
                }
              >
                <span className={styles.dateChipDow}>{event.dow}</span>
                <span className={styles.dateChipDay}>{event.day}</span>
              </div>

              <div>
                <div className={styles.rowMeta}>
                  {event.categoryLabel} · {event.time}
                </div>
                <h4 className={styles.rowTitle}>{event.title}</h4>
                <div className={styles.rowDetail}>
                  {event.host} · {event.priceLabel} · {event.spotsLabel}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(event.id)}
                disabled={event.past}
                className={`${styles.rowCta} ${event.dropIn ? styles.rowCtaOutline : ""}`}
                style={
                  {
                    "--cta-color": event.ctaColor,
                    "--cta-ink": event.ctaInk,
                  } as CSSProperties
                }
              >
                {event.cta}
              </button>
            </article>
          ))}
        </div>
      )}

      <div id="month-view" ref={monthViewRef} className={styles.monthViewBar}>
        <div className={styles.monthNav}>
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftKeepingGrid(Math.max(MIN_INDEX, index - 1))}
            disabled={atFirst}
            className={styles.arrow}
          >
            ←
          </button>
          <h3 className={styles.monthLabel}>{monthLabel}</h3>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftKeepingGrid(Math.min(MAX_INDEX, index + 1))}
            disabled={atLast}
            className={styles.arrow}
          >
            →
          </button>
        </div>
        <a href="#calendar" className={styles.jumpLink}>
          ↑ Back to the list
        </a>
      </div>

      <div className={styles.grid}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className={styles.weekday}>
              {weekday}
            </div>
          ))}
        </div>

        <div className={styles.days}>
          {cells.map((cell) => (
            <div
              key={cell.key}
              className={`${styles.cell} ${cell.day === null ? styles.cellEmpty : ""} ${cell.isToday ? styles.cellToday : ""}`}
            >
              <div className={styles.cellDay}>{cell.day ?? ""}</div>
              {cell.events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  title={event.title}
                  onClick={() => setSelectedId(event.id)}
                  className={styles.chip}
                  style={
                    {
                      "--chip-color": event.categoryColor,
                      "--chip-ink": event.categoryInk,
                      "--chip-opacity": event.past ? 0.5 : 1,
                    } as CSSProperties
                  }
                >
                  <strong>{event.shortTime}</strong> {event.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <EventDialog
        event={selected}
        onClose={() => setSelectedId(null)}
        onReserve={reserve}
      />
    </section>
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
