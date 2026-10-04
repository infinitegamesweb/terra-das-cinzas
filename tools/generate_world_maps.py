"""Generate and process the 28 replacement overworld maps.

The source illustrations are created through Cloudflare Workers AI (FLUX.2 Klein 4B).
Processed pixel-art PNGs, Tiled maps, and the runtime layout index are deterministic
outputs. Raw API responses stay in art-staging/map-rebuild/sources/.
"""
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import json
import re
import tomllib
from pathlib import Path

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
WORLD_MAP_JS = ROOT / "src/systems/world/WorldMapManager.js"
ART_DIR = ROOT / "art-staging/map-rebuild"
SOURCE_DIR = ART_DIR / "sources"
REALM_DIR = ROOT / "public/assets/maps/realms"
ART_CANDIDATE_DIR = ART_DIR / "candidates"
TILED_DIR = REALM_DIR / "tiled"
LAYOUTS_PATH = ROOT / "src/data/worldMapLayouts.json"
ACCOUNT_ID = "8da2fcd3d4233ed35f03b7a020a5131e"
MODEL = "@cf/black-forest-labs/flux-2-klein-4b"
WRANGLER_AUTH = Path.home() / "AppData/Roaming/xdg.config/.wrangler/config/default.toml"

THEMES = {
    2: ("forest", "eerie ancient forest clearing where pale echo-stones ring a moonlit pool, broken standing stones and silver-blue fireflies"),
    3: ("swamp", "drowned riverbank with teal water channels, half-sunken wooden walkways, reed islands and a ruined ferry landing"),
    4: ("swamp", "spectral marshland, dark turquoise pools, ghostly willow roots, pale lilies and a submerged stone shrine"),
    5: ("snow", "mountain thaw trail with blue-white snow shelves, dark pine clusters, exposed rust-red rock and a narrow pass"),
    6: ("mountain", "red mountain basin, layered rust-colored cliffs, obsidian boulders, warm ashfall and a broad winding trail"),
    7: ("fortress", "broken fortress gate district, collapsed battlements, cracked dark flagstones, banners in ash and a broad central approach"),
    8: ("fortress", "isolated ember watchtower courtyard, scorched stone terraces, golden braziers, fractured stairs and ruined outer wall"),
    9: ("eclipse", "twilight field under a violet eclipse, dark plum grass, standing stones, an old processional path and distant ruins"),
    10: ("cavern", "vast void cavern floor, blue-black stone, luminous crystal seams, sinkholes at the edges and a safe winding center path"),
    11: ("iron", "forgotten iron labyrinth courtyard, rusted machinery embedded in stone, rail grooves, gear-shaped ruins and dim amber lamps"),
    12: ("lava", "cursed forge basin, charcoal stone platforms, orange magma channels at the edges, iron slag and ancient furnace ruins"),
    13: ("abyss", "shadow abyss floor, near-black violet rock, fractured islands above a dim void, sparse cold lights and a central causeway"),
    14: ("crypt", "eternal crypt approach, old blue-gray tombstones, cracked flagstone lanes, cypress shadows and a sunken mausoleum"),
    15: ("forest", "cursed forest with blackened roots, sickly violet mushrooms, dead leaves, twisted trees and a pale clearing"),
    16: ("tower", "forgotten tower district from above, broken circular towers, slate courtyards, faded magical runes and blue mist"),
    17: ("ash", "sea of ashes, immense gray dunes, dark stone outcrops, wind-carved channels and scattered shipwreck fragments"),
    18: ("lava", "volcanic core plateau, black basalt plates, glowing orange cracks along the margins, ember vents and a broad central shelf"),
    19: ("chaos", "altar of chaos, fractured floating-looking stone terraces, red and violet runes, scattered monoliths and a central ritual circle"),
    20: ("lava", "incandescent highland, burnt orange earth, cooled lava shelves, black basalt ridges and a long switchback route"),
    21: ("lava", "magma river crossing from above, black basalt banks, bright orange lava stream, broken bridges and broad safe stone islands"),
    22: ("ghosttown", "abandoned ghost town seen from above, roofless timber houses, overgrown cobblestone lanes, ash and dim blue lanterns"),
    23: ("mountain", "condemned mountain summit, sheer slate ridges, windblown ash, broken stone stairs and an exposed high-altitude arena"),
    24: ("eclipse", "domain of an eclipse tyrant, black-violet terraces, crimson banners, circular stone arena and fractured eclipse symbols"),
    25: ("lava", "chamber of the first fire, ancient dark shrine, ring of ember-lit basalt, old braziers and warm golden magma seams"),
    26: ("eclipse", "final eclipse veil, cold violet wasteland, black mirror pools, split monoliths and a silent central path"),
    27: ("abyss", "dimension of shadows, impossible but readable dark stone platforms, dim blue-violet rifts, long empty paths and sparse lights"),
    28: ("abyss", "heart of the void, circular fractured arena, deep indigo stone, faint cyan crystal pulse and empty radial lanes"),
    29: ("ash", "eternal land of ashes, monumental ash dunes, cracked black earth, distant ruined arches and a broad road to the final arena"),
}

