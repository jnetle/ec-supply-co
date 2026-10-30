// Field length limits, shared by the server-side schemas and the forms'
// `maxLength` attributes. Kept apart from `form-schemas.ts` so the client
// bundle doesn't pull in zod.

export const MAX_EMAIL_LENGTH = 254;
export const MAX_SHORT_TEXT_LENGTH = 200;
export const MAX_LONG_TEXT_LENGTH = 5_000;
export const MAX_URL_LENGTH = 2_048;

/**
 * The hidden bot-trap field on the newsletter and RSVP forms. A name browsers
 * and password managers never autofill: "company" was, which silently turned
 * real people's sign-ups into fake successes.
 */
export const HONEYPOT_FIELD = "referral_code";

/** Most seats one RSVP may save: the person signing up plus three guests. */
export const MAX_RSVP_SEATS = 4;

/** Wix Events caps first and last names on an RSVP at this length. */
export const MAX_RSVP_NAME_LENGTH = 50;

/** A maker application sent sooner than this after the form loaded is a bot. */
export const MIN_APPLICATION_FILL_MS = 3_000;
