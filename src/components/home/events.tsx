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
  CALENDAR_SUBSCRIBE_ENABLED,
  EVENTS_PREVIEW,
} from "@/lib/content/calendar";
import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";
import { getCalendarEvents } from "@/lib/events";

import styles from "./events.module.css";

const CALENDAR_PREVIEW_HREF = `/calendar?${EVENTS_PREVIEW.param}=${EVENTS_PREVIEW.value}`;

/**
 * The next few events from the community calendar, the one source of truth.
 * `preview` shows Wix events before they're switched on for everyone.
 */
export async function Events({ preview = false }: { preview?: boolean }) {
  const today = shopTodayKey();
  const events = upcomingEvents(await getCalendarEvents(preview), today, 4).map(
    (e) => decorate(e, {}, today),
  );

  return (
    <section id="events" className={styles.section}>
      <div className={styles.header}>
        <div>
          <Eyebrow
            color="var(--color-ecs-cobalt)"
            ink="#ffffff"
            className="mb-[18px]"
          >
            {preview ? "Preview: Wix events" : "Fall calendar"}
          </Eyebrow>
          <h2 className={styles.heading}>What&rsquo;s coming up</h2>
        </div>

        <div className={styles.actions}>
          <Link
            href={preview ? CALENDAR_PREVIEW_HREF : "/calendar"}
            className={button({ variant: "outline", tone: "navy" })}
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
          <FeaturedEvent event={events[0]} preview={preview} />
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
                  {[event.longDate, event.time, event.priceLabel]
                    .filter(Boolean)
                    .join(" · ")}
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
function FeaturedEvent({
  event,
  preview,
}: {
  event: DecoratedEvent;
  preview: boolean;
}) {
  return (
    <article data-reveal className={styles.feature}>
      <EventPhoto
        event={event}
        className={styles.featurePhoto}
        sizes="(max-width: 640px) 100vw, 460px"
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
            {event.time && <dd>{event.time}</dd>}
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{event.priceLabel}</dd>
            <dd>{event.spotsLabel}</dd>
          </div>
        </dl>

        <Link
          href={preview ? CALENDAR_PREVIEW_HREF : "/calendar"}
          className={button({ tone: "navy", className: styles.featureCta })}
        >
          {event.cta === "Details" ? "See details" : event.cta} →
        </Link>
      </div>
    </article>
  );
}

/**
 * Beside a lone event, so it doesn't sit by itself. No newsletter pitch here;
 * the section's empty board and the signup band below already make it.
 */
function MoreOnTheWay() {
  return (
    <aside data-reveal className={styles.more}>
      <p className={styles.moreKicker}>More on the way</p>
      <p className={styles.moreCopy}>
        {HOST_WITH_US_ENABLED
          ? "Workshops, pop-ups and neighborhood nights are filling in. Got one of your own? We have room."
          : "Workshops, pop-ups and neighborhood nights are filling in. Check back here as the calendar grows."}
      </p>
      {HOST_WITH_US_ENABLED && (
        <div className={styles.moreLinks}>
          <Link
            href="/host-with-us"
            className={button({ variant: "outline", tone: "navy", size: "sm" })}
          >
            Pitch a pop-up →
          </Link>
        </div>
      )}
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
              className={button({ tone: "navy", size: "sm" })}
            >
              Subscribe to the calendar
            </Link>
            <Link
              href="#signup"
              className={button({
                variant: "outline",
                tone: "navy",
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
                tone: "navy",
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
