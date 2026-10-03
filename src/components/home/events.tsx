import Link from "next/link";
import type { CSSProperties } from "react";

import { EventPhoto } from "@/components/calendar/event-photo";
import {
  decorate,
  shopTodayKey,
  upcomingEvents,
} from "@/components/calendar/event-model";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CALENDAR_EVENTS } from "@/lib/content/calendar";

import styles from "./events.module.css";

/** The next few events from the community calendar, the one source of truth. */
export function Events() {
  const today = shopTodayKey();
  const events = upcomingEvents(CALENDAR_EVENTS, today, 4).map((e) =>
    decorate(e, {}, today),
  );

  return (
    <section id="events" className={styles.section}>
      <div className={styles.header}>
        <div>
          <Eyebrow
            color="var(--color-ecs-magenta)"
            ink="#ffffff"
            className="mb-[18px]"
          >
            Fall calendar
          </Eyebrow>
          <h2 className={styles.heading}>What&rsquo;s coming up</h2>
        </div>

        <div className={styles.actions}>
          <Link
            href="/calendar"
            className={styles.action}
            style={
              { "--action-color": "var(--color-ecs-magenta)" } as CSSProperties
            }
          >
            Full calendar + sign-ups →
          </Link>
          <Link
            href="/private-events"
            className={styles.action}
            style={
              { "--action-color": "var(--color-ecs-navy)" } as CSSProperties
            }
          >
            Book a private event
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <p className={styles.empty}>
          Nothing scheduled just yet. New workshops and popups land on the{" "}
          <Link href="/calendar">full calendar</Link> first.
        </p>
      ) : (
        <div className={styles.grid}>
          {events.map((event) => (
            <article key={event.id} data-reveal className={styles.card}>
              <EventPhoto
                event={event}
                className={styles.cardPhoto}
                sizes="(max-width: 700px) 100vw, 270px"
              />
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  {event.longDate} · {event.time} · {event.priceLabel}
                </div>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <p className={styles.cardBlurb}>{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
