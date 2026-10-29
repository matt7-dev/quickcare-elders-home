// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL at build time (e.g. in the GitHub Actions workflow) once the
// real domain is known. The sitemap, canonical URLs and og:image all use it.
const site = process.env.SITE_URL ?? 'https://quickcare.lk';

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
