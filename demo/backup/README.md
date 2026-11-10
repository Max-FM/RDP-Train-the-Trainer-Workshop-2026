# Backup calculator

Use this page if the live demo is slow or fails, and introduce it as "the calculator from an earlier run."

| File | What it is |
|---|---|
| `index.html` | A finished calculator with a visible "BACKUP" banner. It works offline and makes no network requests. |
| `widget-desktop.png`, `widget-mobile.png` | Screenshots at 1280px and 390px wide. |

## How it was made

During preparation on 2026-11-10, MiniMax M3 built the calculator through OpenCodeX. Claude Sonnet 5.5 reviewed its logic and Z.ai GLM 5.3 reviewed its interface, both from the source code. The coordinator in Codex then applied their findings: CAD currency formatting, a clear overflow message, higher-contrast greys, standard font weights, and totals that update as you type with no Calculate button.

That run used an earlier, more manual version of the workflow than [the current runner](../../docs/demo-runner.md), so its steps differ from what the live demo shows. The app itself meets the same requirements. Apart from the banner, it is identical to [the reference copy](../reference/index.html) that the runner and tests use.

## Check and open it

The backup passes the same offline Edge check as the live demo:

```powershell
powershell.exe -NoProfile -NonInteractive -File demo/runner/demo.ps1 -Mode CheckBackup
```

To open it from the repository root:

```powershell
Start-Process (Resolve-Path ./demo/backup/index.html)
```
