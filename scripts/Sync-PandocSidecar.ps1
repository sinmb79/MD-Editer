param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $repoRoot 'src-tauri\binaries\pandoc-x86_64-pc-windows-msvc.exe'
$candidatePaths = @(
  (Join-Path $env:LOCALAPPDATA 'Pandoc\pandoc.exe')
)

$pandocCommand = Get-Command pandoc -ErrorAction SilentlyContinue
if ($pandocCommand) {
  $candidatePaths += $pandocCommand.Source
}

$source = $candidatePaths | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $source) {
  throw "Pandoc was not found. Install it first or place the sidecar manually at '$destination'."
}

Copy-Item -LiteralPath $source -Destination $destination -Force

Write-Host "Synced Pandoc sidecar from '$source' to '$destination'."
