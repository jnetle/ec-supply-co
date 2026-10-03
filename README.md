# EC Supply Co

The El Cerrito Supply Co. site: a vintage, hand-painted-window community shop,
built from the Claude Design handoff. Next.js App Router, Tailwind v4 for tokens
and layout, CSS Modules for the bespoke pieces, Wix as the headless backend for
the newsletter and the maker roster.

## Routes

| Route             | What it is                                                                    |
| ----------------- | ----------------------------------------------------------------------------- |
| `/`               | Home: scroll-driven hero, then the shop, manifesto, events, makers and signup |
| `/calendar`       | Community calendar: month list + grid, filters, seat sign-ups                 |
| `/private-events` | Private workshop and event-space rental inquiries                             |
| `/makers`         | Maker directory, from the Wix `LocalMakers` collection                        |
| `/sell-with-us`   | Maker submission criteria and application                                     |
| `/manifesto`      | The nine rules                                                                |

## How the styling is organised

- **`src/app/globals.css`** holds every design token. Palette, fonts, radii and
  shadows live in Tailwind's `@theme`, so they are real utilities
  (`bg-ecs-teal`, `font-heading`, `rounded-ecs-lg`). The stacked `text-shadow`
  "extrudes" are whole declarations rather than scale entries, so they stay in
  `:root` as `--ec-extrude*`.
- **Utilities** carry layout, spacing, colour and type.
- **CSS Modules**, co-located with their component, carry what a utility cannot
  express: the awning scallops, blob masks, `clamp()` type ramps, keyframes and
  the extrude shadows.

Adding a colour means adding one line to `@theme`; it is then available
everywhere as a utility and as `var(--color-ecs-*)` inside a module.

## How the motion is organised

The sections are Server Components carrying only data attributes. Two client
components drive everything:

- **`components/ui/scroll-effects.tsx`** — one rAF-throttled listener for
  `[data-reveal]` (fade and rise, once), `[data-parallax="n"]` (translate by
  scroll × n) and `[data-parallax-img]` (drift inside a clipping mask).
- **`hooks/use-hero-sequence.ts`** — the home hero: the period morphing into a
  squiggle, "Co" dropping to its own line at 2.4× the word pace, the suffixes
  cycling, and finally the "Coming Soon" sign lowering on its poles while the
  squiggle gives way beneath it. All of it is scrubbed directly off scroll with
  no snapping. Driven by a rAF loop gated on an IntersectionObserver, because
  on mobile the scrolling element is often an ancestor container and
  `window.scroll` never fires.

  The sign is what makes the hero a 352vh track rather than 179vh — it needs
  about seven extra scroll stops to descend and dwell on. `SHOW_COMING_SOON_SIGN`
  in `components/home/hero.tsx` turns it off and shortens the track to match.
  The plank is sized by measurement, not by CSS: its lettering takes the
  wordmark's own font size and the plank hugs that lettering, so "Co" in the
  headline and "ming Soon" on the sign line up to read "Coming Soon".

Both collapse under `prefers-reduced-motion`: the hero track shrinks to one
screen and rests at its end state — last word in, sign landed — and nothing
animates.

## Content

Makers come from Wix (below). Everything else — placeholder copy and stock
photography from the handoff — lives as typed modules in
`src/lib/content/` (`makers.ts`, `events.ts`, `calendar.ts`, `manifesto.ts`,
`criteria.ts`, `nav.ts`). `nav.ts` is the single source for the site's
information architecture — the header dropdowns, the mobile drawer and the
footer sitemap all read from it.

## Known gaps

- The two private-event inquiries are client-side only; each has a `TODO` where
  the submit endpoint goes. The maker application and newsletter submit to Wix
  Forms once their form IDs and field targets are configured.
- Calendar seat sign-ups are remembered in the visitor's own browser via
  `localStorage`, not on a server.
- All photography is placeholder stock from the handoff.
- `/coming-soon` from the handoff was not built.
- The handoff's Manifesto and Coming Soon pages use a second, later palette
  (Baloo 2, brighter teal and marigold). The site uses one palette throughout,
  so `/manifesto` deliberately departs from its own screenshots.

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

## Makers

