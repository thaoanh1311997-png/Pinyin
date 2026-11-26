// Bánh Mì · gom mọi câu/từ tiếng Trung có nút đọc trên web → tools/voice/items.json (để thu sẵn giọng AI).
// Chạy: node tools/voice/extract.cjs
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const V = require(path.join(ROOT, 'shared/voice.js'));
const PY = require(path.join(ROOT, 'trasua/lib/pinyin-pro.js'));
// cùng bộ sửa pinyin như trang Trà Sữa (app.js dòng customPinyin + fixPy)
const app = fs.readFileSync(path.join(ROOT, 'trasua/app.js'), 'utf8');
const cp = app.match(/PY\.customPinyin\((\{[\s\S]*?\})\);/)[1];
PY.customPinyin(vm.runInNewContext('(' + cp + ')'));
const fixSrc = app.slice(app.indexOf('var DE_NEXT'), app.indexOf('function pyAll'));
const ctx = { isCJK: c => /[㐀-鿿]/.test(c) }; vm.createContext(ctx); vm.runInContext(fixSrc, ctx);

const CJK = /[㐀-鿿]/;
const PYRE = /^[a-zA-Züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ’'\s·,.\-…!?！？，。]+$/;
const out = new Map(); const srcCount = {};
function add(text, who, py, src) {
  if (typeof text !== 'string' || !CJK.test(text)) return;
  const k = V.norm(text); if (!k || /[A-Za-z]/.test(k) || k.length > 400) return;
  who = who || 'n';
  const id = who + '|' + k;
  const old = out.get(id);
  if (old) { if (!old.py && py) old.py = py; return; }
  out.set(id, { who, k, py: py || null, src }); srcCount[src] = (srcCount[src] || 0) + 1;
}
function load(file, names) {
  const sb = { window: {}, document: { write() {} } }; sb.window.window = sb.window;
  vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sb);
  return names.map(n => sb.window[n]);
}
// mảng [chữ, pinyin, ...] ở bất kỳ đâu → lấy kèm pinyin; muốn lấy mọi chuỗi CJK thì all=true
function walk(o, src, all) {
  if (Array.isArray(o)) {
    for (let i = 0; i < o.length; i++) {
      const a = o[i], b = o[i + 1];
      if (typeof a === 'string' && CJK.test(a) && typeof b === 'string' && b && PYRE.test(b) && /[a-zü]/i.test(b)) add(a, 'n', b, src);
      else if (typeof a === 'string' && all) add(a, 'n', null, src);
      else walk(a, src, all);
    }
  } else if (o && typeof o === 'object') for (const k in o) { const v = o[k]; if (typeof v === 'string' && all) add(v, 'n', null, src); else walk(v, src, all); }
}
const ROLE = /^(男|女|问|A|B)[：:]\s*/;
function script(s, src) {
  String(s).split('\n').forEach(l => {
    l = l.trim(); if (!l) return; let who = 'n'; const m = l.match(ROLE);
    if (m) { who = m[1] === '男' || m[1] === 'B' ? 'm' : m[1] === '女' || m[1] === 'A' ? 'f' : 'n'; l = l.slice(m[0].length); }
    add(l, who, null, src);
  });
}

// ---- Trà Sữa
for (const f of ['stories', 'stories2', 'stories3', 'easy']) {
  const [S, E] = load('trasua/data/' + f + '.js', ['STORY', 'EASY']);
  (S || E).forEach(st => { add(st.t, 'n', null, 'trasua-story'); st.s.forEach(x => add(x[0], 'n', null, 'trasua-story')); });
}
{ const [P] = load('trasua/data/phrases.js', ['PHRASES']); P.forEach(t => t.p.forEach(p => add(p[0], 'n', null, 'trasua-phrase'))); }
{ const [R] = load('trasua/data/roleplay.js', ['ROLEPLAY']); R.forEach(r => r.turns.forEach(t => { add(t.q[0], 'n', null, 'trasua-roleplay'); (t.a || []).forEach(a => add(a[0], 'n', null, 'trasua-roleplay')); })); }
for (let lv = 1; lv <= 6; lv++) {
  const [B] = load('trasua/data/hsk' + lv + '.js', ['HSKB']); const bank = B[lv];
  for (const sec in bank) {
    if (!/^L/.test(sec)) continue;
    (function w(o) {
      if (Array.isArray(o)) return o.forEach(w);
      if (!o || typeof o !== 'object') return;
      if (typeof o.a === 'string') script(o.a, 'trasua-hsk');
      if (typeof o.q === 'string') add(o.q, 'n', null, 'trasua-hsk');
      for (const k in o) if (typeof o[k] === 'object') w(o[k]);
    })(bank[sec]);
  }
}
{ const [G] = load('trasua/data/grammar.js', ['GRAMMAR']); for (const lv in G) G[lv].forEach(g => (g.e || []).forEach(e => add(e[0], 'n', e[1], 'trasua-grammar'))); }
JSON.parse(fs.readFileSync(path.join(ROOT, 'trasua/data/vocab.json'), 'utf8')).forEach(v => add(v[0], 'n', v[1], 'vocab'));

// ---- Game
for (const f of ['hsk', 'life', 'talk', 'world', 'radicals']) {
  const sb = { window: {} }; sb.window.window = sb.window; vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'game/data/' + f + '.js'), 'utf8'), sb);
  for (const k in sb.window) { if (k === 'window') continue;
    if (f === 'radicals') sb.window[k].forEach(r => add(r[0], 'n', r[1], 'game'));
    else walk(sb.window[k], 'game', false);
  }
}
['恭喜你！你升级了！', '早上好！'].forEach(t => add(t, 'n', null, 'game'));

