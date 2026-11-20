// Trà Sữa – Đóng vai: máy hỏi, mình trả lời (theo câu mẫu hoặc tự nói), máy chấm và sửa.
// who: vai của máy · me: vai của mình · q: câu hỏi của máy [zh, vi] · a: câu trả lời mẫu [[zh, vi], ...]
window.ROLEPLAY = [
  { id: 'r1', e: '🍼', c: '#ffe1ea', lv: 2, t: 'Mua sữa và tã cho con', who: 'Nhân viên siêu thị', me: 'Mẹ đi mua đồ cho bé', turns: [
    { q: ['您好！请问您需要什么？', 'Chào chị! Chị cần gì ạ?'], a: [['你好，我想买奶粉和纸尿裤。', 'Chào em, chị muốn mua sữa bột và tã giấy.'], ['我想给孩子买一些奶粉。', 'Chị muốn mua ít sữa bột cho con.']] },
    { q: ['孩子多大了？', 'Bé được bao nhiêu tuổi rồi ạ?'], a: [['我孩子一岁半了。', 'Con chị một tuổi rưỡi rồi.'], ['他两岁了。', 'Bé hai tuổi rồi.']] },
    { q: ['这个牌子的奶粉卖得最好，您要几罐？', 'Sữa hiệu này bán chạy nhất, chị lấy mấy hộp ạ?'], a: [['我要两罐。现在有打折吗？', 'Chị lấy hai hộp. Bây giờ có giảm giá không em?'], ['先拿一罐吧，孩子喝习惯了再买。', 'Lấy một hộp trước đã, bé uống quen rồi chị mua tiếp.']] },
    { q: ['今天买两罐打八折，还送一包湿巾。', 'Hôm nay mua hai hộp được giảm 20%, còn tặng một gói khăn ướt.'], a: [['太好了，那我买两罐。', 'Tốt quá, vậy chị lấy hai hộp.'], ['真的吗？那纸尿裤也有优惠吗？', 'Thật hả? Vậy tã giấy cũng có ưu đãi không em?']] },
    { q: ['您怎么付款？现金还是手机支付？', 'Chị thanh toán bằng gì ạ? Tiền mặt hay điện thoại?'], a: [['我用手机支付吧。', 'Chị trả bằng điện thoại nhé.'], ['我付现金。', 'Chị trả tiền mặt.']] },
  ] },
  { id: 'r2', e: '💼', c: '#dcecff', lv: 4, t: 'Phỏng vấn xin việc', who: 'Người phỏng vấn', me: 'Ứng viên', turns: [
    { q: ['你好，请先简单介绍一下你自己。', 'Chào bạn, mời bạn giới thiệu ngắn gọn về bản thân.'], a: [['您好，我叫阮氏芳，今年二十九岁，是越南人。我学过三年汉语。', 'Chào anh/chị, tôi tên là Nguyễn Thị Phương, năm nay 29 tuổi, là người Việt Nam. Tôi đã học tiếng Trung ba năm.'], ['您好，我叫阿芳，我以前做过会计工作，现在在学习汉语。', 'Chào anh/chị, tôi tên Phương, trước đây tôi từng làm kế toán, hiện đang học tiếng Trung.']] },
    { q: ['你为什么想来我们公司工作？', 'Vì sao bạn muốn làm việc ở công ty chúng tôi?'], a: [['因为贵公司发展很快，我也很想用汉语工作。', 'Vì công ty mình phát triển rất nhanh, tôi cũng rất muốn làm việc bằng tiếng Trung.'], ['我对这个工作很感兴趣，而且离我家很近。', 'Tôi rất hứng thú với công việc này, hơn nữa lại gần nhà tôi.']] },
    { q: ['我看你的简历上，有几年没有工作，能说说为什么吗？', 'Tôi thấy trong hồ sơ của bạn có mấy năm không đi làm, bạn có thể cho biết lý do không?'], a: [['那几年我在家照顾孩子，现在孩子大一点儿了，我想重新工作。', 'Mấy năm đó tôi ở nhà chăm con, bây giờ con lớn hơn một chút rồi, tôi muốn đi làm lại.'], ['我在家带孩子，同时一直在学习汉语。', 'Tôi ở nhà chăm con, đồng thời vẫn luôn học tiếng Trung.']] },
    { q: ['你觉得自己有什么优点和缺点？', 'Bạn thấy mình có ưu điểm và khuyết điểm gì?'], a: [['我的优点是做事认真、有耐心；缺点是有时候说汉语还不太流利。', 'Ưu điểm của tôi là làm việc cẩn thận, kiên nhẫn; khuyết điểm là đôi khi nói tiếng Trung chưa trôi chảy lắm.'], ['我学东西很快，但是有时候太着急。', 'Tôi học cái mới rất nhanh, nhưng đôi khi hơi nóng vội.']] },
    { q: ['如果我们录用你，你什么时候可以开始上班？', 'Nếu chúng tôi nhận bạn, khi nào bạn có thể bắt đầu đi làm?'], a: [['下个星期一就可以开始上班。', 'Thứ Hai tuần sau tôi có thể bắt đầu đi làm.'], ['我随时都可以开始。', 'Tôi có thể bắt đầu bất cứ lúc nào.']] },
  ] },
  { id: 'r3', e: '📱', c: '#fff0c7', lv: 3, t: 'Hỏi shop online khi săn sale', who: 'Chủ shop', me: 'Khách đang săn sale', turns: [
    { q: ['亲，在的！请问有什么可以帮您？', 'Dạ shop đây ạ! Chị cần shop giúp gì ạ?'], a: [['你好，这件衣服还有货吗？', 'Chào shop, cái áo này còn hàng không?'], ['请问这个双肩包现在打几折？', 'Cho hỏi cái balo này giờ giảm bao nhiêu?']] },
    { q: ['有的，您要什么颜色和尺码？', 'Còn ạ, chị lấy màu gì, size nào ạ?'], a: [['我要白色的，M号。', 'Mình lấy màu trắng, size M.'], ['我身高一米六，穿多大的合适？', 'Mình cao 1m60, mặc size nào thì vừa?']] },
    { q: ['现在下单可以打七折，还包邮。', 'Bây giờ đặt hàng được giảm 30%, còn miễn phí ship.'], a: [['太好了！大概几天能到？', 'Tuyệt quá! Khoảng mấy ngày thì tới?'], ['如果不合适可以退换吗？', 'Nếu không vừa thì có đổi trả được không?']] },
    { q: ['一般三到五天就能到。七天内可以免费退换。', 'Thường ba đến năm ngày là tới. Trong bảy ngày được đổi trả miễn phí.'], a: [['好的，那我现在就下单。', 'Được, vậy mình đặt luôn bây giờ.'], ['我再考虑一下，谢谢。', 'Mình cân nhắc thêm chút, cảm ơn shop.']] },
    { q: ['好的，收到货以后记得给我们好评哦！', 'Dạ, nhận hàng xong nhớ đánh giá tốt cho shop nha!'], a: [['没问题，质量好的话我一定给好评。', 'Không vấn đề gì, chất lượng tốt mình nhất định đánh giá tốt.'], ['好的，谢谢！', 'Được, cảm ơn shop!']] },
  ] },
  { id: 'r4', e: '🏥', c: '#d8f6ec', lv: 3, t: 'Đưa con đi khám bệnh', who: 'Bác sĩ', me: 'Mẹ đưa con đi khám', turns: [
    { q: ['孩子哪儿不舒服？', 'Bé khó chịu ở đâu?'], a: [['他从昨天晚上开始发烧，还有点儿咳嗽。', 'Bé sốt từ tối hôm qua, còn hơi ho.'], ['孩子肚子疼，不想吃饭。', 'Bé đau bụng, không muốn ăn.']] },
    { q: ['体温最高多少度？', 'Nhiệt độ cao nhất là bao nhiêu độ?'], a: [['最高三十八度五。', 'Cao nhất ba mươi tám độ rưỡi.'], ['昨天晚上三十九度。', 'Tối qua ba mươi chín độ.']] },
    { q: ['吃过什么药吗？', 'Bé đã uống thuốc gì chưa?'], a: [['吃过退烧药，但是还有点儿热。', 'Đã uống thuốc hạ sốt, nhưng vẫn còn hơi nóng.'], ['还没吃药，我想先问问医生。', 'Chưa uống thuốc, tôi muốn hỏi bác sĩ trước.']] },
    { q: ['问题不大，是感冒。这个药一天吃三次，饭后吃。', 'Không có gì nghiêm trọng, là cảm thôi. Thuốc này ngày uống ba lần, uống sau ăn.'], a: [['好的，一次吃多少？', 'Vâng, mỗi lần uống bao nhiêu ạ?'], ['谢谢医生。需要多喝水吗？', 'Cảm ơn bác sĩ. Có cần uống nhiều nước không ạ?']] },
    { q: ['多喝水，多休息，三天以后如果还发烧，再来医院。', 'Uống nhiều nước, nghỉ ngơi nhiều, ba ngày sau nếu vẫn sốt thì quay lại bệnh viện.'], a: [['好的，我知道了，谢谢您！', 'Vâng, tôi biết rồi, cảm ơn bác sĩ!'], ['明白了，麻烦您了。', 'Tôi hiểu rồi, làm phiền bác sĩ quá.']] },
  ] },
  { id: 'r5', e: '☕', c: '#ebe5ff', lv: 2, t: 'Hẹn bạn thân đi cà phê', who: 'Bạn thân (đang có bạn trai)', me: 'Chính mình', turns: [
    { q: ['好久不见！你最近怎么样？', 'Lâu quá không gặp! Dạo này cậu thế nào?'], a: [['还不错，就是带孩子有点儿累。', 'Cũng ổn, chỉ là chăm con hơi mệt.'], ['挺好的，我最近在学汉语。', 'Khá tốt, dạo này tớ đang học tiếng Trung.']] },
    { q: ['你孩子现在会说话了吗？', 'Con cậu giờ biết nói chưa?'], a: [['会说一点儿了，每天都叫“妈妈”。', 'Biết nói chút rồi, ngày nào cũng gọi “mẹ ơi”.'], ['会了，他特别喜欢唱歌。', 'Biết rồi, bé đặc biệt thích hát.']] },
    { q: ['我跟男朋友周末想去看电影，你要不要一起来？', 'Tớ với bạn trai cuối tuần định đi xem phim, cậu có muốn đi cùng không?'], a: [['我不去了，你们好好玩儿吧！', 'Tớ không đi đâu, hai người đi chơi vui nhé!'], ['周末我要带孩子，下次吧。', 'Cuối tuần tớ phải trông con, để lần sau nhé.']] },
    { q: ['那我们明天下午去喝咖啡吧？', 'Vậy chiều mai bọn mình đi uống cà phê nhé?'], a: [['好啊，几点？在哪儿见？', 'Được đó, mấy giờ? Gặp ở đâu?'], ['明天下午我有空，三点怎么样？', 'Chiều mai tớ rảnh, ba giờ được không?']] },
    { q: ['三点在学校旁边那家咖啡店见！', 'Ba giờ gặp ở quán cà phê cạnh trường nhé!'], a: [['好的，不见不散！', 'Ok, không gặp không về!'], ['没问题，明天见！', 'Không vấn đề gì, mai gặp nhé!']] },
  ] },
  { id: 'r6', e: '🍜', c: '#fff0c7', lv: 2, t: 'Gọi món ở nhà hàng', who: 'Phục vụ', me: 'Khách', turns: [
    { q: ['欢迎光临！几位？', 'Xin chào quý khách! Mấy người ạ?'], a: [['三位，两个大人，一个孩子。', 'Ba người, hai người lớn, một trẻ con.'], ['两位，有靠窗的位子吗？', 'Hai người, có chỗ cạnh cửa sổ không?']] },
    { q: ['这是菜单，您想吃点儿什么？', 'Đây là thực đơn, anh chị muốn ăn gì ạ?'], a: [['有什么推荐的菜吗？', 'Có món gì gợi ý không em?'], ['我要一个宫保鸡丁，一碗米饭。', 'Cho chị một đĩa gà xào Cung Bảo, một bát cơm.']] },
    { q: ['我们的红烧鱼很有名，要不要试试？', 'Món cá kho của quán rất nổi tiếng, anh chị có muốn thử không ạ?'], a: [['好，来一份。别太辣，孩子也要吃。', 'Được, cho một phần. Đừng cay quá, trẻ con cũng ăn.'], ['不用了，我们不太喜欢吃鱼。', 'Thôi khỏi, bọn chị không thích ăn cá lắm.']] },
    { q: ['喝点儿什么？', 'Anh chị uống gì ạ?'], a: [['来一壶茶，再要一杯橙汁。', 'Cho một ấm trà, thêm một ly nước cam.'], ['给我们三瓶水吧。', 'Cho bọn chị ba chai nước nhé.']] },
    { q: ['一共二百三十八块。', 'Tổng cộng 238 tệ.'], a: [['服务员，可以开发票吗？', 'Em ơi, có xuất hóa đơn được không?'], ['可以用微信付吗？', 'Trả bằng WeChat được không em?']] },
  ] },
  { id: 'r7', e: '🚕', c: '#d8f6ec', lv: 2, t: 'Đi taxi và hỏi đường', who: 'Tài xế taxi', me: 'Hành khách', turns: [
    { q: ['您好，去哪儿？', 'Chào chị, đi đâu ạ?'], a: [['去火车站，谢谢。', 'Đến ga tàu, cảm ơn anh.'], ['师傅，去人民医院。', 'Bác tài ơi, đến bệnh viện Nhân Dân.']] },
    { q: ['现在路上有点儿堵，可能要四十分钟。', 'Giờ đường hơi tắc, có lẽ mất bốn mươi phút.'], a: [['没关系，我不着急。', 'Không sao, tôi không vội.'], ['能不能走别的路？我五点要到。', 'Có thể đi đường khác không? Năm giờ tôi phải đến nơi.']] },
    { q: ['您是第一次来这儿吗？', 'Chị đến đây lần đầu à?'], a: [['是的，我是来旅游的。', 'Vâng, tôi đến du lịch.'], ['不是，我来过两次了。', 'Không, tôi đến hai lần rồi.']] },
    { q: ['到了，就在前面停可以吗？', 'Đến rồi, dừng ở phía trước được không chị?'], a: [['可以，就在这儿停吧。', 'Được, dừng ở đây đi.'], ['麻烦您再往前开一点儿。', 'Phiền anh chạy thêm một chút nữa.']] },
    { q: ['一共五十二块。', 'Tổng cộng năm mươi hai tệ.'], a: [['给您六十，不用找了。', 'Gửi anh sáu mươi, không cần thối.'], ['可以扫码吗？', 'Quét mã được không anh?']] },
  ] },
  { id: 'r8', e: '👋', c: '#ffe2dc', lv: 1, t: 'Làm quen bạn mới', who: 'Bạn mới quen', me: 'Chính mình', turns: [
    { q: ['你好！你叫什么名字？', 'Chào bạn! Bạn tên là gì?'], a: [['你好！我叫阿芳。', 'Chào bạn! Mình tên là Phương.'], ['我姓阮，叫阮芳。', 'Mình họ Nguyễn, tên là Nguyễn Phương.']] },
    { q: ['你是哪国人？', 'Bạn là người nước nào?'], a: [['我是越南人。', 'Mình là người Việt Nam.'], ['我是越南人，住在河内。', 'Mình là người Việt Nam, sống ở Hà Nội.']] },
    { q: ['你学汉语多长时间了？', 'Bạn học tiếng Trung bao lâu rồi?'], a: [['我学了一年多了。', 'Mình học được hơn một năm rồi.'], ['快两年了。', 'Gần hai năm rồi.']] },
    { q: ['你为什么学汉语？', 'Sao bạn lại học tiếng Trung?'], a: [['因为我想找一个更好的工作。', 'Vì mình muốn tìm một công việc tốt hơn.'], ['我想以后教我的孩子说汉语。', 'Mình muốn sau này dạy con mình nói tiếng Trung.']] },
    { q: ['很高兴认识你！我们加个微信吧？', 'Rất vui được quen bạn! Mình kết bạn WeChat nhé?'], a: [['好啊，我扫你吧。', 'Được chứ, để mình quét mã của bạn.'], ['我也很高兴认识你！', 'Mình cũng rất vui được quen bạn!']] },
  ] },
];
