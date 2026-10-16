import type { Metadata } from "next";

import { CommunityCalendar } from "@/components/calendar/community-calendar";
import { EmptyCalendar } from "@/components/calendar/empty-calendar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { CALENDAR_EVENTS } from "@/lib/content/calendar";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Community calendar",
  description:
    CALENDAR_EVENTS.length > 0
      ? "Workshops, classes, food popups and neighborhood nights at our shop in El Cerrito. Pick something, save a seat."
      : "Workshops, classes, food popups and neighborhood nights at our shop in El Cerrito are a later chapter, once the shop is up and running.",
  path: "/calendar",
});

export default function CalendarPage() {
  const hasEvents = CALENDAR_EVENTS.length > 0;

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="Workshops + classes"
          eyebrowColor={
            hasEvents ? "var(--color-ecs-magenta)" : "var(--color-ecs-teal)"
          }
          eyebrowInk="#ffffff"
          title="Community calendar"
          lede={
            hasEvents
              ? "Workshops, classes, food popups and neighborhood nights at the shop. Pick something, save a seat."
              : "Workshops, classes, food popups and neighborhood nights are a later chapter. First we’re getting the shop itself up and running."
          }
        />
        {hasEvents ? <CommunityCalendar /> : <EmptyCalendar />}
      </main>

      <SiteFooter />
    </>
  );
}
