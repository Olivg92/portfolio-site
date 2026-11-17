// Temporary: which part of the page makes WebKit's compositor crash on the runner.
import { webkit } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4321/';
const runs = Number(process.env.RUNS ?? 15);
const variants = {
  base: '',
  'no backdrop-filter': '*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
  'no animation or transition': '*, *::before, *::after { animation: none !important; transition: none !important; }',
  'no aurora': '.aurora { display: none !important; }',
  'no filter or blur at all': '*, *::before, *::after { filter: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
  'no view-transition name': '* { view-transition-name: none !important; }',
};
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
for (const [name, css] of Object.entries(variants)) {
  if (only && !only.test(name)) continue;
  let crashes = 0;
  for (let i = 0; i < runs; i++) {
    const browser = await webkit.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    let crashed = false;
    page.on('crash', () => (crashed = true));
    if (css) await page.addInitScript((c) => { const s = document.createElement('style'); s.textContent = c; (document.head ?? document.documentElement).append(s); }, css);
    try {
      await page.goto(`${base}fr/experience/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      await page.waitForTimeout(2500);
      await page.evaluate(() => 1, null).catch(() => (crashed = true));
    } catch { crashed = true; }
    if (crashed) crashes++;
    await browser.close().catch(() => {});
  }
  console.log(`RESULT ${name}: ${crashes}/${runs} crashed`);
}