PALETTES = {
    "forest": {"bg": "#18351f", "path": "#a69b75", "tree": "#42763a", "accent": "#b9ae85", "ambientColor": "#95e86e", "enemy": "monster_treant", "bossSprite": "boss_ashroot_guardian", "npcRole": "Batedora", "props": ["rock_moss", "rock_small", "stump", "log", "mushroom_purple", "ruined_statue", "ruin_pillar"]},
    "swamp": {"bg": "#102b2b", "path": "#718681", "tree": "#28534a", "accent": "#79d3bd", "ambientColor": "#6ee5e8", "enemy": "monster_swamp_witch", "bossSprite": "monster_void_serpent", "npcRole": "Barqueira", "props": ["swamp_mossy_log", "swamp_mud_mound", "swamp_mossy_rock", "water_lily_cluster_3", "cattail_water_cluster", "swamp_reeds_dense"]},
    "snow": {"bg": "#29313c", "path": "#b6b3aa", "tree": "#495264", "accent": "#b7d9e8", "ambientColor": "#83cbeb", "enemy": "monster_spiked_crawler", "bossSprite": "boss_ashen_golem", "npcRole": "Guia", "props": ["rock_large", "rock_small", "stone_stairs", "pillar", "mountain_crag"]},
    "mountain": {"bg": "#382720", "path": "#9a806c", "tree": "#694436", "accent": "#ef9864", "ambientColor": "#e87e51", "enemy": "monster_cave_ogre", "bossSprite": "boss_ashen_golem", "npcRole": "Mineradora", "props": ["rock_large", "rock_small", "pillar", "arcane_brazier", "mountain_crag"]},
    "fortress": {"bg": "#272431", "path": "#918496", "tree": "#4a4258", "accent": "#d3a565", "ambientColor": "#c577e8", "enemy": "monster_skeleton_warrior", "bossSprite": "monster_haunted_grimoire", "npcRole": "Sentinela", "props": ["ruined_statue", "stone_gargoyle", "pillar", "stone_stairs", "cave_dungeon_entrance"]},
    "eclipse": {"bg": "#211926", "path": "#8b6d70", "tree": "#48303f", "accent": "#cb7970", "ambientColor": "#e86e8a", "enemy": "monster_shadow_spirit", "bossSprite": "monster_void_serpent", "npcRole": "Oráculo", "props": ["stone_gargoyle", "arcane_brazier", "ruin_pillar", "ruined_statue", "pillar"]},
    "cavern": {"bg": "#111a22", "path": "#667d89", "tree": "#273d4a", "accent": "#60b8d3", "ambientColor": "#50c7df", "enemy": "monster_spiked_crawler", "bossSprite": "monster_giant_eyeball", "npcRole": "Escavadora", "props": ["stalagmite_1", "stalagmite_2", "rock_cave_1", "rock_cave_2", "ore_cyan_fissure"]},
    "iron": {"bg": "#202226", "path": "#766e63", "tree": "#373940", "accent": "#d28a54", "ambientColor": "#d28a54", "enemy": "monster_haunted_grimoire", "bossSprite": "monster_haunted_grimoire", "npcRole": "Engenheira", "props": ["mine_cart_1", "rock_large", "barrel", "crate", "arcane_brazier"]},
    "lava": {"bg": "#2a150e", "path": "#9e6851", "tree": "#552e24", "accent": "#ff8b42", "ambientColor": "#ff6b35", "enemy": "monster_hell_hound", "bossSprite": "boss_ashen_golem", "npcRole": "Ferreira", "props": ["rock_large", "rock_small", "arcane_brazier", "pillar", "ore_magma_lava"]},
    "abyss": {"bg": "#100e1d", "path": "#514a71", "tree": "#252039", "accent": "#8878c9", "ambientColor": "#8676dc", "enemy": "monster_void_serpent", "bossSprite": "monster_void_serpent", "npcRole": "Vidente", "props": ["rock_cave_4", "stalagmite_3", "arcane_brazier", "ore_amethyst_spire", "pillar"]},
    "crypt": {"bg": "#1a1924", "path": "#706b75", "tree": "#393644", "accent": "#9b91b7", "ambientColor": "#a797d6", "enemy": "monster_ghost_spectre", "bossSprite": "monster_reaper_death", "npcRole": "Coveira", "props": ["ruined_statue", "stone_gargoyle", "cave_dungeon_entrance", "pillar", "ore_white_quartz"]},
    "tower": {"bg": "#211b2e", "path": "#70617f", "tree": "#393047", "accent": "#b69be1", "ambientColor": "#ba9fe6", "enemy": "monster_flying_demon", "bossSprite": "monster_haunted_grimoire", "npcRole": "Arquivista", "props": ["pillar", "ruin_pillar", "arcane_brazier", "stone_stairs", "ore_amethyst_spire"]},
    "ash": {"bg": "#252426", "path": "#817a73", "tree": "#4a4848", "accent": "#c4b8a2", "ambientColor": "#d2b78f", "enemy": "monster_reaper_death", "bossSprite": "monster_void_serpent", "npcRole": "Andarilha", "props": ["rock_large", "rock_small", "stone_gargoyle", "ruin_pillar", "ore_iron_silver"]},
    "chaos": {"bg": "#241528", "path": "#785276", "tree": "#482441", "accent": "#e277ae", "ambientColor": "#e277ae", "enemy": "monster_flying_demon", "bossSprite": "monster_void_serpent", "npcRole": "Ocultista", "props": ["arcane_brazier", "ruined_statue", "pillar", "ore_amethyst_spire", "stone_gargoyle"]},
    "ghosttown": {"bg": "#20202a", "path": "#78717b", "tree": "#494953", "accent": "#a7bac6", "ambientColor": "#9fcde0", "enemy": "monster_ghost_spectre", "bossSprite": "monster_vampire_lord", "npcRole": "Moradora", "props": ["barrel", "crate", "stone_stairs", "lamp_post", "ruined_statue"]},
}


