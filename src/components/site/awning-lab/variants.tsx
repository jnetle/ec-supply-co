/* TEMPORARY — hand-painted awning candidates. Delete the awning-lab folder
   once a variant is chosen.

   Every variant is drawn on the original awning's slat grid: the header is
   measured, its height becomes 100 user units, and slat width and hem depth
   are converted from the same clamp()s awning.module.css uses, so each slat
   is exactly the size of the original's at every viewport. Shapes come from a
   seeded random source, so the wobble is the same on every load; the
   painterly finish (dry-brush streaks, chewed edges) comes from the SVG
   filters in <Filters />. */

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import styles from "./awning-lab.module.css";
import type { CssVariant, VariantSlug } from "./store";

/* The original awning's cream and sun-faded charcoal (awning.module.css). */
const GROUND = "#e9e4d8";
const INK = "#3a3531";

/** The original's rhythm: every fourth slat is ink. */
const isInk = (i: number) => i % 4 === 3;

type Pt = [number, number];
type Rand = () => number;

/** mulberry32 — tiny, deterministic, good enough for wobble. */
function seeded(seed: number): Rand {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => Math.round(n * 10) / 10;
const path = (pts: Pt[]) =>
  `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
const openPath = (pts: Pt[]) =>
  `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}`;

/** A hand-ruled line from a to b: a slow sway plus a little tremor. */
function line(r: Rand, a: Pt, b: Pt, step = 7, amp = 0.9): Pt[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const n = Math.max(1, Math.round(len / step));
  const nx = -dy / len;
  const ny = dx / len;
  const phase = r() * Math.PI * 2;
  const waves = 0.4 + r() * 1.1;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const pinned = i === 0 || i === n ? 0 : 1;
    const off =
      pinned *
      amp *
      (Math.sin(phase + t * Math.PI * 2 * waves) * 0.6 + (r() - 0.5) * 0.8);
    pts.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
  }
  return pts;
}

type Hem = (xl: number, xr: number) => Pt[];

const flatHem =
  (r: Rand, y: number, amp = 0.8): Hem =>
  (xl, xr) =>
    line(r, [xl, y + (r() - 0.5) * 2], [xr, y + (r() - 0.5) * 2], 6, amp);

/** The original's slat bottom: straight sides, corners rounded at radius
    `R`, flat between (a full semicircle when the slat is narrow enough). */
const roundHem =
  (y: number, R: number): Hem =>
  (xl, xr) => {
    const rad = Math.min(R, (xr - xl) / 2);
    const pts: Pt[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = xl + ((xr - xl) * i) / 24;
      const dx = Math.min(x - xl, xr - x);
      const into = Math.max(0, rad - dx);
      pts.push([x, y - rad + Math.sqrt(Math.max(0, rad * rad - into * into))]);
    }
    return pts;
  };

/** A vertical stripe from above the strip down to its hem, leaning a touch. */
function band(r: Rand, x0: number, x1: number, hem: Hem, top = -10) {
  const lean = (r() - 0.5) * 2.6;
  const h = hem(x0 + lean, x1 + lean);
  return path([
    ...line(r, [x0, top], h[0]),
    ...h,
    ...line(r, h[h.length - 1], [x1, top]),
  ]);
}

/** Cream ground across the whole strip, ending in the given hem line
    (drawn left to right). */
function ground(hemPts: Pt[]) {
  const last = hemPts[hemPts.length - 1];
  return path([[-10, -10], ...hemPts, [last[0], -10]]);
}

/** A hand-ruled line straight across the strip at height y. */
const across = (r: Rand, W: number, y: number, step = 8, amp = 0.8) =>
  line(r, [-10, y], [W + 10, y], step, amp);

/* ── Filters ─────────────────────────────────────────────────────────── */

/** Wobbles edges: `scale` is how far (in user units) they wander, `freq`
    how tightly. */
const Warp = ({
  scale = 4,
  freq = 0.05,
}: {
  scale?: number;
  freq?: number;
}) => (
  <>
    <feTurbulence
      type="fractalNoise"
      baseFrequency={freq}
      numOctaves="3"
      seed="4"
      result="warp"
    />
    <feDisplacementMap
      in="painted"
      in2="warp"
      scale={scale}
      xChannelSelector="R"
      yChannelSelector="G"
    />
  </>
);

/** Streaks running down the stripe, as a dry brush leaves them. `a`/`b` map
    noise to opacity: higher `a` = streakier. */
function BrushFilter({
  id,
  a,
  b,
  warp = 4,
  warpFreq = 0.05,
}: {
  id: string;
  a: number;
  b: number;
  warp?: number;
  warpFreq?: number;
}) {
  return (
    <filter id={id} x="-1%" y="-30%" width="102%" height="160%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.07 0.006"
        numOctaves="3"
        seed="9"
        result="grain"
      />
      <feColorMatrix
        in="grain"
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${a} 0 0 0 ${b}`}
        result="mask"
      />
      <feComposite
        in="SourceGraphic"
        in2="mask"
        operator="in"
        result="painted"
      />
      <Warp scale={warp} freq={warpFreq} />
    </filter>
  );
}

