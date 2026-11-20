/* Trà Sữa – đọc báo tiếng Trung + phòng thi HSK + từ vựng + giao tiếp */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
var LS = {
  get: function (k, d) { try { var v = localStorage.getItem('ts.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('ts.' + k, JSON.stringify(v)); } catch (e) {} },
  del: function (k) { try { localStorage.removeItem('ts.' + k); } catch (e) {} },
};
var APP = $('#app');
var isCJK = function (c) { return /[㐀-鿿豈-﫿]/.test(c); };
var LETTERS = 'ABCDEF';
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
function ago(ms) { var m = Math.round((Date.now() - ms) / 60000); if (m < 1) return 'vừa xong'; if (m < 60) return m + ' phút trước'; var h = Math.round(m / 60); if (h < 24) return h + ' giờ trước'; return Math.round(h / 24) + ' ngày trước'; }
function fmtTime(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60); return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }

/* ---------------- activity / streak ---------------- */
function act(kind, n) {
  var d = LS.get('days', {}); var t = today(); d[t] = d[t] || {}; d[t][kind] = (d[t][kind] || 0) + (n || 1); LS.set('days', d);
}
function streak() {
  var d = LS.get('days', {}); var n = 0; var x = new Date();
  if (!d[today()]) x.setDate(x.getDate() - 1);
  for (;;) { var k = x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); if (!d[k]) break; n++; x.setDate(x.getDate() - 1); }
  return n;
}

/* ---------------- mascot ---------------- */
var mid = 0;
function mascot(cls) {
  var i = ++mid;
  return '<svg class="' + (cls || 'mascot') + '" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="mt' + i + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d2b0"/><stop offset="1" stop-color="#d9a174"/></linearGradient></defs>' +
    '<rect x="68" y="4" width="9" height="40" rx="4" transform="rotate(14 72 24)" fill="#ff6f9a"/>' +
    '<path d="M22 34h76l-9 74a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7z" fill="url(#mt' + i + ')" stroke="#a0663d" stroke-width="3"/>' +
    '<rect x="17" y="27" width="86" height="12" rx="6" fill="#fff" stroke="#a0663d" stroke-width="3"/>' +
    '<g fill="#5a3522"><circle cx="45" cy="99" r="5"/><circle cx="58" cy="103" r="5"/><circle cx="71" cy="99" r="5"/><circle cx="52" cy="92" r="4.5"/><circle cx="65" cy="92" r="4.5"/><circle cx="80" cy="95" r="4.5"/><circle cx="39" cy="91" r="4"/></g>' +
    '<g fill="#3b2a20"><ellipse cx="47" cy="60" rx="4.2" ry="5.2"/><ellipse cx="73" cy="60" rx="4.2" ry="5.2"/></g><circle cx="48.5" cy="58" r="1.5" fill="#fff"/><circle cx="74.5" cy="58" r="1.5" fill="#fff"/>' +
    '<path d="M54 68q6 6 12 0" stroke="#3b2a20" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="38" cy="70" rx="6" ry="3.5" fill="#ff8fb0" opacity=".7"/><ellipse cx="82" cy="70" rx="6" ry="3.5" fill="#ff8fb0" opacity=".7"/></svg>';
}

/* ---------------- pinyin ---------------- */
var PY = window.pinyinPro;
/* pinyin fixes: common polyphones that pinyin-pro gets wrong in context */
try { PY.customPinyin({ '长满': 'zhǎng mǎn', '长高': 'zhǎng gāo', '长出': 'zhǎng chū', '长得': 'zhǎng de', '长胖': 'zhǎng pàng', '调高': 'tiáo gāo', '调低': 'tiáo dī', '背不动': 'bēi bú dòng', '背走': 'bēi zǒu', '背着': 'bēi zhe', '背起': 'bēi qǐ', '种了': 'zhòng le', '种下': 'zhòng xià', '种树': 'zhòng shù', '种菜': 'zhòng cài', '还给': 'huán gěi', '还钱': 'huán qián', '还书': 'huán shū', '塞翁': 'sài wēng', '椰子': 'yē zi', '难处': 'nán chu', '一点儿': 'yì diǎn r', '一会儿': 'yí huì r', '一块儿': 'yí kuài r', '玩儿': 'wán r', '哪儿': 'nǎ r', '这儿': 'zhè r', '那儿': 'nà r', '有点儿': 'yǒu diǎn r', '一下儿': 'yí xià r', '好好儿': 'hǎo hāo r', '慢慢儿': 'màn mān r', '没事儿': 'méi shì r', '一边儿': 'yì biān r', '朝三暮四': 'zhāo sān mù sì', '乐广': 'yuè guǎng', '蔺相如': 'lìn xiàng rú', '桃子': 'táo zi', '斧子': 'fǔ zi', '豆子': 'dòu zi', '袋子': 'dài zi', '金子': 'jīn zi', '蚊子': 'wén zi', '妻子': 'qī zi', '粽子': 'zòng zi', '橡子': 'xiàng zi', '杯子': 'bēi zi', '一下子': 'yí xià zi', '和尚': 'hé shang', '石头': 'shí tou', '有多重': 'yǒu duō zhòng', '担心得': 'dān xīn de', '只会': 'zhǐ huì', '一只会': 'yì zhī huì', '只剩': 'zhǐ shèng', '只装': 'zhǐ zhuāng', '只得到': 'zhǐ dé dào', '封为': 'fēng wéi', '还剑': 'huán jiàn', '还你': 'huán nǐ', '点着蜡烛': 'diǎn zhe là zhú', '点着了一根': 'diǎn zháo le yì gēn' }); } catch (e) {}
var DE_NEXT = '到意出分奖病罪知失益体当以逞手宠势票主天', DE_PRE = '获取难心赢求所舍免自夺彼雅安'; // 得 stays dé
var DEI_PRE = '我你他她它们就也都少须还'; // modal 得 = děi
var DI_PRE = '了在等局海两多一散的满土大天当各本外内此场基草田园陆山盆工目该某产境遍原落空耕荒雪平高低绿圣宝福胜营阵驻腹属领湿沼盐坡谷洼旱农墓'; // noun + 地 → dì
var DI_NEXT = '方区点图球铁下上面址带震位磁边毯板道里主形质狱块段域势标壳盘基契租价产铺砖窖心底层图';
function fixPy(r) {
  for (var i = 0; i < r.length; i++) {
    var x = r[i], pv = r[i - 1], nx = r[i + 1];
    if (!x.isZh || !pv || !pv.isZh) continue;
    if (x.origin === '得' && x.pinyin === 'dé' && !(nx && nx.isZh && DE_NEXT.indexOf(nx.origin) >= 0) && DE_PRE.indexOf(pv.origin) < 0 && !(pv.origin === '不' && nx && nx.origin === '不')) x.pinyin = DEI_PRE.indexOf(pv.origin) >= 0 && nx && nx.isZh ? 'děi' : 'de';
    else if (x.origin === '地' && x.pinyin === 'dì' && nx && nx.isZh && (DI_PRE.indexOf(pv.origin) < 0 || /适当|恰当|相当|充分/.test((r[i - 2] ? r[i - 2].origin : '') + pv.origin)) && DI_NEXT.indexOf(nx.origin) < 0 && (pv.origin === pv.origin && (r[i - 2] && r[i - 2].isZh))) x.pinyin = 'de';
  }
  return r;
}
function pyAll(text) { try { return fixPy(PY.pinyin(text, { type: 'all' })); } catch (e) { return [].map.call(text, function (c) { return { origin: c, pinyin: '', isZh: isCJK(c) }; }); } }
function pyWord(w) { try { return fixPy(PY.pinyin(w, { type: 'all' })).map(function (x) { return x.pinyin; }).join(''); } catch (e) { return ''; } }
function ruby(text) {
  return pyAll(text).map(function (x) { return x.isZh ? '<ruby>' + esc(x.origin) + '<rt>' + esc(x.pinyin) + '</rt></ruby>' : (x.origin === '\n' ? '<br>' : esc(x.origin)); }).join('');
}
function zhHTML(text, withPy) { return withPy ? ruby(text) : esc(text).replace(/\n/g, '<br>'); }

/* ---------------- vocab + dictionary ---------------- */
var VOC = null, VMAP = null, vocP = null;
function loadVocab() {
  if (vocP) return vocP;
  vocP = fetch('data/vocab.json').then(function (r) { return r.json(); }).then(function (a) {
    VOC = a.map(function (x) { return { w: x[0], p: x[1].replace(/ /g, ''), hv: x[2], m: x[3], o: x[4], t: x[5], n: x[6] || 0 }; });
    VMAP = new Map(); VOC.forEach(function (v) { if (!VMAP.has(v.w)) VMAP.set(v.w, v); });
    return VOC;
  }).catch(function () { vocP = null; return null; });
  return vocP;
}
var DICT = null, dictP = null;
function loadDict() {
  if (dictP) return dictP;
  var urls = ['../dict.txt', 'https://thaoanh1311997-png.github.io/Pinyin/dict.txt'];
  dictP = (async function () {
    for (var u of urls) {
      try {
        var r = await fetch(u); if (!r.ok) continue;
        var txt = await r.text(); var m = new Map(); var i = 0;
        while (i < txt.length) { var j = txt.indexOf('\n', i); if (j < 0) j = txt.length; var t = txt.indexOf('\t', i); if (t > i && t < j) m.set(txt.slice(i, t), txt.slice(t + 1, j)); i = j + 1; }
        if (m.size > 100) { DICT = m; return m; }
      } catch (e) {}
    }
    dictP = null; return null;
  })();
  return dictP;
}
function dictEntries(w) {
  var raw = DICT && DICT.get(w); if (!raw) return [];
  return raw.split('\t').map(function (s) { var a = s.split('|'); return { p: a[0] || '', h: a[1] && a[1] !== '_' ? a[1].replace(/_/g, '').trim() : '', m: a[2] || '' }; });
}
function cleanMean(m) { return m.replace(/\[[^\]]*\]/g, '').replace(/\s+([;,])/g, '$1').split(/\s*\/\s*/).filter(Boolean).slice(0, 6); }

