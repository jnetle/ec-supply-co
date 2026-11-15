"use client";

import Image from "next/image";
import { useEffect, useId, useState, type CSSProperties } from "react";

import { PhotoCredit } from "@/components/ui/photo-credit";
import { heroTrackVh, useHeroSequence } from "@/hooks/use-hero-sequence";
import { useHeroTagline } from "@/hooks/use-hero-tagline";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { photoCredit } from "@/lib/content/thanks";

import { ARC_HEIGHT, ARC_LETTERS, ARC_WIDTH } from "./el-cerrito-arc";
import styles from "./hero.module.css";
import { LOGO_LAYOUT, TAGLINE } from "./logo-tagline";
import { CAP_HEIGHT, CO, DOT, SUPPLY } from "./logo-wordmark";
import {
  LOGO_EXTRUDE_DEPTH_EM,
  LogoExtrudeFilter,
} from "./logo-extrude-filter";

/**
 * Which story the hero tells.
 *
 * - `tagline`: the logo stays put; "Co." swells, then its dot hops down a
 *   line and writes out the logo's tagline, "Community, Collaboration,
 *   Co-op", before hopping home. Ends as the full logo with its tagline.
 * - `words`: the earlier version. "Co" drops to its own line and the words
 *   cycle after it ("Co-mmunity", "Co-llaboration", "Co-op") in a
 *   left-aligned lockup, then it folds back into the logo. The Coming Soon
 *   sign and the scroll-driven mode below only apply to this one.
 */
const HERO_STORY: "tagline" | "words" = "tagline";

/** The logo lettering's cap height, in ems of the headline. */
const LOGO_CAP_EM = 0.7;

type LogoWordShape = {
  width: number;
  height: number;
  d: string;
  side: string;
  bottom: string;
};

/**
 * One word of the logo's own lettering, sized by its cap height, with the
 * logo's own extrusion shapes beneath it.
 */
