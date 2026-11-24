#!/usr/bin/env python3
"""Tạo dữ liệu cho trang /chu-han/ (Soi chữ Hán).
Nguồn:
  - Make Me a Hanzi dictionary.txt (github.com/skishore/makemeahanzi, LGPL): cấu tạo (IDS), loại chữ, phần nghĩa/phần âm, gợi ý nguồn gốc.
  - CVDICT (../../dict.txt, CC BY-SA 4.0): âm Hán Việt + nghĩa tiếng Việt.
  - goi-y-viet.tsv: bản dịch tiếng Việt (viết tay, đã soát) các gợi ý nguồn gốc cho chữ hội ý/tượng hình thường gặp (HSK 1-6 + giáo trình).
  - bo-thu.tsv: tên bộ thủ Hán Việt + nghĩa.
Chạy: python3 tools/chu-han/build.py /đường/dẫn/dictionary.txt
"""
import json, re, sys, os, unicodedata
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
mm_path = sys.argv[1] if len(sys.argv) > 1 else '/tmp/dictionary.txt'

MM = {}
for l in open(mm_path, encoding='utf-8'):
    x = json.loads(l); MM[x['character']] = x

VP = {}
for r_ in sorted(json.load(open(os.path.join(ROOT, 'trasua/data/vocab.json'), encoding='utf-8')), key=lambda r: (r[4] or 99)):
    if len(r_[0]) == 1 and r_[0] not in VP: VP[r_[0]] = r_[1]
CV = {}
for l in open(os.path.join(ROOT, 'dict.txt'), encoding='utf-8'):
    p = l.rstrip('\n').split('\t')
    if len(p) < 2 or len(p[0]) != 1: continue
    CV[p[0]] = [e.split('|', 2) for e in p[1:] if e.count('|') >= 2]

VI = {}
for l in open(os.path.join(HERE, 'goi-y-viet.tsv'), encoding='utf-8'):
    l = l.rstrip('\n')
    if l: c, t = l.split('\t'); VI[c] = t

ROOT_IDS = set('⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻')
CHISU = set('一二三上下本末刃寸甘亦朱')

def clean(d):
    d = re.sub(r'\[[^\]]*\]', '', d)               # bỏ [hao2]
    d = re.sub(r'([㐀-鿿]+)\|([㐀-鿿]+)', r'\2', d)  # 沒|没 -> 没
    d = re.sub(r'\s+', ' ', d).strip(' ;,')
    return d

BAD = re.compile(r'^(biến thể|thành phần|dạng cổ|dạng phồn thể|dạng giản thể|phồn thể|xem |dùng trong|như |cũng như)', re.I)

def cv_info(c, pref_py=None):
    es = CV.get(c) or []
    hv = []
    for py, h, d in es:
        for x in re.split(r',\s*', h):
            x = x.strip()
            if x and x != '_' and x not in hv: hv.append(x)
    good = [e for e in es if not BAD.search(e[2].strip()) and not e[2].startswith('họ ')]
    if not good: good = [e for e in es if not e[2].startswith('họ ')] or es
    # gom theo pinyin, tối đa 3 âm đọc
    out, seen = [], {}
    for py, h, d in good:
        d = clean(d)
        if not d: continue
        k = py.lower()
        if k in seen:
            o = out[seen[k]]
            if len(o[2]) < 60 and d not in o[2]: o[2] += '; ' + d
            continue
        seen[k] = len(out); out.append([py, '' if h == '_' else h, d])
    if pref_py:
        tone = lambda py: bool(re.search('[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]', py))
        vp = VP.get(c)
        out.sort(key=lambda e: (0 if e[0] == vp else 1, 0 if e[0] == pref_py else 1, 0 if tone(e[0]) else 1))
    for o in out:
        if len(o[2]) > 110:
            cut = o[2][:110]
            o[2] = cut.rsplit(';', 1)[0] if ';' in cut else cut.rsplit(',', 1)[0] + '…'
    out = out[:3]
    hv2 = []
    for o in out:
        for x in re.split(r',\s*', o[1]):
            x = x.strip()
            if x and x != '_' and x not in hv2: hv2.append(x)
    hv = hv2 + [x for x in hv if x not in hv2]
    return hv, out

def leaves(ids):
    return [ch for ch in ids if ch not in ROOT_IDS and ch != '？']

