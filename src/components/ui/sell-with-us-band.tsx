import Link from "next/link";

import styles from "./sell-with-us-band.module.css";

/** The recruitment banner that closes the makers directory. */
export function SellWithUsBand() {
  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.copy}>
          <div className={styles.title}>Make something good?</div>
          <div className={styles.note}>
            We review maker submissions in rounds throughout the year.
          </div>
        </div>
        <Link href="/sell-with-us" className={styles.button}>
          Sell with us →
        </Link>
      </div>
    </section>
  );
}
