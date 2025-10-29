# Testing Instructions for Pokemon Card Price Checker

## Changes Made

### Fixed Issues:
1. ✅ **Generated missing icon files** - Created icon16.png, icon48.png, and icon128.png from SVG
2. ✅ **Fixed Manifest V3 service worker compatibility** - Removed DOM/canvas access from background.js
3. ✅ **Improved error handling** - Added better API error handling and fallback mechanisms
4. ✅ **Enhanced card search** - Improved API queries to prioritize cards with pricing data
5. ✅ **All syntax validation passed** - All JS files and manifest.json are valid

## How to Test the Extension

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `/home/user/chrome-ext` folder
5. The extension should load without errors

### 2. Basic Functionality Tests

#### Test 1: Upload Image
1. Click the extension icon in the toolbar
2. Click the upload area or drag-and-drop an image
3. Any Pokemon card image should work (or any image for demo)
4. Click "Analyze Card"
5. **Expected**: Shows a random Pokemon card with pricing and trend data

#### Test 2: Capture from Page
1. Navigate to any webpage with images (e.g., pokemon.com, tcgplayer.com)
2. Click the extension icon
3. Click "Capture from Page"
4. **Expected**: Page dims, images are highlighted with blue borders
5. Click on any image
6. **Expected**: Image is captured and ready to analyze
7. Click "Analyze Card"
8. **Expected**: Shows a random Pokemon card with pricing and trend data

#### Test 3: Results Display
1. After analyzing a card, verify:
   - Card name is displayed
   - Set information shown
   - Card number and rarity displayed
   - Current price shows a dollar amount
   - 3-month trend chart is rendered
   - Trend percentage shows (positive/negative/neutral with colors)
   - TCGPlayer and Cardmarket links are clickable
2. Click "Scan Another Card"
3. **Expected**: Returns to upload screen

#### Test 4: Error Handling
1. Try capturing from a page with no images
2. **Expected**: Shows appropriate error message
3. Click "Try Again"
4. **Expected**: Returns to upload screen

### 3. Console Checks

Open Chrome DevTools (F12) while testing:

1. **Background Service Worker Console**:
   - Go to chrome://extensions/
   - Find the extension
   - Click "service worker" link
   - Check for errors (should see "Searching for Pokemon cards..." logs)

2. **Popup Console**:
   - Right-click the extension popup
   - Select "Inspect"
   - Check Console tab for errors

3. **Content Script Console**:
   - Open DevTools on any webpage (F12)
   - Check Console tab when using "Capture from Page"

## Known Limitations (As Designed)

1. **No Real Card Recognition**: The extension doesn't actually recognize cards from images. It returns random cards from the Pokemon TCG API. This is documented in README.md as a future enhancement requiring OCR integration.

2. **Demo Pricing Data**: For cards without pricing data, the extension generates simulated trend data for demonstration purposes.

3. **API Rate Limits**: The Pokemon TCG API has rate limits (1000 requests/hour). Extensive testing may hit these limits.

## Success Criteria

✅ Extension loads without errors in chrome://extensions/
✅ No console errors in service worker
✅ Upload functionality works
✅ Capture from page functionality works
✅ Results display correctly with chart
✅ Links to TCGPlayer and Cardmarket work
✅ Error messages display appropriately
✅ "Scan Another Card" / "Try Again" buttons reset the interface

## Troubleshooting

### Extension won't load
- Check chrome://extensions/ for error messages
- Verify all icon files exist in the icons/ folder
- Check that manifest.json is valid JSON

### Service worker errors
- Click "service worker" link in chrome://extensions/
- Look for specific error messages
- Check that background.js doesn't reference DOM objects

### Images not capturing
- Refresh the page and try again
- Some sites block image capture due to CORS
- Try uploading the image instead

### API errors
- Check internet connection
- Pokemon TCG API might be temporarily down
- Extension will fall back to mock data if API fails

## Next Steps for Full Functionality

To make the extension actually recognize cards (beyond this demo):

1. **Integrate OCR Service**:
   - Option A: Google Cloud Vision API
   - Option B: AWS Rekognition
   - Option C: Tesseract.js in an offscreen document
   - Option D: Azure Computer Vision

2. **Update background.js** to send images to OCR service
3. **Parse OCR results** to extract card name, set, and number
4. **Search Pokemon TCG API** with extracted information
5. **Match results** and display actual card data

## Files Modified

- `/home/user/chrome-ext/icons/icon16.png` - Created
- `/home/user/chrome-ext/icons/icon48.png` - Created
- `/home/user/chrome-ext/icons/icon128.png` - Created
- `/home/user/chrome-ext/background.js` - Fixed service worker issues
