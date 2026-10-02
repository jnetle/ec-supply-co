"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  awningStore,
  hangStore,
  isCssVariant,
  isHanging,
} from "./awning-lab/store";
import labStyles from "./awning-lab/awning-lab.module.css";
import { PaintedAwning } from "./awning-lab/variants";
import styles from "./awning.module.css";

/** Stripes needed to span the widest supported viewport at the max stripe width. */
const STRIPE_COUNT = 104;

/** Every fourth stripe is ink. The design hand-writes all 104 of these. */
const isInk = (index: number) => index % 4 === 3;

export function Awning() {
  // TEMPORARY: awning-lab preview. Remove with the awning-lab folder.
  const variant = useSyncExternalStore(
    awningStore.subscribe,
    awningStore.getSnapshot,
    awningStore.getServerSnapshot,
  );
  const hang = isHanging(
    variant,
    useSyncExternalStore(
      hangStore.subscribe,
      hangStore.getSnapshot,
      hangStore.getServerSnapshot,
    ),
  );
  // Lets header CSS restyle the nav for variants that need it.
  useEffect(() => {
    const root = document.documentElement.dataset;
    root.awning = variant;
    root.awningLayout = hang ? "hanging" : "";
  }, [variant, hang]);
  if (!isCssVariant(variant)) {
    return <PaintedAwning variant={variant} hanging={hang} />;
  }
  const lab = {
    current: "",
    subtle: `${labStyles.subtle} ${labStyles.shadow}`,
    "subtle-flat": `${labStyles.subtle} ${labStyles.flat} ${labStyles.shadow}`,
    glass: `${labStyles.glass} ${labStyles.flat}`,
    "subtle-frost": `${labStyles.glass} ${labStyles.frost70} ${labStyles.flat}`,
    retro: `${labStyles.retro} ${labStyles.flat} ${labStyles.shadow}`,
    "subtle-mono": `${labStyles.subtle} ${labStyles.mono} ${labStyles.flat} ${labStyles.shadow}`,
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`${styles.awning} ${lab} ${hang ? labStyles.hang : ""}`}
    >
      {Array.from({ length: STRIPE_COUNT }, (_, i) => (
        <div
          key={i}
          className={`${styles.stripe} ${isInk(i) ? styles.stripeInk : ""}`}
        />
      ))}
    </div>
  );
}