def maps_from_source() -> list[dict]:
    source = WORLD_MAP_JS.read_text(encoding="utf-8")
    block = source.split("const WORLD_MAPS = [", 1)[1].split("\n  ];", 1)[0]
    pattern = re.compile(
        r"\{\s*id:\s*(\d+),\s*mode:\s*'([^']+)',\s*name:\s*'([^']+)',\s*sub:\s*'([^']+)',"
        r"\s*min:\s*(\d+),\s*max:\s*(\d+),\s*enemy:\s*'([^']+)',\s*boss:\s*'([^']+)',\s*color:\s*'([^']+)'"
    )
    maps = []
    for m in pattern.finditer(block):
        id_ = int(m.group(1))
        if id_ == 1:
            continue  # Preserve the initial forest map; it is never regenerated.
        maps.append({"id": id_, "mode": m.group(2), "name": m.group(3), "sub": m.group(4), "min": int(m.group(5)), "max": int(m.group(6)), "enemyName": m.group(7), "bossName": m.group(8), "color": m.group(9)})
    if len(maps) != 28:
        raise RuntimeError(f"Expected 28 non-starting world maps; parsed {len(maps)}")
    return maps


def token_from_wrangler() -> str:
    import os
    if os.getenv("CLOUDFLARE_API_TOKEN"):
        return os.environ["CLOUDFLARE_API_TOKEN"]
    if not WRANGLER_AUTH.exists():
        raise RuntimeError("Cloudflare API token not found in environment or Wrangler login")
    auth = tomllib.loads(WRANGLER_AUTH.read_text(encoding="utf-8"))
    token = auth.get("oauth_token")
    if not token:
        raise RuntimeError("Wrangler login has no OAuth token")
    return token


