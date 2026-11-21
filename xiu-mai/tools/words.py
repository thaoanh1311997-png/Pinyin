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
calf | con bê | Ox | File:Close-up photograph of a calf's head looking at the viewer with pricked ears in Don Det Laos.jpg
pig | con heo | Pig face | Domestic pig
horse | con ngựa | Horse face |
pony | ngựa con | Horse | Pony
donkey | con lừa | Donkey |
sheep | con cừu | Ewe |
lamb | cừu con | Ram | Lambing
goat | con dê | Goat |
buffalo | con trâu | Water buffalo | Water buffalo
chicken | con gà | Chicken | @chicken-animals
rooster | gà trống | Rooster |
hen | gà mái | Chicken | File:3 Chickens.jpg
chick | gà con | Baby chick | File:Fuzzy yellow chicks in a brooder.jpg
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
mammoth | voi ma mút | Mammoth | File:Woolly Mammoth-RBC.jpg
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
hummingbird | chim ruồi | - | @hummingbird-birds
woodpecker | chim gõ kiến | - | Woodpecker
toucan | chim mỏ sừng | - | @toucan-birds
pelican | bồ nông | - | Pelican
seagull | hải âu | - | Gull
kingfisher | bói cá | - | Common kingfisher
stork | con cò | - | White stork
nest | tổ chim | Nest with eggs | Bird nest
feather | lông vũ | Feather | File:A single white feather closeup.jpg
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
sea lion | sư tử biển | Seal | @sea-lion-sea
walrus | hải mã | - | Walrus
shrimp | con tôm | Shrimp | @shrimp-sea
squid | con mực | Squid |
lobster | tôm hùm | Lobster | American lobster
starfish | sao biển | - | Starfish
seahorse | cá ngựa | - | @seahorse-sea
sea turtle | rùa biển | Turtle | Green sea turtle
clam | con nghêu | Oyster | File:Clams, Mumbai seafood 02.jpg
oyster | con hàu | Oyster |
shell | vỏ sò | Spiral shell | File:Flexopecten ponticus 2008 G1.jpg
coral | san hô | Coral |
pufferfish | cá nóc | Blowfish | File:Takifugu poecilonotus by DaijuAzuma.JPG
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
beetle | bọ cánh cứng | Beetle | @beetle-bugs
grasshopper | châu chấu | Cricket | Grasshopper
cricket | con dế | Cricket | Cricket (insect)
dragonfly | chuồn chuồn | - | Dragonfly
firefly | đom đóm | - | Firefly
cockroach | con gián | Cockroach | File:Blatta orientalis Trento 03.jpg
scorpion | bọ cạp | Scorpion |
moth | bướm đêm | - | @moth-bugs
spider web | mạng nhện | Spider web |
"""),
('fruits', 'Trái cây', 'Fruits', '#FFD6DE', True, """
apple | quả táo | Red apple | Apple
green apple | táo xanh | Green apple | Granny Smith
banana | quả chuối | Banana | @banana-fruits
orange | quả cam | Tangerine | Orange (fruit)
tangerine | quả quýt | Tangerine |
grapes | quả nho | Grapes | Grape
watermelon | dưa hấu | Watermelon | @watermelon-fruits
melon | dưa lưới | Melon | @melon-fruits
strawberry | dâu tây | Strawberry |
pineapple | quả thơm (dứa) | Pineapple |
mango | quả xoài | Mango |
peach | quả đào | Peach | File:Silver ring with chalcedony and peaches by ASQ.jpg
pear | quả lê | Pear |
cherries | anh đào | Cherries | Cherry
lemon | chanh vàng | Lemon | @lemon-fruits
lime | chanh xanh | Lemon | Key lime
coconut | quả dừa | Coconut | File:Coconut (halved) (3330701660).jpg
blueberries | việt quất | Blueberries | @blueberries-fruits
kiwi | quả kiwi | Kiwi fruit | File:Kiwi aka.jpg
papaya | đu đủ | - | -
guava | quả ổi | - | Guava
dragon fruit | thanh long | - | Pitaya
durian | sầu riêng | - | Durian
jackfruit | quả mít | - | Jackfruit
longan | nhãn | - | -
lychee | quả vải | - | @lychee-fruits
rambutan | chôm chôm | - | Rambutan
mangosteen | măng cụt | - | -
avocado | quả bơ | Avocado | @avocado-fruits
pomegranate | quả lựu | - | Pomegranate
plum | quả mận | - | Plum
apricot | quả mơ | - | Apricot
raspberry | mâm xôi | - | Raspberry
star fruit | khế | - | @star-fruit-fruits
custard apple | mãng cầu | - | @custard-apple-fruits
grapefruit | bưởi | - | Pomelo
passion fruit | chanh dây | - | @passion-fruit-fruits
persimmon | quả hồng | - | Persimmon
fig | quả sung | - | -
date | quả chà là | - | @date-fruits
olive | quả ô liu | Olive | @olive-fruits
"""),
('vegetables', 'Rau củ', 'Vegetables', '#D8F5D0', True, """
carrot | cà rốt | Carrot |
tomato | cà chua | Tomato |
corn | bắp (ngô) | Ear of corn | File:Corn on the cob - Massachusetts.jpg
potato | khoai tây | Potato |
sweet potato | khoai lang | Roasted sweet potato | Sweet potato
cucumber | dưa leo | Cucumber | @cucumber-vegetables
broccoli | bông cải xanh | Broccoli |
cauliflower | bông cải trắng | - | Cauliflower
cabbage | bắp cải | Leafy green | Cabbage
lettuce | xà lách | Leafy green | @lettuce-vegetables
spinach | rau chân vịt | Leafy green | @spinach-vegetables
onion | củ hành | Onion | Onion
garlic | củ tỏi | Garlic | File:Garlic bulbs and cloves.jpg
ginger | gừng | Ginger root | File:Ginger Root.jpg
mushroom | cây nấm | Mushroom | Agaricus bisporus
eggplant | cà tím | Eggplant | @eggplant-vegetables
bell pepper | ớt chuông | Bell pepper |
chili | trái ớt | Hot pepper | Chili pepper
pumpkin | bí đỏ | Jack-o-lantern | Pumpkin
peas | đậu Hà Lan | Pea pod | @peas-vegetables
green beans | đậu que | - | Green bean
peanut | đậu phộng | Peanuts | File:Roasted Peanuts with shell.jpg
beans | hạt đậu | Beans | @beans-vegetables
radish | củ cải | - | Radish
beet | củ dền | - | @beet-vegetables
celery | cần tây | - | Celery
asparagus | măng tây | - | Asparagus
zucchini | bí ngòi | - | Zucchini
okra | đậu bắp | - | @okra-vegetables
bitter melon | khổ qua | - | -
lotus root | củ sen | - | @lotus-root-vegetables
taro | khoai môn | - | -
cassava | khoai mì | - | -
bamboo shoot | măng | - | -
bean sprouts | giá đỗ | - | Mung bean sprout
herbs | rau thơm | Herb | @herbs-vegetables
"""),
('food', 'Món ăn', 'Food', '#FFF0C2', True, """
rice | cơm | Cooked rice | Cooked rice
bread | bánh mì | Bread | Bread
baguette | bánh mì que | Baguette bread | Baguette
egg | quả trứng | Egg | @egg-food
fried egg | trứng chiên | Cooking | Fried egg
noodles | mì sợi | Steaming bowl | @noodles-food
pho | phở | Steaming bowl | Pho
soup | canh (súp) | Pot of food | Soup
porridge | cháo | Bowl with spoon | Congee
meat | thịt | Cut of meat | @meat-food
chicken meat | thịt gà | Poultry leg | File:Max's Roasted Chicken - Evan Swigart.jpg
fish meat | cá (món ăn) | Fried shrimp | File:Fish fry (90626).jpg
sausage | xúc xích | Hot dog | File:German sausages in Tokyo, plus sauerkraut and mustard.jpg
hamburger | bánh hamburger | Hamburger |
hot dog | bánh mì xúc xích | Hot dog |
sandwich | bánh sandwich | Sandwich |
pizza | bánh pizza | Pizza |
spaghetti | mì Ý | Spaghetti | File:Spaghetti with Meat Sauce in Plastic Container.jpg
french fries | khoai tây chiên | French fries |
salad | rau trộn | Green salad | Salad
dumpling | há cảo | Dumpling |
sushi | sushi | Sushi |
spring rolls | chả giò | - | @spring-rolls-food
rice ball | cơm nắm | Rice ball | Onigiri
pancake | bánh kếp | Pancakes | Pancake
waffle | bánh waffle | Waffle |
taco | bánh taco | Taco |
cheese | phô mai | Cheese wedge | Cheese
butter | bơ | Butter |
honey | mật ong | Honey pot | Honey
jam | mứt | - | @jam-food
salt | muối | Salt | File:Salt and pepper by Sierra.jpg
sugar | đường | - | Sugar
tofu | đậu hũ | - | Tofu
yogurt | sữa chua | - | Yogurt
cereal | ngũ cốc | - | @cereal-food
"""),
('drinks', 'Đồ uống', 'Drinks', '#E0F4FF', True, """
milk | sữa | Glass of milk |
water | nước | Potable water | @water-drinks
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
cake | bánh kem | Birthday cake | @cake-sweets
cupcake | bánh cupcake | Cupcake |
cookie | bánh quy | Cookie | Chocolate chip cookie
ice cream | kem | Soft ice cream | Ice cream
candy | kẹo | Candy | @candy-sweets
lollipop | kẹo mút | Lollipop |
chocolate | sô-cô-la | Chocolate bar | Chocolate
donut | bánh vòng | Doughnut |
popcorn | bắp rang | Popcorn | File:Popcorn 1.jpg
pie | bánh nướng | Pie |
pudding | bánh flan | Custard | Crème caramel
croissant | bánh sừng bò | Croissant |
pretzel | bánh quy xoắn | Pretzel |
mooncake | bánh trung thu | Moon cake | Mooncake
shaved ice | đá bào | Shaved ice |
chips | bánh snack | - | Potato chip
jelly | thạch | - | Gelatin dessert
marshmallow | kẹo dẻo | - | @marshmallow-sweets
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
head | cái đầu | - | -
face | khuôn mặt | Slightly smiling face | @face-body
hair | tóc | Person curly hair | @hair-body
eye | con mắt | Eye | @eye-body
eyes | hai mắt | Eyes | @eyes-body
ear | cái tai | - | -
nose | cái mũi | Nose | @nose-body
mouth | cái miệng | Mouth | @mouth-body
lips | môi | Mouth | @lips-body
tooth | cái răng | Tooth | @tooth-body
tongue | cái lưỡi | Tongue | @tongue-body
hand | bàn tay | Hand with fingers splayed | @hand-body
finger | ngón tay | Backhand index pointing up | @finger-body
thumb | ngón cái | Thumbs up | @thumb-body
arm | cánh tay | - | -
leg | cái chân | - | -
foot | bàn chân | Foot | @foot-body
footprints | dấu chân | Footprints | @footprints-body
brain | bộ não | Brain | @brain-body
heart | trái tim | Anatomical heart | @heart-body
bone | xương | Bone | @bone-body
nail | móng tay | Nail polish | @nail-body
"""),
('people', 'Gia đình & mọi người', 'Family & people', '#FFF1C9', False, """
mommy | mẹ | Woman | @mommy-people
daddy | ba | Man | @daddy-people
baby | em bé | Baby | @baby-people
brother | anh / em trai | Boy | @brother-people
sister | chị / em gái | Girl | @sister-people
grandma | bà | Old woman | @grandma-people
grandpa | ông | Old man | @grandpa-people
family | gia đình | House with garden | @family-people
parents | ba mẹ | Two hearts | @parents-people
child | đứa trẻ | Child | @child-people
friend | bạn | People hugging | @friend-people
boy | bé trai | Boy | @boy-people
girl | bé gái | Girl | @girl-people
man | người đàn ông | Man | @man-people
woman | người phụ nữ | Woman | @woman-people
pregnant | mẹ bầu | Pregnant woman | @pregnant-people
breastfeeding | cho bé bú | Breast feeding | @breastfeeding-people
bride | cô dâu | Person with veil | @bride-people
king | vua | - | -
queen | hoàng hậu | - | -
prince | hoàng tử | - | -
princess | công chúa | Princess | @princess-people
"""),
('clothes', 'Quần áo', 'Clothes', '#E6E1FF', True, """
shirt | áo thun | T-shirt | T-shirt
pants | quần dài | Jeans | Jeans
jeans | quần jean | Jeans |
shorts | quần đùi | Shorts | @shorts-clothes
dress | cái đầm | Dress | File:Dress with circle skirt in the wind - pose 1.jpg
skirt | chân váy | - | -
socks | đôi vớ | Socks | Sock
shoes | đôi giày | Running shoe | Sneakers
sandals | dép quai hậu | Flat shoe | Sandal
slippers | dép lê | Thong sandal | Slipper
boots | đôi ủng | Womans boot | Wellington boot
hat | cái nón | Billed cap | @hat-clothes
cap | mũ lưỡi trai | Billed cap | @cap-clothes
helmet | mũ bảo hiểm | Rescue workers helmet | Bicycle helmet
coat | áo khoác | Coat | File:Polo Ralph Lauren winter coat jacket.jpg
jacket | áo gió | Coat | @jacket-clothes
sweater | áo len | - | Sweater
scarf | khăn quàng | Scarf |
gloves | găng tay | Gloves | @gloves-clothes
glasses | mắt kính | Glasses |
sunglasses | kính râm | Sunglasses | @sunglasses-clothes
pajamas | đồ ngủ | - | -
swimsuit | đồ bơi | One-piece swimsuit | File:Chloe Sutton - USA Swimsuit (4661622460) (alternate version).jpg
raincoat | áo mưa | - | Raincoat
tie | cà vạt | Necktie | File:Knoten 003 2024 02 20.jpg
belt | thắt lưng | - | Belt (clothing)
button | cái nút áo | - | Button
bag | cái túi | Handbag |
watch | đồng hồ đeo tay | Watch |
necklace | vòng cổ | Prayer beads | Necklace
ring | nhẫn | Ring | File:Black Opal Ring with Gold Nuggets.JPG
umbrella | cây dù | Umbrella |
"""),
('baby', 'Đồ của bé', 'Baby things', '#FFE8F2', True, """
diaper | tã | - | Diaper
baby bottle | bình sữa | Baby bottle |
pacifier | núm vú giả | - | Pacifier
bib | yếm ăn | - | -
stroller | xe đẩy | - | @stroller-baby
crib | nôi (cũi) | - | -
car seat | ghế ô tô | - | Child safety seat
high chair | ghế ăn dặm | - | High chair
rattle | lục lạc | - | -
blanket | cái chăn | - | -
pillow | cái gối | - | Pillow
potty | bô | - | Potty chair
wet wipes | khăn ướt | - | @wet-wipes-baby
baby shampoo | dầu gội | - | -
towel | khăn tắm | - | Towel
toothbrush | bàn chải đánh răng | Toothbrush | Toothbrush
toothpaste | kem đánh răng | - | Toothpaste
comb | cái lược | - | Comb
"""),
('toys', 'Đồ chơi', 'Toys', '#FFE0EC', True, """
ball | quả bóng | Soccer ball | Ball
teddy bear | gấu bông | Teddy bear |
doll | búp bê | Nesting dolls | File:Baby doll-Calineczka-2006.jpg
balloon | bong bóng | Balloon | Toy balloon
kite | con diều | Kite |
yo-yo | con yo-yo | Yo-yo |
puzzle | xếp hình | Puzzle piece | Jigsaw puzzle
blocks | khối gỗ | Brick | Toy block
robot | người máy | Robot | Toy robot
bubbles | bong bóng xà phòng | Bubbles | Soap bubble
slide | cầu tuột | Playground slide | File:Playground Slide Metal.jpg
swing | xích đu | - | -
seesaw | bập bênh | - | -
sandbox | hố cát | - | @sandbox-toys
toy car | xe đồ chơi | Racing car | @toy-car-toys
toy train | tàu đồ chơi | Locomotive | Toy train
dice | xúc xắc | Game die | Dice
crayons | bút sáp | Crayon | Crayon
play dough | đất nặn | - | -
rocking horse | ngựa gỗ | Carousel horse | Rocking horse
kick scooter | xe trượt | Kick scooter | File:Gabriel riding a kick scooter in a cycle lane, Lisbon, Portugal (PPL1-Corrected) julesvernex2.jpg
tricycle | xe ba bánh | - | -
spinning top | con quay | - | Spinning top
"""),
('vehicles', 'Xe cộ', 'Vehicles', '#FFE5D2', True, """
car | xe hơi | Automobile |
bus | xe buýt | Bus |
school bus | xe đưa đón | Bus | School bus
taxi | xe taxi | Taxi | @taxi-vehicles
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
boat | thuyền | Sailboat | Boat
ship | tàu thủy | Ship | @ship-vehicles
canoe | xuồng | Canoe | Canoe
rocket | tên lửa | Rocket |
tractor | máy cày | Tractor |
excavator | máy xúc | - | Excavator
crane | xe cẩu | Building construction | Mobile crane
bulldozer | xe ủi | - | Bulldozer
cement mixer | xe trộn bê tông | - | -
garbage truck | xe rác | - | @garbage-truck-vehicles
race car | xe đua | Racing car | File:2015 BMW M4 DTM touring race car at Hockenheimring, Germany (Ank Kumar, Infosys Limited) 01.jpg
cable car | cáp treo | Aerial tramway | @cable-car-vehicles
hot air balloon | khinh khí cầu | - | Hot air balloon
submarine | tàu ngầm | - | Submarine
cyclo | xích lô | - | -
skateboard | ván trượt | Skateboard | @skateboard-vehicles
"""),
('home', 'Trong nhà', 'Home', '#F3E6D8', True, """
house | ngôi nhà | House with garden | File:Ranch style home in Salinas, California.JPG
bed | cái giường | Bed | File:Cozy bedroom with a large bed and simple decor in a modern home.jpg
chair | cái ghế | Chair |
table | cái bàn | - | -
door | cánh cửa | Door | File:Front door refinishing.jpg
window | cửa sổ | Window | File:Fischerkirche (window), Born a. Darß.jpg
sofa | ghế sofa | Couch and lamp | @sofa-home
TV | ti vi | Television | @tv-home
lamp | đèn | Light bulb | File:Lamp with a lampshade illuminated by sunlight.jpg
clock | đồng hồ | Alarm clock | Alarm clock
mirror | cái gương | Mirror | File:Mirror MET DP105758.jpg
stairs | cầu thang | - | -
fan | quạt máy | - | Electric fan
air conditioner | máy lạnh | - | -
refrigerator | tủ lạnh | - | Refrigerator
washing machine | máy giặt | - | Washing machine
vacuum | máy hút bụi | - | Vacuum cleaner
broom | cây chổi | Broom | @broom-home
bucket | cái xô | Bucket | @bucket-home
basket | cái giỏ | Basket | @basket-home
box | cái hộp | Package | Cardboard box
key | chìa khóa | Key | File:Key,.,.jpg
picture | bức tranh | Framed picture | File:2014 Tarnobrzeg, kościół Wniebowzięcia NMP, 35.JPG
curtain | rèm cửa | - | @curtain-home
carpet | tấm thảm | - | Carpet
shelf | kệ sách | - | -
toilet | bồn cầu | Toilet |
bathtub | bồn tắm | Bathtub |
shower | vòi sen | Shower | File:High speed shower filtered.jpg
soap | xà phòng | Soap | @soap-home
sink | bồn rửa | - | @sink-home
toilet paper | giấy vệ sinh | Roll of paper | Toilet paper
"""),
('kitchen', 'Nhà bếp', 'Kitchen', '#FFF2DE', True, """
cup | cái ly | Cup with straw | Cup
mug | cái ca | Hot beverage | Mug
glass | ly thủy tinh | Tumbler glass | Tumbler (glass)
plate | cái dĩa | - | -
bowl | cái chén | Bowl with spoon | Bowl
spoon | cái muỗng | Spoon |
fork | cái nĩa | Fork and knife | Fork
knife | con dao | Kitchen knife | Kitchen knife
chopsticks | đôi đũa | Chopsticks | @chopsticks-kitchen
pot | cái nồi | Pot of food | File:Pot with no background.png
pan | cái chảo | Cooking | Frying pan
kettle | ấm nước | - | Kettle
rice cooker | nồi cơm điện | - | Rice cooker
microwave | lò vi sóng | - | Microwave oven
oven | lò nướng | - | -
stove | bếp ga | - | -
bottle | cái chai | Baby bottle | Bottle
jar | hũ (lọ) | Honey pot | Jar
lunch box | hộp cơm | Bento box | @lunch-box-kitchen
apron | tạp dề | - | @apron-kitchen
"""),
('things', 'Đồ dùng & điện tử', 'Things & gadgets', '#E9EEF7', True, """
phone | điện thoại | Mobile phone | @phone-things
computer | máy tính | Laptop | @computer-things
tablet | máy tính bảng | Mobile phone | @tablet-things
camera | máy ảnh | Camera |
headphones | tai nghe | Headphone | Headphones
radio | đài radio | Radio | Radio receiver
battery | cục pin | Battery | File:AA VARTA battery-side PNr°0782.jpg
light bulb | bóng đèn | Light bulb | Incandescent light bulb
flashlight | đèn pin | Flashlight | @flashlight-things
candle | cây nến | Candle |
remote control | điều khiển | - | Remote control
keyboard | bàn phím | Keyboard | @keyboard-things
mouse (computer) | chuột máy tính | Computer mouse | Computer mouse
money | tiền | Dollar banknote | Money
coin | đồng xu | Coin | @coin-things
wallet | cái ví | Purse | Wallet
letter | lá thư | Envelope | @letter-things
gift | món quà | Wrapped gift |
paper | tờ giấy | Page facing up | File:Scattered white paper (Unsplash).jpg
newspaper | tờ báo | Newspaper | @newspaper-things
"""),
('tools', 'Dụng cụ', 'Tools', '#EAE4DA', True, """
hammer | cái búa | Hammer |
screwdriver | tua vít | Screwdriver |
saw | cái cưa | Carpentry saw | @saw-tools
wrench | cờ lê | Wrench |
nail | cây đinh | - | Nail (fastener)
ladder | cái thang | Ladder |
shovel | cái xẻng | - | Shovel
rake | cái cào | - | Rake (tool)
axe | cái rìu | Axe | @axe-tools
tape | băng keo | - | Adhesive tape
rope | sợi dây | Knot | Rope
magnet | nam châm | Magnet | File:Horseshoe magnet metal shavings.jpg
lock | ổ khóa | Locked | Padlock
watering can | bình tưới | - | @watering-can-tools
wheelbarrow | xe rùa | - | @wheelbarrow-tools
needle | cây kim | Sewing needle | File:Sewing needles 20260817.jpg
thread | cuộn chỉ | Thread | File:Wooden spools of sewing thread in different colors 6.jpg
"""),
('school', 'Đồ dùng học tập', 'School', '#E8F7D9', True, """
book | quyển sách | Books | @book-school
notebook | quyển vở | Notebook | @notebook-school
backpack | cặp sách | Backpack | @backpack-school
pencil | bút chì | Pencil |
pen | cây bút | Pen | Ballpoint pen
crayon | bút sáp màu | Crayon |
eraser | cục gôm | - | Eraser
scissors | cái kéo | Scissors |
ruler | cây thước | Straight ruler | File:Ruler image.jpg
glue | keo dán | - | Glue stick
paintbrush | cọ vẽ | Paintbrush | @paintbrush-school
paint | màu vẽ | Artist palette | @paint-school
paper clip | kẹp giấy | Paperclip | Paper clip
calculator | máy tính tay | Abacus | Calculator
globe | quả địa cầu | Globe showing americas | Globe
map | bản đồ | World map | @map-school
chalk | phấn | - | -
blackboard | bảng đen | - | -
desk | bàn học | - | -
teacher | cô giáo | Woman teacher | @teacher-school
student | học sinh | Student | @student-school
"""),
('nature', 'Thiên nhiên', 'Nature', '#D6F3FF', True, """
sun | mặt trời | Sun | @sun-nature
moon | mặt trăng | Crescent moon | Moon
star | ngôi sao | Star | @star-nature
sky | bầu trời | Sun behind cloud | @sky-nature
cloud | đám mây | Cloud | Cumulus cloud
tree | cái cây | Deciduous tree | Tree
palm tree | cây dừa | Palm tree | Arecaceae
leaf | chiếc lá | Leaf fluttering in wind | Leaf
flower | bông hoa | Tulip | Tulip
grass | bãi cỏ | Herb | @grass-nature
rock | hòn đá | Rock | @rock-nature
sand | cát | - | Sand
mountain | ngọn núi | Mountain |
volcano | núi lửa | Volcano |
river | dòng sông | - | River
lake | cái hồ | - | Lake
sea | biển | Water wave | File:Havelock Island, Mangrove tree on the beach, Andaman Islands.jpg
beach | bãi biển | Beach with umbrella | Beach
island | hòn đảo | Desert island | File:Unnamed island, Cheow Lan Lake.jpg
waterfall | thác nước | - | Waterfall
forest | khu rừng | Evergreen tree | Forest
desert | sa mạc | Desert | Desert
cave | hang động | - | @cave-nature
fire | lửa | Fire | Campfire
wood | khúc gỗ | Wood | @wood-nature
"""),
('weather', 'Thời tiết', 'Weather', '#E3F1FF', False, """
sunny | trời nắng | Sun | @sunny-weather
cloudy | nhiều mây | Cloud | @cloudy-weather
rain | mưa | Cloud with rain | @rain-weather
rainy | trời mưa | Umbrella with rain drops | @rainy-weather
storm | bão | Cloud with lightning and rain | @storm-weather
lightning | tia sét | High voltage | @lightning-weather
thunder | sấm | Cloud with lightning | @thunder-weather
wind | gió | Wind face | @wind-weather
snow | tuyết | Snowflake | @snow-weather
snowman | người tuyết | Snowman | @snowman-weather
fog | sương mù | Fog | @fog-weather
rainbow | cầu vồng | Rainbow | @rainbow-weather
tornado | lốc xoáy | Tornado | @tornado-weather
hot | trời nóng | - | -
cold | trời lạnh | Cold face | @cold-weather
puddle | vũng nước | Droplet | @puddle-weather
"""),
('flowers', 'Hoa & cây', 'Flowers & plants', '#E9FCE3', True, """
rose | hoa hồng | Rose |
sunflower | hoa hướng dương | Sunflower | Common sunflower
tulip | hoa tulip | Tulip |
lotus | hoa sen | Lotus | Nelumbo nucifera
cherry blossom | hoa anh đào | Cherry blossom |
hibiscus | hoa dâm bụt | Hibiscus |
daisy | hoa cúc | Blossom | @daisy-flowers
orchid | hoa lan | - | Orchidaceae
lily | hoa ly | - | Lilium
apricot blossom | hoa mai | - | @apricot-blossom-flowers
peach blossom | hoa đào | Cherry blossom | File:Pink Peach Blossom (248772049).jpeg
cactus | cây xương rồng | Cactus | File:Pachycereus pringlei forest.jpg
bamboo | cây tre | Tanabata tree |
seed | hạt giống | Seedling | @seed-flowers
sprout | mầm cây | Seedling | Seedling
potted plant | chậu cây | Potted plant | @potted-plant-flowers
bouquet | bó hoa | Bouquet | File:Rose and carnation flower bouquet 01.jpg
clover | cỏ ba lá | Four leaf clover | File:Green Clovers.jpg
pine tree | cây thông | Evergreen tree | Pine
"""),
('places', 'Nơi chốn', 'Places', '#F4E9FF', True, """
home | nhà | House | File:Hawes Summer Home -- Galveston.jpg
school | trường học | School | @school-places
kindergarten | trường mầm non | Children crossing | Kindergarten
hospital | bệnh viện | Hospital | Hospital
park | công viên | Fountain | Park
playground | sân chơi | Playground slide | Playground
zoo | sở thú | Elephant | @zoo-places
farm | nông trại | Tractor | @farm-places
market | chợ | Shopping cart | @market-places
supermarket | siêu thị | Shopping cart | Supermarket
bakery | tiệm bánh | Croissant | @bakery-places
restaurant | nhà hàng | Fork and knife with plate | @restaurant-places
library | thư viện | Books | Library
pool | hồ bơi | Person swimming | Swimming pool
beach | bãi biển | Beach with umbrella | Beach
airport | sân bay | Airplane departure | File:Singapore Changi Airport, Terminal 1, A340, Dec 05.JPG
train station | nhà ga | Station | @train-station-places
bus stop | trạm xe buýt | Bus stop | @bus-stop-places
police station | đồn cảnh sát | Police car light | Police station
fire station | trạm cứu hỏa | Fire engine | Fire station
post office | bưu điện | Post office | Post office
bank | ngân hàng | Bank | Bank
church | nhà thờ | Church | Church (building)
pagoda | chùa | Shinto shrine | Buddhist temple
castle | lâu đài | Castle |
tent | cái lều | Tent | File:Camping tent on tarp.jpg
bridge | cây cầu | Bridge at night | Bridge
road | con đường | Motorway | File:A591 road, Lake District - June 2009 Edit 1.jpg
street | đường phố | Cityscape | @street-places
city | thành phố | Cityscape | City
village | làng quê | Houses | Village
garden | khu vườn | House with garden | Garden
"""),
('jobs', 'Nghề nghiệp', 'Jobs', '#E0ECFF', False, """
doctor | bác sĩ | Woman health worker | @doctor-jobs
nurse | y tá | Health worker | @nurse-jobs
dentist | nha sĩ | Tooth | @dentist-jobs
teacher | cô giáo | Woman teacher | @teacher-jobs
police officer | cảnh sát | Man police officer | @police-officer-jobs
firefighter | lính cứu hỏa | Man firefighter | @firefighter-jobs
cook | đầu bếp | Woman cook | @cook-jobs
farmer | nông dân | Man farmer | @farmer-jobs
pilot | phi công | Woman pilot | @pilot-jobs
astronaut | phi hành gia | Astronaut | @astronaut-jobs
scientist | nhà khoa học | Woman scientist | @scientist-jobs
singer | ca sĩ | Woman singer | @singer-jobs
artist | họa sĩ | Woman artist | @artist-jobs
builder | thợ xây | Construction worker | @builder-jobs
mechanic | thợ máy | Man mechanic | @mechanic-jobs
judge | thẩm phán | Judge | @judge-jobs
guard | bảo vệ | Guard | @guard-jobs
office worker | nhân viên văn phòng | Woman office worker | @office-worker-jobs
detective | thám tử | Detective | @detective-jobs
mail carrier | người đưa thư | - | -
driver | tài xế | Oncoming taxi | @driver-jobs
clown | chú hề | Clown face | @clown-jobs
"""),
('sports', 'Thể thao', 'Sports', '#E4FFE6', True, """
soccer | bóng đá | Soccer ball | @soccer-sports
basketball | bóng rổ | Basketball |
volleyball | bóng chuyền | Volleyball |
tennis | quần vợt | Tennis |
badminton | cầu lông | Badminton |
baseball | bóng chày | Baseball |
football | bóng bầu dục | American football | @football-sports
table tennis | bóng bàn | Ping pong | Table tennis
golf | đánh gôn | Flag in hole | @golf-sports
bowling | bowling | Bowling |
swimming | bơi lội | Person swimming | Swimming
running | chạy bộ | Person running | Running
cycling | đạp xe | Person biking | Cycling
boxing | đấm bốc | Boxing glove | File:Boxing gloves Bail 10-OZ (3).jpg
karate | võ thuật | Martial arts uniform | File:2019 Karate International tournament fight.jpg
skiing | trượt tuyết | Skier | @skiing-sports
skating | trượt băng | Ice skate | @skating-sports
surfing | lướt sóng | Person surfing | Surfing
gymnastics | thể dục dụng cụ | Person cartwheeling | @gymnastics-sports
yoga | yoga | Person in lotus position | File:Upward-facing dog pose.jpg
fishing | câu cá | Fishing pole | @fishing-sports
medal | huy chương | 1st place medal | File:EMACS gold medal 2023 Pescara.jpg
trophy | cúp | Trophy | @trophy-sports
"""),
('music', 'Âm nhạc', 'Music', '#FFF0F8', True, """
music | âm nhạc | Musical notes | File:Music Sheet.jpg
song | bài hát | Musical note | Singing
piano | đàn piano | Musical keyboard | Piano
guitar | đàn guitar | Guitar | Classical guitar
violin | đàn violin | Violin |
drum | cái trống | Drum | @drum-music
trumpet | kèn trumpet | Trumpet |
saxophone | kèn saxophone | Saxophone | @saxophone-music
flute | ống sáo | Flute | @flute-music
harmonica | kèn harmonica | - | Harmonica
xylophone | đàn mộc cầm | - | -
bell | cái chuông | Bell | @bell-music
microphone | micro | Microphone |
maracas | trống lắc | Maracas |
accordion | đàn accordion | Accordion |
banjo | đàn banjo | Banjo | File:Bluegrass banjo.png
"""),
('feelings', 'Cảm xúc', 'Feelings', '#FFF4B8', False, """
happy | vui | Grinning face | @happy-feelings
sad | buồn | Crying face | @sad-feelings
angry | tức giận | Angry face | @angry-feelings
sleepy | buồn ngủ | Sleeping face | @sleepy-feelings
scared | sợ | Fearful face | @scared-feelings
surprised | ngạc nhiên | - | -
tired | mệt | Tired face | @tired-feelings
yummy | ngon quá | Face savoring food | @yummy-feelings
hot | nóng | - | -
cold | lạnh | Cold face | @cold-feelings
silly | nghịch ngợm | Zany face | @silly-feelings
shy | mắc cỡ | Smiling face with smiling eyes | @shy-feelings
love | thương | Smiling face with hearts | @love-feelings
sick | bị ốm | - | -
hungry | đói bụng | Fork and knife | @hungry-feelings
thirsty | khát nước | Droplet | @thirsty-feelings
bored | chán | - | -
proud | tự hào | Star-struck | @proud-feelings
cool | ngầu | - | -
worried | lo lắng | Worried face | @worried-feelings
laughing | cười lớn | Face with tears of joy | @laughing-feelings
quiet | im lặng | - | -
"""),
('actions', 'Hành động', 'Actions', '#FFE6D5', False, """
run | chạy | Person running | @run-actions
walk | đi bộ | Person walking | @walk-actions
jump | nhảy | Kangaroo | @jump-actions
swim | bơi | Person swimming | @swim-actions
dance | múa | Woman dancing | @dance-actions
sing | hát | Woman singer | @sing-actions
eat | ăn | Fork and knife with plate | @eat-actions
drink | uống | Cup with straw | @drink-actions
sleep | ngủ | Person in bed | @sleep-actions
wake up | thức dậy | - | -
read | đọc | Open book | @read-actions
write | viết | Writing hand | @write-actions
draw | vẽ | Artist palette | @draw-actions
play | chơi | Video game | @play-actions
clap | vỗ tay | - | -
wave | vẫy tay | - | -
hug | ôm | People hugging | @hug-actions
kiss | hôn | Kiss mark | @kiss-actions
cry | khóc | Loudly crying face | @cry-actions
laugh | cười | Face with tears of joy | @laugh-actions
smile | mỉm cười | Smiling face with smiling eyes | @smile-actions
climb | leo trèo | Person climbing | @climb-actions
ride a bike | đạp xe | Person biking | @ride-a-bike-actions
cook | nấu ăn | Cooking | @cook-actions
wash hands | rửa tay | Soap | @wash-hands-actions
brush teeth | đánh răng | - | -
take a bath | tắm | Person taking bath | @take-a-bath-actions
listen | nghe | Ear | @listen-actions
look | nhìn | Eyes | @look-actions
talk | nói chuyện | - | -
think | suy nghĩ | - | -
point | chỉ tay | - | -
push | đẩy | Shopping cart | @push-actions
throw | ném | Softball | @throw-actions
kick | đá banh | Soccer ball | @kick-actions
build | xây | Building construction | @build-actions
paint | tô màu | Paintbrush | @paint-actions
shop | đi chợ | Shopping bags | @shop-actions
fly | bay | Airplane departure | @fly-actions
sit | ngồi | Chair | @sit-actions
stand | đứng | Person standing | @stand-actions
call | gọi điện | Telephone receiver | @call-actions
pray | cầu nguyện | - | -
"""),
('opposites', 'Từ trái nghĩa', 'Opposites', '#F0E6FF', False, """
big | to | Elephant | @big-opposites
small | nhỏ | Mouse | @small-opposites
fast | nhanh | Racing car | @fast-opposites
slow | chậm | Snail | @slow-opposites
hot | nóng | Fire | @hot-opposites
cold | lạnh | Ice | @cold-opposites
up | lên | Up arrow | @up-opposites
down | xuống | Down arrow | @down-opposites
left | trái | Left arrow | @left-opposites
right | phải | Right arrow | @right-opposites
open | mở | Open mailbox with raised flag | @open-opposites
closed | đóng | Closed mailbox with lowered flag | @closed-opposites
full | đầy | Battery | @full-opposites
empty | rỗng | Low battery | @empty-opposites
happy | vui | Grinning face | @happy-opposites
sad | buồn | Crying face | @sad-opposites
day | ban ngày | Sun with face | @day-opposites
night | ban đêm | Night with stars | @night-opposites
wet | ướt | Droplet | @wet-opposites
dry | khô | Desert | @dry-opposites
tall | cao | Giraffe | @tall-opposites
short | thấp | Turtle | @short-opposites
loud | ồn ào | Loudspeaker | @loud-opposites
quiet | yên lặng | - | -
yes | có | Check mark button | @yes-opposites
no | không | Cross mark | @no-opposites
stop | dừng lại | Stop sign | @stop-opposites
go | đi | Green circle | @go-opposites
"""),
('time', 'Thời gian', 'Time', '#E8EAFF', False, """
morning | buổi sáng | Sunrise | @morning-time
afternoon | buổi chiều | Sun behind cloud | @afternoon-time
evening | buổi tối | Sunset | @evening-time
night | ban đêm | Night with stars | @night-time
today | hôm nay | - | -
birthday | sinh nhật | Birthday cake | @birthday-time
clock | đồng hồ | Alarm clock | @clock-time
time | giờ | Mantelpiece clock | @time-time
week | tuần | - | -
spring | mùa xuân | Cherry blossom | @spring-time
summer | mùa hè | Sun with face | @summer-time
autumn | mùa thu | Maple leaf | @autumn-time
winter | mùa đông | Snowman | @winter-time
"""),
('holidays', 'Lễ hội', 'Celebrations', '#FFE3E3', False, """
Tet | Tết | Red envelope | @tet-holidays
lucky money | lì xì | Red envelope | @lucky-money-holidays
lantern | lồng đèn | Red paper lantern | @lantern-holidays
mid-autumn | Trung thu | Moon cake | @mid-autumn-holidays
fireworks | pháo hoa | Fireworks | @fireworks-holidays
party | bữa tiệc | Party popper | @party-holidays
balloon | bong bóng | Balloon | @balloon-holidays
present | quà tặng | Wrapped gift | @present-holidays
birthday cake | bánh sinh nhật | Birthday cake | @birthday-cake-holidays
candles | nến | Candle | @candles-holidays
Christmas | Giáng sinh | Christmas tree | @christmas-holidays
Santa Claus | ông già Noel | Santa claus | @santa-claus-holidays
Halloween | Halloween | Jack-o-lantern | @halloween-holidays
ghost | con ma | - | -
mask | mặt nạ | Performing arts | @mask-holidays
confetti | giấy kim tuyến | Confetti ball | @confetti-holidays
ribbon | ruy băng | Ribbon | @ribbon-holidays
crown | vương miện | Crown | @crown-holidays
"""),
('space', 'Vũ trụ', 'Space', '#E0E4FF', True, """
earth | trái đất | Globe showing asia-australia | Earth
planet | hành tinh | Ringed planet | Saturn
rocket | tên lửa | Rocket |
astronaut | phi hành gia | Astronaut | Astronaut
satellite | vệ tinh | Satellite | @satellite-space
telescope | kính thiên văn | Telescope | @telescope-space
comet | sao chổi | Comet |
shooting star | sao băng | Shooting star | File:Meteor, 8.5.2016.jpg
galaxy | dải ngân hà | Milky way | @galaxy-space
"""),
('fantasy', 'Khủng long & cổ tích', 'Dinosaurs & fairy tales', '#E2FFE9', False, """
dinosaur | khủng long | Sauropod | @dinosaur-fantasy
T-rex | khủng long bạo chúa | T-rex | @t-rex-fantasy
dragon | con rồng | Dragon | @dragon-fantasy
unicorn | kỳ lân | Unicorn | @unicorn-fantasy
fairy | cô tiên | Woman fairy | @fairy-fantasy
wizard | phù thủy | Person mage | @wizard-fantasy
genie | thần đèn | Woman genie | @genie-fantasy
vampire | ma cà rồng | - | -
mermaid | nàng tiên cá | - | -
superhero | siêu nhân | Woman superhero | @superhero-fantasy
troll | yêu tinh | Troll | @troll-fantasy
zombie | thây ma | Woman zombie | @zombie-fantasy
magic wand | đũa thần | Magic wand | @magic-wand-fantasy
alien | người ngoài hành tinh | Alien | @alien-fantasy
UFO | đĩa bay | Flying saucer | @ufo-fantasy
"""),
('health', 'Sức khỏe', 'Health', '#FFEFEF', False, """
medicine | thuốc | Pill | @medicine-health
syringe | ống tiêm | Syringe | @syringe-health
bandage | băng cá nhân | Adhesive bandage | @bandage-health
thermometer | nhiệt kế | Thermometer | @thermometer-health
stethoscope | ống nghe | Stethoscope | @stethoscope-health
mask | khẩu trang | Face with medical mask | @mask-health
cough | ho | Face with open mouth | @cough-health
sneeze | hắt hơi | Sneezing face | @sneeze-health
fever | sốt | - | -
hurt | đau | Face with head-bandage | @hurt-health
wheelchair | xe lăn | Manual wheelchair | @wheelchair-health
crutch | nạng | Crutch | @crutch-health
"""),
]
