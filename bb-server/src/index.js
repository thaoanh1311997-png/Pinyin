// Bánh Bao – máy chủ lấy phụ đề YouTube (Cloudflare Worker, miễn phí)
// Dán toàn bộ file này vào Cloudflare Worker rồi bấm Deploy.
// Dùng: https://<tên>.workers.dev/?v=<mã video>

const CLIENTS = [
  { name: 'ANDROID', id: '3', ver: '20.10.38', ua: 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip', extra: { androidSdkVersion: 30, osName: 'Android', osVersion: '11' } },
  { name: 'IOS', id: '5', ver: '20.10.4', ua: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)', extra: { deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82' } },
  { name: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', id: '85', ver: '2.0', ua: 'Mozilla/5.0', extra: {}, embed: true },
  { name: 'WEB', id: '1', ver: '2.20250312.04.00', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0 Safari/537.36', extra: {} },
];

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' };
const json = (o, st = 200, extra = {}) => new Response(JSON.stringify(o), { status: st, headers: { ...CORS, ...extra } });
const cjk = t => (t.match(/[㐀-鿿]/g) || []).length;

async function player(id, c) {
  const body = {
    videoId: id, contentCheckOk: true, racyCheckOk: true,
    context: { client: { clientName: c.name, clientVersion: c.ver, hl: 'zh-CN', gl: 'US', ...c.extra }, ...(c.embed ? { thirdParty: { embedUrl: 'https://www.youtube.com/' } } : {}) },
  };
  const r = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': c.ua, 'X-Youtube-Client-Name': c.id, 'X-Youtube-Client-Version': c.ver, 'Origin': 'https://www.youtube.com' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(c.name + ' ' + r.status);
  return r.json();
}

function parseCaps(txt) {
  txt = (txt || '').trim(); if (!txt) return [];
  if (txt[0] === '{') {
    const j = JSON.parse(txt), out = [];
    for (const ev of j.events || []) {
      if (!ev.segs) continue;
      const t = ev.segs.map(s => s.utf8 || '').join('').replace(/\s*\n\s*/g, ' ').trim(); if (!t) continue;
      const s = (ev.tStartMs || 0) / 1000; out.push([+s.toFixed(2), +(s + (ev.dDurationMs || 3000) / 1000).toFixed(2), t]);
    }
    return out;
  }
  const dec = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
  const out = [];
  let m; const re1 = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
  while ((m = re1.exec(txt))) { const s = +m[1], t = dec(m[3]); if (t) out.push([s, +(s + (+m[2] || 3)).toFixed(2), t]); }
  if (out.length) return out;
  const re2 = /<p t="(\d+)"(?: d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g;
  while ((m = re2.exec(txt))) { const s = +m[1] / 1000, t = dec(m[3]); if (t) out.push([s, +(s + (+m[2] || 3000) / 1000).toFixed(2), t]); }
  return out;
}

async function getTrack(url, ua, tl) {
  const u = new URL(url); u.searchParams.delete('fmt'); u.searchParams.delete('tlang');
  if (tl) u.searchParams.set('tlang', tl);
  for (const fmt of ['json3', '']) {
    if (fmt) u.searchParams.set('fmt', fmt); else u.searchParams.delete('fmt');
    const r = await fetch(u.href, { headers: { 'User-Agent': ua } });
    if (!r.ok) continue;
    const lines = parseCaps(await r.text()); if (lines.length) return lines;
  }
  return [];
}

function pickTracks(tracks) {
  const isZh = t => /^zh/i.test(t.languageCode);
  const zh = tracks.find(t => /^zh-(Hans|CN|SG)/i.test(t.languageCode) && t.kind !== 'asr') || tracks.find(t => isZh(t) && t.kind !== 'asr') || tracks.find(isZh);
  const orig = tracks.find(t => t.kind !== 'asr') || tracks[0];
  return { zh, orig };
}

async function viaPlayer(id, errs) {
  for (const c of CLIENTS) {
    try {
      const pr = await player(id, c);
      const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      const title = pr?.videoDetails?.title || '';
      if (!tracks.length) { errs.push(c.name + ': ' + (pr?.playabilityStatus?.status || 'no captions')); continue; }
      const { zh, orig } = pickTracks(tracks);
      if (zh) { const L = await getTrack(zh.baseUrl, c.ua); if (L.length) return { title, lang: zh.languageCode, via: c.name, lines: L }; }
      const o = await getTrack(orig.baseUrl, c.ua);
      if (o.length && o.filter(l => cjk(l[2])).length >= o.length * 0.5) return { title, lang: orig.languageCode, via: c.name, lines: o };
      const mt = await getTrack(orig.baseUrl, c.ua, 'zh-Hans');
      if (mt.length) { if (mt.length === o.length) mt.forEach((l, i) => { l[3] = o[i][2]; }); return { title, lang: 'zh-Hans', mt: orig.languageCode, via: c.name, lines: mt }; }
      errs.push(c.name + ': empty track');
    } catch (e) { errs.push(String(e.message || e)); }
  }
  return null;
}

function findSegs(o, out = []) {
  if (!o || typeof o !== 'object') return out;
  if (o.transcriptSegmentRenderer) { const s = o.transcriptSegmentRenderer; const t = (s.snippet?.runs || []).map(r => r.text).join('').replace(/\s+/g, ' ').trim(); if (t) out.push([+s.startMs / 1000, +s.endMs / 1000, t]); return out; }
  for (const k in o) findSegs(o[k], out);
  return out;
}
// The transcript panel (same data the "Show transcript" button uses) does not need a PO token.
const WEB_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
function grab(html, re) { const m = html.match(re); return m ? m[1] : ''; }
function langItems(o, out = []) {
  if (!o || typeof o !== 'object') return out;
  if (o.title && o.continuation && o.continuation.reloadContinuationData) out.push({ title: o.title, params: o.continuation.reloadContinuationData.continuation, selected: !!o.selected });
  for (const k in o) langItems(o[k], out);
  return out;
}
async function transcriptCall(params, ver, vis) {
  const r = await fetch('https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': WEB_UA, 'Origin': 'https://www.youtube.com', 'Referer': 'https://www.youtube.com/', 'X-Youtube-Client-Name': '1', 'X-Youtube-Client-Version': ver, ...(vis ? { 'X-Goog-Visitor-Id': vis } : {}) },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: ver, hl: 'zh-CN', gl: 'US', visitorData: vis || undefined } }, params }),
  });
  if (!r.ok) throw new Error('transcript ' + r.status);
  return r.json();
}
async function viaTranscript(id, errs) {
  try {
    const r = await fetch('https://www.youtube.com/watch?v=' + id + '&hl=zh-CN&bpctr=9999999999&has_verified=1', {
      headers: { 'User-Agent': WEB_UA, 'Accept-Language': 'zh-CN,zh;q=0.9,vi;q=0.8,en;q=0.7', 'Cookie': 'CONSENT=YES+cb; SOCS=CAI' },
    });
    const html = await r.text();
    const ver = grab(html, /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || '2.20250312.04.00';
    const vis = grab(html, /"VISITOR_DATA":"([^"]+)"/);
    const title = grab(html, /<meta name="title" content="([^"]*)"/);
    const params = [...html.matchAll(/"getTranscriptEndpoint":\{"params":"([^"]+)"/g)].map(m => m[1]);
    if (!params.length) { errs.push('watch page: no transcript (' + r.status + (/confirm you.re not a bot|unusual traffic/i.test(html) ? ', bot check' : '') + ')'); return null; }
    let j = await transcriptCall(params[0], ver, vis);
    let L = findSegs(j);
    // switch to a Chinese transcript if the default one is another language
    if (!L.some(l => cjk(l[2]))) {
      const zh = langItems(j).find(x => /中文|Chinese|Trung|漢語|汉语/i.test(x.title));
      if (zh && !zh.selected) { try { j = await transcriptCall(zh.params, ver, vis); const Z = findSegs(j); if (Z.length) L = Z; } catch (e) { errs.push('zh switch ' + (e.message || e)); } }
    }
    if (L.length) return { title, lang: L.some(l => cjk(l[2])) ? 'zh' : '?', via: 'transcript', lines: L };
    errs.push('transcript empty');
  } catch (e) { errs.push(String(e.message || e)); }
  return null;
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const id = (url.searchParams.get('v') || '').trim();
    if (!/^[\w-]{11}$/.test(id)) return json({ ok: true, hello: 'Bánh Bao caption server. Use ?v=VIDEO_ID' });
    const cache = caches.default, key = new Request('https://bb-cache/' + id + '/v4');
    const hit = await cache.match(key); if (hit) return hit;
    const errs = [];
    let res = await viaPlayer(id, errs);
    if (!res || res.mt) { const t = await viaTranscript(id, errs); if (t && (!res || t.lines.some(l => cjk(l[2])))) res = t; }
    if (!res) return json({ ok: false, errors: errs }, 200);
    const resp = json({ ok: true, ...res }, 200, { 'Cache-Control': 'public, max-age=86400' });
    ctx.waitUntil(cache.put(key, resp.clone()));
    return resp;
  },
};