function LogoWord({ word }: { word: LogoWordShape }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${word.width} ${word.height}`}
      className={styles.logoWord}
      style={{ height: `${(LOGO_CAP_EM * word.height) / CAP_HEIGHT}em` }}
    >
      <path className={styles.logoSide} d={word.side} />
      <path className={styles.logoBottom} d={word.bottom} />
      <path d={word.d} />
    </svg>
  );
}

/** The headline's largest size (7.9rem), until it can be measured. */
const DEFAULT_HEADLINE_PX = 126.4;

/**
 * The words that cycle after "Co": extruded like the rest of the wordmark,
 * but inverted from it — solid colour letters with white sides. The logo's
 * orange is kept for the fixed letters. Without the sign, the last one
 * gives way at the end and the headline folds back into the logo.
 */
const WORDS = [
  { suffix: "mmunity", color: "var(--color-ecs-teal)" },
  { suffix: "llaboration", color: "var(--color-ecs-marigold)" },
  { suffix: "-op", color: "var(--color-ecs-cobalt)" },
];

/**
 * Fades in under the logo once the words have cycled and the hero has
 * folded back into it, so it ends by saying what the "Co." stands for. Only without the
 * sign, which takes the place of this ending.
 */
const CO_MEANING = (
  <>
    Co. as in community, collaboration and{" "}
    <span className="whitespace-nowrap">co-op</span>.
  </>
);

const WORD_EXTRUDE_FILTER_ID = "ecs-word-extrude";

const SQUIGGLE =
  "M3 11 q10 -9 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0";

/**
 * The hanging "Coming Soon" sign. Off since launch; the markup, styles and
 * sequence timing are kept so the plank can come back, possibly reworded as
 * a banner. Off, the sequence folds back into the logo at the end; on,
 * the sign replaces that ending. Turning it on lengthens the scroll-driven
 * hero from a 211vh track to 352vh, since the sign needs roughly seven
 * extra scroll stops to be lowered and dwell on.
 */
const SHOW_COMING_SOON_SIGN = false;

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

/**
 * The hero's photo choices. `position` is the CSS object-position: the
 * photo covers the hero, so it says which part of it stays in frame.
 */
const HERO_PHOTOS = {
  shopFloor: {
    src: "/assets/photos/shop/shop-floor.jpg",
    alt: "The shop floor: a coffee bar at the back, a long wooden table with marigolds, pine shelves full of local makers' goods, and a rust velvet sofa beneath paintings of the East Bay hills",
    position: "50% 50%",
  },
  // A tall shot: a wide hero only shows a band of it, kept on the art wall
  // and the sofa, with the bare wall above for the logo.
  loungeTall: {
    src: "/assets/photos/shop/lounge-tall.jpg",
    alt: "The lounge: a rust velvet sofa with patchwork cushions and a rainbow acrylic coffee table on a jute rug, beneath a fringed weaving and paintings of the East Bay hills, beside pine shelves of local tees",
    position: "50% 42%",
  },
  cardWall: {
    src: "/assets/photos/shop/card-wall.jpg",
    alt: "A long wall of local goods: a rack of greeting cards, blankets on a leaning ladder, and shelves of mugs, earrings and small paintings",
    position: "50% 50%",
  },
  makersShelves: {
    src: "/assets/photos/shop/makers-shelves.jpg",
    alt: "The Creative Commons shelves, everything made locally: printed tea towels, The Little Hill mugs, earrings on driftwood, embroidery hoops and small sunset paintings",
    position: "50% 50%",
  },
  makersShelvesClose: {
    src: "/assets/photos/shop/makers-shelves-close.jpg",
    alt: "Closer on the Creative Commons shelves: pressed-grass paintings over a tufted rainbow rug, patterned zip pouches, stained glass, marigolds and pumpkins",
    position: "50% 50%",
  },
} as const;

/**
 * The tagline story's photos. The first holds while the tagline is
 * written; then the hook crossfades through them every 6s, in this order.
 */
const TAGLINE_PHOTOS = [
  HERO_PHOTOS.shopFloor,
  HERO_PHOTOS.cardWall,
  HERO_PHOTOS.makersShelves,
  HERO_PHOTOS.makersShelvesClose,
];

const HERO_PHOTO = HERO_PHOTOS.shopFloor;
const PHOTO_SRC = HERO_PHOTO.src;
const PHOTO_CREDIT = photoCredit(PHOTO_SRC);

export function Hero() {
  return HERO_STORY === "tagline" ? <HeroTagline /> : <HeroWords />;
}

/**
 * The tagline story's logo, drawn whole in one SVG in the logo's own units
 * (logo-wordmark.ts, el-cerrito-arc.ts, logo-tagline.ts): nothing moves
 * but "Co.", its dot and the ink of the tagline, so nothing is measured.
 * The box leaves room for the extrusion, the swell and the dot's hops.
 */
const LOGO_VIEWBOX = "-40 -125 1128 417";

function HeroTagline() {
  const reducedMotion = useReducedMotion();
  const { replay, photosRef, coRef, dotRef, inkRef } = useHeroTagline({
    enabled: !reducedMotion,
  });
  const id = useId();
  const inkId = `${id}-ink`;
  const maskId = `${id}-mask`;

  // Only the first photo loads with the page. The others aren't shown
  // until the tagline is written, so they wait for the page to finish
  // loading and go idle, then download while the tagline plays. With
  // reduced motion the photos never change, so they never load.
  const [loadAllPhotos, setLoadAllPhotos] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    // Safari has no requestIdleCallback; a short delay stands in for it.
    const hasIdle = typeof window.requestIdleCallback === "function";
    let idleId = 0;
    const whenIdle = () => {
      const load = () => setLoadAllPhotos(true);
      idleId = hasIdle
        ? window.requestIdleCallback(load, { timeout: 3000 })
        : window.setTimeout(load, 1500);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [reducedMotion]);
  const photos = loadAllPhotos ? TAGLINE_PHOTOS : TAGLINE_PHOTOS.slice(0, 1);

  return (
    <section id="hero-track" className={styles.track}>
      <div className={`${styles.stage} ${styles.taglineStage}`} data-hero-stage>
        {/* The first is the hero's photo; the rest only crossfade in, so
            they're decorative to screen readers. */}
        <div ref={photosRef} className={styles.photo}>
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              className={styles.photoLayer}
              data-active={i === 0 ? "" : undefined}
            >
              <Image
                src={photo.src}
                alt={i === 0 ? photo.alt : ""}
                fill
                loading="eager"
                fetchPriority={i === 0 ? "high" : "low"}
                sizes="100vw"
                style={{ objectPosition: photo.position }}
              />
            </div>
          ))}
        </div>

        <h1 className="sr-only">El Cerrito Supply Co.</h1>
        <p className="sr-only">Community, Collaboration, Co-op</p>

        <svg
          aria-hidden="true"
          viewBox={LOGO_VIEWBOX}
          className={styles.taglineLogo}
        >
          <defs>
            {/* The ink: shown left of the pen, with a soft edge. */}
            <linearGradient
              ref={inkRef}
              id={inkId}
              gradientUnits="userSpaceOnUse"
              x1={0}
              x2={0}
              y1={0}
              y2={0}
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="-40" y="-125" width="1128" height="417">
              <rect x="-40" y="-125" width="1128" height="417" fill={`url(#${inkId})`} />
            </mask>
          </defs>

          <g transform={`translate(${LOGO_LAYOUT.arcX} ${LOGO_LAYOUT.arcY})`} fill="#fff">
            {ARC_LETTERS.map((letter, i) => (
              <path key={i} d={letter.arched} />
            ))}
          </g>

          <LogoShape word={SUPPLY} />

          {/* "Co." swells about its own middle; the dot rides along until
              it leaves, and the hook moves it in the logo's units. */}
          <g ref={coRef} className={styles.taglineCo}>
            <LogoShape word={CO} x={LOGO_LAYOUT.coX} />
            <g ref={dotRef}>
              <LogoShape word={DOT} x={LOGO_LAYOUT.dotX} />
            </g>
          </g>

          <g mask={`url(#${maskId})`} className={styles.taglineInk}>
            <path
              d={TAGLINE.d}
              fill="#fff"
              transform={`translate(${LOGO_LAYOUT.taglineX} ${LOGO_LAYOUT.taglineY})`}
            />
          </g>
        </svg>

        {SHOW_REPLAY && !reducedMotion ? (
          <button type="button" className={styles.replay} onClick={replay}>
            <span aria-hidden="true">↻</span> Replay
          </button>
        ) : null}

        <HeroCredit />
      </div>
    </section>
  );
}

