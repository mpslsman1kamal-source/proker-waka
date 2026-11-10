// masuk.js — W-01: Portal masuk (Google SSO + akses darurat) dan tampilan 403 "Email Tidak Terdaftar"
App.page('masuk', {
  init: function (el, A) {
    const E = U.esc; let cfg = null, gisOk = false;
    el.innerHTML = '<div class="min-h-screen bg-surface flex items-center justify-center p-4"><div class="w-full max-w-md"><div id="mk-body"></div><p class="text-center text-caption text-on-surface-variant mt-4 font-mono-data">VERSI 1.0.0</p></div></div>';
    const body = U.$('#mk-body', el);
    const logo = '<div class="flex flex-col items-center text-center mb-6"><div class="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mb-3"><svg class="w-8 h-8" viewBox="0 0 32 32"><path d="M8 22V10l8-3 8 3v12l-8 3z" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 16l3 3 5-6" fill="none" stroke="#99EFE5" stroke-width="2"/></svg></div><h2 class="font-headline-h2 text-headline-h2">ProKer Waka Kur</h2><p class="text-body-default text-on-surface-variant">Sistem Informasi 10 Program Kerja Waka Kurikulum</p></div>';
    function viewLogin(msg) {
      body.innerHTML = logo + '<div class="card p-6"><span class="font-mono-header text-mono-header text-secondary">PORTAL MASUK</span><h3 class="font-headline-h2 text-headline-h2 mt-1">Masuk ke Sistem</h3><p class="text-body-default text-on-surface-variant mt-1 mb-4">Gunakan akun Google Workspace sekolah resmi' + (cfg && cfg.nama_sekolah ? ' (' + E(cfg.nama_sekolah) + ')' : '') + '</p>' +
        '<div id="g-btn" class="flex justify-center min-h-[44px]"></div><div id="mk-load" class="text-center text-body-default text-on-surface-variant py-2" hidden><span class="material-symbols-outlined animate-spin align-middle">progress_activity</span> Memverifikasi akun…</div>' +
        (msg ? '<div class="mt-3 p-3 rounded-lg bg-[#FEE2E2] text-[#991B1B] text-body-default">' + E(msg) + '</div>' : '') +
        '<div id="mk-cfgwarn"></div>' +
        (cfg && cfg.darurat ? '<div class="mt-4 text-center"><button class="text-caption text-primary-container underline" data-darurat>Masuk dengan akses darurat</button></div>' : '') + '</div>' +
        '<div class="flex items-center gap-3 my-5"><div class="flex-1 h-px bg-[#DDE3E9]"></div><span class="font-mono-header text-mono-header text-on-surface-variant">INFORMASI AKSES</span><div class="flex-1 h-px bg-[#DDE3E9]"></div></div>' +
        '<div class="card p-3 border-l-4" style="border-left-color:#1E3A8A"><div class="flex gap-2">' + UI.icon('info', 'text-primary-container') + '<p class="text-body-default">Akun belum terdaftar di Sheet Pengguna? Silakan hubungi Waka Kurikulum atau Administrator.</p></div></div>' +
        '<div class="mt-4"><div class="text-caption text-on-surface-variant mb-2">Tingkatan Peran Terdaftar:</div><div class="flex flex-wrap gap-2"><span class="badge b-blue">' + UI.icon('shield_person', 'text-[14px]') + ' Admin: Waka Kur</span><span class="badge b-teal">' + UI.icon('school', 'text-[14px]') + ' Guru Mata Pelajaran</span><span class="badge b-orange">' + UI.icon('workspace_premium', 'text-[14px]') + ' Kepala Sekolah</span></div></div>';
      if (cfg && !cfg.clientId) U.$('#mk-cfgwarn', body).innerHTML = '<div class="mt-3 p-3 rounded-lg bg-[#FFEDD5] text-[#9A3412] text-caption">Login Google belum dikonfigurasi (Google Client ID belum diisi di Script Properties).' + (cfg.darurat ? '' : ' Gunakan setupAwal() lalu isi kunci dari editor Apps Script.') + '</div>';
      else mountGoogle();
    }
    function viewTolak(email, pesan) {
      body.innerHTML = '<div class="card overflow-hidden"><div class="flex items-center justify-between p-4 border-l-[6px]" style="border-left-color:#B91C1C;background:#FEE2E2"><div><div class="font-headline-h3 text-[#991B1B]">403 · Akses Ditolak</div><div class="font-mono-data text-[11px] text-[#991B1B]">HTTP_ERR_FORBIDDEN</div></div>' + UI.icon('lock', 'text-[#991B1B]') + '</div><div class="p-6"><div class="flex items-center gap-3 mb-3"><div class="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center">' + UI.icon('block', 'text-[#B91C1C] text-[26px]') + '</div><div><h2 class="font-headline-h2 text-headline-h2">Email Tidak Terdaftar</h2><p class="text-caption text-on-surface-variant">Otorisasi gagal pada lembar kerja master</p></div></div><p class="text-body-default">' + (email ? 'Akun Google <b class="font-mono-data">' + E(email) + '</b> belum tercatat di lembar kerja ‘Pengguna’.' : E(pesan)) + '</p><div class="mt-4 p-3 rounded-lg bg-[#F1F5F9]"><div class="flex justify-between mb-2"><span class="font-mono-header text-mono-header">LANGKAH SELANJUTNYA</span><span class="font-mono-header text-mono-header text-on-surface-variant">PROSEDUR RESMI</span></div><div class="space-y-2 text-body-default"><div class="flex gap-3"><span class="font-mono-data text-primary-container font-bold">01</span><p>Pastikan login menggunakan akun email institusi resmi sekolah.</p></div><div class="flex gap-3"><span class="font-mono-data text-primary-container font-bold">02</span><p>Minta Waka Kurikulum memasukkan NIP, Nama, dan Peran ke daftar pengguna.</p></div></div></div><div class="mt-4 flex flex-wrap gap-2"><button class="btn" data-back>' + UI.icon('arrow_back', 'text-[18px]') + ' Kembali ke Masuk</button></div></div></div>';
    }
    function emailDariIdToken(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).email || ''; } catch (e) { return ''; } }
    function masuk(idToken) {
      const ld = U.$('#mk-load', body), gb = U.$('#g-btn', body); if (ld) { ld.hidden = false; gb.hidden = true; }
      API.call('auth.google', { idToken: idToken }, { token: null, write: true }).then(function (r) { A.afterLogin(r); }).catch(function (e) {
        if (e.code === 'TIDAK_TERDAFTAR') viewTolak(emailDariIdToken(idToken)); else { viewLogin(e.message); }
      });
    }
    function mountGoogle() {
      const draw = function () { try { google.accounts.id.initialize({ client_id: cfg.clientId, callback: function (r) { masuk(r.credential); }, ux_mode: 'popup' }); google.accounts.id.renderButton(U.$('#g-btn', body), { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 300, locale: 'id' }); } catch (e) {} };
      if (window.google && google.accounts) return draw();
      if (gisOk) return; gisOk = true; U.lazy('https://accounts.google.com/gsi/client').then(draw).catch(function () { U.$('#g-btn', body).innerHTML = '<span class="text-caption text-[#B91C1C]">Gagal memuat layanan Google. Periksa koneksi.</span>'; gisOk = false; });
    }
    function modalDarurat() {
      const m = UI.modal({ title: 'Akses Darurat', body: '<p class="text-caption text-on-surface-variant mb-3">Hanya untuk keadaan darurat bila login Google bermasalah. Percobaan dibatasi.</p>' + UI.field({ name: 'sandi', label: 'Sandi darurat', type: 'password', required: true }), footer: '<button class="btn" data-x>Batal</button><button class="btn btn-pri" data-ok>Masuk</button>' });
      const go = function () { const v = U.$('[name=sandi]', m.el).value; if (!v) return; UI.busy(U.$('[data-ok]', m.el), API.call('auth.darurat', { sandi: v }, { token: null, write: true }).then(function (r) { m.close(); A.afterLogin(r); }).catch(function (e) { UI.toast(e.message, 'err'); })); };
      U.$('[data-ok]', m.el).onclick = go; U.$('[name=sandi]', m.el).onkeydown = function (e) { if (e.key === 'Enter') go(); };
    }
    el.addEventListener('click', function (e) { if (e.target.closest('[data-back]')) viewLogin(); else if (e.target.closest('[data-darurat]')) modalDarurat(); });
    this._load = function () {
      body.innerHTML = logo + '<div class="card p-6">' + UI.skeleton(3) + '</div>';
      API.call('auth.config', {}, { token: null, write: false }).then(function (c) { cfg = c; if (c.nama_sekolah) U.ls.set('proker.nama', c.nama_sekolah); viewLogin(); })
        .catch(function (e) { body.innerHTML = logo + '<div class="card p-6">' + UI.errorRetry(e.code === 'CONFIG' ? 'URL API belum diisi. Isi API_URL di js/config.js dengan URL /exec Apps Script.' : e.message) + '</div>'; U.$('[data-retry]', body) && (U.$('[data-retry]', body).onclick = function () { pg._load(); }); });
    };
    const pg = this; this._load();
  },
  show: function () { }
});
