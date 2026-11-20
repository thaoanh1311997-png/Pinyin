/* Bánh Mì · Dạo phố — câu mô tả đồ vật, hội thoại với nhân vật, câu chuyện nhiều bước (soạn tay).
   Câu: [chữ Hán, pinyin, tiếng Việt]. Hội thoại: ['a', ...] = nhân vật nói, ['b', ...] = mình (Bánh Mì) nói,
   ['?', [[chữ, pinyin, nghĩa, 1 = câu đúng / 0 = câu không hợp], ...]] = mình chọn câu để trả lời. */

window.GAME_DESC = {
 pho: {
  '红绿灯': ['红灯停，绿灯行。', 'Hóngdēng tíng, lǜdēng xíng.', 'Đèn đỏ thì dừng, đèn xanh thì đi.'],
  '公共汽车': ['这辆公共汽车去市中心。', 'Zhè liàng gōnggòng qìchē qù shì zhōngxīn.', 'Chiếc xe buýt này đi vào trung tâm thành phố.'],
  '出租车': ['这辆出租车是黄色的。', 'Zhè liàng chūzūchē shì huángsè de.', 'Chiếc taxi này màu vàng.'],
  '汽车': ['路上的汽车很多。', 'Lù shang de qìchē hěn duō.', 'Trên đường có rất nhiều ô tô.'],
  '摩托车': ['越南人很喜欢骑摩托车。', 'Yuènán rén hěn xǐhuan qí mótuōchē.', 'Người Việt Nam rất thích đi xe máy.'],
  '自行车': ['我每天骑自行车去买菜。', 'Wǒ měi tiān qí zìxíngchē qù mǎi cài.', 'Ngày nào tôi cũng đạp xe đi chợ mua thức ăn.'],
  '树': ['路边有一棵大树。', 'Lù biān yǒu yì kē dà shù.', 'Bên đường có một cái cây to.'],
  '狗': ['这只小狗很可爱。', 'Zhè zhī xiǎo gǒu hěn kě\'ài.', 'Chú chó nhỏ này rất đáng yêu.'],
  '路灯': ['晚上路灯亮了。', 'Wǎnshang lùdēng liàng le.', 'Buổi tối đèn đường sáng lên rồi.'],
  '垃圾桶': ['请把垃圾扔进垃圾桶。', 'Qǐng bǎ lājī rēng jìn lājītǒng.', 'Hãy vứt rác vào thùng rác.'],
  '太阳': ['今天太阳很大，天气很热。', 'Jīntiān tàiyáng hěn dà, tiānqì hěn rè.', 'Hôm nay nắng to, trời rất nóng.'],
  '云': ['天上有很多白云。', 'Tiān shang yǒu hěn duō báiyún.', 'Trên trời có rất nhiều mây trắng.'],
  '阿姨': ['张阿姨是我的邻居，她很热情。', 'Zhāng āyí shì wǒ de línjū, tā hěn rèqíng.', 'Cô Trương là hàng xóm của tôi, cô ấy rất nhiệt tình.']
 },
 nha: {
  '窗户': ['窗户开着，风吹进来了。', 'Chuānghu kāizhe, fēng chuī jìnlai le.', 'Cửa sổ đang mở, gió thổi vào rồi.'],
  '钟': ['墙上挂着一个钟。', 'Qiáng shang guàzhe yí ge zhōng.', 'Trên tường treo một chiếc đồng hồ.'],
  '画': ['墙上挂着一幅画，这幅画很漂亮。', 'Qiáng shang guàzhe yì fú huà, zhè fú huà hěn piàoliang.', 'Trên tường treo một bức tranh, bức tranh này rất đẹp.'],
  '空调': ['天气太热了，我们开空调吧。', 'Tiānqì tài rè le, wǒmen kāi kōngtiáo ba.', 'Trời nóng quá, mình bật điều hòa đi.'],
  '沙发': ['沙发很舒服，我常常坐在这儿看电视。', 'Shāfā hěn shūfu, wǒ chángcháng zuò zài zhèr kàn diànshì.', 'Ghế sô pha rất êm, tôi thường ngồi đây xem ti vi.'],
  '电视': ['宝宝喜欢看电视里的动画片。', 'Bǎobao xǐhuan kàn diànshì li de dònghuàpiàn.', 'Bé thích xem phim hoạt hình trên ti vi.'],
  '桌子': ['桌子上有一杯茶。', 'Zhuōzi shang yǒu yì bēi chá.', 'Trên bàn có một cốc trà.'],
  '茶': ['这杯茶还很热，小心喝。', 'Zhè bēi chá hái hěn rè, xiǎoxīn hē.', 'Cốc trà này còn nóng lắm, uống cẩn thận nhé.'],
  '台灯': ['台灯放在沙发旁边。', 'Táidēng fàng zài shāfā pángbiān.', 'Cái đèn đặt bên cạnh ghế sô pha.'],
  '猫': ['小猫在地上睡觉。', 'Xiǎo māo zài dì shang shuì jiào.', 'Con mèo nhỏ đang ngủ trên sàn nhà.'],
  '书': ['这些书都是我的。', 'Zhèxiē shū dōu shì wǒ de.', 'Những quyển sách này đều là của tôi.'],
  '花': ['这束花是我老公送给我的。', 'Zhè shù huā shì wǒ lǎogōng sòng gěi wǒ de.', 'Bó hoa này là chồng tôi tặng tôi.'],
  '老公': ['我老公很会做饭。', 'Wǒ lǎogōng hěn huì zuò fàn.', 'Chồng tôi nấu ăn rất giỏi.']
 },
 bep: {
  '冰箱': ['冰箱里有牛奶和水果。', 'Bīngxiāng li yǒu niúnǎi hé shuǐguǒ.', 'Trong tủ lạnh có sữa và hoa quả.'],
  '微波炉': ['用微波炉热一下饭吧。', 'Yòng wēibōlú rè yíxià fàn ba.', 'Dùng lò vi sóng hâm nóng cơm một chút đi.'],
  '茶壶': ['茶壶里有热水。', 'Cháhú li yǒu rè shuǐ.', 'Trong ấm có nước nóng.'],
  '锅': ['我用这个锅煮汤。', 'Wǒ yòng zhège guō zhǔ tāng.', 'Tôi dùng cái nồi này để nấu canh.'],
  '碗': ['桌子上有三个碗。', 'Zhuōzi shang yǒu sān ge wǎn.', 'Trên bàn có ba cái bát.'],
  '筷子': ['中国人吃饭用筷子。', 'Zhōngguó rén chī fàn yòng kuàizi.', 'Người Trung Quốc ăn cơm bằng đũa.'],
  '勺子': ['宝宝用勺子喝汤。', 'Bǎobao yòng sháozi hē tāng.', 'Bé dùng thìa để ăn canh.'],
  '盘子': ['盘子里有很多菜。', 'Pánzi li yǒu hěn duō cài.', 'Trong đĩa có rất nhiều thức ăn.'],
  '鸡蛋': ['早上我吃了两个鸡蛋。', 'Zǎoshang wǒ chī le liǎng ge jīdàn.', 'Sáng nay tôi đã ăn hai quả trứng.'],
  '米饭': ['米饭做好了，快来吃吧！', 'Mǐfàn zuò hǎo le, kuài lái chī ba!', 'Cơm chín rồi, mau lại ăn đi!'],
  '面包': ['这个面包很香。', 'Zhège miànbāo hěn xiāng.', 'Cái bánh mì này rất thơm.'],
  '苹果': ['这个苹果又大又红。', 'Zhège píngguǒ yòu dà yòu hóng.', 'Quả táo này vừa to vừa đỏ.'],
  '婆婆': ['婆婆每天帮我照顾宝宝。', 'Pópo měi tiān bāng wǒ zhàogù bǎobao.', 'Mẹ chồng ngày nào cũng giúp tôi trông bé.']
 },
 phongngu: {
  '床': ['床很大，也很软。', 'Chuáng hěn dà, yě hěn ruǎn.', 'Cái giường rất to, cũng rất mềm.'],
  '枕头': ['枕头放在床上。', 'Zhěntou fàng zài chuáng shang.', 'Cái gối đặt trên giường.'],
  '衣柜': ['衣柜里有很多衣服。', 'Yīguì li yǒu hěn duō yīfu.', 'Trong tủ có rất nhiều quần áo.'],
  '窗户': ['早上我打开窗户。', 'Zǎoshang wǒ dǎkāi chuānghu.', 'Buổi sáng tôi mở cửa sổ.'],
  '镜子': ['我每天照镜子化妆。', 'Wǒ měi tiān zhào jìngzi huàzhuāng.', 'Ngày nào tôi cũng soi gương trang điểm.'],
  '闹钟': ['闹钟六点响了，该起床了。', 'Nàozhōng liù diǎn xiǎng le, gāi qǐ chuáng le.', 'Đồng hồ báo thức reo lúc sáu giờ, đến giờ dậy rồi.'],
  '手机': ['我的手机没电了。', 'Wǒ de shǒujī méi diàn le.', 'Điện thoại của tôi hết pin rồi.'],
  '衣服': ['这件衣服是新买的。', 'Zhè jiàn yīfu shì xīn mǎi de.', 'Cái áo này mới mua.'],
  '拖鞋': ['我的拖鞋在床旁边。', 'Wǒ de tuōxié zài chuáng pángbiān.', 'Dép lê của tôi ở cạnh giường.'],
  '眼镜': ['我的眼镜在哪儿？', 'Wǒ de yǎnjìng zài nǎr?', 'Kính của tôi đâu rồi nhỉ?'],
  '书包': ['书包里有书和本子。', 'Shūbāo li yǒu shū hé běnzi.', 'Trong cặp có sách và vở.']
 },
 tam: {
  '镜子': ['镜子很干净。', 'Jìngzi hěn gānjìng.', 'Cái gương rất sạch.'],
  '淋浴': ['我喜欢用热水洗澡。', 'Wǒ xǐhuan yòng rè shuǐ xǐ zǎo.', 'Tôi thích tắm bằng nước nóng.'],
  '浴缸': ['宝宝在浴缸里玩水。', 'Bǎobao zài yùgāng li wán shuǐ.', 'Bé đang nghịch nước trong bồn tắm.'],
  '马桶': ['用完马桶要冲水。', 'Yòng wán mǎtǒng yào chōng shuǐ.', 'Dùng bồn cầu xong phải xả nước.'],
  '洗衣机': ['洗衣机在洗衣服。', 'Xǐyījī zài xǐ yīfu.', 'Máy giặt đang giặt quần áo.'],
  '毛巾': ['这条毛巾很软。', 'Zhè tiáo máojīn hěn ruǎn.', 'Cái khăn này rất mềm.'],
  '牙刷': ['早上和晚上都要刷牙。', 'Zǎoshang hé wǎnshang dōu yào shuā yá.', 'Buổi sáng và buổi tối đều phải đánh răng.'],
  '牙膏': ['牙膏快用完了，要买新的。', 'Yágāo kuài yòng wán le, yào mǎi xīn de.', 'Kem đánh răng sắp hết rồi, phải mua tuýp mới.'],
  '肥皂': ['吃饭以前要用肥皂洗手。', 'Chī fàn yǐqián yào yòng féizào xǐ shǒu.', 'Trước khi ăn phải rửa tay bằng xà phòng.'],
  '洗发水': ['这瓶洗发水很香。', 'Zhè píng xǐfàshuǐ hěn xiāng.', 'Chai dầu gội này rất thơm.'],
  '卫生纸': ['卫生纸放在马桶旁边。', 'Wèishēngzhǐ fàng zài mǎtǒng pángbiān.', 'Giấy vệ sinh để cạnh bồn cầu.']
 },
 phongbe: {
  '婴儿床': ['宝宝在婴儿床里睡觉。', 'Bǎobao zài yīng\'érchuáng li shuì jiào.', 'Bé đang ngủ trong cũi.'],
  '宝宝': ['宝宝笑了，真可爱！', 'Bǎobao xiào le, zhēn kě\'ài!', 'Bé cười rồi, đáng yêu quá!'],
  '奶瓶': ['奶瓶要每天洗干净。', 'Nǎipíng yào měi tiān xǐ gānjìng.', 'Bình sữa phải rửa sạch mỗi ngày.'],
  '奶粉': ['奶粉快吃完了，明天去超市买。', 'Nǎifěn kuài chī wán le, míngtiān qù chāoshì mǎi.', 'Sữa bột sắp hết rồi, mai đi siêu thị mua.'],
  '尿不湿': ['宝宝的尿不湿该换了。', 'Bǎobao de niàobùshī gāi huàn le.', 'Đến lúc thay bỉm cho bé rồi.'],
  '湿巾': ['用湿巾给宝宝擦擦手。', 'Yòng shījīn gěi bǎobao cāca shǒu.', 'Dùng khăn ướt lau tay cho bé.'],
  '玩具熊': ['这只玩具熊是宝宝最喜欢的。', 'Zhè zhī wánjù xióng shì bǎobao zuì xǐhuan de.', 'Con gấu bông này là thứ bé thích nhất.'],
  '积木': ['宝宝在玩积木。', 'Bǎobao zài wán jīmù.', 'Bé đang chơi xếp hình.'],
  '小鸭子': ['小鸭子是黄色的。', 'Xiǎo yāzi shì huángsè de.', 'Chú vịt con màu vàng.'],
  '气球': ['红色的气球飞起来了。', 'Hóngsè de qìqiú fēi qǐlai le.', 'Quả bóng bay màu đỏ bay lên rồi.'],
  '婴儿车': ['我推着婴儿车带宝宝去公园。', 'Wǒ tuīzhe yīng\'érchē dài bǎobao qù gōngyuán.', 'Tôi đẩy xe đưa bé đi công viên.'],
  '月亮': ['月亮出来了，宝宝该睡觉了。', 'Yuèliang chūlai le, bǎobao gāi shuì jiào le.', 'Trăng lên rồi, bé đến giờ ngủ rồi.']
 },
 sieuthi: {
  '香蕉': ['香蕉三块钱一斤。', 'Xiāngjiāo sān kuài qián yì jīn.', 'Chuối ba tệ một cân (nửa ký).'],
  '西瓜': ['夏天的西瓜又甜又便宜。', 'Xiàtiān de xīguā yòu tián yòu piányi.', 'Dưa hấu mùa hè vừa ngọt vừa rẻ.'],
  '葡萄': ['这些葡萄很新鲜。', 'Zhèxiē pútao hěn xīnxiān.', 'Chỗ nho này rất tươi.'],
  '牛奶': ['这种牛奶买一送一。', 'Zhè zhǒng niúnǎi mǎi yī sòng yī.', 'Loại sữa này mua một tặng một.'],
  '饮料': ['饮料在那边。', 'Yǐnliào zài nàbian.', 'Đồ uống ở đằng kia.'],
  '奶粉': ['这种奶粉今天打八折。', 'Zhè zhǒng nǎifěn jīntiān dǎ bā zhé.', 'Loại sữa bột này hôm nay giảm 20%.'],
  '尿不湿': ['尿不湿买两包更便宜。', 'Niàobùshī mǎi liǎng bāo gèng piányi.', 'Bỉm mua hai bịch thì rẻ hơn.'],
  '零食': ['别买太多零食。', 'Bié mǎi tài duō língshí.', 'Đừng mua nhiều đồ ăn vặt quá.'],
  '蔬菜': ['多吃蔬菜对身体好。', 'Duō chī shūcài duì shēntǐ hǎo.', 'Ăn nhiều rau tốt cho sức khỏe.'],
  '打折': ['今天很多东西都打折。', 'Jīntiān hěn duō dōngxi dōu dǎ zhé.', 'Hôm nay rất nhiều đồ đều giảm giá.'],
  '购物车': ['购物车里已经满了。', 'Gòuwùchē li yǐjīng mǎn le.', 'Xe đẩy đã đầy rồi.'],
  '收银台': ['请到收银台付钱。', 'Qǐng dào shōuyíntái fù qián.', 'Mời ra quầy thu ngân thanh toán.'],
  '售货员': ['售货员很热情。', 'Shòuhuòyuán hěn rèqíng.', 'Nhân viên bán hàng rất nhiệt tình.']
 },
 truong: {
  '黑板': ['老师在黑板上写字。', 'Lǎoshī zài hēibǎn shang xiě zì.', 'Cô giáo đang viết chữ lên bảng.'],
  '老师': ['王老师教我们汉语。', 'Wáng lǎoshī jiāo wǒmen Hànyǔ.', 'Cô Vương dạy chúng tôi tiếng Trung.'],
  '地图': ['墙上有一张中国地图。', 'Qiáng shang yǒu yì zhāng Zhōngguó dìtú.', 'Trên tường có một tấm bản đồ Trung Quốc.'],
  '钟': ['现在八点，要上课了。', 'Xiànzài bā diǎn, yào shàng kè le.', 'Bây giờ là tám giờ, sắp vào học rồi.'],
  '学生': ['这个学生很努力。', 'Zhège xuésheng hěn nǔlì.', 'Bạn học sinh này rất chăm chỉ.'],
  '桌子': ['桌子上有一台电脑。', 'Zhuōzi shang yǒu yì tái diànnǎo.', 'Trên bàn có một chiếc máy tính.'],
  '椅子': ['请坐在椅子上。', 'Qǐng zuò zài yǐzi shang.', 'Mời ngồi xuống ghế.'],
  '电脑': ['我用电脑学汉语。', 'Wǒ yòng diànnǎo xué Hànyǔ.', 'Tôi học tiếng Trung bằng máy tính.'],
  '书': ['请打开书，看第十页。', 'Qǐng dǎkāi shū, kàn dì-shí yè.', 'Mời mở sách, xem trang mười.'],
  '铅笔': ['我借你一支铅笔。', 'Wǒ jiè nǐ yì zhī qiānbǐ.', 'Tôi cho bạn mượn một cây bút chì.'],
  '橡皮': ['写错了，用橡皮擦一擦。', 'Xiě cuò le, yòng xiàngpí cā yi cā.', 'Viết sai rồi, lấy tẩy xóa đi.'],
  '尺子': ['这把尺子很长。', 'Zhè bǎ chǐzi hěn cháng.', 'Cái thước này rất dài.'],
  '书包': ['我的书包是红色的。', 'Wǒ de shūbāo shì hóngsè de.', 'Cặp sách của tôi màu đỏ.'],
  '同学': ['小美是我的同学，也是我的好朋友。', 'Xiǎoměi shì wǒ de tóngxué, yě shì wǒ de hǎo péngyou.', 'Tiểu Mỹ là bạn cùng lớp, cũng là bạn thân của tôi.']
 },
 benhvien: {
  '医生': ['李医生是一位好医生。', 'Lǐ yīshēng shì yí wèi hǎo yīshēng.', 'Bác sĩ Lý là một bác sĩ giỏi.'],
  '护士': ['护士很热情。', 'Hùshi hěn rèqíng.', 'Cô y tá rất nhiệt tình.'],
  '病床': ['病人躺在病床上。', 'Bìngrén tǎng zài bìngchuáng shang.', 'Bệnh nhân nằm trên giường bệnh.'],
  '病人': ['他发烧了，很不舒服。', 'Tā fā shāo le, hěn bù shūfu.', 'Anh ấy bị sốt, rất khó chịu.'],
  '药': ['这种药一天吃三次。', 'Zhè zhǒng yào yì tiān chī sān cì.', 'Thuốc này một ngày uống ba lần.'],
  '体温计': ['用体温计量一下体温。', 'Yòng tǐwēnjì liáng yíxià tǐwēn.', 'Dùng nhiệt kế đo nhiệt độ cơ thể một chút.'],
  '口罩': ['感冒了要戴口罩。', 'Gǎnmào le yào dài kǒuzhào.', 'Bị cảm thì phải đeo khẩu trang.'],
  '打针': ['宝宝怕打针。', 'Bǎobao pà dǎ zhēn.', 'Bé sợ tiêm.'],
  '救护车': ['救护车开得很快。', 'Jiùhùchē kāi de hěn kuài.', 'Xe cứu thương chạy rất nhanh.'],
  '窗户': ['医院的窗户很大。', 'Yīyuàn de chuānghu hěn dà.', 'Cửa sổ của bệnh viện rất to.']
 },
 nhahang: {
  '菜单': ['服务员，请给我菜单。', 'Fúwùyuán, qǐng gěi wǒ càidān.', 'Phục vụ ơi, cho tôi xem thực đơn.'],
  '厨师': ['这个厨师做的菜很好吃。', 'Zhège chúshī zuò de cài hěn hǎochī.', 'Món đầu bếp này nấu rất ngon.'],
  '服务员': ['服务员很客气。', 'Fúwùyuán hěn kèqi.', 'Nhân viên phục vụ rất lịch sự.'],
  '桌子': ['这张桌子可以坐四个人。', 'Zhè zhāng zhuōzi kěyǐ zuò sì ge rén.', 'Cái bàn này ngồi được bốn người.'],
  '饺子': ['我要一盘饺子。', 'Wǒ yào yì pán jiǎozi.', 'Tôi muốn một đĩa sủi cảo.'],
  '面条': ['这碗面条有点儿辣。', 'Zhè wǎn miàntiáo yǒudiǎnr là.', 'Bát mì này hơi cay.'],
  '火锅': ['冬天吃火锅最舒服。', 'Dōngtiān chī huǒguō zuì shūfu.', 'Mùa đông ăn lẩu là sướng nhất.'],
  '茶': ['先给我们来一壶茶。', 'Xiān gěi wǒmen lái yì hú chá.', 'Cho chúng tôi một ấm trà trước nhé.'],
  '啤酒': ['他喝了两瓶啤酒。', 'Tā hē le liǎng píng píjiǔ.', 'Anh ấy đã uống hai chai bia.'],
  '筷子': ['请再给我一双筷子。', 'Qǐng zài gěi wǒ yì shuāng kuàizi.', 'Cho tôi thêm một đôi đũa nữa.'],
  '灯笼': ['红灯笼挂在门口。', 'Hóng dēnglong guà zài ménkǒu.', 'Đèn lồng đỏ treo ở cửa ra vào.']
 },
 congvien: {
  '太阳': ['太阳出来了。', 'Tàiyáng chūlai le.', 'Mặt trời lên rồi.'],
  '风筝': ['孩子们在放风筝。', 'Háizimen zài fàng fēngzheng.', 'Bọn trẻ đang thả diều.'],
  '鸟': ['树上有一只小鸟在唱歌。', 'Shù shang yǒu yì zhī xiǎo niǎo zài chàng gē.', 'Trên cây có một chú chim nhỏ đang hót.'],
  '树': ['这棵树很高。', 'Zhè kē shù hěn gāo.', 'Cái cây này rất cao.'],
  '湖': ['公园里有一个小湖。', 'Gōngyuán li yǒu yí ge xiǎo hú.', 'Trong công viên có một cái hồ nhỏ.'],
  '船': ['湖上有一条小船。', 'Hú shang yǒu yì tiáo xiǎo chuán.', 'Trên hồ có một chiếc thuyền nhỏ.'],
  '长椅': ['我们坐在长椅上休息一下吧。', 'Wǒmen zuò zài chángyǐ shang xiūxi yíxià ba.', 'Mình ngồi ghế dài nghỉ một lát đi.'],
  '花': ['公园里的花开了，真漂亮！', 'Gōngyuán li de huā kāi le, zhēn piàoliang!', 'Hoa trong công viên nở rồi, đẹp quá!'],
  '草': ['请不要踩草地。', 'Qǐng bú yào cǎi cǎodì.', 'Xin đừng giẫm lên bãi cỏ.'],
  '蝴蝶': ['一只蝴蝶飞过来了。', 'Yì zhī húdié fēi guòlai le.', 'Một con bướm bay lại đây rồi.'],
  '滑梯': ['宝宝最喜欢玩滑梯。', 'Bǎobao zuì xǐhuan wán huátī.', 'Bé thích chơi cầu trượt nhất.'],
  '狗': ['别怕，这只狗不咬人。', 'Bié pà, zhè zhī gǒu bù yǎo rén.', 'Đừng sợ, con chó này không cắn người đâu.'],
  '朋友': ['小美是我的好朋友。', 'Xiǎoměi shì wǒ de hǎo péngyou.', 'Tiểu Mỹ là bạn thân của tôi.']
 }
};

