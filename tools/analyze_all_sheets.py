import cv2
import numpy as np
from PIL import Image

def analyze_sheet(path, name):
    print(f"\n==================== {name} ({path}) ====================")
    img = cv2.imread(path)
    h, w, c = img.shape
    corners = np.vstack([img[:10, :10], img[:10, -10:], img[-10:, :10], img[-10:, -10:]])
    bg = np.median(corners, axis=(0,1))
    diff = np.max(np.abs(img.astype(float) - bg), axis=2)
    mask = (diff > 25).astype(np.uint8) * 255
    
    # Let's find contours
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (12, 12))
    closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = [cv2.boundingRect(c) for c in contours if cv2.contourArea(c) > 400]
    boxes.sort(key=lambda b: (b[1], b[0]))
    
    print(f"Found {len(boxes)} major visual components:")
    for i, (bx, by, bw, bh) in enumerate(boxes, 1):
        crop = img[by:by+bh, bx:bx+bw]
        mean_bgr = np.mean(crop, axis=(0,1))
        # Detect aspect ratio and likely role
        ratio = bw / bh
        role = "panel"
        if ratio > 4.0:
            role = "wide bar / banner / header"
        elif ratio > 2.0:
            role = "button / horizontal box"
        elif 0.8 <= ratio <= 1.25 and bw < 120:
            role = "slot / icon / orb"
        elif bw > 500 and bh > 250:
            role = "FULL WINDOW / DIALOG / INVENTORY CONTAINER"
        elif bh > 200 and bw < 300:
            role = "vertical card / character preview / list"
        
        print(f"  [{i:02d}] x={bx:4d}, y={by:4d}, w={bw:4d}, h={bh:4d} | ratio={ratio:4.2f} | role: {role}")

analyze_sheet('Dark_fantasy_MMORPG_GUI_asset_20261003163135.jpg', 'Image 1')
analyze_sheet('Dark_fantasy_MMORPG_GUI_asset_20261003163135_2.jpg', 'Image 2')
analyze_sheet('Dark_fantasy_MMORPG_GUI_asset_20261003163135_3.jpg', 'Image 3')
analyze_sheet('Dark_fantasy_MMORPG_GUI_asset_20261003163135_4.jpg', 'Image 4')
