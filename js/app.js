// app.js — cangkang aplikasi: router hash, sidebar/header/bottom-nav, registri halaman, alur masuk/keluar
(function () {
  const E = U.esc;
  const NAV = [
    { g: 'MAIN MODULES', items: [
      { id: 'dashboard', l: 'Dashboard', i: 'dashboard', n: '01', crumb: 'Dashboard' },
      { id: 'program', l: 'Program Kerja', i: 'assignment', n: '02' },
      { id: 'dokumen', l: 'Dokumen Kurikulum', i: 'folder', n: '03' },
      { id: 'kalender', l: 'Kalender & Jadwal', i: 'calendar_today', n: '04' },
      { id: 'tugas', l: 'Tugas Mengajar', i: 'how_to_reg', n: '05' }] },
    { g: 'PENGAWASAN', items: [
      { id: 'pemantauan', l: 'Pemantauan', i: 'visibility', n: '06' },
      { id: 'asesmen', l: 'Asesmen', i: 'check_box', n: '07' },
      { id: 'supervisi', l: 'Supervisi', i: 'person_add', n: '08', badge: 'supervisi' },
      { id: 'pengembangan', l: 'Pengembangan Guru', i: 'military_tech', n: '09' },
      { id: 'monev', l: 'Monitoring & Eval', i: 'trending_up', n: '10', roles: ['waka', 'kepsek'] }] },
    { g: 'KELUARAN & SISTEM', items: [
      { id: 'laporan', l: 'Laporan', i: 'description', n: '11', badge: 'laporan', roles: ['waka', 'kepsek'] },
      { id: 'statistik', l: 'Statistik', i: 'bar_chart', n: '12', roles: ['waka', 'kepsek'] },
      { id: 'pengguna', l: 'Pengguna & Log', i: 'manage_accounts', n: '13', roles: ['waka'] }] }
  ];
  const PUBLIK = { masuk: 1, verifikasi: 1 };
  const pages = {}, built = {};
  const App = window.App = {
    user: null, settings: {}, boot: null, badges: {}, cur: null, NAV: NAV,
    page: function (id, def) { pages[id] = def; },
    role: function () { return App.user ? App.user.role : ''; },
    can: function (roles) { return !roles || roles.indexOf(App.role()) >= 0; },
    isWaka: function () { return App.role() === 'waka'; },
    go: function (h) { if (location.hash === h) route(); else location.hash = h; },
    tahun: function () { return (App.settings && App.settings.tahun_ajaran) || ''; },
    semester: function () { return (App.settings && App.settings.semester) || ''; }
  };

  // ---- navigasi ----
  function navItems() { const o = []; NAV.forEach(function (g) { g.items.forEach(function (it) { if (App.can(it.roles)) o.push(it); }); }); return o; }
  function renderSidebar() {
    let h = '<div class="h-14 px-space-md flex items-center gap-space-sm border-b border-[#172E6D] shrink-0">' + (App.settings.logo_url ? '<img alt="Logo" class="h-8 w-auto object-contain" src="' + E(App.settings.logo_url) + '"/>' : '<svg class="h-8 w-8" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#fff" fill-opacity=".14"/><path d="M8 22V10l8-3 8 3v12l-8 3z" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 16l3 3 5-6" fill="none" stroke="#99EFE5" stroke-width="2"/></svg>') + '<div class="flex flex-col"><span class="font-headline-h3 text-[15px] font-bold text-on-primary leading-tight tracking-tight">ProKer Waka</span><span class="font-mono-header text-[9px] uppercase tracking-wider text-on-primary/70 leading-none">SMART CURRICULUM</span></div></div><div class="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-space-md"><nav class="space-y-space-md">';
    NAV.forEach(function (g) {
      const its = g.items.filter(function (it) { return App.can(it.roles); }); if (!its.length) return;
      h += '<div><div class="px-space-sm pb-space-xs font-mono-header text-[10px] uppercase tracking-wider text-on-primary/70">' + g.g + '</div><div class="space-y-0.5">';
      its.forEach(function (it) {
        const b = it.badge && App.badges[it.badge] ? '<span class="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono-header font-bold bg-[#EA580C] text-[#0F172A] rounded-full">' + App.badges[it.badge] + '</span>' : '';
        h += '<a href="#/' + it.id + '" data-nav="' + it.id + '" class="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-primary/80 hover:bg-on-primary/10 hover:text-on-primary transition-colors text-body-medium font-body-medium text-[13px]"><div class="flex items-center gap-space-sm">' + UI.icon(it.i, 'text-[18px]') + '<span>' + E(it.l) + '</span></div><div class="flex items-center gap-space-xs">' + b + '<span class="font-mono-data text-[11px] opacity-60">' + it.n + '</span></div></a>';
      });
      h += '</div></div>';
    });
    h += '</nav></div><div class="p-space-sm border-t border-[#172E6D] shrink-0"><button type="button" data-logout class="w-full flex items-center justify-between px-space-sm py-2 rounded-lg text-on-primary/80 hover:bg-on-primary/10 hover:text-on-primary transition-colors text-[13px]"><div class="flex items-center gap-space-sm">' + UI.icon('logout', 'text-[18px]') + '<span>Keluar</span></div>' + UI.icon('chevron_right', 'text-[16px] opacity-60') + '</button></div>';
    U.$('#sidebar').innerHTML = h; markNav();
  }
  function markNav() {
    U.$$('#sidebar [data-nav]').forEach(function (a) { const on = a.dataset.nav === App.cur; a.className = 'flex items-center justify-between px-space-sm py-1.5 transition-colors rounded-lg text-[13px] ' + (on ? 'bg-surface-container-lowest text-primary-container font-semibold' : 'text-on-primary/80 hover:bg-on-primary/10 hover:text-on-primary'); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    U.$$('#bottomnav a').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === App.cur); });
  }
  function renderBottom() {
    const items = [['dashboard', 'Beranda', 'home'], ['program', 'Program', 'assignment'], ['kalender', 'Jadwal', 'calendar_today'], ['supervisi', 'Supervisi', 'person_add']];
    U.$('#bottomnav').innerHTML = items.map(function (x) { return '<a href="#/' + x[0] + '" data-nav="' + x[0] + '">' + UI.icon(x[2], 'text-[22px]') + '<span>' + x[1] + '</span></a>'; }).join('') + '<a href="#" data-more>' + UI.icon('menu', 'text-[22px]') + '<span>Lainnya</span></a>';
  }
  function renderTopbar() {
    const u = App.user, n = (App.boot && App.boot.lonceng && App.boot.lonceng.jumlah) || 0;
    U.$('#topbar').innerHTML = '<div class="flex items-center gap-space-md min-w-0"><button class="menu-btn btn btn-sm" data-menu aria-label="Buka menu">' + UI.icon('menu', 'text-[20px]') + '</button><div class="flex items-center gap-1.5 text-caption font-caption text-on-surface-variant min-w-0"><a href="#/dashboard" class="hover:text-on-surface hide-m">Beranda</a><span class="hide-m">/</span><span id="crumb" class="text-on-surface font-medium truncate"></span></div><div class="hide-m flex items-center gap-1.5 px-2.5 py-1 bg-[#E9EEF5] border border-[#DDE3E9] rounded text-[12px] text-[#0F172A] font-medium whitespace-nowrap">' + UI.icon('calendar_month', 'text-[14px] text-secondary') + '<span id="chip-periode">' + E(periode()) + '</span></div></div><div class="flex items-center gap-space-md"><button id="bell" aria-label="Pemberitahuan" class="relative p-1 text-on-surface-variant hover:text-on-surface">' + UI.icon('notifications', 'text-[22px]') + '<span id="bell-n" class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B91C1C] text-on-error font-mono-header text-[10px] font-bold flex items-center justify-center leading-none"' + (n ? '' : ' hidden') + '>' + n + '</span></button><div class="h-6 w-[1px] bg-[#DDE3E9] hide-m"></div><div class="flex items-center gap-space-sm"><div class="hide-m flex flex-col text-right"><span class="text-[13px] font-semibold text-[#0F172A] leading-tight">' + E(u.nama) + '</span><span class="font-mono-data text-[11px] text-on-surface-variant leading-tight">' + E(u.nip || u.peran) + '</span></div><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono-header font-bold text-[12px]">' + E(u.inisial) + '</div></div></div>';
  }
  function periode() { return (App.tahun() || '—') + ' · Semester ' + (App.semester() || '—') + ' · Aktif'; }
  App.setCrumb = function (t) { const c = U.$('#crumb'); if (c) c.textContent = t; document.title = t + ' — ProKer Waka Kur'; };
  App.setBadges = function (b) { App.badges = Object.assign({}, App.badges, b || {}); if (App.user) renderSidebar(); };
  App.setBell = function (n) { const e = U.$('#bell-n'); if (e) { e.textContent = n; e.hidden = !n; } };

  // ---- router ----
  function parse() { const h = (location.hash || '').replace(/^#\/?/, ''), p = h.split('/').filter(Boolean).map(decodeURIComponent); return { id: p[0] || '', params: p.slice(1) }; }
  function route() {
    const r = parse();
    if (!r.id) { if (App.user) return App.go('#/dashboard'); r.id = 'masuk'; }
    if (r.id === 'masuk') { if (App.user) return App.go('#/dashboard'); return showMasuk(); }
    if (r.id === 'verifikasi') return showPublic(r);
    if (!App.user) return showMasuk();
    const pg = pages[r.id];
    if (!pg || !App.can(pg.roles)) { if (pg) UI.toast('Anda tidak memiliki akses ke halaman ini.', 'warn'); return App.go('#/dashboard'); }
    U.$('#view-masuk').hidden = true; U.$('#shell').hidden = false; document.body.classList.remove('pub');
    closeSidebar();
    const main = U.$('#main');
    U.$$('.page', main).forEach(function (p) { if (p.id !== 'pg-' + r.id) { p.classList.remove('on'); const o = pages[p.id.slice(3)]; if (o && o.hide) try { o.hide(); } catch (e) {} } });
    let el = U.$('#pg-' + r.id);
    if (!el) { el = document.createElement('section'); el.id = 'pg-' + r.id; el.className = 'page pad'; main.appendChild(el); }
    el.classList.add('on'); App.cur = r.id; markNav(); App.setCrumb(pg.crumb || pg.title || r.id);
    try {
      if (!built[r.id]) { built[r.id] = true; if (pg.init) pg.init(el, App); }
      if (pg.show) pg.show(el, r.params, App);
    } catch (e) { console.error(e); el.innerHTML = UI.errorRetry('Halaman gagal dibuka: ' + e.message); built[r.id] = false; }
    window.scrollTo(0, 0);
    prefetchNext(r.id);
  }
  function showMasuk() {
    U.$('#shell').hidden = true; U.$('#view-masuk').hidden = false; document.title = 'Masuk — ProKer Waka Kur';
    if (pages.masuk && !built.masuk) { built.masuk = true; pages.masuk.init(U.$('#view-masuk'), App); }
    if (pages.masuk && pages.masuk.show) pages.masuk.show(U.$('#view-masuk'), [], App);
  }
  function showPublic(r) {
    U.$('#shell').hidden = true; const v = U.$('#view-masuk'); v.hidden = false;
    const pg = pages.verifikasi; if (!pg) return;
    built.verifikasi_el = built.verifikasi_el || false; v.innerHTML = ''; built.masuk = false; pg.init(v, App); pg.show(v, r.params, App);
  }
  // Prefetch halaman yang kemungkinan dibuka berikutnya (setelah idle)
  const NEXT = { dashboard: ['program', 'kalender'], program: ['dokumen'], dokumen: ['kalender'], kalender: ['tugas'] };
  function prefetchNext(id) { (NEXT[id] || []).forEach(function (n) { const pg = pages[n]; if (pg && pg.prefetch && App.can(pg.roles)) setTimeout(function () { try { pg.prefetch(App); } catch (e) {} }, 800); }); }

  function closeSidebar() { U.$('#sidebar').classList.remove('open'); U.$('#scrim').hidden = true; }
  function openSidebar() { U.$('#sidebar').classList.add('open'); U.$('#scrim').hidden = false; }

  // ---- lonceng ----
  App.openBell = function () {
    const m = UI.drawer({ title: 'Pemberitahuan', body: UI.skeleton(4) });
    API.call('lonceng.list', {}, { write: false }).then(function (r) {
      App.setBell(r.jumlah || 0);
      m.body.innerHTML = (r.item || []).length ? (r.item || []).map(function (x) { return '<a href="' + E(x.rute || '#') + '" data-close class="flex gap-3 p-3 border-b border-[#EEF2F6] hover:bg-[#F8FAFC]"><span class="mt-0.5">' + UI.icon(x.ikon || 'notifications', 'text-[20px] ' + (x.tone === 'red' ? 'text-[#B91C1C]' : x.tone === 'orange' ? 'text-[#EA580C]' : 'text-primary-container')) + '</span><span class="min-w-0"><span class="block font-body-medium text-[13px] font-semibold">' + E(x.judul) + '</span><span class="block text-caption text-on-surface-variant">' + E(x.teks || '') + '</span>' + (x.tgl ? '<span class="block font-mono-data text-[11px] text-on-surface-variant mt-0.5">' + E(U.tgl(x.tgl)) + '</span>' : '') + '</span></a>'; }).join('') : UI.empty({ icon: 'notifications_off', title: 'Tidak ada pemberitahuan', text: 'Semua beres untuk saat ini.' });
      m.body.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) m.close(); });
    }).catch(function (e) { m.body.innerHTML = UI.errorRetry(e.message); });
  };
  let poll = null;
  function startPolling() {
    clearInterval(poll);
    if (!App.can(['waka', 'kepsek'])) return;
    poll = setInterval(function () { if (document.hidden || !App.user) return; API.call('lonceng.list', {}, { write: false }).then(function (r) { App.setBell(r.jumlah || 0); }).catch(function () {}); }, 90000);
  }

  // ---- sesi ----
  App.afterLogin = function (res) {
    Session.save(res.token, res.user, res.kedaluwarsa); App.user = res.user; Store.clear();
    U.$('#view-masuk').hidden = true; startApp(null); App.go('#/dashboard');
  };
  App.logout = function (silent) {
    Session.clear(); Store.clear(); App.user = null; App.boot = null; clearInterval(poll);
    U.$('#main').innerHTML = ''; Object.keys(built).forEach(function (k) { delete built[k]; });
    U.$('#shell').hidden = true; if (!silent) UI.toast('Anda telah keluar.', 'ok'); location.hash = '#/masuk'; route();
  };
  API.onSesi = function () { if (App.user) { UI.toast('Sesi berakhir. Silakan masuk kembali.', 'warn'); App.logout(true); } };

  function applyBoot(b) {
    App.boot = b; App.user = b.user || App.user; App.settings = b.settings || {};
    const bd = (b.dashboard && b.dashboard.badges) || {}; App.badges = bd;
    if (b.dashboard) Store.set('dashboard', b.dashboard, true);
    renderSidebar(); renderTopbar(); renderBottom(); markNav();
  }
  function startApp(first) {
    const cached = Store.restore('boot');
    if (cached) { applyBoot(cached); } else { renderSidebar(); renderTopbar(); renderBottom(); }
    U.$('#shell').hidden = false;
    API.call('boot', {}, { write: false }).then(function (b) {
      Store.set('boot', b, true); const changed = !cached || U.hash(b.user) !== U.hash(cached.user) || U.hash(b.settings) !== U.hash(cached.settings);
      applyBoot(b);
      if (pages[App.cur] && pages[App.cur].onBoot) try { pages[App.cur].onBoot(App); } catch (e) {}
      if (changed) route();
    }).catch(function (e) { if (e.code !== 'SESI') UI.toast(e.message, 'warn'); });
    startPolling();
  }
  App.start = function () {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-logout]')) { UI.confirm('Keluar dari aplikasi?', { ok: 'Keluar' }).then(function (y) { if (y) App.logout(); }); }
      else if (e.target.closest('[data-menu]') || e.target.closest('[data-more]')) { e.preventDefault(); openSidebar(); }
      else if (e.target.closest('#scrim')) closeSidebar();
      else if (e.target.closest('#bell')) App.openBell();
      else if (e.target.closest('#sidebar [data-nav]')) closeSidebar();
    });
    window.addEventListener('hashchange', route);
    const ok = Session.load();
    if (ok) { App.user = Session.user; startApp(); } else Store.clear();
    route();
    const b = U.$('#app-boot'); b.classList.add('off'); setTimeout(function () { b.remove(); }, 400);
    window.addEventListener('online', function () { UI.toast('Kembali online.', 'ok'); }); window.addEventListener('offline', function () { UI.toast('Anda sedang offline.', 'warn'); });
  };
})();