/** A watercolour wash: soft wobbling edges, low-frequency blotches where
    pigment settled unevenly, fine paper granulation, and the darker rim
    pigment leaves as a wash dries at its edges. Applied to each shape on its
    own, so neighbouring slats keep their own rims. `rim` is how dark the
    edge pooling gets. */
function WatercolorFilter({ id, rim }: { id: string; rim: number }) {
  return (
    <filter
      id={id}
      x="-10%"
      y="-10%"
      width="120%"
      height="120%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.04"
        numOctaves="2"
        seed="3"
        result="warpNoise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="warpNoise"
        scale="2"
        xChannelSelector="R"
        yChannelSelector="G"
        result="shape"
      />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.035 0.018"
        numOctaves="2"
        seed="12"
        result="blotch"
      />
      <feColorMatrix
        in="blotch"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0 0 0 0.66"
        result="blotchMask"
      />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.9"
        numOctaves="2"
        seed="5"
        result="grain"
      />
      <feColorMatrix
        in="grain"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0 0 0 0.7"
        result="grainMask"
      />
      <feComposite in="shape" in2="blotchMask" operator="in" result="wash" />
      <feComposite in="wash" in2="grainMask" operator="in" result="body" />
      <feMorphology in="shape" operator="erode" radius="1.6" result="inner" />
      <feComposite in="shape" in2="inner" operator="out" result="edge" />
      <feGaussianBlur in="edge" stdDeviation="0.7" result="edgeSoft" />
      <feComposite in="edgeSoft" in2="shape" operator="in" result="edgeIn" />
      <feColorMatrix
        in="edgeIn"
        type="matrix"
        values={`0.72 0 0 0 0  0 0.72 0 0 0  0 0 0.72 0 0  0 0 0 ${rim} 0`}
        result="rim"
      />
      <feMerge>
        <feMergeNode in="body" />
        <feMergeNode in="rim" />
      </feMerge>
    </filter>
  );
}

function Filters() {
  return (
    <defs>
      <filter id="awl-rough" x="-1%" y="-30%" width="102%" height="160%">
        <feOffset in="SourceGraphic" dx="0" dy="0" result="painted" />
        <Warp />
      </filter>
      {/* Fabric shading across one slat: a soft highlight on the lit left
          edge, flat through the middle, then a shadow deepening into the
          seam on the right, as canvas panels catch light. */}
      <linearGradient id="awl-shade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.55" stopColor={INK} stopOpacity="0" />
        <stop offset="0.85" stopColor={INK} stopOpacity="0.07" />
        <stop offset="1" stopColor={INK} stopOpacity="0.17" />
      </linearGradient>
      <linearGradient id="awl-shade-ink" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.7" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.22" />
      </linearGradient>
      {/* Gentler versions for the stripes.png match: smooth edges with only a
          slow waver, near-solid ink. */}
      <BrushFilter
        id="awl-soft-ink"
        a={0.2}
        b={0.88}
        warp={1.6}
        warpFreq={0.02}
      />
      <BrushFilter
        id="awl-soft-wash"
        a={1.6}
        b={-0.45}
        warp={2}
        warpFreq={0.03}
      />
      <WatercolorFilter id="awl-wc-ink" rim={0.7} />
      <WatercolorFilter id="awl-wc-cream" rim={0.45} />
    </defs>
  );
}

/* ── Variants ────────────────────────────────────────────────────────── */

/** The original awning's measurements, in user units (header height = 100).
    W: strip width · S: slat width · R: hem depth (the original's corner
    radius, where its scallops start curving). */
type Geo = { W: number; S: number; R: number };

type Drawn = { art: ReactNode };

/** Every variant casts the same shadow from its hem, as a canvas awning in
    daylight does: a tight, darker contact shadow right under the edge, and
    a wider, softer falloff onto whatever is below. The CSS variants use the
    same values (awning-lab.module.css .shadow). */
