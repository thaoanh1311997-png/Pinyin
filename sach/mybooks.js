/* Bánh Mì · 📚 "Sách của tôi": sách PDF của chính bạn, lưu NGAY TRÊN MÁY (IndexedDB), không tải lên mạng.
   Dùng chung cho sach/index.html, sach/doc.html, pdf/index.html. */
(function () {
  var DB = 'bm-sach', ST = 'books', dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (ok, no) {
      if (!window.indexedDB) return no(new Error('Trình duyệt không hỗ trợ lưu sách'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains(ST)) r.result.createObjectStore(ST, { keyPath: 'id' }); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { dbp = null; no(r.error); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (ok, no) {
        var t = d.transaction(ST, mode), s = t.objectStore(ST), res;
        res = fn(s);
        t.oncomplete = function () { ok(res && 'result' in res ? res.result : res); };
        t.onerror = t.onabort = function () { no(t.error || new Error('Lỗi lưu sách')); };
      });
    });
  }
  // tên đẹp cho file sách quen thuộc
  function niceName(fn) {
    var base = fn.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim();
    var m = base.match(/han\s*yu\s*jiao\s*cheng\D*(\d)\s*[-–. ]\s*(\d)/i) || base.match(/汉语教程\D*(\d)\D+(\d)/);
    if (m) {
      var a = +m[1], b = +m[2], q = (a - 1) * 2 + b, cn = ['一', '二', '三'][a - 1] || a;
      return { t: 'Hán ngữ quyển ' + q, zh: '汉语教程 第' + cn + '册（' + (b === 1 ? '上' : '下') + '）' };
    }
    m = base.match(/^h[aá]n\s*ng[uữ]\D*(\d)/i);
    if (m) return { t: 'Hán ngữ quyển ' + m[1], zh: '汉语教程' };
    return { t: base, zh: '' };
  }
  function list() {
    return tx('readonly', function (s) { return s.getAll(); }).then(function (a) {
      return (a || []).map(function (b) { return { id: b.id, name: b.name, zh: b.zh, file: b.file, size: b.size, added: b.added, cover: b.cover, pages: b.pages }; })
        .sort(function (x, y) { return x.added - y.added; });
    });
  }
  function get(id) { return tx('readonly', function (s) { return s.get(id); }).then(function (o) { if (o && !o.blob && o.buf) o.blob = new Blob([o.buf], { type: 'application/pdf' }); return o; }); }
  function put(o) { return tx('readwrite', function (s) { return s.put(o); }); }
  function del(id) { return tx('readwrite', function (s) { return s.delete(id); }); }
  function add(file) {
    var nm = niceName(file.name || 'Sách');
    var o = { id: 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: nm.t, zh: nm.zh, file: file.name, size: file.size, added: Date.now(), blob: null, cover: '', pages: 0 };
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    if (!file.size) return Promise.reject(new Error('file trống (0 KB), có thể chưa tải về máy xong'));
    // Lưu dạng Blob cắt từ file (không chép cả cuốn vào bộ nhớ). Safari cũ không lưu được → chép ra Blob rồi thử lại.
    o.blob = file.slice(0, file.size, 'application/pdf');
    return put(o).catch(function (e) {
      if (/quota/i.test((e && e.name || '') + (e && e.message || ''))) throw e;
      return file.arrayBuffer().then(function (buf) {
        o.blob = new Blob([buf], { type: 'application/pdf' });
        // Safari chế độ riêng tư không lưu được Blob → lưu thẳng dữ liệu
        return put(o).catch(function (e2) { if (/quota/i.test((e2 && e2.name || '') + (e2 && e2.message || ''))) throw e2; o.blob = null; o.buf = buf; return put(o); });
      });
    }).catch(function (e) {
      if (/quota/i.test((e && e.name || '') + (e && e.message || ''))) throw new Error('máy hết chỗ lưu sách (cuốn này ' + Math.round(file.size / 1048576) + ' MB). Xoá bớt sách cũ rồi thử lại');
      throw e;
    }).then(function () { return o; });
  }
  function setCover(id, cover, pages) {
    return get(id).then(function (o) { if (!o) return; o.cover = cover; if (pages) o.pages = pages; return put(o); });
  }
  window.BM_MYBOOKS = { list: list, get: get, add: add, del: del, setCover: setCover, niceName: niceName };
})();
