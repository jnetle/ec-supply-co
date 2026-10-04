import { createCalendar } from "@/lib/ics";
import { getPublishedWixEvents } from "@/lib/wix-events";

export const revalidate = 300;

export async function GET() {
  try {
    const events = await getPublishedWixEvents();
    const calendar = createCalendar(events);

    return new Response(calendar, {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
        "Content-Disposition": 'inline; filename="el-cerrito-supply-events.ics"',
        "Content-Type": "text/calendar; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Could not generate the Wix Events calendar feed", error);
    return new Response("Calendar feed is temporarily unavailable.\n", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
