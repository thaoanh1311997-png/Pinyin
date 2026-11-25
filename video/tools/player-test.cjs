// Học video: tách câu dính + bỏ số đề, dịch lại bằng AI (không "ta/ngươi"), nút ±10s, chạm câu khi đang phát không bị dừng,
// chữ chạy theo giọng khi bấm nút phát của trình phát, làm lại phụ đề cho bài cũ. Groq được giả lập.
const { chromium, webkit, devices } = require('playwright');
const fs = require('fs'), path = require('path');
process.on('unhandledRejection', e => console.log('late rejection (ignored):', String(e).slice(0, 80)));
const S = process.env.T_DIR || process.cwd();
const URL0 = 'http://localhost:8765/Pinyin/video/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const OLD = { id: 'v9', title: '02 第二课', src: { type: 'file', name: '02.mp3', audio: true }, at: Date.now(), lines: [
  { s: 0, e: 4, zh: '第二课。', vi: 'Bài hai.' },
  { s: 4, e: 14, zh: '女的是什么意思 6?3. 王阿姨,您比我妈的身体可好多了。', vi: 'nữ nghĩa là gì? 6? 3. Dì Vương, thân hình dì đẹp hơn mẹ cháu nhiều.' },
  { s: 14, e: 22, zh: '四。小王,你帮了我这么大忙,我真不知道说什么才好。', vi: 'Bốn. Tiểu Vương, ngươi đã giúp ta nhiều như vậy, ta thật sự không biết nên nói thế nào.' },
  ...Array.from({ length: 12 }, (_, i) => ({ s: 22 + i * 3, e: 24.8 + i * 3, zh: ['我们一起学习汉语。', '今天天气很好。', '我想去超市买东西。'][i % 3], vi: 'x' }))
] };
function mockGroq(ctx, st) {
  return ctx.route('https://api.groq.com/**', async route => {
    const req = route.request(), u = req.url();
    if (/chat\/completions/.test(u)) {
      st.chat++;
      const body = JSON.parse(req.postData()); const user = body.messages[1].content;
      const n = (user.match(/^\d+\. /gm) || []).length;
      const vi = Array.from({ length: n }, (_, k) => 'Câu dịch AI ' + (k + 1) + (st.chat % 2 ? '' : ' (đã soát)'));
      if (st.bad && st.chat === 1) vi[0] = 'Ta đi với ngươi';
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({ vi }) } }] }) });
    }
    if (/audio\/transcriptions/.test(u)) {
      st.asr++;
      const raw = (req.postDataBuffer() || Buffer.alloc(0)).toString('latin1');
      if (/gap\.mp3/.test(raw)) { st.gap++; return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: '', segments: st.gap === 1 ? [{ start: 5, end: 8, text: '这是漏掉的一句话。', no_speech_prob: 0.01 }] : [{ start: 1, end: 2, text: '谢谢观看', no_speech_prob: 0.2 }], words: [] }) }); }
      const segs = [{ start: 0.5, end: 3, text: '第二课。' }, { start: 3.5, end: 12, text: '女的是什么意思？3. 王阿姨，您比我妈的身体可好多了。' }, { start: 15, end: 20, text: '小王，你帮了我这么大忙。' }];
      const words = [];
      [...'第二课'].forEach((c, i) => words.push({ word: c, start: 0.6 + i * 0.3, end: 0.9 + i * 0.3 }));
      [...'女的是什么意思'].forEach((c, i) => words.push({ word: c, start: 3.6 + i * 0.3, end: 3.9 + i * 0.3 }));
      words.push({ word: '3', start: 7, end: 7.2 });
      [...'王阿姨您比我妈的身体可好多了'].forEach((c, i) => words.push({ word: c, start: 8 + i * 0.25, end: 8.25 + i * 0.25 }));
      [...'小王你帮了我这么大忙'].forEach((c, i) => words.push({ word: c, start: 15.2 + i * 0.4, end: 15.6 + i * 0.4 }));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: '', segments: segs, words }) });
    }
    return route.fulfill({ status: 404, body: '' });
  });
}
(async () => {
  const bt = process.env.BT === 'webkit' ? webkit : chromium, name = process.env.BT || 'chromium';
  for (const mobile of [true, false]) {
    const tag = `[${name}${mobile ? ' phone' : ' desktop'}]`;
    const b = await bt.launch();
    const ctx = await b.newContext(mobile ? { ...devices[bt === webkit ? 'iPhone 13' : 'Pixel 7'] } : { viewport: { width: 1400, height: 900 } });
    const st = { chat: 0, asr: 0, gap: 0 }; await mockGroq(ctx, st);
    await ctx.route(/translate\.googleapis|mymemory/, r => r.fulfill({ status: 500, body: '' }));
    await ctx.addInitScript((les) => { if (!localStorage.getItem('t.init')) { localStorage.setItem('t.init', '1'); localStorage.setItem('bb.lessons', JSON.stringify([les])); localStorage.setItem('bb.groq', 'gsk_test_key_0000000000000000000000'); } }, OLD);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
    await pg.goto(URL0); await pg.waitForSelector('#lib .open', { state: 'attached' });
    await pg.click('#lib .open[data-id="v9"]'); await pg.waitForSelector('#reMedia', { state: 'attached' });
    await pg.setInputFiles('#reMedia', { name: '02.mp3', mimeType: 'audio/mpeg', buffer: fs.readFileSync(path.join(S, 'long.mp3')) });
    await pg.waitForSelector('#vid'); await pg.waitForTimeout(2500);
    const zh = await pg.evaluate(() => [...document.querySelectorAll('#lines .line .hz')].length ? [...document.querySelectorAll('#lines .line')].map(l => [...l.querySelectorAll('.hz')].map(x => x.textContent).join('')) : []);
    ok(zh.some(z => z === '女的是什么意思?') && zh.some(z => z.startsWith('王阿姨')), tag + ' glued sentence split: ' + zh.slice(1, 3).join(' | '));
    ok(!zh.some(z => /^四。|6\?|3\./.test(z)), tag + ' exam numbers removed: ' + zh[3]);
    const saved = await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.lessons')).find(x => x.id === 'v9'));
    ok(saved.tv === 2 && saved.lines.every(l => /^Câu dịch AI/.test(l.vi)), tag + ' whole lesson re-translated by AI and saved (tv=' + saved.tv + ', chat calls ' + st.chat + ')');
    ok(!saved.lines.some(l => /\bngươi\b|\bta\b/i.test(l.vi)), tag + ' no ta/ngươi left');
    ok(await pg.isVisible('#redoSubs'), tag + ' old lesson offers "Làm lại cho khớp"');
    // ±10s
    await pg.evaluate(() => { const v = document.querySelector('#vid'); v.currentTime = 20; });
    await pg.waitForTimeout(300); await pg.click('[data-skip="10"]'); await pg.waitForTimeout(400);
    const a = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    await pg.click('[data-skip="-10"]'); await pg.click('[data-skip="-10"]'); await pg.waitForTimeout(400);
    const c = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    ok(Math.abs(a - 30) < 0.6 && Math.abs(c - 10) < 0.6, tag + ` +10s → ${a.toFixed(1)}, −10s ×2 → ${c.toFixed(1)}`);
    const box = await pg.$eval('[data-skip="10"]', el => { const r = el.getBoundingClientRect(); return [r.width, r.height]; });
    ok(box[1] >= 44 && box[0] >= 100, tag + ' skip buttons are big enough ' + box.map(Math.round).join('×'));
    // native play: highlight follows the voice
    await pg.evaluate(() => { const v = document.querySelector('#vid'); v.currentTime = 30; v.play(); });
    await pg.waitForTimeout(1500);
    const act = await pg.evaluate(() => { const t = document.querySelector('#vid').currentTime; const a = document.querySelector('.line.act'); return [t, a && +a.dataset.i]; });
    const exp = await pg.evaluate((t) => { const ls = [...document.querySelectorAll('#lines .line')]; return ls.length; }, act[0]);
    ok(act[1] != null && act[1] > 3, tag + ` native play: highlight follows (t=${act[0].toFixed(1)}, line ${act[1] + 1}/${exp})`);
    // tap another sentence while playing → keeps playing past that sentence
    await pg.click('.line[data-i="6"]'); await pg.waitForTimeout(5000);
    const p2 = await pg.evaluate(() => ({ paused: document.querySelector('#vid').paused, t: document.querySelector('#vid').currentTime }));
    ok(!p2.paused, tag + ` tapping a sentence while playing keeps playing (t=${p2.t.toFixed(1)})`);
    await pg.click('#pPlay').catch(() => {}); await pg.waitForTimeout(300);
    // redo subtitles with word timing
    await pg.click('#redoSubs'); await pg.waitForFunction(() => { const l = JSON.parse(localStorage.getItem('bb.lessons')).find(x => x.id === 'v9'); return l && l.ver === 3; }, null, { timeout: 40000 }).catch(() => {});
    await pg.waitForTimeout(1500);
    const red = await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.lessons')).find(x => x.id === 'v9'));
    ok(red.lines.some(l => l.zh === '这是漏掉的一句话。' && l.s > 20 && l.s < 30) && !red.lines.some(l => /谢谢观看/.test(l.zh)), tag + ' skipped stretch filled in (gap calls ' + st.gap + ')');
    ok(red.ver === 3 && red.lines.length === 5 && red.lines[1].zh === '女的是什么意思？' && Math.abs(red.lines[2].s - 8) < 0.3 && red.lines.every(l => l.vi), tag + ' redo: ' + red.lines.map(l => l.zh + '@' + l.s.toFixed(1)).join(' | '));
    ok(!(await pg.isVisible('#redoSubs')), tag + ' redo offer gone after redo');
    ok(!errs.length, tag + ' no page errors ' + errs.join(' | '));
    await b.close();
  }
  // no AI key: old-style pronouns are still fixed
  { const b = await bt.launch(); const ctx = await b.newContext(); await ctx.route(/translate\.googleapis|mymemory|api\.groq/, r => r.fulfill({ status: 500, body: '' }));
    await ctx.addInitScript((les) => { if (!localStorage.getItem('t.init')) { localStorage.setItem('t.init', '1'); localStorage.setItem('bb.lessons', JSON.stringify([les])); } }, { ...OLD, lines: OLD.lines.slice(2, 4) });
    const pg = await b.contexts()[0].newPage(); await pg.goto(URL0); await pg.waitForSelector('#lib .open', { state: 'attached' }); await pg.click('#lib .open[data-id="v9"]'); await pg.waitForTimeout(1500);
    const vi = await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.lessons')).find(x => x.id === 'v9').lines.map(l => l.vi));
    ok(/bạn đã giúp tôi/.test(vi[0]) && !/^Bốn/.test(vi[0]), `[${name}] no key: pronouns fixed → "${vi[0]}"`);
    await b.close(); }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
