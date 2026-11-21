// Nội dung khu Ba Mẹ. Truyện tranh: mỗi khung = cảnh + nhân vật + đồ vật (hình 3D Fluent, MIT) + lời thoại.
// who: m = mẹ, k = bé, d = ba. kid: stand | bed | bath | sit. mom: stand | walk | cook. props: [tên hình, x%, y%, rộng%]
window.EPISODES = [
 { id: 'sang', vi: 'Buổi sáng thức dậy', en: 'Good morning', icon: 'sun-with-face', panels: [
  { scene: 'bedroom', kid: 'bed', mom: 'stand', props: [['window', 6, 12, 22], ['teddy-bear', 80, 62, 14]], lines: [['m', 'Good morning, sweetie!', 'Chào buổi sáng, con yêu!']] },
  { scene: 'bedroom', kid: 'bed', mom: 'stand', props: [['window', 6, 12, 22]], lines: [['k', 'Good morning, Mommy!', 'Con chào mẹ buổi sáng!']] },
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['bed', 62, 52, 34]], lines: [['m', 'Did you sleep well?', 'Con ngủ ngon không?'], ['k', 'Yes!', 'Dạ có!']] },
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['window', 34, 8, 30], ['sun-with-face', 44, 12, 12]], lines: [['m', "Let's open the curtains. Look, it's sunny!", 'Mình mở rèm nào. Nhìn kìa, trời nắng!']] } ] },
 { id: 'rang', vi: 'Đánh răng', en: 'Brushing teeth', icon: 'toothbrush', panels: [
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['toothbrush', 44, 30, 14]], lines: [['m', 'Time to brush your teeth.', 'Tới giờ đánh răng rồi con.']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['toothbrush', 44, 30, 14]], lines: [['m', 'Open your mouth. Say "ahh"!', 'Con há miệng ra. Nói "a" nào!'], ['k', 'Ahh!', 'A!']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['bubbles', 42, 22, 16]], lines: [['m', 'Brush, brush, brush. Up and down.', 'Chải, chải, chải. Lên rồi xuống.']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['sparkles', 40, 14, 16]], lines: [['m', 'All clean! Show me a big smile.', 'Sạch rồi! Cười thật tươi cho mẹ xem nào.'], ['k', 'Cheese!', 'Cười nè!']] } ] },
 { id: 'an', vi: 'Ăn sáng', en: 'Breakfast', icon: 'bread', panels: [
  { scene: 'kitchen', kid: 'sit', mom: 'cook', props: [], lines: [['m', 'Are you hungry?', 'Con đói bụng chưa?'], ['k', "Yes, I'm hungry!", 'Dạ, con đói!']] },
  { scene: 'kitchen', kid: 'sit', mom: 'stand', props: [['glass-of-milk', 40, 44, 11], ['bread', 52, 50, 12]], lines: [['m', "Here's your milk and bread.", 'Sữa với bánh mì của con đây.']] },
  { scene: 'kitchen', kid: 'sit', mom: 'stand', props: [['bread', 50, 50, 12]], lines: [['m', 'Is it yummy?', 'Có ngon không con?'], ['k', 'Yummy!', 'Ngon quá!']] },
  { scene: 'kitchen', kid: 'sit', mom: 'stand', props: [['bowl-with-spoon', 46, 50, 13]], lines: [['m', 'All done? Good job!', 'Ăn hết rồi hả? Giỏi quá!']] } ] },
 { id: 'mac', vi: 'Mặc quần áo', en: 'Getting dressed', icon: 't-shirt', panels: [
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['t-shirt', 42, 30, 14]], lines: [['m', "Let's get dressed.", 'Mình mặc đồ nào.']] },
  { scene: 'bedroom', kid: 'arms', mom: 'stand', props: [['t-shirt', 42, 14, 14]], lines: [['m', 'Arms up! Shirt on.', 'Giơ tay lên! Mặc áo vào.']] },
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['jeans', 42, 34, 14]], lines: [['m', 'Now your pants. One leg, two legs.', 'Giờ tới quần. Một chân, hai chân.']] },
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['socks', 38, 62, 11], ['running-shoe', 50, 66, 12]], lines: [['m', 'Socks and shoes. Ready to go!', 'Vớ với giày. Sẵn sàng đi thôi!']] } ] },
 { id: 'rua', vi: 'Rửa tay', en: 'Washing hands', icon: 'soap', panels: [
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['droplet', 44, 26, 10]], lines: [['m', "Let's wash your hands.", 'Mình đi rửa tay nha.']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['droplet', 44, 26, 10]], lines: [['m', 'Turn on the water.', 'Mở nước ra.']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['soap', 42, 30, 13], ['bubbles', 50, 18, 12]], lines: [['m', 'Soap, soap. Rub, rub, rub.', 'Xà phòng nè. Chà, chà, chà.']] },
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['sparkles', 42, 18, 14]], lines: [['m', 'Rinse and dry. All clean!', 'Xả nước rồi lau khô. Sạch bong!']] } ] },
 { id: 'choi', vi: 'Giờ chơi', en: 'Playtime', icon: 'soccer-ball', panels: [
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['soccer-ball', 44, 66, 11]], lines: [['m', 'Do you want to play?', 'Con muốn chơi không?'], ['k', 'Yes! Ball, please!', 'Dạ! Cho con quả bóng!']] },
  { scene: 'living', kid: 'arms', mom: 'stand', props: [['soccer-ball', 44, 20, 11]], lines: [['m', 'Catch the ball!', 'Bắt bóng nè!']] },
  { scene: 'living', kid: 'arms', mom: 'stand', props: [['soccer-ball', 54, 24, 11]], lines: [['m', 'Throw it to Mommy!', 'Ném cho mẹ đi!']] },
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['sparkles', 40, 16, 14]], lines: [['m', 'Great throw! Again?', 'Ném giỏi quá! Chơi nữa không?'], ['k', 'Again!', 'Nữa!']] } ] },
 { id: 'don', vi: 'Dọn đồ chơi', en: 'Clean up', icon: 'package', panels: [
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['teddy-bear', 36, 64, 11], ['puzzle-piece', 52, 70, 9], ['soccer-ball', 60, 66, 9]], lines: [['m', "It's time to clean up.", 'Tới giờ dọn dẹp rồi.']] },
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['package', 44, 60, 16]], lines: [['m', 'Put the toys in the box.', 'Bỏ đồ chơi vô hộp nha.']] },
  { scene: 'living', kid: 'arms', mom: 'stand', props: [['package', 44, 60, 16], ['teddy-bear', 46, 46, 10]], lines: [['m', 'Can you help me?', 'Con giúp mẹ được không?'], ['k', 'I can help!', 'Con giúp được!']] },
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['red-heart', 44, 18, 12]], lines: [['m', "Thank you! You're a great helper.", 'Cảm ơn con! Con giúp mẹ giỏi lắm.']] } ] },
 { id: 'congvien', vi: 'Đi công viên', en: 'At the park', icon: 'playground-slide', panels: [
  { scene: 'park', kid: 'stand', mom: 'walk', props: [['deciduous-tree', 4, 14, 26]], lines: [['m', "Let's go to the park!", 'Mình đi công viên nào!']] },
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['running-shoe', 44, 66, 12]], lines: [['m', 'Put on your shoes.', 'Con mang giày vào.']] },
  { scene: 'park', kid: 'arms', mom: 'stand', props: [['bird', 44, 10, 13], ['deciduous-tree', 4, 14, 26]], lines: [['m', 'Look! A bird!', 'Nhìn kìa! Con chim!'], ['k', 'Bird! Tweet, tweet!', 'Con chim! Chíp chíp!']] },
  { scene: 'park', kid: 'stand', mom: 'stand', props: [['playground-slide', 36, 38, 30]], lines: [['m', 'Do you want to go down the slide?', 'Con muốn chơi cầu tuột không?'], ['k', 'Yes! Wheee!', 'Có! Vèo!']] } ] },
 { id: 'tam', vi: 'Giờ tắm', en: 'Bath time', icon: 'bathtub', panels: [
  { scene: 'bathroom', kid: 'stand', mom: 'stand', props: [['bathtub', 36, 54, 28]], lines: [['m', 'Bath time!', 'Tới giờ tắm rồi!']] },
  { scene: 'bathroom', kid: 'bath', mom: 'stand', props: [], lines: [['m', 'Is the water warm?', 'Nước ấm không con?'], ['k', 'Warm!', 'Ấm!']] },
  { scene: 'bathroom', kid: 'bath', mom: 'stand', props: [['shower', 60, 8, 14]], lines: [['m', "Let's wash your hair. Close your eyes.", 'Mình gội đầu nha. Nhắm mắt lại nào.']] },
  { scene: 'bathroom', kid: 'bath', mom: 'stand', props: [['bubbles', 60, 20, 14]], lines: [['m', 'Splash, splash! So many bubbles!', 'Bì bõm, bì bõm! Nhiều bong bóng quá!']] } ] },
 { id: 'ngu', vi: 'Đi ngủ', en: 'Bedtime', icon: 'crescent-moon', night: true, panels: [
  { scene: 'bedroom', kid: 'stand', mom: 'stand', props: [['window', 6, 12, 22], ['crescent-moon', 11, 16, 9]], lines: [['m', "It's bedtime.", 'Tới giờ đi ngủ rồi.']] },
  { scene: 'bedroom', kid: 'bed', mom: 'stand', props: [['open-book', 42, 30, 14]], lines: [['m', "Let's read a book.", 'Mình đọc sách nha.']] },
  { scene: 'bedroom', kid: 'arms', mom: 'stand', props: [['red-heart', 44, 14, 12]], lines: [['m', 'Give Mommy a hug.', 'Ôm mẹ một cái nào.'], ['k', 'I love you, Mommy!', 'Con thương mẹ!']] },
  { scene: 'bedroom', kid: 'bed', mom: 'stand', props: [['crescent-moon', 11, 16, 9], ['star', 24, 10, 6]], lines: [['m', 'I love you too. Good night!', 'Mẹ cũng thương con. Chúc con ngủ ngon!']] } ] },
 { id: 'sieuthi', vi: 'Đi siêu thị', en: 'At the supermarket', icon: 'shopping-cart', panels: [
  { scene: 'shop', kid: 'stand', mom: 'walk', props: [['shopping-cart', 40, 52, 22]], lines: [['m', "We're going shopping.", 'Mình đi mua sắm nha.']] },
  { scene: 'shop', kid: 'arms', mom: 'stand', props: [['red-apple', 44, 22, 12]], lines: [['m', 'What color is the apple?', 'Quả táo màu gì nè?'], ['k', 'Red!', 'Màu đỏ!']] },
  { scene: 'shop', kid: 'stand', mom: 'stand', props: [['banana', 42, 24, 16]], lines: [['m', "How many bananas? Let's count: one, two, three!", 'Mấy quả chuối? Mình đếm nha: một, hai, ba!']] },
  { scene: 'shop', kid: 'stand', mom: 'stand', props: [['basket', 42, 56, 16]], lines: [['m', 'Put it in the basket. Thank you!', 'Bỏ vô giỏ nha. Cảm ơn con!']] } ] },
 { id: 'dau', vi: 'Khi bé bị đau', en: 'Ouch!', icon: 'red-heart', panels: [
  { scene: 'park', kid: 'sad', mom: 'walk', props: [['deciduous-tree', 4, 14, 26]], lines: [['m', 'Oh no! Are you okay?', 'Ôi không! Con có sao không?'], ['k', 'Ouch!', 'Đau quá!']] },
  { scene: 'park', kid: 'sad', mom: 'stand', props: [], lines: [['m', 'Where does it hurt?', 'Con đau ở đâu?'], ['k', 'Here.', 'Ở đây nè.']] },
  { scene: 'park', kid: 'sad', mom: 'stand', props: [['red-heart', 44, 20, 10]], lines: [['m', 'Let me kiss it better.', 'Để mẹ thơm cho hết đau nha.']] },
  { scene: 'park', kid: 'stand', mom: 'stand', props: [['sparkles', 42, 16, 12]], lines: [['m', 'All better?', 'Hết đau chưa con?'], ['k', 'All better!', 'Hết đau rồi!']] } ] },
 { id: 'tamviet', vi: 'Tạm biệt ba', en: 'Bye-bye, Daddy', icon: 'door', panels: [
  { scene: 'living', kid: 'stand', mom: 'dad', props: [['door', 4, 26, 18]], lines: [['m', 'Daddy is going to work.', 'Ba đi làm rồi nè.']] },
  { scene: 'living', kid: 'arms', mom: 'dad', props: [['door', 4, 26, 18]], lines: [['m', 'Say bye-bye to Daddy!', 'Con chào tạm biệt ba đi!'], ['k', 'Bye-bye, Daddy!', 'Con chào ba!']] },
  { scene: 'living', kid: 'stand', mom: 'dad', props: [['red-heart', 44, 18, 10]], lines: [['d', 'See you later! I love you.', 'Chiều ba về nha! Ba thương con.']] },
  { scene: 'living', kid: 'arms', mom: 'dad', props: [['door', 4, 26, 18]], lines: [['d', "I'm home!", 'Ba về rồi nè!'], ['k', 'Daddy!', 'Ba ơi!']] } ] },
 { id: 'mua', vi: 'Trời mưa', en: 'Rainy day', icon: 'umbrella', panels: [
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['window', 34, 8, 30], ['cloud-with-rain', 41, 12, 16]], lines: [['m', "Look outside. It's raining!", 'Nhìn ra ngoài kìa. Trời mưa!']] },
  { scene: 'living', kid: 'stand', mom: 'stand', props: [['umbrella', 42, 30, 16]], lines: [['m', "Let's take an umbrella.", 'Mình lấy cây dù nha.']] },
  { scene: 'rain', kid: 'arms', mom: 'stand', props: [['umbrella', 60, 10, 22], ['droplet', 30, 76, 8]], lines: [['m', 'Jump in the puddle!', 'Nhảy vô vũng nước nào!'], ['k', 'Splash!', 'Tõm!']] },
  { scene: 'rain', kid: 'stand', mom: 'walk', props: [['umbrella', 60, 10, 22]], lines: [['m', "We're wet! Let's go home.", 'Ướt hết rồi! Mình về nhà thôi.']] } ] },
];

