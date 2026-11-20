// Daily: find new Chinese-learning videos on YouTube (only ones with subtitles/CC), sort them into HSK1–6,
// and keep a rolling list in video/data/ytlib.json for the "Video YouTube theo cấp" rows. No API key needed.
import fs from 'node:fs';
const OUT = new URL('../data/ytlib.json', import.meta.url);
const KEEP = 40; // per level
const QUERIES = {
  1: ['HSK1 中文 故事', 'HSK 1 Chinese story beginner', 'HSK1 listening practice Chinese'],
  2: ['HSK2 中文 故事', 'HSK 2 Chinese story', 'HSK2 listening practice Chinese'],
  3: ['HSK3 中文 故事', 'HSK 3 Chinese story listening', 'HSK3 Chinese podcast'],
  4: ['HSK4 中文 播客', 'HSK 4 Chinese podcast', 'HSK4 Chinese story listening'],
  5: ['HSK5 中文 播客', 'HSK 5 Chinese podcast', 'HSK5 Chinese listening'],
  6: ['HSK6 中文 播客', 'HSK 6 advanced Chinese podcast', 'HSK6 Chinese listening'],
};
// search filter: type=video + has subtitles/CC (+ uploaded this year when FRESH)
const SP_CC = 'EgQQASgB';      // video, subtitles
const SP_CC_YEAR = 'EgYIBRABKAE='; // this year, video, subtitles
const H = { 'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', cookie: 'CONSENT=YES+1; SOCS=CAI' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function walk(o, out) {
  if (!o || typeof o !== 'object') return;
  if (o.videoRenderer) out.push(o.videoRenderer);
  for (const k in o) walk(o[k], out);
}
const txt = t => t ? (t.simpleText || (t.runs || []).map(r => r.text).join('')) : '';
const secs = s => s.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);

async function search(q, sp) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=' + encodeURIComponent(sp) + '&hl=zh-CN', { headers: H });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const html = await r.text();
  const m = html.match(/var ytInitialData\s*=\s*(\{.+?\});<\/script>/s) || html.match(/ytInitialData"\]\s*=\s*(\{.+?\});/s);
  if (!m) throw new Error('no ytInitialData (' + html.length + ' bytes)');
  const vr = []; walk(JSON.parse(m[1]), vr);
  return vr.map(v => ({ id: v.videoId, title: txt(v.title), dur: txt(v.lengthText), ch: txt(v.ownerText), badges: JSON.stringify(v.badges || '') + JSON.stringify(v.ownerBadges || '') }));
}
const BAD = /vocabulary|vocab|单词|生词表|flash ?cards?|words? list|\b\d{3,4} words|full course|完整课程|live|直播|#shorts|test answers|真题答案|mock test/i;
function levelOf(title, qlv) {
  const m = title.match(/HSK\s*([1-6])(?:\s*[-–~～到至+]\s*(?:HSK\s*)?([1-6]))?/i);
  if (!m) return qlv;
  const a = +m[1], b = m[2] ? +m[2] : a;
  return Math.min(6, Math.max(1, Math.round((a + b) / 2 - 0.01))); // "HSK1-2" -> 1, "HSK3-4" -> 3, "HSK 4~6" -> 5
}
function tagOf(t, ch) {
  const s = (t + ' ' + ch).toLowerCase();
  if (/song|歌|music|lyrics/.test(s)) return 'Bài hát';
  if (/peppa|佩奇|cartoon|动画|anime|卡通/.test(s)) return 'Hoạt hình';
  if (/podcast|播客|电台/.test(s)) return 'Podcast';
  if (/vlog/.test(s)) return 'Vlog';
  if (/interview|采访|street/.test(s)) return 'Phỏng vấn';
  if (/story|stories|故事|童话|tale/.test(s)) return 'Truyện';
  return 'Luyện nghe';
}

const old = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { items: [] };
const known = new Set(old.items.map(x => x.id));
const today = new Date().toISOString().slice(0, 10);
const fresh = []; let ok = 0, fail = 0;
for (const lv of [1, 2, 3, 4, 5, 6]) {
  for (const q of QUERIES[lv]) {
    for (const sp of [SP_CC_YEAR, SP_CC]) {
      try {
        const res = await search(q, sp); ok++;
        let n = 0;
        for (const v of res) {
          if (!v.id || known.has(v.id) || !v.dur) continue;
          const d = secs(v.dur);
          if (d < 90 || d > 40 * 60) continue;           // skip shorts and very long streams
          if (BAD.test(v.title)) continue;
          if (!/[一-鿿]|chinese|mandarin|hsk|中文|汉语/i.test(v.title)) continue;
          known.add(v.id);
          fresh.push({ id: v.id, lv: levelOf(v.title, lv), tag: tagOf(v.title, v.ch), title: v.title.slice(0, 120), dur: v.dur, ch: v.ch.slice(0, 60), added: today });
          if (++n >= 4) break; // a few per query keeps every level varied
        }
      } catch (e) { fail++; console.warn('search failed', q, e.message); }
      await sleep(1200);
    }
  }
}
console.log('searches ok', ok, 'failed', fail, 'new videos', fresh.length);
if (!ok) { console.error('YouTube search unreachable, keeping old list'); process.exit(0); }
const all = [...fresh, ...old.items];
const items = [];
for (const lv of [1, 2, 3, 4, 5, 6]) items.push(...all.filter(x => x.lv === lv).slice(0, KEEP));
fs.mkdirSync(new URL('../data/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ updated: today, items }, null, 0) + '\n');
for (const lv of [1, 2, 3, 4, 5, 6]) console.log('HSK' + lv, items.filter(x => x.lv === lv).length, fresh.filter(x => x.lv === lv).map(x => x.title).slice(0, 3));
