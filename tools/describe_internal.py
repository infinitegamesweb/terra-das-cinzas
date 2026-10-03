import os
import cv2
import numpy as np

def describe_internal(image_path):
    print(f"\n--- Internal Analysis of {os.path.basename(image_path)} ---")
    img = cv2.imread(image_path)
    if img is None:
        print("Could not load image")
        return
    h, w, c = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Check edges
    edges = cv2.Canny(gray, 50, 150)
    # Find internal rectangular contours
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter for sub-rectangles like slots or buttons
    sub_rects = []
    for c in contours:
        x, y, sw, sh = cv2.boundingRect(c)
        if 25 <= sw <= 120 and 25 <= sh <= 120 and abs(sw - sh) <= 15:
            # likely a slot!
            sub_rects.append((x, y, sw, sh))
    
    # Deduplicate close rects
    filtered_slots = []
    for r in sub_rects:
        if not any(abs(r[0] - f[0]) < 10 and abs(r[1] - f[1]) < 10 for f in filtered_slots):
            filtered_slots.append(r)
    
    print(f"Dimensions: {w}x{h}")
    print(f"Detected square slot-like regions: {len(filtered_slots)}")
    if filtered_slots:
        filtered_slots.sort(key=lambda s: (s[1]//20, s[0]))
        for i, s in enumerate(filtered_slots[:15], 1):
            print(f"  Slot {i:02d}: x={s[0]:3d}, y={s[1]:3d}, w={s[2]:2d}, h={s[3]:2d}")

describe_internal('public/assets/ui/preview/cuts/img1_cut01_677x365_at_37_10.png')
describe_internal('public/assets/ui/preview/cuts/img1_cut04_362x360_at_35_390.png')
describe_internal('public/assets/ui/preview/cuts/img2_cut07_966x142_at_33_296.png')
describe_internal('public/assets/ui/preview/cuts/img3_cut02_1350x526_at_15_67.png')
describe_internal('public/assets/ui/preview/cuts/img4_cut11_776x283_at_566_307.png')
describe_internal('public/assets/ui/new_gui/asset_img4_elem09.png')
