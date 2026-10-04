import Link from "next/link";
import type { CSSProperties } from "react";

import { EventPhoto } from "@/components/calendar/event-photo";
import {
  type DecoratedEvent,
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
        <EmptyBoard />
      ) : events.length === 1 ? (
        <div className={styles.solo}>
          <FeaturedEvent event={events[0]} />
          <MoreOnTheWay />
        </div>
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

/**
 * A lone event gets the room four cards would have shared: a wide card with
 * the details a visitor needs to decide, beside a nudge to hear about the next.
 */
function FeaturedEvent({ event }: { event: DecoratedEvent }) {
  return (
    <article data-reveal className={styles.feature}>
      <EventPhoto
        event={event}
        className={styles.featurePhoto}
        sizes="(max-width: 700px) 100vw, 420px"
      />
      <div className={styles.featureBody}>
        <span
          className={styles.featureTag}
          style={
            {
              "--tag-color": event.categoryColor,
              "--tag-ink": event.categoryInk,
            } as CSSProperties
          }
        >
          {event.categoryLabel}
        </span>
        <h3 className={styles.featureTitle}>{event.title}</h3>
        <p className={styles.featureHost}>with {event.host}</p>
        <p className={styles.featureBlurb}>{event.description}</p>

        <dl className={styles.featureFacts}>
          <div>
            <dt>When</dt>
            <dd>{event.longDate}</dd>
            <dd>{event.time}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{event.priceLabel}</dd>
            <dd>{event.spotsLabel}</dd>
          </div>
        </dl>

        <Link href="/calendar" className={styles.featureCta}>
          {event.cta === "Details" ? "See details" : event.cta} →
        </Link>
      </div>
    </article>
  );
}

/** Shared by the one-event and no-event layouts: where the next ones show up. */
function MoreOnTheWay() {
  return (
    <aside data-reveal className={styles.more}>
      <p className={styles.moreKicker}>More on the way</p>
      <p className={styles.moreCopy}>
        New workshops and popups land all season long. Subscribe once and
        they&rsquo;ll show up in your calendar on their own.
      </p>
      <div className={styles.moreLinks}>
        <Link href="/calendar#subscribe-heading" className={styles.moreLink}>
          Subscribe to the calendar
        </Link>
        <Link href="#signup" className={styles.moreLink}>
          Get the newsletter
        </Link>
      </div>
    </aside>
  );
}

/**
 * Between seasons: an empty corkboard with one note pinned to it, so the
 * section still invites something instead of apologising.
 */
function EmptyBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.boardMessage}>
        <p className={styles.boardScript}>Fresh flyers soon</p>
        <h3 className={styles.boardTitle}>The board&rsquo;s clear for now</h3>
        <p className={styles.boardCopy}>
          We&rsquo;re lining up the next round of workshops, popups and
          neighborhood nights. Subscribe to the calendar and they&rsquo;ll
          appear the moment they&rsquo;re posted.
        </p>
        <div className={styles.moreLinks}>
          <Link
            href="/calendar#subscribe-heading"
            className={styles.boardPrimary}
          >
            Subscribe to the calendar
          </Link>
          <Link href="#signup" className={styles.moreLink}>
            Get the newsletter
          </Link>
        </div>
      </div>

      {/* Revealed on a wrapper, since the reveal's inline transform would
          straighten the note's tilt. */}
      <div data-reveal className={styles.noteWrap}>
        <Link href="/private-events" className={styles.note}>
          <span className={styles.notePin} aria-hidden="true" />
          <span className={styles.noteKicker}>Open date</span>
          <span className={styles.noteTitle}>Your event here?</span>
          <span className={styles.noteCopy}>
            Teach a class, throw a party or host a popup at the shop.
          </span>
          <span className={styles.noteCta}>Book the space →</span>
        </Link>
      </div>
    </div>
  );
}
