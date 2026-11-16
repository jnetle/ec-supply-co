import { type CSSProperties, useSyncExternalStore } from "react";

import styles from "./hero-tinsel.module.css";

/**
 * Holiday tinsel draped through the hero logo: a silver foil garland, hung
 * the way a real one would be.
 *
 * Nothing floats. The garland only touches the letters where it crosses
 * over a top edge, at the CROSSINGS below (measured from the outlines in
 * logo-wordmark.ts). Each crossing takes it from in front of the letters
 * to behind them or back, so it weaves; between crossings it hangs as a
 * catenary, and its loose ends hang straight down.
 *
 * Two garlands, because "Co." swells on its own during the hero's intro:
 * one over SUPPLY, and one over CO that is drawn inside the Co group so it
 * swells with the letters it rests on. Each draws in two passes, `back`
 * before its letters and `front` after them.
 *
 * Everything is in the logo's own units (y runs down from the caps' top).
 */

type Point = { x: number; y: number };
type Plane = "front" | "back";

/** How far above an edge the garland's core sits: the fluff compresses
 *  where it rests on the letter, so it's less than the garland's radius. */
const REST = 5;

/** Where the garland crosses a letter's top edge (edge y, from the outline). */
const CROSSINGS = {
  S: { x: 30, y: 2.25 },
  P: { x: 290, y: 1.75 },
  L: { x: 523, y: 1.75 },
  Y: { x: 694, y: 1.75 },
  C: { x: 852, y: 0.75 },
  O: { x: 967, y: 0.75 },
};

const on = (c: Point): Point => ({ x: c.x, y: c.y - REST });

/**
 * A garland as a run of pieces. A span hangs between two crossings, `low`
 * being how far down its lowest point sits; a tail hangs straight down
 * from a crossing to its end.
 */
type Piece =
  | { kind: "tail"; from: Point; to: number; plane: Plane; reverse?: boolean }
  | { kind: "span"; from: Point; to: Point; low: number; plane: Plane };

const GARLANDS: Record<"supply" | "co", Piece[]> = {
  // Hangs in front of the S, over it, behind the U, over the first P, in
  // front of the second, over the L, behind into the Y's notch, over the
  // Y's arm and down in front of it into the gap before "CO".
  supply: [
    { kind: "tail", from: on(CROSSINGS.S), to: 182, plane: "front", reverse: true },
    { kind: "span", from: on(CROSSINGS.S), to: on(CROSSINGS.P), low: 130, plane: "back" },
    { kind: "span", from: on(CROSSINGS.P), to: on(CROSSINGS.L), low: 118, plane: "front" },
    { kind: "span", from: on(CROSSINGS.L), to: on(CROSSINGS.Y), low: 92, plane: "back" },
    { kind: "tail", from: on(CROSSINGS.Y), to: 170, plane: "front" },
  ],
  // Up from behind the C (its end tucked behind the bottom stroke), over
  // the C, in front across to the O, over it and down behind, its end
  // showing through the O's counter before it tucks behind the bottom.
  co: [
    { kind: "tail", from: on(CROSSINGS.C), to: 122, plane: "back", reverse: true },
    { kind: "span", from: on(CROSSINGS.C), to: on(CROSSINGS.O), low: 94, plane: "front" },
    { kind: "tail", from: on(CROSSINGS.O), to: 124, plane: "back" },
  ],
};

/**
 * The catenary through `a` and `b` whose lowest point sits at `low`, as a
 * function of x (y down). Found by bisecting on the catenary's parameter.
 */
