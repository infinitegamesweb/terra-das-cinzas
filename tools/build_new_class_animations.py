"""
tools/build_new_class_animations.py
─────────────────────────────────────────────────────────────────
Gera e empacota animações completas para as 6 classes de PROMPTALPHA:
- Idle (8 direções)
- Walk (8 direções × 6 frames)
- Attack (8 direções × 6 frames: Melee vs Ranged flecha/magia)
- Hurt (8 direções × 3 frames)
- Death (8 direções × 6 frames com queda e dissipação em cinzas)

Garante:
- Resolução 48x48
- Nearest-Neighbor resampling
- Pivô fixo no chão (x: 24, y: 47)
- Alpha transparente limpo
- Saída em art-staging/novos-personagens/ e public/assets/characters/
─────────────────────────────────────────────────────────────────
"""
from __future__ import annotations

import argparse
import json
import math
import os
from pathlib import Path
from PIL import Image, ImageEnhance

ORDER = ("south", "south-west", "west", "north-west", "north", "north-east", "east", "south-east")
SIZE = 48
CLASSES = ("guerreiro", "barbaro", "clerigo", "arqueiro", "ladino", "mago")

DIRECTION_VECTORS = {
    "south": (0, 1),
    "south-west": (-0.7, 0.7),
    "west": (-1, 0),
    "north-west": (-0.7, -0.7),
    "north": (0, -1),
    "north-east": (0.7, -0.7),
    "east": (1, 0),
    "south-east": (0.7, 0.7)
}


def offset_row(image: Image.Image, y: int, dx: int) -> None:
    if not dx or y < 0 or y >= SIZE:
        return
    row = image.crop((0, y, SIZE, y + 1))
    image.paste((0, 0, 0, 0), (0, y, SIZE, y + 1))
    image.alpha_composite(row, (dx, y))


def shift_image(image: Image.Image, dx: int, dy: int) -> Image.Image:
    res = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    res.alpha_composite(image, (dx, dy))
    return res


# ─── 1. SÍNTESE DE CAMINHADA (WALK) ──────────────────────────────
def synthesize_walk(source: Image.Image, phase: int, direction: str) -> Image.Image:
    frame = source.copy()
    sway = (0, 1, 1, 0, -1, -1)[phase]
    bob = (0, -1, 0, 0, -1, 0)[phase]

    # Torso sway e bob
    for y in range(0, 27):
        offset_row(frame, y, sway)

    lower = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    source_pixels = source.load()
    lower_pixels = lower.load()
    frame.paste((0, 0, 0, 0), (0, 29, SIZE, 47))

    stride = (0, -1, -2, 0, 1, 2)[phase]
    lifted_side = -1 if phase in (1, 2) else 1 if phase in (4, 5) else 0

    for y in range(29, 47):
        for x in range(SIZE):
            pixel = source_pixels[x, y]
            if pixel[3] == 0:
                continue
            side = -1 if x < SIZE // 2 else 1
            dx = round((x - SIZE / 2) / 11 * stride)
            dy = -1 if lifted_side == side and y >= 39 else 0
            tx, ty = x + dx, y + dy + bob
            if 0 <= tx < SIZE and 0 <= ty < SIZE:
                lower_pixels[tx, ty] = pixel

    frame.alpha_composite(lower)
    return frame


