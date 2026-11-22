// Build data/grammar.js from the official HSK 2025 syllabus grammar list
// (tools/grammar-src/grammar-2025.tsv, from chinesetest.cn via chelsea6502/hsk-2025-data)
// + hand-written Vietnamese in tools/grammar-vi/HSK*.txt. Pinyin is generated here with
// the same pinyin-pro + fixes the app uses, plus extra fixes in tools/grammar-vi/py-fix.txt.
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = path.join(__dirname, '..');
const ctx = { window: {}, console };
ctx.self = ctx.window; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(T + '/lib/pinyin-pro.js', 'utf8'), ctx);
ctx.pinyinPro = ctx.window.pinyinPro || ctx.pinyinPro;
const app = fs.readFileSync(T + '/app.js', 'utf8');
const a = app.indexOf('var PY = window.pinyinPro;'), b = app.indexOf('function pyWord');
let code = app.slice(a, b).replace('window.pinyinPro', 'pinyinPro');
code += '\nfunction isCJK(c){return /[\\u3400-\\u9fff]/.test(c)}';
vm.runInContext(code, ctx);
// context overrides: "上下文 => syllables for the CJK chars of that context" (later lines win)
const CTX = [];
const fixFile = __dirname + '/grammar-vi/py-fix.txt';
if (fs.existsSync(fixFile)) fs.readFileSync(fixFile, 'utf8').split('\n').forEach(l => { const m = l.split('=>'); if (m.length === 2) CTX.push([m[0].trim(), m[1].trim().split(/\s+/)]); });
CTX.forEach(([k, v]) => { const n = [...k].filter(c => /[㐀-鿿]/.test(c)).length; if (n !== v.length) { console.error('py-fix length', k, v); process.exitCode = 1; } });
const MEAS = '一二两三四五六七八九十几这那哪每半某';
function rules(r) {
  for (let i = 0; i < r.length; i++) {
    const x = r[i]; if (!x.isZh) continue;
    const pv = r[i - 1] ? r[i - 1].origin : '#', nx = r[i + 1] ? r[i + 1].origin : '#', nx2 = r[i + 2] ? r[i + 2].origin : '#';
    if (x.origin === '只' && x.pinyin === 'zhī' && MEAS.indexOf(pv) < 0) x.pinyin = 'zhǐ';
    else if (x.origin === '干' && /^g[aā]n$/.test(x.pinyin)) x.pinyin = ('净脆燥杯'.includes(nx) || pv === '若' || (nx === '干' && nx2 === '净')) ? 'gān' : 'gàn';
    else if (x.origin === '儿') x.pinyin = ('子女童'.includes(nx) || '女婴幼胎孤健男'.includes(pv) || pv === '#') ? 'ér' : 'r';
    else if (x.origin === '教') x.pinyin = ('室育授材学训练师'.includes(nx) || '请主宗'.includes(pv)) ? 'jiào' : 'jiāo';
  }
  return r;
}
function applyCtx(s, r) {
  const chars = r.map(x => x.origin).join(''), at = [];
  r.forEach((x, t) => { for (let q = 0; q < x.origin.length; q++) at.push(t); });
  for (const [k, v] of CTX) {
    let i = chars.indexOf(k);
    while (i >= 0) { let j = 0; for (let t = at[i]; t <= at[i + k.length - 1]; t++) if (r[t].isZh) r[t].pinyin = v[j++]; i = chars.indexOf(k, i + 1); }
  }
  return r;
}
const isZh = c => /[㐀-鿿]/.test(c);
function py(s) {
  const r = applyCtx(s, rules(ctx.pyAll(s)));
  if (r.map(x => x.origin).join('') !== s) { console.error('origin mismatch', s); process.exitCode = 1; }
  return r.filter(x => x.isZh).map(x => x.pinyin).join(' ');
}
const rows = fs.readFileSync(__dirname + '/grammar-src/grammar-2025.tsv', 'utf8').trim().split('\n').slice(1).map(l => l.split('\t'));
const LV = { HSK1: '1', HSK2: '2', HSK3: '3', HSK4: '4', HSK5: '5', HSK6: '6', 'HSK7-9': '7' };
const out = {}; let err = 0, nEx = 0;
const clean = s => s.replace(/([一-鿿？。！，])\s*[123](?=[，。？！；\s]|、(?![0-9])|$)/g, '$1').replace(/(呢|吧|了|还|都|再|和|的|就|又|才|也|得|着|过|地|是|跟|从|给|向|为|对|把|可|啊|比|往|让|叫)[123](?![0-9]|、[0-9])/g, '$1').trim();
// content line: keep sense numbers as superscripts (才¹ 才²), keep 宾语1/动词2/主谓句1：
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const cleanZ = s => s.replace(/([一-鿿])([1-9])(?![0-9+：:])/g, (m, c, d) => /[语词句法]/.test(c) ? m : c + SUP[d]).replace(/\s+、/g, '、').trim();
for (const L of Object.keys(LV)) {
  const f = __dirname + '/grammar-vi/' + L + '.txt';
  const lvRows = rows.filter(r => r[0] === L);
  if (!fs.existsSync(f)) { out[LV[L]] = null; continue; }
  const blocks = {};
  fs.readFileSync(f, 'utf8').split(/\n(?=## )/).forEach(bk => {
    const m = bk.match(/^## (\d+)/); if (!m) return;
    const o = { ex: [], add: [] };
    bk.split('\n').slice(1).forEach(l => {
      if (l.startsWith('t: ')) o.t = l.slice(3).trim();
      else if (l.startsWith('d: ')) o.d = l.slice(3).trim();
      else if (l.startsWith('c: ')) o.c = l.slice(3).trim().split('/');
      else if (l.startsWith('z: ')) o.z = l.slice(3).trim();
      else if (l.startsWith('- ')) o.ex.push(l.slice(2).trim());
      else if (l.startsWith('+ ')) { const p = l.slice(2).split(' | '); o.add.push([p[0].trim(), (p[1] || '').trim()]); }
      else if (l.startsWith('~ ')) { const p = l.slice(2).split(' | '); (o.fix = o.fix || {})[+p[0]] = p[1].trim(); }
      else if (l.trim() === '! own') o.own = true;
      else if (l.startsWith('x ')) o.drop = (o.drop || []).concat(+l.slice(2));
    });
    blocks[m[1]] = o;
  });
  out[LV[L]] = lvRows.map((r, i) => {
    const n = i + 1, o = blocks[n];
    if (!o) { console.error(L, n, 'MISSING'); err++; return null; }
    let cases = r[5] ? r[5].split('|').map(s => s.trim()).filter(Boolean) : [];
    if (o.own) cases = [];
    if (!o.own && o.ex.length !== cases.length) { console.error(L, n, 'count', o.ex.length, 'vs', cases.length, cases); err++; }
    let ex = cases.map((zh, k) => [o.fix && o.fix[k + 1] ? o.fix[k + 1] : clean(zh), o.ex[k] || '']);
    if (o.drop) ex = ex.filter((_, k) => !o.drop.includes(k + 1));
    ex = ex.concat(o.add);
    ex = ex.map(([z, v]) => { nEx++; return [z, py(z), v]; });
    if (!o.t || !o.d) { console.error(L, n, 'no t/d'); err++; }
    const c = o.c || [r[2], r[3], r[4]];
    return { n, c, z: o.z ? o.z : cleanZ(r[1]), t: o.t, d: o.d, e: ex };
  });
}
fs.writeFileSync(T + '/data/grammar.js', '/* HSK grammar (official 2025 syllabus) + Vietnamese — generated by tools/build-grammar.cjs, do not edit */\nwindow.GRAMMAR=' + JSON.stringify(out) + ';\n');
console.log('points', Object.values(out).filter(Boolean).reduce((s, a) => s + a.length, 0), 'examples', nEx, 'errors', err);
process.exit(err ? 1 : 0);
