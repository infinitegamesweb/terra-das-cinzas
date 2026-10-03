import os
from PIL import Image

images = [
    ('Image 1', 'Dark_fantasy_MMORPG_GUI_asset_20261003163135.jpg'),
    ('Image 2', 'Dark_fantasy_MMORPG_GUI_asset_20261003163135_2.jpg'),
    ('Image 3', 'Dark_fantasy_MMORPG_GUI_asset_20261003163135_3.jpg'),
    ('Image 4', 'Dark_fantasy_MMORPG_GUI_asset_20261003163135_4.jpg')
]

with open('public/assets/ui/preview/sheets.html', 'w', encoding='utf-8') as f:
    f.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>GUI Sheets</title></head>')
    f.write('<body style="background:#111; color:#eee; font-family:sans-serif; padding:20px;">')
    f.write('<h1>Dark Fantasy MMORPG - Full Sheets</h1>')
    for label, fname in images:
        f.write(f'''
        <div style="margin-bottom:30px; background:#1e1e1e; padding:15px; border-radius:8px; border:1px solid #333;">
            <h2 style="color:#d4af37; margin-top:0;">{label}: {fname}</h2>
            <img src="/{fname}" style="width:100%; max-width:1376px; border:1px solid #555; display:block;" />
        </div>
        ''')
    f.write('</body></html>')
print('Sheets HTML generated.')
