// Lists the Wix Forms on the site behind WIX_CLIENT_ID, with each field's
// `target` — the key a submission must use.
//
// Run: npm run wix:forms
//
// That script loads .env.local with --env-file-if-exists and silences Node's
// MODULE_TYPELESS_PACKAGE_JSON warning, which fires because this imports a .ts
// file from a package.json without "type": "module".
import { createClient, OAuthStrategy } from "@wix/sdk";
import { forms } from "@wix/forms";

import { env } from "../src/lib/env.ts";

const NAMESPACE = "wix.form_app.form";

let clientId;
try {
  clientId = env.wixClientId();
} catch (error) {
  console.error(error.message);
  console.error(
    "If you ran this with plain `node`, use `npm run wix:forms` so .env.local loads.",
  );
  process.exit(1);
}

const client = createClient({
  modules: { forms },
  auth: OAuthStrategy({ clientId }),
});

const { items = [] } = await client.forms
  .queryForms({ namespace: NAMESPACE })
  .find();

if (items.length === 0) {
  console.log(`No forms found in namespace "${NAMESPACE}" for this client ID.`);
  console.log(
    "The headless client is probably attached to a different site than the",
  );
  console.log(
    "one holding your form. Create the headless client on the site that owns",
  );
  console.log("the forms, then re-run this script.");
  process.exit(0);
}

for (const form of items) {
  console.log(`\nForm: ${form.name ?? "(unnamed)"}`);
  console.log(`  id: ${form._id}`);
  console.log("  fields:");
  // Fields without a target (submit buttons, static text) hold no value.
  const inputs = (form.fields ?? []).filter((field) => field.target);
  for (const field of inputs) {
    const label = field.view?.label ?? "";
    const kind = field.view?.fieldType ?? "?";
    const required = field.validation?.required ? " (required)" : "";
    console.log(
      `    target: ${String(field.target).padEnd(20)} ${String(kind).padEnd(18)}${label ? `label: ${label}` : ""}${required}`,
    );
  }
  const emailField = inputs.find(
    (field) =>
      field.view?.fieldType === "CONTACTS_EMAIL" ||
      field.validation?.string?.format === "EMAIL",
  );
  if (emailField) console.log(`  email target: ${emailField.target}`);
}
console.log();
