// Local browser check for the live result. Reads one HTML file; blocks every non-file request.
// Writes screenshots only when the checked file is inside outputs/live-demo/.
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const file = path.resolve(root, process.argv[2] ?? 'outputs/live-demo/index.html');
const liveDir = path.join(root, 'outputs/live-demo');
const shots = path.dirname(file) === liveDir && (path.basename(file) === 'index.html' || process.argv.includes('--screenshots'));
const require = createRequire(import.meta.url);
let playwrightPath;
try { playwrightPath = require.resolve('playwright'); }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  let modules = process.env.RUNTIME_NODE_MODULES ?? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!modules) {
    try { modules = JSON.parse(await fs.readFile(new URL('local-runtime.json', import.meta.url), 'utf8')).nodeModules; }
    catch (configError) { if (configError.code !== 'ENOENT') throw configError; }
  }
  if (!modules || !path.isAbsolute(modules)) throw Error('Playwright unavailable. Install it or configure the bundled runtime before launching.');
  playwrightPath = require.resolve(path.join(modules, 'playwright'));
}
const pw = require(playwrightPath);
const { chromium } = pw.default ?? pw;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, offline: true, serviceWorkers: 'block' });
  const blocked = [];
  const widget = pathToFileURL(file).href;
  await page.route('**/*', route => route.request().url() === widget ? route.continue() : (blocked.push(route.request().url()), route.abort()));
  await page.goto(widget);
  const inputs = page.locator('input');
  const text = async () => (await page.locator('body').innerText());
  assert.equal(await inputs.count(), 3, 'CHECK: Expected three calculator inputs.');
  assert.equal(await page.getByRole('button', { name: /calculate/i }).count(), 0, 'CHECK: Remove the Calculate button; update as inputs change.');
  assert.equal(await page.getByRole('button', { name: /reset/i }).count(), 1, 'CHECK: Expected one Reset button.');
  assert.match(await text(), /\$300\.00/, 'CHECK: Default inputs 4 attendees, 30 minutes and 150 CAD/hour must show $300.00.');
  await inputs.nth(1).fill('60');
  assert.match(await text(), /\$600\.00/, 'CHECK: Changing duration to 60 minutes must automatically show $600.00.');
  await inputs.nth(1).fill('0');
  assert.match(await text(), /\$0\.00/, 'CHECK: Zero minutes must show $0.00.');
  for (const [index, value] of [[0, '1.5'], [0, ''], [0, '-1'], [1, ''], [1, '-1'], [2, ''], [2, '-1']]) {
    await page.getByRole('button', { name: /reset/i }).click();
    await inputs.nth(1).fill('60');
    assert.match(await text(), /\$600\.00/, 'CHECK: Restore a known valid total before validation tests.');
    await inputs.nth(index).fill(value);
    const bad = await text();
    assert(!/NaN|Infinity|undefined/.test(bad), 'CHECK: Invalid input must not expose NaN, Infinity, or undefined.');
    assert(!/\$600\.00/.test(bad), 'CHECK: Invalid input must clear the stale total.');
    const visibleError = await page.locator('[role="alert"], [aria-invalid="true"]').evaluateAll(nodes =>
      nodes.some(node => node.getClientRects().length && (node.getAttribute('aria-invalid') === 'true' || node.textContent.trim())));
    assert(visibleError, 'CHECK: Invalid input must show an error or mark the field aria-invalid.');
  }
  await page.getByRole('button', { name: /reset/i }).click();
  assert.match(await text(), /\$300\.00/, 'CHECK: Reset must restore the defaults and $300.00.');
  if (shots) await page.screenshot({ path: path.join(liveDir, 'live-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'CHECK: The app must fit a 390px viewport without horizontal scrolling.');
  if (shots) await page.screenshot({ path: path.join(liveDir, 'live-mobile.png'), fullPage: true });
  assert.equal(blocked.length, 0, 'CHECK: The app attempted external requests and must work offline.');
  console.log('Behavior checks passed: no Calculate, Reset, defaults 300.00, 600.00 auto-update, zero duration, fractional/blank/negative rejection, stale totals cleared, visible validation, 390px fit, zero external requests. Nonfinite and overflow edge cases require separate checks.');
} finally { await browser.close(); }
