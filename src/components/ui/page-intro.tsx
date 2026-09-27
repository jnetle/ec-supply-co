import { Eyebrow } from "./eyebrow";
import styles from "./page-intro.module.css";

type PageIntroProps = {
  eyebrow: string;
  eyebrowColor?: string;
  eyebrowInk?: string;
  title: string;
  lede: string;
};

export function PageIntro({
  eyebrow,
  eyebrowColor,
  eyebrowInk,
  title,
  lede,
}: PageIntroProps) {
  return (
    <section className={styles.intro}>
      <Eyebrow color={eyebrowColor} ink={eyebrowInk} className="mb-5">
        {eyebrow}
      </Eyebrow>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lede}>{lede}</p>
    </section>
  );
}
