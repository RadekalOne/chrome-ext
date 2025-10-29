// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const captureBtn = document.getElementById('captureBtn');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeText = document.getElementById('analyzeText');
const analyzeLoader = document.getElementById('analyzeLoader');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const scanAnotherBtn = document.getElementById('scanAnotherBtn');

// Manual search elements
const manualSearchSection = document.getElementById('manualSearchSection');
const manualSearchBtn = document.getElementById('manualSearchBtn');
const manualSearchToggle = document.getElementById('manualSearchToggle');
const searchManualBtn = document.getElementById('searchManualBtn');
const manualSearchText = document.getElementById('manualSearchText');
const manualSearchLoader = document.getElementById('manualSearchLoader');
const manualCardName = document.getElementById('manualCardName');
const manualCardSet = document.getElementById('manualCardSet');
const backToUploadBtn = document.getElementById('backToUploadBtn');
const searchAgainBtn = document.getElementById('searchAgainBtn');
const manualSearchFromError = document.getElementById('manualSearchFromError');

let currentImageData = null;

// Check for captured image when popup opens
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

// Upload area interactions
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleImageUpload(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
    }
});

// Capture from page
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
        // The captured image will be retrieved when popup reopens
        window.close();
    } catch (error) {
        showError('Failed to capture image from page: ' + error.message);
    }
});

// Clear image
clearBtn.addEventListener('click', () => {
    resetToUpload();
});

// Analyze card
analyzeBtn.addEventListener('click', async () => {
    if (!currentImageData) return;

    setAnalyzeLoading(true);
    hideError();

    try {
        // Send image to background script for analysis
        chrome.runtime.sendMessage({
            action: 'analyzeCard',
            imageData: currentImageData
        }, (response) => {
            setAnalyzeLoading(false);

            if (chrome.runtime.lastError) {
                showError('Analysis failed: ' + chrome.runtime.lastError.message);
                return;
            }

            if (response.success) {
                displayResults(response.data);
            } else {
                showError(response.error || 'Failed to identify the card. Please try another image.');
            }
        });
    } catch (error) {
        setAnalyzeLoading(false);
        showError('Analysis failed: ' + error.message);
    }
});

// Retry and scan another
retryBtn.addEventListener('click', resetToUpload);
scanAnotherBtn.addEventListener('click', resetToUpload);

// Manual search from main screen
manualSearchBtn.addEventListener('click', () => {
    showManualSearch();
});

// Manual search toggle from preview
manualSearchToggle.addEventListener('click', () => {
    showManualSearch();
});

// Manual search from error
manualSearchFromError.addEventListener('click', () => {
    showManualSearch();
});

// Search again from results (wrong card)
searchAgainBtn.addEventListener('click', () => {
    showManualSearch();
});

// Back to upload from manual search
backToUploadBtn.addEventListener('click', () => {
    resetToUpload();
});

// Perform manual search
searchManualBtn.addEventListener('click', async () => {
    const cardName = manualCardName.value.trim();
    const cardSet = manualCardSet.value.trim();

    if (!cardName) {
        alert('Please enter a card name');
        manualCardName.focus();
        return;
    }

    await performManualSearch(cardName, cardSet);
});

// Enter key to search
manualCardName.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const cardName = manualCardName.value.trim();
        const cardSet = manualCardSet.value.trim();
        if (cardName) {
            await performManualSearch(cardName, cardSet);
        }
    }
});

manualCardSet.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const cardName = manualCardName.value.trim();
        const cardSet = manualCardSet.value.trim();
        if (cardName) {
            await performManualSearch(cardName, cardSet);
        }
    }
});

// Helper functions
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        handleImageData(e.target.result);
    };
    reader.readAsDataURL(file);
}

