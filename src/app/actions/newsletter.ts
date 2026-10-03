"use server";

import { env } from "@/lib/env";
import type { SubscribeState } from "@/lib/newsletter";
import { getWixClient } from "@/lib/wix";
import { NEWSLETTER_FORM_FIELDS } from "@/lib/wix-form-config";

// Server Actions are public POST endpoints, so every value here is untrusted.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

const SUCCESS_MESSAGE = "You're on the list. Thanks for subscribing!";
const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

export async function subscribe(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Bots fill every field; real browsers leave the hidden one empty. Report
  // success so a scripted submitter gets no signal that it was filtered.
  if (formData.get("company")) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const submitted = formData.get("email");
  const email =
    typeof submitted === "string" ? submitted.trim().toLowerCase() : "";

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    // Lands in Wix under Customers & Leads > Forms & Submissions, alongside
    // submissions from the classic site, and runs that form's automations.
    // The submission key is the field's stable `target` in the form schema,
    // not its label or ID.
    await getWixClient().submissions.createSubmission({
      formId: env.newsletterFormId(),
      submissions: { [NEWSLETTER_FORM_FIELDS.email]: email },
    });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    return { status: "error", message: FAILURE_MESSAGE };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
