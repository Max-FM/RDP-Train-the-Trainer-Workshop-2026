// Offline regression test: fake providers, real bundled Edge.
// Run with Codex's bundled Node executable. No provider or proxy is contacted.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rdp-workshop-test-'));
const sourcePath = 'outputs/demo/index.html';
const launcher = 'outputs/demo-runner/demo.ps1';
for (const file of [sourcePath, launcher, 'outputs/demo-runner/run.mjs', 'outputs/demo-runner/tasks.json', 'outputs/demo-runner/check.mjs']) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.copyFileSync(path.join(repo, file), path.join(root, file));
}
const live = path.join(root, 'outputs/live-demo');
const backup = path.join(root, 'outputs/backup/index.html');
fs.mkdirSync(live, { recursive: true });
fs.mkdirSync(path.dirname(backup), { recursive: true });
fs.writeFileSync(backup, fs.readFileSync(path.join(root, sourcePath)));
const originalBackup = fs.readFileSync(backup, 'utf8');
fs.writeFileSync(path.join(live, 'index.html'), 'STALE BUILD');
fs.writeFileSync(path.join(live, 'unrelated.txt'), 'KEEP UNRELATED');
const log = path.join(root, 'requests.jsonl');
const mock = path.join(root, 'mock.mjs');
const reference = fs.readFileSync(path.join(root, sourcePath), 'utf8');
const draft = reference.replace('value="30" aria-describedby="minutes-err"', 'value="31" aria-describedby="minutes-err"');
assert.notEqual(reference, draft);
const revised = reference.replace('Reset to defaults</button>', 'Reset calculator to defaults</button>');
fs.writeFileSync(mock, `
import fs from 'node:fs';
const ids = ['minimax/MiniMax-M3', 'anthropic/claude-sonnet-5-5', 'zai/glm-5.3'];
const draft = ${JSON.stringify(draft)};
const revised = ${JSON.stringify(revised)};
globalThis.fetch = async (url, opts) => {
  const endpoint = String(url), req = opts?.body ? JSON.parse(opts.body) : null;
  fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ endpoint, req }) + '\\n');
  if (endpoint.endsWith('/v1/models')) return {ok:true,json:async()=>({data:ids.map(id=>({id}))})};
  const input = req.input[0].content;
  let text;
  if (req.model === ids[0] && input.startsWith('Revise ')) {
    if (input.includes('one string property named html')) throw Error('Conflicting build format in the revision request');
    const feedback = JSON.parse(input.split('Feedback data (JSON):\\n')[1]);
    if (feedback.draft !== draft || feedback.accepted.length !== 3 || input.includes('external font XYZ') || feedback.browserCheck.passed) {
      throw Error('Wrong coordinator handoff');
    }
    text = JSON.stringify({html:process.env.RDP_FAIL_FINAL ? draft.replace('Reset to defaults','Reset calculator to defaults') : revised,
      applied:['Fixed duration','Clarified Reset'],skipped:[]});
  } else if (req.model === ids[0]) {
    if (!input.startsWith('Return only JSON with one string property named html.')) throw Error('Missing build format');
    text = JSON.stringify({html:draft});
  } else {
    if (!input.includes(draft)) throw Error('Reviewer did not receive the fresh draft');
    text = req.model === ids[1] ? 'Set duration to 30 rather than 31.' : 'Clarify Reset. Add external font XYZ.';
  }
  return {ok:true,json:async()=>({model:req.model,status:'completed',output:[{content:[{type:'output_text',text}]}]})};
};`);

const env = { ...process.env, NODE_OPTIONS: '--import=' + pathToFileURL(mock).href };
const run = (args, extra = {}) => spawnSync('powershell.exe',
  ['-NoProfile', '-NonInteractive', '-File', launcher, '-NodeExecutable', process.execPath, ...args],
  { cwd: root, encoding: 'utf8', env: { ...env, ...extra } });
