/* Công cụ: đọc chứng từ, soạn mail, tính nhanh, mẫu biểu, văn bản mới, tra cứu MST. */
(function () {
  'use strict';
  const K = window.KT, L = window.KT_DL, LUAT = window.KT_LUAT;
  const { $, $$, esc, money, fmtD, TODAY, toast, modal, closeModal } = K;
  const R = K.ROUTES;

  /* ---- shared ---- */
  const libs = {};
  function lib(url, test) {
    if (test()) return Promise.resolve();
    if (!libs[url]) libs[url] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = url; s.onload = () => ok(); s.onerror = () => { delete libs[url]; no(new Error('Không tải được thư viện đọc file. Kiểm tra mạng.')); }; document.head.appendChild(s); });
    return libs[url];
  }
  const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const MAMMOTH = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
  async function pdfLib() { await lib(PDFJS, () => window.pdfjsLib); window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; return window.pdfjsLib; }
  async function pdfText(file, maxPages) {
    const pdf = await (await pdfLib()).getDocument({ data: await file.arrayBuffer() }).promise; let out = '';
    for (let i = 1; i <= Math.min(pdf.numPages, maxPages || 30); i++) { const p = await pdf.getPage(i); const tc = await p.getTextContent(); out += tc.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join('') + '\n'; }
    return out;
  }
  async function pdfImages(file, maxPages) {
    const pdf = await (await pdfLib()).getDocument({ data: await file.arrayBuffer() }).promise; const out = [];
    for (let i = 1; i <= Math.min(pdf.numPages, maxPages || 2); i++) { const p = await pdf.getPage(i); const vp = p.getViewport({ scale: 1.6 }); const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; out.push(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85))); }
    return out;
  }
  async function fileText(f) {
    const n = f.name.toLowerCase();
    if (n.endsWith('.pdf')) return pdfText(f);
    if (n.endsWith('.docx')) { await lib(MAMMOTH, () => window.mammoth); return (await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value; }
    if (/\.(xlsx|xls|csv)$/.test(n)) { const wb = XLSX.read(await f.arrayBuffer()); return wb.SheetNames.map(s => XLSX.utils.sheet_to_csv(wb.Sheets[s])).join('\n'); }
    return f.text();
  }
  let sampleNs;
  async function ai() { if (sampleNs !== undefined) return sampleNs; try { sampleNs = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) { sampleNs = null; } return sampleNs; }
  const aiErr = e => { const c = e && e.code; if (c === 'not_granted') return 'Bạn chưa cho phép trang dùng AI. Mở menu quyền của trang để bật.'; if (c === 'rate_limited') return 'AI đang bận, thử lại sau ít phút.'; return 'AI chưa trả lời được: ' + ((e && e.message) || 'lỗi không rõ'); };
  const noAI = '<div class="warn">Tính năng AI chỉ chạy khi mở trang trong Claude (đã đăng nhập). Phần đọc file XML, Excel vẫn dùng được.</div>';
  const clientOpts = (sel, blank) => (blank ? `<option value="">${blank}</option>` : '') + K.S.data.clients.filter(c => c.active !== false).sort((a, b) => a.name.localeCompare(b.name, 'vi')).map(c => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const num = s => { if (typeof s === 'number') return s; s = String(s || '').trim(); if (!s) return 0; if (/^-?\d+([.,]\d+)?$/.test(s) && !/[.,]\d{3}$/.test(s)) return +s.replace(',', '.'); return +s.replace(/[^\d-]/g, '') || 0; };
  async function copy(text, ta) { try { await navigator.clipboard.writeText(text); toast('Đã chép'); } catch (e) { if (ta) { ta.focus(); ta.select(); } toast('Đã bôi đen, bấm Ctrl+C để chép'); } }
  const tabs = (id, items, cur) => `<div class="tabs" id="${id}">${items.map(([k, t]) => `<button data-k="${k}" class="${cur === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;

  /* =========================================================
     ĐỌC CHỨNG TỪ
     ========================================================= */
  const ST = K.V.dct = K.V.dct || { tab: 'hd', inv: [], bank: [], client: '' };
  R['doc-chung-tu'] = v => {
    v.innerHTML = `<div class="head"><div><h1>Đọc chứng từ</h1><p class="sub">Tải file lên là ra bảng số liệu. File chỉ đọc trên máy này, không lưu lên đâu.</p></div></div>
      ${tabs('dc-t', [['hd', 'Hoá đơn → bảng kê'], ['sk', 'Sao kê ngân hàng'], ['hs', 'Kiểm tra hồ sơ thiếu'], ['hdg', 'Tóm tắt hợp đồng']], ST.tab)}<div id="dc-b"></div>`;
    $$('#dc-t button', v).forEach(b => b.onclick = () => { ST.tab = b.dataset.k; $$('#dc-t button', v).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const draw = () => ({ hd: viewInv, sk: viewBank, hs: viewCheck, hdg: viewContract })[ST.tab]($('#dc-b', v));
    draw();
  };

  /* --- hoá đơn --- */
  function parseInvXml(txt, fname) {
    const doc = new DOMParser().parseFromString(txt, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('File XML lỗi');
    const g = (root, tag) => { if (!root) return ''; const e = root.getElementsByTagName(tag)[0]; return e ? e.textContent.trim() : ''; };
    const tt = doc.getElementsByTagName('TTChung')[0], nb = doc.getElementsByTagName('NBan')[0], nm = doc.getElementsByTagName('NMua')[0], to = doc.getElementsByTagName('TToan')[0];
    if (!tt && !nb) throw new Error('Không phải hoá đơn điện tử');
    const r = { file: fname, nguon: 'XML', mau: g(tt, 'KHMSHDon'), ky_hieu: g(tt, 'KHHDon'), so: g(tt, 'SHDon'), ngay: g(tt, 'NLap'),
      ban_ten: g(nb, 'Ten'), ban_mst: g(nb, 'MST'), mua_ten: g(nm, 'Ten') || g(nm, 'HVTNMHang'), mua_mst: g(nm, 'MST'),
      truoc_thue: num(g(to, 'TgTCThue')), thue: num(g(to, 'TgTThue')), tong: num(g(to, 'TgTTTBSo')), ts: '' };
    const rates = new Set(); Array.from(doc.getElementsByTagName('TSuat')).forEach(e => rates.add(e.textContent.trim())); r.ts = Array.from(rates).join(', ');
    if (!r.tong) r.tong = r.truoc_thue + r.thue;
    return r;
  }
  async function readInvAI(f) {
    const s = await ai(); if (!s) throw new Error('Cần AI để đọc PDF, ảnh. Hãy dùng file XML của hoá đơn.');
    let images = [];
    if (/\.pdf$/i.test(f.name)) { const t = await pdfText(f, 3); if (t.replace(/\s/g, '').length > 200) { return s.json(invPrompt('Nội dung chữ của hoá đơn:\n' + t.slice(0, 12000)), { modelTier: 'quick' }).then(x => fixInv(x, f.name)); } images = await pdfImages(f, 2); }
    else images = [f];
    const lim = await s.limits().catch(() => ({})); if (!lim.images) throw new Error('AI ở đây chưa đọc được ảnh. Hãy dùng file XML hoặc PDF có chữ.');
    return s.json(invPrompt('Ảnh hoá đơn đính kèm.'), { images, modelTier: 'default' }).then(x => fixInv(x, f.name));
  }
  const invPrompt = body => `Bạn là kế toán Việt Nam. Trích thông tin hoá đơn GTGT sau thành JSON đúng khoá: {"mau":"ký hiệu mẫu số","ky_hieu":"ký hiệu hoá đơn","so":"số hoá đơn","ngay":"YYYY-MM-DD","ban_ten":"","ban_mst":"","mua_ten":"","mua_mst":"","truoc_thue":số,"thue":số,"tong":số,"ts":"thuế suất, ví dụ 8% hoặc 10%"}. Số tiền là số nguyên đồng, không dấu chấm. Trường nào không thấy để chuỗi rỗng hoặc 0, không đoán.\n${body}`;
  const fixInv = (x, fname) => ({ file: fname, nguon: 'AI', mau: x.mau || '', ky_hieu: x.ky_hieu || '', so: String(x.so || ''), ngay: x.ngay || '', ban_ten: x.ban_ten || '', ban_mst: String(x.ban_mst || ''), mua_ten: x.mua_ten || '', mua_mst: String(x.mua_mst || ''), truoc_thue: num(x.truoc_thue), thue: num(x.thue), tong: num(x.tong) || num(x.truoc_thue) + num(x.thue), ts: x.ts || '' });
  function viewInv(b) {
    b.innerHTML = `<div class="card"><div class="row2"><label>Công ty đang làm (để phân biệt mua vào, bán ra)<select id="iv-c">${clientOpts(ST.client, 'Chọn khách hàng')}</select></label>
      <label>Tải hoá đơn (XML, PDF, ảnh)<input type="file" id="iv-f" multiple accept=".xml,.pdf,.jpg,.jpeg,.png,.zip"></label></div>
      <p class="small mut">💡 XML chính xác nhất. PDF, ảnh do AI đọc, nhớ soát lại.</p><div id="iv-s"></div></div><div id="iv-r" class="mt"></div>`;
    $('#iv-c', b).onchange = e => { ST.client = e.target.value; drawTbl(); };
    $('#iv-f', b).onchange = async e => {
      const files = Array.from(e.target.files); e.target.value = ''; const st = $('#iv-s', b); let ok = 0, bad = [];
      for (let i = 0; i < files.length; i++) { const f = files[i]; st.innerHTML = `<div class="info">Đang đọc ${i + 1}/${files.length}: ${esc(f.name)}…</div>`;
        try { const r = /\.xml$/i.test(f.name) ? parseInvXml(await f.text(), f.name) : await readInvAI(f);
          if (ST.inv.some(x => x.so && x.so === r.so && x.ban_mst === r.ban_mst && x.ky_hieu === r.ky_hieu)) bad.push(f.name + ': trùng hoá đơn đã đọc'); else { ST.inv.push(r); ok++; } }
        catch (er) { bad.push(f.name + ': ' + (er.code ? aiErr(er) : er.message)); } }
      st.innerHTML = `<div class="${bad.length ? 'warn' : 'info'}">Đã đọc ${ok} hoá đơn.${bad.length ? '<br>' + bad.map(esc).join('<br>') : ''}</div>`; drawTbl();
    };
    const drawTbl = () => {
      const c = K.cMap()[ST.client]; const mst = c ? c.mst : '';
      const typ = r => !mst ? '' : r.mua_mst === mst ? 'Mua vào' : r.ban_mst === mst ? 'Bán ra' : 'Khác MST';
      const rows = ST.inv.slice().sort((a, b) => String(a.ngay).localeCompare(String(b.ngay)));
      const sum = (k, t) => rows.filter(r => !t || typ(r) === t).reduce((s, r) => s + r[k], 0);
      $('#iv-r', b).innerHTML = rows.length ? `<div class="card"><div class="ch"><h3>Bảng kê ${rows.length} hoá đơn</h3><div class="acts"><button class="btn sm" id="iv-x">⇩ Xuất Excel</button><button class="btn sm red" id="iv-clr">Xoá bảng</button></div></div>
        ${mst ? `<div class="grid g3 mt"><div class="kpi"><small>Mua vào: tiền thuế</small><b class="num">${money(sum('thue', 'Mua vào'))}</b><em>trên ${money(sum('truoc_thue', 'Mua vào'))} tiền hàng</em></div><div class="kpi"><small>Bán ra: tiền thuế</small><b class="num">${money(sum('thue', 'Bán ra'))}</b><em>trên ${money(sum('truoc_thue', 'Bán ra'))} doanh thu</em></div><div class="kpi ${sum('thue', 'Bán ra') - sum('thue', 'Mua vào') > 0 ? 'red' : 'grn'}"><small>Chênh lệch thuế (bán ra − mua vào)</small><b class="num">${money(sum('thue', 'Bán ra') - sum('thue', 'Mua vào'))}</b><em>tham khảo, chưa gồm kỳ trước chuyển sang</em></div></div>` : '<p class="small mut">Chọn công ty ở trên để tách mua vào, bán ra.</p>'}
        <div class="tw mt"><table class="tbl"><thead><tr><th>Ngày</th><th>Ký hiệu · Số</th><th>Người bán</th><th>Người mua</th>${mst ? '<th>Loại</th>' : ''}<th class="num">Tiền hàng</th><th>TS</th><th class="num">Thuế GTGT</th><th class="num">Tổng thanh toán</th><th></th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr><td>${fmtD(String(r.ngay).slice(0, 10))}</td><td class="mono">${esc(r.ky_hieu)} · ${esc(r.so)}</td><td>${esc(r.ban_ten)}<br><small class="mono">${esc(r.ban_mst)}</small></td><td>${esc(r.mua_ten)}<br><small class="mono">${esc(r.mua_mst)}</small></td>${mst ? `<td>${typ(r)}</td>` : ''}<td class="num">${money(r.truoc_thue)}</td><td>${esc(r.ts)}</td><td class="num">${money(r.thue)}</td><td class="num">${money(r.tong)}</td><td><span class="pill ${r.nguon === 'XML' ? 'p-da_nop' : 'p-amb'}" title="${esc(r.file)}">${r.nguon}</span></td></tr>`).join('')}
        </tbody><tfoot><tr class="sum"><td colspan="${mst ? 5 : 4}">Cộng</td><td class="num">${money(sum('truoc_thue'))}</td><td></td><td class="num">${money(sum('thue'))}</td><td class="num">${money(sum('tong'))}</td><td></td></tr></tfoot></table></div></div>` : '';
      const x = $('#iv-x', b); if (x) x.onclick = () => K.exportXlsx('Bang ke hoa don', rows.map(r => ({ 'Ngày lập': fmtD(String(r.ngay).slice(0, 10)), 'Mẫu số': r.mau, 'Ký hiệu': r.ky_hieu, 'Số HĐ': r.so, 'Người bán': r.ban_ten, 'MST người bán': r.ban_mst, 'Người mua': r.mua_ten, 'MST người mua': r.mua_mst, 'Loại': typ(r), 'Tiền hàng': r.truoc_thue, 'Thuế suất': r.ts, 'Thuế GTGT': r.thue, 'Tổng thanh toán': r.tong, 'Nguồn đọc': r.nguon, 'File': r.file })));
      const cl = $('#iv-clr', b); if (cl) cl.onclick = () => { ST.inv = []; drawTbl(); };
    };
    drawTbl();
  }

  /* --- sao kê --- */
  function parseBankRows(aoa) {
    const H = aoa.findIndex(r => { const t = K.fold(r.join(' ')); return /ngay/.test(t) && /(no|co|rut|gui|so tien|debit|credit)/.test(t) && /(dien giai|noi dung|mo ta|description|chi tiet)/.test(t); });
    if (H < 0) return null;
    const hd = aoa[H].map(x => K.fold(x)); const idx = re => hd.findIndex(h => re.test(h));
    const iD = idx(/ngay/), iT = idx(/dien giai|noi dung|mo ta|description|chi tiet/), iN = idx(/ghi no|so tien rut|rut ra|debit|^no$|phat sinh no|chi$/), iC = idx(/ghi co|so tien gui|gui vao|credit|^co$|phat sinh co|thu$/), iA = idx(/^so tien$/);
    const out = [];
    for (const r of aoa.slice(H + 1)) {
      let d = r[iD]; if (d === '' || d == null) continue;
      if (typeof d === 'number') d = L.iso(new Date(Math.round((d - 25569) * 864e5))); else { const m = String(d).match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/); if (!m) continue; d = (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); }
      let chi = iN >= 0 ? Math.abs(num(r[iN])) : 0, thu = iC >= 0 ? Math.abs(num(r[iC])) : 0;
      if (iN < 0 && iC < 0 && iA >= 0) { const a = num(r[iA]); if (a < 0) chi = -a; else thu = a; }
      if (!chi && !thu) continue;
      out.push({ ngay: d, nd: String(r[iT] || '').trim(), thu, chi });
    }
    return out;
  }
  function viewBank(b) {
    b.innerHTML = `<div class="card"><label>Tải sao kê (Excel, CSV từ ngân hàng; PDF đọc bằng AI)<input type="file" id="bk-f" accept=".xlsx,.xls,.csv,.pdf"></label>
      <p class="small mut">Web tự tìm các cột Ngày, Diễn giải, Ghi nợ, Ghi có. Khoản nào bằng tổng tiền của hoá đơn đã đọc ở thẻ "Hoá đơn" sẽ được đánh dấu khớp.</p><div id="bk-s"></div></div><div id="bk-r" class="mt"></div>`;
    $('#bk-f', b).onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return; const st = $('#bk-s', b); st.innerHTML = '<div class="info">Đang đọc…</div>';
      try {
        let rows;
        if (/\.pdf$/i.test(f.name)) {
          const s = await ai(); if (!s) throw new Error('Cần AI để đọc sao kê PDF. Hãy tải file Excel từ ngân hàng.');
          const t = await pdfText(f, 15);
          const x = await s.json('Bạn là kế toán. Chuyển sao kê ngân hàng sau thành JSON {"rows":[{"ngay":"YYYY-MM-DD","nd":"diễn giải","thu":số tiền ghi có,"chi":số tiền ghi nợ}]}. Số nguyên đồng. Bỏ dòng số dư, tổng cộng. Không đoán số.\n' + t.slice(0, 30000), { modelTier: 'default' });
          rows = (x.rows || []).map(r => ({ ngay: r.ngay, nd: r.nd || '', thu: num(r.thu), chi: num(r.chi) }));
        } else { const wb = XLSX.read(await f.arrayBuffer()); rows = parseBankRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' })); if (!rows) throw new Error('Không thấy dòng tiêu đề có cột Ngày, Diễn giải, Ghi nợ/Ghi có.'); }
        ST.bank = rows; st.innerHTML = `<div class="info">Đọc được ${rows.length} giao dịch từ ${esc(f.name)}.</div>`; draw();
      } catch (er) { st.innerHTML = `<div class="warn">${esc(er.code ? aiErr(er) : er.message)}</div>`; }
    };
    const draw = () => {
      const rows = ST.bank; if (!rows.length) { $('#bk-r', b).innerHTML = ''; return; }
      const used = new Set(); const match = r => { const amt = r.chi || r.thu; const i = ST.inv.findIndex((x, k) => !used.has(k) && x.tong === amt); if (i >= 0) { used.add(i); return ST.inv[i]; } return null; };
      const m = rows.map(r => ({ ...r, hd: match(r) }));
      const thu = m.reduce((s, r) => s + r.thu, 0), chi = m.reduce((s, r) => s + r.chi, 0);
      $('#bk-r', b).innerHTML = `<div class="card"><div class="ch"><h3>${m.length} giao dịch</h3><button class="btn sm" id="bk-x">⇩ Xuất Excel</button></div>
        <div class="grid g3 mt"><div class="kpi grn"><small>Tổng thu (ghi có)</small><b class="num">${money(thu)}</b></div><div class="kpi red"><small>Tổng chi (ghi nợ)</small><b class="num">${money(chi)}</b></div><div class="kpi"><small>Khớp với hoá đơn</small><b>${m.filter(r => r.hd).length}/${m.length}</b><em>${ST.inv.length ? 'so theo tổng tiền thanh toán' : 'chưa đọc hoá đơn nào'}</em></div></div>
        <div class="tw mt"><table class="tbl"><thead><tr><th>Ngày</th><th>Diễn giải</th><th class="num">Thu</th><th class="num">Chi</th><th>Hoá đơn khớp</th></tr></thead><tbody>${m.map(r => `<tr><td>${fmtD(r.ngay)}</td><td>${esc(r.nd)}</td><td class="num t-grn">${r.thu ? money(r.thu) : ''}</td><td class="num t-red">${r.chi ? money(r.chi) : ''}</td><td>${r.hd ? `<span class="pill p-da_nop">✓ ${esc(r.hd.ky_hieu)} ${esc(r.hd.so)}</span>` : '<span class="mut">—</span>'}</td></tr>`).join('')}</tbody></table></div></div>`;
      $('#bk-x', b).onclick = () => K.exportXlsx('Sao ke thu chi', m.map(r => ({ 'Ngày': fmtD(r.ngay), 'Diễn giải': r.nd, 'Thu': r.thu, 'Chi': r.chi, 'Hoá đơn khớp': r.hd ? r.hd.ky_hieu + ' ' + r.hd.so + ' - ' + (r.chi ? r.hd.ban_ten : r.hd.mua_ten) : '' })));
    };
    draw();
  }

  /* --- hồ sơ thiếu --- */
  const REQ = [
    { k: 'hd_vao', t: 'Hoá đơn đầu vào', re: /dau ?vao|mua ?vao|input|hd ?vao/, need: c => c.loai_hinh !== 'HKD' },
    { k: 'hd_ra', t: 'Hoá đơn đầu ra', re: /dau ?ra|ban ?ra|output|hd ?ra/, need: c => c.loai_hinh !== 'HKD' },
    { k: 'sao_ke', t: 'Sao kê ngân hàng', re: /sao ?ke|ngan ?hang|statement|bank|vcb|vietcombank|techcombank|acb|bidv|mb ?bank|vietin|agribank|sacombank|tpbank|vpbank/, need: () => true },
    { k: 'luong', t: 'Bảng lương, chấm công', re: /luong|cham ?cong|payroll|salary/, need: c => c.co_tncn },
    { k: 'bhxh', t: 'Thông báo, chứng từ nộp BHXH', re: /bhxh|bao ?hiem|c12|d02/, need: c => c.co_bhxh },
    { k: 'kho', t: 'Phiếu nhập xuất kho', re: /kho|nhap ?xuat|pnk|pxk|ton ?kho/, need: c => c.loai_hinh !== 'HKD' },
    { k: 'nop_thue', t: 'Giấy nộp tiền thuế', re: /nop ?thue|giay ?nop|unc|uy ?nhiem chi/, need: () => true },
    { k: 'hop_dong', t: 'Hợp đồng phát sinh trong tháng', re: /hop ?dong|contract|hd ?mua|hd ?ban/, need: () => false }
  ];
  function viewCheck(b) {
    const pm = new Date(); pm.setMonth(pm.getMonth() - 1); const def = L.iso(pm).slice(0, 7);
    const st = K.V.chk = K.V.chk || { c: '', m: def, files: [] };
    b.innerHTML = `<div class="card"><div class="row2"><label>Khách hàng<select id="ck-c">${clientOpts(st.c, 'Chọn khách hàng')}</select></label><label>Tháng<input type="month" id="ck-m" value="${st.m}"></label></div>
      <label>Tải bộ chứng từ của tháng (chọn nhiều file, hoặc cả thư mục)<input type="file" id="ck-f" multiple></label>
      <p class="small mut">Web nhận biết loại giấy tờ theo tên file và nội dung hoá đơn XML. Đặt tên file có chữ như "hoa don dau vao", "sao ke", "bang luong" để nhận chính xác.</p></div><div id="ck-r" class="mt"></div>`;
    $('#ck-c', b).onchange = e => { st.c = e.target.value; draw(); }; $('#ck-m', b).onchange = e => { st.m = e.target.value; draw(); };
    $('#ck-f', b).onchange = async e => {
      const c = K.cMap()[st.c]; const files = Array.from(e.target.files); e.target.value = '';
      for (const f of files) { let k = ''; const n = K.fold(f.name.replace(/[_\-.]+/g, ' '));
        if (/\.xml$/i.test(f.name)) { try { const r = parseInvXml(await f.text(), f.name); k = c && r.ban_mst === c.mst ? 'hd_ra' : 'hd_vao'; } catch (er) {} }
        if (!k) { const q = REQ.find(x => x.re.test(n)); k = q ? q.k : 'khac'; }
        st.files.push({ name: f.name, k }); }
      draw();
    };
    const draw = () => {
      const c = K.cMap()[st.c]; const r = $('#ck-r', b);
      if (!c) { r.innerHTML = '<div class="card empty">Chọn khách hàng để xem danh sách cần có.</div>'; return; }
      const need = REQ.filter(x => x.need(c)); const have = k => st.files.filter(f => f.k === k);
      const miss = need.filter(x => !have(x.k).length); const ml = 'Tháng ' + (+st.m.slice(5)) + '/' + st.m.slice(0, 4);
      r.innerHTML = `<div class="card"><div class="ch"><h3>Hồ sơ ${esc(ml)} · ${esc(c.name)}</h3><span class="pill ${miss.length ? 'p-red' : 'p-da_nop'}">${miss.length ? 'Thiếu ' + miss.length + ' loại' : 'Đủ hồ sơ'}</span></div>
        <div class="list">${need.map(x => { const h = have(x.k); return `<div class="tr ${h.length ? '' : 'over'}"><div class="d">${h.length ? '✓ Có' : '✗ Thiếu'}</div><div class="t"><b>${x.t}</b><span>${h.length ? h.map(f => esc(f.name)).join(', ') : 'Chưa thấy file nào'}</span></div><span></span></div>`; }).join('')}
        ${st.files.filter(f => f.k === 'khac' || f.k === 'hop_dong').length ? `<div class="tr"><div class="d">Khác</div><div class="t"><b>File chưa phân loại</b><span>${st.files.filter(f => f.k === 'khac' || f.k === 'hop_dong').map(f => esc(f.name)).join(', ')}</span></div><span></span></div>` : ''}</div>
        <div class="acts-b">${st.files.length ? '<button class="btn" id="ck-clr">Chọn lại file</button>' : ''}${miss.length ? '<button class="btn pri" id="ck-add">＋ Ghi các mục thiếu vào Chứng từ cần nhận</button>' : ''}</div></div>`;
      const cl = $('#ck-clr', r); if (cl) cl.onclick = () => { st.files = []; draw(); };
      const ad = $('#ck-add', r); if (ad) ad.onclick = async () => {
        const ex = K.S.data.docs.filter(d => d.client_id === c.id && d.ky === ml && d.trang_thai === 'cho').map(d => d.ten);
        const rows = miss.filter(x => !ex.includes(x.t)).map(x => ({ client_id: c.id, ten: x.t, ky: ml, trang_thai: 'cho', ngay_yeu_cau: TODAY(), ngay_nhan: null, lan_nhac: 0, ghi_chu: 'Từ kiểm tra hồ sơ thiếu' }));
        try { const out = await window.KT_DB.insMany('docs', rows); K.S.data.docs.push(...out); toast('Đã ghi ' + out.length + ' mục vào Chứng từ cần nhận'); K.remindClient(c, K.S.data.docs.filter(d => d.client_id === c.id && d.trang_thai === 'cho')); } catch (er) { toast(er.message); }
      };
    };
    draw();
  }

  /* --- hợp đồng --- */
  function viewContract(b) {
    const st = K.V.ctr = K.V.ctr || { res: null, name: '' };
    b.innerHTML = `<div class="card"><label>Tải hợp đồng (PDF, Word .docx, ảnh, hoặc .txt)<input type="file" id="ct-f" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"></label><p class="small mut">AI đọc và tóm tắt các điểm kế toán cần: các bên, giá trị, thuế GTGT, thời hạn, thanh toán, hoá đơn, lưu ý về thuế.</p><div id="ct-s"></div></div><div id="ct-r" class="mt"></div>`;
    ai().then(s => { if (!s) $('#ct-s', b).innerHTML = noAI; });
    $('#ct-f', b).onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return; const s = await ai(); const ss = $('#ct-s', b);
      if (!s) { ss.innerHTML = noAI; return; }
      ss.innerHTML = '<div class="info">AI đang đọc hợp đồng…</div>';
      try {
        const P = 'Bạn là kế toán trưởng Việt Nam. Đọc hợp đồng và trả JSON: {"ten":"tên hợp đồng","so":"số hợp đồng","ngay_ky":"","ben_a":"tên, MST","ben_b":"tên, MST","noi_dung":"hàng hoá/dịch vụ, 1-2 câu","gia_tri":"giá trị trước thuế, bằng số và chữ như trong HĐ","thue_gtgt":"thuế suất và tiền thuế nếu có","tong":"tổng giá trị thanh toán","thoi_han":"thời gian thực hiện, hiệu lực","thanh_toan":"phương thức, tiến độ, hạn thanh toán","hoa_don":"thời điểm xuất hoá đơn nếu nêu","luu_y_thue":["các điểm kế toán, thuế cần lưu ý"],"rui_ro":["điều khoản bất lợi, phạt, thiếu sót"]}. Chỉ dựa vào nội dung hợp đồng; không có thì ghi "Không nêu".\n';
        let x;
        if (/\.(jpe?g|png)$/i.test(f.name)) x = await s.json(P + 'Ảnh hợp đồng đính kèm.', { images: [f], modelTier: 'default' });
        else { const t = await fileText(f); if (t.replace(/\s/g, '').length < 100) { if (/\.pdf$/i.test(f.name)) x = await s.json(P + 'Ảnh các trang hợp đồng đính kèm.', { images: await pdfImages(f, 4), modelTier: 'default' }); else throw new Error('File không có chữ để đọc.'); } else x = await s.json(P + t.slice(0, 60000), { modelTier: 'default' }); }
        st.res = x; st.name = f.name; ss.innerHTML = ''; draw();
      } catch (er) { ss.innerHTML = `<div class="warn">${esc(er.code ? aiErr(er) : er.message)}</div>`; }
    };
    const draw = () => {
      const x = st.res; if (!x) return; const li = a => Array.isArray(a) && a.length ? '<ul>' + a.map(i => `<li>${esc(i)}</li>`).join('') + '</ul>' : '<span class="mut">Không nêu</span>';
      const rows = [['Số, ngày ký', [x.so, x.ngay_ky].filter(Boolean).join(' · ')], ['Bên A', x.ben_a], ['Bên B', x.ben_b], ['Nội dung', x.noi_dung], ['Giá trị trước thuế', x.gia_tri], ['Thuế GTGT', x.thue_gtgt], ['Tổng thanh toán', x.tong], ['Thời hạn', x.thoi_han], ['Thanh toán', x.thanh_toan], ['Xuất hoá đơn', x.hoa_don]];
      $('#ct-r', b).innerHTML = `<div class="card"><div class="ch"><h3>${esc(x.ten || st.name)}</h3><span class="pill p-amb">AI tóm tắt · cần soát lại</span></div><dl class="kv mt">${rows.map(r => `<dt>${r[0]}</dt><dd>${esc(r[1] || 'Không nêu')}</dd>`).join('')}</dl>
        <div class="grid g2 mt"><div><h3>Lưu ý kế toán, thuế</h3>${li(x.luu_y_thue)}</div><div><h3>Điều khoản cần chú ý</h3>${li(x.rui_ro)}</div></div></div>`;
    };
    draw();
  }

  /* =========================================================
     SOẠN MAIL
     ========================================================= */
  const MT = [['nhac_ct', 'Nhắc gửi chứng từ'], ['bao_han', 'Báo hạn nộp, số thuế phải nộp'], ['bao_phi', 'Báo phí dịch vụ, nhắc công nợ'], ['gui_bc', 'Gửi báo cáo, tờ khai đã nộp'], ['chao_dv', 'Chào dịch vụ khách mới'], ['tu_do', 'Nội dung khác']];
  function ctxFor(c) {
    if (!c) return '';
    const docs = K.S.data.docs.filter(d => d.client_id === c.id && d.trang_thai === 'cho').map(d => d.ten + (d.ky ? ' (' + d.ky + ')' : ''));
    const ts = K.S.data.tasks.filter(t => t.client_id === c.id && t.trang_thai !== 'da_nop' && K.days(TODAY(), t.han) <= 40).sort((a, b) => a.han.localeCompare(b.han)).slice(0, 5).map(t => K.tname(t) + ' ' + L.kyLabel(t.ky) + ': hạn ' + fmtD(t.han));
    const debt = K.S.data.fees.filter(f => f.client_id === c.id && f.so_tien > f.da_thu).map(f => 'tháng ' + (+f.ky.slice(5)) + '/' + f.ky.slice(0, 4) + ': ' + money(f.so_tien - f.da_thu) + ' đồng');
    return `Khách hàng: ${c.name.replace(/\s*\(mẫu\)$/, '')}, MST ${c.mst}, người liên hệ ${c.lien_he || 'anh/chị'}, email ${c.email || 'chưa có'}.\nChứng từ đang chờ: ${docs.join('; ') || 'không'}.\nHạn nộp sắp tới: ${ts.join('; ') || 'không'}.\nPhí dịch vụ còn nợ: ${debt.join('; ') || 'không'}.`;
  }
  function tplMail(type, c, req) {
    const name = c ? (c.lien_he || '').replace(/\s*\(.*\)$/, '') || 'Anh/Chị' : 'Anh/Chị'; const cn = c ? c.name.replace(/\s*\(mẫu\)$/, '') : '[Tên công ty]'; const me = K.S.me.full_name;
    const docs = c ? K.S.data.docs.filter(d => d.client_id === c.id && d.trang_thai === 'cho') : [];
    const ts = c ? K.S.data.tasks.filter(t => t.client_id === c.id && t.trang_thai !== 'da_nop' && K.days(TODAY(), t.han) <= 40).sort((a, b) => a.han.localeCompare(b.han)) : [];
    const debt = c ? K.S.data.fees.filter(f => f.client_id === c.id && f.so_tien > f.da_thu) : [];
    const T = {
      nhac_ct: ['[' + cn + '] Đề nghị bổ sung chứng từ kế toán', `Kính gửi ${name},\n\nĐể kịp hoàn thành hồ sơ thuế đúng hạn, bên em kính đề nghị ${cn} gửi giúp các chứng từ sau:\n${docs.length ? docs.map(d => '- ' + d.ten + (d.ky ? ' (' + d.ky + ')' : '')).join('\n') : '- [Liệt kê chứng từ]'}\n${ts[0] ? '\nHạn ' + K.tname(ts[0]).toLowerCase() + ' ' + L.kyLabel(ts[0].ky).toLowerCase() + ' là ngày ' + fmtD(ts[0].han) + ', mong anh/chị gửi trước ít nhất 3 ngày làm việc.\n' : ''}\nCảm ơn anh/chị đã phối hợp.`],
      bao_han: ['[' + cn + '] Thông báo hạn nộp hồ sơ thuế', `Kính gửi ${name},\n\nBên em xin thông báo các hạn nộp sắp tới của ${cn}:\n${ts.length ? ts.slice(0, 5).map(t => '- ' + K.tname(t) + ' ' + L.kyLabel(t.ky) + ': hạn ' + fmtD(t.han)).join('\n') : '- [Loại hồ sơ, kỳ, hạn nộp]'}\n\nSố thuế phải nộp (nếu có): [số tiền] đồng. Thời hạn nộp tiền thuế là ngày cuối cùng của thời hạn nộp hồ sơ khai thuế; nộp chậm bị tính tiền chậm nộp 0,03%/ngày.\n\nAnh/chị cần hỗ trợ gì cứ báo bên em.`],
      bao_phi: ['[' + cn + '] Thông báo phí dịch vụ kế toán', `Kính gửi ${name},\n\nBên em xin gửi thông tin phí dịch vụ kế toán của ${cn}:\n${debt.length ? debt.map(f => '- Tháng ' + (+f.ky.slice(5)) + '/' + f.ky.slice(0, 4) + ': ' + money(f.so_tien - f.da_thu) + ' đồng').join('\n') + '\nTổng cộng: ' + money(debt.reduce((s, f) => s + f.so_tien - f.da_thu, 0)) + ' đồng.' : '- Phí tháng [..]: [số tiền] đồng'}\n\nAnh/chị vui lòng thanh toán vào tài khoản: [Số tài khoản, ngân hàng, chủ tài khoản], nội dung: "${c ? c.mst : '[MST]'} phi dich vu ke toan".\n\nTrân trọng cảm ơn.`],
      gui_bc: ['[' + cn + '] Gửi tờ khai, báo cáo đã nộp', `Kính gửi ${name},\n\nBên em đã nộp thành công các hồ sơ sau của ${cn}:\n- [Tên tờ khai, kỳ, ngày nộp, mã giao dịch]\n\nFile tờ khai và thông báo chấp nhận của cơ quan thuế gửi kèm email này. Số thuế phải nộp: [số tiền] đồng, hạn nộp tiền: [ngày].\n\nAnh/chị kiểm tra giúp, có gì thắc mắc cứ liên hệ bên em.`],
      chao_dv: ['Chào dịch vụ kế toán trọn gói', `Kính gửi ${name},\n\nBên em là đơn vị dịch vụ kế toán, nhận làm: kê khai thuế GTGT, TNCN, tạm nộp TNDN; báo cáo tài chính, quyết toán năm; BHXH; tư vấn hoá đơn và chính sách thuế mới (Luật Quản lý thuế 108/2025/QH15 và các văn bản hướng dẫn có hiệu lực từ 01/07/2026).\n\nPhí trọn gói từ [số tiền] đồng/tháng tuỳ số lượng chứng từ. Anh/chị cho bên em xin lịch hẹn để trao đổi cụ thể.`],
      tu_do: ['[Tiêu đề]', `Kính gửi ${name},\n\n${req || '[Nội dung]'}\n`]
    };
    const [sub, body] = T[type] || T.tu_do; return { sub, body: body + '\n\nTrân trọng,\n' + me };
  }
  R['soan-mail'] = v => {
    const st = K.V.mail = K.V.mail || { c: '', type: 'nhac_ct', req: '', sub: '', body: '' };
    v.innerHTML = `<div class="head"><div><h1>Soạn mail</h1><p class="sub">Nhập yêu cầu, chọn khách hàng để tự điền chứng từ còn thiếu, hạn nộp, công nợ. AI viết thư lịch sự, đúng thuật ngữ.</p></div></div>
      <div class="grid g2"><div class="card"><div class="row2"><label>Gửi cho khách hàng<select id="ml-c">${clientOpts(st.c, 'Không chọn')}</select></label><label>Loại thư<select id="ml-t">${MT.map(([k, t]) => `<option value="${k}" ${st.type === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
        <label>Yêu cầu của bạn (càng cụ thể càng tốt)<textarea id="ml-r" rows="4" placeholder="VD: Nhắc khách gửi hoá đơn đầu vào tháng 11 trước ngày 15/12, giọng nhẹ nhàng, báo luôn phí tháng 11 chưa thanh toán">${esc(st.req)}</textarea></label>
        <div class="acts-b"><button class="btn" id="ml-tp">Dùng mẫu có sẵn</button><button class="btn pri" id="ml-go">✦ AI soạn thư</button></div><div id="ml-s"></div></div>
        <div class="card"><label>Tiêu đề<input id="ml-sub" value="${esc(st.sub)}"></label><label>Nội dung<textarea id="ml-body" rows="14">${esc(st.body)}</textarea></label>
        <p class="small" id="ml-to"></p><div class="acts-b"><button class="btn" id="ml-cp">⧉ Chép nội dung</button><a class="btn pri" id="ml-open" href="#" target="_blank" rel="noopener">Mở trong Gmail ↗</a></div></div></div>`;
    const sync = () => { st.sub = $('#ml-sub', v).value; st.body = $('#ml-body', v).value; const c = K.cMap()[st.c]; const to = c && c.email ? c.email : '';
      $('#ml-to', v).innerHTML = to ? 'Gửi tới: <b class="mono">' + esc(to) + '</b>' : '<span class="mut">Chưa có email khách, nhập địa chỉ trong Gmail.</span>';
      $('#ml-open', v).href = 'https://mail.google.com/mail/?view=cm&fs=1' + (to ? '&to=' + encodeURIComponent(to) : '') + '&su=' + encodeURIComponent(st.sub) + '&body=' + encodeURIComponent(st.body); };
    $('#ml-c', v).onchange = e => { st.c = e.target.value; sync(); }; $('#ml-t', v).onchange = e => { st.type = e.target.value; };
    $('#ml-r', v).oninput = e => { st.req = e.target.value; }; $('#ml-sub', v).oninput = sync; $('#ml-body', v).oninput = sync;
    const put = (s, bd) => { $('#ml-sub', v).value = s; $('#ml-body', v).value = bd; sync(); };
    $('#ml-tp', v).onclick = () => { const t = tplMail(st.type, K.cMap()[st.c], st.req); put(t.sub, t.body); };
    $('#ml-go', v).onclick = async () => {
      const s = await ai(); const ss = $('#ml-s', v);
      if (!s) { const t = tplMail(st.type, K.cMap()[st.c], st.req); put(t.sub, t.body); ss.innerHTML = '<div class="warn">AI chỉ chạy khi mở trang trong Claude. Đã điền mẫu có sẵn, bạn sửa thêm cho phù hợp.</div>'; return; }
      const btn = $('#ml-go', v); btn.disabled = true; ss.innerHTML = '<div class="info">AI đang soạn…</div>';
      try {
        const x = await s.json(`Bạn là nhân viên công ty dịch vụ kế toán ở Việt Nam, viết email tiếng Việt chuyên nghiệp, lịch sự, ngắn gọn, xưng "bên em" và gọi khách là "anh/chị". Không bịa số liệu: chỉ dùng dữ liệu dưới đây, chỗ nào thiếu để trong ngoặc vuông [..]. Trả JSON {"sub":"tiêu đề","body":"nội dung, xuống dòng bằng \\n, có lời chào và ký tên ${K.S.me.full_name}"}.\nLoại thư: ${MT.find(m => m[0] === st.type)[1]}.\nYêu cầu: ${st.req || '(không có thêm)'}\n${ctxFor(K.cMap()[st.c])}\nHôm nay: ${fmtD(TODAY())}.`, { modelTier: 'quick' });
        put(x.sub || '', x.body || ''); ss.innerHTML = '';
      } catch (er) { ss.innerHTML = `<div class="warn">${esc(aiErr(er))}</div>`; } finally { btn.disabled = false; }
    };
    $('#ml-cp', v).onclick = () => copy('Tiêu đề: ' + $('#ml-sub', v).value + '\n\n' + $('#ml-body', v).value, $('#ml-body', v));
    sync();
  };

  /* =========================================================
     TÍNH NHANH
     ========================================================= */
  const P = { lcs: 2530000, vung: { 1: 5310000, 2: 4730000, 3: 4140000, 4: 3700000 }, vung27: { 1: 5700000, 2: 5080000, 3: 4450000, 4: 4040000 }, gt: 15500000, npt: 6200000,
    nld: { bhxh: 0.08, bhyt: 0.015, bhtn: 0.01 }, dn: { bhxh: 0.17, tnld: 0.005, bhyt: 0.03, bhtn: 0.01 } };
  const BRK = [[10e6, 0.05], [30e6, 0.10], [60e6, 0.20], [100e6, 0.30], [Infinity, 0.35]];
  function pit(tn) { let t = 0, prev = 0; const rows = []; for (const [cap, r] of BRK) { if (tn <= prev) break; const part = Math.min(tn, cap) - prev; t += part * r; rows.push([prev, cap, r, part, part * r]); prev = cap; } return { t: Math.round(t), rows }; }
  function calc(gross, base, npt, vung, nam) {
    const vm = (nam === 2027 ? P.vung27 : P.vung)[vung];
    const cap = 20 * P.lcs, capTN = 20 * vm; const b1 = Math.min(base, cap), b2 = Math.min(base, capTN);
    const bh = { bhxh: Math.round(b1 * P.nld.bhxh), bhyt: Math.round(b1 * P.nld.bhyt), bhtn: Math.round(b2 * P.nld.bhtn) }; bh.tong = bh.bhxh + bh.bhyt + bh.bhtn;
    const dn = { bhxh: Math.round(b1 * P.dn.bhxh), tnld: Math.round(b1 * P.dn.tnld), bhyt: Math.round(b1 * P.dn.bhyt), bhtn: Math.round(b2 * P.dn.bhtn) }; dn.tong = dn.bhxh + dn.tnld + dn.bhyt + dn.bhtn;
    const gtru = P.gt + npt * P.npt; const tn = Math.max(0, gross - bh.tong - gtru); const p = pit(tn);
    return { gross, base, b1, b2, cap, capTN, bh, dn, gtru, tn, pit: p, net: gross - bh.tong - p.t, cost: gross + dn.tong };
  }
  function fromNet(net, npt, vung, nam, baseMode, baseFix) {
    let lo = net, hi = net * 2 + 50e6;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; const r = calc(mid, baseMode === 'fix' ? baseFix : mid, npt, vung, nam); if (r.net < net) lo = mid; else hi = mid; }
    return Math.round(hi);
  }
  R['tinh-nhanh'] = v => {
    const st = K.V.calc = K.V.calc || { tab: 'luong', mode: 'g2n', amt: 30000000, npt: 0, vung: 1, nam: 2026, base: 'full', baseFix: 0, tien: 10000000, han: '', nop: TODAY() };
    v.innerHTML = `<div class="head"><div><h1>Tính nhanh</h1><p class="sub">Áp dụng mức hiện hành, ghi rõ căn cứ. Dùng để tham khảo, đối chiếu khi lập bảng lương, tờ khai.</p></div></div>
      ${tabs('cl-t', [['luong', 'Lương gross ↔ net, TNCN, BHXH'], ['cham', 'Tiền chậm nộp thuế']], st.tab)}<div id="cl-b"></div>`;
    $$('#cl-t button', v).forEach(b => b.onclick = () => { st.tab = b.dataset.k; $$('#cl-t button', v).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const draw = () => (st.tab === 'luong' ? calcSalary : calcLate)($('#cl-b', v), st);
    draw();
  };
  const mIn = (id, val) => `<input id="${id}" inputmode="numeric" value="${money(val)}" class="num-in">`;
  const bindMoney = (el, cb) => { el.oninput = () => { const n = el.value.replace(/\D/g, ''); el.value = n ? (+n).toLocaleString('vi-VN') : ''; cb(+n || 0); }; };
  function calcSalary(b, st) {
    b.innerHTML = `<div class="grid g2"><div class="card"><div class="seg2" id="cs-m"><button data-m="g2n" class="${st.mode === 'g2n' ? 'on' : ''}">Gross → Net</button><button data-m="n2g" class="${st.mode === 'n2g' ? 'on' : ''}">Net → Gross</button></div>
      <label id="cs-al">${st.mode === 'g2n' ? 'Lương gross (tổng thu nhập chịu thuế/tháng)' : 'Lương net muốn nhận/tháng'}${mIn('cs-a', st.amt)}</label>
      <div class="row2"><label>Số người phụ thuộc<input id="cs-n" type="number" min="0" max="20" value="${st.npt}"></label><label>Vùng lương tối thiểu<select id="cs-v">${[1, 2, 3, 4].map(i => `<option value="${i}" ${st.vung === i ? 'selected' : ''}>Vùng ${['I', 'II', 'III', 'IV'][i - 1]}</option>`).join('')}</select></label></div>
      <div class="row2"><label>Áp dụng cho<select id="cs-y"><option value="2026" ${st.nam === 2026 ? 'selected' : ''}>Năm 2026</option><option value="2027" ${st.nam === 2027 ? 'selected' : ''}>Từ 01/01/2027</option></select></label>
      <label>Lương đóng bảo hiểm<select id="cs-b"><option value="full" ${st.base === 'full' ? 'selected' : ''}>Bằng lương gross</option><option value="fix" ${st.base === 'fix' ? 'selected' : ''}>Mức khác</option></select></label></div>
      <label id="cs-fl" class="${st.base === 'fix' ? '' : 'hide'}">Lương đóng bảo hiểm (đồng)${mIn('cs-f', st.baseFix)}</label></div><div class="card" id="cs-r"></div></div>
      <div class="card mt small"><h3>Căn cứ và mức đang dùng</h3><ul>
      <li>Biểu thuế lũy tiến 5 bậc (5%, 10%, 20%, 30%, 35%; mốc 10, 30, 60, 100 triệu/tháng) và giảm trừ gia cảnh 15,5 triệu/tháng bản thân, 6,2 triệu/tháng mỗi người phụ thuộc: Luật Thuế TNCN 109/2025/QH15, Nghị quyết 110/2025/UBTVQH15, áp dụng kỳ tính thuế 2026.</li>
      <li>Người lao động đóng: BHXH 8%, BHYT 1,5%, BHTN 1%. Doanh nghiệp đóng: BHXH 17% (3% ốm đau thai sản + 14% hưu trí tử tuất, khoản 1 Điều 34 Luật BHXH 41/2024/QH15), BHTN-BNN 0,5%, BHYT 3%, BHTN 1%.</li>
      <li>Trần đóng BHXH, BHYT: 20 × lương cơ sở 2.530.000 = 50.600.000 đồng (NĐ 161/2026/NĐ-CP, từ 01/07/2026). Trần đóng BHTN: 20 × lương tối thiểu vùng (NĐ 293/2025/NĐ-CP năm 2026; NĐ 399/2026/NĐ-CP từ 01/01/2027).</li>
      <li>Chưa tính các khoản thu nhập miễn thuế (ăn ca, phụ cấp không chịu thuế…), bảo hiểm tai nạn lao động trả riêng, đoàn phí công đoàn 2% (doanh nghiệp).</li></ul></div>`;
    $$('#cs-m button', b).forEach(x => x.onclick = () => { st.mode = x.dataset.m; calcSalary(b, st); });
    bindMoney($('#cs-a', b), n => { st.amt = n; out(); }); bindMoney($('#cs-f', b), n => { st.baseFix = n; out(); });
    $('#cs-n', b).oninput = e => { st.npt = Math.max(0, Math.min(20, +e.target.value || 0)); out(); };
    $('#cs-v', b).onchange = e => { st.vung = +e.target.value; out(); }; $('#cs-y', b).onchange = e => { st.nam = +e.target.value; out(); };
    $('#cs-b', b).onchange = e => { st.base = e.target.value; $('#cs-fl', b).classList.toggle('hide', st.base !== 'fix'); out(); };
    const out = () => {
      const gross = st.mode === 'g2n' ? st.amt : fromNet(st.amt, st.npt, st.vung, st.nam, st.base, st.baseFix);
      const r = calc(gross, st.base === 'fix' ? st.baseFix : gross, st.npt, st.vung, st.nam);
      const line = (a, bv, cls) => `<tr class="${cls || ''}"><td>${a}</td><td class="num">${money(bv)}</td></tr>`;
      $('#cs-r', b).innerHTML = `<div class="big2"><div><small>Lương gross</small><b class="num">${money(r.gross)}</b></div><div class="arrow">→</div><div><small>Thực nhận (net)</small><b class="num t-grn">${money(r.net)}</b></div></div>
        <table class="tbl mt"><tbody>${line('Lương gross', r.gross)}${line('BHXH 8%' + (r.b1 < r.base ? ' (tính trên trần ' + money(r.cap) + ')' : ''), -r.bh.bhxh)}${line('BHYT 1,5%', -r.bh.bhyt)}${line('BHTN 1%' + (r.b2 < r.base ? ' (trần ' + money(r.capTN) + ')' : ''), -r.bh.bhtn)}
        ${line('Giảm trừ gia cảnh (' + (st.npt ? '1 + ' + st.npt + ' người phụ thuộc' : 'bản thân') + ')', r.gtru, 'mut')}${line('Thu nhập tính thuế', r.tn, 'b')}${line('Thuế TNCN', -r.pit.t)}${line('Thực nhận', r.net, 'sum')}</tbody></table>
        ${r.pit.rows.length ? `<details class="mt"><summary>Chi tiết thuế theo bậc</summary><table class="tbl"><thead><tr><th>Bậc</th><th class="num">Phần thu nhập</th><th>Thuế suất</th><th class="num">Thuế</th></tr></thead><tbody>${r.pit.rows.map((x, i) => `<tr><td>${i + 1}: ${x[1] === Infinity ? 'trên ' + money(x[0]) : money(x[0]) + ' – ' + money(x[1])}</td><td class="num">${money(x[3])}</td><td>${x[2] * 100}%</td><td class="num">${money(x[4])}</td></tr>`).join('')}</tbody></table></details>` : ''}
        <h3 class="mt">Doanh nghiệp đóng thêm</h3><table class="tbl"><tbody>${line('BHXH 17%', r.dn.bhxh)}${line('BHTN-BNN 0,5%', r.dn.tnld)}${line('BHYT 3%', r.dn.bhyt)}${line('BHTN 1%', r.dn.bhtn)}${line('Tổng chi phí lương của doanh nghiệp', r.cost, 'sum')}</tbody></table>`;
    };
    out();
  }
  function calcLate(b, st) {
    if (!st.han) { const d = new Date(); d.setDate(d.getDate() - 20); st.han = L.iso(d); }
    b.innerHTML = `<div class="grid g2"><div class="card"><label>Số tiền thuế chậm nộp (đồng)${mIn('lt-a', st.tien)}</label>
      <div class="row2"><label>Hạn nộp thuế<input type="date" id="lt-h" value="${st.han}"></label><label>Ngày nộp thực tế<input type="date" id="lt-n" value="${st.nop}"></label></div>
      <p class="small mut">Mức 0,03%/ngày (điểm a khoản 2 Điều 16 Luật Quản lý thuế 108/2025/QH15). Số ngày tính từ ngày kế tiếp ngày hết hạn nộp đến ngày liền trước ngày nộp tiền vào ngân sách, theo cách tính đang áp dụng (đối chiếu lại điều khoản tính ngày trong Luật 108/2025).</p></div><div class="card" id="lt-r"></div></div>
      <div class="card mt small"><h3>Ngoài tiền chậm nộp</h3><p>Nộp hồ sơ khai thuế quá hạn còn có thể bị phạt vi phạm hành chính theo Nghị định 125/2020/NĐ-CP (sửa đổi bởi NĐ 102/2021/NĐ-CP, NĐ 310/2025/NĐ-CP). Xem mục Luật pháp để đọc điều khoản.</p></div>`;
    const out = () => {
      const d = Math.max(0, K.days(st.han, st.nop) - 1); const t = Math.round(st.tien * 0.0003 * d);
      $('#lt-r', b).innerHTML = `<div class="big2"><div><small>Số ngày chậm nộp</small><b>${d}</b></div><div><small>Tiền chậm nộp</small><b class="num t-red">${money(t)}</b></div></div>
        <table class="tbl mt"><tbody><tr><td>Tiền thuế</td><td class="num">${money(st.tien)}</td></tr><tr><td>Từ ngày</td><td class="num">${d ? fmtD(L.iso(new Date(new Date(st.han + 'T00:00:00').getTime() + 864e5))) : '—'}</td></tr><tr><td>Đến ngày</td><td class="num">${d ? fmtD(L.iso(new Date(new Date(st.nop + 'T00:00:00').getTime() - 864e5))) : '—'}</td></tr><tr><td>${money(st.tien)} × 0,03% × ${d} ngày</td><td class="num">${money(t)}</td></tr><tr class="sum"><td>Tổng phải nộp</td><td class="num">${money(st.tien + t)}</td></tr></tbody></table>`;
    };
    bindMoney($('#lt-a', b), n => { st.tien = n; out(); }); $('#lt-h', b).onchange = e => { st.han = e.target.value || st.han; out(); }; $('#lt-n', b).onchange = e => { st.nop = e.target.value || st.nop; out(); };
    out();
  }

  /* =========================================================
     MẪU BIỂU
     ========================================================= */
  const TPL = [
    { id: 'hddv', t: 'Hợp đồng dịch vụ kế toán', d: 'Hợp đồng trọn gói: phạm vi công việc, phí, trách nhiệm hai bên, bảo mật, bàn giao chứng từ.' },
    { id: 'bbbg', t: 'Biên bản bàn giao chứng từ', d: 'Ghi nhận chứng từ khách giao cho kế toán (hoặc trả lại), có bảng kê và chữ ký hai bên.' },
    { id: 'dncc', t: 'Giấy đề nghị cung cấp chứng từ', d: 'Liệt kê chứng từ còn thiếu theo tháng, hạn gửi.' },
    { id: 'bbdc', t: 'Biên bản đối chiếu công nợ phí dịch vụ', d: 'Đối chiếu số phí phải thu, đã thu, còn nợ đến ngày đối chiếu.' }
  ];
  const OFFICIAL = [
    ['Mẫu tờ khai thuế (GTGT, TNCN, TNDN, quyết toán)', 'Ban hành kèm Thông tư 89/2026/TT-BTC, hiệu lực 01/07/2026', 'https://www.google.com/search?q=' + encodeURIComponent('Thông tư 89/2026/TT-BTC phụ lục mẫu tờ khai')],
    ['Phần mềm hỗ trợ kê khai HTKK', 'Cơ quan thuế phát hành, cập nhật mẫu mới', 'https://www.gdt.gov.vn/wps/portal/home/hotrokekhai'],
    ['Nộp tờ khai: Thuế điện tử (eTax)', 'Cổng của cơ quan thuế', 'https://thuedientu.gdt.gov.vn'],
    ['Mẫu BCTC theo Thông tư 99/2025/TT-BTC', 'Cho năm tài chính từ 01/01/2026', 'https://www.google.com/search?q=' + encodeURIComponent('Thông tư 99/2025/TT-BTC mẫu báo cáo tài chính')],
    ['Mẫu BCTC theo Thông tư 133/2016/TT-BTC', 'Doanh nghiệp nhỏ và vừa', 'https://www.google.com/search?q=' + encodeURIComponent('Thông tư 133/2016/TT-BTC mẫu báo cáo tài chính')],
    ['Hồ sơ BHXH (mẫu TK1-TS, D02-LT…)', 'Cổng BHXH Việt Nam', 'https://baohiemxahoi.gov.vn']
  ];
  function tplBody(id, c, o) {
    const cn = c ? c.name.replace(/\s*\(mẫu\)$/, '') : '……………………………'; const mst = c ? c.mst : '……………'; const dc = c ? c.dia_chi : '……………………………'; const lh = c ? c.lien_he.replace(/\s*\(.*\)$/, '') : '……………';
    const today = new Date(); const ngay = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    const head = `<p class="c"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập – Tự do – Hạnh phúc</b><br>———————</p>`;
    const sign = (a, bb) => `<table class="sg"><tr><td><b>${a}</b><br><i>(Ký, ghi rõ họ tên, đóng dấu)</i></td><td><b>${bb}</b><br><i>(Ký, ghi rõ họ tên, đóng dấu)</i></td></tr></table>`;
    const benA = `<p><b>BÊN A (Bên sử dụng dịch vụ): ${esc(cn)}</b><br>Mã số thuế: ${esc(mst)}<br>Địa chỉ: ${esc(dc)}<br>Người đại diện: ……………………… Chức vụ: ………………</p>`;
    const benB = `<p><b>BÊN B (Bên cung cấp dịch vụ): ${esc(o.cty)}</b><br>Mã số thuế: ${esc(o.mst)}<br>Địa chỉ: ${esc(o.dc)}<br>Người đại diện: ${esc(o.dd)} Chức vụ: Giám đốc</p>`;
    if (id === 'hddv') return `${head}<p class="r"><i>……, ${ngay}</i></p><h1>HỢP ĐỒNG DỊCH VỤ KẾ TOÁN</h1><p class="c">Số: ……/${today.getFullYear()}/HĐDVKT</p>
      <p><i>Căn cứ Bộ luật Dân sự số 91/2015/QH13; Luật Kế toán số 88/2015/QH13 (đã sửa đổi, bổ sung); Luật Quản lý thuế số 108/2025/QH15 và các văn bản hướng dẫn; nhu cầu và khả năng của hai bên.</i></p>${benA}${benB}
      <p><b>Điều 1. Nội dung dịch vụ</b><br>Bên B nhận thực hiện cho Bên A: (1) kiểm tra, phân loại, hạch toán chứng từ; (2) lập và nộp tờ khai thuế GTGT (${c && c.ky_gtgt === 'thang' ? 'theo tháng' : 'theo quý'}), tờ khai thuế TNCN khấu trừ theo quý, tạm nộp thuế TNDN theo quý; (3) lập báo cáo tài chính năm, quyết toán thuế TNDN, quyết toán thuế TNCN; (4) kê khai BHXH, BHYT, BHTN (nếu có); (5) lập, in sổ sách kế toán theo chế độ kế toán áp dụng; (6) tư vấn chính sách thuế, hoá đơn.</p>
      <p><b>Điều 2. Phí dịch vụ và thanh toán</b><br>Phí dịch vụ: ${c ? money(c.phi_thang) : '……………'} đồng/tháng (chưa gồm thuế GTGT, nếu có). Thanh toán hằng tháng, chậm nhất ngày 10 của tháng kế tiếp, bằng chuyển khoản vào tài khoản: ${esc(o.tk)}.</p>
      <p><b>Điều 3. Trách nhiệm của Bên A</b><br>Cung cấp đầy đủ, kịp thời, trung thực hoá đơn, chứng từ, thông tin chậm nhất ngày …… hằng tháng; chịu trách nhiệm về tính hợp pháp của chứng từ; thanh toán phí đúng hạn; thông báo cho Bên B mọi thay đổi về đăng ký kinh doanh, thuế.</p>
      <p><b>Điều 4. Trách nhiệm của Bên B</b><br>Thực hiện công việc đúng quy định pháp luật và đúng thời hạn; bảo mật thông tin của Bên A; chịu trách nhiệm về sai sót do lỗi của Bên B, bao gồm tiền phạt, tiền chậm nộp phát sinh do lỗi của Bên B; nhắc Bên A về thời hạn và chứng từ cần bổ sung.</p>
      <p><b>Điều 5. Bàn giao chứng từ</b><br>Mỗi lần giao nhận chứng từ, hai bên lập biên bản bàn giao. Khi chấm dứt hợp đồng, Bên B bàn giao lại toàn bộ chứng từ, sổ sách, dữ liệu kế toán cho Bên A.</p>
      <p><b>Điều 6. Thời hạn và chấm dứt hợp đồng</b><br>Hợp đồng có hiệu lực từ ngày …/…/…… đến ngày …/…/……, tự động gia hạn nếu không bên nào thông báo chấm dứt bằng văn bản trước 30 ngày.</p>
      <p><b>Điều 7. Điều khoản chung</b><br>Tranh chấp được giải quyết bằng thương lượng; không thương lượng được thì đưa ra Toà án có thẩm quyền. Hợp đồng lập thành 02 bản, mỗi bên giữ 01 bản có giá trị như nhau.</p>${sign('ĐẠI DIỆN BÊN A', 'ĐẠI DIỆN BÊN B')}`;
    if (id === 'bbbg') { const docs = c ? K.S.data.docs.filter(d => d.client_id === c.id && d.trang_thai === 'cho') : [];
      return `${head}<p class="r"><i>……, ${ngay}</i></p><h1>BIÊN BẢN BÀN GIAO CHỨNG TỪ KẾ TOÁN</h1><p>Hôm nay, ${ngay}, chúng tôi gồm:</p>${benA.replace('Bên sử dụng dịch vụ', 'Bên giao')}${benB.replace('Bên cung cấp dịch vụ', 'Bên nhận')}
      <p>Cùng tiến hành bàn giao chứng từ kế toán kỳ: ……………… như sau:</p><table class="bd"><thead><tr><th>STT</th><th>Tên chứng từ</th><th>Kỳ</th><th>Số lượng (tờ/bộ)</th><th>Bản gốc/bản sao</th><th>Ghi chú</th></tr></thead><tbody>
      ${(docs.length ? docs.map(d => [d.ten, d.ky]) : [['Hoá đơn đầu vào', ''], ['Hoá đơn đầu ra', ''], ['Sao kê ngân hàng', ''], ['Bảng lương, chấm công', ''], ['', '']]).map((d, i) => `<tr><td>${i + 1}</td><td>${esc(d[0])}</td><td>${esc(d[1])}</td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
      <p>Bên nhận đã kiểm tra số lượng chứng từ theo bảng trên. Bên giao chịu trách nhiệm về tính hợp pháp, hợp lệ của chứng từ. Biên bản lập thành 02 bản, mỗi bên giữ 01 bản.</p>${sign('BÊN GIAO', 'BÊN NHẬN')}`; }
    if (id === 'dncc') { const docs = c ? K.S.data.docs.filter(d => d.client_id === c.id && d.trang_thai === 'cho') : [];
      return `<p><b>${esc(o.cty)}</b><br>MST: ${esc(o.mst)}</p><p class="r"><i>……, ${ngay}</i></p><h1>GIẤY ĐỀ NGHỊ CUNG CẤP CHỨNG TỪ</h1><p>Kính gửi: <b>${esc(cn)}</b> (MST ${esc(mst)})<br>Người nhận: ${esc(lh)}</p>
      <p>Để kịp lập và nộp hồ sơ thuế đúng hạn, ${esc(o.cty)} đề nghị Quý công ty cung cấp các chứng từ sau trước ngày ……/……/……:</p>
      <table class="bd"><thead><tr><th>STT</th><th>Chứng từ</th><th>Kỳ</th><th>Ghi chú</th></tr></thead><tbody>${(docs.length ? docs : [{ ten: '', ky: '' }, { ten: '', ky: '' }, { ten: '', ky: '' }]).map((d, i) => `<tr><td>${i + 1}</td><td>${esc(d.ten)}</td><td>${esc(d.ky)}</td><td></td></tr>`).join('')}</tbody></table>
      <p>Trường hợp chứng từ đến chậm, hồ sơ có thể bị nộp quá hạn và phát sinh tiền chậm nộp 0,03%/ngày, tiền phạt theo quy định. Trân trọng cảm ơn sự phối hợp của Quý công ty.</p>${sign('', 'NGƯỜI ĐỀ NGHỊ')}`; }
    const fs = c ? K.S.data.fees.filter(f => f.client_id === c.id).sort((a, b) => a.ky.localeCompare(b.ky)) : [];
    return `${head}<p class="r"><i>……, ${ngay}</i></p><h1>BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ</h1><p class="c">Phí dịch vụ kế toán, tính đến ngày ${fmtD(TODAY())}</p>${benA}${benB}
      <table class="bd"><thead><tr><th>Tháng</th><th>Phí phải thu</th><th>Đã thanh toán</th><th>Còn nợ</th></tr></thead><tbody>${(fs.length ? fs : [{ ky: '', so_tien: 0, da_thu: 0 }]).map(f => `<tr><td>${f.ky ? (+f.ky.slice(5)) + '/' + f.ky.slice(0, 4) : ''}</td><td class="n">${money(f.so_tien)}</td><td class="n">${money(f.da_thu)}</td><td class="n">${money(f.so_tien - f.da_thu)}</td></tr>`).join('')}
      <tr><td><b>Cộng</b></td><td class="n"><b>${money(fs.reduce((s, f) => s + +f.so_tien, 0))}</b></td><td class="n"><b>${money(fs.reduce((s, f) => s + +f.da_thu, 0))}</b></td><td class="n"><b>${money(fs.reduce((s, f) => s + f.so_tien - f.da_thu, 0))}</b></td></tr></tbody></table>
      <p>Hai bên thống nhất số liệu trên. Bên A thanh toán số còn nợ trước ngày ……/……/…… vào tài khoản: ${esc(o.tk)}.</p>${sign('ĐẠI DIỆN BÊN A', 'ĐẠI DIỆN BÊN B')}`;
  }
  const DOCCSS = 'body{font-family:"Times New Roman",serif;font-size:13pt;line-height:1.45}h1{font-size:15pt;text-align:center;margin:12pt 0 4pt}.c{text-align:center}.r{text-align:right}table.bd{border-collapse:collapse;width:100%}table.bd td,table.bd th{border:1px solid #000;padding:4pt;font-size:12pt}.n{text-align:right}table.sg{width:100%;margin-top:18pt}table.sg td{width:50%;text-align:center;vertical-align:top;height:90pt}';
  R['mau-bieu'] = v => {
    const st = K.V.tpl = K.V.tpl || { id: 'hddv', c: '', o: null };
    let o = st.o; if (!o) { try { o = JSON.parse(localStorage.getItem('kt.cty') || 'null'); } catch (e) {} }
    st.o = o = o || { cty: 'CÔNG TY TNHH DỊCH VỤ KẾ TOÁN ……', mst: '……………', dc: '……………………', dd: '……………', tk: '……… tại Ngân hàng ………' };
    v.innerHTML = `<div class="head"><div><h1>Mẫu biểu</h1><p class="sub">Chọn mẫu và khách hàng, web điền sẵn thông tin. Sửa trực tiếp trên bản xem, rồi tải file Word hoặc chép.</p></div></div>
      <div class="grid g2 tplg"><div><div class="card"><h3>Mẫu của công ty</h3><div class="tpl-l">${TPL.map(t => `<button data-t="${t.id}" class="${st.id === t.id ? 'on' : ''}"><b>${t.t}</b><span>${t.d}</span></button>`).join('')}</div>
        <label class="mt">Khách hàng<select id="tp-c">${clientOpts(st.c, 'Để trống (điền tay)')}</select></label>
        <details><summary>Thông tin công ty dịch vụ (điền 1 lần)</summary><label>Tên công ty<input id="o-cty" value="${esc(o.cty)}"></label><div class="row2"><label>MST<input id="o-mst" value="${esc(o.mst)}"></label><label>Giám đốc<input id="o-dd" value="${esc(o.dd)}"></label></div><label>Địa chỉ<input id="o-dc" value="${esc(o.dc)}"></label><label>Tài khoản nhận tiền<input id="o-tk" value="${esc(o.tk)}"></label></details></div>
        <div class="card mt"><h3>Mẫu chính thức của cơ quan nhà nước</h3><div class="list">${OFFICIAL.map(x => `<a class="tr off" href="${x[2]}" target="_blank" rel="noopener"><div class="d">↗</div><div class="t"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div><span></span></a>`).join('')}</div><p class="small mut">Tờ khai thuế phải dùng đúng mẫu do Bộ Tài chính ban hành, nên web dẫn tới nguồn chính thức thay vì tự làm lại mẫu.</p></div></div>
        <div class="card"><div class="ch"><h3 id="tp-h"></h3><div class="acts"><button class="btn sm" id="tp-cp">⧉ Chép</button><button class="btn sm pri" id="tp-dl">⇩ Tải file Word</button></div></div><div class="paper" id="tp-p" contenteditable="true" spellcheck="false"></div></div></div>`;
    const draw = () => { const t = TPL.find(x => x.id === st.id); $('#tp-h', v).textContent = t.t; $('#tp-p', v).innerHTML = tplBody(st.id, K.cMap()[st.c], o); $$('.tpl-l button', v).forEach(b => b.classList.toggle('on', b.dataset.t === st.id)); };
    $$('.tpl-l button', v).forEach(b => b.onclick = () => { st.id = b.dataset.t; draw(); });
    $('#tp-c', v).onchange = e => { st.c = e.target.value; draw(); };
    ['cty', 'mst', 'dd', 'dc', 'tk'].forEach(k => $('#o-' + k, v).oninput = e => { o[k] = e.target.value; try { localStorage.setItem('kt.cty', JSON.stringify(o)); } catch (er) {} draw(); });
    $('#tp-cp', v).onclick = () => copy($('#tp-p', v).innerText);
    $('#tp-dl', v).onclick = async () => {
      const t = TPL.find(x => x.id === st.id); const c = K.cMap()[st.c];
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(t.t)}</title><style>@page{size:21cm 29.7cm;margin:2cm 2cm 2cm 3cm}${DOCCSS}</style></head><body>${$('#tp-p', v).innerHTML}</body></html>`;
      const fn = t.t + (c ? ' - ' + c.name.replace(/\s*\(mẫu\)$/, '') : '') + '.doc';
      const d = await K.dl(); if (!d) return toast('Trang này chưa cho tải file. Dùng nút Chép rồi dán vào Word.');
      try { await d.save({ filename: fn, data: new Blob(['\ufeff' + html], { type: 'application/msword' }) }); toast('Đã tải ' + fn); } catch (e) { toast('Chưa lưu được file.'); }
    };
    draw();
  };

  /* =========================================================
     VĂN BẢN MỚI
     ========================================================= */
  const pd = s => { if (!s) return ''; const [d, m, y] = s.split('/'); return y + '-' + m + '-' + d; };
  R['van-ban-moi'] = v => {
    const t0 = TODAY(); const docs = LUAT.DOCS.filter(d => d.tt !== 'het');
    const soon = docs.filter(d => pd(d.hl) > t0).sort((a, b) => pd(a.hl).localeCompare(pd(b.hl)));
    const recent = docs.filter(d => pd(d.hl) <= t0 && pd(d.hl) >= '2025-10-01').sort((a, b) => pd(b.hl).localeCompare(pd(a.hl)) || pd(b.bh).localeCompare(pd(a.bh)));
    let seen = ''; try { seen = localStorage.getItem('kt.vbm.seen') || ''; } catch (e) {}
    const card = d => `<div class="tr vb" data-open="${d.id}"><div class="d">${esc(d.hl || '—')}<small>${pd(d.hl) > t0 ? 'sắp hiệu lực' : 'có hiệu lực'}</small></div><div class="t"><b>${esc(d.loai)} ${esc(d.so)} ${seen && pd(d.bh || d.hl) > seen ? '<span class="pill p-red">Mới</span>' : ''}</b><span>${esc(d.ten)}${d.thay ? ' · ' + esc(d.thay.replace(/^Được thay bằng /, '')) : ''}</span></div><span class="mut">›</span></div>`;
    v.innerHTML = `<div class="head"><div><h1>Văn bản mới</h1><p class="sub">Văn bản thuế, kế toán, lao động mới ban hành hoặc sắp có hiệu lực. Danh sách cập nhật đến ${LUAT.UPD}.</p></div></div>
      <div class="grid g2"><div class="card"><h3>Sắp có hiệu lực</h3><div class="list">${soon.map(card).join('') || '<div class="empty">Chưa có.</div>'}</div>
        <h3 class="mt">Mới có hiệu lực (từ 10/2025)</h3><div class="list">${recent.map(card).join('')}</div></div>
      <div><div class="card"><h3>Mốc thay đổi lớn năm 2026</h3><ul class="tl">
        <li><b>01/01/2026</b>Bỏ lệ phí môn bài; bỏ thuế khoán hộ kinh doanh; TT 99/2025 thay TT 200; TT 152/2025 kế toán hộ kinh doanh; lương tối thiểu vùng mới (NĐ 293/2025); áp dụng biểu thuế TNCN 5 bậc và giảm trừ 15,5/6,2 triệu cho kỳ tính thuế 2026.</li>
        <li><b>21/05/2026</b>NĐ 132/2026 sửa NĐ 41/2018 về xử phạt kế toán, kiểm toán.</li>
        <li><b>01/07/2026</b>Luật Quản lý thuế 108/2025, NĐ 252/2026, TT 89/2026 (TNCN khai theo quý); NĐ 254/2026 + TT 91/2026 về hoá đơn; Luật Thuế TNCN 109/2025 có hiệu lực; TT 58/2026 kế toán doanh nghiệp siêu nhỏ; lương cơ sở 2.530.000 (NĐ 161/2026).</li>
        <li><b>01/01/2027</b>Lương tối thiểu vùng mới theo NĐ 399/2026 (Vùng I 5.700.000 đồng).</li></ul></div>
      <div class="card mt"><h3>Theo dõi văn bản mới từ nguồn chính thức</h3><div class="list">
        <a class="tr off" href="https://vanban.chinhphu.vn" target="_blank" rel="noopener"><div class="d">↗</div><div class="t"><b>Hệ thống văn bản Chính phủ</b><span>vanban.chinhphu.vn</span></div><span></span></a>
        <a class="tr off" href="https://vbpl.vn" target="_blank" rel="noopener"><div class="d">↗</div><div class="t"><b>Cơ sở dữ liệu quốc gia về văn bản pháp luật</b><span>vbpl.vn</span></div><span></span></a>
        <a class="tr off" href="https://www.gdt.gov.vn" target="_blank" rel="noopener"><div class="d">↗</div><div class="t"><b>Cục Thuế: chính sách thuế mới, công văn hướng dẫn</b><span>gdt.gov.vn</span></div><span></span></a>
        <a class="tr off" href="https://mof.gov.vn" target="_blank" rel="noopener"><div class="d">↗</div><div class="t"><b>Bộ Tài chính: thông tư mới</b><span>mof.gov.vn</span></div><span></span></a></div>
        <p class="small mut">Web nội bộ không tự đọc được các trang này. Khi có văn bản mới, danh sách ở đây được cập nhật kèm điều khoản trích dẫn.</p></div></div></div>`;
    $$('[data-open]', v).forEach(r => r.onclick = () => { K.V.law = { g: '', q: '', open: r.dataset.open }; location.hash = 'luat-phap'; });
    try { localStorage.setItem('kt.vbm.seen', t0); } catch (e) {}
  };

  /* =========================================================
     TRA CỨU MST
     ========================================================= */
  R['tra-mst'] = v => {
    const st = K.V.mst = K.V.mst || { q: '' };
    v.innerHTML = `<div class="head"><div><h1>Tra cứu mã số thuế</h1><p class="sub">Gõ MST hoặc tên công ty. Web tìm trong danh sách khách hàng, rồi mở trang tra cứu chính thức với MST đã chép sẵn.</p></div></div>
      <div class="card"><form id="ms-f" class="qa-in"><input id="ms-q" placeholder="MST công ty, MST cá nhân hoặc số CCCD" value="${esc(st.q)}" inputmode="numeric" autocomplete="off"><button class="btn pri" type="submit">Tra cứu</button></form><div id="ms-r" class="mt"></div></div>
      <div class="grid g2 mt"><a class="mst-k" style="--c:#1E88D6;--c2:#58B4F2" href="https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp" target="_blank" rel="noopener"><span>🏢</span><b>Tra MST doanh nghiệp</b><small>Trang của cơ quan thuế ↗</small></a><a class="mst-k" style="--c:#8B5CF6;--c2:#B794F6" href="https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp" target="_blank" rel="noopener"><span>👤</span><b>Tra MST cá nhân</b><small>Gõ MST hoặc số CCCD ↗</small></a></div>
      <p class="small mut mt">Từ 01/7/2025, cá nhân dùng số CCCD 12 số làm mã số thuế.</p>`;
    const draw = () => {
      const q = st.q.trim(); const r = $('#ms-r', v); if (!q) { r.innerHTML = ''; return; }
      const fq = K.fold(q).replace(/\s/g, ''); const mst = q.replace(/\s/g, '');
      const hits = K.S.data.clients.filter(c => c.mst.includes(mst) || K.fold(c.name).replace(/\s/g, '').includes(fq));
      const isM = /^\d{10}(-\d{3})?$/.test(mst); const isC = /^\d{12}$/.test(mst);
      r.innerHTML = `${isM ? `<div class="info">MST <b class="mono">${esc(mst)}</b>${mst.length > 10 ? ' là mã của đơn vị phụ thuộc, chi nhánh (đuôi -' + esc(mst.slice(11)) + ').' : ' gồm 10 số: có thể là công ty hoặc cá nhân (mã cũ).'}</div>` : isC ? `<div class="info">Số <b class="mono">${esc(mst)}</b> là CCCD 12 số, dùng làm MST cá nhân.</div>` : (/^\d+$/.test(mst) && mst.length > 3 ? '<div class="warn">MST công ty: 10 số. Cá nhân: CCCD 12 số.</div>' : '')}
        ${hits.length ? `<h3>Trong danh sách khách hàng (${hits.length})</h3><div class="list">${hits.slice(0, 10).map(c => `<div class="tr" data-cl="${c.id}"><div class="d mono">${esc(c.mst)}</div><div class="t"><b>${esc(c.name)}</b><span>${esc(c.dia_chi)} · ${esc(K.pname(c.staff_id))}</span></div><span class="pill ${c.active !== false ? 'p-da_nop' : 'p-mut'}">${c.active !== false ? 'Đang phục vụ' : 'Ngừng'}</span></div>`).join('')}</div>` : '<p class="mut">Không có trong danh sách khách hàng.</p>'}
        ${isM || isC ? `<h3 class="mt">Tra chính thức</h3><div class="links"><button class="btn" id="ms-cp">📋 Chép số</button>${isC ? '' : '<a class="btn pri" href="https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp" target="_blank" rel="noopener">🏢 Doanh nghiệp ↗</a>'}${mst.length > 10 && !isC ? '' : `<a class="btn ${isC ? 'pri' : ''}" href="https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp" target="_blank" rel="noopener">👤 Cá nhân ↗</a>`}<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent('mã số thuế ' + mst)}" target="_blank" rel="noopener">Tìm trên Google ↗</a></div>` : ''}`;
      $$('[data-cl]', r).forEach(x => x.onclick = () => K.openClient(x.dataset.cl));
      const cp = $('#ms-cp', r); if (cp) cp.onclick = () => copy(mst);
    };
    $('#ms-f', v).onsubmit = e => { e.preventDefault(); st.q = $('#ms-q', v).value; draw(); };
    $('#ms-q', v).oninput = e => { st.q = e.target.value; draw(); };
    draw();
  };

  /* =========================================================
     HỎI ĐÁP THUẾ: thêm AI (chỉ dựa trên văn bản đã nạp)
     ========================================================= */
  const corpus = () => LUAT.DOCS.filter(d => d.diem.length).map(d => `[${d.id}] ${d.loai} ${d.so} – ${d.ten} (hiệu lực ${d.hl || '?'}; ${d.tt === 'het' ? 'HẾT HIỆU LỰC' : 'đang hiệu lực'})\n` + d.diem.map(x => `  • ${x[0]}: ${x[1]}`).join('\n')).join('\n');
  window.KT_AIQA = async q => {
    const s = await ai(); if (!s) return null;
    const x = await s.json(`Bạn là trợ lý thuế cho kế toán Việt Nam. CHỈ được trả lời dựa trên các trích dẫn văn bản dưới đây (cập nhật ${LUAT.UPD}). Không dùng hiểu biết bên ngoài. Nếu trích dẫn không đủ để trả lời chắc chắn, đặt "found": false và nói rõ cần tra văn bản nào. Trả JSON {"found":true/false,"answer":"trả lời ngắn gọn, rõ ràng, tiếng Việt, có ví dụ ngày cụ thể nếu hỏi về hạn","cites":[{"id":"mã trong ngoặc vuông","art":"tên điều/khoản đúng như sau dấu •"}]}.\n\nVĂN BẢN ĐÃ NẠP:\n${corpus()}\n\nCÂU HỎI: ${q}\nHôm nay là ${fmtD(TODAY())}.`, { modelTier: 'default' });
    return x;
  };
})();
