/* Bánh Mì · thanh chuyển mục dùng chung cho mọi trang (đặt ngay sau thẻ <body>) */
(function () {
  if (window.__BM_NAV) return; window.__BM_NAV = 1;
  var me = document.currentScript;
  var BASE = new URL('../', me ? me.src : location.href).href; // gốc trang web (…/Pinyin/)
  var SECS = [
    { id: 'home', path: '', name: 'Trang chủ', short: 'Trang chủ', emo: '🏠', c: '#F08A24', c2: '#FFC861', d: 'Về nhà Bánh Mì' },
    { id: 'video', path: 'video/', name: 'Học qua video', short: 'Video', emo: '🎬', c: '#12A66A', c2: '#5CD6A0', d: 'Xem video, nói theo, nghe chép' },
    { id: 'trasua', path: 'trasua/', name: 'Đọc báo & HSK', short: 'Báo · HSK', emo: '🧋', c: '#E8577E', c2: '#FF9DB5', d: 'Tin mỗi ngày, phòng thi HSK, từ vựng' },
    { id: 'onthi', path: 'on-thi/', name: 'Ôn thi trên lớp', short: 'Ôn thi', emo: '📝', c: '#F2643F', c2: '#FFAE8A', d: 'Ra đề, chấm điểm, tài liệu ôn' },
    { id: 'vo', path: 'vo/', name: 'Vở tập viết', short: 'Tập viết', emo: '✍️', c: '#7C5CDB', c2: '#B39DFF', d: 'Tạo vở ô chữ, in hoặc viết trên iPad' },
    { id: 'pdf', path: 'pdf/', name: 'Đọc PDF có Pinyin', short: 'PDF', emo: '📄', c: '#1593A6', c2: '#6FD0DE', d: 'Mở giáo trình, hiện pinyin từng chữ' }
  ];
  var rel = location.href.indexOf(BASE) === 0 ? location.pathname.slice(new URL(BASE).pathname.length) : '';
  var cur = SECS[0];
  SECS.forEach(function (s) { if (s.path && rel.indexOf(s.path) === 0) cur = s; });
  if (/^index\.html$/.test(rel) || rel === '') cur = SECS[0];
  window.BM_SECTIONS = SECS; window.BM_BASE = BASE;

  var N = 0;
  function mascot() {
    var g = 'bmNG' + (++N);
    return '<svg class="bm-mascot" viewBox="0 0 120 112" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE6A8"/><stop offset=".5" stop-color="#F7BC62"/><stop offset="1" stop-color="#E29245"/></linearGradient></defs><ellipse cx="60" cy="104" rx="38" ry="4.5" fill="#000" opacity=".13"/><ellipse cx="44" cy="98" rx="7.5" ry="5" fill="#C9772F"/><ellipse cx="76" cy="98" rx="7.5" ry="5" fill="#C9772F"/><path d="M58 40c-6-9-3-17 3-19 4 6 2 13-3 19z" fill="#34C27F"/><path d="M62 40c1-10 9-15 16-12-2 8-8 12-16 12z" fill="#22A565"/><path d="M57 41c-8-4-15-2-17 3 6 3 12 2 17-3z" fill="#2EB872"/><path d="M14 46C22 38 40 36 60 36s38 2 46 10c8 8 10 26 2 36-8 9-28 12-48 12S20 91 12 82C4 72 6 54 14 46z" fill="url(#' + g + ')" stroke="#B5671F" stroke-width="2.8" stroke-linejoin="round"/><path d="M26 44c-2 3-3 5-3 8M44 40l-4 9M84 40l4 9M98 44c2 3 3 5 3 8" stroke="#FFF1C9" stroke-width="3.4" stroke-linecap="round" opacity=".95"/><path d="M20 86c14 4 66 4 80 0" fill="none" stroke="#D08436" stroke-width="2.2" stroke-linecap="round" opacity=".45"/><g class="bm-eye"><ellipse cx="46" cy="62" rx="6.4" ry="8" fill="#2A2730"/><ellipse cx="74" cy="62" rx="6.4" ry="8" fill="#2A2730"/><circle cx="48.3" cy="58.7" r="2.7" fill="#fff"/><circle cx="76.3" cy="58.7" r="2.7" fill="#fff"/><circle cx="44.3" cy="65.6" r="1.2" fill="#fff"/><circle cx="72.3" cy="65.6" r="1.2" fill="#fff"/></g><ellipse cx="33" cy="74" rx="7" ry="4.2" fill="#FF7F8A" opacity=".55"/><ellipse cx="87" cy="74" rx="7" ry="4.2" fill="#FF7F8A" opacity=".55"/><path d="M53.5 71.5q6.5 2 13 0q-1 9.5-6.5 9.5t-6.5-9.5z" fill="#9B2D2D" stroke="#2A2730" stroke-width="2.2" stroke-linejoin="round"/><path d="M56.3 77.6q3.7-2.8 7.4 0q-1 3-3.7 3t-3.7-3z" fill="#FF8C8C"/><ellipse cx="11" cy="76" rx="6" ry="8" fill="#F2AE5A" stroke="#B5671F" stroke-width="2.4" transform="rotate(-20 11 76)"/><g class="bm-arm"><ellipse cx="110" cy="54" rx="6" ry="9" fill="#F2AE5A" stroke="#B5671F" stroke-width="2.4" transform="rotate(30 110 54)"/></g></svg>';
  }
  window.BM_MASCOT = mascot;

  var css = '' +
    '#bm-nav,#bm-nav *,#bm-sheet,#bm-sheet *{box-sizing:border-box}' +
    '#bm-nav{position:relative;z-index:45;font-family:Nunito,"Baloo 2","Be Vietnam Pro",system-ui,-apple-system,sans-serif;background:linear-gradient(90deg,#FFF6E6,#FFEFF3 55%,#EAF8F1);border-bottom:1px solid rgba(181,103,31,.14);padding:env(safe-area-inset-top,0px) max(10px,env(safe-area-inset-right,0px)) 0 max(10px,env(safe-area-inset-left,0px))}' +
    '#bm-nav .bm-in{max-width:1180px;margin:0 auto;height:50px;display:flex;align-items:center;gap:8px}' +
    '#bm-nav a,#bm-nav button{-webkit-tap-highlight-color:transparent;font:inherit}' +
    '#bm-nav .bm-logo{display:flex;align-items:center;gap:6px;text-decoration:none;color:#5B3415;font-weight:900;font-size:19px;letter-spacing:-.2px;flex:none;padding:2px 6px 2px 0;border-radius:14px}' +
    '#bm-nav .bm-logo .bm-mascot{width:40px;height:38px;margin-top:2px;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}' +
    '#bm-nav .bm-logo:hover .bm-mascot,#bm-nav .bm-logo:active .bm-mascot{transform:rotate(-10deg) scale(1.12)}' +
    '#bm-nav .bm-logo span{background:linear-gradient(90deg,#C76A12,#E8577E);-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '#bm-nav .bm-sp{flex:1}' +
    '#bm-nav .bm-pills{display:none;gap:4px;align-items:center}' +
    '#bm-nav .bm-pill{display:flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:999px;text-decoration:none;color:#5E4A3C;font-weight:800;font-size:14.5px;transition:background .2s,transform .2s}' +
    '#bm-nav .bm-pill:hover{background:rgba(255,255,255,.75);transform:translateY(-1px)}' +
    '#bm-nav .bm-pill.on{background:var(--bmc);color:#fff;box-shadow:0 4px 12px -4px var(--bmc)}' +
    '#bm-nav .bm-pill i{font-style:normal;font-size:17px;line-height:1}' +
    '#bm-nav .bm-chip{display:flex;align-items:center;gap:6px;height:38px;padding:0 10px 0 12px;border-radius:999px;border:0;background:#fff;color:var(--bmc);font-weight:900;font-size:14.5px;box-shadow:0 2px 0 rgba(0,0,0,.06),0 4px 14px -6px var(--bmc);cursor:pointer;max-width:calc(100vw - 214px);white-space:nowrap;transition:transform .15s}' +
    '#bm-nav .bm-chip:active{transform:scale(.94)}' +
    '#bm-nav .bm-chip i{font-style:normal;font-size:18px;line-height:1}' +
    '#bm-nav .bm-chip span{overflow:hidden;text-overflow:ellipsis}' +
    '#bm-nav .bm-chip b{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--bmc);color:#fff;font-size:11px;margin-left:2px}' +
    '#bm-nav .bm-short{display:none}@media (max-width:399px){#bm-nav .bm-full{display:none}#bm-nav .bm-short{display:inline}}' +
    '@media (min-width:1040px){#bm-nav .bm-pills{display:flex}#bm-nav .bm-chip{display:none}}' +
    '#bm-nav .bm-theme{position:relative;flex:none;width:38px;height:38px;border-radius:50%;border:0;padding:0;background:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 0 rgba(0,0,0,.06),0 4px 12px -6px rgba(120,60,20,.5);transition:transform .15s,background .3s}' +
    '#bm-nav .bm-theme:active{transform:scale(.9)}' +
    '#bm-nav .bm-theme svg{position:absolute;width:22px;height:22px;transition:transform .45s cubic-bezier(.3,1.3,.5,1),opacity .3s}' +
    '#bm-nav .bm-sun{fill:#FFC233;stroke:#F08A24;stroke-width:2;stroke-linecap:round}' +
    '#bm-nav .bm-moon{fill:#8E7CF0;stroke:none;opacity:0;transform:rotate(-90deg) scale(.4)}' +
    'html[data-theme="dark"] #bm-nav .bm-sun{opacity:0;transform:rotate(90deg) scale(.4)}' +
    'html[data-theme="dark"] #bm-nav .bm-moon{opacity:1;transform:none;fill:#FFD86B}' +
    /* thanh + bảng chọn ở chế độ tối */
    'html[data-theme="dark"] #bm-nav{background:linear-gradient(90deg,#2A1E16,#2B1A22 55%,#16261F);border-bottom-color:rgba(255,220,180,.1)}' +
    'html[data-theme="dark"] #bm-nav .bm-logo span{background:linear-gradient(90deg,#FFC27A,#FF9DB5);-webkit-background-clip:text;background-clip:text}' +
    'html[data-theme="dark"] #bm-nav :is(.bm-chip,.bm-theme){background:#342820;box-shadow:0 2px 0 rgba(0,0,0,.3)}' +
    'html[data-theme="dark"] #bm-nav .bm-chip{color:var(--bmc2)}' +
    'html[data-theme="dark"] #bm-nav .bm-pill{color:#E8D6C6}html[data-theme="dark"] #bm-nav .bm-pill:hover{background:rgba(255,255,255,.08)}html[data-theme="dark"] #bm-nav .bm-pill.on{color:#fff}' +
    'html[data-theme="dark"] #bm-sheet .bm-pan{background:#241B15}' +
    'html[data-theme="dark"] #bm-sheet .bm-hd b{color:#F7EBDD}html[data-theme="dark"] #bm-sheet .bm-hd small,html[data-theme="dark"] #bm-sheet .bm-fx{color:#C9B3A2}' +
    'html[data-theme="dark"] #bm-sheet .bm-x{background:#3A2D24;color:#F7EBDD}html[data-theme="dark"] #bm-sheet .bm-grab{background:#4A3A2E}' +
    'html[data-theme="dark"] #bm-sheet .bm-tg{background:#4A3A2E}' +
    'html[data-theme="dark"] #bm-sheet .bm-card.on::before{background:#241B15}' +
    '@media print{#bm-nav,#bm-sheet{display:none!important}}' +
    /* sheet */
    '#bm-sheet{position:fixed;inset:0;z-index:2147482000;font-family:Nunito,"Baloo 2","Be Vietnam Pro",system-ui,-apple-system,sans-serif;visibility:hidden}' +
    '#bm-sheet.open{visibility:visible}' +
    '#bm-sheet .bm-bg{position:absolute;inset:0;background:rgba(60,35,20,.38);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .25s}' +
    '#bm-sheet.open .bm-bg{opacity:1}' +
    '#bm-sheet .bm-pan{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:560px;background:#FFFBF5;border-radius:30px 30px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));transform:translateY(105%);transition:transform .32s cubic-bezier(.2,.9,.3,1);box-shadow:0 -12px 40px rgba(0,0,0,.2)}' +
    '#bm-sheet.open .bm-pan{transform:none}' +
    '#bm-sheet .bm-grab{width:44px;height:5px;border-radius:9px;background:#E8D8C6;margin:0 auto 6px}' +
    '#bm-sheet .bm-hd{display:flex;align-items:center;gap:10px;margin:0 2px 12px}' +
    '#bm-sheet .bm-hd .bm-mascot{width:62px;height:58px;flex:none}' +
    '#bm-sheet .bm-hd b{display:block;font-size:20px;font-weight:900;color:#4A2A12;line-height:1.2}' +
    '#bm-sheet .bm-hd small{display:block;font-size:14px;font-weight:700;color:#8A6F5C}' +
    '#bm-sheet .bm-x{margin-left:auto;width:38px;height:38px;border-radius:50%;border:0;background:#F3E7D9;color:#6B4A33;font-size:20px;font-weight:900;cursor:pointer;flex:none}' +
    '#bm-sheet .bm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#bm-sheet .bm-card{position:relative;display:flex;flex-direction:column;gap:2px;padding:14px 14px 13px;border-radius:22px;text-decoration:none;color:#fff;background:linear-gradient(140deg,var(--bmc),var(--bmc2));box-shadow:0 8px 18px -10px var(--bmc);overflow:hidden;opacity:0;transform:translateY(12px);transition:transform .2s}' +
    '#bm-sheet.open .bm-card{animation:bmPop .35s ease-out forwards}' +
    '#bm-sheet .bm-card:active{transform:scale(.95)!important}' +
    '#bm-sheet .bm-card i{font-style:normal;font-size:30px;line-height:1.1;filter:drop-shadow(0 3px 3px rgba(0,0,0,.15))}' +
    '#bm-sheet .bm-card b{font-size:16.5px;font-weight:900;line-height:1.2;margin-top:4px}' +
    '#bm-sheet .bm-card small{font-size:12.5px;font-weight:700;opacity:.93;line-height:1.3}' +
    '#bm-sheet .bm-card::after{content:"";position:absolute;right:-18px;top:-18px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.18)}' +
    '#bm-sheet .bm-card.on::before{content:"Đang ở đây";position:absolute;right:10px;top:10px;font-size:11px;font-weight:900;background:rgba(255,255,255,.95);color:var(--bmc);padding:2px 8px;border-radius:99px;z-index:1}' +
    '#bm-sheet .bm-home{grid-column:1/-1;flex-direction:row;align-items:center;gap:10px;padding:11px 14px}' +
    '#bm-sheet .bm-home b{margin:0}' +
    '@keyframes bmPop{to{opacity:1;transform:none}}' +
    /* chuyển trang nhẹ nhàng: mỗi mục một kiểu trượt/mờ riêng, ngắn ~0.3s */
    '@keyframes bmFade{from{opacity:0}}' +
    'html.bm-fx-in body{animation:bmFade .32s ease-out both}' +
    'html.bm-leaving body{transition:opacity .16s ease-in;opacity:.35}' +
    '#bm-sheet .bm-fx{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px;padding:10px 6px 0;color:#8A6F5C;font-size:14px;font-weight:800}' +
    '#bm-sheet .bm-tg{position:relative;width:50px;height:30px;border-radius:99px;border:0;background:#E5D6C6;cursor:pointer;flex:none;transition:background .2s}' +
    '#bm-sheet .bm-tg::after{content:"";position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s}' +
    '#bm-sheet .bm-tg[aria-checked=true]{background:#12A66A}#bm-sheet .bm-tg[aria-checked=true]::after{transform:translateX(20px)}' +
    'html{scroll-behavior:smooth}' +
    '.bm-rv{opacity:0;transform:translateY(16px);transition:opacity .5s ease-out,transform .5s ease-out}.bm-rv.bm-seen{opacity:1;transform:none}' +
    '@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.bm-rv{opacity:1;transform:none;transition:none}}' +
    '.bm-mascot .bm-arm{transform-box:fill-box;transform-origin:15% 85%;animation:bmWave 2.8s ease-in-out infinite}' +
    '.bm-mascot .bm-eye{transform-box:fill-box;transform-origin:50% 50%;animation:bmBlink 4.4s infinite}' +
    '@keyframes bmWave{0%,55%,100%{transform:rotate(0)}65%{transform:rotate(-24deg)}75%{transform:rotate(6deg)}85%{transform:rotate(-18deg)}}' +
    '@keyframes bmBlink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}' +
    '@media (prefers-reduced-motion:reduce){#bm-sheet *,.bm-mascot *{animation:none!important;transition:none!important}#bm-sheet.open .bm-card{opacity:1;transform:none}}';
  var st = document.createElement('style'); st.id = 'bm-nav-css'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  if (!document.querySelector('link[href*="family=Nunito"]')) {
    var fl = document.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap';
    document.head.appendChild(fl);
  }

  function url(s) { return BASE + s.path; }
  function vars(el, s) { el.style.setProperty('--bmc', s.c); el.style.setProperty('--bmc2', s.c2); }

  /* ---------- thanh trên cùng ---------- */
  var nav = document.createElement('header'); nav.id = 'bm-nav'; vars(nav, cur);
  var pills = SECS.map(function (s) {
    return '<a class="bm-pill' + (s === cur ? ' on' : '') + '" data-bm-go="' + s.id + '" href="' + url(s) + '"' + (s === cur ? ' aria-current="page"' : '') + '><i>' + s.emo + '</i>' + s.short + '</a>';
  }).join('');
  nav.innerHTML = '<div class="bm-in"><a class="bm-logo" data-bm-go="home" href="' + BASE + '" aria-label="Bánh Mì – trang chủ">' + mascot() + '<span>Bánh Mì</span></a><div class="bm-sp"></div>' +
    '<nav class="bm-pills" aria-label="Các mục">' + pills + '</nav>' +
    '<button class="bm-chip" type="button" aria-haspopup="dialog" aria-label="Chuyển mục học"><i>' + cur.emo + '</i><span class="bm-full">' + (cur.id === 'home' ? 'Chọn mục học' : cur.name) + '</span><span class="bm-short">' + (cur.id === 'home' ? 'Chọn mục' : cur.short) + '</span><b>▼</b></button>' +
    '<button class="bm-theme" type="button" aria-label="Đổi giao diện sáng / tối" title="Sáng / tối"><svg class="bm-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.6"/><path d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M5.1 18.9l1.7-1.7M17.2 6.8l1.7-1.7"/></svg><svg class="bm-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z"/><circle cx="16.6" cy="5.4" r="1"/><circle cx="19.6" cy="9" r=".7"/></svg></button></div>';
  var b = document.body;
  if (b) {
    b.insertBefore(nav, b.firstChild);
    // trang có padding ở body (vd. PDF): kéo thanh ra sát mép màn hình
    var bleed = function () {
      var cs = getComputedStyle(b), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, pt = parseFloat(cs.paddingTop) || 0;
      nav.style.marginLeft = pl ? -pl + 'px' : ''; nav.style.marginRight = pr ? -pr + 'px' : ''; nav.style.marginTop = pt ? -pt + 'px' : '';
    };
    bleed(); addEventListener('resize', bleed);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bleed);
  }

  /* ---------- bảng chọn mục ---------- */
  var sheet = null;
  function buildSheet() {
    sheet = document.createElement('div'); sheet.id = 'bm-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'Chuyển mục học');
    var cards = SECS.slice(1).map(function (s, i) {
      return '<a class="bm-card' + (s === cur ? ' on' : '') + '" data-bm-go="' + s.id + '" href="' + url(s) + '" style="--bmc:' + s.c + ';--bmc2:' + s.c2 + ';animation-delay:' + (0.06 + i * 0.06) + 's"><i>' + s.emo + '</i><b>' + s.name + '</b><small>' + s.d + '</small></a>';
    }).join('');
    var h = SECS[0];
    cards += '<a class="bm-card bm-home' + (cur === h ? ' on' : '') + '" data-bm-go="home" href="' + BASE + '" style="--bmc:' + h.c + ';--bmc2:' + h.c2 + ';animation-delay:.32s"><i>🏠</i><b>Về trang chủ Bánh Mì</b></a>';
    sheet.innerHTML = '<div class="bm-bg"></div><div class="bm-pan"><div class="bm-grab"></div><div class="bm-hd">' + mascot() + '<div><b>Học gì tiếp nè?</b><small>Chạm vào một món để chuyển nha</small></div><button class="bm-x" type="button" aria-label="Đóng">✕</button></div><div class="bm-grid">' + cards + '<div class="bm-fx"><span>✨ Hiệu ứng chuyển trang</span><button class="bm-tg" type="button" role="switch" aria-label="Hiệu ứng chuyển trang" aria-checked="' + fxOn() + '"></button></div></div></div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.bm-bg').onclick = closeSheet;
    sheet.querySelector('.bm-x').onclick = closeSheet;
    var tg = sheet.querySelector('.bm-tg');
    tg.onclick = function () { var v = tg.getAttribute('aria-checked') !== 'true'; window.BM_FX.set(v); tg.setAttribute('aria-checked', String(fxOn())); };
    var y0 = null, pan = sheet.querySelector('.bm-pan');
    pan.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    pan.addEventListener('touchend', function (e) { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) closeSheet(); y0 = null; }, { passive: true });
  }
  function openSheet() {
    if (!sheet) buildSheet();
    sheet.offsetWidth; sheet.classList.add('open');
  }
  function closeSheet() { if (sheet) sheet.classList.remove('open'); }
  window.BM_OPEN_MENU = openSheet;
  nav.querySelector('.bm-chip').onclick = openSheet;
  nav.querySelector('.bm-theme').onclick = function () {
    var now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (window.BM_THEME) window.BM_THEME(now);
    else { document.documentElement.setAttribute('data-theme', now); try { localStorage.setItem('bm.theme', now); } catch (e) {} }
    try { window.dispatchEvent(new CustomEvent('bm-theme', { detail: now })); } catch (e) {}
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  /* ---------- hiệu ứng chuyển mục (nhẹ, có thể tắt) ---------- */
  var FXK = 'bm.fx';
  function fxOn() {
    try { if (localStorage.getItem(FXK) === 'off') return false; } catch (e) {}
    return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function setVT() {
    if (!window.BM_VT) { // trang chưa có nav-head.js
      var sc = document.createElement('script'); sc.src = BASE + 'shared/nav-head.js'; document.head.appendChild(sc); return;
    }
    window.BM_VT();
  }
  if (!window.BM_VT) setVT();
  var hasVT = 'PageRevealEvent' in window;
  // trình duyệt cũ (không có view transition): chỉ mờ nhẹ
  if (!hasVT && fxOn()) {
    var ref = '';
    try { ref = document.referrer && new URL(document.referrer).origin === location.origin ? document.referrer : ''; } catch (e) {}
    if (ref && ref.indexOf(BASE) === 0) {
      document.documentElement.classList.add('bm-fx-in');
      setTimeout(function () { document.documentElement.classList.remove('bm-fx-in'); }, 500);
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-bm-go]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.href;
    if (href.split('#')[0] === location.href.split('#')[0] && !/#/.test(href)) { e.preventDefault(); closeSheet(); return; }
    if (hasVT || !fxOn()) return; // để trình duyệt tự chuyển (có view transition)
    e.preventDefault();
    document.documentElement.classList.add('bm-leaving');
    setTimeout(function () { location.href = href; }, 150);
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { document.documentElement.classList.remove('bm-leaving'); closeSheet(); }
  });
  window.BM_FX = { on: fxOn, set: function (v) { try { localStorage.setItem(FXK, v ? 'on' : 'off'); } catch (e) {} setVT(); } };

  /* ---------- hiện dần khi cuộn tới (thêm class bm-rv vào phần tử) ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.bm-rv');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || !fxOn()) { els.forEach(function (x) { x.classList.add('bm-seen'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('bm-seen'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (x) { io.observe(x); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReveal); else initReveal();

  /* ---------- ghi lại ngày học ---------- */
  try {
    var d = new Date(); var today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var days = JSON.parse(localStorage.getItem('bm.days') || '[]');
    if (days[days.length - 1] !== today) { days.push(today); if (days.length > 120) days = days.slice(-120); localStorage.setItem('bm.days', JSON.stringify(days)); }
    var tv = JSON.parse(localStorage.getItem('bm.today') || '{}');
    if (tv.d !== today) tv = { d: today };
    if (cur.id !== 'home') { tv[cur.id] = 1; localStorage.setItem('bm.today', JSON.stringify(tv)); }
  } catch (e) {}
})();
