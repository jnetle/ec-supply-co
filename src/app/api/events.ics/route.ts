import { createCalendar } from "@/lib/ics";

// Phase two will fill this from Wix Events (see getPublishedWixEvents in
// @/lib/wix-events). Until then subscribers get a valid, empty calendar.
export function GET() {
  return new Response(createCalendar([]), {
    headers: {
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
      "Content-Disposition": 'inline; filename="el-cerrito-supply-events.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
