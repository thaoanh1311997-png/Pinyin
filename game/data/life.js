/* Bánh Mì · Mini game — từ vựng Đời sống & Giao tiếp (soạn tay, đã soát pinyin/nghĩa).
   Mỗi từ: [chữ Hán, pinyin, nghĩa tiếng Việt, emoji] */
window.GAME_LIFE = [
 { id:'giadinh', name:'Gia đình', emo:'👨‍👩‍👧', w:[
  ['爸爸','bàba','bố','👨'],['妈妈','māma','mẹ','👩'],['爷爷','yéye','ông nội','👴'],['奶奶','nǎinai','bà nội','👵'],
  ['外公','wàigōng','ông ngoại','👴'],['外婆','wàipó','bà ngoại','👵'],['哥哥','gēge','anh trai','👦'],['姐姐','jiějie','chị gái','👧'],
  ['弟弟','dìdi','em trai','👦'],['妹妹','mèimei','em gái','👧'],['丈夫','zhàngfu','chồng','🤵'],['妻子','qīzi','vợ','👰'],
  ['儿子','érzi','con trai','👦'],['女儿','nǚ\'ér','con gái','👧'],['孩子','háizi','đứa trẻ, con','🧒'],['家人','jiārén','người nhà','👪'] ]},
 { id:'mebe', name:'Mẹ và bé', emo:'🍼', w:[
  ['宝宝','bǎobao','em bé, cục cưng','👶'],['婴儿','yīng\'ér','trẻ sơ sinh','👶'],['奶粉','nǎifěn','sữa bột','🥛'],['奶瓶','nǎipíng','bình sữa','🍼'],
  ['尿不湿','niàobùshī','bỉm, tã giấy','🧷'],['湿巾','shījīn','khăn ướt','🧻'],['奶嘴','nǎizuǐ','núm ti giả','🍼'],['玩具','wánjù','đồ chơi','🧸'],
  ['婴儿车','yīng\'érchē','xe đẩy em bé','👶'],['婴儿床','yīng\'érchuáng','cũi em bé','🛏️'],['围嘴','wéizuǐ','yếm ăn','👶'],['喂奶','wèi nǎi','cho bú','🤱'],
  ['换尿布','huàn niàobù','thay tã','🧷'],['哄睡','hǒng shuì','dỗ ngủ','😴'],['儿歌','érgē','bài hát thiếu nhi','🎵'],['幼儿园','yòu\'éryuán','trường mầm non','🏫'] ]},
 { id:'doan', name:'Đồ ăn', emo:'🍜', w:[
  ['米饭','mǐfàn','cơm','🍚'],['面条','miàntiáo','mì sợi','🍜'],['饺子','jiǎozi','sủi cảo','🥟'],['包子','bāozi','bánh bao','🥟'],
  ['面包','miànbāo','bánh mì','🍞'],['鸡蛋','jīdàn','trứng gà','🥚'],['鸡肉','jīròu','thịt gà','🍗'],['牛肉','niúròu','thịt bò','🥩'],
  ['猪肉','zhūròu','thịt lợn','🥓'],['鱼','yú','cá','🐟'],['蔬菜','shūcài','rau','🥬'],['汤','tāng','canh, súp','🥣'],
  ['蛋糕','dàngāo','bánh kem','🍰'],['米粉','mǐfěn','bún, phở (sợi gạo)','🍜'],['火锅','huǒguō','lẩu','🍲'],['冰淇淋','bīngqílín','kem (que, cốc)','🍦'] ]},
 { id:'douong', name:'Đồ uống', emo:'🧋', w:[
  ['水','shuǐ','nước','💧'],['茶','chá','trà','🍵'],['咖啡','kāfēi','cà phê','☕'],['牛奶','niúnǎi','sữa bò','🥛'],
  ['果汁','guǒzhī','nước ép trái cây','🧃'],['奶茶','nǎichá','trà sữa','🧋'],['可乐','kělè','Coca, nước ngọt có ga','🥤'],['啤酒','píjiǔ','bia','🍺'],
  ['豆浆','dòujiāng','sữa đậu nành','🥛'],['矿泉水','kuàngquánshuǐ','nước khoáng','💧'],['饮料','yǐnliào','đồ uống','🥤'],['酸奶','suānnǎi','sữa chua','🥛'] ]},
 { id:'traicay', name:'Trái cây', emo:'🍎', w:[
  ['苹果','píngguǒ','quả táo','🍎'],['香蕉','xiāngjiāo','quả chuối','🍌'],['西瓜','xīguā','dưa hấu','🍉'],['葡萄','pútao','quả nho','🍇'],
  ['橙子','chéngzi','quả cam','🍊'],['草莓','cǎoméi','dâu tây','🍓'],['芒果','mángguǒ','quả xoài','🥭'],['菠萝','bōluó','quả dứa','🍍'],
  ['桃子','táozi','quả đào','🍑'],['梨','lí','quả lê','🍐'],['樱桃','yīngtáo','quả anh đào','🍒'],['椰子','yēzi','quả dừa','🥥'] ]},
 { id:'nhacua', name:'Nhà cửa', emo:'🏠', w:[
  ['房间','fángjiān','căn phòng','🚪'],['客厅','kètīng','phòng khách','🛋️'],['厨房','chúfáng','nhà bếp','🍳'],['卧室','wòshì','phòng ngủ','🛏️'],
  ['洗手间','xǐshǒujiān','nhà vệ sinh','🚻'],['门','mén','cửa','🚪'],['窗户','chuānghu','cửa sổ','🪟'],['桌子','zhuōzi','cái bàn','🪑'],
  ['椅子','yǐzi','cái ghế','🪑'],['沙发','shāfā','ghế sô pha','🛋️'],['床','chuáng','cái giường','🛏️'],['冰箱','bīngxiāng','tủ lạnh','🧊'],
  ['电视','diànshì','ti vi','📺'],['空调','kōngtiáo','điều hòa','❄️'],['灯','dēng','đèn','💡'],['钥匙','yàoshi','chìa khóa','🔑'] ]},
 { id:'dodung', name:'Đồ dùng', emo:'🧴', w:[
  ['杯子','bēizi','cái cốc','🥤'],['碗','wǎn','cái bát','🥣'],['盘子','pánzi','cái đĩa','🍽️'],['筷子','kuàizi','đôi đũa','🥢'],
  ['勺子','sháozi','cái thìa','🥄'],['刀','dāo','con dao','🔪'],['牙刷','yáshuā','bàn chải đánh răng','🪥'],['牙膏','yágāo','kem đánh răng','🦷'],
  ['毛巾','máojīn','khăn mặt, khăn tắm','🧻'],['镜子','jìngzi','cái gương','🪞'],['伞','sǎn','cái ô','☂️'],['手机','shǒujī','điện thoại di động','📱'],
  ['钱包','qiánbāo','cái ví','👛'],['眼镜','yǎnjìng','kính mắt','👓'],['手表','shǒubiǎo','đồng hồ đeo tay','⌚'],['书包','shūbāo','cặp sách','🎒'] ]},
 { id:'quanao', name:'Quần áo', emo:'👗', w:[
  ['衣服','yīfu','quần áo','👕'],['裤子','kùzi','cái quần','👖'],['裙子','qúnzi','cái váy','👗'],['衬衫','chènshān','áo sơ mi','👔'],
  ['T恤','T xù','áo phông','👕'],['外套','wàitào','áo khoác','🧥'],['鞋','xié','giày','👟'],['袜子','wàzi','tất, vớ','🧦'],
  ['帽子','màozi','cái mũ','🧢'],['围巾','wéijīn','khăn quàng cổ','🧣'],['手套','shǒutào','găng tay','🧤'],['睡衣','shuìyī','đồ ngủ','🛌'] ]},
 { id:'muasam', name:'Mua sắm', emo:'🛍️', w:[
  ['买','mǎi','mua','🛍️'],['卖','mài','bán','🏪'],['钱','qián','tiền','💰'],['块','kuài','đồng (tiền, khẩu ngữ)','💴'],
  ['便宜','piányi','rẻ','👍'],['贵','guì','đắt','💸'],['打折','dǎ zhé','giảm giá','🏷️'],['超市','chāoshì','siêu thị','🛒'],
  ['商店','shāngdiàn','cửa hàng','🏪'],['价格','jiàgé','giá cả','🏷️'],['付钱','fù qián','trả tiền','💳'],['购物车','gòuwùchē','xe đẩy mua hàng','🛒'],
  ['网购','wǎnggòu','mua hàng online','💻'],['快递','kuàidì','chuyển phát nhanh','📦'],['退货','tuì huò','trả hàng','↩️'],['包装','bāozhuāng','bao bì, đóng gói','📦'] ]},
 { id:'cothe', name:'Cơ thể', emo:'🙋', w:[
  ['头','tóu','cái đầu','🙂'],['头发','tóufa','tóc','💇'],['眼睛','yǎnjing','mắt','👀'],['耳朵','ěrduo','tai','👂'],
  ['鼻子','bízi','mũi','👃'],['嘴','zuǐ','miệng','👄'],['牙','yá','răng','🦷'],['脸','liǎn','khuôn mặt','😊'],
  ['手','shǒu','tay','✋'],['脚','jiǎo','bàn chân','🦶'],['腿','tuǐ','chân (cẳng chân)','🦵'],['肚子','dùzi','bụng','🤰'] ]},
 { id:'mausac', name:'Màu sắc', emo:'🎨', w:[
  ['红色','hóngsè','màu đỏ','🟥'],['黄色','huángsè','màu vàng','🟨'],['蓝色','lánsè','màu xanh lam','🟦'],['绿色','lǜsè','màu xanh lá','🟩'],
  ['白色','báisè','màu trắng','⬜'],['黑色','hēisè','màu đen','⬛'],['粉色','fěnsè','màu hồng','🩷'],['紫色','zǐsè','màu tím','🟪'],
  ['橙色','chéngsè','màu cam','🟧'],['灰色','huīsè','màu xám','🩶'],['棕色','zōngsè','màu nâu','🟫'],['颜色','yánsè','màu sắc','🎨'] ]},
 { id:'convat', name:'Con vật', emo:'🐼', w:[
  ['猫','māo','con mèo','🐱'],['狗','gǒu','con chó','🐶'],['鸟','niǎo','con chim','🐦'],['鱼','yú','con cá','🐟'],
  ['熊猫','xióngmāo','gấu trúc','🐼'],['老虎','lǎohǔ','con hổ','🐯'],['兔子','tùzi','con thỏ','🐰'],['猴子','hóuzi','con khỉ','🐵'],
  ['大象','dàxiàng','con voi','🐘'],['马','mǎ','con ngựa','🐴'],['牛','niú','con bò','🐮'],['猪','zhū','con lợn','🐷'],
  ['鸡','jī','con gà','🐔'],['鸭子','yāzi','con vịt','🦆'],['羊','yáng','con dê, con cừu','🐑'],['老鼠','lǎoshǔ','con chuột','🐭'] ]},
 { id:'xecoc', name:'Đi lại', emo:'🚌', w:[
  ['汽车','qìchē','ô tô','🚗'],['公共汽车','gōnggòng qìchē','xe buýt','🚌'],['出租车','chūzūchē','taxi','🚕'],['自行车','zìxíngchē','xe đạp','🚲'],
  ['摩托车','mótuōchē','xe máy','🛵'],['火车','huǒchē','tàu hỏa','🚆'],['地铁','dìtiě','tàu điện ngầm','🚇'],['飞机','fēijī','máy bay','✈️'],
  ['船','chuán','thuyền','🚢'],['红绿灯','hónglǜdēng','đèn giao thông','🚦'],['马路','mǎlù','đường cái','🛣️'],['车站','chēzhàn','bến xe, nhà ga','🚏'] ]},
 { id:'noichon', name:'Nơi chốn', emo:'🏙️', w:[
  ['学校','xuéxiào','trường học','🏫'],['医院','yīyuàn','bệnh viện','🏥'],['银行','yínháng','ngân hàng','🏦'],['超市','chāoshì','siêu thị','🛒'],
  ['饭店','fàndiàn','nhà hàng','🍽️'],['公园','gōngyuán','công viên','🌳'],['图书馆','túshūguǎn','thư viện','📚'],['机场','jīchǎng','sân bay','🛫'],
  ['公司','gōngsī','công ty','🏢'],['邮局','yóujú','bưu điện','🏤'],['药店','yàodiàn','hiệu thuốc','💊'],['咖啡馆','kāfēiguǎn','quán cà phê','☕'] ]},
 { id:'nghe', name:'Nghề nghiệp', emo:'👩‍🏫', w:[
  ['老师','lǎoshī','giáo viên','👩‍🏫'],['学生','xuésheng','học sinh','🧑‍🎓'],['医生','yīshēng','bác sĩ','👨‍⚕️'],['护士','hùshi','y tá','👩‍⚕️'],
  ['司机','sījī','tài xế','🚖'],['警察','jǐngchá','cảnh sát','👮'],['厨师','chúshī','đầu bếp','👨‍🍳'],['服务员','fúwùyuán','nhân viên phục vụ','💁'],
  ['经理','jīnglǐ','giám đốc, quản lý','💼'],['律师','lǜshī','luật sư','⚖️'],['工程师','gōngchéngshī','kỹ sư','👷'],['翻译','fānyì','phiên dịch viên','🗣️'] ]},
 { id:'thoitiet', name:'Thời tiết & mùa', emo:'⛅', w:[
  ['天气','tiānqì','thời tiết','⛅'],['晴天','qíngtiān','trời nắng','☀️'],['阴天','yīntiān','trời râm','☁️'],['下雨','xià yǔ','mưa','🌧️'],
  ['下雪','xià xuě','tuyết rơi','🌨️'],['刮风','guā fēng','nổi gió','🌬️'],['热','rè','nóng','🥵'],['冷','lěng','lạnh','🥶'],
  ['春天','chūntiān','mùa xuân','🌸'],['夏天','xiàtiān','mùa hè','🌞'],['秋天','qiūtiān','mùa thu','🍁'],['冬天','dōngtiān','mùa đông','⛄'] ]},
 { id:'thoigian', name:'Số & thời gian', emo:'⏰', w:[
  ['今天','jīntiān','hôm nay','📅'],['明天','míngtiān','ngày mai','📅'],['昨天','zuótiān','hôm qua','📅'],['早上','zǎoshang','buổi sáng','🌅'],
  ['中午','zhōngwǔ','buổi trưa','🕛'],['晚上','wǎnshang','buổi tối','🌙'],['星期','xīngqī','tuần, thứ','🗓️'],['周末','zhōumò','cuối tuần','🎉'],
  ['小时','xiǎoshí','tiếng (giờ)','⏳'],['分钟','fēnzhōng','phút','⏱️'],['一百','yìbǎi','một trăm','💯'],['一千','yìqiān','một nghìn','🔢'] ]}
];

