const { chromium, webkit, devices } = require('playwright');
process.on('unhandledRejection', e => console.log('late rejection (ignored after close):', String(e).slice(0, 80)));
const fs = require('fs'), path = require('path');
const S = process.env.T_DIR || process.cwd();
const BASE = 'http://localhost:8765/Pinyin/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const zh = ['你好，我是学生。','我们一起学习汉语。','今天天气很好。','我想去超市买东西。','你最近忙不忙？','我每天早上七点起床。','这本书很有意思。','他是我的好朋友。','我们明天见吧。','谢谢你的帮助。'];
const LES = { id: 'v1', title: '01 第一课', src: { type: 'file', name: '01 第一课.mp3', audio: true }, lines: Array.from({ length: 20 }, (_, i) => ({ s: i * 3, e: i * 3 + 2.8, zh: zh[i % 10], vi: 'Câu ' + (i + 1) })), at: Date.now() };
(async () => {
  const bt = process.env.BT === 'webkit' ? webkit : chromium, name = process.env.BT || 'chromium';
  for (const mobile of (process.env.ONLY==="desk"?[false]:[true, false])) {
    const tag = `[${name}${mobile ? ' phone' : ' desktop'}]`;
    const b = await bt.launch();
    const ctx = await b.newContext(mobile ? { ...devices[bt === webkit ? 'iPhone 13' : 'Pixel 7'] } : { viewport: { width: 1400, height: 900 } });
    await ctx.addInitScript((les) => { if (!localStorage.getItem('t.init')) { localStorage.setItem('t.init', '1'); localStorage.setItem('bb.lessons', JSON.stringify([les])); } }, LES);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => { if (/\/video\//.test(pg.url())) errs.push(String(e)); });
    await pg.goto(BASE + 'sach/'); // a page before, to see that back does not leave the lesson page
    await pg.goto(BASE + 'video/'); await pg.waitForSelector('#lib .open', { state: 'attached' });
    ok(!(await pg.$('#resumeCard .resume')), tag + ' no resume card before learning');
    await (async () => { if (!(await pg.isVisible('#vLib'))) await pg.click('[data-go=\"lib\"]'); await pg.click('#lib .open[data-id=\"v1\"]'); })(); await pg.waitForSelector('#reMedia', { state: 'attached' });
    await pg.setInputFiles('#reMedia', { name: '01 第一课.mp3', mimeType: 'audio/mpeg', buffer: fs.readFileSync(path.join(S, 'long.mp3')) });
    await pg.waitForSelector('#vid'); await pg.waitForTimeout(800);
    await pg.click('.line[data-i="6"]'); await pg.waitForTimeout(1500);
    const t1 = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    // A) phone back gesture / browser back → back to the "Bài đã học" list it was opened from, then Home; never leaves the page
    await pg.goBack(); await pg.waitForTimeout(800);
    ok(/\/video\/$/.test(pg.url()) && await pg.isVisible('#vLib'), tag + ' browser back returns to the lesson list, url ' + pg.url());
    await pg.goBack(); await pg.waitForTimeout(800);
    ok(/\/video\/$/.test(pg.url()) && await pg.isVisible('#vHome'), tag + ' browser back stays in Học video (home), url ' + pg.url());
    const rc = await pg.textContent('#resumeCard').catch(() => '');
    ok(/Câu 7\/20/.test(rc) && /Nghe tiếp/.test(rc), tag + ' resume card: ' + rc.replace(/\s+/g, ' ').trim());
    await pg.click('#resumeCard .resume'); await pg.waitForSelector('#vid'); await pg.waitForTimeout(1200);
    const st = await pg.evaluate(() => ({ act: +(document.querySelector('.line.act') || {}).dataset?.i, t: document.querySelector('#vid').currentTime, paused: document.querySelector('#vid').paused }));
    ok(st.act === 6 && st.t >= 17 && st.t <= t1 + 0.5 && st.paused, tag + ` reopened at line 7, time ${st.t.toFixed(1)} (left ${t1.toFixed(1)}), not auto-playing`);
    ok(/Nghe tiếp từ câu 7/.test(await pg.textContent('#toast')), tag + ' toast says where it continues');
    await pg.click('#pPlay'); await pg.waitForTimeout(1200);
    const t2 = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    ok(t2 >= 18 && t2 < 22, tag + ' Phát continues from line 7 (t=' + t2.toFixed(1) + ')');
    await pg.waitForTimeout(3500); // moves on to line 8
    // B) reload while in a lesson (accidental leave) → lesson reopens by itself
    await pg.reload(); await pg.waitForSelector('#vid', { timeout: 8000 }).catch(() => {}); await pg.waitForTimeout(1200);
    const st2 = await pg.evaluate(() => ({ les: !document.querySelector('#vLesson').hidden, act: +(document.querySelector('.line.act') || {dataset:{}}).dataset.i, t: (document.querySelector('#vid') || {}).currentTime }));
    ok(st2.les && st2.act >= 7 && st2.t > 20, tag + ` after reload the lesson reopens at line ${st2.act + 1}, t=${(st2.t||0).toFixed(1)}`);
    // C) the in-page back button → home; one more browser back leaves the page normally (no trap)
    if (mobile) await pg.click('#goBack'); else await pg.click('#goHome');
    await pg.waitForTimeout(800);
    ok(await pg.isVisible('#vHome'), tag + ' back button → Học video home');
    ok(!!(await pg.$('#resumeCard .resume')), tag + ' resume card still there');
    const before = pg.url(); await pg.goBack(); await pg.waitForTimeout(1200);
    ok(/\/sach\//.test(pg.url()), tag + ' next browser back leaves normally to ' + pg.url());
    await pg.goForward(); await pg.waitForSelector('#vHome'); await pg.waitForTimeout(800);
    ok(await pg.isVisible('#vHome') && !(await pg.isVisible('#vLesson')), tag + ' coming back after leaving on purpose stays on home');
    // D) sample lesson: no resume entry, no crash
    await pg.click('[data-go="samples"]'); await pg.click('[data-stp="chao"]'); await pg.click('.tp.open .sp-it'); await pg.waitForTimeout(800); await pg.click('.line[data-i="2"]'); await pg.waitForTimeout(400);
    ok(!(await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.pos') || '{}')).s1), tag + ' sample lessons do not create resume entries');
    ok(!errs.length, tag + ' no page errors ' + errs.join(' | '));
    await b.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