# ─── 2. SÍNTESE DE ATAQUE (ATTACK) ───────────────────────────────
def synthesize_attack(source: Image.Image, phase: int, direction: str, class_id: str) -> Image.Image:
    frame = source.copy()
    vx, vy = DIRECTION_VECTORS[direction]

    if class_id == "arqueiro":
        # Arquétipo À Distância com Arco:
        # 0: Mira | 1: Puxada | 2: Tensão Máxima | 3: Disparo (Release) | 4: Recuo | 5: Retorno
        lunge_d = (0, -1, -2, 1, 0, 0)[phase]
        arm_extend = (1, 2, 3, -1, 0, 0)[phase]
        bow_draw = (-1, -2, -3, 2, 1, 0)[phase]

        # Deslocamento sutil do tronco na mira
        dx = round(vx * lunge_d)
        dy = round(vy * lunge_d)
        frame = shift_image(frame, dx, dy)

        # Brilho na ponta da flecha no frame 2 e 3
        if phase in (2, 3):
            pixels = frame.load()
            fx = int(24 + vx * 12)
            fy = int(24 + vy * 12)
            for ox in range(-1, 2):
                for oy in range(-1, 2):
                    if 0 <= fx + ox < SIZE and 0 <= fy + oy < SIZE:
                        pixels[fx + ox, fy + oy] = (147, 240, 180, 255)

    elif class_id == "mago":
        # Arquétipo À Distância com Cajado:
        # 0: Elevação | 1: Canalização | 2: Concentração Mística | 3: Disparo Arcana | 4: Onda de Choque | 5: Retorno
        bob_staff = (-1, -2, -3, 1, 0, 0)[phase]
        dx = round(vx * (bob_staff * 0.5))
        dy = round(vy * (bob_staff * 0.5))
        frame = shift_image(frame, dx, dy)

        # Esfera de energia concentrada na ponta do cajado (phases 1, 2, 3)
        if phase in (1, 2, 3):
            orb_overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
            orb_pixels = orb_overlay.load()
            cx = int(24 + vx * 14)
            cy = int(20 + vy * 12)
            radius = 2 if phase == 1 else 3 if phase == 2 else 4
            color = (56, 189, 248, 255) if phase != 3 else (224, 242, 254, 255)
            for y in range(max(0, cy - radius), min(SIZE, cy + radius + 1)):
                for x in range(max(0, cx - radius), min(SIZE, cx + radius + 1)):
                    if math.hypot(x - cx, y - cy) <= radius:
                        orb_pixels[x, y] = color
            frame.alpha_composite(orb_overlay)

    elif class_id == "barbaro":
        # Melee Pesado: Golpe esmagador com machado
        # 0: Windup alto | 1: Suspensão no topo | 2: Esmagamento descendente | 3: Impacto no chão | 4: Frenagem | 5: Retorno
        lift = (-2, -3, 2, 3, 1, 0)[phase]
        lunge = (0, -1, 3, 4, 2, 0)[phase]
        dx = round(vx * lunge)
        dy = round(vy * lunge + lift)
        frame = shift_image(frame, dx, dy)

    elif class_id == "ladino":
        # Melee Rápido: Estocada dupla e corte rápido
        # 0: Furtivo | 1: Estocada rápida 1 | 2: Estocada rápida 2 | 3: Retração | 4: Giro | 5: Retorno
        lunge = (1, 4, 3, 1, 0, 0)[phase]
        dx = round(vx * lunge)
        dy = round(vy * lunge)
        frame = shift_image(frame, dx, dy)

    elif class_id == "clerigo":
        # Melee Sagrado: Balanço de maça com pulso de luz
        lunge = (0, 1, 3, 2, 1, 0)[phase]
        dx = round(vx * lunge)
        dy = round(vy * lunge)
        frame = shift_image(frame, dx, dy)
        if phase in (2, 3):
            # Brilho dourado sagrado
            pixels = frame.load()
            for y in range(SIZE):
                for x in range(SIZE):
                    if pixels[x, y][3] > 180 and (x + y) % 3 == 0:
                        r, g, b, a = pixels[x, y]
                        pixels[x, y] = (min(255, r + 40), min(255, g + 40), min(255, b + 10), a)

    else:
        # Guerreiro: Melee Clássico com espada e escudo
        # 0: Windup | 1: Avanço frontal | 2: Corte descendente | 3: Extensão total | 4: Recuperação | 5: Retorno
        lunge = (0, 2, 4, 3, 1, 0)[phase]
        dx = round(vx * lunge)
        dy = round(vy * lunge)
        frame = shift_image(frame, dx, dy)

    return frame


# ─── 3. SÍNTESE DE SOFRER DANO (HURT) ─────────────────────────────
def synthesize_hurt(source: Image.Image, phase: int, direction: str) -> Image.Image:
    vx, vy = DIRECTION_VECTORS[direction]
    # Recuo na direção oposta ao golpe
    recoil = (-3, -1, 0)[phase]
    dx = round(-vx * recoil)
    dy = round(-vy * recoil)
    frame = shift_image(source, dx, dy)

    # Flash vermelho de impacto no frame 0 e 1
    if phase in (0, 1):
        pixels = frame.load()
        intensity = 0.5 if phase == 0 else 0.25
        for y in range(SIZE):
            for x in range(SIZE):
                p = pixels[x, y]
                if p[3] > 30:
                    r = min(255, int(p[0] * (1 - intensity) + 240 * intensity))
                    g = int(p[1] * (1 - intensity))
                    b = int(p[2] * (1 - intensity))
                    pixels[x, y] = (r, g, b, p[3])
    return frame


