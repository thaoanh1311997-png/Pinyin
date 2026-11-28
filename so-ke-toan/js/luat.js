/* Thư viện văn bản pháp luật cho kế toán dịch vụ. Cập nhật: 28/11/2026.
   Mỗi văn bản ghi rõ số hiệu, ngày hiệu lực, văn bản thay thế và các điều hay dùng.
   Trích dẫn điều khoản lấy từ văn bản gốc hoặc bản tóm tắt của cơ quan, hãng kiểm toán (ghi ở mục "Đối chiếu").
   Trước khi nộp hồ sơ quan trọng, luôn mở toàn văn để kiểm tra lại. */
(function () {
  const UPD = '28/11/2026';
  const G = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);
  const tvpl = so => G('site:thuvienphapluat.vn "' + so + '"');
  const offi = so => G('"' + so + '" site:vbpl.vn OR site:chinhphu.vn OR site:quochoi.vn OR site:mof.gov.vn');

  const NHOM = [
    ['qlt', 'Quản lý thuế', '🧾'],
    ['gtgt', 'Thuế GTGT', '➕'],
    ['tndn', 'Thuế TNDN', '🏢'],
    ['tncn', 'Thuế TNCN', '👤'],
    ['hd', 'Hoá đơn, chứng từ', '🧮'],
    ['hkd', 'Hộ kinh doanh', '🏪'],
    ['bh', 'BHXH, BHYT, BHTN', '🛡️'],
    ['kt', 'Kế toán, BCTC', '📒'],
    ['xp', 'Xử phạt', '⚖️'],
    ['het', 'Đã hết hiệu lực', '🗂️']
  ];

  // tt: 'hl' còn hiệu lực, 'sap' sắp hiệu lực, 'het' hết hiệu lực
  const DOCS = [
    { id: 'l108', nhom: 'qlt', so: '108/2025/QH15', loai: 'Luật', ten: 'Luật Quản lý thuế', cq: 'Quốc hội', bh: '10/12/2025', hl: '01/07/2026', tt: 'hl',
      thay: 'Luật Quản lý thuế 38/2019/QH14',
      link: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Luat-Quan-ly-thue-2025-so-108-2025-QH15-675268.aspx',
      diem: [
        ['Điều 12 khoản 8', 'Chính phủ quy định thời hạn nộp hồ sơ khai thuế (chi tiết tại Điều 10 NĐ 252/2026/NĐ-CP).'],
        ['Điều 14 khoản 1 điểm a', '“Trường hợp người nộp thuế tự tính thuế, khoản thu khác thì thời hạn nộp thuế, khoản thu khác chậm nhất là ngày cuối cùng của thời hạn nộp hồ sơ khai thuế, khoản thu khác.” Tạm nộp theo quý thực hiện theo quy định của Chính phủ.'],
        ['Điều 16 khoản 2 điểm a', 'Tiền chậm nộp: “bằng 0,03%/ngày tính trên số tiền thuế, khoản thu khác chậm nộp”.'],
        ['Điều 26', 'Hoá đơn điện tử; khai thuế theo từng lần phát sinh trước khi cấp mã hoá đơn (điểm b khoản 3).']
      ], dc: 'Văn bản gốc trên Thư viện Pháp luật; tóm tắt KPMG, VOV.' },
    { id: 'nd252', nhom: 'qlt', so: '252/2026/NĐ-CP', loai: 'Nghị định', ten: 'Quy định chi tiết và hướng dẫn thi hành Luật Quản lý thuế', cq: 'Chính phủ', bh: '30/06/2026', hl: '01/07/2026', tt: 'hl',
      thay: 'NĐ 126/2020/NĐ-CP và các nghị định sửa đổi (91/2022, 49/2025, 117/2025, 373/2025)',
      link: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-252-2026-ND-CP-huong-dan-Luat-Quan-ly-thue-713086.aspx',
      diem: [
        ['Điều 10 khoản 1', 'Khai theo từng lần phát sinh: chậm nhất là ngày thứ 10 kể từ ngày tiếp theo ngày phát sinh nghĩa vụ thuế.'],
        ['Điều 10 khoản 2', 'Khai theo tháng: “chậm nhất là ngày thứ 20 của tháng tiếp theo tháng phát sinh nghĩa vụ thuế.”'],
        ['Điều 10 khoản 3', 'Khai theo quý: “chậm nhất là ngày cuối cùng của tháng đầu của quý tiếp theo quý phát sinh nghĩa vụ thuế.”'],
        ['Điều 10 khoản 4', 'Khai theo năm: chậm nhất ngày cuối cùng của tháng đầu tiên của năm dương lịch (hoặc năm tài chính) tiếp theo.'],
        ['Điều 10 khoản 5 điểm a', 'Quyết toán năm: “chậm nhất là ngày cuối cùng của tháng thứ 03 kể từ ngày kết thúc kỳ quyết toán thuế.”'],
        ['Điều 10 khoản 5 điểm b', 'Giải thể, chấm dứt hoạt động, sáp nhập…: chậm nhất ngày thứ 45 kể từ ngày có quyết định.'],
        ['Điều 10 khoản 5 điểm c', 'Cá nhân có tiền lương, tiền công trực tiếp quyết toán TNCN: chậm nhất ngày cuối cùng của tháng thứ 04 kể từ ngày kết thúc năm dương lịch.'],
        ['Điều 10 khoản 9', 'Hộ kinh doanh, cá nhân kinh doanh: theo Nghị định 68/2026/NĐ-CP.'],
        ['Tạm nộp quý', 'Thời hạn tạm nộp thuế theo quý (gồm TNDN): chậm nhất ngày cuối cùng của tháng đầu của quý tiếp theo (theo tóm tắt KPMG 07/2026, nên đối chiếu điều khoản gốc).'],
        ['Điều 3 khoản 7', 'Hạn rơi vào ngày nghỉ: ngày cuối cùng của thời hạn là ngày làm việc liền kề sau ngày nghỉ (theo LuatVietnam; cùng nguyên tắc khoản 5 Điều 148 Bộ luật Dân sự 2015).']
      ], dc: 'Điều 10 đối chiếu bản sao gần nguyên văn (Đại lý thuế Trọng Đạt), VOV 16/7/2026, LuatVietnam, KPMG.' },
    { id: 'tt89', nhom: 'qlt', so: '89/2026/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn Luật Quản lý thuế và Nghị định 252/2026/NĐ-CP (mẫu biểu khai thuế)', cq: 'Bộ Tài chính', bh: '30/06/2026', hl: '01/07/2026', tt: 'hl',
      thay: 'Thông tư 80/2021/TT-BTC', link: tvpl('89/2026/TT-BTC'),
      diem: [
        ['Điều 22 khoản 1 điểm a.1', 'Tổ chức trả thu nhập từ tiền lương, tiền công “thực hiện khai số thuế thu nhập cá nhân đã khấu trừ của cá nhân nhận thu nhập theo quý.” (bỏ khai tháng).'],
        ['Điều 22 khoản 1 điểm a.2', 'Vẫn phải quyết toán TNCN năm “không phân biệt trong năm có phát sinh khấu trừ thuế hay không.”']
      ], dc: 'LuatVietnam 16/7/2026, MISA AMIS 20/11/2026.' },
    { id: 'nq198', nhom: 'qlt', so: '198/2025/QH15', loai: 'Nghị quyết', ten: 'Một số cơ chế, chính sách đặc biệt phát triển kinh tế tư nhân', cq: 'Quốc hội', bh: '17/05/2025', hl: '17/05/2025', tt: 'hl', thay: '',
      link: tvpl('198/2025/QH15'),
      diem: [
        ['Điều 10 khoản 7', '“Chấm dứt việc thu, nộp lệ phí môn bài từ ngày 01 tháng 01 năm 2026.” Từ năm 2026 doanh nghiệp, hộ kinh doanh không khai, nộp lệ phí môn bài.'],
        ['Điều 10', 'Từ 01/01/2026, hộ kinh doanh, cá nhân kinh doanh không áp dụng phương pháp thuế khoán.']
      ], dc: 'LuatVietnam 20/12/2025, MISA.' },

    { id: 'l48', nhom: 'gtgt', so: '48/2024/QH15', loai: 'Luật', ten: 'Luật Thuế giá trị gia tăng', cq: 'Quốc hội', bh: '26/11/2024', hl: '01/07/2025', tt: 'hl',
      thay: 'Luật Thuế GTGT 13/2008/QH12 và các luật sửa đổi', link: tvpl('48/2024/QH15'),
      diem: [['Sửa đổi', 'Được sửa đổi bởi Luật 09/2026/QH16 (thông qua 24/04/2026, một số điều áp dụng từ 01/01/2026).']], dc: 'MISA, Thuế Phú Thọ.' },
    { id: 'nd181', nhom: 'gtgt', so: '181/2025/NĐ-CP', loai: 'Nghị định', ten: 'Quy định chi tiết Luật Thuế giá trị gia tăng', cq: 'Chính phủ', bh: '01/07/2025', hl: '01/07/2025', tt: 'hl', thay: 'NĐ 209/2013/NĐ-CP và các nghị định sửa đổi', link: tvpl('181/2025/NĐ-CP'), diem: [], dc: 'MISA.' },
    { id: 'l09', nhom: 'gtgt', so: '09/2026/QH16', loai: 'Luật', ten: 'Luật sửa đổi, bổ sung một số điều của các Luật Thuế TNCN, GTGT, TNDN, TTĐB', cq: 'Quốc hội', bh: '24/04/2026', hl: '24/04/2026', tt: 'hl', thay: '',
      link: tvpl('09/2026/QH16'), diem: [['Điều 1–3', 'Các nội dung sửa đổi về thuế áp dụng từ 01/01/2026 (theo MISA, chỉ một nguồn, cần đối chiếu toàn văn).']], dc: 'MISA 28/09/2026 (một nguồn).' },

    { id: 'l67', nhom: 'tndn', so: '67/2025/QH15', loai: 'Luật', ten: 'Luật Thuế thu nhập doanh nghiệp', cq: 'Quốc hội', bh: '14/06/2025', hl: '01/10/2025', tt: 'hl',
      thay: 'Luật Thuế TNDN 14/2008/QH12 và các luật sửa đổi', link: tvpl('67/2025/QH15'),
      diem: [['Hiệu lực', 'Áp dụng từ kỳ tính thuế TNDN năm 2025.']], dc: 'MISA.' },
    { id: 'nd320', nhom: 'tndn', so: '320/2025/NĐ-CP', loai: 'Nghị định', ten: 'Quy định chi tiết Luật Thuế thu nhập doanh nghiệp', cq: 'Chính phủ', bh: '15/12/2025', hl: '15/12/2025', tt: 'hl', thay: 'NĐ 218/2013/NĐ-CP và các nghị định sửa đổi', link: tvpl('320/2025/NĐ-CP'), diem: [], dc: 'MISA.' },

    { id: 'l109', nhom: 'tncn', so: '109/2025/QH15', loai: 'Luật', ten: 'Luật Thuế thu nhập cá nhân', cq: 'Quốc hội', bh: '10/12/2025', hl: '01/07/2026', tt: 'hl',
      thay: 'Luật Thuế TNCN 04/2007/QH12 và các luật sửa đổi', link: tvpl('109/2025/QH15'),
      diem: [
        ['Hiệu lực', 'Hiệu lực 01/07/2026; quy định về thu nhập từ tiền lương, tiền công và kinh doanh của cá nhân cư trú áp dụng từ kỳ tính thuế năm 2026. Luật gồm 4 chương, 29 điều.'],
        ['Biểu thuế lũy tiến', 'Còn 5 bậc (theo tháng): đến 10 triệu: 5%; trên 10–30 triệu: 10%; trên 30–60 triệu: 20%; trên 60–100 triệu: 30%; trên 100 triệu: 35%.'],
        ['Giảm trừ gia cảnh', 'Bản thân 15,5 triệu đồng/tháng (186 triệu/năm); mỗi người phụ thuộc 6,2 triệu đồng/tháng (theo Nghị quyết 110/2025/UBTVQH15).'],
        ['Hộ, cá nhân kinh doanh', 'Doanh thu năm từ 500 triệu đồng trở xuống không phải nộp thuế TNCN.']
      ], dc: 'EY 26/12/2025, Báo Lâm Đồng 23/01/2026, MISA 02/07/2026.' },
    { id: 'nd253', nhom: 'tncn', so: '253/2026/NĐ-CP', loai: 'Nghị định', ten: 'Quy định chi tiết Luật Thuế thu nhập cá nhân', cq: 'Chính phủ', bh: '30/06/2026', hl: '01/07/2026', tt: 'hl', thay: '', link: tvpl('253/2026/NĐ-CP'), diem: [], dc: 'MISA (một nguồn).' },

    { id: 'nd254', nhom: 'hd', so: '254/2026/NĐ-CP', loai: 'Nghị định', ten: 'Quy định về hoá đơn, chứng từ', cq: 'Chính phủ', bh: '30/06/2026', hl: '01/07/2026', tt: 'hl',
      thay: 'NĐ 123/2020/NĐ-CP và NĐ 70/2025/NĐ-CP', link: tvpl('254/2026/NĐ-CP'), diem: [], dc: 'MAN, MISA.' },
    { id: 'tt91', nhom: 'hd', so: '91/2026/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn về hoá đơn, chứng từ', cq: 'Bộ Tài chính', bh: '', hl: '01/07/2026', tt: 'hl', thay: 'Thông tư 32/2025/TT-BTC', link: tvpl('91/2026/TT-BTC'), diem: [], dc: 'MISA (một nguồn, cần đối chiếu).' },

    { id: 'nd68', nhom: 'hkd', so: '68/2026/NĐ-CP', loai: 'Nghị định', ten: 'Quản lý thuế đối với hộ kinh doanh, cá nhân kinh doanh', cq: 'Chính phủ', bh: '', hl: '', tt: 'hl', thay: '', link: tvpl('68/2026/NĐ-CP'),
      diem: [['Thời hạn', 'Thời hạn khai thuế của hộ, cá nhân kinh doanh theo nghị định này (dẫn chiếu tại khoản 9 Điều 10 NĐ 252/2026).']], dc: 'VOV, Đại lý thuế Trọng Đạt. Chưa đọc toàn văn, hãy mở văn bản gốc.' },
    { id: 'tt152', nhom: 'hkd', so: '152/2025/TT-BTC', loai: 'Thông tư', ten: 'Chế độ kế toán hộ kinh doanh, cá nhân kinh doanh', cq: 'Bộ Tài chính', bh: '', hl: '01/01/2026', tt: 'hl', thay: 'Thông tư 88/2021/TT-BTC', link: tvpl('152/2025/TT-BTC'), diem: [], dc: 'MAN, MISA.' },

    { id: 'l41', nhom: 'bh', so: '41/2024/QH15', loai: 'Luật', ten: 'Luật Bảo hiểm xã hội', cq: 'Quốc hội', bh: '29/06/2024', hl: '01/07/2025', tt: 'hl', thay: 'Luật BHXH 58/2014/QH13', link: tvpl('41/2024/QH15'),
      diem: [
        ['Điều 34 khoản 4', 'Đóng hằng tháng: chậm nhất ngày cuối cùng của tháng tiếp theo. Đóng 3 tháng/6 tháng một lần: chậm nhất ngày cuối cùng của tháng tiếp theo ngay sau chu kỳ đóng.'],
        ['Điều 34 khoản 1', 'Người sử dụng lao động đóng 3% vào quỹ ốm đau và thai sản, 14% vào quỹ hưu trí và tử tuất.'],
        ['Điều 38', 'Chậm đóng: chưa đóng hoặc đóng chưa đủ kể từ sau ngày đóng chậm nhất.']
      ], dc: 'eBHXH (EFY) trích dẫn điều luật.' },
    { id: 'lbhyt', nhom: 'bh', so: '51/2024/QH15', loai: 'Luật', ten: 'Luật sửa đổi, bổ sung một số điều của Luật Bảo hiểm y tế', cq: 'Quốc hội', bh: '27/11/2024', hl: '01/07/2025', tt: 'hl', thay: '', link: tvpl('51/2024/QH15'), diem: [], dc: 'Ghi theo hiểu biết trước đây, hãy mở toàn văn để đối chiếu.' },
    { id: 'lvl', nhom: 'bh', so: '74/2025/QH15', loai: 'Luật', ten: 'Luật Việc làm (bảo hiểm thất nghiệp)', cq: 'Quốc hội', bh: '16/06/2025', hl: '01/01/2026', tt: 'hl', thay: 'Luật Việc làm 38/2013/QH13', link: tvpl('74/2025/QH15'), diem: [], dc: 'Ghi theo hiểu biết trước đây, hãy mở toàn văn để đối chiếu.' },

    { id: 'nd161', nhom: 'bh', so: '161/2026/NĐ-CP', loai: 'Nghị định', ten: 'Mức lương cơ sở', cq: 'Chính phủ', bh: '15/05/2026', hl: '01/07/2026', tt: 'hl', thay: '', link: tvpl('161/2026/NĐ-CP'),
      diem: [['Mức lương cơ sở', '2.530.000 đồng/tháng từ 01/07/2026. Mức tham chiếu đóng BHXH bằng lương cơ sở, nên tiền lương đóng BHXH, BHYT tối đa là 20 × 2.530.000 = 50.600.000 đồng/tháng.']], dc: 'Thư viện Pháp luật, PLO.' },
    { id: 'nd293', nhom: 'bh', so: '293/2025/NĐ-CP', loai: 'Nghị định', ten: 'Mức lương tối thiểu đối với người lao động làm việc theo hợp đồng lao động', cq: 'Chính phủ', bh: '10/11/2025', hl: '01/01/2026', tt: 'hl', thay: 'NĐ 74/2024/NĐ-CP', link: tvpl('293/2025/NĐ-CP'),
      diem: [['Lương tối thiểu tháng 2026', 'Vùng I: 5.310.000; Vùng II: 4.730.000; Vùng III: 4.140.000; Vùng IV: 3.700.000 đồng/tháng. Áp dụng đến hết 31/12/2026.'], ['Trần đóng BHTN', 'Tiền lương đóng BHTN tối đa bằng 20 tháng lương tối thiểu vùng (Vùng I năm 2026: 106.200.000 đồng).']], dc: 'VOV, LuatVietnam, VietnamPlus.' },
    { id: 'nd399', nhom: 'bh', so: '399/2026/NĐ-CP', loai: 'Nghị định', ten: 'Mức lương tối thiểu từ 01/01/2027', cq: 'Chính phủ', bh: '', hl: '01/01/2027', tt: 'sap', thay: 'NĐ 293/2025/NĐ-CP', link: tvpl('399/2026/NĐ-CP'),
      diem: [['Lương tối thiểu tháng 2027', 'Vùng I: 5.700.000; Vùng II: 5.080.000; Vùng III: 4.450.000; Vùng IV: 4.040.000 đồng/tháng.']], dc: 'VietnamPlus 03/11/2026.' },
    { id: 'l88', nhom: 'kt', so: '88/2015/QH13', loai: 'Luật', ten: 'Luật Kế toán', cq: 'Quốc hội', bh: '20/11/2015', hl: '01/01/2017', tt: 'hl', thay: 'Luật Kế toán 03/2003/QH11', link: tvpl('88/2015/QH13'),
      diem: [['Sửa đổi', 'Sửa đổi bởi Luật 38/2019/QH14, Luật 56/2024/QH15 (hiệu lực 01/01/2025) và Luật 108/2025/QH15 (bổ sung Điều 70a). Văn bản hợp nhất 41/VBHN-VPQH ngày 16/03/2026.']], dc: 'MAN 12/10/2026, MISA.' },
    { id: 'nd174', nhom: 'kt', so: '174/2016/NĐ-CP', loai: 'Nghị định', ten: 'Quy định chi tiết một số điều của Luật Kế toán', cq: 'Chính phủ', bh: '30/12/2016', hl: '01/01/2017', tt: 'hl', thay: '', link: tvpl('174/2016/NĐ-CP'),
      diem: [['Điều 109', 'Thời hạn nộp BCTC năm: doanh nghiệp tư nhân, công ty hợp danh chậm nhất 30 ngày; đơn vị khác chậm nhất 90 ngày kể từ ngày kết thúc kỳ kế toán năm.'], ['Sửa đổi', 'Sửa đổi bởi NĐ 151/2018/NĐ-CP.']], dc: 'MAN; Điều 109 theo văn bản gốc trước đây.' },
    { id: 'tt99', nhom: 'kt', so: '99/2025/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn chế độ kế toán doanh nghiệp', cq: 'Bộ Tài chính', bh: '27/10/2025', hl: '01/01/2026', tt: 'hl', thay: 'Thông tư 200/2014/TT-BTC', link: tvpl('99/2025/TT-BTC'),
      diem: [['Áp dụng', 'Áp dụng cho năm tài chính bắt đầu từ 01/01/2026. Doanh nghiệp nhỏ và vừa được tự chọn áp dụng thay cho TT 133.']], dc: 'MAN, MISA, Pháp chế.' },
    { id: 'tt133', nhom: 'kt', so: '133/2016/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn chế độ kế toán doanh nghiệp nhỏ và vừa', cq: 'Bộ Tài chính', bh: '26/08/2016', hl: '01/01/2017', tt: 'hl', thay: 'Quyết định 48/2006/QĐ-BTC', link: tvpl('133/2016/TT-BTC'), diem: [['Lưu ý', 'Vẫn còn áp dụng theo MAN và MISA (năm 2026).']], dc: 'MAN, MISA.' },
    { id: 'tt58', nhom: 'kt', so: '58/2026/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn chế độ kế toán doanh nghiệp siêu nhỏ', cq: 'Bộ Tài chính', bh: '', hl: '01/07/2026', tt: 'hl', thay: 'Thông tư 132/2018/TT-BTC', link: tvpl('58/2026/TT-BTC'), diem: [['Áp dụng', 'Cho năm tài chính bắt đầu từ 01/07/2026.']], dc: 'MAN, MISA.' },
    { id: 'tt108', nhom: 'kt', so: '108/2025/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn lập và trình bày báo cáo tài chính hợp nhất', cq: 'Bộ Tài chính', bh: '', hl: '01/01/2026', tt: 'hl', thay: '', link: tvpl('108/2025/TT-BTC'), diem: [], dc: 'MISA (một nguồn).' },

    { id: 'nd125', nhom: 'xp', so: '125/2020/NĐ-CP', loai: 'Nghị định', ten: 'Xử phạt vi phạm hành chính về thuế, hoá đơn', cq: 'Chính phủ', bh: '19/10/2020', hl: '05/12/2020', tt: 'hl', thay: '', link: tvpl('125/2020/NĐ-CP'),
      diem: [['Sửa đổi', 'Sửa đổi bởi NĐ 102/2021/NĐ-CP và NĐ 310/2025/NĐ-CP. Vẫn còn hiệu lực sau 01/07/2026.']], dc: 'MISA, Kế toán Lê Ánh.' },
    { id: 'nd41', nhom: 'xp', so: '41/2018/NĐ-CP', loai: 'Nghị định', ten: 'Xử phạt vi phạm hành chính trong lĩnh vực kế toán, kiểm toán độc lập', cq: 'Chính phủ', bh: '12/03/2018', hl: '01/05/2018', tt: 'hl', thay: '', link: tvpl('41/2018/NĐ-CP'),
      diem: [['Sửa đổi', 'Sửa đổi bởi NĐ 102/2021/NĐ-CP và NĐ 132/2026/NĐ-CP (hiệu lực 21/05/2026).']], dc: 'MAN, MISA.' },
    { id: 'blds', nhom: 'xp', so: '91/2015/QH13', loai: 'Luật', ten: 'Bộ luật Dân sự (cách tính thời hạn)', cq: 'Quốc hội', bh: '24/11/2015', hl: '01/01/2017', tt: 'hl', thay: '', link: tvpl('91/2015/QH13'),
      diem: [['Điều 148 khoản 5', 'Khi ngày cuối cùng của thời hạn là ngày nghỉ cuối tuần hoặc ngày nghỉ lễ thì thời hạn kết thúc tại thời điểm kết thúc ngày làm việc tiếp theo ngày nghỉ đó.']], dc: 'Văn bản gốc.' },

    { id: 'x38', nhom: 'het', so: '38/2019/QH14', loai: 'Luật', ten: 'Luật Quản lý thuế (cũ)', cq: 'Quốc hội', bh: '13/06/2019', hl: '01/07/2020', tt: 'het', thay: 'Được thay bằng Luật 108/2025/QH15 từ 01/07/2026', link: tvpl('38/2019/QH14'), diem: [], dc: '' },
    { id: 'x126', nhom: 'het', so: '126/2020/NĐ-CP', loai: 'Nghị định', ten: 'Hướng dẫn Luật Quản lý thuế (cũ)', cq: 'Chính phủ', bh: '19/10/2020', hl: '05/12/2020', tt: 'het', thay: 'Được thay bằng NĐ 252/2026/NĐ-CP từ 01/07/2026', link: tvpl('126/2020/NĐ-CP'), diem: [], dc: '' },
    { id: 'x80', nhom: 'het', so: '80/2021/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn Luật Quản lý thuế (cũ)', cq: 'Bộ Tài chính', bh: '29/09/2021', hl: '01/01/2022', tt: 'het', thay: 'Được thay bằng TT 89/2026/TT-BTC từ 01/07/2026', link: tvpl('80/2021/TT-BTC'), diem: [], dc: '' },
    { id: 'x123', nhom: 'het', so: '123/2020/NĐ-CP', loai: 'Nghị định', ten: 'Hoá đơn, chứng từ (cũ)', cq: 'Chính phủ', bh: '19/10/2020', hl: '01/07/2022', tt: 'het', thay: 'Hết hiệu lực 01/07/2026, thay bằng NĐ 254/2026/NĐ-CP (cùng NĐ 70/2025/NĐ-CP)', link: tvpl('123/2020/NĐ-CP'), diem: [], dc: '' },
    { id: 'x32', nhom: 'het', so: '32/2025/TT-BTC', loai: 'Thông tư', ten: 'Hướng dẫn hoá đơn (thay TT 78/2021)', cq: 'Bộ Tài chính', bh: '', hl: '01/06/2025', tt: 'het', thay: 'Thay bằng TT 91/2026/TT-BTC từ 01/07/2026 (một nguồn)', link: tvpl('32/2025/TT-BTC'), diem: [], dc: '' },
    { id: 'x200', nhom: 'het', so: '200/2014/TT-BTC', loai: 'Thông tư', ten: 'Chế độ kế toán doanh nghiệp (cũ)', cq: 'Bộ Tài chính', bh: '22/12/2014', hl: '05/02/2015', tt: 'het', thay: 'Không áp dụng cho năm tài chính bắt đầu từ 01/01/2026, thay bằng TT 99/2025/TT-BTC', link: tvpl('200/2014/TT-BTC'), diem: [], dc: '' },
    { id: 'x132', nhom: 'het', so: '132/2018/TT-BTC', loai: 'Thông tư', ten: 'Kế toán doanh nghiệp siêu nhỏ (cũ)', cq: 'Bộ Tài chính', bh: '28/12/2018', hl: '15/02/2019', tt: 'het', thay: 'Thay bằng TT 58/2026/TT-BTC cho năm tài chính bắt đầu từ 01/07/2026', link: tvpl('132/2018/TT-BTC'), diem: [], dc: '' },
    { id: 'x88', nhom: 'het', so: '88/2021/TT-BTC', loai: 'Thông tư', ten: 'Kế toán hộ kinh doanh (cũ)', cq: 'Bộ Tài chính', bh: '11/10/2021', hl: '01/01/2022', tt: 'het', thay: 'Thay bằng TT 152/2025/TT-BTC từ 01/01/2026', link: tvpl('88/2021/TT-BTC'), diem: [], dc: '' },
    { id: 'x302', nhom: 'het', so: '139/2016/NĐ-CP', loai: 'Nghị định', ten: 'Lệ phí môn bài', cq: 'Chính phủ', bh: '04/10/2016', hl: '01/01/2017', tt: 'het', thay: 'Chấm dứt thu, nộp lệ phí môn bài từ 01/01/2026 (khoản 7 Điều 10 NQ 198/2025/QH15)', link: tvpl('139/2016/NĐ-CP'), diem: [], dc: '' }
  ];
  DOCS.forEach(d => { d.offi = offi(d.so); if (!d.link) d.link = tvpl(d.so); });

  /* Hỏi đáp: chỉ trả lời từ các điều khoản đã nạp ở trên. k = từ khoá (không dấu). */
  const QA = [
    { k: ['han', 'nop', 'gtgt', 'thang', 'to khai thang', 'khai thang'], q: 'Hạn nộp tờ khai thuế GTGT theo tháng là ngày nào?', a: 'Chậm nhất là ngày 20 của tháng tiếp theo tháng phát sinh nghĩa vụ thuế. Ví dụ tờ khai tháng 11/2026 nộp chậm nhất ngày 21/12/2026 (20/12/2026 là Chủ nhật nên dời sang thứ Hai). Tiền thuế nộp cùng hạn với tờ khai.', cc: [['nd252', 'Điều 10 khoản 2'], ['l108', 'Điều 14 khoản 1 điểm a'], ['blds', 'Điều 148 khoản 5']] },
    { k: ['han', 'quy', 'khai quy', 'to khai quy', 'gtgt quy'], q: 'Hạn nộp tờ khai theo quý là ngày nào?', a: 'Chậm nhất là ngày cuối cùng của tháng đầu của quý tiếp theo. Ví dụ quý 4/2026 nộp chậm nhất ngày 01/02/2027 (31/01/2027 là Chủ nhật nên dời sang thứ Hai).', cc: [['nd252', 'Điều 10 khoản 3'], ['blds', 'Điều 148 khoản 5']] },
    { k: ['tncn', 'quy', 'thang', 'khau tru', 'tien luong', 'tien cong', 'khai tncn'], q: 'Từ 1/7/2026 khai thuế TNCN khấu trừ từ tiền lương theo tháng hay quý?', a: 'Theo quý. Tổ chức trả thu nhập từ tiền lương, tiền công khai số thuế TNCN đã khấu trừ theo quý (không còn khai tháng), và vẫn phải quyết toán năm dù trong năm có khấu trừ hay không.', cc: [['tt89', 'Điều 22 khoản 1 điểm a.1'], ['tt89', 'Điều 22 khoản 1 điểm a.2']] },
    { k: ['quyet toan', 'tndn', 'bctc', 'bao cao tai chinh', 'nam'], q: 'Hạn quyết toán thuế TNDN và nộp báo cáo tài chính năm?', a: 'Quyết toán thuế năm: chậm nhất ngày cuối cùng của tháng thứ 3 kể từ ngày kết thúc kỳ quyết toán (năm dương lịch: 31/3 năm sau). BCTC năm theo Luật Kế toán: doanh nghiệp tư nhân, công ty hợp danh chậm nhất 30 ngày; đơn vị khác chậm nhất 90 ngày kể từ ngày kết thúc kỳ kế toán năm.', cc: [['nd252', 'Điều 10 khoản 5 điểm a'], ['nd174', 'Điều 109']] },
    { k: ['quyet toan', 'tncn', 'ca nhan', 'tu quyet toan', 'truc tiep'], q: 'Hạn quyết toán thuế TNCN?', a: 'Tổ chức trả thu nhập quyết toán: chậm nhất ngày cuối cùng của tháng thứ 3 sau khi kết thúc năm. Cá nhân có tiền lương, tiền công trực tiếp quyết toán: chậm nhất ngày cuối cùng của tháng thứ 4 sau khi kết thúc năm dương lịch.', cc: [['nd252', 'Điều 10 khoản 5 điểm a'], ['nd252', 'Điều 10 khoản 5 điểm c']] },
    { k: ['tam nop', 'tndn', 'quy', 'tam tinh'], q: 'Hạn tạm nộp thuế TNDN theo quý?', a: 'Theo tóm tắt Nghị định 252/2026 của KPMG: thời hạn tạm nộp thuế theo quý (gồm TNDN) chậm nhất là ngày cuối cùng của tháng đầu của quý tiếp theo. Luật QLT giao Chính phủ quy định thời hạn tạm nộp theo quý. Nên mở toàn văn NĐ 252 để đối chiếu điều khoản cụ thể.', cc: [['nd252', 'Tạm nộp quý'], ['l108', 'Điều 14 khoản 1 điểm a']] },
    { k: ['mon bai', 'le phi mon bai', 'thue mon bai'], q: 'Năm 2026, 2027 còn phải nộp lệ phí môn bài không?', a: 'Không. Chấm dứt việc thu, nộp lệ phí môn bài từ ngày 01/01/2026.', cc: [['nq198', 'Điều 10 khoản 7']] },
    { k: ['bhxh', 'bao hiem', 'dong bao hiem', 'han dong', 'bhyt', 'bhtn'], q: 'Hạn đóng BHXH hằng tháng?', a: 'Chậm nhất ngày cuối cùng của tháng tiếp theo (ví dụ tiền BHXH tháng 11/2026 đóng chậm nhất 31/12/2026). Nếu đóng 3 tháng hoặc 6 tháng một lần: chậm nhất ngày cuối cùng của tháng tiếp theo ngay sau chu kỳ đóng.', cc: [['l41', 'Điều 34 khoản 4']] },
    { k: ['ty le', 'bhxh', 'muc dong', 'nguoi su dung lao dong', 'phan tram'], q: 'Doanh nghiệp đóng BHXH bao nhiêu phần trăm?', a: 'Người sử dụng lao động đóng 3% vào quỹ ốm đau và thai sản và 14% vào quỹ hưu trí và tử tuất (chưa gồm BHYT, BHTN, bảo hiểm tai nạn lao động – bệnh nghề nghiệp).', cc: [['l41', 'Điều 34 khoản 1']] },
    { k: ['cham nop', 'tien cham nop', 'lai', '0,03', 'phat cham'], q: 'Tiền chậm nộp thuế tính thế nào?', a: 'Bằng 0,03%/ngày tính trên số tiền thuế chậm nộp. Mức phạt chậm nộp hồ sơ khai thuế xem Nghị định 125/2020/NĐ-CP (đã sửa đổi bởi NĐ 102/2021 và 310/2025).', cc: [['l108', 'Điều 16 khoản 2 điểm a'], ['nd125', 'Sửa đổi']] },
    { k: ['ngay nghi', 'thu bay', 'chu nhat', 'le', 'tet', 'dời', 'doi han', 'trung ngay nghi'], q: 'Hạn nộp trùng thứ Bảy, Chủ nhật hoặc ngày lễ thì sao?', a: 'Được tính sang ngày làm việc tiếp theo ngay sau ngày nghỉ đó. Lịch trong web đã tự dời hạn theo nguyên tắc này (lịch nghỉ lễ đã nạp đến hết năm 2027).', cc: [['blds', 'Điều 148 khoản 5'], ['nd252', 'Điều 3 khoản 7']] },
    { k: ['giam tru', 'gia canh', 'nguoi phu thuoc', 'ban than', '15,5', '6,2'], q: 'Mức giảm trừ gia cảnh hiện nay?', a: 'Bản thân người nộp thuế 15,5 triệu đồng/tháng (186 triệu/năm); mỗi người phụ thuộc 6,2 triệu đồng/tháng, áp dụng từ kỳ tính thuế năm 2026.', cc: [['l109', 'Giảm trừ gia cảnh']] },
    { k: ['bieu thue', 'luy tien', 'thue suat', 'bac', 'tncn', 'tinh thue'], q: 'Biểu thuế TNCN lũy tiến từng phần hiện nay?', a: '5 bậc theo thu nhập tính thuế/tháng: đến 10 triệu 5%; trên 10 đến 30 triệu 10%; trên 30 đến 60 triệu 20%; trên 60 đến 100 triệu 30%; trên 100 triệu 35%. Áp dụng từ kỳ tính thuế năm 2026.', cc: [['l109', 'Biểu thuế lũy tiến']] },
    { k: ['ho kinh doanh', 'hkd', '500 trieu', 'khong chiu thue', 'nguong', 'doanh thu'], q: 'Hộ kinh doanh doanh thu bao nhiêu thì không phải nộp thuế TNCN?', a: 'Doanh thu năm từ 500 triệu đồng trở xuống không phải nộp thuế TNCN. Từ 01/01/2026 bỏ thuế khoán. Thời hạn khai của hộ kinh doanh theo Nghị định 68/2026/NĐ-CP.', cc: [['l109', 'Hộ, cá nhân kinh doanh'], ['nq198', 'Điều 10'], ['nd252', 'Điều 10 khoản 9']] },
    { k: ['thue khoan', 'khoan'], q: 'Hộ kinh doanh còn nộp thuế khoán không?', a: 'Không. Từ 01/01/2026 hộ kinh doanh, cá nhân kinh doanh không áp dụng phương pháp thuế khoán.', cc: [['nq198', 'Điều 10']] },
    { k: ['luong co so', 'muc tham chieu', 'toi da', 'tran', '50,6', 'muc dong toi da'], q: 'Tiền lương đóng BHXH tối đa hiện nay là bao nhiêu?', a: 'Từ 01/07/2026 lương cơ sở là 2.530.000 đồng/tháng, nên tiền lương đóng BHXH, BHYT tối đa là 20 lần = 50.600.000 đồng/tháng. Tiền lương đóng BHTN tối đa bằng 20 tháng lương tối thiểu vùng (Vùng I năm 2026: 106.200.000 đồng).', cc: [['nd161', 'Mức lương cơ sở'], ['nd293', 'Trần đóng BHTN']] },
    { k: ['luong toi thieu', 'toi thieu vung', 'vung i', 'vung 1'], q: 'Lương tối thiểu vùng năm 2026 và 2027?', a: 'Năm 2026 (NĐ 293/2025): Vùng I 5.310.000; Vùng II 4.730.000; Vùng III 4.140.000; Vùng IV 3.700.000 đồng/tháng. Từ 01/01/2027 (NĐ 399/2026): Vùng I 5.700.000; Vùng II 5.080.000; Vùng III 4.450.000; Vùng IV 4.040.000 đồng/tháng.', cc: [['nd293', 'Lương tối thiểu tháng 2026'], ['nd399', 'Lương tối thiểu tháng 2027']] },
    { k: ['che do ke toan', 'thong tu 200', 'tt200', 'tt 99', 'thong tu 99', 'tt133', '133'], q: 'Năm 2026 doanh nghiệp áp dụng chế độ kế toán nào?', a: 'Thông tư 99/2025/TT-BTC thay Thông tư 200/2014/TT-BTC, áp dụng cho năm tài chính bắt đầu từ 01/01/2026. Doanh nghiệp nhỏ và vừa vẫn áp dụng Thông tư 133/2016/TT-BTC (hoặc tự chọn TT 99). Doanh nghiệp siêu nhỏ: Thông tư 58/2026/TT-BTC cho năm tài chính bắt đầu từ 01/07/2026.', cc: [['tt99', 'Áp dụng'], ['tt133', 'Lưu ý'], ['tt58', 'Áp dụng']] },
    { k: ['hoa don', 'nghi dinh 123', '123', 'hoa don dien tu', '254'], q: 'Văn bản về hoá đơn hiện hành là gì?', a: 'Nghị định 254/2026/NĐ-CP (hiệu lực 01/07/2026) thay Nghị định 123/2020/NĐ-CP và Nghị định 70/2025/NĐ-CP; Thông tư hướng dẫn 91/2026/TT-BTC thay Thông tư 32/2025/TT-BTC.', cc: [['nd254', ''], ['tt91', '']] },
    { k: ['giai the', 'cham dut', 'sap nhap', 'dong ma so thue'], q: 'Hạn quyết toán khi giải thể, chấm dứt hoạt động?', a: 'Chậm nhất là ngày thứ 45 kể từ ngày có quyết định giải thể, chấm dứt hoạt động, sáp nhập…', cc: [['nd252', 'Điều 10 khoản 5 điểm b']] },
    { k: ['phat sinh', 'tung lan', 'lan phat sinh'], q: 'Khai thuế theo từng lần phát sinh nộp khi nào?', a: 'Chậm nhất là ngày thứ 10 kể từ ngày tiếp theo ngày phát sinh nghĩa vụ thuế.', cc: [['nd252', 'Điều 10 khoản 1']] }
  ];

  window.KT_LUAT = { UPD, NHOM, DOCS, QA };
})();
