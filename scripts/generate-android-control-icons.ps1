$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot
$resourceRoot = Join-Path $projectRoot "android\app\src\main\res"

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Gestor Controle</string>
    <string name="title_activity_main">Gestor Controle</string>
    <string name="package_name">com.jiah.gestorfacil.controle</string>
    <string name="custom_url_scheme">com.jiah.gestorfacil.controle</string>
</resources>
"@

[IO.File]::WriteAllText(
    (Join-Path $resourceRoot "values\strings.xml"),
    $stringsXml,
    $utf8WithoutBom
)

Write-Host "Nome Android do Controle configurado; ícone oficial preservado." -ForegroundColor Green
