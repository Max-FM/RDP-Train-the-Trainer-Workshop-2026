param(
    [ValidateSet('Start', 'Preview', 'CheckBackup')]
    [string]$Mode = 'Start',
    [string]$NodeExecutable
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
    & $NodeExecutable (Join-Path $PSScriptRoot 'run.mjs') preview background
    exit $LASTEXITCODE
}
if ($Mode -eq 'CheckBackup') {
    & $NodeExecutable (Join-Path $PSScriptRoot 'check.mjs') 'outputs/backup/index.html'
    exit $LASTEXITCODE
}

# Preflight the shipped batch locally so an old runner is caught before spawning.
$preview = & $NodeExecutable (Join-Path $PSScriptRoot 'run.mjs') preview background
if ($LASTEXITCODE) { throw 'Background preview failed. Check the runner above. No model request was sent.' }
$plan = ($preview -join "`n") | ConvertFrom-Json
if (!$plan.batchSha256 -or $plan.requests.Count -ne 3) {
    throw 'The installed runner is not the current demo runner. No model request was sent.'
}

$runId = [guid]::NewGuid().ToString()
$logDir = $root
foreach ($part in @('outputs', 'live-demo', 'launch-logs')) {
    $logDir = Join-Path $logDir $part
    if (!(Test-Path -LiteralPath $logDir)) { $null = New-Item -ItemType Directory -Path $logDir }
    $entry = Get-Item -LiteralPath $logDir -Force
    if (!$entry.PSIsContainer -or ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw 'Refusing to write launcher logs through a linked or invalid directory.'
    }
}
$stdout = Join-Path $logDir "$runId.stdout.log"
$stderr = Join-Path $logDir "$runId.stderr.log"
$process = Start-Process -FilePath $NodeExecutable -ArgumentList @('outputs/demo-runner/run.mjs', 'demo', "--run-id=$runId") `
    -WorkingDirectory $root -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden -PassThru
[pscustomobject]@{ processId = $process.Id; runId = $runId; stdout = $stdout; stderr = $stderr } | ConvertTo-Json -Compress
