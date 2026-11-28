(function () {
  'use strict';
  const DB = window.KT_DB, L = window.KT_DL, LUAT = window.KT_LUAT;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (Math.round(+n || 0)).toLocaleString('vi-VN');
  const vnd = n => money(n) + ' ₫';
  const fmtD = s => { if (!s) return ''; const [y, m, d] = String(s).slice(0, 10).split('-'); return d + '/' + m + '/' + y; };
  const fmtDs = s => { if (!s) return ''; const [, m, d] = String(s).slice(0, 10).split('-'); return d + '/' + m; };
  const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const wd = s => WD[new Date(s + 'T00:00:00').getDay()];
  const TODAY = () => L.iso(new Date());
  const days = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  const ST = { chua: 'Chưa làm', dang: 'Đang làm', cho_ct: 'Chờ chứng từ', da_nop: 'Đã nộp' };
  const ST_IC = { chua: '⚪', dang: '🔵', cho_ct: '⏳', da_nop: '✅' };
  const ST_SH = { chua: 'Chưa', dang: 'Đang', cho_ct: 'Chờ', da_nop: 'Nộp' };
  const LH = { TNHH: 'Công ty TNHH', CP: 'Công ty cổ phần', DNTN: 'Doanh nghiệp tư nhân', HD: 'Công ty hợp danh', HKD: 'Hộ kinh doanh' };
  const KY = { thang: 'Khai GTGT tháng', quy: 'Khai GTGT quý', khong: 'Không khai GTGT' };
  const NHOM_COLOR = { GTGT: 'p-dang', TNCN: 'p-vio', TNDN: 'p-amb', BHXH: 'p-da_nop', BCTC: 'p-red', 'Khác': 'p-mut' };

  let S = { me: null, data: null, mgr: false };
  const V = {}; // view state

  /* ---------- helpers ---------- */
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2400); }
  function modal(html, onMount) {
    $('#modal-body').innerHTML = html; $('#modal').classList.remove('hide'); document.body.style.overflow = 'hidden';
    if (onMount) onMount($('#modal-body'));
    const f = $('#modal-body input:not([type=hidden]):not([type=checkbox]), #modal-body select, #modal-body textarea'); if (f && matchMedia('(min-width:861px)').matches) setTimeout(() => f.focus(), 50);
  }
  function closeModal() { $('#modal').classList.add('hide'); document.body.style.overflow = ''; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const cMap = () => { const m = {}; S.data.clients.forEach(c => m[c.id] = c); return m; };
  const pMap = () => { const m = {}; S.data.profiles.forEach(p => m[p.id] = p); return m; };
  const staffList = () => S.data.profiles.filter(p => p.role === 'staff' || p.role === 'manager');
  const pname = id => { const p = pMap()[id]; return p ? p.full_name : (id ? 'Chưa rõ' : 'Chưa giao'); };
  const tname = t => t.loai === 'KHAC' ? (t.ten || 'Việc khác') : (L.TYPES[t.loai] ? L.TYPES[t.loai].ten : t.loai);
  const tgroup = t => (L.TYPES[t.loai] || L.TYPES.KHAC).nhom;
  function tState(t) {
    if (t.trang_thai === 'da_nop') return 'done';
    const d = days(TODAY(), t.han);
    if (d < 0) return 'over'; if (d <= 5) return 'soon'; return 'ok';
  }
  function dueTxt(t) {
    if (t.trang_thai === 'da_nop') return 'Đã nộp' + (t.ngay_nop ? ' ' + fmtDs(t.ngay_nop) : '');
    const d = days(TODAY(), t.han);
    if (d < 0) return 'Quá hạn ' + (-d) + ' ngày'; if (d === 0) return 'Hạn hôm nay'; if (d === 1) return 'Hạn ngày mai'; return 'Còn ' + d + ' ngày';
  }
  const visTasks = () => { const cm = cMap(); return S.data.tasks.filter(t => cm[t.client_id] && cm[t.client_id].active !== false); };
  const alerts = () => visTasks().filter(t => { const s = tState(t); return s === 'over' || s === 'soon'; }).sort((a, b) => a.han.localeCompare(b.han));

  /* ---------- downloads (Excel) ---------- */
  const plainDl = { save: async ({ filename, data }) => { const b = data instanceof Blob ? data : new Blob([data]); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); } };
  let dlNs; const dl = () => dlNs !== undefined ? Promise.resolve(dlNs) : (window.claude && window.claude.use ? window.claude.use('downloads').then(x => (dlNs = x || plainDl)).catch(() => (dlNs = plainDl)) : Promise.resolve(dlNs = plainDl));
  async function exportXlsx(name, rows) {
    if (!window.XLSX) return toast('Chưa tải xong công cụ Excel, thử lại sau vài giây.');
    const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu');
    const fn = name + ' ' + TODAY() + '.xlsx';
    const d = await dl();
    if (d) { try { const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }); await d.save({ filename: fn, data: new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }); toast('Đã xuất ' + fn); } catch (e) { toast('Chưa lưu được file: ' + ((e && e.message) || 'bị từ chối')); } }
    else { try { XLSX.writeFile(wb, fn); } catch (e) { toast('Trình duyệt này chưa cho tải file.'); } }
  }

  /* ---------- auto tasks ---------- */
  async function syncTasks() {
    const t0 = TODAY(), d = new Date(); d.setDate(d.getDate() - 75); const from = L.iso(d); d.setDate(d.getDate() + 75 + 150); const to = L.iso(d);
    const have = new Set(S.data.tasks.map(t => t.client_id + '|' + t.loai + '|' + t.ky));
    const need = [];
    S.data.clients.filter(c => c.active !== false).forEach(c => L.expected(c, from, to).forEach(e => { if (!have.has(e.client_id + '|' + e.loai + '|' + e.ky)) need.push({ ...e, trang_thai: 'chua', ghi_chu: '', ten: '' }); }));
    if (need.length) { try { const r = await DB.insMany('tasks', need); S.data.tasks.push(...r); } catch (e) { console.warn(e); } }
    void t0;
  }

  /* ---------- nav ---------- */
  const NAV = [
    ['tong-quan', 'Tổng quan', '🏠'],
    ['sep', 'Việc hằng ngày'], ['cong-viec', 'Công việc', '📋'], ['lich', 'Lịch hạn nộp', '📅'], ['khach-hang', 'Khách hàng', '🏢'], ['chung-tu', 'Chứng từ', '📂'], ['phi-dich-vu', 'Phí dịch vụ', '💰'],
    ['sep', 'Công cụ'], ['doc-chung-tu', 'Đọc chứng từ AI', '✨'], ['soan-mail', 'Soạn mail', '✉️'], ['tinh-nhanh', 'Tính nhanh', '🧮'], ['mau-bieu', 'Mẫu biểu', '📝'], ['chuyen-file', 'Chuyển đổi file', '🔄'],
    ['sep', 'Tra cứu'], ['luat-phap', 'Luật pháp', '⚖️'], ['van-ban-moi', 'Văn bản mới', '🆕'], ['hoi-dap', 'Hỏi đáp thuế', '💬'], ['tra-mst', 'Tra cứu MST', '🔍'],
    ['sep', 'Hệ thống'], ['nhan-su', 'Nhân sự', '👥', 'mgr'], ['tai-khoan', 'Tài khoản', '⚙️']
  ];
  const COL = { 'tong-quan': ['#12A574', '#3CCB95'], 'cong-viec': ['#2F7BEA', '#5AA2FF'], lich: ['#EE7F1B', '#FFB255'], 'khach-hang': ['#5B5BD6', '#8A84F0'], 'chung-tu': ['#D9890B', '#F2B53A'], 'phi-dich-vu': ['#1E9E5A', '#5CCB86'],
    'doc-chung-tu': ['#8B5CF6', '#B794F6'], 'soan-mail': ['#E8577E', '#FF8FAB'], 'tinh-nhanh': ['#0EA5B7', '#3FD0D9'], 'mau-bieu': ['#D9622B', '#F59160'], 'chuyen-file': ['#0F9488', '#38C2B4'],
    'luat-phap': ['#3456A8', '#5B7FD6'], 'van-ban-moi': ['#E0457B', '#F77FA6'], 'hoi-dap': ['#7C4DCC', '#A47DF0'], 'tra-mst': ['#1E88D6', '#58B4F2'], 'nhan-su': ['#0F7A5C', '#2BAE84'], 'tai-khoan': ['#5B6B7A', '#8A9AA8'] };
  const cv = k => { const c = COL[k] || COL['tong-quan']; return `--c:${c[0]};--c2:${c[1]}`; };
  const TABS = [['tong-quan', 'Tổng quan', '🏠'], ['cong-viec', 'Việc', '📋'], ['lich', 'Lịch', '📅'], ['khach-hang', 'Khách', '🏢'], ['them', 'Thêm', '🧩']];
  function renderNav(cur) {
    const n = alerts().filter(t => tState(t) === 'over').length;
    $('#nav').innerHTML = NAV.filter(x => !(x[3] === 'mgr' && !S.mgr)).map(x => x[0] === 'sep' ? `<div class="sep">${x[1]}</div>` :
      `<a href="#${x[0]}" class="${cur === x[0] ? 'on' : ''}" style="${cv(x[0])}"><i>${x[2]}</i>${x[1]}${x[0] === 'cong-viec' && n ? `<span class="cnt">${n}</span>` : ''}</a>`).join('');
    const more = !TABS.some(t => t[0] === cur);
    $('#tabbar').innerHTML = TABS.map(x => `<a href="#${x[0]}" data-tab="${x[0]}" class="${cur === x[0] || (x[0] === 'them' && more) ? 'on' : ''}"><i>${x[2]}</i>${x[1]}${x[0] === 'cong-viec' && n ? `<span class="cnt">${n}</span>` : ''}</a>`).join('');
    $('#me-box').innerHTML = `<b>${esc(S.me.full_name)}</b><small>${S.mgr ? 'Quản lý' : 'Nhân viên · ' + S.data.clients.length + ' khách'}</small>${DB.demo ? '<div class="demo-tag">Bản dùng thử</div>' : ''}`;
    const a = alerts().length; $('#bell-n').textContent = a ? a : '';
    const it = NAV.find(x => x[0] === cur); $('#top-title').textContent = it ? it[1] : 'Sổ Kế Toán';
  }
  $('#tabbar').addEventListener('click', e => { const a = e.target.closest('[data-tab="them"]'); if (a) { e.preventDefault(); moreMenu(); } });
  function moreMenu() {
    modal(`<h2>Mục khác</h2><div class="more">${NAV.filter(x => x[0] !== 'sep' && !TABS.some(t => t[0] === x[0]) && !(x[3] === 'mgr' && !S.mgr)).map(x => `<a href="#${x[0]}" data-close style="${cv(x[0])}"><i>${x[2]}</i><b>${x[1]}</b></a>`).join('')}</div>`);
  }
  $('#bell').addEventListener('click', () => showAlerts());
  function showAlerts() {
    const a = alerts(), cm = cMap();
    modal(`<h2>Nhắc việc (${a.length})</h2><p class="sub">Việc quá hạn và đến hạn trong 5 ngày tới.</p><div class="list">${a.length ? a.map(t => taskRow(t, cm)).join('') : '<div class="empty">Không có việc gấp. 🎉</div>'}</div>`, b => bindTaskRows(b));
  }

  /* ---------- router ---------- */
  const ROUTES = {};
  function go() {
    let h = (location.hash || '').slice(1); if (!ROUTES[h] || (h === 'nhan-su' && !S.mgr)) h = 'tong-quan';
    renderNav(h); closeModal();
    const v = $('#view'); v.innerHTML = ''; v.className = 'v-' + h; ROUTES[h](v); deco(v, h); window.scrollTo(0, 0);
    ls.set('kt.last', h);
  }
  window.addEventListener('hashchange', () => S.me && go());
  const rerender = () => { const h = (location.hash || '').slice(1) || 'tong-quan'; renderNav(h); const v = $('#view'); const y = window.scrollY; v.innerHTML = ''; (ROUTES[h] || ROUTES['tong-quan'])(v); deco(v, ROUTES[h] ? h : 'tong-quan'); window.scrollTo(0, y); };
  function deco(v, h) {
    const hd = v.querySelector(':scope > .head'); const it = NAV.find(x => x[0] === h);
    if (hd && it) { hd.classList.add('ban'); hd.setAttribute('style', cv(h)); hd.insertAdjacentHTML('afterbegin', `<span class="b-ic">${it[2]}</span>`); }
    $$(':scope > .grid, :scope > .card, :scope > .tiles', v).forEach((el, i) => { el.classList.add('in'); el.style.animationDelay = (i * 60) + 'ms'; });
    $$('[data-count]', v).forEach(el => { const n = +el.dataset.count, t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 700); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  }

  /* ---------- task row + modal ---------- */
  function taskRow(t, cm) {
    const c = cm[t.client_id] || {}; const s = tState(t);
    return `<div class="tr ${s}" data-task="${t.id}"><div class="d">${fmtDs(t.han)} <small>${wd(t.han)} · ${dueTxt(t)}</small></div>
      <div class="t"><b>${esc(tname(t))} <span class="kyl">${esc(L.kyLabel(t.ky))}</span></b><span>${esc(c.name || '')}${S.mgr ? ' · ' + esc(pname(c.staff_id)) : ''}</span></div>
      <span class="pill p-${t.trang_thai}">${ST_IC[t.trang_thai]} ${ST[t.trang_thai]}</span></div>`;
  }
  function bindTaskRows(root) { $$('[data-task]', root).forEach(el => el.addEventListener('click', ev => { if (ev.target.closest('[data-mv]')) return; openTask(el.dataset.task); })); }
  function openTask(id) {
    const t = S.data.tasks.find(x => x.id === id); if (!t) return; const c = cMap()[t.client_id] || {}; const ty = L.TYPES[t.loai] || L.TYPES.KHAC;
    const dd = t.loai !== 'KHAC' ? L.due(t.loai, t.ky) : null;
    modal(`<h2>${esc(tname(t))}</h2>
      <dl class="kv"><dt>Khách hàng</dt><dd><button class="lnk" data-cl="${c.id}">${esc(c.name)}</button></dd><dt>Kỳ</dt><dd>${esc(L.kyLabel(t.ky))}</dd>
      <dt>Hạn nộp</dt><dd><b>${fmtD(t.han)}</b> (${wd(t.han)}) · ${dueTxt(t)}${dd && dd.doi ? `<br><small>Hạn gốc ${fmtD(dd.goc)} rơi vào ngày nghỉ nên dời sang ngày làm việc kế tiếp.</small>` : ''}</dd>
      <dt>Phụ trách</dt><dd>${esc(pname(c.staff_id))}</dd>${ty.cc ? `<dt>Căn cứ</dt><dd><small>${esc(ty.cc)}</small></dd>` : ''}</dl>
      <div class="stbtns">${Object.keys(ST).map(k => `<button data-st="${k}" class="${t.trang_thai === k ? 'on' : ''}">${ST_IC[k]} ${ST[k]}</button>`).join('')}</div>
      <label>Ghi chú<textarea id="t-note" placeholder="VD: đã gửi tờ khai, mã giao dịch...">${esc(t.ghi_chu)}</textarea></label>
      ${t.loai === 'KHAC' ? `<div class="row2"><label>Tên việc<input id="t-ten" value="${esc(t.ten)}"></label><label>Hạn<input id="t-han" type="date" value="${t.han}"></label></div>` : ''}
      <div class="acts-b">${t.loai === 'KHAC' ? '<button class="btn red" id="t-del">Xoá việc</button>' : ''}<button class="btn" data-close>Đóng</button><button class="btn pri" id="t-save">Lưu</button></div>`, b => {
      let st = t.trang_thai;
      $$('[data-st]', b).forEach(x => x.onclick = () => { st = x.dataset.st; $$('[data-st]', b).forEach(y => y.classList.toggle('on', y === x)); });
      $('[data-cl]', b).onclick = () => openClient(c.id);
      $('#t-save', b).onclick = async () => {
        const patch = { trang_thai: st, ghi_chu: $('#t-note', b).value.trim() };
        if (st === 'da_nop' && t.trang_thai !== 'da_nop') patch.ngay_nop = TODAY(); if (st !== 'da_nop') patch.ngay_nop = null;
        if (t.loai === 'KHAC') { patch.ten = $('#t-ten', b).value.trim() || 'Việc khác'; patch.han = $('#t-han', b).value || t.han; }
        try { Object.assign(t, await DB.upd('tasks', t.id, patch)); closeModal(); toast('Đã lưu'); rerender(); } catch (e) { toast(e.message); }
      };
      const del = $('#t-del', b); if (del) del.onclick = () => confirmBox('Xoá việc này?', async () => { await DB.del('tasks', t.id); S.data.tasks = S.data.tasks.filter(x => x.id !== t.id); toast('Đã xoá'); rerender(); });
    });
  }
  async function setStatus(id, st) {
    const t = S.data.tasks.find(x => x.id === id); if (!t) return;
    const patch = { trang_thai: st, ngay_nop: st === 'da_nop' ? TODAY() : null };
    try { Object.assign(t, await DB.upd('tasks', id, patch)); toast(ST[st] + ' · ' + tname(t)); rerender(); } catch (e) { toast(e.message); }
  }
  function confirmBox(msg, fn) {
    modal(`<h2>${esc(msg)}</h2><p class="sub">Thao tác này không hoàn tác được.</p><div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri danger" id="cf-ok">Đồng ý</button></div>`,
      b => $('#cf-ok', b).onclick = async () => { try { await fn(); closeModal(); } catch (e) { toast(e.message); } });
  }
  function newTask(cid) {
    const cs = S.data.clients.filter(c => c.active !== false);
    modal(`<h2>Thêm việc</h2>
      <label>Khách hàng<select id="n-c">${cs.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label>Tên việc<input id="n-t" placeholder="VD: Đăng ký thay đổi người đại diện"></label>
      <div class="row2"><label>Hạn<input id="n-h" type="date" value="${TODAY()}"></label><label>Trạng thái<select id="n-s">${Object.keys(ST).map(k => `<option value="${k}">${ST[k]}</option>`).join('')}</select></label></div>
      <label>Ghi chú<textarea id="n-g"></textarea></label>
      <div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="n-ok">Thêm</button></div>`, b => $('#n-ok', b).onclick = async () => {
      const ten = $('#n-t', b).value.trim(); if (!ten) return toast('Nhập tên việc');
      try { const r = await DB.ins('tasks', { client_id: $('#n-c', b).value, loai: 'KHAC', ky: 'k-' + Date.now().toString(36), ten, han: $('#n-h', b).value || TODAY(), trang_thai: $('#n-s', b).value, ghi_chu: $('#n-g', b).value.trim() });
        S.data.tasks.push(r); closeModal(); toast('Đã thêm việc'); rerender(); } catch (e) { toast(e.message); }
    });
  }

  /* ---------- charts ---------- */
  function donut(pct, label, sub) {
    const r = 46, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct));
    return `<div class="donut"><svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label="${label} ${v}%"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--track)" stroke-width="13"/>
      <circle class="arc" cx="60" cy="60" r="${r}" fill="none" stroke="var(--pri2)" stroke-width="13" stroke-linecap="round" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)" style="--len:${c.toFixed(1)}"/>
      <text x="60" y="58" text-anchor="middle" class="dn-v">${v}%</text><text x="60" y="76" text-anchor="middle" class="dn-l">${esc(sub)}</text></svg><div><b>${esc(label)}</b></div></div>`;
  }
  function stackBar(parts, total) {
    return `<div class="sbar">${parts.map(p => p[1] ? `<span class="${p[0]}" style="width:${(p[1] / total * 100).toFixed(2)}%" title="${p[2]}: ${p[1]}"></span>` : '').join('')}</div>`;
  }

  /* ---------- views ---------- */
  ROUTES['tong-quan'] = v => {
    const cm = cMap(), ts = visTasks(), t0 = TODAY();
    const ym = t0.slice(0, 7);
    const monthT = ts.filter(t => t.han.slice(0, 7) === ym);
    const over = ts.filter(t => tState(t) === 'over'), soon = ts.filter(t => tState(t) === 'soon');
    const doneM = monthT.filter(t => t.trang_thai === 'da_nop').length;
    const pct = monthT.length ? Math.round(doneM / monthT.length * 100) : 100;
    const waitDocs = S.data.docs.filter(d => d.trang_thai === 'cho' && cm[d.client_id]);
    const fees = S.data.fees.filter(f => cm[f.client_id]); const debt = fees.reduce((s, f) => s + Math.max(0, f.so_tien - f.da_thu), 0);
    const hour = new Date().getHours(); const shortM = n => n >= 1e9 ? (Math.round(n / 1e8) / 10).toLocaleString('vi-VN') + ' tỷ' : n >= 1e6 ? (Math.round(n / 1e5) / 10).toLocaleString('vi-VN') + ' tr' : money(n); const hi = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const staff = S.data.profiles.filter(p => p.role === 'staff' && p.active !== false);
    const wl = (S.mgr ? staff : [S.me]).map(p => {
      const cs = S.data.clients.filter(c => c.staff_id === p.id && c.active !== false); const ids = new Set(cs.map(c => c.id));
      const mt = monthT.filter(t => ids.has(t.client_id)); const d = mt.filter(t => t.trang_thai === 'da_nop').length;
      const o = ts.filter(t => ids.has(t.client_id) && tState(t) === 'over').length;
      const parts = ['da_nop', 'dang', 'cho_ct', 'chua'].map(k => ['b-' + k, mt.filter(t => t.trang_thai === k).length, ST[k]]);
      return { p, cs: cs.length, mt: mt.length, d, o, parts };
    });
    const mName = 'tháng ' + (+ym.slice(5)) + '/' + ym.slice(0, 4);
    v.innerHTML = `
      <div class="hero2"><div class="h-tx"><span class="hi">${hour < 11 ? '☀️' : hour < 18 ? '🌤️' : '🌙'} Chào ${S.mgr ? 'chị ' : ''}${esc(S.me.full_name.split(' ').slice(S.mgr ? -2 : -1).join(' '))}</span>
        <h1>${over.length ? `Có <em>${over.length} việc</em> trễ hạn` : 'Hôm nay <em>ổn áp</em> nè!'}</h1>
        <div class="chips"><a class="chip" href="#cong-viec" data-f="soon">⏰ <b>${soon.length}</b> việc sắp tới hạn</a><button class="chip" id="q-new" type="button">➕ Thêm việc</button></div></div>
        <div class="buddy" id="buddy"><i data-mascot>${window.KT_MASCOT || ''}</i><span class="bubble">${over.length ? 'Làm thôi!' : 'Giỏi quá!'}</span></div></div>
      <div class="tiles">
        <a class="tile" style="--c:#E5484D;--c2:#FF7E7E" href="#cong-viec" data-f="over"><span class="t-ic">🔥</span><b data-count="${over.length}">${over.length}</b><small>Quá hạn</small></a>
        <a class="tile" style="--c:#EE7F1B;--c2:#FFB255" href="#cong-viec" data-f="soon"><span class="t-ic">⏰</span><b data-count="${soon.length}">${soon.length}</b><small>Sắp tới hạn</small></a>
        <a class="tile" style="--c:#2F7BEA;--c2:#5AA2FF" href="#chung-tu"><span class="t-ic">📂</span><b data-count="${waitDocs.length}">${waitDocs.length}</b><small>Chứng từ chờ</small></a>
        <a class="tile" style="--c:#12A574;--c2:#3CCB95" href="#phi-dich-vu"><span class="t-ic">💰</span><b class="num">${shortM(debt)}</b><small>Công nợ</small></a>
      </div>
      <div class="grid g2 mt">
        <div class="card"><div class="ch"><h3>${S.mgr ? '👥 Nhân viên' : '📊 Việc của tôi'} <small class="mut">${mName}</small></h3><span class="legend"><i class="b-da_nop"></i>Đã nộp<i class="b-dang"></i>Đang làm<i class="b-cho_ct"></i>Chờ CT<i class="b-chua"></i>Chưa làm</span></div>
          ${wl.map(w => `<div class="wl"><div class="wl-p"><span class="av" style="--h:${(w.p.full_name.length * 47) % 360}">${esc(w.p.full_name.split(' ').slice(-1)[0][0])}</span><div><div class="n">${esc(w.p.full_name.split(' ').slice(-2).join(' '))}</div><div class="s">${w.cs} khách · ${w.mt} việc</div></div></div>
            <div>${stackBar(w.parts, w.mt || 1)}</div><div class="r">${w.mt ? Math.round(w.d / w.mt * 100) : 100}%${w.o ? `<span class="pill p-red">${w.o} quá hạn</span>` : ''}</div></div>`).join('') || '<div class="empty">Chưa có nhân viên.</div>'}
        </div>
        <div class="card center">${donut(pct, '🎯 Hoàn thành ' + mName, doneM + '/' + monthT.length + ' việc')}
          <div class="mini">${['GTGT', 'TNCN', 'TNDN', 'BHXH', 'BCTC'].map(g => { const x = monthT.filter(t => tgroup(t) === g); return x.length ? `<div><span class="pill ${NHOM_COLOR[g]}">${g}</span> <b>${x.filter(t => t.trang_thai === 'da_nop').length}/${x.length}</b></div>` : ''; }).join('')}</div></div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><div class="ch"><h3>🔥 Cần làm trước</h3><a href="#cong-viec" class="lnk">Xem hết →</a></div><div class="list">${alerts().slice(0, 8).map(t => taskRow(t, cm)).join('') || '<div class="empty">Không có việc gấp.</div>'}</div></div>
        <div class="card"><div class="ch"><h3>📅 Hạn sắp tới</h3><a href="#lich" class="lnk">Mở lịch →</a></div>${upcomingDates(ts)}</div>
      </div>`;
    bindTaskRows(v);
    $('#q-new', v).onclick = () => newTask(); $('#buddy', v).onclick = e => { const b = e.currentTarget; b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump'); };
    $$('[data-f]', v).forEach(a => a.addEventListener('click', () => { V.task = Object.assign(V.task || {}, { due: a.dataset.f }); }));
  };
  function upcomingDates(ts) {
    const t0 = TODAY(); const g = {};
    ts.filter(t => t.han >= t0 && t.trang_thai !== 'da_nop').forEach(t => { (g[t.han] = g[t.han] || []).push(t); });
    const ks = Object.keys(g).sort().slice(0, 6);
    if (!ks.length) return '<div class="empty">Không còn hạn nộp nào.</div>';
    return `<div class="up">${ks.map(k => { const c = {}; g[k].forEach(t => { const n = tgroup(t); c[n] = (c[n] || 0) + 1; });
      return `<a href="#lich" class="upd" data-day="${k}"><div class="cal-ic"><small>Th${+k.slice(5, 7)}</small><b>${+k.slice(8)}</b></div><div><b>${wd(k)}, ${fmtD(k)}</b><div class="pills">${Object.keys(c).map(n => `<span class="pill ${NHOM_COLOR[n]}">${n} · ${c[n]}</span>`).join(' ')}</div></div><span class="mut">${days(t0, k) === 0 ? 'Hôm nay' : 'còn ' + days(t0, k) + ' ngày'}</span></a>`; }).join('')}</div>`;
  }

  ROUTES['cong-viec'] = v => {
    const f = V.task = Object.assign({ staff: '', client: '', g: '', due: '', q: '', col: 'chua', range: 'open' }, V.task || {});
    const cm = cMap();
    v.innerHTML = `<div class="head"><div><h1>Công việc</h1><p class="sub">Bấm vào thẻ để đổi trạng thái, ghi chú. Hạn nộp tự sinh theo kỳ khai của từng khách hàng.</p></div>
      <div class="acts"><button class="btn" id="tk-x">⇩ Xuất Excel</button><button class="btn pri" id="tk-n">＋ Thêm việc</button></div></div>
      <div class="filters">
        <input type="search" id="f-q" placeholder="Tìm khách hàng, MST, loại việc..." value="${esc(f.q)}">
        ${S.mgr ? `<select id="f-s"><option value="">Tất cả nhân viên</option>${staffList().map(p => `<option value="${p.id}" ${f.staff === p.id ? 'selected' : ''}>${esc(p.full_name)}</option>`).join('')}</select>` : ''}
        <select id="f-g"><option value="">Mọi loại việc</option>${['GTGT', 'TNCN', 'TNDN', 'BHXH', 'BCTC', 'Khác'].map(g => `<option ${f.g === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
        <select id="f-d"><option value="">Mọi hạn</option><option value="over" ${f.due === 'over' ? 'selected' : ''}>Quá hạn</option><option value="soon" ${f.due === 'soon' ? 'selected' : ''}>Đến hạn ≤ 5 ngày</option><option value="month" ${f.due === 'month' ? 'selected' : ''}>Hạn trong tháng này</option><option value="next" ${f.due === 'next' ? 'selected' : ''}>Hạn tháng sau</option></select>
        <select id="f-r"><option value="open" ${f.range === 'open' ? 'selected' : ''}>Ẩn việc đã nộp quá 30 ngày</option><option value="all" ${f.range === 'all' ? 'selected' : ''}>Hiện tất cả</option></select>
      </div><div class="seg" id="seg"></div><div class="board" id="board"></div>`;
    const draw = () => {
      const q = fold(f.q), t0 = TODAY(), ym = t0.slice(0, 7); const nx = new Date(); nx.setMonth(nx.getMonth() + 1, 1); const ym2 = L.iso(nx).slice(0, 7);
      let ts = visTasks().filter(t => {
        const c = cm[t.client_id]; if (f.staff && c.staff_id !== f.staff) return false; if (f.g && tgroup(t) !== f.g) return false;
        const s = tState(t); if (f.due === 'over' && s !== 'over') return false; if (f.due === 'soon' && s !== 'soon') return false;
        if (f.due === 'month' && t.han.slice(0, 7) !== ym) return false; if (f.due === 'next' && t.han.slice(0, 7) !== ym2) return false;
        if (f.range === 'open' && t.trang_thai === 'da_nop' && days(t.han, t0) > 30) return false;
        if (f.range === 'open' && t.trang_thai !== 'da_nop' && days(t0, t.han) > 70 && !f.due) return false;
        if (q && !fold(c.name + ' ' + c.mst + ' ' + tname(t) + ' ' + L.kyLabel(t.ky) + ' ' + t.ghi_chu).includes(q)) return false;
        return true;
      }).sort((a, b) => a.han.localeCompare(b.han));
      V.lastTasks = ts;
      const cols = Object.keys(ST);
      $('#seg', v).innerHTML = cols.map(k => `<button data-col="${k}" class="${f.col === k ? 'on' : ''}">${ST_IC[k]} ${ST[k]} · ${ts.filter(t => t.trang_thai === k).length}</button>`).join('');
      $('#board', v).innerHTML = cols.map(k => { const list = ts.filter(t => t.trang_thai === k); if (k === 'da_nop') list.reverse();
        return `<div class="col ${f.col === k ? 'on' : ''}" data-c="${k}"><h4><span class="h-ic">${ST_IC[k]}</span>${ST[k]}<span class="h-n">${list.length}</span></h4>
        ${list.slice(0, 120).map(t => { const c = cm[t.client_id]; const s = tState(t); return `<div class="tk ${s}" data-task="${t.id}"><b>${esc(tname(t))}</b><div class="ky">${esc(L.kyLabel(t.ky))}</div><div class="c">${esc(c.name.replace(/\s*\(mẫu\)$/, ''))}</div>
          <div class="f"><span class="pill ${s === 'over' ? 'p-red' : s === 'soon' ? 'p-amb' : 'p-mut'}" title="${esc(dueTxt(t))}">📅 ${fmtDs(t.han)}</span>${S.mgr ? `<span class="av sm" title="${esc(pname(c.staff_id))}" style="--h:${(pname(c.staff_id).length * 47) % 360}">${esc((pname(c.staff_id).split(' ').slice(-1)[0] || '?')[0])}</span>` : ''}${t.ghi_chu ? '<span title="Có ghi chú">📝</span>' : ''}</div>
          <div class="mv">${cols.filter(x => x !== k).map(x => `<button data-mv="${x}" data-id="${t.id}" title="Chuyển sang ${ST[x]}">${ST_IC[x]} ${ST_SH[x]}</button>`).join('')}</div></div>`; }).join('') || '<div class="empty">Trống</div>'}
        ${list.length > 120 ? `<div class="empty">Còn ${list.length - 120} việc, hãy lọc thêm.</div>` : ''}</div>`; }).join('');
      bindTaskRows($('#board', v));
      $$('[data-mv]', v).forEach(b => b.onclick = e => { e.stopPropagation(); setStatus(b.dataset.id, b.dataset.mv); });
      $$('[data-col]', v).forEach(b => b.onclick = () => { f.col = b.dataset.col; draw(); });
    };
    draw();
    $('#f-q', v).oninput = e => { f.q = e.target.value; draw(); };
    [['#f-s', 'staff'], ['#f-g', 'g'], ['#f-d', 'due'], ['#f-r', 'range']].forEach(([s, k]) => { const el = $(s, v); if (el) el.onchange = e => { f[k] = e.target.value; draw(); }; });
    $('#tk-n', v).onclick = () => newTask();
    $('#tk-x', v).onclick = () => exportXlsx('Cong viec', (V.lastTasks || []).map(t => { const c = cm[t.client_id]; return { 'Hạn nộp': fmtD(t.han), 'Việc': tname(t), 'Kỳ': L.kyLabel(t.ky), 'Khách hàng': c.name, 'MST': c.mst, 'Phụ trách': pname(c.staff_id), 'Trạng thái': ST[t.trang_thai], 'Ngày nộp': fmtD(t.ngay_nop), 'Ghi chú': t.ghi_chu }; }));
  };

  ROUTES['lich'] = v => {
    const f = V.cal = Object.assign({ m: TODAY().slice(0, 7), sel: '', staff: '' }, V.cal || {});
    const cm = cMap();
    const draw = () => {
      const y = +f.m.slice(0, 4), m = +f.m.slice(5); const first = new Date(y, m - 1, 1); const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
      const ts = visTasks().filter(t => !f.staff || cm[t.client_id].staff_id === f.staff); const by = {}; ts.forEach(t => (by[t.han] = by[t.han] || []).push(t));
      const t0 = TODAY(); let cells = '';
      for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = L.iso(d); const list = by[k] || [];
        const g = {}; list.forEach(t => { const n = tgroup(t); g[n] = g[n] || { n: 0, d: 0 }; g[n].n++; if (t.trang_thai === 'da_nop') g[n].d++; });
        const open = list.filter(t => t.trang_thai !== 'da_nop').length;
        cells += `<div class="c ${d.getMonth() !== m - 1 ? 'o' : ''} ${L.isOff(d) ? 'off' : ''} ${k === t0 ? 'td' : ''} ${f.sel === k ? 'sel' : ''}" data-day="${k}"><div class="n"><span>${d.getDate()}</span><em>${esc(L.HOLI[k] || '')}</em></div>
          ${Object.keys(g).map(n => `<span class="e ${NHOM_COLOR[n]} ${g[n].d === g[n].n ? 'done' : (k < t0 ? 'late' : '')}">${n} ${g[n].d}/${g[n].n}</span>`).join('')}${open ? `<i class="dot ${k < t0 ? 'r' : ''}"></i>` : ''}</div>`; }
      $('#cal', v).innerHTML = WD.slice(1).concat('CN').map(x => `<div class="h">${x}</div>`).join('') + cells;
      $('#cal-t', v).textContent = 'Tháng ' + m + '/' + y;
      const sel = f.sel && by[f.sel] ? by[f.sel].sort((a, b) => (a.trang_thai === 'da_nop') - (b.trang_thai === 'da_nop')) : null;
      $('#cal-d', v).innerHTML = f.sel ? `<h3>${wd(f.sel)}, ${fmtD(f.sel)} ${L.HOLI[f.sel] ? '· ' + esc(L.HOLI[f.sel]) : ''}</h3><div class="list">${sel ? sel.map(t => taskRow(t, cm)).join('') : '<div class="empty">Không có hạn nộp ngày này.</div>'}</div>` : '<div class="empty">Chọn một ngày trên lịch để xem các việc đến hạn.</div>';
      bindTaskRows($('#cal-d', v));
      $$('[data-day]', $('#cal', v)).forEach(c => c.onclick = () => { f.sel = c.dataset.day; draw(); if (matchMedia('(max-width:860px)').matches) $('#cal-d', v).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    };
    v.innerHTML = `<div class="head"><div><h1>Lịch hạn nộp</h1><p class="sub">Hạn đã tự dời khi rơi vào thứ Bảy, Chủ nhật, ngày lễ (lịch nghỉ lễ nạp đến hết ${L.HOLI_TO}).</p></div>
      <div class="acts">${S.mgr ? `<select id="c-s" class="inl"><option value="">Tất cả nhân viên</option>${staffList().map(p => `<option value="${p.id}" ${f.staff === p.id ? 'selected' : ''}>${esc(p.full_name)}</option>`).join('')}</select>` : ''}<button class="btn" id="c-p" aria-label="Tháng trước">‹</button><b id="cal-t" class="calt"></b><button class="btn" id="c-n" aria-label="Tháng sau">›</button><button class="btn" id="c-t">Hôm nay</button></div></div>
      <div class="grid g2 calwrap"><div class="card"><div class="cal" id="cal"></div><p class="legend mt"><span class="pill p-dang">GTGT</span> <span class="pill p-vio">TNCN</span> <span class="pill p-amb">TNDN</span> <span class="pill p-da_nop">BHXH</span> <span class="pill p-red">Quyết toán, BCTC</span> · số = đã nộp/tổng</p></div><div class="card" id="cal-d"></div></div>
      <div class="card mt"><h3>Cách tính hạn trong lịch</h3><div class="rules">${Object.entries(L.TYPES).filter(([k]) => k !== 'KHAC').map(([k, x]) => `<div><b>${esc(x.ten)}</b><span>${{ GTGT_T: 'Ngày 20 tháng sau', GTGT_Q: 'Ngày cuối tháng đầu quý sau', TNCN_Q: 'Ngày cuối tháng đầu quý sau', TNDN_Q: 'Ngày cuối tháng đầu quý sau', BHXH: 'Ngày cuối tháng sau', QT_TNDN: 'Ngày cuối tháng thứ 3 sau năm', QT_TNCN: 'Ngày cuối tháng thứ 3 sau năm' }[k]}</span><small>${esc(x.cc)}</small></div>`).join('')}</div></div>`;
    const mv = k => { const [a, b] = [+f.m.slice(0, 4), +f.m.slice(5)]; const d = new Date(a, b - 1 + k, 1); f.m = L.iso(d).slice(0, 7); f.sel = ''; draw(); };
    $('#c-p', v).onclick = () => mv(-1); $('#c-n', v).onclick = () => mv(1); $('#c-t', v).onclick = () => { f.m = TODAY().slice(0, 7); f.sel = TODAY(); draw(); };
    const cs = $('#c-s', v); if (cs) cs.onchange = e => { f.staff = e.target.value; draw(); };
    draw();
  };

  ROUTES['khach-hang'] = v => {
    const f = V.cl = Object.assign({ q: '', staff: '', lh: '', ky: '' }, V.cl || {});
    v.innerHTML = `<div class="head"><div><h1>Khách hàng</h1><p class="sub">${S.mgr ? 'Toàn bộ khách hàng của công ty.' : 'Các công ty bạn đang phụ trách.'}</p></div>
      <div class="acts"><button class="btn pri" id="c-n">➕ Thêm khách hàng</button>${S.mgr ? '<button class="btn" id="c-i">📥 Nhập Excel</button>' : ''}<button class="btn" id="c-x">📤 Xuất Excel</button></div></div>
      <div class="filters"><input type="search" id="k-q" placeholder="Tìm tên, MST, người liên hệ, SĐT..." value="${esc(f.q)}">
      ${S.mgr ? `<select id="k-s"><option value="">Tất cả nhân viên</option>${staffList().map(p => `<option value="${p.id}" ${f.staff === p.id ? 'selected' : ''}>${esc(p.full_name)}</option>`).join('')}<option value="none" ${f.staff === 'none' ? 'selected' : ''}>Chưa giao</option></select>` : ''}
      <select id="k-l"><option value="">Mọi loại hình</option>${Object.keys(LH).map(k => `<option value="${k}" ${f.lh === k ? 'selected' : ''}>${LH[k]}</option>`).join('')}</select>
      <select id="k-k"><option value="">Mọi kỳ khai</option>${Object.keys(KY).map(k => `<option value="${k}" ${f.ky === k ? 'selected' : ''}>${KY[k]}</option>`).join('')}</select></div>
      <div class="card tw"><table class="tbl cards"><thead><tr><th>Khách hàng</th><th>MST</th><th>Loại hình</th><th>Kỳ khai</th>${S.mgr ? '<th>Phụ trách</th>' : ''}<th>Việc mở</th><th class="num">Phí/tháng</th></tr></thead><tbody id="k-b"></tbody></table></div>`;
    const draw = () => {
      const q = fold(f.q); const ts = visTasks();
      const list = S.data.clients.filter(c => (!f.staff || (f.staff === 'none' ? !c.staff_id : c.staff_id === f.staff)) && (!f.lh || c.loai_hinh === f.lh) && (!f.ky || c.ky_gtgt === f.ky) && (!q || fold([c.name, c.mst, c.lien_he, c.sdt, c.email, c.ghi_chu].join(' ')).includes(q))).sort((a, b) => (a.active === false) - (b.active === false) || a.name.localeCompare(b.name, 'vi'));
      V.lastCl = list;
      $('#k-b', v).innerHTML = list.map(c => { const op = ts.filter(t => t.client_id === c.id && t.trang_thai !== 'da_nop'); const ov = op.filter(t => tState(t) === 'over').length;
        return `<tr class="click ${c.active === false ? 'inact' : ''}" data-cl="${c.id}"><td class="main" data-l="">${esc(c.name)}${c.active === false ? ' <span class="pill p-mut">Ngừng</span>' : ''}<br><small>${esc(c.lien_he)}${c.sdt ? ' · ' + esc(c.sdt) : ''}</small></td>
        <td data-l="MST" class="mono">${esc(c.mst)}</td><td data-l="Loại hình">${esc(LH[c.loai_hinh] || c.loai_hinh)}</td><td data-l="Kỳ khai">${esc(KY[c.ky_gtgt])}</td>${S.mgr ? `<td data-l="Phụ trách">${esc(pname(c.staff_id))}</td>` : ''}
        <td data-l="Việc mở">${op.filter(t => days(TODAY(), t.han) <= 31).length}${ov ? ` <span class="pill p-red">${ov} quá hạn</span>` : ''}</td><td data-l="Phí/tháng" class="num">${money(c.phi_thang)}</td></tr>`; }).join('') || `<tr><td colspan="7" class="empty">Không tìm thấy khách hàng.</td></tr>`;
      $$('[data-cl]', v).forEach(r => r.onclick = () => openClient(r.dataset.cl));
    };
    draw();
    $('#k-q', v).oninput = e => { f.q = e.target.value; draw(); };
    [['#k-s', 'staff'], ['#k-l', 'lh'], ['#k-k', 'ky']].forEach(([s, k]) => { const el = $(s, v); if (el) el.onchange = e => { f[k] = e.target.value; draw(); }; });
    const n = $('#c-n', v); if (n) n.onclick = () => editClient();
    const im = $('#c-i', v); if (im) im.onclick = importClients;
    $('#c-x', v).onclick = () => exportXlsx('Khach hang', (V.lastCl || []).map(c => ({ 'Tên khách hàng': c.name, 'MST': c.mst, 'Loại hình': LH[c.loai_hinh] || c.loai_hinh, 'Kỳ khai GTGT': KY[c.ky_gtgt], 'Có lao động (TNCN)': c.co_tncn ? 'Có' : 'Không', 'Đóng BHXH': c.co_bhxh ? 'Có' : 'Không', 'Phụ trách': pname(c.staff_id), 'Người liên hệ': c.lien_he, 'SĐT': c.sdt, 'Email': c.email, 'Địa chỉ': c.dia_chi, 'Phí/tháng': +c.phi_thang, 'Ghi chú': c.ghi_chu })));
  };
  function openClient(id) {
    const c = cMap()[id]; if (!c) return; const cm = cMap();
    const ts = S.data.tasks.filter(t => t.client_id === id).sort((a, b) => a.han.localeCompare(b.han));
    const open = ts.filter(t => t.trang_thai !== 'da_nop'); const done = ts.filter(t => t.trang_thai === 'da_nop').reverse().slice(0, 8);
    const ds = S.data.docs.filter(d => d.client_id === id); const fs = S.data.fees.filter(f => f.client_id === id).sort((a, b) => b.ky.localeCompare(a.ky));
    const debt = fs.reduce((s, f) => s + Math.max(0, f.so_tien - f.da_thu), 0);
    modal(`<h2>${esc(c.name)}</h2><div class="tabs" id="cl-tabs"><button data-t="i" class="on">Thông tin</button><button data-t="v">Việc (${open.length})</button><button data-t="d">Chứng từ (${ds.filter(d => d.trang_thai === 'cho').length})</button><button data-t="f">Phí${debt ? ' · nợ' : ''}</button></div>
      <div data-p="i"><dl class="kv"><dt>MST</dt><dd class="mono">${esc(c.mst)}</dd><dt>Loại hình</dt><dd>${esc(LH[c.loai_hinh] || c.loai_hinh)}</dd><dt>Kỳ khai</dt><dd>${esc(KY[c.ky_gtgt])}${c.co_tncn ? ' · có lao động (TNCN)' : ''}${c.co_bhxh ? ' · đóng BHXH' : ''}</dd>
      <dt>Phụ trách</dt><dd>${esc(pname(c.staff_id))}</dd><dt>Liên hệ</dt><dd>${esc(c.lien_he)}</dd><dt>Điện thoại</dt><dd>${esc(c.sdt)}</dd><dt>Email</dt><dd>${esc(c.email)}</dd><dt>Địa chỉ</dt><dd>${esc(c.dia_chi)}</dd>
      <dt>Phí/tháng</dt><dd class="num-l">${vnd(c.phi_thang)}</dd><dt>Ghi chú</dt><dd>${esc(c.ghi_chu) || '<span class="mut">—</span>'}</dd></dl>
      <div class="acts-b"><button class="btn" id="cl-r">✉ Nhắc khách</button><button class="btn pri" id="cl-e">Sửa thông tin</button></div></div>
      <div data-p="v" class="hide"><div class="list">${open.map(t => taskRow(t, cm)).join('') || '<div class="empty">Không có việc đang mở.</div>'}</div>${done.length ? `<h3 class="mt">Đã nộp gần đây</h3><div class="list">${done.map(t => taskRow(t, cm)).join('')}</div>` : ''}<div class="acts-b"><button class="btn pri" id="cl-nt">＋ Thêm việc</button></div></div>
      <div data-p="d" class="hide"><div class="list">${ds.map(docRow).join('') || '<div class="empty">Chưa có chứng từ nào cần theo dõi.</div>'}</div><div class="acts-b"><button class="btn pri" id="cl-nd">＋ Thêm chứng từ cần nhận</button></div></div>
      <div data-p="f" class="hide"><table class="tbl"><thead><tr><th>Tháng</th><th class="num">Phí</th><th class="num">Đã thu</th><th class="num">Còn nợ</th></tr></thead><tbody>${fs.map(f => `<tr><td>${+f.ky.slice(5)}/${f.ky.slice(0, 4)}</td><td class="num">${money(f.so_tien)}</td><td class="num">${money(f.da_thu)}</td><td class="num ${f.so_tien - f.da_thu > 0 ? 't-red' : ''}">${money(Math.max(0, f.so_tien - f.da_thu))}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Chưa có.</td></tr>'}</tbody></table><p class="sub mt">Tổng còn nợ: <b>${vnd(debt)}</b></p></div>`, b => {
      $$('#cl-tabs button', b).forEach(x => x.onclick = () => { $$('#cl-tabs button', b).forEach(y => y.classList.toggle('on', y === x)); $$('[data-p]', b).forEach(p => p.classList.toggle('hide', p.dataset.p !== x.dataset.t)); });
      bindTaskRows(b); bindDocRows(b);
      $('#cl-e', b).onclick = () => editClient(c); $('#cl-nt', b).onclick = () => newTask(c.id); $('#cl-nd', b).onclick = () => editDoc(null, c.id);
      $('#cl-r', b).onclick = () => remindClient(c, ds.filter(d => d.trang_thai === 'cho'));
    });
  }
  function editClient(c) {
    const isNew = !c; c = c || { name: '', mst: '', loai_hinh: 'TNHH', ky_gtgt: 'quy', co_tncn: true, co_bhxh: true, co_tndn: true, staff_id: S.mgr ? '' : S.me.id, lien_he: '', sdt: '', email: '', dia_chi: '', ghi_chu: '', phi_thang: 0, active: true };
    modal(`<h2>${isNew ? 'Thêm khách hàng' : 'Sửa khách hàng'}</h2>
      <label>Tên khách hàng<input id="e-name" value="${esc(c.name)}" required></label>
      <div class="row2"><label>Mã số thuế<input id="e-mst" value="${esc(c.mst)}" inputmode="numeric"></label><label>Loại hình<select id="e-lh">${Object.keys(LH).map(k => `<option value="${k}" ${c.loai_hinh === k ? 'selected' : ''}>${LH[k]}</option>`).join('')}</select></label></div>
      <div class="row2"><label>Kỳ khai thuế GTGT<select id="e-ky">${Object.keys(KY).map(k => `<option value="${k}" ${c.ky_gtgt === k ? 'selected' : ''}>${KY[k]}</option>`).join('')}</select></label>
      <label>Người phụ trách<select id="e-st" ${S.mgr ? '' : 'disabled'}><option value="">Chưa giao</option>${staffList().map(p => `<option value="${p.id}" ${c.staff_id === p.id ? 'selected' : ''}>${esc(p.full_name)}</option>`).join('')}</select></label></div>
      <div class="chks"><label class="chk"><input type="checkbox" id="e-tn" ${c.co_tncn ? 'checked' : ''}> Có trả lương (khai TNCN)</label><label class="chk"><input type="checkbox" id="e-bh" ${c.co_bhxh ? 'checked' : ''}> Có đóng BHXH</label><label class="chk"><input type="checkbox" id="e-td" ${c.co_tndn !== false ? 'checked' : ''}> Tạm nộp TNDN quý</label></div>
      <div class="row2"><label>Người liên hệ<input id="e-lhh" value="${esc(c.lien_he)}"></label><label>Điện thoại<input id="e-sdt" value="${esc(c.sdt)}" inputmode="tel"></label></div>
      <div class="row2"><label>Email<input id="e-em" value="${esc(c.email)}" type="email"></label><label>Phí dịch vụ/tháng (đồng)<input id="e-fee" value="${money(c.phi_thang)}" inputmode="numeric" ${S.mgr ? '' : 'disabled'}></label></div>
      <label>Địa chỉ<input id="e-dc" value="${esc(c.dia_chi)}"></label>
      <label>Ghi chú<textarea id="e-gc">${esc(c.ghi_chu)}</textarea></label>
      ${!isNew && S.mgr ? `<label class="chk"><input type="checkbox" id="e-ac" ${c.active !== false ? 'checked' : ''}> Đang sử dụng dịch vụ</label>` : ''}
      <div class="acts-b">${!isNew && S.mgr ? '<button class="btn red" id="e-del">Xoá</button>' : ''}<button class="btn" data-close>Huỷ</button><button class="btn pri" id="e-ok">${isNew ? 'Thêm' : 'Lưu'}</button></div>`, b => {
      const fee = $('#e-fee', b); fee.oninput = () => { const n = fee.value.replace(/\D/g, ''); fee.value = n ? (+n).toLocaleString('vi-VN') : ''; };
      $('#e-ok', b).onclick = async () => {
        const row = { name: $('#e-name', b).value.trim(), mst: $('#e-mst', b).value.trim(), loai_hinh: $('#e-lh', b).value, ky_gtgt: $('#e-ky', b).value, co_tncn: $('#e-tn', b).checked, co_bhxh: $('#e-bh', b).checked, co_tndn: $('#e-td', b).checked,
          lien_he: $('#e-lhh', b).value.trim(), sdt: $('#e-sdt', b).value.trim(), email: $('#e-em', b).value.trim(), dia_chi: $('#e-dc', b).value.trim(), ghi_chu: $('#e-gc', b).value.trim() };
        if (!row.name) return toast('Nhập tên khách hàng');
        if (row.mst && !/^\d{10}(-\d{3})?$/.test(row.mst)) return toast('MST gồm 10 số (chi nhánh: 10 số-3 số)');
        if (!S.mgr && isNew) row.staff_id = S.me.id;
        if (S.mgr) { row.staff_id = $('#e-st', b).value || null; row.phi_thang = +fee.value.replace(/\D/g, '') || 0; const ac = $('#e-ac', b); if (ac) row.active = ac.checked; }
        try { if (isNew) { S.data.clients.push(await DB.ins('clients', row)); } else Object.assign(c, await DB.upd('clients', c.id, row)); await syncTasks(); closeModal(); toast(isNew ? 'Đã thêm khách hàng, lịch hạn nộp đã tự tạo' : 'Đã lưu'); rerender(); } catch (e) { toast(e.message); }
      };
      const del = $('#e-del', b); if (del) del.onclick = () => confirmBox('Xoá ' + c.name + ' cùng toàn bộ việc, chứng từ, phí?', async () => { await DB.del('clients', c.id); ['clients'].forEach(k => S.data[k] = S.data[k].filter(x => x.id !== c.id)); ['tasks', 'docs', 'fees'].forEach(k => S.data[k] = S.data[k].filter(x => x.client_id !== c.id)); toast('Đã xoá'); rerender(); });
    });
  }
  function importClients() {
    modal(`<h2>Nhập khách hàng từ Excel</h2><p class="sub">File .xlsx hoặc .csv, dòng đầu là tiêu đề. Các cột nhận: <b>Tên khách hàng</b>, MST, Loại hình (TNHH/CP/DNTN/HKD), Kỳ khai (tháng/quý), Người liên hệ, SĐT, Email, Địa chỉ, Phí/tháng, Ghi chú.</p>
      <input type="file" id="im-f" accept=".xlsx,.xls,.csv"><div id="im-p" class="mt"></div><div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="im-ok" disabled>Nhập</button></div>`, b => {
      let rows = [];
      $('#im-f', b).onchange = async e => {
        const file = e.target.files[0]; if (!file || !window.XLSX) return;
        const wb = XLSX.read(await file.arrayBuffer()); const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        const pick = (r, ...ks) => { for (const k of Object.keys(r)) { const f = fold(k); if (ks.some(x => f.includes(x))) return String(r[k]).trim(); } return ''; };
        rows = raw.map(r => { const lh = fold(pick(r, 'loai hinh')); const ky = fold(pick(r, 'ky khai', 'ky'));
          return { name: pick(r, 'ten khach', 'ten cong ty', 'ten doanh nghiep', 'ten'), mst: pick(r, 'mst', 'ma so thue').replace(/\s/g, ''), loai_hinh: /hkd|ho kinh/.test(lh) ? 'HKD' : /cp|co phan/.test(lh) ? 'CP' : /dntn|tu nhan/.test(lh) ? 'DNTN' : 'TNHH',
            ky_gtgt: /thang/.test(ky) ? 'thang' : /khong/.test(ky) ? 'khong' : 'quy', co_tncn: true, co_bhxh: true, co_tndn: !/hkd|ho kinh/.test(lh), lien_he: pick(r, 'lien he'), sdt: pick(r, 'sdt', 'dien thoai'), email: pick(r, 'email'), dia_chi: pick(r, 'dia chi'), phi_thang: +pick(r, 'phi').replace(/\D/g, '') || 0, ghi_chu: pick(r, 'ghi chu'), staff_id: null, active: true }; }).filter(r => r.name);
        $('#im-p', b).innerHTML = rows.length ? `<div class="info">Đọc được <b>${rows.length}</b> khách hàng: ${rows.slice(0, 4).map(r => esc(r.name)).join(', ')}${rows.length > 4 ? '…' : ''}. Sau khi nhập, giao người phụ trách trong mục Khách hàng.</div>` : '<div class="warn">Không tìm thấy cột "Tên khách hàng".</div>';
        $('#im-ok', b).disabled = !rows.length;
      };
      $('#im-ok', b).onclick = async () => { try { const r = await DB.insMany('clients', rows); S.data.clients.push(...r); await syncTasks(); closeModal(); toast('Đã nhập ' + r.length + ' khách hàng'); rerender(); } catch (e) { toast(e.message); } };
    });
  }

  /* docs */
  function docRow(d) {
    const c = cMap()[d.client_id] || {}; const w = days(d.ngay_yeu_cau, TODAY());
    return `<div class="tr doc-r ${d.trang_thai === 'cho' && w > 7 ? 'over' : ''}" data-doc="${d.id}"><div class="d">${d.trang_thai === 'cho' ? 'Chờ ' + w + ' ngày' : 'Đã nhận'}<small>${d.trang_thai === 'cho' ? 'từ ' + fmtDs(d.ngay_yeu_cau) : fmtDs(d.ngay_nhan)}</small></div>
      <div class="t"><b>${esc(d.ten)} <span class="kyl">${esc(d.ky)}</span></b><span>${esc(c.name)}${d.lan_nhac ? ' · đã nhắc ' + d.lan_nhac + ' lần' : ''}</span></div>
      ${d.trang_thai === 'cho' ? `<button class="btn sm" data-got="${d.id}">✓ Đã nhận</button>` : '<span class="pill p-da_nop">✓ Đã nhận</span>'}</div>`;
  }
  function bindDocRows(root) {
    $$('[data-doc]', root).forEach(el => el.onclick = e => { if (e.target.closest('[data-got]')) return; editDoc(S.data.docs.find(x => x.id === el.dataset.doc)); });
    $$('[data-got]', root).forEach(b => b.onclick = async e => { e.stopPropagation(); const d = S.data.docs.find(x => x.id === b.dataset.got); try { Object.assign(d, await DB.upd('docs', d.id, { trang_thai: 'da_nhan', ngay_nhan: TODAY() })); toast('Đã nhận: ' + d.ten); closeModal(); rerender(); } catch (er) { toast(er.message); } });
  }
  function editDoc(d, cid) {
    const isNew = !d; const pm = new Date(); pm.setMonth(pm.getMonth() - 1);
    d = d || { client_id: cid || '', ten: '', ky: 'Tháng ' + (pm.getMonth() + 1) + '/' + pm.getFullYear(), trang_thai: 'cho', ngay_yeu_cau: TODAY(), ghi_chu: '', lan_nhac: 0 };
    const cs = S.data.clients.filter(c => c.active !== false);
    modal(`<h2>${isNew ? 'Thêm chứng từ cần nhận' : 'Chứng từ'}</h2>
      <label>Khách hàng<select id="d-c">${cs.map(c => `<option value="${c.id}" ${c.id === d.client_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <div class="row2"><label>Tên chứng từ<input id="d-t" list="d-list" value="${esc(d.ten)}" placeholder="VD: Hoá đơn đầu vào"><datalist id="d-list">${['Hoá đơn đầu vào', 'Hoá đơn đầu ra', 'Sao kê ngân hàng', 'Bảng lương, chấm công', 'Hợp đồng lao động mới', 'Phiếu nhập xuất kho', 'Hợp đồng mua bán', 'Danh sách người phụ thuộc', 'Chứng từ nộp thuế'].map(x => `<option value="${x}">`).join('')}</datalist></label><label>Kỳ<input id="d-k" value="${esc(d.ky)}"></label></div>
      <div class="row2"><label>Ngày yêu cầu<input type="date" id="d-y" value="${d.ngay_yeu_cau}"></label><label>Trạng thái<select id="d-s"><option value="cho" ${d.trang_thai === 'cho' ? 'selected' : ''}>Đang chờ khách gửi</option><option value="da_nhan" ${d.trang_thai === 'da_nhan' ? 'selected' : ''}>Đã nhận</option></select></label></div>
      <label>Ghi chú<textarea id="d-g">${esc(d.ghi_chu)}</textarea></label>
      <div class="acts-b">${!isNew ? '<button class="btn red" id="d-del">Xoá</button><button class="btn" id="d-r">✉ Nhắc khách</button>' : ''}<button class="btn" data-close>Huỷ</button><button class="btn pri" id="d-ok">Lưu</button></div>`, b => {
      $('#d-ok', b).onclick = async () => {
        const row = { client_id: $('#d-c', b).value, ten: $('#d-t', b).value.trim(), ky: $('#d-k', b).value.trim(), ngay_yeu_cau: $('#d-y', b).value || TODAY(), trang_thai: $('#d-s', b).value, ghi_chu: $('#d-g', b).value.trim() };
        if (!row.ten) return toast('Nhập tên chứng từ');
        row.ngay_nhan = row.trang_thai === 'da_nhan' ? (d.ngay_nhan || TODAY()) : null;
        try { if (isNew) S.data.docs.push(await DB.ins('docs', { ...row, lan_nhac: 0 })); else Object.assign(d, await DB.upd('docs', d.id, row)); closeModal(); toast('Đã lưu'); rerender(); } catch (e) { toast(e.message); }
      };
      const del = $('#d-del', b); if (del) del.onclick = () => confirmBox('Xoá chứng từ này?', async () => { await DB.del('docs', d.id); S.data.docs = S.data.docs.filter(x => x.id !== d.id); toast('Đã xoá'); rerender(); });
      const r = $('#d-r', b); if (r) r.onclick = () => remindClient(cMap()[d.client_id], [d]);
    });
  }
  function remindClient(c, docs) {
    const list = docs.length ? docs.map(d => '- ' + d.ten + (d.ky ? ' (' + d.ky + ')' : '')).join('\n') : '- Chứng từ phát sinh trong kỳ';
    const open = S.data.tasks.filter(t => t.client_id === c.id && t.trang_thai !== 'da_nop' && days(TODAY(), t.han) <= 15).sort((a, b) => a.han.localeCompare(b.han))[0];
    const msg = `Chào ${c.lien_he ? c.lien_he.replace(/\s*\(.*\)$/, '') : 'anh/chị'},\nBên kế toán nhờ anh/chị gửi giúp chứng từ còn thiếu của ${c.name.replace(/\s*\(mẫu\)$/, '')}:\n${list}\n${open ? `Hạn ${tname(open).toLowerCase()} ${L.kyLabel(open.ky).toLowerCase()} là ngày ${fmtD(open.han)}, mong anh/chị gửi trước ngày ${fmtD(L.iso(new Date(new Date(open.han).getTime() - 3 * 864e5)))} để bên em kịp làm.` : 'Mong anh/chị gửi sớm để bên em kịp hoàn thành hồ sơ.'}\nCảm ơn anh/chị!\n${S.me.full_name}`;
    modal(`<h2>Nhắc khách gửi chứng từ</h2><p class="sub">Gửi tới ${esc(c.lien_he || c.name)}${c.sdt ? ' · <b class="mono">' + esc(c.sdt) + '</b>' : ''}${c.email ? ' · ' + esc(c.email) : ''}</p>
      <label>Nội dung (sửa được)<textarea id="r-m" rows="9">${esc(msg)}</textarea></label>
      <div class="acts-b"><button class="btn" data-close>Đóng</button><button class="btn pri" id="r-c">⧉ Chép nội dung (dán vào Zalo, email)</button></div>
      <p class="note">Sau khi chép, web ghi nhận thêm 1 lần nhắc cho các chứng từ đang chờ.</p>`, b => {
      $('#r-c', b).onclick = async () => {
        const ta = $('#r-m', b); let ok = false;
        try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) { ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (er) {} }
        for (const d of docs) { try { Object.assign(d, await DB.upd('docs', d.id, { lan_nhac: (d.lan_nhac || 0) + 1, nhac_luc: new Date().toISOString() })); } catch (e) {} }
        toast(ok ? 'Đã chép, dán vào Zalo hoặc email để gửi khách' : 'Đã bôi đen nội dung, bấm Ctrl+C (hoặc giữ để chép)');
      };
    });
  }
  ROUTES['chung-tu'] = v => {
    const f = V.doc = Object.assign({ q: '', st: 'cho' }, V.doc || {});
    v.innerHTML = `<div class="head"><div><h1>Chứng từ</h1><p class="sub">Theo dõi chứng từ cần khách gửi. Đỏ là chờ quá 7 ngày. Bấm "Nhắc khách" để chép sẵn tin nhắn.</p></div>
      <div class="acts"><button class="btn pri" id="dc-n">＋ Thêm chứng từ cần nhận</button></div></div>
      <div class="filters"><input type="search" id="dc-q" placeholder="Tìm khách hàng, chứng từ..." value="${esc(f.q)}"><select id="dc-s"><option value="cho" ${f.st === 'cho' ? 'selected' : ''}>Đang chờ</option><option value="da_nhan" ${f.st === 'da_nhan' ? 'selected' : ''}>Đã nhận</option><option value="" ${!f.st ? 'selected' : ''}>Tất cả</option></select></div>
      <div id="dc-l"></div>`;
    const draw = () => {
      const cm = cMap(), q = fold(f.q);
      const ds = S.data.docs.filter(d => cm[d.client_id] && (!f.st || d.trang_thai === f.st) && (!q || fold(cm[d.client_id].name + ' ' + d.ten + ' ' + d.ky).includes(q))).sort((a, b) => a.ngay_yeu_cau.localeCompare(b.ngay_yeu_cau));
      const by = {}; ds.forEach(d => (by[d.client_id] = by[d.client_id] || []).push(d));
      $('#dc-l', v).innerHTML = Object.keys(by).map(cid => `<div class="card dgrp"><div class="ch"><h3>${esc(cm[cid].name)}</h3><span class="mut">${S.mgr ? esc(pname(cm[cid].staff_id)) : ''}</span>${by[cid].some(d => d.trang_thai === 'cho') ? `<button class="btn sm" data-rm="${cid}">✉ Nhắc khách</button>` : ''}</div><div class="list">${by[cid].map(docRow).join('')}</div></div>`).join('') || '<div class="card empty">Không có chứng từ nào.</div>';
      bindDocRows(v);
      $$('[data-rm]', v).forEach(b => b.onclick = () => remindClient(cm[b.dataset.rm], by[b.dataset.rm].filter(d => d.trang_thai === 'cho')));
    };
    draw();
    $('#dc-q', v).oninput = e => { f.q = e.target.value; draw(); }; $('#dc-s', v).onchange = e => { f.st = e.target.value; draw(); };
    $('#dc-n', v).onclick = () => editDoc();
  };

  /* fees */
  ROUTES['phi-dich-vu'] = v => {
    const cm = cMap(); const kys = [...new Set(S.data.fees.map(f => f.ky))].sort();
    const cur = TODAY().slice(0, 7); if (!kys.includes(cur)) kys.push(cur);
    const f = V.fee = Object.assign({ ky: cur, q: '', only: '' }, V.fee || {});
    const fs = S.data.fees.filter(x => cm[x.client_id]);
    const tot = kys.map(k => { const a = fs.filter(x => x.ky === k); return { k, phi: a.reduce((s, x) => s + +x.so_tien, 0), thu: a.reduce((s, x) => s + +x.da_thu, 0) }; }).slice(-6);
    const mx = Math.max(1, ...tot.map(t => t.phi));
    const debt = fs.reduce((s, x) => s + Math.max(0, x.so_tien - x.da_thu), 0);
    v.innerHTML = `<div class="head"><div><h1>Phí dịch vụ & công nợ</h1><p class="sub">${S.mgr ? 'Ghi nhận phí từng tháng, bấm vào dòng để ghi thu tiền.' : 'Bạn xem được phí của khách mình phụ trách. Chỉ quản lý ghi thu.'}</p></div>
      <div class="acts"><button class="btn" id="fe-x">⇩ Xuất Excel</button>${S.mgr ? '<button class="btn pri" id="fe-g">＋ Tạo phí tháng</button>' : ''}</div></div>
      <div class="grid g3"><div class="card kpi"><small>Tổng còn nợ</small><b class="num t-red">${money(debt)}</b><em>đồng, mọi tháng</em></div>
      <div class="card kpi"><small>Phí tháng ${+f.ky.slice(5)}/${f.ky.slice(0, 4)}</small><b class="num">${money(fs.filter(x => x.ky === f.ky).reduce((s, x) => s + +x.so_tien, 0))}</b><em>đồng</em></div>
      <div class="card kpi grn"><small>Đã thu tháng ${+f.ky.slice(5)}/${f.ky.slice(0, 4)}</small><b class="num">${money(fs.filter(x => x.ky === f.ky).reduce((s, x) => s + +x.da_thu, 0))}</b><em>đồng</em></div></div>
      <div class="card mt"><h3>Phí và tiền đã thu 6 tháng gần nhất</h3><div class="bars">${tot.map(t => `<div class="bcol"><div class="bstack" title="Phí ${money(t.phi)} · Thu ${money(t.thu)}"><span class="b1" style="height:${(t.phi / mx * 100).toFixed(1)}%"></span><span class="b2" style="height:${(t.thu / mx * 100).toFixed(1)}%"></span></div><small>${+t.k.slice(5)}/${t.k.slice(2, 4)}</small><em>${(t.phi / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr</em></div>`).join('')}</div><p class="legend"><i class="lg1"></i>Phí phải thu <i class="lg2"></i>Đã thu (triệu đồng)</p></div>
      <div class="filters mt"><select id="fe-k">${kys.slice().reverse().map(k => `<option value="${k}" ${f.ky === k ? 'selected' : ''}>Tháng ${+k.slice(5)}/${k.slice(0, 4)}</option>`).join('')}<option value="all" ${f.ky === 'all' ? 'selected' : ''}>Công nợ mọi tháng</option></select>
        <select id="fe-o"><option value="">Tất cả</option><option value="no" ${f.only === 'no' ? 'selected' : ''}>Chỉ khách còn nợ</option></select><input type="search" id="fe-q" placeholder="Tìm khách hàng..." value="${esc(f.q)}"></div>
      <div class="card tw"><table class="tbl cards"><thead><tr><th>Khách hàng</th>${f.ky === 'all' ? '<th>Số tháng nợ</th>' : '<th>Ngày thu</th>'}<th class="num">Phải thu</th><th class="num">Đã thu</th><th class="num">Còn nợ</th></tr></thead><tbody id="fe-b"></tbody><tfoot id="fe-f"></tfoot></table></div>`;
    const draw = () => {
      const q = fold(f.q); let rows;
      if (f.ky === 'all') {
        const g = {}; fs.forEach(x => { const r = g[x.client_id] = g[x.client_id] || { c: cm[x.client_id], phi: 0, thu: 0, n: 0 }; r.phi += +x.so_tien; r.thu += +x.da_thu; if (x.so_tien > x.da_thu) r.n++; });
        rows = Object.values(g);
      } else rows = fs.filter(x => x.ky === f.ky).map(x => ({ c: cm[x.client_id], phi: +x.so_tien, thu: +x.da_thu, fee: x }));
      rows = rows.filter(r => (!q || fold(r.c.name).includes(q)) && (f.only !== 'no' || r.phi > r.thu)).sort((a, b) => (b.phi - b.thu) - (a.phi - a.thu) || a.c.name.localeCompare(b.c.name, 'vi'));
      V.lastFee = rows;
      $('#fe-b', v).innerHTML = rows.map(r => `<tr class="${r.fee && S.mgr ? 'click' : ''}" data-fee="${r.fee ? r.fee.id : ''}"><td class="main" data-l="">${esc(r.c.name)}</td><td data-l="${f.ky === 'all' ? 'Số tháng nợ' : 'Ngày thu'}">${f.ky === 'all' ? r.n : (r.fee.ngay_thu ? fmtD(r.fee.ngay_thu) : '<span class="mut">—</span>')}</td>
        <td class="num" data-l="Phải thu">${money(r.phi)}</td><td class="num" data-l="Đã thu">${money(r.thu)}</td><td class="num ${r.phi > r.thu ? 't-red' : 't-grn'}" data-l="Còn nợ">${r.phi > r.thu ? money(r.phi - r.thu) : '✓ Đủ'}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Chưa có phí cho kỳ này. ' + (S.mgr ? 'Bấm "Tạo phí tháng".' : '') + '</td></tr>';
      const sp = rows.reduce((s, r) => s + r.phi, 0), st = rows.reduce((s, r) => s + r.thu, 0);
      $('#fe-f', v).innerHTML = rows.length ? `<tr class="sum"><td class="main" data-l="">Cộng ${rows.length} khách</td><td data-l=""></td><td class="num" data-l="Phải thu">${money(sp)}</td><td class="num" data-l="Đã thu">${money(st)}</td><td class="num" data-l="Còn nợ">${money(Math.max(0, sp - st))}</td></tr>` : '';
      if (S.mgr) $$('[data-fee]', v).forEach(r => { if (r.dataset.fee) r.onclick = () => editFee(S.data.fees.find(x => x.id === r.dataset.fee)); });
    };
    draw();
    $('#fe-k', v).onchange = e => { f.ky = e.target.value; rerender(); }; $('#fe-o', v).onchange = e => { f.only = e.target.value; draw(); }; $('#fe-q', v).oninput = e => { f.q = e.target.value; draw(); };
    const g = $('#fe-g', v); if (g) g.onclick = genFees;
    $('#fe-x', v).onclick = () => exportXlsx('Cong no phi dich vu', (V.lastFee || []).map(r => ({ 'Khách hàng': r.c.name, 'MST': r.c.mst, 'Kỳ': f.ky === 'all' ? 'Tất cả' : f.ky, 'Phải thu': r.phi, 'Đã thu': r.thu, 'Còn nợ': Math.max(0, r.phi - r.thu) })));
  };
  function editFee(x) {
    const c = cMap()[x.client_id];
    modal(`<h2>Thu phí · ${esc(c.name)}</h2><p class="sub">Tháng ${+x.ky.slice(5)}/${x.ky.slice(0, 4)}</p>
      <div class="row2"><label>Phải thu (đồng)<input id="fx-p" inputmode="numeric" value="${money(x.so_tien)}"></label><label>Đã thu (đồng)<input id="fx-t" inputmode="numeric" value="${money(x.da_thu)}"></label></div>
      <div class="row2"><label>Ngày thu<input type="date" id="fx-d" value="${x.ngay_thu || TODAY()}"></label><label>&nbsp;<button class="btn wide" id="fx-all" type="button">Thu đủ ${money(x.so_tien)}</button></label></div>
      <label>Ghi chú<input id="fx-g" value="${esc(x.ghi_chu)}" placeholder="VD: chuyển khoản Vietcombank"></label>
      <div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="fx-ok">Lưu</button></div>`, b => {
      ['#fx-p', '#fx-t'].forEach(s => { const el = $(s, b); el.oninput = () => { const n = el.value.replace(/\D/g, ''); el.value = n ? (+n).toLocaleString('vi-VN') : ''; }; });
      $('#fx-all', b).onclick = () => { $('#fx-t', b).value = $('#fx-p', b).value; };
      $('#fx-ok', b).onclick = async () => { const num = s => +$(s, b).value.replace(/\D/g, '') || 0; const thu = num('#fx-t');
        try { Object.assign(x, await DB.upd('fees', x.id, { so_tien: num('#fx-p'), da_thu: thu, ngay_thu: thu ? ($('#fx-d', b).value || TODAY()) : null, ghi_chu: $('#fx-g', b).value.trim() })); closeModal(); toast('Đã ghi thu'); rerender(); } catch (e) { toast(e.message); } };
    });
  }
  function genFees() {
    const d = new Date(); const opts = [-1, 0, 1].map(k => { const x = new Date(d.getFullYear(), d.getMonth() + k, 1); return L.iso(x).slice(0, 7); });
    modal(`<h2>Tạo phí dịch vụ tháng</h2><p class="sub">Tạo khoản phải thu cho mọi khách đang dùng dịch vụ, theo mức phí/tháng của từng khách. Khách đã có phí tháng đó sẽ bỏ qua.</p>
      <label>Tháng<select id="gf-k">${opts.map(k => `<option value="${k}" ${k === TODAY().slice(0, 7) ? 'selected' : ''}>Tháng ${+k.slice(5)}/${k.slice(0, 4)}</option>`).join('')}</select></label>
      <div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="gf-ok">Tạo</button></div>`, b => $('#gf-ok', b).onclick = async () => {
      const k = $('#gf-k', b).value; const has = new Set(S.data.fees.filter(x => x.ky === k).map(x => x.client_id));
      const rows = S.data.clients.filter(c => c.active !== false && !has.has(c.id) && +c.phi_thang > 0).map(c => ({ client_id: c.id, ky: k, so_tien: +c.phi_thang, da_thu: 0, ngay_thu: null, ghi_chu: '' }));
      try { const r = await DB.insMany('fees', rows); S.data.fees.push(...r); V.fee = Object.assign(V.fee || {}, { ky: k }); closeModal(); toast('Đã tạo ' + r.length + ' khoản phí'); rerender(); } catch (e) { toast(e.message); }
    });
  }

  /* ---------- law ---------- */
  ROUTES['luat-phap'] = v => {
    const f = V.law = Object.assign({ g: '', q: '', open: '' }, V.law || {});
    v.innerHTML = `<div class="head"><div><h1>Luật pháp</h1><p class="sub">Văn bản kế toán, thuế, BHXH đang có hiệu lực, kèm các điều hay dùng. Cập nhật ${LUAT.UPD}.</p></div></div>
      <div class="info">📌 Từ <b>01/07/2026</b>: TNCN khai theo quý, hoá đơn theo NĐ 254/2026.</div>
      <div class="filters"><input type="search" id="lw-q" placeholder="Tìm số hiệu, tên văn bản, nội dung điều (VD: 252, hoá đơn, quyết toán)..." value="${esc(f.q)}"></div>
      <div class="lawgrp" id="lw-g"></div><div id="lw-l"></div>
      <p class="note">Nội dung trích dẫn đối chiếu từ văn bản gốc và bản tóm tắt của cơ quan nhà nước, hãng kiểm toán (ghi ở dòng "Đối chiếu" của từng văn bản). Trước khi nộp hồ sơ quan trọng, hãy mở toàn văn để kiểm tra lại.</p>`;
    const draw = () => {
      const q = fold(f.q);
      $('#lw-g', v).innerHTML = [['', 'Tất cả', '']].concat(LUAT.NHOM).map(n => `<button data-g="${n[0]}" class="${f.g === n[0] ? 'on' : ''}">${n[1]} <small>${n[0] ? LUAT.DOCS.filter(d => d.nhom === n[0]).length : LUAT.DOCS.length}</small></button>`).join('');
      const list = LUAT.DOCS.filter(d => (!f.g ? d.nhom !== 'het' || q : d.nhom === f.g) && (!q || fold([d.so, d.loai, d.ten, d.thay, d.diem.map(x => x.join(' ')).join(' ')].join(' ')).includes(q)));
      $('#lw-l', v).innerHTML = list.map(d => { const op = f.open === d.id || (q && list.length <= 3); const ng = LUAT.NHOM.find(n => n[0] === d.nhom);
        return `<div class="card doc ${d.tt === 'het' ? 'old' : ''}" data-doc-id="${d.id}"><div class="dh"><span class="ic" aria-hidden="true">${ng ? ng[2] : ''}</span><div style="flex:1;min-width:0"><span class="so">${esc(d.loai)} ${esc(d.so)}</span><b>${esc(d.ten)}</b>
          <div class="meta"><span>${esc(d.cq)}${d.bh ? ' · ban hành ' + esc(d.bh) : ''}</span>${d.hl ? `<span>Hiệu lực ${esc(d.hl)}</span>` : ''}<span class="pill ${d.tt === 'het' ? 'p-mut' : d.tt === 'sap' ? 'p-amb' : 'p-da_nop'}">${d.tt === 'het' ? 'Hết hiệu lực' : d.tt === 'sap' ? 'Sắp hiệu lực' : 'Đang hiệu lực'}</span></div></div><span class="chev">${op ? '▴' : '▾'}</span></div>
          ${op ? `<div class="body">${d.thay ? `<p class="small"><b>${d.tt === 'het' ? 'Tình trạng' : 'Thay thế'}:</b> ${esc(d.thay)}</p>` : ''}${d.diem.map(x => `<div class="art"><b>${esc(x[0])}</b>${hl(esc(x[1]), f.q)}</div>`).join('') || '<p class="small mut">Chưa trích điều khoản. Mở toàn văn để đọc.</p>'}
            ${d.dc ? `<p class="small mut">Đối chiếu: ${esc(d.dc)}</p>` : ''}<div class="links"><a class="btn sm pri" href="${esc(d.link)}" target="_blank" rel="noopener">Đọc toàn văn ↗</a><a class="btn sm" href="${esc(d.offi)}" target="_blank" rel="noopener">Tìm bản chính thức (vbpl, chinhphu) ↗</a><button class="btn sm" data-ask="${esc(d.so)}">Hỏi về văn bản này</button></div></div>` : ''}</div>`; }).join('') || '<div class="card empty">Không tìm thấy văn bản.</div>';
      $$('[data-g]', v).forEach(b => b.onclick = () => { f.g = b.dataset.g; draw(); });
      $$('.doc .dh', v).forEach(h => h.onclick = () => { const id = h.parentElement.dataset.docId; f.open = f.open === id ? '' : id; draw(); });
      $$('[data-ask]', v).forEach(b => b.onclick = () => { V.qa = { pre: b.dataset.ask }; location.hash = 'hoi-dap'; });
    };
    draw();
    $('#lw-q', v).oninput = e => { f.q = e.target.value; draw(); };
  };
  function hl(html, q) { if (!q || q.length < 2) return html; try { const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'); return html.replace(re, '<mark>$1</mark>'); } catch (e) { return html; } }

  /* ---------- Q&A ---------- */
  function answer(q) {
    const fq = fold(q); const words = fq.split(/[^a-z0-9,./]+/).filter(w => w.length > 1);
    const sc = LUAT.QA.map(x => { let s = 0; x.k.forEach(k => { const fk = fold(k); if (fq.includes(fk)) s += fk.split(' ').length * 2; }); words.forEach(w => { if (fold(x.q).includes(w)) s += 0.5; }); return { x, s }; }).sort((a, b) => b.s - a.s);
    const best = sc[0] && sc[0].s >= 2 ? sc[0] : null;
    const docHits = LUAT.DOCS.map(d => { const t = fold([d.so, d.ten, d.diem.map(x => x.join(' ')).join(' ')].join(' ')); let s = 0; words.forEach(w => { if (w.length > 2 && t.includes(w)) s++; }); if (fq.includes(fold(d.so))) s += 5; return { d, s }; }).filter(x => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, 3);
    return { best, also: sc.filter(s => s.s >= 2 && s !== best).slice(0, 2).map(s => s.x), docHits };
  }
  const docById = id => LUAT.DOCS.find(d => d.id === id);
  ROUTES['hoi-dap'] = v => {
    const st = V.qa = Object.assign({ log: [] }, V.qa || {});
    v.innerHTML = `<div class="head"><div><h1>Hỏi đáp thuế</h1><p class="sub">Chỉ trả lời từ các văn bản đã nạp trong mục Luật pháp, luôn kèm điều khoản căn cứ. Câu nào chưa có trong văn bản đã nạp sẽ báo rõ, không đoán.</p></div>${st.log.length ? '<div class="acts"><button class="btn" id="qa-clr">Xoá cuộc hỏi</button></div>' : ''}</div>
      <div class="chat" id="qa-log"></div>
      <form class="qa-in mt" id="qa-f"><input id="qa-i" placeholder="VD: Hạn nộp tờ khai TNCN quý 4/2026?" autocomplete="off"><button class="btn pri" type="submit">Hỏi</button></form>
      <div class="card mt"><h3>Câu hỏi hay gặp</h3><div class="chips">${LUAT.QA.map(x => `<button data-q="${esc(x.q)}">${esc(x.q)}</button>`).join('')}</div></div>`;
    const draw = () => {
      $('#qa-log', v).innerHTML = st.log.map(m => m.me ? `<div class="ans me">${esc(m.q)}</div>` : renderAns(m)).join('');
      $$('[data-open-doc]', v).forEach(a => a.onclick = e => { e.preventDefault(); V.law = { g: '', q: '', open: a.dataset.openDoc }; location.hash = 'luat-phap'; });
    };
    const ask = async q => { q = q.trim(); if (!q) return; st.log.push({ me: 1, q }); const m = { q, r: answer(q) }; st.log.push(m);
      if (!m.r.best && window.KT_AIQA) m.wait = 1;
      draw(); const last = $$('.ans', v).pop(); if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (m.wait) { try { const x = await window.KT_AIQA(q); m.wait = 0; if (x) m.ai = x; } catch (e) { m.wait = 0; } if ($('#qa-log')) draw(); } };
    $('#qa-f', v).onsubmit = e => { e.preventDefault(); const i = $('#qa-i', v); ask(i.value); i.value = ''; };
    $$('[data-q]', v).forEach(b => b.onclick = () => ask(b.dataset.q));
    const clr = $('#qa-clr', v); if (clr) clr.onclick = () => { st.log = []; rerender(); };
    draw();
    if (st.pre) { const p = st.pre; st.pre = ''; ask(p); }
  };
  function renderAns(m) {
    const r = m.r;
    const citeAI = arr => (arr || []).map(c => { const d = docById(c.id); if (!d) return ''; const a = d.diem.find(x => x[0] === c.art); return `<a href="#luat-phap" data-open-doc="${d.id}"><b>${esc(c.art || 'Toàn văn')} · ${esc(d.loai)} ${esc(d.so)}</b>${a ? '<br>' + esc(a[1]) : ''}</a>`; }).join('');
    if (m.wait) return `<div class="ans"><div class="q">Đang tra trong văn bản đã nạp…</div><div class="dots"><i></i><i></i><i></i></div></div>`;
    if (m.ai && m.ai.found && m.ai.answer) return `<div class="ans"><div class="q">${esc(m.q)}</div><div>${esc(m.ai.answer)}</div><div class="cite"><small class="mut">Căn cứ (AI đối chiếu trong văn bản đã nạp)</small>${citeAI(m.ai.cites) || '<small class="mut">Không có trích dẫn, hãy kiểm tra lại ở mục Luật pháp.</small>'}</div></div>`;
    if (m.ai && !m.ai.found) return `<div class="ans"><div class="q">Chưa đủ căn cứ trong văn bản đã nạp.</div><div>${esc(m.ai.answer || 'Mình không đoán để tránh sai.')}</div>${r.docHits.length ? `<div class="cite">${r.docHits.map(h => `<a href="#luat-phap" data-open-doc="${h.d.id}"><b>${esc(h.d.loai)} ${esc(h.d.so)}</b><br>${esc(h.d.ten)}</a>`).join('')}</div>` : ''}</div>`; const cite = (arr) => arr.map(([id, art]) => { const d = docById(id); if (!d) return ''; const a = d.diem.find(x => x[0] === art);
      return `<a href="#luat-phap" data-open-doc="${d.id}"><b>${esc(art || 'Toàn văn')} · ${esc(d.loai)} ${esc(d.so)}</b>${a ? '<br>' + esc(a[1]) : ''}</a>`; }).join('');
    if (r.best) return `<div class="ans"><div class="q">${esc(r.best.x.q)}</div><div>${esc(r.best.x.a)}</div><div class="cite"><small class="mut">Căn cứ</small>${cite(r.best.x.cc)}</div>
      ${r.also.length ? `<div class="also"><small class="mut">Có thể bạn cũng cần:</small> ${r.also.map(x => `<button class="lnk" data-q="${esc(x.q)}" onclick="this.closest('.v-hoi-dap').querySelector('#qa-i').value=this.dataset.q;this.closest('.v-hoi-dap').querySelector('#qa-f').requestSubmit()">${esc(x.q)}</button>`).join(' · ')}</div>` : ''}</div>`;
    if (r.docHits.length) return `<div class="ans"><div class="q">Chưa có câu trả lời soạn sẵn cho câu này.</div><div>Các văn bản đã nạp có liên quan, bấm để đọc điều khoản:</div><div class="cite">${r.docHits.map(h => `<a href="#luat-phap" data-open-doc="${h.d.id}"><b>${esc(h.d.loai)} ${esc(h.d.so)}</b><br>${esc(h.d.ten)} · hiệu lực ${esc(h.d.hl || '')}</a>`).join('')}</div></div>`;
    return `<div class="ans"><div class="q">Chưa có trong văn bản đã nạp.</div><div>Mình không đoán để tránh sai. Hãy thử hỏi theo từ khoá như "hạn nộp", "quyết toán", "BHXH", "hoá đơn", "giảm trừ gia cảnh", hoặc mở mục Luật pháp để tra toàn văn.</div></div>`;
  }

  /* ---------- staff ---------- */
  ROUTES['nhan-su'] = v => {
    const ps = S.data.profiles.slice().sort((a, b) => (a.role === 'manager' ? -1 : 1) - (b.role === 'manager' ? -1 : 1));
    v.innerHTML = `<div class="head"><div><h1>Nhân sự & phân quyền</h1><p class="sub">Nhân viên chỉ thấy khách hàng được giao. Thêm người bằng mã mời: người đó tự đặt mật khẩu, quản lý không cần biết.</p></div><div class="acts"><button class="btn pri" id="ns-i">＋ Tạo mã mời</button></div></div>
      <div class="card tw"><table class="tbl cards"><thead><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Vai trò</th><th>Khách phụ trách</th><th>Trạng thái</th><th></th></tr></thead><tbody>${ps.map(p => `<tr><td class="main" data-l="">${esc(p.full_name)}${p.id === S.me.id ? ' <span class="pill p-mut">Bạn</span>' : ''}</td><td data-l="Đăng nhập" class="mono">${esc(p.username)}</td>
        <td data-l="Vai trò">${p.role === 'manager' ? '<span class="pill p-vio">Quản lý</span>' : '<span class="pill p-dang">Nhân viên</span>'}</td><td data-l="Khách phụ trách">${S.data.clients.filter(c => c.staff_id === p.id && c.active !== false).length}</td>
        <td data-l="Trạng thái">${p.active !== false ? '<span class="pill p-da_nop">Đang hoạt động</span>' : '<span class="pill p-mut">Đã khoá</span>'}</td><td data-l="">${p.id !== S.me.id ? `<button class="btn sm" data-ps="${p.id}">Sửa</button>` : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="card mt"><h3>Mã mời</h3><div class="list">${S.data.invites.slice().reverse().map(i => `<div class="tr inv"><div class="d"><span class="code">${esc(i.code)}</span></div><div class="t"><b>${esc(i.full_name || 'Chưa đặt tên')}</b><span>${i.role === 'manager' ? 'Quản lý' : 'Nhân viên'} · tạo ${fmtD(String(i.created_at).slice(0, 10))}</span></div>${i.used_by ? `<span class="pill p-mut">Đã dùng: ${esc(pname(i.used_by))}</span>` : `<button class="btn sm" data-inv-del="${esc(i.code)}">Huỷ mã</button>`}</div>`).join('') || '<div class="empty">Chưa có mã mời.</div>'}</div></div>
      <div class="card mt"><h3>Bảo mật</h3><ul class="small"><li>Người ngoài có link chỉ thấy trang đăng nhập.</li><li>Nhân viên không xem được khách của người khác, không đổi được người phụ trách hay phí dịch vụ.</li><li>Khoá tài khoản khi nhân viên nghỉ việc: họ mất quyền truy cập ngay.</li></ul></div>`;
    $('#ns-i', v).onclick = () => modal(`<h2>Tạo mã mời</h2><label>Họ tên người được mời<input id="iv-n"></label><label>Vai trò<select id="iv-r"><option value="staff">Nhân viên (chỉ thấy khách được giao)</option><option value="manager">Quản lý (thấy tất cả)</option></select></label>
      <div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="iv-ok">Tạo mã</button></div>`, b => $('#iv-ok', b).onclick = async () => {
      const code = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(x => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 32]).join('');
      try { const r = await DB.ins('invites', { code, full_name: $('#iv-n', b).value.trim(), role: $('#iv-r', b).value, created_by: S.me.id, used_by: null, created_at: new Date().toISOString() }); S.data.invites.push(r);
        modal(`<h2>Mã mời đã tạo</h2><p>Gửi mã này cho <b>${esc(r.full_name || 'nhân viên')}</b>. Người đó mở web, chọn "Tạo tài khoản (có mã mời)" rồi nhập mã. Mỗi mã dùng 1 lần.</p><p style="font-size:26px;text-align:center"><span class="code">${esc(code)}</span></p><div class="acts-b"><button class="btn pri" data-close>Xong</button></div>`); rerenderSoft(); } catch (e) { toast(e.message); }
    });
    $$('[data-ps]', v).forEach(bt => bt.onclick = () => { const p = S.data.profiles.find(x => x.id === bt.dataset.ps);
      modal(`<h2>${esc(p.full_name)}</h2><label>Họ tên<input id="ps-n" value="${esc(p.full_name)}"></label><label>Vai trò<select id="ps-r"><option value="staff" ${p.role === 'staff' ? 'selected' : ''}>Nhân viên</option><option value="manager" ${p.role === 'manager' ? 'selected' : ''}>Quản lý</option></select></label>
        <label class="chk"><input type="checkbox" id="ps-a" ${p.active !== false ? 'checked' : ''}> Cho phép đăng nhập</label><div class="acts-b"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="ps-ok">Lưu</button></div>`, b => $('#ps-ok', b).onclick = async () => {
        try { Object.assign(p, await DB.upd('profiles', p.id, { full_name: $('#ps-n', b).value.trim() || p.full_name, role: $('#ps-r', b).value, active: $('#ps-a', b).checked })); closeModal(); toast('Đã lưu'); rerender(); } catch (e) { toast(e.message); } }); });
    $$('[data-inv-del]', v).forEach(bt => bt.onclick = async () => { try { await DB.del('invites', bt.dataset.invDel, 'code'); S.data.invites = S.data.invites.filter(i => i.code !== bt.dataset.invDel); toast('Đã huỷ mã'); rerender(); } catch (e) { toast(e.message); } });
  };
  const rerenderSoft = () => { const h = (location.hash || '').slice(1); if (h === 'nhan-su') { const v = $('#view'); v.innerHTML = ''; ROUTES['nhan-su'](v); } };

  ROUTES['tai-khoan'] = v => {
    v.innerHTML = `<div class="head"><div><h1>Tài khoản</h1><p class="sub">${esc(S.me.full_name)} · <span class="mono">${esc(S.me.username)}</span> · ${S.mgr ? 'Quản lý' : 'Nhân viên'}</p></div></div>
      <div class="grid g2"><form class="card" id="pw-f"><h3>Đổi mật khẩu</h3><label>Mật khẩu mới (ít nhất 8 ký tự)<input type="password" id="pw-1" minlength="8" autocomplete="new-password"></label><label>Nhập lại<input type="password" id="pw-2" autocomplete="new-password"></label><button class="btn pri" type="submit">Đổi mật khẩu</button></form>
      <div class="card"><h3>Phiên đăng nhập</h3><p class="small">Đăng xuất khi dùng máy chung.</p><button class="btn" id="lo">Đăng xuất</button>
      ${DB.demo ? `<h3 class="mt">Bản dùng thử</h3><p class="small">Dữ liệu là mẫu, chỉ lưu trên trình duyệt của máy này. Bản chính thức lưu trên máy chủ riêng có phân quyền.</p><button class="btn red" id="rs">Đặt lại dữ liệu mẫu</button>` : ''}</div></div>`;
    $('#pw-f', v).onsubmit = async e => { e.preventDefault(); const a = $('#pw-1', v).value, b = $('#pw-2', v).value; if (a.length < 8) return toast('Mật khẩu cần ít nhất 8 ký tự'); if (a !== b) return toast('Hai mật khẩu chưa giống nhau'); try { await DB.changePw(a); toast('Đã đổi mật khẩu'); e.target.reset(); } catch (er) { toast(er.message); } };
    $('#lo', v).onclick = logout;
    const rs = $('#rs', v); if (rs) rs.onclick = () => confirmBox('Đặt lại toàn bộ dữ liệu mẫu?', async () => { DB.reset(); await start(); toast('Đã đặt lại'); });
  };

  /* ---------- auth ---------- */
  async function logout() { await DB.signOut(); S = { me: null, data: null, mgr: false }; Object.keys(V).forEach(k => delete V[k]); showLogin(); }
  function showLogin(msg) {
    $('#boot').classList.add('hide'); $('#app').classList.add('hide'); $('#login').classList.remove('hide');
    $('#login-msg').textContent = msg || ''; $('#login-msg').className = 'msg';
  }
  $$('[data-lt]').forEach(b => b.onclick = () => { $$('[data-lt]').forEach(x => x.classList.toggle('on', x === b)); $('#f-in').classList.toggle('hide', b.dataset.lt !== 'in'); $('#f-up').classList.toggle('hide', b.dataset.lt !== 'up'); $('#login-msg').textContent = ''; });
  $$('[data-demo]').forEach(b => b.onclick = () => { $('#f-in [name=u]').value = b.dataset.demo; $('#f-in [name=p]').value = 'Demo@2026'; $('#f-in').requestSubmit(); });
  $('#f-in').onsubmit = async e => {
    e.preventDefault(); const f = e.target, bt = $('button[type=submit]', f); bt.disabled = true; $('#login-msg').textContent = '';
    try { await DB.signIn(f.u.value, f.p.value); f.p.value = ''; await start(); } catch (er) { $('#login-msg').textContent = er.message; } finally { bt.disabled = false; }
  };
  $('#f-up').onsubmit = async e => {
    e.preventDefault(); const f = e.target, bt = $('button[type=submit]', f); bt.disabled = true; $('#login-msg').textContent = '';
    try { await DB.signUp(f.u.value, f.p.value, f.n.value.trim(), f.i.value); f.reset(); await start(); } catch (er) { $('#login-msg').textContent = er.message; } finally { bt.disabled = false; }
  };

  async function start() {
    const s = await DB.session(); if (!s) return showLogin();
    const me = await DB.me(s.user.id); if (!me || me.active === false) { await DB.signOut(); return showLogin('Tài khoản chưa được cấp quyền hoặc đã bị khoá.'); }
    S.me = me; S.mgr = me.role === 'manager';
    try { S.data = await DB.loadAll(S.mgr); } catch (e) { return showLogin(e.message); }
    await syncTasks();
    $('#boot').classList.add('hide'); $('#login').classList.add('hide'); $('#app').classList.remove('hide');
    if (!location.hash) { const l = ls.get('kt.last'); if (l && ROUTES[l]) { history.replaceState(null, '', '#' + l); } }
    go();
  }
  window.KT = { get S() { return S; }, V, ROUTES, $, $$, esc, money, vnd, fmtD, fmtDs, TODAY, days, fold, toast, modal, closeModal, confirmBox, cMap, pname, tname, exportXlsx, rerender, editDoc, remindClient, openClient, LH, answer, docById, dl };
  const boot = () => start().catch(e => showLogin(DB.err(e)));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
