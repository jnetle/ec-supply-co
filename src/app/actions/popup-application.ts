"use server";

import { track } from "@vercel/analytics/server";
import { headers } from "next/headers";
import type { z } from "zod";

import type { ApplicationState } from "@/lib/application-state";
import { formValue, looksLikeABot } from "@/lib/application-submission";
import { env } from "@/lib/env";
import {
  popupApplicationSchema,
  type PopupApplication,
} from "@/lib/form-schemas";
import { describeWixError, getWixClient } from "@/lib/wix";
import { POPUP_FORM_FIELDS } from "@/lib/wix-form-config";

// Rate limited by the Vercel Firewall custom rule described in
// maker-application.ts, which must include /popup-with-us.

const PERMIT_ANSWERS = {
  yes: "Yes",
  no: "No",
  working: "Working on it",
} as const;

const PAYMENT_ANSWERS = {
  yes: "Yes",
  no: "No",
} as const;

const SUCCESS_MESSAGE =
  "Your application is in. We will read it soon, and if it is a fit, you will hear from us about dates. Best of luck!";
const FAILURE_MESSAGE = "Something went wrong on our end. Please try again.";

const FIELD_LABELS: Record<keyof PopupApplication, string> = {
  first: "First name",
  last: "Last name",
  business: "Business name",
  email: "Email",
  link: "Website or social media",
  about: "About your popup",
  city: "City",
  connection: "Connection to El Cerrito",
  permit: "The health permit question",
  payment: "The payment question",
};

/** One message for the first field that failed, in form order. */
function validationMessage(error: z.ZodError<PopupApplication>): string {
  const issue = error.issues[0];
  const field = issue?.path[0] as keyof PopupApplication | undefined;
  if (!issue || !field || !(field in FIELD_LABELS)) {
    return "Check the form values and fill in all required fields.";
  }

  if (field === "email") return "Enter a valid email address.";
  if (field === "link") {
    return "Enter a website or social media link, like yourpopup.com or instagram.com/yourpopup.";
  }
  if (field === "permit") return "Answer the health permit question.";
  if (field === "payment") return "Answer the payment question.";

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

export async function submitPopupApplication(
  _prevState: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  // Return success to bots so they receive no signal that the submission
  // was discarded.
  if (looksLikeABot(formData)) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const result = popupApplicationSchema.safeParse({
    first: formValue(formData, "first"),
    last: formValue(formData, "last"),
    business: formValue(formData, "business"),
    email: formValue(formData, "email"),
    link: formValue(formData, "link"),
    about: formValue(formData, "about"),
    city: formValue(formData, "city"),
    connection: formValue(formData, "connection"),
    permit: formValue(formData, "permit"),
    payment: formValue(formData, "payment"),
  });

  if (!result.success) {
    return { status: "error", message: validationMessage(result.error) };
  }

  const application = result.data;

  try {
    await getWixClient().submissions.createSubmission({
      formId: env.popupFormId(),
      submissions: {
        [POPUP_FORM_FIELDS.firstName]: application.first,
        [POPUP_FORM_FIELDS.lastName]: application.last,
        [POPUP_FORM_FIELDS.businessName]: application.business,
        [POPUP_FORM_FIELDS.email]: application.email,
        [POPUP_FORM_FIELDS.link]: application.link,
        [POPUP_FORM_FIELDS.about]: application.about,
        [POPUP_FORM_FIELDS.city]: application.city,
        [POPUP_FORM_FIELDS.connection]: application.connection,
        [POPUP_FORM_FIELDS.permit]: PERMIT_ANSWERS[application.permit],
        [POPUP_FORM_FIELDS.payment]: PAYMENT_ANSWERS[application.payment],
      },
    });
  } catch (error) {
    console.error(
      "Popup application submission failed",
      describeWixError(error),
    );
    return { status: "error", message: FAILURE_MESSAGE };
  }

  // Counted after Wix accepts it; no form values are sent.
  await track("Popup application", undefined, { headers: await headers() });

  return { status: "success", message: SUCCESS_MESSAGE };
}
