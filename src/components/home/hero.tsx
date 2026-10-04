"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { heroTrackVh, useHeroSequence } from "@/hooks/use-hero-sequence";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import styles from "./hero.module.css";

/**
 * The words that cycle after "Co". Each is painted in colour on a cream
 * block — inverted from the fixed letters above, which are cream on colour.
 * Vermilion is reserved for the fixed letters, so the rotating words stay
 * off it and the two never read as the same paint.
 */
const WORDS = [
  { suffix: "mmunity", color: "var(--color-ecs-teal)" },
  { suffix: "llaboration", color: "var(--color-ecs-marigold)" },
  { suffix: "-op", color: "var(--color-ecs-magenta)" },
];

/** Photo tint per word, cycled as the sequence advances. */
const WASH_COLORS = [
  "var(--color-ecs-teal-deep)",
  "var(--color-ecs-navy)",
  "var(--color-ecs-teal-deep)",
];

const SQUIGGLE =
  "M3 11 q10 -9 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0";

/**
 * The hanging "Coming Soon" sign. Turning it off shortens the hero from a
 * 352vh track to 179vh, since the sign needs roughly seven extra scroll
 * stops to be lowered and dwell on.
 */
const SHOW_COMING_SOON_SIGN = true;

/**
 * Feature flag. Off: the sequence plays once on its own and the hero is a
 * plain full-screen photo that scrolls away. On: the original scroll-driven
 * version on desktop, the photo pinned while the visitor's scroll scrubs
 * the sequence over a 352vh track, with the "Scroll" cue at the bottom.
 * Phones always autoplay, since the compact hero there is too short to pin.
 */
const SCROLL_DRIVEN_HERO = false;

/** Must match the compact breakpoint in hero.module.css. */
const COMPACT_QUERY = "(max-width: 620px)";

export function Hero() {
  const reducedMotion = useReducedMotion();
  // Phones: the uncropped photo, unpinned; see hero.module.css.
  const compact = useMediaQuery(COMPACT_QUERY);
  const autoplay = !SCROLL_DRIVEN_HERO || compact;

  const {
    trackRef,
    lockupRef,
    brandLineRef,
    coWordRef,
    coDotRef,
    coWindowRef,
    squiggleRef,
    kickerRef,
    cueRef,
    washRef,
    signRef,
    signTextRef,
  } = useHeroSequence({
    washColors: WASH_COLORS,
    wordCount: WORDS.length,
    enabled: !reducedMotion,
    showSign: SHOW_COMING_SOON_SIGN,
    autoplay,
  });

  return (
    <section
      ref={trackRef}
      id="hero-track"
      className={styles.track}
      style={
        {
          // Unpinned, the track just wraps the stage.
          "--hero-track-height": SCROLL_DRIVEN_HERO
            ? `${heroTrackVh(WORDS.length, SHOW_COMING_SOON_SIGN)}vh`
            : "auto",
        } as CSSProperties
      }
    >
      <div className={styles.stage}>
        <div className={styles.photo}>
          <Image
            src="/assets/photos/id-42-1600-1000.jpg"
            alt="The shop floor on an event night, seen from the sidewalk"
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className={styles.scrim} aria-hidden="true" />
        <div ref={washRef} className={styles.wash} aria-hidden="true" />

        <div className={styles.content}>
          <div ref={kickerRef} className={styles.kicker}>
            Built by neighbors · 7523 Fairmount Ave
          </div>

          <div ref={lockupRef} className={styles.lockup}>
            <h1 ref={brandLineRef} className={styles.brandLine}>
              El Cerrito Supply
            </h1>

            <div className={styles.secondLine}>
              <svg
                ref={squiggleRef}
                aria-hidden="true"
                viewBox="0 0 204 22"
                preserveAspectRatio="none"
                className={styles.squiggle}
              >
                <path
                  d={SQUIGGLE}
                  fill="none"
                  stroke="#fbf3e3"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <span ref={coWordRef} className={styles.coWord}>
                Co
                <span ref={coDotRef} className={styles.coDot}>
                  .
                </span>
              </span>

              {/* Only the widest word is announced; the rest are decorative
                  states of the same headline. */}
              <div ref={coWindowRef} className={styles.coWindow}>
                {WORDS.map((word, i) => (
                  <span
                    key={word.suffix}
                    data-suffix={i}
                    aria-hidden="true"
                    className={styles.suffix}
                    style={{ "--suffix-color": word.color } as CSSProperties}
                  >
                    {word.suffix}
                  </span>
                ))}
              </div>
            </div>

            {SHOW_COMING_SOON_SIGN ? (
              <div ref={signRef} aria-hidden="true" className={styles.sign}>
                <div className={styles.signPlank}>
                  <span className={styles.signPole} data-side="left" />
                  <span className={styles.signPole} data-side="right" />
                  <span ref={signTextRef} className={styles.signText}>
                    ming Soon
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* The cue only means something while scroll drives the sequence. */}
        {SCROLL_DRIVEN_HERO ? (
          <div ref={cueRef} className={styles.cue} aria-hidden="true">
            <span>Scroll</span>
            <span className={styles.cueLine} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
