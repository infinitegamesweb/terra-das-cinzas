import cv2
import numpy as np
import os

os.makedirs('public/assets/ui/extracted/inventory', exist_ok=True)
os.makedirs('public/assets/ui/extracted/hud', exist_ok=True)
os.makedirs('public/assets/ui/extracted/buttons', exist_ok=True)
os.makedirs('public/assets/ui/extracted/frames', exist_ok=True)
os.makedirs('public/assets/ui/extracted/items', exist_ok=True)

def find_bg(img):
    corners = np.vstack([img[:10, :10], img[:10, -10:], img[-10:, :10], img[-10:, -10:]])
    return np.median(corners, axis=(0,1))

def save_clean_png(img, x, y, w, h, bg, out_path, pad=0, threshold=22):
    H, W = img.shape[:2]
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(W, x + w + pad)
    y2 = min(H, y + h + pad)
    
    crop = img[y1:y2, x1:x2].copy()
    diff = np.max(np.abs(crop.astype(float) - bg), axis=2)
    
    # Calculate smooth alpha
    alpha = np.clip((diff - 8) / float(threshold), 0, 1.0)
    # Post-process: any pixel clearly distinct from bg is solid 255
    alpha[diff > (threshold + 15)] = 1.0
    alpha = (alpha * 255.0).astype(np.uint8)
    
    b, g, r = cv2.split(crop)
    bgra = cv2.merge([b, g, r, alpha])
    cv2.imwrite(out_path, bgra)
    print(f"Saved: {out_path} ({w}x{h})")

# Load sheets
s1 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135.jpg')
bg1 = find_bg(s1)

s2 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135_2.jpg')
bg2 = find_bg(s2)

s3 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135_3.jpg')
bg3 = find_bg(s3)

s4 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135_4.jpg')
bg4 = find_bg(s4)

print("Extracting primary assets...")

# 1. Main Windows & Frames
save_clean_png(s1, 38, 11, 677, 365, bg1, 'public/assets/ui/extracted/inventory/char_sheet_double_arch.png')
save_clean_png(s1, 742, 31, 611, 112, bg1, 'public/assets/ui/extracted/frames/header_gothic_plaque.png')
save_clean_png(s1, 36, 391, 362, 360, bg1, 'public/assets/ui/extracted/inventory/grid_6x6_beveled.png')

# 2. Sheet 4 Inventory Windows & Grids
save_clean_png(s4, 526, 269, 274, 283, bg4, 'public/assets/ui/extracted/inventory/inventory_grid_empty_5x6.png')
save_clean_png(s4, 30, 294, 270, 222, bg4, 'public/assets/ui/extracted/inventory/inventory_grid_empty_4x5.png')
save_clean_png(s4, 715, 308, 628, 283, bg4, 'public/assets/ui/extracted/frames/gothic_ornate_window.png')
save_clean_png(s4, 568, 104, 105, 115, bg4, 'public/assets/ui/extracted/frames/demon_skull_window.png')
save_clean_png(s4, 715, 107, 121, 140, bg4, 'public/assets/ui/extracted/frames/archway_portal_window.png')

# 3. Sheet 2 Gargoyle Frame & HUD Bar
save_clean_png(s2, 570, 15, 197, 238, bg2, 'public/assets/ui/extracted/frames/gargoyle_demon_portrait.png')
save_clean_png(s2, 34, 297, 966, 142, bg2, 'public/assets/ui/extracted/hud/action_bar_hud_966x142.png')

# 4. Sheet 4 & 2 Life and Mana Orbs
save_clean_png(s4, 889, 617, 140, 129, bg4, 'public/assets/ui/extracted/hud/orb_life_ruby.png')
save_clean_png(s4, 1049, 617, 140, 129, bg4, 'public/assets/ui/extracted/hud/orb_mana_sapphire.png')
save_clean_png(s2, 600, 100, 50, 50, bg2, 'public/assets/ui/extracted/hud/orb_life_small.png')
save_clean_png(s2, 650, 100, 50, 50, bg2, 'public/assets/ui/extracted/hud/orb_mana_small.png')