window.GAME_TALK = [
 { id:'chao', name:'Chào hỏi', emo:'👋', w:[
  ['你好','nǐ hǎo','xin chào','👋'],['您好','nín hǎo','chào ông/bà (lịch sự)','🙇'],['早上好','zǎoshang hǎo','chào buổi sáng','🌅'],['晚上好','wǎnshang hǎo','chào buổi tối','🌙'],
  ['晚安','wǎn\'ān','chúc ngủ ngon','😴'],['再见','zàijiàn','tạm biệt','👋'],['明天见','míngtiān jiàn','mai gặp lại','📅'],['好久不见','hǎojiǔ bú jiàn','lâu rồi không gặp','🤗'],
  ['你好吗','nǐ hǎo ma','bạn khỏe không?','🙂'],['我很好','wǒ hěn hǎo','tôi rất khỏe','😊'],['欢迎','huānyíng','chào mừng','🎊'],['认识你很高兴','rènshi nǐ hěn gāoxìng','rất vui được quen bạn','🤝'] ]},
 { id:'camon', name:'Cảm ơn & xin lỗi', emo:'🙏', w:[
  ['谢谢','xièxie','cảm ơn','🙏'],['非常感谢','fēicháng gǎnxiè','vô cùng cảm ơn','💐'],['不客气','bú kèqi','không có gì','😊'],['不用谢','búyòng xiè','không cần cảm ơn','🙂'],
  ['对不起','duìbuqǐ','xin lỗi','🙇'],['不好意思','bù hǎoyìsi','ngại quá, xin lỗi','😅'],['没关系','méi guānxi','không sao đâu','👌'],['没事儿','méi shìr','không sao','👌'],
  ['麻烦你了','máfan nǐ le','làm phiền bạn rồi','🙏'],['辛苦了','xīnkǔ le','vất vả rồi','💪'] ]},
 { id:'hoithan', name:'Làm quen', emo:'🤝', w:[
  ['你叫什么名字','nǐ jiào shénme míngzi','bạn tên là gì?','📛'],['我叫……','wǒ jiào……','tôi tên là…','🙋'],['你是哪国人','nǐ shì nǎ guó rén','bạn là người nước nào?','🌏'],['我是越南人','wǒ shì Yuènán rén','tôi là người Việt Nam','🇻🇳'],
  ['你多大了','nǐ duō dà le','bạn bao nhiêu tuổi?','🎂'],['你做什么工作','nǐ zuò shénme gōngzuò','bạn làm nghề gì?','💼'],['你住在哪儿','nǐ zhù zài nǎr','bạn sống ở đâu?','🏠'],['你有孩子吗','nǐ yǒu háizi ma','bạn có con chưa?','👶'],
  ['你结婚了吗','nǐ jié hūn le ma','bạn kết hôn chưa?','💍'],['我会说一点儿汉语','wǒ huì shuō yìdiǎnr Hànyǔ','tôi biết nói một chút tiếng Trung','🗣️'] ]},
 { id:'muaban', name:'Mua bán, trả giá', emo:'🏷️', w:[
  ['多少钱','duōshao qián','bao nhiêu tiền?','💰'],['太贵了','tài guì le','đắt quá','😱'],['便宜一点儿吧','piányi yìdiǎnr ba','rẻ chút đi','🙏'],['能打折吗','néng dǎ zhé ma','giảm giá được không?','🏷️'],
  ['我要这个','wǒ yào zhège','tôi lấy cái này','👉'],['有别的颜色吗','yǒu biéde yánsè ma','có màu khác không?','🎨'],['可以试试吗','kěyǐ shìshi ma','mặc thử được không?','👗'],['可以刷卡吗','kěyǐ shuā kǎ ma','quẹt thẻ được không?','💳'],
  ['我只是看看','wǒ zhǐshì kànkan','tôi chỉ xem thôi','👀'],['有优惠吗','yǒu yōuhuì ma','có ưu đãi không?','🎁'] ]},
 { id:'goimon', name:'Gọi món', emo:'🍽️', w:[
  ['服务员','fúwùyuán','phục vụ ơi!','💁'],['请给我菜单','qǐng gěi wǒ càidān','cho tôi xem thực đơn','📋'],['我要一杯奶茶','wǒ yào yì bēi nǎichá','tôi muốn một cốc trà sữa','🧋'],['少放辣','shǎo fàng là','cho ít cay','🌶️'],
  ['不要冰','bú yào bīng','không lấy đá','🧊'],['买单','mǎi dān','tính tiền','🧾'],['打包','dǎ bāo','gói mang về','🥡'],['好吃','hǎochī','ngon','😋'],
  ['我饿了','wǒ è le','tôi đói rồi','🤤'],['我吃饱了','wǒ chī bǎo le','tôi ăn no rồi','😌'] ]},
 { id:'hoiduong', name:'Hỏi đường', emo:'🧭', w:[
  ['请问','qǐngwèn','xin hỏi','🙋'],['……在哪儿','……zài nǎr','… ở đâu?','📍'],['怎么走','zěnme zǒu','đi thế nào?','🧭'],['一直走','yìzhí zǒu','đi thẳng','⬆️'],
  ['往左拐','wǎng zuǒ guǎi','rẽ trái','⬅️'],['往右拐','wǎng yòu guǎi','rẽ phải','➡️'],['远不远','yuǎn bu yuǎn','có xa không?','📏'],['就在前面','jiù zài qiánmiàn','ở ngay phía trước','👉'],
  ['洗手间在哪儿','xǐshǒujiān zài nǎr','nhà vệ sinh ở đâu?','🚻'],['我迷路了','wǒ mí lù le','tôi bị lạc đường rồi','😵'] ]},
 { id:'suckhoe', name:'Sức khỏe', emo:'💊', w:[
  ['我不舒服','wǒ bù shūfu','tôi thấy không khỏe','🤒'],['我头疼','wǒ tóu téng','tôi đau đầu','🤕'],['我发烧了','wǒ fā shāo le','tôi bị sốt rồi','🌡️'],['我感冒了','wǒ gǎnmào le','tôi bị cảm rồi','🤧'],
  ['多喝水','duō hē shuǐ','uống nhiều nước vào','💧'],['好好休息','hǎohǎo xiūxi','nghỉ ngơi cho tốt','🛌'],['去看医生','qù kàn yīshēng','đi khám bác sĩ','👨‍⚕️'],['早日康复','zǎorì kāngfù','chúc mau khỏe','💐'] ]},
 { id:'camxuc', name:'Cảm xúc & lời chúc', emo:'🥳', w:[
  ['太好了','tài hǎo le','tuyệt quá','🥳'],['真的吗','zhēn de ma','thật à?','😮'],['加油','jiāyóu','cố lên','💪'],['没问题','méi wèntí','không vấn đề gì','👌'],
  ['我同意','wǒ tóngyì','tôi đồng ý','👍'],['我不知道','wǒ bù zhīdào','tôi không biết','🤷'],['我明白了','wǒ míngbai le','tôi hiểu rồi','💡'],['请再说一遍','qǐng zài shuō yí biàn','xin nói lại một lần','🔁'],
  ['生日快乐','shēngrì kuàilè','chúc mừng sinh nhật','🎂'],['新年快乐','xīnnián kuàilè','chúc mừng năm mới','🧧'],['祝你好运','zhù nǐ hǎo yùn','chúc bạn may mắn','🍀'],['我爱你','wǒ ài nǐ','anh yêu em, em yêu anh','❤️'] ]}
];
