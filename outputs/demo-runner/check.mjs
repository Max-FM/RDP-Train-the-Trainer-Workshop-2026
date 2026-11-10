// Local browser check for the live result. Reads one HTML file; blocks every non-file request.
// Writes screenshots only when the checked file is inside outputs/live-demo/.
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const file = path.resolve(root, process.argv[2] ?? 'outputs/live-demo/index.html');
const liveDir = path.join(root, 'outputs/live-demo');
const shots = path.dirname(file) === liveDir;
const pw = createRequire(import.meta.url)('playwright');
const { chromium } = pw.default ?? pw;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const blocked = [];
  await page.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : (blocked.push(route.request().url()), route.abort()));
  await page.goto(pathToFileURL(file).href);
  const inputs = page.locator('input');
  const text = async () => (await page.locator('body').innerText());
  assert.equal(await inputs.count(), 3, 'three inputs expected');
  assert.equal(await page.getByRole('button', { name: /calculate/i }).count(), 0, 'no Calculate button');
  assert.equal(await page.getByRole('button', { name: /reset/i }).count(), 1, 'one Reset button');
  assert.match(await text(), /\$300\.00/);
  await inputs.nth(1).fill('60');
  assert.match(await text(), /\$600\.00/, 'auto-updates to 600');
  await inputs.nth(1).fill('0');
  assert.match(await text(), /\$0\.00/);
  await inputs.nth(0).fill('1.5');
  const bad = await text();
  assert(!/NaN|Infinity|undefined/.test(bad), 'invalid attendees must not show NaN or Infinity');
  await page.getByRole('button', { name: /reset/i }).click();
  assert.match(await text(), /\$300\.00/, 'reset restores 300');
  if (shots) await page.screenshot({ path: path.join(liveDir, 'live-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'fits 390px');
  if (shots) await page.screenshot({ path: path.join(liveDir, 'live-mobile.png'), fullPage: true });
  assert.equal(blocked.length, 0, 'external requests: ' + blocked.join(', '));
  console.log('Live checks passed: no Calculate, Reset, 300.00, 600.00 auto-update, 0.00, fractional attendees show no NaN, 390px fit, zero external requests.');
} finally { await browser.close(); }
