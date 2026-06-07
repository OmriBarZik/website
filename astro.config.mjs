// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeSlug from 'rehype-slug';

// Cross-origin isolation headers — required for WebContainers
// (window.crossOriginIsolated must be true). Set in dev here; in prod
// these are mirrored in public/_headers.
// `credentialless` is the conservative choice that keeps the page cross-origin
// isolated without any subresource needing CORP headers.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

// https://astro.build/config
export default defineConfig({
  site: 'https://omribarzik.com',
  integrations: [mdx(), sitemap(), svelte()],
  // Self-hosted via Astro's Fonts API (https://docs.astro.build/en/guides/fonts/).
  // Downloaded at build time and served from this origin — no Google CDN link.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      weights: [400, 500, 600, 700],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500, 700],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  markdown: {
    // Plugins now live on the unified processor (the old `markdown.rehypePlugins`
    // shortcut is deprecated). Give every heading an `id` so the TOC + scroll-spy
    // can link to it.
    processor: unified({ rehypePlugins: [rehypeSlug] }),
    // Prism highlights with CSS *classes* (`.token.keyword`, …) rather than
    // Shiki's inline `style` attributes — required for a strict CSP style-src.
    // The sepia token theme lives in src/styles/article.css.
    syntaxHighlight: 'prism',
  },
  // Content-Security-Policy. Astro emits a <meta http-equiv> per page and
  // auto-hashes its own inline island scripts/styles (so no 'unsafe-inline').
  // We add the sources WebContainers needs; everything else is locked to 'self'.
  // Frame-/reporting directives that <meta> can't carry live in public/_headers.
  security: {
    csp: {
      scriptDirective: {
        // 'self' for our bundled JS; 'wasm-unsafe-eval' lets the WebContainer
        // bootstrap compile WebAssembly. (Astro appends per-build hashes.)
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
      styleDirective: {
        // class-based Prism + external CSS only — no inline styles to allow
        resources: ["'self'"],
      },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // --- WebContainers runtime (boots an iframe + blob workers + WASM) ---
        "worker-src 'self' blob:",
        "child-src 'self' blob: https://*.webcontainer-api.io https://*.staticblitz.com",
        "frame-src 'self' https://*.webcontainer-api.io https://*.staticblitz.com",
        "connect-src 'self' https://*.webcontainer-api.io wss://*.webcontainer-api.io https://*.staticblitz.com",
      ],
    },
  },
  server: {
    headers: crossOriginIsolation,
  },
  vite: {
    server: {
      headers: crossOriginIsolation,
    },
    // sucrase ships CJS; let Vite pre-bundle it for the browser.
    optimizeDeps: {
      include: ['sucrase'],
    },
  },
});
