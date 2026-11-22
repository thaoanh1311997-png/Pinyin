import onnxruntime as ort, numpy as np, re, os, warnings
warnings.filterwarnings('ignore')
D='/home/user/tts/kokoro-multi-lang-v1_1/'
opts=ort.SessionOptions(); opts.intra_op_num_threads=int(os.environ.get('NT','4'))
S=ort.InferenceSession(D+'model.onnx',opts)
VOC={}
for l in open(D+'tokens.txt',encoding='utf-8'):
    l=l.rstrip('\n'); i=l.rfind(' '); VOC[l[:i]]=int(l[i+1:])
meta=S.get_modelmeta().custom_metadata_map
SPK={kv.split('->')[1]:int(kv.split('->')[0]) for kv in meta['id2speaker'].split(',')}
VOICES=np.fromfile(D+'voices.bin',dtype=np.float32).reshape(len(SPK),510,1,256)
from misaki import zh
G=zh.ZHG2P(version='1.1')
def phon(text):
    return G(text)[0]
def synth(ph, spk, speed=1.0):
    ids=[VOC[c] for c in ph if c in VOC]
    ids=ids[:508]
    st=VOICES[SPK[spk], len(ids)][0][None,:]  # style indexed by length
    a=S.run(None,{'tokens':np.array([[0]+ids+[0]],dtype=np.int64),'style':st.astype(np.float32),'speed':np.array([speed],dtype=np.float32)})[0]
    return a.reshape(-1)
