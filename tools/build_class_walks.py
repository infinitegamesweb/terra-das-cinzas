"""Pack eight-direction class walking frames; synthesize subtle cycles where source lacks them."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path("public/assets/characters") if Path("public/assets/characters").exists() else Path("assets/characters")
ORDER = ("south", "south-west", "west", "north-west", "north", "north-east", "east", "south-east")
WARRIOR_SOURCE = ROOT / "guerreiro/Create_an_original_chibi-Idle/Idle/animations/Walking"
ROGUE_SOURCE = Path("PROMPTALPHA/char/ladino/Idle/animations/Walking")
CLASSES = {
    "guerreiro": (ROOT / "guerreiro/Create_an_original_chibi-Idle/Idle", ROOT / "guerreiro"),
    "arqueiro": (ROOT / "arqueiro/Idle", ROOT / "arqueiro"),
    "assasino": (ROOT / "assasino/Idle", ROOT / "assasino"),
    "barbaro": (ROOT / "barbaro/Idle", ROOT / "barbaro"),
    "clerigo": (ROOT / "clerigo/Idle", ROOT / "clerigo"),
    "mago": (ROOT / "mago(a)/Idle", ROOT / "mago(a)"),
}
SIZE = 48
FRAME_COUNT = 6
FPS = 9


def offset_row(image: Image.Image, y: int, dx: int) -> None:
    if not dx:
        return
    row = image.crop((0, y, SIZE, y + 1))
    image.paste((0, 0, 0, 0), (0, y, SIZE, y + 1))
    image.alpha_composite(row, (dx, y))


def synthesize_walk(source: Image.Image, phase: int) -> Image.Image:
    """Generate a small pixel-art footstep and torso sway without moving the ground anchor."""
    frame = source.copy()
    sway = (0, 1, 1, 0, -1, -1)[phase]
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
            dx = round((x - SIZE / 2) / 12 * stride)
            dy = -1 if lifted_side == side and y >= 39 else 0
            tx, ty = x + dx, y + dy
            if 0 <= tx < SIZE and 0 <= ty < SIZE:
                lower_pixels[tx, ty] = pixel
    frame.alpha_composite(lower)
    return frame


def main() -> None:
    for class_id, (idle_root, class_root) in CLASSES.items():
        output = class_root / "animations"
        frames_root = output / "walk"
        output.mkdir(parents=True, exist_ok=True)
        atlas_image = Image.new("RGBA", (SIZE * FRAME_COUNT, SIZE * len(ORDER)), (0, 0, 0, 0))
        directions = {}
        for row, direction in enumerate(ORDER):
            frames = []
            if class_id == "guerreiro":
                source_dir = WARRIOR_SOURCE / direction
                frames = sorted(source_dir.glob("frame_*.png"))
                if len(frames) != FRAME_COUNT:
                    raise SystemExit(f"Expected {FRAME_COUNT} warrior walk frames for {direction}; found {len(frames)}")
                images = [Image.open(path).convert("RGBA") for path in frames]
            elif class_id == "assasino" and ROGUE_SOURCE.exists():
                source_dir = ROGUE_SOURCE / direction
                frames = sorted(source_dir.glob("frame_*.png"))
                if len(frames) != FRAME_COUNT:
                    raise SystemExit(f"Expected {FRAME_COUNT} rogue walk frames for {direction}; found {len(frames)}")
                images = [Image.open(path).convert("RGBA") for path in frames]
            else:
                source_file = (idle_root / "rotations") / direction
                idle_path = source_file.with_suffix(".png")
                base = Image.open(idle_path).convert("RGBA")
                if base.size != (SIZE, SIZE):
                    raise SystemExit(f"Expected 48x48 idle sprite: {idle_path}")
                images = [synthesize_walk(base, phase) for phase in range(FRAME_COUNT)]
            directions[direction] = []
            (frames_root / direction).mkdir(parents=True, exist_ok=True)
            for col, image in enumerate(images):
                if image.size != (SIZE, SIZE):
                    image = image.resize((SIZE, SIZE), Image.Resampling.NEAREST)
                atlas_image.alpha_composite(image, (col * SIZE, row * SIZE))
                relative = Path("walk") / direction / f"frame_{col:03d}.png"
                image.save(output / relative, optimize=True)
                directions[direction].append({
                    "name": f"walk_{direction}_{col:03d}",
                    "frame": {"x": col * SIZE, "y": row * SIZE, "w": SIZE, "h": SIZE},
                    "duration": round(1000 / FPS),
                    "pivot": {"x": SIZE // 2, "y": SIZE - 1},
                    "source": str((idle_root / "rotations" / f"{direction}.png") if class_id != "guerreiro" else frames[col]).replace("\\", "/"),
                })
        atlas_image.save(output / "walk-atlas.png", optimize=True)
        atlas = {
            "meta": {"class": class_id, "format": "RGBA8888", "frameSize": {"w": SIZE, "h": SIZE}, "directions": list(ORDER), "fps": FPS, "anchor": "bottom-center", "image": "walk-atlas.png"},
            "animations": {"walk": {"loop": True, "framesPerDirection": FRAME_COUNT, "directions": directions}},
        }
        (output / "walk-atlas.json").write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{class_id}: {len(ORDER)} directions × {FRAME_COUNT} frames")


if __name__ == "__main__":
    main()
