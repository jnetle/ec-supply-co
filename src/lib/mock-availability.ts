import "server-only";

import {
  availabilityFromIcs,
  type ShopAvailability,
} from "@/lib/shop-availability";

/**
 * ?preview=mock on /host-with-us: a made-up shop calendar, run through the
 * same parsing as the real one, so the availability band can be tried
 * without the secret address. Never on the production site.
 *
 * Shifts follow the shop's Google hours (closed Monday and Tuesday). Monday
 * is the weekly no-events day, so it shows "Closed"; Tuesday stays open all
 * day. A few private events land on dates counted from today.
 */
const SHIFTS = [
  // First dates are just early enough to be in the past; each falls on its day.
  { days: "WE,TH", first: "20261001", open: "083000", close: "170000" },
  { days: "FR", first: "20261002", open: "083000", close: "173000" },
  { days: "SA", first: "20261003", open: "090000", close: "180000" },
  { days: "SU", first: "20261004", open: "090000", close: "170000" },
];

/** Private events, as days from today and shop-time hours. */
const BOOKINGS = [
  { inDays: 2, start: "180000", end: "210000" },
  { inDays: 6, start: "120000", end: "160000" },
  { inDays: 11, start: "190000", end: "220000" },
  { inDays: 20, start: "100000", end: "200000" },
];

const ZONE = "America/Los_Angeles";

const VTIMEZONE = `BEGIN:VTIMEZONE
TZID:${ZONE}
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;

/** "2026-11-18" plus `count` days, as "20261120". */
function icsDay(today: string, count: number) {
  const day = new Date(`${today}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + count);
  return day.toISOString().slice(0, 10).replace(/-/g, "");
}

function mockIcs(today: string) {
  const events = [
    ...SHIFTS.map(
      (shift, i) => `BEGIN:VEVENT
UID:mock-shift-${i}
SUMMARY:Open
DTSTART;TZID=${ZONE}:${shift.first}T${shift.open}
DTEND;TZID=${ZONE}:${shift.first}T${shift.close}
RRULE:FREQ=WEEKLY;BYDAY=${shift.days}
END:VEVENT`,
    ),
    `BEGIN:VEVENT
UID:mock-closed
SUMMARY:Closed - no events
DTSTART;VALUE=DATE:20261005
DTEND;VALUE=DATE:20261006
RRULE:FREQ=WEEKLY;BYDAY=MO
END:VEVENT`,
    ...BOOKINGS.map((booking, i) => {
      const day = icsDay(today, booking.inDays);
      return `BEGIN:VEVENT
UID:mock-booking-${i}
SUMMARY:Private event
DTSTART;TZID=${ZONE}:${day}T${booking.start}
DTEND;TZID=${ZONE}:${day}T${booking.end}
END:VEVENT`;
    }),
  ];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//El Cerrito Supply Co.//Mock availability//EN",
    VTIMEZONE,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function mockShopAvailability(today: string): ShopAvailability {
  return availabilityFromIcs(mockIcs(today), today);
}
