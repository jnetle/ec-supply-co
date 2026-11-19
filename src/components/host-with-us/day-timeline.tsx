"use client";

import {
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  DEFAULT_EVENT_MINUTES,
  SHORTEST_EVENT_MINUTES,
  STEP_MINUTES,
  durationLabel,
  snap,
  timeLabel,
  windowLabel,
} from "@/components/host-with-us/free-time";
import { RENTAL_DAY } from "@/lib/content/host-with-us";
import type { FreeWindow } from "@/lib/shop-availability";

import styles from "./day-timeline.module.css";

/** How tall a minute of free time is on the timeline. */
const PX_PER_MINUTE = 1;

/**
 * Busy stretches longer than this are condensed to one short band, so a day
 * that's mostly taken doesn't need scrolling past to reach its free time.
 */
const CONDENSE_AFTER_MINUTES = 60;

/** How tall a condensed busy band is. */
const CONDENSED_PX = 48;

const DAY_START = RENTAL_DAY.startMinute;
const DAY_END = RENTAL_DAY.endMinute;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type Span = { start: number; end: number };
type DragMode = "move" | "start" | "end";

/** The free window a span sits in. */
const windowOf = (windows: FreeWindow[], span: Span) =>
  windows.find((w) => w.start <= span.start && span.end <= w.end);

/** A sensible first block for a day: its first free window, two hours long. */
export function defaultSpan(windows: FreeWindow[]): Span | null {
  const first = windows[0];
  if (!first) return null;
  return {
    start: first.start,
    end: Math.min(first.start + DEFAULT_EVENT_MINUTES, first.end),
  };
}

/** The busy stretches of the rentable day: everything outside the windows. */
function busySpans(windows: FreeWindow[]): Span[] {
  const spans: Span[] = [];
  let cursor = DAY_START;
  for (const w of windows) {
    if (w.start > cursor) spans.push({ start: cursor, end: w.start });
    cursor = Math.max(cursor, w.end);
  }
  if (cursor < DAY_END) spans.push({ start: cursor, end: DAY_END });
  return spans;
}

type Segment = Span & { condensed: boolean; top: number; height: number };

/**
 * The day laid out top to bottom: free time and short busy gaps at full
 * scale, long busy stretches condensed to a band. Returns where each minute
 * sits, in px from the top.
 */
function buildScale(windows: FreeWindow[]) {
  const busy = busySpans(windows);
  const spans = [
    ...busy.map((span) => ({
      ...span,
      condensed: span.end - span.start > CONDENSE_AFTER_MINUTES,
    })),
    ...windows.map((w) => ({ start: w.start, end: w.end, condensed: false })),
  ].sort((a, b) => a.start - b.start);

  let top = 0;
  const segments: Segment[] = spans.map((span) => {
    const height = span.condensed
      ? CONDENSED_PX
      : (span.end - span.start) * PX_PER_MINUTE;
    const segment = { ...span, top, height };
    top += height;
    return segment;
  });

  const px = (minute: number) => {
    const segment =
      segments.find((s) => s.start <= minute && minute <= s.end) ??
      segments.at(-1);
    if (!segment) return 0;
    const share = (minute - segment.start) / (segment.end - segment.start);
    return segment.top + share * segment.height;
  };

  // Hour lines and labels, except inside a condensed band.
  const hours: number[] = [];
  for (let m = DAY_START; m <= DAY_END; m += 60) {
    if (!segments.some((s) => s.condensed && s.start < m && m < s.end)) {
      hours.push(m);
    }
  }

  return { px, height: top, segments, hours };
}

/**
 * One day from the rentable start to end, with the busy times shaded and
 * the event as a block: drag it to move it, drag its top or bottom edge to
 * change the start or end, or tap a free stretch to put it there. It snaps
 * to the half hour and never leaves the free window it's in.
 */
