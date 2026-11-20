// Deploy-time only: download each article photo as a small thumbnail into trasua/data/img/<id>.jpg
// (not committed to git; it goes into the Pages artifact), so the site never hotlinks the publisher.
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const dir = new URL('../data/img/', import.meta.url); fs.mkdirSync(dir, { recursive: true });
const items = JSON.parse(fs.readFileSync(new URL('../data/news.json', import.meta.url), 'utf8')).items.filter(a => a.img);
let hasMagick = false; try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); hasMagick = true; } catch (e) {}
let ok = 0;
for (let i = 0; i < items.length; i += 8) {
  await Promise.all(items.slice(i, i + 8).map(async a => {
    const out = new URL(a.id + '.jpg', dir);
    try {
      const r = await fetch(a.img, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: a.link }, signal: AbortSignal.timeout(15000) });
      if (!r.ok || !/image/.test(r.headers.get('content-type') || '')) return;
      const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 3000) return;
      const tmp = out.pathname + '.src'; fs.writeFileSync(tmp, buf);
      if (hasMagick) { execFileSync('convert', [tmp + '[0]', '-auto-orient', '-resize', '720x>', '-strip', '-quality', '72', out.pathname]); fs.unlinkSync(tmp); }
      else fs.renameSync(tmp, out.pathname);
      ok++;
    } catch (e) {}
  }));
}
fs.writeFileSync(new URL('index.json', dir), JSON.stringify(fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).map(f => f.replace('.jpg', ''))));
console.log('thumbs', ok, '/', items.length, hasMagick ? '(resized)' : '');
