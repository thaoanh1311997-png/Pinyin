import os,shutil,json,time
from gradio_client import Client
os.makedirs('out4',exist_ok=True)
P='cute kawaii {w} coloring page for kids, black and white line art, thick clean bold outlines, big sparkly eyes, simple cartoon, pure white background, no shading, no gray, no color'
W=['cat','parrot','chick','puppy dog','police officer','strawberry','frying pan','platypus']
log={}
for sp in ['black-forest-labs/FLUX.1-schnell','black-forest-labs/FLUX.1-dev']:
  try: c=Client(sp)
  except Exception as e: log[sp]=str(e)[:200];print(sp,e);continue
  for w in W:
    t=time.time()
    try:
      r=c.predict(prompt=P.format(w=w),seed=3,randomize_seed=False,width=768,height=768,num_inference_steps=4 if 'schnell' in sp else 24,api_name='/infer')
      f=r[0] if isinstance(r,(list,tuple)) else r
      shutil.copy(f,f"out4/{sp.split('/')[1]}-{w.replace(' ','_')}.webp");log[sp+' '+w]=round(time.time()-t)
    except Exception as e: log[sp+' '+w]=str(e)[:200]
    print(sp,w,log[sp+' '+w],flush=True)
json.dump(log,open('out4/log.json','w'),indent=1)
