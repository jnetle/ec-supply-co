import { Fragment } from "react";

/**
 * The logo's extrusion as an SVG filter: the letters are pushed back toward
 * the lower left, with left-facing sides in salmon and bottom-facing sides
 * in orange, split where an edge faces straight down-left.
 *
 * A text-shadow stack can only repeat one colour per offset, so it can't
 * tell a left side from a bottom one and leaves hatching across the curves.
 * Instead the filter finds the left-facing edges (outside the glyph, with
 * glyph both up-right and down-right of them), sweeps them back along the
 * extrusion in salmon, and lays that over the whole extrusion in orange.
 * Other pairs of colours can stand in for salmon and orange.
 *
 * Offsets are in the element's own CSS pixels, so `depth` has to follow
 * the font size; the hero passes it in from the measured headline.
 */
export const LOGO_EXTRUDE_FILTER_ID = "ecs-logo-extrude";

type LogoExtrudeFilterProps = {
  depth: number;
  id?: string;
  /** The left-facing sides: the paler of the two. */
  side?: string;
  /** The bottom-facing sides. */
  bottom?: string;
};

/** The logo's depth, as a share of the font size. */
export const LOGO_EXTRUDE_DEPTH_EM = 0.1;

/** Doubling offsets that together cover every whole pixel from 0 to depth. */
function sweepSteps(depth: number) {
  const steps: number[] = [];
  let reach = 0;
  while (reach < depth) {
    const step = Math.min(reach + 1, depth - reach);
    steps.push(step);
    reach += step;
  }
  return steps;
}

function Sweep({ from, name, steps }: { from: string; name: string; steps: number[] }) {
  return steps.map((step, i) => {
    const prev = i === 0 ? from : `${name}${i - 1}`;
    return (
      <Fragment key={i}>
        <feOffset in={prev} dx={-step} dy={step} result={`${name}Shift${i}`} />
        <feMerge result={`${name}${i}`}>
          <feMergeNode in={prev} />
          <feMergeNode in={`${name}Shift${i}`} />
        </feMerge>
      </Fragment>
    );
  });
}

export function LogoExtrudeFilter({
  depth,
  id = LOGO_EXTRUDE_FILTER_ID,
  side = "var(--color-ecs-logo-salmon)",
  bottom = "var(--color-ecs-logo-orange)",
}: LogoExtrudeFilterProps) {
  const steps = sweepSteps(Math.max(1, Math.round(depth)));
  const last = steps.length - 1;

  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <filter
        id={id}
        x="-20%"
        y="-20%"
        width="140%"
        height="150%"
        colorInterpolationFilters="sRGB"
      >
        {/* Left-facing edges: just outside the glyph, with glyph 2px to the
            up-right and to the down-right. The soft pixels along curves
            only half-pass that test; snapping the band to fully on or off
            at half keeps them from leaving salmon slivers along bottom
            faces, and makes the salmon/orange split a hard line. Widened a
            pixel so the sweep stays solid across tight curves. */}
        <feOffset in="SourceAlpha" dx={-2} dy={-2} result="upLeft" />
        <feOffset in="SourceAlpha" dx={-2} dy={2} result="downLeft" />
        <feComposite in="upLeft" in2="downLeft" operator="in" result="leftInner" />
        <feComposite in="leftInner" in2="SourceAlpha" operator="out" result="leftEdge" />
        <feComponentTransfer in="leftEdge" result="leftHard">
          <feFuncA type="discrete" tableValues="0 1" />
        </feComponentTransfer>
        <feMorphology in="leftHard" operator="dilate" radius={1} result="leftBand" />

        <Sweep from="SourceAlpha" name="all" steps={steps} />
        <Sweep from="leftBand" name="left" steps={steps} />

        <feFlood style={{ floodColor: bottom }} result="orangeFill" />
        <feComposite in="orangeFill" in2={`all${last}`} operator="in" result="orange" />
        {/* Clipped to the whole extrusion, so the outer edge stays smooth. */}
        <feComposite in={`left${last}`} in2={`all${last}`} operator="in" result="leftMask" />
        <feFlood style={{ floodColor: side }} result="salmonFill" />
        <feComposite in="salmonFill" in2="leftMask" operator="in" result="salmon" />

        <feMerge>
          <feMergeNode in="orange" />
          <feMergeNode in="salmon" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
}