const SHADOW =
  "drop-shadow(0 2px 1.5px rgba(20, 18, 16, 0.22)) drop-shadow(0 7px 9px rgba(20, 18, 16, 0.16))";

/** Slat edges on the original grid. Each slat is nudged by a hair so the
    edges don't read as ruled, but the grid itself never drifts. */
function slats(r: Rand, { W, S }: Geo) {
  const out: { i: number; x0: number; x1: number }[] = [];
  for (let i = 0, x = 0; x < W; i++, x += S) {
    out.push({ i, x0: x + (r() - 0.5) * 0.8, x1: x + S + (r() - 0.5) * 0.8 });
  }
  return out;
}

const Paths = ({ ds }: { ds: string[] }) =>
  ds.map((d, i) => <path key={i} d={d} />);

/** Cream slat tones by position in the 4-slat repeat (slot 3 is ink), so
    neighbouring cream slats never share a shade. */
const TONES = ["#efebe2", GROUND, "#e1dbce"];
const toneOf = (i: number, tones = TONES) => tones[i % 4] ?? tones[1];

/** What the original's inset edge line and scallops did: lets each cream
    slat read as its own strip of canvas. Each slat gets a slight tone shift
    and is shaded like a gently curved fabric panel lit from the left (see
    the awl-shade gradient), so neighbours separate by light, not lines.
    Draws per-slat bands down to `bottom`, or shades the variant's own cream
    `shapes` when its slats aren't straight (scallops, blocks). Pass
    `tone={false}` when the variant already fills its slats by tone, and
    `tones` when its cream isn't the original's (the middle entry is the
    ground colour, which needs no overlay). */
function SlatShading({
  g,
  bottom = 98.5,
  tone = true,
  tones = TONES,
  shapes,
}: {
  g: Geo;
  bottom?: number;
  tone?: boolean;
  tones?: string[];
  shapes?: string[];
}) {
  const r = seeded(101);
  const tints: { d: string; fill: string }[] = [];
  const shaded: string[] = shapes ?? [];
  for (let i = 0, x = 0; !shapes && x < g.W; i++, x += g.S) {
    if (isInk(i)) continue;
    const d = band(r, x, x + g.S, flatHem(r, bottom, 0.6));
    if (tone && toneOf(i, tones) !== tones[1]) {
      tints.push({ d, fill: toneOf(i, tones) });
    }
    shaded.push(d);
  }
  return (
    <g filter="url(#awl-rough)">
      {tints.map((t, i) => (
        <path key={i} d={t.d} fill={t.fill} />
      ))}
      <g fill="url(#awl-shade)">
        <Paths ds={shaded} />
      </g>
    </g>
  );
}

/** Ink slats with the same fabric shading as the cream, subtler. Sits
    inside the ink group so it shares its filter and edges. */
const Inked = ({ ds }: { ds: string[] }) => (
  <>
    <Paths ds={ds} />
    <g fill="url(#awl-shade-ink)">
      <Paths ds={ds} />
    </g>
  </>
);

/** A close match for the stripes.png reference's finish: its charcoal and
    off-white, flat bottom, solid ink with soft edges, and translucent brush
    patches in the white. Slat size and the 1-in-4 rhythm are the
    original's. */
function reference(g: Geo, inkFill = "#363432"): Drawn {
  const r = seeded(97);
  const tones = ["#f8f6f2", "#f5f3ee", "#ebe8e0"];
  const cream = tones[1];
  const patch = "#e9e5db";
  const ink: string[] = [];
  const patches: string[] = [];
  // Every layer runs past the bottom (to OVER) and is trimmed along one
  // shared hand-drawn hem by the clip below, so cream and charcoal both
  // reach the same edge with nothing peeking out under either; past the
  // hem is transparent.
  const OVER = 110;
  const hem = ground(across(seeded(98), g.W, 98.8, 10, 0.7));
  for (const { i, x0, x1 } of slats(r, g)) {
    if (isInk(i)) {
      ink.push(band(r, x0, x1, flatHem(r, OVER, 0.3)));
      continue;
    }
    // One or two strokes per white slat, some only part of the way down,
    // as a brush running dry leaves them.
    const strokes = 1 + Math.floor(r() * 2);
    for (let k = 0; k < strokes; k++) {
      const w = x1 - x0;
      const a = x0 + w * (0.05 + r() * 0.35);
      const b = Math.min(x1 - 1, a + w * (0.35 + r() * 0.45));
      const top = r() < 0.5 ? -10 : 10 + r() * 35;
      const bottom = r() < 0.6 ? OVER : 55 + r() * 35;
      patches.push(band(r, a, b, flatHem(r, bottom, 1.4), top));
    }
  }
  return {
    art: (
      <g clipPath="url(#awl-ref-hem)">
        <clipPath id="awl-ref-hem">
          <path d={hem} />
        </clipPath>
        <path
          d={ground(across(r, g.W, OVER, 8, 0.5))}
          fill={cream}
          filter="url(#awl-rough)"
        />
        <SlatShading g={g} bottom={OVER} tones={tones} />
        <g fill={patch} filter="url(#awl-soft-wash)">
          <Paths ds={patches} />
        </g>
        <g fill={inkFill} filter="url(#awl-soft-ink)">
          <Inked ds={ink} />
        </g>
      </g>
    ),
  };
}

