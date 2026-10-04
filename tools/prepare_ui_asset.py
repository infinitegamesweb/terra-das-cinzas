"""Remove a deliberate flat magenta key from a generated UI PNG."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--tolerance", type=int, default=44)
    parser.add_argument("--trim", action="store_true", help="Crop transparent outer margins")
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, _alpha = pixels[x, y]
            # Keep dark outlines while clearing flat magenta and its antialiased edge.
            distance = abs(red - 255) + green + abs(blue - 255)
            magenta_strength = min(red, blue) - green
            if distance <= args.tolerance:
                pixels[x, y] = (0, 0, 0, 0)
            elif red > green and blue > green and abs(red - blue) < 115 and magenta_strength > 35:
                pixels[x, y] = (0, 0, 0, 0)

    if args.trim:
        bounds = image.getchannel("A").getbbox()
        if bounds:
            left, top, right, bottom = bounds
            pad = 2
            image = image.crop((max(0, left - pad), max(0, top - pad), min(image.width, right + pad), min(image.height, bottom + pad)))

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.destination, optimize=True)
    print(f"Saved transparent UI asset: {args.destination} ({image.width}x{image.height})")


if __name__ == "__main__":
    main()
