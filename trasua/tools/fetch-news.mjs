// Fetches Chinese news headlines + lead paragraphs from public RSS feeds (feed-reader style:
// only what the publisher puts in its RSS, always with a link to the original article).
// Runs in GitHub Actions (browsers cannot read these feeds directly because of CORS).
import fs from 'node:fs';
const OUT = new URL('../data/news.json', import.meta.url);
const FEEDS = [ // [category, name, url, source] – feeds that fail are skipped and logged
  ['xh', 'society', 'https://www.chinanews.com.cn/rss/society.xml', '中国新闻网'],
  ['tn', 'china', 'https://www.chinanews.com.cn/rss/china.xml', '中国新闻网'],
  ['qt', 'world', 'https://www.chinanews.com.cn/rss/world.xml', '中国新闻网'],
  ['kt', 'finance', 'https://www.chinanews.com.cn/rss/finance.xml', '中国新闻网'],
  ['vh', 'culture', 'https://www.chinanews.com.cn/rss/culture.xml', '中国新闻网'],
  ['tt', 'sports', 'https://www.chinanews.com.cn/rss/sports.xml', '中国新闻网'],
  ['sk', 'health', 'https://www.chinanews.com.cn/rss/health.xml', '中国新闻网'],
  ['cn', 'it', 'https://www.chinanews.com.cn/rss/it.xml', '中国新闻网'],
  ['gd', 'edu', 'https://www.chinanews.com.cn/rss/edu.xml', '中国新闻网'],
  ['xh', 'scroll-news', 'https://www.chinanews.com.cn/rss/scroll-news.xml', '中国新闻网'],
  ['xh', 'importnews', 'https://www.chinanews.com.cn/rss/importnews.xml', '中国新闻网'],
  ['xh', 'life', 'https://www.chinanews.com.cn/rss/life.xml', '中国新闻网'],
  ['kt', 'auto', 'https://www.chinanews.com.cn/rss/auto.xml', '中国新闻网'],
  ['kt', 'house', 'https://www.chinanews.com.cn/rss/house.xml', '中国新闻网'],
  ['kt', 'energy', 'https://www.chinanews.com.cn/rss/energy.xml', '中国新闻网'],
  ['tn', 'hmt', 'https://www.chinanews.com.cn/rss/hmt.xml', '中国新闻网'],
  ['tn', 'taiwan', 'https://www.chinanews.com.cn/rss/taiwan.xml', '中国新闻网'],
  ['tn', 'huaren', 'https://www.chinanews.com.cn/rss/huaren.xml', '中国新闻网'],
  ['vh', 'ent', 'https://www.chinanews.com.cn/rss/ent.xml', '中国新闻网'],
  ['cn', 'tech', 'https://www.chinanews.com.cn/rss/tech.xml', '中国新闻网'],
  ['sk', 'life-health', 'https://www.chinanews.com.cn/rss/life-health.xml', '中国新闻网'],
  ['qt', 'bbc', 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', 'BBC中文'],
  ['qt', 'dw', 'https://rss.dw.com/rdf/rss-chi-all', 'DW中文'],
  ['qt', 'rfi', 'https://www.rfi.fr/cn/rss', 'RFI中文'],
  ['xh', 'people-society', 'http://www.people.com.cn/rss/society.xml', '人民网'],
  ['tn', 'people-politics', 'http://www.people.com.cn/rss/politics.xml', '人民网'],
  ['qt', 'people-world', 'http://www.people.com.cn/rss/world.xml', '人民网'],
  ['kt', 'people-finance', 'http://www.people.com.cn/rss/finance.xml', '人民网'],
  ['gd', 'people-edu', 'http://www.people.com.cn/rss/edu.xml', '人民网'],
  ['vh', 'people-culture', 'http://www.people.com.cn/rss/culture.xml', '人民网'],
  ['tt', 'people-sports', 'http://www.people.com.cn/rss/sports.xml', '人民网'],
  ['sk', 'people-health', 'http://www.people.com.cn/rss/health.xml', '人民网'],
];
const dec = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const strip = s => dec(s).replace(/<[^>]+>/g, '').replace(/[　\s]+/g, ' ').trim();
const tag = (x, t) => { const m = x.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? m[1] : ''; };
// photo of the article: first photo inside the article body (same extractor the reader uses).
// og:image / RSS images are a generic chinanews logo, so they are not used.
import { createRequire } from 'node:module';
const { extract } = createRequire(import.meta.url)('../lib/article.js');
const pickImg = (html, base) => { try { return extract(html, base).imgs[0] || ''; } catch (e) { return ''; } };
let old = [];
try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')).items || []; } catch (e) {}
for (const a of old) if (a.img && /\/fileftp\//.test(a.img)) delete a.img; // old runs stored the site logo: look again
const seen = new Map(old.map(a => [a.link, a]));
let added = 0;
const decodeBuf = buf => { const head = buf.slice(0, 300).toString('latin1'); return /encoding=["']?(gb2312|gbk|gb18030)/i.test(head) ? new TextDecoder('gbk').decode(buf) : buf.toString('utf8'); };
const mkId = link => { const d = link.replace(/\D/g, ''); if (d.length >= 8) return d.slice(-12); let h = 0; for (const ch of link) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return 'h' + h; };
for (const [cat, name, url, src] of FEEDS) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (news reader for Chinese learners)' }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) { console.log('skip', name, r.status); continue; }
    const xml = decodeBuf(Buffer.from(await r.arrayBuffer())); let n = 0;
    for (const it of xml.split(/<item[ >\n]/).slice(1)) {
      const title = strip(tag(it, 'title')), link = strip(tag(it, 'link'));
      const rawDesc = dec(tag(it, 'description'));
      let body = strip(tag(it, 'description'));
      const date = new Date(strip(tag(it, 'pubDate')) || strip(tag(it, 'dc:date')) || Date.now());
      if (!title || !link || !/[一-鿿]/.test(title)) continue;
      if (body.replace(/\s/g, '') === title.replace(/\s/g, '') || body.includes('题：' + title)) body = body.length > title.length + 25 ? body : '';
      body = body.replace(/^(中新网|中新社)[^电]{0,20}电\s*(\([^)]*\)|（[^）]*）)?\s*/, '');
      { const seenS = new Set(); body = body.replace(/\s*[^。！？]*?[\u4e00-\u9fff]{1,4}\s*摄\s*/g, '。').split(/(?<=[。！？])/).map(x => x.trim()).filter(x => x && x !== '。' && !/^图为/.test(x) && !seenS.has(x) && seenS.add(x)).join(''); }
      if (body.length < 30) continue;
      if (seen.has(link)) { const a = seen.get(link); if (a.c === 'xh' && cat !== 'xh') a.c = cat; continue; }
      seen.set(link, { id: mkId(link), t: title, b: body.slice(0, 600), c: cat, s: src, link, d: isNaN(date) ? Date.now() : date.getTime() });
      n++; added++;
    }
    console.log('ok', name, n);
  } catch (e) { console.log('fail', name, e.message); }
}
// look up photos on article pages for items that don't have one yet (a few at a time, polite)
{
  const todo = [...seen.values()].filter(a => a.img === undefined && a.d > Date.now() - 30 * 864e5).sort((a, b) => b.d - a.d).slice(0, 160);
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
const cutoff = Date.now() - 30 * 864e5; // keep a month of news
const items = [...seen.values()].filter(a => a.d > cutoff).sort((a, b) => b.d - a.d).slice(0, 1200);
fs.mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ updated: Date.now(), items }));
console.log('added', added, 'total', items.length);
