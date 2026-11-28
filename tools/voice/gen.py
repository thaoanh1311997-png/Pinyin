import sys, os, json, re, numpy as np, warnings, time
warnings.filterwarnings('ignore')
os.environ.setdefault('NT', '2')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kok
from misaki import zh_frontend
from pypinyin import lazy_pinyin, Style
import lameenc

VOICE = json.loads(os.environ.get('VOICES', '{"n":"zf_001","f":"zf_005","m":"zm_010"}'))
OUT = os.environ.get('OUT', '/home/user/tts/audio')
SR = 24000

# ---- pinyin tham chiếu → thay cho pypinyin trong misaki (rồi misaki tự biến điệu 3-3, 一, 不, thanh nhẹ)
CTX = {'k': '', 'ref': None, 'gv': None, 'pos': 0, 'fix': {}}
INI = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']
def split_py(p):  # 'zhang3' → ('zh','ang3') theo kiểu pypinyin (INITIALS + FINALS_TONE3)
    base, t = p[:-1], p[-1]
    base = base.replace('ü', 'v')
    ini = ''
    for i in INI:
        if base.startswith(i): ini = i; break
    fin = base[len(ini):]
    if ini in ('y', 'w'):  # pypinyin: y/w không phải thanh mẫu
        full = base
        m = {'yi': 'i', 'ya': 'ia', 'ye': 'ie', 'yao': 'iao', 'you': 'iou', 'yan': 'ian', 'yin': 'in', 'yang': 'iang', 'ying': 'ing', 'yong': 'iong', 'yu': 'v', 'yue': 've', 'yuan': 'van', 'yun': 'vn', 'yo': 'io',
             'wu': 'u', 'wa': 'ua', 'wo': 'uo', 'wai': 'uai', 'wei': 'uei', 'wan': 'uan', 'wen': 'uen', 'wang': 'uang', 'weng': 'ueng'}
        ini, fin = '', m.get(full, fin)
    else:
        if ini in ('j', 'q', 'x') and fin.startswith('u'): fin = 'v' + fin[1:]
        fin = {'ui': 'uei', 'iu': 'iou', 'un': 'uen'}.get(fin, fin)
    return ini, fin + t

orig = zh_frontend.ZHFrontend._get_initials_finals
# Sửa tay: chỗ cả hai bộ chuyển pinyin tự động đều có thể đọc sai (đã soát từng câu trên web)
FIX = [('七天假', 2, 'jia4'), ('一天假', 2, 'jia4'), ('只需要', 0, 'zhi3'), ('只花', 0, 'zhi3'), ('只背', 0, 'zhi3'), ('不少年', 1, 'shao3'), ('干完', 0, 'gan4'), ('相同', 0, 'xiang1'), ('听着', 1, 'zhe5'), ('种庄稼', 0, 'zhong4'), ('完整的觉', 3, 'jiao4'), ('一定都', 2, 'dou1'), ('很多重要', 2, 'zhong4'), ('词汇量', 2, 'liang4'), ('还给', 0, 'huan2'), ('天得让', 1, 'dei3'), ('路得小心', 1, 'dei3'), ('们得提前', 1, 'dei3'), ('都得提前', 1, 'dei3'), ('也得搬', 1, 'dei3'), ('受得了', 1, 'de5'), ('午有空', 2, 'kong4'), ('发通知了', 3, 'le5'),
       ('人参加', 1, 'can1'), ('着急', 0, 'zhao2'), ('生长', 1, 'zhang3'), ('能长一', 1, 'zhang3'), ('长成了', 0, 'zhang3'),
       ('看中文', 1, 'zhong1'), ('看中国', 1, 'zhong1'), ('多少年', 1, 'shao3'), ('出口量', 2, 'liang4'), ('适量', 1, 'liang4'),
       ('有空吗', 1, 'kong4'), ('一有空', 2, 'kong4'), ('有空常', 1, 'kong4'), ('有空的', 1, 'kong4'), ('有空时', 1, 'kong4'), ('有空儿', 1, 'kong4'), ('倒了一杯', 0, 'dao4'), ('倒水', 0, 'dao4'), ('倒空', 0, 'dao4'), ('倒进', 0, 'dao4'), ('提供', 1, 'gong1'),
       ('涨红', 0, 'zhang4'), ('只比', 0, 'zhi3'), ('只带', 0, 'zhi3'), ('只读', 0, 'zhi3'), ('大城市', 0, 'da4'), ('项目的', 2, 'de5'),
       ('特地', 1, 'di4'), ('地步', 0, 'di4'), ('喀什', 1, 'shi2'), ('古都', 1, 'du1'), ('有朝一日', 1, 'zhao1'), ('改行', 1, 'hang2'),
       ('管不着', 2, 'zhao2'), ('用不着', 2, 'zhao2'), ('犯不着', 2, 'zhao2'), ('睡不着', 2, 'zhao2'), ('磅礴', 0, 'pang2'), ('乐感', 0, 'yue4'),
       ('当天', 0, 'dang4'), ('当晚', 0, 'dang4'), ('豁达', 0, 'huo4'), ('挨饿', 0, 'ai2'), ('切成', 0, 'qie1'), ('切碎', 0, 'qie1'),
       ('好处', 1, 'chu4'), ('结果', 0, 'jie2'), ('看好', 0, 'kan4'), ('参加', 0, 'can1'), ('长时间', 0, 'chang2'),
       ('舍不得', 0, 'she3'), ('不舍', 1, 'she3'), ('踏实', 0, 'ta1'), ('借阅量', 2, 'liang4'), ('盛饭', 0, 'cheng2'), ('盛得', 0, 'cheng2'), ('好学生', 0, 'hao3'), ('种着', 0, 'zhong4'), ('长着', 0, 'zhang3'), ('节目的', 2, 'de5'), ('应该', 0, 'ying1'), ('夹着', 0, 'jia1'), ('地名', 0, 'di4'), ('习惯地', 2, 'de5'), ('地区', 0, 'di4'), ('地方', 0, 'di4'),
       ('长城', 0, 'chang2'), ('伤着', 1, 'zhao2'), ('吃得了', 2, 'liao3'), ('系好', 0, 'ji4')]
