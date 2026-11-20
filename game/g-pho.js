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
      '<span class="me-st" id="hCoin" title="Xu">🪙 <b></b></span><span class="me-st en" id="hEn" title="Năng lượng">⚡<span class="en-bar"><i></i></span></span>' +
      '<button type="button" class="chipb task" id="pTask">📜 <span>Nhiệm vụ</span></button></div>' +
      '<div class="pho-top"><div class="seg"><button type="button" data-md="free" class="on">🔎 Khám phá</button><button type="button" data-md="find">🎯 Tìm đồ</button></div>' +
      '<button type="button" class="chipb" id="pBook">📒 Sổ từ</button></div>' +
      '<div class="story-bn" id="pStory" hidden></div>' +
      '<div class="pmap" id="pMap"></div>' +
      '<div class="quest" id="pQuest" hidden></div>' +
      '<div class="stage-wrap"><div class="stage" id="stage"></div></div>' +
      '<p class="hint-line" id="pHint"></p>';
    el.querySelector('.seg').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      G.$$('.seg button', el).forEach(function (x) { x.classList.toggle('on', x === b); });
      st.mode = b.dataset.md; st.score = 0; st.streak = 0; G.sfx('tap');
      if (st.mode === 'find') newQuest(); else { $('#pQuest').hidden = true; }
      hint();
    };
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
    hud(); hint();
    go(st.scene, null);
    if (!G.load('pho.intro', 0)) { G.save('pho.intro', 1); setTimeout(function () { if (st) G.toast('Chào mừng! Chạm 📜 Nhiệm vụ để bắt đầu một câu chuyện nhé ✨', 3600); }, 900); }
  }

  function hint() {
    var h = $('#pHint'); if (!h) return;
    h.textContent = st.mode === 'find' ? 'Nghe và đọc chữ ở trên, rồi chạm đúng đồ vật đó nhé. Chạm 🔊 để nghe lại.'
      : 'Chạm đồ vật để nghe từ và câu mô tả. Người có 💬 thì nói chuyện được. Chạm biển ◀ ▶ hoặc toà nhà để sang chỗ khác.';
  }

  function hud() {
    if (!st) return;
    var li = lvInfo(me.xp);
    $('#hLv').textContent = 'Cấp ' + li.L + ' · ' + title(li.L)[0];
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

  function mapBar() {
    var s = seenSet(), tgt = curStep();
    $('#pMap').innerHTML = ORDER.map(function (id) {
      var sc = W.scenes[id], n = (s[id] || []).length, tot = sc.o.length;
      return '<button type="button" data-go="' + id + '" class="' + (id === st.scene ? 'on' : '') + (tgt && tgt.scene === id ? ' tg' : '') + '"><i>' + sc.emo + '</i><span>' + esc(sc.sh || sc.vi.split(',')[0]) + '</span><small>' + (n >= tot ? '✅' : n + '/' + tot) + '</small></button>';
    }).join('');
    $('#pMap').onclick = function (e) { var b = e.target.closest('button'); if (b) { G.sfx('pop'); go(b.dataset.go, null); } };
    var on = $('#pMap .on'); if (on) { var m = $('#pMap'); m.scrollLeft = on.offsetLeft - m.clientWidth / 2 + on.clientWidth / 2; }
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
    var h = '<div class="bgl"></div><div class="amb">' + (AMB[sc.bg] || '') + '</div><div class="sc-name"><b class="zh">' + esc(sc.zh) + '</b><span>' + esc(sc.p) + ' · ' + esc(sc.vi) + '</span><button type="button" class="say" data-say="' + esc(sc.zh) + '" aria-label="Nghe">🔊</button></div>';
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
      h += '<button type="button" class="door d-' + side + (isT ? ' tg' : '') + '" data-go="' + d[0] + '" style="left:' + d[1] + '%;top:' + d[2] + '%"><span class="zh">' + esc(d[3]) + '</span><small>' + esc(t.sh || t.vi.split(',')[0]) + '</small></button>';
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
    if (tk) btns += '<button type="button" class="btn sm talkb' + (opt.isT ? ' hot' : '') + '" data-talk="' + tk + '">' + (opt.isT ? '❗ ' : '💬 ') + 'Nói chuyện</button>';
    if (eat) { var pr = HOME[st.scene] ? 0 : eat[0]; btns += '<button type="button" class="btn sm eatb" data-eat="' + esc(o[0]) + '">' + (eat[2] ? '🥤 Uống' : '🍽️ Ăn') + ' <small>' + (pr ? pr + '🪙 · ' : '') + '+' + eat[1] + '⚡</small></button>'; }
    if (rest) btns += '<button type="button" class="btn sm eatb" data-rest="' + esc(o[0]) + '">' + rest[4] + ' <small>+' + rest[0] + '⚡</small></button>';
    if (opt.extra) btns += opt.extra;
    c.innerHTML = '<button type="button" class="pc-x" aria-label="Đóng">✕</button><div class="pc-art">' + G.art(o[3]) + '</div><div class="pc-tx"><b class="zh">' + esc(o[0]) + '</b><span class="py">' + esc(o[1]) + '</span><span class="vi">' + esc(o[2]) + '</span></div>' +
      '<button type="button" class="pc-say" data-say="' + esc(o[0]) + '" aria-label="Nghe từ">🔊</button>' +
      (d ? '<div class="pc-sen" data-sen="1"><b class="zh">' + hl(d[0], o[0]) + '</b><span class="py">' + esc(d[1]) + '</span><span class="vi">' + esc(d[2]) + '</span><span class="sen-btns"><i data-sen="1">🔊 Câu</i><i data-slow="' + esc(d[0]) + '">🐢 Chậm</i></span></div>' : '') +
      (btns ? '<div class="pc-btns">' + btns + '</div>' : '');
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
    if (b && b.dataset.sen) { if (st.cardSen) G.speak(st.cardSen); return; }
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
    bn.innerHTML = '<i>' + s.emo + '</i><div><small>' + esc(s.name) + ' · Bước ' + (me.step + 1) + '/' + s.steps.length + '</small><b>' + esc(stp.goal) + '</b></div>' +
      (here ? '<span class="sb-here">❗ ở đây</span>' : '<button type="button" class="btn sm pri" id="sbGo">Đi ➜</button>') + '<button type="button" class="sb-x" id="sbX" aria-label="Dừng câu chuyện">✕</button>';
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

  /* ---------- nói chuyện ---------- */
  function openTalk(id) {
    var T = TALKS[id]; if (!T) return;
    if (me.en < TALK_COST) {
      G.sfx('bad');
      showCard(['累了', 'lèi le', 'mệt rồi', '😴'], { desc: ['我有点儿累，也有点儿饿。', 'Wǒ yǒudiǎnr lèi, yě yǒudiǎnr è.', 'Mình hơi mệt, cũng hơi đói rồi. Đi ăn (bếp, nhà hàng, quán cà phê) hoặc lên giường ngủ nhé!'], noAct: 1,
        extra: '<button type="button" class="btn sm go" data-enter="phongngu">🛏️ Về phòng ngủ</button><button type="button" class="btn sm" data-enter="bep">🍳 Xuống bếp</button>' });
      return;
    }
    var P = PEOPLE[T.who] || { n: '?', p: '', vi: '', e: '🙂' };
    var showVi = G.load('pho.vi', true);
    var sh = $('#sheet'), i = 0, wrongs = 0;
    sh.innerHTML = '<div class="sh-bg" data-x="1"></div><div class="sh-card talk-sh"><div class="sh-grip"></div><div class="sh-hd tk-hd"><span class="tk-ava">' + esc(P.e) + '</span><span class="tk-nm"><b class="zh">' + esc(P.n) + '</b><small>' + esc(P.p) + ' · ' + esc(P.vi) + '</small></span>' +
      '<button type="button" class="tk-vi' + (showVi ? ' on' : '') + '" id="tkVi">Nghĩa</button><button type="button" class="sh-x" data-x="1" aria-label="Đóng">✕</button></div>' +
      '<div class="sh-body chat' + (showVi ? '' : ' novi') + '" id="tkBody"></div><div class="chat-ft" id="tkFt"></div></div>';
    sh.hidden = false; requestAnimationFrame(function () { sh.classList.add('on'); });
    var body = $('#tkBody'), ft = $('#tkFt');
    function bubble(who, l) {
      var d = document.createElement('div'); d.className = 'bb ' + who;
      d.innerHTML = (who === 'a' ? '<span class="bb-ava">' + esc(P.e) + '</span>' : '<span class="bb-ava me">' + (window.BM_MASCOT ? BM_MASCOT() : '🥖') + '</span>') +
        '<div class="bb-in" data-say="' + esc(l[0]) + '"><b class="zh">' + esc(l[0]) + '</b><span class="py">' + esc(l[1]) + '</span><span class="vi">' + esc(l[2]) + '</span><span class="bb-btn"><i data-say="' + esc(l[0]) + '">🔊</i><i data-slow="' + esc(l[0]) + '">🐢</i></span></div>';
      body.appendChild(d);
      setTimeout(function () { body.scrollTop = body.scrollHeight; }, 30);
    }
    function next() {
      var l = T.lines[i];
      if (!l) return finish();
      if (l[0] === '?') {
        var ops = G.shuffle(l[1]);
        ft.innerHTML = '<p class="ch-q">Bạn trả lời thế nào?</p><div class="choices">' + ops.map(function (op, k) {
          return '<button type="button" class="choice" data-k="' + k + '"><b class="zh">' + esc(op[0]) + '</b><span class="py">' + esc(op[1]) + '</span><em class="cvi">' + esc(op[2]) + '</em></button>';
        }).join('') + '</div>';
        ft.onclick = function (e) {
          var c = e.target.closest('.choice'); if (!c || c.classList.contains('bad')) return;
          var op = ops[+c.dataset.k];
          if (op[3]) { G.sfx('ok'); bubble('b', op); G.speak(op[0]); i++; ft.onclick = null; setTimeout(next, 120); }
          else { wrongs++; G.sfx('bad'); c.classList.add('bad'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
        };
        setTimeout(function () { body.scrollTop = body.scrollHeight; }, 30);
        return;
      }
      bubble(l[0], [l[1], l[2], l[3]]); G.speak(l[1]);
      i++;
      ft.onclick = null;
      ft.innerHTML = '<button type="button" class="btn pri tk-next" id="tkNext">' + (T.lines[i] ? 'Tiếp ➜' : 'Xong ✓') + '</button>';
      $('#tkNext').onclick = next;
    }
    function finish() {
      var first = !me.talks[id];
      me.talks[id] = (me.talks[id] || 0) + 1;
      me.en = Math.max(0, me.en - TALK_COST);
      var xp = (first ? 15 : 3) + (wrongs ? 0 : 3), coin = first ? 10 : 1;
      saveMe();
      var stp = curStep(), s = me.story && storyById(me.story), storyMsg = '', storyDone = false;
      if (stp && stp.talk === id && stp.scene === st.scene) {
        me.step++;
        if (me.step >= s.steps.length) { storyDone = true; me.stories[s.id] = (me.stories[s.id] || 0) + 1; me.story = null; me.step = 0; }
        else storyMsg = '<p class="tk-nx">➜ Bước tiếp: <b>' + esc(s.steps[me.step].goal) + '</b></p>';
        saveMe();
      }
      gain(xp, coin, true);
      if (storyDone) gain(40, 30, true);
      ft.onclick = null;
      ft.innerHTML = '<div class="tk-done"><b>🎉 Nói chuyện xong!</b><span>+' + xp + ' XP · +' + coin + ' 🪙 · −' + TALK_COST + ' ⚡' + (!wrongs ? ' · Không sai câu nào 👏' : '') + '</span>' + storyMsg +
        (storyDone ? '<p class="tk-nx big">' + s.emo + ' Hoàn thành câu chuyện “' + esc(s.name) + '”! +40 XP · +30 🪙</p>' : '') +
        '<div class="tk-bt"><button type="button" class="btn" id="tkAgain">🔁 Nghe lại cả bài</button><button type="button" class="btn pri" id="tkOk">Xong ✓</button></div></div>';
      setTimeout(function () { body.scrollTop = body.scrollHeight; }, 30);
      G.sfx(storyDone ? 'win' : 'match');
      $('#tkOk').onclick = function () { closeSheet(); };
      $('#tkAgain').onclick = function () { replayAll(); };
      st.afterTalk = function () {
        go(st.scene, null);
        fx('+' + (xp + (storyDone ? 40 : 0)) + ' XP  +' + (coin + (storyDone ? 30 : 0)) + '🪙');
        if (storyDone) G.toast(s.emo + ' Hoàn thành “' + s.name + '”! Mở 📜 Nhiệm vụ chọn câu chuyện mới nhé', 3400);
        else if (storyMsg) G.toast('➜ ' + s.steps[me.step].goal, 3000);
      };
    }
    function replayAll() {
      var lines = G.$$('.bb-in', body).map(function (x) { return x.dataset.say; }), k = 0;
      (function nx() { if (k < lines.length && !sh.hidden) G.speak(lines[k++], 0.85, nx); })();
    }
    sh.onclick = function (e) {
      var b = e.target.closest('[data-x],[data-say],[data-slow],#tkVi');
      if (!b) return;
      if (b.id === 'tkVi') { showVi = !showVi; G.save('pho.vi', showVi); b.classList.toggle('on', showVi); body.classList.toggle('novi', !showVi); return; }
      if (b.dataset.slow) { e.stopPropagation(); return G.speak(b.dataset.slow, 0.55); }
      if (b.dataset.say) { e.stopPropagation(); return G.speak(b.dataset.say); }
      closeSheet();
    };
    G.sfx('pop');
    next();
  }

  function closeSheet() {
    var sh = $('#sheet'); if (sh.hidden) return;
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
    if (!st) return;
    clearTimeout(st.walkT);
    if (st.keyH) document.removeEventListener('keydown', st.keyH);
    var sh = $('#sheet'); if (sh && !sh.hidden) { sh.hidden = true; sh.innerHTML = ''; sh.classList.remove('on'); sh.onclick = null; }
    st = null;
  }

  G.games.pho = { start: start, stop: stop, noData: true, frameOpts: { noCat: true, sub: 'Nuôi Bánh Mì · 21 nơi · nói chuyện · nhiệm vụ' } };
})();
