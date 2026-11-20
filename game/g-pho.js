/* Bánh Mì · Dạo phố (逛一逛): nuôi Bánh Mì, dạo quanh thành phố, chạm đồ vật nghe câu tiếng Trung,
   gặp người nói chuyện, làm câu chuyện (nhiệm vụ) để lên cấp, kiếm xu mua đồ cho Bánh Mì */
(function () {
  'use strict';
  var G = window.GAME, $ = G.$, esc = G.esc;
  var W = window.GAME_WORLD, DESC = window.GAME_DESC || {}, TALKS = window.GAME_TALKS || {}, PEOPLE = window.GAME_PEOPLE || {};
  var STORIES = window.GAME_STORIES || [], BLD = window.GAME_BLD || {};
  var ORDER = ['pho', 'nha', 'bep', 'phongngu', 'tam', 'phongbe', 'sieuthi', 'truong', 'benhvien', 'nhahang', 'congvien',
    'pho2', 'shudian', 'yinhang', 'yaodian', 'kafei', 'youju', 'banshi', 'jichang', 'feiji', 'jiudian'];
  var HOME = { nha: 1, bep: 1, phongngu: 1, tam: 1, phongbe: 1 };
  var FLOOR = { street: [56, 95], street2: [58, 95], park: [34, 96], shop: [66, 95], book: [66, 95], pharmacy: [66, 95], def: [50, 95] };
  var st = null; // trạng thái đang chơi

  /* ---------- đồ ăn, chỗ nghỉ ---------- */
  // [xu khi ăn ở ngoài, năng lượng, 1 = đồ uống]
  var EAT = { '米饭': [3, 20], '面包': [3, 15], '苹果': [2, 10], '鸡蛋': [2, 12], '饺子': [8, 30], '面条': [8, 30], '火锅': [12, 45], '蛋糕': [5, 20], '牛角面包': [4, 18],
    '咖啡': [4, 15, 1], '奶茶': [5, 18, 1], '果汁': [3, 12, 1], '飞机餐': [0, 30], '早餐': [0, 35], '冰淇淋': [3, 10], '茶': [2, 8, 1], '香蕉': [2, 10], '西瓜': [3, 12],
    '葡萄': [3, 10], '牛奶': [3, 12, 1], '饮料': [2, 8, 1], '零食': [2, 8] };
  var REST = { '床': [100, '晚安！', 'Wǎn\'ān!', 'Chúc ngủ ngon!', '😴 Ngủ'], '沙发': [25, '我休息一下。', 'Wǒ xiūxi yíxià.', 'Tôi nghỉ một lát.', '🛋️ Nghỉ'],
    '长椅': [15, '我们坐一会儿吧。', 'Wǒmen zuò yíhuìr ba.', 'Mình ngồi một lát đi.', '🪑 Ngồi nghỉ'], '座位': [20, '我想睡一会儿。', 'Wǒ xiǎng shuì yíhuìr.', 'Tôi muốn ngủ một lát.', '💺 Chợp mắt'] };
  var TALK_COST = 8;

  /* ---------- cấp độ, tủ đồ ---------- */
  var TITLES = [['新手', 'xīnshǒu', 'Người mới'], ['学生', 'xuésheng', 'Học trò'], ['好学生', 'hǎo xuésheng', 'Học trò giỏi'], ['小达人', 'xiǎo dárén', 'Tiểu cao thủ'],
    ['汉语通', 'Hànyǔ tōng', 'Rành tiếng Trung'], ['小老师', 'xiǎo lǎoshī', 'Cô giáo nhí'], ['大师', 'dàshī', 'Bậc thầy']];
  var WEAR = [
    ['no', '🎀', '蝴蝶结', 'húdiéjié', 'cái nơ', 10, 1, 'head'], ['hoa', '🌸', '花', 'huā', 'bông hoa', 10, 1, 'head'],
    ['mu', '🧢', '帽子', 'màozi', 'mũ lưỡi trai', 20, 2, 'head'], ['kinh', '🕶️', '太阳镜', 'tàiyángjìng', 'kính râm', 25, 2, 'face'],
    ['khan', '🧣', '围巾', 'wéijīn', 'khăn quàng cổ', 30, 3, 'neck'], ['mucoi', '👒', '草帽', 'cǎomào', 'mũ cói', 35, 3, 'head'],
    ['tn', '🎓', '学士帽', 'xuéshìmào', 'mũ tốt nghiệp', 50, 4, 'head'], ['chop', '🎩', '礼帽', 'lǐmào', 'mũ chóp', 60, 5, 'head'],
    ['vm', '👑', '皇冠', 'huángguān', 'vương miện', 100, 6, 'head']];
  function need(L) { return 30 + L * 20; }
  function lvInfo(xp) { var L = 1, base = 0; while (xp >= base + need(L)) { base += need(L); L++; } return { L: L, cur: xp - base, need: need(L) }; }
  function title(L) { return TITLES[Math.min(L, TITLES.length) - 1]; }

  var me;
  function loadMe() {
    me = Object.assign({ xp: 0, coin: 20, en: 100, wear: {}, own: [], talks: {}, stories: {}, story: null, step: 0, ex: {} }, G.load('pho.me', {}));
    if (me.story && !storyById(me.story)) me.story = null;
  }
  function saveMe() { G.save('pho.me', me); }
  function storyById(id) { return STORIES.filter(function (s) { return s.id === id; })[0]; }

  function seenSet() { return G.load('pho.seen', {}); }
  function markSeen(sid, z) { var s = seenSet(); s[sid] = s[sid] || []; if (s[sid].indexOf(z) < 0) { s[sid].push(z); G.save('pho.seen', s); return true; } return false; }

  function mascot() {
    var w = me.wear || {}, h = window.BM_MASCOT ? BM_MASCOT() : '🥖';
    ['head', 'face', 'neck'].forEach(function (k) { var it = WEAR.filter(function (x) { return x[0] === w[k]; })[0]; if (it) h += '<span class="wr wr-' + k + '">' + it[1] + '</span>'; });
    return h;
  }

  /* ---------- màn chơi ---------- */
  function start(el) {
    stop(); loadMe();
    st = { el: el, scene: G.load('pho.scene', W.start), mode: 'free', x: 50, y: 88, target: null, score: 0, streak: 0, walkT: null, keyH: null };
    if (!W.scenes[st.scene]) st.scene = W.start;
    el.innerHTML =
      '<div class="pho-hud"><button type="button" class="me-chip" id="pMe" aria-label="Bánh Mì của mình"><span class="me-ava">' + mascot() + '</span><span class="me-tx"><b id="hLv"></b><span class="me-bar"><i id="hXp"></i></span></span></button>' +
      '<span class="me-st" id="hCoin" title="Xu">🪙 <b></b></span><span class="me-st en" id="hEn" title="Năng lượng">⚡<span class="en-bar"><i></i></span></span></div>' +
      '<div class="story-bn" id="pStory" hidden></div>' +
      '<div class="quest" id="pQuest" hidden></div>' +
      '<div class="stage-wrap"><div class="stage" id="stage"></div></div>' +
      '<nav class="ptools"><button type="button" id="pMapB"><i>🗺️</i><span>Bản đồ</span></button><button type="button" id="pTask"><i>📜</i><span>Nhiệm vụ</span></button>' +
      '<button type="button" id="pFind"><i>🎯</i><span>Tìm đồ</span></button><button type="button" id="pBook"><i>📒</i><span>Sổ từ</span></button></nav>';
    $('#pFind').onclick = function () {
      st.mode = st.mode === 'find' ? 'free' : 'find'; st.score = 0; st.streak = 0; G.sfx('tap');
      this.classList.toggle('on', st.mode === 'find');
      if (st.mode === 'find') newQuest(); else $('#pQuest').hidden = true;
    };
    $('#pMapB').onclick = mapSheet;
    $('#pBook').onclick = book;
    $('#pTask').onclick = tasks;
    $('#pMe').onclick = profile;
    st.keyH = function (e) {
      if (!document.body.contains(el) || /INPUT|TEXTAREA/.test((e.target || {}).tagName) || !$('#sheet').hidden) return;
      var k = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key];
      if (!k) return; e.preventDefault();
      walkTo(st.x + k[0], st.y + k[1], null, 120);
    };
    document.addEventListener('keydown', st.keyH);
    hud();
    go(st.scene, null);
    if (!G.load('pho.intro2', 0)) { G.save('pho.intro2', 1); setTimeout(function () { if (st) G.toast('Chạm đồ vật để nghe tiếng Trung. Ai có 💬 thì nói chuyện được ✨', 3600); }, 900); }
  }

  function hud() {
    if (!st) return;
    var li = lvInfo(me.xp);
    $('#hLv').textContent = 'Cấp ' + li.L;
    $('#hXp').style.width = Math.round(li.cur / li.need * 100) + '%';
    $('#hCoin b').textContent = me.coin;
    var en = $('#hEn'); en.querySelector('i').style.width = me.en + '%'; en.classList.toggle('low', me.en < 25);
    $('.me-ava').innerHTML = mascot();
    var ava = $('#ava'); if (ava) { ava.innerHTML = mascot(); ava.classList.toggle('tired', me.en < 25); }
    storyBar();
  }

  /* chữ bay lên ở chỗ Bánh Mì */
  function fx(txt, cls) {
    var stage = $('#stage'); if (!stage || !st) return;
    var d = document.createElement('div'); d.className = 'fx ' + (cls || ''); d.textContent = txt;
    d.style.left = st.x + '%'; d.style.top = (st.y - 16) + '%';
    stage.appendChild(d); setTimeout(function () { d.remove(); }, 1500);
  }
  function gain(xp, coin, silent) {
    var before = lvInfo(me.xp).L;
    me.xp += xp; me.coin += coin || 0; saveMe();
    if (!silent) fx('+' + xp + ' XP' + (coin ? '  +' + coin + '🪙' : ''));
    var after = lvInfo(me.xp).L;
    if (after > before) {
      me.coin += after * 10; saveMe();
      if (!$('#sheet').hidden) st.lvPending = after; else setTimeout(function () { levelUp(after); }, 500);
    }
    hud();
  }
  function levelUp(L) {
    var stage = $('#stage'); if (!stage || !st) return;
    var t = title(L), d = document.createElement('div'); d.className = 'lvup';
    var conf = ''; for (var i = 0; i < 18; i++) conf += '<i style="left:' + (5 + Math.random() * 90) + '%;animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's">' + ['🎉', '⭐', '✨', '🎊', '💛'][i % 5] + '</i>';
    d.innerHTML = conf + '<div class="lv-card"><div class="lv-ava">' + mascot() + '</div><b>Lên cấp ' + L + '!</b><span class="zh">' + t[0] + '</span><small>' + t[1] + ' · ' + t[2] + '</small><em>+' + (L * 10) + ' 🪙 thưởng · xem tủ đồ ở nút Cấp</em><button type="button" class="btn sm pri">恭喜！Tuyệt quá</button></div>';
    stage.appendChild(d); G.sfx('win'); G.speak('恭喜你！你升级了！');
    d.querySelector('button').onclick = function (e) { e.stopPropagation(); d.remove(); };
    setTimeout(function () { if (d.parentNode) d.remove(); }, 7000);
  }

  var GROUPS = [['🏠', 'Nhà mình', ['nha', 'bep', 'phongngu', 'tam', 'phongbe']], ['🏘️', 'Khu phố', ['pho', 'sieuthi', 'truong', 'benhvien', 'nhahang', 'congvien']],
    ['🚏', 'Trung tâm', ['pho2', 'shudian', 'yinhang', 'yaodian', 'kafei', 'youju', 'banshi']], ['✈️', 'Du lịch', ['jichang', 'feiji', 'jiudian']]];
  function mapBar() {
    var b = $('#pMapB'), t = curStep(); if (b) b.classList.toggle('tg', !!(t && t.scene !== st.scene));
  }
  function mapSheet() {
    var s = seenSet(), tgt = curStep();
    var h = GROUPS.map(function (g) {
      return '<div class="mg-h">' + g[0] + ' ' + g[1] + '</div><div class="mtiles">' + g[2].map(function (id) {
        var sc = W.scenes[id], n = (s[id] || []).length, tot = sc.o.length;
        return '<button type="button" class="mtile' + (id === st.scene ? ' on' : '') + (tgt && tgt.scene === id ? ' tg' : '') + '" data-go="' + id + '"><i>' + sc.emo + '</i><b>' + esc(sc.sh || sc.vi.split(',')[0]) + '</b>' +
          '<span class="mbar"><span style="width:' + Math.round(n / tot * 100) + '%"></span></span>' + (n >= tot ? '<em>✅</em>' : '') + '</button>';
      }).join('') + '</div>';
    }).join('');
    openSheet('🗺️ Đi đâu đây?', h, function (e) {
      var b = e.target.closest('[data-go]'); if (!b) return;
      closeSheet(); G.sfx('pop'); go(b.dataset.go, null);
    });
  }

  function floorOf(sc) { return FLOOR[sc.bg] || FLOOR.def; }
  function talkOf(sid, o) {
    var t = curStep();
    if (t && t.scene === sid && t.obj === o[0]) return t.talk;
    return o[7] || null;
  }

  var AMB = {
    street: '<i class="cl c1">☁️</i><i class="cl c2">☁️</i><i class="bird">🐦</i>',
    street2: '<i class="cl c1">☁️</i><i class="cl c2">☁️</i>',
    park: '<i class="cl c1">☁️</i><i class="cl c2">☁️</i><i class="bfly">🦋</i>',
    airport: '<i class="cl c1">☁️</i><i class="cl c2">☁️</i>',
    plane: '<i class="cl c1">☁️</i><i class="cl c2">☁️</i><i class="cl c3">☁️</i>'
  };

  function go(id, fromId) {
    var sc = W.scenes[id]; if (!sc) return;
    st.scene = id; G.save('pho.scene', id);
    var stage = $('#stage'), tgt = curStep();
    stage.className = 'stage bg-' + sc.bg;
    var h = '<div class="bgl"></div><div class="amb">' + (AMB[sc.bg] || '') + '</div><button type="button" class="sc-name" data-say="' + esc(sc.zh) + '" aria-label="' + esc(sc.vi) + '"><span class="sc-e">' + sc.emo + '</span><b class="zh">' + esc(sc.zh) + '</b><span class="py">' + esc(sc.p) + '</span><i>🔊</i></button>';
    var nb = (sc.b || []).length;
    (sc.b || []).forEach(function (b) {
      var isT = tgt && tgt.scene === b[0];
      h += '<button type="button" class="bld' + (nb > 5 ? ' b6' : '') + (isT ? ' tg' : '') + '" data-bld="' + b[0] + '" style="left:' + b[2] + '%;--bc:' + b[3] + '"><span class="bld-roof"></span><span class="bld-sign zh">' + esc(b[1]) + '</span><span class="bld-win"></span><span class="bld-door">🚪</span>' + (isT ? '<span class="mk tg">❗</span>' : '') + '</button>';
    });
    sc.o.forEach(function (o, i) {
      var tk = talkOf(id, o), isT = tgt && tgt.scene === id && tgt.obj === o[0];
      h += '<button type="button" class="obj' + (tk ? ' npc' : '') + '" data-i="' + i + '" style="left:' + o[4] + '%;top:' + o[5] + '%;--s:' + (o[6] || 1) + ';--d:' + ((i % 5) * 0.37).toFixed(2) + 's" aria-label="' + esc(o[2]) + '">' + G.art(o[3]) +
        (tk ? '<span class="mk' + (isT ? ' tg' : '') + '">' + (isT ? '❗' : '💬') + '</span>' : '') + '</button>';
    });
    (sc.d || []).forEach(function (d) {
      var t = W.scenes[d[0]], isT = tgt && tgt.scene === d[0];
      var side = d[1] <= 5 ? 'l' : d[1] >= 95 ? 'r' : d[2] <= 5 ? 't' : 'b';
      h += '<button type="button" class="door d-' + side + (isT ? ' tg' : '') + '" data-go="' + d[0] + '" style="left:' + d[1] + '%;top:' + d[2] + '%" aria-label="' + esc(t.vi) + '"><span class="de">' + t.emo + '</span><small>' + esc(t.sh || t.vi.split(',')[0]) + '</small></button>';
    });
    h += '<div class="ava" id="ava">' + mascot() + '</div><div class="pcard" id="pCard" hidden></div>';
    stage.innerHTML = h;
    var fl = floorOf(sc), entry = null;
    (sc.d || []).forEach(function (d) { if (d[0] === fromId) entry = d; });
    (sc.b || []).forEach(function (b) { if (b[0] === fromId) entry = [null, b[2], fl[0]]; });
    if (entry) { st.x = Math.min(90, Math.max(10, entry[1])); st.y = Math.min(fl[1] - 2, Math.max(fl[0] + 2, entry[2])); }
    else { st.x = 38; st.y = fl[1] - 4; }
    var ava = $('#ava'); ava.style.left = st.x + '%'; ava.style.top = st.y + '%'; ava.classList.toggle('tired', me.en < 25);
    stage.classList.remove('enter'); void stage.offsetWidth; stage.classList.add('enter');
    stage.onclick = onStage;
    mapBar(); storyBar();
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

  function hl(sen, w) { var s = esc(sen), k = esc(w); return k && s.indexOf(k) >= 0 ? s.split(k).join('<u>' + k + '</u>') : s; }

  /* thẻ thông tin: từ + câu mô tả + nút hành động */
  function showCard(o, opt) {
    opt = opt || {};
    var c = $('#pCard'); if (!c) return;
    var d = opt.desc || (DESC[st.scene] || {})[o[0]], btns = '';
    var tk = opt.talk, eat = !opt.noAct && EAT[o[0]], rest = !opt.noAct && REST[o[0]];
    btns += '<button type="button" class="ib" data-say="' + esc(o[0]) + '" aria-label="Nghe">🔊</button><button type="button" class="ib" data-slow="' + esc(d ? d[0] : o[0]) + '" aria-label="Nghe chậm">🐢</button>';
    if (tk) btns += '<button type="button" class="btn sm talkb' + (opt.isT ? ' hot' : '') + '" data-talk="' + tk + '">' + (opt.isT ? '❗' : '💬') + ' Nói chuyện</button>';
    if (eat) { var pr = HOME[st.scene] ? 0 : eat[0]; btns += '<button type="button" class="btn sm eatb" data-eat="' + esc(o[0]) + '">' + (eat[2] ? '🥤 Uống' : '🍽️ Ăn') + ' <small>' + (pr ? pr + '🪙 ' : '') + '+' + eat[1] + '⚡</small></button>'; }
    if (rest) btns += '<button type="button" class="btn sm eatb" data-rest="' + esc(o[0]) + '">' + rest[4] + ' <small>+' + rest[0] + '⚡</small></button>';
    if (opt.extra) btns += opt.extra;
    c.innerHTML = '<button type="button" class="pc-x" aria-label="Đóng">✕</button><div class="pc-art">' + G.art(o[3]) + '</div><div class="pc-tx"><b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><span class="vi">' + esc(o[2]) + '</span></div>' +
      (d ? '<div class="pc-sen" data-sen="1"><b class="zh">' + hl(d[0], o[0]) + '</b><span class="sen-more"><span class="py">' + esc(d[1]) + '</span><span class="vi">' + esc(d[2]) + '</span></span><i class="sen-tip">👆 nghĩa</i></div>' : '') +
      '<div class="pc-btns">' + btns + '</div>';
    c.hidden = false; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    st.cardSen = d ? d[0] : null;
    if (d && !opt.wordOnly) G.speak(o[0], 0.85, function () { G.speak(d[0]); }); else G.speak(o[0]);
  }

  function onStage(e) {
    var t = e.target;
    var b = t.closest('button,[data-sen],[data-slow]');
    var stage = $('#stage');
    if (t.closest('.lvup')) return;
    if (b && b.classList.contains('pc-x')) { $('#pCard').hidden = true; G.speak(''); return; }
    if (b && b.dataset.say) { G.speak(b.dataset.say); return; }
    if (b && b.dataset.slow) { G.speak(b.dataset.slow, 0.55); return; }
    if (b && b.dataset.sen) { b.classList.add('open'); if (st.cardSen) G.speak(st.cardSen); return; }
    if (b && b.dataset.talk) { openTalk(b.dataset.talk); return; }
    if (b && b.dataset.eat) { doEat(b.dataset.eat); return; }
    if (b && b.dataset.rest) { doRest(b.dataset.rest); return; }
    if (b && b.dataset.enter) { var to = b.dataset.enter; $('#pCard').hidden = true; G.sfx('pop'); go(to, st.scene); return; }
    var sc = W.scenes[st.scene];
    if (b && b.dataset.go) {
      var dx = parseFloat(b.style.left), dy = parseFloat(b.style.top);
      $('#pCard').hidden = true;
      walkTo(dx, dy, function () { G.sfx('pop'); go(b.dataset.go, st.scene); });
      return;
    }
    if (b && b.dataset.bld) {
      var id = b.dataset.bld, bx = parseFloat(b.style.left), tsc = W.scenes[id], bi = BLD[id] || { n: [tsc.zh, tsc.p, tsc.vi] };
      walkTo(bx, floorOf(sc)[0], function () {
        if (st.mode === 'find') return judge(null, b, bi.n);
        showCard([bi.n[0], bi.n[1], bi.n[2], tsc.emo], { desc: bi.d, noAct: 1, extra: '<button type="button" class="btn sm go" data-enter="' + id + '">🚪 Vào trong</button>' });
      });
      return;
    }
    if (b && b.classList.contains('obj')) {
      var o = sc.o[+b.dataset.i];
      b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
      walkTo(o[4] + (o[4] > st.x ? -6 : 6), o[5] + 6, function () {
        if (st.mode === 'find') return judge(o, b);
        if (markSeen(st.scene, o[0])) { G.sfx('ok'); gain(2, 0); mapBar(); exploreCheck(); }
        var tk = talkOf(st.scene, o), tg = curStep();
        showCard(o, { talk: tk, isT: tg && tg.scene === st.scene && tg.obj === o[0] });
      });
      return;
    }
    if (t.closest('.pcard')) return;
    var r = stage.getBoundingClientRect();
    walkTo((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  }

  function exploreCheck() {
    var sc = W.scenes[st.scene], s = seenSet()[st.scene] || [];
    if (s.length >= sc.o.length && !me.ex[st.scene]) {
      me.ex[st.scene] = 1; saveMe();
      setTimeout(function () { if (!st) return; G.toast('🗺️ Khám phá xong ' + sc.vi.split(',')[0] + '! +20 XP +10🪙', 2800); gain(20, 10); G.sfx('win'); }, 900);
    }
  }

  function doEat(z) {
    var e = EAT[z]; if (!e) return;
    var pr = HOME[st.scene] ? 0 : e[0];
    if (me.en >= 100) { G.toast('Bánh Mì no rồi, năng lượng đang đầy ⚡'); return; }
    if (me.coin < pr) { G.sfx('bad'); G.toast('Không đủ xu 🪙 Nói chuyện, làm nhiệm vụ để kiếm thêm nha!', 2800); return; }
    me.coin -= pr; me.en = Math.min(100, me.en + e[1]); saveMe();
    var say = e[2] ? ['真好喝！', 'Zhēn hǎohē!', 'Ngon quá!'] : ['真好吃！', 'Zhēn hǎochī!', 'Ngon quá!'];
    G.speak(say[0]); G.sfx('match');
    fx('+' + e[1] + '⚡' + (pr ? '  −' + pr + '🪙' : ''), 'en');
    G.toast(say[0] + ' ' + say[1] + ' · ' + say[2], 2400);
    hud();
  }
  function doRest(z) {
    var r = REST[z]; if (!r) return;
    if (me.en >= 100) { G.toast('Bánh Mì đang khoẻ re, chưa cần nghỉ ⚡'); return; }
    var stage = $('#stage'), d = document.createElement('div');
    d.className = 'sleep'; d.innerHTML = '<b>💤</b><span class="zh">' + esc(r[1]) + '</span><small>' + esc(r[2]) + ' · ' + esc(r[3]) + '</small>';
    stage.appendChild(d); G.speak(r[1]);
    me.en = Math.min(100, me.en + r[0]); saveMe();
    setTimeout(function () {
      if (!st) return;
      d.classList.add('out'); fx('+' + r[0] + '⚡', 'en'); hud(); setTimeout(function () { d.remove(); }, 400);
      if (z === '床') setTimeout(function () { G.speak('早上好！'); G.toast('早上好！Zǎoshang hǎo! · Chào buổi sáng! Năng lượng đầy rồi ⚡', 2600); }, 500);
    }, 1700);
  }

  /* ---------- câu chuyện (nhiệm vụ nhiều bước) ---------- */
  function curStep() { if (!me || !me.story) return null; var s = storyById(me.story); return s ? s.steps[me.step] || null : null; }
  function storyBar() {
    var bn = $('#pStory'); if (!bn) return;
    var s = me.story && storyById(me.story), stp = curStep();
    if (!s || !stp) { bn.hidden = true; return; }
    var here = stp.scene === st.scene;
    bn.hidden = false;
    bn.innerHTML = '<i>' + s.emo + '</i><div><b>' + esc(stp.goal) + '</b><span class="dots">' + s.steps.map(function (x, k) { return '<i class="' + (k < me.step ? 'ok' : k === me.step ? 'cur' : '') + '"></i>'; }).join('') + '</span></div>' +
      (here ? '<span class="sb-here">❗</span>' : '<button type="button" class="sb-go" id="sbGo" aria-label="Đi tới">' + W.scenes[stp.scene].emo + ' ➜</button>') + '<button type="button" class="sb-x" id="sbX" aria-label="Dừng câu chuyện">✕</button>';
    var g = $('#sbGo'); if (g) g.onclick = function () { G.sfx('pop'); go(stp.scene, null); };
    $('#sbX').onclick = function () { me.story = null; me.step = 0; saveMe(); G.toast('Đã dừng câu chuyện. Mở 📜 Nhiệm vụ để chơi lại.'); go(st.scene, null); };
  }
  function startStory(id) {
    var s = storyById(id); if (!s) return;
    me.story = id; me.step = 0; saveMe();
    closeSheet();
    G.sfx('win'); G.toast(s.emo + ' ' + s.name + ' · Bước 1: ' + s.steps[0].goal, 3400);
    go(s.steps[0].scene, null);
  }

  /* ---------- thu âm + chấm phát âm ---------- */
  var REC = { on: 0 };
  var DIG = { '0': '零', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' };
  function SRC() { return window.SpeechRecognition || window.webkitSpeechRecognition; }
  function han(s) { return String(s || '').replace(/[0-9]/g, function (d) { return DIG[d]; }).replace(/[^㐀-鿿]/g, ''); }
  function lcsMask(t, h) {
    var n = t.length, m = h.length, D = [], i, j;
    for (i = 0; i <= n; i++) { D.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) D[i][j] = t[i] === h[j] ? D[i + 1][j + 1] + 1 : Math.max(D[i + 1][j], D[i][j + 1]);
    var mask = new Array(n).fill(0); i = 0; j = 0;
    while (i < n && j < m) { if (t[i] === h[j]) { mask[i] = 1; i++; j++; } else if (D[i + 1][j] >= D[i][j + 1]) i++; else j++; }
    return mask;
  }
  function recRelease() { if (REC.stream) { REC.stream.getTracks().forEach(function (t) { t.stop(); }); REC.stream = null; } }
  function recAbort() {
    clearTimeout(REC.t); REC.on = 0; REC.cb = null;
    try { if (REC.sr) REC.sr.abort(); } catch (e) {}
    try { if (REC.mr && REC.mr.state !== 'inactive') REC.mr.stop(); } catch (e) {}
    REC.sr = null; recRelease();
  }
  function recStart(target, cb) {
    recAbort(); G.speak('');
    if (REC.audio) { try { REC.audio.pause(); } catch (e) {} }
    REC.cb = cb; REC.target = target; REC.heard = ''; REC.alts = []; REC.srOk = 0; REC.srErr = ''; REC.url = null; REC.mrDone = 1;
    var md = navigator.mediaDevices, R = SRC();
    function go2(stream) {
      REC.on = 1; cb.state(1);
      if (stream && window.MediaRecorder) {
        REC.stream = stream;
        var mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].filter(function (x) { try { return MediaRecorder.isTypeSupported(x); } catch (e) { return false; } })[0];
        try {
          var mr = REC.mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), ch = [];
          REC.mrDone = 0;
          mr.ondataavailable = function (e) { if (e.data && e.data.size) ch.push(e.data); };
          mr.onstop = function () { if (ch.length) REC.url = URL.createObjectURL(new Blob(ch, { type: mr.mimeType || mime || 'audio/mp4' })); REC.mrDone = 1; recRelease(); };
          mr.start();
        } catch (e) { REC.mr = null; REC.mrDone = 1; recRelease(); }
      } else if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); }
      if (R) {
        try {
          var r = REC.sr = new R();
          r.lang = 'zh-CN'; r.interimResults = true; r.continuous = false; r.maxAlternatives = 4;
          r.onresult = function (e) {
            var best = '', tg = han(REC.target);
            for (var k = 0; k < e.results.length; k++) {
              var res = e.results[k], pick = res[0] ? res[0].transcript : '', ps = -1;
              for (var a = 0; a < res.length; a++) { var sc = lcsMask(tg, han(res[a].transcript)).reduce(function (x, y) { return x + y; }, 0); if (sc > ps) { ps = sc; pick = res[a].transcript; } }
              best += pick;
            }
            REC.heard = best; REC.srOk = 1;
            if (REC.cb && REC.cb.live) REC.cb.live(best);
          };
          r.onerror = function (e) { REC.srErr = e.error || 'err'; };
          r.onend = function () { REC.sr = null; if (REC.on && REC.heard) recStop(); };
          r.start();
        } catch (e) { REC.srErr = 'start'; REC.sr = null; }
      }
      REC.t = setTimeout(recStop, 12000);
    }
    if (md && md.getUserMedia) md.getUserMedia({ audio: true }).then(go2, function (err) {
      if (R && !(err && /NotAllowed|Security/.test(err.name))) go2(null);
      else { REC.cb = null; cb.err(err && /NotAllowed|Security/.test(err.name) ? 'deny' : 'nomic'); }
    });
    else if (R) go2(null);
    else { REC.cb = null; cb.err('nomic'); }
  }
  function recStop() {
    if (!REC.on) return;
    REC.on = 0; clearTimeout(REC.t);
    var cb = REC.cb; if (cb) cb.state(0);
    try { if (REC.sr) REC.sr.stop(); } catch (e) {}
    try { if (REC.mr && REC.mr.state !== 'inactive') REC.mr.stop(); } catch (e) { REC.mrDone = 1; recRelease(); }
    var tries = 0;
    (function fin() {
      if (REC.cb !== cb || !cb) return;
      if ((!REC.mrDone || REC.sr) && tries++ < 8) return setTimeout(fin, 200);
      try { if (REC.sr) REC.sr.abort(); } catch (e) {}
      REC.sr = null; recRelease(); REC.cb = null;
      var tg = han(REC.target), hd = han(REC.heard), mask = hd ? lcsMask(tg, hd) : null;
      var ratio = mask ? mask.reduce(function (x, y) { return x + y; }, 0) / Math.max(tg.length, 1) : 0;
      cb.done({ url: REC.url, heard: REC.heard, scored: !!SRC() && !REC.srErr, ratio: ratio, mask: mask });
    })();
  }
  function recPlay() {
    if (!REC.url) return;
    G.speak('');
    try { if (REC.audio) REC.audio.pause(); REC.audio = new Audio(REC.url); REC.audio.play().catch(function () {}); } catch (e) {}
  }

  /* ---------- nói chuyện ---------- */
  function openTalk(id) {
    var T = TALKS[id]; if (!T) return;
    if (me.en < TALK_COST) {
      G.sfx('bad');
      showCard(['累了', 'lèi le', 'mệt rồi', '😴'], { desc: ['我有点儿累，也有点儿饿。', 'Wǒ yǒudiǎnr lèi, yě yǒudiǎnr è.', 'Mình hơi mệt, cũng hơi đói rồi. Đi ăn hoặc đi ngủ nhé!'], noAct: 1,
        extra: '<button type="button" class="btn sm go" data-enter="phongngu">🛏️ Đi ngủ</button><button type="button" class="btn sm" data-enter="bep">🍳 Xuống bếp</button>' });
      return;
    }
    var P = PEOPLE[T.who] || { n: '?', p: '', vi: '', e: '🙂' };
    var showVi = G.load('pho.vi2', false), mic = G.load('pho.mic', false);
    var sh = $('#sheet'), i = 0, wrongs = 0, spoken = 0, turn = null;
    sh.innerHTML = '<div class="sh-bg" data-x="1"></div><div class="sh-card talk-sh"><div class="sh-grip"></div><div class="sh-hd tk-hd"><span class="tk-ava">' + esc(P.e) + '</span><span class="tk-nm"><b class="zh">' + esc(P.n) + '</b><small>' + esc(P.vi) + '</small></span>' +
      '<button type="button" class="tk-tg mic' + (mic ? ' on' : '') + '" id="tkMic">🎤 <span>Tự nói</span></button><button type="button" class="tk-tg' + (showVi ? ' on' : '') + '" id="tkVi">VN</button><button type="button" class="sh-x" data-x="1" aria-label="Đóng">✕</button></div>' +
      '<div class="sh-body chat' + (showVi ? '' : ' novi') + '" id="tkBody"></div><div class="chat-ft' + (showVi ? '' : ' novi') + '" id="tkFt"></div></div>';
    sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('on'); });
    var body = $('#tkBody'), ft = $('#tkFt');
    function scroll() { setTimeout(function () { body.scrollTop = body.scrollHeight; }, 30); }
    function bubble(who, l, extra) {
      var d = document.createElement('div'); d.className = 'bb ' + who;
      d.innerHTML = (who === 'a' ? '<span class="bb-ava">' + esc(P.e) + '</span>' : '<span class="bb-ava me">' + (window.BM_MASCOT ? BM_MASCOT() : '🥖') + '</span>') +
        '<div class="bb-in" data-say="' + esc(l[0]) + '"><b class="zh">' + esc(l[0]) + '</b><span class="py">' + esc(l[1]) + '</span><span class="vi">' + esc(l[2]) + '</span>' + (extra || '') + '</div>';
      body.appendChild(d); scroll();
    }
    function nextBtn() {
      ft.onclick = null;
      ft.innerHTML = '<button type="button" class="btn pri tk-next" id="tkNext">' + (T.lines[i] ? 'Tiếp ➜' : 'Xong ✓') + '</button>';
      $('#tkNext').onclick = next;
    }
    /* lượt tự nói: chỉ hiện câu mẫu */
    function sayTurn(l, after) {
      turn = function () { sayTurn(l, after); };
      var got = null;
      ft.onclick = null;
      ft.innerHTML = '<div class="say-turn"><div class="st-sam" data-say="' + esc(l[0]) + '"><small>🎤 Bạn nói câu này nhé</small><b class="zh">' + esc(l[0]) + '</b><span class="py">' + esc(l[1]) + '</span><span class="vi">' + esc(l[2]) + '</span></div>' +
        '<div class="rec-row"><button type="button" class="rbtn ls" id="rcL" aria-label="Nghe mẫu">🔊<small>Mẫu</small></button><button type="button" class="rbtn mic" id="rcM" aria-label="Thu âm"><span>🎤</span></button><button type="button" class="rbtn pl" id="rcP" aria-label="Nghe lại mình" disabled>▶️<small>Của mình</small></button></div>' +
        '<div class="rec-res" id="rcR">Chạm 🎤 rồi đọc to</div>' +
        '<button type="button" class="btn tk-next" id="rcN">Bỏ qua ➜</button></div>';
      scroll();
      var mB = $('#rcM'), res = $('#rcR');
      $('#rcL').onclick = function () { if (REC.on) recStop(); G.speak(l[0], 0.8); };
      $('#rcP').onclick = recPlay;
      mB.onclick = function () {
        if (REC.on) return recStop();
        res.className = 'rec-res'; res.textContent = '…';
        recStart(l[0], {
          state: function (on) { mB.classList.toggle('on', !!on); mB.firstChild.textContent = on ? '⏹' : '🎤'; if (on) res.innerHTML = '<span class="rec-dot"></span> Đang nghe… nói xong chạm ⏹'; },
          live: function (t) { res.innerHTML = '<span class="rec-dot"></span> <span class="zh">' + esc(t) + '</span>'; },
          err: function (k) {
            G.sfx('bad'); res.className = 'rec-res bad';
            res.innerHTML = k === 'deny' ? 'Chưa cho dùng micro. Bấm <b>Cho phép</b> khi máy hỏi (iPhone: Cài đặt › Safari › Micrô › Hỏi).' : 'Máy này chưa thu âm được. Bạn cứ đọc to theo câu mẫu nhé 🙂';
          },
          done: function (r) {
            $('#rcP').disabled = !r.url;
            if (r.url) $('#rcP').classList.add('ready');
            var tg = Array.from(l[0]), hz = 0, msg;
            if (r.mask) {
              var stars = r.ratio >= 0.85 ? 3 : r.ratio >= 0.6 ? 2 : r.ratio >= 0.3 ? 1 : 0;
              var hl2 = tg.map(function (c) { if (!/[㐀-鿿]/.test(c)) return esc(c); return '<i class="' + (r.mask[hz++] ? 'ok' : 'no') + '">' + esc(c) + '</i>'; }).join('');
              msg = '<span class="stars">' + '★★★'.slice(0, stars) + '<em>' + '★★★'.slice(stars) + '</em></span><span class="zh hlz">' + hl2 + '</span><small>' + ['Thử lại nha 💪', 'Khá rồi! Chữ xám là máy chưa nghe rõ', 'Hay lắm! 👍', 'Chuẩn quá! 🎉'][stars] + '</small>';
              res.className = 'rec-res ' + (stars >= 2 ? 'good' : 'mid'); G.sfx(stars >= 2 ? 'ok' : 'tap');
              if (stars >= 1) got = 1;
            } else if (r.url) {
              msg = '✓ Đã thu xong. Chạm ▶️ nghe giọng mình, rồi 🔊 nghe mẫu để so sánh nhé.'; res.className = 'rec-res good'; got = 1;
            } else {
              msg = 'Chưa nghe rõ, nói to và gần máy hơn chút nhé 🙂'; res.className = 'rec-res mid';
            }
            res.innerHTML = msg;
            if (got) { var n = $('#rcN'); n.textContent = 'Tiếp ➜'; n.classList.add('pri'); }
          }
        });
      };
      $('#rcN').onclick = function () {
        recAbort(); turn = null;
        if (got) spoken++;
        bubble('b', l, got ? '<span class="bb-mic">🎤</span>' : ''); i++;
        after();
      };
    }
    function next() {
      turn = null;
      var l = T.lines[i];
      if (!l) return finish();
      if (l[0] === '?') {
        var right = l[1].filter(function (o) { return o[3]; })[0];
        if (mic) return sayTurn(right, next);
        turn = function () { i = i; next(); };
        var ops = G.shuffle(l[1]);
        ft.innerHTML = '<p class="ch-q">Bạn trả lời thế nào?</p><div class="choices">' + ops.map(function (op, k) {
          return '<button type="button" class="choice" data-k="' + k + '"><b class="zh">' + esc(op[0]) + '</b><span class="py">' + esc(op[1]) + '</span><em class="cvi">' + esc(op[2]) + '</em></button>';
        }).join('') + '</div>';
        ft.onclick = function (e) {
          var c = e.target.closest('.choice'); if (!c || c.classList.contains('bad')) return;
          var op = ops[+c.dataset.k];
          if (op[3]) { G.sfx('ok'); turn = null; bubble('b', op); G.speak(op[0]); i++; ft.onclick = null; setTimeout(next, 120); }
          else { wrongs++; G.sfx('bad'); c.classList.add('bad'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
        };
        scroll();
        return;
      }
      if (l[0] === 'b' && mic) return sayTurn([l[1], l[2], l[3]], next);
      bubble(l[0], [l[1], l[2], l[3]]); G.speak(l[1]);
      i++;
      nextBtn();
    }
    function finish() {
      var first = !me.talks[id];
      me.talks[id] = (me.talks[id] || 0) + 1;
      me.en = Math.max(0, me.en - TALK_COST);
      var xp = (first ? 15 : 3) + (wrongs ? 0 : 3) + spoken * 2, coin = first ? 10 : 1;
      saveMe();
      var stp = curStep(), s = me.story && storyById(me.story), storyMsg = '', storyDone = false;
      if (stp && stp.talk === id && stp.scene === st.scene) {
        me.step++;
        if (me.step >= s.steps.length) { storyDone = true; me.stories[s.id] = (me.stories[s.id] || 0) + 1; me.story = null; me.step = 0; }
        else storyMsg = '<p class="tk-nx">➜ ' + esc(s.steps[me.step].goal) + '</p>';
        saveMe();
      }
      gain(xp, coin, true);
      if (storyDone) gain(40, 30, true);
      ft.onclick = null;
      ft.innerHTML = '<div class="tk-done"><b>🎉 Xong rồi!</b><span>+' + xp + ' XP · +' + coin + ' 🪙' + (spoken ? ' · 🎤 ' + spoken + ' câu' : '') + '</span>' + storyMsg +
        (storyDone ? '<p class="tk-nx big">' + s.emo + ' Hoàn thành “' + esc(s.name) + '”! +40 XP · +30 🪙</p>' : '') +
        '<div class="tk-bt"><button type="button" class="btn" id="tkAgain">🔁 Nghe lại</button><button type="button" class="btn pri" id="tkOk">Xong ✓</button></div></div>';
      scroll();
      G.sfx(storyDone ? 'win' : 'match');
      $('#tkOk').onclick = function () { closeSheet(); };
      $('#tkAgain').onclick = function () { replayAll(); };
      st.afterTalk = function () {
        go(st.scene, null);
        fx('+' + (xp + (storyDone ? 40 : 0)) + ' XP  +' + (coin + (storyDone ? 30 : 0)) + '🪙');
        if (storyDone) G.toast(s.emo + ' Hoàn thành “' + s.name + '”! Mở 📜 chọn câu chuyện mới nhé', 3400);
        else if (storyMsg) G.toast('➜ ' + s.steps[me.step].goal, 3000);
      };
    }
    function replayAll() {
      var lines = G.$$('.bb-in', body).map(function (x) { return x.dataset.say; }), k = 0;
      (function nx() { if (k < lines.length && !sh.hidden) G.speak(lines[k++], 0.85, nx); })();
    }
    sh.onclick = function (e) {
      var b = e.target.closest('[data-x],[data-say],#tkVi,#tkMic');
      if (!b) return;
      if (b.id === 'tkVi') { showVi = !showVi; G.save('pho.vi2', showVi); b.classList.toggle('on', showVi); body.classList.toggle('novi', !showVi); ft.classList.toggle('novi', !showVi); return; }
      if (b.id === 'tkMic') {
        mic = !mic; G.save('pho.mic', mic); b.classList.toggle('on', mic); G.sfx('tap');
        G.toast(mic ? '🎤 Tự nói: tới lượt bạn thì đọc to câu mẫu' : '👆 Chọn câu trả lời', 2200);
        if (turn) { recAbort(); turn(); }
        return;
      }
      if (b.dataset.say) { e.stopPropagation(); if (b.closest('#tkFt') && REC.on) return; return G.speak(b.dataset.say, 0.85); }
      closeSheet();
    };
    G.sfx('pop');
    next();
  }

  function closeSheet() {
    var sh = $('#sheet'); if (sh.hidden) return;
    recAbort();
    sh.classList.remove('on'); G.speak('');
    setTimeout(function () { sh.hidden = true; sh.innerHTML = ''; sh.onclick = null; }, 220);
    if (st && st.afterTalk) { var f = st.afterTalk; st.afterTalk = null; f(); }
    if (st && st.lvPending) { var L = st.lvPending; st.lvPending = 0; setTimeout(function () { levelUp(L); }, 450); }
  }
  function openSheet(titleHtml, bodyHtml, onClick) {
    var sh = $('#sheet');
    sh.innerHTML = '<div class="sh-bg" data-x="1"></div><div class="sh-card"><div class="sh-grip"></div><div class="sh-hd"><b>' + titleHtml + '</b><button type="button" class="sh-x" data-x="1" aria-label="Đóng">✕</button></div><div class="sh-body">' + bodyHtml + '</div></div>';
    sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('on'); });
    sh.onclick = function (e) {
      if (e.target.closest('[data-x]')) return closeSheet();
      onClick(e);
    };
  }

  /* ---------- nhiệm vụ ---------- */
  function tasks() {
    var meets = [];
    ORDER.forEach(function (sid) { W.scenes[sid].o.forEach(function (o) { if (o[7]) meets.push([sid, o]); }); });
    var seen = seenSet();
    function draw() {
      var h = '<p class="pnote">Làm câu chuyện, nói chuyện với mọi người và khám phá hết từng nơi để nhận XP, xu 🪙 và lên cấp.</p>';
      h += '<div class="tk-sec">📖 Câu chuyện <small>' + Object.keys(me.stories).length + '/' + STORIES.length + ' đã xong</small></div><div class="stories">';
      STORIES.forEach(function (s) {
        var on = me.story === s.id, done = me.stories[s.id];
        h += '<div class="story' + (on ? ' on' : '') + (done ? ' done' : '') + '"><span class="sto-e">' + s.emo + '</span><div class="sto-tx"><b>' + esc(s.name) + (done ? ' ✅' : '') + '</b><small class="zh">' + esc(s.zh) + '</small>' +
          '<span class="dots">' + s.steps.map(function (x, k) { return '<i class="' + (on && k < me.step ? 'ok' : on && k === me.step ? 'cur' : done && !on ? 'ok' : '') + '"></i>'; }).join('') + '</span>' +
          '<em>' + s.steps.length + ' bước · ' + s.steps.map(function (x) { return W.scenes[x.scene].emo; }).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(' ') + '</em></div>' +
          '<button type="button" class="btn sm ' + (on ? '' : 'pri') + '" data-st="' + s.id + '">' + (on ? 'Đang làm ➜' : done ? '🔁 Chơi lại' : '▶ Bắt đầu') + '</button></div>';
      });
      h += '</div><div class="tk-sec">💬 Gặp gỡ <small>' + meets.filter(function (m) { return me.talks[m[1][7]]; }).length + '/' + meets.length + ' người</small></div><div class="meets">';
      meets.forEach(function (m) {
        var P = PEOPLE[(TALKS[m[1][7]] || {}).who] || {}, ok = me.talks[m[1][7]];
        h += '<button type="button" class="meet' + (ok ? ' ok' : '') + '" data-mg="' + m[0] + '"><span class="em">' + esc(m[1][3]) + '</span><b class="zh">' + esc(P.n || m[1][0]) + '</b><small>' + esc(W.scenes[m[0]].sh || W.scenes[m[0]].vi.split(',')[0]) + '</small>' + (ok ? '<i>✅</i>' : '') + '</button>';
      });
      h += '</div><div class="tk-sec">🗺️ Khám phá <small>' + Object.keys(me.ex).length + '/' + ORDER.length + ' nơi · chạm hết đồ ở một nơi +20 XP</small></div><div class="meets">';
      ORDER.forEach(function (sid) {
        var sc = W.scenes[sid], n = (seen[sid] || []).length;
        h += '<button type="button" class="meet' + (me.ex[sid] ? ' ok' : '') + '" data-mg="' + sid + '"><span class="em">' + sc.emo + '</span><b>' + esc(sc.sh || sc.vi.split(',')[0]) + '</b><small>' + n + '/' + sc.o.length + '</small>' + (me.ex[sid] ? '<i>✅</i>' : '') + '</button>';
      });
      return h + '</div>';
    }
    openSheet('📜 Nhiệm vụ', draw(), function (e) {
      var b = e.target.closest('[data-st],[data-mg]'); if (!b) return;
      if (b.dataset.st) { if (me.story === b.dataset.st) { closeSheet(); var s = curStep(); if (s) go(s.scene, null); return; } return startStory(b.dataset.st); }
      closeSheet(); G.sfx('pop'); go(b.dataset.mg, null);
    });
  }

  /* ---------- Bánh Mì của mình: chỉ số + tủ đồ ---------- */
  function profile() {
    function draw() {
      var li = lvInfo(me.xp), t = title(li.L);
      var h = '<div class="prof"><div class="prof-ava">' + mascot() + '</div><div class="prof-tx"><b>Cấp ' + li.L + ' · <span class="zh">' + t[0] + '</span></b><small>' + t[1] + ' · ' + t[2] + '</small>' +
        '<span class="pbar"><i style="width:' + Math.round(li.cur / li.need * 100) + '%"></i></span><small>' + li.cur + '/' + li.need + ' XP để lên cấp ' + (li.L + 1) + '</small>' +
        '<span class="prow"><span>🪙 <b>' + me.coin + '</b> xu</span><span>⚡ <b>' + me.en + '</b>/100</span></span></div></div>' +
        '<div class="tips"><b>Cách nuôi Bánh Mì</b><span>🔎 Chạm đồ mới: +2 XP</span><span>💬 Nói chuyện lần đầu: +15 XP, +10 🪙</span><span>📖 Xong một câu chuyện: +40 XP, +30 🪙</span><span>🗺️ Khám phá hết một nơi: +20 XP, +10 🪙</span><span>⚡ Mỗi lần nói chuyện tốn ' + TALK_COST + ' năng lượng. Ăn ở bếp (miễn phí), nhà hàng, quán cà phê hoặc lên giường ngủ để hồi lại.</span></div>' +
        '<div class="tk-sec">👗 Tủ đồ <small>chạm để mua, mặc hoặc cởi · học luôn tên tiếng Trung</small></div><div class="wardrobe">';
      WEAR.forEach(function (w) {
        var own = me.own.indexOf(w[0]) >= 0, on = me.wear[w[7]] === w[0], lock = li.L < w[6];
        h += '<button type="button" class="wd' + (on ? ' on' : '') + (lock ? ' lock' : '') + '" data-w="' + w[0] + '"><span class="em">' + w[1] + '</span><b class="zh">' + w[2] + '</b><span class="py">' + w[3] + '</span><small>' + w[4] + '</small>' +
          '<em>' + (on ? '✓ Đang mặc' : own ? 'Mặc' : lock ? '🔒 Cấp ' + w[6] : '🪙 ' + w[5]) + '</em></button>';
      });
      return h + '</div>';
    }
    openSheet('🥖 Bánh Mì của mình', draw(), function (e) {
      var b = e.target.closest('[data-w]'); if (!b) return;
      var w = WEAR.filter(function (x) { return x[0] === b.dataset.w; })[0], li = lvInfo(me.xp);
      G.speak(w[2]);
      if (li.L < w[6]) { G.sfx('bad'); return G.toast('Lên cấp ' + w[6] + ' mới mở được ' + w[4] + ' nha!'); }
      if (me.own.indexOf(w[0]) < 0) {
        if (me.coin < w[5]) { G.sfx('bad'); return G.toast('Chưa đủ xu 🪙 (cần ' + w[5] + '). Nói chuyện, làm nhiệm vụ để kiếm thêm!', 2800); }
        me.coin -= w[5]; me.own.push(w[0]); me.wear[w[7]] = w[0]; G.sfx('win'); G.toast('Đã mua ' + w[2] + ' (' + w[3] + ') · ' + w[4] + ' ✨');
      } else if (me.wear[w[7]] === w[0]) { delete me.wear[w[7]]; G.sfx('tap'); }
      else { me.wear[w[7]] = w[0]; G.sfx('ok'); }
      saveMe(); hud();
      $('#sheet .sh-body').innerHTML = draw();
    });
  }

  /* ---------- chế độ tìm đồ ---------- */
  function newQuest() {
    var sc = W.scenes[st.scene], s = st.qDone = st.qDone || {};
    var pool = sc.o.filter(function (o) { return (s[st.scene] || []).indexOf(o[0]) < 0; });
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
    if (ok) {
      st.score += 10 + st.streak * 2; st.streak++;
      G.sfx('match'); if (markSeen(st.scene, o[0])) exploreCheck(); mapBar();
      (st.qDone[st.scene] = st.qDone[st.scene] || []).push(o[0]);
      G.setBest('pho', st.score);
      gain(2, 1);
      showCard(o, { wordOnly: 1, noAct: 1, extra: '<button type="button" class="btn sm go" id="qNext">Tìm tiếp ➜</button>' });
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

  /* ---------- sổ từ + sổ câu ---------- */
  function book() {
    var tab = 'w';
    function draw() {
      var s = seenSet(), total = 0, got = 0, body;
      ORDER.forEach(function (id) { total += W.scenes[id].o.length; got += (s[id] || []).length; });
      var seg = '<div class="seg2"><button type="button" data-tab="w" class="' + (tab === 'w' ? 'on' : '') + '">🔤 Từ · ' + got + '/' + total + '</button><button type="button" data-tab="s" class="' + (tab === 's' ? 'on' : '') + '">💬 Câu</button></div>';
      if (tab === 'w') {
        body = '<p class="pnote">Đồ đã chạm được tô màu. Chạm từ bất kỳ để nghe.</p>' + ORDER.map(function (id) {
          var sc = W.scenes[id], seen = s[id] || [];
          return '<div class="bk-h">' + sc.emo + ' <b class="zh">' + esc(sc.zh) + '</b> ' + esc(sc.vi) + ' <small>' + seen.length + '/' + sc.o.length + '</small></div><div class="bk">' + sc.o.map(function (o) {
            var k = seen.indexOf(o[0]) >= 0;
            return '<button type="button" class="bk-w' + (k ? ' ok' : '') + '" data-say="' + esc(o[0]) + '">' + G.art(o[3]) + '<b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><span class="vi">' + esc(o[2]) + '</span></button>';
          }).join('') + '</div>';
        }).join('');
      } else {
        var n = 0;
        body = '<p class="pnote">Câu mô tả của đồ đã chạm và các cuộc nói chuyện đã làm. Chạm câu để nghe.</p>';
        var talkIds = Object.keys(me.talks).filter(function (k) { return TALKS[k]; });
        if (talkIds.length) {
          body += '<div class="bk-h">💬 <b>Hội thoại đã học</b> <small>' + talkIds.length + '</small></div>';
          talkIds.forEach(function (k) {
            var T = TALKS[k], P = PEOPLE[T.who] || {};
            body += '<details class="bk-talk"><summary>' + esc(P.e || '') + ' <b class="zh">' + esc(P.n || '') + '</b> <small>' + esc(P.vi || '') + '</small></summary>' + T.lines.map(function (l) {
              var x = l[0] === '?' ? l[1].filter(function (o) { return o[3]; })[0] : [l[1], l[2], l[3]];
              return '<button type="button" class="sen ' + (l[0] === 'a' ? 'a' : 'b') + '" data-say="' + esc(x[0]) + '"><b class="zh">' + esc(x[0]) + '</b><span class="py">' + esc(x[1]) + '</span><span class="vi">' + esc(x[2]) + '</span></button>';
            }).join('') + '</details>';
          });
        }
        ORDER.forEach(function (id) {
          var sc = W.scenes[id], seen = (s[id] || []).filter(function (z) { return (DESC[id] || {})[z]; });
          if (!seen.length) return;
          body += '<div class="bk-h">' + sc.emo + ' <b class="zh">' + esc(sc.zh) + '</b> ' + esc(sc.vi) + '</div>';
          seen.forEach(function (z) { var d = DESC[id][z]; n++; body += '<button type="button" class="sen" data-say="' + esc(d[0]) + '"><b class="zh">' + hl(d[0], z) + '</b><span class="py">' + esc(d[1]) + '</span><span class="vi">' + esc(d[2]) + '</span></button>'; });
        });
        if (!n && !talkIds.length) body += '<div class="empty-s">Chưa có câu nào. Đi dạo, chạm đồ vật và nói chuyện với mọi người nhé! 🚶</div>';
      }
      return seg + body;
    }
    openSheet('📒 Sổ từ dạo phố', draw(), function (e) {
      var b = e.target.closest('[data-tab],[data-say]'); if (!b) return;
      if (b.dataset.tab) { tab = b.dataset.tab; $('#sheet .sh-body').innerHTML = draw(); $('#sheet .sh-body').scrollTop = 0; return; }
      G.speak(b.dataset.say);
    });
  }

  function stop() {
    recAbort();
    if (!st) return;
    clearTimeout(st.walkT);
    if (st.keyH) document.removeEventListener('keydown', st.keyH);
    var sh = $('#sheet'); if (sh && !sh.hidden) { sh.hidden = true; sh.innerHTML = ''; sh.classList.remove('on'); sh.onclick = null; }
    st = null;
  }

  G.games.pho = { start: start, stop: stop, noData: true, frameOpts: { noCat: true, sub: 'Nuôi Bánh Mì · 21 nơi · nói chuyện · nhiệm vụ' } };
})();