/* nhân vật: tên hiển thị + cuộc nói chuyện khi gặp ngoài câu chuyện */
window.GAME_PEOPLE = {
 ayi: { n: '张阿姨', p: 'Zhāng āyí', vi: 'cô Trương hàng xóm', e: '👵' },
 laogong: { n: '老公', p: 'lǎogōng', vi: 'chồng', e: '👨' },
 popo: { n: '婆婆', p: 'pópo', vi: 'mẹ chồng', e: '👵' },
 shouhuo: { n: '售货员', p: 'shòuhuòyuán', vi: 'nhân viên bán hàng', e: '🧑‍💼' },
 xiaomei: { n: '小美', p: 'Xiǎoměi', vi: 'Tiểu Mỹ, bạn thân', e: '👩' },
 laoshi: { n: '王老师', p: 'Wáng lǎoshī', vi: 'cô Vương', e: '👩‍🏫' },
 hushi: { n: '护士', p: 'hùshi', vi: 'y tá', e: '👩‍⚕️' },
 yisheng: { n: '李医生', p: 'Lǐ yīshēng', vi: 'bác sĩ Lý', e: '🧑‍⚕️' },
 fuwu: { n: '服务员', p: 'fúwùyuán', vi: 'nhân viên phục vụ', e: '💁' }
};

