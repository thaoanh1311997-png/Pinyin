/* Bánh Mì · 📚 Tài liệu miễn phí */
(function () {
  'use strict';
  var D = window.SACH || { cats: [], items: [] };
  var $ = function (id) { return document.getElementById(id); };
  var LV = [['all', 'Mọi cấp'], ['so', 'Sơ cấp'], ['trung', 'Trung cấp'], ['cao', 'Cao cấp']];
  var FREE = {
    free: ['free', '✅ Miễn phí'],
    cc: ['cc', '🔓 Bản quyền mở'],
    pd: ['pd', '🏛️ Phạm vi công cộng'],
    kem: ['kem', '🎧 Chỉ tài liệu kèm miễn phí'],
    app: ['app', '📱 App miễn phí'],
    part: ['kem', '🌗 Một phần miễn phí'],
    none: ['none', '🔒 Không có bản miễn phí']
  };
  var LVN = { so: 'Sơ cấp', trung: 'Trung cấp', cao: 'Cao cấp' };
  var CAT = {}; D.cats.forEach(function (c) { CAT[c.id] = c; });

  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var st = load('bm.sach', { cat: 'all', lv: 'all' });
  if (st.cat !== 'all' && !CAT[st.cat]) st.cat = 'all';
  var fav = load('bm.sach.fav', []);
  var favOnly = false, q = '';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function vars(c) { return '--k:' + c.c + ';--k2:' + c.c2 + ';--kd:' + c.cd + ';--kl:' + c.soft; }

  /* hero */
  var b = $('buddy');
  if (window.BM_MASCOT) b.insertAdjacentHTML('beforeend', window.BM_MASCOT());
  b.addEventListener('click', function () { b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump'); });
  var nLinks = D.items.length, nCats = D.cats.length;
  $('stat').innerHTML = '<span>📦 <b>' + nLinks + '</b> nguồn · <b>' + nCats + '</b> nhóm</span><span>💸 <b>0đ</b></span>';
  $('legend').innerHTML = Object.keys(FREE).map(function (k) { return '<span><i class="bd ' + FREE[k][0] + '">' + FREE[k][1] + '</i></span>'; }).join('');

  /* thanh lọc */
  function drawCats() {
    var all = { id: 'all', emo: '✨', name: 'Tất cả', c: '#5E9A2B' };
    $('cats').innerHTML = [all].concat(D.cats).map(function (c) {
      var n = c.id === 'all' ? D.items.length : D.items.filter(function (i) { return i.cat === c.id; }).length;
      return '<button class="cat' + (st.cat === c.id ? ' on' : '') + '" role="tab" aria-selected="' + (st.cat === c.id) + '" data-cat="' + c.id + '" style="--k:' + c.c + '"><i>' + c.emo + '</i>' + esc(c.short || c.name) + ' <small>' + n + '</small></button>';
    }).join('');
  }
  function drawLv() {
    $('lv').innerHTML = LV.map(function (l) {
      return '<button role="radio" aria-checked="' + (st.lv === l[0]) + '" class="' + (st.lv === l[0] ? 'on' : '') + '" data-lv="' + l[0] + '">' + l[1] + '</button>';
    }).join('');
  }
  function drawFav() { $('favN').textContent = fav.length; $('favOnly').setAttribute('aria-pressed', favOnly); }

  function match(i) {
    if (st.cat !== 'all' && i.cat !== st.cat) return false;
    if (st.lv !== 'all' && i.lv.indexOf(st.lv) < 0) return false;
    if (favOnly && fav.indexOf(i.id) < 0) return false;
    if (q) {
      var hay = fold([i.t, i.zh, i.d, i.by, (i.tags || []).join(' '), CAT[i.cat].name, i.lv.map(function (l) { return LVN[l]; }).join(' ')].join(' '));
      var ok = fold(q).split(/\s+/).every(function (w) { return !w || hay.indexOf(w) >= 0; });
      if (!ok) return false;
    }
    return true;
  }

  function card(i, n) {
    var c = CAT[i.cat], f = FREE[i.free] || FREE.free, on = fav.indexOf(i.id) >= 0;
    var lv = i.lv.length === 3 ? 'Mọi cấp' : i.lv.map(function (l) { return LVN[l]; }).join(' → ');
    var links = (i.links || [[i.url, i.go || 'Mở']]).map(function (l, k) {
      return '<a class="btn ' + (k ? 'sec' : 'pri') + '" href="' + esc(l[0]) + '"' + (/^\.\.\//.test(l[0]) ? '' : ' target="_blank" rel="noopener noreferrer"') + '>' + esc(l[1]) + (/^\.\.\//.test(l[0]) ? '' : ' ↗') + '</a>';
    }).join('');
    return '<article class="it' + (i.mine ? ' mine' : '') + '" style="' + vars(c) + ';animation-delay:' + Math.min(n * 0.03, 0.3) + 's">' +
      '<div class="it-top"><div class="it-ico" aria-hidden="true">' + (i.emo || c.emo) + '</div>' +
      '<div class="it-tx"><h3>' + esc(i.t) + '</h3>' + (i.zh ? '<span class="zh" lang="zh-CN">' + esc(i.zh) + '</span>' : '') + '</div>' +
      '<button class="star' + (on ? ' on' : '') + '" data-fav="' + i.id + '" aria-pressed="' + on + '" aria-label="Lưu ' + esc(i.t) + '">⭐</button></div>' +
      '<div class="badges"><span class="bd ' + f[0] + '">' + f[1] + '</span><span class="bd">' + lv + '</span>' + (i.tags || []).map(function (t) { return '<span class="bd">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<p>' + i.d + '</p><div class="by">Nguồn: ' + esc(i.by || host((i.links ? i.links[0][0] : i.url))) + '</div>' + (i.note ? '<div class="note">' + i.note + '</div>' : '') +
      '<div class="acts">' + links + '</div></article>';
  }

  function draw() {
    var list = D.items.filter(match), html = '', n = 0;
    var cats = st.cat === 'all' ? D.cats : [CAT[st.cat]];
    cats.forEach(function (c) {
      var its = list.filter(function (i) { return i.cat === c.id; });
      if (!its.length) return;
      html += '<section class="grp" style="' + vars(c) + '"><div class="grp-h"><div class="gi" aria-hidden="true">' + c.emo + '</div><div><h2>' + esc(c.name) + '</h2><p>' + c.d + '</p></div></div><div class="grid">' +
        its.map(function (i) { return card(i, n++); }).join('') + '</div></section>';
    });
    if (!html) {
      html = '<div class="empty"><div class="e">🥖💭</div><p>' + (favOnly && !fav.length ? 'Chưa lưu tài liệu nào. Bấm ⭐ trên thẻ để lưu nha.' : 'Không thấy tài liệu nào khớp.') + '</p><button class="btn sec" type="button" id="reset">Xem tất cả</button></div>';
    }
    $('list').innerHTML = html;
  }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 1800); }
  function all() { drawCats(); drawLv(); drawFav(); draw(); }

  $('cats').addEventListener('click', function (e) {
    var t = e.target.closest('[data-cat]'); if (!t) return;
    st.cat = t.getAttribute('data-cat'); save('bm.sach', st); drawCats(); draw();
    t = $('cats').querySelector('.on'); if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  $('lv').addEventListener('click', function (e) {
    var t = e.target.closest('[data-lv]'); if (!t) return;
    st.lv = t.getAttribute('data-lv'); save('bm.sach', st); drawLv(); draw();
  });
  $('favOnly').addEventListener('click', function () { favOnly = !favOnly; drawFav(); draw(); });
  $('list').addEventListener('click', function (e) {
    var s = e.target.closest('[data-fav]');
    if (s) {
      var id = s.getAttribute('data-fav'), k = fav.indexOf(id);
      if (k >= 0) fav.splice(k, 1); else fav.push(id);
      save('bm.sach.fav', fav); drawFav();
      var on = k < 0; s.classList.toggle('on', on); s.setAttribute('aria-pressed', on);
      toast(on ? '⭐ Đã lưu vào mục "Đã lưu"' : 'Đã bỏ lưu');
      if (favOnly && !on) draw();
      return;
    }
    if (e.target.id === 'reset') { st = { cat: 'all', lv: 'all' }; favOnly = false; q = ''; $('q').value = ''; $('qx').hidden = true; save('bm.sach', st); all(); }
  });
  var qt;
  $('q').addEventListener('input', function () {
    $('qx').hidden = !this.value; clearTimeout(qt);
    var v = this.value; qt = setTimeout(function () { q = v.trim(); draw(); }, 120);
  });
  $('qx').addEventListener('click', function () { $('q').value = ''; q = ''; this.hidden = true; draw(); $('q').focus(); });
  all();
})();