// Câu nói hằng ngày ba mẹ nói với con
window.PHRASES = [
 { vi: 'Khen con', icon: 'clapping-hands', list: [['Good job!', 'Giỏi lắm!'], ['Well done!', 'Làm tốt lắm!'], ['You did it!', 'Con làm được rồi!'], ['High five!', 'Đập tay nào!'], ['I\'m so proud of you.', 'Mẹ tự hào về con lắm.'], ['Nice try!', 'Con thử giỏi lắm!']] },
 { vi: 'Yêu thương', icon: 'red-heart', list: [['I love you.', 'Mẹ thương con.'], ['Give me a hug.', 'Ôm mẹ cái nào.'], ['Big kiss!', 'Thơm một cái thật kêu!'], ['You are my sunshine.', 'Con là ánh nắng của mẹ.'], ['I\'m here.', 'Có mẹ đây.']] },
 { vi: 'Hỏi con', icon: 'speaking-head', list: [['What\'s this?', 'Cái gì đây?'], ['Where is the ball?', 'Quả bóng đâu rồi?'], ['What color is it?', 'Nó màu gì?'], ['How many?', 'Bao nhiêu cái?'], ['Do you want some water?', 'Con muốn uống nước không?'], ['Are you hungry?', 'Con đói không?'], ['Are you tired?', 'Con mệt không?']] },
 { vi: 'Nhắc nhở nhẹ nhàng', icon: 'raising-hands', list: [['Come here, please.', 'Lại đây con.'], ['Sit down, please.', 'Con ngồi xuống nha.'], ['Wait a minute.', 'Đợi chút nha.'], ['Be gentle.', 'Nhẹ tay thôi con.'], ['Gently, please.', 'Nhẹ nhàng nha con.'], ['Use your words.', 'Con nói ra cho mẹ nghe nha.'], ['Let\'s take turns.', 'Mình thay phiên nhau nha.']] },
 { vi: 'An toàn', icon: 'warning', list: [['Careful!', 'Cẩn thận!'], ['It\'s hot!', 'Nóng đó!'], ['Hold my hand.', 'Nắm tay mẹ nè.'], ['Don\'t touch.', 'Đừng đụng vào.'], ['Stop!', 'Dừng lại!'], ['Slow down.', 'Đi chậm thôi.']] },
 { vi: 'Lịch sự', icon: 'folded-hands', list: [['Please.', 'Làm ơn / Nha.'], ['Thank you.', 'Cảm ơn.'], ['You\'re welcome.', 'Không có chi.'], ['Sorry.', 'Xin lỗi.'], ['Excuse me.', 'Xin phép / Cho qua nhé.'], ['Hello! / Bye-bye!', 'Xin chào! / Tạm biệt!']] },
 { vi: 'Cảm xúc', icon: 'pleading-face', list: [['Are you okay?', 'Con có sao không?'], ['Are you sad?', 'Con buồn hả?'], ['It\'s okay to cry.', 'Khóc cũng không sao đâu.'], ['Let\'s calm down.', 'Mình bình tĩnh lại nha.'], ['Take a deep breath.', 'Hít một hơi thật sâu nào.'], ['You look happy!', 'Nhìn con vui quá!']] },
];

