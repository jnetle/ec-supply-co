"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { button, buttonColors } from "@/components/ui/button";
import { LinkIcon } from "@/components/ui/link-icon";
import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";
import {
  CALENDAR_SUBSCRIBE_ENABLED,
  CATEGORIES,
  type CalendarEvent,
  type EventCategory,
} from "@/lib/content/calendar";

import styles from "./calendar.module.css";
import { CalendarSubscriptions } from "./calendar-subscriptions";
import { EventDialog } from "./event-dialog";
import { EventDateChip, EventPhoto } from "./event-photo";
import {
  MONTHS,
  WEEKDAYS,
  buildMonthGrid,
  decorate,
  monthIndex,
  type DecoratedEvent,
  type MonthCell,
} from "./event-model";
import { useMySeats, useToday } from "./signups-store";

type Filter = "all" | EventCategory;

type View = "list" | "calendar";

const FILTERS: { key: Filter; label: string; dot: string }[] = [
  { key: "all", label: "All", dot: "var(--color-ecs-sky-line)" },
  { key: "workshop", label: "Workshops", dot: CATEGORIES.workshop.color },
  { key: "popup", label: "Food popups", dot: CATEGORIES.popup.color },
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
  // Navigation spans the current month plus every month that has events,
  // and always opens on the current month.
  const [{ MIN_INDEX, MAX_INDEX, START_INDEX }] = useState(() => {
    const now = new Date();
    const current = monthIndex(now.getFullYear(), now.getMonth());
    const months = [
      current,
      ...events.map((e) =>
        monthIndex(Number(e.date.slice(0, 4)), Number(e.date.slice(5, 7)) - 1),
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

  // Both come from the browser, so both are empty on the server and fill in
  // on hydration.
  const { seats: mySeats, reserve } = useMySeats();
  const today = useToday();

  const year = Math.floor(index / 12);
  const month = index % 12;
  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;

  const visible = useMemo(
    () =>
      events
        .filter((e) => filter === "all" || e.category === filter)
        .map((e) => decorate(e, mySeats, today)),
    [events, filter, mySeats, today],
  );

  const inMonth = useMemo(
    () => visible.filter((e) => e.date.startsWith(ym)),
    [visible, ym],
  );

  // The list shows everything still to come, a section per month.
  const months = useMemo(
    () => groupByMonth(visible.filter((e) => !e.past)),
    [visible],
  );

  const cells = useMemo(
    () => buildMonthGrid(year, month, inMonth, today),
    [year, month, inMonth, today],
  );

  const selected = selectedId
    ? (visible.find((e) => e.id === selectedId) ??
      events
        .filter((e) => e.id === selectedId)
        .map((e) => decorate(e, mySeats, today))[0])
    : null;

  const atFirst = index <= MIN_INDEX;
  const atLast = index >= MAX_INDEX;
  const monthLabel = `${MONTHS[month]} ${year}`;

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
              <h2 className={styles.monthLabel}>{monthLabel}</h2>
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
          </div>

          {inMonth.length > 0 ? (
            <MonthGrid cells={cells} onSelect={setSelectedId} />
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
        onReserve={reserve}
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
        // Until the pitch form opens, the newsletter is how people hear first.
        <>
          <p className={styles.emptyCopy}>
            We’re still lining up the pop-ups, workshops and neighborhood
            nights. Want to run one here? We’re opening up spots for makers,
            cooks and teachers soon. Get the newsletter and you’ll be the first
            to know.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/#signup" className={button({ tone: "tealDeep" })}>
              Get the newsletter
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

type MonthGroup = { key: string; label: string; events: DecoratedEvent[] };

/** Events in date order, split into one group per month. */
function groupByMonth(events: DecoratedEvent[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const thisYear = new Date().getFullYear();
  const sorted = events.toSorted(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
  );
  for (const event of sorted) {
    const key = event.date.slice(0, 7);
    let group = groups.at(-1);
    if (group?.key !== key) {
      const year = Number(key.slice(0, 4));
      const name = MONTHS[Number(key.slice(5, 7)) - 1];
      group = {
        key,
        label: year === thisYear ? name : `${name} ${year}`,
        events: [],
      };
      groups.push(group);
    }
    group.events.push(event);
  }
  return groups;
}

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
          <div className={styles.list}>
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** One event: its photo, the date beside the title, details and the action. */
function EventCard({
  event,
  onSelect,
}: {
  event: DecoratedEvent;
  onSelect: (eventId: string) => void;
}) {
  return (
    <article
      className={styles.row}
      style={{ "--row-opacity": event.past ? 0.5 : 1 } as CSSProperties}
    >
      <EventPhoto
        event={event}
        chip={false}
        className={styles.rowPhoto}
        sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, (max-width: 1100px) 33vw, 25vw"
      />

      <div className={styles.rowHead}>
        <EventDateChip event={event} />
        <div>
          <div className={styles.rowMeta}>
            {[event.categoryLabel, event.time].filter(Boolean).join(" · ")}
          </div>
          <h3 className={styles.rowTitle}>{event.title}</h3>
        </div>
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowDetail}>
          {event.host} · {event.priceLabel} · {event.spotsLabel}
        </div>
        {event.hostUrl && (
          <a
            href={event.hostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.hostLink}
          >
            Visit {event.host}
            <span className={styles.hostLinkBadge}>
              <LinkIcon size="0.7em" />
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(event.id)}
        disabled={event.past}
        className={button({
          variant: event.ctaVariant,
          tone: "custom",
          className: styles.rowCta,
        })}
        style={buttonColors(event.ctaColor, event.ctaInk)}
      >
        {event.cta}
      </button>
    </article>
  );
}

/** The month as a calendar: whole weeks, each event a chip on its day. */
function MonthGrid({
  cells,
  onSelect,
}: {
  cells: MonthCell[];
  onSelect: (eventId: string) => void;
}) {
  return (
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
                onClick={() => onSelect(event.id)}
                className={styles.chip}
                style={
                  {
                    "--chip-color": event.categoryColor,
                    "--chip-ink": event.categoryInk,
                    "--chip-opacity": event.past ? 0.5 : 1,
                  } as CSSProperties
                }
              >
                {event.shortTime && <strong>{event.shortTime} </strong>}
                {event.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
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
