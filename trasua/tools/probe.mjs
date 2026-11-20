// Manual diagnostics (workflow "Trà Sữa probe"): opens the LIVE site in a phone browser and checks that
// news photos show and that whole articles load, with pinyin + translation. Prints a short report only.
import { chromium, devices } from 'playwright';
const U = 'https://thaoanh1311997-png.github.io/Pinyin/trasua/';
const b = await chromium.launch();
const c = await b.newContext(devices['iPhone 13']);
const p = await c.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto(U + '#/news/all'); await p.waitForSelector('.news', { timeout: 30000 }); await p.waitForTimeout(2500);
const cards = await p.locator('.news').count();
const thumbs = await p.$$eval('.news .thumb img', x => x.filter(i => i.complete && i.naturalWidth > 0).length);
console.log('CARDS', cards, 'thumbs loaded', thumbs);
const ids = await p.$$eval('.news', x => x.slice(0, 5).map(a => (a.getAttribute('href') || '').split('/').pop()));
for (const id of ids) {
  const t0 = Date.now();
  await p.goto(U + '#/read/' + id); await p.waitForSelector('#reader');
  try { await p.waitForFunction(() => document.querySelectorAll('#rbody .para').length > 1 || document.querySelector('#faRetry'), null, { timeout: 60000 }); } catch (e) {}
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => ({
    paras: document.querySelectorAll('#rbody .para').length, sents: document.querySelectorAll('#rbody .sent').length,
    chars: [...document.querySelectorAll('#rbody .sent .c')].map(e => e.textContent).join('').length,
    vi: [...document.querySelectorAll('#rbody .vi')].filter(e => e.textContent && !/…|Đang dịch/.test(e.textContent)).length,
    imgs: [...document.querySelectorAll('#reader img')].map(i => i.naturalWidth).join(','),
    fail: !!document.querySelector('#faRetry'), first: (document.querySelector('#rbody .vi') || {}).textContent,
  }));
  console.log('READ', id, JSON.stringify(r), (Date.now() - t0) + 'ms');
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
