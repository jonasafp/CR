$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot
$androidRoot = Join-Path $projectRoot "android"
$keystoreDirectory = Join-Path $androidRoot "keystore"
$keystorePath = Join-Path $keystoreDirectory "gestor-facil-upload.jks"
$propertiesPath = Join-Path $androidRoot "keystore.properties"
$keyAlias = "gestor-facil-upload"

if (Test-Path $keystorePath) {
    throw "A chave já existe em $keystorePath. Ela não será sobrescrita."
}

if (Test-Path $propertiesPath) {
    throw "O arquivo $propertiesPath já existe. Revise-o antes de continuar."
}

$keytoolPath = if (
    $env:JAVA_HOME -and
    (Test-Path (Join-Path $env:JAVA_HOME "bin\keytool.exe"))
) {
    Join-Path $env:JAVA_HOME "bin\keytool.exe"
}
else {
    (Get-Command "keytool.exe" -ErrorAction Stop).Source
}

Write-Host "" 
Write-Host "Configuração da assinatura Android" -ForegroundColor Cyan
Write-Host "A senha não será enviada ao Git e não será exibida no terminal."
Write-Host "Use ao menos 12 caracteres e guarde-a em um gerenciador de senhas."
Write-Host ""

$securePassword = Read-Host "Senha da chave de upload" -AsSecureString
$secureConfirmation = Read-Host "Confirme a senha" -AsSecureString

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
    $securePassword
)
$confirmationPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
    $secureConfirmation
)

try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        $passwordPointer
    )
    $plainConfirmation = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        $confirmationPointer
    )

    if ($plainPassword -ne $plainConfirmation) {
        throw "As senhas informadas são diferentes."
    }

    if ($plainPassword.Length -lt 12) {
        throw "A senha precisa ter pelo menos 12 caracteres."
    }

    if ($plainPassword -match "[\\\r\n]") {
        throw "A senha não pode conter barra invertida ou quebra de linha."
    }

    New-Item `
        -ItemType Directory `
        -Path $keystoreDirectory `
        -Force | Out-Null

    & $keytoolPath `
        -genkeypair `
        -v `
        -storetype PKCS12 `
        -keystore $keystorePath `
        -alias $keyAlias `
        -keyalg RSA `
        -keysize 4096 `
        -validity 10000 `
        -storepass $plainPassword `
        -keypass $plainPassword `
        -dname "CN=Jiah, OU=Gestor Facil, O=Jiah, C=BR"

    if ($LASTEXITCODE -ne 0) {
        throw "O keytool não conseguiu gerar a chave Android."
    }

    $properties = @(
        "storeFile=keystore/gestor-facil-upload.jks"
        "storePassword=$plainPassword"
        "keyAlias=$keyAlias"
        "keyPassword=$plainPassword"
    )

    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

    [IO.File]::WriteAllLines(
        $propertiesPath,
        $properties,
        $utf8WithoutBom
    )

    Write-Host ""
    Write-Host "Chave criada com sucesso:" -ForegroundColor Green
    Write-Host $keystorePath
    Write-Host ""
    Write-Host "Faça uma cópia segura do arquivo .jks e da senha." -ForegroundColor Yellow
    Write-Host "Nunca envie esses arquivos ao GitHub."
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }

    if ($confirmationPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmationPointer)
    }

    $plainPassword = $null
    $plainConfirmation = $null
}
