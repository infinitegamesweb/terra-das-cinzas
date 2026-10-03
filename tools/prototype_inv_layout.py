import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1160, 640
base = Image.open('public/assets/ui/preview/test_composite_v1.png').convert('RGBA')
draw = ImageDraw.Draw(base)

# Load UI assets
slot_frame = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png').convert('RGBA')
slot_frame_sm = slot_frame.resize((48, 48), Image.Resampling.LANCZOS)

# 1. Left Alcove: Equipment Slots (9 slots)
# Center x is around 295
# Helm
base.paste(slot_frame_sm, (271, 155), slot_frame_sm)
# Armor
base.paste(slot_frame_sm, (271, 220), slot_frame_sm)
# Weapon (left)
base.paste(slot_frame_sm, (140, 220), slot_frame_sm)
# Shield (right)
base.paste(slot_frame_sm, (400, 220), slot_frame_sm)
# Gloves (left)
base.paste(slot_frame_sm, (140, 290), slot_frame_sm)
# Boots (center)
base.paste(slot_frame_sm, (271, 290), slot_frame_sm)
# Amulet (right)
base.paste(slot_frame_sm, (400, 290), slot_frame_sm)
# Ring 1
base.paste(slot_frame_sm, (180, 360), slot_frame_sm)
# Ring 2
base.paste(slot_frame_sm, (360, 360), slot_frame_sm)

# Sample equipped items
helm_item = Image.open('public/assets/items/dark_fantasy/helm_knight_visor.png').resize((40, 40), Image.Resampling.LANCZOS)
base.paste(helm_item, (275, 159), helm_item)

armor_item = Image.open('public/assets/items/dark_fantasy/armor_plate_spiked.png').resize((40, 40), Image.Resampling.LANCZOS)
base.paste(armor_item, (275, 224), armor_item)

sword_item = Image.open('public/assets/items/weapons/infernal_blade_64.png').resize((40, 40), Image.Resampling.LANCZOS)
base.paste(sword_item, (144, 224), sword_item)

shield_item = Image.open('public/assets/items/dark_fantasy/amulet_ruby_medallion.png').resize((40, 40), Image.Resampling.LANCZOS)
base.paste(shield_item, (404, 224), shield_item)

# 2. Left Alcove Bottom: Combat Stats Plaque
stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
stats_sm = stats_plaque.resize((430, 140), Image.Resampling.LANCZOS)
base.paste(stats_sm, (80, 435), stats_sm)

# 3. Right Alcove: Top Category Tabs
tab_btn = Image.open('public/assets/ui/extracted/buttons/btn_inventory_default.png').convert('RGBA')
tab_active = Image.open('public/assets/ui/extracted/buttons/btn_skills_hover_glow.png').convert('RGBA')

tab_w, tab_h = 105, 32
t1 = tab_active.resize((tab_w, tab_h), Image.Resampling.LANCZOS)
t2 = tab_btn.resize((tab_w, tab_h), Image.Resampling.LANCZOS)
t3 = tab_btn.resize((tab_w, tab_h), Image.Resampling.LANCZOS)
t4 = tab_btn.resize((tab_w, tab_h), Image.Resampling.LANCZOS)

tab_y = 145
base.paste(t1, (640, tab_y), t1)
base.paste(t2, (750, tab_y), t2)
base.paste(t3, (860, tab_y), t3)
base.paste(t4, (970, tab_y), t4)

# 4. Right Alcove: Grid of 5x5 Slots (25 slots) on Left side of Right Alcove
grid_start_x = 640
grid_start_y = 195
slot_sz = 44
gap = 4

for r in range(5):
    for c in range(5):
        sx = grid_start_x + c * (slot_sz + gap)
        sy = grid_start_y + r * (slot_sz + gap)
        s_box = slot_frame.resize((slot_sz, slot_sz), Image.Resampling.LANCZOS)
        base.paste(s_box, (sx, sy), s_box)

# 5. Right Alcove: Item Inspector on Right side of Right Alcove
insp_x = 885
insp_y = 195
insp_w = 195
insp_h = 240
# Dark ornate panel for inspector
draw.rectangle([insp_x, insp_y, insp_x + insp_w, insp_y + insp_h], fill=(20, 20, 25, 230), outline=(80, 70, 55, 255), width=2)

# Action button inside inspector
btn_act = tab_active.resize((175, 36), Image.Resampling.LANCZOS)
base.paste(btn_act, (insp_x + 10, insp_y + insp_h - 45), btn_act)

# Currencies at bottom right
gold = Image.open('public/assets/items/dark_fantasy/gold_coins_stack.png').resize((28, 28), Image.Resampling.LANCZOS)
base.paste(gold, (645, 455), gold)

cryst = Image.open('public/assets/items/dark_fantasy/crystal_shadow_gem.png').resize((28, 28), Image.Resampling.LANCZOS)
base.paste(cryst, (800, 455), cryst)

base.save('public/assets/ui/preview/inventory_full_preview.png')
print("Generated inventory_full_preview.png!")
