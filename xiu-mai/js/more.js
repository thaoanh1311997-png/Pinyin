/* Xíu Mại: Học giao tiếp (journey), video dialogues, songs, daily phrase, screen time, progress book, voice settings.
   Loaded after app.js; uses window.XM helpers. Routes are claimed through XMX.route(). */
(function () {
  'use strict';
  const X = window.XM; if (!X) return;
  const { $, esc, say, toast, cheer, bump, IMG, ALL, LS, stars, addStar, topic, setTabs, bar, view, starPill, R, go, pick, today } = X;
  const app = document.getElementById('app');
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const W = n => IMG(n.includes('/') ? n : 'w/' + n);

  /* ================= Học giao tiếp: data ================= */
  // [en, vi, icon, word to read]
  const STOPS = window.XM_STOPS || [];
  const BASE = STOPS.length;
  // after the hand-written stops, new stops are generated from the flashcard topics (4 words each), 10 at a time
  function genStop(i) {
    const TP = (window.TOPICS || []).filter(t => t.w.length >= 4);
    const j = i - BASE, t = TP[(j * 7) % TP.length], round = Math.floor(j / TP.length);
    const step = Math.max(1, Math.floor(t.w.length / 4)); const ws = [0, 1, 2, 3].map(k => t.w[(round + k * step) % t.w.length]);
    const p = ws.map(w => { const e = X.example(w[0], w[1], t.k); return [e[0], e[1], w[2], w[0]]; });
    return { k: 'g' + i, vi: `${t.vi}${round ? ' ' + (round + 1) : ''}`, en: t.en, ic: ws[0][2], c: t.c, p, gen: 1 };
  }
  function ensureStops() {
    const done = () => STOPS.filter((s, i) => starsOf(i) >= 3).length;
    while (done() >= STOPS.length - 2) for (let k = 0; k < 10; k++) STOPS.push(genStop(STOPS.length));
  }
  const TASKS = [['l', '👂', 'Nghe', 'Nghe và chọn hình'], ['s', '🗣️', 'Nói', 'Nói theo Xíu Mại'], ['r', '📖', 'Đọc', 'Đọc chữ, chọn hình']];
  const gt = () => LS.get('gt', {});
  const starsOf = i => { const g = gt()[i] || {}; return ['l', 's', 'r'].filter(t => g[t]).length; };
  const unlocked = i => i === 0 || starsOf(i - 1) >= 3;

  /* ---------- journey map ---------- */
  function mapPage() {
    ensureStops(); setTabs('kid', '');
    const cur = STOPS.findIndex((s, i) => unlocked(i) && starsOf(i) < 3);
    const H = 150, top = 92;
    const xs = STOPS.map((s, i) => 50 + Math.sin(i * 1.15) * 28); // percent
    const pts = STOPS.map((s, i) => [xs[i], top + i * H]);
    const total = top + (STOPS.length - 1) * H + 140;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` C ${x0} ${y0 + H / 2}, ${x1} ${y1 - H / 2}, ${x1} ${y1}`; }
    const done = STOPS.filter((s, i) => starsOf(i) >= 3).length;
    view(bar('Học giao tiếp', '#/be', starPill()) + `<div class="gtwrap">
      <div class="gthead"><img src="${IMG('ui/xiumai')}" alt=""><div><b>Hành trình nói tiếng Anh</b><small>Mỗi chặng: Nghe · Nói · Đọc. Đủ 3 ⭐ mở chặng mới!</small><div class="gtbar"><i style="width:${done / STOPS.length * 100}%"></i></div><small>${done}/${STOPS.length} chặng</small></div></div>
      <div class="gtmap" style="height:${total}px">
        <svg class="gtroad" viewBox="0 0 100 ${total}" preserveAspectRatio="none"><path d="${d}" class="r1"/><path d="${d}" class="r2"/></svg>
        ${STOPS.map((s, i) => { const n = starsOf(i), lk = !unlocked(i), on = i === cur;
          return `<a class="gtn ${lk ? 'lk' : ''} ${on ? 'on' : ''} ${n >= 3 ? 'fin' : ''}" href="${lk ? 'javascript:void 0' : '#/giao-tiep/' + (i + 1)}" data-i="${i}" style="left:${xs[i]}%;top:${pts[i][1]}px">
            ${on ? `<img class="gtme" src="${IMG('ui/xiumai')}" alt="">` : ''}
            <span class="b" style="background:${s.c}"><img src="${W(s.ic)}" alt="">${lk ? '<em>🔒</em>' : ''}</span>
            <span class="st">${[0, 1, 2].map(k => `<i class="${k < n ? 'y' : ''}">★</i>`).join('')}</span>
            <span class="lb"><small>Chặng ${i + 1}</small>${s.vi}</span></a>`; }).join('')}
        ${STOPS.map((s, i) => { const L = ['deciduous-tree', 'sunflower', 'evergreen-tree', 'tulip', 'mushroom', 'blossom', 'deciduous-tree', 'four-leaf-clover', 'evergreen-tree', 'sunflower'][i % 10]; const x = xs[i] > 50 ? 8 + (i % 3) * 4 : 80 - (i % 3) * 4; return `<img class="gtdeco" src="${W(L)}" alt="" style="left:${x}%;top:${pts[i][1] - 10 + (i % 2) * 30}px">`; }).join('')}
        ${STOPS.map((s, i) => i && i % 10 === 0 ? `<div class="gtch" style="top:${pts[i][1] - H / 2 - 4}px">🏁 Vùng ${i / 10 + 1}</div>` : '').join('')}
        <div class="gtend" style="top:${total - 70}px"><img src="${W('trophy')}" alt=""></div>
      </div></div>`);
    app.querySelectorAll('.gtn.lk').forEach(a => a.onclick = e => { e.preventDefault(); say('Get three stars first!'); toast('Hoàn thành chặng trước (đủ 3 ⭐) để mở chặng này nhé!'); });
    const c = app.querySelector('.gtn.on'); if (c) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
  }

  /* ---------- a stop ---------- */
  function stopPage(n, task) {
    ensureStops();
    const i = n - 1, s = STOPS[i]; if (!s) return go('#/giao-tiep');
    if (!unlocked(i)) return go('#/giao-tiep');
    setTabs('kid', '');
    if (task === 'ba-me') return parentPage(i);
    if (task) return runTask(i, task);
    const g = gt()[i] || {};
    view(bar(`Chặng ${n}. ${s.vi}`, '#/giao-tiep', starPill()) + `<div class="gtstop">
      <div class="gtsh" style="background:${s.c}"><img src="${W(s.ic)}" alt=""><div><b>${s.en}</b><small>${s.vi} · ${starsOf(i)}/3 ⭐</small></div></div>
      <div class="gtph">${s.p.map((p, k) => `<button class="gtp" data-k="${k}"><img src="${W(p[2])}" alt=""><span><b>${esc(p[0])}</b><small>${esc(p[1])}</small></span><i>🔊</i></button>`).join('')}</div>
      <div class="gttasks">${TASKS.map(t => `<a class="gtt ${g[t[0]] ? 'done' : ''}" href="#/giao-tiep/${n}/${t[0]}"><span class="e">${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small><span class="s">${g[t[0]] ? '⭐' : '☆'}</span></a>`).join('')}</div>
      <a class="gtpar" href="#/giao-tiep/${n}/ba-me"><span>👩‍👧</span><div><b>Ba mẹ học cùng con</b><small>Luyện nói 4 câu này, rồi cùng con đóng vai</small></div><span class="go">›</span></a>
      ${starsOf(i) >= 3 && STOPS[i + 1] ? `<a class="btn gtnext" href="#/giao-tiep/${n + 1}">Chặng tiếp: ${STOPS[i + 1].vi} ▶</a>` : ''}</div>`);
    app.querySelectorAll('.gtp').forEach(b => b.onclick = () => { const p = s.p[b.dataset.k]; say(p[0]); });
  }
  function award(i, t) {
    const G = gt(); const g = G[i] || (G[i] = {}); const fresh = !g[t]; g[t] = 1; LS.set('gt', G);
    if (fresh) addStar(1);
    const all = starsOf(i) >= 3;
    cheer(all ? 'Three stars! Hooray!' : 'Great job!', fresh);
    setTimeout(() => go(all && STOPS[i + 1] ? '#/giao-tiep' : '#/giao-tiep/' + (i + 1)), 1900);
  }
  function parentPage(i) {
    const s = STOPS[i], n = i + 1;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const done = LS.get('gtp', {})[i] || [];
    view(bar(`👩‍👧 Học cùng con · ${s.vi}`, '#/giao-tiep/' + n) + `<div class="gtstop">
      <div class="panel"><div class="ph">1️⃣ Ba mẹ luyện nói</div><p class="muted" style="margin:0 0 8px;font-size:15px">Nghe mẫu, rồi bấm 🎤 đọc thử. Chữ xanh là đúng, chữ đỏ đọc lại nhé.</p>
      ${s.p.map((p, k) => `<div class="pp"><div class="ppl" id="pl${k}">${p[0].split(' ').map(w => `<span class="pw">${esc(w)}</span>`).join(' ')}</div><small>${esc(p[1])}</small>
        <div class="ppb"><button data-a="n" data-k="${k}">🔊 Nghe</button><button data-a="s" data-k="${k}">🐢 Chậm</button>${SR ? `<button data-a="m" data-k="${k}" class="pri">🎤 Đọc thử</button>` : ''}<span class="ppr" id="pr${k}"></span></div></div>`).join('')}</div>
      <div class="panel"><div class="ph">2️⃣ Cùng con đóng vai</div>
        <ol class="ppol"><li>Ba mẹ nói câu và làm động tác, bé nhìn và nghe.</li><li>Bé nói theo (nói 1 chữ cũng được, khen thật to!).</li><li>Đổi vai: bé nói, ba mẹ làm theo.</li><li>Dùng lại các câu này trong ngày, đúng lúc thật.</li></ol>
        ${s.p.map((p, k) => `<label class="ppc"><input type="checkbox" data-k="${k}" ${done.includes(k) ? 'checked' : ''}><span>Hôm nay đã nói “${esc(p[0])}” với con</span></label>`).join('')}</div>
      <a class="btn gtnext" href="#/giao-tiep/${n}">Xong, cho bé làm nhiệm vụ ▶</a></div>`);
    const norm = x => x.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').trim();
    app.querySelectorAll('.ppb button').forEach(b => b.onclick = () => {
      const k = +b.dataset.k, p = s.p[k];
      if (b.dataset.a === 'n') return say(p[0], { rate: 0.9 });
      if (b.dataset.a === 's') return say(p[0], { rate: 0.6 });
      const r = new SR(); r.lang = 'en-US'; r.maxAlternatives = 3; b.disabled = true; b.textContent = '👂…';
      r.onresult = e => { if (!$('#pl' + k) || !$('#pr' + k)) return; const heard = new Set(); [...e.results[0]].forEach(a => norm(a.transcript).split(' ').forEach(w => heard.add(w)));
        let ok = 0, tot = 0; $('#pl' + k).querySelectorAll('.pw').forEach(sp => { const w = norm(sp.textContent); if (!w) return; tot++; const g = heard.has(w); ok += g; sp.classList.toggle('good', g); sp.classList.toggle('bad', !g); });
        const pc = tot ? Math.round(ok / tot * 100) : 0; $('#pr' + k).textContent = pc + '% ' + (pc >= 80 ? '🌟' : pc >= 50 ? '👍' : '💪'); };
      let got = false; const tm = setTimeout(() => { try { r.abort(); } catch (e) {} r.onend(); }, 9000);
      const r0 = r.onresult; r.onresult = e => { got = true; r0(e); };
      r.onerror = e => { got = true; const o = $('#pr' + k); if (o) o.innerHTML = /not-allowed|service-not-allowed|audio-capture/.test(e.error) ? 'Máy chưa cho nhận giọng ở đây. Mở trang bằng <b>Safari</b>/<b>Chrome</b> và cho phép micro nhé.' : 'Chưa nghe rõ, đọc lại nhé'; };
      r.onend = () => { clearTimeout(tm); if (!b.disabled) return; b.disabled = false; b.textContent = '🎤 Đọc thử'; const o = $('#pr' + k); if (!got && o) o.textContent = 'Chưa nghe rõ, đọc lại nhé'; };
      try { r.start(); } catch (e) { r.onend(); }
    });
    app.querySelectorAll('.ppc input').forEach(c => c.onchange = () => { const G = LS.get('gtp', {}); const a = new Set(G[i] || []); c.checked ? a.add(+c.dataset.k) : a.delete(+c.dataset.k); G[i] = [...a]; LS.set('gtp', G); if (c.checked) toast('Tuyệt vời! 💛'); });
  }
  function runTask(i, t) {
    const s = STOPS[i], order = shuffle(s.p.slice()); let k = 0;
    const T = TASKS.find(x => x[0] === t); if (!T) return go('#/giao-tiep/' + (i + 1));
    const frame = inner => view(bar(`${T[1]} ${T[2]} · ${s.vi}`, '#/giao-tiep/' + (i + 1), starPill()) + `<div class="gtrun"><div class="gtdots">${order.map((x, j) => `<i class="${j < k ? 'y' : j === k ? 'c' : ''}"></i>`).join('')}</div>${inner}</div>`);
    const next = () => { k++; if (k >= order.length) award(i, t); else step(); };
    const opts = p => shuffle([p, ...shuffle(s.p.filter(x => x !== p)).slice(0, 2)]);
    const pics = (p, attr) => `<div class="gtopts">${opts(p).map(x => `<button class="gto" data-e="${esc(x[0])}"><img src="${W(x[2])}" alt=""></button>`).join('')}</div>`;
    const bindPics = p => app.querySelectorAll('.gto').forEach(b => b.onclick = () => {
      if (b.dataset.e === p[0]) { b.classList.add('good'); say(p[0]).then(() => setTimeout(next, 250)); }
      else { b.classList.add('bad'); say('Try again!'); setTimeout(() => b.classList.remove('bad'), 600); }
    });
    function step() {
      const p = order[k];
      if (t === 'l') {
        frame(`<div class="gtq"><button class="gtsay" id="h">🔊</button><b>Nghe rồi chọn hình đúng</b></div>${pics(p)}`);
        const h = () => say(p[0]); $('#h').onclick = h; setTimeout(h, 350); bindPics(p);
      } else if (t === 'r') {
        frame(`<div class="gtq"><div class="gtword">${esc(p[3])}</div><b>Bé đọc chữ rồi chọn hình</b><button class="gtsm" id="h">🔊 Gợi ý</button></div>${pics(p)}`);
        $('#h').onclick = () => say(p[3]); bindPics(p);
      } else {
        const SR = window.XMCanHear;
        frame(`<div class="gtspk"><img src="${W(p[2])}" alt=""><div class="gtline">${esc(p[0])}</div><div class="muted">${esc(p[1])}</div>
          <div class="vbtns"><button class="btn alt" id="h">🔊 Nghe</button>${SR ? '<button class="btn" id="m">🎤 Bé nói</button>' : ''}</div>
          <div class="vres" id="o">${SR ? 'Nghe Xíu Mại nói, rồi bấm 🎤 cho bé nói theo.' : 'Bé nói theo, ba mẹ bấm 👍 khi bé nói được.'}</div>
          <button class="btn yes" id="y">👍 Bé nói được rồi</button></div>`);
        const h = () => say(p[0]); $('#h').onclick = h; setTimeout(h, 350);
        $('#y').onclick = () => { say('Good job!'); next(); };
        const st = {};
        if (SR) $('#m').onclick = async () => {
          const m = $('#m'); if (m.disabled) return; m.disabled = true; m.textContent = '👂 Đang nghe…'; $('#o').textContent = '👂 Xíu Mại đang nghe bé nói…';
          const h = await XMHear(p[0]); const m2 = $('#m'); if (!m2 || m2 !== m) return; m2.disabled = false; m2.textContent = '🎤 Bé nói';
          const r = XMHearPass(h, st);
          if (r) { m2.disabled = true; $('#o').innerHTML = r === 'good' ? (h.heard ? `Xíu Mại nghe: “${esc(h.heard)}” 🌟` : '🌟 Xíu Mại nghe thấy bé rồi! Giỏi quá!') : '💪 Bé cố gắng giỏi lắm!'; say('Great!'); setTimeout(next, 900); return; }
          $('#o').innerHTML = XMHearMsg(h);
        };
      }
    }
    step();
  }

  /* ================= Video dialogues (Ba Mẹ) ================= */
  // Hội thoại thường ngày = short dialogue videos (gentle channels), phrases reuse the checked EPISODES lines
  const VIDMAP = {
    sang: [['_nwUf5vMsqI', 'Good Morning! (Max, Mia & Teddy)']],
    rang: [['ARhIce1VEpg', 'Adam & Mom: Brush Your Teeth'], ['rmm4GCfaJhY', 'Brushing My Teeth! (Max, Mia & Teddy)']],
    an: [['hjVdugdX9jE', 'Asking for Water (Mom & Sweetie)'], ['-MvYOA4pdvk', 'At the Restaurant (Max, Mia & Teddy)']],
    mac: [['Cyv6cAlrRn8', 'My Shoes (Max, Mia & Teddy)']],
    rua: [['kO7xBbPdk6U', 'Bathroom Words (Max, Mia & Teddy)']],
    choi: [['NFkFvY41VzY', 'Play with Mom (Mom & Sweetie)'], ['iEGtvzE469s', 'Toy Names (Max, Mia & Teddy)']],
    don: [['bANTGOT_T44', 'My Bedroom (Max, Mia & Teddy)'], ['PJJe0rAPLE8', 'My House (Max, Mia & Teddy)']],
    congvien: [['qp7n4s57f4I', 'Jump, Run, Walk! (Max, Mia & Teddy)']],
    tam: [['kO7xBbPdk6U', 'Bathroom Words (Max, Mia & Teddy)']],
    ngu: [['o5XlK7wU9Cw', 'Bedtime Routine (Mom & Sweetie)'], ['_DQi_w0CD9M', 'Adam & Mom: Time for Bed']],
    sieuthi: [['ZeFxoT1vDGU', 'At the Supermarket (Mom & Sweetie)'], ['UxRXL4wNNXo', 'At the Supermarket (Max, Mia & Teddy)']],
    dau: [['vgzpJM4sac4', 'How Do You Feel? (Max, Mia & Teddy)'], ['nM9vPg0PZ0o', 'Body Parts (Max, Mia & Teddy)']],
    tamviet: [['3p2-bb3H8CY', 'My Family (Max, Mia & Teddy)']],
    mua: [['5U2LZY39AsI', 'Forgot Umbrella (Mom & Sweetie)'], ['n8bU-PGOADc', 'Weather (Max, Mia & Teddy)']],
  };
  const EPS = () => (window.EPISODES || []).filter(e => VIDMAP[e.id]);
  const epPhrases = e => { const seen = new Set(), out = []; e.panels.forEach(p => p.lines.forEach(l => { if (!seen.has(l[1])) { seen.add(l[1]); out.push([l[1], l[2], l[0]]); } })); return out; };
  function epsPage() {
    setTabs('parent', '');
    view(bar('Hội thoại thường ngày', '#/bame') + `<p class="muted" style="margin:0 0 10px;font-size:16px">Video hoạt hình mẹ và bé nói chuyện theo từng lúc trong ngày. Có phụ đề chạy kèm nghĩa, nghe lại từng câu, luyện nói, và câu mẫu để dùng với con.</p>
      <div class="dvgrid">${EPS().map((e, i) => `<a class="dvt" href="#/bame/hoi-thoai/${e.id}"><div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/${VIDMAP[e.id][0][0]}/mqdefault.jpg" alt="" onerror="this.src='${W(e.icon)}'"><span>▶</span></div><b>${i + 1}. ${esc(e.vi)}</b><small>${esc(e.en)} · ${VIDMAP[e.id].length} video</small></a>`).join('')}</div>`);
  }
  function epPage(id, n) {
    const e = EPS().find(x => x.id === id); if (!e) return go('#/bame/hoi-thoai');
    const vs = VIDMAP[id]; const k = Math.min(vs.length - 1, Math.max(0, (+n || 1) - 1));
    const P = epPhrases(e);
    const extra = `${vs.length > 1 ? `<div class="dvsw">${vs.map((v, j) => `<a class="${j === k ? 'on' : ''}" href="#/bame/hoi-thoai/${id}/${j + 1}">🎞️ Video ${j + 1}</a>`).join('')}</div>` : ''}
      <div class="panel dvp"><div class="ph">💬 Câu mẫu dùng với con: ${esc(e.vi)}</div>
      ${P.map(p => `<button class="dvl"><span>${p[2] === 'k' ? '🧒' : '👩'}</span><div><b>${esc(p[0])}</b><small>${esc(p[1])}</small></div></button>`).join('')}</div>`;
    R.play(vs[k][0], { title: `🎬 ${e.vi}`, back: '#/bame/hoi-thoai', vt: vs[k][1], extra }).then(() => {
      setTabs('parent', '');
      app.querySelectorAll('.dvl').forEach((b, j) => b.onclick = () => say(P[j][0]));
    });
  }

  /* ================= Songs ================= */
  window.XM_SONGS = { key: 'classic', name: '🎵 Bài hát & vè quen thuộc', cat: 'song', age: '1+', vi: 'Super Simple Songs: chậm, rõ, có phụ đề chạy để hát cùng bé', videos: [
    { id: 'tVlcKp3bWH8', t: 'Hello! · Bài chào hỏi', d: '1:19', vi: 'Bài chào hỏi' },
    { id: 'fN1Cyr0ZK9M', t: 'Hello Hello! Can You Clap Your Hands? · Vỗ tay chào nhau', d: '1:32', vi: 'Vỗ tay chào nhau' },
    { id: 'kDdg2M1_EuE', t: 'The Alphabet Is So Much Fun · Bài hát ABC', d: '2:05', vi: 'Bài hát ABC' },
    { id: 'RuqvGiZi0qg', t: 'Head Shoulders Knees And Toes · Đầu, vai, gối, chân', d: '1:46', vi: 'Đầu, vai, gối, chân' },
    { id: 'yCjJyiqpAuU', t: 'Twinkle Twinkle Little Star · Ngôi sao lấp lánh', d: '2:34', vi: 'Ngôi sao lấp lánh' },
    { id: 'GzrjwOQpAl0', t: 'The Wheels On The Bus · Bánh xe buýt', d: '2:38', vi: 'Bánh xe buýt' },
    { id: '5oYKonYBujg', t: 'Old MacDonald Had A Farm · Nông trại của ông MacDonald', d: '3:30', vi: 'Nông trại của ông MacDonald' },
    { id: 'l4WNrvVjiTw', t: "If You're Happy · Nếu vui thì vỗ tay", d: '2:04', vi: 'Nếu vui thì vỗ tay' },
    { id: 'bne3Ix_tJL8', t: 'The Eensy Weensy Spider · Chú nhện nhỏ', d: '2:24', vi: 'Chú nhện nhỏ' },
    { id: '7otAJa3jui8', t: 'Row Row Row Your Boat · Chèo thuyền', d: '2:02', vi: 'Chèo thuyền' },
    { id: '6916kVhbEZw', t: 'Skidamarink · Con yêu ba mẹ', d: '2:26', vi: 'Con yêu ba mẹ' },
    { id: 'SpzLA-w1I8s', t: 'The More We Get Together · Mình chơi cùng nhau', d: '1:50', vi: 'Mình chơi cùng nhau' },
    { id: 'fPMjnlTEZwU', t: 'Walking Walking · Đi, nhảy, chạy', d: '1:52', vi: 'Đi, nhảy, chạy' },
    { id: 'eBVqcTEC3zQ', t: 'One Little Finger · Một ngón tay nhỏ', d: '2:25', vi: 'Một ngón tay nhỏ' },
    { id: '1GDFa-nEzlg', t: 'This Is The Way We Get Dressed · Mặc quần áo', d: '1:55', vi: 'Mặc quần áo' },
    { id: '-jBfb33_KHU', t: 'Put On Your Shoes · Mang giày vào', d: '3:02', vi: 'Mang giày vào' },
    { id: 'wCio_xVlgQ0', t: 'Brush Your Teeth · Đánh răng', d: '2:15', vi: 'Đánh răng' },
    { id: 'v1YjJmMvnOw', t: 'This Is The Way We Go To Bed · Đi ngủ nào', d: '1:59', vi: 'Đi ngủ nào' },
    { id: 'PraN5ZoSjiY', t: 'Bye Bye Goodbye · Tạm biệt', d: '2:01', vi: 'Tạm biệt' }
  ] };

  /* ================= Daily phrase for parents ================= */
  const DAILY = [
    ['Good morning, sweetie!', 'Chào buổi sáng, con yêu!'], ["Let's wash your hands.", 'Mình đi rửa tay nào.'], ['Time to eat!', 'Đến giờ ăn rồi!'],
    ['Open your mouth, please.', 'Con há miệng ra nào.'], ['Do you want some water?', 'Con có muốn uống nước không?'], ['Put on your shoes.', 'Con mang giày vào nào.'],
    ["Let's go outside!", 'Mình ra ngoài chơi nào!'], ['Be careful!', 'Cẩn thận nha con!'], ['Hold my hand.', 'Nắm tay mẹ nhé.'],
    ['What color is it?', 'Cái này màu gì vậy con?'], ['What is this?', 'Đây là cái gì?'], ['Can you find the ball?', 'Con tìm được quả bóng không?'],
    ['Good job!', 'Con giỏi quá!'], ['Clean up your toys, please.', 'Con dọn đồ chơi nhé.'], ['Let’s read a book.', 'Mình đọc sách nào.'],
    ['Are you hungry?', 'Con đói chưa?'], ['Are you tired?', 'Con mệt hả?'], ['Give me a hug!', 'Ôm mẹ cái nào!'],
    ['Say thank you.', 'Con nói cảm ơn đi.'], ['Wave bye-bye!', 'Vẫy tay tạm biệt nào!'], ['Let’s take a bath.', 'Mình đi tắm nào.'],
    ['Brush your teeth.', 'Đánh răng nào con.'], ['Time for bed.', 'Đến giờ đi ngủ rồi.'], ['I love you so much.', 'Mẹ yêu con nhiều lắm.'],
    ['Sit down, please.', 'Con ngồi xuống nhé.'], ['Stand up!', 'Đứng lên nào!'], ['Come here, please.', 'Lại đây với mẹ nào.'],
    ['Wait a minute.', 'Đợi mẹ một chút nhé.'], ['Look at me.', 'Nhìn mẹ nè.'], ['Listen!', 'Nghe nè con!'],
    ['Where is your nose?', 'Mũi con đâu?'], ['Show me your hands.', 'Cho mẹ xem tay con nào.'], ['Let’s count: one, two, three!', 'Mình đếm nào: một, hai, ba!'],
    ['Is it hot or cold?', 'Cái này nóng hay lạnh?'], ['It’s raining.', 'Trời đang mưa.'], ['The sun is shining.', 'Trời nắng đẹp.'],
    ['Do you want more?', 'Con có muốn thêm không?'], ['All done?', 'Con xong chưa?'], ['Gently, please.', 'Nhẹ nhàng thôi con.'],
    ['Your turn!', 'Tới lượt con!'], ['My turn.', 'Tới lượt mẹ.'], ['Let’s sing a song!', 'Mình hát một bài nào!'],
    ['Don’t touch, it’s hot!', 'Đừng chạm, nóng đó!'], ['Put it back, please.', 'Con để lại chỗ cũ nhé.'], ['Who is that?', 'Ai đó vậy con?'],
    ['Let’s go to the park.', 'Mình đi công viên nào.'], ['Smile!', 'Cười lên nào!'], ['You did it!', 'Con làm được rồi!'],
  ];
  const dayNum = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5) + d.getFullYear() * 7; };
  const todayPhrase = () => DAILY[dayNum() % DAILY.length];
  function dailyCard() {
    const p = todayPhrase();
    return `<div class="daily"><div class="dl"><span class="tag">☀️ Câu nói hôm nay</span><b>${esc(p[0])}</b><small>${esc(p[1])}</small><em>Ba mẹ nói câu này với bé nhiều lần trong ngày nhé!</em></div><button class="dsay" id="dsay" aria-label="Nghe">🔊</button></div>`;
  }

  /* ================= Screen time ================= */
  const stGet = () => { let s = LS.get('st', null); if (!s || s.d !== today()) { s = { d: today(), used: 0, extra: 0 }; LS.set('st', s); } return s; };
  const limit = () => LS.get('stlim', 0); // minutes, 0 = off
  const kidArea = () => { const h = location.hash; return h && h !== '#/' && h !== '#' && !h.startsWith('#/bame'); };
  let locked = false;
  setInterval(() => {
    if (document.visibilityState !== 'visible' || !kidArea()) return;
    const s = stGet(); s.used += 5; LS.set('st', s);
    const L = limit(); if (L && !locked && s.used >= (L + s.extra) * 60) lock();
  }, 5000);
  function lock() {
    locked = true; try { speechSynthesis.cancel(); } catch (e) {}
    document.querySelectorAll('iframe').forEach(f => { try { f.src = 'about:blank'; } catch (e) {} });
    document.querySelectorAll('video,audio').forEach(m => { try { m.pause(); } catch (e) {} });
    const o = document.createElement('div'); o.className = 'stlock'; o.id = 'stlock';
    o.innerHTML = `<div class="box"><img src="${IMG('ui/xiumai')}" alt=""><h2>Hết giờ rồi! 🌙</h2><p>Good job today, Bánh Mì!<br>Mình nghỉ mắt, đi chơi với ba mẹ nhé!</p>
      <button class="btn alt" id="stu">🔒 Ba mẹ mở khóa</button><div id="stq"></div></div>`;
    document.body.appendChild(o);
    say('Good job today! Time to rest your eyes. Bye-bye!');
    o.querySelector('#stu').onclick = () => {
      const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6);
      o.querySelector('#stq').innerHTML = `<p>Ba mẹ trả lời: <b>${a} + ${b} = ?</b></p><input id="sta" type="number" inputmode="numeric"><div class="vbtns"><button class="btn" data-m="10">+10 phút</button><button class="btn alt" data-m="999">Tắt hôm nay</button></div>`;
      o.querySelectorAll('[data-m]').forEach(btn => btn.onclick = () => {
        if (+o.querySelector('#sta').value !== a + b) { toast('Chưa đúng, ba mẹ thử lại nhé'); return; }
        const s = stGet(); s.extra += +btn.dataset.m; LS.set('st', s); o.remove(); locked = false; go(location.hash || '#/be');
      });
    };
  }
  function stPage() {
    setTabs('parent', '');
    const s = stGet(), L = limit();
    view(bar('Giới hạn giờ xem', '#/bame') + `<div class="panel"><div class="ph">⏰ Mỗi ngày bé được chơi bao lâu?</div>
      <p class="muted" style="margin:0 0 10px;font-size:15.5px">Chỉ tính thời gian ở khu của Bé. Hết giờ, Xíu Mại chúc bé nghỉ ngơi và khóa màn hình. Ba mẹ mở bằng 1 phép cộng nhỏ.</p>
      <div class="stopts">${[[0, 'Tắt'], [10, '10 phút'], [15, '15 phút'], [20, '20 phút'], [30, '30 phút']].map(([m, l]) => `<button class="${m === L ? 'on' : ''}" data-m="${m}">${l}</button>`).join('')}</div>
      <div class="stused">Hôm nay bé đã dùng: <b>${Math.round(s.used / 60)} phút</b>${L ? ` / ${L + (s.extra >= 999 ? 0 : s.extra)} phút` : ''}</div>
      <button class="btn alt" id="streset" style="margin-top:10px">↺ Tính lại từ đầu hôm nay</button></div>`);
    app.querySelectorAll('.stopts button').forEach(b => b.onclick = () => { LS.set('stlim', +b.dataset.m); toast(+b.dataset.m ? `Đã đặt ${b.dataset.m} phút mỗi ngày` : 'Đã tắt giới hạn'); stPage(); });
    $('#streset').onclick = () => { LS.set('st', { d: today(), used: 0, extra: 0 }); stPage(); };
  }

  /* ================= Progress book ================= */
  function bookPage() {
    setTabs('parent', '');
    const H = LS.get('hist', {}); const days = Object.keys(H).sort((a, b) => new Date(a) - new Date(b));
    const learned = new Set(); days.forEach(d => H[d].w.forEach(w => learned.add(w)));
    const active = d => H[d] && (H[d].w.length + H[d].g + H[d].v + H[d].f.length) > 0;
    let streak = 0; for (let k = 0; ; k++) { const t = new Date(Date.now() - k * 864e5); const key = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate(); if (active(key)) streak++; else if (k > 0) break; else continue; if (k > 400) break; }
    const last7 = [...Array(7)].map((_, k) => { const t = new Date(Date.now() - (6 - k) * 864e5); const key = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate(); const x = H[key]; return { l: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][t.getDay()], n: x ? x.w.length + x.g + x.v : 0 }; });
    const mx = Math.max(3, ...last7.map(x => x.n));
    const byTopic = {}; ALL.forEach(w => { if (learned.has(w.en)) byTopic[w.t] = (byTopic[w.t] || 0) + 1; });
    const tops = Object.entries(byTopic).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const gtDone = STOPS.filter((s, i) => starsOf(i) >= 3).length;
    view(bar('Sổ tiến bộ của bé', '#/bame') + `<div class="bkstats">
      <div><b>${learned.size}</b><small>từ đã học</small></div><div><b>${days.filter(active).length}</b><small>ngày học</small></div>
      <div><b>${streak}🔥</b><small>ngày liên tiếp</small></div><div><b>${stars()}⭐</b><small>sao</small></div></div>
      <div class="panel"><div class="ph">📅 7 ngày qua</div><div class="bk7">${last7.map(x => `<div><i style="height:${Math.round(x.n / mx * 100)}%"></i><b>${x.n || ''}</b><small>${x.l}</small></div>`).join('')}</div></div>
      <div class="panel"><div class="ph">🗺️ Học giao tiếp</div><div class="gtbar"><i style="width:${gtDone / STOPS.length * 100}%"></i></div><p class="muted" style="margin:6px 0 0">${gtDone}/${STOPS.length} chặng · ${STOPS.map((s, i) => starsOf(i)).reduce((a, b) => a + b, 0)}/${STOPS.length * 3} ⭐</p></div>
      <div class="panel"><div class="ph">📚 Chủ đề bé học nhiều</div>${tops.length ? tops.map(([k, n]) => { const t = topic(k); const tot = t ? t.w.length : n; return `<div class="bkt"><span>${t ? t.vi : k}</span><div class="gtbar"><i style="width:${Math.min(100, n / tot * 100)}%"></i></div><small>${n}/${tot}</small></div>`; }).join('') : '<p class="muted" style="margin:0">Bé chưa học từ nào. Mở Flashcard và bấm nghe từ để bắt đầu nhé!</p>'}</div>
      ${learned.size ? `<div class="panel"><div class="ph">🔤 Từ bé đã nghe gần đây</div><div class="bkw">${[...learned].slice(-30).reverse().map(w => `<button>${esc(w)}</button>`).join('')}</div></div>` : ''}
      <a class="prow mk" href="#/bame/nhat-ky"><img src="${W('spiral-notepad')}" alt=""><div><b>Nhật ký của ba mẹ</b><small>Ghi lại từ đầu tiên bé nói, khoảnh khắc đáng nhớ</small></div><span class="go">›</span></a>`);
    app.querySelectorAll('.bkw button').forEach(b => b.onclick = () => say(b.textContent));
  }

  /* ================= Voice settings ================= */
  function voicePage() {
    setTabs('parent', '');
    const vs = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(v => /^en[-_]/i.test(v.lang));
    const mine = LS.get('voice', ''); const rate = LS.get('vrate', 0.82);
    const good = v => /premium|enhanced|natural|online|neural/i.test(v.name);
    const sorted = vs.slice().sort((a, b) => good(b) - good(a) || (/US/.test(b.lang) - /US/.test(a.lang)));
    view(bar('Giọng đọc', '#/bame') + `<div class="panel"><div class="ph">🐢 Tốc độ đọc</div><div class="stopts">${[[0.65, 'Rất chậm'], [0.82, 'Chậm vừa'], [0.95, 'Bình thường']].map(([r, l]) => `<button class="${Math.abs(r - rate) < .01 ? 'on' : ''}" data-r="${r}">${l}</button>`).join('')}</div></div>
      <div class="panel"><div class="ph">🗣️ Chọn giọng (bấm để nghe thử)</div>${sorted.length ? sorted.slice(0, 14).map(v => `<button class="vrow ${v.name === mine ? 'on' : ''}" data-n="${esc(v.name)}"><b>${esc(v.name)}</b><small>${v.lang}${good(v) ? ' · giọng tự nhiên ✨' : ''}</small></button>`).join('') : '<p class="muted">Máy chưa tải xong danh sách giọng, thử mở lại trang này.</p>'}
      <button class="vrow ${!mine ? 'on' : ''}" data-n=""><b>Tự chọn giọng hay nhất</b><small>Xíu Mại tự chọn giọng tự nhiên nhất có trên máy</small></button></div>
      <div class="panel sec"><div class="ph">💡 Muốn giọng hay hơn nữa trên iPhone/iPad?</div><p style="margin:0;font-size:15.5px;line-height:1.5">Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › Tiếng Anh › tải giọng <b>Ava (Cao cấp)</b> hoặc <b>Zoe (Cao cấp)</b>. Tải xong, Xíu Mại tự dùng giọng đó. Không bắt buộc.</p></div>`);
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { LS.set('vrate', +b.dataset.r); say('Hello, Banh Mi! Let’s learn English!'); voicePage(); });
    app.querySelectorAll('.vrow').forEach(b => b.onclick = () => { LS.set('voice', b.dataset.n); X.pickVoice(); say('Hello, Banh Mi! I love you!'); app.querySelectorAll('.vrow').forEach(x => x.classList.toggle('on', x === b)); });
  }

  /* ================= hooks into existing pages ================= */
  R.eps = epsPage; R.ep = id => epPage(id, 1);

  window.XMX = {
    route(a, b, c, d) {
      if (a === 'giao-tiep') { b ? stopPage(+b, c) : mapPage(); return true; }
      if (a === 'bame' && b === 'hoi-thoai') { c ? epPage(c, d) : epsPage(); return true; }
      if (a === 'bame' && b === 'video-hoi-thoai') { epPage(c || 'rang', d); return true; }
      if (a === 'bame' && b === 'gio-xem') { stPage(); return true; }
      if (a === 'bame' && b === 'so-tien-bo') { bookPage(); return true; }
      if (a === 'bame' && b === 'giong-doc') { voicePage(); return true; }
      if (a === 'video' && b === 'bai-hat') { R.video('songs'); return true; }
      return false;
    },
    dailyCard, todayPhrase, STOPS, BASE, ensureStops, starsOf, unlocked, lockNow: lock,
  };
})();
