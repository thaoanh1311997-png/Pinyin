"""Thu giọng AI (Kokoro v1.1-zh) cho từng âm tiết pinyin có thanh điệu → audio/py/<âm tiết số>.mp3 (vd hao3.mp3, le5.mp3, lv4.mp3).
Trang Soi chữ Hán phát đúng âm của từng cách đọc (chữ đa âm như 了 le/liǎo không bị đọc nhầm).
Dùng chung bộ chuyển âm của tools/voice/gen.py: ép pinyin cho chữ đại diện rồi để misaki đổi ra âm vị.
Chạy (cần mô hình như tools/voice/README.md): python tools/chu-han/gen_py.py
"""
import os, re, sys, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'voice'))
os.environ.setdefault('VOICES', '{"n":"zf_075","f":"zf_022","m":"zm_045"}')
import gen  # noqa: E402

OUT = os.path.join(ROOT, 'audio', 'py')
os.makedirs(OUT, exist_ok=True)
SYL = json.load(open(os.path.join(HERE, 'syllables.json'), encoding='utf-8'))
SPEED = float(os.environ.get('SPEED', '0.85'))
log, bad = {}, []
def ok(py, ph):
    if not ph.strip() or '❓' in ph: return False
    m = re.search(r'(\d)\s*$', ph)
    return bool(m) and m.group(1) == py[-1]
for py, chs in SYL.items():
    fn = os.path.join(OUT, py + '.mp3')
    ph, ch = '', None
    for c in chs:
        ph = gen.phonemes(c, [py])
        if ok(py, ph): ch = c; break
    log[py] = [ch, ph]
    if ch is None: bad.append(py); continue
    if os.path.exists(fn) and not os.environ.get('FORCE'): continue
    a = gen.trim(gen.kok.synth(ph, gen.VOICE['n'], SPEED))
    rms = np.sqrt(np.mean(a ** 2)) + 1e-9
    a = a * min(0.1 / rms, 0.95 / (np.max(np.abs(a)) + 1e-9))
    a = np.concatenate([np.zeros(int(0.04 * gen.SR), np.float32), a, np.zeros(int(0.1 * gen.SR), np.float32)])
    open(fn + '.tmp', 'wb').write(gen.mp3(a)); os.replace(fn + '.tmp', fn)
json.dump({'phonemes': log, 'bad': bad}, open(os.path.join(HERE, 'gen_py_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('done', len(SYL), 'bad', bad)
