// The drawings themselves. Each one is a small 3D scene; parts carry a key (k) so the part that
// matches the item being viewed is drawn in orange and labelled "this item".
// Schematic illustrations - proportions are typical, not to scale.
(function () {
  'use strict';
  var K = window.DiagramKit, M = K.M, def = K.def;
  function S(o) { return new K.Scene(o); }

  // ======================= DOORS & WINDOWS =======================
  // Wall with a door opening and a wooden frame; returns the local frame of a shutter hinged on the
  // left jamb and opened outward by `ang` degrees: T(u across, v out of face, w up).
  function doorBase(s, o) {
    o = o || {};
    s.box(5, -10, -3, 190, 90, 3, { c: M.floor });
    s.box(18, 0, 0, 32, 23, 235, { c: M.plaster });                    // left pier
    s.box(42, 13, 0, 8, 10, 210, { c: M.wood2, k: 'frame' });          // left jamb
    var a = (o.ang == null ? 30 : o.ang) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    return function (u, v, w) { return [50 + u * c - v * sn, 23 + u * sn + v * c, w]; };
  }
  function doorTop(s) {
    s.box(42, 13, 202, 116, 10, 8, { c: M.wood2, k: 'frame' });       // head
    s.box(150, 13, 0, 8, 10, 210, { c: M.wood2, k: 'frame' });         // right jamb
    s.box(50, 0, 210, 100, 23, 25, { c: M.plaster });                  // wall over opening
    s.box(150, 0, 0, 32, 23, 235, { c: M.plaster });                   // right pier
  }
  function hinges(s, T) { [22, 100, 178].forEach(function (w) { var p = T(0, 0.4, w); s.cyl('z', [p[0], p[1], w], 1.3, 11, { c: M.brass, k: 'hinge' }, 12); }); }

  def('door_panelled', 'Panelled door: frame and shutter', {
    frame: /\bframes?\b|chowkhat/i, shutter: /shutter|door|leaf/i
  }, 'shutter', function () {
    var s = S({ az: 22, el: 16 }), T = doorBase(s); doorTop(s);
    var W = 100, Ht = 202, t = 3.5, sh = { c: M.wood, k: 'shutter' }, pn = { c: M.ply, k: 'shutter', hc: '#fdba74' };
    s.lbox(T, 11, -t + 0.9, 102, W - 22, 1.6, 86, pn);   // upper panel (recessed)
    s.lbox(T, 11, -t + 0.9, 20, W - 22, 1.6, 68, pn);    // lower panel
    s.lbox(T, 0, -t, 0, 11, t, Ht, sh); s.lbox(T, W - 11, -t, 0, 11, t, Ht, sh);
    s.lbox(T, 11, -t, Ht - 14, W - 22, t, 14, sh); s.lbox(T, 11, -t, 88, W - 22, t, 14, sh); s.lbox(T, 11, -t, 0, W - 22, t, 20, sh);
    var hp = T(W - 7, 0, 95); s.box(hp[0] - 1, hp[1], 95, 2, 3.5, 12, { c: M.brass, k: 'fit' });
    hinges(s, T);
    s.lab('frame', [46, 23, 150], -46, -18, 'Door frame (chowkhat)', 'Hardwood / steel frame fixed in the wall opening with holdfasts; paid as a separate item (per cum or per metre)');
    s.lab('shutter', T(70, 0, 150), 70, -40, 'Shutter', 'The door leaf: stiles, rails and panels, thickness as per item');
    s.lab('shutter', T(5, 0, 130), -60, 4, 'Stile', 'Vertical outer member of the shutter');
    s.lab('shutter', T(50, 0, 195), 10, -26, 'Top rail', 'Horizontal member at the top');
    s.lab('shutter', T(50, 0, 95), 52, -10, 'Lock rail', 'Middle rail where the lock / handle is fixed');
    s.lab('shutter', T(50, -2, 140), 70, -30, 'Panel', 'Recessed wooden / board panel fitted in grooves of stiles and rails');
    s.lab('shutter', T(50, 0, 10), 60, 18, 'Bottom rail', 'Widest rail at the bottom');
    s.lab('hinge', T(0, 0, 178), -40, -16, 'Hinges', 'Usually included with the shutter item - check the item text');
    s.lab('fit', hp, 34, 20, 'Handle / lock', 'Fittings - mostly separate items in Sub-head 9');
    return s;
  });

  def('door_flush', 'Flush door: shutter build-up', {
    lipping: /lipping/i, vision: /vision|glass panel|glazing/i, frame: /\bframes?\b|chowkhat/i,
    shutter: /shutter|flush door|door/i, core: /\bcore\b|block ?board|particle/i, veneer: /veneer|lamina|laminate/i
  }, 'shutter', function () {
    var s = S({ az: 22, el: 16 }), T = doorBase(s); doorTop(s);
    s.groups = { shutter: ['core', 'lipping', 'veneer'] };
    var W = 100, Ht = 202, t = 3.5;
    s.lbox(T, 2.5, -t + 0.3, 2.5, W - 5, t - 0.6, Ht - 5, { c: M.core, k: 'core' });
    // core strips visible in the cut-away corner
    for (var u = 60; u < W - 3; u += 7.5) s.line([T(u, -0.25, 140), T(u, -0.25, Ht - 3)], { c: '#b88f4f', w: 0.8, k: 'core' });
    s.lbox(T, 0, -t, 0, 2.5, t, Ht, { c: M.wood2, k: 'lipping' }); s.lbox(T, W - 2.5, -t, 0, 2.5, t, Ht, { c: M.wood2, k: 'lipping' });
    s.lbox(T, 2.5, -t, Ht - 2.5, W - 5, t, 2.5, { c: M.wood2, k: 'lipping' }); s.lbox(T, 2.5, -t, 0, W - 5, t, 2.5, { c: M.wood2, k: 'lipping' });
    // face veneer with the top-right corner cut away to show the core
    var prof = [[2.5, 2.5], [W - 2.5, 2.5], [W - 2.5, 140], [58, 140], [58, Ht - 2.5], [2.5, Ht - 2.5]];
    var q = function (z) { return prof.map(function (p) { return T(p[0], z, p[1]); }); };
    var f = [q(-0.3), q(0.25)];
    for (var i = 0; i < prof.length; i++) { var j = (i + 1) % prof.length; f.push([f[0][i], f[0][j], f[1][j], f[1][i]]); }
    s.solid(f, { c: '#d9a868', k: 'veneer' });
    s.lbox(T, 30, -0.1, 150, 18, 0.5, 36, { c: M.glass, k: 'vision', op: 0.85 });
    var hp = T(W - 8, 0.2, 95); s.box(hp[0] - 1, hp[1], 95, 2, 3.5, 12, { c: M.brass });
    hinges(s, T);
    s.lab('frame', [46, 23, 150], -46, -18, 'Door frame', 'Separate item - wood / steel / aluminium frame');
    s.lab('veneer', T(20, 0.25, 60), -70, 14, 'Face veneer / ply', 'Commercial or decorative (teak) veneer on both faces');
    s.lab('core', T(80, -0.3, 175), 58, -18, 'Core', 'Block board / particle board core (IS 2202)');
    s.lab('lipping', T(W - 1.2, 0, 60), 58, 10, 'Lipping', 'Hardwood edge strip on all four edges');
    s.lab('vision', T(39, 0.2, 168), 34, -58, 'Vision panel', 'Glazed opening - usually an extra item');
    s.lab('shutter', T(50, 0.3, 110), 58, 34, 'Flush shutter', 'Complete shutter, thickness as per item (30 / 35 / 40 mm)');
    s.lab('hinge', T(0, 0, 178), -40, -16, 'Hinges', 'Check whether included in the shutter item');
    return s;
  });

  def('door_fittings', 'Door with its fittings', {
    closer: /closer|floor spring|hydraulic/i, hinge: /hinge/i, tbolt: /tower bolt|barrel/i, aldrop: /aldrop|sliding (door )?bolt|hasp|staple/i,
    lock: /lock|latch/i, handle: /handle|knob|pull/i, stopper: /stopper|door stop|buffer|catch|holder/i, kick: /kick/i, shutter: /shutter/i
  }, 'hinge', function () {
    var s = S({ az: 22, el: 16 }), T = doorBase(s, { ang: 30 }); doorTop(s);
    var W = 100, Ht = 202, t = 3.5;
    s.box(132, 74, 0, 6, 6, 5, { c: M.steel2, k: 'stopper' }); s.cyl('z', [135, 77, 5], 2, 2.5, { c: M.rubber, k: 'stopper' }, 14);
    s.lbox(T, 0, -t, 0, W, t, Ht, { c: M.wood, k: 'shutter' });
    s.lbox(T, 3, 0, 3, W - 6, 0.4, 22, { c: M.steel, k: 'kick' });
    s.lbox(T, 8, 0, 186, 26, 4, 8, { c: M.steel2, k: 'closer' });
    s.line([T(30, 4, 190), T(46, 6, 197), [74, 23, 203]], { c: M.steel2, w: 2.2, k: 'closer' });
    s.lbox(T, 86, 0, 160, 4, 0.8, 28, { c: M.brass, k: 'tbolt' }); s.lbox(T, 87, 0.8, 166, 2, 1.6, 26, { c: M.brass, k: 'tbolt' });
    s.lbox(T, 64, 0, 124, 30, 1.4, 4, { c: M.steel, k: 'aldrop' }); s.lbox(T, 91, 0, 120, 3, 2.2, 12, { c: M.steel, k: 'aldrop' });
    s.lbox(T, 87, 0, 86, 7, 0.6, 22, { c: M.brass, k: 'lock' });
    s.lbox(T, 89, 0.6, 88, 2.4, 3.5, 2.4, { c: M.brass, k: 'handle' }); s.lbox(T, 89, 0.6, 102, 2.4, 3.5, 2.4, { c: M.brass, k: 'handle' }); s.lbox(T, 89, 3.4, 88, 2.4, 1.4, 16.4, { c: M.brass, k: 'handle' });
    hinges(s, T);
    s.lab('hinge', T(0, 0, 178), -46, -14, 'Butt hinges', 'Steel / brass / SS hinges, 3 per shutter typically');
    s.lab('closer', T(20, 4, 194), -30, -40, 'Door closer', 'Hydraulic overhead closer on the shutter, arm to the frame');
    s.lab('tbolt', T(88, 2, 180), 50, -24, 'Tower bolt', 'Barrel bolt at top (and bottom) of the shutter');
    s.lab('aldrop', T(75, 1.4, 126), 60, -14, 'Aldrop / hasp', 'Long horizontal bolt that takes a padlock');
    s.lab('lock', T(90, 0.6, 92), 64, 8, 'Mortice lock', 'Lock set into the shutter edge, with keyhole');
    s.lab('handle', T(90, 4, 96), 60, 26, 'Handle', 'Pull / D handle, fixed with screws');
    s.lab('kick', T(50, 0.4, 12), -60, 20, 'Kick plate', 'Metal plate protecting the bottom of the shutter');
    s.lab('stopper', [135, 77, 7], 50, 20, 'Door stopper', 'Floor stopper / catch that holds the open shutter');
    s.lab('shutter', T(50, 0, 60), -70, -30, 'Shutter', 'The door leaf (paid separately)');
    return s;
  });

  def('window', 'Window: frame, shutters and glazing', {
    grill: /grill|grille|guard bar/i, frame: /\bframes?\b|chowkhat/i, glass: /glass|glazing|\bpanes?\b/i, fitting: /hinge|stay|fastener|bolt|handle/i, shutter: /shutter|sash|casement|window/i
  }, 'shutter', function () {
    var s = S({ az: 36 });
    s.box(-10, 0, 40, 230, 23, 50, { c: M.plaster });                        // wall below sill
    s.box(-12, 14, 90, 234, 16, 4, { c: M.stone, k: 'sill' });               // sill
    s.box(-10, 0, 94, 50, 23, 136, { c: M.plaster });                       // left pier
    s.box(40, 13, 94, 6, 10, 120, { c: M.wood2, k: 'frame' });
    s.box(40, 13, 208, 140, 10, 6, { c: M.wood2, k: 'frame' });
    s.box(40, 13, 94, 140, 10, 5, { c: M.wood2, k: 'frame' });
    s.box(107, 13, 99, 6, 10, 109, { c: M.wood2, k: 'frame' });
    for (var x = 52; x < 176; x += 9) s.box(x, 0.5, 99, 1.4, 1.4, 109, { c: M.steel2, k: 'grill' });
    // left shutter opened outward, right shutter closed
    var a = 32 * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    var T1 = function (u, v, w) { return [46 + u * c - v * sn, 23 + u * sn + v * c, w]; };
    var T2 = function (u, v, w) { return [113 + u, 23 + v, w]; };
    function shutter(T) {
      var sh = { c: M.wood, k: 'shutter' }, wd = 61;
      s.lbox(T, 5, -2.2, 104, wd - 10, 0.6, 99, { c: M.glass, k: 'glass', op: 0.8 });
      s.lbox(T, 0, -3.5, 99, 5, 3.5, 109, sh); s.lbox(T, wd - 5, -3.5, 99, 5, 3.5, 109, sh);
      s.lbox(T, 5, -3.5, 203, wd - 10, 3.5, 5, sh); s.lbox(T, 5, -3.5, 99, wd - 10, 3.5, 5, sh);
      s.lbox(T, 5, -3, 152, wd - 10, 2.5, 2.5, sh); s.lbox(T, 29, -3, 104, 2.5, 2.5, 99, sh);
    }
    shutter(T2);
    s.box(180, 13, 94, 6, 10, 120, { c: M.wood2, k: 'frame' });
    s.box(40, 0, 214, 146, 23, 16, { c: M.plaster });
    s.box(186, 0, 94, 34, 23, 136, { c: M.plaster });
    shutter(T1);
    [120, 185].forEach(function (w) { var p = T1(0, 0.3, w); s.cyl('z', [p[0], p[1], w], 1, 8, { c: M.brass, k: 'fitting' }, 10); });
    s.lab('frame', [183, 23, 180], 50, -20, 'Window frame', 'Wood / steel / aluminium frame (separate item)');
    s.lab('shutter', T1(58, 0, 170), -40, -40, 'Shutter', 'Glazed shutter, opens outward on hinges');
    s.lab('glass', T2(18, -1.8, 125), 12, 40, 'Glass pane', 'Float / sheet glass fixed with beading or putty');
    s.lab('shutter', T2(30, 0, 153), 56, -6, 'Glazing bar', 'Bars dividing the glass into panes');
    s.lab('grill', [150, 1, 112], 72, 24, 'Grill', 'MS grill / guard bars - separate item (per kg)');
    s.lab('fitting', T1(0, 0, 185), -40, -10, 'Hinges & fittings', 'Hinges, stays, fasteners - check item text');
    s.lab('sill', [10, 30, 92], -20, 26, 'Sill', 'Stone / concrete sill below the window');
    return s;
  });

  // ======================= CONCRETE & MASONRY =======================
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var STEEL = /^\W*(steel|reinforcement|thermo|tmt|m\.?s\.? bars?|providing.{0,40}(reinforcement|tmt|bars))/i;

  def('rcc_slab_beam', 'RCC slab and beam (see-through)', {
    steel: STEEL, conc: /concrete|rcc|r\.c\.c|slab|beam|lintel|chajja|floor|roof/i
  }, 'conc', function () {
    var s = S({ az: 34, el: 24 }), st = { c: M.rebar, w: 1.6, k: 'steel' }, st2 = { c: M.rebar, w: 1.1, k: 'steel' };
    s.pill = { conc: 'RCC concrete', steel: 'Steel reinforcement' };
    var x;
    // reinforcement first, then see-through concrete over it
    for (x = 6; x < 196; x += 14) s.line([[x, -50, 3], [x, 80, 3]], st2);            // slab main bars (span across)
    for (var y = -44; y < 80; y += 16) s.line([[2, y, 6], [198, y, 6]], st2);        // distribution bars
    [5, 15, 25].forEach(function (y) { s.line([[-10, y, -40], [198, y, -40]], st); });
    [5, 25].forEach(function (y) { s.line([[-10, y, -6], [198, y, -6]], st); });
    for (x = 8; x < 196; x += 13) s.line([[x, 3, -42], [x, 27, -42], [x, 27, -3], [x, 3, -3], [x, 3, -42]], { c: '#7d3d1e', w: 0.9, k: 'steel' });
    [3, 27].forEach(function (a) { [3, 27].forEach(function (b) { s.line([[-27 + a, b, -130], [-27 + a, b, 12]], st); }); });
    for (var z = -125; z < -45; z += 14) s.line([[-24, 2, z], [-2, 2, z], [-2, 28, z], [-24, 28, z], [-24, 2, z]], { c: '#7d3d1e', w: 0.9, k: 'steel' });
    var cc = { c: M.concrete, k: 'conc', op: 0.42 };
    s.box(-30, 0, -130, 30, 30, 85, cc);
    s.box(-30, 0, -45, 230, 30, 45, cc);
    s.box(-30, -50, 0, 230, 130, 12, { c: M.conc2, k: 'conc', op: 0.38 });
    s.lab('conc', [100, 60, 12], -40, -50, 'Slab', 'RCC slab, thickness as per design');
    s.lab('conc', [130, 30, -25], 40, 30, 'Beam', 'RCC beam below the slab');
    s.lab('conc', [-15, 30, -100], -62, -6, 'Column', 'RCC column supporting the beam');
    s.lab('steel', [62, 70, 3], 60, -30, 'Main bars (slab)', 'Bottom bars along the short span');
    s.lab('steel', [160, 4, 6], 60, -30, 'Distribution bars', 'Bars at right angles to main bars');
    s.lab('steel', [190, 25, -40], 40, 12, 'Beam bottom bars', 'Main tension bars');
    s.lab('steel', [151, 27, -20], 60, -12, 'Stirrups', 'Closed links holding beam bars, resist shear');
    s.lab('steel', [-3, 28, -95], -30, 46, 'Column bars & ties', 'Vertical bars with lateral ties');
    return s;
  });

  def('rcc_column_footing', 'RCC column on isolated footing', {
    steel: STEEL, pcc: /^\W*(providing and laying in position )?(plain )?cement concrete|pcc|p\.c\.c|lean/i, conc: /concrete|rcc|footing|column|foundation/i
  }, 'conc', function () {
    var s = S({ az: 36, el: 22 });
    s.pill = { conc: 'RCC concrete', steel: 'Steel reinforcement', pcc: 'PCC bed' };
    s.box(-62, -62, -10, 124, 124, 10, { c: M.pcc, k: 'pcc' });
    var st = { c: M.rebar, w: 1.5, k: 'steel' };
    for (var t = -44; t <= 44; t += 11) { s.line([[-46, t, 6], [46, t, 6]], st); s.line([[t, -46, 8], [t, 46, 8]], st); }
    [[-11, -11], [11, -11], [11, 11], [-11, 11]].forEach(function (c) { s.line([[c[0] * 2.4, c[1], 7], [c[0], c[1], 7], [c[0], c[1], 175]], st); });
    for (var z = 50; z < 175; z += 15) s.line([[-12, -12, z], [12, -12, z], [12, 12, z], [-12, 12, z], [-12, -12, z]], { c: '#7d3d1e', w: 0.9, k: 'steel' });
    var cc = { c: M.concrete, k: 'conc', op: 0.45 };
    s.box(-50, -50, 0, 100, 100, 22, cc);
    s.hexa([[-50, -50, 22], [50, -50, 22], [50, 50, 22], [-50, 50, 22], [-17, -17, 45], [17, -17, 45], [17, 17, 45], [-17, 17, 45]], cc);
    s.box(-15, -15, 45, 30, 30, 130, cc);
    s.line([[-75, -75, 115], [75, -75, 115], [75, 75, 115], [-75, 75, 115], [-75, -75, 115]], { c: '#6b5a45', w: 1, dash: '5 4' });
    s.lab('conc', [0, 15, 130], 70, -30, 'Column', 'RCC column');
    s.lab('conc', [40, 50, 15], 70, 10, 'Footing', 'RCC footing slab, sloped on top');
    s.lab('pcc', [-40, 62, -5], -50, 26, 'PCC bed', 'Lean concrete levelling course (separate item)');
    s.lab('steel', [-20, 46, 8], -70, -20, 'Bottom mesh', 'Bars both ways at the bottom of the footing');
    s.lab('steel', [11, 11, 120], 80, 10, 'Column bars & ties', 'Vertical bars bent at the bottom, with ties');
    s.lab('none', [75, -10, 115], 30, -40, 'Ground level', 'Excavation and backfilling are separate items');
    return s;
  });

  def('brick_bond', 'Brick masonry in English bond', {
    mortar: /pointing|raking/i, brick: /brick|masonry/i
  }, 'brick', function () {
    var s = S({ az: 30, el: 22 }), L = 19, B = 9, J = 1, X = 104, courses = 7;
    s.box(-4, -1, -6, X + 8, 21, 6, { c: M.pcc, k: 'found' });
    s.box(0.6, 0.6, 0, X - 1.2, L - 1.2, courses * 10 - 0.6, { c: M.mortar, k: 'mortar' });
    s.pill = { brick: 'Brick masonry', mortar: 'Mortar joints / pointing' };
    s.group(function () {
    for (var c = 0; c < courses; c++) {
      var z = c * 10, top = c === courses - 1, xs;
      if (c % 2 === 0) {           // stretcher course: two rows of stretchers
        for (xs = X; xs > 0; xs -= L + J) {
          var x0 = Math.max(0, xs - L);
          if (top) s.box(x0, 0, z, xs - x0, B, 9, { c: M.brick2, k: 'brick' });
          s.box(x0, B + J, z, xs - x0, B, 9, { c: M.brick, k: 'brick' });
        }
      } else {                     // header course: header + queen closer at the quoin, then headers
        s.box(X - B, 0, z, B, L, 9, { c: M.brick2, k: 'brick', hc: '#fdba74' });
        s.box(X - B - J - 4.5, 0, z, 4.5, L, 9, { c: '#d98a5f', k: 'closer', hc: '#fed7aa' });
        for (xs = X - B - J - 4.5 - J; xs > 0; xs -= B + J) {
          var x1 = Math.max(0, xs - B);
          s.box(x1, 0, z, xs - x1, L, 9, { c: M.brick2, k: 'brick', hc: '#fdba74' });
        }
      }
    }
    });
    s.lab('brick', [60, 19, 4.5], -30, 40, 'Stretcher course', 'Bricks laid lengthwise along the wall');
    s.lab('brick', [50, 19, 14.5], -80, -10, 'Header course', 'Bricks laid across the wall; alternates with stretcher course');
    s.lab('closer', [X - B - 3, 19, 34.5], 50, -40, 'Queen closer', 'Half-width brick next to the corner header to break joints');
    s.lab('mortar', [X - 19 - 0.5, 19, 30], 60, 30, 'Mortar joint', '10 mm joints, mix as per item (1:4 / 1:6)');
    s.lab('found', [10, 20, -3], -20, 30, 'Foundation / plinth', 'Below: concrete bed (separate item)');
    return s;
  });

  def('stone_masonry', 'Random rubble stone masonry', {
    pointing: /pointing/i, through: /through|bond stone/i, stone: /stone|rubble|masonry|ashlar/i
  }, 'stone', function () {
    var s = S({ az: 30, el: 22 }), R = rng(7), X = 120, Ht = 72, T = 45, thr = [60, Ht];
    s.pill = { stone: 'Stone masonry', pointing: 'Pointing / mortar' };
    s.box(0, 0, 0, X, T, Ht, { c: M.mortar, k: 'pointing' });
    // front face stones: irregular rows, corners jittered, shrunk to leave joints
    var z = 0, rows = [];
    while (z < Ht - 2) { var h = 13 + R() * 9; if (Ht - z - h < 9) h = Ht - z; rows.push([z, z + h]); z += h; }
    rows.forEach(function (rw, ri) {
      var x = 0;
      while (x < X - 2) {
        var w = 16 + R() * 20; if (X - x - w < 10) w = X - x;
        var j = function () { return (R() - 0.5) * 4; };
        var p = [[x + 1.3 + (x ? j() : 0), rw[0] + 1.3 + (ri ? j() : 0)], [x + w - 1.3 + (x + w < X ? j() : 0), rw[0] + 1.3 + (ri ? j() : 0)],
                 [x + w - 1.3 + (x + w < X ? j() : 0), rw[1] - 1.3], [x + w * 0.5 + j(), rw[1] - 1.3 + (rw[1] < Ht ? R() * 2 : 0)], [x + 1.3 + (x ? j() : 0), rw[1] - 1.3]];
        var through = ri === rows.length - 1 && x < 60 && x + w > 60;
        var prof = p.map(function (q) { return [q[0], q[1]]; });
        if (through) { s.prism('y', [[p[0][0], p[0][1]], [p[1][0], p[1][1]], [p[2][0], Ht + 1.5], [p[4][0], Ht + 1.5]], 1, T + 2.5, { c: M.stone2, k: 'through' }); thr = [(p[0][0] + p[1][0]) / 2, Ht + 1.5]; }
        else s.prism('y', prof, T - 1, T + 2.5, { c: R() > 0.5 ? M.stone : '#b5ad9f', k: 'stone' });
        x += w;
      }
    });
    // end face shows a few stones in section and the hearting
    s.prism('x', [[3, 3], [20, 4], [19, 20], [4, 18]], X - 1, X + 2, { c: M.stone, k: 'stone' });
    s.prism('x', [[24, 22], [42, 24], [41, 40], [25, 39]], X - 1, X + 2, { c: M.stone, k: 'stone' });
    s.prism('x', [[5, 44], [22, 43], [21, 60], [6, 62]], X - 1, X + 2, { c: '#b5ad9f', k: 'stone' });
    s.lab('stone', [30, T + 2.5, 10], -50, 30, 'Face stones', 'Hammer-dressed stones laid in mortar');
    s.lab('through', [thr[0], 15, thr[1]], 40, -40, 'Through / bond stone', 'Long stone running through the wall thickness');
    s.lab('pointing', [X, 30, 30], 50, 30, 'Mortar & hearting', 'Mortar bed and small stones filling the core');
    s.lab('pointing', [100, T + 1, 40], 50, 40, 'Joints / pointing', 'Pointing is a separate item');
    return s;
  });

  def('plaster_layers', 'Plaster and finishes on a wall', {
    paint: /paint|distemper|emulsion|white ?wash|colou?r ?wash|texture|snowcem|enamel/i, putty: /putty|primer/i, plaster: /plaster|render|punning|rough cast|pebble/i
  }, 'plaster', function () {
    var s = S({ az: 32, el: 20 }), Hh = 80;
    s.box(0, 0, 0, 140, 23, Hh, { c: M.brick, k: 'masonry' });
    for (var z = 10; z < Hh; z += 10) s.line([[140.2, 0, z], [140.2, 23, z]], { c: M.mortar, w: 0.8 });
    for (z = 10; z < Hh; z += 10) s.line([[100, 23.1, z], [140, 23.1, z]], { c: M.mortar, w: 0.8 });
    for (var x = 104; x < 140; x += 20) for (z = 0; z < Hh; z += 10) s.line([[x + ((z / 10) % 2) * 10, 23.1, z], [x + ((z / 10) % 2) * 10, 23.1, z + 10]], { c: M.mortar, w: 0.8 });
    s.box(0, 23, 0, 100, 3.2, Hh, { c: M.plaster, k: 'plaster' });
    s.box(0, 26.2, 0, 70, 1, Hh, { c: '#fbfaf6', k: 'putty' });
    s.box(0, 27.2, 0, 42, 0.8, Hh, { c: '#9cc5b8', k: 'paint' });
    s.lab('masonry', [125, 23, 50], 60, -20, 'Masonry wall', 'Brick / block wall (separate item)');
    s.lab('plaster', [85, 26.2, 40], 70, 50, 'Cement plaster', '12 / 15 / 20 mm thick, mix and thickness as per item');
    s.lab('putty', [58, 27.2, 60], 40, -60, 'Putty / primer', 'Surface preparation coats (separate items)');
    s.lab('paint', [20, 28, 30], -50, 40, 'Paint / finish', 'Distemper / emulsion / other finish, number of coats as per item');
    return s;
  });

  def('dpc', 'Damp proof course at plinth level', {
    dpc: /damp|d\.?p\.?c/i, wall: /brick|masonry/i
  }, 'dpc', function () {
    var s = S({ az: 34, el: 20 });
    s.box(-6, -14, -70, 132, 51, 10, { c: M.pcc, k: 'found' });
    s.box(0, -8, -60, 120, 39, 20, { c: M.brick2, k: 'found' });
    s.box(0, -3, -40, 120, 29, 40, { c: M.brick2, k: 'found' });
    s.box(0, 0, 0, 120, 23, 25, { c: M.brick, k: 'wall' });
    s.box(0, 0, 25, 120, 23, 4, { c: '#3d4a57', k: 'dpc' });
    s.box(0, 0, 29, 120, 23, 55, { c: M.brick, k: 'wall' });
    s.box(-6, 23, -70, 70, 64, 62, { c: M.soil2, k: 'soil' });             // outside ground, cut away on the right
    s.box(-6, 23, -8, 70, 64, 8, { c: M.grass, k: 'soil' });
    s.lab('dpc', [100, 23, 27], 60, -50, 'DPC', 'Damp proof course (e.g. 40 mm CC 1:2:4 with water-proofing compound) over the full wall width at plinth level');
    s.lab('wall', [100, 23, 65], 60, -10, 'Wall above plinth', 'Superstructure masonry');
    s.lab('wall', [90, 23, 12], 70, 20, 'Plinth masonry', 'Wall between ground and plinth level');
    s.lab('found', [100, 26, -30], 60, 30, 'Foundation footing', 'Stepped masonry on a concrete bed, below ground');
    s.lab('soil', [30, 60, 0], -50, -40, 'Ground level', 'Outside ground (shown cut away)');
    return s;
  });

  def('floor_layers', 'Floor build-up (stepped cut-away)', {
    skirting: /skirting|dado/i, finish: /tile|stone|marble|granite|kota|terrazzo|vitrified|ceramic|flooring|floor/i, bed: /bedding|mortar/i,
    pcc: /concrete|pcc|p\.c\.c/i, fill: /sand|filling|fill/i
  }, 'finish', function () {
    var s = S({ az: 36, el: 26 });
    s.box(0, 0, -30, 120, 90, 22, { c: M.soil2, k: 'soil' });
    s.box(0, 0, -8, 108, 90, 12, { c: M.sand, k: 'fill' });
    s.box(0, 0, 4, 94, 90, 8, { c: M.pcc, k: 'pcc' });
    s.box(0, 0, 12, 82, 90, 2.5, { c: '#c9c1b2', k: 'bed' });
    for (var x = 0; x < 72; x += 24.5) for (var y = 0; y < 90; y += 24.5) s.box(x, y, 14.5, Math.min(24, 70 - x), Math.min(24, 90 - y), 1.8, { c: (x + y) % 49 ? M.tile : M.tile2, k: 'finish' });
    s.box(-6, 0, 14.5, 6, 90, 70, { c: M.plaster, k: 'wall' });
    s.box(0, 0, 16.3, 1.2, 90, 12, { c: M.tile2, k: 'skirting' });
    s.lab('finish', [40, 60, 16.3], -10, -70, 'Floor finish', 'Tiles / stone / CC flooring, as per item');
    s.lab('bed', [76, 70, 13.5], 50, -40, 'Bedding mortar', 'Cement mortar bed (often included with the finish)');
    s.lab('pcc', [88, 80, 8], 60, -10, 'Base concrete', 'PCC sub-base (separate item)');
    s.lab('fill', [102, 85, -2], 60, 20, 'Sand filling', 'Filling under floors (separate item)');
    s.lab('soil', [114, 88, -20], 40, 34, 'Consolidated soil', 'Rammed earth / sub-grade');
    s.lab('skirting', [0.6, 50, 22], -50, -40, 'Skirting', 'Skirting / dado at wall foot (separate item)');
    return s;
  });

  def('roof_waterproofing', 'Roof waterproofing build-up', {
    khurra: /khurra|spout|rain ?water|down ?pipe/i, tile: /tile|terracotta|china/i, membrane: /membrane|app|bitumen|felt|sheet|polymer|coating/i,
    coba: /brick ?bat|coba|lime|grading|screed|slope|water ?proof/i, slab: /slab|concrete/i
  }, 'membrane', function () {
    var s = S({ az: 34, el: 28 });
    s.box(0, 0, 0, 140, 100, 12, { c: M.concrete, k: 'slab' });
    s.box(0, 0, 12, 140, 18, 50, { c: M.brick, k: 'parapet' });
    s.hexa([[0, 18, 12], [124, 18, 12], [124, 100, 12], [0, 100, 12], [0, 18, 22], [124, 18, 22], [124, 100, 18], [0, 100, 18]], { c: '#c98a62', k: 'coba' });
    s.hexa([[0, 18, 22], [110, 18, 22], [110, 100, 18], [0, 100, 18], [0, 18, 23], [110, 18, 23], [110, 100, 19], [0, 100, 19]], { c: M.membrane, k: 'membrane' });
    s.line([[0, 18.2, 23], [0, 18.2, 31]], { c: M.membrane, w: 3, k: 'membrane' });
    for (var x = 0; x < 96; x += 16) for (var y = 18; y < 100; y += 16) {
      var z0 = 23 - (y - 18) / 82 * 4, z1 = 23 - (Math.min(y + 15, 100) - 18) / 82 * 4;
      s.hexa([[x, y, z0], [x + 15, y, z0], [x + 15, Math.min(y + 15, 100), z1], [x, Math.min(y + 15, 100), z1],
        [x, y, z0 + 2], [x + 15, y, z0 + 2], [x + 15, Math.min(y + 15, 100), z1 + 2], [x, Math.min(y + 15, 100), z1 + 2]], { c: '#c5653f', k: 'tile' });
    }
    s.pipe('z', [146, 104, -60], 4, 70, { c: M.pvc, k: 'khurra' });
    s.box(134, 96, 14, 14, 10, 4, { c: M.conc2, k: 'khurra' });
    s.lab('slab', [70, 100, 6], -20, 40, 'RCC roof slab', 'Structural slab (separate item)');
    s.lab('coba', [118, 100, 15], 50, 10, 'Brick-bat coba / grading', 'Laid to slope (about 1 in 100) towards the outlet');
    s.lab('membrane', [104, 60, 21], 70, -30, 'Waterproofing layer', 'Membrane / treatment as per item, turned up on the parapet');
    s.lab('tile', [40, 60, 22], -60, -40, 'Protective finish', 'Tiles / screed over the waterproofing');
    s.lab('parapet', [40, 0, 50], -30, -30, 'Parapet', 'Waterproofing turned up into a groove');
    s.lab('khurra', [146, 108, -10], 40, 30, 'Khurra & rain-water pipe', 'Outlet and down pipe (separate items)');
    return s;
  });

  // ======================= PLUMBING, DRAINAGE, SITE WORK =======================
  def('pipe_joint', 'Socket & spigot pipe joint (see-through socket)', {
    joint: /\bjoints?\b|caulk|gasket|rubber ring|\blead\b|yarn/i, pipe: /pipe/i
  }, 'pipe', function () {
    var s = S({ az: 32, el: 22 });
    s.pill = { pipe: 'Pipe', joint: 'Pipe joint' };
    s.pipe('x', [-90, 0, 0], 10, 108, { c: M.gi, k: 'pipe' });
    s.cyl('x', [4, 0, 0], 12.4, 7, { c: M.rubber, k: 'joint' }, 24);
    s.cyl('x', [0, 0, 0], 14.5, 30, { c: M.gi, k: 'pipe', op: 0.42 });
    s.pipe('x', [30, 0, 0], 10, 90, { c: M.gi, k: 'pipe' });
    s.lab('pipe', [-60, 0, 10], -10, -50, 'Spigot end', 'Plain end of one pipe pushed into the socket');
    s.lab('pipe', [15, 0, 14.5], 10, -60, 'Socket', 'Enlarged end of the next pipe');
    s.lab('joint', [7.5, 6, -11], -40, 46, 'Joint', 'Rubber ring / lead caulking / cement mortar as per item');
    s.lab('pipe', [90, 0, 10], 30, -40, 'Pipe barrel', 'Length measured along the centre line, through fittings');
    return s;
  });

  def('manhole', 'Manhole / inspection chamber (cut-away)', {
    cover: /\bcovers?\b|\bframes?\b/i, step: /step|foot ?rest|ladder/i, chamber: /manhole|chamber|brick|masonry|pit/i
  }, 'chamber', function () {
    var s = S({ az: 36, el: 30 }), ch = { c: M.brick, k: 'chamber' };
    s.pill = { chamber: 'Manhole chamber' };
    s.box(-15, -15, -15, 166, 156, 15, { c: M.pcc, k: 'base' });
    s.pipe('x', [-70, 63, 18], 9, 75, { c: '#c9b79c', k: 'pipe' });
    s.box(0, 0, 0, 136, 23, 140, ch); s.box(0, 23, 0, 23, 80, 140, ch);
    [35, 62, 89, 116].forEach(function (z) { s.line([[60, 23, z], [60, 31, z], [76, 31, z], [76, 23, z]], { c: M.steel2, w: 2, k: 'step' }); });
    s.box(23, 23, 0, 90, 80, 14, { c: M.conc2, k: 'bench' });
    s.box(23, 54, 10, 90, 18, 4.3, { c: '#8d8f93', k: 'bench' });
    s.box(0, 103, 0, 136, 23, 45, ch); s.box(113, 23, 0, 23, 80, 45, ch);
    s.pipe('x', [136, 63, 18], 9, 60, { c: '#c9b79c', k: 'pipe' });
    s.box(-6, -6, 140, 148, 60, 12, { c: M.concrete, k: 'slab' });
    s.cyl('z', [68, 28, 152], 22, 3, { c: '#55595f', k: 'cover' }); s.cyl('z', [68, 28, 155], 18, 1.5, { c: '#6d7279', k: 'cover' });
    s.lab('chamber', [10, 80, 100], -60, -10, 'Chamber walls', 'Brick / RCC walls, plastered inside');
    s.lab('cover', [68, 28, 156], 40, -40, 'Cover & frame', 'CI / SFRC cover with frame, set in the top slab');
    s.lab('slab', [120, 40, 146], 60, -10, 'Top slab', 'RCC slab over the chamber');
    s.lab('step', [76, 31, 89], 60, 0, 'Step irons', 'Foot rests for going down');
    s.lab('bench', [90, 63, 14], -20, 70, 'Channel & benching', 'Half-round channel with sloping benching');
    s.lab('base', [100, 140, -8], 40, 30, 'Base concrete', 'Foundation concrete under the chamber');
    s.lab('pipe', [180, 63, 27], 40, -40, 'Sewer pipes', 'Incoming and outgoing pipes (separate items)');
    return s;
  });

  def('septic_tank', 'Septic tank (cut-away)', {
    vent: /vent/i, cover: /cover|slab/i, tank: /septic|tank|chamber/i
  }, 'tank', function () {
    var s = S({ az: 36, el: 30 }), wl = { c: M.brick, k: 'tank' };
    s.pill = { tank: 'Septic tank' };
    s.box(-10, -10, -12, 230, 120, 12, { c: M.pcc, k: 'tank' });
    s.box(0, 0, 0, 210, 18, 120, wl); s.box(0, 18, 0, 18, 64, 120, wl);
    s.pipe('z', [30, 9, 120], 3.5, 60, { c: M.pvc, k: 'vent' });
    s.box(18, 18, 0, 174, 64, 12, { c: '#6b4f33', k: 'sludge' });
    s.box(135, 18, 0, 12, 64, 100, { c: M.brick2, k: 'tank' });
    s.box(18, 18, 12, 117, 64, 68, { c: M.water, k: 'liquid', op: 0.45 });
    s.box(147, 18, 12, 45, 64, 68, { c: M.water, k: 'liquid', op: 0.45 });
    s.line([[-30, 50, 90], [30, 50, 90], [30, 50, 50]], { c: '#e5e7ea', w: 6, k: 'pipe' });
    s.line([[175, 50, 50], [175, 50, 90], [250, 50, 90]], { c: '#e5e7ea', w: 6, k: 'pipe' });
    s.box(0, 82, 0, 210, 18, 50, wl); s.box(192, 18, 0, 18, 64, 50, wl);
    s.box(0, 0, 120, 210, 40, 10, { c: M.concrete, k: 'cover' });
    s.lab('tank', [10, 60, 110], -50, -30, 'Tank walls', 'Brick / RCC walls on a concrete base, plastered inside');
    s.lab('liquid', [80, 82, 60], -50, 50, 'Liquid zone', 'Sewage settles; clearer liquid flows on');
    s.lab('sludge', [100, 82, 6], 30, 50, 'Sludge', 'Settled solids, removed periodically');
    s.lab('tank', [141, 82, 48], 70, 40, 'Partition wall', 'Divides the tank into two chambers');
    s.lab('pipe', [-15, 50, 90], -10, 40, 'Inlet tee', 'Inlet pipe with tee / bend dipping below the scum');
    s.lab('pipe', [230, 50, 90], 10, -40, 'Outlet tee', 'To soak pit / drain');
    s.lab('cover', [150, 20, 130], 40, -40, 'Cover slabs', 'RCC cover slabs with openings');
    s.lab('vent', [30, 9, 175], -40, -10, 'Vent pipe', 'Lets gases escape');
    return s;
  });

  def('trench', 'Trench excavation for a pipe', {
    excav: /excavat|trench|earth ?work|cutting|digging/i, bedding: /bedding|cushion|sand/i, backfill: /refill|back ?fill|filling|returning/i,
    disposal: /dispos|spoil|\blead\b|surplus/i, pipe: /pipe|cable/i
  }, 'excav', function () {
    var s = S({ az: 30, el: 30 });
    s.pill = { excav: 'Excavation', bedding: 'Bedding', backfill: 'Refilling', disposal: 'Disposal of earth', pipe: 'Pipe' };
    s.box(0, 0, -100, 60, 170, 100, { c: M.soil2, k: 'soil' });
    s.box(0, 0, -4, 60, 170, 4, { c: M.grass, k: 'soil' });
    s.prism('y', [[8, 0], [52, 0], [38, 20], [20, 22]], 10, 160, { c: '#b08b62', k: 'disposal' });
    s.box(60, 0, -100, 40, 170, 10, { c: M.soil2, k: 'soil' });
    s.box(60, 0, -90, 40, 170, 8, { c: M.sand, k: 'bedding' });
    s.box(60, 0, -82, 40, 60, 82, { c: '#b89670', k: 'backfill' });
    s.pipe('y', [80, 60, -72], 10, 110, { c: '#9aa3ad', k: 'pipe' });
    s.box(60, 60, -90, 40, 110, 90, { c: '#ffe8d1', k: 'excav', op: 0.2 });
    s.box(100, 0, -100, 60, 170, 100, { c: M.soil2, k: 'soil' });
    s.box(100, 0, -4, 60, 170, 4, { c: M.grass, k: 'soil' });
    s.line([[58, 170, 0], [58, 170, -90]], { c: '#1f2933', w: 1.2, dash: '4 3' });
    s.lab('excav', [80, 150, -30], 70, -60, 'Excavated trench', 'Measured as length x width x depth as per item');
    s.lab('pipe', [80, 170, -62], -60, 30, 'Pipe', 'Laid on the bedding (separate item)');
    s.lab('bedding', [90, 170, -86], 60, 40, 'Bedding', 'Sand / concrete bed under the pipe');
    s.lab('backfill', [80, 30, 0], 40, -50, 'Refilling', 'Excavated earth returned in layers and rammed');
    s.lab('disposal', [30, 60, 20], -40, -40, 'Surplus earth', 'Stacked / disposed - lead as per item');
    s.lab('soil', [58, 170, -45], -60, 0, 'Depth', 'Depth classes: up to 1.5 m, 1.5 - 3 m ...');
    return s;
  });

  def('formwork', 'Centering & shuttering (formwork) for slab and beam', {
    form: /center|centr|shutter|formwork|propp|stag/i
  }, 'form', function () {
    var s = S({ az: 36, el: 24 });
    s.pill = { form: 'Centering & shuttering' };
    s.box(-10, -10, -3, 200, 150, 3, { c: M.floor, k: 'floor' });
    var x, y;
    s.group(function () {
      for (x = 15; x < 170; x += 50) for (y = 25; y < 130; y += 45) s.cyl('z', [x, y, 0], 2, 90, { c: M.steel, k: 'form' }, 10);
      [25, 70, 115].forEach(function (yy) { s.box(5, yy - 4, 90, 170, 8, 8, { c: M.wood2, k: 'form' }); });
      for (x = 8; x < 176; x += 14) s.box(x, 10, 98, 5, 125, 7, { c: M.wood, k: 'form' });
    });
    s.box(0, 10, 105, 120, 125, 2, { c: M.ply, k: 'form' });
    s.box(-12, 10, 75, 12, 125, 32, { c: M.ply, k: 'form' });
    s.box(-30, 10, 72, 18, 125, 3, { c: M.ply, k: 'form' });
    s.cyl('z', [-21, 40, 0], 2, 72, { c: M.steel, k: 'form' }, 10); s.cyl('z', [-21, 110, 0], 2, 72, { c: M.steel, k: 'form' }, 10);
    s.lab('form', [60, 80, 107], -20, -60, 'Plywood sheathing', 'Shuttering in contact with the concrete');
    s.lab('form', [150, 90, 105], 60, -30, 'Joists', 'Timber / steel members supporting the sheathing');
    s.lab('form', [170, 115, 94], 60, 10, 'Runners', 'Bearers on the props');
    s.lab('form', [115, 115, 40], 60, 30, 'Props', 'Adjustable steel / ballies, braced');
    s.lab('form', [-12, 100, 90], -40, -40, 'Beam side & soffit forms', 'Forms for the beam, removed after curing');
    return s;
  });

  def('anti_termite', 'Anti-termite treatment (pre-construction)', {
    chem: /termite|chemical|chlorpyriphos|imidacloprid|emulsion/i
  }, 'chem', function () {
    var s = S({ az: 34, el: 22 }), ch = { c: M.chem, k: 'chem', op: 0.7 };
    s.pill = { chem: 'Anti-termite treatment' };
    s.box(-6, -14, -72, 132, 51, 2, ch);
    s.box(-6, -14, -70, 132, 51, 10, { c: M.pcc, k: 'found' });
    s.box(0, -8, -60, 120, 39, 20, { c: M.brick2, k: 'found' });
    s.box(0, -3, -40, 120, 29, 40, { c: M.brick2, k: 'found' });
    s.box(0, 0, 0, 120, 23, 25, { c: M.brick, k: 'wall' });
    s.box(0, 0, 25, 120, 23, 50, { c: M.brick, k: 'wall' });
    s.box(-6, 23, -70, 70, 64, 62, { c: M.soil2, k: 'soil' });
    s.box(-6, 23, -8, 70, 64, 8, { c: M.soil, k: 'soil' });
    s.box(-6, 23, -70, 70, 3, 70, ch);
    s.box(-6, 23, 0, 70, 30, 1.5, ch);
    s.lab('chem', [100, 10, -71], 60, 20, 'Trench bottom', 'Treated before the foundation bed is laid');
    s.lab('chem', [40, 26, -40], -50, 10, 'Sides & backfill', 'Earth in contact with the foundation is treated');
    s.lab('chem', [30, 50, 1.5], -40, -40, 'External perimeter', 'Strip of soil along the outside of the wall');
    s.lab('wall', [100, 23, 50], 60, -30, 'Wall', 'Treatment measured on plinth area of the building');
    return s;
  });

  def('false_ceiling', 'False ceiling: hangers, grid and boards', {
    hanger: /hanger|suspen|\brods?\b/i, grid: /grid|runner|\btees?\b|channel|section|frame ?work/i,
    tile: /tile|board|gypsum|panel|calcium|mineral|fibre|ceiling/i
  }, 'tile', function () {
    var s = S({ az: 34, el: 30 });
    s.pill = { tile: 'False ceiling', grid: 'Grid / framework', hanger: 'Suspension' };
    s.box(0, 0, 100, 160, 120, 12, { c: M.concrete, k: 'slab' });
    s.box(-12, 0, 0, 12, 120, 112, { c: M.plaster, k: 'wall' });
    var x, y;
    for (x = 20; x < 160; x += 40) for (y = 20; y < 120; y += 40) s.line([[x, y, 100], [x, y, 46]], { c: M.steel2, w: 1.5, k: 'hanger' });
    s.box(0, 0, 40, 4, 120, 1.5, { c: M.steel, k: 'grid' });
    s.group(function () {
      for (y = 20; y < 120; y += 40) s.box(0, y - 1, 41.5, 160, 2, 4, { c: M.white, k: 'grid' });
      for (x = 40; x < 160; x += 40) s.box(x - 0.8, 0, 41.5, 1.6, 120, 2.5, { c: M.white, k: 'grid' });
      for (x = 0; x < 160; x += 40) for (y = 0; y < 120; y += 20) {
        if ((x === 80 && y === 40) || (x === 120 && y === 60) || (x === 120 && y === 80)) continue;
        s.box(x + 1, y + 1, 41.5, 38, 18, 1.4, { c: M.ceiling, k: 'tile' });
      }
    });
    s.lab('slab', [140, 120, 106], 40, -30, 'Roof / floor slab', 'Structure above');
    s.lab('hanger', [100, 60, 75], 40, -60, 'Hangers', 'Suspension rods / wires from the slab');
    s.lab('grid', [140, 60, 45], 60, 10, 'Main runner', 'Primary grid member');
    s.lab('grid', [80, 110, 43], 40, 40, 'Cross tee', 'Secondary grid member');
    s.lab('tile', [30, 70, 43], -40, 50, 'Ceiling board / tile', 'Gypsum / mineral fibre / calcium silicate etc.');
    s.lab('grid', [2, 90, 41], -40, 0, 'Wall angle', 'Perimeter angle on the wall');
    return s;
  });

  def('steel_truss', 'Steel roof truss with purlins and sheeting', {
    purlin: /purlin/i, sheet: /sheet|roofing|corrugated|profile|galvalume|cladding/i, truss: /truss|structural steel|steel work|welded|bolted|riveted|angle|section/i
  }, 'truss', function () {
    var s = S({ az: 32, el: 18 }), Wd = 240, Hr = 60, y;
    s.pill = { truss: 'Steel truss', purlin: 'Purlins', sheet: 'Roof sheeting' };
    var tr = { c: M.steel2, w: 3, k: 'truss' }, th = { c: M.steel2, w: 2, k: 'truss' };
    [0, 120].forEach(function (yy) {
      s.box(-6, yy - 6, -100, 12, 12, 100, { c: M.steel, k: 'col' }); s.box(Wd - 6, yy - 6, -100, 12, 12, 100, { c: M.steel, k: 'col' });
      s.line([[0, yy, 0], [Wd / 2, yy, Hr], [Wd, yy, 0], [0, yy, 0]], tr);
      [1, 2, 3].forEach(function (i) { var x = Wd / 8 * i, x2 = Wd - x; s.line([[x, yy, 0], [x, yy, Hr * x / (Wd / 2)]], th); s.line([[x2, yy, 0], [x2, yy, Hr * x / (Wd / 2)]], th);
        s.line([[x, yy, 0], [x + Wd / 8, yy, Hr * (x + Wd / 8) / (Wd / 2)]], th); s.line([[x2, yy, 0], [x2 - Wd / 8, yy, Hr * (x + Wd / 8) / (Wd / 2)]], th); });
    });
    s.group(function () {
      for (var i = 0; i <= 4; i++) { var x = Wd / 2 * i / 4, z = Hr * i / 4 + 3; s.box(x - 2, -10, z, 4, 140, 4, { c: '#7f8b97', k: 'purlin' }); if (i < 4) s.box(Wd - x - 2, -10, z, 4, 140, 4, { c: '#7f8b97', k: 'purlin' }); }
    });
    s.hexa([[Wd, -10, 7], [Wd / 2, -10, Hr + 7], [Wd / 2, 55, Hr + 7], [Wd, 55, 7], [Wd, -10, 8.5], [Wd / 2, -10, Hr + 8.5], [Wd / 2, 55, Hr + 8.5], [Wd, 55, 8.5]], { c: M.gi, k: 'sheet' });
    for (y = -6; y < 55; y += 4) s.line([[Wd, y, 8.6], [Wd / 2, y, Hr + 8.6]], { c: '#8f9ba6', w: 0.7, k: 'sheet' });
    s.lab('truss', [Wd / 4, 120, Hr / 2], -40, -50, 'Rafter (top chord)', 'Sloping top member');
    s.lab('truss', [Wd * 0.7, 120, 0], 40, 40, 'Tie (bottom chord)', 'Horizontal bottom member');
    s.lab('truss', [Wd * 3 / 8, 120, Hr * 0.75 * 0.75], 30, -60, 'Struts & ties', 'Web members; angles / tubes, welded or bolted');
    s.lab('purlin', [Wd * 0.75, 100, Hr / 2 + 5], 60, 10, 'Purlins', 'Members across trusses carrying the sheets');
    s.lab('sheet', [Wd * 0.7, 20, Hr * 0.6 + 8.6], 50, -40, 'Roof sheeting', 'GI / profiled sheets fixed to purlins (separate item)');
    s.lab('col', [Wd, 126, -60], 50, 30, 'Column', 'Steel / RCC support');
    return s;
  });

  // ======================= ROADS & BRIDGES =======================
  def('pavement_flexible', 'Flexible (bituminous) road pavement layers', {
    prime: /prime coat|tack coat|\bprime\b|\btack\b/i, bc: /bituminous concrete|\bb\.?c\.?\b|wearing|surface dress|seal coat|mastic|premix|open.graded|carpet/i,
    dbm: /dense bituminous|\bd\.?b\.?m\b|bituminous macadam|\bb\.?m\.?\b/i, wmm: /wet mix|\bw\.?m\.?m\b|water bound|\bw\.?b\.?m\b/i,
    gsb: /granular sub|\bg\.?s\.?b\b|sub.?base|moorum|sand/i, sub: /sub.?grade|embankment|earth/i
  }, 'bc', function () {
    var s = S({ az: 36, el: 26 });
    s.pill = { bc: 'Bituminous wearing course', dbm: 'Bituminous base (DBM / BM)', wmm: 'WMM / WBM base', gsb: 'Granular sub-base', sub: 'Subgrade', prime: 'Prime / tack coat' };
    s.box(0, 0, -40, 160, 110, 30, { c: M.soil, k: 'sub' });
    s.box(0, 0, -10, 145, 110, 15, { c: M.gravel, k: 'gsb' });
    s.box(0, 0, 5, 130, 110, 15, { c: '#8f8a83', k: 'wmm' });
    s.box(0, 0, 20, 130, 110, 0.6, { c: '#2a2b2e', k: 'prime' });
    s.box(0, 0, 20.6, 115, 110, 10, { c: M.bit2, k: 'dbm' });
    s.box(0, 0, 30.6, 115, 110, 0.5, { c: '#222326', k: 'prime' });
    s.box(0, 0, 31.1, 100, 110, 5, { c: M.bitumen, k: 'bc' });
    for (var x = 4; x < 96; x += 22) s.plane([[x, 52, 36.2], [x + 12, 52, 36.2], [x + 12, 56, 36.2], [x, 56, 36.2]], { c: M.white, k: 'mark' });
    s.lab('bc', [50, 90, 36], -40, -50, 'Wearing course (BC / SDBC)', 'Top bituminous layer, thickness as per item');
    s.lab('prime', [110, 100, 31], 40, -60, 'Tack coat', 'Thin bitumen spray between bituminous layers');
    s.lab('dbm', [110, 110, 25], 60, -30, 'DBM / BM', 'Bituminous base course');
    s.lab('prime', [125, 100, 20.4], 60, -10, 'Prime coat', 'Bitumen spray on the granular base');
    s.lab('wmm', [128, 110, 12], 60, 10, 'WMM / WBM', 'Granular base course');
    s.lab('gsb', [143, 110, -2], 50, 30, 'GSB', 'Granular sub-base');
    s.lab('sub', [150, 110, -25], 30, 50, 'Subgrade', 'Compacted earth (top 500 mm)');
    return s;
  });

  def('pavement_rigid', 'Rigid (concrete) road pavement', {
    dowel: /dowel(?! jointed)/i, tie: /tie bar/i, joint: /sealant|sealing|groove|filler board|(cutting|filling|sealing) (of )?joints?|joints? (cutting|filling|sealing)/i, membrane: /separation|membrane|polythene|plastic sheet/i,
    dlc: /dry lean|\bd\.?l\.?c\b/i, pqc: /pavement quality|\bp\.?q\.?c\b|cement concrete pavement|rigid|concrete/i, gsb: /granular sub|\bg\.?s\.?b\b|sub.?base/i
  }, 'pqc', function () {
    var s = S({ az: 34, el: 26 });
    s.pill = { pqc: 'PQC slabs', dlc: 'DLC base', dowel: 'Dowel bars', tie: 'Tie bars', joint: 'Joints & sealant', membrane: 'Separation membrane', gsb: 'GSB' };
    s.box(0, 0, -36, 170, 120, 16, { c: M.soil, k: 'sub' });
    s.box(0, 0, -20, 160, 120, 12, { c: M.gravel, k: 'gsb' });
    s.box(0, 0, -8, 150, 120, 10, { c: '#b3b0a8', k: 'dlc' });
    s.box(0, 0, 2, 140, 120, 0.5, { c: '#4b6f8f', k: 'membrane' });
    var y, x;
    for (y = 10; y < 120; y += 15) s.cyl('x', [55, y, 13], 1.3, 30, { c: M.steel2, k: 'dowel' }, 8);
    for (x = 12; x < 140; x += 30) s.cyl('y', [x, 45, 11], 0.9, 30, { c: M.rebar, k: 'tie' }, 8);
    s.group(function () {
      s.box(0, 0, 2.5, 69.5, 59.5, 22, { c: M.conc2, k: 'pqc', op: 0.55 }); s.box(70.5, 0, 2.5, 69.5, 59.5, 22, { c: M.conc2, k: 'pqc', op: 0.55 });
      s.box(0, 60.5, 2.5, 69.5, 59.5, 22, { c: M.conc2, k: 'pqc', op: 0.55 }); s.box(70.5, 60.5, 2.5, 69.5, 59.5, 22, { c: M.conc2, k: 'pqc', op: 0.55 });
    });
    s.line([[70, 0, 24.6], [70, 120, 24.6]], { c: '#222', w: 2.2, k: 'joint' }); s.line([[0, 60, 24.6], [140, 60, 24.6]], { c: '#222', w: 2.2, k: 'joint' });
    s.lab('pqc', [30, 100, 24.5], -40, -40, 'PQC slab', 'Pavement quality concrete, cut into panels');
    s.lab('dowel', [85, 115, 13], 60, -50, 'Dowel bars', 'Plain bars across transverse joints (load transfer)');
    s.lab('tie', [132, 70, 11], 60, -20, 'Tie bars', 'Deformed bars across the longitudinal joint');
    s.lab('joint', [70, 100, 24.6], 0, -60, 'Joints', 'Sawn joints filled with sealant');
    s.lab('membrane', [145, 110, 2.3], 50, 10, 'Separation membrane', 'Plastic sheet between DLC and PQC');
    s.lab('dlc', [150, 110, -3], 50, 30, 'DLC', 'Dry lean concrete sub-base');
    s.lab('gsb', [160, 115, -14], 30, 50, 'GSB', 'Granular sub-base / drainage layer');
    return s;
  });

  def('kerb_channel', 'Kerb, channel and footpath at the road edge', {
    kerb: /kerb|curb/i, channel: /channel|gutter|drain/i, footpath: /footpath|paver|paving|interlocking|block/i
  }, 'kerb', function () {
    var s = S({ az: 30, el: 26 });
    s.pill = { kerb: 'Kerb stone', channel: 'Channel / gutter', footpath: 'Footpath paving' };
    s.box(0, -110, -10, 150, 64, 24, { c: M.sand, k: 'fill' });
    s.group(function () { for (var x = 0; x < 150; x += 20) for (var y = -110; y < -46; y += 16) s.box(x + 0.4, y + 0.4, 14, 19.2, 15.2, 6, { c: ((x / 20) + (y + 110) / 16) % 2 ? '#b9796a' : '#c98a7b', k: 'footpath' }); });
    s.box(0, -46, -30, 150, 18, 10, { c: M.pcc, k: 'kerb' });
    s.group(function () { for (var x = 0; x < 150; x += 50) s.hexa([[x, -46, -20], [x + 49.5, -46, -20], [x + 49.5, -30, -20], [x, -30, -20], [x, -46, 22], [x + 49.5, -46, 22], [x + 49.5, -32, 22], [x, -32, 22]], { c: '#c7c9cc', k: 'kerb' }); });
    s.box(0, -30, -20, 150, 30, 14, { c: M.pcc, k: 'channel' });
    s.group(function () { for (var x = 0; x < 150; x += 30) s.box(x, -30, -6, 29.5, 30, 10, { c: M.conc2, k: 'channel' }); });
    s.box(0, 0, -20, 150, 80, 20, { c: M.gravel, k: 'base' });
    s.box(0, 0, 0, 150, 80, 6, { c: M.bitumen, k: 'road' });
    s.lab('kerb', [100, -31, 12], 40, -60, 'Kerb', 'Precast / stone kerb on a concrete bed');
    s.lab('channel', [120, -15, 4], 60, -10, 'Channel', 'Precast / CC channel carrying surface water');
    s.lab('footpath', [40, -80, 20], -40, -40, 'Footpath paving', 'Interlocking blocks / tiles on sand bed');
    s.lab('road', [60, 50, 6], -30, 40, 'Carriageway', 'Road surface');
    return s;
  });

  def('pipe_culvert', 'Pipe culvert under a road', {
    head: /head ?wall|wing|parapet|apron|face wall/i, pipe: /pipe|hume|\bnp\d|r\.?c\.?c\.? pipe/i, bed: /bedding|cradle/i, emb: /earth|embankment|fill/i
  }, 'pipe', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { pipe: 'Culvert pipe', head: 'Headwall & wings', bed: 'Pipe bedding' };
    s.prism('x', [[-130, 0], [130, 0], [60, 50], [-60, 50]], 0, 120, { c: M.soil, k: 'emb' });
    s.box(0, -60, 50, 120, 120, 4, { c: M.bitumen, k: 'road' });
    s.box(-10, 100, -8, 140, 50, 8, { c: M.conc2, k: 'head' });
    s.box(20, 0, 0, 80, 132, 10, { c: M.pcc, k: 'bed' });
    s.pipe('y', [60, 0, 28], 18, 132, { c: '#c4c1ba', k: 'pipe' }, 4);
    s.box(10, 125, 0, 100, 12, 60, { c: M.stone, k: 'head' });
    s.hexa([[-30, 105, 0], [10, 125, 0], [10, 137, 0], [-30, 117, 0], [-30, 105, 15], [10, 125, 60], [10, 137, 60], [-30, 117, 15]], { c: M.stone2, k: 'head' });
    s.hexa([[110, 125, 0], [150, 105, 0], [150, 117, 0], [110, 137, 0], [110, 125, 60], [150, 105, 15], [150, 117, 15], [110, 137, 60]], { c: M.stone2, k: 'head' });
    s.pipe('y', [60, 137, 28], 18, 1, { c: '#c4c1ba', k: 'pipe' }, 4);
    s.lab('pipe', [60, 138, 46], 60, -40, 'Culvert pipe', 'RCC (NP3 / NP4) pipe, measured per metre');
    s.lab('head', [30, 137, 50], -50, -40, 'Headwall', 'Masonry / concrete face wall');
    s.lab('head', [130, 125, 20], 60, 10, 'Wing wall', 'Retains the embankment slopes');
    s.lab('head', [-10, 140, 0], -40, 30, 'Apron', 'Floor at the outlet against scour');
    s.lab('bed', [95, 132, 6], 30, 50, 'Bedding', 'Concrete / granular bed under the pipe');
    s.lab('road', [60, -40, 54], 30, -40, 'Road over embankment', 'Cushion of earth above the pipe');
    s.lab('emb', [60, -95, 25], -50, 20, 'Road embankment', 'Earth fill over and around the pipe, compacted in layers');
    return s;
  });

  def('bridge_bearing', 'Bridge bearing between girder and pier cap', {
    bearing: /bearing|elastomeric|neoprene|\bpot\b|ptfe/i, pedestal: /pedestal/i, girder: /girder|deck|superstructure/i, pier: /pier|cap|substructure/i
  }, 'bearing', function () {
    var s = S({ az: 34, el: 18 });
    s.pill = { bearing: 'Elastomeric bearing' };
    s.box(-20, -20, 0, 200, 90, 40, { c: M.concrete, k: 'pier' });
    [20, 120].forEach(function (x) {
      s.box(x, 10, 40, 40, 30, 10, { c: M.conc2, k: 'pedestal' });
      for (var i = 0; i < 4; i++) {
        s.box(x + 4, 13, 50 + i * 4, 32, 24, 3, { c: M.rubber, k: 'bearing' });
        if (i < 3) s.box(x + 5, 14, 53 + i * 4, 30, 22, 1, { c: M.steel, k: 'bearing' });
      }
    });
    s.box(-10, 0, 66, 180, 48, 4, { c: M.steel2, k: 'girder' });
    s.box(-10, 16, 70, 180, 16, 46, { c: M.conc2, k: 'girder', op: 0.9 });
    s.box(-10, -10, 116, 180, 70, 14, { c: M.concrete, k: 'girder' });
    s.lab('bearing', [156, 37, 56], 60, -10, 'Elastomeric pad', 'Rubber layers bonded to steel plates (laminated)');
    s.lab('bearing', [150, 37, 53.5], 60, 30, 'Steel laminates', 'Internal plates that stiffen the pad');
    s.lab('pedestal', [140, 40, 44], 30, 50, 'Pedestal', 'Concrete block on the pier cap');
    s.lab('pier', [80, 70, 20], -40, 50, 'Pier / abutment cap', 'Substructure');
    s.lab('girder', [60, 32, 95], -60, -30, 'Girder', 'Superstructure resting on the bearings');
    return s;
  });

  def('pile', 'Pile foundation with pile cap', {
    cap: /pile cap/i, pile: /pile|bored|driven/i
  }, 'pile', function () {
    var s = S({ az: 34, el: 22 });
    s.pill = { pile: 'Piles', cap: 'Pile cap' };
    s.box(-90, -90, -230, 180, 180, 220, { c: M.soil2, k: 'soil', op: 0.28 });
    [[-45, -45], [45, -45], [-45, 45], [45, 45]].forEach(function (c, i) {
      if (i === 3) {
        for (var a = 0; a < 6; a++) { var t = a / 6 * 2 * Math.PI; s.line([[c[0] + 9 * Math.cos(t), c[1] + 9 * Math.sin(t), -220], [c[0] + 9 * Math.cos(t), c[1] + 9 * Math.sin(t), 25]], { c: M.rebar, w: 1.3, k: 'pile' }); }
        for (var z = -210; z < 0; z += 18) s.line([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (j) { var t = j / 12 * 2 * Math.PI; return [c[0] + 9 * Math.cos(t), c[1] + 9 * Math.sin(t), z]; }), { c: '#7d3d1e', w: 0.8, k: 'pile' });
        s.cyl('z', [c[0], c[1], -225], 13, 235, { c: M.concrete, k: 'pile', op: 0.45 }, 24);
      } else s.cyl('z', [c[0], c[1], -225], 13, 235, { c: M.concrete, k: 'pile' }, 24);
    });
    s.box(-70, -70, 10, 140, 140, 40, { c: M.conc2, k: 'cap' });
    s.box(-18, -18, 50, 36, 36, 70, { c: M.concrete, k: 'col' });
    s.plane([[-90, -90, -10], [90, -90, -10], [90, 90, -10], [-90, 90, -10]], { c: M.soil, k: 'soil', op: 0.35 });
    s.lab('pile', [-45, 58, -120], -60, 0, 'Pile', 'Bored cast-in-situ / driven pile, length as per design');
    s.lab('pile', [54, 45, -100], 60, 20, 'Reinforcement cage', 'Longitudinal bars with helical / ring ties');
    s.lab('cap', [40, 70, 30], 60, -30, 'Pile cap', 'RCC cap tying the pile heads together');
    s.lab('col', [0, 18, 100], -50, -30, 'Column / pier', 'Load carried down to the piles');
    s.lab('soil', [-90, 60, -10], -40, -30, 'Ground level', 'Piles carry load to firm strata / by friction');
    return s;
  });

  def('well_foundation', 'Well foundation (see-through)', {
    cutting: /cutting edge/i, curb: /\bcurb\b/i, steining: /steining/i, plug: /plug|sealing/i, sand: /sand fill|filling/i, cap: /well cap|\bcap\b/i
  }, 'steining', function () {
    var s = S({ az: 34, el: 18 });
    s.pill = { steining: 'Well steining' };
    s.cyl('z', [0, 0, 0], 44, 6, { c: M.steel2, k: 'cutting' });
    s.cyl('z', [0, 0, 6], 30, 34, { c: M.concrete, k: 'plug' });
    s.cyl('z', [0, 0, 40], 30, 110, { c: M.sand, k: 'sand' });
    s.cyl('z', [0, 0, 150], 30, 12, { c: M.pcc, k: 'plug' });
    s.cyl('z', [0, 0, 6], 43, 26, { c: M.conc2, k: 'curb', op: 0.5 });
    s.cyl('z', [0, 0, 32], 42, 132, { c: M.concrete, k: 'steining', op: 0.55 });
    s.cyl('z', [0, 0, 164], 50, 16, { c: M.conc2, k: 'cap' });
    s.box(-20, -40, 180, 40, 80, 70, { c: M.concrete, k: 'pier' });
    s.line(Array.apply(null, Array(41)).map(function (_, j) { var t = j / 40 * 2 * Math.PI; return [70 * Math.cos(t), 70 * Math.sin(t), 120]; }), { c: '#2f6f9f', w: 1.2, dash: '5 4' });
    s.lab('steining', [-42, 10, 120], -50, -20, 'Steining', 'Thick RCC / masonry wall of the well');
    s.lab('cutting', [30, 32, 3], 60, 20, 'Cutting edge', 'Steel edge at the bottom for sinking');
    s.lab('curb', [40, 15, 20], 60, -10, 'Well curb', 'Wedge-shaped RCC ring above the cutting edge');
    s.lab('plug', [0, 30, 20], -60, 30, 'Bottom plug', 'Concrete placed after sinking to founding level');
    s.lab('sand', [0, 30, 100], -60, 10, 'Sand filling', 'Fill inside the well');
    s.lab('plug', [0, 30, 156], -70, -20, 'Top plug', 'Concrete seal below the cap');
    s.lab('cap', [40, 30, 175], 60, -20, 'Well cap', 'RCC cap carrying the pier');
    s.lab('pier', [0, 40, 230], 40, -20, 'Pier', 'Bridge pier');
    s.lab('none', [70, 0, 120], 40, 20, 'Bed / scour level', 'Well taken well below the maximum scour depth');
    return s;
  });

  // ======================= IRRIGATION & EARTHWORK =======================
  def('retaining_wall', 'Cantilever retaining wall (section at the end)', {
    weep: /weep/i, filter: /filter|graded|gravel|inverted filter/i, backfill: /back ?fill|filling/i, wall: /retaining|wall|stem|concrete|masonry/i
  }, 'wall', function () {
    var s = S({ az: 30, el: 24 });
    s.pill = { wall: 'Retaining wall', weep: 'Weep holes', filter: 'Filter media', backfill: 'Backfill' };
    s.prism('x', [[-90, 0], [-12, 0], [-12, 160], [-90, 160]], 0, 140, { c: M.soil, k: 'backfill' });
    s.prism('x', [[-12, 16], [0, 16], [0, 150], [-12, 150]], 0, 140, { c: M.gravel, k: 'filter' });
    s.prism('x', [[-90, 0], [50, 0], [50, 16], [-90, 16]], 0, 140, { c: M.concrete, k: 'wall' });
    s.prism('x', [[0, 16], [20, 16], [16, 160], [6, 160]], 0, 140, { c: M.conc2, k: 'wall' });
    s.prism('x', [[20, 16], [140, 16], [140, 22], [20, 22]], 0, 140, { c: M.grass, k: 'ground' });
    [25, 65, 105].forEach(function (x) { s.pipe('y', [x, 0, 40], 2.5, 20, { c: M.pvc, k: 'weep' }, 2); s.pipe('y', [x + 20, 0, 90], 2.5, 18, { c: M.pvc, k: 'weep' }, 2); });
    s.lab('wall', [140, 13, 100], 60, -30, 'Stem', 'Vertical wall, thicker at the base');
    s.lab('wall', [140, 40, 8], 60, 20, 'Toe', 'Base slab in front of the stem');
    s.lab('wall', [140, -60, 8], -60, 40, 'Heel', 'Base slab under the retained earth');
    s.lab('backfill', [70, -50, 160], -50, -40, 'Backfill', 'Retained earth, compacted in layers');
    s.lab('filter', [140, -6, 120], -60, -20, 'Filter media', 'Graded gravel behind the wall');
    s.lab('weep', [85, 18, 90], 40, -40, 'Weep holes', 'Pipes that drain water from behind the wall');
    return s;
  });

  def('embankment', 'Earthen embankment / canal bank', {
    turf: /turf|grass|sodding|pitching/i, borrow: /borrow/i, compact: /compact|consolidat|roller|layer/i, earth: /earth|embankment|bank|filling|excavat/i
  }, 'earth', function () {
    var s = S({ az: 30, el: 26 });
    s.pill = { earth: 'Earthwork in embankment', turf: 'Turfing', compact: 'Compaction in layers', borrow: 'Borrow area' };
    s.box(0, -150, -12, 160, 300, 12, { c: M.soil2, k: 'ground' });
    s.prism('x', [[-110, 0], [110, 0], [40, 50], [-40, 50]], 0, 160, { c: M.soil, k: 'earth' });
    for (var z = 10; z < 50; z += 10) s.line([[160.2, -110 + z * 1.4, z], [160.2, 110 - z * 1.4, z]], { c: '#7a5a3a', w: 0.8, k: 'compact' });
    s.hexa([[0, 40, 50], [160, 40, 50], [160, 110, 0], [0, 110, 0], [0, 40, 51.5], [160, 40, 51.5], [160, 112, 0.6], [0, 112, 0.6]], { c: M.grass, k: 'turf' });
    s.box(0, -40, 50, 160, 80, 3, { c: M.gravel, k: 'top' });
    s.hexa([[20, 120, -12], [120, 120, -12], [110, 140, -12], [30, 140, -12], [20, 120, -1], [120, 120, -1], [110, 140, -11.5], [30, 140, -11.5]], { c: '#6f5136', k: 'borrow' });
    s.lab('earth', [160, -60, 20], 60, 30, 'Embankment body', 'Earth filled and compacted in layers');
    s.lab('compact', [160, 30, 30], 70, -10, 'Layers', 'Placed in 150-300 mm layers, watered and rolled');
    s.lab('turf', [80, 80, 26], -50, 60, 'Turfing on slope', 'Protects the side slope from erosion');
    s.lab('top', [80, 0, 53], -20, -60, 'Top width / service road', 'As per design section');
    s.lab('borrow', [70, 135, -10], 40, 40, 'Borrow area', 'Earth taken from here (lead as per item)');
    return s;
  });

  def('canal_lining', 'Lined canal section', {
    joint: /joint|sealing|seal/i, lining: /lining|tile|slab|panel|brick on edge|concrete|\bc\.?c\.?\b|geomembrane|membrane/i, earth: /earth|excavat|bank|embankment|section/i
  }, 'lining', function () {
    var s = S({ az: 24, el: 40 });
    s.pill = { lining: 'Canal lining', joint: 'Lining joints', earth: 'Canal earthwork' };
    s.prism('y', [[-160, -80], [-30, -80], [-30, -60], [-100, 0], [-160, 0]], 0, 150, { c: M.soil, k: 'earth' });
    s.prism('y', [[30, -80], [160, -80], [160, 0], [100, 0], [30, -60]], 0, 150, { c: M.soil, k: 'earth' });
    s.box(-30, 0, -80, 60, 150, 18, { c: M.soil, k: 'earth' });
    s.box(-160, 0, 0, 60, 150, 2, { c: M.grass, k: 'ground' });
    s.box(100, 0, 0, 60, 150, 3, { c: M.gravel, k: 'road' });
    s.group(function () {
      for (var y = 0; y < 150; y += 30) {
        s.hexa([[-100, y, 0], [-100, y + 29.5, 0], [-30, y + 29.5, -60], [-30, y, -60], [-100, y, 3], [-100, y + 29.5, 3], [-30, y + 29.5, -57], [-30, y, -57]], { c: M.conc2, k: 'lining' });
        s.hexa([[100, y, 0], [100, y + 29.5, 0], [30, y + 29.5, -60], [30, y, -60], [100, y, 3], [100, y + 29.5, 3], [30, y + 29.5, -57], [30, y, -57]], { c: M.conc2, k: 'lining' });
        s.box(-30, y, -62, 60, 29.5, 5, { c: M.conc2, k: 'lining' });
      }
    });
    for (var yj = 29.75; yj < 150; yj += 30) s.line([[-100, yj, 3.1], [-30, yj, -56.9], [30, yj, -56.9], [100, yj, 3.1]], { c: '#2e3338', w: 1.6, k: 'joint' });
    s.prism('y', [[-68, -22], [68, -22], [33, -57], [-33, -57]], 0, 150, { c: '#6fb6e0', k: 'water', op: 0.38 });
    s.lab('lining', [-70, 100, -22], -60, -50, 'Side lining', 'CC / tile / brick lining on the slopes');
    s.lab('lining', [0, 150, -57], -40, 50, 'Bed lining', 'Lining on the canal bed');
    s.lab('joint', [65, 89.75, -20], 70, -40, 'Joints', 'Expansion / contraction joints, sealed');
    s.lab('water', [40, 150, -22], 60, -10, 'Full supply level', 'Water in the canal');
    s.lab('earth', [130, 150, -50], 50, 30, 'Bank / earthwork', 'Excavation and banking to section (separate items)');
    s.lab('road', [130, 100, 3], 40, -50, 'Service road / berm', 'Inspection path on the bank');
    return s;
  });

  def('gabion', 'Gabion (wire-mesh boxes filled with stones)', {
    gabion: /gabion|crate|wire ?(net|mesh)|mattress/i, stone: /stone|boulder|filling/i
  }, 'gabion', function () {
    var s = S({ az: 30, el: 24 }), R = rng(11);
    s.pill = { gabion: 'Gabion / wire crate', stone: 'Stone filling' };
    function crate(x, y, z, dx, dy, dz) {
      s.box(x, y, z, dx, dy, dz, { c: '#9a948a', k: 'stone' });
      var X = x + dx, Y = y + dy, Z = z + dz, i, j;
      for (i = 0; i < 26; i++) {   // stones on the front face
        var cx = x + 4 + R() * (dx - 8), cz = z + 4 + R() * (dz - 8), r = 3 + R() * 3;
        s.plane([[cx - r, Y + 0.3, cz - r * 0.7], [cx + r * 0.8, Y + 0.3, cz - r], [cx + r, Y + 0.3, cz + r * 0.6], [cx - r * 0.6, Y + 0.3, cz + r * 0.9]], { c: R() > 0.5 ? M.stone : '#c2bab0', k: 'stone' });
      }
      for (i = 0; i < 10; i++) { var cy = y + 4 + R() * (dy - 8), cz2 = z + 4 + R() * (dz - 8), q = 3 + R() * 3;
        s.plane([[X + 0.3, cy - q, cz2 - q * 0.7], [X + 0.3, cy + q * 0.8, cz2 - q], [X + 0.3, cy + q, cz2 + q * 0.6], [X + 0.3, cy - q * 0.6, cz2 + q * 0.9]], { c: R() > 0.5 ? M.stone : '#c2bab0', k: 'stone' }); }
      var w = { c: '#5d6976', w: 0.9, k: 'gabion' };
      for (i = -dz + 3; i < dx; i += 7) s.line([i >= 0 ? [x + i, Y + 0.6, z] : [x, Y + 0.6, z - i], i + dz <= dx ? [x + i + dz, Y + 0.6, Z] : [X, Y + 0.6, z + dx - i]], w);
      for (i = 0; i < dx + dz; i += 7) s.line([[Math.min(X, x + i), Y + 0.6, Math.max(z, z + i - dx)], [Math.max(x, x + i - dz), Y + 0.6, Math.min(Z, z + i)]], w);
      for (j = 0; j < dy + dx; j += 7) s.line([[Math.min(X, x + j), Math.max(y, y + j - dx), Z + 0.6], [Math.max(x, x + j - dy), Math.min(Y, y + j), Z + 0.6]], w);
      s.line([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z], [x, Y, z]], { c: '#3f4a55', w: 1.8, k: 'gabion' });
      s.line([[X, y, z], [X, y, Z], [X, Y, Z]], { c: '#3f4a55', w: 1.8, k: 'gabion' }); s.line([[x, y, Z], [X, y, Z]], { c: '#3f4a55', w: 1.8, k: 'gabion' }); s.line([[x, y, Z], [x, Y, Z]], { c: '#3f4a55', w: 1.8, k: 'gabion' });
    }
    s.box(-20, -20, -6, 200, 100, 6, { c: M.soil, k: 'ground' });
    crate(0, 0, 0, 80, 50, 50); crate(80, 0, 0, 80, 50, 50); crate(40, -10, 50, 80, 50, 45);
    s.lab('gabion', [120, 50, 40], 60, 20, 'Wire mesh box', 'Galvanised / PVC-coated wire mesh crate');
    s.lab('stone', [40, 50, 20], -50, 40, 'Stone filling', 'Hand-packed boulders, larger than the mesh opening');
    s.lab('gabion', [80, 40, 95], 40, -40, 'Lacing / tie wires', 'Boxes laced together and to each other');
    return s;
  });

  def('sluice_gate', 'Sluice / regulator gate', {
    hoist: /hoist|spindle|screw|gear|head ?stock|wheel|lifting/i, groove: /groove|guide|seal|rubber|embedded/i, gate: /gate|shutter|skin plate|leaf/i, pier: /pier|wall|abutment|masonry|concrete/i
  }, 'gate', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { gate: 'Gate (shutter)', hoist: 'Hoist / lifting gear', groove: 'Gate grooves & seals' };
    s.box(-40, -60, -12, 240, 160, 12, { c: M.concrete, k: 'floor' });
    s.box(-30, -60, 0, 30, 140, 150, { c: M.concrete, k: 'pier' });
    s.box(0, -60, 0, 160, 60, 95, { c: M.water, k: 'water', op: 0.4 });
    s.box(-4, 10, 0, 4, 10, 150, { c: M.steel2, k: 'groove' }); s.box(160, 10, 0, 4, 10, 150, { c: M.steel2, k: 'groove' });
    s.box(0, 12, 20, 160, 3, 110, { c: '#6f8aa3', k: 'gate' });
    [32, 58, 84, 110].forEach(function (z) { s.box(0, 15, z, 160, 4, 4, { c: '#5b748c', k: 'gate' }); });
    [40, 120].forEach(function (x) { s.box(x - 2, 15, 20, 4, 4, 110, { c: '#5b748c', k: 'gate' }); });
    s.box(0, 20, 0, 160, 60, 30, { c: M.water, k: 'water', op: 0.4 });
    s.box(-30, 80, 150, 220, 0, 0, { c: M.concrete });
    s.box(-30, -10, 150, 220, 50, 12, { c: M.concrete, k: 'deck' });
    s.cyl('z', [80, 16, 130], 3, 70, { c: M.steel, k: 'hoist' }, 12);
    s.box(66, 4, 162, 28, 24, 16, { c: '#3f5872', k: 'hoist' });
    s.cyl('y', [80, 28, 186], 14, 3, { c: '#b54b2a', k: 'hoist' }, 26);
    s.box(160, -60, 0, 30, 140, 150, { c: M.concrete, k: 'pier' });
    s.lab('gate', [100, 19, 70], 70, 50, 'Gate leaf', 'Steel skin plate with horizontal girders and stiffeners');
    s.lab('groove', [-2, 20, 60], -60, 20, 'Gate groove', 'Embedded guides with rubber seals');
    s.lab('hoist', [80, 30, 186], 50, -40, 'Hoist & spindle', 'Screw / rope hoist on the headstock, hand-wheel or motor');
    s.lab('pier', [175, 80, 100], 50, 0, 'Pier / abutment', 'Concrete / masonry with the grooves');
    s.lab('water', [40, -40, 95], -50, -40, 'Upstream water', 'Held back when the gate is lowered');
    s.lab('deck', [20, 30, 162], -60, -20, 'Hoist platform', 'Deck over the piers');
    return s;
  });

  window.DIAGRAMS_READY = true;
})();
