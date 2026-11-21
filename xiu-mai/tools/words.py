# Xíu Mại word list.
# Each topic: (key, Vietnamese name, English name, colour, photo?, lines)
# Each line: "english | tiếng Việt | Fluent 3D folder | Wikipedia title"
#   Fluent folder blank -> try the English word.   Wikipedia blank -> the English word (photo topics only).
#   Wikipedia "-" -> no photo, use the 3D picture.
T = [
('animals', 'Vật nuôi', 'Pets & farm', '#E9D8FF', True, """
dog | con chó | Dog face | Golden Retriever
puppy | chó con | Dog | Puppy
cat | con mèo | Cat face |
kitten | mèo con | Cat | Kitten
rabbit | con thỏ | Rabbit face | Domestic rabbit
hamster | chuột hamster | Hamster |
mouse | con chuột | Mouse face | House mouse
cow | con bò | Cow face | Cattle
calf | con bê | Ox | Calf
pig | con heo | Pig face | Domestic pig
horse | con ngựa | Horse face |
pony | ngựa con | Horse | Pony
donkey | con lừa | Donkey |
sheep | con cừu | Ewe |
lamb | cừu con | Ram | Lamb and mutton
goat | con dê | Goat |
buffalo | con trâu | Water buffalo | Water buffalo
chicken | con gà | Chicken |
rooster | gà trống | Rooster |
hen | gà mái | Chicken | Hen
chick | gà con | Baby chick | -
duck | con vịt | Duck | Mallard
duckling | vịt con | Duck | Duckling
goose | con ngỗng | Goose | Domestic goose
turkey | gà tây | Turkey | Domestic turkey
frog | con ếch | Frog | American green tree frog
goldfish | cá vàng | Fish | Goldfish
parrot | con vẹt | Parrot | Scarlet macaw
turtle | con rùa | Turtle | Tortoise
"""),
('wild', 'Sở thú', 'Zoo & wild animals', '#FFE3B8', True, """
lion | sư tử | Lion |
tiger | con hổ | Tiger face |
elephant | con voi | Elephant | African bush elephant
monkey | con khỉ | Monkey face | Rhesus macaque
gorilla | khỉ đột | Gorilla |
bear | con gấu | Bear | Brown bear
polar bear | gấu Bắc Cực | Polar bear |
panda | gấu trúc | Panda | Giant panda
giraffe | hươu cao cổ | Giraffe |
zebra | ngựa vằn | Zebra | Plains zebra
kangaroo | chuột túi | Kangaroo | Red kangaroo
hippo | hà mã | Hippopotamus | Hippopotamus
rhino | tê giác | Rhinoceros |
crocodile | cá sấu | Crocodile | Nile crocodile
snake | con rắn | Snake | Green tree python
lizard | thằn lằn | Lizard |
koala | gấu túi | Koala |
camel | lạc đà | Two-hump camel | Dromedary
deer | con hươu | Deer | Red deer
fox | con cáo | Fox | Red fox
wolf | chó sói | Wolf |
leopard | con báo | Leopard |
squirrel | con sóc | Chipmunk | Red squirrel
raccoon | gấu mèo | Raccoon |
hedgehog | con nhím | Hedgehog |
bat | con dơi | Bat | Fruit bat
sloth | con lười | Sloth |
otter | rái cá | Otter | Sea otter
beaver | hải ly | Beaver |
skunk | chồn hôi | Skunk | Striped skunk
badger | con lửng | Badger | European badger
bison | bò rừng | Bison | American bison
mammoth | voi ma mút | Mammoth | -
"""),
('birds', 'Các loài chim', 'Birds', '#D9F0FF', True, """
bird | con chim | Bird | House sparrow
owl | con cú | Owl | Barn owl
eagle | đại bàng | Eagle | Bald eagle
penguin | chim cánh cụt | Penguin | Emperor penguin
peacock | con công | Peacock | Indian peafowl
flamingo | hồng hạc | Flamingo | American flamingo
swan | thiên nga | Swan | Mute swan
dove | bồ câu | Dove | Rock dove
crow | con quạ | Blackbird | Carrion crow
ostrich | đà điểu | - | Common ostrich
hummingbird | chim ruồi | - | Hummingbird
woodpecker | chim gõ kiến | - | Woodpecker
toucan | chim mỏ sừng | - | Toucan
pelican | bồ nông | - | Pelican
seagull | hải âu | - | Gull
kingfisher | bói cá | - | Common kingfisher
stork | con cò | - | White stork
nest | tổ chim | Nest with eggs | Bird nest
feather | lông vũ | Feather |
"""),
('sea', 'Dưới biển', 'Sea animals', '#CDEBFF', True, """
fish | con cá | Tropical fish | Clownfish
whale | cá voi | Spouting whale | Humpback whale
dolphin | cá heo | Dolphin | Common bottlenose dolphin
shark | cá mập | Shark | Great white shark
octopus | bạch tuộc | Octopus | Common octopus
crab | con cua | Crab |
jellyfish | con sứa | Jellyfish |
seal | hải cẩu | Seal | Harbor seal
sea lion | sư tử biển | Seal | Sea lion
walrus | hải mã | - | Walrus
shrimp | con tôm | Shrimp | -
squid | con mực | Squid |
lobster | tôm hùm | Lobster | American lobster
starfish | sao biển | - | Starfish
seahorse | cá ngựa | - | Seahorse
sea turtle | rùa biển | Turtle | Green sea turtle
clam | con nghêu | Oyster | Clam
oyster | con hàu | Oyster |
shell | vỏ sò | Spiral shell | Seashell
coral | san hô | Coral |
pufferfish | cá nóc | Blowfish | Tetraodontidae
stingray | cá đuối | - | Stingray
eel | con lươn | - | Eel
"""),
('bugs', 'Côn trùng', 'Bugs', '#DFF5C8', True, """
butterfly | con bướm | Butterfly | Monarch butterfly
caterpillar | sâu bướm | Bug | Caterpillar
bee | con ong | Honeybee | Western honey bee
ant | con kiến | Ant |
ladybug | bọ rùa | Lady beetle | Coccinella septempunctata
snail | ốc sên | Snail | Cornu aspersum
spider | con nhện | Spider |
worm | con giun | Worm | Earthworm
mosquito | con muỗi | Mosquito |
fly | con ruồi | Fly | Housefly
beetle | bọ cánh cứng | Beetle |
grasshopper | châu chấu | Cricket | Grasshopper
cricket | con dế | Cricket | Cricket (insect)
dragonfly | chuồn chuồn | - | Dragonfly
firefly | đom đóm | - | Firefly
cockroach | con gián | Cockroach |
scorpion | bọ cạp | Scorpion |
moth | bướm đêm | - | Moth
spider web | mạng nhện | Spider web |
"""),
('fruits', 'Trái cây', 'Fruits', '#FFD6DE', True, """
apple | quả táo | Red apple | Apple
green apple | táo xanh | Green apple | Granny Smith
banana | quả chuối | Banana |
orange | quả cam | Tangerine | Orange (fruit)
tangerine | quả quýt | Tangerine |
grapes | quả nho | Grapes | Grape
watermelon | dưa hấu | Watermelon |
melon | dưa lưới | Melon | Cantaloupe
strawberry | dâu tây | Strawberry |
pineapple | quả thơm (dứa) | Pineapple |
mango | quả xoài | Mango |
peach | quả đào | Peach | -
pear | quả lê | Pear |
cherries | anh đào | Cherries | Cherry
lemon | chanh vàng | Lemon |
lime | chanh xanh | Lemon | Key lime
coconut | quả dừa | Coconut | -
blueberries | việt quất | Blueberries | Blueberry
kiwi | quả kiwi | Kiwi fruit | Kiwifruit
papaya | đu đủ | - | Papaya
guava | quả ổi | - | Guava
dragon fruit | thanh long | - | Pitaya
durian | sầu riêng | - | Durian
jackfruit | quả mít | - | Jackfruit
longan | nhãn | - | Longan
lychee | quả vải | - | Lychee
rambutan | chôm chôm | - | Rambutan
mangosteen | măng cụt | - | Purple mangosteen
avocado | quả bơ | Avocado |
pomegranate | quả lựu | - | Pomegranate
plum | quả mận | - | Plum
apricot | quả mơ | - | Apricot
raspberry | mâm xôi | - | Raspberry
star fruit | khế | - | Carambola
custard apple | mãng cầu | - | Annona squamosa
grapefruit | bưởi | - | Pomelo
passion fruit | chanh dây | - | Passion fruit
persimmon | quả hồng | - | Persimmon
fig | quả sung | - | Common fig
date | quả chà là | - | Date palm
olive | quả ô liu | Olive |
"""),
('vegetables', 'Rau củ', 'Vegetables', '#D8F5D0', True, """
carrot | cà rốt | Carrot |
tomato | cà chua | Tomato |
corn | bắp (ngô) | Ear of corn | -
potato | khoai tây | Potato |
sweet potato | khoai lang | Roasted sweet potato | Sweet potato
cucumber | dưa leo | Cucumber |
broccoli | bông cải xanh | Broccoli |
cauliflower | bông cải trắng | - | Cauliflower
cabbage | bắp cải | Leafy green | Cabbage
lettuce | xà lách | Leafy green | -
spinach | rau chân vịt | Leafy green | Spinach
onion | củ hành | Onion | -
garlic | củ tỏi | Garlic | -
ginger | gừng | Ginger root | Ginger
mushroom | cây nấm | Mushroom | Agaricus bisporus
eggplant | cà tím | Eggplant |
bell pepper | ớt chuông | Bell pepper |
chili | trái ớt | Hot pepper | Chili pepper
pumpkin | bí đỏ | Jack-o-lantern | Pumpkin
peas | đậu Hà Lan | Pea pod | Pea
green beans | đậu que | - | Green bean
peanut | đậu phộng | Peanuts | Peanut
beans | hạt đậu | Beans | Bean
radish | củ cải | - | Radish
beet | củ dền | - | Beetroot
celery | cần tây | - | Celery
asparagus | măng tây | - | Asparagus
zucchini | bí ngòi | - | Zucchini
okra | đậu bắp | - | Okra
bitter melon | khổ qua | - | Momordica charantia
lotus root | củ sen | - | Nelumbo nucifera
taro | khoai môn | - | Taro
cassava | khoai mì | - | Cassava
bamboo shoot | măng | - | Bamboo shoot
bean sprouts | giá đỗ | - | Mung bean sprout
herbs | rau thơm | Herb | -
"""),
('food', 'Món ăn', 'Food', '#FFF0C2', True, """
rice | cơm | Cooked rice | -
bread | bánh mì | Bread | -
baguette | bánh mì que | Baguette bread | Baguette
egg | quả trứng | Egg | Egg as food
fried egg | trứng chiên | Cooking | Fried egg
noodles | mì sợi | Steaming bowl | -
pho | phở | Steaming bowl | Pho
soup | canh (súp) | Pot of food | Soup
porridge | cháo | Bowl with spoon | Congee
meat | thịt | Cut of meat | Meat
chicken meat | thịt gà | Poultry leg | Chicken as food
fish meat | cá (món ăn) | Fried shrimp | -
sausage | xúc xích | Hot dog | Sausage
hamburger | bánh hamburger | Hamburger |
hot dog | bánh mì xúc xích | Hot dog |
sandwich | bánh sandwich | Sandwich |
pizza | bánh pizza | Pizza |
spaghetti | mì Ý | Spaghetti |
french fries | khoai tây chiên | French fries |
salad | rau trộn | Green salad | Salad
dumpling | há cảo | Dumpling |
sushi | sushi | Sushi |
spring rolls | chả giò | - | Chả giò
rice ball | cơm nắm | Rice ball | Onigiri
pancake | bánh kếp | Pancakes | Pancake
waffle | bánh waffle | Waffle |
taco | bánh taco | Taco |
cheese | phô mai | Cheese wedge | -
butter | bơ | Butter |
honey | mật ong | Honey pot | Honey
jam | mứt | - | Fruit preserves
salt | muối | Salt |
sugar | đường | - | Sugar
tofu | đậu hũ | - | Tofu
yogurt | sữa chua | - | Yogurt
cereal | ngũ cốc | - | Breakfast cereal
"""),
('drinks', 'Đồ uống', 'Drinks', '#E0F4FF', True, """
milk | sữa | Glass of milk |
water | nước | Potable water | Drinking water
juice | nước ép | Beverage box | Orange juice
orange juice | nước cam | Beverage box | Orange juice
tea | trà | Teacup without handle | Tea
coffee | cà phê | Hot beverage | Coffee
hot chocolate | ca cao nóng | Hot beverage | Hot chocolate
smoothie | sinh tố | Cup with straw | Smoothie
coconut water | nước dừa | Coconut | Coconut water
soda | nước ngọt | Cup with straw | Soft drink
milk tea | trà sữa | Bubble tea |
ice | đá | Ice | Ice cube
"""),
('sweets', 'Bánh kẹo', 'Sweets & snacks', '#FFE0EC', True, """
cake | bánh kem | Birthday cake | Birthday cake
cupcake | bánh cupcake | Cupcake |
cookie | bánh quy | Cookie | Chocolate chip cookie
ice cream | kem | Soft ice cream | Ice cream
candy | kẹo | Candy | -
lollipop | kẹo mút | Lollipop |
chocolate | sô-cô-la | Chocolate bar | Chocolate
donut | bánh vòng | Doughnut |
popcorn | bắp rang | Popcorn |
pie | bánh nướng | Pie |
pudding | bánh flan | Custard | Crème caramel
croissant | bánh sừng bò | Croissant |
pretzel | bánh quy xoắn | Pretzel |
mooncake | bánh trung thu | Moon cake | Mooncake
shaved ice | đá bào | Shaved ice |
chips | bánh snack | - | Potato chip
jelly | thạch | - | Gelatin dessert
marshmallow | kẹo dẻo | - | Marshmallow
"""),
('colors', 'Màu sắc', 'Colors', '#D4F1FF', False, """
red | màu đỏ | Red circle |
orange | màu cam | Orange circle | Orange (fruit)
yellow | màu vàng | Yellow circle |
green | màu xanh lá | Green circle |
blue | màu xanh dương | Blue circle |
purple | màu tím | Purple circle |
pink | màu hồng | Pink heart |
brown | màu nâu | Brown circle |
black | màu đen | Black circle |
white | màu trắng | White circle |
gray | màu xám | Grey heart |
light blue | xanh da trời | Light blue heart |
gold | màu vàng kim | 1st place medal |
silver | màu bạc | 2nd place medal |
rainbow | cầu vồng | Rainbow |
"""),
('shapes', 'Hình khối', 'Shapes', '#FFE0F0', False, """
circle | hình tròn | Red circle |
square | hình vuông | Blue square |
triangle | hình tam giác | Red triangle |
heart | hình trái tim | Red heart |
star | ngôi sao | Star |
diamond | hình thoi | Large orange diamond |
oval | hình bầu dục | Egg |
moon | hình trăng khuyết | Crescent moon |
arrow | mũi tên | Right arrow |
cross | dấu cộng | Plus |
"""),
('numbers', 'Số đếm', 'Numbers', '#E3F8D2', False, """
zero | số 0 | Keycap 0 |
one | số 1 | Keycap 1 |
two | số 2 | Keycap 2 |
three | số 3 | Keycap 3 |
four | số 4 | Keycap 4 |
five | số 5 | Keycap 5 |
six | số 6 | Keycap 6 |
seven | số 7 | Keycap 7 |
eight | số 8 | Keycap 8 |
nine | số 9 | Keycap 9 |
ten | số 10 | Keycap 10 |
hundred | một trăm | Hundred points |
"""),
('body', 'Cơ thể', 'Body', '#FFE2D6', False, """
head | cái đầu | Person |
face | khuôn mặt | Slightly smiling face |
hair | tóc | Person curly hair |
eye | con mắt | Eye |
eyes | hai mắt | Eyes |
ear | cái tai | Ear |
nose | cái mũi | Nose |
mouth | cái miệng | Mouth |
lips | môi | Mouth |
tooth | cái răng | Tooth |
tongue | cái lưỡi | Tongue |
hand | bàn tay | Hand with fingers splayed |
finger | ngón tay | Backhand index pointing up |
thumb | ngón cái | Thumbs up |
arm | cánh tay | Flexed biceps |
leg | cái chân | Leg |
foot | bàn chân | Foot |
footprints | dấu chân | Footprints |
brain | bộ não | Brain |
heart | trái tim | Anatomical heart |
bone | xương | Bone |
nail | móng tay | Nail polish |
"""),
('people', 'Gia đình & mọi người', 'Family & people', '#FFF1C9', False, """
mommy | mẹ | Woman |
daddy | ba | Man |
baby | em bé | Baby |
brother | anh / em trai | Boy |
sister | chị / em gái | Girl |
grandma | bà | Old woman |
grandpa | ông | Old man |
family | gia đình | House with garden |
parents | ba mẹ | Two hearts |
child | đứa trẻ | Child |
friend | bạn | People hugging |
boy | bé trai | Boy |
girl | bé gái | Girl |
man | người đàn ông | Man |
woman | người phụ nữ | Woman |
pregnant | mẹ bầu | Pregnant woman |
breastfeeding | cho bé bú | Breast feeding |
bride | cô dâu | Person with veil |
king | vua | Prince |
queen | hoàng hậu | Princess |
prince | hoàng tử | Prince |
princess | công chúa | Princess |
"""),
('clothes', 'Quần áo', 'Clothes', '#E6E1FF', True, """
shirt | áo thun | T-shirt | T-shirt
pants | quần dài | Jeans | Jeans
jeans | quần jean | Jeans |
shorts | quần đùi | Shorts |
dress | cái đầm | Dress | -
skirt | chân váy | - | Skirt
socks | đôi vớ | Socks | Sock
shoes | đôi giày | Running shoe | Sneakers
sandals | dép quai hậu | Flat shoe | Sandal
slippers | dép lê | Thong sandal | Slipper
boots | đôi ủng | Womans boot | Wellington boot
hat | cái nón | Billed cap | Baseball cap
cap | mũ lưỡi trai | Billed cap | Baseball cap
helmet | mũ bảo hiểm | Rescue workers helmet | Bicycle helmet
coat | áo khoác | Coat | -
jacket | áo gió | Coat | Jacket
sweater | áo len | - | Sweater
scarf | khăn quàng | Scarf |
gloves | găng tay | Gloves | Glove
glasses | mắt kính | Glasses |
sunglasses | kính râm | Sunglasses |
pajamas | đồ ngủ | - | Pajamas
swimsuit | đồ bơi | One-piece swimsuit | Swimsuit
raincoat | áo mưa | - | Raincoat
tie | cà vạt | Necktie |
belt | thắt lưng | - | Belt (clothing)
button | cái nút áo | - | Button
bag | cái túi | Handbag |
watch | đồng hồ đeo tay | Watch |
necklace | vòng cổ | Prayer beads | Necklace
ring | nhẫn | Ring |
umbrella | cây dù | Umbrella |
"""),
('baby', 'Đồ của bé', 'Baby things', '#FFE8F2', True, """
diaper | tã | - | Diaper
baby bottle | bình sữa | Baby bottle |
pacifier | núm vú giả | - | Pacifier
bib | yếm ăn | - | Bib (garment)
stroller | xe đẩy | - | Baby transport
crib | nôi (cũi) | - | Infant bed
car seat | ghế ô tô | - | Child safety seat
high chair | ghế ăn dặm | - | High chair
rattle | lục lạc | - | Rattle (percussion instrument)
blanket | cái chăn | - | Blanket
pillow | cái gối | - | Pillow
potty | bô | - | Potty chair
wet wipes | khăn ướt | - | Wet wipe
baby shampoo | dầu gội | - | Shampoo
towel | khăn tắm | - | Towel
toothbrush | bàn chải đánh răng | Toothbrush | Toothbrush
toothpaste | kem đánh răng | - | Toothpaste
comb | cái lược | - | Comb
"""),
('toys', 'Đồ chơi', 'Toys', '#FFE0EC', True, """
ball | quả bóng | Soccer ball | Ball
teddy bear | gấu bông | Teddy bear |
doll | búp bê | Nesting dolls | Doll
balloon | bong bóng | Balloon | Toy balloon
kite | con diều | Kite |
yo-yo | con yo-yo | Yo-yo |
puzzle | xếp hình | Puzzle piece | Jigsaw puzzle
blocks | khối gỗ | Brick | Toy block
robot | người máy | Robot | -
bubbles | bong bóng xà phòng | Bubbles | Soap bubble
slide | cầu tuột | Playground slide | -
swing | xích đu | - | Swing (seat)
seesaw | bập bênh | - | Seesaw
sandbox | hố cát | - | Sandpit
toy car | xe đồ chơi | Racing car | Toy car
toy train | tàu đồ chơi | Locomotive | Toy train
dice | xúc xắc | Game die | Dice
crayons | bút sáp | Crayon | Crayon
play dough | đất nặn | - | Play-Doh
rocking horse | ngựa gỗ | Carousel horse | Rocking horse
kick scooter | xe trượt | Kick scooter | Kick scooter
tricycle | xe ba bánh | - | Tricycle
spinning top | con quay | - | Spinning top
magic wand | đũa thần | Magic wand |
"""),
('vehicles', 'Xe cộ', 'Vehicles', '#FFE5D2', True, """
car | xe hơi | Automobile |
bus | xe buýt | Bus |
school bus | xe đưa đón | Bus | School bus
taxi | xe taxi | Taxi | -
truck | xe tải | Delivery truck |
fire truck | xe cứu hỏa | Fire engine | Fire engine
police car | xe cảnh sát | Police car |
ambulance | xe cứu thương | Ambulance |
bicycle | xe đạp | Bicycle |
motorbike | xe máy | Motor scooter | Scooter (motorcycle)
motorcycle | xe mô tô | Motorcycle |
train | tàu hỏa | Locomotive | Train
subway | tàu điện ngầm | Metro | Rapid transit
airplane | máy bay | Airplane | Airliner
helicopter | trực thăng | Helicopter |
boat | thuyền | Sailboat | -
ship | tàu thủy | Ship | Cruise ship
canoe | xuồng | Canoe | Canoe
rocket | tên lửa | Rocket |
tractor | máy cày | Tractor |
excavator | máy xúc | - | Excavator
crane | xe cẩu | Building construction | Mobile crane
bulldozer | xe ủi | - | Bulldozer
cement mixer | xe trộn bê tông | - | Concrete mixer
garbage truck | xe rác | - | Garbage truck
race car | xe đua | Racing car | Formula One car
cable car | cáp treo | Aerial tramway | Gondola lift
hot air balloon | khinh khí cầu | - | Hot air balloon
submarine | tàu ngầm | - | Submarine
cyclo | xích lô | - | Cycle rickshaw
skateboard | ván trượt | Skateboard |
"""),
('home', 'Trong nhà', 'Home', '#F3E6D8', True, """
house | ngôi nhà | House with garden | House
bed | cái giường | Bed | -
chair | cái ghế | Chair |
table | cái bàn | - | Table (furniture)
door | cánh cửa | Door | -
window | cửa sổ | Window | -
sofa | ghế sofa | Couch and lamp | Couch
TV | ti vi | Television | -
lamp | đèn | Light bulb | Lamp
clock | đồng hồ | Alarm clock | Alarm clock
mirror | cái gương | Mirror | -
stairs | cầu thang | - | Stairs
fan | quạt máy | - | Electric fan
air conditioner | máy lạnh | - | Air conditioning
refrigerator | tủ lạnh | - | Refrigerator
washing machine | máy giặt | - | Washing machine
vacuum | máy hút bụi | - | Vacuum cleaner
broom | cây chổi | Broom |
bucket | cái xô | Bucket |
basket | cái giỏ | Basket |
box | cái hộp | Package | Cardboard box
key | chìa khóa | Key |
picture | bức tranh | Framed picture | -
curtain | rèm cửa | - | Curtain
carpet | tấm thảm | - | Carpet
shelf | kệ sách | - | Bookcase
toilet | bồn cầu | Toilet |
bathtub | bồn tắm | Bathtub |
shower | vòi sen | Shower | -
soap | xà phòng | Soap | Soap
sink | bồn rửa | - | Sink
toilet paper | giấy vệ sinh | Roll of paper | Toilet paper
"""),
('kitchen', 'Nhà bếp', 'Kitchen', '#FFF2DE', True, """
cup | cái ly | Cup with straw | Cup
mug | cái ca | Hot beverage | Mug
glass | ly thủy tinh | Tumbler glass | Glass
plate | cái dĩa | - | Plate (dishware)
bowl | cái chén | Bowl with spoon | -
spoon | cái muỗng | Spoon |
fork | cái nĩa | Fork and knife | Fork
knife | con dao | Kitchen knife |
chopsticks | đôi đũa | Chopsticks |
pot | cái nồi | Pot of food | Cooking pot
pan | cái chảo | Cooking | Frying pan
kettle | ấm nước | - | Kettle
rice cooker | nồi cơm điện | - | Rice cooker
microwave | lò vi sóng | - | Microwave oven
oven | lò nướng | - | Oven
stove | bếp ga | - | Kitchen stove
bottle | cái chai | Baby bottle | Plastic bottle
jar | hũ (lọ) | Honey pot | Jar
lunch box | hộp cơm | Bento box | Bento
apron | tạp dề | - | Apron
"""),
('things', 'Đồ dùng & điện tử', 'Things & gadgets', '#E9EEF7', True, """
phone | điện thoại | Mobile phone | Smartphone
computer | máy tính | Laptop | Laptop
tablet | máy tính bảng | Mobile phone | Tablet computer
camera | máy ảnh | Camera |
headphones | tai nghe | Headphone | Headphones
radio | đài radio | Radio |
battery | cục pin | Battery |
light bulb | bóng đèn | Light bulb | Incandescent light bulb
flashlight | đèn pin | Flashlight |
candle | cây nến | Candle |
remote control | điều khiển | - | Remote control
keyboard | bàn phím | Keyboard | Computer keyboard
mouse (computer) | chuột máy tính | Computer mouse | Computer mouse
money | tiền | Dollar banknote | Banknote
coin | đồng xu | Coin |
wallet | cái ví | Purse | Wallet
letter | lá thư | Envelope | Envelope
gift | món quà | Wrapped gift |
paper | tờ giấy | Page facing up | Paper
newspaper | tờ báo | Newspaper |
"""),
('tools', 'Dụng cụ', 'Tools', '#EAE4DA', True, """
hammer | cái búa | Hammer |
screwdriver | tua vít | Screwdriver |
saw | cái cưa | Carpentry saw | Hand saw
wrench | cờ lê | Wrench |
nail | cây đinh | - | Nail (fastener)
ladder | cái thang | Ladder |
shovel | cái xẻng | - | Shovel
rake | cái cào | - | Rake (tool)
axe | cái rìu | Axe |
tape | băng keo | - | Adhesive tape
rope | sợi dây | Knot | Rope
magnet | nam châm | Magnet |
lock | ổ khóa | Locked | Padlock
watering can | bình tưới | - | Watering can
wheelbarrow | xe rùa | - | Wheelbarrow
needle | cây kim | Sewing needle |
thread | cuộn chỉ | Thread |
"""),
('school', 'Đồ dùng học tập', 'School', '#E8F7D9', True, """
book | quyển sách | Books | -
notebook | quyển vở | Notebook | Notebook
backpack | cặp sách | Backpack |
pencil | bút chì | Pencil |
pen | cây bút | Pen | Ballpoint pen
crayon | bút sáp màu | Crayon |
eraser | cục gôm | - | Eraser
scissors | cái kéo | Scissors |
ruler | cây thước | Straight ruler | -
glue | keo dán | - | Glue stick
paintbrush | cọ vẽ | Paintbrush |
paint | màu vẽ | Artist palette | Palette (painting)
paper clip | kẹp giấy | Paperclip | Paper clip
calculator | máy tính tay | Abacus | Calculator
globe | quả địa cầu | Globe showing americas | Globe
map | bản đồ | World map | -
chalk | phấn | - | Chalk
blackboard | bảng đen | - | Blackboard
desk | bàn học | - | Desk
teacher | cô giáo | Woman teacher | -
student | học sinh | Student | -
"""),
('nature', 'Thiên nhiên', 'Nature', '#D6F3FF', True, """
sun | mặt trời | Sun | -
moon | mặt trăng | Crescent moon | Moon
star | ngôi sao | Star | -
sky | bầu trời | Sun behind cloud | -
cloud | đám mây | Cloud | -
tree | cái cây | Deciduous tree | Tree
palm tree | cây dừa | Palm tree | Cocos nucifera
leaf | chiếc lá | Leaf fluttering in wind | Leaf
flower | bông hoa | Tulip | Tulip
grass | bãi cỏ | Herb | Lawn
rock | hòn đá | Rock |
sand | cát | - | Sand
mountain | ngọn núi | Mountain |
volcano | núi lửa | Volcano |
river | dòng sông | - | River
lake | cái hồ | - | Lake
sea | biển | Water wave | -
beach | bãi biển | Beach with umbrella | Beach
island | hòn đảo | Desert island | Island
waterfall | thác nước | - | Waterfall
forest | khu rừng | Evergreen tree | Forest
desert | sa mạc | Desert | -
cave | hang động | - | Cave
fire | lửa | Fire | -
wood | khúc gỗ | Wood | Lumber
"""),
('weather', 'Thời tiết', 'Weather', '#E3F1FF', False, """
sunny | trời nắng | Sun |
cloudy | nhiều mây | Cloud |
rain | mưa | Cloud with rain |
rainy | trời mưa | Umbrella with rain drops |
storm | bão | Cloud with lightning and rain |
lightning | tia sét | High voltage |
thunder | sấm | Cloud with lightning |
wind | gió | Wind face |
snow | tuyết | Snowflake |
snowman | người tuyết | Snowman |
fog | sương mù | Fog |
rainbow | cầu vồng | Rainbow |
tornado | lốc xoáy | Tornado |
hot | trời nóng | Thermometer |
cold | trời lạnh | Cold face |
puddle | vũng nước | Droplet |
"""),
('flowers', 'Hoa & cây', 'Flowers & plants', '#E9FCE3', True, """
rose | hoa hồng | Rose |
sunflower | hoa hướng dương | Sunflower | Common sunflower
tulip | hoa tulip | Tulip |
lotus | hoa sen | Lotus | Nelumbo nucifera
cherry blossom | hoa anh đào | Cherry blossom |
hibiscus | hoa dâm bụt | Hibiscus |
daisy | hoa cúc | Blossom | Bellis perennis
orchid | hoa lan | - | Orchidaceae
lily | hoa ly | - | Lilium
apricot blossom | hoa mai | - | Ochna integerrima
peach blossom | hoa đào | Cherry blossom | Prunus persica
cactus | cây xương rồng | Cactus |
bamboo | cây tre | Tanabata tree |
seed | hạt giống | Seedling | Seed
sprout | mầm cây | Seedling | Seedling
potted plant | chậu cây | Potted plant | Houseplant
bouquet | bó hoa | Bouquet |
clover | cỏ ba lá | Four leaf clover | Clover
pine tree | cây thông | Evergreen tree | Pine
"""),
('places', 'Nơi chốn', 'Places', '#F4E9FF', True, """
home | nhà | House | -
school | trường học | School | -
kindergarten | trường mầm non | Children crossing | Kindergarten
hospital | bệnh viện | Hospital | -
park | công viên | Fountain | Urban park
playground | sân chơi | Playground slide | Playground
zoo | sở thú | Elephant | Zoo
farm | nông trại | Tractor | Farm
market | chợ | Shopping cart | Marketplace
supermarket | siêu thị | Shopping cart | Supermarket
bakery | tiệm bánh | Croissant | Bakery
restaurant | nhà hàng | Fork and knife with plate | Restaurant
library | thư viện | Books | Library
pool | hồ bơi | Person swimming | Swimming pool
beach | bãi biển | Beach with umbrella | Beach
airport | sân bay | Airplane departure | Airport
train station | nhà ga | Station | Train station
bus stop | trạm xe buýt | Bus stop |
police station | đồn cảnh sát | Police car light | -
fire station | trạm cứu hỏa | Fire engine | -
post office | bưu điện | Post office | -
bank | ngân hàng | Bank | -
church | nhà thờ | Church | -
pagoda | chùa | Shinto shrine | Buddhist temple
castle | lâu đài | Castle |
tent | cái lều | Tent |
bridge | cây cầu | Bridge at night | Bridge
road | con đường | Motorway | Road
street | đường phố | Cityscape | Street
city | thành phố | Cityscape | -
village | làng quê | Houses | Village
garden | khu vườn | House with garden | Garden
"""),
('jobs', 'Nghề nghiệp', 'Jobs', '#E0ECFF', False, """
doctor | bác sĩ | Woman health worker |
nurse | y tá | Health worker |
dentist | nha sĩ | Tooth |
teacher | cô giáo | Woman teacher |
police officer | cảnh sát | Man police officer |
firefighter | lính cứu hỏa | Man firefighter |
cook | đầu bếp | Woman cook |
farmer | nông dân | Man farmer |
pilot | phi công | Woman pilot |
astronaut | phi hành gia | Astronaut |
scientist | nhà khoa học | Woman scientist |
singer | ca sĩ | Woman singer |
artist | họa sĩ | Woman artist |
builder | thợ xây | Construction worker |
mechanic | thợ máy | Man mechanic |
judge | thẩm phán | Judge |
guard | bảo vệ | Guard |
office worker | nhân viên văn phòng | Woman office worker |
detective | thám tử | Detective |
mail carrier | người đưa thư | Postbox |
driver | tài xế | Oncoming taxi |
clown | chú hề | Clown face |
"""),
('sports', 'Thể thao', 'Sports', '#E4FFE6', True, """
soccer | bóng đá | Soccer ball | Association football
basketball | bóng rổ | Basketball |
volleyball | bóng chuyền | Volleyball |
tennis | quần vợt | Tennis |
badminton | cầu lông | Badminton |
baseball | bóng chày | Baseball |
football | bóng bầu dục | American football |
table tennis | bóng bàn | Ping pong | Table tennis
golf | đánh gôn | Flag in hole | Golf
bowling | bowling | Bowling |
swimming | bơi lội | Person swimming | -
running | chạy bộ | Person running | -
cycling | đạp xe | Person biking | -
boxing | đấm bốc | Boxing glove |
karate | võ thuật | Martial arts uniform | -
skiing | trượt tuyết | Skier | -
skating | trượt băng | Ice skate |
surfing | lướt sóng | Person surfing | -
gymnastics | thể dục dụng cụ | Person cartwheeling | -
yoga | yoga | Person in lotus position | -
fishing | câu cá | Fishing pole |
medal | huy chương | 1st place medal | -
trophy | cúp | Trophy |
"""),
('music', 'Âm nhạc', 'Music', '#FFF0F8', True, """
music | âm nhạc | Musical notes | -
song | bài hát | Musical note | -
piano | đàn piano | Musical keyboard | Piano
guitar | đàn guitar | Guitar | Classical guitar
violin | đàn violin | Violin |
drum | cái trống | Drum | Snare drum
trumpet | kèn trumpet | Trumpet |
saxophone | kèn saxophone | Saxophone |
flute | ống sáo | Flute | Western concert flute
harmonica | kèn harmonica | - | Harmonica
xylophone | đàn mộc cầm | - | Xylophone
bell | cái chuông | Bell | Bell
microphone | micro | Microphone |
maracas | trống lắc | Maracas |
accordion | đàn accordion | Accordion |
banjo | đàn banjo | Banjo |
"""),
('feelings', 'Cảm xúc', 'Feelings', '#FFF4B8', False, """
happy | vui | Grinning face |
sad | buồn | Crying face |
angry | tức giận | Angry face |
sleepy | buồn ngủ | Sleeping face |
scared | sợ | Fearful face |
surprised | ngạc nhiên | Astonished face |
tired | mệt | Tired face |
yummy | ngon quá | Face savoring food |
hot | nóng | Hot face |
cold | lạnh | Cold face |
silly | nghịch ngợm | Zany face |
shy | mắc cỡ | Smiling face with smiling eyes |
love | thương | Smiling face with hearts |
sick | bị ốm | Face with thermometer |
hungry | đói bụng | Fork and knife |
thirsty | khát nước | Droplet |
bored | chán | Neutral face |
proud | tự hào | Star-struck |
cool | ngầu | Smiling face with sunglasses |
worried | lo lắng | Worried face |
laughing | cười lớn | Face with tears of joy |
quiet | im lặng | Shushing face |
"""),
('actions', 'Hành động', 'Actions', '#FFE6D5', False, """
run | chạy | Person running |
walk | đi bộ | Person walking |
jump | nhảy | Kangaroo |
swim | bơi | Person swimming |
dance | múa | Woman dancing |
sing | hát | Woman singer |
eat | ăn | Fork and knife with plate |
drink | uống | Cup with straw |
sleep | ngủ | Person in bed |
wake up | thức dậy | Alarm clock |
read | đọc | Open book |
write | viết | Writing hand |
draw | vẽ | Artist palette |
play | chơi | Video game |
clap | vỗ tay | Clapping hands |
wave | vẫy tay | Waving hand |
hug | ôm | People hugging |
kiss | hôn | Kiss mark |
cry | khóc | Loudly crying face |
laugh | cười | Face with tears of joy |
smile | mỉm cười | Smiling face with smiling eyes |
climb | leo trèo | Person climbing |
ride a bike | đạp xe | Person biking |
cook | nấu ăn | Cooking |
wash hands | rửa tay | Soap |
brush teeth | đánh răng | Toothbrush |
take a bath | tắm | Person taking bath |
listen | nghe | Ear |
look | nhìn | Eyes |
talk | nói chuyện | Speaking head |
think | suy nghĩ | Thinking face |
point | chỉ tay | Backhand index pointing right |
push | đẩy | Shopping cart |
throw | ném | Softball |
kick | đá banh | Soccer ball |
build | xây | Building construction |
paint | tô màu | Paintbrush | Palette (painting)
shop | đi chợ | Shopping bags |
fly | bay | Airplane departure | Housefly
sit | ngồi | Chair |
stand | đứng | Person standing |
call | gọi điện | Telephone receiver |
pray | cầu nguyện | Folded hands |
"""),
('opposites', 'Từ trái nghĩa', 'Opposites', '#F0E6FF', False, """
big | to | Elephant |
small | nhỏ | Mouse |
fast | nhanh | Racing car |
slow | chậm | Snail |
hot | nóng | Fire |
cold | lạnh | Ice |
up | lên | Up arrow |
down | xuống | Down arrow |
left | trái | Left arrow |
right | phải | Right arrow |
open | mở | Open mailbox with raised flag |
closed | đóng | Closed mailbox with lowered flag |
full | đầy | Battery |
empty | rỗng | Low battery |
happy | vui | Grinning face |
sad | buồn | Crying face |
day | ban ngày | Sun with face |
night | ban đêm | Night with stars |
wet | ướt | Droplet |
dry | khô | Desert |
tall | cao | Giraffe |
short | thấp | Turtle |
loud | ồn ào | Loudspeaker |
quiet | yên lặng | Muted speaker |
yes | có | Check mark button |
no | không | Cross mark |
stop | dừng lại | Stop sign |
go | đi | Green circle |
"""),
('time', 'Thời gian', 'Time', '#E8EAFF', False, """
morning | buổi sáng | Sunrise |
afternoon | buổi chiều | Sun behind cloud |
evening | buổi tối | Sunset |
night | ban đêm | Night with stars |
today | hôm nay | Calendar |
birthday | sinh nhật | Birthday cake |
clock | đồng hồ | Alarm clock | Alarm clock
time | giờ | Mantelpiece clock |
week | tuần | Spiral calendar |
spring | mùa xuân | Cherry blossom |
summer | mùa hè | Sun with face |
autumn | mùa thu | Maple leaf |
winter | mùa đông | Snowman |
"""),
('holidays', 'Lễ hội', 'Celebrations', '#FFE3E3', False, """
Tet | Tết | Red envelope |
lucky money | lì xì | Red envelope |
lantern | lồng đèn | Red paper lantern |
mid-autumn | Trung thu | Moon cake |
fireworks | pháo hoa | Fireworks |
party | bữa tiệc | Party popper |
balloon | bong bóng | Balloon | Toy balloon
present | quà tặng | Wrapped gift |
birthday cake | bánh sinh nhật | Birthday cake |
candles | nến | Candle |
Christmas | Giáng sinh | Christmas tree |
Santa Claus | ông già Noel | Santa claus |
Halloween | Halloween | Jack-o-lantern |
ghost | con ma | Ghost |
mask | mặt nạ | Performing arts |
confetti | giấy kim tuyến | Confetti ball |
ribbon | ruy băng | Ribbon |
crown | vương miện | Crown |
"""),
('space', 'Vũ trụ', 'Space', '#E0E4FF', True, """
earth | trái đất | Globe showing asia-australia | Earth
planet | hành tinh | Ringed planet | Saturn
rocket | tên lửa | Rocket |
astronaut | phi hành gia | Astronaut | Astronaut
alien | người ngoài hành tinh | Alien | -
UFO | đĩa bay | Flying saucer | -
satellite | vệ tinh | Satellite | Satellite
telescope | kính thiên văn | Telescope |
comet | sao chổi | Comet |
shooting star | sao băng | Shooting star | -
galaxy | dải ngân hà | Milky way | Milky Way
"""),
('fantasy', 'Khủng long & cổ tích', 'Dinosaurs & fairy tales', '#E2FFE9', False, """
dinosaur | khủng long | Sauropod |
T-rex | khủng long bạo chúa | T-rex |
dragon | con rồng | Dragon |
unicorn | kỳ lân | Unicorn |
fairy | cô tiên | Woman fairy |
wizard | phù thủy | Person mage |
genie | thần đèn | Woman genie |
vampire | ma cà rồng | Woman vampire |
mermaid | nàng tiên cá | Woman merpeople |
superhero | siêu nhân | Woman superhero |
troll | yêu tinh | Troll |
zombie | thây ma | Woman zombie |
"""),
('health', 'Sức khỏe', 'Health', '#FFEFEF', False, """
medicine | thuốc | Pill |
syringe | ống tiêm | Syringe |
bandage | băng cá nhân | Adhesive bandage |
thermometer | nhiệt kế | Thermometer |
stethoscope | ống nghe | Stethoscope |
mask | khẩu trang | Face with medical mask |
cough | ho | Face with open mouth |
sneeze | hắt hơi | Sneezing face |
fever | sốt | Face with thermometer |
hurt | đau | Face with head-bandage |
wheelchair | xe lăn | Manual wheelchair |
crutch | nạng | Crutch |
"""),
]
