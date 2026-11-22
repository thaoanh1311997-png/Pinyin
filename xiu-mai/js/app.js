/* Xíu Mại English — web học tiếng Anh cho bé (từ 2 tuổi) */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app'), tabs = $('#tabs');
const IMG = p => /^https?:/.test(p) ? p : 'img/' + p + (/\.(jpe?g|png|webp)$/i.test(p) ? '' : '.webp');
// never show a broken-image icon: try the mascot once, then hide
document.addEventListener('error', e => { const t = e.target; if (!t || t.tagName !== 'IMG') return; if (!t.dataset.fb && !/ui\/xiumai/.test(t.src)) { t.dataset.fb = 1; t.src = 'img/ui/xiumai.webp'; } else t.style.visibility = 'hidden'; }, true);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

/* ---------- storage ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('xm.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('xm.' + k, JSON.stringify(v)); } catch (e) {} }
};
function day() { let d = LS.get('day', null); if (!d || d.date !== today()) { d = { date: today(), words: [], games: 0, videos: 0, flash: [] }; LS.set('day', d); } return d; }
function bump(k, v) { try { const H = LS.get('hist', {}); const t = today(); const x = H[t] || (H[t] = { w: [], g: 0, v: 0, f: [] }); if (k === 'words') { if (!x.w.includes(v)) x.w.push(v); } else if (k === 'flash') { if (!x.f.includes(v)) x.f.push(v); } else if (k === 'games') x.g++; else if (k === 'videos') x.v++; LS.set('hist', H); } catch (e) {} const d = day(); if (k === 'words') { if (!d.words.includes(v)) d.words.push(v); } else if (k === 'flash') { if (!d.flash.includes(v)) d.flash.push(v); } else d[k]++; LS.set('day', d); }
const stars = () => LS.get('stars', 0);
function addStar(n = 1) { LS.set('stars', stars() + n); const p = $('#starn'); if (p) p.textContent = stars(); }
const favs = () => LS.get('favs', []);

/* ---------- photos for "Từ trên lớp" (IndexedDB) ---------- */
const PH = {}; let db = null;
function idb() { return new Promise(res => { try { const r = indexedDB.open('xiumai', 1); r.onupgradeneeded = () => r.result.createObjectStore('ph'); r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => res(null); } catch (e) { res(null); } }); }
function phPut(id, blob) { return new Promise(res => { if (!db) return res(); const t = db.transaction('ph', 'readwrite'); t.objectStore('ph').put(blob, id); t.oncomplete = res; t.onerror = res; }); }
function phDel(id) { if (!db) return; try { db.transaction('ph', 'readwrite').objectStore('ph').delete(id); } catch (e) {} }
function phLoadAll() { return new Promise(res => { if (!db) return res(); const t = db.transaction('ph'); const s = t.objectStore('ph'); const rq = s.openCursor(); rq.onsuccess = () => { const c = rq.result; if (c) { PH[c.key] = URL.createObjectURL(c.value); c.continue(); } else res(); }; rq.onerror = () => res(); }); }

/* ---------- words / topics ---------- */
const ALL = [];
TOPICS.forEach(t => t.w.forEach(w => ALL.push({ en: w[0], vi: w[1], img: w[2], t: t.k })));
function findImg(en) { en = en.trim().toLowerCase(); const w = ALL.find(x => x.en.toLowerCase() === en) || ALL.find(x => x.en.toLowerCase() === en.replace(/s$/, '')); return w ? w.img : null; }
function custom() { return LS.get('lop', []); }
function topicList() {
  const c = custom(); const L = TOPICS.slice();
  if (c.length) L.unshift({ k: 'lop', vi: 'Từ trên lớp', en: 'From class', c: '#FFE9A8', w: c.map(x => [x.en, x.vi, x.img || '', x.ph || '', x.ex || null]) });
  return L;
}
const topic = k => topicList().find(t => t.k === k);
const CRED = {}; const pslug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function wsrc(w) { if (w[3] && PH[w[3]]) return PH[w[3]]; if (w[2]) return IMG(w[2]); if (w[0] && CRED[w[0]]) return 'img/p/' + pslug(w[0]) + '.jpg'; return IMG('ui/xiumai'); }
const PAL = [['#FCE4EC', '#FFCC00', '#F8C8D8'], ['#E6F5FF', '#4FB3FF', '#CDE9FF'], ['#FFF6D9', '#FF7AA2', '#FFE7A8'], ['#E9FBE2', '#62C94A', '#CBF0BD'], ['#F1EAFF', '#A77BFF', '#DED0FF'], ['#FFF0E3', '#FF9A3C', '#FFDDBF']];

