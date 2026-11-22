// Kiểm tra giọng đọc trên mọi trang (Chromium hoặc WebKit/iPhone).
// Chạy: phục vụ thư mục cha của repo ở cổng 8765 (repo nằm ở /Pinyin/), rồi: BROWSER=webkit node tools/voice/voice-test.cjs
const pw = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/Pinyin/';
const BR = process.env.BROWSER || 'chromium';

const INIT = () => {
  window.__log = [];
  const L = (t, x) => window.__log.push([t, String(x).slice(0, 80), Math.round(performance.now())]);
  const P = HTMLMediaElement.prototype, play = P.play;
  P.play = function () {
    const el = this, src = el.src || el.currentSrc || '';
    if (!/^data:/.test(src)) {
      L('play', src.replace(/^.*\/audio\/zh\//, 'zh/') + ' @' + el.playbackRate);
      el.addEventListener('ended', () => L('ended', src.replace(/^.*\/audio\/zh\//, 'zh/')), { once: true });
      el.addEventListener('error', () => L('error', src), { once: true });
    }
    return play.apply(this, arguments);
  };
  if (window.speechSynthesis) {
    const sp = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = function (u) {
      if (u.text && u.text.trim()) { L('tts', u.text + ' | ' + (u.voice ? u.voice.name : '-') + ' @' + u.rate); setTimeout(() => { try { u.onend && u.onend({}); } catch (e) {} }, 150); return; }
      return sp(u);
    };
  }
};

const results = [];
function ok(name, cond, info) { results.push([cond ? 'OK ' : 'FAIL', name, info || '']); console.log(cond ? 'OK  ' : 'FAIL', name, info || ''); }
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await pw[BR].launch(BR === 'chromium' ? { args: ['--autoplay-policy=user-gesture-required'] } : {});
  const ctxOpt = BR === 'webkit' ? { ...pw.devices['iPhone 13'] } : { viewport: { width: 1280, height: 860 } };
  const ctx = await browser.newContext(ctxOpt);
  await ctx.addInitScript(INIT);
  const errors = [];
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const tap = async sel => { const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); if (BR === 'webkit') await el.tap(); else await el.click(); };
  const log = () => page.evaluate(() => window.__log.splice(0));
  const ready = () => page.waitForFunction(() => window.BMVoice && BMVoice.info().idx > 0, null, { timeout: 15000 });

  // 1) Trà Sữa: truyện — nghe cả bài (giọng AI, tự chạy câu sau)
  await page.goto(BASE + 'trasua/#/read/s1'); await ready(); await wait(500);
  await tap('#rdPlay');
  await wait(9000);
  let L = await log();
  const plays = L.filter(x => x[0] === 'play'), ends = L.filter(x => x[0] === 'ended');
  ok('Truyện: phát giọng AI thu sẵn, tự sang câu sau', plays.length >= 2 && ends.length >= 1 && !L.some(x => x[0] === 'tts' || x[0] === 'error'), JSON.stringify(L.slice(0, 4)));
  await tap('#rdPlay').catch(() => {});
  await page.evaluate(() => BMVoice.stop());
  // chạm 1 câu
  await page.evaluate(() => window.__log.splice(0));
  await tap('[data-sent="1"]'); await wait(2500); L = await log();
  ok('Truyện: chạm 1 câu', L.some(x => x[0] === 'play'), JSON.stringify(L.slice(0, 2)));

  // 2) Đề nghe HSK: giọng nam/nữ khác nhau
  await page.goto(BASE + 'trasua/#/vocab/'); await ready();
  // 3) Câu giao tiếp
  await page.goto(BASE + 'trasua/#/topic/chao'); await ready(); await wait(400);
  await tap('[data-say]'); await wait(2500); L = await log();
  ok('Giao tiếp: nút 🔊', L.some(x => x[0] === 'play'), JSON.stringify(L.slice(0, 2)));

  // 4) Câu mới không có sẵn → giọng máy, chia câu
  const r = await page.evaluate(async () => { window.__log.splice(0); await BMVoice.speak('今天天气很好，我们去公园散步吧。你觉得怎么样？我觉得这个主意不错！', { rate: 0.9 }); return window.__log.splice(0); });
  ok('Câu mới: dùng giọng máy, ngắt theo câu', r.filter(x => x[0] === 'tts').length >= 2, JSON.stringify(r));

  // 5) Game
  await page.goto(BASE + 'game/'); await page.waitForFunction(() => window.GAME && window.BMVoice, null, { timeout: 15000 }); await ready();
  const g = await page.evaluate(async () => { window.__log.splice(0); GAME.speak('爸爸'); await new Promise(r => setTimeout(r, 2500)); return window.__log.splice(0); });
  ok('Game: đọc từ', g.some(x => x[0] === 'play'), JSON.stringify(g.slice(0, 2)));

  // 6) Trang chủ
  await page.goto(BASE); await ready();
  const h = await page.evaluate(async () => { window.__log.splice(0); BMVoice.speak('你好！', { rate: .9 }); await new Promise(r => setTimeout(r, 2000)); return window.__log.splice(0); });
  ok('Trang chủ: Bánh Mì chào', h.some(x => x[0] === 'play'), JSON.stringify(h.slice(0, 2)));

  // 7) Video: bài mẫu
  await page.goto(BASE + 'video/'); await ready();
  await page.evaluate(() => window.__log.splice(0));
  await tap('[data-smp="0"]'); await wait(1200);
  await tap('#pPlay'); await wait(6000);
  const v = await log();
  ok('Video: đọc câu', v.some(x => x[0] === 'play'), JSON.stringify(v.slice(0, 2)));

  // 8) Ôn thi / tài liệu
  await page.goto(BASE + 'on-thi/tai-lieu.html'); await ready();
  const t = await page.evaluate(async () => { window.__log.splice(0); BMVoice.speak('会议厅', { rate: 0.8 }); await new Promise(r => setTimeout(r, 2500)); return window.__log.splice(0); });
  ok('Ôn thi: đọc từ', t.some(x => x[0] === 'play' || x[0] === 'tts'), JSON.stringify(t.slice(0, 2)));

  ok('Không có lỗi JavaScript', !errors.length, errors.join(' | '));
  await browser.close();
  const fail = results.filter(x => x[0] === 'FAIL').length;
  console.log(fail ? fail + ' FAIL' : 'ALL OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
