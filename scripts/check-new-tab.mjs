// Every link to another site, on every built page, opens in a new tab, so
// that this site stays open behind it, and tells screen readers so; a link
// within the site opens where it is. Reads the built pages, no browser needed:
//   npm run build && node scripts/check-new-tab.mjs dist
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Links::${what}` : `FAIL  ${what}`);

const pages = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
let elsewhere = 0;
const failures = [];
for (const file of pages) {
  const html = readFileSync(join(root, file), 'utf8');
  for (const [, attributes, inside] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = attributes.match(/\bhref="([^"]*)"/)?.[1] ?? '';
    const newTab = /\btarget="_blank"/.test(attributes);
    if (/^https?:\/\//.test(href)) {
      elsewhere++;
      const safe = /\brel="[^"]*\bnoopener\b/.test(attributes);
      const said = /class="visually-hidden"/.test(inside);
      if (!newTab || !safe || !said) failures.push(`${file}: ${href} ${!newTab ? 'opens in the same tab' : !safe ? 'has no rel="noopener"' : 'does not tell screen readers it opens a new tab'}`);
    } else if (newTab) {
      failures.push(`${file}: ${href}, a link within the site, opens a new tab`);
    }
  }
}

for (const failure of failures) report(failure);
if (failures.length) {
  console.error(`\n${failures.length} link(s) to fix`);
  process.exit(1);
}
console.log(`ok    ${elsewhere} links to other sites, on ${pages.length} pages, each opens in a new tab and says so`);
