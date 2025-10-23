// Prevent multiple injections
if (window.pokemonCardExtensionLoaded) {
    console.log('Pokemon Card Extension content script already loaded');
} else {
    window.pokemonCardExtensionLoaded = true;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'captureImage') {
            captureImageFromPage(sendResponse);
            return true; // Keep the message channel open for async response
        }
    });

    console.log('Pokemon Card Extension content script loaded');
}

function captureImageFromPage(sendResponse) {
    // Find all images on the page
    const images = Array.from(document.querySelectorAll('img'));

    if (images.length === 0) {
        sendResponse({ success: false, error: 'No images found on this page' });
        return;
    }

    // Create overlay for image selection
    createImageSelectionOverlay(images, sendResponse);
}

function createImageSelectionOverlay(images, sendResponse) {
    // Remove any existing overlay first
    const existingOverlay = document.getElementById('pokemon-card-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    console.log(`Found ${images.length} total images on page`);

    let highlightedCount = 0;
    const selectableImages = [];

    // Filter and prepare images first
    images.forEach((img) => {
        // Skip very small images (likely icons)
        if (img.width < 100 || img.height < 100) return;

        highlightedCount++;
        selectableImages.push(img);

        // Store original styles
        img.dataset.originalOutline = img.style.outline || '';
        img.dataset.originalCursor = img.style.cursor || '';
        img.dataset.originalZIndex = img.style.zIndex || '';
        img.dataset.originalPointerEvents = img.style.pointerEvents || '';
        img.dataset.originalPosition = img.style.position || '';

        // Apply highlight styles
        img.style.outline = '4px solid #667eea !important';
        img.style.cursor = 'pointer !important';
        img.style.position = img.style.position || 'relative';
        img.style.zIndex = '2147483646';
        img.style.pointerEvents = 'auto';
        img.classList.add('pokemon-card-selectable');
    });

    console.log(`Highlighted ${highlightedCount} images for selection`);

    if (highlightedCount === 0) {
        sendResponse({ success: false, error: 'No suitable images found (must be at least 100x100 pixels)' });
        return;
    }

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
        z-index: 2147483645;
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
        pointer-events: auto;
    `;
    instruction.textContent = `Click on an image to analyze it (${highlightedCount} found)`;
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
        z-index: 2147483647;
        pointer-events: auto;
    `;
    closeBtn.onclick = () => {
        console.log('Cancel button clicked');
        cleanup();
        sendResponse({ success: false, error: 'Cancelled by user' });
    };
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);

    // Global click handler at document level
    let isProcessing = false;

    const handleDocumentClick = function(e) {
        console.log('Document click detected', e.target);

        // Check if clicked element is or contains a selectable image
        let clickedImg = null;

        if (e.target.classList.contains('pokemon-card-selectable')) {
            clickedImg = e.target;
        } else if (e.target.tagName === 'IMG') {
            // Check if this image is in our selectable list
            const imgElement = selectableImages.find(img => img === e.target);
            if (imgElement) clickedImg = imgElement;
        }

        if (clickedImg && !isProcessing) {
            console.log('Selectable image clicked!', clickedImg.src);
            isProcessing = true;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Visual feedback
            clickedImg.style.outline = '6px solid #48bb78';
            clickedImg.style.boxShadow = '0 0 30px rgba(72, 187, 120, 1)';
            instruction.textContent = 'Capturing image...';
            instruction.style.background = 'rgba(72, 187, 120, 0.9)';

            // Disable all images
            selectableImages.forEach(img => {
                img.style.pointerEvents = 'none';
                img.style.cursor = 'wait';
            });

            // Convert image to data URL
            convertImageToDataURL(clickedImg, (dataUrl) => {
                console.log('Conversion result:', dataUrl ? 'Success' : 'Failed');
                cleanup();

                if (dataUrl) {
                    sendResponse({ success: true, imageData: dataUrl });
                } else {
                    sendResponse({ success: false, error: 'Failed to capture image. Try a different image or upload directly.' });
                }
            });
        }
    };

    // Add event listeners at document level with capture
    document.addEventListener('click', handleDocumentClick, { capture: true });

    // Also add to each image directly as backup
    selectableImages.forEach((img) => {
        img.addEventListener('mouseenter', function() {
            if (!isProcessing) {
                this.style.outline = '6px solid #5a67d8';
                this.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
            }
        });

        img.addEventListener('mouseleave', function() {
            if (!isProcessing) {
                this.style.outline = '4px solid #667eea';
                this.style.boxShadow = 'none';
            }
        });

        // Direct click handler as backup
        img.addEventListener('click', function(e) {
            console.log('Direct image click handler fired');
            handleDocumentClick(e);
        }, { capture: true });
    });

    function cleanup() {
        console.log('Cleaning up overlay and event listeners');
        overlay.remove();
        document.removeEventListener('click', handleDocumentClick, { capture: true });
        removeHighlights();
    }

    // Store cleanup function for later use
    overlay._cleanup = cleanup;
}

function removeHighlights() {
    const selectableImages = document.querySelectorAll('.pokemon-card-selectable');
    console.log(`Removing highlights from ${selectableImages.length} images`);

    selectableImages.forEach((img) => {
        img.style.outline = img.dataset.originalOutline || '';
        img.style.cursor = img.dataset.originalCursor || '';
        img.style.zIndex = img.dataset.originalZIndex || '';
        img.style.pointerEvents = img.dataset.originalPointerEvents || '';
        img.style.position = img.dataset.originalPosition || '';
        img.style.boxShadow = '';
        img.classList.remove('pokemon-card-selectable');

        // Clean up dataset
        delete img.dataset.originalOutline;
        delete img.dataset.originalCursor;
        delete img.dataset.originalZIndex;
        delete img.dataset.originalPointerEvents;
        delete img.dataset.originalPosition;
    });
}

function convertImageToDataURL(img, callback) {
    console.log('Converting image to data URL:', img.src);

    try {
        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match image
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        console.log(`Image dimensions: ${width}x${height}`);

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to data URL
        try {
            const dataUrl = canvas.toDataURL('image/png');
            console.log('Canvas conversion successful, data URL length:', dataUrl.length);
            callback(dataUrl);
        } catch (e) {
            // If CORS error, try to fetch the image
            console.warn('Canvas CORS error, trying fetch method:', e.message);
            fetchImageAsDataURL(img.src, callback);
        }
    } catch (error) {
        console.error('Error converting image:', error);
        // Try fetch as fallback
        fetchImageAsDataURL(img.src, callback);
    }
}

function fetchImageAsDataURL(url, callback) {
    console.log('Attempting to fetch image:', url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            console.log('Image fetched successfully, size:', blob.size);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('FileReader conversion complete');
                callback(reader.result);
            };
            reader.onerror = (e) => {
                console.error('FileReader error:', e);
                callback(null);
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            callback(null);
        });
}
