# Trà Sữa 🧋 – Đọc báo tiếng Trung & Luyện thi HSK

Trang: https://thaoanh1311997-png.github.io/Pinyin/trasua/

- `data/news.json`: tin tự động lấy từ RSS của 中国新闻网 (chinanews.com.cn) mỗi 3 tiếng bởi workflow `.github/workflows/pages.yml` (script `tools/fetch-news.mjs`). Chỉ hiển thị phần RSS cung cấp (tiêu đề + đoạn đầu) kèm link bài gốc.
- `data/hsk1.js` … `hsk6.js`: ngân hàng đề luyện tự soạn theo cấu trúc HSK 2.0. Cấu trúc đề HSK 2.0 / 3.0 nằm trong `STRUCT` ở `app.js`.
- `data/vocab.json`: từ vựng HSK 2.0 (o) và HSK 3.0 bản 2025 (t, 7 = cấp 7–9), dữ liệu từ complete-hsk-vocabulary (MIT), nghĩa Việt từ CVDICT (`../dict.txt`).
- `data/phrases.js`, `data/easy.js`: câu giao tiếp và bài đọc dễ có dịch sẵn.
- `lib/pinyin-pro.js`: pinyin-pro 3.26.0 (MIT).