function catenary(a: Point, b: Point, low: number) {
  // Work with y up, so the curve is a·cosh((x − xc)/a) + k.
  const y1 = -a.y;
  const y2 = -b.y;
  const target = -low;

  const fit = (p: number) => {
    // The vertex xc that puts both ends on the curve, by bisection: the
    // height difference between the ends shrinks as xc moves right.
    let lo = a.x - 500;
    let hi = b.x + 500;
    for (let i = 0; i < 80; i++) {
      const xc = (lo + hi) / 2;
      const diff = p * (Math.cosh((b.x - xc) / p) - Math.cosh((a.x - xc) / p));
      if (diff > y2 - y1) lo = xc;
      else hi = xc;
    }
    const xc = (lo + hi) / 2;
    const k = y1 - p * Math.cosh((a.x - xc) / p);
    return { xc, k, min: p + k };
  };

  // A smaller parameter hangs lower.
  let lo = 5;
  let hi = 5000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (fit(mid).min < target) lo = mid;
    else hi = mid;
  }
  const p = (lo + hi) / 2;
  const { xc, k } = fit(p);
  return (x: number) => -(p * Math.cosh((x - xc) / p) + k);
}

/** A piece as a fine polyline, in order along the garland. */
function trace(piece: Piece): Point[] {
  const out: Point[] = [];
  if (piece.kind === "tail") {
    const { from, to } = piece;
    for (let y = from.y; y <= to; y += 1) out.push({ x: from.x, y });
    return piece.reverse ? out.reverse() : out;
  }
  const f = catenary(piece.from, piece.to, piece.low);
  for (let x = piece.from.x; x <= piece.to.x; x += 0.5) out.push({ x, y: f(x) });
  return out;
}


/** mulberry32: small, fast and deterministic, so server and client agree. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Strands per unit of garland. */
const DENSITY = 4.2;
/** Strand length range: the garland is about twice this across. */
const STRAND_MIN = 9;
const STRAND_MAX = 19;
/** No strand starts closer than this to a ragged end. */
const END_TAPER = 6;

/**
 * Aluminium foil, darkest to brightest. Real tinsel is a mirror, so it
 * also picks up the room: a few warm strands from the wood shelves and
 * cool ones from the window light.
 */
const SILVER = ["#262a2f", "#434950", "#646b73", "#8b939b", "#b4bbc2", "#d9dee2", "#f3f5f7", "#ffffff"];
const WARM = "#c7a57a";
const COOL = "#9cb2c6";

type Layer = { back: string[][]; front: string[][]; glint: string[] };

/**
 * A bottle-brush of foil strands along the garland's core. Each strand
 * sticks out square to the core in 3D, at some angle round it; seen from
 * the front, that's a strand across the core whose length depends on how
 * far it points toward or away from you. Strands pointing away sit behind
 * the core and are darker, those pointing toward you sit in front, and
 * each strand's brightness comes from how it faces the light (upper left).
 */