`/makers` and the home page spotlight read the Wix CMS collection **`LocalMakers`**
through `getMakers()` in `src/lib/makers.ts`.

| Wix field     | Shown as                                                |
| ------------- | ------------------------------------------------------- |
| `title`       | Card heading (required — items without one are skipped) |
| `makerName`   | The person behind it, under the heading                 |
| `category`    | The craft, in the byline                                |
| `since`       | "since 2017", in the byline                             |
| `description` | The bio                                                 |
| `image`       | The portrait, in the organic mask                       |
| `website`     | Links the heading                                       |
| `featured`    | Boolean. Puts the maker in the home spotlight (4 slots) |

Until the CMS holds the full roster, the 20 placeholder makers in
`src/lib/content/makers.ts` are listed after the Wix ones and top up the spotlight.
Delete `PLACEHOLDER_MAKERS` once the real list is in.

Maker photos are sized by Wix's own image CDN, not the Next.js optimizer, so they
cost no image transformations on our host: `WixImage`
(`src/components/ui/wix-image.tsx`) gives next/image a loader that asks Wix for each
width in the srcset, cropped to the frame. Local images still go through Next. Upload
portraits at 1000px or wider so they stay sharp on high-density screens.

Both pages are static and revalidate every five minutes, so a CMS edit shows up
within that window. If Wix is unreachable or `WIX_CLIENT_ID` is unset, the error is
logged and the pages render the placeholders alone.

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

3. Copy the form ID into `.env.local`:

   ```
   WIX_NEWSLETTER_FORM_ID=<id from the script>
   ```

Submission keys are each field's `target` — its stable storage key, not its label or
ID — and Wix rejects keys that don't match one. The newsletter email target is the
typed constant `NEWSLETTER_FORM_FIELDS.email` in `src/lib/wix-form-config.ts`.
Update it if the Wix field is deleted and recreated with a different target.

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

## Maker application

`/sell-with-us` posts the maker application to a separate Wix form. Create a
standalone form named **Maker application** under **Customers & Leads > Forms &
Submissions** on the same Wix site as the headless client.

Add these fields. Use plain **Short answer** or **Long answer** fields as listed;
the site owns the visible controls and Wix is the submission inbox. The Email
field may use Wix's **Email** type.

| Wix field label                | Wix field type | Required |
| ------------------------------ | -------------- | -------- |
| First name                     | Short answer   | Yes      |
| Last name                      | Short answer   | Yes      |
| Business name                  | Short answer   | Yes      |
| Email                          | Email          | Yes      |
| Website or social media        | Short answer   | Yes      |
| About the maker and their work | Long answer    | Yes      |
| Current city                   | Short answer   | No       |
| Connection to El Cerrito       | Long answer    | No       |
| Wholesale understanding        | Short answer   | Yes      |
| Wholesale pricing readiness    | Short answer   | No       |

Set spam protection to **None** or **Basic**, not Advanced, for the same reason
described above. Then add the form ID to `.env.local` and the matching Vercel
environment:

```bash
WIX_MAKER_FORM_ID=3f22c99a-cd9e-4300-8fe9-88fc174cd650
```

The form ID is an identifier, not a secret. The stable field targets are typed
constants in `src/lib/wix-form-config.ts`; update that file if a Wix field is
deleted and recreated with a different target.

The server also uses Zod to validate required fields, email, URL, accepted choice
values, and length limits before sending anything to Wix. A hidden honeypot
discards common bot submissions. After configuration, make one test submission
and confirm it persists under the maker form in Wix before deploying.

## Configuration

### All environments use the same Wix forms

Local development, Vercel preview deployments and production must all use the
same Wix site, Newsletter Subscription form and Maker Application form. Set the
same `WIX_CLIENT_ID`, `WIX_NEWSLETTER_FORM_ID` and `WIX_MAKER_FORM_ID` values in
every environment.

This is required because the forms' stable field targets are compiled into
`src/lib/wix-form-config.ts`. Pointing an environment at a different Wix form may
cause submissions to be rejected or written under the wrong fields. If separate
Wix forms become necessary later, move each complete form configuration — ID and
field targets — behind an environment-specific mapping.

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
