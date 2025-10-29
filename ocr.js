// OCR.space API integration for card text extraction
const OCR_API_KEY = 'K85318161888957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Extract text from an image using OCR.space API
 * @param {string} imageData - Base64 encoded image data URL
 * @returns {Promise<Object>} Extracted text and metadata
 */
async function performOCR(imageData) {
    try {
        console.log('Starting OCR analysis...');

        // Prepare form data for OCR.space API
        const formData = new FormData();
        formData.append('base64Image', imageData);
        formData.append('apikey', OCR_API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

        const response = await fetch(OCR_API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`OCR API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
        }

        if (!result.ParsedResults || result.ParsedResults.length === 0) {
            throw new Error('No text could be extracted from image');
        }

        const parsedText = result.ParsedResults[0].ParsedText;
        console.log('OCR extracted text:', parsedText);

        // Parse the extracted text to identify card details
        const cardInfo = parseCardText(parsedText);

        return {
            success: true,
            rawText: parsedText,
            cardInfo: cardInfo,
            confidence: result.ParsedResults[0].TextOrientation || 0
        };
    } catch (error) {
        console.error('OCR error:', error);
        return {
            success: false,
            error: error.message,
            rawText: null,
            cardInfo: null
        };
    }
}

/**
 * Parse OCR text to extract Pokemon card information
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed card information
 */
function parseCardText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const cardInfo = {
        name: null,
        hp: null,
        type: null,
        setNumber: null,
        rarity: null
    };

    // Common Pokemon card patterns
    const hpPattern = /(\d+)\s*HP/i;
    const setNumberPattern = /(\d+)\/(\d+)/;
    const typePattern = /(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy|Dragon|Colorless)/i;

    // Try to identify card name (usually first significant line)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];

        // Skip very short lines and common non-name text
        if (line.length < 3 || /^(HP|Stage|Evolves|Basic|VMAX|GX|EX|V)$/i.test(line)) {
            continue;
        }

        // Likely card name if it's a substantial line without numbers
        if (!cardInfo.name && line.length > 2 && !/^\d+$/.test(line)) {
            // Check if line contains Pokemon name patterns
            if (/^[A-Z][a-z]+/.test(line) || /VMAX|GX|EX|V$/i.test(line)) {
                cardInfo.name = line;
                break;
            }
        }
    }

    // Extract HP
    const hpMatch = text.match(hpPattern);
    if (hpMatch) {
        cardInfo.hp = parseInt(hpMatch[1]);
    }

    // Extract set number (e.g., "025/165")
    const setNumberMatch = text.match(setNumberPattern);
    if (setNumberMatch) {
        cardInfo.setNumber = setNumberMatch[0];
    }

    // Extract type
    const typeMatch = text.match(typePattern);
    if (typeMatch) {
        cardInfo.type = typeMatch[1];
    }

    // Check for special card types
    if (text.includes('VMAX')) {
        cardInfo.name = cardInfo.name ? `${cardInfo.name} VMAX` : 'Unknown VMAX';
    } else if (text.includes(' GX')) {
        cardInfo.name = cardInfo.name ? `${cardInfo.name} GX` : 'Unknown GX';
    } else if (text.includes(' EX')) {
        cardInfo.name = cardInfo.name ? `${cardInfo.name} EX` : 'Unknown EX';
    } else if (text.match(/\bV\b/) && !text.includes('VMAX')) {
        cardInfo.name = cardInfo.name ? `${cardInfo.name} V` : 'Unknown V';
    }

    return cardInfo;
}

/**
 * Search for the best matching card name from OCR text
 * @param {string} text - Raw OCR text
 * @returns {string|null} Most likely card name
 */
function extractCardName(text) {
    const cardInfo = parseCardText(text);

    if (cardInfo.name) {
        return cardInfo.name;
    }

    // Fallback: try to find any Pokemon name in the text
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);

    for (const line of lines) {
        // Skip lines that are clearly not names
        if (/^\d+$/.test(line) || line.length < 3) {
            continue;
        }

        // Return first reasonable candidate
        if (/^[A-Za-z]/.test(line)) {
            return line;
        }
    }

    return null;
}
