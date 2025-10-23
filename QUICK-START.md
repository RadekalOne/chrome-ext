# Quick Start - Fix Icon Error

## ❌ Error: "Could not load icon 'icons/icon16.png'"

You need to generate the icon files first. Here are **3 easy solutions**:

---

## ✅ SOLUTION 1: HTML File (EASIEST - 30 seconds)

1. **Open** `quick-icon-fix.html` in your browser (double-click it)
2. **Click** the "Generate and Download Icons" button
3. **Wait** for 3 files to download: `icon16.png`, `icon48.png`, `icon128.png`
4. **Move** these 3 files into the `icons/` folder
5. **Reload** the extension in Chrome

**That's it!** Your extension should now load.

---

## ✅ SOLUTION 2: PowerShell (Windows)

1. Open PowerShell in the extension folder
2. Run: `.\create-icons.ps1`
3. Reload the extension in Chrome

---

## ✅ SOLUTION 3: Python (If you have Python)

1. Run: `pip install Pillow`
2. Run: `cd icons && python create-icons.py`
3. Reload the extension in Chrome

---

## 📋 How to Reload Extension

After creating the icons:

1. Go to `chrome://extensions/`
2. Find "Pokemon Card Price Checker"
3. Click the refresh/reload icon 🔄
4. The error should be gone!

---

## 🆘 Still Having Issues?

If the HTML method doesn't work, you can:

1. Create any 3 square PNG images (any color)
2. Resize them to 16x16, 48x48, and 128x128 pixels
3. Name them `icon16.png`, `icon48.png`, `icon128.png`
4. Put them in the `icons/` folder

The extension will work with any placeholder icons!

---

## ✨ Alternative: Use Online Tool

1. Go to https://www.favicon-generator.org/
2. Upload any Pokemon-related image
3. Download the generated icons
4. Rename and place in `icons/` folder
