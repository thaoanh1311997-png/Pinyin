/* Xíu Mại subtitles: YouTube (Supadata, mirrors) + own files (Groq Whisper, cut into pieces so big files work on phones). Keys are the same per-device keys as the /video/ site (same origin): localStorage bb.sdkey / bb.groq. */
(function () {
const sleep = ms => new Promise(r => setTimeout(r, ms));
const isAudio=f=>/^audio/.test(f.type||'')||/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|wma|amr|mpga)$/i.test(f.name||'');
const MP3BR=[[0,32,64,96,128,160,192,224,256,288,320,352,384,416,448],[0,32,48,56,64,80,96,112,128,160,192,224,256,320,384],[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320],[0,32,48,56,64,80,96,112,128,144,160,176,192,224,256],[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]];
function mp3Hdr(b,i){ // -> {len,samples,sr} or null
  if(i+4>b.length||b[i]!==0xFF||(b[i+1]&0xE0)!==0xE0) return null;
  const ver=(b[i+1]>>3)&3, lay=(b[i+1]>>1)&3, bri=b[i+2]>>4, sri=(b[i+2]>>2)&3, pad=(b[i+2]>>1)&1;
  if(ver===1||lay===0||bri===0||bri===15||sri===3) return null;
  const v1=ver===3, sr=[44100,48000,32000][sri]/(ver===3?1:ver===2?2:4);
  const br=(lay===3?MP3BR[v1?0:3]:lay===2?MP3BR[v1?1:4]:MP3BR[v1?2:4])[bri]*1000;
  if(lay===3) return {len:Math.floor((12*br/sr+pad))*4,samples:384,sr};
  const samples=lay===1&&!v1?576:1152;
  return {len:Math.floor(samples/8*br/sr)+pad,samples,sr};
}
async function fileKind(file){
  const h=new Uint8Array(await file.slice(0,12).arrayBuffer()), t=String.fromCharCode(...h);
  if((h[0]===0x49&&h[1]===0x44&&h[2]===0x33)||(h[0]===0xFF&&(h[1]&0xE0)===0xE0)) return 'mp3';
  if(t.slice(0,4)==='RIFF'&&t.slice(8,12)==='WAVE') return 'wav';
  if(t.slice(4,8)==='ftyp') return /^(qt|M4V|isom|mp4[12]|avc1|iso[2-6])/.test(t.slice(8,12))&&!isAudio(file)?'mp4':'m4a';
  if(t.slice(0,4)==='OggS') return 'ogg';
  if(t.slice(0,4)==='fLaC') return 'flac';
  if(h[0]===0x1A&&h[1]===0x45&&h[2]===0xDF&&h[3]===0xA3) return 'webm';
  return /\.mp3$/i.test(file.name||'')?'mp3':'';
}
async function mp3Pieces(file,maxBytes){
  if(await fileKind(file)!=='mp3') return null;
  const W=4<<20, END=file.size; let bs=0, b=new Uint8Array(0);
  const need=async p=>{ if(p<bs||(p+3000>bs+b.length&&bs+b.length<END)){ bs=p; b=new Uint8Array(await file.slice(p,Math.min(END,p+W)).arrayBuffer()); } };
  const hdr=p=>p-bs+4<=b.length?mp3Hdr(b,p-bs):null;
  const ok=p=>{const h=hdr(p); if(!h||h.len<4) return null; const n=p+h.len; if(n>=END-4) return h; const h2=hdr(n); return h2&&h2.sr===h.sr?h:null;};
  const lim=()=>bs+b.length>=END?END-4:bs+b.length-3000;
  let i=0;
  await need(0);
  if(b[0]===0x49&&b[1]===0x44&&b[2]===0x33) i=10+((b[6]&127)<<21|(b[7]&127)<<14|(b[8]&127)<<7|(b[9]&127));
  for(;;){ await need(i); const e=lim(); while(i<e&&!ok(i)) i++; if(i<e) break; if(i>=END-4) return null; }
  { const h=hdr(i), tag=String.fromCharCode(...b.subarray(i-bs+4,Math.min(b.length,i-bs+48))); if(h&&/Xing|Info|VBRI/.test(tag)) i+=h.len; } // skip the VBR info frame (it holds the whole file's length)
  const pieces=[]; let start=i, t=0, t0=0, frames=0;
  while(i<END-4){
    await need(i); const e=lim();
    while(i<e){
      const h=hdr(i);
      if(!h||h.len<4){ i++; while(i<e&&!ok(i)) i++; continue; } // skip junk
      if(i-start>=maxBytes){ pieces.push({blob:file.slice(start,i,'audio/mpeg'),off:t0,dur:t-t0}); start=i; t0=t; }
      t+=h.samples/h.sr; i+=h.len; frames++;
    }
    if(e>=END-4) break;
  }
  pieces.push({blob:file.slice(start,Math.min(i,END),'audio/mpeg'),off:t0,dur:t-t0});
  return frames>10?pieces:null;
}
// Split an MP4 / M4A / MOV into small audio-only .m4a pieces (each a complete little file), cut on sample boundaries.
// Only the index (moov) is read into memory; the sound itself stays as file.slice() parts, so even a 1 GB iPhone
// video never gets copied into memory. Returns [{blob,off,dur}] or null (fragmented or unusual files).
async function mp4Pieces(file,maxBytes){
  const END=file.size, rd=async(a,n)=>new Uint8Array(await file.slice(a,Math.min(END,a+n)).arrayBuffer());
  const u32=(b,i)=>((b[i]<<24)>>>0)+(b[i+1]<<16)+(b[i+2]<<8)+b[i+3], typ=(b,i)=>String.fromCharCode(b[i],b[i+1],b[i+2],b[i+3]);
  let pos=0, moov=null, ftyp=null;
  for(let n=0;pos+8<=END&&n<2000;n++){ // top-level boxes
    const h=await rd(pos,16); let size=u32(h,0); const t=typ(h,4); let hl=8;
    if(size===1){ size=u32(h,8)*4294967296+u32(h,12); hl=16; } else if(size===0) size=END-pos;
    if(size<hl) return null;
    if(t==='moof') return null; // fragmented MP4: not handled here
    if(t==='ftyp'&&size<4096) ftyp=await rd(pos,size);
    if(t==='moov'){ if(size>96*1048576) return null; moov=await rd(pos,size); }
    pos+=size;
  }
  if(!moov) return null;
  const kids=(b,s,e)=>{const o={};for(let i=s;i+8<=e;){let z=u32(b,i);const t=typ(b,i+4);if(z<8||i+z>e)break;(o[t]=o[t]||[]).push([i,z]);i+=z;}return o;};
  const one=(b,box,path)=>{let cur=box;for(const p of path){const k=kids(b,cur[0]+8,cur[0]+cur[1]);if(!k[p])return null;cur=k[p][0];}return cur;};
  let tr=null;
  for(const t of (kids(moov,8,moov.length).trak||[])){ const hd=one(moov,t,['mdia','hdlr']); if(hd&&typ(moov,hd[0]+16)==='soun'){tr=t;break;} }
  if(!tr) return null;
  const st=one(moov,tr,['mdia','minf','stbl']), mh=one(moov,tr,['mdia','mdhd']); if(!st||!mh) return null;
  const S=kids(moov,st[0]+8,st[0]+st[1]), box=k=>S[k]&&S[k][0];
  const stsd=box('stsd'), stts=box('stts'), stsc=box('stsc'), stsz=box('stsz'), stco=box('stco')||box('co64'), c64=!box('stco');
  if(!stsd||!stts||!stsc||!stsz||!stco) return null;
  const mv=moov[mh[0]+8], ts=mv===1?u32(moov,mh[0]+28):u32(moov,mh[0]+20); if(!ts) return null;
  // sample sizes
  const zb=stsz[0]+12, fix=u32(moov,zb), N=u32(moov,zb+4); if(!N) return null;
  const size=new Uint32Array(N); for(let i=0;i<N;i++) size[i]=fix||u32(moov,zb+8+i*4);
  // sample durations
  const dur=new Uint32Array(N); { let k=0; const n=u32(moov,stts[0]+12); for(let e=0;e<n&&k<N;e++){ const c=u32(moov,stts[0]+16+e*8), d=u32(moov,stts[0]+20+e*8); for(let j=0;j<c&&k<N;j++) dur[k++]=d; } if(k<N) return null; }
  // sample offsets (chunks + samples-per-chunk)
  const nc=u32(moov,stco[0]+12), co=new Float64Array(nc);
  for(let i=0;i<nc;i++) co[i]=c64?u32(moov,stco[0]+16+i*8)*4294967296+u32(moov,stco[0]+20+i*8):u32(moov,stco[0]+16+i*4);
  const off=new Float64Array(N); { const ne=u32(moov,stsc[0]+12); let k=0;
    for(let e=0;e<ne;e++){ const first=u32(moov,stsc[0]+16+e*12)-1, per=u32(moov,stsc[0]+20+e*12), last=e+1<ne?u32(moov,stsc[0]+28+e*12)-1:nc;
      for(let c=first;c<last&&k<N;c++){ let o=co[c]; for(let j=0;j<per&&k<N;j++){ off[k]=o; o+=size[k]; k++; } } }
    if(k<N) return null; }
  if(off[N-1]+size[N-1]>END) return null; // file cut short
  // little MP4 writer
  const B=(t,...parts)=>{let n=8;for(const p of parts)n+=p.length;const o=new Uint8Array(n);const v=new DataView(o.buffer);v.setUint32(0,n);for(let i=0;i<4;i++)o[4+i]=t.charCodeAt(i);let q=8;for(const p of parts){o.set(p,q);q+=p.length;}return o;};
  const W=a=>{const o=new Uint8Array(a.length*4),v=new DataView(o.buffer);a.forEach((x,i)=>v.setUint32(i*4,x>>>0));return o;};
  const M=[0x10000,0,0,0,0x10000,0,0,0,0x40000000];
  const sd=moov.slice(stsd[0],stsd[0]+stsd[1]);
  const fty=ftyp||B('ftyp',W([0x4D344120,0,0x4D344120,0x6D703432,0x69736F6D]));
  const piece=(a,b)=>{ // samples a..b-1
    let d=0; for(let i=a;i<b;i++) d+=dur[i];
    const tt=[]; for(let i=a;i<b;){ let j=i; while(j<b&&dur[j]===dur[i]) j++; tt.push(j-i,dur[i]); i=j; }
    const zs=new Uint32Array(b-a); let bytes=0; for(let i=a;i<b;i++){ zs[i-a]=size[i]; bytes+=size[i]; }
    const mk=co0=>B('moov',
      B('mvhd',W([0,0,0,ts,d,0x10000,0x01000000,0,0,...M,0,0,0,0,0,0,2])),
      B('trak',B('tkhd',W([3,0,0,1,0,d,0,0,0,0x01000000,...M,0,0])),
        B('mdia',B('mdhd',W([0,0,0,ts,d,0x55C40000])),B('hdlr',W([0,0,0x736F756E,0,0,0]),new Uint8Array([66,77,0])),
          B('minf',B('smhd',W([0,0])),B('dinf',B('dref',W([0,1]),B('url ',W([1])))),
            B('stbl',sd,B('stts',W([0,tt.length/2,...tt])),B('stsc',W([0,1,1,b-a,1])),B('stsz',W([0,0,b-a,...zs])),B('stco',W([0,1,co0])))))));
    const len=fty.length+mk(0).length+8, mo=mk(len);
    const parts=[fty,mo,W([bytes+8,0x6D646174])];
    for(let i=a;i<b;){ let j=i+1, e=off[i]+size[i]; while(j<b&&off[j]===e){ e+=size[j]; j++; } parts.push(file.slice(off[i],e)); i=j; }
    return {blob:new Blob(parts,{type:'audio/mp4'}),dur:d/ts};
  };
  const out=[]; let a=0, t=0;
  while(a<N){ let b=a, bytes=0; while(b<N&&(b===a||bytes+size[b]<=maxBytes)){ bytes+=size[b]; b++; } const p=piece(a,b); p.off=t; t+=p.dur; out.push(p); a=b; }
  return out;
}
// WAV: header + raw slices (no copying)
async function wavPieces(file,maxBytes){
  const h=new Uint8Array(await file.slice(0,Math.min(file.size,65536)).arrayBuffer()), dv=new DataView(h.buffer);
  if(String.fromCharCode(h[0],h[1],h[2],h[3])!=='RIFF') return null;
  let o=12, at=-1, align=4, rate=0;
  while(o+8<=h.length){ const id=String.fromCharCode(h[o],h[o+1],h[o+2],h[o+3]), sz=dv.getUint32(o+4,true);
    if(id==='fmt '){ align=dv.getUint16(o+20,true)||4; rate=dv.getUint32(o+16,true); }
    if(id==='data'){ at=o+8; break; } o+=8+sz+(sz&1); }
  if(at<0||!rate) return null;
  const hdr=h.slice(0,at), step=Math.max(align,Math.floor(maxBytes/align)*align), out=[];
  for(let p=at;p<file.size;p+=step){ const e=Math.min(file.size,p+step), n=e-p; const hd=hdr.slice(); const v=new DataView(hd.buffer);
    v.setUint32(4,hd.length+n-8,true); v.setUint32(hd.length-4,n,true);
    out.push({blob:new Blob([hd,file.slice(p,e)],{type:'audio/wav'}),off:(p-at)/rate,dur:n/rate}); }
  return out.length?out:null;
}

/* ---------- keys (shared with the /video/ site on this device) ---------- */
const LSg = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
const LSs = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
(() => { try { const q = new URLSearchParams(location.search), k = q.get('gq'), d = q.get('sdk'); if (k && k.length > 20) LSs('bb.groq', k); if (d && d.length > 10) LSs('bb.sdkey', d); if (k || d) history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} })();
const sdKey = () => LSg('bb.sdkey'), groqKey = () => LSg('bb.groq');
function takeKeys(t) { t = String(t || ''); let n = 0; const g = t.match(/gsk_\w{20,}/), d = t.match(/sd_\w{10,}/); if (g) { LSs('bb.groq', g[0]); n++; } if (d) { LSs('bb.sdkey', d[0]); n++; } return n; }

async function tfetch(u, ms = 15000, headers) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { const r = await fetch(u, { signal: c.signal, headers: headers || {} }); if (!r.ok) throw new Error(r.status); return r; } finally { clearTimeout(t); } }
const clean = s => String(s || '').replace(/\[[^\]]*\]|\([^)]*(music|applause|laugh)[^)]*\)/gi, '').replace(/[♪♫]/g, '').replace(/\s+/g, ' ').trim();
function tidy(rows) { // rows [[s,e,text]] -> lines {s,e,t}, merges tiny fragments into readable lines
  const out = [];
  for (const [s, e, t0] of rows) {
    const t = clean(t0); if (!t || !/[a-z]/i.test(t)) continue;
    const p = out[out.length - 1];
    if (p && p.t === t) { p.e = e; continue; }
    if (p && s - p.e < 0.6 && p.t.split(' ').length + t.split(' ').length <= 9 && !/[.!?]$/.test(p.t)) { p.t += ' ' + t; p.e = e; continue; }
    out.push({ s, e: Math.max(e, s + 0.5), t });
  }
  out.forEach((l, k) => { const n = out[k + 1]; if (n && n.s < l.e) l.e = Math.max(l.s + 0.3, n.s); });
  return out;
}