// Cách dạy con
window.TIPS = [
 ['⏰', 'Ít mà đều', 'Mỗi ngày 15–20 phút đều đặn tốt hơn học dồn 2 tiếng cuối tuần. Bé 2 tuổi tập trung được vài phút mỗi lần, nên chia nhỏ ra.'],
 ['👉', 'Câu ngắn, chỉ vào đồ thật', 'Nói chậm, 2–4 chữ, vừa nói vừa chỉ: "Look, a ball!" Bé hiểu nghĩa qua đồ vật, không cần dịch.'],
 ['🔁', 'Lặp lại thật nhiều', 'Một từ cần nghe rất nhiều lần mới nhớ. Dùng lại cùng một câu ở nhiều lúc: lúc ăn, lúc tắm, lúc chơi.'],
 ['🛁', 'Học qua sinh hoạt', 'Gắn tiếng Anh vào việc hằng ngày: đánh răng, mặc đồ, đi ngủ. Xem mục Hội thoại thường ngày để có câu mẫu.'],
 ['🎵', 'Hát và vận động', 'Bài hát có động tác như "Head, Shoulders, Knees and Toes" giúp bé nhớ lâu. Mở ở mục Video, ba mẹ hát và làm theo cùng con.'],
 ['🤫', 'Đừng ép con nói', 'Bé thường nghe rất lâu rồi mới nói, đó là bình thường. Khi bé thử nói, khen ngay dù nói chưa đúng.'],
 ['🗣️', 'Nói lại cho đúng, không chê', 'Bé nói "Dog big!", ba mẹ nhắc lại nhẹ nhàng: "Yes, a big dog!" Không bắt bé lặp lại.'],
 ['📖', 'Đọc sách tranh trước khi ngủ', 'Mỗi tối một cuốn sách tranh ngắn. Chỉ vào hình và hỏi: "Where is the cat?"'],
 ['🙌', 'Chơi trò chơi', 'Ú òa (Peekaboo), "Simon says: touch your nose!", tìm đồ vật "Where is the red ball?". Vừa chơi vừa học.'],
 ['📱', 'Màn hình có giới hạn', 'Tổ chức Y tế Thế giới khuyên trẻ 2–4 tuổi xem màn hình không quá 1 giờ mỗi ngày. Tốt nhất ba mẹ ngồi xem cùng và nói chuyện với con về video.'],
 ['😊', 'Ba mẹ phát âm chưa chuẩn cũng không sao', 'Cứ tự tin nói với con. Bấm nút loa 🔊 trong web để nghe mẫu và nói theo cùng con.'],
 ['🏆', 'Khen và thưởng sao', 'Mỗi khi học xong, bé được sao ở mục Thành tích. Ba mẹ khen to: "Good job! You got a star!"'],
];

