import json, os, sys, re, difflib, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from asr import asr
items = json.load(open('/home/user/pinyin/tools/voice/items.json'))
OUT = '/home/user/pinyin/audio/zh'
shard, n = int(sys.argv[1]), int(sys.argv[2])
norm = lambda s: re.sub(r'[^一-鿿]', '', s)
res = []
for i, it in enumerate(items):
    if i % n != shard: continue
    k = norm(it['k'])
    if len(k) < 4: continue
    fn = f"{OUT}/{it['hex'][:2]}/{it['hex']}.mp3"
    if not os.path.exists(fn): continue
    a, sr = sf.read(fn, dtype='float32')
    h = norm(asr(a, sr))
    c = 1 - difflib.SequenceMatcher(None, k, h).ratio()
    res.append([round(c, 3), it['k'], h, it['who'], it['src']])
json.dump(res, open(f'/home/user/tts/verify-{shard}.json', 'w'), ensure_ascii=False)
print('done', len(res))
