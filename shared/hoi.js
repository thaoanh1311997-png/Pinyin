/* Bánh Mì · nút góc màn hình trên mọi trang: 🔍 Tra từ nhanh + 💬 Hỏi đáp tiếng Trung (AI).
   Được nav.js gắn vào. Dữ liệu: ../dict.txt (CVDICT, đủ mọi cách đọc) + trasua/data/vocab.json (cấp HSK).
   Phát âm: chữ đơn = file người đọc đúng thanh (audio/py), từ/câu = shared/voice.js. Pinyin trong câu trả lời AI
   do pinyin-pro (trasua/lib) tự thêm, không để AI tự viết. Lưu trên máy: bm.hoi.chat, bm.tra.recent, bm.hoi.tab, bm.fab.pos. */
(function () {
  if (window.__BM_HOI || !document.body) return; window.__BM_HOI = 1;
  var me = document.currentScript;
  var BASE = window.BM_BASE || new URL('../', me ? me.src : location.href).href;
  var HAN = /[\u3400-\u9fff\uf900-\ufaff]/, HANS = /[\u3400-\u9fff\uf900-\ufaff]+/g;
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lg(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ls(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function sg(k, d) { try { var v = sessionStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function ss(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function loadScript(src) {
    return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }

  /* ======================= giao diện ======================= */
  var CSS = '' +
    '#bm-hoi{--h-bg:#FFF7EC;--h-card:#fff;--h-ink:#3B2414;--h-mut:#8A6A55;--h-line:#F0E1CF;--h-acc:#F08A24;--h-acc2:#FFC861;--h-soft:#FFF0DC;--h-u:#FFE2C2;--h-red:#D9443A;--h-zh:"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC",sans-serif;font-family:Nunito,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--h-ink);-webkit-text-size-adjust:100%;line-height:1.45}' +
    '#bm-hoi.dark{--h-bg:#1B1410;--h-card:#2A201A;--h-ink:#F6E9DA;--h-mut:#C4A992;--h-line:#3F3128;--h-soft:#33271F;--h-u:#4A3424;--h-red:#FF7B6E}' +
    '#bm-hoi *{box-sizing:border-box}' +
    '#bm-hoi button{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}' +
    /* nút tròn */
    '#bm-hoi .hf{position:fixed;z-index:48;right:16px;bottom:18px;width:58px;height:58px;border-radius:50%;border:0;padding:0;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;' +
    'background:radial-gradient(circle at 35% 30%,#FFE3A8,#FFB65C 55%,#F08A24);box-shadow:0 3px 0 rgba(160,80,10,.25),0 10px 24px -8px rgba(150,70,10,.55);display:grid;place-items:center;transition:bottom .28s cubic-bezier(.3,1.2,.5,1),left .2s,right .2s,transform .15s,opacity .2s}' +
    '#bm-hoi .hf:active{transform:scale(.92)}' +
    '#bm-hoi .hf.drag{transition:none;transform:scale(1.08);box-shadow:0 14px 30px -8px rgba(150,70,10,.6)}' +
    '#bm-hoi .hf img{width:46px;height:43px;margin-top:4px;pointer-events:none}' +
    '#bm-hoi .hf .bd{position:absolute;right:-3px;top:-3px;width:24px;height:24px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 2px 6px rgba(120,60,20,.35)}' +
    '#bm-hoi .hf .bd svg{width:14px;height:14px;stroke:#E4572E;stroke-width:3;fill:none;stroke-linecap:round}' +
    '#bm-hoi .hf.gone{opacity:0;pointer-events:none;transform:scale(.6)}' +
    '#bm-hoi .tip{position:fixed;z-index:48;background:#3B2414;color:#fff;font-weight:800;font-size:13px;padding:7px 12px;border-radius:12px;white-space:nowrap;box-shadow:0 6px 16px -6px rgba(0,0,0,.4);opacity:0;transform:translateY(6px);transition:.3s;pointer-events:none}' +
    '#bm-hoi .tip.on{opacity:1;transform:none}' +
    /* khung */
    '#bm-hoi .bk{position:fixed;inset:0;z-index:2147481000;background:rgba(40,20,5,.32);opacity:0;transition:opacity .2s;display:none}' +
    '#bm-hoi .pn{position:fixed;z-index:2147481001;display:none;flex-direction:column;background:var(--h-bg);overflow:hidden;box-shadow:0 20px 60px -14px rgba(80,35,5,.5),0 0 0 1px var(--h-line)}' +
    '#bm-hoi.open .pn{display:flex;animation:bmHoiIn .26s cubic-bezier(.2,.9,.3,1.1)}' +
    '@keyframes bmHoiIn{from{opacity:0;transform:translateY(24px) scale(.98)}}' +
    '@media (max-width:699px){#bm-hoi.open .bk{display:block;opacity:1}#bm-hoi .pn{left:0;right:0;bottom:0;height:82vh;border-radius:24px 24px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}' +
    '@media (min-width:700px){#bm-hoi .pn{width:410px;height:min(660px,calc(100vh - 96px));bottom:18px;right:18px;border-radius:24px}#bm-hoi .pn.l{right:auto;left:18px}}' +
    '#bm-hoi .hd{flex:none;display:flex;align-items:center;gap:8px;padding:10px 10px 8px 12px;background:linear-gradient(180deg,var(--h-soft),var(--h-bg))}' +
    '#bm-hoi .hd img{width:34px;height:32px;flex:none}' +
    '#bm-hoi .tabs{flex:1;display:flex;background:var(--h-card);border-radius:999px;padding:3px;box-shadow:inset 0 0 0 1px var(--h-line);min-width:0}' +
    '#bm-hoi .tabs button{flex:1;border:0;background:none;border-radius:999px;padding:8px 6px;font-weight:800;font-size:14.5px;cursor:pointer;white-space:nowrap;color:var(--h-mut);transition:.2s}' +
    '#bm-hoi .tabs button.on{background:linear-gradient(135deg,var(--h-acc),#F5A443);color:#fff;box-shadow:0 2px 8px -3px rgba(200,90,10,.7)}' +
    '#bm-hoi .x{flex:none;width:38px;height:38px;border-radius:50%;border:0;background:var(--h-card);cursor:pointer;font-size:20px;line-height:1;box-shadow:inset 0 0 0 1px var(--h-line);display:grid;place-items:center}' +
    '#bm-hoi .bd2{flex:1;min-height:0;display:flex;flex-direction:column}' +
    '#bm-hoi .pg{flex:1;min-height:0;display:none;flex-direction:column}#bm-hoi .pg.on{display:flex}' +
    '#bm-hoi .sb{flex:none;padding:4px 12px 8px;position:relative}' +
    '#bm-hoi input.q,#bm-hoi textarea{width:100%;font:inherit;font-size:16px;color:var(--h-ink);background:var(--h-card);border:2px solid var(--h-line);border-radius:16px;padding:11px 40px 11px 14px;outline:none;transition:border-color .2s}' +
    '#bm-hoi input.q:focus,#bm-hoi textarea:focus{border-color:var(--h-acc)}' +
    '#bm-hoi .clr{position:absolute;right:18px;top:9px;width:32px;height:32px;border:0;background:none;color:var(--h-mut);font-size:18px;cursor:pointer;display:none}' +
    '#bm-hoi .sb.has .clr{display:block}' +
    '#bm-hoi .sc{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px 12px 14px}' +
    '#bm-hoi .st{font-size:12.5px;color:var(--h-mut);font-weight:700;padding:2px 4px 6px}' +
    '#bm-hoi .gh{font-size:12.5px;font-weight:900;color:var(--h-mut);text-transform:uppercase;letter-spacing:.04em;margin:10px 4px 6px}' +
    '#bm-hoi .r{background:var(--h-card);border-radius:16px;margin-bottom:8px;box-shadow:0 1px 0 var(--h-line),0 0 0 1px var(--h-line);overflow:hidden}' +
    '#bm-hoi .rh{display:flex;align-items:center;gap:10px;padding:10px 8px 10px 12px;cursor:pointer}' +
    '#bm-hoi .zh{font-family:var(--h-zh)}' +
    '#bm-hoi .rw{font-family:var(--h-zh);font-size:26px;font-weight:600;line-height:1.15;flex:none;max-width:52%;word-break:break-all}' +
    '#bm-hoi .ri{flex:1;min-width:0}' +
    '#bm-hoi .rp{font-family:Inter,system-ui,sans-serif;font-weight:700;color:#D2551F;font-size:15px}' +
    '#bm-hoi.dark .rp{color:#FFA36B}' +
    '#bm-hoi .rv{font-size:13px;color:var(--h-mut);font-weight:700}' +
    '#bm-hoi .lv{display:inline-block;font-size:11px;font-weight:900;padding:1px 7px;border-radius:999px;background:#E9F6EC;color:#1E7A45;margin-left:4px;vertical-align:1px}' +
    '#bm-hoi.dark .lv{background:#1F3A2A;color:#8FE0AE}' +
    '#bm-hoi .rm{font-size:14px;margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '#bm-hoi .r.ex .rm{display:none}' +
    '#bm-hoi .sp{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:var(--h-soft);cursor:pointer;font-size:18px;display:grid;place-items:center;transition:transform .15s}' +
    '#bm-hoi .sp:active{transform:scale(.88)}#bm-hoi .sp.on{background:var(--h-acc);animation:bmHoiP 1s infinite}' +
    '@keyframes bmHoiP{50%{transform:scale(1.08)}}' +
    '#bm-hoi .rd{display:none;padding:0 12px 12px;border-top:1px dashed var(--h-line)}#bm-hoi .r.ex .rd{display:block}' +
    '#bm-hoi .rr{display:flex;gap:8px;align-items:flex-start;padding:9px 0 2px}' +
    '#bm-hoi .rr .sp{width:34px;height:34px;font-size:15px}' +
    '#bm-hoi .rr .ri div{font-size:14.5px}' +
    '#bm-hoi .ac{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
    '#bm-hoi .ac a,#bm-hoi .ac button,#bm-hoi .chip{border:0;border-radius:999px;background:var(--h-soft);color:var(--h-ink);font-weight:800;font-size:13.5px;padding:7px 12px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:4px}' +
    '#bm-hoi .chips{display:flex;flex-wrap:wrap;gap:7px;margin:4px 0 10px}' +
    '#bm-hoi .chip.zh{font-size:17px;font-weight:600;padding:5px 13px}' +
    '#bm-hoi .more{display:block;width:100%;border:0;background:none;color:var(--h-acc);font-weight:900;padding:10px;cursor:pointer}' +
    '#bm-hoi .empty{text-align:center;color:var(--h-mut);padding:22px 12px 8px;font-weight:700}' +
    '#bm-hoi .empty b{color:var(--h-ink)}' +
    '#bm-hoi .hint{font-size:13.5px;color:var(--h-mut);margin:6px 4px 10px;line-height:1.55}' +
    /* hỏi đáp */
    '#bm-hoi .ms{display:flex;flex-direction:column;gap:10px;padding-top:4px}' +
    '#bm-hoi .mu{align-self:flex-end;max-width:86%;background:var(--h-u);border-radius:18px 18px 4px 18px;padding:9px 13px;font-weight:700;white-space:pre-wrap;word-break:break-word}' +
    '#bm-hoi .ma{align-self:stretch;background:var(--h-card);border-radius:4px 18px 18px 18px;padding:11px 14px;box-shadow:0 0 0 1px var(--h-line);font-size:15px;word-break:break-word}' +
    '#bm-hoi .ma p{margin:0 0 8px}#bm-hoi .ma p:last-child{margin-bottom:0}' +
    '#bm-hoi .ma h4{margin:10px 0 6px;font-size:15.5px;font-weight:900;color:#C2501C}#bm-hoi.dark .ma h4{color:#FFA36B}' +
    '#bm-hoi .ma ul,#bm-hoi .ma ol{margin:4px 0 8px;padding-left:20px}#bm-hoi .ma li{margin:3px 0}' +
    '#bm-hoi .ma code{font-family:inherit;background:var(--h-soft);padding:0 5px;border-radius:6px}' +
    '#bm-hoi .ma table{border-collapse:collapse;margin:6px 0 10px;font-size:14px;display:block;overflow-x:auto}#bm-hoi .ma td,#bm-hoi .ma th{border:1px solid var(--h-line);padding:4px 7px;text-align:left;vertical-align:top}' +
    '#bm-hoi .ma .zh,#bm-hoi .ma ruby{font-family:var(--h-zh)}' +
    '#bm-hoi ruby{display:inline-flex;flex-direction:column-reverse;align-items:center;vertical-align:bottom;line-height:1.25;margin:0 .04em;text-indent:0}#bm-hoi rt{display:block;font-family:Inter,system-ui,sans-serif;font-size:.56em;line-height:1.15;color:var(--h-mut);font-weight:600;letter-spacing:0;text-align:center;white-space:nowrap}' +
    '#bm-hoi .ma{line-height:1.6}#bm-hoi.nopy rt{display:none}' +
    '#bm-hoi .eg{display:flex;gap:8px;align-items:flex-start;background:var(--h-soft);border-radius:14px;padding:6px 8px 6px 12px;margin:6px 0}' +
    '#bm-hoi .eg .zh{flex:1;font-size:17.5px;line-height:1.5;padding:2px 0}' +
    '#bm-hoi .eg .sp{width:34px;height:34px;font-size:15px;background:var(--h-card);margin-top:4px}' +
    '#bm-hoi .eg.bad{background:rgba(217,68,58,.1)}#bm-hoi .eg.bad .zh{color:var(--h-red)}' +
    '#bm-hoi .tr{color:var(--h-mut);font-weight:700;margin:-2px 0 8px 12px;font-size:14px;line-height:1.5}' +
    '#bm-hoi .wait{display:inline-flex;gap:4px;padding:4px 0}#bm-hoi .wait i{width:8px;height:8px;border-radius:50%;background:var(--h-acc);animation:bmHoiD 1s infinite}' +
    '#bm-hoi .wait i:nth-child(2){animation-delay:.15s}#bm-hoi .wait i:nth-child(3){animation-delay:.3s}@keyframes bmHoiD{50%{transform:translateY(-5px);opacity:.5}}' +
    '#bm-hoi .err{color:var(--h-red);font-weight:800}' +
    '#bm-hoi .mt{font-size:12px;color:var(--h-mut);margin-top:6px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;line-height:1.3}' +
    '#bm-hoi .mt button{border:0;background:none;color:var(--h-acc);font-weight:900;padding:2px 0;cursor:pointer;font-size:12.5px}' +
    '#bm-hoi .cb{flex:none;display:flex;gap:8px;align-items:flex-end;padding:8px 12px 10px;border-top:1px solid var(--h-line);background:var(--h-bg)}' +
    '#bm-hoi .cb textarea{resize:none;max-height:120px;min-height:46px;padding:11px 14px;line-height:1.35;display:block}' +
    '#bm-hoi .go{flex:none;width:46px;height:46px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--h-acc),#F5A443);color:#fff;font-size:20px;cursor:pointer;display:grid;place-items:center;box-shadow:0 3px 10px -4px rgba(200,90,10,.8)}' +
    '#bm-hoi .go:disabled{opacity:.45}' +
    '#bm-hoi .go svg{width:20px;height:20px;fill:#fff}' +
    '#bm-hoi .tb{flex:none;display:flex;gap:6px;justify-content:flex-end;padding:0 12px 4px}' +
    '#bm-hoi .tb button{border:0;background:var(--h-card);box-shadow:inset 0 0 0 1px var(--h-line);border-radius:999px;font-size:12.5px;font-weight:800;padding:5px 10px;cursor:pointer;color:var(--h-mut)}' +
    '#bm-hoi .tb button.on{color:#fff;background:#E58A3A;box-shadow:none}' +
    '#bm-hoi .key{background:var(--h-card);border-radius:16px;padding:12px 14px;box-shadow:0 0 0 1px var(--h-line);margin:6px 0 10px;font-size:14px}' +
    '#bm-hoi .key input{width:100%;font:inherit;font-size:16px;margin:8px 0;padding:9px 12px;border-radius:12px;border:2px solid var(--h-line);background:var(--h-bg);color:var(--h-ink)}' +
    '#bm-hoi .key a{color:var(--h-acc);font-weight:900}' +
    '#bm-hoi .key button{border:0;border-radius:999px;background:var(--h-acc);color:#fff;font-weight:900;padding:8px 16px;cursor:pointer}' +
    '' +
    '@media (prefers-reduced-motion:reduce){#bm-hoi *{animation:none!important;transition:none!important}}';
  // khung nằm trong Shadow DOM để CSS của từng trang không lọt vào (và ngược lại)
  var host = document.createElement('div'); host.id = 'bm-hoi-host';
  var hs = document.createElement('style'); hs.textContent = '@media print{#bm-hoi-host{display:none!important}}#bm-hoi-host{all:initial}'; document.head.appendChild(hs);
  var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

  var MASCOT = BASE + 'shared/banhmi.svg';
  var SEND = '<svg viewBox="0 0 24 24"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>';
  var root = document.createElement('div'); root.id = 'bm-hoi';
  var stl = document.createElement('style'); stl.textContent = shadow === host ? CSS : CSS.replace(/#bm-hoi \*\{box-sizing:border-box\}/, '#bm-hoi *,#bm-hoi{box-sizing:border-box}');
  shadow.appendChild(stl);
  root.innerHTML =
    '<button class="hf" type="button" aria-label="Tra từ nhanh và hỏi đáp tiếng Trung" title="Tra từ · Hỏi đáp"><img src="' + MASCOT + '" alt=""><span class="bd"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg></span></button>' +
    '<div class="tip">🔍 Tra từ · 💬 Hỏi đáp</div>' +
    '<div class="bk"></div>' +
    '<div class="pn" role="dialog" aria-label="Tra từ và hỏi đáp">' +
      '<div class="hd"><img src="' + MASCOT + '" alt=""><div class="tabs" role="tablist"><button type="button" data-t="tra">🔍 Tra từ</button><button type="button" data-t="hoi">💬 Hỏi đáp</button></div><button class="x" type="button" aria-label="Đóng">×</button></div>' +
      '<div class="bd2">' +
        '<div class="pg" data-p="tra"><div class="sb"><input class="q" type="text" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Chữ Hán, pinyin, Hán Việt hoặc tiếng Việt"><button class="clr" type="button" aria-label="Xoá">✕</button></div><div class="sc tra-sc"></div></div>' +
        '<div class="pg" data-p="hoi"><div class="tb"><button type="button" class="pyb">拼 Pinyin</button><button type="button" class="newc">🧹 Hỏi chuyện mới</button></div><div class="sc hoi-sc"><div class="ms"></div></div>' +
          '<div class="cb"><textarea rows="1" enterkeyhint="send" placeholder="Hỏi về ngữ pháp, từ vựng…"></textarea><button class="go" type="button" aria-label="Gửi">' + SEND + '</button></div></div>' +
      '</div>' +
    '</div>';
  shadow.appendChild(root); document.body.appendChild(host);
  function syncTheme() { root.classList.toggle('dark', document.documentElement.getAttribute('data-theme') === 'dark'); }
  syncTheme(); addEventListener('bm-theme', function () { setTimeout(syncTheme, 0); });
  if (window.MutationObserver) new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var fab = $('.hf'), tip = $('.tip'), pn = $('.pn'), bk = $('.bk'), qIn = $('input.q'), traSc = $('.tra-sc'), msBox = $('.ms'), hoiSc = $('.hoi-sc'), ta = $('.cb textarea'), goB = $('.go');
  // gõ trong khung không làm phím tắt của trang chạy (video, bài thi…)
  ['keydown', 'keyup', 'keypress'].forEach(function (t) { pn.addEventListener(t, function (e) { if (e.key === 'Escape' && t === 'keydown') close(); e.stopPropagation(); }); });

  /* ======================= vị trí nút: tránh che thanh nút cố định của trang ======================= */
  var pos = lg('bm.fab.pos', null) || { s: 'r', b: 18 };
  var SAFE = 0;
  (function () { var p = document.createElement('div'); p.style.cssText = 'position:fixed;bottom:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden'; document.body.appendChild(p); SAFE = p.offsetHeight || 0; p.remove(); })();
  var curB = -1, kbHide = false;
  function vh() { return window.innerHeight || document.documentElement.clientHeight; }
  function own(el) { return !!el && (el === host || el === root || root.contains(el)); }
  function obstacleAt(x, y) {
    if (!document.elementsFromPoint) return null;
    var els = document.elementsFromPoint(x, y), H = vh();
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (own(el) || el === document.body || el === document.documentElement) continue;
      for (var a = el; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
        if (own(a)) break;
        var cs = getComputedStyle(a);
        if (cs.position === 'fixed' || cs.position === 'sticky') {
          var r = a.getBoundingClientRect();
          if (cs.position === 'sticky' && r.bottom < H - 4) break;
          if (r.height > H * 0.45 || cs.visibility === 'hidden' || +cs.opacity < 0.5) break;
          if (r.top > H - 2 || r.bottom < 0) break;
          return r;
        }
      }
    }
    return null;
  }
  function place(force) {
    if (root.classList.contains('open') && !force) return;
    var H = vh(), W = document.documentElement.clientWidth || innerWidth, S = 58, m = 16;
    var b = Math.max(8, pos.b || 18) + SAFE, x0 = pos.s === 'l' ? m : W - m - S;
    for (var k = 0; k < 5; k++) {
      var top = H - b - S, pts = [[x0 + S / 2, top + 4], [x0 + S / 2, top + S - 4], [x0 + 4, top + S / 2], [x0 + S - 4, top + S / 2], [x0 + S / 2, top + S / 2]], hit = null;
      for (var i = 0; i < pts.length && !hit; i++) if (pts[i][1] > 0 && pts[i][1] < H) hit = obstacleAt(pts[i][0], pts[i][1]);
      if (!hit) break;
      b = H - hit.top + 10;
    }
    b = Math.min(b, H - S - 70);
    if (b !== curB) { curB = b; fab.style.bottom = b + 'px'; }
    fab.style.left = pos.s === 'l' ? m + 'px' : ''; fab.style.right = pos.s === 'l' ? 'auto' : '';
    var hide = !!(document.fullscreenElement || document.webkitFullscreenElement) || kbHide;
    fab.classList.toggle('gone', hide || root.classList.contains('open'));
  }
  var plT = 0;
  function placeSoon() { if (plT) return; plT = setTimeout(function () { plT = 0; place(); }, 120); }
  addEventListener('resize', placeSoon); addEventListener('scroll', placeSoon, { passive: true });
  document.addEventListener('fullscreenchange', placeSoon); document.addEventListener('webkitfullscreenchange', placeSoon);
  setInterval(function () { if (document.visibilityState === 'visible') place(); }, 1200);
  // bàn phím điện thoại đang mở để gõ vào trang → giấu nút cho đỡ vướng
  if (window.visualViewport) visualViewport.addEventListener('resize', function () {
    var a = document.activeElement, typing = a && !own(a) && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
    var k = typing && visualViewport.height < vh() * 0.78;
    if (k !== kbHide) { kbHide = k; place(); }
  });
  document.addEventListener('focusout', function () { setTimeout(function () { if (kbHide) { kbHide = false; place(); } }, 300); });

  /* kéo nút sang chỗ khác (giữ và kéo), bấm nhẹ = mở */
  var drag = null;
  fab.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    var r = fab.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, on: false, id: e.pointerId };
  });
  fab.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.on && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 10) {
      drag.on = true; fab.classList.add('drag'); try { fab.setPointerCapture(drag.id); } catch (x) {}
      tip.classList.remove('on');
    }
    if (drag.on) {
      e.preventDefault();
      fab.style.left = Math.max(4, Math.min(innerWidth - 62, e.clientX - drag.dx)) + 'px'; fab.style.right = 'auto';
      fab.style.bottom = Math.max(4, vh() - (e.clientY - drag.dy) - 58) + 'px';
    }
  });
  function endDrag(e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.on) return;
    fab.classList.remove('drag');
    var r = fab.getBoundingClientRect();
    pos = { s: r.left + 29 < (document.documentElement.clientWidth || innerWidth) / 2 ? 'l' : 'r', b: Math.round(Math.max(8, vh() - r.bottom - SAFE)) };
    ls('bm.fab.pos', pos); curB = -1; place();
    fab.__noclick = Date.now();
  }
  fab.addEventListener('pointerup', endDrag); fab.addEventListener('pointercancel', endDrag);
  fab.addEventListener('click', function () { if (fab.__noclick && Date.now() - fab.__noclick < 400) return; open(); });

  // lời nhắc nhỏ cho mấy lần đầu
  (function () {
    var n = lg('bm.fab.seen', 0); if (n >= 3) return; ls('bm.fab.seen', n + 1);
    setTimeout(function () {
      if (root.classList.contains('open') || fab.classList.contains('gone')) return;
      var r = fab.getBoundingClientRect();
      tip.style.bottom = (vh() - r.top + 8) + 'px';
      if (pos.s === 'l') { tip.style.left = '12px'; tip.style.right = 'auto'; } else { tip.style.right = '12px'; tip.style.left = 'auto'; }
      tip.classList.add('on'); setTimeout(function () { tip.classList.remove('on'); }, 4200);
    }, 1500);
  })();

  /* ======================= mở / đóng ======================= */
  var tab = lg('bm.hoi.tab', 'tra') === 'hoi' ? 'hoi' : 'tra', opened = false;
  function phone() { return (document.documentElement.clientWidth || innerWidth) < 700; }
  function fit() {
    if (!root.classList.contains('open')) return;
    if (!phone()) { var pb = Math.max(18, curB > 0 ? curB : 18); pn.style.top = ''; pn.style.bottom = pb + 'px'; pn.style.height = Math.min(660, vh() - pb - 78) + 'px'; return; }
    var v = window.visualViewport, H = v ? v.height : innerHeight, T = v ? v.offsetTop : 0;
    var kb = v && v.height < innerHeight * 0.78;
    var h = kb ? H - 6 : Math.round(H * 0.84);
    pn.style.height = h + 'px'; pn.style.top = (T + H - h) + 'px'; pn.style.bottom = 'auto';
  }
  if (window.visualViewport) { visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
  addEventListener('resize', fit);
  function selText() {
    try { var s = String(window.getSelection() || '').trim(); if (s && HAN.test(s) && s.length <= 30) return s.replace(/\s+/g, ''); } catch (e) {}
    return '';
  }
  function open(t) {
    var sel = selText();
    if (sel) { t = 'tra'; qIn.value = sel; }
    if (t) tab = t;
    root.classList.add('open'); pn.classList.toggle('l', pos.s === 'l');
    place(true); fit(); setTab(tab);
    if (!opened) { opened = true; }
    if (tab === 'tra') { runSearch(); if (!phone() || !qIn.value) focusLater(qIn); }
    else { renderChat(); scrollChat(); if (!phone()) focusLater(ta); }
    loadData();
  }
  function focusLater(el) { setTimeout(function () { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }, 60); }
  function close() {
    root.classList.remove('open'); stopSay();
    try { var ae = (shadow.activeElement) || (own(document.activeElement) && document.activeElement); if (ae && ae.blur) ae.blur(); } catch (e) {}
    curB = -1; place();
  }
  window.BM_HOI = { open: open, close: close, lookup: function (w) { qIn.value = w || ''; open('tra'); }, ask: function (q) { open('hoi'); if (q) send(q); } };
  $('.x').onclick = close; bk.onclick = close;
  bk.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  function setTab(t) {
    tab = t; ls('bm.hoi.tab', t);
    $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); b.setAttribute('aria-selected', b.dataset.t === t); });
    $$('.pg').forEach(function (p) { p.classList.toggle('on', p.dataset.p === t); });
  }
  $$('.tabs button').forEach(function (b) {
    b.onclick = function () { setTab(b.dataset.t); if (b.dataset.t === 'hoi') { renderChat(); scrollChat(); if (!phone()) focusLater(ta); } else { runSearch(); if (!phone()) focusLater(qIn); } };
  });
  // đang mở khung trên máy tính: bôi đen chữ Hán trên trang → tự tra
  var selT = 0;
  document.addEventListener('selectionchange', function () {
    if (!root.classList.contains('open') || tab !== 'tra' || phone()) return;
    clearTimeout(selT); selT = setTimeout(function () {
      var s = window.getSelection(); if (!s || !s.anchorNode || own(s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode)) return;
      var t = selText(); if (t && t !== qIn.value) { qIn.value = t; runSearch(); }
    }, 350);
  });

  /* ======================= phát âm ======================= */
  var AU = null, playBtn = null;
  function mark(btn) { if (playBtn) playBtn.classList.remove('on'); playBtn = btn || null; if (playBtn) playBtn.classList.add('on'); }
  function stopSay() { try { if (AU) AU.pause(); } catch (e) {} try { if (window.BMVoice) BMVoice.stop(); } catch (e) {} mark(null); }
  var voiceP = null;
  function voice() {
    if (window.BMVoice) return Promise.resolve(window.BMVoice);
    if (!voiceP) voiceP = loadScript(BASE + 'shared/voice.js?v=1').then(function () { return window.BMVoice; }, function () { voiceP = null; return null; });
    return voiceP;
  }
  var TONE = {}; 'āáǎà|ēéěè|īíǐì|ōóǒò|ūúǔù|ǖǘǚǜ'.split('|').forEach(function (g, i) { for (var k = 0; k < 4; k++) TONE[g[k]] = ['a', 'e', 'i', 'o', 'u', 'v'][i] + (k + 1); });
  function tone3(p) {
    var t = '5', o = String(p || '').trim().toLowerCase().replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (c) { t = TONE[c][1]; return TONE[c][0]; }).replace(/ü/g, 'v');
    return /^[a-z]+$/.test(o) ? o + t : '';
  }
  function sayText(text, btn) {
    stopSay(); mark(btn);
    voice().then(function (V) {
      if (!V || playBtn !== btn) { mark(null); return; }
      V.speak(text, { rate: 0.9 }).then(function () { if (playBtn === btn) mark(null); }, function () { mark(null); });
    });
  }
  function sayChar(ch, py, btn) {
    var f = tone3(py);
    if (!f || ch.length !== 1) return sayText(ch, btn);
    stopSay(); mark(btn);
    if (!AU) { AU = new Audio(); AU.preload = 'auto'; }
    AU.onended = function () { if (playBtn === btn) mark(null); };
    AU.onerror = function () { if (playBtn === btn) sayText(ch, btn); };
    AU.src = BASE + 'audio/py/' + f + '.mp3';
    var pr = AU.play(); if (pr && pr.catch) pr.catch(function (e) { if (e && e.name !== 'AbortError' && playBtn === btn) sayText(ch, btn); });
  }

  /* ======================= từ điển ======================= */
  var IDX = new Map(), LIST = null, vocP = null, dictP = null, dictOK = false, prepped = 0;
  function minL(n) { if (!n) return 0; var s = String(n), m = 9; for (var i = 0; i < s.length; i++) { var d = +s[i]; if (d && d < m) m = d; } return m === 9 ? 0 : m; }
  function ent(w) { var e = IDX.get(w); if (!e) { e = { w: w, raw: null, v: null, lv: 0 }; IDX.set(w, e); LIST = null; } return e; }
  function loadData() {
    if (!vocP) vocP = fetch(BASE + 'trasua/data/vocab.json?v=20261120c').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (a) {
      a.forEach(function (x) { var e = ent(x[0]); if (!e.v) { e.v = x; e.lv = minL(x[4]) || minL(x[6]) || minL(x[5]) || 0; } });
      LIST = null; prepped = 0; if (root.classList.contains('open') && tab === 'tra') runSearch();
    }).catch(function () { vocP = null; });
    if (!dictP) dictP = fetch(BASE + 'dict.txt').then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
      var i = 0, n = txt.length;
      while (i < n) {
        var j = txt.indexOf('\n', i); if (j < 0) j = n;
        var t = txt.indexOf('\t', i);
        if (t > i && t < j) { var e = ent(txt.slice(i, t)); e.raw = txt.slice(t + 1, j).replace(/\r$/, ''); e._r = null; }
        i = j + 1;
      }
      dictOK = true; LIST = null; prepped = 0;
      if (root.classList.contains('open') && tab === 'tra') runSearch();
    }).catch(function () { dictP = null; });
    return Promise.all([vocP, dictP]);
  }
  // các cách đọc: [{p, hv, m}]
  function reads(e) {
    if (e._r) return e._r;
    var out = [];
    if (e.raw) e.raw.split('\t').forEach(function (s) { var a = s.split('|'); if (a.length >= 3) out.push({ p: a[0], hv: a[1] === '_' ? '' : a[1].replace(/_/g, '…'), m: a.slice(2).join('|') }); });
    if (!out.length && e.v) out.push({ p: e.v[1], hv: e.v[2], m: e.v[3] });
    e._r = out; return out;
  }
  function fold(s) { return String(s).toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC'); }
  // pinyin → phần chữ (không dấu, ü = v) + dãy thanh (1–5)
  function pyKey(p) {
    var base = '', tones = '';
    String(p).toLowerCase().split(/[\s·,，'’\-]+/).forEach(function (syl) {
      if (!syl) return;
      var t = 0;
      syl = syl.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (c) { t = +TONE[c][1]; return TONE[c][0]; }).replace(/ü|u:/g, 'v');
      var dm = syl.match(/([1-5])$/); if (dm) { t = +dm[1]; syl = syl.slice(0, -1); }
      syl = syl.replace(/[^a-z]/g, ''); if (!syl) return;
      base += syl; tones += t || 5;
    });
    return { b: base, t: tones };
  }
  function list() {
    if (!LIST) { LIST = []; IDX.forEach(function (e) { if (e.raw || e.v) LIST.push(e); }); prepped = 0; }
    return LIST;
  }
  function prep() {
    var L = list(); if (prepped === L.length) return L;
    for (var i = 0; i < L.length; i++) {
      var e = L[i]; if (e._k) continue;
      e._k = reads(e).map(function (r) { var k = pyKey(r.p); return { b: k.b, bu: k.b.replace(/v/g, 'u'), t: k.t, hv: r.hv.toLowerCase(), hvf: fold(r.hv), m: r.m.toLowerCase() }; });
    }
    prepped = L.length; return L;
  }
  function rank(e) { return (e.lv || 10) * 100 + Math.min(e.w.length, 9) * 10 + (e.v ? 0 : 5); }
  var VIET = /[ăâêôơưđảãạẻẽẹỉĩịỏõọủũụỳỷỹỵýằắẳẵặầấẩẫậềếểễệồốổỗộờớởỡợừứửữự]/i, PYONLY = /[āēīōūǎěǐǒǔǖǘǚǜü1-5]/i;
  function segment(t) {
    var out = [], i = 0;
    while (i < t.length) {
      if (!HAN.test(t[i])) { i++; continue; }
      var L = Math.min(8, t.length - i), got = 0;
      for (; L >= 1; L--) { var s = t.substr(i, L), e = IDX.get(s); if (e && (e.raw || e.v)) { out.push(e); got = L; break; } }
      i += got || 1;
    }
    return out;
  }
  function search(q) {
    q = q.trim(); if (!q) return { items: [] };
    if (HAN.test(q)) {
      var h = (q.match(HANS) || []).join(''), ex = IDX.get(h), res = [], seen = {};
      var add = function (e, s) { if (!e || seen[e.w] || !(e.raw || e.v)) return; seen[e.w] = 1; res.push({ e: e, s: s }); };
      if (ex) add(ex, 0);
      if (h.length >= 3 && !(ex && (ex.raw || ex.v))) {
        var sg = segment(h); if (sg.length > 1) return { seg: sg, items: [] };
        sg.forEach(function (e) { add(e, 0); });
      }
      var L = list(), pre = [], con = [];
      if (h.length <= 4) for (var i = 0; i < L.length; i++) {
        var w = L[i].w; if (w === h || w.length > 12) continue;
        if (w.indexOf(h) === 0) pre.push(L[i]); else if (w.indexOf(h) > 0) con.push(L[i]);
      }
      pre.sort(function (a, b) { return rank(a) - rank(b); }); con.sort(function (a, b) { return rank(a) - rank(b); });
      pre.forEach(function (e) { add(e, 1); }); con.forEach(function (e) { add(e, 2); });
      return { items: res };
    }
    var L2 = prep(), ql = q.toLowerCase().normalize('NFC').replace(/\s+/g, ' '), viet = VIET.test(ql), pyOnly = !viet && PYONLY.test(ql);
    var ascii = !/[^\x00-\x7f]/.test(ql), k = pyKey(ql), qb = k.b, hasT = /[1-5]/.test(ql) || /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(ql);
    var qtm = '', qf = fold(ql), best = new Map();
    for (var c0 = 0; c0 < ql.length; c0++) { var ch0 = ql[c0]; if (TONE[ch0]) qtm += TONE[ch0][1]; else if (/[1-4]/.test(ch0)) qtm += ch0; }
    function put(e, s) { var o = best.get(e); if (o == null || s < o) best.set(e, s); }
    var doPy = !viet && qb.length >= 1, doHv = !pyOnly, doM = !pyOnly && !ascii && ql.length >= 2;
    for (var j = 0; j < L2.length; j++) {
      var e = L2[j], ks = e._k;
      for (var r = 0; r < ks.length; r++) {
        var x = ks[r];
        if (doPy && (x.b === qb || x.bu === qb)) {
          if (!hasT || x.t.replace(/5/g, '') === qtm) put(e, 0);
        } else if (doPy && !hasT && qb.length >= 3 && x.b.indexOf(qb) === 0 && x.b.length <= qb.length + 6) put(e, 4);
        if (doHv && x.hv) {
          if (x.hv === ql || (x.hv.indexOf(',') > 0 && x.hv.split(/,\s*/).indexOf(ql) >= 0)) put(e, 1);
          else if (ascii && (x.hvf === qf || (x.hvf.indexOf(',') > 0 && x.hvf.split(/,\s*/).indexOf(qf) >= 0))) put(e, 2);
        }
        if (doM && x.m.indexOf(ql) >= 0) {
          var segs = x.m.split(/[;；]/), sc = 9;
          for (var g = 0; g < segs.length && sc > 1.5; g++) {
            var sgm = segs[g].replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
            if (sgm === ql) sc = 1.5;
            else if ((' ' + sgm + ' ').indexOf(' ' + ql + ' ') >= 0) sc = Math.min(sc, sgm.indexOf(ql) === 0 ? 3 : 5);
          }
          if (sc < 9) put(e, sc);
        }
      }
    }
    var arr = []; best.forEach(function (s, e) { arr.push({ e: e, s: s }); });
    arr.sort(function (a, b) { return a.s - b.s || rank(a.e) - rank(b.e); });
    return { items: arr };
  }

  /* ---------- hiện kết quả ---------- */
  var shown = 40, lastQ = null, lastRes = null, srT = 0;
  function lvTag(e) { return e.lv ? '<span class="lv">HSK ' + (e.lv >= 7 ? '7–9' : e.lv) + '</span>' : ''; }
  function uniq(a) { var o = []; a.forEach(function (x) { if (x && o.indexOf(x) < 0) o.push(x); }); return o; }
  function rowHTML(e, i, exp) {
    var rs = reads(e), ps = uniq(rs.map(function (r) { return r.p; })), hv = uniq(rs.map(function (r) { return r.hv; }));
    var h = '<div class="r' + (exp ? ' ex' : '') + '" data-i="' + i + '"><div class="rh"><div class="rw">' + esc(e.w) + '</div><div class="ri"><div class="rp">' + esc(ps.join(' / ')) + '</div>' +
      '<div class="rv">' + (hv.length ? esc(hv.join(' / ')) : '') + lvTag(e) + '</div><div class="rm">' + esc(rs.map(function (r) { return r.m; }).join(' · ')) + '</div></div>' +
      '<button class="sp" type="button" data-say="' + i + '" aria-label="Nghe đọc">🔊</button></div><div class="rd">';
    rs.forEach(function (r, k) {
      h += '<div class="rr">' + (rs.length > 1 ? '<button class="sp" type="button" data-say="' + i + '" data-k="' + k + '" aria-label="Nghe">🔊</button>' : '') +
        '<div class="ri"><span class="rp">' + esc(r.p) + '</span>' + (r.hv ? ' <span class="rv">· ' + esc(r.hv) + '</span>' : '') + '<div>' + esc(r.m) + '</div></div></div>';
    });
    h += '<div class="ac"><a href="' + BASE + 'chu-han/?c=' + encodeURIComponent(e.w) + '" data-bm-go="soichu">🔍 Soi chữ</a><button type="button" data-ask="' + i + '">💬 Hỏi cách dùng</button></div></div></div>';
    return h;
  }
  var CUR = [];
  function runSearch() {
    var q = qIn.value; ss('bm.tra.q', q);
    $('.sb').classList.toggle('has', !!q);
    if (q === lastQ && lastRes && LIST && prepped) { draw(); return; }
    var r = search(q); lastQ = q; lastRes = r; shown = 40; draw();
  }
  function loadingNote() { return !dictOK ? '<div class="st">⏳ Đang tải từ điển đầy đủ (lần đầu hơi lâu một chút)…</div>' : ''; }
  function draw() {
    var q = qIn.value.trim(), r = lastRes || { items: [] }, h = '';
    if (!q) {
      var rec = lg('bm.tra.recent', []);
      h += '<div class="hint">Gõ <b>chữ Hán</b> (爱), <b>pinyin</b> (ai, ài, ai4), <b>Hán Việt</b> (ái) hoặc <b>tiếng Việt</b> (yêu). Dán cả câu tiếng Trung để tách từ.' + (phone() ? '' : ' Bôi đen chữ Hán trên trang cũng tự tra.') + '</div>';
      if (rec.length) h += '<div class="gh">Vừa tra</div><div class="chips">' + rec.map(function (w) { return '<button type="button" class="chip zh" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>';
      else h += '<div class="gh">Thử tra</div><div class="chips">' + ['爱', 'xuexi', 'hạnh phúc', 'liǎojiě', '把'].map(function (w) { return '<button type="button" class="chip' + (HAN.test(w) ? ' zh' : '') + '" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>';
      traSc.innerHTML = h + (vocP || dictP ? '' : '');
      CUR = []; return;
    }
    if (!LIST && !vocP && !dictP) { loadData(); }
    if (r.seg) {
      CUR = r.seg;
      h += loadingNote() + '<div class="gh">Tách từ trong câu (' + r.seg.length + ' từ)</div>' + r.seg.map(function (e, i) { return rowHTML(e, i, false); }).join('');
      traSc.innerHTML = h; return;
    }
    CUR = r.items.slice(0, shown).map(function (x) { return x.e; });
    if (!CUR.length) {
      traSc.innerHTML = (dictOK ? '<div class="empty">Chưa tìm thấy “<b>' + esc(q) + '</b>”.<br>Thử gõ cách khác, hoặc hỏi Bánh Mì nhé.</div><div class="chips" style="justify-content:center"><button type="button" class="chip" data-askq="1">💬 Hỏi Bánh Mì về “' + esc(q) + '”</button></div>' : '<div class="empty">⏳ Đang tải từ điển…</div>');
      return;
    }
    h += loadingNote();
    CUR.forEach(function (e, i) { h += rowHTML(e, i, i === 0 && (r.items[0].s === 0 || CUR.length === 1)); });
    if (r.items.length > shown) h += '<button class="more" type="button">Xem thêm (' + (r.items.length - shown) + ')</button>';
    traSc.innerHTML = h;
  }
  function remember(w) {
    var a = lg('bm.tra.recent', []).filter(function (x) { return x !== w; }); a.unshift(w); ls('bm.tra.recent', a.slice(0, 14));
  }
  qIn.addEventListener('input', function () { clearTimeout(srT); srT = setTimeout(runSearch, qIn.value.length < 2 && !HAN.test(qIn.value) ? 260 : 140); });
  qIn.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { clearTimeout(srT); runSearch(); qIn.blur(); } });
  $('.clr').onclick = function () { qIn.value = ''; runSearch(); qIn.focus(); };
  traSc.addEventListener('click', function (e) {
    var t = e.target.closest('button,a,.rh'); if (!t) return;
    if (t.dataset.w != null) { qIn.value = t.dataset.w; runSearch(); return; }
    if (t.dataset.askq) { var q = qIn.value.trim(); setTab('hoi'); renderChat(); send('Giải thích giúp mình: ' + q); return; }
    if (t.classList.contains('more')) { shown += 40; draw(); return; }
    var row = t.closest('.r'); if (!row) return;
    var e2 = CUR[+row.dataset.i]; if (!e2) return;
    if (t.dataset.say != null) {
      e.stopPropagation(); remember(e2.w);
      var rs = reads(e2), k = t.dataset.k != null ? +t.dataset.k : 0;
      if (e2.w.length === 1) sayChar(e2.w, (rs[k] || rs[0] || {}).p, t); else sayText(e2.w, t);
      return;
    }
    if (t.dataset.ask != null) { remember(e2.w); setTab('hoi'); renderChat(); send('Giải thích cách dùng của “' + e2.w + '”, kèm vài ví dụ thông dụng.'); return; }
    if (t.tagName === 'A') { remember(e2.w); return; }
    if (t.classList.contains('rh')) { row.classList.toggle('ex'); if (row.classList.contains('ex')) remember(e2.w); }
  });

  /* ======================= hỏi đáp (AI Groq) ======================= */
  var chat = lg('bm.hoi.chat', []); if (!Array.isArray(chat)) chat = [];
  var busy = null; // {ctl, el}
  var pyOn = lg('bm.hoi.py', true) !== false;
  function syncPy() { root.classList.toggle('nopy', !pyOn); $('.pyb').classList.toggle('on', pyOn); }
  syncPy();
  $('.pyb').onclick = function () { pyOn = !pyOn; ls('bm.hoi.py', pyOn); syncPy(); if (pyOn) ensurePy().then(function () { renderChat(); }); };
  $('.newc').onclick = function () { if (busy) stopAI(); chat = []; saveChat(); renderChat(); ta.focus(); };
  function saveChat() { var c = chat.slice(-40); while (c.length) { try { localStorage.setItem('bm.hoi.chat', JSON.stringify(c)); break; } catch (e) { c = c.slice(2); } } }
  var pyP = null;
  function ensurePy() {
    if (window.pinyinPro) return Promise.resolve(window.pinyinPro);
    if (!pyP) pyP = loadScript(BASE + 'trasua/lib/pinyin-pro.js').then(function () { return window.pinyinPro; }, function () { pyP = null; return null; });
    return pyP;
  }
  // chữ đứng một mình khi giảng ngữ pháp gần như luôn là trợ từ (了 le chứ không phải liǎo)
  var PART = { '了': 'le', '着': 'zhe', '的': 'de', '地': 'de', '得': 'de', '吗': 'ma', '呢': 'ne', '吧': 'ba' };
  function ruby(s) { // s: chuỗi đã escape, không chứa thẻ
    if (!HAN.test(s)) return s;
    var P = window.pinyinPro;
    if (!P || !pyOn) return s.replace(HANS, function (m) { return '<span class="zh">' + m + '</span>'; });
    return s.replace(/[\u3400-\u9fff\uf900-\ufaff][\u3400-\u9fff\uf900-\ufaff，。！？、；：“”‘’（）《》…—·\s0-9a-zA-Z]*/g, function (run) {
      var bare = (run.match(HANS) || []).join('');
      if (bare.length === 1 && PART[bare]) return run.replace(bare, '<ruby>' + bare + '<rt>' + PART[bare] + '</rt></ruby>');
      var items; try { items = P.pinyin(run, { type: 'all', toneSandhi: true }); } catch (e) { return run; }
      var out = '';
      items.forEach(function (it) { out += it.isZh ? '<ruby>' + it.origin + '<rt>' + it.pinyin + '</rt></ruby>' : it.origin; });
      return out;
    });
  }
  function inline(s) {
    var h = esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
    return h.split(/(<[^>]+>)/).map(function (p) { return p.charAt(0) === '<' ? p : ruby(p); }).join('');
  }
  function md(t) {
    var L = String(t || '').replace(/\r/g, '').split('\n'), h = '', list = null, para = [], i = 0;
    function flushP() { if (para.length) { h += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; } }
    function flushL() { if (list) { h += '</' + list + '>'; list = null; } }
    for (; i < L.length; i++) {
      var ln = L[i], s = ln.trim(), m;
      if (!s) { flushP(); flushL(); continue; }
      if ((m = s.match(/^#{1,4}\s+(.*)$/))) { flushP(); flushL(); h += '<h4>' + inline(m[1].replace(/\*\*/g, '')) + '</h4>'; continue; }
      if ((m = s.match(/^>\s?(.*)$/))) {
        flushP(); flushL();
        var zh = m[1].trim(), bad = /^[✗×❌]|^\(?sai\)?\s*[:：]/i.test(zh), tr = '';
        if (L[i + 1] && /^\s*(→|->|=>)/.test(L[i + 1])) { tr = L[i + 1].trim().replace(/^(→|->|=>)\s*/, ''); i++; }
        var say = zh.replace(/^[✗×❌✓✔✅]\s*/, '').replace(/\*\*/g, '');
        h += '<div class="eg' + (bad ? ' bad' : '') + '"><div class="zh">' + inline(zh) + '</div>' + (HAN.test(say) && !bad ? '<button class="sp" type="button" data-say="' + esc(say) + '" aria-label="Nghe">🔊</button>' : '') + '</div>' + (tr ? '<div class="tr">→ ' + inline(tr) + '</div>' : '');
        continue;
      }
      if (/^(→|->|=>)/.test(s)) { flushP(); flushL(); h += '<div class="tr">→ ' + inline(s.replace(/^(→|->|=>)\s*/, '')) + '</div>'; continue; }
      if (/^\|.*\|$/.test(s)) {
        flushP(); flushL(); var rows = [];
        while (i < L.length && /^\|.*\|$/.test(L[i].trim())) { var c = L[i].trim().slice(1, -1).split('|'); if (!c.every(function (x) { return /^\s*:?-{2,}:?\s*$/.test(x); })) rows.push(c); i++; }
        i--; h += '<table>' + rows.map(function (r, k) { return '<tr>' + r.map(function (x) { return k ? '<td>' + inline(x.trim()) + '</td>' : '<th>' + inline(x.trim()) + '</th>'; }).join('') + '</tr>'; }).join('') + '</table>';
        continue;
      }
      if ((m = s.match(/^[-*•]\s+(.*)$/))) { flushP(); if (list !== 'ul') { flushL(); h += '<ul>'; list = 'ul'; } h += '<li>' + inline(m[1]) + '</li>'; continue; }
      if ((m = s.match(/^(\d+)[.)]\s+(.*)$/))) { flushP(); if (list !== 'ol') { flushL(); h += '<ol>'; list = 'ol'; } h += '<li>' + inline(m[2]) + '</li>'; continue; }
      flushL(); para.push(s);
    }
    flushP(); flushL();
    return h;
  }
  var SUGG = ['了 và 过 khác nhau thế nào?', 'Câu chữ 把 dùng khi nào?', 'Bổ ngữ khả năng: 听得懂 / 听不懂', 'Phân biệt 以为 và 认为', 'Cách dùng 越来越 và 越…越…', '的、地、得 khác nhau ra sao?'];
  function keyBox() {
    return '<div class="key"><b>🔑 Cần key AI Groq (miễn phí) để hỏi đáp</b><br>Máy này chưa có key. Lấy key ở <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> rồi dán vào đây, chỉ cần 1 lần.<input type="password" class="kin" autocomplete="off" placeholder="gsk_…"><button type="button" class="ksv">Lưu key</button></div>';
  }
  function groqKey() { try { return localStorage.getItem('bb.groq') || ''; } catch (e) { return ''; } }
  function renderChat() {
    var h = '';
    if (!chat.length) {
      h += '<div class="ma"><p>Chào bạn! Mình là <b>Bánh Mì</b> 🥖. Hỏi mình bất cứ điều gì về <b>ngữ pháp, từ vựng, cách dùng từ</b> tiếng Trung nhé. Câu ví dụ có pinyin và 🔊 để nghe.</p></div>';
      h += '<div class="chips">' + SUGG.map(function (s) { return '<button type="button" class="chip" data-q="' + esc(s) + '">' + ruby(esc(s)) + '</button>'; }).join('') + '</div>';
    }
    chat.forEach(function (m, i) {
      if (m.r === 'u') h += '<div class="mu">' + ruby(esc(m.t)) + '</div>';
      else h += '<div class="ma" data-i="' + i + '">' + (m.err ? '<div class="err">' + esc(m.t) + '</div><div class="mt"><button type="button" data-retry="1">↻ Hỏi lại</button></div>' : md(m.t)) + '</div>';
    });
    if (!groqKey()) h += keyBox();
    msBox.innerHTML = h;
    if (pyOn && !window.pinyinPro && /[\u3400-\u9fff]/.test(h)) ensurePy().then(function (P) { if (P) renderChat(); });
    goB.disabled = false; goB.innerHTML = busy ? '■' : SEND;
  }
  function scrollChat(smooth) { requestAnimationFrame(function () { hoiSc.scrollTo({ top: hoiSc.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); }); }
  msBox.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.q) { send(b.dataset.q); return; }
    if (b.dataset.say) { sayText(b.dataset.say, b); return; }
    if (b.dataset.retry) { var last = null; for (var i = chat.length - 1; i >= 0; i--) if (chat[i].r === 'u') { last = chat[i].t; chat = chat.slice(0, i); break; } if (last) send(last); return; }
    if (b.classList.contains('ksv')) {
      var v = ($('.kin').value || '').trim(); if (v.length < 20) { $('.kin').focus(); return; }
      if (window.BM_saveKey) BM_saveKey('bb.groq', v); else try { localStorage.setItem('bb.groq', v); } catch (x) {}
      renderChat(); var lu = chat.length && chat[chat.length - 1]; if (lu && lu.r === 'a' && lu.err) { b.dataset.retry = 1; msBox.querySelector('[data-retry]') && msBox.querySelector('[data-retry]').click(); }
    }
  });
  function autoGrow() { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight + 2) + 'px'; }
  ta.value = sg('bm.hoi.draft', '');
  ta.addEventListener('input', function () { autoGrow(); ss('bm.hoi.draft', ta.value); });
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && !phone()) { e.preventDefault(); goB.click(); }
  });
  goB.onclick = function () { if (busy) { stopAI(); return; } var q = ta.value.trim(); if (!q) { ta.focus(); return; } send(q); };
  function stopAI() { if (busy && busy.ctl) try { busy.ctl.abort(); } catch (e) {} }

  var SYS = [
    'Bạn là "Bánh Mì", gia sư tiếng Trung thân thiện cho người Việt (đang học giáo trình Hán ngữ 汉语教程, trình độ khoảng HSK 3–4).',
    'Nhiệm vụ: giải đáp mọi câu hỏi về ngữ pháp, cấu trúc câu, từ vựng, cách dùng từ, phân biệt từ gần nghĩa, sửa câu sai, dịch, phát âm tiếng Trung phổ thông.',
    'QUY TẮC BẮT BUỘC:',
    '1. Trả lời bằng tiếng Việt có dấu, giọng gần gũi, ngắn gọn rõ ràng (thường 100–250 chữ), đi thẳng vào ý chính.',
    '2. CHÍNH XÁC tuyệt đối theo ngữ pháp chuẩn 普通话. Chỉ nói điều chắc chắn đúng; nếu có nhiều cách hiểu hoặc chưa chắc thì nói rõ. Không bịa ví dụ lạ, không bịa thành ngữ hay nguồn.',
    '3. Chỉ dùng chữ Hán giản thể. KHÔNG tự viết pinyin sau chữ Hán (trang web tự thêm pinyin chuẩn phía trên chữ). Chỉ viết pinyin có dấu thanh khi câu hỏi là về cách đọc/thanh điệu.',
    '4. Mỗi câu ví dụ tiếng Trung đặt riêng một dòng bắt đầu bằng "> ", và dòng ngay dưới bắt đầu bằng "→ " là nghĩa tiếng Việt. Câu SAI thì viết "> ✗ câu sai" (không cần dịch), rồi đưa câu đúng.',
    '5. Cấu trúc ngữ pháp viết in đậm, ví dụ: **主语 + 把 + 宾语 + 动词 + 其他成分**. Dùng gạch đầu dòng "- " cho các ý. Có thể dùng tiêu đề ngắn "### ". Không dùng bảng.',
    '6. Ví dụ phải tự nhiên, thông dụng, đúng trình độ người học; 2–4 ví dụ là đủ.',
    '7. Nếu câu hỏi không liên quan tiếng Trung, vẫn trả lời ngắn gọn, lịch sự.'
  ].join('\n');
  function dictCtx(q) {
    var hs = (q.match(HANS) || []).join('，'); if (!hs || !IDX.size) return '';
    var seen = {}, lines = [];
    segment(hs).forEach(function (e) {
      if (seen[e.w] || lines.length >= 10) return; seen[e.w] = 1;
      var rs = reads(e); if (!rs.length) return;
      lines.push('- ' + e.w + ': ' + rs.slice(0, 4).map(function (r) { return r.p + ' — ' + r.m.slice(0, 140); }).join(' | '));
    });
    return lines.length ? '\n\nTỪ ĐIỂN THAM KHẢO (CVDICT) cho các từ trong câu hỏi, dùng để kiểm tra nghĩa/cách đọc:\n' + lines.join('\n') : '';
  }
  var MODELS = [
    { id: 'moonshotai/kimi-k2-instruct-0905' },
    { id: 'openai/gpt-oss-120b', x: { reasoning_effort: 'low' } },
    { id: 'qwen/qwen3-32b', x: { reasoning_effort: 'none' } },
    { id: 'llama-3.3-70b-versatile' }
  ];
  var MST = {};
  function retryIn(t) {
    var m = String(t).match(/try again in\s*((?:[\d.]+h)?(?:[\d.]+m(?!s))?(?:[\d.]+s)?(?:[\d.]+ms)?)/i); if (!m || !m[1]) return 0;
    var s = 0, x; if ((x = m[1].match(/([\d.]+)h/))) s += x[1] * 3600; if ((x = m[1].match(/([\d.]+)m(?!s)/))) s += x[1] * 60; if ((x = m[1].match(/([\d.]+)s/)) && !/ms$/.test(m[1])) s += +x[1]; if ((x = m[1].match(/([\d.]+)ms/))) s += x[1] / 1000; return s;
  }
  function clean(t) { return t.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').replace(/^\s+/, ''); }
  function aiStream(messages, onText, ctl) {
    var key = groqKey(), net = 0, srv = 0;
    function pick() {
      var now = Date.now(), best = null;
      MODELS.forEach(function (m) { var s = MST[m.id] = MST[m.id] || {}; if (s.dead) return; var w = Math.max(0, (s.until || 0) - now); if (!best || w < best.w) best = { m: m, w: w }; });
      return best;
    }
    function go() {
      if (ctl.signal.aborted) return Promise.reject(new Error('STOP'));
      var pk = pick(); if (!pk) return Promise.reject(new Error('AI miễn phí đang bận, lát nữa hỏi lại nha'));
      if (pk.w > 1500) {
        if (pk.w > 5 * 60 * 1000) return Promise.reject(new Error('Hết lượt AI miễn phí lúc này, lát nữa (hoặc mai) hỏi lại nha'));
        onText('', 'Đang chờ AI rảnh (' + Math.ceil(pk.w / 1000) + ' giây)…');
        return new Promise(function (r) { setTimeout(r, Math.min(pk.w, 15000)); }).then(go);
      }
      var m = pk.m, st = MST[m.id];
      var body = { model: m.id, messages: messages, temperature: 0.25, max_tokens: 1500, stream: true }; for (var k in (m.x || {})) body[k] = m.x[k];
      var full = '';
      return fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, body: JSON.stringify(body), signal: ctl.signal })
        .then(function (r) {
          net = 0;
          if (r.status === 401) throw new Error('KEY');
          if (r.status === 429 || r.status === 413) return r.text().then(function (t) {
            var ra = parseFloat(r.headers.get('retry-after')) || 0, day = /per day|TPD|RPD/i.test(t);
            st.until = Date.now() + Math.max(retryIn(t), ra, day ? 900 : 6) * 1000 + 400; return go();
          });
          if (r.status >= 500) { srv++; if (srv > 5) throw new Error('Máy chủ AI đang lỗi, lát nữa hỏi lại nha'); st.until = Date.now() + 3000 * srv; return go(); }
          if (r.status === 400 || r.status === 404 || r.status === 403) { st.dead = true; return go(); }
          if (!r.ok) throw new Error('AI lỗi ' + r.status);
          var buf = '';
          function eat(chunk, end) {
            buf += chunk; var lines = buf.split('\n'); buf = end ? '' : lines.pop();
            lines.forEach(function (l) {
              l = l.trim(); if (l.indexOf('data:') !== 0) return; var d = l.slice(5).trim(); if (!d || d === '[DONE]') return;
              try { var j = JSON.parse(d), c = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (c) { full += c; onText(clean(full)); } } catch (e) {}
            });
          }
          var done = function () { var out = clean(full).trim(); if (!out) { st.until = Date.now() + 5000; return go(); } return { text: out, model: m.id }; };
          if (r.body && r.body.getReader && window.TextDecoder) {
            var rd = r.body.getReader(), dec = new TextDecoder();
            var pump = function () { return rd.read().then(function (x) { if (x.done) { eat(dec.decode(), true); return done(); } eat(dec.decode(x.value, { stream: true })); return pump(); }); };
            return pump();
          }
          return r.text().then(function (t) { eat(t, true); return done(); });
        }, function (e) {
          if (ctl.signal.aborted) throw new Error('STOP');
          net++; if (net > 3) throw new Error('Mạng chập chờn, kiểm tra mạng rồi hỏi lại nha');
          onText('', 'Mạng chập chờn, đang thử lại…');
          return new Promise(function (r) { setTimeout(r, 2500 * net); }).then(go);
        });
    }
    return go();
  }
  function send(q) {
    q = String(q || '').trim(); if (!q) return;
    if (busy) stopAI();
    if (tab !== 'hoi') setTab('hoi');
    if (!root.classList.contains('open')) open('hoi');
    ta.value = ''; ss('bm.hoi.draft', ''); autoGrow();
    chat.push({ r: 'u', t: q }); saveChat();
    if (!groqKey()) { chat.push({ r: 'a', t: 'Cần dán key AI Groq ở ô bên dưới trước nha.', err: 1 }); saveChat(); renderChat(); scrollChat(true); return; }
    renderChat();
    var el = document.createElement('div'); el.className = 'ma'; el.innerHTML = '<span class="wait"><i></i><i></i><i></i></span>'; msBox.appendChild(el); scrollChat(true);
    var ctl = window.AbortController ? new AbortController() : { abort: function () {}, signal: {} };
    var my = busy = { ctl: ctl, el: el }; goB.innerHTML = '■';
    var hist = chat.slice(-9, -1).filter(function (m) { return !m.err; }).map(function (m) { return { role: m.r === 'u' ? 'user' : 'assistant', content: m.t.slice(0, 2500) }; });
    var msgs = [{ role: 'system', content: SYS + dictCtx(q) }].concat(hist, [{ role: 'user', content: q }]);
    var tm = 0, latest = '', stick = true;
    hoiSc.onscroll = function () { stick = hoiSc.scrollHeight - hoiSc.scrollTop - hoiSc.clientHeight < 60; };
    var p = (pyOn ? ensurePy() : Promise.resolve()).then(function () { return loadData().catch(function () {}); });
    // không chờ từ điển quá lâu
    Promise.race([p, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
      msgs[0].content = SYS + dictCtx(q);
      return aiStream(msgs, function (t, note) {
        if (busy !== my) return;
        if (note && !t) { el.innerHTML = '<span class="wait"><i></i><i></i><i></i></span> <span class="st">' + esc(note) + '</span>'; return; }
        latest = t; if (tm) return;
        tm = setTimeout(function () { tm = 0; if (busy !== my) return; el.innerHTML = md(latest); if (stick) hoiSc.scrollTop = hoiSc.scrollHeight; }, 90);
      }, ctl);
    }).then(function (res) {
      if (busy !== my) return;
      clearTimeout(tm); busy = null;
      chat.push({ r: 'a', t: res.text, m: res.model }); saveChat(); renderChat(); if (stick) scrollChat();
    }, function (err) {
      clearTimeout(tm); if (busy === my) busy = null;
      var msg = err && err.message || 'Có lỗi, hỏi lại nha';
      if (msg === 'STOP') { if (latest) { chat.push({ r: 'a', t: latest + '\n\n*(đã dừng)*' }); saveChat(); } renderChat(); return; }
      if (msg === 'KEY') { if (window.BM_dropKey) BM_dropKey('bb.groq'); else try { localStorage.removeItem('bb.groq'); } catch (e) {} msg = 'Key AI không đúng hoặc đã hết hạn, dán key mới ở dưới nha.'; }
      chat.push({ r: 'a', t: msg, err: 1 }); saveChat(); renderChat(); scrollChat(true);
    });
  }

  /* ======================= khởi động ======================= */
  qIn.value = sg('bm.tra.q', '');
  setTab(tab);
  place();
  setTimeout(place, 400); setTimeout(place, 1500);
})();