/* ---------- YouTube ---------- */
async function fromSupadata(id, onWait) {
  const key = sdKey(); if (!key) return null;
  const H = { 'x-api-key': key }, base = 'https://api.supadata.ai/v1/transcript';
  const get = async mode => {
    let d = await (await tfetch(base + '?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id) + '&lang=en&mode=' + mode, 30000, H)).json();
    if (d && d.jobId) {
      for (let k = 0; k < 90; k++) { onWait && onWait(k); await sleep(3000); d = await (await tfetch(base + '/' + d.jobId, 20000, H)).json(); if (d.status === 'completed') break; if (d.status === 'failed') throw new Error('job failed'); }
      if (d.result) d = d.result;
    }
    return d;
  };
  const rows = x => (x && Array.isArray(x.content) ? x.content : []).map(c => [c.offset / 1000, (c.offset + (c.duration || 3000)) / 1000, c.text]);
  let lines = tidy(rows(await get('native').catch(() => null)));
  if (!lines.length) lines = tidy(rows(await get('auto')));
  return lines.length ? lines : null;
}
function vtt(txt) { // WebVTT -> rows
  const rows = []; const re = /(\d+:)?(\d+):(\d+)[.,](\d+)\s*-->\s*(\d+:)?(\d+):(\d+)[.,](\d+)[^\n]*\n([\s\S]*?)(?=\n\n|$)/g; let m;
  const ts = (h, mi, s, ms) => (parseInt(h || '0') * 3600) + (+mi) * 60 + (+s) + (+ms) / 1000;
  while ((m = re.exec(txt))) rows.push([ts(m[1], m[2], m[3], m[4]), ts(m[5], m[6], m[7], m[8]), m[9].replace(/<[^>]+>/g, '').replace(/\n/g, ' ')]);
  return rows;
}
const INV = ['https://inv.nadeko.net', 'https://invidious.nerdvpn.de', 'https://yewtu.be', 'https://invidious.f5.si'];
const PIPED = ['https://pipedapi.kavin.rocks', 'https://api.piped.private.coffee'];
async function fromMirrors(id) {
  const pick = a => a.find(t => /^en/i.test(t.c) && !t.a) || a.find(t => /^en/i.test(t.c));
  const tries = [...INV.map(h => async () => { const j = await (await tfetch(h + '/api/v1/captions/' + id, 9000)).json(); const t = pick((j.captions || []).map(x => ({ c: x.languageCode || '', a: /auto/i.test(x.label || ''), u: x.url }))); if (!t) throw 0; const L = tidy(vtt(await (await tfetch(new URL(t.u, h).href, 9000)).text())); if (!L.length) throw 0; return L; }),
    ...PIPED.map(h => async () => { const j = await (await tfetch(h + '/streams/' + id, 9000)).json(); const t = pick((j.subtitles || []).map(x => ({ c: x.code || '', a: x.autoGenerated, u: x.url }))); if (!t) throw 0; const L = tidy(vtt(await (await tfetch(t.u, 9000)).text())); if (!L.length) throw 0; return L; })];
  return await Promise.any(tries.map(f => f()));
}
async function ytSubs(id, onWait) {
  const ck = 'xm.sub.' + id;
  try { const c = JSON.parse(LSg(ck) || 'null'); if (c && c.length) return c; } catch (e) {}
  let lines = null, err = '';
  lines = await fromSupadata(id, onWait).catch(e => { err = String(e && e.message || e); return null; });
  if (!lines || !lines.length) lines = await fromMirrors(id).catch(() => null);
  if (lines && lines.length) { LSs(ck, JSON.stringify(lines)); return lines; }
  const e = new Error(err || 'none'); e.code = sdKey() ? (/^40[13]/.test(err) ? 'badkey' : 'none') : 'nokey'; throw e;
}

/* ---------- own files: Groq Whisper ---------- */
async function groqSend(blob, name, off) {
  let r;
  for (let tries = 0; tries < 4; tries++) {
    const fd = new FormData(); fd.append('file', blob, name); fd.append('model', 'whisper-large-v3-turbo'); fd.append('language', 'en'); fd.append('response_format', 'verbose_json'); fd.append('temperature', '0');
    try { r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + groqKey() }, body: fd }); } catch (e) { r = null; }
    if (r && r.status !== 429 && r.status < 500) break;
    await sleep(4000 * (tries + 1));
  }
  if (!r || !r.ok) { const e = new Error('groq ' + (r ? r.status : 'net')); e.code = r ? String(r.status) : 'net'; throw e; }
  const d = await r.json();
  return (d.segments || []).map(x => [off + x.start, off + x.end, x.text]);
}
async function fileSubs(file, onProg) {
  if (!groqKey()) { const e = new Error('nokey'); e.code = 'nogroq'; throw e; }
  const kind = await fileKind(file), MAX = 10 * 1024 * 1024; let pcs = null;
  try { pcs = kind === 'mp3' ? await mp3Pieces(file, MAX) : (kind === 'm4a' || kind === 'mp4') ? await mp4Pieces(file, MAX) : kind === 'wav' ? await wavPieces(file, MAX) : null; } catch (e) { console.warn('pieces', e); pcs = null; }
  const rows = [];
  if (pcs && pcs.length) {
    const ext = kind === 'mp3' ? 'mp3' : kind === 'wav' ? 'wav' : 'm4a'; let done = 0; onProg && onProg(0);
    for (let k = 0; k < pcs.length; k += 2) {
      const g = await Promise.all(pcs.slice(k, k + 2).map((p, j) => groqSend(p.blob, 'part' + (k + j) + '.' + ext, p.off).then(x => { done++; onProg && onProg(done / pcs.length); return x; })));
      g.forEach(x => rows.push(...x));
    }
  } else if (file.size <= 24.5 * 1048576) {
    onProg && onProg(0.15); rows.push(...await groqSend(file, 'audio.' + (kind || 'mp4'), 0)); onProg && onProg(1);
  } else { const e = new Error('toobig'); e.code = 'toobig'; throw e; }
  return tidy(rows);
}

/* ---------- Vietnamese meaning ---------- */
async function translate(lines, onEach) {
  const todo = lines.filter(l => !l.vi); let i = 0;
  while (i < todo.length) {
    const ch = []; let len = 0;
    while (i < todo.length && len + todo[i].t.length < 1400 && ch.length < 40) { ch.push(todo[i]); len += todo[i].t.length + 1; i++; }
    try {
      const r = await tfetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(ch.map(l => l.t).join('\n')), 12000);
      const d = await r.json(); const out = (d[0] || []).map(x => x[0]).join('').split('\n');
      if (out.length === ch.length) ch.forEach((l, k) => { l.vi = out[k].trim(); onEach && onEach(l); });
      else for (const l of ch) { const d2 = await (await tfetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(l.t), 9000)).json(); l.vi = (d2[0] || []).map(x => x[0]).join('').trim(); onEach && onEach(l); }
    } catch (e) { console.warn('translate', e); return; }
  }
}

window.XMSubs = { ytSubs, fileSubs, translate, takeKeys, sdKey, groqKey, isAudio };
})();
