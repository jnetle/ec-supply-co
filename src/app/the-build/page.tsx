import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";
import { LinkIcon } from "@/components/ui/link-icon";
import { PageIntro } from "@/components/ui/page-intro";
import { WavyClipPaths, wavyClip } from "@/components/ui/wavy-clip-paths";
import { HELPERS, MADE_OF, type MadeOfPhoto } from "@/lib/content/thanks";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/the-build/the-build-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How we built it",
  description:
    "Where the shop's materials came from, and the photographers, builders and neighbors who helped put it together.",
  path: "/the-build",
});

/** "4/3" → 1.333: a photo's width over its height. */
function aspect(photo: MadeOfPhoto) {
  const [w, h] = photo.ratio.split("/").map(Number);
  return w / h;
}

/** How many photos come before each row, so the outlines keep cycling. */
const PHOTOS_BEFORE_ROW = MADE_OF.map((_, r) =>
  MADE_OF.slice(0, r)
    .flat()
    .reduce((count, entry) => count + entry.photos.length, 0),
);

export default function TheBuildPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <WavyClipPaths />

        <PageIntro
          eyebrow="Thank you"
          eyebrowColor="var(--color-ecs-red)"
          eyebrowInk="#ffffff"
          title="A lot of hands built this shop."
          lede="Before there was anything on the shelves, there were neighbors with cameras, saws and paintbrushes who showed up anyway, and wood and fixtures with a past of their own. Here’s some of where it all came from."
        />

        <section className={styles.madeOf} aria-labelledby="made-of-heading">
          <h2 id="made-of-heading" className={styles.sectionTitle}>
            What the shop is made of
          </h2>

          <div className={styles.rows}>
            {MADE_OF.map((row, r) => {
              const rowAspect = row
                .flat()
                .reduce(
                  (sum, entry) =>
                    sum +
                    entry.photos.reduce((n, photo) => n + aspect(photo), 0),
                  0,
                );
              let photoIndex = PHOTOS_BEFORE_ROW[r];
              return (
                <div key={row[0].id} className={styles.row}>
                  {row.map((entry) => {
                    const entryAspect = entry.photos.reduce(
                      (n, photo) => n + aspect(photo),
                      0,
                    );
                    const helpers = entry.helpers.flatMap((id) => {
                      const helper = HELPERS.find((h) => h.id === id);
                      return helper ? [helper] : [];
                    });
                    return (
                      <article
                        key={entry.id}
                        id={entry.id}
                        className={styles.entry}
                        // Grows by its photos' combined shape, plus the gap
                        // between a pair, so every photo in the row comes out
                        // the same height.
                        style={
                          {
                            "--grow": entryAspect,
                            "--basis": `calc(var(--gap) * ${entry.photos.length - 1})`,
                          } as CSSProperties
                        }
                      >
                        <div className={styles.entryPhotos}>
                          {entry.photos.map((photo) => {
                            const n = photoIndex++;
                            return (
                              <BlobImage
                                key={photo.src}
                                src={photo.src}
                                alt={photo.alt}
                                // The clip path draws the shape.
                                radius="0"
                                ratio={photo.ratio}
                                parallax={false}
                                eager={n === 0}
                                sizes={`(max-width: 760px) ${Math.round(100 / entry.photos.length)}vw, ${Math.round((100 * aspect(photo)) / rowAspect)}vw`}
                                className={styles.frame}
                                style={{
                                  // Shares that add up to 1, so a lone photo fills its entry.
                                  flexGrow: aspect(photo) / entryAspect,
                                  ...wavyClip(n),
                                }}
                              />
                            );
                          })}
                        </div>
                        <h3 className={styles.name}>{entry.name}</h3>
                        <p className={styles.note}>{entry.provenance}</p>
                        {helpers.length > 0 && (
                          <p className={styles.credit}>
                            {entry.creditedAs}{" "}
                            {helpers.map((helper, j) => (
                              <span key={helper.id}>
                                {j > 0 &&
                                  (j === helpers.length - 1 ? " and " : ", ")}
                                <a href={`#${helper.id}`}>{helper.name}</a>
                              </span>
                            ))}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.helpers} aria-labelledby="helpers-heading">
          <h2 id="helpers-heading" className={styles.sectionTitle}>
            Who helped
          </h2>

          <ul className={styles.helperList}>
            {HELPERS.map((helper) => (
              <li key={helper.id} id={helper.id} className={styles.helper}>
                {helper.link ? (
                  <a
                    href={helper.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.helperName}
                  >
                    {helper.name}
                    <LinkIcon size="0.8em" />
                    <span className="sr-only">
                      {" "}
                      ({helper.link.label}, opens in a new tab)
                    </span>
                  </a>
                ) : (
                  <span className={styles.helperName}>{helper.name}</span>
                )}
                <span className={styles.helperRole}>{helper.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.finished} aria-labelledby="finished-heading">
          <h2 id="finished-heading" className={styles.sectionTitle}>
            And here&rsquo;s how it turned out
          </h2>
          <Link
            href="/the-space"
            className={button({
              variant: "outline",
              className: styles.finishedLink,
            })}
          >
            See the space →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
