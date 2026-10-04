// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages serves a project repository under its name. When a domain
  // replaces this address, `site` becomes the domain and `base` goes away.
  site: 'https://olivg92.github.io',
  base: '/portfolio-site',
  // Every page is a folder with an index.html, so links end with a slash and
  // GitHub Pages never answers them with a redirect first.
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      // English at the root, French under /fr/.
      prefixDefaultLocale: false,
    },
  },
});
