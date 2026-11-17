// Temporary: what makes WebKit's compositor crash on the runner, page or engine.
import { webkit } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4321/';
const runs = Number(process.env.RUNS ?? 15);
const variants = [
  ['experience (base)', 'fr/experience/', {}],
  ['blank page', 'about:blank', {}],
  ['plain HTML, tall', 'data:text/html,<body style="margin:0"><div style="height:6000px;background:linear-gradient(red,blue)">x</div>', {}],
  ['404 page', '404.html', {}],
  ['experience, CPU rendering', 'fr/experience/', { WEBKIT_SKIA_ENABLE_CPU_RENDERING: '1' }],
  ['experience, no compositing', 'fr/experience/', { WEBKIT_DISABLE_COMPOSITING_MODE: '1' }],
  ['experience, 1 painting thread', 'fr/experience/', { WEBKIT_SKIA_CPU_PAINTING_THREADS: '0' }],
];
for (const [name, path, env] of variants) {
  let crashes = 0;
  for (let i = 0; i < runs; i++) {
    const browser = await webkit.launch({ env: { ...process.env, ...env } });
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    let crashed = false;
    page.on('crash', () => (crashed = true));
    try {
      await page.goto(/^(about|data):/.test(path) ? path : `${base}${path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(3000);
      await page.evaluate(() => 1).catch(() => (crashed = true));
    } catch { crashed = true; }
    if (crashed) crashes++;
    await browser.close().catch(() => {});
  }
  console.log(`RESULT ${name}: ${crashes}/${runs} crashed`);
}
