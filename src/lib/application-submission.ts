import "server-only";

import { MIN_APPLICATION_FILL_MS } from "@/lib/form-limits";

// Helpers shared by the maker and popup application Server Actions.

export function formValue(
  formData: FormData,
  name: string,
): FormDataEntryValue | string {
  return formData.get(name) ?? "";
}

/** True when the form was sent too soon after it loaded, or with no start. */
export function sentTooFast(formData: FormData): boolean {
  const started = Number(formData.get("started"));
  const elapsed = Date.now() - started;
  return (
    !Number.isFinite(started) ||
    started <= 0 ||
    elapsed < MIN_APPLICATION_FILL_MS
  );
}

/**
 * Bots commonly fill the hidden "fax" field, and send within seconds of the
 * form loading; nobody reads and fills an application that fast.
 */
export function looksLikeABot(formData: FormData): boolean {
  return Boolean(formData.get("fax")) || sentTooFast(formData);
}
