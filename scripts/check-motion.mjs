// Watches the motion of the home page as a visitor gets it, in Chrome and in
// WebKit, the engine of Safari, on a wide screen, a tablet upright and on
// its side, a phone upright and on its side, and a 320 px phone, in both
// languages. The entrance:
// - on a first visit, the page holds the entrance from its first frame,
//   every animation of it paused at its start while it waits, starts it
//   within 1.5 s, and is at rest again within 3 s of the start (2.4 s at
//   most on its own timers); below 1000 px the plate lies back rather than
//   turns;
// - at rest, nothing of it is left: no entrance class, no 3D anywhere (no
//   perspective, no preserve-3d, no 3D transform), as Safari paints the
//   tiles of a 3D scene over the sticky header; every figure reads the value
//   of the HTML, and it did count up on the way;
// - while it plays, no link or button, nor anything around one, is at
//   opacity 0, as Safari on iPhone drops the click of a tap on a link that
//   turns visible from 0; a press on a link or a button of a tile reaches
//   that tile, never the plate under it; nothing moves in the layout (each
//   tile, the name and each figure keep their place and size), the glow
//   under the plate never brightens again once it fades, and nothing
//   reaches past the sides of the screen, nor later as the blocks below rise
//   into view (the tablet on its side, 1024 px, is where the turned plate
//   comes closest to them);
// - it plays once per visit: a reload, or the home page in the other
//   language, in the same tab, shows the page at rest at once; and never
//   for a visitor who comes to a section of the page (/#projects) or from
//   another page of the site;
// - never for anyone who asks for less motion;
// - it ends on its timers: with requestAnimationFrame stubbed out and its
//   animations frozen on their first frame, as WebKit once left them, it
//   still ends at rest; with fonts that never come it never plays, and a
//   page opened behind another tab waits, paused, and plays once shown.
// And on the other pages, no entrance: by day the sky of lights, still and
// inside the screen, and by night (the guided tour) none at all.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-motion.mjs http://localhost:4321/
// MOTION_ONLY=<pattern> runs only the visits whose label matches, such as
// MOTION_ONLY=phone.
import { chromium, devices, webkit } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4321/').replace(/\/?$/, '/');
const only = process.env.MOTION_ONLY ? new RegExp(process.env.MOTION_ONLY) : null;
const failures = [];
// In GitHub Actions, a failure or a note is also an annotation, shown on the
// pull request.
const report = (what) => console.log(process.env.GITHUB_ACTIONS ? `::error title=Motion::${what}` : `FAIL  ${what}`);
const note = (what) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=Motion::${what}` : `note  ${what}`);
const expect = (ok, what) => {
  if (ok) console.log(`ok    ${what}`);
  else {
    failures.push(what);
    report(what);
  }
};

const touch = (width, height) => ({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const engines = [
  { name: 'Chrome', engine: chromium, phone: devices['Pixel 7'] },
  { name: 'WebKit', engine: webkit, phone: devices['iPhone 15'] },
];
const wide = { viewport: { width: 1280, height: 800 } };
// Where the plate turns (1000 px and wider) and where it lies back. On the
// tablet on its side, 1024 px wide, the turned plate has the least room.
const sizes = (phone) => [
  ['wide screen', wide],
  ['tablet', devices['iPad Mini']],
  ['tablet on its side', devices['iPad Mini landscape']],
  ['phone', phone],
  ['phone on its side', touch(844, 390)],
  ['320 px phone', touch(320, 568)],
];

// Set up before the page's own scripts: a log of the classes of <html>, the
// time each came and went, and, while the entrance plays, a sample every
// 50 ms of what a visitor could tap, of what a press on it would reach, of
// the figures and of the glow; and, all along, how far the page reaches
// past the sides of the screen, and whether any animation of the entrance
// ran while it waited. Timers, as WebKit's build for tests draws few
// frames.
const names = ['plate', 'plate-phone', 'drop', 'ground', 'shine', 'rise', 'bloom'];
const watch = ([width, names]) => {
  const motion = (window.motion = {
    log: [],
    low: 1,
    missed: null,
    values: [],
    glow: [],
    moved: false,
    start: null,
    end: null,
    shifts: [],
    atLoad: null,
    over: 0,
    held: 0,
    slipped: null,
  });
  const now = () => Math.round(performance.now());
  const boxes = () =>
    [...document.querySelectorAll('.bento > .tile, #name, .bento .value[data-count], .bento .big')].map((el) => [
      el.offsetLeft,
      el.offsetTop,
      el.offsetWidth,
      el.offsetHeight,
    ]);
  const sample = () => {
    for (const target of document.querySelectorAll('.bento :is(a[href], button)')) {
      for (let node = target; node; node = node.parentElement) motion.low = Math.min(motion.low, Number(getComputedStyle(node).opacity));
      // A press in the middle of it, where it is drawn on the screen, lands
      // in a tile: one tile may still float over another, but never may
      // the plate itself, an empty box, take it.
      const box = target.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      if (!box.width || x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (hit?.closest('.bento') && !hit.closest('.bento > .tile')) motion.missed ??= `${target.textContent.trim().slice(0, 24)} at ${Math.round(performance.now() - motion.start.at)} ms`;
    }
    motion.values.push([...document.querySelectorAll('.bento .value[data-count]')].map((el) => el.textContent));
    const ground = document.querySelector('.ground');
    if (ground) motion.glow.push(Number(getComputedStyle(ground).opacity));
    if (motion.start && JSON.stringify(boxes()) !== JSON.stringify(motion.start.boxes)) motion.moved = true;
  };
  // Read only once the page is styled: before its stylesheets are in, which
  // nothing is drawn without, the flagship's drawing is 320 px wide.
  setInterval(() => {
    const root = document.documentElement;
    const styled = document.body && [...document.querySelectorAll('link[rel="stylesheet"]')].every((link) => link.sheet);
    if (styled) motion.over = Math.max(motion.over, root.scrollWidth - Math.min(root.clientWidth, width));
    // While it waits, each animation of the entrance holds its first frame:
    // paused, at its start. `held` says some were seen there, so that a
    // wait with none to hold does not pass for one.
    if (root.classList.contains('entering-wait')) {
      const waiting = document.getAnimations().filter((a) => names.includes(a.animationName));
      if (waiting.length) motion.held++;
      const slipped = waiting.filter((a) => a.playState !== 'paused' || a.currentTime > 0);
      if (slipped.length) motion.slipped ??= slipped.map((a) => `${a.animationName} ${a.playState} at ${Math.round(a.currentTime ?? 0)} ms`).join(', ');
    }
  }, 50);
  let timer;
  new MutationObserver(() => {
    const classes = document.documentElement.className;
    const last = motion.log.at(-1);
    if (last?.[1] === classes) return;
    motion.log.push([now(), classes]);
    if (last?.[1].includes('entering-wait') && !classes.includes('entering-wait') && classes.includes('entering')) {
      motion.start = { at: now(), boxes: boxes(), plate: document.querySelector('.bento').getAnimations().map((a) => a.animationName) };
      // Frames stopped and animations frozen on their first frame, as
      // WebKit once left them: the end must come from the timers.
      if (window.freeze) for (const a of document.getAnimations()) if (a.animationName) a.pause();
      timer = setInterval(sample, 50);
      sample();
    }
    if (last?.[1].includes('entering') && !classes.includes('entering')) {
      clearInterval(timer);
      motion.end = { at: now(), boxes: boxes() };
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('DOMContentLoaded', () => (motion.atLoad = document.documentElement.className));
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        const sources = (entry.sources ?? []).map((source) => source.node).filter(Boolean);
        motion.shifts.push({ at: Math.round(entry.startTime), value: entry.value, hero: sources.some((node) => node.closest?.('.bento')) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
};

// The page at rest: what is left of the entrance, and of 3D.
const rest = (names) => {
  const deep = [...document.querySelectorAll('body *')].filter((el) => {
    const style = getComputedStyle(el);
    return style.transformStyle === 'preserve-3d' || style.perspective !== 'none' || style.transform.startsWith('matrix3d');
  });
  return {
    classes: document.documentElement.className,
    threeD: deep.map((el) => el.className || el.nodeName).slice(0, 5),
    playing: document.getAnimations().filter((a) => names.includes(a.animationName)).length,
    figures: [...document.querySelectorAll('.bento .value[data-count]')].map((el) => [el.textContent, el.dataset.count, el.style.minWidth]),
    seen: (() => {
      try {
        return sessionStorage.getItem('home-entrance');
      } catch {
        return 'blocked';
      }
    })(),
  };
};

const atRest = (state) => !/\bentering/.test(state.classes) && state.threeD.length === 0 && state.playing === 0;
const final = (state) => state.figures.length === 3 && state.figures.every(([text, count, width]) => text === count && width === '');
const entered = (log) => log.some(([, classes]) => /\bentering\b/.test(classes));

const settle = (page) =>
  page.waitForFunction(() => !/\bentering/.test(document.documentElement.className), null, { timeout: 8000, polling: 100 }).catch(() => {});

// One visit after another in one browser, as `run` says; each result passed
// to `check`. Says whether the browser crashed on the way, or stopped
// answering: no step waits more than 15 s, and no visit lasts more than
// 150 s, after which it is closed.
const visit = async (browser, options, run) => {
  const context = await browser.newContext(options);
  context.setDefaultTimeout(15000);
  const page = await context.newPage();
  let crashed = false;
  let timer;
  page.on('crash', () => (crashed = true));
  const stuck = new Promise((resolve) => (timer = setTimeout(() => resolve('stuck'), 150000)));
  try {
    await context.addInitScript(watch, [options.viewport.width, names]);
    if ((await Promise.race([run(page, context), stuck])) === 'stuck') crashed = true;
  } catch (error) {
    if (!crashed) throw error;
  } finally {
    clearTimeout(timer);
    await context.close().catch(() => {});
  }
  return crashed;
};

// Scrolls down the whole page, a little under a screen at a time, giving the
// blocks below the first screen time to rise into view. Every scroll of these
// checks is instant: the page scrolls smoothly otherwise, and a box read
// during the glide would be anywhere.
const scrollDown = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.round(innerHeight * 0.9));
  for (let y = step; y < height + step; y += step) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1200);
};

const entrance = (url, other, plate, check) => async (page) => {
  await page.goto(url);
  await settle(page);
  const motion = await page.evaluate(() => window.motion);
  const state = await page.evaluate(rest, names);
  const added = motion.log.find(([, classes]) => /\bentering\b/.test(classes));
  check(/\bentering\b/.test(motion.atLoad ?? '') || Boolean(added && added[0] < 300), 'the entrance holds the page from its first frame');
  const late = motion.start && added ? motion.start.at - added[0] : null;
  check(late !== null && late <= 1550, `it starts within 1.5 s (${late ?? 'never'} ms)`);
  check(!motion.slipped, `while it waits, every animation of it holds its first frame (${motion.slipped ?? 'held'})`);
  check(Boolean(motion.start?.plate.includes(plate)), `the plate plays ${plate}`);
  const length = motion.start && motion.end ? motion.end.at - motion.start.at : null;
  check(length !== null && length <= 3000, `it is over within 3 s of its start (${length ?? '?'} ms)`);
  check(atRest(state), `at rest, nothing is left of it, and no 3D anywhere${state.threeD.length ? ` (${state.threeD.join(', ')})` : ''}`);
  check(final(state), `every figure reads the value of the HTML (${state.figures.map(([text]) => text).join(', ')})`);
  // The first figure, 400, seen on its way: neither the 0 written at the
  // start nor its final value.
  const servers = Number(state.figures[0]?.[1]);
  check(
    motion.values.some((row) => Number(row[0]) > 0 && Number(row[0]) < servers),
    `the figures counted up on the way (${[...new Set(motion.values.map((row) => row[0]))].slice(0, 6).join(', ')}…)`,
  );
  check(motion.low > 0, `no link or button, nor anything around one, at opacity 0 while it plays (lowest ${motion.low})`);
  check(!motion.missed, `a press on a link or a button reaches its tile while it plays, never the plate under it${motion.missed ? ` (${motion.missed})` : ''}`);
  check(
    motion.start !== null && motion.end !== null && !motion.moved && JSON.stringify(motion.start.boxes) === JSON.stringify(motion.end.boxes),
    'nothing moves in the layout: tiles, name and figures keep their place and size',
  );
  const shifts = motion.shifts.filter((shift) => shift.hero && motion.start && shift.at >= motion.start.at - 50);
  check(shifts.length === 0, `no layout shift in the first screen while it plays${shifts.length ? ` (${shifts.map((s) => s.value.toFixed(4)).join(', ')})` : ''}`);
  // The glow ends faint and stays so until the entrance is over: its own
  // opacity is a thousandth, and once it has begun to fade no sample is
  // brighter than the one before. (WebKit's build for tests may hold the
  // fade for the whole entrance; its resting opacity says the rest.)
  const fading = motion.glow.findIndex((opacity) => opacity < 0.99);
  const brightens = fading >= 0 && motion.glow.slice(fading).some((opacity, i, rest) => i > 0 && opacity > rest[i - 1] + 0.02);
  const faint = await page.evaluate(() => Number(getComputedStyle(document.querySelector('.ground')).opacity));
  check(faint <= 0.01 && !brightens, `the glow under the plate rests faint and never brightens again once it fades (${faint}; ${motion.glow.map((o) => o.toFixed(2)).join(' ')})`);
  check(state.seen === '1', 'the visit is marked as having seen it');
  // The blocks below the first screen rise into view as the page scrolls.
  await scrollDown(page);
  const over = await page.evaluate(() => window.motion.over);
  check(over <= 0, `nothing reaches past the sides of the screen, while it plays nor as the blocks below rise into view (${over} px)`);

  // Once per visit: a reload, then the other language, in the same tab.
  for (const [again, label] of [
    [url, 'a reload'],
    [other, 'the home page in the other language'],
  ]) {
    await page.goto(again);
    await page.waitForLoadState('load');
    await page.waitForTimeout(200);
    const log = await page.evaluate(() => window.motion.log);
    const after = await page.evaluate(rest, names);
    check(!entered(log) && atRest(after) && final(after), `${label} in the same tab shows the page at rest at once`);
  }
};

for (const { name, engine, phone } of engines) {
  const browser = await engine.launch();
  try {
    const tasks = [];
    for (const lang of ['en', 'fr']) {
      const path = lang === 'en' ? '' : 'fr/';
      const url = `${base}${path}`;
      const other = `${base}${lang === 'en' ? 'fr/' : ''}`;
      for (const [device, options] of sizes(phone)) {
        const label = `${name}, ${lang}, ${device}:`;
        const plate = options.viewport.width >= 1000 ? 'plate' : 'plate-phone';
        tasks.push([label, options, (check) => entrance(url, other, plate, check)]);
        if (device !== 'wide screen' && device !== 'phone') continue;
        tasks.push([
          label,
          { ...options, reducedMotion: 'reduce' },
          (check) => async (page) => {
            await page.goto(url);
            await page.waitForTimeout(1800);
            const state = await page.evaluate(rest, names);
            const log = await page.evaluate(() => window.motion.log);
            check(!entered(log) && atRest(state) && final(state) && state.seen === null, 'with less motion, no entrance, and the visit not marked');
          },
        ]);
      }
      // Animation frames stopped and the entrance's animations frozen on
      // their first frame, as WebKit once left them: the end comes from the
      // timers all the same.
      tasks.push([
        `${name}, ${lang}, wide screen, frames stopped:`,
        wide,
        (check) => async (page) => {
          await page.addInitScript(() => {
            window.requestAnimationFrame = () => 0;
            window.freeze = true;
          });
          await page.goto(url);
          await settle(page);
          const state = await page.evaluate(rest, names);
          const motion = await page.evaluate(() => window.motion);
          const length = motion.start && motion.end ? motion.end.at - motion.start.at : null;
          check(motion.start !== null && length !== null && length <= 3000 && atRest(state) && final(state), `the entrance still ends at rest within 3 s, every figure at its value (${length ?? '?'} ms)`);
        },
      ]);
      // Fonts that never come: it never plays in a fallback font, its
      // animations held on their first frame all along, and lets go 1.5 s
      // after the page is shown, at rest, the visit marked.
      tasks.push([
        `${name}, ${lang}, wide screen, fonts that never come:`,
        wide,
        (check) => async (page) => {
          await page.route(/\.woff2$/, () => {});
          await page.goto(url, { waitUntil: 'commit' });
          await page.waitForFunction(() => window.motion?.log.some(([, classes]) => /\bentering\b/.test(classes)), null, { polling: 50 }).catch(() => {});
          await settle(page);
          const motion = await page.evaluate(() => window.motion);
          const state = await page.evaluate(rest, names);
          const added = motion.log.find(([, classes]) => /\bentering\b/.test(classes));
          const gone = motion.log.find(([, classes], i) => i > 0 && !/\bentering/.test(classes) && motion.log[i - 1][1].includes('entering'));
          const after = added && gone ? gone[0] - added[0] : null;
          check(
            motion.start === null && motion.held > 0 && !motion.slipped && after !== null && after <= 2000 && atRest(state) && final(state) && state.seen === '1',
            `with fonts that never come, it never starts, held on its first frame, and lets go at 1.5 s, at rest, the visit marked (${after ?? 'never'} ms${motion.slipped ? `; ${motion.slipped}` : ''})`,
          );
        },
      ]);
      // A page opened behind another tab: it waits, paused, without letting
      // go, and plays once shown; a reload then shows it at rest.
      tasks.push([
        `${name}, ${lang}, wide screen, page opened behind:`,
        wide,
        (check) => async (page) => {
          await page.addInitScript(() => {
            window.hidden = true;
            Object.defineProperty(document, 'visibilityState', { get: () => (window.hidden ? 'hidden' : 'visible') });
            Object.defineProperty(document, 'hidden', { get: () => window.hidden });
          });
          await page.goto(url);
          await page.waitForTimeout(2000);
          // Read at once with the classes: nothing lets go of a hidden page.
          const waiting = await page.evaluate((names) => {
            const held = document.getAnimations().filter((a) => names.includes(a.animationName));
            return { classes: document.documentElement.className, seen: sessionStorage.getItem('home-entrance'), held: held.length > 0 && held.every((a) => a.playState === 'paused' && !a.currentTime), slipped: window.motion.slipped };
          }, names);
          check(
            /\bentering-wait\b/.test(waiting.classes) && waiting.held && !waiting.slipped && waiting.seen === null,
            `a page that stays hidden waits on its first frame, every animation of it paused at its start, the visit not marked${waiting.slipped ? ` (${waiting.slipped})` : ''}`,
          );
          const shown = await page.evaluate(() => {
            window.hidden = false;
            document.dispatchEvent(new Event('visibilitychange'));
            return Math.round(performance.now());
          });
          await settle(page);
          const motion = await page.evaluate(() => window.motion);
          const state = await page.evaluate(rest, names);
          const late = motion.start ? motion.start.at - shown : null;
          check(late !== null && late <= 1550 && atRest(state) && final(state) && state.seen === '1', `once shown, it plays within 1.5 s and ends at rest (${late ?? 'never'} ms)`);
          await page.goto(url);
          await page.waitForLoadState('load');
          const again = await page.evaluate(() => window.motion.log);
          check(!entered(again), 'a reload then shows the page at rest');
        },
      ]);
      // A visitor who comes to a section of the home page, or from another
      // page of the site, has seen it: no entrance.
      tasks.push([
        `${name}, ${lang}, arriving from elsewhere:`,
        wide,
        (check) => async (page, context) => {
          await page.goto(`${base}${path}experience/`);
          await page.locator('header.top .links a').first().click();
          await page.waitForURL(/#projects$/);
          await page.waitForTimeout(400);
          const log = await page.evaluate(() => window.motion.log);
          const state = await page.evaluate(rest, names);
          check(!entered(log) && !/\bentering/.test(state.classes) && state.seen === '1', `the header's link to the projects, from the experience page, lands on them with no entrance, the visit marked`);
          const fresh = await context.newPage();
          await fresh.goto(`${base}${path}experience/`);
          await fresh.locator('header.top .brand').click();
          await fresh.waitForURL(url);
          await fresh.waitForTimeout(400);
          const fromSite = await fresh.evaluate(() => window.motion.log);
          check(!entered(fromSite), 'the home page reached from another page of the site shows at rest');
          const direct = await context.newPage();
          await direct.goto(`${url}#projects`);
          await direct.waitForTimeout(400);
          check(!entered(await direct.evaluate(() => window.motion.log)), 'the home page opened at #projects shows at rest');
        },
      ]);
    }
    // By day the sky of lights, by night (the guided tour) none, and no
    // entrance anywhere but the home page.
    tasks.push([
      `${name}, other pages:`,
      wide,
      (check) => async (page) => {
        for (const [path, day] of [
          ['experience/', true],
          ['fr/experience/', true],
          ['platform-eks-gitops/', false],
          ['fr/platform-eks-gitops/', false],
          ['no-such-page/', true],
        ]) {
          await page.goto(`${base}${path}`);
          await page.waitForTimeout(300);
          const found = await page.evaluate(() => ({
            sky: document.querySelectorAll('.aurora i').length,
            moving: [...document.querySelectorAll('.aurora, .aurora *')].reduce((n, el) => n + el.getAnimations().length, 0),
            entering: /\bentering/.test(document.documentElement.className),
            over: window.motion.over,
          }));
          check(
            found.sky === (day ? 4 : 0) && found.moving === 0 && found.over <= 0 && !found.entering,
            `/${path}: ${day ? 'the sky of lights, still and inside the screen' : 'no sky of lights at night'}, and no entrance`,
          );
        }
      },
    ]);

    for (const [label, options, make] of tasks.filter(([label]) => !only || only.test(label))) {
      // WebKit's build for tests, on Linux, sometimes crashes on these
      // pages, or stops answering: the visit is then made again, and what
      // it found set aside.
      for (let attempt = 1; ; attempt++) {
        const results = [];
        const crashed = await visit(browser, options, make((ok, what) => results.push([ok, `${label} ${what}`])));
        if (!crashed) {
          for (const [ok, what] of results) expect(ok, what);
          break;
        }
        if (attempt === 3) {
          expect(false, `${label} the browser crashed or stopped answering on each of three visits`);
          break;
        }
        note(`${label} the browser crashed or stopped answering, not a defect of the page: visiting it again`);
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
console.log('\nthe home page moves as it should, and ends at rest');
