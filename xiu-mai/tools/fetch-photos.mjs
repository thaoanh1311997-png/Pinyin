// Download free-licensed lead photos from Wikipedia/Wikimedia Commons for flashcards.
// tools/photos.json: { word: "Wikipedia title" or "File:Name.jpg" }. Output: img/p/<slug>.jpg + data/photo-credits.json
import fs from 'node:fs';
const dir = new URL('../', import.meta.url);
const map = JSON.parse(fs.readFileSync(new URL('tools/photos.json', dir)));
const credFile = new URL('data/photo-credits.json', dir);
let cred = {}; try { cred = JSON.parse(fs.readFileSync(credFile)); } catch {}
const UA = { 'user-agent': 'XiuMaiKidsFlashcards/1.0 (educational, non-commercial; github.com/thaoanh1311997-png/Pinyin)' };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
async function j(u) { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.json(); }
const force = process.env.FORCE ? process.env.FORCE.split(',') : null;
for (const [word, title] of Object.entries(map)) {
  const s = slug(word), out = new URL(`img/p/${s}.jpg`, dir);
  const same = cred[word] && cred[word].src === title;
  if (fs.existsSync(out) && same && !(force && force.includes(word))) continue;
  try {
    let file;
    if (title.startsWith('File:')) file = title.slice(5);
    else {
      const q = await j(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=name&pilicense=free&redirects=1&format=json&titles=${encodeURIComponent(title)}`);
      const p = Object.values(q.query.pages)[0]; file = p.pageimage;
      if (!file) { console.log('NO IMAGE', word, title); continue; }
    }
    const c = await j(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=640&format=json&titles=${encodeURIComponent('File:' + file)}`);
    const pg = Object.values(c.query.pages)[0]; const ii = pg.imageinfo && pg.imageinfo[0];
    if (!ii) { console.log('NOT ON COMMONS', word, file); continue; }
    const m = ii.extmetadata || {}; const lic = strip(m.LicenseShortName && m.LicenseShortName.value);
    if (/fair use|non-free/i.test(lic)) { console.log('NON-FREE', word, file); continue; }
    const img = await fetch(ii.thumburl, { headers: UA }); if (!img.ok) throw new Error('img ' + img.status);
    fs.writeFileSync(out, Buffer.from(await img.arrayBuffer()));
    cred[word] = { src: title, file, page: ii.descriptionurl, author: strip(m.Artist && m.Artist.value).slice(0, 120), license: lic };
    console.log('ok', word, file, lic);
  } catch (e) { console.log('FAIL', word, e.message); }
  await sleep(400);
}
fs.writeFileSync(credFile, JSON.stringify(cred, null, 1));
