import os
import shutil

os.makedirs('public/assets/items/dark_fantasy', exist_ok=True)

# Map index to semantic filename
# 1-indexed based on extracted items
ITEM_MAP = {
    1: 'weapon_spear.png',
    2: 'armor_plate_spiked.png',
    3: 'armor_tunic_leather.png',
    4: 'boots_greaves.png',
    5: 'helm_hood_leather.png',
    6: 'potion_health_red.png',
    7: 'potion_antidote_green.png',
    8: 'potion_arcane_purple.png',
    9: 'potion_frost_blue.png',
    10: 'chest_treasure_open.png',
    11: 'gold_nuggets.png',
    12: 'gold_coins_stack.png',
    13: 'skull_human.png',
    14: 'skull_demon_ruby.png',
    15: 'crown_golden_flame.png',
    16: 'skull_iron_visor.png',
    17: 'amulet_golden_teardrop.png',
    18: 'weapon_battle_axe.png',
    19: 'weapon_crimson_scythe.png',
    20: 'armor_shadow_mantle.png',
    21: 'helm_knight_visor.png',
    22: 'compass_silver.png',
    23: 'potion_elixir_orange.png',
    24: 'chalice_holy_grail.png',
    25: 'crystal_shadow_gem.png',
    26: 'talisman_bone_runic.png',
    27: 'amulet_ruby_medallion.png',
    28: 'charm_winged_feather.png',
    29: 'scroll_sealed.png',
    30: 'scroll_illuminated.png',
    31: 'scroll_parchment.png',
    32: 'amulet_silver_winged.png',
    33: 'relic_wooden_cross.png',
    34: 'relic_astrolabe_sun.png'
}

for idx, name in ITEM_MAP.items():
    src = f'public/assets/ui/extracted/items/item_sprite_{idx:02d}.png'
    dst = f'public/assets/items/dark_fantasy/{name}'
    if os.path.exists(src):
        shutil.copyfile(src, dst)
        print(f"Copied {src} -> {dst}")

print("All dark fantasy items copied successfully!")
