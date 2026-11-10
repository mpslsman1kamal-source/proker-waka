// pengguna.js — W-16 Pengguna & Log + tab turunan: Sekolah, WA & Notifikasi, CRM, Impor Data, Keamanan
(function () {
  const E = U.esc;
  const TABS = [['pengguna', 'Pengguna'], ['log', 'Log Audit'], ['sekolah', 'Pengaturan Sekolah'], ['notif', 'WA & Notifikasi'], ['crm', 'Kontak (CRM)'], ['impor', 'Impor Data'], ['aman', 'Keamanan']];
  let root, tab = 'pengguna', body;
  const err = function (e) { UI.toast(e.message || String(e), 'err'); };
  const sw = function (name, on, label) { return '<label class="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#F1F5F9]"><span class="text-body-default font-medium">' + label + '</span><input type="checkbox" data-sw="' + name + '"' + (on ? ' checked' : '') + '/></label>'; };
  const load = function (key, action, data, draw, ttl) { return Store.load(key, action, data || {}, { ttl: ttl || 20000, render: draw, loading: function () { body.innerHTML = UI.skelPage(); }, error: function (e) { body.innerHTML = UI.errorRetry(e.message); } }).catch(function () {}); };

  // ---------- Pengguna ----------
  const T = {};
  T.pengguna = function (f) {
    let q = '', d;
    const draw = function (x) {
      if (x) d = x; const r = d.ringkas, rows = U.search(d.rows, q, ['nama', 'email', 'nip', 'mata_pelajaran']);
      body.innerHTML = '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">' + UI.kpiSolid({ label: 'Total pengguna', value: d.total, tone: 'blue', icon: 'group' }) + UI.kpiSolid({ label: 'Aktif', value: r.aktif, tone: 'green', icon: 'how_to_reg' }) + UI.kpiSolid({ label: 'Guru', value: r.guru, tone: 'teal', icon: 'school' }) + UI.kpiSolid({ label: 'Waka / Kepsek', value: r.waka + ' / ' + r.kepsek, tone: 'orange', icon: 'admin_panel_settings' }) + '</div><div class="card p-3 mb-3 flex gap-2 flex-wrap"><input class="inp flex-1 min-w-[180px]" data-q placeholder="Cari nama, email, NIP, mapel…" value="' + E(q) + '"/><button class="btn btn-pri" data-u-baru>' + UI.icon('person_add', 'text-[18px]') + ' Tambah</button></div><div class="card p-0 overflow-hidden">' + UI.table({ rows: rows, cols: [{ l: 'Pengguna', r: function (u) { return '<div class="flex items-center gap-2">' + UI.avatar(u.nama, 32) + '<div><div class="font-medium">' + E(u.nama) + '</div><div class="text-caption text-on-surface-variant">' + E(u.email) + '</div></div></div>'; } }, { l: 'Peran', r: function (u) { return UI.badge(u.peran, u.role === 'waka' ? 'blue' : u.role === 'kepsek' ? 'purple' : 'gray'); } }, { l: 'Mapel', r: function (u) { return E(u.mata_pelajaran || '—'); } }, { l: 'WA', r: function (u) { return u.no_wa ? '<span class="font-mono-data">' + E(u.no_wa) + '</span>' : '—'; } }, { l: 'Status', r: function (u) { return u.status_aktif === 'TIDAK' ? UI.badge('Nonaktif', 'red') : UI.badge('Aktif', 'green'); } }, { l: '', cls: 'text-right whitespace-nowrap', r: function (u) { return '<button class="btn btn-sm" data-u-ubah="' + E(u.email) + '">Ubah</button> <button class="btn btn-sm" data-u-tog="' + E(u.email) + '" data-aktif="' + (u.status_aktif === 'TIDAK' ? 1 : 0) + '">' + (u.status_aktif === 'TIDAK' ? 'Aktifkan' : 'Nonaktifkan') + '</button> <button class="btn btn-sm" data-u-hapus="' + E(u.email) + '" aria-label="Hapus">' + UI.icon('delete', 'text-[16px] text-[#B91C1C]') + '</button>'; } }] }) + '</div>';
      if (q) { const i = U.$('[data-q]', body); i.focus(); i.setSelectionRange(q.length, q.length); }
    };
    const reload = function () { Store.invalidate('pengguna'); Store.invalidate('opsi'); return load('adm:pengguna', 'pengguna.list', {}, draw, 5000); };
    load('adm:pengguna', 'pengguna.list', {}, draw);
    body._h = {
      input: function (e) { if (e.target.matches('[data-q]')) { q = e.target.value; clearTimeout(body._t); body._t = setTimeout(draw, 120); } },
      click: function (e) {
        const b = e.target.closest('button'); if (!b) return;
        if (b.matches('[data-u-baru]')) form(null); else if (b.dataset.uUbah) form(d.rows.find(function (u) { return u.email === b.dataset.uUbah; }));
        else if (b.dataset.uTog) UI.busy(b, API.call('pengguna.nonaktifkan', { email: b.dataset.uTog, aktif: b.dataset.aktif === '1' }).then(function () { UI.toast('Status diperbarui.', 'ok'); return reload(); }).catch(err));
        else if (b.dataset.uHapus) UI.confirm('Hapus pengguna ' + b.dataset.uHapus + '? Tindakan ini tidak dapat dibatalkan.', { danger: true, ok: 'Hapus' }).then(function (y) { if (y) API.call('pengguna.hapus', { email: b.dataset.uHapus }).then(function () { UI.toast('Pengguna dihapus.', 'ok'); return reload(); }).catch(err); });
      }
    };
    function form(u) {
      const m = UI.modal({ title: u ? 'Ubah pengguna' : 'Tambah pengguna', wide: true, body: '<form novalidate class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + UI.field({ name: 'nama', label: 'Nama lengkap', required: true }) + UI.field({ name: 'email', label: 'Email Google', type: 'email', required: true, disabled: !!u }) + UI.field({ name: 'nip', label: 'NIP' }) + UI.field({ name: 'role', label: 'Peran', type: 'select', required: true, options: [{ v: 'guru', l: 'Guru' }, { v: 'waka', l: 'Waka Kurikulum' }, { v: 'kepsek', l: 'Kepala Sekolah' }] }) + UI.field({ name: 'mata_pelajaran', label: 'Mata pelajaran' }) + UI.field({ name: 'no_wa', label: 'No. WhatsApp', placeholder: '08xxxxxxxxxx' }) + UI.field({ name: 'golongan', label: 'Golongan' }) + UI.field({ name: 'status_aktif', label: 'Status', type: 'select', options: [{ v: 'YA', l: 'Aktif' }, { v: 'TIDAK', l: 'Nonaktif' }] }) + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn btn-pri" data-ok>Simpan</button>' });
      UI.fill(m.el, u || { role: 'guru', status_aktif: 'YA' });
      U.$('[data-ok]', m.el).onclick = function (e) { const v = UI.validate(U.$('form', m.el), { nama: { req: true, label: 'Nama' }, email: { req: true, email: true, label: 'Email' } }); if (!v) return; if (u) v.email = u.email; UI.busy(e.currentTarget, API.call('pengguna.simpan', v).then(function () { m.close(); UI.toast('Pengguna tersimpan.', 'ok'); return reload(); }).catch(err)); };
    }
  };

  // ---------- Log ----------
  T.log = function () {
    let d, q = '', aksi = '';
    const draw = function (x) {
      if (x) d = x; const rows = U.search(d.rows, q, ['email', 'aksi', 'detail', 'id_data']).filter(function (r) { return !aksi || r.aksi === aksi; });
      body.innerHTML = '<div class="card p-3 mb-3 flex gap-2 flex-wrap"><input class="inp flex-1 min-w-[180px]" data-q placeholder="Cari email, aksi, detail…" value="' + E(q) + '"/><select class="inp w-auto" data-aksi><option value="">Semua aksi</option>' + d.aksi.map(function (a) { return '<option' + (a === aksi ? ' selected' : '') + '>' + E(a) + '</option>'; }).join('') + '</select><button class="btn" data-csv>' + UI.icon('download', 'text-[18px]') + ' CSV</button></div><div class="card p-0 overflow-hidden">' + UI.table({ rows: rows.slice(0, 200), cols: [{ l: 'Waktu', r: function (r) { return '<span class="font-mono-data text-[12px]">' + U.tglWaktu(r.waktu) + '</span>'; } }, { l: 'Pengguna', r: function (r) { return E(r.email); } }, { l: 'Aksi', r: function (r) { return UI.badge(r.aksi, r.hasil === 'GAGAL' ? 'red' : 'gray'); } }, { l: 'Objek', r: function (r) { return E(r.entitas) + ' <span class="text-caption text-on-surface-variant">' + E(r.id_data) + '</span>'; } }, { l: 'Detail', r: function (r) { return E(String(r.detail || '').slice(0, 90)); } }] }) + '</div><p class="text-caption text-on-surface-variant mt-2">Menampilkan ' + Math.min(200, rows.length) + ' dari ' + d.total + ' catatan. Nilai rahasia tidak pernah dicatat.</p>';
      if (q) { const i = U.$('[data-q]', body); i.focus(); i.setSelectionRange(q.length, q.length); }
    };
    load('adm:log', 'log.list', { limit: 500 }, draw, 15000);
    body._h = { input: function (e) { if (e.target.matches('[data-q]')) { q = e.target.value; clearTimeout(body._t); body._t = setTimeout(draw, 120); } }, change: function (e) { if (e.target.matches('[data-aksi]')) { aksi = e.target.value; draw(); } }, click: function (e) { if (e.target.closest('[data-csv]')) U.csv('log-audit', [{ k: 'waktu', l: 'Waktu' }, { k: 'email', l: 'Email' }, { k: 'aksi', l: 'Aksi' }, { k: 'entitas', l: 'Entitas' }, { k: 'id_data', l: 'ID' }, { k: 'detail', l: 'Detail' }, { k: 'hasil', l: 'Hasil' }], d.rows); } };
  };

  // ---------- Pengaturan sekolah ----------
  T.sekolah = function () {
    const HIDE = /^(NOTIF_|WA_|REMINDER_|DE_|logo_)/;
    load('adm:set', 'pengaturan.get', {}, function (x) {
      const P = x.pengaturan, ks = Object.keys(P).filter(function (k) { return !HIDE.test(k); });
      body.innerHTML = '<div class="card p-4 mb-4"><div class="font-body-medium font-semibold mb-3">Logo sekolah</div><div class="flex items-center gap-4 flex-wrap">' + (App.settings.logo_url ? '<img alt="Logo" class="h-14 w-14 object-contain rounded border border-[#E2E8F0]" src="' + E(App.settings.logo_url) + '"/>' : '<div class="h-14 w-14 rounded bg-[#E9EEF5] flex items-center justify-center">' + UI.icon('image', 'text-[28px] text-on-surface-variant') + '</div>') + '<div class="flex-1 min-w-[220px]">' + UI.dropzone('dz-logo', { title: 'Pilih gambar logo', hint: 'PNG/JPG · maksimal 1 MB', accept: 'image/*' }) + '</div></div></div><form class="card p-4" novalidate data-f><div class="font-body-medium font-semibold mb-3">Identitas & tahun ajaran</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + ks.map(function (k) { return UI.field({ name: k, label: k.replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }), value: P[k].nilai, hint: P[k].ket }); }).join('') + '</div><div class="mt-4 flex justify-end"><button class="btn btn-pri" type="submit">Simpan pengaturan</button></div></form>';
      UI.bindDropzone(U.$('#dz-logo', body), function (fl) { UI.toast('Mengunggah logo…'); API.upload('pengaturan.logo', fl[0], {}, 1).then(function (r) { App.settings.logo_url = r.logo_url; UI.toast('Logo diperbarui. Muat ulang untuk melihatnya di menu.', 'ok'); T.sekolah(); }).catch(err); }, 1);
      U.$('[data-f]', body).onsubmit = function (e) { e.preventDefault(); const v = UI.read(e.target); UI.busy(U.$('[type=submit]', body), API.call('pengaturan.simpan', { nilai: v }).then(function (r) { Object.assign(App.settings, r.publik); Store.invalidate('adm:set'); UI.toast('Pengaturan tersimpan.', 'ok'); }).catch(err)); };
    }, 30000);
    body._h = {};
  };

  // ---------- WA & Notifikasi ----------
  T.notif = function () {
    let m, a, w;
    const draw = function () {
      if (!m) return; const q = (a && a.ringkas) || {}, bagian = m.events.map(function (e) { return '<tr><td class="py-2 pr-2"><div class="font-medium text-[13px]">' + E(e.label) + '</div><div class="text-caption text-on-surface-variant">Sasaran: ' + E(e.sasaran) + '</div></td><td class="text-center"><input type="checkbox" data-mx="' + e.id + '" data-k="wa"' + (e.aktif && e.aktif.wa ? ' checked' : '') + ' aria-label="WA ' + E(e.label) + '"/></td><td class="text-center"><input type="checkbox" data-mx="' + e.id + '" data-k="email"' + (e.aktif && e.aktif.email ? ' checked' : '') + ' aria-label="Email ' + E(e.label) + '"/></td></tr>'; }).join('');
      body.innerHTML = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="card p-4"><div class="font-body-medium font-semibold mb-3">Saklar pengiriman</div><div class="space-y-2">' + sw('wa', m.wa_aktif, 'Kirim WhatsApp (Fonnte)') + sw('email', m.email_aktif, 'Kirim Email') + '</div>' + (m.token_terisi ? '' : '<p class="text-caption text-[#B45309] mt-2">' + UI.icon('warning', 'text-[16px]') + ' Token Fonnte belum diisi — isi di tab Keamanan sebelum mengaktifkan WhatsApp.</p>') + '<div class="grid grid-cols-2 gap-3 mt-4">' + UI.field({ name: 'batch', label: 'Ukuran batch', type: 'select', options: ['10', '20', '50'], value: String(m.batch || 20) }) + UI.field({ name: 'jeda', label: 'Jeda antar pesan (detik)', value: m.jeda || '3-8' }) + '</div><div class="flex flex-wrap gap-2 mt-4"><button class="btn btn-pri" data-simpan>Simpan</button><button class="btn" data-tes-wa>Uji WA</button><button class="btn" data-tes-em>Uji Email</button></div></div><div class="card p-4"><div class="font-body-medium font-semibold mb-3">Antrean pengiriman</div><div class="grid grid-cols-3 gap-3 text-center"><div class="p-3 rounded-lg bg-[#F1F5F9]"><div class="text-[20px] font-semibold">' + (q.Antre || 0) + '</div><div class="text-caption">Antre</div></div><div class="p-3 rounded-lg bg-[#DCFCE7]"><div class="text-[20px] font-semibold">' + (q.Terkirim || 0) + '</div><div class="text-caption">Terkirim</div></div><div class="p-3 rounded-lg bg-[#FEE2E2]"><div class="text-[20px] font-semibold">' + (q.Gagal || 0) + '</div><div class="text-caption">Gagal</div></div></div><div class="flex gap-2 mt-4"><button class="btn" data-drain>Proses antrean sekarang</button><button class="btn" data-ulang>Ulangi yang gagal</button></div><p class="text-caption text-on-surface-variant mt-2">Pesan tidak dikirim saat Anda menyimpan data; semuanya lewat antrean agar aplikasi tetap cepat.</p></div></div><div class="card p-4 mt-4"><div class="font-body-medium font-semibold mb-1">Matriks kejadian</div><p class="text-caption text-on-surface-variant mb-2">Pilih kejadian yang mengirim notifikasi.</p><div class="scroll-x"><table class="w-full"><thead><tr class="text-caption text-on-surface-variant text-left"><th>Kejadian</th><th class="text-center w-16">WA</th><th class="text-center w-16">Email</th></tr></thead><tbody>' + bagian + '</tbody></table></div></div><div class="card p-4 mt-4"><div class="font-body-medium font-semibold mb-2">Pengumuman massal (blast)</div>' + UI.field({ name: 'judul', label: 'Judul' }) + UI.field({ name: 'pesan', label: 'Isi pesan', type: 'textarea', rows: 4, hint: 'Gunakan {nama} untuk menyapa penerima.' }) + '<div class="flex flex-wrap items-end gap-3 mt-3">' + UI.field({ name: 'segmen', label: 'Segmen', type: 'select', options: ['Semua', 'Guru', 'Pimpinan'] }) + '<button class="btn btn-pri" data-blast>' + UI.icon('campaign', 'text-[18px]') + ' Kirim ke antrean</button></div>' + (w && w.rows && w.rows.length ? '<div class="mt-4 text-caption text-on-surface-variant">Blast terakhir: ' + w.rows.slice(0, 3).map(function (b) { return E(b.Judul) + ' (' + b.Terkirim + '/' + b.Total + ' · ' + E(b.Status) + ')'; }).join(' • ') + '</div>' : '') + '</div>';
    };
    const ambil = function () { return Promise.all([Store.load('adm:nm', 'notif.matriks', {}, { ttl: 10000, render: function (x) { m = x; draw(); } }), Store.load('adm:na', 'notif.antrian', {}, { ttl: 10000, render: function (x) { a = x; draw(); } }), Store.load('adm:nw', 'wa.blastList', {}, { ttl: 10000, render: function (x) { w = x; draw(); } })]).catch(function (e) { body.innerHTML = UI.errorRetry(e.message); }); };
    body.innerHTML = UI.skelPage(); ambil();
    const kirim = function (b, act, data, msg) { return UI.busy(b, API.call(act, data).then(function (r) { UI.toast(typeof msg === 'function' ? msg(r) : msg, 'ok'); Store.invalidate('adm:n'); return ambil(); }).catch(err)); };
    body._h = {
      change: function (e) { const c = e.target; if (c.dataset.sw) { const on = c.checked, k = c.dataset.sw; API.call('notif.simpanMatriks', k === 'wa' ? { wa_aktif: on } : { email_aktif: on }).then(function () { UI.toast('Saklar diperbarui.', 'ok'); if (k === 'wa') m.wa_aktif = on; else m.email_aktif = on; }).catch(function (x) { c.checked = !on; err(x); }); } else if (c.dataset.mx) { const e0 = m.events.find(function (x) { return x.id === c.dataset.mx; }); e0.aktif = e0.aktif || {}; e0.aktif[c.dataset.k] = c.checked; const mx = {}; m.events.forEach(function (x) { mx[x.id] = x.aktif || { wa: false, email: false }; }); API.call('notif.simpanMatriks', { matriks: mx }).catch(err); } },
      click: function (e) {
        const b = e.target.closest('button'); if (!b) return;
        if (b.matches('[data-simpan]')) kirim(b, 'notif.simpanMatriks', { batch: U.$('[name=batch]', body).value, jeda: U.$('[name=jeda]', body).value }, 'Pengaturan tersimpan.');
        else if (b.matches('[data-tes-wa]')) { const n = prompt('Nomor WhatsApp tujuan uji (08xxxxxxxxxx):', (App.user && App.user.wa) || ''); if (n) kirim(b, 'notif.tes', { nomor: n }, 'Pesan uji terkirim.'); }
        else if (b.matches('[data-tes-em]')) kirim(b, 'email.tes', {}, function (r) { return 'Email uji dikirim ke ' + r.ke; });
        else if (b.matches('[data-drain]')) kirim(b, 'drain', {}, 'Antrean diproses.');
        else if (b.matches('[data-ulang]')) kirim(b, 'notif.ulang', {}, function (r) { return r.diulang + ' pesan diantrekan ulang.'; });
        else if (b.matches('[data-blast]')) { const v = UI.read(body); if (!String(v.pesan || '').trim()) return UI.toast('Isi pesan wajib diisi.', 'warn'); UI.confirm('Kirim pengumuman ini ke segmen "' + (v.segmen || 'Semua') + '"?', { ok: 'Kirim' }).then(function (y) { if (y) kirim(b, 'wa.blast', { judul: v.judul, pesan: v.pesan, segmen: v.segmen, ukuran_batch: num(m.batch) }, function (r) { return r.penerima + ' penerima masuk antrean.'; }); }); }
      }
    };
    function num(x) { return Number(x) || 20; }
  };

  // ---------- CRM ----------
  T.crm = function () {
    let d, q = '';
    const draw = function (x) {
      if (x) d = x; const rows = U.search(d.rows, q, ['Nama', 'Email', 'NoWA', 'Segmen']);
      body.innerHTML = '<div class="card p-3 mb-3 flex gap-2 flex-wrap"><input class="inp flex-1 min-w-[180px]" data-q placeholder="Cari kontak…" value="' + E(q) + '"/><button class="btn" data-sinkron>' + UI.icon('sync', 'text-[18px]') + ' Sinkron dari pengguna</button><button class="btn" data-valid>' + UI.icon('verified_user', 'text-[18px]') + ' Cek nomor WA</button></div><div class="card p-0 overflow-hidden">' + UI.table({ rows: rows, cols: [{ l: 'Nama', r: function (k) { return '<div class="font-medium">' + E(k.Nama) + '</div><div class="text-caption text-on-surface-variant">' + E(k.Email) + '</div>'; } }, { l: 'WhatsApp', r: function (k) { return k.NoWA ? '<span class="font-mono-data">' + E(k.NoWA) + '</span>' : '—'; } }, { l: 'Status WA', r: function (k) { return UI.badge(k.StatusWA || '—', k.StatusWA === 'Terdaftar' ? 'green' : k.StatusWA === 'Tidak Terdaftar' ? 'red' : 'gray'); } }, { l: 'Segmen', r: function (k) { return E(k.Segmen || '—'); } }, { l: 'Pesan', r: function (k) { return E(k.JumlahPesan || 0); } }, { l: 'Opt-out', cls: 'text-center', r: function (k) { return '<input type="checkbox" data-opt="' + k.KontakID + '"' + (k.OptOut === 'YA' ? ' checked' : '') + ' aria-label="Opt-out ' + E(k.Nama) + '"/>'; } }] }) + '</div>';
      if (q) { const i = U.$('[data-q]', body); i.focus(); i.setSelectionRange(q.length, q.length); }
    };
    load('adm:crm', 'crm.list', {}, draw);
    body._h = {
      input: function (e) { if (e.target.matches('[data-q]')) { q = e.target.value; clearTimeout(body._t); body._t = setTimeout(draw, 120); } },
      change: function (e) { const c = e.target.closest('[data-opt]'); if (c) API.call('crm.simpan', { KontakID: c.dataset.opt, OptOut: c.checked ? 'YA' : 'TIDAK' }).then(function () { UI.toast('Preferensi disimpan.', 'ok'); }).catch(function (x) { c.checked = !c.checked; err(x); }); },
      click: function (e) {
        const b = e.target.closest('button'); if (!b) return; const done = function (msg) { Store.invalidate('adm:crm'); UI.toast(msg, 'ok'); return load('adm:crm', 'crm.list', {}, draw, 1); };
        if (b.matches('[data-sinkron]')) UI.busy(b, API.call('crm.sinkron', {}).then(function (r) { return done(r.ditambah + ' kontak baru ditambahkan.'); }).catch(err));
        else if (b.matches('[data-valid]')) UI.busy(b, API.call('wa.validate', {}).then(function (r) { return done(r.dicek ? r.terdaftar + ' terdaftar, ' + r.tidak + ' tidak terdaftar.' : 'Tidak ada nomor untuk dicek.'); }).catch(err));
      }
    };
  };

  // ---------- Impor ----------
  T.impor = function () {
    let ent = null, rows = null, pr = null, nm = '';
    const draw = function () {
      const list = ent.entitas, cur = ent.pilih || list[0].id, e0 = list.find(function (x) { return x.id === cur; });
      body.innerHTML = '<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4"><div class="card p-4"><div class="font-body-medium font-semibold mb-3">1. Pilih data & berkas</div>' + UI.field({ name: 'entitas', label: 'Jenis data', type: 'select', options: list.map(function (x) { return { v: x.id, l: x.label }; }), value: cur }) + '<div class="mt-3">' + UI.dropzone('dz-imp', { title: 'Seret berkas CSV ke sini atau klik untuk memilih', hint: 'Baris pertama = nama kolom · pemisah koma atau titik koma', accept: '.csv,text/csv' }) + '</div>' + (rows ? '<p class="mt-2 text-body-default">' + UI.icon('attach_file', 'text-[16px]') + ' ' + E(nm) + ' · ' + (rows.length - 1) + ' baris data</p>' : '') + '<div class="mt-4 flex gap-2 flex-wrap"><button class="btn" data-pra' + (rows ? '' : ' disabled') + '>2. Pratinjau (tanpa menyimpan)</button><button class="btn btn-pri" data-jalan' + (pr && (pr.ringkas.baru + pr.ringkas.ubah) ? '' : ' disabled') + '>3. Impor sekarang</button></div>' + (pr ? '<div class="mt-4 grid grid-cols-4 gap-2 text-center"><div class="p-2 rounded bg-[#DCFCE7]"><b>' + pr.ringkas.baru + '</b><div class="text-caption">Baru</div></div><div class="p-2 rounded bg-[#DBEAFE]"><b>' + pr.ringkas.ubah + '</b><div class="text-caption">Diubah</div></div><div class="p-2 rounded bg-[#F1F5F9]"><b>' + pr.ringkas.sama + '</b><div class="text-caption">Sama</div></div><div class="p-2 rounded bg-[#FEE2E2]"><b>' + pr.ringkas.gagal + '</b><div class="text-caption">Bermasalah</div></div></div>' + (pr.gagal.length ? '<ul class="mt-3 text-caption text-[#B91C1C] space-y-1">' + pr.gagal.slice(0, 10).map(function (g) { return '<li>Baris ' + g.baris + ': ' + E(g.pesan) + '</li>'; }).join('') + '</ul><label class="flex items-center gap-2 mt-2 text-body-default"><input type="checkbox" data-abaikan/> Abaikan baris bermasalah</label>' : '') : '') + '</div><div class="card p-4"><div class="font-body-medium font-semibold mb-2">Kolom ' + E(e0.label) + '</div><p class="text-caption text-on-surface-variant mb-2">Wajib: <b>' + e0.wajib.join(', ') + '</b>. Kunci pencocokan: ' + e0.kunci.join(' + ') + '. Mengimpor ulang berkas yang sama tidak membuat data ganda.</p><div class="flex flex-wrap gap-1">' + e0.kolom.slice(0, 40).map(function (c) { return '<span class="badge bg-[#F1F5F9] text-on-surface-variant font-mono-data">' + E(c) + '</span>'; }).join('') + '</div><button class="btn btn-sm mt-3" data-templat>' + UI.icon('download', 'text-[16px]') + ' Unduh templat CSV</button></div></div>';
      UI.bindDropzone(U.$('#dz-imp', body), function (fl) { const f = fl[0]; nm = f.name; const r = new FileReader(); r.onload = function () { rows = U.parseCsv(String(r.result).replace(/^﻿/, '')); pr = null; ent.pilih = U.$('[name=entitas]', body).value; draw(); }; r.readAsText(f); });
    };
    load('adm:imp', 'migrasi.entitas', {}, function (x) { ent = ent ? Object.assign(x, { pilih: ent.pilih }) : x; draw(); }, 300000);
    body._h = {
      change: function (e) { if (e.target.name === 'entitas') { ent.pilih = e.target.value; pr = null; draw(); } },
      click: function (e) {
        const b = e.target.closest('button'); if (!b) return; const id = U.$('[name=entitas]', body).value;
        if (b.matches('[data-pra]')) UI.busy(b, API.call('migrasi.pratinjau', { entitas: id, rows: rows }, { write: false }).then(function (r) { pr = r; draw(); }).catch(err));
        else if (b.matches('[data-jalan]')) UI.confirm('Impor ' + (pr.ringkas.baru + pr.ringkas.ubah) + ' baris ke sistem?', { ok: 'Impor' }).then(function (y) { if (y) UI.busy(b, API.call('migrasi.jalankan', { entitas: id, rows: rows, abaikan_gagal: !!(U.$('[data-abaikan]', body) || {}).checked }).then(function (r) { Store.invalidate(''); UI.toast('Impor selesai: ' + r.baru + ' baru, ' + r.ubah + ' diubah.', 'ok'); rows = null; pr = null; draw(); }).catch(err)); });
        else if (b.matches('[data-templat]')) { const x = ent.entitas.find(function (z) { return z.id === id; }); U.csv('templat-' + id, x.kolom.filter(function (c) { return !/^(id|dibuat|diperbarui)/i.test(c); }).map(function (c) { return { k: c, l: c }; }), []); }
      }
    };
  };

  // ---------- Keamanan ----------
  T.aman = function () {
    load('adm:rhs', 'rahasia.status', {}, function (x) {
      body.innerHTML = '<div class="card p-4 mb-4"><div class="font-body-medium font-semibold mb-1">Rahasia aplikasi</div><p class="text-caption text-on-surface-variant mb-3">Disimpan di Script Properties server. Nilai tidak pernah ditampilkan ulang, hanya status dan sebagian karakter.</p><div class="space-y-3">' + x.rahasia.map(function (r) { return '<div class="p-3 rounded-lg bg-[#F1F5F9] flex flex-wrap items-center gap-3 justify-between"><div><div class="font-medium text-[13px]">' + E(r.label) + '</div><div class="text-caption text-on-surface-variant">' + (r.terisi ? UI.badge('Terisi', 'green') + ' <span class="font-mono-data">' + E(r.topeng) + '</span>' : UI.badge('Belum diisi', 'orange')) + '</div></div><div class="flex gap-2"><button class="btn btn-sm btn-pri" data-isi="' + r.kunci + '" data-lbl="' + E(r.label) + '">' + (r.terisi ? 'Ganti' : 'Isi') + '</button>' + (r.terisi ? '<button class="btn btn-sm" data-cabut="' + r.kunci + '">Hapus</button>' : '') + '</div></div>'; }).join('') + '</div></div><div class="card p-4"><div class="font-body-medium font-semibold mb-2">Diisi otomatis oleh setup</div><ul class="space-y-1 text-body-default">' + x.otomatis.map(function (o) { return '<li>' + UI.icon(o.terisi ? 'check_circle' : 'error', 'text-[18px] ' + (o.terisi ? 'text-[#15803D]' : 'text-[#B91C1C]')) + ' <span class="font-mono-data">' + E(o.kunci) + '</span> <span class="text-caption text-on-surface-variant">— ' + E(o.keterangan) + '</span></li>'; }).join('') + '</ul></div>';
    }, 10000);
    body._h = { click: function (e) {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.isi) { const m = UI.modal({ title: b.dataset.lbl, body: UI.field({ name: 'nilai', label: 'Nilai baru', type: 'password', attrs: ' autocomplete="new-password"', hint: 'Nilai tidak dapat dilihat lagi setelah disimpan.' }), footer: '<button class="btn" data-x>Batal</button><button class="btn btn-pri" data-ok>Simpan</button>' }); U.$('[data-ok]', m.el).onclick = function (ev) { UI.busy(ev.currentTarget, API.call('rahasia.simpan', { kunci: b.dataset.isi, nilai: U.$('[name=nilai]', m.el).value }).then(function () { m.close(); Store.invalidate('adm:rhs'); UI.toast('Tersimpan.', 'ok'); T.aman(); }).catch(err)); }; }
      else if (b.dataset.cabut) UI.confirm('Hapus rahasia ini dari server?', { danger: true, ok: 'Hapus' }).then(function (y) { if (y) API.call('rahasia.hapus', { kunci: b.dataset.cabut }).then(function () { Store.invalidate('adm:rhs'); UI.toast('Dihapus.', 'ok'); T.aman(); }).catch(err); });
    } };
  };

  function setTab(t) {
    tab = t; U.$('.pg-tabs', root).innerHTML = UI.tabs(TABS.map(function (x) { return { id: x[0], l: x[1] }; }), tab, 'tb');
    body = U.$('.pg-body', root); body._h = {}; T[tab]();
  }
  App.page('pengguna', {
    title: 'Pengguna & Log', crumb: 'Pengguna & Pengaturan', roles: ['waka'],
    init: function (el) {
      root = el; el.innerHTML = UI.pageHeader({ title: 'Pengguna & Pengaturan', sub: 'Kelola akun, hak akses, notifikasi, impor data, dan keamanan aplikasi.' }) + '<div class="pg-tabs mb-4 scroll-x"></div><div class="pg-body"></div>';
      ['click', 'input', 'change'].forEach(function (ev) { el.addEventListener(ev, function (e) { const t = e.target.closest('[data-tb]'); if (ev === 'click' && t) { setTab(t.dataset.tb); return; } const h = U.$('.pg-body', el)._h; if (h && h[ev]) h[ev](e); }); });
    },
    show: function () { setTab(tab); }
  });
})();
