// Uses the tool cards as a reader does, in Chrome and in WebKit, the engine
// of Safari, on a wide screen and on a phone, in both languages, on every page
// that has some:
// - every chip that opens a card has its card on the page;
// - a click, or a tap on a phone, opens the chip's card, inside the screen;
// - on a phone, the card sits at the bottom of the screen and is no taller
//   than its words: one version of Safari once stretched it over the whole
//   screen, which Chrome never showed;
// - in Chrome, resting the pointer on a chip opens its card too;
// - Escape closes the card, and so does a tap elsewhere on a phone, the page
//   left where it is; there, scrolling the page on closes it too, as the
//   sheet would cover what comes up, though a slight move does not, and it
//   fades out first while still open, which Safari can do;
// - with a card open, a tap or a click on a chip further down the page, or on
//   the chip beside it, opens that chip's card and closes the first (on a
//   phone, the scroll to the chip further down has closed the first already);
// - no chip or link waits fully transparent for its block to come into view:
//   Safari on iPhone drops the click of a tap during which one turns visible
//   from opacity 0, so a tap while the next blocks arrive would only close
//   the open card. No engine here behaves so, hence a check on the styles;
// - a closing card goes at once where the browser cannot keep it above the
//   page for its fade (no `overlay`, as in Safari): Safari on iPhone let it
//   fall back into its panel, at the bottom, over the chips, and the tap on
//   the next chip landed on the card. The WebKit here closes a card at once
//   whatever the styles say, hence a check on them.
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
const isClosed = (id) => !document.getElementById(id).matches(':popover-open');

// A spot in the upper half of the screen, below the header, that nothing
// answers a tap on: words, or the background between them.
const quiet = () => {
  const top = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + 16;
  for (let y = top; y < innerHeight / 2; y += 12) {
    for (const x of [innerWidth / 2, 24, innerWidth - 24]) {
      const target = document.elementFromPoint(x, y);
      if (target && !target.closest('a, button, summary, [popover], [popovertarget]')) return { x, y };
    }
  }
  return { x: innerWidth / 2, y: top };
};

// Whether a chip is on the screen, clear of the card open at its bottom.
const clear = (chip, cardId) => {
  const box = chip.getBoundingClientRect();
  return box.top >= 0 && box.bottom <= document.getElementById(cardId).getBoundingClientRect().top;
};

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

    // Without `overlay`, a card holding its `display` for a fade would leave
    // the top layer and fall back into its panel.
    const lingering = await page.evaluate(() =>
      CSS.supports('overlay', 'auto')
        ? 0
        : [...document.querySelectorAll('[popover]')].filter((card) => getComputedStyle(card).transitionProperty.split(/,\s*/).includes('display')).length,
    );
    check(lingering === 0, 'a closing card goes at once where the browser cannot keep it above the page, as on an iPhone it would cover the chips');

    const action = device === 'phone' ? 'tap' : 'click';
    const press = async (chip) => {
      await chip.scrollIntoViewIfNeeded();
      await chip.evaluate(arrived);
      if (device !== 'phone') return chip.click();
      // At the chip's place on the screen: in WebKit, Playwright's own tap
      // may scroll the page first, which on a phone closes an open card
      // before the tap lands, as no reader's finger does.
      const box = await chip.boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
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
        // A tap elsewhere closes it, the page left where it is.
        const spot = await page.evaluate(quiet);
        await page.touchscreen.tap(spot.x, spot.y);
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForFunction(isClosed, id, { timeout: 3000 }).catch(() => {});
      check(await page.evaluate(isClosed, id), `${id} closes`);

      // On a phone, open again: a slight move of the page keeps it, and
      // scrolling on closes it. Upwards when the page allows, so that the
      // end of the page never stops the scroll.
      if (device === 'phone') {
        await press(chip);
        await page.waitForFunction(isOpen, id, { timeout: 3000 }).catch(() => {});
        const by = (top) => page.evaluate((top) => scrollBy({ top: scrollY > 300 ? -top : top, behavior: 'instant' }), top);
        await by(10);
        await page.waitForTimeout(200);
        check(await page.evaluate(isOpen, id), `a slight move of the page keeps ${id} open`);
        // Faded out while still open, then closed: Safari could not fade it
        // once closed.
        await page.evaluate((id) => {
          const card = document.getElementById(id);
          window.faded = false;
          new MutationObserver(() => {
            if (card.matches(':popover-open.leaving')) window.faded = true;
          }).observe(card, { attributes: true, attributeFilter: ['class'] });
        }, id);
        await by(200);
        await page.waitForFunction(isClosed, id, { timeout: 3000 }).catch(() => {});
        check(
          (await page.evaluate(isClosed, id)) && (await page.evaluate(() => window.faded)),
          `scrolling the page on fades ${id} out, then closes it, as it would cover what comes up`,
        );
      }
    }

    // From one card to another: the first chip's card open, then the last
    // chip, in a block further down; and the next to last chip's card open,
    // then the last chip, beside it in a block whose panel ends on the screen.
    // Each chip is scrolled high on the screen, as a reader brings it above
    // the card at the bottom of a phone.
    const high = (chip) =>
      chip.evaluate((chip) => {
        chip.scrollIntoView({ block: 'start', behavior: 'instant' });
        scrollBy({ top: -innerHeight / 4, behavior: 'instant' });
      });
    const last = chips.nth(count - 1);
    const lastId = await last.getAttribute('popovertarget');
    for (const from of [chips.first(), chips.nth(count - 2)]) {
      const fromId = await from.getAttribute('popovertarget');
      await high(from);
      await press(from);
      await page.waitForFunction(isOpen, fromId, { timeout: 3000 }).catch(() => {});
      // On a phone, a chip already on the screen, clear of the card, is
      // tapped where it is: a scroll would close the card first.
      if (device !== 'phone' || !(await last.evaluate(clear, fromId))) await high(last);
      await press(last);
      await page.waitForFunction(isOpen, lastId, { timeout: 3000 }).catch(() => {});
      check(
        (await page.evaluate(isOpen, lastId)) && !(await page.evaluate(isOpen, fromId)),
        `with ${fromId} open, a ${action} on ${lastId} opens it and closes the first`,
      );
      await page.keyboard.press('Escape');
    }

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
