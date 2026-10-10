// Ready answers for common service-rule doubts, written from the text of WBSR Part I & Part II in this app.
// Every point names the rule it comes from (cite: 'I:173' = Part I rule 173, 'I:Appendix 5:2' = Part I, Appendix 5, para 2).
// The app also shows the full rule text under each answer, so the person can read the source themselves.
window.WBSR_TOPICS = [
  {
    id: 'study', t: 'Leave for higher studies (Masters / M.Tech / PhD)',
    kw: ['study leave', 'study', 'studies', 'higher studies', 'higher study', 'education', 'educational', 'educational break', 'masters', 'master', 'mtech', 'm.tech', 'me', 'phd', 'ph.d', 'doctorate', 'research', 'course', 'degree', 'university', 'college', 'admission', 'mba', 'post graduation', 'pg', 'training abroad', 'study allowance', 'bond'],
    a: [
      'Yes, there is a route — but it is not a "break"; it is leave for study, and there are three ways the rules allow it:',
      '1) STUDY LEAVE (Appendix 5): for higher studies or specialised training in a professional or technical subject having a direct and close connection with your sphere of duty. It must be certified to be of definite advantage in the public interest, and is not for purely academic or literary subjects. [I:Appendix 5:1]',
      '   • Normally not granted if you have less than 5 years of service, or if you are due to retire within 3 years of returning. [I:Appendix 5:1]',
      '   • Up to 12 months at a time and 24 months in the whole service. With other leave (other than extraordinary leave) the total absence cannot exceed 28 months. [I:Appendix 5:2] [I:Appendix 5:5]',
      '   • It is not debited to your leave account. In India you draw leave salary equal to pay (without allowances), reduced by any scholarship / stipend, but not below half-pay leave salary; no study allowance for courses in India. [I:Appendix 5:5] [I:Appendix 5:7]',
      '   • Fees are ordinarily paid by you; Government may sanction them only in exceptional cases. TA is ordinarily not paid. [I:Appendix 5:13] [I:Appendix 5:12]',
      '   • You must sign a bond before the leave starts; if you resign / quit without returning, or within 3 years of return, you refund leave salary, fees and other costs with interest. [I:Appendix 5:4] [I:Appendix 5:14]',
      '2) EXTRAORDINARY LEAVE for studies: up to 24 months for studies certified to be in the public interest, if you have 3 years\' continuous service; a bond like study leave is required (refund if you do not return or leave within 3 years). No leave salary during EOL. [I:175] [I:176]',
      '3) COMMUTED LEAVE for an approved course: half-pay leave up to 180 days in the whole service can be commuted (full pay) without a medical certificate for an approved course of study certified to be in public interest; a bond is required. [I:173]',
      'Apply through proper channel to the authority competent to grant leave, stating the course and examinations clearly. [I:Appendix 5:3]'
    ],
    cite: ['I:Appendix 5:1', 'I:Appendix 5:2', 'I:Appendix 5:5', 'I:Appendix 5:7', 'I:Appendix 5:14', 'I:175', 'I:173', 'I:197'],
    note: 'A Masters / PhD in your own engineering field usually fits "professional or technical subject connected with duty"; a purely academic subject does not qualify for study leave but may still be considered under EOL for studies.'
  },
  {
    id: 'casual', t: 'Casual leave (CL)',
    kw: ['casual leave', 'casual', 'cl', 'c.l', 'half day', 'half-a-day', 'short leave'],
    a: [
      'Casual leave is not "leave" under these rules: you are not treated as absent from duty and your pay is not interrupted. [I:207]',
      'Casual leave cannot be combined with any other kind of regular leave. [I:167]',
      'It must not be used to get round the rules on charge of office, start / end of leave or return to duty, or to extend any leave beyond what is admissible. [I:207]',
      'If you take half-a-day CL in the afternoon with no CL left and cannot rejoin the next working day, the last half-day CL for that afternoon is not allowed. [I:167]',
      'Special casual leave (sportsmen, delegates to association meetings etc.) can be combined with CL, but CL is not combined with both special CL and regular leave together. [I:167]',
      'You get 14 days of casual leave in a calendar year, normally not more than 7 days at a time (Sundays and holidays in between count), unless very special circumstances are recorded in writing. [A:cl14]',
      'Half-day CL can be taken for the forenoon or afternoon session; not on a day the office is not held for the full day. No daily allowance for CL taken while on tour. [A:cl14]',
      'Apply for CL through HRMS (from 15.03.2024). [A:hrms]'
    ],
    cite: ['I:207', 'I:167', 'I:166'], am: ['cl14', 'hrms'],
    note: ''
  },
  {
    id: 'earned', t: 'Earned leave (EL)',
    kw: ['earned leave', 'el', 'e.l', 'privilege leave', 'pl', 'leave credit', 'leave account', '15 days', 'accumulation', 'maximum earned leave', '240 days', '120 days'],
    a: [
      'In a non-vacation department, EL is credited in advance in two instalments of 15 days each, on 1 January and 1 July. [I:169]',
      'In the half-year you join, credit is 2½ days per completed calendar month you are likely to serve; in the half-year you retire / resign, 2½ days per completed month up to that date. [I:170]',
      'Extraordinary leave / dies non in a half-year reduces the next credit by 1/10 of that period (maximum 15 days). [I:170]',
      'Earned leave can be accumulated up to 300 days (the book says 240; raised by Memo 4625-F dt. 26.05.1999). [A:el300]',
      'Maximum EL at one time: 120 days (up to 240 days if the leave is spent outside India and the neighbouring countries named). [I:169]',
      'Unused EL is paid as cash on retirement / death / invalidation up to 300 days; on resignation, half the EL at credit up to 150 days. [A:el300]',
      'Leave salary during EL = full pay with increments falling due and DA / other allowances. [I:176]',
      'Vacation departments earn EL differently (in proportion to vacation not availed). [I:171] [I:172]'
    ],
    cite: ['I:169', 'I:170', 'I:176', 'I:171'], am: ['el300', 'hrms'],
    note: ''
  },
  {
    id: 'hpl', t: 'Half-pay leave, commuted leave and leave not due',
    kw: ['half pay leave', 'half-pay leave', 'hpl', 'commuted leave', 'commuted', 'medical leave', 'leave on medical certificate', 'leave not due', 'lnd', 'private affairs', 'sick leave'],
    a: [
      'Half-pay leave (HPL): 20 days for each completed year of service; taken on medical certificate or on private affairs. [I:173]',
      'Commuted leave: up to half of the HPL due, on medical certificate; twice the commuted days are debited from HPL; full leave salary (twice HPL salary). [I:173] [I:176]',
      'Up to 180 days of HPL in the whole service can be commuted without medical certificate for an approved course of study in public interest (bond needed). [I:173]',
      'Leave not due is an advance of HPL — up to 360 days in the whole service (without medical certificate: 90 days at a time, 180 days in all). If you resign / retire before earning it back, leave salary for the unearned part is recovered (not if retirement is for ill-health or on death). [A:lnd] [I:173]',
      'Leave salary during HPL / leave not due = half pay plus DA and allowances as ordered. [I:176]'
    ],
    cite: ['I:173', 'I:176', 'I:166'], am: ['lnd'],
    note: ''
  },
  {
    id: 'eol', t: 'Extraordinary leave (EOL / leave without pay)',
    kw: ['extraordinary leave', 'extra ordinary leave', 'eol', 'leave without pay', 'lwp', 'without pay', 'unpaid leave'],
    a: [
      'Granted in special circumstances: when no other leave is admissible, or when other leave is admissible but you apply in writing for EOL. [I:175]',
      'For employees not in permanent employ, EOL is limited to 3 months on any occasion; the Governor may allow more: 6 months (1 year continuous service + medical certificate), 18 months (TB, leprosy, cancer, mental illness under treatment), 24 months (studies in public interest, 3 years continuous service). [I:175]',
      'No leave salary is paid during EOL. [I:176]',
      'EOL / dies non in a half-year reduces the next EL credit by 1/10 of the period (max 15 days). [I:170]',
      'No leave of any kind can run continuously beyond 5 years unless the Governor decides otherwise. [I:34]'
    ],
    cite: ['I:175', 'I:176', 'I:170', 'I:34'],
    note: ''
  },
  {
    id: 'maternity', t: 'Maternity leave',
    kw: ['maternity', 'maternity leave', 'pregnancy', 'pregnant', 'delivery', 'miscarriage', 'abortion', 'child birth', 'childbirth', 'baby', 'female employee'],
    a: [
      'A female Government employee may be granted maternity leave for a maximum of 180 days (from 01.01.2011; the book prints 90), on leave salary equal to pay drawn on earned leave. [A:mat180] [I:199]',
      'For miscarriage / abortion (including MTP Act cases): up to 6 weeks on a medical certificate. [I:199]',
      'It can be combined with any other leave; up to 60 days of other leave (including commuted leave) in continuation can be granted without medical certificate; further leave needs a medical certificate, and may also be given for the illness of the newborn. [I:199]',
      'Maternity leave is not debited to the leave account. [I:199]',
      'After it, Child Care Leave (up to 730 days in service) can also be taken for children below 18. [A:ccl]'
    ],
    cite: ['I:199'], am: ['mat180', 'ccl', 'adopt'],
    note: ''
  },
  {
    id: 'lpr', t: 'Leave before retirement and leave encashment',
    kw: ['leave preparatory to retirement', 'lpr', 'encashment', 'encash', 'cash equivalent', 'leave salary on retirement', 'retirement leave', 'refused leave', 'death leave salary', 'invalidation'],
    a: [
      'Leave preparatory to retirement: EL due (now up to 300 days) together with HPL due, provided it runs up to and includes the date of retirement; it cannot include EOL. [I:168]',
      'On death in service, the family gets the cash equivalent of leave salary for the EL due (now max 300 days) plus DA and medical allowance, without reduction for pension equivalent; order of payment: widow / widower, then children, then mother, then father. [I:168B]',
      'If declared permanently incapacitated, cash equivalent of leave due may be granted (not beyond the normal superannuation date). [I:168C]',
      'On superannuation you get cash for unused EL up to 300 days; on resignation, half the EL at credit up to 150 days. [A:el300]'
    ],
    cite: ['I:168', 'I:168B', 'I:168C'], am: ['el300'],
    note: ''
  },
  {
    id: 'joining', t: 'Joining time on transfer',
    kw: ['joining time', 'joining', 'transfer joining', 'join new post', 'days to join', 'transit'],
    a: [
      'Joining time is admissible to join a new post on transfer in public interest, on return from leave of up to 6 months, etc. The authority ordering the posting may curtail it and Government may extend it. [I:80]',
      'With change of residence: 10 days for 1,000 km or less, 12 days for more than 1,000 km (12 and 15 days if more than 200 km of continuous road travel). Holidays following joining time extend it. [I:81]',
      'Head of Department can extend up to 30 days in total; beyond that Government. [I:81]',
      'Same station, or no change of residence: one day only. [I:82]',
      'Joining time is calculated on the route travellers commonly use, whatever route you actually take. [I:85]'
    ],
    cite: ['I:80', 'I:81', 'I:82', 'I:85'],
    note: ''
  },
  {
    id: 'retire', t: 'Age of retirement (superannuation)',
    kw: ['retirement', 'retire', 'superannuation', 'retirement age', 'age of retirement', 'date of retirement', '58', '60 years', 'date of birth'],
    a: [
      'Retirement is from the afternoon of the last day of the month in which you reach the prescribed age; if born on the 1st of a month, from the last day of the previous month. [I:75] [I:166]',
      'The age of superannuation is 60 years (raised from 58 by No. 3830-F dt. 15.05.1998). [A:retire60]',
      'Some services (e.g. teachers, doctors) have their own higher age under separate orders.'
    ],
    cite: ['I:75', 'I:166'], am: ['retire60'],
    note: ''
  },
  {
    id: 'suspension', t: 'Suspension and subsistence allowance',
    kw: ['suspension', 'suspended', 'subsistence', 'subsistence allowance', 'reinstatement', 'reinstated', 'dismissal', 'removal'],
    a: [
      'Under suspension you get a subsistence allowance equal to the leave salary on half-pay, plus dearness, medical and other compensatory allowances admissible on the pay drawn on the date of suspension (or such portion as the suspending authority directs). [I:71]',
      'It is paid only on your certificate that you are not engaged in any other employment, business or profession. [I:71]',
      'After the first 3 months it may be raised by up to 50% if the delay is not your fault, or reduced by up to 50% if the delay is due to you. [I:71]',
      'On reinstatement after dismissal / removal / compulsory retirement, the authority makes a specific order on pay for the absence period and whether it counts as duty; if fully exonerated, full pay and allowances. [I:72]'
    ],
    cite: ['I:71', 'I:72'],
    note: ''
  },
  {
    id: 'overstay', t: 'Overstaying leave / absence after leave',
    kw: ['overstay', 'overstayed', 'absence', 'absent', 'unauthorised absence', 'willful absence', 'extension of leave', 'late joining', 'dies non'],
    a: [
      'The leave-granting authority can sanction up to 14 days retrospectively for overstay beyond your control or when administratively convenient. [I:161]',
      'Absence after leave expires (unless leave is extended): no leave salary; the period is debited as HPL to the extent due, the rest as EOL; wilful absence makes you liable to disciplinary action. [I:34] [I:160]',
      'You cannot return before your leave ends without permission, and on return you report and await orders. [I:160]'
    ],
    cite: ['I:161', 'I:34', 'I:160'],
    note: ''
  },
  {
    id: 'right', t: 'Can leave be refused? Rules for any leave',
    kw: ['leave as right', 'right to leave', 'refuse leave', 'refused', 'revoke', 'leave sanction', 'who sanctions leave', 'competent authority', 'combination of leave', 'combine leave', 'prefix', 'suffix', 'holidays with leave', 'recall'],
    a: [
      'Leave cannot be claimed as of right; the sanctioning authority may refuse or revoke it when public service requires. Your claim is governed by the rules in force when leave is applied for and granted. [I:153]',
      'Any kind of leave may be combined with any other, except where the rules say otherwise (casual leave cannot be combined). [I:167]',
      'Holidays may be prefixed / suffixed to leave as allowed by rule 155 and 157. [I:155] [I:157]',
      'Group A leave is sanctioned by the authority competent to fill the post; Group B, C, D by the authorities named in rule 152. [I:151] [I:152]',
      'If recalled from leave, the recall is treated as compulsory: you are on duty from the day you start, with TA for the journey. [I:158] [II:125]',
      'Leave is now applied for and sanctioned through HRMS. [A:hrms]'
    ],
    cite: ['I:153', 'I:167', 'I:155', 'I:157', 'I:151', 'I:152', 'I:158', 'II:125'], am: ['hrms'],
    note: ''
  },
  {
    id: 'special', t: 'Special disability, quarantine and hospital leave',
    kw: ['special disability', 'disability leave', 'injury', 'injured on duty', 'accident on duty', 'quarantine', 'infectious', 'hospital leave', 'special sick leave'],
    a: [
      'Special disability leave: if disabled by injury caused in, or because of, your official duties; disability must show within 3 months (Government can relax); period as certified by a medical board, max 24 months. [I:195]',
      'Quarantine leave: when an infectious disease in your family / household makes your attendance hazardous to others. [I:198]',
      'Hospital leave: for specified subordinate staff whose duties involve risk; not debited to the leave account. [I:200] [I:204]'
    ],
    cite: ['I:195', 'I:198', 'I:200', 'I:204'],
    note: ''
  },
  {
    id: 'da', t: 'Daily allowance (DA) on tour',
    kw: ['daily allowance', 'da', 'tour', 'on tour', 'halt', 'halting', 'absence from headquarters', 'ta da', 'ta/da', 'tada'],
    a: [
      'Daily allowance is a uniform allowance for each day of absence from headquarters to cover ordinary daily charges. [II:55]',
      'You are on tour when absent on duty from headquarters within, or with sanction beyond, your sphere of duty. [II:63]',
      'For absence under 24 hours: up to 6 hours — nil; 6 to 12 hours — 70%; over 12 hours — full DA. Each calendar day counts separately. [II:71A]',
      'Rates (Memo 4730-F, from 01.06.1999), staying in Govt guest house / dak bungalow / own arrangement — ordinary place / Kolkata & Darjeeling district: pay Rs 16,400+: Rs 135 / 260; Rs 8,000–16,399: 120 / 230; Rs 6,500–7,999: 105 / 200; Rs 4,100–6,499: 90 / 170; below 4,100: 55 / 105. In a hotel at scheduled tariff: 335 / 650; 225 / 505; 200 / 380; 130 / 245; 65 / 125. [A:ta1999]',
      'Continuous halt at one place: full DA for 60 days, half from day 61 to 180, nil after that. [A:ta1999]',
      'No DA for casual leave taken while on tour. [A:cl14]'
    ],
    cite: ['II:55', 'II:63', 'II:71A', 'II:74', 'II:57'], am: ['ta1999'],
    note: 'The pay ranges are of the 1998 pay scales; ask your DDO for the equivalent at your present pay level.'
  },
  {
    id: 'training', t: 'TA / DA for training',
    kw: ['training', 'refresher course', 'training course', 'deputed for training', 'da for training', 'ta for training', 'daily allowance for training', 'allowance for training', 'during training'],
    a: [
      'When deputed by Government for training / refresher course within India entirely in State interest: TA for the first journey to and last journey from the place of training. [II:73A]',
      'Daily allowance: full rate for the first 30 days, ¾ for the next 30 days, half for the rest, up to 180 days. Beyond 180 days you are expected to make a permanent, cheaper arrangement. [II:73A]'
    ],
    cite: ['II:73A'],
    note: ''
  },
  {
    id: 'transfer', t: 'TA on transfer and transfer grant',
    kw: ['transfer', 'transfer ta', 'transfer grant', 'ta on transfer', 'shifting', 'family on transfer', 'personal effects', 'luggage', 'household goods'],
    a: [
      'On transfer in public interest you get fares for yourself and family members, a transfer grant by pay range, and carriage of personal effects as prescribed. [II:100]',
      'If allowed to hand / take over charge away from headquarters: tour-rate TA for those journeys plus transfer grant and family / effects TA. [II:106]',
      'Family following within six months is covered as provided in rule 105. [II:105]',
      'Transfer TA is only for transfer in public convenience; a transfer at your own request is not public convenience unless the sanctioning authority records special reasons. [II:99]',
      'Lump-sum transfer grant / packing allowance (Memo 4730-F): pay Rs 16,400+: Rs 2,250 / 1,500; 8,000–16,399: 1,800 / 1,200; 6,500–7,999: 1,350 / 900; 4,100–6,499: 900 / 675; below 4,100: 675 / 675. Full only if residence changes and the new station is over 20 km away; otherwise one-third. [A:ta1999]'
    ],
    cite: ['II:100', 'II:105', 'II:106', 'II:99'], am: ['ta1999'],
    note: 'The pay ranges are of the 1998 pay scales; ask your DDO for the equivalent at your present pay level.'
  },
  {
    id: 'exam', t: 'TA for departmental examinations',
    kw: ['examination', 'exam', 'departmental exam', 'departmental examination', 'ta for exam'],
    a: [
      'TA is admissible for journeys to an obligatory departmental or language examination, and DA for the days you appear; not more than twice for the same examination. [II:120]'
    ],
    cite: ['II:120', 'II:121', 'II:122'],
    note: ''
  },
  {
    id: 'medical', t: 'TA for medical treatment / medical advice',
    kw: ['medical advice', 'medical treatment', 'treatment', 'doctor', 'hospital journey', 'medical journey', 'sick'],
    a: [
      'If there is no Government medical officer at your station and you must travel to obtain medical advice, TA is admissible on a certificate from the doctor consulted that the journey was absolutely necessary. [II:138]',
      'If there is no Government medical officer at your station, TA is admissible for the journey to get a medical certificate for an original grant of leave. [II:140]',
      'If a Government medical officer advises you to travel elsewhere for further medical advice, TA rules for that journey are in rule 146. [II:146]'
    ],
    cite: ['II:138', 'II:140', 'II:141', 'II:146'],
    note: ''
  },
  {
    id: 'hra', t: 'House rent allowance during leave / transfer',
    kw: ['house rent', 'hra', 'house rent allowance', 'rent allowance'],
    a: [
      'HRA may be drawn during leave (including leave preparatory to retirement or refused leave) or temporary transfer if you certify that your family continued to live at the old station, or that you continued to bear the rent. [II:14]'
    ],
    cite: ['II:14'],
    note: ''
  },
  {
    id: 'increment', t: 'Increment and efficiency bar',
    kw: ['increment', 'annual increment', 'efficiency bar', 'eb', 'pay fixation', 'initial pay', 'promotion pay', 'option'],
    a: [
      'Initial pay on substantive appointment to a time-scale post is fixed under rule 42 (next stage above old pay if duties are of greater importance; equal stage or personal pay otherwise). [I:42]',
      'If the pay of your post is changed you may opt to keep the old pay until your next increment; the option is final. [I:44]',
      'An increment above an efficiency bar needs specific sanction based on a positive report of satisfactory service. [I:46]'
    ],
    cite: ['I:42', 'I:44', 'I:46', 'I:48'],
    note: 'Pay fixation today follows the current ROPA rules; these rules give the general principles.'
  },
  {
    id: 'foreign', t: 'Deputation / foreign service',
    kw: ['deputation', 'foreign service', 'lien', 'posted outside', 'psu', 'corporation', 'autonomous body'],
    a: [
      'Rules on lien and its retention / suspension are in Chapter III (rules 17–24). [I:17] [I:18]',
      'Foreign service (e.g. a corporation or local body) is in Chapter XII: no one can be transferred to foreign service against his will (with stated exceptions), every such transfer needs Government sanction, and it is allowed only if the duties should for public reasons be done by a Government employee. [I:97] [I:98]',
      'You remain governed by these leave rules while on deputation / foreign service within India; part of the leave charges are borne by the borrowing body. [I:145]'
    ],
    cite: ['I:17', 'I:18', 'I:97', 'I:98', 'I:145'],
    note: ''
  },
  {
    id: 'ccl', t: 'Child Care Leave (CCL)',
    kw: ['child care leave', 'child care', 'ccl', 'c.c.l', 'care of child', 'children', 'child exam', 'sick child', 'adopted child'],
    a: [
      'Female employees can take Child Care Leave up to 730 days (2 years) in the whole service, for up to two children below 18 years — for rearing, examinations, sickness etc. [A:ccl]',
      'Full pay (the pay drawn just before the leave); not debited to your leave account; can be combined with other leave. [A:ccl]',
      'Not more than 3 spells in a calendar year and not less than 15 days a spell; not ordinarily during probation. [A:ccl]',
      'Also admissible for a legally adopted child (from 01.03.2013). [A:cclad]',
      'Apply through HRMS. [A:hrms]'
    ],
    cite: ['I:199', 'I:166'], am: ['ccl', 'cclad', 'hrms'],
    note: ''
  },
  {
    id: 'paternity', t: 'Paternity-cum-Child Care Leave (male employees)',
    kw: ['paternity', 'paternity leave', 'father', 'male employee child', 'parent cum child care', 'paternity cum child care'],
    a: [
      'Male employees with less than two surviving children get 30 days of Paternity-cum-Child Care Leave, usable at childbirth and any time until the child is 18. [A:pat]',
      'Full pay (pay drawn just before the leave); can be combined with any other leave; not debited to the leave account. [A:pat]'
    ],
    cite: ['I:199'], am: ['pat'],
    note: ''
  },
  {
    id: 'adoption', t: 'Child Adoption Leave',
    kw: ['adoption', 'adopt', 'adopted', 'child adoption leave'],
    a: [
      'A female employee with less than two surviving children who adopts a child below 1 year gets 135 days of Child Adoption Leave on full pay. [A:adopt]',
      'Then other leave due may be taken up to one year or till the child turns one (whichever is earlier); up to 60 days of leave not due / commuted leave need no medical certificate. [A:adopt]',
      'Child Care Leave is also admissible for a legally adopted child. [A:cclad]'
    ],
    cite: ['I:199'], am: ['adopt', 'cclad'],
    note: ''
  },
  {
    id: 'ltc', t: 'LTC and Home Travel Concession (HTC)',
    kw: ['ltc', 'htc', 'leave travel concession', 'home travel concession', 'home town', 'travel concession', 'holiday travel'],
    a: [
      'LTC: once in 10 years, anywhere in India or to listed neighbouring countries. HTC: once in 5 years, anywhere in West Bengal. If both spouses are State employees only one may claim. [A:ltc]',
      'Rail class from 01.12.2024: basic pay Rs 50,000 and above — AC 2-tier; below Rs 50,000 — AC 3-tier. [A:ltc]',
      'The current LTC / HTC block that was to end on 31.10.2025 is extended up to 31.10.2026. [A:ltc]'
    ],
    cite: [], am: ['ltc'],
    note: 'LTC / HTC is governed by Finance Department orders, not by the WBSR text itself.'
  }
];
