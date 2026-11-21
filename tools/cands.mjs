import fs from 'node:fs';
const UA={'user-agent':'XiuMaiKidsFlashcards/1.1 (educational; https://github.com/thaoanh1311997-png/Pinyin)'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const strip=s=>(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
async function get(u){for(let i=0;i<6;i++){const r=await fetch(u,{headers:UA});if(r.ok)return r;await sleep(3000*2**i);}throw new Error(u);}
fs.mkdirSync('out/c',{recursive:true});const out={};
for(const ln of fs.readFileSync('tools/q.txt','utf8').trim().split('\n')){
  const [w,q]=ln.split('|');const slug=w.replace(/[^a-z0-9]+/gi,'-');
  try{
  const j=await (await get(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q+' filetype:bitmap')}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=300&format=json&formatversion=2`)).json();
  const ps=(j.query?.pages||[]).sort((a,b)=>a.index-b.index);const L=[];
  for(const p of ps){const ii=p.imageinfo?.[0];if(!ii)continue;const lic=strip(ii.extmetadata?.LicenseShortName?.value);if(/fair use|non-free/i.test(lic))continue;if(ii.width<500)continue;
    const n=L.length;try{const b=await get(ii.thumburl);fs.writeFileSync(`out/c/${slug}-${n}.jpg`,Buffer.from(await b.arrayBuffer()));L.push([p.title,lic]);}catch(e){}
    if(L.length>=10)break;await sleep(300);}
  out[w]=L;console.log(w,L.length);}catch(e){console.log('ERR',w,e.message)}
  await sleep(800);
}
fs.writeFileSync('out/cands.json',JSON.stringify(out,null,1));
