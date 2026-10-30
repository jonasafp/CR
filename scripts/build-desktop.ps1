$ErrorActionPreference = "Stop"

$projectRoot =
  Split-Path -Parent $PSScriptRoot

$isccCandidates = @(
  "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
  "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
  "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
)

$iscc =
  $isccCandidates |
  Where-Object {
    $_ -and
    (Test-Path $_)
  } |
  Select-Object -First 1

if (-not $iscc) {
  throw "Inno Setup 6 não foi encontrado. Instale-o ou ajuste o caminho em scripts\build-desktop.ps1."
}

Push-Location $projectRoot

try {
  Write-Host "Validando o projeto..."
  npm run validate

  if ($LASTEXITCODE -ne 0) {
    throw "A validação do projeto falhou."
  }

  Write-Host "Gerando os dois aplicativos Electron..."
  npm run desktop:package

  if ($LASTEXITCODE -ne 0) {
    throw "O empacotamento Electron falhou."
  }

  Write-Host "Gerando o instalador Cliente..."
  & $iscc "installers\GestorFacilCliente.iss"

  if ($LASTEXITCODE -ne 0) {
    throw "A geração do instalador Cliente falhou."
  }

  Write-Host "Gerando o instalador Controle..."
  & $iscc "installers\GestorFacilControle.iss"

  if ($LASTEXITCODE -ne 0) {
    throw "A geração do instalador Controle falhou."
  }

  Write-Host ""
  Write-Host "Instaladores gerados com sucesso em:"
  Write-Host "release\installers"
} finally {
  Pop-Location
}
