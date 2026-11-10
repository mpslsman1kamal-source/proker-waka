// ui.js — komponen bersama (satu sumber untuk semua halaman). Mengembalikan string HTML atau pengendali overlay.
(function () {
  const E = U.esc;
  const UI = window.UI = {};
  UI.icon = function (n, c) { return '<span class="material-symbols-outlined ' + (c || '') + '">' + n + '</span>'; };

  const TONE = { green: 'b-green', blue: 'b-blue', orange: 'b-orange', red: 'b-red', gray: 'b-gray', teal: 'b-teal' };
  const STATUS = { 'Selesai': 'green', 'Disetujui': 'green', 'Terkirim': 'green', 'Terlaksana': 'green', 'Hadir': 'green', 'Lengkap': 'green', 'Aktif': 'green', 'Tuntas': 'green', 'Terbit': 'green', 'Dikonfirmasi': 'green', 'Ya': 'green', 'YA': 'green',
    'Berjalan': 'blue', 'Diajukan': 'blue', 'Dijadwalkan': 'blue', 'Direncanakan': 'blue', 'Proses': 'blue', 'Dalam Review': 'blue', 'Terjadwal': 'blue',
    'Belum Mulai': 'gray', 'Draft': 'gray', 'Belum': 'gray', 'Nonaktif': 'gray', 'TIDAK': 'gray', 'Tidak': 'gray',
    'Menunggu': 'orange', 'Perlu Revisi': 'orange', 'Sebagian': 'orange', 'Perlu Tindakan': 'orange', 'Belum Dikonfirmasi': 'orange', 'Antre': 'orange',
    'Terlambat': 'red', 'Ditolak': 'red', 'Gagal': 'red', 'Kritis': 'red', 'Tidak Lengkap': 'red', 'Dibatalkan': 'red' };
  UI.badge = function (t, tone) { return '<span class="badge ' + (TONE[tone] || 'b-gray') + '">' + E(t) + '</span>'; };
  UI.status = function (s) { return UI.badge(s || '—', STATUS[s] || 'gray'); };
  UI.tone = function (s) { return STATUS[s] || 'gray'; };
  const BAR = { green: '#15803D', blue: '#1E3A8A', teal: '#0F766E', orange: '#EA580C', red: '#B91C1C' };
  UI.progress = function (pct, tone, label) {
    pct = Math.max(0, Math.min(100, U.num(pct)));
    tone = tone || (pct >= 100 ? 'green' : pct >= 50 ? 'teal' : pct > 0 ? 'orange' : 'gray');
    return '<div class="flex items-center gap-2"><div class="prog flex-1"><i style="width:' + pct + '%;background:' + (BAR[tone] || '#94a3b8') + '"></i></div>' + (label === false ? '' : '<span class="font-mono-data text-[11px] text-on-surface-variant w-9 text-right">' + Math.round(pct) + '%</span>') + '</div>';
  };

  UI.pageHeader = function (o) {
    return '<div class="flex flex-wrap items-start justify-between gap-3 mb-6"><div class="min-w-0"><h1 class="font-headline-h1 text-headline-h1 text-[#0F172A]">' + E(o.title) + '</h1>' + (o.sub ? '<p class="text-body-default text-on-surface-variant mt-1">' + E(o.sub) + '</p>' : '') + '</div>' + (o.actions ? '<div class="flex flex-wrap items-center gap-2">' + o.actions + '</div>' : '') + '</div>';
  };
  const SOLID = { blue: '#1E3A8A', teal: '#0F766E', red: '#B91C1C', orange: '#EA580C', green: '#15803D' };
  UI.kpiSolid = function (o) {
    const dark = o.tone === 'orange';
    return '<div class="rounded-xl p-4 min-h-[110px] flex flex-col justify-between" style="background:' + (SOLID[o.tone] || SOLID.blue) + ';color:' + (dark ? '#0F172A' : '#fff') + '"><div class="flex items-center justify-between"><span class="font-mono-header text-mono-header uppercase">' + E(o.label) + '</span>' + (o.icon ? UI.icon(o.icon, 'text-[20px] opacity-80') : '') + '</div><div><div class="font-stat-numeral text-stat-numeral">' + E(o.value) + '</div>' + (o.sub ? '<div class="text-caption opacity-80">' + E(o.sub) + '</div>' : '') + '</div></div>';
  };
  UI.kpiCard = function (o) {
    return '<div class="card p-4 min-h-[110px] flex flex-col justify-between"><div class="flex items-center justify-between"><span class="font-mono-header text-mono-header uppercase text-on-surface-variant">' + E(o.label) + '</span>' + (o.icon ? UI.icon(o.icon, 'text-[20px]" style="color:' + (SOLID[o.tone] || '#64748b')) : '') + '</div><div><div class="font-stat-numeral text-stat-numeral text-[#0F172A]">' + E(o.value) + '</div>' + (o.sub ? '<div class="text-caption text-on-surface-variant">' + E(o.sub) + '</div>' : '') + '</div></div>';
  };
  UI.section = function (title, actions, body, cls) {
    return '<section class="card ' + (cls || '') + '"><div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#DDE3E9]"><h2 class="font-headline-h3 text-headline-h3">' + title + '</h2>' + (actions || '') + '</div><div class="p-4">' + body + '</div></section>';
  };
  UI.skeleton = function (n) { let s = ''; for (let i = 0; i < (n || 4); i++) s += '<div class="skel h-10 mb-2" style="width:' + (100 - (i % 3) * 8) + '%"></div>'; return '<div class="p-4">' + s + '</div>'; };
  UI.skelPage = function () { return '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' + '<div class="skel h-[110px]"></div>'.repeat(4) + '</div><div class="skel h-64"></div>'; };
  UI.empty = function (o) {
    return '<div class="flex flex-col items-center text-center py-12 px-4"><div class="w-14 h-14 rounded-full bg-[#E9EEF5] flex items-center justify-center mb-3">' + UI.icon(o.icon || 'inbox', 'text-[28px] text-on-surface-variant') + '</div><div class="font-headline-h3 text-headline-h3">' + E(o.title || 'Belum ada data') + '</div>' + (o.text ? '<p class="text-body-default text-on-surface-variant mt-1 max-w-sm">' + E(o.text) + '</p>' : '') + (o.action || '') + '</div>';
  };
  UI.errorRetry = function (msg) {
    return '<div class="flex flex-col items-center text-center py-12 px-4">' + UI.icon('cloud_off', 'text-[36px] text-[#B91C1C]') + '<div class="font-headline-h3 text-headline-h3 mt-2">Gagal memuat data</div><p class="text-body-default text-on-surface-variant mt-1 max-w-sm">' + E(msg || 'Periksa koneksi lalu coba lagi.') + '</p><button class="btn btn-pri mt-4" data-retry>' + UI.icon('refresh', 'text-[18px]') + ' Coba lagi</button></div>';
  };

  // ---- form ----
  UI.field = function (o) {
    const id = o.id || o.name, v = o.value == null ? '' : o.value, req = o.required ? ' <span class="text-[#B91C1C]">*</span>' : '', attrs = (o.attrs || '') + (o.required ? ' required' : '') + (o.disabled ? ' disabled' : '');
    let ctl;
    if (o.type === 'select') ctl = '<select class="inp" id="' + id + '" name="' + o.name + '"' + attrs + '>' + (o.placeholder ? '<option value="">' + E(o.placeholder) + '</option>' : '') + (o.options || []).map(function (x) { const val = typeof x === 'object' ? x.v : x, lab = typeof x === 'object' ? x.l : x; return '<option value="' + E(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + E(lab) + '</option>'; }).join('') + '</select>';
    else if (o.type === 'textarea') ctl = '<textarea class="inp" id="' + id + '" name="' + o.name + '" rows="' + (o.rows || 3) + '" placeholder="' + E(o.placeholder || '') + '"' + attrs + '>' + E(v) + '</textarea>';
    else ctl = '<input class="inp" id="' + id + '" name="' + o.name + '" type="' + (o.type || 'text') + '" value="' + E(v) + '" placeholder="' + E(o.placeholder || '') + '"' + attrs + '/>';
    return '<div class="' + (o.cls || '') + '"><label class="lbl" for="' + id + '">' + E(o.label) + req + '</label>' + ctl + (o.hint ? '<div class="text-caption text-on-surface-variant mt-1">' + E(o.hint) + '</div>' : '') + '<div class="errtxt" data-err="' + o.name + '" hidden></div></div>';
  };
  UI.read = function (root) { // semua [name] → objek
    const o = {}; U.$$('[name]', root).forEach(function (el) { if (el.type === 'checkbox') o[el.name] = el.checked; else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } else o[el.name] = el.value; }); return o;
  };
  UI.fill = function (root, o) { Object.keys(o || {}).forEach(function (k) { const el = U.$('[name="' + k + '"]', root); if (el) { if (el.type === 'checkbox') el.checked = !!o[k]; else el.value = o[k] == null ? '' : o[k]; } }); };
  // aturan: {nama: {req:true, min:3, label:'Nama', pat:/../, msg:''}}
  UI.validate = function (root, rules) {
    const v = UI.read(root); let ok = true, first = null;
    U.$$('[data-err]', root).forEach(function (e) { e.hidden = true; }); U.$$('.inp.err', root).forEach(function (e) { e.classList.remove('err'); });
    Object.keys(rules).forEach(function (k) {
      const r = rules[k], val = String(v[k] == null ? '' : v[k]).trim(); let msg = '';
      if (r.req && !val) msg = (r.label || 'Kolom') + ' wajib diisi.'; else if (val && r.min && val.length < r.min) msg = (r.label || 'Kolom') + ' minimal ' + r.min + ' karakter.'; else if (val && r.pat && !r.pat.test(val)) msg = r.msg || ((r.label || 'Kolom') + ' tidak valid.'); else if (r.fn) msg = r.fn(val, v) || '';
      if (msg) { ok = false; const el = U.$('[name="' + k + '"]', root), er = U.$('[data-err="' + k + '"]', root); if (el) { el.classList.add('err'); first = first || el; } if (er) { er.textContent = msg; er.hidden = false; } }
    });
    if (first) first.focus(); return ok ? v : null;
  };
  UI.busy = function (btn, p) { if (!btn) return p; const h = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Memproses…'; const done = function () { btn.disabled = false; btn.innerHTML = h; }; p.then(done, done); return p; };

  // ---- tabel ----
  // cols: [{k,l,r:(row)=>html, cls, sort:true, num:true}]
  UI.table = function (o) {
    const cols = o.cols, rows = o.rows || [];
    let h = '<div class="scroll-x"><table class="tbl"><thead><tr>' + (o.select ? '<th style="width:32px"><input type="checkbox" data-selall aria-label="Pilih semua"/></th>' : '') + cols.map(function (c) { const act = o.sort && o.sort.k === c.k; return '<th class="' + (c.cls || '') + (c.sort ? ' cursor-pointer select-none' : '') + '"' + (c.sort ? ' data-sort="' + c.k + '"' : '') + '>' + E(c.l) + (act ? ' ' + (o.sort.dir === 'desc' ? '▼' : '▲') : '') + '</th>'; }).join('') + '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + (cols.length + (o.select ? 1 : 0)) + '">' + (o.empty || UI.empty({ icon: 'search_off', title: 'Tidak ada data', text: 'Ubah kata kunci atau filter pencarian.' })) + '</td></tr>';
    rows.forEach(function (r) {
      h += '<tr' + (o.rowAttr ? ' ' + o.rowAttr(r) : '') + '>' + (o.select ? '<td><input type="checkbox" data-sel="' + E(r[o.idKey || 'id']) + '"/></td>' : '') + cols.map(function (c) { return '<td class="' + (c.cls || '') + '">' + (c.r ? c.r(r) : E(r[c.k] == null ? '' : r[c.k])) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  };
  UI.paginate = function (arr, page, size) { size = size || 10; const total = arr.length, pages = Math.max(1, Math.ceil(total / size)); page = Math.min(Math.max(1, page || 1), pages); return { rows: arr.slice((page - 1) * size, page * size), page: page, pages: pages, total: total, size: size, from: total ? (page - 1) * size + 1 : 0, to: Math.min(total, page * size) }; };
  UI.pager = function (p) {
    return '<div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-[#DDE3E9] text-caption text-on-surface-variant"><span>Menampilkan ' + p.from + '–' + p.to + ' dari ' + p.total + '</span><div class="flex items-center gap-1"><button class="btn btn-sm" data-page="' + (p.page - 1) + '"' + (p.page <= 1 ? ' disabled' : '') + ' aria-label="Sebelumnya">' + UI.icon('chevron_left', 'text-[16px]') + '</button><span class="px-2 font-mono-data">' + p.page + ' / ' + p.pages + '</span><button class="btn btn-sm" data-page="' + (p.page + 1) + '"' + (p.page >= p.pages ? ' disabled' : '') + ' aria-label="Berikutnya">' + UI.icon('chevron_right', 'text-[16px]') + '</button></div></div>';
  };
  UI.tabs = function (list, active, attr) { return '<div class="tabs" role="tablist">' + list.map(function (t) { return '<button role="tab" class="' + (t.id === active ? 'on' : '') + '" data-' + (attr || 'tab') + '="' + t.id + '">' + (t.icon ? UI.icon(t.icon, 'text-[16px] mr-1') : '') + E(t.l) + (t.n != null ? ' <span class="badge b-gray ml-1">' + t.n + '</span>' : '') + '</button>'; }).join('') + '</div>'; };
  UI.chips = function (list, active, attr) { return '<div class="flex flex-wrap gap-2">' + list.map(function (c) { const id = typeof c === 'object' ? c.id : c, l = typeof c === 'object' ? c.l : c; return '<button class="chip ' + (String(id) === String(active) ? 'on' : '') + '" data-' + (attr || 'chip') + '="' + E(id) + '">' + E(l) + '</button>'; }).join('') + '</div>'; };
  // Delegasi: onclick(root, selector, fn(el, ev))
  UI.on = function (root, ev, sel, fn) { root.addEventListener(ev, function (e) { const t = e.target.closest(sel); if (t && root.contains(t)) fn(t, e); }); };

  // ---- overlay ----
  let overlayN = 0;
  function openOv(o, kind) {
    const root = U.$('#overlay-root'), ov = document.createElement('div'); ov.className = 'ov' + (kind === 'drawer' ? ' drawer' : ''); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="box' + (o.wide ? ' wide' : '') + '"><div class="hd"><span>' + E(o.title || '') + '</span><button class="btn btn-sm" data-x aria-label="Tutup">' + UI.icon('close', 'text-[18px]') + '</button></div><div class="bd">' + (o.body || '') + '</div>' + (o.footer ? '<div class="ft">' + o.footer + '</div>' : '') + '</div>';
    const prev = document.activeElement; overlayN++;
    const api = { el: ov, body: U.$('.bd', ov), foot: U.$('.ft', ov), close: function () { if (!ov.parentNode) return; ov.remove(); overlayN--; document.removeEventListener('keydown', key); if (prev && prev.focus) try { prev.focus(); } catch (e) {} if (o.onClose) o.onClose(); } };
    function key(e) { if (e.key === 'Escape' && root.lastChild === ov) api.close(); }
    ov.addEventListener('mousedown', function (e) { if (e.target === ov && !o.static) api.close(); });
    ov.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) api.close(); });
    document.addEventListener('keydown', key); root.appendChild(ov);
    const f = U.$('input,select,textarea,button:not([data-x])', api.body); if (f && !o.noFocus) setTimeout(function () { try { f.focus(); } catch (e) {} }, 30);
    return api;
  }
  UI.modal = function (o) { return openOv(o, 'modal'); };
  UI.drawer = function (o) { return openOv(o, 'drawer'); };
  UI.confirm = function (msg, o) {
    o = o || {};
    return new Promise(function (ok) {
      let done = false; const m = UI.modal({ title: o.title || 'Konfirmasi', body: '<p class="text-body-default">' + E(msg) + '</p>', footer: '<button class="btn" data-n>Batal</button><button class="btn ' + (o.danger ? 'btn-bad' : 'btn-pri') + '" data-y>' + E(o.ok || 'Ya, lanjutkan') + '</button>', onClose: function () { if (!done) { done = true; ok(false); } }, noFocus: true });
      U.$('[data-n]', m.el).onclick = function () { m.close(); }; U.$('[data-y]', m.el).onclick = function () { done = true; m.close(); ok(true); };
    });
  };
  UI.toast = function (msg, type) {
    const r = U.$('#toast-root'), t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.setAttribute('role', 'status');
    t.innerHTML = UI.icon(type === 'ok' ? 'check_circle' : type === 'err' ? 'error' : type === 'warn' ? 'warning' : 'info', 'text-[18px]') + '<span>' + E(msg) + '</span>';
    r.appendChild(t); setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 300); }, type === 'err' ? 5000 : 2800);
    while (r.children.length > 3) r.removeChild(r.firstChild);
  };
  UI.dropzone = function (id, o) { o = o || {}; return '<div class="dz" id="' + id + '" tabindex="0" role="button">' + UI.icon('cloud_upload', 'text-[32px]') + '<div class="font-body-medium mt-1">' + E(o.title || 'Seret berkas ke sini atau klik untuk memilih') + '</div><div class="text-caption mt-1">' + E(o.hint || 'Maksimal 10 MB') + '</div><input type="file" hidden ' + (o.accept ? 'accept="' + o.accept + '"' : '') + (o.multiple ? ' multiple' : '') + '/></div>'; };
  UI.bindDropzone = function (el, onFiles, maxMB) {
    const inp = U.$('input[type=file]', el), lim = (maxMB || 10) * 1048576;
    const handle = function (fl) { fl = Array.prototype.slice.call(fl || []); const bad = fl.filter(function (f) { return f.size > lim; }); if (bad.length) { UI.toast('Berkas "' + bad[0].name + '" melebihi ' + (maxMB || 10) + ' MB.', 'err'); return; } if (fl.length) onFiles(fl); };
    el.onclick = function () { inp.click(); }; el.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
    inp.onchange = function () { handle(inp.files); inp.value = ''; };
    el.ondragover = function (e) { e.preventDefault(); el.classList.add('over'); }; el.ondragleave = function () { el.classList.remove('over'); };
    el.ondrop = function (e) { e.preventDefault(); el.classList.remove('over'); handle(e.dataTransfer.files); };
  };
  // Pencarian/filter ringan: kembalikan fungsi debounce untuk input
  UI.bindSearch = function (inp, fn) { inp.addEventListener('input', U.debounce(function () { fn(inp.value); }, 120)); };
  UI.avatar = function (nama, size) { const s = size || 32; return '<span class="inline-flex items-center justify-center rounded-full bg-primary text-on-primary font-mono-header font-bold" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * .36) + 'px">' + E(inisial(nama)) + '</span>'; };
  function inisial(n) { const p = String(n || '').replace(/^(Drs\.|Dra\.|Dr\.|H\.|Hj\.)\s*/gi, '').replace(/[,.].*$/, '').trim().split(/\s+/); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : (p[0] || '')[1] || '')).toUpperCase(); }
  UI.inisial = inisial;
})();
