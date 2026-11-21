import json,os
from PIL import Image,ImageDraw
d=json.load(open('out/cands.json'));W=150
for w,L in d.items():
  slug=''.join(c if c.isalnum() else '-' for c in w)
  if not L: continue
  im=Image.new('RGB',(W*5,(W+14)*2),'white');dr=ImageDraw.Draw(im)
  for i in range(len(L)):
    try:a=Image.open(f'out/c/{slug}-{i}.jpg').convert('RGB')
    except: continue
    a.thumbnail((W-4,W-4));x=(i%5)*W;y=(i//5)*(W+14);im.paste(a,(x+2,y+2));dr.text((x+3,y+W),str(i),fill='red')
  im.save(f'out/s-{slug}.jpg',quality=80)
