import Image from "next/image";
import type { CSSProperties } from "react";

import styles from "./blob-image.module.css";

type BlobImageProps = {
  src: string;
  alt: string;
  /** The mask's asymmetric corners. */
  radius: string;
  /** CSS `aspect-ratio`, e.g. "16/10". */
  ratio: string;
  sizes: string;
  /** Drifts the photo inside the mask as the page scrolls. */
  parallax?: boolean;
  /** Cycles the mask through the organic shapes; used for portraits. */
  morphing?: boolean;
  /** Staggers the morph between neighbouring portraits. */
  delay?: string;
  className?: string;
  style?: CSSProperties;
  /** Overlay content pinned inside the mask, such as a date badge. */
  children?: React.ReactNode;
};

export function BlobImage({
  src,
  alt,
  radius,
  ratio,
  sizes,
  parallax = true,
  morphing = false,
  delay,
  className = "",
  style,
  children,
}: BlobImageProps) {
  return (
    <div
      className={`washed ${styles.frame} ${morphing ? styles.morphing : ""} ${className}`}
      style={
        {
          "--frame-radius": radius,
          "--frame-ratio": ratio,
          animationDelay: delay,
          ...style,
        } as CSSProperties
      }
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        data-parallax-img={parallax ? "1" : undefined}
      />
      {children}
    </div>
  );
}
