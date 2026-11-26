import json, os, sys, numpy as np
items = json.load(open('/home/user/pinyin/tools/voice/items.json'))
OUT = '/home/user/pinyin/audio/zh'
# giữ cả file thu cho câu riêng tư (keep-private.json: [lo, hex], chữ không đưa lên web)
KP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'keep-private.json')
priv = json.load(open(KP)) if os.path.exists(KP) else []
items = items + [{'lo': lo, 'hex': hx} for lo, hx in priv]
los = sorted({it['lo'] for it in items if os.path.exists(f"{OUT}/{it['hex'][:2]}/{it['hex']}.mp3")})
np.array(los, dtype='<u4').tofile(f'{OUT}/index.bin')
# xoá file mồ côi (câu đã bị sửa/xoá khỏi web)
keep = {it['hex'] for it in items}; n = 0
for d in os.listdir(OUT):
    if len(d) != 2: continue
    for f in os.listdir(f'{OUT}/{d}'):
        if f.endswith('.mp3') and f[:-4] not in keep: os.remove(f'{OUT}/{d}/{f}'); n += 1
print('index', len(los), 'removed', n)