/** The original awning, painted in watercolour like the blue-and-white
    reference: same slat size, 1-in-4 rhythm, colours and fold. Each slat is
    a body plus a separate rounded flap from the original's 67.1% fold
    (its shaded underside becomes a lighter or darker wash, as in the
    original), each with its own pooled rim, so the seam and the edges
    between cream slats show the way they do on paper. */
function watercolor(g: Geo, withFlap = true): Drawn {
  const r = seeded(131);
  const foldY = 67.1;
  const hemY = 99.5;
  const paper: string[] = [];
  const shapes: { d: string; fill: string; filter: string }[] = [];
  for (const { i, x0, x1 } of slats(r, g)) {
    const ink = isInk(i);
    const filter = ink ? "url(#awl-wc-ink)" : "url(#awl-wc-cream)";
    // Without the flap the slat simply ends, cut straight, at the fold.
    const body = band(
      r,
      x0,
      x1,
      flatHem(r, withFlap ? foldY + 0.5 : foldY, 0.3),
    );
    paper.push(body);
    shapes.push({ d: body, fill: ink ? "#3a3531" : GROUND, filter });
    if (withFlap) {
      const flap = band(
        r,
        x0,
        x1,
        roundHem(hemY, Math.min(g.R, g.S / 2) * SQUARE_CORNER),
        foldY - 0.5,
      );
      paper.push(flap);
      shapes.push({ d: flap, fill: ink ? "#48423d" : "#d6cfc0", filter });
    }
  }
  return {
    art: (
      <>
        {/* Opaque paper under the washes, so nothing behind the header
            shows through the thin spots. */}
        <g fill="#f3efe6">
          <Paths ds={paper} />
        </g>
        {shapes.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} filter={s.filter} />
        ))}
      </>
    ),
  };
}

/** The site's torn-paper section edge (WaveDivider's path, viewBox
    1200 × 40), as the cubic segments after its starting point. */
const WAVE_START: Pt = [0, 26];
const WAVE_CURVES: [Pt, Pt, Pt][] = [
  [
    [88, 4],
    [158, 32],
    [252, 18],
  ],
  [
    [346, 4],
    [408, 30],
    [502, 22],
  ],
  [
    [596, 14],
    [660, 38],
    [758, 25],
  ],
  [
    [856, 12],
    [922, 33],
    [1016, 19],
  ],
  [
    [1096, 7],
    [1146, 27],
    [1200, 12],
  ],
];

/** The section wave as a hem: stretched across the whole strip as the
    section edges are across the page, its 40-unit height mapped into
    `depth` units starting at `top`. Left to right. */
function waveHem(W: number, top: number, depth: number): Pt[] {
  const map = ([x, y]: Pt): Pt => [
    -10 + (x / 1200) * (W + 20),
    top + (y / 40) * depth,
  ];
  const pts: Pt[] = [map(WAVE_START)];
  let p0 = WAVE_START;
  for (const [c1, c2, p1] of WAVE_CURVES) {
    for (let k = 1; k <= 16; k++) {
      const t = k / 16;
      const u = 1 - t;
      const at = (n: 0 | 1) =>
        u * u * u * p0[n] +
        3 * u * u * t * c1[n] +
        3 * u * t * t * c2[n] +
        t * t * t * p1[n];
      pts.push(map([at(0), at(1)]));
    }
    p0 = p1;
  }
  return pts;
}

/** The original awning in #8's cream, with slat sides that waver like the
    painted stripes in stripes.png: smooth, slightly leaning, never ruled.
    Original slat width, full height and rounded bottoms, 1-in-4 rhythm.
    Neighbouring slats share each wavy edge, so there are never gaps. */
