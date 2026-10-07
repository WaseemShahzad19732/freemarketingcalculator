import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://freemarketingcalculator.com',
  integrations: [sitemap({
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: 0.8,
    customPages: [],
  })],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
