"use client";

import { useCallback, useEffect, useRef } from "react";

import { DOT_CENTRE, LOGO_LAYOUT, TAGLINE } from "@/components/home/logo-tagline";

/* ── Script, in ms ──────────────────────────────────────────────────────── */

/** Hold on the logo before anything moves. */
const OPEN_MS = 1200;
/** "Co." swells and settles back. */
const SWELL_MS = 1600;
/** The dot hops down to the start of the tagline. */
const HOP_DOWN_MS = 750;
/** The dot writes the tagline out, left to right. */
const WRITE_MS = 3600;
/** A breath after the last letter. */
const PAUSE_MS = 250;
/** The dot hops back up to its place after "CO". */
const HOP_HOME_MS = 850;

const T_SWELL = OPEN_MS;
const T_DOWN = T_SWELL + SWELL_MS;
const T_WRITE = T_DOWN + HOP_DOWN_MS;
/** The last letter is inked: the photos start to turn. */
const T_WRITTEN = T_WRITE + WRITE_MS;
const T_HOME = T_WRITTEN + PAUSE_MS;
const T_END = T_HOME + HOP_HOME_MS;

/* ── The pen, in the logo's units (see logo-tagline.ts) ─────────────────── */

/** The dot shrinks to this while it writes, to suit the thin script. */
const PEN_SCALE = 0.5;
/** Where the pen rides: just above the script's baseline. */
const PEN_Y = LOGO_LAYOUT.taglineY + TAGLINE.height * 0.6;
/** The pen's bob as it writes: amplitude, and one bob per this many units. */
const PEN_BOB = 5;
const PEN_BOB_EVERY = 11;
/** How high each hop rises above a straight line. */
const HOP_DOWN_RISE = 70;
const HOP_HOME_RISE = 90;
/** The soft edge on the ink behind the pen. */
const INK_FEATHER = 14;

/**
 * How long each hero photo shows before crossfading to the next. The first
 * crossfade starts as the dot inks the last letter.
 */
const PHOTO_CYCLE_MS = 6000;

const START_X = LOGO_LAYOUT.taglineX - 4;
const END_X = LOGO_LAYOUT.taglineX + TAGLINE.width + 6;

/** The dot's centre when it sits after "CO", in the logo's units. */
const HOME = {
  x: LOGO_LAYOUT.dotX + DOT_CENTRE.x,
  y: DOT_CENTRE.y,
};

/* ── Easings ────────────────────────────────────────────────────────────── */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** easeInOutCubic */
const io = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** easeOutQuart */
const oq = (t: number) => 1 - Math.pow(1 - t, 4);
/** easeInOutSine: a writing hand's pace, barely eased at the ends. */
const ios = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (t: number, from: number, ms: number) => clamp01((t - from) / ms);

type Frame = {
  /** "Co."'s swell. */
  coScale: number;
  /** The dot's centre and size. */
  penX: number;
  penY: number;
  penScale: number;
  /** How far the tagline is inked, as an x in the logo's units. */
  ink: number;
};

/** The whole sequence, at `t` ms in. */
function frameAt(t: number): Frame {
  // One slow swell, a breath, then a glide back down to size.
  const swell = span(t, T_SWELL, SWELL_MS);
  const coScale =
    1 +
    0.16 * oq(clamp01(swell / 0.3)) -
    0.16 * io(clamp01((swell - 0.42) / 0.5));

  const down = io(span(t, T_DOWN, HOP_DOWN_MS));
  const write = ios(span(t, T_WRITE, WRITE_MS));
  const home = io(span(t, T_HOME, HOP_HOME_MS));

  const writeX = lerp(START_X, END_X, write);
  const bob = Math.sin(((writeX - START_X) / PEN_BOB_EVERY) * Math.PI) * PEN_BOB;

  let penX = HOME.x;
  let penY = HOME.y;
  let penScale = 1;

  if (home > 0) {
    penX = lerp(END_X, HOME.x, home);
    penY = lerp(PEN_Y, HOME.y, home) - HOP_HOME_RISE * 4 * home * (1 - home);
    penScale = lerp(PEN_SCALE, 1, home);
  } else if (write > 0) {
    penX = writeX;
    penY = PEN_Y + bob;
    penScale = PEN_SCALE;
  } else if (down > 0) {
    penX = lerp(HOME.x, START_X, down);
    penY = lerp(HOME.y, PEN_Y, down) - HOP_DOWN_RISE * 4 * down * (1 - down);
    penScale = lerp(1, PEN_SCALE, down);
  }

  // The ink trails the pen's centre, so the pen always covers the edge.
  const ink = write > 0 ? lerp(START_X, END_X + INK_FEATHER, write) : START_X;

  return { coScale, penX, penY, penScale, ink };
}

