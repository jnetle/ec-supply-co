import styles from "./error-scene.module.css";

/** The error page's illustration: the glass sign that goes up while a shelf is restocked. */
export function RestockSign() {
  return (
    <div className={styles.hanger}>
      <div className={`film ${styles.pane}`}>
        <span className={styles.cable} data-side="left" />
        <span className={styles.cable} data-side="right" />
        <span className={styles.fitting} data-side="left" />
        <span className={styles.fitting} data-side="right" />
        <span className={styles.paneTitle}>Restocking</span>
        <span className={styles.paneRule} />
        <p className={styles.paneNote}>Back in a moment</p>
      </div>
    </div>
  );
}