// Hoạt động theo chủ đề: [chủ đề, việc làm, câu mẫu[]]
window.ACTIVITIES = [
 ['fruits', 'Bày vài loại trái cây thật lên bàn. Cho bé cầm, ngửi, nếm rồi gọi tên.', [['This is a banana.', 'Đây là quả chuối.'], ["It's yellow.", 'Nó màu vàng.'], ["Let's peel it!", 'Mình bóc vỏ nào!'], ['Yummy!', 'Ngon quá!']]],
 ['animals', 'Xem hình con vật, ba mẹ giả tiếng kêu để bé đoán.', [['What does the dog say?', 'Con chó kêu sao?'], ['Woof, woof!', 'Gâu gâu!'], ['The cat says meow.', 'Con mèo kêu meo meo.'], ['Where is the cow?', 'Con bò đâu rồi?']]],
 ['colors', 'Đi tìm đồ vật cùng màu trong nhà, gom vào một chỗ.', [['Find something red!', 'Tìm cái gì màu đỏ đi con!'], ['Is it blue?', 'Nó màu xanh dương hả?'], ['Red, red, red!', 'Đỏ, đỏ, đỏ!'], ['My favorite color is pink.', 'Màu mẹ thích là màu hồng.']]],
 ['numbers', 'Đếm mọi thứ: bậc cầu thang, ngón tay, viên kẹo.', [["Let's count!", 'Mình đếm nào!'], ['One, two, three!', 'Một, hai, ba!'], ['How many fingers?', 'Mấy ngón tay?'], ['Three cookies for you.', 'Ba cái bánh cho con.']]],
 ['body', 'Chơi "Simon says": chạm vào bộ phận cơ thể theo lời ba mẹ.', [['Touch your nose!', 'Chạm vào mũi!'], ['Where are your eyes?', 'Mắt con đâu?'], ['Clap your hands!', 'Vỗ tay nào!'], ['Stamp your feet!', 'Dậm chân nào!']]],
 ['clothes', 'Lúc thay đồ, cho bé chọn: cái này hay cái kia?', [['Red shirt or blue shirt?', 'Áo đỏ hay áo xanh?'], ['Put on your socks.', 'Mang vớ vào nha.'], ['Take off your shoes.', 'Cởi giày ra nào.'], ['You look great!', 'Con mặc đẹp quá!']]],
 ['vehicles', 'Ngồi bên cửa sổ hoặc ra đường, chỉ xe chạy qua.', [['Look, a bus!', 'Nhìn kìa, xe buýt!'], ['The car goes beep beep!', 'Xe hơi kêu bíp bíp!'], ['Big truck!', 'Xe tải bự!'], ['Bye-bye, airplane!', 'Tạm biệt máy bay!']]],
 ['food', 'Trong bữa ăn, gọi tên món và hỏi bé muốn gì.', [['Do you want rice?', 'Con muốn ăn cơm không?'], ['More, please.', 'Cho con thêm.'], ["I'm full.", 'Con no rồi.'], ['Drink your milk.', 'Uống sữa đi con.']]],
 ['nature', 'Ra ngoài trời, nhìn trời, cây, hoa.', [['Look at the sky!', 'Nhìn bầu trời kìa!'], ['The sun is hot.', 'Mặt trời nóng quá.'], ['Smell the flower.', 'Ngửi bông hoa nè.'], ['It\'s windy!', 'Gió quá!']]],
 ['feelings', 'Làm mặt vui, buồn, giận trước gương để bé bắt chước.', [["I'm happy!", 'Mẹ vui!'], ['Are you sad?', 'Con buồn hả?'], ['Show me an angry face.', 'Làm mặt giận cho mẹ xem.'], ['Big smile!', 'Cười thật tươi!']]],
];
