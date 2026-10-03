import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Target canvas: 1160 x 640 (aspect ratio ~1.81)
W, H = 1160, 640
base = Image.new('RGBA', (W, H), (15, 15, 18, 255))

# 1. Load the Double Arch Frame (677 x 365) and resize to fill canvas
double_arch = Image.open('public/assets/ui/extracted/inventory/char_sheet_double_arch.png')
# Resize double arch to (1160, 640)
arch_resized = double_arch.resize((W, H), Image.Resampling.LANCZOS)
base.paste(arch_resized, (0, 0), arch_resized)

# Let's inspect the two inner alcoves at (1160, 640):
# Scale factors: sx = 1160 / 677 = 1.7134, sy = 640 / 365 = 1.7534
# Original left alcove: x=42..315 (w=273), y=75..335 (h=260)
# Scaled left alcove: x=72..540 (w=468), y=131..587 (h=456)
# Original right alcove: x=365..638 (w=273), y=75..335 (h=260)
# Scaled right alcove: x=625..1093 (w=468), y=131..587 (h=456)

print(f"Scaled Left Alcove: x=72..540 (w=468), y=131..587 (h=456)")
print(f"Scaled Right Alcove: x=625..1093 (w=468), y=131..587 (h=456)")

# Inside Left Alcove:
# Paperdoll Equipment Slots & Character Stance & Combat Stats
# Inside Right Alcove:
# Top: Category Tabs
# Center: 5x5 or 5x6 Inventory Grid
# Right: Item Inspector Panel (or 6x5 Grid + Inspector side by side)

base.save('public/assets/ui/preview/test_composite_v1.png')
print("Saved test composite v1")
