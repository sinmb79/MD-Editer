param(
  [Parameter(Position = 0)]
  [ValidateSet('build', 'dev')]
  [string]$Mode = 'build',

  [switch]$SkipPandocSync
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$vsDevShell = 'C:\Program Files\Microsoft Visual Studio\18\Community\Common7\Tools\Launch-VsDevShell.ps1'
$tauriCli = Join-Path $repoRoot 'node_modules\.bin\tauri.cmd'
$pandocSyncScript = Join-Path $PSScriptRoot 'Sync-PandocSidecar.ps1'

if (-not (Test-Path $vsDevShell)) {
  throw "Visual Studio Developer Shell was not found at '$vsDevShell'."
}

if (-not (Test-Path $tauriCli)) {
  throw "Local Tauri CLI was not found at '$tauriCli'. Run 'npm install' first."
}

& $vsDevShell -Arch amd64 -HostArch amd64 > $null
Set-Location $repoRoot
$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
  throw "Cargo is not available on PATH after loading the developer shell."
}

if (-not $SkipPandocSync) {
  & $pandocSyncScript
}

Write-Host "Running Tauri $Mode from '$repoRoot'..."
& $tauriCli $Mode

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
