import type { Metadata } from "next";

import { CommunityCalendar } from "@/components/calendar/community-calendar";
import { EmptyCalendar } from "@/components/calendar/empty-calendar";
import { shopTodayKey } from "@/components/calendar/event-model";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import {
  DRAFT_EVENTS_PREVIEW,
  MOCK_EVENTS_PREVIEW,
} from "@/lib/content/calendar";
import { getCalendarEvents, getDraftPreviewEvents } from "@/lib/events";
import { mockCalendarEvents } from "@/lib/mock-events";
import { pageMetadata } from "@/lib/site";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type Preview = "mock" | "drafts" | undefined;

/**
 * ?preview=mock shows made-up events, outside production only.
 * ?preview=drafts adds draft Wix events, on `next dev` only.
 */
async function previewMode(
  searchParams: CalendarPageProps["searchParams"],
): Promise<Preview> {
  const value = (await searchParams)[MOCK_EVENTS_PREVIEW.param];
  if (MOCK_EVENTS_PREVIEW.allowed && value === MOCK_EVENTS_PREVIEW.value) {
    return "mock";
  }
  if (DRAFT_EVENTS_PREVIEW.allowed && value === DRAFT_EVENTS_PREVIEW.value) {
    return "drafts";
  }
  return undefined;
}

async function loadEvents(preview: Preview) {
  if (preview === "mock") return mockCalendarEvents(shopTodayKey());
  if (preview === "drafts") return getDraftPreviewEvents();
  return getCalendarEvents();
}

const EYEBROWS = {
  mock: "Preview: mock events",
  drafts: "Preview: drafts + live",
} as const;

export async function generateMetadata({
  searchParams,
}: CalendarPageProps): Promise<Metadata> {
  const preview = await previewMode(searchParams);
  const events = await loadEvents(preview);

  return {
    ...pageMetadata({
      title: "Community calendar",
      description:
        events.length > 0
          ? "Workshops, food popups, pick-ups and neighborhood nights at our shop in El Cerrito."
          : "Workshops, classes and neighborhood nights at our El Cerrito shop are coming once we open.",
      path: "/calendar",
    }),
    // An empty calendar is thin content, and previews aren't the real
    // calendar; keep both out of search.
    ...((preview || events.length === 0) && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const preview = await previewMode(searchParams);
  const events = await loadEvents(preview);
  const hasEvents = events.length > 0;

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow={preview ? EYEBROWS[preview] : "Events + popups"}
          eyebrowColor={
            hasEvents ? "var(--color-ecs-magenta)" : "var(--color-ecs-teal)"
          }
          eyebrowInk="#ffffff"
          title="Community calendar"
          lede={
            preview === "drafts"
              ? "Live events plus any tagged “IN DRAFT MODE - TESTING ONLY” in Wix. Take the tag off in Wix to put one live."
              : hasEvents
              ? "Workshops, food popups, pick-ups and neighborhood nights at the shop. Find something and come by."
              : "Workshops, classes, food popups and neighborhood nights are a later chapter. First we’re getting the shop itself up and running."
          }
        />
        {/* Sign-ups in any preview go nowhere, so checking a draft never
            sends a real RSVP to Wix. */}
        {hasEvents ? (
          <CommunityCalendar events={events} mock={Boolean(preview)} />
        ) : (
          <EmptyCalendar />
        )}
      </main>

      <SiteFooter />
    </>
  );
}
