"""Pack a direction-by-direction animation folder into aligned Canvas sprite sheets."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


DIRECTIONS = ("east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east")
FRAME_SIZE = 64


def load_trimmed(path: Path):
    image = Image.open(path).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise SystemExit(f"Transparent/empty frame: {path}")
    return image.crop(bbox), bbox


def normalize_frames(frames, size=FRAME_SIZE, padding=3):
    max_w = max(image.width for image, _ in frames)
    max_h = max(image.height for image, _ in frames)
    scale = min((size - padding*2) / max_w, (size - padding*2) / max_h)
    normalized = []
    for image, bounds in frames:
        width = max(1, round(image.width * scale))
        height = max(1, round(image.height * scale))
        image = image.resize((width, height), Image.Resampling.NEAREST)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        x = (size-width)//2
        y = size-2-height
        canvas.alpha_composite(image, (x, y))
        normalized.append((canvas, bounds, {"x": size//2, "y": size-2}))
    return normalized


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to boss-fase-1/Idle")
    parser.add_argument("output", type=Path, help="Destination directory under assets/monsters")
    parser.add_argument("--fps", type=float, default=10)
    args = parser.parse_args()

    rotation_frames = [(load_trimmed(args.source / "rotations" / f"{direction}.png")) for direction in DIRECTIONS]
    rotation_frames = normalize_frames(rotation_frames)
    idle_sheet = Image.new("RGBA", (FRAME_SIZE*len(DIRECTIONS), FRAME_SIZE), (0, 0, 0, 0))
    for direction_index, (frame, _, _) in enumerate(rotation_frames):
        idle_sheet.alpha_composite(frame, (direction_index*FRAME_SIZE, 0))

    source_rows = []
    for direction in DIRECTIONS:
        paths = sorted((args.source / "animations" / "Running" / direction).glob("frame_*.png"))
        if not paths:
            raise SystemExit(f"No Running frames found for direction {direction}")
        source_rows.append((direction, [(load_trimmed(path)) for path in paths]))
    all_run_frames = [frame for _, frames in source_rows for frame in frames]
    normalized_run = normalize_frames(all_run_frames)
    frames_per_direction = len(source_rows[0][1])
    if any(len(frames) != frames_per_direction for _, frames in source_rows):
        raise SystemExit("All directions need the same number of frames for a rectangular atlas.")

    run_sheet = Image.new("RGBA", (FRAME_SIZE*frames_per_direction, FRAME_SIZE*len(DIRECTIONS)), (0, 0, 0, 0))
    args.output.mkdir(parents=True, exist_ok=True)
    frame_root = args.output / "frames"
    for direction_index, direction in enumerate(DIRECTIONS):
        (frame_root / "running" / direction).mkdir(parents=True, exist_ok=True)

    idle_sheet.save(args.output / "idle-directions.png", optimize=True)
    south_index = DIRECTIONS.index("south")
    idle_sheet.crop((south_index*FRAME_SIZE, 0, (south_index+1)*FRAME_SIZE, FRAME_SIZE)).save(
        args.output / "south.png", optimize=True
    )
    run_records = {}
    cursor = 0
    for direction_index, (direction, source_frames) in enumerate(source_rows):
        records = []
        for frame_index, (source_path, normalized) in enumerate(zip(
            sorted((args.source / "animations" / "Running" / direction).glob("frame_*.png")),
            normalized_run[cursor:cursor+frames_per_direction],
        )):
            frame, bounds, pivot = normalized
            x, y = frame_index*FRAME_SIZE, direction_index*FRAME_SIZE
            run_sheet.alpha_composite(frame, (x, y))
            filename = f"frame_{frame_index:03d}.png"
            frame.save(frame_root / "running" / direction / filename, optimize=True)
            records.append({
                "name": f"running_{direction}_{frame_index:03d}",
                "frame": {"x": x, "y": y, "w": FRAME_SIZE, "h": FRAME_SIZE},
                "duration": round(1000/args.fps),
                "pivot": pivot,
                "source": str(source_path).replace("\\", "/"),
                "sourceBounds": {"x": bounds[0], "y": bounds[1], "w": bounds[2]-bounds[0], "h": bounds[3]-bounds[1]},
            })
        run_records[direction] = records
        cursor += frames_per_direction

    idle_records = {}
    for index, (direction, normalized) in enumerate(zip(DIRECTIONS, rotation_frames)):
        frame, bounds, pivot = normalized
        idle_records[direction] = [{
            "name": f"idle_{direction}",
            "frame": {"x": index*FRAME_SIZE, "y": 0, "w": FRAME_SIZE, "h": FRAME_SIZE},
            "pivot": pivot,
            "source": f"rotations/{direction}.png",
            "sourceBounds": {"x": bounds[0], "y": bounds[1], "w": bounds[2]-bounds[0], "h": bounds[3]-bounds[1]},
        }]

    run_sheet.save(args.output / "running.png", optimize=True)
    atlas = {
        "meta": {
            "app": "Terra das Cinzas: A Deep RPG",
            "format": "RGBA8888",
            "frameSize": {"w": FRAME_SIZE, "h": FRAME_SIZE},
            "directions": list(DIRECTIONS),
            "directionsPerRow": True,
            "fps": args.fps,
            "anchor": "bottom-center",
            "images": {
                "idle": {"image": "idle-directions.png", "size": {"w": idle_sheet.width, "h": idle_sheet.height}},
                "running": {"image": "running.png", "size": {"w": run_sheet.width, "h": run_sheet.height}},
            },
        },
        "animations": {
            "idle": {"loop": True, "fps": 1, "directions": idle_records},
            "running": {"loop": True, "fps": args.fps, "directions": run_records},
        },
    }
    (args.output / "atlas.json").write_text(json.dumps(atlas, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Packed {len(DIRECTIONS)} idle directions and {frames_per_direction} running frames per direction into {args.output}")


if __name__ == "__main__":
    main()
