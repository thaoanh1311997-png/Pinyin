/* Bánh Mì · Đoán chữ (猜字): nét hiện dần / nghe chọn chữ / xem nghĩa chọn chữ */
(function () {
  'use strict';
  var G = window.GAME, $ = G.$, esc = G.esc;
  var tk = null, alive = false, NQ = 10;
  var MODES = [
    { id: 'net', name: '✍️ Nét dần', tip: 'Chữ hiện ra từng nét. Đoán nghĩa càng sớm càng được nhiều điểm.' },
    { id: 'nghe', name: '👂 Nghe đoán', tip: 'Nghe Bánh Mì đọc rồi chọn đúng chữ Hán.' },
    { id: 'nghia', name: '📖 Xem nghĩa', tip: 'Đọc nghĩa tiếng Việt rồi chọn chữ Hán. Coi chừng các chữ na ná nhau!' }
  ];

  function hanCount(z) { return (z.match(/[一-鿿]/g) || []).length; }
  function similar(a, b) {
    var s = 0; for (var i = 0; i < a.z.length; i++) if (b.z.indexOf(a.z[i]) >= 0) s += 3;
    if (b.z.length === a.z.length) s += 1;
    return s + Math.random() * 1.5;
  }
  function distract(t, pool, n, byMeaning) {
    var c = pool.filter(function (w) { return w.z !== t.z && w.s !== t.s && w.v !== t.v && (!byMeaning || w.p !== t.p); });
    c.sort(function (a, b) { return similar(t, b) - similar(t, a); });
    var top = c.slice(0, n + 3);
    return G.pick(top, n);
  }

  function start(el, words) {
    stop(); alive = true;
    var mode = G.load('doan.mode', 'net');
    var pool = words;
    var qs;
    if (mode === 'net') {
      var short = words.filter(function (w) { var n = hanCount(w.z); return n >= 1 && n <= 4 && n === w.z.length; });
      qs = G.pick(short.length >= 4 ? short : words, Math.min(NQ, words.length));
    } else qs = G.pick(words, Math.min(NQ, words.length));
    var qi = 0, score = 0, results = [];

    el.innerHTML = '<div class="doan-top"><div class="seg seg3">' + MODES.map(function (m) { return '<button type="button" data-m="' + m.id + '" class="' + (m.id === mode ? 'on' : '') + '">' + m.name + '</button>'; }).join('') + '</div></div>' +
      '<div class="hud"><span class="hd-sc">⭐ <b id="dSc">0</b></span><div class="dots" id="dDots">' + qs.map(function () { return '<i></i>'; }).join('') + '</div></div>' +
      '<div class="qcard" id="qc"></div><div class="opts" id="ops"></div>' +
      '<p class="hint-line">' + MODES.filter(function (m) { return m.id === mode; })[0].tip + '</p>';
    el.querySelector('.seg').onclick = function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.m === mode) return;
      G.save('doan.mode', b.dataset.m); start(el, words);
    };

    function dots() { G.$$('#dDots i', el).forEach(function (d, k) { d.className = k < results.length ? (results[k].bad ? 'bad' : 'ok') : k === qi ? 'cur' : ''; }); }

    function ask() {
      if (!alive) return;
      clearInterval(tk);
      if (qi >= qs.length) return end();
      dots();
      var t = qs[qi], qc = $('#qc'), ops = $('#ops');
      var answered = false, revealed = 0, total = 0;
      var choices;
      if (mode === 'net') choices = G.shuffle([t].concat(distract(t, pool, 3, false)));
      else choices = G.shuffle([t].concat(distract(t, pool, 3, true)));

      function choose(btn, w) {
        if (answered) return; answered = true; clearInterval(tk);
        var ok = w.z === t.z, pts = 0;
        if (ok) {
          pts = mode === 'net' ? 10 + Math.round(10 * (1 - (total ? revealed / total : 1))) : 10;
          score += pts; G.sfx('ok');
        } else G.sfx('bad');
        results.push({ z: t.z, p: t.p, v: t.v, bad: !ok });
        G.$$('#ops button', el).forEach(function (b) {
          b.disabled = true;
          if (b.dataset.z === t.z) b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });
        $('#dSc').textContent = score;
        // hiện đáp án
        if (mode === 'net') G.$$('#qc .st', el).forEach(function (p) { p.classList.add('on'); });
        var ans = $('#qc .ans'); if (ans) { ans.innerHTML = '<b class="zh">' + esc(t.z) + '</b><span class="py">' + esc(t.p) + '</span><span class="vi">' + esc(t.v) + '</span>' + (ok ? '<em class="pts">+' + pts + '</em>' : ''); ans.classList.add('show'); }
        G.speak(t.z);
        var nx = document.createElement('button'); nx.type = 'button'; nx.className = 'btn pri next'; nx.textContent = qi + 1 >= qs.length ? 'Xem kết quả 🎉' : 'Câu tiếp ➜';
        nx.onclick = function () { qi++; ask(); };
        $('#ops').appendChild(nx);
      }

      if (mode === 'net') {
        qc.innerHTML = '<div class="hzrow" id="hzr">' + [].map.call(t.z, function () { return '<div class="hzbox"><div class="spin"></div></div>'; }).join('') + '</div><div class="netbar"><button type="button" class="btn sm" id="more">➕ Hiện thêm nét</button><span id="ncount"></span></div><div class="ans"></div>';
        ops.innerHTML = choices.map(function (w) { return '<button type="button" class="opt vi-opt" data-z="' + esc(w.z) + '">' + esc(w.s) + '</button>'; }).join('');
        Promise.all([].map.call(t.z, function (ch) { return G.strokes(ch); })).then(function (data) {
          if (!alive || qs[qi] !== t) return;
          if (data.some(function (d) { return !d; })) {
            G.toast('Chưa tải được nét chữ (mạng yếu), chuyển sang Xem nghĩa chọn chữ', 3200);
            G.save('doan.mode', 'nghia'); return start(el, words);
          }
          var order = [], maxS = 0;
          $('#hzr').innerHTML = data.map(function (d, ci) { maxS = Math.max(maxS, d.strokes.length); return '<div class="hzbox">' + G.charSvg(d.strokes, { grid: true }) + '</div>'; }).join('');
          for (var s = 0; s < maxS; s++) data.forEach(function (d, ci) { if (s < d.strokes.length) order.push([ci, s]); });
          total = order.length;
          var boxes = G.$$('#hzr .hzbox', el);
          function reveal() {
            if (answered || revealed >= total) return;
            var o = order[revealed++];
            var p = boxes[o[0]].querySelectorAll('.st')[o[1]]; if (p) p.classList.add('on');
            $('#ncount').textContent = revealed + '/' + total + ' nét';
            if (revealed >= total) { clearInterval(tk); $('#more').disabled = true; }
          }
          reveal();
          tk = setInterval(function () { if (!document.hidden) reveal(); }, Math.max(450, Math.min(1100, 9000 / total)));
          $('#more').onclick = function () { reveal(); };
        });
      } else if (mode === 'nghe') {
        qc.innerHTML = '<button type="button" class="bigsay" id="bs">🔊</button><div class="qtx">Nghe rồi chọn chữ đúng</div><div class="netbar"><button type="button" class="btn sm" id="slow">🐢 Đọc chậm</button><button type="button" class="btn sm" id="shpy">Hiện pinyin</button></div><div class="ans"></div>';
        ops.innerHTML = choices.map(function (w) { return '<button type="button" class="opt zh-opt" data-z="' + esc(w.z) + '"><span class="zh">' + esc(w.z) + '</span></button>'; }).join('');
        $('#bs').onclick = function () { G.speak(t.z); this.classList.remove('ping'); void this.offsetWidth; this.classList.add('ping'); };
        $('#slow').onclick = function () { G.speak(t.z, 0.55); };
        $('#shpy').onclick = function () { this.outerHTML = '<span class="py peek">' + esc(t.p) + '</span>'; };
        setTimeout(function () { if (alive && qs[qi] === t) G.speak(t.z); }, 300);
      } else {
        qc.innerHTML = '<div class="qtx">Chữ nào có nghĩa là</div><div class="qvi">“' + esc(t.v) + '”</div><div class="ans"></div>';
        ops.innerHTML = choices.map(function (w) { return '<button type="button" class="opt zh-opt" data-z="' + esc(w.z) + '"><span class="zh">' + esc(w.z) + '</span></button>'; }).join('');
      }
      G.$$('#ops .opt', el).forEach(function (b, k) { b.onclick = function () { choose(b, choices[k]); }; });
    }

    function end() {
      alive = false; clearInterval(tk);
      var right = results.filter(function (r) { return !r.bad; }).length;
      var stars = right >= qs.length * 0.9 ? 3 : right >= qs.length * 0.7 ? 2 : right >= qs.length * 0.4 ? 1 : 0;
      G.result(el, { id: 'doan', score: score, stars: stars, title: 'Đúng ' + right + '/' + qs.length + ' câu', words: results, again: function () { start(el, words); } });
    }
    ask();
  }
  function stop() { alive = false; clearInterval(tk); tk = null; }
  G.games.doan = { start: start, stop: stop };
})();
