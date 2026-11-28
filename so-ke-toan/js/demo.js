/* Bản dùng thử: dữ liệu mẫu (không phải khách hàng thật), lưu trên trình duyệt của máy đang dùng.
   Phân quyền mô phỏng y như bản chính thức: nhân viên chỉ thấy công ty mình phụ trách. */
(function () {
  const KEY = 'kt.demo.v2', SKEY = 'kt.demo.sess';
  const L = window.KT_DL;
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  let mem = null, sess = null;
  const uid = () => 'x' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const today = () => L.iso(new Date());
  const addD = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return L.iso(d); };

  const USERS = [
    { id: 'u-ql', username: 'quanly', full_name: 'Nguyễn Thị Hương Giang', role: 'manager', active: true, pw: 'Demo@2026' },
    { id: 'u-lan', username: 'lan', full_name: 'Trần Thị Lan', role: 'staff', active: true, pw: 'Demo@2026' },
    { id: 'u-minh', username: 'minh', full_name: 'Lê Văn Minh', role: 'staff', active: true, pw: 'Demo@2026' },
    { id: 'u-hoa', username: 'hoa', full_name: 'Phạm Thu Hoa', role: 'staff', active: true, pw: 'Demo@2026' }
  ];
  const NAMES = [
    ['Công ty TNHH Thương mại An Phát', 'TNHH', 'quy', 3500000], ['Công ty CP Xây dựng Minh Long', 'CP', 'thang', 6000000],
    ['Công ty TNHH Thực phẩm Hương Quê', 'TNHH', 'quy', 3000000], ['Công ty TNHH MTV Vận tải Bắc Nam', 'TNHH', 'thang', 5000000],
    ['Công ty TNHH Nội thất Gỗ Việt', 'TNHH', 'quy', 3000000], ['Công ty CP Công nghệ Sao Mai', 'CP', 'thang', 7000000],
    ['Doanh nghiệp tư nhân Kim Hoàn', 'DNTN', 'quy', 2500000], ['Công ty TNHH Dược phẩm Thiên An', 'TNHH', 'thang', 6500000],
    ['Hộ kinh doanh Tạp hoá Cô Ba', 'HKD', 'khong', 1000000], ['Công ty TNHH In ấn Hồng Hà', 'TNHH', 'quy', 3000000],
    ['Công ty TNHH Du lịch Biển Xanh', 'TNHH', 'quy', 3500000], ['Công ty CP Cơ khí Đông Á', 'CP', 'thang', 8000000],
    ['Công ty TNHH May mặc Phương Nam', 'TNHH', 'thang', 5500000], ['Công ty TNHH Mỹ phẩm Ngọc Lan', 'TNHH', 'quy', 3000000],
    ['Công ty TNHH Giáo dục Ánh Dương', 'TNHH', 'quy', 2500000], ['Hộ kinh doanh Quán cơm Bà Tư', 'HKD', 'khong', 1000000],
    ['Công ty TNHH Điện máy Trường Thịnh', 'TNHH', 'thang', 6000000], ['Công ty CP Nông sản Đất Việt', 'CP', 'quy', 4000000],
    ['Công ty TNHH Phần mềm Cầu Vồng', 'TNHH', 'quy', 3500000], ['Công ty TNHH Logistics Hải Đăng', 'TNHH', 'thang', 7000000],
    ['Công ty TNHH Nhà hàng Phố Cổ', 'TNHH', 'quy', 3000000], ['Công ty TNHH Vật liệu Xây dựng Thành Công', 'TNHH', 'thang', 5000000],
    ['Doanh nghiệp tư nhân Cơ điện Tân Tiến', 'DNTN', 'quy', 2500000], ['Công ty TNHH Spa Hoa Sen', 'TNHH', 'quy', 2500000],
    ['Công ty TNHH Thiết bị Y tế Bình An', 'TNHH', 'thang', 6000000], ['Công ty CP Bất động sản Lộc Phát', 'CP', 'quy', 5000000],
    ['Công ty TNHH Xuất nhập khẩu Hưng Thịnh', 'TNHH', 'thang', 8000000], ['Hộ kinh doanh Tiệm bánh Hạnh Phúc', 'HKD', 'khong', 1000000],
    ['Công ty TNHH Quảng cáo Ý Tưởng Mới', 'TNHH', 'quy', 3000000], ['Công ty TNHH Nông nghiệp Xanh', 'TNHH', 'quy', 3000000]
  ];
  const DOCS = ['Hoá đơn đầu vào', 'Sao kê ngân hàng', 'Bảng lương, chấm công', 'Hợp đồng lao động mới', 'Phiếu nhập xuất kho', 'Hợp đồng mua bán', 'Danh sách người phụ thuộc'];

  function seed() {
    let s = 20261128; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    const staff = USERS.filter(u => u.role === 'staff');
    const clients = NAMES.map((n, i) => ({
      id: 'c' + (i + 1), name: n[0] + ' (mẫu)', mst: '000' + String(1000001 + i * 37).slice(0, 7), loai_hinh: n[1], ky_gtgt: n[2],
      co_tncn: n[1] !== 'HKD', co_bhxh: n[1] !== 'HKD', co_tndn: n[1] !== 'HKD', staff_id: staff[i % 3].id,
      lien_he: ['Anh Tuấn', 'Chị Mai', 'Anh Hùng', 'Chị Thảo', 'Anh Nam'][i % 5] + ' (kế toán nội bộ)', sdt: '09000000' + String(10 + i),
      email: 'demo' + (i + 1) + '@vidu.vn', dia_chi: ['Quận 1', 'Thủ Đức', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình'][i % 5] + ', TP. Hồ Chí Minh',
      ghi_chu: i % 4 === 0 ? 'Hay gửi chứng từ trễ, nhắc sớm.' : '', phi_thang: n[3], active: true, created_at: '2026-01-05'
    }));
    const t0 = today(), from = addD(t0, -75), to = addD(t0, 150);
    const tasks = [];
    clients.forEach(c => L.expected(c, from, to).forEach(e => {
      const diff = (new Date(e.han) - new Date(t0)) / 864e5; const r = rnd();
      let st = 'chua';
      if (diff < -3) st = r < 0.9 ? 'da_nop' : (r < 0.95 ? 'cho_ct' : 'dang');
      else if (diff < 0) st = r < 0.6 ? 'da_nop' : (r < 0.8 ? 'cho_ct' : 'chua');
      else if (diff <= 12) st = r < 0.3 ? 'da_nop' : r < 0.55 ? 'dang' : r < 0.8 ? 'cho_ct' : 'chua';
      else if (diff <= 40) st = r < 0.15 ? 'dang' : 'chua';
      tasks.push({ id: uid(), ...e, ten: '', trang_thai: st, ghi_chu: st === 'cho_ct' ? 'Chờ khách gửi hoá đơn đầu vào' : '', ngay_nop: st === 'da_nop' ? (e.han < t0 ? addD(e.han, -2) : t0) : null, updated_at: t0 });
    }));
    tasks.push({ id: uid(), client_id: 'c2', loai: 'KHAC', ky: 'k-' + uid(), ten: 'Đăng ký thay đổi thông tin người đại diện', han: addD(t0, 4), trang_thai: 'dang', ghi_chu: '', ngay_nop: null, updated_at: t0 });
    const docs = [];
    clients.forEach((c, i) => {
      if (c.loai_hinh === 'HKD' && i % 2) return;
      const n = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const got = rnd() < 0.45;
        docs.push({ id: uid(), client_id: c.id, ten: DOCS[Math.floor(rnd() * DOCS.length)], ky: 'Tháng ' + (new Date().getMonth() || 12) + '/' + new Date().getFullYear(),
          trang_thai: got ? 'da_nhan' : 'cho', ngay_yeu_cau: addD(t0, -Math.floor(rnd() * 14) - 1), ngay_nhan: got ? addD(t0, -1) : null, lan_nhac: got ? 0 : Math.floor(rnd() * 3), nhac_luc: null, ghi_chu: '' });
      }
    });
    const fees = []; const d = new Date();
    for (let k = 4; k >= 0; k--) {
      const x = new Date(d.getFullYear(), d.getMonth() - k, 1); const ky = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
      clients.forEach((c, i) => {
        const r = rnd(); let paid = c.phi_thang;
        if (k === 0) paid = r < 0.35 ? c.phi_thang : 0; else if (k === 1) paid = r < 0.75 ? c.phi_thang : (r < 0.85 ? c.phi_thang / 2 : 0); else if (r < 0.06) paid = 0;
        fees.push({ id: uid(), client_id: c.id, ky, so_tien: c.phi_thang, da_thu: paid, ngay_thu: paid ? L.iso(new Date(x.getFullYear(), x.getMonth(), 10)) : null, ghi_chu: '' });
      });
    }
    return { profiles: USERS.map(u => ({ ...u })), clients, tasks, docs, fees, invites: [{ code: 'MOI2026A', full_name: 'Nhân viên mới', role: 'staff', created_by: 'u-ql', used_by: null, created_at: t0 }] };
  }
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(ls.get(KEY) || 'null'); } catch (e) { mem = null; }
    if (!mem || !mem.profiles) { mem = seed(); save(); }
    return mem;
  }
  function save() { ls.set(KEY, JSON.stringify(mem)); }
  const me = () => sess && load().profiles.find(p => p.id === sess.uid && p.active);
  const isMgr = () => { const m = me(); return !!(m && m.role === 'manager'); };
  const myClient = cid => { const m = me(); if (!m) return false; const c = load().clients.find(x => x.id === cid); return !!c && (m.role === 'manager' || c.staff_id === m.id); };
  function can(t, row, op) {
    const m = me(); if (!m) return false;
    if (t === 'profiles') return op === 'sel' ? (row.id === m.id || isMgr()) : isMgr() || row.id === m.id;
    if (t === 'invites') return isMgr();
    if (t === 'clients') return op === 'sel' || op === 'upd' || op === 'ins' ? (isMgr() || row.staff_id === m.id) : isMgr();
    if (t === 'fees') return op === 'sel' ? myClient(row.client_id) : isMgr();
    return myClient(row.client_id);
  }
  const deny = () => { throw new Error('Bạn không có quyền làm việc này.'); };
  const clean = r => { const o = { ...r }; delete o.pw; return o; };

  const DB = {
    ready: true, demo: true,
    err: e => (e && e.message) || String(e),
    async session() { try { sess = JSON.parse(ls.get(SKEY) || 'null'); } catch (e) { sess = null; } if (sess && !me()) sess = null; return sess ? { user: { id: sess.uid } } : null; },
    async signIn(u, p) {
      const x = load().profiles.find(q => q.username === String(u || '').trim().toLowerCase());
      if (!x || x.pw !== p) throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
      if (!x.active) throw new Error('Tài khoản đã bị khoá. Liên hệ quản lý.');
      sess = { uid: x.id }; ls.set(SKEY, JSON.stringify(sess)); return { user: { id: x.id } };
    },
    async signUp(u, p, name, invite) {
      const db = load(); u = String(u || '').trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,30}$/.test(u)) throw new Error('Tên đăng nhập 3–30 ký tự, chỉ chữ không dấu, số, dấu chấm, gạch.');
      if (String(p).length < 8) throw new Error('Mật khẩu cần ít nhất 8 ký tự.');
      const inv = db.invites.find(i => i.code === String(invite || '').trim().toUpperCase() && !i.used_by);
      if (!inv) throw new Error('Mã mời không đúng hoặc đã được dùng.');
      if (db.profiles.some(q => q.username === u)) throw new Error('Tên đăng nhập này đã có người dùng.');
      const id = uid(); db.profiles.push({ id, username: u, full_name: name || inv.full_name || u, role: inv.role, active: true, pw: p, created_at: today() });
      inv.used_by = id; save(); return DB.signIn(u, p);
    },
    async signOut() { sess = null; ls.del(SKEY); },
    async changePw(p) { const m = me(); if (!m) deny(); if (String(p).length < 8) throw new Error('Mật khẩu cần ít nhất 8 ký tự.'); load().profiles.find(x => x.id === m.id).pw = p; save(); },
    async me(id) { const x = load().profiles.find(p => p.id === id); return x ? clean(x) : null; },
    async loadAll() {
      const db = load(), o = {};
      ['profiles', 'clients', 'tasks', 'docs', 'fees', 'invites'].forEach(t => o[t] = db[t].filter(r => can(t, r, 'sel')).map(clean));
      return o;
    },
    async ins(t, row) {
      const r = { id: uid(), ...row };
      if (t === 'tasks') { r.updated_at = today(); if (load().tasks.some(x => x.client_id === r.client_id && x.loai === r.loai && x.ky === r.ky)) throw new Error('Việc này đã có.'); }
      if (!can(t, r, 'ins')) deny(); load()[t].push(r); save(); return clean(r);
    },
    async insMany(t, rows) {
      const out = [];
      for (const row of rows) { try { out.push(await DB.ins(t, row)); } catch (e) { if (!/đã có/.test(e.message)) throw e; } }
      return out;
    },
    async upd(t, id, patch, key) {
      const arr = load()[t], r = arr.find(x => x[key || 'id'] === id); if (!r || !can(t, r, 'upd')) deny();
      if (t === 'clients' && !isMgr() && (('staff_id' in patch && patch.staff_id !== r.staff_id) || ('phi_thang' in patch && +patch.phi_thang !== +r.phi_thang))) throw new Error('Chỉ quản lý được đổi người phụ trách hoặc phí dịch vụ.');
      if (t === 'profiles' && !isMgr() && ('role' in patch || 'active' in patch)) deny();
      Object.assign(r, patch); if (t === 'tasks') r.updated_at = today(); save(); return clean(r);
    },
    async del(t, id, key) {
      const arr = load()[t], i = arr.findIndex(x => x[key || 'id'] === id); if (i < 0 || !can(t, arr[i], 'del')) deny();
      arr.splice(i, 1);
      if (t === 'clients') ['tasks', 'docs', 'fees'].forEach(k => { load()[k] = load()[k].filter(x => x.client_id !== id); });
      save();
    },
    reset() { mem = seed(); save(); },
    onAuth() {}
  };
  window.KT_DB = DB;
})();
