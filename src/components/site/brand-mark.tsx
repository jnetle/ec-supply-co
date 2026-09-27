/**
 * The painted-window logotype: "EL CERRITO" arced over "SUPPLY CO.", whose
 * extrude is faked with nine vermilion copies stepped up and to the right
 * under a cream face. Offsets come straight from the design.
 */

const EXTRUDE_LAYERS = 9;
const EXTRUDE_STEP = 1.1;
const EXTRUDE_ORIGIN = { x: 290.1, y: 181.9 };
const FACE = { x: 300, y: 172 };

const ARC_ID = "ecs-brand-arc";

export function BrandMark() {
  return (
    <svg
      viewBox="0 0 600 196"
      role="img"
      aria-label="El Cerrito Supply Co."
      className="block h-full w-auto overflow-visible"
    >
      <path id={ARC_ID} d="M150 66 Q300 22 450 66" fill="none" />
      <text
        fontFamily="var(--font-heading)"
        fontWeight="500"
        fontSize="40"
        letterSpacing="5"
        fill="#f0a520"
      >
        <textPath href={`#${ARC_ID}`} startOffset="50%" textAnchor="middle">
          EL CERRITO
        </textPath>
      </text>

      <g
        fontFamily="var(--font-heading)"
        fontWeight="700"
        fontSize="120"
        textAnchor="middle"
      >
        {Array.from({ length: EXTRUDE_LAYERS }, (_, i) => (
          <text
            key={i}
            x={EXTRUDE_ORIGIN.x + i * EXTRUDE_STEP}
            y={EXTRUDE_ORIGIN.y - i * EXTRUDE_STEP}
            textLength="556"
            lengthAdjust="spacingAndGlyphs"
            fill="#f4562a"
            /* Only the deepest layer is outlined; it reads as the cast edge. */
            stroke={i === 0 ? "rgba(0,0,0,0.28)" : undefined}
            strokeWidth={i === 0 ? 2 : undefined}
            strokeLinejoin={i === 0 ? "round" : undefined}
          >
            SUPPLY CO.
          </text>
        ))}
        <text
          x={FACE.x}
          y={FACE.y}
          textLength="556"
          lengthAdjust="spacingAndGlyphs"
          fill="#fbf3e3"
        >
          SUPPLY CO.
        </text>
      </g>
    </svg>
  );
}
