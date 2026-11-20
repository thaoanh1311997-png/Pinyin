/* Bánh Mì · Nối Đôi (连连看): nối chữ Hán với nghĩa / pinyin, đường nối gấp tối đa 2 lần */
(function () {
  'use strict';
  var G = window.GAME, $ = G.$, esc = G.esc;
  var timer = null, alive = false;

  function sizeFor(w, words) {
    var avg = words.reduce(function (a, x) { return a + x.z.length; }, 0) / Math.max(1, words.length);
    if (avg > 3.2) return w < 560 ? { c: 3, r: 6 } : w < 900 ? { c: 5, r: 4 } : { c: 6, r: 4 };
    return w < 560 ? { c: 4, r: 6 } : w < 900 ? { c: 6, r: 6 } : { c: 8, r: 5 };
  }

  /* tìm đường nối ≤ 2 lần gấp trên lưới có viền rỗng xung quanh (0-1 BFS theo số lần gấp) */
  function findPath(grid, R, C, a, b) {
    var DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];
    var H = R + 2, W = C + 2, INF = 9;
    var best = {}, q = [];
    function key(r, c, d) { return (r * W + c) * 4 + d; }
    for (var d = 0; d < 4; d++) { q.push([a[0], a[1], d, 0, null]); best[key(a[0], a[1], d)] = 0; }
    var head = 0, found = null;
    // BFS theo lớp số lần gấp
    for (var turns = 0; turns <= 2 && !found; turns++) {
      var layer = q.filter(function (s) { return s[3] === turns; });
      var next = [];
      for (var li = 0; li < layer.length && !found; li++) {
        var s = layer[li];
        // đi thẳng theo hướng s[2]
        var r = s[0], c = s[1], dir = s[2], node = s;
        while (true) {
          r += DR[dir]; c += DC[dir];
          if (r < 0 || c < 0 || r >= H || c >= W) break;
          var n = [r, c, dir, turns, node];
          if (r === b[0] && c === b[1]) { found = n; break; }
          if (grid[r][c]) break;
          var k = key(r, c, dir);
          if (best[k] !== undefined && best[k] <= turns) { node = n; continue; }
          best[k] = turns; node = n;
          for (var nd = 0; nd < 4; nd++) if (nd !== dir && turns < 2) next.push([r, c, nd, turns + 1, n]);
        }
      }
      q = q.concat(next);
    }
    if (!found) return null;
    var pts = [], cur = found;
    while (cur) { pts.push([cur[0], cur[1]]); cur = cur[4]; }
    pts.reverse();
    // bỏ điểm thẳng hàng
    var out = [pts[0]];
    for (var i = 1; i < pts.length - 1; i++) {
      var p = out[out.length - 1], m = pts[i], n2 = pts[i + 1];
      if ((p[0] === m[0] && m[0] === n2[0]) || (p[1] === m[1] && m[1] === n2[1])) continue;
      out.push(m);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function start(el, words) {
    stop(); alive = true;
    var mode = G.load('noi.mode', 'vi');
    var autoSay = G.load('noi.say', true);
    var box = el.getBoundingClientRect();
    var sz = sizeFor(Math.min(box.width || window.innerWidth, 1100), words);
    var pairs = Math.min(sz.c * sz.r / 2, words.length);
    var pickW = G.pick(words, pairs);
    var R = sz.r, C = sz.c;
    var grid = [], i, j;
    for (i = 0; i < R + 2; i++) { grid.push([]); for (j = 0; j < C + 2; j++) grid[i].push(null); }
    var tiles = [];
    pickW.forEach(function (w, k) { tiles.push({ id: k, side: 'z', w: w }); tiles.push({ id: k, side: 'x', w: w }); });
    while (tiles.length < R * C) tiles.push(null);
    function place(list) {
      list = G.shuffle(list); var n = 0;
      for (var r = 1; r <= R; r++) for (var c = 1; c <= C; c++) grid[r][c] = list[n++] || null;
    }
    place(tiles);
    var total = pairs, left = pairs, score = 0, combo = 0, lastT = 0, hints = 3, sel = null, missed = {};
    var TIME = Math.round(pairs * 9 + 25), tleft = TIME, paused = false;

    el.innerHTML =
      '<div class="noi-top">' +
        '<div class="seg"><button type="button" data-m="vi" class="' + (mode === 'vi' ? 'on' : '') + '">字 ↔ Nghĩa</button><button type="button" data-m="py" class="' + (mode === 'py' ? 'on' : '') + '">字 ↔ Pinyin</button></div>' +
        '<button type="button" class="chipb' + (autoSay ? ' on' : '') + '" id="nSay">🔊 Tự đọc</button>' +
      '</div>' +
      '<div class="hud"><span class="hd-sc">⭐ <b id="nSc">0</b></span><span class="hd-left">🧩 <b id="nLeft">' + left + '</b>/' + total + '</span><span class="hd-combo" id="nCombo"></span>' +
        '<span class="sp"></span><button type="button" class="hbtn" id="nHint">💡 <b>' + hints + '</b></button><button type="button" class="hbtn" id="nShuf">🔀</button></div>' +
      '<div class="tbar"><i id="nTime"></i></div>' +
      '<div class="board-wrap" id="bw"><div class="board" id="board" style="--cols:' + C + ';--rows:' + R + '"></div><svg class="path" id="path"></svg></div>' +
      '<p class="hint-line">Chạm 1 ô chữ Hán rồi chạm ô ' + (mode === 'vi' ? 'nghĩa' : 'pinyin') + ' của nó. Đường nối đi qua ô trống hoặc vòng ngoài, gấp tối đa 2 lần.</p>';

    var board = $('#board');
    function tileHtml(t, r, c) {
      if (!t) return '<div class="tile empty" data-r="' + r + '" data-c="' + c + '"></div>';
      var txt, cls;
      if (t.side === 'z') { txt = t.w.z; cls = 'tz len' + Math.min(6, [...txt].length); }
      else if (mode === 'py') { txt = t.w.p; cls = 'tp' + (txt.length > 14 ? ' long' : ''); }
      else { txt = t.w.s; cls = 'tv' + (txt.length > 14 ? ' long' : ''); }
      return '<button type="button" class="tile ' + cls + '" data-r="' + r + '" data-c="' + c + '">' + (t.side === 'z' && t.w.e && t.w.e.charAt(0) !== '#' ? '' : '') + '<span>' + esc(txt) + '</span></button>';
    }
    function render() {
      var h = '';
      for (var r = 1; r <= R; r++) for (var c = 1; c <= C; c++) h += tileHtml(grid[r][c], r, c);
      board.innerHTML = h;
    }
    render();

    function cellEl(r, c) { return board.querySelector('[data-r="' + r + '"][data-c="' + c + '"]'); }
    function center(r, c) {
      var bw = $('#bw').getBoundingClientRect();
      var first = cellEl(1, 1).getBoundingClientRect(), last = cellEl(R, C).getBoundingClientRect();
      var cw = (last.left - first.left) / Math.max(1, C - 1), ch = (last.top - first.top) / Math.max(1, R - 1);
      if (C === 1) cw = first.width; if (R === 1) ch = first.height;
      var x0 = first.left + first.width / 2 - bw.left, y0 = first.top + first.height / 2 - bw.top;
      var x = x0 + (c - 1) * cw, y = y0 + (r - 1) * ch;
      if (c === 0) x = first.left - bw.left - 7; if (c === C + 1) x = last.right - bw.left + 7;
      if (r === 0) y = first.top - bw.top - 7; if (r === R + 1) y = last.bottom - bw.top + 7;
      return [x, y];
    }
    function drawPath(pts) {
      var svg = $('#path'); if (!svg) return;
      var bw = $('#bw').getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + bw.width + ' ' + bw.height);
      var d = pts.map(function (p, k) { var xy = center(p[0], p[1]); return (k ? 'L' : 'M') + xy[0].toFixed(1) + ' ' + xy[1].toFixed(1); }).join(' ');
      svg.innerHTML = '<path class="pl-b" d="' + d + '"/><path class="pl" d="' + d + '"/>' +
        [pts[0], pts[pts.length - 1]].map(function (p) { var xy = center(p[0], p[1]); return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="6" class="pd"/>'; }).join('');
      svg.classList.remove('fade'); void svg.offsetWidth; svg.classList.add('fade');
    }

    function anyMove() {
      var cells = [];
      for (var r = 1; r <= R; r++) for (var c = 1; c <= C; c++) if (grid[r][c]) cells.push([r, c]);
      for (var a = 0; a < cells.length; a++) for (var b = a + 1; b < cells.length; b++) {
        var A = grid[cells[a][0]][cells[a][1]], B = grid[cells[b][0]][cells[b][1]];
        if (A.id === B.id && A.side !== B.side) { var p = findPath(grid, R, C, cells[a], cells[b]); if (p) return [cells[a], cells[b]]; }
      }
      return null;
    }
    function reshuffle(msg) {
      var list = [];
      for (var r = 1; r <= R; r++) for (var c = 1; c <= C; c++) list.push(grid[r][c]);
      var tries = 0;
      do { place(list); tries++; } while (!anyMove() && tries < 30);
      sel = null; render(); board.classList.remove('shuf'); void board.offsetWidth; board.classList.add('shuf');
      if (msg) G.toast(msg);
    }
    function setHud() {
      $('#nSc').textContent = score; $('#nLeft').textContent = left;
      var cb = $('#nCombo'); cb.textContent = combo > 1 ? 'Combo x' + combo + ' 🔥' : ''; cb.classList.toggle('on', combo > 1);
      $('#nHint').querySelector('b').textContent = hints;
    }
    function finish(win) {
      alive = false; clearInterval(timer);
      var ratio = win ? tleft / TIME : (total - left) / total;
      var stars = win ? (ratio > 0.45 ? 3 : ratio > 0.2 ? 2 : 1) : (ratio >= 0.8 ? 2 : ratio >= 0.4 ? 1 : 0);
      if (win) score += Math.round(tleft) * 2;
      setTimeout(function () {
        if (!document.body.contains(el)) return;
        G.result(el, {
          id: 'noi', score: score, stars: stars, title: win ? 'Nối hết rồi, giỏi quá!' : 'Hết giờ mất rồi!',
          extra: win ? '<p class="res-note">Còn dư ' + Math.round(tleft) + ' giây · thưởng ' + Math.round(tleft) * 2 + ' điểm</p>' : '<p class="res-note">Nối được ' + (total - left) + '/' + total + ' cặp</p>',
          words: pickW.map(function (w, k) { return { z: w.z, p: w.p, v: w.v, bad: missed[k] }; }),
          again: function () { start(el, words); }
        });
      }, win ? 500 : 200);
    }
    function pick(r, c, btn) {
      var t = grid[r][c]; if (!t || !alive) return;
      if (t.side === 'z' && autoSay) G.speak(t.w.z);
      if (!sel) { sel = [r, c]; btn.classList.add('sel'); G.sfx('tap'); return; }
      if (sel[0] === r && sel[1] === c) { btn.classList.remove('sel'); sel = null; return; }
      var A = grid[sel[0]][sel[1]], aEl = cellEl(sel[0], sel[1]);
      if (A.id === t.id && A.side !== t.side) {
        var p = findPath(grid, R, C, sel, [r, c]);
        if (p) {
          drawPath(p);
          var now = Date.now(); combo = now - lastT < 5000 ? combo + 1 : 1; lastT = now;
          score += 10 * combo; left--;
          G.sfx('match');
          if (!autoSay || t.side !== 'z') G.speak(t.w.z);
          aEl.classList.add('gone'); btn.classList.add('gone');
          grid[sel[0]][sel[1]] = null; grid[r][c] = null; sel = null;
          setHud();
          setTimeout(function () {
            [aEl, btn].forEach(function (e) { e.className = 'tile empty'; e.innerHTML = ''; if (e.tagName === 'BUTTON') e.disabled = true; });
          }, 260);
          if (!left) return finish(true);
          if (!anyMove()) setTimeout(function () { if (alive) reshuffle('Hết đường nối, Bánh Mì xáo lại nè 🔀'); }, 450);
          return;
        }
        G.sfx('bad'); combo = 0; setHud();
        G.toast('Đúng cặp rồi, nhưng đường nối phải gấp quá 2 lần 😅');
        [aEl, btn].forEach(function (e) { e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); });
        aEl.classList.remove('sel'); sel = null; return;
      }
      // sai cặp
      G.sfx('bad'); combo = 0; missed[A.id] = 1; missed[t.id] = 1; setHud();
      tleft = Math.max(0, tleft - 3);
      [aEl, btn].forEach(function (e) { e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); });
      aEl.classList.remove('sel'); sel = null;
    }
    board.onclick = function (e) {
      var b = e.target.closest('button.tile'); if (!b) return;
      pick(+b.dataset.r, +b.dataset.c, b);
    };
    el.querySelector('.seg').onclick = function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.m === mode) return;
      G.save('noi.mode', b.dataset.m); start(el, words);
    };
    $('#nSay').onclick = function () { autoSay = !autoSay; G.save('noi.say', autoSay); this.classList.toggle('on', autoSay); };
    $('#nHint').onclick = function () {
      if (!alive) return;
      if (!hints) return G.toast('Hết lượt gợi ý rồi 🙈');
      var m = anyMove(); if (!m) return reshuffle();
      hints--; setHud(); score = Math.max(0, score - 5);
      m.forEach(function (p) { var e = cellEl(p[0], p[1]); e.classList.remove('hint'); void e.offsetWidth; e.classList.add('hint'); });
    };
    $('#nShuf').onclick = function () { if (alive) { tleft = Math.max(0, tleft - 5); reshuffle('Đã xáo lại (−5 giây)'); } };

    var last = Date.now();
    timer = setInterval(function () {
      var now = Date.now(), dt = (now - last) / 1000; last = now;
      if (document.hidden || !alive) return;
      tleft -= dt;
      var tb = $('#nTime'); if (!tb) return stop();
      tb.style.width = Math.max(0, tleft / TIME * 100) + '%';
      tb.classList.toggle('low', tleft < 15);
      if (tleft <= 0) { tleft = 0; finish(false); }
    }, 200);
    if (!anyMove()) reshuffle();
  }
  function stop() { alive = false; clearInterval(timer); timer = null; }

  G.games.noi = { start: start, stop: stop, _findPath: findPath };
})();
