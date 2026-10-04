// Draws the pictures that link previews show (LinkedIn, Slack, a message),
// from the built site itself, 1200 by 630 in each language: the home page's
// introduction beside its isometric view, and a step of the guided tour.
// Run against a served build, then commit what changed in public/og/:
//   node scripts/og-images.mjs http://localhost:4321/portfolio-site/
// A preview is fetched once and cached by whoever shows it, so the pictures
// only need drawing again when the look of those pages changes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { browser, sleep } from './lib/cdp.mjs';

const base = (process.argv[2] ?? 'http://localhost:4321/portfolio-site/').replace(/\/?$/, '/');
const OUT = new URL('../public/og/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const shots = [
  {
    name: 'home',
    path: '',
    // The header goes; the introduction and the drawing fill the picture.
    css: '.top, .skip { display: none !important; } .hero { min-height: 630px !important; padding-block: 0 !important; }',
    wait: 3500,
  },
  {
    name: 'tour',
    path: 'platform-eks-gitops/',
    css: '',
    // The step where Argo CD lays the platform down, wave by wave.
    step: 'platform',
    wait: 3000,
  },
];

const chrome = await browser();
try {
  for (const lang of ['en', 'fr']) {
    for (const shot of shots) {
      const page = await chrome.page({ width: 1200, height: 630 });
      await page.goto(`${base}${lang === 'en' ? '' : 'fr/'}${shot.path}`);
      if (shot.css) await page.style(shot.css);
      if (shot.step) {
        await page.eval(`(() => {
          const seg = document.getElementById(${JSON.stringify(shot.step)});
          const r = seg.getBoundingClientRect();
          window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2);
        })()`);
      }
      await sleep(shot.wait);
      const file = new URL(`${shot.name}-${lang}.jpg`, OUT);
      writeFileSync(file, await page.screenshot('jpeg', 88));
      console.log(`drew ${file.pathname}`);
      await page.close();
    }
  }
} finally {
  await chrome.close();
}
