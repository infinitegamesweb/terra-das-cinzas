import cv2
import numpy as np

s1 = cv2.imread('Dark_fantasy_MMORPG_GUI_asset_20261003163135.jpg')
corners = np.vstack([s1[:10, :10], s1[:10, -10:], s1[-10:, :10], s1[-10:, -10:]])
bg = np.median(corners, axis=(0,1))

def save_slot(x, y, name):
    crop = s1[y:y+76, x:x+76].copy()
    diff = np.max(np.abs(crop.astype(float) - bg), axis=2)
    alpha = np.clip((diff - 8) / 20.0, 0, 1.0)
    alpha[diff > 35] = 1.0
    alpha = (alpha * 255.0).astype(np.uint8)
    b, g, r = cv2.split(crop)
    bgra = cv2.merge([b, g, r, alpha])
    cv2.imwrite(f'public/assets/ui/extracted/inventory/sil_{name}.png', bgra)
    print(f"Saved sil_{name}.png")

# Let's crop the grid of silhouettes in Sheet 1:
# Row 0:
save_slot(520, 398, 'helm')
save_slot(430, 488, 'armor')
save_slot(520, 488, 'gloves')
save_slot(610, 488, 'shield')
save_slot(430, 580, 'weapon')
save_slot(520, 580, 'boots')
save_slot(610, 580, 'ring1')
save_slot(430, 670, 'ring2')
save_slot(520, 670, 'amulet')
save_slot(610, 670, 'belt')
print("All silhouettes saved!")
