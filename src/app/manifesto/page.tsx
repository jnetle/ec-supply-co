import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import { MANIFESTO_ENABLED, MANIFESTO_RULES } from "@/lib/content/manifesto";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/manifesto/manifesto-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Manifesto",
  description:
    "Nine things we decided in a folding-chair meeting in 2019, and haven't found a good reason to change since.",
  path: "/manifesto",
});

export default function ManifestoPage() {
  if (!MANIFESTO_ENABLED) notFound();

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="The manifesto"
          eyebrowColor="var(--color-ecs-red)"
          eyebrowInk="#ffffff"
          title="Keep the money within walking distance."
          lede="Nine things we decided in a folding-chair meeting in 2019, and haven’t found a good reason to change since."
        />

        <section className={styles.grid}>
          {MANIFESTO_RULES.map((rule) => (
            <article
              key={rule.number}
              className={styles.card}
              style={
                {
                  "--card-bg": rule.background,
                  "--number-color": rule.numberColor,
                } as CSSProperties
              }
            >
              <div className={styles.number}>{rule.number}</div>
              <h2 className={styles.cardTitle}>{rule.title}</h2>
              <p className={styles.cardBody}>{rule.body}</p>
            </article>
          ))}
        </section>

        <section className={styles.quoteBand}>
          <blockquote className={styles.quote}>
            If it can be made on this block, it shouldn&rsquo;t be shipped to
            it.
          </blockquote>

          <div className={styles.actions}>
            <Link
              href="/#visit"
              className={button({ tone: "teal" })}
            >
              Come by the shop
            </Link>
            <Link
              href="/makers"
              className={button({ variant: "outline", tone: "marigold" })}
            >
              Meet the makers
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
