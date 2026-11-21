import json,sys,re
m=json.load(open(sys.argv[1]))
L=open('words.py').read().split('\n');photo=False;done=set()
for i,l in enumerate(L):
  h=re.match(r"\('(\w+)', '.*', (True|False), \"\"\"",l)
  if h: photo=h.group(2)=='True';continue
  p=[x.strip() for x in l.split('|')]
  if photo and len(p)>=2 and p[0] in m:
    while len(p)<4: p.append('')
    if p[2]=='' : p[2]=''
    p[3]=m[p[0]]; L[i]=' | '.join(p).rstrip(' |') if False else ' | '.join(p); done.add(p[0])
open('words.py','w').write('\n'.join(L))
print('set',len(done),'missing',[k for k in m if k not in done])
