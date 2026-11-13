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
//   turns visible from 0; a press on a link or a button of a tile lands in
//   a tile, never on the plate or the page under it; nothing moves in the
//   layout (each tile, the name and each figure keep their place and size),
//   the glow under the plate never brightens again once it fades, and nothing
//   reaches past the sides of the screen, nor later as the tiles below stand
//   up (the tablet on its side, 1024 px, is where the turned plate comes
//   closest to them);
// - it plays once per visit: a reload, or the home page in the other
//   language, in the same tab, shows the page at rest at once; and never
//   for a visitor who comes to a section of the page (/#projects) or from
//   another page of the site;
// - never for anyone who asks for less motion;
// - it ends on its timers: with requestAnimationFrame stubbed out and its
//   animations frozen on their first frame, as WebKit once left them, it
//   still ends at rest; with fonts that never come it never plays, and a
//   page opened behind another tab waits, paused, and plays once shown.
// And the effects, on a wide screen with a mouse, in both languages: a plain
// tile leans under the pointer, its edge lit, and stands flat once it
// leaves; nothing that can be pressed (a chip, a call) moves by 3 px or more
// under the pointer; a tile whose card is open stands straight; the two
// link tiles rise and their shadow eases; the flagship's slabs come apart;
// a tile never leans while its top is under the header, and stands flat at
// once when the page scrolls; a tile below the first screen waits flat,
// stands up as it comes into view, does not lean until it is up, and ends
// flat; the sky leans away from the pointer and never moves on its own.
// And on the other pages, no entrance: by day the sky of lights, still and
// inside the screen, and by night (the guided tour) none at all.
// Run against a served build, with Playwright and its two browsers:
//   npm install --no-save playwright@1.63.0
//   npx playwright install --with-deps chromium webkit
//   node scripts/check-motion.mjs http://localhost:4321/
// MOTION_ONLY=<pattern> runs only the visits whose label matches, such as
// MOTION_ONLY=effects.
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
  // An instant scroll, its event awaited by `landed` below: WebKit's build
  // for tests delivers it at its next frame, which may come late.
  window.jump = (top) => {
    const from = scrollY;
    window.scrolled = false;
    addEventListener('scroll', () => (window.scrolled = true), { once: true });
    scrollTo({ top, behavior: 'instant' });
    if (scrollY === from) window.scrolled = true;
  };
  // `target` below, for the page's own use.
  window.target = (el) => {
    for (const animation of el.getAnimations({ subtree: true })) {
      if (animation instanceof CSSTransition || animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
    }
    return getComputedStyle(el).transform;
  };
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
      // in a tile: one tile may still float over another, but nothing else
      // may take it, neither the plate itself, an empty box, nor what lies
      // under the plate once the plate lets presses through. A point in the
      // last pixel at an edge is left out, as one past the edge is: Chrome
      // rounds 767.7 of a 768 px screen to the row below it, off the
      // screen, and finds nothing there.
      const box = target.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      if (!box.width || x < 0 || y < 0 || x > innerWidth - 1 || y > innerHeight - 1) continue;
      const hit = document.elementFromPoint(x, y);
      const taker = hit ? `${hit.nodeName}${hit.id ? `#${hit.id}` : ''}${hit.classList.length ? `.${[...hit.classList].join('.')}` : ''}` : 'nothing';
      if (!hit?.closest('.bento > .tile')) motion.missed ??= `${target.textContent.trim().slice(0, 24)} at ${Math.round(performance.now() - motion.start.at)} ms, pressed at ${Math.round(x)}, ${Math.round(y)}, taken by ${taker}`;
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

// Where an element is going rather than where it is: its transitions and
// its finite animations sent to their end. WebKit's build for tests
// sometimes holds them for seconds, so a look taken on the way would say
// nothing of the rule.
const target = (el) => {
  for (const animation of el.getAnimations({ subtree: true })) {
    if (animation instanceof CSSTransition || animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
  }
  return getComputedStyle(el).transform;
};

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
// tiles below the first screen time to stand up. Every scroll of these
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
  check(!motion.missed, `a press on a link or a button lands in a tile while it plays, never on the plate or the page under it${motion.missed ? ` (${motion.missed})` : ''}`);
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
  // The tiles below the first screen stand up as the page scrolls.
  await scrollDown(page);
  const over = await page.evaluate(() => window.motion.over);
  check(over <= 0, `nothing reaches past the sides of the screen, while it plays nor as the tiles below stand up (${over} px)`);

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

// Scrolls a tile into view whole, its top below the header, so that it may
// lean: as high as the page allows, but no higher than 130 px from the top.
const place = (el) =>
  jump(Math.min(scrollY + el.getBoundingClientRect().top - Math.max(130, innerHeight - el.offsetHeight - 40), document.documentElement.scrollHeight - innerHeight));

// Waits until the page has had the scroll event of its last `jump`, the
// pointer stirring at the edge and, now and then, a picture taken of a
// corner, which make WebKit's build for tests draw.
const landed = async (page) => {
  for (let i = 0; i < 40 && !(await page.evaluate(() => window.scrolled)); i++) {
    await page.mouse.move(4, 420 + (i % 2));
    if (i % 5 === 4) await page.screenshot({ clip: { x: 0, y: 0, width: 8, height: 8 }, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(25);
  }
};

const effects = (url, check) => async (page) => {
  await page.goto(url);
  await settle(page);
  // Chrome opens a card when the pointer rests on its chip (interestfor),
  // and the tile then stands straight: these checks want the tilt, not the
  // card.
  await page.evaluate(() => document.querySelectorAll('[interestfor]').forEach((chip) => chip.removeAttribute('interestfor')));
  // The pointer at the left edge of the screen, on no tile. Stirred a few
  // times: WebKit's build for tests draws a frame, and so delivers a scroll
  // or tells what came into view, mostly when something happens.
  const away = async () => {
    for (let i = 0; i < 4; i++) {
      await page.mouse.move(4, 420 + (i % 2), { steps: 2 });
      await page.waitForTimeout(50);
    }
  };

  // First, before anything scrolls: below the first screen, a tile waits
  // flat, stands up as it comes into view, does not lean until it is up,
  // and ends flat.
  const strength = page.locator('.tile.strength').nth(1);
  const waiting = await strength.evaluate((el) => [el.classList.contains('is-in'), getComputedStyle(el).transform]);
  await strength.evaluate((el) => jump(scrollY + el.getBoundingClientRect().top - 160));
  await landed(page);
  // WebKit's build for tests draws a frame, and so tells what came into
  // view, mostly when something happens: the pointer stirs at the edge.
  for (let i = 0; i < 80 && !(await strength.evaluate((el) => el.classList.contains('is-in'))); i++) await page.mouse.move(2, 300 + (i % 2));
  const rising = await strength.evaluate((el) => el.getAnimations().some((a) => a.animationName === 'stand-up'));
  const s = await strength.boundingBox();
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2, { steps: 2 });
  // While it stands up, it does not lean.
  const early = await strength.evaluate((el) => [el.getAnimations().some((a) => a.animationName === 'stand-up' && a.playState === 'running'), el.classList.contains('tilting')]);
  for (let i = 0; i < 3; i++) {
    await strength.evaluate((el) => {
      for (const animation of el.getAnimations()) if (animation.animationName === 'stand-up') animation.finish();
    });
    await page.mouse.move(s.x + s.width / 2 + 6 + i, s.y + s.height / 2 + 6, { steps: 2 });
  }
  const up = await strength.evaluate((el) => el.classList.contains('tilting'));
  await away();
  const standing = await strength.evaluate((el) => [el.classList.contains('is-in'), target(el)]);
  check(
    !waiting[0] && !waiting[1].startsWith('matrix3d') && rising && !(early[0] && early[1]) && up && standing[0] && standing[1] === 'none',
    `a tile below the first screen waits flat, stands up as it comes into view, leans only once up, and ends flat (${JSON.stringify([waiting, rising, early, up, standing])})`,
  );

  // From here on, every block of the page has arrived: one still on its
  // way below the screen is lower by its reveal, which the page's height
  // counts, and its arrival would move the page under the pointer (WebKit's
  // build for tests may hold it for seconds, then clamp the scroll).
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.reveal, .reveal-part, .cascade')) el.classList.add('is-in');
      for (const animation of document.getAnimations()) if (animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
    });
    await page.screenshot({ clip: { x: 0, y: 0, width: 8, height: 8 }, timeout: 5000 }).catch(() => {});
  }

  // A plain tile leans under the pointer, its edge lit, and stands flat
  // once it leaves; it keeps its shadow.
  await page.evaluate(() => jump(0));
  await landed(page);
  await away();
  const servers = page.locator('.bento > .t-servers');
  const box = await servers.boundingBox();
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2, { steps: 4 });
  await page.waitForTimeout(400);
  const leaning = await servers.evaluate((el) => [target(el), Number(getComputedStyle(el, '::after').opacity), el.classList.contains('tilting')]);
  check(leaning[0].startsWith('matrix3d') && leaning[1] > 0.9 && leaning[2], `a plain tile leans under the pointer, its edge lit (${leaning[0].slice(0, 24)}…, light ${leaning[1]})`);
  await away();
  check((await servers.evaluate(target)) === 'none', 'and stands flat once the pointer leaves');

  // Nothing that can be pressed moves by 3 px or more under the pointer: in
  // the intro, its call farther from the tile's centre, and in a tile of
  // chips, the chip farthest from it, where the tilt moves it most; the
  // pointer on it, the tile leaning.
  const pressables = [
    ["the intro's farther call", '.bento > .t-intro', '.btn'],
    ['the farthest chip of the stack', '.bento > .t-words', '[popovertarget]'],
    ['the farthest chip of the first project', '#projects .tile.card', '[popovertarget]'],
  ];
  for (const [label, tileSelector, inside] of pressables) {
    const tile = page.locator(tileSelector).first();
    // Its arrival over first: a tile waiting below the screen is lower by
    // its reveal, which the page's height counts, and WebKit's build for
    // tests may start a transition only at a later frame. So it is marked,
    // its motion sent to its end, again, and only then placed, its top
    // below the header so that it may lean.
    await tile.evaluate((el) => {
      el.classList.add('is-in');
      for (const part of el.querySelectorAll('.reveal-part, .cascade')) part.classList.add('is-in');
    });
    for (let i = 0; i < 3; i++) {
      await away();
      await tile.evaluate((el) => {
        for (const animation of el.getAnimations({ subtree: true })) if (animation.effect.getComputedTiming().iterations !== Infinity) animation.finish();
      });
    }
    await tile.evaluate(place);
    await landed(page);
    await away();
    const index = await tile.evaluate((el, inside) => {
      const centre = el.getBoundingClientRect();
      const [cx, cy] = [centre.left + centre.width / 2, centre.top + centre.height / 2];
      const all = [...el.querySelectorAll(inside)];
      const distance = (node) => {
        const b = node.getBoundingClientRect();
        return Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy);
      };
      return all.reduce((best, node, i) => (distance(node) > distance(all[best]) ? i : best), 0);
    }, inside);
    const element = tile.locator(inside).nth(index);
    await away();
    const aim = await element.boundingBox();
    await page.mouse.move(aim.x + aim.width / 2, aim.y + aim.height / 2, { steps: 4 });
    await page.waitForTimeout(150);
    // How far the tile's lean carries each corner of it: the transform the
    // browser applies, sent to its end, worked on the corner's place in the
    // flat tile (offsets, which no transform, translate or scale changes),
    // about the tile's centre, perspective included. Read so, the reveal's
    // own motion, which WebKit's build for tests may hold for seconds,
    // cannot count.
    const [moved, leant] = await tile.evaluate(
      (el, [index, inside]) => {
        const transform = target(el);
        const item = el.querySelectorAll(inside)[index];
        let [x, y] = [0, 0];
        let node = item;
        for (; node && node !== el; node = node.offsetParent) [x, y] = [x + node.offsetLeft, y + node.offsetTop];
        if (node !== el || transform === 'none') return [0, transform];
        const [w, h] = [el.offsetWidth, el.offsetHeight];
        const matrix = new DOMMatrix(transform);
        let worst = 0;
        for (const [cx, cy] of [
          [x, y],
          [x + item.offsetWidth, y],
          [x, y + item.offsetHeight],
          [x + item.offsetWidth, y + item.offsetHeight],
        ]) {
          const [px, py] = [cx + el.clientLeft - w / 2, cy + el.clientTop - h / 2];
          const p = matrix.transformPoint(new DOMPoint(px, py, 0, 1));
          worst = Math.max(worst, Math.abs(p.x / p.w - px), Math.abs(p.y / p.w - py));
        }
        return [worst, transform];
      },
      [index, inside],
    );
    check(leant.startsWith('matrix3d') && moved > 0.2 && moved < 3, `${label} moves by less than 3 px under the pointer, its tile leaning (${moved.toFixed(2)} px)`);
  }

  // A tile whose card is open stands straight.
  const chip = page.locator('.bento > .t-words [popovertarget]').first();
  await page.evaluate(() => jump(0));
  await landed(page);
  const chipBox = await chip.boundingBox();
  await page.mouse.move(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2, { steps: 4 });
  await page.waitForTimeout(150);
  await page.mouse.down();
  await page.mouse.up();
  const id = await chip.getAttribute('popovertarget');
  await page.waitForFunction((id) => document.getElementById(id).matches(':popover-open'), id, { timeout: 3000, polling: 100 }).catch(() => {});
  const open = await page.evaluate((id) => document.getElementById(id).matches(':popover-open'), id);
  check(open && (await page.locator('.bento > .t-words').evaluate(target)) === 'none', 'a tile whose card is open stands straight');
  await page.keyboard.press('Escape');
  await away();

  // The two link tiles rise and lean fully, their shadow easing into the
  // lifted one: the two shadows list the same kinds of shadow, inset then
  // outset, in the same order, or the browser could only jump from one to
  // the other. Then the flagship's slabs come apart.
  const kinds = (shadows) => shadows.split(/,(?![^(]*\))/).map((shadow) => shadow.includes('inset')).join();
  for (const [label, selector] of [
    ['the flagship', '.bento > .t-visual'],
    ['the CV', '.bento > .t-cv'],
  ]) {
    const tile = page.locator(selector);
    await tile.evaluate((el) => jump(scrollY + el.getBoundingClientRect().top - 200));
    await landed(page);
    await away();
    const resting = await tile.evaluate((el) => getComputedStyle(el).boxShadow);
    const b = await tile.boundingBox();
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2, { steps: 4 });
    await page.waitForTimeout(150);
    // Where the transform carries the tile's centre: up by its rise.
    const [rise, lifted] = await tile.evaluate((el) => {
      const transform = target(el);
      const shadow = getComputedStyle(el).boxShadow;
      if (transform === 'none') return [0, shadow];
      const centre = new DOMMatrix(transform).transformPoint(new DOMPoint(0, 0, 0, 1));
      return [centre.y / centre.w, shadow];
    });
    check(
      rise < -2 && lifted !== resting && kinds(lifted) === kinds(resting),
      `${label}'s tile rises under the pointer, its shadow easing into a deeper one (rise ${rise.toFixed(2)} px; ${kinds(resting)} → ${kinds(lifted)})`,
    );
    if (label === 'the flagship') {
      await page.waitForTimeout(700);
      const apart = await page.locator('.slabs .s3').evaluate(target);
      await away();
      await page.waitForTimeout(900);
      const together = await page.locator('.slabs .s3').evaluate(target);
      check(apart !== 'none' && together === 'none', 'the slabs come apart under the pointer, and close up after');
    }
    await away();
  }

  // A tile never leans while its top is under the header, and stands flat at
  // once, with no ease, when the page scrolls under a still pointer: Safari
  // would paint a tile in 3D over the header.
  const card = page.locator('#projects .tile.card').first();
  await card.evaluate(place);
  await landed(page);
  await away();
  const c = await card.boundingBox();
  await page.mouse.move(c.x + c.width * 0.6, c.y + c.height * 0.6, { steps: 4 });
  await page.waitForTimeout(150);
  const leanBefore = await card.evaluate((el) => [el.classList.contains('tilting'), target(el).startsWith('matrix3d')]);
  const scrollFrom = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 240);
  // A picture taken makes WebKit's build for tests draw, and so deliver the
  // scroll; the pointer itself does not move.
  for (let i = 0; i < 20 && (await page.evaluate((from) => scrollY === from, scrollFrom)); i++) await page.waitForTimeout(50);
  await page.screenshot({ clip: { x: 0, y: 0, width: 8, height: 8 }, timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(100);
  const scrolled = await page.evaluate(rest, names);
  const stillTilting = await page.evaluate(() => document.querySelectorAll('.tile.tilting').length);
  check(
    leanBefore[0] && leanBefore[1] && scrolled.threeD.length === 0 && stillTilting === 0,
    `a tile leaning under a still pointer stands flat at once when the page scrolls (${JSON.stringify(leanBefore)}, ${stillTilting} leaning${scrolled.threeD.length ? `, 3D: ${scrolled.threeD.join(', ')}` : ''})`,
  );
  const under = await card.evaluate((el) => {
    jump(scrollY + el.getBoundingClientRect().top - document.querySelector('header.top').getBoundingClientRect().bottom + 60);
    const b = el.getBoundingClientRect();
    return [b.left + b.width * 0.6, b.top + b.height * 0.7];
  });
  await landed(page);
  await page.mouse.move(under[0], under[1], { steps: 4 });
  await page.waitForTimeout(200);
  const hidden = await card.evaluate((el) => [target(el), el.classList.contains('tilting'), el.matches(':hover')]);
  check(hidden[2] && hidden[0] === 'none' && !hidden[1], 'a tile whose top is under the header does not lean');
  await away();

  // The sky never moves on its own, stays inside the screen, and leans away
  // from the pointer.
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.mouse.move(1200, 700, { steps: 4 });
  await page.waitForTimeout(150);
  const sky = await page.evaluate(() => ({
    lights: document.querySelectorAll('.aurora i').length,
    moving: [...document.querySelectorAll('.aurora, .aurora *')].reduce((n, el) => n + el.getAnimations().filter((a) => !(a instanceof CSSTransition)).length, 0),
    clip: getComputedStyle(document.querySelector('.aurora')).overflow,
    lean: (() => {
      const sky = document.querySelector('.aurora-in');
      for (const a of sky.getAnimations()) a.finish();
      return getComputedStyle(sky).translate;
    })(),
  }));
  check(sky.lights === 4 && sky.moving === 0 && sky.clip === 'hidden', `the sky never moves on its own and is clipped at the edge of the screen (${sky.moving} animation(s))`);
  check(sky.lean !== 'none' && sky.lean.startsWith('-'), `the sky leans away from the pointer (${sky.lean})`);

  await away();
  await page.waitForTimeout(1300);
  const state = await page.evaluate(rest, names);
  const over = await page.evaluate(() => window.motion.over);
  check(state.threeD.length === 0 && over <= 0, `after all that, no 3D anywhere and nothing past the sides${state.threeD.length ? ` (${state.threeD.join(', ')})` : ''}`);
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
            if (device !== 'wide screen') return;
            const b = await page.locator('.bento > .t-servers').boundingBox();
            await page.mouse.move(b.x + b.width * 0.85, b.y + b.height * 0.2, { steps: 4 });
            await page.waitForTimeout(300);
            const still = await page.evaluate(() => [
              document.querySelector('.bento > .t-servers').getAnimations().length,
              getComputedStyle(document.querySelector('.bento > .t-servers')).transform,
              getComputedStyle(document.querySelector('.aurora-in')).translate,
            ]);
            check(still[1] === 'none' && still[2] === 'none', `with less motion, no tile leans and the sky stays put (${still.slice(1).join(', ')})`);
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
      tasks.push([`${name}, ${lang}, wide screen, effects:`, wide, (check) => effects(url, check)]);
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
