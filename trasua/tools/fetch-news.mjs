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
      let body = strip(tag(it, 'description'));
      const date = new Date(strip(tag(it, 'pubDate')) || Date.now());
      if (!title || !link || !/[一-鿿]/.test(title)) continue;
      if (body.replace(/\s/g, '') === title.replace(/\s/g, '') || body.includes('题：' + title)) body = body.length > title.length + 25 ? body : '';
      body = body.replace(/^(中新网|中新社)[^电]{0,20}电\s*(\([^)]*\)|（[^）]*）)?\s*/, '');
      if (seen.has(link)) { const a = seen.get(link); if (a.c === 'xh' && cat !== 'xh') a.c = cat; continue; }
      seen.set(link, { id: link.replace(/\D/g, '').slice(-12), t: title, b: body.slice(0, 600), c: cat, s: '中国新闻网', link, d: isNaN(date) ? Date.now() : date.getTime() });
      n++; added++;
    }
    console.log('ok', name, n);
  } catch (e) { console.log('fail', name, e.message); }
}
const cutoff = Date.now() - 10 * 864e5;
const items = [...seen.values()].filter(a => a.d > cutoff).sort((a, b) => b.d - a.d).slice(0, 400);
fs.mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ updated: Date.now(), items }));
console.log('added', added, 'total', items.length);
