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
    `;
    closeBtn.onclick = () => {
        overlay.remove();
        removeHighlights();
        // No need to send response since popup is closed
    };
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);

    // Highlight images and add click handlers
    images.forEach((img) => {
        // Skip very small images (likely icons)
        if (img.width < 100 || img.height < 100) return;

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

            // Convert image to data URL
            convertImageToDataURL(this, async (dataUrl) => {
                overlay.remove();
                removeHighlights();

                if (dataUrl) {
                    // Store the captured image in chrome.storage
                    // The popup will retrieve it when it reopens
                    try {
                        await chrome.storage.local.set({ capturedImage: dataUrl });
                        // Open the popup again to show the captured image
                        chrome.runtime.sendMessage({ action: 'imageCaptured' });
                    } catch (error) {
                        console.error('Error storing captured image:', error);
                    }
                } else {
                    console.error('Failed to capture image');
                }
            });
        }, { once: true });

        // Store original styles for cleanup
        img.dataset.originalOutline = originalOutline;
        img.dataset.originalCursor = originalCursor;
        img.dataset.originalZIndex = originalZIndex;
    });
}

function removeHighlights() {
    const selectableImages = document.querySelectorAll('.pokemon-card-selectable');
    selectableImages.forEach((img) => {
        img.style.outline = img.dataset.originalOutline || '';
        img.style.cursor = img.dataset.originalCursor || '';
        img.style.zIndex = img.dataset.originalZIndex || '';
        img.classList.remove('pokemon-card-selectable');
    });
}

function convertImageToDataURL(img, callback) {
    try {
        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match image
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to data URL
        try {
            const dataUrl = canvas.toDataURL('image/png');
            callback(dataUrl);
        } catch (e) {
            // If CORS error, try to fetch the image
            fetchImageAsDataURL(img.src, callback);
        }
    } catch (error) {
        console.error('Error converting image:', error);
        callback(null);
    }
}

function fetchImageAsDataURL(url, callback) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result);
            reader.onerror = () => callback(null);
            reader.readAsDataURL(blob);
        })
        .catch(() => callback(null));
}
