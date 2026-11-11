// Uses the solved problems of the Experience page as a reader does, in Chrome
// and in WebKit, the engine of Safari, on a wide screen and on a phone, in
// both languages:
// - on a phone, each problem shows its number, title and tools, and a line
//   at its foot to unfold the story, which stays folded until then: unfolded,
//   the seven took seven screens of an iPhone;
// - a tap on that line unfolds the story whole, and the line then offers to
//   fold it, which a second tap does; brought into view, the story lights up;
// - printed, every story shows, and nothing to press; saved as a PDF, the
//   page fits on three A4 pages at most, a CV a recruiter can pass on;
// - on a wide screen, every story shows beside its title, with nothing to
//   press, as before the fold; in Chrome, whose tree the check can read,
//   screen readers get the stories there and skip a folded one on a phone.
// Sizes are read from the page rather than from Playwright's visibility: in
// WebKit, Playwright counts any content of a closed <details> as hidden,
// whatever its styles show.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-experience.mjs http://localhost:4321/
import { chromium, devices, webkit } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321/').replace(/\/?$/, '/');
const failures = [];
// In GitHub Actions, a failure or a note is also an annotation, shown on the
// pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Solved problems::${what}` : `FAIL  ${what}`);
const note = (what) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=Solved problems::${what}` : `note  ${what}`);
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
// finger, which then taps beside the line. Checked frame by frame.
const arrived = async (line) => {
  const frame = () => new Promise(requestAnimationFrame);
  const rising = () => {
    for (let node = line; node; node = node.parentElement) {
      if (node.getAnimations().some((animation) => animation instanceof CSSTransition && animation.playState === 'running')) return true;
    }
    return false;
  };
  for (let i = 0; i < 10 && line.closest('.reveal-on :is(.reveal, .reveal-part, .cascade):not(.is-in)'); i++) await frame();
  for (let i = 0; i < 180 && rising(); i++) await frame();
};

// One page, on one device, in one browser: what a reader finds there, each
// result passed to `check`. Says whether the browser crashed on the way.
const visit = async (browser, { device, options, url, engine }, check) => {
  // Motion as a reader sees it: a story lights up as it unfolds into view.
  const context = await browser.newContext(options);
  const page = await context.newPage();
  let crashed = false;
  page.on('crash', () => (crashed = true));
  try {
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
  try {
    for (const lang of ['en', 'fr']) {
      for (const [device, options] of [
        ['wide screen', { viewport: { width: 1440, height: 900 } }],
        ['phone', phone],
      ]) {
        const label = `${name}, ${lang}, ${device}:`;
        const url = `${base}${lang === 'en' ? '' : 'fr/'}experience/`;
        // WebKit's build for tests, on Linux, sometimes crashes on these
        // pages, as often with nothing done on them but waiting: the visit
        // is then made again, and what it had found so far set aside.
        for (let attempt = 1; ; attempt++) {
          const results = [];
          const crashed = await visit(browser, { device, options, url, engine: name }, (ok, what) => results.push([ok, `${label} ${what}`]));
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
console.log('\nthe solved problems fold and unfold as a reader uses them');
