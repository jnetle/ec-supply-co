import Link from "next/link";

import { FeatureBand } from "@/components/home/feature-band";
import { BlobImage } from "@/components/ui/blob-image";

import styles from "./empty-calendar.module.css";

/**
 * Stands in for the calendar while nothing is scheduled: the home page's
 * feature band, saying what's coming instead of showing an empty month grid.
 */
export function EmptyCalendar() {
  return (
    <div className={styles.wrap}>
      <FeatureBand
        id="calendar"
        background="var(--color-ecs-teal)"
        foreground="#ffffff"
        eyebrow={{
          label: "Fresh flyers soon",
          color: "#ffffff",
          ink: "var(--color-ecs-teal-deep)",
        }}
        heading="The board’s clear for now"
        kicker="First workshops + popups on the way"
        kickerColor="#ffffff"
        paragraphs={[
          "We’re lining up the first round of workshops, food popups and neighborhood nights: classes taught by the makers down the street, guest cooks out front, maker markets and swap meets.",
          "Get the newsletter and you’ll hear the moment they’re posted. Or bring your own idea to the room.",
        ]}
        tags={[
          {
            label: "Workshops + classes",
            color: "#ffffff",
            ink: "var(--color-ecs-teal-deep)",
          },
          {
            label: "Food popups",
            color: "var(--color-ecs-marigold)",
            ink: "var(--color-ecs-ink)",
          },
          {
            label: "Neighborhood nights",
            color: "var(--color-ecs-teal-deep)",
            ink: "#ffffff",
          },
        ]}
        actions={
          <>
            <Link href="/#signup" className={styles.primary}>
              Get the newsletter
            </Link>
            <Link href="/host-with-us" className={styles.secondary}>
              Host an event →
            </Link>
          </>
        }
        media={
          <BlobImage
            src="/assets/photos/id-42-1600-1000.jpg"
            alt="The shop's long table, ready for a workshop"
            radius="46% 54% 18% 22% / 38% 34% 8% 9%"
            ratio="16/10"
            sizes="(max-width: 700px) 100vw, 50vw"
            style={{ minHeight: "260px" }}
          />
        }
      />
    </div>
  );
}
