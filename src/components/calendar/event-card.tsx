"use client";

import type { CSSProperties } from "react";

import { button } from "@/components/ui/button";

import styles from "./event-card.module.css";
import type { DecoratedEvent } from "./event-model";
import { EventPhoto } from "./event-photo";

/**
 * One event, the same card on the home page and the calendar.
 *
 * - "wide": the photo beside the text, for one or two events in a row.
 * - "stacked": the photo on top, for a full row of cards.
 *
 * The main button does the main thing. Booked on the host's own site (a
 * pick-up's preorder, a vendor's workshop), it goes straight there, with a
 * quiet Details link for the pop-up. Otherwise it opens the pop-up, which
 * holds the full details and the sign-up form.
 */
export function EventCard({
  event,
  onSelect,
  layout,
  sizes,
  reveal = false,
}: {
  event: DecoratedEvent;
  onSelect: (eventId: string) => void;
  layout: "wide" | "stacked";
  /** The photo's `sizes`, for the column it sits in. */
  sizes: string;
  /** Fades in on scroll, like the rest of the home page. */
  reveal?: boolean;
}) {
  const wide = layout === "wide";

  return (
    <article
      data-reveal={reveal || undefined}
      className={`${styles.card} ${wide ? styles.wide : styles.stacked}`}
      style={{ "--card-opacity": event.past ? 0.5 : 1 } as CSSProperties}
    >
      <EventPhoto
        event={event}
        className={styles.photo}
        whole={wide}
        sizes={sizes}
      />

      <div className={styles.body}>
        <span
          className={styles.tag}
          style={
            {
              "--tag-color": event.categoryColor,
              "--tag-ink": event.categoryInk,
            } as CSSProperties
          }
        >
          {event.categoryLabel}
        </span>
        {event.draft && <span className={styles.draft}>Draft</span>}
        <h3 className={styles.title}>{event.title}</h3>
        {event.description && (
          <p className={styles.blurb}>{event.description}</p>
        )}

        <dl className={styles.facts}>
          <div>
            <dt>When</dt>
            <dd>{event.longDate}</dd>
            {event.time && <dd>{event.time}</dd>}
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{event.priceLabel}</dd>
            {event.spotsLabel && <dd>{event.spotsLabel}</dd>}
          </div>
        </dl>

        <div className={styles.actions}>
          {event.orderUrl && !event.past ? (
            <>
              <a
                href={event.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={button({ tone: "navy" })}
              >
                {event.cta} →
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={() => onSelect(event.id)}
                className={button({ variant: "link", tone: "navy" })}
              >
                Details
                <span className="sr-only"> about {event.title}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(event.id)}
              disabled={event.past}
              className={button({ variant: event.ctaVariant, tone: "navy" })}
            >
              {event.cta}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
