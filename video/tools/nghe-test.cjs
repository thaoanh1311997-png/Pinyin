// Book listening lessons (encrypted pack): unlock link, grouped list per book, audio plays the real recording,
// subtitles follow, resume works, the user's old copy of the same file is hidden. Uses a test key and a fake pack.
const { chromium, webkit, devices } = require('playwright');
process.on('unhandledRejection', e => console.log('late rejection (ignored after close):', String(e).slice(0, 80)));
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const S = process.env.T_DIR || process.cwd();
const BASE = 'http://localhost:8765/Pinyin/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const KH = crypto.randomBytes(32).toString('hex'), KEY = Buffer.from(KH, 'hex');
const hid = s => crypto.createHash('sha256').update(s + '|' + KH).digest('hex').slice(0, 20);
const enc = b => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', KEY, iv); return Buffer.concat([iv, c.update(b), c.final(), c.getAuthTag()]); };
const audio = fs.readFileSync(path.join(S, 'long.mp3'));
const zh = ['你好，我是学生。', '我们一起学习汉语。', '今天天气很好。', '我想去超市买东西。', '你最近忙不忙？', '我每天早上七点起床。'];
const mk = (id, book, no, t) => ({ id, book, no, zh: t, vi: 'Tên bài ' + no, file: book === 3 ? '0' + no + ' 第一课.mp3' : '0' + no + '.mp3', dur: 60, a: hid('a|' + id), size: audio.length + 28,
  lines: Array.from({ length: 18 }, (_, i) => [i * 3, i * 3 + 2.8, zh[i % 6], 'Câu ' + (i + 1)]) });
