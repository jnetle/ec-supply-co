import Link from "next/link";

import type { Helper } from "@/lib/content/thanks";

import styles from "./photo-credit.module.css";

type PhotoCreditProps = {
  helper: Helper;
  /**
   * "hover" tucks the credit away until the photo is hovered or the credit is
   * focused; "corner" keeps it faintly visible in the bottom-right corner, for
   * full-bleed photos where hovering means nothing.
   */
  variant?: "hover" | "corner";
  className?: string;
};

/** A small "Photo · Name" tag inside a photo, leading to their thank-you. */
export function PhotoCredit({
  helper,
  variant = "hover",
  className = "",
}: PhotoCreditProps) {
  return (
    <Link
      href={`/thanks#${helper.id}`}
      className={`${styles.credit} ${styles[variant]} ${className}`}
    >
      <span className={styles.label}>Photo</span> {helper.name}
    </Link>
  );
}
