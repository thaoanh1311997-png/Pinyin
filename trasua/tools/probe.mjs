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
const link0 = await p.evaluate(async () => { const j = await (await fetch('data/news.json')).json(); return j.items.slice(0, 3).map(x => x.link); });
for (const [nm, f] of [['corslol', u => 'https://api.cors.lol/?url=' + encodeURIComponent(u)], ['allorigins', u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u)], ['allorigins-get', u => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u)], ['codetabs', u => 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u)], ['corsproxy', u => 'https://corsproxy.io/?url=' + encodeURIComponent(u)], ['cfproxy', u => 'https://cors-proxy.htmldriven.com/?url=' + encodeURIComponent(u)], ['everyorigin', u => 'https://everyorigin.jwvbremen.nl/api/get?url=' + encodeURIComponent(u)], ['jina', u => 'https://r.jina.ai/' + u], ['whatever', u => 'https://whateverorigin.org/get?url=' + encodeURIComponent(u)]]) {
  const r = await p.evaluate(async (url) => { const t = Date.now(); try { const ctl = new AbortController(); setTimeout(() => ctl.abort(), 20000); const x = await fetch(url, { signal: ctl.signal }); const tx = await x.text(); return x.status + ' len ' + tx.length + ' zh ' + (tx.match(/[一-鿿]/g) || []).length + ' left_zw ' + tx.includes('left_zw') + ' ' + (Date.now() - t) + 'ms ' + tx.slice(0, 80).replace(/\s+/g, ' '); } catch (e) { return 'ERR ' + e.message + ' ' + (Date.now() - t) + 'ms'; } }, f(link0[0]));
  console.log('RELAY', nm, r);
}
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
