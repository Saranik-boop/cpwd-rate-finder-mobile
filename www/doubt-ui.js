// Doubt Solver tab - UI of the desktop CPWD Doubt Solver 1.1.0 (renderer/app.js), unchanged in behaviour.
(() => {
  let engine = null, started = false, pendingItems = null, pendingMeta = null, pendingExpl = null;
  const conversation = document.getElementById('dsConversation');
  const welcome = document.getElementById('dsWelcome');
  const askForm = document.getElementById('dsAskForm');
  const questionInput = document.getElementById('dsQuestion');
  const askBtn = document.getElementById('dsAskBtn');
  const totalCount = document.getElementById('dsTotalCount');
  const exampleChips = document.getElementById('dsExampleChips');
  const newChatBtn = document.getElementById('dsNewChatBtn');
  const composerHint = document.getElementById('dsComposerHint');

  const HINT_FIRST = 'Press Enter to ask · Shift+Enter for a new line';
  const HINT_FOLLOWUP = 'Press Enter to keep asking in this conversation · or use New chat above for a different topic';

  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

  const SCHEDULE_SHORT = { 'CPWD': 'CPWD', 'I&WD': 'I&WD', 'PWD-RB': 'PWD R&B', 'PWD-BLD': 'PWD Bldg', 'PWD-SAN': 'PWD San.', 'PWD-NH': 'PWD NH' };
  function scheduleSlug(s) { return String(s || '').replace(/[^A-Za-z0-9-]/g, ''); }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  const EXAMPLES = [
    'Is hinge included in flush door shutter?',
    'Difference between flush door and panelled door',
    'How is brick work measured?',
    'Rate of 12 mm cement plaster 1:6',
    'Where is anti-termite treatment used?',
    'What is CPOH?',
  ];

  function init() {
    const meta = engine.meta;
    totalCount.textContent = `${meta.count.toLocaleString('en-IN')} items indexed`;
    exampleChips.innerHTML = '<span class="example-chips-label">Try asking:</span>' + EXAMPLES.map((q) =>
      `<span class="example-chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</span>`
    ).join('');
    exampleChips.querySelectorAll('.example-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        questionInput.value = chip.dataset.q;
        submitQuestion();
      });
    });
  }

  function addUserBubble(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user';
    row.innerHTML = `<div class="msg-bubble-user">${escapeHtml(text)}</div>`;
    conversation.appendChild(row);
  }

  function addTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'msg-row assistant';
    row.id = 'dsTypingRow';
    row.innerHTML = `<div class="answer-card"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    conversation.appendChild(row);
    conversation.scrollTop = conversation.scrollHeight;
    return row;
  }

  function renderBreakdownPanel(item) {
    const bd = item.breakdown;
    if (!bd) return '';
    const warnings = Array.isArray(item.breakdown_warnings) ? item.breakdown_warnings : [];
    const rows = (bd.components || []).map((c) => `
      <tr>
        <td>${escapeHtml(c.code || '')}</td>
        <td>${escapeHtml(c.description || '')}</td>
        <td>${c.quantity != null ? c.quantity : '—'}</td>
        <td>${c.unit ? escapeHtml(c.unit) : '—'}</td>
        <td>${c.rate != null ? currency.format(c.rate) : '—'}</td>
        <td>${c.amount != null ? currency.format(c.amount) : '—'}</td>
      </tr>
    `).join('');
    const summaryRows = (bd.summary || []).map((s) => `
      <div class="bd-summary-row"><span>${escapeHtml(s.label)}</span><span>${s.amount != null ? currency.format(s.amount) : '—'}</span></div>
    `).join('');
    const warnHtml = warnings.length
      ? `<div class="flag-callout">Note: ${escapeHtml(warnings.join('; '))} — the component list below may be incomplete; the final rate itself is still the verified schedule rate.</div>`
      : '';
    return `
      <button type="button" class="breakdown-toggle">View rate analysis (materials, labour &amp; cost build-up)</button>
      <div class="breakdown-panel" hidden>
        ${warnHtml}
        <table class="bd-table">
          <thead><tr><th>Code</th><th>Component</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="bd-summary">${summaryRows}</div>
      </div>
    `;
  }

  function renderItemAnswer(item, opts) {
    opts = opts || {};
    const schedBadge = item.schedule
      ? `<span class="tag tag-schedule sched-${scheduleSlug(item.schedule)}">${escapeHtml(SCHEDULE_SHORT[item.schedule] || item.schedule)}</span>`
      : '';
    const catTag = item.category ? `<span class="tag tag-category">${escapeHtml(item.category)}</span>` : '';

    let correctionTag = '';
    let correctionCallout = '';
    if (item.correction) {
      const isNew = item.correction.type === 'new_item';
      correctionTag = `<span class="tag ${isNew ? 'tag-corr-new' : 'tag-corr-updated'}">${isNew ? '🆕 Added' : '✏️ Corrected'} · Slip ${escapeHtml(item.correction.slip)}</span>`;
      if (isNew) {
        correctionCallout = `<div class="correction-callout new">This item was introduced by <strong>CPWD Correction Slip ${escapeHtml(item.correction.slip)}</strong>${item.correction.date ? ` (${escapeHtml(item.correction.date)})` : ''} — it was not part of the original DSR/DAR 2023 publication.</div>`;
      } else {
        const rateLine = (item.correction.old_rate != null && item.correction.old_rate !== item.rate)
          ? `Rate revised from <span class="corr-old">${currency.format(item.correction.old_rate)}</span> to <strong>${currency.format(item.rate)}</strong>. `
          : `Rate unchanged. `;
        correctionCallout = `<div class="correction-callout updated">Corrected by <strong>Slip ${escapeHtml(item.correction.slip)}</strong>${item.correction.date ? ` (${escapeHtml(item.correction.date)})` : ''}. ${rateLine}</div>`;
      }
    }

    const flagHtml = (item.correction && item.correction.flagged)
      ? `<div class="flag-callout">⚠ This correction slip's own source table has an internal inconsistency. The figure shown is exactly what the official slip prints — worth cross-checking against the CPWD portal if this rate looks unexpected.</div>`
      : '';

    let zonesHtml = '';
    if (item.zones && typeof item.zones === 'object') {
      const rows = Object.entries(item.zones).map(([zone, val]) => `
        <div class="zone-item"><span class="zone-name">${escapeHtml(zone)}</span><span class="zone-value">${val == null ? '—' : currency.format(val)}</span></div>
      `).join('');
      zonesHtml = `<div class="answer-zones">${rows}</div>`;
    }

    const rateNotesHtml = item.rate_notes
      ? `<div class="answer-note-block"><strong>Rate detail:</strong> ${escapeHtml(item.rate_notes)}</div>`
      : '';

    const breakdownHtml = (item.breakdown && Array.isArray(item.breakdown.components) && item.breakdown.components.length > 0)
      ? renderBreakdownPanel(item)
      : '';

    const leadPrefix = opts.closest
      ? `I couldn't find an exact match, but the closest related item I found is:<br/>`
      : '';

    const rateBlock = (item.rate == null && item.rate_text)
      ? `<div class="answer-rate"><span class="rate-text">${escapeHtml(item.rate_text)}</span><span class="rate-unit">per ${escapeHtml(item.unit || '—')}</span></div>`
      : item.zones
      ? ''
      : `<div class="answer-rate"><span class="rate-value">${currency.format(item.rate)}</span><span class="rate-unit">per ${escapeHtml(item.unit || '—')}</span></div>`;
    const si = (window.SCHEDULES || {})[item.schedule] || {};
    const extraTags = (si.applicable === false ? `<span class="tag tag-ref">${escapeHtml(si.tag)}</span>` : (si.tag ? `<span class="tag tag-category">${escapeHtml(si.tag)}</span>` : ''))
      + (item.deleted ? `<span class="tag tag-del">⛔ ${escapeHtml(item.deleted)}</span>` : '')
      + (item.verify ? `<span class="tag tag-del">⚠ Verify with book</span>` : '')
      + (item.amendments && item.amendments.length ? `<span class="tag tag-corr-updated">✏️ Amended vide ${escapeHtml(item.amendments[item.amendments.length - 1].ref || '')}</span>` : '');

    return `
      <div class="answer-lead">${leadPrefix}<strong>${escapeHtml(item.item_no)}</strong> — ${escapeHtml(item.description)}</div>
      ${rateBlock}
      ${zonesHtml}
      ${rateNotesHtml}
      <div class="answer-tags">${schedBadge}${extraTags}${catTag}${correctionTag}${opts.closest ? '<span class="tag tag-not-found">Closest match</span>' : ''}</div>
      ${correctionCallout}
      ${flagHtml}
      ${breakdownHtml}
      <div class="answer-sources">Source: ${escapeHtml(item.schedule_label || item.schedule || 'schedule document')}${item.correction ? `, CPWD Correction Slip ${escapeHtml(item.correction.slip)}` : ''}</div>
    `;
  }

  function renderNoteAnswer(note, opts) {
    opts = opts || {};
    const leadPrefix = opts.closest
      ? `I couldn't find an exact match, but here's the closest related reference I found:<br/>`
      : '';
    return `
      <div class="answer-lead">${leadPrefix}${escapeHtml(note.answer)}</div>
      <div class="answer-tags"><span class="tag tag-note">General reference</span>${opts.closest ? '<span class="tag tag-not-found">Closest match</span>' : ''}</div>
      <div class="answer-sources">Source: ${escapeHtml(note.source)}</div>
    `;
  }

  function basisTags(list) {
    const seen = {};
    return (list || []).filter((b) => b && !seen[b] && (seen[b] = 1)).map((b) => `<span class="tag tag-basis">${escapeHtml(b)}</span>`).join('');
  }
  function renderSections(sections) {
    return (sections || []).map((sec) => `
      <div class="ans-sec"><div class="ans-h">${escapeHtml(sec.h)}${sec.b ? ` <span class="tag tag-basis">${escapeHtml(sec.b)}</span>` : ''}</div>
      ${sec.p ? `<p>${escapeHtml(sec.p)}</p>` : ''}
      ${sec.li ? `<ul>${sec.li.map((x) => `<li>${escapeHtml(x.t)}${x.b ? ` <span class="tag tag-basis">${escapeHtml(x.b)}</span>` : ''}</li>`).join('')}</ul>` : ''}</div>`).join('');
  }
  function itemChip(it) {
    const r = it.zones ? 'zone-wise' : (it.rate != null ? currency.format(it.rate) + ' / ' + (it.unit || '') : (it.rate_text || ''));
    const d = String(it.description || '');
    const short = d.length > 110 ? d.slice(0, 108).replace(/\s+\S*$/, '') + '…' : d;
    return `<button type="button" class="ans-alt" data-pick="${escapeHtml(it.id)}"><span class="ans-alt-no">${escapeHtml(SCHEDULE_SHORT[it.schedule] || it.schedule)} ${escapeHtml(it.item_no)}</span><span class="ans-alt-d">${escapeHtml(short)}</span><span class="ans-alt-r">${escapeHtml(r)}</span></button>`;
  }
  function followChips(list) {
    if (!list || !list.length) return '';
    return `<div class="ans-follow">${list.map((q) => `<button type="button" class="example-chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('')}</div>`;
  }
  function renderComposed(r) {
    let h = `<div class="answer-lead ans-direct">${escapeHtml(r.lead || '')}</div>`;
    if (r.points && r.points.length) h += `<ul class="ans-points">${r.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
    if (r.basis && r.basis.length) h += `<div class="answer-tags">${basisTags(r.basis)}</div>`;
    if (r.item) {
      h += `<details class="ans-item"${r.openAnalysis ? ' open' : ''}><summary>${escapeHtml(SCHEDULE_SHORT[r.item.schedule] || r.item.schedule)} ${escapeHtml(r.item.item_no)} — full item${r.rateLine ? ' · ' + escapeHtml(r.rateLine) : ''}</summary>${renderItemAnswer(r.item)}</details>`;
    }
    h += renderSections(r.sections);
    if (r.alts && r.alts.length) h += `<div class="ans-h">Related items</div><div class="ans-alts">${r.alts.map(itemChip).join('')}</div>`;
    h += followChips(r.follow);
    if (r.item) h += `<div class="answer-sources">Answer built from the schedule item and its explanation in this app. The schedule's own description, notes and specification prevail.</div>`;
    return h;
  }
  function renderCompare(r) {
    let h = `<div class="answer-lead ans-direct">${escapeHtml(r.lead)}</div><ul class="ans-points">${r.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
    if (r.uses && r.uses.length) h += `<div class="ans-sec"><div class="ans-h">Where each is used</div><ul>${r.uses.map((u) => `<li><b>${escapeHtml(u[0])}</b> — ${escapeHtml(u[1])}</li>`).join('')}</ul></div>`;
    h += `<div class="ans-alts">${itemChip(r.a)}${itemChip(r.b)}</div>`;
    return h + followChips(r.follow);
  }
  function renderList(r) {
    return `<div class="answer-lead ans-direct">${escapeHtml(r.lead)}</div><div class="ans-alts">${r.list.map(itemChip).join('')}</div>`;
  }

  function renderAnswer(result) {
    if (result.type === 'composed') return renderComposed(result);
    if (result.type === 'compare') return renderCompare(result);
    if (result.type === 'list') return renderList(result);
    if (result.type === 'item') return renderItemAnswer(result.item);
    if (result.type === 'closest_item') return renderItemAnswer(result.item, { closest: true });
    if (result.type === 'note') return renderNoteAnswer(result.note);
    if (result.type === 'closest_note') return renderNoteAnswer(result.note, { closest: true });
    if (result.type === 'stat') {
      const sources = (result.sources || []).map((s) => escapeHtml(s)).join('; ');
      return `<div class="answer-lead">${escapeHtml(result.text)}</div>${sources ? `<div class="answer-sources">Source: ${sources}</div>` : ''}`;
    }
    // 'none'
    return `
      <div class="answer-lead">This doesn't appear to be covered by the schedules in this app (CPWD, I&amp;WD, WB PWD). Try rephrasing, giving a specific item number, or asking about a different item.</div>
      <div class="answer-tags"><span class="tag tag-not-found">Not covered</span></div>
    `;
  }

  function addAnswerBubble(result) {
    const row = document.createElement('div');
    row.className = 'msg-row assistant';
    const card = document.createElement('div');
    card.className = 'answer-card';
    card.innerHTML = renderAnswer(result);
    row.appendChild(card);
    conversation.appendChild(row);

    card.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { questionInput.value = b.dataset.q; submitQuestion(); }));
    card.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      const it = b.querySelector('.ans-alt-no');
      addUserBubble(it ? it.textContent : 'This item');
      const id = isNaN(Number(b.dataset.pick)) ? b.dataset.pick : Number(b.dataset.pick);
      addAnswerBubble(engine.pick ? engine.pick(id) : { type: 'none' });
    }));
    const toggle = card.querySelector('.breakdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const panel = card.querySelector('.breakdown-panel');
        if (!panel) return;
        panel.hidden = !panel.hidden;
        toggle.textContent = panel.hidden
          ? 'View rate analysis (materials, labour & cost build-up)'
          : 'Hide rate analysis';
      });
    }
    conversation.scrollTop = conversation.scrollHeight;
  }

  function submitQuestion() {
    const q = questionInput.value.trim();
    if (!q) return;
    if (welcome && !welcome.hidden) welcome.hidden = true;
    addUserBubble(q);
    questionInput.value = '';
    questionInput.style.height = 'auto';
    askBtn.disabled = true;
    conversation.scrollTop = conversation.scrollHeight;

    addTypingIndicator();
    // Small delay so the typing indicator is perceptible even though the lookup is instant -
    // makes the interaction feel considered rather than jarring/instantaneous.
    setTimeout(() => {
      let result;
      try {
        result = engine.ask(q);
      } catch (e) {
        result = { type: 'none' };
      }
      const typingRow = document.getElementById('dsTypingRow');
      if (typingRow) typingRow.remove();
      addAnswerBubble(result);
      askBtn.disabled = false;
      if (composerHint) composerHint.textContent = HINT_FOLLOWUP;
      questionInput.focus();
      conversation.scrollTop = conversation.scrollHeight;
    }, 320);
  }

  // "New chat" clears the visible conversation and returns to the welcome screen, without
  // touching the underlying data - each question is answered independently regardless, so this
  // is purely about giving the person an explicit, obvious way to start a fresh topic, the same
  // way Claude's own "New chat" works, rather than leaving old back-and-forth on screen.
  function startNewChat() {
    conversation.querySelectorAll('.msg-row').forEach((row) => row.remove());
    if (welcome) welcome.hidden = false;
    if (composerHint) composerHint.textContent = HINT_FIRST;
    if (engine && engine.reset) engine.reset();
    questionInput.value = '';
    questionInput.style.height = 'auto';
    conversation.scrollTop = 0;
    questionInput.focus();
  }

  if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);

  askForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitQuestion();
  });

  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  });

  questionInput.addEventListener('input', () => {
    questionInput.style.height = 'auto';
    questionInput.style.height = Math.min(questionInput.scrollHeight, 140) + 'px';
  });

  function ensureStarted() {
    if (started || !pendingItems) return;
    engine = window.createDoubtBrain ? window.createDoubtBrain(pendingItems, pendingMeta, window.DOUBT_NOTES || [], pendingExpl || [])
      : window.createDoubtEngine(pendingItems, pendingMeta, window.DOUBT_NOTES || []);
    started = true;
    init();
  }
  window.DoubtUI = {
    setData(items, meta, expl) { pendingItems = items; pendingMeta = meta; pendingExpl = expl; },
    open(prefill) {
      ensureStarted();
      if (prefill) {
        questionInput.value = prefill;
        questionInput.dispatchEvent(new Event('input'));
      }
      setTimeout(() => { questionInput.focus(); if (prefill) questionInput.setSelectionRange(questionInput.value.length, questionInput.value.length); }, 50);
    },
  };
})();