/* ---------- speech ---------- */
let VOICE = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    const pref = ['Ava (Premium)', 'Ava (Enhanced)', 'Samantha (Enhanced)', 'Zoe (Premium)', 'Zoe (Enhanced)', 'Allison (Enhanced)', 'Microsoft Ava Online', 'Microsoft Jenny Online', 'Microsoft Aria Online', 'Google US English', 'Samantha', 'Ava', 'Nicky', 'Allison', 'Karen', 'Google UK English Female', 'Serena'];
    const mine = LS.get('voice', ''); const mv = mine && vs.find(v => v.name === mine); if (mv) { VOICE = mv; return; }
    VOICE = pref.map(n => vs.find(v => v.name.includes(n))).find(Boolean) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  } catch (e) {}
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text, opt = {}) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (VOICE) u.voice = VOICE; u.lang = VOICE ? VOICE.lang : 'en-US';
      u.rate = opt.rate || LS.get('vrate', 0.82); u.pitch = opt.pitch || 1.1;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 900 + text.length * 120);
      speechSynthesis.speak(u);
    } catch (e) { res(); }
  });
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2200); }
function cheer(msg = 'Yay! Good job!', star = false) {
  const el = document.createElement('div'); el.className = 'cheer';
  el.innerHTML = `<div class="box"><img src="${IMG('ui/xiumai')}" alt=""><b>${msg}</b>${star ? '<div style="font-size:26px;font-weight:800">⭐ +1</div>' : ''}</div>`;
  document.body.appendChild(el);
  for (let i = 0; i < 22; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.textContent = pick(['⭐', '🎉', '💛', '🌟', '🎈', '✨']); c.style.left = Math.random() * 100 + 'vw'; c.style.animationDelay = Math.random() * .6 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 2400); }
  say(msg.replace(/[^\w !?'.,]/g, ''));
  return new Promise(r => { const end = () => { el.remove(); r(); }; el.onclick = end; setTimeout(end, 1800); });
}
const clouds = c => `<svg class="clouds" viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 60V32Q30 2 62 28Q92 6 132 30Q170 2 210 28Q250 4 290 28Q330 2 362 26Q386 10 400 22V60Z" fill="${c}"/></svg>`;

/* ---------- layout pieces ---------- */
function setTabs(kind, on) {
  // the Bé ↔ Ba Mẹ switch must be reachable from every screen except the role picker
  if (!kind) { const h = location.hash; if (h && h !== '#/' && h !== '#') kind = h.startsWith('#/bame') ? 'parent' : 'kid'; }
  document.body.classList.toggle('notabs', !kind);
  if (!kind) { tabs.innerHTML = ''; return; }
  const T = kind === 'kid'
    ? [['#/be', '🏠', 'Trang chủ'], ['#/yeu-thich', '💗', 'Yêu thích'], ['#/thanh-tich', '🏆', 'Thành tích'], ['#/bame', '👩', 'Ba Mẹ']]
    : [['#/bame', '🏠', 'Trang chủ'], ['#/bame/tu-lop', '✏️', 'Từ trên lớp'], ['#/bame/cau-noi', '💬', 'Câu nói'], ['#/be', '🧒', 'Khu của Bé']];
  tabs.innerHTML = T.map(([h, i, l]) => `<a href="${h}" class="${h === on ? 'on' : ''}${(kind === 'kid' ? h === '#/bame' : h === '#/be') ? ' sw' : ''}"><span class="i">${i}</span>${l}</a>`).join('');
}
const brand = (big) => `<div class="brand ${big ? 'big' : ''}">${big ? '' : `<img src="${IMG('ui/xiumai')}" alt="">`}<div><span class="b1">Xíu Mại</span><span class="b2">English</span></div></div>`;
const bar = (title, back = '#/be', right = '') => `<div class="bar"><a class="back" href="${back}" aria-label="Quay lại">‹</a><h1>${title}</h1>${right}</div>`;
// shared home header: logo lockup + star counter + always-visible Bé | Ba Mẹ switch
const topbar = (mode) => `<div class="topbar tb-${mode}"><span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span>
  <div class="tb-av"><img src="${IMG('ui/xiumai')}" alt="Xíu Mại"></div>
  <div class="tb-t"><b>Xíu Mại <i>English</i></b><small>${mode === 'kid' ? 'Hôm nay học gì nào? ✨' : 'Góc Ba Mẹ đồng hành cùng con'}</small></div>
  ${mode === 'kid' ? `<div class="tb-star"><img src="${IMG('w/star')}" alt=""><span id="starn">${stars()}</span></div>` : ''}</div>
  <div class="hseg"><a href="#/be" class="${mode === 'kid' ? 'on' : ''}"><img src="${IMG('w/teddy-bear')}" alt="">Bé</a><a href="#/bame" class="${mode === 'kid' ? '' : 'on'}"><img src="${IMG('w/laptop')}" alt="">Ba Mẹ</a></div>`;
const starPill = () => `<div class="pill"><img src="${IMG('w/star')}" alt="">  <span id="starn">${stars()}</span></div>`;
function view(html) { app.innerHTML = `<div class="view">${html}</div>`; window.scrollTo(0, 0); }

/* ---------- screens ---------- */
const R = {};
R.role = () => {
  setTabs(null);
  view(`<div class="role"><img class="rmasc" src="${IMG('ui/xiumai')}" alt="Xíu Mại">${brand(true)}
  <h2>Bạn muốn vào khu vực nào?</h2>
  <a class="rbtn rk" href="#/be"><img src="${IMG('w/teddy-bear')}" alt=""><span>Dành cho<b>Bé</b></span><i>›</i></a>
  <a class="rbtn rp" href="#/bame"><img src="${IMG('w/laptop')}" alt=""><span>Dành cho<b>Ba Mẹ</b></span><i>›</i></a></div>`);
};
function wotd() { const d = new Date(); const n = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % ALL.length; return ALL[(n * 37) % ALL.length]; }
R.be = () => {
  setTabs('kid', '#/be');
  const w = wotd();
  const G = window.XMX; if (G && G.ensureStops) G.ensureStops(); const S = G ? G.STOPS : [];
  let ci = S.findIndex((x, i) => G.unlocked(i) && G.starsOf(i) < 3); if (ci < 0) ci = S.length - 1;
  const st = S[ci];
  view(`${topbar('kid')}
  <div class="khome">
   ${st ? `<a class="jcard" href="#/giao-tiep"><img class="jm" src="${IMG('ui/xiumai')}" alt=""><div class="jt"><span class="tag">🗺️ Học giao tiếp</span><b>Chặng ${ci + 1}: ${st.vi}</b><span class="js">${[0, 1, 2].map(k => `<i class="${k < G.starsOf(ci) ? 'y' : ''}">★</i>`).join('')}</span></div><span class="jgo">Đi tiếp ▶</span><img class="ji" src="${IMG(st.ic.includes('/') ? st.ic : 'w/' + st.ic)}" alt=""></a>` : ''}
   <div class="tiles">
    <a class="tile t1" href="#/chu-de/flash"><div class="ic"><span class="card2"></span><span class="card1"><img src="${IMG('w/red-apple')}" alt=""></span></div><span class="lb">Flashcard</span></a>
    <a class="tile t3" href="#/game"><div class="ic"><img src="${IMG('w/video-game')}" alt=""><img class="bug" src="${IMG('w/puzzle-piece')}" alt=""></div><span class="lb">Trò chơi</span></a>
    <a class="tile t2" href="#/video"><div class="ic"><img src="${IMG('w/television')}" alt=""><img class="bug" src="${IMG('w/musical-notes')}" alt=""></div><span class="lb">Video & Bài hát</span></a>
    <a class="tile t4" href="#/nang-cao"><div class="ic"><img src="${IMG('w/books')}" alt=""><img class="bug" src="${IMG('w/speech-balloon')}" alt=""></div><span class="lb">Nâng cao</span></a>
   </div>
   <button class="wotd" id="wotd"><img src="${wsrc([w.en, w.vi, w.img])}" alt=""><span><small>🌟 Từ của hôm nay</small><b>${esc(w.en)}</b><em>${esc(w.vi)}</em></span><i>🔊</i></button></div>`);
  $('#wotd').onclick = () => { say(w.en); bump('words', w.en); toast(`${w.en} = ${w.vi}`); };
};
R.topics = mode => {
  setTabs('kid', '');
  const L = topicList(); const d = LS.get('seen', {});
  view(bar('Flashcard · Chọn chủ đề') + `<div class="fsearch"><input id="fq" type="search" placeholder="🔍 Tìm từ: dog, con chó…" autocomplete="off"></div><div class="wgrid" id="fres" hidden></div><div class="grid" id="tgrid">${L.map(t => {
    const n = t.w.filter(w => d[w[0]]).length, p = Math.round(n / t.w.length * 100);
    return `<a class="tcard" href="#/${mode === 'flash' ? 'flash' : 'kham-pha'}/${t.k}" style="background:${t.c}"><img class="ic" src="${t.w[0] ? wsrc(t.w[0]) : IMG('ui/xiumai')}" alt=""><b>${t.vi}</b><small>${t.en} · ${t.w.length} từ</small><div class="prog"><i style="width:${p}%"></i></div></a>`;
  }).join('')}</div>`);
  const strip = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  $('#fq').oninput = () => {
    const q = strip($('#fq').value.trim()), res = $('#fres'), g = $('#tgrid');
    if (!q) { res.hidden = true; g.hidden = false; return; }
    const hits = []; for (const t of L) t.w.forEach((w, i) => { if (hits.length < 60 && (strip(w[0]).includes(q) || strip(w[1]).includes(q))) hits.push([t, w, i]); });
    res.hidden = false; g.hidden = true;
    res.innerHTML = hits.length ? hits.map(([t, w, i]) => `<a class="wbox" href="#/flash/${t.k}/${i}"><img src="${wsrc(w)}" alt=""><b>${esc(w[0])}</b><small>${esc(w[1])}</small></a>`).join('') : '<p class="muted">Chưa có từ này. Ba mẹ thêm ở mục “Từ trên lớp” nha.</p>';
  };
};
R.flash = (k, i) => {
  const t = topic(k); if (!t || !t.w.length) return go('#/chu-de/flash');
  setTabs(null);
  i = Math.max(0, Math.min(t.w.length - 1, +i || 0));
  const w = t.w[i], pal = PAL[i % PAL.length], isFav = favs().includes(w[0] + '|' + k);
  const hideVi = LS.get('hidevi', false);
  view(bar(`${t.vi} <span class="muted" style="font-size:17px">${i + 1}/${t.w.length}</span>`, '#/chu-de/flash', starPill()) + `
  <div class="fwrap"><div class="fcard" id="fc" style="background:${pal[0]};border-color:${pal[1]}">
   <button class="fav" id="fav" aria-label="Yêu thích">${isFav ? '💗' : '🤍'}</button><button class="spk" id="spk" aria-label="Nghe">🔊</button>
   <img class="pic" src="${wsrc(w)}" alt="${esc(w[0])}"><div class="shadow"></div>
   <div class="w">${esc(w[0])}</div><div class="v" id="vi">${hideVi ? '' : esc(w[1])}</div>${w[4] && w[4][0] ? `<div class="fex">💬 ${esc(w[4][0])}${hideVi || !w[4][1] ? '' : `<small>${esc(w[4][1])}</small>`}</div>` : ''}${clouds(pal[2])}</div>
  <div class="fnav"><button class="big" id="prev" aria-label="Trước">◀</button><button class="big pri" id="again">🔊 Nghe lại</button><button class="big" id="next" aria-label="Tiếp">▶</button></div>
  <div class="dots">${t.w.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
  <div style="text-align:center;margin-top:10px"><button class="pill" style="display:inline-flex" id="tvi">${hideVi ? '👀 Hiện nghĩa' : '🙈 Ẩn nghĩa'}</button></div></div>`);
  const seen = LS.get('seen', {}); seen[w[0]] = 1; LS.set('seen', seen); bump('words', w[0]);
  const sp = () => say(w[0]);
  setTimeout(sp, 250);
  $('#spk').onclick = e => { e.stopPropagation(); sp(); };
  $('#again').onclick = sp; $('#fc').onclick = sp;
  $('#fav').onclick = e => { e.stopPropagation(); let f = favs(); const id = w[0] + '|' + k; f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]; LS.set('favs', f); e.currentTarget.textContent = f.includes(id) ? '💗' : '🤍'; };
  $('#tvi').onclick = () => { LS.set('hidevi', !hideVi); R.flash(k, i); };
  const nav = d => {
    const n = i + d;
    if (n >= t.w.length) {
      const dd = day(); const first = !dd.flash.includes(k); bump('flash', k);
      if (first) addStar(); cheer('Yay! All done!', first).then(() => go('#/chu-de/flash'));
      return;
    }
    if (n >= 0) go(`#/flash/${k}/${n}`);
  };
  $('#prev').onclick = () => nav(-1); $('#next').onclick = () => nav(1);
  swipe($('#fc'), d => nav(d));
};
function swipe(el, cb) { let x0 = null, y0 = 0; el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true }); el.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) cb(dx < 0 ? 1 : -1); }); }
/* ---------- Ghép câu (sentence builder, replaces the old "Khám phá" word grid) ---------- */
const SB_TOPICS = ['animals', 'fruits', 'toys', 'vehicles', 'food', 'wild', 'sea', 'bugs', 'birds', 'vegetables', 'sweets', 'drinks', 'clothes', 'baby', 'home', 'kitchen', 'things', 'school', 'flowers', 'tools'];
const MASS = new Set(['rice', 'bread', 'milk', 'water', 'juice', 'orange juice', 'tea', 'coffee', 'hot chocolate', 'smoothie', 'coconut water', 'soda', 'milk tea', 'ice', 'cheese', 'butter', 'honey', 'jam', 'salt', 'sugar', 'tofu', 'yogurt', 'cereal', 'soup', 'porridge', 'meat', 'chicken meat', 'fish meat', 'spaghetti', 'salad', 'pho', 'ice cream', 'chocolate', 'candy', 'popcorn', 'pudding', 'shaved ice', 'chips', 'jelly', 'money', 'paper', 'toilet paper', 'play dough', 'bubbles', 'tape', 'rope', 'thread', 'glue', 'chalk', 'paint', 'herbs', 'bean sprouts', 'wet wipes', 'baby shampoo', 'toothpaste', 'grass', 'sand', 'wood', 'fish', 'sushi']);
const SUBJ = [['I', 'Con', 'w/child', false], ['Mommy', 'Mẹ', 'w/woman', true], ['Daddy', 'Ba', 'w/man', true], ['Xíu Mại', 'Xíu Mại', 'ui/xiumai', true]];
function sbVerbs(k) {
  const V = [['see', 'thấy', 'w/eyes'], ['like', 'thích', 'w/red-heart'], ['want', 'muốn', 'w/sparkles'], ['have', 'có', 'w/hand-with-fingers-splayed']];
  if (['fruits', 'food', 'sweets', 'vegetables'].includes(k)) V.push(['eat', 'ăn', 'w/fork-and-knife-with-plate']);
  if (k === 'drinks') V.push(['drink', 'uống', 'w/cup-with-straw']);
  if (['toys', 'vehicles', 'animals'].includes(k)) V.push(['play with', 'chơi với', 'w/soccer-ball']);
  return V;
}
const art = en => { const l = en.toLowerCase(); if (MASS.has(l) || /(s|ies)$/.test(l) && !/(bus|glass|grass|dress|cactus|octopus|hippopotamus|asparagus|walrus|bass|lotus|hibiscus|watermelon)$/.test(l)) return ''; return /^(a|e|i|o|u|hour)/.test(l) && !/^(uni|use|ufo)/.test(l) ? 'an ' : 'a '; };
const verbS = (v, third) => third ? (v === 'have' ? 'has' : v === 'play with' ? 'plays with' : v + 's') : v;
R.explore = k => {
  const L = topicList().filter(t => SB_TOPICS.includes(t.k) || t.k === 'lop');
  const t = topic(k) && L.includes(topic(k)) ? topic(k) : topic('animals');
  setTabs('kid', '');
  const st = { s: 0, v: 0, n: null, pool: [], made: 0 };
  const verbs = sbVerbs(t.k);
  const shuffle = () => { st.pool = t.w.filter(w => !['coffee', 'soda', 'tea', 'milk tea', 'knife', 'axe', 'saw', 'scissors'].includes(w[0])).slice().sort(() => Math.random() - .5).slice(0, 8); };
  shuffle();
  view(bar('Ghép câu', '#/be', starPill()) + `<div class="seg">${L.map(x => `<button data-k="${x.k}" class="${x.k === t.k ? 'on' : ''}">${x.vi}</button>`).join('')}</div>
  <div class="sbox" id="sbox"></div>
  <div class="srow"><span class="sq">Ai?</span><div class="sch" id="ss"></div></div>
  <div class="srow"><span class="sq">Làm gì?</span><div class="sch" id="sv"></div></div>
  <div class="srow"><span class="sq">Cái gì? <button class="pill" id="mix" style="display:inline-flex;padding:2px 10px;font-size:14px">🔀 Đổi hình</button></span><div class="sgrid" id="sn"></div></div>`);
  app.querySelectorAll('.seg button').forEach(b => b.onclick = () => go('#/kham-pha/' + b.dataset.k));
  const sentence = () => {
    const S = SUBJ[st.s], V = verbs[st.v], N = st.n;
    if (!N) return null;
    const ar = art(N[0]) && V[0] === 'like' ? 'the ' : art(N[0]);
    const en = `${S[0]} ${verbS(V[0], S[3])} ${ar}${N[0]}`;
    return { en, vi: `${S[1]} ${V[1]} ${N[1]}.`, words: [[S[0], IMG(S[2])], ...verbS(V[0], S[3]).split(' ').map((w, i) => [w, i ? '' : IMG(V[2])]), ...(ar ? [[ar.trim(), '']] : []), [N[0], wsrc(N)]] };
  };
  const render = (speak) => {
    $('#ss').innerHTML = SUBJ.map((x, i) => `<button class="chipw ${i === st.s ? 'on' : ''}" data-i="${i}"><img src="${IMG(x[2])}" alt=""><b>${esc(x[0])}</b><small>${x[1]}</small></button>`).join('');
    $('#sv').innerHTML = verbs.map((x, i) => `<button class="chipw ${i === st.v ? 'on' : ''}" data-i="${i}"><img src="${IMG(x[2])}" alt=""><b>${x[0]}</b><small>${x[1]}</small></button>`).join('');
    $('#sn').innerHTML = st.pool.map((w, i) => `<button class="sn ${st.n === w ? 'on' : ''}" data-i="${i}"><img src="${wsrc(w)}" alt=""><b>${esc(w[0])}</b></button>`).join('');
    const sn = sentence();
    $('#sbox').innerHTML = sn ? `<div class="stiles" id="stl">${sn.words.map(([w, img]) => `<span class="stile">${img ? `<img src="${img}" alt="">` : ''}<b>${esc(w)}</b></span>`).join('')}<span class="stile dot"><b>.</b></span></div><div class="svi">${esc(sn.vi)}</div><button class="big pri" id="sread">🔊 Đọc câu</button>`
      : `<div class="shint"><img src="${IMG('ui/xiumai')}" alt=""><span>Chọn <b>Ai</b>, <b>Làm gì</b>, rồi chạm một <b>hình</b> để ghép câu nha!</span></div>`;
    $('#ss').querySelectorAll('button').forEach(b => b.onclick = () => { st.s = +b.dataset.i; say(SUBJ[st.s][0]); render(!!st.n); });
    $('#sv').querySelectorAll('button').forEach(b => b.onclick = () => { st.v = +b.dataset.i; say(verbs[st.v][0]); render(!!st.n); });
    $('#sn').querySelectorAll('button').forEach(b => b.onclick = () => { st.n = st.pool[b.dataset.i]; bump('words', st.n[0]); render(true); });
    if (sn) $('#sread').onclick = () => read(sn);
    if (speak && sn) read(sn, true);
  };
  const read = async (sn, count) => {
    const tl = $('#stl'); if (tl) tl.classList.add('speak');
    await say(sn.en + '.', { rate: 0.75 });
    if ($('#stl')) $('#stl').classList.remove('speak');
    if (count) { st.made++; if (st.made % 5 === 0) { addStar(); cheer('Great sentences!', true); } }
  };
  $('#mix').onclick = () => { shuffle(); st.n = null; render(false); };
  render(false);
};
/* ---------- games ---------- */
const GAMES = [
  ['doan', 'Đoán từ', 'What is this?', 'w/red-apple', '#FFE3B8'],
  ['nghe', 'Nghe và chọn hình', 'Where is the cat?', 'w/speaker-high-volume', '#D4F1FF'],
  ['bong', 'Bắn bong bóng', 'Pop the balloon!', 'w/balloon', '#FFD6DE'],
  ['lat', 'Lật thẻ tìm cặp', 'Memory', 'w/sparkles', '#E9D8FF'],
  ['banh', 'Đá banh', 'Kick the ball!', 'w/soccer-ball', '#D8F5D0'],
  ['noi', 'Nói theo', 'Say it!', 'w/microphone', '#FFE0EC'],
  ['an', 'Cho thú ăn', 'Feed the bunny!', 'w/rabbit-face', '#FFF0C2'],
];
const EASY = ['animals', 'fruits', 'vehicles', 'toys', 'wild', 'sea', 'food', 'bugs', 'vegetables', 'clothes'];
const PUZ = ['animals', 'wild', 'fruits', 'vehicles', 'sea', 'toys', 'bugs', 'vegetables'];
function gameTopic(k, list = EASY) { if (!k && custom().length >= 4) k = 'lop'; if (k === 'all') k = null; const t = topic(k); if (t && t.w.length >= 4) return t; return topic(pick(list)); }
function topicSel(g, k) { return `<div class="seg">${['all', ...topicList().filter(t => t.w.length >= 4 && t.k !== 'numbers').map(t => t.k)].map(x => { const t = topic(x); return `<button data-k="${x}" class="${(k || (custom().length >= 4 ? 'lop' : 'all')) === x ? 'on' : ''}">${x === 'all' ? '🎲 Ngẫu nhiên' : t.vi}</button>`; }).join('')}</div>`; }
function bindSel(g) { app.querySelectorAll('.seg button').forEach(b => b.onclick = () => go(`#/game/${g}/${b.dataset.k}`)); }
R.games = () => {
  setTabs('kid', '');
  view(bar('Trò chơi', '#/be', starPill()) + `<div class="grid"><a class="tcard" href="#/kham-pha" style="background:#FFF1C9"><img class="ic" src="${IMG('w/speech-balloon')}" alt=""><b>Ghép câu</b><small>Make a sentence</small></a>${GAMES.map(g => `<a class="tcard" href="#/game/${g[0]}" style="background:${g[4]}"><img class="ic" src="${IMG(g[3])}" alt=""><b>${g[1]}</b><small>${g[2]}</small></a>`).join('')}</div>`);
};
function roundDone(score) { bump('games'); addStar(); return cheer('Yay! Good job!', true); }
R.g_doan = (k) => {
  setTabs(null);
  let t = gameTopic(k), n = 0, hearts = 3;
  const play = () => {
    if (!k) t = gameTopic();
    const w = pick(t.w), opts = shuffle([w, ...shuffle(t.w.filter(x => x[0] !== w[0])).slice(0, 2)]);
    view(bar('Đoán từ', '#/game', starPill()) + topicSel('doan', k) + `<div class="hearts">${'⭐'.repeat(n)}${'<span style="opacity:.25">⭐</span>'.repeat(5 - n)}</div>
     <div class="gq"><button id="rep">🔊</button><span>What is this?</span></div><img class="gpic" src="${wsrc(w)}" alt="">
     <div class="gopts">${opts.map(o => `<button class="gopt" data-w="${esc(o[0])}"><span class="gsp">🔊</span>${esc(o[0])}</button>`).join('')}</div>`);
    bindSel('doan');
    say('What is this?');
    $('#rep').onclick = () => say('What is this?');
    app.querySelectorAll('.gopt').forEach(b => b.onclick = async () => {
      if (b.dataset.w === w[0]) { b.classList.add('ok'); n++; await say(w[0] + '! Good job!'); if (n >= 5) { await roundDone(); n = 0; } play(); }
      else { b.classList.add('no'); say(b.dataset.w + '? Try again!'); }
    });
  };
  play();
};
const lev = (a, b) => { const m = a.length, n = b.length, d = [...Array(n + 1).keys()]; for (let i = 1; i <= m; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= n; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[n]; };
R.g_noi = (k) => {
  setTabs(null);
  let n = 0;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const play = () => {
    const t = gameTopic(k); const w = pick(t.w);
    view(bar('Nói theo', '#/game', starPill()) + topicSel('noi', k) + `<div class="hearts">${'⭐'.repeat(n)}${'<span style="opacity:.25">⭐</span>'.repeat(5 - n)}</div>
     <img class="gpic noip" src="${wsrc(w)}" alt=""><div class="noiw">${esc(w[0])}</div><div class="noiv">${esc(w[1] || '')}</div>
     <div class="noib"><button class="noil" id="rep">🔊<small>Nghe</small></button>${SR ? `<button class="noim" id="mic"><img src="${IMG('w/microphone')}" alt=""><small>Bé nói</small></button>` : ''}<button class="noil" id="ok">👍<small>Ba mẹ khen</small></button></div>
     <div class="noir" id="res">${SR ? 'Nghe mẫu rồi bấm micro, bé nói theo nhé!' : 'Nghe mẫu, bé nói theo. Ba mẹ bấm 👍 khi bé nói được.'}</div>`);
    bindSel('noi');
    const ex = 'Say: ' + w[0] + '!';
    setTimeout(() => say(ex), 300); $('#rep').onclick = () => say(w[0], { rate: 0.8 });
    const win = async () => { n++; $('#res').innerHTML = '🌟 Giỏi quá!'; await say('Yes! ' + w[0] + '! Great job!'); if (n >= 5) { await roundDone(); n = 0; } if (location.hash.startsWith('#/game/noi')) play(); };
    $('#ok').onclick = win;
    if (SR) $('#mic').onclick = () => {
      const r = new SR(), b = $('#mic'); r.lang = 'en-US'; r.maxAlternatives = 5; b.classList.add('on'); $('#res').textContent = '👂 Đang nghe bé nói…';
      let got = false;
      r.onresult = e => { got = true; const target = w[0].toLowerCase(); const alts = [...e.results[0]].map(a => a.transcript.toLowerCase().replace(/[^a-z ]/g, '').trim());
        const good = alts.some(a => a.includes(target) || a.split(' ').some(x => x && (lev(x, target) <= Math.max(1, Math.floor(target.length * .4)) || (x.length > 1 && target.startsWith(x.slice(0, 2))))));
        if (good) win(); else { $('#res').innerHTML = `Bé nói “${esc(alts[0] || '…')}”. Thử lại nha! 💪`; say(w[0], { rate: 0.8 }); } };
      r.onerror = () => { $('#res').textContent = 'Chưa nghe rõ, bấm micro nói lại nha. (Ba mẹ có thể bấm 👍)'; };
      r.onend = () => { b.classList.remove('on'); if (!got && $('#res').textContent.startsWith('👂')) $('#res').textContent = 'Chưa nghe rõ, bấm micro nói lại nha.'; };
      try { r.start(); } catch (e) { r.onend(); }
    };
  };
  play();
};
// feeding game: only things you can eat or drink (never animals/objects)
const FOODT = ['fruits', 'vegetables', 'food', 'sweets', 'drinks'], FOODK = ['lop', ...FOODT];
const NOFEED = new Set(['tea', 'coffee', 'soda', 'milk tea', 'ice', 'hot chocolate', 'chili', 'salt', 'sugar', 'pepper']);
const isFood = en => !NOFEED.has(en.toLowerCase()) && ALL.some(x => FOODT.includes(x.t) && x.en.toLowerCase() === en.toLowerCase());
const foodLop = () => (topic('lop') || { w: [] }).w.filter(w => isFood(w[0]) || isFood(singular(w[0].toLowerCase())));
function foodTopic(k) {
  if (FOODT.includes(k)) { const T = topic(k); return { k, vi: T.vi, w: T.w.filter(w => !NOFEED.has(w[0].toLowerCase())) }; }
  const L = foodLop(); if ((k === 'lop' || !k) && L.length >= 3) return { k: 'lop', vi: 'Từ trên lớp', w: L };
  return foodTopic(pick(FOODT));
}
// people can eat anything; animals only get fruit (bunny/monkey/piggy really eat fruit)
const KIDS = [['baby', 'w/baby'], ['boy', 'w/boy'], ['girl', 'w/girl']], FRUITERS = [['bunny', 'w/rabbit-face'], ['monkey', 'w/monkey-face'], ['piggy', 'w/pig-face']];
const isFruit = en => { en = en.toLowerCase(); return ALL.some(x => x.t === 'fruits' && [en, singular(en)].includes(x.en.toLowerCase())); };
const feeder = w => isFruit(w[0]) && Math.random() < .6 ? pick(FRUITERS) : pick(/honey|candy|coffee/i.test(w[0]) ? KIDS.slice(1) : KIDS);
// keep the page from sliding sideways on phones
addEventListener('scroll', () => { if (scrollX) scrollTo(0, scrollY); }, { passive: true });
R.g_an = (k) => {
  setTabs(null);
  let n = 0;
  const play = () => {
    const t = foodTopic(k); const w = pick(t.w), opts = shuffle([w, ...shuffle(t.w.filter(x => x[0] !== w[0])).slice(0, 2)]);
    const [an, ai] = feeder(w); const q = `Give the ${an} the ${w[0]}!`;
    view(bar('Cho thú ăn', '#/game', starPill()) + `<div class="seg">${FOODK.filter(x => x !== 'lop' || foodLop().length >= 3).map(x => `<button data-k="${x}" class="${t.k === x ? 'on' : ''}">${x === 'lop' ? 'Từ trên lớp' : topic(x).vi}</button>`).join('')}</div>` + `<div class="hearts">${'⭐'.repeat(n)}${'<span style="opacity:.25">⭐</span>'.repeat(5 - n)}</div>
     <div class="gq"><button id="rep">🔊</button><span>Give the ${an} the <b>${esc(w[0])}</b>!</span></div>
     <div class="feed"><div class="fan" id="fan"><img src="${IMG(ai)}" alt=""><div class="fmouth"></div></div>
     <div class="fitems">${opts.map(o => `<div class="fit" data-w="${esc(o[0])}"><img src="${wsrc(o)}" alt="" draggable="false"></div>`).join('')}</div>
     <div class="kickhint">👆 Kéo hoặc chạm vào đồ ăn đúng</div></div>`);
    bindSel('an');
    say(q); $('#rep').onclick = () => say(q);
    const fan = $('#fan'); let busy = false;
    const give = async (el) => {
      if (busy) return; busy = true;
      const fr = fan.getBoundingClientRect(), er = el.getBoundingClientRect();
      el.style.transition = 'transform .45s cubic-bezier(.3,.8,.4,1)'; el.style.transform = `translate(${fr.left + fr.width / 2 - er.left - er.width / 2}px,${fr.top + fr.height * .62 - er.top - er.height / 2}px) scale(.35)`;
      await new Promise(r => setTimeout(r, 460));
      if (el.dataset.w === w[0]) { el.style.opacity = 0; fan.classList.add('yum'); n++; await say('Yum yum! ' + w[0] + '!'); if (n >= 5) { await roundDone(); n = 0; } if (location.hash.startsWith('#/game/an')) play(); }
      else { fan.classList.add('nope'); el.style.transform = ''; await say('No, thank you! That is ' + (/^[aeiou]/i.test(el.dataset.w) ? 'an ' : 'a ') + el.dataset.w + '.'); fan.classList.remove('nope'); el.classList.add('no'); busy = false; }
    };
    app.querySelectorAll('.fit').forEach(el => {
      let sx, sy, moved = false;
      const reset = () => { if (sx == null) return; sx = null; el.classList.remove('drag'); if (!busy) { el.style.transition = 'transform .3s'; el.style.transform = ''; } };
      el.addEventListener('pointerdown', e => { if (busy) return; e.preventDefault(); sx = e.clientX; sy = e.clientY; moved = false; try { el.setPointerCapture(e.pointerId); } catch (_) {} el.style.transition = 'none'; el.classList.add('drag'); });
      el.addEventListener('pointermove', e => { if (sx == null) return; const W = innerWidth, H = innerHeight, cx = Math.max(10, Math.min(W - 10, e.clientX)), cy = Math.max(10, Math.min(H - 10, e.clientY)); const dx = cx - sx, dy = cy - sy; if (Math.hypot(dx, dy) > 8) moved = true; el.style.transform = `translate(${dx}px,${dy}px) scale(1.05)`; });
      el.addEventListener('pointercancel', reset); el.addEventListener('lostpointercapture', () => setTimeout(reset, 0));
      el.addEventListener('pointerup', e => { if (sx == null) return; sx = null; el.classList.remove('drag');
        const fr = fan.getBoundingClientRect(); const near = e.clientX > fr.left - 30 && e.clientX < fr.right + 30 && e.clientY > fr.top - 30 && e.clientY < fr.bottom + 40;
        if (!moved || near) give(el); else { el.style.transition = 'transform .3s'; el.style.transform = ''; } });
    });
  };
  play();
};
R.g_nghe = (k) => {
  setTabs(null);
  let n = 0;
  const play = () => {
    const t = gameTopic(k); const lv = Math.min(LS.get('ngheN', 4), 8, t.w.length); const w = pick(t.w), opts = shuffle([w, ...shuffle(t.w.filter(x => x[0] !== w[0])).slice(0, lv - 1)]);
    const q = `Where is the ${w[0]}?`;
    view(bar('Nghe và chọn hình', '#/game', starPill()) + topicSel('nghe', k) + `<div class="hearts">${'⭐'.repeat(n)}${'<span style="opacity:.25">⭐</span>'.repeat(5 - n)}</div>
     <div class="gq"><button id="rep">🔊</button><span>Where is the <b>${esc(w[0])}</b>?</span></div>
     <div class="glv">Cấp ${lv - 3} · ${lv} hình</div><div class="gimgs n${lv}">${opts.map(o => `<button class="gimg" data-w="${esc(o[0])}"><img src="${wsrc(o)}" alt=""></button>`).join('')}</div>`);
    bindSel('nghe');
    say(q); $('#rep').onclick = () => say(q);
    app.querySelectorAll('.gimg').forEach(b => b.onclick = async () => {
      if (b.dataset.w === w[0]) { b.classList.add('ok'); n++; await say('Yes! ' + w[0] + '!'); if (n >= 5) { LS.set('ngheN', Math.min(8, LS.get('ngheN', 4) + 1)); await roundDone(); n = 0; } if (location.hash.startsWith('#/game/nghe')) play(); }
      else { b.classList.add('no'); say('This is ' + (/^[aeiou]/i.test(b.dataset.w) ? 'an ' : 'a ') + b.dataset.w + '. Try again!'); }
    });
  };
  play();
};
R.g_bong = (k) => {
  setTabs(null);
  let n = 0, timer = null, target = null;
  const t = gameTopic(k === 'colors' ? null : k);
  view(bar('Bắn bong bóng', '#/game', starPill()) + topicSel('bong', k) + `<div class="hearts" id="hs"></div><div class="gq"><button id="rep">🔊</button><span id="q"></span></div><div class="balloons" id="sky2"></div>`);
  bindSel('bong');
  const sky = $('#sky2'); const COLS = ['#FF6B8B', '#FFC93C', '#5BC0FF', '#7BD35A', '#B48CFF', '#FF9F43'];
  const hs = () => $('#hs').innerHTML = '⭐'.repeat(n) + '<span style="opacity:.25">⭐</span>'.repeat(5 - n);
  const newTarget = () => { target = pick(t.w); $('#q').innerHTML = `Pop the <b>${esc(target[0])}</b>!`; say('Pop the ' + target[0] + '!'); hs(); };
  const spawn = () => {
    if (!document.body.contains(sky)) { clearInterval(timer); return; }
    const w = Math.random() < .4 ? target : pick(t.w);
    const b = document.createElement('button'); b.className = 'bl';
    const W = sky.clientWidth; if (sky.querySelectorAll('.bl').length >= 5) return; b.style.left = (8 + Math.random() * Math.max(10, W - 140)) + 'px';
    b.style.background = pick(COLS); b.style.animationDuration = (10 + Math.random() * 3) + 's';
    b.innerHTML = `<img src="${wsrc(w)}" alt="">`;
    b._hit = async () => {
      if (b._done) return;
      if (w[0] === target[0]) { b._done = 1; b.style.transition = 'transform .2s,opacity .2s'; b.style.transform += ' scale(1.6)'; b.style.opacity = 0; setTimeout(() => b.remove(), 200); n++; hs(); await say('Pop! ' + w[0] + '!'); if (n >= 5) { clearInterval(timer); await roundDone(); n = 0; timer = setInterval(spawn, 1600); } newTarget(); }
      else { b.classList.add('no'); say(w[0] + '!'); }
    };
    b.addEventListener('animationend', () => b.remove());
    sky.appendChild(b);
  };
  // tap anywhere near a balloon pops it (moving targets are hard for small fingers)
  sky.addEventListener('pointerdown', e => {
    e.preventDefault(); let best = null, bd = 1e9;
    sky.querySelectorAll('.bl').forEach(x => { if (x._done) return; const r = x.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = x; } });
    if (best && bd < 110) best._hit();
  });
  $('#rep').onclick = () => say('Pop the ' + target[0] + '!');
  newTarget(); spawn(); timer = setInterval(spawn, 1600);
};
R.g_banh = (k) => {
  setTabs(null);
  let n = 0;
  const play = () => {
    const t = gameTopic(k); const w = pick(t.w), opts = shuffle([w, ...shuffle(t.w.filter(x => x[0] !== w[0])).slice(0, 2)]);
    const q = `Kick the ball to the ${w[0]}!`;
    view(bar('Đá banh', '#/game', starPill()) + topicSel('banh', k) + `<div class="hearts">${'⭐'.repeat(n)}${'<span style="opacity:.25">⭐</span>'.repeat(5 - n)}</div>
     <div class="gq"><button id="rep">🔊</button><span>Kick to the <b>${esc(w[0])}</b>!</span></div>
     <div class="pitch"><div class="goals">${opts.map(o => `<button class="goal" data-w="${esc(o[0])}"><span class="net"></span><img src="${wsrc(o)}" alt=""></button>`).join('')}</div>
     <img class="ball" id="ball" src="${IMG('w/soccer-ball')}" alt=""><div class="kickhint">👆 Chạm vào khung thành đúng hình</div></div>`);
    bindSel('banh');
    say(q); $('#rep').onclick = () => say(q);
    let busy = false;
    app.querySelectorAll('.goal').forEach(g => g.onclick = async () => {
      if (busy) return; busy = true;
      const ball = $('#ball'), br = ball.getBoundingClientRect(), gr = g.getBoundingClientRect();
      const dx = gr.left + gr.width / 2 - (br.left + br.width / 2), dy = gr.top + gr.height * .55 - (br.top + br.height / 2);
      ball.style.transition = 'transform .55s cubic-bezier(.2,.7,.3,1)'; ball.style.transform = `translate(${dx}px,${dy}px) rotate(540deg) scale(.6)`;
      await new Promise(r => setTimeout(r, 560));
      if (g.dataset.w === w[0]) { g.classList.add('ok'); n++; await say('Goal! ' + w[0] + '!'); if (n >= 5) { await roundDone(); n = 0; } if (location.hash.startsWith('#/game/banh')) play(); }
      else {
        g.classList.add('no'); ball.style.transform = 'translate(0,0) rotate(0) scale(1)';
        await say('This is ' + (/^[aeiou]/i.test(g.dataset.w) ? 'an ' : 'a ') + g.dataset.w + '. Try again!'); busy = false;
      }
    });
  };
  play();
};
R.g_ghep = (k) => {
  setTabs(null);
  const size = LS.get('puz', 2);
  const t = gameTopic(k, PUZ);
  const pool = t.w.map(w => ({ src: wsrc(w), en: w[0] }));
  const it = pick(pool);
  const N = size * size; let order = shuffle([...Array(N).keys()]); while (order.every((v, i) => v === i)) order = shuffle(order);
  let sel = null;
  const draw = () => {
    view(bar('Ghép hình', '#/game', starPill()) + topicSel('ghep', k) + `<div class="tool"><button id="s2" style="${size === 2 ? 'background:#FF5C8A;color:#fff' : ''}">Dễ (4 mảnh)</button><button id="s3" style="${size === 3 ? 'background:#FF5C8A;color:#fff' : ''}">Khó (9 mảnh)</button></div>
    <div class="puz" id="pz" style="grid-template-columns:repeat(${size},1fr)">${order.map((p, i) => { const x = p % size, y = p / size | 0; return `<button class="pz ${sel === i ? 'sel' : ''}" data-i="${i}" style="background-image:url('${it.src}');background-size:${size * 100}% ${size * 100}%;background-position:${size > 1 ? x / (size - 1) * 100 : 0}% ${size > 1 ? y / (size - 1) * 100 : 0}%;background-color:#FFF8EA"></button>`; }).join('')}</div>
    <p class="muted" style="text-align:center;margin:4px">Chạm 2 mảnh để đổi chỗ cho nhau</p>`);
    bindSel('ghep');
    $('#s2').onclick = () => { LS.set('puz', 2); R.g_ghep(k); }; $('#s3').onclick = () => { LS.set('puz', 3); R.g_ghep(k); };
    app.querySelectorAll('.pz').forEach(b => b.onclick = async () => {
      const i = +b.dataset.i;
      if (sel == null) { sel = i; draw(); return; }
      [order[sel], order[i]] = [order[i], order[sel]]; sel = null; draw();
      if (order.every((v, j) => v === j)) { $('#pz').style.gap = '0'; await say(it.en + '!'); await roundDone(); R.g_ghep(k); }
    });
  };
  draw();
};
R.g_lat = (k) => {
  setTabs(null);
  const t = gameTopic(k);
  const ws = shuffle(t.w).slice(0, 3); const cards = shuffle([...ws, ...ws].map((w, i) => ({ w, i })));
  let open = [], done = 0, lock = false;
  view(bar('Lật thẻ tìm cặp', '#/game', starPill()) + topicSel('lat', k) + `<p class="muted" style="text-align:center;margin:0 0 10px">Lật 2 thẻ giống nhau nha!</p><div class="mem">${cards.map((c, j) => `<button class="mc" data-j="${j}">⭐</button>`).join('')}</div>`);
  bindSel('lat');
  app.querySelectorAll('.mc').forEach(b => b.onclick = async () => {
    if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
    const c = cards[b.dataset.j]; b.classList.add('open'); b.innerHTML = `<img src="${wsrc(c.w)}" alt="">`; say(c.w[0]);
    open.push(b);
    if (open.length === 2) {
      lock = true; const [a, d] = open; open = [];
      if (cards[a.dataset.j].w[0] === cards[d.dataset.j].w[0]) { setTimeout(() => { a.classList.add('done'); d.classList.add('done'); lock = false; }, 500); done++; if (done === 3) { setTimeout(async () => { await roundDone(); R.g_lat(k); }, 700); } }
      else setTimeout(() => { [a, d].forEach(x => { x.classList.remove('open'); x.textContent = '⭐'; }); lock = false; }, 1000);
    }
  });
};

