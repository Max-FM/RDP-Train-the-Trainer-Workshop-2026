// Routed workers under a parent Codex session. No native subagent tools.
// The demo runs a fixed batch. Manual build/reviews keep their exact-preview flow.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runnerDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(runnerDir, '../..');
const liveDir = path.join(root, 'outputs/live-demo');
const endpoint = 'http://127.0.0.1:10100/v1/responses';
const spec = JSON.parse(await fs.readFile(path.join(runnerDir, 'tasks.json'), 'utf8'));
// Binds the three demo requests to the shipped prompts, model IDs, and fixed review source.
const demoBatchSha256 = 'a9a97c1ec769204de8b24b85af165a79885f3952436d04a8f6269c09955a6b48';
const routes = {
  build: { model: 'minimax/MiniMax-M3', effort: 'low', cap: 6000, aliases: ['minimax/MiniMax-M3', 'MiniMax-M3'] },
  correctness: { model: 'anthropic/claude-sonnet-5-5', effort: 'high', cap: 4000, aliases: ['anthropic/claude-sonnet-5-5'] },
  frontend: { model: 'zai/glm-5.3', effort: 'low', cap: 4000, aliases: ['zai/glm-5.3', 'glm-5.3'] }
};
const allowedFiles = new Set(['index.html', 'build-trace.json', 'correctness-trace.json', 'frontend-trace.json', 'correctness.md', 'frontend.md', 'background-started.json', 'live-check.json']);
const liveArtifacts = [...allowedFiles, 'live-desktop.png', 'live-mobile.png'];
const runIdFlag = /^--run-id=([a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})$/;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

