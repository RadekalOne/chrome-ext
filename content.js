// Prevent duplicate script loading
if (window.pokemonCardExtensionLoaded) {
    console.log('Pokemon Card Extension content script already loaded');
} else {
    window.pokemonCardExtensionLoaded = true;
    console.log('Pokemon Card Extension content script loaded');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureImage') {
        captureImageFromPage();
        return true; // Keep the message channel open for async response
    }
});

function captureImageFromPage() {
    // Find all images on the page
    const images = Array.from(document.querySelectorAll('img'));

    console.log('Found', images.length, 'total images on page');

    if (images.length === 0) {
        console.log('No images found on this page');
        return;
    }

    // Create overlay for image selection
    createImageSelectionOverlay(images);
}

function createImageSelectionOverlay(images) {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'pokemon-card-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    `;

    // Create instruction text
    const instruction = document.createElement('div');
    instruction.style.cssText = `
        color: white;
        font-size: 18px;
        font-family: Arial, sans-serif;
        margin-bottom: 20px;
        text-align: center;
        padding: 20px;
        background: rgba(102, 126, 234, 0.9);
        border-radius: 10px;
        pointer-events: none;
    `;
    instruction.textContent = 'Click on a Pokemon card image to analyze it';
    overlay.appendChild(instruction);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000000;
        pointer-events: auto;
    `;
    closeBtn.onclick = () => {
        overlay.remove();
        removeHighlights();
        console.log('Capture cancelled by user');
    };
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);

    console.log('Overlay created with pointer-events: none (won\'t block image clicks)');

    // Highlight images and add click handlers
    let highlightedCount = 0;
    images.forEach((img) => {
        // Skip very small images (likely icons)
        if (img.width < 100 || img.height < 100) return;

        highlightedCount++;

        // Add highlight effect
        const originalOutline = img.style.outline;
        const originalCursor = img.style.cursor;
        const originalZIndex = img.style.zIndex;

        img.style.outline = '3px solid #667eea';
        img.style.cursor = 'pointer';
        img.style.zIndex = '1000000';
        img.classList.add('pokemon-card-selectable');

        img.addEventListener('mouseenter', function() {
            this.style.outline = '5px solid #5a67d8';
        });

        img.addEventListener('mouseleave', function() {
            this.style.outline = '3px solid #667eea';
        });

        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Selectable image clicked!', this.src);

            // Convert image to data URL
            convertImageToDataURL(this, async (dataUrl) => {
                console.log('Conversion result:', dataUrl ? 'Success' : 'Failed');

                // Clean up overlay first
                console.log('Cleaning up overlay and event listeners');
                overlay.remove();
                removeHighlights();

                if (dataUrl) {
                    // Store the captured image in chrome.storage
                    console.log('Attempting to store image in chrome.storage.local...');
                    console.log('Image data size:', dataUrl.length, 'characters');

                    try {
                        await chrome.storage.local.set({ capturedImage: dataUrl });
                        console.log('✓ Image stored successfully in chrome.storage.local');

                        // Notify that image was captured
                        chrome.runtime.sendMessage({ action: 'imageCaptured' }, (response) => {
                            console.log('Message sent to background/popup');
                        });

                        // Show success notification
                        showCaptureSuccessNotification();
                    } catch (error) {
                        console.error('✗ Error storing captured image:', error);
                        showCaptureErrorNotification(error.message);
                    }
                } else {
                    console.error('Failed to capture image - dataUrl is null');
                    showCaptureErrorNotification('Failed to convert image');
                }
            });
        }, { once: true });

        // Store original styles for cleanup
        img.dataset.originalOutline = originalOutline;
        img.dataset.originalCursor = originalCursor;
        img.dataset.originalZIndex = originalZIndex;
    });

    console.log('Highlighted', highlightedCount, 'images for selection');
    console.log('✓ Overlay ready - images are clickable, overlay passes clicks through');
}

function removeHighlights() {
    const selectableImages = document.querySelectorAll('.pokemon-card-selectable');
    console.log('Removing highlights from', selectableImages.length, 'images');
    selectableImages.forEach((img) => {
        img.style.outline = img.dataset.originalOutline || '';
        img.style.cursor = img.dataset.originalCursor || '';
        img.style.zIndex = img.dataset.originalZIndex || '';
        img.classList.remove('pokemon-card-selectable');
    });
}

function convertImageToDataURL(img, callback) {
    console.log('Converting image to data URL:', img.src);

    try {
        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match image
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        console.log('Image dimensions:', canvas.width + 'x' + canvas.height);

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to data URL
        try {
            const dataUrl = canvas.toDataURL('image/png');
            console.log('Canvas conversion successful, data URL length:', dataUrl.length);
            callback(dataUrl);
        } catch (e) {
            // If CORS error, try to fetch the image
            console.log('Canvas CORS error, trying fetch method:', e.message);
            fetchImageAsDataURL(img.src, callback);
        }
    } catch (error) {
        console.error('Error converting image:', error);
        callback(null);
    }
}

function fetchImageAsDataURL(url, callback) {
    console.log('Attempting to fetch image:', url);

    fetch(url)
        .then(response => {
            console.log('Image fetched successfully, size:', response.headers.get('content-length'));
            return response.blob();
        })
        .then(blob => {
            console.log('Blob created, size:', blob.size);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('FileReader conversion complete');
                callback(reader.result);
            };
            reader.onerror = () => {
                console.error('FileReader error');
                callback(null);
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            callback(null);
        });
}

function showCaptureSuccessNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #38a169;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = '✓ Card image captured! Click extension icon to continue.';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showCaptureErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e53e3e;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = '✗ Capture failed: ' + message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
