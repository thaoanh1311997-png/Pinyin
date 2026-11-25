const { chromium, webkit, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const S = process.env.T_DIR || process.cwd();
const URL0 = 'http://localhost:8765/Pinyin/video/';
const SB = 'https://jkycaykxxiqzwvcvzcme.supabase.co';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const LES = { id: 'v1', title: '01 第一课', src: { type: 'file', name: '01 第一课.mp3', audio: true }, lines: [{ s: 0, e: 3, zh: '你好，我是学生。', vi: 'Xin chào, tôi là học sinh.' }, { s: 3, e: 6, zh: '我们一起学习汉语。', vi: 'Chúng ta cùng học tiếng Trung.' }], at: Date.now() };

function mock() {
  const st = { recs: {}, files: {}, recPosts: [], filePosts: [] };
  return {
    st, async handle(route) {
      const req = route.request(), u = new URL(req.url()), p = u.pathname, m = req.method();
      const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) });
      if (p === '/rest/v1/kv') return json(m === 'GET' ? [] : null);
      if (p === '/rest/v1/rec') {
        if (m === 'POST') { const rows = JSON.parse(req.postData()); rows.forEach(r => { st.recs[r.id] = { ...r, updated_at: new Date().toISOString() }; st.recPosts.push(r); }); return json(null); }
        const idq = u.searchParams.get('id');
        if (idq) { const id = idq.replace(/^eq\./, ''); return json(st.recs[id] ? [st.recs[id]] : []); }
        if ((+u.searchParams.get('offset') || 0) > 0) return json([]);
        return json(Object.values(st.recs).filter(r => r.pullable));
      }
      if (p.startsWith('/storage/v1/object/authenticated/files/')) { const k = p.slice('/storage/v1/object/authenticated/files/'.length); const b = st.files[k]; return b ? route.fulfill({ status: 200, body: b }) : route.fulfill({ status: 404, body: '' }); }
      if (p.startsWith('/storage/v1/object/files/')) { const k = p.slice('/storage/v1/object/files/'.length); const b = req.postDataBuffer() || Buffer.alloc(+(req.headers()['content-length'] || 0)); if (b.length > 50 * 1024 * 1024) return route.fulfill({ status: 413, body: 'too big' }); st.files[k] = b; st.filePosts.push([k, b.length]); return json({}); }
      return route.fulfill({ status: 404, body: '' });
    }
  };
}
async function ctxFor(browserType, mobile, signed, mk) {
  const b = await browserType.launch();
  const ctx = await b.newContext(mobile ? { ...devices[browserType === webkit ? 'iPhone 13' : 'Pixel 7'] } : { viewport: { width: 1400, height: 900 } });
  await ctx.route(SB + '/**', r => mk.handle(r));
  await ctx.addInitScript(([les, signed]) => {
    if (!localStorage.getItem('t.init')) {
      localStorage.setItem('t.init', '1');
      localStorage.setItem('bb.lessons', JSON.stringify([les]));
      if (signed) localStorage.setItem('bm.sync.auth', JSON.stringify({ at: 'x', rt: 'y', exp: Date.now() + 864e5, uid: 'u1', name: 't' }));
    }
    window.__spoke = 0;
    try { const o = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = (u) => { if (u && u.text && u.text.trim()) window.__spoke++; return o(u); }; } catch (e) {}
    const iv = setInterval(() => { if (window.BMVoice && !BMVoice.__w) { const o = BMVoice.speak; BMVoice.speak = (...a) => { if (a[0] && String(a[0]).trim()) window.__spoke++; return o.apply(BMVoice, a); }; BMVoice.__w = 1; clearInterval(iv); } }, 5);
  }, [LES, signed]);
  return { b, ctx };
}
async function openLes(pg) {
  await pg.goto(URL0); await pg.waitForSelector('#lib .open', { state: 'attached', timeout: 15000 }); await pg.waitForTimeout(300);
  if (!(await pg.isVisible('#vLesson'))) await pg.click('#lib .open[data-id="v1"]'); // a lesson left open reopens by itself
  await pg.waitForSelector('#mediaBox .media', { timeout: 15000 });
  await pg.waitForTimeout(1200);
}
(async () => {
  for (const [bt, name] of (process.env.BT==='webkit'?[[webkit,'webkit']]:[[chromium,'chromium']])) for (const mobile of [false, true]) {
    const tag = `[${name}${mobile ? ' phone' : ' desktop'}]`;
    // 1) not signed in, file missing: banner, no machine voice
    { const mk = mock(); const { b, ctx } = await ctxFor(bt, mobile, false, mk); const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e)));
      await openLes(pg);
      ok(await pg.isVisible('#needFile'), tag + ' banner shown when file missing');
      await pg.click('.line[data-i="1"]'); await pg.waitForTimeout(800);
      ok(await pg.evaluate(() => window.__spoke) === 0, tag + ' tapping a line does NOT use machine voice');
      ok(/Chọn file/.test(await pg.textContent('#toast')), tag + ' toast points to Chọn file');
      await pg.click('#pPlay'); await pg.waitForTimeout(600);
      ok(await pg.evaluate(() => window.__spoke) === 0, tag + ' Phát does NOT use machine voice');
      await pg.setInputFiles('#reMedia', { name: '01 第一课.mp3', mimeType: 'audio/mpeg', buffer: fs.readFileSync(path.join(S, 'small.mp3')) });
      await pg.waitForSelector('#vid', { timeout: 5000 });
      ok(true, tag + ' re-picked file mounts the player');
      await pg.waitForTimeout(800);
      // reopen after reload: auto from IndexedDB
      await openLes(pg);
      ok(await pg.isVisible('#vid') && !(await pg.isVisible('#needFile')), tag + ' after reload, original file opens by itself ' + (await pg.isVisible('#vid') ? '' : await pg.textContent('#mediaBox')));
      await pg.click('.line[data-i="1"]'); await pg.waitForTimeout(1500);
      const t = await pg.evaluate(() => document.querySelector('#vid').currentTime);
      ok(t >= 3 && await pg.evaluate(() => window.__spoke) === 0, tag + ' line 2 plays from the recording at ' + t.toFixed(2) + 's, no TTS');
      ok(!errs.length, tag + ' no page errors ' + errs.join('|'));
      await b.close(); }
    // 2) signed in: file exists only in cloud, as 2 parts → fetched on open
    if (!mobile) { const mk = mock();
      const buf = fs.readFileSync(path.join(S, 'small.mp3')); const half = Math.ceil(buf.length / 2);
      mk.st.files['u1/a.bin'] = buf.subarray(0, half); mk.st.files['u1/a2.bin'] = buf.subarray(half);
      mk.st.recs['bb-media|f|"v1"'] = { id: 'bb-media|f|"v1"', db: 'bb-media', st: 'f', t: 5, del: false, data: { blob: { __b: 'u1/a.bin', parts: ['u1/a.bin', 'u1/a2.bin'], type: 'audio/mpeg', size: buf.length }, name: '01 第一课.mp3', audio: true } };
      const { b, ctx } = await ctxFor(bt, mobile, true, mk); const pg = await ctx.newPage();
      await openLes(pg); await pg.waitForSelector('#vid', { timeout: 8000 }).catch(() => {});
      ok(await pg.isVisible('#vid'), tag + ' signed in: original file fetched from cloud (2 parts) on open');
      const dur = await pg.evaluate(() => new Promise(r => { const v = document.querySelector('#vid'); if (v.duration) r(v.duration); v.onloadedmetadata = () => r(v.duration); setTimeout(() => r(v.duration), 4000); }));
      ok(Math.abs(dur - 20) < 1, tag + ' re-joined file plays full length ' + dur);
      // 3) remote delete of a still-listed lesson's file must be ignored
      mk.st.recs['bb-media|f|"v1"'] = { id: 'bb-media|f|"v1"', db: 'bb-media', st: 'f', t: Date.now() + 1e6, del: true, data: null, pullable: true, updated_at: new Date().toISOString() };
      await pg.evaluate(() => BM_SYNC.run()); await pg.waitForTimeout(1500);
      const still = await pg.evaluate(() => new Promise(r => { const q = indexedDB.open('bb-media'); q.onsuccess = () => { const g = q.result.transaction('f').objectStore('f').get('v1'); g.onsuccess = () => r(!!(g.result && (g.result.blob || g.result.buf))); }; }));
      ok(still, tag + ' remote delete does not wipe the file of a lesson still in the list');
      // 4) big file (60MB) is uploaded in parts, not skipped
      await pg.evaluate(async (n) => { const b = new Uint8Array(n).buffer; await new Promise(r => { const q = indexedDB.open('bb-media'); q.onsuccess = () => { const t = q.result.transaction('f', 'readwrite'); t.objectStore('f').put({ blob: null, buf: b, type: 'audio/mpeg', name: 'big.mp3', audio: true }, 'v2'); t.oncomplete = r; }; }); }, 60 * 1024 * 1024);
      await pg.waitForTimeout(300); await pg.evaluate(() => BM_SYNC.run()); await pg.waitForTimeout(6000);
      const r2 = mk.st.recPosts.find(r => r.id === 'bb-media|f|"v2"');
      ok(r2 && r2.data && r2.data.buf.parts && r2.data.buf.parts.length === 2 && mk.st.filePosts.every(f => f[1] <= 50 * 1024 * 1024), tag + ' 60MB file uploaded as ' + (r2 && r2.data && r2.data.buf.parts ? r2.data.buf.parts.length : 0) + ' parts');
      // 5) a put that never landed must not be pushed as a delete
      await pg.evaluate(() => { const d = JSON.parse(localStorage.getItem('bm.sync.drec') || '{}'); d['bb-media|f|"ghost"'] = 1; localStorage.setItem('bm.sync.drec', JSON.stringify(d)); });
      await b.close(); }
  }
  // 5b) pushRecs with a missing value marked as put → no delete pushed (fresh page reads drec)
  { const mk = mock(); const { b, ctx } = await ctxFor(chromium, false, true, mk); const pg = await ctx.newPage();
    // marks written before any page code runs (writing them into a live page races with its own sync state)
    await ctx.addInitScript(() => { if (!sessionStorage.getItem('drec')) { sessionStorage.setItem('drec', 1); localStorage.setItem('bm.sync.drec', JSON.stringify({ 'bb-media|f|"ghost"': 1, 'bb-media|f|"gone"': 'd' })); } });
    await pg.goto(URL0); for (let k = 0; k < 40 && !mk.st.recPosts.some(r => r.id.includes('gone')); k++) await pg.waitForTimeout(250);
    ok(!mk.st.recPosts.some(r => r.id.includes('ghost')), 'failed write is NOT sent as a delete');
    ok(mk.st.recPosts.some(r => r.id.includes('gone') && r.del), 'real delete is still sent ' + JSON.stringify(mk.st.recPosts.map(r => r.id)) + ' ' + JSON.stringify(await pg.evaluate(() => [window.BM_SYNC && BM_SYNC.state(), localStorage.getItem('bm.sync.drec')])));
    await b.close(); }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
