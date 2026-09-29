// Doubt Solver engine (ported unchanged in logic from the desktop CPWD Doubt Solver 1.1.0: search.js + qa.js).
// Works on the same decrypted item list as the Rate Finder, so both tabs always show the same rates.
(function () {
'use strict';

function createSearchEngine(items, meta) {
  items = items || [];
  meta = meta || { categories: [], units: [], count: 0 };

  const descFuse = new Fuse(items, {
    keys: [
      { name: 'description', weight: 0.75 },
      { name: 'item_no', weight: 0.15 },
      { name: 'category', weight: 0.10 },
    ],
    threshold: 0.32,
    distance: 200,
    ignoreLocation: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    includeScore: true,
  });

  const itemNoFuse = new Fuse(items, {
    keys: ['item_no'],
    threshold: 0.45,
    ignoreLocation: true,
    includeScore: true,
  });

  function naturalCompare(a, b) {
    const ax = String(a).split(/(\d+)/).map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : p));
    const bx = String(b).split(/(\d+)/).map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : p));
    const len = Math.max(ax.length, bx.length);
    for (let i = 0; i < len; i++) {
      const av = ax[i];
      const bv = bx[i];
      if (av === undefined) return -1;
      if (bv === undefined) return 1;
      if (av === bv) continue;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    }
    return 0;
  }

  function scoreItemNo(query, itemNo) {
    const q = query.trim().toLowerCase();
    const v = itemNo.toLowerCase();
    if (!q) return null;
    if (v === q) return 1.0;
    if (v.startsWith(q + '.')) return 0.92;
    if (v.startsWith(q)) return 0.85;
    if (v.includes(q)) return 0.6;
    return null;
  }

  function buildExtendedPattern(query) {
    // Space-separated terms in Fuse's extended search are AND-ed together,
    // and each bare term (no prefix) is still fuzzy-matched - this keeps
    // typo tolerance per word while requiring every word to match somewhere.
    return query.trim().split(/\s+/).filter(Boolean).join(' ');
  }

  function search({ itemNo = '', keywords = '', category = '', unit = '', schedule = '', sort = 'relevance', limit = 200 } = {}) {
    itemNo = (itemNo || '').trim();
    keywords = (keywords || '').trim();
    category = (category || '').trim();
    unit = (unit || '').trim();
    schedule = (schedule || '').trim();

    let pool = items;
    if (schedule) {
      pool = pool.filter((it) => it.schedule === schedule);
    }
    if (category) {
      pool = pool.filter((it) => it.category === category);
    }
    if (unit) {
      pool = pool.filter((it) => it.unit === unit);
    }

    const hasItemNo = itemNo.length > 0;
    const hasKeywords = keywords.length > 0;

    const scoreMap = new Map();

    if (hasItemNo) {
      for (const it of pool) {
        const s = scoreItemNo(itemNo, it.item_no);
        if (s !== null) scoreMap.set(it.id, { item: it, itemNoScore: s, kwScore: null });
      }
      if (scoreMap.size < 25) {
        const fuzzyResults = itemNoFuse.search(itemNo, { limit: 50 });
        for (const r of fuzzyResults) {
          if (category && r.item.category !== category) continue;
          if (schedule && r.item.schedule !== schedule) continue;
          if (unit && r.item.unit !== unit) continue;
          const existing = scoreMap.get(r.item.id);
          const fuzzyScore = Math.max(0, 1 - r.score) * 0.7;
          if (!existing || existing.itemNoScore < fuzzyScore) {
            scoreMap.set(r.item.id, { item: r.item, itemNoScore: fuzzyScore, kwScore: null });
          }
        }
      }
    }

    if (hasKeywords) {
      const pattern = buildExtendedPattern(keywords);
      const kwResults = descFuse.search(pattern, { limit: 400 });
      if (hasItemNo) {
        for (const r of kwResults) {
          const existing = scoreMap.get(r.item.id);
          if (existing) existing.kwScore = Math.max(0, 1 - r.score);
        }
        for (const [id, v] of scoreMap) {
          if (v.kwScore === null) v.kwScore = 0;
        }
      } else {
        for (const r of kwResults) {
          if (category && r.item.category !== category) continue;
          if (schedule && r.item.schedule !== schedule) continue;
          if (unit && r.item.unit !== unit) continue;
          scoreMap.set(r.item.id, { item: r.item, itemNoScore: null, kwScore: Math.max(0, 1 - r.score) });
        }
      }
    }

    let results;
    let totalMatched;

    const applyBrowseSort = (arr) => {
      if (sort === 'rate_asc') return arr.sort((a, b) => a.rate - b.rate);
      if (sort === 'rate_desc') return arr.sort((a, b) => b.rate - a.rate);
      return arr.sort((a, b) => naturalCompare(a.item_no, b.item_no));
    };

    if (!hasItemNo && !hasKeywords) {
      results = applyBrowseSort(pool.slice());
      totalMatched = results.length;
      results = results.slice(0, limit);
      return { results, totalMatched, mode: (category || unit || schedule) ? 'category' : 'browse' };
    }

    const combined = Array.from(scoreMap.values()).map((v) => {
      let score;
      if (hasItemNo && hasKeywords) {
        score = (v.itemNoScore || 0) * 0.45 + (v.kwScore || 0) * 0.55;
      } else if (hasItemNo) {
        score = v.itemNoScore || 0;
      } else {
        score = v.kwScore || 0;
      }
      return { item: v.item, score };
    });

    if (sort === 'rate_asc') {
      combined.sort((a, b) => a.item.rate - b.item.rate);
    } else if (sort === 'rate_desc') {
      combined.sort((a, b) => b.item.rate - a.item.rate);
    } else if (sort === 'item_no') {
      combined.sort((a, b) => naturalCompare(a.item.item_no, b.item.item_no));
    } else {
      combined.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return naturalCompare(a.item.item_no, b.item.item_no);
      });
    }

    totalMatched = combined.length;
    results = combined.slice(0, limit).map((c) => ({ ...c.item, _score: c.score }));

    return { results, totalMatched, mode: 'search' };
  }

  return {
    items,
    meta,
    search,
    getById: (id) => items.find((it) => it.id === id) || null,
  };
}