async function noLinks(target) {
  const rel = path.relative(root, target);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw Error('Path is outside the live output scope.');
  let current = root;
  for (const part of rel.split(path.sep)) {
    current = path.join(current, part);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) throw Error('Refusing a linked output path.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
async function writeLive(name, content) {
  if (!allowedFiles.has(name) && !/^used-[a-f0-9-]{36}\.json$/.test(name)) throw Error('Output filename is not allowed.');
  const target = path.join(liveDir, name);
  await noLinks(target);
  await fs.mkdir(liveDir, { recursive: true });
  await noLinks(target);
  await fs.writeFile(target, content, { encoding: 'utf8', flag: 'wx' });
}
async function lockLive() {
  const lock = path.join(liveDir, '.runner.lock');
  await noLinks(lock);
  await fs.mkdir(liveDir, { recursive: true });
  await noLinks(lock);
  try { await fs.writeFile(lock, String(process.pid), { flag: 'wx' }); }
  catch (error) {
    if (error.code === 'EEXIST') throw Error('A job is already active or its lock needs inspection. No request was sent.');
    throw error;
  }
  return () => fs.unlink(lock);
}
async function resetLive() {
  const existing = [];
  for (const name of liveArtifacts) {
    const target = path.join(liveDir, name);
    await noLinks(target);
    try {
      if (!(await fs.lstat(target)).isFile()) throw Error(`Refusing to remove a non-file live artifact: ${name}`);
      existing.push(target);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const target of existing) await fs.unlink(target);
}
async function ensureBackup() {
  const target = path.join(root, 'outputs/backup/index.html');
  await noLinks(target);
  try {
    if (!(await fs.lstat(target)).isFile()) throw Error('Backup path exists and is not a regular file.');
    return;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const source = path.join(root, 'outputs/demo/index.html');
  await noLinks(source);
  const html = await fs.readFile(source, 'utf8');
  validateHtml(html);
  const body = /<body(?:\s[^>]*)?>/i;
  if (!body.test(html)) throw Error('Bundled example has no body for the backup label.');
  const backup = html.replace(body, '$&\n<p role="status" style="text-align:center;font-weight:bold">BACKUP — prepared offline example</p>');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await noLinks(target);
  await fs.writeFile(target, backup, { encoding: 'utf8', flag: 'wx' });
  console.log('Created offline backup at outputs/backup/index.html.');
}
async function checkLive() {
  try {
    const result = await promisify(execFile)(process.execPath, [path.join(runnerDir, 'check.mjs')], { cwd: root, timeout: 45000, windowsHide: true });
    await writeLive('live-check.json', JSON.stringify({ passed: true, summary: result.stdout.trim() }) + '\n');
    console.log(result.stdout.trim());
  } catch (error) {
    await writeLive('live-check.json', JSON.stringify({ passed: false, summary: error.message }) + '\n');
    throw Error('Live widget did not pass the browser check. See outputs/live-demo/live-check.json and use the backup.');
  }
}
function validateSpec() {
  if (spec.endpoint !== endpoint) throw Error('Proxy destination changed. Stop for review.');
  for (const [key, route] of Object.entries(routes)) {
    const task = spec[key];
    if (task.model !== route.model || task.effort !== route.effort || task.maxOutputTokens !== route.cap ||
        JSON.stringify(task.responseModels) !== JSON.stringify(route.aliases) || typeof task.message !== 'string') {
      throw Error(`Exact route or budget changed for ${key}. Stop for review.`);
    }
  }
}
async function plan(stage) {
  const keys = stage === 'build' ? ['build'] : stage === 'background' ? ['build', 'correctness', 'frontend'] : ['correctness', 'frontend'];
  const sourcePath = stage === 'background' ? 'outputs/demo/index.html' : stage === 'reviews' ? 'outputs/live-demo/index.html' : null;
  let source = null;
  if (sourcePath) {
    const target = path.join(root, sourcePath);
    await noLinks(target);
    source = await fs.readFile(target, 'utf8');
    // Make the fixed example's exact outbound text independent of checkout line endings.
    if (stage === 'background') source = source.replaceAll('\r\n', '\n');
    validateHtml(source);
  }
  return keys.map(key => {
    const task = spec[key];
    const review = key !== 'build';
    const message = review ? `${task.message}\n\n<BEGIN_WIDGET_SOURCE>\n${source}\n<END_WIDGET_SOURCE>` : task.message;
    return {
      role: task.role, key, endpoint, sourceSha256: review ? hash(source) : null,
      ...(stage === 'background' && review ? { sourcePath } : {}),
      request: { model: task.model, input: [{ role: 'user', content: message }], stream: false,
        store: false, reasoning: { effort: task.effort }, max_output_tokens: task.maxOutputTokens }
    };
  });
}
function validateHtml(html) {
  if (typeof html !== 'string' || Buffer.byteLength(html) > 60000 || !/<html[\s>]/i.test(html)) throw Error('Builder did not return a complete, bounded HTML document.');
  // Conservative offline check; the coordinator still verifies the rendered page with networking blocked.
  if (/https?:|\b(?:src|href|action|srcdoc)\s*=|@import|@font-face|url\s*\(|\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/i.test(html)) {
    throw Error('Generated source failed the conservative offline check. Ask the coordinator to inspect the trace; no retry was sent.');
  }
}
async function checkDemoRoutes(items) {
  const catalog = new URL('/v1/models', endpoint);
  const signal = AbortSignal.timeout(7000);
  let response;
  try { response = await fetch(catalog, { redirect: 'error', signal }); }
  catch (error) {
    const detail = signal.aborted ? 'timed out after 7 seconds' : error.cause?.message ?? error.message;
    throw Error(`Proxy catalog request failed: ${detail}. No model request was sent.`, { cause: error });
  }
  if (!response.ok) throw Error(`Proxy catalog returned HTTP ${response.status}. No model request was sent.`);
  const catalogData = await response.json();
  const available = new Set(Array.isArray(catalogData.data) ? catalogData.data.map(entry => entry.id) : []);
  const missing = items.map(item => item.request.model).filter(model => !available.has(model));
  if (missing.length) throw Error(`Proxy catalog is missing ${missing.join(', ')}. No model request was sent.`);
}
async function sendOne(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 150000);
  let response;
  try {
    try {
      response = await fetch(endpoint, { method: 'POST', redirect: 'error',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.request), signal: controller.signal });
    } catch (error) {
      const detail = controller.signal.aborted ? 'timed out after 150 seconds' : [error.cause?.code, error.cause?.message].filter(Boolean).join(': ') || error.message;
      throw Error(`${item.key}: request to ${endpoint} failed: ${detail}. No retry.`, { cause: error });
    }
    if (!response.ok) throw Error(`Proxy returned HTTP ${response.status}. No fallback or retry.`);
    const data = await response.json();
    await writeLive(`${item.key}-trace.json`, JSON.stringify({
      kind: 'routed worker; not a native subagent', completedAt: new Date().toISOString(),
      requestedModel: item.request.model, responseModel: data.model, sourceSha256: item.sourceSha256,
      ...(item.sourcePath ? { sourcePath: item.sourcePath } : {}),
      request: item.request, usage: data.usage, status: data.status, output: data.output,
      exactResponseAliasAccepted: routes[item.key].aliases.includes(data.model)
    }, null, 2) + '\n');
    if (!routes[item.key].aliases.includes(data.model)) throw Error(`Unexpected response model ${data.model}; stopped without substituting.`);
    if (data.status && data.status !== 'completed') throw Error(`Provider status ${data.status}; stopped without retry.`);
    if ((data.output ?? []).some(part => part.type === 'function_call')) throw Error('Unexpected tool request; no tools are executed.');
    const prose = (data.output ?? []).flatMap(part => part.content ?? [])
      .filter(part => part.type === 'output_text').map(part => part.text).join('\n');
    if (!prose) throw Error('Provider returned no text.');
    if (item.key === 'build') {
      const html = JSON.parse(prose).html;
      validateHtml(html);
      await writeLive('index.html', html);
    } else {
      const scope = item.sourcePath ? `Reviewed the fixed example \`${item.sourcePath}\`. This review does not cover the fresh build.\n\n` : '';
      await writeLive(`${item.key}.md`, `<!-- Routed worker; source SHA-256 ${item.sourceSha256} -->\n${scope}${prose}\n`);
    }
    console.log(`${item.key}: received ${data.model}; saved under outputs/live-demo/. Browser verification remains with the coordinator.`);
  } finally { clearTimeout(timer); }
}

try {
  const [action = 'preview', argument, approval, ...extra] = process.argv.slice(2);
  const demo = action === 'demo';
  const stage = demo ? 'background' : argument ?? 'build';
  const background = stage === 'background';
  const suppliedRun = demo ? argument?.match(runIdFlag)?.[1] : null;
  const valid = demo ? (!argument || suppliedRun) && !approval :
    action === 'preview' ? ['build', 'reviews', 'background'].includes(stage) && !approval :
    action === 'send' && ['build', 'reviews'].includes(stage) && /^--approved-sha256=[a-f0-9]{64}$/.test(approval ?? '');
  if (!valid || extra.length) {
    throw Error('Use run.mjs demo [--run-id=<UUID>] to launch, or preview background to inspect the fixed batch. Manual: preview build|reviews or send build|reviews --approved-sha256=<digest>.');
  }
  validateSpec();
  const items = await plan(stage);
  const runId = demo ? (suppliedRun ?? crypto.randomUUID()) : null;
  const digest = hash(JSON.stringify(items));
  if (background && digest !== demoBatchSha256) throw Error('The fixed demo requests or example changed. No model request was sent. Restore the matching workshop files.');
  if (action === 'preview') {
    console.log(JSON.stringify({ kind: 'REQUEST PREVIEW ONLY — no provider contacted',
      upstream: 'OpenCodeX resolves each exact model route through its current configuration. This runner does not modify provider configuration.',
      ...(background ? { launch: 'node outputs/demo-runner/run.mjs demo', batchSha256: digest,
        sequence: 'Preserve the backup, check the proxy catalog, clear prior live artifacts, build afresh, then verify locally and review the fixed example in parallel.' } : { approvalSha256: digest }),
      requests: items }, null, 2));
  } else {
    if (!demo && approval !== `--approved-sha256=${digest}`) throw Error('Approval digest does not match the exact current messages and source. Preview again and obtain fresh approval.');
    const release = await lockLive();
    try {
      let work;
      if (demo) {
        try { await writeLive(`used-${runId}.json`, JSON.stringify({ batchSha256: digest }) + '\n'); }
        catch (error) {
          if (error.code === 'EEXIST') throw Error('This run ID was already attempted. No model request was sent.');
          throw error;
        }
        await ensureBackup();
        await checkDemoRoutes(items);
        await resetLive();
        await writeLive('background-started.json', JSON.stringify({ runId, batchSha256: digest, startedAt: new Date().toISOString() }) + '\n');
        console.log(`Background run ${runId} started.`);
        await sendOne(items[0]);
        work = [...items.slice(1).map(sendOne), checkLive()];
      } else {
        for (const item of items) {
          for (const name of [`${item.key}-trace.json`, item.key === 'build' ? 'index.html' : `${item.key}.md`]) {
            try { await fs.lstat(path.join(liveDir, name)); throw Error(`Refusing to overwrite existing ${name}. Use the backup or have the coordinator resolve the existing live run.`); }
            catch (error) { if (error.code !== 'ENOENT') throw error; }
          }
        }
        work = items.map(sendOne);
      }
      const outcomes = await Promise.allSettled(work);
      const failed = outcomes.filter(outcome => outcome.status === 'rejected');
      if (failed.length) throw Error(failed.map(outcome => outcome.reason.message).join('\n'));
    } finally { await release(); }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
