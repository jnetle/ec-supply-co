/**
 * TODO: turn on when the shop is ready to take bookings. While off,
 * /host-with-us still loads for anyone with the URL, so it can be reviewed, but
 * it stays out of search, and its nav and footer link, sitemap entry, the empty
 * calendar's "Host an event" button and the home events section's booking links
 * are all gone.
 */
export const HOST_WITH_US_ENABLED = false;

/**
 * TODO: turn back on when the shop is ready to run co-marketing workshops.
 * Hidden for launch: it drops the workshop card and its option in
 * the form on /host-with-us, and the copy there talks about two ways to use
 * the space instead of three.
 */
export const CO_MARKETING_WORKSHOP_ENABLED = true;

/**
 * The hours of a day the space can be rented at all, in minutes from
 * midnight, shop time. Free windows on /host-with-us are cut from these.
 */
export const RENTAL_DAY = { startMinute: 8 * 60, endMinute: 22 * 60 };

/** Setup and cleanup kept clear on each side of anything on the calendar. */
export const BOOKING_BUFFER_MINUTES = 30;

/** Gaps shorter than this aren't worth offering. */
export const MIN_WINDOW_MINUTES = 2 * 60;

/** How far ahead the availability calendar looks, counting today. */
export const AVAILABILITY_DAYS = 90;