window.GAME_TALKS = {
 ayi: { who: 'ayi', lines: [
  ['a', '早上好！你去哪儿？', 'Zǎoshang hǎo! Nǐ qù nǎr?', 'Chào buổi sáng! Cháu đi đâu đấy?'],
  ['?', [['我去超市买东西。', 'Wǒ qù chāoshì mǎi dōngxi.', 'Cháu đi siêu thị mua đồ ạ.', 1], ['我是越南人。', 'Wǒ shì Yuènán rén.', 'Cháu là người Việt Nam.', 0], ['我吃饱了。', 'Wǒ chī bǎo le.', 'Cháu ăn no rồi.', 0]]],
  ['a', '今天超市打折，奶粉很便宜！', 'Jīntiān chāoshì dǎ zhé, nǎifěn hěn piányi!', 'Hôm nay siêu thị giảm giá, sữa bột rẻ lắm!'],
  ['b', '真的吗？太好了，谢谢阿姨！', 'Zhēn de ma? Tài hǎo le, xièxie āyí!', 'Thật ạ? Tốt quá, cháu cảm ơn cô!'],
  ['a', '不客气，路上小心！', 'Bú kèqi, lù shang xiǎoxīn!', 'Không có gì, đi đường cẩn thận nhé!'] ]},
 laogong: { who: 'laogong', lines: [
  ['a', '老婆，你今天累不累？', 'Lǎopo, nǐ jīntiān lèi bu lèi?', 'Vợ ơi, hôm nay em có mệt không?'],
  ['?', [['有点儿累，宝宝今天不想睡觉。', 'Yǒudiǎnr lèi, bǎobao jīntiān bù xiǎng shuì jiào.', 'Hơi mệt, hôm nay bé không chịu ngủ.', 1], ['我喜欢吃苹果。', 'Wǒ xǐhuan chī píngguǒ.', 'Em thích ăn táo.', 0], ['今天星期三。', 'Jīntiān xīngqīsān.', 'Hôm nay thứ Tư.', 0]]],
  ['a', '你去休息吧，我来做饭。', 'Nǐ qù xiūxi ba, wǒ lái zuò fàn.', 'Em đi nghỉ đi, để anh nấu cơm.'],
  ['b', '谢谢老公，你真好！', 'Xièxie lǎogōng, nǐ zhēn hǎo!', 'Cảm ơn chồng, anh tốt quá!'] ]},
 popo: { who: 'popo', lines: [
  ['a', '饭做好了吗？', 'Fàn zuò hǎo le ma?', 'Cơm nấu xong chưa con?'],
  ['?', [['快好了，再等五分钟。', 'Kuài hǎo le, zài děng wǔ fēnzhōng.', 'Sắp xong rồi ạ, mẹ đợi thêm năm phút nữa.', 1], ['我没有钱。', 'Wǒ méiyǒu qián.', 'Con không có tiền.', 0], ['我去医院。', 'Wǒ qù yīyuàn.', 'Con đi bệnh viện.', 0]]],
  ['a', '今天做什么菜？', 'Jīntiān zuò shénme cài?', 'Hôm nay nấu món gì thế?'],
  ['b', '西红柿炒鸡蛋和鱼汤。', 'Xīhóngshì chǎo jīdàn hé yú tāng.', 'Trứng xào cà chua và canh cá ạ.'],
  ['a', '好香啊！', 'Hǎo xiāng a!', 'Thơm quá!'] ]},
 shouhuo: { who: 'shouhuo', lines: [
  ['a', '您好，您要买什么？', 'Nín hǎo, nín yào mǎi shénme?', 'Chào chị, chị muốn mua gì ạ?'],
  ['?', [['我想买尿不湿。', 'Wǒ xiǎng mǎi niàobùshī.', 'Tôi muốn mua bỉm.', 1], ['我想看医生。', 'Wǒ xiǎng kàn yīshēng.', 'Tôi muốn đi khám bác sĩ.', 0], ['我想睡觉。', 'Wǒ xiǎng shuì jiào.', 'Tôi muốn ngủ.', 0]]],
  ['a', '尿不湿在那边，第二排。', 'Niàobùshī zài nàbian, dì-èr pái.', 'Bỉm ở đằng kia, dãy thứ hai ạ.'],
  ['b', '今天有打折吗？', 'Jīntiān yǒu dǎ zhé ma?', 'Hôm nay có giảm giá không?'],
  ['a', '有，买两包打八折。', 'Yǒu, mǎi liǎng bāo dǎ bā zhé.', 'Có ạ, mua hai bịch được giảm 20%.'],
  ['?', [['太好了，我买两包。', 'Tài hǎo le, wǒ mǎi liǎng bāo.', 'Tốt quá, tôi mua hai bịch.', 1], ['我不饿。', 'Wǒ bú è.', 'Tôi không đói.', 0], ['我两岁了。', 'Wǒ liǎng suì le.', 'Tôi hai tuổi rồi.', 0]]],
  ['a', '好的，请到收银台付钱。', 'Hǎo de, qǐng dào shōuyíntái fù qián.', 'Vâng, mời chị ra quầy thu ngân thanh toán.'] ]},
 xiaomei_xue: { who: 'xiaomei', lines: [
  ['a', '你好！你今天怎么来得这么早？', 'Nǐ hǎo! Nǐ jīntiān zěnme lái de zhème zǎo?', 'Chào cậu! Hôm nay sao cậu đến sớm thế?'],
  ['?', [['我想早点儿复习生词。', 'Wǒ xiǎng zǎo diǎnr fùxí shēngcí.', 'Mình muốn ôn từ mới sớm một chút.', 1], ['我的车是红色的。', 'Wǒ de chē shì hóngsè de.', 'Xe của mình màu đỏ.', 0], ['我不喜欢喝茶。', 'Wǒ bù xǐhuan hē chá.', 'Mình không thích uống trà.', 0]]],
  ['a', '下个星期就要考试了，我有点儿紧张。', 'Xià ge xīngqī jiù yào kǎoshì le, wǒ yǒudiǎnr jǐnzhāng.', 'Tuần sau là thi rồi, mình hơi căng thẳng.'],
  ['b', '别紧张，我们一起复习吧！', 'Bié jǐnzhāng, wǒmen yìqǐ fùxí ba!', 'Đừng căng thẳng, mình cùng ôn bài nhé!'],
  ['a', '好啊！放学以后我男朋友请我们喝奶茶。', 'Hǎo a! Fàng xué yǐhòu wǒ nánpéngyou qǐng wǒmen hē nǎichá.', 'Được đó! Tan học bạn trai mình mời tụi mình uống trà sữa.'] ]},
 laoshi: { who: 'laoshi', lines: [
  ['a', '同学们好！今天我们学习第十五课。', 'Tóngxuémen hǎo! Jīntiān wǒmen xuéxí dì-shíwǔ kè.', 'Chào các em! Hôm nay chúng ta học bài 15.'],
  ['a', '你为什么学习汉语？', 'Nǐ wèi shénme xuéxí Hànyǔ?', 'Vì sao em học tiếng Trung?'],
  ['?', [['我想找一个更好的工作，以后也想教我的孩子说汉语。', 'Wǒ xiǎng zhǎo yí ge gèng hǎo de gōngzuò, yǐhòu yě xiǎng jiāo wǒ de háizi shuō Hànyǔ.', 'Em muốn tìm một công việc tốt hơn, sau này cũng muốn dạy con em nói tiếng Trung.', 1], ['因为今天下雨。', 'Yīnwèi jīntiān xià yǔ.', 'Vì hôm nay trời mưa.', 0], ['我在超市。', 'Wǒ zài chāoshì.', 'Em đang ở siêu thị.', 0]]],
  ['a', '很好！加油！', 'Hěn hǎo! Jiāyóu!', 'Tốt lắm! Cố lên nhé!'] ]},
 hushi: { who: 'hushi', lines: [
  ['a', '您好，请问您挂什么科？', 'Nín hǎo, qǐngwèn nín guà shénme kē?', 'Chào chị, chị muốn đăng ký khám khoa nào ạ?'],
  ['?', [['我发烧了，挂内科。', 'Wǒ fā shāo le, guà nèikē.', 'Tôi bị sốt, khám khoa nội.', 1], ['我要两碗面条。', 'Wǒ yào liǎng wǎn miàntiáo.', 'Tôi muốn hai bát mì.', 0], ['我住在河内。', 'Wǒ zhù zài Hénèi.', 'Tôi sống ở Hà Nội.', 0]]],
  ['a', '好的，请先量一下体温。', 'Hǎo de, qǐng xiān liáng yíxià tǐwēn.', 'Vâng, mời chị đo nhiệt độ trước đã.'],
  ['a', '三十八度五。请在这儿等一下，医生马上叫您。', 'Sānshíbā dù wǔ. Qǐng zài zhèr děng yíxià, yīshēng mǎshàng jiào nín.', '38,5 độ. Chị đợi ở đây một lát, bác sĩ sẽ gọi ngay.'],
  ['b', '好的，谢谢！', 'Hǎo de, xièxie!', 'Vâng, cảm ơn!'] ]},
 yisheng: { who: 'yisheng', lines: [
  ['a', '你哪儿不舒服？', 'Nǐ nǎr bù shūfu?', 'Chị thấy khó chịu ở đâu?'],
  ['?', [['我头疼，还有点儿发烧。', 'Wǒ tóu téng, hái yǒudiǎnr fā shāo.', 'Tôi đau đầu, còn hơi sốt nữa.', 1], ['我想买一件衣服。', 'Wǒ xiǎng mǎi yí jiàn yīfu.', 'Tôi muốn mua một cái áo.', 0], ['我很喜欢唱歌。', 'Wǒ hěn xǐhuan chàng gē.', 'Tôi rất thích hát.', 0]]],
  ['a', '我看看……你感冒了。', 'Wǒ kànkan…… nǐ gǎnmào le.', 'Để tôi xem nào… chị bị cảm rồi.'],
  ['b', '要打针吗？', 'Yào dǎ zhēn ma?', 'Có phải tiêm không ạ?'],
  ['a', '不用打针。吃点儿药，多喝水，好好休息。', 'Búyòng dǎ zhēn. Chī diǎnr yào, duō hē shuǐ, hǎohǎo xiūxi.', 'Không cần tiêm. Uống chút thuốc, uống nhiều nước, nghỉ ngơi cho tốt.'],
  ['b', '谢谢医生！', 'Xièxie yīshēng!', 'Cảm ơn bác sĩ!'] ]},
 fuwu: { who: 'fuwu', lines: [
  ['a', '欢迎光临！请问几位？', 'Huānyíng guānglín! Qǐngwèn jǐ wèi?', 'Xin chào quý khách! Cho hỏi mấy người ạ?'],
  ['?', [['两位，我和我朋友。', 'Liǎng wèi, wǒ hé wǒ péngyou.', 'Hai người, tôi và bạn tôi.', 1], ['我两岁。', 'Wǒ liǎng suì.', 'Tôi hai tuổi.', 0], ['我不舒服。', 'Wǒ bù shūfu.', 'Tôi thấy không khỏe.', 0]]],
  ['a', '请坐，这是菜单。', 'Qǐng zuò, zhè shì càidān.', 'Mời ngồi, đây là thực đơn.'],
  ['b', '我们要一盘饺子、两碗面条。', 'Wǒmen yào yì pán jiǎozi, liǎng wǎn miàntiáo.', 'Chúng tôi lấy một đĩa sủi cảo, hai bát mì.'],
  ['a', '好的。你们喝什么？', 'Hǎo de. Nǐmen hē shénme?', 'Vâng. Các chị uống gì ạ?'],
  ['?', [['来一壶茶吧。', 'Lái yì hú chá ba.', 'Cho một ấm trà nhé.', 1], ['我们坐出租车。', 'Wǒmen zuò chūzūchē.', 'Chúng tôi đi taxi.', 0], ['我很忙。', 'Wǒ hěn máng.', 'Tôi rất bận.', 0]]],
  ['a', '好的，请稍等。', 'Hǎo de, qǐng shāo děng.', 'Vâng, xin chờ một chút.'] ]},
 xiaomei_park: { who: 'xiaomei', lines: [
  ['a', '天气真好，我们拍张照吧！', 'Tiānqì zhēn hǎo, wǒmen pāi zhāng zhào ba!', 'Trời đẹp quá, mình chụp một tấm ảnh đi!'],
  ['?', [['好啊！一、二、三，茄子！', 'Hǎo a! Yī, èr, sān, qiézi!', 'Được đó! Một, hai, ba, cười lên nào!', 1], ['我在学校。', 'Wǒ zài xuéxiào.', 'Mình đang ở trường.', 0], ['我不认识你。', 'Wǒ bú rènshi nǐ.', 'Mình không quen cậu.', 0]]],
  ['a', '你的宝宝真可爱！几岁了？', 'Nǐ de bǎobao zhēn kě\'ài! Jǐ suì le?', 'Bé nhà cậu đáng yêu quá! Mấy tuổi rồi?'],
  ['b', '两岁了，特别喜欢玩滑梯。', 'Liǎng suì le, tèbié xǐhuan wán huátī.', 'Hai tuổi rồi, đặc biệt thích chơi cầu trượt.'],
  ['a', '下次我给宝宝买个玩具。', 'Xià cì wǒ gěi bǎobao mǎi ge wánjù.', 'Lần sau mình mua đồ chơi cho bé.'] ]},

 /* lời thoại riêng trong câu chuyện */
 st_chuoi1: { who: 'laogong', lines: [
  ['a', '周末我们带宝宝去公园玩吧！', 'Zhōumò wǒmen dài bǎobao qù gōngyuán wán ba!', 'Cuối tuần mình đưa bé đi công viên chơi nhé!'],
  ['?', [['好啊！我也叫小美一起去。', 'Hǎo a! Wǒ yě jiào Xiǎoměi yìqǐ qù.', 'Được đó! Em rủ cả Tiểu Mỹ đi cùng.', 1], ['我没有手机。', 'Wǒ méiyǒu shǒujī.', 'Em không có điện thoại.', 0], ['我头疼。', 'Wǒ tóu téng.', 'Em đau đầu.', 0]]],
  ['a', '好，别忘了带水和尿不湿。', 'Hǎo, bié wàng le dài shuǐ hé niàobùshī.', 'Ừ, đừng quên mang nước và bỉm nhé.'],
  ['b', '放心，我都准备好了。', 'Fàngxīn, wǒ dōu zhǔnbèi hǎo le.', 'Anh yên tâm, em chuẩn bị xong hết rồi.'] ]},
 st_hoc1: { who: 'laogong', lines: [
  ['a', '今天你几点上课？', 'Jīntiān nǐ jǐ diǎn shàng kè?', 'Hôm nay mấy giờ em vào học?'],
  ['?', [['八点上课，我得走了。', 'Bā diǎn shàng kè, wǒ děi zǒu le.', 'Tám giờ vào học, em phải đi rồi.', 1], ['我喜欢熊猫。', 'Wǒ xǐhuan xióngmāo.', 'Em thích gấu trúc.', 0], ['我在吃饭。', 'Wǒ zài chī fàn.', 'Em đang ăn cơm.', 0]]],
  ['a', '宝宝我来照顾，你放心去吧。', 'Bǎobao wǒ lái zhàogù, nǐ fàngxīn qù ba.', 'Để anh trông bé, em yên tâm đi đi.'],
  ['b', '谢谢！晚上见！', 'Xièxie! Wǎnshang jiàn!', 'Cảm ơn anh! Tối gặp nhé!'] ]},
 st_benh1: { who: 'laogong', lines: [
  ['a', '你的脸怎么这么红？不舒服吗？', 'Nǐ de liǎn zěnme zhème hóng? Bù shūfu ma?', 'Sao mặt em đỏ thế? Em thấy không khỏe à?'],
  ['?', [['我头疼，好像发烧了。', 'Wǒ tóu téng, hǎoxiàng fā shāo le.', 'Em đau đầu, hình như bị sốt rồi.', 1], ['我想吃火锅。', 'Wǒ xiǎng chī huǒguō.', 'Em muốn ăn lẩu.', 0], ['今天天气很好。', 'Jīntiān tiānqì hěn hǎo.', 'Hôm nay trời đẹp lắm.', 0]]],
  ['a', '我带你去医院吧，宝宝让奶奶照顾。', 'Wǒ dài nǐ qù yīyuàn ba, bǎobao ràng nǎinai zhàogù.', 'Anh đưa em đi bệnh viện, để bà nội trông bé.'],
  ['b', '好，我们走吧。', 'Hǎo, wǒmen zǒu ba.', 'Vâng, mình đi thôi.'] ]},
 st_mua3: { who: 'laogong', lines: [
  ['a', '你回来了！买了什么？', 'Nǐ huílai le! Mǎi le shénme?', 'Em về rồi à! Mua được gì thế?'],
  ['?', [['我买了两包尿不湿和一罐奶粉。', 'Wǒ mǎi le liǎng bāo niàobùshī hé yí guàn nǎifěn.', 'Em mua hai bịch bỉm và một hộp sữa bột.', 1], ['我去了医院。', 'Wǒ qù le yīyuàn.', 'Em đã đi bệnh viện.', 0], ['我没有朋友。', 'Wǒ méiyǒu péngyou.', 'Em không có bạn.', 0]]],
  ['a', '花了多少钱？', 'Huā le duōshao qián?', 'Hết bao nhiêu tiền?'],
  ['b', '打八折，才花了两百块。', 'Dǎ bā zhé, cái huā le liǎng bǎi kuài.', 'Được giảm 20%, chỉ hết có hai trăm tệ.'],
  ['a', '你真会买东西！', 'Nǐ zhēn huì mǎi dōngxi!', 'Em đúng là biết mua sắm!'] ]}
};

