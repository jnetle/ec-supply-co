import "server-only";

import { env } from "@/lib/env";
import { getWixClient } from "@/lib/wix";
import { NEWSLETTER_FORM_FIELDS } from "@/lib/wix-form-config";

/**
 * Adds an address to the newsletter. Lands in Wix under Customers & Leads >
 * Forms & Submissions, alongside submissions from the classic site, and runs
 * that form's automations. The submission key is the field's stable `target`
 * in the form schema, not its label or ID.
 */
export async function addToNewsletter(email: string) {
  await getWixClient().submissions.createSubmission({
    formId: env.newsletterFormId(),
    submissions: { [NEWSLETTER_FORM_FIELDS.email]: email },
  });
}
