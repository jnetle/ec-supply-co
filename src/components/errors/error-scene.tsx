import { Eyebrow } from "@/components/ui/eyebrow";

import styles from "./error-scene.module.css";

type ErrorSceneProps = {
  eyebrow: string;
  eyebrowColor: string;
  eyebrowInk: string;
  title: string;
  lede: string;
  /** The button group, built with `button()`. */
  actions: React.ReactNode;
  /** The illustration beside the copy: decorative, so it's hidden from AT. */
  art: React.ReactNode;
  /** Small print under the actions, such as an error reference. */
  footnote?: React.ReactNode;
  /** Anything that follows the copy, such as a maker to meet. */
  children?: React.ReactNode;
};

/**
 * The shared body of the 404 and error pages: the interior-page intro
 * (label, headline, lede) with its actions, and a bit of maker ephemera
 * hung beside it.
 */
export function ErrorScene({
  eyebrow,
  eyebrowColor,
  eyebrowInk,
  title,
  lede,
  actions,
  art,
  footnote,
  children,
}: ErrorSceneProps) {
  return (
    <section className={styles.scene}>
      <div className={styles.copy}>
        <Eyebrow color={eyebrowColor} ink={eyebrowInk} className="mb-5">
          {eyebrow}
        </Eyebrow>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{lede}</p>
        <div className={styles.actions}>{actions}</div>
        {footnote && <p className={styles.footnote}>{footnote}</p>}
        {children}
      </div>
      <div aria-hidden="true" className={styles.art}>
        {art}
      </div>
    </section>
  );
}
