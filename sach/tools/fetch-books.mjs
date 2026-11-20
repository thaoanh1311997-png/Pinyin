// Bánh Mì · 📚 tải sách PDF HỢP PHÁP (phạm vi công cộng / bản quyền mở) về site để đọc ngay trong web.
// Chạy trên GitHub Actions (.github/workflows/sach-books.yml). Ghi: sach/books/**.pdf, sach/data/books.json, sach/data/books-log.txt
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MAX_FILE = 35e6, MAX_TOTAL = 320e6;
const UA = { 'user-agent': 'Mozilla/5.0 (BanhMi study site; book mirror)' };
const log = [];
const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };

const SOURCES = [
  { id: 'mit', group: 'Giáo trình MIT · Learning Chinese', license: 'CC BY-NC-SA 4.0 · MIT OpenCourseWare (Julian Wheatley)', lv: ['so', 'trung'],
    start: 'https://ocw.mit.edu/courses/res-21g-003-learning-chinese-a-foundation-course-in-mandarin-spring-2011/pages/online-textbook/',
    follow: /\/courses\/res-21g-003[^"#?]*\/resources\/[^"#?]+/, max: 40 },
  { id: 'truyen', group: 'Truyện tranh cổ điển (Global Storybooks)', license: 'CC BY 4.0 / CC BY-NC 3.0 · Global Storybooks', lv: ['so'],
    start: 'https://global-asp.github.io/storybooks-classics/stories/zh', follow: /storybooks-classics\/stories\/zh\/[^"#?]+/, max: 45 },
  { id: 'truyen-ca', group: 'Truyện tranh thiếu nhi (Storybooks Canada)', license: 'CC BY 4.0 · Global Storybooks', lv: ['so'],
    start: ['1','2','3','4','5'].map(n => `https://www.storybookscanada.globalstorybooks.net/stories/zh/level${n}/`), follow: /\/stories\/zh\/(?!level)[^"#?]+/, max: 45 },
  { id: 'fsi', group: 'FSI Standard Chinese', license: 'Phạm vi công cộng · US Foreign Service Institute', lv: ['so', 'trung'],
    start: 'https://www.fsi-language-courses.org/fsi-standard-chinese-a-modular-approach/', follow: null, max: 12 }
];

async function get(url, type = 'text') {
  const r = await fetch(url, { headers: UA, redirect: 'follow' });
  if (!r.ok) throw new Error(r.status + ' ' + url);
  return type === 'text' ? await r.text() : r;
}
function hrefs(html, base) {
  const out = []; const re = /href\s*=\s*["']([^"']+)["']/gi; let m;
  while ((m = re.exec(html))) { try { out.push(new URL(m[1].replace(/&amp;/g, '&'), base).href); } catch (e) {} }
  return [...new Set(out)];
}
function titleOf(html) {
  const h = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  return h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').replace(/\s*\|.*$/, '').trim();
}
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'book';

let total = 0; const books = [];
async function grab(src, pdfUrl, title, n) {
  if (books.some(b => b.from === pdfUrl)) return;
  try {
    const r = await get(pdfUrl, 'raw');
    const len = +r.headers.get('content-length') || 0;
    if (len > MAX_FILE) { L('  skip (too big', (len / 1e6).toFixed(1) + 'MB)', pdfUrl); r.body?.cancel?.(); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.slice(0, 4).toString() !== '%PDF') { L('  skip (not pdf)', pdfUrl); return; }
    if (buf.length > MAX_FILE || total + buf.length > MAX_TOTAL) { L('  skip (size cap)', (buf.length / 1e6).toFixed(1) + 'MB', pdfUrl); return; }
    const name = String(n).padStart(2, '0') + '-' + slug(title || path.basename(new URL(pdfUrl).pathname, '.pdf')) + '.pdf';
    const rel = `books/${src.id}/${name}`;
    await fs.mkdir(path.join(ROOT, 'books', src.id), { recursive: true });
    await fs.writeFile(path.join(ROOT, rel), buf);
    total += buf.length;
    books.push({ src: src.id, group: src.group, license: src.license, lv: src.lv, title: title || name, file: rel, bytes: buf.length, from: pdfUrl });
    L('  OK', (buf.length / 1e6).toFixed(2) + 'MB', rel, '<-', pdfUrl);
  } catch (e) { L('  ERR', e.message); }
}

for (const src of SOURCES) {
  L('## ' + src.id);
  let n = 0;
  for (const start of [].concat(src.start)) {
    let html; try { html = await get(start); } catch (e) { L('ERR start', e.message); continue; }
    const links = hrefs(html, start);
    L('links on start page:', links.length);
    for (const u of links.filter(u => /\.pdf(\?|$)/i.test(u))) { if (n >= src.max) break; await grab(src, u, decodeURIComponent(path.basename(new URL(u).pathname, '.pdf')).replace(/[_-]+/g, ' '), ++n); }
    if (!src.follow) continue;
    const pages = links.filter(u => src.follow.test(u) && !/\.pdf(\?|$)/i.test(u));
    L('pages to follow:', pages.length);
    for (const pg of pages) {
      if (n >= src.max) break;
      let h; try { h = await get(pg); } catch (e) { L('ERR page', e.message); continue; }
      const pdfs = hrefs(h, pg).filter(u => /\.pdf(\?|$)/i.test(u));
      if (!pdfs.length) { L('  no pdf on', pg); continue; }
      await grab(src, pdfs[0], titleOf(h), ++n);
    }
  }
}
await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'data/books.json'), JSON.stringify({ updated: new Date().toISOString(), books }, null, 1));
await fs.writeFile(path.join(ROOT, 'data/books-log.txt'), log.join('\n') + `\nTOTAL ${(total / 1e6).toFixed(1)}MB, ${books.length} files\n`);
L('TOTAL', (total / 1e6).toFixed(1) + 'MB', books.length, 'files');