/* câu chuyện nhiều bước: mỗi bước = đến cảnh + chạm đúng người để nói chuyện */
window.GAME_STORIES = [
 { id: 'choi', name: 'Đi chơi công viên', zh: '去公园玩', emo: '🌳', steps: [
   { scene: 'nha', obj: '老公', talk: 'st_chuoi1', goal: 'Về nhà, nói chuyện với chồng ở phòng khách' },
   { scene: 'congvien', obj: '朋友', talk: 'xiaomei_park', goal: 'Ra công viên gặp Tiểu Mỹ' },
   { scene: 'nhahang', obj: '服务员', talk: 'fuwu', goal: 'Đi nhà hàng ăn tối, gọi món với phục vụ' } ]},
 { id: 'hoc', name: 'Đi học', zh: '去上学', emo: '🏫', steps: [
   { scene: 'nha', obj: '老公', talk: 'st_hoc1', goal: 'Chào chồng ở phòng khách trước khi đi học' },
   { scene: 'truong', obj: '同学', talk: 'xiaomei_xue', goal: 'Đến trường, nói chuyện với Tiểu Mỹ' },
   { scene: 'truong', obj: '老师', talk: 'laoshi', goal: 'Vào học, trả lời câu hỏi của cô Vương' } ]},
 { id: 'benh', name: 'Đi khám bệnh', zh: '去医院看病', emo: '🏥', steps: [
   { scene: 'nha', obj: '老公', talk: 'st_benh1', goal: 'Thấy mệt, nói với chồng ở phòng khách' },
   { scene: 'benhvien', obj: '护士', talk: 'hushi', goal: 'Đến bệnh viện, đăng ký khám với y tá' },
   { scene: 'benhvien', obj: '医生', talk: 'yisheng', goal: 'Vào gặp bác sĩ Lý' } ]},
 { id: 'mua', name: 'Đi siêu thị săn sale', zh: '去超市买东西', emo: '🛒', steps: [
   { scene: 'pho', obj: '阿姨', talk: 'ayi', goal: 'Ra phố, chào cô Trương hàng xóm' },
   { scene: 'sieuthi', obj: '售货员', talk: 'shouhuo', goal: 'Vào siêu thị, hỏi nhân viên chỗ bán bỉm' },
   { scene: 'nha', obj: '老公', talk: 'st_mua3', goal: 'Về nhà kể cho chồng nghe' } ]}
];

