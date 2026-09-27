import Link from "next/link";
import type { CSSProperties } from "react";

import { Blob } from "@/components/ui/blob";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WaveDivider } from "@/components/ui/wave-divider";

import styles from "./manifesto-teaser.module.css";

/** Share of revenue that recirculates locally, by retailer type. */
const RECIRCULATION = [
  {
    label: "Local independent retailers",
    value: "48%",
    share: 48,
    color: "var(--color-ecs-marigold)",
  },
  {
    label: "Chain stores",
    value: "<14%",
    share: 14,
    color: "var(--color-ecs-teal-pale)",
  },
];

export function ManifestoTeaser() {
  return (
    <section id="manifesto" className={styles.section}>
      <WaveDivider edge="top" fill="var(--color-ecs-navy)" />
      <WaveDivider edge="bottom" fill="var(--color-ecs-navy)" />
      <Blob
        color="rgba(255,178,13,0.16)"
        parallax={0.2}
        delay="1.5s"
        style={{
          left: "-5%",
          bottom: "-8%",
          width: "clamp(140px,18vw,280px)",
          height: "clamp(140px,18vw,280px)",
        }}
      />
      <Blob
        color="rgba(143,214,218,0.13)"
        parallax={-0.18}
        delay="0.6s"
        style={{
          right: "8%",
          top: "-6%",
          width: "clamp(90px,10vw,160px)",
          height: "clamp(90px,10vw,160px)",
        }}
      />

      <div data-reveal className={styles.inner}>
        <Eyebrow
          color="var(--color-ecs-marigold)"
          ink="#22201c"
          className="mb-[18px]"
        >
          What we believe
        </Eyebrow>
        <h2 className={styles.heading}>
          Keep the money within walking distance.
        </h2>

        <div className={styles.body}>
          <div className={styles.copy}>
            <div className={styles.prose}>
              <p>
                We also believe we can build the kind of community we want by
                spending our money as close to home as possible. That
                HomeGoods décor may be perfectly fine and undeniably cheap,
                but when you buy something made by a person down the street,
                you are investing in their work, their family and the place
                you both call home.
              </p>
              <p>
                Every purchase is a chance to keep creativity visible,
                opportunity local and more of our community&rsquo;s money
                right here in our community.
              </p>
            </div>

            <Link href="/manifesto" className={styles.more}>
              Read the full manifesto →
            </Link>
          </div>

          <figure className={styles.figure}>
            <figcaption className={styles.figcaption}>
              Share of revenue that recirculates in the local economy
            </figcaption>

            {RECIRCULATION.map((row) => (
              <div
                key={row.label}
                className={styles.row}
                style={{ "--row-color": row.color } as CSSProperties}
              >
                <div className={styles.rowLabel}>{row.label}</div>
                <div className={styles.rowValue}>{row.value}</div>
                <div aria-hidden="true" className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ "--bar-width": `${row.share}%` } as CSSProperties}
                  />
                </div>
              </div>
            ))}

            <div className={styles.source}>
              Source: American Independent Business Alliance
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
