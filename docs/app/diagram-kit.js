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
  function mix(a, b, t) { var x = h2r(a), y = h2r(b); return r2h([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
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
  // Shift everything drawn inside fn by (dx, dy, dz) — used to lay out groups of objects.
  SP.at = function (dx, dy, dz, fn) {
    var prev = this._off; this._off = prev ? [prev[0] + dx, prev[1] + dy, prev[2] + dz] : [dx, dy, dz];
    try { fn(); } finally { this._off = prev; }
    return this;
  };
  SP._mv = function (pts) {
    var d = this._off; if (!d) return pts;
    var r = pts.map(function (p) { return [p[0] + d[0], p[1] + d[1], p[2] + d[2]]; }); if (pts.sm) r.sm = true; return r;
  };
  SP.solid = function (faces, o) {
    o = o || {};
    if (this._off) { var me = this; faces = faces.map(function (f) { return me._mv(f); }); }
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
        ring = self._mv(ring);
        if (self._grp) { var mark = self.ops.length; self.face(ring, n, Object.assign({}, o, { c: '#2b2f35', op: 1 })); self._grp.push({ d: self.rot(cent(ring))[2] + 0.01, ops: self.ops.splice(mark) }); }
        else self.face(ring, n, Object.assign({}, o, { c: '#2b2f35', op: 1 }));
      }
    });
    return this;
  };
  // Flat polygon, always drawn, shaded as if facing the viewer.
  SP.plane = function (pts, o) {
    pts = this._mv(pts);
    var n = newell(pts);
    if (this.facing(n) < 0) n = [-n[0], -n[1], -n[2]];
    this.face(pts, n, o || {});
    return this;
  };
  SP.line = function (pts, o) { this.ops.push({ t: 'l', pts: this._mv(pts), o: o || {} }); return this; };
  SP.lab = function (k, p, dx, dy, s, t) { this.labels.push({ k: k, p: this._mv([p])[0], dx: dx, dy: dy, s: s, t: t || '' }); return this; };

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
      var o = e.op.o, base = hot(o.k) ? (o.hc || mix(o.c || '#bbbbbb', ACC, 0.82)) : (o.c || '#bbbbbb');
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
    // Highlighted part: x-ray overlay so a part hidden inside others (dowels in a slab, a well plug) still
    // shows its outline, and a ring around parts too small to spot at phone size.
    var hb = [1e9, 1e9, -1e9, -1e9], xray = [];
    var P = ops.map(function (e) {
      var pts = e.q.map(function (r) { return [ox + r[0] * s, oy + r[1] * s]; }), bb = [1e9, 1e9, -1e9, -1e9];
      pts.forEach(function (p) { if (p[0] < bb[0]) bb[0] = p[0]; if (p[1] < bb[1]) bb[1] = p[1]; if (p[0] > bb[2]) bb[2] = p[0]; if (p[1] > bb[3]) bb[3] = p[1]; });
      return { pts: pts, bb: bb };
    });
    function inPoly(x, y, pts) {
      var c = false;
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[i], b = pts[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
      }
      return c;
    }
    // 0 = in view, 1 = seen only through see-through faces, 2 = behind something solid
    function covered(i, x, y) {
      var r = 0;
      for (var j = i + 1; j < ops.length; j++) {
        var e = ops[j], o = e.op.o, bb = P[j].bb;
        if (e.op.t !== 'f' || hot(o.k)) continue;
        if (x < bb[0] || x > bb[2] || y < bb[1] || y > bb[3]) continue;
        if (inPoly(x, y, P[j].pts)) { if (o.op != null && o.op < 0.85) r = 1; else return 2; }
      }
      return r;
    }
    var hidN = 0, allN = 0, hidFaces = [], dimFaces = [];
    ops.forEach(function (e, i) {
      var o = e.op.o; if (!hot(o.k)) return;
      var pts = P[i].pts, bb = P[i].bb;
      if (bb[0] < hb[0]) hb[0] = bb[0]; if (bb[1] < hb[1]) hb[1] = bb[1]; if (bb[2] > hb[2]) hb[2] = bb[2]; if (bb[3] > hb[3]) hb[3] = bb[3];
      var c = [0, 0]; pts.forEach(function (p) { c[0] += p[0] / pts.length; c[1] += p[1] / pts.length; });
      var smp = [c].concat(pts.slice(0, 6).map(function (p) { return [c[0] * 0.45 + p[0] * 0.55, c[1] * 0.45 + p[1] * 0.55]; }));
      var h = 0, d = 0; smp.forEach(function (p) { var v = covered(i, p[0], p[1]); if (v === 2) h++; else if (v === 1) d++; });
      var ar = 0; for (var a = 0; a < pts.length; a++) { var b2 = pts[(a + 1) % pts.length]; ar += pts[a][0] * b2[1] - b2[0] * pts[a][1]; }
      ar = Math.abs(ar) / 2 + 1;
      hidN += ar * h / smp.length; allN += ar;
      if (h * 2 > smp.length) hidFaces.push(i); else if ((h + d) * 2 > smp.length) dimFaces.push(i);
    });
    // seen through glass / a see-through slab: redraw on top so it keeps its full colour
    dimFaces.forEach(function (i) {
      var e = ops[i], o = e.op.o, d = 'M' + e.q.map(function (r) { return X(r) + ' ' + Y(r); }).join('L');
      if (e.op.t === 'l') { xray.push('<path d="' + d + '" fill="none" stroke="' + ACC + '" stroke-width="' + (o.w || 1.4) + '"/>'); return; }
      var fill = shade(o.hc || mix(o.c || '#bbbbbb', ACC, 0.82), e.op.b);
      xray.push('<path d="' + d + 'Z" fill="' + fill + '" stroke="' + (e.op.sm ? fill : shade(fill, 0.68)) + '" stroke-width="0.6" fill-opacity="' + (o.op || 1) + '"/>');
    });
    // only when a good share of the part is out of sight; visible parts are already orange
    if (allN && hidN / allN > 0.45) hidFaces.forEach(function (i) {
      var e = ops[i], o = e.op.o, d = 'M' + e.q.map(function (r) { return X(r) + ' ' + Y(r); }).join('L');
      if (e.op.t === 'l') xray.push('<path d="' + d + '" fill="none" stroke="' + ACC + '" stroke-width="' + (o.w || 1.4) + '" stroke-dasharray="3 2" opacity="0.85"/>');
      else if (e.op.sm) xray.push('<path d="' + d + 'Z" fill="' + ACC + '" fill-opacity="0.12" stroke="none"/>');
      else xray.push('<path d="' + d + 'Z" fill="' + ACC + '" fill-opacity="0.12" stroke="#c2410c" stroke-width="0.9" stroke-dasharray="3 2" stroke-opacity="0.85"/>');
    });
    // small parts (hinges, a valve, a dowel): ring each cluster so it can be found at phone size
    var hotArea = 0, cl = [];
    ops.forEach(function (e, i) {
      if (!hot(e.op.o.k)) return;
      var p = P[i].pts, ar = 0;
      for (var a = 0; a < p.length; a++) { var b = p[(a + 1) % p.length]; ar += p[a][0] * b[1] - b[0] * p[a][1]; }
      hotArea += Math.abs(ar) / 2;
      var bb = P[i].bb, c = null;
      for (var q = 0; q < cl.length && !c; q++) { var k2 = cl[q]; if (bb[0] < k2[2] + 14 && bb[2] > k2[0] - 14 && bb[1] < k2[3] + 14 && bb[3] > k2[1] - 14) c = k2; }
      if (c) { c[0] = Math.min(c[0], bb[0]); c[1] = Math.min(c[1], bb[1]); c[2] = Math.max(c[2], bb[2]); c[3] = Math.max(c[3], bb[3]); }
      else cl.push(bb.slice());
    });
    if (hotArea < 450 && cl.length <= 8) cl.forEach(function (c) {
      var r = Math.max(c[2] - c[0], c[3] - c[1]) / 2 + 8;
      if (r > 40) return;
      xray.push('<circle cx="' + f1((c[0] + c[2]) / 2) + '" cy="' + f1((c[1] + c[3]) / 2) + '" r="' + f1(r) + '" fill="none" stroke="#fff" stroke-width="3.2" stroke-opacity="0.8"/>' +
        '<circle cx="' + f1((c[0] + c[2]) / 2) + '" cy="' + f1((c[1] + c[3]) / 2) + '" r="' + f1(r) + '" fill="none" stroke="#c2410c" stroke-width="1.7" stroke-dasharray="4 3"/>');
    });
    // markers: numbered circles with leader lines, placed so they never overlap each other or leave the frame
    var mk = [], pills = [], legend = [], n = 0, R = 9.5, RH = 11;
    var num = {};
    this.labels.forEach(function (l) { n++; num[l.s + '|' + l.k] = n; legend.push({ n: n, s: l.s, t: l.t, hot: lhot(l.k) }); });
    var labs = this.labels.map(function (l, i) {
      var r = self.rot(l.p);
      return { l: l, i: i, h: lhot(l.k), ax: ox + r[0] * s, ay: oy + r[1] * s, no: num[l.s + '|' + l.k] };
    });
    var placed = [];
    function segDist(px, py, a, b, c, d) {
      var vx = c - a, vy = d - b, L = vx * vx + vy * vy, t = L ? Math.max(0, Math.min(1, ((px - a) * vx + (py - b) * vy) / L)) : 0;
      return Math.hypot(px - a - t * vx, py - b - t * vy);
    }
    function cost(m, x, y, r) {
      var c = 0;
      if (x < r + 2 || x > W - r - 2 || y < r + 2 || y > H - r - 2) c += 1000;
      placed.forEach(function (p) {
        var d = Math.hypot(p.mx - x, p.my - y); if (d < p.r + r + 3) c += 500 + (p.r + r + 3 - d) * 20;
        if (segDist(x, y, p.ax, p.ay, p.mx, p.my) < r + 1) c += 60;
        if (segDist(p.mx, p.my, m.ax, m.ay, x, y) < p.r + 1) c += 60;
      });
      labs.forEach(function (o) { if (o !== m && Math.hypot(o.ax - x, o.ay - y) < r + 3) c += 40; });
      return c;
    }
    labs.slice().sort(function (a, b) { return (b.h - a.h) || (a.i - b.i); }).forEach(function (m) {
      var r = m.h ? RH : R, dx = m.l.dx, dy = m.l.dy, len = Math.max(18, Math.hypot(dx, dy)), ang = Math.atan2(dy, dx);
      var best = null;
      [1, 1.25, 0.8, 1.55, 1.9, 0.6, 2.3].some(function (lf) {
        return [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.5, -1.5, 2.1, -2.1, Math.PI].some(function (da) {
          var x = m.ax + Math.cos(ang + da) * len * lf, y = m.ay + Math.sin(ang + da) * len * lf;
          var c = cost(m, x, y, r) + Math.abs(da) * 4 + Math.abs(lf - 1) * 6;
          if (!best || c < best.c) best = { x: x, y: y, c: c };
          return c < 30;
        });
      });
      m.mx = Math.max(r + 2, Math.min(W - r - 2, best.x)); m.my = Math.max(r + 2, Math.min(H - r - 2, best.y)); m.r = r;
      placed.push(m);
    });
    function boxFree(x, y, w, h) {
      if (x < 2 || y < 2 || x + w > W - 2 || y + h > H - 2) return 1e4;
      var c = 0;
      placed.forEach(function (p) {
        var nx = Math.max(x, Math.min(p.mx, x + w)), ny = Math.max(y, Math.min(p.my, y + h));
        if (Math.hypot(nx - p.mx, ny - p.my) < p.r + 2) c += 100;
        if (p.ax > x - 2 && p.ax < x + w + 2 && p.ay > y - 2 && p.ay < y + h + 2) c += 20;
      });
      // keep the highlighted part itself uncovered
      if (hb[2] > hb[0]) {
        var ix = Math.max(0, Math.min(x + w, hb[2]) - Math.max(x, hb[0])), iy = Math.max(0, Math.min(y + h, hb[3]) - Math.max(y, hb[1]));
        var ha = Math.max(1, (hb[2] - hb[0]) * (hb[3] - hb[1]));
        c += 70 * Math.min(1, ix * iy / Math.min(ha, w * h));
      }
      return c;
    }
    var pilled = {}, ext = 0;
    placed.forEach(function (m) {
      var h = m.h, ax = m.ax, ay = m.ay, mx = m.mx, my = m.my;
      mk.push('<line x1="' + f1(ax) + '" y1="' + f1(ay) + '" x2="' + f1(mx) + '" y2="' + f1(my) + '" stroke="#fff" stroke-width="' + (h ? 3.4 : 2.6) + '" stroke-opacity="0.75"/>' +
        '<line x1="' + f1(ax) + '" y1="' + f1(ay) + '" x2="' + f1(mx) + '" y2="' + f1(my) + '" stroke="' + (h ? '#c2410c' : '#1f2933') + '" stroke-width="' + (h ? 1.5 : 1) + '"/>' +
        '<circle cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="' + (h ? 2.8 : 2.1) + '" fill="' + (h ? '#c2410c' : '#1f2933') + '" stroke="#fff" stroke-width="0.8"/>' +
        '<circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="' + m.r + '" fill="' + (h ? ACC : '#ffffff') + '" stroke="' + (h ? '#9a3412' : '#1f2933') + '" stroke-width="1.2"/>' +
        '<text x="' + f1(mx) + '" y="' + f1(my + 4) + '" text-anchor="middle" font-size="' + (h ? 12 : 11) + '" font-weight="700" fill="' + (h ? '#fff' : '#1f2933') + '">' + m.no + '</text>');
      if (h && !pilled[m.l.k] && (pilled[m.l.k] = 1)) {
        var txt = (self.pill[m.l.k] || m.l.s) + ' — this item', tw = txt.length * 7.6 + 20, th = 22;
        var cands = [[mx + 15, my - 11], [mx - 15 - tw, my - 11], [mx - tw / 2, my - 37], [mx - tw / 2, my + 15], [mx + 15, my - 33], [mx - 15 - tw, my - 33], [mx + 15, my + 11], [mx - 15 - tw, my + 11]];
        if (mx > W / 2) cands = [cands[1], cands[0]].concat(cands.slice(2));
        var pick = null, pc = 1e9;
        cands.forEach(function (c) { var v = boxFree(c[0], c[1], tw, th); if (v < pc) { pc = v; pick = c; } });
        if (pc > 0) {
          // no clear spot beside the marker: use a strip along the top or bottom edge
          [[(W - tw) / 2, 3], [(W - tw) / 2, H - th - 3], [3, 3], [W - tw - 3, 3], [3, H - th - 3], [W - tw - 3, H - th - 3]].forEach(function (c) {
            var v = boxFree(c[0], c[1], tw, th) + 1; if (v < pc) { pc = v; pick = c; }
          });
        }
        if (pc > 16) {
          // still covers something: give the label its own strip above the drawing
          ext += th + 6; pick = [(W - tw) / 2, 3 - ext];
        } else pick = [Math.max(2, Math.min(W - 2 - tw, pick[0])), Math.max(2, Math.min(H - 2 - th, pick[1]))];
        pills.push('<rect x="' + f1(pick[0]) + '" y="' + f1(pick[1]) + '" width="' + f1(tw) + '" height="' + th + '" rx="11" fill="#c2410c" stroke="#fff" stroke-width="1.2"/>' +
          '<text x="' + f1(pick[0] + tw / 2) + '" y="' + f1(pick[1] + 15.5) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff">' + esc(txt) + '</text>');
      }
    });
    var svg = '<svg viewBox="0 ' + (-ext) + ' ' + W + ' ' + (H + ext) + '" class="dg3" role="img" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">' +
      '<g>' + out.join('') + '</g><g>' + xray.join('') + '</g><g>' + mk.join('') + pills.join('') + '</g></svg>';
    return { svg: svg, legend: legend };
  };

  // ---------- registry ----------
  var DEFS = {};
  function def(id, title, parts, dflt, build) { DEFS[id] = { title: title, parts: parts, dflt: dflt, build: build }; }

  // Which part does this item text refer to? Item texts read "heading : specific type : size", so the most
  // specific segment is tried first (last to first), then the heading's main clause (before "including / with /
  // complete"), then the whole text. Verbs like "fitting and fixing" are removed so they don't look like parts.
  function clean(t) { return String(t).replace(/\b(to|in|into|on) (the )?existing (door |window )?(frames?|chowkh?ats?)\b/gi, ' ').replace(/\b((top|bottom|underside|soffit) of|below|under) (the )?[\w /]{0,14}?pile caps?\b/gi, ' ').replace(/\b(socket|spigot)\s*(&|and)\s*(spigot|socket)\b|\bS\s?&\s?S\b/gi, ' ').replace(/\b(supplying|providing)?[, ]*\bfitting\s*(,|and|&)\s*fixing\b/gi, ' ').replace(/(^\W*|\b(?:supplying|supply|providing|labour for)[, ]*(?:and |& )?)fitting\s+(of|the)\b/gi, ' '); }
  // split on ':' separators that are not inside brackets (mix ratios like 1 cement : 3 sand stay whole)
  function splitTop(t) {
    var out = [], cur = '', dep = 0;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (ch === '(' || ch === '[') dep++; else if ((ch === ')' || ch === ']') && dep) dep--;
      if (ch === ':' && !dep && (t[i + 1] === ' ' || t[i - 1] === ' ') && !/\d/.test(t[i - 1] || '') &&
          !/\b(IS|IRC|BS|ASTM|EN|ISO|No|Nos|Code|clause|MORT&H|MoRTH|IS\s?No)\.?\s*$/i.test(cur) && !(/\d\s*$/.test(cur) && /^\s*\d/.test(t.slice(i + 1))) &&
          !(/\d+(\.\d+)?\s+[a-z][a-z \-\/()]*\s*$/i.test(cur) && /^\s*\d+(\.\d+)?\s*[a-z]/i.test(t.slice(i + 1)))) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(function (x) { return x.trim(); }).filter(function (x) { return x; });
  }
  // "Up to 300 mm dia", "15 mm nominal bore", "Height 5m to 10m" … only say how big, not which part
  var SIZEW = /\b(gis|cts|mm|cm|m|mtrs?|metres?|meters?|dia|diameter|nominal|bore|size|sizes|up|upto|to|over|above|below|exceeding|not|and|from|in|of|the|length|height|depth|thick|thickness|width|wide|long|kg|kgs|gms?|sq|sqm|cum|litres?|ltrs?|lit|nos?|each|per|grade|class|case|beyond|within|lead|lift|km|any|for|or|outside|inside|internal|external|dia\.|a|b|c|i|ii|iii|iv|v|vi|x|working|pressure|heavy|medium|light|duty|type|series|mpa|gauge|swg|psi|etc|but|greater|than|less|minimum|maximum|approx|outer|inner)\b/gi;
  function isSize(t) { return String(t).replace(/\([^)]*\)/g, ' ').replace(/\b(pipes?|cables?|projection|thick|depth)\b/gi, ' ').replace(/\d+(\.\d+)?\s*[x×]\s*(?=\d)/gi, ' ').replace(/[\d.,/()\-+×%"'’*#°]+/g, ' ').replace(SIZEW, ' ').replace(/[^a-z]/gi, '').length < 3; }
  function pickFocus(d, text) {
    if (!text) return [d.dflt];
    var full = clean(text), segs = splitTop(full.split(/\s[—–]\s/)[0]), keys = Object.keys(d.parts);
    var cut = function (t) { return t.split(/\s[—–]\s|\b(?:including|incl\.|excluding|excl\.|except|excepting|with|complete|conforming|as per|consisting of)\b/i)[0]; };
    var find = function (t) { for (var k = 0; k < keys.length; k++) if (d.parts[keys[k]].test(t)) return keys[k].split('#')[0]; return null; };
    // 1) the specific segments, last first (skipping ones that only give a size)
    var mA = null, weak = false, aw = 0;
    for (var i = segs.length - 1; i >= 1 && !mA; i--) { var c = cut(segs[i]); if (!isSize(c)) { mA = find(c); aw = c.trim().split(/\s+/).length; weak = /^\s*(on|over|for|in|at|to|from|upto|up to|below|above|beyond|under|with|without|using|by)\b/i.test(c); } }
    // 2) the heading: its first clause, then its main clause; 3) then all of the heading and the whole text
    var h = cut(segs[0]), h1 = h.split(/,\s/)[0], mH = null, mR = null;
    [h1.split(/\s+/).length >= 5 ? h1 : null, h].some(function (t) { return t && (mH = find(t)); });
    var dash = full.split(/\s[—–]\s/)[1];
    [segs[0], dash ? cut(dash) : null, full].some(function (t) { return t && (mR = find(t)); });
    // a segment naming only the general part, or only a qualifier ("On steel surface", "For T-beam"),
    // does not beat a heading that names a specific part
    var mH1 = h1.split(/\s+/).length >= 2 ? find(h1) : null;
    if (mA && (d.segFirst || !((mA === d.dflt || weak) && mH1 && mH1 !== d.dflt))) return [mA];
    return [mH || mA || mR || d.dflt];
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
