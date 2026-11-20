// Trà Sữa – extract the main text + photos of a 中国新闻网 article page (used in the browser at read time,
// so the full article is only fetched on the reader's own device, never stored or republished by the site).
(function (root) {
  function dec(s) {
    return s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }).replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
      .replace(/&mdash;/g, '—').replace(/&hellip;/g, '…').replace(/&middot;/g, '·').replace(/&amp;/g, '&');
  }
  function abs(u, base) { try { return new URL(u.replace(/&amp;/g, '&'), base).href; } catch (e) { return ''; } }
  function zone(html) {
    // main content container on chinanews pages (several templates over the years)
    var marks = ['class="left_zw"', "class='left_zw'", 'class="content_desc"', 'class="left-zw"', 'id="content"', 'class="content"', '<article'];
    for (var i = 0; i < marks.length; i++) {
      var k = html.indexOf(marks[i]); if (k < 0) continue;
      var rest = html.slice(k);
      var end = rest.search(/(class=["'](adEditor|left_name|editor|share|pages|keywords|channel)|<\/article>|责任编辑|【编辑)/);
      return end > 200 ? rest.slice(0, end) : rest.slice(0, 60000);
    }
    return '';
  }
  function extract(html, base) {
    var z = zone(html); if (!z) return { paras: [], imgs: [], pos: [] };
    var imgs = [], pos = [], paras = [];
    var re = /<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>|<p[^>]*>([\s\S]*?)<\/p>/gi, m;
    while ((m = re.exec(z))) {
      if (m[1]) {
        var u = m[1];
        if (/\.(jpe?g|png|webp)(\?|$)/i.test(u) && !/logo|icon|ewm|qrcode|erweima|share|weixin|wx_|banner|blank|loading|avatar|btn|\/fileftp\//i.test(u)) { u = abs(u, base); if (u && imgs.indexOf(u) < 0) { imgs.push(u); pos.push(paras.length); } }
        continue;
      }
      var t = dec(m[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t　 ]+/g, ' ').trim();
      if (!t || !/[一-鿿]/.test(t)) continue;
      if (/^(图为|图片来源|\(完\)|（完）|责任编辑|【编辑|来源：|编辑：|作者：)/.test(t) || /摄$/.test(t) && t.length < 40) continue;
      t = t.replace(/^(中新网|中新社)[^电]{0,24}电\s*(\([^)]*\)|（[^）]*）)?\s*/, '').replace(/\s*\(完\)\s*$|\s*（完）\s*$/, '').trim();
      if (t.length < 4) continue;
      if (paras.indexOf(t) < 0) paras.push(t);
    }
    return { paras: paras, imgs: imgs.slice(0, 6), pos: pos.slice(0, 6) };
  }
  function decode(buf) { // chinanews pages are UTF-8; some older ones are GBK
    var u8 = new Uint8Array(buf), head = new TextDecoder('utf-8').decode(u8.slice(0, 3000));
    if (/charset=["']?\s*gb/i.test(head)) { try { return new TextDecoder('gbk').decode(u8); } catch (e) {} }
    return new TextDecoder('utf-8').decode(u8);
  }
  var api = { extract: extract, decode: decode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TSArticle = api;
})(this);
