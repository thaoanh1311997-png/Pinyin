/* Bánh Mì · đặt trong <head>: bật hiệu ứng chuyển trang nhẹ (View Transitions) trước khi trang hiện ra */
(function () {
  var me = document.currentScript;
  var BASE = new URL('../', me ? me.src : location.href).pathname;
  var rel = location.pathname.indexOf(BASE) === 0 ? location.pathname.slice(BASE.length) : '';
  var id = /^video\//.test(rel) ? 'video' : /^trasua\//.test(rel) ? 'trasua' : /^on-thi\//.test(rel) ? 'onthi' : /^pdf\//.test(rel) ? 'pdf' : /^vo\//.test(rel) ? 'vo' : 'home';
  var IN = {
    video: 'from{opacity:0;transform:translateX(26px)}',
    trasua: 'from{opacity:0;transform:translateY(18px)}',
    onthi: 'from{opacity:0;transform:scale(.97)}',
    pdf: 'from{opacity:0;transform:translateY(-14px)}',
    vo: 'from{opacity:0;transform:translateY(14px) rotate(-.6deg)}',
    home: 'from{opacity:0;transform:scale(1.025)}'
  };
  // giao diện sáng/tối dùng chung (lưu trên máy: bm.theme)
  var de = document.documentElement, th = 'light';
  try { th = localStorage.getItem('bm.theme') === 'dark' ? 'dark' : 'light'; } catch (e) {}
  de.setAttribute('data-theme', th); de.classList.add('bm-s-' + id); de.style.colorScheme = th;
  window.BM_THEME = function (t) {
    th = t === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem('bm.theme', th); } catch (e) {}
    de.setAttribute('data-theme', th); de.style.colorScheme = th;
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = th === 'dark' ? '#1B1410' : '#FFF7EC';
    return th;
  };
  window.BM_THEME_GET = function () { return th; };
  if (document.readyState === 'loading') {
    document.write('<link rel="stylesheet" id="bm-theme-css" href="' + BASE + 'shared/theme.css?v=11">');
    document.addEventListener('DOMContentLoaded', function () { window.BM_THEME(th); });
  }
  function on() {
    try { if (localStorage.getItem('bm.fx') === 'off') return false; } catch (e) {}
    return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  var st = document.getElementById('bm-vt');
  if (!st) { st = document.createElement('style'); st.id = 'bm-vt'; (document.head || document.documentElement).appendChild(st); }
  window.BM_VT = function () {
    st.textContent = on() ? '@view-transition{navigation:auto}@keyframes bmVtOut{to{opacity:0}}@keyframes bmVtIn{' + IN[id] + '}' +
      '::view-transition-old(root){animation:bmVtOut .18s ease-in both}' +
      '::view-transition-new(root){animation:bmVtIn .32s cubic-bezier(.2,.8,.3,1) both}' : '@view-transition{navigation:none}';
  };
  window.BM_VT();
})();
