"use server";

import { z } from "zod";

import { env } from "@/lib/env";
import type { MakerApplicationState } from "@/lib/maker-application";
import { getWixClient } from "@/lib/wix";
import { MAKER_FORM_FIELDS } from "@/lib/wix-form-config";

const MAX_SHORT_TEXT_LENGTH = 200;
const MAX_LONG_TEXT_LENGTH = 5_000;

const requiredShortText = z.string().trim().min(1).max(MAX_SHORT_TEXT_LENGTH);
const optionalShortText = z.string().trim().max(MAX_SHORT_TEXT_LENGTH);
const optionalLongText = z.string().trim().max(MAX_LONG_TEXT_LENGTH);

const makerApplicationSchema = z.object({
  first: requiredShortText,
  last: requiredShortText,
  business: requiredShortText,
  email: z
    .string()
    .trim()
    .max(254)
    .email()
    .transform((value) => value.toLowerCase()),
  link: z
    .string()
    .trim()
    .min(1)
    .max(2_048)
    .url()
    .refine(
      (value) =>
        URL.canParse(value) &&
        ["http:", "https:"].includes(new URL(value).protocol),
    ),
  about: z.string().trim().min(1).max(MAX_LONG_TEXT_LENGTH),
  city: optionalShortText,
  connection: optionalLongText,
  wholesale: z.enum(["yes", "learning", "no"]),
  pricing: z.union([z.literal(""), z.enum(["yes", "working", "no"])]),
});

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

function validationMessage(error: z.ZodError): string {
  const invalidFields = new Set(error.issues.map((issue) => issue.path[0]));

  if (invalidFields.has("email")) return "Enter a valid email address.";
  if (invalidFields.has("link")) {
    return "Enter a full website or social media URL beginning with http:// or https://.";
  }

  return "Check the form values and fill in all required fields.";
}

export async function submitMakerApplication(
  _prevState: MakerApplicationState,
  formData: FormData,
): Promise<MakerApplicationState> {
  // Bots commonly fill hidden fields. Return success so they receive no signal
  // that the submission was discarded.
  if (formData.get("fax")) {
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
    console.error("Maker application submission failed", error);
    return { status: "error", message: FAILURE_MESSAGE };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
