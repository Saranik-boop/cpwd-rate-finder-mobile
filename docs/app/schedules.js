// Schedule register: which schedule is the official source for which type of work
// (I&WD Memo No. 07(W)/2026-27 dt 23.07.2026, adopting PWD Notification No. 1M-24/26/134-R/PL dt 07.07.2026),
// plus edition and the last addendum / correction slip applied in this app.
window.ORDER_REF = 'I&WD Memo No. 07(W)/2026-27 dt 23.07.2026 (adopting PWD Notification No. 1M-24/26/134-R/PL dt 07.07.2026)';
window.WORK_TYPES = [
  { id: 'building', label: 'Building works' },
  { id: 'road', label: 'Road & Bridge' },
  { id: 'irrigation', label: 'Irrigation' }
];
window.SCHEDULES = {
  'CPWD': {
    name: 'CPWD Delhi Schedule of Rates (DSR) 2023, Vol 1 & 2, with Delhi Analysis of Rates (DAR) 2023, Vol 1 & 2',
    short: 'CPWD DSR', work: 'building', applicable: true,
    tag: 'Building works — CPWD DSR',
    role: 'Official schedule for building works (civil, finishing, doors, windows, flooring, sanitary, plumbing). DAR 2023 gives the rate analysis behind each DSR item.',
    edition: 'DSR 2023 / DAR 2023',
    upto: 'Correction Slip No. 11 dt 04.08.2026 (slips 1–4 and 6–11 contain item changes)'
  },
  'PWD-NH': {
    name: 'WB PWD (Roads) Directorate, National Highway Wing — Schedule of Rates 2019-20, Road & Bridge Works',
    short: 'PWD(NH) SoR', work: 'road', applicable: true,
    tag: 'Road & Bridge — PWD(NH) SoR',
    role: 'Official schedule for all road and bridge works.',
    edition: '2019-20, w.e.f. 01.06.2019',
    upto: 'Base edition. Read from a text copy of the book: every item is marked "Verify with book"; Tables I–VI and Annexures I, I-A, I-B, II are not yet in the app.',
    caution: true
  },
  'I&WD': {
    name: 'WB Irrigation & Waterways Directorate — Unified Schedule of Rates (USoR) 2018',
    short: 'I&WD USoR', work: 'irrigation', applicable: true,
    tag: 'Irrigation — I&WD USoR 2018',
    role: 'Official schedule for irrigation-specific items not covered above (canal earthwork, embankments, river training etc.).',
    edition: 'USoR 2018',
    upto: '6th Addenda & Corrigenda, w.e.f. 03.05.2021 (Memo No. 4S-1/364(10))'
  },
  'SUPP': {
    name: 'State PWD (West Bengal) supplementary SoR booklet — minor / maintenance items not in DSR',
    short: 'State PWD booklet', work: 'building', applicable: true, missing: true,
    tag: 'Minor/Maintenance — State PWD booklet',
    role: 'Official source for minor / maintenance items not available in DSR.',
    edition: '—',
    upto: 'Not yet in the app (booklet not provided).'
  },
  'PWD-BLD': {
    name: 'WB PWD Schedule of Rates Vol I — Building Works',
    short: 'WB PWD Bldg', work: 'building', applicable: false,
    tag: 'Reference only — superseded for estimates from 23.07.2026',
    role: 'Kept for reference. Building works are now estimated from CPWD DSR (and the State PWD booklet for minor items).',
    edition: 'w.e.f. 01.11.2017',
    upto: 'Base volume (no later addenda supplied)'
  },
  'PWD-SAN': {
    name: 'WB PWD Schedule of Rates Vol II — Sanitary & Plumbing Works',
    short: 'WB PWD San.', work: 'building', applicable: false,
    tag: 'Reference only — superseded for estimates from 23.07.2026',
    role: 'Kept for reference. Sanitary & plumbing works are now estimated from CPWD DSR.',
    edition: 'w.e.f. 01.11.2017',
    upto: 'Base volume (no later addenda supplied)'
  },
  'PWD-RB': {
    name: 'WB PWD Schedule of Rates Vol III — Road & Bridge Works',
    short: 'WB PWD R&B', work: 'road', applicable: false,
    tag: 'Reference only — superseded for estimates from 23.07.2026',
    role: 'Kept for reference. Road & bridge works are now estimated from the PWD(NH) SoR.',
    edition: '2018',
    upto: '9th Addenda & Corrigenda dt 14.10.2020'
  }
};
