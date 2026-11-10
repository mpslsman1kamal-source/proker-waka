// charts.js — grafik SVG ringan tanpa pustaka (bar, garis, donat, tumpuk). Responsif via viewBox.
(function () {
  const E = U.esc, C = window.Charts = {};
  const PAL = ['#1E3A8A', '#0F766E', '#EA580C', '#15803D', '#B91C1C', '#4059AA', '#80D5CB', '#94A3B8'];
  C.PAL = PAL;
  function nice(max) { if (max <= 0) return 10; const p = Math.pow(10, Math.floor(Math.log10(max))); const n = max / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
  // bar vertikal: data [{l, v, c?}] ; o:{max, target, unit, h}
  C.bar = function (data, o) {
    o = o || {}; const W = 560, H = o.h || 240, m = { t: 16, r: 12, b: 38, l: 36 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = o.max || nice(Math.max.apply(null, data.map(function (d) { return d.v; }).concat([o.target || 0, 1]))), bw = Math.min(46, iw / data.length * .62);
    let s = '<svg class="svgchart w-full" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + E(o.label || 'Grafik batang') + '">';
    for (let i = 0; i <= 4; i++) { const y = m.t + ih - ih * i / 4; s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" stroke="#E2E8F0"/><text x="' + (m.l - 6) + '" y="' + (y + 4) + '" font-size="10" text-anchor="end" fill="#64748B">' + Math.round(max * i / 4) + '</text>'; }
    data.forEach(function (d, i) {
      const x = m.l + iw / data.length * (i + .5), h = ih * Math.min(d.v, max) / max, col = d.c || (o.target && d.v < o.target ? '#EA580C' : '#1E3A8A');
      s += '<rect x="' + (x - bw / 2) + '" y="' + (m.t + ih - h) + '" width="' + bw + '" height="' + h + '" rx="3" fill="' + col + '"><title>' + E(d.l) + ': ' + U.fmt(d.v) + (o.unit || '') + '</title></rect><text x="' + x + '" y="' + (m.t + ih - h - 4) + '" font-size="10" text-anchor="middle" fill="#0F172A" font-weight="600">' + U.fmt(d.v, 0) + '</text><text x="' + x + '" y="' + (H - m.b + 14) + '" font-size="10" text-anchor="middle" fill="#475569">' + E(String(d.l).length > 9 ? String(d.l).slice(0, 8) + '…' : d.l) + '</text>';
    });
    if (o.target) { const y = m.t + ih - ih * o.target / max; s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" stroke="#B91C1C" stroke-dasharray="5 4"/><text x="' + (W - m.r) + '" y="' + (y - 4) + '" font-size="10" text-anchor="end" fill="#B91C1C">Target ' + o.target + (o.unit || '') + '</text>'; }
    return s + '</svg>';
  };
  // bar horizontal: data [{l,v}]
  C.hbar = function (data, o) {
    o = o || {}; const rowH = 28, W = 560, H = data.length * rowH + 8, lw = o.lw || 150, max = o.max || nice(Math.max.apply(null, data.map(function (d) { return d.v; }).concat([1])));
    let s = '<svg class="svgchart w-full" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + E(o.label || 'Grafik batang horizontal') + '">';
    data.forEach(function (d, i) { const y = i * rowH + 4, w = (W - lw - 50) * Math.min(d.v, max) / max; s += '<text x="' + (lw - 8) + '" y="' + (y + 15) + '" font-size="11" text-anchor="end" fill="#334155">' + E(String(d.l).length > 24 ? String(d.l).slice(0, 23) + '…' : d.l) + '</text><rect x="' + lw + '" y="' + y + '" width="' + (W - lw - 50) + '" height="18" rx="3" fill="#EEF2F6"/><rect x="' + lw + '" y="' + y + '" width="' + w + '" height="18" rx="3" fill="' + (d.c || '#1E3A8A') + '"><title>' + E(d.l) + ': ' + U.fmt(d.v) + (o.unit || '') + '</title></rect><text x="' + (lw + (W - lw - 50) + 6) + '" y="' + (y + 14) + '" font-size="11" fill="#0F172A" font-weight="600">' + U.fmt(d.v) + (o.unit || '') + '</text>'; });
    return s + '</svg>';
  };
  // garis: labels [], series [{n, v:[], c}]
  C.line = function (labels, series, o) {
    o = o || {}; const W = 560, H = o.h || 220, m = { t: 14, r: 14, b: 32, l: 34 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const all = [].concat.apply([], series.map(function (s) { return s.v; })), max = o.max || nice(Math.max.apply(null, all.concat([1])));
    const px = function (i) { return m.l + (labels.length > 1 ? iw * i / (labels.length - 1) : iw / 2); }, py = function (v) { return m.t + ih - ih * Math.min(v, max) / max; };
    let s = '<svg class="svgchart w-full" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + E(o.label || 'Grafik garis') + '">';
    for (let i = 0; i <= 4; i++) { const y = m.t + ih - ih * i / 4; s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" stroke="#E2E8F0"/><text x="' + (m.l - 6) + '" y="' + (y + 4) + '" font-size="10" text-anchor="end" fill="#64748B">' + Math.round(max * i / 4) + '</text>'; }
    labels.forEach(function (l, i) { s += '<text x="' + px(i) + '" y="' + (H - 10) + '" font-size="10" text-anchor="middle" fill="#475569">' + E(l) + '</text>'; });
    series.forEach(function (se, k) {
      const col = se.c || PAL[k % PAL.length], pts = se.v.map(function (v, i) { return v == null ? null : [px(i), py(v)]; }).filter(Boolean);
      if (pts.length) s += '<polyline fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round" ' + (se.dash ? 'stroke-dasharray="5 4"' : '') + ' points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>' + (se.dash ? '' : pts.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#fff" stroke="' + col + '" stroke-width="2"><title>' + E(se.n) + ': ' + U.fmt(se.v[i]) + '</title></circle>'; }).join(''));
    });
    s += '</svg>';
    if (series.length > 1 || o.legend) s += C.legend(series.map(function (x, i) { return { l: x.n, c: x.c || PAL[i % PAL.length] }; }));
    return s;
  };
  // donat: data [{l,v,c?}] ; center: teks tengah
  C.donut = function (data, o) {
    o = o || {}; const R = 62, r = 42, cx = 80, cy = 80, tot = U.sum(data, function (d) { return d.v; }) || 1;
    let a0 = -Math.PI / 2, s = '<svg class="svgchart" viewBox="0 0 160 160" style="width:100%;max-width:200px" role="img" aria-label="' + E(o.label || 'Grafik donat') + '">';
    if (!U.sum(data, function (d) { return d.v; })) s += '<circle cx="80" cy="80" r="52" fill="none" stroke="#E2E8F0" stroke-width="20"/>';
    data.forEach(function (d, i) {
      if (!d.v) return; const a1 = a0 + Math.PI * 2 * d.v / tot, big = a1 - a0 > Math.PI ? 1 : 0, f = a1 - a0 >= Math.PI * 2 - .001;
      const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(f ? a0 + 3.14 : a1), y1 = cy + R * Math.sin(f ? a0 + 3.14 : a1), x2 = cx + r * Math.cos(f ? a0 + 3.14 : a1), y2 = cy + r * Math.sin(f ? a0 + 3.14 : a1), x3 = cx + r * Math.cos(a0), y3 = cy + r * Math.sin(a0), col = d.c || PAL[i % PAL.length];
      s += f ? '<circle cx="80" cy="80" r="52" fill="none" stroke="' + col + '" stroke-width="20"><title>' + E(d.l) + ': ' + d.v + '</title></circle>' : '<path d="M' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' A' + r + ' ' + r + ' 0 ' + big + ' 0 ' + x3 + ' ' + y3 + ' Z" fill="' + col + '"><title>' + E(d.l) + ': ' + d.v + '</title></path>';
      a0 = a1;
    });
    if (o.center != null) s += '<text x="80" y="82" font-size="20" font-weight="700" text-anchor="middle" fill="#0F172A">' + E(o.center) + '</text>' + (o.sub ? '<text x="80" y="98" font-size="9" text-anchor="middle" fill="#64748B">' + E(o.sub) + '</text>' : '');
    return s + '</svg>';
  };
  // bar bertumpuk: rows [{l, parts:[{v,c,n}]}]
  C.stack = function (rows, o) {
    o = o || {}; const W = 560, rowH = 30, H = rows.length * rowH + 6, lw = o.lw || 120;
    let s = '<svg class="svgchart w-full" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + E(o.label || 'Grafik bertumpuk') + '">';
    rows.forEach(function (r, i) { const y = i * rowH + 4, tot = U.sum(r.parts, function (p) { return p.v; }) || 1; let x = lw; s += '<text x="' + (lw - 8) + '" y="' + (y + 15) + '" font-size="11" text-anchor="end" fill="#334155">' + E(r.l) + '</text>'; r.parts.forEach(function (p) { const w = (W - lw - 8) * p.v / tot; if (w > 0) { s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="20" fill="' + p.c + '"><title>' + E(p.n) + ': ' + p.v + '</title></rect>' + (w > 22 ? '<text x="' + (x + w / 2) + '" y="' + (y + 14) + '" font-size="10" text-anchor="middle" fill="#fff" font-weight="600">' + p.v + '</text>' : ''); x += w; } }); });
    return s + '</svg>';
  };
  C.legend = function (items) { return '<div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-caption text-on-surface-variant">' + items.map(function (i) { return '<span class="inline-flex items-center gap-1"><i style="width:10px;height:10px;border-radius:2px;background:' + i.c + ';display:inline-block"></i>' + E(i.l) + '</span>'; }).join('') + '</div>'; };
  C.spark = function (vals, col) { if (!vals.length) return ''; const W = 90, H = 26, max = Math.max.apply(null, vals.concat([1])); const pts = vals.map(function (v, i) { return [vals.length > 1 ? W * i / (vals.length - 1) : W / 2, H - 3 - (H - 6) * v / max]; }); return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><polyline fill="none" stroke="' + (col || '#0F766E') + '" stroke-width="2" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/></svg>'; };
})();
