// statistik.js — W-15 Statistik Pendidikan: grafik dari statistik.get + tabel program dengan ekspor
(function () {
  const E = U.esc, KEY = 'statistik:get';
  let root, d = null;
  const kol = [{ k: 'kode', l: 'Kode' }, { k: 'program', l: 'Program' }, { k: 'kategori', l: 'Kategori' }, { k: 'pj', l: 'Penanggung jawab' }, { k: 'status', l: 'Status' }, { k: 'progres', l: 'Progres (%)' }, { k: 'mulai', l: 'Mulai' }, { k: 'selesai', l: 'Selesai' }];
  const box = function (judul, isi, cls) { return '<div class="card p-4 ' + (cls || '') + '"><div class="font-body-medium font-semibold mb-2">' + judul + '</div>' + isi + '</div>'; };
  const kosong = function (a) { return !a || !a.length || a.every(function (x) { return !x.v; }); };
  const sec = function (a, fn) { return kosong(a) ? '<div class="text-caption text-on-surface-variant py-8 text-center">Belum ada data.</div>' : fn(); };
  function draw() {
    if (!d) return;
    const C = Charts, p = d.program, WARNA = { 'Belum Mulai': '#94A3B8', 'Berjalan': '#1E3A8A', 'Selesai': '#15803D', 'Terlambat': '#B91C1C', 'Ditunda': '#EA580C' };
    const stat = p.status.map(function (s) { return { l: s.l, v: s.v, c: WARNA[s.l] }; });
    const sup = d.supervisi.per_guru, pem = d.pemantauan.per_guru;
    U.$('.st-body', root).innerHTML = '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' + UI.kpiSolid({ label: 'Rata capaian program', value: p.rata + '%', sub: d.tahun + ' · ' + d.semester, tone: 'blue', icon: 'monitoring' }) + UI.kpiSolid({ label: 'Ketuntasan asesmen', value: d.asesmen.rata + '%', sub: 'KKTP ' + d.asesmen.kktp, tone: 'teal', icon: 'fact_check' }) + UI.kpiSolid({ label: 'Skor supervisi', value: d.supervisi.rata, sub: 'rata-rata', tone: 'green', icon: 'rate_review' }) + UI.kpiSolid({ label: 'Perangkat ajar', value: d.pemantauan.rata + '%', sub: 'kelengkapan', tone: 'orange', icon: 'inventory_2' }) + '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">' + box('Status program', sec(stat, function () { return '<div class="flex flex-col sm:flex-row items-center gap-4">' + C.donut(stat, { size: 170 }) + C.legend(stat.map(function (s) { return { l: s.l + ' (' + s.v + ')', c: s.c }; })) + '</div>'; })) + box('Progres per program (%)', sec(p.per_kategori, function () { return C.bar(p.per_kategori, { max: 100, target: 75, label: 'Progres per program' }); })) + '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">' + box('Ketuntasan asesmen per mapel (%)', sec(d.asesmen.per_mapel, function () { return C.hbar(d.asesmen.per_mapel, { max: 100, target: d.asesmen.kktp }); })) + box('Distribusi beban mengajar (JP) <span class="text-caption text-on-surface-variant font-normal">· ideal ' + d.jp.min + '–' + d.jp.maks + '</span>', sec(d.jp.distribusi, function () { return C.hbar(d.jp.distribusi, { max: Math.max(d.jp.maks + 6, 30) }); })) + '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">' + box('Skor supervisi per guru', sec(sup, function () { return C.hbar(sup, { max: 100 }); })) + box('Kelengkapan perangkat per guru (%)', sec(pem, function () { return C.hbar(pem, { max: 100 }); })) + '</div>' +
      '<div class="card p-0 overflow-hidden"><div class="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0]"><div class="font-body-medium font-semibold">Rekap program kerja</div><div class="flex gap-2"><button class="btn btn-sm" data-ex="xlsx">' + UI.icon('table_view', 'text-[16px]') + ' Excel</button><button class="btn btn-sm" data-ex="pdf">' + UI.icon('picture_as_pdf', 'text-[16px]') + ' PDF</button><button class="btn btn-sm" data-ex="csv">' + UI.icon('csv', 'text-[16px]') + ' CSV</button></div></div>' + UI.table({ rows: d.tabel, cols: [{ l: 'Kode', r: function (r) { return '<span class="font-mono-data">' + E(r.kode) + '</span>'; } }, { l: 'Program', r: function (r) { return E(r.program); } }, { l: 'Kategori', r: function (r) { return E(r.kategori); } }, { l: 'PJ', r: function (r) { return E(r.pj); } }, { l: 'Status', r: function (r) { return UI.status(r.status); } }, { l: 'Progres', r: function (r) { return UI.progress(r.progres); } }] }) + '</div>';
  }
  function load(f) { Store.load(KEY, 'statistik.get', {}, { force: f, ttl: 60000, persist: true, render: function (x) { d = x; draw(); }, loading: function () { U.$('.st-body', root).innerHTML = UI.skelPage(); }, error: function (e) { U.$('.st-body', root).innerHTML = UI.errorRetry(e.message); } }).catch(function () {}); }
  App.page('statistik', {
    title: 'Statistik Pendidikan', crumb: 'Statistik', roles: ['waka', 'kepsek'],
    init: function (el) {
      root = el; el.innerHTML = UI.pageHeader({ title: 'Statistik Pendidikan', sub: 'Ringkasan capaian program, asesmen, supervisi, dan beban mengajar.', actions: '<button class="btn" data-seg>' + UI.icon('refresh', 'text-[18px]') + ' Segarkan</button>' }) + '<div class="st-body"></div>';
      UI.on(el, 'click', '[data-seg]', function () { load(true); });
      UI.on(el, 'click', '[data-ex]', function (b) {
        if (!d) return; const t = b.dataset.ex, nm = 'rekap-program-' + (d.tahun || '').replace(/\//g, '-'); UI.busy(b, (t === 'xlsx' ? U.excel(nm, kol, d.tabel, 'Program') : t === 'pdf' ? U.pdfTabel(nm, 'Rekap Program Kerja Waka Kurikulum', kol, d.tabel, 'Tahun ajaran ' + d.tahun + ' · ' + d.semester) : Promise.resolve(U.csv(nm, kol, d.tabel))).catch(function (e) { UI.toast('Ekspor gagal: ' + e.message, 'err'); }));
      });
    },
    show: function () { load(); }, prefetch: function () { Store.load(KEY, 'statistik.get', {}, { ttl: 60000, persist: true }).catch(function () {}); }
  });
})();
