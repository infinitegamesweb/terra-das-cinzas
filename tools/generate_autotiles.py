"""
Script para geração de tilesets modulares em pixel art 16-bit autotile 32x32px (matriz 6x5 = 30 tiles)
para Guerra das Cinzas.
Dimensões da folha: 192x160px (6 colunas x 5 linhas de 32x32px).
Encaixe perfeito (seamless), perspectiva top-down, agrupamentos de pixels nítidos e iluminação consistente.

Tilesets gerados:
1. public/assets/maps/tilesets/autotile_grass_forest_32.png (Floresta Encantada, grama, terra, flores silvestres, rochas com musgo)
2. public/assets/maps/tilesets/autotile_water_swamp_32.png (Água cristalina / pântano e margem de terra)
3. public/assets/maps/tilesets/autotile_lava_volcano_32.png (Magma incandescente e bordas de basalto escuro)
4. public/assets/maps/tilesets/autotile_stone_dungeon_32.png (Lajes de masmorra e calçada de pedra antiga)
5. public/assets/maps/tilesets/autotile_rules.json (Mapeamento das 30 regras topológicas)
"""
import os
import json
import math
from PIL import Image

TILE_SIZE = 32
COLS = 6
ROWS = 5
SHEET_W = COLS * TILE_SIZE  # 192px
SHEET_H = ROWS * TILE_SIZE  # 160px

TILE_MAP_30 = [
    # Linha 0
    {"col": 0, "row": 0, "name": "center_full"},
    {"col": 1, "row": 0, "name": "cut_sw"},
    {"col": 2, "row": 0, "name": "edge_s"},
    {"col": 3, "row": 0, "name": "cut_se"},
    {"col": 4, "row": 0, "name": "t_south"},
    {"col": 5, "row": 0, "name": "edge_e"},

    # Linha 1
    {"col": 0, "row": 1, "name": "edge_s_long"},
    {"col": 1, "row": 1, "name": "corner_inner_se"},
    {"col": 2, "row": 1, "name": "cut_ne"},
    {"col": 3, "row": 1, "name": "corner_inner_sw"},
    {"col": 4, "row": 1, "name": "corridor_h"},
    {"col": 5, "row": 1, "name": "corner_outer_se"},

    # Linha 2
    {"col": 0, "row": 2, "name": "edge_w"},
    {"col": 1, "row": 2, "name": "corner_outer_nw"},
    {"col": 2, "row": 2, "name": "center_empty"},
    {"col": 3, "row": 2, "name": "hole_island"},
    {"col": 4, "row": 2, "name": "corner_outer_ne"},
    {"col": 5, "row": 2, "name": "corner_outer_sw"},

    # Linha 3
    {"col": 0, "row": 3, "name": "cross_4way"},
    {"col": 1, "row": 3, "name": "cross_3way_v"},
    {"col": 2, "row": 3, "name": "corner_inner_nw"},
    {"col": 3, "row": 3, "name": "edge_n"},
    {"col": 4, "row": 3, "name": "corner_inner_ne"},
    {"col": 5, "row": 3, "name": "turn_sw"},

    # Linha 4
    {"col": 0, "row": 4, "name": "corridor_v"},
    {"col": 1, "row": 4, "name": "turn_nw"},
    {"col": 2, "row": 4, "name": "turn_se"},
    {"col": 3, "row": 4, "name": "turn_ne"},
    {"col": 4, "row": 4, "name": "dead_end_s"},
    {"col": 5, "row": 4, "name": "single_island"}
]

def hash2(x, y, s=0):
    val = (int(x) * 374761393 + int(y) * 668265263 + int(s) * 1442695041) & 0xffffffff
    val = ((val ^ (val >> 13)) * 1274126177) & 0xffffffff
    return (val ^ (val >> 16)) / 4294967295.0

