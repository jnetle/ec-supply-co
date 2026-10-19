"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  ARC_HEIGHT,
  ARC_LETTERS,
  ARC_WIDTH,
  STRAIGHT_BASELINE,
} from "@/components/home/el-cerrito-arc";
import { CAP_HEIGHT, WORD_GAP } from "@/components/home/logo-wordmark";

/* ── Scroll budget ──────────────────────────────────────────────────────── */

/** Scroll stops spent on "Co" dropping to line two (1 = one word's worth). */
const CO_SPAN = 2.4;
/** Faintest hold on the bare wordmark before the first suffix slides in. */
const LEAD = 0.03;
/** Travel beyond one screen, in vh, before the word-pace correction. */
const BASE_TRAVEL_VH = 60;
/** With the sign on, the track is stretched instead of pace-corrected. */
const SIGN_TRACK_MULTIPLIER = 4.2;
/** Scroll stops the sign gets on top of the words, to fly in and dwell. */
const SIGN_SPAN = 12;
/** Stops after the last word lands before the sign starts down. */
const SIGN_DWELL = 2.2;
/** Stops the descent itself is spread over. */
const SIGN_DESCENT = 7.2;
/** The squiggle is gone by the time the sign is this far down. */
const SIGN_SQUIGGLE_FADE = 0.45;

/* ── Autoplay script ────────────────────────────────────────────────────── */

/** Hold on the bare wordmark before anything moves. */
const PLAY_OPEN_MS = 1200;
/** "Co" dropping to line two. The move itself fills about the middle half
    of this, with its swell before and settle after. */
const PLAY_CO_MS = 3000;
/** Each word sliding in. */
const PLAY_SWAP_MS = 600;
/** Each word held still, long enough to read. */
const PLAY_HOLD_MS = 1800;
/** The sign coming down, once the last word has been read. */
const PLAY_SIGN_MS = 1800;

/* ── Easings, as named in the design ────────────────────────────────────── */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** easeInOutCubic */
const io = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** easeOutQuart */
const oq = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * The hero track's height, in vh.
 *
 * Exported because the component has to render this on the server: if the
 * stylesheet says one height and the hook sets another after hydration, the
 * document grows under any in-flight anchor scroll and cross-page links to
 * sections below the hero land short by the difference.
 *
 * Without the sign, "Co" spends CO_SPAN stops dropping, so the track is
 * stretched to keep the words at their intended pace. With it, the track is
 * stretched outright instead: the sign's extra stops have to be added to the
 * track, not taken out of the word cycle.
 */
export function heroTrackVh(wordCount: number, showSign: boolean) {
  const base = Math.max(30, BASE_TRAVEL_VH);
  const travel = Math.round(
    showSign
      ? base * SIGN_TRACK_MULTIPLIER
      : base * ((wordCount + CO_SPAN + 0.45) / (wordCount + 1.45)),
  );
  return 100 + travel;
}

/** How far the "Co" has to travel to sit at the end of line one. */
type CoGeometry = {
  dx: number;
  dy: number;
  scale: number;
  /**
   * How far the lockup sits from its laid-out spot at rest, in screen px,
   * so the rest-state logo is centered on the photo. It travels to the end
   * offset as "Co" drops.
   */
  restX: number;
  restY: number;
  /** Lifts the settled, left-aligned lockup to halfway up the photo. */
  endY: number;
};

/**
 * Where "El Cerrito" sits: its box's top-left, in the lockup's own px.
 * Arched over "Supply Co." at rest, as in the logo, and set straight above
 * "Supply", flush left, once "Co" has dropped.
 */
type ArcGeometry = {
  restX: number;
  restY: number;
  endX: number;
  endY: number;
};

/*
 * The logo's own proportions, in its PDF points: the gap from the arch's
 * lowest point down to the caps of "SUPPLY", and how far off the
 * "SUPPLY CO." centre the arch is centred (it sits a touch left).
 */
