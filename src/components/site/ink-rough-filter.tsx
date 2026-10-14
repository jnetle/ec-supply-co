/**
 * Roughens the edges of the large mixed-case headlines so they sit with the
 * Grit Thick titles: low-frequency noise nudges each edge by about half a
 * pixel. Only for large type; on small text it reads as wobble, not wear.
 * Rendered once in the root layout; headings opt in with
 * `filter: url(#ink-rough)`.
 */
export function InkRoughFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="ink-rough" x="-5%" y="-15%" width="110%" height="130%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.09"
          numOctaves={2}
          seed={3}
        />
        <feDisplacementMap
          in="SourceGraphic"
          scale={1.25}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
