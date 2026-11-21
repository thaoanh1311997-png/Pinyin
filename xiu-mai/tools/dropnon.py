# In non-photo topics (except abstract ones), drop words that have no @photo so each topic is all-photo.
import re
KEEP3D={'colors','shapes','numbers'}
L=open('words.py').read().split('\n');photo=True;topic=None;dropped=[]
for i,l in enumerate(L):
  h=re.match(r"\('(\w+)', '.*', (True|False), \"\"\"",l)
  if h: topic=h.group(1);photo=h.group(2)=='True';continue
  p=[x.strip() for x in l.split('|')]
  if topic and not photo and topic not in KEEP3D and len(p)>=2 and p[0] and not l.startswith(('"""',')')):
    while len(p)<4: p.append('')
    if not p[3].startswith('@'): p[2]='-';p[3]='-';L[i]=' | '.join(p);dropped.append(topic+':'+p[0])
open('words.py','w').write('\n'.join(L))
print(len(dropped),dropped)
