"use client";

/* The shop awning behind the nav bar, painted rather than ruled: matte
   cream slats with every fourth in faded black, each slat edge wavering as
   a brush stroke does, faint dry-brush patches in the cream, and a hem cut
   along the same torn-paper wave the page sections use.

   It is drawn as SVG on a grid measured from the header. The header's
   height is 100 user units, and the slat width keeps the original CSS
   awning's clamp(19px, 1.9vw, 48px) at every viewport. Shapes come from a
   seeded random source, so the wobble is identical on every load and on
   the server and client. */

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./awning.module.css";

const CREAMS = ["#ece7dc", "#e9e4d8", "#e5e0d3"];
const INK = "#3a3531";
const PATCH = "#dfd9cb";
const EDGE = "rgba(120, 105, 85, 0.13)";
const HEM = "rgba(120, 105, 85, 0.16)";

/** Every fourth slat is ink. */
const isInk = (index: number) => index % 4 === 3;

type Pt = [number, number];
type Rand = () => number;

/** The grid in user units (header height = 100). W: strip width, S: slat
    width, R: the original's corner radius, which sets where the hem sits. */
type Geo = { W: number; S: number; R: number };

const clamp = (min: number, value: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Slat width and corner radius mirror the original awning's clamp()s. */
function measure(width: number, height: number, viewport: number): Geo {
  const vw = viewport / 100;
  const k = 100 / height;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    W: round(width * k),
    S: round(clamp(19, 1.9 * vw, 48) * k),
    R: round(clamp(8, 0.8 * vw, 20) * k),
  };
}

/** Drawn on the server and for the first client render, before the header
    has been measured: a 1440px viewport, where the header is 4.41vw tall. */
const FIRST_PAINT = measure(1440, 1440 * 0.0441, 1440);

/** mulberry32: tiny, deterministic, good enough for wobble. */
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
const closed = (pts: Pt[]) =>
  `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L")}Z`;
const open = (pts: Pt[]) =>
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

/** A brush patch: a stroke from `top` down to a slightly wavering `y`. */
function patch(r: Rand, x0: number, x1: number, y: number, top: number) {
  const lean = (r() - 0.5) * 2.6;
  const hem = line(
    r,
    [x0 + lean, y + (r() - 0.5) * 2],
    [x1 + lean, y + (r() - 0.5) * 2],
    6,
    1.4,
  );
  return closed([
    ...line(r, [x0, top], hem[0]),
    ...hem,
    ...line(r, hem[hem.length - 1], [x1, top]),
  ]);
}

/** The torn-paper section edge (WaveDivider's path, viewBox 1200 × 40), as
    the cubic segments after its starting point. */
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

/** The section wave stretched across the whole strip, as the section edges
    are across the page, its 40-unit height mapped into `depth` units
    starting at `top`. Left to right. */
function wave(W: number, top: number, depth: number): Pt[] {
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

function draw(g: Geo) {
  const r = seeded(231);
  // The hem sits where the original's scallops began to curve, less a
  // little so the wave's dips stay on the strip.
  const hemTop = 99.5 - Math.min(g.R, g.S / 2) - 12;
  const hem = wave(g.W, hemTop, 20);
  const last = hem[hem.length - 1];
  const outline = closed([[-10, -10], ...hem, [last[0], -10]]);

  // One wavering edge per slat boundary, run past the bottom; the slats are
  // trimmed along the hem, so every colour meets it flush. Neighbours share
  // an edge, so there are never gaps between slats.
  const edges: Pt[][] = [];
  for (let x = 0; x <= g.W + g.S; x += g.S) {
    const lean = (r() - 0.5) * 2.4;
    edges.push(line(r, [x - lean / 2, -10], [x + lean / 2, 110], 14, 1.8));
  }

  const slats: { d: string; fill: string }[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    slats.push({
      d: closed([...edges[i], ...[...edges[i + 1]].reverse()]),
      fill: isInk(i) ? INK : CREAMS[Math.floor(r() * 3)],
    });
  }

  // Faint dry-brush patches in about half the cream slats.
  const patches: string[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    if (isInk(i) || r() < 0.5) continue;
    const x0 = i * g.S;
    const a = x0 + g.S * (0.1 + r() * 0.3);
    const b = a + g.S * (0.3 + r() * 0.3);
    const top = r() < 0.5 ? -10 : 10 + r() * 30;
    patches.push(patch(r, a, b, 50 + r() * 30, top));
  }

  return {
    outline,
    slats,
    patches,
    edges: edges.map(open),
    hem: open(hem),
  };
}

export function Awning() {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo>(FIRST_PAINT);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fires once on observe, then on every header resize.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const next = measure(width, height, window.innerWidth);
      setGeo((prev) =>
        prev.W === next.W && prev.S === next.S && prev.R === next.R
          ? prev
          : next,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const art = useMemo(() => draw(geo), [geo]);

  return (
    <div ref={ref} aria-hidden="true" className={styles.awning}>
      <svg
        className={styles.art}
        viewBox={`0 0 ${geo.W} 100`}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="awning-hem">
            <path d={art.outline} />
          </clipPath>
          {/* Dry-brush patches: streaky noise as their opacity, edges
              wobbled a little. */}
          <filter id="awning-brush" x="-1%" y="-30%" width="102%" height="160%">
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
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.45"
              result="mask"
            />
            <feComposite
              in="SourceGraphic"
              in2="mask"
              operator="in"
              result="painted"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.03"
              numOctaves="3"
              seed="4"
              result="warp"
            />
            <feDisplacementMap
              in="painted"
              in2="warp"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <g clipPath="url(#awning-hem)">
          {art.slats.map((slat, i) => (
            <path key={i} d={slat.d} fill={slat.fill} />
          ))}
          <g fill={PATCH} filter="url(#awning-brush)">
            {art.patches.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {/* The shared edges, inked faintly so the waver reads between
              two cream slats. */}
          <g fill="none" stroke={EDGE} strokeWidth={1.2} strokeLinecap="round">
            {art.edges.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <path d={art.hem} fill="none" stroke={HEM} strokeWidth={1.6} />
        </g>
      </svg>
    </div>
  );
}