def get_mask(name, x, y):
    """Retorna o valor de máscara de 0.0 (fora/fundo) a 1.0 (dentro/superfície) para o tile."""
    # Transições suaves orgânicas com leve ruído senoidal
    wave_x = math.sin(x * 0.45) * 1.8
    wave_y = math.cos(y * 0.45) * 1.8

    if name == "center_full":
        return 1.0
    if name == "center_empty":
        return 0.0
    if name == "edge_s" or name == "edge_s_long":
        return 1.0 if y < (22 + wave_x) else 0.0
    if name == "edge_n":
        return 0.0 if y < (10 + wave_x) else 1.0
    if name == "edge_e":
        return 1.0 if x < (22 + wave_y) else 0.0
    if name == "edge_w":
        return 0.0 if x < (10 + wave_y) else 1.0
    if name == "corner_outer_se":
        return 1.0 if (x < 22 + wave_y and y < 22 + wave_x) else 0.0
    if name == "corner_outer_sw":
        return 1.0 if (x >= 10 - wave_y and y < 22 + wave_x) else 0.0
    if name == "corner_outer_nw":
        return 1.0 if (x >= 10 - wave_y and y >= 10 - wave_x) else 0.0
    if name == "corner_outer_ne":
        return 1.0 if (x < 22 + wave_y and y >= 10 - wave_x) else 0.0
    if name == "cut_sw":
        dist = math.hypot(x, y - 31)
        return 0.0 if dist < 12 else 1.0
    if name == "cut_se":
        dist = math.hypot(x - 31, y - 31)
        return 0.0 if dist < 12 else 1.0
    if name == "cut_ne":
        dist = math.hypot(x - 31, y)
        return 0.0 if dist < 12 else 1.0
    if name == "corner_inner_se":
        dist = math.hypot(x - 31, y - 31)
        return 1.0 if dist < 18 else 0.0
    if name == "corner_inner_sw":
        dist = math.hypot(x, y - 31)
        return 1.0 if dist < 18 else 0.0
    if name == "corner_inner_nw":
        dist = math.hypot(x, y)
        return 1.0 if dist < 18 else 0.0
    if name == "corner_inner_ne":
        dist = math.hypot(x - 31, y)
        return 1.0 if dist < 18 else 0.0
    if name == "corridor_h":
        return 1.0 if (8 <= y <= 24) else 0.0
    if name == "corridor_v":
        return 1.0 if (8 <= x <= 24) else 0.0
    if name == "cross_4way":
        return 1.0 if (8 <= y <= 24) or (8 <= x <= 24) else 0.0
    if name == "cross_3way_v":
        return 1.0 if (8 <= x <= 24) or (8 <= y <= 24 and x >= 8) else 0.0
    if name == "t_south":
        return 1.0 if (8 <= y <= 24) or (8 <= x <= 24 and y >= 8) else 0.0
    if name == "turn_sw":
        return 1.0 if (8 <= x <= 24 and y >= 8) or (8 <= y <= 24 and x <= 24) else 0.0
    if name == "turn_se":
        return 1.0 if (8 <= x <= 24 and y >= 8) or (8 <= y <= 24 and x >= 8) else 0.0
    if name == "turn_nw":
        return 1.0 if (8 <= x <= 24 and y <= 24) or (8 <= y <= 24 and x <= 24) else 0.0
    if name == "turn_ne":
        return 1.0 if (8 <= x <= 24 and y <= 24) or (8 <= y <= 24 and x >= 8) else 0.0
    if name == "dead_end_s":
        return 1.0 if (8 <= x <= 24 and y <= 22) else 0.0
    if name == "single_island":
        dist = math.hypot(x - 16, y - 16)
        return 1.0 if dist < 10 else 0.0
    if name == "hole_island":
        dist = math.hypot(x - 16, y - 16)
        return 0.0 if dist < 10 else 1.0

    return 1.0

