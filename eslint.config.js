import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';

export default defineConfig([
  // Don't lint build output or generated files.
  globalIgnores(['dist/**', '.astro/**']),

  // Base JS + TypeScript recommended rules for all source.
  js.configs.recommended,
  tseslint.configs.recommended,

  // Astro components (.astro) — uses astro-eslint-parser under the hood.
  astro.configs.recommended,

  // Svelte components (.svelte) — wire up the TS parser for <script lang="ts">.
  svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
      globals: { ...globals.browser },
    },
  },

  // Browser-facing scripts run in the page; Node config files run in Node.
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['*.{js,mjs,cjs}', 'src/scripts/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
]);
