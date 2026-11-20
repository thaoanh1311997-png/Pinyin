# Sinh game/data/hsk.js và game/data/radicals.js từ dữ liệu có sẵn + danh sách soát tay trong tools/game/
import json,re
v=json.load(open('trasua/data/vocab.json'))
cur={}
for fn in ('tools/game/hsk123.txt','tools/game/hsk3-fix.txt'):
    for l in open(fn,encoding='utf8'):
        if l.strip():
            w,p,m=l.rstrip('\n').split('|'); cur[w]=(p,m)
T4='àèìòùǜ'
def tone(s):
    for ch in s:
        for t,grp in enumerate(('āēīōūǖ','áéíóúǘ','ǎěǐǒǔǚ','àèìòùǜ')):
            if ch in grp: return t+1
    return 5
def sandhi(w,py):
    syl=py.split()
    if len(syl)!=len(w): return py
    syl=[x.lower() for x in syl]
    for i,c in enumerate(w[:-1]):
        nt=tone(syl[i+1])
        if c=='一' and syl[i]=='yī' and not (i>0 and w[i-1] in '第十') :
            syl[i]='yí' if nt==4 else 'yì'
        if c=='不' and syl[i]=='bù' and nt==4: syl[i]='bú'
    return ' '.join(syl)
V='aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
def joinpy(p):
    syl=p.split()
    out=syl[0] if syl else ''
    for s in syl[1:]:
        if s and s[0].lower() in 'aeoāáǎàēéěèōóǒò': out+="'"+s
        else: out+=s
    return out
def clean(vi):
    out=[]
    for s in re.split(r'[;；]',vi):
        s=s.strip()
        if not s or s.startswith('(') or re.search(r'biến thể|Lượng từ|Đài Loan|viết tắt|tiếng lóng|phương ngữ|họ |LT:',s): continue
        s=re.sub(r'\s*\([^)]*\)\s*',' ',s).strip(' ,.')
        if not s or len(s)>26: continue
        if s not in out: out.append(s)
        break
    return ', '.join(out)
def lv(n):
    if not n: return 0
    return min(int(c) for c in str(n))
rows=[];seen=set()
for x in v:
    w,py,hv,vi,o,t,n=x
    o=o if 1<=o<=6 else 0
    n3=lv(n)
    if not o and not n3: continue
    if w in seen: continue
    if w in cur: p,m=cur[w]
    else:
        if len(w)==1: continue
        m=clean(vi)
        if not m: continue
        p=joinpy(sandhi(w,py))
    seen.add(w)
    rows.append([w,p,m,o,n3])
rows.append(['喂','wèi','alô',1,1])
print(len(rows), sum(1 for r in rows if r[3]), sum(1 for r in rows if r[4]))
from collections import Counter
print(Counter(r[3] for r in rows), Counter(r[4] for r in rows))
with open('game/data/hsk.js','w',encoding='utf8') as f:
    f.write('/* Bánh Mì · Mini game — từ HSK. [chữ, pinyin, nghĩa ngắn, cấp HSK 2.0 (0=không), cấp HSK 3.0 (7=7–9)].\n   HSK 1–3 (2.0): nghĩa soát tay (tools/game/hsk123.txt). Còn lại: rút gọn từ từ điển của mục Trà Sữa. Sinh bằng tools/game/build_data.py */\n')
    f.write('window.GAME_HSK=')
    json.dump(rows,f,ensure_ascii=False,separators=(',',':'))
    f.write(';\n')
# radicals
raw={o['c']:o for o in json.load(open('/tmp/claude-0/rad_raw.json'))}
items=[]
for l in open('tools/game/radicals.txt',encoding='utf8'):
    c,p,m=l.rstrip('\n').split('|'); o=raw[c]
    rad_idx=0 if o['r']==o['a'] else 1
    items.append([c,p,m,o['hv'],o['L'],o['f'],o['a'],o['b'],rad_idx,o['mt'],o['s']])
with open('game/data/radicals.js','w',encoding='utf8') as f:
    f.write('/* Bánh Mì · Ghép bộ thủ. [chữ, pinyin, nghĩa, Hán Việt, cấp HSK, kiểu ghép (IDS), phần 1, phần 2, phần nào là bộ thủ (0/1), nét thuộc phần nào, nét (SVG)].\n   Cách tách chữ + nét: Make Me a Hanzi (github.com/skishore/makemeahanzi, LGPL/Arphic). Nghĩa soát tay: tools/game/radicals.txt */\n')
    f.write('window.GAME_RAD=')
    json.dump(items,f,ensure_ascii=False,separators=(',',':'))
    f.write(';\n')
