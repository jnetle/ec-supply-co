import Link from "next/link";

import { Blob } from "@/components/ui/blob";
import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WaveDivider } from "@/components/ui/wave-divider";
import {
  MAKERS,
  MAKER_RADII,
  SPOTLIGHT_MAKERS,
  makerMorphDelay,
  makerPhoto,
} from "@/lib/content/makers";

import styles from "./maker-spotlight.module.css";

export function MakerSpotlight() {
  return (
    <section id="makers" className={styles.section}>
      <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
      <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />
      <Blob
        color="rgba(4,128,143,0.16)"
        parallax={0.14}
        delay="1.2s"
        style={{
          right: "-4%",
          bottom: "-6%",
          width: "clamp(120px,14vw,220px)",
          height: "clamp(120px,14vw,220px)",
        }}
      />

      <div className={styles.header}>
        <div>
          <Eyebrow
            color="var(--color-ecs-pink-deep)"
            ink="#ffffff"
            className="mb-[18px]"
          >
            Maker spotlight
          </Eyebrow>
          <h2 className={styles.heading}>Who made it</h2>
        </div>

        <Link href="/makers" className={styles.allLink}>
          Meet all {MAKERS.length} makers →
        </Link>
      </div>

      <div className={styles.grid}>
        {SPOTLIGHT_MAKERS.map((maker, i) => (
          <article key={maker.name} className={styles.card}>
            <BlobImage
              src={makerPhoto(maker, 700)}
              alt={`Portrait of ${maker.name}`}
              radius={MAKER_RADII[i % MAKER_RADII.length]}
              ratio="1/1"
              sizes="(max-width: 700px) 100vw, 230px"
              parallax={false}
              morphing
              delay={makerMorphDelay(i)}
            />
            <h3 className={styles.name}>{maker.name}</h3>
            <div className={styles.craft}>
              {maker.craft} · since {maker.since}
            </div>
            <p className={styles.bio}>{maker.bio}</p>
          </article>
        ))}
      </div>

      <div data-reveal className={styles.cta}>
        <div className="grid gap-1.5">
          <div className={styles.ctaTitle}>Make something good?</div>
          <div className={styles.ctaNote}>
            We review maker submissions in rounds throughout the year.
          </div>
        </div>
        <Link href="/sell-with-us" className={styles.ctaButton}>
          Sell with us →
        </Link>
      </div>
    </section>
  );
}
