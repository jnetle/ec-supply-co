import Link from "next/link";

import { FeatureBand } from "@/components/home/feature-band";
import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";
import { HOST_WITH_US_ENABLED } from "@/lib/content/host-with-us";

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
          HOST_WITH_US_ENABLED
            ? "Get the newsletter to follow along. Have an idea for a class or a night? Tell us. It helps us plan what comes next."
            : "Get the newsletter to follow along.",
        ]}
        actions={
          <>
            <Link href="/#signup" className={button({ tone: "paper" })}>
              Get the newsletter
            </Link>
            {HOST_WITH_US_ENABLED && (
              <Link
                href="/host-with-us"
                className={button({
                  variant: "outline",
                  tone: "paper",
                })}
              >
                Host an event →
              </Link>
            )}
          </>
        }
        media={
          <BlobImage
            src="/assets/photos/shop/front-window-sign.jpg"
            alt="Inside the shop facing the sunny front window, under a paper lantern, with the Supply Co. lettering on the glass and an old El Cerrito city limit sign propped on the floor below it"
            radius="48% 52% 20% 18% / 26% 28% 7% 8%"
            ratio="3/4"
            sizes="(max-width: 700px) 100vw, 50vw"
            eager
            style={{ minHeight: "260px" }}
          />
        }
      />
    </div>
  );
}
