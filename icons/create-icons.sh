#!/bin/bash

# Script to generate PNG icons from SVG
# Requires ImageMagick or Inkscape

echo "Generating extension icons..."

if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert icon.svg -resize 16x16 icon16.png
    convert icon.svg -resize 48x48 icon48.png
    convert icon.svg -resize 128x128 icon128.png
    echo "Icons generated successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape..."
    inkscape icon.svg -w 16 -h 16 -o icon16.png
    inkscape icon.svg -w 48 -h 48 -o icon48.png
    inkscape icon.svg -w 128 -h 128 -o icon128.png
    echo "Icons generated successfully!"
else
    echo "Neither ImageMagick nor Inkscape found."
    echo "Please install one of them or use an online converter:"
    echo "  - https://convertio.co/svg-png/"
    echo "  - https://cloudconvert.com/svg-to-png"
    echo ""
    echo "Convert icon.svg to:"
    echo "  - icon16.png (16x16)"
    echo "  - icon48.png (48x48)"
    echo "  - icon128.png (128x128)"
    exit 1
fi