function brush(points: Point[], rand: () => number, out: Layer) {
  // Resample by distance along the core.
  const along: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    along.push(along[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const total = along[along.length - 1];
  const count = Math.round(total * DENSITY);

  let j = 1;
  for (let k = 0; k < count; k++) {
    const s = rand() * total;
    if (s < END_TAPER * rand() || s > total - END_TAPER * rand()) continue;
    j = 1;
    while (j < along.length - 1 && along[j] < s) j++;
    const a = points[j - 1];
    const b = points[j];
    const span = along[j] - along[j - 1] || 1;
    const f = (s - along[j - 1]) / span;
    const tx = (b.x - a.x) / span;
    const ty = (b.y - a.y) / span;
    // Normal, pointing down-ish.
    let nx = -ty;
    let ny = tx;
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
    }

    const phi = rand() * Math.PI * 2;
    const toward = Math.sin(phi);
    const len = STRAND_MIN + rand() * (STRAND_MAX - STRAND_MIN);
    // Strands lean a little along the core and droop under their weight.
    const lean = (rand() - 0.5) * 0.7;
    const dx = (nx * Math.cos(phi) + tx * lean) * len;
    const dy = (ny * Math.cos(phi) + ty * lean) * len + len * 0.22 * (1 - Math.abs(Math.cos(phi)) * 0.5);
    const x = a.x + (b.x - a.x) * f + (rand() - 0.5) * 3 * nx;
    const y = a.y + (b.y - a.y) * f + (rand() - 0.5) * 3 * ny;

    // Light from the upper left: strands facing it (and you) are bright.
    const facing = (-dx * 0.6 - dy * 0.8) / len;
    const lit = Math.max(0, Math.min(1, 0.62 + facing * 0.3 + toward * 0.2 + (rand() - 0.5) * 0.6));
    // Whole units for the start keep the page light; nobody can see it.
    const d = `M${Math.round(x)} ${Math.round(y)}l${dx.toFixed(1)} ${dy.toFixed(1)}`;

    const roll = rand();
    if (toward > 0 && lit > 0.9 && roll < 0.35) {
      out.glint.push(d);
      continue;
    }
    const tone =
      roll < 0.06 ? SILVER.length : roll < 0.1 ? SILVER.length + 1 : Math.round(lit * (SILVER.length - 1));
    const bucket = toward > 0 ? out.front : out.back;
    // Behind the core is in the garland's own shade.
    const shaded = toward > 0 ? tone : tone >= SILVER.length ? tone : Math.max(0, tone - 1);
    bucket[shaded].push(d);
  }
}

const TONES = [...SILVER, WARM, COOL];

function build(pieces: Piece[], seed: number) {
  const rand = random(seed);
  const empty = (): Layer => ({
    back: TONES.map(() => []),
    front: TONES.map(() => []),
    glint: [],
  });
  const layers = { front: empty(), back: empty() };
  const cores = { front: [] as string[], back: [] as string[] };

  for (const piece of pieces) {
    const points = trace(piece);
    brush(points, rand, layers[piece.plane]);
    cores[piece.plane].push(
      points
        .filter((_, i) => i % 4 === 0 || i === points.length - 1)
        .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(""),
    );
  }

  const flatten = (layer: Layer) => ({
    back: layer.back.map((list) => list.join("")),
    front: layer.front.map((list) => list.join("")),
    glint: layer.glint.join(""),
  });
  return {
    front: { core: cores.front, ...flatten(layers.front) },
    back: { core: cores.back, ...flatten(layers.back) },
  };
}

/**
 * Built on first use, in the browser only: thousands of strands would add
 * ~50KB to the home page's HTML, and the hero's intro covers the moment
 * before they appear.
 */
let built: { supply: ReturnType<typeof build>; co: ReturnType<typeof build> } | null = null;
const getBuilt = () =>
  (built ??= { supply: build(GARLANDS.supply, 1201), co: build(GARLANDS.co, 77) });

const subscribe = () => () => {};
const useInBrowser = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/** The shadow the garland casts on the letters; render once, first. */
export function HeroTinselDefs() {
  return (
    <defs>
      <filter id="ecs-tinsel-shadow" x="-10%" y="-20%" width="120%" height="160%">
        <feDropShadow dx="2" dy="4" stdDeviation="2.2" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>
  );
}

function Strands({ paths }: { paths: string[] }) {
  return (
    <>
      {paths.map((d, i) =>
        d ? <path key={i} d={d} stroke={TONES[i]} /> : null,
      )}
    </>
  );
}

export function HeroTinsel({
  garland,
  layer,
}: {
  garland: "supply" | "co";
  layer: Plane;
}) {
  const inBrowser = useInBrowser();
  if (!inBrowser) return null;
  const built = getBuilt()[garland][layer];

  return (
    <g
      className={styles.tinsel}
      aria-hidden="true"
      // Only what hangs in front casts a shadow onto the letters.
      filter={layer === "front" ? "url(#ecs-tinsel-shadow)" : undefined}
    >
      <g className={styles.strands}>
        <Strands paths={built.back} />
      </g>
      {/* The dense middle, where the strands bunch and shade each other. */}
      {built.core.map((d) => (
        <path key={d} className={styles.core} d={d} />
      ))}
      <g className={styles.strands}>
        <Strands paths={built.front} />
      </g>
      <path className={styles.glint} d={built.glint} />
    </g>
  );
}

/**
 * Where "Co." swells from: 40% across and 60% down its own box (the CO
 * outline and its dot, extrusion included), pinned so the tinsel inside
 * the group doesn't move it.
 */
export const CO_SWELL_ORIGIN: CSSProperties = {
  transformBox: "view-box",
  transformOrigin: "886.65px 93.92px",
};