const LOGO_ARC_GAP = 41.98;
const LOGO_ARC_NUDGE = -3.78;
/** The straight label's gap above "Supply", as a share of its caps. */
const LABEL_GAP = 0.2;

/**
 * The lettering keeps the size it had when the hero read "El Cerrito
 * Supply Co." on one line, spanning this share of the column.
 */
const NAME_WIDTH = 0.75;

/**
 * How far down the photo the wordmark's middle sits, as a share of its
 * height. Well above centre, at eye level: the hero photo's horizon is
 * high, so a centred wordmark reads as sitting low, and here the whole
 * lockup, cycling words included, clears the sofa back.
 */
const EYE_LINE = 0.28;

type HeroOptions = {
  wordCount: number;
  enabled: boolean;
  /** Whether the hanging sign is lowered after the words finish. */
  showSign: boolean;
  /**
   * Play the sequence once on its own, paced to be read, instead of
   * scrubbing it off a pinned scroll track. The hero is then unpinned and
   * its height comes from the stylesheet.
   */
  autoplay: boolean;
};

/**
 * The scroll-driven hero: it rests as the logo, "El Cerrito" arched over
 * "Supply Co.", centered on the photo. The period morphs into a squiggle,
 * "Co" drops to its own line at 2.4× the word pace while the whole lockup
 * travels to the left edge, halfway up, and the arched letters settle onto
 * a straight line above "Supply", and the suffixes cycle through — all scrubbed directly
 * off scroll position, with no snapping.
 *
 * Driven by a rAF loop gated on an IntersectionObserver rather than scroll
 * events, because on mobile the scrolling element is often an ancestor
 * container and window 'scroll' never fires.
 */
