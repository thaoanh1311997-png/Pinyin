// In tô màu: printable A4 coloring sheets (4 pictures/page) for the words parents added (Từ trên lớp).
(function () {
  const X = window.XM, { $, esc, view, bar, toast, LS } = X;
  const pic = w => w.ph && X.PH[w.ph] ? X.PH[w.ph] : w.img ? X.IMG(w.img) : '';
  function outline(en) {
    const CM = window.CMAP || {}, e = en.toLowerCase().trim(), s = X.singular(e);
    const k = CM[e] || CM[s] || CM[e.split(' ').pop()] || CM[X.singular(e.split(' ').pop())];
    return k ? 'img/c/' + k + '.svg' : '';
  }
  // pencil-line sketch from a photo (for words with no outline drawing)
  function sketch(src) {
    return new Promise(res => {
      if (!src) return res('');
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const S = 360, r = Math.min(S / im.width, S / im.height), w = Math.round(im.width * r), h = Math.round(im.height * r);
          const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h);
          const d = g.getImageData(0, 0, w, h), p = d.data, n = w * h, Y = new Float32Array(n);
          for (let i = 0; i < n; i++) Y[i] = 0.3 * p[i * 4] + 0.59 * p[i * 4 + 1] + 0.11 * p[i * 4 + 2];
          const blur = (a, R) => { const o = new Float32Array(n), t = new Float32Array(n);
            for (let y = 0; y < h; y++) { let s = 0; for (let x = -R; x <= R; x++) s += a[y * w + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { t[y * w + x] = s / (2 * R + 1); s += a[y * w + Math.min(w - 1, x + R + 1)] - a[y * w + Math.max(0, x - R)]; } }
            for (let x = 0; x < w; x++) { let s = 0; for (let y = -R; y <= R; y++) s += t[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { o[y * w + x] = s / (2 * R + 1); s += t[Math.min(h - 1, y + R + 1) * w + x] - t[Math.max(0, y - R) * w + x]; } }
            return o; };
          const a = blur(Y, 1), b = blur(Y, 3);
          for (let i = 0; i < n; i++) { const v = a[i] - 0.985 * b[i]; const o = v < -2 ? Math.max(0, 255 + v * 18) : 255; p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = o; p[i * 4 + 3] = 255; }
          g.putImageData(d, 0, 0); res(c.toDataURL('image/png'));
        } catch (e) { res(''); }
      };
      im.onerror = () => res(''); im.src = src;
    });
  }
  const cell = (w, src) => `<div class="pc"><div class="pim">${src ? `<img src="${src}" alt="">` : '<span class="pdraw">Bé vẽ vào đây ✏️</span>'}</div><div class="pw" style="font-size:${Math.min(3.6, 30 / Math.max(4, w.en.length)).toFixed(2)}em">${esc(w.en)}</div><div class="pv">${esc(w.vi || '')}</div><div class="ptr" style="font-size:${Math.min(2.3, 22 / Math.max(4, w.en.length)).toFixed(2)}em">${esc(w.en)}</div></div>`;
  async function sheets(L) {
    const out = [];
    for (const w of L) out.push(cell(w, outline(w.en) || await sketch(pic(w))));
    let h = '';
    for (let i = 0; i < out.length; i += 4) h += `<section class="psheet"><header><b>🖍️ Tô màu & học từ</b><span>Tên bé: ……………… &nbsp; Ngày: ……/……</span></header><div class="pgrid">${out.slice(i, i + 4).join('')}</div><footer>Xíu Mại English</footer></section>`;
    return h;
  }
  window.XMP = async () => {
    const L = X.custom();
    if (!L.length) { view(bar('In tô màu', '#/bame/tu-lop') + `<div class="panel"><p class="muted" style="margin:0 0 12px">Chưa có từ nào. Ba mẹ nhập từ bé học trên lớp trước nhé.</p><a class="btn" style="display:block;text-decoration:none" href="#/bame/tu-lop">✍️ Nhập từ</a></div>`); return; }
    let sel = LS.get('prtSel', null); if (!Array.isArray(sel)) sel = L.map(w => w.en);
    const draw = async () => {
      const S = new Set(sel), P = L.filter(w => S.has(w.en)), np = Math.ceil(P.length / 4);
      view(bar('In tô màu', '#/bame/tu-lop') + `<div class="panel prtop"><p class="muted" style="margin:0 0 8px">Mỗi trang 4 hình nét để bé tô màu, kèm chữ rỗng để tô và chữ mờ để tập viết. Chọn từ muốn in:</p>
        <div class="pchips">${L.map((w, i) => `<button class="pchip${S.has(w.en) ? ' on' : ''}" data-i="${i}">${esc(w.en)}</button>`).join('')}</div>
        <div class="pbar"><button class="btn sm" id="pall">Chọn hết</button><button class="btn sm" id="pnone">Bỏ chọn</button></div>
        <button class="btn prt" id="pgo" ${P.length ? '' : 'disabled'} style="width:100%">🖨️ In ${np} trang (${P.length} từ)</button></div><div id="pprev" class="pprev"><p class="muted">Đang vẽ hình…</p></div>`);
      document.getElementById('app').querySelectorAll('.pchip').forEach(b => b.onclick = () => { const e = L[+b.dataset.i].en; sel = S.has(e) ? sel.filter(x => x !== e) : sel.concat(e); LS.set('prtSel', sel); draw(); });
      $('#pall').onclick = () => { sel = L.map(w => w.en); LS.set('prtSel', sel); draw(); };
      $('#pnone').onclick = () => { sel = []; LS.set('prtSel', sel); draw(); };
      const h = await sheets(P);
      const pv = $('#pprev'); if (!pv) return; pv.innerHTML = h || '<p class="muted">Chọn ít nhất 1 từ nhé.</p>';
      let pr = document.getElementById('prt'); if (!pr) { pr = document.createElement('div'); pr.id = 'prt'; document.body.appendChild(pr); } pr.innerHTML = h;
      $('#pgo').onclick = () => { const imgs = [...pr.querySelectorAll('img')]; Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => window.print()); };
    };
    draw();
  };
})();
