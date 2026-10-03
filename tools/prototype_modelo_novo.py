import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Load clean window modelo novo (1310 x 746)
base_img_path = 'public/assets/ui/inventory/window_modelo_novo_clean.png'
base = Image.open(base_img_path).convert('RGBA')
W, H = base.size
print(f"Canvas size: {W}x{H}")

draw = ImageDraw.Draw(base)

# Slot frame assets
slot_frame = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png').convert('RGBA')
slot_sz = 56
slot_sm = slot_frame.resize((slot_sz, slot_sz), Image.Resampling.LANCZOS)

# 1. Left Paperdoll: 9 slots
doll_slots = {
    'helm':   (217, 160),
    'armor':  (217, 250),
    'boots':  (217, 340),
    'weapon': (105, 250),
    'gloves': (105, 340),
    'ring1':  (105, 425),
    'shield': (325, 250),
    'amulet': (325, 340),
    'ring2':  (325, 425),
}

for name, (sx, sy) in doll_slots.items():
    base.paste(slot_sm, (sx, sy), slot_sm)

# Sample equipped icons
helm_it = Image.open('public/assets/items/dark_fantasy/helm_knight_visor.png').resize((46, 46), Image.Resampling.LANCZOS)
base.paste(helm_it, (222, 165), helm_it)

armor_it = Image.open('public/assets/items/dark_fantasy/armor_plate_spiked.png').resize((46, 46), Image.Resampling.LANCZOS)
base.paste(armor_it, (222, 255), armor_it)

sword_it = Image.open('public/assets/items/weapons/infernal_blade_64.png').resize((46, 46), Image.Resampling.LANCZOS)
base.paste(sword_it, (110, 255), sword_it)

amulet_it = Image.open('public/assets/items/dark_fantasy/amulet_ruby_medallion.png').resize((46, 46), Image.Resampling.LANCZOS)
base.paste(amulet_it, (330, 345), amulet_it)

# Silhouettes on empty slots
for name, (sx, sy) in [('shield', (325, 250)), ('boots', (217, 340)), ('gloves', (105, 340)), ('ring1', (105, 425)), ('ring2', (325, 425))]:
    sil_p = f'public/assets/ui/inventory/sil_{name}.png'
    if os.path.exists(sil_p):
        sil = Image.open(sil_p).convert('RGBA').resize((42, 42), Image.Resampling.LANCZOS)
        base.paste(sil, (sx + 7, sy + 7), sil)

# 2. Left Column Bottom: Combat Stats Plaque
stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png').convert('RGBA')
stats_w, stats_h = 340, 185
stats_resized = stats_plaque.resize((stats_w, stats_h), Image.Resampling.LANCZOS)
base.paste(stats_resized, (75, 495), stats_resized)

# 3. Center Column: Category Tabs
tab_default = Image.open('public/assets/ui/extracted/buttons/btn_inventory_default.png').convert('RGBA')
tab_active = Image.open('public/assets/ui/extracted/buttons/btn_skills_hover_glow.png').convert('RGBA')

tab_w, tab_h = 110, 36
tab_y = 155
tabs_x = [475, 590, 705, 820]
for idx, tx in enumerate(tabs_x):
    btn = tab_active if idx == 0 else tab_default
    b_res = btn.resize((tab_w, tab_h), Image.Resampling.LANCZOS)
    base.paste(b_res, (tx, tab_y), b_res)

# 4. Center Column: 5x5 Backpack Grid
grid_slot_sz = 64
gap = 14
grid_start_x = 485
grid_start_y = 215

grid_beveled = slot_frame.resize((grid_slot_sz, grid_slot_sz), Image.Resampling.LANCZOS)

