import os
import glob

cuts = sorted(glob.glob('public/assets/ui/preview/cuts/*.png'))
with open('public/assets/ui/preview/index.html', 'w', encoding='utf-8') as f:
    f.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>GUI Assets</title></head>')
    f.write('<body style="background:#111; color:#eee; font-family:monospace; padding:20px;">')
    f.write('<h1>Dark Fantasy MMORPG GUI Assets</h1>')
    f.write('<div style="display:flex; flex-wrap:wrap; gap:16px;">')
    for c in cuts:
        rel = os.path.basename(c)
        f.write(f'''
        <div style="background:#222; border:1px solid #444; border-radius:4px; padding:10px; max-width:320px;">
            <div style="font-size:12px; word-break:break-all; margin-bottom:8px; color:#aaa;">{rel}</div>
            <a href="cuts/{rel}" target="_blank">
                <img src="cuts/{rel}" style="max-width:300px; max-height:220px; object-fit:contain; background:#000; border:1px solid #333;" />
            </a>
        </div>
        ''')
    f.write('</div></body></html>')
print('Generated gallery with', len(cuts), 'elements')
