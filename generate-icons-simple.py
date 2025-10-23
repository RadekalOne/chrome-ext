#!/usr/bin/env python3
"""
Simple icon generator that creates basic PNG files without external dependencies
"""

def create_simple_png(size, output_file):
    """Create a simple solid color PNG file"""
    import struct
    import zlib

    # Create a simple gradient-like pattern
    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            # Create a purple gradient
            r = int(102 + (118 - 102) * x / size)
            g = int(126 + (75 - 126) * y / size)
            b = int(234 + (162 - 234) * (x + y) / (size * 2))
            row.extend([r, g, b, 255])  # RGBA
        pixels.append(bytes(row))

    # PNG file structure
    def png_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', crc)

    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk (image header)
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    ihdr = png_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (image data)
    raw_data = b''.join(b'\x00' + row for row in pixels)  # Add filter byte
    idat = png_chunk(b'IDAT', zlib.compress(raw_data, 9))

    # IEND chunk (end)
    iend = png_chunk(b'IEND', b'')

    # Write PNG file
    with open(output_file, 'wb') as f:
        f.write(png_signature + ihdr + idat + iend)

    print(f'Created {output_file}')

if __name__ == '__main__':
    import os

    # Create icons directory if needed
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)

    # Generate icons
    print('Generating simple placeholder icons...')
    create_simple_png(16, 'icons/icon16.png')
    create_simple_png(48, 'icons/icon48.png')
    create_simple_png(128, 'icons/icon128.png')
    print('\n✓ All icons created successfully!')
    print('You can now load the extension in Chrome.')
