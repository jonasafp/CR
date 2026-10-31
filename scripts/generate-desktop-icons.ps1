$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot =
  Split-Path -Parent $PSScriptRoot

$sourceLogo =
  Join-Path $projectRoot "public\brand\gestor-facil-logo.png"

$buildDirectory =
  Join-Path $projectRoot "build"

if (-not (Test-Path $sourceLogo)) {
  throw "A logo oficial não foi encontrada em public\brand\gestor-facil-logo.png."
}

New-Item `
  -ItemType Directory `
  -Path $buildDirectory `
  -Force |
  Out-Null

function New-IconFrame {
  param(
    [Parameter(Mandatory)]
    [System.Drawing.Image] $SourceImage,

    [Parameter(Mandatory)]
    [int] $Size
  )

  $bitmap =
    [System.Drawing.Bitmap]::new(
      $Size,
      $Size,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )

  $graphics =
    [System.Drawing.Graphics]::FromImage(
      $bitmap
    )

  try {
    $graphics.Clear(
      [System.Drawing.Color]::Transparent
    )

    $graphics.CompositingMode =
      [System.Drawing.Drawing2D.CompositingMode]::SourceCopy

    $graphics.CompositingQuality =
      [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.InterpolationMode =
      [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $graphics.PixelOffsetMode =
      [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.SmoothingMode =
      [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $graphics.DrawImage(
      $SourceImage,
      0,
      0,
      $Size,
      $Size
    )

    $stream =
      [System.IO.MemoryStream]::new()

    try {
      $bitmap.Save(
        $stream,
        [System.Drawing.Imaging.ImageFormat]::Png
      )

      return ,$stream.ToArray()
    } finally {
      $stream.Dispose()
    }
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Write-MultiSizeIcon {
  param(
    [Parameter(Mandatory)]
    [System.Drawing.Image] $SourceImage,

    [Parameter(Mandatory)]
    [string] $OutputPath
  )

  $sizes = @(
    16,
    24,
    32,
    48,
    64,
    128,
    256
  )

  $frames = @(
    foreach ($size in $sizes) {
      [PSCustomObject]@{
        Size = $size
        Bytes = New-IconFrame `
          -SourceImage $SourceImage `
          -Size $size
      }
    }
  )

  $stream =
    [System.IO.MemoryStream]::new()

  $writer =
    [System.IO.BinaryWriter]::new(
      $stream
    )

  try {
    $writer.Write([UInt16] 0)
    $writer.Write([UInt16] 1)
    $writer.Write([UInt16] $frames.Count)

    $dataOffset =
      6 + (16 * $frames.Count)

    foreach ($frame in $frames) {
      $dimension =
        if ($frame.Size -eq 256) {
          [Byte] 0
        } else {
          [Byte] $frame.Size
        }

      $writer.Write($dimension)
      $writer.Write($dimension)
      $writer.Write([Byte] 0)
      $writer.Write([Byte] 0)
      $writer.Write([UInt16] 1)
      $writer.Write([UInt16] 32)
      $writer.Write([UInt32] $frame.Bytes.Length)
      $writer.Write([UInt32] $dataOffset)

      $dataOffset +=
        $frame.Bytes.Length
    }

    foreach ($frame in $frames) {
      $writer.Write(
        $frame.Bytes
      )
    }

    [System.IO.File]::WriteAllBytes(
      $OutputPath,
      $stream.ToArray()
    )
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

function Write-PreviewPng {
  param(
    [Parameter(Mandatory)]
    [System.Drawing.Image] $SourceImage,

    [Parameter(Mandatory)]
    [string] $OutputPath
  )

  $bytes =
    New-IconFrame `
      -SourceImage $SourceImage `
      -Size 256

  [System.IO.File]::WriteAllBytes(
    $OutputPath,
    $bytes
  )
}

$logo =
  [System.Drawing.Image]::FromFile(
    $sourceLogo
  )

try {
  $clientPng =
    Join-Path $buildDirectory "icon-client.png"

  $controlPng =
    Join-Path $buildDirectory "icon-control.png"

  $clientIco =
    Join-Path $buildDirectory "icon-client.ico"

  $controlIco =
    Join-Path $buildDirectory "icon-control.ico"

  Write-PreviewPng `
    -SourceImage $logo `
    -OutputPath $clientPng

  Write-PreviewPng `
    -SourceImage $logo `
    -OutputPath $controlPng

  Write-MultiSizeIcon `
    -SourceImage $logo `
    -OutputPath $clientIco

  Write-MultiSizeIcon `
    -SourceImage $logo `
    -OutputPath $controlIco

  Write-Host "Ícones do Gestor Fácil gerados com sucesso em build\."
} finally {
  $logo.Dispose()
}