/** One word of the logo, with its extrusion beneath, at `x` in the logo's units. */
function LogoShape({ word, x = 0 }: { word: LogoWordShape; x?: number }) {
  return (
    <g transform={x ? `translate(${x} 0)` : undefined}>
      <path className={styles.logoSide} d={word.side} />
      <path className={styles.logoBottom} d={word.bottom} />
      <path d={word.d} fill="#fff" />
    </g>
  );
}

function HeroPhoto() {
  return (
    <div className={styles.photo}>
      <Image
        src={PHOTO_SRC}
        alt={HERO_PHOTO.alt}
        fill
        style={{ objectPosition: HERO_PHOTO.position }}
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
      />
    </div>
  );
}

function HeroCredit() {
  return PHOTO_CREDIT ? (
    <PhotoCredit helper={PHOTO_CREDIT} variant="corner" className={styles.credit} />
  ) : null;
}

function HeroWords() {
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
    signRef,
    signTextRef,
    captionRef,
  } = useHeroSequence({
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
      {/* White sides, with cream bottoms so the two faces still read apart. */}
      <LogoExtrudeFilter
        id={WORD_EXTRUDE_FILTER_ID}
        depth={headlinePx * LOGO_EXTRUDE_DEPTH_EM}
        side="#fff"
        bottom="var(--color-ecs-surface)"
      />

      <div className={styles.stage} data-hero-stage>
        <HeroPhoto />

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
              <span className="sr-only">El Cerrito Supply Co.</span>
              <span ref={brandLineRef} className={styles.brandLine}>
                <LogoWord word={SUPPLY} />
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

              {/* The extrusion is part of each word's outlines, so the swell
                  scales it with the letters. */}
              <span ref={coWordRef} className={styles.coWord}>
                <span className={styles.coFace}>
                  <LogoWord word={CO} />
                  <span ref={coDotRef} className={styles.coDot}>
                    <LogoWord word={DOT} />
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

            {SHOW_COMING_SOON_SIGN ? null : (
              <p ref={captionRef} className={styles.caption}>
                {CO_MEANING}
              </p>
            )}

            {SHOW_COMING_SOON_SIGN ? (
              <div ref={signRef} aria-hidden="true" className={styles.sign}>
                <div className={`film ${styles.signPlank}`}>
                  <span className={styles.signCable} data-side="left" />
                  <span className={styles.signCable} data-side="right" />
                  <span className={styles.signFitting} data-side="left" />
                  <span className={styles.signFitting} data-side="right" />
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

        <HeroCredit />
      </div>
    </section>
  );
}
