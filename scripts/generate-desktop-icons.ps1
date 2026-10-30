$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot =
  Split-Path -Parent $PSScriptRoot

$buildDirectory =
  Join-Path $projectRoot "build"

New-Item -ItemType Directory -Path $buildDirectory -Force |
  Out-Null

function New-DesktopIcon {
  param(
    [Parameter(Mandatory)]
    [string] $Text,

    [Parameter(Mandatory)]
    [string] $Background,

    [Parameter(Mandatory)]
    [string] $OutputPath
  )

  $bitmap =
    [System.Drawing.Bitmap]::new(256, 256)

  $graphics =
    [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.SmoothingMode =
      [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $graphics.Clear(
      [System.Drawing.Color]::Transparent
    )

    $backgroundBrush =
      [System.Drawing.SolidBrush]::new(
        [System.Drawing.ColorTranslator]::FromHtml($Background)
      )

    $font =
      [System.Drawing.Font]::new(
        "Segoe UI",
        82,
        [System.Drawing.FontStyle]::Bold,
        [System.Drawing.GraphicsUnit]::Pixel
      )

    $textBrush =
      [System.Drawing.SolidBrush]::new(
        [System.Drawing.Color]::White
      )

    try {
      $graphics.FillEllipse(
        $backgroundBrush,
        8,
        8,
        240,
        240
      )

      $format =
        [System.Drawing.StringFormat]::new()

      try {
        $format.Alignment =
          [System.Drawing.StringAlignment]::Center

        $format.LineAlignment =
          [System.Drawing.StringAlignment]::Center

        $rectangle =
          [System.Drawing.RectangleF]::new(0, 0, 256, 250)

        $graphics.DrawString(
          $Text,
          $font,
          $textBrush,
          $rectangle,
          $format
        )
      } finally {
        $format.Dispose()
      }

      $bitmap.Save(
        $OutputPath,
        [System.Drawing.Imaging.ImageFormat]::Png
      )

      $pngBytes =
        [System.IO.File]::ReadAllBytes(
          $OutputPath
        )

      $iconPath =
        [System.IO.Path]::ChangeExtension(
          $OutputPath,
          ".ico"
        )

      $iconStream =
        [System.IO.MemoryStream]::new()

      $iconWriter =
        [System.IO.BinaryWriter]::new(
          $iconStream
        )

      try {
        $iconWriter.Write(
          [UInt16] 0
        )

        $iconWriter.Write(
          [UInt16] 1
        )

        $iconWriter.Write(
          [UInt16] 1
        )

        $iconWriter.Write(
          [Byte] 0
        )

        $iconWriter.Write(
          [Byte] 0
        )

        $iconWriter.Write(
          [Byte] 0
        )

        $iconWriter.Write(
          [Byte] 0
        )

        $iconWriter.Write(
          [UInt16] 1
        )

        $iconWriter.Write(
          [UInt16] 32
        )

        $iconWriter.Write(
          [UInt32] $pngBytes.Length
        )

        $iconWriter.Write(
          [UInt32] 22
        )

        $iconWriter.Write(
          $pngBytes
        )

        [System.IO.File]::WriteAllBytes(
          $iconPath,
          $iconStream.ToArray()
        )
      } finally {
        $iconWriter.Dispose()
        $iconStream.Dispose()
      }
    } finally {
      $backgroundBrush.Dispose()
      $font.Dispose()
      $textBrush.Dispose()
    }
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$clientIconParameters = @{
  Text = "GF"
  Background = "#1F6A43"
  OutputPath = Join-Path $buildDirectory "icon-client.png"
}

$controlIconParameters = @{
  Text = "JC"
  Background = "#183B73"
  OutputPath = Join-Path $buildDirectory "icon-control.png"
}

New-DesktopIcon @clientIconParameters
New-DesktopIcon @controlIconParameters
