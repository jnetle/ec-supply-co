import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { MAKER_RADII, makerMorphDelay } from "@/lib/content/makers";
import { HELPERS } from "@/lib/content/thanks";
import { pageMetadata, SITE_EMAIL } from "@/lib/site";

import styles from "@/components/thanks/thanks-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Thanks",
  description:
    "The photographers, builders and neighbors who helped put the shop together.",
  path: "/thanks",
});

/** Card fills, rotated so neighbours never match; the manifesto's palette. */
const CARD_COLORS = [
  { background: "var(--color-ecs-surface)", accent: "var(--color-ecs-teal)" },
  { background: "var(--color-ecs-teal-pale)", accent: "var(--color-ecs-teal-deep)" },
  { background: "var(--color-ecs-pink)", accent: "var(--color-ecs-pink-deep)" },
];

export default function ThanksPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header className={styles.header}>
          <div className={styles.kicker}>Thank you</div>
          <h1 className={styles.title}>A lot of hands built this shop.</h1>
          <p className={styles.lede}>
            Before there was anything on the shelves, there were neighbors with
            cameras, saws and paintbrushes who showed up anyway. These are some
            of them.
          </p>
        </header>

        <section className={styles.grid}>
          {HELPERS.map((helper, i) => {
            const colors = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <article
                key={helper.id}
                id={helper.id}
                className={styles.card}
                style={
                  {
                    "--card-bg": colors.background,
                    "--card-accent": colors.accent,
                  } as CSSProperties
                }
              >
                <BlobImage
                  src={helper.photo?.src}
                  alt={helper.photo?.alt ?? ""}
                  radius={MAKER_RADII[i % MAKER_RADII.length]}
                  ratio="1/1"
                  sizes="(max-width: 700px) 40vw, 160px"
                  parallax={false}
                  morphing
                  delay={makerMorphDelay(i)}
                  className={styles.portrait}
                />
                <div className={styles.role}>{helper.role}</div>
                <h2 className={styles.name}>{helper.name}</h2>
                <p className={styles.note}>{helper.note}</p>
                {helper.link && (
                  <a
                    href={helper.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <LinkIcon size="0.95em" />
                    {helper.link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </article>
            );
          })}
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
