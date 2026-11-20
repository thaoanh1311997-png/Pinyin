/* Bánh Mì · Mini game — phần chung: dữ liệu, chọn bộ từ, đọc tiếng Trung, âm thanh, điều hướng */
(function () {
  'use strict';
  var G = window.GAME = { games: {} };
  var $ = G.$ = function (s, r) { return (r || document).querySelector(s); };
  G.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = G.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  G.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  G.pick = function (a, n) { return G.shuffle(a).slice(0, n); };

  /* ---------- lưu trên máy ---------- */
  G.load = function (k, d) { try { var v = localStorage.getItem('bm.game.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  G.save = function (k, v) { try { localStorage.setItem('bm.game.' + k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- thông báo nhỏ ---------- */
  var tT;
  G.toast = function (msg, ms) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(tT); tT = setTimeout(function () { t.classList.remove('on'); }, ms || 2200);
  };

  /* ---------- đọc tiếng Trung ---------- */
  var voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^(zh|cmn)/i.test(v.lang); });
    var pref = function (re) { return vs.filter(function (v) { return re.test(v.lang) || re.test(v.name); })[0]; };
    voice = pref(/zh[-_]CN/i) || pref(/Mandarin|Tingting|Xiaoxiao|Yunxi|Huihui/i) || vs.filter(function (v) { return !/HK|TW|yue|Cantonese/i.test(v.lang + v.name); })[0] || vs[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  var warned = false;
  G.speak = function (text, rate) {
    if (!('speechSynthesis' in window)) { if (!warned) { warned = true; G.toast('Máy này chưa có giọng đọc tiếng Trung 🙈'); } return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text).replace(/……|…/g, '，'));
      u.lang = 'zh-CN'; if (voice) u.voice = voice; u.rate = rate || 0.85;
      speechSynthesis.speak(u);
    } catch (e) {}
  };

  /* ---------- âm thanh vui (tự tạo, không tải file) ---------- */
  var ac = null;
  G.muted = G.load('mute', false);
  G.sfx = function (kind) {
    if (G.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      var seq = { ok: [[660, .07], [880, .09]], match: [[523, .06], [784, .06], [1047, .1]], bad: [[220, .12]], tap: [[520, .04]], win: [[523, .1], [659, .1], [784, .1], [1047, .22]], pop: [[740, .05]] }[kind] || [[600, .05]];
      var t = ac.currentTime;
      seq.forEach(function (n) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = kind === 'bad' ? 'triangle' : 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'bad' ? 0.12 : 0.16, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + n[1] + 0.02); t += n[1] * 0.85;
      });
    } catch (e) {}
  };

  /* ---------- tải dữ liệu khi cần ---------- */
  var loaded = {};
  G.loadScript = function (src) {
    if (loaded[src]) return loaded[src];
    return (loaded[src] = new Promise(function (ok, bad) {
      var s = document.createElement('script'); s.src = src; s.onload = ok;
      s.onerror = function () { loaded[src] = null; bad(new Error(src)); };
      document.body.appendChild(s);
    }));
  };

  /* ---------- bộ từ ---------- */
  var LIFE = window.GAME_LIFE || [], TALK = window.GAME_TALK || [];
  G.CATS = [
    { id: 'hsk', name: 'HSK', emo: '🎯' },
    { id: 'gt', name: 'Giáo trình', emo: '📘' },
    { id: 'life', name: 'Đời sống', emo: '🏠' },
    { id: 'talk', name: 'Giao tiếp', emo: '💬' }
  ];
  var DEF = { t: 'life', life: ['giadinh', 'doan', 'traicay', 'nhacua'], talk: ['chao', 'camon'], hv: '2', hsk: [1], gt: [15, 16, 17] };
  G.cat = Object.assign({}, DEF, G.load('cat', {}));

  G.needData = function (c) {
    c = c || G.cat;
    if (c.t === 'hsk' && !window.GAME_HSK) return G.loadScript('data/hsk.js?v=1');
    if (c.t === 'gt' && !window.VO_LESSONS) return G.loadScript('../vo/data/lessons.js');
    return Promise.resolve();
  };
  function shortVi(v) {
    v = String(v || '').trim();
    if (v.length <= 22) return v;
    var a = v.split(/[;；]/)[0].trim();
    if (a.length <= 22) return a;
    var b = a.split(/[,，]/); var o = b[0];
    for (var i = 1; i < b.length && (o + ',' + b[i]).length <= 22; i++) o += ',' + b[i];
    return o.trim();
  }
  G.shortVi = shortVi;
  G.words = function (c) {
    c = c || G.cat; var out = [], seen = {};
    function add(z, p, v, e, lv) {
      if (!z || seen[z]) return; seen[z] = 1;
      out.push({ z: z, p: p, v: v, s: shortVi(v), e: e || '', lv: lv || '' });
    }
    if (c.t === 'hsk' && window.GAME_HSK) {
      var col = c.hv === '3' ? 4 : 3;
      GAME_HSK.forEach(function (r) { if (c.hsk.indexOf(r[col]) >= 0) add(r[0], r[1], r[2], '', (c.hv === '3' ? 'HSK3.0·' : 'HSK') + (r[col] === 7 ? '7–9' : r[col])); });
    } else if (c.t === 'gt' && window.VO_LESSONS) {
      VO_LESSONS.forEach(function (L) {
        if (c.gt.indexOf(L.n) < 0) return;
        (L.w || []).concat(L.x || []).forEach(function (r) { if (/[一-鿿]/.test(r[0]) && r[2] && r[3]) add(r[0], r[2], r[3], '', 'Bài ' + L.n); });
      });
    } else if (c.t === 'life' || c.t === 'talk') {
      (c.t === 'life' ? LIFE : TALK).forEach(function (th) {
        if (c[c.t].indexOf(th.id) < 0) return;
        th.w.forEach(function (r) { add(r[0], r[1], r[2], r[3], th.name); });
      });
    }
    return out;
  };
  G.catLabel = function (c) {
    c = c || G.cat;
    if (c.t === 'hsk') return (c.hv === '3' ? 'HSK 3.0 · cấp ' : 'HSK · cấp ') + c.hsk.slice().sort(function (a, b) { return a - b; }).map(function (x) { return x === 7 ? '7–9' : x; }).join(', ');
    if (c.t === 'gt') { var a = c.gt.slice().sort(function (x, y) { return x - y; }); return 'Giáo trình · bài ' + (a.length > 3 ? a[0] + '–' + a[a.length - 1] + ' (' + a.length + ' bài)' : a.join(', ')); }
    var list = c.t === 'life' ? LIFE : TALK, ids = c[c.t];
    var names = list.filter(function (t) { return ids.indexOf(t.id) >= 0; }).map(function (t) { return t.name; });
    return (c.t === 'life' ? 'Đời sống · ' : 'Giao tiếp · ') + (names.length > 2 ? names.slice(0, 2).join(', ') + ' +' + (names.length - 2) : names.join(', '));
  };

  /* ---------- bảng chọn bộ từ ---------- */
  G.openPicker = function (onDone) {
    var c = JSON.parse(JSON.stringify(G.cat));
    var sh = $('#sheet');
    function chip(on, val, label, extra) { return '<button type="button" class="pk' + (on ? ' on' : '') + '" data-v="' + esc(val) + '">' + label + (extra ? '<small>' + extra + '</small>' : '') + '</button>'; }
    function body() {
      var h = '';
      if (c.t === 'hsk') {
        h += '<div class="seg2"><button type="button" data-hv="2" class="' + (c.hv !== '3' ? 'on' : '') + '">HSK 2.0 (6 cấp)</button><button type="button" data-hv="3" class="' + (c.hv === '3' ? 'on' : '') + '">HSK 3.0 (9 cấp)</button></div><div class="pks">';
        (c.hv === '3' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6]).forEach(function (n) { h += chip(c.hsk.indexOf(n) >= 0, n, 'Cấp ' + (n === 7 ? '7–9' : n)); });
        h += '</div><p class="pnote">' + (c.hv === '3' ? 'Nghĩa từ HSK 3.0 cấp 1–2 đã soát tay; cấp cao hơn rút gọn từ từ điển.' : 'Cấp 1–3 nghĩa đã soát tay; cấp 4–6 rút gọn từ từ điển.') + '</p>';
      } else if (c.t === 'gt') {
        h += '<p class="pnote">Từ mới giáo trình Hán ngữ (bài 11–14 quyển 2 · bài 15–25 quyển 4)</p><div class="pks">';
        (window.VO_LESSONS || []).forEach(function (L) { h += chip(c.gt.indexOf(L.n) >= 0, L.n, 'Bài ' + L.n, esc(L.t)); });
        if (!window.VO_LESSONS) h += '<p class="pnote">Đang tải danh sách bài…</p>';
        h += '</div><div class="pqa"><button type="button" data-all="11-14">11–14</button><button type="button" data-all="15-19">15–19</button><button type="button" data-all="20-25">20–25</button><button type="button" data-all="11-25">Tất cả</button></div>';
      } else {
        var list = c.t === 'life' ? LIFE : TALK;
        h += '<div class="pks">';
        list.forEach(function (th) { h += chip(c[c.t].indexOf(th.id) >= 0, th.id, th.emo + ' ' + esc(th.name), th.w.length + ' từ'); });
        h += '</div><div class="pqa"><button type="button" data-all="*">Chọn tất cả</button></div>';
      }
      return h;
    }
    function count() {
      return G.needData(c).then(function () { return G.words(c).length; }).catch(function () { return -1; });
    }
    function draw() {
      sh.innerHTML = '<div class="sh-bg" data-x="1"></div><div class="sh-card" role="dialog" aria-label="Chọn bộ từ"><div class="sh-grip"></div>' +
        '<div class="sh-hd"><b>📚 Chọn bộ từ để chơi</b><button type="button" class="sh-x" data-x="1" aria-label="Đóng">✕</button></div>' +
        '<div class="tabs4">' + G.CATS.map(function (k) { return '<button type="button" data-t="' + k.id + '" class="' + (c.t === k.id ? 'on' : '') + '"><i>' + k.emo + '</i>' + k.name + '</button>'; }).join('') + '</div>' +
        '<div class="sh-body">' + body() + '</div>' +
        '<div class="sh-ft"><span id="pkCount">…</span><button type="button" class="btn pri" id="pkOk">Chơi với bộ này ✓</button></div></div>';
      sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('on'); });
      count().then(function (n) { var e = $('#pkCount'); if (e) e.innerHTML = n < 0 ? 'Không tải được, thử lại nhé' : '<b>' + n + '</b> từ'; var b = $('#pkOk'); if (b) b.disabled = n < 4; });
      if (c.t === 'gt' && !window.VO_LESSONS) G.needData(c).then(draw);
    }
    function close() { sh.classList.remove('on'); setTimeout(function () { sh.hidden = true; sh.innerHTML = ''; }, 220); }
    sh.onclick = function (e) {
      var b = e.target.closest('button,[data-x]'); if (!b) return;
      if (b.dataset.x) return close();
      if (b.dataset.t) { c.t = b.dataset.t; G.sfx('tap'); return draw(); }
      if (b.dataset.hv) { c.hv = b.dataset.hv; c.hsk = c.hsk.filter(function (n) { return c.hv === '3' || n < 7; }); if (!c.hsk.length) c.hsk = [1]; return draw(); }
      if (b.dataset.all) {
        if (b.dataset.all === '*') { var list = c.t === 'life' ? LIFE : TALK; c[c.t] = list.map(function (t) { return t.id; }); }
        else { var r = b.dataset.all.split('-').map(Number), a = []; for (var i = r[0]; i <= r[1]; i++) a.push(i); c.gt = a; }
        return draw();
      }
      if (b.classList.contains('pk')) {
        var key = c.t === 'hsk' ? 'hsk' : c.t, v = c.t === 'hsk' || c.t === 'gt' ? Number(b.dataset.v) : b.dataset.v;
        var arr = c[key], i2 = arr.indexOf(v);
        if (i2 >= 0) { if (arr.length > 1) arr.splice(i2, 1); } else arr.push(v);
        G.sfx('tap'); return draw();
      }
      if (b.id === 'pkOk') {
        G.cat = c; G.save('cat', c); close(); G.sfx('ok');
        if (onDone) onDone();
      }
    };
    draw();
  };

  /* ---------- hình vẽ nhỏ cho đồ vật không có emoji ---------- */
  G.ICON = {
    fridge: '<svg viewBox="0 0 64 64"><rect x="14" y="4" width="36" height="56" rx="7" fill="#E9F3FF" stroke="#5C7EA8" stroke-width="3"/><path d="M14 26h36" stroke="#5C7EA8" stroke-width="3"/><rect x="19" y="12" width="3.5" height="9" rx="1.7" fill="#5C7EA8"/><rect x="19" y="32" width="3.5" height="12" rx="1.7" fill="#5C7EA8"/><circle cx="40" cy="15" r="3" fill="#FF8FA3"/></svg>',
    table: '<svg viewBox="0 0 64 64"><rect x="6" y="22" width="52" height="8" rx="3" fill="#D99A5B" stroke="#8A5527" stroke-width="2.5"/><path d="M13 30v24M51 30v24" stroke="#8A5527" stroke-width="5" stroke-linecap="round"/></svg>',
    wardrobe: '<svg viewBox="0 0 64 64"><rect x="10" y="4" width="44" height="54" rx="5" fill="#E7B47E" stroke="#8A5527" stroke-width="3"/><path d="M32 4v54" stroke="#8A5527" stroke-width="3"/><circle cx="28" cy="31" r="2.5" fill="#8A5527"/><circle cx="36" cy="31" r="2.5" fill="#8A5527"/><path d="M14 58v4M50 58v4" stroke="#8A5527" stroke-width="4" stroke-linecap="round"/></svg>',
    washer: '<svg viewBox="0 0 64 64"><rect x="8" y="6" width="48" height="52" rx="7" fill="#F4F7FB" stroke="#6C7D93" stroke-width="3"/><path d="M8 18h48" stroke="#6C7D93" stroke-width="3"/><circle cx="16" cy="12" r="2.3" fill="#6C7D93"/><circle cx="24" cy="12" r="2.3" fill="#FF8FA3"/><circle cx="32" cy="38" r="14" fill="#BFE3FF" stroke="#6C7D93" stroke-width="3"/><path d="M22 40q5-5 10 0t10 0" stroke="#fff" stroke-width="3" fill="none"/></svg>',
    aircon: '<svg viewBox="0 0 64 64"><rect x="4" y="16" width="56" height="22" rx="7" fill="#FFFFFF" stroke="#6C7D93" stroke-width="3"/><path d="M10 31h44" stroke="#6C7D93" stroke-width="2.5"/><circle cx="50" cy="23" r="2" fill="#4CC994"/><path d="M20 44l-3 8M32 44v9M44 44l3 8" stroke="#8CC2FF" stroke-width="3" stroke-linecap="round"/></svg>',
    lamp: '<svg viewBox="0 0 64 64"><path d="M20 26l6-20h12l6 20z" fill="#FFD36B" stroke="#B5862A" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 26v28" stroke="#8A6A3C" stroke-width="3.5"/><ellipse cx="32" cy="56" rx="12" ry="4" fill="#8A6A3C"/></svg>',
    lamppost: '<svg viewBox="0 0 64 64"><path d="M30 60V14q0-6 8-6h6" stroke="#4A5B70" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 8h12l-3 7h-6z" fill="#FFE07A" stroke="#4A5B70" stroke-width="2.5" stroke-linejoin="round"/><rect x="24" y="56" width="12" height="5" rx="2" fill="#4A5B70"/></svg>',
    microwave: '<svg viewBox="0 0 64 64"><rect x="4" y="14" width="56" height="36" rx="6" fill="#F4F7FB" stroke="#6C7D93" stroke-width="3"/><rect x="10" y="20" width="32" height="24" rx="3" fill="#2E3D52"/><path d="M48 22h6M48 28h6M48 34h6" stroke="#6C7D93" stroke-width="3" stroke-linecap="round"/><circle cx="51" cy="42" r="3" fill="#FF8FA3"/></svg>',
    pillow: '<svg viewBox="0 0 64 64"><path d="M8 24q24-10 48 0q4 10 0 20q-24 10-48 0q-4-10 0-20z" fill="#FFFFFF" stroke="#9FB2CC" stroke-width="3"/><circle cx="24" cy="33" r="2" fill="#FFB3C1"/><circle cx="40" cy="33" r="2" fill="#FFB3C1"/></svg>',
    towel: '<svg viewBox="0 0 64 64"><path d="M10 10h44" stroke="#8A6A3C" stroke-width="4" stroke-linecap="round"/><rect x="16" y="10" width="32" height="44" rx="3" fill="#7FD3C3" stroke="#3E9C8A" stroke-width="2.5"/><path d="M16 44h32M16 48h32" stroke="#fff" stroke-width="2.5"/></svg>',
    toothpaste: '<svg viewBox="0 0 64 64"><path d="M10 26h38l8 6-8 6H10z" fill="#FFFFFF" stroke="#5C7EA8" stroke-width="3" stroke-linejoin="round"/><rect x="4" y="27" width="8" height="10" rx="2" fill="#E8577E"/><path d="M20 32h20" stroke="#8CC2FF" stroke-width="4" stroke-linecap="round"/></svg>',
    crib: '<svg viewBox="0 0 64 64"><path d="M8 14v44M56 14v44" stroke="#C98A4B" stroke-width="5" stroke-linecap="round"/><path d="M8 22h48M8 48h48" stroke="#C98A4B" stroke-width="4"/><path d="M16 22v26M24 22v26M32 22v26M40 22v26M48 22v26" stroke="#E7B47E" stroke-width="3"/><path d="M10 46h44" stroke="#FFC3D0" stroke-width="5"/></svg>',
    diaper: '<svg viewBox="0 0 64 64"><path d="M8 18h48v10q-4 22-24 26Q12 50 8 28z" fill="#FFFFFF" stroke="#8CB8F2" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="18" width="10" height="8" rx="2" fill="#8CC2FF"/><rect x="46" y="18" width="10" height="8" rx="2" fill="#8CC2FF"/><circle cx="32" cy="34" r="3" fill="#FFD36B"/></svg>',
    wipes: '<svg viewBox="0 0 64 64"><rect x="6" y="20" width="52" height="30" rx="9" fill="#BFF0DC" stroke="#3E9C8A" stroke-width="3"/><ellipse cx="32" cy="27" rx="12" ry="4" fill="#fff" stroke="#3E9C8A" stroke-width="2"/><path d="M26 25q6-8 12 0" fill="#fff" stroke="#9FB2CC" stroke-width="2"/></svg>',
    formula: '<svg viewBox="0 0 64 64"><rect x="14" y="12" width="36" height="46" rx="6" fill="#FFF3D6" stroke="#D49A3A" stroke-width="3"/><rect x="12" y="6" width="40" height="9" rx="3" fill="#F2C14E" stroke="#D49A3A" stroke-width="2.5"/><circle cx="32" cy="36" r="9" fill="#8CC2FF"/><path d="M28 36h8M32 32v8" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    stroller: '<svg viewBox="0 0 64 64"><path d="M12 22h32a12 12 0 0 1-12 16H18z" fill="#FF9DB5" stroke="#C24E70" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 22q4-14 18-14v14" fill="#FFC3D0" stroke="#C24E70" stroke-width="2.5"/><path d="M44 22l6-10h4" stroke="#4A5B70" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="20" cy="50" r="6" fill="#4A5B70"/><circle cx="40" cy="50" r="6" fill="#4A5B70"/><path d="M20 38v6M40 38v6" stroke="#4A5B70" stroke-width="3"/></svg>',
    board: '<svg viewBox="0 0 64 40"><rect x="2" y="2" width="60" height="32" rx="3" fill="#2F5D4A" stroke="#8A5527" stroke-width="3"/><text x="12" y="23" font-size="13" fill="#fff" font-family="Noto Sans SC,sans-serif">你好！</text><path d="M44 34v4" stroke="#8A5527" stroke-width="3"/></svg>',
    eraser: '<svg viewBox="0 0 64 64"><path d="M10 38l18-18 22 10-18 18z" fill="#FF9DB5" stroke="#C24E70" stroke-width="3" stroke-linejoin="round"/><path d="M28 20l22 10v8L32 48" fill="#8CC2FF" stroke="#5C7EA8" stroke-width="3" stroke-linejoin="round"/></svg>',
    sale: '<svg viewBox="0 0 64 64"><path d="M6 14h34l18 18-18 18H6z" fill="#FF6B6B" stroke="#C23B3B" stroke-width="3" stroke-linejoin="round"/><text x="10" y="40" font-size="20" font-weight="700" fill="#fff" font-family="Noto Sans SC,sans-serif">打折</text></svg>',
    cashier: '<svg viewBox="0 0 64 64"><rect x="4" y="34" width="56" height="24" rx="4" fill="#E7B47E" stroke="#8A5527" stroke-width="3"/><rect x="30" y="14" width="24" height="20" rx="3" fill="#4A5B70"/><rect x="34" y="18" width="16" height="8" rx="1.5" fill="#9FF0C8"/><path d="M10 40h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    lake: '<svg viewBox="0 0 80 40"><ellipse cx="40" cy="22" rx="38" ry="16" fill="#8CD3F2" stroke="#4F9BC4" stroke-width="3"/><path d="M18 22q6-4 12 0M46 18q6-4 12 0M34 28q6-4 12 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
    bench: '<svg viewBox="0 0 64 48"><rect x="6" y="8" width="52" height="8" rx="3" fill="#D99A5B" stroke="#8A5527" stroke-width="2.5"/><rect x="6" y="20" width="52" height="8" rx="3" fill="#D99A5B" stroke="#8A5527" stroke-width="2.5"/><path d="M12 28v16M52 28v16" stroke="#4A5B70" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  G.art = function (e) { return e && e.charAt(0) === '#' ? '<span class="ic">' + (G.ICON[e.slice(1)] || '') + '</span>' : '<span class="em">' + esc(e) + '</span>'; };

  /* ---------- màn hình chính của mục ---------- */
  var GAMES_META = [
    { id: 'noi', name: 'Nối Đôi', zh: '连连看', emo: '🧩', c: '#2F7BEA', c2: '#7FB6FF', d: 'Nối chữ Hán với nghĩa hoặc pinyin. Đường nối không gấp quá 2 lần.' },
    { id: 'pho', name: 'Dạo phố', zh: '逛一逛', emo: '🚶', c: '#12A66A', c2: '#5CD6A0', d: 'Dắt Bánh Mì đi khắp phố, vào nhà, siêu thị… Chạm đồ vật để nghe tiếng Trung.' },
    { id: 'doan', name: 'Đoán chữ', zh: '猜字', emo: '🔍', c: '#E8577E', c2: '#FF9DB5', d: 'Chữ hiện dần từng nét, nghe đọc hoặc xem nghĩa. Đoán càng sớm càng nhiều sao.' },
    { id: 'ghep', name: 'Ghép bộ thủ', zh: '拼部首', emo: '🧱', c: '#7C5CDB', c2: '#B39DFF', d: 'Ghép bộ thủ với phần còn lại để thành chữ đúng nghĩa. Có bẫy chữ giống nhau!' }
  ];
  G.META = GAMES_META;
  G.best = G.load('best', {});
  G.setBest = function (id, sc) { if (!(G.best[id] >= sc)) { G.best[id] = sc; G.save('best', G.best); return true; } return false; };

  G.catBar = function (note) {
    return '<button type="button" class="catbar" id="catBtn"><i>' + (G.CATS.filter(function (k) { return k.id === G.cat.t; })[0] || {}).emo + '</i><span><small>Bộ từ đang chơi' + (note ? ' · ' + note : '') + '</small><b>' + esc(G.catLabel()) + '</b></span><em>Đổi</em></button>';
  };

  function home() {
    G.stopAll();
    var v = $('#view');
    var art = window.BM_MASCOT ? BM_MASCOT() : '';
    v.innerHTML =
      '<section class="ghero in"><div class="gh-tx"><h1>Mini game <span>小游戏</span></h1><p>Vừa chơi vừa học, mỗi ván chỉ vài phút. Chọn bộ từ rồi chọn trò nha!</p></div><div class="gh-art">' + art + '<div class="gh-bub">一起玩吧！</div></div></section>' +
      G.catBar() +
      '<section class="gmenu">' + GAMES_META.map(function (g, i) {
        return '<a class="gcard in" href="#/' + g.id + '" style="--c:' + g.c + ';--c2:' + g.c2 + ';animation-delay:' + (0.05 + i * 0.06) + 's" data-zh="' + g.zh.charAt(0) + '">' +
          '<div class="gc-ico">' + g.emo + '</div><div class="gc-tx"><b>' + g.name + ' <small>' + g.zh + '</small></b><p>' + g.d + '</p>' +
          (G.best[g.id] ? '<span class="gc-best">🏆 Kỷ lục ' + G.best[g.id] + '</span>' : '<span class="gc-best new">✨ Chơi thử</span>') + '</div><div class="gc-go">▶</div></a>';
      }).join('') + '</section>' +
      '<p class="gfoot">Mẹo: chạm 🔊 hoặc chạm vào chữ để nghe đọc. Âm thanh trò chơi bật/tắt ở nút 🔔 trong mỗi game.</p>';
    $('#catBtn').onclick = function () { G.openPicker(home); };
  }

  /* ---------- khung chung của một trò ---------- */
  G.frame = function (id, opts) {
    var g = GAMES_META.filter(function (x) { return x.id === id; })[0];
    var v = $('#view');
    v.innerHTML = '<div class="gtop" style="--c:' + g.c + ';--c2:' + g.c2 + '"><a class="gback" href="#/" aria-label="Về danh sách trò">‹</a><div class="gt-tx"><b>' + g.emo + ' ' + g.name + '</b><small>' + esc(opts && opts.sub || G.catLabel()) + '</small></div>' +
      '<button type="button" class="gico" id="gMute" aria-label="Âm thanh">' + (G.muted ? '🔕' : '🔔') + '</button>' +
      (opts && opts.noCat ? '' : '<button type="button" class="gico" id="gCat" aria-label="Đổi bộ từ">📚</button>') + '</div><div class="gbody" id="gb" style="--c:' + g.c + ';--c2:' + g.c2 + '"></div>';
    $('#gMute').onclick = function () { G.muted = !G.muted; G.save('mute', G.muted); this.textContent = G.muted ? '🔕' : '🔔'; G.sfx('tap'); };
    var cb = $('#gCat'); if (cb) cb.onclick = function () { G.openPicker(function () { route(true); }); };
    return $('#gb');
  };

  /* bảng kết quả */
  G.result = function (el, o) {
    var stars = o.stars || 0;
    var nb = G.setBest(o.id, o.score);
    if (stars >= 2) G.sfx('win');
    el.innerHTML = '<div class="res in"><div class="res-art">' + (window.BM_MASCOT ? BM_MASCOT() : '') + '</div>' +
      '<div class="stars">' + [1, 2, 3].map(function (i) { return '<span class="' + (i <= stars ? 'on' : '') + '" style="animation-delay:' + (0.15 * i) + 's">★</span>'; }).join('') + '</div>' +
      '<h2>' + esc(o.title) + '</h2><p class="res-sc">' + o.score + ' điểm' + (nb ? ' · <b>Kỷ lục mới! 🎉</b>' : '') + '</p>' +
      (o.extra || '') +
      (o.words && o.words.length ? '<div class="rw-h">Từ trong ván này <small>chạm để nghe</small></div><div class="rwords">' + o.words.map(function (w) {
        return '<button type="button" class="rw' + (w.bad ? ' bad' : '') + '" data-say="' + esc(w.z) + '"><b class="zh">' + esc(w.z) + '</b><span class="py">' + esc(w.p) + '</span><span class="vi">' + esc(w.v) + '</span></button>';
      }).join('') + '</div>' : '') +
      '<div class="res-btns"><button type="button" class="btn pri" id="resAgain">🔄 Chơi ván mới</button><a class="btn" href="#/">🎮 Trò khác</a></div></div>';
    $('#resAgain').onclick = o.again;
    G.$$('.rw', el).forEach(function (b) { b.onclick = function () { G.speak(b.dataset.say); }; });
  };

  /* chữ Hán từ dữ liệu nét (Make Me a Hanzi / hanzi-writer-data) */
  var strokeCache = {};
  var CDN = ['https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/', 'https://unpkg.com/hanzi-writer-data@2.0.1/'];
  G.strokes = function (ch) {
    if (strokeCache[ch]) return strokeCache[ch];
    var p = new Promise(function (ok) {
      var i = 0;
      (function next() {
        if (i >= CDN.length) return ok(null);
        fetch(CDN[i++] + encodeURIComponent(ch) + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(next);
      })();
    });
    strokeCache[ch] = p;
    p.then(function (d) { if (!d) delete strokeCache[ch]; });
    return p;
  };
  G.charSvg = function (strokes, opt) {
    opt = opt || {};
    var h = '<svg class="hz" viewBox="0 0 1024 1024" aria-hidden="true">' + (opt.grid ? '<path class="hz-grid" d="M0 512H1024M512 0V1024M0 0L1024 1024M1024 0L0 1024"/>' : '') + '<g transform="scale(1,-1) translate(0,-900)">';
    strokes.forEach(function (d, i) {
      var cls = opt.cls ? opt.cls(i) : '';
      h += '<path d="' + d + '" class="st ' + cls + '" data-i="' + i + '"/>';
    });
    return h + '</g></svg>';
  };

  /* ---------- điều hướng ---------- */
  var current = null;
  G.stopAll = function () { if (current && current.stop) try { current.stop(); } catch (e) {} current = null; if ('speechSynthesis' in window) try { speechSynthesis.cancel(); } catch (e) {} };
  function route(force) {
    var id = (location.hash.match(/^#\/(\w+)/) || [])[1];
    var g = id && G.games[id];
    G.stopAll();
    window.scrollTo(0, 0);
    if (!g) return home();
    current = g;
    var el = G.frame(id, g.frameOpts);
    if (g.noData) return g.start(el);
    el.innerHTML = '<div class="loading"><div class="spin"></div>Đang chuẩn bị…</div>';
    G.needData().then(function () {
      if (current !== g) return;
      var ws = G.words();
      if (ws.length < 4) { el.innerHTML = '<div class="empty">Bộ từ này ít quá (cần ít nhất 4 từ). <button type="button" class="btn pri" id="pk2">Chọn bộ khác</button></div>'; $('#pk2').onclick = function () { G.openPicker(function () { route(true); }); }; return; }
      g.start(el, ws);
    }).catch(function () { el.innerHTML = '<div class="empty">Chưa tải được dữ liệu, kiểm tra mạng rồi thử lại nha. <button type="button" class="btn pri" onclick="location.reload()">Tải lại</button></div>'; });
  }
  G.route = route;
  G.start = function () {
    window.addEventListener('hashchange', function () { route(); });
    route();
  };
})();
