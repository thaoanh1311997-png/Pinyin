import json,os,io,time,urllib.request,urllib.parse,math,sys
import numpy as np
from PIL import Image,ImageDraw
UA={'User-Agent':'XiuMaiKidsFlashcards/2.0 (educational, non-commercial; github.com/thaoanh1311997-png/Pinyin)'}
def get(u,tries=5,js=True):
  for i in range(tries):
    try:
      r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30);d=r.read()
      return json.loads(d) if js else d
    except urllib.error.HTTPError as e:
      if e.code in (429,503): print('wait',e.code,u[:80],flush=True); time.sleep(20*(i+1)); continue
      return None
    except Exception as e: time.sleep(3)
  return None
ov_ok=True
def openverse(q):
  global ov_ok
  if not ov_ok: return []
  j=get('https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'page_size':12,'license_type':'all-cc','mature':'false'}))
  time.sleep(3.2)
  if j is None: print('ov fail',q,flush=True); return []
  out=[]
  for r in j.get('results',[]):
    if (r.get('width') or 0) and min(r['width'],r['height'])<400: continue
    out.append({'src':'ov','id':r['id'],'thumb':r.get('thumbnail'),'url':r['url'],'w':r.get('width'),'h':r.get('height'),'lic':(r.get('license') or '').upper()+' '+(r.get('license_version') or ''),'by':r.get('creator') or '','page':r.get('foreign_landing_url') or '','title':r.get('title') or ''})
  return out
def commons(q):
  j=get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','generator':'search','gsrsearch':q+' filetype:bitmap','gsrnamespace':6,'gsrlimit':10,'prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':320,'format':'json','formatversion':2}))
  time.sleep(0.8);out=[]
  if not j: return out
  for p in sorted(j.get('query',{}).get('pages',[]),key=lambda p:p['index']):
    ii=(p.get('imageinfo') or [None])[0]
    if not ii or min(ii['width'],ii['height'])<400: continue
    m=ii.get('extmetadata',{});lic=(m.get('LicenseShortName',{}) or {}).get('value','')
    if 'fair use' in lic.lower() or 'non-free' in lic.lower(): continue
    out.append({'src':'cm','id':p['title'],'thumb':ii['thumburl'],'url':ii['thumburl'].replace('/320px-','/800px-') if '/320px-' in ii['thumburl'] else ii['thumburl'],'w':ii['width'],'h':ii['height'],'lic':lic,'by':(m.get('Artist',{}) or {}).get('value','')[:200],'page':ii['descriptionurl'],'title':p['title']})
  return out
def score(img,scene):
  a=np.asarray(img.convert('RGB').resize((160,160))).astype(float)
  g=a.mean(2);b=np.concatenate([a[:10].reshape(-1,3),a[-10:].reshape(-1,3),a[:,:10].reshape(-1,3),a[:,-10:].reshape(-1,3)])
  bstd=b.std(0).mean();bmean=b.mean()
  rg=a[...,0]-a[...,1];yb=0.5*(a[...,0]+a[...,1])-a[...,2]
  col=math.sqrt(rg.std()**2+yb.std()**2)+0.3*math.sqrt(rg.mean()**2+yb.mean()**2)
  sharp=np.abs(np.diff(g,axis=0)).mean()+np.abs(np.diff(g,axis=1)).mean()
  bright=g.mean()
  s=min(col,60)/20+min(sharp,25)/12-abs(bright-140)/80
  if col<8: s-=3
  if not scene: s+=(2.5 if bstd<18 else 1 if bstd<35 else 0)+(1.5 if bmean>200 else 0)
  return round(s,2),dict(bstd=round(bstd),col=round(col),sh=round(sharp,1),br=round(bright))
Q=json.load(open('tools/queries.json'));os.makedirs('out/t',exist_ok=True);res={}
for n,q in enumerate(Q):
  key=q['t']+'|'+q['w'];C=[]
  for qq in [q['q']]+([q['q2']] if q.get('q2') else []):
    C+=openverse(qq)
  C+=commons(q['q'])
  seen=set();L=[]
  for c in C:
    if c['id'] in seen or not c['thumb']: continue
    seen.add(c['id'])
    d=get(c['thumb'],3,False)
    if not d: continue
    try: im=Image.open(io.BytesIO(d));im.load()
    except Exception: continue
    c['s'],c['m']=score(im,q['scene']);c['_im']=im;L.append(c)
  L.sort(key=lambda c:-c['s']);L=L[:10]
  for i,c in enumerate(L):
    im=c.pop('_im').convert('RGB');im.thumbnail((180,180));im.save(f"out/t/{n}-{i}.jpg",quality=80)
  res[key]=L;print(n,key,len(L),flush=True)
json.dump(res,open('out/cands.json','w'),ensure_ascii=False)
# sheets: picks (first of each) 100 per sheet; candidate rows 8 words per sheet
keys=list(res);W=150
def tile(path,txt,d,im,x,y):
  try: a=Image.open(path);a.thumbnail((W-4,W-4));im.paste(a,(x+2,y+2))
  except Exception: pass
  d.text((x+3,y+W-1),txt,fill='red')
for s in range(0,len(keys),100):
  sub=keys[s:s+100];R=(len(sub)+9)//10;im=Image.new('RGB',(W*10,(W+14)*R),'white');d=ImageDraw.Draw(im)
  for i,k in enumerate(sub): tile(f"out/t/{s+i}-0.jpg",f"{s+i} {k.split('|')[1]}",d,im,(i%10)*W,(i//10)*(W+14))
  im.save(f'out/pick{s//100}.jpg',quality=82)
for s in range(0,len(keys),8):
  sub=keys[s:s+8];im=Image.new('RGB',(W*10,(W+14)*len(sub)),'white');d=ImageDraw.Draw(im)
  for r,k in enumerate(sub):
    for i in range(len(res[k])): tile(f"out/t/{s+r}-{i}.jpg",f"{s+r}.{i} {k.split('|')[1]}" if i==0 else str(i),d,im,i*W,r*(W+14))
  im.save(f'out/rows{s//8:02d}.jpg',quality=80)
