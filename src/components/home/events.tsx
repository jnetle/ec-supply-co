import Link from "next/link";
import type { CSSProperties } from "react";

import { EventPhoto } from "@/components/calendar/event-photo";
import {
  type DecoratedEvent,
  decorate,
  shopTodayKey,
  upcomingEvents,
} from "@/components/calendar/event-model";
import { button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  CALENDAR_EVENTS,
  CALENDAR_SUBSCRIBE_ENABLED,
} from "@/lib/content/calendar";
import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";

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
            className={button({ variant: "outline", tone: "magenta" })}
          >
            Full calendar + sign-ups →
          </Link>
          {HOST_WITH_US_ENABLED && (
            <Link
              href="/host-with-us"
              className={button({ variant: "outline", tone: "navy" })}
            >
              Book a private event
            </Link>
          )}
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

        <Link
          href="/calendar"
          className={button({ className: styles.featureCta })}
        >
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
        {CALENDAR_SUBSCRIBE_ENABLED ? (
          <>
            New workshops and popups land all season long. Subscribe once and
            they&rsquo;ll show up in your calendar on their own.
          </>
        ) : (
          <>
            New workshops and popups land all season long. Get the newsletter
            to hear about them first.
          </>
        )}
      </p>
      <div className={styles.moreLinks}>
        {CALENDAR_SUBSCRIBE_ENABLED && (
          <Link
            href="/calendar#subscribe-heading"
            className={button({
              variant: "outline",
              tone: "tealDeep",
              size: "sm",
            })}
          >
            Subscribe to the calendar
          </Link>
        )}
        <Link
          href="#signup"
          className={button({
            variant: "outline",
            tone: "tealDeep",
            size: "sm",
          })}
        >
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
          neighborhood nights.{" "}
          {CALENDAR_SUBSCRIBE_ENABLED
            ? "Subscribe to the calendar and they’ll appear the moment they’re posted."
            : "Get the newsletter and you’ll hear the moment they’re posted."}
        </p>
        {CALENDAR_SUBSCRIBE_ENABLED ? (
          <div className={styles.moreLinks}>
            <Link
              href="/calendar#subscribe-heading"
              className={button({ tone: "magenta", size: "sm" })}
            >
              Subscribe to the calendar
            </Link>
            <Link
              href="#signup"
              className={button({
                variant: "outline",
                tone: "ply",
                size: "sm",
              })}
            >
              Get the newsletter
            </Link>
          </div>
        ) : (
          <div className={styles.moreLinks}>
            <Link
              href="#signup"
              className={button({
                tone: "magenta",
                size: "sm",
              })}
            >
              Get the newsletter
            </Link>
          </div>
        )}
      </div>

      {/* Revealed on a wrapper, since the reveal's inline transform would
          straighten the note's tilt. */}
      {HOST_WITH_US_ENABLED && (
        <div data-reveal className={styles.noteWrap}>
          <Link href="/host-with-us" className={styles.note}>
            <span className={styles.notePin} aria-hidden="true" />
            <span className={styles.noteKicker}>Open date</span>
            <span className={styles.noteTitle}>Your event here?</span>
            <span className={styles.noteCopy}>
              Teach a class, throw a party or host a popup at the shop.
            </span>
            <span className={styles.noteCta}>Book the space →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
