#!/usr/bin/env python3
"""
tools/extract_all_download5_assets.py
------------------------------------
Extrai, recorta, limpa transparência e organiza todos os assets de D:\\Game\\download (5)
em ícones padronizados (64x64 RGBA) para o jogo Terra das Cinzas:
- Armas do Clérigo (20 maças, cetros e martelos sagrados)
- Armas do Ladino (20 adagas, karambits e ferramentas de assassino)
- Armas do Arqueiro (20 arcos e bestas progressivos)
- Materiais de Forja e Coleta (84 minérios, barras, gemas e insumos)
- Poções e Orbes de Mana (20 frascos de alquimia e esferas místicas)
"""

import os
import shutil
from collections import deque
from PIL import Image
import numpy as np

BASE_RAW = r'D:\Game\download (5)'
OUT_ROOT = r'd:\Game\terra-das-cinzas\public\assets\items'

DIRS = {
    'maces': os.path.join(OUT_ROOT, 'weapons', 'maces'),
    'daggers': os.path.join(OUT_ROOT, 'weapons', 'daggers'),
    'bows': os.path.join(OUT_ROOT, 'weapons', 'bows'),
    'crafting': os.path.join(OUT_ROOT, 'crafting'),
    'potions': os.path.join(OUT_ROOT, 'potions'),
}

for d in DIRS.values():
    os.makedirs(d, exist_ok=True)

def isolate_largest_component(arr):
    alpha = arr[:, :, 3] > 0
    h, w = alpha.shape
    visited = np.zeros((h, w), dtype=bool)
    components = []

    for y in range(h):
        for x in range(w):
            if alpha[y, x] and not visited[y, x]:
                comp = []
                q = deque([(y, x)])
                visited[y, x] = True
                while q:
                    cy, cx = q.popleft()
                    comp.append((cy, cx))
                    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1),
                                   (cy-1, cx-1), (cy-1, cx+1), (cy+1, cx-1), (cy+1, cx+1)]:
                        if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                if len(comp) > 15:
                    components.append(comp)

    if not components:
        return arr

    largest = max(components, key=len)
    keep_mask = np.zeros((h, w), dtype=bool)
    for y, x in largest:
        keep_mask[y, x] = True

    # Keep any nearby components (e.g. bow strings, disconnected hilts)
    for comp in components:
        if comp is not largest and len(comp) > len(largest) * 0.05:
            for y, x in comp:
                keep_mask[y, x] = True

    arr[~keep_mask, 3] = 0
    return arr

def save_icon_64(img_rgba, out_path, padding=4):
    bbox = img_rgba.getbbox()
    if not bbox:
        return False
    cropped = img_rgba.crop(bbox)
    target_size = 64 - padding * 2
    scale = min(target_size / cropped.width, target_size / cropped.height)
    new_w = max(1, int(round(cropped.width * scale)))
    new_h = max(1, int(round(cropped.height * scale)))
    resized = cropped.resize((new_w, new_h), Image.Resampling.NEAREST)

    canvas = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    px = (64 - new_w) // 2
    py = (64 - new_h) // 2
    canvas.paste(resized, (px, py), resized)
    canvas.save(out_path)
    return True

# -------------------------------------------------------------
# 1. CLERIC WEAPONS (20 maces, scepters, hammers)
# -------------------------------------------------------------
def extract_cleric():
    src = os.path.join(BASE_RAW, 'download', 'Requesting_cleric_class_20261003111518.jpg')
    if not os.path.exists(src):
        print(f"Cleric sheet not found at {src}")
        return
    im = Image.open(src).convert('RGBA')
    arr = np.array(im)
    w, h = im.size
    cols, rows = 5, 4
    cw, ch = w / cols, h / rows

    count = 0
    for r in range(rows):
        for c in range(cols):
            count += 1
            x1, y1 = int(c * cw), int(r * ch)
            x2, y2 = int((c + 1) * cw), int((r + 1) * ch)
            cell = arr[y1:y2, x1:x2].copy()
            white = (cell[:, :, 0] > 232) & (cell[:, :, 1] > 232) & (cell[:, :, 2] > 232)
            cell[white, 3] = 0
            cell = isolate_largest_component(cell)
            out_img = Image.fromarray(cell)
            fn = f"mace_cleric_{count:02d}.png"
            dest = os.path.join(DIRS['maces'], fn)
            save_icon_64(out_img, dest)
    print(f"Extracted {count} Cleric weapons -> {DIRS['maces']}")

