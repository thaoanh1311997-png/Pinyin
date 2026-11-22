# Builds coloring-page outlines from Fluent "Flat" SVGs: img/c/<slug>.svg + js/cmap.js (word/emoji name -> slug)
# Usage: python3 outline.py   (run from xiu-mai/tools; needs FL3D list like fetch.py)
import os,re,json,sys,urllib.request,urllib.parse
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fetch import L as FL, path, slug
from words import T
OUT='../img/c/';os.makedirs(OUT,exist_ok=True)
def bbox_small(d):
  toks=re.findall(r'[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?',d);xs=[];ys=[];x=y=sx=sy=0;i=0;cmd=None
  N={'M':2,'L':2,'T':2,'H':1,'V':1,'C':6,'S':4,'Q':4,'A':7,'Z':0}
  try:
    while i<len(toks):
      t=toks[i]
      if t.isalpha(): cmd=t;i+=1
      if cmd in 'Zz': x,y=sx,sy;continue
      k=N[cmd.upper()];v=[float(q) for q in toks[i:i+k]];i+=k;rel=cmd.islower();U=cmd.upper()
      if U=='H': x=v[0]+(x if rel else 0)
      elif U=='V': y=v[0]+(y if rel else 0)
      else:
        nx,ny=v[-2],v[-1]
        if rel: nx+=x;ny+=y
        x,y=nx,ny
      if U=='M': sx,sy=x,y;cmd='l' if rel else 'L'
      xs.append(x);ys.append(y)
  except Exception: return False
  if not xs: return True
  return (max(xs)-min(xs))*(max(ys)-min(ys))<60
def conv(s,sw=0.55):
  OUTL='fill="#fff" stroke="#222" stroke-width="%s" stroke-linejoin="round"'%sw
  def tag(m):
    t=m.group(0);f=re.search(r'fill="([^"]*)"',t)
    if not f or f.group(1)=='none': return t
    c=f.group(1);dark=False
    if c.startswith('#'):
      h=c[1:] if len(c)==7 else ''.join(x*2 for x in c[1:4])
      try: r,g,b=int(h[0:2],16),int(h[2:4],16),int(h[4:6],16);dark=0.3*r+0.59*g+0.11*b<70
      except Exception: pass
    d=re.search(r' d="([^"]*)"',t)
    if dark and (not d or bbox_small(d.group(1))): return t.replace(f.group(0),'fill="#222"')
    return t.replace(f.group(0),OUTL)
  s=re.sub(r'<(path|circle|rect|ellipse|polygon)\b[^>]*>',tag,s)
  s=re.sub(r'<defs>.*?</defs>','',s,flags=re.S)
  s=re.sub(r'\s+',' ',s).replace('> <','><')
  return s.strip()
folders=sorted({p.split('/')[1] for p in FL if p.startswith('assets/')})
def get(folder):
  fn=OUT+slug(folder)+'.svg'
  p=path(folder)
  if not p: return folder,False
  fp=p.replace('/3D/','/Flat/').replace('_3d','_flat').replace('.png','.svg')
  try:
    d=urllib.request.urlopen('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/'+urllib.parse.quote(fp),timeout=30).read().decode()
    open(fn,'w').write(conv(d));return folder,True
  except Exception as e: return folder,False
with ThreadPoolExecutor(12) as ex: R=list(ex.map(get,folders))
ok={f for f,v in R if v}
print('outlines',len(ok),'missing',[f for f,v in R if not v][:20])
M={}
for f in ok:
  n=f.lower();M.setdefault(n,slug(f))
  if n.endswith(' face'): M.setdefault(n[:-5],slug(f))
for key,vi,en,col,photo,lines in T:
  for l in lines.strip().split('\n'):
    p=[x.strip() for x in l.split('|')]+['','']
    f=p[2] or p[0]
    if f!='-' and f in ok: M[p[0].lower()]=slug(f)
open('../js/cmap.js','w').write('window.CMAP='+json.dumps(M,separators=(',',':'))+';\n')
print('map',len(M))
