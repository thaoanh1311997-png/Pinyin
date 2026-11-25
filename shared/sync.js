/* Bánh Mì · ☁️ Đồng bộ giữa các máy (điện thoại, iPad, laptop)
   - Nạp từ nav-head.js trong <head>, TRƯỚC code của trang, nên trang không cần sửa gì.
   - Ghi nhận mọi thay đổi localStorage + các kho IndexedDB (bài video + file nghe, Sách của tôi, tài liệu ôn)
     rồi gửi lên kho riêng của tài khoản (Supabase: bảng có khoá theo người dùng + thư mục file riêng tư).
   - Máy khác mở web → tự kéo về, file nghe/sách tải về máy để dùng như cũ. */
(function () {
  'use strict';
  if (window.BM_SYNC) return;

  /* ================= cấu hình ================= */
  var CFG = window.BM_SYNC_CFG || {
    url: 'https://jkycaykxxiqzwvcvzcme.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpreWNheWt4eGlxend2Y3Z6Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxODA3NTUsImV4cCI6MjExMDc1Njc1NX0.TACnfcXWClp_pp2KDDHua636lDt5edIjwQdNW5GbMM4' // khoá công khai (anon), dữ liệu được bảo vệ theo từng tài khoản
  };
  var TXT = window.BM_SYNC_TXT || {};      // trang khác (vd. Xíu Mại) có thể đổi chữ trên bảng đăng nhập
  var ON = !!(CFG.url && CFG.key) && /^https?:/.test(location.protocol);
  var DOMAIN = '@banhmi-hoc.app';          // tên đăng nhập → email ảo (không gửi thư)
  var BUCKET = 'files';
  var MAX_FILE = 50 * 1024 * 1024;         // giới hạn mỗi file của gói miễn phí
  var PART = 40 * 1024 * 1024;             // file lớn hơn → cắt thành nhiều phần 40MB rồi ghép lại khi tải về
  var MAX_TOTAL = 400 * 1024 * 1024;       // trên mức này mới chỉ giữ trên máy
  var MAX_VAL = 1500000;                   // bỏ qua giá trị localStorage quá lớn
  // kho IndexedDB được đồng bộ (tên, cấu trúc để tạo khi máy chưa có)
  var DBS = {
    'bb-media': { v: 1, stores: { f: null } },               // file nghe / video của bài học video
    'bm-sach': { v: 1, stores: { books: 'id' } },              // Sách của tôi (PDF)
    'ot-docs': { v: 2, stores: { docs: 'id', pages: 'k' } },   // tài liệu ôn (on-thi/tai-lieu)
    'xiumai': { v: 1, stores: { ph: null } }                   // Xíu Mại (ảnh của bé)
  };
  // khoá chỉ dùng trên từng máy, không đồng bộ
  function skipKey(k) {
    return !k || k.indexOf('bm.sync.') === 0 || k.indexOf('sb-') === 0 || k === 'bm.fx' || k === 'bm.sach.zoom' || k === 'bb.srv' || k === 'bm.today' || k.indexOf('bm.fab.') === 0;
  }

  /* ================= lưu trạng thái đồng bộ ================= */
  var LS = window.localStorage, rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem, rawGet = Storage.prototype.getItem;
  function sget(k, d) { try { var v = rawGet.call(LS, 'bm.sync.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function sset(k, v) { try { if (v == null) rawRemove.call(LS, 'bm.sync.' + k); else rawSet.call(LS, 'bm.sync.' + k, JSON.stringify(v)); } catch (e) {} }
  var auth = sget('auth', null);               // {at, rt, exp, uid, name}
  var times = sget('t', {});                   // khoá → thời điểm sửa (ms)
  var dirtyKV = sget('dkv', {});               // khoá localStorage chờ gửi
  var dirtyRec = sget('drec', {});             // "db|store|key" chờ gửi
  var known = sget('blobs', {});               // đường dẫn file đã có trên mây → kích thước
  function saveState() { sset('t', times); sset('dkv', dirtyKV); sset('drec', dirtyRec); sset('blobs', known); }
  var applying = 0;                             // đang ghi dữ liệu kéo về → không đánh dấu lại
  var bootAt = Date.now(), touched = false;
  function now() { return Date.now(); }

  /* ================= theo dõi localStorage ================= */
  Storage.prototype.setItem = function (k, v) {
    var same = false;
    if (this === LS) try { same = rawGet.call(this, k) === String(v); } catch (e) {}
    var r = rawSet.apply(this, arguments);
    if (this === LS && !same && !applying && !skipKey(String(k))) markKV(String(k));
    return r;
  };
  Storage.prototype.removeItem = function (k) {
    var had = this === LS && rawGet.call(this, k) != null;
    var r = rawRemove.apply(this, arguments);
    if (had && !applying && !skipKey(String(k))) markKV(String(k));
    return r;
  };
  function markKV(k) { if (!ON || !auth) return; times[k] = now(); dirtyKV[k] = 1; saveState(); schedulePush(); }

  /* ================= theo dõi IndexedDB ================= */
  var P = window.IDBObjectStore && IDBObjectStore.prototype;
  function watched(store) {
    try { var dn = store.transaction.db.name; return DBS[dn] && (store.name in DBS[dn].stores) ? dn : null; } catch (e) { return null; }
  }
  function recId(db, st, key) { return db + '|' + st + '|' + JSON.stringify(key); }
  function markRec(db, st, key, del) {
    if (key == null || !ON || !auth) return;
    var id = recId(db, st, key); times[id] = now(); dirtyRec[id] = del ? 'd' : 1; saveState(); schedulePush();
  }
  if (P) {
    ['put', 'add'].forEach(function (m) {
      var orig = P[m];
      P[m] = function (val, key) {
        var req = orig.apply(this, arguments);
        var dn = !applying && watched(this);
        if (dn) {
          var k = key;
          if (k === undefined && this.keyPath && val) k = val[this.keyPath];
          var st = this.name;
          if (k === undefined) req.addEventListener('success', function () { markRec(dn, st, req.result); });
          else req.addEventListener('success', function () { markRec(dn, st, k); }); // chỉ khi ghi xong thật
        }
        return req;
      };
    });
    var odel = P['delete'];
    P['delete'] = function (key) {
      var req = odel.apply(this, arguments);
      var dn = !applying && watched(this);
      if (dn && (typeof key !== 'object' || key === null || Array.isArray(key))) markRec(dn, this.name, key, true);
      return req;
    };
  }

  // mở kho IndexedDB riêng của module (đóng ngay khi trang cần nâng cấp)
  function openDB(name) {
    var spec = DBS[name];
    return new Promise(function (ok, no) {
      var r;
      try { r = indexedDB.open(name); } catch (e) { return no(e); }
      r.onupgradeneeded = function () { // máy chưa có kho này → tạo đúng cấu trúc trang cần
        var d = r.result;
        Object.keys(spec.stores).forEach(function (s) {
          if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, spec.stores[s] ? { keyPath: spec.stores[s] } : undefined);
        });
      };
      r.onsuccess = function () {
        var d = r.result;
        d.onversionchange = function () { d.close(); };
        var miss = Object.keys(spec.stores).filter(function (s) { return !d.objectStoreNames.contains(s); });
        if (miss.length && d.version < spec.v) { // kho cũ thiếu bảng → nâng lên đúng phiên bản của trang
          var v = d.version; d.close();
          var r2 = indexedDB.open(name, spec.v);
          r2.onupgradeneeded = function () { var d2 = r2.result; miss.forEach(function (s) { if (!d2.objectStoreNames.contains(s)) d2.createObjectStore(s, spec.stores[s] ? { keyPath: spec.stores[s] } : undefined); }); };
          r2.onsuccess = function () { r2.result.onversionchange = function () { r2.result.close(); }; ok(r2.result); };
          r2.onerror = function () { no(r2.error); };
          return;
        }
        ok(d);
      };
      r.onerror = function () { no(r.error); };
      r.onblocked = function () { no(new Error('blocked')); };
    });
  }
  function idbReq(d, st, mode, fn) {
    return new Promise(function (ok, no) {
      var t; try { t = d.transaction(st, mode); } catch (e) { return no(e); }
      var q = fn(t.objectStore(st));
      t.oncomplete = function () { ok(q && q.result); };
      t.onerror = t.onabort = function () { no(t.error); };
    });
  }
  function idbAll(d, st) {
    return new Promise(function (ok) {
      var out = [];
      try {
        var c = d.transaction(st).objectStore(st).openCursor();
        c.onsuccess = function () { var x = c.result; if (x) { out.push([x.primaryKey, x.value]); x['continue'](); } else ok(out); };
        c.onerror = function () { ok(out); };
      } catch (e) { ok(out); }
    });
  }

  // ghi 1 bản ghi kéo về; Safari riêng tư không lưu được Blob → file nghe lưu dạng dữ liệu thô (trang video đọc được cả hai)
  function putVal(d, db, st, key, val) {
    var hasKP = !!DBS[db].stores[st];
    function once(v) { applying++; try { return idbReq(d, st, 'readwrite', function (s) { return hasKP ? s.put(v) : s.put(v, key); }); } finally { applying--; } }
    return once(val).catch(function (e) {
      if (/quota/i.test(((e && e.name) || '') + ((e && e.message) || '')) || db !== 'bb-media' || !val || !(val.blob instanceof Blob)) throw e;
      return val.blob.arrayBuffer().then(function (buf) { var v2 = {}; for (var k in val) v2[k] = val[k]; v2.type = val.blob.type; v2.blob = null; v2.buf = buf; return once(v2); });
    });
  }

  /* ================= gọi máy chủ ================= */
  function hdr(extra) {
    var h = { apikey: CFG.key, Authorization: 'Bearer ' + (auth ? auth.at : CFG.key) };
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  function jfetch(path, opt) {
    opt = opt || {};
    return fetch(CFG.url + path, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
        if (!r.ok) { var e = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ('HTTP ' + r.status)); e.status = r.status; e.body = j; throw e; }
        return j;
      });
    });
  }
  function setAuth(j, name) {
    auth = { at: j.access_token, rt: j.refresh_token, exp: now() + (j.expires_in || 3600) * 1000, uid: j.user && j.user.id || (auth && auth.uid), name: name || (auth && auth.name) };
    sset('auth', auth);
  }
  var refreshing = null;
  function token() {
    if (!auth) return Promise.reject(new Error('Chưa đăng nhập'));
    if (auth.exp - now() > 120000) return Promise.resolve(auth.at);
    if (!refreshing) refreshing = jfetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: auth.rt }) })
      .then(function (j) { setAuth(j); return auth.at; })
      .catch(function (e) { if (e.status === 400 || e.status === 401) { logout(true); } throw e; })
      .then(function (x) { refreshing = null; return x; }, function (e) { refreshing = null; throw e; });
    return refreshing;
  }
  function api(path, opt) {
    return token().then(function () { opt = opt || {}; opt.headers = hdr(opt.headers || {}); return jfetch(path, opt); });
  }

  /* ================= đóng gói dữ liệu IndexedDB (file → kho file) ================= */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function blobPath(id, sub) { return auth.uid + '/' + hash(id) + '-' + hash(id + '#' + sub) + '.bin'; }
  // thay Blob/ArrayBuffer bằng tham chiếu file, trả về danh sách file cần gửi
  // file lớn hơn 50MB: gửi từng phần 40MB, ghi danh sách phần vào tham chiếu
  function packBlob(v, id, ups, sub, ref) {
    var p = blobPath(id, sub); ref.__b = p; ref.size = v.size;
    if (v.size > MAX_FILE && v.size <= MAX_TOTAL) {
      ref.parts = [];
      for (var o = 0, i = 0; o < v.size; o += PART, i++) { var pp = i ? blobPath(id, sub + '#p' + i) : p; ref.parts.push(pp); ups.push({ path: pp, blob: v.slice(o, o + PART) }); }
    } else ups.push({ path: p, blob: v });
    return ref;
  }
  function pack(v, id, ups, sub) {
    sub = sub || 'v';
    if (v instanceof Blob) return packBlob(v, id, ups, sub, { type: v.type || '', name: v.name || undefined });
    if (v instanceof ArrayBuffer) return packBlob(new Blob([v]), id, ups, sub + ':ab', { ab: 1 });
    if (ArrayBuffer.isView && ArrayBuffer.isView(v) && !(v instanceof DataView)) return packBlob(new Blob([v]), id, ups, sub + ':u8', { u8: 1 });
    if (Array.isArray(v)) return v.map(function (x, i) { return pack(x, id, ups, sub + '.' + i); });
    if (v && typeof v === 'object' && !(v instanceof Date)) { var o = {}; for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = pack(v[k], id, ups, sub + '.' + k); return o; }
    return v;
  }
  function refs(v, out) {
    if (v && typeof v === 'object') { if (v.__b) out.push(v); else for (var k in v) refs(v[k], out); }
    return out;
  }
  function unpack(v, files) {
    if (v && typeof v === 'object') {
      if (v.__b) { var b = files[v.__b]; if (!b) return null; if (v.ab) return b._ab; if (v.u8) return new Uint8Array(b._ab); return b; }
      if (Array.isArray(v)) return v.map(function (x) { return unpack(x, files); });
      var o = {}; for (var k in v) o[k] = unpack(v[k], files); return o;
    }
    return v;
  }
  function upload(u) {
    if (u.blob.size > MAX_FILE) return Promise.reject(Object.assign(new Error('File quá lớn'), { big: 1 }));
    if (known[u.path] === u.blob.size) return Promise.resolve();
    return token().then(function () {
      return fetch(CFG.url + '/storage/v1/object/' + BUCKET + '/' + u.path, { method: 'POST', headers: hdr({ 'x-upsert': 'true', 'Content-Type': 'application/octet-stream' }), body: u.blob });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('Gửi file lỗi: ' + r.status + ' ' + t.slice(0, 120)); });
      known[u.path] = u.blob.size; sset('blobs', known);
    });
  }
  function getPart(path) {
    return token().then(function () {
      return fetch(CFG.url + '/storage/v1/object/authenticated/' + BUCKET + '/' + path, { headers: hdr({}) });
    }).then(function (r) {
      if (!r.ok) throw new Error('Tải file lỗi ' + r.status);
      return r.arrayBuffer();
    }).then(function (ab) { known[path] = ab.byteLength; return ab; });
  }
  function download(ref) {
    if (ref.parts && ref.parts.length) { // file lớn được cắt phần → tải lần lượt rồi ghép
      var bufs = [];
      return ref.parts.reduce(function (a, p) { return a.then(function () { return getPart(p).then(function (ab) { bufs.push(ab); }); }); }, Promise.resolve())
        .then(function () {
          var b = new Blob(bufs, { type: ref.type || '' });
          if (!ref.ab && !ref.u8) return b;
          var all = new Uint8Array(ref.size || bufs.reduce(function (n, x) { return n + x.byteLength; }, 0)), o = 0;
          bufs.forEach(function (x) { all.set(new Uint8Array(x), o); o += x.byteLength; });
          b._ab = all.buffer; return b;
        });
    }
    return getPart(ref.__b).then(function (ab) { var b = new Blob([ab], { type: ref.type || '' }); b._ab = ab; return b; });
  }

  /* ================= GỬI LÊN ================= */
  var pushT = null, busy = false, again = false, lastErr = '', progress = '';
  function schedulePush(ms) {
    if (!ON || !auth) return;
    clearTimeout(pushT); pushT = setTimeout(run, ms == null ? 2500 : ms);
    ui();
  }
  function pushKV() {
    var ks = Object.keys(dirtyKV); if (!ks.length) return Promise.resolve();
    var rows = ks.map(function (k) {
      var v = rawGet.call(LS, k);
      if (v != null && v.length > MAX_VAL) v = null;
      return { user_id: auth.uid, k: k, v: v, t: times[k] || now(), del: v == null };
    });
    return api('/rest/v1/kv?on_conflict=user_id,k', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) })
      .then(function () { ks.forEach(function (k) { delete dirtyKV[k]; }); saveState(); });
  }
  function pushRecs() {
    var ids = Object.keys(dirtyRec); if (!ids.length) return Promise.resolve();
    var byDb = {};
    ids.forEach(function (id) { var p = id.split('|'); (byDb[p[0]] = byDb[p[0]] || []).push(id); });
    var chain = Promise.resolve(), n = 0;
    Object.keys(byDb).forEach(function (dn) {
      chain = chain.then(function () { return openDB(dn); }).then(function (d) {
        var c2 = Promise.resolve();
        byDb[dn].forEach(function (id) {
          c2 = c2.then(function () {
            var p = id.split('|'), st = p[1], key = JSON.parse(p.slice(2).join('|'));
            progress = '⬆ ' + (++n) + '/' + ids.length; ui();
            return idbReq(d, st, 'readonly', function (s) { return s.get(key); }).then(function (val) {
              // không thấy trên máy mà cũng không phải do người dùng xoá (vd. ghi lỗi vì hết chỗ) → không báo xoá sang máy khác
              if (val === undefined && dirtyRec[id] !== 'd') { delete dirtyRec[id]; saveState(); return; }
              var ups = [], data = val === undefined ? null : pack(val, id, ups);
              return ups.reduce(function (a, u) { return a.then(function () { return upload(u); }); }, Promise.resolve())
                .then(function () {
                  return api('/rest/v1/rec?on_conflict=user_id,id', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify([{ user_id: auth.uid, id: id, db: dn, st: st, data: data, t: times[id] || now(), del: val === undefined }]) });
                })
                .then(function () { delete dirtyRec[id]; saveState(); })
                .catch(function (e) { if (e.big) { delete dirtyRec[id]; saveState(); toast('Có 1 file quá lớn (trên 400MB) nên chỉ lưu trên máy này'); } else throw e; });
            });
          });
        });
        return c2.then(function () { d.close(); }, function (e) { d.close(); throw e; });
      });
    });
    return chain;
  }

  /* ================= KÉO VỀ ================= */
  var changedHere = false;
  function isIdArr(a) { return Array.isArray(a) && a.length && a.every(function (x) { return x && typeof x === 'object' && x.id != null; }); }
  function isEnArr(a) { return Array.isArray(a) && a.length && a.every(function (x) { return x && typeof x === 'object' && x.id == null && typeof x.en === 'string'; }); }
  function mergeVal(local, remote) { // hai máy cùng sửa một danh sách (vd. danh sách bài học) → gộp theo id
    try {
      var a = JSON.parse(local), b = JSON.parse(remote);
      if (Array.isArray(a) && Array.isArray(b) && a.concat(b).every(function (x) { return typeof x === 'string'; })) {
        var u = b.slice(); a.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); });
        return JSON.stringify(u);
      }
      if (Array.isArray(a) && Array.isArray(b) && (!a.length || !b.length)) return JSON.stringify(a.length ? a : b);
      if (isEnArr(a) && isEnArr(b)) { // danh sách từ (Xíu Mại): gộp theo chữ tiếng Anh, không mất từ của máy nào
        var seen = {}, out2 = [];
        b.concat(a).forEach(function (x) { var k = String(x.en).trim().toLowerCase(); if (seen[k] == null) { seen[k] = out2.length; out2.push(x); } else if (x.ph && !out2[seen[k]].ph) out2[seen[k]] = x; });
        return JSON.stringify(out2);
      }
      if (isIdArr(a) && isIdArr(b)) {
        var pos = {}, out = [];
        b.concat(a).forEach(function (x) { // cùng một bài ở hai máy → giữ bản sửa sau cùng
          var j = pos[x.id];
          if (j == null) { pos[x.id] = out.length; out.push(x); }
          else if ((x.at || 0) > (out[j].at || 0)) out[j] = x;
        });
        if (out[0] && out[0].at != null) out.sort(function (x, y) { return (y.at || 0) - (x.at || 0); });
        return JSON.stringify(out);
      }
    } catch (e) {}
    return null;
  }
  function back(since) { var d = Date.parse(since); return isNaN(d) || d < 20000 ? since : new Date(d - 15000).toISOString(); }
  // lấy hết các dòng mới (từng trang), lùi 15 giây để không sót dòng ghi cùng lúc
  function fetchAll(table, cols, since, size) {
    var out = [], from = back(since);
    function page(off) {
      return api('/rest/v1/' + table + '?select=' + cols + '&order=updated_at.asc&updated_at=gt.' + encodeURIComponent(from) + '&limit=' + size + '&offset=' + off).then(function (rows) {
        out = out.concat(rows || []);
        return rows && rows.length === size ? page(off + size) : out;
      });
    }
    return page(0);
  }
  function pullKV(since) {
    return fetchAll('kv', 'k,v,t,del,updated_at', since, 500).then(function (rows) {
      var last = since;
      applying++;
      try {
        (rows || []).forEach(function (r) {
          if (r.updated_at > last) last = r.updated_at;
          if (skipKey(r.k)) return;
          var lt = times[r.k] || 0;
          if (dirtyKV[r.k]) { // máy này cũng đang sửa khoá này
            var cur = rawGet.call(LS, r.k), m = (cur != null && r.v != null) ? mergeVal(cur, r.v) : null;
            if (m != null) { if (m !== cur) { rawSet.call(LS, r.k, m); changedHere = true; } times[r.k] = Math.max(lt, r.t) + 1; return; }
            if (lt >= r.t) return;
            delete dirtyKV[r.k];
          } else if (lt >= r.t) return;
          var cur2 = rawGet.call(LS, r.k);
          if (r.del || r.v == null) { if (cur2 != null) { rawRemove.call(LS, r.k); changedHere = true; } }
          else if (cur2 !== r.v) { rawSet.call(LS, r.k, r.v); changedHere = true; }
          times[r.k] = r.t;
        });
      } finally { applying--; }
      saveState();
      return last;
    });
  }
  function pullRecs(since) {
    return fetchAll('rec', 'id,db,st,data,t,del,updated_at', since, 100).then(function (rows) {
      var last = since, todo = [];
      (rows || []).forEach(function (r) {
        if (r.updated_at > last) last = r.updated_at;
        if (!DBS[r.db]) return;
        if ((times[r.id] || 0) >= r.t) return;
        if (dirtyRec[r.id] && (times[r.id] || 0) >= r.t) return;
        if ((r.del || r.data == null) && keepMedia(r)) { times[r.id] = r.t; return; }
        todo.push(r);
      });
      var n = 0, chain = Promise.resolve();
      todo.forEach(function (r) {
        chain = chain.then(function () {
          progress = '⬇ ' + (++n) + '/' + todo.length; ui();
          var rs = r.del ? [] : refs(r.data, []), files = {};
          return rs.reduce(function (a, ref) { return a.then(function () { return download(ref).then(function (b) { files[ref.__b] = b; }); }); }, Promise.resolve())
            .then(function () { return openDB(r.db); })
            .then(function (d) {
              var key = JSON.parse(r.id.split('|').slice(2).join('|'));
              var pr;
              if (r.del || r.data == null) {
                applying++;
                try { pr = idbReq(d, r.st, 'readwrite', function (s) { return s['delete'](key); }); } finally { applying--; }
              } else pr = putVal(d, r.db, r.st, key, unpack(r.data, files));
              return pr.then(function () { d.close(); times[r.id] = r.t; delete dirtyRec[r.id]; changedHere = true; saveState(); }, function (e) { d.close(); throw e; });
            });
        });
      });
      return chain.then(function () { sset('known', null); sset('blobs', known); return last; });
    });
  }

  // file nghe của bài vẫn còn trong danh sách bài trên máy này → không xoá theo máy khác (giữ giọng gốc)
  function keepMedia(r) {
    if (r.db !== 'bb-media') return false;
    try {
      var key = JSON.parse(r.id.split('|').slice(2).join('|'));
      var list = JSON.parse(rawGet.call(LS, 'bb.lessons') || '[]');
      return list.some(function (x) { return x && x.id === key; });
    } catch (e) { return false; }
  }
  // lấy ngay 1 bản ghi (vd. file nghe của bài đang mở) mà không chờ vòng đồng bộ
  function fetchRec(db, st, key) {
    if (!ON || !auth || !DBS[db]) return Promise.resolve(false);
    var id = recId(db, st, key);
    return api('/rest/v1/rec?select=id,db,st,data,t,del&id=eq.' + encodeURIComponent(id)).then(function (rows) {
      var r = rows && rows[0];
      if (!r || r.del || r.data == null) return false;
      var files = {};
      return refs(r.data, []).reduce(function (a, ref) { return a.then(function () { return download(ref).then(function (b) { files[ref.__b] = b; }); }); }, Promise.resolve())
        .then(function () { return openDB(db); })
        .then(function (d) {
          return putVal(d, db, st, key, unpack(r.data, files)).then(function () { d.close(); if ((times[id] || 0) < r.t) times[id] = r.t; saveState(); return true; }, function (e) { d.close(); throw e; });
        });
    }).catch(function (e) { console.warn('[bm-sync] fetchRec', e); return false; });
  }
  // 1 lần: gửi lại các file nghe từng bị bỏ qua vì trên 50MB (giờ đã gửi được theo từng phần)
  function reseedMedia() {
    if (sget('media2', 0)) return Promise.resolve();
    return dbExists('bb-media').then(function (ex) {
      if (!ex) return;
      return openDB('bb-media').then(function (d) {
        return idbAll(d, 'f').then(function (rows) {
          d.close();
          rows.forEach(function (kv) { var v = kv[1], n = v && (v.blob ? v.blob.size : v.buf ? v.buf.byteLength : 0); if (n > MAX_FILE) { var id = recId('bb-media', 'f', kv[0]); dirtyRec[id] = 1; if (!times[id]) times[id] = now(); } });
        });
      });
    }).then(function () { sset('media2', 1); saveState(); }, function () {});
  }

  // lần đầu đăng nhập trên máy này: đưa mọi thứ đang có lên (để không mất bài cũ)
  function seedLocal() {
    var mk = 1; // thời điểm rất cũ: nếu trên mây đã có thì bản trên mây thắng (trừ danh sách → gộp)
    for (var i = 0; i < LS.length; i++) {
      var k = LS.key(i);
      if (skipKey(k)) continue;
      if (!times[k]) times[k] = mk;
      dirtyKV[k] = 1;
    }
    var chain = Promise.resolve();
    Object.keys(DBS).forEach(function (dn) {
      chain = chain.then(function () {
        return dbExists(dn).then(function (ex) {
          if (!ex) return;
          return openDB(dn).then(function (d) {
            var c = Promise.resolve();
            Object.keys(DBS[dn].stores).forEach(function (st) {
              c = c.then(function () {
                if (!d.objectStoreNames.contains(st)) return;
                return idbAll(d, st).then(function (rows) { rows.forEach(function (kv) { var id = recId(dn, st, kv[0]); if (!times[id]) times[id] = mk; dirtyRec[id] = 1; }); });
              });
            });
            return c.then(function () { d.close(); });
          });
        });
      });
    });
    return chain.then(saveState);
  }
  function dbExists(name) {
    if (indexedDB.databases) return indexedDB.databases().then(function (l) { return l.some(function (x) { return x.name === name; }); }).catch(function () { return true; });
    return Promise.resolve(true);
  }

  /* ================= vòng đồng bộ ================= */
  var lastOk = sget('last', 0), firstRun = sget('first', 0);
  function run() {
    if (!ON || !auth) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    if (!navigator.onLine) { lastErr = 'offline'; ui(); return Promise.resolve(); }
    busy = true; lastErr = ''; changedHere = false; ui();
    var cur = sget('cur', { kv: '1970-01-01T00:00:00Z', rec: '1970-01-01T00:00:00Z' });
    var p = Promise.resolve();
    if (firstRun) p = p.then(seedLocal);
    p = p.then(reseedMedia);
    p = p.then(function () { return pullKV(cur.kv); }).then(function (l) { cur.kv = l; sset('cur', cur); })
      .then(function () { return pullRecs(cur.rec); }).then(function (l) { cur.rec = l; sset('cur', cur); })
      .then(pushKV).then(pushRecs)
      .then(function () {
        lastOk = now(); sset('last', lastOk);
        var wasFirst = firstRun; firstRun = 0; sset('first', 0);
        if (changedHere) refreshPage(wasFirst);
      })
      .catch(function (e) { lastErr = e && e.message || 'lỗi'; console.warn('[bm-sync]', e); });
    return p.then(function () { busy = false; progress = ''; ui(); if (again) { again = false; schedulePush(300); } });
  }
  // đang nghe/xem gì đó thì tuyệt đối không tải lại trang
  function mediaBusy() {
    try {
      if (window.speechSynthesis && speechSynthesis.speaking) return true;
      if (document.querySelector('iframe[src*="youtube"]')) return true;
      var ms = document.querySelectorAll('audio,video');
      for (var i = 0; i < ms.length; i++) if (!ms[i].paused && !ms[i].ended) return true;
    } catch (e) {}
    return false;
  }
  // dữ liệu từ máy khác đã được ghi thầm vào máy này: trang tự cập nhật qua sự kiện 'bm-sync',
  // lần mở trang sau sẽ thấy đủ. Không hiện nút bấm, không bao giờ làm gián đoạn bài đang học.
  function refreshPage(force) {
    try { window.dispatchEvent(new CustomEvent('bm-sync', { detail: { changed: true } })); } catch (e) {}
    // chỉ tải lại khi trang vừa mở, chưa chạm/cuộn gì và không đang phát: người dùng không thấy gì bị đổi chỗ
    if (!mediaBusy() && !touched && now() - bootAt < 20000 && (window.scrollY || 0) < 5) { location.reload(); return; }
    if (force) toast(TXT.pulled || 'Đã lấy bài từ máy khác về máy này');
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) { addEventListener(ev, function () { touched = true; }, { capture: true, passive: true }); });

  if (ON && auth) {
    setTimeout(run, 300);
    setInterval(function () { if (document.visibilityState === 'visible') run(); }, 45000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') run(); else if (Object.keys(dirtyKV).length) flushKV(); });
    addEventListener('online', function () { run(); });
    addEventListener('pagehide', function () { if (Object.keys(dirtyKV).length) flushKV(); });
  }
  function flushKV() { // khi rời trang: gửi nhanh phần chữ (không chờ)
    if (!auth || auth.exp < now()) return;
    var ks = Object.keys(dirtyKV);
    var rows = ks.map(function (k) { var v = rawGet.call(LS, k); if (v != null && v.length > MAX_VAL) v = null; return { user_id: auth.uid, k: k, v: v, t: times[k] || now(), del: v == null }; });
    var body = JSON.stringify(rows); if (body.length > 60000) return;
    try { fetch(CFG.url + '/rest/v1/kv?on_conflict=user_id,k', { method: 'POST', keepalive: true, headers: hdr({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }), body: body }).then(function (r) { if (r.ok) { ks.forEach(function (k) { delete dirtyKV[k]; }); saveState(); } }).catch(function () {}); } catch (e) {}
  }

  /* ================= đăng nhập ================= */
  function slug(name) {
    var s = String(name || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9._-]+/g, '');
    return s;
  }
  function login(name, pass) {
    var u = slug(name);
    if (u.length < 3) return Promise.reject(new Error('Tên đăng nhập cần ít nhất 3 chữ (không dấu cũng được)'));
    if (String(pass).length < 6) return Promise.reject(new Error('Mật khẩu cần ít nhất 6 ký tự'));
    var body = JSON.stringify({ email: u + DOMAIN, password: pass });
    var h = { apikey: CFG.key, 'Content-Type': 'application/json' };
    return jfetch('/auth/v1/token?grant_type=password', { method: 'POST', headers: h, body: body }).then(function (j) { return { j: j, isNew: false }; })
      .catch(function (e) {
        if (e.status !== 400) throw e;
        // chưa có tài khoản → tạo luôn
        return jfetch('/auth/v1/signup', { method: 'POST', headers: h, body: body }).then(function (j) {
          if (!j.access_token) throw new Error('Không tạo được tài khoản');
          return { j: j, isNew: true };
        }, function (e2) {
          if (e2.status === 422 || e2.status === 400) throw new Error('Sai mật khẩu rồi, thử lại nha');
          throw e2;
        });
      })
      .then(function (r) {
        setAuth(r.j, u);
        // máy mới vào tài khoản: đồng bộ toàn bộ từ đầu
        times = {}; dirtyKV = {}; dirtyRec = {}; saveState();
        sset('cur', null); firstRun = 1; sset('first', 1);
        return r.isNew;
      });
  }
  function logout(silent) {
    try { if (auth && !silent) fetch(CFG.url + '/auth/v1/logout', { method: 'POST', headers: hdr({}) }); } catch (e) {}
    auth = null; sset('auth', null); sset('cur', null); sset('dkv', null); sset('drec', null); sset('t', null); sset('blobs', null);
    times = {}; dirtyKV = {}; dirtyRec = {}; known = {};
    ui();
  }

  /* ================= giao diện: nút ☁️ trên thanh trên cùng ================= */
  var css = '' +
    '#bm-nav .bm-cloud{position:relative;flex:none;width:38px;height:38px;border-radius:50%;border:0;padding:0;background:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 2px 0 rgba(0,0,0,.06),0 4px 12px -6px rgba(120,60,20,.5);transition:transform .15s;-webkit-tap-highlight-color:transparent}' +
    '#bm-nav .bm-cloud:active{transform:scale(.9)}' +
    '#bm-nav .bm-cloud svg{width:24px;height:24px}' +
    '#bm-nav .bm-cloud .bm-dot{position:absolute;right:1px;top:1px;width:12px;height:12px;border-radius:50%;border:2px solid #fff;background:#F2643F}' +
    '#bm-nav .bm-cloud[data-s=ok] .bm-dot{background:#12A66A}' +
    '#bm-nav .bm-cloud[data-s=busy] .bm-dot{background:#2F7BEA;animation:bmSyncP 1s ease-in-out infinite}' +
    '#bm-nav .bm-cloud[data-s=err] .bm-dot{background:#F2A33F}' +
    '@keyframes bmSyncP{50%{transform:scale(.6)}}' +
    '#bm-nav .bm-chip{max-width:calc(100vw - 262px)!important}' +
    'html[data-theme="dark"] #bm-nav .bm-cloud{background:#342820;box-shadow:0 2px 0 rgba(0,0,0,.3)}html[data-theme="dark"] #bm-nav .bm-cloud .bm-dot{border-color:#342820}' +
    '#bm-acct{position:fixed;inset:0;z-index:2147482001;font-family:Nunito,"Baloo 2","Be Vietnam Pro",system-ui,-apple-system,sans-serif;visibility:hidden}' +
    '#bm-acct *{box-sizing:border-box}#bm-acct{text-align:left;line-height:1.35;letter-spacing:normal}#bm-acct .sa-grab{border:0!important;outline:0!important}#bm-acct.open{visibility:visible}' +
    '#bm-acct .sa-bg{position:absolute;inset:0;background:rgba(60,35,20,.38);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .25s}#bm-acct.open .sa-bg{opacity:1}' +
    '#bm-acct .sa-pan{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:460px;background:#FFFBF5;color:#4A2A12;border-radius:30px 30px 0 0;padding:14px 18px calc(20px + env(safe-area-inset-bottom,0px));transform:translateY(105%);transition:transform .32s cubic-bezier(.2,.9,.3,1);box-shadow:0 -12px 40px rgba(0,0,0,.2)}' +
    '@media (min-width:700px){#bm-acct .sa-pan{bottom:auto;top:50%;border-radius:28px;transform:translateY(-40%) scale(.96);opacity:0;transition:transform .28s,opacity .2s}#bm-acct.open .sa-pan{transform:translateY(-50%);opacity:1}}' +
    '#bm-acct.open .sa-pan{transform:none}@media (min-width:700px){#bm-acct.open .sa-pan{transform:translateY(-50%)}}' +
    '#bm-acct .sa-grab{width:44px;height:5px;border-radius:9px;background:#E8D8C6;margin:0 auto 8px}' +
    '#bm-acct .sa-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px}#bm-acct .sa-hd .bm-mascot{width:58px;height:54px;flex:none}' +
    '#bm-acct .sa-hd b{display:block;font-size:20px;font-weight:900;line-height:1.2}#bm-acct .sa-hd small{display:block;font-size:14px;font-weight:700;color:#8A6F5C;line-height:1.35}' +
    '#bm-acct .sa-x{margin-left:auto;align-self:flex-start;width:38px;height:38px;border-radius:50%;border:0;background:#F3E7D9;color:#6B4A33;font-size:20px;font-weight:900;cursor:pointer;flex:none}' +
    '#bm-acct label{display:block;font-size:14px;font-weight:800;color:#8A6F5C;margin:10px 4px 5px}' +
    '#bm-acct input{width:100%;height:50px;border-radius:16px;border:2px solid #EADBCB;background:#fff;padding:0 14px;font:700 17px Nunito,system-ui,sans-serif;color:#3A2414;outline:none}' +
    '#bm-acct input:focus{border-color:#F08A24}' +
    '#bm-acct .sa-go{width:100%;height:54px;margin-top:16px;border:0;border-radius:18px;background:linear-gradient(140deg,#F08A24,#E8577E);color:#fff;font:900 18px Nunito,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 18px -8px #E8577E}' +
    '#bm-acct .sa-go:active{transform:scale(.97)}#bm-acct .sa-go[disabled]{opacity:.6}' +
    '#bm-acct .sa-msg{min-height:20px;margin:10px 4px 0;font-size:14.5px;font-weight:800;color:#D9481F}' +
    '#bm-acct .sa-note{margin:12px 4px 0;font-size:13.5px;font-weight:700;color:#8A6F5C;line-height:1.45}' +
    '#bm-acct .sa-stat{display:flex;align-items:center;gap:10px;padding:14px;border-radius:18px;background:#EAF8F1;color:#0D6B45;font-weight:800;font-size:15px;line-height:1.35}' +
    '#bm-acct .sa-stat i{font-style:normal;font-size:26px}#bm-acct .sa-stat.err{background:#FFF1E2;color:#9A4B12}' +
    '#bm-acct .sa-row{display:flex;gap:10px;margin-top:14px}#bm-acct .sa-row button{flex:1;height:50px;border-radius:16px;border:0;font:900 16px Nunito,system-ui,sans-serif;cursor:pointer}' +
    '#bm-acct .sa-b1{background:#12A66A;color:#fff}#bm-acct .sa-b2{background:#F3E7D9;color:#6B4A33}' +
    'html[data-theme="dark"] #bm-acct .sa-pan{background:#241B15;color:#F7EBDD}html[data-theme="dark"] #bm-acct .sa-hd small,html[data-theme="dark"] #bm-acct label,html[data-theme="dark"] #bm-acct .sa-note{color:#C9B3A2}' +
    'html[data-theme="dark"] #bm-acct input{background:#342820;border-color:#4A3A2E;color:#F7EBDD}html[data-theme="dark"] #bm-acct .sa-x,html[data-theme="dark"] #bm-acct .sa-b2{background:#3A2D24;color:#F7EBDD}' +
    'html[data-theme="dark"] #bm-acct .sa-stat{background:#16302A;color:#8FE3BE}html[data-theme="dark"] #bm-acct .sa-stat.err{background:#3A2A1A;color:#FFC98A}' +
    '#bm-stoast{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translate(-50%,30px);opacity:0;z-index:2147482002;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-radius:18px;background:#3A2414;color:#fff;font:800 15px Nunito,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:all .3s;max-width:calc(100vw - 32px)}' +
    '#bm-stoast.on{transform:translate(-50%,0);opacity:1}#bm-stoast button{border:0;border-radius:12px;background:#FFC861;color:#3A2414;font:900 14.5px Nunito,system-ui,sans-serif;padding:8px 12px;cursor:pointer;white-space:nowrap}' +
    '@media print{#bm-acct,#bm-stoast{display:none!important}}';
  var CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.56A5.8 5.8 0 0 0 6.6 8.6 4.95 4.95 0 0 0 7 18.5z" fill="#BFE3FF" stroke="#2F7BEA" stroke-width="1.9" stroke-linejoin="round"/><circle cx="10" cy="13.4" r="1.05" fill="#2A2730"/><circle cx="14.6" cy="13.4" r="1.05" fill="#2A2730"/><path d="M11.3 15.3q1 .8 2 0" fill="none" stroke="#2A2730" stroke-width="1.1" stroke-linecap="round"/></svg>';
  var btn = null, pan = null;
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function mount() {
    if (!ON || btn) return;
    var bar = document.querySelector('#bm-nav .bm-in'); if (!bar) return;
    ensureCss();
    btn = el('button', { type: 'button', 'class': 'bm-cloud', 'aria-label': 'Tài khoản & đồng bộ', title: 'Lưu bài học trên mọi máy' }, CLOUD + '<span class="bm-dot"></span>');
    var th = bar.querySelector('.bm-theme');
    bar.insertBefore(btn, th || null);
    btn.onclick = openPanel;
    ui();
    if (/[?&]dangnhap\b/.test(location.search)) openPanel();
  }
  function ago(t) {
    if (!t) return 'chưa lần nào';
    var s = Math.round((now() - t) / 1000);
    if (s < 60) return 'vừa xong'; if (s < 3600) return Math.round(s / 60) + ' phút trước';
    var d = new Date(t); return d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  }
  function ui() {
    if (window.BM_SYNC_ON_UI) try { window.BM_SYNC_ON_UI(); } catch (e) {}
    if (!btn) return;
    var pend = Object.keys(dirtyKV).length + Object.keys(dirtyRec).length;
    var s = !auth ? 'off' : busy ? 'busy' : (lastErr ? 'err' : (pend ? 'busy' : 'ok'));
    btn.setAttribute('data-s', s);
    btn.title = !auth ? 'Đăng nhập để thấy bài học trên mọi máy' : busy ? 'Đang đồng bộ ' + progress : lastErr ? 'Chưa đồng bộ được' : 'Đã đồng bộ ' + ago(lastOk);
    if (pan && pan.classList.contains('open') && auth) drawIn();
  }
  function ensureCss() { if (!document.getElementById('bm-sync-css')) { var s0 = el('style', { id: 'bm-sync-css' }); s0.textContent = css; document.head.appendChild(s0); } }
  function buildPanel() {
    ensureCss();
    pan = el('div', { id: 'bm-acct', role: 'dialog', 'aria-label': 'Tài khoản' }, '<div class="sa-bg"></div><div class="sa-pan"><div class="sa-grab"></div><div class="sa-body"></div></div>');
    document.body.appendChild(pan);
    pan.querySelector('.sa-bg').onclick = closePanel;
    var y0 = null, p = pan.querySelector('.sa-pan');
    p.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    p.addEventListener('touchend', function (e) { if (y0 != null && e.changedTouches[0].clientY - y0 > 80 && e.target.tagName !== 'INPUT') closePanel(); y0 = null; }, { passive: true });
  }
  function head(t, s) { return '<div class="sa-hd">' + (TXT.mascot || (window.BM_MASCOT ? window.BM_MASCOT() : '')) + '<div><b>' + t + '</b><small>' + s + '</small></div><button class="sa-x" type="button" aria-label="Đóng">✕</button></div>'; }
  function drawOut() {
    var b = pan.querySelector('.sa-body');
    b.innerHTML = head(TXT.outT || 'Lưu bài học trên mọi máy', TXT.outS || 'Đăng nhập 1 lần trên điện thoại, iPad, laptop là thấy y như nhau') +
      '<form autocomplete="on"><label for="bmu">Tên đăng nhập</label><input id="bmu" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="vd. thaoanh" required>' +
      '<label for="bmp">Mật khẩu</label><input id="bmp" name="password" type="password" autocomplete="current-password" placeholder="ít nhất 6 ký tự" required>' +
      '<button class="sa-go" type="submit">' + (TXT.go || 'Vào học 🥖') + '</button><div class="sa-msg" role="status"></div></form>' +
      '<div class="sa-note">' + (TXT.outNote || '🔒 Chưa có tài khoản thì tự tạo luôn. Dùng đúng tên + mật khẩu này trên máy khác. Sách, file nghe của bạn chỉ mình bạn xem được.') + '</div>';
    b.querySelector('.sa-x').onclick = closePanel;
    var f = b.querySelector('form'), go = b.querySelector('.sa-go'), msg = b.querySelector('.sa-msg');
    f.onsubmit = function (e) {
      e.preventDefault(); msg.textContent = ''; go.disabled = true; go.textContent = 'Đang vào…';
      login(b.querySelector('#bmu').value, b.querySelector('#bmp').value).then(function (isNew) {
        go.textContent = isNew ? 'Đã tạo tài khoản 🎉' : 'Xin chào 👋';
        installLoops();
        ui(); drawIn(); run();
      }).catch(function (er) {
        go.disabled = false; go.textContent = TXT.go || 'Vào học 🥖';
        msg.textContent = /fetch|network|Load failed/i.test(er.message) ? 'Không có mạng, thử lại sau nha' : er.message;
      });
    };
  }
  var loopsOn = false;
  function installLoops() {
    if (loopsOn) return; loopsOn = true;
    setInterval(function () { if (auth && document.visibilityState === 'visible') run(); }, 45000);
    document.addEventListener('visibilitychange', function () { if (auth && document.visibilityState === 'visible') run(); });
  }
  if (ON && auth) loopsOn = true;
  function drawIn() {
    var b = pan.querySelector('.sa-body');
    var pend = Object.keys(dirtyKV).length + Object.keys(dirtyRec).length;
    var st = busy ? '<div class="sa-stat"><i>🔄</i><div>Đang đồng bộ… ' + progress + '<br><small>Cứ học tiếp, không cần chờ</small></div></div>'
      : lastErr ? '<div class="sa-stat err"><i>' + (lastErr === 'offline' ? '📴' : '⚠️') + '</i><div>' + (lastErr === 'offline' ? 'Đang mất mạng. Có mạng lại sẽ tự gửi.' : 'Chưa đồng bộ được, sẽ tự thử lại.') + '</div></div>'
      : (lastOk ? '<div class="sa-stat"><i>✅</i><div>Đã lưu lên mây ' + ago(lastOk) : '<div class="sa-stat"><i>🔄</i><div>Đang chuẩn bị đồng bộ…') + (pend ? '<br><small>còn ' + pend + ' mục chờ gửi</small>' : '<br><small>' + (TXT.inOk || 'Máy nào đăng nhập cũng thấy bài này') + '</small>') + '</div></div>';
    var keep = b.querySelector('.sa-stat');
    if (keep && b.getAttribute('data-in')) { keep.outerHTML = st; return; }
    b.setAttribute('data-in', 1);
    b.innerHTML = head('Chào ' + (auth.name || 'bạn') + ' 👋', TXT.inS || 'Bài đã học, file nghe, sách, vở viết… tự lưu và hiện trên mọi máy') + st +
      '<div class="sa-row"><button class="sa-b1" type="button">🔄 Đồng bộ ngay</button><button class="sa-b2" type="button">Đăng xuất</button></div>' +
      '<div class="sa-note">' + (TXT.inNote || 'Mở web trên máy khác → bấm ☁️') + ' → đăng nhập tên <b>' + (auth.name || '') + '</b> là xong.</div>';
    b.querySelector('.sa-x').onclick = closePanel;
    b.querySelector('.sa-b1').onclick = function () { run(); };
    b.querySelector('.sa-b2').onclick = function () {
      var pendN = Object.keys(dirtyKV).length + Object.keys(dirtyRec).length;
      if (pendN && !window.confirm('Còn ' + pendN + ' mục chưa gửi lên. Vẫn đăng xuất?')) return;
      logout(); b.removeAttribute('data-in'); drawOut();
    };
  }
  function openPanel() {
    if (!pan) buildPanel();
    var b = pan.querySelector('.sa-body'); b.removeAttribute('data-in');
    if (auth) drawIn(); else drawOut();
    pan.offsetWidth; pan.classList.add('open');
    if (!auth) setTimeout(function () { var i = pan.querySelector('#bmu'); if (i && innerWidth > 700) i.focus(); }, 300);
  }
  function closePanel() { if (pan) pan.classList.remove('open'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  var tEl = null, tT = null;
  function toast(m, act, fn) {
    if (!document.body) return;
    if (!tEl) { tEl = el('div', { id: 'bm-stoast', role: 'status' }); ensureCss(); document.body.appendChild(tEl); }
    tEl.innerHTML = '<span>☁️ ' + m + '</span>' + (act ? '<button type="button">' + act + '</button>' : '');
    if (act) tEl.querySelector('button').onclick = function () { tEl.classList.remove('on'); fn(); };
    tEl.offsetWidth; tEl.classList.add('on');
    clearTimeout(tT); tT = setTimeout(function () { tEl.classList.remove('on'); }, act ? 15000 : 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  setTimeout(mount, 0); // nav.js chạy sau body mở

  window.BM_SYNC = { fetchRec: fetchRec, run: run, login: login, logout: logout, open: openPanel, state: function () { return { on: ON, auth: !!auth, name: auth && auth.name, busy: busy, err: lastErr, last: lastOk, pending: Object.keys(dirtyKV).length + Object.keys(dirtyRec).length }; } };
})();