def create_enchanted_forest_sheet():
    """Gera o tileset de Floresta Encantada conforme o prompt do usuário:
    - Grama em estilo 16-bit com textura orgânica e transição perfeita
    - Trilhas de terra com cascalho suave
    - Pequenas flores silvestres (vermelhas, azuis, amarelas, brancas)
    - Rochas com musgo nas bordas
    """
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    pixels = sheet.load()

    # Paleta de grama rica de 16-bit
    GRASS = [
        (46, 88, 38, 255),   # Base verde suave
        (56, 106, 46, 255),  # Médio
        (70, 126, 56, 255),  # Luz alta
        (38, 72, 30, 255),   # Sombra suave
        (88, 142, 60, 255)   # Tufo iluminado
    ]

    # Paleta de trilha de terra / solo de floresta
    DIRT = [
        (94, 76, 58, 255),   # Base de terra
        (116, 92, 70, 255),  # Terra iluminada
        (74, 58, 44, 255),   # Sombra de solo
        (134, 108, 82, 255), # Grãos de cascalho claro
        (58, 46, 36, 255)    # Fissura sutil
    ]

    # Flores silvestres e rochas com musgo
    FLOWER_RED = (220, 68, 82, 255)
    FLOWER_YELLOW = (245, 196, 44, 255)
    FLOWER_BLUE = (78, 154, 230, 255)
    FLOWER_WHITE = (240, 244, 240, 255)
    FLOWER_CENTER = (255, 230, 110, 255)

    ROCK_GRAY = (96, 104, 112, 255)
    ROCK_LIGHT = (130, 138, 146, 255)
    ROCK_DARK = (62, 68, 76, 255)
    MOSS_GREEN = (68, 134, 50, 255)

    def get_grass_color(gx, gy, col_idx, row_idx):
        h = hash2(gx % 32, gy % 32, 11 + col_idx * 7 + row_idx * 13)
        # Detalhe de flores silvestres em posições selecionadas (evita repetição excessiva)
        flower_seed = hash2(gx % 32, gy % 32, 88 + col_idx * 17)
        if 8 <= gx <= 24 and 8 <= gy <= 24 and flower_seed > 0.965:
            f_type = hash2(gx, gy, 42)
            if f_type < 0.30: return FLOWER_YELLOW
            elif f_type < 0.60: return FLOWER_RED
            elif f_type < 0.85: return FLOWER_BLUE
            else: return FLOWER_WHITE

        # Pontinho central de pólen ao lado da flor
        if flower_seed > 0.960 and flower_seed <= 0.965:
            return FLOWER_CENTER

        # Pequenas rochas com musgo
        rock_seed = hash2(gx % 32, gy % 32, 93 + row_idx * 23)
        if rock_seed > 0.975:
            return ROCK_LIGHT
        if rock_seed > 0.965:
            return ROCK_GRAY
        if rock_seed > 0.955:
            return MOSS_GREEN

        if h < 0.42: return GRASS[0]
        if h < 0.72: return GRASS[1]
        if h < 0.88: return GRASS[2]
        if h < 0.96: return GRASS[3]
        return GRASS[4]

    def get_dirt_color(dx, dy):
        h = hash2(dx % 32, dy % 32, 37)
        if h < 0.45: return DIRT[0]
        if h < 0.72: return DIRT[1]
        if h < 0.88: return DIRT[2]
        if h < 0.95: return DIRT[3]
        return DIRT[4]

    for t in TILE_MAP_30:
        tx = t["col"] * TILE_SIZE
        ty = t["row"] * TILE_SIZE
        name = t["name"]

        for y in range(32):
            for x in range(32):
                px = tx + x
                py = ty + y
                m = get_mask(name, x, y)

                if m >= 0.5:
                    col = get_grass_color(x, y, t["col"], t["row"])
                else:
                    col = get_dirt_color(x, y)

                pixels[px, py] = col

    out_path = "public/assets/maps/tilesets/autotile_grass_forest_32.png"
    sheet.save(out_path, optimize=True)
    print(f"[OK] Salvo Floresta Encantada 16-bit: {out_path}")

def create_water_swamp_sheet():
    """Gera tileset de Água Cristalina / Pântano e Margem Arenosa (referência clássica de RPG)."""
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    pixels = sheet.load()

    WATER = [
        (34, 112, 178, 255),  # Azul água médio
        (48, 142, 214, 255),  # Azul claro reflexo
        (26, 88, 148, 255),   # Azul profundo
        (76, 172, 240, 255),  # Espuma / crista suave
        (20, 68, 120, 255)    # Profundidade
    ]

    SHORE_SAND = [
        (196, 168, 114, 255), # Areia clara
        (178, 150, 98, 255),  # Areia média
        (156, 130, 84, 255),  # Areia úmida borda
        (214, 186, 132, 255)  # Destaque seco
    ]

    def get_water_color(x, y):
        wave = math.sin(x * 0.4 + y * 0.2) * 0.5 + 0.5
        h = hash2(x, y, 55) * 0.35 + wave * 0.65
        if h < 0.25: return WATER[4]
        if h < 0.55: return WATER[0]
        if h < 0.80: return WATER[2]
        if h < 0.94: return WATER[1]
        return WATER[3]

    def get_shore_color(x, y):
        h = hash2(x, y, 71)
        if h < 0.50: return SHORE_SAND[0]
        if h < 0.80: return SHORE_SAND[1]
        if h < 0.93: return SHORE_SAND[2]
        return SHORE_SAND[3]

    for t in TILE_MAP_30:
        tx = t["col"] * TILE_SIZE
        ty = t["row"] * TILE_SIZE
        name = t["name"]

        for y in range(32):
            for x in range(32):
                px = tx + x
                py = ty + y
                m = get_mask(name, x, y)
                if m >= 0.5:
                    col = get_water_color(x, y)
                else:
                    col = get_shore_color(x, y)
                pixels[px, py] = col

    out_path = "public/assets/maps/tilesets/autotile_water_swamp_32.png"
    sheet.save(out_path, optimize=True)
    print(f"[OK] Salvo Água e Pântano 16-bit: {out_path}")

