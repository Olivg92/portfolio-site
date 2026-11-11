// What search engines read, on the built site: robots.txt names the sitemap;
// the sitemap lists every page meant to be indexed, each with its other
// language, and nothing else; every such page has a title, a description, its
// canonical address and its language links; the structured data parses, the
// home pages describe Olivier with his LinkedIn and GitHub, and it has no
// worksFor, affiliation, employee or memberOf key, the properties that would
// name an employer (the check cannot know a name the repository never holds).
// Reads the built pages, no browser needed:
//   npm run build && node scripts/check-seo.mjs dist
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=SEO::${what}` : `FAIL  ${what}`);
const failures = [];
const fail = (what) => failures.push(what);
const read = (path) => readFileSync(join(root, path), 'utf8');
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

// robots.txt, and the sitemap it names, which must be a file of this build.
let sitemap = '';
if (!existsSync(join(root, 'robots.txt'))) fail('no robots.txt');
else {
  const robots = read('robots.txt');
  if (!/^User-agent: \*$/m.test(robots)) fail('robots.txt has no "User-agent: *" group');
  if (/^Disallow: \/\s*$/m.test(robots)) fail('robots.txt disallows the whole site');
  sitemap = robots.match(/^Sitemap: (\S+)$/m)?.[1] ?? '';
  if (!sitemap) fail('robots.txt names no sitemap');
}
const site = sitemap ? new URL('/', sitemap).href : '';
const local = (url) => new URL(url).pathname.replace(/^\//, '');

// The sitemap index, its sitemaps, and the pages they list.
const listed = new Map();
if (sitemap && !existsSync(join(root, local(sitemap)))) fail(`the sitemap robots.txt names, ${sitemap}, is not in the build`);
else if (sitemap) {
  for (const part of locs(read(local(sitemap)))) {
    if (!existsSync(join(root, local(part)))) {
      fail(`${part}, listed in the sitemap index, is not in the build`);
      continue;
    }
    for (const [, entry] of read(local(part)).matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const [loc] = locs(entry);
      const languages = [...entry.matchAll(/<xhtml:link\b[^>]*\bhreflang="([^"]+)"/g)].map(([, lang]) => lang);
      listed.set(loc, languages);
    }
  }
  if (!listed.size) fail('the sitemap lists no page');
}

// The built pages: those to index, and those that ask not to be.
const pages = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
const indexed = new Set();
let graphs = 0;
for (const file of pages) {
  const html = read(file);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  // A tag ends at the first '>' outside its quoted values: Astro leaves a '>'
  // in a value as it is, which HTML allows.
  const metas = [...head.matchAll(/<meta\b(?:[^>"]|"[^"]*")*>/g)].map(([tag]) => tag);
  const links = [...head.matchAll(/<link\b(?:[^>"]|"[^"]*")*>/g)].map(([tag]) => tag);
  const noindex = metas.some((tag) => attribute(tag, 'name') === 'robots' && /noindex/.test(attribute(tag, 'content') ?? ''));
  const canonical = attribute(links.find((tag) => attribute(tag, 'rel') === 'canonical') ?? '', 'href');

  if (noindex) {
    if (canonical && listed.has(canonical)) fail(`${file} asks not to be indexed, yet the sitemap lists it`);
  } else {
    const title = head.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
    const description = attribute(metas.find((tag) => attribute(tag, 'name') === 'description') ?? '', 'content');
    const languages = links.filter((tag) => attribute(tag, 'rel') === 'alternate').map((tag) => attribute(tag, 'hreflang'));
    if (!title) fail(`${file} has no title`);
    if (!description?.trim()) fail(`${file} has no description`);
    if (!canonical) fail(`${file} has no canonical address`);
    else {
      indexed.add(canonical);
      if (site && !canonical.startsWith(site)) fail(`${file}: its canonical address ${canonical} is not on ${site}`);
      const path = local(canonical);
      if (join(path, 'index.html') !== file) fail(`${file}: its canonical address ${canonical} points at another page`);
      if (!listed.has(canonical)) fail(`${file} (${canonical}) is missing from the sitemap`);
      else if (!['en', 'fr'].every((lang) => listed.get(canonical).includes(lang))) fail(`${canonical} comes without its two languages in the sitemap`);
    }
    for (const lang of ['en', 'fr', 'x-default']) if (!languages.includes(lang)) fail(`${file} has no hreflang="${lang}" link`);
  }

  // Structured data: it must parse, have no key that would name an employer
  // (worksFor, affiliation, employee or memberOf, under any prefix such as
  // schema:), and the home pages must say who the site is about.
  const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => json);
  const nodes = [];
  for (const block of blocks) {
    try {
      const data = JSON.parse(block);
      nodes.push(...(data['@graph'] ?? [data]));
      graphs++;
      const keys = JSON.stringify(data).match(/"(?:[^"]*[:/#])?(worksFor|affiliation|employees?|memberOf)"/);
      if (keys) fail(`${file}: the structured data has "${keys[1]}", which would name an employer`);
    } catch (error) {
      fail(`${file}: structured data that does not parse (${error.message})`);
    }
  }
  if (canonical && site && (canonical === site || canonical === new URL('fr/', site).href)) {
    const person = nodes.find((node) => node['@type'] === 'Person');
    const profile = nodes.find((node) => node['@type'] === 'ProfilePage');
    if (!person) fail(`${file}: the home page has no Person in its structured data`);
    else {
      if (person.name !== 'Olivier Guandalini') fail(`${file}: the Person is named "${person.name}"`);
      for (const where of ['linkedin.com', 'github.com']) {
        if (!(person.sameAs ?? []).some((url) => url.includes(where))) fail(`${file}: the Person has no ${where} profile in sameAs`);
      }
    }
    if (!profile || profile.mainEntity?.['@id'] !== person?.['@id']) fail(`${file}: no ProfilePage about the Person`);
    if (profile && profile.url !== canonical) fail(`${file}: the ProfilePage's url is not the page's canonical address`);
  }
}

// Nothing in the sitemap that the build does not index.
for (const loc of listed.keys()) if (!indexed.has(loc)) fail(`the sitemap lists ${loc}, which is not an indexable page of the build`);

for (const failure of failures) report(failure);
if (failures.length) {
  console.error(`\n${failures.length} problem(s) for search engines`);
  process.exit(1);
}
console.log(`ok    robots.txt and ${listed.size} pages in the sitemap, each with its title, description, canonical and language links; ${graphs} structured data blocks, none with a worksFor, affiliation, employee or memberOf key`);
