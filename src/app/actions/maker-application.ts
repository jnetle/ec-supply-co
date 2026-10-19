"use server";

import { track } from "@vercel/analytics/server";
import { headers } from "next/headers";
import type { z } from "zod";

import { env } from "@/lib/env";
import { MIN_APPLICATION_FILL_MS } from "@/lib/form-limits";
import {
  makerApplicationSchema,
  type MakerApplication,
} from "@/lib/form-schemas";
import type { MakerApplicationState } from "@/lib/maker-application";
import { describeWixError, getWixClient } from "@/lib/wix";
import { MAKER_FORM_FIELDS } from "@/lib/wix-form-config";

// Rate limited by a Vercel Firewall custom rule, not in code: POST requests
// with a `next-action` header to / or /sell-with-us, 5 per IP per 60s fixed
// window, then deny (429).

const WHOLESALE_ANSWERS = {
  yes: "Yes",
  learning: "Still learning",
  no: "No",
} as const;

const PRICING_ANSWERS = {
  yes: "Yes",
  working: "Working on it",
  no: "No",
} as const;

const SUCCESS_MESSAGE =
  "Your submission is in. We will read it with the next round, and if it is a fit, you will hear from us. Best of luck!";
const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

function formValue(
  formData: FormData,
  name: string,
): FormDataEntryValue | string {
  return formData.get(name) ?? "";
}

const FIELD_LABELS: Record<keyof MakerApplication, string> = {
  first: "First name",
  last: "Last name",
  business: "Business name",
  email: "Email",
  link: "Website or social media",
  about: "About you and your work",
  city: "City",
  connection: "Connection to El Cerrito",
  wholesale: "The wholesale question",
  pricing: "The pricing question",
};

/** One message for the first field that failed, in form order. */
function validationMessage(error: z.ZodError<MakerApplication>): string {
  const issue = error.issues[0];
  const field = issue?.path[0] as keyof MakerApplication | undefined;
  if (!issue || !field || !(field in FIELD_LABELS)) {
    return "Check the form values and fill in all required fields.";
  }

  if (field === "email") return "Enter a valid email address.";
  if (field === "link") {
    return "Enter a full website or social media URL beginning with http:// or https://.";
  }
  if (field === "wholesale") return "Answer the wholesale question.";

  const label = FIELD_LABELS[field];
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

/** True when the form was sent too soon after it loaded, or with no start. */
function sentTooFast(formData: FormData): boolean {
  const started = Number(formData.get("started"));
  const elapsed = Date.now() - started;
  return !Number.isFinite(started) || started <= 0 || elapsed < MIN_APPLICATION_FILL_MS;
}

export async function submitMakerApplication(
  _prevState: MakerApplicationState,
  formData: FormData,
): Promise<MakerApplicationState> {
  // Bots commonly fill hidden fields, and send within seconds of the form
  // loading; nobody reads and fills this form that fast. Return success so
  // they receive no signal that the submission was discarded.
  if (formData.get("fax") || sentTooFast(formData)) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const result = makerApplicationSchema.safeParse({
    first: formValue(formData, "first"),
    last: formValue(formData, "last"),
    business: formValue(formData, "business"),
    email: formValue(formData, "email"),
    link: formValue(formData, "link"),
    about: formValue(formData, "about"),
    city: formValue(formData, "city"),
    connection: formValue(formData, "connection"),
    wholesale: formValue(formData, "wholesale"),
    pricing: formValue(formData, "pricing"),
  });

  if (!result.success) {
    return { status: "error", message: validationMessage(result.error) };
  }

  const application = result.data;

  try {
    await getWixClient().submissions.createSubmission({
      formId: env.makerFormId(),
      submissions: {
        [MAKER_FORM_FIELDS.firstName]: application.first,
        [MAKER_FORM_FIELDS.lastName]: application.last,
        [MAKER_FORM_FIELDS.businessName]: application.business,
        [MAKER_FORM_FIELDS.email]: application.email,
        [MAKER_FORM_FIELDS.workLink]: application.link,
        [MAKER_FORM_FIELDS.about]: application.about,
        [MAKER_FORM_FIELDS.city]: application.city,
        [MAKER_FORM_FIELDS.connection]: application.connection,
        [MAKER_FORM_FIELDS.wholesale]: WHOLESALE_ANSWERS[application.wholesale],
        [MAKER_FORM_FIELDS.pricing]: application.pricing
          ? PRICING_ANSWERS[application.pricing]
          : "",
      },
    });
  } catch (error) {
    console.error(
      "Maker application submission failed",
      describeWixError(error),
    );
    return { status: "error", message: FAILURE_MESSAGE };
  }

  // Counted here, after Wix accepts it, so honeypot hits and failed sends
  // never show up. No form values are sent: the event is just a tally.
  await track("Maker application", undefined, { headers: await headers() });

  return { status: "success", message: SUCCESS_MESSAGE };
}
