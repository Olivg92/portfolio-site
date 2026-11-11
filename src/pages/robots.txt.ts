// robots.txt, at the root of the domain where search engines look for it:
// every page may be crawled, and the sitemap says which ones there are. Its
// address follows `site` in astro.config.mjs.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
