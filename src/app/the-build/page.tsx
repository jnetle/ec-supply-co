import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { HELPERS, MADE_OF } from "@/lib/content/thanks";
import { pageMetadata, SITE_EMAIL } from "@/lib/site";

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

/** Card fills, rotated so neighbours never match; the manifesto's palette. */
const CARD_COLORS = [
  { background: "var(--color-ecs-surface)", accent: "var(--color-ecs-teal)" },
  { background: "var(--color-ecs-teal-pale)", accent: "var(--color-ecs-teal-deep)" },
  { background: "var(--color-ecs-pink)", accent: "var(--color-ecs-pink-deep)" },
];

export default function TheBuildPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header className={styles.header}>
          <div className={styles.kicker}>Thank you</div>
          <h1 className={styles.title}>A lot of hands built this shop.</h1>
          <p className={styles.lede}>
            Before there was anything on the shelves, there were neighbors with
            cameras, saws and paintbrushes who showed up anyway, and wood and
            fixtures with a past of their own. Here&rsquo;s some of where it
            all came from.
          </p>
        </header>

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
                  className={styles.piece}
                  style={
                    {
                      "--card-bg": colors.background,
                      "--card-accent": colors.accent,
                    } as CSSProperties
                  }
                >
                  <BlobImage
                    src={entry.photo?.src}
                    alt={entry.photo?.alt ?? ""}
                    radius={PIECE_RADII[i % PIECE_RADII.length]}
                    ratio="4/3"
                    sizes="(max-width: 700px) 92vw, 720px"
                    className={styles.piecePhoto}
                  />
                  <div className={styles.pieceText}>
                    <h3 className={styles.name}>{entry.name}</h3>
                    <p className={styles.note}>{entry.provenance}</p>
                    {helpers.length > 0 && (
                      <p className={styles.via}>
                        via{" "}
                        {helpers.map((helper, j) => (
                          <span key={helper.id}>
                            {j > 0 && (j === helpers.length - 1 ? " and " : ", ")}
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

        <section className={styles.band}>
          <p className={styles.bandLine}>
            Took a photo of the shop, or lent a hand?{" "}
            <a href={`mailto:${SITE_EMAIL}`} className={styles.bandLink}>
              Tell us
            </a>{" "}
            and we&rsquo;ll add you.
          </p>

          <div className={styles.actions}>
            <Link
              href="/makers"
              className={styles.action}
              style={
                {
                  "--action-bg": "var(--color-ecs-marigold)",
                  "--action-fg": "#22201c",
                } as CSSProperties
              }
            >
              Meet the makers
            </Link>
            <Link
              href="/sell-with-us"
              className={styles.action}
              style={
                {
                  "--action-bg": "var(--color-ecs-pink)",
                  "--action-fg": "#4a1f30",
                } as CSSProperties
              }
            >
              Sell with us
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
