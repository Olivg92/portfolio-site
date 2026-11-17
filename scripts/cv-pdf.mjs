// Writes the CV, one PDF per language, as Chrome's "Save as PDF" would, from
// the print-only page of a served build (/cv/print/ and /fr/cv/print/, see
// src/cv.ts): one A4 page, its fonts embedded, its links only to the site,
// LinkedIn and GitHub. It prints nothing but that page (not Chrome's error
// page when the server does not answer, nor a 404), and the links of the CV
// lead to the published site, not to the server it was printed from. The
// files land in <dist>/cv/, under the names src/cv.ts links to.
//
// The Experience page keeps print styles of its own (a reader may print it):
// it is printed too, and must still fit three A4 pages, but is not written.
//
// No employer is named in a CV that anyone can download. The repository never
// holds the names to look for: CI passes them in CV_FORBIDDEN (a secret, one
// name per line or comma-separated), and the CV's text must contain none.
// CI runs it before the dead-link check, the deployment before publishing:
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

// The names no CV may hold, from CI's secret: compared without case or accents.
const fold = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const forbidden = (process.env.CV_FORBIDDEN ?? '').split(/[\n,]/).map((n) => fold(n.trim())).filter(Boolean);
// The only places a link of the CV may lead.
const allowed = /^https:\/\/(oguandalini\.com\/|www\.linkedin\.com\/in\/|github\.com\/Olivg92(\/|$))/;

const say = (ok, what) => {
  if (!ok) failed = true;
  console.log(`${ok ? 'ok    ' : process.env.GITHUB_ACTIONS ? '::error title=CV::' : 'FAIL  '}${what}`);
};
const pages = (pdf) => (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;

// Opens a page of the served build, checks it is the one asked for, and
// points its links to the published site.
const open = async (path) => {
  // Reduced motion: nothing waits to come into view, whatever the print
  // styles already do about it.
  const page = await chrome.page({ width: 1200, height: 900, reducedMotion: true });
  await page.goto(`${base}${path}`, 2000);
  const loaded = await page.eval(`({
    status: performance.getEntriesByType('navigation')[0]?.responseStatus ?? 0,
    canonical: document.querySelector('link[rel=canonical]')?.href ?? '',
  })`);
  if (loaded.status !== 200 || !loaded.canonical.endsWith(`/${path}`)) {
    throw new Error(`${base}${path}: ${loaded.status ? `HTTP ${loaded.status}` : 'no answer'}, not the page asked for; no CV written`);
  }
  // A link to a page of the site leads to the published site that the
  // page's canonical address names.
  await page.eval(`(() => {
    const site = new URL('/', document.querySelector('link[rel=canonical]').href);
    for (const a of document.querySelectorAll('a[href^="/"]')) a.href = new URL(a.getAttribute('href'), site).href;
  })()`);
  return page;
};

const chrome = await browser();
let failed = false;
try {
  for (const lang of ['en', 'fr']) {
    const prefix = lang === 'en' ? '' : 'fr/';
    const page = await open(`${prefix}cv/print/`);
    const text = fold(await page.eval('document.body.innerText'));
    await page.eval(`document.fonts.ready.then(() => { document.title = ${JSON.stringify(titles[lang])}; })`);
    const pdf = await page.pdf();
    await page.close();
    const raw = pdf.toString('latin1');
    const file = join(out, `olivier-guandalini-cv-${lang}.pdf`);
    writeFileSync(file, pdf);

    const sheets = pages(pdf);
    // Chrome embeds the web fonts it prints with (a variable font as drawn
    // glyphs, Type 3), each under its family's name. Any other name is a
    // fallback font for a glyph the site's fonts lack, which another
    // computer may not have.
    const fonts = [...new Set([...raw.matchAll(/\/FontName\s*\/(?:[A-Z]{6}\+)?([A-Za-z-]+)/g)].map(([, f]) => f))];
    const strange = fonts.filter((f) => !/^(BricolageGrotesque|Manrope)\b/.test(f));
    const uris = [...raw.matchAll(/\/URI\s*\(((?:\\.|[^\\)])*)\)/g)].map(([, u]) => u.replace(/\\(.)/g, '$1'));
    const stray = uris.filter((u) => !allowed.test(u));
    const named = forbidden.filter((n) => text.includes(n));
    const twice = bookmarks(pdf).filter(doubled);
    say(sheets === 1, `${file}: ${sheets} A4 page${sheets === 1 ? '' : 's'}, exactly one, ${Math.round(pdf.length / 1024)} KB`);
    say(
      strange.length === 0 && fonts.some((f) => /Bricolage/.test(f)) && fonts.some((f) => /Manrope/.test(f)),
      `${file}: the site's fonts embedded, and no other (${fonts.join(', ') || 'none'})`,
    );
    say(uris.length >= 5 && stray.length === 0, `${file}: ${uris.length} links, all to the site, LinkedIn or GitHub${stray.length ? ` (not: ${stray.join(', ')})` : ''}`);
    say(named.length === 0, `${file}: ${forbidden.length ? `none of the ${forbidden.length} names CV_FORBIDDEN lists` : 'no CV_FORBIDDEN given, no name to look for'}${named.length ? ' (one is there)' : ''}`);
    say(twice.length === 0, `${file}: no bookmark reads its title twice${twice.length ? ` (${twice.join(', ')})` : ''}`);
    // A pull request from Dependabot gets no secret: say so, without failing.
    if (process.env.GITHUB_ACTIONS && !forbidden.length) console.log('::warning title=CV::CV_FORBIDDEN is empty: the CV was not searched for the names it lists');

    // The Experience page on paper: three A4 pages at most.
    const experience = await open(`${prefix}experience/`);
    const printed = await experience.pdf();
    await experience.close();
    const count = pages(printed);
    say(count >= 1 && count <= 3, `${prefix}experience/ printed: ${count} A4 pages, three at most`);
  }
} finally {
  await chrome.close();
}
if (failed) process.exit(1);
