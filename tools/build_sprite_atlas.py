"""Slice a regular sprite grid, key out a flat magenta backdrop, and export PNG atlas + JSON."""
from __future__ import annotations

import argparse
import json
import math
from collections import deque
from pathlib import Path

from PIL import Image


def remove_connected_key(frame: Image.Image, tolerance: float) -> Image.Image:
    """Make only key-colored pixels connected to a border transparent."""
    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    border = [pixels[x, 0][:3] for x in range(width)]
    border += [pixels[x, height - 1][:3] for x in range(width)]
    border += [pixels[0, y][:3] for y in range(height)]
    border += [pixels[width - 1, y][:3] for y in range(height)]
    key = tuple(sorted(channel)[len(border) // 2] for channel in zip(*border))

    def is_key(x: int, y: int) -> bool:
        red, green, blue = pixels[x, y][:3]
        distance = math.sqrt((red-key[0])**2 + (green-key[1])**2 + (blue-key[2])**2)
        return distance <= tolerance

    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            if is_key(x, y):
                index = y * width + x
                if not visited[index]:
                    visited[index] = 1
                    queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if is_key(x, y):
                index = y * width + x
                if not visited[index]:
                    visited[index] = 1
                    queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not visited[index] and is_key(nx, ny):
                    visited[index] = 1
                    queue.append((nx, ny))
    return rgba


def detect_sprite_components(source: Image.Image, rows: int, columns: int, tolerance: float):
    """Separate sprites by their transparent-key background when AI ignores grid prompts."""
    from collections import deque

    rgba = source.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    border = [pixels[x, 0][:3] for x in range(width)]
    border += [pixels[x, height-1][:3] for x in range(width)]
    border += [pixels[0, y][:3] for y in range(height)]
    border += [pixels[width-1, y][:3] for y in range(height)]
    key = tuple(sorted(channel)[len(border)//2] for channel in zip(*border))
    limit = tolerance * tolerance
    foreground = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            red, green, blue, _ = pixels[x, y]
            distance = (red-key[0])**2 + (green-key[1])**2 + (blue-key[2])**2
            if distance <= limit:
                pixels[x, y] = (red, green, blue, 0)
            else:
                foreground[y*width+x] = 1

    seen = bytearray(width * height)
    components = []
    for start, is_foreground in enumerate(foreground):
        if not is_foreground or seen[start]:
            continue
        seen[start] = 1
        queue = deque([start])
        points = []
        min_x = max_x = start % width
        min_y = max_y = start // width
        sum_x = sum_y = 0
        while queue:
            index = queue.popleft()
            x, y = index % width, index // width
            points.append(index)
            sum_x += x
            sum_y += y
            min_x, max_x = min(min_x, x), max(max_x, x)
            min_y, max_y = min(min_y, y), max(max_y, y)
            for ny in range(max(0, y-1), min(height, y+2)):
                for nx in range(max(0, x-1), min(width, x+2)):
                    neighbor = ny*width+nx
                    if foreground[neighbor] and not seen[neighbor]:
                        seen[neighbor] = 1
                        queue.append(neighbor)
        if len(points) >= 250:
            components.append({
                "image": rgba.crop((min_x, min_y, max_x+1, max_y+1)),
                "bounds": (min_x, min_y, max_x+1, max_y+1),
                "area": len(points),
                "center": (sum_x/len(points), sum_y/len(points)),
            })

    expected = rows * columns
    if len(components) < expected:
        raise SystemExit(f"Found only {len(components)} sprite components; expected {expected}. Try a higher --key-tolerance or regular grid mode.")
    components = sorted(components, key=lambda item: item["area"], reverse=True)[:expected]
    components.sort(key=lambda item: (item["center"][1], item["center"][0]))
    ordered = []
    for row in range(rows):
        group = components[row*columns:(row+1)*columns]
        ordered.extend(sorted(group, key=lambda item: item["center"][0]))
    return [(item["image"], item["bounds"]) for item in ordered]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--columns", type=int, required=True)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--frame-size", type=int, default=64)
    parser.add_argument("--fps", type=float, default=8)
    parser.add_argument("--animation", default="idle")
    parser.add_argument("--anchor", choices=("bottom-center", "center"), default="bottom-center")
    parser.add_argument("--key-tolerance", type=float, default=90)
    parser.add_argument("--segmentation", choices=("components", "grid"), default="components")
    parser.add_argument("--cell-inset", type=int, default=0, help="Trim this many pixels inside each regular source-grid cell")
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    source_info = {"columns": args.columns, "rows": args.rows}
    if args.segmentation == "components":
        try:
            keyed_with_bounds = detect_sprite_components(source, args.rows, args.columns, args.key_tolerance)
            source_info["segmentation"] = "connected-components"
        except SystemExit:
            if source.width % args.columns or source.height % args.rows:
                raise
            cell_w, cell_h = source.width // args.columns, source.height // args.rows
            keyed_with_bounds = []
            for row in range(args.rows):
                for column in range(args.columns):
                    left, top = column*cell_w, row*cell_h
                    cell = source.crop((left, top, left+cell_w, top+cell_h))
                    frame = remove_connected_key(cell, args.key_tolerance)
                    bbox = frame.getbbox()
                    if bbox is None:
                        raise SystemExit(f"Frame {len(keyed_with_bounds)} is empty after background removal.")
                    keyed_with_bounds.append((frame.crop(bbox), (left+bbox[0], top+bbox[1], left+bbox[2], top+bbox[3])))
                source_info["segmentation"] = "regular-grid-fallback"
    else:
        if source.width % args.columns or source.height % args.rows:
            cell_widths = [round((column+1)*source.width/args.columns)-round(column*source.width/args.columns) for column in range(args.columns)]
            cell_heights = [round((row+1)*source.height/args.rows)-round(row*source.height/args.rows) for row in range(args.rows)]
        else:
            cell_widths = [source.width//args.columns]*args.columns
            cell_heights = [source.height//args.rows]*args.rows
        keyed_with_bounds = []
        top = 0
        for row in range(args.rows):
            left = 0
            for column in range(args.columns):
                right, bottom = left+cell_widths[column], top+cell_heights[row]
                inset = args.cell_inset
                crop_box = (left+inset, top+inset, right-inset, bottom-inset)
                cell = source.crop(crop_box)
                frame = remove_connected_key(cell, args.key_tolerance)
                bbox = frame.getbbox()
                if bbox is None:
                    raise SystemExit(f"Frame {len(keyed_with_bounds)} is empty after background removal.")
                keyed_with_bounds.append((frame.crop(bbox), (crop_box[0]+bbox[0], crop_box[1]+bbox[1], crop_box[0]+bbox[2], crop_box[1]+bbox[3])))
                left = right
            top += cell_heights[row]
        source_info["segmentation"] = "regular-grid"
    keyed = [item[0] for item in keyed_with_bounds]
    bounds = [item[1] for item in keyed_with_bounds]

    padding = 5
    max_w = max(frame.width for frame in keyed)
    max_h = max(frame.height for frame in keyed)
    scale = min((args.frame_size - padding*2) / max_w, (args.frame_size - padding*2) / max_h)
    output_dir = args.output_dir
    frame_dir = output_dir / "frames" / args.animation
    frame_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGBA", (args.frame_size * len(keyed), args.frame_size), (0, 0, 0, 0))

    records = []
    anchor_y = args.frame_size - 2 if args.anchor == "bottom-center" else args.frame_size // 2
    for index, source_frame in enumerate(keyed):
        width = max(1, round(source_frame.width * scale))
        height = max(1, round(source_frame.height * scale))
        frame = source_frame.resize((width, height), Image.Resampling.NEAREST)
        x = (args.frame_size - width) // 2
        y = anchor_y - height if args.anchor == "bottom-center" else (args.frame_size - height) // 2
        normalized = Image.new("RGBA", (args.frame_size, args.frame_size), (0, 0, 0, 0))
        normalized.alpha_composite(frame, (x, y))
        frame_name = f"frame_{index:03d}.png"
        normalized.save(frame_dir / frame_name, optimize=True)
        sheet.alpha_composite(normalized, (index * args.frame_size, 0))
        records.append({
            "filename": frame_name,
            "frame": {"x": index * args.frame_size, "y": 0, "w": args.frame_size, "h": args.frame_size},
            "duration": round(1000 / args.fps),
            "sourceBounds": {"x": bounds[index][0], "y": bounds[index][1], "w": bounds[index][2]-bounds[index][0], "h": bounds[index][3]-bounds[index][1]},
            "pivot": {"x": args.frame_size // 2, "y": anchor_y},
        })

    sheet_name = f"{args.animation}.png"
    sheet.save(output_dir / sheet_name, optimize=True)
    atlas = {
        "meta": {
            "app": "Terra das Cinzas: A Deep RPG",
            "image": sheet_name,
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "frameSize": {"w": args.frame_size, "h": args.frame_size},
            "columns": len(keyed),
            "rows": 1,
            "sourceGrid": source_info,
            "anchor": args.anchor,
            "fps": args.fps,
        },
        "animations": {args.animation: {"loop": args.animation == "idle", "fps": args.fps, "frames": records}},
    }
    (output_dir / "atlas.json").write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(keyed)} frames: {output_dir / sheet_name} ({sheet.width}x{sheet.height})")
    print(f"Atlas: {output_dir / 'atlas.json'}")


if __name__ == "__main__":
    main()
