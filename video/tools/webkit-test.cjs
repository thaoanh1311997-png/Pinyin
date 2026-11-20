// Manual check in real WebKit (Safari's engine): add a long audio file, wait for subtitles, then watch for
// crashes, reloads or a jump back to the home page. Groq is mocked; everything else is the live code.
const { webkit, devices } = require('playwright');
const cp = require('child_process');
const rss = () => { try { return +cp.execSync("ps -eo rss,comm,args | grep -i 'WebProcess\\|WebContent' | grep -v grep | awk '{s+=$1} END {print s+0}'").toString().trim() / 1024 | 0; } catch (e) { return 0; } };
(async () => {
  const b = await webkit.launch();
  for (const [dn, dev] of [['iPhone', devices['iPhone 13']], ['iPad', devices['iPad Pro 11']]]) {
    for (const [file, key] of [['t.m4a', 1], ['t.mp3', 1], ['t.mp3', 0]]) {
      const ctx = await b.newContext(dev); const p = await ctx.newPage(); const log = [];
      p.on('pageerror', e => log.push('ERR ' + e.message));
      p.on('crash', () => log.push('CRASH'));
      p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(m.type() + ' ' + m.text().slice(0, 120)); });
      let loads = 0; p.on('load', () => loads++);
      await p.route(/api\.groq\.com/, r => { const segs = []; for (let t = 0; t < 600; t += 3) segs.push({ start: t + 0.5, end: t + 2.5, text: '今天我们学习第' + t + '句话，大家好好听。' }); r.fulfill({ body: JSON.stringify({ segments: segs }), contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } }); });
      await p.goto('http://localhost:8765/Pinyin/video/' + (key ? '?gq=gsk_test_aaaaaaaaaaaaaaaaaaaaaaaa' : ''));
      await p.waitForTimeout(2500);
      const base = rss(); let peak = base; const iv = setInterval(() => { const r = rss(); if (r > peak) peak = r; }, 200);
      await p.click('[data-go=video]'); await p.waitForTimeout(400);
      await p.setInputFiles('#mediaFile', file); await p.click('#startVideo');
      const t0 = Date.now(); let st = '';
      for (let k = 0; k < 120; k++) {
        await p.waitForTimeout(1000);
        try { st = await p.evaluate(() => [...document.querySelectorAll('main > section')].filter(s => !s.hidden).map(s => s.id).join(',') + ' lines=' + document.querySelectorAll('.line').length + ' ' + (document.querySelector('#genM') || {}).textContent); } catch (e) { st = 'eval failed ' + e.message.slice(0, 80); }
        if (/lines=[1-9]/.test(st) && Date.now() - t0 > 15000) break;
        if (/vHome/.test(st) && Date.now() - t0 > 3000) break;
      }
      clearInterval(iv);
      console.log(dn, file, key ? 'groq' : 'local', ((Date.now() - t0) / 1000).toFixed(0) + 's', 'loads', loads, 'state', st.slice(0, 120), 'webproc +' + (peak - base) + 'MB (peak ' + peak + ')');
      log.slice(0, 12).forEach(l => console.log('   ', l));
      await ctx.close();
    }
  }
  await b.close();
})();
