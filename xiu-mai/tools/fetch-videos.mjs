// Xíu Mại: daily list of toddler English videos from hand-picked channels (no API key).
// Writes xiu-mai/data/videos.json. Run by .github/workflows/xiu-mai-videos.yml
import fs from 'node:fs';
const OUT = new URL('../data/videos.json', import.meta.url);
const CH = [
  // cat: song = Bài hát, learn = Học từ vựng, play = Vui chơi & truyện
  { key: 'supersimple', name: 'Super Simple Songs', cat: 'song', age: '2+', handles: ['SuperSimpleSongs'], vi: 'Bài hát thiếu nhi chậm, dễ hát theo' },
  { key: 'msrachel', name: 'Ms Rachel', cat: 'learn', age: '1-4', handles: ['msrachel', 'MsRachel'], vi: 'Cô Rachel dạy nói chữ đầu tiên, cực hợp bé 2 tuổi' },
  { key: 'cocomelon', name: 'CoComelon', cat: 'song', age: '2+', handles: ['CoComelon', 'cocomelon'], vi: 'Bài hát sinh hoạt hằng ngày' },
  { key: 'pinkfong', name: 'Pinkfong', cat: 'song', age: '2+', handles: ['Pinkfong', 'pinkfong', 'PinkfongBabyShark'], vi: 'Baby Shark và bài hát con vật' },
  { key: 'littlebabybum', name: 'Little Baby Bum', cat: 'song', age: '1-3', handles: ['LittleBabyBum'], vi: 'Bài hát ru, đồng dao' },
  { key: 'bouncepatrol', name: 'Bounce Patrol', cat: 'song', age: '2+', handles: ['BouncePatrol', 'bouncepatrolkids'], vi: 'Hát và nhảy vận động' },
  { key: 'daveandava', name: 'Dave and Ava', cat: 'song', age: '2+', handles: ['DaveandAva', 'DaveAndAva'], vi: 'Đồng dao hoạt hình dễ thương' },
  { key: 'dreamenglish', name: 'Dream English Kids', cat: 'learn', age: '3+', handles: ['DreamEnglishKids', 'dreamenglishkids'], vi: 'Bài hát dạy từ vựng tiếng Anh' },
  { key: 'mapleleaf', name: 'Maple Leaf Learning', cat: 'learn', age: '2+', handles: ['MapleLeafLearning', 'mapleleaflearning'], vi: 'Từ vựng theo chủ đề, câu ngắn' },
  { key: 'blippi', name: 'Blippi', cat: 'learn', age: '2+', handles: ['Blippi', 'blippi'], vi: 'Đi khám phá: xe cộ, màu sắc, con vật' },
  { key: 'sesame', name: 'Sesame Street', cat: 'learn', age: '2+', handles: ['SesameStreet', 'sesamestreet'], vi: 'Elmo dạy chữ, số, cảm xúc' },
  { key: 'numberblocks', name: 'Numberblocks', cat: 'learn', age: '3+', handles: ['Numberblocks', 'numberblocks'], vi: 'Học đếm số' },
  { key: 'peppa', name: 'Peppa Pig', cat: 'play', age: '2+', handles: ['PeppaPigOfficial', 'peppapig', 'PeppaPig'], vi: 'Truyện ngắn đời thường, giọng Anh' },
  { key: 'heyduggee', name: 'Hey Duggee', cat: 'play', age: '2+', handles: ['HeyDuggeeOfficial', 'heyduggee'], vi: 'Hoạt hình vui, câu đơn giản' },
  { key: 'pocoyo', name: 'Pocoyo', cat: 'play', age: '2+', handles: ['PocoyoEnglish', 'Pocoyo'], vi: 'Hoạt hình chậm, ít chữ, hợp bé nhỏ' },
  { key: 'supersimpleplay', name: 'Super Simple Play', cat: 'play', age: '2+', handles: ['SuperSimplePlay', 'supersimpleplay'], vi: 'Trò chơi, đồ chơi bằng tiếng Anh' },
];
const H = { 'accept-language': 'en-US,en;q=0.9', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', cookie: 'CONSENT=YES+1; SOCS=CAI' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const txt = t => t ? (t.simpleText || t.content || (t.runs || []).map(r => r.text).join('')) : '';
function walk(o, out) {
  if (!o || typeof o !== 'object') return;
  if (o.videoRenderer) { const v = o.videoRenderer; out.push({ id: v.videoId, t: txt(v.title), d: txt(v.lengthText), views: txt(v.viewCountText) }); }
  if (o.lockupViewModel && o.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
    const l = o.lockupViewModel; let d = '';
    JSON.stringify(l).replace(/"text":"(\d{1,2}:\d{2}(?::\d{2})?)"/, (_, x) => { d = x; });
    out.push({ id: l.contentId, t: txt(l.metadata?.lockupMetadataViewModel?.title), d });
  }
  for (const k in o) walk(o[k], out);
}
const secs = s => (s || '').split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
async function get(url) { const r = await fetch(url, { headers: H }); if (!r.ok) throw new Error(r.status + ' ' + url); return r.text(); }
async function channel(c) {
  for (const h of c.handles) {
    try {
      const html = await get(`https://www.youtube.com/@${h}/videos`);
      const id = (html.match(/"externalId":"(UC[\w-]{22})"/) || html.match(/channel_id=(UC[\w-]{22})/) || [])[1];
      if (!id) continue;
      const title = (html.match(/<meta property="og:title" content="([^"]+)"/) || [])[1] || c.name;
      let vids = [];
      const m = html.match(/var ytInitialData\s*=\s*(\{.+?\});<\/script>/s);
      if (m) walk(JSON.parse(m[1]), vids);
      if (vids.length < 5) { // RSS fallback
        const x = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
        vids = [...x.matchAll(/<yt:videoId>([\w-]{11})<\/yt:videoId>[\s\S]*?<title>([^<]*)<\/title>/g)].map(a => ({ id: a[1], t: a[2].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), d: '' }));
      }
      const seen = new Set();
      vids = vids.filter(v => v.id && !seen.has(v.id) && seen.add(v.id) && !/#shorts|live/i.test(v.t) && (!v.d || (secs(v.d) >= 60 && secs(v.d) <= 3 * 3600)));
      return { ...c, handle: h, id, title, videos: vids.slice(0, 24).map(v => ({ id: v.id, t: v.t, d: v.d })) };
    } catch (e) { console.log('fail', c.key, h, e.message); }
    await sleep(1500);
  }
  return null;
}
let old = {}; try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const out = { updated: new Date().toISOString(), channels: [] };
for (const c of CH) {
  const r = await channel(c);
  if (r && r.videos.length) { out.channels.push(r); console.log('ok', c.key, r.handle, r.id, r.videos.length); }
  else { const o = (old.channels || []).find(x => x.key === c.key); if (o) out.channels.push(o); console.log('keep-old', c.key, !!o); }
  await sleep(2500);
}
if (out.channels.length) fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