// ---- item-code detection patterns (checked against the merged dataset, never assumed) ----
const CODE_PATTERNS = [
  /\bRB-[A-Za-z0-9.()-]+\b/gi,
  /\bCARR-[A-Za-z0-9-]+\b/gi,
  /\bBASIC-[A-Za-z0-9-]+\b/gi,
  /\b\d{1,3}[A-Za-z]?(?:\.[A-Za-z0-9]{1,6}){1,6}\b/g, // e.g. 9.40.1.1, 26.42.1A, 13.117
  /\b\d{4}\b/g, // 4-digit basic-rate codes, e.g. 0006 - only trusted if it truly matches an item
  // codes of the WB PWD volumes and PWD(NH), e.g. 12.10-I-A(i), I-2/7, T1/11, NH-12/19B(v), G-D-3(b)(iii), A-II-R-18(i), W.49
  /(?:^|[\s,;:(])((?:NH-|[A-Z]{1,3}-|[A-Z]\.|T\d\/|I{1,3}-\d\/)?[A-Za-z0-9]{1,4}(?:[-./][A-Za-z0-9]{1,6})*(?:\([A-Za-z0-9]{1,6}\))*(?:-[A-Z]{1,3}(?:\([a-z0-9]{1,6}\))*)*)(?=$|[\s,;:?.!)])/g,
];

const SCHEDULE_HINTS = [
  { schedule: 'CPWD', re: /\bcpwd\b|\bdsr\b|\bdar\b|\bdelhi\b/i },
  { schedule: 'I&WD', re: /\bi\s*&\s*wd\b|\birrigation\b|\bwaterways\b|\busor\b/i },
  { schedule: 'PWD-NH', re: /\bpwd\s*\(?nh\)?|\bnational highways?\b|\bnh\s+sor\b/i },
  { schedule: 'PWD-SAN', re: /\bpwd\b.*\b(sanitary|plumbing)\b/i },
  { schedule: 'PWD-BLD', re: /\bpwd\b.*\bbuilding\b/i },
  { schedule: 'PWD-RB', re: /\bpwd\b.*\b(road|bridge)s?\b|\broads?\s*(and|&)\s*bridges?\b/i },
];

// Generic question scaffolding to strip before running a keyword search - improves
// match quality by not feeding filler words into the fuzzy search.
const FILLER_PATTERNS = [
  /\bwhat('?s| is| are)\b/gi,
  /\bhow much( is| does| would| will)?\b/gi,
  /\bhow do i\b/gi,
  /\bcan you( please)?\b/gi,
  /\bcould you( please)?\b/gi,
  /\bplease\b/gi,
  /\btell me( about)?\b/gi,
  /\bi want to know\b/gi,
  /\bi need\b/gi,
  /\bdo you know\b/gi,
  /\bis there\b/gi,
  /\bdoes (the|this) (schedule|dsr|dar|document|tool) cover\b/gi,
  /\brate (of|for)\b/gi,
  /\bprice (of|for)\b/gi,
  /\bcost (of|for)\b/gi,
  /\bthe rate\b/gi,
  /\bitem (no\.?|number)?\b/gi,
  /\bcode\b/gi,
  /\?/g,
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

// Fuse's extended-search ANDs every remaining token together, so a leftover connector word
// (which won't fuzzy-match anything well) can drag an otherwise-strong match down badly.
// Strip these out as whole tokens after the filler-phrase pass above.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'for', 'in', 'on', 'at', 'to', 'is', 'are', 'was', 'were', 'be', 'been',
  'do', 'does', 'did', 'and', 'or', 'with', 'this', 'that', 'my', 'me', 'i', 'you', 'your', 'it',
  'its', 'as', 'per', 'about', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'so', 'if',
]);

