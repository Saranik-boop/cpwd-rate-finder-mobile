// Search screen — same logic as the desktop app and the earlier mobile page.
// Started by gate.js only after this phone is approved and the data is decrypted.
window.startSearch = function (items, meta, expl) {
  expl = expl || [];
  'use strict';
  var descFuse = null, itemNoFuse = null;

  function naturalCompare(a, b) {
    var ax = String(a).split(/(\d+)/).map(function (p) { return /^\d+$/.test(p) ? parseInt(p, 10) : p; });
    var bx = String(b).split(/(\d+)/).map(function (p) { return /^\d+$/.test(p) ? parseInt(p, 10) : p; });
    var len = Math.max(ax.length, bx.length);
    for (var i = 0; i < len; i++) {
      var av = ax[i], bv = bx[i];
      if (av === undefined) return -1;
      if (bv === undefined) return 1;
      if (av === bv) continue;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    }
    return 0;
  }
  // items without a numeric rate (percentage / "as per item" entries) sort last
  function rv(it, dir) { return it.rate == null ? dir * Infinity : it.rate; }
  function scoreItemNo(query, itemNo) {
    var q = query.trim().toLowerCase(), v = String(itemNo).toLowerCase();
    if (!q) return null;
    if (v === q) return 1.0;
    if (v.indexOf(q + '.') === 0) return 0.92;
    if (v.indexOf(q) === 0) return 0.85;
    if (v.indexOf(q) !== -1) return 0.6;
    return null;
  }

  var SCHED = window.SCHEDULES || {};
  function sinfo(it) { return SCHED[it.schedule] || {}; }
  function applicable(it) { return sinfo(it).applicable !== false; }
  function isBasic(it) { return it.source === 'basic' || /^basic rates/i.test(it.category || '') || /wages|labour rates/i.test(it.category || ''); }

  // Common abbreviations / spellings: typing any one finds the others.
  var SYN = [
    ['rcc', 'reinforced cement concrete', 'r.c.c'], ['pcc', 'plain cement concrete', 'p.c.c'], ['cc', 'cement concrete'],
    ['brick work', 'brickwork', 'brick masonry'], ['earth work', 'earthwork'], ['stone work', 'stonework', 'stone masonry'],
    ['flush door', 'flush door shutter'], ['dpc', 'damp proof course', 'damp-proof course'],
    ['gi', 'galvanised iron', 'galvanized iron', 'g.i.'], ['ci', 'cast iron', 'c.i.'], ['di', 'ductile iron', 'd.i.'],
    ['ms', 'mild steel', 'm.s.'], ['ss', 'stainless steel', 's.s.'], ['hysd', 'tmt', 'tor steel', 'high yield strength deformed'],
    ['rmc', 'ready mix concrete', 'ready mixed concrete'], ['pvc', 'poly vinyl chloride', 'polyvinyl chloride'],
    ['upvc', 'unplasticised pvc', 'u.p.v.c'], ['cpvc', 'chlorinated pvc'], ['hdpe', 'high density polyethylene'],
    ['wbm', 'water bound macadam'], ['wmm', 'wet mix macadam'], ['gsb', 'granular sub base', 'granular sub-base'],
    ['dbm', 'dense bituminous macadam'], ['bm', 'bituminous macadam'], ['bc', 'bituminous concrete'],
    ['sdbc', 'semi dense bituminous concrete'], ['sma', 'stone matrix asphalt'], ['pmb', 'polymer modified bitumen'],
    ['crmb', 'crumb rubber modified bitumen'], ['dlc', 'dry lean concrete'], ['pqc', 'pavement quality concrete'],
    ['shuttering', 'formwork', 'form work', 'centering', 'centring'], ['whitewash', 'white wash', 'white washing'],
    ['colour', 'color'], ['galvanised', 'galvanized'], ['aluminium', 'aluminum'], ['metre', 'meter'],
    ['plaster', 'plastering'], ['painting', 'paint'], ['acp', 'aluminium composite panel'], ['frp', 'fibre reinforced plastic', 'fiber reinforced plastic'],
    ['swr', 'soil waste and rain water'], ['ac sheet', 'asbestos cement sheet'], ['wc', 'water closet', 'w.c.'],
    ['ewc', 'european water closet', 'european type w.c'], ['iwc', 'indian water closet', 'orissa pan'],
    ['vitrified', 'vitrified tile', 'vitrified tiles'], ['ips', 'indian patent stone'], ['nhp', 'non-pressure'], ['np2', 'np-2'], ['np3', 'np-3'], ['np4', 'np-4']
  ];
  var SYN_INDEX = [];
  SYN.forEach(function (g, gi) { g.forEach(function (p) { SYN_INDEX.push({ p: p, g: gi }); }); });
  SYN_INDEX.sort(function (a, b) { return b.p.length - a.p.length; });
  function reWord(p) { return new RegExp('(^|[^a-z0-9])' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^a-z0-9])', 'i'); }
  // Returns null (no synonyms involved) or a Fuse logical query: every term must match, any spelling of it.
  function synonymQuery(q) {
    var text = ' ' + q.toLowerCase().replace(/\s+/g, ' ') + ' ', groups = [], hit = false;
    SYN_INDEX.forEach(function (e) {
      var r = reWord(e.p);
      if (r.test(text)) { text = text.replace(r, '$1 '); if (groups.indexOf(e.g) < 0) groups.push(e.g); hit = true; }
    });
    if (!hit) return null;
    var terms = groups.map(function (gi) { return SYN[gi]; });
    text.split(' ').filter(function (w) { return w.length > 0; }).forEach(function (w) { terms.push([w]); });
    return { $and: terms.map(function (vars) {
      var ors = [];
      vars.forEach(function (v) { var ex = v.indexOf(' ') >= 0 ? "'" + v : v; ors.push({ description: ex }); ors.push({ category: ex }); });
      return { $or: ors };
    }) };
  }
  window.__synonymQuery = synonymQuery;

  // Same ranking logic as the desktop app's search.js
  function search(o) {
    var itemNo = (o.itemNo || '').trim(), keywords = (o.keywords || '').trim();
    var category = o.category || '', schedule = o.schedule || '', sort = o.sort || 'relevance', work = o.work || '';
    var pool = items;
    if (work) pool = pool.filter(function (it) { return sinfo(it).work === work; });
    if (schedule) pool = pool.filter(function (it) { return it.schedule === schedule; });
    if (category) pool = pool.filter(function (it) { return it.category === category; });
    var hasItemNo = itemNo.length > 0, hasKeywords = keywords.length > 0;
    var scoreMap = new Map();
    function passes(it) { return (!category || it.category === category) && (!schedule || it.schedule === schedule) && (!work || sinfo(it).work === work); }

    if (hasItemNo) {
      pool.forEach(function (it) {
        var s = scoreItemNo(itemNo, it.item_no);
        if (s !== null) scoreMap.set(it.id, { item: it, a: s, k: null });
      });
      if (scoreMap.size < 25) {
        itemNoFuse.search(itemNo, { limit: 50 }).forEach(function (r) {
          if (!passes(r.item)) return;
          var ex = scoreMap.get(r.item.id), fs = Math.max(0, 1 - r.score) * 0.7;
          if (!ex || ex.a < fs) scoreMap.set(r.item.id, { item: r.item, a: fs, k: null });
        });
      }
    }
    if (hasKeywords) {
      var pattern = keywords.split(/\s+/).filter(Boolean).join(' ');
      var sq = synonymQuery(keywords);
      var kw = descFuse.search(sq || pattern, { limit: 600 });
      if (hasItemNo) {
        kw.forEach(function (r) { var ex = scoreMap.get(r.item.id); if (ex) ex.k = Math.max(0, 1 - r.score); });
        scoreMap.forEach(function (v) { if (v.k === null) v.k = 0; });
      } else {
        kw.forEach(function (r) { if (passes(r.item)) scoreMap.set(r.item.id, { item: r.item, a: null, k: Math.max(0, 1 - r.score) }); });
      }
    }

    if (!hasItemNo && !hasKeywords) {
      var arr = pool.slice();
      if (sort === 'rate_asc') arr.sort(function (a, b) { return rv(a, 1) - rv(b, 1); });
      else if (sort === 'rate_desc') arr.sort(function (a, b) { return rv(b, -1) - rv(a, -1); });
      else arr.sort(function (a, b) { return naturalCompare(a.item_no, b.item_no); });
      return { results: arr, total: arr.length, mode: (category || schedule) ? 'category' : 'browse' };
    }

    var combined = Array.from(scoreMap.values()).map(function (v) {
      var s = hasItemNo && hasKeywords ? (v.a || 0) * 0.45 + (v.k || 0) * 0.55 : hasItemNo ? (v.a || 0) : (v.k || 0);
      // payable work items rank a little above basic material / labour / hire rates for the same words
      if (hasKeywords && isBasic(v.item)) s -= 0.06;
      return { item: v.item, score: s };
    });
    if (sort === 'rate_asc') combined.sort(function (a, b) { return rv(a.item, 1) - rv(b.item, 1); });
    else if (sort === 'rate_desc') combined.sort(function (a, b) { return rv(b.item, -1) - rv(a.item, -1); });
    else if (sort === 'item_no') combined.sort(function (a, b) { return naturalCompare(a.item.item_no, b.item.item_no); });
    else {
      // Officially applicable schedules first (23.07.2026 order); reference-only schedules follow.
      // For an item-number-only search a clearly better match still wins.
      var group = !schedule && hasKeywords;
      combined.sort(function (a, b) {
        var aa = applicable(a.item), ab = applicable(b.item);
        if (group && aa !== ab) return aa ? -1 : 1;
        if (b.score !== a.score) return b.score - a.score;
        if (aa !== ab) return aa ? -1 : 1;
        return naturalCompare(a.item.item_no, b.item.item_no);
      });
    }
    return { results: combined.map(function (c) { return c.item; }), total: combined.length, mode: 'search', grouped: sort === 'relevance' && !schedule && hasKeywords };
  }

  // ---------- UI ----------
  var $ = function (id) { return document.getElementById(id); };
  var fItemNo = $('fItemNo'), fKeywords = $('fKeywords'), fCategory = $('fCategory'), fSchedule = $('fSchedule'), fSort = $('fSort'), fWork = $('fWork');
  var list = $('list'), empty = $('empty'), metaRow = $('metaRow'), resultsMeta = $('resultsMeta'), toast = $('toast');
  var PAGE = 40, lastResults = [], shown = 0, lastKw = '', lastNo = '', lastGrouped = false;

  var SCHED_LABEL = { 'CPWD': 'CPWD DSR (Delhi)', 'I&WD': 'I&WD (West Bengal)', 'PWD-RB': 'PWD Roads & Bridges (WB)', 'PWD-BLD': 'PWD Building Works (WB)', 'PWD-SAN': 'PWD Sanitary & Plumbing (WB)', 'PWD-NH': 'PWD National Highway (WB)' };
  var SCHED_SHORT = { 'CPWD': 'CPWD', 'I&WD': 'I&WD', 'PWD-RB': 'PWD R&B', 'PWD-BLD': 'PWD Bldg', 'PWD-SAN': 'PWD San.', 'PWD-NH': 'PWD NH' };
  var QUICK = ['Earth Work', 'Concrete Work', 'Reinforced Cement Concrete', 'Masonry Work', 'Flooring', 'Finishing', 'Steel Work', 'Water Supply', 'Sanitary Installations', 'Water Proofing'];
  var CORR_LABEL = { new_item: 'New item added', rate_change: 'Rate revised', description_amendment: 'Description revised', rate_and_description: 'Rate & description revised', dar_component_change: 'DAR cost analysis revised', deletion: 'Item deleted', other: 'Revised' };
  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return v == null ? '—' : inr.format(v); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, term) {
    var e = esc(text);
    if (!term) return e;
    var words = term.trim().replace(/[.*+?^${}()|[\]\\]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1; }).map(function (w) { return reEsc(esc(w)); });
    if (!words.length) return e;
    try { return e.replace(new RegExp('(' + words.join('|') + ')', 'ig'), '<mark>$1</mark>'); } catch (x) { return e; }
  }
  function slug(s) { return String(s || '').replace(/[^A-Za-z0-9-]/g, ''); }

  var toastT;
  function showToast(m) {
    toast.textContent = m; toast.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toast.hidden = true; }, 1500);
  }
  function copyItem(it) {
    var text = it.item_no + '\t' + it.description + '\t' + (it.unit || '') + '\t' + (it.rate == null ? (it.rate_text || '') : it.rate);
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); showToast(ok ? 'Copied' : 'Could not copy');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { showToast('Copied'); }, fallback);
    else fallback();
  }

  function breakdownHtml(it) {
    var bd = it.breakdown, w = it.breakdown_warnings || [];
    var rows = (bd.components || []).map(function (c) {
      return '<tr><td class="code">' + esc(c.code) + '</td><td>' + esc(c.description) + '</td><td class="n">' + (c.quantity != null ? c.quantity : '—') + '</td><td class="n">' + esc(c.unit || '—') + '</td><td class="n">' + money(c.rate) + '</td><td class="n">' + money(c.amount) + '</td></tr>';
    }).join('');
    var sum = (bd.summary || []).map(function (s) { return '<div class="sum-row"><span>' + esc(s.label) + '</span><span>' + money(s.amount) + '</span></div>'; }).join('');
    return '<div class="panel p-ra" hidden><div class="panel-title">Rate analysis (CPWD Analysis of Rates)</div>' +
      (w.length ? '<div class="warn">Note: ' + esc(w.join('; ')) + '. Figures may be incomplete; the final rate is still the verified schedule rate.</div>' : '') +
      '<div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Component</th><th class="n">Qty</th><th class="n">Unit</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="sum">' + sum + '</div></div>';
  }
  function correctionHtml(it) {
    var c = it.correction, isNew = c.type === 'new_item';
    var h = '<div class="panel p-corr" hidden><div class="panel-title">' + (isNew ? 'Added' : 'Corrected') + ' by CPWD Correction Slip ' + esc(c.slip) + (c.date ? ' (' + esc(c.date) + ')' : '') + '</div>';
    if (isNew) h += '<div>Newly introduced by this correction slip; not in the original 2023 publication.</div>';
    else {
      h += '<div>' + esc(CORR_LABEL[c.type] || 'Revised') + '.</div>';
      if (c.old_rate != null && c.old_rate !== it.rate) h += '<div>Rate: <span class="old">' + money(c.old_rate) + '</span> → <span class="new">' + money(it.rate) + '</span> per ' + esc(it.unit || '—') + '</div>';
      else h += '<div>Rate unchanged at ' + money(it.rate) + ' per ' + esc(it.unit || '—') + '.</div>';
      if (c.old_description) h += '<div>Previous wording:<div class="quote">' + esc(c.old_description) + '</div></div>';
    }
    if (c.affects) h += '<div>Affects: ' + esc(c.affects) + '</div>';
    if (c.flagged) h += '<div class="warn" style="margin-top:8px">⚠ The slip\'s own table has an apparent inconsistency. The figure shown is exactly what the official slip prints; cross-check on the CPWD website if it matters.</div>';
    if (c.notes) h += '<div class="quote">' + esc(c.notes) + '</div>';
    return h + '</div>';
  }

  function amendHtml(it) {
    var TYPE = { rate: 'Rate revised', description: 'Description revised', note: 'Note added / revised', new_item: 'New item added', deletion: 'Item deleted', column_deleted: 'Column deleted' };
    var h = '<div class="panel p-amd" hidden><div class="panel-title">Amendments (official addenda & corrigenda)</div>';
    (it.amendments || []).forEach(function (a) {
      h += '<div class="amd"><div class="amd-ref">' + esc(a.ref) + '</div><div>' + esc(TYPE[a.type] || 'Revised') + '</div>';
      if (a.type === 'rate' && a.old && a.new) {
        h += '<div class="zones">' + Object.keys(a.new).map(function (z) {
          var o = a.old[z], n = a.new[z];
          return '<div class="zone"><span>' + esc(z) + '</span><span>' + (o !== n ? '<span class="old">' + money(o) + '</span> → ' : '') + '<span class="new">' + money(n) + '</span></span></div>';
        }).join('') + '</div>';
      }
      if (a.old_text) h += '<div>Was: <span class="quote">' + esc(a.old_text) + '</span></div><div>Now: <span class="quote">' + esc(a.new_text) + '</span></div>';
      else if (a.old_description) h += '<div>Previous wording:<div class="quote">' + esc(a.old_description) + '</div></div>';
      if (a.text) h += '<div class="quote">' + esc(a.text) + '</div>';
      h += '</div>';
    });
    return h + '</div>';
  }


  // ---------- Item explanation (where used / included / not included / measurement / codes / site notes) ----------
  var BASIS_CLS = { 'Per item description': 'bd-desc', 'Per DAR analysis': 'bd-dar', 'Per chapter notes': 'bd-notes', 'Per CPWD Spec 2019': 'bd-spec',
    'Per MoRTH Spec (5th Rev)': 'bd-spec', 'Per IS code': 'bd-spec', 'General practice': 'bd-gen', 'Check chapter notes / confirm with specification': 'bd-chk' };
  function basisTag(b) { return b ? '<span class="bt ' + (BASIS_CLS[b] || 'bd-gen') + '">' + esc(b) + '</span>' : ''; }
  var byNo = null;
  function refLink(sched, ref) {
    if (!ref) return '';
    if (!byNo) { byNo = {}; items.forEach(function (x) { byNo[x.schedule + '|' + x.item_no] = true; }); }
    return ' <button type="button" class="reflink" data-ref="' + esc(ref) + '" data-s="' + esc(sched) + '">→ ' + esc(ref) + '</button>';
  }
  function genericExpl(it) {
    // basic rates, labour wages and material tables have no work explanation of their own
    var isWage = /labour|wage/i.test(it.category) || /^W\./.test(it.item_no);
    return { u: isWage ? 'Labour rate used to build up item rates (analysis of rates) and for works done on a labour basis.'
                       : 'Basic rate of a material / hire charge / carriage used to build up item rates (analysis of rates), and to add the cost of materials where an item says "add cost of ...".',
      i: [{ t: 'Only what the description and unit state', b: 'Per item description' }],
      n: [{ t: 'Not a finished work item: labour, other materials, overheads and profit are added in the rate analysis', ref: '', b: 'General practice' }],
      m: { t: 'Per ' + (it.unit || 'unit stated'), b: 'Per item description' }, c: [], s: ['Check the "Notes / remarks" and "Rate detail" panels for what the figure includes (GST, carriage, profit).'], v: '', d: '', generic: true };
  }
  function explHtml(it) {
    var e = it.gx != null ? expl[it.gx] : null;
    if (!e) e = genericExpl(it);
    var h = '<div class="panel p-exp" hidden><div class="panel-title">Item explanation</div>';
    h += '<div class="exp-note">Guidance to help read the item. The schedule\'s own description, notes and specification prevail. Each point shows its basis.</div>';
    if (e.u) h += '<h4>Where it is used</h4><p>' + esc(e.u) + '</p>';
    if (e.i && e.i.length) h += '<h4>Included in the rate</h4><ul>' + e.i.map(function (x) { return '<li>' + esc(x.t) + ' ' + basisTag(x.b) + '</li>'; }).join('') + '</ul>';
    if (e.n && e.n.length) h += '<h4>Not included (paid separately)</h4><ul>' + e.n.map(function (x) { return '<li>' + esc(x.t) + refLink(it.schedule, x.ref) + ' ' + basisTag(x.b) + '</li>'; }).join('') + '</ul>';
    if (e.m && e.m.t) h += '<h4>Measurement &amp; payment</h4><p>' + esc(e.m.t) + ' ' + basisTag(e.m.b) + '</p>';
    if (e.c && e.c.length) h += '<h4>Codes &amp; specifications</h4><p>' + e.c.map(esc).join(' · ') + '</p>';
    if (e.s && e.s.length) h += '<h4>Site notes</h4><ul>' + e.s.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    if (e.v) h += '<h4>Sub-items</h4><p>' + esc(e.v) + '</p>';
    var dg = e.d && window.DIAGRAMS && window.DIAGRAMS[e.d];
    if (dg) h += '<h4>Diagram</h4><figure class="dgw">' + dg.svg + '<figcaption>' + esc(dg.title) + ' — schematic, not to scale</figcaption></figure>';
    return h + '</div>';
  }

  function cardFor(it) {
    var el = document.createElement('article');
    el.className = 'card' + (it.deleted ? ' deleted' : '');
    var si = sinfo(it);
    var sched = it.schedule ? (si.applicable === false
      ? '<span class="b s-' + slug(it.schedule) + '">' + esc(si.short || SCHED_SHORT[it.schedule] || it.schedule) + '</span><span class="b ap-ref" title="' + esc(window.ORDER_REF || '') + '">' + esc(si.tag) + '</span>'
      : '<span class="b s-' + slug(it.schedule) + '" title="Official source under ' + esc(window.ORDER_REF || '') + '">' + esc(si.tag || SCHED_SHORT[it.schedule] || it.schedule) + '</span>') : '';
    var corr = it.correction ? '<span class="b ' + (it.correction.type === 'new_item' ? 'c-new">🆕 Added' : 'c-upd">✏️ Corrected') + ' · Slip ' + esc(it.correction.slip) + '</span>' : '';
    var amds = it.amendments || [];
    var lastA = amds.length ? amds[amds.length - 1] : null;
    if (it.deleted) corr += '<span class="b c-del">⛔ ' + esc(it.deleted) + '</span>';
    else if (lastA) corr += '<span class="b ' + (lastA.type === 'new_item' ? 'c-new">🆕 Added' : 'c-upd">✏️ Amended') + ' vide ' + esc(lastA.ref.replace(/Addenda & Corrigenda/, 'A&C').replace(/ to USoR/, '').split(/,| \(| dt /)[0]) + '</span>';
    if (it.sub_analysis) corr += '<span class="b c-sub">DAR only</span>';
    if (it.verify) corr += '<span class="b c-del" title="Read from a text copy of the schedule">⚠ Verify with book</span>';
    var extra = '';
    if (it.zones) {
      extra += '<div class="panel"><div class="panel-title">Rate by zone</div><div class="zones">' + Object.keys(it.zones).map(function (z) {
        return '<div class="zone"><span>' + esc(z) + '</span><span>' + money(it.zones[z]) + '</span></div>';
      }).join('') + '</div></div>';
    }
    if (it.rate_notes) extra += '<div class="panel"><div class="panel-title">Rate detail</div>' + esc(it.rate_notes) + '</div>';
    if (it.notes) extra += '<div class="panel"><div class="panel-title">Notes / remarks</div>' + esc(it.notes).split(' | ').join('<br><br>') + '</div>';
    if (it.page) extra += '<div class="panel"><div class="panel-title">Source</div>' + esc(it.schedule_label || '') + (it.vol ? ', Vol ' + esc(it.vol) : '') + ', page ' + esc(it.page) + '</div>';
    var hasBd = it.breakdown && it.breakdown.components && it.breakdown.components.length;
    var longDesc = it.description.length > 150;
    var rateV = it.rate == null ? '<div class="rate-t">' + esc(it.rate_text || '—') + '</div>' : '<div class="rate-v">' + money(it.rate) + '</div>';
    el.innerHTML =
      '<div class="card-top"><span class="itemno">' + hl(it.item_no, lastNo) + '</span>' +
      '<div class="rate">' + rateV + '<div class="rate-u">per ' + esc(it.unit || '—') + (it.rate_basis && it.zones ? '<br><span class="rate-b">' + esc(it.rate_basis) + '</span>' : '') + '</div></div></div>' +
      '<div class="desc">' + hl(it.description, lastKw) + '</div>' +
      '<div class="badges">' + sched + corr + '<button type="button" class="b cat">' + esc(it.category) + '</button></div>' +
      (extra ? '<div class="p-extra" hidden>' + extra + '</div>' : '') +
      '<div class="actions">' +
        ((longDesc || extra) ? '<button type="button" class="act more-toggle">' + (extra ? 'Show details' : 'Show full text') + '</button>' : '') +
        (hasBd ? '<button type="button" class="act ra-btn">Rate analysis</button>' : '') +
        (it.correction ? '<button type="button" class="act corr-btn">Correction</button>' : '') +
        (amds.length ? '<button type="button" class="act amd-btn">Amendments (' + amds.length + ')</button>' : '') +
        '<button type="button" class="act exp-btn">Explanation</button>' +
        '<button type="button" class="act copy-btn">Copy</button>' +
        (window.DoubtUI ? '<button type="button" class="act ask-btn">Ask a doubt</button>' : '') +
      '</div>' +
      (hasBd ? breakdownHtml(it) : '') + (it.correction ? correctionHtml(it) : '') + (amds.length ? amendHtml(it) : '');

    el.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.classList.contains('cat')) { fCategory.value = it.category; syncChips(); runSearch(); window.scrollTo(0, 0); }
      else if (t.classList.contains('copy-btn')) copyItem(it);
      else if (t.classList.contains('ask-btn')) askAbout(it);
      else if (t.classList.contains('more-toggle')) {
        var open = el.classList.toggle('open');
        var ex = el.querySelector('.p-extra'); if (ex) ex.hidden = !open;
        t.textContent = open ? 'Show less' : (ex ? 'Show details' : 'Show full text');
      } else if (t.classList.contains('ra-btn')) {
        var p = el.querySelector('.p-ra'); p.hidden = !p.hidden; t.textContent = p.hidden ? 'Rate analysis' : 'Hide analysis';
      } else if (t.classList.contains('corr-btn')) {
        var q = el.querySelector('.p-corr'); q.hidden = !q.hidden; t.textContent = q.hidden ? 'Correction' : 'Hide correction';
      } else if (t.classList.contains('exp-btn')) {
        var x = el.querySelector('.p-exp');
        if (!x) { el.insertAdjacentHTML('beforeend', explHtml(it)); x = el.querySelector('.p-exp'); }
        x.hidden = !x.hidden; t.textContent = x.hidden ? 'Explanation' : 'Hide explanation';
      } else if (t.classList.contains('reflink')) {
        fItemNo.value = t.dataset.ref; fKeywords.value = ''; fCategory.value = ''; fSchedule.value = t.dataset.s; if (fWork) fWork.value = '';
        syncChips(); runSearch(); window.scrollTo(0, 0);
      } else if (t.classList.contains('amd-btn')) {
        var a = el.querySelector('.p-amd'); a.hidden = !a.hidden; t.textContent = a.hidden ? 'Amendments (' + amds.length + ')' : 'Hide amendments';
      }
    });
    return el;
  }

  function renderMore() {
    var old = list.querySelector('.showmore'); if (old) old.remove();
    var frag = document.createDocumentFragment();
    var end = Math.min(shown + PAGE, lastResults.length);
    for (var i = shown; i < end; i++) {
      if (lastGrouped && !applicable(lastResults[i]) && (i === 0 || applicable(lastResults[i - 1]))) {
        var dv = document.createElement('div'); dv.className = 'ref-div';
        dv.innerHTML = '<b>Reference only</b> — items below are from schedules superseded for estimates from 23.07.2026 (WB PWD Building, Sanitary and Road & Bridge SoR).';
        frag.appendChild(dv);
      }
      frag.appendChild(cardFor(lastResults[i]));
    }
    shown = end;
    list.appendChild(frag);
    if (shown < lastResults.length) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'showmore';
      b.textContent = 'Show more (' + (lastResults.length - shown).toLocaleString('en-IN') + ' left)';
      b.addEventListener('click', renderMore);
      list.appendChild(b);
    }
  }

  function toggleClear(inp) { var b = document.querySelector('.clr[data-clear="' + inp.id + '"]'); if (b) b.hidden = !inp.value; }

  function runSearch() {
    if (!descFuse) return;
    toggleClear(fItemNo); toggleClear(fKeywords);
    var itemNo = fItemNo.value.trim(), kw = fKeywords.value.trim();
    if (!itemNo && !kw && !fCategory.value && !fSchedule.value && !fWork.value) {
      empty.hidden = false; list.hidden = true; metaRow.hidden = true; return;
    }
    var r = search({ itemNo: itemNo, keywords: kw, category: fCategory.value, schedule: fSchedule.value, work: fWork.value, sort: fSort.value });
    lastKw = kw; lastNo = itemNo; lastGrouped = !!r.grouped;
    lastResults = r.results.slice(0, 300); shown = 0;
    empty.hidden = true; list.hidden = false; list.innerHTML = '';
    metaRow.hidden = false;
    if (!r.total) {
      resultsMeta.textContent = 'No matches';
      list.innerHTML = '<div class="empty"><p>No matching items. Try fewer words, a shorter item number, or another category.</p></div>';
      return;
    }
    resultsMeta.textContent = r.total > lastResults.length
      ? 'Top ' + lastResults.length + ' of ' + r.total.toLocaleString('en-IN')
      : r.total.toLocaleString('en-IN') + ' matching item' + (r.total === 1 ? '' : 's');
    renderMore();
  }

  function syncChips() {
    document.querySelectorAll('#chips .chip-btn').forEach(function (c) {
      c.classList.toggle('active', (c.dataset.s && c.dataset.s === fSchedule.value) || (c.dataset.c && c.dataset.c === fCategory.value));
    });
  }

  function buildAbout() {
    var box = $('aboutList'); if (!box) return;
    var counts = meta.schedule_counts || {};
    var keys = Object.keys(SCHED);
    box.innerHTML = '<p class="about-ref">Applicability as per ' + esc(window.ORDER_REF || '') + '.</p>' + keys.map(function (k) {
      var s = SCHED[k], n = counts[k];
      var wl = ((window.WORK_TYPES || []).filter(function (w) { return w.id === s.work; })[0] || {}).label || '';
      return '<div class="about-card' + (s.applicable === false ? ' ref' : '') + '">' +
        '<div class="about-top"><span class="b ' + (s.applicable === false ? 'ap-ref' : 'ap-yes') + '">' + esc(s.tag) + '</span>' +
        (n ? '<span class="about-n">' + n.toLocaleString('en-IN') + ' items</span>' : (s.missing ? '<span class="about-n miss">not in app</span>' : '')) + '</div>' +
        '<div class="about-name">' + esc(s.name) + '</div>' +
        '<div class="about-row"><span>Work type</span><span>' + esc(wl) + '</span></div>' +
        '<div class="about-row"><span>Edition</span><span>' + esc(s.edition) + '</span></div>' +
        '<div class="about-row"><span>Updated up to</span><span' + (s.caution ? ' class="caution"' : '') + '>' + esc(s.upto) + '</span></div>' +
        '<div class="about-role">' + esc(s.role) + '</div></div>';
    }).join('');
    var open = function () { $('about').hidden = false; document.body.classList.add('noscroll'); };
    var close = function () { $('about').hidden = true; document.body.classList.remove('noscroll'); };
    document.querySelectorAll('[data-open-about]').forEach(function (b) { b.addEventListener('click', open); });
    $('aboutClose').addEventListener('click', close);
  }

  function buildUi() {
    $('count').textContent = meta.count.toLocaleString('en-IN') + ' items';
    (meta.schedules || []).forEach(function (sc) {
      var o = document.createElement('option'); o.value = sc;
      var n = (meta.schedule_counts || {})[sc];
      o.textContent = (SCHED_LABEL[sc] || sc) + (SCHED[sc] && SCHED[sc].applicable === false ? ' — reference' : '') + (n ? ' (' + n.toLocaleString('en-IN') + ')' : '');
      fSchedule.appendChild(o);
    });
    (window.WORK_TYPES || []).forEach(function (w) { var o = document.createElement('option'); o.value = w.id; o.textContent = w.label; fWork.appendChild(o); });
    fWork.addEventListener('change', function () { runSearch(); });
    buildAbout();
    meta.categories.forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; fCategory.appendChild(o); });
    var chips = $('chips');
    (meta.schedules || []).forEach(function (sc) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip-btn'; b.dataset.s = sc; b.textContent = SCHED_SHORT[sc] || sc;
      b.addEventListener('click', function () { fSchedule.value = fSchedule.value === sc ? '' : sc; syncChips(); runSearch(); });
      chips.appendChild(b);
    });
    var sep = document.createElement('span'); sep.className = 'chip-sep'; chips.appendChild(sep);
    QUICK.filter(function (c) { return meta.categories.indexOf(c) !== -1; }).forEach(function (cat) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip-btn'; b.dataset.c = cat; b.textContent = cat;
      b.addEventListener('click', function () { fCategory.value = fCategory.value === cat ? '' : cat; syncChips(); runSearch(); });
      chips.appendChild(b);
    });
    var examples = [['13.2.1', 'no'], ['brass hinges', 'kw'], ['cement concrete 1:2:4', 'kw'], ['5.9', 'no']];
    var tc = $('tryChips');
    examples.forEach(function (ex) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip-btn'; b.textContent = 'Try: ' + ex[0];
      b.addEventListener('click', function () {
        if (ex[1] === 'no') { fItemNo.value = ex[0]; fKeywords.value = ''; } else { fKeywords.value = ex[0]; fItemNo.value = ''; }
        runSearch();
      });
      tc.appendChild(b);
    });

    var t;
    function debounced() { clearTimeout(t); t = setTimeout(runSearch, 200); }
    fItemNo.addEventListener('input', debounced);
    fKeywords.addEventListener('input', debounced);
    fCategory.addEventListener('change', function () { syncChips(); runSearch(); });
    fSchedule.addEventListener('change', function () { syncChips(); runSearch(); });
    fSort.addEventListener('change', runSearch);
    $('form').addEventListener('submit', function (e) { e.preventDefault(); document.activeElement && document.activeElement.blur(); runSearch(); });
    document.querySelectorAll('.clr').forEach(function (b) {
      b.addEventListener('click', function () { var i = $(b.dataset.clear); i.value = ''; b.hidden = true; i.focus(); runSearch(); });
    });
  }

  // ---------- Rate Finder / Doubt Solver tabs (each tab keeps its own typing, results and scroll position) ----------
  var tabScroll = { rf: 0, ds: 0 }, curTab = 'rf';
  function showTab(tab) {
    if (tab === curTab) return;
    tabScroll[curTab] = window.scrollY;
    curTab = tab;
    document.body.classList.toggle('tab-ds', tab === 'ds');
    ['rf', 'ds'].forEach(function (k) {
      var b = $(k === 'rf' ? 'tabRf' : 'tabDs'); if (!b) return;
      b.classList.toggle('on', k === tab); b.setAttribute('aria-selected', k === tab ? 'true' : 'false');
    });
    if (tab === 'ds' && window.DoubtUI) window.DoubtUI.open();
    window.scrollTo(0, tabScroll[tab] || 0);
  }
  function askAbout(it) {
    var d = String(it.description || '').replace(/\s+/g, ' ');
    if (d.length > 160) d = d.slice(0, 157) + '…';
    var prefill = 'Item ' + it.item_no + ' (' + (SCHED_SHORT[it.schedule] || it.schedule) + ') – ' + d + ' – ';
    showTab('ds');
    window.DoubtUI.open(prefill);
  }
  function initTabs() {
    if (!window.DoubtUI) { var nav = document.querySelector('.tabs'); if (nav) nav.hidden = true; return; }
    window.DoubtUI.setData(items, meta);
    document.querySelectorAll('.tabs [data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.dataset.tab); });
    });
  }

  function init() {
    initTabs();
    descFuse = new Fuse(items, {
      keys: [{ name: 'description', weight: 0.75 }, { name: 'item_no', weight: 0.15 }, { name: 'category', weight: 0.10 }],
      threshold: 0.32, distance: 200, ignoreLocation: true, minMatchCharLength: 2, useExtendedSearch: true, includeScore: true
    });
    itemNoFuse = new Fuse(items, { keys: ['item_no'], threshold: 0.45, ignoreLocation: true, includeScore: true });
    buildUi();
    $('loading').hidden = true;
    runSearch();
  }
  init();
};
