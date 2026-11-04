param(
    [ValidateSet("client", "control")]
    [string]$Variant = "client"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot
$previousVariant = $env:VITE_APP_VARIANT

Push-Location $projectRoot

try {
    $env:VITE_APP_VARIANT = $Variant
    npm run build

    if ($LASTEXITCODE -ne 0) {
        throw "O build web da variante $Variant falhou."
    }

    npx cap sync android

    if ($LASTEXITCODE -ne 0) {
        throw "A sincronização Android da variante $Variant falhou."
    }
}
finally {
    $env:VITE_APP_VARIANT = $previousVariant
    Pop-Location
}
