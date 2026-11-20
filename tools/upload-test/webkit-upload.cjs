// Kiểm tra trong WebKit thật (lõi Safari, giả iPhone/iPad): mọi chỗ "chọn file" của Bánh Mì.
// Groq được giả lập (kiểm tra từng mẩu âm thanh bằng ffmpeg). Chạy bởi .github/workflows/upload-webkit-test.yml
const { webkit, chromium, devices } = require('playwright');
const H = process.env.HARNESS ? require(process.env.HARNESS) : null;
const fs = require('fs'), cp = require('child_process'), os = require('os'), path = require('path');
const FF = process.env.FFMPEG || 'ffmpeg', M = process.env.MEDIA || '.', T = __dirname, BASE = 'http://localhost:8765/Pinyin/';
const rss = () => { try { return +cp.execSync("ps -eo rss,args | grep -i 'WebContent\\|WebProcess\\|WebKitWebProcess' | grep -v grep | awk '{s+=$1} END {print s+0}'").toString().trim() / 1024 | 0; } catch (e) { return 0; } };
const OUT = []; const say = (...a) => { const s = a.join(' '); console.log(s); OUT.push(s); };
let PIECES = [];
async function ctxFor(b, dev) {
  const ctx = await b.newContext(devices[dev]); if (H) await H.setup(ctx);
  // Groq giả: lấy mẩu âm thanh ngay trong trang (WebKit không cho Playwright đọc thân request có Blob), kiểm tra bằng ffmpeg
  await ctx.exposeFunction('__piece', (name, b64) => {
    const tmp = path.join(os.tmpdir(), 'p_' + Date.now() + '_' + name); const buf = Buffer.from(b64, 'base64'); fs.writeFileSync(tmp, buf);
    const e = cp.spawnSync(FF, ['-hide_banner', '-i', tmp, '-f', 'null', '-']); const err = e.stderr.toString(); fs.unlinkSync(tmp);
    const m = err.match(/Duration: (\d+):(\d+):([\d.]+)/), dur = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
    const bad = /Invalid data|corrupt|Error while decoding/i.test(err);
    PIECES.push(name + ' ' + (buf.length / 1048576).toFixed(1) + 'MB ' + dur.toFixed(0) + 's' + (bad || !dur ? ' BAD' : '')); return bad ? 0 : dur;
  });
  await ctx.addInitScript(() => {
    const of = window.fetch;
    window.fetch = async (u, o) => {
      if (!/api\.groq\.com\/openai\/v1\/audio/.test(String(u))) return of(u, o);
      const f = o.body.get('file'); const ab = new Uint8Array(await f.arrayBuffer()); let s = ''; for (let i = 0; i < ab.length; i += 32768) s += String.fromCharCode.apply(null, ab.subarray(i, i + 32768));
      const dur = await window.__piece(f.name, btoa(s));
      if (!dur) return new Response('{}', { status: 400 });
      const segs = []; for (let t = 0; t < dur; t += 6) segs.push({ start: t, end: t + 5, text: '我们今天学习第' + Math.round(t) + '秒的句子。' });
      return new Response(JSON.stringify({ segments: segs }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
  });
  const p = await ctx.newPage(); const log = []; p._log = log; p._loads = 0;
  p.on('pageerror', e => log.push('ERR ' + e.message.slice(0, 120))); p.on('crash', () => log.push('CRASH'));
  p.on('load', () => p._loads++);
  return { ctx, p };
}
const waitFor = async (p, fn, sec) => { for (let i = 0; i < sec; i++) { await p.waitForTimeout(1000); try { const v = await p.evaluate(fn); if (v) return v; } catch (e) { return 'eval-fail ' + e.message.slice(0, 60); } } return 'TIMEOUT'; };
(async () => {
  const b = await (H ? chromium : webkit).launch();
  for (const dev of ['iPhone 13', 'iPad Pro 11']) {
    // 1) Học video: file nghe / video lớn
    for (const f of ['t60.m4a', 'iphone.mov', 't.mp3']) {
      const { ctx, p } = await ctxFor(b, dev); PIECES = [];
      await p.goto(BASE + 'video/?gq=gsk_test_aaaaaaaaaaaaaaaaaaaaaaaa'); await p.waitForTimeout(2000);
      const base = rss(); let peak = base; const iv = setInterval(() => { const r = rss(); if (r > peak) peak = r; }, 300);
      await p.evaluate(() => document.querySelector('[data-go=video]').click()); await p.waitForTimeout(400);
      await p.setInputFiles('#mediaFile', path.join(M, f)); await p.evaluate(() => document.querySelector('#startVideo').click());
      const r = await waitFor(p, () => { const n = document.querySelectorAll('.line').length; const t = (document.querySelector('#panel') || {}).innerText || ''; return n > 3 ? 'lines=' + n : /Thêm phụ đề/.test(t) ? 'NOSUBS ' + t.replace(/\s+/g, ' ').slice(0, 220) : location.pathname.endsWith('/video/') && !document.querySelector('#vLesson:not([hidden])') && false; }, 150);
      clearInterval(iv);
      say(`[${dev}] video ${f}: ${r} | pieces ${PIECES.join(', ')} | loads=${p._loads} | RAM +${peak - base}MB ${p._log.join(' ')}`);
      await ctx.close();
    }
    // 2) Học video: tab File (PDF scan 30 trang, ảnh)
    for (const f of ['scan-30.pdf', 'trang.jpg']) {
      const { ctx, p } = await ctxFor(b, dev);
      await p.goto(BASE + 'video/'); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelector('[data-go=file]').click());
      const base = rss(); let peak = base; const iv = setInterval(() => { const r = rss(); if (r > peak) peak = r; }, 300);
      await p.setInputFiles('#docFile', path.join(T, f));
      let r = await waitFor(p, () => document.querySelector('#fStop').hidden && document.querySelector('#fMsg').textContent, 400);
      const more = await p.$('#fMore'); let r2 = '';
      if (more) { await more.click(); r2 = await waitFor(p, () => document.querySelector('#fStop').hidden && !document.querySelector('#fMore') && document.querySelector('#fMsg').textContent, 400); }
      clearInterval(iv);
      say(`[${dev}] video-file ${f}: ${r} ${more ? '→ đọc tiếp: ' + r2 : ''} | bài: ${await p.evaluate(() => document.querySelectorAll('#secList .sec').length)} | loads=${p._loads} RAM +${peak - base}MB ${p._log.join(' ')}`);
      await ctx.close();
    }
    // 3) Đọc PDF có Pinyin
    for (const f of ['scan-30.pdf', 'trang.jpg']) {
      const { ctx, p } = await ctxFor(b, dev);
      await p.goto(BASE + 'pdf/'); await p.waitForTimeout(1500);
      const base = rss(); let peak = base; const iv = setInterval(() => { const r = rss(); if (r > peak) peak = r; }, 300);
      await p.setInputFiles('#file', path.join(T, f));
      const done = () => document.getElementById('stop').hidden && document.querySelectorAll('#out section').length > 0 && /Xong|Đã dừng|lỗi/i.test(document.getElementById('status').innerText) && document.getElementById('status').innerText.slice(0, 60);
      let r = await waitFor(p, done, 400); let r2 = '';
      if (await p.$('.more-btn')) { await p.click('.more-btn'); await p.waitForTimeout(800); r2 = await waitFor(p, done, 400); }
      clearInterval(iv);
      const info = await p.evaluate(() => document.querySelectorAll('#out section').length + ' trang, ' + [...document.querySelectorAll('#out .view.book img')].filter(i => i.complete && i.naturalWidth).length + ' ảnh, nút tiếp: ' + ((document.querySelector('.more-btn') || {}).textContent || 'không'));
      say(`[${dev}] pdf ${f}: ${r} ${r2 ? '→ ' + r2 : ''} | ${info} | loads=${p._loads} RAM +${peak - base}MB ${p._log.join(' ')}`);
      await ctx.close();
    }
    // 4) Sách của tôi: thêm, tải lại trang (còn không), đọc hết, nút 拼
    {
      const { ctx, p } = await ctxFor(b, dev);
      await p.goto(BASE + 'sach/'); await p.waitForTimeout(1500);
      await p.setInputFiles('#addf', path.join(T, 'scan-30.pdf')); await p.waitForTimeout(4000);
      const toast1 = await p.evaluate(() => (document.querySelector('.toast,#toast') || {}).textContent || '');
      await p.reload(); await p.waitForTimeout(3000);
      const href = await p.evaluate(() => { const a = document.querySelector('#mine a[href*="my="]'); return a && a.getAttribute('href'); });
      const cover = await p.evaluate(() => (document.querySelector('#mine .bk em') || {}).textContent || '');
      const base = rss(); let peak = base; const iv = setInterval(() => { const r = rss(); if (r > peak) peak = r; }, 300);
      let rd = 'không thấy sách sau khi tải lại';
      if (href) {
        await p.goto(BASE + 'sach/' + href); await p.waitForTimeout(2500);
        for (let k = 0; k < 14; k++) { await p.evaluate(() => window.scrollBy(0, innerHeight * 2)); await p.waitForTimeout(600); }
        await p.click('#zi'); await p.click('#zi'); await p.waitForTimeout(1500);
        for (let k = 0; k < 6; k++) { await p.evaluate(() => window.scrollBy(0, -innerHeight * 2)); await p.waitForTimeout(600); }
        rd = await p.evaluate(() => { const c = [...document.querySelectorAll('.pg canvas')]; return 'trang ' + document.getElementById('pno').value + '/' + document.querySelectorAll('.pg').length + ', canvas đang giữ ' + c.length + ', lớn nhất ' + (Math.max(0, ...c.map(x => x.width * x.height)) / 1e6).toFixed(1) + 'MP'; });
        await p.click('#py'); const r = await waitFor(p, () => document.getElementById('stop') && document.getElementById('stop').hidden && document.querySelectorAll('#out section').length > 1 && document.getElementById('status').innerText.slice(0, 40) + ' ' + [...document.querySelectorAll('#out section .ttl')].map(x => x.textContent).join(','), 200);
        rd += ' | 拼: ' + r;
      }
      clearInterval(iv);
      say(`[${dev}] sach: thêm → "${toast1}" | bìa "${cover}" | ${rd} | loads=${p._loads} RAM +${peak - base}MB ${p._log.join(' ')}`);
      await ctx.close();
    }
  }
  await b.close();
  fs.writeFileSync('upload-report.txt', OUT.join('\n') + '\n');
})();
