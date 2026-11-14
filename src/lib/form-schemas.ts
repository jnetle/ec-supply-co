// Server-side validation for the public forms. Server Actions are public POST
// endpoints, so every value is untrusted no matter what the browser checked.
//
// Deliberately free of the `server-only` import so a plain Node script can load
// it to exercise the rules. Client components import only the limits from
// `form-limits.ts`, which keeps zod out of the browser bundle.

import { z } from "zod";

import {
  MAX_EMAIL_LENGTH,
  MAX_LONG_TEXT_LENGTH,
  MAX_RSVP_NAME_LENGTH,
  MAX_RSVP_SEATS,
  MAX_SHORT_TEXT_LENGTH,
  MAX_URL_LENGTH,
} from "@/lib/form-limits";

// Single-line fields allow no control characters at all; a newline in a name
// would break the layout of Wix's notification emails. Multi-line fields allow
// newlines and tabs only.
const NO_CONTROL_CHARACTERS = /^\P{Cc}*$/u;
const NO_CONTROL_CHARACTERS_BUT_LINES = /^(?:[\n\t]|\P{Cc})*$/u;

// Browsers submit textarea line breaks as CRLF. Fold them to LF first, so the
// length check counts them the way the textarea's `maxLength` did.
const text = () =>
  z
    .string()
    .overwrite((value) => value.replace(/\r\n?/g, "\n"))
    .trim()
    .normalize("NFC");

const requiredShortText = text()
  .min(1)
  .max(MAX_SHORT_TEXT_LENGTH)
  .regex(NO_CONTROL_CHARACTERS);
const optionalShortText = text()
  .max(MAX_SHORT_TEXT_LENGTH)
  .regex(NO_CONTROL_CHARACTERS);
const longText = text()
  .max(MAX_LONG_TEXT_LENGTH)
  .regex(NO_CONTROL_CHARACTERS_BUT_LINES);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(MAX_EMAIL_LENGTH)
  .pipe(z.email());

// People type "myshop.com" or "instagram.com/me", so a missing scheme gets
// https:// added. After that it must be http(s) with a real domain: no
// javascript:, no localhost, no bare IPs.
const webLink = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH)
  .overwrite((value) =>
    value === "" || /^[a-z][a-z\d+.-]*:\/\//i.test(value)
      ? value
      : `https://${value.replace(/^\/\//, "")}`,
  )
  .pipe(z.url({ protocol: /^https?$/, hostname: z.regexes.domain }));

export const newsletterSchema = z.object({ email });

export const makerApplicationSchema = z.object({
  first: requiredShortText,
  last: requiredShortText,
  business: requiredShortText,
  email,
  link: webLink,
  about: longText.min(1),
  city: optionalShortText,
  connection: longText,
  wholesale: z.enum(["yes", "learning", "no"]),
  pricing: z.union([z.literal(""), z.enum(["yes", "working", "no"])]),
});

export type MakerApplication = z.infer<typeof makerApplicationSchema>;

export const popupApplicationSchema = z.object({
  first: requiredShortText,
  last: requiredShortText,
  business: requiredShortText,
  email,
  link: webLink,
  about: longText.min(1),
  city: optionalShortText,
  connection: longText,
  permit: z.enum(["yes", "no", "working"]),
  payment: z.enum(["yes", "no"]),
});

export type PopupApplication = z.infer<typeof popupApplicationSchema>;

export const hostInquirySchema = z.object({
  first: requiredShortText,
  last: requiredShortText,
  email,
  type: z.enum(["private-event", "co-marketing-workshop", "pitch-an-idea"]),
  // From a datetime-local input, which has no time zone.
  when: z.union([z.literal(""), z.iso.datetime({ local: true })]),
  people: z.string().trim().regex(/^(?:[1-9]\d{0,3})?$/),
  catering: z.array(z.enum(["coffee-cart", "food-vendor"])).max(2),
  needs: z.array(z.enum(["additional-table", "garden-area"])).max(2),
  about: longText.min(1),
  notes: longText,
});

export type HostInquiry = z.infer<typeof hostInquirySchema>;

export const eventRsvpSchema = z.object({
  // A Wix event ID. z.guid() rather than z.uuid(), which also checks the
  // RFC version bits that Wix's IDs don't promise.
  eventId: z.guid(),
  first: requiredShortText.max(MAX_RSVP_NAME_LENGTH),
  last: requiredShortText.max(MAX_RSVP_NAME_LENGTH),
  email,
  seats: z.coerce.number().int().min(1).max(MAX_RSVP_SEATS),
  // Checkboxes and the waitlist flag arrive as "on" or not at all.
  waitlist: z.boolean(),
  /** A save the date's notify list: an RSVP that only means "email me". */
  notify: z.boolean(),
  news: z.boolean(),
});
