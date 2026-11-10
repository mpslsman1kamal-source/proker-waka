// util.js — fungsi kecil bersama (namespace U)
(function () {
  const U = window.U = {};
  U.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  U.uuid = function () { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); };
  U.debounce = function (fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 200); }; };
  U.num = function (v, d) { const n = Number(v); return isFinite(n) && v !== '' && v != null ? n : (d === undefined ? 0 : d); };
  U.fmt = function (n, dec) { return U.num(n).toLocaleString('id-ID', { maximumFractionDigits: dec == null ? 1 : dec }); };
  const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const BLN3 = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  U.BLN = BLN; U.BLN3 = BLN3;
  U.tgl = function (s, short) { // '2026-07-15' → '15 Jul 2026'
    if (!s) return '—'; const p = String(s).slice(0, 10).split('-'); if (p.length < 3) return String(s);
    return Number(p[2]) + ' ' + (short === false ? BLN[Number(p[1]) - 1] : BLN3[Number(p[1]) - 1]) + ' ' + p[0];
  };
  U.tglWaktu = function (s) { if (!s) return '—'; const d = new Date(s); if (isNaN(d)) return String(s); return U.tgl(d.toISOString().slice(0, 10)) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); };
  U.today = function () { const d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  U.addDays = function (s, n) { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  U.rel = function (s) { // "3 hari lagi" / "2 hari lalu"
    if (!s) return ''; const d = Math.round((new Date(String(s).slice(0, 10) + 'T00:00:00') - new Date(U.today() + 'T00:00:00')) / 86400000);
    return d === 0 ? 'Hari ini' : d > 0 ? d + ' hari lagi' : Math.abs(d) + ' hari lalu';
  };
  U.group = function (arr, fn) { const o = {}; (arr || []).forEach(function (x) { const k = fn(x); (o[k] = o[k] || []).push(x); }); return o; };
  U.sum = function (arr, fn) { return (arr || []).reduce(function (a, x) { return a + U.num(fn ? fn(x) : x); }, 0); };
  U.avg = function (arr, fn) { return arr && arr.length ? U.sum(arr, fn) / arr.length : 0; };
  U.json = function (s, d) { try { return s === '' || s == null ? d : (typeof s === 'string' ? JSON.parse(s) : s); } catch (e) { return d; } };
  U.cmp = function (k, dir) { return function (a, b) { const x = a[k], y = b[k]; const r = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'id', { numeric: true }); return dir === 'desc' ? -r : r; }; };
  U.search = function (rows, q, keys) { q = String(q || '').trim().toLowerCase(); if (!q) return rows; return rows.filter(function (r) { return keys.some(function (k) { return String(r[k] == null ? '' : r[k]).toLowerCase().indexOf(q) >= 0; }); }); };
  U.hash = function (o) { const s = JSON.stringify(o); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; };
  U.fileToBase64 = function (file) {
    return new Promise(function (ok, bad) { const r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1] || ''); }; r.onerror = function () { bad(new Error('Gagal membaca berkas')); }; r.readAsDataURL(file); });
  };
  U.b64ToBlob = function (b64, mime) { const bin = atob(b64), n = bin.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: mime || 'application/octet-stream' }); };
  U.saveBlob = function (blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
  U.ukuran = function (kb) { kb = U.num(kb); return kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB'; };
  U.lazy = function (src) { U._lz = U._lz || {}; return U._lz[src] || (U._lz[src] = new Promise(function (ok, bad) { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { delete U._lz[src]; bad(new Error('Gagal memuat pustaka')); }; document.head.appendChild(s); })); };
  U.lib = {
    xlsx: function () { return window.XLSX ? Promise.resolve() : U.lazy('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'); },
    jspdf: function () { return window.jspdf ? Promise.resolve() : U.lazy('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(function () { return U.lazy('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'); }); }
  };
  // Ekspor tabel: kolom = [{k,l}] ; baris = array objek
  U.excel = function (nama, kolom, baris, sheetName) {
    return U.lib.xlsx().then(function () {
      const aoa = [kolom.map(function (c) { return c.l; })].concat(baris.map(function (r) { return kolom.map(function (c) { return r[c.k] == null ? '' : r[c.k]; }); }));
      const ws = XLSX.utils.aoa_to_sheet(aoa), wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, (sheetName || 'Data').slice(0, 30)); XLSX.writeFile(wb, nama + '.xlsx');
    });
  };
  U.pdfTabel = function (nama, judul, kolom, baris, sub) {
    return U.lib.jspdf().then(function () {
      const doc = new window.jspdf.jsPDF({ orientation: kolom.length > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
      doc.setFontSize(14); doc.text(judul, 40, 44); if (sub) { doc.setFontSize(9); doc.text(sub, 40, 60); }
      doc.autoTable({ startY: 72, head: [kolom.map(function (c) { return c.l; })], body: baris.map(function (r) { return kolom.map(function (c) { return r[c.k] == null ? '' : String(r[c.k]); }); }), styles: { fontSize: 8 }, headStyles: { fillColor: [30, 58, 138] } });
      doc.save(nama + '.pdf');
    });
  };
  U.csv = function (nama, kolom, baris) {
    const q = function (v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const t = [kolom.map(function (c) { return q(c.l); }).join(',')].concat(baris.map(function (r) { return kolom.map(function (c) { return q(r[c.k]); }).join(','); })).join('\n');
    U.saveBlob(new Blob(['﻿' + t], { type: 'text/csv;charset=utf-8' }), nama + '.csv');
  };
  U.parseCsv = function (text) {
    const rows = []; let cur = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) { const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ',' || c === ';') { cur.push(f); f = ''; }
      else if (c === '\n') { cur.push(f); rows.push(cur); cur = []; f = ''; } else if (c !== '\r') f += c; }
    if (f !== '' || cur.length) { cur.push(f); rows.push(cur); }
    return rows;
  };
  // Penyimpanan lokal aman (bisa gagal di mode privat)
  U.ls = {
    get: function (k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
})();
