import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Canvas 1000 x 620 dark gothic window
W, H = 1040, 640
canvas = Image.new('RGBA', (W, H), (12, 12, 16, 250))
draw = ImageDraw.Draw(canvas)

# Let's load the double arch or modular frames
# Double arch scaled to header or backdrop
arch = Image.open('public/assets/ui/extracted/inventory/char_sheet_double_arch.png')
# Grid 5x6
grid5x6 = Image.open('public/assets/ui/extracted/inventory/inventory_grid_empty_5x6.png')
# Grid 6x6
grid6x6 = Image.open('public/assets/ui/extracted/inventory/grid_6x6_beveled.png')
# Stats plaque
stats_plaque = Image.open('public/assets/ui/extracted/inventory/stats_card_plaque.png')
# Header plaque
hdr = Image.open('public/assets/ui/extracted/frames/header_gothic_plaque.png')
# Buttons
btn_inv = Image.open('public/assets/ui/extracted/buttons/btn_inventory_default.png')
btn_hover = Image.open('public/assets/ui/extracted/buttons/btn_skills_hover_glow.png')
btn_pressed = Image.open('public/assets/ui/extracted/buttons/btn_pressed.png')
# Beveled slot
slot_empty = Image.open('public/assets/ui/extracted/inventory/slot_beveled_empty.png')
# Silhouettes
slot_helm = Image.open('public/assets/ui/extracted/inventory/slot_helm_silhouette.png')
slot_armor = Image.open('public/assets/ui/extracted/inventory/slot_armor_silhouette.png')
slot_weapon = Image.open('public/assets/ui/extracted/inventory/slot_weapon_silhouette.png')
slot_boots = Image.open('public/assets/ui/extracted/inventory/slot_boots_silhouette.png')

# Gold & Crystal
gold_coin = Image.open('public/assets/items/dark_fantasy/gold_coins_stack.png')
crystal_gem = Image.open('public/assets/items/dark_fantasy/crystal_shadow_gem.png')

print("Loaded all assets for layout test!")
