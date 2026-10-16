"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import { PhotoCredit } from "@/components/ui/photo-credit";
import { heroTrackVh, useHeroSequence } from "@/hooks/use-hero-sequence";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { photoCredit } from "@/lib/content/thanks";

import { ARC_HEIGHT, ARC_LETTERS, ARC_WIDTH } from "./el-cerrito-arc";
import styles from "./hero.module.css";
import {
  LOGO_EXTRUDE_DEPTH_EM,
  LogoExtrudeFilter,
} from "./logo-extrude-filter";

/** The headline's largest size (7.9rem), until it can be measured. */
const DEFAULT_HEADLINE_PX = 126.4;

/**
 * The words that cycle after "Co": extruded like the rest of the wordmark,
 * but inverted from it — solid colour letters with white sides. The logo's
 * orange is kept for the fixed letters.
 */
const WORDS = [
  { suffix: "mmunity", color: "var(--color-ecs-teal)" },
  { suffix: "llaboration", color: "var(--color-ecs-marigold)" },
  { suffix: "-op", color: "var(--color-ecs-magenta)" },
];

const WORD_EXTRUDE_FILTER_ID = "ecs-word-extrude";

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

/** The corner "Replay" button for the autoplayed sequence. Off for now. */
const SHOW_REPLAY = false;

/** Must match the compact breakpoint in hero.module.css. */
const COMPACT_QUERY = "(max-width: 620px)";

const PHOTO_SRC = "/assets/photos/id-42-1600-1000.jpg";
const PHOTO_CREDIT = photoCredit(PHOTO_SRC);

export function Hero() {
  const reducedMotion = useReducedMotion();
  // Phones: the uncropped photo, unpinned; see hero.module.css.
  const compact = useMediaQuery(COMPACT_QUERY);
  const autoplay = !SCROLL_DRIVEN_HERO || compact;

  const {
    replay,
    trackRef,
    lockupRef,
    brandLineRef,
    arcRef,
    coWordRef,
    coDotRef,
    coWindowRef,
    squiggleRef,
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

  // The extrusion is drawn in pixels, so it follows the headline's
  // responsive font size.
  const [headlinePx, setHeadlinePx] = useState(DEFAULT_HEADLINE_PX);
  useEffect(() => {
    const brandLine = brandLineRef.current;
    if (!brandLine) return;
    const measure = () =>
      setHeadlinePx(parseFloat(getComputedStyle(brandLine).fontSize) || DEFAULT_HEADLINE_PX);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [brandLineRef]);

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
      <LogoExtrudeFilter depth={headlinePx * LOGO_EXTRUDE_DEPTH_EM} />
      {/* White sides, with cream bottoms so the two faces still read apart. */}
      <LogoExtrudeFilter
        id={WORD_EXTRUDE_FILTER_ID}
        depth={headlinePx * LOGO_EXTRUDE_DEPTH_EM}
        side="#fff"
        bottom="var(--color-ecs-surface)"
      />

      <div className={styles.stage} data-hero-stage>
        <div className={styles.photo}>
          <Image
            src={PHOTO_SRC}
            alt="The shop floor on an event night, seen from the sidewalk"
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className={styles.scrim} aria-hidden="true" />
        <div ref={washRef} className={styles.wash} aria-hidden="true" />

        <div className={styles.content}>
          {/* Laid out in the end state; at rest the hook carries "Co" up beside
              "Supply" and arches "El Cerrito" over both, as in the logo. */}
          <div ref={lockupRef} className={styles.lockup}>
            {/* The logo's own lettering, arched and straight; the hook moves
                each letter from one to the other. */}
            <svg
              ref={arcRef}
              aria-hidden="true"
              viewBox={`0 0 ${ARC_WIDTH} ${ARC_HEIGHT}`}
              className={styles.arc}
            >
              {ARC_LETTERS.map((letter, i) => (
                <g key={i}>
                  <path d={letter.arched} />
                  <path d={letter.straight} opacity={0} />
                </g>
              ))}
            </svg>

            <h1 className={styles.heading}>
              <span className="sr-only">El Cerrito </span>
              <span ref={brandLineRef} className={styles.brandLine}>
                Supply
              </span>
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

              {/* The extrusion is drawn on the inner face, so the swell only
                  scales an already-drawn picture instead of redrawing the
                  filter at every in-between size, which made its edges
                  jitter. */}
              <span ref={coWordRef} className={styles.coWord}>
                <span className={styles.coFace}>
                  Co
                  {/* A round dot, as in the logo; the font's period is square. */}
                  <span ref={coDotRef} className={styles.coDot}>
                    <span className={styles.coDotMark} />
                  </span>
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
                <div className={`film ${styles.signPlank}`}>
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

        {/* Only the autoplayed sequence has a start to go back to. */}
        {SHOW_REPLAY && autoplay && !reducedMotion ? (
          <button type="button" className={styles.replay} onClick={replay}>
            <span aria-hidden="true">↻</span> Replay
          </button>
        ) : null}

        {PHOTO_CREDIT && (
          <PhotoCredit
            helper={PHOTO_CREDIT}
            variant="corner"
            className={styles.credit}
          />
        )}
      </div>
    </section>
  );
}
