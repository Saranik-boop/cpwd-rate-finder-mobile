// Drawings round 3 (Oct 2026): one base drawing per family so that EVERY item has a picture.
// Materials, labour, plant & machinery, carriage, soil testing, mortar, dismantling, painting, woodwork,
// rain-water pipes, soil pipes, mouldings, thatch & bamboo, brick soling, dug well, temporary works,
// horticulture, glazing / ACP, recharge pit, site clearance, road signs & markings, reinforced earth,
// bridge, concrete repair, road repair, water mains.
(function () {
  'use strict';
  var K = window.DiagramKit; if (!K) return;
  var M = K.M, def = K.def;
  function S(o) { return new K.Scene(o); }

  // ---------- small parts reused by several drawings ----------
  function pt(axis, u, v, a) { return axis === 'x' ? [a, u, v] : axis === 'y' ? [u, a, v] : [u, v, a]; }
  // Truncated cone between a0 and a1 along an axis (radius r0 -> r1), centre (u0, v0) in the other two axes.
  function frustum(s, axis, u0, v0, a0, a1, r0, r1, o, n) {
    n = n || 18; var A = [], B = [];
    for (var i = 0; i < n; i++) { var t = i / n * 2 * Math.PI, c = Math.cos(t), sn = Math.sin(t); A.push(pt(axis, u0 + r0 * c, v0 + r0 * sn, a0)); B.push(pt(axis, u0 + r1 * c, v0 + r1 * sn, a1)); }
    var f = [A, B]; for (var j = 0; j < n; j++) { var q = (j + 1) % n, sd = [A[j], A[q], B[q], B[j]]; sd.sm = true; f.push(sd); }
    s.solid(f, o);
  }
  function person(s, x, y, o) {
    o = o || {}; var k = o.k, c = o.c || '#3f6e9e', sk = '#d2a27a', tr = o.tr || '#3b3f46';
    s.group(function () {
      s.box(x - 6, y - 3, 0, 5, 6, 28, { c: tr, k: k }); s.box(x + 1, y - 3, 0, 5, 6, 28, { c: tr, k: k });
      s.box(x - 6.5, y - 4, 0, 6, 9, 3, { c: '#2a2a2a', k: k }); s.box(x + 0.5, y - 4, 0, 6, 9, 3, { c: '#2a2a2a', k: k });
      s.box(x - 8, y - 4.5, 27, 16, 9, 25, { c: c, k: k });
      if (o.armUp) { s.box(x - 12, y - 2.5, 40, 4, 5, 26, { c: c, k: k }); s.box(x + 8, y - 2.5, 40, 4, 5, 26, { c: c, k: k }); }
      else { s.box(x - 12, y - 2.5, 31, 4, 5, 20, { c: c, k: k }); s.box(x + 8, y - 2.5, 31, 4, 5, 20, { c: c, k: k }); }
      s.box(x - 2, y - 2, 52, 4, 4, 3, { c: sk, k: k });
    });
    s.cyl('z', [x, y, 54], 5.5, 11, { c: sk, k: k }, 16);
    if (o.hat) { s.cyl('z', [x, y, 63], 7, 1.6, { c: o.hat, k: k }, 16); frustum(s, 'z', x, y, 64.6, 69, 6, 3.5, { c: o.hat, k: k }, 16); }
    else s.cyl('z', [x, y, 63], 5.7, 3, { c: '#2b2b2b', k: k }, 16);
  }
  function heap(s, x, y, r, h, c, k, z0) {
    z0 = z0 || 0; var n = 14, base = [], mid = [], top = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * 2 * Math.PI, w = 1 + 0.06 * Math.sin(i * 2.3);
      base.push([x + r * w * Math.cos(a), y + r * w * Math.sin(a), z0]);
      mid.push([x + r * 0.62 * w * Math.cos(a), y + r * 0.62 * w * Math.sin(a), z0 + h * 0.55]);
      top.push([x + r * 0.2 * Math.cos(a), y + r * 0.2 * Math.sin(a), z0 + h]);
    }
    var f = [base, top]; for (var j = 0; j < n; j++) { var q = (j + 1) % n, f1 = [base[j], base[q], mid[q], mid[j]], f2 = [mid[j], mid[q], top[q], top[j]]; f1.sm = f2.sm = true; f.push(f1, f2); }
    s.solid(f, { c: c, k: k });
  }
  function wheel(s, x, y, z, r, w, k) { s.cyl('y', [x, y, z], r, w, { c: '#25282c', k: k }, 18); s.cyl('y', [x, y + (w > 0 ? w : 0) + 0.1, z], r * 0.5, 0.6, { c: '#9aa1a8', k: k }, 14); }
  // Tipper truck along +x (cab at the +x end). Wheels on both sides.
  function truck(s, x, y, o) {
    o = o || {}; var k = o.k, body = o.body || '#d8a23a', cab = o.cab || '#c0392b';
    [x + 14, x + 30, x + 70].forEach(function (wx) { wheel(s, wx, y - 1, 9, 9, 5, k); });
    s.box(x, y + 3, 7, 88, 24, 6, { c: '#3a3f45', k: k });
    // tipper body: tub with a sloped front wall
    s.hexa([[x, y, 13], [x + 56, y, 13], [x + 56, y + 30, 13], [x, y + 30, 13], [x - 2, y - 1, 36], [x + 58, y - 1, 36], [x + 58, y + 31, 36], [x - 2, y + 31, 36]], { c: body, k: k });
    s.box(x + 2, y + 2, 35.2, 52, 26, 1, { c: shadeC(body), k: k });
    if (o.load) heap(s, x + 28, y + 15, 14, 10, o.load, o.lk || k, 33);
    s.box(x + 60, y + 1, 13, 6, 28, 22, { c: '#33373c', k: k });
    s.hexa([[x + 66, y, 13], [x + 88, y, 13], [x + 88, y + 30, 13], [x + 66, y + 30, 13], [x + 66, y, 42], [x + 82, y, 42], [x + 82, y + 30, 42], [x + 66, y + 30, 42]], { c: cab, k: k });
    s.plane([[x + 85.4, y + 3, 28], [x + 85.4, y + 27, 28], [x + 82.8, y + 27, 40], [x + 82.8, y + 3, 40]], { c: M.glass, k: k });
    s.box(x + 69, y + 30.1, 28, 10, 0.5, 10, { c: M.glass, k: k });
    [x + 14, x + 30, x + 70].forEach(function (wx) { wheel(s, wx, y + 27, 9, 9, 5, k); });
    s.box(x + 88, y + 4, 11, 2, 22, 5, { c: '#9aa1a8', k: k });
  }
  function shadeC(h) { var c = parseInt(h.slice(1), 16), r = (c >> 16) * 0.8, g = ((c >> 8) & 255) * 0.8, b = (c & 255) * 0.8; return '#' + [r, g, b].map(function (v) { v = Math.round(v); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function tree(s, x, y, h, k, o) {
    o = o || {};
    s.cyl('z', [x, y, 0], o.tr || 3.2, h * 0.5, { c: '#7a5232', k: o.tk || k }, 12);
    var g = o.c || '#4f8a3c';
    frustum(s, 'z', x, y, h * 0.35, h * 0.62, h * 0.2, h * 0.3, { c: g, k: k }, 14);
    frustum(s, 'z', x, y, h * 0.62, h * 0.86, h * 0.3, h * 0.22, { c: g, k: k }, 14);
    frustum(s, 'z', x, y, h * 0.86, h, h * 0.22, h * 0.06, { c: g, k: k }, 14);
  }

  // ======================= 1. MATERIALS =======================
  def('materials', 'Materials (basic rates) stacked at site', {
    'steel#1': /structural steel|\bjoists?\b|\btees,? angles|\bangles?\b.{0,20}\bchannels?\b|\bflats\b|\b(m\.?s\.?|mild steel|iron) flats?\b|flat (bars?|iron|strap)|pintels?/i,
    'timber#1': /hard ?board|particle board|block ?board|plywood|\bply\b|ball(ie|y|ah)s?\b|bullah/i,
    sanitary: /closet|wash ?basin|\bsinks?\b|urinal|cistern|\btaps?\b|bib ?cock|pillar cock|shower|\bmirror\b(?! polish)|commode|squatting|\bw\.?c\.?\b|\bewc\b|\bjet\b|rubber plug|toilet|\bseat\b|towel|soap|brass waste|waste (coupling|fitting)|bottle trap|\bmixer\b(?!.*(concrete|mortar|drum))/i,
    hardware: /\bbolts?\b(?! ?less)|\bnuts?\b|\bscrews?\b|\bnails?\b|hinges?|\bhooks?\b|clamps?|rivets?|fasten(er|ers)|fastner|washers?|handles?|\blocks?\b|\bstays?\b|\bcatch|\bpins?\b(?! ?headed)|gaskets?|\bclips?\b|staples?|aldrop|tower bolt|latch|hasps?|stoppers?|door closer|\bknobs?\b|\bpivots?\b|kicking plate|curtain rods?|\bbrackets?\b|cramps?|turn ?buckles?/i,
    glass: /^(?!.*(fib(re|er) ?glass|glass (reinforced|fib(re|er)|wool|tissue|cloth)|reinforced (plastic|gypsum))).*(\bglass\b|glazing)/i,
    pipe: /^(?!.*(ceiling|door reducer|trap stone|\bsandpaper)).*(?:\bpipes?\b|\btubes?\b|hume|hubless|\bspouts?\b|\bsockets?\b|\bbends?\b|\btees?\b|elbow|\bfittings?\b|valve|\btraps?\b|manhole cover|junction|coupling|reducer|adapter|adaptor|connector|nipple|\bunion\b|flange|ferrule|\bcock\b|branch|collars?|door pieces?|couplers?|cowl|terminal guard|strainer|specials|gully|grating|surface box|\bshoes?\b)/i,
    bitumen: /bitumen|a\.?p\.?p\.? modified|polymeric felt|asphalt|\btar\b|crmb|coaltar|coal tar|cationic/i,
    paint: /^(?!.*(resistant|ceiling) tiles?)(?!.*(glass ?wool|rock ?wool|plastic sheet)).*(?:\bpaints?\b|primer|enamel|distemper|varnish|french polish|wax polish|putty|thinner|chemical|adhesive|admixture|\bcompound\b|sealant|solution|resin|epoxy|\boil\b|\bacid\b|emulsion|acrylic|white ?wash|\blime wash|colour wash|pigment|shellac|spirit|whiting)/i,
    tile: /\btiles?\b(?! class)|stone slab|\bslabs?\b|marble(?! (dust|chips|powder))|granite|\bkota\b|sand ?stone|shahabad|mirzapur/i,
    cement: /^(?!.*fibres? (reinforced )?cement)(?!.*\bbricks?\b)(?=.*(\bcement\b(?! (board|sheet|panel|fibre|corrugat))|\blime\b|surki|surkhi|fly ?ash|gypsum|plaster of paris|pozzolana|\bgrout\b))/i,
    steel: /fibres? (reinforced )?cement(?! board)|\bsteel\b|\btor\b|\btmt\b|\brods?\b|\bbars?\b|\bm\.?s\.?\b|\bplates?\b|strands?|\bwires?\b|(g\.?i\.?|galvani[sz]ed|steel|aluminium|metal|iron|copper|zinc)\s.{0,12}sheets?|\bg\.?i\.?\b|\biron\b|alumin|copper|brass|\blead\b|zinc|mesh/i,
    aggregate: /aggregate|\bchips\b|\bmetal\b|ballast|boulder|shingle|gravel|bajr|moorum|stone dust|screening|\bgrit\b|khoa|\bstones?\b|marble (dust|chips|powder)/i,
    brick: /\bbricks?\b|jhama|\bblocks?\b(?! ?board)|\baac\b|\bbats?\b/i,
    sand: /\bsand\b(?! blast)|\bsilt\b|\bearth\b|\bsoil\b/i,
    timber: /timber|\bwood|teak|\bsal\b|\bboards?\b|bamboo|\blogs?\b|sissoo|deodar|\bchir\b|batten|\bplanks?\b|scantling/i
  }, 'other', function () {
    var s = S({ az: 22, el: 38 });
    s.pill = { cement: 'Cement / lime', sand: 'Sand / earth', aggregate: 'Stone aggregate', brick: 'Bricks / blocks', steel: 'Steel / metal', timber: 'Timber / wood',
      tile: 'Tiles / stone slabs', glass: 'Glass', paint: 'Paint / chemicals', bitumen: 'Bitumen', pipe: 'Pipes & fittings', hardware: 'Hardware (bolts, hinges…)', sanitary: 'Sanitary ware', other: 'Material' };
    s.box(-8, -8, -3, 366, 196, 3, { c: '#d9d5ca' });
    // store yard: three rows of five bays, built back to front
    var CW = 72, RW = 64;
    var cells = {
      cement: [0, 0], sand: [1, 0], aggregate: [2, 0], brick: [3, 0], steel: [4, 0],
      timber: [0, 1], tile: [1, 1], glass: [2, 1], pipe: [3, 1], bitumen: [4, 1],
      paint: [0, 2], hardware: [1, 2], sanitary: [2, 2], other: [3, 2]
    };
    var draw = {
      cement: function (x, y) { s.group(function () { for (var l = 0; l < 3; l++) for (var i = 0; i < 2; i++) for (var j = 0; j < 3 - l; j++) { s.box(x + 4 + i * 27, y + 6 + j * 15 + l * 7, l * 9, 26, 14, 7, { c: '#cfc8b8', k: 'cement' }); s.box(x + 5.5 + i * 27, y + 7.5 + j * 15 + l * 7, l * 9 + 7, 23, 11, 2, { c: '#cfc8b8', k: 'cement' }); } }); },
      sand: function (x, y) { heap(s, x + 32, y + 28, 29, 30, M.sand, 'sand'); },
      aggregate: function (x, y) { heap(s, x + 32, y + 26, 28, 27, M.gravel, 'aggregate'); [[x + 52, y + 50], [x + 40, y + 54], [x + 58, y + 40]].forEach(function (b) { s.box(b[0], b[1], 0, 8, 7, 6, { c: M.stone, k: 'aggregate' }); }); },
      brick: function (x, y) { s.group(function () { for (var l = 0; l < 5; l++) for (var i = 0; i < 4; i++) for (var j = 0; j < 6; j++) s.box(x + 4 + i * 14.5, y + 6 + j * 7.5, l * 5.5, 14, 7, 5.2, { c: (i + j + l) % 3 ? M.brick : M.brick2, k: 'brick' }); }); },
      steel: function (x, y) {
        s.box(x + 8, y + 6, 0, 5, 48, 5, { c: M.wood2 }); s.box(x + 50, y + 6, 0, 5, 48, 5, { c: M.wood2 });
        s.group(function () { for (var l = 0; l < 2; l++) for (var j = 0; j < 8 - l; j++) s.cyl('x', [x + 2, y + 10 + j * 5 + l * 2.5, 7 + l * 4], 2, 64, { c: M.rebar, k: 'steel' }, 10); });
        var I = [[-7, 0], [7, 0], [7, 2], [1.2, 2], [1.2, 12], [7, 12], [7, 14], [-7, 14], [-7, 12], [-1.2, 12], [-1.2, 2], [-7, 2]];
        s.prism('x', I.map(function (p) { return [y + 30 + p[0], 15 + p[1]]; }), x + 4, x + 64, { c: M.steel2, k: 'steel' });
      },
      timber: function (x, y) { s.group(function () { for (var l = 0; l < 4; l++) { if (l % 2) for (var a = 0; a < 3; a++) s.box(x + 6 + a * 24, y + 6, l * 6, 4, 46, 6, { c: M.wood2, k: 'timber' }); else for (var b = 0; b < 4; b++) s.box(x + 2, y + 6 + b * 12, l * 6, 62, 10, 6, { c: b % 2 ? M.wood : '#c69159', k: 'timber' }); } }); },
      tile: function (x, y) {
        s.box(x + 4, y + 6, 0, 58, 46, 5, { c: M.wood2 });
        s.group(function () { [[0, 0], [30, 0], [0, 24], [30, 24]].forEach(function (q, qi) { for (var t = 0; t < 7 - qi; t++) s.box(x + 6 + q[0], y + 8 + q[1], 5 + t * 2.4, 26, 20, 2.2, { c: t % 2 ? M.tile : M.tile2, k: 'tile' }); }); });
      },
      glass: function (x, y) {
        s.box(x + 6, y + 14, 0, 54, 26, 4, { c: '#7a7f86' });
        s.box(x + 8, y + 24, 4, 3, 3, 40, { c: '#7a7f86' }); s.box(x + 55, y + 24, 4, 3, 3, 40, { c: '#7a7f86' });
        [16, 22, 30, 36].forEach(function (gy) { s.box(x + 11, y + gy, 4, 44, 1.6, 38, { c: M.glass, k: 'glass', op: 0.72 }); });
      },
      pipe: function (x, y) { s.group(function () { [[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]].forEach(function (q) { s.pipe('x', [x + 2, y + 12 + q[0] * 16, 8 + q[1] * 14], 8, 62, { c: '#a9b4bf', k: 'pipe' }, 2); }); }); },
      bitumen: function (x, y) {
        s.cyl('z', [x + 20, y + 18, 0], 13, 34, { c: '#26292d', k: 'bitumen' }, 22); s.cyl('z', [x + 20, y + 18, 11], 13.4, 1.4, { c: '#3a3e44', k: 'bitumen' }, 22); s.cyl('z', [x + 20, y + 18, 22], 13.4, 1.4, { c: '#3a3e44', k: 'bitumen' }, 22);
        s.cyl('x', [x + 24, y + 44, 12], 12, 32, { c: '#2c2f34', k: 'bitumen' }, 22);
      },
      paint: function (x, y) {
        s.group(function () {
          [[0, 0, '#3f7dc0'], [16, 0, '#f2f2f2'], [32, 0, '#c63d2f'], [8, 16, '#e7b52c'], [24, 16, '#3f9b5c'], [40, 16, '#f2f2f2']].forEach(function (q) {
            s.cyl('z', [x + 12 + q[0], y + 14 + q[1], 0], 7, 13, { c: q[2], k: 'paint' }, 18); s.cyl('z', [x + 12 + q[0], y + 14 + q[1], 13], 7.3, 1.4, { c: '#b9c0c7', k: 'paint' }, 18);
          });
          s.cyl('z', [x + 50, y + 44, 0], 9, 22, { c: '#5b6b7a', k: 'paint' }, 18);
        });
      },
      hardware: function (x, y) {
        s.box(x + 6, y + 8, 0, 46, 34, 16, { c: '#8d6e4d', k: 'hardware' }); s.box(x + 9, y + 11, 16, 40, 28, 0.6, { c: '#9aa6b1', k: 'hardware' });
        s.group(function () { [[16, 18], [26, 24], [36, 16], [42, 30], [20, 32]].forEach(function (b) { s.cyl('z', [x + b[0], y + b[1], 16.6], 3, 3, { c: '#c0c7ce', k: 'hardware' }, 6); }); });
        s.box(x + 14, y + 46, 0, 22, 12, 1.6, { c: '#b7c2cc', k: 'hardware' }); s.cyl('x', [x + 14, y + 52, 2.6], 1.4, 22, { c: '#8a949d', k: 'hardware' }, 8);
      },
      sanitary: function (x, y) {
        frustum(s, 'z', x + 20, y + 28, 0, 12, 8, 6, { c: M.white, k: 'sanitary' }, 18); s.cyl('z', [x + 20, y + 28, 12], 11, 7, { c: M.white, k: 'sanitary' }, 22); s.cyl('z', [x + 20, y + 28, 18.9], 8.5, 0.4, { c: '#c9d3db', k: 'sanitary' }, 20);
        s.box(x + 6, y + 18, 19, 7, 20, 18, { c: M.white, k: 'sanitary' });
        s.cyl('z', [x + 48, y + 20, 0], 4, 22, { c: M.white, k: 'sanitary' }, 14); s.box(x + 38, y + 12, 22, 22, 18, 7, { c: M.white, k: 'sanitary' }); s.box(x + 41, y + 15, 28.6, 16, 12, 0.6, { c: '#c9d3db', k: 'sanitary' });
      },
      other: function (x, y) { s.box(x + 6, y + 10, 0, 34, 30, 24, { c: '#b08b5a', k: 'other' }); s.box(x + 6, y + 10, 10, 34.4, 30.4, 3, { c: '#8d6b40', k: 'other' }); s.box(x + 12, y + 16, 24, 22, 20, 16, { c: '#c49c66', k: 'other' }); }
    };
    Object.keys(cells).map(function (k) { var c = cells[k]; return { k: k, x: c[0] * CW, y: c[1] * RW, d: c[0] * CW * 0.59 + c[1] * RW * 0.81 }; })
      .sort(function (a, b) { return a.d - b.d; }).forEach(function (c) { draw[c.k](c.x, c.y); });
    var A = function (k, dx, dy, z) { var c = cells[k]; return [c[0] * CW + dx, c[1] * RW + dy, z]; };
    s.lab('cement', A('cement', 30, 20, 26), -30, -40, 'Cement / lime', 'Bags or per tonne');
    s.lab('sand', A('sand', 32, 28, 26), -10, -50, 'Sand / earth', 'Coarse / fine sand, moorum, earth');
    s.lab('aggregate', A('aggregate', 32, 26, 22), 0, -50, 'Stone aggregate', 'Chips, metal, ballast, boulders');
    s.lab('brick', A('brick', 34, 28, 27), 20, -45, 'Bricks / blocks', '');
    s.lab('steel', A('steel', 40, 30, 29), 40, -35, 'Steel / metal', 'Bars, sections, sheets, wire');
    s.lab('timber', A('timber', 10, 30, 24), -45, -10, 'Timber / wood', 'Logs, planks, ballah, bamboo, ply');
    s.lab('tile', A('tile', 20, 18, 20), -30, -40, 'Tiles / stone slabs', '');
    s.lab('glass', A('glass', 33, 36, 34), 10, -55, 'Glass sheets', '');
    s.lab('pipe', A('pipe', 62, 28, 30), 30, -40, 'Pipes & fittings', '');
    s.lab('bitumen', A('bitumen', 20, 18, 34), 45, -30, 'Bitumen / emulsion', 'Drums or bulk');
    s.lab('paint', A('paint', 20, 20, 14), -45, 20, 'Paint / chemicals', 'Paint, primer, putty, admixture, sealant');
    s.lab('hardware', A('hardware', 28, 26, 17), -20, 45, 'Hardware', 'Bolts, screws, hinges, clamps');
    s.lab('sanitary', A('sanitary', 20, 28, 19), 0, 50, 'Sanitary ware', 'WC, basin, taps, cistern');
    s.lab('other', A('other', 24, 24, 40), 40, 30, 'Other materials', '');
    return s;
  });

  // ======================= 2. LABOUR =======================
  def('labour', 'Labour on a site', {
    plumber: /plumber|plumbing|fitter|pipe|sewer ?man/i, mason: /mason|bricklayer|mistry|mathor|stone cutter|mosaic/i, carpenter: /carpenter|wood|polisher|upvc|windows?/i,
    painter: /painter|white ?washer|polish/i, welder: /welder|black ?smith|smith|rivet|fabricat/i,
    operator: /operator|driver|khalasi|machine|mechanic|electrician|wireman|lineman|technician|driller|mazhi|boat/i,
    beldar: /beldar|mazdoor|majdoor|coolie|helper|labour|bandhani|gharamee|santras|bhisti|chowkidar|mate|tarman|unskilled|semi.?skilled|skilled/i
  }, 'beldar', function () {
    var s = S({ az: 18, el: 26 });
    s.pill = { mason: 'Mason', carpenter: 'Carpenter', plumber: 'Plumber / fitter', painter: 'Painter', welder: 'Welder / blacksmith', operator: 'Operator / driver / electrician', beldar: 'Labourer (beldar / mazdoor)' };
    s.box(-40, -92, -3, 380, 176, 3, { c: '#ddd7c8' });
    var HAT = '#f2c230';
    // back row (each worker in front of his own work)
    s.at(0, -50, 0, function () {
      s.group(function () { for (var l = 0; l < 8; l++) for (var i = 0; i < 3; i++) s.box(-24 + i * 14.5 + (l % 2) * 7, -26, l * 6, 14, 7, 5.6, { c: (i + l) % 2 ? M.brick : M.brick2, k: 'mason' }); });
      person(s, 0, 0, { k: 'mason', c: '#8d5a3b', hat: HAT }); s.box(11, -8, 40, 12, 6, 1.5, { c: '#b7c2cc', k: 'mason' });
    });
    s.at(90, -50, 0, function () {
      s.box(-28, -26, 26, 56, 16, 4, { c: M.wood, k: 'carpenter' }); s.box(-25, -24, 0, 4, 4, 26, { c: M.wood2, k: 'carpenter' }); s.box(21, -24, 0, 4, 4, 26, { c: M.wood2, k: 'carpenter' });
      s.box(-16, -24, 30, 34, 12, 3, { c: '#d8b07a', k: 'carpenter' });
      person(s, 0, 0, { k: 'carpenter', c: '#a0632e', hat: HAT });
    });
    s.at(180, -50, 0, function () {
      s.box(-26, -30, 0, 52, 5, 80, { c: '#f3e2b3', k: 'painter' }); s.box(-26, -25.2, 28, 34, 0.6, 46, { c: '#e9c86a', k: 'painter' });
      person(s, 0, 0, { k: 'painter', c: '#e6e6e6', hat: '#ffffff', armUp: true }); s.box(-6, -20, 64, 14, 5, 5, { c: '#d24b3c', k: 'painter' }); s.cyl('y', [1, -15, 66], 1.2, 12, { c: '#7a7f86', k: 'painter' }, 6);
    });
    s.at(270, -50, 0, function () {
      s.box(-24, -26, 0, 6, 6, 46, { c: M.steel2, k: 'welder' }); s.box(18, -26, 0, 6, 6, 46, { c: M.steel2, k: 'welder' }); s.box(-24, -26, 40, 48, 6, 6, { c: M.steel2, k: 'welder' });
      person(s, 0, 0, { k: 'welder', c: '#4b4f55', hat: '#2f2f2f' }); s.box(-5, -6.5, 54, 10, 1.5, 9, { c: '#1d2125', k: 'welder' });
      s.cyl('z', [2, -20, 42], 2.4, 3, { c: '#ffb020', k: 'welder' }, 8);
    });
    // front row, set between the back-row workers
    s.at(75, 40, 0, function () {
      s.box(-40, -6, 0, 24, 20, 3, { c: '#7a7f86', k: 'beldar' }); heap(s, -28, 4, 9, 8, M.sand, 'beldar', 3);
      person(s, 0, 0, { k: 'beldar', c: '#5e7f54', armUp: true }); frustum(s, 'z', 0, 0, 66, 71, 6, 10, { c: '#6f757c', k: 'beldar' }, 18); heap(s, 0, 0, 8, 4, M.gravel, 'beldar', 71);
    });
    s.at(165, 40, 0, function () {
      s.cyl('x', [12, -4, 26], 3.2, 36, { c: M.gi, k: 'plumber' }, 14); s.cyl('x', [48, -4, 26], 4.4, 6, { c: '#c9a43a', k: 'plumber' }, 14);
      person(s, 0, 0, { k: 'plumber', c: '#2f6db0', hat: '#ffffff' }); s.box(10, -2, 30, 3, 3, 14, { c: '#c0392b', k: 'plumber' });
    });
    s.at(255, 40, 0, function () {
      person(s, 0, 0, { k: 'operator', c: '#1f5f7a', hat: HAT });
      s.box(16, -14, 8, 46, 30, 6, { c: '#5d6670', k: 'operator' }); wheel(s, 26, -15, 7, 7, 3, 'operator'); wheel(s, 26, 13, 7, 7, 3, 'operator');
      frustum(s, 'x', 1, 34, 24, 48, 14, 14, { c: '#f08c2e', k: 'operator' }, 20); frustum(s, 'x', 1, 34, 48, 60, 14, 8, { c: '#f08c2e', k: 'operator' }, 20);
    });
    s.lab('mason', [0, -50, 62], -30, -40, 'Mason', 'Brick, stone and plaster work');
    s.lab('carpenter', [90, -50, 62], -10, -50, 'Carpenter', '');
    s.lab('painter', [180, -50, 62], 10, -50, 'Painter', 'Also white washer, polisher');
    s.lab('welder', [270, -50, 62], 30, -40, 'Welder / blacksmith', '');
    s.lab('beldar', [75, 40, 40], -40, 40, 'Labourer', 'Beldar / mazdoor / helper');
    s.lab('plumber', [165, 40, 40], 0, 50, 'Plumber / fitter', '');
    s.lab('operator', [255, 40, 40], 30, 45, 'Operator / driver', 'Machine operator, driver, electrician');
    return s;
  });

  K.defs.labour.segFirst = true;

  // ======================= 3. PLANT & MACHINERY =======================
  def('machinery', 'Plant & machinery (hire charges)', {
    roller: /roller|compactor|rammer|plate compactor/i, mixer: /mixer|batching|\bbatch\b|transit|hot ?mix|drum mix|drum type|\bhmp\b|asphalt plant|barber|mastic|cooker|wet mix plant|paver|finisher|boiler|sprayer|distributor|chip spreader|kettle/i,
    excavator: /excavator|jcb|loader|dozer|grader|backhoe|poclain|motor grader|crane|tripod|winch|hoist|\blift|\bpiling|pile driv|\brig\b|derrick|grab\b/i,
    truck: /truck|tipper|dumper|tanker|tractor|trailer|lorry|carriage|sweeper|broom|tata|\b407\b|tempo|\bbus\b|jeep|\bcar\b/i,
    pump: /pump|dewater|generator|gen.?set|compressor|vibrator|welding|cutter|cutting|breaker|drill|chisel|\bsaw\b|grinder|blower|needle|spray|rubbing|applicator|texturing|jet|blast|inject|testing|ultra ?violet|machine/i
  }, 'excavator', function () {
    var s = S({ az: 18, el: 30 });
    s.pill = { excavator: 'Excavator / crane / rig', roller: 'Road roller', mixer: 'Mixer / plant / paver', truck: 'Truck / tipper / tanker', pump: 'Pump / generator / small tools' };
    s.box(-14, -72, -3, 300, 262, 3, { c: '#cdbf9f' });
    var Y = '#e3a51c', k;
    // back row: excavator (left), tipper truck (right)
    k = 'excavator';
    [-60, -30].forEach(function (ty) {
      s.hexa([[0, ty, 0], [66, ty, 0], [66, ty + 10, 0], [0, ty + 10, 0], [-6, ty, 12], [72, ty, 12], [72, ty + 10, 12], [-6, ty + 10, 12]], { c: '#33373c', k: k });
    });
    s.box(8, -52, 12, 50, 26, 4, { c: '#55595f', k: k });
    s.box(4, -58, 16, 58, 38, 22, { c: Y, k: k }); s.box(-2, -58, 16, 10, 38, 18, { c: '#8e7a2a', k: k });
    s.box(40, -36, 38, 22, 16, 26, { c: Y, k: k }); s.box(62.2, -34, 44, 0.5, 12, 16, { c: M.glass, k: k }); s.box(42, -19.8, 44, 16, 0.5, 16, { c: M.glass, k: k });
    s.hexa([[52, -52, 34], [62, -52, 34], [62, -42, 34], [52, -42, 34], [96, -52, 86], [104, -52, 80], [104, -42, 80], [96, -42, 86]], { c: Y, k: k });
    s.hexa([[96, -51, 80], [104, -51, 86], [104, -43, 86], [96, -43, 80], [122, -51, 26], [128, -51, 30], [128, -43, 30], [122, -43, 26]], { c: Y, k: k });
    s.hexa([[118, -53, 30], [134, -53, 30], [134, -41, 30], [118, -41, 30], [116, -53, 10], [132, -53, 4], [132, -41, 4], [116, -41, 10]], { c: '#4a4e54', k: k });
    k = 'truck'; truck(s, 150, -58, { k: k, load: M.gravel });
    // front row: road roller, concrete mixer, pump + generator (shifted forward and right of the back row)
    s.at(30, 96, 0, function () {
    k = 'roller';
    s.cyl('y', [16, 20, 18], 18, 40, { c: '#8e979f', k: k }, 24);
    s.box(30, 20, 14, 52, 40, 20, { c: Y, k: k }); s.box(4, 18, 30, 26, 44, 6, { c: Y, k: k });
    wheel(s, 70, 14, 14, 14, 6, k); wheel(s, 70, 60, 14, 14, 6, k);
    [[44, 22], [74, 22], [44, 56], [74, 56]].forEach(function (p) { s.box(p[0], p[1], 34, 2.4, 2.4, 26, { c: '#33373c', k: k }); });
    s.box(42, 20, 60, 36, 40, 3, { c: Y, k: k }); s.box(52, 26, 34, 14, 26, 14, { c: '#55595f', k: k });
    k = 'mixer';
    s.box(104, 26, 10, 48, 34, 6, { c: '#5d6670', k: k }); wheel(s, 116, 25, 9, 9, 4, k); wheel(s, 116, 58, 9, 9, 4, k);
    s.box(140, 30, 16, 4, 26, 26, { c: '#5d6670', k: k });
    frustum(s, 'x', 43, 42, 106, 128, 17, 17, { c: '#f08c2e', k: k }, 22); frustum(s, 'x', 43, 42, 128, 142, 17, 9, { c: '#f08c2e', k: k }, 22);
    s.hexa([[96, 30, 16], [106, 30, 16], [106, 54, 16], [96, 54, 16], [90, 26, 36], [106, 26, 36], [106, 58, 36], [90, 58, 36]], { c: '#9aa6b1', k: k });
    k = 'pump';
    s.box(170, 20, 0, 50, 34, 30, { c: '#c0392b', k: k }); s.box(170.2, 54.2, 4, 30, 0.5, 20, { c: '#7d241b', k: k });
    for (var g = 0; g < 5; g++) s.box(220.2, 24 + g * 6, 8, 0.5, 3.5, 16, { c: '#7d241b', k: k });
    s.box(186, 64, 0, 30, 18, 4, { c: '#4a4e54', k: k }); s.cyl('x', [188, 73, 13], 8, 14, { c: '#3c7a4f', k: k }, 18); s.cyl('y', [207, 66, 13], 9, 8, { c: '#2f5e3e', k: k }, 18);
    s.cyl('x', [211, 70, 13], 3.4, 30, { c: '#2c3a46', k: k }, 12);
    });
    s.lab('excavator', [40, -40, 40], -30, -55, 'Excavator / crane / rig', 'Also JCB, dozer, grader, pile rig — per hour / day');
    s.lab('truck', [178, -58, 46], 20, -50, 'Truck / tipper / tanker', '');
    s.lab('roller', [46, 136, 36], -40, 45, 'Road roller', 'Also plate compactor, rammer');
    s.lab('mixer', [154, 138, 58], 0, 55, 'Concrete mixer / plant', 'Also hot-mix plant, paver, boiler');
    s.lab('pump', [225, 116, 30], 45, 40, 'Pump / generator', 'Also vibrator, compressor, small tools');
    return s;
  });

  // ======================= 4. CARRIAGE =======================
  def('carriage', 'Carriage of materials: loading, lead and unloading', {
    boat: /boat|ferry|country boat|barge/i, rail: /rail(way)? wagon|wagon|railway|rake/i,
    manual: /manual|head ?load|by labour|by manual|basket|wheel ?barrow|hand/i,
    loading: /loading|unloading|stacking|crushing/i, truck: /mechanical|truck|tipper|lorry|tractor|haulage|transport/i
  }, 'truck', function () {
    var s = S({ az: 18, el: 32 });
    s.pill = { truck: 'Carriage by truck (lead)', loading: 'Loading / unloading & stacking', manual: 'Carriage by manual labour', boat: 'Carriage by boat', rail: 'Railway wagon' };
    s.box(-40, -156, -3, 330, 290, 3, { c: '#d3c8ae' });
    s.at(0, -70, 0, function () {
    // back strip: railway (left) and river (right)
    s.box(-40, -80, -2.8, 150, 26, 2, { c: '#a59b8a' });
    s.box(-40, -74, 0, 150, 1.6, 1.6, { c: '#5b6168', k: 'rail' }); s.box(-40, -60, 0, 150, 1.6, 1.6, { c: '#5b6168', k: 'rail' });
    wheel(s, 0, -76, 5, 5, 3, 'rail'); wheel(s, 70, -76, 5, 5, 3, 'rail');
    s.box(-12, -78, 10, 94, 22, 4, { c: '#3a3f45', k: 'rail' }); s.box(-10, -78, 14, 90, 22, 22, { c: '#8a4a32', k: 'rail' });
    for (var r = 0; r < 6; r++) s.box(-6 + r * 15, -55.6, 16, 1.2, 0.5, 18, { c: '#6b3826', k: 'rail' });
    heap(s, 35, -67, 14, 8, M.gravel, 'rail', 36);
    wheel(s, 0, -58, 5, 5, 3, 'rail'); wheel(s, 70, -58, 5, 5, 3, 'rail');
    s.box(140, -84, -2.9, 150, 40, 2.2, { c: M.water, op: 0.85 });
    s.hexa([[170, -72, 0], [250, -72, 0], [250, -58, 0], [170, -58, 0], [160, -78, 14], [264, -78, 14], [264, -52, 14], [160, -52, 14]], { c: '#7b4a2a', k: 'boat' });
    s.box(168, -74, 13.6, 88, 18, 0.6, { c: '#5a3520', k: 'boat' }); heap(s, 210, -65, 12, 8, M.sand, 'boat', 14);
    });
    // road with the truck, quarry heap at the start, site at the end
    s.box(-40, -36, -2.8, 330, 34, 2, { c: '#6b6f76' });
    for (var a = -30; a < 290; a += 24) s.box(a, -20, -0.7, 12, 2, 0.3, { c: '#f4f4f4' });
    truck(s, 80, -34, { k: 'truck', load: M.gravel });
    s.at(0, 30, 0, function () {
    heap(s, -10, 30, 28, 30, M.gravel, 'source'); person(s, 30, 20, { k: 'loading', c: '#5e7f54', hat: '#f2c230' });
    s.group(function () { for (var l = 0; l < 4; l++) for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) s.box(220 + i * 13, 10 + j * 7, l * 5, 12.5, 6.6, 4.8, { c: (i + j + l) % 2 ? M.brick : M.brick2, k: 'site' }); });
    heap(s, 262, 54, 22, 20, M.gravel, 'site');
    person(s, 212, 44, { k: 'loading', c: '#5e7f54', hat: '#f2c230' });
    person(s, 140, 60, { k: 'manual', c: '#8d5a3b', armUp: true }); frustum(s, 'z', 140, 60, 66, 71, 6, 10, { c: '#6f757c', k: 'manual' }, 18); heap(s, 140, 60, 8, 4, M.gravel, 'manual', 71);
    });
    s.lab('truck', [118, -34, 40], -10, -60, 'Truck / tipper', 'Paid per km of lead (per cum or tonne)');
    s.lab('loading', [30, 50, 60], -30, 45, 'Loading', 'At the source / store'); s.lab('loading', [212, 74, 60], 20, 50, 'Unloading & stacking', 'At site');
    s.lab('manual', [140, 90, 70], -10, 50, 'Manual carriage', 'Head load / short lead by labour');
    s.lab('source', [-10, 60, 26], -40, 30, 'Source / quarry / store', ''); s.lab('site', [245, 50, 20], 45, 30, 'Work site', '');
    s.lab('boat', [210, -122, 14], 40, -40, 'Boat / ferry', ''); s.lab('rail', [30, -126, 30], -40, -50, 'Railway wagon', '');
    return s;
  });

  // ======================= 5. SOIL BORING & TESTING =======================
  def('soil_testing', 'Soil boring, sampling and testing', {
    spt: /\bspt\b|standard penetration|\bcones?\b|penetration test|dcpt|scpt/i, sample: /sample|\bcores?\b|undisturbed|\bud\b|disturbed/i,
    plate: /plate load|field density|sand replacement|cbr|core cutter|load test|pile load/i,
    lab: /^(?!.*drilling mud).*(?:\blab(oratory)?\b|\btest(ing|s)?\b|sieve|analysis|limit|moisture|proctor|compressive|cube|consolidation|shear|chemical|permeability|specific gravity|grain|density|determination|consistency|strength|value\b|index)/i,
    boring: /boring|bore ?hole|drilling|auger|wash|rotary|casing/i
  }, 'boring', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { boring: 'Soil boring', spt: 'SPT / penetration test', sample: 'Soil samples', plate: 'Field test', lab: 'Laboratory test' };
    s.box(-80, -80, -160, 200, 160, 160, { c: M.soil, k: 'ground', op: 0.2 });
    s.box(-80, -80, -4, 200, 160, 4, { c: M.grass });
    s.hexa([[-40, -1, 0], [-37, -1, 0], [-37, 2, 0], [-40, 2, 0], [-1, -1, 140], [2, -1, 140], [2, 2, 140], [-1, 2, 140]], { c: '#6f7b87', k: 'boring' });
    s.hexa([[40, -1, 0], [43, -1, 0], [43, 2, 0], [40, 2, 0], [-1, -1, 140], [2, -1, 140], [2, 2, 140], [-1, 2, 140]], { c: '#6f7b87', k: 'boring' });
    s.hexa([[-1, 40, 0], [2, 40, 0], [2, 43, 0], [-1, 43, 0], [-1, -1, 140], [2, -1, 140], [2, 2, 140], [-1, 2, 140]], { c: '#6f7b87', k: 'boring' });
    s.cyl('z', [0, 0, -150], 5, 210, { c: '#9aa6b1', k: 'boring' });
    s.cyl('z', [0, 0, 70], 9, 18, { c: '#c0392b', k: 'spt' }, 16);
    s.cyl('z', [0, 0, -150], 7, 30, { c: '#c0392b', k: 'spt', op: 0.9 });
    [[150, -40], [165, -40], [180, -40]].forEach(function (q) { s.cyl('x', [q[0], q[1], 2], 4, 12, { c: '#5d7a92', k: 'sample' }, 12); });
    s.box(150, 20, 0, 50, 30, 30, { c: '#e6e6e6', k: 'lab' }); s.box(160, 25, 30, 30, 20, 20, { c: '#9aa6b1', k: 'lab' });
    s.cyl('z', [-60, -50, 0], 15, 3, { c: '#55595f', k: 'plate' }, 18); s.box(-64, -54, 3, 8, 8, 30, { c: '#55595f', k: 'plate' });
    s.lab('boring', [20, 0, 60], 50, -40, 'Boring rig & bore hole', 'Per metre depth'); s.lab('spt', [0, 0, 79], -60, -40, 'SPT hammer / test', 'N-value at intervals');
    s.lab('sample', [165, -40, 4], 50, 40, 'Samples', 'Disturbed / undisturbed (UD) samples'); s.lab('lab', [175, 20, 40], 40, -50, 'Laboratory tests', 'Sieve, limits, density, shear, etc.');
    s.lab('plate', [-60, -50, 30], -50, -40, 'Field test', 'Plate load / field density / CBR');
    return s;
  });

  // ======================= 6. MORTAR =======================
  def('mortar', 'Mortar mixing at site', {
    mortar: /mortar/i, lime: /lime|surki/i, sand: /sand|marble dust|stone dust/i, cement: /cement/i
  }, 'mortar', function () {
    var s = S({ az: 30, el: 26 });
    s.pill = { mortar: 'Mortar (mix)', cement: 'Cement', sand: 'Sand', lime: 'Lime / surki' };
    s.box(-20, -20, -4, 260, 140, 4, { c: '#d6d2c6' });
    s.box(40, 20, 0, 120, 80, 3, { c: '#a4a9ad', k: 'platform' });
    heap(s, 100, 60, 34, 18, '#9c9a92', 'mortar');
    s.group(function () { for (var l = 0; l < 3; l++) s.box(0, 0, l * 9, 22, 15, 9, { c: '#c9c3b5', k: 'cement' }); });
    heap(s, 200, 30, 26, 26, M.sand, 'sand');
    heap(s, 200, 95, 18, 16, '#ece8de', 'lime');
    s.box(30, 100, 0, 30, 30, 15, { c: M.wood, k: 'box' });
    s.lab('mortar', [100, 60, 18], -10, -60, 'Mortar', 'Cement : sand by volume as per item (e.g. 1:4)');
    s.lab('cement', [11, 0, 27], -50, -40, 'Cement', ''); s.lab('sand', [200, 30, 20], 50, -40, 'Sand', 'Fine / coarse sand');
    s.lab('lime', [200, 95, 12], 50, 30, 'Lime / surki', 'For lime mortars'); s.lab('box', [45, 100, 15], -50, 40, 'Measuring box', 'Volume batching');
    return s;
  });

  // ======================= 7. DISMANTLING =======================
  def('dismantling', 'Dismantling / demolition of a building', {
    door: /\bdoors?\b|windows?|shutters?|ventilator|chowkat|grill|gate|glass|glazing|trellis/i, roof: /roof|sheets?|tiles? (from|in) roof|truss|rafter|purlin|terrac|ceiling|karries|phaska|jack arch/i,
    pipe: /pipe|fitting|sanitary|hydrant|fixture|\bw\.?c\b|basin|tank|cistern|valve|gully|\btraps?\b|\bcovers?\b|manhole|chamber|\bcocks?\b|spreader|distiller|burner|ferrule/i,
    steel: /steel|iron|joist|reinforcement|rails?|structural|barbed|wire|expanded metal|fabric|fencing/i,
    floor: /floor|pavement|\broad\b|tiles?|stone slabs?|soling/i, concrete: /concrete|r\.?c\.?c|r\.?b\.?|lime concrete|cement concrete/i,
    debris: /rubbish|debris|malba|disposal|removal of|carting/i, masonry: /masonry|brick|stone|wall|partition|plaster|cutting|chase|holes?/i
  }, 'masonry', function () {
    var s = S({ az: 32, el: 20 });
    s.pill = { masonry: 'Masonry / brick work', concrete: 'Concrete / RCC', roof: 'Roof / sheets / terracing', floor: 'Flooring', door: 'Doors / windows', steel: 'Steel work', pipe: 'Pipes & fittings', debris: 'Rubbish / disposal' };
    s.box(-40, -60, -4, 320, 200, 4, { c: '#d3cbbb' });
    s.box(0, 0, 0, 160, 100, 6, { c: M.tile, k: 'floor' });
    s.box(0, 90, 6, 160, 10, 110, { c: M.brick, k: 'masonry' });
    s.prism('y', [[0, 6], [16, 6], [16, 70], [0, 100]], 0, 90, { c: M.brick, k: 'masonry' });
    s.box(0, 0, 116, 160, 100, 10, { c: M.conc2, k: 'concrete', op: 0.95 });
    s.prism('y', [[80, 116], [160, 116], [160, 126], [110, 126]], 0, 100, { c: M.conc2, k: 'concrete' });
    s.box(0, 0, 126, 160, 100, 4, { c: '#9a6b4f', k: 'roof' });
    [40, 70].forEach(function (x) { s.cyl('x', [x, 30, 113], 1.4, 50, { c: M.rebar, k: 'steel' }, 8); });
    s.box(190, 10, 0, 50, 8, 90, { c: M.wood, k: 'door' }); s.box(190, 22, 0, 50, 8, 90, { c: M.wood2, k: 'door' });
    s.cyl('x', [190, 50, 4], 4, 70, { c: M.gi, k: 'pipe' }); s.cyl('x', [190, 60, 4], 4, 70, { c: M.gi, k: 'pipe' });
    heap(s, 120, -30, 30, 26, '#9b8f7f', 'debris'); heap(s, 140, -25, 12, 14, M.brick2, 'debris');
    s.lab('masonry', [8, 50, 60], -60, -30, 'Masonry', 'Brick / stone wall being dismantled'); s.lab('concrete', [120, 50, 121], 40, -60, 'Concrete / RCC', 'Slab broken out');
    s.lab('roof', [40, 0, 130], -40, -50, 'Roof / terracing', ''); s.lab('floor', [100, 20, 6], 60, 50, 'Floor', '');
    s.lab('steel', [60, 30, 113], -20, -80, 'Steel / reinforcement', 'Taken out, straightened, stacked'); s.lab('door', [215, 26, 60], 50, -40, 'Doors / windows', 'Taken out carefully and stacked');
    s.lab('pipe', [230, 55, 8], 50, 40, 'Pipes & fittings', ''); s.lab('debris', [120, -30, 20], -30, 60, 'Rubbish', 'Disposed within the lead stated');
    return s;
  });

  // ======================= 8. PAINTING =======================
  def('painting', 'Painting and finishing of walls, steel and wood', {
    primer: /^(?!.*\bover (a |the )?(coat of )?([a-z ]+ )?prim).*(primer|priming)/i, steel: /steel|\biron\b|metal|\bg\.?i\.?\b|\bg\.?s\.? sheet|cistern|bath ?tub|enamel|acid proof|coal tar(?!.*wood)|\bsheets?\b|\bpipes?\b|grill|anti.?corrosive|aluminium paint|red lead|black japan|bitumastic|structural/i,
    wood: /^(?!.*(floor polishing|masonry or concrete floors)).*(?:wood|varnish|french polish|polish|timber|teak|melamine|lacquer|wax)/i,
    prep: /^(?!\s*(cement wash|red oxide wash|applying|painting|finishing)).*(?:scraping|removing|cleaning|smoothening|sand ?paper|rubbing|putty|plaster of paris|rendering)/i,
    wall: /wall|concrete|distemper|cement wash|cement based paint|red oxide wash|lime wash|emulsion|cement paint|white ?wash|colour ?wash|texture|snowcem|acrylic|exterior|interior|ceiling|plaster|border|letter|bands?/i
  }, 'wall', function () {
    var s = S({ az: 30, el: 16 });
    s.pill = { wall: 'Wall painting / washing', primer: 'Priming coat', steel: 'Painting on steel', wood: 'Painting / polishing wood', prep: 'Surface preparation' };
    s.box(-20, -50, -4, 340, 120, 4, { c: '#d6d2c6' });
    s.box(0, 10, 0, 300, 16, 150, { c: '#e9e3d6', k: 'plaster' });
    s.box(0, 8.6, 0, 110, 1.6, 150, { c: '#f2c96b', k: 'wall' });
    s.box(110, 8.6, 0, 50, 1.6, 150, { c: '#f4efe6', k: 'primer' });
    s.box(160, 8.6, 0, 30, 1.6, 150, { c: '#cfc8b8', k: 'prep' });
    s.box(200, 6, 0, 70, 6, 120, { c: '#7a4b2a', k: 'wood' }); s.box(208, 4, 8, 54, 2, 104, { c: '#93603a', k: 'wood' });
    s.group(function () { s.box(20, -30, 0, 70, 3, 3, { c: '#2c4a63', k: 'steel' }); s.box(20, -30, 60, 70, 3, 3, { c: '#2c4a63', k: 'steel' }); for (var x = 22; x < 90; x += 8) s.box(x, -30, 0, 2, 3, 62, { c: '#2c4a63', k: 'steel' }); });
    s.box(120, -10, 60, 6, 6, 30, { c: '#e8e8e8', k: 'roller' }); s.cyl('x', [112, -12, 92], 5, 22, { c: '#f2c96b', k: 'wall' }, 14);
    s.lab('wall', [55, 8, 110], -50, -50, 'Painted wall', 'Distemper / emulsion / cement paint / white wash, coats as per item');
    s.lab('primer', [135, 8, 120], 20, -60, 'Primer coat', 'First coat before paint'); s.lab('prep', [175, 8, 40], 30, 60, 'Surface preparation', 'Cleaning, scraping, putty');
    s.lab('wood', [235, 4, 70], 60, -40, 'Wood: paint / varnish / polish', ''); s.lab('steel', [55, -30, 62], -60, -30, 'Steel: primer + paint', 'Grills, gates, structural steel');
    s.lab('roller', [123, -12, 92], 40, 50, 'Roller / brush', '');
    return s;
  });

  // ======================= 9. WOODWORK / PANELLING / PARTITIONS =======================
  def('woodwork', 'Wood work: wall panelling, partition, shelves, cupboard, posts & rafters', {
    frame: /frame ?work|\bgrounds?\b|g\.?i\.? (section|frame)|\bstuds?\b|studding|framework/i, shelf: /shel(f|ves)|rack|counter|platform|\btops?\b(?!,? (and )?bottom)/i,
    cupboard: /cupboard|almirah|drawers?|wardrobe|kitchen|cabinet/i, partition: /partition|partion/i,
    post: /\bposts?\b|post plates?|rafters?|\bbeams?\b|burgh?a|purlin|truss|eaves|joists?|wall plates?|louv/i,
    panel: /panell?ing|lining|board|ply|mdf|particle|veneer|laminate|plank|sheet|block ?board/i
  }, 'panel', function () {
    var s = S({ az: 32, el: 18 });
    s.pill = { panel: 'Wall panelling / boards', frame: 'Frame / battens', partition: 'Partition', shelf: 'Shelves', cupboard: 'Cupboard / drawers', post: 'Posts, beams, rafters' };
    s.box(-20, -60, -4, 360, 130, 4, { c: '#d9d3c4' });
    s.box(0, 20, 0, 320, 14, 200, { c: M.plaster });
    s.group(function () { for (var x = 2; x < 150; x += 36) s.box(x, 14, 0, 4, 6, 160, { c: M.wood2, k: 'frame' }); for (var z = 0; z <= 160; z += 40) s.box(2, 14, z, 150, 6, 4, { c: M.wood2, k: 'frame' }); });
    s.box(40, 12, 0, 112, 2, 160, { c: '#c99a63', k: 'panel' });
    s.box(170, -50, 0, 6, 70, 160, { c: '#d7c19a', k: 'partition' }); s.box(168, -50, 0, 10, 4, 160, { c: M.wood2, k: 'partition' });
    [40, 80, 120].forEach(function (z) { s.box(190, 4, z, 60, 16, 3, { c: M.wood, k: 'shelf' }); });
    s.box(260, -10, 0, 56, 30, 150, { c: '#a87445', k: 'cupboard' }); s.box(262, -11, 4, 25, 1, 142, { c: '#b9824b', k: 'cupboard' }); s.box(289, -11, 4, 25, 1, 142, { c: '#b9824b', k: 'cupboard' });
    s.box(0, -40, 0, 10, 10, 220, { c: M.wood2, k: 'post' }); s.box(0, -40, 220, 120, 10, 10, { c: M.wood2, k: 'post' });
    s.lab('panel', [100, 12, 120], 30, -60, 'Wall panelling', 'Ply / board / MDF / laminate fixed on frame');
    s.lab('frame', [20, 17, 80], -60, -20, 'Frame / battens', 'Wood or GI frame behind the boards');
    s.lab('partition', [173, -40, 100], -10, -70, 'Partition', ''); s.lab('shelf', [220, 4, 80], 30, -60, 'Shelves', '');
    s.lab('cupboard', [288, -11, 70], 60, 20, 'Cupboard', 'With shutters, drawers, fittings'); s.lab('post', [60, -40, 225], -40, -40, 'Posts / beams / rafters', 'Wood work in sections, per cum');
    return s;
  });

  // ======================= 10. RAIN WATER PIPE =======================
  def('rainwater_pipe', 'Rain-water down pipe from the roof', {
    spout: /spout|khurra|gargoyle/i, grating: /grating|grille|mouth|cowl|guard/i, shoe: /shoe/i, clamp: /clamps?|holder|hold.?bats?|nails?/i,
    special: /special|\bbends?\b|offset|branch|\bheads?\b|socket|\btees?\b|junction|elbow/i, drain: /drain|channel|gutter|cracks?|chimney/i,
    pipe: /pipe|down pipe|rain.?water/i
  }, 'pipe', function () {
    var s = S({ az: 30, el: 18 });
    s.pill = { pipe: 'Rain-water pipe', special: 'Bends / specials', shoe: 'Shoe', clamp: 'Clamps', grating: 'Mouth grating', spout: 'Spout / khurra', drain: 'Surface drain' };
    s.box(-40, -60, -4, 260, 140, 4, { c: '#cbc6b8' });
    s.box(0, 10, 0, 180, 20, 180, { c: M.plaster });
    s.box(-6, -10, 180, 192, 40, 12, { c: M.conc2, k: 'roof' }); s.box(-6, -10, 192, 192, 6, 18, { c: M.plaster });
    s.cyl('z', [80, 0, 186], 8, 6, { c: '#4a4f55', k: 'grating' }, 16);
    s.cyl('z', [80, 0, 175], 6, 12, { c: '#d0d4d8', k: 'special' }); s.cyl('z', [80, 0, 20], 5, 156, { c: '#e8ebee', k: 'pipe' });
    s.hexa([[75, -5, 20], [85, -5, 20], [85, 5, 20], [75, 5, 20], [75, -25, 6], [85, -25, 6], [85, -15, 6], [75, -15, 6]], { c: '#d0d4d8', k: 'shoe' });
    [60, 110, 160].forEach(function (z) { s.box(73, -2, z, 14, 12, 4, { c: '#6c757d', k: 'clamp' }); });
    s.box(-30, -50, 0, 220, 20, 3, { c: M.concrete, k: 'drain' }); s.box(-30, -48, -1, 220, 16, 2, { c: '#7b8590', k: 'drain' });
    s.box(130, -16, 182, 10, 26, 6, { c: '#c0c6cc', k: 'spout' });
    s.lab('pipe', [80, 0, 100], 60, -20, 'Down pipe', 'uPVC / CI / AC pipe, per metre'); s.lab('special', [80, 0, 180], -60, -20, 'Bend / head', 'Specials paid per number');
    s.lab('shoe', [80, -20, 10], -50, 40, 'Shoe', 'Discharges onto the drain'); s.lab('clamp', [80, -2, 110], -60, 10, 'Clamps', '');
    s.lab('grating', [80, 0, 192], -20, -60, 'Mouth grating', 'Stops leaves entering'); s.lab('spout', [135, -16, 186], 60, -30, 'Spout', 'Short spout through the parapet');
    s.lab('drain', [150, -40, 2], 60, 30, 'Surface drain', '');
    return s;
  });

  // ======================= 11. SOIL / WASTE PIPE =======================
  def('soil_pipe', 'Soil and waste pipe stack with fittings', {
    vent: /vent|cowl|anti.?syphon|terminal guard|air inlet/i, gully: /gully|floor trap|nahani|grating|chamber|\bjall?i\b/i, joint: /\bjoints?\b|lead caulk|caulk|spun yarn|rubber ring|solvent|collar|coupling|\btesting\b/i,
    fitting: /\bbends?\b|\btees?\b|branch|junction|\by\b|\by-|socket(?!ed pipe)|plug|reducer|off ?sets?|shoe|trap|clamp|holder|access|door|fitting|heel rest/i,
    pipe: /pipe|stack|soil|waste|swr|s\.?c\.?i|c\.?i\.?|pvc/i
  }, 'pipe', function () {
    var s = S({ az: 30, el: 18 });
    s.pill = { pipe: 'Soil / waste pipe', fitting: 'Bends, branches & fittings', joint: 'Joints', vent: 'Vent pipe & cowl', gully: 'Gully trap / chamber' };
    s.box(-40, -60, -4, 260, 140, 4, { c: '#cbc6b8' });
    s.box(0, 10, 0, 180, 20, 230, { c: M.plaster });
    s.cyl('z', [80, 0, 10], 7, 200, { c: '#5f6c78', k: 'pipe' });
    [60, 140].forEach(function (z) {
      s.cyl('z', [80, 0, z], 9, 10, { c: '#46525d', k: 'joint' });
      s.hexa([[66, -4, z + 14], [74, -4, z + 18], [74, 4, z + 18], [66, 4, z + 14], [30, -4, z + 30], [38, -4, z + 34], [38, 4, z + 34], [30, 4, z + 30]], { c: '#5f6c78', k: 'fitting' });
      s.cyl('z', [80, 0, z + 12], 9.5, 12, { c: '#4c5965', k: 'fitting' });
    });
    s.cyl('z', [80, 0, 210], 5, 40, { c: '#5f6c78', k: 'vent' }); s.cyl('z', [80, 0, 250], 9, 8, { c: '#3d464f', k: 'vent' }, 12);
    s.hexa([[74, -6, 14], [86, -6, 14], [86, 6, 14], [74, 6, 14], [74, -40, 2], [86, -40, 2], [86, -28, 2], [74, -28, 2]], { c: '#4c5965', k: 'fitting' });
    s.box(60, -70, -2, 40, 30, 8, { c: M.brick, k: 'gully' }); s.box(64, -66, 6, 32, 22, 1, { c: '#4a4f55', k: 'gully' });
    s.lab('pipe', [80, 0, 110], 60, -20, 'Soil / waste pipe', 'CI / SCI / SWR / PVC, per metre'); s.lab('fitting', [40, 0, 90], -60, -30, 'Branch / bend', 'Fittings paid per number');
    s.lab('joint', [80, 0, 65], 60, 30, 'Joint', 'Lead caulked / rubber ring / solvent'); s.lab('vent', [80, 0, 254], -40, -40, 'Vent & cowl', 'Above the roof');
    s.lab('gully', [80, -55, 6], 60, 40, 'Gully trap', 'With chamber, grating and cover');
    return s;
  });

  // ======================= 12. MOULDINGS / CORNICE =======================
  def('mouldings', 'Band moulding, cornice, drip course and sill on a facade', {
    cornice: /cornice/i, drip: /drip|throating|nosing/i, sill: /sill|chowkat|curb|kerb/i, coping: /coping/i,
    groove: /groove|v.?groove|rustic/i, baluster: /baluster|balustrade|finial|ornament|plaque|number/i, band: /band|moulding|string course/i
  }, 'band', function () {
    var s = S({ az: 28, el: 14 });
    s.pill = { band: 'Band moulding', cornice: 'Cornice', drip: 'Drip course / throating', sill: 'Sill / curb', coping: 'Coping', groove: 'V-groove', baluster: 'Balusters / ornament' };
    s.box(-20, -40, -4, 300, 110, 4, { c: '#cfc7b6' });
    s.box(0, 0, 0, 260, 25, 240, { c: '#efe6d3' });
    s.box(-4, -6, 110, 268, 8, 10, { c: '#e2d6bd', k: 'band' });
    s.prism('x', [[0, 210], [-14, 214], [-18, 222], [0, 228]], -8, 268, { c: '#e2d6bd', k: 'cornice' });
    s.box(-8, -6, 228, 276, 31, 6, { c: '#d8ccb3', k: 'coping' });
    s.group(function () { for (var x = 10; x < 255; x += 20) s.box(x, 5, 234, 6, 6, 22, { c: '#e2d6bd', k: 'baluster' }); s.box(0, 2, 256, 260, 12, 5, { c: '#d8ccb3', k: 'baluster' }); });
    s.box(80, -0.1, 40, 100, 1, 60, { c: '#9fb7c6', k: 'opening' });
    s.box(74, -10, 34, 112, 12, 6, { c: '#ddd1b7', k: 'sill' });
    s.box(74, -16, 102, 112, 18, 5, { c: '#ddd1b7', k: 'drip' });
    s.box(0, -0.4, 160, 260, 1, 1.5, { c: '#9c9384', k: 'groove' }); s.box(0, -0.4, 180, 260, 1, 1.5, { c: '#9c9384', k: 'groove' });
    s.lab('band', [30, -6, 115], -50, -30, 'Band moulding', 'Plaster band, per metre'); s.lab('cornice', [200, -12, 218], 50, -40, 'Cornice', '');
    s.lab('coping', [120, 10, 234], -10, -70, 'Coping', 'On top of parapet / compound wall'); s.lab('sill', [130, -10, 36], 30, 50, 'Sill', '');
    s.lab('drip', [160, -16, 104], 60, -10, 'Drip course / throating', 'Throws water off the wall'); s.lab('groove', [230, 0, 170], 50, 20, 'V-groove', 'In plaster');
    s.lab('baluster', [60, 5, 245], -60, -20, 'Balusters', '');
    return s;
  });

  // ======================= 13. THATCH, MUD & BAMBOO =======================
  def('thatch_hut', 'Thatch, mud and bamboo works', {
    thatch: /thatch|straw|ulu|oloo|khar|ridge/i, jaffry: /jaffr|jaffry|split bamboo|mat|durma|chatai|darma/i, mud: /mud|cow ?dung|lipping|dab/i,
    post: /posts?|post plates?|rafters?|ties|frame/i, wall: /wall|fencing|screen/i
  }, 'thatch', function () {
    var s = S({ az: 32, el: 18 });
    s.pill = { thatch: 'Thatching', post: 'Bamboo posts & frame', jaffry: 'Bamboo mat / jaffry', wall: 'Bamboo walling', mud: 'Mud plaster / lipping' };
    s.box(-40, -40, -4, 300, 200, 4, { c: '#c9b98f' });
    s.box(0, 0, 0, 200, 120, 6, { c: '#9b7a52', k: 'mud' });
    [[0, 0], [200, 0], [0, 120], [200, 120], [100, 0], [100, 120]].forEach(function (p) { s.cyl('z', [p[0], p[1], 0], 3, 120, { c: '#c8a85a', k: 'post' }, 10); });
    s.box(-2, -2, 6, 100, 4, 110, { c: '#c4a46a', k: 'wall' }); s.box(100, -2, 6, 102, 4, 110, { c: '#a88449', k: 'mud' });
    s.box(-2, 20, 6, 4, 100, 110, { c: '#c4a46a', k: 'wall' });
    s.prism('x', [[-20, 120], [60, 180], [140, 120], [130, 116], [60, 168], [-10, 116]], -20, 220, { c: '#b3923f', k: 'thatch' });
    s.prism('x', [[-12, 118], [60, 176], [132, 118], [130, 116], [60, 172], [-10, 116]], -16, 216, { c: '#d6c39a', k: 'jaffry' });
    s.lab('thatch', [100, 20, 150], 30, -60, 'Thatch', 'Straw / ulu grass, thickness as per item'); s.lab('post', [200, 0, 60], 60, -10, 'Bamboo posts', 'Posts, plates, rafters tied with rope');
    s.lab('jaffry', [-14, 60, 119], -60, -30, 'Bamboo jaffry / mat', 'Under the thatch'); s.lab('wall', [50, -2, 60], -50, 40, 'Bamboo walling', '');
    s.lab('mud', [150, -2, 60], 50, 40, 'Mud plaster / lipping', 'Earth and cow-dung');
    return s;
  });

  // ======================= 14. BRICK SOLING / PAVEMENT =======================
  def('brick_soling', 'Brick soling, edging and metalling of a path', {
    edging: /edging|brick on end|\bedge (wall|line|of (the )?(path|road|pavement))|kerb/i, metal: /metal|metalling|khoa|moorum|wbm|surki|gravel|chips|jhama metal/i,
    sand: /sand|bed/i, soling: /soling|soiling|flat brick|brick on edge|bricks?|paver|pavement|chequer|block/i
  }, 'soling', function () {
    var s = S({ az: 28, el: 26 });
    s.pill = { soling: 'Brick soling', edging: 'Brick edging', metal: 'Metalling / khoa', sand: 'Sand bed' };
    s.box(-40, -20, -14, 320, 160, 10, { c: M.soil });
    s.box(0, 0, -4, 240, 120, 4, { c: M.sand, k: 'sand' });
    s.group(function () { for (var x = 0; x < 160; x += 20) for (var y = 6; y < 114; y += 10) s.box(x + (y % 20 ? 0 : 10) * 0, y, 0, 19.4, 9.4, 5, { c: (x / 20 + y / 10) % 2 ? M.brick : M.brick2, k: 'soling' }); });
    s.group(function () { for (var x2 = 0; x2 < 240; x2 += 8) { s.box(x2, 0, 0, 7.6, 6, 10, { c: M.brick2, k: 'edging' }); s.box(x2, 114, 0, 7.6, 6, 10, { c: M.brick2, k: 'edging' }); } });
    s.box(160, 6, 0, 80, 108, 8, { c: M.gravel, k: 'metal' });
    s.group(function () { for (var px = 170; px < 240; px += 14) for (var py = 30; py < 70; py += 14) s.box(px, py, 8, 13, 13, 2, { c: '#a9a399', k: 'metal' }); });
    s.lab('soling', [80, 60, 5], -10, -60, 'Brick soling', 'Flat / on-edge bricks on sand bed'); s.lab('edging', [120, 0, 10], 20, 60, 'Edging', 'Bricks on end along the sides');
    s.lab('metal', [200, 60, 10], 50, -50, 'Metalling', 'Khoa / stone metal consolidated over soling'); s.lab('sand', [20, 120, -2], -50, 40, 'Sand bed', '');
    return s;
  });

  // ======================= 15. DUG WELL =======================
  def('dug_well', 'Dug well with steining, kerb, parapet and platform', {
    silt: /silt|bail|dewater|cleaning|disinfect|bleach|moss|scum/i, kerb: /kerb|curb|cutting edge/i, parapet: /parapet|coping/i, platform: /platform|apron|drain/i, cover: /cover|pulley|pully|lid|net|grill/i,
    dig: /digging|excavat|sinking|earth/i, steining: /steining|\bring\b|masonry|brick/i
  }, 'steining', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { steining: 'Well steining', dig: 'Digging / sinking', kerb: 'Well kerb', parapet: 'Parapet', platform: 'Platform & drain', cover: 'Cover / pulley', silt: 'Silt clearance / bailing' };
    s.box(-90, -90, -220, 180, 180, 220, { c: M.soil, k: 'dig', op: 0.18 });
    s.cyl('z', [0, 0, -210], 34, 6, { c: '#5f6c78', k: 'kerb' });
    s.cyl('z', [0, 0, -204], 32, 204, { c: M.brick, k: 'steining', op: 0.75 });
    s.cyl('z', [0, 0, -200], 26, 80, { c: M.water, k: 'water', op: 0.35 });
    s.cyl('z', [0, 0, -210], 26, 8, { c: '#7c6a52', k: 'silt' });
    s.box(-70, -70, 0, 140, 140, 6, { c: M.concrete, k: 'platform' });
    s.cyl('z', [0, 0, 6], 34, 70, { c: M.brick2, k: 'parapet' }); s.cyl('z', [0, 0, 76], 36, 5, { c: M.conc2, k: 'parapet' });
    s.box(-40, -3, 81, 4, 6, 50, { c: '#55595f', k: 'cover' }); s.box(36, -3, 81, 4, 6, 50, { c: '#55595f', k: 'cover' }); s.box(-40, -3, 128, 80, 6, 4, { c: '#55595f', k: 'cover' }); s.cyl('y', [0, -6, 118], 7, 12, { c: '#9aa6b1', k: 'cover' }, 14);
    s.lab('steining', [-32, 0, -100], -60, 0, 'Steining', 'Brick / RCC ring wall of the well'); s.lab('kerb', [34, 0, -207], 60, 20, 'Kerb', 'At the bottom of the steining');
    s.lab('dig', [70, 0, -150], 60, -20, 'Digging', 'Rate depends on depth and soil'); s.lab('silt', [0, 0, -202], -60, 40, 'Silt', 'Removed after bailing out water');
    s.lab('parapet', [34, 0, 40], 60, -10, 'Parapet', ''); s.lab('platform', [60, -60, 6], 60, 40, 'Platform & drain', '');
    s.lab('cover', [0, -6, 125], -40, -50, 'Pulley / cover', '');
    return s;
  });

  // ======================= 16. TEMPORARY WORKS / EVENTS =======================
  def('temporary', 'Temporary works: bamboo barricade, tent, rope fencing, toilets', {
    tent: /tent|shamiana|pandal|canvas|tarpaulin|shed|stage|platform/i, toilet: /latrine|urinal|toilet/i, rope: /\bropes?\b|coir/i,
    furniture: /table|bench|chair|furniture|rack|lifting/i, railing: /railing|barricad|bamboo|fencing|post/i
  }, 'railing', function () {
    var s = S({ az: 26, el: 24 });
    s.pill = { railing: 'Bamboo railing / barricade', tent: 'Tent / shamiana', rope: 'Rope fencing', toilet: 'Temporary toilet', furniture: 'Furniture / shifting' };
    s.box(-30, -40, -3, 340, 220, 3, { c: '#c9c19c' });
    // tent (back), toilet (back right), rope fencing (right), furniture inside the tent, bamboo railing along the front
    [[20, 0], [20, 90], [150, 0], [150, 90]].forEach(function (p) { s.cyl('z', [p[0], p[1], 0], 2, 70, { c: '#8a8f96', k: 'tent' }, 8); });
    s.group(function () { s.box(40, 30, 26, 70, 26, 3, { c: '#a87445', k: 'furniture' }); [[42, 32], [104, 32], [42, 52], [104, 52]].forEach(function (q) { s.box(q[0], q[1], 0, 4, 4, 26, { c: '#7d5432', k: 'furniture' }); }); s.box(120, 36, 0, 16, 16, 18, { c: '#a87445', k: 'furniture' }); });
    s.prism('x', [[-6, 70], [45, 110], [96, 70]], 14, 156, { c: '#efe9da', k: 'tent' });
    s.box(14, 90, 54, 142, 0.8, 16, { c: '#d9cfb6', k: 'tent' });
    s.box(200, 0, 0, 40, 40, 80, { c: '#6b8f9e', k: 'toilet' }); s.box(200, 0, 80, 44, 44, 4, { c: '#557785', k: 'toilet' }); s.box(210, 40.2, 4, 20, 0.5, 60, { c: '#557785', k: 'toilet' });
    s.group(function () { for (var x2 = 260; x2 <= 300; x2 += 40) for (var y2 = 0; y2 <= 120; y2 += 40) s.cyl('z', [x2, y2, 0], 2.4, 56, { c: '#b38b4d', k: 'rope' }, 10); });
    s.line([[260, 0, 48], [260, 40, 44], [260, 80, 48], [260, 120, 44]], { c: '#9b7b3f', w: 2.2, k: 'rope' });
    s.line([[300, 0, 48], [300, 40, 44], [300, 80, 48], [300, 120, 44]], { c: '#9b7b3f', w: 2.2, k: 'rope' });
    s.group(function () { for (var x = -20; x <= 240; x += 26) s.cyl('z', [x, 160, 0], 3, 64, { c: '#b38b4d', k: 'railing' }, 10); [22, 42, 60].forEach(function (z) { s.cyl('x', [-24, 162, z], 2.4, 270, { c: '#c8a85a', k: 'railing' }, 10); }); });
    s.lab('railing', [120, 162, 60], -20, 45, 'Bamboo railing', 'Hire and labour, per metre'); s.lab('rope', [300, 60, 46], 45, -30, 'Rope fencing', '');
    s.lab('tent', [85, 90, 100], -20, -55, 'Tent / shamiana', ''); s.lab('toilet', [240, 20, 70], 40, -40, 'Temporary toilet', '');
    s.lab('furniture', [128, 52, 18], 50, 10, 'Furniture', 'Benches, tables, shifting');
    return s;
  });

  // ======================= 17. HORTICULTURE =======================
  def('horticulture', 'Horticulture: lawn, trees, shrubs, hedge and good earth', {
    guard: /guard|gabion/i, hedge: /hedge|edging|edge/i, earth: /earth|manure|sludge|compost|soil|mulch|fertili/i,
    tree: /trees?|sapling|avenue|palm|tree pit|afforestation/i, shrub: /shrub|flower|seasonal|plant(s|ing)? (of|in)|pot|creeper|bushes|plants?/i,
    lawn: /lawn|grass|turf|dooba|doob|mowing|ploughing|dragging|swagha/i
  }, 'lawn', function () {
    var s = S({ az: 26, el: 28 });
    s.pill = { lawn: 'Lawn / grassing', tree: 'Trees & planting', guard: 'Tree guard', shrub: 'Shrubs / flowers', hedge: 'Hedge / edging', earth: 'Good earth / manure' };
    s.box(-40, -30, -6, 320, 210, 6, { c: M.soil });
    s.box(0, 0, 0, 170, 120, 2, { c: M.grass, k: 'lawn' });
    for (var m = 10; m < 170; m += 20) s.box(m, 0, 2, 9, 120, 0.2, { c: '#8cc35a', k: 'lawn' });
    s.group(function () { for (var y = 0; y < 120; y += 8) s.box(172, y, 0, 6, 7.6, 6, { c: M.brick2, k: 'hedge' }); });
    s.prism('y', [[-28, 0], [-6, 0], [-8, 22], [-17, 28], [-26, 22]], -10, 120, { c: '#2f7a37', k: 'hedge' }, true);
    // tree with a guard, then a sapling in a pit
    tree(s, 225, 30, 120, 'tree');
    s.group(function () { [[-12, -12], [12, -12], [-12, 12], [12, 12]].forEach(function (q) { s.box(225 + q[0] - 1.2, 30 + q[1] - 1.2, 0, 2.4, 2.4, 46, { c: '#4b5560', k: 'guard' }); }); });
    [16, 42].forEach(function (z) { s.box(212, 17, z, 26, 1.5, 2, { c: '#4b5560', k: 'guard' }); s.box(212, 41.5, z, 26, 1.5, 2, { c: '#4b5560', k: 'guard' }); s.box(212, 17, z, 1.5, 26, 2, { c: '#4b5560', k: 'guard' }); s.box(236.5, 17, z, 1.5, 26, 2, { c: '#4b5560', k: 'guard' }); });
    s.cyl('z', [225, 100, -0.5], 12, 1, { c: '#5b3f26', k: 'tree' }, 16); tree(s, 225, 100, 44, 'tree', { tr: 1.6 });
    // shrubs with flowers in front
    [[30, 150], [70, 156], [110, 150]].forEach(function (q) {
      frustum(s, 'z', q[0], q[1], 0, 12, 10, 13, { c: '#5aa34a', k: 'shrub' }, 14); frustum(s, 'z', q[0], q[1], 12, 20, 13, 5, { c: '#5aa34a', k: 'shrub' }, 14);
      s.group(function () { [[-6, 0], [5, 4], [0, -6], [3, 7]].forEach(function (f) { s.cyl('z', [q[0] + f[0], q[1] + f[1], 17], 2.4, 3, { c: '#e05a7a', k: 'shrub' }, 8); }); });
    });
    heap(s, 225, 160, 22, 16, '#5b3f26', 'earth');
    s.lab('lawn', [90, 60, 2], -20, -60, 'Lawn', 'Grassing, maintenance per sqm'); s.lab('tree', [225, 30, 100], 35, -40, 'Tree', 'Planting with pit and manure');
    s.lab('guard', [236, 30, 30], 50, 10, 'Tree guard', ''); s.lab('shrub', [70, 156, 18], -10, 50, 'Shrubs / flowers', '');
    s.lab('hedge', [-17, 60, 28], -40, -40, 'Hedge / edging', 'Hedge and brick edging'); s.lab('earth', [225, 160, 14], 50, 30, 'Good earth / manure', 'Supplied and spread');
    return s;
  });

  // ======================= 18. GLAZING / ACP FACADE =======================
  def('glazing_facade', 'Structural glazing and ACP cladding on a facade', {
    spider: /spider|fitting|patch/i, acp: /acp|composite panel|alumin(i)?um composite|cladding/i, sealant: /sealant|silicon|gasket|backer|structural silicone/i,
    glass: /glass|igu|glazing|vision|spandrel|shadow box/i, frame: /frame|grid|extruded|section|mullion|transom|profile|bracket|anchor/i
  }, 'glass', function () {
    var s = S({ az: 30, el: 16 });
    s.pill = { glass: 'Glass panels', frame: 'Aluminium frame / grid', acp: 'ACP cladding', sealant: 'Sealant / gaskets', spider: 'Spider fittings' };
    s.box(-20, -40, -4, 320, 110, 4, { c: '#cfd3d6' });
    s.box(0, 20, 0, 280, 20, 260, { c: M.concrete, k: 'structure' });
    s.group(function () { for (var x = 0; x <= 180; x += 60) s.box(x, 8, 0, 6, 12, 260, { c: '#9aa6b1', k: 'frame' }); for (var z = 0; z <= 260; z += 65) s.box(0, 8, z, 186, 12, 5, { c: '#9aa6b1', k: 'frame' }); });
    s.group(function () { for (var gx = 0; gx < 180; gx += 60) for (var gz = 0; gz < 260; gz += 65) s.box(gx + 6, 5, gz + 5, 54, 3, 60, { c: gz === 130 ? '#3e5866' : '#8cc3dc', k: gz === 130 ? 'glass' : 'glass', op: 0.85 }); });
    s.box(186, 4, 0, 94, 4, 260, { c: '#c8ccd0', k: 'acp' });
    for (var az = 65; az < 260; az += 65) s.line([[186, 3.9, az], [280, 3.9, az]], { c: '#7d858c', w: 1.2, k: 'acp' });
    s.line([[0, 4.8, 65.5], [180, 4.8, 65.5]], { c: '#1f2428', w: 2.2, k: 'sealant' });
    s.cyl('y', [60, -2, 195], 5, 6, { c: '#d8dde2', k: 'spider' }, 12);
    s.lab('glass', [90, 5, 160], 20, -70, 'Glass panels', 'Vision / spandrel glass, IGU'); s.lab('frame', [120, 8, 30], 50, 50, 'Aluminium grid', 'Mullions and transoms anchored to the structure');
    s.lab('acp', [240, 4, 200], 50, -30, 'ACP cladding', 'Aluminium composite panels'); s.lab('sealant', [100, 4, 66], -60, 30, 'Sealant joints', 'Structural / weather sealant');
    s.lab('spider', [60, -2, 195], -60, -20, 'Spider fitting', '');
    return s;
  });

  // ======================= 19. RECHARGE PIT =======================
  def('recharge_pit', 'Rain-water harvesting recharge pit with bore', {
    sand: /\bsand\b/i, gravel: /gravel|pebbles|chips/i, boulder: /boulders?/i, inlet: /inlet|pipe|desilting|chamber|cover|grating/i, bore: /bore|casing|strainer|recharge well|shaft/i
  }, 'boulder', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { boulder: 'Boulder layer', gravel: 'Gravel layer', sand: 'Sand layer', inlet: 'Inlet / desilting chamber', bore: 'Recharge bore' };
    s.box(-100, -80, -260, 260, 160, 260, { c: M.soil, k: 'ground', op: 0.16 });
    s.box(-60, -40, -150, 120, 80, 150, { c: M.brick, k: 'pit', op: 0.3 });
    s.box(-56, -36, -150, 112, 72, 50, { c: M.stone, k: 'boulder' });
    s.box(-56, -36, -100, 112, 72, 40, { c: M.gravel, k: 'gravel' });
    s.box(-56, -36, -60, 112, 72, 30, { c: M.sand, k: 'sand' });
    s.cyl('z', [0, 0, -250], 8, 110, { c: '#8aa4b8', k: 'bore' });
    s.box(80, -20, -30, 40, 40, 30, { c: M.concrete, k: 'inlet' }); s.cyl('x', [56, 0, -20], 5, 24, { c: '#e8ebee', k: 'inlet' });
    s.lab('boulder', [56, 0, -125], 60, 20, 'Boulders', '5–20 cm, bottom layer'); s.lab('gravel', [56, 0, -80], 60, -10, 'Gravel', '');
    s.lab('sand', [56, 0, -45], 60, -40, 'Coarse sand', 'Top filter'); s.lab('bore', [0, 8, -220], -60, 30, 'Recharge bore', 'With slotted pipe');
    s.lab('inlet', [100, -20, 0], 60, -30, 'Inlet chamber', 'Roof water enters through a silt trap');
    return s;
  });

  // ======================= 20. SITE CLEARANCE =======================
  def('site_clearance', 'Site clearance: trees, jungle, stumps and old structures', {
    stump: /stumps?|\broots?\b/i, jungle: /jungle|grubbing|grass|bushes|shrub|weeds?|hyacinth|clearing|vegetation|surface dressing/i, structure: /dismantl|structures?|culvert|pipes?|masonry|brick|concrete|scraping/i,
    tree: /trees?|branches|felling|cutting of/i
  }, 'tree', function () {
    var s = S({ az: 26, el: 26 });
    s.pill = { tree: 'Tree cutting', stump: 'Stump removal', jungle: 'Clearing & grubbing', structure: 'Dismantling old structures' };
    s.box(-30, -30, -4, 340, 200, 4, { c: '#b8a77c' });
    s.box(0, 0, 0, 130, 130, 1, { c: '#7aa24a', k: 'jungle' });
    s.group(function () { for (var i = 0; i < 12; i++) { var bx = 14 + (i * 37) % 110, by = 14 + (i * 53) % 110, r = 7 + (i % 3) * 3; frustum(s, 'z', bx, by, 1, 8 + (i % 4) * 3, r, r * 0.4, { c: (i % 2) ? '#5b8f3b' : '#4c7d32', k: 'jungle' }, 10); } });
    // old structure: broken wall and a rubble heap
    s.group(function () { for (var l = 0; l < 6; l++) for (var bi = 0; bi < 6 - (l > 2 ? l - 2 : 0); bi++) s.box(250 + bi * 13, 0, l * 6, 12.5, 12, 5.6, { c: (bi + l) % 2 ? M.brick : M.brick2, k: 'structure' }); });
    heap(s, 270, 40, 20, 14, '#a99a86', 'structure');
    // standing tree marked for felling, felled log, stump with roots
    tree(s, 190, 30, 130, 'tree', { tr: 4.5 });
    s.cyl('x', [160, 110, 6], 6, 90, { c: '#7a5232', k: 'tree' }, 14); frustum(s, 'x', 110, 14, 248, 266, 8, 22, { c: '#4f8a3c', k: 'tree' }, 12); frustum(s, 'x', 110, 14, 266, 292, 22, 4, { c: '#4f8a3c', k: 'tree' }, 12);
    s.cyl('z', [190, 150, 0], 8, 9, { c: '#8a6a45', k: 'stump' }, 14); s.cyl('z', [190, 150, 9], 8.3, 0.5, { c: '#d9b88a', k: 'stump' }, 14);
    [0, 1.3, 2.6, 3.9, 5.2].forEach(function (a) { s.hexa([[190 + 6 * Math.cos(a) - 1.5, 150 + 6 * Math.sin(a) - 1.5, 0], [190 + 16 * Math.cos(a), 150 + 16 * Math.sin(a) - 1.5, 0], [190 + 16 * Math.cos(a), 150 + 16 * Math.sin(a) + 1.5, 0], [190 + 6 * Math.cos(a) - 1.5, 150 + 6 * Math.sin(a) + 1.5, 0], [190 + 6 * Math.cos(a) - 1.5, 150 + 6 * Math.sin(a) - 1.5, 4], [190 + 16 * Math.cos(a), 150 + 16 * Math.sin(a) - 1.5, 1.2], [190 + 16 * Math.cos(a), 150 + 16 * Math.sin(a) + 1.5, 1.2], [190 + 6 * Math.cos(a) - 1.5, 150 + 6 * Math.sin(a) + 1.5, 4]], { c: '#7a5a3a', k: 'stump' }); });
    s.lab('tree', [190, 30, 100], 0, -55, 'Tree cutting', 'By girth class, incl. removing branches'); s.lab('stump', [190, 150, 9], 50, 35, 'Stump & roots', '');
    s.lab('jungle', [65, 65, 10], -50, -40, 'Clearing & grubbing', 'Light / thick jungle, per hectare'); s.lab('structure', [280, 6, 30], 45, -35, 'Old structures', 'Dismantled, materials stacked');
    return s;
  });

  // ======================= 21. ROAD SIGNS, MARKINGS & APPURTENANCES =======================
  def('road_furniture', 'Road signs, markings and road-side furniture', {
    kmstone: /kilo ?met(er|re) stone|km stone|hectometre|boundary stone|distance indicator|5th km|milestone/i, barrier: /crash barrier|w.?beam|metal beam|guard ?rail|parapet|thrie/i,
    delineator: /delineator|stud|cat.?s eye|reflector|hazard marker|post|bollard/i, marking: /marking|paint|thermoplastic|zebra|road line|arrow/i,
    duct: /duct|cable|utility/i, sign: /signs?|board|gantry|cantilever|overhead|letter|retro/i
  }, 'sign', function () {
    var s = S({ az: 26, el: 22 });
    s.pill = { sign: 'Traffic sign', marking: 'Road marking', kmstone: 'Kilometre stone', barrier: 'Crash barrier', delineator: 'Delineators / studs', duct: 'Cable duct' };
    s.box(-40, -20, -4, 420, 180, 4, { c: '#9fb36c' });
    s.box(0, 40, -1, 360, 80, 1, { c: M.bitumen, k: 'road' });
    for (var x = 10; x < 360; x += 40) s.box(x, 79, 0, 20, 2, 0.4, { c: '#f4f4f4', k: 'marking' });
    s.box(0, 42, 0, 360, 2, 0.4, { c: '#f4f4f4', k: 'marking' }); s.box(0, 116, 0, 360, 2, 0.4, { c: '#f4f4f4', k: 'marking' });
    s.box(40, 20, 0, 3, 3, 70, { c: '#9aa6b1', k: 'sign' });
    s.prism('y', [[22, 70], [60, 70], [41, 102]], 19, 21, { c: '#d62f2f', k: 'sign' }); s.prism('y', [[28, 73], [54, 73], [41, 95]], 18.8, 19, { c: '#ffffff', k: 'sign' });
    s.box(120, 18, 0, 14, 8, 28, { c: '#f5f5f5', k: 'kmstone' }); s.cyl('y', [127, 18, 28], 7, 8, { c: '#e7c33a', k: 'kmstone' }, 14);
    s.group(function () { for (var bx = 180; bx <= 320; bx += 35) s.box(bx, 142, 0, 4, 4, 36, { c: '#7d8892', k: 'barrier' }); s.box(176, 138, 22, 150, 4, 12, { c: '#b7c2cc', k: 'barrier' }); });
    s.group(function () { for (var dx = 10; dx < 360; dx += 50) s.box(dx, 80.5, 0.4, 4, 3, 1.2, { c: '#f2c230', k: 'delineator' }); s.box(330, 24, 0, 4, 4, 40, { c: '#f4f4f4', k: 'delineator' }); s.box(330, 23.6, 30, 4, 0.4, 6, { c: '#e34234', k: 'delineator' }); });
    s.cyl('y', [250, 40, -6], 4, 80, { c: '#5b6670', k: 'duct', op: 0.8 });
    s.lab('sign', [41, 20, 90], -40, -50, 'Traffic sign', 'Retro-reflective sign on a post'); s.lab('marking', [200, 79, 0.4], 20, 60, 'Road markings', 'Paint / thermoplastic');
    s.lab('kmstone', [127, 18, 30], 30, -60, 'Kilometre stone', ''); s.lab('barrier', [250, 138, 30], 50, -40, 'Crash barrier', 'Metal beam / RCC');
    s.lab('delineator', [332, 24, 40], 50, -10, 'Delineator / studs', ''); s.lab('duct', [250, 120, -6], 40, 50, 'Cable duct', 'Across the road');
    return s;
  });

  // ======================= 22. REINFORCED EARTH / GEOSYNTHETICS =======================
  def('reinforced_earth', 'Reinforced earth wall and geosynthetics', {
    geotextile: /geotextile|filter|drain|sub.?surface/i, panel: /panel|facing|block|precast/i, grid: /geogrid|grid|strip|reinforc|geocell|mesh|anchor/i, fill: /fill|earth|soil|backfill/i
  }, 'grid', function () {
    var s = S({ az: 32, el: 20 });
    s.pill = { panel: 'Facing panels', grid: 'Geogrid / strips', fill: 'Select fill', geotextile: 'Geotextile / drain' };
    s.box(-40, -60, -4, 300, 200, 4, { c: '#c9b98f' });
    s.box(0, -4, 0, 200, 4, 120, { c: '#e5e0d3', k: 'geotextile' }); s.cyl('x', [0, -10, 6], 6, 200, { c: '#8aa4b8', k: 'geotextile' });
    [20, 50, 80, 110].forEach(function (z) { s.box(0, 20, z, 200, 120, 1.2, { c: '#3b6e4a', k: 'grid' }); });
    s.box(0, 0, 0, 200, 140, 120, { c: M.sand, k: 'fill', op: 0.5 });
    s.group(function () { for (var x = 0; x < 200; x += 40) for (var z = 0; z < 120; z += 30) s.box(x + 0.5, 140, z + 0.5, 39, 8, 29, { c: (x / 40 + z / 30) % 2 ? '#c9c3b5' : '#bdb6a7', k: 'panel' }); });
    for (var jx = 40; jx < 200; jx += 40) s.line([[jx, 148.2, 0], [jx, 148.2, 120]], { c: '#7d776b', w: 1.2, k: 'panel' });
    for (var jz = 30; jz < 120; jz += 30) s.line([[0, 148.2, jz], [200, 148.2, jz]], { c: '#7d776b', w: 1.2, k: 'panel' });
    s.box(-10, -20, 120, 220, 170, 4, { c: M.bitumen, k: 'road' });
    s.lab('panel', [100, 148, 60], 0, 70, 'Facing panels', 'Precast concrete'); s.lab('grid', [200, 60, 80], 60, -20, 'Geogrid / strips', 'Layers tied to the panels');
    s.lab('fill', [200, 40, 40], 60, 30, 'Select fill', 'Compacted in layers'); s.lab('geotextile', [0, -10, 12], -60, 30, 'Geotextile & drain', 'Behind the fill');
    return s;
  });

  // ======================= 23. BRIDGE (general) =======================
  def('bridge', 'RCC bridge: deck, girders, pier, abutment and fittings', {
    joint: /expansion joint|strip seal|filler joint|asphaltic plug|slab seal|modular joint|seal joint|modular strip/i, wearing: /wearing coat|mastic|asphalt|wearing/i,
    railing: /railing|crash barrier|parapet|kerb|footpath/i, approach: /approach slab|approach/i, spout: /spout|drainage spout|weep/i,
    prestress: /prestress|strand|cable|sheathing|anchorage|post.?tension/i, girder: /girder|beam|t.?beam|box/i,
    pier: /pier|\bcap\b|column|trestle|sub-?\s?structure/i, abutment: /abutment|return wall|wing|dirt wall/i, deck: /deck|slab|superstructure|r\.?c\.?c|concrete|reinforcement|steel|formwork|staging/i
  }, 'deck', function () {
    var s = S({ az: 30, el: 18 });
    s.pill = { deck: 'Deck slab', girder: 'Girders', pier: 'Pier & pier cap', abutment: 'Abutment / wing walls', wearing: 'Wearing coat', joint: 'Expansion joint', railing: 'Railing / crash barrier', approach: 'Approach slab', spout: 'Drainage spout', prestress: 'Prestressing cables' };
    s.box(-60, -40, -60, 480, 160, 4, { c: '#9fb2c0' });
    s.box(-60, -30, -56, 50, 140, 116, { c: M.concrete, k: 'abutment' });
    s.box(180, 10, -56, 30, 60, 100, { c: M.conc2, k: 'pier' }); s.box(170, 0, 44, 50, 80, 12, { c: M.conc2, k: 'pier' });
    s.group(function () { [10, 40, 70].forEach(function (y) { s.box(-10, y - 6, 56, 200, 12, 30, { c: '#bfc5ca', k: 'girder' }); s.box(200, y - 6, 56, 200, 12, 30, { c: '#bfc5ca', k: 'girder' }); }); });
    s.cyl('x', [-10, 70, 62], 1.5, 200, { c: '#e46a2a', k: 'prestress' }, 8);
    s.box(-12, -6, 86, 412, 92, 12, { c: '#d3d7dc', k: 'deck' });
    s.box(-12, -6, 98, 412, 92, 3, { c: M.bitumen, k: 'wearing' });
    s.box(193, -6, 98.2, 6, 92, 3.2, { c: '#2b2f35', k: 'joint' });
    s.box(-12, -6, 101, 412, 8, 20, { c: '#c2c8cd', k: 'railing' });
    s.box(-110, -6, 92, 98, 92, 8, { c: '#cfd3d6', k: 'approach' });
    s.cyl('z', [100, 80, 70], 2, 16, { c: '#5d6b78', k: 'spout' }, 8);
    s.lab('deck', [300, 86, 92], 50, 40, 'Deck slab', ''); s.lab('girder', [100, 76, 70], 20, 60, 'Girders', '');
    s.lab('pier', [195, 70, 0], 50, 40, 'Pier & cap', ''); s.lab('abutment', [-35, 110, 0], -40, 50, 'Abutment', '');
    s.lab('wearing', [300, 40, 100], 40, -60, 'Wearing coat', ''); s.lab('joint', [196, 40, 101], -10, -70, 'Expansion joint', '');
    s.lab('railing', [80, -6, 115], -40, -50, 'Crash barrier', ''); s.lab('approach', [-60, 40, 100], -60, -30, 'Approach slab', '');
    s.lab('spout', [100, 80, 72], 70, 40, 'Drainage spout', ''); s.lab('prestress', [40, 70, 62], -60, 40, 'Prestressing', 'Cables / strands in sheathing');
    return s;
  });

  // ======================= 24. CONCRETE / MASONRY REPAIR =======================
  def('repair', 'Repair of concrete and masonry: cracks, patching, grouting, jacketing', {
    nipple: /nipple|injection|grout|epoxy injection|pressure/i, jacket: /jacket|shotcrete|guniting|wire mesh|micro.?concrete|fibre wrap|frp|cfrp/i,
    coat: /coat|paint|bonding|agent|polymer|primer|anti.?corrosive|cleaning|removing rust|rust/i, crack: /cracks?|joints?|sealant|expansion|sleeve/i,
    patch: /patch|defective|damaged|spall|renew|repair|reconstruct|replac|mending|petty/i
  }, 'patch', function () {
    var s = S({ az: 30, el: 18 });
    s.pill = { patch: 'Patch repair', crack: 'Crack repair', nipple: 'Grout injection', jacket: 'Jacketing / shotcrete', coat: 'Bonding / protective coat' };
    s.box(-30, -50, -4, 340, 130, 4, { c: '#cfc8b8' });
    s.box(0, 0, 0, 280, 30, 160, { c: M.concrete });
    s.line([[30, -0.2, 140], [50, -0.2, 110], [44, -0.2, 80], [64, -0.2, 40]], { c: '#2b2f35', w: 2.4, k: 'crack' });
    s.box(90, -2, 40, 50, 2, 50, { c: '#9e9c94', k: 'patch' });
    s.group(function () { [[180, 120], [190, 95], [200, 70], [210, 45]].forEach(function (p) { s.cyl('y', [p[0], -8, p[1]], 2, 8, { c: '#e3a51c', k: 'nipple' }, 8); }); });
    s.line([[175, -0.2, 130], [195, -0.2, 90], [215, -0.2, 40]], { c: '#2b2f35', w: 2.4, k: 'nipple' });
    s.box(240, -10, 0, 50, 50, 160, { c: '#b7b0a2', k: 'jacket', op: 0.85 });
    s.box(0, -1, 0, 70, 1, 30, { c: '#cbd8c2', k: 'coat' });
    s.lab('crack', [44, 0, 80], -60, -30, 'Crack', 'Raked out and filled / sealed'); s.lab('patch', [115, -2, 65], 0, -80, 'Patch repair', 'Loose concrete removed, polymer mortar applied');
    s.lab('nipple', [190, -8, 95], 40, -70, 'Grout injection', 'Nipples fixed, epoxy / cement grout injected'); s.lab('jacket', [265, -10, 80], 60, -10, 'Jacketing', 'New concrete / shotcrete around the member');
    s.lab('coat', [35, -1, 15], -50, 40, 'Bonding / protective coat', '');
    return s;
  });

  // ======================= 25. ROAD REPAIR / MAINTENANCE =======================
  def('road_repair', 'Road maintenance: potholes, cracks, rain cuts and shoulders', {
    crack: /crack|seal|slurry/i, raincut: /rain ?cut|erosion|restoration/i, shoulder: /shoulder|berm|side drain|drain clearance|landslide|slide/i,
    milling: /milling|scarif|recycl/i, pothole: /pot.?holes?|patch|bituminous|premix|repair/i
  }, 'pothole', function () {
    var s = S({ az: 28, el: 28 });
    s.pill = { pothole: 'Pothole / patch repair', crack: 'Crack sealing', raincut: 'Rain-cut restoration', shoulder: 'Shoulder / drain', milling: 'Milling / scarifying' };
    s.box(-40, -40, -14, 380, 200, 10, { c: M.soil });
    s.box(0, 20, -4, 300, 100, 4, { c: M.bitumen, k: 'road' });
    s.box(0, 0, -4, 300, 20, 3, { c: '#a89a73', k: 'shoulder' }); s.box(0, 120, -4, 300, 20, 3, { c: '#a89a73', k: 'shoulder' });
    s.box(60, 50, -1, 36, 26, 1.4, { c: '#1f2124', k: 'pothole' }); s.box(56, 46, -1.2, 44, 34, 1, { c: '#5a5d63', k: 'pothole' });
    s.line([[150, 40, 0.3], [170, 60, 0.3], [165, 80, 0.3], [190, 100, 0.3]], { c: '#d8d0b8', w: 2.2, k: 'crack' });
    s.prism('y', [[0, -14], [12, -4], [24, -14]], -40, 0, { c: '#7c5b3a', k: 'raincut' });
    s.box(220, 30, -1, 60, 80, 1.5, { c: '#3b3e44', k: 'milling' });
    s.lab('pothole', [78, 63, 0], -30, -70, 'Pothole patch', 'Cut, tack coat, filled with premix'); s.lab('crack', [170, 60, 0.3], 10, -70, 'Crack sealing', '');
    s.lab('raincut', [12, -20, -8], -60, 30, 'Rain cut', 'Filled and compacted'); s.lab('shoulder', [150, 130, -2], 40, 60, 'Shoulder', '');
    s.lab('milling', [250, 70, 0], 60, -30, 'Milling', 'Old surface milled off');
    return s;
  });

  // ======================= 26. WATER MAIN (distribution) =======================
  def('water_main', 'Water main: pipe in trench, joints, valves, hydrant and connection', {
    hydrant: /hydrant|fire/i, air: /air valve|air release/i, ferrule: /ferrule|connection|service/i, meter: /\bmeters?\b(?! (dia|long|length|depth|height|wide))|water meter/i,
    valve: /sluice|valve|butterfly|reflux|non.?return|surface box/i, joint: /\bjoints?\b|flange|collar|gasket|detachable|dresser|tyton|rubber ring|\bspecials?\b/i,
    pipe: /pipe|main|c\.?i\.?|d\.?i\.?|h\.?d\.?p\.?e|m\.?s\.?|pe.?al.?pe|composite|u\.?p\.?v\.?c|polyethylene/i
  }, 'pipe', function () {
    var s = S({ az: 28, el: 24 });
    s.pill = { pipe: 'Water main pipe', joint: 'Joints / specials', valve: 'Sluice valve & chamber', air: 'Air valve', hydrant: 'Fire hydrant', ferrule: 'Ferrule / service connection', meter: 'Water meter' };
    s.box(-40, -60, -90, 400, 160, 86, { c: M.soil, k: 'ground', op: 0.22 });
    s.box(-40, -60, -4, 400, 160, 4, { c: '#9aa0a6', op: 0.5 });
    s.cyl('x', [-30, 20, -60], 12, 370, { c: '#4f6475', k: 'pipe' });
    [60, 240].forEach(function (x) { s.cyl('x', [x, 20, -60], 16, 4, { c: '#3a4b59', k: 'joint' }); });
    s.box(120, -10, -86, 50, 60, 82, { c: M.brick, k: 'valve', op: 0.35 }); s.cyl('x', [130, 20, -60], 18, 30, { c: '#2f5d8a', k: 'valve' }); s.cyl('z', [145, 20, -42], 3, 30, { c: '#7d8892', k: 'valve' });
    s.box(122, -8, -4, 46, 56, 4, { c: '#3d464f', k: 'valve' });
    s.cyl('z', [280, 20, -48], 4, 36, { c: '#4f6475', k: 'air' }); s.cyl('z', [280, 20, -12], 8, 10, { c: '#2f8a5a', k: 'air' });
    s.cyl('z', [330, 20, -48], 5, 48, { c: '#c0392b', k: 'hydrant' }); s.cyl('z', [330, 20, 0], 9, 30, { c: '#d64535', k: 'hydrant' }); s.cyl('y', [330, 4, 18], 4, 8, { c: '#c0392b', k: 'hydrant' });
    s.cyl('y', [20, 32, -56], 2.6, 70, { c: M.gi, k: 'ferrule' }); s.cyl('z', [20, 102, -56], 2.6, 56, { c: M.gi, k: 'ferrule' });
    s.box(12, 96, 0, 16, 12, 10, { c: '#2f5d8a', k: 'meter' }); s.cyl('z', [20, 102, 10], 5, 2, { c: '#e8ebee', k: 'meter' }, 12);
    s.lab('pipe', [0, 20, -50], -50, 40, 'Water main', 'CI / DI / HDPE / PVC pipe laid in trench'); s.lab('joint', [62, 20, -46], -20, 60, 'Joint', 'Flanged / socket / rubber-ring joint');
    s.lab('valve', [145, 20, -12], 0, -70, 'Sluice valve', 'In a masonry chamber with surface box'); s.lab('air', [280, 20, -4], 40, -60, 'Air valve', '');
    s.lab('hydrant', [330, 20, 28], 50, -30, 'Fire hydrant', ''); s.lab('ferrule', [20, 70, -56], -60, 30, 'Ferrule & service pipe', 'Connection to a building');
    s.lab('meter', [20, 102, 12], -50, -40, 'Water meter', '');
    return s;
  });
})();
