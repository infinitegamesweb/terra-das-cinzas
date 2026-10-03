import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1160, 640
canvas = Image.new('RGBA', (W, H), (10, 10, 14, 255))

# 1. Base Double Arch Frame
double_arch = Image.open('public/assets/ui/extracted/inventory/char_sheet_double_arch.png').convert('RGBA')
arch_resized = double_arch.resize((W, H), Image.Resampling.LANCZOS)
canvas.paste(arch_resized, (0, 0), arch_resized)

# 2. Beveled slot socket texture
slot_frame = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png').convert('RGBA')
slot_sz = 52
slot_beveled = slot_frame.resize((slot_sz, slot_sz), Image.Resampling.LANCZOS)

# Coordinates for 9 equipment slots in Left Alcove
# Perfectly centered within the 3 cathedral columns
# Left column x = 145, Center column x = 285, Right column x = 425
doll_slots = {
    'helm':   (285, 165),
    'armor':  (285, 235),
    'boots':  (285, 305),
    'weapon': (145, 235),
    'gloves': (145, 305),
    'ring1':  (145, 375),
    'shield': (425, 235),
    'amulet': (425, 305),
    'ring2':  (425, 375),
}

for name, (sx, sy) in doll_slots.items():
    canvas.paste(slot_beveled, (sx, sy), slot_beveled)

# 3. Clean Stats Plaque for Left Alcove
# Let's take the ornate gold/iron border of the stats plaque, but fill the inner text areas with dark gothic parchment
stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
stats_w, stats_h = 430, 145
stats_resized = stats_plaque.resize((stats_w, stats_h), Image.Resampling.LANCZOS)

# Clean inner text boxes
stats_draw = ImageDraw.Draw(stats_resized)
# Left portrait box: x=24..175, y=30..130 -> fill with subtle dark parchment
stats_draw.rectangle([24, 28, 175, 126], fill=(16, 16, 20, 245), outline=(45, 40, 32, 255), width=1)
# Right stats text box: x=185..410, y=28..130 -> fill with subtle dark parchment
stats_draw.rectangle([188, 28, 410, 126], fill=(16, 16, 20, 245), outline=(45, 40, 32, 255), width=1)

canvas.paste(stats_resized, (85, 445), stats_resized)

# 4. Right Alcove: 5x5 Backpack Grid Sockets
grid_slot_sz = 46
grid_start_x = 580
grid_start_y = 195
gap = 5
grid_beveled = slot_frame.resize((grid_slot_sz, grid_slot_sz), Image.Resampling.LANCZOS)

for r in range(5):
    for c in range(5):
        gx = grid_start_x + c * (grid_slot_sz + gap)
        gy = grid_start_y + r * (grid_slot_sz + gap)
        canvas.paste(grid_beveled, (gx, gy), grid_beveled)

# 5. Right Alcove: Item Inspector Ornate Frame
insp_x = 855
insp_y = 190
insp_w = 230
insp_h = 265

draw = ImageDraw.Draw(canvas)
# Dark textured parchment fill
draw.rectangle([insp_x, insp_y, insp_x + insp_w, insp_y + insp_h], fill=(16, 16, 22, 240))

# Ornate double stroke border
draw.rectangle([insp_x, insp_y, insp_x + insp_w, insp_y + insp_h], outline=(95, 82, 62, 255), width=2)
draw.rectangle([insp_x + 3, insp_y + 3, insp_x + insp_w - 3, insp_y + insp_h - 3], outline=(45, 42, 38, 255), width=1)
# Corner bronze brackets
for cx, cy in [(insp_x+2, insp_y+2), (insp_x+insp_w-6, insp_y+2), (insp_x+2, insp_y+insp_h-6), (insp_x+insp_w-6, insp_y+insp_h-6)]:
    draw.rectangle([cx, cy, cx+4, cy+4], fill=(180, 145, 75, 255))

# 6. Currency plaque at bottom right of right alcove
draw.rectangle([580, 465, 1085, 515], fill=(18, 18, 24, 230), outline=(75, 65, 50, 255), width=1)
draw.rectangle([582, 467, 1083, 513], outline=(35, 32, 28, 255), width=1)

# Save clean master backdrop
canvas.save('public/assets/ui/inventory/inventory_window_master.png')
print("Successfully generated clean master backdrop!")
