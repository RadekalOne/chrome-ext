#!/usr/bin/env python3
"""
Generate extension icons
Requires: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw
    import os

    def create_icon(size):
        # Create image with gradient background
        img = Image.new('RGB', (size, size), color='white')
        draw = ImageDraw.Draw(img)

        # Draw gradient background
        for i in range(size):
            r = int(102 + (118 - 102) * i / size)
            g = int(126 + (75 - 126) * i / size)
            b = int(234 + (162 - 234) * i / size)
            draw.rectangle([(0, i), (size, i+1)], fill=(r, g, b))

        # Draw simplified pokeball
        center_x, center_y = size // 2, size // 2
        radius = size // 3

        # Top half (white)
        draw.pieslice(
            [(center_x - radius, center_y - radius),
             (center_x + radius, center_y + radius)],
            180, 360, fill='white'
        )

        # Bottom half (red)
        draw.pieslice(
            [(center_x - radius, center_y - radius),
             (center_x + radius, center_y + radius)],
            0, 180, fill='red'
        )

        # Center line
        line_height = size // 20
        draw.rectangle(
            [(center_x - radius, center_y - line_height),
             (center_x + radius, center_y + line_height)],
            fill='black'
        )

        # Center circle
        inner_radius = size // 12
        draw.ellipse(
            [(center_x - inner_radius, center_y - inner_radius),
             (center_x + inner_radius, center_y + inner_radius)],
            fill='white', outline='black', width=max(1, size // 60)
        )

        return img

    # Generate all icon sizes
    sizes = [16, 48, 128]
    for size in sizes:
        img = create_icon(size)
        img.save(f'icon{size}.png')
        print(f'Generated icon{size}.png')

    print('All icons generated successfully!')

except ImportError:
    print('PIL/Pillow not found. Install it with: pip install Pillow')
    print('Or use the generate-icons.html file in a web browser.')
    exit(1)
