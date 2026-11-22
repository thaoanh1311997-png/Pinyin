import json,os,time,urllib.request,urllib.parse
UA={'User-Agent':'XiuMaiKidsFlashcards/2.0 (educational)'}
os.makedirs('out3',exist_ok=True)
W=['cat','parrot','chick','dog','police officer','strawberry','frying pan','platypus','elephant','car']
P='cute kawaii {w} coloring page for toddlers, thick clean black outlines, simple, big eyes, white background, no shading, no color, centered, full body'
log={}
for w in W:
  for seed in (1,2):
    u='https://image.pollinations.ai/prompt/'+urllib.parse.quote(P.format(w=w))+f'?width=768&height=768&nologo=true&seed={seed}&model=flux'
    t=time.time()
    try:
      d=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read()
      open(f"out3/pl-{w.replace(' ','_')}-{seed}.jpg",'wb').write(d);log[f'pl {w} {seed}']=[len(d),round(time.time()-t)]
    except Exception as e: log[f'pl {w} {seed}']=str(e)[:100]
    print(w,seed,log[f'pl {w} {seed}'],flush=True);time.sleep(3)
  try:
    j=json.loads(urllib.request.urlopen(urllib.request.Request('https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':w+' coloring page','page_size':6}),headers=UA),timeout=30).read())
    for i,r in enumerate(j['results'][:4]):
      try: open(f"out3/ov-{w.replace(' ','_')}-{i}.jpg",'wb').write(urllib.request.urlopen(urllib.request.Request(r['thumbnail'],headers=UA),timeout=30).read())
      except Exception: pass
  except Exception as e: print('ov',e)
json.dump(log,open('out3/log.json','w'),indent=1)
