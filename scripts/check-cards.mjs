// Uses the tool cards as a reader does, in Chrome and in WebKit, the engine
// of Safari, on a wide screen and on a phone, in both languages, on every page
// that has some:
// - every chip that opens a card has its card on the page;
// - a click, or a tap on a phone, opens the chip's card, inside the screen;
// - on a phone, the card sits at the bottom of the screen and is no taller
//   than its words: one version of Safari once stretched it over the whole
//   screen, which Chrome never showed;
// - in Chrome, resting the pointer on a chip opens its card too;
// - Escape closes the card, and so does a tap elsewhere on a phone;
// - with a card open, a tap or a click on a chip further down the page opens
//   that chip's card and closes the first;
// - no chip or link waits fully transparent for its block to come into view:
//   Safari on iPhone drops the click of a tap during which one turns visible
//   from opacity 0, so a tap while the next blocks arrive would only close
//   the open card. No engine here behaves so, hence a check on the styles.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-cards.mjs http://localhost:4321/portfolio-site/
import { chromium, devices, webkit } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321/portfolio-site/').replace(/\/?$/, '/');
const failures = [];
// In GitHub Actions, a failure or a note is also an annotation, shown on the
// pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Tool cards::${what}` : `FAIL  ${what}`);
const note = (what) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=Tool cards::${what}` : `note  ${what}`);
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

// A reader presses a chip once it has arrived: its block marked in view, if
// it was waiting for that, and done rising. A chip still on its way moves
// under the pointer, which then presses the gap beside it.
// Checked frame by frame: awaiting the transitions' own promises sometimes
// crashes WebKit.
const arrived = async (chip) => {
  const frame = () => new Promise(requestAnimationFrame);
  const rising = () => {
    for (let node = chip; node; node = node.parentElement) {
      if (node.getAnimations().some((animation) => animation instanceof CSSTransition && animation.playState === 'running')) return true;
    }
    return false;
  };
  for (let i = 0; i < 10 && chip.closest('.reveal-on :is(.reveal, .reveal-part, .cascade):not(.is-in)'); i++) await frame();
  for (let i = 0; i < 180 && rising(); i++) await frame();
};

// One page, on one device, in one browser: what a reader does there, each
// result passed to `check`. Says whether the browser crashed on the way.
const visit = async (browser, { device, options, url, hover }, check) => {
  // Motion as a reader sees it, the reveal on scroll included, and a chip
  // pressed once it has arrived; only the smooth scrolling goes, as the
  // pointer would aim at a chip still on its way.
  const context = await browser.newContext(options);
  const page = await context.newPage();
  let crashed = false;
  page.on('crash', () => (crashed = true));
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

    const chips = page.locator('[popovertarget]');
    const count = await chips.count();
    const orphans = await page.evaluate(
      () => [...document.querySelectorAll('[popovertarget]')].filter((chip) => !document.getElementById(chip.getAttribute('popovertarget'))?.hasAttribute('popover')).length,
    );
    check(count > 0 && orphans === 0, `${count} chips, each with its card`);

    // Before any scroll, the lower blocks still wait to come into view.
    const transparent = await page.evaluate(
      () =>
        [...document.querySelectorAll('a[href], button')].filter((target) => {
          for (let node = target; node; node = node.parentElement) if (getComputedStyle(node).opacity === '0') return true;
          return false;
        }).length,
    );
    check(transparent === 0, 'no chip or link waits fully transparent, which would cost a tap its click on an iPhone');

    const action = device === 'phone' ? 'tap' : 'click';
    const press = async (chip) => {
      await chip.scrollIntoViewIfNeeded();
      await chip.evaluate(arrived);
      await (device === 'phone' ? chip.tap() : chip.click());
    };

    // The first chip, one in the middle and the last: the edges of the page
    // are where a card is most likely to leave the screen.
    for (const i of [...new Set([0, Math.floor(count / 2), count - 1])]) {
      const chip = chips.nth(i);
      const id = await chip.getAttribute('popovertarget');
      await press(chip);
      await page.waitForFunction(isOpen, id, { timeout: 3000 }).catch(() => {});
      const card = await page.evaluate(where, id);
      check(card.open, `a ${action} opens ${id}`);
      check(card.top >= 0 && card.left >= 0 && card.right <= card.width + 1 && card.bottom <= card.height + 1, `${id} stays inside the screen`);
      if (device === 'phone') {
        check(card.height - card.bottom <= 40 && card.head < 48, `${id} sits at the bottom, no taller than its words`);
        // A tap on the title, away from any chip or link, closes it: the title
        // first goes to the top, far from the card at the bottom.
        await page.evaluate(() => document.querySelector('h1').scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.locator('h1').tap({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForFunction((id) => !document.getElementById(id).matches(':popover-open'), id, { timeout: 3000 }).catch(() => {});
      check(!(await page.evaluate(isOpen, id)), `${id} closes`);
    }

    // From one card to another: the first chip's card open, then the last
    // chip, scrolled high on the screen as a reader brings it above the card
    // at the bottom of a phone.
    const [from, to] = [chips.first(), chips.nth(count - 1)];
    const [fromId, toId] = [await from.getAttribute('popovertarget'), await to.getAttribute('popovertarget')];
    await press(from);
    await page.waitForFunction(isOpen, fromId, { timeout: 3000 }).catch(() => {});
    await to.evaluate((chip) => {
      chip.scrollIntoView({ block: 'start', behavior: 'instant' });
      scrollBy({ top: -innerHeight / 4, behavior: 'instant' });
    });
    await press(to);
    await page.waitForFunction(isOpen, toId, { timeout: 3000 }).catch(() => {});
    check(
      (await page.evaluate(isOpen, toId)) && !(await page.evaluate(isOpen, fromId)),
      `with ${fromId} open, a ${action} on ${toId} opens it and closes the first`,
    );
    await page.keyboard.press('Escape');

    if (hover && device === 'wide screen') {
      const chip = chips.first();
      const id = await chip.getAttribute('popovertarget');
      await chip.hover();
      await page.waitForFunction(isOpen, id, { timeout: 3000 }).catch(() => {});
      check(await page.evaluate(isOpen, id), `resting the pointer on ${id} opens it`);
    }
  } catch (error) {
    if (!crashed) throw error;
  } finally {
    await context.close().catch(() => {});
  }
  return crashed;
};

for (const { name, engine, phone, hover } of engines) {
  const browser = await engine.launch();
  try {
    for (const lang of ['en', 'fr']) {
      for (const path of pages) {
        for (const [device, options] of [
          ['wide screen', { viewport: { width: 1440, height: 900 } }],
          ['phone', phone],
        ]) {
          const label = `${name}, ${lang}, /${path}, ${device}:`;
          const url = `${base}${lang === 'en' ? '' : 'fr/'}${path}`;
          // WebKit's build for tests, on Linux, sometimes crashes on these
          // pages, as often with nothing done on them but waiting: the visit
          // is then made again, and what it had found so far set aside.
          for (let attempt = 1; ; attempt++) {
            const results = [];
            const crashed = await visit(browser, { device, options, url, hover }, (ok, what) => results.push([ok, `${label} ${what}`]));
            if (!crashed) {
              for (const [ok, what] of results) expect(ok, what);
              break;
            }
            if (attempt === 3) {
              expect(false, `${label} the browser crashed on each of three visits`);
              break;
            }
            note(`${label} the browser crashed, not a defect of the page: visiting it again`);
          }
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