function handleImageData(dataUrl) {
    currentImageData = dataUrl;
    previewImage.src = dataUrl;

    document.querySelector('.upload-section').style.display = 'none';
    previewSection.style.display = 'block';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function setAnalyzeLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    analyzeText.style.display = isLoading ? 'none' : 'inline';
    analyzeLoader.style.display = isLoading ? 'inline-block' : 'none';
}

function displayResults(data) {
    previewSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Card info
    document.getElementById('cardName').textContent = data.name || 'Unknown Card';
    document.getElementById('cardSet').textContent = data.set || 'Unknown Set';
    document.getElementById('cardNumber').textContent = data.number ? `#${data.number}` : '';
    document.getElementById('cardRarity').textContent = data.rarity || '';

    // Current price
    const currentPrice = data.price?.current || 0;
    document.getElementById('currentPrice').textContent = `$${currentPrice.toFixed(2)}`;

    // Trend
    if (data.price?.trend) {
        displayTrend(data.price.trend);
    }

    // Market links
    if (data.links?.tcgplayer) {
        document.getElementById('tcgplayerLink').href = data.links.tcgplayer;
    }
    if (data.links?.cardmarket) {
        document.getElementById('cardmarketLink').href = data.links.cardmarket;
    }
}

function displayTrend(trendData) {
    const trendChange = document.getElementById('trendChange');
    const changePercent = trendData.percentChange || 0;

    trendChange.textContent = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
    trendChange.className = 'trend-change';

    if (changePercent > 0) {
        trendChange.classList.add('positive');
    } else if (changePercent < 0) {
        trendChange.classList.add('negative');
    } else {
        trendChange.classList.add('neutral');
    }

    // Draw chart
    if (trendData.history && trendData.history.length > 0) {
        drawTrendChart(trendData.history);
    }
}

function drawTrendChart(data) {
    const canvas = document.getElementById('trendChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 300;

    const padding = 20;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find min and max values
    const values = data.map(d => d.price);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * width;
        const y = padding + height - ((point.price - minValue) / range) * height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.2)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

    ctx.lineTo(padding + width, padding + height);
    ctx.lineTo(padding, padding + height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw points
    ctx.fillStyle = '#667eea';
    data.forEach((point, i) => {
        const x = padding + (i / (data.length - 1)) * width;
        const y = padding + height - ((point.price - minValue) / range) * height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
}

function hideError() {
    errorSection.style.display = 'none';
}

function resetToUpload() {
    currentImageData = null;
    fileInput.value = '';

    document.querySelector('.upload-section').style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    manualSearchSection.style.display = 'none';
}

function showManualSearch() {
    document.querySelector('.upload-section').style.display = 'none';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    manualSearchSection.style.display = 'block';

    // Clear previous input but keep it if coming from error/results
    // manualCardName.value = '';
    // manualCardSet.value = '';

    // Focus on card name input
    setTimeout(() => manualCardName.focus(), 100);
}

async function performManualSearch(cardName, cardSet) {
    console.log('Manual search:', cardName, cardSet || '(no set)');

    // Show loading state
    searchManualBtn.disabled = true;
    manualSearchText.style.display = 'none';
    manualSearchLoader.style.display = 'inline-block';

    try {
        // Send manual search request to background script
        chrome.runtime.sendMessage({
            action: 'searchCardManually',
            cardName: cardName,
            cardSet: cardSet
        }, (response) => {
            // Hide loading state
            searchManualBtn.disabled = false;
            manualSearchText.style.display = 'inline';
            manualSearchLoader.style.display = 'none';

            if (chrome.runtime.lastError) {
                showError('Search failed: ' + chrome.runtime.lastError.message);
                return;
            }

            if (response.success) {
                displayResults(response.data);
            } else {
                showError(response.error || 'Card not found. Try a different search.');
            }
        });
    } catch (error) {
        // Hide loading state
        searchManualBtn.disabled = false;
        manualSearchText.style.display = 'inline';
        manualSearchLoader.style.display = 'none';

        showError('Search failed: ' + error.message);
    }
}
