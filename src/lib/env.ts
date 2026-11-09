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
  WIX_POPUP_FORM_ID: FORMS_HINT,
  WIX_HOST_FORM_ID: FORMS_HINT,
  WIX_API_KEY:
    "Wix dashboard > Settings > API Keys. Tick the Wix Events permission. Server-only: never prefix it NEXT_PUBLIC_.",
  WIX_SITE_ID: "The ID after /dashboard/ in the Wix dashboard's address bar.",
  GOOGLE_PLACES_API_KEY:
    "Google Cloud console > APIs & Services > Credentials. Enable Places API (New) and restrict the key to it.",
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
  popupFormId: () => required("WIX_POPUP_FORM_ID"),
  hostFormId: () => required("WIX_HOST_FORM_ID"),
  // Acts as the site owner, so it can read guest lists. Server-only.
  wixApiKey: () => required("WIX_API_KEY"),
  wixSiteId: () => required("WIX_SITE_ID"),
  // Optional: without a key the visit section falls back to a note and links.
  googlePlacesApiKey: () => optional("GOOGLE_PLACES_API_KEY"),
};

/**
 * Vercel's production deployment and the domain it is served on. Both are
 * Vercel system variables, set at build time. Previews also see the production
 * domain, so check the environment as well.
 */
export const vercel = {
  isProduction: () => process.env.VERCEL_ENV === "production",
  productionHost: () => optionalSystem("VERCEL_PROJECT_PRODUCTION_URL"),
};

function optionalSystem(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value === "" ? undefined : value;
}
