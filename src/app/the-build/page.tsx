import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { PageIntro } from "@/components/ui/page-intro";
import { HELPERS, MADE_OF } from "@/lib/content/thanks";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/the-build/the-build-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "How we built it",
  description:
    "Where the shop's materials came from, and the photographers, builders and neighbors who helped put it together.",
  path: "/the-build",
});

/** Landscape masks for the "made of" photos, the home page's feature shapes. */
const PIECE_RADII = [
  "46% 54% 18% 22% / 38% 34% 8% 9%",
  "44% 56% 20% 20% / 40% 36% 8% 10%",
];

/** The same shape stood upright, for portrait photos; the arch stays shallow. */
const PORTRAIT_RADIUS = "48% 52% 20% 18% / 26% 28% 7% 8%";

/** A paired photo's masks: the portrait shape, then its mirror. */
const PAIR_RADII = [PORTRAIT_RADIUS, "52% 48% 18% 20% / 28% 26% 8% 7%"];

/** Card fills, rotated so neighbours never match; the manifesto's palette. */
const CARD_COLORS = [
  { background: "var(--color-ecs-surface)", accent: "var(--color-ecs-teal)" },
  { background: "var(--color-ecs-teal-pale)", accent: "var(--color-ecs-teal-deep)" },
  // Teal focus rings drop under 3:1 on the pink card.
  {
    background: "var(--color-ecs-pink)",
    accent: "var(--color-ecs-pink-deep)",
    ring: "var(--color-ecs-ink)",
  },
];

export default function TheBuildPage() {
  return (
    <>
      <SiteHeader />

      <main>
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

          <div className={styles.pieces}>
            {MADE_OF.map((entry, i) => {
              const colors = CARD_COLORS[i % CARD_COLORS.length];
              const helpers = entry.helpers.flatMap((id) => {
                const helper = HELPERS.find((h) => h.id === id);
                return helper ? [helper] : [];
              });
              return (
                <article
                  key={entry.id}
                  id={entry.id}
                  className={`${styles.piece} ${entry.photo?.portrait ? styles.portrait : ""} ${entry.photo?.compact ? styles.compact : ""} ${entry.photo?.pair ? styles.paired : ""}`}
                  style={
                    {
                      "--card-bg": colors.background,
                      "--card-accent": colors.accent,
                      "--ecs-focus-ring": colors.ring,
                    } as CSSProperties
                  }
                >
                  {entry.photo?.pair ? (
                    <div className={`${styles.piecePhoto} ${styles.photoPair}`}>
                      {[entry.photo, entry.photo.pair].map((photo, j) => (
                        <BlobImage
                          key={photo.src}
                          src={photo.src}
                          alt={photo.alt}
                          radius={PAIR_RADII[j]}
                          ratio="2/3"
                          parallax={false}
                          sizes="(max-width: 1099px) 46vw, 340px"
                        />
                      ))}
                    </div>
                  ) : (
                    <BlobImage
                      src={entry.photo?.src}
                      alt={entry.photo?.alt ?? ""}
                      radius={
                        entry.photo?.portrait
                          ? PORTRAIT_RADIUS
                          : PIECE_RADII[i % PIECE_RADII.length]
                      }
                      ratio={entry.photo?.portrait ? "2/3" : "4/3"}
                      // Parallax overscales the photo, which would crop the
                      // very edges a portrait frame exists to show.
                      parallax={!entry.photo?.portrait}
                      sizes={
                        entry.photo?.portrait
                          ? "(max-width: 760px) 92vw, (max-width: 1099px) 46vw, 340px"
                          : "(max-width: 760px) 92vw, 760px"
                      }
                      eager={i === 0}
                      className={styles.piecePhoto}
                    />
                  )}
                  <div className={styles.pieceText}>
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
                  </div>
                </article>
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
      </main>

      <SiteFooter />
    </>
  );
}