/** Every scalloped variant (not the original) uses rounded-square slat
    bottoms: corners at this fraction of the original's radius, which on
    narrow slats is nearly a semicircle. */
const SQUARE_CORNER = 0.4;

/** Colourways for the painted-edge awnings: three slightly varied creams,
    the every-fourth stripe, and the brush-patch tint. */
const PALETTES = {
  // #8's cream and pale grey.
  cream: {
    cream: ["#f7f3ed", "#f6f2ec", "#f3eee6"],
    stripe: "#e6e2db",
    patch: "#ece6dc",
  },
  // The original awning's matte cream and faded black.
  ink: {
    cream: ["#ece7dc", "#e9e4d8", "#e5e0d3"],
    stripe: "#3a3531",
    patch: "#dfd9cb",
  },
  // The original's matte cream with the brand sign's deep teal.
  teal: {
    cream: ["#ece7dc", "#e9e4d8", "#e5e0d3"],
    stripe: "#0a3940",
    patch: "#dfd9cb",
  },
  // Monotone, from the site's warm neutral ramp (--color-ecs-neutral-*):
  // light stone slats and a deeper warm taupe stripe. One quiet hue that
  // sits under the teal, marigold, pinks and red without competing.
  mono: {
    cream: ["#e4ddd1", "#dfd8cb", "#dad2c4"],
    stripe: "#8f8576",
    patch: "#d3cbbd",
  },
};

function painted(
  g: Geo,
  scalloped = true,
  wavy = false,
  palette: keyof typeof PALETTES = "cream",
  waveAtBottom = false,
  /** Scales the scallop corners: 1 is the original's radius (near a
      semicircle on narrow slats); smaller gives a rounded square. */
  cornerScale = 1,
): Drawn {
  const r = seeded(231);
  const hemY = 99.5;
  const corner = Math.min(g.R, g.S / 2) * cornerScale;
  const bendY = hemY - corner;
  // Wavy: slats run past the bottom and are trimmed along the section wave,
  // centred on where the flat cut would be.
  const WAVE_DEPTH = 20;
  // At the bottom instead for the hanging-nav strip, so the chips tuck under
  // its lowest edge.
  const wave = wavy
    ? waveHem(g.W, waveAtBottom ? 100 - WAVE_DEPTH : bendY - 12, WAVE_DEPTH)
    : null;
  const endY = wave ? 110 : bendY;
  // One wavering edge per slat boundary, top to where the rounding starts.
  const edges: Pt[][] = [];
  for (let x = 0; x <= g.W + g.S; x += g.S) {
    const lean = (r() - 0.5) * 2.4;
    edges.push(line(r, [x - lean / 2, -10], [x + lean / 2, endY], 14, 1.8));
  }
  const { cream, stripe, patch } = PALETTES[palette];
  const slats: { d: string; fill: string }[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    const left = edges[i];
    const right = edges[i + 1];
    const xl = left[left.length - 1][0];
    const xr = right[right.length - 1][0];
    slats.push({
      // Without the scallop section the slat ends where its rounding would
      // start; neighbours share those end points, so the edge is unbroken.
      d: path([
        ...left,
        ...(scalloped ? roundHem(hemY, corner)(xl, xr) : []),
        ...[...right].reverse(),
      ]),
      fill: isInk(i) ? stripe : cream[Math.floor(r() * 3)],
    });
  }
  // Faint brush patches in the cream slats, as in the reference.
  const patches: string[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    if (isInk(i) || r() < 0.5) continue;
    const x0 = i * g.S;
    const a = x0 + g.S * (0.1 + r() * 0.3);
    const b = a + g.S * (0.3 + r() * 0.3);
    const top = r() < 0.5 ? -10 : 10 + r() * 30;
    patches.push(band(r, a, b, flatHem(r, 50 + r() * 30, 1.4), top));
  }
  return {
    art: (
      <g clipPath={wave ? "url(#awl-painted-wave)" : undefined}>
        {wave && (
          <clipPath id="awl-painted-wave">
            <path d={ground(wave)} />
          </clipPath>
        )}
        {slats.map((sl, i) => (
          <path key={i} d={sl.d} fill={sl.fill} />
        ))}
        <g fill={patch} filter="url(#awl-soft-wash)">
          <Paths ds={patches} />
        </g>
        {/* The shared edges, inked faintly so the waver reads between two
            cream slats. */}
        <g
          fill="none"
          stroke="rgba(120, 105, 85, 0.13)"
          strokeWidth={1.2}
          strokeLinecap="round"
        >
          {edges.map((e, i) => (
            <path key={i} d={openPath(e)} />
          ))}
        </g>
        {/* The wave, traced as faintly as the slat edges. */}
        {wave && (
          <path
            d={openPath(wave)}
            fill="none"
            stroke="rgba(120, 105, 85, 0.16)"
            strokeWidth={1.6}
          />
        )}
      </g>
    ),
  };
}

