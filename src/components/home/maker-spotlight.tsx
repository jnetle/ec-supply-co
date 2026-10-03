import Link from "next/link";

import { Blob } from "@/components/ui/blob";
import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WaveDivider } from "@/components/ui/wave-divider";
import { MAKER_RADII, makerByline, makerMorphDelay } from "@/lib/content/makers";
import { getMakers, getSpotlightMakers } from "@/lib/makers";

import styles from "./maker-spotlight.module.css";

export async function MakerSpotlight() {
  const [makers, spotlight] = await Promise.all([getMakers(), getSpotlightMakers()]);

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
          Meet all {makers.length} makers →
        </Link>
      </div>

      <div className={styles.grid}>
        {spotlight.map((maker, i) => (
          <article key={maker.id} className={styles.card}>
            <BlobImage
              src={maker.photo?.src}
              alt={maker.photo?.alt ?? ""}
              radius={MAKER_RADII[i % MAKER_RADII.length]}
              ratio="1/1"
              sizes="(max-width: 700px) 100vw, 230px"
              parallax={false}
              morphing
              delay={makerMorphDelay(i)}
            />
            <h3 className={styles.name}>
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
            </h3>
            {maker.makerName && <div className={styles.maker}>{maker.makerName}</div>}
            <div className={styles.craft}>{makerByline(maker)}</div>
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
