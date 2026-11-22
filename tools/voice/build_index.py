import json, os, sys, numpy as np
items = json.load(open('/home/user/pinyin/tools/voice/items.json'))
OUT = '/home/user/pinyin/audio/zh'
los = sorted({it['lo'] for it in items if os.path.exists(f"{OUT}/{it['hex'][:2]}/{it['hex']}.mp3")})
np.array(los, dtype='<u4').tofile(f'{OUT}/index.bin')
# xoá file mồ côi (câu đã bị sửa/xoá khỏi web)
keep = {it['hex'] for it in items}; n = 0
for d in os.listdir(OUT):
    if len(d) != 2: continue
    for f in os.listdir(f'{OUT}/{d}'):
        if f.endswith('.mp3') and f[:-4] not in keep: os.remove(f'{OUT}/{d}/{f}'); n += 1
print('index', len(los), 'removed', n)
