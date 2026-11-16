import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import { ScrollEffects } from "@/components/ui/scroll-effects";
import { WavyClipPaths, wavyClip } from "@/components/ui/wavy-clip-paths";
import { VISIT_HREF } from "@/lib/content/nav";
import { HELPERS } from "@/lib/content/thanks";
import { SHOOTS, type SpacePhoto } from "@/lib/content/the-space";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/the-space/the-space-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "The space",
  description:
    "A look around El Cerrito Supply Co., from the front window to the charm bar.",
  path: "/the-space",
});

/** "2/3" → 0.667: a photo's width over its height. */
function aspect(photo: SpacePhoto) {
  const [w, h] = photo.ratio.split("/").map(Number);
  return w / h;
}

/**
 * One row of photos at a shared height. Each photo grows in proportion to its
 * shape, so every frame in the row comes out the same height.
 */
function Row({
  photos,
  start,
  eager,
}: {
  photos: SpacePhoto[];
  /** How many photos come before this row, to carry on the shape cycle. */
  start: number;
  eager: boolean;
}) {
  const total = photos.reduce((sum, photo) => sum + aspect(photo), 0);
  return (
    <div data-reveal className={styles.row}>
      {photos.map((photo, i) => (
        <BlobImage
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          // The clip path draws the shape; no corner rounding underneath.
          radius="0"
          ratio={photo.ratio}
          sizes={`(max-width: 760px) ${i === 0 || photos.length === 2 ? 100 : Math.round(100 / (photos.length - 1))}vw, ${Math.round((100 * aspect(photo)) / total)}vw`}
          parallax={false}
          eager={eager && i === 0}
          style={{ flexGrow: aspect(photo), ...wavyClip(start + i) }}
          className={styles.frame}
        />
      ))}
    </div>
  );
}

export default function TheSpacePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <WavyClipPaths />

        <PageIntro
          eyebrow="The space"
          eyebrowColor="var(--color-ecs-turquoise-dark)"
          eyebrowInk="#ffffff"
          title="Take a look around."
          lede="Photos of the space, from the front window to the charm bar. What’s on the shelves changes all the time, so come by and see what’s new."
        />

        {SHOOTS.map((shoot, shootIndex) => {
          const photographer = HELPERS.find(
            (helper) => helper.id === shoot.photographer,
          );
          return (
            <section
              key={shoot.id}
              id={shoot.id}
              className={styles.chapter}
              aria-label="Photos of the shop"
            >
              {photographer && (
                <p data-reveal className={styles.chapterMeta}>
                  Photos by{" "}
                  <Link href={`/the-build#${photographer.id}`}>
                    {photographer.name}
                  </Link>
                </p>
              )}

              {shoot.rows.map((photos, i) => (
                <Row
                  key={photos[0].src}
                  photos={photos}
                  start={shoot.rows.slice(0, i).flat().length}
                  // The newest shoot's first photo is the page's LCP.
                  eager={shootIndex === 0 && i === 0}
                />
              ))}
            </section>
          );
        })}

        <section
          data-reveal
          className={styles.visit}
          aria-labelledby="visit-heading"
        >
          <h2 id="visit-heading" className={styles.visitTitle}>
            Come see it in person.
          </h2>
          <div className={styles.actions}>
            <Link href={VISIT_HREF} className={button()}>
              Plan a visit →
            </Link>
            <Link href="/calendar" className={button({ variant: "outline" })}>
              See what’s on →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
      <ScrollEffects />
    </>
  );
}
