import { SHOP_TIME_ZONE, type CalendarEvent } from "@/lib/content/calendar";
import type { RsvpState } from "@/lib/event-rsvp";

const wallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: SHOP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

/** How far the shop's clock is ahead of UTC (negative here) at an instant. */
function shopOffset(instant: number): number {
  const part = Object.fromEntries(
    wallClock
      .formatToParts(instant)
      .map(({ type, value }) => [type, Number(value)]),
  );
  const wall = Date.UTC(
    part.year,
    part.month - 1,
    part.day,
    part.hour,
    part.minute,
  );
  return wall - Math.floor(instant / 60_000) * 60_000;
}

/**
 * "2026-12-13" + "11:00" in shop time → its ISO instant. Real events get theirs
 * from Wix; this is only for the made-up ones. The offset is checked again at
 * the result, so a time on a clock-change day lands on the right side of it.
 */
function shopInstant(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  let instant = asUtc - shopOffset(asUtc);
  const settled = shopOffset(instant);
  if (settled !== asUtc - instant) instant = asUtc - settled;
  return new Date(instant).toISOString();
}

/**
 * Made-up events for /calendar?preview=mock, one for each state the list and
 * the event dialog can show. Dated around `today` so they always land on the
 * month the calendar opens to, one with its time still to be announced, and
 * one far enough out to leave an empty month before it. Their sign-ups never
 * reach Wix (see `mockRsvp`). The photos mix square and portrait shots, to see
 * how a Canva graphic of each shape would crop, and two events have none, to
 * see the shop photo that stands in.
 */
export function mockCalendarEvents(today: string): CalendarEvent[] {
  const on = (offset: number) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };

  const events: Omit<CalendarEvent, "startsAt" | "endsAt">[] = [
    {
      id: "mock-past",
      date: on(-2),
      start: "18:00",
      end: "20:00",
      category: "workshop",
      title: "Intro to wood carving",
      photo: "/assets/photos/id-102-600-600.jpg",
      price: 35,
      seats: { kind: "rsvp", availability: "closed", maxSeats: 1 },
      description:
        "Carve a butter spreader from a cherry blank, start to finish. Tools and wood included.",
    },
    {
      id: "mock-open",
      date: on(0),
      start: "18:30",
      end: "20:30",
      category: "workshop",
      title: "Block printing tote bags",
      photo: "/assets/photos/id-24-800-1000.jpg",
      price: 45,
      seats: { kind: "rsvp", availability: "open", maxSeats: 3 },
      description:
        "Carve your own stamp, then print it on a canvas tote to take home. All supplies included, and no experience needed. Wear clothes you don't mind getting ink on.",
    },
    {
      id: "mock-open-single",
      date: on(3),
      start: "10:00",
      end: "12:00",
      category: "community",
      title: "Weekend mending circle",
      photo: "/assets/photos/id-146-600-600.jpg",
      price: 0,
      seats: { kind: "rsvp", availability: "open", maxSeats: 1 },
      description:
        "Bring a sweater with a hole or jeans that need a patch. We'll have needles, thread and scrap fabric.",
    },
    {
      id: "mock-waitlist",
      date: on(5),
      start: "19:00",
      end: "21:00",
      category: "workshop",
      title: "Pour your own candle",
      price: 40,
      seats: { kind: "rsvp", availability: "waitlist", maxSeats: 2 },
      description:
        "Pick a scent, pour a candle in a reusable tin, and take it home once it sets.",
    },
    {
      id: "mock-full",
      date: on(8),
      start: "17:00",
      category: "popup",
      title: "Dumpling night",
      photo: "/assets/photos/id-292-800-1000.jpg",
      price: 25,
      seats: { kind: "rsvp", availability: "full", maxSeats: 2 },
      description:
        "Pork and chive or mushroom dumplings, folded to order. Sold out, but there'll be another round.",
    },
    {
      id: "mock-external-workshop",
      date: on(6),
      start: "10:00",
      end: "12:00",
      category: "workshop",
      title: "Natural dye basics",
      photo: "/assets/photos/id-431-900-1125.jpg",
      price: 0,
      seats: { kind: "external", url: "https://example.com" },
      description:
        "Dye a cotton scarf with onion skins and avocado pits. Sign-ups and payment are on the teacher's site.",
    },
    {
      id: "mock-pickup",
      date: on(9),
      start: "12:00",
      end: "16:00",
      category: "pickup",
      title: "Holiday cookie box pick-up",
      photo: "/assets/photos/id-292-800-1000.jpg",
      price: 0,
      seats: { kind: "external", url: "https://example.com" },
      description:
        "Preorder a cookie box from the bakery, then collect it at the shop.",
    },
    {
      id: "mock-drop-in",
      date: on(10),
      start: "11:00",
      end: "15:00",
      category: "popup",
      title: "Sourdough and jam pop-up with a much longer title than usual",
      price: 0,
      seats: { kind: "drop-in" },
      description:
        "Loaves, jam and coffee until they run out. No photo on this one, to see the shop photo that stands in.",
    },
    {
      id: "mock-run",
      date: on(-3),
      lastDate: on(20),
      start: "08:00",
      end: "14:00",
      category: "popup",
      title: "Coffee bar with rotating roasters",
      photo: "/assets/photos/id-102-600-600.jpg",
      price: 0,
      seats: { kind: "drop-in" },
      description:
        "Runs over several days, already going: its card shows the dates and no time, and the month view shows it every day.",
    },
    {
      id: "mock-closed",
      date: on(12),
      start: "18:00",
      end: "19:30",
      category: "community",
      title: "Neighborhood maker meetup",
      photo: "/assets/photos/id-431-900-1125.jpg",
      price: 0,
      seats: { kind: "rsvp", availability: "closed", maxSeats: 1 },
      description:
        "Show what you're working on, swap tips, meet the makers down the street.",
    },
    {
      id: "mock-time-tba",
      date: on(45),
      start: "00:00",
      category: "community",
      title: "Grand opening",
      price: 0,
      seats: { kind: "drop-in" },
      timeTba: true,
      description:
        "The doors are open. Come see the shop, meet the makers and say hi. No time yet, so the card shows the date alone.",
    },
    {
      id: "mock-later",
      date: on(105),
      start: "12:00",
      end: "16:00",
      category: "community",
      title: "Seed and cutting swap",
      photo: "/assets/photos/id-63-600-600.jpg",
      price: 0,
      seats: { kind: "drop-in" },
      description:
        "Bring seeds or cuttings to trade, or just come take some home.",
    },
  ];

  return events.map((event) => ({
    ...event,
    startsAt: shopInstant(event.date, event.start),
    endsAt: event.end
      ? shopInstant(event.lastDate ?? event.date, event.end)
      : undefined,
  }));
}

/**
 * Stands in for `rsvpToEvent` on mock events, so trying the dialog's form
 * never writes to Wix or the newsletter. An email containing "fail" shows the
 * error message.
 */
export async function mockRsvp(
  _prevState: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (String(formData.get("email")).includes("fail")) {
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again.",
    };
  }
  return formData.get("waitlist") === "on"
    ? { status: "waitlisted", message: "" }
    : {
        status: "reserved",
        message: "",
        seats: Number(formData.get("seats") ?? 1),
      };
}