/* ===== các nơi mới ===== */
Object.assign(window.GAME_DESC, {
 pho2: {
  '公交车站': ['我在公交车站等车。', 'Wǒ zài gōngjiāochē zhàn děng chē.', 'Tôi đang đợi xe ở bến xe buýt.'],
  '警察': ['有问题可以问警察。', 'Yǒu wèntí kěyǐ wèn jǐngchá.', 'Có chuyện gì thì có thể hỏi cảnh sát.'],
  '喷泉': ['广场上有一个喷泉。', 'Guǎngchǎng shang yǒu yí ge pēnquán.', 'Trên quảng trường có một đài phun nước.'],
  '滑板车': ['小朋友在骑滑板车。', 'Xiǎopéngyǒu zài qí huábǎnchē.', 'Bạn nhỏ đang đi xe scooter.'],
  '路牌': ['路牌上写着“机场”。', 'Lùpái shang xiězhe “jīchǎng”.', 'Trên biển chỉ đường có ghi “sân bay”.'],
  '地铁': ['坐地铁又快又方便。', 'Zuò dìtiě yòu kuài yòu fāngbiàn.', 'Đi tàu điện ngầm vừa nhanh vừa tiện.'],
  '雨伞': ['外面下雨了，别忘了带雨伞。', 'Wàimiàn xià yǔ le, bié wàng le dài yǔsǎn.', 'Bên ngoài mưa rồi, đừng quên mang ô.'],
  '鸽子': ['广场上有很多鸽子。', 'Guǎngchǎng shang yǒu hěn duō gēzi.', 'Trên quảng trường có rất nhiều chim bồ câu.'],
  '冰淇淋': ['天气太热了，我想吃冰淇淋。', 'Tiānqì tài rè le, wǒ xiǎng chī bīngqílín.', 'Trời nóng quá, tôi muốn ăn kem.']
 },
 shudian: {
  '小说': ['这本小说很有意思。', 'Zhè běn xiǎoshuō hěn yǒu yìsi.', 'Cuốn tiểu thuyết này rất hay.'],
  '词典': ['不认识的字可以查词典。', 'Bú rènshi de zì kěyǐ chá cídiǎn.', 'Chữ nào không biết thì có thể tra từ điển.'],
  '课本': ['这是我的汉语课本。', 'Zhè shì wǒ de Hànyǔ kèběn.', 'Đây là sách giáo khoa tiếng Trung của tôi.'],
  '地球仪': ['在地球仪上能找到越南。', 'Zài dìqiúyí shang néng zhǎo dào Yuènán.', 'Trên quả địa cầu có thể tìm thấy Việt Nam.'],
  '绘本': ['这本绘本有很多图画，宝宝很喜欢。', 'Zhè běn huìběn yǒu hěn duō túhuà, bǎobao hěn xǐhuan.', 'Cuốn sách tranh này có nhiều hình, bé rất thích.'],
  '报纸': ['爷爷每天早上看报纸。', 'Yéye měi tiān zǎoshang kàn bàozhǐ.', 'Sáng nào ông nội cũng đọc báo.'],
  '本子': ['我买了三个本子。', 'Wǒ mǎi le sān ge běnzi.', 'Tôi đã mua ba quyển vở.'],
  '蜡笔': ['宝宝用蜡笔画了一只猫。', 'Bǎobao yòng làbǐ huà le yì zhī māo.', 'Bé dùng bút sáp vẽ một con mèo.'],
  '书架': ['书架上有很多书。', 'Shūjià shang yǒu hěn duō shū.', 'Trên giá có rất nhiều sách.'],
  '店员': ['店员帮我找到了那本书。', 'Diànyuán bāng wǒ zhǎo dào le nà běn shū.', 'Nhân viên đã giúp tôi tìm được quyển sách đó.'],
  '笔': ['这支笔很好用。', 'Zhè zhī bǐ hěn hǎo yòng.', 'Cây bút này viết rất tốt.'],
  '书签': ['我把书签放在书里。', 'Wǒ bǎ shūqiān fàng zài shū li.', 'Tôi kẹp thẻ đánh dấu vào trong sách.']
 },
 yinhang: {
  '密码': ['密码不要告诉别人。', 'Mìmǎ búyào gàosu biérén.', 'Đừng nói mật khẩu cho người khác.'],
  '职员': ['银行职员很有耐心。', 'Yínháng zhíyuán hěn yǒu nàixīn.', 'Nhân viên ngân hàng rất kiên nhẫn.'],
  '取款机': ['取款机在银行门口。', 'Qǔkuǎnjī zài yínháng ménkǒu.', 'Cây ATM ở trước cửa ngân hàng.'],
  '人民币': ['去中国旅游要带人民币。', 'Qù Zhōngguó lǚyóu yào dài Rénmínbì.', 'Đi du lịch Trung Quốc phải mang Nhân dân tệ.'],
  '美元': ['我想把美元换成人民币。', 'Wǒ xiǎng bǎ Měiyuán huàn chéng Rénmínbì.', 'Tôi muốn đổi đô la Mỹ sang Nhân dân tệ.'],
  '签名': ['请在这儿签名。', 'Qǐng zài zhèr qiānmíng.', 'Mời ký tên ở đây.'],
  '硬币': ['这是一块钱的硬币。', 'Zhè shì yí kuài qián de yìngbì.', 'Đây là đồng xu một tệ.'],
  '钱包': ['我的钱包里没有钱了。', 'Wǒ de qiánbāo li méiyǒu qián le.', 'Trong ví của tôi hết tiền rồi.'],
  '存钱罐': ['宝宝有一个小猪存钱罐。', 'Bǎobao yǒu yí ge xiǎo zhū cúnqiánguàn.', 'Bé có một con heo đất.'],
  '银行卡': ['用银行卡付钱很方便。', 'Yòng yínhángkǎ fù qián hěn fāngbiàn.', 'Trả tiền bằng thẻ ngân hàng rất tiện.']
 },
 yaodian: {
  '感冒药': ['这种感冒药饭后吃。', 'Zhè zhǒng gǎnmàoyào fàn hòu chī.', 'Loại thuốc cảm này uống sau bữa ăn.'],
  '退烧药': ['这是儿童退烧药。', 'Zhè shì értóng tuìshāoyào.', 'Đây là thuốc hạ sốt cho trẻ em.'],
  '维生素': ['每天吃一片维生素。', 'Měi tiān chī yí piàn wéishēngsù.', 'Mỗi ngày uống một viên vitamin.'],
  '眼药水': ['眼睛累了，用一点儿眼药水。', 'Yǎnjing lèi le, yòng yìdiǎnr yǎnyàoshuǐ.', 'Mắt mỏi rồi, nhỏ một chút thuốc nhỏ mắt.'],
  '创可贴': ['手破了，贴个创可贴吧。', 'Shǒu pò le, tiē ge chuàngkětiē ba.', 'Tay bị xước rồi, dán miếng băng cá nhân đi.'],
  '防晒霜': ['夏天出门要涂防晒霜。', 'Xiàtiān chū mén yào tú fángshàishuāng.', 'Mùa hè ra ngoài phải bôi kem chống nắng.'],
  '口罩': ['药店里也卖口罩。', 'Yàodiàn li yě mài kǒuzhào.', 'Trong nhà thuốc cũng bán khẩu trang.'],
  '体温计': ['家里应该有一个体温计。', 'Jiā li yīnggāi yǒu yí ge tǐwēnjì.', 'Trong nhà nên có một cái nhiệt kế.'],
  '药剂师': ['药剂师告诉我怎么吃药。', 'Yàojìshī gàosu wǒ zěnme chī yào.', 'Dược sĩ chỉ cho tôi cách uống thuốc.'],
  '处方': ['这种药要有医生的处方。', 'Zhè zhǒng yào yào yǒu yīshēng de chǔfāng.', 'Loại thuốc này phải có đơn của bác sĩ.'],
  '购物篮': ['我把药放进购物篮里。', 'Wǒ bǎ yào fàng jìn gòuwùlán li.', 'Tôi bỏ thuốc vào giỏ mua hàng.']
 },
 kafei: {
  '无线网': ['这里有免费的无线网。', 'Zhèlǐ yǒu miǎnfèi de wúxiànwǎng.', 'Ở đây có wifi miễn phí.'],
  '音乐': ['咖啡馆里的音乐很好听。', 'Kāfēiguǎn li de yīnyuè hěn hǎotīng.', 'Nhạc trong quán cà phê rất hay.'],
  '服务员': ['服务员很有礼貌。', 'Fúwùyuán hěn yǒu lǐmào.', 'Nhân viên phục vụ rất lễ phép.'],
  '植物': ['咖啡馆里有很多绿色的植物。', 'Kāfēiguǎn li yǒu hěn duō lǜsè de zhíwù.', 'Trong quán cà phê có nhiều cây xanh.'],
  '朋友': ['小美在等我。', 'Xiǎoměi zài děng wǒ.', 'Tiểu Mỹ đang đợi tôi.'],
  '咖啡': ['越南咖啡又香又浓。', 'Yuènán kāfēi yòu xiāng yòu nóng.', 'Cà phê Việt Nam vừa thơm vừa đậm.'],
  '奶茶': ['我最喜欢喝珍珠奶茶。', 'Wǒ zuì xǐhuan hē zhēnzhū nǎichá.', 'Tôi thích uống trà sữa trân châu nhất.'],
  '果汁': ['这杯果汁很新鲜。', 'Zhè bēi guǒzhī hěn xīnxiān.', 'Cốc nước ép này rất tươi.'],
  '笔记本电脑': ['他在咖啡馆用笔记本电脑工作。', 'Tā zài kāfēiguǎn yòng bǐjìběn diànnǎo gōngzuò.', 'Anh ấy làm việc bằng máy tính xách tay ở quán cà phê.'],
  '蛋糕': ['这块蛋糕很甜。', 'Zhè kuài dàngāo hěn tián.', 'Miếng bánh kem này rất ngọt.'],
  '牛角面包': ['牛角面包刚烤好，很香。', 'Niújiǎo miànbāo gāng kǎo hǎo, hěn xiāng.', 'Bánh sừng bò vừa nướng xong, rất thơm.'],
  '糖': ['我的咖啡不要放糖。', 'Wǒ de kāfēi búyào fàng táng.', 'Cà phê của tôi đừng cho đường.']
 },
 youju: {
  '明信片': ['我在上海买了一张明信片。', 'Wǒ zài Shànghǎi mǎi le yì zhāng míngxìnpiàn.', 'Tôi đã mua một tấm bưu thiếp ở Thượng Hải.'],
  '工作人员': ['邮局的工作人员很忙。', 'Yóujú de gōngzuò rényuán hěn máng.', 'Nhân viên bưu điện rất bận.'],
  '邮筒': ['把信投进邮筒里。', 'Bǎ xìn tóu jìn yóutǒng li.', 'Bỏ thư vào hòm thư.'],
  '邮票': ['信封上要贴邮票。', 'Xìnfēng shang yào tiē yóupiào.', 'Trên phong bì phải dán tem.'],
  '秤': ['先用秤称一下包裹。', 'Xiān yòng chèng chēng yíxià bāoguǒ.', 'Dùng cân cân bưu kiện trước đã.'],
  '包裹': ['这个包裹很重。', 'Zhège bāoguǒ hěn zhòng.', 'Bưu kiện này rất nặng.'],
  '快递': ['我的快递到了！', 'Wǒ de kuàidì dào le!', 'Hàng chuyển phát của tôi đến rồi!'],
  '剪刀': ['小心，剪刀很快。', 'Xiǎoxīn, jiǎndāo hěn kuài.', 'Cẩn thận, kéo sắc lắm.'],
  '信': ['我给老朋友写了一封信。', 'Wǒ gěi lǎo péngyou xiě le yì fēng xìn.', 'Tôi đã viết một lá thư cho bạn cũ.'],
  '信封': ['把信放进信封里。', 'Bǎ xìn fàng jìn xìnfēng li.', 'Cho lá thư vào phong bì.']
 },
 banshi: {
  '屏幕': ['屏幕上显示：请十八号到三号窗口。', 'Píngmù shang xiǎnshì: qǐng shíbā hào dào sān hào chuāngkǒu.', 'Màn hình hiện: mời số 18 đến quầy số 3.'],
  '工作人员': ['工作人员让我先排队。', 'Gōngzuò rényuán ràng wǒ xiān pái duì.', 'Nhân viên bảo tôi xếp hàng trước.'],
  '号码': ['我拿到了十八号。', 'Wǒ ná dào le shíbā hào.', 'Tôi lấy được số 18.'],
  '护照': ['出国旅游一定要带护照。', 'Chū guó lǚyóu yídìng yào dài hùzhào.', 'Đi du lịch nước ngoài nhất định phải mang hộ chiếu.'],
  '签证': ['去中国旅游要办签证。', 'Qù Zhōngguó lǚyóu yào bàn qiānzhèng.', 'Đi du lịch Trung Quốc phải làm visa.'],
  '打印机': ['打印机没有纸了。', 'Dǎyìnjī méiyǒu zhǐ le.', 'Máy in hết giấy rồi.'],
  '表格': ['请用黑色的笔填表格。', 'Qǐng yòng hēisè de bǐ tián biǎogé.', 'Hãy dùng bút màu đen để điền tờ khai.'],
  '身份证': ['办护照要带身份证。', 'Bàn hùzhào yào dài shēnfènzhèng.', 'Làm hộ chiếu phải mang căn cước.'],
  '照片': ['护照照片要白色背景。', 'Hùzhào zhàopiàn yào báisè bèijǐng.', 'Ảnh làm hộ chiếu phải có nền trắng.'],
  '文件': ['这些文件都要复印一份。', 'Zhèxiē wénjiàn dōu yào fùyìn yí fèn.', 'Những giấy tờ này đều phải photo một bản.'],
  '笔': ['你的笔可以借我用一下吗？', 'Nǐ de bǐ kěyǐ jiè wǒ yòng yíxià ma?', 'Cho tôi mượn bút của bạn một chút được không?']
 },
 jichang: {
  '飞机': ['飞机马上就要起飞了。', 'Fēijī mǎshàng jiù yào qǐfēi le.', 'Máy bay sắp cất cánh rồi.'],
  '航班': ['看，我的航班准时起飞。', 'Kàn, wǒ de hángbān zhǔnshí qǐfēi.', 'Nhìn này, chuyến bay của tôi cất cánh đúng giờ.'],
  '工作人员': ['工作人员帮我托运行李。', 'Gōngzuò rényuán bāng wǒ tuōyùn xíngli.', 'Nhân viên giúp tôi ký gửi hành lý.'],
  '值机柜台': ['我们先去值机柜台办登机手续。', 'Wǒmen xiān qù zhíjī guìtái bàn dēngjī shǒuxù.', 'Mình đến quầy làm thủ tục lên máy bay trước.'],
  '免税店': ['免税店的东西比较便宜。', 'Miǎnshuìdiàn de dōngxi bǐjiào piányi.', 'Đồ ở cửa hàng miễn thuế tương đối rẻ.'],
  '安检': ['过安检的时候要把手机拿出来。', 'Guò ānjiǎn de shíhou yào bǎ shǒujī ná chūlai.', 'Khi qua cửa an ninh phải lấy điện thoại ra.'],
  '安检员': ['安检员检查得很认真。', 'Ānjiǎnyuán jiǎnchá de hěn rènzhēn.', 'Nhân viên an ninh kiểm tra rất kỹ.'],
  '行李箱': ['我的行李箱是粉色的。', 'Wǒ de xínglixiāng shì fěnsè de.', 'Va li của tôi màu hồng.'],
  '矿泉水': ['矿泉水不能带过安检。', 'Kuàngquánshuǐ bù néng dài guò ānjiǎn.', 'Nước khoáng không được mang qua cửa an ninh.'],
  '护照': ['护照和登机牌要一起拿着。', 'Hùzhào hé dēngjīpái yào yìqǐ názhe.', 'Hộ chiếu và thẻ lên máy bay phải cầm cùng nhau.'],
  '登机牌': ['登机牌上有座位号。', 'Dēngjīpái shang yǒu zuòwèi hào.', 'Trên thẻ lên máy bay có số ghế.'],
  '手提包': ['我的手提包里有护照和手机。', 'Wǒ de shǒutíbāo li yǒu hùzhào hé shǒujī.', 'Trong túi xách của tôi có hộ chiếu và điện thoại.']
 },
 feiji: {
  '云': ['从窗户往外看，云就在下面。', 'Cóng chuānghu wǎng wài kàn, yún jiù zài xiàmiàn.', 'Nhìn ra ngoài cửa sổ, mây ở ngay bên dưới.'],
  '洗手间': ['洗手间在飞机的后面。', 'Xǐshǒujiān zài fēijī de hòumiàn.', 'Nhà vệ sinh ở phía sau máy bay.'],
  '机长': ['机长说：我们马上就要到上海了。', 'Jīzhǎng shuō: wǒmen mǎshàng jiù yào dào Shànghǎi le.', 'Cơ trưởng nói: chúng ta sắp đến Thượng Hải rồi.'],
  '座位': ['我的座位在窗户旁边。', 'Wǒ de zuòwèi zài chuānghu pángbiān.', 'Chỗ ngồi của tôi ở cạnh cửa sổ.'],
  '空姐': ['空姐又漂亮又热情。', 'Kōngjiě yòu piàoliang yòu rèqíng.', 'Cô tiếp viên vừa xinh vừa nhiệt tình.'],
  '乘客': ['飞机上的乘客都在睡觉。', 'Fēijī shang de chéngkè dōu zài shuì jiào.', 'Hành khách trên máy bay đều đang ngủ.'],
  '安全带': ['飞机起飞的时候要系好安全带。', 'Fēijī qǐfēi de shíhou yào jì hǎo ānquándài.', 'Khi máy bay cất cánh phải thắt dây an toàn.'],
  '毯子': ['飞机上有点儿冷，我要一条毯子。', 'Fēijī shang yǒudiǎnr lěng, wǒ yào yì tiáo tǎnzi.', 'Trên máy bay hơi lạnh, tôi muốn một cái chăn.'],
  '飞机餐': ['飞机餐有米饭和鸡肉。', 'Fēijī cān yǒu mǐfàn hé jīròu.', 'Suất ăn trên máy bay có cơm và thịt gà.'],
  '耳机': ['戴上耳机听音乐吧。', 'Dài shàng ěrjī tīng yīnyuè ba.', 'Đeo tai nghe vào nghe nhạc đi.']
 },
 jiudian: {
  '前台': ['酒店前台二十四小时都有人。', 'Jiǔdiàn qiántái èrshísì xiǎoshí dōu yǒu rén.', 'Quầy lễ tân khách sạn lúc nào cũng có người (24 giờ).'],
  '电梯': ['坐电梯到八楼。', 'Zuò diàntī dào bā lóu.', 'Đi thang máy lên tầng tám.'],
  '房卡': ['用房卡开门。', 'Yòng fángkǎ kāi mén.', 'Dùng thẻ phòng để mở cửa.'],
  '服务铃': ['有事可以按服务铃。', 'Yǒu shì kěyǐ àn fúwùlíng.', 'Có việc gì thì có thể bấm chuông gọi phục vụ.'],
  '行李箱': ['服务员帮我把行李箱送到房间。', 'Fúwùyuán bāng wǒ bǎ xínglixiāng sòng dào fángjiān.', 'Nhân viên giúp tôi mang va li lên phòng.'],
  '帽子': ['外面太阳很大，戴上帽子吧。', 'Wàimiàn tàiyáng hěn dà, dài shàng màozi ba.', 'Bên ngoài nắng to, đội mũ vào đi.'],
  '照相机': ['我用照相机拍了很多照片。', 'Wǒ yòng zhàoxiàngjī pāi le hěn duō zhàopiàn.', 'Tôi dùng máy ảnh chụp rất nhiều ảnh.'],
  '早餐': ['酒店的早餐很丰富。', 'Jiǔdiàn de zǎocān hěn fēngfù.', 'Bữa sáng của khách sạn rất phong phú.'],
  '游泳池': ['酒店有一个很大的游泳池。', 'Jiǔdiàn yǒu yí ge hěn dà de yóuyǒngchí.', 'Khách sạn có một bể bơi rất to.'],
  '太阳镜': ['这副太阳镜很好看。', 'Zhè fù tàiyángjìng hěn hǎokàn.', 'Cặp kính râm này rất đẹp.']
 }
});