# -------------------------------------------------------------
# 2. ROGUE WEAPONS & GEAR (20 daggers, karambits, tools)
# -------------------------------------------------------------
def extract_rogue():
    src = os.path.join(BASE_RAW, 'download', 'agora_quero_assets_em_32x32_20261003111348.jpg')
    if not os.path.exists(src):
        print(f"Rogue sheet not found at {src}")
        return
    im = Image.open(src).convert('RGBA')
    arr = np.array(im)
    w, h = im.size
    cols, rows = 5, 4
    cw, ch = w / cols, h / rows

    count = 0
    for r in range(rows):
        for c in range(cols):
            count += 1
            x1, y1 = int(c * cw), int(r * ch)
            x2, y2 = int((c + 1) * cw), int((r + 1) * ch)
            cell = arr[y1:y2, x1:x2].copy()
            white = (cell[:, :, 0] > 232) & (cell[:, :, 1] > 232) & (cell[:, :, 2] > 232)
            cell[white, 3] = 0
            cell = isolate_largest_component(cell)
            out_img = Image.fromarray(cell)
            fn = f"dagger_rogue_{count:02d}.png"
            dest = os.path.join(DIRS['daggers'], fn)
            save_icon_64(out_img, dest)
    print(f"Extracted {count} Rogue weapons/tools -> {DIRS['daggers']}")

# -------------------------------------------------------------
# 3. ARCHER BOWS (20 bows & crossbows)
# -------------------------------------------------------------
def extract_bows():
    sources = [
        ('Creating_archer_equipment_assets_2K_20261003110110.jpg', 5, 4, 180),
        ('Create_pixel_art_archer_bows_20261003110848.jpg', 4, 3, 230),
        ('Create_pixel_art_bows_20261003110905.jpg', 4, 3, 230),
        ('Create_bows_for_archer_20261003110919.jpg', 4, 3, 230),
    ]
    extracted = []
    for file_name, cols, rows, thresh in sources:
        src = os.path.join(BASE_RAW, 'download', file_name)
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert('RGBA')
        arr = np.array(im)
        w, h = im.size
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                x1, y1 = int(c * cw), int(r * ch)
                x2, y2 = int((c + 1) * cw), int((r + 1) * ch)
                cell = arr[y1:y2, x1:x2].copy()
                bg_mask = (cell[:, :, 0] > thresh) & (cell[:, :, 1] > thresh) & (cell[:, :, 2] > thresh)
                cell[bg_mask, 3] = 0
                cell = isolate_largest_component(cell)
                out_img = Image.fromarray(cell)
                bbox = out_img.getbbox()
                if bbox and (bbox[2] - bbox[0] > 18) and (bbox[3] - bbox[1] > 18):
                    extracted.append(out_img)
                if len(extracted) >= 20:
                    break
            if len(extracted) >= 20:
                break
        if len(extracted) >= 20:
            break

    for idx, img in enumerate(extracted[:20], 1):
        fn = f"bow_archer_{idx:02d}.png"
        dest = os.path.join(DIRS['bows'], fn)
        save_icon_64(img, dest)
    print(f"Extracted {min(len(extracted), 20)} Archer bows -> {DIRS['bows']}")

