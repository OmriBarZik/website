---
name: css-architecture
description: Write and refactor CSS with a layered, maintainable architecture. Use whenever adding or changing styles in this project (.astro/.svelte/.css) — decide where a rule belongs (token, base, layout, component, or page), name classes consistently, keep the cascade predictable, and respect the project's strict CSP (no inline styles). Triggers on "style", "CSS", "scoped styles", "global styles", "theme", "design tokens", "refactor styles".
---

# CSS architecture

Distilled from Elad Shechter's CSS-architecture series and the Appwrite "CSS Color
Architecture" article, adapted for this **Astro + Svelte** project (no Sass).

## The mental model: where does a rule belong?

Every rule lives in exactly one layer. Decide top-down — use the most local home
that fits.

| Layer                  | Lives in                             | Holds                                                                                                                                                           | Scope        |
| ---------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Tokens**             | `src/styles/tokens.css`              | design tokens (`:root` custom properties)                                                                                                                       | global       |
| **Reset / base**       | `src/styles/base.css`                | reset, base element styles, the decorative wash, **shared primitives**: `.wrap`, `.btn*`, `.tag*`, `.kicker`, `.mono`, `.icon-btn`, `.brand`, dot colors, `.ph` | global       |
| **Layout (app shell)** | `src/styles/layout.css`              | `.site-header`, `.site-footer`, `.section`, `.sec-head`                                                                                                         | global       |
| **Article/reading**    | `src/styles/article.css`             | prose, TOC, pager, Prism theme — imported **only** by `PostLayout`/`about`                                                                                      | per-template |
| **Component**          | the component's own scoped `<style>` | everything specific to one component (`.feat-card`, `.sandbox`, `.subscribe`, …)                                                                                | scoped       |
| **Page**               | the page's scoped `<style>`          | one-off styles for one route (`.hero`, `.demo-grid`, …)                                                                                                         | scoped       |

**Rule of thumb:** if a class appears in exactly one component/page, its styles
go _in that component/page_. If it's reused across many (a button, a tag, the
container width), it's a primitive → `base.css`. Default to local; promote to
global only when genuinely shared. This is Elad's partials model
(elements → components → pages), expressed through Astro/Svelte scoped styles
instead of Sass files + BEM.

## Naming (when a global/shared class is needed)

- lowercase, hyphen-separated: `.post-row`, `.sec-head`.
- **Flat, not deeply chained**: `.main-nav-item`, never `.main-nav-list-item`.
- One **structural** class per element; layer extra classes by prefix:
  - `is-` state (`is-open`, `is-active`) — toggled by JS/Svelte.
  - `u-` utility, single-purpose, may use `!important`.
  - `e-` entity (a variant; at most one per element).
  - `p-` page (on `<body>`/wrapper) for page-specific overrides.
  - `js-` JS hook only — **never** styled.
- Scoped component styles don't need namespacing prefixes — the scope _is_ the
  namespace.

## Layout: reach for grid, drop the wrappers

The markup should carry meaning, not scaffolding. Let CSS place elements; don't
nest elements to fake a layout.

- **Prefer CSS Grid** (`grid-template-areas`, `subgrid`, `grid-template-columns`)
  to position **direct children**. Don't add a wrapper `<div>`/`<span>` whose only
  job is to group siblings for layout — name areas and place the children instead.
  Areas also span cleanly (one cell across two rows) without an intermediate box.
- **Flex** is still the right tool for **1-D flow** that wraps or distributes
  (e.g. a row of chips, an icon next to a label). Grid is for **2-D placement**
  and for replacing wrapper-based stacking.
- **Decorative bits** — separators, dots, bullets, dividers, rules — are
  `::before`/`::after` pseudo-elements, **never** an empty `<span>`/`<div>`.
- **One element per meaningful piece of content.** Before adding any wrapper,
  ask what content it represents; if the answer is "just positioning," delete it
  and solve it in the grid.
- Worked example: `.post-row` in `PostList.svelte` is a two-row grid
  (`"num title date" / "num meta date"`) — `num`/`title`/`meta`/`date` are all
  direct children placed by area (no stacking wrapper), and the `·` separator is
  a `.t::before` (no `.dot` element).

## Color tokens (three tiers)

All colors live in `tokens.css`. Components reference **only tier 2**.

1. **Tier 1 · primitives** — raw ramps: `--terracotta-50…900`, `--forest-50…900`,
   the neutrals (`--paper*`, `--ink`/`--ink-soft`/`--muted`/`--faint`, `--line*`),
   and the code/terminal palette (`--code-*`, `--term-*`, `--syntax-*`).
   Referenced only by tier 2.
2. **Tier 2 · semantic roles** — what a color _means_: `--primary` /
   `--primary-strong` / `--primary-soft`, `--secondary*`, `--text-heading` /
   `--text-body` / `--text-soft` / `--text-muted` / `--text-faint` / `--text-link`,
   `--surface` / `--surface-raised` / `--surface-sunken` / `--surface-invert`,
   `--border` / `--border-strong`, `--topic-*`.
