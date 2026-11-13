// Writes the CV, one PDF per language, from the experience page of a served
// build, as Chrome's "Save as PDF" would: the page's print styles make it a
// CV of three A4 pages at most, which this script checks. It prints nothing
// but the experience page itself (not Chrome's error page when the server
// does not answer, nor a 404), and the links of the CV lead to the published
// site, not to the server it was printed from. The files land in <dist>/cv/,
// under the names src/cv.ts links to. CI runs it before the dead-link check,
// the deployment before publishing:
//   npm run build && npm run preview &
//   node scripts/cv-pdf.mjs http://localhost:4321/ dist
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { browser } from './lib/cdp.mjs';

const base = (process.argv[2] ?? 'http://localhost:4321/').replace(/\/?$/, '/');
const out = join(process.argv[3] ?? 'dist', 'cv');
mkdirSync(out, { recursive: true });

// The title a PDF reader shows, and the one a recruiter's folder keeps.
const titles = { en: 'Olivier Guandalini · CV · DevOps and SRE engineer', fr: 'Olivier Guandalini · CV · Ingénieur DevOps et SRE' };

// The titles a PDF holds, its own and those of its bookmarks, as a reader
// shows them: a hex string in UTF-16 (any title with an accent), or a literal
// one. Chrome writes them in plain objects, outside any compressed stream.
const bookmarks = (pdf) =>
  [...pdf.toString('latin1').matchAll(/\/Title\s*(<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\))/g)].map(([, raw]) => {
    if (raw.startsWith('(')) return raw.slice(1, -1).replace(/\\(.)/g, '$1');
    const bytes = Buffer.from(raw.slice(1, -1).replace(/\s/g, ''), 'hex');
    return bytes[0] === 0xfe && bytes[1] === 0xff ? bytes.subarray(2).swap16().toString('utf16le') : bytes.toString('latin1');
  });
// A heading that is its own words twice: Chrome once wrote the French
// bookmark of a block it was told to keep whole that way, though the page
// itself read right.
const doubled = (title) => title.length > 1 && title.length % 2 === 0 && title.slice(0, title.length / 2) === title.slice(title.length / 2);

const chrome = await browser();
let failed = false;
try {
  for (const lang of ['en', 'fr']) {
    // Reduced motion: nothing waits to come into view, whatever the print
    // styles already do about it.
    const page = await chrome.page({ width: 1200, height: 900, reducedMotion: true });
    const path = `${lang === 'en' ? '' : 'fr/'}experience/`;
    await page.goto(`${base}${path}`, 2000);
    const loaded = await page.eval(`({
      status: performance.getEntriesByType('navigation')[0]?.responseStatus ?? 0,
      canonical: document.querySelector('link[rel=canonical]')?.href ?? '',
    })`);
    if (loaded.status !== 200 || !loaded.canonical.endsWith(`/${path}`)) {
      throw new Error(`${base}${path}: ${loaded.status ? `HTTP ${loaded.status}` : 'no answer'}, not the experience page; no CV written`);
    }
    // A link to a page of the site, the name at the top for one, leads to
    // the published site that the page's canonical address names.
    await page.eval(`(() => {
      const site = new URL('/', document.querySelector('link[rel=canonical]').href);
      for (const a of document.querySelectorAll('a[href^="/"]')) a.href = new URL(a.getAttribute('href'), site).href;
    })()`);
    await page.eval(`document.fonts.ready.then(() => { document.title = ${JSON.stringify(titles[lang])}; })`);
    const pdf = await page.pdf();
    if (/\/URI\s*\(https?:\/\/(localhost|127\.0\.0\.1)/.test(pdf.toString('latin1'))) {
      throw new Error(`${base}${path}: the CV links to the server it was printed from`);
    }
    const sheets = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
    const file = join(out, `olivier-guandalini-cv-${lang}.pdf`);
    writeFileSync(file, pdf);
    const marks = bookmarks(pdf);
    const twice = marks.filter(doubled);
    if (sheets < 1 || sheets > 3) {
      failed = true;
      console.log(`${process.env.GITHUB_ACTIONS ? '::error title=CV::' : 'FAIL  '}${file}: ${sheets} A4 pages, three at most`);
    } else if (marks.length < 2) {
      // Its own title alone: the headings are no longer bookmarks, or no
      // longer where this script reads them, and the check below would pass
      // on nothing.
      failed = true;
      console.log(`${process.env.GITHUB_ACTIONS ? '::error title=CV::' : 'FAIL  '}${file}: no bookmarks found`);
    } else if (twice.length) {
      failed = true;
      console.log(`${process.env.GITHUB_ACTIONS ? '::error title=CV::' : 'FAIL  '}${file}: a bookmark reads its title twice (${twice.join(', ')})`);
    } else {
      console.log(`ok    ${file}: ${sheets} A4 pages, ${Math.round(pdf.length / 1024)} KB`);
    }
    await page.close();
  }
} finally {
  await chrome.close();
}
if (failed) process.exit(1);
