// Uses the tool cards as a reader does, in Chrome and in WebKit, the engine
// of Safari, on a wide screen and on a phone, in both languages, on every page
// that has some:
// - every chip that opens a card has its card on the page;
// - a click, or a tap on a phone, opens the chip's card, inside the screen;
// - on a phone, the card sits at the bottom of the screen and is no taller
//   than its words: one version of Safari once stretched it over the whole
//   screen, which Chrome never showed;
// - in Chrome, resting the pointer on a chip opens its card too;
// - Escape closes the card, and so does a tap elsewhere on a phone.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-cards.mjs http://localhost:4321/portfolio-site/
import { chromium, devices, webkit } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321/portfolio-site/').replace(/\/?$/, '/');
const failures = [];
// In GitHub Actions, a failure is also an annotation, shown on the pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Tool cards::${what}` : `FAIL  ${what}`);
const expect = (ok, what) => {
  if (ok) console.log(`ok    ${what}`);
  else {
    failures.push(what);
    report(what);
  }
};

const engines = [
  { name: 'Chrome', engine: chromium, phone: devices['Pixel 7'], hover: true },
  { name: 'WebKit', engine: webkit, phone: devices['iPhone 15'], hover: false },
];
const pages = ['', 'experience/'];

// Where a card is, and how tall its first line is: a card stretched over the
// screen spreads its lines apart, and the first one grows with it.
const where = (id) => {
  const card = document.getElementById(id);
  const box = card.getBoundingClientRect();
  return {
    open: card.matches(':popover-open'),
    top: box.top,
    bottom: box.bottom,
    left: box.left,
    right: box.right,
    head: card.firstElementChild.getBoundingClientRect().height,
    width: innerWidth,
    height: innerHeight,
  };
};

const isOpen = (id) => document.getElementById(id).matches(':popover-open');

for (const { name, engine, phone, hover } of engines) {
  const browser = await engine.launch();
  try {
    for (const lang of ['en', 'fr']) {
      for (const path of pages) {
        for (const [device, options] of [
          ['wide screen', { viewport: { width: 1440, height: 900 } }],
          ['phone', phone],
        ]) {
          // Motion as a reader sees it, the reveal on scroll included; only the
          // smooth scrolling goes, as the pointer would aim at a chip still on
          // its way.
          const context = await browser.newContext(options);
          const page = await context.newPage();
          const label = `${name}, ${lang}, /${path}, ${device}:`;
          await page.goto(`${base}${lang === 'en' ? '' : 'fr/'}${path}`, { waitUntil: 'networkidle' });
          await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

          const chips = page.locator('[popovertarget]');
          const count = await chips.count();
          const orphans = await page.evaluate(
            () => [...document.querySelectorAll('[popovertarget]')].filter((chip) => !document.getElementById(chip.getAttribute('popovertarget'))?.hasAttribute('popover')).length,
          );
          expect(count > 0 && orphans === 0, `${label} ${count} chips, each with its card`);

          // The first chip, one in the middle and the last: the edges of the
          // page are where a card is most likely to leave the screen.
          for (const i of [...new Set([0, Math.floor(count / 2), count - 1])]) {
            const chip = chips.nth(i);
            const id = await chip.getAttribute('popovertarget');
            if (device === 'phone') await chip.tap();
            else await chip.click();
            await page.waitForFunction(isOpen, id, { timeout: 3000 }).catch(() => {});
            const card = await page.evaluate(where, id);
            expect(card.open, `${label} a ${device === 'phone' ? 'tap' : 'click'} opens ${id}`);
            expect(
              card.top >= 0 && card.left >= 0 && card.right <= card.width + 1 && card.bottom <= card.height + 1,
              `${label} ${id} stays inside the screen`,
            );
            if (device === 'phone') {
              expect(card.height - card.bottom <= 40 && card.head < 48, `${label} ${id} sits at the bottom, no taller than its words`);
              // A tap on the title, away from any chip or link, closes it: the
              // title first goes to the top, far from the card at the bottom.
              await page.evaluate(() => document.querySelector('h1').scrollIntoView({ block: 'start', behavior: 'instant' }));
              await page.locator('h1').tap({ force: true });
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForFunction((id) => !document.getElementById(id).matches(':popover-open'), id, { timeout: 3000 }).catch(() => {});
            expect(!(await page.evaluate(isOpen, id)), `${label} ${id} closes`);
          }

          if (hover && device === 'wide screen') {
            const chip = chips.first();
            const id = await chip.getAttribute('popovertarget');
            await chip.hover();
            await page.waitForFunction(isOpen, id, { timeout: 3000 }).catch(() => {});
            expect(await page.evaluate(isOpen, id), `${label} resting the pointer on ${id} opens it`);
          }
          await context.close();
        }
      }
    }
  } catch (error) {
    report(`the check stopped: ${error.message}`);
    failures.push(error.message);
  } finally {
    await browser.close();
  }
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nthe tool cards work as a reader uses them');
