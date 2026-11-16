import type { CSSProperties } from "react";

import { SOFT_BLOB_PATHS } from "./photo-shapes";

/**
 * The wavy-edged photo outlines as SVG clip paths. Render once per page, then
 * give each photo frame `wavyClip(n)`, counting photos down the page, so
 * neighbours step through the shapes.
 */
export function WavyClipPaths() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      // In the page, but taking no space.
      style={{ position: "absolute" }}
    >
      <defs>
        {SOFT_BLOB_PATHS.map((d, i) => (
          <clipPath
            key={d}
            id={`wavy-photo-${i}`}
            clipPathUnits="objectBoundingBox"
          >
            <path d={d} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

/** The clip for the nth photo on the page. */
export function wavyClip(n: number): CSSProperties {
  return { clipPath: `url(#wavy-photo-${n % SOFT_BLOB_PATHS.length})` };
}
