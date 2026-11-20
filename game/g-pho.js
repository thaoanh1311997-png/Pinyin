/* Bánh Mì · Dạo phố (逛一逛): dắt Bánh Mì đi quanh phố, vào nhà, chạm đồ vật để nghe tiếng Trung */
(function () {
  'use strict';
  var G = window.GAME, $ = G.$, esc = G.esc;
  var W = window.GAME_WORLD;
  var st = null; // trạng thái đang chơi
  var FLOOR = { street: [56, 95], park: [34, 96], shop: [66, 95], def: [50, 95] };

  function seenSet() { return G.load('pho.seen', {}); }
  function markSeen(sid, z) { var s = seenSet(); s[sid] = s[sid] || []; if (s[sid].indexOf(z) < 0) { s[sid].push(z); G.save('pho.seen', s); return true; } return false; }

  function start(el) {
    stop();
    st = { el: el, scene: G.load('pho.scene', W.start), mode: 'free', x: 50, y: 88, target: null, score: 0, streak: 0, walkT: null, keyH: null };
    if (!W.scenes[st.scene]) st.scene = W.start;
    el.innerHTML =
      '<div class="pho-top"><div class="seg"><button type="button" data-md="free" class="on">🔎 Khám phá</button><button type="button" data-md="find">🎯 Tìm đồ</button></div>' +
      '<button type="button" class="chipb" id="pBook">📒 Sổ từ</button></div>' +
      '<div class="pmap" id="pMap"></div>' +
      '<div class="quest" id="pQuest" hidden></div>' +
      '<div class="stage-wrap"><div class="stage" id="stage"></div></div>' +
      '<p class="hint-line" id="pHint">Chạm vào đồ vật để Bánh Mì đi tới và đọc tên bằng tiếng Trung. Chạm biển 🚪 để sang chỗ khác.</p>';
    el.querySelector('.seg').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      G.$$('.seg button', el).forEach(function (x) { x.classList.toggle('on', x === b); });
      st.mode = b.dataset.md; st.score = 0; st.streak = 0; G.sfx('tap');
      if (st.mode === 'find') newQuest(); else { $('#pQuest').hidden = true; }
      $('#pHint').textContent = st.mode === 'find' ? 'Nghe và đọc chữ ở trên, rồi chạm đúng đồ vật đó nhé. Chạm 🔊 để nghe lại.' : 'Chạm vào đồ vật để Bánh Mì đi tới và đọc tên bằng tiếng Trung. Chạm biển 🚪 để sang chỗ khác.';
    };
    $('#pBook').onclick = book;
    st.keyH = function (e) {
      if (!document.body.contains(el) || /INPUT|TEXTAREA/.test((e.target || {}).tagName)) return;
      var k = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key];
      if (!k) return; e.preventDefault();
      walkTo(st.x + k[0], st.y + k[1], null, 120);
    };
    document.addEventListener('keydown', st.keyH);
    go(st.scene, null);
  }

  function mapBar() {
    var order = ['pho', 'nha', 'bep', 'phongngu', 'tam', 'phongbe', 'sieuthi', 'truong', 'benhvien', 'nhahang', 'congvien'];
    var s = seenSet();
    $('#pMap').innerHTML = order.map(function (id) {
      var sc = W.scenes[id], n = (s[id] || []).length, tot = sc.o.length;
      return '<button type="button" data-go="' + id + '" class="' + (id === st.scene ? 'on' : '') + '"><i>' + sc.emo + '</i><span>' + esc(sc.vi.split(',')[0]) + '</span><small>' + (n >= tot ? '✅' : n + '/' + tot) + '</small></button>';
    }).join('');
    $('#pMap').onclick = function (e) { var b = e.target.closest('button'); if (b) go(b.dataset.go, null); };
    var on = $('#pMap .on'); if (on && on.scrollIntoView) { var m = $('#pMap'); m.scrollLeft = on.offsetLeft - m.clientWidth / 2 + on.clientWidth / 2; }
  }

  function floorOf(sc) { return FLOOR[sc.bg] || FLOOR.def; }

  function go(id, fromId) {
    var sc = W.scenes[id]; if (!sc) return;
    st.scene = id; G.save('pho.scene', id);
    var stage = $('#stage');
    stage.className = 'stage bg-' + sc.bg;
    var h = '<div class="bgl"></div><div class="sc-name"><b class="zh">' + esc(sc.zh) + '</b><span>' + esc(sc.p) + ' · ' + esc(sc.vi) + '</span><button type="button" class="say" data-say="' + esc(sc.zh) + '" aria-label="Nghe">🔊</button></div>';
    (sc.b || []).forEach(function (b) {
      var t = W.scenes[b[0]];
      h += '<button type="button" class="bld" data-bld="' + b[0] + '" style="left:' + b[2] + '%;--bc:' + b[3] + '"><span class="bld-roof"></span><span class="bld-sign zh">' + esc(b[1]) + '</span><span class="bld-win"></span><span class="bld-door">🚪</span></button>';
    });
    sc.o.forEach(function (o, i) {
      h += '<button type="button" class="obj" data-i="' + i + '" style="left:' + o[4] + '%;top:' + o[5] + '%;--s:' + (o[6] || 1) + '" aria-label="' + esc(o[2]) + '">' + G.art(o[3]) + '</button>';
    });
    (sc.d || []).forEach(function (d) {
      var t = W.scenes[d[0]];
      var side = d[1] <= 5 ? 'l' : d[1] >= 95 ? 'r' : d[2] <= 5 ? 't' : 'b';
      h += '<button type="button" class="door d-' + side + '" data-go="' + d[0] + '" style="left:' + d[1] + '%;top:' + d[2] + '%"><span class="zh">' + esc(d[3]) + '</span><small>' + esc(t.vi.split(',')[0]) + '</small></button>';
    });
    h += '<div class="ava" id="ava">' + (window.BM_MASCOT ? BM_MASCOT() : '🥖') + '</div><div class="pcard" id="pCard" hidden></div>';
    stage.innerHTML = h;
    // vị trí xuất hiện: cạnh cửa dẫn về chỗ cũ
    var fl = floorOf(sc), entry = null;
    (sc.d || []).forEach(function (d) { if (d[0] === fromId) entry = d; });
    if (!entry && fromId === 'pho') entry = [null, 50, 99];
    if (entry) { st.x = Math.min(90, Math.max(10, entry[1])); st.y = Math.min(fl[1] - 2, Math.max(fl[0] + 2, entry[2])); }
    else { st.x = 38; st.y = fl[1] - 4; }
    var ava = $('#ava'); ava.style.left = st.x + '%'; ava.style.top = st.y + '%';
    stage.classList.remove('enter'); void stage.offsetWidth; stage.classList.add('enter');
    stage.onclick = onStage;
    mapBar();
    if (st.mode === 'find') newQuest();
  }

  function walkTo(x, y, cb, fixedMs) {
    var sc = W.scenes[st.scene], fl = floorOf(sc);
    x = Math.max(5, Math.min(95, x)); y = Math.max(fl[0], Math.min(fl[1], y));
    var ava = $('#ava'); if (!ava) return;
    var dist = Math.hypot(x - st.x, y - st.y);
    var ms = fixedMs || Math.min(1100, 200 + dist * 14);
    if (x < st.x - 0.5) ava.classList.add('flip'); else if (x > st.x + 0.5) ava.classList.remove('flip');
    ava.style.transitionDuration = ms + 'ms';
    ava.classList.add('walk');
    ava.style.left = x + '%'; ava.style.top = y + '%';
    st.x = x; st.y = y;
    clearTimeout(st.walkT);
    st.walkT = setTimeout(function () { ava.classList.remove('walk'); if (cb) cb(); }, ms);
  }

  function showCard(o, extra) {
    var c = $('#pCard'); if (!c) return;
    c.innerHTML = '<button type="button" class="pc-x" aria-label="Đóng">✕</button><div class="pc-art">' + G.art(o[3]) + '</div><div class="pc-tx"><b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><span class="vi">' + esc(o[2]) + '</span></div>' +
      '<div class="pc-btns"><button type="button" class="btn sm pri" data-say="' + esc(o[0]) + '">🔊 Nghe</button><button type="button" class="btn sm" data-slow="' + esc(o[0]) + '">🐢 Chậm</button>' + (extra || '') + '</div>';
    c.hidden = false; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    G.speak(o[0]);
  }

  function onStage(e) {
    var t = e.target;
    var b = t.closest('button');
    var stage = $('#stage');
    if (b && b.classList.contains('pc-x')) { $('#pCard').hidden = true; return; }
    if (b && b.dataset.say) { G.speak(b.dataset.say); return; }
    if (b && b.dataset.slow) { G.speak(b.dataset.slow, 0.55); return; }
    if (b && b.dataset.enter) { var to = b.dataset.enter; $('#pCard').hidden = true; G.sfx('pop'); go(to, st.scene); return; }
    var sc = W.scenes[st.scene];
    if (b && b.dataset.go) {
      var dx = parseFloat(b.style.left), dy = parseFloat(b.style.top);
      $('#pCard').hidden = true;
      walkTo(dx, dy, function () { G.sfx('pop'); go(b.dataset.go, st.scene); });
      return;
    }
    if (b && b.dataset.bld) {
      var id = b.dataset.bld, bx = parseFloat(b.style.left), tsc = W.scenes[id];
      var name = { nha: ['家', 'jiā', 'nhà (nhà mình)'], sieuthi: ['超市', 'chāoshì', 'siêu thị'], truong: ['学校', 'xuéxiào', 'trường học'], benhvien: ['医院', 'yīyuàn', 'bệnh viện'], nhahang: ['饭店', 'fàndiàn', 'nhà hàng'] }[id] || [tsc.zh, tsc.p, tsc.vi];
      walkTo(bx, floorOf(sc)[0], function () {
        if (st.mode === 'find') return judge(null, b, name);
        showCard([name[0], name[1], name[2], tsc.emo], '<button type="button" class="btn sm go" data-enter="' + id + '">🚪 Vào trong</button>');
      });
      return;
    }
    if (b && b.classList.contains('obj')) {
      var o = sc.o[+b.dataset.i];
      b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
      walkTo(o[4] + (o[4] > st.x ? -6 : 6), o[5] + 6, function () {
        if (st.mode === 'find') return judge(o, b);
        var nw = markSeen(st.scene, o[0]); if (nw) { G.sfx('ok'); mapBar(); }
        showCard(o);
      });
      return;
    }
    // chạm chỗ trống: đi tới đó
    if (t.closest('.pcard')) return;
    var r = stage.getBoundingClientRect();
    walkTo((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  }

  /* chế độ tìm đồ */
  function newQuest() {
    var sc = W.scenes[st.scene], s = st.qDone = st.qDone || {};
    var pool = sc.o.filter(function (o) { return !(s[st.scene] || []).includes(o[0]); });
    if (!pool.length) { s[st.scene] = []; pool = sc.o; }
    var o = st.target = pool[Math.floor(Math.random() * pool.length)];
    var q = $('#pQuest'); q.hidden = false;
    q.innerHTML = '<span class="q-l">🎯 Tìm:</span><b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><button type="button" class="say" id="qSay">🔊</button><span class="sp"></span><span class="q-sc">⭐ ' + st.score + (st.streak > 1 ? ' · 🔥' + st.streak : '') + '</span>';
    $('#qSay').onclick = function () { G.speak(o[0]); };
    setTimeout(function () { if (st && st.target === o) G.speak(o[0]); }, 350);
    var c = $('#pCard'); if (c) c.hidden = true;
  }
  function judge(o, btn, bName) {
    var tg = st.target; if (!tg) return;
    var ok = o && o[0] === tg[0];
    if (!ok && o) { // cùng chữ ở chỗ khác (vd. 窗户) cũng tính đúng
      ok = o[0] === tg[0];
    }
    if (ok) {
      st.score += 10 + st.streak * 2; st.streak++;
      G.sfx('match'); markSeen(st.scene, o[0]); mapBar();
      (st.qDone[st.scene] = st.qDone[st.scene] || []).push(o[0]);
      G.setBest('pho', st.score);
      showCard(o, '<button type="button" class="btn sm go" id="qNext">Tìm tiếp ➜</button>');
      var nx = $('#qNext'); if (nx) nx.onclick = function (e) { e.stopPropagation(); newQuest(); };
      btn.classList.add('found');
    } else {
      st.streak = 0; G.sfx('bad');
      btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
      var nm = o ? o : [bName[0], bName[1], bName[2]];
      G.toast('Đây là ' + nm[0] + ' (' + nm[1] + ') · ' + nm[2] + '. Tìm lại nha!', 2600);
      G.speak(nm[0]);
      var q = $('#pQuest .q-sc'); if (q) q.textContent = '⭐ ' + st.score;
    }
  }

  function book() {
    var s = seenSet(), sh = $('#sheet');
    var order = ['pho', 'nha', 'bep', 'phongngu', 'tam', 'phongbe', 'sieuthi', 'truong', 'benhvien', 'nhahang', 'congvien'];
    var total = 0, got = 0;
    var body = order.map(function (id) {
      var sc = W.scenes[id], seen = s[id] || [];
      return '<div class="bk-h">' + sc.emo + ' <b class="zh">' + esc(sc.zh) + '</b> ' + esc(sc.vi) + ' <small>' + seen.length + '/' + sc.o.length + '</small></div><div class="bk">' + sc.o.map(function (o) {
        total++; var k = seen.indexOf(o[0]) >= 0; if (k) got++;
        return '<button type="button" class="bk-w' + (k ? ' ok' : '') + '" data-say="' + esc(o[0]) + '">' + G.art(o[3]) + '<b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><span class="vi">' + esc(o[2]) + '</span></button>';
      }).join('') + '</div>';
    }).join('');
    sh.innerHTML = '<div class="sh-bg" data-x="1"></div><div class="sh-card"><div class="sh-grip"></div><div class="sh-hd"><b>📒 Sổ từ dạo phố · ' + got + '/' + total + '</b><button type="button" class="sh-x" data-x="1">✕</button></div><div class="sh-body">' +
      '<p class="pnote">Đồ đã chạm được tô màu. Chạm từ bất kỳ để nghe.</p>' + body + '</div></div>';
    sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('on'); });
    sh.onclick = function (e) {
      var b = e.target.closest('[data-x],[data-say]'); if (!b) return;
      if (b.dataset.say) return G.speak(b.dataset.say);
      sh.classList.remove('on'); setTimeout(function () { sh.hidden = true; sh.innerHTML = ''; }, 220);
    };
  }

  function stop() {
    if (!st) return;
    clearTimeout(st.walkT);
    if (st.keyH) document.removeEventListener('keydown', st.keyH);
    st = null;
  }

  G.games.pho = { start: start, stop: stop, noData: true, frameOpts: { noCat: true, sub: 'Từ vựng đời sống theo từng nơi' } };
})();