def prompt_for(map_: dict, theme: str, scene: str) -> str:
    return (
        "Create a 2D top-down action RPG TERRAIN BACKGROUND ONLY, full-frame landscape 4:3 composition. "
        "Premium dark-fantasy pixel art for the game Terra das Cinzas, crisp deliberate pixel clusters, "
        "limited cohesive game palette, clean readable shapes, no photorealism, no painterly blur, no smoothing. "
        f"Distinct location: {map_['name']} — {map_['sub']}. "
        f"Environment: {scene}. Palette family: {theme}. "
        "Map layout: a continuous clear walkable route connects a lower-center entrance, four broad empty encounter clearings, "
        "and a large empty upper-center arena. Keep open ground around every clearing for gameplay sprites. "
        "Place terrain, cliffs, water, lava, vegetation and unoccupied architecture toward the outer edges. "
        "ABSOLUTELY NO PEOPLE OR PERSON-SHAPED OBJECTS: no humans, humanoids, silhouettes, creatures, monsters, "
        "bosses, NPCs, statues, faces, figures, characters, enemies, animals, weapons, or sprites. "
        "No text, labels, numbers, icons, runes, UI, grid, border, frame, legend, isometric view or map inset. "
        "The image is terrain only and must fill the whole canvas. Top-down orthographic view, game-ready, coherent light from upper left."
    )


