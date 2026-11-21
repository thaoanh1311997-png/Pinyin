# usage: python3 setslug.py map.json   (map: {"topic|word": "slug"}) -> sets wiki column to @slug
import json,sys,re
m=json.load(open(sys.argv[1]))
L=open('words.py').read().split('\n');topic=None;done=set()
for i,l in enumerate(L):
  h=re.match(r"\('(\w+)', '.*', (True|False), \"\"\"",l)
  if h: topic=h.group(1);continue
  p=[x.strip() for x in l.split('|')]
  if topic and len(p)>=2 and topic+'|'+p[0] in m:
    while len(p)<4: p.append('')
    p[3]='@'+m[topic+'|'+p[0]];L[i]=' | '.join(p);done.add(topic+'|'+p[0])
open('words.py','w').write('\n'.join(L))
print('set',len(done),'missing',[k for k in m if k not in done])
