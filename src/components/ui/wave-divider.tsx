/**
 * The torn-paper edge between coloured bands. The design inlines this same
 * path 21 times; it differs only in fill and which edge it hangs from.
 * Render it inside a `position: relative` section.
 */

const WAVE =
  "M0,26 C88,4 158,32 252,18 C346,4 408,30 502,22 C596,14 660,38 758,25 C856,12 922,33 1016,19 C1096,7 1146,27 1200,12 L1200,40 L0,40 Z";

type WaveDividerProps = {
  /** Which edge of the parent section the wave hangs off. */
  edge: "top" | "bottom";
  /** Any CSS colour; pass the section's own background. */
  fill: string;
};

export function WaveDivider({ edge, fill }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 h-[clamp(14px,2.4vw,32px)]"
      style={edge === "top" ? { bottom: "100%" } : { top: "100%" }}
    >
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="block h-full w-full"
        style={{ transform: edge === "top" ? "scaleY(1)" : "scaleY(-1)" }}
      >
        <path d={WAVE} fill={fill} />
      </svg>
    </div>
  );
}