/** The original awning as a loose pen doodle: same slat width, scallops
    and 1-in-4 rhythm, but drawn quickly. Slat lines wobble, overshoot or
    stop short and are sometimes gone over twice; the scallops are one
    loopy line; the ink slats are a zigzag scribble that never quite
    reaches the edges. A cream wash sits under it, a little out of
    register with the pen, as colour added to a sketch. */
function doodle(g: Geo): Drawn {
  const r = seeded(251);
  const hemY = 96;
  const rad = Math.min(g.R, g.S / 2) * SQUARE_CORNER;
  const bendY = hemY - rad;
  const pen = "#3a3531";
  const strokes: string[] = [];
  const scribbles: string[] = [];
  const washes: string[] = [];
  let i = 0;
  for (let x = 0; x < g.W + g.S; x += g.S, i++) {
    // Slat line: from above the strip to around where the scallop starts.
    const end = bendY + (r() - 0.5) * 6;
    const lean = (r() - 0.5) * 2.5;
    strokes.push(openPath(line(r, [x, -10], [x + lean, end], 10, 1.4)));
    if (r() < 0.3) {
      // Gone over a second time, not quite on the first line.
      const off = (r() - 0.5) * 2.4;
      strokes.push(
        openPath(
          line(
            r,
            [x + off, 5 + r() * 20],
            [x + lean + off, end - r() * 8],
            10,
            1.2,
          ),
        ),
      );
    }
    // The scallop, wobbling and not quite meeting its neighbours.
    const xl = x + (r() - 0.3) * 1.5;
    const xr = x + g.S + (r() - 0.7) * 1.5;
    const arc = roundHem(hemY + (r() - 0.5) * 2.5, rad * (0.85 + r() * 0.3))(
      xl,
      xr,
    ).map(([px, py]): Pt => [px + (r() - 0.5) * 0.6, py + (r() - 0.5) * 0.8]);
    strokes.push(
      openPath([[xl, bendY - 3 - r() * 4], ...arc, [xr, bendY - 2 - r() * 5]]),
    );
    // Cream wash, offset from the pen like loose colouring-in.
    const dx = (r() - 0.5) * 3;
    const dy = (r() - 0.5) * 3;
    washes.push(
      path([
        [x + dx, -10],
        ...roundHem(hemY - 1 + dy, rad)(x + dx, x + g.S + dx),
        [x + g.S + dx, -10],
      ]),
    );
    if (isInk(i)) {
      // Zigzag scribble down the slat, loose at the sides.
      const pts: Pt[] = [];
      let left = true;
      for (let y = -6; y < bendY + rad * 0.6; y += 3.2 + r() * 2.2) {
        const inset = 1.5 + r() * 3.5;
        pts.push([left ? x + inset : x + g.S - inset, y + (r() - 0.5) * 2]);
        left = !left;
      }
      scribbles.push(openPath(pts));
    }
  }
  return {
    art: (
      <>
        <g fill="#f3eee5">
          <Paths ds={washes} />
        </g>
        <g
          fill="none"
          stroke={pen}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#awl-rough)"
        >
          <g strokeWidth={1.6} opacity={0.85}>
            <Paths ds={scribbles} />
          </g>
          <g strokeWidth={2.2}>
            <Paths ds={strokes} />
          </g>
        </g>
      </>
    ),
  };
}

/** A tidier sibling of the doodle: clean pen line art with the scallop
    section removed, so the slats end at the original's straight cut. One
    stroke per slat line with only a slight waver, a single hand-drawn hem,
    and the ink slats filled with even diagonal hatching. */