def generate_one(map_: dict, token: str, force: bool, candidate: bool = False) -> tuple[int, str]:
    source_path = SOURCE_DIR / f"realm-{map_['id']:02d}-source.png"
    processed_dir = ART_CANDIDATE_DIR if candidate else REALM_DIR
    processed_path = processed_dir / f"realm-{map_['id']:02d}.png"
    theme, scene = THEMES[map_["id"]]
    if processed_path.exists() and source_path.exists() and not force:
        return map_["id"], "cached"
    response = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL}",
        headers={"Authorization": f"Bearer {token}"},
        data={"prompt": prompt_for(map_, theme, scene)},
        timeout=300,
    )
    if not response.ok:
        raise RuntimeError(f"Cloudflare AI failed for map {map_['id']} ({response.status_code}): {response.text[:400]}")
    payload = response.json()
    encoded = payload.get("result", {}).get("image")
    if not encoded:
        raise RuntimeError(f"Cloudflare returned no image for map {map_['id']}")
    image_bytes = base64.b64decode(encoded)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    source_path.write_bytes(image_bytes)
    with Image.open(source_path) as source:
        source = source.convert("RGB")
        # Crop only the top/bottom excess to keep the scene undistorted at the map's 1900:1450 ratio.
        target_ratio = 1900 / 1450
        sw, sh = source.size
        crop_h = round(sw / target_ratio)
        top = max(0, (sh - crop_h) // 2)
        source = source.crop((0, top, sw, top + crop_h))
        pixel = ImageOps.fit(source, (512, 390), method=Image.Resampling.LANCZOS)
        pixel = pixel.quantize(colors=80, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).convert("RGB")
        pixel = pixel.resize((1900, 1450), Image.Resampling.NEAREST)
        processed_dir.mkdir(parents=True, exist_ok=True)
        pixel.save(processed_path, format="PNG", optimize=True)
    return map_["id"], f"generated ({len(image_bytes)} bytes source)"


def generate_local_variation(map_: dict) -> tuple[int, str]:
    """Create a distinct map painting from an approved Cloudflare scene without more API usage."""
    from PIL import ImageEnhance
    from random import Random

    map_id = map_["id"]
    out = REALM_DIR / f"realm-{map_id:02d}.png"
    if out.exists():
        return map_id, "already present"
    theme, _ = THEMES[map_id]
    base_by_theme = {
        "forest": 15, "swamp": 4, "snow": 5, "mountain": 6, "fortress": 7,
        "eclipse": 9, "cavern": 10, "iron": 11, "lava": 12, "abyss": 13,
        "crypt": 14, "tower": 8, "ash": 13, "chaos": 9, "ghosttown": 7,
    }
    source_id = base_by_theme[theme]
    source_path = SOURCE_DIR / f"realm-{source_id:02d}-source.png"
    if not source_path.exists():
        raise RuntimeError(f"No approved source artwork exists for map {map_id}")
    rng = Random(71931 + map_id * 101)
    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if rng.random() < 0.5:
            image = ImageOps.mirror(image)
        if rng.random() < 0.28:
            image = ImageOps.flip(image)
        # Different framing exposes alternate landmarks and creates a new layout composition.
        zoom = 0.84 + rng.random() * 0.31
        crop_w = int(image.width / zoom)
        crop_h = int(image.height / zoom)
        left = int((image.width - crop_w) * (0.32 + rng.random() * 0.36))
        top = int((image.height - crop_h) * (0.28 + rng.random() * 0.4))
        image = image.crop((left, top, left + crop_w, top + crop_h))
        image = ImageOps.fit(image, (1900, 1450), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        tint_color = Image.new("RGB", image.size, PALETTES[theme]["bg"])
        image = Image.blend(image, tint_color, 0.20 + rng.random() * 0.11)
        image = ImageEnhance.Color(image).enhance(0.72 + rng.random() * 0.45)
        image = ImageEnhance.Contrast(image).enhance(1.05 + rng.random() * 0.14)
        # Rebuild in the same coarse pixel scale and shared palette as the API-approved maps.
        pixel = ImageOps.fit(image, (512, 390), method=Image.Resampling.LANCZOS)
        pixel = pixel.quantize(colors=80, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).convert("RGB")
        pixel.resize((1900, 1450), Image.Resampling.NEAREST).save(out, format="PNG", optimize=True)
    return map_id, f"local art variation from approved {theme} source"


def tiled_map(map_: dict, layout: dict) -> dict:
    map_id = map_["id"]
    objects = []
    obj_id = 1

    def add(name: str, klass: str, x: int, y: int, width: int = 0, height: int = 0, point: bool = True, props: dict | None = None):
        nonlocal obj_id
        obj = {"id": obj_id, "name": name, "class": klass, "x": x, "y": y}
        if point:
            obj["point"] = True
        else:
            obj["width"] = width
            obj["height"] = height
        if props:
            obj["properties"] = [{"name": k, "type": "string", "value": str(v)} for k, v in props.items()]
        objects.append(obj)
        obj_id += 1

    spawn = layout["playerSpawn"]
    boss = layout["bossSpawn"]
    npc = layout["npcSpawn"]
    add("Entrada", "PlayerSpawn", spawn["x"], spawn["y"], props={"regionId": map_id})
    add("Arena do chefe", "BossSpawn", boss["x"], boss["y"], props={"name": map_["bossName"], "level": map_["max"]})
    add("NPC", "NPCSpawn", npc["x"], npc["y"], props={"name": layout["npcName"]})
    for index, point in enumerate(layout["enemySpawns"], 1):
        add(f"Grupo {index}", "EnemySpawn", point["x"], point["y"], props={"enemy": map_["enemyName"], "levelMin": point["levelMin"], "levelMax": point["levelMax"]})
    for index, point in enumerate(layout["landmarks"], 1):
        add(f"Marco {index}", "Landmark", point["x"], point["y"], props={"kind": point["kind"]})
    collision_objects = []
    for name, x, y, w, h in [
        ("Limite Norte", 0, -48, 1900, 48), ("Limite Sul", 0, 1450, 1900, 48),
        ("Limite Oeste", -48, 0, 48, 1450), ("Limite Leste", 1900, 0, 48, 1450),
    ]:
        collision_objects.append({"id": obj_id, "name": name, "class": "WorldBoundary", "x": x, "y": y, "width": w, "height": h})
        obj_id += 1
    props = lambda values: [{"name": k, "type": "string", "value": str(v)} for k, v in values.items()]
    return {
        "type": "map", "version": "1.10", "tiledversion": "1.11.2", "orientation": "orthogonal", "renderorder": "right-down",
        "width": 60, "height": 46, "tilewidth": 32, "tileheight": 32, "infinite": False,
        "nextlayerid": 3, "nextobjectid": obj_id,
        "properties": props({"regionId": map_id, "regionName": map_["name"], "recommendedLevel": f"{map_['min']}-{map_['max']}", "biome": layout["biome"], "layoutVersion": 1}),
        "layers": [
            {"id": 1, "name": "Arte de terreno · Cloudflare AI", "type": "imagelayer", "image": f"../realm-{map_id:02d}.png", "imagewidth": 1900, "imageheight": 1450, "opacity": 1, "visible": True, "x": 0, "y": 0, "offsetx": 0, "offsety": 0, "repeatx": False, "repeaty": False},
            {"id": 2, "name": "Gameplay · pontos e limites", "type": "objectgroup", "draworder": "topdown", "opacity": 1, "visible": True, "x": 0, "y": 0, "objects": objects + collision_objects},
        ],
        "tilesets": [],
    }


def write_utf8_lf(path: Path, contents: str) -> None:
    """Write portable UTF-8 text regardless of the host platform's newlines."""
    with path.open("w", encoding="utf-8", newline="\n") as output:
        output.write(contents)


def create_layouts_and_tiled(maps: list[dict], force: bool) -> None:
    layouts: dict[str, dict] = {}
    map_docs: dict[str, dict] = {}
    used = {(0, 0), (1, 2)}  # Keep the initial forest and existing castle at their coordinates.
    free = [(col, row) for row in range(5) for col in range(6) if (col, row) not in used]
    for index, map_ in enumerate(maps):
        col, row = free[index]
        theme, _ = THEMES[map_["id"]]
        palette = PALETTES[theme]
        rng = __import__("random").Random(71931 + map_["id"] * 101)
        npc_name = f"{palette['npcRole']} de {map_['name']}"
        level_span = map_["max"] - map_["min"] + 1
        area_labels = ["Norte", "Leste", "Oeste", "Sul"]
        area_points = [(960, 370), (1480, 620), (420, 830), (960, 1110)]
        areas = []
        for area_index, (label, (x, y)) in enumerate(zip(area_labels, area_points)):
            area_min = map_["min"] + (level_span * area_index) // 4
            area_max = map_["min"] + (level_span * (area_index + 1)) // 4 - 1
            areas.append({"name": f"{map_['name']} · {label}", "min": area_min, "max": max(area_min, min(map_["max"] - 1, area_max)), "x": x, "y": y, "boss": False})
        areas.append({"name": f"Arena · {map_['bossName']}", "min": map_["max"], "max": map_["max"], "x": 960, "y": 205, "boss": True})
        enemy_spawns = []
        for area in areas[:4]:
            jitter_x, jitter_y = rng.randint(-50, 50), rng.randint(-36, 36)
            area["x"] += jitter_x
            area["y"] += jitter_y
            enemy_spawns.append({"x": area["x"], "y": area["y"], "levelMin": area["min"], "levelMax": area["max"]})
        landmarks = []
        for i, kind in enumerate(palette["props"][:4]):
            x = [260, 1640, 330, 1570][i]
            y = [260, 300, 1160, 1120][i]
            landmarks.append({"x": x + rng.randint(-36, 36), "y": y + rng.randint(-28, 28), "kind": kind, "scale": round(0.9 + rng.random() * 0.22, 2)})
        layout = {
            "id": map_["id"], "mapName": map_["name"], "col": col, "row": row, "biome": theme,
            "palette": {k: palette[k] for k in ("bg", "path", "tree", "accent", "ambientColor")},
            "enemySprite": palette["enemy"], "bossSprite": palette["bossSprite"], "npcName": npc_name,
            "playerSpawn": {"x": 960, "y": 1270}, "npcSpawn": {"x": 700, "y": 760},
            "bossSpawn": {"x": areas[4]["x"], "y": areas[4]["y"]},
            "enemySpawns": enemy_spawns, "areas": areas, "landmarks": landmarks,
            "levelRange": {"min": map_["min"], "max": map_["max"]},
        }
        layouts[str(map_["id"])] = layout
        map_docs[str(map_["id"])] = tiled_map(map_, layout)
    LAYOUTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    REALM_DIR.mkdir(parents=True, exist_ok=True)
    TILED_DIR.mkdir(parents=True, exist_ok=True)
    write_utf8_lf(LAYOUTS_PATH, json.dumps(layouts, ensure_ascii=False, indent=2) + "\n")
    for id_text, document in map_docs.items():
        out = TILED_DIR / f"realm-{int(id_text):02d}.tmj"
        if out.exists() and not force:
            continue
        write_utf8_lf(out, json.dumps(document, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="Regenerate raw images and overwrite Tiled map files")
    parser.add_argument("--layouts-only", action="store_true", help="Only regenerate Tiled maps and runtime data")
    parser.add_argument("--local-missing", action="store_true", help="Fill any missing images from the generated biome art, without calling Cloudflare")
    parser.add_argument("--candidates", action="store_true", help="Write generated PNGs to art-staging/map-rebuild/candidates instead of public assets")
    parser.add_argument("--ids", nargs="+", type=int, help="Generate only these map IDs (for review pilots)")
    parser.add_argument("--jobs", type=int, default=2, help="Concurrent Cloudflare requests (default 2)")
    args = parser.parse_args()
    maps = maps_from_source()
    if args.ids:
        unknown = sorted(set(args.ids) - {map_["id"] for map_ in maps})
        if unknown:
            parser.error(f"Unknown/non-generatable map IDs: {unknown}")
        maps = [map_ for map_ in maps if map_["id"] in set(args.ids)]
    if args.local_missing:
        for map_ in maps:
            map_id, status = generate_local_variation(map_)
            print(f"Map {map_id:02d}: {status}", flush=True)
    elif not args.layouts_only:
        token = token_from_wrangler()
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(3, args.jobs))) as pool:
            futures = {pool.submit(generate_one, map_, token, args.force, args.candidates): map_ for map_ in maps}
            for future in concurrent.futures.as_completed(futures):
                map_id, status = future.result()
                print(f"Map {map_id:02d}: {status}", flush=True)
    create_layouts_and_tiled(maps, args.force)
    print(f"Created {len(maps)} Tiled layouts and runtime entries. The castle and map 01 were left untouched.")


if __name__ == "__main__":
    main()
