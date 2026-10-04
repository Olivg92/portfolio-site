// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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
  // Geist for text, Geist Mono for commands and labels, served by this site
  // rather than by a font CDN. The files come from the Fontsource packages,
  // Latin subset only: it covers English and French. Astro adds the preload
  // links, and fallback faces sized like Geist so the text does not jump when
  // the font arrives.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
