import Image from "next/image";

import { Blob } from "@/components/ui/blob";
import { BlobImage } from "@/components/ui/blob-image";
import { PopupVendorsCallout } from "@/components/ui/apply-band";

import { FeatureBand } from "./feature-band";
import hennaiLogo from "../../../public/assets/brand/hennai-logo.svg";
import styles from "./bands.module.css";

/** Photo column is roughly half the page above the column break. */
const HALF_COLUMN = "(max-width: 700px) 100vw, 50vw";

/** Hennai's shelf: a few things you'd actually find there. `cell` places
    each photo in bands.module.css; later photos sit on top of earlier ones.
    Each cell matches its photo's own shape, and each mask is drawn around
    what's in focus, so nothing on the table, no utensil and no shelf gets
    cut off. */
const SHELF = [
  {
    cell: "shelfSide",
    src: "/assets/photos/hennai/hennai-utensils-wide.jpg",
    alt: "Walnut spatulas and spoons in glass jars on a wooden tray, with tea towels and a small walnut plate",
    // A lopsided pebble around the spatulas and spoon jars.
    radius: "58% 42% 46% 54% / 52% 60% 40% 48%",
    sizes: "(max-width: 700px) 46vw, 23vw",
  },
  {
    cell: "shelfTop",
    src: "/assets/photos/hennai/hennai-shelves-wide.jpg",
    alt: "Pine shelves of ribbed bud vases, cookbooks, bottled mixers, candles and jarred pantry goods",
    // The one wide shot, to balance the two tall ones.
    radius: "28% 34% 26% 30% / 36% 40% 34% 38%",
    sizes: "(max-width: 700px) 50vw, 25vw",
  },
  {
    cell: "shelfBase",
    src: "/assets/photos/hennai/hennai-table.jpg",
    alt: "A round table set with enamel coasters, a succulent bowl, bottled mixers and wooden spoons, shelves of candles and cards behind",
    // An arch: the blurred shelves up top round off, and the bottom corners
    // curve just enough to trim floor, missing the coaster box and the plate.
    radius: "48% 50% 6% 5% / 36% 30% 7% 6%",
    sizes: "(max-width: 700px) 58vw, 29vw",
  },
] as const;

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
      heading={
        <span className={styles.logoRow}>
          <Image
            src={hennaiLogo}
            alt="Hennai Modern Home + Garden"
            className={styles.logo}
          />
        </span>
      }
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
        <div className={styles.shelf}>
          {SHELF.map((photo) => (
            <BlobImage
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              radius={photo.radius}
              ratio="auto"
              // The parallax overscales the photo, which would push the
              // edges of the table and the shelves back out of frame.
              parallax={false}
              sizes={photo.sizes}
              className={styles[photo.cell]}
            />
          ))}
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
        "A coffee cart usually pops up inside. Order a drink and settle onto the couch or the big table, or take it around the shelves.",
        "Food vendors pop up through the week. Keep an eye on the community calendar to see who’s coming.",
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
      actions={<PopupVendorsCallout />}
      actionsAtBottom
      mediaFirst
      decoration={
        <Blob
          color="color-mix(in srgb, var(--color-ecs-marigold) 20%, transparent)"
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
          src="/assets/photos/shop/storefront-bistro.jpg"
          alt="Out front of the shop in the sun: a blue bistro table and two chairs on the sidewalk under the scalloped awning, below the Supply Co. window lettering"
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
      kickerColor="var(--color-ecs-ply-ink)"
      paragraphs={[
        "Learn the skill without storing the tool. Borrow what the job needs, do it yourself, and keep your closet and your cash. The broken thing gets fixed instead of tossed.",
        "No hourly meter, so work at your own pace and bring it back when you're done. No question is too basic to ask, and the neighbor next to you probably has a tip.",
        "Got tools? Hand tools and crafting tools are welcome. Drop them off at the shop on Wednesdays, 9 to 12.",
      ]}
      tags={[
        { label: "Free to borrow", color: "var(--color-ecs-ink)", ink: "#ffffff" },
        { label: "On your schedule", color: "#ffffff", ink: "var(--color-ecs-ply-ink)" },
        {
          label: "Drop-offs Wed 9–12",
          color: "var(--color-ecs-red)",
          ink: "#ffffff",
        },
      ]}
      decoration={
        <Blob
          color="color-mix(in srgb, var(--color-ecs-red) 18%, transparent)"
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
          src="/assets/photos/shop/tool-cabinets.jpg"
          alt="A long row of pine cabinets with iridescent glass doors, reflecting the shop's shelving, running back toward the lounge's orange sofa and arched plywood screen"
          radius="54% 46% 22% 18% / 36% 40% 9% 8%"
          ratio="4/3"
          sizes={HALF_COLUMN}
          style={{ minHeight: "260px" }}
        />
      }
    />
  );
}