function cleanQuestion(q) {
  let s = q;
  for (const re of FILLER_PATTERNS) s = s.replace(re, ' ');
  const tokens = s.split(/\s+/).filter(Boolean).filter((t) => !STOPWORDS.has(t.toLowerCase()));
  return tokens.join(' ').trim();
}

function detectScheduleHint(q) {
  for (const h of SCHEDULE_HINTS) {
    if (h.re.test(q)) return h.schedule;
  }
  return '';
}

function extractCodeCandidates(q) {
  const found = new Set();
  for (const re of CODE_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(q)) !== null) {
      const v = (m[1] || m[0]).trim().replace(/[.,;:]+$/, '');
      // the wide WB PWD / NH pattern only counts when the token looks like a code (has - / ( or is like W.49)
      if (v && /\d/.test(v) && (m[1] === undefined || /[-\/(]/.test(v) || /^[A-Z]\.\d/.test(v))) found.add(v);
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  // longer/more specific candidates first
  return Array.from(found).sort((a, b) => b.length - a.length);
}

function createQaEngine(items, metaIn, notesIn) {
  const searchEngine = createSearchEngine(items, metaIn);

  let notes = Array.isArray(notesIn) ? notesIn : [];

  // The glossary/general-notes set is small (a couple dozen curated entries) and each entry is
  // short, so Fuse's AND-every-term extended search (great for long item descriptions in
  // search.js) is too brittle here: one question word with no match anywhere in a short note
  // tanks the whole score even when every other word matched perfectly. A plain token-overlap
  // scorer against each note's keywords/question/answer is far more forgiving and predictable
  // for this size of knowledge base.
  function tokenize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9&% ]+/g, ' ').split(/\s+/).filter(Boolean);
  }

  // Primary tokens (keywords + question) count as a strong, full-weight signal; the answer
  // text alone counts for less, since answers naturally mention concepts covered more directly
  // by *other* notes (e.g. the GST note's answer mentions "water charges" in passing) - without
  // this split, an incidental mention in one note's answer can out-tie the note that's actually
  // about that concept.
  const notePrimaryTokens = notes.map((note) => new Set(tokenize([...(note.keywords || []), note.question].join(' '))));
  const noteAnswerTokens = notes.map((note) => new Set(tokenize(note.answer)));

  function scoreNote(note, primaryTokens, answerTokens, questionTokens, cleanedQuestionLower) {
    let weightedHits = 0;
    let significant = 0;
    const hasToken = (set, t) => set.has(t) || (t.endsWith('s') && set.has(t.slice(0, -1))) || (!t.endsWith('s') && set.has(t + 's'));
    for (const t of questionTokens) {
      if (t.length < 3) continue;
      significant++;
      if (hasToken(primaryTokens, t)) { weightedHits += 1; continue; }
      if (hasToken(answerTokens, t)) { weightedHits += 0.4; continue; }
    }
    if (significant === 0) return 0;
    let phraseBonus = 0;
    for (const kw of (note.keywords || [])) {
      if (kw.includes(' ') && cleanedQuestionLower.includes(kw.toLowerCase())) phraseBonus += 1;
    }
    return Math.min(1, weightedHits / significant + phraseBonus * 0.15);
  }

  const meta = searchEngine.meta;

  function statAnswer(q) {
    if (/\bhow many (items|entries|rates)\b/i.test(q) || /\btotal (items|entries)\b/i.test(q)) {
      const counts = meta.schedule_counts || {};
      const lines = Object.entries(counts).map(([s, c]) => `${s}: ${c.toLocaleString('en-IN')}`).join(', ');
      return {
        type: 'stat',
        text: `This tool currently covers ${meta.count.toLocaleString('en-IN')} items in total, across ${(meta.schedules || []).length} schedules (${lines}).`,
        sources: ['Live count of the items in this app (CPWD, I&WD and WB PWD schedules).'],
      };
    }
    return null;
  }

  function itemToAnswerBlock(item) {
    const block = {
      item_no: item.item_no,
      description: item.description,
      unit: item.unit,
      rate: item.rate,
      category: item.category,
      schedule: item.schedule,
      schedule_label: item.schedule_label,
      zones: item.zones || null,
      rate_notes: item.rate_notes || null,
      correction: item.correction || null,
      breakdown: item.breakdown || null,
      breakdown_warnings: item.breakdown_warnings || null,
      rate_text: item.rate_text || null,
      rate_basis: item.rate_basis || null,
      amendments: item.amendments || null,
      deleted: item.deleted || null,
      verify: item.verify || false,
      notes: item.notes || null,
    };
    return block;
  }

  function findBestItemMatch(rawQuestion, cleanedQuestion, scheduleHint) {
    const candidates = extractCodeCandidates(rawQuestion);
    for (const cand of candidates) {
      const res = searchEngine.search({ itemNo: cand, schedule: scheduleHint, limit: 5 });
      if (res.results.length > 0) {
        const top = res.results[0];
        const exact = top.item_no.toLowerCase() === cand.toLowerCase();
        const strongScore = top._score === undefined || top._score >= 0.75;
        if (exact || strongScore) {
          return { item: top, confidence: exact ? 1 : top._score, via: 'code' };
        }
      }
    }
    // fall back to a free-text keyword search over descriptions/categories
    if (cleanedQuestion.length >= 3) {
      const res = searchEngine.search({ keywords: cleanedQuestion, schedule: scheduleHint, limit: 5 });
      if (res.results.length > 0) {
        const top = res.results[0];
        return { item: top, confidence: top._score || 0, via: 'keywords' };
      }
    }
    return null;
  }

  function findBestNoteMatch(cleanedQuestion) {
    if (!cleanedQuestion || cleanedQuestion.length < 2) return null;
    const tokens = tokenize(cleanedQuestion);
    if (tokens.length === 0) return null;
    const qLower = cleanedQuestion.toLowerCase();
    let best = null;
    for (let i = 0; i < notes.length; i++) {
      const score = scoreNote(notes[i], notePrimaryTokens[i], noteAnswerTokens[i], tokens, qLower);
      if (!best || score > best.confidence) best = { note: notes[i], confidence: score };
    }
    return best && best.confidence > 0 ? best : null;
  }

  function ask(rawQuestionInput) {
    const rawQuestion = String(rawQuestionInput || '').trim();
    if (!rawQuestion) {
      return { type: 'empty' };
    }

    const stat = statAnswer(rawQuestion);
    if (stat) return stat;

    const scheduleHint = detectScheduleHint(rawQuestion);
    const cleaned = cleanQuestion(rawQuestion);

    const itemMatch = findBestItemMatch(rawQuestion, cleaned, scheduleHint);
    const noteMatch = findBestNoteMatch(cleaned);

    const ITEM_CODE_CONFIDENT = itemMatch && itemMatch.via === 'code' && itemMatch.confidence >= 0.75;
    const ITEM_KW_CONFIDENT = itemMatch && itemMatch.via === 'keywords' && itemMatch.confidence >= 0.42;
    const NOTE_CONFIDENT = noteMatch && noteMatch.confidence >= 0.42;

    // Prefer an explicit item-code hit outright - it's the most specific possible signal.
    if (ITEM_CODE_CONFIDENT) {
      return { type: 'item', item: itemToAnswerBlock(itemMatch.item), confidence: itemMatch.confidence };
    }

    // Otherwise pick whichever of (glossary note) vs (keyword item match) scored more confidently.
    if (NOTE_CONFIDENT && (!ITEM_KW_CONFIDENT || noteMatch.confidence >= itemMatch.confidence)) {
      return { type: 'note', note: noteMatch.note, confidence: noteMatch.confidence };
    }
    if (ITEM_KW_CONFIDENT) {
      return { type: 'item', item: itemToAnswerBlock(itemMatch.item), confidence: itemMatch.confidence };
    }

    // Nothing confident - offer the closest weak match, if any, as "did you mean".
    const weakItem = itemMatch && itemMatch.confidence >= 0.2 ? itemMatch : null;
    const weakNote = noteMatch && noteMatch.confidence >= 0.2 ? noteMatch : null;
    if (weakItem || weakNote) {
      if (weakItem && (!weakNote || weakItem.confidence >= weakNote.confidence)) {
        return { type: 'closest_item', item: itemToAnswerBlock(weakItem.item), confidence: weakItem.confidence };
      }
      return { type: 'closest_note', note: weakNote.note, confidence: weakNote.confidence };
    }

    return { type: 'none' };
  }

  return { meta, ask };
}



window.createDoubtEngine = createQaEngine;
})();
