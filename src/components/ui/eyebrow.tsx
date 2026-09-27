import type { CSSProperties } from "react";

import styles from "./eyebrow.module.css";

type EyebrowProps = {
  children: React.ReactNode;
  /** Pill fill. */
  color?: string;
  /** Text colour against `color`. */
  ink?: string;
  /** Hand-cut corners; every band varies them slightly. */
  radius?: string;
  className?: string;
};

export function Eyebrow({
  children,
  color = "#c23a21",
  ink = "#ffffff",
  radius = "16px 8px 14px 7px",
  className = "",
}: EyebrowProps) {
  return (
    <div
      className={`${styles.eyebrow} ${className}`}
      style={
        {
          "--eyebrow-bg": color,
          "--eyebrow-fg": ink,
          "--eyebrow-radius": radius,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
