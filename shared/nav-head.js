/* Bánh Mì · đặt trong <head>: bật hiệu ứng chuyển trang nhẹ (View Transitions) trước khi trang hiện ra */
(function () {
  var me = document.currentScript;
  var BASE = new URL('../', me ? me.src : location.href).pathname;
  var rel = location.pathname.indexOf(BASE) === 0 ? location.pathname.slice(BASE.length) : '';
  var id = /^video\//.test(rel) ? 'video' : /^trasua\//.test(rel) ? 'trasua' : /^on-thi\//.test(rel) ? 'onthi' : /^pdf\//.test(rel) ? 'pdf' : /^vo\//.test(rel) ? 'vo' : /^game\//.test(rel) ? 'game' : /^sach\//.test(rel) ? 'sach' : /^(tom-tat|chu-han)\//.test(rel) ? 'soichu' : 'home';
  var IN = {
    video: 'from{opacity:0;transform:translateX(26px)}',
    trasua: 'from{opacity:0;transform:translateY(18px)}',
    onthi: 'from{opacity:0;transform:scale(.97)}',
    pdf: 'from{opacity:0;transform:translateY(-14px)}',
    vo: 'from{opacity:0;transform:translateY(14px) rotate(-.6deg)}',
    game: 'from{opacity:0;transform:scale(.96) rotate(.6deg)}',
    sach: 'from{opacity:0;transform:translateX(-22px)}',
    soichu: 'from{opacity:0;transform:translateY(16px) scale(.985)}',
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
    document.write('<link rel="stylesheet" id="bm-theme-css" href="' + BASE + 'shared/theme.css?v=13">');
    // đồng bộ giữa các máy: phải chạy trước code của trang
    if (!window.BM_SYNC) document.write('<script src="' + BASE + 'shared/sync.js?v=7"><\/script>');
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
/* Giữ mã máy chủ (Groq / Supadata) lâu dài: chép thêm vào IndexedDB, nếu localStorage bị Safari xoá thì tự lấy lại */
(function () {
  var K = ['bb.groq', 'bb.sdkey'];
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (e) {}
  try {
    var rq = indexedDB.open('bm-keys', 1);
    rq.onupgradeneeded = function () { rq.result.createObjectStore('k'); };
    rq.onsuccess = function () {
      var db = rq.result, st = db.transaction('k', 'readwrite').objectStore('k');
      K.forEach(function (k) {
        var v = null; try { v = localStorage.getItem(k); } catch (e) {}
        if (v && v.length > 9) { st.put(v, k); return; }
        var g = st.get(k); g.onsuccess = function () { if (g.result) { try { localStorage.setItem(k, g.result); } catch (e) {} } };
      });
    };
  } catch (e) {}
  // gọi khi key sai để xoá hẳn (cả bản dự phòng)
  window.BM_dropKey = function (k) {
    try { localStorage.removeItem(k); } catch (e) {}
    try { var r = indexedDB.open('bm-keys', 1); r.onsuccess = function () { try { r.result.transaction('k', 'readwrite').objectStore('k').delete(k); } catch (e) {} }; } catch (e) {}
  };
  window.BM_saveKey = function (k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
    try { var r = indexedDB.open('bm-keys', 1); r.onupgradeneeded = function () { r.result.createObjectStore('k'); }; r.onsuccess = function () { try { r.result.transaction('k', 'readwrite').objectStore('k').put(v, k); } catch (e) {} }; } catch (e) {}
  };
})();
