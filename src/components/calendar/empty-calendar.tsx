import Link from "next/link";

import { FeatureBand } from "@/components/home/feature-band";
import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";

import styles from "./empty-calendar.module.css";

/**
 * Stands in for the calendar while nothing is scheduled: the home page's
 * feature band, saying it's a later phase instead of showing an empty month grid.
 */
export function EmptyCalendar() {
  return (
    <div className={styles.wrap}>
      <FeatureBand
        id="calendar"
        background="var(--color-ecs-teal)"
        foreground="#ffffff"
        eyebrow={{
          label: "Down the road",
          color: "#ffffff",
          ink: "var(--color-ecs-teal-deep)",
        }}
        heading="The board’s clear for now"
        kicker="A later chapter, still taking shape"
        kickerColor="#ffffff"
        paragraphs={[
          "Right now we’re focused on opening the shop: the retail counter, popup vendors, the tool library and maker shelves. A calendar of workshops, food popups and neighborhood nights comes after that, and we’ll shape it as we learn what the space wants to be.",
          "Get the newsletter to follow along. Have an idea for a class or a night? Tell us. It helps us plan what comes next.",
        ]}
        actions={
          <>
            <Link href="/#signup" className={button({ tone: "paper" })}>
              Get the newsletter
            </Link>
            <Link
              href="/host-with-us"
              className={button({
                variant: "outline",
                tone: "paper",
              })}
            >
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
