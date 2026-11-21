import json,os,re,sys,urllib.request,io
from PIL import Image
sys.path.insert(0,'.'); from words import T
L=open('/tmp/claude-0/-home-user/9102cb23-5a73-5a03-851f-84e8163dc030/scratchpad/fl3d.txt').read().split('\n')
def path(folder):
  c=[p for p in L if p.startswith(f'assets/{folder}/')]
  for pref in ('/Light/','/Default/',''):
    for p in c:
      if pref in p: return p
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
EXTRA=['Woman standing','Woman walking','Woman feeding baby','Person taking bath','Person in bed','People hugging','Child','Woman cook','Bed','Window','Toothbrush','Bathtub','Sun','Potted plant','Teddy bear','Shower','Soap','Bowl with spoon','Glass of milk','Crescent moon','Star','Deciduous tree','Soccer ball','Shopping cart','Basket','Red apple','Banana','Couch and lamp','Television','Books','Alarm clock','Droplet','Bubbles','Running shoe','T-shirt','Jeans','Socks','Coat','Billed cap','Puzzle piece','Teddy bear','Waving hand','Clapping hands','Hugging face','Red heart','Sparkles','Glowing star','Sun with face','Cloud','Bandage','Crying face','Grinning face','Sleeping face','Bus','School','Backpack','Bird','Cat','Dog','Duck','Butterfly','Tulip','Playground slide','Fork and knife with plate','Baby bottle','Cookie','Locked','Child','Baby','Woman','Man','Musical notes','Microphone','Camera','Party popper','Trophy','1st place medal','Speaker high volume','Light bulb','Open book','Speech balloon','Thought balloon','Chair','Door','Hand with fingers splayed','Broom','Wastebasket','Umbrella','Cloud with rain','Sunflower','Ice','Hot beverage','Shopping bags','Bread','Egg','Steaming bowl','Spoon','Sponge','Roll of paper']
need={}
for key,vi,en,col,ws in T:
  for w,wv,f in ws: need[f]=1
for f in EXTRA: need[f]=1
out='../img/w/'; miss=[]
for f in need:
  fn=out+slug(f)+'.webp'
  if os.path.exists(fn): continue
  p=path(f)
  if not p: miss.append(f); continue
  u='https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/'+urllib.parse.quote(p)
  try:
    d=urllib.request.urlopen(u,timeout=30).read(); im=Image.open(io.BytesIO(d)).convert('RGBA'); im.thumbnail((256,256)); im.save(fn,'WEBP',quality=88)
  except Exception as e: miss.append(f+' '+str(e))
print('miss',miss); print(len(os.listdir(out)))
