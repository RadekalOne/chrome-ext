# Capture from Page Fix

## Problem

When clicking "Capture from Page" and then clicking on a highlighted image, the extension popup would disappear before the image could be processed. This was caused by Chrome's default behavior of closing extension popups when they lose focus.

### User Experience Issue:
1. User clicks "Capture from Page" button
2. Page overlay appears with highlighted images
3. User hovers over images (zoom effect works)
4. User clicks on an image
5. ❌ **Popup closes immediately** and image is lost

## Root Cause

The original implementation tried to keep the popup open and pass the captured image back through the `sendResponse` callback. However:

- Chrome automatically closes extension popups when you click outside of them
- The popup loses focus when the user interacts with the page overlay
- The `sendResponse` callback fails because the popup is closed
- The captured image data has nowhere to go

## Solution

Changed the flow to use `chrome.storage.local` as an intermediary:

### New Flow:
1. User clicks "Capture from Page"
2. Clear any previous captured image from storage
3. Send message to content script to activate capture mode
4. **Close the popup immediately** with `window.close()`
5. User interacts with page overlay (highlights and clicks image)
6. Content script captures image and stores it in `chrome.storage.local`
7. Content script sends message to notify that image was captured
8. **User manually reopens the popup** (or popup auto-opens if user clicks extension icon)
9. Popup checks storage on load for captured image
10. If found, display the captured image and clear from storage
11. ✅ **User can now click "Analyze Card"**

## Code Changes

### popup.js

**1. Added DOMContentLoaded listener to check for captured images:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await chrome.storage.local.get('capturedImage');
        if (result.capturedImage) {
            // Image was captured, display it
            handleImageData(result.capturedImage);
            // Clear the stored image
            await chrome.storage.local.remove('capturedImage');
        }
    } catch (error) {
        console.error('Error checking for captured image:', error);
    }
});
```

**2. Updated Capture button to close popup immediately:**
```javascript
captureBtn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Clear any previous captured image
        await chrome.storage.local.remove('capturedImage');

        // Send message to content script to start capture mode
        chrome.tabs.sendMessage(tab.id, { action: 'captureImage' }, (response) => {
            if (chrome.runtime.lastError) {
                showError('Please refresh the page and try again.');
                return;
            }
        });

        // Close the popup to allow user to interact with the page
        window.close();
    } catch (error) {
        showError('Failed to capture image from page: ' + error.message);
    }
});
```

### content.js

**1. Updated image click handler to use chrome.storage:**
```javascript
img.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Convert image to data URL
    convertImageToDataURL(this, async (dataUrl) => {
        overlay.remove();
        removeHighlights();

        if (dataUrl) {
            // Store the captured image in chrome.storage
            try {
                await chrome.storage.local.set({ capturedImage: dataUrl });
                // Notify that image was captured
                chrome.runtime.sendMessage({ action: 'imageCaptured' });
            } catch (error) {
                console.error('Error storing captured image:', error);
            }
        } else {
            console.error('Failed to capture image');
        }
    });
}, { once: true });
```

**2. Removed sendResponse parameter (no longer needed):**
```javascript
function captureImageFromPage() {
    const images = Array.from(document.querySelectorAll('img'));
    if (images.length === 0) {
        console.log('No images found on this page');
        return;
    }
    createImageSelectionOverlay(images);
}
```

## Testing the Fix

### Steps to Test:
1. Load the extension in Chrome
2. Navigate to a page with Pokemon card images (e.g., pokemon.com, tcgplayer.com)
3. Click the extension icon to open popup
4. Click "Capture from Page" button
5. **Popup closes** - this is expected ✓
6. Page overlay appears with blue-highlighted images
7. Hover over images to see zoom effect
8. Click on a Pokemon card image
9. Overlay disappears
10. **Click extension icon again to reopen popup**
11. ✅ The captured image should appear in the preview section
12. Click "Analyze Card" to process the image with OCR

### Expected Behavior:
- ✅ Popup closes when "Capture from Page" is clicked
- ✅ Images are highlighted on the page
- ✅ Clicking an image captures it successfully
- ✅ Reopening popup shows the captured image
- ✅ "Analyze Card" button works normally
- ✅ OCR processes the image

### What Fixed:
- ✅ No more popup disappearing issue
- ✅ Image capture works reliably
- ✅ User can interact with page overlay without issues
- ✅ Captured image persists until processed
- ✅ Hover/zoom effects work without interference

## User Instructions

**Updated workflow for Capture from Page:**

1. Click extension icon
2. Click "Capture from Page"
3. Popup will close - **this is normal**
4. Click on the Pokemon card image you want to analyze
5. **Click the extension icon again** to reopen the popup
6. The captured image will appear automatically
7. Click "Analyze Card" to identify the card

## Benefits of This Approach

1. **Reliable**: No dependency on popup staying open
2. **User-friendly**: Clear workflow with visual feedback
3. **Persistent**: Captured image stored until analyzed
4. **Clean**: Proper cleanup of stored data
5. **Compatible**: Works with Chrome's popup lifecycle

## Alternative Considered

We could have tried to programmatically reopen the popup after image capture, but:
- Chrome extensions can't force-open their own popups in most cases
- This would be intrusive user experience
- Current approach is more explicit and predictable

## Future Enhancements

1. Add visual notification when image is captured (browser notification)
2. Add badge text to show "1" when image is waiting
3. Auto-advance to analyze screen when popup reopens
4. Add "captured image waiting" indicator
