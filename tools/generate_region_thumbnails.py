import os
import math
from PIL import Image, ImageDraw

REGIONS_CONFIG = {
    13: {
        "name": "Abismo Sombrio",
        "bg_top": (10, 5, 20),
        "bg_bottom": (35, 15, 60),
        "accent": (140, 60, 220),
        "style": "abyss"
    },
    14: {
        "name": "Caverna dos Cristais",
        "bg_top": (8, 18, 30),
        "bg_bottom": (15, 45, 65),
        "accent": (45, 210, 240),
        "style": "crystals"
    },
    15: {
        "name": "Forja Ancestral",
        "bg_top": (25, 10, 5),
        "bg_bottom": (70, 25, 10),
        "accent": (255, 120, 20),
        "style": "forge"
    },
    16: {
        "name": "Cume dos Ventos Uivantes",
        "bg_top": (30, 40, 55),
        "bg_bottom": (70, 85, 105),
        "accent": (180, 210, 240),
        "style": "peaks"
    },
    17: {
        "name": "Bosque Envenenado",
        "bg_top": (12, 24, 15),
        "bg_bottom": (28, 55, 30),
        "accent": (80, 220, 90),
        "style": "poison"
    },
    18: {
        "name": "Ruínas Subterrâneas",
        "bg_top": (18, 16, 20),
        "bg_bottom": (45, 38, 42),
        "accent": (230, 160, 60),
        "style": "ruins"
    },
    19: {
        "name": "Cidadela Flutuante",
        "bg_top": (20, 25, 60),
        "bg_bottom": (75, 60, 110),
        "accent": (240, 200, 90),
        "style": "floating"
    },
    20: {
        "name": "Mar de Ossos",
        "bg_top": (35, 30, 25),
        "bg_bottom": (80, 70, 60),
        "accent": (210, 200, 180),
        "style": "bones"
    },
    21: {
        "name": "Floresta Vermelha",
        "bg_top": (30, 8, 12),
        "bg_bottom": (75, 20, 28),
        "accent": (235, 45, 60),
        "style": "red_forest"
    },
    22: {
        "name": "Templo dos Antigos",
        "bg_top": (15, 25, 25),
        "bg_bottom": (40, 60, 55),
        "accent": (220, 185, 75),
        "style": "temple"
    },
    23: {
        "name": "Deserto das Ilusões",
        "bg_top": (50, 30, 15),
        "bg_bottom": (120, 85, 35),
        "accent": (250, 195, 90),
        "style": "desert"
    },
    24: {
        "name": "Cripta do Rei Esquecido",
        "bg_top": (8, 12, 20),
        "bg_bottom": (25, 32, 45),
        "accent": (90, 160, 230),
        "style": "crypt"
    },
    25: {
        "name": "Muralha Quebrada",
        "bg_top": (22, 22, 28),
        "bg_bottom": (50, 48, 55),
        "accent": (195, 140, 70),
        "style": "wall"
    },
    26: {
        "name": "Vale da Morte Cinzenta",
        "bg_top": (20, 20, 22),
        "bg_bottom": (55, 55, 60),
        "accent": (160, 160, 170),
        "style": "ash_valley"
    },
    27: {
        "name": "Fenda do Vazio",
        "bg_top": (5, 5, 15),
        "bg_bottom": (25, 12, 45),
        "accent": (175, 80, 255),
        "style": "void_rift"
    },
    28: {
        "name": "Coração do Vazio",
        "bg_top": (3, 2, 10),
        "bg_bottom": (18, 8, 35),
        "accent": (210, 100, 255),
        "style": "void_core"
    },
    29: {
        "name": "Terra das Cinzas Eternas",
        "bg_top": (35, 10, 10),
        "bg_bottom": (85, 20, 15),
        "accent": (255, 85, 30),
        "style": "eternal_ash"
    }
}

WIDTH, HEIGHT = 256, 144
OUTPUT_DIR = os.path.join("public", "assets", "regions")
os.makedirs(OUTPUT_DIR, exist_ok=True)

