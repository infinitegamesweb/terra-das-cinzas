import glob
import os
from PIL import Image

sprites = sorted(glob.glob('public/assets/ui/extracted/items/*.png'))
cols = 10
rows = (len(sprites) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * 56, rows * 56), (30, 30, 35, 255))

for idx, sp in enumerate(sprites):
    im = Image.open(sp)
    c = idx % cols
    r = idx // cols
    sheet.paste(im, (c * 56 + 4, r * 56 + 4), im)

sheet.save('public/assets/ui/preview/extracted_items_sheet.png')
print("Saved items sheet:", len(sprites), "sprites")