# ─── 4. SÍNTESE DE MORTE AO ZERAR HP (DEATH) ─────────────────────
def synthesize_death(source: Image.Image, phase: int, direction: str) -> Image.Image:
    # 0: Choque fatal | 1: Dobra os joelhos | 2: Cai de joelhos | 3: Colapso de bruços | 4: Repousa inerte com cinzas | 5: Dissipação em cinzas
    frame = source.copy()
    sink_y = (0, 3, 7, 12, 14, 15)[phase]
    alpha_factor = (1.0, 1.0, 1.0, 0.95, 0.75, 0.45)[phase]

    # Compressão vertical e colapso no solo
    scale_y = (1.0, 0.9, 0.75, 0.5, 0.4, 0.3)[phase]
    new_h = max(6, int(SIZE * scale_y))
    resized = frame.resize((SIZE, new_h), Image.Resampling.NEAREST)

    res = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    y_pos = SIZE - 1 - new_h
    res.alpha_composite(resized, (0, y_pos))

    # Aplicação de desvanecimento em cinzas nos frames finais
    res_pixels = res.load()
    for y in range(SIZE):
        for x in range(SIZE):
            p = res_pixels[x, y]
            if p[3] > 0:
                # Efeito cinzento de terra das cinzas
                gray = int(p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11)
                r = int(gray * 0.8 + 20)
                g = int(gray * 0.75 + 15)
                b = int(gray * 0.75 + 20)
                a = int(p[3] * alpha_factor)
                res_pixels[x, y] = (r, g, b, a)

    # Brasas e partículas subindo nos frames 4 e 5
    if phase in (4, 5):
        for seed in range(8):
            px = (seed * 7 + phase * 13) % (SIZE - 8) + 4
            py = max(0, SIZE - 12 - (seed * 3 + phase * 2))
            res_pixels[px, py] = (245, 158, 11, 200)

    return res


