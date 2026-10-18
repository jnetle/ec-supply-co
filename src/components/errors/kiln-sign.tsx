import styles from "./error-scene.module.css";

/** The error page's illustration: the sign on the kiln while a piece fires. */
export function KilnSign() {
  return (
    <div className={styles.hanger}>
      <span className={styles.nail} />
      <div className={styles.sign}>
        <span className={styles.signTitle}>Kiln firing</span>
        <div className={styles.dial}>
          <span className={styles.needle} />
          <span className={styles.dialPin} />
        </div>
        <p className={styles.signNote}>Do not open</p>
      </div>
    </div>
  );
}
