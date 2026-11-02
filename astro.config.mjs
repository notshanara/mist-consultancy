import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import security from './security/astro-integration.mjs';

export default defineConfig({
  // Domain still to be confirmed by Mist. Drives canonical URLs and the sitemap.
  site: 'https://www.mistconsultancy.co.uk',
  integrations: [sitemap(), security()],
  devToolbar: { enabled: false },
  // Everything stays in external files, so the Content Security Policy needs no inline allowances.
  build: { inlineStylesheets: 'never' },
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
});