const IDX = { v: 1, lessons: [mk('q3-01', 3, 1, '迎来送往'), mk('q2-05', 2, 5, '第五课')] };
const FILES = { [hid('idx') + '.bin']: enc(Buffer.from(JSON.stringify(IDX))) };
IDX.lessons.forEach(l => FILES[l.a + '.bin'] = enc(audio));
const OLD = { id: 'v1', title: '01 第一课', src: { type: 'file', name: '01 第一课.mp3', audio: true }, lines: [{ s: 0, e: 2, zh: '你好。', vi: 'Xin chào.' }], at: Date.now() };
const OTHER = { id: 'v2', title: 'Bài riêng', src: { type: 'file', name: 'rieng.mp3', audio: true }, lines: [{ s: 0, e: 2, zh: '你好。', vi: 'Xin chào.' }], at: Date.now() };
(async () => {
  const bt = process.env.BT === 'webkit' ? webkit : chromium, name = process.env.BT || 'chromium';
  for (const mobile of (process.env.ONLY === 'desk' ? [false] : [true, false])) {
    const tag = `[${name}${mobile ? ' phone' : ' desktop'}]`;
    const b = await bt.launch();
    const ctx = await b.newContext(mobile ? { ...devices[bt === webkit ? 'iPhone 13' : 'Pixel 7'] } : { viewport: { width: 1400, height: 900 } });
    await ctx.addInitScript((ls) => { if (!localStorage.getItem('t.init')) { localStorage.setItem('t.init', '1'); localStorage.setItem('bb.lessons', JSON.stringify(ls)); } }, [OLD, OTHER]);
    let audioHits = 0;
    await ctx.route('**/video/data/nghe/*.bin', r => { const f = r.request().url().split('/').pop(); if (FILES[f]) { if (f !== hid('idx') + '.bin') audioHits++; return r.fulfill({ status: 200, body: FILES[f], contentType: 'application/octet-stream' }); } return r.fulfill({ status: 404, body: '' }); });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => { if (/\/video\//.test(pg.url())) errs.push(String(e)); });
    // without the key nothing shows (public visitors see nothing)
    await pg.goto(BASE + 'video/'); await pg.waitForSelector('#lib .open'); await pg.waitForTimeout(600);
    ok(await pg.isHidden('#ngheSec'), tag + ' no key → no book section');
    ok((await pg.$$('#lib .open')).length === 2, tag + ' own lessons listed as before');
    // the private link unlocks it
    await pg.goto(BASE + 'video/#nk=' + KH); await pg.waitForSelector('#ngheSec:not([hidden]) .ng-it', { timeout: 8000 });
    ok(!/nk=/.test(pg.url()), tag + ' key removed from the address bar: ' + pg.url());
    const books = await pg.$$eval('.ng-book', bs => bs.map(b => b.querySelector('.ng-tag').textContent + ':' + [...b.querySelectorAll('.ng-it')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).join('|')));
    ok(books.length === 2 && /^Quyển 2:Bài5/.test(books[0]) && /^Quyển 3:Bài1迎来送往/.test(books[1]), tag + ' grouped per book: ' + books.join(' // '));
    ok(/Đã có 2 bài nghe giáo trình/.test(await pg.textContent('#toast')), tag + ' toast confirms');
    // not signed in to ☁️ here → the login opens so the key reaches the account (and the user's other devices)
    await pg.waitForSelector('#bm-acct.open', { timeout: 5000 }).catch(() => {});
    ok(await pg.isVisible('#bm-acct.open'), tag + ' ☁️ login offered after unlocking on a signed-out device');
    ok(/Đăng nhập ☁️/.test(await pg.textContent('#toast')), tag + ' toast explains the one-time login');
    await pg.click('#bm-acct .sa-bg', { position: { x: 10, y: 10 } }); await pg.waitForTimeout(500);
    const lib = await pg.$$eval('#lib .open', l => l.map(x => x.dataset.id));
    ok(lib.length === 1 && lib[0] === 'v2', tag + ' old copy of 01 第一课 hidden, other lesson kept: ' + lib.join(','));
    ok(JSON.parse(await pg.evaluate(() => localStorage.getItem('bb.lessons'))).length === 2, tag + ' nothing deleted from the saved list');
    // open Quyển 3 · Bài 1
    await pg.click('.ng-book.b3 .ng-it'); await pg.waitForSelector('#vid', { timeout: 15000 }); await pg.waitForTimeout(600);
    ok((await pg.textContent('#topTitle')) === 'Quyển 3 · Bài 1 · 迎来送往', tag + ' title ' + await pg.textContent('#topTitle'));
    ok((await pg.$$('.line')).length === 18, tag + ' all 18 lines shown');
    const vi = await pg.textContent('.line[data-i="2"]');
    ok(/Câu 3/.test(vi), tag + ' translation shown with the line');
    await pg.click('.line[data-i="4"]'); await pg.waitForTimeout(1500);
    const t1 = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    ok(t1 >= 12 && t1 <= 15, tag + ' tapping line 5 plays the recording from 12s (t=' + t1.toFixed(1) + ')');
    ok(!(await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.lessons') || '[]').some(x => /^nghe-/.test(x.id)))), tag + ' book lesson not copied into own lessons');
    await pg.click('[data-skip="10"]'); await pg.waitForTimeout(600);
    const t2 = await pg.evaluate(() => document.querySelector('#vid').currentTime);
    ok(t2 > t1 + 8, tag + ' +10s works (' + t2.toFixed(1) + ')');
    // back home: progress shown on the lesson card + resume card
    if (mobile) await pg.click('#goBack'); else await pg.click('#goHome');
    await pg.waitForSelector('#vHome:not([hidden])'); await pg.waitForTimeout(500);
    const card = await pg.textContent('.ng-book.b3 .ng-it');
    ok(/Đang nghe câu \d+\/18/.test(card), tag + ' lesson card shows progress: ' + card.replace(/\s+/g, ' ').trim());
    ok(/Quyển 3 · Bài 1/.test(await pg.textContent('#resumeCard')), tag + ' resume card points at the book lesson');
    // reload: audio comes from this device now, no second download
    const hits = audioHits; await pg.reload(); await pg.waitForSelector('.ng-it', { timeout: 8000 });
    await pg.click('.ng-book.b2 .ng-it'); await pg.waitForSelector('#vid', { timeout: 15000 });
    await pg.goBack(); await pg.waitForTimeout(500);
    await pg.click('.ng-book.b3 .ng-it'); await pg.waitForSelector('#vid', { timeout: 15000 }); await pg.waitForTimeout(500);
    ok(audioHits === hits + 1, tag + ` audio kept on device (downloads before ${hits}, after ${audioHits})`);
    const dur = await pg.evaluate(() => document.querySelector('#vid').duration);
    ok(dur > 55, tag + ' audio decoded, duration ' + dur.toFixed(1));
    // the key is kept for this device (and syncs like other settings)
    ok((await pg.evaluate(() => JSON.parse(localStorage.getItem('bb.nk')))) === KH, tag + ' key remembered');
    ok(!errs.length, tag + ' no page errors ' + errs.join(' | '));
    await b.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
