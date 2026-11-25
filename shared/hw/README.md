# Nhận dạng chữ viết tay (dự phòng khi không có mạng tới Google)

- `hanzilookup.min.js`: HanziLookupJS của Gábor Ugray (https://github.com/gugray/HanziLookupJS), dựa trên HanziLookup của Jordan Kiang. Giấy phép GNU GPL (`LICENSE-GPL.txt`).
- `mmah.json`: dữ liệu nét chữ rút từ Make Me a Hanzi (Arphic Public License).

Dùng trong `shared/hoi.js` (ô ✍️ viết tay ở nút tra từ góc màn hình). Nhận dạng chính là Google Input Tools (miễn phí, chạy trên trình duyệt); thư viện này chạy ngay trên máy khi Google không trả lời.
