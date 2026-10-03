import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# 1. Base clean window modelo novo (1310 x 746)
base = Image.open('public/assets/ui/inventory/window_modelo_novo_clean.png').convert('RGBA')
W, H = base.size
print(f"Base size: {W}x{H}")

draw = ImageDraw.Draw(base)

# 2. Add subtle dark fantasy alcove backdrops for the 3 columns:
# Left column (Paperdoll & Hero): x=60..425, y=148..695
# Center column (Tabs, Grid, Currencies): x=465..945, y=148..695
# Right column (Inspector): x=960..1275, y=148..695

def draw_ornate_alcove(img, x1, y1, x2, y2, fill_color=(12, 14, 18, 200), border_color=(60, 52, 42, 230), inner_border=(32, 28, 24, 255)):
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # Fill
    d.rectangle([x1, y1, x2, y2], fill=fill_color)
    # Outer carved border
    d.rectangle([x1, y1, x2, y2], outline=border_color, width=2)
    # Inner border
    d.rectangle([x1 + 3, y1 + 3, x2 - 3, y2 - 3], outline=inner_border, width=1)
    # Tiny golden/iron corner studs
    stud_color = (130, 105, 55, 230)
    for cx, cy in [(x1+2, y1+2), (x2-4, y1+2), (x1+2, y2-4), (x2-4, y2-4)]:
        d.rectangle([cx, cy, cx+2, cy+2], fill=stud_color)
    return Image.alpha_composite(img, overlay)

# Apply subtle dark panels:
# Left Column Alcove
base = draw_ornate_alcove(base, 62, 150, 425, 485, fill_color=(12, 15, 20, 180), border_color=(55, 48, 38, 220))

# Hero faint silhouette in the center of paperdoll alcove (x=185..305, y=200..440)
hero_sil_path = 'public/assets/ui/inventory/hero-silhouette.png'
try:
    sil_img = Image.open(hero_sil_path).convert('RGBA')
    sil_w, sil_h = 130, 240
    sil_resized = sil_img.resize((sil_w, sil_h), Image.Resampling.LANCZOS)
    # Soft opacity (25%)
    r, g, b, a = sil_resized.split()
    a = a.point(lambda p: int(p * 0.22))
    sil_soft = Image.merge('RGBA', (r, g, b, a))
    base.paste(sil_soft, (178, 205), sil_soft)
except Exception as e:
    print("Could not load hero silhouette:", e)

# Stats Plaque base texture at bottom-left: x=65, y=495, w=358, h=195
try:
    stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
    sp_res = stats_plaque.resize((360, 195), Image.Resampling.LANCZOS)
    base.paste(sp_res, (64, 495), sp_res)
except Exception as e:
    print("Could not paste stats plaque:", e)

# Center Column Grid Panel: x=470, y=204, x2=940, y2=620
base = draw_ornate_alcove(base, 470, 204, 940, 620, fill_color=(10, 12, 16, 210), border_color=(60, 50, 38, 220))

# Currency Plaque at bottom of Center Column: x=470, y=628, x2=940, y2=690
try:
    stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
    curr_res = stats_plaque.resize((470, 62), Image.Resampling.LANCZOS)
    base.paste(curr_res, (470, 628), curr_res)
except Exception as e:
    print("Could not paste currency plaque:", e)

# Right Column Inspector Alcove: x=960, y=150, x2=1275, y2=690
base = draw_ornate_alcove(base, 960, 150, 1275, 690, fill_color=(14, 15, 20, 220), border_color=(65, 55, 42, 230))

# Save master backdrop
master_path = 'public/assets/ui/inventory/inventory_window_master.png'
base.save(master_path)
print(f"Successfully saved master backdrop to {master_path}")
