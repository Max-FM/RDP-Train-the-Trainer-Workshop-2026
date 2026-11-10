// Offline Edge rendering of one calculator HTML file in demo/live to desktop and mobile PNGs.
// Blocks every request except the file itself. Output: <name>-desktop.png and <name>-mobile.png.
import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const liveDir = path.join(root, 'demo/live');
const file = path.resolve(root, process.argv[2] ?? 'demo/live/draft.html');
if (path.dirname(file) !== liveDir || !file.endsWith('.html')) throw Error('Render only an HTML file in demo/live.');
const name = path.basename(file, '.html');
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
  const widget = pathToFileURL(file).href;
  for (const [suffix, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, offline: true, serviceWorkers: 'block', deviceScaleFactor: 1 });
    await page.route('**/*', route => route.request().url() === widget ? route.continue() : route.abort());
    await page.goto(widget);
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ fullPage: true });
    await fs.writeFile(path.join(liveDir, name + '-' + suffix + '.png'), png, { flag: 'wx' });
    await page.close();
  }
  console.log('Rendered ' + name + ' at 1280px and 390px.');
} finally { await browser.close(); }