function lineArt(g: Geo, wash = false): Drawn {
  const r = seeded(271);
  const hemY = 100 - Math.min(g.R, g.S / 2) - 2;
  // Wash: monotone, so the pen is a dark warm taupe rather than black.
  const pen = wash ? "#5b5248" : "#3a3531";
  const hem = across(r, g.W, hemY, 12, 0.5);
  const lines: string[] = [];
  const inkRects: string[] = [];
  const hatch: string[] = [];
  // Loose watercolour washes, one per slat, never quite inside the lines.
  const washes: { d: string; fill: string; ink: boolean }[] = [];
  let i = 0;
  for (let x = 0; x < g.W + g.S; x += g.S, i++) {
    lines.push(
      openPath(line(r, [x, -10], [x + (r() - 0.5) * 1.2, hemY], 14, 0.6)),
    );
    if (wash) {
      const ink = isInk(i);
      const a = x + (r() - 0.5) * 2.4;
      const b = x + g.S + (r() - 0.5) * 2.4;
      washes.push({
        // Always stops a little short of the hem, as a wash does.
        d: band(r, a, b, flatHem(r, hemY - 0.5 - r() * 2, 1.2), -10),
        fill: ink
          ? "#8f8576"
          : ["#d9d0c1", "#d3c9b8", "#ddd5c7"][Math.floor(r() * 3)],
        ink,
      });
    }
    if (isInk(i)) {
      inkRects.push(
        path([
          [x, -10],
          [x + g.S, -10],
          [x + g.S, hemY + 4],
          [x, hemY + 4],
        ]),
      );
      // Even 45° hatching across the slat, trimmed to it by the clip.
      for (let c = -g.S; c < hemY + 10; c += 5) {
        hatch.push(`M${fmt(x)} ${fmt(c + g.S)}L${fmt(x + g.S)} ${fmt(c)}`);
      }
    }
  }
  return {
    art: (
      <>
        <defs>
          <clipPath id="awl-lineart-ink">
            <Paths ds={inkRects} />
          </clipPath>
          <clipPath id="awl-lineart-hem">
            <path d={ground(hem)} />
          </clipPath>
        </defs>
        {/* Paper; with washes it's toned to the lightest wash, so the gaps
            a wash leaves read as paper rather than a glint. */}
        <path d={ground(hem)} fill={wash ? "#e6dfd3" : "#f3eee5"} />
        {washes.map((w, k) => (
          <path
            key={k}
            d={w.d}
            fill={w.fill}
            filter={w.ink ? "url(#awl-wc-ink)" : "url(#awl-wc-cream)"}
          />
        ))}
        <g
          fill="none"
          stroke={pen}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g clipPath="url(#awl-lineart-hem)">
            <g clipPath="url(#awl-lineart-ink)" strokeWidth={1.4}>
              <Paths ds={hatch} />
            </g>
            <g strokeWidth={2}>
              <Paths ds={lines} />
            </g>
          </g>
          <path d={openPath(hem)} strokeWidth={2.2} />
        </g>
      </>
    ),
  };
}

/** Cut paper, in the site's own language rather than an illustration of an
    awning: a row of hand-cut paper strips laid side by side like a collage.
    Each strip is cut like the nav chips — one rounder and one tighter
    bottom corner, never the same twice — ends at a slightly different
    length, and overlaps its neighbour a touch, casting the same kind of
    hard, close shadow the chips do. Paper stock varies a little strip to
    strip; every fourth is the brand sign's deep teal instead of black.
    Original slat width and rhythm. */
function cutPaper(g: Geo): Drawn {
  const r = seeded(291);
  const papers = ["#f4eee2", "#f1e9db", "#f6f1e7"];
  const teals = ["#0a3940", "#0c3d44"];
  const strips: { d: string; fill: string }[] = [];
  let i = 0;
  for (let x = 0; x < g.W + g.S; x += g.S, i++) {
    const overlap = 1.2;
    const xl = x - overlap + (r() - 0.5) * 0.8;
    const xr = x + g.S + overlap + (r() - 0.5) * 0.8;
    const w = xr - xl;
    // Ends at a slightly different length; the bottom isn't quite level.
    const base = 100 - g.R * (0.15 + r() * 0.75);
    const yl = base + (r() - 0.5) * 2.2;
    const yr = base + (r() - 0.5) * 2.2;
    // One rounder corner and one tighter, swapping sides at random.
    const big = w * (0.38 + r() * 0.1);
    const small = w * (0.14 + r() * 0.08);
    const [rl, rr] = r() < 0.5 ? [big, small] : [small, big];
    const lean = (r() - 0.5) * 1.4;
    const bl = xl + lean;
    const br = xr + lean;
    strips.push({
      d:
        `M${fmt(xl)} -10L${fmt(bl)} ${fmt(yl - rl)}` +
        `Q${fmt(bl)} ${fmt(yl)} ${fmt(bl + rl)} ${fmt(yl)}` +
        `L${fmt(br - rr)} ${fmt(yr)}` +
        `Q${fmt(br)} ${fmt(yr)} ${fmt(br)} ${fmt(yr - rr)}` +
        `L${fmt(xr)} -10Z`,
      fill: isInk(i)
        ? teals[Math.floor(r() * teals.length)]
        : papers[Math.floor(r() * papers.length)],
    });
  }
  return {
    art: (
      <>
        <defs>
          {/* Each strip's close shadow on the one beneath it, hard like
              the chips' offset shadows, falling down and to the left. */}
          <filter
            id="awl-cut-shadow"
            x="-20%"
            y="-10%"
            width="140%"
            height="130%"
          >
            <feDropShadow
              dx="-0.9"
              dy="1.4"
              stdDeviation="0.35"
              floodColor="#141210"
              floodOpacity="0.2"
            />
          </filter>
        </defs>
        {strips.map((st, k) => (
          <path key={k} d={st.d} fill={st.fill} filter="url(#awl-cut-shadow)" />
        ))}
      </>
    ),
  };
}

