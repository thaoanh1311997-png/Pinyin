import sys;sys.path.insert(0,'.')
from words import T
fl=set(x.split('/')[1] for x in open('/tmp/claude-0/-home-user/9102cb23-5a73-5a03-851f-84e8163dc030/scratchpad/fl3d.txt') if x.startswith('assets/'))
low={x.lower():x for x in fl}
bad=[]
for k,vi,en,c,ph,lines in T:
  for l in lines.strip().split('\n'):
    p=[x.strip() for x in l.split('|')]+['','']
    f=p[2] or p[0]
    if f!='-' and f.lower() not in low: bad.append((k,p[0],f))
print(len(fl),len(bad));print(bad)
