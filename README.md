# fake frontend

The notebook of a backend engineer — a warm, literary dev blog about
TypeScript, Docker and Node.js, where **every code snippet is runnable in the
browser** via [WebContainers](https://webcontainers.io/).

Built with Astro + MDX. Implements the hi-fi design in [`docs/`](./docs/).

## Stack

- **Astro** static site, **MDX** posts (`src/content/blog/*.mdx`).
- **Svelte 5** (`@astrojs/svelte`) for the interactive islands only — static
  `.astro` pages still ship zero JS. Islands hydrate `client:visible`.
- **WebContainers** (`@webcontainer/api`) run real Node in the browser.
- **sucrase** transpiles TypeScript snippets to JS before they run.
- **Prism** for syntax highlighting (class-based → CSP-safe) and a strict
  **Content-Security-Policy** via Astro's `security.csp` (see below).
- Fonts: Newsreader · Space Grotesk · JetBrains Mono — **self-hosted** via
  [Astro's Fonts API](https://docs.astro.build/en/guides/fonts/) (configured in
  `astro.config.mjs`, rendered with `<Font>` in `BaseHead.astro`).

## Architecture: static shell + Svelte islands

Presentational components are `.astro` (server-only, no client JS). Anything
interactive is a **Svelte island**, fronted by a thin `.astro` wrapper that
adapts the MDX/props API and sets `client:visible`:

| `.astro` wrapper | Svelte island | Does |
| ---------------- | ------------- | ---- |
| `Sandbox.astro`  | `Sandbox.svelte`  | runnable code editor + WebContainers runner |
| `Terminal.astro` | `Terminal.svelte` | scripted shell sim (not Docker) |
| `PostList.astro` | `PostList.svelte` | server-rendered rows + topic-filter chips |
| —                | `Subscribe.svelte` | subscribe form |

Svelte **auto-escapes all interpolation**, so the sandbox/terminal output has no
manual-escaping XSS surface (raw HTML would only ever come from an explicit
`{@html}`, of which there are none). Reading-progress/TOC scroll-spy and the
Copy buttons stay as tiny inline scripts — pure DOM behavior with no HTML
building, so a framework would only add weight.

```
src/
  layouts/   BaseLayout.astro · PostLayout.astro (TOC, progress bar, series)
  components/
    Header / Footer / FeaturedCard          static .astro chrome
    Sandbox(.astro→.svelte) · Terminal(.astro→.svelte)
    PostList(.astro→.svelte) · Subscribe.svelte
    Callout / Figure / CodeBlock            MDX prose components (.astro)
  scripts/
    webcontainer.ts  one lazily-booted container per page
    copy.ts          delegated Copy buttons
  styles/   tokens.css · base.css · layout.css · article.css   (see CSS architecture)
  content/blog/*.mdx
```

## CSS architecture

Styles are layered, not global-by-default (see the `css-architecture` skill in
`.claude/skills/`):

- **`tokens.css`** — design tokens (`:root`). Global.
- **`base.css`** — reset, root element styles, the decorative wash, and the
  shared **primitives** reused everywhere (`.wrap`, `.btn*`, `.tag*`, `.brand`,
  `.icon-btn`, `.kicker`, `.ph`, dot colors). Global by design.
- **`layout.css`** — the app shell: header, footer, section scaffolding. Global.
- **`article.css`** — prose / TOC / pager / Prism theme; imported **only** by
  `PostLayout` + `about`, so it loads on reading pages only.
- **Everything component- or page-specific lives in that component/page's own
  scoped `<style>`** (FeaturedCard, PostList, Sandbox, Terminal, Subscribe,
  CodeBlock chrome, the landing hero, …). Astro/Svelte scope these
  automatically; dynamic classes (sandbox/terminal output) use `:global()`
  anchored to the component root.

Rule of thumb: most-local home wins — promote to `base`/`layout` only when a
style is genuinely shared. Strict CSP still holds (scoped styles are hashed or
served from `'self'`; no inline `style=""`).

### Design tokens

Everything composes tokens from **`tokens.css`** — no raw px/hex in component or
page styles:

- **Spacing** (`--space-50…1000`) and **radius** (`--radius-50…200`) both derive
  from a single `--base-unit: 0.5rem` (8px) via `calc()`, so the number is the
  step ×100 (`100` = 1 step = 8px, `150` = 12px, `200` = 16px…) — an **8pt grid**
  with 4px half-steps.
- **Motion** — `--duration-fast|normal|slow` + `--ease` / `--ease-out`.
- **Shadow** — `--shadow-sm|·|-md|-lg`: layered, warm-tinted (`--shadow-hsl`,
  not black), single overhead light source ([Comeau](https://www.joshwcomeau.com/css/designing-shadows/)).
- **Color** is **three tiers**: tier-1 *primitives* (the `--terracotta-*` /
  `--forest-*` ramps, neutrals, code/terminal palette) → tier-2 *semantic roles*
  (`--primary`, `--text-body`/`--text-heading`/`--text-muted`, `--surface`/
  `--surface-raised`/`--surface-invert`, `--border`, …) → components, which
  reference **only** roles. Colors are authored in **OKLCH** with an exact **hex
  fallback** (an `@supports` block) for browsers without `oklch()`
  ([Comeau](https://www.joshwcomeau.com/css/color-formats/)).

### Linting

[Stylelint](https://stylelint.org/) (config-standard, with `postcss-html` for
`.astro`/`.svelte` `<style>`) gates style quality:

| Command             | Action                                  |
| ------------------- | --------------------------------------- |
| `pnpm lint:css`     | Lint all CSS / `.astro` / `.svelte`     |
| `pnpm lint:css:fix` | Auto-fix what's fixable                 |

## How the sandboxes work

`<Sandbox>` hydrates `Sandbox.svelte` when scrolled into view. On the first
**Run** it lazily boots a single WebContainer for the page, transpiles
TypeScript with sucrase (if `lang="ts"`), writes the edited file, and runs it
with `node`, streaming stdout/stderr into the output pane (rendered as escaped
Svelte text, never `innerHTML`). The program is wrapped so `console.*` output
and a top-level `return` value (rendered as `→`) are captured. ⌘/Ctrl-Enter also
runs. `@webcontainer/api` and `sucrase` are `import()`-ed on first Run, so they
never touch initial page load.

`<Terminal>` is **not** Docker — WebContainers has no container engine, so the
Docker demos are scripted (responses keyed by command, with `help`/`clear` and
a "Play demo" auto-type). Output is illustrative.

### Cross-origin isolation (required)

WebContainers need `window.crossOriginIsolated === true`, which requires these
response headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

- **Dev:** set in `astro.config.mjs` (`server.headers`). `pnpm dev` works out
  of the box.
- **Prod:** set them at your host. `public/_headers` covers Netlify/Cloudflare;
  mirror it for Vercel etc.

`credentialless` is the conservative choice — it keeps the page isolated without
any subresource needing CORP headers. WebContainer-capable browsers
(Chrome/Firefox) support it; Safari (no WebContainers anyway) degrades
gracefully. (Fonts are self-hosted, so cross-origin font loading is no longer a
factor here.)

> Note: `astro preview` does **not** apply `_headers`, so the sandboxes only run
> under `pnpm dev` locally or on a deployed host that sends the headers.

## Content Security Policy

A strict CSP is enabled via Astro's `security.csp` (`astro.config.mjs`). Astro
emits a per-page `<meta http-equiv="content-security-policy">` and **auto-hashes
its own inline island scripts/styles**, so the policy uses **no `unsafe-inline`**
for scripts or styles. Highlights:

- `script-src 'self' 'wasm-unsafe-eval' <hashes>` — our bundles + the WASM the
  WebContainer bootstrap compiles. (This is why syntax highlighting is **Prism**,
  not Shiki: Prism colors tokens with CSS classes; Shiki uses inline `style`
  attributes that a strict `style-src` would block. All our own inline styles
  were moved to classes too.)
- `style-src 'self' <hashes>` — external CSS + Astro's hashed `<style>` blocks.
- WebContainers needs `worker-src 'self' blob:` and
  `frame-src`/`child-src`/`connect-src` allowing `https://*.webcontainer-api.io`
  (+ `wss:`) and `https://*.staticblitz.com`.
- `frame-ancestors` / `X-Frame-Options` / `Referrer-Policy` / `nosniff` live in
  `public/_headers` (a `<meta>` CSP can't express `frame-ancestors`).

**Rolling it out safely:** the WebContainer runtime origins can change. The CSP
is build-time only (not injected in `pnpm dev`), so to verify before trusting it,
preview the build behind the headers and watch the console — a blocked boot
reports the exact directive/origin. To stage it non-blocking, serve the same
policy as a `Content-Security-Policy-Report-Only` header first and collect
reports, then enforce.

## Authoring a post

```mdx
---
title: …
description: Stop sprinkling `process.env.FOO!` everywhere…  # → standfirst (backtick = inline code)
pubDate: 2026-05-28
topic: TypeScript        # TypeScript | Docker | Node.js
readingTime: 9 min
series: { name: "…", part: 2, total: 4 }   # optional → series banner + pager
heroImage: ./cover.png   # optional → src/content image()
heroCaption: …           # optional
---

Lead paragraph (gets the drop cap automatically).

## A section          ← auto-numbered (01, 02…) and added to the TOC

<Sandbox filename="env.ts" lang="ts">{`
const port = Number(process.env.PORT ?? 8080);
console.log("port:", port);
`}</Sandbox>

<Callout kind="note" mark="Tip">Keep it dependency-free.</Callout>
<CodeBlock filename="db.ts" lang="ts">{`const x = 1`}</CodeBlock>
<Figure caption="…" />          {/* or src={importedImage} */}
<Terminal prompt="~/app $" demo="docker build ." commands={{ /* … */ }} />
```

## Commands

| Command        | Action                              |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Dev server at `localhost:4321`      |
| `pnpm build`   | Static build to `./dist/`           |
| `pnpm preview` | Preview the build (no sandboxes¹)   |

¹ See the cross-origin-isolation note above.
