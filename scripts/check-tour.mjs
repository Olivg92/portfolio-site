// Uses the guided tour as a reader does, in a real Chrome, on a wide screen
// and on a phone, in both languages:
// - the drawing is empty on arrival, and fills in from the first step;
// - Next, Previous and the chapters, clicked as a mouse does, are not covered
//   by anything and go to the step they should;
// - at the bottom of the page, no step's words stay over the end of it;
// - on a phone, every step's drawing is framed whole, Next after Next.
// Run against a served build:
//   node scripts/check-tour.mjs http://localhost:4321/portfolio-site/
import { browser, sleep } from './lib/cdp.mjs';

const base = (process.argv[2] ?? 'http://localhost:4321/portfolio-site/').replace(/\/?$/, '/');
const failures = [];
// In GitHub Actions, a failure is also an annotation, shown on the pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Guided tour::${what}` : `FAIL  ${what}`);
const expect = (ok, what) => {
  if (ok) console.log(`ok    ${what}`);
  else {
    failures.push(what);
    report(what);
  }
};

// Waits for a condition in the page rather than for a fixed time: a runner
// in CI can be much slower than a laptop.
const until = async (page, expression, ms = 5000) => {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(100)) {
    if (await page.eval(expression)) return true;
  }
  return false;
};

// The step the drawing shows, and the step whose words show.
const STATE = `(() => {
  const scene = document.getElementById('tour-scene');
  const words = document.querySelector('.seg.is-active');
  return { live: scene.hasAttribute('data-live'), step: Number(scene.dataset.step), words: words ? Number(words.dataset.step) : 0 };
})()`;

// Clicks the middle of a control, after checking that the control itself is
// what a mouse would reach there.
const press = async (page, selector) => {
  const at = await page.eval(`(() => {
    const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    return { x, y, reached: document.elementFromPoint(x, y)?.closest(${JSON.stringify(selector)}) !== null };
  })()`);
  await page.click(at.x, at.y);
  return at.reached;
};

const stepIs = (n) => `Number(document.getElementById('tour-scene').dataset.step) === ${n} && document.querySelector('.seg.is-active')?.dataset.step === '${n}'`;

// Everything the current step shows on a phone, but the band at the top and
// the grounds, must sit inside the drawing's box on the screen.
const FRAMED = `(() => {
  const scene = document.getElementById('tour-scene');
  const n = scene.dataset.step;
  const box = scene.getBoundingClientRect();
  const out = [...scene.querySelectorAll('.s' + n)]
    .filter((el) => !el.classList.contains('band') && !el.classList.contains('frame') && !el.classList.contains('d' + n))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width && r.height)
    .filter((r) => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1);
  return out.length;
})()`;

const chrome = await browser().catch((error) => {
  report(`Chrome did not start: ${error.message}`);
  process.exit(1);
});
try {
  for (const lang of ['en', 'fr']) {
    const url = `${base}${lang === 'en' ? '' : 'fr/'}platform-eks-gitops/`;
    for (const [device, size] of [
      ['wide screen', { width: 1440, height: 900 }],
      ['phone', { width: 390, height: 844, mobile: true }],
    ]) {
      const label = `${lang}, ${device}:`;
      const page = await chrome.page({ ...size, reducedMotion: true });
      await page.goto(url, 500);
      expect(await until(page, `document.querySelector('.tour.ready') !== null`, 15000), `${label} the tour's script starts`);
      await page.eval('document.fonts.ready.then(() => true)');

      let state = await page.eval(STATE);
      expect(!state.live, `${label} the drawing is empty on arrival`);

      await page.eval(`window.scrollTo(0, document.querySelector('.stage').getBoundingClientRect().top + scrollY + 40)`);
      await until(page, stepIs(1));
      state = await page.eval(STATE);
      expect(state.live && state.step === 1, `${label} the first step shows once the tour is reached`);

      for (const [selector, want] of [
        ['#tour-next', 2],
        ['#tour-next', 3],
        ['.chap[data-go="12"]', 12],
        ['#tour-prev', 11],
      ]) {
        const reached = await press(page, selector);
        await until(page, stepIs(want));
        state = await page.eval(STATE);
        expect(reached, `${label} nothing covers ${selector}`);
        expect(state.step === want && state.words === want, `${label} ${selector} goes to step ${want} (got ${state.step})`);
      }

      if (device === 'phone') {
        await press(page, '.chap[data-go="1"]');
        await until(page, stepIs(1));
        const cut = [];
        for (let n = 1; n <= 18; n++) {
          state = await page.eval(STATE);
          if (state.step !== n) {
            cut.push(`step ${n} not reached (on ${state.step})`);
            break;
          }
          const outside = await page.eval(FRAMED);
          if (outside) cut.push(`step ${n}: ${outside} element(s) cut`);
          if (n < 18) {
            await press(page, '#tour-next');
            await until(page, stepIs(n + 1));
          }
        }
        expect(cut.length === 0, `${label} each of the 18 steps is framed whole${cut.length ? ` (${cut.join('; ')})` : ''}`);
      } else {
        await page.eval('window.scrollTo(0, document.documentElement.scrollHeight)');
        await sleep(1000);
        const overlap = await page.eval(`(() => {
          const words = document.querySelector('.seg.is-active .cap');
          return words ? words.getBoundingClientRect().bottom > document.querySelector('.outro').getBoundingClientRect().top + 1 : false;
        })()`);
        expect(!overlap, `${label} no step's words stay over the end of the page`);
      }
      await page.close();
    }
  }
} catch (error) {
  report(`the check stopped: ${error.message}`);
  failures.push(error.message);
} finally {
  chrome.close();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nthe tour works as a reader uses it');