# -------------------------------------------------------------
# 4. CRAFTING MATERIALS (84 items)
# -------------------------------------------------------------
def extract_crafting():
    src = os.path.join(BASE_RAW, 'Requesting_game_craft_materials_2K_20261003181350.jpg')
    if not os.path.exists(src):
        print(f"Crafting sheet not found at {src}")
        return
    im = Image.open(src)
    r_lines = [159, 347, 539, 733, 919, 1108, 1295, 1481]
    c_lines = [59, 246, 432, 623, 809, 1000, 1186, 1375, 1565, 1751, 1942, 2128, 2318, 2505, 2693]

    count = 0
    for r in range(len(r_lines) - 1):
        for c in range(len(c_lines) - 1):
            count += 1
            y1, y2 = r_lines[r], r_lines[r+1]
            x1, x2 = c_lines[c], c_lines[c+1]
            inner = im.crop((x1+22, y1+22, x2-22, y2-22)).convert('RGBA')
            arr = np.array(inner)
            h, w, _ = arr.shape
            bg_color = np.median(arr[:5, :5, :3], axis=(0,1))

            visited = np.zeros((h, w), dtype=bool)
            q = deque()
            for x in range(w):
                q.append((0, x))
                q.append((h-1, x))
            for y in range(h):
                q.append((y, 0))
                q.append((y, w-1))

            while q:
                cy, cx = q.popleft()
                if visited[cy, cx]:
                    continue
                visited[cy, cx] = True
                color = arr[cy, cx, :3]
                dist = np.linalg.norm(color - bg_color)
                if dist < 24:
                    arr[cy, cx, 3] = 0
                    for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
                        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                            q.append((ny, nx))

            out_img = Image.fromarray(arr)
            fn = f"craft_mat_{count:02d}.png"
            dest = os.path.join(DIRS['crafting'], fn)
            save_icon_64(out_img, dest)
    print(f"Extracted {count} Crafting materials -> {DIRS['crafting']}")

# -------------------------------------------------------------
# 5. POTIONS & MANA ORBS (20 items)
# -------------------------------------------------------------
def extract_potions():
    potions = []
    for suffix in ['', '_2', '_3', '_4']:
        src = os.path.join(BASE_RAW, f'crie_assets_e_sprties_de_20261003182713{suffix}.jpg')
        if not os.path.exists(src):
            continue
        im = Image.open(src).convert('RGBA')
        w, h = im.size
        cols, rows = 5, 4
        cw, ch = w / cols, h / rows
        for r in range(rows):
            for c in range(cols):
                x1, y1 = int(c * cw), int(r * ch)
                x2, y2 = int((c + 1) * cw), int((r + 1) * ch)
                inner = im.crop((x1+16, y1+16, x2-16, y2-16))
                arr = np.array(inner)
                ih, iw, _ = arr.shape
                bg_color = np.median(arr[:5, :5, :3], axis=(0,1))
                visited = np.zeros((ih, iw), dtype=bool)
                q = deque()
                for x in range(iw):
                    q.append((0, x))
                    q.append((ih-1, x))
                for y in range(ih):
                    q.append((y, 0))
                    q.append((y, iw-1))

                while q:
                    cy, cx = q.popleft()
                    if visited[cy, cx]:
                        continue
                    visited[cy, cx] = True
                    color = arr[cy, cx, :3]
                    dist = np.linalg.norm(color - bg_color)
                    if dist < 22:
                        arr[cy, cx, 3] = 0
                        for ny, nx in [(cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)]:
                            if 0 <= ny < ih and 0 <= nx < iw and not visited[ny, nx]:
                                q.append((ny, nx))

                out_img = Image.fromarray(arr)
                bbox = out_img.getbbox()
                if bbox and (bbox[2] - bbox[0] > 18) and (bbox[3] - bbox[1] > 18):
                    potions.append(out_img)
                if len(potions) >= 20:
                    break
            if len(potions) >= 20:
                break
        if len(potions) >= 20:
            break

    for idx, img in enumerate(potions[:20], 1):
        fn = f"potion_asset_{idx:02d}.png"
        dest = os.path.join(DIRS['potions'], fn)
        save_icon_64(img, dest)
    print(f"Extracted {min(len(potions), 20)} Potions & Orbs -> {DIRS['potions']}")

if __name__ == '__main__':
    print("Iniciando extração completa de assets...")
    extract_cleric()
    extract_rogue()
    extract_bows()
    extract_crafting()
    extract_potions()
    print("Processamento concluído com sucesso!")
