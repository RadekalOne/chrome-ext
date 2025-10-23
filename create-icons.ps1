# PowerShell script to create simple extension icons
# Run this in PowerShell: .\create-icons.ps1

Add-Type -AssemblyName System.Drawing

function Create-Icon($size, $filename) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Create gradient background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(102, 126, 234)
    $color2 = [System.Drawing.Color]::FromArgb(118, 75, 162)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
    $graphics.FillRectangle($brush, $rect)

    # Draw pokeball
    $centerX = $size / 2
    $centerY = $size / 2
    $radius = $size / 3

    # Top half (white)
    $whiteBrush = [System.Drawing.Brushes]::White
    $graphics.FillPie($whiteBrush, $centerX - $radius, $centerY - $radius, $radius * 2, $radius * 2, 180, 180)

    # Bottom half (red)
    $redBrush = [System.Drawing.Brushes]::Red
    $graphics.FillPie($redBrush, $centerX - $radius, $centerY - $radius, $radius * 2, $radius * 2, 0, 180)

    # Center line
    $blackBrush = [System.Drawing.Brushes]::Black
    $lineHeight = [Math]::Max(1, $size / 20)
    $graphics.FillRectangle($blackBrush, $centerX - $radius, $centerY - $lineHeight/2, $radius * 2, $lineHeight)

    # Center circle
    $innerRadius = $size / 8
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, [Math]::Max(1, $size / 40))
    $graphics.FillEllipse($whiteBrush, $centerX - $innerRadius, $centerY - $innerRadius, $innerRadius * 2, $innerRadius * 2)
    $graphics.DrawEllipse($pen, $centerX - $innerRadius, $centerY - $innerRadius, $innerRadius * 2, $innerRadius * 2)

    # Save
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()

    Write-Host "Created $filename" -ForegroundColor Green
}

# Create icons directory if it doesn't exist
$iconsDir = "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

# Generate icons
Write-Host "Generating extension icons..." -ForegroundColor Cyan
Create-Icon 16 "$iconsDir\icon16.png"
Create-Icon 48 "$iconsDir\icon48.png"
Create-Icon 128 "$iconsDir\icon128.png"

Write-Host "`nAll icons created successfully!" -ForegroundColor Green
Write-Host "You can now load the extension in Chrome." -ForegroundColor Yellow
