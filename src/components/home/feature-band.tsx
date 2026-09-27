import type { CSSProperties, ReactNode } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Tag } from "@/components/ui/tag";
import { WaveDivider } from "@/components/ui/wave-divider";

import styles from "./feature-band.module.css";

export type BandTag = { label: string; color: string; ink: string };

type FeatureBandProps = {
  id: string;
  /** The band's fill; the wave dividers take the same colour. */
  background: string;
  foreground?: string;
  eyebrow: { label: string; color: string; ink: string };
  heading: string;
  /** Small uppercase line under the heading. */
  kicker?: string;
  kickerColor?: string;
  paragraphs: string[];
  tags?: BandTag[];
  /** The photo column. */
  media: ReactNode;
  /** Puts the photo column first on wide screens. */
  mediaFirst?: boolean;
  /** Decorative drifting shapes, rendered behind the content. */
  decoration?: ReactNode;
};

export function FeatureBand({
  id,
  background,
  foreground = "inherit",
  eyebrow,
  heading,
  kicker,
  kickerColor,
  paragraphs,
  tags,
  media,
  mediaFirst = false,
  decoration,
}: FeatureBandProps) {
  return (
    <section
      id={id}
      className={styles.band}
      style={
        {
          "--band-bg": background,
          "--band-fg": foreground,
          "--band-kicker": kickerColor,
        } as CSSProperties
      }
    >
      <WaveDivider edge="top" fill={background} />
      <WaveDivider edge="bottom" fill={background} />
      {decoration}

      <div data-reveal className={styles.copy}>
        <Eyebrow color={eyebrow.color} ink={eyebrow.ink} className="mb-[18px]">
          {eyebrow.label}
        </Eyebrow>
        <h2 className={styles.heading}>{heading}</h2>
        {kicker ? <div className={styles.kicker}>{kicker}</div> : null}

        <div className={styles.prose}>
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>

        {tags?.length ? (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Tag key={tag.label} color={tag.color} ink={tag.ink}>
                {tag.label}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>

      <div
        data-reveal
        className={`${styles.media} ${mediaFirst ? styles.mediaFirst : ""}`}
      >
        {media}
      </div>
    </section>
  );
}
