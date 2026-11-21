# Build js/data.js + tools/photos.json from words.py; downloads any missing Fluent 3D images.
# Usage: python3 build.py   (run from xiu-mai/tools)
import json, os, re, sys, io, urllib.request, urllib.parse
sys.path.insert(0, '.')
from words import T
from fetch import path, slug, EXTRA
from PIL import Image
W = '../img/w/'; P = '../img/p/'
def parse():
  out = []
  for key, vi, en, col, photo, lines in T:
    ws = []
    for l in lines.strip().split('\n'):
      p = [x.strip() for x in l.split('|')] + ['', '']
      e, v, f, w = p[0], p[1], p[2] or p[0], p[3]
      wiki = None if (not photo or w == '-') else (w or e[0].upper() + e[1:])
      ws.append((e, v, None if f == '-' else f, wiki))
    out.append((key, vi, en, col, ws))
  return out
D = parse()
# 1) Fluent images
need = {f for *_, ws in D for (_, _, f, _) in ws if f} | set(EXTRA)
miss = []
for f in sorted(need):
  fn = W + slug(f) + '.webp'
  if os.path.exists(fn): continue
  p = path(f)
  if not p: miss.append(f); continue
  try:
    d = urllib.request.urlopen('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/' + urllib.parse.quote(p), timeout=30).read()
    im = Image.open(io.BytesIO(d)).convert('RGBA'); im.thumbnail((256, 256)); im.save(fn, 'WEBP', quality=88)
  except Exception as e: miss.append(f + ' ' + str(e))
if miss: print('fluent missing', miss)
# 2) photos.json (word -> Wikipedia title)
pj = {}
for *_, ws in D:
  for e, v, f, wiki in ws:
    if wiki:
      if e in pj and pj[e] != wiki: print('photo title conflict', e, pj[e], wiki)
      pj.setdefault(e, wiki)
json.dump(pj, open('photos.json', 'w'), indent=1, ensure_ascii=False)
# 3) data.js
cred = json.load(open('../data/photo-credits.json')) if os.path.exists('../data/photo-credits.json') else {}
topics = []; n = 0; dropped = []
for key, vi, en, col, ws in D:
  w2 = []
  for e, v, f, wiki in ws:
    ph = slug(e)
    if wiki and e in cred and os.path.exists(P + ph + '.jpg'): img = 'p/' + ph + '.jpg'
    elif f: img = 'w/' + slug(f)
    else: dropped.append(e); continue
    w2.append([e, v, img])
  cover = next((x[2] for x in w2 if x[2].startswith('w/')), w2[0][2])
  topics.append({'k': key, 'vi': vi, 'en': en, 'c': col, 'cover': cover, 'w': w2}); n += len(w2)
open('../js/data.js', 'w').write('window.TOPICS=' + json.dumps(topics, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(topics), 'topics', n, 'words;', len(pj), 'photo titles; waiting for photo:', len(dropped))
