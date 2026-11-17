// Temporary: what makes WebKit's compositor crash on the runner, page or engine.
import { webkit } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4321/';
const runs = Number(process.env.RUNS ?? 15);
// A script run as the page starts: strips one kind of content before WebKit draws it.
const strip = (what) => `new MutationObserver(() => {
  for (const el of document.querySelectorAll(${JSON.stringify(what)})) el.remove();
}).observe(document, { childList: true, subtree: true });`;
const variants = process.env.BASE_ONLY ? [['experience (base)', 'fr/experience/', {}]] : [
  ['experience (base)', 'fr/experience/', {}],
  ['no popover cards', 'fr/experience/', {}, strip('[popover]')],
  ['no interestfor', 'fr/experience/', {}, `new MutationObserver(() => { for (const el of document.querySelectorAll('[interestfor]')) el.removeAttribute('interestfor'); }).observe(document, { childList: true, subtree: true });`],
  ['no details', 'fr/experience/', {}, strip('details')],
  ['no web fonts', 'fr/experience/', {}, strip('link[rel=preload][as=font], style[data-astro-font], link[rel=stylesheet][href*=font]')],
  ['home page', '', {}],
];
for (const [name, path, env, init] of variants) {
  let crashes = 0;
  for (let i = 0; i < runs; i++) {
    const browser = await webkit.launch({ env: { ...process.env, ...env } });
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    let crashed = false;
    page.on('crash', () => (crashed = true));
    if (init) await page.addInitScript(init);
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
