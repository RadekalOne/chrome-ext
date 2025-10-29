# Testing Instructions for Pokemon Card Price Checker

## Changes Made

### Fixed Issues:
1. ✅ **Generated missing icon files** - Created icon16.png, icon48.png, and icon128.png from SVG
2. ✅ **Fixed Manifest V3 service worker compatibility** - Removed DOM/canvas access from background.js
3. ✅ **Improved error handling** - Added better API error handling and fallback mechanisms
4. ✅ **Enhanced card search** - Improved API queries to prioritize cards with pricing data
5. ✅ **All syntax validation passed** - All JS files and manifest.json are valid

### NEW - OCR Integration:
6. ✅ **Real OCR functionality** - Integrated OCR.space API for actual card text recognition
7. ✅ **Pokemon TCG API key** - Added API key for better rate limits (10,000 requests/day)
8. ✅ **Intelligent card matching** - Fuzzy search algorithm to find best card matches
9. ✅ **eBay pricing fallback** - Added eBay average price API for cards without TCGPlayer data
10. ✅ **Card parsing** - Extracts card name, HP, type, and set number from images

## How to Test the Extension

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `/home/user/chrome-ext` folder
5. The extension should load without errors

### 2. Basic Functionality Tests

#### Test 1: Upload Image (With OCR)
1. Click the extension icon in the toolbar
2. Click the upload area or drag-and-drop a Pokemon card image
3. Use a clear image of a Pokemon card with visible text
4. Click "Analyze Card"
5. **Expected**:
   - OCR extracts text from the card
   - Extension searches for the actual card by name
   - Shows the identified card with real pricing and trend data
   - Console logs show: "Performing OCR on card image..." and "Extracted card name from OCR: [card name]"

#### Test 2: Capture from Page (With OCR)
1. Navigate to any webpage with Pokemon card images (e.g., pokemon.com, tcgplayer.com, serebii.net)
2. Click the extension icon
3. Click "Capture from Page"
4. **Expected**: Popup closes (this is normal behavior)
5. **Expected**: Page dims, images are highlighted with blue borders
6. Click on a Pokemon card image
7. **Expected**: Overlay disappears after clicking image
8. **Click the extension icon again** to reopen the popup
9. **Expected**: The captured image automatically appears in preview
10. Click "Analyze Card"
11. **Expected**:
   - OCR analyzes the captured card image
   - Extension identifies the specific card
   - Shows the actual card with real pricing data

**Note**: The popup must close to allow interaction with the page. This is Chrome's default behavior. Simply reopen the popup after capturing to continue.

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
   - **Expected logs**:
     ```
     Performing OCR on card image...
     OCR extracted text: [raw text]
     OCR completed. Extracted card info: {name: "Pikachu", hp: 60, ...}
     Extracted card name from OCR: Pikachu
     Searching for: name:"Pikachu"
     Found matching card with pricing: Pikachu
     ```
   - Check for errors (should see successful OCR and search logs)

2. **Popup Console**:
   - Right-click the extension popup
   - Select "Inspect"
   - Check Console tab for errors

3. **Content Script Console**:
   - Open DevTools on any webpage (F12)
   - Check Console tab when using "Capture from Page"

### 4. OCR-Specific Tests

#### Test OCR Accuracy:
1. Upload a high-quality Pokemon card image with clear text
2. Check service worker console for extracted text
3. Verify the card name was correctly identified
4. **Good test cards**: Base Set Charizard, Pikachu, Mewtwo (clear, well-lit images)

#### Test Fuzzy Matching:
1. Upload a card image with partial text visibility
2. OCR may extract incomplete card name
3. Extension should still find a close match
4. Check console for "Found fuzzy match:" logs

#### Test Fallback Behavior:
1. Upload a non-card image or very blurry card
2. OCR may fail or extract unrecognizable text
3. **Expected**: Extension falls back to showing a popular card
4. Check console for "No card name extracted, showing recent popular cards..."

## Known Limitations

1. **OCR Accuracy**: OCR accuracy depends on image quality. Cards with:
   - Poor lighting or glare
   - Unusual fonts or holographic effects
   - Rotated or skewed orientation
   - Low resolution
   May not be recognized accurately

2. **Simulated Trend Data**: Historical price trends are generated based on current prices, not actual historical data

3. **API Rate Limits**:
   - OCR.space: Free tier has rate limits
   - Pokemon TCG API: 10,000 requests/day with API key
   - eBay API: Rate limits vary by RapidAPI subscription

4. **eBay Pricing**: eBay average pricing may not be available for all cards or may require specific RapidAPI subscription settings

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

## API Keys Configured

This extension now uses the following APIs:

1. **OCR.space API**
   - Key configured in ocr.js
   - Used for text extraction from card images
   - Free tier: 25,000 requests/month

2. **Pokemon TCG API**
   - Key configured in background.js
   - Rate limit: 10,000 requests/day
   - Provides card data and TCGPlayer pricing

3. **RapidAPI - eBay Average Pricing**
   - Key configured in background.js
   - Fallback for cards without TCGPlayer pricing
   - Rate limits vary by subscription

## Future Enhancements

1. **Improve OCR accuracy** with pre-processing (image enhancement, rotation correction)
2. **Add card condition assessment** to adjust pricing
3. **Implement caching** to reduce API calls
4. **Add historical price data** from actual market sources
5. **Support multiple languages** for international cards
6. **Add barcode/QR code scanning** for faster identification

## Files Modified

- `/home/user/chrome-ext/icons/icon16.png` - Created
- `/home/user/chrome-ext/icons/icon48.png` - Created
- `/home/user/chrome-ext/icons/icon128.png` - Created
- `/home/user/chrome-ext/ocr.js` - Created (NEW - OCR integration)
- `/home/user/chrome-ext/background.js` - Fixed service worker issues + added OCR + API keys
- `/home/user/chrome-ext/manifest.json` - Added API host permissions
