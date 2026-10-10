// "Typically used in" line on each item card: the kinds of works / buildings where the item is
// generally used, worked out from the schedule, category and description (plus the item's own
// "where it is used" note from the explanation).
(function () {
  'use strict';
  var P = {
    house: '🏠 Houses & govt. quarters', office: '🏢 Offices & public buildings', school: '🏫 Schools & colleges',
    hosp: '🏥 Hospitals & health centres', shed: '🏭 Sheds, workshops & godowns', road: '🛣️ Roads & highways',
    bridge: '🌉 Bridges & culverts', canal: '🌊 Canals & channels', bank: '⛰️ Embankments & river banks',
    gate: '🚧 Barrages, sluices & regulators', water: '🚰 Water supply', drain: '🚽 Drainage & sewerage',
    site: '🌳 Campus roads, paths & landscaping', repair: '🔧 Repairs to existing buildings', analysis: '🧮 Rate analysis (basic rate)'
  };
  var WORK = {};
  try { Object.keys(window.SCHEDULES || {}).forEach(function (k) { WORK[k] = window.SCHEDULES[k].work; }); } catch (e) { /* ignore */ }

  function has(t, re) { return re.test(t); }
  function places(it, e) {
    var t = ((it.category || '') + ' | ' + (it.description || '')).toLowerCase();
    var work = WORK[it.schedule] || 'building', out = [];
    function add() { for (var i = 0; i < arguments.length; i++) if (out.indexOf(arguments[i]) < 0) out.push(arguments[i]); }
    if (e && e.generic) return [P.analysis];
    if (work === 'road') {
      if (has(t, /bridge|pier|abutment|girder|bearing|well foundation|\bpiles?\b|culvert|deck|expansion joint|parapet|wing wall|returns?\b/)) add(P.bridge);
      if (!out.length || has(t, /road|pavement|bituminous|wmm|gsb|kerb|shoulder|carriageway|embankment|sub.?grade/)) add(P.road);
      if (has(t, /drain|culvert/)) add(P.drain);
      return out.slice(0, 3);
    }
    if (work === 'irrigation') {
      if (has(t, /sluice|gate|regulator|barrage|hoist|weir|\block\b|shutter|syphon|aqueduct|fall\b/)) add(P.gate);
      if (has(t, /canal|channel|lining|distributary|khal|minor|outlet/)) add(P.canal);
      if (has(t, /embank|bund|\bbanks?\b|spur|revet|bamboo|porcupine|boulder|sand ?bag|gabion|river|erosion|crate|apron|pitching|launching|bed bar|dredg|tetrapod/)) add(P.bank);
      if (has(t, /building|quarter|office|residen/)) add(P.house, P.office);
      if (!out.length) add(P.canal, P.bank, P.gate);
      return out.slice(0, 3);
    }
    // building schedules (CPWD DSR, WB PWD Bldg / Sanitary)
    if (has(t, /repair|dismantl|demolish|removing|making good|renew|replac/)) add(P.repair);
    if (has(t, /hospital|operation theatre|\bo\.?t\.?\b|medical gas|lead lining|x.?ray|radiation/)) add(P.hosp);
    if (has(t, /sewer|manhole|septic|soak pit|gully|inspection chamber|stoneware|\bswr\b|sewerage|drain/)) add(P.drain);
    if (has(t, /water supply|\bg\.?i\.? pipe|cpvc|\bppr\b|hdpe|water meter|ferrule|stop cock|\btaps?\b|\bvalves?\b|water tank|pump|tube ?well|bore ?well/)) add(P.water);
    if (has(t, /road work|\broads?\b|bituminous|kerb|paver|interlocking|footpath|horticulture|grass|lawn|\bplants?\b|\btrees?\b|hedge|turf|fencing|boundary wall/)) add(P.site);
    if (has(t, /truss|\bsheds?\b|industrial|corrugated|roof sheet|profile sheet|structural steel|portal|godown|workshop/)) add(P.shed);
    if (has(t, /false ceiling|curtain wall|structural glazing|acoustic|panelling|wall paper|decorative|granite|marble|\blift\b|escalator|fire|sprinkler|modular|raised floor|aluminium/)) add(P.office, P.hosp);
    if (out.length < 3) add(P.house, P.office, P.school);
    return out.slice(0, 3);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function html(it, e) {
    var p = places(it, e), note = e && e.u && !e.generic ? e.u : '';
    return '<div class="usage"><span class="usage-l">Typically used in</span>' +
      p.map(function (x) { return '<span class="usage-c">' + esc(x) + '</span>'; }).join('') +
      (note ? '<div class="usage-n">' + esc(note) + '</div>' : '') + '</div>';
  }
  window.UsageHint = { places: places, html: html };
})();
