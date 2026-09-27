import type { CSSProperties } from "react";

import styles from "./tag.module.css";

export function Tag({
  children,
  color,
  ink,
}: {
  children: React.ReactNode;
  color: string;
  ink: string;
}) {
  return (
    <span
      className={styles.tag}
      style={{ "--tag-bg": color, "--tag-fg": ink } as CSSProperties}
    >
      {children}
    </span>
  );
}