DI_V = '说笑问看走跑叫喊哭想回答摇站坐举抽喝吃写读听做跟把对向给离过去来告拿放接望流敲握留讲唱增变努睡等准帮抱跳拍介研解提让请叹冲推拉打扶摸亲微大'
DI_N = '当土本外各此天草场陆盆田营驻原境内基耕林墓圣湿余空大目的高'
NUMW = '一二三四五六七八九十两几这那哪每多半百千万'
DAO3 = ('倒闭', '倒霉', '摔倒', '打倒', '跌倒', '倒下', '晕倒', '病倒', '绊倒', '推倒', '倒塌', '颠倒', '倒班', '倒车', '压倒', '倒卖', '倒手', '撞倒', '吓倒', '难倒', '累倒', '滑倒', '倒在')
def fixes(k):
    out = {}
    for w, i, py in FIX:
        st = 0
        while True:
            j = k.find(w, st)
            if j < 0: break
            out[j + i] = py; st = j + 1
    if len(k) <= 2: return out   # từ đơn: theo dữ liệu từ điển
    for j, c in enumerate(k):
        if j in out: continue
        pv, nx = k[j - 1] if j else '', k[j + 1] if j + 1 < len(k) else ''
        if c == '只': out[j] = 'zhi1' if pv and pv in NUMW and not (nx and nx in '是要好有能得见会剩想不顾') and k[j - 2:j] != '最多' else 'zhi3'
        elif c == '倒': out[j] = 'dao3' if any(k.find(w) >= 0 and k.find(w) <= j < k.find(w) + 2 for w in DAO3) else 'dao4'
        elif c == '地' and pv and ((j >= 2 and k[j - 2] == pv) or (nx and pv not in DI_N and (nx in DI_V or k[j + 1:j + 3] == '点头'))): out[j] = 'de5'
        elif c == '量' and (pv + c) not in ('商量', '思量', '打量', '酌量'): out[j] = 'liang2' if (nx in '一体血了' and nx) or (pv and pv in '先计去给来再') else 'liang4'
    return out

def norm_py(r, ini_ctx=None):
    ri, rf = split_py(r)
    if re.match(r'i\d', rf):
        if ri in ('z', 'c', 's'): rf = 'ii' + rf[1:]
        elif ri in ('zh', 'ch', 'sh', 'r'): rf = 'iii' + rf[1:]
    return ri, rf

