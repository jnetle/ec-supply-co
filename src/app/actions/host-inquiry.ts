"use server";

import { track } from "@vercel/analytics/server";
import { headers } from "next/headers";
import type { z } from "zod";

import type { ApplicationState } from "@/lib/application-state";
import { formValue, looksLikeABot } from "@/lib/application-submission";
import { env } from "@/lib/env";
import { hostInquirySchema, type HostInquiry } from "@/lib/form-schemas";
import { describeWixError, getWixClient } from "@/lib/wix";
import { HOST_FORM_FIELDS } from "@/lib/wix-form-config";

// Rate limited by the Vercel Firewall custom rule described in
// maker-application.ts, which must include /host-with-us.

const USE_ANSWERS = {
  "private-event": "Private event",
  "co-marketing-workshop": "Co-marketing workshop",
  "pitch-an-idea": "Pitch an idea",
} as const;

const CATERING_ANSWERS = {
  "coffee-cart": "Coffee cart",
  "food-vendor": "Food vendor from the community",
} as const;

const NEEDS_ANSWERS = {
  "additional-table": "Additional table",
  "garden-area": "Garden in the back",
} as const;

const SUCCESS_MESSAGE =
  "We got your inquiry, and we will be in touch about availability and next steps.";
const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

const FIELD_LABELS: Partial<Record<keyof HostInquiry, string>> = {
  first: "First name",
  last: "Last name",
  about: "About your event or idea",
  notes: "Additional information",
};

/** One message for the first field that failed, in form order. */
function validationMessage(error: z.ZodError<HostInquiry>): string {
  const issue = error.issues[0];
  const field = issue?.path[0] as keyof HostInquiry | undefined;

  if (field === "email") return "Enter a valid email address.";
  if (field === "type") return "Choose how you would like to use the space.";
  if (field === "when") return "Check the preferred date and time.";
  if (field === "people") return "Enter how many people as a number.";

  const label = field && FIELD_LABELS[field];
  if (!issue || !label) {
    return "Check the form values and fill in all required fields.";
  }

  switch (issue.code) {
    case "too_small":
      return `${label} is required.`;
    case "too_big":
      return `Keep ${label.toLowerCase()} under ${issue.maximum.toLocaleString("en-US")} characters.`;
    case "invalid_format":
      return `${label} contains characters we can't accept.`;
    default:
      return `Check ${label.toLowerCase()} and try again.`;
  }
}

/**
 * The browser sends "2026-11-05T18:00" with no time zone, and it means shop
 * time, so format it as written rather than converting it.
 */
function readableDateTime(value: string): string {
  if (value === "") return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}Z`));
}

export async function submitHostInquiry(
  _prevState: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  // Return success to bots so they receive no signal that the submission
  // was discarded.
  if (looksLikeABot(formData)) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const result = hostInquirySchema.safeParse({
    first: formValue(formData, "first"),
    last: formValue(formData, "last"),
    email: formValue(formData, "email"),
    type: formValue(formData, "type"),
    when: formValue(formData, "when"),
    people: formValue(formData, "people"),
    catering: formData.getAll("catering"),
    needs: formData.getAll("needs"),
    about: formValue(formData, "about"),
    notes: formValue(formData, "notes"),
  });

  if (!result.success) {
    return { status: "error", message: validationMessage(result.error) };
  }

  const inquiry = result.data;

  try {
    await getWixClient().submissions.createSubmission({
      formId: env.hostFormId(),
      submissions: {
        [HOST_FORM_FIELDS.firstName]: inquiry.first,
        [HOST_FORM_FIELDS.lastName]: inquiry.last,
        [HOST_FORM_FIELDS.email]: inquiry.email,
        [HOST_FORM_FIELDS.use]: USE_ANSWERS[inquiry.type],
        [HOST_FORM_FIELDS.when]: readableDateTime(inquiry.when),
        [HOST_FORM_FIELDS.people]: inquiry.people,
        [HOST_FORM_FIELDS.catering]: inquiry.catering
          .map((answer) => CATERING_ANSWERS[answer])
          .join(", "),
        [HOST_FORM_FIELDS.needs]: inquiry.needs
          .map((answer) => NEEDS_ANSWERS[answer])
          .join(", "),
        [HOST_FORM_FIELDS.about]: inquiry.about,
        [HOST_FORM_FIELDS.notes]: inquiry.notes,
      },
    });
  } catch (error) {
    console.error("Host inquiry submission failed", describeWixError(error));
    return { status: "error", message: FAILURE_MESSAGE };
  }

  // Counted after Wix accepts it; no form values are sent.
  await track("Host inquiry", undefined, { headers: await headers() });

  return { status: "success", message: SUCCESS_MESSAGE };
}
