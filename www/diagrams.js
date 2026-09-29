// Simple labelled schematic sketches shown in the "Explanation" panel (Task 3).
// Schematic only - not to scale. Colours follow the app theme (currentColor + CSS variables).
(function () {
  'use strict';
  var H = '<svg viewBox="0 0 320 200" class="dg" role="img" xmlns="http://www.w3.org/2000/svg" font-size="10" fill="none" stroke="currentColor" stroke-width="1.2">';
  var E = '</svg>';
  function t(x, y, s, a) { return '<text x="' + x + '" y="' + y + '" fill="currentColor" stroke="none"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + s + '</text>'; }
  function r(x, y, w, h, cls) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'; }
  function l(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'; }
  function lead(x1, y1, x2, y2, s, a) { return l(x1, y1, x2, y2, 'ld') + t(x2 + (a === 'end' ? -3 : 3), y2 + 3, s, a); }
  function hatch(x, y, w, h) { var s = ''; for (var i = 0; i < w + h; i += 8) { var x1 = x + Math.min(i, w), y1 = y + Math.max(0, i - w), x2 = x + Math.max(0, i - h), y2 = y + Math.min(i, h); s += l(x1, y1, x2, y2, 'ht'); } return s; }
  function dots(x, y, w, h) { var s = ''; for (var i = x + 4; i < x + w; i += 9) for (var j = y + 4; j < y + h; j += 7) s += '<circle cx="' + i + '" cy="' + j + '" r="0.9" fill="currentColor" stroke="none"/>'; return s; }
  function bar(cx, cy) { return '<circle cx="' + cx + '" cy="' + cy + '" r="2.6" fill="currentColor" stroke="none"/>'; }

  var D = {};
  D.door_panelled = { title: 'Panelled door shutter (elevation)', svg: H +
    r(40, 20, 110, 170) + r(52, 32, 86, 60) + r(52, 104, 86, 74) + l(40, 98, 150, 98) +
    lead(40, 60, 18, 60, 'Stile', 'end') + lead(95, 98, 175, 70, 'Lock rail') + lead(95, 26, 175, 30, 'Top rail') + lead(95, 185, 175, 185, 'Bottom rail') +
    lead(95, 140, 175, 140, 'Panel') + r(142, 100, 5, 14) + lead(146, 107, 175, 110, 'Handle / lock') + t(240, 100, 'Schematic, not to scale', 'middle') + E };
  D.door_flush = { title: 'Flush door shutter (section)', svg: H +
    r(40, 60, 240, 40) + r(40, 60, 240, 5) + r(40, 95, 240, 5) + r(40, 65, 14, 30) + r(266, 65, 14, 30) + hatch(54, 65, 212, 30) +
    lead(160, 60, 160, 30, 'Face veneer / ply (both faces)') + lead(47, 80, 20, 130, 'Hardwood frame (lipping)') + lead(160, 80, 200, 140, 'Core: block board / particle board') +
    t(160, 175, 'Thickness as per item (30 / 35 / 40 mm)', 'middle') + E };
  D.door_fittings = { title: 'Common door fittings', svg: H +
    r(90, 15, 12, 175) + r(102, 15, 120, 175) +
    r(96, 35, 10, 22, 'fl') + lead(101, 46, 60, 46, 'Butt hinge', 'end') + r(96, 150, 10, 22, 'fl') + lead(101, 161, 60, 161, 'Butt hinge', 'end') +
    r(150, 30, 30, 6, 'fl') + lead(165, 33, 250, 30, 'Tower bolt') + r(200, 100, 6, 18, 'fl') + lead(206, 109, 250, 100, 'Handle') +
    r(150, 175, 30, 6, 'fl') + lead(165, 178, 250, 182, 'Tower bolt (bottom)') + '<circle cx="190" cy="125" r="3"/>' + lead(193, 125, 250, 130, 'Stopper / lock') + E };
  D.window = { title: 'Window with frame and shutters (elevation)', svg: H +
    r(60, 20, 200, 160) + r(70, 30, 180, 140) + l(160, 30, 160, 170) + r(80, 40, 70, 120) + r(170, 40, 70, 120) +
    lead(65, 100, 40, 100, 'Frame', 'end') + lead(115, 100, 280, 60, 'Glass pane') + lead(160, 100, 280, 100, 'Shutter meeting') +
    l(80, 115, 150, 115) + l(170, 115, 240, 115) + lead(200, 115, 280, 140, 'Glazing bar') + t(160, 195, 'Grill / fittings are usually separate items', 'middle') + E };
  D.rcc_slab_beam = { title: 'RCC slab and beam (section)', svg: H +
    r(20, 40, 280, 22) + r(130, 62, 60, 70) + bar(140, 124) + bar(160, 124) + bar(180, 124) + bar(140, 70) + bar(180, 70) +
    l(25, 56, 295, 56) + r(134, 66, 52, 62) +
    lead(60, 50, 60, 20, 'Slab (main + distribution bars)') + lead(160, 124, 230, 160, 'Main bottom bars') + lead(186, 95, 240, 110, 'Stirrups') +
    lead(140, 70, 112, 100, 'Top bars', 'end') + t(160, 190, 'Concrete, formwork and steel are often paid separately', 'middle') + E };
  D.rcc_column_footing = { title: 'RCC column and isolated footing (section)', svg: H +
    r(140, 10, 40, 110) + '<path d="M60 150 L140 120 L180 120 L260 150 Z"/>' + r(60, 150, 200, 25) + r(50, 175, 220, 12, 'fl2') +
    l(148, 15, 148, 170) + l(172, 15, 172, 170) + l(70, 168, 250, 168) +
    lead(180, 60, 230, 50, 'Column') + lead(172, 100, 230, 90, 'Vertical bars + ties') + lead(250, 160, 290, 140, 'Footing') + lead(200, 168, 290, 170, 'Bottom mesh') + lead(60, 181, 20, 160, 'PCC bed', 'start') + E };
  D.brick_bond = { title: 'English bond brickwork (elevation)', svg: H + (function () {
    var s = ''; for (var row = 0; row < 8; row++) { var y = 30 + row * 18, stretcher = row % 2 === 0, w = stretcher ? 40 : 20; for (var x = 30 + (stretcher ? 0 : 0); x < 290; x += w) s += r(x, y, Math.min(w, 290 - x), 18); } return s; })() +
    lead(50, 39, 50, 18, 'Stretcher course') + lead(60, 57, 300, 20, 'Header course') + t(160, 195, 'Joints 10 mm; measure net of openings as per IS 1200 Part 3', 'middle') + E };
  D.stone_masonry = { title: 'Random rubble stone masonry (elevation)', svg: H +
    '<path d="M30 40 L90 35 L95 70 L35 75 Z M95 35 L160 42 L150 80 L95 70 Z M160 42 L230 35 L235 72 L150 80 Z M235 35 L290 42 L285 78 L235 72 Z M35 75 L110 80 L100 120 L32 118 Z M110 80 L190 84 L185 125 L100 120 Z M190 84 L285 78 L288 122 L185 125 Z M32 118 L140 124 L135 165 L30 160 Z M140 124 L230 126 L228 168 L135 165 Z M230 126 L288 122 L290 165 L228 168 Z"/>' +
    lead(160, 60, 300, 20, 'Through / bond stones at intervals') + t(160, 190, 'Mortar joints; face stones dressed as per item', 'middle') + E };
  D.plaster_layers = { title: 'Plaster on masonry (section)', svg: H +
    r(40, 20, 90, 170) + hatch(40, 20, 90, 170) + r(130, 20, 18, 170, 'fl2') + r(148, 20, 8, 170, 'fl') +
    lead(85, 100, 20, 60, 'Masonry wall', 'start') + lead(139, 60, 220, 50, 'Plaster coat (12 / 15 / 20 mm)') + lead(152, 120, 220, 120, 'Finishing / paint (separate item)') +
    t(220, 170, 'Check thickness & mix in item', 'start') + E };
  D.dpc = { title: 'Damp proof course (section)', svg: H +
    r(110, 20, 100, 110) + hatch(110, 20, 100, 110) + r(105, 130, 110, 10, 'fl') + r(95, 140, 130, 45) + hatch(95, 140, 130, 45) +
    l(10, 150, 310, 150, 'gl') + t(20, 146, 'Ground level') + lead(215, 135, 260, 120, 'DPC at plinth level') + lead(160, 75, 260, 70, 'Wall above') + lead(160, 165, 260, 175, 'Foundation masonry') + E };
  D.floor_layers = { title: 'Floor build-up (section)', svg: H +
    r(20, 40, 280, 10, 'fl') + r(20, 50, 280, 12, 'fl2') + r(20, 62, 280, 28) + dots(20, 62, 280, 28) + r(20, 90, 280, 30) + hatch(20, 90, 280, 30) +
    lead(260, 45, 290, 20, 'Tiles / finish', 'end') + lead(220, 56, 250, 140, 'Bedding mortar') + lead(160, 76, 160, 150, 'Base concrete (PCC)') + lead(80, 105, 60, 165, 'Compacted fill / soil') + E };
  D.roof_waterproofing = { title: 'Roof waterproofing (section)', svg: H +
    r(20, 110, 280, 30) + hatch(20, 110, 280, 30) + '<path d="M20 110 L300 98 L300 90 L20 102 Z" class="fl2"/>' + '<path d="M20 102 L300 90 L300 84 L20 96 Z" class="fl"/>' +
    lead(160, 125, 200, 170, 'RCC roof slab') + lead(100, 102, 80, 60, 'Grading / screed to slope', 'start') + lead(240, 88, 250, 50, 'Waterproofing layer / treatment') + E };
  D.pipe_joint = { title: 'Spigot and socket pipe joint (section)', svg: H +
    r(20, 80, 150, 40) + '<path d="M150 70 L230 70 L230 130 L150 130"/>' + r(170, 80, 130, 40) + r(150, 75, 20, 5, 'fl') + r(150, 120, 20, 5, 'fl') +
    lead(90, 80, 70, 40, 'Spigot end', 'start') + lead(200, 70, 220, 35, 'Socket') + lead(160, 77, 90, 170, 'Joint: rubber ring / lead / cement mortar as per item') + E };
  D.manhole = { title: 'Manhole / inspection chamber (section)', svg: H +
    r(90, 30, 20, 140) + hatch(90, 30, 20, 140) + r(210, 30, 20, 140) + hatch(210, 30, 20, 140) + r(80, 170, 160, 18) + r(100, 22, 120, 8, 'fl') +
    '<path d="M110 160 Q160 185 210 160"/>' + l(30, 160, 110, 160) + l(210, 160, 300, 160) +
    lead(160, 26, 160, 8, 'Cover & frame') + lead(100, 100, 40, 90, 'Brick / RCC wall', 'start') + lead(160, 172, 160, 196, 'Base concrete') + lead(250, 160, 280, 130, 'Pipe / channel') + E };
  D.septic_tank = { title: 'Septic tank (section)', svg: H +
    r(30, 50, 260, 120) + l(200, 50, 200, 140) + r(30, 40, 260, 10, 'fl') + '<path d="M40 110 L190 110"/><path d="M210 120 L280 120"/>' +
    l(10, 80, 50, 80) + l(50, 80, 50, 120) + l(270, 80, 310, 80) + l(270, 80, 270, 125) +
    lead(20, 80, 20, 20, 'Inlet', 'start') + lead(300, 80, 300, 20, 'Outlet', 'end') + lead(200, 95, 230, 190, 'Baffle wall') + lead(110, 110, 110, 185, 'Liquid level') + lead(160, 45, 160, 25, 'Cover slab') + E };
  D.trench = { title: 'Trench excavation (section)', svg: H +
    l(10, 50, 110, 50, 'gl') + l(210, 50, 310, 50, 'gl') + '<path d="M110 50 L120 170 L200 170 L210 50"/>' + r(135, 140, 50, 30) +
    '<path d="M20 50 Q50 20 90 45" class="fl2"/>' + lead(60, 38, 40, 15, 'Excavated earth (stacked)', 'start') + lead(205, 110, 250, 100, 'Side (vertical or sloped)') + lead(160, 150, 250, 150, 'Pipe / foundation') +
    t(160, 195, 'Measured as trench section x length (IS 1200 Part 1)', 'middle') + E };
  D.formwork = { title: 'Formwork (centering & shuttering)', svg: H +
    r(40, 40, 240, 14) + r(40, 54, 240, 6, 'fl') + l(70, 60, 70, 180) + l(160, 60, 160, 180) + l(250, 60, 250, 180) + l(70, 120, 160, 120) + l(160, 120, 250, 120) +
    l(10, 180, 310, 180, 'gl') + lead(160, 47, 160, 20, 'Concrete (separate item)') + lead(250, 57, 290, 80, 'Shuttering plates / ply') + lead(70, 150, 30, 150, 'Props', 'end') + lead(205, 120, 290, 130, 'Bracing') + E };
  D.anti_termite = { title: 'Anti-termite treatment (pre-construction)', svg: H +
    l(10, 60, 90, 60, 'gl') + l(230, 60, 310, 60, 'gl') + '<path d="M90 60 L100 170 L220 170 L230 60"/>' + r(120, 120, 80, 50) +
    l(100, 170, 220, 170, 'dsh') + l(92, 70, 99, 165, 'dsh') + l(228, 70, 221, 165, 'dsh') +
    lead(160, 170, 250, 190, 'Chemical at bottom & sides of pit') + lead(160, 140, 250, 120, 'Foundation') + lead(40, 60, 30, 30, 'Plinth fill also treated', 'start') + E };
  D.false_ceiling = { title: 'False ceiling (section)', svg: H +
    r(20, 20, 280, 20) + hatch(20, 20, 280, 20) + l(70, 40, 70, 120) + l(160, 40, 160, 120) + l(250, 40, 250, 120) + r(20, 120, 280, 6, 'fl') + r(20, 126, 280, 8, 'fl2') +
    lead(160, 30, 200, 10, 'Roof slab') + lead(70, 80, 95, 95, 'Hangers / suspension rods') + lead(200, 123, 250, 160, 'Grid / runners') + lead(120, 130, 90, 170, 'Ceiling board / tiles') + E };
  D.steel_truss = { title: 'Steel roof truss (elevation)', svg: H +
    '<path d="M20 150 L160 40 L300 150 Z"/>' + l(90, 150, 90, 95) + l(230, 150, 230, 95) + l(160, 150, 160, 40) + l(90, 95, 160, 150) + l(230, 95, 160, 150) +
    lead(90, 95, 40, 70, 'Principal rafter', 'start') + lead(200, 150, 240, 180, 'Tie (bottom chord)') + lead(125, 122, 60, 190, 'Struts / ties (web members)') + lead(160, 40, 200, 20, 'Ridge') + E };
  D.pavement_flexible = { title: 'Flexible (bituminous) pavement layers', svg: H +
    r(20, 30, 280, 12, 'fl') + r(20, 42, 280, 18, 'fl2') + r(20, 60, 280, 30) + dots(20, 60, 280, 30) + r(20, 90, 280, 30) + r(20, 120, 280, 40) + hatch(20, 120, 280, 40) +
    lead(300, 36, 305, 20, 'Wearing course (BC / SDBC / SMA)', 'end') + lead(250, 51, 250, 51, '  Binder (DBM / BM)') + lead(200, 75, 200, 75, '  Base (WMM / WBM)') + lead(150, 105, 150, 105, '  Sub-base (GSB)') + lead(100, 140, 100, 140, '  Subgrade') + E };
  D.pavement_rigid = { title: 'Rigid (cement concrete) pavement', svg: H +
    r(20, 40, 280, 40) + l(160, 40, 160, 80, 'dsh') + r(20, 80, 280, 25, 'fl2') + r(20, 105, 280, 25) + dots(20, 105, 280, 25) + r(20, 130, 280, 40) + hatch(20, 130, 280, 40) +
    lead(90, 60, 60, 25, 'PQC slab', 'start') + lead(160, 45, 200, 20, 'Joint with dowel bars') + lead(250, 92, 290, 92, 'DLC', 'end') + lead(250, 117, 290, 117, 'GSB', 'end') + lead(250, 150, 290, 150, 'Subgrade', 'end') + E };
  D.kerb_channel = { title: 'Kerb and channel (section)', svg: H +
    r(40, 60, 30, 70) + r(70, 115, 90, 15, 'fl2') + r(160, 105, 140, 25) + dots(160, 105, 140, 25) + r(30, 130, 270, 20) +
    lead(55, 60, 55, 30, 'Kerb stone') + lead(115, 122, 115, 175, 'Channel / gutter') + lead(230, 117, 250, 70, 'Road pavement') + lead(160, 140, 200, 185, 'Bedding concrete') + E };
  D.pipe_culvert = { title: 'Pipe culvert (section across road)', svg: H +
    '<path d="M20 60 L100 60 L150 40 L170 40 L220 60 L300 60"/>' + '<circle cx="160" cy="120" r="30"/>' + '<circle cx="160" cy="120" r="24"/>' + r(110, 150, 100, 20) + r(20, 100, 40, 60) + r(260, 100, 40, 60) +
    lead(160, 40, 160, 15, 'Road') + lead(185, 110, 250, 90, 'Hume (RCC) pipe') + lead(160, 160, 160, 190, 'Bedding / cradle') + lead(40, 130, 20, 185, 'Head wall', 'start') + E };
  D.bridge_bearing = { title: 'Bridge bearing (elevation)', svg: H +
    r(20, 30, 280, 30) + r(120, 60, 80, 10, 'fl') + r(125, 70, 70, 26, 'fl2') + r(120, 96, 80, 10, 'fl') + r(80, 106, 160, 60) + hatch(80, 106, 160, 60) +
    lead(60, 45, 40, 20, 'Deck / girder', 'start') + lead(160, 83, 250, 70, 'Elastomeric pad / bearing') + lead(200, 101, 260, 100, 'Pedestal') + lead(160, 140, 250, 180, 'Pier / abutment cap') + E };
  D.pile = { title: 'Bored cast-in-situ pile (section)', svg: H +
    l(10, 40, 310, 40, 'gl') + r(130, 20, 60, 20, 'fl2') + r(140, 40, 40, 150) + l(147, 40, 147, 185) + l(173, 40, 173, 185) + l(147, 70, 173, 70) + l(147, 100, 173, 100) + l(147, 130, 173, 130) + l(147, 160, 173, 160) +
    lead(160, 25, 230, 15, 'Pile cap (separate item)') + lead(180, 100, 240, 100, 'Pile shaft (dia. as per item)') + lead(173, 130, 240, 140, 'Reinforcement cage') + t(20, 36, 'Ground level') + E };
  D.well_foundation = { title: 'Well foundation (section)', svg: H +
    r(90, 20, 140, 16, 'fl2') + r(90, 36, 26, 130) + hatch(90, 36, 26, 130) + r(204, 36, 26, 130) + hatch(204, 36, 26, 130) + '<path d="M90 166 L116 166 L105 186 Z M204 166 L230 166 L219 186 Z" class="fl"/>' + r(116, 140, 88, 26) +
    lead(160, 28, 250, 12, 'Well cap') + lead(103, 100, 40, 90, 'Steining', 'start') + lead(105, 180, 40, 185, 'Cutting edge / curb', 'start') + lead(160, 153, 260, 170, 'Bottom plug') + E };
  D.retaining_wall = { title: 'Retaining wall (section)', svg: H +
    '<path d="M120 20 L150 20 L170 160 L120 160 Z"/>' + r(90, 160, 150, 22) + '<path d="M150 20 L300 20 L300 160 L170 160" class="fl2"/>' + l(10, 160, 90, 160, 'gl') +
    '<circle cx="130" cy="120" r="3"/>' + lead(135, 90, 60, 70, 'Wall stem', 'start') + lead(130, 120, 60, 125, 'Weep hole', 'start') + lead(240, 90, 250, 60, 'Retained earth / backfill') + lead(160, 171, 200, 195, 'Base / footing') + E };
  D.embankment = { title: 'Embankment (cross-section)', svg: H +
    '<path d="M20 160 L110 60 L210 60 L300 160 Z"/>' + l(10, 160, 310, 160, 'gl') + l(60, 105, 260, 105, 'dsh') + l(40, 132, 280, 132, 'dsh') +
    lead(160, 60, 160, 30, 'Top width / crest') + lead(65, 110, 30, 80, 'Side slope (e.g. 2H:1V)', 'start') + lead(160, 132, 230, 185, 'Layers compacted 15-25 cm') + E };
  D.canal_lining = { title: 'Lined canal (cross-section)', svg: H +
    l(10, 40, 70, 40, 'gl') + l(250, 40, 310, 40, 'gl') + '<path d="M70 40 L120 150 L200 150 L250 40"/>' + '<path d="M76 40 L124 144 L196 144 L244 40" class="fl"/>' + l(98, 90, 222, 90, 'dsh') +
    lead(98, 90, 30, 110, 'Full supply level', 'start') + lead(160, 147, 160, 185, 'Bed lining (concrete / tiles)') + lead(230, 60, 290, 90, 'Side lining', 'end') + E };
  D.gabion = { title: 'Gabion / sausage crates (section)', svg: H + (function () {
    var s = ''; [[40, 130], [110, 130], [180, 130], [75, 80], [145, 80], [110, 30]].forEach(function (p) { s += r(p[0], p[1], 70, 50); for (var i = 1; i < 5; i++) s += l(p[0] + i * 14, p[1], p[0] + i * 14, p[1] + 50, 'ht'); s += l(p[0], p[1] + 25, p[0] + 70, p[1] + 25, 'ht'); }); return s; })() +
    lead(145, 105, 260, 90, 'Wire mesh crate filled with boulders') + l(10, 180, 310, 180, 'gl') + E };
  D.sluice_gate = { title: 'Sluice gate (elevation)', svg: H +
    r(60, 20, 200, 20) + r(60, 40, 24, 150) + r(236, 40, 24, 150) + r(90, 90, 140, 90, 'fl2') + l(160, 20, 160, 90) + r(150, 8, 20, 12) +
    lead(160, 14, 220, 8, 'Hoist / spindle') + lead(230, 135, 290, 120, 'Gate leaf', 'end') + lead(72, 110, 30, 90, 'Groove / guide', 'start') + lead(160, 30, 100, 55, 'Headwall', 'end') + E };
  window.DIAGRAMS = D;
})();
