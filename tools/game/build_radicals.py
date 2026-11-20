import json,re,collections,sys
D={}
for l in open('/tmp/claude-0/dl/dict.txt',encoding='utf8'):
    j=json.loads(l); D[j['character']]=j
G={}
for l in open('/tmp/claude-0/dl/graphics.txt',encoding='utf8'):
    j=json.loads(l); G[j['character']]=j
v=json.load(open('trasua/data/vocab.json'))
vc=open('vo/data/chars.js',encoding='utf8').read(); vc=json.loads(vc[vc.index('{'):vc.rindex('}')+1])
cur={}
for l in open('tools/game/hsk123.txt',encoding='utf8'):
    w,p,m=l.rstrip('\n').split('|')
    if len(w)==1: cur[w]=(p,m)
# radical table: form -> (Hán Việt name, meaning)
R={'亻':('nhân đứng','người'),'口':('khẩu','miệng'),'扌':('thủ','tay'),'木':('mộc','cây, gỗ'),'氵':('thủy','nước'),
'讠':('ngôn','lời nói'),'辶':('sước','bước đi'),'忄':('tâm đứng','tim, tình cảm'),'纟':('mịch','sợi tơ'),'土':('thổ','đất'),
'日':('nhật','mặt trời, ngày'),'⺮':('trúc','tre'),'心':('tâm','tim, lòng'),'宀':('miên','mái nhà'),'艹':('thảo','cỏ'),
'⺼':('nhục (nguyệt)','thịt, cơ thể'),'月':('nguyệt','mặt trăng'),'女':('nữ','phụ nữ'),'刂':('đao đứng','dao'),'钅':('kim','kim loại'),
'禾':('hòa','lúa'),'贝':('bối','tiền, của cải'),'囗':('vi','vây quanh'),'攵':('phộc','đánh, hành động'),'冫':('băng','băng, lạnh'),
'目':('mục','mắt'),'石':('thạch','đá'),'力':('lực','sức'),'饣':('thực','ăn'),'灬':('hỏa (4 chấm)','lửa'),'火':('hỏa','lửa'),
'走':('tẩu','chạy, đi'),'广':('nghiễm','mái hiên'),'足':('túc','chân'),'耳':('nhĩ','tai'),'衤':('y','áo'),'巾':('cân','khăn'),
'子':('tử','con'),'王':('ngọc','ngọc'),'页':('hiệt','đầu'),'穴':('huyệt','hang'),'欠':('khiếm','há miệng'),'立':('lập','đứng'),
'礻':('thị','thần, cúng tế'),'车':('xa','xe'),'马':('mã','ngựa'),'米':('mễ','gạo'),'雨':('vũ','mưa'),'门':('môn','cửa'),
'疒':('nạch','bệnh'),'田':('điền','ruộng'),'犭':('khuyển','chó, thú'),'鸟':('điểu','chim'),'鱼':('ngư','cá'),'虫':('trùng','sâu bọ'),
'见':('kiến','nhìn'),'酉':('dậu','rượu'),'皿':('mãnh','bát, đĩa'),'彳':('xích','bước chân'),'阝':('phụ/ấp','gò đất / vùng đất'),
'山':('sơn','núi'),'羊':('dương','dê, cừu'),'舟':('chu','thuyền'),'户':('hộ','cửa'),'白':('bạch','trắng'),'大':('đại','to lớn'),
'夕':('tịch','buổi tối'),'寸':('thốn','tấc'),'牜':('ngưu','trâu bò'),'牛':('ngưu','trâu bò'),'方':('phương','vuông, hướng'),'刀':('đao','dao'),
'⻊':('túc','chân'),'𧾷':('túc','chân'),'⺈':('đao','dao'),'衣':('y','áo'),'示':('thị','thần'),'水':('thủy','nước'),'人':('nhân','người'),'手':('thủ','tay'),'言':('ngôn','lời nói'),'食':('thực','ăn'),'金':('kim','kim loại'),'糸':('mịch','sợi tơ')}
def cjk(c): return '一'<=c<='鿿' or c in R
lvl={}
for x in v:
    if 1<=x[4]<=6:
        for ch in x[0]: lvl[ch]=min(lvl.get(ch,9),x[4])
life=open('game/data/life.js',encoding='utf8').read()
for ch in set(re.findall(r"\['([^']+)'",life)):
    for c in ch:
        if '一'<=c<='鿿': lvl.setdefault(c,3)
def joinpy(p): return p
out=[]
for ch,L in sorted(lvl.items(),key=lambda t:t[1]):
    if L>4 or ch not in D or ch not in G: continue
    j=D[ch]; dec=j.get('decomposition','')
    m=re.fullmatch(r'([⿰⿱⿸⿺⿹⿵⿶⿷⿴])(.)(.)',dec)
    if not m: continue
    a,b=m.group(2),m.group(3)
    if not (cjk(a) and cjk(b)): continue
    sem=(j.get('etymology') or {}).get('semantic') or j.get('radical')
    if sem not in (a,b) or sem not in R: continue
    other=b if sem==a else a
    if other in R and not '一'<=other<='鿿': continue
    py=j['pinyin'][0]
    if ch in cur: py,mean=cur[ch]; hv=''
    else: mean=''
    hv=''
    for e in vc.get(ch,[]):
        if e[0]==py and e[1]:
            hv=e[1]
            if not mean:
                segs=[s.strip() for s in re.split(r'[;；]',e[2]) if s.strip() and not s.strip().startswith('(') and 'biến thể' not in s]
                mean=', '.join(segs[:2])
            break
    if not mean: continue
    match=[ (mm[0] if mm else -1) for mm in j['matches']]
    out.append(dict(c=ch,p=py,m=mean,hv=hv,L=L,f=m.group(1),a=a,b=b,r=sem,o=other,mt=match,s=G[ch]['strokes']))
print(len(out),file=sys.stderr)
json.dump(out,open('/tmp/claude-0/rad_raw.json','w'),ensure_ascii=False)
for o in out: print(o['L'],o['c'],o['p'],o['hv'],'|',o['m'],'|',o['f']+o['a']+o['b'],'r='+o['r'])
