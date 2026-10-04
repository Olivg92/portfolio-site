// A minimal client of the Chrome DevTools Protocol: enough to open a page at
// a given size, run code in it, click as a mouse does and take screenshots.
// Nothing to install but Chrome; Node 22 or later brings WebSocket and fetch.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Talks to the Chrome at CDP_URL when set, one already started with
// --remote-debugging-port, or else starts a headless one of its own:
// CHROME_PATH, or google-chrome.
export async function browser() {
  let endpoint = process.env.CDP_URL;
  let child;
  let profile;
  if (!endpoint) {
    const port = 9300 + Math.floor(Math.random() * 600);
    profile = mkdtempSync(join(tmpdir(), 'chrome-'));
    child = spawn(
      process.env.CHROME_PATH || 'google-chrome',
      ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'],
      { stdio: 'ignore' },
    );
    endpoint = `http://127.0.0.1:${port}`;
  }
  for (let i = 0; ; i++) {
    try {
      await fetch(`${endpoint}/json/version`);
      break;
    } catch (error) {
      if (i === 50) throw new Error(`no Chrome answers at ${endpoint}: ${error.message}`);
      await sleep(200);
    }
  }
  return {
    page: (options) => page(endpoint, options),
    close() {
      child?.kill();
      if (profile) rmSync(profile, { recursive: true, force: true });
    },
  };
}

async function page(endpoint, { width, height, mobile = false, reducedMotion = false }) {
  const tab = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (message) => (message.error ? reject(new Error(`${method}: ${message.error.message}`)) : resolve(message.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  if (reducedMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.enable');

  return {
    async goto(url, settle = 2500) {
      await send('Page.navigate', { url });
      await sleep(settle);
    },
    async eval(expression) {
      const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(`${expression.slice(0, 60)}: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
      return result.value;
    },
    async click(x, y) {
      for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
    },
    async style(css) {
      await this.eval(`document.head.insertAdjacentHTML('beforeend', ${JSON.stringify(`<style>${css}</style>`)})`);
    },
    async screenshot(format = 'png', quality = undefined) {
      const { data } = await send('Page.captureScreenshot', { format, quality });
      return Buffer.from(data, 'base64');
    },
    async close() {
      await fetch(`${endpoint}/json/close/${tab.id}`);
      ws.close();
    },
  };
}
