import cv2
import numpy as np
from PIL import Image

def find_bg_color(img):
    corners = np.vstack([img[:12, :12], img[:12, -12:], img[-12:, :12], img[-12:, -12:]])
    return np.median(corners, axis=(0,1))

def extract_alpha_component(img, x, y, w, h, bg_color, threshold=24):
    crop = img[y:y+h, x:x+w]
    diff = np.max(np.abs(crop.astype(float) - bg_color), axis=2)
    # Smooth alpha mask
    alpha = np.clip((diff - 12) / float(threshold), 0, 1) * 255.0
    alpha = alpha.astype(np.uint8)
    
    # Merge BGRA
    b, g, r = cv2.split(crop)
    bgra = cv2.merge([b, g, r, alpha])
    return bgra

print("Checking sheets...")
for i, name in enumerate(['Dark_fantasy_MMORPG_GUI_asset_20261003163135.jpg',
                          'Dark_fantasy_MMORPG_GUI_asset_20261003163135_2.jpg',
                          'Dark_fantasy_MMORPG_GUI_asset_20261003163135_3.jpg',
                          'Dark_fantasy_MMORPG_GUI_asset_20261003163135_4.jpg'], 1):
    img = cv2.imread(name)
    bg = find_bg_color(img)
    print(f"Sheet {i} bg: {bg}")
