// More drawings (Oct 2026): rolling shutter, boundary wall & gate, staircase, water-supply pipes, sanitary
// fittings, overhead tank, wall tiling, lintel & chajja, pitching, bank protection, culvert, tube well, fencing.
// Same rules as diagrams.js: the part matching the item is drawn in orange and labelled "this item".
(function () {
  'use strict';
  var K = window.DiagramKit; if (!K) return;
  var M = K.M, def = K.def;
  function S(o) { return new K.Scene(o); }

  // ---------------- rolling shutter ----------------
  def('rolling_shutter', 'Rolling shutter in a shop / garage opening', {
    slat: /\blaths?\b|\bslats?\b/i, gear: /gear|ball bearing|bearing|crank|motor|mechanical/i, hood: /hood|box cover|top cover/i,
    guide: /guide|channel/i, lock: /\block|bottom (rail|bar)/i
  }, 'slat', function () {
    var s = S({ az: 24, el: 14 });
    s.pill = { slat: 'Rolling shutter', guide: 'Guide channels', hood: 'Hood cover', gear: 'Gear / spring box', lock: 'Bottom rail & lock' };
    s.box(-60, -20, -4, 320, 90, 4, { c: M.floor });
    s.box(-45, 0, 0, 45, 25, 270, { c: M.plaster });
    s.box(200, 0, 0, 45, 25, 270, { c: M.plaster });
    s.box(0, 0, 225, 200, 25, 45, { c: M.plaster });
    s.box(-6, 25, 0, 8, 7, 228, { c: M.steel2, k: 'guide' });
    s.box(198, 25, 0, 8, 7, 228, { c: M.steel2, k: 'guide' });
    s.group(function () {
      for (var z = 70; z < 226; z += 6.5) s.box(0, 27, z, 200, 2.4, 6, { c: (Math.round(z / 6.5) % 2) ? '#a7b1bb' : '#93a0ab', k: 'slat' });
    });
    s.box(0, 26, 62, 200, 5, 8, { c: M.steel2, k: 'lock' });
    s.box(96, 31, 63, 8, 2, 6, { c: M.brass, k: 'lock' });
    s.cyl('x', [0, 38, 244], 17, 200, { c: '#b9c2ca', k: 'hood' }, 26);
    s.box(206, 26, 228, 16, 22, 30, { c: '#5d6b78', k: 'gear' });
    s.lab('slat', [150, 29, 150], 80, -10, 'Shutter laths', 'Interlocking steel laths, thickness / gauge as per item');
    s.lab('guide', [202, 32, 110], 70, 30, 'Guide channels', 'Steel channels fixed to the jambs');
    s.lab('hood', [60, 50, 252], -60, -40, 'Hood cover', 'Covers the rolled-up shutter and spring');
    s.lab('gear', [214, 40, 244], 60, -30, 'Spring / gear box', 'Spring, ball-bearing or gear mechanism (check if in the item)');
    s.lab('lock', [100, 33, 66], -70, 40, 'Bottom rail & lock', 'Bottom rail with locking arrangement');
    return s;
  });

  // ---------------- boundary wall with gate and railing ----------------
  def('boundary_wall', 'Boundary wall with pillars, MS railing and gate', {
    gate: /\bgates?\b|collapsible/i, railing: /railing|grill|grille|ms (flat|square|bar)|m\.s\.? (flat|square|bar)/i, coping: /coping/i,
    pillar: /pillar|pier/i, found: /foundation|footing/i, wall: /boundary wall|compound wall|brick|wall/i
  }, 'wall', function () {
    var s = S({ az: 30, el: 18 });
    s.pill = { wall: 'Boundary wall', gate: 'MS gate', railing: 'MS railing / grill', pillar: 'Pillars', coping: 'Coping', found: 'Foundation' };
    s.box(-20, -40, -6, 400, 110, 6, { c: M.grass });
    s.box(0, -6, -40, 230, 32, 40, { c: M.concrete, k: 'found', op: 0.55 });
    s.box(0, 0, 0, 230, 20, 70, { c: M.brick, k: 'wall' });
    s.box(-4, -3, 70, 238, 26, 7, { c: M.conc2, k: 'coping' });
    [0, 112, 224].forEach(function (x) { s.box(x - 8, -5, 0, 22, 30, 140, { c: M.brick2, k: 'pillar' }); s.box(x - 10, -7, 140, 26, 34, 6, { c: M.conc2, k: 'coping' }); });
    s.group(function () {
      [[14, 104], [126, 216]].forEach(function (seg) {
        s.box(seg[0], 8, 125, seg[1] - seg[0], 4, 3, { c: '#3d4a57', k: 'railing' });
        s.box(seg[0], 8, 82, seg[1] - seg[0], 4, 3, { c: '#3d4a57', k: 'railing' });
        for (var x = seg[0] + 6; x < seg[1]; x += 9) s.box(x, 9, 77, 2, 2, 50, { c: '#4c5a67', k: 'railing' });
      });
    });
    // gate between pillar at 224 and a free pillar at 350
    s.box(342, -5, 0, 22, 30, 140, { c: M.brick2, k: 'pillar' }); s.box(340, -7, 140, 26, 34, 6, { c: M.conc2, k: 'coping' });
    s.group(function () {
      s.box(238, 8, 6, 102, 4, 4, { c: '#2f5d50', k: 'gate' }); s.box(238, 8, 124, 102, 4, 4, { c: '#2f5d50', k: 'gate' });
      s.box(238, 8, 6, 4, 4, 122, { c: '#2f5d50', k: 'gate' }); s.box(336, 8, 6, 4, 4, 122, { c: '#2f5d50', k: 'gate' });
      s.box(242, 8, 62, 94, 4, 3, { c: '#2f5d50', k: 'gate' });
      for (var x = 250; x < 336; x += 10) s.box(x, 9, 10, 2, 2, 114, { c: '#3c7464', k: 'gate' });
    });
    s.lab('wall', [60, 20, 40], -60, 40, 'Boundary wall', 'Brick / block masonry wall');
    s.lab('found', [150, 26, -20], 40, 50, 'Foundation', 'Excavation, PCC and footing (separate items)');
    s.lab('coping', [180, 23, 74], 10, -60, 'Coping', 'Concrete / stone coping on top of the wall');
    s.lab('pillar', [112, 25, 110], -30, -70, 'Pillars', 'Brick or RCC pillars at intervals');
    s.lab('railing', [60, 12, 104], -80, -40, 'MS railing / grill', 'Flats / square bars welded, painted');
    s.lab('gate', [290, 12, 90], 70, -50, 'MS gate', 'Steel gate with frame, bars, hinges and locking (check item)');
    return s;
  });

  // ---------------- staircase ----------------
  def('staircase', 'RCC staircase: waist slab, steps, landing and railing', {
    handrail: /hand ?rail/i, railing: /railing|baluster|grill/i, nosing: /nosing|edging|treads?|risers?|kota|stone|marble|granite|tiles?/i,
    landing: /landing/i, waist: /stair|step|waist|r\.?c\.?c|concrete/i
  }, 'waist', function () {
    var s = S({ az: 52, el: 18 });
    s.pill = { waist: 'RCC stair (waist slab & steps)', railing: 'Railing', handrail: 'Handrail', nosing: 'Tread finish / nosing', landing: 'Landing' };
    var n = 9, R = 17, T = 27, W = 110;
    s.box(-40, -20, -4, n * T + 160, W + 60, 4, { c: M.floor });
    s.box(n * T, 0, n * R - 15, 120, W, 15, { c: M.conc2, k: 'landing' });
    s.box(n * T + 20, 0, 0, 22, 22, n * R - 15, { c: M.concrete, k: 'beam' });
    s.hexa([[0, 0, -2], [n * T, 0, n * R - 17], [n * T, W, n * R - 17], [0, W, -2], [0, 0, 13], [n * T, 0, n * R - 2], [n * T, W, n * R - 2], [0, W, 13]], { c: M.concrete, k: 'waist' });
    s.group(function () {
      for (var i = 0; i < n; i++) {
        s.prism('y', [[i * T, i * R], [(i + 1) * T, (i + 1) * R], [i * T, (i + 1) * R]], 0, W, { c: M.conc2, k: 'waist' });
        s.box(i * T - 2, 0, (i + 1) * R, T + 2, W, 2.5, { c: '#d6cdb9', k: 'nosing' });
      }
    });
    s.group(function () {
      for (var j = 0; j < n; j++) s.box(j * T + 12, 4, (j + 1) * R + 2, 2, 2, 85, { c: '#4c5a67', k: 'railing' });
    });
    s.hexa([[0, 2, R + 85], [n * T, 2, (n + 1) * R + 85], [n * T, 8, (n + 1) * R + 85], [0, 8, R + 85],
      [0, 2, R + 91], [n * T, 2, (n + 1) * R + 91], [n * T, 8, (n + 1) * R + 91], [0, 8, R + 91]], { c: M.wood, k: 'handrail' });
    s.lab('waist', [100, W, 40], 60, 50, 'Waist slab & steps', 'RCC waist slab with steps cast on it (concrete, steel, shuttering paid separately)');
    s.lab('nosing', [5 * T - 10, W / 2, 6 * R + 2], -40, -70, 'Tread finish', 'Stone / tile / kota on treads and risers, with nosing');
    s.lab('landing', [n * T + 80, W / 2, n * R], 60, -30, 'Landing', 'RCC landing slab');
    s.lab('railing', [3 * T + 12, 5, 4 * R + 40], -70, -20, 'Balusters / railing', 'MS / steel balusters');
    s.lab('handrail', [6 * T, 5, 7 * R + 88], -40, -50, 'Handrail', 'Wooden / steel / SS handrail');
    s.lab('beam', [n * T + 31, 22, 50], 60, 30, 'Landing beam', 'Supports the landing');
    return s;
  });

  // ---------------- water supply pipes & fittings ----------------
  def('water_pipe', 'Water supply pipe with fittings, valve and tap', {
    valve: /valve|stop ?cock|gate valve|ball valve|ball ?cock|full way/i, tap: /\btaps?\b|bib ?cock|pillar cock|push ?cock|faucet|mixer|shower/i,
    clamp: /clamp|hook|holder|clip/i, fitting: /^(?!.*\bpipes? (and|&) fittings?\b).*(?:elbow|\btees?\b|\bbends?\b|union|socket|coupl|reduc|fitting|nipple|\bplug|\bcaps?\b|flange|adapt|adopt|\bbush|solvent|\bcross\b(?! drainage)|jam ?nut|back nut|connector)/i,
    pipe: /pipe|g\.?i\.?|cpvc|ppr|hdpe|upvc|pvc|ms pipe/i
  }, 'pipe', function () {
    var s = S({ az: 32, el: 18 });
    s.pill = { pipe: 'Pipe', fitting: 'Fittings (elbow / tee / union)', valve: 'Valve', tap: 'Tap / bib cock', clamp: 'Clamps' };
    s.box(-20, 22, -10, 300, 10, 200, { c: M.plaster });
    s.box(-20, -40, -14, 300, 72, 4, { c: M.floor });
    var r = 4.2, y = 14;
    s.cyl('z', [20, y, 0], r, 150, { c: M.gi, k: 'pipe' });
    s.cyl('z', [20, y, 150], r + 1.6, 9, { c: '#c58c3a', k: 'fitting' });
    s.cyl('x', [26, y, 154], r, 110, { c: M.gi, k: 'pipe' });
    s.cyl('x', [70, y, 154], r + 1.6, 12, { c: '#c58c3a', k: 'fitting' });
    s.cyl('z', [76, y, 90], r, 64, { c: M.gi, k: 'pipe' });
    s.cyl('x', [136, y, 154], r + 2.2, 14, { c: '#b4362d', k: 'valve' });
    s.cyl('z', [143, y, 159], 1.4, 10, { c: '#6c757d', k: 'valve' });
    s.cyl('z', [143, y, 168], 9, 2, { c: '#b4362d', k: 'valve' }, 18);
    s.cyl('x', [150, y, 154], r, 90, { c: M.gi, k: 'pipe' });
    s.cyl('x', [200, y, 154], r + 2, 8, { c: '#c58c3a', k: 'fitting' });
    s.cyl('x', [240, y, 154], r + 1.6, 9, { c: '#c58c3a', k: 'fitting' });
    s.cyl('z', [244, y, 100], r, 54, { c: M.gi, k: 'pipe' });
    s.cyl('y', [244, y - 12, 96], r, 12, { c: '#d8dde2', k: 'tap' });
    s.box(241, y - 16, 84, 6, 6, 14, { c: '#d8dde2', k: 'tap' });
    s.box(236, y - 14, 108, 16, 4, 3, { c: '#d8dde2', k: 'tap' });
    s.cyl('x', [72, y, 82], r + 1.6, 8, { c: '#c58c3a', k: 'fitting' });
    [60, 120].forEach(function (z) { s.box(14, y - 6, z, 12, 14, 3, { c: '#6c757d', k: 'clamp' }); });
    s.box(180, y - 6, 149, 3, 14, 10, { c: '#6c757d', k: 'clamp' });
    s.lab('pipe', [20, y, 40], -60, 20, 'Pipe', 'GI / CPVC / PPR pipe, measured per metre along the centre line');
    s.lab('fitting', [20, y, 155], -50, -40, 'Elbow / tee / union', 'Fittings — included or extra as the item says');
    s.lab('valve', [143, y, 168], 10, -60, 'Valve', 'Gate / ball valve, paid per number');
    s.lab('tap', [244, y - 14, 98], 60, 30, 'Tap / bib cock', 'Paid per number');
    s.lab('clamp', [20, y - 6, 121], -60, -20, 'Clamps', 'Holder bats / clamps fixing the pipe to the wall');
    s.lab('wall', [220, 22, 40], 50, 40, 'Wall chase / surface', 'Pipe fixed on the wall or in a chase');
    return s;
  });

  // ---------------- sanitary fittings ----------------
  def('sanitary', 'Toilet: WC, cistern, wash basin and traps', {
    urinal: /urinal/i, cistern: /cistern|flushing|flush valve|flush pipe/i, seat: /\bseat\b/i,
    mirror: /mirror|towel|soap|shelf|grab|paper holder|\bring\b/i,
    wc: /\bw\.?\s?c\.?\b|water closet|commode|\bpans?\b|orissa|squatting|\bewc\b/i,
    trap: /trap|nahani|gully|floor drain|waste|\bplug\b|coupling|bottle/i,
    tap: /pillar cock|bib ?cock|\btaps?\b|faucet|\bjet\b|shower|mixer|stop ?cock|angle valve/i,
    basin: /wash ?basin|lavatory|basin|sink|drain(ing)? board/i
  }, 'wc', function () {
    var s = S({ az: 30, el: 24 });
    s.pill = { wc: 'Water closet (WC)', cistern: 'Flushing cistern', basin: 'Wash basin', tap: 'Tap / pillar cock', trap: 'Floor trap', mirror: 'Mirror / accessories', seat: 'WC seat & cover', urinal: 'Urinal' };
    function fr(cx, cy, z0, z1, r0, r1, o) {
      var n = 22, A = [], B = [];
      for (var i = 0; i < n; i++) { var t = i / n * 2 * Math.PI; A.push([cx + r0 * Math.cos(t), cy + r0 * 1.25 * Math.sin(t), z0]); B.push([cx + r1 * Math.cos(t), cy + r1 * 1.25 * Math.sin(t), z1]); }
      var f = [A, B]; for (var j = 0; j < n; j++) { var q = (j + 1) % n, sd = [A[j], A[q], B[q], B[j]]; sd.sm = true; f.push(sd); }
      s.solid(f, o);
    }
    s.box(0, 0, -4, 236, 120, 4, { c: '#d9dfe3' });
    for (var t = 0; t < 236; t += 24) s.box(t, 0, -0.1, 0.4, 120, 0.2, { c: '#b9c2c9' });
    s.box(0, -6, -4, 236, 6, 168, { c: '#e7ecef' });
    s.box(-6, -6, -4, 6, 126, 168, { c: '#dfe5e8' });
    // wall tiles band behind the fixtures
    s.box(0, -0.2, 0, 236, 0.4, 70, { c: '#eef2f4' });
    // urinal on the side wall
    s.box(0, 74, 48, 14, 26, 46, { c: M.white, k: 'urinal' }); s.box(13.8, 78, 54, 0.6, 18, 32, { c: '#e2e8ec', k: 'urinal' });
    s.cyl('z', [5, 87, 94], 1.6, 30, { c: '#c9ced3', k: 'urinal' }, 10);
    // WC: cistern on the wall, pan with seat and the lid up
    s.box(46, 0, 46, 48, 16, 34, { c: M.white, k: 'cistern' }); s.box(46, 0, 80, 48, 17, 3, { c: '#eef1f3', k: 'cistern' });
    s.cyl('z', [70, 9, 83], 3, 1.5, { c: '#c9ced3', k: 'cistern' }, 12);
    s.box(58, 0, 18, 24, 22, 20, { c: M.white, k: 'wc' });
    fr(70, 40, 0, 22, 9, 8, { c: M.white, k: 'wc' });
    fr(70, 40, 22, 36, 11, 15, { c: M.white, k: 'wc' });
    s.box(56, 16, 36, 28, 3, 32, { c: '#eef1f3', k: 'seat' });
    fr(70, 40, 36, 38.5, 15.5, 15.5, { c: '#eef1f3', k: 'seat' });
    fr(70, 41, 38.6, 38.9, 10, 10, { c: '#bfd6e2', k: 'wc' });
    // wash basin with pillar cock, bottle trap and mirror
    s.box(150, 0, 110, 56, 2, 42, { c: '#8f9aa3', k: 'mirror' }); s.box(152, 1.8, 112, 52, 0.6, 38, { c: '#bcd3e0', k: 'mirror' });
    s.box(156, 0, 60, 4, 30, 4, { c: '#b9c0c7', k: 'basin' }); s.box(196, 0, 60, 4, 30, 4, { c: '#b9c0c7', k: 'basin' });
    s.cyl('z', [178, 18, 30], 2.4, 46, { c: '#c9ced3', k: 'trap' }, 12); s.cyl('z', [178, 18, 36], 5, 12, { c: '#d8dde2', k: 'trap' }, 14);
    s.cyl('y', [178, 0, 32], 2.4, 18, { c: '#c9ced3', k: 'trap' }, 12);
    s.box(150, 0, 76, 56, 36, 12, { c: M.white, k: 'basin' }); s.box(156, 6, 87.6, 44, 26, 0.6, { c: '#c7d8e0', k: 'basin' });
    s.cyl('z', [178, 6, 88], 2.4, 13, { c: '#d8dde2', k: 'tap' }, 12); s.box(176.5, 6, 98, 3, 11, 2.4, { c: '#d8dde2', k: 'tap' }); s.cyl('z', [178, 6, 101], 4, 2, { c: '#b9c0c7', k: 'tap' }, 12);
    // floor trap with grating
    s.cyl('z', [120, 84, 0], 9, 0.8, { c: '#8d969e', k: 'trap' }, 20);
    for (var g = -6; g <= 6; g += 3) s.box(120 + g - 0.5, 77, 0.8, 1, 14, 0.3, { c: '#5d666e', k: 'trap' });
    s.lab('urinal', [7, 87, 80], -40, -40, 'Urinal', 'Wall-hung urinal with flush valve');
    s.lab('wc', [70, 52, 26], -50, 45, 'Water closet', 'EWC / Indian pan, with P / S trap');
    s.lab('seat', [70, 18, 60], -40, -40, 'Seat & cover', 'Plastic seat with lid (often a separate item)');
    s.lab('cistern', [80, 8, 70], 10, -60, 'Flushing cistern', 'Low / high level cistern with flush pipe');
    s.lab('basin', [195, 30, 82], 50, 10, 'Wash basin', 'With brackets, waste and pillar tap (check item)');
    s.lab('tap', [178, 12, 100], 25, -50, 'Pillar cock', 'Tap on the basin');
    s.lab('trap', [178, 22, 42], 40, 45, 'Waste & bottle trap', 'Waste pipe to the floor trap');
    s.lab('trap', [120, 84, 1], 10, 50, 'Floor trap', 'Nahani trap with grating');
    s.lab('mirror', [160, 2, 140], -30, -40, 'Mirror', 'Accessories are separate items');
    return s;
  });

  // ---------------- overhead water tank ----------------
  def('water_tank', 'Overhead water tank on the roof', {
    platform: /platform|\bstand\b|pedestal|brick ?work/i, overflow: /overflow/i, valve: /ball ?(valve|cock)|polythene ball|float/i,
    tank: /tank|reservoir|cistern|storage|sintex|polyethylene|ferro/i
  }, 'tank', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { tank: 'Water tank', platform: 'Tank platform', overflow: 'Overflow pipe', valve: 'Ball valve / inlet' };
    s.box(-60, -60, -10, 280, 220, 10, { c: M.conc2, k: 'roof' });
    s.box(-60, -60, 0, 280, 8, 40, { c: M.plaster });
    s.box(10, 20, 0, 120, 120, 26, { c: M.brick, k: 'platform' });
    s.box(6, 16, 26, 128, 128, 6, { c: M.concrete, k: 'platform' });
    s.cyl('z', [70, 80, 32], 52, 108, { c: '#2b3036', k: 'tank' }, 36);
    s.cyl('z', [70, 80, 140], 20, 6, { c: '#3a4047', k: 'tank' }, 24);
    s.cyl('x', [120, 80, 128], 3, 50, { c: M.gi, k: 'valve' });
    s.cyl('z', [170, 80, 0], 3, 128, { c: M.gi, k: 'valve' });
    s.cyl('x', [120, 60, 120], 3, 70, { c: '#e8ebee', k: 'overflow' });
    s.cyl('y', [70, 132, 50], 3, 40, { c: M.gi, k: 'outlet' });
    s.lab('tank', [30, 50, 100], -70, -20, 'Water tank', 'Polyethylene / ferro-cement / RCC tank, capacity in litres');
    s.lab('platform', [70, 140, 15], -40, 50, 'Tank platform', 'Brick / RCC stand (separate items)');
    s.lab('valve', [170, 80, 60], 60, -10, 'Inlet with ball valve', 'Rising main from the pump');
    s.lab('overflow', [190, 60, 120], 60, -40, 'Overflow pipe', 'Discharges surplus water');
    s.lab('outlet', [70, 172, 50], 40, 40, 'Outlet to taps', 'Down-take pipe with valve');
    return s;
  });

  // ---------------- wall tiling / dado ----------------
  def('wall_tiles', 'Wall tiles (dado) on a toilet / kitchen wall', {
    skirting: /skirting/i, grout: /grout|pointing/i, tile: /tile|dado|cladding|granite|marble|stone/i, bed: /mortar|adhesive|\bbed\b/i
  }, 'tile', function () {
    var s = S({ az: 34, el: 18 });
    s.pill = { tile: 'Wall tiles (dado)', bed: 'Mortar / adhesive bed', grout: 'Joints / grout', skirting: 'Skirting' };
    s.box(-10, -60, -4, 220, 120, 4, { c: '#cfc6b4' });
    s.box(0, 0, 0, 200, 23, 220, { c: '#b9b2a6', k: 'wall' });
    s.box(0, -1.5, 120, 200, 1.5, 100, { c: M.plaster, k: 'plaster' });
    s.box(30, -1.5, 0, 170, 1.5, 120, { c: '#b8b0a2', k: 'bed' });
    s.group(function () {
      for (var x = 60; x < 200; x += 30) for (var z = 0; z < 120; z += 30) s.box(x + 0.5, -3.5, z + 0.5, 29, 2, 29, { c: ((x / 30 + z / 30) % 2) ? '#e8eef2' : '#dde6ec', k: 'tile' });
    });
    for (var gx = 60; gx <= 200; gx += 30) s.line([[gx, -3.6, 0], [gx, -3.6, 120]], { c: '#9aa4ac', w: 0.8, k: 'grout' });
    for (var gz = 30; gz <= 120; gz += 30) s.line([[60, -3.6, gz], [200, -3.6, gz]], { c: '#9aa4ac', w: 0.8, k: 'grout' });
    s.box(0, -3.5, 0, 30, 2, 12, { c: '#d9cfbd', k: 'skirting' });
    s.lab('tile', [150, -4, 80], 70, -10, 'Wall tiles', 'Ceramic / vitrified tiles up to dado height');
    s.lab('bed', [45, -2, 80], -60, -30, 'Bed', 'Cement mortar / tile adhesive behind the tiles');
    s.lab('grout', [120, -4, 30], 60, 50, 'Joints', 'Grouted with white / matching cement');
    s.lab('skirting', [15, -4, 6], -50, 40, 'Skirting', 'Tile / stone skirting at the floor');
    s.lab('wall', [100, 10, 180], 40, -40, 'Wall / plaster above', 'Plaster and paint above the dado (separate items)');
    return s;
  });

  // ---------------- lintel and chajja ----------------
  def('lintel_chajja', 'RCC lintel and chajja (sunshade) over a window', {
    chajja: /chajja|chhajja|sunshade|sun shade|weather shade|canopy/i, lintel: /lintel/i, sill: /sill/i, wall: /brick|masonry|wall/i
  }, 'lintel', function () {
    var s = S({ az: 28, el: 16 });
    s.pill = { lintel: 'RCC lintel', chajja: 'Chajja (sunshade)', sill: 'Window sill', wall: 'Masonry wall' };
    s.box(-80, -10, -4, 360, 80, 4, { c: M.floor });
    s.box(-60, 0, 0, 60, 25, 230, { c: M.plaster, k: 'wall' });
    s.box(200, 0, 0, 60, 25, 230, { c: M.plaster, k: 'wall' });
    s.box(0, 0, 0, 200, 25, 80, { c: M.plaster, k: 'wall' });
    s.box(-20, 0, 175, 240, 25, 30, { c: M.concrete, k: 'lintel' });
    s.box(0, 0, 205, 200, 25, 25, { c: M.plaster, k: 'wall' });
    s.hexa([[-20, 25, 196], [220, 25, 196], [220, 68, 199], [-20, 68, 199], [-20, 25, 206], [220, 25, 206], [220, 68, 203], [-20, 68, 203]], { c: M.concrete, k: 'chajja' });
    s.box(-4, -2, 80, 208, 30, 5, { c: '#c9c1ae', k: 'sill' });
    s.box(0, 6, 85, 200, 10, 90, { c: M.wood2, k: 'window' });
    s.box(10, 9, 95, 85, 4, 70, { c: M.glass, k: 'window' }); s.box(105, 9, 95, 85, 4, 70, { c: M.glass, k: 'window' });
    s.lab('lintel', [180, 25, 182], 80, 10, 'RCC lintel', 'Over the opening, bearing on the walls each side');
    s.lab('chajja', [60, 60, 201], -60, -60, 'Chajja', 'RCC sunshade cast with the lintel, sloped to drain');
    s.lab('sill', [100, 28, 82], 30, 60, 'Sill', 'Concrete / stone sill below the window');
    s.lab('wall', [-30, 25, 120], -60, 20, 'Masonry wall', 'Wall around the opening');
    s.lab('window', [140, 13, 130], 70, 30, 'Window', 'Frame and shutters (separate items)');
    return s;
  });

  // ---------------- slope pitching with toe wall / apron ----------------
  def('pitching', 'Pitching on a river / canal bank with filter, toe wall and apron', {
    toe: /toe wall/i, apron: /apron|launching/i, pitch: /pitching|revetment|concrete blocks|tetrapod/i,
    filter: /filter|khoa|geo.?textile|back ?filling/i
  }, 'pitch', function () {
    var s = S({ az: -32, el: 26 });
    s.pill = { pitch: 'Slope pitching', filter: 'Filter layer', toe: 'Toe wall', apron: 'Launching apron' };
    s.prism('y', [[-60, -80], [140, -80], [140, 40], [100, 40], [-20, -40], [-60, -40]], 0, 160, { c: M.soil, k: 'bank' });
    s.box(100, 0, 40, 40, 160, 3, { c: M.grass, k: 'bank' });
    s.hexa([[-20, 0, -40], [-20, 160, -40], [100, 160, 40], [100, 0, 40], [-26, 0, -36], [-26, 160, -36], [94, 160, 44], [94, 0, 44]], { c: M.sand, k: 'filter' });
    s.group(function () {
      for (var i = 0; i < 6; i++) for (var j = 0; j < 8; j++) {
        var u = i / 6, v = j * 20;
        var x0 = -26 + 120 * u, z0 = -36 + 80 * u, x1 = -26 + 120 * (u + 1 / 6), z1 = -36 + 80 * (u + 1 / 6);
        s.hexa([[x0, v + 1, z0], [x0, v + 19, z0], [x1, v + 19, z1], [x1, v + 1, z1], [x0 - 6, v + 1, z0 + 5], [x0 - 6, v + 19, z0 + 5], [x1 - 6, v + 19, z1 + 5], [x1 - 6, v + 1, z1 + 5]],
          { c: ((i + j) % 3) ? M.stone : M.stone2, k: 'pitch' });
      }
    });
    s.box(-48, 0, -62, 26, 160, 34, { c: M.concrete, k: 'toe' });
    s.group(function () {
      for (var a = 0; a < 4; a++) for (var b = 0; b < 8; b++) s.box(-130 + a * 20, b * 20 + 2, -46, 18, 16, 8 + ((a + b) % 3) * 2, { c: ((a + b) % 2) ? M.stone : M.stone2, k: 'apron' });
    });
    s.box(-140, 0, -50, 100, 160, 2, { c: '#b9c4b0', k: 'bed' });
    s.prism('y', [[-160, -48], [-40, -48], [-40, -30], [-160, -30]], 0, 160, { c: M.water, k: 'water', op: 0.15 });
    s.lab('pitch', [40, 120, 10], 60, -60, 'Pitching', 'Boulder / brick / CC block pitching on the slope');
    s.lab('filter', [70, 0, 22], 60, 30, 'Filter layer', 'Graded khoa / chips / sand or geotextile under the pitching');
    s.lab('toe', [-35, 0, -40], -10, 60, 'Toe wall', 'Supports the pitching at the bottom');
    s.lab('apron', [-100, 60, -40], -60, -50, 'Launching apron', 'Loose boulders that fall into scour holes');
    s.lab('bank', [120, 160, 20], 50, 30, 'Bank / embankment', 'Earthwork (separate item)');
    s.lab('water', [-100, 160, -30], -40, 40, 'River / canal water', '');
    return s;
  });

  // ---------------- bank protection: geo-bags & porcupines ----------------
  def('bank_protection', 'River bank protection: geo-bags and bamboo porcupines', {
    bag: /geo.?bags?|sand ?bags?|\bbags?\b|gunny|geo.?tube/i, porcupine: /porcupine|bamboo|ballah|bullah|jhaw|eucalyptus|\bpins?\b|wailing|dip trees?|darma|\bmats?\b|brush ?wood|screen|spur/i, bank: /earth|bank|embankment/i
  }, 'bag', function () {
    var s = S({ az: 26, el: 26 });
    s.pill = { bag: 'Sand / geo-bags', porcupine: 'Bamboo porcupines' };
    s.prism('y', [[-30, -60], [140, -60], [140, 40], [90, 40], [-30, -40]], 0, 170, { c: M.soil, k: 'bank' });
    s.box(90, 0, 40, 50, 170, 3, { c: M.grass, k: 'bank' });
    s.box(-170, 0, -62, 140, 170, 2, { c: '#7d8f9c', k: 'bed' });
    s.group(function () {
      for (var r = 0; r < 4; r++) for (var c = 0; c < 9; c++) {
        var x = -40 + r * 16 + (c % 2) * 4, z = -58 + r * 9;
        s.box(x, c * 19 + 1, z, 22, 17, 9, { c: (c + r) % 2 ? '#d9c8a0' : '#cbb88c', k: 'bag' });
      }
    });
    function pole(a, b, k) { s.hexa([[a[0] - 1.2, a[1] - 1.2, a[2]], [a[0] + 1.2, a[1] - 1.2, a[2]], [a[0] + 1.2, a[1] + 1.2, a[2]], [a[0] - 1.2, a[1] + 1.2, a[2]], [b[0] - 1.2, b[1] - 1.2, b[2]], [b[0] + 1.2, b[1] - 1.2, b[2]], [b[0] + 1.2, b[1] + 1.2, b[2]], [b[0] - 1.2, b[1] + 1.2, b[2]]], { c: '#c8a85a', k: k }); }
    s.group(function () {
      [[-120, 30], [-120, 110], [-80, 70], [-80, 150]].forEach(function (p) {
        var x = p[0], y = p[1], z = -60;
        pole([x - 20, y - 20, z], [x + 20, y + 20, z + 34], 'porcupine'); pole([x + 20, y - 20, z], [x - 20, y + 20, z + 34], 'porcupine');
        pole([x - 20, y + 20, z], [x + 20, y - 20, z + 34], 'porcupine'); pole([x - 22, y, z + 8], [x + 22, y, z + 8], 'porcupine');
      });
    });
    s.prism('y', [[-180, -60], [-30, -60], [-30, -30], [-180, -30]], 0, 170, { c: M.water, k: 'water', op: 0.28 });
    s.lab('bag', [-20, 170, -40], 40, 50, 'Geo-bags / sand bags', 'Filled bags laid at the toe and on the slope');
    s.lab('porcupine', [-80, 70, -40], -60, -60, 'Porcupines', 'Bamboo / RCC porcupines to slow the current and trap silt');
    s.lab('bank', [110, 170, 20], 40, 30, 'River bank', 'Eroding bank being protected');
    s.lab('water', [-150, 170, -40], -40, 30, 'River flow', '');
    return s;
  });

  // ---------------- RCC box / slab culvert ----------------
  def('box_culvert', 'RCC box culvert under a road', {
    wing: /wing|return|head ?wall|curtain/i, apron: /apron|floor|bed/i, wearing: /wearing|crash barrier|parapet|railing/i,
    box: /box|slab culvert|culvert|barrel|r\.?c\.?c|concrete/i
  }, 'box', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { box: 'RCC box (barrel)', wing: 'Wing walls', apron: 'Apron / floor', wearing: 'Wearing coat & parapet' };
    s.prism('x', [[-120, 0], [120, 0], [70, 80], [-70, 80]], -60, 200, { c: M.soil, k: 'emb', op: 0.85 });
    s.box(-60, -70, 80, 260, 140, 6, { c: M.bitumen, k: 'road' });
    s.box(0, -90, -6, 140, 180, 6, { c: M.concrete, k: 'apron' });
    s.box(0, -70, 0, 140, 140, 12, { c: M.conc2, k: 'box' });
    s.box(0, -70, 12, 12, 140, 56, { c: M.conc2, k: 'box' });
    s.box(128, -70, 12, 12, 140, 56, { c: M.conc2, k: 'box' });
    s.box(0, -70, 68, 140, 140, 12, { c: M.conc2, k: 'box' });
    s.hexa([[-6, 70, 0], [0, 70, 0], [-40, 130, 0], [-46, 130, 0], [-6, 70, 80], [0, 70, 80], [-40, 130, 20], [-46, 130, 20]], { c: M.concrete, k: 'wing' });
    s.hexa([[140, 70, 0], [146, 70, 0], [186, 130, 0], [180, 130, 0], [140, 70, 80], [146, 70, 80], [186, 130, 20], [180, 130, 20]], { c: M.concrete, k: 'wing' });
    s.box(-10, 60, 86, 160, 8, 22, { c: M.conc2, k: 'wearing' });
    s.box(0, -40, 12, 140, 110, 10, { c: M.water, k: 'water', op: 0.35 });
    s.lab('box', [70, 70, 40], 30, 60, 'RCC box', 'Top slab, side walls and bottom slab cast as one box');
    s.lab('wing', [-30, 110, 40], -40, 60, 'Wing walls', 'Retain the road embankment at the ends');
    s.lab('apron', [70, 85, -3], 70, 50, 'Apron', 'Floor protection at inlet / outlet');
    s.lab('wearing', [120, 64, 100], 50, -50, 'Parapet / crash barrier', 'Wearing coat and parapet on top');
    s.lab('emb', [-90, 0, 40], -50, 20, 'Road embankment', 'Earth fill over and around the box');
    return s;
  });

  // ---------------- tube well ----------------
  def('tube_well', 'Tube well: casing, strainer, gravel pack and pump', {
    casing: /boring|drilling/i, strainer: /strainer|screen|slotted/i, gravel: /gravel|shrouding|pack/i, pump: /pump|submersible|motor/i,
    platform: /platform|apron|chamber/i
  }, 'casing', function () {
    var s = S({ az: 30, el: 20 });
    s.groups = {};
    s.pill = { casing: 'Boring & casing pipe', strainer: 'Strainer (screen)', gravel: 'Gravel pack', pump: 'Pump', platform: 'Platform' };
    s.box(-80, -80, -300, 160, 160, 300, { c: M.soil, k: 'ground', op: 0.18 });
    s.box(-80, -80, -300, 160, 160, 90, { c: '#c9b27a', k: 'aquifer', op: 0.28 });
    s.cyl('z', [0, 0, -280], 16, 280, { c: M.gravel, k: 'gravel', op: 0.45 });
    s.cyl('z', [0, 0, -200], 8, 210, { c: M.steel2, k: 'casing' });
    s.cyl('z', [0, 0, -280], 8, 80, { c: '#8aa4b8', k: 'strainer' });
    for (var z = -275; z < -205; z += 8) s.line([[-8, 7, z], [8, 7, z]], { c: '#2f3a44', w: 1.2, k: 'strainer' });
    s.box(-40, -40, 0, 80, 80, 8, { c: M.concrete, k: 'platform' });
    s.cyl('z', [0, 0, 8], 6, 40, { c: '#3e6b4e', k: 'pump' });
    s.box(-8, -8, 48, 16, 16, 20, { c: '#3e6b4e', k: 'pump' });
    s.box(-6, 0, 62, 34, 4, 4, { c: '#3e6b4e', k: 'pump' });
    s.lab('casing', [0, 8, -120], 70, -20, 'Boring & casing', 'Bore drilled, casing pipe lowered (per metre)');
    s.lab('strainer', [0, 8, -240], 70, 20, 'Strainer', 'Slotted pipe in the water-bearing layer');
    s.lab('gravel', [-16, 0, -260], -70, 10, 'Gravel pack', 'Graded gravel around the strainer');
    s.lab('aquifer', [-60, 0, -250], -40, 60, 'Aquifer', 'Water-bearing sand layer');
    s.lab('platform', [30, 40, 6], 60, 30, 'Platform', 'Concrete platform with drain');
    s.lab('pump', [0, 0, 60], -40, -50, 'Pump', 'Hand pump / submersible pump (separate item)');
    return s;
  });

  // ---------------- barbed wire fencing ----------------
  def('fencing', 'Fencing with posts, struts and barbed wire / chain link', {
    strut: /strut|stay|brace/i, mesh: /chain ?link|mesh|welded/i, wire: /barbed|wire/i, post: /post|pole|angle iron|pillar|rcc post/i
  }, 'wire', function () {
    var s = S({ az: 26, el: 16 });
    s.pill = { wire: 'Barbed wire', post: 'Fencing posts', strut: 'Struts', mesh: 'Chain-link mesh' };
    s.box(-30, -40, -4, 380, 90, 4, { c: M.grass });
    var xs = [0, 100, 200, 300];
    xs.forEach(function (x) { s.box(x - 5, -5, -40, 10, 10, 190, { c: M.conc2, k: 'post' }); s.box(x - 12, -12, -40, 24, 24, 40, { c: M.concrete, k: 'found', op: 0.5 }); });
    s.hexa([[25, -3, 0], [31, -3, 0], [31, 3, 0], [25, 3, 0], [3, -3, 110], [9, -3, 110], [9, 3, 110], [3, 3, 110]], { c: M.conc2, k: 'strut' });
    s.hexa([[269, -3, 0], [275, -3, 0], [275, 3, 0], [269, 3, 0], [291, -3, 110], [297, -3, 110], [297, 3, 110], [291, 3, 110]], { c: M.conc2, k: 'strut' });
    s.box(0, 5.5, 4, 300, 0.6, 80, { c: '#a9b4bd', k: 'mesh', op: 0.5 });
    [95, 115, 135].forEach(function (z) {
      s.line([[0, 6, z], [300, 6, z]], { c: '#4d5862', w: 1.3, k: 'wire' });
      for (var x = 10; x < 300; x += 14) s.line([[x - 2, 6, z - 2.5], [x + 2, 6, z + 2.5]], { c: '#4d5862', w: 1, k: 'wire' });
    });
    s.lab('wire', [150, 6, 135], 30, -60, 'Barbed wire', 'Strands stretched and tied to the posts (per metre / kg)');
    s.lab('post', [200, 5, 120], 60, -30, 'Posts', 'RCC / angle-iron posts at intervals');
    s.lab('strut', [17, 0, 50], -60, -20, 'Strut', 'Diagonal stay at the end / corner posts');
    s.lab('mesh', [240, 6, 40], 60, 40, 'Chain-link mesh', 'Where the item includes mesh');
    s.lab('found', [100, 12, -20], -10, 60, 'Post footing', 'Concrete block around the post foot');
    return s;
  });

  // ------------- which items get which new drawing (used when an item has no drawing yet) -------------
  // Tested on the main clause of the item description (before "including / with / complete"), then the whole text.
  window.DIAGRAM_MATCH = [
    { id: 'rolling_shutter', re: /rolling shutter|roller shutter/i },
    { id: 'sanitary', re: /water closet|\bw\.?c\.? pan|european type w|orissa pattern|squatting pan|wash ?basin|flushing cistern|urinal|nahani trap|floor trap|\bsink\b|mirror of|towel rail|soap dish|grab bar/i },
    { id: 'water_tank', re: /water (storage )?tank|over ?head tank|polyethylene.*tank|tank.*polyethylene|sintex|loft tank/i },
    { id: 'tube_well', re: /tube ?well|bore ?well|boring.*(casing|strainer)|strainer|submersible pump|hand ?pump/i },
    { id: 'water_pipe', re: /\b(g\.?i\.?|cpvc|ppr|c\.?p\.?v\.?c\.?|composite|pex|hdpe|upvc|m\.?s\.?) pipes?\b.*(water|supply|fitting)|water supply pipe|gate valve|ball valve|full way valve|stop ?cock|bib ?cock|pillar cock|\btaps?\b|ferrule|union\b|water meter/i },
    { id: 'staircase', re: /stair|steps?\b.*(tread|riser)|risers? (of|in) steps|treads?\b|hand ?rail|balust/i },
    { id: 'boundary_wall', re: /boundary wall|compound wall|\bgates?\b|steel gate|m\.?s\.? railing|railing/i },
    { id: 'fencing', re: /barbed wire|fencing|chain ?link|fence\b/i },
    { id: 'lintel_chajja', re: /(?:^|\b(?:in|of|for)\s+)(?:r\.?c\.?c\.?\s+)?(?:lintels?|chajjas?|chhajjas?|sun ?shades?|weather shades?)\b/i },
    { id: 'wall_tiles', re: /dado|wall tiles?|tiles? (in|on) walls?|cladding|skirting/i },
    { id: 'pitching', re: /pitching|revetment|toe wall|launching apron|boulder.*(slope|apron)|brick on edge.*slope/i },
    { id: 'bank_protection', re: /porcupine|geo.?bags?|sand ?bags?|bamboo (pile|screen|crate)|bullah|ballah|geo.?tube/i },
    { id: 'box_culvert', re: /box culvert|slab culvert|\bculverts?\b(?!.*pipe)/i }
  ];
  window.pickDiagram = function (text) {
    var full = String(text || ''), main = full.split(/\b(?:including|incl\.|complete)\b/i)[0];
    if (/^\W*(painting|applying|white ?washing|colour ?washing|distempering|finishing .* with paint)/i.test(full)) return '';
    for (var pass = 0; pass < 2; pass++) {
      var t = pass ? full : main;
      for (var i = 0; i < window.DIAGRAM_MATCH.length; i++) if (window.DIAGRAM_MATCH[i].re.test(t)) return window.DIAGRAM_MATCH[i].id;
      if (main === full) break;
    }
    return '';
  };
})();
