"use client";

import { useEffect, useRef } from "react";

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
type CoGeometry = { dx: number; dy: number; scale: number };

type HeroOptions = {
  /** One CSS colour per word, cycled to tint the photo behind them. */
  washColors: string[];
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
 * The scroll-driven hero: the period morphs into a squiggle, "Co" drops to
 * its own line at 2.4× the word pace, and the suffixes cycle through — all
 * scrubbed directly off scroll position, with no snapping.
 *
 * Driven by a rAF loop gated on an IntersectionObserver rather than scroll
 * events, because on mobile the scrolling element is often an ancestor
 * container and window 'scroll' never fires.
 */
export function useHeroSequence({
  washColors,
  wordCount,
  enabled,
  showSign,
  autoplay,
}: HeroOptions) {
  // The hook owns every element it animates; the component only attaches them.
  const trackRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const brandLineRef = useRef<HTMLHeadingElement>(null);
  const coWordRef = useRef<HTMLSpanElement>(null);
  const coDotRef = useRef<HTMLSpanElement>(null);
  const coWindowRef = useRef<HTMLDivElement>(null);
  const squiggleRef = useRef<SVGSVGElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const signTextRef = useRef<HTMLSpanElement>(null);

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
        sign.style.transform = `translate3d(0,${-(window.innerHeight + signHeight + 40)}px,0) rotate(1.6deg)`;
        sign.style.opacity = "1";
        sign.style.visibility = "visible";
      }
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
      words?.forEach((word, i) => {
        word.style.opacity = i === wordCount - 1 ? "1" : "0";
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

      if (showSign && coWindow && lockup) {
        // The sequence ends with the sign landed and the underline already
        // given way to it, so that is where it rests.
        measureSign(coWindow, lockup);
        const sign = signRef.current;
        if (sign) {
          sign.style.transform = "translate3d(0,0,0) rotate(-3.4deg)";
        }
        if (squiggle) squiggle.style.opacity = "0";
      }
      // Rests in its unscaled layout, so there is nothing to wait for.
      lockup?.setAttribute("data-ready", "");
      return;
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

      // Ranges rather than element rects: the elements are inline-block and
      // their boxes include slack the glyphs don't fill.
      const brandRange = document.createRange();
      brandRange.selectNodeContents(brandLine);
      const coRange = document.createRange();
      coRange.selectNodeContents(coWord);

      const brand = brandRange.getBoundingClientRect();
      const co = coRange.getBoundingClientRect();
      const lockupRect = lockup.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(coWord).fontSize) * 0.26;

      geometry = {
        dx: brand.right + gap - co.left,
        dy: brand.top - co.top,
        // The one-line name spans 75% of the column at rest.
        scale: (lockupRect.width * 0.75) / Math.max(1, brand.width + gap + co.width),
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
    let lastIndex = -1;

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
        if (lockup) {
          lockup.style.transform = `scale(${geometry.scale.toFixed(4)})`;
          // Shown only once it has been measured and scaled; see .lockup.
          lockup.setAttribute("data-ready", "");
        }
      }

      coWindowRef.current
        ?.querySelectorAll<HTMLElement>("[data-suffix]")
        .forEach((el, i) => {
          const d = wordFollow - (i + 1);
          el.style.transform = `translate3d(0,${-d * 110}%,0)`;
          el.style.opacity = Math.max(0, 1 - Math.abs(d) * 1.3).toFixed(3);
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
        const park = window.innerHeight + signHeight + 40;
        sign.style.transform = `translate3d(0,${((1 - eased) * -park).toFixed(1)}px,0) rotate(${(-3.4 + (1 - eased) * 5).toFixed(2)}deg)`;

        // The underline gives way as the plank comes down over it.
        if (squiggle) {
          squiggle.style.opacity = Math.max(
            0,
            1 - signFollow / SIGN_SQUIGGLE_FADE,
          ).toFixed(3);
        }
      }

      const index = Math.min(wordCount, Math.round(wordFollow));
      if (index !== lastIndex) {
        lastIndex = index;
        const wash = washRef.current;
        if (wash) {
          wash.style.background =
            washColors[Math.max(0, index - 1) % washColors.length];
        }
      }

      if (autoplay) return;

      const kicker = kickerRef.current;
      if (kicker) {
        kicker.style.opacity = Math.max(0, 1 - p * 2.6).toFixed(3);
        kicker.style.transform = `translate3d(0,${(-p * 24).toFixed(1)}px,0)`;
      }

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

    const playStart = performance.now();
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
      window.clearTimeout(settle);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
    };
    // washColors is a module constant at the call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, wordCount, showSign, autoplay]);

  return {
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
  };
}
