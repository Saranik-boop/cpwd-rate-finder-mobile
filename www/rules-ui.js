// "Service Rules" tab: search and ask about the West Bengal Service Rules Part I & Part II.
// Fully offline: a small ranked word index over the rule text (window.WBSR) plus ready answers
// for common doubts (window.WBSR_TOPICS), each answer showing the rules it comes from.
(function () {
  'use strict';
  var RULES = window.WBSR || [], TOPICS = window.WBSR_TOPICS || [], AMEND = window.WBSR_AMEND || [];
  var AM = {}; AMEND.forEach(function (a) { AM[a.id] = a; });
  function ruleKey(r) { return r.b + ':' + (r.ap ? r.ap.split(' — ')[0] + ':' : '') + r.r; }
  function amendsFor(r) { var k = ruleKey(r); return AMEND.filter(function (a) { return a.rules.indexOf(k) >= 0; }); }
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------------------------------------------------------------- text helpers
  var STOP = {};
  ('a an the of to in on at for by with from as is are was were be been am do does did can could shall should will would may might must ' +
   'i me my we our you your he his she her it its they them their this that these those there here what which who whom whose when where why how ' +
   'any all some no not or and if then than so such per about into under over also just only get got give given tell know want need please kindly ' +
   'rule rules wbsr service government employee employees govt west bengal part').split(' ').forEach(function (w) { STOP[w] = 1; });
  var SYN = [
    [/\bc\.?l\.?\b/g, 'casual leave'], [/\be\.?l\.?\b/g, 'earned leave'], [/\bp\.?l\.?\b/g, 'earned leave'], [/\bh\.?p\.?l\.?\b/g, 'half pay leave'],
    [/\be\.?o\.?l\.?\b/g, 'extraordinary leave'], [/\bl\.?w\.?p\.?\b/g, 'extraordinary leave'], [/\bl\.?n\.?d\.?\b/g, 'leave not due'], [/\bl\.?p\.?r\.?\b/g, 'leave preparatory to retirement'],
    [/\bt\.?a\.?\b/g, 'travelling allowance'], [/\bd\.?a\.?\b/g, 'daily allowance'], [/\bh\.?r\.?a\.?\b/g, 'house rent allowance'],
    [/\b(ph\.?d|doctorate|masters?|m\.?tech|mba|post ?graduation|degree|higher education|education(al)?)\b/g, 'study higher studies course'],
    [/\b(pregnan\w*|delivery|childbirth)\b/g, 'maternity'], [/\bextra ?ordinary\b/g, 'extraordinary'], [/\bhalf ?pay\b/g, 'half pay'],
    [/\bsalary\b/g, 'pay salary'], [/\bsick\b/g, 'medical certificate'], [/\bwithout pay\b/g, 'extraordinary leave']
  ];
  function stem(w) {
    if (w.length > 5 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9½ ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function toks(s) { return norm(s).split(' ').filter(function (w) { return w && !STOP[w] && (w.length > 1 || /\d/.test(w)); }).map(stem); }
  function expandQ(q) { var s = ' ' + q.toLowerCase() + ' '; SYN.forEach(function (x) { s = s.replace(x[0], function (m) { return m + ' ' + x[1]; }); }); return s; }

  // ---------------------------------------------------------------- index (built on first use)
  var chunks = null, inv = null, avgLen = 0;
  function label(r) { return 'WBSR Part ' + r.b + ' · ' + (r.ap ? r.ap.split(' — ')[0] + ', para ' + r.r : 'Rule ' + r.r); }
  function build() {
    chunks = []; inv = {};
    RULES.forEach(function (r, ri) {
      // split long rules at sub-rules / notes so a hit points to the right part
      var parts = r.t.split(/(?=\s\(\d{1,2}\)\s)|(?=\sNote\s?\d*\s?[.—-])/), cur = '';
      parts.forEach(function (p) {
        if ((cur + p).length > 1100 && cur.length > 250) { chunks.push({ ri: ri, t: cur }); cur = ''; }
        cur += p;
      });
      if (cur) chunks.push({ ri: ri, t: cur });
    });
    var total = 0;
    chunks.forEach(function (c, ci) {
      var r = RULES[c.ri];
      var tw = toks(c.t), hw = toks((r.h || '') + ' ' + (r.ch || '') + ' ' + (r.sec || '') + ' ' + (r.ap || ''));
      c.len = tw.length; total += tw.length;
      var tf = {};
      tw.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
      hw.forEach(function (w) { tf[w] = (tf[w] || 0) + 1.5; });
      Object.keys(tf).forEach(function (w) { (inv[w] = inv[w] || []).push([ci, tf[w]]); });
      c.low = ' ' + norm(c.t) + ' ';
    });
    avgLen = total / Math.max(1, chunks.length);
  }

  function search(q, book) {
    if (!chunks) build();
    var qe = expandQ(q), qt = toks(qe), seen = {};
    qt = qt.filter(function (w) { return seen[w] ? false : (seen[w] = 1); });
    if (!qt.length) return [];
    var N = chunks.length, score = {};
    qt.forEach(function (w) {
      // exact token, plus prefix matches for partial words (min 4 letters)
      var lists = inv[w] ? [inv[w]] : [];
      if (w.length >= 4) Object.keys(inv).forEach(function (k) { if (k !== w && k.indexOf(w) === 0) lists.push(inv[k]); });
      lists.forEach(function (list, li) {
        var idf = Math.log(1 + (N - list.length + 0.5) / (list.length + 0.5)) * (li ? 0.6 : 1);
        list.forEach(function (e) {
          var c = chunks[e[0]], k = 1.2, b = 0.75;
          var s = idf * (e[1] * (k + 1)) / (e[1] + k * (1 - b + b * c.len / avgLen));
          var o = score[e[0]] || (score[e[0]] = { s: 0, hit: {} });
          o.s += s; o.hit[w] = 1;
        });
      });
    });
    // phrases from the question ("casual leave", "half pay leave") count extra when they appear as written
    var words = norm(qe).split(' ').filter(function (w) { return w && !STOP[w]; });
    var phrases = [];
    for (var i = 0; i + 1 < words.length; i++) phrases.push(words[i] + ' ' + words[i + 1]);
    var out = [];
    Object.keys(score).forEach(function (ci) {
      var c = chunks[ci], o = score[ci], r = RULES[c.ri];
      if (book && r.b !== book) return;
      var cover = Object.keys(o.hit).length / qt.length;
      var s = o.s * (0.4 + cover);
      phrases.forEach(function (p) { if (c.low.indexOf(' ' + p + ' ') >= 0) s += 2.2; });
      out.push({ ci: +ci, ri: c.ri, s: s });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    // best chunk per rule
    var best = [], used = {};
    for (var j = 0; j < out.length && best.length < 25; j++) {
      if (used[out[j].ri]) continue;
      used[out[j].ri] = 1; best.push(out[j]);
    }
    return best;
  }

  // ---------------------------------------------------------------- ready answers
  function topicFor(q) {
    var s = ' ' + norm(expandQ(q)) + ' ', best = null;
    TOPICS.forEach(function (t) {
      var sc = 0;
      t.kw.forEach(function (k) {
        var kn = ' ' + norm(k) + ' ';
        if (s.indexOf(kn) >= 0) sc += 1 + kn.trim().split(' ').length * 0.8;
      });
      if (sc > 0 && (!best || sc > best.sc)) best = { t: t, sc: sc };
    });
    return best && best.sc >= 1.8 ? best.t : null;
  }
  function findRule(c) {
    var p = c.split(':'), b = p[0];
    if (p.length === 3) return RULES.findIndex(function (x) { return x.b === b && x.ap.indexOf(p[1]) === 0 && x.r === p[2]; });
    return RULES.findIndex(function (x) { return x.b === b && !x.ap && x.r === p[1]; });
  }
  function citeLabel(c) {
    var p = c.split(':');
    return 'Part ' + p[0] + ' · ' + (p.length === 3 ? p[1] + ' para ' + p[2] : 'Rule ' + p[1]);
  }

  // ---------------------------------------------------------------- rendering
  var lastTerms = [];
  function hl(text) {
    var h = esc(text);
    if (!lastTerms.length) return h;
    var re = new RegExp('\\b(' + lastTerms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')\\w*', 'gi');
    return h.replace(re, '<mark>$&</mark>');
  }
  function pretty(t) {
    // line breaks before sub-rules and notes so long rules are readable
    return hl(t).replace(/\s(\(\d{1,2}\)|\([a-z]\)|\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)|Note\s?\d*\s?[.—-]|Provided)/g, '<br>$1');
  }
  function snippet(t) {
    var low = t.toLowerCase(), pos = -1;
    for (var i = 0; i < lastTerms.length && pos < 0; i++) pos = low.indexOf(lastTerms[i]);
    var a = Math.max(0, pos - 120), s = t.slice(a, a + 340);
    return (a > 0 ? '…' : '') + hl(s) + (a + 340 < t.length ? '…' : '');
  }
  function ruleCard(ri, chunkText, open) {
    var r = RULES[ri];
    var where = [r.ch, r.sec].filter(Boolean).join(' · ');
    return '<article class="sr-card" data-ri="' + ri + '">' +
      '<div class="sr-top"><span class="sr-no">' + esc(label(r)) + '</span><span class="sr-pg">p. ' + esc(r.p) + '</span></div>' +
      (where ? '<div class="sr-where">' + esc(where) + '</div>' : '') +
      (r.h ? '<div class="sr-heads">' + esc(r.h.length > 140 ? r.h.slice(0, 138) + '…' : r.h) + '</div>' : '') +
      amendsFor(r).map(function (a) { return amendCard(a, false); }).join('') +
      '<div class="sr-snip"' + (open ? ' hidden' : '') + '>' + snippet(chunkText || r.t) + '</div>' +
      '<div class="sr-full"' + (open ? '' : ' hidden') + '>' + pretty(r.t) + '</div>' +
      '<button type="button" class="sr-more">' + (open ? 'Show less' : 'Read full rule') + '</button></article>';
  }
  function amendCard(a, open) {
    return '<div class="sr-amd" data-amd="' + esc(a.id) + '"><div class="sr-amd-h"><span class="sr-amd-tag">Later order</span> ' + esc(a.t) + '</div>' +
      '<div class="sr-amd-m">' + esc(a.memo) + (a.eff ? ' · effective ' + esc(a.eff) : '') + '</div>' +
      '<div class="sr-amd-x"' + (open ? '' : ' hidden') + '>' + hl(a.x) +
      (a.rules.length ? '<div class="sr-amd-r">Changes: ' + a.rules.map(function (c) { return esc(citeLabel(c)); }).join(', ') + '</div>' : '') +
      '<div class="sr-amd-s">Source: ' + a.src.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]) + '</a>'; }).join(' · ') + '</div></div>' +
      '<button type="button" class="sr-amd-t">' + (open ? 'Hide' : 'What changed') + '</button></div>';
  }
  function amdChip(id) {
    var a = AM[id]; if (!a) return '';
    return '<button type="button" class="sr-cite sr-cite-a" data-amdc="' + esc(id) + '">' + esc(a.memo.replace(/^Memo /, '').split(/ dt\.| \(|;/)[0]) + '</button>';
  }
  function answerCard(t) {
    var body = t.a.map(function (line) {
      var h = esc(line).replace(/\[A:([a-z0-9]+)\]/g, function (m, id) { return amdChip(id); })
        .replace(/\[([IV]+:[^\]]+)\]/g, function (m, c) { return '<button type="button" class="sr-cite" data-cite="' + esc(c) + '">' + esc(citeLabel(c)) + '</button>'; });
      return /^\s{2,}•/.test(line) ? '<li class="sub">' + h.replace(/^\s*•\s*/, '') + '</li>' : '<li>' + h + '</li>';
    }).join('');
    return '<div class="sr-ans"><div class="sr-ans-h">' + esc(t.t) + '</div><ul>' + body + '</ul>' +
      (t.note ? '<div class="sr-note">' + esc(t.note) + '</div>' : '') +
      ((t.am || []).length ? '<div class="sr-cited-h">Later orders applied in this answer</div>' + t.am.map(function (id) { return AM[id] ? amendCard(AM[id], false) : ''; }).join('') : '') +
      (t.cite.length ? '<div class="sr-cited-h">Rules this answer is based on — tap to read</div><div class="sr-cited">' +
      t.cite.map(function (c) { return '<button type="button" class="sr-cite" data-cite="' + esc(c) + '">' + esc(citeLabel(c)) + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
  }

  var book = '', timer = null;
  function run() {
    var q = $('srQ').value.trim(), res = $('srRes'), intro = $('srIntro');
    if (!q) { res.innerHTML = ''; intro.hidden = false; return; }
    intro.hidden = true;
    lastTerms = norm(expandQ(q)).split(' ').filter(function (w) { return w.length > 2 && !STOP[w]; }).map(stem).filter(function (w, i, a) { return a.indexOf(w) === i; });
    var t = topicFor(q), hits = search(q, book), h = '';
    if (t) h += answerCard(t);
    else {
      var shown = AMEND.filter(function (a) {
        var txt = ' ' + norm(a.t + ' ' + a.x + ' ' + a.memo) + ' ', n = 0;
        lastTerms.forEach(function (w) { if (txt.indexOf(' ' + w) >= 0) n++; });
        return lastTerms.length && n / lastTerms.length >= 0.6;
      });
      if (shown.length) h += '<div class="sr-count">Later orders that match</div>' + shown.map(function (a) { return amendCard(a, true); }).join('');
    }
    if (hits.length) {
      h += '<div class="sr-count">' + (t ? 'All matching rules' : hits.length + ' matching rule' + (hits.length > 1 ? 's' : '')) + (book ? ' in Part ' + book : '') + '</div>';
      h += hits.map(function (x) { return ruleCard(x.ri, chunks[x.ci].t, false); }).join('');
    } else if (!t) {
      h += '<div class="sr-empty">Nothing found for "' + esc(q) + '". Try other words, e.g. "earned leave", "joining time", "study leave".</div>';
    }
    res.innerHTML = h;
  }
  function openCite(c, btn) {
    var ri = findRule(c);
    if (ri < 0) return;
    var holder = btn.closest('.sr-ans');
    var ex = holder.querySelector('.sr-card[data-ri="' + ri + '"]');
    if (ex) { ex.remove(); return; }
    holder.insertAdjacentHTML('beforeend', ruleCard(ri, null, true));
    holder.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  var EX = ['Can I get study leave for M.Tech or PhD?', 'Child care leave', 'Casual leave', 'How much earned leave in a year?', 'Joining time on transfer', 'Maternity leave', 'Daily allowance for training', 'Subsistence allowance during suspension', 'Leave without pay'];
  function init() {
    var sec = $('sr');
    if (!sec || !RULES.length) return;
    $('srEx').innerHTML = EX.map(function (q) { return '<button type="button" class="example-chip" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('');
    $('srCount').textContent = RULES.length + ' rules & paragraphs · ' + AMEND.length + ' later orders applied';
    sec.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.q) { $('srQ').value = b.dataset.q; run(); }
      else if (b.classList.contains('sr-more')) {
        var card = b.closest('.sr-card'), full = card.querySelector('.sr-full'), sn = card.querySelector('.sr-snip');
        full.hidden = !full.hidden; sn.hidden = !full.hidden; b.textContent = full.hidden ? 'Read full rule' : 'Show less';
      } else if (b.dataset.cite) openCite(b.dataset.cite, b);
      else if (b.classList.contains('sr-amd-t')) {
        var x = b.closest('.sr-amd').querySelector('.sr-amd-x'); x.hidden = !x.hidden; b.textContent = x.hidden ? 'What changed' : 'Hide';
      } else if (b.dataset.amdc) {
        var card = b.closest('.sr-ans').querySelector('.sr-amd[data-amd="' + b.dataset.amdc + '"]');
        if (card) { var xx = card.querySelector('.sr-amd-x'); xx.hidden = false; card.querySelector('.sr-amd-t').textContent = 'Hide'; card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      } else if (b.id === 'srOrders') {
        $('srQ').value = ''; $('srIntro').hidden = true; lastTerms = [];
        $('srRes').innerHTML = '<div class="sr-count">Later Finance Department orders applied (up to ' + esc(window.WBSR_AMEND_ASOF || '') + ')</div>' + AMEND.map(function (a) { return amendCard(a, true); }).join('');
      }
      else if (b.dataset.book != null) {
        book = b.dataset.book;
        sec.querySelectorAll('[data-book]').forEach(function (x) { x.classList.toggle('active', x === b); });
        run();
      } else if (b.id === 'srClr') { $('srQ').value = ''; run(); $('srQ').focus(); }
    });
    $('srQ').addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 250); $('srClr').hidden = !$('srQ').value; });
    $('srForm').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); run(); $('srQ').blur(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.ServiceRules = { search: search, topicFor: topicFor, run: run };
})();
