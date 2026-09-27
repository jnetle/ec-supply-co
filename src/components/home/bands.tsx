import { Blob } from "@/components/ui/blob";
import { BlobImage } from "@/components/ui/blob-image";

import { FeatureBand } from "./feature-band";
import styles from "./bands.module.css";

/** Photo column is roughly half the page above the column break. */
const HALF_COLUMN = "(max-width: 700px) 100vw, 50vw";

export function Hennai() {
  return (
    <FeatureBand
      id="hennai"
      background="var(--color-ecs-garden)"
      eyebrow={{
        label: "Anchor tenant",
        color: "var(--color-ecs-ply-ink)",
        ink: "#ffffff",
      }}
      heading="Hennai Home + Garden"
      kicker="The retail counter, curated"
      kickerColor="#7a4d20"
      paragraphs={[
        "Hennai runs the front counter — a tight, seasonal edit of things for the house and the yard. Terracotta pots, hand tools worth re-handling, cuttings in jars, linens, and whatever the season is doing.",
        "They buy small and rotate often, so the shelf in November looks nothing like the shelf in April. Ask them anything about keeping a plant alive in an El Cerrito window.",
      ]}
      tags={[
        {
          label: "Home goods",
          color: "var(--color-ecs-ply-ink)",
          ink: "#ffffff",
        },
        {
          label: "Plants & cuttings",
          color: "var(--color-ecs-marigold)",
          ink: "#22201c",
        },
        {
          label: "Seasonal edit",
          color: "#ffffff",
          ink: "var(--color-ecs-ply-ink)",
        },
      ]}
      media={
        <div className={styles.collage}>
          <BlobImage
            src="/assets/photos/id-106-1200-750.jpg"
            alt="The Hennai counter, seen across the shop floor"
            radius="46% 54% 18% 22% / 38% 34% 8% 9%"
            ratio="16/10"
            sizes={HALF_COLUMN}
            className={styles.collageWide}
          />
          <BlobImage
            src="/assets/photos/id-152-700-700.jpg"
            alt="Terracotta pots and hand tools on the Hennai shelf"
            radius="52% 48% 40% 60% / 46% 56% 44% 54%"
            ratio="1/1"
            sizes="(max-width: 700px) 50vw, 25vw"
          />
          <BlobImage
            src="/assets/photos/id-292-700-700.jpg"
            alt="Linens and cuttings in jars"
            radius="44% 56% 58% 42% / 54% 42% 58% 46%"
            ratio="1/1"
            sizes="(max-width: 700px) 50vw, 25vw"
          />
        </div>
      }
    />
  );
}

export function Carts() {
  return (
    <FeatureBand
      id="carts"
      background="var(--color-ecs-teal)"
      foreground="#ffffff"
      eyebrow={{
        label: "Always rotating",
        color: "#ffffff",
        ink: "var(--color-ecs-teal-deep)",
      }}
      heading="Popup vendors"
      kicker="Coffee + food, cycling in and out"
      kickerColor="#ffffff"
      paragraphs={[
        "Coffee purveyors and food vendors pop up through the week and cycle in and out, so there is usually something new to try.",
        "Watch the calendar for food popups: guest chefs, bakers and taco nights. Walk up, no sign-up needed.",
      ]}
      tags={[
        {
          label: "Rotating lineup",
          color: "var(--color-ecs-marigold)",
          ink: "#22201c",
        },
        {
          label: "Food popups",
          color: "var(--color-ecs-magenta)",
          ink: "#ffffff",
        },
      ]}
      mediaFirst
      decoration={
        <Blob
          color="rgba(255,178,13,0.2)"
          parallax={0.26}
          delay="0.9s"
          style={{
            left: "4%",
            bottom: "-6%",
            width: "clamp(110px,13vw,210px)",
            height: "clamp(110px,13vw,210px)",
          }}
        />
      }
      media={
        <BlobImage
          src="/assets/photos/id-431-900-1125.jpg"
          alt="A popup vendor's cart set up inside the shop"
          radius="54% 46% 22% 18% / 36% 40% 9% 8%"
          ratio="4/5"
          sizes={HALF_COLUMN}
          style={{ minHeight: "280px" }}
        />
      }
    />
  );
}

export function Tools() {
  return (
    <FeatureBand
      id="tools"
      background="var(--color-ecs-marigold)"
      foreground="#22201c"
      eyebrow={{
        label: "Borrow, don't buy",
        color: "#22201c",
        ink: "var(--color-ecs-marigold)",
      }}
      heading="Tool library"
      paragraphs={[
        "Drills, sanders, a jigsaw, a tile cutter, a sewing machine, clamps in every size. Most of it was donated by neighbors who used it once and would rather it got used again.",
        "Take what you need for the weekend, bring it back when you are done. If you have never used the thing you are borrowing, somebody at the counter will show you.",
      ]}
      tags={[
        { label: "Free to borrow", color: "#22201c", ink: "#ffffff" },
        { label: "Weekend checkout", color: "#ffffff", ink: "#6b4a00" },
        {
          label: "Donations welcome",
          color: "var(--color-ecs-red)",
          ink: "#ffffff",
        },
      ]}
      decoration={
        <Blob
          color="rgba(232,51,31,0.18)"
          parallax={-0.24}
          delay="0.3s"
          style={{
            right: "5%",
            top: "-5%",
            width: "clamp(100px,12vw,190px)",
            height: "clamp(100px,12vw,190px)",
          }}
        />
      }
      media={
        <BlobImage
          src="/assets/photos/id-1081-1000-750.jpg"
          alt="A pegboard wall of borrowable tools"
          radius="54% 46% 22% 18% / 36% 40% 9% 8%"
          ratio="4/3"
          sizes={HALF_COLUMN}
          style={{ minHeight: "260px" }}
        />
      }
    />
  );
}
