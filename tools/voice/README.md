# Giọng đọc AI thu sẵn (audio/zh)

Mọi trang dùng `shared/voice.js`: câu/từ có sẵn trên web phát file giọng AI thu sẵn trong `audio/zh/`; câu mới (tin tức, bài tự dán, AI soạn) dùng giọng máy tốt nhất trên thiết bị, ngắt nghỉ theo câu.

Thu lại khi thêm/sửa nội dung:

1. `node tools/voice/extract.cjs` → gom câu/từ có nút đọc → `tools/voice/items.json` (kèm pinyin tham chiếu như chữ hiện trên web).
2. Python 3.12 + `misaki[zh]==0.9.4 onnxruntime lameenc numpy` và mô hình Kokoro v1.1-zh bản ONNX (sherpa-onnx `kokoro-multi-lang-v1_1`, Apache-2.0) ở `/home/user/tts/kokoro-multi-lang-v1_1/`.
3. `OUT=audio/zh python tools/voice/gen.py tools/voice/items.json 0 1` (chỉ thu câu chưa có file) rồi `python tools/voice/build_index.py`.
4. Soát: `verify.py` (nhận giọng nói SenseVoice, so chữ) — xem câu lệch nhiều.

Giọng: n = người kể (nữ), f = nữ trong hội thoại đề nghe, m = nam. Tên file = mã băm cyrb53 của `giọng|câu đã chuẩn hoá` (xem `norm`/`key` trong `shared/voice.js`).
Chữ đa âm: `gen.py` lấy pinyin trên web (pinyin-pro + sửa tay của Trà Sữa, hoặc pinyin có sẵn trong dữ liệu), bỏ phiếu với misaki, cộng bảng sửa tay `FIX`.
