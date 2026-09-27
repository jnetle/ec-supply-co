# EC Supply Co

The El Cerrito Supply Co. site: a vintage, hand-painted-window community shop,
built from the Claude Design handoff. Next.js App Router, Tailwind v4 for tokens
and layout, CSS Modules for the bespoke pieces, Wix as the headless backend for
the newsletter.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home: scroll-driven hero, then the shop, manifesto, events, makers and signup |
| `/calendar` | Community calendar: month list + grid, filters, seat sign-ups |
| `/private-events` | Private workshop and event-space rental inquiries |
| `/makers` | Maker directory with craft filters and live search |
| `/sell-with-us` | Maker submission criteria and application |
| `/manifesto` | The nine rules |

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

Placeholder copy and stock photography from the handoff live as typed modules in
`src/lib/content/` (`makers.ts`, `events.ts`, `calendar.ts`, `manifesto.ts`,
`criteria.ts`, `nav.ts`). `nav.ts` is the single source for the site's
information architecture — the header dropdowns, the mobile drawer and the
footer sitemap all read from it.

## Known gaps

- The maker application and the two private-event inquiries are client-side
  only; each has a `TODO` where the submit endpoint goes. The newsletter
  (below) shows the shape to follow.
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