// ---- Trang chủ
{ const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hi = h.match(/var HI=(\[[\s\S]*?\]\]);/); if (hi) vm.runInNewContext(hi[1]).forEach(x => add(x[0], 'n', null, 'home'));
  const q = h.match(/var Q=(\[[\s\S]*?\]);\n/); if (q) vm.runInNewContext(q[1]).forEach(x => add(x[0], 'n', x[1] && PYRE.test(x[1]) ? x[1] : null, 'home')); }

// ---- Video: bài mẫu
{ const h = fs.readFileSync(path.join(ROOT, 'video/index.html'), 'utf8');
  const m = h.match(/const SAMPLES=(\[[\s\S]*?\n\]);/); if (m) vm.runInNewContext(m[1]).forEach(x => x.L.forEach(l => add(l[0], 'n', null, 'video'))); }
{ const sb = { window: {} }; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(ROOT, 'video/samples.js'), 'utf8'), sb);
  (sb.window.BB_SAMPLES || []).forEach(x => x.L.forEach(l => add(l[0], 'n', null, 'video'))); }

// ---- Ôn thi: tài liệu có sẵn (từ vựng)
{ const sb = { window: {} }; sb.window.window = sb.window; vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'on-thi/data/doc-hn4-15-25.js'), 'utf8'), sb);
  sb.window.ONTHI_DOCS.forEach(d => d.lessons.forEach(l => (l.vocab || []).forEach(v => add(v[0], 'n', v[1], 'onthi')))); }

// pinyin từng chữ (dạng số, chưa biến điệu) để giọng AI đọc đúng như pinyin hiện trên web
const TONE = { 'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4','ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4','ü':'v0' };
function num(sy) { // 'zhǎng' → 'zhang3'; không dấu → thanh nhẹ 5
  let t = 5, b = ''; for (const c of sy.normalize('NFC')) { if (TONE[c]) { const [l, n] = TONE[c]; b += l; if (n !== '0') t = +n; } else b += c; }
  return b.toLowerCase() + t;
}
function alignGiven(k, given) { // ghép pinyin cho sẵn (vd 'bàba') với từng chữ, nhờ danh sách âm đọc của từng chữ
  let g = given.normalize('NFC').toLowerCase().replace(/[\s'’·\-]/g, ''), res = [];
  for (const ch of k) {
    if (!CJK.test(ch)) { res.push(null); g = g.replace(/^[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+/, ''); continue; }
    if (ch === '儿' && g[0] === 'r' && !/^r[aeiouāáǎàēéěèīíǐìōóǒòūúǔùü]/.test(g)) { res.push('er5'); g = g.slice(1); continue; }
    const cands = [...new Set((PY.polyphonic(ch, { type: 'array' })[0] || []).concat(PY.pinyin(ch, { type: 'array' }), ch === '一' ? ['yí', 'yì', 'yī'] : ch === '不' ? ['bú', 'bù'] : []))].sort((a, b) => b.length - a.length);
    let hit = cands.find(c => g.startsWith(c));
    if (hit) { res.push(num(hit)); g = g.slice(hit.length); continue; }
    const bare = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/u\u0308/g, 'ü');
    hit = cands.find(c => g.startsWith(bare(c)) && bare(c).length);
    if (hit) { res.push(bare(hit).replace(/ü/g, 'v') + '5'); g = g.slice(bare(hit).length); continue; }
    return null;
  }
  return g.replace(/[^a-z]/g, '') ? null : res;
}
// Câu riêng tư (hỏi đáp bài nghe giáo trình, nằm trong gói mã hoá): EXTRA=<file .json mảng chữ> → thu thêm, chỉ lưu mã băm vào keep-private.json
const EXTRA = process.env.EXTRA ? JSON.parse(fs.readFileSync(process.env.EXTRA, 'utf8')) : null;
if (EXTRA) EXTRA.forEach(t => add(t, 'n', null, 'private'));
let gFail = 0;
for (const it of out.values()) {
  const r = ctx.fixPy(PY.pinyin(it.k, { type: 'all', toneSandhi: false }));
  it.ref = [...it.k].map((c, i) => r[i] && r[i].isZh ? num(r[i].pinyin) : null);
  if (it.py) { const a = alignGiven(it.k, it.py); if (a) { it.gv = a; } else { gFail++; if (process.env.DBG && gFail < 40) console.log('NOALIGN', it.k, it.py); } }
  delete it.py;
  const kk = V.key(it.who, it.k); it.hex = kk.hex; it.lo = kk.lo;
}
console.log('given pinyin not aligned:', gFail);
const items = [...out.values()];
fs.writeFileSync(path.join(__dirname, 'items.json'), JSON.stringify(items));
if (EXTRA) {
  const priv = items.filter(it => it.src === 'private');
  fs.writeFileSync(path.join(__dirname, 'items-private.json'), JSON.stringify(priv)); // chỉ dùng trên máy thu giọng, không đưa lên web
  fs.writeFileSync(path.join(__dirname, 'keep-private.json'), JSON.stringify(priv.map(it => [it.lo, it.hex])));
}
console.log(items.length, srcCount);
if (process.env.DBG) { /* debug */ }