/** The resting frame: the full logo, its tagline written, the dot home. */
const FINAL: Frame = {
  coScale: 1,
  penX: HOME.x,
  penY: HOME.y,
  penScale: 1,
  ink: END_X + INK_FEATHER,
};

/**
 * The tagline hero: it rests as the logo, "Co." swells, then its dot hops
 * down a line and, as a pen, writes out "Community, Collaboration, Co-op"
 * before hopping back to its place, leaving the full logo with its tagline.
 * Played once on its own; with reduced motion it rests on the last frame.
 *
 * The hero's photos hold on the first while the tagline is written, then
 * crossfade to the next the moment the last letter is inked (while the dot
 * hops home), and every PHOTO_CYCLE_MS after.
 * `photosRef` holds one layer per photo, in order; the stylesheet does the
 * fade.
 *
 * Everything is drawn in one SVG in the logo's own units, so nothing has to
 * be measured: the hook only sets transforms and the ink's edge.
 */
export function useHeroTagline({ enabled }: { enabled: boolean }) {
  const photosRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const inkRef = useRef<SVGLinearGradientElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const showPhoto = (index: number) => {
      const layers = photosRef.current?.children;
      if (!layers?.length) return;
      const active = index % layers.length;
      Array.from(layers).forEach((layer, i) => {
        if (i === active) layer.setAttribute("data-active", "");
        else layer.removeAttribute("data-active");
      });
    };

    const paint = ({ coScale, penX, penY, penScale, ink }: Frame) => {
      const co = coRef.current;
      if (co) co.style.transform = `scale(${coScale.toFixed(4)})`;

      // The dot is drawn in its own box at home; move its centre to the pen
      // and scale it about that centre.
      const dot = dotRef.current;
      if (dot) {
        dot.setAttribute(
          "transform",
          `translate(${(penX - HOME.x).toFixed(2)} ${(penY - HOME.y).toFixed(2)}) ` +
            `translate(${HOME.x} ${HOME.y}) scale(${penScale.toFixed(4)}) ` +
            `translate(${-HOME.x} ${-HOME.y})`,
        );
      }

      const gradient = inkRef.current;
      if (gradient) {
        gradient.setAttribute("x1", (ink - INK_FEATHER).toFixed(2));
        gradient.setAttribute("x2", ink.toFixed(2));
      }
    };

    const showOutro = (shown: boolean) => {
      const outro = outroRef.current;
      if (!outro) return;
      if (shown) outro.removeAttribute("data-pending");
      else outro.setAttribute("data-pending", "");
    };

    if (!enabled) {
      // Reduced motion: the finished logo over the first photo, still.
      paint(FINAL);
      showOutro(true);
      showPhoto(0);
      replayRef.current = null;
      return;
    }

    let photo = 0;
    showPhoto(photo);
    // Started once, when the tagline is first written: the next photo comes
    // in straight away, then one every PHOTO_CYCLE_MS. A replay leaves it
    // running.
    let cycleId = 0;
    const startCycling = () => {
      if (cycleId) return;
      showPhoto(++photo);
      cycleId = window.setInterval(() => showPhoto(++photo), PHOTO_CYCLE_MS);
    };

    let start = performance.now();
    let rafId = 0;
    const loop = () => {
      const t = performance.now() - start;
      if (t >= T_WRITTEN) startCycling();
      if (t >= T_END) {
        // The dot is home: stop drawing frames.
        paint(FINAL);
        showOutro(true);
        return;
      }
      paint(frameAt(t));
      rafId = requestAnimationFrame(loop);
    };

    paint(frameAt(0));
    rafId = requestAnimationFrame(loop);

    replayRef.current = () => {
      cancelAnimationFrame(rafId);
      showOutro(false);
      start = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(cycleId);
      replayRef.current = null;
    };
  }, [enabled]);

  const replay = useCallback(() => replayRef.current?.(), []);

  return { replay, photosRef, coRef, dotRef, inkRef, outroRef };
}
