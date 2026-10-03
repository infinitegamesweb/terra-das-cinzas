import cv2
import numpy as np

img = cv2.imread('public/assets/ui/Modelo novo.png', cv2.IMREAD_UNCHANGED)
h, w, c = img.shape
print(f"Original Modelo novo: {w}x{h}, channels={c}")

# Let's clean the white border:
# White pixels have r,g,b > 240
b, g, r, a = cv2.split(img)
is_white = (r > 240) & (g > 240) & (b > 240)

# Create crisp alpha mask:
# If a pixel was already transparent (a < 50) or is_white, alpha = 0
new_a = a.copy()
new_a[is_white] = 0

# Find bounding box of non-zero alpha
ys, xs = np.where(new_a > 10)
x1, x2 = xs.min(), xs.max()
y1, y2 = ys.min(), ys.max()

print(f"Cropped bounds: x={x1}..{x2} (w={x2-x1+1}), y={y1}..{y2} (h={y2-y1+1})")

clean_crop = cv2.merge([b[y1:y2+1, x1:x2+1],
                        g[y1:y2+1, x1:x2+1],
                        r[y1:y2+1, x1:x2+1],
                        new_a[y1:y2+1, x1:x2+1]])

cv2.imwrite('public/assets/ui/inventory/window_modelo_novo_clean.png', clean_crop)
print("Saved clean crop to public/assets/ui/inventory/window_modelo_novo_clean.png")
