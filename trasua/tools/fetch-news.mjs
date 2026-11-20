// Fetches Chinese news headlines + lead paragraphs from public RSS feeds (feed-reader style:
// only what the publisher puts in its RSS, always with a link to the original article).
// Runs in GitHub Actions (browsers cannot read these feeds directly because of CORS).
import fs from 'node:fs';
const OUT = new URL('../data/news.json', import.meta.url);
const FEEDS = [
  ['xh', 'society', 'https://www.chinanews.com.cn/rss/society.xml'],
  ['tn', 'china', 'https://www.chinanews.com.cn/rss/china.xml'],
  ['qt', 'world', 'https://www.chinanews.com.cn/rss/world.xml'],
  ['kt', 'finance', 'https://www.chinanews.com.cn/rss/finance.xml'],
  ['vh', 'culture', 'https://www.chinanews.com.cn/rss/culture.xml'],
  ['tt', 'sports', 'https://www.chinanews.com.cn/rss/sports.xml'],
  ['sk', 'health', 'https://www.chinanews.com.cn/rss/health.xml'],
  ['cn', 'it', 'https://www.chinanews.com.cn/rss/it.xml'],
  ['gd', 'edu', 'https://www.chinanews.com.cn/rss/edu.xml'],
  ['xh', 'scroll', 'https://www.chinanews.com.cn/rss/scroll-news.xml'],
];
const dec = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const strip = s => dec(s).replace(/<[^>]+>/g, '').replace(/[　\s]+/g, ' ').trim();
const tag = (x, t) => { const m = x.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? m[1] : ''; };
// photo of the article: from the RSS item, else the first content photo on the article page
function absUrl(u, base) { try { return new URL(u.replace(/&amp;/g, '&'), base).href; } catch (e) { return ''; } }
function pickImg(html, base = 'https://www.chinanews.com.cn/') {
  if (!html) return '';
  const meta = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i);
  if (meta) return absUrl(meta[1], base);
  const zone = (() => { const i = html.search(/class=["'][^"']*(left_zw|content_desc|content|article)/i); return i >= 0 ? html.slice(i) : html; })();
  for (const m of zone.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi)) {
    const u = m[1];
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(u)) continue;
    if (/logo|icon|ewm|qrcode|erweima|share|weixin|wx_|banner|ad[_/]|blank|loading|avatar|button|btn/i.test(u)) continue;
    return absUrl(u, base);
  }
  return '';
}
let old = [];
try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')).items || []; } catch (e) {}
const seen = new Map(old.map(a => [a.link, a]));
let added = 0;
for (const [cat, name, url] of FEEDS) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (news reader for Chinese learners)' }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) { console.log('skip', name, r.status); continue; }
    const xml = await r.text(); let n = 0;
    for (const it of xml.split(/<item[ >]/).slice(1)) {
      const title = strip(tag(it, 'title')), link = strip(tag(it, 'link'));
      const rawDesc = dec(tag(it, 'description'));
      let body = strip(tag(it, 'description'));
      const date = new Date(strip(tag(it, 'pubDate')) || Date.now());
      if (!title || !link || !/[一-鿿]/.test(title)) continue;
      if (body.replace(/\s/g, '') === title.replace(/\s/g, '') || body.includes('题：' + title)) body = body.length > title.length + 25 ? body : '';
      body = body.replace(/^(中新网|中新社)[^电]{0,20}电\s*(\([^)]*\)|（[^）]*）)?\s*/, '');
      { const seenS = new Set(); body = body.replace(/\s*[^。！？]*?[\u4e00-\u9fff]{1,4}\s*摄\s*/g, '。').split(/(?<=[。！？])/).map(x => x.trim()).filter(x => x && x !== '。' && !/^图为/.test(x) && !seenS.has(x) && seenS.add(x)).join(''); }
      if (body.length < 30) continue;
      if (seen.has(link)) { const a = seen.get(link); if (a.c === 'xh' && cat !== 'xh') a.c = cat; continue; }
      const im0 = pickImg(rawDesc);
      seen.set(link, { id: link.replace(/\D/g, '').slice(-12), t: title, b: body.slice(0, 600), c: cat, s: '中国新闻网', link, d: isNaN(date) ? Date.now() : date.getTime(), ...(im0 ? { img: im0 } : {}) });
      n++; added++;
    }
    console.log('ok', name, n);
  } catch (e) { console.log('fail', name, e.message); }
}
// look up photos on article pages for items that don't have one yet (a few at a time, polite)
{
  const todo = [...seen.values()].filter(a => a.img === undefined && a.d > Date.now() - 10 * 864e5).sort((a, b) => b.d - a.d).slice(0, 80);
  let found = 0;
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(todo.slice(i, i + 6).map(async a => {
      try {
        const r = await fetch(a.link, { headers: { 'User-Agent': 'Mozilla/5.0 (news reader for Chinese learners)' }, signal: AbortSignal.timeout(15000) });
        if (!r.ok) return;
        const buf = Buffer.from(await r.arrayBuffer());
        let html = buf.toString('utf8'); if (/charset=["']?gb/i.test(html.slice(0, 2000))) html = new TextDecoder('gbk').decode(buf);
        a.img = pickImg(html, a.link); if (a.img) found++;
      } catch (e) { /* try again next run */ }
    }));
  }
  console.log('photos: looked up', todo.length, 'found', found);
}
const cutoff = Date.now() - 10 * 864e5;
const items = [...seen.values()].filter(a => a.d > cutoff).sort((a, b) => b.d - a.d).slice(0, 400);
fs.mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ updated: Date.now(), items }));
console.log('added', added, 'total', items.length);
