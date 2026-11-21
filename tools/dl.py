import json,os,io,re,sys,time,urllib.request
from PIL import Image
UA={'User-Agent':'XiuMaiKidsFlashcards/2.0 (educational, non-commercial; github.com/thaoanh1311997-png/Pinyin)'}
src=sys.argv[1];dst=sys.argv[2];os.makedirs(dst+'/p',exist_ok=True)
L=json.load(open(src));cred={}
def get(u):
  for i in range(4):
    try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()
    except urllib.error.HTTPError as e:
      if e.code in (429,503): time.sleep(15*(i+1)); continue
      return None
    except Exception: time.sleep(3)
for x in L:
  us=[]
  if x['src']=='cm': us=[re.sub(r'/\d+px-','/800px-',x['url']),x['url']]
  else:
    u=x['url'] or ''
    if 'staticflickr.com' in u: us=[re.sub(r'(_[a-z])?\.jpg$','_c.jpg',u),u]
    else: us=[u]
    us.append(x['thumb'])
  ok=False
  for u in us:
    d=get(u)
    if not d: continue
    try:
      im=Image.open(io.BytesIO(d));im.load();im=im.convert('RGB')
      if min(im.size)<240: continue
      im.thumbnail((800,800),Image.LANCZOS);im.save(f"{dst}/p/{x['slug']}.jpg",quality=84,optimize=True);ok=True;break
    except Exception: pass
  print(x['slug'],'OK' if ok else 'FAIL',flush=True)
  if ok:
    by=re.sub(r'<[^>]+>','',x.get('by') or '').strip()[:120]
    cred[x['word']+'|'+x['topic']]={'slug':x['slug'],'src':'Wikimedia Commons' if x['src']=='cm' else 'Openverse','page':x['page'],'author':by,'license':x['lic'].strip(),'title':x['title']}
  time.sleep(0.5)
json.dump(cred,open(dst+'/credits.json','w'),ensure_ascii=False,indent=0)
