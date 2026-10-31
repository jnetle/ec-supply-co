"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

import { button } from "@/components/ui/button";
import { WixImage } from "@/components/ui/wix-image";

import styles from "./event-photo-zoom.module.css";

/** Wide enough to read the small print on a 1080px Instagram flyer. */
const FULL_WIDTH = 1600;

/**
 * Opens an event's photo whole and large, so the small print on a flyer can
 * be read. The whole photo is a click target for the mouse; the corner
 * button is the one keyboards and screen readers use.
 */
export function EventPhotoZoom({
  src,
  ratio,
  title,
}: {
  src: string;
  /** The photo's width over its height. */
  ratio: number;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className={styles.cover}
        onClick={() => setOpen(true)}
      />
      <Dialog.Trigger
        className={button({
          tone: "paper",
          size: "sm",
          icon: true,
          className: styles.expand,
        })}
        aria-label={`Show the photo for ${title} larger`}
      >
        <ExpandIcon />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <WixImage
            src={src}
            ratio={`${ratio}/1`}
            alt={title}
            width={FULL_WIDTH}
            height={Math.round(FULL_WIDTH / ratio)}
            sizes="92vw"
            className={styles.image}
          />
          <Dialog.Close
            className={button({
              tone: "paper",
              size: "sm",
              icon: true,
              className: styles.close,
            })}
            aria-label="Close"
          >
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}
