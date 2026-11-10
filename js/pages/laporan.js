// laporan.js — W-14 Laporan & Rekomendasi: Draft → Diajukan → Disetujui → Terbit (PDF + QR eTTD)
(function () {
  const E = U.esc, KEY = 'laporan:list', BAGIAN = [['ringkasan', 'Ringkasan'], ['program_terlaksana', 'Program terlaksana'], ['hasil', 'Hasil / capaian'], ['kendala', 'Kendala'], ['rekomendasi', 'Rekomendasi']];
  let root, st = { d: null, sel: null, status: '' };
  const waka = function () { return App.isWaka(); }, kep = function () { return App.role() === 'kepsek'; };
  const cur = function () { return st.d && st.d.rows.find(function (r) { return r.id === st.sel; }); };
  const langkah = ['Draft', 'Diajukan', 'Disetujui', 'Terbit'];
  function alur(s) { const i = s === 'Ditolak' ? 0 : langkah.indexOf(s); return '<ol class="flex items-center gap-1 text-caption flex-wrap">' + langkah.map(function (l, k) { return '<li class="flex items-center gap-1"><span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ' + (k <= i ? 'bg-primary-container text-white' : 'bg-[#E2E8F0] text-on-surface-variant') + '">' + (k < i ? UI.icon('check', 'text-[14px]') : k + 1) + '</span><span class="' + (k === i ? 'font-semibold' : 'text-on-surface-variant') + '">' + l + '</span>' + (k < 3 ? '<span class="w-4 h-px bg-[#CBD5E1]"></span>' : '') + '</li>'; }).join('') + '</ol>'; }
  function daftar() {
    const rows = (st.d.rows || []).filter(function (r) { return !st.status || r.status === st.status; });
    const stat = ['Draft', 'Diajukan', 'Disetujui', 'Terbit', 'Ditolak'];
    return '<div class="mb-3">' + UI.chips([{ id: '', l: 'Semua' }].concat(stat.map(function (s) { return { id: s, l: s }; })), st.status, 'st') + '</div>' + (rows.length ? '<div class="space-y-2">' + rows.map(function (r) { return '<button class="card p-3 w-full text-left ' + (r.id === st.sel ? 'ring-2 ring-primary-container' : '') + '" data-pilih="' + r.id + '"><div class="flex items-start justify-between gap-2"><div class="font-body-medium font-semibold leading-snug">' + E(r.judul) + '</div>' + UI.status(r.status) + '</div><div class="text-caption text-on-surface-variant mt-1">' + E(r.jenis) + ' · ' + E(r.periode) + (r.nomor_registrasi ? ' · <span class="font-mono-data">' + E(r.nomor_registrasi) + '</span>' : '') + '</div></button>'; }).join('') + '</div>' : UI.empty({ icon: 'description', title: 'Belum ada laporan', text: waka() ? 'Buat draf otomatis dari data program.' : 'Belum ada laporan yang diajukan.' }));
  }
  function kertas(l) {
    return '<div class="bg-white shadow-md rounded border border-[#E2E8F0] p-6 sm:p-10 max-w-[794px] mx-auto text-[13px] leading-relaxed"><div class="text-center border-b-2 border-black pb-3 mb-4"><div class="font-semibold uppercase">' + E((App.settings.nama_sekolah) || 'Nama Sekolah') + '</div><div class="text-[11px]">' + E((App.settings.alamat) || '') + '</div></div><h3 class="text-center font-semibold uppercase mb-1">' + E(l.judul) + '</h3><div class="text-center text-[11px] mb-4">Nomor: ' + E(l.nomor_registrasi || '(diberikan saat diajukan)') + ' · Tahun ajaran ' + E(l.tahun_ajaran) + '</div>' + BAGIAN.map(function (b, i) { return '<div class="mb-3"><div class="font-semibold">' + String.fromCharCode(65 + i) + '. ' + b[1] + '</div><div class="whitespace-pre-line">' + (E(l[b[0]]) || '<span class="text-on-surface-variant italic">Belum diisi</span>') + '</div></div>'; }).join('') + '<div class="grid grid-cols-2 gap-4 mt-8 text-center"><div>Waka Kurikulum<div class="h-14"></div><b>' + E((App.settings.nama_waka) || l.penyusun_nama) + '</b></div><div>Kepala Sekolah<div class="h-14 flex items-center justify-center">' + (l.ttd_kepsek_pada ? '<span class="text-[11px] text-[#166534]">✔ Disetujui ' + U.tglWaktu(l.ttd_kepsek_pada) + '</span>' : '') + '</div><b>' + E(l.kepsek_nama || (App.settings.nama_kepsek) || '') + '</b></div></div>' + (l.kode_verifikasi ? '<div class="mt-6 text-[11px] text-center text-on-surface-variant">Kode verifikasi: <b class="font-mono-data">' + E(l.kode_verifikasi) + '</b></div>' : '') + '</div>';
  }
  function detail() {
    const l = cur(); if (!l) return UI.empty({ icon: 'preview', title: 'Pilih laporan', text: 'Pratinjau dokumen dan tindakan akan tampil di sini.' });
    const cek = l.checklist || [], lengkap = cek.length && cek.every(Boolean), t = [];
    if (waka() && (l.status === 'Draft' || l.status === 'Ditolak')) t.push('<button class="btn" data-edit>' + UI.icon('edit', 'text-[18px]') + ' Ubah</button><button class="btn btn-pri" data-ajukan' + (lengkap ? '' : ' disabled title="Lengkapi semua bagian"') + '>' + UI.icon('send', 'text-[18px]') + ' Ajukan</button>' + (l.status === 'Draft' ? '<button class="btn" data-hapus aria-label="Hapus">' + UI.icon('delete', 'text-[18px] text-[#B91C1C]') + '</button>' : ''));
    if (waka() && l.status === 'Disetujui') t.push('<button class="btn btn-pri" data-terbit>' + UI.icon('picture_as_pdf', 'text-[18px]') + ' Terbitkan PDF</button>');
    if (l.status === 'Terbit') t.push('<button class="btn btn-pri" data-pdf>' + UI.icon('download', 'text-[18px]') + ' Unduh PDF</button>' + (waka() ? '<button class="btn" data-ulang>Terbitkan ulang</button>' : ''));
    const panel = kep() && l.status === 'Diajukan' ? '<div class="card p-4 mb-4 border-l-4 border-[#F59E0B]"><div class="font-body-medium font-semibold mb-2">Menunggu keputusan Anda</div>' + UI.field({ name: 'catatan', label: 'Catatan (wajib bila menolak)', type: 'textarea' }) + '<div class="flex gap-2 mt-3"><button class="btn" data-tolak>Tolak</button><button class="btn btn-ok" data-setuju>' + UI.icon('verified', 'text-[18px]') + ' Setujui & tanda tangani</button></div></div>' : '';
    const ctt = l.catatan_kepsek ? '<div class="card p-3 mb-4 bg-[#FEF9C3] text-body-default"><b>Catatan Kepala Sekolah:</b> ' + E(l.catatan_kepsek) + '</div>' : '';
    const rw = (l.riwayat || []).slice().reverse().map(function (r) { return '<li class="text-caption"><b>' + E(r.aksi) + '</b> · ' + E(r.oleh) + ' · ' + U.tglWaktu(r.w) + (r.cat ? '<div class="text-on-surface-variant">' + E(r.cat) + '</div>' : '') + '</li>'; }).join('');
    return '<div class="flex flex-wrap items-center justify-between gap-3 mb-3">' + alur(l.status) + '<div class="flex gap-2 flex-wrap">' + t.join('') + '</div></div>' + (waka() && l.status !== 'Terbit' ? '<div class="flex flex-wrap gap-2 mb-3">' + BAGIAN.map(function (b, i) { return '<span class="badge ' + (cek[i] ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F1F5F9] text-on-surface-variant') + '">' + (cek[i] ? '✔ ' : '○ ') + b[1] + '</span>'; }).join('') + '</div>' : '') + ctt + panel + '<div class="overflow-x-auto pb-2">' + kertas(l) + '</div><details class="mt-4"><summary class="cursor-pointer text-body-default font-medium">Riwayat proses</summary><ul class="mt-2 space-y-2 pl-4 list-disc">' + rw + '</ul></details>';
  }
  function draw() {
    if (!st.d) return;
    U.$('.lp-menunggu', root).innerHTML = kep() && st.d.menunggu ? '<div class="card p-3 mb-4 bg-[#FEF3C7] flex items-center gap-2">' + UI.icon('pending_actions', 'text-[#B45309]') + '<span class="text-body-default"><b>' + st.d.menunggu + '</b> laporan menunggu persetujuan Anda.</span></div>' : '';
    U.$('.lp-list', root).innerHTML = daftar(); U.$('.lp-detail', root).innerHTML = detail();
    root.classList.toggle('lp-has-sel', !!st.sel);
  }
  function load(f) { Store.load(KEY, 'laporan.list', {}, { force: f, ttl: 30000, persist: true, render: function (d) { st.d = d; if (!st.sel && d.rows.length) st.sel = (d.rows.find(function (r) { return r.status === 'Diajukan'; }) || d.rows[0]).id; draw(); }, loading: function () { U.$('.lp-list', root).innerHTML = UI.skeleton(4); }, error: function (e) { U.$('.lp-list', root).innerHTML = UI.errorRetry(e.message); } }).catch(function () {}); }
  function ganti(row) { const i = st.d.rows.findIndex(function (r) { return r.id === row.id; }); if (i >= 0) st.d.rows[i] = row; else st.d.rows.unshift(row); st.sel = row.id; st.d.menunggu = st.d.rows.filter(function (r) { return r.status === 'Diajukan'; }).length; Store.invalidate('laporan'); Store.invalidate('dashboard'); draw(); }
  function aksi(b, act, data, msg) { return UI.busy(b, API.call(act, data).then(function (r) { ganti(r); UI.toast(msg, 'ok'); }).catch(function (e) { UI.toast(e.message, 'err'); })); }
  function formEdit(l) {
    const baru = !l; l = l || {};
    const m = UI.modal({ title: baru ? 'Laporan baru' : 'Ubah laporan', wide: true, body: '<form novalidate class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + UI.field({ name: 'judul', label: 'Judul', required: true, cls: 'sm:col-span-2' }) + UI.field({ name: 'jenis', label: 'Jenis', type: 'select', options: st.d.jenis }) + UI.field({ name: 'periode', label: 'Periode' }) + BAGIAN.map(function (b) { return UI.field({ name: b[0], label: b[1], type: 'textarea', rows: 4, cls: 'sm:col-span-2' }); }).join('') + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn btn-pri" data-ok>Simpan</button>' });
    UI.fill(m.el, l);
    U.$('[data-ok]', m.el).onclick = function (e) { const v = UI.validate(U.$('form', m.el), { judul: { req: true, label: 'Judul' } }); if (!v) return; if (l.id) v.id = l.id; aksi(e.currentTarget, 'laporan.simpan', v, 'Laporan tersimpan.').then(function () { m.close(); }); };
  }
  function formBuat() {
    const m = UI.modal({ title: 'Buat draf otomatis', body: '<p class="text-body-default mb-3">Draf disusun dari data program, asesmen, supervisi, dan evaluasi. Anda dapat mengubahnya sebelum diajukan.</p>' + UI.field({ name: 'jenis', label: 'Jenis laporan', type: 'select', options: st.d.jenis }) + UI.field({ name: 'periode', label: 'Periode', placeholder: 'mis. Triwulan I' }), footer: '<button class="btn" data-manual>Tulis manual</button><button class="btn btn-pri" data-ok>' + UI.icon('auto_awesome', 'text-[18px]') + ' Buat draf</button>' });
    U.$('[data-manual]', m.el).onclick = function () { m.close(); formEdit(null); };
    U.$('[data-ok]', m.el).onclick = function (e) { const v = UI.read(m.el); aksi(e.currentTarget, 'laporan.generate', v, 'Draf dibuat dari data program.').then(function () { m.close(); }); };
  }
  App.page('laporan', {
    title: 'Laporan & Rekomendasi', crumb: 'Laporan', roles: ['waka', 'kepsek'],
    init: function (el) {
      root = el; el.innerHTML = UI.pageHeader({ title: 'Laporan & Rekomendasi', sub: 'Susun, ajukan, setujui, dan terbitkan laporan resmi dengan tanda tangan elektronik dan kode verifikasi.', actions: waka() ? '<button class="btn btn-pri" data-baru>' + UI.icon('add', 'text-[18px]') + ' Laporan baru</button>' : '' }) + '<div class="lp-menunggu"></div><div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4"><div class="lp-list"></div><div class="lp-detail min-w-0"></div></div>';
      UI.on(el, 'click', '[data-baru]', function () { st.d ? formBuat() : UI.toast('Tunggu data dimuat.', 'warn'); });
      UI.on(el, 'click', '[data-pilih]', function (b) { st.sel = b.dataset.pilih; draw(); });
      UI.on(el, 'click', '[data-st]', function (b) { st.status = b.dataset.st; draw(); });
      UI.on(el, 'click', '[data-edit]', function () { formEdit(cur()); });
      UI.on(el, 'click', '[data-ajukan]', function (b) { UI.confirm('Ajukan laporan ini ke Kepala Sekolah? Isi tidak dapat diubah selama menunggu keputusan.', { ok: 'Ajukan' }).then(function (y) { if (y) aksi(b, 'laporan.ajukan', { id: st.sel }, 'Laporan diajukan.'); }); });
      UI.on(el, 'click', '[data-setuju]', function (b) { aksi(b, 'laporan.review', { id: st.sel, keputusan: 'setuju', catatan: (U.$('[name=catatan]', el) || {}).value }, 'Laporan disetujui.'); });
      UI.on(el, 'click', '[data-tolak]', function (b) { const c = U.$('[name=catatan]', el).value.trim(); if (!c) return UI.toast('Isi catatan untuk penolakan.', 'warn'); aksi(b, 'laporan.review', { id: st.sel, keputusan: 'tolak', catatan: c }, 'Laporan dikembalikan.'); });
      UI.on(el, 'click', '[data-terbit]', function (b) { aksi(b, 'laporan.terbit', { id: st.sel }, 'PDF diterbitkan.'); });
      UI.on(el, 'click', '[data-ulang]', function (b) { aksi(b, 'laporan.terbit', { id: st.sel, ulang: true }, 'PDF diterbitkan ulang.'); });
      UI.on(el, 'click', '[data-pdf]', function (b) { const l = cur(); UI.busy(b, API.unduh('laporan.pdf', { id: l.id }, (l.nomor_registrasi || 'laporan').replace(/\//g, '-') + '.pdf').catch(function (e) { UI.toast(e.message, 'err'); })); });
      UI.on(el, 'click', '[data-hapus]', function () { UI.confirm('Hapus draf laporan ini?', { danger: true, ok: 'Hapus' }).then(function (y) { if (y) API.call('laporan.hapus', { id: st.sel }).then(function () { st.d.rows = st.d.rows.filter(function (r) { return r.id !== st.sel; }); st.sel = null; Store.invalidate('laporan'); draw(); UI.toast('Draf dihapus.', 'ok'); }).catch(function (e) { UI.toast(e.message, 'err'); }); }); });
    },
    show: function (el, p) { if (p && p[0]) st.sel = p[0]; load(); },
    prefetch: function () { Store.load(KEY, 'laporan.list', {}, { ttl: 30000, persist: true }).catch(function () {}); }
  });
})();