/** Each variant's drawing. `hang` is true when it's shown as the
    half-height hanging-nav strip; wavy hems then sit at the very bottom so
    the chips tuck under the lowest edge. */
const DRAW: Record<
  Exclude<VariantSlug, CssVariant>,
  (g: Geo, hang: boolean) => Drawn
> = {
  reference: (g) => reference(g),
  // #1 with the brand sign's deep teal in place of the charcoal.
  "reference-teal": (g) => reference(g, "#0a3940"),
  painted: (g) => painted(g, true, false, "cream", false, SQUARE_CORNER),
  // #14 with the scallops gone and the section wave for a hem.
  "painted-flat": (g, hang) => painted(g, false, true, "cream", hang),
  // #15 in the original's matte cream and faded black.
  "painted-ink": (g, hang) => painted(g, false, true, "ink", hang),
  // #9 with the brand sign's deep teal in place of the black.
  "painted-teal": (g, hang) => painted(g, false, true, "teal", hang),
  // #10 in a monotone warm neutral.
  "painted-mono": (g, hang) => painted(g, false, true, "mono", hang),
  doodle: (g) => doodle(g),
  "cut-paper": (g) => cutPaper(g),
  "line-art": (g) => lineArt(g),
  // #16 with monotone watercolour washes under the pen.
  "line-art-wash": (g) => lineArt(g, true),
  watercolor: (g) => watercolor(g),
  // The same painting with the scalloped flap section removed entirely:
  // slats end at the original's fold, two-thirds of the way down.
  "watercolor-flat": (g) => watercolor(g, false),
};

const clamp = (min: number, value: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Converts the original awning's CSS sizes into user units for a header of
    the given size. Mirrors awning.module.css: slat width
    clamp(19px, 1.9vw, 48px), corner radius clamp(8px, 0.8vw, 20px). */
function measure(width: number, height: number): Geo {
  const vw = window.innerWidth / 100;
  const k = 100 / height;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    W: round(width * k),
    S: round(clamp(19, 1.9 * vw, 48) * k),
    R: round(clamp(8, 0.8 * vw, 20) * k),
  };
}

const fill: CSSProperties = {
  position: "absolute",
  // Longhands, not `inset`, and `bottom` is set per variant below: React
  // warns when a longhand changes under a shorthand between renders.
  top: 0,
  right: 0,
  left: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

export function PaintedAwning({
  variant,
  hanging,
}: {
  variant: Exclude<VariantSlug, CssVariant>;
  hanging: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fires once on observe, then on every header resize.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const next = measure(width, height);
      setGeo((prev) =>
        prev && prev.W === next.W && prev.S === next.S && prev.R === next.R
          ? prev
          : next,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const drawn = useMemo(
    () => geo && DRAW[variant](geo, hanging),
    [variant, geo, hanging],
  );

  // The border strip is half the header's height and sits above the nav row,
  // so the chips can tuck under it. Measuring the strip itself keeps the
  // slats the original's size.
  const border = hanging;
  // The stripes.png match is shortened so the nav chips sit centred in it;
  // its height comes from CSS, so `bottom` is left unset. Hanging wins.
  const centred =
    (variant === "reference" || variant === "reference-teal") && !hanging;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={centred ? styles.centred : undefined}
      style={{
        ...fill,
        bottom: centred ? undefined : border ? "50%" : 0,
        zIndex: border ? 1 : undefined,
        filter: SHADOW,
      }}
    >
      {geo && drawn && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${geo.W} 100`}
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <Filters />
          {drawn.art}
        </svg>
      )}
    </div>
  );
}
