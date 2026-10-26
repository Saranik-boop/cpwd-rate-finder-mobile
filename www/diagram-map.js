// Which drawing every item gets. Order of decision:
//  1. family rules that always win (basic rates, labour, hire, carriage, testing, painting, dismantling, and
//     chapters with their own drawing: thatch, fencing, soil pipes, signs ...);
//  2. newer specific drawings that replace an older link (rolling shutter, toilet fittings, tank, tube well ...);
//  3. the drawing already linked in the item's explanation;
//  4. specific words in the description (hinges, window, false ceiling, truss, gate, stair, lintel ...);
//  5. for building schedules: general words (floor, plaster, brick work, concrete, excavation ...);
//  6. the chapter / category of the item (every category is listed); 7. the schedule.
// The part shown in orange is then chosen from the description by DiagramKit.pickFocus.
(function () {
  'use strict';
  function R(d, o) { o.d = d; return o; }
  var MAIN = /\b(?:including|incl\.|excluding|excl\.|complete|with necessary|but without)\b/i;
  var FLOORLVL = /\b(up ?to|upto|above|below|for each|each additional|additional|ground|first|second|third|1st|2nd|3rd|\d+th|in) floors?( (five|v|level|i|ii|iii|iv))?\b|\bfloors? (five|v|level|i|ii|iii|iv)\b|\bfloor v\b|\bstorey\b/gi;
  var FIT = /\b(hinges?|tower bolts?|aldrops?|handles?|door closers?|floor spring|door stoppers?|hasp|haskal|latch|mortice lock|sliding door bolt|casement stays?|catch hooks?|hooks and eyes|pivots?|kick plate|door seal|magnetic catch|buffer|stays?|bolts? (black|bright|anodised|oxidised|chromium)|fittings? (for|of) (doors?|windows?))\b/i;
  function key(desc) { var m = desc.split(MAIN)[0], parts = desc.split(/\s:\s/); return (m + ' ' + parts.slice(1).join(' ')).replace(FLOORLVL, ' ').replace(ROADBRIDGE, ' '); }
  // "Specifications for Road & Bridge Works of MoRT&H" is a book title, not a bridge item
  var ROADBRIDGE = /road\s*(&|and)\s*bridge works?|road and bridges?|r\s*&\s*b\b/gi;
  var PIPECAT = /water supply|g\.?i\.? pipe|cpvc|soil pipe|sanitary|cistern|basin|closets|tube ?well|hydrant|ferrule|drainage|inspection pit|harvesting/i;

  // ---- 1. family rules (cat = category, re = whole description, start = main clause) ----
  var FAMILY = [
    R('machinery', { cat: /hire charges|plants? & machinery/i }),
    R('labour', { cat: /basic rates - labour|section ii\) - labour|labour rate for|wages/i }),
    R('labour', { re: /^\W*daily wage rate|^\W*(mason|carpenter|beldar|mazdoor|coolie|plumber|fitter|painter|blacksmith|welder|chowkidar|bhisti|helper|mate|driver|operator)\b[^:]{0,40}$/i }),
    R('materials', { cat: /basic rates|materials delivered|cost of materials|annexure|ex-outlet|supply of materials|aggregates at (railway|quarry)/i }),
    R('carriage', { cat: /carriage|loading, unloading/i }),
    R('carriage', { start: /^\W*(carriage of|loading|unloading|cost of haulage|haulage|transportation of|lead\b|extra (rate )?(over|for) .{0,30}carriage|extra for (additional )?lead|extra for carriage)/i }),
    R('soil_testing', { cat: /soil boring and testing/i }),
    R('soil_testing', { start: /^\W*(conducting|testing of (soil|material|concrete|cube)|test for|field density test|plate load test|standard penetration|sampling)/i }),
    R('mortar', { cat: /^mortars$/i }),
    R('dismantling', { cat: /dismantling|demolish/i, notre: /^\W*(cleaning|scraping)/i }),
    R('dismantling', { start: /^\W*(dismantling|demolishing|demolition|removing (old |existing )?(and stacking )?(brick|stone|tiles?|sheets?|doors?|windows?|floor|plaster|concrete)|removal of rubbish|cutting (holes|chase|openings?))/i, notcat: /sluice|water supply|g\.?i\.? pipe|cpvc|soil pipe|sanitary|cistern|basin|closets|tube well|hydrant|glazier|aluminium|wood and pvc|fencing|thatch|steel works|site clearance/i }),
    R('painting', { cat: /white wash|colour wash|distemper|painting, vernishing/i }),
    R('painting', { start: /^\W*(painting|applying (priming|a coat|one coat|two coats|.{0,40}\bpaint|.{0,40}primer|.{0,40}distemper)|priming coat|white ?washing|colour ?washing|distempering|wall painting|finishing walls with|polishing|french polish|varnishing|wax polish|coal ?tarring|tarring)/i, notre: /^\W*(grinding|polishing) (only )?(of )?(old )?(marble|terrazz?o|mosaic|kota|granite|stone|floor)/i }),
    R('thatch_hut', { cat: /thatch, mud and bamboo/i }),
    R('fencing', { cat: /\(o\) fencing/i }),
    R('brick_soling', { cat: /soling, edging and metalling/i }),
    R('dug_well', { cat: /well for water supply/i }),
    R('temporary', { cat: /event management/i }),
    R('horticulture', { cat: /horticulture/i }),
    R('mouldings', { cat: /band moulding, cornice/i }),
    R('glazing_facade', { cat: /structural glazing|composite panel/i }),
    R('recharge_pit', { cat: /rain water harvesting/i, re: /recharge|\bpits?\b|boulders?|gravel|filter|percolation|harvest/i }),
    R('tube_well', { cat: /rain water harvesting|tube ?well/i }),
    R('site_clearance', { cat: /site clearance/i }),
    R('kerb_channel', { cat: /traffic signs|road appurtenances/i, start: /\bkerbs?\b/i }),
    R('road_furniture', { cat: /traffic signs|road appurtenances/i }),
    R('reinforced_earth', { cat: /geosynthetics|reinforced earth/i }),
    R('road_repair', { cat: /maintenance of roads/i }),
    R('rainwater_pipe', { re: /rain ?water pipe|\bdown ?pipe|rain water spout|\br\.w\.p\b|eaves gutter|valley gutter/i, notcat: /water supply|harvesting/i }),
    R('rainwater_pipe', { cat: /drain, down pipes/i }),
    R('sanitary', { start: /water closets?|w\.?c\.? pans?|squatting pan|orissa pattern|wash ?basins?|\bsinks?\b|urinals?|flushing cisterns?|closet seat|\be\.?w\.?c\b|pedestal pan|mirror|towel|soap (dish|holder)|grab bar/i, cat: /sanitary installations|basin|closets|soil pipe|\(c-i\) miscellaneous/i }),
    R('soil_pipe', { cat: /soil pipe/i }),
    R('soil_pipe', { start: /\b(soil pipe|waste pipe|s\.?w\.?r\b|swr pipe|s\.?c\.?i\.?\b|sand cast iron|hubless|vent pipe|cowl|heel rest|invert branch|gully trap|anti.?syphon|fresh air inlet)/i, notre: /pressure pipe|water supply/i, notcat: /water supply|g\.?i\.? pipe|cpvc/i }),
    R('water_tank', { cat: /cistern, g\.?i\.? tanks/i, re: /\btanks?\b|cistern/i }),
    R('sanitary', { cat: /cistern, g\.?i\.? tanks|basin and sinks|water closets and urinals/i }),
    R('water_main', { cat: /hydrant|ferrule/i }),
    R('water_main', { re: /\b(c\.?i\.?|d\.?i\.?|ductile iron|cast iron|centrifugally cast|spun iron|h\.?d\.?p\.?e|pe.?al.?pe|composite pressure)\b|sluice valve|air valve|reflux valve|butterfly valve|fire hydrant|ferrule|water meter|surface box/i, cat: /water supply|g\.?i\.? pipe/i }),
    R('repair', { cat: /statues and monuments|conservation of heritage|concrete works etc\. - repair/i }),
    R('reinforced_earth', { start: /geogrid|geocell|geotextile|geo.?composite|drainage composite/i, notcat: /protective|river|protection|bituminous|surface courses|water ?proofing/i })
  ];

  var STRONG = /^(rolling_shutter|sanitary|water_tank|tube_well)$/;

  // ---- 4. specific words (all schedules) ----
  var SPECIFIC = [
    R('labour', { re: /security guard|watch (&|and) ward/i }),
    R('bridge', { re: /\b(expansion joint|wearing coat|crash barrier|approach slab|drainage spouts?|elastomeric (slab )?seal|strip seal|asphaltic plug|superstructure span|bridge)\b/i, notre: /floor|roof/i, sched: /PWD-NH|PWD-RB/ }),
    R('door_fittings', { re: FIT }),
    R('door_flush', { re: /flush (door|shutter)/i }),
    R('window', { re: /\bwindows?\b|ventilators?|glass panes?|glazing bars?|\bsash|louv(re|er)|venetian|glazed shutters?|wire gauze|fly ?proof|mosquito/i }),
    R('false_ceiling', { re: /false ceiling|ceiling (tiles?|boards?|panels?)|suspended ceiling|hessian ceiling|canvas ceiling|\bgrid ceiling/i }),
    R('woodwork', { re: /panell?ing|\bpartitions?\b|wall lining|\bshel(f|ves)\b|cupboard|wardrobe|pelmet|\bdrawers?\b|\brafters?\b|post plates?|eaves board|burgah|karries|wooden (beams?|joists?|posts?)|timber (beams?|joists?|posts?)|\bwood work in\b|work bench/i, notcat: /door window/i }),
    R('door_panelled', { re: /\bdoors?\b|door shutters?|chowkh?ats?\b|\bframes? of doors?|door frame/i, notre: /\bdoors? (tee|bend)/i }),
    R('steel_truss', { re: /\btruss(es)?\b|\bpurlins?\b|roof(ing)? sheets?|sheet roofing|corrugated|\bg\.?c\.?i\.? sheets?|\ba\.?c\.? sheets?|asbestos|polycarbonate sheets?|fibre glass sheet|\bridg(e|ing|es)\b(?! seal)|structural (steel|works?)|\br\.?s\.? joists?|holding down bolts?|steel sections/i }),
    R('boundary_wall', { re: /\bgrill|grille|railing|\bgates?\b|collapsible|boundary wall|compound wall|boundary pillar/i, notcat: /sluice/i })
  ];

  // ---- 5. general words, building schedules only ----
  var BUILD = [
    R('wall_tiles', { re: /cladding|veneer work|\bdado\b|wall tiles?|\bskirting/i }),
    R('floor_layers', { re: /\bfloor(ing|s)?\b|\btiles?\b|\bpavers?\b|terraz+o|\bkota\b|\bmarble\b|\bgranite\b|\bvinyl\b(?! chloride)|carpet|\bi\.?p\.?b\b|chequer|nosing|treads?\b/i }),
    R('roof_waterproofing', { re: /water ?proof|terrac|khurra|membrane|mud phuska|brick bat coba|roof treatment|insulation|tarfelt|bitumen felt/i }),
    R('plaster_layers', { re: /\bplaster|\bpointing\b|punning|\brendering\b|wall putty|texture|rough cast|\bv.?groove/i }),
    R('stone_masonry', { re: /stone work|rubble|ashlar|stone masonry|\bstone (dowel|bracket|jali|chajja)/i }),
    R('brick_bond', { re: /brick ?work|\bbricks?\b|block masonry|\baac\b|masonry|blocks? work/i }),
    R('formwork', { re: /centering|centring|\bshuttering\b|formwork|staging|scaffolding/i }),
    R('rcc_slab_beam', { re: /reinforced cement concrete|\br\.?c\.?c\b|steel reinforcement|\btmt\b|reinforcement|\bprecast|hollow core|\bslabs?\b|\bbeams?\b/i }),
    R('rcc_column_footing', { re: /cement concrete|\bconcrete\b|\bp\.?c\.?c\b|lime concrete|plum concrete/i }),
    R('trench', { re: /excavat|earth ?work|\bfilling\b|\btrench|digging|surface dressing|timbering/i }),
    R('anti_termite', { re: /termite/i }),
    R('water_pipe', { re: /\bpipes?\b|\bvalves?\b|\btaps?\b|\bcocks?\b/i }),
    R('repair', { re: /\brepair|\brenew|\bpatch|\bcracks?\b|grout|epoxy|polymer|bonding agent/i })
  ];

  // ---- chapters decided by their own sub-rules (checked right after the linked drawing) ----
  var WOODSUB = [[FIT, 'door_fittings'], [/flush/i, 'door_flush'], [/window|ventilator|glaz|\bsash|louv|venetian|wire gauze|fly ?proof|glass/i, 'window'], [/ceiling/i, 'false_ceiling'],
    [/panell?ing|partition|lining|\bboards?\b|shel(f|ves)|cupboard|pelmet|drawer|wardrobe|kitchen|plank|eaves|rafters?|posts?|beams?|burgah|purlin|truss/i, 'woodwork'], [/stair|hand ?rail|balust|railing/i, 'staircase'],
    [/frame|chowkh?at|doors?|shutters?/i, 'door_panelled']];
  var FIRST = [
    { cat: /^pile work$/i, d: 'pile', sub: [] },
    { cat: /special items for sluice/i, d: 'sluice_gate', sub: [] },
    { cat: /^(\(1[34]\) )?(sub|super)-?structure$/i, sched: /PWD-NH|PWD-RB/, d: 'bridge', sub: [[/^\W*.{0,60}\b(bullah|eucalyptus|staging|centering|shuttering)\b/i, 'formwork'], [/bearing/i, 'bridge_bearing']] },
    { cat: /^(\(16\) )?repair and rehabilitation$/i, sched: /PWD-NH|PWD-RB/, d: 'bridge', sub: [[/^\W*.{0,60}\b(bullah|eucalyptus|staging)\b/i, 'formwork'], [/bearing/i, 'bridge_bearing'], [/crack|epoxy|grout|guniting|shotcrete|jacket|polymer|patch(ing)? of (damaged )?concrete|concrete surface|spall/i, 'repair'], [/pavement|bituminous|pot ?holes?|patch|surface dressing|road surface|shoulder/i, 'road_repair']] },
    { cat: /^miscellaneous works$/i, sched: /PWD-RB/, d: 'road_repair', sub: [[/bamboo|bullah|eucalyptus|drum sheet|porcupine/i, 'bank_protection'], [/railing|parapet|wheel guard|bridge/i, 'bridge'], [/joists?|angles?|channels?|steel (elements|materials)|plates/i, 'steel_truss']] },
    { cat: /^concrete work$/i, d: 'rcc_column_footing', sub: [[/centering|shuttering|formwork/i, 'formwork'], [/(solid|hollow|precast).{0,30}blocks?/i, 'brick_bond'], [/plinth protection|kerb|channel/i, 'kerb_channel'], [/stair|steps?\b/i, 'staircase'], [/d\.?p\.?c|damp proof/i, 'dpc'], [/bollard|jali/i, 'rcc_slab_beam']] },
    { cat: /reinforced cement concrete/i, sched: /CPWD/, d: 'rcc_slab_beam', sub: [[/centering|shuttering|formwork|staging/i, 'formwork'], [/column|footing|foundation|plinth|raft/i, 'rcc_column_footing'], [/stair/i, 'staircase'], [/lintel|chajja|sunshade/i, 'lintel_chajja'], [/well.?steining/i, 'well_foundation'], [/curing compound|finishing of the exposed|plaster/i, 'plaster_layers'], [/expansion joint/i, 'repair']] },
    { cat: /^masonry work$/i, d: 'brick_bond', sub: [] },
    { cat: /^stone work$/i, d: 'stone_masonry', sub: [[/chajja/i, 'lintel_chajja'], [/\bfloor(ing)?\b|treads?\b|steps?\b/i, 'floor_layers']] },
    { cat: /^flooring$/i, d: 'floor_layers', sub: [[/stair|treads?\b|steps?\b|risers?/i, 'staircase'], [/skirting|dado/i, 'wall_tiles']] },
    { cat: /^cladding work$/i, d: 'wall_tiles', sub: [[/kitchen platform|counter|vanity/i, 'woodwork']] },
    { cat: /^water proofing$/i, d: 'roof_waterproofing', sub: [[/water ?stops?|basement|retaining|raft/i, 'rcc_slab_beam'], [/tanks?\b|reservoir/i, 'water_tank']] },
    { cat: /^earth work$/i, d: 'trench', sub: [[/termite/i, 'anti_termite'], [/embank|banking|bund/i, 'embankment'], [/surface dressing|jungle|clearing/i, 'site_clearance']] },
    { cat: /^road work$/i, d: 'pavement_flexible', sub: [[/sign ?boards?|road marking|kilomet|km stone|delineator|crash barrier/i, 'road_furniture'], [/kerb|channel|footpath|paver|interlocking/i, 'kerb_channel'], [/cement concrete pavement|in roads|c\.?c\.? pavement|pqc|dowel|dry lean/i, 'pavement_rigid'], [/fenc|posts?\b|struts|pales/i, 'fencing'], [/gabion/i, 'gabion'], [/edging|bajri path|\bpath\b/i, 'brick_soling'], [/^\W*supplying (and stacking )?at site/i, 'materials'], [/cutting road|making good/i, 'road_repair']] },
    { cat: /^roofing$/i, d: 'roof_waterproofing', sub: [[/stone slab/i, 'roof_waterproofing'], [/ceiling|insulat/i, 'false_ceiling'], [/sheets?\b|corrugated|truss|purlin|ridg|valley|roofing accessor|flashing|fibre cement|aluminium roofing|polycarbonate/i, 'steel_truss'], [/rain ?water|gutter|spout|grating/i, 'rainwater_pipe'], [/stone slab|karries|battens/i, 'woodwork']] },
    { cat: /^steel work$|structural steel works/i, d: 'steel_truss', sub: [[/rolling shutter/i, 'rolling_shutter'], [/collapsible|grill|grille|\bgates?\b|railing|haskal|jail/i, 'boundary_wall'], [/windows?|ventilators?|doors?|glazed|t-iron frame|fly proof|wire gauze|\bsash/i, 'window'], [/stair|ladder|hand ?rail/i, 'staircase']] },
    { cat: /^finishing$/i, d: 'plaster_layers', sub: [[/paint|primer|distemper|wash|polish|varnish/i, 'painting'], [/\bband\b|moulding|cornice|drip|throating|groove|nosing/i, 'mouldings'], [/dado|skirting/i, 'wall_tiles']] },
    { cat: /new technologies/i, d: 'repair', sub: [[/geogrid|geocell|geotextile|soil reinforcement/i, 'reinforced_earth'], [/transportation/i, 'carriage'], [/doors?\b|shutters?/i, 'door_panelled'], [/windows?/i, 'window'], [/bamboo|wood|ply\b|plywood|skirting|board/i, 'woodwork'], [/hollow core|precast|prestressed|\bslabs?\b|beams?\b|columns?|eps\b|sandwich|wall panels?|light ?weight|reinforcement|rust|wire (mesh|fabric)/i, 'rcc_slab_beam'], [/floor|tiles?|pavers?/i, 'floor_layers'], [/plaster|putty/i, 'plaster_layers'], [/water ?proof|membrane|coating/i, 'roof_waterproofing']] },
    { cat: /^drainage$/i, d: 'manhole', sub: [[/gully/i, 'soil_pipe'], [/manhole|chamber|cover|frame|steps?\b|foot ?rest/i, 'manhole'], [/s\.?w\.? pipes?|stoneware|sewer|r\.?c\.?c\.? pipes?|hume|\bpipes?\b/i, 'pipe_joint']] },
    { cat: /^water supply$/i, d: 'water_pipe', sub: [[/\btanks?\b|cistern/i, 'water_tank'], [/excavat|trench|refilling/i, 'trench'], [/tube ?well/i, 'tube_well']] },
    { cat: /^aluminium work$|\(r\) aluminium/i, d: 'window', sub: [[FIT, 'door_fittings'], [/ceiling/i, 'false_ceiling'], [/partition|panel|board/i, 'woodwork'], [/doors?\b/i, 'door_panelled']] },
    { cat: /^wood and pvc work$|\(09\) wood/i, d: 'door_panelled', sub: WOODSUB },
    { cat: /wood and pvc works - (door window frame|door window shutter)/i, d: 'door_panelled', sub: WOODSUB },
    { cat: /wood and pvc works - repair/i, d: 'door_panelled', sub: WOODSUB },
    { cat: /wood and pvc works - accessories/i, d: 'door_fittings', sub: [[/sash bar|louv|venetian|windows?/i, 'window']] },
    { cat: /wood and pvc works - additional/i, d: 'woodwork', sub: [[/doors?|shutters?/i, 'door_panelled']] },
    { cat: /miscellaneous woodwork/i, d: 'woodwork', sub: [[/louv|venetian|valves/i, 'window'], [/stair|hand ?rail|balust/i, 'staircase'], [/doors?\b/i, 'door_panelled']] },
    { cat: /wall panelling/i, d: 'woodwork', sub: [] },
    { cat: /\(a\) earth work/i, d: 'trench', sub: [[/termite/i, 'anti_termite'], [/surface dressing|jungle/i, 'site_clearance']] },
    { cat: /brick works$/i, d: 'brick_bond', sub: [[/brick[- ]on[- ]edge (floor|pavement)|brick (floor|flooring|pavement)|\bpavement|soling|flat brick|floor or pavement/i, 'brick_soling'], [/\bstone (masonry|work)|rubble/i, 'stone_masonry']] },
    { cat: /concrete works etc\. - concrete works/i, d: 'rcc_column_footing', sub: [[/pile/i, 'pile'], [/centering|shuttering|formwork/i, 'formwork'], [/lintel|chajja/i, 'lintel_chajja'], [/stair/i, 'staircase'], [/(hollow|stone|precast|concrete).{0,20}blocks?|masonry/i, 'brick_bond'], [/shel(f|ves)/i, 'woodwork'], [/d\.?p\.?c|damp/i, 'dpc'], [/reinforc|\br\.?c\.?c?\b|rcc/i, 'rcc_slab_beam'], [/\bfloor|pavement|terraz/i, 'floor_layers']] },
    { cat: /\(d\) flooring/i, d: 'floor_layers', sub: [[/dado|skirting|\bwalls?\b|columns?|facia|cladding/i, 'wall_tiles'], [/stair|treads?\b|steps?\b|risers?|nosing/i, 'staircase']] },
    { cat: /roofing, sheet walling.*repair/i, d: 'roof_waterproofing', sub: [[/sheets?\b|ridg|hook.?bolt|corrugated|asbestos|g\.?c\.?i/i, 'steel_truss'], [/beams?\b|joists?|karr|battens?|rafters?|purlins?/i, 'woodwork'], [/channel drain|gutter|spout/i, 'rainwater_pipe'], [/plaster|rounding/i, 'plaster_layers']] },
    { cat: /roofing & sheetwalling/i, d: 'steel_truss', sub: [[/\btiles?\b|ranigunge|mangalore/i, 'roof_waterproofing'], [/gutter|spout|down ?pipe/i, 'rainwater_pipe']] },
    { cat: /\(i\) plastering/i, d: 'plaster_layers', sub: [[/groove/i, 'mouldings']] },
    { cat: /compound development/i, d: 'boundary_wall', sub: [[/pavement|soling|\bpath/i, 'brick_soling'], [/plaque|letters?|digits?|number/i, 'mouldings'], [/gabion/i, 'gabion'], [/guard post|posts?\b/i, 'fencing']] },
    { cat: /\(t\) miscellaneous works - maintenance/i, d: 'repair', sub: [[/balust/i, 'mouldings'], [/plants? from|uprooting/i, 'site_clearance'], [/expansion joint|crack|grout|sleeve/i, 'repair'], [/brick|masonry/i, 'brick_bond']] },
    { cat: /earthwork for rivers/i, d: 'embankment', sub: [[/re-?excavation|silt clearance|excavation (in|of) (the )?(canals?|drainage channels?|channels?|river)|channels? \/|khal/i, 'canal_lining'], [/^\W*(cutting|clearing|removal of)|jungle|stumps?|uproot|hyacinth/i, 'site_clearance'], [/^\W*extra (rate )?.{0,40}(carriage|lead)|\bcarriage of\b/i, 'carriage']] },
    { cat: /protective and lining/i, d: 'pitching', sub: [[/bamboo|bullah|ballah|jhaw|eucalyptus|\bpiles?\b|\bpins?\b|wailing|dip trees?|darma|\bmats?\b|brush ?wood|porcupine|screen/i, 'bank_protection'], [/\bbags?\b|gunny|polythene/i, 'bank_protection'], [/sausage|crates?|wire netting|g\.?i\.? wire|\bmesh\b|cage|gabion|mattress/i, 'gabion'], [/lining|canal|channel bed/i, 'canal_lining']] },
    { cat: /^miscellaneous items$/i, sched: /I&WD/, d: 'embankment', sub: [[/bailing|pump/i, 'machinery'], [/stone column/i, 'pile'], [/wood ?work|shutters?|posts|trusses|rafters|beams/i, 'woodwork'], [/nuts|bolts|nails/i, 'materials']] },
    { cat: /\(c-i\) miscellaneous/i, d: 'water_pipe', sub: [[/gully|grating|soil|waste/i, 'soil_pipe'], [/manhole|chamber|cover/i, 'manhole'], [/tube ?well|strainer/i, 'tube_well'], [/\btanks?\b|cistern/i, 'water_tank']] },
    { cat: /foundation/i, sched: /PWD-NH|PWD-RB/, d: 'pile', sub: [[/well|steining|curb|cutting edge|\bplug|sinking/i, 'well_foundation'], [/pile/i, 'pile'], [/excavat|earth/i, 'trench'], [/open foundation|raft|footing|pcc|plain/i, 'rcc_column_footing']] }
  ];

  // ---- 6. chapter / category ----
  var CAT = [
    [/aluminium/i, 'window'], [/glazier/i, 'window'], [/cladding/i, 'wall_tiles'], [/flooring/i, 'floor_layers'],
    [/concrete works etc\. - concrete|^concrete work$/i, 'rcc_column_footing'], [/reinforced cement concrete/i, 'rcc_slab_beam'],
    [/^drainage$/i, 'manhole'], [/inspection pit|septic/i, 'manhole'],
    [/earth work, erosion|earthwork, erosion|earthwork for rivers/i, 'embankment'], [/earth ?work|antitermite/i, 'trench'],
    [/finishing|plastering/i, 'plaster_layers'], [/masonry|brick ?works/i, 'brick_bond'], [/stone work/i, 'stone_masonry'],
    [/pile/i, 'pile'], [/road work/i, 'pavement_flexible'],
    [/roofing & sheet|roofing, sheet walling.*roofing & sheet/i, 'steel_truss'], [/roofing|water ?proof/i, 'roof_waterproofing'],
    [/sanitary installations|basin|closets/i, 'sanitary'], [/structural steel|steel work/i, 'steel_truss'],
    [/water supply|g\.?i\.? pipe|cpvc pipe|\(c-i\) miscellaneous/i, 'water_pipe'], [/tube ?well/i, 'tube_well'],
    [/false ceiling/i, 'false_ceiling'], [/door window frame|door window shutter|wood and pvc works - repair/i, 'door_panelled'],
    [/accessories|wood and pvc works - additional/i, 'door_fittings'], [/miscellaneous woodwork|wall panelling/i, 'woodwork'],
    [/wood and pvc/i, 'door_panelled'], [/repairs to building|maintenance works|new technologies|repair and rehabilitation/i, 'repair'],
    [/compound development/i, 'boundary_wall'], [/additional items/i, 'floor_layers'],
    [/protective and lining|river training|protection works/i, 'pitching'], [/sluice/i, 'sluice_gate'],
    [/miscellaneous items/i, 'embankment'],
    [/foundation/i, 'pile'], [/sub-?structure|super-?structure/i, 'bridge'],
    [/sub-bases|bases and surface|bituminous/i, 'pavement_flexible'], [/cement concrete pavement/i, 'pavement_rigid'], [/pipe culverts/i, 'pipe_culvert'],
    [/miscellaneous works|\(17\) miscellaneous/i, 'road_repair']
  ];
  var SCHED = { 'CPWD': 'plaster_layers', 'PWD-BLD': 'plaster_layers', 'PWD-SAN': 'water_pipe', 'I&WD': 'embankment', 'PWD-NH': 'pavement_flexible', 'PWD-RB': 'pavement_flexible', 'SUPP': 'plaster_layers' };
  var BUILDSCHED = /^(CPWD|PWD-BLD|SUPP)$/;

  function test(r, it, desc, main) {
    var cat = it.category || '';
    if (r.cat && !r.cat.test(cat)) return false;
    if (r.notcat && r.notcat.test(cat)) return false;
    if (r.sched && !r.sched.test(it.schedule || '')) return false;
    if (r.re && !r.re.test(desc)) return false;
    if (r.start && !r.start.test(main)) return false;
    if (r.notre && r.notre.test(desc)) return false;
    return true;
  }
  function pick(it, e) {
    var desc = String(it.description || ''), main = desc.split(MAIN)[0], cat = it.category || '', i;
    var has = function (id) { return window.DiagramKit && window.DiagramKit.defs[id]; };
    for (i = 0; i < FAMILY.length; i++) if (test(FAMILY[i], it, desc, main) && has(FAMILY[i].d)) return { d: FAMILY[i].d, via: 'family' };
    var strong = window.pickDiagram ? window.pickDiagram(main.split(/\s:\s/)[0]) : '';
    if (strong && STRONG.test(strong)) return { d: strong, via: 'strong' };
    var k = key(desc);
    // what the item IS (before "with / having / made of …"): door & window frames and shutters, cupboards
    var head = main.split(/\b(?:with|having|consisting|comprising|made (?:of|out|from)|fixed (?:to|with)|fixing with|conforming)\b/i)[0];
    if (!PIPECAT.test(cat) && !/^\W*(dismantling|demolishing|removing|taking out)/i.test(head)) {
      if (/\bpitching\b|back ?filling for pitching/i.test(head) && !/protective and lining|canal/i.test(cat) && has('pitching')) return { d: 'pitching', via: 'head' };
      if (/\b(corrugated|profiled?|roofing) sheets?\b|sheet roofing|polycarbonate sheets?|wind ties?/i.test(head) && has('steel_truss')) return { d: 'steel_truss', via: 'head' };
      if (/\bbollards?\b/i.test(head) && has('road_furniture')) return { d: 'road_furniture', via: 'head' };
    }
    if (!PIPECAT.test(cat) && !FIT.test(head) && !/^\W*(painting|polishing|repair|renewing|dismantling)/i.test(head)) {
      if (/cup ?board|almirah|wardrobe|kitchen cabinet/i.test(head) && !/stone|slab|granite|marble|frames? for doors/i.test(head) && has('woodwork')) return { d: 'woodwork', via: 'head' };
      if (/\bflush (type )?(door|shutter)|flush doors?/i.test(head) && has('door_flush')) return { d: 'door_flush', via: 'head' };
      if (/\b(frames?|shutters?|chowkh?ats?|doorsets?|door assembl(y|ies))\b/i.test(head)) {
        if (/\bwindows?\b|ventilators?|clerestory/i.test(head) && !/\bdoors?\b/i.test(head) && has('window')) return { d: 'window', via: 'head' };
        if (/\bdoors?\b|chowkh?at/i.test(head) && has('door_panelled')) return { d: 'door_panelled', via: 'head' };
      }
    }
    if (e && e.d === 'pipe_joint' && /g\.?i\.? pipe|water supply|cpvc/i.test(cat) && !/stoneware|s\.?w\.? pipe|sewer/i.test(desc)) return { d: 'water_pipe', via: 'linked' };
    if (e && e.d === 'formwork' && /sub-?structure|super-?structure/i.test(cat) && !/centering|shuttering|formwork|staging/i.test(main)) return { d: 'bridge', via: 'linked' };
    if (e && e.d === 'rcc_slab_beam' && /super-?structure/i.test(cat)) return { d: 'bridge', via: 'linked' };
    if (e && e.d === 'stone_masonry' && /^cladding/i.test(cat)) return { d: 'wall_tiles', via: 'linked' };
    if (e && e.d && has(e.d)) return { d: e.d, via: 'linked' };
    for (i = 0; i < FIRST.length; i++) {
      var F = FIRST[i];
      if (!F.cat.test(cat) || (F.sched && !F.sched.test(it.schedule || ''))) continue;
      for (var j = 0; j < F.sub.length; j++) if (F.sub[j][0].test(k) && has(F.sub[j][1])) return { d: F.sub[j][1], via: 'chapter+' };
      if (has(F.d)) return { d: F.d, via: 'chapter+' };
    }
    var old = window.pickDiagram ? window.pickDiagram(desc.replace(ROADBRIDGE, ' ')) : '';
    if (old && has(old) && !PIPECAT.test(cat)) return { d: old, via: 'words' };
    if (!PIPECAT.test(cat)) for (i = 0; i < SPECIFIC.length; i++) if (test(SPECIFIC[i], it, k, k) && has(SPECIFIC[i].d)) return { d: SPECIFIC[i].d, via: 'words' };
    if (BUILDSCHED.test(it.schedule || '') && !PIPECAT.test(cat)) for (i = 0; i < BUILD.length; i++) if (test(BUILD[i], it, k, k) && has(BUILD[i].d)) return { d: BUILD[i].d, via: 'words' };
    for (i = 0; i < CAT.length; i++) if (CAT[i][0].test(cat) && has(CAT[i][1])) return { d: CAT[i][1], via: 'chapter' };
    return { d: SCHED[it.schedule] || 'materials', via: 'schedule' };
  }
  window.DiagramMap = { pick: pick, focusText: function (desc) { return String(desc || '').replace(FLOORLVL, ' '); } };
})();
