/* Bánh Mì · Soi chữ Hán: tách chữ thành bộ phận, kể nguồn gốc (dữ liệu dựng sẵn trong data/core.js + data/rest.json) */
(function () {
  'use strict';
  var D = window.CH_DATA || {}, BT = window.CH_BT || {}, COMMON = window.CH_COMMON || '';
  var REST = null, restP = null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var HAN = /[㐀-䶿一-鿿豈-﫿⺀-⿟㇀-㇯]/;
  var HANG = /[㐀-䶿一-鿿豈-﫿⺀-⿟㇀-㇯]/g;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function loadRest() {
    if (REST) return Promise.resolve(REST);
    if (!restP) restP = fetch('data/rest.json?v=1').then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { REST = j; return j; }).catch(function () { restP = null; return {}; });
    return restP;
  }
  function getSync(ch) { return D[ch] || (REST && REST[ch]) || null; }
  function get(ch) { return D[ch] ? Promise.resolve(D[ch]) : loadRest().then(function () { return getSync(ch); }); }

  /* ---------- tên bộ phận ---------- */
  function shortMean(d) {
    if (!d || !d.m || !d.m.length) return '';
    var s = d.m[0][2].replace(/\([^)]*\)/g, '').split(/;\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
    return s.slice(0, 2).join(', ');
  }
  var TONED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
  function mainEntry(d) { if (!d || !d.m || !d.m.length) return null; return d.m.filter(function (m) { return TONED.test(m[0]); })[0] || d.m[0]; }
  function eqMean(d) {
    var e = mainEntry(d); if (!e) return '';
    var s = e[2].replace(/\([^)]*\)/g, '').split(/;\s*/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 2).join(', ');
    return s.length > 34 ? s.slice(0, 32).replace(/[ ,]+\S*$/, '') + '…' : s;
  }
  function firstHV(d) { return d && d.v ? d.v.split(/,\s*/)[0] : ''; }
  function firstPy(d) { return d && d.p ? d.p.split(',')[0] : ''; }
  function cname(ch, pos) {
    if (ch === '阝') return pos === 'L' ? { n: 'bộ Phụ', m: 'gò đất, đồi núi (khi đứng bên trái)' } : pos === 'R' ? { n: 'bộ Ấp', m: 'vùng đất, thành ấp (khi đứng bên phải)' } : { n: 'bộ Phụ / bộ Ấp', m: 'gò đất (bên trái) / vùng đất (bên phải)' };
    if (ch === '王' && pos === 'L') return { n: 'bộ Ngọc', m: 'ngọc (bộ Ngọc 玉 đứng bên trái viết giống chữ 王)' };
    var d = getSync(ch), b = BT[ch];
    if (b) return { n: 'bộ ' + b[0], m: b[1] };
    if (d) return { n: cap(firstHV(d)), m: shortMean(d) };
    return { n: '', m: '' };
  }

  /* ---------- cấu trúc IDS ---------- */
  var OPS = { '⿰': 2, '⿱': 2, '⿲': 3, '⿳': 3, '⿴': 2, '⿵': 2, '⿶': 2, '⿷': 2, '⿸': 2, '⿹': 2, '⿺': 2, '⿻': 2 };
  var OPN = { '⿰': 'trái – phải', '⿱': 'trên – dưới', '⿲': 'trái – giữa – phải', '⿳': 'trên – giữa – dưới', '⿴': 'bao quanh', '⿵': 'bao phía trên', '⿶': 'bao phía dưới', '⿷': 'bao bên trái', '⿸': 'bao trên-trái', '⿹': 'bao trên-phải', '⿺': 'bao dưới-trái', '⿻': 'đan lồng vào nhau' };
  var POSN = { '⿰': ['bên trái', 'bên phải'], '⿱': ['bên trên', 'bên dưới'], '⿲': ['bên trái', 'ở giữa', 'bên phải'], '⿳': ['bên trên', 'ở giữa', 'bên dưới'], '⿴': ['bên ngoài', 'bên trong'], '⿵': ['bên ngoài', 'bên trong'], '⿶': ['bên ngoài', 'bên trong'], '⿷': ['bên ngoài', 'bên trong'], '⿸': ['bên ngoài', 'bên trong'], '⿹': ['bên ngoài', 'bên trong'], '⿺': ['bên ngoài', 'bên trong'] };
  function parse(s) {
    var i = 0;
    function node() {
      var c = s[i++];
      if (c === undefined) return null;
      if (OPS[c]) { var k = [], n = OPS[c]; for (var j = 0; j < n; j++) k.push(node()); return { op: c, k: k }; }
      return { ch: c };
    }
    var arr = Array.from(s); s = arr; return node();
  }
  function leavesOf(n, out) { if (!n) return out; if (n.ch) { if (n.ch !== '？') out.push(n.ch); } else n.k.forEach(function (k) { leavesOf(k, out); }); return out; }
  function parts(d) {
    if (!d || !d.d) return { op: '', list: [] };
    var t = parse(d.d), list = [];
    if (!t) return { op: '', list: [] };
    if (t.ch) return { op: '', list: t.ch === '？' ? [] : [{ ch: t.ch, pos: '' }] };
    var pn = POSN[t.op] || [];
    t.k.forEach(function (k, i) {
      var p = pn[i] || '', side = t.op === '⿰' || t.op === '⿲' ? (i === 0 ? 'L' : i === t.k.length - 1 ? 'R' : '') : '';
      if (k && k.ch) { if (k.ch !== '？') list.push({ ch: k.ch, pos: p, side: side }); else list.push({ ch: '？', pos: p }); }
      else leavesOf(k, []).forEach(function (c) { list.push({ ch: c, pos: p, side: '' }); });
    });
    // gộp phần không rõ
    var seenQ = false;
    list = list.filter(function (x) { if (x.ch !== '？') return true; if (seenQ) return false; seenQ = true; return true; });
    return { op: t.op, list: list };
  }

  /* ---------- so âm hình thanh ---------- */
  var TONE = { 'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4', 'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4', 'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4', 'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4', 'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4', 'ǖ': 'ü1', 'ǘ': 'ü2', 'ǚ': 'ü3', 'ǜ': 'ü4' };
  function bare(p) { return String(p || '').toLowerCase().replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (c) { return TONE[c][0]; }); }
  function fin(p) { return bare(p).replace(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])/, ''); }
  function ini(p) { var m = bare(p).match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])/); return m ? m[1] : ''; }
  function soundNote(cp, fp) {
    if (!cp || !fp) return '';
    if (cp === fp) return 'Hai chữ đọc giống hệt nhau (' + fp + ').';
    if (bare(cp) === bare(fp)) return 'Đọc gần giống, chỉ khác thanh điệu (' + fp + ' → ' + cp + ').';
    if (fin(cp) === fin(fp) || (ini(cp) && ini(cp) === ini(fp))) return 'Âm đọc khá gần nhau (' + fp + ' → ' + cp + ').';
    return 'Ngày nay hai chữ đọc khác nhau (' + fp + ' → ' + cp + ') vì cách phát âm đã đổi qua hàng nghìn năm, nên phần âm chỉ còn là gợi ý.';
  }

  /* ---------- giải thích dân gian quen thuộc (ghi rõ là dân gian) ---------- */
  var FOLK = {
    '好': 'Người xưa coi phụ nữ 女 sinh được con 子, có vợ có con, là điều tốt đẹp, nên ghép lại thành "tốt".',
    '家': 'Nhà 宀 có nuôi lợn 豕 là nhà có của ăn của để, thành một gia đình.',
    '安': 'Người phụ nữ 女 ở trong nhà 宀 thì gia đình yên ổn.',
    '男': 'Người dùng sức 力 làm ruộng 田 là đàn ông.',
    '休': 'Người 亻 dựa vào gốc cây 木 là đang nghỉ ngơi.',
    '明': 'Mặt trời 日 và mặt trăng 月 cùng chiếu thì rất sáng.'
  };

  var TYPE = {
    h: { k: 't-h', n: '🔤 Hình thanh', d: 'một phần chỉ nghĩa, một phần chỉ âm' },
    y: { k: 't-y', n: '🧩 Hội ý', d: 'ghép nghĩa các phần lại' },
    t: { k: 't-t', n: '🖼️ Tượng hình', d: 'vẽ lại hình sự vật' },
    c: { k: 't-c', n: '👆 Chỉ sự', d: 'dùng ký hiệu để chỉ ý' }
  };

  function linkHan(s) { return esc(s).replace(HANG, function (c) { return '<button type="button" class="lk zh" data-c="' + c + '">' + c + '</button>'; }); }

  /* ---------- vẽ một chữ ---------- */
  function card(ch, d) {
    if (!d) return '<article class="res card nodata"><div class="big zh">' + esc(ch) + '</div><p>Chưa có dữ liệu cho chữ này. Bạn thử chữ giản thể hoặc chữ khác nhé.</p></article>';
    var ty = TYPE[d.t] || null, me = mainEntry(d), py = me ? me[0] : firstPy(d), pt = parts(d);
    var h = '<article class="res card" data-ch="' + esc(ch) + '">';
    // đầu thẻ
    h += '<div class="top"><button type="button" class="big zh say" data-say="' + esc(ch) + '" aria-label="Nghe đọc">' + esc(ch) + '<i>🔊</i></button><div class="meta">';
    h += '<div class="py">' + esc((d.p || '').split(',').join(' · ')) + '</div>';
    if (d.v) h += '<div class="hv">Hán Việt: <b>' + esc(d.v.toUpperCase()) + '</b></div>';
    if (ty) h += '<span class="badge ' + ty.k + '">' + ty.n + '</span>';
    h += '</div></div>';
    if (d.m && d.m.length) {
      h += '<ul class="means">';
      d.m.forEach(function (m) { h += '<li><b>' + esc(m[0]) + '</b>' + (m[1] ? '<i>' + esc(m[1]) + '</i>' : '') + '<span>' + esc(m[2]) + '</span></li>'; });
      h += '</ul>';
    }
    // phép ghép
    var real = pt.list.filter(function (x) { return x.ch !== '？'; });
    if (real.length && !(real.length === 1 && real[0].ch === ch)) {
      h += '<h3>🧱 Chữ này ghép từ' + (pt.op ? ' <small>(' + OPN[pt.op] + ')</small>' : '') + '</h3><div class="eq">';
      pt.list.forEach(function (x, i) {
        if (i) h += '<span class="plus">+</span>';
        if (x.ch === '？') { h += '<div class="pt unk"><b class="zh">?</b><small>nét riêng, không tách thành bộ</small></div>'; return; }
        var nm = cname(x.ch, x.side), role = '';
        if (d.t === 'h') role = x.ch === d.s ? '<em class="r-m">nghĩa</em>' : x.ch === d.f ? '<em class="r-a">âm</em>' : '';
        h += '<button type="button" class="pt" data-c="' + esc(x.ch) + '">' + role + '<b class="zh">' + esc(x.ch) + '</b>' +
          (nm.n ? '<span class="nm">' + esc(nm.n) + '</span>' : '') + (nm.m ? '<small>' + esc(nm.m) + '</small>' : '') +
          (x.pos ? '<span class="pos">' + x.pos + '</span>' : '') + '</button>';
      });
      h += '<span class="plus">=</span><div class="pt res-ch"><b class="zh">' + esc(ch) + '</b><small>' + esc(eqMean(d)) + '</small></div></div>';
    }
    // câu chuyện
    h += '<div class="story">';
    if (d.t === 'h') {
      var s = d.s, f = d.f, sn = s ? cname(s, '') : null, fd = f ? getSync(f) : null, fe = mainEntry(fd), fp = fe ? fe[0] : firstPy(fd);
      h += '<h3>📖 Vì sao chữ có nghĩa này?</h3><p>';
      if (s && f) {
        h += '<b class="zh">' + esc(ch) + '</b> là chữ hình thanh: <b class="zh">' + esc(s) + '</b>' + (sn.n ? ' (' + esc(sn.n) + (sn.m ? ': ' + esc(sn.m) : '') + ')' : '') +
          ' cho biết chữ thuộc nhóm nghĩa nào, còn <b class="zh">' + esc(f) + '</b>' + (fp ? ' (' + esc(fp) + ')' : '') + ' cho biết cách đọc.';
        var sd = soundNote(py, fp); if (sd) h += ' ' + esc(sd);
      } else if (s) {
        h += '<b class="zh">' + esc(ch) + '</b> là chữ hình thanh: <b class="zh">' + esc(s) + '</b>' + (sn.n ? ' (' + esc(sn.n) + ')' : '') + ' chỉ nghĩa, phần còn lại chỉ âm đọc.';
      } else if (f) {
        h += '<b class="zh">' + esc(ch) + '</b> là chữ hình thanh: <b class="zh">' + esc(f) + '</b>' + (fp ? ' (' + esc(fp) + ')' : '') + ' chỉ âm đọc, phần còn lại chỉ nghĩa.';
      } else h += 'Chữ hình thanh: một phần chỉ nghĩa, một phần chỉ âm.';
      h += '</p><p class="note">💡 Phần âm được chọn vì cách đọc, không mang câu chuyện về nghĩa. Mẹo nhớ: nhìn phần nghĩa để đoán chủ đề, nhìn phần âm để đoán cách đọc.</p>';
    } else if (d.g) {
      h += '<h3>📖 Nguồn gốc của chữ</h3><p>' + linkHan(d.g) + '</p><p class="note">Theo cách giải thích truyền thống trong từ điển chữ Hán.</p>';
    } else if (d.t === 'y') {
      h += '<h3>📖 Nguồn gốc của chữ</h3><p>Chữ hội ý: nghĩa của chữ đến từ việc ghép nghĩa các phần ở trên.</p>';
    } else if (d.t === 't') {
      h += '<h3>📖 Nguồn gốc của chữ</h3><p>Chữ tượng hình: vẽ lại hình dáng của sự vật.</p>';
    } else {
      h += '<p class="note">Chữ này chưa có dữ liệu nguồn gốc đáng tin cậy, Bánh Mì không tự bịa ra nhé. Bạn xem các bộ phận ở trên để dễ nhớ.</p>';
    }
    if (FOLK[ch]) h += '<div class="folk"><b>💬 Cách nhớ dân gian</b><p>' + linkHan(FOLK[ch]) + '</p></div>';
    h += '</div>';
    if (d.r && d.r !== ch) { var rn = cname(d.r, ''); h += '<p class="rad">Tra từ điển theo bộ: <button type="button" class="lk zh" data-c="' + esc(d.r) + '">' + esc(d.r) + '</button> ' + esc(rn.n) + '</p>'; }
    else if (d.r === ch && BT[ch]) h += '<p class="rad">Chữ này chính là <b>bộ ' + esc(BT[ch][0]) + '</b>, một trong 214 bộ thủ.</p>';
    h += '<div class="acts"><button type="button" class="btn stroke-b">✍️ Thứ tự nét</button><button type="button" class="btn say" data-say="' + esc(ch) + '">🔊 Nghe đọc</button></div><div class="sw" hidden><div class="hw"></div><p class="sc"></p></div>';
    h += '</article>';
    return h;
  }

  /* ---------- nét chữ ---------- */
  var SDP = {}, CDN = ['https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/', 'https://unpkg.com/hanzi-writer-data@2.0.1/'];
  function strokeData(ch) {
    if (SDP[ch]) return SDP[ch];
    var i = 0;
    SDP[ch] = new Promise(function (res) {
      (function next() {
        if (i >= CDN.length) { delete SDP[ch]; return res(false); }
        fetch(CDN[i++] + encodeURIComponent(ch) + '.json').then(function (r) {
          if (r.status === 404) return res(null);
          if (!r.ok) throw 0;
          return r.json().then(res);
        }).catch(next);
      })();
    });
    return SDP[ch];
  }
  function showStroke(art) {
    var ch = art.getAttribute('data-ch'), sw = $('.sw', art), box = $('.hw', art), sc = $('.sc', art), btn = $('.stroke-b', art);
    if (!sw.hidden && art._hw) { art._hw.animateCharacter(); return; }
    sw.hidden = false; btn.textContent = '↻ Viết lại'; box.innerHTML = '<div class="ld">Đang tải nét chữ…</div>'; sc.textContent = '';
    strokeData(ch).then(function (d) {
      box.innerHTML = '';
      if (d === false || !window.HanziWriter) { box.innerHTML = '<div class="ld">Không tải được nét chữ. Bạn kiểm tra mạng rồi bấm lại nhé.</div>'; btn.textContent = '✍️ Thử lại'; art._hw = null; return; }
      if (!d) { box.innerHTML = '<div class="ld">Chưa có dữ liệu nét cho chữ này 🙈</div>'; return; }
      var size = Math.min(220, box.clientWidth || 220);
      art._hw = window.HanziWriter.create(box, ch, {
        width: size, height: size, padding: 8, showOutline: true, strokeColor: '#3B2414', outlineColor: '#EADCCB', radicalColor: '#D94F4F',
        strokeAnimationSpeed: 1, delayBetweenStrokes: 260,
        charDataLoader: function (c, ok, err) { strokeData(c).then(function (x) { if (x) ok(x); else err(); }); }
      });
      sc.innerHTML = 'Chữ <b class="zh">' + esc(ch) + '</b> có <b>' + d.strokes.length + '</b> nét' + (d.radStrokes && d.radStrokes.length ? ' · phần màu đỏ là bộ thủ' : '') + '. Bấm "Viết lại" để xem lại.';
      art._hw.animateCharacter();
    });
  }

  /* ---------- tìm theo Hán Việt / pinyin ---------- */
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/ü/g, 'v').replace(/[^a-z0-9v ]/g, '').trim(); }
  function searchSound(q) {
    var raw = q.toLowerCase().trim(), f = fold(q).replace(/\s+/g, ''), exact = [], loose = [];
    if (!f) return [];
    Array.from(COMMON).forEach(function (c) {
      var d = D[c]; if (!d) return;
      var hvs = (d.v || '').split(/,\s*/), pys = (d.p || '').split(',');
      var ex = hvs.indexOf(raw) >= 0 || pys.indexOf(raw) >= 0;
      var lo = hvs.some(function (h) { return fold(h) === f; }) || pys.some(function (p) { return fold(p) === f; });
      if (ex) exact.push(c); else if (lo) loose.push(c);
    });
    return exact.concat(loose).slice(0, 60);
  }

  /* ---------- điều khiển ---------- */
  var out = $('#out'), pick = $('#pick'), q = $('#q');
  var RK = 'bm.chuhan.recent';
  function recent() { try { return JSON.parse(localStorage.getItem(RK) || '[]'); } catch (e) { return []; } }
  function addRecent(cs) { try { var r = recent(); cs.slice().reverse().forEach(function (c) { r = r.filter(function (x) { return x !== c; }); r.unshift(c); }); localStorage.setItem(RK, JSON.stringify(r.slice(0, 16))); } catch (e) {} }
  var EX = ['好', '明', '休', '林', '妈', '安', '看', '男', '家', '想'];
  function renderChips() {
    var r = recent(), h = '';
    if (r.length) h += '<span class="cl">Vừa soi:</span>' + r.slice(0, 10).map(function (c) { return '<button type="button" class="chip zh" data-c="' + c + '">' + c + '</button>'; }).join('');
    else h += '<span class="cl">Thử nhé:</span>' + EX.map(function (c) { return '<button type="button" class="chip zh" data-c="' + c + '">' + c + '</button>'; }).join('');
    $('#ex').innerHTML = h;
  }
  function setURL(v) {
    try { var u = new URL(location.href); if (v) u.searchParams.set('c', v); else u.searchParams.delete('c'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {}
  }
  var seq = 0;
  function run(text, opt) {
    opt = opt || {};
    text = String(text || '').trim();
    pick.hidden = true;
    if (!text) { out.innerHTML = ''; setURL(''); return; }
    var hs = Array.from(new Set((text.match(HANG) || [])));
    if (!hs.length) {
      var r = searchSound(text);
      pick.hidden = false;
      pick.innerHTML = r.length ? '<p>Chữ đọc là <b>' + esc(text) + '</b>, chọn một chữ để soi:</p><div class="pgrid">' + r.map(function (c) {
        var d = D[c]; return '<button type="button" class="pc" data-c="' + c + '"><b class="zh">' + c + '</b><small>' + esc((d.p || '').split(',')[0]) + ' · ' + esc(firstHV(d)) + '</small><span>' + esc(shortMean(d)) + '</span></button>';
      }).join('') + '</div>' : '<p>Không tìm thấy chữ nào đọc là <b>' + esc(text) + '</b>. Bạn gõ thẳng chữ Hán nhé (bàn phím tiếng Trung hoặc viết tay).</p>';
      out.innerHTML = '';
      return;
    }
    hs = hs.slice(0, 10);
    var my = ++seq;
    if (!opt.keepInput) q.value = hs.join('');
    setURL(hs.join(''));
    var need = hs.some(function (c) { return !D[c]; });
    if (need) out.innerHTML = '<div class="ld">Đang tìm chữ…</div>';
    (need ? loadRest() : Promise.resolve()).then(function () {
      if (my !== seq) return;
      out.innerHTML = (hs.length > 3 ? '<div class="jump">' + hs.map(function (c) { return '<a href="#c-' + c + '" class="chip zh">' + c + '</a>'; }).join('') + '</div>' : '') +
        hs.map(function (c) { return card(c, getSync(c)).replace('<article class="res card"', '<article id="c-' + c + '" class="res card"'); }).join('');
      addRecent(hs.filter(function (c) { return getSync(c); }));
      renderChips();
      if (opt.scroll !== false) { var t = out.firstElementChild; if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }

  $('#f').addEventListener('submit', function (e) { e.preventDefault(); try { q.blur(); } catch (x) {} run(q.value); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-c],.say,.stroke-b');
    if (!t) return;
    if (t.classList.contains('stroke-b')) { showStroke(t.closest('.res')); return; }
    if (t.classList.contains('say')) { var s = t.getAttribute('data-say'); if (window.BMVoice) BMVoice.speak(s, { rate: 0.8 }); else if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(s); u.lang = 'zh-CN'; speechSynthesis.speak(u); } return; }
    var c = t.getAttribute('data-c');
    if (c) { e.preventDefault(); run(c); }
  });

  var bud = $('#buddy'); if (bud && window.BM_MASCOT) bud.innerHTML = window.BM_MASCOT();
  renderChips();
  var init = '';
  try { init = new URL(location.href).searchParams.get('c') || ''; } catch (e) {}
  if (init) run(init, { scroll: false });

  // để kiểm thử
  window.__CH = { card: card, get: get, parts: parts, searchSound: searchSound, soundNote: soundNote };
})();