const count = () => fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse).filter(item => item.req).length;
const decision = (source, finding, disposition = 'apply') => ({ source, finding, disposition, rationale: 'Verified against the actual draft and offline scope.' });
function prepare() {
  const result = run(['-Mode', 'Prepare']);
  assert.equal(result.status, 0, result.stdout + '\n' + result.stderr);
  assert.match(result.stdout, /Ready for GPT coordinator/);
  assert.equal(fs.existsSync(path.join(live, 'index.html')), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(live, 'draft-check.json'), 'utf8')).assertionFailed, true);
  return JSON.parse(fs.readFileSync(path.join(live, 'review-ready.json'), 'utf8')).runId;
}
function coordinate(runId, browser = true) {
  fs.writeFileSync(path.join(live, 'coordination.json'), JSON.stringify({ runId, decisions: [
    decision('correctness', 'Set duration to 30'),
    decision('frontend', 'Clarify Reset'),
    decision('frontend', 'Add external font XYZ', 'skip'),
    ...(browser ? [decision('browser', 'Restore the default total')] : [])
  ] }));
}
const preview = run(['-Mode', 'Preview']);
assert.equal(preview.status, 0, preview.stderr);
assert.equal(fs.existsSync(log), false);
const runId = prepare();
assert.equal(count(), 3);
const firstCalls = fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse).filter(item => item.req);
assert.deepEqual(firstCalls.map(item => [item.req.model, item.req.reasoning.effort]), [
  ['minimax/MiniMax-M3', 'low'], ['anthropic/claude-sonnet-5-5', 'high'], ['zai/glm-5.3', 'high']
]);
coordinate(runId, false);
assert.equal(run(['-Mode', 'Revise', '-RunId', runId]).status, 1);
assert.equal(count(), 3);
coordinate(runId);
const review = fs.readFileSync(path.join(live, 'frontend.md'), 'utf8');
fs.appendFileSync(path.join(live, 'frontend.md'), 'altered');
assert.equal(run(['-Mode', 'Revise', '-RunId', runId]).status, 1);
assert.equal(count(), 3);
fs.writeFileSync(path.join(live, 'frontend.md'), review);
const done = run(['-Mode', 'Revise', '-RunId', runId]);
assert.equal(done.status, 0, done.stdout + '\n' + done.stderr);
assert.equal(count(), 4);
assert.equal(fs.readFileSync(path.join(live, 'index.html'), 'utf8'), revised);
assert.equal(fs.readFileSync(backup, 'utf8'), originalBackup);
assert.equal(fs.readFileSync(path.join(live, 'unrelated.txt'), 'utf8'), 'KEEP UNRELATED');
assert.equal(run(['-Mode', 'Revise', '-RunId', runId]).status, 1);
assert.equal(count(), 4);
const next = prepare();
coordinate(next);
const failed = run(['-Mode', 'Revise', '-RunId', next], { RDP_FAIL_FINAL: '1' });
assert.equal(failed.status, 1, failed.stdout);
assert.match(failed.stderr, /Revised app did not pass Edge/);
assert.equal(fs.existsSync(path.join(live, 'index.html')), false);
assert.equal(fs.readFileSync(backup, 'utf8'), originalBackup);
const liveSnapshot = fs.readFileSync(path.join(live, 'review-ready.json'), 'utf8');
fs.writeFileSync(path.join(root, 'outputs/demo-runner/check.mjs'), "throw Error('Missing browser in preflight test');");
const before = count();
const aborted = run(['-Mode', 'Prepare']);
assert.equal(aborted.status, 1);
assert.match(aborted.stderr, /No model request was sent/);
assert.equal(count(), before);
assert.equal(fs.readFileSync(path.join(live, 'review-ready.json'), 'utf8'), liveSnapshot);
const stale = run(['-Mode', 'Revise', '-RunId', next]);
assert.equal(stale.status, 1);
assert.match(stale.stderr, /superseded this run/);
assert.equal(count(), before);
console.log('PASS: fresh build, exact draft reviews, GPT decisions, revision and Edge publication gate; backup preserved. Models mocked.');
console.log('Evidence retained in ' + root);