/* toà nhà ngoài phố: tên + một câu */
window.GAME_BLD = {
 nha: { n: ['家', 'jiā', 'nhà (nhà mình)'], d: ['这是我的家。', 'Zhè shì wǒ de jiā.', 'Đây là nhà của tôi.'] },
 sieuthi: { n: ['超市', 'chāoshì', 'siêu thị'], d: ['超市里的东西又多又便宜。', 'Chāoshì li de dōngxi yòu duō yòu piányi.', 'Đồ trong siêu thị vừa nhiều vừa rẻ.'] },
 truong: { n: ['学校', 'xuéxiào', 'trường học'], d: ['我在这个学校学习汉语。', 'Wǒ zài zhège xuéxiào xuéxí Hànyǔ.', 'Tôi học tiếng Trung ở trường này.'] },
 benhvien: { n: ['医院', 'yīyuàn', 'bệnh viện'], d: ['不舒服的时候要去医院。', 'Bù shūfu de shíhou yào qù yīyuàn.', 'Khi không khỏe thì phải đi bệnh viện.'] },
 nhahang: { n: ['饭店', 'fàndiàn', 'nhà hàng'], d: ['这家饭店的饺子很有名。', 'Zhè jiā fàndiàn de jiǎozi hěn yǒumíng.', 'Sủi cảo của nhà hàng này rất nổi tiếng.'] },
 shudian: { n: ['书店', 'shūdiàn', 'nhà sách'], d: ['这家书店很大，书也很多。', 'Zhè jiā shūdiàn hěn dà, shū yě hěn duō.', 'Nhà sách này rất rộng, sách cũng rất nhiều.'] },
 yinhang: { n: ['银行', 'yínháng', 'ngân hàng'], d: ['银行早上八点开门。', 'Yínháng zǎoshang bā diǎn kāi mén.', 'Ngân hàng mở cửa lúc tám giờ sáng.'] },
 yaodian: { n: ['药店', 'yàodiàn', 'nhà thuốc'], d: ['药店就在银行旁边。', 'Yàodiàn jiù zài yínháng pángbiān.', 'Nhà thuốc ở ngay cạnh ngân hàng.'] },
 kafei: { n: ['咖啡馆', 'kāfēiguǎn', 'quán cà phê'], d: ['我常常和朋友来这家咖啡馆。', 'Wǒ chángcháng hé péngyou lái zhè jiā kāfēiguǎn.', 'Tôi thường cùng bạn đến quán cà phê này.'] },
 youju: { n: ['邮局', 'yóujú', 'bưu điện'], d: ['我去邮局寄包裹。', 'Wǒ qù yóujú jì bāoguǒ.', 'Tôi đến bưu điện gửi bưu kiện.'] },
 banshi: { n: ['出入境管理局', 'chūrùjìng guǎnlǐjú', 'cơ quan quản lý xuất nhập cảnh'], d: ['在这儿可以办护照。', 'Zài zhèr kěyǐ bàn hùzhào.', 'Ở đây có thể làm hộ chiếu.'] }
};

Object.assign(window.GAME_PEOPLE, {
 jingcha: { n: '警察', p: 'jǐngchá', vi: 'chú cảnh sát', e: '👮' },
 dianyuan: { n: '店员', p: 'diànyuán', vi: 'nhân viên nhà sách', e: '👨‍💼' },
 zhiyuan: { n: '银行职员', p: 'yínháng zhíyuán', vi: 'nhân viên ngân hàng', e: '👩‍💼' },
 yaojishi: { n: '药剂师', p: 'yàojìshī', vi: 'dược sĩ', e: '👨‍⚕️' },
 kafeifw: { n: '服务员', p: 'fúwùyuán', vi: 'nhân viên quán cà phê', e: '💁‍♂️' },
 youjuyuan: { n: '工作人员', p: 'gōngzuò rényuán', vi: 'nhân viên bưu điện', e: '👩‍🦱' },
 banshiyuan: { n: '工作人员', p: 'gōngzuò rényuán', vi: 'nhân viên xuất nhập cảnh', e: '👨‍💼' },
 zhijiyuan: { n: '工作人员', p: 'gōngzuò rényuán', vi: 'nhân viên quầy thủ tục', e: '👩‍💼' },
 anjianyuan: { n: '安检员', p: 'ānjiǎnyuán', vi: 'nhân viên an ninh', e: '👮‍♀️' },
 kongjie: { n: '空姐', p: 'kōngjiě', vi: 'tiếp viên hàng không', e: '👩‍✈️' },
 qiantai: { n: '前台', p: 'qiántái', vi: 'lễ tân khách sạn', e: '🙋‍♀️' }
});

