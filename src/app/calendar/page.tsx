import type { Metadata } from "next";

import { CommunityCalendar } from "@/components/calendar/community-calendar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";

export const metadata: Metadata = {
  title: "Community calendar",
  description:
    "Workshops, classes, food popups and neighborhood nights at the shop. Pick something, save a seat.",
};

export default function CalendarPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="Workshops + classes"
          eyebrowColor="var(--color-ecs-magenta)"
          eyebrowInk="#ffffff"
          title="Community calendar"
          lede="Workshops, classes, food popups and neighborhood nights at the shop. Pick something, save a seat."
        />
        <CommunityCalendar />
      </main>

      <SiteFooter />
    </>
  );
}