/* ---------- video ---------- */
let VID = null;
async function loadVideos() {
  if (VID) return VID;
  const tryj = async u => { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw 0; return r.json(); };
  try { VID = await tryj('https://raw.githubusercontent.com/thaoanh1311997-png/Pinyin/main/xiu-mai/data/videos.json'); } catch (e) { try { VID = await tryj('data/videos.json'); } catch (e2) { VID = { channels: [] }; } }
  if (!VID.channels || !VID.channels.length) { try { VID = await tryj('data/videos.json'); } catch (e) {} }
  const BAD = new Set(['peppa', 'cocomelon', 'blippi', 'pinkfong', 'littlebabybum', 'bouncepatrol']);
  VID.channels = (VID.channels || []).filter(c => !BAD.has(c.key));
  if (window.XM_SONGS && !VID.channels.some(c => c.key === 'classic')) VID.channels.unshift(window.XM_SONGS);
  return VID;
}
const dec = s => { const d = document.createElement('textarea'); d.innerHTML = s; return d.value; };
const CATS = [['all', '⭐ Tất cả'], ['song', '🎵 Bài hát'], ['learn', '📚 Học từ vựng'], ['play', '🎈 Vui chơi & truyện']];
R.video = async (cat) => {
  setTabs('kid', '');
  cat = cat || 'all';
  view(bar('Video & Bài hát', '#/be') + `<div class="seg">${CATS.map(c => `<button data-c="${c[0]}" class="${c[0] === cat ? 'on' : ''}">${c[1]}</button>`).join('')}</div><div class="own"><div class="ownh">🔗 Xem video của ba mẹ, có phụ đề chạy</div><div class="kin"><input id="ylink" inputmode="url" placeholder="Dán link YouTube vào đây" autocomplete="off"><button class="btn" id="yopen">Mở</button></div><label class="btn2 fbtn">📁 Chọn file video / nhạc trong máy<input type="file" id="vfile" accept="video/*,audio/*" hidden></label></div><div id="vl"><p class="muted">Đang tải video…</p></div>`);
  const openLink = () => { const id = ytId($('#ylink').value); if (id) go('#/video/v/' + id); else if ($('#ylink').value.trim()) toast('Link này chưa đúng link YouTube nha'); };
  $('#yopen').onclick = openLink; $('#ylink').addEventListener('paste', () => setTimeout(openLink, 50)); $('#ylink').onkeydown = e => { if (e.key === 'Enter') openLink(); };
  $('#vfile').onchange = e => { const f = e.target.files[0]; if (!f) return; FILE = f; go('#/video/file'); };
  app.querySelectorAll('.seg button').forEach(b => b.onclick = () => go('#/video' + (b.dataset.c === 'all' ? '' : '/c/' + b.dataset.c)));
  const V = await loadVideos(); const el = $('#vl'); if (!el) return;
  const chs = V.channels.filter(c => cat === 'all' || c.cat === cat);
  if (!chs.length) { el.innerHTML = '<div class="note">Chưa tải được danh sách video. Kiểm tra mạng rồi thử lại nha.</div>'; return; }
  el.innerHTML = `<div class="note">👀 Ba mẹ ngồi xem cùng bé và nói chuyện về video nhé. Bé 2–4 tuổi chỉ nên xem màn hình tổng cộng tối đa 1 giờ mỗi ngày.</div>` + chs.map(c => `<div class="chrow"><h3>${esc(c.name)} <small>${esc(c.vi)} · ${esc(c.age)} tuổi</small></h3><div class="vids">${c.videos.map(v => `<a class="vc" href="#/video/v/${v.id}"><div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="">${v.d ? `<span>${v.d}</span>` : ''}</div><p>${esc(dec(v.t))}</p></a>`).join('')}</div></div>`).join('');
};
/* ---------- player with running subtitles ---------- */
let FILE = null;
const ytId = u => { u = String(u || '').trim(); const m = u.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/) || u.match(/^([\w-]{11})$/); return m ? m[1] : null; };
function ytApi() {
  if (window.YT && YT.Player) return Promise.resolve();
  return new Promise((res, rej) => {
    const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev && prev(); res(); };
    if (!document.querySelector('script[src*="iframe_api"]')) { const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; sc.onerror = rej; document.head.appendChild(sc); }
    setTimeout(() => rej(new Error('yt api timeout')), 9000);
  });
}
const subsHTML = `<div class="karaoke" id="kar"><div class="kst" id="kst"><img src="${IMG('ui/xiumai')}" alt=""><span>Xíu Mại đang lấy phụ đề…</span></div></div><div class="slist" id="slist"></div>`;
function keyBox(kind) {
  const g = kind === 'groq';
  return `<div class="keybox"><b>${g ? 'Cần mã Groq để làm phụ đề cho file' : 'Cần mã Supadata để lấy phụ đề YouTube'}</b><small>Làm 1 lần trên máy này. ${g ? 'Vào <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> (đăng nhập Google), bấm Create API Key, chép mã bắt đầu bằng <b>gsk_</b>.' : 'Vào <a href="https://dash.supadata.ai/" target="_blank" rel="noopener">supadata.ai</a> (đăng nhập Google, miễn phí), chép API key bắt đầu bằng <b>sd_</b>.'}</small><div class="kin"><input id="kkey" placeholder="Dán mã vào đây" autocomplete="off"><button class="btn" id="ksave">Lưu</button></div></div>`;
}
function subsStatus(html) { const k = $('#kst'); if (k) k.innerHTML = html; }
function mountSubs(lines, P) {
  const kar = $('#kar'), list = $('#slist'); if (!kar || !list) return;
  kar.innerHTML = `<div class="kl" id="kl"></div><div class="kv" id="kv"></div>`;
  list.innerHTML = lines.map((l, i) => `<button class="sl" data-i="${i}"><span class="tm">${Math.floor(l.s / 60)}:${String(Math.floor(l.s % 60)).padStart(2, '0')}</span><span><b>${esc(l.t)}</b><small data-vi="${i}">${esc(l.vi || '')}</small></span></button>`).join('');
  list.querySelectorAll('.sl').forEach(b => b.onclick = () => { const l = lines[b.dataset.i]; P.seek(l.s); P.play(); });
  let cur = -2, lastLit = -1;
  const show = i => {
    const kl = $('#kl'), kv = $('#kv'); if (!kl) return;
    if (i < 0) { kl.innerHTML = '<span class="idle">🎵</span>'; kv.textContent = ''; return; }
    kl.innerHTML = lines[i].t.split(' ').map((w, k) => `<span class="kw" data-k="${k}">${esc(w)}</span>`).join(' ');
    kl.querySelectorAll('.kw').forEach(x => x.onclick = e => { e.stopPropagation(); say(x.textContent.replace(/[^\w'-]/g, '')); });
    kv.textContent = lines[i].vi || '';
    list.querySelectorAll('.sl.on').forEach(x => x.classList.remove('on'));
    const row = list.querySelector(`.sl[data-i="${i}"]`); if (row) { row.classList.add('on'); list.scrollTo({ top: row.offsetTop - list.offsetTop - list.clientHeight / 3, behavior: 'smooth' }); }
  };
  const tick = () => {
    if (!document.body.contains(list)) return clearInterval(timer);
    let t = 0; try { t = P.time() || 0; } catch (e) {}
    let i = -1; for (let k = 0; k < lines.length; k++) { if (lines[k].s <= t + 0.05) i = k; else break; }
    if (i >= 0 && t > lines[i].e + 1.5) i = -1;
    if (i !== cur) { cur = i; lastLit = -1; show(i); }
    if (i >= 0) {
      const l = lines[i], ws = $('#kl') ? $('#kl').querySelectorAll('.kw') : [];
      const n = Math.max(0, Math.min(ws.length, Math.ceil((t - l.s) / Math.max(0.3, l.e - l.s) * ws.length + 0.2)));
      if (n !== lastLit) { ws.forEach((w, k) => w.classList.toggle('lit', k < n)); lastLit = n; }
    }
  };
  const timer = setInterval(tick, 120); tick();
  if (window.XMTools) XMTools.mount(lines, P);
  XMSubs.translate(lines, l => { const i = lines.indexOf(l); const el = list.querySelector(`[data-vi="${i}"]`); if (el) el.textContent = l.vi; if (i === cur && $('#kv')) $('#kv').textContent = l.vi; });
}
function subsError(e, retry) {
  const c = e && e.code;
  if (c === 'nokey' || c === 'badkey' || c === 'nogroq') {
    subsStatus((c === 'badkey' ? '<p class="kerr">Mã cũ bị sai hoặc hết lượt, dán mã mới nha.</p>' : '') + keyBox(c === 'nogroq' ? 'groq' : 'sd'));
    $('#ksave').onclick = () => { if (XMSubs.takeKeys($('#kkey').value)) { toast('Đã lưu mã ✓'); retry(); } else toast('Mã chưa đúng, kiểm tra lại nha'); };
    return;
  }
  const msg = c === 'toobig' ? 'File này lớn quá mà không cắt nhỏ được. Đổi sang MP3 hoặc MP4 rồi chọn lại nha.'
    : c === '429' ? 'Máy chủ phụ đề đang hết lượt miễn phí, khoảng 1 tiếng nữa thử lại nha.'
    : 'Video này chưa có phụ đề tiếng Anh. Bé vẫn xem bình thường nha.';
  subsStatus(`<img src="${IMG('ui/xiumai')}" alt=""><span>${msg}</span>`);
}
R.play = async (id, opt = {}) => {
  setTabs(null);
  const V = opt.title ? { channels: [] } : await loadVideos(); const c = V.channels.find(c => c.videos.some(v => v.id === id));
  const v = c ? c.videos.find(v => v.id === id) : { t: opt.vt || '' };
  bump('videos');
  view(bar(opt.title || (c ? esc(c.name) : 'Video của ba mẹ'), opt.back || '#/video') + `<div class="watch"><div class="wl"><div class="player"><div id="yt"></div></div>
  ${v.t ? `<h3 class="vt">${esc(dec(v.t))}</h3>` : ''}${subsHTML}</div></div>${opt.extra || ''}
  ${c ? `<div class="chrow" style="max-width:1100px;margin:14px auto 0"><h3>Video khác của ${esc(c.name)}</h3><div class="vids">${c.videos.filter(x => x.id !== id).map(v => `<a class="vc" href="#/video/v/${v.id}"><div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="">${v.d ? `<span>${v.d}</span>` : ''}</div><p>${esc(dec(v.t))}</p></a>`).join('')}</div></div>` : ''}`);
  let yp = null;
  const P = { time: () => yp && yp.getCurrentTime ? yp.getCurrentTime() : 0, seek: t => yp && yp.seekTo && yp.seekTo(t, true), play: () => yp && yp.playVideo && yp.playVideo(), pause: () => yp && yp.pauseVideo && yp.pauseVideo(), rate: r => yp && yp.setPlaybackRate && yp.setPlaybackRate(r) };
  try { await ytApi(); if (!$('#yt')) return; yp = new YT.Player('yt', { host: 'https://www.youtube-nocookie.com', videoId: id, playerVars: { rel: 0, playsinline: 1, autoplay: 1, modestbranding: 1, cc_load_policy: 0 } }); }
  catch (e) { const el = $('#yt'); if (el) el.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="video"></iframe>`; }
  const load = () => { subsStatus(`<img src="${IMG('ui/xiumai')}" alt=""><span>Xíu Mại đang lấy phụ đề…</span>`); XMSubs.ytSubs(id, k => subsStatus(`<img src="${IMG('ui/xiumai')}" alt=""><span>Xíu Mại đang nghe video để làm phụ đề… ${k * 3} giây</span>`)).then(lines => { if ($('#kar')) mountSubs(lines, P); }, e => { if ($('#kar')) subsError(e, load); }); };
  load();
};
R.vfile = () => {
  if (!FILE) return go('#/video');
  setTabs(null);
  const f = FILE, url = URL.createObjectURL(f), aud = XMSubs.isAudio(f);
  view(bar('Video của ba mẹ', '#/video') + `<div class="watch"><div class="wl"><div class="player ${aud ? 'aud' : ''}">${aud ? `<img class="apic" src="${IMG('ui/xiumai')}" alt=""><audio id="med" controls playsinline src="${url}"></audio>` : `<video id="med" controls playsinline src="${url}"></video>`}</div>
  <h3 class="vt">${esc(f.name)}</h3>${subsHTML}</div></div>`);
  const m = $('#med'); const P = { time: () => m.currentTime, seek: t => { m.currentTime = t; }, play: () => m.play().catch(() => {}), pause: () => m.pause(), rate: r => { m.playbackRate = r; } };
  const ck = 'xm.fsub.' + f.name + '|' + f.size;
  const load = () => {
    let cached = null; try { cached = JSON.parse(localStorage.getItem(ck) || 'null'); } catch (e) {}
    if (cached && cached.length) return mountSubs(cached, P);
    subsStatus(`<img src="${IMG('ui/xiumai')}" alt=""><span>Xíu Mại đang nghe file để làm phụ đề…</span><div class="kbar"><i id="kpr"></i></div>`);
    XMSubs.fileSubs(f, p => { const b = $('#kpr'); if (b) b.style.width = Math.round(p * 100) + '%'; }).then(lines => {
      if (!$('#kar')) return;
      if (!lines.length) return subsError({}, load);
      mountSubs(lines, P);
      const save = () => { try { localStorage.setItem(ck, JSON.stringify(lines)); } catch (e) {} };
      save(); setTimeout(save, 8000);
    }, e => { if ($('#kar')) subsError(e, load); });
  };
  load();
};

/* ---------- favourites & journey ---------- */
R.favs = () => {
  setTabs('kid', '#/yeu-thich');
  const F = favs().map(id => { const [en, k] = id.split('|'); const t = topic(k); const w = t && t.w.find(x => x[0] === en); return w ? { w, k } : null; }).filter(Boolean);
  view(bar('Yêu thích', '#/be') + (F.length ? `<div class="wgrid">${F.map((f, j) => `<button class="wbox" data-j="${j}"><img src="${wsrc(f.w)}" alt=""><b>${esc(f.w[0])}</b><small>${esc(f.w[1])}</small></button>`).join('')}</div>` : `<div class="panel" style="text-align:center"><img src="${IMG('ui/xiumai')}" style="width:140px;margin:0 auto" alt=""><p style="font-size:18px">Chưa có thẻ yêu thích.<br>Trong Flashcard, bấm 🤍 để lưu thẻ bé thích nha!</p></div>`));
  app.querySelectorAll('.wbox').forEach(b => b.onclick = () => say(F[b.dataset.j].w[0]));
};
R.journey = () => {
  setTabs('kid', '#/thanh-tich');
  const s = stars(), lv = Math.floor(s / 10) + 1, p = s % 10, d = day();
  const seen = Object.keys(LS.get('seen', {})).length;
  const todo = [[d.words.length >= 5, `Học 5 từ mới (${Math.min(5, d.words.length)}/5)`], [d.games >= 1, `Hoàn thành 1 game (${Math.min(1, d.games)}/1)`], [d.videos >= 2, `Xem 2 video (${Math.min(2, d.videos)}/2)`]];
  view(bar('Hành trình học tập', '#/be') + `<div class="panel"><div class="lvl"><img src="${IMG('w/trophy')}" alt=""><div style="flex:1"><b>Cấp độ ${lv}</b><div class="bar2"><i style="width:${p * 10}%"></i></div><div class="muted" style="text-align:right;font-weight:700">${p}/10 ⭐</div></div></div></div>
  <div class="panel sec"><div class="ph">📅 Hôm nay</div><ul class="todo">${todo.map(([ok, t]) => `<li class="${ok ? 'done' : ''}"><span class="ck">✓</span>${t}</li>`).join('')}</ul></div>
  <div class="panel sec"><div class="ph">🌟 Bé đã học</div><p style="font-size:18px;margin:0">Đã gặp <b>${seen}</b> / ${ALL.length} từ · Tổng <b>${s}</b> ⭐</p>
  <div class="stars" style="margin-top:8px;flex-wrap:wrap;font-size:30px">${'⭐'.repeat(Math.min(s, 30))}</div></div>`);
};

/* ---------- parent ---------- */
R.bame = () => {
  setTabs('parent', '#/bame');
  const row = (h, ic, t, d) => `<a class="prow mk" href="${h}"><img src="${IMG('w/' + ic)}" alt=""><div><b>${t}</b><small>${d}</small></div><span class="go">›</span></a>`;
  const mini = (h, ic, t) => `<a class="pmini" href="${h}"><img src="${IMG('w/' + ic)}" alt=""><b>${t}</b></a>`;
  view(`<div class="parent">${topbar('parent')}
  ${window.XMX ? XMX.dailyCard() : ''}
  <h3 class="psec">💬 Nói chuyện với con</h3>
  ${row('#/bame/hoi-thoai', 'open-book', 'Hội thoại thường ngày', 'Video hoạt hình mẹ và bé, có phụ đề và luyện nói')}
  ${row('#/bame/cau-noi', 'speaking-head', 'Câu nói hằng ngày', 'Khen, hỏi, nhắc nhở, an toàn…')}
  <h3 class="psec">🌱 Dạy con</h3>
  ${row('#/bame/cach-day', 'light-bulb', 'Cách dạy con tiếng Anh', '12 mẹo dễ làm mỗi ngày')}
  ${row('#/bame/hoat-dong', 'spiral-notepad', 'Hoạt động theo chủ đề', 'Chơi mà học với đồ vật thật')}
  ${row('#/bame/tu-lop', 'pencil', 'Từ vựng con học trên lớp', 'Nhập từ, chụp ảnh thật cho bé học')}
  <h3 class="psec">📊 Theo dõi & cài đặt</h3>
  <div class="pminis">${mini('#/bame/so-tien-bo', 'trophy', 'Sổ tiến bộ')}${mini('#/bame/gio-xem', 'alarm-clock', 'Giờ xem')}${mini('#/bame/giong-doc', 'speaking-head', 'Giọng đọc')}</div>
  <a class="credit-link" href="#/bame/nguon-anh">📷 Nguồn ảnh flashcard</a></div>`);
  const d = $('#dsay'); if (d) d.onclick = () => say(XMX.todayPhrase()[0]);
};
R.design = () => {
  setTabs('parent', '');
  const show = () => {
    const P = window.DESIGN_PROMPT || '';
    view(bar('Nhờ ChatGPT vẽ hình', '#/bame') + `<div class="panel"><div class="ph">🎨 Chỉ 1 lần dán</div>
    <ol class="dsteps"><li>Bấm nút <b>Chép lệnh</b> bên dưới.</li><li>Mở ChatGPT, dán vào, gửi. Nó vẽ hình đầu tiên.</li><li>Mỗi lần xong 1 hình, gõ <b>tiếp</b>. Hình nào chưa ưng thì gõ <b>vẽ lại</b>.</li><li>Lấy hình bằng nút <b>Tải về ⬇</b> (đừng chụp màn hình), gửi vào chat kèm mã hình (A2-1, B3…).</li></ol>
    <button class="big pri dcopy" id="dcopy">📋 Chép lệnh</button><textarea id="dtxt" class="dtxt" readonly>${esc(P)}</textarea></div>`);
    $('#dcopy').onclick = async () => {
      let ok = false; try { await navigator.clipboard.writeText(P); ok = true; } catch (e) {}
      if (!ok) { const t = $('#dtxt'); t.focus(); t.select(); t.setSelectionRange(0, P.length); try { ok = document.execCommand('copy'); } catch (e) {} }
      toast(ok ? 'Đã chép! Mở ChatGPT và dán vào nha' : 'Bấm giữ ô chữ → Chọn tất cả → Sao chép');
      $('#dcopy').textContent = ok ? '✅ Đã chép' : '📋 Chép lệnh';
    };
  };
  if (window.DESIGN_PROMPT) return show();
  const sc = document.createElement('script'); sc.src = 'js/design.js?v=1'; sc.onload = show; document.head.appendChild(sc);
};
R.credits = () => {
  setTabs('parent', '');
  const used = new Set(TOPICS.flatMap(t => t.w.map(w => w[2]))); const E = Object.entries(CRED).filter(([k, c]) => used.has('p/' + (c.slug || pslug(k.split('|')[0])) + '.jpg')).sort((a, b) => a[0].localeCompare(b[0]));
  view(bar('Nguồn ảnh', '#/bame') + `<p class="muted" style="margin:0 0 10px;font-size:15.5px">Ảnh chụp thật trong flashcard lấy từ Wikimedia Commons và Openverse (Flickr…), giấy phép tự do. Cảm ơn các tác giả!</p><div class="panel credits">${E.map(([k, c]) => { const w = k.split('|')[0]; return `<a href="${esc(c.page)}" target="_blank" rel="noopener"><img src="img/p/${c.slug || pslug(w)}.jpg" alt="" loading="lazy"><span><b>${esc(w)}</b><small>${esc((c.author || 'Không rõ tác giả').replace(/\[\[[^\]|]*\|?([^\]]*)\]\]/g, '$1').replace(/(Unknown author)+/i, 'Unknown author'))} · ${esc(c.license || '')}</small></span></a>`; }).join('') || 'Chưa có ảnh.'}</div>`);
};
R.eps = () => {
  setTabs('parent', '');
  view(bar('Hội thoại thường ngày', '#/bame') + `<p class="muted" style="margin:0 0 10px;font-size:16px">Truyện tranh ngắn theo từng lúc trong ngày. Bấm vào lời thoại để nghe đọc mẫu.</p><div class="eplist">${EPISODES.map((e, i) => `<a class="ep" href="#/bame/hoi-thoai/${e.id}"><img src="${IMG('w/' + e.icon)}" alt=""><b>Tập ${i + 1}. ${e.vi}</b><small>${e.en}</small></a>`).join('')}</div>`);
};
function kidHtml(pose) {
  if (pose === 'bed') return `<img class="bedk" src="${IMG('w/person-in-bed')}" alt="">`;
  if (pose === 'bath') return `<img class="bathk" src="${IMG('w/person-taking-bath')}" alt="">`;
  return `<div class="kid ${pose}"><img class="hd" src="${IMG('w/child')}" alt=""><div class="bd"></div>${pose === 'sit' ? '' : '<div class="lg"><i></i><i></i></div>'}</div>`;
}
function momHtml(pose) { const m = { stand: 'woman-standing', walk: 'woman-walking', cook: 'woman-cook', dad: 'man-standing' }[pose] || 'woman-standing'; return `<div class="mom" style="${pose === 'cook' ? 'height:52%' : ''}"><img src="${IMG('w/' + m)}" alt=""></div>`; }
R.ep = id => {
  setTabs('parent', '');
  const i = EPISODES.findIndex(e => e.id === id); const e = EPISODES[i]; if (!e) return go('#/bame/hoi-thoai');
  const vi = LS.get('epvi', true);
  view(bar(`Tập ${i + 1}. ${e.vi}`, '#/bame/hoi-thoai') + `<div class="tool"><button id="all">▶️ Đọc cả tập</button><button id="tv">${vi ? '🙈 Ẩn tiếng Việt' : '👀 Hiện tiếng Việt'}</button></div>
  <div class="comic ${vi ? '' : 'vihide'}">${e.panels.map((p, j) => {
    let used = {};
    const bub = p.lines.map(([who, en, v], li) => { let pos = who === 'k' ? 'k' : 'm'; if (used[pos]) pos += '2'; used[pos] = 1; return `<button class="sp ${pos}" style="${li && !pos.endsWith('2') ? 'top:30%' : ''}" data-en="${esc(en)}" data-who="${who}">${esc(en)}<small>${esc(v)}</small></button>`; }).join('');
    if (e.art && e.art.includes(j + 1)) return `<div class="panelc art"><img class="cart" src="img/comic/${e.id}-${j + 1}.webp" alt="" loading="${j ? 'lazy' : 'eager'}">${bub}<span class="num">${j + 1}</span></div>`;
    return `<div class="panelc"><div class="sc sc-${p.scene} ${e.night ? 'night' : ''}"><div class="wall"></div><div class="floor"></div>${p.scene === 'kitchen' ? '<div class="table"></div>' : ''}
    ${p.props.map(([n, x, y, w]) => `<img class="prop" src="${IMG('w/' + n)}" style="left:${x}%;top:${y}%;width:${w}%" alt="">`).join('')}
    ${momHtml(p.mom)}${kidHtml(p.kid)}</div>${bub}<span class="num">${j + 1}</span></div>`;
  }).join('')}</div>
  <div class="fnav">${i > 0 ? `<a class="big" href="#/bame/hoi-thoai/${EPISODES[i - 1].id}">◀</a>` : ''}${i < EPISODES.length - 1 ? `<a class="big pri" href="#/bame/hoi-thoai/${EPISODES[i + 1].id}" style="text-decoration:none">Tập tiếp ▶</a>` : ''}</div>`);
  const voice = who => who === 'k' ? { pitch: 1.5, rate: .85 } : who === 'd' ? { pitch: .8, rate: .85 } : { pitch: 1.1, rate: .82 };
  app.querySelectorAll('.sp').forEach(b => b.onclick = () => { app.querySelectorAll('.sp.say').forEach(x => x.classList.remove('say')); b.classList.add('say'); say(b.dataset.en, voice(b.dataset.who)); });
  $('#tv').onclick = () => { LS.set('epvi', !vi); R.ep(id); };
  $('#all').onclick = async () => { for (const b of app.querySelectorAll('.sp')) { if (!document.body.contains(b)) return; app.querySelectorAll('.sp.say').forEach(x => x.classList.remove('say')); b.classList.add('say'); b.scrollIntoView({ block: 'center', behavior: 'smooth' }); await say(b.dataset.en, voice(b.dataset.who)); await new Promise(r => setTimeout(r, 350)); } };
};
R.phrases = () => {
  setTabs('parent', '#/bame/cau-noi');
  view(bar('Câu nói hằng ngày với con', '#/bame') + `<p class="muted" style="margin:0 0 6px;font-size:16px">Bấm vào câu để nghe đọc mẫu, rồi nói lại với con.</p>` + PHRASES.map((g, gi) => `<div class="panel sec plist"><div class="ph"><img src="${IMG('w/' + g.icon)}" alt="">${g.vi}</div>${g.list.map(([en, vi]) => `<button class="row" data-en="${esc(en)}"><div><b>${esc(en)}</b><small>${esc(vi)}</small></div><span class="s">🔊</span></button>`).join('')}</div>`).join(''));
  app.querySelectorAll('.row').forEach(b => b.onclick = () => say(b.dataset.en));
};
R.tips = () => {
  setTabs('parent', '');
  view(bar('Cách dạy con tiếng Anh', '#/bame') + TIPS.map(([e, t, p]) => `<div class="tip"><div class="e">${e}</div><div><b>${t}</b><p>${p}</p></div></div>`).join(''));
};
R.acts = () => {
  setTabs('parent', '');
  view(bar('Hoạt động theo chủ đề', '#/bame') + ACTIVITIES.map(([k, how, ls]) => { const t = topic(k); return `<div class="panel sec plist"><div class="ph"><img src="${IMG(t.w[0][2])}" alt="">${t.vi} <span class="muted" style="font-size:15px">(${t.en})</span></div><p style="margin:0 0 4px;font-size:16px;line-height:1.45">${how}</p>${ls.map(([en, vi]) => `<button class="row" data-en="${esc(en)}"><div><b>${esc(en)}</b><small>${esc(vi)}</small></div><span class="s">🔊</span></button>`).join('')}<a class="btn alt" style="display:block;margin-top:10px;text-decoration:none" href="#/flash/${k}">Mở flashcard ${t.vi} cho bé</a></div>`; }).join(''));
  app.querySelectorAll('.row').forEach(b => b.onclick = () => say(b.dataset.en));
};
function resizePhoto(file) { return new Promise(res => { const img = new Image(); img.onload = () => { const m = 480, s = Math.min(1, m / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => res(b), 'image/jpeg', .85); URL.revokeObjectURL(img.src); }; img.onerror = () => res(null); img.src = URL.createObjectURL(file); }); }
// ---- class words: type many words at once → auto meaning, picture, example sentence ----
const singular = w => w.replace(/ies$/, 'y').replace(/(s|x|z|ch|sh)es$/, '$1').replace(/([^s])s$/, '$1');
function dictFind(en) { const e = en.toLowerCase(); return ALL.find(x => x.en.toLowerCase() === e) || ALL.find(x => x.en.toLowerCase() === singular(e)); }
const VOW = /^[aeiou]/i;
const A = w => (VOW.test(w) ? 'an ' : 'a ') + w;
function example(en, vi, t) {
  const V = vi.replace(/\s*\(.*\)$/, '').split(' / ')[0];
  const Vc = V.charAt(0).toUpperCase() + V.slice(1);
  if (t === 'actions') return [`Let's ${en}!`, `Mình ${V} nào!`];
  if (t === 'feelings') return [`Are you ${en}?`, `Con có ${V} không?`];
  if (t === 'opposites') return [`It's so ${en}!`, `Nó ${V} quá!`];
  if (t === 'colors') return [`It's ${en}.`, `Nó ${V}.`];
  if (t === 'numbers') return [`Let's count: ${en}!`, `Mình đếm nào: ${V.replace(/^số /, '')}!`];
  if (t === 'places') return [`Let's go to the ${en}.`, `Mình đi ${V} nào.`];
  if (t === 'body') return [`Touch your ${en}.`, `Con chạm vào ${V} nào.`];
  if (t === 'clothes') return [`Where is your ${en}?`, `${Vc} của con đâu rồi?`];
  if (['fruits', 'vegetables', 'food', 'sweets'].includes(t)) {
    const MASS = /^(rice|bread|soup|cheese|meat|fish|chicken|pork|beef|corn|broccoli|spinach|lettuce|cabbage|garlic|ginger|pasta|pizza|popcorn|jelly|cereal|porridge|salad|tofu|ham|cake|ice cream|candy|chocolate|yogurt|butter|honey|jam|sushi|noodles|fries|french fries|watermelon|pineapple|papaya|durian|jackfruit|celery|pumpkin|squash|sticky rice|toast|milk|cotton candy|pudding|custard|seaweed|sweet corn|bok choy|morning glory|kale)$/i;
    const pl = MASS.test(en) || /s$/.test(en) ? en : /[^aeiou]y$/.test(en) ? en.slice(0, -1) + 'ies' : /(o|x|ch|sh)$/.test(en) ? en + 'es' : en + 's';
    return [`Do you like ${pl}?`, `Con có thích ${V} không?`];
  }
  if (t === 'drinks') return [`Do you want some ${en}?`, `Con có muốn uống ${V} không?`];
  if (['weather', 'time', 'holidays', 'shapes', 'sports', 'music'].includes(t)) return [`Can you say "${en}"?`, `Con nói “${en}” được không?`];
  if (t === 'people' || t === 'jobs') return [`Where is the ${en}?`, `${Vc} đâu rồi?`];
  return [`Where is the ${en}?`, `${Vc} đâu rồi?`];
}
async function gtx(text) {
  try { const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(text)); const d = await r.json(); return (d[0] || []).map(x => x[0]).join('').trim(); } catch (e) { return ''; }
}
// free CC photos (Openverse): prefer large, near-square, photo results; returns list of thumbnail urls
async function ovPics(en) {
  try {
    const r = await fetch('https://api.openverse.org/v1/images/?page_size=20&mature=false&category=photograph&q=' + encodeURIComponent(en));
    const d = await r.json();
    return (d.results || []).filter(x => x.width >= 500 && x.height >= 400 && x.width / x.height < 1.9 && x.height / x.width < 1.6).map(x => 'https://api.openverse.org/v1/images/' + x.id + '/thumb/');
  } catch (e) { return []; }
}
async function wikiPic(en) {
  try {
    const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|pageprops&piprop=thumbnail&pithumbsize=480&titles=' + encodeURIComponent(en.charAt(0).toUpperCase() + en.slice(1)));
    const d = await r.json(); const pg = Object.values((d.query || {}).pages || {})[0];
    if (!pg || pg.missing !== undefined || (pg.pageprops && 'disambiguation' in pg.pageprops)) return '';
    return pg.thumbnail ? pg.thumbnail.source : '';
  } catch (e) { return ''; }
}
function splitWords(txt) {
  return txt.split(/[\n,;，、]+/).map(x => x.trim()).filter(Boolean).map(x => {
    const m = x.match(/^(.+?)\s*[-–:=]\s*(.+)$/); // "dog - con chó"
    return m ? { en: m[1].trim(), vi: m[2].trim() } : { en: x, vi: '' };
  }).filter(x => /[a-z]/i.test(x.en));
}
async function makeWord(x) {
  const en = x.en.replace(/\s+/g, ' ');
  const d = dictFind(en);
  const item = { en: d ? d.en : en, vi: x.vi || (d ? d.vi : ''), img: d ? d.img : '' };
  if (!item.vi) item.vi = (await gtx(en)) || '';
  if (!item.img) { const L = await ovPics(en); if (L.length) { item.img = L[0]; item.alts = L.slice(0, 8); } else item.img = await wikiPic(singular(en.toLowerCase())) || await wikiPic(en); }
  if (d) item.ex = example(d.en, item.vi, d.t);
  else { const s = item.img ? `Where is the ${en}?` : `Can you say "${en}"?`; item.ex = [s, (await gtx(s)) || '']; }
  return item;
}
R.color = () => {
  setTabs('parent', '#/bame/tu-lop');
  const run = () => window.XMP && window.XMP();
  if (window.XMP) return run();
  view(bar('In tô màu', '#/bame/tu-lop') + '<p class="muted">Đang mở…</p>');
  let n = 0; const done = () => { if (++n === 2) run(); };
  for (const f of ['js/cmap.js?v=1', 'js/print.js?v=2']) { const sc = document.createElement('script'); sc.src = f; sc.onload = done; document.head.appendChild(sc); }
};
R.lop = () => {
  setTabs('parent', '#/bame/tu-lop');
  let L = custom();
  // older entries typed as one long line ("cat, dog, bird") → split them now
  if (L.some(w => /[,\n;]/.test(w.en) || !w.ex)) {
    const fix = async () => { const out = []; for (const w of L) { if (/[,\n;]/.test(w.en)) { for (const x of splitWords(w.en)) out.push(await makeWord(x)); } else if (!w.ex) { const n = await makeWord({ en: w.en, vi: w.vi }); out.push(Object.assign(n, w.img ? { img: w.img } : {}, w.ph ? { ph: w.ph } : {})); } else out.push(w); } LS.set('lop', out); R.lop(); };
    fix(); 
  }
  let blob = null;
  const pic = w => w.ph && PH[w.ph] ? PH[w.ph] : w.img ? IMG(w.img) : IMG('ui/xiumai');
  view(bar('Từ vựng con học trên lớp', '#/bame') + `<div class="panel lopin"><div class="ph">✍️ Nhập các từ bé học</div>
   <textarea id="words" rows="4" placeholder="Gõ liền nhiều từ, cách nhau bằng dấu phẩy hoặc xuống dòng.&#10;Ví dụ: cat, dog, bird, monkey, banana" autocapitalize="none" autocomplete="off" spellcheck="false"></textarea>
   <p class="muted lophint">Web tự tách từng từ, tự thêm nghĩa tiếng Việt, hình và câu mẫu. Muốn tự ghi nghĩa thì gõ: <b>dog - con chó</b></p>
   <button class="btn" id="add">✨ Tạo flashcard</button><div id="prog" class="lopprog" hidden></div></div>
   <div class="panel sec mylist"><div class="ph">📚 Đã nhập (${L.length} từ)</div>${L.length ? `<a class="btn" style="display:block;margin-bottom:12px;text-decoration:none" href="#/flash/lop">Cho bé học bằng Flashcard ▶</a><a class="btn prt" style="display:block;margin-bottom:12px;text-decoration:none" href="#/bame/in-to-mau">🖍️ In trang tô màu ôn từ</a>` + L.map((w, i) => `<div class="it lopit"><img src="${pic(w)}" alt=""><div class="lw"><b>${esc(w.en)}</b> <span class="muted">${esc(w.vi)}</span>${w.ex ? `<button class="lex" data-i="${i}">💬 ${esc(w.ex[0])}<small>${esc(w.ex[1] || '')}</small></button>` : ''}</div>
     <div class="lact">${!w.ph && !/^[pw]\//.test(w.img || '') ? `<button class="lsw" data-i="${i}" title="Đổi hình khác">🔄</button>` : ''}<label class="lcam" title="Chụp ảnh thật">📷<input type="file" accept="image/*" data-i="${i}" hidden></label><button class="x" data-i="${i}" aria-label="Xóa">🗑️</button></div></div>`).join('') : '<p class="muted" style="margin:0">Chưa có từ nào. Gõ các từ bé học trên lớp vào ô phía trên nhé.</p>'}</div>`);
  $('#add').onclick = async () => {
    const xs = splitWords($('#words').value); if (!xs.length) { toast('Gõ từ tiếng Anh vào ô trước nha'); return; }
    const have = new Set(custom().map(w => w.en.toLowerCase()));
    const todo = xs.filter(x => !have.has(x.en.toLowerCase()) && !(have.add(x.en.toLowerCase()) && false));
    const btn = $('#add'), pr = $('#prog'); btn.disabled = true; pr.hidden = false;
    const L2 = custom(); let k = 0;
    for (const x of todo) { pr.textContent = `Xíu Mại đang làm thẻ ${++k}/${todo.length}: ${x.en}…`; L2.push(await makeWord(x)); LS.set('lop', L2); }
    toast(todo.length ? `Đã thêm ${todo.length} từ 🎉` : 'Các từ này đã có rồi'); R.lop();
  };
  app.querySelectorAll('.lsw').forEach(b => b.onclick = async () => {
    const L2 = custom(); const w = L2[+b.dataset.i]; if (!w) return;
    if (!w.alts || w.alts.length < 2) { b.textContent = '⏳'; w.alts = await ovPics(w.en); }
    if (!w.alts.length) { toast('Chưa tìm được hình khác, ba mẹ bấm 📷 chụp ảnh nhé'); R.lop(); return; }
    const k = (w.alts.indexOf(w.img) + 1) % w.alts.length; w.img = w.alts[k]; LS.set('lop', L2); R.lop();
  });
  app.querySelectorAll('.lex').forEach(b => b.onclick = () => { const w = custom()[+b.dataset.i]; if (w && w.ex) say(w.ex[0]); });
  app.querySelectorAll('.lopit img').forEach((im, i) => im.onclick = () => { const w = custom()[i]; if (w) say(w.en); });
  app.querySelectorAll('.lcam input').forEach(inp => inp.onchange = async e => { const f = e.target.files[0]; if (!f) return; const b2 = await resizePhoto(f); if (!b2) return; const id = 'p' + Date.now(); await phPut(id, b2); PH[id] = URL.createObjectURL(b2); const L2 = custom(); const w = L2[+inp.dataset.i]; if (w) { if (w.ph) phDel(w.ph); w.ph = id; } LS.set('lop', L2); R.lop(); });
  app.querySelectorAll('.x').forEach(b => b.onclick = () => { const L2 = custom(); const [w] = L2.splice(+b.dataset.i, 1); if (w && w.ph) phDel(w.ph); LS.set('lop', L2); R.lop(); });
};
R.journal = () => {
  setTabs('parent', '');
  const N = LS.get('notes', []);
  view(bar('Góc chia sẻ của Ba Mẹ', '#/bame') + `<div class="panel"><div class="ph">📝 Nhật ký học của bé</div><p class="muted" style="margin:0 0 8px;font-size:15.5px">Ghi lại từ đầu tiên bé nói, bài hát bé thích, điều ba mẹ muốn nhớ. Chỉ lưu trên máy này.</p>
  <div class="form"><textarea id="nt" placeholder="Hôm nay Bánh Mì nói được chữ &quot;apple&quot;…"></textarea><button class="btn" id="sv">Lưu ghi chú</button></div></div>
  ${N.slice().reverse().map((n, i) => `<div class="tip"><div class="e">💛</div><div style="flex:1"><b>${esc(n.d)}</b><p>${esc(n.t).replace(/\n/g, '<br>')}</p></div><button class="x" data-i="${N.length - 1 - i}" style="font-size:20px">🗑️</button></div>`).join('')}
  <div class="panel sec"><div class="ph">💡 Gợi ý cho ba mẹ</div><p style="margin:0;font-size:16px;line-height:1.5">Mỗi tuần chọn 1 chủ đề (ví dụ Trái cây), sáng xem Flashcard 5 phút, chiều chơi 1 game, tối đọc 1 tập Hội thoại trước khi ngủ. Ghi lại tiến bộ của bé ở đây để thấy con lớn từng ngày.</p></div>`);
  $('#sv').onclick = () => { const t = $('#nt').value.trim(); if (!t) return; const d = new Date(); const N2 = LS.get('notes', []); N2.push({ d: d.toLocaleDateString('vi-VN'), t }); LS.set('notes', N2); R.journal(); };
  app.querySelectorAll('.x').forEach(b => b.onclick = () => { const N2 = LS.get('notes', []); N2.splice(+b.dataset.i, 1); LS.set('notes', N2); R.journal(); });
};

/* ---------- router ---------- */
function go(h) { if (location.hash === h) route(); else location.hash = h; }
function route() {
  try { speechSynthesis.cancel(); } catch (e) {}
  const h = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const [a, b, c, d] = h;
  if (window.XMX && XMX.route(a, b, c, d)) return;
  if (!a) return R.role();
  if (a === 'be') return R.be();
  if (a === 'chu-de') return b === 'explore' ? R.explore() : R.topics('flash');
  if (a === 'flash') return R.flash(b, c);
  if (a === 'kham-pha') return R.explore(b);
  if (a === 'game') return b && b !== 'ghep' && R['g_' + b] ? R['g_' + b](c) : R.games();
  if (a === 'video') return b === 'v' ? R.play(c) : b === 'file' ? R.vfile() : R.video(b === 'c' ? c : 'all');
  if (a === 'yeu-thich') return R.favs();
  if (a === 'thanh-tich') return R.journey();
  if (a === 'bame') {
    if (!b) return R.bame();
    if (b === 'hoi-thoai') return c ? R.ep(c) : R.eps();
    return ({ 'cau-noi': R.phrases, 'cach-day': R.tips, 'hoat-dong': R.acts, 'tu-lop': R.lop, 'in-to-mau': R.color, 'nhat-ky': R.journal, 'nguon-anh': R.credits, 'thiet-ke': R.design }[b] || R.bame)();
  }
  R.role();
}
window.addEventListener('hashchange', route);
const credP = fetch('data/photo-credits.json', { cache: 'no-cache' }).then(r => r.json()).then(d => Object.assign(CRED, d)).catch(() => {});
// kids tap fast: stop iOS double-tap / pinch zoom
['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));
let lastTouch = 0; document.addEventListener('touchend', e => { const t = Date.now(); if (t - lastTouch < 350 && !e.target.closest('input,textarea,select')) e.preventDefault(); lastTouch = t; }, { passive: false });
window.XM = { custom, PH, singular, example, $, esc, say, toast, cheer, bump, wsrc, IMG, ALL, LS, stars, addStar, topic, setTabs, bar, view, starPill, R, go, pick, pickVoice, day, today };
Promise.all([idb().then(phLoadAll).catch(() => {}), credP]).then(route, route);
})();
