// Download free-licensed lead photos from Wikipedia/Wikimedia Commons for flashcards.
// tools/photos.json: { word: "Wikipedia title" or "File:Name.jpg" }. Output: img/p/<slug>.jpg + data/photo-credits.json
// Batched API calls (50 titles each) + slow, retrying downloads so Wikimedia does not rate-limit us.
import fs from 'node:fs';
const dir = new URL('../', import.meta.url);
const map = JSON.parse(fs.readFileSync(new URL('tools/photos.json', dir)));
const credFile = new URL('data/photo-credits.json', dir);
let cred = {}; try { cred = JSON.parse(fs.readFileSync(credFile)); } catch {}
const UA = { 'user-agent': 'XiuMaiKidsFlashcards/1.1 (educational, non-commercial; https://github.com/thaoanh1311997-png/Pinyin)' };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
async function get(u, tries = 6) {
  for (let i = 0; ; i++) {
    const r = await fetch(u, { headers: UA });
    if (r.ok) return r;
    if ((r.status === 429 || r.status >= 500) && i < tries) { const w = (+r.headers.get('retry-after') || 0) * 1000 || 4000 * 2 ** i; console.log('wait', r.status, w); await sleep(w); continue; }
    throw new Error(r.status + ' ' + u);
  }
}
const j = async u => (await get(u)).json();
const chunks = (a, n) => a.length ? [a.slice(0, n), ...chunks(a.slice(n), n)] : [];
const force = process.env.FORCE ? process.env.FORCE.split(',') : null;
const todo = Object.entries(map).filter(([w, t]) => !(fs.existsSync(new URL(`img/p/${slug(w)}.jpg`, dir)) && cred[w] && cred[w].src === t) || (force && force.includes(w)));
console.log('todo', todo.length);
// 1) article title -> lead free image file name
const fileOf = {};
for (const [w, t] of todo) if (t.startsWith('File:')) fileOf[w] = t.slice(5);
const arts = todo.filter(([, t]) => !t.startsWith('File:'));
for (const part of chunks(arts, 50)) {
  const q = await j(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=name&pilicense=free&redirects=1&format=json&formatversion=2&titles=${encodeURIComponent(part.map(x => x[1]).join('|'))}`);
  const norm = {}; for (const n of [...(q.query.normalized || []), ...(q.query.redirects || [])]) norm[n.from] = n.to;
  const res = t => { let x = t; for (let k = 0; k < 3 && norm[x]; k++) x = norm[x]; return x; };
  const byTitle = Object.fromEntries(q.query.pages.map(p => [p.title, p.pageimage]));
  for (const [w, t] of part) { const f = byTitle[res(t)]; if (f) fileOf[w] = f; else console.log('NO IMAGE', w, t); }
  await sleep(1500);
}
// 2) file -> commons thumb url + license
const info = {};
const files = [...new Set(Object.values(fileOf))];
for (const part of chunks(files, 50)) {
  const c = await j(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640&format=json&formatversion=2&titles=${encodeURIComponent(part.map(f => 'File:' + f).join('|'))}`);
  const norm = {}; for (const n of c.query.normalized || []) norm[n.to] = n.from;
  for (const p of c.query.pages) { const ii = p.imageinfo && p.imageinfo[0]; if (ii) info[(norm[p.title] || p.title).replace(/^File:/, '')] = ii; }
  await sleep(1500);
}
// 3) download
let ok = 0;
for (const [w, f] of Object.entries(fileOf)) {
  const ii = info[f]; if (!ii) { console.log('NOT ON COMMONS', w, f); continue; }
  const m = ii.extmetadata || {}; const lic = strip(m.LicenseShortName && m.LicenseShortName.value);
  if (/fair use|non-free/i.test(lic)) { console.log('NON-FREE', w, f); continue; }
  try {
    const img = await get(ii.thumburl);
    fs.writeFileSync(new URL(`img/p/${slug(w)}.jpg`, dir), Buffer.from(await img.arrayBuffer()));
    cred[w] = { src: map[w], file: f, page: ii.descriptionurl, author: strip(m.Artist && m.Artist.value).slice(0, 120), license: lic };
    ok++; console.log('ok', w, f, lic);
    fs.writeFileSync(credFile, JSON.stringify(cred, null, 1));
  } catch (e) { console.log('FAIL', w, e.message); }
  await sleep(1200);
}
fs.writeFileSync(credFile, JSON.stringify(cred, null, 1));
console.log('downloaded', ok);
