import { vitePreprocess } from '@astrojs/svelte';

export default {
  // enables <script lang="ts"> in .svelte components
  preprocess: vitePreprocess(),
};