/* ---------------- segmentation ---------------- */
var SEGR = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('zh-CN', { granularity: 'word' }) : null;
function known(w) { return (DICT && DICT.has(w)) || (VMAP && VMAP.has(w)); }
function bmm(s) { // backward maximum matching
  var out = []; var cs = Array.from(s); var j = cs.length;
  while (j > 0) { var len = 1; for (var L = Math.min(4, j); L > 1; L--) { if (known(cs.slice(j - L, j).join(''))) { len = L; break; } } out.unshift(cs.slice(j - len, j).join('')); j -= len; }
  return out;
}
function segment(text) {
  var out = []; var buf = '';
  var flush = function () {
    if (!buf) return;
    if (SEGR) {
      for (var sg of SEGR.segment(buf)) { var p = sg.segment; if (p.length > 1 && DICT && !known(p)) out.push.apply(out, bmm(p)); else out.push(p); }
    } else out.push.apply(out, bmm(buf));
    buf = '';
  };
  Array.from(text).forEach(function (c) { if (isCJK(c)) buf += c; else { flush(); var l = out[out.length - 1]; if (l && !isCJK(l[0]) && !/[，。！？；：、]/.test(c) && !/[，。！？；：、]/.test(l)) out[out.length - 1] = l + c; else out.push(c); } });
  flush();
  return out;
}
function wordsHTML(text) { // interactive words with pinyin
  var py = pyAll(text); var k = 0; var toks = [];
  segment(text).forEach(function (w) {
    var n = Array.from(w).length; var parts = py.slice(k, k + n); k += n;
    if (!isCJK(w[0])) { toks.push({ h: '<span class="w punct"><span class="p"></span><span class="c">' + esc(w) + '</span></span>', open: /^[“‘「『《（(\[【]+$/.test(w.trim()), pu: !/^\s+$/.test(w) }); return; }
    toks.push({ h: '<span class="w" data-w="' + esc(w) + '"><span class="p">' + esc(parts.map(function (x) { return x.pinyin; }).join('')) + '</span><span class="c">' + esc(w) + '</span></span>' });
  });
  // keep punctuation glued to its word so it never starts/ends a line alone
  var html = '', grp = '', glueNext = false;
  toks.forEach(function (t) {
    if (t.pu && !t.open && grp) { grp += t.h; return; }
    if (glueNext) { grp += t.h; glueNext = !!t.open; return; }
    if (grp) html += '<span class="wg">' + grp + '</span>';
    grp = t.h; glueNext = !!t.open;
  });
  if (grp) html += '<span class="wg">' + grp + '</span>';
  return html;
}
function minL(c) { return c ? +String(c)[0] : 0; } // level codes: 3 = HSK3, 24 = listed in HSK2 and HSK4
function hasL(c, l) { return !!c && String(c).indexOf(String(l)) >= 0; }
function vLv(v) { return minL(v.o) || minL(v.n) || minL(v.t) || 7; }
function hskOf(w) { var v = VMAP && VMAP.get(w); return v ? vLv(v) : 0; }
function levelOfText(text) {
  if (!VMAP) return 0;
  var ls = []; segment(text).forEach(function (w) { if (!isCJK(w[0]) || /^[\d一二三四五六七八九十百千万]+$/.test(w)) return; var v = VMAP.get(w); ls.push(v ? vLv(v) : (w.length === 1 ? 4 : 7)); });
  if (!ls.length) return 0; ls.sort(function (a, b) { return a - b; });
  var p = ls[Math.floor(ls.length * 0.85)] || 1; return Math.max(1, Math.min(6, p));
}
function easeOfText(text) { // % words within HSK 1-4
  if (!VMAP) return 0; var n = 0, ok = 0;
  segment(text).forEach(function (w) { if (!isCJK(w[0]) || /^[\d一二三四五六七八九十百千万]+$/.test(w)) return; n++; var v = VMAP.get(w); if (v && vLv(v) <= 4) ok++; });
  return n ? Math.round(ok * 100 / n) : 0;
}
function easeBadge(ez) {
  var t = ez >= 50 ? ['b1', '🌱 Dễ hơn'] : ez >= 38 ? ['b4', '🌿 Vừa'] : ['b6', '🌶️ Khó'];
  return '<span class="badge ' + t[0] + '">' + t[1] + ' · ' + ez + '% từ HSK1–4</span>';
}

/* ---------------- speech (TTS) ---------------- */
var TTS = { voices: [], f: null, m: null, rate: LS.get('rate', 0.9) };
function pickVoices() {
  if (!window.speechSynthesis) return;
  var v = speechSynthesis.getVoices().filter(function (x) { return /^zh[-_](CN|Hans)/i.test(x.lang) || x.lang === 'zh'; });
  if (!v.length) v = speechSynthesis.getVoices().filter(function (x) { return /^zh/i.test(x.lang) && !/HK|TW|yue/i.test(x.lang); });
  TTS.voices = v;
  var male = v.filter(function (x) { return /yunxi|yunyang|yunjian|kangkang|li-?mu|男|male|xiaoyou/i.test(x.name) && !/female/i.test(x.name); });
  var fem = v.filter(function (x) { return male.indexOf(x) < 0; });
  TTS.f = fem.find(function (x) { return /tingting|xiaoxiao|xiaoyi|huihui|google/i.test(x.name); }) || fem[0] || v[0] || null;
  TTS.m = male[0] || null;
}
if (window.speechSynthesis) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
var speakJob = 0;
function stopSpeak() { speakJob++; try { speechSynthesis.cancel(); } catch (e) {} $$('.play.on').forEach(function (b) { b.classList.remove('on'); }); }
function speakLines(lines, onDone, onLine) {
  if (!window.speechSynthesis) { toast('Trình duyệt này không có giọng đọc 😢'); if (onDone) onDone(); return; }
  stopSpeak(); var job = ++speakJob; var i = 0;
  var next = function () {
    if (job !== speakJob) return;
    if (i >= lines.length) { if (onDone) onDone(); return; }
    var L = lines[i++]; if (onLine) onLine(i - 1);
    var u = new SpeechSynthesisUtterance(L.text); u.lang = 'zh-CN';
    var r = TTS.rate * (L.slow ? 0.7 : 1);
    if (L.who === 'm') { if (TTS.m) { u.voice = TTS.m; u.pitch = 1; } else { if (TTS.f) u.voice = TTS.f; u.pitch = 0.62; } }
    else if (L.who === 'q') { if (TTS.f) u.voice = TTS.f; u.pitch = 1.05; }
    else { if (TTS.f) u.voice = TTS.f; u.pitch = L.who === 'f' ? 1.18 : 1; }
    u.rate = r;
    var done = false; var fin = function () { if (done) return; done = true; clearTimeout(guard); setTimeout(next, L.gap || 450); };
    u.onend = fin; u.onerror = fin;
    var guard = setTimeout(fin, 1500 + L.text.length * 420 / r);
    speechSynthesis.speak(u);
  };
  next();
}
function scriptLines(script) {
  var out = [];
  String(script).split('\n').forEach(function (l) {
    l = l.trim(); if (!l) return; var who = 'n';
    var m = l.match(/^(男|女|问|A|B)[：:]\s*/);
    if (m) { who = m[1] === '男' || m[1] === 'B' ? 'm' : m[1] === '女' || m[1] === 'A' ? 'f' : 'q'; l = l.slice(m[0].length); }
    out.push({ text: l, who: who, gap: who === 'q' ? 700 : 450 });
  });
  return out;
}
function say(text, slow) { speakLines([{ text: text, slow: slow }]); }

/* ---------------- sheet / modal ---------------- */
var veil = $('#veil'), sheet = $('#sheet'), modal = $('#modal');
function openSheet(html) { $('#sheetBody').innerHTML = html; veil.classList.remove('hide'); requestAnimationFrame(function () { veil.classList.add('on'); sheet.classList.add('on'); }); sheet.scrollTop = 0; }
function closeSheet() { sheet.classList.remove('on'); modal.classList.remove('on'); veil.classList.remove('on'); setTimeout(function () { if (!sheet.classList.contains('on') && !modal.classList.contains('on')) { veil.classList.add('hide'); modal.classList.add('hide'); } }, 220); $$('.w.sel').forEach(function (x) { x.classList.remove('sel'); }); }
veil.onclick = function () { if (!modal.classList.contains('on') || !modal._lock) closeSheet(); };
function ask(title, body, yes, no, onYes, color) {
  modal.innerHTML = '<h3>' + title + '</h3><div class="muted" style="font-weight:700">' + body + '</div><div class="acts">' + (no ? '<button class="btn ghost" data-a="no">' + no + '</button>' : '') + '<button class="btn ' + (color || '') + '" data-a="yes">' + yes + '</button></div>';
  modal.classList.remove('hide'); veil.classList.remove('hide');
  requestAnimationFrame(function () { veil.classList.add('on'); modal.classList.add('on'); });
  modal.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; closeSheet(); if (b.dataset.a === 'yes' && onYes) onYes(); };
}

/* ---------------- word popup (dictionary) ---------------- */
function saved() { return LS.get('nb', []); }
function toggleSave(w) { var a = saved(); var i = a.indexOf(w); if (i >= 0) a.splice(i, 1); else a.unshift(w); LS.set('nb', a); return i < 0; }
async function showWord(w, el) {
  $$('.w.sel').forEach(function (x) { x.classList.remove('sel'); }); if (el) el.classList.add('sel');
  await loadVocab();
  var render = function () {
    var v = VMAP && VMAP.get(w); var es = dictEntries(w);
    var py = (es[0] && es[0].p) || (v && v.p) || pyWord(w);
    var hv = (es[0] && es[0].h) || (v && v.hv) || '';
    var ms = [];
    es.forEach(function (e) { if (/^(biến thể|dạng cổ)/i.test(e.m)) return; cleanMean(e.m).forEach(function (x) { if (ms.indexOf(x) < 0) ms.push(x); }); });
    if (!ms.length && v) ms = v.m.split('; ');
    var lbl = function (c) { return String(c).split('').map(function (d) { return d === '7' ? '7–9' : d; }).join(', '); };
    var lv = v ? (v.n ? '<span class="badge b' + minL(v.n) + '">HSK 3.0 · ' + lbl(v.n) + '</span> ' : '') + (v.t ? '<span class="badge b' + minL(v.t) + '">Thi 2025 · ' + lbl(v.t) + '</span> ' : '') + (v.o ? '<span class="badge b' + minL(v.o) + '">HSK 2.0 · ' + lbl(v.o) + '</span>' : '') : '';
    var isS = saved().indexOf(w) >= 0;
    openSheet('<div class="wd-h"><div class="big">' + esc(w) + '</div><div class="grow"><div class="pyb">' + esc(py) + '</div><div class="wd-hv">' + (hv ? 'Hán Việt: ' + esc(hv.toUpperCase()) : '') + '</div><div style="margin-top:4px">' + lv + '</div></div><button class="iconbtn" data-say>🔊</button></div>' +
      (ms.length ? '<ol class="wd-m">' + ms.slice(0, 8).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol>' : '<p class="muted" id="wdLoad">' + (DICT ? 'Chưa có nghĩa trong từ điển. Thử bấm “Dịch Google”.' : 'Đang tải từ điển… ⏳') + '</p>') +
      '<div class="wd-acts"><button class="btn sm ' + (isS ? 'pink' : 'ghost') + '" data-save>' + (isS ? '★ Đã lưu' : '☆ Lưu vào sổ tay') + '</button><a class="btn sm ghost" target="_blank" rel="noopener" href="https://translate.google.com/?sl=zh-CN&tl=vi&text=' + encodeURIComponent(w) + '">Dịch Google ↗</a></div>');
    say(w);
  };
  render();
  if (!DICT) loadDict().then(function () { if (sheet.classList.contains('on') && $('#wdLoad')) render(); });
}
$('#sheetBody').addEventListener('click', function (e) {
  var b = e.target.closest('[data-say]'); if (b) { var w = $('.wd-h .big'); if (w) say(w.textContent); return; }
  b = e.target.closest('[data-save]'); if (b) { var w2 = $('.wd-h .big').textContent; var on = toggleSave(w2); b.className = 'btn sm ' + (on ? 'pink' : 'ghost'); b.textContent = on ? '★ Đã lưu' : '☆ Lưu vào sổ tay'; toast(on ? 'Đã thêm vào sổ tay ⭐' : 'Đã bỏ khỏi sổ tay'); }
});
document.addEventListener('click', function (e) {
  var w = e.target.closest('.w[data-w]'); if (w) { showWord(w.dataset.w, w); }
});

/* ---------------- translation ---------------- */
async function translateLines(lines) {
  var q = lines.join('\n');
  try {
    var r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=' + encodeURIComponent(q));
    if (!r.ok) throw 0; var d = await r.json();
    var full = (d[0] || []).map(function (x) { return x[0]; }).join('');
    var out = full.split('\n').map(function (s) { return s.trim(); });
    if (out.length === lines.length) return out;
    // segment counts differ: translate one by one
  } catch (e) {}
  var res = [];
  for (var i = 0; i < lines.length; i++) {
    try {
      var r2 = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=' + encodeURIComponent(lines[i]));
      var d2 = await r2.json(); res.push((d2[0] || []).map(function (x) { return x[0]; }).join(''));
    } catch (e) {
      try { var r3 = await fetch('https://api.mymemory.translated.net/get?langpair=zh-CN|vi&q=' + encodeURIComponent(lines[i])); var d3 = await r3.json(); res.push(d3.responseData.translatedText || ''); } catch (e2) { res.push(''); }
    }
  }
  return res;
}

/* =============================== ROUTER =============================== */
var routes = {}; var RT = 0;
var curRoute = '';
function go(h) { location.hash = h; }
function render() {
  var h = location.hash.replace(/^#\/?/, ''); var parts = h.split('/');
  var name = parts[0] || 'home';
  if (EX && name !== 'room') { /* leaving exam room by back button */ }
  stopSpeak(); closeSheet(); APP.onclick = null; APP.oninput = null;
  document.body.classList.toggle('room', name === 'room');
  $$('#tabs a').forEach(function (a) { a.classList.toggle('on', a.dataset.t === (name === 'read' ? 'news' : name === 'result' || name === 'room' || name === 'level' ? 'exam' : name === 'cards' || name === 'quiz' ? 'vocab' : name === 'topic' || name === 'role' || name === 'play' ? 'talk' : name)); });
  RT++;
  var fn = routes[name] || routes.home;
  if (curRoute !== h) window.scrollTo(0, 0);
  curRoute = h;
  fn.apply(null, parts.slice(1).map(decodeURIComponent));
}
window.addEventListener('hashchange', render);
function top(title, back, right) {
  return '<div class="top">' + (back ? '<button class="iconbtn" onclick="history.length>1?history.back():location.hash=\'' + back + '\'">←</button>' : '') + '<h1>' + title + '</h1>' + (right || '') + '</div>';
}

/* =============================== HOME =============================== */
routes.home = function () {
  var nb = saved().length; var srs = LS.get('srs', {});
  var due = Object.keys(srs).filter(function (w) { return srs[w].d <= Date.now(); }).length;
  var hist = LS.get('hist', []); var last = hist[0];
  var ph = []; (window.PHRASES || []).forEach(function (t) { t.p.forEach(function (p) { ph.push(p); }); });
  var d = new Date(); var pick = ph[(d.getDate() * 7 + d.getMonth() * 31) % ph.length];
  var hr = d.getHours(); var greet = hr < 11 ? 'Chào buổi sáng' : hr < 14 ? 'Chào buổi trưa' : hr < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  var td = LS.get('days', {})[today()] || {};
  APP.innerHTML =
    '<div class="hero">' + mascot() + '<div><h2>' + greet + '! 👋</h2><p>Mỗi ngày một ly “trà sữa” tiếng Trung: đọc 1 tin, ôn 10 từ, làm 1 phần thi nhé!</p></div></div>' +
    '<div class="stats"><div class="stat"><b>🔥 ' + streak() + '</b><span>ngày liên tiếp</span></div><div class="stat"><b>' + ((td.card || 0) + (td.quiz || 0)) + '</b><span>từ ôn hôm nay</span></div><div class="stat"><b>' + (td.read || 0) + '</b><span>bài đã đọc</span></div></div>' +
    '<div class="sec-t">Học gì hôm nay?</div>' +
    '<div class="tiles">' +
    '<a class="tile t-news" href="#/news"><span class="em">📰</span><div><b>Đọc báo</b><br><small>Tin thật · truyện · pinyin · dịch</small></div></a>' +
    '<a class="tile t-exam" href="#/exam"><span class="em">📝</span><div><b>Phòng thi HSK</b><br><small>' + (last ? 'Lần gần nhất: ' + last.score + '/' + last.max : 'HSK 1–6 · HSK 3.0') + '</small></div></a>' +
    '<a class="tile t-vocab" href="#/vocab"><span class="em">🃏</span><div><b>Từ vựng</b><br><small>' + (due ? due + ' từ cần ôn' : 'Flashcard theo cấp HSK') + '</small></div></a>' +
    '<a class="tile t-talk" href="#/talk"><span class="em">💬</span><div><b>Giao tiếp</b><br><small>12 chủ đề đời thường</small></div></a></div>' +
    '<div class="sec-t">💡 Câu hôm nay</div>' +
    '<div class="ph"><div class="zl zh">' + ruby(pick[0]) + '</div><div class="v">' + esc(pick[1]) + '</div><div class="acts"><button data-say="' + esc(pick[0]) + '">🔊 Nghe</button><button data-say="' + esc(pick[0]) + '" data-slow="1">🐢 Chậm</button></div></div>' +
    '<div class="sec-t">📖 Truyện hôm nay <small><a href="#/news/story">Xem tất cả →</a></small></div>' + easyCard(window.STORY[Math.floor(Date.now() / 864e5) % window.STORY.length]) +
    '<div class="sec-t">📰 Tin mới <small><a href="#/news">Xem tất cả →</a></small></div><div id="homeNews"><div class="empty">Đang tải tin… ⏳</div></div>' +
    (nb ? '<a class="card row" style="text-decoration:none;color:inherit" href="#/vocab/nb"><span style="font-size:28px">⭐</span><div class="grow"><b>Sổ tay của bạn</b><div class="muted small">' + nb + ' từ đã lưu khi đọc báo</div></div><span>→</span></a>' : '') +
    '<div class="foot">Trà Sữa 🧋 · tin tức từ 中国新闻网 (chinanews.com.cn) · đề thi là đề luyện tự soạn theo cấu trúc HSK</div>';
  loadNews().then(function (j) {
    var el = $('#homeNews'); if (!el) return;
    var items = (j && j.items || []).slice(0, 3);
    el.innerHTML = items.length ? items.map(newsCard).join('') : '<div class="card muted">Chưa tải được tin mới. Bạn đọc thử <a href="#/news/easy">bài dễ</a> nhé!</div>';
  });
};
document.addEventListener('click', function (e) { var b = e.target.closest('[data-say]'); if (b && !b.closest('#sheetBody')) say(b.getAttribute('data-say'), !!b.dataset.slow); });

/* =============================== NEWS =============================== */
var CATS = [['easy', '⭐ Bài dễ', '#fff0c7', '⭐'], ['story', '📖 Truyện', '#ebe5ff', '📖'], ['all', '🔥 Mới nhất', '#ffe1ea', '🔥'], ['xh', '🏘️ Xã hội', '#dcecff', '🏘️'], ['tn', '🇨🇳 Trong nước', '#ffe2dc', '🇨🇳'], ['qt', '🌏 Quốc tế', '#d8f6ec', '🌏'], ['kt', '💰 Kinh tế', '#fff0c7', '💰'], ['vh', '🎎 Văn hóa', '#ebe5ff', '🎎'], ['tt', '⚽ Thể thao', '#d8f6ec', '⚽'], ['sk', '🩺 Sức khỏe', '#ffe1ea', '🩺'], ['gd', '🎓 Giáo dục', '#dcecff', '🎓']];
var newsP = null;
function loadNews() {
  if (newsP) return newsP;
  newsP = Promise.all([fetch('data/news.json?t=' + Math.floor(Date.now() / 6e5)).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }), loadVocab(),
    fetch('data/img/index.json?t=' + Math.floor(Date.now() / 6e5)).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })]).then(function (a) {
    var j = a[0]; THUMBS = new Set(a[2] || []);
    if (j && j.items) j.items.forEach(function (it) { it.lv = levelOfText(it.t + it.b); it.ez = easeOfText(it.t + it.b); });
    else newsP = null;
    return j;
  });
  return newsP;
}
var THUMBS = new Set();
function thumbOf(it) { return THUMBS.has(it.id) ? 'data/img/' + it.id + '.jpg' : it.img && !/\/fileftp\//.test(it.img) ? it.img.replace(/^http:/, 'https:') : ''; } // publisher's own photo (loads without referrer)
function catOf(c) { return CATS.find(function (x) { return x[0] === c; }) || CATS[2]; }
function newsCard(it) {
  var c = catOf(it.c); var read = LS.get('read', {})[it.id];
  var th = thumbOf(it);
  return '<a class="news' + (read ? ' read' : '') + '" href="#/read/' + it.id + '">' + (th ? '<div class="thumb" style="background:' + c[2] + '"><span>' + c[3] + '</span><img src="' + esc(th) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></div>' : '<div class="ico" style="background:' + c[2] + '">' + c[3] + '</div>') + '<div class="grow"><h3>' + esc(it.t) + '</h3><p>' + esc(it.b) + '</p><div class="meta">' + (it.ez ? easeBadge(it.ez) : '') + '<span>' + esc(it.s) + '</span><span>· ' + ago(it.d) + '</span>' + (read ? '<span>· ✓ đã đọc</span>' : '') + '</div></div></a>';
}
function easyCard(e) {
  var read = LS.get('read', {})[e.id];
  return '<a class="news' + (read ? ' read' : '') + '" href="#/read/' + e.id + '"><div class="ico" style="background:' + (e.g ? '#ebe5ff' : '#fff0c7') + '">' + e.e + '</div><div class="grow"><h3>' + esc(e.t) + '</h3><p style="font-family:var(--ui);font-weight:700">' + esc(e.tv) + '</p><div class="meta"><span class="badge b' + e.lv + '">HSK ' + e.lv + '</span><span>' + (e.g ? esc(e.g) + ' · có dịch sẵn' : 'Bài đọc luyện tập · có dịch sẵn') + '</span>' + (read ? '<span>· ✓ đã đọc</span>' : '') + '</div></div></a>';
}
routes.news = function (cat) {
  cat = cat || LS.get('ncat', 'all'); LS.set('ncat', cat);
  APP.innerHTML = top('📰 <span>Đọc báo</span>') +
    '<div class="chips">' + CATS.map(function (c) { return '<a class="chip' + (c[0] === cat ? ' on' : '') + '" href="#/news/' + c[0] + '" style="text-decoration:none;color:inherit">' + c[1] + '</a>'; }).join('') + '</div><div id="nlist"><div class="empty">Đang tải tin… ⏳</div></div>';
  if (cat === 'easy' || cat === 'story') {
    var isSt = cat === 'story'; var SRC = isSt ? window.STORY : window.EASY;
    var el0 = $('#nlist'); var ef = LS.get(isSt ? 'slv' : 'elv', 0);
    var groups = isSt ? [[0, 'Tất cả'], [2, 'HSK 1–2'], [3, 'HSK 3'], [4, 'HSK 4'], [56, 'HSK 5–6']] : [[0, 'Tất cả'], [2, 'HSK 1–2'], [3, 'HSK 3'], [4, 'HSK 4'], [5, 'HSK 5']];
    var list = SRC.slice().sort(function (a, b) { return a.lv - b.lv; }).filter(function (e) { return !ef || (ef === 2 ? e.lv <= 2 : ef === 56 ? e.lv >= 5 : e.lv === ef); });
    el0.innerHTML = '<div class="seg" id="elseg">' + groups.map(function (g) { return '<button data-lv="' + g[0] + '" class="' + (ef === g[0] ? 'on' : '') + '">' + g[1] + '</button>'; }).join('') + '</div>' +
      (isSt ? '<div class="note">📖 ' + SRC.length + ' truyện từ HSK 1 đến HSK 6: thành ngữ, ngụ ngôn, cổ tích Trung Quốc – Việt Nam và truyện ngắn. Có dịch sẵn từng câu và bài học cuối truyện.</div>'
        : '<div class="note">⭐ ' + SRC.length + ' bài đọc ngắn từ HSK 1 đến HSK 5, có bản dịch tiếng Việt sẵn từng câu — hợp để khởi động trước khi đọc báo thật.</div>') + list.map(easyCard).join('');
    $('#elseg').onclick = function (e) { var b = e.target.closest('[data-lv]'); if (!b) return; LS.set(isSt ? 'slv' : 'elv', +b.dataset.lv); routes.news(cat); };
    return;
  }
  loadNews().then(function (j) {
    var el = $('#nlist'); if (!el) return;
    if (!j || !j.items || !j.items.length) { el.innerHTML = '<div class="card">😢 Chưa tải được tin. Kiểm tra mạng rồi thử lại, hoặc đọc <a href="#/news/easy">bài dễ</a>.</div>'; return; }
    var items = j.items.filter(function (it) { return cat === 'all' || it.c === cat; });
    var srt = LS.get('nsort', 'new');
    var lvBar = '<div class="seg" id="lvseg">' + [['new', '🕒 Mới nhất'], ['easy', '🌱 Dễ đọc trước']].map(function (x) { return '<button data-s="' + x[0] + '" class="' + (srt === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var shown = items.slice(); if (srt === 'easy') shown.sort(function (a, b) { return (b.ez || 0) - (a.ez || 0); });
    el.innerHTML = lvBar + '<a class="note" href="#/news/easy" style="display:block;text-decoration:none">📌 Báo thật thường ở mức <b>HSK 5–6</b>. Mới học thì đọc <b>⭐ Bài dễ</b> hoặc <b>📖 Truyện</b> (HSK 1–6, có dịch sẵn) trước nha →</a>' +
      '<div class="muted small" style="margin:0 4px 10px;font-weight:700">Cập nhật ' + ago(j.updated) + ' · ' + shown.length + ' tin · nguồn ' + esc([...new Set(j.items.map(function (x) { return x.s; }))].join(', ')) + '</div>' +
      (shown.length ? shown.slice(0, 80).map(newsCard).join('') : '<div class="empty">Mục này chưa có tin mới, xem <a href="#/news/all">Mới nhất</a> nha 🙈</div>');
    $('#lvseg').onclick = function (e) { var b = e.target.closest('[data-s]'); if (!b) return; LS.set('nsort', b.dataset.s); routes.news(cat); };
  });
};
/* ---- full article: fetched on the reader's own device at read time (never stored on the site) ---- */
var RELAYS = [ // free public relays (the browser can't read news sites directly); all are tried at once, the first good answer wins
  ['h', function (u) { return 'https://api.cors.lol/?url=' + encodeURIComponent(u); }],
  ['h', function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); }],
  ['h', function (u) { return 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u); }],
  ['m', function (u) { return 'https://r.jina.ai/' + u; }],
];
function splitSents(t) { return (t.match(/[^。！？!?]+[。！？!?]*[”」』）)]*/g) || [t]).map(function (x) { return x.trim(); }).filter(Boolean); }
function fromMarkdown(md, it) { // r.jina.ai answer (markdown) → paragraphs + photos
  var rows = [], lead = (it.b || '').replace(/\s/g, '').slice(0, 8);
  md.split(/\n+/).forEach(function (l) {
    l = l.trim(); var im = l.match(/^!\[[^\]]*\]\((https?:[^)\s]+)\)/);
    if (im) { if (/\.(jpe?g|png|webp)/i.test(im[1]) && !/logo|icon|ewm|qrcode|fileftp|erweima/i.test(im[1])) rows.push({ img: im[1] }); return; }
    if (/^(#|\*|-|\||>|\[|Title:|URL Source:|Published Time:|Markdown Content:)/.test(l) || /\]\(http/.test(l)) return;
    var t = l.replace(/^(中新网|中新社)[^电]{0,24}电\s*(\([^)]*\)|（[^）]*）)?\s*/, '').replace(/\s*[（(]完[）)]\s*$/, '').trim();
    if ((t.match(/[一-鿿]/g) || []).length < 12 || /^(图为|责任编辑|【编辑|来源：|编辑：)/.test(t) || /摄$/.test(t)) return;
    rows.push({ t: t });
  });
  var st = 0; if (lead) rows.some(function (r, i) { if (r.t && r.t.replace(/\s/g, '').indexOf(lead) >= 0) { st = i; return true; } return false; });
  if (st > 0 && rows[st - 1] && rows[st - 1].img) st--; // photo right above the first paragraph
  var paras = [], imgs = [], pos = [];
  rows.slice(st).forEach(function (r) { if (r.img) { if (imgs.indexOf(r.img) < 0) { imgs.push(r.img); pos.push(paras.length); } } else if (paras.indexOf(r.t) < 0) paras.push(r.t); });
  return { paras: paras, imgs: imgs.slice(0, 6), pos: pos.slice(0, 6) };
}
function fetchFull(it) {
  var k = 'fa.' + it.id, c = LS.get(k, null); if (c && c.paras && c.paras.length) return Promise.resolve(c);
  if (!window.TSArticle) return Promise.resolve(null);
  var link = it.link.replace(/^http:/, 'https:');
  return new Promise(function (done) {
    var left = RELAYS.length, won = false, ctls = [];
    var finish = function (x) { if (won) return; if (x) { won = true; ctls.forEach(function (c2) { try { c2.abort(); } catch (e) {} }); done(x); } else if (--left === 0) done(null); };
    RELAYS.forEach(function (rl) {
      var ctl = window.AbortController ? new AbortController() : null; if (ctl) ctls.push(ctl);
      var tm = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(rl[1](link), ctl ? { signal: ctl.signal } : {}).then(function (r) { if (!r.ok) throw 0; return rl[0] === 'm' ? r.text() : r.arrayBuffer(); })
        .then(function (b) { clearTimeout(tm); var x = rl[0] === 'm' ? fromMarkdown(b, it) : TSArticle.extract(TSArticle.decode(b), link); if (!x.paras.length || x.paras.join('').length < 60) throw 0; finish(x); })
        .catch(function () { clearTimeout(tm); finish(null); });
    });
  }).then(function (x) {
    if (!x) return null;
    var idx = LS.get('fa.idx', []).filter(function (y) { return y !== it.id; }); idx.push(it.id);
    while (idx.length > 30) { var o = idx.shift(); LS.del('fa.' + o); LS.del('trf.' + o); }
    LS.set('fa.idx', idx); LS.set(k, x); return x;
  });
}
function translateSmart(lines, onPart) { // AI (Groq key of this device) when available, else Google/MyMemory; chunked, reports progress
  var out = lines.map(function () { return ''; }), useAI = !!groqKey(), size = useAI ? 12 : 8, chunks = [];
  for (var i = 0; i < lines.length; i += size) chunks.push(i);
  var viaAI = function (part) {
    return groqJSON([{ role: 'system', content: 'Bạn là biên dịch viên Trung–Việt chuyên nghiệp. Dịch từng câu tin tức tiếng Trung sang tiếng Việt chuẩn, tự nhiên, sát nghĩa, không thêm bớt ý, không bình luận. Tên người/địa danh Trung Quốc viết theo âm Hán Việt quen dùng (北京 → Bắc Kinh, 习近平 → Tập Cận Bình); tên nước ngoài viết theo cách báo Việt Nam thường dùng. Số liệu, ngày tháng giữ chính xác. Trả về JSON {"vi":[...]} với đúng số phần tử như đầu vào, theo đúng thứ tự.' },
      { role: 'user', content: JSON.stringify({ zh: part }) }]).then(function (j) { if (!j || !Array.isArray(j.vi) || j.vi.length !== part.length) throw 0; return j.vi.map(function (x) { return String(x || '').trim(); }); });
  };
  var seq = Promise.resolve();
  chunks.forEach(function (st) {
    seq = seq.then(function () {
      var part = lines.slice(st, st + size);
      return (useAI ? viaAI(part).catch(function () { useAI = false; return translateLines(part); }) : translateLines(part))
        .then(function (v) { v.forEach(function (x, j) { out[st + j] = x || ''; }); if (onPart) onPart(out, st, part.length); });
    });
  });
  return seq.then(function () { return out; });
}
function readBodyHTML(art) {
  var h = '', imgs = art.imgs || [], pos = art.pos || [], used = {};
  var pic = function (u) { return '<figure class="hero-img inl"><img src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"><figcaption>Ảnh: ' + esc(art.s || '') + '</figcaption></figure>'; };
  art.paras.forEach(function (ids, pi) {
    imgs.forEach(function (u, k) { if (!used[k] && pos[k] <= pi) { used[k] = 1; h += pic(u); } });
    h += '<div class="para">' + ids.map(function (i) { return '<div class="sent" data-i="' + i + '"><button class="say" data-sent="' + i + '">🔊</button><div class="zline">' + wordsHTML(art.sents[i]) + '</div><div class="vi">' + (art.vis && art.vis[i] ? esc(art.vis[i]) : '<span class="muted">…</span>') + '</div></div>'; }).join('') + '</div>';
  });
  imgs.forEach(function (u, k) { if (!used[k]) h += pic(u); });
  return h;
}
routes.read = async function (id) {
  APP.innerHTML = top('', '#/news') + '<div class="empty">Đang mở bài… ⏳</div>';
  var easy = window.EASY.find(function (e) { return e.id === id; }) || (window.STORY || []).find(function (e) { return e.id === id; });
  var art; var rt = RT;
  await loadVocab(); if (rt !== RT) return;
  var it = null;
  if (easy) art = { id: id, t: easy.t, sents: easy.s.map(function (x) { return x[0]; }), vis: easy.s.map(function (x) { return x[1]; }), tv: easy.tv, lv: easy.lv, easy: true, g: easy.g, m: easy.m };
  else {
    var j = await loadNews(); it = j && j.items.find(function (x) { return x.id === id; });
    if (!it) { APP.innerHTML = top('Không tìm thấy', '#/news') + '<div class="card">Bài này đã cũ và không còn trong danh sách. <a href="#/news">Quay lại</a></div>'; return; }
    art = { id: id, t: it.t, sents: splitSents(it.b), vis: LS.get('tr.' + id, null), lv: it.lv, ez: it.ez, img: thumbOf(it), link: it.link, s: it.s, d: it.d, c: it.c, full: 0 };
    var fa = LS.get('fa.' + id, null); if (fa && fa.paras && fa.paras.length) useFull(fa);
  }
  if (!art.paras) art.paras = [art.sents.map(function (_, i) { return i; })];
  function useFull(x) { // switch the reader to the whole article
    var ss = [], ps = [];
    x.paras.forEach(function (p) { var ids = []; splitSents(p).forEach(function (t) { ids.push(ss.length); ss.push(t); }); ps.push(ids); });
    var im = [], po = [];
    (x.imgs || []).forEach(function (u, k) { if (art.img && it.img && u.replace(/^http:/, 'https:') === it.img.replace(/^http:/, 'https:')) return; im.push(u); po.push((x.pos || [])[k] || 0); });
    art.sents = ss; art.paras = ps; art.imgs = im; art.pos = po; art.full = 1; art.vis = LS.get('trf.' + id, null);
  }
  var S = LS.get('rd', { py: true, vi: true, zs: 21 });
  if (rt !== RT) return;
  APP.innerHTML = top('<span class="muted" style="font-size:15px">' + (art.g ? '📖 ' + esc(art.g) + ' · HSK ' + art.lv : art.easy ? '⭐ Bài đọc HSK ' + art.lv : catOf(art.c)[1]) + '</span>', '#/news', '<button class="iconbtn" id="rdSet">Aa</button>') +
    '<div class="reader' + (S.py ? '' : ' nopy') + (S.vi ? '' : ' novi') + '" id="reader" style="--zs:' + S.zs + 'px">' +
    (art.img ? '<figure class="hero-img"><img src="' + esc(art.img) + '" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"><figcaption>Ảnh: ' + esc(art.s) + '</figcaption></figure>' : '') +
    '<div class="zline title" style="--zs:' + (S.zs + 4) + 'px">' + wordsHTML(art.t) + '</div>' +
    '<div class="meta">' + (art.easy ? '<span class="badge b' + art.lv + '">HSK ' + art.lv + '</span>' : art.ez ? easeBadge(art.ez) : '') + (art.easy ? '<span>' + esc(art.tv) + '</span>' : '<span>' + esc(art.s) + ' · ' + ago(art.d) + '</span>') + '</div>' +
    '<div class="note" style="margin-top:0">👆 Chạm vào từ bất kỳ để xem nghĩa, Hán Việt, phát âm và lưu vào sổ tay.' + (art.easy ? '' : '<br>🤖 Bản dịch tin tức là <b>dịch máy</b> nên có thể chưa sát, chỉ để tham khảo — nghĩa từng từ khi chạm vào là từ điển chuẩn.') + '</div>' +
    '<div id="fullst"></div><div id="rbody">' + readBodyHTML(art) + '</div>' +
    (art.m ? '<div class="note" style="margin-top:4px">💡 <b>Ý nghĩa:</b> ' + esc(art.m) + '</div>' : '') +
    (art.link ? '<div class="srcbox" id="srcbox"></div>' : '') +
    '<div class="tools"><button class="btn sky" id="rdPlay">▶ Nghe cả bài</button><button class="btn ghost" id="rdDone">✓ Đọc xong</button></div></div>';
  var rd = $('#reader'), trGen = 0;
  var viEl = function (i) { return $('.sent[data-i="' + i + '"] .vi', rd); };
  var doTr = function () {
    if (art.vis) return;
    var gen = ++trGen, full = art.full;
    $$('.vi', rd).forEach(function (x) { x.innerHTML = '<span class="muted">Đang dịch…</span>'; });
    translateSmart(art.sents, function (v, st, n) {
      if (gen !== trGen || rt !== RT) return;
      for (var i = st; i < st + n; i++) { var el = viEl(i); if (el) { if (v[i]) el.textContent = v[i]; else el.innerHTML = '<span class="muted">Chưa dịch được câu này (mạng yếu), chạm từng từ để xem nghĩa nhé.</span>'; } }
    }).then(function (v) {
      if (gen !== trGen || rt !== RT || !v.some(Boolean)) return;
      art.vis = v; LS.set((full ? 'trf.' : 'tr.') + art.id, v);
    });
  };
  var srcNote = function (st) {
    var bx = $('#srcbox'); if (!bx) return;
    var a = '<a href="' + esc(art.link) + '" target="_blank" rel="noopener">Xem bài gốc ↗</a>';
    bx.innerHTML = art.full ? 'Bài đầy đủ được tải thẳng từ ' + esc(art.s) + ' về máy bạn lúc mở. ' + a : 'Đang hiện đoạn đầu (tóm tắt RSS) của ' + esc(art.s) + '. ' + a;
    var fs = $('#fullst');
    fs.innerHTML = st === 'load' ? '<div class="fullst">⏳ Đang tải <b>cả bài</b> từ ' + esc(art.s) + '…</div>'
      : st === 'fail' ? '<div class="fullst bad">😕 Chưa tải được cả bài (mạng yếu hoặc trang gốc đang chặn), đang hiện đoạn đầu. <button class="btn ghost sm" id="faRetry">Thử lại</button></div>' : '';
    var rb = $('#faRetry'); if (rb) rb.onclick = loadFull;
  };
  var loadFull = function () {
    srcNote('load');
    fetchFull(it).then(function (x) {
      if (rt !== RT) return;
      if (!x) { srcNote('fail'); return; }
      if (playing) $('#rdPlay').click();
      useFull(x); $('#rbody').innerHTML = readBodyHTML(art); srcNote('');
      if (S.vi) doTr();
    });
  };
  if (S.vi) doTr();
  if (it) { if (art.full) srcNote(''); else loadFull(); }
  rd.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sent]'); if (b) { var i = +b.dataset.sent; speakLines([{ text: art.sents[i] }]); }
  });
  var playing = false;
  $('#rdPlay').onclick = function () {
    if (playing) { stopSpeak(); playing = false; this.textContent = '▶ Nghe cả bài'; $$('.sent.playing').forEach(function (x) { x.classList.remove('playing'); }); return; }
    playing = true; this.textContent = '■ Dừng'; var btn = this;
    speakLines([{ text: art.t, gap: 700 }].concat(art.sents.map(function (s) { return { text: s }; })), function () { playing = false; btn.textContent = '▶ Nghe cả bài'; $$('.sent.playing').forEach(function (x) { x.classList.remove('playing'); }); }, function (i) {
      $$('.sent.playing').forEach(function (x) { x.classList.remove('playing'); });
      var el = i > 0 && $('.sent[data-i="' + (i - 1) + '"]'); if (el) { el.classList.add('playing'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
  };
  $('#rdDone').onclick = function () { var r = LS.get('read', {}); if (!r[art.id]) { r[art.id] = Date.now(); LS.set('read', r); act('read'); } toast('Giỏi quá! +1 bài đã đọc 🎉'); setTimeout(function () { go(art.g ? '#/news/story' : art.easy ? '#/news/easy' : '#/news'); }, 600); };
  $('#rdSet').onclick = function () {
    openSheet('<h3 style="margin:0 0 12px;font-size:19px;font-weight:900">Tùy chỉnh đọc</h3>' +
      '<div class="seg" id="sPy"><button data-v="1" class="' + (S.py ? 'on' : '') + '">Hiện pinyin</button><button data-v="0" class="' + (S.py ? '' : 'on') + '">Ẩn pinyin</button></div>' +
      '<div class="seg" id="sVi"><button data-v="1" class="' + (S.vi ? 'on' : '') + '">Hiện dịch</button><button data-v="0" class="' + (S.vi ? '' : 'on') + '">Ẩn dịch</button></div>' +
      '<div class="seg" id="sZs">' + [17, 21, 25, 29].map(function (z, i) { return '<button data-v="' + z + '" class="' + (S.zs === z ? 'on' : '') + '">' + ['Nhỏ', 'Vừa', 'Lớn', 'Rất lớn'][i] + '</button>'; }).join('') + '</div>' +
      '<div class="seg" id="sRate">' + [[0.65, '🐢 Chậm'], [0.9, 'Vừa'], [1.1, '🐇 Nhanh']].map(function (r) { return '<button data-v="' + r[0] + '" class="' + (TTS.rate === r[0] ? 'on' : '') + '">' + r[1] + '</button>'; }).join('') + '</div>');
    $('#sheetBody').onclick = function (e) {
      var b = e.target.closest('[data-v]'); if (!b) return; var g = b.parentNode.id; var v = +b.dataset.v;
      $$('button', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); });
      if (g === 'sPy') S.py = !!v; if (g === 'sVi') { S.vi = !!v; if (v) doTr(); } if (g === 'sZs') S.zs = v; if (g === 'sRate') { TTS.rate = v; LS.set('rate', v); }
      LS.set('rd', S); rd.classList.toggle('nopy', !S.py); rd.classList.toggle('novi', !S.vi); rd.style.setProperty('--zs', S.zs + 'px'); $('.title', rd).style.setProperty('--zs', (S.zs + 4) + 'px');
    };
  };
};

/* =============================== EXAMS =============================== */
var PT = { // part type descriptions
  pj: ['判断对错', 'Đúng (✓) hay sai (✗) so với hình'],
  p3: ['选择图片', 'Chọn hình đúng'],
  pm: ['选择对应的图片', 'Chọn hình (A–F) phù hợp'],
  mc: ['选择正确答案', 'Chọn đáp án đúng'],
  tf: ['判断对错', 'Câu ★ đúng hay sai'],
  match: ['选择对应的句子', 'Ghép câu phù hợp (A–F)'],
  fill: ['选词填空', 'Chọn từ điền vào chỗ trống'],
  order: ['排列顺序', 'Sắp xếp 3 câu A, B, C đúng thứ tự'],
  reo: ['完成句子', 'Sắp xếp từ thành câu'],
  chr: ['看拼音写汉字', 'Nhìn pinyin viết chữ Hán'],
  pic: ['看图，用词造句', 'Nhìn hình, đặt câu với từ cho sẵn'],
  essay: ['写短文', 'Viết đoạn văn ngắn'],
  cloze: ['选词填空（短文）', 'Điền vào đoạn văn'],
  err: ['选出有语病的一项', 'Chọn câu có lỗi sai'],
  ins: ['选句填空', 'Chọn câu điền vào đoạn văn (A–E)'],
  sum: ['缩写', 'Đọc 10 phút rồi viết tóm tắt ~400 chữ'],
};
function P(p, t, n, extra) { var o = { p: p, t: t, n: n }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
var LIS = '听力', REA = '阅读', WRI = '书写';
var STRUCT = {
  '2.0': {
    1: { min: 35, pass: 120, plays: 2, py: true, sec: [[LIS, [P('L1', 'pj', 5), P('L2', 'p3', 5), P('L3', 'pm', 5), P('L4', 'mc', 5)]], [REA, [P('R1', 'pj', 5), P('R2', 'pm', 5), P('R3', 'match', 5), P('R4', 'fill', 5)]]] },
    2: { min: 50, pass: 120, plays: 2, py: true, sec: [[LIS, [P('L1', 'pj', 10), P('L2', 'pm', 10), P('L3', 'mc', 10), P('L4', 'mc', 5)]], [REA, [P('R1', 'pm', 5), P('R2', 'fill', 5), P('R3', 'tf', 5), P('R4', 'match', 10)]]] },
    3: { min: 85, pass: 180, plays: 2, sec: [[LIS, [P('L1', 'pm', 10), P('L2', 'tf', 10), P('L3', 'mc', 10), P('L4', 'mc', 10)]], [REA, [P('R1', 'match', 10), P('R2', 'fill', 10), P('R3', 'mc', 10)]], [WRI, [P('W1', 'reo', 5), P('W2', 'chr', 5)]]] },
    4: { min: 100, pass: 180, plays: 1, sec: [[LIS, [P('L1', 'tf', 10), P('L2', 'mc', 15), P('L3', 'mc', 20)]], [REA, [P('R1', 'fill', 10), P('R2', 'order', 10), P('R3', 'mc', 20)]], [WRI, [P('W1', 'reo', 10), P('W2', 'pic', 5, { w8: 2 })]]] },
    5: { min: 120, pass: 180, plays: 1, sec: [[LIS, [P('L1', 'mc', 20), P('L2', 'mc', 25)]], [REA, [P('R1', 'cloze', 15), P('R2', 'mc', 10, { qd: '选出与这段话内容一致的一项。' }), P('R3', 'mc', 20)]], [WRI, [P('W1', 'reo', 8), P('W2', 'essay', 2, { w8: 6 })]]] },
    6: { min: 135, pass: 180, plays: 1, sec: [[LIS, [P('L1', 'mc', 15, { qd: '选出与所听内容一致的一项。' }), P('L2', 'mc', 15), P('L3', 'mc', 20)]], [REA, [P('R1', 'err', 10), P('R2', 'mc', 10, { qd: '选词填空：选出最恰当的一组。' }), P('R3', 'ins', 10), P('R4', 'mc', 20)]], [WRI, [P('W', 'sum', 1, { w8: 1 })]]] },
  },
  '3.0': {
    1: { min: 35, plays: 2, py: true, sec: [[LIS, [P('L1', 'pj', 5), P('L2', 'p3', 5), P('L3', 'pm', 5), P('L4', 'mc', 5)]], [REA, [P('R1', 'pj', 5), P('R2', 'pm', 5), P('R3', 'match', 5), P('R4', 'fill', 5)]]] },
    2: { min: 52, plays: 2, py: true, sec: [[LIS, [P('L1', 'pj', 10), P('L3', 'mc', 10), P('L4', 'mc', 5)]], [REA, [P('R1', 'pm', 5), P('R2', 'fill', 5), P('R3', 'tf', 5), P('R4', 'match', 10)]], [WRI, [P('W1', 'reo', 5), P('W2', 'chr', 5)]]] },
    3: { min: 75, plays: 2, sec: [[LIS, [P('L1', 'pm', 10), P('L3', 'mc', 10), P('L4', 'mc', 10)]], [REA, [P('R1', 'match', 10), P('R2', 'fill', 10), P('R3', 'mc', 10)]], [WRI, [P('W1', 'reo', 5), P('W2', 'chr', 5)]]] },
    4: { min: 77, plays: 1, sec: [[LIS, [P('L1', 'tf', 10), P('L2', 'mc', 10), P('L3', 'mc', 10)]], [REA, [P('R1', 'fill', 10), P('R2', 'order', 5), P('R3', 'mc', 15)]], [WRI, [P('W1', 'reo', 8), P('W2', 'pic', 2, { w8: 2 })]]] },
    5: { min: 102, plays: 1, sec: [[LIS, [P('L1', 'mc', 15), P('L2', 'mc', 15)]], [REA, [P('R1', 'cloze', 8), P('R2', 'mc', 8, { qd: '选出与这段话内容一致的一项。' }), P('R3', 'mc', 16)]], [WRI, [P('W1', 'reo', 8), P('W2', 'essay', 2, { w8: 6 })]]] },
    6: { min: 117, plays: 1, sec: [[LIS, [P('L1', 'mc', 10, { qd: '选出与所听内容一致的一项。' }), P('L2', 'mc', 10), P('L3', 'mc', 15)]], [REA, [P('R1', 'err', 8), P('R2', 'mc', 8, { qd: '选词填空：选出最恰当的一组。' }), P('R3', 'ins', 10), P('R4', 'mc', 20)]], [WRI, [P('W', 'sum', 1, { w8: 1 })]]] },
  },
};
var SECVI = { '听力': 'Nghe', '阅读': 'Đọc', '书写': 'Viết' };
var LVZH = ['', '一级', '二级', '三级', '四级', '五级', '六级'];
function nQ(st) { var n = 0; st.sec.forEach(function (s) { s[1].forEach(function (p) { n += p.n; }); }); return n; }
function maxScore(ver, lv) { return STRUCT[ver][lv].sec.length * 100; }
function passOf(ver, lv) { var st = STRUCT[ver][lv]; return st.pass || Math.round(maxScore(ver, lv) * 0.6); }

routes.exam = function () {
  var ver = LS.get('ever', '2.0');
  var hist = LS.get('hist', []);
  var cur = LS.get('cur', null);
  var best = function (v, l) { var b = null; hist.forEach(function (h) { if (h.ver === v && h.lv === l && !h.part && (b == null || h.score > b.score)) b = h; }); return b; };
  APP.innerHTML = top('📝 <span>Phòng thi HSK</span>') +
    (cur ? '<div class="card row" style="background:var(--sun2)"><span style="font-size:28px">⏸️</span><div class="grow"><b>Bài thi đang làm dở</b><div class="small muted">HSK ' + (cur.ver === '3.0' ? '3.0 · ' : '') + 'cấp ' + cur.lv + (cur.part ? ' · luyện phần' : '') + '</div></div><button class="btn sm" id="resume">Làm tiếp</button></div>' : '') +
    '<div class="seg" id="verseg"><button data-v="2.0" class="' + (ver === '2.0' ? 'on' : '') + '">HSK 2.0 (đề hiện hành)</button><button data-v="3.0" class="' + (ver === '3.0' ? 'on' : '') + '">HSK 3.0 (mới) ✨</button></div>' +
    (ver === '3.0' ? '<div class="note">✨ HSK 3.0 cấp 1–6 thi chính thức từ 13/12/2026. Đề ở đây <b>mô phỏng</b> theo số câu và thời gian CTI đã công bố (cấp 1: 40 câu · 2: 60 · 3: 70 · 4: 70 · 5: 72 · 6: 82); dạng bài chi tiết CTI chưa công bố đầy đủ nên mượn dạng bài HSK 2.0. Điểm đạt chưa công bố → tạm tính 60%. Phần thi nói chưa có.</div>' : '<div class="note">📌 Đề luyện tự soạn, bám sát cấu trúc đề HSK thật (số phần, số câu, thời gian, thang điểm). Phần nghe đọc bằng giọng máy của điện thoại.</div>') +
    '<div class="lvgrid">' + [1, 2, 3, 4, 5, 6].map(function (l) { var st = STRUCT[ver][l]; var b = best(ver, l); return '<button class="lv g' + l + '" data-zh="' + LVZH[l] + '" data-lv="' + l + '"><b>HSK ' + l + '</b><span class="s">' + nQ(st) + ' câu · ' + st.min + ' phút</span><span class="s">Đạt: ' + passOf(ver, l) + '/' + maxScore(ver, l) + (ver === '3.0' ? ' (tạm)' : '') + '</span><span class="best">' + (b ? '🏆 ' + b.score + '/' + b.max : 'Chưa thi') + '</span></button>'; }).join('') + '</div>' +
    (hist.length ? '<div class="sec-t">🕘 Lịch sử thi</div><div class="card">' + hist.slice(0, 8).map(function (h) { return '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="badge b' + h.lv + '">HSK ' + (h.ver === '3.0' ? '3.0·' : '') + h.lv + '</span><div class="grow small" style="font-weight:700">' + (h.part ? 'Luyện ' + h.part : (h.mode === 'real' ? 'Thi thật' : 'Luyện tập')) + ' · ' + new Date(h.at).toLocaleDateString('vi-VN') + '</div><b style="color:' + (h.pass ? 'var(--mint)' : 'var(--pink)') + '">' + h.score + '/' + h.max + '</b></div>'; }).join('') + '</div>' : '');
  $('#verseg').onclick = function (e) { var b = e.target.closest('[data-v]'); if (b) { LS.set('ever', b.dataset.v); routes.exam(); } };
  $$('.lv').forEach(function (b) { b.onclick = function () { go('#/level/' + ver + '/' + b.dataset.lv); }; });
  if ($('#resume')) $('#resume').onclick = function () { EX = cur; go('#/room'); };
};
routes.level = function (ver, lv) {
  lv = +lv; var st = STRUCT[ver][lv];
  var rows = ''; var k = 0;
  st.sec.forEach(function (s) {
    rows += '<tr><th colspan="2" style="padding-top:12px;color:var(--tea);font-size:14px">' + s[0] + ' · ' + SECVI[s[0]] + '</th></tr>';
    s[1].forEach(function (p, i) { k++; rows += '<tr><td><span class="zh">第' + '一二三四五'[i] + '部分 ' + PT[p.t][0] + '</span><br><span class="small muted">' + PT[p.t][1] + '</span></td><td class="n">' + p.n + ' câu</td></tr>'; });
  });
  var partsBtns = '';
  st.sec.forEach(function (s, si) { s[1].forEach(function (p, pi) { partsBtns += '<button class="part-btn" data-si="' + si + '" data-pi="' + pi + '"><span>' + (s[0] === LIS ? '🎧' : s[0] === REA ? '📖' : '✍️') + '</span><span><span class="zh">' + s[0] + ' ' + (pi + 1) + '</span> · ' + PT[p.t][1] + ' <span class="muted small">(' + p.n + ')</span></span><span class="go">›</span></button>'; }); });
  APP.innerHTML = top('<span>HSK ' + (ver === '3.0' ? '3.0 · ' : '') + 'cấp ' + lv + '</span>', '#/exam') +
    '<div class="card"><div class="row" style="margin-bottom:6px"><span class="badge b' + lv + '">' + nQ(st) + ' câu</span><span class="badge">' + st.min + ' phút</span><span class="badge">Đạt ' + passOf(ver, lv) + '/' + maxScore(ver, lv) + '</span></div><table class="struct">' + rows + '</table></div>' +
    '<button class="btn pink block" id="goReal" style="margin-bottom:12px">🏫 Vào phòng thi thật (bấm giờ)</button>' +
    '<button class="btn mint block" id="goPrac">🌱 Luyện tập thoải mái (không giới hạn giờ)</button>' +
    '<div class="small muted" style="margin:10px 4px 0;font-weight:700">• Thi thật: đếm ngược, mỗi bài nghe chỉ được nghe ' + st.plays + ' lần, không xem lời.<br>• Luyện tập: nghe lại thoải mái, bật pinyin, xem lời thoại.</div>' +
    '<div class="sec-t">🎯 Luyện riêng từng phần</div><div class="card">' + partsBtns + '</div>';
  $('#goReal').onclick = function () { startExam(ver, lv, 'real'); };
  $('#goPrac').onclick = function () { startExam(ver, lv, 'prac'); };
  $$('.part-btn').forEach(function (b) { b.onclick = function () { startExam(ver, lv, 'prac', [+b.dataset.si, +b.dataset.pi]); }; });
};

/* ----- build exam ----- */
function normGroups(arr) {
  return (arr || []).map(function (g) {
    if (Array.isArray(g.q)) { var st = {}; for (var k in g) if (k !== 'q') st[k] = g[k]; return { st: st, qs: g.q.map(function (x) { return Object.assign({}, x); }) }; }
    return { st: {}, qs: [Object.assign({}, g)] };
  });
}
function pickPart(lv, p, random) {
  var groups = normGroups(window.HSKB[lv][p.p]);
  var total = groups.reduce(function (a, g) { return a + g.qs.length; }, 0);
  if (random || total > p.n) {
    // keep fixed-letter groups intact in order; shuffle singles/passages
    groups = shuffle(groups);
    // prefer groups whose size fits to reach exactly n
  }
  var out = []; var n = 0;
  for (var i = 0; i < groups.length && n < p.n; i++) {
    var g = groups[i]; var need = p.n - n;
    if (g.qs.length > need) {
      // try to find a later group that fits exactly
      var j = groups.findIndex(function (x, xi) { return xi > i && x.qs.length <= need; });
      if (j > i) { var t = groups[j]; groups[j] = g; g = t; }
      if (g.qs.length > need) g = { st: g.st, qs: g.qs.slice(0, need) };
    }
    out.push(g); n += g.qs.length;
  }
  return out;
}
function startExam(ver, lv, mode, only) {
  var st = STRUCT[ver][lv]; var num = 0; var secs = [];
  st.sec.forEach(function (s, si) {
    if (only && only[0] !== si) return;
    var parts = [];
    s[1].forEach(function (p, pi) {
      if (only && only[1] !== pi) return;
      var groups = pickPart(lv, p, ver === '3.0');
      groups.forEach(function (g) {
        g.qs.forEach(function (q) {
          q.no = ++num;
          if (q.o && (p.t === 'mc' || p.t === 'err')) q.ord = shuffle(q.o.map(function (_, i) { return i; }));
        });
      });
      parts.push({ p: p.p, t: p.t, n: p.n, qd: p.qd, w8: p.w8 || 1, groups: groups, sec: s[0], idx: pi });
    });
    secs.push({ name: s[0], parts: parts });
  });
  EX = { ver: ver, lv: lv, mode: mode, part: only ? (st.sec[only[0]][0] + ' ' + (only[1] + 1)) : '', secs: secs, ans: {}, self: {}, plays: {}, cur: [0, 0], t0: Date.now(), used: 0, limit: only ? 0 : st.min * 60, total: num, done: false };
  saveEx(); go('#/room');
}
var EX = null, exTimer = null;
function saveEx() { if (EX && !EX.done) LS.set('cur', EX); }
function exPart() { return EX.secs[EX.cur[0]].parts[EX.cur[1]]; }
function allQs() { var a = []; EX.secs.forEach(function (s, si) { s.parts.forEach(function (p, pi) { p.groups.forEach(function (g) { g.qs.forEach(function (q) { a.push({ q: q, p: p, g: g, si: si, pi: pi }); }); }); }); }); return a; }
function answered(q) { var a = EX.ans[q.no]; return a != null && a !== ''; }

/* ----- room ----- */
routes.room = function () {
  if (!EX) EX = LS.get('cur', null);
  if (!EX) { go('#/exam'); return; }
  if (EX.done) { go('#/result'); return; }
  drawRoom();
  clearInterval(exTimer);
  EX.tick = Date.now();
  exTimer = setInterval(function () {
    if (!EX || EX.done || location.hash !== '#/room') { clearInterval(exTimer); return; }
    var now = Date.now(); EX.used += (now - EX.tick) / 1000; EX.tick = now;
    var t = $('#timer'); if (!t) return;
    if (EX.limit) {
      var left = EX.limit - EX.used; t.textContent = '⏱ ' + fmtTime(left); t.classList.toggle('low', left < 300);
      if (left <= 0) { clearInterval(exTimer); toast('Hết giờ! Bài đã được nộp ⏰'); finishExam(); }
    } else t.textContent = '⏱ ' + fmtTime(EX.used);
    if (Math.round(EX.used) % 5 === 0) saveEx();
  }, 1000);
};
function drawRoom(scrollToNo) {
  stopSpeak();
  var sec = EX.secs[EX.cur[0]]; var part = exPart();
  var st = STRUCT[EX.ver][EX.lv]; var showPy = st.py || (EX.mode === 'prac' && LS.get('expy', false));
  var nDone = allQs().filter(function (x) { return answered(x.q); }).length;
  var html = '<div class="ehead"><div class="r1"><button class="iconbtn" id="exQuit" style="width:38px;height:38px">✕</button><div class="lvl">HSK ' + (EX.ver === '3.0' ? '3.0·' : '') + EX.lv + ' · ' + (EX.mode === 'real' ? 'Thi thật' : 'Luyện tập') + '</div>' +
    (EX.mode === 'prac' && !st.py ? '<button class="iconbtn" id="pyT" style="width:38px;height:38px;font-size:13px;font-weight:900">' + (showPy ? 'pīn' : 'pin') + '</button>' : '') +
    '<span class="timer" id="timer">⏱ --:--</span></div>' +
    '<div class="stabs">' + EX.secs.map(function (s, i) { var c = 0, t = 0; s.parts.forEach(function (p) { p.groups.forEach(function (g) { g.qs.forEach(function (q) { t++; if (answered(q)) c++; }); }); }); return '<button data-sec="' + i + '" class="' + (i === EX.cur[0] ? 'on' : '') + '">' + s.name + ' · ' + SECVI[s.name] + '<small>' + c + '/' + t + '</small></button>'; }).join('') + '</div>' +
    '<div class="pbar"><i style="width:' + Math.round(nDone * 100 / EX.total) + '%"></i></div></div>';
  html += '<div class="ins"><div class="t1">' + sec.name + ' · 第' + '一二三四五'[part.idx] + '部分 · ' + PT[part.t][0] + '</div><div class="t2">' + PT[part.t][1] + (sec.name === LIS ? (EX.mode === 'real' ? ' · mỗi bài nghe được phát tối đa ' + st.plays + ' lần' : ' · bấm ▶ để nghe') : '') + '</div></div>';
  html += part.groups.map(function (g, gi) { return groupHTML(part, g, gi, showPy, false); }).join('');
  APP.innerHTML = html;
  // nav
  var nav = $('#enav'); if (!nav) { nav = document.createElement('div'); nav.className = 'enav'; nav.id = 'enav'; document.body.appendChild(nav); }
  var first = EX.cur[0] === 0 && EX.cur[1] === 0; var flat = []; EX.secs.forEach(function (s, si) { s.parts.forEach(function (p, pi) { flat.push([si, pi]); }); });
  var idx = flat.findIndex(function (x) { return x[0] === EX.cur[0] && x[1] === EX.cur[1]; }); var last = idx === flat.length - 1;
  nav.innerHTML = '<div class="in"><button class="btn ghost" id="exPrev"' + (first ? ' disabled' : '') + '>‹ Trước</button><button class="btn ghost" id="exSheet">📋 ' + nDone + '/' + EX.total + '</button>' + (last ? '<button class="btn pink" id="exSubmit">Nộp bài ✓</button>' : '<button class="btn" id="exNext">Tiếp ›</button>') + '</div>';
  nav.classList.remove('hide');
  $('#exPrev').onclick = function () { if (idx > 0) { EX.cur = flat[idx - 1]; saveEx(); drawRoom(); window.scrollTo(0, 0); } };
  if ($('#exNext')) $('#exNext').onclick = function () { EX.cur = flat[idx + 1]; saveEx(); drawRoom(); window.scrollTo(0, 0); };
  if ($('#exSubmit')) $('#exSubmit').onclick = confirmSubmit;
  $('#exSheet').onclick = answerSheet;
  $('#exQuit').onclick = function () { ask('Tạm dừng bài thi?', 'Bài làm được lưu lại, bạn có thể “Làm tiếp” sau ở trang Phòng thi.', 'Thoát', 'Ở lại', function () { saveEx(); EX = null; go('#/exam'); }); };
  if ($('#pyT')) $('#pyT').onclick = function () { LS.set('expy', !LS.get('expy', false)); drawRoom(); };
  $$('.stabs button').forEach(function (b) { b.onclick = function () { EX.cur = [+b.dataset.sec, 0]; saveEx(); drawRoom(); window.scrollTo(0, 0); }; });
  bindQs(APP);
  var t = $('#timer'); if (t) t.textContent = '⏱ ' + fmtTime(EX.limit ? EX.limit - EX.used : EX.used);
  if (scrollToNo) { var el = $('#q' + scrollToNo); if (el) setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 30); }
}
window.addEventListener('hashchange', function () { if (location.hash !== '#/room') { var n = $('#enav'); if (n) n.classList.add('hide'); } });

function playBtn(key, script) {
  var st = STRUCT[EX.ver][EX.lv]; var used = EX.plays[key] || 0;
  var left = EX.mode === 'real' && !EX.done ? st.plays - used : 99;
  return '<button class="play" data-play="' + key + '" data-script="' + esc(script) + '"' + (left <= 0 ? ' disabled' : '') + '>' + (left <= 0 ? '🔇 Đã hết lượt nghe' : '▶ Nghe' + (left < 99 ? ' (còn ' + left + ' lần)' : '')) + '</button>';
}
function letterBtns(no, n, sel, review, key) {
  var h = '<div class="letters">';
  for (var i = 0; i < n; i++) { var cls = sel === i ? 'on' : ''; if (review) { cls = i === key ? 'ok' : (sel === i ? 'bad' : ''); } h += '<button data-ans="' + no + '" data-v="' + i + '" class="' + cls + '">' + LETTERS[i] + '</button>'; }
  return h + '</div>';
}
function verdict(q, part) {
  var r = grade(q, part);
  if (r == null) return '';
  return '<div class="verdict ' + (r >= 1 ? 'ok' : 'bad') + '">' + (r >= 1 ? '✅ Đúng' : '❌ Sai') + '</div>';
}
function groupHTML(part, g, gi, showPy, review) {
  var t = part.t; var st = g.st; var h = '';
  var isL = part.sec === LIS; var A = EX.ans;
  var gkey = part.p + '-' + gi;
  var listenScript = function (s) { return review || (EX.mode === 'prac' && EX.showScript && EX.showScript[s]) ? '<div class="script">' + wordsInline(s) + '</div>' : ''; };
  // group stimulus
  if (t === 'pm') h += '<div class="picbank">' + st.pics.map(function (e, i) { return '<div>' + e + '<b>' + LETTERS[i] + '</b></div>'; }).join('') + '</div>';
  if (t === 'match' || t === 'fill') h += '<div class="optbank' + (t === 'fill' ? ' words' : '') + '">' + st.opts.map(function (o, i) { return '<div><b>' + LETTERS[i] + '</b><span>' + zhHTML(o, showPy) + '</span></div>'; }).join('') + '</div>';
  if (t === 'cloze' || t === 'ins') {
    var nos = g.qs.map(function (q) { return q.no; });
    var txt = esc(st.s).replace(/\((\d)\)/g, function (m, d) { var no = nos[+d - 1]; return no ? '<b style="color:var(--pink)">（' + no + '）</b>' : '____'; });
    h += '<div class="q"><div class="zt passage">' + txt + '</div></div>';
    if (t === 'ins') h += '<div class="optbank">' + st.opts.map(function (o, i) { return '<div><b>' + LETTERS[i] + '</b><span>' + zhHTML(o, showPy) + '</span></div>'; }).join('') + '</div>';
  }
  if (t === 'mc' && g.qs.length > 1 && (st.a || st.s)) {
    if (st.a) { var sc = st.a + '\n' + g.qs.map(function (q) { return '问：' + q.q; }).join('\n'); h += '<div class="q"><div class="qh"><span class="qn" style="width:auto">' + g.qs[0].no + '–' + g.qs[g.qs.length - 1].no + '</span>' + playBtn(gkey, sc) + (EX.mode === 'prac' && !review ? '<button class="btn sm ghost" data-script-show="' + esc(st.a) + '">📄 Xem lời</button>' : '') + '</div>' + listenScript(st.a) + '</div>'; }
    else h += '<div class="q"><div class="qh"><span class="qn" style="width:auto">' + g.qs[0].no + '–' + g.qs[g.qs.length - 1].no + '</span><span class="muted small" style="font-weight:800">Đọc đoạn văn, trả lời các câu hỏi</span></div><div class="zt passage">' + zhHTML(st.s, showPy) + '</div></div>';
  }
  g.qs.forEach(function (q, qi) {
    var no = q.no; var a = A[no]; var key = part.p + '-' + gi + '-' + qi;
    var body = '';
    var head = '<div class="qh"><span class="qn">' + no + '</span>';
    if (isL && q.a) { head += playBtn(key, q.a) + (EX.mode === 'prac' && !review ? '<button class="btn sm ghost" data-script-show="' + esc(q.a) + '">📄 Xem lời</button>' : ''); }
    head += '</div>';
    if (isL && q.a) body += listenScript(q.a);
    if (t === 'pj') {
      if (!isL) body += '<div class="zt" style="text-align:center;font-size:24px">' + zhHTML(q.w, true) + '</div>';
      body += '<div class="bigpic">' + q.e + '</div>' + tfBtns(no, a, review, q.k);
    } else if (t === 'p3') {
      body += '<div class="picrow">' + q.o.map(function (e, i) { var c = a === i ? 'on' : ''; if (review) c = i === q.k ? 'ok' : (a === i ? 'bad' : ''); return '<button class="pic ' + c + '" data-ans="' + no + '" data-v="' + i + '">' + e + '<span class="L">' + LETTERS[i] + '</span></button>'; }).join('') + '</div>';
    } else if (t === 'pm' || t === 'match' || t === 'fill') {
      if (!isL) body += '<div class="zt" style="margin-bottom:10px">' + zhHTML(q.s, showPy) + '</div>';
      body += letterBtns(no, (st.pics || st.opts).length, a, review, q.k);
    } else if (t === 'tf') {
      if (!isL) body += '<div class="zt" style="margin-bottom:10px">' + zhHTML(q.s, showPy) + '</div>';
      body += '<div class="star">★ ' + zhHTML(q.st, showPy) + '</div>' + tfBtns(no, a, review, q.k);
    } else if (t === 'mc' || t === 'err') {
      if (!isL && q.s) body += '<div class="zt passage">' + zhHTML(q.s, showPy) + '</div>';
      var qtext = q.q || (q.a ? '' : part.qd || (t === 'err' ? PT.err[0] + '：' : ''));
      if (t === 'err') qtext = '请选出有语病的一项：';
      if (qtext && (!isL || g.qs.length > 1 && (EX.mode === 'prac' || review))) body += '<div class="zt" style="font-weight:700;margin-bottom:8px">' + zhHTML(qtext, showPy) + '</div>';
      if (isL && !q.q && part.qd) body += '<div class="small muted" style="font-weight:800;margin-bottom:6px">' + esc(part.qd) + '</div>';
      var ord = q.ord || q.o.map(function (_, i) { return i; });
      body += '<div class="opts">' + ord.map(function (oi, pos) { var c = a === oi ? 'on' : ''; if (review) c = oi === q.k ? 'ok' : (a === oi ? 'bad' : ''); return '<button class="opt ' + c + '" data-ans="' + no + '" data-v="' + oi + '"><span class="L">' + LETTERS[pos] + '</span><span>' + zhHTML(q.o[oi], showPy) + '</span></button>'; }).join('') + '</div>';
    } else if (t === 'cloze') {
      body += '<div class="opts">' + q.o.map(function (o, i) { var c = a === i ? 'on' : ''; if (review) c = i === q.k ? 'ok' : (a === i ? 'bad' : ''); return '<button class="opt ' + c + '" data-ans="' + no + '" data-v="' + i + '"><span class="L">' + LETTERS[i] + '</span><span>' + zhHTML(o, showPy) + '</span></button>'; }).join('') + '</div>';
    } else if (t === 'ins') {
      body += '<div class="small muted" style="font-weight:800;margin-bottom:6px">Chỗ trống (' + no + ') điền câu:</div>' + letterBtns(no, st.opts.length, a, review, q.k);
    } else if (t === 'order') {
      body += '<div class="optbank" style="box-shadow:none;background:var(--bg)">' + q.o.map(function (o, i) { return '<div><b>' + LETTERS[i] + '</b><span>' + zhHTML(o, showPy) + '</span></div>'; }).join('') + '</div>';
      var cur = a || '';
      body += '<div class="reo-ans" data-ord="' + no + '">' + (cur ? Array.from(cur).map(function (L) { return '<span class="wchip" style="font-family:var(--ui);font-weight:900">' + L + '</span>'; }).join('') : '<span class="muted small" style="font-weight:700">Chạm A, B, C theo thứ tự đúng</span>') + '</div>';
      if (!review) body += '<div class="row"><div class="letters">' + 'ABC'.split('').map(function (L) { return '<button data-ordadd="' + no + '" data-v="' + L + '" class="' + (cur.indexOf(L) >= 0 ? 'on' : '') + '">' + L + '</button>'; }).join('') + '</div><button class="btn sm ghost" data-ordclr="' + no + '">↺ Xóa</button></div>';
      else body += '<div class="small" style="font-weight:800">Đáp án: ' + q.k + '</div>';
    } else if (t === 'reo') {
      var curA = a ? a.split('|') : [];
      var useCount = {}; curA.forEach(function (i) { useCount[i] = 1; });
      body += '<div class="reo-ans" data-reo="' + no + '">' + (curA.length ? curA.map(function (i) { return '<button class="wchip" data-reorm="' + no + '" data-v="' + i + '">' + esc(q.w[+i]) + '</button>'; }).join('') + '<span class="zh" style="font-size:18px">。</span>' : '<span class="muted small" style="font-weight:700">Chạm các từ bên dưới theo thứ tự</span>') + '</div>';
      if (!review) body += '<div class="reo-pool">' + q.w.map(function (w, i) { return '<button class="wchip' + (useCount[i] ? ' used' : '') + '" data-reoadd="' + no + '" data-v="' + i + '">' + esc(w) + '</button>'; }).join('') + '</div>';
      else body += '<div class="sample">✅ ' + q.k.map(esc).join('<br>✅ ') + '</div>';
    } else if (t === 'chr') {
      body += '<div class="zt" style="margin-bottom:10px">' + esc(q.s).replace(/（([^）]+)）/, '（<b style="color:var(--pink);font-family:var(--py)">$1</b>）') + '</div>';
      body += '<div class="row"><input class="chr" maxlength="2" data-chr="' + no + '" value="' + esc(a || '') + '"' + (review ? ' disabled' : '') + ' autocomplete="off" autocapitalize="off"><span class="small muted" style="font-weight:700">Gõ 1 chữ Hán (bàn phím tiếng Trung, hoặc gõ pinyin rồi chọn chữ)</span></div>';
      if (review) body += '<div class="small" style="font-weight:800;margin-top:6px">Đáp án: <span class="zh" style="font-size:20px">' + esc(q.k) + '</span></div>';
    } else if (t === 'pic' || t === 'essay' || t === 'sum') {
      if (t === 'pic') body += '<div class="bigpic">' + q.e + '</div><div class="zt" style="text-align:center;margin-bottom:8px">Dùng từ：<b>' + esc(q.w) + '</b></div>';
      if (t === 'essay') body += '<div class="zt" style="font-weight:700;margin-bottom:8px">' + esc(q.p) + '</div>' + (q.w ? '<div class="star">' + esc(q.w) + '</div>' : '') + (q.e ? '<div class="bigpic">' + q.e + '</div>' : '');
      if (t === 'sum') {
        var phase = (EX.sumPhase || {})[no] || (review ? 2 : 0);
        if (review || phase < 2) body += '<div class="zt passage" style="font-size:17px">' + zhHTML(q.s, showPy) + '</div>';
        if (!review && phase < 2) body += '<button class="btn grape block" data-sumgo="' + no + '">Tôi đọc xong → bắt đầu viết (bài đọc sẽ ẩn đi)</button><div class="small muted" style="margin-top:6px;font-weight:700">Thi thật: 10 phút đọc, 35 phút viết lại ~400 chữ, tự đặt tiêu đề, không thêm ý kiến cá nhân.</div>';
      }
      var showTA = t !== 'sum' || review || ((EX.sumPhase || {})[no] === 2);
      if (showTA) body += '<textarea class="essay" data-essay="' + no + '" placeholder="Viết câu trả lời bằng chữ Hán…"' + (review ? ' disabled' : '') + '>' + esc(a || '') + '</textarea><div class="cnt" data-cnt="' + no + '">' + countZh(a) + ' chữ' + (q.min ? ' / khoảng ' + (q.min + 10) : t === 'sum' ? ' / khoảng 400' : '') + '</div>';
      if (review) {
        body += '<div class="sample"><b style="font-family:var(--ui)">Bài mẫu tham khảo:</b>\n' + esc(q.sample) + '</div>';
        var sv = EX.self[no];
        body += '<div class="small" style="font-weight:900;margin-top:10px">Tự chấm bài của bạn:</div><div class="selfg">' + [[0, '😵 Chưa đạt'], [0.5, '🙂 Tạm được'], [0.75, '😊 Tốt'], [1, '🤩 Rất tốt']].map(function (x) { return '<button data-self="' + no + '" data-v="' + x[0] + '" class="' + (sv === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
      }
    }
    if (review && part.t !== 'pic' && part.t !== 'essay' && part.t !== 'sum') body += verdict(q, part);
    h += '<div class="q" id="q' + no + '">' + head + body + '</div>';
  });
  return h;
}
function wordsInline(s) { return s.split('\n').map(function (l) { return '<div class="zline" style="--zs:17px;row-gap:2px">' + wordsHTML(l) + '</div>'; }).join(''); }
function countZh(s) { return (String(s || '').match(/[㐀-鿿]/g) || []).length; }
function tfBtns(no, a, review, k) {
  return '<div class="tfbtns">' + [[1, '✓'], [0, '✗']].map(function (x) { var c = a === x[0] ? 'on' : ''; if (review) c = x[0] === k ? 'ok' : (a === x[0] ? 'bad' : ''); return '<button data-ans="' + no + '" data-v="' + x[0] + '" class="' + c + '">' + x[1] + '</button>'; }).join('') + '</div>';
}
function findQ(no) { return allQs().find(function (x) { return x.q.no === +no; }); }
function setAns(no, v, redraw) {
  EX.ans[no] = v; saveEx();
  if (redraw) { var y = window.scrollY; drawRoom(); window.scrollTo(0, y); }
  else updProgress();
}
function updProgress() {
  var nDone = allQs().filter(function (x) { return answered(x.q); }).length;
  var b = $('.pbar i'); if (b) b.style.width = Math.round(nDone * 100 / EX.total) + '%';
  var s = $('#exSheet'); if (s) s.textContent = '📋 ' + nDone + '/' + EX.total;
  $$('.stabs button').forEach(function (bt, i) { var c = 0, t = 0; EX.secs[i].parts.forEach(function (p) { p.groups.forEach(function (g) { g.qs.forEach(function (q) { t++; if (answered(q)) c++; }); }); }); var sm = $('small', bt); if (sm) sm.textContent = c + '/' + t; });
}
function bindQs(root) {
  root.onclick = function (e) {
    if (!EX) return;
    var b = e.target.closest('[data-play]');
    if (b) {
      if (b.classList.contains('on')) { stopSpeak(); return; }
      var key = b.dataset.play; var st = STRUCT[EX.ver][EX.lv];
      if (EX.mode === 'real' && !EX.done) { EX.plays[key] = (EX.plays[key] || 0) + 1; saveEx(); }
      var left = EX.mode === 'real' && !EX.done ? st.plays - EX.plays[key] : 99;
      stopSpeak(); b.classList.add('on'); b.textContent = '■ Đang phát…';
      speakLines(scriptLines(b.dataset.script), function () { b.classList.remove('on'); if (left <= 0) { b.disabled = true; b.textContent = '🔇 Đã hết lượt nghe'; } else b.textContent = '▶ Nghe' + (left < 99 ? ' (còn ' + left + ' lần)' : ' lại'); });
      return;
    }
    if (EX.done) {
      b = e.target.closest('[data-self]');
      if (b) { EX.self[b.dataset.self] = +b.dataset.v; LS.set('last', EX); var hh = LS.get('hist', []); var it = hh.find(function (x) { return x.id === EX.hid; }); var s2 = scoreEx(); var pm = EX.part ? Math.round(s2.max * 0.6) : passOf(EX.ver, EX.lv); if (it) { it.score = s2.total; it.pass = s2.total >= pm; LS.set('hist', hh); } var y = window.scrollY; drawResult(EX.onlyWrong); window.scrollTo(0, y); }
      return;
    }
    b = e.target.closest('[data-script-show]');
    if (b) { var q = b.closest('.q'); var ex = $('.script', q); if (ex) { ex.remove(); return; } var d = document.createElement('div'); d.className = 'script'; d.innerHTML = wordsInline(b.dataset.scriptShow); b.closest('.qh').after(d); return; }
    b = e.target.closest('[data-ans]');
    if (b) {
      var no = +b.dataset.ans; var v = +b.dataset.v;
      $$('[data-ans="' + no + '"]').forEach(function (x) { x.classList.toggle('on', x === b); });
      setAns(no, v); return;
    }
    b = e.target.closest('[data-ordadd]');
    if (b) { var n2 = b.dataset.ordadd; var cur = EX.ans[n2] || ''; if (cur.indexOf(b.dataset.v) < 0 && cur.length < 3) setAns(n2, cur + b.dataset.v, true); return; }
    b = e.target.closest('[data-ordclr]'); if (b) { setAns(b.dataset.ordclr, '', true); return; }
    b = e.target.closest('[data-reoadd]');
    if (b) { var n3 = b.dataset.reoadd; var c3 = EX.ans[n3] ? EX.ans[n3].split('|') : []; c3.push(b.dataset.v); setAns(n3, c3.join('|'), true); return; }
    b = e.target.closest('[data-reorm]');
    if (b) { var n4 = b.dataset.reorm; var c4 = EX.ans[n4].split('|'); c4.splice(c4.indexOf(b.dataset.v), 1); setAns(n4, c4.join('|'), true); return; }
    b = e.target.closest('[data-sumgo]');
    if (b) { EX.sumPhase = EX.sumPhase || {}; EX.sumPhase[b.dataset.sumgo] = 2; saveEx(); drawRoom(b.dataset.sumgo); return; }
  };
  root.oninput = function (e) {
    if (!EX || EX.done) return;
    var t = e.target;
    if (t.dataset.chr) { EX.ans[t.dataset.chr] = t.value.trim(); saveEx(); updProgress(); }
    if (t.dataset.essay) { EX.ans[t.dataset.essay] = t.value; var c = $('[data-cnt="' + t.dataset.essay + '"]'); if (c) c.textContent = countZh(t.value) + ' chữ'; saveEx(); updProgress(); }
  };
}
function answerSheet() {
  var html = '<h3 style="margin:0 0 4px;font-size:19px;font-weight:900">📋 Phiếu trả lời</h3><div class="small muted" style="font-weight:700;margin-bottom:10px">Chạm số câu để nhảy tới. Ô nâu = đã làm.</div>';
  EX.secs.forEach(function (s, si) {
    html += '<div style="font-weight:900;margin:8px 0 6px">' + s.name + ' · ' + SECVI[s.name] + '</div><div class="sheetgrid">';
    s.parts.forEach(function (p, pi) { p.groups.forEach(function (g) { g.qs.forEach(function (q) { html += '<button data-jump="' + q.no + '" data-si="' + si + '" data-pi="' + pi + '" class="' + (answered(q) ? 'done' : '') + '">' + q.no + '</button>'; }); }); });
    html += '</div>';
  });
  html += '<button class="btn pink block" id="shSubmit">Nộp bài ✓</button>';
  openSheet(html);
  $('#sheetBody').onclick = function (e) {
    var b = e.target.closest('[data-jump]'); if (b) { closeSheet(); EX.cur = [+b.dataset.si, +b.dataset.pi]; saveEx(); drawRoom(+b.dataset.jump); return; }
    if (e.target.id === 'shSubmit') { closeSheet(); setTimeout(confirmSubmit, 250); }
  };
}
function confirmSubmit() {
  var left = EX.total - allQs().filter(function (x) { return answered(x.q); }).length;
  ask('Nộp bài nhé?', left ? 'Bạn còn <b>' + left + '</b> câu chưa làm. Nộp luôn hay quay lại làm tiếp?' : 'Bạn đã làm hết ' + EX.total + ' câu. Nộp để xem điểm nhé!', 'Nộp bài', 'Làm tiếp', finishExam, 'pink');
}
function normS(s) { return String(s || '').replace(/[\s，。！？、,.!?]/g, ''); }
function grade(q, part) { // 1 / 0 for auto, null for self-graded
  var a = EX.ans[q.no]; var t = part.t;
  if (t === 'pic' || t === 'essay' || t === 'sum') return EX.self[q.no] == null ? null : EX.self[q.no];
  if (a == null || a === '') return 0;
  if (t === 'reo') { var s = a.split('|').map(function (i) { return q.w[+i]; }).join(''); return q.k.some(function (k) { return normS(k) === normS(s); }) ? 1 : 0; }
  if (t === 'chr') return normS(a) === q.k ? 1 : 0;
  return a === q.k ? 1 : 0;
}
function scoreEx() {
  var res = EX.secs.map(function (s) {
    var got = 0, max = 0, pending = 0;
    s.parts.forEach(function (p) { p.groups.forEach(function (g) { g.qs.forEach(function (q) { var w = p.w8 || 1; max += w; var r = grade(q, p); if (r == null) pending++; else got += r * w; }); }); });
    return { name: s.name, score: max ? Math.round(got * 100 / max) : 0, pending: pending };
  });
  var total = res.reduce(function (a, r) { return a + r.score; }, 0);
  return { secs: res, total: total, max: res.length * 100 };
}
function finishExam() {
  clearInterval(exTimer); stopSpeak();
  EX.done = true; EX.finishedAt = Date.now(); LS.del('cur');
  var sc = scoreEx(); var partMode = !!EX.part;
  var max = sc.max; var pass = partMode ? sc.total >= max * 0.6 : sc.total >= passOf(EX.ver, EX.lv) * (max / maxScore(EX.ver, EX.lv));
  var h = LS.get('hist', []); EX.hid = Date.now();
  h.unshift({ id: EX.hid, ver: EX.ver, lv: EX.lv, mode: EX.mode, part: EX.part, score: sc.total, max: max, pass: pass, at: Date.now() }); LS.set('hist', h.slice(0, 50));
  LS.set('last', EX); act('exam');
  var n = $('#enav'); if (n) n.classList.add('hide');
  go('#/result');
}
routes.result = function () {
  if (!EX || !EX.done) EX = LS.get('last', null);
  if (!EX) { go('#/exam'); return; }
  drawResult();
};
function drawResult(onlyWrong) {
  EX.onlyWrong = onlyWrong;
  var sc = scoreEx(); var partMode = !!EX.part; var max = sc.max;
  var passMark = partMode ? Math.round(max * 0.6) : passOf(EX.ver, EX.lv);
  var pass = sc.total >= passMark; var pending = sc.secs.some(function (s) { return s.pending; });
  var showPy = STRUCT[EX.ver][EX.lv].py || LS.get('expy', false);
  var html = top('<span>Kết quả HSK ' + (EX.ver === '3.0' ? '3.0·' : '') + EX.lv + '</span>', '#/exam') +
    '<div class="res-top ' + (pass ? 'pass' : 'fail') + '"><div style="font-weight:900;opacity:.9">' + (EX.part ? 'Luyện ' + EX.part : EX.mode === 'real' ? 'Thi thật · ' + fmtTime(EX.used) : 'Luyện tập') + '</div><div class="sc">' + sc.total + '<small>/' + max + '</small></div><div class="stamp">' + (pass ? '🎉 ĐẠT' : '💪 CHƯA ĐẠT') + '</div><div style="font-weight:800;margin-top:8px;font-size:13.5px">Điểm đạt: ' + passMark + (EX.ver === '3.0' && !partMode ? ' (tạm tính)' : '') + (pending ? ' · còn phần Viết chờ bạn tự chấm ⬇️' : '') + '</div></div>' +
    '<div class="card">' + sc.secs.map(function (s) { return '<div class="sbar"><div class="l"><span>' + s.name + ' · ' + SECVI[s.name] + '</span><span>' + s.score + '/100' + (s.pending ? ' ⏳' : '') + '</span></div><div class="t"><i style="width:' + s.score + '%"></i></div></div>'; }).join('') + '</div>' +
    '<div class="row" style="margin-bottom:10px;gap:8px"><button class="btn sm ' + (onlyWrong ? 'ghost' : '') + '" id="rAll">Xem tất cả</button><button class="btn sm ' + (onlyWrong ? '' : 'ghost') + '" id="rWrong">Chỉ câu sai</button><span class="grow"></span><button class="btn sm grape" id="rAgain">↻ Làm đề mới</button></div>' +
    '<div class="note" style="margin-top:0">👆 Chạm vào chữ trong lời thoại để tra nghĩa. Bấm ▶ để nghe lại.</div>';
  EX.secs.forEach(function (s) {
    var part0 = true;
    s.parts.forEach(function (p) {
      var groupsH = p.groups.map(function (g, gi) {
        if (onlyWrong) {
          var anyWrong = g.qs.some(function (q) { var r = grade(q, p); return r !== null && r < 1; });
          if (!anyWrong) return '';
        }
        return groupHTML(p, g, gi, showPy, true);
      }).join('');
      if (!groupsH) return;
      html += '<div class="sec-t">' + (part0 ? s.name + ' · ' : '') + PT[p.t][1] + '</div>' + groupsH; part0 = false;
    });
  });
  APP.innerHTML = html;
  bindQs(APP);
  $('#rAll').onclick = function () { drawResult(false); };
  $('#rWrong').onclick = function () { drawResult(true); };
  $('#rAgain').onclick = function () { var only = null; if (EX.part) { var st = STRUCT[EX.ver][EX.lv]; st.sec.forEach(function (s, si) { s[1].forEach(function (p, pi) { if (s[0] + ' ' + (pi + 1) === EX.part) only = [si, pi]; }); }); } startExam(EX.ver, EX.lv, EX.mode, only); };
  if (pass && !onlyWrong && !EX.confetti) { EX.confetti = 1; LS.set('last', EX); confetti(); }
}
function confetti() {
  var c = document.createElement('div'); c.className = 'confetti';
  var cols = ['#ff6f9a', '#ffb21e', '#21b892', '#3d9bff', '#8a6cff'];
  for (var i = 0; i < 60; i++) { var x = document.createElement('i'); x.style.left = Math.random() * 100 + '%'; x.style.background = cols[i % 5]; x.style.animationDelay = Math.random() * 0.8 + 's'; x.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; c.appendChild(x); }
  document.body.appendChild(c); setTimeout(function () { c.remove(); }, 3800);
}

/* =============================== VOCAB =============================== */
var SYS = [['3.0', 'HSK 3.0'], ['2025', 'Thi 2025'], ['2.0', 'HSK 2.0']];
var SYSF = { '3.0': 'n', '2025': 't', '2.0': 'o' };
var SYSCNT = {"3.0": {"1": 500, "2": 772, "3": 973, "4": 1000, "5": 1071, "6": 1140, "7": 5636}, "2025": {"1": 300, "2": 204, "3": 507, "4": 1019, "5": 1638, "6": 1815, "7": 5622}, "2.0": {}};
var SYSNOTE = {
  '3.0': '📘 <b>HSK 3.0 – chuẩn 2021</b> (GF0025-2021, Bộ Giáo dục TQ): HSK 1 có 500 từ, HSK 2 có 772, HSK 3 có 973, HSK 4 có 1.000, HSK 5 có 1.071, HSK 6 có 1.140, HSK 7–9 có 5.636 (tổng 11.092). Mỗi cấp là <b>từ mới</b> của cấp đó.',
  '2025': '📗 <b>Đề cương thi HSK mới bản 2025</b> — dùng cho kỳ thi HSK 3.0 từ 13/12/2026. Mỗi cấp là từ mới của cấp đó (cộng dồn ≈ 300 · 500 · 1.000 · 2.000 · 3.600 · 5.400 · 11.000 từ).',
  '2.0': '📙 <b>HSK 2.0</b> (danh sách Hanban 2012, dùng cho kỳ thi HSK 1–6 cũ đến hết 2026): mỗi cấp là từ mới của cấp đó, tổng khoảng 5.000 từ.'
};
function vocabList(sys, lv) {
  if (lv === 'nb') { var nb = saved(); return nb.map(function (w) { return VMAP.get(w) || { w: w, p: pyWord(w), hv: '', m: '', o: 0, t: 0, n: 0 }; }); }
  var f = SYSF[sys] || 'n'; return VOC.filter(function (v) { return hasL(v[f], lv); });
}
function srsInfo(w) { return LS.get('srs', {})[w]; }
routes.vocab = async function (a, b) {
  APP.innerHTML = top('🃏 <span>Từ vựng</span>') + '<div class="empty">Đang tải bộ từ… ⏳</div>';
  var rt = RT; await loadVocab(); if (rt !== RT) return;
  if (!VOC) { APP.innerHTML = top('🃏 <span>Từ vựng</span>') + '<div class="card">Không tải được bộ từ. Kiểm tra mạng rồi thử lại nhé.</div>'; return; }
  var sys = a === 'nb' ? LS.get('vsys', '3.0') : (a || LS.get('vsys', '3.0')); if (!SYSF[sys]) sys = '3.0'; var lv = a === 'nb' ? 'nb' : (b || LS.get('vlv', '1'));
  if (lv !== 'nb' && sys === '2.0' && +lv > 6) lv = '6';
  LS.set('vsys', sys); if (lv !== 'nb') LS.set('vlv', lv);
  var levels = sys === '2.0' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7];
  var list = vocabList(sys, lv);
  var srs = LS.get('srs', {});
  var learned = list.filter(function (v) { return srs[v.w] && srs[v.w].i >= 3; }).length;
  var due = list.filter(function (v) { return srs[v.w] && srs[v.w].d <= Date.now(); }).length;
  var fresh = list.filter(function (v) { return !srs[v.w]; }).length;
  APP.innerHTML = top('🃏 <span>Từ vựng</span>') +
    '<div class="seg" id="sysseg">' + SYS.map(function (s) { return '<button data-s="' + s[0] + '" class="' + (sys === s[0] && lv !== 'nb' ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '<button data-s="nb" class="' + (lv === 'nb' ? 'on' : '') + '">⭐ Sổ tay</button></div>' +
    (lv !== 'nb' ? '<div class="chips">' + levels.map(function (l) { return '<a class="chip' + (String(l) === String(lv) ? ' on' : '') + '" style="text-decoration:none;color:inherit" href="#/vocab/' + sys + '/' + l + '">HSK ' + (l === 7 ? '7–9' : l) + '</a>'; }).join('') + '</div>' : '') +
    (lv !== 'nb' ? '<div class="note" style="margin-top:0">' + SYSNOTE[sys] + '</div>' : '') +
    '<div class="card row" style="gap:6px;justify-content:space-around;text-align:center"><div><b style="font-size:22px">' + (lv !== 'nb' && SYSCNT[sys][lv] ? SYSCNT[sys][lv] : list.length) + '</b><div class="small muted" style="font-weight:800">từ' + (lv !== 'nb' && SYSCNT[sys][lv] > list.length ? '<br><span style="font-weight:700;font-size:10.5px">(' + (SYSCNT[sys][lv] - list.length) + ' từ đa nghĩa tính 2 lần)</span>' : '') + '</div></div><div><b style="font-size:22px;color:var(--mint)">' + learned + '</b><div class="small muted" style="font-weight:800">đã thuộc</div></div><div><b style="font-size:22px;color:var(--pink)">' + due + '</b><div class="small muted" style="font-weight:800">cần ôn</div></div><div><b style="font-size:22px;color:var(--sky)">' + fresh + '</b><div class="small muted" style="font-weight:800">từ mới</div></div></div>' +
    (list.length >= 4 ? '<div class="modes"><button class="mode" style="background:linear-gradient(150deg,#fff,#ffe1ea)" data-m="cards"><span class="em">🃏</span>Học thẻ<small>' + (due ? due + ' ôn + ' : '') + 'từ mới</small></button><button class="mode" style="background:linear-gradient(150deg,#fff,#dcecff)" data-m="quiz"><span class="em">🎯</span>Trắc nghiệm<small>10 câu</small></button><button class="mode" style="background:linear-gradient(150deg,#fff,#d8f6ec)" data-m="listen"><span class="em">🎧</span>Nghe chọn từ<small>10 câu</small></button></div>' : '') +
    '<input class="search" id="vsearch" placeholder="Tìm chữ Hán, pinyin hoặc nghĩa…" autocomplete="off">' +
    '<div class="card" id="vlist" style="padding:6px 12px"></div>';
  var shown = 60; var q = '';
  var draw = function () {
    var f = q ? list.filter(function (v) { var s = q.toLowerCase(); return v.w.indexOf(q) >= 0 || stripTone(v.p).indexOf(stripTone(s).replace(/\s/g, '')) >= 0 || v.m.toLowerCase().indexOf(s) >= 0 || (v.hv || '').toLowerCase().indexOf(s) >= 0; }) : list;
    $('#vlist').innerHTML = f.length ? f.slice(0, shown).map(function (v) { var s = srs[v.w]; var lvc = !s ? '' : s.i >= 3 ? 'l3' : s.i >= 1 ? 'l2' : 'l1'; return '<div class="vrow" data-vw="' + esc(v.w) + '"><span class="h">' + esc(v.w) + '</span><div class="m"><div class="p1">' + esc(v.p) + (v.hv ? ' <span class="muted" style="font-family:var(--ui);font-size:12px;font-weight:800">· ' + esc(v.hv) + '</span>' : '') + '</div><div class="p2">' + esc(v.m) + '</div></div><span class="dot ' + lvc + '"></span></div>'; }).join('') + (f.length > shown ? '<button class="btn ghost block" id="vmore" style="margin:10px 0">Xem thêm (' + (f.length - shown) + ')</button>' : '') : '<div class="empty">' + (lv === 'nb' ? 'Sổ tay trống. Khi đọc báo, chạm vào từ rồi bấm ☆ Lưu nhé!' : 'Không tìm thấy 🙈') + '</div>';
    if ($('#vmore')) $('#vmore').onclick = function () { shown += 120; draw(); };
  };
  draw();
  $('#vsearch').oninput = function () { q = this.value.trim(); shown = 60; draw(); };
  $('#vlist').onclick = function (e) { var r = e.target.closest('[data-vw]'); if (r) showWord(r.dataset.vw); };
  $('#sysseg').onclick = function (e) { var b2 = e.target.closest('[data-s]'); if (!b2) return; go(b2.dataset.s === 'nb' ? '#/vocab/nb' : '#/vocab/' + b2.dataset.s + '/' + (LS.get('vlv', '1'))); };
  $$('.mode').forEach(function (m) { m.onclick = function () { go('#/' + (m.dataset.m === 'cards' ? 'cards' : 'quiz') + '/' + (m.dataset.m === 'listen' ? 'listen' : 'mean') + '/' + sys + '/' + lv); }; });
};
function stripTone(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v').toLowerCase(); }
function srsRate(w, g) { // g: 0 forget, 1 hard, 2 good, 3 easy
  var all = LS.get('srs', {}); var s = all[w] || { i: 0, e: 2.5, d: 0 };
  var day = 864e5;
  if (g === 0) { s.i = 0; s.e = Math.max(1.3, s.e - 0.2); s.d = Date.now() + 60e3; }
  else {
    var iv = s.i === 0 ? (g === 3 ? 4 : 1) : s.i === 1 ? (g === 1 ? 2 : g === 2 ? 3 : 6) : Math.round(s.i * (g === 1 ? 1.2 : g === 2 ? s.e : s.e * 1.3));
    s.e = Math.max(1.3, s.e + (g === 1 ? -0.15 : g === 3 ? 0.15 : 0)); s.i = iv; s.d = Date.now() + iv * day;
  }
  all[w] = s; LS.set('srs', all);
}
routes.cards = async function (kind, sys, lv, topicId) {
  var rt = RT; await loadVocab(); if (rt !== RT) return;
  var deck;
  var back = '#/vocab/' + (lv === 'nb' ? 'nb' : sys + '/' + lv);
  if (kind === 'talk') {
    var tp = window.PHRASES.find(function (x) { return x.id === sys; }); back = '#/topic/' + sys;
    deck = shuffle(tp.p).map(function (p) { return { w: p[0], vi: p[1], phrase: true }; });
  } else {
    var list = vocabList(sys, lv); var srs = LS.get('srs', {});
    var dueL = list.filter(function (v) { return srs[v.w] && srs[v.w].d <= Date.now(); });
    var newL = list.filter(function (v) { return !srs[v.w]; }).slice(0, 10);
    deck = shuffle(dueL).slice(0, 30).concat(newL);
    if (!deck.length) deck = shuffle(list).slice(0, 15);
  }
  var i = 0; var flipped = false; var stats = [0, 0, 0, 0];
  var draw = function () {
    if (i >= deck.length) {
      APP.innerHTML = top('Xong rồi! 🎉', back) + '<div class="card" style="text-align:center">' + mascot('mascot') + '<h2>Bạn vừa ôn ' + deck.length + ' thẻ</h2><p class="muted" style="font-weight:700">😵 Quên ' + stats[0] + ' · 😐 Khó ' + stats[1] + ' · 🙂 Nhớ ' + stats[2] + ' · 😎 Dễ ' + stats[3] + '</p><a class="btn block" href="' + back + '">Quay lại</a></div>';
      $('svg.mascot', APP).style.width = '110px'; return;
    }
    var c = deck[i]; var v = c.phrase ? null : (VMAP.get(c.w) || c);
    var long = Array.from(c.w).length > 4;
    APP.innerHTML = top('<span class="prog">' + (i + 1) + ' / ' + deck.length + '</span>', back, '<button class="iconbtn" id="fcSay">🔊</button>') +
      '<div class="pbar" style="margin-top:0"><i style="width:' + Math.round(i * 100 / deck.length) + '%"></i></div>' +
      '<div class="fc-wrap"><div class="fc" id="fc"><div class="face"><div class="hz' + (long ? ' long' : '') + '">' + esc(c.w) + '</div><div class="hint">Chạm để lật thẻ 👆</div></div>' +
      '<div class="face back"><div class="hz' + (long ? ' long' : '') + '" style="font-size:' + (long ? '28px' : '44px') + '">' + esc(c.w) + '</div><div class="pyb">' + esc(c.phrase ? pyAll(c.w).map(function (x) { return x.pinyin || x.origin; }).join(' ').replace(/ ([，。？！])/g, '$1') : v.p) + '</div>' + (v && v.hv ? '<div class="hv">' + esc(v.hv) + '</div>' : '') + '<div class="mean">' + esc(c.phrase ? c.vi : v.m) + '</div></div></div></div>' +
      '<div class="rate" id="rate" style="visibility:hidden">' + [['😵', 'Quên', '1 phút'], ['😐', 'Khó', ''], ['🙂', 'Nhớ', ''], ['😎', 'Dễ', '']].map(function (r, k) { return '<button data-g="' + k + '"><span>' + r[0] + '</span>' + r[1] + '<small>' + (r[2] || '') + '</small></button>'; }).join('') + '</div>';
    flipped = false;
    $('#fc').onclick = function () { flipped = !flipped; this.classList.toggle('flip', flipped); if (flipped) { $('#rate').style.visibility = 'visible'; say(c.w); } };
    $('#fcSay').onclick = function () { say(c.w); };
    $('#rate').onclick = function (e) { var b = e.target.closest('[data-g]'); if (!b) return; var g = +b.dataset.g; stats[g]++; if (!c.phrase) srsRate(c.w, g); act('card'); if (g === 0 && !c.re) { deck.push(Object.assign({}, c, { re: 1 })); } i++; draw(); };
  };
  draw();
};
routes.quiz = async function (kind, sys, lv) {
  var rt = RT; await loadVocab(); if (rt !== RT) return;
  var list = vocabList(sys, lv); var back = '#/vocab/' + (lv === 'nb' ? 'nb' : sys + '/' + lv);
  var pool = list.length >= 4 ? list : VOC.filter(function (v) { return minL(v.n) === 1 || minL(v.n) === 2; });
  var qs = shuffle(list).slice(0, 10); var i = 0, right = 0;
  var draw = function () {
    if (i >= qs.length) {
      APP.innerHTML = top('Kết quả', back) + '<div class="res-top ' + (right >= 7 ? 'pass' : 'fail') + '"><div class="sc">' + right + '<small>/' + qs.length + '</small></div><div class="stamp">' + (right >= 7 ? '🎉 Giỏi lắm!' : '💪 Cố lên!') + '</div></div><button class="btn block" id="again">↻ Làm lượt mới</button><a class="btn ghost block" style="margin-top:10px" href="' + back + '">Quay lại</a>';
      $('#again').onclick = function () { routes.quiz(kind, sys, lv); }; if (right >= 7) confetti(); return;
    }
    var v = qs[i]; var opts = shuffle([v].concat(shuffle(pool.filter(function (x) { return x.w !== v.w && x.m !== v.m; })).slice(0, 3)));
    var listen = kind === 'listen';
    APP.innerHTML = top('<span class="prog">' + (i + 1) + ' / ' + qs.length + ' · ✅ ' + right + '</span>', back) +
      '<div class="pbar" style="margin-top:0"><i style="width:' + Math.round(i * 100 / qs.length) + '%"></i></div>' +
      (listen ? '<div style="text-align:center;margin:26px 0 6px"><button class="play" id="qzPlay" style="font-size:20px;padding:16px 26px">🔊 Nghe lại</button></div><div class="muted" style="text-align:center;font-weight:800">Nghe và chọn từ đúng</div>'
        : '<div class="qz-q">' + esc(v.w) + '</div><div class="muted" style="text-align:center;font-weight:800">Nghĩa của từ này là gì?</div>') +
      '<div class="qz-o">' + opts.map(function (o) { return '<button data-w="' + esc(o.w) + '" class="' + (listen ? 'zh' : '') + '">' + esc(listen ? o.w : o.m) + '</button>'; }).join('') + '</div>';
    if (listen) { say(v.w); $('#qzPlay').onclick = function () { say(v.w); }; }
    var locked = false;
    $('.qz-o').onclick = function (e) {
      var b = e.target.closest('button'); if (!b || locked) return; locked = true;
      var ok = b.dataset.w === v.w; if (ok) right++;
      $$('.qz-o button').forEach(function (x) { if (x.dataset.w === v.w) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); if (listen) { var o = opts.find(function (y) { return y.w === x.dataset.w; }); x.innerHTML = esc(o.w) + '<div style="font-family:var(--py);font-size:13px;color:var(--tea)">' + esc(o.p) + '</div><div style="font-family:var(--ui);font-size:13px;font-weight:700">' + esc(o.m) + '</div>'; } else if (x.dataset.w === v.w) x.innerHTML = '<span class="zh" style="font-size:18px">' + esc(v.w) + '</span> · <span class="py" style="color:var(--tea)">' + esc(v.p) + '</span><br>' + esc(v.m); });
      if (!listen) say(v.w);
      srsRate(v.w, ok ? 2 : 0); act('quiz');
      setTimeout(function () { if (rt !== RT) return; i++; draw(); }, ok ? 900 : 1900);
    };
  };
  draw();
};
// the word sheet "vocab/nb" route alias
var _vocab = routes.vocab;

/* =============================== TALK =============================== */
routes.talk = function () {
  APP.innerHTML = top('💬 <span>Giao tiếp</span>') +
    '<a class="card row rp-banner" href="#/role"><span style="font-size:38px">🎭</span><div class="grow"><b style="font-size:17px">Đóng vai</b><div class="small muted" style="font-weight:700">Máy hỏi, bạn trả lời bằng giọng nói hoặc gõ — máy chấm và sửa câu cho bạn</div></div><span style="font-size:22px">›</span></a>' +
    '<div class="note">🗣️ Câu nói đời thường theo chủ đề — bấm 🔊 nghe, 🐢 nghe chậm, 🎤 nói thử để kiểm tra phát âm.</div>' +
    '<div class="topics">' + window.PHRASES.map(function (t) { return '<button class="topic" style="background:linear-gradient(150deg,#fff,' + t.c + ')" data-t="' + t.id + '"><span class="em">' + t.e + '</span><b>' + esc(t.vi) + '</b><small>' + esc(t.zh) + ' · ' + t.p.length + ' câu</small></button>'; }).join('') + '</div>';
  $$('.topic').forEach(function (b) { b.onclick = function () { go('#/topic/' + b.dataset.t); }; });
};
var REC = window.SpeechRecognition || window.webkitSpeechRecognition;
routes.topic = function (id) {
  var t = window.PHRASES.find(function (x) { return x.id === id; }); if (!t) { go('#/talk'); return; }
  var showPy = LS.get('tpy', true);
  APP.innerHTML = top(t.e + ' <span>' + esc(t.vi) + '</span>', '#/talk', '<button class="iconbtn" id="tpy" style="font-size:13px;font-weight:900">' + (showPy ? 'pīn' : 'pin') + '</button>') +
    '<div class="row" style="margin-bottom:12px;gap:8px"><a class="btn sm pink" href="#/cards/talk/' + id + '">🃏 Học thẻ</a><button class="btn sm sky" id="playAll">▶ Nghe tất cả</button></div>' +
    '<div id="phs" class="' + (showPy ? '' : 'nopy') + '">' + t.p.map(function (p, i) { return '<div class="ph" data-i="' + i + '"><div class="zl">' + ruby(p[0]) + '</div><div class="v">' + esc(p[1]) + '</div><div class="acts"><button data-say="' + esc(p[0]) + '">🔊 Nghe</button><button data-say="' + esc(p[0]) + '" data-slow="1">🐢 Chậm</button>' + (REC ? '<button data-rec="' + i + '">🎤 Nói thử</button>' : '') + '</div><div class="heard"></div></div>'; }).join('') + '</div>';
  $('#tpy').onclick = function () { LS.set('tpy', !showPy); routes.topic(id); };
  $('#playAll').onclick = function () {
    var btn = this; if (btn.dataset.on) { stopSpeak(); btn.dataset.on = ''; btn.textContent = '▶ Nghe tất cả'; return; }
    btn.dataset.on = '1'; btn.textContent = '■ Dừng';
    speakLines(t.p.map(function (p) { return { text: p[0], gap: 900 }; }), function () { btn.dataset.on = ''; btn.textContent = '▶ Nghe tất cả'; $$('.ph').forEach(function (x) { x.style.boxShadow = ''; }); }, function (i) { $$('.ph').forEach(function (x, k) { x.style.boxShadow = k === i ? '0 0 0 3px var(--sun)' : ''; }); var el = $$('.ph')[i]; if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  };
  $('#phs').onclick = function (e) {
    var b = e.target.closest('[data-rec]'); if (!b) return;
    var i = +b.dataset.rec; var target = t.p[i][0]; var box = $('.heard', b.closest('.ph'));
    stopSpeak();
    try {
      var r = new REC(); r.lang = 'zh-CN'; r.interimResults = false; r.maxAlternatives = 1;
      b.classList.add('on'); b.textContent = '🎙️ Đang nghe…'; box.textContent = '';
      r.onresult = function (ev) {
        var heard = ev.results[0][0].transcript; var a = Array.from(normS(target)); var hset = Array.from(normS(heard));
        var hit = a.filter(function (c) { var k = hset.indexOf(c); if (k >= 0) { hset.splice(k, 1); return true; } return false; }).length;
        var pct = Math.round(hit * 100 / a.length);
        box.innerHTML = (pct >= 85 ? '🎉 ' : pct >= 60 ? '🙂 ' : '💪 ') + 'Khớp ' + pct + '% · máy nghe được: <span class="zh">' + esc(heard) + '</span>';
        box.style.color = pct >= 85 ? 'var(--mint)' : pct >= 60 ? '#c07a00' : 'var(--pink)';
      };
      r.onerror = function (ev) { box.textContent = ev.error === 'not-allowed' ? 'Bạn cần cho phép dùng micro nhé 🎤' : 'Chưa nghe rõ, thử lại nhé!'; };
      r.onend = function () { b.classList.remove('on'); b.textContent = '🎤 Nói thử'; };
      r.start();
    } catch (err) { box.textContent = 'Thiết bị này chưa hỗ trợ nhận giọng nói.'; }
  };
};

/* =============================== ĐÓNG VAI =============================== */
function groqKey() { try { var k = localStorage.getItem('bb.groq') || ''; return k.replace(/^"|"$/g, ''); } catch (e) { return ''; } }
(function () { try { var k = new URLSearchParams(location.search).get('gq'); if (k && k.length > 20) { localStorage.setItem('bb.groq', k); history.replaceState(null, '', location.pathname + location.hash); } } catch (e) {} })();
var GQ_MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
function groqJSON(messages) {
  var key = groqKey(), mi = 0, tries = 0;
  var go1 = function () {
    return fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: GQ_MODELS[mi], messages: messages, temperature: 0.2, max_tokens: 900, response_format: { type: 'json_object' } }) })
      .then(function (r) {
        if (r.status === 429 || r.status >= 500) { tries++; if (tries > 3) throw new Error('AI đang bận, thử lại sau ít phút nhé'); return new Promise(function (ok) { setTimeout(ok, 3000 * tries); }).then(go1); }
        if (r.status === 401) { try { localStorage.removeItem('bb.groq'); } catch (e) {} throw new Error('KEY'); }
        if (r.status === 400 || r.status === 404) { if (mi < GQ_MODELS.length - 1) { mi++; return go1(); } throw new Error('AI báo lỗi ' + r.status); }
        if (!r.ok) throw new Error('AI lỗi ' + r.status);
        return r.json().then(function (j) { var c = j.choices[0].message.content; try { return JSON.parse(c); } catch (e) { var m = c.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('AI trả về sai định dạng'); } });
      });
  };
  return go1();
}
function simil(a, b) { // character overlap ratio (order-insensitive), for offline checking against model answers
  a = Array.from(normS(a)); b = Array.from(normS(b)); if (!a.length || !b.length) return 0;
  var bb = b.slice(); var hit = a.filter(function (c) { var k = bb.indexOf(c); if (k >= 0) { bb.splice(k, 1); return true; } return false; }).length;
  return 2 * hit / (a.length + b.length);
}
routes.role = function () {
  APP.innerHTML = top('🎭 <span>Đóng vai</span>', '#/talk') +
    '<div class="note" style="margin-top:0">Chọn một tình huống. Máy sẽ hỏi (đọc to + chữ), bạn trả lời bằng 🎤 giọng nói hoặc ⌨️ gõ chữ. Có thể bấm câu mẫu để dùng, hoặc tự nói theo ý mình — máy sẽ chấm, sửa và gợi ý cách nói tự nhiên hơn.</div>' +
    '<div class="topics">' + window.ROLEPLAY.map(function (r) { var done = LS.get('rp', {})[r.id]; return '<button class="topic" style="background:linear-gradient(150deg,#fff,' + r.c + ')" data-r="' + r.id + '"><span class="em">' + r.e + '</span><b>' + esc(r.t) + '</b><small>Máy: ' + esc(r.who) + ' · ~HSK ' + r.lv + (done ? ' · ✓' : '') + '</small></button>'; }).join('') + '</div>';
  $$('.topic').forEach(function (b) { b.onclick = function () { go('#/play/' + b.dataset.r); }; });
};
routes.play = function (id, step) {
  var R0 = window.ROLEPLAY.find(function (x) { return x.id === id; }); if (!R0) { go('#/role'); return; }
  var i = Math.min(+step || 0, R0.turns.length); var rt = RT;
  var showPy = LS.get('tpy', true);
  if (i >= R0.turns.length) {
    var d = LS.get('rp', {}); d[id] = Date.now(); LS.set('rp', d); act('read');
    APP.innerHTML = top(R0.e + ' <span>' + esc(R0.t) + '</span>', '#/role') + '<div class="card" style="text-align:center;padding:26px 16px"><div style="font-size:54px">🎉</div><h2 style="margin:6px 0">Xong vai rồi, giỏi quá!</h2><p class="muted" style="font-weight:700">Làm lại để luyện câu tự nhiên hơn, hoặc thử tình huống khác nhé.</p><div class="row" style="justify-content:center;gap:8px;margin-top:10px"><a class="btn sm pink" href="#/play/' + id + '/0">↻ Làm lại</a><a class="btn sm sky" href="#/role">Tình huống khác</a></div></div>';
    return;
  }
  var T = R0.turns[i];
  APP.innerHTML = top(R0.e + ' <span>' + esc(R0.t) + '</span>', '#/role', '<button class="iconbtn" id="tpy" style="font-size:13px;font-weight:900">' + (showPy ? 'pīn' : 'pin') + '</button>') +
    '<div class="rp-prog"><div style="width:' + Math.round(i * 100 / R0.turns.length) + '%"></div></div><div class="small muted" style="font-weight:800;margin:4px 2px 10px">Lượt ' + (i + 1) + '/' + R0.turns.length + ' · Máy: ' + esc(R0.who) + ' · Bạn: ' + esc(R0.me) + '</div>' +
    '<div id="rpw" class="' + (showPy ? '' : 'nopy') + '">' +
    '<div class="bubble bot"><div class="who">🤖 ' + esc(R0.who) + '</div><div class="zl">' + ruby(T.q[0]) + '</div><div class="v">' + esc(T.q[1]) + '</div><div class="acts"><button data-say="' + esc(T.q[0]) + '">🔊 Nghe</button><button data-say="' + esc(T.q[0]) + '" data-slow="1">🐢 Chậm</button></div></div>' +
    '<div class="sec-t" style="margin-top:14px">💡 Câu mẫu <small class="muted">(chạm để dùng)</small></div>' +
    T.a.map(function (a, k) { return '<button class="tpl" data-k="' + k + '"><div class="zl">' + ruby(a[0]) + '</div><div class="v">' + esc(a[1]) + '</div></button>'; }).join('') +
    '<div class="sec-t" style="margin-top:14px">✍️ Câu trả lời của bạn</div>' +
    '<div class="rp-in"><textarea id="rpTxt" rows="2" placeholder="Nói 🎤 hoặc gõ chữ Hán… (tự nói theo ý mình cũng được)"></textarea>' +
    '<div class="row" style="gap:8px;margin-top:8px">' + (REC ? '<button class="btn sm pink" id="rpMic">🎤 Nói</button>' : '') + '<button class="btn sm sky grow" id="rpChk">✓ Kiểm tra</button></div></div>' +
    '<div id="rpFb"></div>' +
    '<div class="row" style="gap:8px;margin:14px 0 6px"><button class="btn ghost sm" id="rpSkip">Bỏ qua ›</button><span class="grow"></span><button class="btn sm" id="rpNext" style="display:none">Câu tiếp ›</button></div></div>';
  setTimeout(function () { if (rt === RT) say(T.q[0]); }, 350);
  $('#tpy').onclick = function () { LS.set('tpy', !showPy); routes.play(id, i); };
  var txt = $('#rpTxt'), fb = $('#rpFb');
  $$('.tpl').forEach(function (b) { b.onclick = function () { txt.value = T.a[+b.dataset.k][0]; $$('.tpl').forEach(function (x) { x.classList.toggle('on', x === b); }); say(txt.value); }; });
  var next = function () { stopSpeak(); go('#/play/' + id + '/' + (i + 1)); };
  $('#rpNext').onclick = next; $('#rpSkip').onclick = next;
  if ($('#rpMic')) $('#rpMic').onclick = function () {
    var b = this; stopSpeak();
    try {
      var r = new REC(); r.lang = 'zh-CN'; r.interimResults = false; r.maxAlternatives = 1;
      b.textContent = '🎙️ Đang nghe…'; b.classList.add('on');
      r.onresult = function (ev) { txt.value = ev.results[0][0].transcript; };
      r.onerror = function (ev) { toast(ev.error === 'not-allowed' ? 'Bạn cần cho phép dùng micro nhé 🎤' : 'Chưa nghe rõ, thử lại nhé!'); };
      r.onend = function () { b.textContent = '🎤 Nói'; b.classList.remove('on'); if (txt.value.trim()) $('#rpChk').click(); };
      r.start();
    } catch (e) { toast('Thiết bị này chưa hỗ trợ nhận giọng nói, bạn gõ chữ nhé.'); }
  };
  var showFb = function (h) { fb.innerHTML = h; $('#rpNext').style.display = ''; fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  var line = function (zh, vi, cls) { return '<div class="fbline ' + (cls || '') + '"><div class="zl">' + ruby(zh) + '</div>' + (vi ? '<div class="v">' + esc(vi) + '</div>' : '') + '<div class="acts"><button data-say="' + esc(zh) + '">🔊 Nghe</button><button data-say="' + esc(zh) + '" data-slow="1">🐢 Chậm</button></div></div>'; };
  $('#rpChk').onclick = function () {
    var ans = txt.value.trim(); if (!ans) { toast('Bạn nói hoặc gõ câu trả lời trước nhé'); return; }
    if (!/[\u4e00-\u9fff]/.test(ans)) { showFb('<div class="fb bad">✋ Bạn trả lời bằng chữ Hán nhé (bấm 🎤 để nói tiếng Trung, hoặc chạm một câu mẫu).</div>'); return; }
    var best = T.a.map(function (a) { return [a, simil(ans, a[0])]; }).sort(function (x, y) { return y[1] - x[1]; })[0];
    if (best[1] >= 0.92) { showFb('<div class="fb good">🎉 <b>Chuẩn rồi!</b> Câu của bạn đúng như câu mẫu.</div>' + line(best[0][0], best[0][1], 'ok')); return; }
    if (!groqKey()) {
      showFb('<div class="fb mid">' + (best[1] >= 0.6 ? '🙂 <b>Gần giống câu mẫu.</b> So sánh với câu mẫu bên dưới nhé.' : '🤔 <b>Câu này khác câu mẫu.</b> Để máy sửa câu tự nói, cần bật “AI sửa câu” (miễn phí) một lần trên máy này.') + '</div>' +
        line(best[0][0], best[0][1], 'ok') +
        '<details class="keybox"><summary>🔑 Bật AI sửa câu tự nói</summary><div class="small" style="margin:8px 0">Dán key Groq (miễn phí) — key chỉ lưu trên máy này, dùng chung với các trang ôn thi khác.</div><input id="rpKey" class="search" placeholder="gsk_…" autocomplete="off"><button class="btn sm" id="rpKeySave" style="margin-top:6px">Lưu key</button></details>');
      $('#rpKeySave').onclick = function () { var k = $('#rpKey').value.trim(); if (k.length < 20) { toast('Key chưa đúng'); return; } try { localStorage.setItem('bb.groq', k); } catch (e) {} toast('Đã lưu key ✓'); $('#rpChk').click(); };
      return;
    }
    fb.innerHTML = '<div class="fb mid">⏳ Máy đang chấm câu của bạn…</div>';
    groqJSON([
      { role: 'system', content: 'Bạn là giáo viên tiếng Trung giỏi, dạy người Việt Nam (trình độ khoảng HSK ' + R0.lv + '–4). Chấm câu trả lời trong bài đóng vai thật chính xác, giải thích ngắn gọn bằng tiếng Việt dễ hiểu. Chỉ dùng chữ Hán giản thể. Không bịa lỗi: nếu câu đã đúng và tự nhiên thì nói là đúng. Luôn trả lời bằng JSON hợp lệ.' },
      { role: 'user', content: 'Tình huống: ' + R0.t + '. Người hỏi (' + R0.who + ') nói: 「' + T.q[0] + '」 (' + T.q[1] + ').\nHọc viên (' + R0.me + ') trả lời: 「' + ans + '」\n(Lưu ý: câu trả lời có thể được nhận dạng từ giọng nói nên có thể sai chữ đồng âm; nếu rõ ràng là lỗi nhận dạng thì sửa lại và nói rõ.)\n\nTrả về JSON: {"verdict":"good|ok|fix" (good = đúng và tự nhiên; ok = hiểu được nhưng nên sửa nhẹ; fix = sai ngữ pháp/từ hoặc không đúng ý câu hỏi), "fixed":"câu của học viên sau khi sửa lỗi, giữ ý của họ (nếu đúng thì chép nguyên)", "fixed_vi":"nghĩa tiếng Việt của câu fixed", "natural":"một cách nói tự nhiên của người bản xứ trong tình huống này (ngắn gọn, đúng trình độ)", "natural_vi":"nghĩa tiếng Việt", "notes":["từng điểm cần sửa hoặc lời khen, tiếng Việt, mỗi ý 1 câu ngắn, tối đa 3 ý"]}' }
    ]).then(function (j) {
      if (rt !== RT) return;
      var v = j.verdict === 'good' ? ['good', '🎉 <b>Chuẩn rồi!</b>'] : j.verdict === 'ok' ? ['mid', '🙂 <b>Được, sửa nhẹ cho tự nhiên hơn:</b>'] : ['bad', '✏️ <b>Cần sửa một chút:</b>'];
      var notes = (j.notes || []).filter(Boolean).slice(0, 3).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
      showFb('<div class="fb ' + v[0] + '">' + v[1] + (notes ? '<ul>' + notes + '</ul>' : '') + '</div>' +
        (j.fixed && normS(j.fixed) !== normS(ans) ? '<div class="sec-t">✅ Câu của bạn sau khi sửa</div>' + line(j.fixed, j.fixed_vi, 'ok') : '') +
        (j.natural && normS(j.natural) !== normS(j.fixed || ans) ? '<div class="sec-t">🌟 Người bản xứ hay nói</div>' + line(j.natural, j.natural_vi, 'nat') : '') +
        '<div class="small muted" style="margin:6px 2px;font-weight:700">🤖 Nhận xét do AI tạo — tham khảo, có thể chưa hoàn hảo.</div>');
    }).catch(function (e) {
      if (rt !== RT) return;
      if (e.message === 'KEY') { showFb('<div class="fb bad">🔑 Key AI không đúng hoặc đã hết hạn. Bấm Kiểm tra lại để nhập key mới.</div>'); return; }
      showFb('<div class="fb mid">😢 ' + esc(e.message || 'Mạng yếu') + '. So với câu mẫu gần nhất nhé:</div>' + line(best[0][0], best[0][1], 'ok'));
    });
  };
};

window.TS_DEBUG = { ex: function () { return EX; }, save: saveEx, draw: function () { drawRoom(); }, news: loadNews, seg: function (t) { return segment(t); }, vm: function () { return VMAP; } };
render();
// warm up vocab in background (news levels, word lookups)
setTimeout(loadVocab, 300);
})();
