// Routed workers under a parent Codex session. No native subagent tools.
// Preview is read-only and never contacts the proxy. Send requires an exact preview digest.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const runnerDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(runnerDir, '../..');
const liveDir = path.join(root, 'outputs/live-demo');
const endpoint = 'http://127.0.0.1:10100/v1/responses';
const spec = JSON.parse(await fs.readFile(path.join(runnerDir, 'tasks.json'), 'utf8'));
const routes = {
  build: { model: 'minimax/MiniMax-M3', effort: 'low', cap: 6000, aliases: ['minimax/MiniMax-M3', 'MiniMax-M3'] },
  correctness: { model: 'anthropic/claude-sonnet-5-5', effort: 'high', cap: 4000, aliases: ['anthropic/claude-sonnet-5-5'] },
  frontend: { model: 'zai/glm-5.3', effort: 'low', cap: 4000, aliases: ['zai/glm-5.3', 'glm-5.3'] }
};
const allowedFiles = new Set(['index.html', 'build-trace.json', 'correctness-trace.json', 'frontend-trace.json', 'correctness.md', 'frontend.md', 'background-started.json']);
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
  if (!allowedFiles.has(name)) throw Error('Output filename is not allowed.');
  const target = path.join(liveDir, name);
  await noLinks(target);
  await fs.mkdir(liveDir, { recursive: true });
  await noLinks(target);
  await fs.writeFile(target, content, { encoding: 'utf8', flag: 'wx' });
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
async function sendOne(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 150000);
  let response;
  try {
    response = await fetch(endpoint, { method: 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item.request), signal: controller.signal });
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
  const [action = 'preview', stage = 'build', approval, ...extra] = process.argv.slice(2);
  if (!['preview', 'send'].includes(action) || !['build', 'reviews', 'background'].includes(stage) || extra.length ||
      (action === 'preview' && approval) || (action === 'send' && !/^--approved-sha256=[a-f0-9]{64}$/.test(approval ?? ''))) {
    throw Error('Usage: run.mjs preview build|reviews|background OR run.mjs send build|reviews|background --approved-sha256=<digest>. Sending is allowed only after the user explicitly approves the displayed recipients and full content.');
  }
  validateSpec();
  const items = await plan(stage);
  const digest = hash(JSON.stringify(items));
  if (action === 'preview') {
    console.log(JSON.stringify({ kind: 'REQUEST PREVIEW ONLY — no provider contacted',
      upstream: 'OpenCodex resolves each exact model route through its current configuration. Verify the provider destination in the dashboard before approval; this runner does not inspect or modify provider configuration.',
      ...(stage === 'background' ? { sequence: 'Fresh build, then parallel reviews of the fixed example. The fresh build is not sent to reviewers.' } : {}),
      requests: items, approvalSha256: digest }, null, 2));
  } else {
    if (approval !== `--approved-sha256=${digest}`) throw Error('Approval digest does not match the exact current messages and source. Preview again and obtain fresh approval.');
    await noLinks(liveDir);
    for (const item of items) {
      for (const name of [`${item.key}-trace.json`, item.key === 'build' ? 'index.html' : `${item.key}.md`]) {
        try { await fs.lstat(path.join(liveDir, name)); throw Error(`Refusing to overwrite existing ${name}. Use the backup or have the coordinator resolve the existing live run.`); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
    let queue = items;
    if (stage === 'background') {
      await writeLive('background-started.json', JSON.stringify({ approvalSha256: digest, startedAt: new Date().toISOString() }) + '\n');
      await sendOne(items[0]);
      queue = items.slice(1);
    }
    const outcomes = await Promise.allSettled(queue.map(sendOne));
    const failed = outcomes.filter(outcome => outcome.status === 'rejected');
    if (failed.length) throw Error(failed.map(outcome => outcome.reason.message).join('\n'));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
