/* Bánh Mì · Ghép bộ thủ (拼部首): chọn bộ thủ + phần còn lại để thành chữ đúng nghĩa */
(function () {
  'use strict';
  var G = window.GAME, $ = G.$, esc = G.esc;
  var alive = false, NQ = 10;
  // tên bộ thủ (Hán Việt · ý nghĩa)
  var RN = {
    '亻': ['nhân đứng', 'người'], '口': ['khẩu', 'miệng'], '扌': ['thủ', 'tay'], '木': ['mộc', 'cây, gỗ'], '氵': ['thủy (3 chấm)', 'nước'],
    '讠': ['ngôn', 'lời nói'], '辶': ['sước', 'bước đi'], '忄': ['tâm đứng', 'tim, tình cảm'], '纟': ['mịch', 'sợi tơ'], '土': ['thổ', 'đất'],
    '日': ['nhật', 'mặt trời, ngày'], '⺮': ['trúc', 'tre'], '心': ['tâm', 'tim, lòng'], '宀': ['miên', 'mái nhà'], '艹': ['thảo', 'cỏ'],
    '⺼': ['nhục', 'thịt, cơ thể'], '月': ['nguyệt', 'mặt trăng'], '女': ['nữ', 'phụ nữ'], '刂': ['đao đứng', 'dao'], '钅': ['kim', 'kim loại'],
    '禾': ['hòa', 'cây lúa'], '贝': ['bối', 'tiền, của cải'], '囗': ['vi', 'vây quanh'], '攵': ['phộc', 'đánh, hành động'], '冫': ['băng', 'băng, lạnh'],
    '目': ['mục', 'mắt'], '石': ['thạch', 'đá'], '力': ['lực', 'sức'], '饣': ['thực', 'ăn'], '灬': ['hỏa (4 chấm)', 'lửa'], '火': ['hỏa', 'lửa'],
    '走': ['tẩu', 'chạy, đi'], '广': ['nghiễm', 'mái hiên'], '足': ['túc', 'chân'], '耳': ['nhĩ', 'tai'], '衤': ['y', 'áo'], '巾': ['cân', 'khăn'],
    '子': ['tử', 'con'], '王': ['ngọc', 'ngọc'], '页': ['hiệt', 'đầu'], '欠': ['khiếm', 'há miệng'], '立': ['lập', 'đứng'],
    '礻': ['thị', 'thần, cúng tế'], '车': ['xa', 'xe'], '马': ['mã', 'ngựa'], '米': ['mễ', 'gạo'], '雨': ['vũ', 'mưa'], '门': ['môn', 'cửa'],
    '疒': ['nạch', 'bệnh'], '田': ['điền', 'ruộng'], '犭': ['khuyển', 'chó, thú'], '鸟': ['điểu', 'chim'], '鱼': ['ngư', 'cá'], '虫': ['trùng', 'sâu bọ'],
    '酉': ['dậu', 'bình rượu'], '皿': ['mãnh', 'bát, đĩa'], '羊': ['dương', 'dê, cừu'], '刀': ['đao', 'dao'], '阝': ['phụ', 'gò đất']
  };
  var LAY = { '⿰': ['trái', 'phải'], '⿱': ['trên', 'dưới'], '⿺': ['bao trái dưới', 'bên trong'], '⿸': ['bao trái trên', 'bên trong'], '⿴': ['bao quanh', 'bên trong'], '⿵': ['bao 3 mặt', 'bên trong'], '⿹': ['bao phải trên', 'bên trong'] };

  function rname(r, f, idx) {
    if (r === '阝') return idx === 0 ? ['phụ', 'gò đất (阝 bên trái)'] : ['ấp', 'vùng đất (阝 bên phải)'];
    return RN[r] || ['', ''];
  }

  function itemsFor(words) {
    var all = (window.GAME_RAD || []).map(function (r) { return { c: r[0], p: r[1], m: r[2], hv: r[3], L: r[4], f: r[5], a: r[6], b: r[7], ri: r[8], mt: r[9], s: r[10], rad: r[8] ? r[7] : r[6], oth: r[8] ? r[6] : r[7] }; });
    var chars = {};
    words.forEach(function (w) { [].forEach.call(w.z, function (ch) { chars[ch] = 1; }); });
    var mine = all.filter(function (it) { return chars[it.c]; });
    return { all: all, mine: mine };
  }

  function start(el, words) {
    alive = true;
    var D = itemsFor(words);
    var usingAll = D.mine.length < 5;
    var pool = usingAll ? D.all : D.mine;
    var qs = G.pick(pool, Math.min(NQ, pool.length));
    var byPair = {}; D.all.forEach(function (it) { byPair[it.rad + '|' + it.oth] = it; });
    var radList = Object.keys(D.all.reduce(function (o, it) { o[it.rad] = 1; return o; }, {}));
    var othList = Object.keys(D.all.reduce(function (o, it) { o[it.oth] = 1; return o; }, {}));
    var qi = 0, score = 0, results = [];

    el.innerHTML = (usingAll ? '<p class="pnote center">Bộ từ đang chọn có ít chữ ghép được (' + D.mine.length + '), Bánh Mì lấy thêm chữ trong kho chung ' + D.all.length + ' chữ nha.</p>' : '') +
      '<div class="hud"><span class="hd-sc">⭐ <b id="gSc">0</b></span><div class="dots" id="gDots">' + qs.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
      '<div class="gq" id="gq"></div>' +
      '<div class="trays"><div class="tray"><div class="tr-h">① Bộ thủ <small>gợi ý nghĩa</small></div><div class="tr-b" id="tRad"></div></div>' +
      '<div class="tray"><div class="tr-h">② Phần còn lại <small>thường gợi âm đọc</small></div><div class="tr-b" id="tOth"></div></div></div>' +
      '<div class="gfb" id="gfb"></div>' +
      '<p class="hint-line">Chọn 1 bộ thủ và 1 phần còn lại để ghép thành chữ có nghĩa ở trên. Bẫy: nhiều mảnh ghép lại cũng ra chữ thật nhưng sai nghĩa!</p>';

    function dots() { G.$$('#gDots i', el).forEach(function (d, k) { d.className = k < results.length ? (results[k].bad ? 'bad' : 'ok') : k === qi ? 'cur' : ''; }); }

    function ask() {
      if (!alive) return;
      if (qi >= qs.length) return end();
      dots();
      var t = qs[qi], tries = 0, done = false, selR = null, selO = null;
      // mảnh bẫy: tạo thành chữ thật khác
      var trapR = radList.filter(function (r) { return r !== t.rad && byPair[r + '|' + t.oth]; });
      var trapO = othList.filter(function (o) { return o !== t.oth && byPair[t.rad + '|' + o]; });
      var rOpts = G.pick(trapR, 2); rOpts = rOpts.concat(G.pick(radList.filter(function (r) { return r !== t.rad && rOpts.indexOf(r) < 0; }), 3 - rOpts.length));
      var oOpts = G.pick(trapO, 2); oOpts = oOpts.concat(G.pick(othList.filter(function (o) { return o !== t.oth && oOpts.indexOf(o) < 0 && [...o].length === 1; }), 3 - oOpts.length));
      rOpts = G.shuffle(rOpts.concat([t.rad])); oOpts = G.shuffle(oOpts.concat([t.oth]));
      var lay = LAY[t.f] || ['', ''];
      $('#gq').innerHTML = '<div class="gq-tx"><small>Ghép chữ có nghĩa</small><b class="vi">“' + esc(t.m) + '”</b><span class="py">' + esc(t.p) + (t.hv ? ' · Hán Việt: ' + esc(t.hv) : '') + '</span><button type="button" class="say" id="gSay">🔊</button></div>' +
        '<div class="slots f' + ({ '⿰': 'h', '⿱': 'v' }[t.f] || 'o') + '" id="slots"><div class="slot" data-s="0"><span></span><small>' + lay[0] + '</small></div><div class="slot" data-s="1"><span></span><small>' + lay[1] + '</small></div></div>';
      $('#gSay').onclick = function () { G.speak(t.c); };
      $('#tRad').innerHTML = rOpts.map(function (r) { var n = RN[r] || ['', '']; return '<button type="button" class="pc" data-r="' + esc(r) + '"><b class="zh">' + esc(r) + '</b><small>' + esc(n[1].split(',')[0]) + '</small></button>'; }).join('');
      $('#tOth').innerHTML = oOpts.map(function (o) { return '<button type="button" class="pc" data-o="' + esc(o) + '"><b class="zh">' + esc(o) + '</b></button>'; }).join('');
      $('#gfb').innerHTML = '';

      function fill() {
        var slots = G.$$('#slots .slot span', el);
        var sr = t.ri, so = 1 - t.ri;
        slots[sr].textContent = selR || ''; slots[so].textContent = selO || '';
        slots[sr].parentNode.classList.toggle('on', !!selR); slots[so].parentNode.classList.toggle('on', !!selO);
        G.$$('#tRad .pc', el).forEach(function (b) { b.classList.toggle('sel', b.dataset.r === selR); });
        G.$$('#tOth .pc', el).forEach(function (b) { b.classList.toggle('sel', b.dataset.o === selO); });
        if (selR && selO) setTimeout(check, 250);
      }
      function check() {
        if (done || !selR || !selO) return;
        tries++;
        if (selR === t.rad && selO === t.oth) {
          done = true; var pts = tries === 1 ? 10 : 5; score += pts; G.sfx('match');
          results.push({ z: t.c, p: t.p, v: t.m, bad: tries > 1 });
          return reveal(true, pts);
        }
        G.sfx('bad');
        var other = byPair[selR + '|' + selO];
        var msg = other ? 'Ghép ra <b class="zh">' + esc(other.c) + '</b> ' + esc(other.p) + ' = “' + esc(other.m) + '”. Chữ thật nhưng chưa đúng nghĩa!' : 'Hai mảnh này không ghép thành chữ nào quen thuộc.';
        $('#gfb').innerHTML = '<div class="fb bad in">' + msg + (tries >= 2 ? '' : ' Thử lại nha!') + '</div>';
        if (other) G.speak(other.c);
        var sl = $('#slots'); sl.classList.remove('shake'); void sl.offsetWidth; sl.classList.add('shake');
        if (tries >= 2) { done = true; results.push({ z: t.c, p: t.p, v: t.m, bad: true }); setTimeout(function () { reveal(false, 0); }, 900); return; }
        selR = selO = null; setTimeout(fill, 500);
      }
      function reveal(ok, pts) {
        $('#gSc').textContent = score;
        var rn = rname(t.rad, t.f, t.ri);
        $('#slots').outerHTML = '<div class="built in">' + G.charSvg(t.s, { grid: true, cls: function (i) { return (t.mt[i] === t.ri ? 'rad' : 'oth') + ' on'; } }) + '</div>';
        G.$$('.built .st', el).forEach(function (p, i) { p.style.animationDelay = (i * 0.07) + 's'; });
        $('#gfb').innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + ' in">' + (ok ? '🎉 Chính xác! +' + pts : 'Đáp án đây nè:') + '</div>' +
          '<div class="formula"><span class="fr"><b class="zh rad">' + esc(t.rad) + '</b><small>bộ ' + esc(rn[0]) + '<br>' + esc(rn[1]) + '</small></span><i>+</i><span class="fr"><b class="zh">' + esc(t.oth) + '</b><small>phần còn lại</small></span><i>=</i>' +
          '<span class="fr big"><b class="zh">' + esc(t.c) + '</b><small>' + esc(t.p) + '<br>' + esc(t.m) + '</small></span></div>' +
          '<button type="button" class="btn pri next" id="gNext">' + (qi + 1 >= qs.length ? 'Xem kết quả 🎉' : 'Chữ tiếp ➜') + '</button>';
        G.speak(t.c);
        G.$$('.pc', el).forEach(function (b) { b.disabled = true; });
        $('#gNext').onclick = function () { qi++; ask(); };
      }
      $('#tRad').onclick = function (e) { var b = e.target.closest('.pc'); if (!b || done) return; selR = selR === b.dataset.r ? null : b.dataset.r; G.sfx('tap'); fill(); };
      $('#tOth').onclick = function (e) { var b = e.target.closest('.pc'); if (!b || done) return; selO = selO === b.dataset.o ? null : b.dataset.o; G.sfx('tap'); fill(); };
      $('#slots').onclick = function (e) { var s = e.target.closest('.slot'); if (!s || done) return; if (+s.dataset.s === t.ri) selR = null; else selO = null; fill(); };
    }
    function end() {
      alive = false;
      var right = results.filter(function (r) { return !r.bad; }).length;
      var stars = right >= qs.length * 0.9 ? 3 : right >= qs.length * 0.7 ? 2 : right >= qs.length * 0.4 ? 1 : 0;
      G.result(el, { id: 'ghep', score: score, stars: stars, title: 'Ghép đúng ' + right + '/' + qs.length + ' chữ', words: results, again: function () { start(el, words); } });
    }
    ask();
  }
  function stop() { alive = false; }
  function startWrap(el, words) {
    if (window.GAME_RAD) return start(el, words);
    el.innerHTML = '<div class="loading"><div class="spin"></div>Đang tải kho chữ…</div>';
    G.loadScript('data/radicals.js?v=1').then(function () { if (document.body.contains(el)) start(el, words); }).catch(function () { el.innerHTML = '<div class="empty">Chưa tải được kho chữ, kiểm tra mạng rồi thử lại nha.</div>'; });
  }
  G.games.ghep = { start: startWrap, stop: stop };
})();
