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
 * The frame's width over its height: the photo's own shape, from square down
 * to a 3:4 portrait, so Instagram-sized flyers (4:5, 3:4) show whole. Anything
 * wider stays square, and anything taller is cropped to 3:4.
 */
function frameRatio(photoRatio: number | undefined): number {
  return Math.min(1, Math.max(3 / 4, photoRatio ?? 1));
}

type EventPhotoProps = {
  event: Pick<
    DecoratedEvent,
    "photo" | "photoRatio" | "title" | "dow" | "day" | "categoryColor" | "categoryInk"
  >;
  sizes: string;
  className?: string;
  /** Pin the date chip over the photo's corner. Off where the date sits
   * beside the photo instead, so it never covers text in a Canva graphic. */
  chip?: boolean;
  /**
   * For a frame stretched taller than the photo (a wide card beside its
   * text): show the whole photo over a blurred copy of itself, instead of
   * cropping the sides off a flyer.
   */
  whole?: boolean;
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
  whole = false,
}: EventPhotoProps) {
  const photo = event.photo ?? FALLBACK_PHOTO;
  const credit = photoCredit(photo);
  const ratio = frameRatio(event.photo ? event.photoRatio : undefined);
  // Only the event's own image, usually a flyer, is kept whole; the shop
  // photo that stands in is a plain photo and looks best filling the frame.
  const keepWhole = whole && Boolean(event.photo);

  return (
    <div
      className={`${styles.photo} ${keepWhole ? styles.whole : ""} ${className}`}
      style={{ "--photo-ratio": ratio } as CSSProperties}
    >
      {keepWhole && (
        <div className={styles.backdrop} aria-hidden>
          <PhotoImage photo={photo} ratio={ratio} sizes="64px" />
        </div>
      )}
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
