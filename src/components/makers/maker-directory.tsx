import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { WaveDivider } from "@/components/ui/wave-divider";
import {
  MAKER_RADII,
  makerByline,
  makerMorphDelay,
  type Maker,
} from "@/lib/content/makers";

import styles from "./maker-directory.module.css";

export function MakerDirectory({ makers }: { makers: Maker[] }) {
  return (
    <section id="directory" className={styles.section}>
      <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
      <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />

      <div className={styles.grid}>
        {makers.map((maker, i) => (
          <article key={maker.id} className={styles.card}>
            <BlobImage
              src={maker.photo?.src}
              alt={maker.photo?.alt ?? ""}
              radius={MAKER_RADII[i % MAKER_RADII.length]}
              ratio="1/1"
              sizes="(max-width: 700px) 50vw, 210px"
              parallax={false}
              morphing
              delay={makerMorphDelay(i)}
            />
            <h2 className={styles.name}>
              {maker.website ? (
                <a
                  href={maker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.nameLink}
                >
                  {/* The no-break space keeps the badge on the name's last line. */}
                  {maker.name}&nbsp;
                  <span className={styles.linkBadge}>
                    <LinkIcon size="0.62em" />
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                maker.name
              )}
            </h2>
            {maker.makerName && <div className={styles.maker}>{maker.makerName}</div>}
            <div className={styles.craft}>{makerByline(maker)}</div>
            <p className={styles.bio}>{maker.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
