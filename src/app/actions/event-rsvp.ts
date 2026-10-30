"use server";

import { track } from "@vercel/analytics/server";
import { headers } from "next/headers";

import { HONEYPOT_FIELD } from "@/lib/form-limits";
import { eventRsvpSchema } from "@/lib/form-schemas";
import type { RsvpState } from "@/lib/event-rsvp";
import { addToNewsletter } from "@/lib/newsletter-signup";
import { describeWixError, getWixClient } from "@/lib/wix";

// Needs the same Vercel Firewall rate limit as the newsletter action, with
// /calendar added to its paths.

const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

/** What to tell the visitor for each Wix refusal they can do something about. */
const REFUSALS: Record<string, string> = {
  MEMBER_ALREADY_REGISTERED: "That email is already signed up for this event.",
  MEMBER_EMAIL_ALREADY_REGISTERED:
    "That email is already signed up for this event.",
  RSVP_LIMIT_EXCEEDED:
    "There aren't enough spots left for that many seats. Try fewer, or refresh the page to join the waitlist.",
  GUEST_LIMIT_EXCEEDED:
    "There aren't enough spots left for that many seats. Try fewer, or refresh the page to join the waitlist.",
  RSVPS_CLOSED: "Sign-ups for this event are closed.",
  RSVPS_NOT_STARTED: "Sign-ups for this event haven't opened yet.",
  WAITING_LIST_UNAVAILABLE: "This event is full and has no waitlist.",
};

export async function rsvpToEvent(
  _prevState: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  // Bots fill every field; real browsers leave the hidden one empty. Report
  // success so a scripted submitter gets no signal that it was filtered.
  if (formData.get(HONEYPOT_FIELD)) {
    return { status: "reserved", message: "", seats: 1 };
  }

  const result = eventRsvpSchema.safeParse({
    eventId: formData.get("eventId"),
    first: formData.get("first"),
    last: formData.get("last"),
    email: formData.get("email"),
    seats: formData.get("seats") ?? 1,
    waitlist: formData.get("waitlist") === "on",
    news: formData.get("news") === "on",
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Check your name and email, then try again.",
    };
  }

  const { eventId, first, last, email, seats, waitlist, news } = result.data;
  // Wix asks for a name for each extra guest; the visitor only gives theirs.
  // A one-person RSVP leaves the guests out entirely: an event whose RSVP
  // form has no guests question rejects even an empty list.
  const guests = seats - 1;
  const additionalGuestDetails = guests
    ? {
        guestCount: guests,
        guestNames: Array.from(
          { length: guests },
          (_, i) => `Guest ${i + 1} of ${first} ${last}`,
        ),
      }
    : undefined;

  try {
    // Wix sends the confirmation (or waitlist) email itself.
    await getWixClient().rsvpV2.createRsvp({
      eventId,
      firstName: first,
      lastName: last,
      email,
      status: waitlist ? "WAITLIST" : "YES",
      // The SDK's type marks guestCount required; the API doesn't.
      additionalGuestDetails: additionalGuestDetails as { guestCount: number },
    });
  } catch (error) {
    const details = describeWixError(error);
    const refusal = details.code ? REFUSALS[details.code] : undefined;
    if (refusal) return { status: "error", message: refusal };

    // INVALID_FORM_RESPONSE means the event's Wix RSVP form has a required
    // question this form doesn't ask, or guests it doesn't allow.
    console.error("Event RSVP failed", details);
    return { status: "error", message: FAILURE_MESSAGE };
  }

  // The seat is saved either way; a newsletter hiccup shouldn't undo that.
  if (news) {
    try {
      await addToNewsletter(email);
    } catch (error) {
      console.error(
        "Newsletter signup from an RSVP failed",
        describeWixError(error),
      );
    }
  }

  // No form values are sent: the event is just a tally.
  await track(waitlist ? "Event waitlist" : "Event RSVP", undefined, {
    headers: await headers(),
  });

  return waitlist
    ? { status: "waitlisted", message: "" }
    : { status: "reserved", message: "", seats };
}