3. **Tier 3 · components** reference roles, never primitives or hex literals.
   (Theme/dark-mode = reassign the role layer, not component rules.)

**Format:** authored in **OKLCH** (perceptually uniform — adjust L for
lighter/darker, C for vividness) with an exact **hex fallback**. Pattern: declare
hex in `:root`, override in `@supports (color: oklch(0% 0 0)) { :root { … } }`.
Tints/translucency via `color-mix(in oklab, var(--role) N%, transparent)`.

## Token scales (compose, never hardcode)

- **Spacing** `--space-50…1000` and **radius** `--radius-50…200` both derive from
  `--base-unit: 0.5rem` (8px) via `calc()` — the number is the step ×100 (`100` =
  8px, `150` = 12px, `200` = 16px…), an **8pt grid** with 4px half-steps. Snap odd
  values to the nearest step; leave 1–3px hairlines/optical nudges and media-query
  widths raw. (`--radius-pill`/`--radius-full` are off-grid.)
- **Motion** `--duration-fast|normal|slow` + `--ease` / `--ease-out` (keep
  `linear`/`steps()` where semantically needed).
- **Shadow** `--shadow-sm|·|-md|-lg` — layered, warm-tinted (`--shadow-hsl`),
  single overhead light source; pick by elevation, don't roll your own stack.

## Nesting (native CSS)

- Use **native CSS nesting** to keep a component's rules together: nest
  `&:hover`/`&.is-active`/`&::before` and structural children inside their parent
  block instead of repeating the parent selector. It mirrors the markup tree and
  reads top-down.
- Don't over-nest: keep it **shallow** (the same low/flat specificity goal — a
  child or two deep, not a five-level chain). If nesting gets deep, that's a
  signal to flatten the selector or split the component.
- `&` is **required** when it changes meaning — compound selectors on the same
  element (`&:hover`, `&.active`, `&::before`). For a nested **descendant** class,
  a bare selector (`.num`, `.pmeta`) reads fine and is what we use.
- Worked example: `PostList.svelte` nests `.num`/`.pt`/`.pmeta`/`.date` (and the
  `.t::before` separator) inside `.post-row`.

## Cascade & specificity

- Keep specificity **low and flat**. Avoid long descendant chains and `#id`
  styling. One class is usually enough.
- Astro/Svelte **scoped** styles are _unlayered_ and slightly higher specificity
  (scope attribute), so they cleanly beat global `base`/`layout` rules without
  `!important`. Lean on that instead of specificity hacks.
- For greenfield global CSS, order with **cascade layers** so later concerns win
  regardless of selector strength:
  `@layer reset, base, layout;` then `@layer base { … }`. Layers beat specificity.
- Modern reset (reference): `*:where(:not(iframe,canvas,img,svg,video)) { all: unset; display: revert } *,*::before,*::after{box-sizing:border-box} img{max-width:100%}` — the `:where()` keeps it at zero specificity.

## Svelte scoped-style gotcha (important here)

Svelte only scopes classes that appear **literally** in the template; it purges
selectors for classes that are added **dynamically** (`class={line.cls}`). For
those, namespace under a static root class with `:global()`:

```svelte
<div class="sandbox"> … <div class={line.cls}>…</div> … </div>
<style>
  .sandbox { … }                       /* static → auto-scoped */
  .sandbox :global(.err) { color: … }  /* dynamic class → scoped via :global */
</style>
```

`:global()` _unqualified_ leaks site-wide — always anchor it to the component's
root class.

## This project's hard constraints

- **Strict CSP, no inline styles.** Never add `style="…"` attributes or inline
  `<style>` with dynamic values — they break the policy. Put values in classes.
  See [[csp-and-highlighting]]. Syntax highlighting is **Prism** (class-based),
  not Shiki, for the same reason.
- Astro extracts component `<style>` into hashed/`'self'` CSS at build, so scoped
  styles are CSP-safe.
- Keep each stylesheet focused and small (Elad's guidance: well under ~200 lines,
  one concern per file). If a file sprawls, split it.
- **Stylelint** (config-standard + `postcss-html`) gates style quality across
  `.css`/`.astro`/`.svelte`. Run `pnpm lint:css` (or `:fix`) before finishing;
  `:global` is allowlisted. It enforces the standard formatting + flags deprecated
  syntax, but it does **not** catch hardcoded values — that's on you (see checklist).

## Checklist before finishing a CSS change

1. Is each new rule in its most-local valid home (component/page before global)?
2. Did I compose tokens — `--space-*`/`--radius-*`/`--duration-*`/`--shadow-*` and
   a tier-2 color **role** — instead of any raw px/hex/ms?
3. Low, flat specificity? No needless `!important` or `#id`?
4. No inline `style=""` introduced (CSP)?
5. For Svelte dynamic classes: `:global()` anchored to the root?
6. Did I let grid place direct children (areas/subgrid) and use pseudo-elements
   for decoration, instead of adding wrapper-only `<div>`/`<span>`s?
7. Does `pnpm lint:css` pass?
