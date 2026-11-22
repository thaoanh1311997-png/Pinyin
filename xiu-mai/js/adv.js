/* Xíu Mại: "Nâng cao" path for older kids (long dialogues, more words, sentence patterns, 3 tasks)
   + short dialogue on each basic stop. Data: window.XM_TALK (tools/talk*.txt → tools/talk.py). */
(function () {
  'use strict';
  const X = window.XM, G = window.XMX, TALK = window.XM_TALK || {};
  if (!X || !G) return;
  const { $, esc, say, toast, cheer, IMG, ALL, LS, addStar, setTabs, bar, view, starPill, go, wsrc } = X;
  const STOPS = G.STOPS.slice(0, G.BASE);
  const app = document.getElementById('app');
  const W = n => IMG('w/' + n);
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const SP = { M: ['👩', 'Mẹ', 1.05], K: ['🧒', 'Bé', 1.45], G: ['👵', 'Bà', 0.95], P: ['👴', 'Ông', 0.75], T: ['👩‍🏫', 'Cô giáo', 1.1], D: ['🧑‍⚕️', 'Bác sĩ', 0.85], N: ['👩‍⚕️', 'Nha sĩ', 1.0], F: ['👧', 'Bạn', 1.35] };
  const sp = c => SP[c] || ['🙂', '', 1.1];
  const sayAs = (c, t, rate) => say(t, { pitch: sp(c)[2], rate });
  const TASKS = [['l', '👂', 'Nghe hiểu', 'Nghe câu, chọn câu đúng'], ['s', '🗣️', 'Nói', 'Nói phần của bé'], ['r', '📖', 'Đọc hiểu', 'Đọc câu, chọn nghĩa']];
  const ga = () => LS.get('gtA', {});
  const starsA = i => { const g = ga()[i] || {}; return ['l', 's', 'r'].filter(t => g[t]).length; };
  const openA = i => i === 0 || starsA(i - 1) >= 3;
  const T = i => TALK[String(i + 1)];
  const norm = x => x.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- dialogue block (shared) ---------- */
  function dlgHTML(lines, id) {
    return `<div class="dlg" id="${id}">${lines.map((l, k) => `<button class="dl ${l[0] === 'K' ? 'me' : ''}" data-k="${k}"><span class="av" title="${sp(l[0])[1]}">${sp(l[0])[0]}</span><span class="tx"><b>${esc(l[1])}</b><small>${esc(l[2])}</small></span></button>`).join('')}</div>`;
  }
  let playing = 0;
  function bindDlg(root, lines) {
    root.querySelectorAll('.dl').forEach(b => b.onclick = () => { playing++; mark(root, +b.dataset.k); sayAs(lines[b.dataset.k][0], lines[b.dataset.k][1]); });
  }
  function mark(root, k) { root.querySelectorAll('.dl').forEach((b, j) => b.classList.toggle('on', j === k)); const b = root.querySelectorAll('.dl')[k]; if (b) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  async function playAll(root, lines, opt = {}) {
    const my = ++playing;
    for (let k = 0; k < lines.length; k++) {
      if (my !== playing || !root.isConnected) return;
      mark(root, k);
      if (opt.role && lines[k][0] === 'K') {
        const ok = await waitTurn(root, lines[k]); if (!ok || my !== playing) return;
      } else await sayAs(lines[k][0], lines[k][1], opt.rate);
      await new Promise(r => setTimeout(r, 380));
    }
    if (my === playing) { mark(root, -1); if (opt.role) { cheer('Great talking!'); } }
  }
  function waitTurn(root, l) {
    return new Promise(res => {
      const bx = document.createElement('div'); bx.className = 'turn';
      bx.innerHTML = `<b>🧒 Tới lượt bé nói!</b><span>${esc(l[1])}</span><div><button class="btn alt" data-a="h">🔊 Gợi ý</button><button class="btn yes" data-a="n">Bé nói rồi ▶</button></div>`;
      document.body.appendChild(bx);
      const my = playing;
      const end = v => { bx.remove(); clearInterval(iv); res(v); };
      const iv = setInterval(() => { if (my !== playing || !root.isConnected) end(false); }, 300);
      bx.querySelector('[data-a=h]').onclick = () => sayAs('K', l[1]);
      bx.querySelector('[data-a=n]').onclick = () => end(true);
    });
  }
  function dlgControls(id, role) {
    return `<div class="dctl"><button class="btn" data-p="${id}">▶ Nghe cả bài</button><button class="btn alt" data-s="${id}">🐢 Chậm</button>${role ? `<button class="btn rose" data-r="${id}">🎭 Bé đóng vai</button>` : ''}<button class="btn alt vi" data-v="${id}">Ẩn tiếng Việt</button></div>`;
  }
  function bindControls(lines) {
    app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => playAll($('#' + b.dataset.p), lines));
    app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => playAll($('#' + b.dataset.s), lines, { rate: 0.6 }));
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { toast('Xíu Mại nói phần người lớn, bé nói phần 🧒 nhé!'); playAll($('#' + b.dataset.r), lines, { role: 1 }); });
    app.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const d = $('#' + b.dataset.v); d.classList.toggle('novi'); b.textContent = d.classList.contains('novi') ? 'Hiện tiếng Việt' : 'Ẩn tiếng Việt'; });
  }
  window.addEventListener('hashchange', () => { playing++; document.querySelectorAll('.turn').forEach(x => x.remove()); try { speechSynthesis.cancel(); } catch (e) {} });

  /* ---------- basic stop: add short dialogue under the 4 phrases ---------- */
  function addStopDialogue(n) {
    const t = T(n - 1); const ph = app.querySelector('.gtph'); if (!t || !ph || app.querySelector('#sd')) return;
    const box = document.createElement('div'); box.className = 'panel dpan';
    box.innerHTML = `<div class="ph">💬 Hội thoại ngắn</div>${dlgHTML(t.d, 'sd')}${dlgControls('sd', 1)}
      <a class="advlink" href="#/nang-cao/${n}"><img src="${W('books')}" alt=""><span><b>Nâng cao: ${esc(STOPS[n - 1].vi)}</b><small>Hội thoại dài, thêm từ, mẫu câu (cho bé lớn)</small></span><i>›</i></a>`;
    ph.after(box); bindDlg($('#sd'), t.d); bindControls(t.d);
  }

  /* ---------- Nâng cao: list ---------- */
  function listPage() {
    setTabs('kid', '');
    const done = STOPS.filter((s, i) => starsA(i) >= 3).length;
    const cur = STOPS.findIndex((s, i) => openA(i) && starsA(i) < 3);
    const groups = []; for (let i = 0; i < STOPS.length; i += 10) groups.push(i);
    view(bar('Nâng cao', '#/be', starPill()) + `<div class="adv">
      <div class="gthead advh"><img src="${W('books')}" alt=""><div><b>Nâng cao cho bé lớn</b><small>Mỗi chủ đề: hội thoại dài, 6 từ mới, 2 mẫu câu. Làm 3 nhiệm vụ đủ 3 ⭐ để mở chủ đề tiếp theo.</small><div class="gtbar"><i style="width:${done / STOPS.length * 100}%"></i></div><small>${done}/${STOPS.length} chủ đề</small></div></div>
      ${groups.map(g => `<div class="advg">Vùng ${g / 10 + 1}</div><div class="advgrid">${STOPS.slice(g, g + 10).map((s, j) => { const i = g + j, n = starsA(i), lk = !openA(i);
        return `<a class="advc ${lk ? 'lk' : ''} ${i === cur ? 'on' : ''} ${n >= 3 ? 'fin' : ''}" href="${lk ? 'javascript:void 0' : '#/nang-cao/' + (i + 1)}" style="background:${s.c}"><span class="num">${i + 1}</span><img src="${W(s.ic)}" alt=""><b>${esc(s.vi)}</b><small>${esc(s.en)}</small><span class="st">${lk ? '🔒' : [0, 1, 2].map(k => `<i class="${k < n ? 'y' : ''}">★</i>`).join('')}</span></a>`; }).join('')}</div>`).join('')}
    </div>`);
    app.querySelectorAll('.advc.lk').forEach(a => a.onclick = e => { e.preventDefault(); toast('Làm đủ 3 ⭐ chủ đề trước để mở nhé!'); });
    const c = app.querySelector('.advc.on'); if (c && cur > 3) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
  }

  /* ---------- Nâng cao: topic ---------- */
  function topicPage(n, tab) {
    const i = n - 1, s = STOPS[i], t = T(i); if (!s || !t) return go('#/nang-cao');
    if (!openA(i)) return go('#/nang-cao');
    setTabs('kid', '');
    if (['l', 's', 'r'].includes(tab)) return runTask(i, tab);
    tab = ['d', 'v', 'p', 'n'].includes(tab) ? tab : 'd';
    const g = ga()[i] || {};
    const TABS = [['d', '💬', 'Hội thoại'], ['v', '📚', 'Từ vựng'], ['p', '🧩', 'Mẫu câu'], ['n', '⭐', 'Nhiệm vụ']];
    const vpic = en => { const e = en.toLowerCase(); const w = ALL.find(x => x.en.toLowerCase() === e) || ALL.find(x => x.en.toLowerCase() === e.replace(/s$/, '')); return w ? wsrc([w.en, w.vi, w.img]) : ''; };
    const hl = p => esc(p).replace(/___/g, '<u>&nbsp;&nbsp;?&nbsp;&nbsp;</u>');
    let body = '';
    if (tab === 'd') body = `<div class="panel dpan"><div class="ph">💬 Hội thoại</div><p class="muted dtip">Bấm từng câu để nghe. Bấm 🎭 để bé đóng vai 🧒, Xíu Mại nói phần còn lại.</p>${dlgHTML(t.a, 'ad')}${dlgControls('ad', 1)}</div>`;
    if (tab === 'v') { const pics = t.v.map(v => vpic(v[0])); const all = pics.every(Boolean);
      body = all ? `<div class="avgrid">${t.v.map((v, k) => `<button class="avw" data-k="${k}"><img src="${pics[k]}" alt=""><b>${esc(v[0])}</b><small>${esc(v[1])}</small></button>`).join('')}</div>`
        : `<div class="panel apt">${t.v.map((v, k) => `<button class="ape avv" data-k="${k}"><span><b>${esc(v[0])}</b><small>${esc(v[1])}</small></span><i>🔊</i></button>`).join('')}</div>`; }
    if (tab === 'p') body = t.pt.map((p, k) => `<div class="panel apt"><div class="aptp">${hl(p[0])}</div><small class="muted">${hl(p[1])}</small>${p[2].map((e, j) => `<button class="ape" data-k="${k}" data-j="${j}"><span><b>${esc(e[0])}</b><small>${esc(e[1])}</small></span><i>🔊</i></button>`).join('')}</div>`).join('');
    if (tab === 'n') body = `<div class="gttasks">${TASKS.map(x => `<a class="gtt ${g[x[0]] ? 'done' : ''}" href="#/nang-cao/${n}/${x[0]}"><span class="e">${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small><span class="s">${g[x[0]] ? '⭐' : '☆'}</span></a>`).join('')}</div>
      ${starsA(i) >= 3 && STOPS[i + 1] ? `<a class="btn gtnext" href="#/nang-cao/${n + 1}">Chủ đề tiếp: ${esc(STOPS[i + 1].vi)} ▶</a>` : ''}`;
    view(bar(`${n}. ${s.vi}`, '#/nang-cao', starPill()) + `<div class="gtstop adv">
      <div class="gtsh" style="background:${s.c}"><img src="${W(s.ic)}" alt=""><div><b>${esc(s.en)}</b><small>Nâng cao · ${starsA(i)}/3 ⭐</small></div></div>
      <div class="atabs">${TABS.map(x => `<a class="${x[0] === tab ? 'on' : ''}" href="#/nang-cao/${n}/${x[0]}"><span>${x[1]}</span>${x[2]}</a>`).join('')}</div>
      ${body}</div>`);
    if (tab === 'd') { bindDlg($('#ad'), t.a); bindControls(t.a); }
    if (tab === 'v') app.querySelectorAll(".avw,.avv").forEach(b => b.onclick = () => say(t.v[b.dataset.k][0]));
    if (tab === 'p') app.querySelectorAll('.ape').forEach(b => b.onclick = () => say(t.pt[b.dataset.k][2][b.dataset.j][0]));
  }

  function award(i, t) {
    const A = ga(); const g = A[i] || (A[i] = {}); const fresh = !g[t]; g[t] = 1; LS.set('gtA', A);
    if (fresh) addStar(1);
    const all = starsA(i) >= 3;
    cheer(all ? 'Three stars! Amazing!' : 'Great job!', fresh);
    setTimeout(() => go(all && STOPS[i + 1] ? '#/nang-cao' : `#/nang-cao/${i + 1}/n`), 1900);
  }

  function runTask(i, tk) {
    const s = STOPS[i], t = T(i), n = i + 1;
    const TT = TASKS.find(x => x[0] === tk);
    const ex = t.pt.flatMap(p => p[2]);
    let items;
    if (tk === 'l') items = shuffle(t.a.slice()).slice(0, 4);
    else if (tk === 's') items = t.a.filter(l => l[0] === 'K').slice(0, 4);
    else items = shuffle([...t.a.map(l => [l[1], l[2]]), ...ex]).slice(0, 4);
    let k = 0;
    const frame = inner => view(bar(`${TT[1]} ${TT[2]} · ${s.vi}`, `#/nang-cao/${n}/n`, starPill()) + `<div class="gtrun"><div class="gtdots">${items.map((x, j) => `<i class="${j < k ? 'y' : j === k ? 'c' : ''}"></i>`).join('')}</div>${inner}</div>`);
    const next = () => { k++; if (k >= items.length) award(i, tk); else step(); };
    const choose = (opts, right, onOk) => app.querySelectorAll('.aopt').forEach(b => b.onclick = () => {
      if (b.dataset.v === right) { b.classList.add('good'); onOk(); }
      else { b.classList.add('bad'); say('Try again!'); setTimeout(() => b.classList.remove('bad'), 600); }
    });
    function step() {
      const it = items[k];
      if (tk === 'l') {
        const others = shuffle(t.a.filter(l => l[1] !== it[1])).slice(0, 2).map(l => l[1]);
        const opts = shuffle([it[1], ...others]);
        frame(`<div class="gtq"><button class="gtsay" id="h">🔊</button><b>Nghe rồi chọn câu đúng</b><button class="gtsm" id="sl">🐢 Nghe chậm</button></div><div class="aopts">${opts.map(o => `<button class="aopt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`);
        const h = () => sayAs(it[0], it[1]); $('#h').onclick = h; $('#sl').onclick = () => sayAs(it[0], it[1], 0.6); setTimeout(h, 350);
        choose(opts, it[1], () => { say('Yes!'); setTimeout(next, 700); });
      } else if (tk === 'r') {
        const pool = [...t.a.map(l => l[2]), ...ex.map(e => e[1])].filter(v => v !== it[1]);
        const opts = shuffle([it[1], ...shuffle(pool).slice(0, 2)]);
        frame(`<div class="gtq"><div class="aread">${esc(it[0])}</div><b>Câu này nghĩa là gì?</b><button class="gtsm" id="h">🔊 Nghe</button></div><div class="aopts vi">${opts.map(o => `<button class="aopt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`);
        $('#h').onclick = () => say(it[0]);
        choose(opts, it[1], () => { say(it[0]).then(() => setTimeout(next, 250)); });
      } else {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const prev = t.a[t.a.indexOf(it) - 1];
        frame(`<div class="gtspk">${prev ? `<div class="aprev"><span>${sp(prev[0])[0]}</span><span><b>${esc(prev[1])}</b><small>${esc(prev[2])}</small></span></div>` : ''}
          <div class="gtline">🧒 ${esc(it[1])}</div><div class="muted">${esc(it[2])}</div>
          <div class="vbtns"><button class="btn alt" id="h">🔊 Nghe</button>${SR ? '<button class="btn" id="m">🎤 Bé nói</button>' : ''}</div>
          <div class="vres" id="o">${SR ? 'Nghe câu mẫu, rồi bấm 🎤 cho bé nói.' : 'Bé nói theo, ba mẹ bấm 👍 khi bé nói được.'}</div>
          <button class="btn yes" id="y">👍 Bé nói được rồi</button></div>`);
        const h = () => (prev ? sayAs(prev[0], prev[1]).then(() => new Promise(r => setTimeout(r, 300))) : Promise.resolve()).then(() => sayAs('K', it[1]));
        $('#h').onclick = h; setTimeout(h, 350);
        $('#y').onclick = () => { say('Good job!'); next(); };
        let tries = 0;
        if (SR) $('#m').onclick = async () => {
          const m = $('#m'); if (m.disabled) return; m.disabled = true; m.textContent = '👂 Đang nghe…';
          const h = await XMHear(it[1]); const m2 = $('#m'); if (!m2) return; m2.disabled = false; m2.textContent = '🎤 Bé nói';
          if (h.err !== 'deny') tries++;
          if (h.good || (h.heard && tries >= 3)) { $('#o').innerHTML = h.good ? `Xíu Mại nghe: “${esc(h.heard)}” 🌟` : '💪 Bé cố gắng giỏi lắm!'; say('Great!'); setTimeout(next, 900); return; }
          $('#o').innerHTML = XMHearMsg(h, tries);
        };
      }
    }
    step();
  }

  /* ---------- hook routes ---------- */
  const r0 = G.route;
  G.route = function (a, b, c, d) {
    if (a === 'nang-cao') { b ? topicPage(+b, c) : listPage(); return true; }
    const res = r0.call(G, a, b, c, d);
    if (a === 'giao-tiep' && b && !c) addStopDialogue(+b);
    return res;
  };
  G.starsA = starsA;
})();
