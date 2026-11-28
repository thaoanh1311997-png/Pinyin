/* Chuyển đổi file PDF ⇄ Excel, xử lý ngay trên trình duyệt (file không gửi đi đâu). */
(function () {
  'use strict';
  const K = window.KT; const { $, $$, esc, toast } = K;
  const libs = {};
  const lib = (url, test) => test() ? Promise.resolve() : (libs[url] = libs[url] || new Promise((ok, no) => { const s = document.createElement('script'); s.src = url; s.onload = ok; s.onerror = () => { delete libs[url]; no(new Error('Không tải được thư viện. Kiểm tra mạng.')); }; document.head.appendChild(s); }));
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const H2C = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  const JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  async function pdfjs() { await lib(PDFJS, () => window.pdfjsLib); window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; return window.pdfjsLib; }
  const vnNum = s => { const t = String(s).trim(); if (/^-?\(?\d{1,3}(\.\d{3})+(,\d+)?\)?$/.test(t) || /^-?\d+(,\d+)?$/.test(t)) { const neg = /^\(.*\)$/.test(t) || t.startsWith('-'); const n = +t.replace(/[()\-]/g, '').replace(/\./g, '').replace(',', '.'); return isFinite(n) ? (neg ? -n : n) : null; } return null; };

  /* PDF → bảng: gom chữ theo dòng (toạ độ y) rồi theo cột (toạ độ x). */
  async function pdfToTables(file, onProg) {
    const pdf = await (await pdfjs()).getDocument({ data: await file.arrayBuffer() }).promise; const pages = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      onProg && onProg(p, pdf.numPages);
      const page = await pdf.getPage(p); const tc = await page.getTextContent();
      const items = tc.items.filter(i => i.str && i.str.trim()).map(i => ({ s: i.str.trim(), x: i.transform[4], y: i.transform[5], w: i.width, h: Math.abs(i.transform[3]) || 8 }));
      if (!items.length) { pages.push(null); continue; }
      items.sort((a, b) => b.y - a.y || a.x - b.x);
      const rows = []; for (const it of items) { const r = rows.find(r => Math.abs(r.y - it.y) <= Math.max(2.5, it.h * 0.35)); if (r) r.items.push(it); else rows.push({ y: it.y, items: [it] }); }
      rows.sort((a, b) => b.y - a.y);
      // gộp các mẩu chữ sát nhau trong cùng dòng thành 1 ô
      rows.forEach(r => { r.items.sort((a, b) => a.x - b.x); const m = []; for (const it of r.items) { const l = m[m.length - 1]; if (l && it.x - (l.x + l.w) < Math.max(3, it.h * 0.45)) { l.s += (it.x - (l.x + l.w) > it.h * 0.15 ? ' ' : '') + it.s; l.w = it.x + it.w - l.x; } else m.push({ ...it }); } r.cells = m; });
      // cột: lấy các mốc x bắt đầu ô, gom mốc gần nhau
      const xs = rows.flatMap(r => r.cells.map(c => c.x)).sort((a, b) => a - b); const cols = [];
      for (const x of xs) { const c = cols[cols.length - 1]; if (c && x - c.max < 14) { c.max = x; c.n++; } else cols.push({ min: x, max: x, n: 1 }); }
      const all = rows.flatMap(r => r.cells); const spanned = x => all.some(c => c.x < x - 3 && c.x + c.w > x + 3);
      const starts = cols.filter(c => c.n >= Math.max(2, rows.length * 0.08) || cols.length < 4 || !spanned(c.min)).map(c => c.min);
      if (!starts.length) starts.push(xs[0]);
      const colOf = x => { let k = 0; for (let i = 0; i < starts.length; i++) if (x >= starts[i] - 6) k = i; return k; };
      const grid = rows.map(r => { const a = new Array(starts.length).fill(''); r.cells.forEach(c => { const k = colOf(c.x); a[k] = a[k] ? a[k] + ' ' + c.s : c.s; }); return a; });
      // bỏ cột trống
      const keep = starts.map((_, i) => grid.some(r => r[i] !== ''));
      pages.push(grid.map(r => r.filter((_, i) => keep[i]).map(v => { const n = vnNum(v); return n === null ? v : n; })));
    }
    return pages;
  }

  /* Excel → PDF: vẽ bảng bằng HTML (đúng font tiếng Việt), chụp từng trang, ghép PDF A4. */
  async function xlsxToPdf(file, opt, onProg) {
    await Promise.all([lib(H2C, () => window.html2canvas), lib(JSPDF, () => window.jspdf)]);
    const wb = XLSX.read(await file.arrayBuffer(), { cellDates: true });
    const { jsPDF } = window.jspdf; const land = opt.orient === 'l';
    const doc = new jsPDF({ orientation: land ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    const PW = land ? 297 : 210, PH = land ? 210 : 297, M = 12;
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-10000px;top:0;background:#fff;color:#111';
    document.body.appendChild(host);
    const pxW = Math.round((PW - 2 * M) / 25.4 * 96); let first = true, pageNo = 0;
    const sheets = opt.sheet === 'all' ? wb.SheetNames : [opt.sheet || wb.SheetNames[0]];
    try {
      for (const sn of sheets) {
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '', raw: false }).filter(r => r.some(c => String(c).trim() !== ''));
        if (!aoa.length) continue;
        const nc = Math.max(...aoa.map(r => r.length)); const head = aoa[0]; const body = aoa.slice(1);
        const isNum = v => /^-?[\d.,]+$/.test(String(v).trim()) && /\d/.test(String(v));
        const rowsPer = Math.max(8, Math.floor(((PH - 2 * M - 14) / 25.4 * 96 - 34) / 24));
        for (let i = 0; i < Math.max(1, body.length); i += rowsPer) {
          onProg && onProg(++pageNo);
          const chunk = body.slice(i, i + rowsPer);
          host.innerHTML = `<div style="width:${pxW}px;font-family:'Be Vietnam Pro',Arial,sans-serif;font-size:${nc > 9 ? 10 : 12}px;padding:0">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">${esc(opt.title || file.name.replace(/\.[^.]+$/, ''))}${sheets.length > 1 ? ' – ' + esc(sn) : ''}</div>
            <table style="border-collapse:collapse;width:100%;table-layout:auto"><thead><tr>${Array.from({ length: nc }, (_, k) => `<th style="border:1px solid #888;background:#E3F1EE;padding:4px 5px;text-align:left;font-weight:700">${esc(head[k] ?? '')}</th>`).join('')}</tr></thead>
            <tbody>${chunk.map((r, j) => `<tr style="background:${j % 2 ? '#F7F9FA' : '#fff'}">${Array.from({ length: nc }, (_, k) => `<td style="border:1px solid #bbb;padding:3px 5px;${isNum(r[k]) ? 'text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap' : ''}">${esc(r[k] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          const cv = await window.html2canvas(host.firstElementChild, { scale: 2, backgroundColor: '#ffffff', logging: false });
          if (!first) doc.addPage(); first = false;
          const w = PW - 2 * M; const h = Math.min(PH - 2 * M - 8, cv.height * w / cv.width);
          doc.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', M, M, w, h);
          doc.setFontSize(8); doc.setTextColor(120); doc.text(String(pageNo), PW - M, PH - 6, { align: 'right' });
        }
      }
    } finally { host.remove(); }
    if (first) throw new Error('File Excel không có dữ liệu.');
    return doc.output('blob');
  }

  async function save(fn, blob) {
    const d = await K.dl(); if (!d) return toast('Trang này chưa cho tải file về máy.');
    try { await d.save({ filename: fn, data: blob }); toast('Đã tải ' + fn); } catch (e) { toast('Chưa lưu được file.'); }
  }

  K.ROUTES['chuyen-file'] = v => {
    const st = K.V.cv = K.V.cv || { tab: 'p2x' };
    v.innerHTML = `<div class="head"><div><h1>Chuyển đổi file</h1><p class="sub">Chuyển ngay trên máy của bạn, file khách hàng không gửi lên mạng.</p></div></div>
      <div class="tabs" id="cv-t"><button data-k="p2x" class="${st.tab === 'p2x' ? 'on' : ''}">PDF → Excel</button><button data-k="x2p" class="${st.tab === 'x2p' ? 'on' : ''}">Excel → PDF</button></div><div id="cv-b"></div>`;
    $$('#cv-t button', v).forEach(b => b.onclick = () => { st.tab = b.dataset.k; $$('#cv-t button', v).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const draw = () => (st.tab === 'p2x' ? p2x : x2p)($('#cv-b', v));
    draw();
  };
  function p2x(b) {
    b.innerHTML = `<div class="card"><label>Chọn file PDF (sao kê, bảng kê, báo cáo có bảng)<input type="file" id="px-f" accept=".pdf"></label>
      <div class="row2"><label>Cách xếp sheet<select id="px-m"><option value="one">Gộp tất cả trang vào 1 sheet</option><option value="each">Mỗi trang 1 sheet</option></select></label><label class="chk" style="margin-top:28px"><input type="checkbox" id="px-n" checked> Đổi số kiểu 1.234.567 thành số để cộng được</label></div>
      <p class="small mut">Đọc tốt PDF xuất từ phần mềm (HTKK, ngân hàng, MISA…). PDF scan (ảnh chụp) không có chữ nên cần dùng mục Đọc chứng từ (AI).</p><div id="px-s"></div></div><div id="px-r" class="mt"></div>`;
    let res = null, name = '';
    $('#px-f', b).onchange = async e => {
      const f = e.target.files[0]; if (!f) return; name = f.name.replace(/\.pdf$/i, ''); const s = $('#px-s', b);
      try { res = await pdfToTables(f, (p, n) => { s.innerHTML = `<div class="info">Đang đọc trang ${p}/${n}…</div>`; });
        const empty = res.filter(x => !x).length;
        s.innerHTML = res.every(x => !x) ? '<div class="warn">PDF này là ảnh scan, không có lớp chữ. Hãy dùng Đọc chứng từ (AI).</div>' : `<div class="info">Đọc xong ${res.length} trang${empty ? ', ' + empty + ' trang là ảnh không có chữ' : ''}.</div>`; show();
      } catch (er) { s.innerHTML = `<div class="warn">${esc(er.message || 'Không đọc được PDF')}</div>`; }
    };
    const rowsAll = () => { const conv = $('#px-n', b).checked; const m = x => conv ? x : x.map(v => typeof v === 'number' ? v.toLocaleString('vi-VN') : v); return res.filter(Boolean).map(p => p.map(m)); };
    const show = () => {
      if (!res || res.every(x => !x)) { $('#px-r', b).innerHTML = ''; return; }
      const all = rowsAll().flat(); const nc = Math.max(...all.map(r => r.length));
      $('#px-r', b).innerHTML = `<div class="card"><div class="ch"><h3>Xem trước (${all.length} dòng, ${nc} cột)</h3><button class="btn pri sm" id="px-dl">⇩ Tải file Excel</button></div>
        <div class="tw" style="max-height:60vh"><table class="tbl" style="white-space:nowrap"><tbody>${all.slice(0, 40).map(r => `<tr>${Array.from({ length: nc }, (_, k) => `<td class="${typeof r[k] === 'number' ? 'num' : ''}">${esc(typeof r[k] === 'number' ? r[k].toLocaleString('vi-VN') : (r[k] ?? ''))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${all.length > 40 ? `<p class="small mut">Còn ${all.length - 40} dòng nữa trong file Excel.</p>` : ''}</div>`;
      $('#px-dl', b).onclick = () => {
        const wb = XLSX.utils.book_new(); const pages = rowsAll();
        if ($('#px-m', b).value === 'each') pages.forEach((p, i) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(p), 'Trang ' + (i + 1)));
        else XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pages.flat()), 'Du lieu');
        save(name + '.xlsx', new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      };
    };
    $('#px-n', b).onchange = show;
  }
  function x2p(b) {
    b.innerHTML = `<div class="card"><label>Chọn file Excel (.xlsx, .xls, .csv)<input type="file" id="xp-f" accept=".xlsx,.xls,.csv"></label>
      <div class="row2"><label>Sheet<select id="xp-s"><option value="">(chọn file trước)</option></select></label><label>Khổ giấy A4<select id="xp-o"><option value="p">Dọc</option><option value="l">Ngang (bảng nhiều cột)</option></select></label></div>
      <label>Tiêu đề in trên đầu trang<input id="xp-t" placeholder="Để trống: dùng tên file"></label>
      <div class="acts-b"><button class="btn pri" id="xp-go" disabled>⇩ Tạo và tải PDF</button></div><div id="xp-st"></div></div>`;
    let file = null;
    $('#xp-f', b).onchange = async e => {
      file = e.target.files[0]; if (!file) return;
      try { const wb = XLSX.read(await file.arrayBuffer(), { bookSheets: true }); $('#xp-s', b).innerHTML = wb.SheetNames.map(n => `<option>${esc(n)}</option>`).join('') + (wb.SheetNames.length > 1 ? '<option value="all">Tất cả các sheet</option>' : '');
        const nc = XLSX.read(await file.arrayBuffer(), { sheetRows: 5 }); const first = XLSX.utils.sheet_to_json(nc.Sheets[nc.SheetNames[0]], { header: 1 }); const cols = Math.max(0, ...first.map(r => r.length)); if (cols > 7) $('#xp-o', b).value = 'l';
        $('#xp-go', b).disabled = false; $('#xp-st', b).innerHTML = '';
      } catch (er) { $('#xp-st', b).innerHTML = '<div class="warn">Không đọc được file Excel.</div>'; }
    };
    $('#xp-go', b).onclick = async () => {
      const bt = $('#xp-go', b); bt.disabled = true; const st = $('#xp-st', b);
      try { const blob = await xlsxToPdf(file, { sheet: $('#xp-s', b).value, orient: $('#xp-o', b).value, title: $('#xp-t', b).value.trim() }, p => { st.innerHTML = `<div class="info">Đang tạo trang ${p}…</div>`; });
        st.innerHTML = '<div class="info">Xong. Nếu không thấy hộp lưu file, bấm lại nút.</div>'; await save(file.name.replace(/\.[^.]+$/, '') + '.pdf', blob);
      } catch (er) { st.innerHTML = `<div class="warn">${esc(er.message || 'Không tạo được PDF')}</div>`; } finally { bt.disabled = false; }
    };
  }
  window.KT_CONV = { pdfToTables, xlsxToPdf, vnNum };
})();
