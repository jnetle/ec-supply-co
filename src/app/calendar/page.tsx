import type { Metadata } from "next";

import { CommunityCalendar } from "@/components/calendar/community-calendar";
import { EmptyCalendar } from "@/components/calendar/empty-calendar";
import { shopTodayKey } from "@/components/calendar/event-model";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { EVENTS_PREVIEW, MOCK_EVENTS_PREVIEW } from "@/lib/content/calendar";
import { getCalendarEvents } from "@/lib/events";
import { mockCalendarEvents } from "@/lib/mock-events";
import { pageMetadata } from "@/lib/site";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** ?preview=events shows Wix events before they're switched on for everyone. */
async function isPreview(searchParams: CalendarPageProps["searchParams"]) {
  return (await searchParams)[EVENTS_PREVIEW.param] === EVENTS_PREVIEW.value;
}

/** ?preview=mock shows made-up events, outside production only. */
async function isMock(searchParams: CalendarPageProps["searchParams"]) {
  return (
    MOCK_EVENTS_PREVIEW.allowed &&
    (await searchParams)[MOCK_EVENTS_PREVIEW.param] === MOCK_EVENTS_PREVIEW.value
  );
}

async function loadEvents(searchParams: CalendarPageProps["searchParams"]) {
  if (await isMock(searchParams)) return mockCalendarEvents(shopTodayKey());
  return getCalendarEvents(await isPreview(searchParams));
}

export async function generateMetadata({
  searchParams,
}: CalendarPageProps): Promise<Metadata> {
  const preview =
    (await isPreview(searchParams)) || (await isMock(searchParams));
  const events = await loadEvents(searchParams);

  return {
    ...pageMetadata({
      title: "Community calendar",
      description:
        events.length > 0
          ? "Workshops, classes, food popups and neighborhood nights at our shop in El Cerrito. Pick something, save a seat."
          : "Workshops, classes and neighborhood nights at our El Cerrito shop are coming once we open.",
      path: "/calendar",
    }),
    // An empty calendar is thin content, and a preview isn't public yet;
    // keep both out of search.
    ...((preview || events.length === 0) && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const preview = await isPreview(searchParams);
  const mock = await isMock(searchParams);
  const events = await loadEvents(searchParams);
  const hasEvents = events.length > 0;

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow={
            mock
              ? "Preview: mock events"
              : preview
                ? "Preview: Wix events"
                : "Workshops + classes"
          }
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
        {hasEvents ? <CommunityCalendar events={events} mock={mock} /> : <EmptyCalendar />}
      </main>

      <SiteFooter />
    </>
  );
}