Object.assign(window.GAME_TALKS, {
 jingcha: { who: 'jingcha', lines: [
  ['a', '你好！需要帮忙吗？', 'Nǐ hǎo! Xūyào bāngmáng ma?', 'Chào chị! Chị cần giúp gì không?'],
  ['?', [['请问，去机场怎么走？', 'Qǐngwèn, qù jīchǎng zěnme zǒu?', 'Cho hỏi, đi sân bay thế nào ạ?', 1], ['我是警察。', 'Wǒ shì jǐngchá.', 'Tôi là cảnh sát.', 0], ['今天是我的生日。', 'Jīntiān shì wǒ de shēngrì.', 'Hôm nay là sinh nhật tôi.', 0]]],
  ['a', '你可以坐机场大巴，车站就在前面。', 'Nǐ kěyǐ zuò jīchǎng dàbā, chēzhàn jiù zài qiánmiàn.', 'Chị có thể đi xe buýt sân bay, bến xe ở ngay phía trước.'],
  ['b', '要坐多长时间？', 'Yào zuò duō cháng shíjiān?', 'Đi mất bao lâu ạ?'],
  ['a', '大概四十分钟。', 'Dàgài sìshí fēnzhōng.', 'Khoảng bốn mươi phút.'],
  ['?', [['谢谢您！', 'Xièxie nín!', 'Cảm ơn anh!', 1], ['对不起，我迟到了。', 'Duìbuqǐ, wǒ chídào le.', 'Xin lỗi, tôi đến muộn.', 0], ['我不想去。', 'Wǒ bù xiǎng qù.', 'Tôi không muốn đi.', 0]]],
  ['a', '不客气，一路顺风！', 'Bú kèqi, yílù shùnfēng!', 'Không có gì, thượng lộ bình an!'] ]},
 dianyuan: { who: 'dianyuan', lines: [
  ['a', '欢迎光临！您想买什么书？', 'Huānyíng guānglín! Nín xiǎng mǎi shénme shū?', 'Xin chào! Chị muốn mua sách gì ạ?'],
  ['?', [['我想买一本HSK四级的书。', 'Wǒ xiǎng mǎi yì běn HSK sì jí de shū.', 'Tôi muốn mua một quyển sách HSK cấp 4.', 1], ['我想喝咖啡。', 'Wǒ xiǎng hē kāfēi.', 'Tôi muốn uống cà phê.', 0], ['我住在三楼。', 'Wǒ zhù zài sān lóu.', 'Tôi sống ở tầng ba.', 0]]],
  ['a', '在那边的书架上，第三层。', 'Zài nàbian de shūjià shang, dì-sān céng.', 'Ở trên giá sách đằng kia, ngăn thứ ba.'],
  ['b', '有没有给小孩子看的中文绘本？', 'Yǒu méiyǒu gěi xiǎo háizi kàn de Zhōngwén huìběn?', 'Có sách tranh tiếng Trung cho trẻ nhỏ xem không?'],
  ['a', '有，这本很受欢迎，有拼音，也有图画。', 'Yǒu, zhè běn hěn shòu huānyíng, yǒu pīnyīn, yě yǒu túhuà.', 'Có ạ, quyển này rất được ưa chuộng, có pinyin, cũng có tranh.'],
  ['?', [['太好了！一共多少钱？', 'Tài hǎo le! Yígòng duōshao qián?', 'Tốt quá! Tổng cộng bao nhiêu tiền?', 1], ['我不喜欢看书。', 'Wǒ bù xǐhuan kàn shū.', 'Tôi không thích đọc sách.', 0], ['我要一碗米饭。', 'Wǒ yào yì wǎn mǐfàn.', 'Cho tôi một bát cơm.', 0]]],
  ['a', '一共八十五块。可以用手机付。', 'Yígòng bāshíwǔ kuài. Kěyǐ yòng shǒujī fù.', 'Tổng cộng tám mươi lăm tệ. Có thể trả bằng điện thoại.'],
  ['b', '好的，我扫码。', 'Hǎo de, wǒ sǎo mǎ.', 'Vâng, tôi quét mã.'] ]},
 kafei: { who: 'kafeifw', lines: [
  ['a', '您好，喝点儿什么？', 'Nín hǎo, hē diǎnr shénme?', 'Chào chị, chị uống gì ạ?'],
  ['?', [['我要一杯热咖啡，少放糖。', 'Wǒ yào yì bēi rè kāfēi, shǎo fàng táng.', 'Cho tôi một cốc cà phê nóng, ít đường.', 1], ['我要去机场。', 'Wǒ yào qù jīchǎng.', 'Tôi phải ra sân bay.', 0], ['我在看电视。', 'Wǒ zài kàn diànshì.', 'Tôi đang xem ti vi.', 0]]],
  ['a', '大杯还是小杯？', 'Dà bēi háishi xiǎo bēi?', 'Cốc lớn hay cốc nhỏ ạ?'],
  ['?', [['小杯就行。', 'Xiǎo bēi jiù xíng.', 'Cốc nhỏ là được.', 1], ['我是学生。', 'Wǒ shì xuésheng.', 'Tôi là học sinh.', 0], ['很好吃。', 'Hěn hǎochī.', 'Ngon lắm.', 0]]],
  ['b', '请问，无线网的密码是多少？', 'Qǐngwèn, wúxiànwǎng de mìmǎ shì duōshao?', 'Cho hỏi, mật khẩu wifi là gì vậy?'],
  ['a', '密码在杯子上。您先坐，咖啡马上就好。', 'Mìmǎ zài bēizi shang. Nín xiān zuò, kāfēi mǎshàng jiù hǎo.', 'Mật khẩu ở trên cốc. Chị ngồi trước đi, cà phê có ngay ạ.'] ]},
 xiaomei_cafe: { who: 'xiaomei', lines: [
  ['a', '你来了！你买了什么书？', 'Nǐ lái le! Nǐ mǎi le shénme shū?', 'Cậu đến rồi! Cậu mua sách gì thế?'],
  ['?', [['一本HSK的书，还有一本给宝宝的绘本。', 'Yì běn HSK de shū, hái yǒu yì běn gěi bǎobao de huìběn.', 'Một quyển sách HSK, còn có một quyển sách tranh cho bé.', 1], ['我买了一辆汽车。', 'Wǒ mǎi le yí liàng qìchē.', 'Mình mua một chiếc ô tô.', 0], ['我不认识他。', 'Wǒ bú rènshi tā.', 'Mình không quen anh ấy.', 0]]],
  ['a', '你真努力！以后你可以教宝宝说汉语了。', 'Nǐ zhēn nǔlì! Yǐhòu nǐ kěyǐ jiāo bǎobao shuō Hànyǔ le.', 'Cậu chăm thật! Sau này cậu có thể dạy bé nói tiếng Trung rồi.'],
  ['b', '对，这是我的梦想。你最近怎么样？', 'Duì, zhè shì wǒ de mèngxiǎng. Nǐ zuìjìn zěnmeyàng?', 'Ừ, đó là ước mơ của mình. Dạo này cậu thế nào?'],
  ['a', '挺好的。我和男朋友下个月去上海旅游。', 'Tǐng hǎo de. Wǒ hé nánpéngyou xià ge yuè qù Shànghǎi lǚyóu.', 'Khá ổn. Tháng sau mình với bạn trai đi du lịch Thượng Hải.'],
  ['?', [['真羡慕你们！祝你们玩得开心！', 'Zhēn xiànmù nǐmen! Zhù nǐmen wán de kāixīn!', 'Ghen tị với hai cậu quá! Chúc hai cậu đi chơi vui vẻ!', 1], ['我没去过医院。', 'Wǒ méi qù guo yīyuàn.', 'Mình chưa đi bệnh viện bao giờ.', 0], ['我的猫很胖。', 'Wǒ de māo hěn pàng.', 'Con mèo của mình rất béo.', 0]]] ]},
 youju: { who: 'youjuyuan', lines: [
  ['a', '您好，您要寄什么？', 'Nín hǎo, nín yào jì shénme?', 'Chào chị, chị muốn gửi gì ạ?'],
  ['?', [['我想寄一个包裹回老家。', 'Wǒ xiǎng jì yí ge bāoguǒ huí lǎojiā.', 'Tôi muốn gửi một bưu kiện về quê.', 1], ['我想买一张电影票。', 'Wǒ xiǎng mǎi yì zhāng diànyǐng piào.', 'Tôi muốn mua một vé xem phim.', 0], ['我想打针。', 'Wǒ xiǎng dǎ zhēn.', 'Tôi muốn tiêm.', 0]]],
  ['a', '里面是什么东西？', 'Lǐmiàn shì shénme dōngxi?', 'Bên trong là đồ gì ạ?'],
  ['?', [['是给我妈妈的衣服和茶叶。', 'Shì gěi wǒ māma de yīfu hé cháyè.', 'Là quần áo và chè gửi cho mẹ tôi.', 1], ['是一只小狗。', 'Shì yì zhī xiǎo gǒu.', 'Là một con chó nhỏ.', 0], ['是我的老师。', 'Shì wǒ de lǎoshī.', 'Là cô giáo của tôi.', 0]]],
  ['a', '好的，请填一下地址和电话。', 'Hǎo de, qǐng tián yíxià dìzhǐ hé diànhuà.', 'Vâng, chị điền giúp địa chỉ và số điện thoại nhé.'],
  ['b', '几天能到？', 'Jǐ tiān néng dào?', 'Mấy ngày thì đến ạ?'],
  ['a', '寄快递的话，两三天就到了。', 'Jì kuàidì dehuà, liǎng sān tiān jiù dào le.', 'Nếu gửi chuyển phát nhanh thì hai ba ngày là đến.'] ]},
 banshi: { who: 'banshiyuan', lines: [
  ['a', '您好，您要办什么？', 'Nín hǎo, nín yào bàn shénme?', 'Chào chị, chị cần làm thủ tục gì ạ?'],
  ['?', [['我想办护照，下个月去中国旅游。', 'Wǒ xiǎng bàn hùzhào, xià ge yuè qù Zhōngguó lǚyóu.', 'Tôi muốn làm hộ chiếu, tháng sau đi du lịch Trung Quốc.', 1], ['我想买尿不湿。', 'Wǒ xiǎng mǎi niàobùshī.', 'Tôi muốn mua bỉm.', 0], ['我想吃饺子。', 'Wǒ xiǎng chī jiǎozi.', 'Tôi muốn ăn sủi cảo.', 0]]],
  ['a', '请先拿号，然后填这张表格。', 'Qǐng xiān ná hào, ránhòu tián zhè zhāng biǎogé.', 'Mời chị lấy số trước, sau đó điền tờ khai này.'],
  ['b', '需要带什么材料？', 'Xūyào dài shénme cáiliào?', 'Cần mang những giấy tờ gì ạ?'],
  ['a', '身份证和两张照片。', 'Shēnfènzhèng hé liǎng zhāng zhàopiàn.', 'Căn cước và hai tấm ảnh.'],
  ['?', [['都带来了，给您。', 'Dōu dài lái le, gěi nín.', 'Tôi mang đủ rồi, gửi anh.', 1], ['我没有名字。', 'Wǒ méiyǒu míngzi.', 'Tôi không có tên.', 0], ['我喜欢拍照。', 'Wǒ xǐhuan pāi zhào.', 'Tôi thích chụp ảnh.', 0]]],
  ['a', '好的。护照办好以后，签证要去中国大使馆办。', 'Hǎo de. Hùzhào bàn hǎo yǐhòu, qiānzhèng yào qù Zhōngguó dàshǐguǎn bàn.', 'Được rồi. Làm xong hộ chiếu, visa thì phải đến Đại sứ quán Trung Quốc làm.'],
  ['b', '明白了，谢谢！', 'Míngbai le, xièxie!', 'Tôi hiểu rồi, cảm ơn anh!'] ]},
 yinhang: { who: 'zhiyuan', lines: [
  ['a', '您好，请问您要办什么业务？', 'Nín hǎo, qǐngwèn nín yào bàn shénme yèwù?', 'Chào chị, chị muốn làm giao dịch gì ạ?'],
  ['?', [['我想换人民币。', 'Wǒ xiǎng huàn Rénmínbì.', 'Tôi muốn đổi Nhân dân tệ.', 1], ['我想看病。', 'Wǒ xiǎng kàn bìng.', 'Tôi muốn khám bệnh.', 0], ['我想买一本书。', 'Wǒ xiǎng mǎi yì běn shū.', 'Tôi muốn mua một quyển sách.', 0]]],
  ['a', '您要换多少？', 'Nín yào huàn duōshao?', 'Chị muốn đổi bao nhiêu ạ?'],
  ['?', [['换三千块人民币。', 'Huàn sānqiān kuài Rénmínbì.', 'Đổi ba nghìn tệ.', 1], ['三点半。', 'Sān diǎn bàn.', 'Ba giờ rưỡi.', 0], ['三个人。', 'Sān ge rén.', 'Ba người.', 0]]],
  ['a', '好的，请出示您的护照。', 'Hǎo de, qǐng chūshì nín de hùzhào.', 'Vâng, mời chị xuất trình hộ chiếu.'],
  ['b', '给您。今天的汇率是多少？', 'Gěi nín. Jīntiān de huìlǜ shì duōshao?', 'Gửi chị. Tỷ giá hôm nay là bao nhiêu?'],
  ['a', '汇率在屏幕上。请在这儿签名。', 'Huìlǜ zài píngmù shang. Qǐng zài zhèr qiānmíng.', 'Tỷ giá ở trên màn hình. Mời chị ký tên ở đây.'] ]},
 zhiji: { who: 'zhijiyuan', lines: [
  ['a', '您好，请出示您的护照。', 'Nín hǎo, qǐng chūshì nín de hùzhào.', 'Chào chị, mời chị xuất trình hộ chiếu.'],
  ['b', '给您。我去上海。', 'Gěi nín. Wǒ qù Shànghǎi.', 'Gửi chị. Tôi đi Thượng Hải.'],
  ['a', '您有行李要托运吗？', 'Nín yǒu xíngli yào tuōyùn ma?', 'Chị có hành lý cần ký gửi không ạ?'],
  ['?', [['有一个行李箱。', 'Yǒu yí ge xínglixiāng.', 'Có một chiếc va li.', 1], ['我很饿。', 'Wǒ hěn è.', 'Tôi đói lắm.', 0], ['我不会游泳。', 'Wǒ bú huì yóuyǒng.', 'Tôi không biết bơi.', 0]]],
  ['a', '请放在这儿。您要靠窗的座位还是靠过道的？', 'Qǐng fàng zài zhèr. Nín yào kào chuāng de zuòwèi háishi kào guòdào de?', 'Mời đặt lên đây. Chị muốn ghế cạnh cửa sổ hay cạnh lối đi?'],
  ['?', [['靠窗的，谢谢。', 'Kào chuāng de, xièxie.', 'Cạnh cửa sổ, cảm ơn.', 1], ['我要两杯咖啡。', 'Wǒ yào liǎng bēi kāfēi.', 'Cho tôi hai cốc cà phê.', 0], ['我在银行工作。', 'Wǒ zài yínháng gōngzuò.', 'Tôi làm ở ngân hàng.', 0]]],
  ['a', '这是您的登机牌。十点在十二号登机口登机。', 'Zhè shì nín de dēngjīpái. Shí diǎn zài shí\'èr hào dēngjīkǒu dēngjī.', 'Đây là thẻ lên máy bay của chị. 10 giờ lên máy bay ở cửa số 12.'],
  ['b', '谢谢！', 'Xièxie!', 'Cảm ơn!'] ]},
 anjian: { who: 'anjianyuan', lines: [
  ['a', '请把包放在这里，手机和电脑拿出来。', 'Qǐng bǎ bāo fàng zài zhèlǐ, shǒujī hé diànnǎo ná chūlai.', 'Mời đặt túi ở đây, lấy điện thoại và máy tính ra.'],
  ['b', '好的。', 'Hǎo de.', 'Vâng.'],
  ['a', '你的包里有水吗？', 'Nǐ de bāo li yǒu shuǐ ma?', 'Trong túi của chị có nước không?'],
  ['?', [['有一瓶水。', 'Yǒu yì píng shuǐ.', 'Có một chai nước.', 1], ['有两个人。', 'Yǒu liǎng ge rén.', 'Có hai người.', 0], ['今天是星期五。', 'Jīntiān shì xīngqīwǔ.', 'Hôm nay là thứ Sáu.', 0]]],
  ['a', '对不起，水不能带上飞机。', 'Duìbuqǐ, shuǐ bù néng dài shàng fēijī.', 'Xin lỗi, nước không được mang lên máy bay.'],
  ['?', [['那我现在把它喝了。', 'Nà wǒ xiànzài bǎ tā hē le.', 'Vậy tôi uống hết luôn bây giờ.', 1], ['我想坐出租车。', 'Wǒ xiǎng zuò chūzūchē.', 'Tôi muốn đi taxi.', 0], ['这是我的书。', 'Zhè shì wǒ de shū.', 'Đây là sách của tôi.', 0]]],
  ['a', '好，没问题了，请走吧。', 'Hǎo, méi wèntí le, qǐng zǒu ba.', 'Được, không có vấn đề gì nữa, mời đi.'] ]},
 kongjie: { who: 'kongjie', lines: [
  ['a', '您好，请系好安全带。', 'Nín hǎo, qǐng jì hǎo ānquándài.', 'Chào chị, mời chị thắt dây an toàn.'],
  ['b', '好的。请问，到上海要飞多长时间？', 'Hǎo de. Qǐngwèn, dào Shànghǎi yào fēi duō cháng shíjiān?', 'Vâng. Cho hỏi bay đến Thượng Hải mất bao lâu?'],
  ['a', '大概三个小时。您想喝点儿什么？', 'Dàgài sān ge xiǎoshí. Nín xiǎng hē diǎnr shénme?', 'Khoảng ba tiếng. Chị muốn uống gì ạ?'],
  ['?', [['请给我一杯橙汁。', 'Qǐng gěi wǒ yì bēi chéngzhī.', 'Cho tôi một cốc nước cam.', 1], ['请给我一张床。', 'Qǐng gěi wǒ yì zhāng chuáng.', 'Cho tôi một cái giường.', 0], ['我想下车。', 'Wǒ xiǎng xià chē.', 'Tôi muốn xuống xe.', 0]]],
  ['a', '好的。您冷吗？要不要毯子？', 'Hǎo de. Nín lěng ma? Yào bu yào tǎnzi?', 'Vâng. Chị có lạnh không? Có cần chăn không ạ?'],
  ['?', [['要，谢谢你！', 'Yào, xièxie nǐ!', 'Có, cảm ơn cô!', 1], ['我在银行工作。', 'Wǒ zài yínháng gōngzuò.', 'Tôi làm ở ngân hàng.', 0], ['明天见。', 'Míngtiān jiàn.', 'Mai gặp lại.', 0]]],
  ['a', '不客气，祝您旅途愉快！', 'Bú kèqi, zhù nín lǚtú yúkuài!', 'Không có gì, chúc chị chuyến đi vui vẻ!'] ]},
 qiantai: { who: 'qiantai', lines: [
  ['a', '您好，欢迎入住！请问您有预订吗？', 'Nín hǎo, huānyíng rùzhù! Qǐngwèn nín yǒu yùdìng ma?', 'Xin chào, chào mừng chị! Chị đã đặt phòng trước chưa ạ?'],
  ['?', [['有，我在网上订了一个房间。', 'Yǒu, wǒ zài wǎng shang dìng le yí ge fángjiān.', 'Có, tôi đã đặt một phòng trên mạng.', 1], ['我是医生。', 'Wǒ shì yīshēng.', 'Tôi là bác sĩ.', 0], ['我要一杯咖啡。', 'Wǒ yào yì bēi kāfēi.', 'Cho tôi một cốc cà phê.', 0]]],
  ['a', '请给我看一下您的护照。', 'Qǐng gěi wǒ kàn yíxià nín de hùzhào.', 'Chị cho tôi xem hộ chiếu một chút.'],
  ['b', '给您。早餐几点开始？', 'Gěi nín. Zǎocān jǐ diǎn kāishǐ?', 'Gửi chị. Bữa sáng mấy giờ bắt đầu?'],
  ['a', '早上七点到十点，在二楼。这是您的房卡，八零八房间。', 'Zǎoshang qī diǎn dào shí diǎn, zài èr lóu. Zhè shì nín de fángkǎ, bā líng bā fángjiān.', 'Từ 7 đến 10 giờ sáng, ở tầng hai. Đây là thẻ phòng của chị, phòng 808.'],
  ['?', [['谢谢！电梯在哪儿？', 'Xièxie! Diàntī zài nǎr?', 'Cảm ơn! Thang máy ở đâu ạ?', 1], ['我明天上班。', 'Wǒ míngtiān shàng bān.', 'Mai tôi đi làm.', 0], ['我不想吃饭。', 'Wǒ bù xiǎng chī fàn.', 'Tôi không muốn ăn cơm.', 0]]],
  ['a', '在您的右边。祝您住得愉快！', 'Zài nín de yòubian. Zhù nín zhù de yúkuài!', 'Ở bên phải chị. Chúc chị ở vui vẻ!'] ]},
 yaoshi: { who: 'yaojishi', lines: [
  ['a', '您好，哪里不舒服？', 'Nín hǎo, nǎlǐ bù shūfu?', 'Chào chị, chị thấy khó chịu ở đâu?'],
  ['?', [['我的孩子发烧了，三十八度。', 'Wǒ de háizi fā shāo le, sānshíbā dù.', 'Con tôi bị sốt, 38 độ.', 1], ['我想买面包。', 'Wǒ xiǎng mǎi miànbāo.', 'Tôi muốn mua bánh mì.', 0], ['我的手机坏了。', 'Wǒ de shǒujī huài le.', 'Điện thoại của tôi hỏng rồi.', 0]]],
  ['a', '孩子几岁了？', 'Háizi jǐ suì le?', 'Bé mấy tuổi rồi?'],
  ['?', [['两岁了。', 'Liǎng suì le.', 'Hai tuổi rồi.', 1], ['两块钱。', 'Liǎng kuài qián.', 'Hai tệ.', 0], ['两点了。', 'Liǎng diǎn le.', 'Hai giờ rồi.', 0]]],
  ['a', '这是儿童退烧药，用量写在盒子上。', 'Zhè shì értóng tuìshāoyào, yòngliàng xiě zài hézi shang.', 'Đây là thuốc hạ sốt cho trẻ em, liều dùng ghi trên hộp.'],
  ['b', '要是一直不退烧呢？', 'Yàoshi yìzhí bú tuì shāo ne?', 'Nếu sốt mãi không hạ thì sao ạ?'],
  ['a', '那就要马上去医院。多给孩子喝水。', 'Nà jiù yào mǎshàng qù yīyuàn. Duō gěi háizi hē shuǐ.', 'Thế thì phải đi bệnh viện ngay. Cho bé uống nhiều nước nhé.'],
  ['b', '谢谢您！', 'Xièxie nín!', 'Cảm ơn anh!'] ]},
 st_sot1: { who: 'popo', lines: [
  ['a', '宝宝的头有点儿热，好像发烧了。', 'Bǎobao de tóu yǒudiǎnr rè, hǎoxiàng fā shāo le.', 'Đầu bé hơi nóng, hình như bị sốt rồi.'],
  ['?', [['我马上去药店买退烧药。', 'Wǒ mǎshàng qù yàodiàn mǎi tuìshāoyào.', 'Con đi nhà thuốc mua thuốc hạ sốt ngay.', 1], ['我想去公园玩。', 'Wǒ xiǎng qù gōngyuán wán.', 'Con muốn đi công viên chơi.', 0], ['今天很冷。', 'Jīntiān hěn lěng.', 'Hôm nay lạnh lắm.', 0]]],
  ['a', '好，路上小心。我先给宝宝量一下体温。', 'Hǎo, lù shang xiǎoxīn. Wǒ xiān gěi bǎobao liáng yíxià tǐwēn.', 'Ừ, đi đường cẩn thận. Mẹ đo nhiệt độ cho bé trước.'],
  ['b', '谢谢妈！', 'Xièxie mā!', 'Con cảm ơn mẹ!'] ]},
 st_sot3: { who: 'laogong', lines: [
  ['a', '药买到了吗？宝宝怎么样了？', 'Yào mǎi dào le ma? Bǎobao zěnmeyàng le?', 'Mua được thuốc chưa em? Bé sao rồi?'],
  ['?', [['买到了，吃了药以后好多了。', 'Mǎi dào le, chī le yào yǐhòu hǎo duō le.', 'Mua được rồi, uống thuốc xong đỡ nhiều rồi.', 1], ['我买了一辆自行车。', 'Wǒ mǎi le yí liàng zìxíngchē.', 'Em mua một chiếc xe đạp.', 0], ['今天星期天。', 'Jīntiān xīngqītiān.', 'Hôm nay Chủ nhật.', 0]]],
  ['a', '太好了！你辛苦了，今天早点儿休息吧。', 'Tài hǎo le! Nǐ xīnkǔ le, jīntiān zǎo diǎnr xiūxi ba.', 'Tốt quá! Em vất vả rồi, hôm nay nghỉ sớm đi.'] ]}
});

