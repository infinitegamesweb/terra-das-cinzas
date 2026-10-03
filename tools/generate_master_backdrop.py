import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Master Canvas: 1160 x 640
W, H = 1160, 640
canvas = Image.new('RGBA', (W, H), (10, 10, 14, 255))

# 1. Base Double Arch Frame
double_arch = Image.open('public/assets/ui/extracted/inventory/char_sheet_double_arch.png').convert('RGBA')
arch_resized = double_arch.resize((W, H), Image.Resampling.LANCZOS)
canvas.paste(arch_resized, (0, 0), arch_resized)

# 2. Left Alcove: Equipment Slot Sockets (Beveled Stone)
slot_frame = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png').convert('RGBA')
slot_sz = 52
slot_beveled = slot_frame.resize((slot_sz, slot_sz), Image.Resampling.LANCZOS)

# Coordinates for 9 equipment slots in Left Alcove
# Center X = 300
doll_slots = {
    'helm':   (274, 150),
    'armor':  (274, 225),
    'boots':  (274, 300),
    'weapon': (155, 225),
    'gloves': (155, 300),
    'ring1':  (155, 375),
    'shield': (395, 225),
    'amulet': (395, 300),
    'ring2':  (395, 375),
}

for name, (sx, sy) in doll_slots.items():
    canvas.paste(slot_beveled, (sx, sy), slot_beveled)

# 3. Left Alcove: Bottom Stats Plaque Frame
stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
stats_w, stats_h = 420, 150
stats_resized = stats_plaque.resize((stats_w, stats_h), Image.Resampling.LANCZOS)
canvas.paste(stats_resized, (90, 445), stats_resized)

# 4. Right Alcove: 5x5 Backpack Grid Sockets
grid_slot_sz = 46
grid_start_x = 560
grid_start_y = 195
gap = 4
grid_beveled = slot_frame.resize((grid_slot_sz, grid_slot_sz), Image.Resampling.LANCZOS)

for r in range(5):
    for c in range(5):
        gx = grid_start_x + c * (grid_slot_sz + gap)
        gy = grid_start_y + r * (grid_slot_sz + gap)
        canvas.paste(grid_beveled, (gx, gy), grid_beveled)

# 5. Right Alcove: Item Inspector Ornate Frame
insp_x = 830
insp_y = 190
insp_w = 265
insp_h = 265

# Load gothic ornate window border or draw carved gothic border
draw = ImageDraw.Draw(canvas)
# Semi-transparent dark background for inspector
overlay = Image.new('RGBA', (insp_w, insp_h), (14, 14, 18, 230))
canvas.paste(overlay, (insp_x, insp_y), overlay)

# Double stroke border with gold/iron accents
draw.rectangle([insp_x, insp_y, insp_x + insp_w, insp_y + insp_h], outline=(85, 75, 60, 255), width=2)
draw.rectangle([insp_x + 3, insp_y + 3, insp_x + insp_w - 3, insp_y + insp_h - 3], outline=(40, 38, 35, 255), width=1)
# Corner studs
for cx, cy in [(insp_x+2, insp_y+2), (insp_x+insp_w-5, insp_y+2), (insp_x+2, insp_y+insp_h-5), (insp_x+insp_w-5, insp_y+insp_h-5)]:
    draw.rectangle([cx, cy, cx+3, cy+3], fill=(160, 130, 70, 255))

# 6. Save master backdrop to both locations
canvas.save('public/assets/ui/inventory/inventory_window_master.png')
print("Saved master backdrop to public/assets/ui/inventory/inventory_window_master.png")
