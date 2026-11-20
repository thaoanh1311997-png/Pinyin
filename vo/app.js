/* Bánh Mì · Vở tập viết chữ Hán */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  /* ================= cấu hình ================= */
  var PAGE = { w: 210, h: 297, cw: 190, top: 10, bottom: 286 };
  var GRIDS = [
    { id: 'tian', zh: '田字格', vi: 'Ô chữ điền' },
    { id: 'mi', zh: '米字格', vi: 'Ô chữ mễ' },
    { id: 'hui', zh: '回宫格', vi: 'Ô hồi cung' },
    { id: 'jiu', zh: '九宫格', vi: 'Ô cửu cung' },
    { id: 'fang', zh: '方格', vi: 'Ô trơn' }
  ];
  var SIZES = [{ s: 12, n: 'Nhỏ' }, { s: 15, n: 'Vừa' }, { s: 18, n: 'Lớn' }, { s: 22, n: 'Rất lớn' }, { s: 27, n: 'Cho bé' }];
  var COLORS = [
    { id: 'red', c: '#E0565B', t: '#C92A2F' }, { id: 'green', c: '#2E9E6A', t: '#1E7A50' }, { id: 'blue', c: '#3B7DD8', t: '#215FB5' },
    { id: 'purple', c: '#8A63D2', t: '#6941B8' }, { id: 'orange', c: '#EE8A2A', t: '#C2600B' }, { id: 'gray', c: '#8D8D8D', t: '#555' }
  ];
  var DEF = {
    text: '你好 写字 学习', split: false, grid: 'tian', size: 15, rows: 2, hint: 4, next: 'one', fade: true, model: true,
    showStroke: true, showPy: true, showHv: true, showMean: true, color: 'red', header: true, title: 'Vở tập viết chữ Hán',
    nameLine: true, footer: true, edits: {}
  };
  var S = Object.assign({}, DEF, lsGet('bm.vo.s', {}));
  if (!S.edits || typeof S.edits !== 'object') S.edits = {};
  function save() { if (S.lib) { var ks = Object.keys(S.lib); if (ks.length > 600) ks.slice(0, ks.length - 600).forEach(function (k) { delete S.lib[k]; }); } lsSet('bm.vo.s', S); }
  function nCells() { return Math.floor(PAGE.cw / S.size); }
  function colorOf() { return COLORS.filter(function (c) { return c.id === S.color; })[0] || COLORS[0]; }

  var F = {
    han: '"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
    ui: 'Inter,"Helvetica Neue",Arial,sans-serif',
    title: 'Nunito,Inter,"Helvetica Neue",Arial,sans-serif'
  };
  var HAN = /[⺀-⿟㇀-㇯〇㐀-䶿一-鿿豈-﫿]/;

  /* ================= dữ liệu nét chữ ================= */
  var SD = {}, SDP = {};
  var CDN = ['https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/', 'https://unpkg.com/hanzi-writer-data@2.0.1/'];
  function strokeData(ch) {
    if (SDP[ch]) return SDP[ch];
    var i = 0;
    SDP[ch] = new Promise(function (res) {
      (function next() {
        if (i >= CDN.length) { SD[ch] = null; return res(null); }
        fetch(CDN[i++] + encodeURIComponent(ch) + '.json').then(function (r) {
          if (r.status === 404) { SD[ch] = null; return res(null); }
          if (!r.ok) throw 0;
          return r.json().then(function (d) { SD[ch] = d; res(d); });
        }).catch(next);
      })();
    });
    return SDP[ch];
  }
  function loadAll(chars, ms) {
    var need = chars.filter(function (c) { return !(c in SD); });
    if (!need.length) return Promise.resolve();
    return Promise.race([Promise.all(need.map(strokeData)), new Promise(function (r) { setTimeout(r, ms || 6000); })]);
  }

  /* ================= từ điển ================= */
  var LW = new Map();
  (window.VO_LESSONS || []).forEach(function (l) {
    l.x.concat(l.w).forEach(function (w) { LW.set(w[1], { py: w[2], m: w[3], label: w[0] }); });
  });
  var CH = window.VO_CHARS || {};
  var VM = null, vocabP = null, DM = null, dictP = null;
  function loadVocab() {
    if (!vocabP) vocabP = fetch('../trasua/data/vocab.json').then(function (r) { return r.json(); }).then(function (a) {
      VM = new Map(); a.forEach(function (x) { if (!VM.has(x[0])) VM.set(x[0], { py: x[1], hv: x[2], m: x[3], o: x[4] }); }); window.VO_VOCAB = a; return a;
    }).catch(function () { VM = new Map(); return []; });
    return vocabP;
  }
  function loadDict() {
    if (!dictP) dictP = fetch('../dict.txt').then(function (r) { return r.text(); }).then(function (t) {
      DM = new Map(); t.split('\n').forEach(function (l) { var i = l.indexOf('\t'); if (i > 1) DM.set(l.slice(0, i), l.slice(i + 1)); });
    }).catch(function () { DM = new Map(); });
    return dictP;
  }
  function stripTone(p) { return String(p || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase().replace(/[^a-zv]/g, ''); }
  function pyArr(hz) {
    try { return window.pinyinPro.pinyin(hz, { type: 'array', toneSandhi: false }); } catch (e) { return []; }
  }
  function readingOf(ch, py) {
    var rs = CH[ch]; if (!rs) return null;
    if (py) {
      for (var i = 0; i < rs.length; i++) if (rs[i][0] === py) return rs[i];
      var b = stripTone(py);
      for (i = 0; i < rs.length; i++) if (stripTone(rs[i][0]) === b) return rs[i];
    }
    return rs[0];
  }
  function hvOf(hz, pys) {
    pys = pys || pyArr(hz);
    var out = [];
    for (var i = 0; i < hz.length; i++) {
      var r = readingOf(hz[i], pys[i]); var h = r && r[1] ? r[1].split(',')[0].trim() : '';
      if (!h) return '';
      out.push(h);
    }
    return out.join(' ');
  }
  function trimMean(m) {
    m = String(m || '').replace(/\s+/g, ' ').trim();
    var p = m.split(/;\s*/), o = [], n = 0;
    for (var i = 0; i < p.length && o.length < 3; i++) { if (o.length && n + p[i].length > 46) break; o.push(p[i]); n += p[i].length + 2; }
    m = o.join('; ');
    return m.length > 70 ? m.slice(0, 68).replace(/\s+\S*$/, '') + '…' : m;
  }
  function infoOf(e) {
    var hz = e.hz, r = { py: '', hv: '', m: '' };
    if (hz.length === 1) {
      var L = !e.ctx && ((S.lib && S.lib[hz]) || LW.get(hz)), V = VM && VM.get(hz), rd;
      if (e.ctx) { rd = readingOf(hz, e.ctx); r.py = e.ctx; r.hv = rd ? rd[1] : ''; r.m = rd ? rd[2] : ''; if (V && V.py === e.ctx) { r.m = V.m; r.hv = V.hv; } }
      else if (L) { rd = readingOf(hz, L.py); r.py = L.py; r.m = L.m; r.hv = rd ? rd[1] : ''; }
      else if (V) { r.py = V.py; r.hv = V.hv; r.m = V.m; }
      else { var p1 = pyArr(hz)[0]; rd = readingOf(hz, p1); r.py = rd ? rd[0] : p1 || ''; r.hv = rd ? rd[1] : ''; r.m = rd ? rd[2] : ''; }
      r.hv = String(r.hv || '').split(',')[0].trim();
    } else {
      var L2 = (S.lib && S.lib[hz]) || LW.get(hz), V2 = VM && VM.get(hz);
      if (L2) { r.py = L2.py; r.m = L2.m; r.hv = (V2 && V2.hv) || hvOf(hz); }
      else if (V2) { r.py = V2.py; r.hv = V2.hv; r.m = V2.m; }
      else if (DM && DM.has(hz)) {
        var f = DM.get(hz).split('\t')[0].split('|'); r.py = f[0]; r.hv = f[1] && f[1].indexOf('_') < 0 ? f[1] : hvOf(hz); r.m = f[2] || '';
      } else {
        r.py = pyArr(hz).join(' '); r.hv = hvOf(hz); r.m = '';
        if (!DM && VM) r.pending = true;
      }
    }
    r.m = trimMean(r.m);
    if (HAN.test(r.py)) r.py = '';
    var ed = S.edits[hz];
    if (ed) { if (ed.py != null) r.py = ed.py; if (ed.hv != null) r.hv = ed.hv; if (ed.m != null) r.m = ed.m; r.edited = true; }
    return r;
  }

  /* ================= tách chữ ================= */
  function parse(text) {
    var toks = String(text || '').split(/[\s,，、。；;：:！!？?·．.…\/|"“”'‘’()（）《》<>\[\]【】\-—_=+*#~`0-9a-zA-Z]+/);
    var out = [], seen = {};
    function add(hz, ctx) { if (seen[hz]) return; seen[hz] = 1; out.push({ hz: hz, ctx: ctx || null }); }
    toks.forEach(function (t) {
      var han = Array.from(t).filter(function (c) { return HAN.test(c); }).join('');
      if (!han) return;
      var arr = Array.from(han);
      if (S.split || arr.length > 4) {
        var pys = arr.length > 1 ? pyArr(han) : [];
        arr.forEach(function (c, i) { add(c, arr.length > 1 ? pys[i] : null); });
      } else add(han);
    });
    return out.slice(0, 300).map(function (e) { e.chars = Array.from(e.hz); return e; });
  }

  /* ================= đo chữ ================= */
  var mctx = document.createElement('canvas').getContext('2d');
  function tw(t, sz, w, fam) { mctx.font = (w || 400) + ' ' + (sz * 10) + 'px ' + fam; return mctx.measureText(t).width / 10; }
  function fit(t, sz, w, fam, max) {
    if (max <= 0) return '';
    if (tw(t, sz, w, fam) <= max) return t;
    var a = Array.from(t);
    while (a.length && tw(a.join('') + '…', sz, w, fam) > max) a.pop();
    return a.length ? a.join('').replace(/[\s;,]+$/, '') + '…' : '';
  }

  /* ================= dàn trang ================= */
  function gridItems(it, x, y, n, s, grid, col, light) {
    var lw = light ? 0.13 : 0.32, gw = light ? 0.09 : 0.13, ga = light ? 0.55 : 0.75;
    it.push({ k: 'rect', x: x, y: y, w: n * s, h: s, c: col, lw: lw, a: light ? 0.6 : 1 });
    for (var i = 1; i < n; i++) it.push({ k: 'ln', x1: x + i * s, y1: y, x2: x + i * s, y2: y + s, c: col, lw: lw * 0.75, a: light ? 0.6 : 1 });
    var g = function (x1, y1, x2, y2) { it.push({ k: 'ln', x1: x1, y1: y1, x2: x2, y2: y2, c: col, lw: gw, a: ga, dash: !light }); };
    if (grid === 'tian' || grid === 'mi' || grid === 'hui') g(x, y + s / 2, x + n * s, y + s / 2);
    if (grid === 'jiu') { g(x, y + s / 3, x + n * s, y + s / 3); g(x, y + 2 * s / 3, x + n * s, y + 2 * s / 3); }
    for (i = 0; i < n; i++) {
      var cx = x + i * s;
      if (grid === 'tian' || grid === 'mi' || grid === 'hui') g(cx + s / 2, y, cx + s / 2, y + s);
      if (grid === 'mi') { g(cx, y, cx + s, y + s); g(cx + s, y, cx, y + s); }
      if (grid === 'jiu') { g(cx + s / 3, y, cx + s / 3, y + s); g(cx + 2 * s / 3, y, cx + 2 * s / 3, y + s); }
      if (grid === 'hui') it.push({ k: 'rect', x: cx + s * 0.2, y: y + s * 0.2, w: s * 0.6, h: s * 0.6, c: col, lw: gw, a: ga });
    }
  }
  function blockOf(e, x0, W) {
    var inf = infoOf(e); e.inf = inf;
    var anyInfo = S.showStroke || S.showPy || S.showMean || S.showHv;
    var col = colorOf();
    var b = { e: e, h: 0, info: [] };
    if (!anyInfo) return b;
    var LH = 7.4, ms = 6.1, mg = 0.55, cg = 1.6;
    var hzSz = 5.2, pySz = 3.7, hvSz = 2.7, mSz = 3.2;
    var hzW = tw(e.hz, hzSz, 700, F.han);
    var py = S.showPy ? inf.py : '', hv = S.showHv && inf.hv ? inf.hv.toUpperCase() : '', mean = S.showMean ? inf.m : '';
    var pyW = py ? tw(py, pySz, 600, F.ui) + 2.2 : 0, hvW = hv ? tw(hv, hvSz, 700, F.ui) + 2.2 : 0;
    var strokes = [];
    if (S.showStroke) e.chars.forEach(function (c, ci) { var d = SD[c]; if (d) { if (ci && strokes.length) strokes.push(null); for (var k = 0; k < d.strokes.length; k++) strokes.push({ c: c, i: k }); } });
    var sW = 0; strokes.forEach(function (s) { sW += s ? ms + mg : cg; });
    var head = hzW + 2.4 + pyW + hvW;
    var meanW = mean ? tw(mean, mSz, 500, F.ui) : 0;
    var same = strokes.length && head + Math.min(meanW, 34) + 3 + sW <= W;
    var it = b.info, y = 0;
    var bl = 5.3;
    it.push({ k: 'tx', x: x0, y: bl, t: e.hz, sz: hzSz, w: 700, f: F.han, c: '#2B2B2B' });
    var x = x0 + hzW + 2.4;
    if (py) { it.push({ k: 'tx', x: x, y: bl, t: py, sz: pySz, w: 600, f: F.ui, c: col.t }); x += pyW; }
    if (hv) { it.push({ k: 'tx', x: x, y: bl - 0.2, t: hv, sz: hvSz, w: 700, f: F.ui, c: '#9A8A80' }); x += hvW; }
    var room = (same ? x0 + W - sW - 3 : x0 + W) - x;
    if (mean) { var mt = fit(mean, mSz, 500, F.ui, room); if (mt) it.push({ k: 'tx', x: x, y: bl, t: mt, sz: mSz, w: 500, f: F.ui, c: '#4A4440' }); x += mt ? tw(mt, mSz, 500, F.ui) : 0; }
    var sx, sy;
    if (same) { sx = x0 + W - sW + mg; sy = (LH - ms) / 2; y = LH; }
    else { y = LH; sx = x0; sy = y; if (strokes.length) y += ms + 1; }
    strokes.forEach(function (s) {
      if (!s) { sx += cg; return; }
      if (sx + ms > x0 + W + 0.01) { sx = x0; sy += ms + 1; y += ms + 1; }
      gridItems(it, sx, sy, 1, ms, S.grid === 'fang' ? 'tian' : S.grid === 'hui' ? 'tian' : S.grid, col.c, true);
      it.push({ k: 'hz', x: sx, y: sy, s: ms, ch: s.c, upto: s.i, hl: '#E5484D' });
      sx += ms + mg;
    });
    b.h = y + 0.6;
    return b;
  }
  function rowCells(e, r, n) {
    var L = e.chars.length, cells = [];
    var model = S.model ? L : 0;
    var hint = Math.min(S.hint * (L > 1 ? L : 1), n - model);
    var mode = r === 0 || S.next === 'same' ? 'full' : S.next;
    for (var j = 0; j < n; j++) {
      var ch = e.chars[j % L], c = null;
      if (mode === 'full') {
        if (j < model) c = { ch: ch, a: 1, model: true };
        else if (j < model + hint) {
          var k = j - model, a = S.fade && hint > 1 ? 0.5 - 0.34 * k / (hint - 1) : 0.32;
          c = { ch: ch, a: a };
        }
      } else if (mode === 'one') { if (j < L) c = { ch: ch, a: 0.3 }; }
      cells.push(c);
    }
    return cells;
  }
  function layout(ents) {
    var s = S.size, n = nCells(), W = n * s, x0 = (PAGE.w - W) / 2;
    var col = colorOf();
    var pages = [], pg, y;
    function newPage() {
      pg = { items: [] }; pages.push(pg); y = PAGE.top;
      if (pages.length === 1 && S.header) {
        var t = S.title || 'Vở tập viết';
        var right = S.nameLine ? 78 : 0;
        pg.items.push({ k: 'tx', x: x0, y: y + 5.6, t: fit(t, 6, 900, F.title, W - right - 4), sz: 6, w: 900, f: F.title, c: '#3B2414' });
        if (S.nameLine) {
          var rx = x0 + W;
          pg.items.push({ k: 'ln', x1: rx - 22, y1: y + 6.2, x2: rx, y2: y + 6.2, c: '#B8A99C', lw: 0.2 });
          pg.items.push({ k: 'tx', x: rx - 23.2, y: y + 5.6, t: 'Ngày', sz: 3, w: 600, f: F.ui, c: '#8A7A6E', al: 'end' });
          pg.items.push({ k: 'ln', x1: rx - 74, y1: y + 6.2, x2: rx - 32, y2: y + 6.2, c: '#B8A99C', lw: 0.2 });
          pg.items.push({ k: 'tx', x: rx - 75.2, y: y + 5.6, t: 'Họ tên', sz: 3, w: 600, f: F.ui, c: '#8A7A6E', al: 'end' });
        }
        y += 10.5;
      }
      pg.top = y;
    }
    newPage();
    var gap = 2.8;
    ents.forEach(function (e) {
      var b = blockOf(e, x0, W);
      var total = b.h + S.rows * s;
      var room = PAGE.bottom - y;
      if (total > room && y > pg.top + 0.01) {
        var fresh = PAGE.bottom - PAGE.top;
        if (total <= fresh || room < b.h + s) newPage();
      }
      b.info.forEach(function (o) { var c = Object.assign({}, o); shiftY(c, y); pg.items.push(c); });
      y += b.h;
      for (var r = 0; r < S.rows; r++) {
        if (y + s > PAGE.bottom + 0.01) newPage();
        gridItems(pg.items, x0, y, n, s, S.grid, col.c, false);
        rowCells(e, r, n).forEach(function (c, j) {
          if (c) pg.items.push({ k: 'hz', x: x0 + j * s, y: y, s: s, ch: c.ch, a: c.a, model: c.model, cell: true });
        });
        y += s;
      }
      y += gap;
    });
    if (!ents.length) pg.items.push({ k: 'tx', x: PAGE.w / 2, y: 80, t: 'Gõ chữ Hán ở ô số 1 để tạo vở nhé ✍️', sz: 5, w: 700, f: F.title, c: '#B9A898', al: 'middle' });
    if (S.footer) pages.forEach(function (p, i) {
      p.items.push({ k: 'tx', x: PAGE.w / 2, y: PAGE.h - 5, t: (i + 1) + ' / ' + pages.length, sz: 2.6, w: 600, f: F.ui, c: '#B0A196', al: 'middle' });
    });
    return pages;
  }
  function shiftY(o, dy) { if ('y' in o) o.y += dy; if ('y1' in o) { o.y1 += dy; o.y2 += dy; } }

  /* ================= vẽ: SVG ================= */
  var P2D = {};
  function hzGeom(o) {
    var s = o.s, pad = o.cell ? s * 0.085 : s * 0.07, k = (s - 2 * pad) / 1024;
    return { tx: o.x + pad, ty: o.y + pad, k: k };
  }
  function n2(v) { return Math.round(v * 1000) / 1000; }
  function toSVG(pg) {
    var o = [];
    pg.items.forEach(function (it) {
      if (it.k === 'rect') o.push('<rect x="' + n2(it.x) + '" y="' + n2(it.y) + '" width="' + n2(it.w) + '" height="' + n2(it.h) + '" fill="none" stroke="' + it.c + '" stroke-width="' + it.lw + '"' + (it.a < 1 ? ' stroke-opacity="' + it.a + '"' : '') + '/>');
      else if (it.k === 'ln') o.push('<line x1="' + n2(it.x1) + '" y1="' + n2(it.y1) + '" x2="' + n2(it.x2) + '" y2="' + n2(it.y2) + '" stroke="' + it.c + '" stroke-width="' + it.lw + '"' + (it.a != null && it.a < 1 ? ' stroke-opacity="' + it.a + '"' : '') + (it.dash ? ' stroke-dasharray="0.75 0.6"' : '') + '/>');
      else if (it.k === 'tx') o.push('<text x="' + n2(it.x) + '" y="' + n2(it.y) + '" font-family="' + esc(it.f) + '" font-size="' + it.sz + '" font-weight="' + it.w + '" fill="' + it.c + '"' + (it.al ? ' text-anchor="' + it.al + '"' : '') + '>' + esc(it.t) + '</text>');
      else if (it.k === 'hz') {
        var d = SD[it.ch];
        if (!d) {
          if (it.upto != null) return;
          o.push('<text x="' + n2(it.x + it.s / 2) + '" y="' + n2(it.y + it.s * 0.79) + '" font-family="' + esc(F.han) + '" font-size="' + n2(it.s * 0.78) + '" font-weight="500" text-anchor="middle" fill="' + (it.model ? '#1F1F1F' : '#777') + '"' + (it.a < 1 ? ' fill-opacity="' + it.a + '"' : '') + '>' + esc(it.ch) + '</text>');
          return;
        }
        var g = hzGeom(it);
        var tf = 'translate(' + n2(g.tx) + ' ' + n2(g.ty) + ') scale(' + g.k.toFixed(6) + ' ' + (-g.k).toFixed(6) + ') translate(0 -900)';
        if (it.upto != null) {
          o.push('<g transform="' + tf + '"><path fill="#3C3C3C" d="' + d.strokes.slice(0, it.upto).join(' ') + '"/><path fill="' + it.hl + '" d="' + d.strokes[it.upto] + '"/></g>');
        } else {
          o.push('<path transform="' + tf + '" fill="' + (it.model ? '#1F1F1F' : '#6F6F6F') + '"' + (it.a < 1 ? ' fill-opacity="' + n2(it.a) + '"' : '') + ' d="' + d.strokes.join(' ') + '"/>');
        }
      }
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" preserveAspectRatio="xMidYMid meet"><rect width="210" height="297" fill="#fff"/>' + o.join('') + '</svg>';
  }

  /* ================= vẽ: Canvas (PDF) ================= */
  function path2d(d) { return P2D[d] || (P2D[d] = new Path2D(d)); }
  function drawCanvas(ctx, pg, sc) {
    ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PAGE.w * sc, PAGE.h * sc);
    pg.items.forEach(function (it) {
      ctx.save();
      if (it.k === 'rect' || it.k === 'ln') {
        ctx.strokeStyle = it.c; ctx.globalAlpha = it.a != null ? it.a : 1; ctx.lineWidth = it.lw * sc;
        if (it.dash) ctx.setLineDash([0.75 * sc, 0.6 * sc]);
        ctx.beginPath();
        if (it.k === 'rect') ctx.rect(it.x * sc, it.y * sc, it.w * sc, it.h * sc); else { ctx.moveTo(it.x1 * sc, it.y1 * sc); ctx.lineTo(it.x2 * sc, it.y2 * sc); }
        ctx.stroke();
      } else if (it.k === 'tx') {
        ctx.fillStyle = it.c; ctx.font = it.w + ' ' + (it.sz * sc) + 'px ' + it.f;
        ctx.textAlign = it.al === 'end' ? 'right' : it.al === 'middle' ? 'center' : 'left'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(it.t, it.x * sc, it.y * sc);
      } else if (it.k === 'hz') {
        var d = SD[it.ch];
        if (!d) {
          if (it.upto == null) {
            ctx.fillStyle = it.model ? '#1F1F1F' : '#777'; ctx.globalAlpha = it.a; ctx.font = '500 ' + (it.s * 0.78 * sc) + 'px ' + F.han; ctx.textAlign = 'center';
            ctx.fillText(it.ch, (it.x + it.s / 2) * sc, (it.y + it.s * 0.79) * sc);
          }
        } else {
          var g = hzGeom(it);
          ctx.translate(g.tx * sc, g.ty * sc); ctx.scale(g.k * sc, -g.k * sc); ctx.translate(0, -900);
          if (it.upto != null) {
            ctx.fillStyle = '#3C3C3C'; for (var i = 0; i < it.upto; i++) ctx.fill(path2d(d.strokes[i]));
            ctx.fillStyle = it.hl; ctx.fill(path2d(d.strokes[it.upto]));
          } else {
            ctx.fillStyle = it.model ? '#1F1F1F' : '#6F6F6F'; ctx.globalAlpha = it.a;
            ctx.fill(path2d(d.strokes.join(' ')));
          }
        }
      }
      ctx.restore();
    });
    ctx.restore();
  }

  /* ================= nét viết tay ================= */
  var INK = lsGet('bm.vo.ink', null);
  if (!INK || !INK.pages) INK = { sig: '', pages: {} };
  var inkTimer = 0;
  function saveInk() { clearTimeout(inkTimer); inkTimer = setTimeout(function () { if (!lsSet('bm.vo.ink', INK)) toast('Bộ nhớ đầy, nét viết chưa lưu được'); }, 500); }
  function hasInk() { for (var k in INK.pages) if (INK.pages[k] && INK.pages[k].length) return true; return false; }
  function sigOf(ents) {
    return JSON.stringify([ents.map(function (e) { return e.hz; }).join(' '), S.grid, S.size, S.rows, S.hint, S.next, S.model, S.showStroke, S.showPy, S.showHv, S.showMean, S.header, S.nameLine, S.split]);
  }
  function switchInk(sig) {
    if (INK.sig === sig) return;
    var bank = lsGet('bm.vo.inkOld', {});
    if (INK.sig && hasInk()) { bank[INK.sig] = INK.pages; var ks = Object.keys(bank); while (ks.length > 3) delete bank[ks.shift()]; }
    INK = { sig: sig, pages: bank[sig] || {} };
    delete bank[sig];
    lsSet('bm.vo.inkOld', bank); saveInk();
  }
  function strokeW(st, p) { return st.w * (st.pen ? 0.35 + p * 1.15 : 1); }
  function drawInkStroke(ctx, st, sc) {
    var pts = st.p; if (!pts.length) return;
    ctx.strokeStyle = st.c; ctx.fillStyle = st.c; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0] * sc, pts[0][1] * sc, strokeW(st, pts[0][2]) * sc / 2, 0, 7); ctx.fill(); return; }
    var px = pts[0][0], py = pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      ctx.beginPath(); ctx.lineWidth = strokeW(st, (a[2] + b[2]) / 2) * sc;
      ctx.moveTo(px * sc, py * sc); ctx.quadraticCurveTo(a[0] * sc, a[1] * sc, mx * sc, my * sc); ctx.stroke();
      px = mx; py = my;
    }
    var l = pts[pts.length - 1];
    ctx.beginPath(); ctx.lineWidth = strokeW(st, l[2]) * sc; ctx.moveTo(px * sc, py * sc); ctx.lineTo(l[0] * sc, l[1] * sc); ctx.stroke();
  }
  function drawInk(ctx, pi, sc, clear) {
    if (clear) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    (INK.pages[pi] || []).forEach(function (st) { ctx.save(); drawInkStroke(ctx, st, sc); ctx.restore(); });
  }

  /* ================= trạng thái + render ================= */
  var ENTS = [], PAGES = [], renderTok = 0, zoom = 1;
  var pv = $('#pv'), pvIn = $('#pvIn');
  function pageW() { var w = Math.min(pv.clientWidth - 20, 860); return Math.max(220, w * zoom); }
  function paintPreview() {
    var w = pageW(), h = w * PAGE.h / PAGE.w;
    pvIn.style.width = w + 'px';
    pvIn.innerHTML = PAGES.map(function (p, i) {
      return '<div class="pg" data-i="' + i + '" style="width:' + w + 'px;height:' + h + 'px;animation-delay:' + Math.min(i, 6) * 0.05 + 's">' + toSVG(p) + '<canvas></canvas><span class="pgtag">✍️ Chạm để viết</span></div>';
    }).join('');
    paintPreviewInk();
  }
  function paintPreviewInk() {
    $$('.pg', pvIn).forEach(function (el) {
      var i = +el.dataset.i, cv = el.querySelector('canvas');
      if (!INK.pages[i] || !INK.pages[i].length) { cv.width = 1; cv.height = 1; return; }
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = el.clientWidth;
      cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr * PAGE.h / PAGE.w);
      drawInk(cv.getContext('2d'), i, cv.width / PAGE.w, true);
    });
  }
  function render() {
    var tok = ++renderTok;
    ENTS = parse(S.text);
    renderEnts();
    var chars = []; ENTS.forEach(function (e) { e.chars.forEach(function (c) { if (chars.indexOf(c) < 0) chars.push(c); }); });
    pv.classList.add('busy');
    var needDict = false;
    return Promise.all([loadAll(chars), fontsReady()]).then(function () {
      if (tok !== renderTok) return;
      PAGES = layout(ENTS);
      ENTS.forEach(function (e) { if (e.inf && e.inf.pending) needDict = true; });
      switchInk(sigOf(ENTS));
      paintPreview();
      renderEnts();
      $('#pvMeta').textContent = countTxt() + ' · ' + PAGES.length + ' trang A4';
      pv.classList.remove('busy');
      if (wrOpen) buildWriter();
      if (needDict && !dictP) loadDict().then(function () { render(); });
    });
  }
  function countTxt() {
    var c = 0, w = 0; ENTS.forEach(function (e) { if (e.chars.length > 1) w++; else c++; });
    return (c ? c + ' chữ' : '') + (c && w ? ', ' : '') + (w ? w + ' từ' : '') || '0 chữ';
  }
  var fontP = null;
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    if (!fontP) fontP = Promise.race([Promise.all([
      document.fonts.load('600 20px Inter', 'ǎ ếà'), document.fonts.load('700 20px Inter'), document.fonts.load('500 20px Inter'),
      document.fonts.load('900 20px Nunito', 'Vở tập viết'), document.fonts.load('700 20px "Noto Sans SC"', '你好')
    ]), new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {});
    var hz = ENTS.map(function (e) { return e.hz; }).join('');
    return fontP.then(function () { return hz ? Promise.race([document.fonts.load('700 20px "Noto Sans SC"', hz), new Promise(function (r) { setTimeout(r, 1500); })]).catch(function () {}) : 0; });
  }
  var rt = 0;
  function schedule(ms) { clearTimeout(rt); rt = setTimeout(render, ms == null ? 250 : ms); }

  /* ================= UI: bước 1 ================= */
  var txt = $('#txt');
  txt.value = S.text;
  txt.addEventListener('input', function () { S.text = txt.value; save(); schedule(350); });
  $('#split').checked = S.split;
  $('#split').onchange = function () { S.split = this.checked; save(); schedule(0); };
  $('#clearTxt').onclick = function () {
    if (!S.text.trim()) return;
    var old = S.text; S.text = ''; txt.value = ''; save(); render();
    toast('Đã xoá hết chữ', 'Hoàn tác', function () { S.text = old; txt.value = old; save(); render(); });
  };
  function renderEnts() {
    var box = $('#ents');
    $('#entCount').textContent = countTxt();
    if (!ENTS.length) { box.innerHTML = '<div class="empty">Chưa có chữ nào. Gõ ở trên hoặc mở 📚 Thư viện nhé.</div>'; return; }
    box.innerHTML = ENTS.map(function (e, i) {
      var inf = e.inf || infoOf(e); var nod = e.chars.some(function (c) { return SD[c] === null; });
      return '<button class="ent' + (nod ? ' nodata' : '') + (inf.edited ? ' edited' : '') + '" data-i="' + i + '" style="animation-delay:' + Math.min(i, 20) * 0.015 + 's"' + (nod ? ' title="Chưa có dữ liệu nét cho chữ này, sẽ in bằng phông chữ"' : '') + '><b>' + esc(e.hz) + '</b><small>' + esc(inf.py || '·') + '</small></button>';
    }).join('');
  }
  $('#ents').addEventListener('click', function (ev) { var b = ev.target.closest('.ent'); if (b) openEdit(ENTS[+b.dataset.i]); });

  // tabs
  $$('.tabs button').forEach(function (b) {
    b.onclick = function () {
      $$('.tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#paneType').hidden = b.dataset.tab !== 'type'; $('#paneLib').hidden = b.dataset.tab !== 'lib';
      if (b.dataset.tab === 'lib') showLib(libTab);
    };
  });
  function goType() { $$('.tabs button')[0].click(); }

  /* ---- thư viện ---- */
  var libTab = 'les';
  $$('.sub button').forEach(function (b) { b.onclick = function () { showLib(b.dataset.lib); }; });
  var BASIC = [
    { n: 'Số đếm', d: '一 二 三…', w: '一 二 三 四 五 六 七 八 九 十 百 千 万 零' },
    { n: 'Chữ đơn giản cho người mới', d: '人 大 口 日…', w: '人 大 小 口 日 月 山 水 火 木 土 天 上 下 中 手 目 田 子 女' },
    { n: 'Bộ thủ hay gặp', d: '亻 氵 扌…', w: '亻 氵 扌 口 木 女 心 忄 讠 艹 宀 辶 钅 纟 饣 礻 衤 犭 阝 刂 冫 彳 疒 广 囗 灬 攵 冖 亠' },
    { n: 'Nét cơ bản', d: '一 丨 丿 丶…', w: '一 丨 丿 丶 乙 亅 乚 乛' },
    { n: 'Chào hỏi', d: '你好 谢谢…', w: '你好 谢谢 不客气 对不起 没关系 再见 老师 同学 朋友 早上好' },
    { n: 'Gia đình', d: '爸爸 妈妈…', w: '爸爸 妈妈 儿子 女儿 孩子 丈夫 妻子 哥哥 姐姐 弟弟 妹妹 爷爷 奶奶 家' }
  ];
  function showLib(t) {
    libTab = t;
    $$('.sub button').forEach(function (x) { x.classList.toggle('on', x.dataset.lib === t); });
    var body = $('#libBody');
    if (t === 'les') {
      body.innerHTML = '<div class="lesgrid">' + (window.VO_LESSONS || []).map(function (l, i) {
        return '<button class="les" data-i="' + i + '"><b>Bài ' + l.n + '</b><small>' + esc(l.t) + '</small></button>';
      }).join('') + '</div>';
      $$('.les', body).forEach(function (b) {
        b.onclick = function () {
          var l = window.VO_LESSONS[+b.dataset.i];
          pick('Bài ' + l.n + ' · <span class="zh">' + esc(l.t) + '</span>', [
            { n: 'Từ mới (' + l.w.length + ')', on: true, w: l.w.map(function (x) { return { label: x[0], hz: x[1], py: x[2], m: x[3] }; }) },
            { n: 'Từ bổ sung (' + l.x.length + ')', on: false, w: l.x.map(function (x) { return { label: x[0], hz: x[1], py: x[2], m: x[3] }; }) }
          ]);
        };
      });
    } else if (t === 'hsk') {
      body.innerHTML = '<div class="empty">Đang mở từ vựng HSK…</div>';
      loadVocab().then(function (a) {
        if (libTab !== 'hsk') return;
        var lv = [1, 2, 3, 4, 5, 6].map(function (n) { return a.filter(function (x) { return x[4] === n; }); });
        body.innerHTML = '<div class="lesgrid">' + lv.map(function (l, i) {
          return '<button class="les hsk" data-i="' + i + '"><b>HSK ' + (i + 1) + '</b><small>' + l.length + ' từ · ' + esc(l.slice(0, 4).map(function (x) { return x[0]; }).join(' ')) + '</small></button>';
        }).join('') + '</div>';
        $$('.les', body).forEach(function (b) {
          b.onclick = function () { hskGroups(+b.dataset.i + 1, lv[+b.dataset.i]); };
        });
      });
    } else {
      body.innerHTML = '<div class="lesgrid">' + BASIC.map(function (l, i) {
        return '<button class="les" data-i="' + i + '"><b>' + l.n + '</b><small>' + esc(l.d) + '</small></button>';
      }).join('') + '</div>';
      $$('.les', body).forEach(function (b) {
        b.onclick = function () {
          var l = BASIC[+b.dataset.i];
          pick(l.n, [{ n: '', on: true, w: l.w.split(' ').map(function (h) { return { label: h, hz: h, py: (LW.get(h) || {}).py || pyArr(h).join('') }; }) }]);
        };
      });
    }
  }
  function hskGroups(lv, list) {
    var body = $('#libBody'), G = 20, groups = [];
    for (var i = 0; i < list.length; i += G) groups.push(list.slice(i, i + G));
    body.innerHTML = '<div class="pick-hd"><button id="pBack">‹</button><b>HSK ' + lv + ' · ' + list.length + ' từ<br><small style="color:#9B8473;font-size:13px">Chia nhóm 20 từ (theo pinyin a→z)</small></b></div><div class="lesgrid">' +
      groups.map(function (g, i) { return '<button class="les" data-i="' + i + '"><b>Nhóm ' + (i + 1) + ' <small style="display:inline;color:#9B8473">' + (i * G + 1) + '–' + (i * G + g.length) + '</small></b><small>' + esc(g.slice(0, 5).map(function (x) { return x[0]; }).join(' ')) + '</small></button>'; }).join('') + '</div>';
    $('#pBack').onclick = function () { showLib('hsk'); };
    $$('.les', body).forEach(function (b) {
      b.onclick = function () {
        var g = groups[+b.dataset.i];
        pick('HSK ' + lv + ' · Nhóm ' + (+b.dataset.i + 1), [{ n: '', on: true, w: g.map(function (x) { return { label: x[0], hz: x[0], py: x[1] }; }) }], function () { hskGroups(lv, list); });
      };
    });
  }
  function pick(title, secs, back) {
    var body = $('#libBody'), sel = [];
    secs.forEach(function (s) { s.w.forEach(function (w) { w.on = s.on; sel.push(w); }); });
    body.innerHTML = '<div class="pick-hd"><button id="pBack">‹</button><b>' + title + '</b></div>' + secs.map(function (s, si) {
      return (s.n ? '<div class="pick-sec">' + s.n + '</div>' : '') + '<div class="chips">' + s.w.map(function (w, wi) {
        return '<button class="chip' + (w.on ? ' on' : '') + '" data-s="' + si + '" data-w="' + wi + '"><b>' + esc(w.label) + '</b><small>' + esc(w.py) + '</small></button>';
      }).join('') + '</div>';
    }).join('') + '<div class="pick-act"><button class="btn ghost sm" id="pAll">Tất cả</button><button class="btn ghost sm" id="pNone">Bỏ chọn</button><button class="btn main sm" id="pAdd"></button><button class="btn soft sm" id="pRep" title="Xoá chữ cũ, chỉ giữ các mục vừa chọn">🔄 Thay vở</button></div>';
    function upd() {
      var n = sel.filter(function (w) { return w.on; }).length;
      $('#pAdd').textContent = '➕ Thêm ' + n + ' mục'; $('#pAdd').disabled = !n; $('#pRep').disabled = !n;
    }
    $$('.chip', body).forEach(function (c) {
      c.onclick = function () { var w = secs[+c.dataset.s].w[+c.dataset.w]; w.on = !w.on; c.classList.toggle('on', w.on); upd(); };
    });
    $('#pAll').onclick = function () { sel.forEach(function (w) { w.on = true; }); $$('.chip', body).forEach(function (c) { c.classList.add('on'); }); upd(); };
    $('#pNone').onclick = function () { sel.forEach(function (w) { w.on = false; }); $$('.chip', body).forEach(function (c) { c.classList.remove('on'); }); upd(); };
    function toks() {
      var t = [];
      S.lib = S.lib || {};
      sel.forEach(function (w) { if (!w.on) return; if (w.m && !/…|\.\.\./.test(w.label)) S.lib[w.hz] = { py: w.py, m: w.m }; if (/…|\.\.\./.test(w.label)) Array.from(w.hz).forEach(function (c) { t.push(c); }); else t.push(w.hz); });
      return t;
    }
    $('#pAdd').onclick = function () { var t = toks(); S.text = (S.text.trim() ? S.text.trim() + ' ' : '') + t.join(' '); done(t.length, 'Đã thêm '); };
    $('#pRep').onclick = function () { var t = toks(); S.text = t.join(' '); done(t.length, 'Vở mới có '); };
    function done(n, pre) { txt.value = S.text; save(); goType(); render(); toast(pre + n + ' mục vào vở ✨'); }
    $('#pBack').onclick = back || function () { showLib(libTab); };
    upd();
  }

  /* ---- sửa chữ ---- */
  var curEd = null;
  function openEdit(e) {
    curEd = e; var inf = e.inf || infoOf(e);
    $('#eHz').textContent = e.hz; $('#ePy').value = inf.py; $('#eHv').value = inf.hv; $('#eMean').value = inf.m;
    openModal('#ed');
  }
  $('#eSave').onclick = function () {
    S.edits[curEd.hz] = { py: $('#ePy').value.trim(), hv: $('#eHv').value.trim(), m: $('#eMean').value.trim() };
    save(); closeModal('#ed'); render(); toast('Đã lưu ✓');
  };
  $('#eReset').onclick = function () { delete S.edits[curEd.hz]; save(); var inf = infoOf(curEd); $('#ePy').value = inf.py; $('#eHv').value = inf.hv; $('#eMean').value = inf.m; render(); };
  $('#eQuiz').onclick = function () { closeModal('#ed'); openQuiz(curEd.chars[0]); };
  $('#eDel').onclick = function () {
    var hz = curEd.hz, old = S.text;
    S.text = ENTS.filter(function (e) { return e.hz !== hz; }).map(function (e) { return e.hz; }).join(' ');
    txt.value = S.text; save(); closeModal('#ed'); render();
    toast('Đã bỏ ' + hz, 'Hoàn tác', function () { S.text = old; txt.value = old; save(); render(); });
  };

  /* ================= UI: bước 2, 3 ================= */
  function miniGrid(id, col) {
    var it = []; gridItems(it, 1, 1, 1, 58, id, col, false);
    it.forEach(function (o) { o.lw *= 5; });
    it.push({ k: 'hz', x: 1, y: 1, s: 58, ch: '永', a: 0.85, cell: true });
    var svg = toSVG({ items: it }).replace('viewBox="0 0 210 297"', 'viewBox="0 0 60 60"').replace('<rect width="210" height="297" fill="#fff"/>', '');
    return svg;
  }
  function paintGrids() {
    var col = colorOf().c;
    $('#grids').innerHTML = GRIDS.map(function (g) {
      return '<button class="gt' + (S.grid === g.id ? ' on' : '') + '" data-g="' + g.id + '">' + miniGrid(g.id, col) + '<b>' + g.zh + '</b><small>' + g.vi + '</small></button>';
    }).join('');
    $$('.gt').forEach(function (b) { b.onclick = function () { S.grid = b.dataset.g; save(); paintGrids(); schedule(0); }; });
  }
  function paintSizes() {
    $('#sizes').innerHTML = SIZES.map(function (z) {
      return '<button class="' + (S.size === z.s ? 'on' : '') + '" data-s="' + z.s + '">' + z.n + '<small>' + Math.floor(PAGE.cw / z.s) + ' ô/dòng</small></button>';
    }).join('');
    $$('#sizes button').forEach(function (b) { b.onclick = function () { S.size = +b.dataset.s; S.hint = Math.min(S.hint, nCells() - 1); save(); paintSizes(); paintOpts(); schedule(0); }; });
  }
  function paintColors() {
    $('#colors').innerHTML = COLORS.map(function (c) { return '<button style="--c:' + c.c + '" class="' + (S.color === c.id ? 'on' : '') + '" data-c="' + c.id + '" aria-label="Màu ' + c.id + '"></button>'; }).join('');
    $$('#colors button').forEach(function (b) { b.onclick = function () { S.color = b.dataset.c; save(); paintColors(); paintGrids(); schedule(0); }; });
  }
  function paintOpts() {
    $$('.stepper').forEach(function (st) { st.querySelector('b').textContent = S[st.dataset.k]; });
    $$('#nextSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.next === S.next); });
    $$('input[data-k]').forEach(function (i) { i.checked = !!S[i.dataset.k]; });
    $('#title').value = S.title;
  }
  $$('.stepper').forEach(function (st) {
    st.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      var k = st.dataset.k, max = k === 'rows' ? 12 : nCells() - 1, min = k === 'rows' ? 1 : 0;
      S[k] = clamp(S[k] + +b.dataset.d, min, max); save(); paintOpts(); schedule(150);
    });
  });
  $$('#nextSeg button').forEach(function (b) { b.onclick = function () { S.next = b.dataset.next; save(); paintOpts(); schedule(0); }; });
  $$('input[data-k]').forEach(function (i) { i.onchange = function () { S[i.dataset.k] = i.checked; save(); schedule(0); }; });
  $('#title').addEventListener('input', function () { S.title = this.value; save(); schedule(300); });
  $('#resetOpt').onclick = function () {
    var keep = { text: S.text, edits: S.edits, split: S.split, lib: S.lib };
    S = Object.assign({}, DEF, keep); save(); paintAll(); render(); toast('Đã về cài đặt gốc');
  };
  function paintAll() { paintGrids(); paintSizes(); paintColors(); paintOpts(); $('#split').checked = S.split; }

  // zoom xem trước
  $('#zIn').onclick = function () { zoom = Math.min(zoom * 1.25, 3); paintPreview(); };
  $('#zOut').onclick = function () { zoom = Math.max(zoom / 1.25, 0.3); paintPreview(); };
  $('#zFit').onclick = function () { zoom = 1; paintPreview(); };
  var rsz = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(rsz); rsz = setTimeout(function () {
      if (PAGES.length) paintPreview();
      if (wrOpen) sizeWriter();
      lastW = window.innerWidth;
    }, 200);
  });
  pvIn.addEventListener('click', function (ev) { var p = ev.target.closest('.pg'); if (p) openWriter(+p.dataset.i); });

  /* ================= modal + toast ================= */
  function openModal(s) { var m = $(s); m.hidden = false; }
  function closeModal(s) { var m = $(s); m.hidden = true; if (s === '#qz') stopQuiz(); }
  $$('.modal').forEach(function (m) { m.addEventListener('click', function (ev) { if (ev.target.closest('[data-close]')) closeModal('#' + m.id); }); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { $$('.modal').forEach(function (m) { if (!m.hidden) closeModal('#' + m.id); }); } });
  var tt = 0;
  function toast(msg, act, fn) {
    var t = $('#toast');
    t.innerHTML = esc(msg) + (act ? ' <button style="margin-left:8px;border:0;background:#FFB04A;color:#3B2414;border-radius:10px;padding:4px 10px;font-weight:900">' + esc(act) + '</button>' : '');
    if (act) t.querySelector('button').onclick = function () { t.classList.remove('show'); fn(); };
    t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, act ? 5000 : 2400);
  }

  /* ================= In ================= */
  function inkImg(i, sc) {
    if (!INK.pages[i] || !INK.pages[i].length) return '';
    var c = document.createElement('canvas'); c.width = PAGE.w * sc; c.height = PAGE.h * sc;
    drawInk(c.getContext('2d'), i, sc, false);
    return '<img alt="" src="' + c.toDataURL('image/png') + '">';
  }
  function doPrint() {
    if (!PAGES.length) return;
    $('#printArea').innerHTML = PAGES.map(function (p, i) { return '<div class="ppg">' + toSVG(p) + inkImg(i, 7) + '</div>'; }).join('');
    setTimeout(function () { window.print(); }, 60);
  }
  window.addEventListener('afterprint', function () { $('#printArea').innerHTML = ''; });

  /* ================= PDF ================= */
  var pdfBlob = null, jsp = null;
  function loadJsPDF() {
    if (window.jspdf) return Promise.resolve();
    if (!jsp) jsp = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'lib/jspdf.umd.min.js'; s.onload = res; s.onerror = function () { jsp = null; rej(); }; document.head.appendChild(s); });
    return jsp;
  }
  var pdfBusy = false;
  function makePdf() {
    if (pdfBusy || !PAGES.length) return;
    pdfBusy = true;
    toast('Đang tạo PDF… 0/' + PAGES.length);
    loadJsPDF().then(fontsReady).then(function () {
      var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      var sc = 9, cv = document.createElement('canvas'); cv.width = PAGE.w * sc; cv.height = PAGE.h * sc;
      var ctx = cv.getContext('2d'), i = 0;
      return new Promise(function (res) {
        (function step() {
          if (i >= PAGES.length) return res(doc);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          drawCanvas(ctx, PAGES[i], sc); drawInk(ctx, i, sc, false);
          if (i) doc.addPage('a4', 'portrait');
          doc.addImage(cv.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, PAGE.w, PAGE.h, undefined, 'FAST');
          i++; toast('Đang tạo PDF… ' + i + '/' + PAGES.length);
          setTimeout(step, 10);
        })();
      });
    }).then(function (doc) {
      pdfBlob = doc.output('blob'); pdfBusy = false;
      $('#toast').classList.remove('show');
      var kb = Math.round(pdfBlob.size / 1024);
      $('#pdfMeta').textContent = PAGES.length + ' trang A4 · ' + (kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB') + (hasInk() ? ' · có cả nét bạn đã viết' : '');
      var f = pdfFile();
      $('#pShare').hidden = !(navigator.canShare && navigator.canShare({ files: [f] }));
      openModal('#pdfOk');
    }).catch(function (e) { pdfBusy = false; toast('Tạo PDF bị lỗi, thử lại giúp mình nhé'); if (window.console) console.error(e); });
  }
  function fname() {
    var d = new Date(); var hz = ENTS.slice(0, 3).map(function (e) { return e.hz; }).join('');
    return 'Vo-tap-viet' + (hz ? '-' + hz : '') + '-' + d.getDate() + '-' + (d.getMonth() + 1) + '.pdf';
  }
  function pdfFile() { try { return new File([pdfBlob], fname(), { type: 'application/pdf' }); } catch (e) { return pdfBlob; } }
  $('#pSave').onclick = function () {
    var a = document.createElement('a'); a.href = URL.createObjectURL(pdfBlob); a.download = fname();
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    closeModal('#pdfOk');
  };
  $('#pShare').onclick = function () {
    navigator.share({ files: [pdfFile()], title: 'Vở tập viết' }).then(function () { closeModal('#pdfOk'); }).catch(function () {});
  };

  ['#bPrint', '#dPrint'].forEach(function (s) { $(s).onclick = doPrint; });
  ['#bPdf', '#dPdf', '#wPdf'].forEach(function (s) { $(s).onclick = makePdf; });
  ['#bWrite', '#dWrite'].forEach(function (s) { $(s).onclick = function () { openWriter(0); }; });
  $('#dPv').onclick = function () { $('#pvTop').scrollIntoView({ behavior: 'smooth' }); };

  /* ================= Viết lên vở ================= */
  var wr = $('#wr'), wsc = $('#wsc'), wpages = $('#wpages');
  var wrOpen = false, wzoom = 1;
  var PENS = [{ c: '#22252B' }, { c: '#1F5FD6' }, { c: '#E03131' }];
  var WIDTHS = [0.45, 0.8, 1.3];
  var tool = { c: PENS[0].c, w: 1, erase: false };
  var fingerDraw = true, penSeen = false, penUntil = 0;
  var hist = [], redo = [];
  $('#wColors').innerHTML = PENS.map(function (p, i) { return '<button class="dot' + (i ? '' : ' on') + '" data-c="' + p.c + '" style="--c:' + p.c + '" aria-label="Màu bút"><i style="width:18px;height:18px"></i></button>'; }).join('');
  $('#wSizes').innerHTML = WIDTHS.map(function (w, i) { var d = 6 + i * 5; return '<button class="dot' + (i === 1 ? ' on' : '') + '" data-w="' + i + '" style="--c:#6E5543" aria-label="Cỡ bút"><i style="width:' + d + 'px;height:' + d + 'px"></i></button>'; }).join('');
  $$('#wColors .dot').forEach(function (b) { b.onclick = function () { tool.c = b.dataset.c; tool.erase = false; syncTools(); }; });
  $$('#wSizes .dot').forEach(function (b) { b.onclick = function () { tool.w = +b.dataset.w; tool.erase = false; syncTools(); }; });
  $('#wErase').onclick = function () { tool.erase = !tool.erase; syncTools(); };
  function syncTools() {
    $$('#wColors .dot').forEach(function (b) { b.classList.toggle('on', !tool.erase && b.dataset.c === tool.c); });
    $$('#wSizes .dot').forEach(function (b) { b.classList.toggle('on', +b.dataset.w === tool.w); b.querySelector('i').style.background = tool.c; });
    $('#wErase').classList.toggle('on', tool.erase);
    $$('.wpg').forEach(function (p) { p.classList.toggle('erase', tool.erase); });
    $('#wUndo').disabled = !hist.length; $('#wRedo').disabled = !redo.length;
    $('#wFingerTx').textContent = fingerDraw ? 'Ngón tay: viết' : 'Ngón tay: cuộn';
    $('#wFinger').classList.toggle('on', !fingerDraw);
  }
  $('#wFinger').onclick = function () { fingerDraw = !fingerDraw; syncTools(); toast(fingerDraw ? 'Ngón tay dùng để viết 👆' : 'Ngón tay dùng để cuộn trang, bút để viết ✏️'); };
  $('#wDone').onclick = closeWriter;
  $('#wZi').onclick = function () { wzoom = Math.min(wzoom * 1.2, 2.5); sizeWriter(); };
  $('#wZo').onclick = function () { wzoom = Math.max(wzoom / 1.2, 0.5); sizeWriter(); };
  $('#wQuiz').onclick = function () { openQuiz(); };
  $('#wUndo').onclick = function () { var a = hist.pop(); if (!a) return; applyAct(a, true); redo.push(a); syncTools(); };
  $('#wRedo').onclick = function () { var a = redo.pop(); if (!a) return; applyAct(a, false); hist.push(a); syncTools(); };
  $('#wClear').onclick = function () {
    var i = curPage(); var list = INK.pages[i] || [];
    if (!list.length) { toast('Trang này chưa có nét nào'); return; }
    pushAct({ pg: i, add: [], del: list.slice() }); INK.pages[i] = []; redrawPage(i); saveInk();
    toast('Đã xoá nét trang ' + (i + 1), 'Hoàn tác', function () { $('#wUndo').click(); });
  };
  function pushAct(a) { hist.push(a); if (hist.length > 300) hist.shift(); redo = []; syncTools(); }
  function applyAct(a, undo) {
    var list = INK.pages[a.pg] || (INK.pages[a.pg] = []);
    var rem = undo ? a.add : a.del, add = undo ? a.del : a.add;
    INK.pages[a.pg] = list.filter(function (s) { return rem.indexOf(s) < 0; }).concat(add);
    redrawPage(a.pg); saveInk();
  }
  function openWriter(i) {
    if (!PAGES.length) return;
    wrOpen = true; wr.hidden = false; document.documentElement.style.overflow = 'hidden';
    buildWriter();
    var el = wpages.children[i]; if (el) wsc.scrollTop = el.offsetTop - 10;
    try { history.pushState({ vo: 'wr' }, ''); } catch (e) {}
    if (!lsGet('bm.vo.tip', 0)) { lsSet('bm.vo.tip', 1); toast('Viết bằng Apple Pencil hoặc ngón tay nhé ✍️'); }
  }
  function closeWriter(fromPop) {
    if (!wrOpen) return;
    wrOpen = false; wr.hidden = true; document.documentElement.style.overflow = '';
    wpages.innerHTML = ''; paintPreviewInk();
    if (fromPop !== true) try { if (history.state && history.state.vo) history.back(); } catch (e) {}
  }
  window.addEventListener('popstate', function () { if (wrOpen) closeWriter(true); });
  function buildWriter() {
    wpages.innerHTML = PAGES.map(function (p, i) { return '<div class="wpg' + (tool.erase ? ' erase' : '') + '" data-i="' + i + '">' + toSVG(p) + '<canvas></canvas></div>'; }).join('');
    $$('.wpg canvas', wpages).forEach(bindCanvas);
    sizeWriter(); syncTools(); updPageNo();
  }
  function sizeWriter() {
    var w = Math.min(wsc.clientWidth - 20, 1100) * wzoom, h = w * PAGE.h / PAGE.w;
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var mid = wsc.scrollTop + wsc.clientHeight / 2, total = wpages.scrollHeight || 1, ratio = mid / total;
    $$('.wpg', wpages).forEach(function (p) {
      p.style.width = w + 'px'; p.style.height = h + 'px';
      var cv = p.querySelector('canvas'), px = Math.round(w * dpr);
      if (px * Math.round(h * dpr) > 16e6) px = Math.floor(Math.sqrt(16e6 * PAGE.w / PAGE.h));
      cv.width = px; cv.height = Math.round(px * PAGE.h / PAGE.w);
      redrawPage(+p.dataset.i);
    });
    wsc.scrollTop = ratio * wpages.scrollHeight - wsc.clientHeight / 2;
  }
  function redrawPage(i) {
    var p = wpages.children[i]; if (!p) return;
    var cv = p.querySelector('canvas'); drawInk(cv.getContext('2d'), i, cv.width / PAGE.w, true);
  }
  function curPage() {
    var mid = wsc.scrollTop + wsc.clientHeight / 2, best = 0;
    Array.prototype.forEach.call(wpages.children, function (p, i) { if (p.offsetTop <= mid) best = i; });
    return best;
  }
  function updPageNo() { $('#wPageNo').textContent = 'Trang ' + (curPage() + 1) + ' / ' + PAGES.length; }
  wsc.addEventListener('scroll', function () { updPageNo(); }, { passive: true });

  // cuộn bằng ngón tay khi đang dùng bút
  var pan = null, vel = 0, inertia = 0;
  function panStart(e) { cancelAnimationFrame(inertia); pan = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }; vel = 0; }
  function panMove(e) {
    if (!pan || e.pointerId !== pan.id) return;
    var dx = e.clientX - pan.x, dy = e.clientY - pan.y, t = performance.now();
    wsc.scrollTop -= dy; wsc.scrollLeft -= dx;
    vel = 0.8 * (dy / Math.max(1, t - pan.t)) + 0.2 * vel;
    pan.x = e.clientX; pan.y = e.clientY; pan.t = t;
  }
  function panEnd(e) {
    if (!pan || e.pointerId !== pan.id) return; pan = null;
    var v = vel * 16;
    (function go() { if (Math.abs(v) < 0.4) return; wsc.scrollTop -= v; v *= 0.94; inertia = requestAnimationFrame(go); })();
  }

  function bindCanvas(cv) {
    var pi = +cv.parentNode.dataset.i, cur = null, ctx = cv.getContext('2d'), touches = {};
    function pt(e) {
      var r = cv.getBoundingClientRect();
      var p = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5;
      return [Math.round((e.clientX - r.left) / r.width * PAGE.w * 100) / 100, Math.round((e.clientY - r.top) / r.height * PAGE.h * 100) / 100, Math.round(p * 100) / 100];
    }
    function isPalm(e) { return e.pointerType === 'touch' && (e.width > 44 || e.height > 44); }
    function eraseAt(p) {
      var list = INK.pages[pi] || [], R = 2.6, hit = [];
      list.forEach(function (st) { for (var k = 0; k < st.p.length; k++) { var dx = st.p[k][0] - p[0], dy = st.p[k][1] - p[1]; if (dx * dx + dy * dy < R * R) { hit.push(st); break; } } });
      if (hit.length) { INK.pages[pi] = list.filter(function (s) { return hit.indexOf(s) < 0; }); cur.del = cur.del.concat(hit); redrawPage(pi); }
    }
    function seg(st, a, b, c) {
      var sc = cv.width / PAGE.w;
      ctx.save(); ctx.strokeStyle = st.c; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      var m1x = (a[0] + b[0]) / 2, m1y = (a[1] + b[1]) / 2, m2x = (b[0] + c[0]) / 2, m2y = (b[1] + c[1]) / 2;
      ctx.lineWidth = strokeW(st, (a[2] + b[2]) / 2) * sc; ctx.beginPath(); ctx.moveTo(m1x * sc, m1y * sc); ctx.quadraticCurveTo(b[0] * sc, b[1] * sc, m2x * sc, m2y * sc); ctx.stroke();
      ctx.restore();
    }
    cv.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'pen') { if (!penSeen) { penSeen = true; if (fingerDraw) { fingerDraw = false; syncTools(); toast('Đã nhận bút ✏️ Ngón tay giờ để cuộn trang'); } } if (pan) pan = null; }
      if (e.pointerType === 'touch') {
        touches[e.pointerId] = 1;
        if (isPalm(e) || performance.now() < penUntil) return;
        var nT = Object.keys(touches).length;
        if (!fingerDraw || nT > 1) {
          if (cur && cur.touch) { // ngón thứ 2 chạm: huỷ nét đang vẽ, chuyển sang cuộn
            INK.pages[pi] = (INK.pages[pi] || []).filter(function (s) { return s !== cur.st; }); redrawPage(pi); cur = null;
          }
          panStart(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} return;
        }
      }
      if (cur) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      var p = pt(e);
      cur = { id: e.pointerId, touch: e.pointerType === 'touch', del: [] };
      if (tool.erase) { cur.erase = true; eraseAt(p); return; }
      cur.st = { c: tool.c, w: WIDTHS[tool.w], pen: e.pointerType === 'pen', p: [p] };
      (INK.pages[pi] || (INK.pages[pi] = [])).push(cur.st);
      ctx.save(); drawInkStroke(ctx, cur.st, cv.width / PAGE.w); ctx.restore();
    });
    cv.addEventListener('pointermove', function (e) {
      if (pan && e.pointerId === pan.id) { if (performance.now() < penUntil) { pan = null; return; } panMove(e); return; }
      if (!cur || e.pointerId !== cur.id) return;
      e.preventDefault();
      if (e.pointerType === 'pen') penUntil = performance.now() + 600;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null; if (!evs || !evs.length) evs = [e];
      evs.forEach(function (ce) {
        var p = pt(ce);
        if (cur.erase) { eraseAt(p); return; }
        var P = cur.st.p, l = P[P.length - 1];
        if (Math.abs(l[0] - p[0]) + Math.abs(l[1] - p[1]) < 0.12) return;
        P.push(p);
        if (P.length >= 3) seg(cur.st, P[P.length - 3], P[P.length - 2], P[P.length - 1]);
        else { ctx.save(); ctx.strokeStyle = cur.st.c; ctx.lineCap = 'round'; ctx.lineWidth = strokeW(cur.st, p[2]) * cv.width / PAGE.w; ctx.beginPath(); ctx.moveTo(P[0][0] * cv.width / PAGE.w, P[0][1] * cv.width / PAGE.w); ctx.lineTo(((P[0][0] + p[0]) / 2) * cv.width / PAGE.w, ((P[0][1] + p[1]) / 2) * cv.width / PAGE.w); ctx.stroke(); ctx.restore(); }
      });
    });
    function end(e) {
      if (e.pointerType === 'touch') delete touches[e.pointerId];
      if (pan && e.pointerId === pan.id) { panEnd(e); return; }
      if (!cur || e.pointerId !== cur.id) return;
      if (e.pointerType === 'pen') penUntil = performance.now() + 500;
      if (cur.erase) { if (cur.del.length) { pushAct({ pg: pi, add: [], del: cur.del }); saveInk(); } }
      else { if (e.type === 'pointercancel' && cur.st.p.length < 2) { INK.pages[pi] = INK.pages[pi].filter(function (s) { return s !== cur.st; }); } else pushAct({ pg: pi, add: [cur.st], del: [] }); redrawPage(pi); saveInk(); }
      cur = null;
    }
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('touchstart', function (e) { if (e.touches.length === 1 && e.touches[0].touchType === 'stylus') e.preventDefault(); }, { passive: false });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  /* ================= Luyện nét (Hanzi Writer) ================= */
  var qChars = [], qi = 0, hw = null, qOutline = true;
  function qGridSVG() {
    var it = []; gridItems(it, 1, 1, 1, 98, 'mi', '#E8A3A3', false);
    it.forEach(function (o) { o.lw *= 3.2; });
    return toSVG({ items: it }).replace('viewBox="0 0 210 297"', 'viewBox="0 0 100 100"').replace('<rect width="210" height="297" fill="#fff"/>', '');
  }
  function openQuiz(ch) {
    qChars = []; ENTS.forEach(function (e) { e.chars.forEach(function (c) { if (qChars.indexOf(c) < 0) qChars.push(c); }); });
    if (!qChars.length) { toast('Thêm chữ vào vở trước nhé'); return; }
    qi = Math.max(0, qChars.indexOf(ch));
    $('#qGrid').innerHTML = qGridSVG();
    $('#qChips').innerHTML = qChars.map(function (c, i) { return '<button data-i="' + i + '">' + esc(c) + '</button>'; }).join('');
    openModal('#qz'); loadQ();
  }
  $('#qChips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { qi = +b.dataset.i; loadQ(); } });
  $('#qPrev').onclick = function () { qi = (qi - 1 + qChars.length) % qChars.length; loadQ(); };
  $('#qNext').onclick = function () { qi = (qi + 1) % qChars.length; loadQ(); };
  $('#qAnim').onclick = function () { if (hw) { hw.cancelQuiz(); hw.showCharacter(); hw.animateCharacter(); } };
  $('#qTry').onclick = startQuiz;
  $('#qOutline').onchange = function () { qOutline = this.checked; if (hw) { if (qOutline) hw.showOutline(); else hw.hideOutline(); } };
  function qMsg(t, bad) { var m = $('#qMsg'); m.textContent = t; m.classList.toggle('bad', !!bad); m.classList.add('show'); clearTimeout(m._t); m._t = setTimeout(function () { m.classList.remove('show'); }, 1500); }
  function stopQuiz() { if (hw) { try { hw.cancelQuiz(); } catch (e) {} } }
  function loadQ() {
    var ch = qChars[qi];
    $$('#qChips button').forEach(function (b, i) { b.classList.toggle('on', i === qi); if (i === qi) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
    var e = ENTS.filter(function (x) { return x.hz === ch; })[0] || { hz: ch, chars: [ch] };
    var inf = infoOf(e.inf ? e : { hz: ch, chars: [ch], ctx: null });
    $('#qInfo').innerHTML = '<b>' + esc(inf.py) + '</b>' + (inf.hv ? ' · ' + esc(inf.hv.toUpperCase()) : '') + (inf.m ? ' · ' + esc(inf.m) : '');
    var box = $('#qW'); box.innerHTML = '';
    var size = box.clientWidth || 300;
    strokeData(ch).then(function (d) {
      if (qChars[qi] !== ch) return;
      if (!d) { box.innerHTML = '<div style="display:grid;place-items:center;height:100%;font:500 ' + (size * 0.7) + 'px/1 ' + F.han + ';color:#ccc">' + esc(ch) + '</div>'; $('#qInfo').innerHTML += '<br><small>Chưa có dữ liệu nét cho chữ này</small>'; hw = null; return; }
      hw = window.HanziWriter.create(box, ch, {
        width: size, height: size, padding: size * 0.06, showCharacter: false, showOutline: qOutline,
        strokeColor: '#2B2B2B', outlineColor: '#E4DCD3', drawingColor: '#7C5CDB', drawingWidth: Math.max(4, size / 45),
        highlightColor: '#F08A24', strokeAnimationSpeed: 1.1, delayBetweenStrokes: 220,
        charDataLoader: function (c, ok, err) { strokeData(c).then(function (x) { if (x) ok(x); else err(); }); }
      });
      startQuiz();
    });
  }
  function startQuiz() {
    if (!hw) return;
    var total = (SD[qChars[qi]] || { strokes: [] }).strokes.length, miss = 0;
    hw.hideCharacter();
    hw.quiz({
      showHintAfterMisses: 2, leniency: 1.15, highlightOnComplete: true,
      onMistake: function () { miss++; qMsg(miss >= 2 ? 'Gợi ý nét tiếp theo nè 👆' : 'Chưa đúng, thử lại nhé', true); },
      onCorrectStroke: function (d) { if (d.strokesRemaining) qMsg('Nét ' + (d.strokeNum + 1) + '/' + total + ' ✓'); },
      onComplete: function (d) {
        qMsg(d.totalMistakes === 0 ? 'Hoàn hảo! 🎉' : d.totalMistakes <= 2 ? 'Giỏi lắm! 👏' : 'Xong rồi! Luyện thêm lần nữa nhé 💪');
        if (qChars.length > 1) setTimeout(function () { if (!$('#qz').hidden && qChars[qi] === d.character) { qi = (qi + 1) % qChars.length; loadQ(); } }, 1700);
      }
    });
  }
  $('#openQuiz').onclick = function () { openQuiz(); };

  /* ================= khởi động ================= */
  var bud = $('#buddy'); if (bud && window.BM_MASCOT) bud.innerHTML = window.BM_MASCOT();
  paintAll();
  render().then(function () { loadVocab().then(function () { schedule(0); }); });
  window.VO = { render: render, layout: function () { return PAGES; }, S: function () { return S; }, ink: function () { return INK; }, ents: function () { return ENTS; } };
})();
