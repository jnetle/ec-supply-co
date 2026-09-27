import { Fragment } from "react";

import styles from "./marquee.module.css";

const ITEMS = [
  "Retail",
  "Coffee",
  "Food Popups",
  "Tool Library",
  "Gathering Space",
  "Local Makers",
];

/** One pass of the list. Two are laid end to end so the loop is seamless. */
function Run({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={styles.run} aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <Fragment key={item}>
          <span>{item}</span>
          <span>·</span>
        </Fragment>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <>
      <div className={styles.strip}>
        <div className={styles.track}>
          <Run />
          <Run hidden />
        </div>
      </div>
      <div aria-hidden="true" className={styles.teeth} />
    </>
  );
}
