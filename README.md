# Pokemon Card Price Checker - Chrome Extension

A Chrome extension that recognizes Pokemon card images and displays their current market prices with 3-month price trends.

## Features

- **Image Upload**: Upload Pokemon card images directly from your computer
- **Page Capture**: Capture and analyze Pokemon card images from any webpage
- **Card Recognition**: Automatically identifies Pokemon cards from images
- **Real-time Pricing**: Shows current market prices from trusted sources
- **Price Trends**: Displays 3-month price trend charts with percentage changes
- **Market Links**: Direct links to TCGPlayer and Cardmarket for purchasing
- **Beautiful UI**: Modern, gradient-themed interface with smooth animations

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd chrome-ext
   ```

2. **Generate Extension Icons** (Choose one method):

   - **Option A: Using Web Browser** (Recommended)
     - Open `icons/generate-icons.html` in your web browser
     - Icons will download automatically
     - Move the downloaded icons to the `icons/` folder

   - **Option B: Using Python**
     ```bash
     pip install Pillow
     cd icons
     python3 create-icons.py
     ```

   - **Option C: Using ImageMagick or Inkscape**
     ```bash
     cd icons
     ./create-icons.sh
     ```

   - **Option D: Manual Creation**
     - Convert `icons/icon.svg` to PNG using an online tool:
       - https://convertio.co/svg-png/
       - https://cloudconvert.com/svg-to-png
     - Create three sizes: 16x16, 48x48, and 128x128 pixels
     - Name them: `icon16.png`, `icon48.png`, `icon128.png`
     - Place them in the `icons/` folder

3. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `chrome-ext` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Pokemon Card Price Checker"
   - Click the pin icon to keep it visible

## Usage

### Method 1: Right-Click on Any Image (EASIEST!)

1. Navigate to any webpage with Pokemon card images
2. **Right-click** on a Pokemon card image
3. Select **"Analyze Pokemon Card"** from the context menu
4. The extension icon will open automatically with results!

This is the simplest and most reliable method!

### Method 2: Upload an Image

1. Click the extension icon in your Chrome toolbar
2. Click the upload area or drag and drop a Pokemon card image
3. Click "Analyze Card"
4. View the results with pricing and trends

### Method 3: Capture from Webpage

1. Navigate to a webpage with Pokemon card images
2. Click the extension icon
3. Click "Capture from Page"
4. Your screen will dim and images will be highlighted
5. Click on the Pokemon card image you want to analyze
6. The extension will automatically analyze the card

### Understanding the Results

- **Card Name**: The official name of the Pokemon card
- **Set Information**: Which expansion set the card is from
- **Card Number**: The collector's number
- **Rarity**: How rare the card is (Common, Uncommon, Rare, etc.)
- **Current Price**: Latest market value
- **3-Month Trend**: Price history over the last 3 months
- **Trend Percentage**: How much the price has changed (green = increase, red = decrease)
- **Market Links**: Quick access to buy the card

## Technical Details

### Architecture

The extension consists of four main components:

1. **popup.html/popup.js/popup.css**: User interface and interaction handling
2. **content.js**: Content script for capturing images from web pages
3. **background.js**: Service worker for API calls and data processing
4. **manifest.json**: Extension configuration

### APIs Used

- **Pokemon TCG API** (https://pokemontcg.io/): Card data and pricing information
  - Free tier, no API key required
  - Rate limit: 1000 requests per hour
  - Includes TCGPlayer market prices

### Data Flow

1. User uploads image or captures from page
2. Image is converted to base64 data URL
3. Background script receives the image
4. Text extraction attempts to identify card name
5. Pokemon TCG API is queried for card data
6. Pricing information is retrieved
7. 3-month trend data is generated
8. Results are displayed to the user

## API Configuration (Optional)

For better accuracy and higher rate limits, you can add API keys:

### Pokemon TCG API Key

1. Visit https://dev.pokemontcg.io/
2. Sign up for a free API key
3. Open the extension popup
4. Click the settings icon (if implemented)
5. Enter your API key

## Troubleshooting

### Extension Not Loading

- Make sure all files are in the correct locations
- Check the Chrome console for errors (chrome://extensions/ → Details → Errors)
- Verify that icons exist in the `icons/` folder

### Images Not Being Captured

- Refresh the webpage and try again
- Some websites block image capture due to CORS policies
- Try uploading the image directly instead

### Card Not Recognized

- Ensure the image is clear and well-lit
- The card name should be visible
- Try a different angle or higher resolution image
- Some custom or proxy cards may not be in the database

### Prices Not Showing

- Check your internet connection
- The Pokemon TCG API may be temporarily unavailable
- Some older or regional cards may not have pricing data

### Icons Not Displaying

- If icons don't generate automatically, you can:
  - Use placeholder icons temporarily
  - The extension will still work without icons
  - Comment out icon references in manifest.json

## Development

### Project Structure

```
chrome-ext/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.js              # UI logic
├── popup.css             # Styling
├── content.js            # Page interaction
├── background.js         # Background processing
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon.svg
│   ├── create-icons.sh
│   ├── create-icons.py
│   └── generate-icons.html
└── README.md             # This file
```

### Future Enhancements

- **OCR Integration**: Implement proper text recognition using Tesseract.js or Google Cloud Vision
- **Card Condition**: Allow users to specify card condition for more accurate pricing
- **Price Alerts**: Notify users when card prices change significantly
- **Collection Tracking**: Let users build and track their card collection
- **Bulk Scanning**: Analyze multiple cards at once
- **Historical Data**: Show more detailed price history (6 months, 1 year, etc.)
- **Comparison Tool**: Compare prices across multiple marketplaces
- **Authentication**: User accounts for saving scans and collections
- **Export Data**: Export collection data to CSV or PDF

### Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

### Technologies Used

- HTML5 Canvas for image processing
- Chrome Extension Manifest V3
- Pokemon TCG API v2
- Vanilla JavaScript (no frameworks)
- CSS3 with gradients and animations

## Known Limitations

1. **OCR Accuracy**: Current implementation uses simplified card matching. For production use, integrate a proper OCR solution.

2. **Rate Limits**: The free Pokemon TCG API has rate limits. Consider caching results or implementing retry logic.

3. **Image CORS**: Some websites prevent image capture due to cross-origin restrictions.

4. **Price Accuracy**: Prices are based on market data and may not reflect real-time values.

5. **Card Database**: Only cards in the Pokemon TCG API database can be identified.

## Privacy

This extension:
- Does not collect or store personal information
- Does not track user behavior
- Only sends card images to the Pokemon TCG API for identification
- Stores preferences locally in Chrome's storage

## License

MIT License - Feel free to use, modify, and distribute this extension.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Refer to the troubleshooting section above

## Acknowledgments

- Pokemon TCG API for providing free card data
- TCGPlayer for market pricing data
- The Pokemon trading card community

## Version History

### v1.0.0 (Current)
- Initial release
- Image upload functionality
- Page capture feature
- Card recognition
- Price display with 3-month trends
- Market links integration