# ─── EMPACOTAMENTO PRINCIPAL ─────────────────────────────────────
def process_class(class_id: str, input_dir: Path, output_dir: Path) -> dict:
    rotations_dir = input_dir / "Idle" / "rotations"
    if not rotations_dir.exists():
        raise FileNotFoundError(f"Pasta de rotações não encontrada: {rotations_dir}")

    # Carrega as 8 direções base
    base_rotations = {}
    for d in ORDER:
        file_path = rotations_dir / f"{d}.png"
        if not file_path.exists():
            raise FileNotFoundError(f"Arquivo de rotação ausente: {file_path}")
        img = Image.open(file_path).convert("RGBA")
        if img.size != (SIZE, SIZE):
            img = img.resize((SIZE, SIZE), Image.Resampling.NEAREST)
        base_rotations[d] = img

    output_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = output_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "class": class_id,
        "size": {"w": SIZE, "h": SIZE},
        "directions": list(ORDER),
        "animations": {}
    }

    # 1. Idle Sheet
    idle_sheet = Image.new("RGBA", (SIZE * len(ORDER), SIZE), (0, 0, 0, 0))
    for i, d in enumerate(ORDER):
        idle_sheet.alpha_composite(base_rotations[d], (i * SIZE, 0))
    idle_sheet.save(output_dir / "idle-directions.png", optimize=True)

    # 2. Walk Atlas (6 frames × 8 directions)
    walk_sheet = Image.new("RGBA", (SIZE * 6, SIZE * len(ORDER)), (0, 0, 0, 0))
    walk_frames = {}
    for row, d in enumerate(ORDER):
        walk_frames[d] = []
        d_dir = frames_dir / "walk" / d
        d_dir.mkdir(parents=True, exist_ok=True)
        for col in range(6):
            frame = synthesize_walk(base_rotations[d], col, d)
            walk_sheet.alpha_composite(frame, (col * SIZE, row * SIZE))
            frame_name = f"frame_{col:03d}.png"
            frame.save(d_dir / frame_name, optimize=True)
            walk_frames[d].append(f"walk/{d}/{frame_name}")
    walk_sheet.save(output_dir / "walk-atlas.png", optimize=True)
    manifest["animations"]["walk"] = {"frameCount": 6, "fps": 9, "loop": True, "directions": walk_frames}

    # 3. Attack Atlas (6 frames × 8 directions)
    attack_sheet = Image.new("RGBA", (SIZE * 6, SIZE * len(ORDER)), (0, 0, 0, 0))
    attack_frames = {}
    for row, d in enumerate(ORDER):
        attack_frames[d] = []
        d_dir = frames_dir / "attack" / d
        d_dir.mkdir(parents=True, exist_ok=True)
        for col in range(6):
            frame = synthesize_attack(base_rotations[d], col, d, class_id)
            attack_sheet.alpha_composite(frame, (col * SIZE, row * SIZE))
            frame_name = f"frame_{col:03d}.png"
            frame.save(d_dir / frame_name, optimize=True)
            attack_frames[d].append(f"attack/{d}/{frame_name}")
    attack_sheet.save(output_dir / "attack-atlas.png", optimize=True)
    manifest["animations"]["attack"] = {"frameCount": 6, "fps": 10, "loop": False, "directions": attack_frames}

    # 4. Hurt Atlas (3 frames × 8 directions)
    hurt_sheet = Image.new("RGBA", (SIZE * 3, SIZE * len(ORDER)), (0, 0, 0, 0))
    hurt_frames = {}
    for row, d in enumerate(ORDER):
        hurt_frames[d] = []
        d_dir = frames_dir / "hurt" / d
        d_dir.mkdir(parents=True, exist_ok=True)
        for col in range(3):
            frame = synthesize_hurt(base_rotations[d], col, d)
            hurt_sheet.alpha_composite(frame, (col * SIZE, row * SIZE))
            frame_name = f"frame_{col:03d}.png"
            frame.save(d_dir / frame_name, optimize=True)
            hurt_frames[d].append(f"hurt/{d}/{frame_name}")
    hurt_sheet.save(output_dir / "hurt-atlas.png", optimize=True)
    manifest["animations"]["hurt"] = {"frameCount": 3, "fps": 12, "loop": False, "directions": hurt_frames}

    # 5. Death Atlas (6 frames × 8 directions)
    death_sheet = Image.new("RGBA", (SIZE * 6, SIZE * len(ORDER)), (0, 0, 0, 0))
    death_frames = {}
    for row, d in enumerate(ORDER):
        death_frames[d] = []
        d_dir = frames_dir / "death" / d
        d_dir.mkdir(parents=True, exist_ok=True)
        for col in range(6):
            frame = synthesize_death(base_rotations[d], col, d)
            death_sheet.alpha_composite(frame, (col * SIZE, row * SIZE))
            frame_name = f"frame_{col:03d}.png"
            frame.save(d_dir / frame_name, optimize=True)
            death_frames[d].append(f"death/{d}/{frame_name}")
    death_sheet.save(output_dir / "death-atlas.png", optimize=True)
    manifest["animations"]["death"] = {"frameCount": 6, "fps": 7, "loop": False, "directions": death_frames}

    # Salva atlas.json
    (output_dir / "atlas.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[{class_id}] OK -> {output_dir} (Walk, Attack, Hurt, Death atlas gerados com sucesso)")
    return manifest


def main():
    root = Path(__file__).resolve().parent.parent
    promptalpha_char = root / "PROMPTALPHA" / "char"
    staging_dir = root / "art-staging" / "novos-personagens"
    prod_dir = root / "public" / "assets" / "characters"

    print("===========================================================")
    print("TERRA DAS CINZAS · GERAÇÃO DE ANIMAÇÕES DOS NOVOS PERSONAGENS")
    print("===========================================================")

    # Mapeamento do nome em PROMPTALPHA para a pasta de produção
    class_name_map = {
        "arqueiro": "arqueiro",
        "barbaro": "barbaro",
        "clerigo": "clerigo",
        "guerreiro": "guerreiro",
        "ladino": "assasino",
        "mago": "mago(a)"
    }

    manifests = {}
    for alpha_name, prod_name in class_name_map.items():
        src = promptalpha_char / alpha_name
        dest_staging = staging_dir / prod_name
        manifest = process_class(alpha_name, src, dest_staging)
        manifests[prod_name] = manifest

    print("\n[SUCCESS] Todas as 6 classes foram geradas em art-staging/novos-personagens/!")


if __name__ == "__main__":
    main()
