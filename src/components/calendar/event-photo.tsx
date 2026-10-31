import Image from "next/image";
import type { CSSProperties } from "react";

import { PhotoCredit } from "@/components/ui/photo-credit";
import { WixImage } from "@/components/ui/wix-image";
import { photoCredit } from "@/lib/content/thanks";
import { isWixMedia } from "@/lib/wix-media";

import type { DecoratedEvent } from "./event-model";

import styles from "./event-photo.module.css";
import { EventPhotoZoom } from "./event-photo-zoom";

/** The front window, from the empty calendar, for events with no photo yet. */
const FALLBACK_PHOTO = "/assets/photos/shop/front-window-sign.jpg";

/**
 * Every event photo is a 4:5 portrait, Instagram's portrait size (1080×1350).
 * Graphics are made to that shape before they're uploaded to Wix, so they
 * show whole; any other shape is cropped to fill it.
 */
const FRAME_RATIO = 4 / 5;

type EventPhotoProps = {
  event: Pick<
    DecoratedEvent,
    | "photo"
    | "photoRatio"
    | "title"
    | "dow"
    | "day"
    | "month"
    | "categoryColor"
    | "categoryInk"
  >;
  sizes: string;
  className?: string;
  /** Pin the date chip over the photo's corner. Off where the date sits
   * beside the photo instead, so it never covers text in a Canva graphic. */
  chip?: boolean;
};

/**
 * The photo and date chip shared by the home page cards and the
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
  const ratio = FRAME_RATIO;

  return (
    <div
      className={`${styles.photo} ${className}`}
      style={{ "--photo-ratio": ratio } as CSSProperties}
    >
      <PhotoImage photo={photo} ratio={ratio} sizes={sizes} />
      {/* Only the event's own Wix photo opens large; the stand-in doesn't. */}
      {event.photo && event.photoRatio && isWixMedia(event.photo) && (
        <EventPhotoZoom
          src={event.photo}
          ratio={event.photoRatio}
          title={event.title}
        />
      )}
      {chip && <EventDateChip event={event} className={styles.pinned} />}
      {credit && <PhotoCredit helper={credit} />}
    </div>
  );
}

function PhotoImage({
  photo,
  ratio,
  sizes,
}: {
  photo: string;
  ratio: number;
  sizes: string;
}) {
  return isWixMedia(photo) ? (
    <WixImage src={photo} ratio={`${ratio}/1`} alt="" fill sizes={sizes} />
  ) : (
    <Image src={photo} alt="" fill sizes={sizes} />
  );
}

/**
 * The event's weekday, day and month, in its category colours: "SAT 7 NOV",
 * or "THRU 30 NOV" for a run.
 */
export function EventDateChip({
  event,
  className = "",
}: {
  event: Pick<
    DecoratedEvent,
    "dow" | "day" | "month" | "categoryColor" | "categoryInk"
  >;
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
      <span className={styles.chipMonth}>{event.month}</span>
    </div>
  );
}
