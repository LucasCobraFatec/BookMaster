$ErrorActionPreference = 'Stop'

$projectPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$temporaryBuild = [IO.Path]::GetFullPath((Join-Path $temporaryRoot 'bookmaster-portable-build'))
$releasePath = [IO.Path]::GetFullPath((Join-Path $projectPath 'release'))
$portableZip = Join-Path $releasePath 'BookMaster-Portable-1.0.0-Windows.zip'

if (-not $temporaryBuild.StartsWith($temporaryRoot)) {
  throw 'O diretório temporário calculado é inválido.'
}
if (-not $releasePath.StartsWith($projectPath + [IO.Path]::DirectorySeparatorChar)) {
  throw 'O diretório de saída calculado está fora do projeto.'
}

if (Test-Path -LiteralPath $temporaryBuild) {
  Remove-Item -LiteralPath $temporaryBuild -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $releasePath | Out-Null
if (Test-Path -LiteralPath $portableZip) {
  Remove-Item -LiteralPath $portableZip -Force
}

Push-Location $projectPath
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'A build web falhou.' }
  npx electron-builder --win --dir "--config.directories.output=$temporaryBuild"
  if ($LASTEXITCODE -ne 0) { throw 'O empacotamento desktop falhou.' }
  Compress-Archive -Path (Join-Path $temporaryBuild 'win-unpacked\*') -DestinationPath $portableZip -CompressionLevel Optimal
  Write-Host "Pacote criado em $portableZip"
} finally {
  Pop-Location
}
