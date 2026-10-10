// 3D technical drawings for the Explanation panel.
// A tiny orthographic 3D engine: solids are built from faces, back faces are culled, faces are
// flat-shaded from one light, and the result is plain SVG (no libraries, works offline).
// Each drawing names its parts; the part that matches the item being viewed is drawn in orange
// and pointed out, the others get numbered markers explained in a legend under the drawing.
(function () {
  'use strict';
  var W = 480, H = 330, PAD = 22;
  var ACC = '#f97316';
  var M = {
    concrete: '#b9bec4', conc2: '#d3d7dc', pcc: '#a8a398', brick: '#c4673f', brick2: '#a9532f', mortar: '#ddd5c6',
    wood: '#b9824b', wood2: '#9a6838', ply: '#dcb67f', core: '#e8cf9a', steel: '#9aa6b1', steel2: '#6f7b87', brass: '#c9a43a',
    glass: '#a9dbee', soil: '#a57d56', soil2: '#8a6541', sand: '#e4d19c', gravel: '#b4ada2', water: '#4f9fd1',
    bitumen: '#4a4c52', bit2: '#64676e', grass: '#7cb24c', stone: '#a79f92', stone2: '#8f877a', plaster: '#ece5d6',
    paint: '#f7f2e6', tile: '#d9c6a1', tile2: '#c7b28a', membrane: '#34465b', rebar: '#9b4f29', rubber: '#34373c',
    pvc: '#e8ebee', chem: '#f5cf4d', wire: '#7d8a96', white: '#f4f5f6', floor: '#d9dcdf', ceiling: '#eef0f2', gi: '#b7c2cc'
  };
  var Lt = norm([0.32, 0.58, 0.75]);

  function norm(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cent(f) { var c = [0, 0, 0]; f.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return [c[0] / f.length, c[1] / f.length, c[2] / f.length]; }
  function newell(f) {
    var n = [0, 0, 0];
    for (var i = 0; i < f.length; i++) {
      var a = f[i], b = f[(i + 1) % f.length];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return norm(n);
  }
  function h2r(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function r2h(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function shade(hex, f) { return r2h(h2r(hex).map(function (v) { return f >= 1 ? v + (255 - v) * (f - 1) : v * f; })); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function f1(v) { return Math.round(v * 10) / 10; }

  function Scene(o) {
    o = o || {};
    this.az = (o.az == null ? 38 : o.az) * Math.PI / 180;
    this.el = (o.el == null ? 26 : o.el) * Math.PI / 180;
    this.ca = Math.cos(this.az); this.sa = Math.sin(this.az); this.ce = Math.cos(this.el); this.se = Math.sin(this.el);
    this.ops = []; this.labels = []; this.pill = {};
  }
  var SP = Scene.prototype;
  SP.rot = function (p) {
    var x1 = p[0] * this.ca - p[1] * this.sa, y1 = p[0] * this.sa + p[1] * this.ca;
    return [x1, y1 * this.se - p[2] * this.ce, y1 * this.ce + p[2] * this.se];
  };
  SP.facing = function (n) { return (n[0] * this.sa + n[1] * this.ca) * this.ce + n[2] * this.se; };
  SP.face = function (pts, n, o, sm) {
    var d = Math.max(0, dot(n, Lt));
    this.ops.push({ t: 'f', pts: pts, b: 0.6 + 0.48 * d, o: o, sm: sm });
  };
  // Convex (or nearly convex) solid from faces; normals are turned outward from the solid's centre.
  SP.solid = function (faces, o) {
    o = o || {};
    var c = [0, 0, 0], k = 0, self = this;
    faces.forEach(function (f) { f.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; k++; }); });
    c = [c[0] / k, c[1] / k, c[2] / k];
    var keep = [];
    faces.forEach(function (f) {
      var n = newell(f), fc = cent(f);
      if (dot(n, sub(fc, c)) < 0) n = [-n[0], -n[1], -n[2]];
      if (self.facing(n) > 1e-6 || o.both) keep.push({ f: f, n: n, d: self.rot(fc)[2], sm: f.sm });
    });
    keep.sort(function (a, b) { return a.d - b.d; });
    if (this._grp) { var mark = this.ops.length; keep.forEach(function (x) { self.face(x.f, x.n, o, x.sm); }); this._grp.push({ d: this.rot(c)[2], ops: this.ops.splice(mark) }); return this; }
    keep.forEach(function (x) { self.face(x.f, x.n, o, x.sm); });
    return this;
  };
  // Draw everything created inside fn sorted far-to-near by each solid's centre (for many small parts).
  SP.group = function (fn) {
    this._grp = []; fn(); var g = this._grp; this._grp = null;
    g.sort(function (a, b) { return a.d - b.d; });
    var self = this; g.forEach(function (x) { Array.prototype.push.apply(self.ops, x.ops); });
    return this;
  };
  SP.box = function (x, y, z, dx, dy, dz, o) {
    var X = x + dx, Y = y + dy, Z = z + dz;
    return this.solid([
      [[x, y, z], [X, y, z], [X, Y, z], [x, Y, z]], [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]],
      [[x, y, z], [X, y, z], [X, y, Z], [x, y, Z]], [[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]],
      [[x, y, z], [x, Y, z], [x, Y, Z], [x, y, Z]], [[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]]], o);
  };
  // 8 corners: bottom ring b0..b3 then top ring t0..t3 (same winding).
  SP.hexa = function (c, o) {
    var f = [[c[0], c[1], c[2], c[3]], [c[4], c[5], c[6], c[7]]];
    for (var i = 0; i < 4; i++) { var j = (i + 1) % 4; f.push([c[i], c[j], c[j + 4], c[i + 4]]); }
    return this.solid(f, o);
  };
  // Box in a local frame given by a mapping function T(u, v, w) -> [x, y, z].
  SP.lbox = function (T, u, v, w, du, dv, dw, o) {
    var U = u + du, V = v + dv, Wd = w + dw;
    return this.hexa([T(u, v, w), T(U, v, w), T(U, V, w), T(u, V, w), T(u, v, Wd), T(U, v, Wd), T(U, V, Wd), T(u, V, Wd)], o);
  };
  function mk(axis, u, v, a) { return axis === 'x' ? [a, u, v] : axis === 'y' ? [u, a, v] : [u, v, a]; }
  // Extrude a 2D profile along an axis ('x': profile in (y,z); 'y': in (x,z); 'z': in (x,y)).
  SP.prism = function (axis, prof, a0, a1, o, smooth) {
    var A = prof.map(function (p) { return mk(axis, p[0], p[1], a0); });
    var B = prof.map(function (p) { return mk(axis, p[0], p[1], a1); });
    var faces = [A, B];
    for (var i = 0; i < prof.length; i++) { var j = (i + 1) % prof.length, s = [A[i], A[j], B[j], B[i]]; if (smooth) s.sm = true; faces.push(s); }
    return this.solid(faces, o);
  };
  function circle(u0, v0, r, n) { var p = []; for (var i = 0; i < n; i++) { var t = i / n * 2 * Math.PI; p.push([u0 + r * Math.cos(t), v0 + r * Math.sin(t)]); } return p; }
  function cAxis(axis, c) { return axis === 'x' ? [c[0], c[1], c[2]] : axis === 'y' ? [c[1], c[0], c[2]] : [c[2], c[0], c[1]]; }
  // Cylinder whose start-cap centre is c, running +len along axis.
  SP.cyl = function (axis, c, r, len, o, n) {
    var a = cAxis(axis, c);
    return this.prism(axis, circle(a[1], a[2], r, n || 30), a[0], a[0] + len, o, true);
  };
  // Hollow pipe: outer cylinder plus a dark bore on whichever end faces the viewer.
  SP.pipe = function (axis, c, r, len, o, t) {
    this.cyl(axis, c, r, len, o);
    var a = cAxis(axis, c), self = this;
    [a[0], a[0] + len].forEach(function (end, k) {
      var n = mk(axis, 0, 0, k ? 1 : -1);
      if (self.facing(n) > 0) {
        var ring = circle(a[1], a[2], r - (t || r * 0.16), 30).map(function (p) { return mk(axis, p[0], p[1], end + (k ? 0.05 : -0.05)); });
        self.face(ring, n, Object.assign({}, o, { c: '#2b2f35', op: 1 }));
      }
    });
    return this;
  };
  // Flat polygon, always drawn, shaded as if facing the viewer.
  SP.plane = function (pts, o) {
    var n = newell(pts);
    if (this.facing(n) < 0) n = [-n[0], -n[1], -n[2]];
    this.face(pts, n, o || {});
    return this;
  };
  SP.line = function (pts, o) { this.ops.push({ t: 'l', pts: pts, o: o || {} }); return this; };
  SP.lab = function (k, p, dx, dy, s, t) { this.labels.push({ k: k, p: p, dx: dx, dy: dy, s: s, t: t || '' }); return this; };

  SP.render = function (focus) {
    var self = this, all = [];
    var ops = this.ops.map(function (op) {
      var q = op.pts.map(function (p) { var r = self.rot(p); all.push(r); return r; });
      return { op: op, q: q };
    });
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    all.forEach(function (r) { if (r[0] < x0) x0 = r[0]; if (r[0] > x1) x1 = r[0]; if (r[1] < y0) y0 = r[1]; if (r[1] > y1) y1 = r[1]; });
    var s = Math.min((W - 2 * PAD) / (x1 - x0 || 1), (H - 2 * PAD) / (y1 - y0 || 1));
    var ox = (W - (x1 - x0) * s) / 2 - x0 * s, oy = (H - (y1 - y0) * s) / 2 - y0 * s;
    function X(r) { return f1(ox + r[0] * s); }
    function Y(r) { return f1(oy + r[1] * s); }
    var lhot = function (k) { return k && focus.indexOf(k) >= 0; };
    var ex = focus.slice(); focus.forEach(function (f) { (self.groups && self.groups[f] || []).forEach(function (g) { ex.push(g); }); });
    var hot = function (k) { return k && ex.indexOf(k) >= 0; };
    var out = [];
    ops.forEach(function (e) {
      var o = e.op.o, base = hot(o.k) ? (o.hc || ACC) : (o.c || '#bbbbbb');
      var d = 'M' + e.q.map(function (r) { return X(r) + ' ' + Y(r); }).join('L');
      if (e.op.t === 'l') {
        out.push('<path d="' + d + '" fill="none" stroke="' + (hot(o.k) ? ACC : (o.c || '#333')) + '" stroke-width="' + (o.w || 1.4) +
          '" stroke-linecap="round" stroke-linejoin="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + '/>');
        return;
      }
      var fill = shade(base, e.op.b);
      var st = e.op.sm ? fill : (o.ns ? 'none' : shade(fill, 0.68));
      out.push('<path d="' + d + 'Z" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (e.op.sm ? 0.5 : (hot(o.k) ? 0.9 : 0.6)) +
        '" stroke-linejoin="round"' + (o.op ? ' fill-opacity="' + o.op + '"' + (o.op < 1 ? ' stroke-opacity="' + Math.min(1, o.op + 0.25) + '"' : '') : '') + '/>');
    });
    // markers
    var mk = [], pills = [], legend = [], n = 0;
    var labs = this.labels.map(function (l, i) { l.i = i; return l; }).sort(function (a, b) { return ((lhot(a.k) ? 1 : 0) - (lhot(b.k) ? 1 : 0)) || (a.i - b.i); });
    var num = {};
    this.labels.forEach(function (l) { n++; num[l.s + '|' + l.k] = n; legend.push({ n: n, s: l.s, t: l.t, hot: lhot(l.k) }); });
    var pilled = {}, spots = [];
    labs.forEach(function (l) {
      var r = self.rot(l.p), ax = ox + r[0] * s, ay = oy + r[1] * s;
      l.ax = ax; l.ay = ay; l.mx = Math.max(11, Math.min(W - 11, ax + l.dx)); l.my = Math.max(11, Math.min(H - 11, ay + l.dy));
      spots.push([l.mx, l.my]);
    });
    function clear(x, y, w, h) {
      if (x < 2 || y < 2 || x + w > W - 2 || y + h > H - 2) return false;
      return spots.every(function (p) { return p[0] < x - 11 || p[0] > x + w + 11 || p[1] < y - 11 || p[1] > y + h + 11; });
    }
    labs.forEach(function (l) {
      var ax = l.ax, ay = l.ay, mx = l.mx, my = l.my;
      var h = lhot(l.k), no = num[l.s + '|' + l.k];
      mk.push('<line x1="' + f1(ax) + '" y1="' + f1(ay) + '" x2="' + f1(mx) + '" y2="' + f1(my) + '" stroke="' + (h ? '#c2410c' : '#1f2933') + '" stroke-width="' + (h ? 1.4 : 0.9) + '"/>' +
        '<circle cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="' + (h ? 2.6 : 1.9) + '" fill="' + (h ? '#c2410c' : '#1f2933') + '"/>' +
        '<circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="' + (h ? 10 : 8.5) + '" fill="' + (h ? ACC : '#ffffff') + '" stroke="' + (h ? '#9a3412' : '#1f2933') + '" stroke-width="1.1"/>' +
        '<text x="' + f1(mx) + '" y="' + f1(my + 3.6) + '" text-anchor="middle" font-size="' + (h ? 11 : 10) + '" font-weight="700" fill="' + (h ? '#fff' : '#1f2933') + '">' + no + '</text>');
      if (h && !pilled[l.k] && (pilled[l.k] = 1)) {
        var txt = (self.pill[l.k] || l.s) + ' — this item', tw = txt.length * 6.9 + 16, th = 20;
        var others = spots.filter(function (p) { return p[0] !== mx || p[1] !== my; });
        var keep = spots; spots = others;
        var cands = [[mx + 13, my - 10], [mx - 13 - tw, my - 10], [mx - tw / 2, my - 34], [mx - tw / 2, my + 14], [mx + 13, my - 30], [mx - 13 - tw, my - 30], [mx + 13, my + 10], [mx - 13 - tw, my + 10]];
        if (mx > W / 2) cands = [cands[1], cands[0]].concat(cands.slice(2));
        var pick = null;
        for (var ci = 0; ci < cands.length && !pick; ci++) if (clear(cands[ci][0], cands[ci][1], tw, th)) pick = cands[ci];
        spots = keep;
        if (!pick) pick = [Math.max(2, Math.min(W - 2 - tw, mx - tw / 2)), my + 14 > H - 24 ? my - 34 : my + 14];
        pills.push('<rect x="' + f1(pick[0]) + '" y="' + f1(pick[1]) + '" width="' + f1(tw) + '" height="' + th + '" rx="10" fill="#c2410c"/>' +
          '<text x="' + f1(pick[0] + tw / 2) + '" y="' + f1(pick[1] + 14) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">' + esc(txt) + '</text>');
      }
    });
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dg3" role="img" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">' +
      '<g>' + out.join('') + '</g><g>' + mk.join('') + pills.join('') + '</g></svg>';
    return { svg: svg, legend: legend };
  };

  // ---------- registry ----------
  var DEFS = {};
  function def(id, title, parts, dflt, build) { DEFS[id] = { title: title, parts: parts, dflt: dflt, build: build }; }

  // Which part does this item text refer to? Parts are tried in priority order on the main clause of
  // the description first (text before "including / with / complete"), then on the whole text.
  function pickFocus(d, text) {
    if (!text) return [d.dflt];
    var full = String(text), main = full.split(/\b(?:including|incl\.|with|complete)\b/i)[0];
    var keys = Object.keys(d.parts);
    for (var pass = 0; pass < 2; pass++) {
      var t = pass ? full : main;
      for (var i = 0; i < keys.length; i++) if (d.parts[keys[i]].test(t)) return [keys[i]];
    }
    return [d.dflt];
  }

  var cache = {};
  function render(id, text) {
    var d = DEFS[id]; if (!d) return null;
    var focus = pickFocus(d, text), key = id + '|' + focus.join(',');
    if (!cache[key]) {
      var S = d.build();
      var r = S.render(focus);
      r.title = d.title; r.focus = focus;
      cache[key] = r;
    }
    return cache[key];
  }

  window.DiagramKit = { Scene: Scene, M: M, def: def, render: render, ids: function () { return Object.keys(DEFS); }, defs: DEFS, pickFocus: pickFocus };
})();
