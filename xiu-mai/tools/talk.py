import json,sys
out={};errs=[]
for f in ['talk1.txt','talk2.txt','talk3.txt','talk4.txt']:
  cur=None
  for ln in open(f,encoding='utf8'):
    ln=ln.strip()
    if not ln: continue
    if ln.startswith('## '):
      cur={'d':[],'a':[],'v':[],'pt':[]}; out[ln[3:].strip()]=cur; continue
    t,_,rest=ln.partition(': '); p=[x.strip() for x in rest.split(' | ')]
    if t in('D','A'):
      if len(p)!=3: errs.append((f,ln)); continue
      cur['d' if t=='D' else 'a'].append(p)
    elif t=='V': cur['v'].append(p)
    elif t=='P': cur['pt'].append([p[0],p[1],[]])
    elif t=='E': cur['pt'][-1][2].append(p)
    else: errs.append((f,ln))
for k,v in out.items():
  if (len(v['d']),len(v['a']),len(v['v']),len(v['pt']))!=(4,8,6,2) or any(len(x[2])!=2 for x in v['pt']) or any(len(x)!=2 for x in v['v']):
    errs.append(('count',k,len(v['d']),len(v['a']),len(v['v']),len(v['pt'])))
print(len(out),'stops',errs)
keys=sorted(out,key=int); assert keys==[str(i) for i in range(1,62)],keys
spk=set(x[0] for v in out.values() for x in v['d']+v['a']); print('speakers',spk)
open('../js/talk.js','w',encoding='utf8').write('/* generated from tools/talk*.txt by tools/talk.py */\nwindow.XM_TALK='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
