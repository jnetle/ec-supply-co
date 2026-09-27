import type { CSSProperties } from "react";

import styles from "./blob.module.css";

type BlobProps = {
  color: string;
  /** Scroll multiplier; negative drifts against the scroll direction. */
  parallax?: number;
  /** Staggers the morph so neighbouring blobs don't pulse in unison. */
  delay?: string;
  /** Anything positional — inset, width, height. */
  style?: CSSProperties;
};

export function Blob({ color, parallax, delay = "0s", style }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      data-parallax={parallax}
      className={styles.blob}
      style={
        {
          "--blob-color": color,
          animationDelay: delay,
          ...style,
        } as CSSProperties
      }
    />
  );
}
