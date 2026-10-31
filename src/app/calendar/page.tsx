import type { Metadata } from "next";

import { CommunityCalendar } from "@/components/calendar/community-calendar";
import { EmptyCalendar } from "@/components/calendar/empty-calendar";
import { shopTodayKey } from "@/components/calendar/event-model";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { MOCK_EVENTS_PREVIEW } from "@/lib/content/calendar";
import { getCalendarEvents } from "@/lib/events";
import { mockCalendarEvents } from "@/lib/mock-events";
import { pageMetadata } from "@/lib/site";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** ?preview=mock shows made-up events, outside production only. */
async function isMock(searchParams: CalendarPageProps["searchParams"]) {
  return (
    MOCK_EVENTS_PREVIEW.allowed &&
    (await searchParams)[MOCK_EVENTS_PREVIEW.param] === MOCK_EVENTS_PREVIEW.value
  );
}

async function loadEvents(searchParams: CalendarPageProps["searchParams"]) {
  if (await isMock(searchParams)) return mockCalendarEvents(shopTodayKey());
  return getCalendarEvents();
}

export async function generateMetadata({
  searchParams,
}: CalendarPageProps): Promise<Metadata> {
  const mock = await isMock(searchParams);
  const events = await loadEvents(searchParams);

  return {
    ...pageMetadata({
      title: "Community calendar",
      description:
        events.length > 0
          ? "Workshops, food popups, pick-ups and neighborhood nights at our shop in El Cerrito."
          : "Workshops, classes and neighborhood nights at our El Cerrito shop are coming once we open.",
      path: "/calendar",
    }),
    // An empty calendar is thin content, and made-up events aren't real;
    // keep both out of search.
    ...((mock || events.length === 0) && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const mock = await isMock(searchParams);
  const events = await loadEvents(searchParams);
  const hasEvents = events.length > 0;

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow={mock ? "Preview: mock events" : "Events + popups"}
          eyebrowColor={
            hasEvents ? "var(--color-ecs-magenta)" : "var(--color-ecs-teal)"
          }
          eyebrowInk="#ffffff"
          title="Community calendar"
          lede={
            hasEvents
              ? "Workshops, food popups, pick-ups and neighborhood nights at the shop. Find something and come by."
              : "Workshops, classes, food popups and neighborhood nights are a later chapter. First we’re getting the shop itself up and running."
          }
        />
        {hasEvents ? <CommunityCalendar events={events} mock={mock} /> : <EmptyCalendar />}
      </main>

      <SiteFooter />
    </>
  );
}
