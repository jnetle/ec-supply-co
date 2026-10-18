import styles from "./error-scene.module.css";

/** The error page's illustration: the sign that goes up while a shelf is restocked. */
export function RestockSign() {
  return (
    <div className={styles.hanger}>
      <span className={styles.nail} />
      <div className={styles.sign}>
        <span className={styles.signTitle}>Restocking</span>
        <div className={styles.crate}>
          <span className={`${styles.crateItem} ${styles.crateTall}`} />
          <span className={`${styles.crateItem} ${styles.crateRound}`} />
          <span className={`${styles.crateItem} ${styles.crateShort}`} />
        </div>
        <p className={styles.signNote}>Back in a moment</p>
      </div>
    </div>
  );
}
