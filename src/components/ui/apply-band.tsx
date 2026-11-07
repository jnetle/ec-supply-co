import Link from "next/link";

import { button } from "./button";
import styles from "./apply-band.module.css";

type ApplyBandProps = {
  title: string;
  note: string;
  /** The application this band recruits for. */
  href: string;
  label: string;
  /** The other application, for visitors who landed on the wrong one. */
  other?: { href: string; label: string };
  /** Panel fill. Dark enough for white text, so the buttons use paper. */
  background: string;
};

/** The panel itself: copy, one headline action, an optional quiet link. */
function ApplyPanel({
  title,
  note,
  href,
  label,
  other,
  background,
  compact = false,
  reveal = true,
}: ApplyBandProps & { compact?: boolean; reveal?: boolean }) {
  return (
    <div
      data-reveal={reveal || undefined}
      className={`${styles.panel} ${compact ? styles.compact : ""}`}
      style={{ background }}
    >
      <div className={styles.copy}>
        <div className={styles.title}>{title}</div>
        <div className={styles.note}>{note}</div>
      </div>
      <div className={styles.actions}>
        <Link
          href={href}
          className={button({ tone: "marigold", size: compact ? "md" : "lg" })}
        >
          {label}
        </Link>
        {other && (
          <Link
            href={other.href}
            className={button({ variant: "link", tone: "paper" })}
          >
            {other.label}
          </Link>
        )}
      </div>
    </div>
  );
}

/** A full-width recruitment band, on a page of its own. */
function ApplyBand(props: ApplyBandProps) {
  return (
    <section className={styles.section}>
      <ApplyPanel {...props} />
    </section>
  );
}

/** Closes the makers directory. */
export function SellWithUsBand() {
  return (
    <ApplyBand
      title="Make something good?"
      note="We review maker submissions in rounds throughout the year."
      href="/sell-with-us"
      label="Sell with us →"
      other={{ href: "/popup-with-us", label: "Got a food popup? →" }}
      background="var(--color-ecs-teal-deep)"
    />
  );
}

/** Closes the calendar. */
export function PopupWithUsBand() {
  return (
    <ApplyBand
      title="Got a menu people line up for?"
      note="Our sidewalk is open to food and drink popups. Apply online and we’ll reach out about dates."
      href="/popup-with-us"
      label="Pop up with us →"
      other={{ href: "/sell-with-us", label: "Make goods, not food? →" }}
      background="var(--color-ecs-cobalt)"
    />
  );
}

/**
 * The same pitch, sized to sit in the home "Popup vendors" band's copy
 * column. The band's copy already reveals, so the panel doesn't again.
 */
export function PopupVendorsCallout() {
  return (
    <ApplyPanel
      title="Run a food popup?"
      note="Our sidewalk is open to food and drink vendors. Apply online and we’ll reach out about dates."
      href="/popup-with-us"
      label="Pop up with us →"
      background="var(--color-ecs-teal-deep)"
      compact
      reveal={false}
    />
  );
}
