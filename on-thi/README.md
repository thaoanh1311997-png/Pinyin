# Ra đề ôn thi

Web mini: chọn môn → bấm "Ra đề mới" → làm bài → nộp để chấm. Có ô dán cấu trúc đề để tự tạo dạng đề mới.

## Thêm một bộ đề mới (đợt thi mới)

1. Tạo `data/<id>.js` với nội dung `window.ONTHI_SETS.push({...})`:
   - `id`, `name`, `short`
   - `banks`: ngân hàng câu theo dạng
     - `mcq`: `{q, o:[4 lựa chọn], a: số thứ tự đáp án đúng, src}`
     - `sx` (sắp xếp): `{p:[các mảnh], a: câu đúng, src}`
     - `ss` (sửa câu sai): `{q: câu sai, a: câu đúng ("A / B" nếu nhiều cách), n: giải thích, src}`
     - `dt` (điền trống): `{q: câu có ＿＿＿, a:[các đáp án chấp nhận], vi?, src}`
     - `tv`, `vt` (dịch câu), `tvd`, `vtd` (dịch đoạn): `{zh, vi, py?, src}`
   - Mỗi câu có thể thêm `x` (giải thích), `g` (mã thẻ ngữ pháp), MCQ thêm `xo` (giải thích từng lựa chọn).
   - `cards`: thẻ ngữ pháp `{id, les, title, f:[công thức], note:[giải thích], ex:[[zh, vi]], warn:[bẫy]}` (hiện trong Sổ ngữ pháp).
   - `structures`: các đề mặc định `{id, name, icon, color: coral|teal|blue, date: "YYYY-MM-DD", min, sections:[{type, n, pts}]}`
2. Thêm `id` vào mảng trong `data/sets.js` (bộ cuối cùng là bộ mặc định).
