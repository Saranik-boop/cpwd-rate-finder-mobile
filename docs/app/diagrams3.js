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
  function person(s, x, y, o) {
    o = o || {}; var k = o.k, c = o.c || '#3f6e9e', sk = '#d2a27a';
    s.box(x - 5, y - 3, 0, 4, 6, 30, { c: '#3b3f46', k: k }); s.box(x + 1, y - 3, 0, 4, 6, 30, { c: '#3b3f46', k: k });
    s.box(x - 7, y - 4, 30, 14, 8, 26, { c: c, k: k });
    s.box(x - 10, y - 2, 34, 3, 4, 20, { c: c, k: k }); s.box(x + 7, y - 2, 34, 3, 4, 20, { c: c, k: k });
    s.cyl('z', [x, y, 56], 5, 10, { c: sk, k: k }, 14);
    s.cyl('z', [x, y, 65], o.hat ? 7 : 5.2, o.hat ? 3 : 3, { c: o.hat || '#2b2b2b', k: k }, 14);
  }
  function heap(s, x, y, r, h, c, k) {
    var n = 10, base = [], top = [];
    for (var i = 0; i < n; i++) { var a = i / n * 2 * Math.PI; base.push([x + r * Math.cos(a), y + r * Math.sin(a), 0]); top.push([x + r * 0.25 * Math.cos(a), y + r * 0.25 * Math.sin(a), h]); }
    var f = [base, top]; for (var j = 0; j < n; j++) { var q = (j + 1) % n; f.push([base[j], base[q], top[q], top[j]]); }
    s.solid(f, { c: c, k: k });
  }
  function truck(s, x, y, o) {
    o = o || {}; var k = o.k;
    s.box(x, y, 8, 70, 30, 8, { c: '#3a3f45', k: k });
    s.box(x, y, 16, 50, 30, 22, { c: o.body || '#d8a23a', k: k });
    s.box(x + 52, y, 16, 18, 30, 26, { c: o.cab || '#c0392b', k: k });
    s.box(x + 66, y + 3, 30, 4.2, 24, 9, { c: M.glass, k: k });
    [x + 12, x + 58].forEach(function (wx) { s.cyl('y', [wx, y - 1, 8], 8, 4, { c: '#25282c', k: k }, 16); s.cyl('y', [wx, y + 27, 8], 8, 4, { c: '#25282c', k: k }, 16); });
    if (o.load) heap(s, x + 25, y + 15, 14, 12 + 16, o.load, o.lk || k);
  }

  // ======================= 1. MATERIALS =======================
  def('materials', 'Materials (basic rates) stacked at site', {
    sanitary: /closet|wash ?basin|sink|urinal|cistern|\btaps?\b|bib ?cock|pillar cock|shower|mirror|commode|squatting/i,
    glass: /glass/i,
    paint: /paint|primer|enamel|distemper|varnish|polish|putty|thinner|chemical|adhesive|admixture|compound|sealant|solution|resin|epoxy|\boil\b|acid|emulsion paint/i,
    bitumen: /bitumen|asphalt|\btar\b|emulsion|crmb|coaltar/i,
    hardware: /bolts?|nuts?\b|screws?|nails?|hinges?|hooks?|clamps?|rivets?|fasteners?|washers?|handles?|\blocks?\b|stays?|catch|\bpins?\b|gaskets?|rubber|clips?|staples?|aldrop|tower bolt|latch/i,
    pipe: /pipe|tube|hume|socket|bend|\btee\b|elbow|fitting|valve|trap|manhole cover/i,
    tile: /tiles?|stone slab|slabs?|marble|granite|kota|sand ?stone|shahabad|mirzapur/i,
    cement: /cement|lime\b|surki|fly ?ash|gypsum|plaster of paris|pozzolana/i,
    steel: /steel|\btor\b|tmt|rods?\b|bars?\b|\bm\.?s\.?\b|joist|angle|channel|plate|strand|wire|sheet|g\.?i\.?|iron|alumin|copper|brass|lead\b|zinc/i,
    brick: /bricks?|jhama|blocks?\b|aac/i,
    aggregate: /aggregate|chips|metal\b|ballast|boulder|shingle|gravel|bajr|moorum|stone dust|screening|grit|khoa|stone/i,
    sand: /sand|silt|earth|soil/i,
    timber: /timber|wood|teak|\bsal\b|ply|board|bamboo|ballah|log|sissoo|deodar|chir/i
  }, 'other', function () {
    var s = S({ az: 34, el: 26 });
    s.pill = { cement: 'Cement / lime', sand: 'Sand / earth', aggregate: 'Stone aggregate', brick: 'Bricks / blocks', steel: 'Steel / metal', timber: 'Timber / wood',
      tile: 'Tiles / stone slabs', glass: 'Glass', paint: 'Paint / chemicals', bitumen: 'Bitumen', pipe: 'Pipes & fittings', hardware: 'Hardware (bolts, hinges…)', sanitary: 'Sanitary ware', other: 'Material' };
    s.box(-20, -20, -4, 380, 220, 4, { c: '#d6d2c6' });
    s.group(function () {
      for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) for (var l = 0; l < 3; l++) s.box(i * 22, j * 15, l * 9, 21, 14, 9, { c: '#c9c3b5', k: 'cement' });
    });
    heap(s, 110, 20, 30, 34, M.sand, 'sand');
    heap(s, 185, 20, 30, 34, M.gravel, 'aggregate');
    s.group(function () { for (var bi = 0; bi < 4; bi++) for (var bj = 0; bj < 4; bj++) for (var bl = 0; bl < 4; bl++) s.box(250 + bi * 13, bj * 7, bl * 6, 12.5, 6.5, 5.5, { c: (bi + bj + bl) % 2 ? M.brick : M.brick2, k: 'brick' }); });
    s.group(function () { for (var r = 0; r < 6; r++) s.cyl('x', [0, 80 + (r % 3) * 7, 3 + Math.floor(r / 3) * 6], 2.5, 120, { c: M.rebar, k: 'steel' }, 10); });
    s.group(function () { for (var t = 0; t < 4; t++) s.box(140, 75 + t * 11, 0, 90, 10, 8 + (t % 2) * 8, { c: t % 2 ? M.wood : M.wood2, k: 'timber' }); });
    s.group(function () { for (var p = 0; p < 3; p++) s.pipe('x', [245, 85 + p * 18, 8], 8, 100, { c: '#9aa6b1', k: 'pipe' }, 2); });
    s.group(function () { for (var ts = 0; ts < 5; ts++) s.box(0, 140, ts * 3, 50, 40, 2.6, { c: ts % 2 ? M.tile : M.tile2, k: 'tile' }); });
    s.box(70, 150, 0, 4, 40, 50, { c: M.glass, k: 'glass', op: 0.8 }); s.box(78, 150, 0, 4, 40, 50, { c: M.glass, k: 'glass', op: 0.8 });
    [[105, 150], [120, 150], [105, 168], [120, 168]].forEach(function (q) { s.cyl('z', [q[0], q[1], 0], 6, 14, { c: '#5b8bc0', k: 'paint' }, 16); });
    s.cyl('z', [160, 165, 0], 13, 36, { c: '#24272b', k: 'bitumen' }, 18);
    s.box(195, 150, 0, 34, 26, 16, { c: '#8d6e4d', k: 'hardware' });
    s.cyl('z', [212, 163, 16], 4, 6, { c: '#b9c2ca', k: 'hardware' }, 10);
    s.box(255, 150, 0, 40, 30, 22, { c: M.white, k: 'sanitary' });
    s.box(300, 150, 0, 40, 34, 30, { c: '#a8885c', k: 'other' });
    s.lab('cement', [30, 0, 27], -50, -40, 'Cement bags', ''); s.lab('sand', [110, 20, 30], -10, -60, 'Sand / earth', '');
    s.lab('aggregate', [185, 20, 30], 20, -60, 'Stone aggregate', 'Chips, metal, boulders'); s.lab('brick', [276, 0, 24], 50, -50, 'Bricks / blocks', '');
    s.lab('steel', [60, 87, 12], -60, 20, 'Steel bars & sections', ''); s.lab('timber', [185, 75, 16], 10, -60, 'Timber', '');
    s.lab('pipe', [295, 85, 16], 70, -10, 'Pipes & fittings', ''); s.lab('tile', [25, 140, 14], -60, 30, 'Tiles / stone slabs', '');
    s.lab('glass', [76, 150, 40], -20, -70, 'Glass sheets', ''); s.lab('paint', [112, 160, 14], -20, 60, 'Paint / chemicals', '');
    s.lab('bitumen', [160, 165, 36], 20, -60, 'Bitumen drum', ''); s.lab('hardware', [212, 150, 16], 40, 60, 'Hardware', 'Bolts, screws, hinges, clamps');
    s.lab('sanitary', [275, 150, 22], 50, 40, 'Sanitary ware', ''); s.lab('other', [320, 150, 30], 60, -20, 'Other materials', '');
    return s;
  });

  // ======================= 2. LABOUR =======================
  def('labour', 'Labour on a site', {
    mason: /mason|bricklayer|mistry|mathor|stone cutter/i, carpenter: /carpenter|wood|polisher/i,
    plumber: /plumber|fitter|pipe/i, painter: /painter|white ?washer|polish/i, welder: /welder|black ?smith|smith|rivet|fabricat/i,
    operator: /operator|driver|khalasi|machine|mechanic|electrician|wireman|lineman/i,
    beldar: /beldar|mazdoor|majdoor|coolie|helper|labour|bandhani|gharamee|santras|bhisti|chowkidar|mate|tarman|unskilled|semi.?skilled|skilled/i
  }, 'beldar', function () {
    var s = S({ az: 28, el: 16 });
    s.pill = { mason: 'Mason', carpenter: 'Carpenter', plumber: 'Plumber / fitter', painter: 'Painter', welder: 'Welder / blacksmith', operator: 'Operator / driver / electrician', beldar: 'Labourer (beldar / mazdoor)' };
    s.box(-30, -40, -4, 420, 110, 4, { c: '#d9d3c4' });
    s.box(-20, 20, 0, 50, 12, 42, { c: M.brick, k: 'mason' }); person(s, 10, 0, { k: 'mason', c: '#8d5a3b', hat: '#f2c230' }); s.box(16, -10, 44, 10, 3, 2, { c: '#9aa6b1', k: 'mason' });
    person(s, 70, 0, { k: 'beldar', c: '#5e7f54', hat: '#f2c230' }); s.box(55, -14, 0, 26, 18, 10, { c: '#7a7f86', k: 'beldar' });
    s.box(105, 10, 26, 60, 20, 4, { c: M.wood, k: 'carpenter' }); s.box(108, 12, 0, 4, 4, 26, { c: M.wood2, k: 'carpenter' }); s.box(158, 12, 0, 4, 4, 26, { c: M.wood2, k: 'carpenter' });
    person(s, 135, -10, { k: 'carpenter', c: '#a0632e', hat: '#f2c230' });
    s.cyl('x', [190, 20, 40], 3, 50, { c: M.gi, k: 'plumber' }); person(s, 210, 0, { k: 'plumber', c: '#2f6db0', hat: '#ffffff' });
    s.box(250, 24, 0, 40, 4, 70, { c: '#f3e2b3', k: 'painter' }); person(s, 268, 5, { k: 'painter', c: '#e6e6e6', hat: '#ffffff' }); s.box(276, 14, 50, 12, 3, 4, { c: '#d24b3c', k: 'painter' });
    person(s, 320, 0, { k: 'welder', c: '#4b4f55', hat: '#2f2f2f' }); s.box(310, 14, 20, 30, 10, 4, { c: '#6f7b87', k: 'welder' }); s.cyl('z', [330, 19, 24], 2, 4, { c: '#ffb020', k: 'welder' }, 8);
    s.box(360, -10, 0, 34, 30, 30, { c: '#e0a020', k: 'operator' }); s.box(368, -6, 30, 20, 22, 18, { c: M.glass, k: 'operator' }); person(s, 375, -30, { k: 'operator', c: '#1f5f7a', hat: '#f2c230' });
    s.lab('mason', [10, 0, 50], -40, -60, 'Mason', 'Brick / stone / plaster work'); s.lab('beldar', [70, 0, 45], -20, 60, 'Labourer', 'Beldar / mazdoor / helper');
    s.lab('carpenter', [135, -10, 50], 10, -70, 'Carpenter', ''); s.lab('plumber', [210, 0, 45], 30, 60, 'Plumber / fitter', '');
    s.lab('painter', [268, 5, 50], 0, -70, 'Painter', 'Also white washer'); s.lab('welder', [320, 0, 45], 30, 60, 'Welder / blacksmith', '');
    s.lab('operator', [377, 0, 40], 40, -50, 'Operator / driver', 'Machine operator, driver, electrician');
    return s;
  });

  // ======================= 3. PLANT & MACHINERY =======================
  def('machinery', 'Plant & machinery (hire charges)', {
    roller: /roller|compactor|rammer|plate compactor/i, mixer: /mixer|batching|transit|hot ?mix|drum mix|wet mix plant|paver|finisher|boiler|sprayer|distributor|chip spreader|kettle/i,
    excavator: /excavator|jcb|loader|dozer|grader|backhoe|poclain|motor grader|crane|tripod|winch|hoist|lift|pile|rig|derrick/i,
    truck: /truck|tipper|dumper|tanker|tractor|trailer|lorry|carriage|sweeper|bus|jeep|car\b/i,
    pump: /pump|dewater|generator|gen.?set|compressor|vibrator|welding|cutter|breaker|drill|chisel|saw|grinder|blower|needle/i
  }, 'excavator', function () {
    var s = S({ az: 30, el: 22 });
    s.pill = { excavator: 'Excavator / crane / rig', roller: 'Road roller', mixer: 'Mixer / plant / paver', truck: 'Truck / tipper / tanker', pump: 'Pump / generator / small tools' };
    s.box(-40, -60, -4, 420, 200, 4, { c: '#cdbf9f' });
    // excavator
    s.box(0, 0, 0, 60, 34, 12, { c: '#3a3f45', k: 'excavator' }); s.box(6, 2, 12, 46, 30, 24, { c: '#e3a51c', k: 'excavator' }); s.box(36, 4, 36, 16, 26, 18, { c: M.glass, k: 'excavator' });
    s.hexa([[50, 14, 30], [56, 14, 30], [56, 20, 30], [50, 20, 30], [86, 14, 70], [92, 14, 70], [92, 20, 70], [86, 20, 70]], { c: '#e3a51c', k: 'excavator' });
    s.hexa([[86, 14, 66], [92, 14, 66], [92, 20, 66], [86, 20, 66], [104, 14, 20], [110, 14, 20], [110, 20, 20], [104, 20, 20]], { c: '#e3a51c', k: 'excavator' });
    s.box(100, 10, 6, 18, 14, 14, { c: '#55595f', k: 'excavator' });
    // roller
    s.cyl('y', [170, 0, 16], 16, 34, { c: '#8e979f', k: 'roller' }, 22); s.box(186, 0, 6, 50, 34, 24, { c: '#e3a51c', k: 'roller' });
    s.cyl('y', [236, 0, 12], 12, 34, { c: '#2b2e33', k: 'roller' }, 18); s.box(200, 4, 30, 24, 26, 20, { c: M.glass, k: 'roller' });
    // mixer
    s.box(0, 90, 10, 50, 30, 8, { c: '#5d6670', k: 'mixer' }); s.cyl('y', [10, 90, 0], 6, 30, { c: '#25282c', k: 'mixer' }, 12);
    s.cyl('x', [8, 105, 40], 18, 40, { c: '#f08c2e', k: 'mixer' }, 20); s.cyl('x', [48, 105, 40], 10, 8, { c: '#f5a95a', k: 'mixer' }, 16);
    // truck
    truck(s, 90, 90, { k: 'truck', body: '#d8a23a' });
    // pump & generator
    s.box(200, 95, 0, 34, 24, 22, { c: '#3c7a4f', k: 'pump' }); s.cyl('x', [234, 107, 10], 5, 20, { c: '#2c3a46', k: 'pump' }, 12);
    s.box(270, 95, 0, 40, 28, 28, { c: '#c0392b', k: 'pump' });
    s.lab('excavator', [40, 17, 36], -40, -60, 'Excavator / crane / rig', 'Hire per hour / day');
    s.lab('roller', [205, 0, 30], 30, -60, 'Road roller', '');
    s.lab('mixer', [28, 105, 58], -60, -30, 'Concrete mixer / plant', 'Also hot-mix plant, paver, boiler');
    s.lab('truck', [130, 90, 38], 10, -70, 'Truck / tipper / tanker', '');
    s.lab('pump', [255, 95, 28], 60, -20, 'Pump / generator', 'Also vibrator, compressor, small tools');
    return s;
  });

  // ======================= 4. CARRIAGE =======================
  def('carriage', 'Carriage of materials: loading, lead and unloading', {
    boat: /boat|ferry|country boat|barge/i, rail: /rail(way)? wagon|wagon|railway|rake/i,
    manual: /manual|head ?load|by labour|by manual|basket|wheel ?barrow|hand/i,
    loading: /loading|unloading|stacking|crushing/i, truck: /mechanical|truck|tipper|lorry|tractor|haulage|carriage|lead|transport/i
  }, 'truck', function () {
    var s = S({ az: 24, el: 24 });
    s.pill = { truck: 'Carriage by truck (lead)', loading: 'Loading / unloading & stacking', manual: 'Carriage by manual labour', boat: 'Carriage by boat', rail: 'Railway wagon' };
    s.box(-50, -50, -4, 330, 150, 4, { c: '#d3c8ae' });
    s.box(-50, 10, -3.9, 330, 30, 0.6, { c: '#7c7f86' });
    heap(s, -20, 70, 22, 26, M.gravel, 'source');
    person(s, 14, 62, { k: 'loading', c: '#5e7f54', hat: '#f2c230' });
    truck(s, 90, 12, { k: 'truck', load: M.gravel });
    for (var a = 40; a < 88; a += 14) s.box(a, 24, 0.2, 8, 3, 0.4, { c: '#f4f4f4', k: 'truck' });
    heap(s, 250, 70, 20, 20, M.gravel, 'site');
    person(s, 215, 66, { k: 'loading', c: '#5e7f54', hat: '#f2c230' });
    person(s, 175, 85, { k: 'manual', c: '#8d5a3b' }); heap(s, 175, 85, 6, 6, M.gravel, 'manual');
    s.box(190, -45, 0, 60, 18, 12, { c: '#7b4a2a', k: 'boat' }); s.box(-40, -45, 0, 80, 20, 20, { c: '#7d4b3a', k: 'rail' });
    s.lab('truck', [125, 12, 30], 0, -70, 'Truck / tipper', 'Paid per km of lead (or per cum / tonne per km)');
    s.lab('loading', [14, 62, 50], -40, -50, 'Loading', 'Loading at the source'); s.lab('loading', [215, 66, 50], 40, -60, 'Unloading & stacking', 'At site');
    s.lab('manual', [175, 85, 45], 50, 40, 'Manual carriage', 'Head load / short lead by labour');
    s.lab('source', [-20, 70, 18], -50, 30, 'Source / quarry / store', ''); s.lab('site', [250, 70, 16], 50, 30, 'Work site', '');
    s.lab('boat', [220, -45, 12], 40, 40, 'Boat / ferry', ''); s.lab('rail', [0, -45, 20], -30, 50, 'Railway wagon', '');
    return s;
  });

  // ======================= 5. SOIL BORING & TESTING =======================
  def('soil_testing', 'Soil boring, sampling and testing', {
    spt: /spt|standard penetration|cone|penetration test|dcpt|scpt/i, sample: /sample|core|undisturbed|ud\b|disturbed/i,
    plate: /plate load|field density|sand replacement|cbr|core cutter|load test|pile load/i,
    lab: /lab|test(ing)?|sieve|analysis|limit|moisture|proctor|compressive|cube|consolidation|shear|chemical|permeability|specific gravity|grain|density/i,
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
    lime: /lime|surki/i, sand: /sand|marble dust|stone dust/i, cement: /cement/i
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
    door: /doors?|windows?|shutters?|frames?|chowkat|grill|gate|glass/i, roof: /roof|sheets?|tiles? (from|in) roof|truss|terrac|ceiling/i,
    steel: /steel|iron|joist|reinforcement|rails?|structural/i, pipe: /pipe|fitting|sanitary|hydrant|fixture|w\.?c|basin|tank/i,
    floor: /floor|pavement|tiles?|stone slabs?|soling/i, concrete: /concrete|r\.?c\.?c|r\.?b\.?|lime concrete|cement concrete/i,
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
    primer: /primer|priming/i, steel: /steel|iron|metal|g\.?i\.?|grill|anti.?corrosive|aluminium paint|red lead|black japan|bitumastic|structural/i,
    wood: /wood|varnish|french polish|polish|timber|teak|melamine|lacquer|wax/i,
    prep: /scraping|removing|cleaning|smoothening|sand ?paper|rubbing|putty|plaster of paris|rendering|washing/i,
    wall: /wall|distemper|emulsion|cement paint|white ?wash|colour ?wash|texture|snowcem|acrylic|exterior|interior|ceiling|plaster|border|letter|bands?/i
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
    frame: /frame ?work|battens?|grounds?|g\.?i\.? (section|frame)|profile|studs?|framework/i, shelf: /shel(f|ves)|rack|counter|platform|top/i,
    cupboard: /cupboard|almirah|drawers?|wardrobe|kitchen|cabinet/i, partition: /partition/i,
    post: /posts?|post plates?|rafters?|beams?|burgah|purlin|truss|eaves|joists?|plates?|valves?|louv/i,
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
    special: /special|bend|offset|branch|head|socket|tee|junction|elbow/i, drain: /drain|channel|gutter|cracks?|chimney/i,
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
    vent: /vent|cowl|anti.?syphon/i, gully: /gully|floor trap|nahani|grating|chamber/i, joint: /joints?|lead|caulk|spun yarn|rubber ring|solvent|collar|testing/i,
    fitting: /bend|tee|branch|junction|y\b|socket|plug|reducer|offset|shoe|trap|clamp|holder|access|door|fitting|heel rest/i,
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
    groove: /groove|v.?groove|rustic/i, baluster: /baluster|balustrade|finial|ornament|plaque|number/i, band: /band|moulding|string course|projection/i
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
    edging: /edging|edge|brick on end|brick on edge.*edg/i, metal: /metal|metalling|khoa|moorum|wbm|surki|gravel|chips|jhama metal/i,
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
    kerb: /kerb|curb|cutting edge/i, parapet: /parapet|coping/i, platform: /platform|apron|drain/i, cover: /cover|pulley|lid|net|grill/i,
    silt: /silt|bail|dewater|cleaning|disinfect|bleach|moss/i, dig: /digging|excavat|sinking|earth/i, steining: /steining|ring|masonry|brick|well/i
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
    tent: /tent|shamiana|pandal|canvas|tarpaulin|shed|stage|platform/i, toilet: /latrine|urinal|toilet/i, rope: /rope|coir/i,
    furniture: /table|bench|chair|furniture|rack|lifting/i, railing: /railing|barricad|bamboo|fencing|post/i
  }, 'railing', function () {
    var s = S({ az: 28, el: 20 });
    s.pill = { railing: 'Bamboo railing / barricade', tent: 'Tent / shamiana', rope: 'Rope fencing', toilet: 'Temporary toilet', furniture: 'Furniture / shifting' };
    s.box(-40, -60, -4, 360, 200, 4, { c: '#c9c19c' });
    s.group(function () { for (var x = 0; x <= 150; x += 30) s.cyl('z', [x, 0, 0], 3, 90, { c: '#b38b4d', k: 'railing' }, 10); [30, 60, 85].forEach(function (z) { s.cyl('x', [0, 0, z], 2.4, 150, { c: '#c8a85a', k: 'railing' }, 10); }); });
    s.group(function () { for (var x2 = 180; x2 <= 300; x2 += 40) s.cyl('z', [x2, -20, 0], 2.5, 60, { c: '#b38b4d', k: 'rope' }, 10); });
    s.line([[180, -20, 50], [220, -20, 46], [260, -20, 50], [300, -20, 46]], { c: '#9b7b3f', w: 2, k: 'rope' });
    s.prism('x', [[40, 80], [90, 120], [140, 80]], 40, 200, { c: '#e9e4d6', k: 'tent' });
    [[40, 40], [40, 140], [200, 40], [200, 140]].forEach(function (p) { s.cyl('z', [p[0], p[1], 0], 2, 80, { c: '#8a8f96', k: 'tent' }, 8); });
    s.box(250, 70, 0, 40, 40, 80, { c: '#6b8f9e', k: 'toilet' });
    s.box(100, 80, 0, 60, 30, 30, { c: '#a87445', k: 'furniture' });
    s.lab('railing', [75, 0, 60], -40, -60, 'Bamboo railing', 'Hire and labour, per metre'); s.lab('rope', [240, -20, 48], 60, -40, 'Rope fencing', '');
    s.lab('tent', [120, 100, 110], 20, -60, 'Tent / shamiana', ''); s.lab('toilet', [270, 70, 60], 60, -10, 'Temporary toilet', '');
    s.lab('furniture', [130, 80, 30], -60, 40, 'Furniture', 'Benches, tables, shifting');
    return s;
  });

  // ======================= 17. HORTICULTURE =======================
  def('horticulture', 'Horticulture: lawn, trees, shrubs, hedge and good earth', {
    guard: /guard/i, hedge: /hedge|edging|edge/i, earth: /earth|manure|sludge|compost|soil|mulch|fertili/i,
    shrub: /shrub|flower|seasonal|plant(s|ing)? (of|in)|pot|creeper|bushes/i, tree: /trees?|sapling|avenue|palm|tree pit|planting/i,
    lawn: /lawn|grass|turf|dooba|doob|mowing|ploughing|dragging|swagha/i
  }, 'lawn', function () {
    var s = S({ az: 30, el: 26 });
    s.pill = { lawn: 'Lawn / grassing', tree: 'Trees & planting', guard: 'Tree guard', shrub: 'Shrubs / flowers', hedge: 'Hedge / edging', earth: 'Good earth / manure' };
    s.box(-40, -40, -6, 320, 200, 6, { c: M.soil });
    s.box(0, 0, 0, 180, 120, 2, { c: M.grass, k: 'lawn' });
    s.cyl('z', [220, 30, 0], 4, 70, { c: '#7a5a3a', k: 'tree' }, 10); s.cyl('z', [220, 30, 60], 26, 40, { c: '#3f8a3a', k: 'tree' }, 14);
    s.group(function () { for (var a = 0; a < 4; a++) { var gx = 220 + (a < 2 ? -10 : 10), gy = 30 + (a % 2 ? -10 : 10); s.box(gx - 1, gy - 1, 0, 2, 2, 45, { c: '#4b5560', k: 'guard' }); } s.box(208, 18, 40, 24, 24, 2, { c: '#4b5560', k: 'guard' }); });
    [[40, 140], [70, 140], [100, 140]].forEach(function (q) { s.cyl('z', [q[0], q[1], 0], 9, 14, { c: '#5aa34a', k: 'shrub' }, 12); s.cyl('z', [q[0], q[1], 14], 4, 4, { c: '#e05a7a', k: 'shrub' }, 8); });
    s.box(-20, 0, 0, 12, 120, 22, { c: '#2f7a37', k: 'hedge' });
    s.group(function () { for (var y = 0; y < 120; y += 8) s.box(182, y, 0, 6, 7.6, 6, { c: M.brick2, k: 'hedge' }); });
    var n = 8, b = [], t = []; for (var i = 0; i < n; i++) { var g = i / n * 6.283; b.push([230 + 22 * Math.cos(g), 120 + 22 * Math.sin(g), 0]); t.push([230 + 6 * Math.cos(g), 120 + 6 * Math.sin(g), 14]); }
    var f = [b, t]; for (var j = 0; j < n; j++) { var q2 = (j + 1) % n; f.push([b[j], b[q2], t[q2], t[j]]); } s.solid(f, { c: '#5b3f26', k: 'earth' });
    s.lab('lawn', [90, 60, 2], -20, -60, 'Lawn', 'Grassing, maintenance per sqm'); s.lab('tree', [220, 30, 90], 30, -60, 'Tree', 'Planting with pit and manure');
    s.lab('guard', [210, 20, 30], -60, -10, 'Tree guard', ''); s.lab('shrub', [70, 140, 14], -10, 60, 'Shrubs / flowers', '');
    s.lab('hedge', [-14, 60, 22], -50, -30, 'Hedge', ''); s.lab('earth', [230, 120, 12], 60, 30, 'Good earth / manure', 'Supplied and spread');
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
    boulder: /boulders?/i, gravel: /gravel|pebbles|chips/i, sand: /sand|filter/i, inlet: /inlet|pipe|desilting|chamber|cover|grating/i, bore: /bore|casing|strainer|recharge well|shaft/i
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
    stump: /stump|root/i, jungle: /jungle|grubbing|grass|bushes|shrub|weeds?|hyacinth|clearing/i, structure: /dismantl|structures?|culvert|pipes?|masonry|brick|concrete|scraping/i,
    tree: /trees?|girth|branches|felling|cutting of/i
  }, 'tree', function () {
    var s = S({ az: 28, el: 22 });
    s.pill = { tree: 'Tree cutting', stump: 'Stump removal', jungle: 'Clearing & grubbing', structure: 'Dismantling old structures' };
    s.box(-40, -40, -4, 360, 180, 4, { c: '#b8a77c' });
    s.box(0, 0, 0, 140, 140, 1, { c: '#7aa24a', k: 'jungle' });
    s.group(function () { for (var i = 0; i < 14; i++) s.cyl('z', [10 + (i * 37) % 130, 10 + (i * 53) % 130, 1], 5 + (i % 3) * 2, 8 + (i % 4) * 4, { c: '#5b8f3b', k: 'jungle' }, 10); });
    s.cyl('z', [190, 40, 0], 6, 90, { c: '#7a5a3a', k: 'tree' }, 12); s.cyl('z', [190, 40, 80], 30, 40, { c: '#3f8a3a', k: 'tree' }, 14);
    s.cyl('x', [210, 80, 4], 5, 80, { c: '#7a5a3a', k: 'tree' }, 12);
    s.cyl('z', [190, 110, 0], 7, 8, { c: '#8a6a45', k: 'stump' }, 12);
    s.box(250, 20, 0, 50, 40, 30, { c: M.conc2, k: 'structure' }); s.cyl('x', [250, 40, 14], 10, 50, { c: '#2b2f35', k: 'structure', op: 0.6 });
    s.lab('tree', [190, 40, 100], 0, -60, 'Tree cutting', 'By girth class, incl. removing branches'); s.lab('stump', [190, 110, 8], 60, 40, 'Stump & roots', '');
    s.lab('jungle', [70, 70, 8], -60, -30, 'Clearing & grubbing', 'Light / thick jungle, per hectare'); s.lab('structure', [275, 20, 30], 50, -30, 'Old structures', 'Dismantled, materials stacked');
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
    s.box(0, 0, 0, 200, 140, 120, { c: M.sand, k: 'fill', op: 0.45 });
    s.group(function () { for (var x = 0; x < 200; x += 40) for (var z = 0; z < 120; z += 30) s.box(x + 0.5, 140, z + 0.5, 39, 8, 29, { c: (x / 40 + z / 30) % 2 ? '#c9c3b5' : '#bdb6a7', k: 'panel' }); });
    [20, 50, 80, 110].forEach(function (z) { s.box(0, 20, z, 200, 120, 1.2, { c: '#3b6e4a', k: 'grid', op: 0.8 }); });
    for (var jx = 40; jx < 200; jx += 40) s.line([[jx, 148.2, 0], [jx, 148.2, 120]], { c: '#7d776b', w: 1.2, k: 'panel' });
    for (var jz = 30; jz < 120; jz += 30) s.line([[0, 148.2, jz], [200, 148.2, jz]], { c: '#7d776b', w: 1.2, k: 'panel' });
    s.box(-10, -20, 120, 220, 170, 4, { c: M.bitumen, k: 'road' });
    s.lab('panel', [100, 148, 60], 0, 70, 'Facing panels', 'Precast concrete'); s.lab('grid', [200, 60, 80], 60, -20, 'Geogrid / strips', 'Layers tied to the panels');
    s.lab('fill', [200, 40, 40], 60, 30, 'Select fill', 'Compacted in layers'); s.lab('geotextile', [0, -10, 12], -60, 30, 'Geotextile & drain', 'Behind the fill');
    return s;
  });

  // ======================= 23. BRIDGE (general) =======================
  def('bridge', 'RCC bridge: deck, girders, pier, abutment and fittings', {
    joint: /expansion joint|strip seal|filler joint|asphaltic plug|slab seal|modular joint/i, wearing: /wearing coat|mastic|asphalt|wearing/i,
    railing: /railing|crash barrier|parapet|kerb|footpath/i, approach: /approach slab|approach/i, spout: /spout|drainage spout|weep/i,
    prestress: /prestress|strand|cable|sheathing|anchorage|post.?tension/i, girder: /girder|beam|t.?beam|box/i,
    pier: /pier|cap|column|trestle/i, abutment: /abutment|return wall|wing|dirt wall/i, deck: /deck|slab|superstructure|r\.?c\.?c|concrete|reinforcement|steel|formwork|staging/i
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
    valve: /sluice|valve|butterfly|reflux|non.?return|surface box|chamber/i, joint: /joint|flange|collar|socket|gasket|detachable|dresser|tyton|rubber ring|testing|specials?/i,
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
