import Link from "next/link";
import {
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
import { UpcomingEvents } from "./upcoming-events";

const CALENDAR_PREVIEW_HREF = `/calendar?${EVENTS_PREVIEW.param}=${EVENTS_PREVIEW.value}`;

/**
 * The next few events from the community calendar, the one source of truth.
 * `preview` shows Wix events before they're switched on for everyone.
 */
export async function Events({ preview = false }: { preview?: boolean }) {
  const today = shopTodayKey();
  const events = upcomingEvents(await getCalendarEvents(preview), today, 4);

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
            See the full calendar →
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
      ) : (
        <UpcomingEvents events={events} more={<MoreOnTheWay />} />
      )}
    </section>
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
