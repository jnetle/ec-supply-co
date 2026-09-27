import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { SiteHeader } from "@/components/site/site-header";
import { MANIFESTO_RULES } from "@/lib/content/manifesto";

import styles from "@/components/manifesto/manifesto-page.module.css";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Nine things we decided in a folding-chair meeting in 2019, and haven't found a good reason to change since.",
};

export default function ManifestoPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <header className={styles.header}>
          <div className={styles.kicker}>The manifesto</div>
          <h1 className={styles.title}>
            Keep the money within walking distance.
          </h1>
          <p className={styles.lede}>
            Nine things we decided in a folding-chair meeting in 2019, and
            haven&rsquo;t found a good reason to change since.
          </p>
        </header>

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
              className={styles.action}
              style={
                {
                  "--action-bg": "var(--color-ecs-teal)",
                  "--action-fg": "#ffffff",
                } as CSSProperties
              }
            >
              Come by the shop
            </Link>
            <Link
              href="/#makers"
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
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div>7523 Fairmount Ave, El Cerrito CA · Thu–Sun</div>
        <Link href="/">← Back to the shop</Link>
      </footer>
    </>
  );
}
