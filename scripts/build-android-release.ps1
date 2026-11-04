$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot
$androidRoot = Join-Path $projectRoot "android"
$propertiesPath = Join-Path $androidRoot "keystore.properties"
$keystorePath = Join-Path $androidRoot "keystore\gestor-facil-upload.jks"
$versionPath = Join-Path $androidRoot "version.properties"
$outputDirectory = Join-Path $projectRoot "release\mobile\android"

if (!(Test-Path $propertiesPath)) {
    throw "Assinatura não configurada. Execute npm run mobile:release:setup."
}

if (!(Test-Path $keystorePath)) {
    throw "Chave Android não encontrada em $keystorePath."
}

$versionData = Get-Content $versionPath | ConvertFrom-StringData
$versionName = $versionData.VERSION_NAME

Push-Location $projectRoot

try {
    npm run mobile:sync:android

    if ($LASTEXITCODE -ne 0) {
        throw "A sincronização do Capacitor falhou."
    }

    Push-Location $androidRoot

    try {
        & ".\gradlew.bat" clean assembleRelease bundleRelease

        if ($LASTEXITCODE -ne 0) {
            throw "A compilação Android release falhou."
        }
    }
    finally {
        Pop-Location
    }

    New-Item `
        -ItemType Directory `
        -Path $outputDirectory `
        -Force | Out-Null

    $apkSource = Join-Path $androidRoot "app\build\outputs\apk\release\app-release.apk"
    $aabSource = Join-Path $androidRoot "app\build\outputs\bundle\release\app-release.aab"
    $apkTarget = Join-Path $outputDirectory "GestorFacil-$versionName-release.apk"
    $aabTarget = Join-Path $outputDirectory "GestorFacil-$versionName-release.aab"

    Copy-Item $apkSource $apkTarget -Force
    Copy-Item $aabSource $aabTarget -Force

    $checksums = @(
        "SHA256  $([IO.Path]::GetFileName($apkTarget))  $((Get-FileHash $apkTarget -Algorithm SHA256).Hash)"
        "SHA256  $([IO.Path]::GetFileName($aabTarget))  $((Get-FileHash $aabTarget -Algorithm SHA256).Hash)"
    )

    $checksums | Set-Content `
        -Path (Join-Path $outputDirectory "SHA256SUMS.txt") `
        -Encoding ASCII

    Write-Host ""
    Write-Host "Release Android gerada com sucesso:" -ForegroundColor Green
    Write-Host $apkTarget
    Write-Host $aabTarget
}
finally {
    Pop-Location
}
