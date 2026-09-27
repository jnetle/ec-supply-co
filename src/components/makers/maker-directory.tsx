import { BlobImage } from "@/components/ui/blob-image";
import { WaveDivider } from "@/components/ui/wave-divider";
import {
  MAKERS,
  MAKER_RADII,
  makerMorphDelay,
  makerPhoto,
} from "@/lib/content/makers";

import styles from "./maker-directory.module.css";

export function MakerDirectory() {
  return (
    <section id="directory" className={styles.section}>
      <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
      <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />

      <div className={styles.grid}>
        {MAKERS.map((maker, i) => (
          <article key={maker.name} className={styles.card}>
            <BlobImage
              src={makerPhoto(maker, 600)}
              alt={`Portrait of ${maker.name}`}
              radius={MAKER_RADII[i % MAKER_RADII.length]}
              ratio="1/1"
              sizes="(max-width: 700px) 50vw, 210px"
              parallax={false}
              morphing
              delay={makerMorphDelay(i)}
            />
            <h2 className={styles.name}>{maker.name}</h2>
            <div className={styles.craft}>
              {maker.craft} · since {maker.since}
            </div>
            <p className={styles.bio}>{maker.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
