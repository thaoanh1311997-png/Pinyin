/* Bánh Mì · giọng đọc tiếng Trung dùng chung cho mọi trang.
   1) Câu/từ có sẵn trên web: phát giọng AI thu sẵn (audio/zh/…, tạo bằng tools/voice — Kokoro v1.1-zh, Apache-2.0).
   2) Câu mới (tin tức, bài tự dán, AI soạn…): giọng máy tốt nhất trên thiết bị, ngắt nghỉ theo câu.
   Dùng: BMVoice.speak(text, { rate: 0.9, who: 'n' | 'f' | 'm' }) → Promise (true = đọc xong, false = bị dừng). BMVoice.stop(). */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BMVoice = api;
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  function norm(t) {
    return String(t == null ? '' : t).replace(/……|…/g, '，').replace(/[\s​　]+/g, '')
      .replace(/[“”"「」『』‘’'()（）]/g, '').replace(/^[，、。]+/, '');
  }
  function cyrb53(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return [h2 & 0x1fffff, h1 >>> 0];
  }
  function key(who, text) {
    var h = cyrb53(who + '|' + norm(text));
    return { lo: h[1], hex: ('000000' + h[0].toString(16)).slice(-6) + ('0000000' + h[1].toString(16)).slice(-8) };
  }
  var api = { norm: norm, key: key };
  if (typeof document === 'undefined') return api;

  /* ---------------- trình duyệt ---------------- */
  var me = document.currentScript;
  var BASE = new URL('../audio/zh/', me && me.src ? me.src : location.href).href;
  var NATURAL = 0.9;        // tốc độ "vừa" của các trang ứng với tốc độ gốc của file thu sẵn
  var IDX = null;           // Uint32Array đã sắp xếp: có file thu sẵn hay không
  var idxP = null;
  function loadIdx() {
    if (idxP) return idxP;
    idxP = fetch(BASE + 'index.bin?v=' + (W.BM_VOICE_V || '1')).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (b) { IDX = new Uint32Array(b); }).catch(function () { idxP = null; });
    return idxP;
  }
  function has(lo) {
    if (!IDX) return false;
    var a = 0, b = IDX.length - 1;
    while (a <= b) { var m = (a + b) >> 1, v = IDX[m]; if (v === lo) return true; if (v < lo) a = m + 1; else b = m - 1; }
    return false;
  }
  function find(text, who) {
    if (!/[㐀-鿿]/.test(text || '')) return null;
    var order = who === 'm' ? ['m', 'n'] : who === 'f' ? ['f', 'n'] : ['n'];
    for (var i = 0; i < order.length; i++) { var k = key(order[i], text); if (has(k.lo)) return BASE + k.hex.slice(0, 2) + '/' + k.hex + '.mp3'; }
    return null;
  }

  /* ---- giọng máy: chọn giọng hay nhất ---- */
  var SS = W.speechSynthesis, VOICES = { f: null, m: null };
  function score(v) {
    var n = v.name + ' ' + v.lang, s = 0;
    if (/zh[-_]?(CN|Hans)|cmn|Mandarin|普通话|中国大陆/i.test(n)) s += 100;
    else if (/^zh$/i.test(v.lang)) s += 60;
    if (/HK|TW|yue|Cantonese|粤|臺灣|台灣|香港/i.test(n)) s -= 200;
    if (/Natural|Neural|Online/i.test(n)) s += 60;          // Edge: Xiaoxiao Online (Natural)
    if (/Premium/i.test(n)) s += 55;                         // iPhone/iPad/Mac: giọng tải thêm chất lượng cao
    if (/Enhanced|增强/i.test(n)) s += 45;
    if (/Google/i.test(n)) s += 40;                          // Chrome: Google 普通话
    if (/Xiaoxiao|Xiaoyi|Xiaochen|Xiaohan|Xiaomo|Yunxi|Yunjian|Yunyang/i.test(n)) s += 20;
    if (/Tingting|Lili|Lilian|Meijia|Yu-?shu|Shasha|Fang/i.test(n)) s += 10;
    if (/Huihui|Kangkang|Yaoyao|Hanhan|Zhiwei/i.test(n)) s -= 15; // giọng Windows cũ, rất "máy"
    return s;
  }
  var MALE = /Yunxi|Yunjian|Yunyang|Yunfeng|Yunhao|Yunze|Kangkang|Li-?mu|Yu-?shu|Han|male|男/i;
  function pick() {
    if (!SS) return;
    var vs = SS.getVoices().filter(function (v) { return score(v) > 50; }).sort(function (a, b) { return score(b) - score(a); });
    VOICES.f = vs.filter(function (v) { return !MALE.test(v.name) || /female/i.test(v.name); })[0] || vs[0] || null;
    VOICES.m = vs.filter(function (v) { return MALE.test(v.name) && !/female/i.test(v.name); })[0] || null;
  }
  if (SS) { pick(); try { SS.addEventListener('voiceschanged', pick); } catch (e) { SS.onvoiceschanged = pick; } }

  // chia câu dài để có chỗ ngừng tự nhiên (và tránh lỗi Chrome tự tắt sau ~15 giây)
  function chunks(t) {
    var parts = String(t).match(/[^。！？!?；;…\n]+[。！？!?；;…”」』]*|[。！？!?；;…\n]+/g) || [String(t)], out = [];
    parts.forEach(function (p) {
      p = p.trim(); if (!p) return;
      if (p.length <= 46) { out.push(p); return; }
      var sub = p.match(/[^，,、：:]+[，,、：:]*/g) || [p], cur = '';
      sub.forEach(function (s) { if ((cur + s).length > 40 && cur) { out.push(cur); cur = s; } else cur += s; });
      if (cur) out.push(cur);
    });
    return out.filter(function (x) { return /[^\s。！？!?；;…，,、：:]/.test(x); });
  }

  /* ---- phát ---- */
  var job = 0, cur = null;
  var A = null;
  function el() {
    if (A) return A;
    A = new Audio(); A.preload = 'auto';
    try { A.preservesPitch = true; A.webkitPreservesPitch = true; A.mozPreservesPitch = true; } catch (e) {}
    return A;
  }
  // iPhone/iPad: mở khóa âm thanh ở lần chạm đầu để các câu đọc tự động sau đó không bị chặn
  var unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try {
      var a = el(); if (!a.src || a.paused) { a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='; var p = a.play(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
    try { if (SS && !SS.speaking) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; SS.speak(u); } } catch (e) {}
    loadIdx();
  }
  ['touchend', 'pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, once: true, passive: true }); });

  function stop() {
    job++;
    if (cur) { var c = cur; cur = null; c(false); }
    if (A) { try { A.pause(); } catch (e) {} }
    try { if (SS && (SS.speaking || SS.pending)) SS.cancel(); } catch (e) {}
  }

  function playFile(url, rate, my) {
    return new Promise(function (res) {
      var a = el(), done = false, guard = null;
      var fin = function (ok) { if (done) return; done = true; clearTimeout(guard); a.onended = a.onerror = a.onloadedmetadata = a.onplaying = null; if (cur === fin) cur = null; res(ok); };
      cur = fin;
      var pr = Math.max(0.5, Math.min(2, rate / NATURAL));
      var setRate = function () { try { a.defaultPlaybackRate = pr; a.playbackRate = pr; } catch (e) {} };
      a.onended = function () { fin(true); };
      a.onerror = function () { fin('err'); };
      a.onloadedmetadata = function () { setRate(); clearTimeout(guard); guard = setTimeout(function () { fin(true); }, ((a.duration || 20) / pr) * 1000 + 4000); };
      a.onplaying = setRate;
      try { a.pause(); } catch (e) {}
      a.src = url; setRate();
      guard = setTimeout(function () { fin('err'); }, 12000);
      var p = a.play(); if (p && p.catch) p.catch(function (e) { if (my === job) fin(e && e.name === 'AbortError' ? false : 'err'); });
    });
  }

  function speakSys(text, rate, who, my) {
    return new Promise(function (res) {
      if (!SS) { res(false); return; }
      if (!VOICES.f) pick();
      var list = chunks(text), i = 0;
      var fin = function (ok) { if (cur === fin) cur = null; res(ok); };
      cur = fin;
      var next = function () {
        if (my !== job) return fin(false);
        if (i >= list.length) return fin(true);
        var t = list[i++], u = new SpeechSynthesisUtterance(t), done = false;
        u.lang = 'zh-CN';
        var v = who === 'm' ? (VOICES.m || VOICES.f) : VOICES.f; if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = Math.max(0.5, Math.min(1.6, rate));
        if (who === 'm' && !VOICES.m) u.pitch = 0.7; else if (who === 'f') u.pitch = 1.1;
        var end = function () { if (done) return; done = true; clearTimeout(g); if (my !== job) return fin(false); setTimeout(next, /[？?！!]$/.test(t) ? 330 : /[。…；;]$/.test(t) ? 300 : 120); };
        u.onend = end; u.onerror = end;
        var g = setTimeout(end, 2500 + t.length * 450 / u.rate);
        try { SS.speak(u); } catch (e) { end(); }
      };
      try { if (SS.speaking || SS.pending) SS.cancel(); } catch (e) {}
      next();
    });
  }

  function speak(text, opt) {
    opt = opt || {};
    stop(); var my = ++job;
    text = String(text == null ? '' : text);
    if (!text.trim()) return Promise.resolve(false);
    var rate = opt.rate || NATURAL, who = opt.who || 'n';
    if (!IDX) loadIdx();
    var url = find(text, who);
    if (!url) return speakSys(text, rate, who, my);
    return playFile(url, rate, my).then(function (ok) {
      if (ok === 'err' && my === job) return speakSys(text, rate, who, my);
      return ok === true;
    });
  }
  function prefetch(text, who) {
    var url = find(text, who || 'n'); if (!url) return;
    try { fetch(url, { cache: 'force-cache' }).catch(function () {}); } catch (e) {}
  }

  api.speak = speak; api.stop = stop; api.prefetch = prefetch;
  api.ready = function () { return loadIdx() || Promise.resolve(); };
  api.has = function (text, who) { return !!find(text, who); };
  api.available = function () { return !!(SS || W.Audio); };
  api.info = function () { return { idx: IDX ? IDX.length : 0, voice: VOICES.f && VOICES.f.name, male: VOICES.m && VOICES.m.name }; };
  loadIdx();
  return api;
});