sample_items = [
    'public/assets/items/dark_fantasy/potion_health_red.png',
    'public/assets/items/dark_fantasy/potion_arcane_purple.png',
    'public/assets/items/dark_fantasy/scroll_parchment.png',
    'public/assets/items/dark_fantasy/weapon_battle_axe.png',
    'public/assets/items/dark_fantasy/boots_greaves.png',
    'public/assets/items/dark_fantasy/gold_coins_stack.png',
    'public/assets/items/dark_fantasy/crystal_shadow_gem.png',
    'public/assets/items/dark_fantasy/potion_frost_blue.png',
    'public/assets/items/dark_fantasy/weapon_crimson_scythe.png',
    'public/assets/items/dark_fantasy/crown_golden_flame.png',
    'public/assets/items/dark_fantasy/amulet_golden_teardrop.png',
    'public/assets/items/dark_fantasy/chalice_holy_grail.png',
    'public/assets/items/dark_fantasy/skull_demon_ruby.png',
    'public/assets/items/dark_fantasy/relic_astrolabe_sun.png',
]

item_idx = 0
for r in range(5):
    for c in range(5):
        gx = grid_start_x + c * (grid_slot_sz + gap)
        gy = grid_start_y + r * (grid_slot_sz + gap)
        base.paste(grid_beveled, (gx, gy), grid_beveled)
        if item_idx < len(sample_items):
            it_img = Image.open(sample_items[item_idx]).convert('RGBA').resize((50, 50), Image.Resampling.LANCZOS)
            base.paste(it_img, (gx + 7, gy + 7), it_img)
            item_idx += 1

# 5. Center Column Bottom: Currency Plaque
curr_plaque = stats_plaque.resize((440, 60), Image.Resampling.LANCZOS)
base.paste(curr_plaque, (470, 630), curr_plaque)

gold_ico = Image.open('public/assets/items/dark_fantasy/gold_coins_stack.png').resize((36, 36), Image.Resampling.LANCZOS)
base.paste(gold_ico, (495, 642), gold_ico)

gem_ico = Image.open('public/assets/items/dark_fantasy/crystal_shadow_gem.png').resize((36, 36), Image.Resampling.LANCZOS)
base.paste(gem_ico, (685, 642), gem_ico)

# 6. Right Column: Item Inspector Panel
insp_x = 965
insp_y = 155
insp_w = 300
insp_h = 535

# Dark carved inspector panel
draw.rectangle([insp_x, insp_y, insp_x + insp_w, insp_y + insp_h], fill=(16, 16, 22, 220), outline=(85, 75, 55, 255), width=2)
draw.rectangle([insp_x + 3, insp_y + 3, insp_x + insp_w - 3, insp_y + insp_h - 3], outline=(40, 36, 30, 255), width=1)

# Large item preview socket
insp_box_sz = 90
box_x = insp_x + (insp_w - insp_box_sz) // 2
box_y = insp_y + 60
base.paste(slot_frame.resize((insp_box_sz, insp_box_sz), Image.Resampling.LANCZOS), (box_x, box_y), slot_frame.resize((insp_box_sz, insp_box_sz), Image.Resampling.LANCZOS))
sword_large = Image.open('public/assets/items/weapons/infernal_blade_64.png').resize((76, 76), Image.Resampling.LANCZOS)
base.paste(sword_large, (box_x + 7, box_y + 7), sword_large)

# Gothic action buttons at bottom of inspector
btn_equip = tab_active.resize((260, 42), Image.Resampling.LANCZOS)
base.paste(btn_equip, (insp_x + 20, insp_y + insp_h - 95), btn_equip)

btn_disc = tab_default.resize((260, 36), Image.Resampling.LANCZOS)
base.paste(btn_disc, (insp_x + 20, insp_y + insp_h - 48), btn_disc)

# Close button at top right
draw.rectangle([1245, 35, 1275, 65], fill=(120, 20, 20, 230), outline=(180, 50, 50, 255), width=2)

# Save test prototype to brain directory and preview
out_brain = 'C:/Users/jpdes/.gemini/antigravity-ide/brain/2a307a18-32ad-446f-bcb3-1b1e9b613309/modelo_novo_composite_preview.png'
base.save(out_brain)
print(f"Saved full composite preview to {out_brain}")