STAT = {'base': 0, 'tone': 0}
def patched(self, word):
    ini, fin = orig(self, word)
    k = CTX['k']; P = CTX['ref']; Gv = CTX['gv']; F = CTX['fix']
    p = k.find(word, CTX['pos'])
    if p < 0 or len(fin) != len(word): return ini, fin
    CTX['pos'] = p + len(word)
    for i in range(len(word)):
        ch = word[i]
        if ch in '儿一不': continue
        cands = []
        if (p + i) in F: cands = [F[p + i]]
        else:
            for src in (Gv, P):
                r = src[p + i] if src and p + i < len(src) else None
                if r and re.match(r'^[a-zv]+[1-5]$', r): cands.append(r)
        if not cands: continue
        M = (ini[i], fin[i])
        Ms = [norm_py(c) for c in cands]
        if (p + i) in F: pick = Ms[0]
        elif len(Ms) == 2:
            g, pp = Ms
            b = lambda x: (x[0], x[1][:-1])
            if b(g) == b(pp): pick = g          # dữ liệu cho sẵn & bộ trên web khớp âm
            elif b(g) == b(M): pick = g if g[1][-1] != '5' or M[1][-1] == '5' else M
            elif b(pp) == b(M): pick = pp
            else: pick = g
        else: pick = Ms[0]
        if pick == M: continue
        if (pick[0], pick[1][:-1]) != (M[0], M[1][:-1]):
            STAT['base'] += 1; ini[i], fin[i] = pick
        elif pick[1][-1] == '5' or M[1][-1] != '5' or (p + i) in F or Gv:
            STAT['tone'] += 1; fin[i] = pick[1]
    return ini, fin
zh_frontend.ZHFrontend._get_initials_finals = patched

def phonemes(text, ref, gv=None):
    CTX.update(k=text, ref=ref, gv=gv, pos=0, fix=fixes(text))
    try: return kok.G(text)[0]
    finally: CTX.update(ref=None, gv=None, fix={})

def split_long(text):
    parts = re.findall(r'[^。！？!?；;]+[。！？!?；;”]*', text) or [text]
    out = []
    for p in parts:
        if len(p) <= 90: out.append(p); continue
        cur = ''
        for s in re.findall(r'[^，,、：:]+[，,、：:]*', p):
            if len(cur + s) > 80 and cur: out.append(cur); cur = s
            else: cur += s
        if cur: out.append(cur)
    return out

def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx): return a
    s = max(0, idx[0] - int(0.02 * SR)); e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

def render(it):
    text, who = it['k'], it['who']
    word = len(re.sub(r'[^㐀-鿿]', '', text)) <= 4 and not re.search(r'[，。！？,.!?]', text[:-1])
    speed = 0.9 if word else 0.95
    pieces = []
    pos = 0
    for part in split_long(text):
        p = text.find(part, pos); pos = p + len(part)
        ref = it['ref'][p:p + len(part)] if it.get('ref') and p >= 0 else None
        gv = it['gv'][p:p + len(part)] if it.get('gv') and p >= 0 else None
        ph = phonemes(part, ref, gv)
        if not ph.strip() or '❓' in ph: return None, ph
        a = kok.synth(ph, VOICE[who], speed)
        pieces.append(trim(a))
        pieces.append(np.zeros(int(0.28 * SR), np.float32))
    a = np.concatenate(pieces[:-1])
    rms = np.sqrt(np.mean(a ** 2)) + 1e-9
    a = a * min(0.1 / rms, 0.95 / (np.max(np.abs(a)) + 1e-9))
    a = np.concatenate([np.zeros(int(0.05 * SR), np.float32), a, np.zeros(int(0.12 * SR), np.float32)])
    return a, ph

def mp3(a):
    e = lameenc.Encoder(); e.set_bit_rate(32); e.set_in_sample_rate(SR); e.set_channels(1); e.set_quality(2)
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
    return e.encode(pcm) + e.flush()

if __name__ == '__main__':
    items = json.load(open(sys.argv[1]))
    shard, nshard = int(sys.argv[2]), int(sys.argv[3])
    bad = []
    t0 = time.time(); n = 0
    for i, it in enumerate(items):
        if i % nshard != shard: continue
        fn = f"{OUT}/{it['hex'][:2]}/{it['hex']}.mp3"
        if os.path.exists(fn): continue
        a, ph = render(it)
        if a is None: bad.append([it['k'], ph]); continue
        os.makedirs(os.path.dirname(fn), exist_ok=True)
        open(fn + '.tmp', 'wb').write(mp3(a)); os.replace(fn + '.tmp', fn)
        n += 1
        if n % 200 == 0: print(shard, n, round(time.time() - t0), STAT, flush=True)
    json.dump(bad, open(f'{OUT}/bad-{shard}.json', 'w'), ensure_ascii=False)
    print('DONE', shard, n, len(bad), STAT, flush=True)
