// crud.js — pabrik halaman daftar+formulir (dipakai banyak halaman). Mengikuti pola halaman: init sekali, show tiap kunjungan, SWR.
(function () {
  const E = U.esc;
  window.Crud = {
    // cfg: id,title,sub,prefix,write[],cols,fields(row,d)=>[],filters,search,kpis(d),top(d,rows),toForm(row),toPayload(v,row,d),
    //      rowActions(row,d)=>html, exportCols, needGuru, empty, formTitle, wide, afterDraw
    page: function (cfg) {
      let st = { d: null, q: '', f: {}, sort: cfg.sort || null, page: 1, guru: [] }, root;
      const key = cfg.id + ':list', canW = function () { return App.can(cfg.write); };
      function filtered() {
        let rows = (st.d && st.d.rows) || [];
        rows = U.search(rows, st.q, cfg.search || []);
        (cfg.filters || []).forEach(function (f) { const v = st.f[f.k]; if (v) rows = rows.filter(function (r) { return String(r[f.k]) === String(v); }); });
        if (st.sort) rows = rows.slice().sort(U.cmp(st.sort.k, st.sort.dir));
        return rows;
      }
      function draw() {
        if (!st.d) return;
        const rows = filtered(), pg = UI.paginate(rows, st.page, cfg.size || 10);
        const kp = cfg.kpis ? cfg.kpis(st.d) : [];
        const cols = cfg.cols.concat(canW() || cfg.rowActions ? [{ l: '', cls: 'text-right whitespace-nowrap', r: function (r) { return (cfg.rowActions ? cfg.rowActions(r, st.d) : '') + (canW() ? '<button class="btn btn-sm" data-edit="' + E(r[cfg.key || 'id']) + '" aria-label="Ubah">' + UI.icon('edit', 'text-[16px]') + '</button> <button class="btn btn-sm" data-del="' + E(r[cfg.key || 'id']) + '" aria-label="Hapus">' + UI.icon('delete', 'text-[16px] text-[#B91C1C]') + '</button>' : ''); } }] : []);
        U.$('.c-head', root).innerHTML = UI.pageHeader({ title: cfg.title, sub: cfg.sub, actions: (cfg.exportCols ? '<button class="btn" data-xl>' + UI.icon('table_view', 'text-[18px]') + '<span class="hide-m"> Excel</span></button><button class="btn" data-pdf>' + UI.icon('picture_as_pdf', 'text-[18px]') + '<span class="hide-m"> PDF</span></button>' : '') + (canW() && !cfg.noAdd ? '<button class="btn btn-pri" data-add>' + UI.icon('add', 'text-[18px]') + ' ' + E(cfg.addLabel || 'Tambah') + '</button>' : '') });
        U.$('.c-kpi', root).innerHTML = kp.length ? '<div class="grid grid-cols-2 lg:grid-cols-' + Math.min(kp.length, 4) + ' gap-4 mb-6">' + kp.map(function (k) { return k.solid === false ? UI.kpiCard(k) : UI.kpiSolid(k); }).join('') + '</div>' : '';
        U.$('.c-top', root).innerHTML = cfg.top ? cfg.top(st.d, rows) : '';
        const fb = '<div class="flex flex-wrap items-center gap-2 p-4 border-b border-[#DDE3E9]"><div class="relative flex-1 min-w-[180px]">' + UI.icon('search', 'absolute left-2 top-2 text-[20px] text-on-surface-variant') + '<input class="inp" style="padding-left:32px" data-q placeholder="Cari…" value="' + E(st.q) + '" aria-label="Cari"/></div>' + (cfg.filters || []).map(function (f) { return '<select class="inp" style="width:auto" data-f="' + f.k + '" aria-label="' + E(f.l) + '"><option value="">' + E(f.l) + ': semua</option>' + (typeof f.options === 'function' ? f.options(st.d) : f.options).map(function (o) { return '<option value="' + E(o) + '"' + (String(st.f[f.k]) === String(o) ? ' selected' : '') + '>' + E(o) + '</option>'; }).join('') + '</select>'; }).join('') + '</div>';
        U.$('.c-body', root).innerHTML = fb + UI.table({ cols: cols, rows: pg.rows, sort: st.sort, empty: UI.empty({ icon: cfg.icon || 'inbox', title: (st.d.rows || []).length ? 'Tidak ada hasil' : 'Belum ada data', text: (st.d.rows || []).length ? 'Ubah kata kunci atau filter.' : (cfg.empty || 'Data akan tampil di sini.'), action: canW() && !(st.d.rows || []).length && !cfg.noAdd ? '<button class="btn btn-pri mt-4" data-add>' + UI.icon('add', 'text-[18px]') + ' Tambah</button>' : '' }) }) + (pg.total > pg.size ? UI.pager(pg) : '');
        const qi = U.$('[data-q]', root); if (st._focusQ) { qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length); st._focusQ = false; }
        if (cfg.afterDraw) cfg.afterDraw(root, st.d, rows);
      }
      function load(force) {
        return Store.load(key, (cfg.prefix || cfg.id) + '.list', cfg.listData || {}, { force: force, ttl: cfg.ttl, render: function (d) { st.d = d; draw(); }, loading: function () { U.$('.c-body', root).innerHTML = UI.skeleton(6); }, error: function (e) { U.$('.c-body', root).innerHTML = UI.errorRetry(e.message); const b = U.$('[data-retry]', root); if (b) b.onclick = function () { load(true); }; } });
      }
      function loadGuru() { if (cfg.needGuru && App.can(['waka', 'kepsek'])) Store.load('opsi:guru', 'pengguna.opsi', {}, { ttl: 300000, render: function (d) { st.guru = d.rows.filter(function (u) { return u.role === 'guru' || u.role === 'waka'; }); } }).catch(function () {}); }
      function fieldHtml(f, row) {
        if (f.type === 'guru') return UI.field({ name: f.name || 'guru_email', label: f.label || 'Guru', type: 'select', required: true, value: row[f.name || 'guru_email'], placeholder: 'Pilih guru…', options: st.guru.map(function (u) { return { v: u.email, l: u.nama + (u.mapel ? ' — ' + u.mapel : '') }; }), cls: f.cls });
        if (f.type === 'checks') { const cur = U.json(row[f.name], {}) || {}; return '<div class="' + (f.cls || 'col-span-2') + '"><span class="lbl">' + E(f.label) + '</span><div class="grid grid-cols-1 sm:grid-cols-2 gap-1">' + f.options.map(function (o) { return '<label class="flex items-center gap-2 text-body-default"><input type="checkbox" data-chk="' + f.name + '" value="' + E(o) + '"' + (cur[o] ? ' checked' : '') + '/> ' + E(o) + '</label>'; }).join('') + '</div></div>'; }
        if (f.type === 'rubrik') { const cur = U.json(row[f.name], {}) || {}; return '<div class="' + (f.cls || 'col-span-2') + '"><span class="lbl">' + E(f.label) + ' (1 = kurang, 4 = sangat baik)</span>' + f.items.map(function (it) { return '<div class="flex items-center justify-between gap-2 py-1 border-b border-[#EEF2F6]"><span class="text-body-default">' + E(it.l) + '</span><select class="inp" style="width:90px" data-rub="' + f.name + '" data-k="' + it.k + '"><option value="">—</option>' + [1, 2, 3, 4].map(function (n) { return '<option' + (String(cur[it.k]) === String(n) ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div>'; }).join('') + '</div>'; }
        return UI.field(Object.assign({ value: row[f.name] }, f));
      }
      function form(row) {
        const baru = !row, base = baru ? (cfg.defaults ? cfg.defaults(st.d) : {}) : (cfg.toForm ? cfg.toForm(row) : row), fields = cfg.fields(base, st.d);
        const m = UI.modal({ title: baru ? (cfg.formTitle || 'Tambah data') : 'Ubah data', wide: cfg.wide, body: '<form novalidate class="grid grid-cols-1 sm:grid-cols-2 gap-3">' + fields.map(function (f) { return fieldHtml(f, base); }).join('') + '</form>', footer: '<button class="btn" data-x>Batal</button><button class="btn btn-pri" data-ok>Simpan</button>' });
        const f = U.$('form', m.el), rules = {}; fields.forEach(function (x) { if (x.required && x.name && x.type !== 'checks') rules[x.name] = { req: true, label: x.label }; });
        const submit = function () {
          let v = UI.validate(f, rules); if (!v) return; U.$$('[data-chk]', f).forEach(function (c) { v[c.dataset.chk] = v[c.dataset.chk] || {}; if (c.checked) v[c.dataset.chk][c.value] = 1; });
          U.$$('[data-rub]', f).forEach(function (c) { v[c.dataset.rub] = v[c.dataset.rub] || {}; if (c.value) v[c.dataset.rub][c.dataset.k] = Number(c.value); });
          const body = cfg.toPayload ? cfg.toPayload(v, row, st.d) : v; if (row) body[cfg.key || 'id'] = row[cfg.key || 'id'];
          UI.busy(U.$('[data-ok]', m.el), API.call((cfg.prefix || cfg.id) + '.simpan', body).then(function (r) {
            const rows = (st.d.rows || []).slice(), i = rows.findIndex(function (x) { return x[cfg.key || 'id'] === r[cfg.key || 'id']; }); if (i >= 0) rows[i] = r; else rows.push(r);
            st.d = Object.assign({}, st.d, { rows: rows, total: rows.length }); Store.set(key, st.d); Store.invalidate('dashboard'); (cfg.invalidate || []).forEach(Store.invalidate);
            m.close(); draw(); UI.toast('Tersimpan.', 'ok'); if (cfg.afterSave) cfg.afterSave(r); Store.load(key, (cfg.prefix || cfg.id) + '.list', cfg.listData || {}, { force: true, render: function (d) { st.d = d; draw(); } }).catch(function () {});
          }).catch(function (e) { UI.toast(e.message, 'err'); }));
        };
        U.$('[data-ok]', m.el).onclick = submit; f.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
      }
      function hapus(id) {
        UI.confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.', { danger: true, ok: 'Hapus' }).then(function (y) {
          if (!y) return; const before = st.d;
          Store.write((cfg.prefix || cfg.id) + '.hapus', { id: id }, { apply: function () { st.d = Object.assign({}, st.d, { rows: st.d.rows.filter(function (r) { return r[cfg.key || 'id'] !== id; }) }); Store.set(key, st.d); draw(); }, rollback: function () { st.d = before; Store.set(key, before); draw(); }, ok: function () { UI.toast('Dihapus.', 'ok'); Store.invalidate('dashboard'); } }).catch(function () {});
        });
      }
      function exportRows() { return filtered().map(function (r) { const o = {}; cfg.exportCols.forEach(function (c) { o[c.k] = c.f ? c.f(r) : r[c.k]; }); return o; }); }
      App.page(cfg.id, {
        title: cfg.title, crumb: cfg.crumb || cfg.title, roles: cfg.roles,
        init: function (el) {
          root = el; el.innerHTML = '<div class="c-head"></div><div class="c-kpi"></div><div class="c-top"></div><div class="card"><div class="c-body"></div></div>';
          UI.on(el, 'click', '[data-add]', function () { form(null); });
          UI.on(el, 'click', '[data-edit]', function (b) { const r = st.d.rows.find(function (x) { return String(x[cfg.key || 'id']) === b.dataset.edit; }); if (r) form(r); });
          UI.on(el, 'click', '[data-del]', function (b) { hapus(b.dataset.del); });
          UI.on(el, 'click', '[data-sort]', function (b) { const k = b.dataset.sort; st.sort = st.sort && st.sort.k === k && st.sort.dir === 'asc' ? { k: k, dir: 'desc' } : { k: k, dir: 'asc' }; draw(); });
          UI.on(el, 'click', '[data-page]', function (b) { st.page = Number(b.dataset.page); draw(); });
          UI.on(el, 'click', '[data-xl]', function () { U.excel(cfg.id + '-' + U.today(), cfg.exportCols, exportRows(), cfg.title).catch(function (e) { UI.toast(e.message, 'err'); }); });
          UI.on(el, 'click', '[data-pdf]', function () { U.pdfTabel(cfg.id + '-' + U.today(), cfg.title, cfg.exportCols, exportRows(), 'Tahun ajaran ' + App.tahun()).catch(function (e) { UI.toast(e.message, 'err'); }); });
          el.addEventListener('input', function (e) { if (e.target.matches('[data-q]')) { st.q = e.target.value; st.page = 1; st._focusQ = true; clearTimeout(st._t); st._t = setTimeout(draw, 120); } });
          el.addEventListener('change', function (e) { if (e.target.matches('[data-f]')) { st.f[e.target.dataset.f] = e.target.value; st.page = 1; draw(); } });
          if (cfg.init) cfg.init(el, { st: st, draw: draw, load: load, form: form });
        },
        show: function () { loadGuru(); load(); },
        prefetch: function () { Store.load(key, (cfg.prefix || cfg.id) + '.list', cfg.listData || {}, { ttl: 30000 }).catch(function () {}); }
      });
    }
  };
})();
