import json,os,re,sys,urllib.request,io
from PIL import Image
# Fluent 3D helpers. FL3D = file list from: git clone --filter=blob:none https://github.com/microsoft/fluentui-emoji && git ls-files assets | grep /3D/
L=open(os.environ.get('FL3D','/tmp/claude-0/-home-user/9102cb23-5a73-5a03-851f-84e8163dc030/scratchpad/fl3d.txt')).read().split('\n')
def path(folder):
  c=[p for p in L if p.startswith(f'assets/{folder}/')]
  for pref in ('/Light/','/Default/',''):
    for p in c:
      if pref in p: return p
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
EXTRA=['Woman standing','Woman walking','Woman feeding baby','Person taking bath','Person in bed','People hugging','Child','Woman cook','Bed','Window','Toothbrush','Bathtub','Sun','Potted plant','Teddy bear','Shower','Soap','Bowl with spoon','Glass of milk','Crescent moon','Star','Deciduous tree','Soccer ball','Shopping cart','Basket','Red apple','Banana','Couch and lamp','Television','Books','Alarm clock','Droplet','Bubbles','Running shoe','T-shirt','Jeans','Socks','Coat','Billed cap','Puzzle piece','Teddy bear','Waving hand','Clapping hands','Hugging face','Red heart','Sparkles','Glowing star','Sun with face','Cloud','Bandage','Crying face','Grinning face','Sleeping face','Bus','School','Backpack','Bird','Cat','Dog','Duck','Butterfly','Tulip','Playground slide','Fork and knife with plate','Baby bottle','Cookie','Locked','Child','Baby','Woman','Man','Musical notes','Microphone','Camera','Party popper','Trophy','1st place medal','Speaker high volume','Light bulb','Open book','Speech balloon','Thought balloon','Chair','Door','Hand with fingers splayed','Broom','Wastebasket','Umbrella','Cloud with rain','Sunflower','Ice','Hot beverage','Shopping bags','Bread','Egg','Steaming bowl','Spoon','Sponge','Roll of paper']
