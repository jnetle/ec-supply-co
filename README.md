# EC Supply Co

A Next.js storefront using Wix as its headless CMS.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect Wix CMS

1. In Wix, go to **Settings > Development & integrations > Headless Settings**.
2. Create a headless client for this website and copy its client ID.
3. Copy `.env.example` to `.env.local` and set `WIX_CLIENT_ID`.
4. In each Wix CMS collection used by the site, grant the appropriate read permission to visitors.

The Wix client lives in `src/lib/wix.ts`. Use it only in Server Components, Server Actions, or Route Handlers:

```tsx
import { getWixClient } from "@/lib/wix";

export default async function Page() {
  const { items } = await getWixClient().items.query("YourCollectionId").find();

  return <pre>{JSON.stringify(items, null, 2)}</pre>;
}
```

Replace `YourCollectionId` with the collection ID shown in the Wix CMS collection settings. The integration uses visitor OAuth, so reads follow the collection permissions configured in Wix.

## Newsletter signup

The signup form posts to the existing Wix form under **Customers & Leads > Forms &
Submissions**, so headless submissions land in the same inbox as the classic site's
and trigger that form's automations.

1. Create the headless client on the **site that owns the form** — a client from a
   different site cannot see it.
2. List the site's forms and their field targets:

   ```bash
   npm run wix:forms
   ```

3. Copy the values into `.env.local`:

   ```
   WIX_NEWSLETTER_FORM_ID=<id from the script>
   WIX_NEWSLETTER_EMAIL_FIELD=<the email field's target, if not "email">
   ```

Submission keys are each field's `target` — its stable storage key, not its label or
ID — and Wix rejects keys that don't match one. The script prints the real targets.

Anonymous visitor tokens may create submissions but may not read them back, so the
form cannot be used to enumerate subscribers.

### Spam protection must not be ADVANCED

Set the form's spam protection to **None** or **Basic** in the Wix dashboard. With
**Advanced**, Wix requires a CAPTCHA token that a headless client cannot produce.
`createSubmission()` still resolves successfully and the visitor still sees the
success message, but the submission is created as `PENDING`, never recorded, and
silently auto-deleted minutes later. Verified: submissions made under Advanced
return `NOT_FOUND` shortly after; those made under None persist.

Do not treat the `status` in the create response as a success signal — it reads
`PENDING` either way.

## Configuration

Every environment variable is read in one place: `src/lib/env.ts`. Nothing else in
`src/` or `scripts/` touches `process.env` — add new variables there, with a hint
explaining where to find the value, and import `env` from it.

Values are read lazily, so a missing variable fails where it is used with a message
naming it, rather than crashing the app at import. Blank and whitespace-only values
count as unset.

## Commands

```bash
npm run dev        # Start the development server
npm run lint       # Run ESLint
npm run build      # Create a production build
npm run start      # Serve a production build
npm run wix:forms  # List Wix form IDs and field targets
```
