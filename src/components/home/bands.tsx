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
      kicker="Small corner, lots to find"
      kickerColor="#7a4d20"
      paragraphs={[
        "Hennai packs one corner of the shop with candles and soaps, plants and garden tools, cookbooks, cards and craft kits, linens, and pieces for the table. Easy to browse in five minutes, hard to leave in five.",
        "It all comes from small makers and independent brands, people building something of their own, just like Hennai. And it's priced to take home, not just admire, because well-made things shouldn't be a luxury.",
      ]}
      tags={[
        {
          label: "Home + garden",
          color: "var(--color-ecs-ply-ink)",
          ink: "#ffffff",
        },
        {
          label: "Paper + craft kits",
          color: "var(--color-ecs-marigold)",
          ink: "var(--color-ecs-ink)",
        },
        {
          label: "Bath + body",
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
          ink: "var(--color-ecs-ink)",
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
      foreground="var(--color-ecs-ink)"
      eyebrow={{
        label: "Borrow, don't buy",
        color: "var(--color-ecs-ink)",
        ink: "var(--color-ecs-marigold)",
      }}
      heading="Tool library"
      kicker="Keep the skill, skip the clutter"
      kickerColor="#6b4a00"
      paragraphs={[
        "Learn the skill without storing the tool. Borrow what the job needs, do it yourself, and keep your closet and your cash. The broken thing gets fixed instead of tossed.",
        "No hourly meter, so work at your own pace and bring it back when you're done. No question is too basic to ask, and the neighbor next to you probably has a tip.",
      ]}
      tags={[
        { label: "Free to borrow", color: "var(--color-ecs-ink)", ink: "#ffffff" },
        { label: "On your schedule", color: "#ffffff", ink: "#6b4a00" },
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
