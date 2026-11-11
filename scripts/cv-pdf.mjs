// Writes the CV, one PDF per language, from the experience page of a served
// build, as Chrome's "Save as PDF" would: the page's print styles make it a
// CV of three A4 pages at most, which this script checks. The files land in
// <dist>/cv/, under the names src/cv.ts links to. CI runs it before the
// dead-link check, the deployment before publishing:
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

const chrome = await browser();
let failed = false;
try {
  for (const lang of ['en', 'fr']) {
    // Reduced motion: nothing waits to come into view, whatever the print
    // styles already do about it.
    const page = await chrome.page({ width: 1200, height: 900, reducedMotion: true });
    await page.goto(`${base}${lang === 'en' ? '' : 'fr/'}experience/`, 2000);
    await page.eval(`document.fonts.ready.then(() => { document.title = ${JSON.stringify(titles[lang])}; })`);
    const pdf = await page.pdf();
    const sheets = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
    const file = join(out, `olivier-guandalini-cv-${lang}.pdf`);
    writeFileSync(file, pdf);
    if (sheets < 1 || sheets > 3) {
      failed = true;
      console.log(`${process.env.GITHUB_ACTIONS ? '::error title=CV::' : 'FAIL  '}${file}: ${sheets} A4 pages, three at most`);
    } else {
      console.log(`ok    ${file}: ${sheets} A4 pages, ${Math.round(pdf.length / 1024)} KB`);
    }
    await page.close();
  }
} finally {
  await chrome.close();
}
if (failed) process.exit(1);
