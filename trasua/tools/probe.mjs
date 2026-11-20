// Manual diagnostics: checks article extraction, photos, and which CORS relays can fetch chinanews pages.
import fs from 'node:fs'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const A = require('../lib/article.js');
fs.mkdirSync('probe-out', { recursive: true });
const items = JSON.parse(fs.readFileSync('trasua/data/news.json', 'utf8')).items;
const pick = []; const cats = new Set();
for (const it of items) { if (!cats.has(it.c)) { cats.add(it.c); pick.push(it); } if (pick.length >= 8) break; }
for (const it of pick) {
  try {
    const r = await fetch(it.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = A.decode(await r.arrayBuffer()); fs.writeFileSync('probe-out/' + it.id + '.html', html);
    const x = A.extract(html, it.link);
    console.log('ART', it.c, r.status, it.link, 'paras', x.paras.length, 'chars', x.paras.join('').length, 'imgs', x.imgs.length, x.imgs[0] || '-', '| img field:', it.img || '-');
    console.log('   P0:', (x.paras[0] || '').slice(0, 80)); console.log('   PL:', (x.paras[x.paras.length - 1] || '').slice(0, 80));
    if (x.imgs[0]) { const ir = await fetch(x.imgs[0], { headers: { 'User-Agent': 'Mozilla/5.0' } }); console.log('   IMG no-referer', ir.status, ir.headers.get('content-type')); }
  } catch (e) { console.log('ART FAIL', it.link, e.message); }
}
const U = pick[0].link;
const relays = [
  ['allorigins', 'https://api.allorigins.win/raw?url=' + encodeURIComponent(U)],
  ['corsproxy.io', 'https://corsproxy.io/?url=' + encodeURIComponent(U)],
  ['codetabs', 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(U)],
  ['thingproxy', 'https://thingproxy.freeboard.io/fetch/' + U],
  ['cors.lol', 'https://api.cors.lol/?url=' + encodeURIComponent(U)],
  ['whateverorigin', 'https://whateverorigin.org/get?url=' + encodeURIComponent(U)],
];
for (const [n, u] of relays) {
  try {
    const t0 = Date.now(); const r = await fetch(u, { headers: { Origin: 'https://thaoanh1311997-png.github.io' }, signal: AbortSignal.timeout(20000) });
    const buf = await r.arrayBuffer(); const html = A.decode(buf); const x = A.extract(html, U);
    console.log('RELAY', n, r.status, 'acao=' + r.headers.get('access-control-allow-origin'), 'bytes', buf.byteLength, 'paras', x.paras.length, (Date.now() - t0) + 'ms');
  } catch (e) { console.log('RELAY', n, 'FAIL', e.message); }
}
