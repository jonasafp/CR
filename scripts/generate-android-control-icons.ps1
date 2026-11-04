$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path $PSScriptRoot
$resourceRoot = Join-Path $projectRoot "android\app\src\main\res"
$densities = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

function Write-ControlIcon {
    param(
        [string]$Path,
        [int]$Size,
        [bool]$Round,
        [bool]$Foreground
    )

    $bitmap = New-Object Drawing.Bitmap $Size, $Size
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    try {
        $graphics.Clear([Drawing.Color]::Transparent)
        $padding = if ($Foreground) { [int]($Size * 0.18) } else { 0 }
        $rect = New-Object Drawing.Rectangle $padding, $padding, ($Size - 2 * $padding), ($Size - 2 * $padding)
        $brush = New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml("#173A86"))

        if ($Round) {
            $graphics.FillEllipse($brush, $rect)
        }
        else {
            $radius = [single]($Size * 0.20)
            $pathShape = New-Object Drawing.Drawing2D.GraphicsPath
            $diameter = 2 * $radius
            $pathShape.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
            $pathShape.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
            $pathShape.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
            $pathShape.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
            $pathShape.CloseFigure()
            $graphics.FillPath($brush, $pathShape)
            $pathShape.Dispose()
        }

        $fontSize = [single]($Size * $(if ($Foreground) { 0.25 } else { 0.34 }))
        $font = New-Object Drawing.Font "Segoe UI", $fontSize, ([Drawing.FontStyle]::Bold), ([Drawing.GraphicsUnit]::Pixel)
        $textBrush = New-Object Drawing.SolidBrush ([Drawing.Color]::White)
        $format = New-Object Drawing.StringFormat
        $format.Alignment = [Drawing.StringAlignment]::Center
        $format.LineAlignment = [Drawing.StringAlignment]::Center
        $textRect = [Drawing.RectangleF]::new(
            [single]$rect.X,
            [single]$rect.Y,
            [single]$rect.Width,
            [single]$rect.Height
        )
        $graphics.DrawString("JC", $font, $textBrush, $textRect, $format)

        $bitmap.Save($Path, [Drawing.Imaging.ImageFormat]::Png)
        $format.Dispose()
        $textBrush.Dispose()
        $font.Dispose()
        $brush.Dispose()
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

foreach ($entry in $densities.GetEnumerator()) {
    $directory = Join-Path $resourceRoot $entry.Key
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    $size = [int]$entry.Value

    Write-ControlIcon (Join-Path $directory "ic_launcher.png") $size $false $false
    Write-ControlIcon (Join-Path $directory "ic_launcher_round.png") $size $true $false
    Write-ControlIcon (Join-Path $directory "ic_launcher_foreground.png") $size $false $true
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$backgroundXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#173A86</color>
</resources>
"@
$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Gestor Fácil Controle</string>
    <string name="title_activity_main">Gestor Fácil Controle</string>
    <string name="package_name">com.jiah.gestorfacil.controle</string>
    <string name="custom_url_scheme">com.jiah.gestorfacil.controle</string>
</resources>
"@

[IO.File]::WriteAllText(
    (Join-Path $resourceRoot "values\ic_launcher_background.xml"),
    $backgroundXml,
    $utf8WithoutBom
)
[IO.File]::WriteAllText(
    (Join-Path $resourceRoot "values\strings.xml"),
    $stringsXml,
    $utf8WithoutBom
)

Write-Host "Ícones Android do Controle gerados com sucesso." -ForegroundColor Green
