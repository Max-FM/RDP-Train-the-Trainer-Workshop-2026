# Testing

`tests/mock-demo.test.mjs` runs the full demo offline with fake model responses and the real bundled Edge. It copies the runner into a temporary folder, so it never touches this repository's `demo/` folder. It makes no network requests.

Run it with the Node.js bundled with Codex:

```powershell
& "<Codex bundled node.exe>" tests/mock-demo.test.mjs
```

It prints `PASS` and the temporary folder it used. A run takes about 30 to 60 seconds, mostly in Edge.

## What it checks

- Preview sends nothing.
- Prepare clears only generated files, keeps the backup and unrelated files, and sends the same fresh draft to both reviewers, and sends only Z.ai the two PNG renderings (recorded by hash in its trace, with no image data).
- Requests use the expected models, reasoning effort, and output caps.
- Revise rejects a plan without a browser decision, tampered review evidence, and a second revise on the same run.
- Skipped findings are never sent to MiniMax.
- A bad JSON reply and a failed final check each get exactly one repair, and a failed repair keeps the app unpublished.
- A missing browser stops Prepare before any model request, and an older run can't be revised afterward.

The test uses fake providers, so passing it doesn't prove the live routes work. Before a session, do a full live rehearsal with OpenCodex running.
