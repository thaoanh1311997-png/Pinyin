/* Xíu Mại: Học giao tiếp (journey), video dialogues, songs, daily phrase, screen time, progress book, voice settings.
   Loaded after app.js; uses window.XM helpers. Routes are claimed through XMX.route(). */
(function () {
  'use strict';
  const X = window.XM; if (!X) return;
  const { $, esc, say, toast, cheer, bump, IMG, ALL, LS, stars, addStar, topic, setTabs, bar, view, starPill, R, go, pick, today } = X;
  const app = document.getElementById('app');
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const W = n => IMG('w/' + n);

  /* ================= Học giao tiếp: data ================= */
  // [en, vi, icon, word to read]
  const STOPS = [
    { k: 'hello', vi: 'Chào hỏi', en: 'Hello & bye', ic: 'waving-hand', c: '#FFD6E2', p: [
      ['Hello!', 'Xin chào!', 'waving-hand', 'hello'], ['Bye-bye!', 'Tạm biệt!', 'door', 'bye'],
      ['Good morning!', 'Chào buổi sáng!', 'sunrise', 'morning'], ['Good night!', 'Chúc ngủ ngon!', 'crescent-moon', 'night']] },
    { k: 'manners', vi: 'Lễ phép', en: 'Please & thank you', ic: 'folded-hands', c: '#FFF1C9', p: [
      ['Please.', 'Làm ơn ạ.', 'folded-hands', 'please'], ['Thank you!', 'Cảm ơn ạ!', 'wrapped-gift', 'thank you'],
      ["I'm sorry.", 'Con xin lỗi.', 'pleading-face', 'sorry'], ['Yes, please!', 'Dạ, con muốn ạ!', 'thumbs-up', 'yes']] },
    { k: 'feel', vi: 'Cảm xúc', en: 'Feelings', ic: 'grinning-face', c: '#E6F5FF', p: [
      ["I'm happy.", 'Con vui.', 'grinning-face', 'happy'], ["I'm sad.", 'Con buồn.', 'crying-face', 'sad'],
      ["I'm tired.", 'Con mệt.', 'tired-face', 'tired'], ["I'm angry.", 'Con giận.', 'angry-face', 'angry']] },
    { k: 'eat', vi: 'Ăn uống', en: 'Eating', ic: 'bowl-with-spoon', c: '#E9FBE2', p: [
      ["I'm hungry.", 'Con đói bụng.', 'face-savoring-food', 'hungry'], ['More, please.', 'Cho con thêm ạ.', 'bowl-with-spoon', 'more'],
      ["I'm thirsty.", 'Con khát nước.', 'cup-with-straw', 'thirsty'], ['All done!', 'Con ăn xong rồi!', 'check-mark-button', 'done']] },
    { k: 'clean', vi: 'Vệ sinh', en: 'Clean up', ic: 'soap', c: '#DDF3FF', p: [
      ['Wash your hands.', 'Rửa tay nào.', 'soap', 'wash'], ['Brush your teeth.', 'Đánh răng nào.', 'toothbrush', 'brush'],
      ['Bath time!', 'Đến giờ tắm rồi!', 'bathtub', 'bath'], ['I need to pee.', 'Con muốn đi tè.', 'toilet', 'pee']] },
    { k: 'dress', vi: 'Mặc đồ', en: 'Getting dressed', ic: 't-shirt', c: '#F1EAFF', p: [
      ['Put on your shirt.', 'Mặc áo vào nào.', 't-shirt', 'shirt'], ['Put on your shoes.', 'Mang giày vào nào.', 'running-shoe', 'shoes'],
      ['Put on your hat.', 'Đội mũ vào nào.', 'billed-cap', 'hat'], ['Take off your socks.', 'Cởi vớ ra nào.', 'socks', 'socks']] },
    { k: 'play', vi: 'Cùng chơi', en: "Let's play", ic: 'teddy-bear', c: '#FFF0E3', p: [
      ["Let's play!", 'Mình chơi nào!', 'teddy-bear', 'play'], ['Throw the ball!', 'Ném bóng đi!', 'soccer-ball', 'ball'],
      ["Let's sing!", 'Mình hát nào!', 'musical-notes', 'sing'], ["Let's dance!", 'Mình nhảy nào!', 'woman-dancing', 'dance']] },
    { k: 'out', vi: 'Đi chơi', en: 'Going out', ic: 'automobile', c: '#E9FBE2', p: [
      ["Let's go!", 'Đi thôi!', 'person-walking', 'go'], ['Get in the car.', 'Lên xe nào.', 'automobile', 'car'],
      ['Look, a bird!', 'Nhìn kìa, con chim!', 'bird', 'bird'], ['Hold my hand.', 'Nắm tay mẹ nhé.', 'hand-with-fingers-splayed', 'hand']] },
    { k: 'help', vi: 'Nhờ giúp đỡ', en: 'Help me', ic: 'raising-hands', c: '#FFE3B8', p: [
      ['Help me, please.', 'Giúp con với ạ.', 'raising-hands', 'help'], ["I'm hurt.", 'Con bị đau.', 'adhesive-bandage', 'hurt'],
      ['Where is Mommy?', 'Mẹ đâu rồi?', 'woman', 'Mommy'], ['Hug me!', 'Ôm con đi!', 'people-hugging', 'hug']] },
    { k: 'bed', vi: 'Đi ngủ', en: 'Bedtime', ic: 'bed', c: '#E4E6FF', p: [
      ['Time for bed.', 'Đến giờ đi ngủ rồi.', 'bed', 'bed'], ['Read a book, please.', 'Đọc sách cho con nhé.', 'open-book', 'book'],
      ['Close your eyes.', 'Nhắm mắt lại nào.', 'sleeping-face', 'eyes'], ['I love you.', 'Con yêu mẹ.', 'red-heart', 'love']] },
  ];
  const TASKS = [['l', '👂', 'Nghe', 'Nghe và chọn hình'], ['s', '🗣️', 'Nói', 'Nói theo Xíu Mại'], ['r', '📖', 'Đọc', 'Đọc chữ, chọn hình']];
  const gt = () => LS.get('gt', {});
  const starsOf = i => { const g = gt()[i] || {}; return ['l', 's', 'r'].filter(t => g[t]).length; };
  const unlocked = i => i === 0 || starsOf(i - 1) >= 3;

  /* ---------- journey map ---------- */
  function mapPage() {
    setTabs('kid', '');
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
        ${STOPS.map((s, i) => { const L = ['deciduous-tree', 'sunflower', 'evergreen-tree', 'tulip', 'mushroom', 'blossom', 'deciduous-tree', 'four-leaf-clover', 'evergreen-tree', 'sunflower'][i]; const x = xs[i] > 50 ? 8 + (i % 3) * 4 : 80 - (i % 3) * 4; return `<img class="gtdeco" src="${W(L)}" alt="" style="left:${x}%;top:${pts[i][1] - 10 + (i % 2) * 30}px">`; }).join('')}
        <div class="gtend" style="top:${total - 70}px"><img src="${W('trophy')}" alt=""></div>
      </div></div>`);
    app.querySelectorAll('.gtn.lk').forEach(a => a.onclick = e => { e.preventDefault(); say('Get three stars first!'); toast('Hoàn thành chặng trước (đủ 3 ⭐) để mở chặng này nhé!'); });
    const c = app.querySelector('.gtn.on'); if (c) setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250);
  }

  /* ---------- a stop ---------- */
  function stopPage(n, task) {
    const i = n - 1, s = STOPS[i]; if (!s) return go('#/giao-tiep');
    if (!unlocked(i)) return go('#/giao-tiep');
    setTabs('kid', '');
    if (task) return runTask(i, task);
    const g = gt()[i] || {};
    view(bar(`Chặng ${n}. ${s.vi}`, '#/giao-tiep', starPill()) + `<div class="gtstop">
      <div class="gtsh" style="background:${s.c}"><img src="${W(s.ic)}" alt=""><div><b>${s.en}</b><small>${s.vi} · ${starsOf(i)}/3 ⭐</small></div></div>
      <div class="gtph">${s.p.map((p, k) => `<button class="gtp" data-k="${k}"><img src="${W(p[2])}" alt=""><span><b>${esc(p[0])}</b><small>${esc(p[1])}</small></span><i>🔊</i></button>`).join('')}</div>
      <div class="gttasks">${TASKS.map(t => `<a class="gtt ${g[t[0]] ? 'done' : ''}" href="#/giao-tiep/${n}/${t[0]}"><span class="e">${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small><span class="s">${g[t[0]] ? '⭐' : '☆'}</span></a>`).join('')}</div>
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
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        frame(`<div class="gtspk"><img src="${W(p[2])}" alt=""><div class="gtline">${esc(p[0])}</div><div class="muted">${esc(p[1])}</div>
          <div class="vbtns"><button class="btn alt" id="h">🔊 Nghe</button>${SR ? '<button class="btn" id="m">🎤 Bé nói</button>' : ''}</div>
          <div class="vres" id="o">${SR ? 'Nghe Xíu Mại nói, rồi bấm 🎤 cho bé nói theo.' : 'Bé nói theo, ba mẹ bấm 👍 khi bé nói được.'}</div>
          <button class="btn yes" id="y">👍 Bé nói được rồi</button></div>`);
        const h = () => say(p[0]); $('#h').onclick = h; setTimeout(h, 350);
        $('#y').onclick = () => { say('Good job!'); next(); };
        if (SR) $('#m').onclick = () => {
          const r = new SR(); r.lang = 'en-US'; r.maxAlternatives = 3; const m = $('#m'); m.disabled = true; m.textContent = '👂 Đang nghe…';
          const key = p[0].toLowerCase().replace(/[^a-z' ]/g, '').split(' ').filter(w => w.length > 1);
          r.onresult = e => { const heard = [...e.results[0]].map(a => a.transcript.toLowerCase()).join(' ');
            const hit = key.filter(w => heard.includes(w)).length;
            if (hit >= Math.max(1, Math.ceil(key.length * 0.4))) { $('#o').innerHTML = `Xíu Mại nghe: “${esc(e.results[0][0].transcript)}” 🌟`; say('Great!'); setTimeout(next, 900); }
            else $('#o').innerHTML = `Xíu Mại nghe: “${esc(e.results[0][0].transcript)}”. Thử lại nhé! 💪`; };
          r.onerror = e => { $('#o').textContent = e.error === 'not-allowed' ? 'Cho phép web dùng micro nhé (hoặc bấm 👍).' : 'Chưa nghe rõ, thử lại hoặc bấm 👍.'; };
          r.onend = () => { const m2 = $('#m'); if (m2) { m2.disabled = false; m2.textContent = '🎤 Bé nói'; } };
          try { r.start(); } catch (e) { r.onend(); }
        };
      }
    }
    step();
  }

  /* ================= Video dialogues (Ba Mẹ) ================= */
  const DVIDS = [
    { k: 'rang', vi: 'Đánh răng', id: 'ARhIce1VEpg', ch: 'Everyday English For Kids', t: 'Learn English with Adam & Mom: Brush Your Teeth', alt: 'rmm4GCfaJhY', p: [
      ["Let's brush your teeth.", 'Mình đi đánh răng nào.'], ["Here's your toothbrush.", 'Bàn chải của con đây.'],
      ['Just a little toothpaste.', 'Một chút kem đánh răng thôi.'], ['Open wide!', 'Há miệng to ra nào!'],
      ['Brush up and down.', 'Chải lên, chải xuống.'], ['Round and round.', 'Chải xoay tròn.'],
      ['Spit it out.', 'Nhổ ra nào.'], ["Rinse your mouth. Don't swallow the water.", 'Súc miệng nhé. Đừng nuốt nước nha.'],
      ['Show me your teeth. So clean!', 'Cho mẹ xem răng nào. Sạch quá!'], ['I did it!', 'Con làm được rồi!']] },
  ];
  function dvList() {
    return `<div class="panel dvbox"><div class="ph">🎬 Hội thoại qua video <span class="new">MỚI</span></div><p class="muted" style="margin:0 0 8px;font-size:15px">Hoạt hình mẹ và bé nói chuyện, có phụ đề chạy kèm nghĩa, chạm câu để tua, nghe lại từng câu.</p>
      ${DVIDS.map(v => `<a class="dvc" href="#/bame/video-hoi-thoai/${v.k}"><img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" onerror="this.src='${W(v.k === 'rang' ? 'toothbrush' : 'television')}'"><div><b>${v.vi}</b><small>${esc(v.t)}</small></div><span class="go">›</span></a>`).join('')}</div>`;
  }
  function dvPage(k, alt) {
    const v = DVIDS.find(x => x.k === k); if (!v) return go('#/bame/hoi-thoai');
    const id = alt && v.alt ? v.alt : v.id;
    const extra = `<div class="panel dvp"><div class="ph">💬 Câu mẫu dùng hằng ngày với con</div>
      ${v.p.map(p => `<button class="dvl"><span>🔊</span><div><b>${esc(p[0])}</b><small>${esc(p[1])}</small></div></button>`).join('')}
      ${v.alt ? `<a class="dvalt" href="#/bame/video-hoi-thoai/${v.k}${alt ? '' : '/2'}">🎞️ ${alt ? 'Xem video 1' : 'Xem thêm 1 video khác cùng chủ đề'}</a>` : ''}</div>`;
    R.play(id, { title: `🎬 ${v.vi}`, back: '#/bame/hoi-thoai', vt: alt ? 'Brushing My Teeth (Max, Mia & Teddy)' : v.t, extra }).then(() => {
      setTabs('parent', '');
      app.querySelectorAll('.dvl').forEach((b, j) => b.onclick = () => say(v.p[j][0]));
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
  const origEps = R.eps;
  R.eps = () => { origEps(); const bx = app.querySelector('.eplist'); if (bx) bx.insertAdjacentHTML('beforebegin', dvList()); };
  const origRang = R.ep;
  R.ep = id => { origRang(id); const v = DVIDS.find(x => x.k === id); const t = app.querySelector('.tool'); if (v && t) t.insertAdjacentHTML('afterend', `<a class="dvc mini" href="#/bame/video-hoi-thoai/${v.k}"><span>🎬</span><div><b>Xem video hoạt hình chủ đề này</b><small>Có phụ đề chạy, nghe lại từng câu</small></div><span class="go">›</span></a>`); };

  window.XMX = {
    route(a, b, c, d) {
      if (a === 'giao-tiep') { b ? stopPage(+b, c) : mapPage(); return true; }
      if (a === 'bame' && b === 'video-hoi-thoai') { dvPage(c, d === '2'); return true; }
      if (a === 'bame' && b === 'gio-xem') { stPage(); return true; }
      if (a === 'bame' && b === 'so-tien-bo') { bookPage(); return true; }
      if (a === 'bame' && b === 'giong-doc') { voicePage(); return true; }
      if (a === 'video' && b === 'bai-hat') { R.video('songs'); return true; }
      return false;
    },
    dailyCard, todayPhrase, STOPS, starsOf, unlocked, lockNow: lock,
  };
})();
