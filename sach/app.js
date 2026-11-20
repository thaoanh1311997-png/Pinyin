/* Bánh Mì · 📚 Tài liệu miễn phí — đọc ngay trong web */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SH = window.SACH_SHELF || { groups: {}, story: {}, fsi: {}, mit: {} };
  var LK = window.SACH_LINKS || { hsk: [], web: [] };
  var MY = window.BM_MYBOOKS;
  var BOOKS = [], MINE = [];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 2200); }
  function mb(n) { return n > 1e6 ? (n / 1e6).toFixed(0) + ' MB' : Math.max(1, Math.round(n / 1e3)) + ' KB'; }

  /* hero */
  var bud = $('buddy');
  if (window.BM_MASCOT) bud.insertAdjacentHTML('beforeend', window.BM_MASCOT());
  bud.addEventListener('click', function () { bud.classList.remove('jump'); void bud.offsetWidth; bud.classList.add('jump'); });
  function stat() {
    $('stat').innerHTML = '<span>📖 <b>' + BOOKS.length + '</b> cuốn đọc ngay</span>' + (MINE.length ? '<span>📚 <b>' + MINE.length + '</b> sách của bạn</span>' : '') + '<span>💸 <b>0đ</b></span>';
  }

  /* sách mở đã tải về site */
  function bookOf(b) {
    var g = SH.groups[b.src] || { emo: '📘', name: b.group, d: '', lic: b.license, c: '#E0475B', soft: '#FFE6E9' };
    var o = { file: b.file, src: b.src, g: g, zh: '', vi: b.title, sub: '', shelf: b.src };
    if (b.src === 'truyen-ca') {
      var zh = (b.title.match(/^[^A-Za-z]+/) || [b.title])[0].trim(), m = SH.story[zh];
      o.zh = zh; o.vi = m ? m[0] : ''; o.level = m ? m[1] : 1; o.shelf = 'truyen-ca-' + o.level;
    } else if (b.src === 'fsi') {
      var low = (b.from || b.file).toLowerCase(), k = Object.keys(SH.fsi).filter(function (x) { return low.indexOf(x) >= 0; })[0];
      o.vi = k ? SH.fsi[k] : b.title; o.sub = /workbook/.test(low) ? '📝 Sách bài tập' : '📗 Sách học';
    } else if (b.src === 'mit') {
      var suf = ((b.from || '').match(/S11_(\w+)\.pdf$/) || [])[1] || '', mm = suf.match(/^(unit|char|stroke)(\d+)$/);
      if (mm) { var n = +mm[2]; o.vi = mm[1] === 'unit' ? 'Bài ' + n : mm[1] === 'char' ? 'Chữ Hán bài ' + n : 'Thứ tự nét bài ' + n; o.sub = mm[1] === 'unit' ? '📗 Bài học' : mm[1] === 'char' ? '✍️ Chữ Hán' : '🖌️ Thứ tự nét'; }
      else o.vi = (SH.mit || {})[suf] || b.title;
    }
    return o;
  }
  function docHref(q, t, g) { return 'doc.html?' + q + '&t=' + encodeURIComponent(t) + '&g=' + encodeURIComponent(g); }

  function tile(b) {
    var t = (b.zh ? b.zh + ' · ' : '') + b.vi + (b.sub && b.src !== 'truyen-ca' ? ' (' + b.sub.replace(/^\S+\s/, '') + ')' : '');
    return '<a class="bk" href="' + docHref('f=' + encodeURIComponent(b.file).replace(/%2F/g, '/'), t, b.g.name) + '"><div class="cv" data-f="' + esc(b.file) + '"><span class="ph"><i>' + b.g.emo + '</i>' + esc(b.zh || b.vi) + '</span></div>' +
      (b.zh ? '<b lang="zh-CN">' + esc(b.zh) + '</b>' : '') + '<small>' + esc(b.vi) + '</small>' + (b.sub ? '<em>' + esc(b.sub) + '</em>' : '') + '</a>';
  }
  function myTile(b) {
    var t = b.name + (b.zh ? ' · ' + b.zh : '');
    return '<div class="bk my" data-id="' + b.id + '"><a class="cvl" href="' + docHref('my=' + b.id, t, 'Sách của tôi') + '"><div class="cv' + (b.cover ? ' has' : '') + '" data-my="' + b.id + '">' +
      (b.cover ? '<img alt="" src="' + b.cover + '">' : '') + '<span class="ph"><i>📕</i>' + esc(b.name) + '</span></div>' +
      '<b>' + esc(b.name) + '</b>' + (b.zh ? '<small lang="zh-CN">' + esc(b.zh) + '</small>' : '') + '<em>' + (b.pages ? b.pages + ' trang · ' : '') + mb(b.size) + '</em></a>' +
      '<button class="x" type="button" data-del="' + b.id + '" aria-label="Xoá ' + esc(b.name) + ' khỏi máy">✕</button></div>';
  }
  function head(emo, c, c2, name, d) {
    return '<div class="grp-h"><div class="gi" style="--k:' + c + ';--k2:' + c2 + '" aria-hidden="true">' + emo + '</div><div><h2>' + name + '</h2><p>' + d + '</p></div></div>';
  }

  function draw() {
    var h = '';
    /* 📚 Sách của tôi */
    h += '<section class="grp mine-sec" id="mine">' + head('📚', '#E2852B', '#FFC861', 'Sách của tôi', 'Thêm file PDF sách Hán ngữ (hay sách nào cũng được) một lần, lần sau mở web là có. Sách chỉ lưu trên máy này.') +
      '<div class="row">' + MINE.map(myTile).join('') +
      '<label class="bk add"><input type="file" id="addf" accept="application/pdf,.pdf" multiple hidden><div class="cv"><span class="ph"><i>＋</i>Thêm sách</span></div><small>Chọn file PDF trên máy</small></label>' +
      '</div></section>';
    /* 📖 Đọc ngay */
    if (BOOKS.length) {
      var order = [], by = {};
      BOOKS.forEach(function (b) { if (!by[b.shelf]) { by[b.shelf] = []; order.push(b.shelf); } by[b.shelf].push(b); });
      var srcSeen = {};
      h += '<section class="grp" id="doc">' + head('📖', '#E0475B', '#FF9AA6', 'Đọc ngay', 'Bấm vào bìa là mở sách. Có nút 拼 để xem pinyin, chạm chữ xem nghĩa.');
      order.forEach(function (k) {
        var bs = by[k], g = bs[0].g, first = !srcSeen[bs[0].src]; srcSeen[bs[0].src] = 1;
        var name = g.name + (bs[0].src === 'truyen-ca' ? ' · Cấp ' + bs[0].level : '');
        h += '<div class="shelf" id="shelf-' + k + '" style="--k:' + g.c + ';--kl:' + g.soft + '"><div class="sh-h"><b>' + g.emo + ' ' + esc(name) + ' <small>' + bs.length + ' cuốn</small></b>' +
          (first ? '<p>' + esc(g.d) + ' <span class="lic">' + esc(g.lic) + '</span></p>' : '') + '</div><div class="row">' + bs.map(tile).join('') + '</div></div>';
      });
      h += '</section>';
    }
    $('list').innerHTML = h;
    $('addf').addEventListener('change', onAdd);
    covers();
  }
  function links() {
    function row(l) {
      var ext = !/^\.\.\//.test(l.u);
      return '<a class="lkr" href="' + esc(l.u) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><i>' + l.emo + '</i><span><b>' + esc(l.t) + '</b><small>' + esc(l.d) + '</small></span>' + (l.tag ? '<em>' + esc(l.tag) + '</em>' : '') + '<u>' + (ext ? '↗' : '›') + '</u></a>';
    }
    $('hskList').innerHTML = LK.hsk.map(row).join('');
    $('webList').innerHTML = LK.web.map(row).join('');
  }

  /* thêm / xoá sách của tôi */
  function onAdd() {
    var fs = [].slice.call(this.files || []); this.value = '';
    fs = fs.filter(function (f) { return /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name); });
    if (!fs.length) { toast('Chọn file PDF nha'); return; }
    if (!MY) { toast('Máy này không lưu được sách'); return; }
    toast('Đang lưu ' + fs.length + ' cuốn…');
    var p = Promise.resolve(), names = [];
    fs.forEach(function (f) { p = p.then(function () { return MY.add(f).then(function (o) { names.push(o.name); }); }); });
    p.then(loadMine).then(function () {
      toast('📚 Đã thêm: ' + names.join(', '));
      var el = $('mine'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (e) { toast('Chưa lưu được: ' + (e && e.message || e) + '. Máy có thể hết dung lượng.'); });
  }
  $('list').addEventListener('click', function (e) {
    var x = e.target.closest('[data-del]'); if (!x) return;
    e.preventDefault();
    var id = x.getAttribute('data-del'), card = x.closest('.bk');
    if (!card.classList.contains('ask')) { card.classList.add('ask'); x.textContent = 'Xoá?'; setTimeout(function () { if (card.isConnected) { card.classList.remove('ask'); x.textContent = '✕'; } }, 3000); return; }
    MY.del(id).then(loadMine).then(function () { toast('Đã xoá sách khỏi máy'); });
  });

  /* bìa sách (vẽ trang 1 bằng pdf.js khi cuộn tới) */
  var pdfjsP = null, covQ = [], covBusy = 0;
  function pdfjs() {
    if (pdfjsP) return pdfjsP;
    pdfjsP = new Promise(function (ok, no) {
      var sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; ok(window.pdfjsLib); };
      sc.onerror = function () { pdfjsP = null; no(new Error('pdf.js')); }; document.head.appendChild(sc);
    });
    return pdfjsP;
  }
  function renderCover(lib, src, w) {
    return lib.getDocument(src).promise.then(function (d) {
      return d.getPage(1).then(function (pg) {
        var v = pg.getViewport({ scale: 1 }), sc = w * 2 / v.width, vp = pg.getViewport({ scale: sc });
        var cv = document.createElement('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        return pg.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { var n = d.numPages; d.destroy(); return { cv: cv, n: n }; });
      });
    });
  }
  function covNext() {
    if (covBusy >= 2 || !covQ.length) return;
    var el = covQ.shift(); if (!el.isConnected || el.dataset.done) { covNext(); return; }
    covBusy++; el.dataset.done = 1;
    var my = el.dataset.my;
    pdfjs().then(function (lib) {
      if (!my) return renderCover(lib, { url: el.dataset.f, disableAutoFetch: true, disableStream: true }, el.clientWidth || 140).then(function (r) { el.appendChild(r.cv); el.classList.add('has'); });
      return MY.get(my).then(function (o) {
        if (!o || !o.blob) return;
        return o.blob.arrayBuffer().then(function (buf) { return renderCover(lib, { data: new Uint8Array(buf) }, 150); }).then(function (r) {
          var url = r.cv.toDataURL('image/jpeg', 0.82), img = new Image(); img.alt = ''; img.src = url;
          el.insertBefore(img, el.firstChild); el.classList.add('has');
          var em = el.closest('.bk').querySelector('em'); if (em) em.textContent = r.n + ' trang · ' + mb(o.size);
          return MY.setCover(my, url, r.n);
        });
      });
    }).catch(function () {}).then(function () { covBusy--; covNext(); });
  }
  var covIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { covIO.unobserve(e.target); covQ.push(e.target); covNext(); } });
  }, { rootMargin: '200px' }) : null;
  function covers() {
    [].forEach.call(document.querySelectorAll('.cv[data-f]:not([data-done]),.cv[data-my]:not(.has):not([data-done])'), function (el) { if (covIO) covIO.observe(el); else { covQ.push(el); covNext(); } });
  }

  function loadMine() {
    if (!MY) return Promise.resolve();
    return MY.list().then(function (a) { MINE = a; draw(); stat(); }).catch(function () { draw(); });
  }
  function loadBooks() {
    return fetch('data/books.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      BOOKS = (d.books || []).map(bookOf); draw(); stat();
    }).catch(function () {});
  }
  stat(); links(); draw(); loadMine(); loadBooks();
})();
