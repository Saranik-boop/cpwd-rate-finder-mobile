// General reference notes used by the Doubt Solver (no rates here - rates always come from the schedule data).
window.DOUBT_NOTES = [
 {
  "id": "kn-schedules-overview",
  "keywords": [
   "schedule",
   "schedules",
   "which schedules",
   "what codes",
   "what documents",
   "cover",
   "coverage",
   "data source",
   "sources"
  ],
  "question": "Which schedules/codes does this tool cover?",
  "answer": "Six rate schedules are covered: (1) CPWD Delhi Schedule of Rates (DSR) 2023 with the Delhi Analysis of Rates (DAR) 2023 and Correction Slips 1-11; (2) WB I&WD Unified Schedule of Rates (USoR) 2018 with Addenda 1-6, zone-wise rates (Zone I-IV); (3) WB PWD(NH) Schedule of Rates 2019-20 for road & bridge works (read from a text copy, so each item says 'Verify with book'); (4) WB PWD SoR Vol III Road & Bridge Works 2018 with Addenda 1-9; (5) WB PWD SoR Vol I Building Works and (6) Vol II Sanitary & Plumbing Works (w.e.f. 01.11.2017, base volumes). Under I&WD Memo No. 07(W)/2026-27 dt 23.07.2026, CPWD DSR is for building works, PWD(NH) SoR for road & bridge works and I&WD USoR 2018 for irrigation items; the three WB PWD volumes are kept for reference only. All figures come from these documents - nothing is taken from the internet.",
  "source": "Document set in this app (see the Schedules screen in Rate Finder for edition and last addendum applied)"
 },
 {
  "id": "kn-correction-slips",
  "keywords": [
   "correction slip",
   "correction slips",
   "how many correction slips",
   "slip 5",
   "amendments",
   "revisions to dsr"
  ],
  "question": "How many CPWD correction slips have been applied, and does Slip 5 exist?",
  "answer": "10 correction slips have been applied: Slip 1, 2, 3, 4, 6, 7, 8, 9, 10 and 11. Slip 5 does not exist in the official correction slip series for CPWD DSR/DAR 2023 — this was confirmed directly, not assumed. Each applied slip either revises an existing item's rate/description or introduces a brand-new item into the DSR/DAR; where an item was affected, its entry is flagged with the slip number and date, and shows the pre-correction value alongside the corrected one.",
  "source": "CPWD Correction Slips 1-11 (Slip 5 absent), Office Memoranda, CSQ-Civil CPWD, 2023-2026"
 },
 {
  "id": "kn-gst-factor",
  "keywords": [
   "gst",
   "gst factor",
   "gst multiplying factor",
   "0.2127",
   "tax",
   "goods and services tax"
  ],
  "question": "What GST factor is used in the CPWD rate analysis?",
  "answer": "In the CPWD Analysis of Rates (DAR) 2023 cost build-up, GST is added using a multiplying factor of 0.2127 applied to the material+labour subtotal (after water charges). This is the factor used consistently across CPWD's own rate analyses (verified across 2,950 of the analysed items in this dataset) — it is not a figure looked up externally.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, cost build-up tables (Sub Head-level 'Add GST' step, observed across analysed items)"
 },
 {
  "id": "kn-cpoh",
  "keywords": [
   "cpoh",
   "contractor profit",
   "contractor overhead",
   "15%",
   "profit and overhead"
  ],
  "question": "What is CPOH and what percentage is used?",
  "answer": "CPOH stands for Contractor's Profit & Overhead. In the CPWD DAR 2023 cost build-up, it is added at 15% of the running subtotal (material + labour + water charges + GST), consistently across the analysed items in this dataset.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, cost build-up tables ('Add 15% CPOH' step)"
 },
 {
  "id": "kn-cess",
  "keywords": [
   "cess",
   "labour cess",
   "1% cess",
   "what is cess"
  ],
  "question": "What is the Cess charge in the CPWD rate analysis?",
  "answer": "A labour Cess of 1% is added near the end of the CPWD DAR 2023 cost build-up (after CPOH), consistently across the analysed items in this dataset, before the final per-unit rate is derived.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, cost build-up tables ('Add Cess @ 1%' step)"
 },
 {
  "id": "kn-water-charges",
  "keywords": [
   "water charges",
   "1% water",
   "water charge"
  ],
  "question": "What are 'Water charges' in the CPWD rate analysis?",
  "answer": "Water charges are added at 1% of the material+labour subtotal, as one of the first additive steps in the CPWD DAR 2023 cost build-up, before GST is applied.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, cost build-up tables ('Add 1% Water charges' step)"
 },
 {
  "id": "kn-say-rate",
  "keywords": [
   "say rate",
   "what does say mean",
   "'say'",
   "final rate rounding"
  ],
  "question": "What does 'Say' mean at the end of a rate analysis?",
  "answer": "'Say' marks the final, rounded per-unit rate at the end of a CPWD DAR cost build-up — the schedule rate that is actually published in the DSR. Everything above the 'Say' line (materials, labour, water charges, GST, CPOH, cess) is the derivation; the 'Say' figure is the answer.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, cost build-up tables"
 },
 {
  "id": "kn-basic-rates",
  "keywords": [
   "basic rate",
   "basic rates chapter",
   "4-digit code",
   "material code",
   "0006",
   "code 0006"
  ],
  "question": "What are 'Basic Rates' and the 4-digit codes (like 0006)?",
  "answer": "Basic Rates (CPWD DAR chapter 0) are the underlying per-unit rates for raw materials, labour categories, and plant/machinery hire — e.g. a 4-digit code like 0006 might be 'Hire charges of Spraying machine including electric charges'. These basic rates feed into the cost build-up (analysis) of the finished schedule items; a change to a basic rate can cascade into the final rate of every item that uses it. Correction Slip 1, for example, revised code 0006 from Rs 9,750/day to Rs 250/day, which changed the final rates of three other items (13.114, 13.116, 14.78) that consume it in their own analyses.",
  "source": "CPWD Delhi Analysis of Rates (DAR) 2023, 'Basic Rates' chapter; CPWD Correction Slip 1"
 },
 {
  "id": "kn-item-numbering",
  "keywords": [
   "item number format",
   "item numbering",
   "how are items numbered",
   "chapter number",
   "sub head"
  ],
  "question": "How is the CPWD item numbering scheme structured?",
  "answer": "CPWD DSR/DAR items are numbered chapter.item.subitem.subsubitem (e.g. 9.40.1.1), where the first number is the Sub Head/chapter (e.g. 9 = Wood and PVC Work, 12 = Roofing, 13 = Finishing). Deeper segments narrow down variants (material, size, thickness, etc.) of the same base item. Lettered suffixes (e.g. 26.42.1A, 9.147.A3.1) mark closely related variants introduced at different times, often via a correction slip.",
  "source": "CPWD Delhi Schedule of Rates (DSR) 2023 / Analysis of Rates (DAR) 2023, chapter structure"
 },
 {
  "id": "kn-iwd-zones",
  "keywords": [
   "i&wd zones",
   "zone i",
   "zone ii",
   "zone iii",
   "zone iv",
   "west bengal zones",
   "irrigation zones"
  ],
  "question": "What are the I&WD 'zones' and how do zone rates work?",
  "answer": "The I&WD (Irrigation & Waterways Directorate, West Bengal) Unified Schedule of Rates gives four zone-wise rates per item — Zone I, II, III and IV — rather than a single rate, reflecting regional cost variation across West Bengal. When you look up an I&WD item, all four zone rates are shown rather than a single figure.",
  "source": "I&WD (West Bengal) Unified Schedule of Rates"
 },
 {
  "id": "kn-pwdrb-districts",
  "keywords": [
   "pwd roads bridges districts",
   "district rate",
   "darjeeling hill area",
   "distance band",
   "carriage zone"
  ],
  "question": "How do PWD Roads & Bridges rates vary by district?",
  "answer": "The PWD (West Bengal) Roads & Bridges Schedule of Rates, Vol. III gives two main rate columns for most items — one for all other districts of West Bengal, and a separate (usually higher) rate for the Darjeeling Hill Area. Some carriage/material items instead vary by distance band or zone. Where an item has more than one applicable rate, the 'rate' field shows the general (all-districts) figure and a rate-notes field spells out the full variation.",
  "source": "PWD (West Bengal) Roads & Bridges Schedule of Rates, Volume III"
 },
 {
  "id": "kn-region-cpwd",
  "keywords": [
   "cpwd region",
   "which region cpwd",
   "cpwd delhi",
   "dsr region"
  ],
  "question": "Which region does the CPWD DSR 2023 apply to?",
  "answer": "The CPWD Delhi Schedule of Rates 2023 (and its Analysis of Rates) applies to Delhi only — it does not have region/zone rate variation the way the I&WD and PWD Roads & Bridges (West Bengal) schedules do.",
  "source": "CPWD Delhi Schedule of Rates (DSR) 2023"
 },
 {
  "id": "kn-needs-review",
  "keywords": [
   "needs review",
   "low confidence",
   "flagged",
   "confidence flag",
   "uncertain item"
  ],
  "question": "What does a 'needs review' or 'low confidence' flag on an item mean?",
  "answer": "A few items carry a caution: 148 CPWD items whose DAR cost breakdown may be incomplete (the final rate is still the schedule rate), 2 items flagged for review because of a formatting quirk in the source, and all 780 PWD(NH) items, which were read from a text copy of the book and are marked 'Verify with book'. In every case the rate shown is exactly what the source prints; the flag means some surrounding detail is less certain, not that the headline rate was guessed.",
  "source": "Data-quality flags set while reading the source documents"
 },
 {
  "id": "kn-no-internet-rates",
  "keywords": [
   "internet rate",
   "online rate",
   "web rate",
   "outside source",
   "google",
   "market rate"
  ],
  "question": "Are any rates looked up online or from outside sources?",
  "answer": "No. Every rate, description and correction in this tool comes directly from the official CPWD DSR/DAR, WB I&WD USoR and WB PWD (Building, Sanitary, Road & Bridge, NH) documents and their addenda. Nothing is substituted from the internet or general knowledge. If something isn't covered by these documents, this tool says so plainly rather than guessing.",
  "source": "Design policy for this tool"
 },
 {
  "id": "kn-hindi-dsr",
  "keywords": [
   "hindi dsr",
   "hindi schedule",
   "why dar not dsr",
   "dsr scans"
  ],
  "question": "Why is data drawn from the DAR (Analysis of Rates) instead of the DSR PDF directly?",
  "answer": "The CPWD DSR 2023 PDFs supplied are scanned Hindi image files with no text layer, while the DAR 2023 (Analysis of Rates) is in English with a text layer and ends each analysis in the schedule rate. The dataset is therefore read from the DAR text, and then cross-checked against the scanned DSR by OCR: item numbers and rates were compared across the whole DSR and differences were checked on the page images.",
  "source": "Method used while building the dataset (DAR text, cross-checked against the scanned DSR)"
 },
 {
  "id": "kn-units-glossary",
  "keywords": [
   "unit abbreviation",
   "what does cum mean",
   "sqm meaning",
   "rmt meaning",
   "unit meaning",
   "measurement unit"
  ],
  "question": "What do the unit abbreviations in the schedules mean?",
  "answer": "Common units seen across these schedules: Cum/cum = cubic metre, Sqm/sqm = square metre, Metre/RM/Rmt = running/linear metre, Kg = kilogram, MT = metric tonne, Quintal = 100 kg, Nos = numbers (count), Sqm/10 or 'per 10 sqm' etc. = the analysis is done per that multiple of the unit before being divided down, Day = per day (usually labour or plant hire). These are the units exactly as printed in the schedules.",
  "source": "Unit fields as printed across CPWD DSR/DAR, I&WD, and PWD Roads & Bridges schedules"
 },
 {
  "id": "kn-new-items-slips",
  "keywords": [
   "new items added",
   "items not in original dsr",
   "added by correction slip",
   "brand new item"
  ],
  "question": "Are there items in this tool that were never in the original DSR/DAR 2023 publication?",
  "answer": "Yes — 37 items were introduced by correction slips after the original 2023 publication (e.g. new waterproofing systems, fire-rated doorsets, polycarbonate roofing, modular road fencing, self-curing ready-mix plaster, and new stainless-steel reinforcement bar rates). Every such item is clearly marked as added by a specific correction slip, with its date, rather than being presented as part of the original DSR/DAR 2023.",
  "source": "CPWD Correction Slips 2, 4, 6, 8, 9, 10, 11"
 },
 {
  "id": "kn-source-inconsistency",
  "keywords": [
   "arithmetic error",
   "inconsistent rate",
   "wrong calculation",
   "cpoh mismatch",
   "22.27a.2"
  ],
  "question": "Is there any known inconsistency in the source documents themselves?",
  "answer": "One is known so far: item 22.27A.2 (added by Correction Slip 2) has an internal arithmetic inconsistency in its own printed CP&OH step — the CPOH line prints Rs 164.46 where 15% of the stated base would be roughly Rs 3,491. The officially printed final rate (Rs 2,885.30/Sqm) is still what's shown, since that is the legally published figure, but it carries a visible warning so this can be cross-checked against the CPWD portal if it matters for an estimate. No rate is silently 'corrected' by this tool.",
  "source": "CPWD Correction Slip 2, Annexure-II (item 22.27A.2 cost build-up)"
 },
 {
  "id": "kn-not-covered",
  "keywords": [
   "not covered",
   "outside scope",
   "labour laws",
   "tender process",
   "contract conditions",
   "gst return",
   "income tax"
  ],
  "question": "Does this tool cover tender procedures, contract conditions, or general labour/tax law?",
  "answer": "No - this tool only answers questions about item rates, descriptions, cost build-ups, addenda and correction-slip changes drawn from the rate schedules in this app (CPWD DSR/DAR, WB I&WD USoR, WB PWD Building / Sanitary / Road & Bridge / NH). It does not cover tender procedures, general conditions of contract, labour law or tax filing.",
  "source": "Scope of the supplied document set"
 },
 {
  "id": "kn-applicable-schedule",
  "keywords": [
   "which schedule",
   "applicable schedule",
   "23.07.2026",
   "memo 07(w)",
   "superseded",
   "reference only",
   "mandatory schedule",
   "order"
  ],
  "question": "Which schedule should be used for which type of work?",
  "answer": "Under I&WD Notification Memo No. 07(W)/2026-27 dated 23.07.2026 (adopting PWD Notification No. 1M-24/26/134-R/PL dated 07.07.2026): building works - CPWD DSR (with DAR for analysis); road and bridge works - PWD(NH) Schedule of Rates; irrigation-specific items not covered above - WB I&WD USoR 2018; minor / maintenance items not in DSR - the State PWD supplementary SoR booklet (not yet in this app). The WB PWD SoR Vol I, II and III items are kept in the app for reference and are marked 'Reference only - superseded for estimates from 23.07.2026'.",
  "source": "I&WD Memo No. 07(W)/2026-27 dt 23.07.2026, as described by the user; Schedules screen of this app"
 },
 {
  "id": "kn-pwd-building-districts",
  "keywords": [
   "pwd building",
   "sanitary",
   "plumbing",
   "district rate",
   "15 districts",
   "vol i",
   "vol ii"
  ],
  "question": "How do the WB PWD Building and Sanitary rates vary by district?",
  "answer": "The WB PWD SoR Vol I (Building) and Vol II (Sanitary & Plumbing), w.e.f. 01.11.2017, give district-wise rates for many items. The app shows every printed district rate for the item; the headline figure names the district it belongs to. These volumes are kept for reference only after the 23.07.2026 order.",
  "source": "WB PWD SoR Vol I & Vol II (w.e.f. 01.11.2017)"
 },
 {
  "id": "kn-nh-verify",
  "keywords": [
   "nh",
   "national highway",
   "verify with book",
   "pwd nh",
   "text copy"
  ],
  "question": "Why do PWD(NH) items say 'Verify with book'?",
  "answer": "The PWD(NH) Schedule of Rates 2019-20 was supplied only as a text copy, which loses the table columns. Descriptions and rates were paired from the reading order of the text, so each item is marked 'Verify with book'. Tables I-VI and Annexures I, I-A, I-B and II could not be added from the text copy; the original PDF is needed for them.",
  "source": "PWD(NH) SoR 2019-20 (text copy supplied)"
 }
];
