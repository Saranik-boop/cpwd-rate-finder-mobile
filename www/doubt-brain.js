// Doubt Solver "brain": works out what kind of doubt is being asked (rate, is X included, how is it
// measured, where is it used, difference between two items, which schedule applies ...), finds the
// item(s) it is about, and writes a direct answer from the app's own data - the schedule item, its
// explanation (included / not included / measurement / codes / site notes) and the rate analysis.
// Fully offline. Rates are only ever read from the schedule data; nothing is estimated.
(function () {
  'use strict';

  var SHORT = { 'CPWD': 'CPWD DSR', 'I&WD': 'I&WD USoR', 'PWD-RB': 'WB PWD R&B', 'PWD-BLD': 'WB PWD Bldg', 'PWD-SAN': 'WB PWD Sanitary', 'PWD-NH': 'PWD(NH) SoR', 'SUPP': 'State PWD booklet' };
  var INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

  // spoken / short forms -> the words the schedules use
  var EXPAND = [
    [/\brcc\b|\br\.c\.c\.?/gi, 'reinforced cement concrete'], [/\bpcc\b|\bp\.c\.c\.?/gi, 'cement concrete'],
    [/\bbrick ?work\b/gi, 'brick work'], [/\bdpc\b/gi, 'damp proof course'], [/\bms\b/gi, 'M.S.'], [/\bci\b/gi, 'C.I.'],
    [/\bgi\b/gi, 'G.I.'], [/\bswr\b/gi, 'SWR'], [/\bwbm\b/gi, 'water bound macadam'], [/\bwmm\b/gi, 'wet mix macadam'],
    [/\bdbm\b/gi, 'dense bituminous macadam'], [/\bgsb\b/gi, 'granular sub-base'], [/\bbc\b(?= (layer|road|wearing|25|30|40|50))/gi, 'bituminous concrete'],
    [/\bpqc\b/gi, 'pavement quality concrete'], [/\bdlc\b/gi, 'dry lean concrete'], [/\bacp\b/gi, 'aluminium composite panel'],
    [/\bupvc\b/gi, 'uPVC'], [/\bcpvc\b/gi, 'CPVC'], [/\bplastering\b/gi, 'plaster'], [/\bpainting\b/gi, 'painting'],
    [/\bshuttering\b/gi, 'centering and shuttering'], [/\bformwork\b/gi, 'centering and shuttering'], [/\bsteel bars?\b|\brebars?\b|\btmt\b/gi, 'steel reinforcement'],
    [/\bexcavation\b/gi, 'excavation'], [/\bearth ?filling\b/gi, 'filling earth'], [/\btiles?\b/gi, 'tiles'], [/\bwindow grill\b/gi, 'grill']
  ];

  // words that say WHAT the person wants to know (removed before the item search)
  var INTENT_WORDS = /\b(what|whats|which|where|when|why|how|is|are|was|were|does|do|did|can|could|should|shall|will|would|i|we|my|our|me|us|tell|show|give|explain|please|kindly|the|a|an|this|that|these|those|it|its|item|items|no|number|code|rate|rates|cost|price|prices|amount|value|rs|inr|₹|per|unit|included|include|includes|including|inclusive|covered|cover|part|extra|separate|separately|paid|payable|pay|payment|measured|measure|measurement|measuring|deduct|deduction|deductions|used|use|uses|using|usage|application|applications|purpose|apply|difference|different|differ|between|versus|vs|compare|comparison|better|cheaper|costlier|specification|specifications|spec|code|codes|standard|is code|quality|check|checks|mistake|mistakes|precaution|precautions|note|notes|analysis|breakdown|build|up|labour|material|materials|component|components|schedule|sor|applicable|types|type|kinds|kind|options|option|list|all|available|mean|meaning|means|about|for|of|in|on|at|to|with|without|and|or|from|under|as|by|any|there|have|has|had|get|need|want|know|also|not|be|been|one|some)\b/gi;

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9.&%/ -]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function expand(q) { var s = q; EXPAND.forEach(function (e) { s = s.replace(e[0], e[1]); }); return s; }
  function stem(w) { w = w.toLowerCase(); if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y'; if (w.length > 4 && /(ing)$/.test(w)) return w.slice(0, -3); if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1); return w; }
  function words(s) { return norm(s).split(' ').filter(function (w) { return w.length > 1; }); }

  function shortDesc(it) {
    var d = String(it.description || '').replace(/\s+/g, ' ').trim();
    var parts = d.split(/\s:\s/);
    if (parts.length > 1) {
      var head = parts[0], tail = parts[parts.length - 1];
      if (head.length > 90) head = head.slice(0, 88).replace(/\s+\S*$/, '') + '…';
      return head + ' — ' + tail;
    }
    return d.length > 150 ? d.slice(0, 148).replace(/\s+\S*$/, '') + '…' : d;
  }
  function rateText(it) {
    if (it.zones && typeof it.zones === 'object') {
      var z = Object.keys(it.zones).filter(function (k) { return it.zones[k] != null; }).map(function (k) { return k + ' ' + INR.format(it.zones[k]); });
      if (z.length) return z.join(' · ') + ' per ' + (it.unit || 'unit');
    }
    if (it.rate == null) return it.rate_text ? it.rate_text : 'no single rate (see the item)';
    return INR.format(it.rate) + ' per ' + (it.unit || 'unit');
  }
  function sched(it) { return SHORT[it.schedule] || it.schedule || ''; }
  function ref(it) { return sched(it) + ' item ' + it.item_no; }
  function info(it) { return (window.SCHEDULES || {})[it.schedule] || {}; }
  function applicable(it) { return info(it).applicable !== false; }
  function isBasic(it) { return it.source === 'basic' || /^basic rates/i.test(it.category || '') || /wages|labour rates/i.test(it.category || ''); }

  // ----------------------------------------------------------------- intent
  function intentOf(q) {
    var t = q.toLowerCase();
    if (/\bnot included\b|\bexcluded?\b|\bexcluding\b|\bpaid separately\b|\bseparate(ly)? (item|paid)\b|\bextra (item|payment|cost)\b|\bwhat else\b/.test(t) && !/\b(is|are)\s+\S+.*\bnot included in\b/.test(t.replace(/^what (is|are) not included in/, ''))) return { k: 'excluded' };
    var inc = t.match(/\b(?:is|are|does|do|will)\s+(?:the\s+)?(.+?)\s+(?:also\s+)?(?:included|include[sd]?|covered|part of|inclusive)\s+(?:in|with|under|within|of)?\s*(?:the\s+)?(.+?)\??$/) ||
              t.match(/\b(?:does|do|will)\s+(?:the\s+)?(.+?)\s+(?:rate\s+|item\s+)?(?:include|cover)s?\s+(?:the\s+)?(.+?)\??$/);
    if (inc) {
      // "does <item> include <thing>" has the item first
      var itemFirst = /\b(?:include|cover)s?\s/.test(t) && !/\bincluded\b/.test(t);
      return { k: 'included', thing: (itemFirst ? inc[2] : inc[1]).trim(), subject: (itemFirst ? inc[1] : inc[2]).trim() };
    }
    if (/\bnot included\b|\bexcluded?\b|\bexcluding\b|\bpaid separately\b|\bseparate(ly)? (item|paid)\b|\bextra (item|payment|cost)\b|\bwhat else\b/.test(t)) return { k: 'excluded' };
    if (/\bwhat('?s| is| are)? (all )?included\b|\bincludes? what\b|\binclusive of what\b|\bwhat does .* (include|cover)\b|\bscope of\b/.test(t)) return { k: 'includedAll' };
    if (/\bdifference\b|\bdiffer\b|\bvs\.?\b|\bversus\b|\bcompare|\bcomparison\b|\bwhich is (better|cheaper|costlier)\b/.test(t)) return { k: 'compare' };
    if (/\bmeasur|\bdeduct|\bhow (is|are) .* paid\b|\bmode of payment\b|\bpayment basis\b|\bunit of (measurement|payment)\b|\bwhich unit\b|\bin what unit\b/.test(t)) return { k: 'measure' };
    if (/\bwhere\b.*\b(use|used|apply|applied|provide|provided)\b|\bused (in|for)\b|\buse of\b|\bapplication|\bpurpose\b|\bwhy (do|is|are) (we|it)\b|\bwhen (to|do we|should)\b/.test(t)) return { k: 'where' };
    if (/\bis ?code|\bi\.s\.|\bspecification|\bstandard\b|\bwhich code\b|\bmorth\b|\birc\b|\bspec\b/.test(t)) return { k: 'spec' };
    if (/\bquality\b|\bchecks?\b|\bmistakes?\b|\bprecautions?\b|\bsite notes?\b|\bcare\b|\btests?\b(?! pit)/.test(t)) return { k: 'site' };
    if (/\banalysis\b|\bbreak ?down\b|\bbuild ?up\b|\bhow (is|was) (the )?rate (worked|calculated|arrived|made)\b|\bmaterials? (and|&) labour\b|\bcomponents?\b/.test(t)) return { k: 'analysis' };
    if (/\bwhich (schedule|sor|book)\b|\bapplicable (schedule|sor)\b|\b(should|can) i use\b.*\b(schedule|sor|cpwd|dsr|usor|nh|pwd)\b|\bsuperseded\b|\b23\.07\.2026\b/.test(t)) return { k: 'which' };
    if (/\btypes of\b|\bkinds of\b|\boptions?\b|\b(list|all) (items|options|types)\b|\bwhat (items|types) (are|is)\b|\bvarieties\b|\bsizes\b|\bgrades\b/.test(t)) return { k: 'list' };
    if (/\bwhat (is|are|does)\b.*\bmean\b|\bmeaning of\b|\bdefine\b|\bfull form\b|\bstand for\b/.test(t)) return { k: 'define' };
    return { k: 'rate' };
  }

  var FOLLOW = /^(and |also |then |what about |how about )|\b(it|this|that|this item|that item|the same|same item|its|above item|above)\b/i;

  function createDoubtBrain(items, meta, notes, expl) {
    expl = expl || [];
    var base = window.createDoubtEngine(items, meta, notes);
    var ctx = null;          // last item talked about (for follow-up questions)
    var byNo = {};
    items.forEach(function (it) { (byNo[String(it.item_no).toLowerCase()] = byNo[String(it.item_no).toLowerCase()] || []).push(it); });

    function E(it) { return it && it.gx != null ? expl[it.gx] : null; }

    // what is left of the question once the "asking" words are gone = the subject to look up
    function subjectText(q) {
      var s = expand(q).replace(/[?!,;]+/g, ' ');
      s = s.replace(/\b(in|of|as per|under|from)\s+(the\s+)?(cpwd|dsr|dar|pwd\s*\(?nh\)?|nh|usor|i\s*&\s*wd)(\s+(sor|schedule))?\b/gi, ' ');
      s = s.replace(INTENT_WORDS, ' ');
      return s.replace(/\s+/g, ' ').trim();
    }

    // up to n best items for a subject, applicable schedules first, work items before basic rates
    function find(text, hint, n) {
      n = n || 6;
      var codes = [];
      var re = /\b(\d{1,3}[A-Za-z]?(?:\.[A-Za-z0-9]{1,6}){1,6}(?:\([a-z0-9]{1,5}\))*)\b|\b((?:NH-|RB-)[A-Za-z0-9.()\/-]+)/g, m;
      while ((m = re.exec(text)) !== null) codes.push((m[1] || m[2]).replace(/[.,;:]+$/, ''));
      for (var c = 0; c < codes.length; c++) {
        var exact = (byNo[codes[c].toLowerCase()] || []).filter(function (it) { return !hint || it.schedule === hint; });
        if (exact.length) {
          exact.sort(function (a, b) { return (applicable(b) ? 1 : 0) - (applicable(a) ? 1 : 0); });
          return { list: exact.slice(0, n), via: 'code', conf: 1, code: codes[c] };
        }
      }
      var subj = subjectText(text);
      if (subj.length < 2) return null;
      var res = base.search({ keywords: subj, schedule: hint, limit: 40 }).results;
      if (!res.length && subj.split(' ').length > 2) {
        // drop the least useful word and try again (one typo or an unusual word shouldn't sink the search)
        var ws = subj.split(' ');
        for (var i = ws.length - 1; i >= 0 && !res.length; i--) res = base.search({ keywords: ws.filter(function (_, j) { return j !== i; }).join(' '), schedule: hint, limit: 40 }).results;
      }
      if (!res.length) return null;
      var top = res[0]._score || 0;
      res.forEach(function (r) {
        var s = r._score || 0;
        if (!hint && applicable(r)) s += 0.05;
        if (isBasic(r)) s -= 0.06;
        if (r.deleted) s -= 0.1;
        r._rank = s;
      });
      res.sort(function (a, b) { return b._rank - a._rank; });
      return { list: res.slice(0, n), via: 'keywords', conf: top, subj: subj };
    }

    // does a list of explanation lines mention the thing asked about?
    function mentions(line, thingWords) {
      var lw = words(line).map(stem);
      var hit = thingWords.filter(function (w) { return lw.indexOf(w) >= 0; });
      return hit.length >= Math.max(1, Math.ceil(thingWords.length * 0.6));
    }

    function thingWordsOf(thing) {
      return words(expand(thing)).map(stem).filter(function (w) { return w.length > 2 && !/^(the|and|for|with|item|rate|cost|its|charge|charges)$/.test(w); });
    }

    function includedAnswer(it, thing) {
      var e = E(it), tw = thingWordsOf(thing), d = String(it.description || '');
      var out = { verdict: null, why: [], basis: [] };
      if (!tw.length) return out;
      // Evidence in order of strength: an "excluding ..." clause in the item > the explanation's
      // "not included" list > its "included" list > the item naming it > the rate analysis listing it.
      var parts = d.split(/\b(excluding|exclusive of|but excluding|without)\b/i);
      var incPart = parts[0], excPart = parts.slice(1).join(' ');
      var ev = [];
      if (excPart && mentions(excPart, tw)) ev.push({ v: 'no', w: 5, why: 'The item description says the rate is "excluding" this.', b: 'Per item description' });
      if (e) {
        (e.n || []).forEach(function (x) { if (mentions(x.t, tw)) ev.push({ v: 'no', w: 4, why: 'Paid separately: ' + x.t + (x.ref ? ' (see item ' + x.ref + ')' : ''), b: x.b, ref: x.ref }); });
        (e.i || []).forEach(function (x) { if (mentions(x.t, tw)) ev.push({ v: 'yes', w: 3, why: 'Included: ' + x.t, b: x.b }); });
      }
      if (mentions(incPart, tw)) ev.push({ v: 'yes', w: 2, why: 'The item description mentions it.', b: 'Per item description' });
      var bd = it.breakdown && it.breakdown.components;
      if (bd && bd.length) {
        var hit = bd.filter(function (c) { return mentions(c.description || '', tw); });
        if (hit.length) ev.push({ v: 'yes', w: 1, why: 'The rate analysis (DAR) includes: ' + hit.slice(0, 3).map(function (c) { return c.description + (c.quantity != null ? ' — ' + c.quantity + ' ' + (c.unit || '') : ''); }).join('; '), b: 'Per DAR analysis' });
      }
      if (!ev.length) return out;
      ev.sort(function (a, b) { return b.w - a.w; });
      out.verdict = ev[0].v;
      out.ref = ev[0].ref || (ev.filter(function (x) { return x.ref; })[0] || {}).ref;
      ev.filter(function (x) { return x.v === out.verdict; }).forEach(function (x) { out.why.push(x.why); out.basis.push(x.b); });
      var other = ev.filter(function (x) { return x.v !== out.verdict; });
      if (other.length && out.verdict === 'no') out.why.push('The description uses similar words, but the explanation of this item lists it as a separate item.');
      return out;
    }

    function related(it, list) {
      return (list || []).filter(function (x) { return x !== it && x.id !== it.id; }).slice(0, 4);
    }

    function itemSections(it, which) {
      var e = E(it), S = [];
      if (!e) return S;
      var want = function (k) { return !which || which.indexOf(k) >= 0; };
      if (want('u') && e.u) S.push({ h: 'Where it is used', p: e.u });
      if (want('i') && e.i && e.i.length) S.push({ h: 'Included in the rate', li: e.i.map(function (x) { return { t: x.t, b: x.b }; }) });
      if (want('n') && e.n && e.n.length) S.push({ h: 'Not included (paid separately)', li: e.n.map(function (x) { return { t: x.t + (x.ref ? ' — see item ' + x.ref : ''), b: x.b }; }) });
      if (want('m') && e.m && e.m.t) S.push({ h: 'Measurement & payment', p: e.m.t, b: e.m.b });
      if (want('c') && e.c && e.c.length) S.push({ h: 'Codes & specifications', p: e.c.join(' · ') });
      if (want('s') && e.s && e.s.length) S.push({ h: 'Site notes & quality checks', li: e.s.map(function (x) { return { t: x }; }) });
      return S;
    }

    function usagePlaces(it) {
      try { return window.UsageHint ? window.UsageHint.places(it, E(it)) : []; } catch (er) { return []; }
    }

    function follows(it) {
      var f = [];
      var e = E(it);
      f.push('What is included in ' + it.item_no + '?');
      if (e && e.m) f.push('How is ' + it.item_no + ' measured?');
      if (e && e.n && e.n.length) f.push('What is not included in ' + it.item_no + '?');
      if (it.breakdown) f.push('Show the rate analysis of ' + it.item_no);
      if (e && e.u) f.push('Where is ' + it.item_no + ' used?');
      return f.slice(0, 4);
    }

    function answerFor(it, intent, found) {
      var R = { type: 'composed', item: it, alts: related(it, found && found.list), sections: [], follow: follows(it), basis: [] };
      var si = info(it), name = shortDesc(it), r = rateText(it);
      var refOnly = si.applicable === false ? ' Note: ' + sched(it) + ' is kept for reference only — ' + (si.tag || 'superseded for estimates from 23.07.2026') + '.' : '';
      var e = E(it);
      switch (intent.k) {
        case 'included': {
          var a = includedAnswer(it, intent.thing);
          if (a.verdict === 'yes') R.lead = 'Yes — ' + intent.thing + ' is included in ' + ref(it) + '.';
          else if (a.verdict === 'no') R.lead = 'No — ' + intent.thing + ' is not included in ' + ref(it) + '; it is paid separately' + (a.ref ? ' (see item ' + a.ref + ')' : '') + '.';
          else R.lead = 'The schedule does not say clearly whether ' + intent.thing + ' is included in ' + ref(it) + '. Check the chapter notes / specification before deciding — below is everything the item and its explanation do say.';
          R.points = a.why; R.basis = a.basis;
          R.sections = itemSections(it, a.verdict ? [] : ['i', 'n']);
          break;
        }
        case 'includedAll':
          R.lead = 'Here is what the rate of ' + ref(it) + ' (' + r + ') covers, and what is paid separately.';
          R.sections = itemSections(it, ['i', 'n']);
          if (!R.sections.length) R.points = ['The item description itself is the scope: "' + it.description + '"'];
          break;
        case 'excluded':
          R.lead = 'Things not covered by the rate of ' + ref(it) + ' and paid under separate items:';
          R.sections = itemSections(it, ['n']);
          if (!R.sections.length) R.points = ['No separate items are listed in the explanation. Read the description: anything after "excluding" is paid separately.'];
          break;
        case 'measure':
          R.lead = e && e.m && e.m.t ? ref(it) + ' is paid per ' + (it.unit || 'unit') + '. ' + e.m.t : ref(it) + ' is paid per ' + (it.unit || 'unit') + '. Measure as per IS 1200 and the chapter notes.';
          R.basis = e && e.m ? [e.m.b] : ['Per item description'];
          R.sections = itemSections(it, ['c']);
          break;
        case 'where': {
          var pl = usagePlaces(it).map(function (x) { return x.replace(/^\S+\s/, ''); });
          R.lead = (e && e.u ? e.u : name) + (pl.length ? ' Typically used in: ' + pl.join(', ') + '.' : '');
          R.sections = itemSections(it, ['i']);
          break;
        }
        case 'spec':
          R.lead = e && e.c && e.c.length ? 'Codes / specifications for ' + ref(it) + ': ' + e.c.join(' · ') + '.' : 'No specific code is listed for ' + ref(it) + '. Follow the schedule\'s specification (CPWD Specifications for DSR items, MoRTH for road & bridge items).';
          R.sections = itemSections(it, ['s']);
          break;
        case 'site':
          R.lead = 'Points to watch at site for ' + ref(it) + ':';
          R.sections = itemSections(it, ['s', 'm']);
          if (!R.sections.length) R.points = ['No site notes are written for this item yet. Check against the specification and the chapter notes.'];
          break;
        case 'analysis':
          R.lead = it.breakdown ? 'Rate analysis of ' + ref(it) + ' (' + r + '). Open the build-up below to see materials, labour, overheads and profit.' : ref(it) + ' (' + r + ') has no rate analysis in this app — ' + (it.schedule === 'CPWD' ? 'it is a DSR rate without a DAR sheet.' : 'the ' + sched(it) + ' does not publish analyses.');
          R.openAnalysis = !!it.breakdown;
          break;
        case 'which':
          R.lead = ref(it) + ' is in ' + (it.schedule_label || sched(it)) + '. ' + (si.applicable === false ? 'Under the 23.07.2026 order this schedule is kept for reference only; use the applicable schedule\'s item for estimates.' : 'Under the 23.07.2026 order it is the applicable schedule for ' + (si.tag || 'this kind of work') + '.');
          break;
        default:
          R.lead = 'The rate for ' + name + ' (' + ref(it) + ') is ' + r + '.';
      }
      if (intent.k !== 'which' && refOnly) R.lead += refOnly;
      if (it.deleted) R.lead += ' ⛔ This item is ' + it.deleted + '.';
      if (intent.k !== 'rate' && intent.k !== 'analysis' && intent.k !== 'includedAll') R.rateLine = r;
      ctx = it;
      return R;
    }

    function compare(q, hint) {
      var t = q.replace(/\?/g, '');
      var m = t.match(/difference between (.+?) and (.+)$/i) || t.match(/(?:compare|comparison of)\s+(.+?)\s+(?:and|with|vs\.?|versus)\s+(.+)$/i) || t.match(/^(.+?)\s+(?:vs\.?|versus|or)\s+(.+?)(?:\s*(?:which|,).*)?$/i);
      if (!m) return null;
      var a = find(m[1], hint, 3), b = find(m[2], hint, 3);
      if (!a || !b) return null;
      var A = a.list[0], B = b.list[0];
      if (!A || !B || A.id === B.id) return null;
      var R = { type: 'compare', a: A, b: B, follow: follows(A).slice(0, 2).concat(follows(B).slice(0, 2)) };
      var lines = [];
      lines.push(ref(A) + ': ' + rateText(A));
      lines.push(ref(B) + ': ' + rateText(B));
      if (A.rate != null && B.rate != null && A.unit === B.unit && !A.zones && !B.zones) {
        var d = B.rate - A.rate;
        lines.push(d === 0 ? 'Both have the same rate.' : (d > 0 ? ref(B) + ' is ' + INR.format(d) + ' per ' + A.unit + ' more (' + Math.round(d / A.rate * 100) + '%).' : ref(A) + ' is ' + INR.format(-d) + ' per ' + A.unit + ' more (' + Math.round(-d / B.rate * 100) + '%).'));
      } else if (A.unit !== B.unit) lines.push('The units differ (' + A.unit + ' vs ' + B.unit + '), so the rates cannot be compared directly.');
      R.lead = 'Here is how the two compare:';
      R.points = lines;
      var ea = E(A), eb = E(B);
      R.uses = [ea && ea.u ? [ref(A), ea.u] : null, eb && eb.u ? [ref(B), eb.u] : null].filter(Boolean);
      ctx = A;
      return R;
    }

    function listAnswer(found, q) {
      var L = found.list.slice(0, 6);
      return { type: 'list', lead: 'These are the closest items for "' + (found.subj || q) + '" — tap one to ask about it:', list: L, follow: [] };
    }

    function ask(raw) {
      var q = String(raw || '').trim();
      if (!q) return { type: 'empty' };
      var intent = intentOf(q);
      var hint = '';
      try { hint = window.__doubtScheduleHint ? window.__doubtScheduleHint(q) : ''; } catch (er) { hint = ''; }

      // greetings / thanks
      if (/^(hi|hello|hey|namaskar|good (morning|evening|afternoon))\b[!. ]*$/i.test(q)) return { type: 'composed', lead: 'Hello! Ask me about any item — its rate, what is included, how it is measured, where it is used, or compare two items. Example: "Is hinge included in flush door shutter?"', follow: ['Rate of 12 mm cement plaster 1:6', 'Difference between flush door and panelled door', 'How is brick work measured?'] };
      if (/^(thanks|thank you|ok|okay|great|nice)\b/i.test(q)) return { type: 'composed', lead: 'You\'re welcome. Ask anything else whenever you like.' };

      if (intent.k === 'compare') { var C = compare(q, hint); if (C) return C; }

      var subjQ = intent.k === 'included' ? intent.subject : q;
      var subjWords = subjectText(subjQ).split(' ').filter(function (w) { return w.length > 2; });
      // follow-up about the item just discussed: "how is it measured", "what is not included in this"
      if (ctx && (FOLLOW.test(subjQ) || !subjWords.length) && !/\d+\.\d+/.test(subjQ) && subjWords.length <= 1) return answerFor(ctx, intent, { list: [] });

      // a general-reference question (CPOH, GST, correction slips, zones...) answered from the notes
      var b = base.ask(q);
      var codeHit = /\d+\.\d+/.test(q) || /\b(NH-|RB-)/i.test(q);
      var general = intent.k === 'rate' || intent.k === 'define' || intent.k === 'which' || intent.k === 'list';
      if (b && b.type === 'stat') return b;
      if (b && b.type === 'note' && !codeHit && general) return b;

      var found = find(subjQ, hint, 6);
      if (!found) {
        if (b && b.type !== 'none') return b;
        if (ctx && intent.k !== 'rate') return answerFor(ctx, intent, { list: [] });
        return { type: 'none' };
      }
      if (intent.k === 'list') return listAnswer(found, q);
      var top = found.list[0];
      if (found.via === 'keywords' && found.conf < 0.35) {
        var L = listAnswer(found, q);
        L.lead = 'I am not sure which item you mean. The closest ones are below — tap one to ask about it:';
        return L;
      }
      return answerFor(top, intent, found);
    }

    function pick(id, k) {
      var it = null; for (var i = 0; i < items.length; i++) if (items[i].id === id) { it = items[i]; break; }
      return it ? answerFor(it, { k: k || 'rate' }, { list: [] }) : { type: 'none' };
    }
    return { meta: base.meta, ask: ask, pick: pick, reset: function () { ctx = null; } };
  }

  window.createDoubtBrain = createDoubtBrain;
  window.__doubtIntent = intentOf;
})();
