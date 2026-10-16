import type { CSSProperties } from "react";

import styles from "./button.module.css";

export type ButtonVariant = "solid" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTone =
  | "teal"
  | "tealDeep"
  | "magenta"
  | "plum"
  | "marigold"
  | "red"
  | "navy"
  | "ink"
  | "ply"
  | "paper"
  /** Colours come from `buttonColors()` on the element's style. */
  | "custom";

type ButtonOptions = {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Round, single glyph or icon. The element needs an aria-label. */
  icon?: boolean;
  /** Layout only: margin, alignment, width. Never colour or shape. */
  className?: string;
};

/**
 * The class list for anything that looks like a button, whatever the
 * element: <button>, <a>, <Link> or a Radix trigger. See button.module.css
 * for what each option means.
 */
export function button({
  variant = "solid",
  tone = "teal",
  size = "md",
  icon = false,
  className,
}: ButtonOptions = {}) {
  return [
    styles.button,
    styles[variant],
    styles[size],
    tone !== "custom" && styles[tone],
    icon && styles.icon,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Inline colours for `tone: "custom"`, when the colour comes from data. */
export function buttonColors(color: string, on: string) {
  return { "--btn-color": color, "--btn-on": on } as CSSProperties;
}
