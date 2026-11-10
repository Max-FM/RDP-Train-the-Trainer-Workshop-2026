param(
    [ValidateSet('Prepare', 'Revise', 'Preview', 'CheckBackup')]
    [string]$Mode = 'Prepare',
    [string]$NodeExecutable,
    [guid]$RunId
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$configFile = Join-Path $PSScriptRoot 'local-runtime.json'
$modules = $null
if (!$NodeExecutable -and (Test-Path -LiteralPath $configFile -PathType Leaf)) {
    $config = Get-Content -LiteralPath $configFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $NodeExecutable = $config.nodeExecutable
    $modules = $config.nodeModules
}
if (!$NodeExecutable -and $modules) {
    $NodeExecutable = Join-Path $modules '../bin/node.exe'
}
if (!$NodeExecutable -or !(Test-Path -LiteralPath $NodeExecutable -PathType Leaf)) {
    throw 'Bundled Node was not found. Pass -NodeExecutable with the Node executable from Codex workspace dependencies.'
}
$NodeExecutable = (Resolve-Path -LiteralPath $NodeExecutable).Path
if (!$modules) { $modules = Join-Path (Split-Path -Parent $NodeExecutable) '../node_modules' }
if (Test-Path -LiteralPath $modules -PathType Container) {
    $env:CODEX_PRIMARY_RUNTIME_NODE_MODULES = (Resolve-Path -LiteralPath $modules).Path
}

if ($Mode -eq 'Preview') {
    & $NodeExecutable (Join-Path $PSScriptRoot 'run.mjs') preview demo
    exit $LASTEXITCODE
}
if ($Mode -eq 'CheckBackup') {
    & $NodeExecutable (Join-Path $PSScriptRoot 'check.mjs') 'demo/backup/index.html'
    exit $LASTEXITCODE
}

# Catch an old runner before starting any model requests.
$preview = & $NodeExecutable (Join-Path $PSScriptRoot 'run.mjs') preview demo
if ($LASTEXITCODE) { throw 'Foreground route plan failed. Check the runner above. No model request was sent.' }
$plan = ($preview -join "`n") | ConvertFrom-Json
if ($plan.workflow -ne 'coordinated-feedback-v3') {
    throw 'The installed runner is out of date. No model request was sent.'
}

Push-Location -LiteralPath $root
try {
    $runner = Join-Path $PSScriptRoot 'run.mjs'
    if ($Mode -eq 'Revise') {
        if (!$RunId -or $RunId -eq [guid]::Empty) { throw 'Pass the run ID from review-ready.json.' }
        & $NodeExecutable $runner revise "--run-id=$RunId"
    } else {
        & $NodeExecutable $runner prepare
    }
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $exitCode