export function useHeroSequence({
  wordCount,
  enabled,
  showSign,
  autoplay,
}: HeroOptions) {
  // The hook owns every element it animates; the component only attaches them.
  const trackRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const brandLineRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGSVGElement>(null);
  const coWordRef = useRef<HTMLSpanElement>(null);
  const coDotRef = useRef<HTMLSpanElement>(null);
  const coWindowRef = useRef<HTMLDivElement>(null);
  const squiggleRef = useRef<SVGSVGElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const signTextRef = useRef<HTMLSpanElement>(null);
  // Set by the effect while autoplay is running; null otherwise.
  const replayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // With the sign on, the words share the track with its descent and dwell.
    const budget = showSign ? wordCount + SIGN_SPAN : wordCount + CO_SPAN + 0.45;

    /* ── Track height ─────────────────────────────────────────────────── */

    // Pins the track to the real viewport height. The stylesheet already has
    // the same number in vh, so this is a no-op on desktop; it matters on
    // mobile, where 100vh and window.innerHeight disagree while the browser
    // toolbars are showing.
    const setTrackHeight = () => {
      if (autoplay) {
        track.style.height = "";
        return;
      }
      const total = heroTrackVh(wordCount, showSign);
      const vh = window.innerHeight;
      // Measure against the viewport, not the stage: a stage taller than the
      // screen would inflate the range and stretch the cycle over many screens.
      track.style.height =
        vh > 200 ? `${Math.round((vh * total) / 100)}px` : `${total}vh`;
    };

    /* ── Geometry ─────────────────────────────────────────────────────── */

    let geometry: CoGeometry | null = null;
    let arcGeometry: ArcGeometry | null = null;
    let suffixWidths: number[] = [];
    /** The plank's measured height, which sets how far above it parks. */
    let signHeight = 0;
    let signParked = false;

    /**
     * Sizes and places the plank against the live wordmark: the lettering
     * matches the hero's font size, the plank hugs that lettering, and the
     * whole thing sits over the column the rotating words paint in.
     *
     * Must run with the lockup's transforms cleared, like the rest of the
     * geometry pass.
     */
    /**
     * A full viewport plus the plank, in the lockup's own px: the lockup is
     * drawn scaled down, so a screen's height inside it is taller.
     */
    const parkDistance = () =>
      (window.innerHeight + signHeight + 40) / Math.max(0.05, geometry?.scale ?? 1);

    const measureSign = (coWindow: HTMLElement, lockup: HTMLElement) => {
      const sign = signRef.current;
      if (!sign) return;

      const windowRect = coWindow.getBoundingClientRect();
      const widestWord = Math.max(
        0,
        ...Array.from(
          coWindow.querySelectorAll<HTMLElement>("[data-suffix]"),
          (el) => el.getBoundingClientRect().width,
        ),
      );

      // Fallbacks for the first pass, before the font has settled.
      let plankWidth = Math.round((widestWord || windowRect.height * 3) * 1.02);
      let plankHeight = Math.max(30, windowRect.height * 0.72);

      const text = signTextRef.current;
      if (text) {
        const brandSize =
          parseFloat(getComputedStyle(brandLineRef.current ?? coWindow).fontSize) ||
          plankHeight;
        text.style.fontSize = `${Math.round(brandSize)}px`;

        const textRect = text.getBoundingClientRect();
        if (textRect.width > 4) {
          // Hug the lettering with only a little paint either side.
          const padX = Math.round(brandSize * 0.16);
          plankWidth = Math.round(textRect.width) + padX * 2;
          plankHeight = Math.round(textRect.height * 0.92);
        }
      }

      signHeight = Math.round(plankHeight);
      sign.style.left = `${coWindow.offsetLeft}px`;
      sign.style.top = `${Math.round(
        windowRect.top -
          lockup.getBoundingClientRect().top +
          (windowRect.height - plankHeight) * 0.46,
      )}px`;
      sign.style.width = `${plankWidth}px`;
      sign.style.height = `${signHeight}px`;

      // Park it a full viewport above its resting spot, in px — a percentage
      // of its own box would collapse with the box. Only reveal it once
      // measured, so it can't flash at the placeholder size.
      if (!signParked) {
        signParked = true;
        sign.style.transform = `translate3d(0,${-parkDistance()}px,0) rotate(1.6deg)`;
        sign.style.opacity = "1";
        sign.style.visibility = "visible";
      }
    };

    /**
     * The rest-state "Supply Co.": "Supply" and "Co" as ranges, since the
     * elements are inline-block and their boxes include slack the letters
     * don't fill, with the logo's space between them. Transforms must be
     * cleared.
     */
    const measurePair = (brandLine: HTMLElement, coWord: HTMLElement) => {
      const brandRange = document.createRange();
      brandRange.selectNodeContents(brandLine);
      const coRange = document.createRange();
      coRange.selectNodeContents(coWord);
      const brand = brandRange.getBoundingClientRect();
      const co = coRange.getBoundingClientRect();
      const gap = (measureCaps(brandLine).cap * WORD_GAP) / CAP_HEIGHT;
      return { brand, co, gap, width: brand.width + gap + co.width };
    };

    /**
     * Where "Supply"'s caps sit, in px: the drawn word's box runs from the
     * top of its caps to the baseline.
     */
    const measureCaps = (brandLine: HTMLElement) => {
      const rect = (brandLine.querySelector("svg") ?? brandLine).getBoundingClientRect();
      return { top: rect.top, cap: rect.height };
    };

    /**
     * Closes the line gap so "Co" sits as far below the caps of "Supply" as
     * the straight label sits above them (LABEL_GAP). Measured with the
     * transforms cleared; must run before anything is placed against "Co".
     */
    const matchLineGap = (lockup: HTMLElement, brandLine: HTMLElement, coWord: HTMLElement) => {
      const line = coWord.parentElement;
      if (!line) return;
      const prevLockup = lockup.style.transform;
      const prevCo = coWord.style.transform;
      lockup.style.transform = "none";
      coWord.style.transform = "none";
      line.style.marginTop = "";

      const caps = measureCaps(brandLine);
      const coTop = (coWord.querySelector("svg") ?? coWord).getBoundingClientRect().top;
      const gap = coTop - (caps.top + caps.cap);
      const base = parseFloat(getComputedStyle(line).marginTop) || 0;
      line.style.marginTop = `${(base + caps.cap * LABEL_GAP - gap).toFixed(1)}px`;

      lockup.style.transform = prevLockup;
      coWord.style.transform = prevCo;
    };

    /**
     * Sized as when the whole name sat on one line: "El Cerrito Supply" is
     * set off-screen in the same lettering, and the scale makes it plus
     * "Co." span NAME_WIDTH of the column.
     */
    const fitScale = (lockup: HTMLElement, brandLine: HTMLElement, coWord: HTMLElement) => {
      const { co, gap } = measurePair(brandLine, coWord);
      const probe = brandLine.cloneNode() as HTMLElement;
      probe.textContent = "El Cerrito Supply";
      probe.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;filter:none";
      lockup.append(probe);
      const nameWidth = probe.getBoundingClientRect().width + gap + co.width;
      probe.remove();
      return (lockup.getBoundingClientRect().width * NAME_WIDTH) / Math.max(1, nameWidth);
    };


    /**
     * Places "El Cerrito" against the measured pair, in the logo's own
     * proportions. Must run with the lockup's transforms cleared. Returns
     * the top of the rest-state arch, in the lockup's own px.
     */
    const measureArc = (
      lockup: HTMLElement,
      brandLine: HTMLElement,
      coWord: HTMLElement,
    ) => {
      const arc = arcRef.current;
      if (!arc) return null;

      const { brand, width: pairWidth } = measurePair(brandLine, coWord);
      const lockupRect = lockup.getBoundingClientRect();
      const caps = measureCaps(brandLine);
      const unit = caps.cap / CAP_HEIGHT;
      const capTop = caps.top - lockupRect.top;
      const brandLeft = brand.left - lockupRect.left;

      arc.style.width = `${(ARC_WIDTH * unit).toFixed(1)}px`;
      arcGeometry = {
        restX: brandLeft + pairWidth / 2 + (LOGO_ARC_NUDGE - ARC_WIDTH / 2) * unit,
        restY: capTop - (LOGO_ARC_GAP + ARC_HEIGHT) * unit,
        endX: brandLeft,
        endY: capTop - caps.cap * LABEL_GAP - STRAIGHT_BASELINE * unit,
      };
      return arcGeometry.restY;
    };

    /**
     * Moves "El Cerrito" from arched and centered (0) to straight and flush
     * left (1). Each letter glides down onto the line and, partway there,
     * fades from its arched outline to its straight one; nothing is bent.
     */
    const placeArc = (along: number) => {
      const arc = arcRef.current;
      if (!arc || !arcGeometry) return;
      const { restX, restY, endX, endY } = arcGeometry;
      const x = restX + (endX - restX) * along;
      const y = restY + (endY - restY) * along;
      arc.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;

      const swap = clamp01((along - 0.3) / 0.4);
      const fade = swap * swap * (3 - 2 * swap);
      arc.querySelectorAll<SVGGElement>("g").forEach((letter, i) => {
        const dy = ARC_LETTERS[i]?.dy ?? 0;
        const [arched, straight] = letter.children;
        arched?.setAttribute("transform", `translate(0 ${(dy * along).toFixed(2)})`);
        arched?.setAttribute("opacity", (1 - fade).toFixed(3));
        straight?.setAttribute("transform", `translate(0 ${(-dy * (1 - along)).toFixed(2)})`);
        straight?.setAttribute("opacity", fade.toFixed(3));
      });
      // Shown once placed, so it can't flash in its natural spot.
      arc.style.visibility = "visible";
    };

    /**
     * The screen offset that puts a point of the lockup (in its own px,
     * transforms cleared) on the photo's eye line, once the lockup is
     * scaled about its bottom left. The photo is the stage less the strip
     * tucked under the awning.
     */
    const toPhotoMiddle = (lockup: HTMLElement, scale: number, x: number, y: number) => {
      const lockupRect = lockup.getBoundingClientRect();
      const stage = lockup.closest<HTMLElement>("[data-hero-stage]");
      if (!stage) return { x: 0, y: 0 };
      const stageRect = stage.getBoundingClientRect();
      const tuck = -Math.min(0, parseFloat(getComputedStyle(track).marginTop) || 0);
      return {
        x: stageRect.left + stageRect.width / 2 - (lockupRect.left + x * scale),
        y:
          stageRect.top + tuck + (stageRect.bottom - stageRect.top - tuck) * EYE_LINE -
          (lockupRect.bottom - (lockupRect.height - y) * scale),
      };
    };

    /**
     * The settled lockup's middle, in its own px: from the top of the
     * straight label above "Supply" to the bottom of the word line and its
     * squiggle.
     */
    const settledMiddle = (lockup: HTMLElement, brandLine: HTMLElement) => {
      const lockupRect = lockup.getBoundingClientRect();
      const brandRange = document.createRange();
      brandRange.selectNodeContents(brandLine);
      const fontPx = parseFloat(getComputedStyle(brandLine).fontSize) || 0;
      const labelTop =
        arcGeometry?.endY ?? brandRange.getBoundingClientRect().top - lockupRect.top - fontPx * 0.2;
      return (labelTop + lockupRect.height) / 2;
    };

    if (!enabled) {
      // Reduced motion: collapse the scroll track to one screen so there is
      // no dead scrolling, and rest the sequence at the end state it would
      // otherwise scrub to — last word in, period already melted into the
      // squiggle — so the hero still reads as designed.
      track.style.height = autoplay ? "" : "100vh";
      coDotRef.current?.style.setProperty("opacity", "0");

      const words = coWindowRef.current?.querySelectorAll<HTMLElement>(
        "[data-suffix]",
      );
      // The landed sign covers the last word, which has faded under it.
      words?.forEach((word, i) => {
        word.style.opacity = i === wordCount - 1 && !showSign ? "1" : "0";
      });

      const squiggle = squiggleRef.current;
      const coWindow = coWindowRef.current;
      const lockup = lockupRef.current;

      if (squiggle && coWindow && words?.length) {
        const widest = Math.max(
          ...Array.from(words, (w) => w.getBoundingClientRect().width),
        );
        squiggle.style.left = `${coWindow.offsetLeft}px`;
        squiggle.style.width = `${Math.round(widest)}px`;
        squiggle.style.clipPath = "none";
      }

      if (lockup && brandLineRef.current && coWordRef.current) {
        matchLineGap(lockup, brandLineRef.current, coWordRef.current);
      }

      if (showSign && coWindow && lockup) {
        // The sequence ends with the sign landed and the underline already
        // given way to it, so that is where it rests.
        measureSign(coWindow, lockup);
        const sign = signRef.current;
        if (sign) {
          sign.style.transform = "translate3d(0,0,0) rotate(-1.2deg)";
        }
        if (squiggle) squiggle.style.opacity = "0";
      }
      // Rests at the end state: the label straight, sized like the
      // animated version.
      const settle = () => {
        const brandLine = brandLineRef.current;
        const coWord = coWordRef.current;
        if (!lockup || !brandLine || !coWord) return;
        lockup.style.transform = "none";
        matchLineGap(lockup, brandLine, coWord);
        if (showSign && coWindow) measureSign(coWindow, lockup);
        measureArc(lockup, brandLine, coWord);
        placeArc(1);
        const scale = fitScale(lockup, brandLine, coWord);
        const lift = toPhotoMiddle(lockup, scale, 0, settledMiddle(lockup, brandLine)).y;
        lockup.style.transform = `translate3d(0,${lift.toFixed(1)}px,0) scale(${scale.toFixed(4)})`;
        lockup.style.setProperty("--lockup-scale", scale.toFixed(4));
        lockup.setAttribute("data-ready", "");
      };

      settle();
      let stillLive = true;
      void document.fonts?.ready.then(() => stillLive && settle());
      window.addEventListener("resize", settle);
      return () => {
        stillLive = false;
        window.removeEventListener("resize", settle);
      };
    }

    // Measured with the live transforms cleared, then restored — otherwise
    // every frame's own animation would feed back into the measurement.
    const measureGeometry = () => {
      const lockup = lockupRef.current;
      const coWord = coWordRef.current;
      const brandLine = brandLineRef.current;
      const coWindow = coWindowRef.current;
      if (!lockup || !coWord || !brandLine || !coWindow) return;

      const prevLockup = lockup.style.transform;
      const prevCo = coWord.style.transform;
      lockup.style.transform = "none";
      coWord.style.transform = "none";
      matchLineGap(lockup, brandLine, coWord);

      const { brand, co, gap, width: pairWidth } = measurePair(brandLine, coWord);
      const scale = fitScale(lockup, brandLine, coWord);

      const lockupRect = lockup.getBoundingClientRect();
      const arcTop =
        measureArc(lockup, brandLine, coWord) ?? brand.top - lockupRect.top;

      // At rest the logo's centre goes to the middle of the photo; settled,
      // the left-aligned lockup is lifted to halfway up it.
      const rest = toPhotoMiddle(
        lockup,
        scale,
        brand.left - lockupRect.left + pairWidth / 2,
        (arcTop + brand.bottom - lockupRect.top) / 2,
      );
      const end = toPhotoMiddle(lockup, scale, 0, settledMiddle(lockup, brandLine));

      geometry = {
        dx: brand.right + gap - co.left,
        dy: brand.top - co.top,
        scale,
        restX: rest.x,
        restY: rest.y,
        endY: end.y,
      };

      const squiggle = squiggleRef.current;
      if (squiggle) {
        squiggle.style.left = `${coWindow.offsetLeft}px`;
        suffixWidths = Array.from(
          coWindow.querySelectorAll<HTMLElement>("[data-suffix]"),
        ).map((el) => el.getBoundingClientRect().width);
      }

      if (showSign) measureSign(coWindow, lockup);

      lockup.style.transform = prevLockup;
      coWord.style.transform = prevCo;
    };

    /* ── Progress ─────────────────────────────────────────────────────── */

    const measure = () => {
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      return clamp01(-rect.top / total);
    };

    // Gesture-derived progress: an independent signal for the case where the
    // measured rect never moves (some mobile Safari setups). Tied to the
    // visitor's own swipe, so the hero never self-animates.
    let rectMoved = false;
    let gestureProgress = 0;
    const startProgress = measure();
    const travelPx = () => Math.max(1, track.offsetHeight - window.innerHeight);

    // Smoothed followers, so wheel steps read as motion rather than jumps.
    let coFollow = 0;
    let wordFollow = 0;
    let signFollow = 0;
    let lastFrame = 0;

    const render = (p: number) => {
      const posRaw = Math.max(0, (p - LEAD) / (1 - LEAD)) * budget;

      const now = performance.now();
      const dt = Math.min(0.05, (now - (lastFrame || now)) / 1000);
      lastFrame = now;
      // Exponential follow: catches up fast, never runs ahead of the hand.
      const follow = 1 - Math.exp(-dt * 16);

      const coTarget = clamp01(posRaw / CO_SPAN);
      coFollow += (coTarget - coFollow) * follow;
      if (Math.abs(coTarget - coFollow) < 0.001) coFollow = coTarget;

      // The period → squiggle hand-off scrubs across the first half-stop
      // after "Co" lands. The raw value drives the hand-off; the eased one
      // gates the sign, which must not start until the words are truly done.
      const gate = clamp01((posRaw - CO_SPAN + 0.05) / 0.5);
      const gateEased = io(gate);

      const seg = (a: number, b: number) => clamp01((coFollow - a) / (b - a));
      const move = io(seg(0.38, 0.9));
      // One slow swell, a breath, then a glide back down to size.
      const scale = 1 + 0.16 * oq(seg(0, 0.3)) - 0.16 * io(seg(0.42, 0.92));

      const wordTarget = Math.min(wordCount, Math.max(0, posRaw - CO_SPAN));
      wordFollow += (wordTarget - wordFollow) * follow;
      if (Math.abs(wordTarget - wordFollow) < 0.002) wordFollow = wordTarget;

      const coWord = coWordRef.current;
      const lockup = lockupRef.current;
      if (geometry && coWord) {
        const x = (geometry.dx * (1 - move)).toFixed(1);
        const y = (geometry.dy * (1 - move)).toFixed(1);
        coWord.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale.toFixed(4)})`;
        placeArc(move);
        if (lockup) {
          // Starts centered on the photo, and travels to the left edge,
          // halfway up, as "Co" drops.
          const homeX = (geometry.restX * (1 - move)).toFixed(1);
          const homeY = (geometry.endY + (geometry.restY - geometry.endY) * (1 - move)).toFixed(1);
          lockup.style.transform = `translate3d(${homeX}px,${homeY}px,0) scale(${geometry.scale.toFixed(4)})`;
          // The sign's poles reach a screen up in the lockup's own px.
          lockup.style.setProperty("--lockup-scale", geometry.scale.toFixed(4));
          // Shown only once it has been measured and scaled; see .lockup.
          lockup.setAttribute("data-ready", "");
        }
      }

      // The last word gives way as the sign comes down over it, so only
      // "Co" + "ming Soon" is left; signFollow is last frame's, which is
      // close enough for a fade.
      const signCover = showSign ? clamp01(signFollow / 0.6) : 0;
      coWindowRef.current
        ?.querySelectorAll<HTMLElement>("[data-suffix]")
        .forEach((el, i) => {
          const d = wordFollow - (i + 1);
          el.style.transform = `translate3d(0,${-d * 110}%,0)`;
          el.style.opacity = (
            Math.max(0, 1 - Math.abs(d) * 1.3) * (1 - signCover)
          ).toFixed(3);
        });

      const dot = coDotRef.current;
      if (dot) dot.style.opacity = Math.max(0, 1 - gate / 0.3).toFixed(3);

      const squiggle = squiggleRef.current;
      if (squiggle && suffixWidths.length) {
        squiggle.style.width = `${Math.round(Math.max(...suffixWidths))}px`;
        const draw = io(clamp01((gate - 0.1) / 0.9));
        squiggle.style.clipPath = `inset(-20% ${((1 - draw) * 100).toFixed(1)}% -20% 0)`;
      }

      // The sign is lowered on its poles once every word has actually cycled
      // through. The words are time-gated behind "Co", so raw scroll alone
      // can run ahead of them — hence checking the eased gate and the word
      // position rather than posRaw.
      const sign = signRef.current;
      if (sign && signParked) {
        const wordsDone = gateEased >= 0.999 && wordFollow >= wordCount - 0.02;
        const target = wordsDone
          ? clamp01(
              (posRaw - (wordCount + CO_SPAN + SIGN_DWELL)) / SIGN_DESCENT,
            )
          : 0;

        // Stepped rather than followed, so a fast fling can't snap it in.
        // It may retreat twice as fast as it descends.
        const stepMax = dt / 1.1;
        signFollow += Math.max(
          -stepMax * 2,
          Math.min(stepMax, target - signFollow),
        );

        const eased = 1 - Math.pow(1 - signFollow, 2);
        const park = parkDistance();
        sign.style.transform = `translate3d(0,${((1 - eased) * -park).toFixed(1)}px,0) rotate(${(-1.2 + (1 - eased) * 2.8).toFixed(2)}deg)`;

        // The underline gives way as the plank comes down over it.
        if (squiggle) {
          squiggle.style.opacity = Math.max(
            0,
            1 - signFollow / SIGN_SQUIGGLE_FADE,
          ).toFixed(3);
        }
      }

      if (autoplay) return;

      const cue = cueRef.current;
      if (cue) cue.style.opacity = (0.7 * Math.max(0, 1 - p * 3.4)).toFixed(3);
    };

    /* ── Autoplay ──────────────────────────────────────────────────────────── */

    // The script as [ms, position] stops, in the same units as the scroll
    // budget. Not one steady pace: a steady clock would either rush the
    // words or crawl through the sign's long descent, so each word gets a
    // still hold and the empty stretches are skipped quickly.
    // Each stop can carry its own easing into it.
    type Ease = (t: number) => number;
    const script: [number, number, Ease][] = [[0, 0, io]];
    const step = (ms: number, pos: number, ease: Ease = io) =>
      script.push([script[script.length - 1][0] + ms, pos, ease]);
    step(PLAY_OPEN_MS, 0);
    // Linear: "Co" already eases its own swell, move and settle, and easing
    // the clock as well would squeeze the move into a dart.
    step(PLAY_CO_MS, CO_SPAN, (t) => t);
    for (let word = 1; word <= wordCount; word++) {
      step(PLAY_SWAP_MS, CO_SPAN + word);
      step(PLAY_HOLD_MS, CO_SPAN + word);
    }
    if (showSign) {
      // Straight to the top of the descent, then down.
      step(200, wordCount + CO_SPAN + SIGN_DWELL);
      step(PLAY_SIGN_MS, wordCount + CO_SPAN + SIGN_DWELL + SIGN_DESCENT);
    }
    step(200, budget);

    let playStart = performance.now();
    const scripted = () => {
      const t = performance.now() - playStart;
      let pos = budget;
      for (let i = 1; i < script.length; i++) {
        const [t1, p1, ease] = script[i];
        if (t < t1) {
          const [t0, p0] = script[i - 1];
          pos = p0 + (p1 - p0) * ease((t - t0) / (t1 - t0));
          break;
        }
      }
      // Back from budget position to the progress render() expects.
      return LEAD + (pos / budget) * (1 - LEAD);
    };

    // Restart the script from the top. The followers snap back rather than
    // ease, so the sequence starts clean instead of rewinding on screen.
    replayRef.current = autoplay
      ? () => {
          playStart = performance.now();
          coFollow = 0;
          wordFollow = 0;
          signFollow = 0;
        }
      : null;

    const draw = () => {
      if (autoplay) {
        render(scripted());
        return;
      }
      const m = measure();
      if (Math.abs(m - startProgress) > 0.002) rectMoved = true;
      render(rectMoved ? m : gestureProgress);
    };

    /* ── Wiring ───────────────────────────────────────────────────────── */

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      gestureProgress = clamp01(gestureProgress + (touchY - y) / travelPx());
      touchY = y;
    };
    const onWheel = (e: WheelEvent) => {
      gestureProgress = clamp01(gestureProgress + e.deltaY / travelPx());
    };

    let inView = true;
    let rafId = 0;
    const loop = () => {
      if (inView) draw();
      rafId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(track);

    let lastWidth = window.innerWidth;
    const onResize = () => {
      // Width only: reacting to height would re-run mid-scroll every time the
      // iOS toolbar collapses.
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setTrackHeight();
      }
      measureGeometry();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);

    setTrackHeight();
    measureGeometry();
    rafId = requestAnimationFrame(loop);

    // iOS reports a provisional innerHeight while its toolbars resolve, and
    // the wordmark's width is not final until the font has swapped in.
    // `fonts.ready` cannot be cancelled, so it checks that this effect is
    // still the live one before writing anything back.
    let cancelled = false;
    const remeasure = () => {
      if (cancelled) return;
      setTrackHeight();
      measureGeometry();
    };

    const settle = window.setTimeout(remeasure, 400);
    void document.fonts?.ready.then(remeasure);

    return () => {
      cancelled = true;
      replayRef.current = null;
      window.clearTimeout(settle);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, wordCount, showSign, autoplay]);

  const replay = useCallback(() => replayRef.current?.(), []);

  return {
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
  };
}
