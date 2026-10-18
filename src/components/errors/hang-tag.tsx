import styles from "./error-scene.module.css";

/** The 404's illustration: a maker's hang tag, left behind once the piece sold. */
export function HangTag() {
  return (
    <div className={styles.tag}>
      <p className={styles.tagKicker}>Handmade in El Cerrito</p>
      <p className={styles.tagLabel}>One of a kind</p>
      <span className={styles.tagNumber}>No. 404</span>
      <p className={styles.tagLine}>
        Made by <span className={styles.tagHand}>a neighbor</span>
      </p>
      <p className={styles.tagLine}>
        Price <s className={styles.tagPrice}>$404</s>
      </p>
      <span className={styles.stamp}>Sold</span>
    </div>
  );
}
