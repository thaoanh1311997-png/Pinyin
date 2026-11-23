const {webkit:chromium,devices}=require('playwright');
const fs=require('fs');
{const n=8000*40,buf=Buffer.alloc(44+n*2);buf.write('RIFF',0);buf.writeUInt32LE(36+n*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(8000,24);buf.writeUInt32LE(16000,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)buf.writeInt16LE(Math.round(3000*Math.sin(i*0.3)),44+i*2);fs.writeFileSync('t40.wav',buf);}
(async()=>{

 const b=await chromium.launch();
 for(const dev of [null,'iPhone 13']){
  const ctx=await b.newContext(dev?devices[dev]:{viewport:{width:1280,height:800}});
  const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/supabase|groq|supadata|translate|mymemory|ytimg|youtube/,r=>r.abort());
  await pg.goto('http://localhost:8765/Pinyin/video/_t.html'); await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>__E(`(async()=>{
    const blob=await (await fetch('/Pinyin/t40.wav')).blob();
    const les={id:'tst',title:'Test',src:{type:'file',name:'t.wav',audio:true},lines:[
      {s:12,e:20,zh:'第三句话我们去学校'},{s:2,e:9,zh:'第一句话你好'},{s:7,e:14,zh:'第二句话谢谢你'},{s:20,e:26,zh:'第四句话再见'},{s:20.2,e:26,zh:'第四句话再见'},{s:26,e:38,zh:'最后一句话我很高兴'}]};
    MDB.put('tst',{blob,name:'t.wav',audio:true}); await new Promise(r=>setTimeout(r,300));
    await openLesson(les);
    const order=LES.lines.map(l=>l.zh[0]+l.zh[1]+l.zh[2]+'@'+l.s+'-'+l.e).join(' | ');
    S.rate=2; S.shadow=false; S.loop=false;
    runFrom(0); const seq=[]; let bad=0;
    for(let k=0;k<200;k++){ await new Promise(r=>setTimeout(r,100)); const t=P.time(); const j=lineAt(t);
      if(seq[seq.length-1]!==CUR) seq.push(CUR); if(PLAYING&&!PLAYING.dead&&j>=0&&j!==CUR&&Math.abs(t-LES.lines[j].s)>0.4) bad++; if(PLAYING.dead) break; }
    const done=PLAYING.dead, endT=P.time();
    // shadow mode: pauses after each line
    S.shadow=true; runFrom(0); const sh=[]; for(let k=0;k<70;k++){await new Promise(r=>setTimeout(r,100)); sh.push((P.playing()?'P':'.')+CUR);} stopRun();
    // loop mode
    S.shadow=false;S.loop=true; runFrom(1); const lp=new Set(); for(let k=0;k<70;k++){await new Promise(r=>setTimeout(r,100)); lp.add(CUR);} stopRun(); S.loop=false;
    // native controls: play from 13s, follow interval
    const v=document.getElementById('vid'); v.currentTime=13; v.play(); await new Promise(r=>setTimeout(r,800)); const nat=CUR; v.pause();
    return {order,seq,bad,done,endT,sh:sh.join(' '),lp:[...lp],nat};
  })()`));
  console.log(dev||'desktop',JSON.stringify(r),errs);
  await pg.screenshot({path:'wk-'+(dev?'m':'d')+'.png'});
  await ctx.close();
 }
 await b.close();

})().then(()=>(async()=>{

 const b=await chromium.launch();
 for(const dev of [null,'iPhone 13']){
  const ctx=await b.newContext(dev?devices[dev]:{viewport:{width:1280,height:800}});
  await ctx.addInitScript(()=>{ if(sessionStorage.getItem('init')) return; sessionStorage.setItem('init',1);
    localStorage.setItem('bm.sync.auth',JSON.stringify({at:'x',rt:'y',exp:Date.now()+1e9,uid:'u',name:'tester'}));
    localStorage.setItem('bb.lessons',JSON.stringify([{id:'A',title:'Bai A may nay',src:{type:'tts'},lines:[{s:null,e:null,zh:'你好',vi:''}],at:2000},{id:'B',title:'Bai B',src:{type:'tts'},lines:[{s:null,e:null,zh:'谢谢',vi:''}],at:1500}]));
    localStorage.setItem('bm.sync.t',JSON.stringify({'bb.lessons':2000}));
    localStorage.setItem('bm.sync.dkv',JSON.stringify({'bb.lessons':1}));
    window.__loads=0;});
  let serve=false, loads=0, pushed=[];
  await ctx.route(/ytimg|youtube|translate|mymemory|groq|supadata/,r=>r.abort());
  await ctx.route(/supabase\.co/,async r=>{const u=r.request().url();
    if(r.request().method()==='GET'&&/\/rest\/v1\/kv/.test(u)){ const rows=serve?[{k:'bb.lessons',v:JSON.stringify([{id:'A',title:'Bai A ban cu',src:{type:'tts'},lines:[{s:null,e:null,zh:'你好',vi:''}],at:1000},{id:'C',title:'Bai C may khac',src:{type:'tts'},lines:[{s:null,e:null,zh:'再见',vi:''}],at:3000}]),t:Date.now()+5000,del:false,updated_at:new Date().toISOString()}]:[]; serve=false; return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});}
    if(r.request().method()==='GET') return r.fulfill({status:200,contentType:'application/json',body:'[]'});
    pushed.push(u); return r.fulfill({status:201,body:''});});
  const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  pg.on('load',()=>loads++);
  await pg.goto('http://localhost:8765/Pinyin/video/_t.html'); await pg.waitForTimeout(1500);
  // 1) listening to audio in a lesson when an update arrives, inside the 20s boot window
  await pg.evaluate(()=>__E(`(async()=>{const blob=await (await fetch('/Pinyin/t40.wav')).blob(); await MDB.put('tst',{blob,name:'t.wav',audio:true});
    await openLesson({id:'tst',title:'Test',src:{type:'file',name:'t.wav',audio:true},lines:[{s:1,e:5,zh:'第一句话'},{s:5,e:30,zh:'第二句话'}]}); S.rate=1; runFrom(0);})()`));
  await pg.waitForTimeout(1200); serve=true;
  await pg.evaluate(()=>BM_SYNC.run()); await pg.waitForTimeout(2500);
  const r1=await pg.evaluate(()=>({still:!document.getElementById('vLesson').hidden,playing:!document.getElementById('vid').paused,
     toast:(document.getElementById('bm-stoast')||{}).innerText||'',btn:!!document.querySelector('#bm-stoast button'),
     lessons:JSON.parse(localStorage.getItem('bb.lessons')).map(x=>x.id+':'+x.title)}));
  console.log(dev||'desktop','during-audio',JSON.stringify(r1),'loads',loads);
  // 2) home screen, user already tapped: list refreshes in place, no reload
  await pg.evaluate(()=>__E(`newRun(); show('Home'); renderLib();`));
  await pg.mouse.click(5,300);
  serve=true; await pg.evaluate(()=>BM_SYNC.run()); await pg.waitForTimeout(2000);
  const r2=await pg.evaluate(()=>({lib:[...document.querySelectorAll('#lib .lib-item b')].map(x=>x.textContent),btn:!!document.querySelector('#bm-stoast button')}));
  console.log(dev||'desktop','home',JSON.stringify(r2),'loads',loads,errs);
  await ctx.close();
 }
 await b.close();

})()).catch(e=>{console.error(e);process.exit(1);});
