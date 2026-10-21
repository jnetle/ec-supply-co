# EC Supply Co

The El Cerrito Supply Co. site: a vintage, hand-painted-window community shop,
built from the Claude Design handoff. Next.js 16 App Router, Tailwind v4 for
tokens and layout, CSS Modules for the bespoke pieces, and Wix as the headless
backend for the maker roster, the newsletter and the maker application. Hosted on
Vercel; live since 2026-10-19 at
[www.elcerritosupplyco.com](https://www.elcerritosupplyco.com).

## Routes

| Route             | What it is                                                                         |
| ----------------- | ---------------------------------------------------------------------------------- |
| `/`               | Home: scroll-driven hero, the shop's bands, maker spotlight, visit and signup      |
| `/makers`         | Maker directory, from the Wix `LocalMakers` collection                             |
| `/sell-with-us`   | Maker submission criteria and application                                          |
| `/calendar`       | Community calendar. No events yet, so it shows an empty state and is `noindex`     |
| `/the-build`      | How the shop was built: materials, and the people who helped                       |
| `/privacy`        | What the site collects (Vercel Analytics, the two forms) and why                   |
| `/host-with-us`   | Rent the room. **Hidden for launch** (404s); see [Launch flags](#launch-flags)     |
| `/manifesto`      | The nine rules. **Hidden for launch** (404s)                                       |
| `/api/events.ics` | Public iCalendar feed. Serves a valid, empty calendar until Wix Events is wired up |

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

Only the makers come from Wix (below). Everything else is typed content in
`src/lib/content/`: the calendar, the manifesto, the host-with-us copy, the
selling criteria, and the `/the-build` helpers and photo credits (`thanks.ts`).
`nav.ts` is the single source for the site's information architecture. The
header dropdowns, the mobile drawer and the footer sitemap all read from it.

Photography is the shop's own, in `public/assets/photos/{shop,build,hennai}`.
The numbered `id-*.jpg` files are leftover stock from the handoff; only the
hidden `/host-with-us` still uses one.

`CALENDAR_EVENTS` in `src/lib/content/calendar.ts` is empty until phase two
connects Wix Events. Every view that reads it has a zero-event state, and
`/calendar` drops out of the sitemap and goes `noindex` while it is empty.

## Launch flags

Some finished features are switched off for launch with boolean constants. Each
has a `TODO` saying when to turn it back on, and each hides every link to the
feature too, not just the feature.

| Flag                            | File                              | While `false`                                                   |
| ------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `HOST_WITH_US_ENABLED`          | `src/lib/content/host-with-us.ts` | `/host-with-us` 404s; nav, footer, sitemap and booking links go |
| `CO_MARKETING_WORKSHOP_ENABLED` | `src/lib/content/host-with-us.ts` | Drops the workshop card and rental option on `/host-with-us`    |
| `MANIFESTO_ENABLED`             | `src/lib/content/manifesto.ts`    | `/manifesto` 404s; the home page teaser goes                    |
| `HOME_EVENTS_ENABLED`           | `src/lib/content/calendar.ts`     | Hides "What's coming up" on the home page                       |
| `CALENDAR_SUBSCRIBE_ENABLED`    | `src/lib/content/calendar.ts`     | Hides the subscribe box; `/api/events.ics` stays up             |

`SHOW_COMING_SOON_SIGN` in `src/components/home/hero.tsx` is a design toggle,
not a launch flag (see the motion section above).

## Known gaps

- The `/host-with-us` inquiry form is client-side only; it has a `TODO` where
  the submit endpoint goes. The maker application and newsletter submit to Wix
  Forms.
- No events yet: the calendar and the `.ics` feed are both empty until Wix
  Events is connected (phase two). `src/lib/wix-events.ts` is already written
  for it.
- When the calendar has events, seat sign-ups are remembered in the visitor's
  own browser via `localStorage`, not on a server.
- The home page's hours card says "Hours coming soon".
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

## Calendar subscription feed

> **Current state:** the route serves a valid, empty calendar
> (`createCalendar([])`), and the subscribe panel is hidden by
> `CALENDAR_SUBSCRIBE_ENABLED`. The rest of this section describes the feed once
> phase two passes it `getPublishedWixEvents()`.

`GET /api/events.ics` is a public iCalendar feed generated from the Wix Events
site attached to `WIX_CLIENT_ID`. The subscription panel on `/calendar` offers
links for Google Calendar, Apple Calendar (`webcal:`) and Outlook, plus a
button that copies the feed URL for any other app. The links
resolve against the current origin, so they work in local, preview and production
environments without a separate site URL setting.

The implementation is split into:

- `src/lib/wix-events.ts` — reads and normalizes Wix Events.
- `src/lib/ics.ts` — serializes normalized events as RFC 5545 iCalendar.
- `src/app/api/events.ics/route.ts` — serves the feed with a five-minute cache.
- `src/components/calendar/calendar-subscriptions.tsx` — renders subscription
  links on the calendar page.

### Feed policy

- Wix is the source of truth; Google, Apple and Outlook only subscribe to it.
- Draft and undated events are omitted.
- All future events and events from the previous 60 days are included. This keeps
  recent history without allowing the feed to grow forever.
- Each event uses its immutable Wix event ID in a stable `UID`, so edits update
  the existing calendar entry instead of creating a duplicate.
- Canceled Wix events remain in the feed as `STATUS:CANCELLED`. For a real event,
  cancel it first and leave it in Wix long enough for subscribers to refresh
  before deleting it. Test events that were never distributed may be deleted
  immediately.
- Text is escaped and long lines are folded according to the iCalendar format.
- Wix descriptions are converted from rich content to plain text.
- If Wix is unavailable, the endpoint returns `502` rather than an empty calendar,
  avoiding the appearance that every event was removed.

The route revalidates every five minutes, but calendar clients control their own
refresh schedules. Google Calendar in particular may take several hours to show
changes. The endpoint must remain publicly readable over HTTPS; do not put it
behind login, cookies or browser authentication.

To inspect the feed locally:

```bash
curl http://localhost:3000/api/events.ics
```

If the feed returns unfamiliar events, the configured client is connected to a
different Wix site/headless project, or Wix is showing them under **Past/Ended
events**. Verify **Settings > Development & integrations > Headless Settings**
and ensure every environment uses the client ID for the site that owns the real
events.

## Makers

`/makers` and the home page spotlight read the Wix CMS collection **`LocalMakers`**
through `getMakers()` in `src/lib/makers.ts`.

| Wix field     | Shown as                                                     |
| ------------- | ------------------------------------------------------------ |
| `title`       | Card heading (required — items without one are skipped)      |
| `makerName`   | The person behind it, under the heading                      |
| `category`    | The craft, in the byline                                     |
| `since`       | "since 2017", in the byline                                  |
| `description` | The bio                                                      |
| `image`       | The portrait, in the organic mask                            |
| `website`     | Links the heading. A bare `rosaceramics.com` gets `https://` |
| `featured`    | Unused. The spotlight rotates through everyone               |

Wix is the whole roster; there are no placeholder makers. With none in Wix, both
pages show `NO_MAKERS_NOTE` instead of cards.

- **Spotlight (home, 4 slots):** changes daily at midnight Pacific. It goes to
  whoever has waited longest since their last turn, with a seeded daily shuffle
  settling ties. Nothing is stored: every render replays the turns from
  `LAUNCH_DAY` (2026-10-19), so a new maker joins the day after they're added
  and goes straight to the front. Don't move `LAUNCH_DAY`; it would reshuffle
  everyone's place in line.
- **Directory (`/makers`):** the whole roster in a fresh seeded order each day.

Maker photos are sized by Wix's own image CDN, not the Next.js optimizer, so they
cost no image transformations on our host: `WixImage`
(`src/components/ui/wix-image.tsx`) gives next/image a loader that asks Wix for each
width in the srcset, cropped to the frame. Local images still go through Next. Upload
portraits at 1000px or wider so they stay sharp on high-density screens.

Both pages are static and revalidate every five minutes (see
[Caching and CMS edits](#caching-and-cms-edits)). If `WIX_CLIENT_ID` is unset,
the roster comes back empty. If Wix is unreachable, loading throws: a background
regeneration keeps serving the last good page rather than caching an empty
roster, and a build fails rather than deploy one.

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
count as unset. `vercel` in the same file reads Vercel's own system variables
(`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`), which need no setup.

## Deployment

The site is the Vercel project **`ec-supply-co`**, connected to
`github.com/jnetle/ec-supply-co` through the Vercel GitHub app. There is no deploy
script or GitHub Actions workflow:

- Merging to `main` builds and deploys production.
- Every other branch and PR gets a preview deployment, linked from the PR.
- Vercel runs `next build` with its Next.js defaults; there is no `vercel.json`.

Set `WIX_CLIENT_ID`, `WIX_NEWSLETTER_FORM_ID` and `WIX_MAKER_FORM_ID` in every
Vercel environment, pointing at the live premium Wix site.

`docs/domain-move.md` is the runbook for moving to `elcerritosupply.co`: Google
Workspace, the code changes, and the Vercel domains and DNS.

### Caching and CMS edits

The home page and `/makers` are regenerated at most every five minutes
(`export const revalidate = 300`). After that window, the next visit still gets
the old page and starts a rebuild in the background; the visit after that gets
the new one. So a Wix edit appears within about five minutes plus one page view.
A force reload doesn't skip this, since the cache is Vercel's, not the browser's.
To see an edit at once, redeploy from the Vercel dashboard.

### Search indexing

`allowIndexing()` in `src/lib/site.ts` lets search engines in only on a
production build served on a custom domain. Previews and `*.vercel.app`
addresses get `Disallow: /` and `noindex`. It's decided at build time, so
redeploy after changing domains. `src/app/sitemap.ts` lists every public route
and leaves out whatever a launch flag hides. `SITE_URL` in `src/lib/site.ts` is
the canonical address used by metadata, the sitemap and structured data.

The link-preview image, `public/og-image.png`, is rendered by
`npm run og:image`. Rerun it after changing the logo or address, and keep
`SHARE_IMAGE` in `src/lib/site.ts` in step with it.

Vercel Analytics (`@vercel/analytics`, in `src/app/layout.tsx`) counts page
views without cookies. `/privacy` describes it and the two forms; update that
page if either changes.

## Commands

```bash
npm run dev        # Start the development server
npm run lint       # Run ESLint
npm run build      # Create a production build
npm run start      # Serve a production build
npm run wix:forms  # List Wix form IDs and field targets
npm run og:image   # Render public/og-image.png
```
