const fs = require('fs');

// Minimal PNG data for a solid color square
function createSimplePNG(size, r, g, b) {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw simplified pokeball
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;

    // Top half (white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.fill();

    // Bottom half (red)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI, false);
    ctx.fill();

    // Center line
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - radius, centerY - size/20, radius * 2, size/10);

    // Center circle
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, size / 30);
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

// Try to use canvas, fallback to simple colored squares
try {
    const sizes = [16, 48, 128];
    sizes.forEach(size => {
        const buffer = createSimplePNG(size, 102, 126, 234);
        fs.writeFileSync(`icons/icon${size}.png`, buffer);
        console.log(`Created icon${size}.png`);
    });
    console.log('All icons created successfully!');
} catch (err) {
    console.error('Canvas module not available. Please run: npm install canvas');
    console.error('Or open icons/generate-icons.html in your browser to generate icons.');
}
