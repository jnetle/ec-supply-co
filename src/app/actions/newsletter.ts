"use server";

import { track } from "@vercel/analytics/server";
import { headers } from "next/headers";

import { HONEYPOT_FIELD } from "@/lib/form-limits";
import { newsletterSchema } from "@/lib/form-schemas";
import type { SubscribeState } from "@/lib/newsletter";
import { addToNewsletter } from "@/lib/newsletter-signup";
import { describeWixError } from "@/lib/wix";

// Rate limited by a Vercel Firewall custom rule, not in code: POST requests
// with a `next-action` header to / or /sell-with-us, 5 per IP per 60s fixed
// window, then deny (429). /calendar's RSVP action needs the same rule.

const SUCCESS_MESSAGE = "You're on the list. Thanks for subscribing!";
const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

export async function subscribe(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Bots fill every field; real browsers leave the hidden one empty. Report
  // success so a scripted submitter gets no signal that it was filtered.
  if (formData.get(HONEYPOT_FIELD)) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const result = newsletterSchema.safeParse({ email: formData.get("email") });

  if (!result.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const { email } = result.data;

  try {
    await addToNewsletter(email);
  } catch (error) {
    console.error("Newsletter subscription failed", describeWixError(error));
    return { status: "error", message: FAILURE_MESSAGE };
  }

  // Counted here, after Wix accepts it, so honeypot hits and failed sends
  // never show up. No form values are sent: the event is just a tally.
  await track("Newsletter signup", undefined, { headers: await headers() });

  return { status: "success", message: SUCCESS_MESSAGE };
}
