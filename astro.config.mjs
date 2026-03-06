// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkConceptLinks from './plugins/remark-concept-links.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://launchdock.app',

  i18n: {
    defaultLocale: 'zh-tw',
    locales: ['zh-tw', 'en'],
    routing: {
      prefixDefaultLocale: false, // /articles/... stays unprefixed for zh-tw
    },
  },

  integrations: [react(), sitemap({
    filter: (page) => !page.includes('/admin/') && !page.includes('/auth/'),
    i18n: {
      defaultLocale: 'zh-tw',
      locales: { 'zh-tw': 'zh-TW', en: 'en' },
    },
  })],

  markdown: {
    remarkPlugins: [remarkConceptLinks],
  },

  vite: {
    plugins: [tailwindcss()]
  }
});