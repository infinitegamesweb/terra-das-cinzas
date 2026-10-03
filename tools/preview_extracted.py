import os
import cv2
import numpy as np
from PIL import Image

files = [
    'public/assets/ui/extracted/inventory/char_sheet_double_arch.png',
    'public/assets/ui/extracted/frames/header_gothic_plaque.png',
    'public/assets/ui/extracted/inventory/grid_6x6_beveled.png',
    'public/assets/ui/extracted/inventory/inventory_grid_empty_5x6.png',
    'public/assets/ui/extracted/frames/gothic_ornate_window.png',
    'public/assets/ui/extracted/frames/gargoyle_demon_portrait.png',
    'public/assets/ui/extracted/hud/orb_life_ruby.png',
    'public/assets/ui/extracted/hud/orb_mana_sapphire.png',
    'public/assets/ui/extracted/hud/bar_health_skull.png',
    'public/assets/ui/extracted/hud/bar_mana_rune.png',
    'public/assets/ui/extracted/hud/bar_xp_filigree.png',
    'public/assets/ui/extracted/buttons/btn_inventory_default.png',
    'public/assets/ui/extracted/buttons/btn_skills_hover_glow.png',
    'public/assets/ui/extracted/buttons/btn_pressed.png',
    'public/assets/ui/extracted/inventory/slot_beveled_empty.png',
    'public/assets/ui/extracted/inventory/stats_card_plaque.png',
]

# Create a dark background board to paste and preview all extracted components
board = Image.new('RGBA', (1200, 900), (20, 20, 25, 255))

# Let's paste double arch top left
arch = Image.open('public/assets/ui/extracted/inventory/char_sheet_double_arch.png')
board.paste(arch, (20, 20), arch)

# Header plaque
hdr = Image.open('public/assets/ui/extracted/frames/header_gothic_plaque.png')
board.paste(hdr, (710, 20), hdr)

# Grid 6x6
g6 = Image.open('public/assets/ui/extracted/inventory/grid_6x6_beveled.png')
board.paste(g6, (20, 400), g6)

# Stats plaque
st = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png')
board.paste(st, (400, 400), st)

# Orbs
orb1 = Image.open('public/assets/ui/extracted/hud/orb_life_ruby.png')
board.paste(orb1, (660, 400), orb1)

orb2 = Image.open('public/assets/ui/extracted/hud/orb_mana_sapphire.png')
board.paste(orb2, (810, 400), orb2)

# Bars
hb = Image.open('public/assets/ui/extracted/hud/bar_health_skull.png')
board.paste(hb, (660, 540), hb)

mb = Image.open('public/assets/ui/extracted/hud/bar_mana_rune.png')
board.paste(mb, (660, 630), mb)

# Buttons
b1 = Image.open('public/assets/ui/extracted/buttons/btn_inventory_default.png')
board.paste(b1, (660, 720), b1)

b2 = Image.open('public/assets/ui/extracted/buttons/btn_skills_hover_glow.png')
b2_sm = b2.resize((199, 48), Image.Resampling.LANCZOS)
board.paste(b2_sm, (880, 720), b2_sm)

# Save test board
os.makedirs('public/assets/ui/preview', exist_ok=True)
board.save('public/assets/ui/preview/extracted_assets_board.png')
print("Extracted preview saved to public/assets/ui/preview/extracted_assets_board.png")