export function DayTimeline({
  windows,
  value,
  onChange,
}: {
  windows: FreeWindow[];
  value: Span;
  onChange: (span: Span) => void;
}) {
  const drag = useRef<{
    mode: DragMode;
    y: number;
    from: Span;
    within: FreeWindow;
  } | null>(null);

  const { px, height, segments, hours } = buildScale(windows);

  // Puts the block at a tapped point in a free window, keeping its length
  // where it fits.
  const placeAt = (w: FreeWindow, minute: number) => {
    const length = Math.max(value.end - value.start, SHORTEST_EVENT_MINUTES);
    const fits = Math.min(length, w.end - w.start);
    const start = clamp(snap(minute), w.start, w.end - fits);
    onChange({ start, end: start + fits });
  };

  // Which part is being dragged comes from the element's data-drag.
  const beginDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const mode = event.currentTarget.dataset.drag as DragMode;
    const within = windowOf(windows, value);
    if (!within) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, y: event.clientY, from: value, within };
  };

  const onDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    const delta = snap((event.clientY - current.y) / PX_PER_MINUTE);
    const { from, within, mode } = current;

    if (mode === "start") {
      const start = clamp(
        from.start + delta,
        within.start,
        from.end - SHORTEST_EVENT_MINUTES,
      );
      if (start !== value.start) onChange({ start, end: from.end });
    } else if (mode === "end") {
      const end = clamp(
        from.end + delta,
        from.start + SHORTEST_EVENT_MINUTES,
        within.end,
      );
      if (end !== value.end) onChange({ start: from.start, end });
    } else {
      const length = from.end - from.start;
      const start = clamp(
        from.start + delta,
        within.start,
        within.end - length,
      );
      if (start !== value.start) onChange({ start, end: start + length });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  // Arrow keys move an edge by half an hour, within the same limits as a drag.
  const nudge = (edge: "start" | "end") => (event: KeyboardEvent) => {
    const step =
      event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? -STEP_MINUTES
        : event.key === "ArrowDown" || event.key === "ArrowRight"
          ? STEP_MINUTES
          : 0;
    if (!step) return;
    event.preventDefault();
    const within = windowOf(windows, value);
    if (!within) return;
    if (edge === "start") {
      const start = clamp(
        value.start + step,
        within.start,
        value.end - SHORTEST_EVENT_MINUTES,
      );
      onChange({ start, end: value.end });
    } else {
      const end = clamp(
        value.end + step,
        value.start + SHORTEST_EVENT_MINUTES,
        within.end,
      );
      onChange({ start: value.start, end });
    }
  };

  const within = windowOf(windows, value);

  return (
    <div className={styles.timeline}>
      <div className={styles.hours} aria-hidden="true">
        {hours.map((m) => (
          <span key={m} className={styles.hour} style={{ top: px(m) }}>
            {timeLabel(m)}
          </span>
        ))}
      </div>

      <div className={styles.track} style={{ height }}>
        {hours.map((m) => (
          <span
            key={m}
            aria-hidden="true"
            className={styles.rule}
            style={{ top: px(m) }}
          />
        ))}

        {segments
          .filter((segment) => !windows.some((w) => w.start === segment.start))
          .map((segment) => (
            <div
              key={segment.start}
              className={styles.busy}
              data-condensed={segment.condensed || undefined}
              style={{ top: segment.top, height: segment.height }}
            >
              {segment.condensed && (
                <span>Unavailable · {windowLabel(segment)}</span>
              )}
            </div>
          ))}

        {/* Tapping a free stretch moves the block there. */}
        {windows.map((w) => (
          <button
            key={w.start}
            type="button"
            className={styles.free}
            style={{ top: px(w.start), height: px(w.end) - px(w.start) }}
            aria-label={`Free ${windowLabel(w)}: move the event here`}
            onClick={(event) => {
              // Free time is drawn at full scale, so the tap maps back directly.
              const top = event.currentTarget.getBoundingClientRect().top;
              placeAt(w, w.start + (event.clientY - top) / PX_PER_MINUTE);
            }}
          />
        ))}

        <div
          className={styles.block}
          style={{
            top: px(value.start),
            height: px(value.end) - px(value.start),
          }}
          data-drag="move"
          onPointerDown={beginDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            role="slider"
            tabIndex={0}
            className={`${styles.handle} ${styles.handleTop}`}
            aria-label="Start time"
            aria-valuemin={within?.start ?? value.start}
            aria-valuemax={value.end - SHORTEST_EVENT_MINUTES}
            aria-valuenow={value.start}
            aria-valuetext={`Starts ${timeLabel(value.start)}`}
            data-drag="start"
            onPointerDown={beginDrag}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={nudge("start")}
          >
            <span aria-hidden="true" className={styles.grip} />
          </div>

          <div className={styles.blockLabel} aria-live="polite">
            <strong>{windowLabel(value)}</strong>
            <span>{durationLabel(value.end - value.start)}</span>
          </div>

          <div
            role="slider"
            tabIndex={0}
            className={`${styles.handle} ${styles.handleBottom}`}
            aria-label="End time"
            aria-valuemin={value.start + SHORTEST_EVENT_MINUTES}
            aria-valuemax={within?.end ?? value.end}
            aria-valuenow={value.end}
            aria-valuetext={`Ends ${timeLabel(value.end)}`}
            data-drag="end"
            onPointerDown={beginDrag}
            onPointerMove={onDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={nudge("end")}
          >
            <span aria-hidden="true" className={styles.grip} />
          </div>
        </div>
      </div>
    </div>
  );
}
