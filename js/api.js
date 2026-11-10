// api.js — klien REST (fetch text/plain → tanpa preflight), sesi, dan Store (SWR + cache + batch)
(function () {
  const Session = window.Session = {
    token: null, user: null,
    load: function () { const s = U.ls.get('proker.sess', null); if (s && s.token && s.exp > Date.now()) { this.token = s.token; this.user = s.user; return true; } return false; },
    save: function (token, user, exp) { this.token = token; this.user = user; U.ls.set('proker.sess', { token: token, user: user, exp: exp || Date.now() + 11 * 3600 * 1000 }); },
    clear: function () { this.token = null; this.user = null; U.ls.del('proker.sess'); }
  };

  const API = window.API = { lastMs: 0, onSesi: null, inflight: 0 };

  function post(action, data, reqId, token) {
    const url = (window.APP_CONFIG || {}).API_URL;
    if (!url || /GANTI_/.test(url)) return Promise.reject(Object.assign(new Error('URL API belum diisi di js/config.js'), { code: 'CONFIG' }));
    const ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 45000);
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, token: token || null, reqId: reqId || '', data: data || {} }), signal: ctl.signal, redirect: 'follow' })
      .then(function (r) { clearTimeout(to); return r.json(); })
      .catch(function (e) { clearTimeout(to); throw Object.assign(new Error(e && e.name === 'AbortError' ? 'Server lama merespons. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa koneksi internet.'), { code: 'JARINGAN' }); });
  }

  // call(action, data, {write:true, token}) → data | throw {message, code}
  API.call = function (action, data, opts) {
    opts = opts || {};
    const write = opts.write !== undefined ? opts.write : /\.(simpan|hapus|ubah|tambah|ajukan|setuju|tolak|terbit|upload|kirim|impor|duplikat|set|batal|mulai|selesai|review|rollback|presensi|konfirmasi|blast|tes|baru|bersih)/.test(action);
    const reqId = write ? U.uuid() : '';
    const tok = opts.token !== undefined ? opts.token : Session.token;
    API.inflight++;
    const run = function (n) {
      return post(action, data, reqId, tok).catch(function (e) { if (!write && n < 1 && e.code === 'JARINGAN') return run(n + 1); throw e; });
    };
    return run(0).then(function (res) {
      API.inflight--; API.lastMs = res && res.ms || 0;
      if (res && res.success) return res.data;
      const err = Object.assign(new Error((res && res.message) || 'Terjadi kesalahan.'), { code: res && res.code || 'GALAT' });
      if (err.code === 'SESI' && API.onSesi) API.onSesi();
      throw err;
    }, function (e) { API.inflight--; throw e; });
  };
  API.batch = function (calls) {
    return API.call('batch', { calls: calls }, { write: false }).then(function (r) { return r.hasil; });
  };
  // Unggah berkas (base64) — satu kali jalan, ≤ 10 MB
  API.upload = function (action, file, extra) {
    return U.fileToBase64(file).then(function (b64) {
      return API.call(action, Object.assign({}, extra || {}, { nama: file.name, mime: file.type || 'application/octet-stream', base64: b64 }), { write: true });
    });
  };
  API.unduh = function (action, data, namaDefault) {
    return API.call(action, data, { write: false }).then(function (r) {
      U.saveBlob(U.b64ToBlob(r.base64, r.mime), r.nama || namaDefault || 'berkas'); return r;
    });
  };

  // ------------------------------------------------------------------ Store (SWR)
  const mem = {}, flight = {}, PERSIST = 'proker.st.';
  const Store = window.Store = {
    TTL: 60000,
    get: function (k) { return mem[k] ? mem[k].d : undefined; },
    meta: function (k) { return mem[k]; },
    set: function (k, d, persist) { mem[k] = { d: d, t: Date.now(), h: U.hash(d), p: !!persist || (mem[k] && mem[k].p) }; if (mem[k].p) U.ls.set(PERSIST + (Session.user ? Session.user.email : '') + k, { d: d, t: Date.now() }); },
    patch: function (k, fn) { if (mem[k]) { const d = fn(mem[k].d); mem[k].d = d; mem[k].h = U.hash(d); } },
    invalidate: function (prefix) { Object.keys(mem).forEach(function (k) { if (k.indexOf(prefix) === 0) mem[k].t = 0; }); },
    clear: function () { Object.keys(mem).forEach(function (k) { delete mem[k]; }); },
    restore: function (k) { // muat dari localStorage untuk cat pertama instan
      const v = U.ls.get(PERSIST + (Session.user ? Session.user.email : '') + k, null);
      if (v && !mem[k]) mem[k] = { d: v.d, t: 0, h: U.hash(v.d), p: true };
      return mem[k] ? mem[k].d : undefined;
    },
    // load: SWR. opts: {ttl, force, persist, render(d, info), error(e), loading()}
    load: function (key, action, data, opts) {
      opts = opts || {}; const ttl = opts.ttl == null ? Store.TTL : opts.ttl;
      if (opts.persist && !mem[key]) Store.restore(key);
      const m = mem[key], fresh = m && (Date.now() - m.t) < ttl && !opts.force;
      if (m && opts.render) opts.render(m.d, { cached: true, fresh: !!fresh });
      else if (!m && opts.loading) opts.loading();
      if (fresh) return Promise.resolve(m.d);
      if (flight[key]) return flight[key];
      const before = m ? m.h : null;
      flight[key] = API.call(action, data, { write: false }).then(function (d) {
        delete flight[key]; Store.set(key, d, opts.persist);
        if (opts.render && mem[key].h !== before) opts.render(d, { cached: false, fresh: true });
        return d;
      }, function (e) {
        delete flight[key];
        if (opts.error && !m) opts.error(e); else if (m && !opts.silent && window.UI) UI.toast(e.message, 'warn');
        throw e;
      });
      flight[key].catch(function () {});
      return flight[key];
    },
    // prefetch banyak sekaligus lewat satu batch; items: [{key, action, data}]
    prefetch: function (items, persist) {
      const todo = items.filter(function (i) { return !mem[i.key] || Date.now() - mem[i.key].t > Store.TTL; });
      if (!todo.length) return Promise.resolve();
      return API.batch(todo.map(function (i) { return { action: i.action, data: i.data || {} }; })).then(function (hasil) {
        hasil.forEach(function (h, ix) { if (h.success) Store.set(todo[ix].key, h.data, persist); });
      }).catch(function () {});
    },
    // Tulis optimis: ubah tampilan segera, kirim ke server, batalkan bila gagal
    // opsi: {apply(), rollback(), refresh: 'prefix'}
    write: function (action, data, opts) {
      opts = opts || {};
      if (opts.apply) opts.apply();
      return API.call(action, data, { write: true }).then(function (r) {
        if (opts.invalidate) [].concat(opts.invalidate).forEach(Store.invalidate);
        if (opts.ok) opts.ok(r); return r;
      }, function (e) { if (opts.rollback) opts.rollback(); if (window.UI) UI.toast(e.message, 'err'); if (opts.fail) opts.fail(e); throw e; });
    }
  };
})();
