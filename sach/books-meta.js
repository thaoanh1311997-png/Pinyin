/* Bánh Mì · 📚 tên tiếng Việt + cấp độ cho sách PDF mở đã tải về (sach/books/, danh sách gốc: data/books.json) */
window.SACH_SHELF = {
  groups: {
    'truyen-ca': { emo: '🧸', name: 'Truyện tranh thiếu nhi', d: 'Truyện tranh chữ giản thể, chia 5 cấp. Đọc cho con nghe hay tự luyện đọc đều hợp.', lic: 'CC BY 4.0 · Global Storybooks (African Storybook)', c: '#7C5CDB', soft: '#F0EBFF' },
    mit: { emo: '🎓', name: 'Giáo trình mở MIT', d: 'Learning Chinese của Julian Wheatley, giải thích bằng tiếng Anh, từ phát âm tới trung cấp.', lic: 'CC BY-NC-SA 4.0 · MIT OpenCourseWare', c: '#2F7BEA', soft: '#E6F0FF' },
    fsi: { emo: '🇺🇸', name: 'Khoá FSI Standard Chinese', d: 'Bản scan sách học + sách bài tập, giải thích bằng tiếng Anh. Chữ hơi mờ vì sách in đã lâu.', lic: 'Phạm vi công cộng · US Foreign Service Institute', c: '#1593A6', soft: '#E1F5F8' }
  },
  // tiêu đề tiếng Trung → [tên tiếng Việt, cấp truyện 1–5]
  story: {
    '我喜欢看书': ['Mình thích đọc sách', 1], '数数动物': ['Đếm con vật', 1], '感情': ['Cảm xúc', 1], '火': ['Lửa', 1],
    '很饿的鳄鱼': ['Chú cá sấu đói bụng', 1], '看看农场里的动物': ['Ngắm các con vật ở nông trại', 1], '校服': ['Đồng phục', 1],
    '头发': ['Mái tóc', 1], '两个': ['Hai', 1], '气象书': ['Sách thời tiết', 1], '贪玩的弟弟': ['Cậu em ham chơi', 1],
    '做菜': ['Nấu ăn', 1], '你在做什么？': ['Bạn đang làm gì thế?', 1], '我的小猫猫在哪儿？': ['Mèo con của mình đâu rồi?', 1],
    '我的身体': ['Cơ thể của mình', 1], '为什么河马没有毛发': ['Vì sao hà mã không có lông', 2], '蜡做的孩子': ['Những đứa trẻ bằng sáp', 2],
    '丁吉和奶牛': ['Tingi và đàn bò', 2], '卖香蕉的汤姆': ['Tom bán chuối', 2], '决定': ['Quyết định', 2], '惩罚': ['Hình phạt', 2],
    '和植物聊天的卡莱': ['Khalai trò chuyện với cây', 2], '球星安迪斯瓦': ['Ngôi sao bóng đá Andiswa', 2], '一个很高的人': ['Một người rất cao', 2],
    '赞玛很棒！': ['Zama giỏi quá!', 2], '山羊、野狗、和水牛': ['Dê, chó hoang và trâu', 2], '驴孩子': ['Đứa trẻ lừa', 3],
    '阿南西和智慧': ['Anansi và trí khôn', 3], '一粒小种子：旺加里·马塔伊的故事': ['Một hạt giống nhỏ: chuyện về Wangari Maathai', 3],
    '母鸡和老鹰': ['Gà mái và diều hâu', 3], '离家进城的那一天': ['Ngày mình rời nhà lên phố', 3], '鸡和千足虫': ['Gà và con cuốn chiếu', 3],
    '诺孜贝儿和三根头发': ['Nozibele và ba sợi tóc', 3], '萨可满的歌声': ['Tiếng hát của Sakima', 3], '福思的姐姐说了什么': ['Chị của Vusi đã nói gì', 4],
    '指蜜鸟的复仇': ['Chim dẫn mật trả thù', 4], '奶奶的香蕉': ['Chuối của bà', 4], '和奶奶一起过暑假': ['Nghỉ hè cùng bà', 4],
    '辛波薇亚': ['Simbegwire', 5], '玛格威': ['Magozwe', 5]
  },
  // giáo trình MIT: đuôi tên file → tên tiếng Việt
  mit: { ack_pfe: 'Bìa và lời nói đầu', toc: 'Mục lục', bgd: 'Bối cảnh: Trung Quốc và tiếng Trung', pinyin: 'Âm và pinyin', char_hts: 'Bảng chữ Hán bài 1–7', grid: 'Giấy ô tập viết', menu: 'Phụ lục: thực đơn món Trung' },
  // khoá FSI: mã học phần trong tên file → tên tiếng Việt
  fsi: { resourcemodule: 'Học phần nền: phát âm, số đếm, giờ giấc', '01orn': 'Học phần 1: Làm quen', '02bio': 'Học phần 2: Giới thiệu bản thân', '03mon': 'Học phần 3: Tiền bạc', '04dir': 'Học phần 4: Hỏi đường', '05trn': 'Học phần 5: Đi lại', '06mtg': 'Học phần 6: Gặp gỡ', '07hot': 'Học phần 7: Khách sạn', '08foo': 'Học phần 8: Ăn uống' }
};
