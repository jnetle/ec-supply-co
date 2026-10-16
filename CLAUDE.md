@AGENTS.md

## Buttons

Every button-looking thing on the site comes from `button()` in
`src/components/ui/button.ts` (styles in `button.module.css`). It returns a
class list, so it works on `<button>`, `<a>`, `<Link>` and Radix triggers.

1. **No one-off button CSS.** A page module may add layout to a button
   (margin, `align-self`, width, position) through the `className` option.
   Never colour, border, radius, padding, font or hover.
2. **Pick the variant by importance, not looks.**
   - `solid`: the one main action in a group. At most one per group.
   - `outline`: the other actions beside it, and toggles (`aria-pressed`).
   - `link`: quiet or inline-weight actions ("See the month view ↓").
3. **One hover.** Solid and outline lift 2px with a hard ply shadow; outline
   also fills with its colour. Link only firms up its underline. Press drops
   back flat. Keyboard focus looks like hover plus a ring. Nothing darkens,
   lightens, brightens, scales or tilts. Hover only applies on real pointers.
4. **Sizes.** `sm` (44px) for toolbars, card rows and anything dense; `md`
   (48px) is the default; `lg` (56px) for form submits and a band's single
   headline action. Nothing tappable goes below 44px.
5. **Tones** come from the fixed list in `button.ts`. On dark bands use
   `paper`. `custom` + `buttonColors()` is only for colours that come from
   data, such as event categories. Adding a tone is a design decision.
6. **Labels** are written in sentence case; the CSS uppercases them (links
   stay as written). A trailing `→` means it goes to another page or section.
7. **States.** Disabled: the `disabled` attribute (or `aria-disabled` on a
   link). A form that is sending sets `aria-busy` as well as `disabled`.
   An icon-only button (`icon: true`) needs an `aria-label`.

Deliberate exceptions, which are not buttons: the tilted "Visit" sign in the
desktop nav, the hero's "replay" overlay chip, calendar day chips, whole-card
links (the "Your event here?" note), and inline text links inside copy or
listings (maker names, "Visit {host}").
