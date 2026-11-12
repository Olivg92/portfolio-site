// Uses the Experience page as a reader does, in Chrome and in WebKit, the
// engine of Safari, on a wide screen and on a phone, in both languages:
// - on a phone, each problem shows its number, title and tools, and a line
//   at its foot to unfold the story, which stays folded until then: unfolded,
//   the seven took seven screens of an iPhone;
// - a tap on that line unfolds the story whole, and the line then offers to
//   fold it, which a second tap does; brought into view, the story lights up;
// - printed, every story shows, and nothing to press; saved as a PDF, the
//   page fits on three A4 pages at most, a CV a recruiter can pass on;
// - on a wide screen, every story shows beside its title, with nothing to
//   press, as before the fold; in Chrome, whose tree the check can read,
//   screen readers get the stories there and skip a folded one on a phone;
// - the page has no entrance: the home page alone plays one. Its first
//   screen, the title, its words, the CV and the four figures, is there and
//   still from the first moment, and on a phone the first figures show above
//   the fold; no tile ever waits fully transparent; and nothing is in 3D at
//   rest, on arriving or, once a reader has scrolled every block into view
//   (in English: the page moves the same in both languages), at the end, as
//   Safari paints a tile in a 3D scene over the sticky header;
// - a figure never runs past its tile, nor the page past the screen, from
//   320 to 1000 px, at the default text size and at 125 %;
// - for a reader who asks for less motion, every block is there at once,
//   every story beside its title on a wide screen, nothing moves and no
//   entrance plays; and so without script, in Chrome, though the dot of
//   what is in progress pulses.
// Sizes are read from the page rather than from Playwright's visibility: in
// WebKit, Playwright counts any content of a closed <details> as hidden,
// whatever its styles show. Every wait is a timer, never an animation frame:
// WebKit's build for tests may hold its frames back.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-experience.mjs http://localhost:4321/
import { chromium, devices, webkit } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321/').replace(/\/?$/, '/');
const failures = [];
// In GitHub Actions, a failure or a note is also an annotation, shown on the
// pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Experience page::${what}` : `FAIL  ${what}`);
const note = (what) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=Experience page::${what}` : `note  ${what}`);
const expect = (ok, what) => {
  if (ok) console.log(`ok    ${what}`);
  else {
    failures.push(what);
    report(what);
  }
};

const engines = [
  { name: 'Chrome', engine: chromium, phone: devices['Pixel 7'] },
  { name: 'WebKit', engine: webkit, phone: devices['iPhone 15'] },
];

// Each problem as it stands: what shows of it, and how tall its story is
// against the height of its words.
const problems = () =>
  [...document.querySelectorAll('.problem')].map((problem) => {
    const story = problem.querySelector('.story');
    return {
      title: problem.querySelector('h3').getBoundingClientRect().height > 0,
      tools: problem.querySelectorAll('.rail [popovertarget]').length,
      line: problem.querySelector('summary').getBoundingClientRect().height > 0,
      story: story.getBoundingClientRect().height,
      words: story.scrollHeight,
    };
  });

// Unfolded: its story open to the height of its parts, and the line offering
// to fold it. The height is added up from the parts, as one still waiting to
// come into view sits lower, which its scroll height would count.
const unfolded = (problem) => {
  const story = problem.querySelector('.story');
  const parts = [...story.children];
  const gap = parseFloat(getComputedStyle(story).rowGap) || 0;
  const whole = parts.reduce((sum, part) => sum + part.offsetHeight, 0) + gap * (parts.length - 1);
  return (
    whole > 0 &&
    story.getBoundingClientRect().height >= whole - 1 &&
    problem.querySelector('summary .hide').getBoundingClientRect().width > 0
  );
};

// Lit: the story's first part done coming into view, as a reader brings it.
// WebKit's build for tests sometimes holds its transitions for seconds, so
// there the part being marked in view is what counts: the fade is CSS.
const lit = (problem) => getComputedStyle(problem.querySelector('.story > *')).opacity === '1';
const marked = (problem) => problem.querySelector('.story > *').classList.contains('is-in');

const folded = (problem) => problem.querySelector('.story').getBoundingClientRect().height === 0;

// A reader taps a line once its card has arrived: marked in view, and done
// rising, as in check-cards.mjs. A card still on its way moves under the
// finger, which then taps beside the line. Checked every 50 ms by a timer,
// up to 3 s to be marked and 10 s to stop rising: a wait on animation frames,
// which WebKit may hold back, could last the job's whole time.
const arrived = async (line) => {
  const wait = () => new Promise((done) => setTimeout(done, 50));
  const rising = () => {
    for (let node = line; node; node = node.parentElement) {
      if (node.getAnimations().some((animation) => animation instanceof CSSTransition && animation.playState === 'running')) return true;
    }
    return false;
  };
  for (let i = 0; i < 60 && line.closest('.reveal-on :is(.reveal, .reveal-part, .cascade):not(.is-in)'); i++) await wait();
  for (let i = 0; i < 200 && rising(); i++) await wait();
};

// Whether the page ever takes the entrance's class (html.entering, or
// html.entering-wait), watched from before its first script: the class
// written in the HTML, added, or added and taken off again at once, which
// the class's last value alone would not show.
const watchEntrance = () => {
  const entering = (value) => /\bentering\b/.test(value ?? '');
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.target === document.documentElement && (entering(record.oldValue) || entering(record.target.getAttribute('class')))) {
        window.entered = true;
      }
    }
  }).observe(document, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => {
    if (entering(document.documentElement.getAttribute('class'))) window.entered = true;
  });
};

// The first screen: the title, its words, the CV and the four figures, each
// fully shown and still, and nothing that holds them fading or moving them;
// and no tile anywhere fully transparent. An animation that loops for ever,
// a pulse, moves nothing into place: only one that ends counts.
const first = () => {
  const moving = (el) => el.getAnimations().some((animation) => animation.effect?.getTiming().iterations !== Infinity);
  const shown = (el) => {
    for (let node = el; node; node = node.parentElement) {
      if (getComputedStyle(node).opacity !== '1' || moving(node)) return false;
    }
    return true;
  };
  const screen = [...document.querySelectorAll('.intro h1, .intro .lede, .intro .cv a, .numbers > .tile')];
  return {
    still: screen.length === 7 && screen.every(shown),
    lit: [...document.querySelectorAll('.tile')].every((tile) => getComputedStyle(tile).opacity !== '0'),
  };
};

// On a phone, the first row of figures ends above the fold.
const above = () => [...document.querySelectorAll('.numbers .big')].slice(0, 2).every((big) => big.getBoundingClientRect().bottom <= innerHeight);

// A reader scrolls the whole page: each block a reader can reach, in turn, is
// brought to the middle of the screen until it is marked in view, for up to
// 6 s, as WebKit's build for tests draws about once a second. A story folded
// on a phone is out of reach. Says how many never came into view.
const walk = async () => {
  const wait = (ms) => new Promise((done) => setTimeout(done, ms));
  const out = (block) => {
    const details = block.closest('details');
    return details !== null && !details.open && getComputedStyle(details.querySelector('summary')).display !== 'none';
  };
  let missed = 0;
  for (const block of document.querySelectorAll('.reveal, .reveal-part, .cascade')) {
    if (block.classList.contains('is-in') || out(block)) continue;
    block.scrollIntoView({ block: 'center', behavior: 'instant' });
    for (let i = 0; i < 60 && !block.classList.contains('is-in'); i++) await wait(100);
    if (!block.classList.contains('is-in')) missed++;
  }
  scrollTo({ top: 0, behavior: 'instant' });
  return missed;
};

// Nothing on its way into place: no transition, nor animation that ends,
// still running; nor a transition finished but not yet let go. WebKit's
// build for tests may hold the frame that lets it go, and the tile it moved
// then still reads a thousandth of a pixel off its place, a 2D move that the
// check of tiles below would count (once in about twenty visits).
const quiet = () =>
  !document.getAnimations().some(
    (animation) =>
      (animation.playState === 'running' && animation.effect?.getTiming().iterations !== Infinity) ||
      (animation instanceof CSSTransition && animation.playState === 'finished'),
  );

// The page at rest. No entrance: the home page alone plays one. And no 3D:
// Safari paints a tile in a 3D scene over the sticky header, whatever its
// z-index. So no element holds a perspective or a 3D scene (preserve-3d), a
// 3D transform, a rotation about an axis, or a move or a scale in depth; and
// a tile, and all that holds it, are not transformed at all, as rotateX(0)
// and translateZ(0) read as flat matrices. Left out: a block a reader cannot
// reach yet (a story folded on a phone), and anything still moving. Says
// which elements are bent, for the failure's message.
const rest = () => {
  // Still moving, as in quiet(): a transition finished but not yet let go
  // counts.
  const moving = (el) =>
    el.getAnimations().some(
      (animation) =>
        (animation.playState === 'running' && animation.effect?.getTiming().iterations !== Infinity) ||
        (animation instanceof CSSTransition && animation.playState === 'finished'),
    );
  const angle = /^-?[\d.]+(deg|rad|grad|turn)$/;
  const flat = (style) =>
    style.perspective === 'none' &&
    style.transformStyle !== 'preserve-3d' &&
    !style.transform.startsWith('matrix3d') &&
    (style.rotate === 'none' || angle.test(style.rotate)) &&
    style.translate.split(' ').length < 3 &&
    style.scale.split(' ').length < 3;
  const untouched = (style) => [style.transform, style.rotate, style.translate, style.scale].every((value) => value === 'none');
  const holders = new Set();
  for (const tile of document.querySelectorAll('.tile')) {
    for (let node = tile; node; node = node.parentElement) holders.add(node);
  }
  const bent = [...document.querySelectorAll('html, body, body *')]
    .filter((el) => !el.closest('.reveal-on :is(.reveal, .reveal-part, .cascade):not(.is-in)') && !moving(el))
    .filter((el) => {
      const style = getComputedStyle(el);
      return !flat(style) || (holders.has(el) && !untouched(style));
    })
    .map((el) => [el.tagName.toLowerCase(), ...el.classList].join('.'));
  return { entered: window.entered === true, bent };
};

// Each figure inside its tile's padding, and nothing of the page's content
// past the screen's edge (the header and the footer are the same on every
// page, and checked there).
const fit = () => ({
  figures: [...document.querySelectorAll('.numbers > .tile')].every((tile) => {
    const text = document.createRange();
    text.selectNodeContents(tile.querySelector('.big'));
    return text.getBoundingClientRect().right <= tile.getBoundingClientRect().right - parseFloat(getComputedStyle(tile).paddingRight) + 0.5;
  }),
  inside: [...document.querySelectorAll('main *')].every((el) => el.getBoundingClientRect().right <= innerWidth + 0.5),
});

// One page, on one device, in one browser: what a reader finds there, each
// result passed to `check`. Says whether the browser crashed on the way.
const visit = async (browser, { device, options, lang, url, engine }, check) => {
  // Motion as a reader sees it, or none for one who asks for less, or no
  // script: a story lights up as it unfolds into view.
  const context = await browser.newContext(options);
  const page = await context.newPage();
  let crashed = false;
  page.on('crash', () => (crashed = true));
  try {
    // The page at rest, a visit of its own, so that a crash replays only it.
    if (device.endsWith('at rest')) {
      await page.addInitScript(watchEntrance);
      // From the first moment the page is read, then past the time an
      // entrance would take to start (1.5 s at most).
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const early = await page.evaluate(first);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1600);
      const late = await page.evaluate(first);
      const arriving = await page.evaluate(rest);
      check(early.still && late.still, 'the title, its words, the CV and the four figures are there at once, and still');
      check(early.lit && late.lit, 'no tile waits fully transparent, which would cost a tap its click on an iPhone');
      if (device.startsWith('phone')) check(await page.evaluate(above), 'the first two figures show above the fold');

      // Then the reader scrolls to the end. The page moves the same in both
      // languages, so it is scrolled through in English only: in WebKit, a
      // walk takes 10 to 15 s.
      let read = arriving;
      if (lang === 'en') {
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
        const missed = await page.evaluate(walk);
        check(missed === 0, `every block comes into view as the reader scrolls down${missed ? ` (${missed} never did)` : ''}`);
        const settled = await page.waitForFunction(quiet, null, { timeout: 15_000, polling: 100 }).then(
          () => true,
          () => false,
        );
        check(settled, 'once every block has come into view, nothing is still moving');
        read = await page.evaluate(rest);
      }
      const bent = [...new Set([...arriving.bent, ...read.bent])];
      check(!read.entered, 'no entrance plays here: the home page alone has one');
      check(bent.length === 0, `nothing is in 3D at rest, which Safari would paint over the sticky header${bent.length ? ` (${bent.slice(0, 3).join(', ')})` : ''}`);

      // A figure on a line that does not wrap once ran past its tile at
      // 720 px, and with a larger default text past the screen: from a small
      // phone to a laptop, at the default size and at 125 %.
      if (device.startsWith('wide')) {
        const off = [];
        for (const size of ['100%', '125%']) {
          await page.evaluate((value) => (document.documentElement.style.fontSize = value), size);
          for (const width of [320, 720, 760, 1000]) {
            await page.setViewportSize({ width, height: 900 });
            const { figures, inside } = await page.evaluate(fit);
            if (!figures || !inside) off.push(`${width} px at ${size}`);
          }
        }
        check(off.length === 0, `each figure stays inside its tile, and the page inside the screen${off.length ? ` (not at ${off.join(', ')})` : ''}`);
      }
      return crashed;
    }

    // For a reader who asks for less motion, or without script: everything
    // there at once, nothing that moves, and no entrance.
    if (device.includes('less motion') || device.includes('no script')) {
      const script = options.javaScriptEnabled !== false;
      if (script) await page.addInitScript(watchEntrance);
      await page.goto(url, { waitUntil: 'networkidle' });
      const shown = await page.evaluate(() => ({
        hidden: [...document.querySelectorAll('.tile, .reveal, .reveal-part, .cascade > li')].filter((el) => getComputedStyle(el).opacity !== '1').length,
        moving: document.getAnimations().length,
        stories: [...document.querySelectorAll('.problem .story')].every((story) => story.getBoundingClientRect().height > 0),
        entered: window.entered === true,
      }));
      check(shown.hidden === 0, 'every block is there at once, nothing waits to come into view');
      // Without script, the dot of what is in progress still pulses, as it
      // does wherever motion is welcome.
      if (script) {
        check(shown.moving === 0, 'nothing moves');
        check(!shown.entered, 'no entrance plays');
      }
      check(shown.stories, 'every story shows beside its title');
      return crashed;
    }

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

    const all = await page.evaluate(problems);
    const count = all.length;
    if (device === 'wide screen') {
      check(
        count > 0 && all.every((p) => p.title && p.tools > 0 && !p.line && p.story > 0),
        `all ${count} stories show beside their titles, with nothing to press`,
      );
    } else {
      check(
        count > 0 && all.every((p) => p.title && p.tools > 0 && p.line && p.story === 0),
        `all ${count} problems show their title, their tools and a line to unfold the story, folded`,
      );
      // The first problem and the last, each brought to the top of the
      // screen, as a reader reads its title before pressing. WebKit's build
      // for tests draws about once a second, so its half-second unfolding
      // takes a few seconds there: hence the long waits.
      for (const i of [...new Set([0, count - 1])]) {
        const problem = page.locator('.problem').nth(i);
        const line = problem.locator('summary');
        // At the line's place on the screen: in WebKit, Playwright's own tap
        // may scroll the page first, as no reader's finger does.
        const tap = async () => {
          await line.scrollIntoViewIfNeeded();
          await line.evaluate(arrived);
          const box = await line.boundingBox();
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        };
        await problem.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await tap();
        const handle = await problem.elementHandle();
        await page.waitForFunction(unfolded, handle, { timeout: 10_000, polling: 100 }).catch(() => {});
        check(await problem.evaluate(unfolded), `a tap on problem ${i + 1} unfolds its story whole, and the line then offers to fold it`);
        // The story may open below the screen's edge: read, it lights up.
        await problem.locator('.story').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const shown = engine === 'WebKit' ? marked : lit;
        await page.waitForFunction(shown, handle, { timeout: 10_000, polling: 100 }).catch(() => {});
        check(await problem.evaluate(shown), `the story of problem ${i + 1} lights up as it comes into view`);
        await tap();
        await page.waitForFunction(folded, handle, { timeout: 10_000, polling: 100 }).catch(() => {});
        check(await problem.evaluate(folded), `a second tap on problem ${i + 1} folds it again`);
      }

      await page.emulateMedia({ media: 'print' });
      const printed = await page.evaluate(problems);
      check(printed.every((p) => !p.line && p.story > 0), 'printed, every story shows, with nothing to press');
      await page.emulateMedia({ media: 'screen' });
    }

    // Saved as a PDF, as a recruiter's "Save as PDF" does it: a CV of three
    // A4 pages at most. Only Chrome's headless build writes PDFs.
    if (engine === 'Chrome' && device === 'wide screen') {
      const pdf = await page.pdf({ preferCSSPageSize: true });
      const sheets = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
      check(sheets > 0 && sheets <= 3, `saved as a PDF, it fits on ${sheets} A4 pages, three at most`);
    }

    if (engine === 'Chrome') {
      const cdp = await context.newCDPSession(page);
      const words = (await page.locator('.problem dd').first().textContent()).trim().slice(0, 40);
      const heard = async () =>
        (await cdp.send('Accessibility.getFullAXTree')).nodes.some((node) => !node.ignored && (node.name?.value ?? '').startsWith(words));
      // Chrome updates its tree a moment after the page: asked again a few
      // times before it counts as an answer.
      const expected = device === 'wide screen';
      let answer = await heard();
      for (let i = 0; i < 10 && answer !== expected; i++) {
        await page.waitForTimeout(300);
        answer = await heard();
      }
      check(answer === expected, expected ? 'screen readers get the stories' : 'screen readers skip a folded story');
    }
  } catch (error) {
    if (!crashed) throw error;
  } finally {
    await context.close().catch(() => {});
  }
  return crashed;
};

for (const { name, engine, phone } of engines) {
  const browser = await engine.launch();
  const wide = { viewport: { width: 1440, height: 900 } };
  try {
    for (const lang of ['en', 'fr']) {
      for (const [device, options] of [
        ['wide screen', wide],
        ['phone', phone],
        ['wide screen, at rest', wide],
        ['phone, at rest', phone],
        ['wide screen, less motion', { ...wide, reducedMotion: 'reduce' }],
        // WebKit's build for tests cannot be read from without script.
        ...(name === 'Chrome' ? [['wide screen, no script', { ...wide, javaScriptEnabled: false }]] : []),
      ]) {
        const label = `${name}, ${lang}, ${device}:`;
        const url = `${base}${lang === 'en' ? '' : 'fr/'}experience/`;
        // WebKit's build for tests, on Linux, sometimes crashes on these
        // pages, as often with nothing done on them but waiting: the visit
        // is then made again, and what it had found so far set aside.
        for (let attempt = 1; ; attempt++) {
          const results = [];
          const crashed = await visit(browser, { device, options, lang, url, engine: name }, (ok, what) => results.push([ok, `${label} ${what}`]));
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
console.log('\nthe experience page folds, unfolds and rests as a reader uses it');
