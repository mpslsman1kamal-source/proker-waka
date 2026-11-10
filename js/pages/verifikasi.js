// verifikasi.js — halaman publik: verifikasi keaslian laporan lewat kode/QR (#/verifikasi/<kode>)
(function () {
  const E = U.esc;
  function hasil(el, r) {
    const ok = r && r.valid;
    el.querySelector('.vf-out').innerHTML = ok ? '<div class="flex items-center gap-3 mb-4"><span class="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">' + UI.icon('verified', 'text-[28px] text-[#166534]') + '</span><div><div class="font-headline-h3 text-[#166534]">Dokumen asli</div><div class="text-caption text-on-surface-variant">' + (r.hash_ok === false ? 'Perhatian: berkas PDF telah berubah dari aslinya.' : 'Terdaftar pada sistem ' + E(r.sekolah) + '.') + '</div></div></div><dl class="grid grid-cols-[110px_1fr] gap-y-2 text-body-default"><dt class="text-on-surface-variant">Jenis</dt><dd>' + E(r.jenis) + '</dd><dt class="text-on-surface-variant">Nomor</dt><dd class="font-mono-data">' + E(r.nomor) + '</dd><dt class="text-on-surface-variant">Judul</dt><dd>' + E(r.judul) + '</dd><dt class="text-on-surface-variant">Periode</dt><dd>' + E(r.periode) + '</dd><dt class="text-on-surface-variant">Diterbitkan</dt><dd>' + U.tgl(r.tanggal) + '</dd></dl><div class="mt-4 font-body-medium font-semibold">Penandatangan</div><ul class="mt-1 space-y-1 text-body-default">' + (r.penandatangan || []).map(function (p) { return '<li>' + UI.icon('draw', 'text-[16px]') + ' ' + E(p.nama) + ' — ' + E(p.jabatan) + (p.waktu ? ' <span class="text-caption text-on-surface-variant">(' + U.tglWaktu(p.waktu) + ')</span>' : '') + '</li>'; }).join('') + '</ul>' : '<div class="flex items-center gap-3"><span class="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">' + UI.icon('gpp_bad', 'text-[28px] text-[#B91C1C]') + '</span><div><div class="font-headline-h3 text-[#B91C1C]">Tidak ditemukan</div><div class="text-caption text-on-surface-variant">' + E((r && r.pesan) || 'Kode tidak terdaftar.') + '</div></div></div>';
  }
  function cek(el, kode) {
    kode = String(kode || '').trim().toUpperCase(); const out = el.querySelector('.vf-out');
    if (!kode) { out.innerHTML = '<p class="text-body-default text-on-surface-variant">Masukkan kode verifikasi yang tercetak di dokumen.</p>'; return; }
    out.innerHTML = UI.skeleton(3);
    API.call('verifikasi', { kode: kode }, { token: null }).then(function (r) { hasil(el, r); }).catch(function (e) { out.innerHTML = '<p class="text-[#B91C1C]">' + E(e.message) + '</p>'; });
  }
  App.page('verifikasi', {
    title: 'Verifikasi Dokumen', publik: true,
    init: function (el) {
      el.innerHTML = '<div class="min-h-screen flex items-start sm:items-center justify-center bg-surface-container-low p-4"><div class="card w-full max-w-[520px] p-6"><div class="flex items-center gap-2 mb-1">' + UI.icon('qr_code_2', 'text-[28px] text-primary-container') + '<h1 class="font-headline-h2">Verifikasi Dokumen</h1></div><p class="text-caption text-on-surface-variant mb-4">Pastikan laporan yang Anda terima asli dan diterbitkan resmi oleh sekolah.</p><form class="flex gap-2 mb-4" data-f><input class="inp font-mono-data" name="kode" placeholder="XXXX-XXXX-XXXX" autocomplete="off" aria-label="Kode verifikasi"/><button class="btn btn-pri">Periksa</button></form><div class="vf-out"></div><div class="mt-5 text-center"><a class="text-caption underline" href="#/masuk">Masuk ke aplikasi</a></div></div></div>';
      el.querySelector('[data-f]').onsubmit = function (e) { e.preventDefault(); const k = el.querySelector('[name=kode]').value; history.replaceState(null, '', '#/verifikasi/' + encodeURIComponent(k.trim())); cek(el, k); };
    },
    show: function (el, p) { const k = p && p[0] ? decodeURIComponent(p[0]) : ''; el.querySelector('[name=kode]').value = k; cek(el, k); }
  });
})();
