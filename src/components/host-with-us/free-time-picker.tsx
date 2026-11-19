"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLayoutEffect, useRef, useState } from "react";

import { MONTHS, WEEKDAYS, monthDays } from "@/components/calendar/event-model";
import {
  DayTimeline,
  defaultSpan,
} from "@/components/host-with-us/day-timeline";
import {
  durationLabel,
  longDate,
  slotLabel,
  windowLabel,
  type PickedSlot,
} from "@/components/host-with-us/free-time";
import { button } from "@/components/ui/button";
import type { AvailabilityDay } from "@/lib/shop-availability";

import styles from "./free-time-picker.module.css";

const arrowButton = button({
  variant: "outline",
  tone: "tealDeep",
  size: "sm",
  icon: true,
});

const monthIndexOf = (date: string) =>
  Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;

/**
 * A form field that looks like a dropdown and opens the month calendar in a
 * dialog: pick a free day, then size and place the event on that day's
 * timeline. Only free time can be picked.
 */
export function FreeTimePicker({
  days,
  value,
  onChange,
  fieldProps,
}: {
  days: AvailabilityDay[];
  value: PickedSlot | null;
  onChange: (value: PickedSlot | null) => void;
  /** id, className and aria-describedby from the form's Field. */
  fieldProps: { id: string; className: string; "aria-describedby"?: string };
}) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const today = days[0]?.date ?? "";
  const firstFree = days.find((day) => day.windows.length > 0)?.date ?? today;
  const minIndex = monthIndexOf(today);
  const maxIndex = monthIndexOf(days.at(-1)?.date ?? today);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(minIndex);
  // The block being placed; it only becomes the field's value on "Use".
  const [draft, setDraft] = useState<PickedSlot | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastHeight = useRef<number | null>(null);

  // Opening starts on the picked time, or the first free month.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value);
      setIndex(monthIndexOf(value?.date ?? firstFree));
    }
    setOpen(next);
  };

  // A new day starts with its first free two hours; scroll its timeline so
  // the block is in view.
  // The height before a change, for the layout effect below to ease from.
  const rememberHeight = () => {
    const content = contentRef.current;
    if (content) lastHeight.current = content.getBoundingClientRect().height;
  };

  const showMonth = (next: number) => {
    rememberHeight();
    setIndex(next);
  };

  const pickDay = (date: string) => {
    const span = defaultSpan(byDate.get(date)?.windows ?? []);
    if (!span) return;
    rememberHeight();
    setDraft({ date, ...span });
    requestAnimationFrame(() =>
      timelineRef.current
        ?.querySelector("[data-drag=move]")
        ?.scrollIntoView({ block: "nearest" }),
    );
  };

  const year = Math.floor(index / 12);
  const month = index % 12;
  const windows = draft ? (byDate.get(draft.date)?.windows ?? []) : [];

  // When a new day or month makes the dialog taller or shorter, ease it to
  // its new height instead of jumping: the handlers note the height before
  // the change, and this measures the new one before it's painted.
  useLayoutEffect(() => {
    const content = contentRef.current;
    const previous = lastHeight.current;
    lastHeight.current = null;
    if (!open || !content || previous === null) return;
    const next = content.getBoundingClientRect().height;
    if (Math.abs(previous - next) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    content.animate([{ height: `${previous}px` }, { height: `${next}px` }], {
      duration: 280,
      easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
    });
  }, [open, draft?.date, index]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          {...fieldProps}
          className={`${fieldProps.className} ${styles.trigger}`}
          data-empty={!value || undefined}
        >
          <span>{value ? slotLabel(value) : "Choose a date and time"}</span>
          <span aria-hidden="true" className={styles.chevron}>
            ▾
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content ref={contentRef} className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Pick a date and time
            </Dialog.Title>
            <Dialog.Description className={styles.description}>
              Only times the space is free. We&rsquo;ll confirm when we reply.
            </Dialog.Description>
            <Dialog.Close
              className={button({
                tone: "paper",
                size: "sm",
                icon: true,
                className: styles.close,
              })}
              aria-label="Close"
            >
              ×
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            {/* Wide screens: the month on the left, the day on the right. */}
            <div className={styles.calendarColumn}>
              <div className={styles.nav}>
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => showMonth(index - 1)}
                  disabled={index <= minIndex}
                  className={arrowButton}
                >
                  ←
                </button>
                <h3 className={styles.month} aria-live="polite">
                  {MONTHS[month]} {year}
                </h3>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => showMonth(index + 1)}
                  disabled={index >= maxIndex}
                  className={arrowButton}
                >
                  →
                </button>
              </div>

              <div className={styles.weekdays} aria-hidden="true">
                {WEEKDAYS.map((name) => (
                  <span key={name}>{name.slice(0, 2)}</span>
                ))}
              </div>
              <div className={styles.days}>
                {monthDays(year, month, today).map((cell) => {
                  if (cell.day === null) return <span key={cell.key} />;
                  const info = byDate.get(cell.key);
                  const free = (info?.windows.length ?? 0) > 0;
                  const status = !info
                    ? ""
                    : info.closed
                      ? ", closed"
                      : free
                        ? `, free ${info.windows.map(windowLabel).join(" and ")}`
                        : ", booked";
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      className={styles.day}
                      disabled={!free}
                      aria-pressed={cell.key === draft?.date}
                      aria-label={`${longDate(cell.key)}${status}`}
                      data-today={cell.isToday || undefined}
                      onClick={() => pickDay(cell.key)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={timelineRef} className={styles.times}>
              {draft ? (
                <>
                  <h4 className={styles.timesTitle}>{longDate(draft.date)}</h4>
                  <p className={styles.prompt}>
                    Drag the block to move it, or drag its top or bottom edge to
                    change the start or end.
                  </p>
                  <DayTimeline
                    windows={windows}
                    value={draft}
                    onChange={(span) => setDraft({ date: draft.date, ...span })}
                  />
                </>
              ) : (
                <p className={styles.prompt}>Pick a day to see its times.</p>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            {value && (
              <button
                type="button"
                className={button({ variant: "link", tone: "tealDeep" })}
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear the date
              </button>
            )}
            <button
              type="button"
              className={button({
                tone: "tealDeep",
                className: styles.use,
              })}
              disabled={!draft}
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              {draft
                ? `Use ${windowLabel(draft)} (${durationLabel(draft.end - draft.start)})`
                : "Use this time"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
