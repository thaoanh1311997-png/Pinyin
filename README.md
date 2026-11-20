# Bánh Mì · Học tiếng Trung mỗi ngày

Trang chủ: https://thaoanh1311997-png.github.io/Pinyin/ (gộp tất cả các mục). Thanh chuyển mục dùng chung: `shared/nav.js` (chèn ngay sau `<body>` của mỗi trang). Nhân vật: `shared/banhmi.svg`.

## Đọc PDF có Pinyin

Kéo file PDF giáo trình tiếng Trung (kể cả bản scan) vào, xem pinyin ngay trên trang sách và nghĩa tiếng Việt khi rê chuột hoặc chạm vào chữ. Chạy hoàn toàn trong trình duyệt.

Link: https://thaoanh1311997-png.github.io/Pinyin/pdf/

- Nghĩa tiếng Việt: CVDICT của Phong Phan (CC BY-SA 4.0), file `dict.txt` được rút gọn từ CVDICT nên cũng theo giấy phép CC BY-SA 4.0.
- Âm Hán Việt: hanviet-pinyin-words (MIT).

## Bánh Mì · Học tiếng Trung qua video

Link: https://thaoanh1311997-png.github.io/Pinyin/video/

Dán link YouTube kèm bản chép lời (hoặc file .srt), chọn video/âm thanh trong máy, hoặc mở file giáo trình (PDF, Word, ảnh, TXT) rồi chọn bài. Có Shadowing, Phát âm (chấm bằng nhận giọng nói của trình duyệt), Luyện nghe chép câu, Điền từ, Luyện tập (từ vựng, quiz, sắp xếp câu, luyện viết với Hanzi Writer), Sổ từ ôn theo lịch và Phòng tập trung (Pomodoro). Dùng chung `dict.txt` (CVDICT) của trang này.

## Vở tập viết

Link: https://thaoanh1311997-png.github.io/Pinyin/vo/

Tạo vở tập viết chữ Hán (田字格, 米字格, 回宫格, 九宫格, ô trơn): thứ tự nét, chữ mờ để tô, pinyin, âm Hán Việt, nghĩa. Lấy chữ từ giáo trình bài 11–25, HSK 1–6 hoặc tự gõ. In, tải PDF, viết thẳng lên vở bằng Apple Pencil/ngón tay, luyện từng nét (Hanzi Writer).

- Dữ liệu nét: Make Me a Hanzi / hanzi-writer-data (Arphic Public License), tải từ jsDelivr. Thư viện `vo/lib/hanzi-writer.min.js` (MIT), `vo/lib/jspdf.umd.min.js` (MIT).
- `vo/data/chars.js`: nghĩa + âm Hán Việt từng chữ rút từ CVDICT (CC BY-SA 4.0). `vo/data/lessons.js`: từ mới bài 11–25.
