import styles from "./awning.module.css";

/** Stripes needed to span the widest supported viewport at the max stripe width. */
const STRIPE_COUNT = 104;

/** Every fourth stripe is ink. The design hand-writes all 104 of these. */
const isInk = (index: number) => index % 4 === 3;

export function Awning() {
  return (
    <div aria-hidden="true" className={styles.awning}>
      {Array.from({ length: STRIPE_COUNT }, (_, i) => (
        <div
          key={i}
          className={`${styles.stripe} ${isInk(i) ? styles.stripeInk : ""}`}
        />
      ))}
    </div>
  );
}