# 5. Sheet 1 Health, Mana, XP Bars
save_clean_png(s1, 744, 424, 382, 78, bg1, 'public/assets/ui/extracted/hud/bar_health_skull.png')
save_clean_png(s1, 744, 512, 382, 80, bg1, 'public/assets/ui/extracted/hud/bar_mana_rune.png')
save_clean_png(s1, 753, 602, 363, 60, bg1, 'public/assets/ui/extracted/hud/bar_xp_filigree.png')

# 6. Sheet 1 Gothic Buttons (Default, Hover, Pressed)
save_clean_png(s1, 756, 253, 193, 70, bg1, 'public/assets/ui/extracted/buttons/btn_skills_default.png')
save_clean_png(s1, 950, 179, 193, 70, bg1, 'public/assets/ui/extracted/buttons/btn_skills_hover_glow.png')
save_clean_png(s1, 1144, 257, 199, 48, bg1, 'public/assets/ui/extracted/buttons/btn_inventory_default.png')
save_clean_png(s1, 1144, 323, 200, 48, bg1, 'public/assets/ui/extracted/buttons/btn_quests_default.png')
save_clean_png(s1, 1144, 389, 200, 48, bg1, 'public/assets/ui/extracted/buttons/btn_options_default.png')
save_clean_png(s1, 1144, 455, 200, 48, bg1, 'public/assets/ui/extracted/buttons/btn_play_default.png')
save_clean_png(s1, 1145, 530, 198, 48, bg1, 'public/assets/ui/extracted/buttons/btn_pressed.png')

# 7. Sheet 4 Diablo Style Buttons
save_clean_png(s4, 617, 490, 201, 46, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_quests.png')
save_clean_png(s4, 882, 490, 201, 47, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_options.png')
save_clean_png(s4, 1142, 490, 200, 47, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_login.png')
save_clean_png(s4, 617, 542, 201, 46, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_accept_glow.png')
save_clean_png(s4, 882, 542, 201, 47, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_skills_glow.png')
save_clean_png(s4, 1142, 542, 200, 47, bg4, 'public/assets/ui/extracted/buttons/btn_diablo_start_glow.png')

# 8. Sheet 1 Single Slot Frames & Silhouette Slots
save_clean_png(s1, 430, 489, 76, 76, bg1, 'public/assets/ui/extracted/inventory/slot_beveled_empty.png')
save_clean_png(s1, 520, 398, 76, 76, bg1, 'public/assets/ui/extracted/inventory/slot_helm_silhouette.png')
save_clean_png(s1, 430, 580, 76, 76, bg1, 'public/assets/ui/extracted/inventory/slot_armor_silhouette.png')
save_clean_png(s1, 520, 580, 76, 76, bg1, 'public/assets/ui/extracted/inventory/slot_weapon_silhouette.png')
save_clean_png(s1, 430, 670, 76, 76, bg1, 'public/assets/ui/extracted/inventory/slot_boots_silhouette.png')

# 9. Sheet 4 Badges (Skulls, Crossed Swords, Minimap)
save_clean_png(s4, 889, 617, 45, 45, bg4, 'public/assets/ui/extracted/hud/badge_skull_iron.png')
save_clean_png(s4, 715, 630, 45, 45, bg4, 'public/assets/ui/extracted/hud/badge_swords_crossed.png')
save_clean_png(s4, 1048, 632, 298, 111, bg4, 'public/assets/ui/extracted/hud/dual_gauges_diablo.png')

# 10. Sheet 3 Stats Card & Parchment
save_clean_png(s3, 454, 70, 241, 195, bg3, 'public/assets/ui/extracted/inventory/stats_card_plaque.png')
save_clean_png(s3, 710, 80, 500, 184, bg3, 'public/assets/ui/extracted/frames/parchment_quest_log.png')
save_clean_png(s3, 942, 397, 424, 197, bg3, 'public/assets/ui/extracted/hud/action_bar_with_orbs.png')

print("Extraction script completed successfully!")