def create_lava_volcano_sheet():
    """Gera tileset de Magma e Rocha de Basalto Vulcânica."""
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    pixels = sheet.load()

    LAVA = [
        (238, 92, 18, 255),   # Laranja magma
        (255, 154, 28, 255),  # Amarelo incandescente
        (200, 52, 14, 255),   # Vermelho brasa
        (255, 210, 60, 255),  # Fogo quente
        (160, 36, 10, 255)    # Crosta fina
    ]

    BASALT = [
        (42, 38, 44, 255),    # Basalto escuro
        (56, 50, 58, 255),    # Cinza carvão
        (30, 26, 32, 255),    # Fissura escura
        (72, 64, 76, 255)     # Aresta de pedra
    ]

    def get_lava_color(x, y):
        wave = math.cos(x * 0.35 + y * 0.35) * 0.5 + 0.5
        h = hash2(x, y, 63) * 0.3 + wave * 0.7
        if h < 0.20: return LAVA[4]
        if h < 0.50: return LAVA[2]
        if h < 0.75: return LAVA[0]
        if h < 0.92: return LAVA[1]
        return LAVA[3]

    def get_basalt_color(x, y):
        h = hash2(x, y, 82)
        if h < 0.45: return BASALT[0]
        if h < 0.75: return BASALT[1]
        if h < 0.92: return BASALT[2]
        return BASALT[3]

    for t in TILE_MAP_30:
        tx = t["col"] * TILE_SIZE
        ty = t["row"] * TILE_SIZE
        name = t["name"]

        for y in range(32):
            for x in range(32):
                px = tx + x
                py = ty + y
                m = get_mask(name, x, y)
                if m >= 0.5:
                    col = get_lava_color(x, y)
                else:
                    col = get_basalt_color(x, y)
                pixels[px, py] = col

    out_path = "public/assets/maps/tilesets/autotile_lava_volcano_32.png"
    sheet.save(out_path, optimize=True)
    print(f"[OK] Salvo Lava e Basalto 16-bit: {out_path}")

def create_stone_dungeon_sheet():
    """Gera tileset de Dungeon / Lajes de Pedra Antiga com encaixe perfeito."""
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    pixels = sheet.load()

    STONE = [
        (138, 126, 116, 255), # Laje média
        (158, 146, 134, 255), # Laje clara
        (116, 104, 96, 255),  # Laje sombra
        (76, 68, 62, 255),    # Fresta / rejunte
        (182, 170, 158, 255)  # Realce superior
    ]

    DIRT_BED = [
        (48, 42, 40, 255),
        (38, 32, 30, 255),
        (62, 54, 50, 255),
        (76, 66, 62, 255)
    ]

    def get_stone_color(x, y):
        # Lajes 16x16 com frestas em x=15 e y=15
        if x == 15 or y == 15: return STONE[3]
        if x == 16 or y == 16: return STONE[4]
        h = hash2(x, y, 17)
        if h < 0.45: return STONE[0]
        if h < 0.75: return STONE[1]
        return STONE[2]

    def get_dirt_color(x, y):
        h = hash2(x, y, 41)
        if h < 0.5: return DIRT_BED[0]
        if h < 0.8: return DIRT_BED[1]
        return DIRT_BED[2]

    for t in TILE_MAP_30:
        tx = t["col"] * TILE_SIZE
        ty = t["row"] * TILE_SIZE
        name = t["name"]

        for y in range(32):
            for x in range(32):
                px = tx + x
                py = ty + y
                m = get_mask(name, x, y)
                if m >= 0.5:
                    col = get_stone_color(x, y)
                else:
                    col = get_dirt_color(x, y)
                pixels[px, py] = col

    out_path = "public/assets/maps/tilesets/autotile_stone_dungeon_32.png"
    sheet.save(out_path, optimize=True)
    print(f"[OK] Salvo Dungeon Stone 16-bit: {out_path}")

def save_rules_json():
    data = {
        "tileSize": TILE_SIZE,
        "sheetCols": COLS,
        "sheetRows": ROWS,
        "sheetWidth": SHEET_W,
        "sheetHeight": SHEET_H,
        "tiles": TILE_MAP_30
    }
    out_path = "public/assets/maps/tilesets/autotile_rules.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[OK] Salvo regras: {out_path}")

if __name__ == "__main__":
    create_enchanted_forest_sheet()
    create_water_swamp_sheet()
    create_lava_volcano_sheet()
    create_stone_dungeon_sheet()
    save_rules_json()

