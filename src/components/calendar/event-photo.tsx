import Image from "next/image";
import type { CSSProperties } from "react";

import { PhotoCredit } from "@/components/ui/photo-credit";
import { photoCredit } from "@/lib/content/thanks";

import type { DecoratedEvent } from "./event-model";

import styles from "./event-photo.module.css";

type EventPhotoProps = {
  event: Pick<
    DecoratedEvent,
    "photo" | "dow" | "day" | "categoryColor" | "categoryInk"
  >;
  sizes: string;
  className?: string;
};

/**
 * The square photo and date chip shared by the home page cards and the
 * calendar list. Decorative, since the event's title always sits beside it.
 */
export function EventPhoto({ event, sizes, className = "" }: EventPhotoProps) {
  const credit = photoCredit(event.photo);

  return (
    <div className={`${styles.photo} ${className}`}>
      <Image src={event.photo} alt="" fill sizes={sizes} />
      <div
        className={styles.chip}
        style={
          {
            "--chip-color": event.categoryColor,
            "--chip-ink": event.categoryInk,
          } as CSSProperties
        }
      >
        <span className={styles.chipDow}>{event.dow}</span>
        <span className={styles.chipDay}>{event.day}</span>
      </div>
      {credit && <PhotoCredit helper={credit} />}
    </div>
  );
}
