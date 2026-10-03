import cv2
import numpy as np
import os

s3 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135_3.jpg')
h, w = s3.shape[:2]
corners = np.vstack([s3[:10, :10], s3[:10, -10:], s3[-10:, :10], s3[-10:, -10:]])
bg = np.median(corners, axis=(0,1))
diff = np.max(np.abs(s3.astype(float) - bg), axis=2)

# Item area is approximately y: 640 to 768
items_zone = s3[640:768, :].copy()
zone_diff = diff[640:768, :]

# Threshold to find icons
mask = (zone_diff > 25).astype(np.uint8) * 255
# Morph close
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (4, 4))
mask_closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

contours, _ = cv2.findContours(mask_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

items = []
for c in contours:
    x, y, sw, sh = cv2.boundingRect(c)
    area = cv2.contourArea(c)
    # Icon sizes in Sheet 3 are typically 20x20 to 50x50
    if 18 <= sw <= 55 and 18 <= sh <= 55 and area > 150:
        items.append((x, y + 640, sw, sh))

# Sort items by row (Y) then column (X)
items.sort(key=lambda it: (it[1] // 30, it[0]))

print(f"Detected {len(items)} item icons in Sheet 3!")
os.makedirs('public/assets/ui/extracted/items', exist_ok=True)

for idx, (x, y, sw, sh) in enumerate(items, 1):
    crop = s3[y:y+sh, x:x+sw].copy()
    c_diff = np.max(np.abs(crop.astype(float) - bg), axis=2)
    alpha = np.clip((c_diff - 10) / 20.0, 0, 1.0)
    alpha[c_diff > 35] = 1.0
    alpha = (alpha * 255.0).astype(np.uint8)
    
    b, g, r = cv2.split(crop)
    bgra = cv2.merge([b, g, r, alpha])
    
    # Save 48x48 normalized icon
    bgra_resized = cv2.resize(bgra, (48, 48), interpolation=cv2.INTER_LANCZOS4)
    out_file = f'public/assets/ui/extracted/items/item_sprite_{idx:02d}.png'
    cv2.imwrite(out_file, bgra_resized)

print("All item sprites exported to public/assets/ui/extracted/items/")
