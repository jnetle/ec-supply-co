// The single place environment variables are read. Nothing else in the app or
// in scripts/ should touch `process.env` — add new variables here instead.
//
// Deliberately free of the `server-only` import so scripts/ can load this under
// plain Node. That also means it must stay erasable TypeScript — no enums, no
// namespaces, no parameter properties — for Node's type stripping to handle it.

const FORMS_HINT =
  "Run `npm run wix:forms` to list form IDs and field targets.";

const HINTS = {
  WIX_CLIENT_ID:
    "Find it in the Wix dashboard under Settings > Development & integrations > Headless Settings.",
  WIX_NEWSLETTER_FORM_ID: FORMS_HINT,
  WIX_MAKER_FORM_ID: FORMS_HINT,
} as const;

type EnvKey = keyof typeof HINTS;

function optional(key: EnvKey): string | undefined {
  // Treat blank and whitespace-only as unset — `.env` files make both easy.
  const value = process.env[key]?.trim();
  return value === "" ? undefined : value;
}

function required(key: EnvKey): string {
  const value = optional(key);
  if (!value) {
    throw new Error(`${key} is not set. Add it to .env.local. ${HINTS[key]}`);
  }
  return value;
}

// Read lazily so a missing variable fails where it is used, with a message
// naming it, rather than crashing the whole app at import time.
export const env = {
  wixClientId: () => required("WIX_CLIENT_ID"),
  newsletterFormId: () => required("WIX_NEWSLETTER_FORM_ID"),
  makerFormId: () => required("WIX_MAKER_FORM_ID"),
};
