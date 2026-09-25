// Search screen — same logic as the desktop app and the earlier mobile page.
// Started by gate.js only after this phone is approved and the data is decrypted.
window.startSearch = function (items, meta) {
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
  function scoreItemNo(query, itemNo) {
    var q = query.trim().toLowerCase(), v = String(itemNo).toLowerCase();
    if (!q) return null;
    if (v === q) return 1.0;
    if (v.indexOf(q + '.') === 0) return 0.92;
    if (v.indexOf(q) === 0) return 0.85;
    if (v.indexOf(q) !== -1) return 0.6;
    return null;
  }

  // Same ranking logic as the desktop app's search.js
  function search(o) {
    var itemNo = (o.itemNo || '').trim(), keywords = (o.keywords || '').trim();
    var category = o.category || '', schedule = o.schedule || '', sort = o.sort || 'relevance';
    var pool = items;
    if (schedule) pool = pool.filter(function (it) { return it.schedule === schedule; });
    if (category) pool = pool.filter(function (it) { return it.category === category; });
    var hasItemNo = itemNo.length > 0, hasKeywords = keywords.length > 0;
    var scoreMap = new Map();
    function passes(it) { return (!category || it.category === category) && (!schedule || it.schedule === schedule); }

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
      var kw = descFuse.search(pattern, { limit: 400 });
      if (hasItemNo) {
        kw.forEach(function (r) { var ex = scoreMap.get(r.item.id); if (ex) ex.k = Math.max(0, 1 - r.score); });
        scoreMap.forEach(function (v) { if (v.k === null) v.k = 0; });
      } else {
        kw.forEach(function (r) { if (passes(r.item)) scoreMap.set(r.item.id, { item: r.item, a: null, k: Math.max(0, 1 - r.score) }); });
      }
    }

    if (!hasItemNo && !hasKeywords) {
      var arr = pool.slice();
      if (sort === 'rate_asc') arr.sort(function (a, b) { return a.rate - b.rate; });
      else if (sort === 'rate_desc') arr.sort(function (a, b) { return b.rate - a.rate; });
      else arr.sort(function (a, b) { return naturalCompare(a.item_no, b.item_no); });
      return { results: arr, total: arr.length, mode: (category || schedule) ? 'category' : 'browse' };
    }

    var combined = Array.from(scoreMap.values()).map(function (v) {
      var s = hasItemNo && hasKeywords ? (v.a || 0) * 0.45 + (v.k || 0) * 0.55 : hasItemNo ? (v.a || 0) : (v.k || 0);
      return { item: v.item, score: s };
    });
    if (sort === 'rate_asc') combined.sort(function (a, b) { return a.item.rate - b.item.rate; });
    else if (sort === 'rate_desc') combined.sort(function (a, b) { return b.item.rate - a.item.rate; });
    else if (sort === 'item_no') combined.sort(function (a, b) { return naturalCompare(a.item.item_no, b.item.item_no); });
    else combined.sort(function (a, b) { return b.score !== a.score ? b.score - a.score : naturalCompare(a.item.item_no, b.item.item_no); });
    return { results: combined.map(function (c) { return c.item; }), total: combined.length, mode: 'search' };
  }

  // ---------- UI ----------
  var $ = function (id) { return document.getElementById(id); };
  var fItemNo = $('fItemNo'), fKeywords = $('fKeywords'), fCategory = $('fCategory'), fSchedule = $('fSchedule'), fSort = $('fSort');
  var list = $('list'), empty = $('empty'), metaRow = $('metaRow'), resultsMeta = $('resultsMeta'), toast = $('toast');
  var PAGE = 40, lastResults = [], shown = 0, lastKw = '', lastNo = '';

  var SCHED_LABEL = { 'CPWD': 'CPWD DSR (Delhi)', 'I&WD': 'I&WD (West Bengal)', 'PWD-RB': 'PWD Roads & Bridges (WB)' };
  var SCHED_SHORT = { 'CPWD': 'CPWD', 'I&WD': 'I&WD', 'PWD-RB': 'PWD R&B' };
  var QUICK = ['Earth Work', 'Concrete Work', 'Reinforced Cement Concrete', 'Masonry Work', 'Flooring', 'Finishing', 'Steel Work', 'Water Supply', 'Sanitary Installations', 'Water Proofing'];
  var CORR_LABEL = { new_item: 'New item added', rate_change: 'Rate revised', description_amendment: 'Description revised', rate_and_description: 'Rate & description revised', dar_component_change: 'DAR cost analysis revised', deletion: 'Item deleted', other: 'Revised' };
  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return v == null ? '—' : inr.format(v); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, term) {
    var e = esc(text);
    if (!term) return e;
    var words = term.trim().split(/\s+/).filter(function (w) { return w.length > 1; }).map(function (w) { return reEsc(esc(w)); });
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
    var text = it.item_no + '\t' + it.description + '\t' + (it.unit || '') + '\t' + it.rate;
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

  function cardFor(it) {
    var el = document.createElement('article');
    el.className = 'card';
    var sched = it.schedule ? '<span class="b s-' + slug(it.schedule) + '">' + esc(SCHED_SHORT[it.schedule] || it.schedule) + '</span>' : '';
    var corr = it.correction ? '<span class="b ' + (it.correction.type === 'new_item' ? 'c-new">🆕 Added' : 'c-upd">✏️ Corrected') + ' · Slip ' + esc(it.correction.slip) + '</span>' : '';
    var extra = '';
    if (it.zones) {
      extra += '<div class="panel"><div class="panel-title">Rate by zone</div><div class="zones">' + Object.keys(it.zones).map(function (z) {
        return '<div class="zone"><span>' + esc(z) + '</span><span>' + money(it.zones[z]) + '</span></div>';
      }).join('') + '</div></div>';
    }
    if (it.rate_notes) extra += '<div class="panel"><div class="panel-title">Rate detail</div>' + esc(it.rate_notes) + '</div>';
    var hasBd = it.breakdown && it.breakdown.components && it.breakdown.components.length;
    var longDesc = it.description.length > 150;
    el.innerHTML =
      '<div class="card-top"><span class="itemno">' + hl(it.item_no, lastNo) + '</span>' +
      '<div class="rate"><div class="rate-v">' + money(it.rate) + '</div><div class="rate-u">per ' + esc(it.unit || '—') + '</div></div></div>' +
      '<div class="desc">' + hl(it.description, lastKw) + '</div>' +
      '<div class="badges">' + sched + corr + '<button type="button" class="b cat">' + esc(it.category) + '</button></div>' +
      (extra ? '<div class="p-extra" hidden>' + extra + '</div>' : '') +
      '<div class="actions">' +
        ((longDesc || extra) ? '<button type="button" class="act more-toggle">' + (extra ? 'Show details' : 'Show full text') + '</button>' : '') +
        (hasBd ? '<button type="button" class="act ra-btn">Rate analysis</button>' : '') +
        (it.correction ? '<button type="button" class="act corr-btn">Correction</button>' : '') +
        '<button type="button" class="act copy-btn">Copy</button>' +
      '</div>' +
      (hasBd ? breakdownHtml(it) : '') + (it.correction ? correctionHtml(it) : '');

    el.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.classList.contains('cat')) { fCategory.value = it.category; syncChips(); runSearch(); window.scrollTo(0, 0); }
      else if (t.classList.contains('copy-btn')) copyItem(it);
      else if (t.classList.contains('more-toggle')) {
        var open = el.classList.toggle('open');
        var ex = el.querySelector('.p-extra'); if (ex) ex.hidden = !open;
        t.textContent = open ? 'Show less' : (ex ? 'Show details' : 'Show full text');
      } else if (t.classList.contains('ra-btn')) {
        var p = el.querySelector('.p-ra'); p.hidden = !p.hidden; t.textContent = p.hidden ? 'Rate analysis' : 'Hide analysis';
      } else if (t.classList.contains('corr-btn')) {
        var q = el.querySelector('.p-corr'); q.hidden = !q.hidden; t.textContent = q.hidden ? 'Correction' : 'Hide correction';
      }
    });
    return el;
  }

  function renderMore() {
    var old = list.querySelector('.showmore'); if (old) old.remove();
    var frag = document.createDocumentFragment();
    var end = Math.min(shown + PAGE, lastResults.length);
    for (var i = shown; i < end; i++) frag.appendChild(cardFor(lastResults[i]));
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
    if (!itemNo && !kw && !fCategory.value && !fSchedule.value) {
      empty.hidden = false; list.hidden = true; metaRow.hidden = true; return;
    }
    var r = search({ itemNo: itemNo, keywords: kw, category: fCategory.value, schedule: fSchedule.value, sort: fSort.value });
    lastKw = kw; lastNo = itemNo;
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

  function buildUi() {
    $('count').textContent = meta.count.toLocaleString('en-IN') + ' items';
    (meta.schedules || []).forEach(function (sc) {
      var o = document.createElement('option'); o.value = sc;
      var n = (meta.schedule_counts || {})[sc];
      o.textContent = (SCHED_LABEL[sc] || sc) + (n ? ' (' + n.toLocaleString('en-IN') + ')' : '');
      fSchedule.appendChild(o);
    });
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

  function init() {
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
