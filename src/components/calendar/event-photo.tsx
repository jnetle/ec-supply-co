import Image from "next/image";
import type { CSSProperties } from "react";

import { PhotoCredit } from "@/components/ui/photo-credit";
import { WixImage } from "@/components/ui/wix-image";
import { photoCredit } from "@/lib/content/thanks";
import { isWixMedia } from "@/lib/wix-media";

import type { DecoratedEvent } from "./event-model";

import styles from "./event-photo.module.css";

/** The front window, from the empty calendar, for events with no photo yet. */
const FALLBACK_PHOTO = "/assets/photos/shop/front-window-sign.jpg";

type EventPhotoProps = {
  event: Pick<
    DecoratedEvent,
    "photo" | "dow" | "day" | "categoryColor" | "categoryInk"
  >;
  sizes: string;
  className?: string;
  /** Pin the date chip over the photo's corner. Off where the date sits
   * beside the photo instead, so it never covers text in a Canva graphic. */
  chip?: boolean;
};

/**
 * The square photo and date chip shared by the home page cards and the
 * calendar list. Decorative, since the event's title always sits beside it.
 * An event without a photo shows the shop's front window instead, the same
 * photo as the empty calendar, until its own graphic is uploaded.
 */
export function EventPhoto({
  event,
  sizes,
  className = "",
  chip = true,
}: EventPhotoProps) {
  const photo = event.photo ?? FALLBACK_PHOTO;
  const credit = photoCredit(photo);

  return (
    <div className={`${styles.photo} ${className}`}>
      {isWixMedia(photo) ? (
        <WixImage src={photo} ratio="1/1" alt="" fill sizes={sizes} />
      ) : (
        <Image src={photo} alt="" fill sizes={sizes} />
      )}
      {chip && <EventDateChip event={event} className={styles.pinned} />}
      {credit && <PhotoCredit helper={credit} />}
    </div>
  );
}

/** The event's weekday and day, in its category colours. */
export function EventDateChip({
  event,
  className = "",
}: {
  event: Pick<DecoratedEvent, "dow" | "day" | "categoryColor" | "categoryInk">;
  className?: string;
}) {
  return (
    <div
      className={`${styles.chip} ${className}`}
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
  );
}
