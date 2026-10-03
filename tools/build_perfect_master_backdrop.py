import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

base = Image.open('public/assets/ui/inventory/window_modelo_novo_clean.png').convert('RGBA')
W, H = base.size
print(f"Canvas size: {W}x{H}")

# Helper: Draw gothic ornate carved panel with double stroke & studs
def draw_panel(canvas, x1, y1, x2, y2, fill_bg=(11, 13, 17, 220), outer_border=(70, 60, 45, 255), inner_border=(35, 30, 24, 255)):
    overlay = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # Fill
    d.rectangle([x1, y1, x2, y2], fill=fill_bg)
    # Outer border
    d.rectangle([x1, y1, x2, y2], outline=outer_border, width=2)
    # Inner inset line
    d.rectangle([x1 + 3, y1 + 3, x2 - 3, y2 - 3], outline=inner_border, width=1)
    # Golden / Iron corner studs
    stud = (155, 125, 65, 255)
    for cx, cy in [(x1+2, y1+2), (x2-4, y1+2), (x1+2, y2-4), (x2-4, y2-4)]:
        d.rectangle([cx, cy, cx+2, cy+2], fill=stud)
    return Image.alpha_composite(canvas, overlay)

# 1. Left Paperdoll Panel
base = draw_panel(base, 62, 148, 428, 482, fill_bg=(11, 13, 17, 215))

# Soft Hero Silhouette in Paperdoll center
sil_path = 'public/assets/ui/inventory/hero-silhouette-clean.png'
if os.path.exists(sil_path):
    sil = Image.open(sil_path).convert('RGBA')
    sil_w, sil_h = 100, 245
    sil_res = sil.resize((sil_w, sil_h), Image.Resampling.LANCZOS)
    r, g, b, a = sil_res.split()
    # Soft opacity (30%)
    a = a.point(lambda p: int(p * 0.35))
    sil_soft = Image.merge('RGBA', (r, g, b, a))
    base.paste(sil_soft, (195, 185), sil_soft)

# Slot frame for pre-stamping sockets
slot_frame = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png').convert('RGBA')
slot_sz = 56
slot_sm = slot_frame.resize((slot_sz, slot_sz), Image.Resampling.LANCZOS)

doll_slots = {
    'helm':   (217, 160),
    'armor':  (217, 248),
    'boots':  (217, 336),
    'weapon': (105, 248),
    'gloves': (105, 336),
    'ring1':  (105, 416),
    'shield': (329, 248),
    'amulet': (329, 336),
    'ring2':  (329, 416),
}

for name, (sx, sy) in doll_slots.items():
    base.paste(slot_sm, (sx, sy), slot_sm)

# 2. Combat Stats Plaque (Left Bottom)
base = draw_panel(base, 62, 492, 428, 694, fill_bg=(9, 11, 15, 235), outer_border=(75, 65, 50, 255))

# Header divider inside stats panel
d = ImageDraw.Draw(base)
d.line([(70, 526), (420, 526)], fill=(50, 42, 32, 255), width=1)
d.line([(70, 527), (420, 527)], fill=(20, 18, 14, 255), width=1)

# 3. Center Column: Grid Panel (x=468..942, y=204..618)
base = draw_panel(base, 468, 204, 942, 618, fill_bg=(9, 11, 15, 220))

# Pre-stamp 5x5 Grid Sockets
grid_slot_sz = 64
gap = 14
grid_start_x = 517
grid_start_y = 223
grid_beveled = slot_frame.resize((grid_slot_sz, grid_slot_sz), Image.Resampling.LANCZOS)

for r in range(5):
    for c in range(5):
        gx = grid_start_x + c * (grid_slot_sz + gap)
        gy = grid_start_y + r * (grid_slot_sz + gap)
        base.paste(grid_beveled, (gx, gy), grid_beveled)

# 4. Center Column: Currency Plaque (x=468..942, y=626..694)
base = draw_panel(base, 468, 626, 942, 694, fill_bg=(12, 14, 18, 240), outer_border=(80, 68, 50, 255))

# 5. Right Column: Inspector Panel (x=962..1278, y=148..694)
base = draw_panel(base, 962, 148, 1278, 694, fill_bg=(13, 14, 18, 230), outer_border=(75, 65, 48, 255))

# Large item preview socket at top of inspector
insp_box_sz = 88
ib_x = 962 + (1278 - 962 - insp_box_sz) // 2
ib_y = 195
base.paste(slot_frame.resize((insp_box_sz, insp_box_sz), Image.Resampling.LANCZOS), (ib_x, ib_y), slot_frame.resize((insp_box_sz, insp_box_sz), Image.Resampling.LANCZOS))

# Divider lines inside inspector
d = ImageDraw.Draw(base)
d.line([(975, 305), (1265, 305)], fill=(55, 46, 35, 255), width=1)
d.line([(975, 445), (1265, 445)], fill=(55, 46, 35, 255), width=1)
d.line([(975, 595), (1265, 595)], fill=(55, 46, 35, 255), width=1)

# Save master backdrop
master_path = 'public/assets/ui/inventory/inventory_window_master.png'
base.save(master_path)
print(f"Master backdrop cleanly saved to {master_path}")

# Also save a preview in brain
preview = base.resize((655, 373), Image.Resampling.LANCZOS)
preview.save('C:/Users/jpdes/.gemini/antigravity-ide/brain/2a307a18-32ad-446f-bcb3-1b1e9b613309/master_clean_perfect_preview.png')
print("Saved master preview to artifacts dir")
