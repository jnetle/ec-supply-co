import Link from "next/link";
import type { CSSProperties } from "react";

import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HOME_EVENTS } from "@/lib/content/events";

import styles from "./events.module.css";

export function Events() {
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

      <div className={styles.grid}>
        {HOME_EVENTS.map((event) => (
          <article key={event.title} data-reveal className={styles.card}>
            <BlobImage
              src={event.photo}
              alt={event.alt}
              radius="0"
              ratio="4/5"
              sizes="(max-width: 700px) 100vw, 270px"
            >
              <div
                className={styles.badge}
                style={
                  { "--badge-color": event.badgeColor } as CSSProperties
                }
              >
                <div className={styles.badgeMonth}>{event.month}</div>
                <div className={styles.badgeDay}>{event.day}</div>
              </div>
            </BlobImage>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>{event.meta}</div>
              <h3 className={styles.cardTitle}>{event.title}</h3>
              <p className={styles.cardBlurb}>{event.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
