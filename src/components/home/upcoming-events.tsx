"use client";

import { useMemo, useState, type ReactNode } from "react";

import { EventCard } from "@/components/calendar/event-card";
import { EventDialog } from "@/components/calendar/event-dialog";
import { decorate } from "@/components/calendar/event-model";
import { useMySeats, useToday } from "@/components/calendar/signups-store";
import type { CalendarEvent } from "@/lib/content/calendar";

import styles from "./events.module.css";

/**
 * The home page's next few events, as the calendar's own cards with the same
 * pop-up behind them, so a sign-up or a look at the details works here too.
 * A lone event sits beside `more`; two share the row; more make a grid.
 */
export function UpcomingEvents({
  events,
  more,
}: {
  events: CalendarEvent[];
  /** Beside a lone event, so it doesn't sit by itself. */
  more: ReactNode;
}) {
  const { seats, reserve } = useMySeats();
  const today = useToday();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const decorated = useMemo(
    () => events.map((event) => decorate(event, seats, today)),
    [events, seats, today],
  );
  const selected = decorated.find((event) => event.id === selectedId) ?? null;

  const cards =
    decorated.length <= 2 ? (
      decorated.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onSelect={setSelectedId}
          layout="wide"
          sizes="(max-width: 640px) 100vw, 420px"
          reveal
        />
      ))
    ) : (
      decorated.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onSelect={setSelectedId}
          layout="stacked"
          sizes="(max-width: 700px) 100vw, 320px"
          reveal
        />
      ))
    );

  return (
    <>
      {decorated.length === 1 ? (
        <div className={styles.solo}>
          {cards}
          {more}
        </div>
      ) : (
        <div className={decorated.length === 2 ? styles.pair : styles.grid}>
          {cards}
        </div>
      )}

      <EventDialog
        event={selected}
        onClose={() => setSelectedId(null)}
        onReserve={reserve}
      />
    </>
  );
}