for reg_id, conf in REGIONS_CONFIG.items():
    filename = f"region_{reg_id:02d}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        print(f"Skipping existing {filename}")
        continue

    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    top_c = conf["bg_top"]
    bot_c = conf["bg_bottom"]
    accent = conf["accent"]

    # 1. Background gradient
    for y in range(HEIGHT):
        t = y / float(HEIGHT - 1)
        r = int(top_c[0] + (bot_c[0] - top_c[0]) * t)
        g = int(top_c[1] + (bot_c[1] - top_c[1]) * t)
        b = int(top_c[2] + (bot_c[2] - top_c[2]) * t)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # 2. Celestial / atmospheric glow in center/horizon
    horizon_y = int(HEIGHT * 0.65)
    for rad in range(60, 0, -6):
        alpha = (60 - rad) / 60.0
        glow_c = (
            int(bot_c[0] * (1 - alpha) + accent[0] * alpha * 0.4),
            int(bot_c[1] * (1 - alpha) + accent[1] * alpha * 0.4),
            int(bot_c[2] * (1 - alpha) + accent[2] * alpha * 0.4)
        )
        draw.ellipse([WIDTH // 2 - rad * 1.5, horizon_y - rad, WIDTH // 2 + rad * 1.5, horizon_y + rad], outline=glow_c)

    # 3. Mountains / silhouette silhouettes
    points1 = [(0, HEIGHT)]
    for x in range(0, WIDTH + 8, 8):
        ny = horizon_y - 20 - int(math.sin(x * 0.04 + reg_id) * 16 + math.cos(x * 0.08) * 8)
        points1.append((x, ny))
    points1.append((WIDTH, HEIGHT))
    draw.polygon(points1, fill=(int(top_c[0] * 0.7), int(top_c[1] * 0.7), int(top_c[2] * 0.7)))

    # Foreground terrain
    points2 = [(0, HEIGHT)]
    for x in range(0, WIDTH + 4, 4):
        ny = horizon_y + 8 - int(math.sin(x * 0.06 + reg_id * 2) * 10 + math.cos(x * 0.12) * 5)
        points2.append((x, ny))
    points2.append((WIDTH, HEIGHT))
    fg_col = (int(top_c[0] * 0.4), int(top_c[1] * 0.4), int(top_c[2] * 0.4))
    draw.polygon(points2, fill=fg_col)

    # 4. Characteristic features based on style
    if conf["style"] in ["crystals", "void_core", "void_rift"]:
        # Crystals / Void shards
        for cx in [60, 128, 190]:
            cy = horizon_y - 5
            c_height = 28 if cx == 128 else 20
            draw.polygon([
                (cx, cy - c_height),
                (cx + 6, cy - c_height // 2),
                (cx + 4, cy + 6),
                (cx - 4, cy + 6),
                (cx - 6, cy - c_height // 2)
            ], fill=accent)
    elif conf["style"] in ["forge", "eternal_ash"]:
        # Magma fissures
        for fx in range(30, WIDTH - 30, 24):
            fy = horizon_y + 18 + (fx % 12)
            draw.line([(fx, fy), (fx + 16, fy + 4)], fill=accent, width=2)
            draw.point([(fx + 8, fy - 6), (fx + 14, fy - 12)], fill=(255, 230, 150))
    elif conf["style"] in ["ruins", "temple", "wall", "crypt"]:
        # Pillars & archways
        for px in [40, 80, 170, 210]:
            py = horizon_y - 18
            draw.rectangle([px, py, px + 8, py + 30], fill=(20, 22, 26))
            draw.line([px - 2, py, px + 10, py], fill=accent, width=2)
    elif conf["style"] in ["floating"]:
        # Floating islands
        draw.ellipse([90, horizon_y - 35, 166, horizon_y - 15], fill=(30, 28, 45))
        draw.polygon([(100, horizon_y - 25), (156, horizon_y - 25), (128, horizon_y)], fill=(20, 18, 32))
        draw.rectangle([124, horizon_y - 45, 132, horizon_y - 30], fill=accent)

    # 5. Fine pixel dithering / ash particles
    for step in range(60):
        px = (step * 37 + reg_id * 17) % WIDTH
        py = (step * 23 + reg_id * 29) % (HEIGHT - 20)
        draw.point([(px, py)], fill=accent)

    # Pixelate filter pass: shrink and upscale to guarantee crisp pixel art clusters
    small = img.resize((WIDTH // 2, HEIGHT // 2), resample=Image.Resampling.NEAREST)
    pixel_img = small.resize((WIDTH, HEIGHT), resample=Image.Resampling.NEAREST)

    pixel_img.save(filepath, format="PNG", optimize=True)
    print(f"Generated {filename} ({WIDTH}x{HEIGHT}) for {conf['name']}")
