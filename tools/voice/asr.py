import sherpa_onnx, numpy as np, glob
d=glob.glob('/home/user/tts/sherpa-onnx-sense-voice*')[0]+'/'
R=sherpa_onnx.OfflineRecognizer.from_sense_voice(model=glob.glob(d+'model*.onnx')[0],tokens=d+'tokens.txt',language='zh',use_itn=False,num_threads=4)
def asr(a,sr=24000):
    import librosa
    a16=librosa.resample(a.astype(np.float32),orig_sr=sr,target_sr=16000)
    s=R.create_stream(); s.accept_waveform(16000,a16); R.decode_stream(s); return s.result.text
