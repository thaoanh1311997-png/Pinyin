/* Tính hạn nộp tự động. Căn cứ (cập nhật 28/11/2026):
   - Thời hạn nộp hồ sơ khai thuế: Điều 10 Nghị định 252/2026/NĐ-CP (hiệu lực 01/7/2026)
   - Thời hạn nộp thuế = ngày cuối cùng của thời hạn nộp hồ sơ khai thuế: điểm a khoản 1 Điều 14 Luật QLT 108/2025/QH15
   - Khai TNCN khấu trừ từ tiền lương theo quý từ 01/7/2026: điểm a.1 khoản 1 Điều 22 Thông tư 89/2026/TT-BTC
   - Đóng BHXH hằng tháng: chậm nhất ngày cuối cùng của tháng tiếp theo (khoản 4 Điều 34 Luật BHXH 41/2024/QH15)
   - Hạn rơi vào ngày nghỉ: tính sang ngày làm việc kế tiếp (khoản 5 Điều 148 Bộ luật Dân sự 2015) */
(function () {
  // Ngày nghỉ lễ chính thức (khối cơ quan nhà nước) đã nạp. Thứ Bảy, Chủ nhật tự tính.
  const HOLI = {
    '2026-01-01': 'Tết Dương lịch',
    '2026-04-30': 'Ngày Chiến thắng', '2026-05-01': 'Quốc tế Lao động',
    '2026-09-02': 'Quốc khánh', '2026-11-24': 'Ngày Văn hóa Việt Nam',
    '2027-01-01': 'Tết Dương lịch',
    '2027-02-04': 'Tết Nguyên đán', '2027-02-05': 'Tết Nguyên đán', '2027-02-08': 'Tết Nguyên đán',
    '2027-02-09': 'Tết Nguyên đán', '2027-02-10': 'Tết Nguyên đán',
    '2027-04-30': 'Ngày Chiến thắng', '2027-05-01': 'Quốc tế Lao động', '2027-05-03': 'Nghỉ bù 1/5 (trùng thứ Bảy)',
    '2027-09-02': 'Quốc khánh', '2027-09-03': 'Quốc khánh'
  };
  const HOLI_TO = 2027; // lịch nghỉ đã nạp đến hết năm này

  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const lastDay = (y, m) => new Date(y, m, 0); // m: 1-12 → ngày cuối tháng m
  const isOff = d => d.getDay() === 0 || d.getDay() === 6 || !!HOLI[iso(d)];
  function shift(d) { // dời sang ngày làm việc kế tiếp
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    while (isOff(x)) x.setDate(x.getDate() + 1);
    return x;
  }
  const addM = (y, m, k) => { const t = y * 12 + (m - 1) + k; return [Math.floor(t / 12), t % 12 + 1]; };

  const TYPES = {
    GTGT_T: { ten: 'Khai thuế GTGT tháng', nhom: 'GTGT', cc: 'Khoản 2 Điều 10 NĐ 252/2026/NĐ-CP' },
    GTGT_Q: { ten: 'Khai thuế GTGT quý', nhom: 'GTGT', cc: 'Khoản 3 Điều 10 NĐ 252/2026/NĐ-CP' },
    TNCN_Q: { ten: 'Khai thuế TNCN khấu trừ (quý)', nhom: 'TNCN', cc: 'Điểm a.1 khoản 1 Điều 22 TT 89/2026/TT-BTC; khoản 3 Điều 10 NĐ 252/2026/NĐ-CP' },
    TNDN_Q: { ten: 'Tạm nộp thuế TNDN quý', nhom: 'TNDN', cc: 'NĐ 252/2026/NĐ-CP (tạm nộp theo quý: chậm nhất ngày cuối cùng tháng đầu quý sau); điểm a khoản 1 Điều 14 Luật 108/2025/QH15' },
    BHXH: { ten: 'Đóng BHXH, BHYT, BHTN tháng', nhom: 'BHXH', cc: 'Khoản 4 Điều 34 Luật BHXH 41/2024/QH15' },
    QT_TNDN: { ten: 'Quyết toán TNDN + Báo cáo tài chính năm', nhom: 'BCTC', cc: 'Điểm a khoản 5 Điều 10 NĐ 252/2026/NĐ-CP' },
    QT_TNCN: { ten: 'Quyết toán TNCN (tổ chức trả thu nhập)', nhom: 'TNCN', cc: 'Điểm a khoản 5 Điều 10 NĐ 252/2026/NĐ-CP' },
    KHAC: { ten: 'Việc khác', nhom: 'Khác', cc: '' }
  };

  function due(type, ky) {
    let y, m, q, raw;
    if (/^\d{4}-\d{2}$/.test(ky)) { y = +ky.slice(0, 4); m = +ky.slice(5); }
    else if (/^\d{4}-Q[1-4]$/.test(ky)) { y = +ky.slice(0, 4); q = +ky.slice(6); }
    else if (/^\d{4}$/.test(ky)) { y = +ky; }
    switch (type) {
      case 'GTGT_T': { const [a, b] = addM(y, m, 1); raw = new Date(a, b - 1, 20); break; }
      case 'BHXH': { const [a, b] = addM(y, m, 1); raw = lastDay(a, b); break; }
      case 'GTGT_Q': case 'TNCN_Q': case 'TNDN_Q': { const [a, b] = addM(y, q * 3, 1); raw = lastDay(a, b); break; }
      case 'QT_TNDN': case 'QT_TNCN': raw = lastDay(y + 1, 3); break;
      default: return null;
    }
    const d = shift(raw);
    return { han: iso(d), goc: iso(raw), doi: iso(d) !== iso(raw) };
  }

  function kyLabel(ky) {
    if (/^\d{4}-\d{2}$/.test(ky)) return 'Tháng ' + (+ky.slice(5)) + '/' + ky.slice(0, 4);
    if (/^\d{4}-Q/.test(ky)) return 'Quý ' + ky.slice(6) + '/' + ky.slice(0, 4);
    if (/^\d{4}$/.test(ky)) return 'Năm ' + ky;
    return ky || '';
  }

  /* Sinh danh sách việc cần có cho 1 khách hàng, các kỳ có hạn nộp nằm trong [from, to] (chuỗi ISO). */
  function expected(c, from, to) {
    const out = [];
    const push = (type, ky) => { const d = due(type, ky); if (d && d.han >= from && d.han <= to) out.push({ client_id: c.id, loai: type, ky, han: d.han }); };
    const y0 = +from.slice(0, 4) - 1, y1 = +to.slice(0, 4);
    const laDN = c.loai_hinh !== 'HKD';
    for (let y = y0; y <= y1; y++) {
      for (let m = 1; m <= 12; m++) {
        const k = y + '-' + pad(m);
        if (laDN && c.ky_gtgt === 'thang') push('GTGT_T', k);
        if (c.co_bhxh) push('BHXH', k);
      }
      for (let q = 1; q <= 4; q++) {
        const k = y + '-Q' + q;
        if (laDN && c.ky_gtgt === 'quy') push('GTGT_Q', k);
        // Từ 01/7/2026 khai TNCN khấu trừ theo quý (TT 89/2026). Kỳ trước đó không tự sinh.
        if (c.co_tncn && (y > 2026 || (y === 2026 && q >= 3))) push('TNCN_Q', k);
        if (laDN && c.co_tndn !== false) push('TNDN_Q', k);
      }
      if (laDN) push('QT_TNDN', String(y));
      if (c.co_tncn) push('QT_TNCN', String(y));
    }
    return out;
  }

  window.KT_DL = { TYPES, due, expected, kyLabel, iso, HOLI, HOLI_TO, isOff, shift };
})();