def rec(c):
    x = MM.get(c)
    pys = (x or {}).get('pinyin') or []
    hv, means = cv_info(c, pys[0] if pys else None)
    if not pys and means: pys = [means[0][0]]
    e = (x or {}).get('etymology') or {}
    t = {'pictophonetic': 'h', 'ideographic': 'y', 'pictographic': 't'}.get(e.get('type'), '')
    if c in CHISU: t = 'c'
    dec = (x or {}).get('decomposition') or ''
    if dec == '？': dec = ''
    if means:  # âm chính đứng đầu
        pys = [m_[0] for m_ in means] + pys
    r = {'p': ','.join(dict.fromkeys(pys))}
    if hv: r['v'] = ', '.join(hv)
    if means: r['m'] = means
    if dec: r['d'] = dec
    if t: r['t'] = t
    if t == 'h':
        if e.get('semantic'): r['s'] = e['semantic']
        if e.get('phonetic'): r['f'] = e['phonetic']
    if c in VI: r['g'] = VI[c]
    if x and x.get('radical'): r['r'] = x['radical']
    return r

# tập chữ thường gặp: HSK 1-6 + từ mới giáo trình
voc = json.load(open(os.path.join(ROOT, 'trasua/data/vocab.json'), encoding='utf-8'))
H = lambda s: [ch for ch in s if '㐀' <= ch <= '鿿']
core = []
for r_ in voc:
    if r_[4] and r_[4] <= 6: core += H(r_[0])
core += H(open(os.path.join(ROOT, 'vo/data/lessons.js'), encoding='utf-8').read())
core = list(dict.fromkeys(core))
need = set(core)
for c in list(need):
    x = MM.get(c)
    if not x: continue
    for l in leaves(x.get('decomposition', '')): need.add(l)
    e = x.get('etymology') or {}
    for k in ('semantic', 'phonetic'):
        if e.get(k): need.add(e[k])
# bộ thủ luôn có
BT = {}
for l in open(os.path.join(HERE, 'bo-thu.tsv'), encoding='utf-8'):
    l = l.rstrip('\n')
    if l: c, n, m = l.split('\t'); BT[c] = [n, m]; need.add(c)

allc = set(MM) | set(CV)
CORE = {c: rec(c) for c in sorted(need) if c in MM or c in CV}
REST = {c: rec(c) for c in sorted(allc - set(CORE)) if c in MM}
# chữ có trong tập thường gặp (để gợi ý tìm theo Hán Việt / pinyin)
common = ''.join(c for c in core if c in CORE)

os.makedirs(os.path.join(ROOT, 'chu-han/data'), exist_ok=True)
with open(os.path.join(ROOT, 'chu-han/data/core.js'), 'w', encoding='utf-8') as f:
    f.write('/* Soi chữ Hán · dữ liệu chữ thường gặp. Cấu tạo: Make Me a Hanzi (LGPL); Hán Việt + nghĩa: CVDICT (CC BY-SA 4.0); giải thích tiếng Việt: Bánh Mì. Tạo bằng tools/chu-han/build.py */\n')
    f.write('window.CH_BT=' + json.dumps(BT, ensure_ascii=False, separators=(',', ':')) + ';\n')
    f.write('window.CH_COMMON=' + json.dumps(common, ensure_ascii=False) + ';\n')
    f.write('window.CH_DATA=' + json.dumps(CORE, ensure_ascii=False, separators=(',', ':')) + ';\n')
with open(os.path.join(ROOT, 'chu-han/data/rest.json'), 'w', encoding='utf-8') as f:
    json.dump(REST, f, ensure_ascii=False, separators=(',', ':'))
print('core', len(CORE), 'rest', len(REST), 'common', len(common))

# danh sách âm tiết (pinyin số) có trong dữ liệu → tools/chu-han/syllables.json (thu giọng từng âm: gen_py.py)
TM = {'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4','ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'ü1','ǘ':'ü2','ǚ':'ü3','ǜ':'ü4'}
def tone3(p):
    p = p.strip().lower(); tone = '5'; o = ''
    for ch_ in p:
        if ch_ in TM: o += TM[ch_][0]; tone = TM[ch_][1]
        else: o += ch_
    o = o.replace('ü', 'v')
    return o + tone if re.match(r'^[a-z]*[aeiouv][a-z]*$', o) and o != 'xx' else None
SYL = {}
for src in (CORE, REST):
    for c, r_ in src.items():
        if c in '儿一不': continue
        for p_ in set((r_.get('p') or '').split(',')) | {m_[0] for m_ in r_.get('m', [])}:
            k = tone3(p_) if p_ else None
            if k and k not in SYL: SYL[k] = c
json.dump(dict(sorted(SYL.items())), open(os.path.join(HERE, 'syllables.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('syllables', len(SYL))