window.GAME_STORIES = window.GAME_STORIES.concat([
 { id: 'sot', name: 'Bé bị sốt', zh: '宝宝发烧了', emo: '🤒', steps: [
   { scene: 'bep', obj: '婆婆', talk: 'st_sot1', goal: 'Vào bếp, mẹ chồng báo bé bị sốt' },
   { scene: 'yaodian', obj: '药剂师', talk: 'yaoshi', goal: 'Ra trung tâm, vào nhà thuốc hỏi dược sĩ' },
   { scene: 'nha', obj: '老公', talk: 'st_sot3', goal: 'Về nhà, kể cho chồng nghe' } ]},
 { id: 'sach', name: 'Đi nhà sách, cà phê', zh: '去书店买书', emo: '📚', steps: [
   { scene: 'shudian', obj: '店员', talk: 'dianyuan', goal: 'Ra trung tâm, vào nhà sách mua sách HSK và sách tranh cho bé' },
   { scene: 'kafei', obj: '服务员', talk: 'kafei', goal: 'Sang quán cà phê gọi đồ uống' },
   { scene: 'kafei', obj: '朋友', talk: 'xiaomei_cafe', goal: 'Ngồi nói chuyện với Tiểu Mỹ' } ]},
 { id: 'dulich', name: 'Đi du lịch Thượng Hải', zh: '去上海旅游', emo: '🧳', steps: [
   { scene: 'banshi', obj: '工作人员', talk: 'banshi', goal: 'Đến phòng xuất nhập cảnh làm hộ chiếu' },
   { scene: 'yinhang', obj: '职员', talk: 'yinhang', goal: 'Vào ngân hàng đổi Nhân dân tệ' },
   { scene: 'pho2', obj: '警察', talk: 'jingcha', goal: 'Hỏi chú cảnh sát đường ra sân bay' },
   { scene: 'jichang', obj: '工作人员', talk: 'zhiji', goal: 'Ở sân bay, làm thủ tục và gửi va li' },
   { scene: 'jichang', obj: '安检员', talk: 'anjian', goal: 'Qua cửa kiểm tra an ninh' },
   { scene: 'feiji', obj: '空姐', talk: 'kongjie', goal: 'Lên máy bay, nói chuyện với tiếp viên' },
   { scene: 'jiudian', obj: '前台', talk: 'qiantai', goal: 'Đến khách sạn, nhận phòng ở quầy lễ tân' } ]}
]);
