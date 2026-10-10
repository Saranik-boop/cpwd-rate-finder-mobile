// Later Finance Department orders that changed what WBSR Part I / Part II (compendium copy) says.
// Each entry names the order, its date, the rules it affects and where its text was read.
// Shown on top of the affected rules ("Changed by a later order") and used by the ready answers.
window.WBSR_AMEND_ASOF = 'December 2025';
window.WBSR_AMEND = [
  {
    id: 'retire60', rules: ['I:75'], memo: 'No. 3830-F dt. 15.05.1998 (read with 634-F dt. 05.06.1998)', eff: '1998',
    t: 'Age of superannuation raised from 58 to 60 years',
    x: 'Group A, B and C employees retire on the afternoon of the last day of the month in which they attain 60 years (58 printed in the book).',
    src: ['https://wbxpress.com/circulars/finance-1998/', 'https://burdwanzp.org/images/gov_notification_files/1517982205Training%20Material%20on%20West%20Bengal%20Service%20Rules.pdf']
  },
  {
    id: 'el300', rules: ['I:169', 'I:171', 'I:168', 'I:168B', 'I:168C'], memo: 'Memo No. 4625-F dt. 26.05.1999', eff: '01.07.1998',
    t: 'Earned leave: accumulation and encashment limit 240 → 300 days',
    x: 'Earned leave can be accumulated up to 300 days (rules 169/171). Cash equivalent of unutilised earned leave is paid up to 300 days on superannuation, retirement on notice, termination, end of re-employment, death in service (168B), permanent invalidation (168C) and with leave preparatory to retirement (168). On resignation / quitting service: half of the earned leave at credit, maximum 150 days.',
    src: ['https://wbxpress.com/maximum-limit-accumulation-encashment-earned-leave/']
  },
  {
    id: 'mat180', rules: ['I:199'], memo: 'Memo No. 1146-F(P) dt. 14.02.2011', eff: '01.01.2011',
    t: 'Maternity leave raised to a maximum of 180 days',
    x: 'A female State Government employee may be granted maternity leave for a maximum of 180 days (90 days printed in the book; it had been raised to 135 days earlier). Other terms of rule 199 continue — miscarriage / abortion up to 6 weeks, not debited to the leave account.',
    src: ['https://finance.wb.gov.in/writereaddata/Notification%201146-F_P_%20dt.14.02.11.pdf']
  },
  {
    id: 'ccl', rules: ['I:199', 'I:166'], memo: 'Memo No. 1364-F(P) dt. 15.02.2012', eff: '01.01.2012',
    t: 'Child Care Leave (CCL) — up to 730 days for female employees',
    x: 'Female employees with minor children may get Child Care Leave up to 730 days (2 years) in the whole service, for up to two children below 18 years (rearing, examinations, sickness etc.). Leave salary = pay drawn immediately before the leave. Not more than 3 spells in a calendar year, not less than 15 days a spell. Not debited to the leave account; can be combined with other leave; not ordinarily during probation. Other conditions as for earned leave; a separate attested account is kept.',
    src: ['https://wbxpress.com/child-care-leave/']
  },
  {
    id: 'cclad', rules: ['I:199'], memo: 'Memo No. 2301-F(P) dt. 18.03.2013', eff: '01.03.2013',
    t: 'Child Care Leave extended to legally adopted children',
    x: 'Child Care Leave is also admissible to female employees for a legally adopted child; all other conditions remain the same.',
    src: ['https://wbxpress.com/child-care-leave-in-respect-of-adopted-child/']
  },
  {
    id: 'adopt', rules: ['I:199'], memo: 'Memo No. 9728-F(P) dt. 24.10.2011', eff: '01.10.2011',
    t: 'Child Adoption Leave — 135 days',
    x: 'A female employee with less than two surviving children who adopts a child below 1 year gets Child Adoption Leave of 135 days, on the pay drawn just before the leave. After it, other leave due may be taken up to one year or till the child is one year old, whichever is earlier; up to 60 days of leave not due / commuted leave without medical certificate.',
    src: ['https://wbxpress.com/child-adoption-leave/']
  },
  {
    id: 'pat', rules: ['I:199', 'I:166'], memo: 'Memo No. 1100-F(P) dt. 25.02.2016', eff: '25.02.2016',
    t: 'Paternity-cum-Child Care Leave — 30 days for male employees',
    x: 'Male employees with less than two surviving children get Paternity-cum-Child Care Leave of 30 days, which may be taken during childbirth and up to the child\'s 18th year. Leave salary = pay drawn immediately before the leave; can be combined with any other leave; not debited to the leave account.',
    src: ['https://wbxpress.com/paternity-cum-child-care-leave-30-days/']
  },
  {
    id: 'cl14', rules: ['I:207', 'I:167'], memo: 'Appendix 10 to WBSR Part I (Government instructions on casual leave)', eff: '',
    t: 'Casual leave — 14 days a year, normally up to 7 days at a time',
    x: 'Casual leave is admissible for 14 days in a calendar year. It is not ordinarily granted for more than 7 consecutive days including Sundays and holidays, except in very special circumstances recorded in writing. Half-day CL may be taken for the forenoon or afternoon session; it is not admissible on a day the office is not held for the full day. An officer taking CL on tour gets no daily allowance for that period.',
    src: ['https://wbxpress.com/casual-leave/', 'https://burdwanzp.org/images/gov_notification_files/1517982205Training%20Material%20on%20West%20Bengal%20Service%20Rules.pdf']
  },
  {
    id: 'hrms', rules: ['I:153', 'I:207', 'I:221'], memo: 'Memo No. 1332-F(H) dt. 14.03.2024 and No. 1573-F dt. 28.03.2024', eff: '15.03.2024 / 01.04.2024 / 01.05.2024',
    t: 'Leave must be applied through HRMS',
    x: 'Casual / compensatory casual leave through HRMS from 15.03.2024 (up to Deputy Secretary rank); earned, commuted, child care and parent-cum-child care leave from 01.04.2024; other leave from 01.05.2024. Those who cannot use the self-service portal may apply offline and the operator enters it. A hard copy of the application is still submitted.',
    src: ['https://wbxpress.com/leave-application-hrms/', 'https://wbxpress.com/files/2024/05/1573-F.pdf']
  },
  {
    id: 'lnd', rules: ['I:173', 'I:176'], memo: 'Rule 174 (leave not due) as summarised in the ATI WBSR training monograph', eff: '',
    t: 'Leave not due — limits (rule 174, missing from this copy)',
    x: 'Leave not due on half pay is limited to 360 days in the whole service; without a medical certificate, 90 days at a time and 180 days in all. It is debited against half-pay leave earned later.',
    src: ['https://burdwanzp.org/images/gov_notification_files/1517982205Training%20Material%20on%20West%20Bengal%20Service%20Rules.pdf']
  },
  {
    id: 'ta1999', rules: ['II:57', 'II:71A', 'II:73', 'II:73A', 'II:71B', 'II:100', 'II:105', 'II:106'], memo: 'Memo No. 4730-F dt. 25.05.1999 (Revised T.A. Rules, 4th Pay Commission)', eff: '01.06.1999',
    t: 'Revised TA / DA rates and rules',
    x: 'Daily allowance (Govt / PSU guest house, dak bungalow or own arrangement) — pay Rs 16,400 & above: Rs 135 (ordinary) / Rs 260 (Kolkata, Darjeeling dist. except Siliguri sub-div.); Rs 8,000–16,399: 120 / 230; Rs 6,500–7,999: 105 / 200; Rs 4,100–6,499: 90 / 170; below Rs 4,100: 55 / 105. In hotels at scheduled tariff: 335 / 650; 225 / 505; 200 / 380; 130 / 245; 65 / 125. Continuous halt: full DA for 60 days, half from 61st to 180th day, nil beyond. Incidental charges abolished. Transfer: lump-sum transfer grant Rs 2,250 / 1,800 / 1,350 / 900 / 675 and packing allowance Rs 1,500 / 1,200 / 900 / 675 / 675 by the same pay ranges (one-third if residence does not change or new station within 20 km). The pay ranges are of the 1998 pay scales — confirm the equivalent under your present pay level with your DDO.',
    src: ['https://wbxpress.com/travelling-allowance-rules/', 'https://wbxpress.com/ta-rule-daily-allowance/', 'https://wbxpress.com/ta-rule-journeys-on-transfer/']
  },
  {
    id: 'ltc', rules: [], memo: 'Memo No. 7370-F(P) dt. 09.10.2015; 4784-F(P2) dt. 28.11.2024; 3343-F(P2) dt. 11.09.2025', eff: '01.11.2015',
    t: 'Leave Travel Concession (LTC) and Home Travel Concession (HTC)',
    x: 'LTC once in 10 years for travel anywhere in India or to listed neighbouring countries; HTC once in 5 years to any place in West Bengal. If both spouses are State employees only one may claim. Rail class from 01.12.2024: basic pay Rs 50,000 and above — AC 2-tier (AC chair car); below Rs 50,000 — AC 3-tier. The current LTC and HTC blocks that were to end on 31.10.2025 are extended up to 31.10.2026.',
    src: ['https://wbxpress.com/leave-travel-concession-rule/', 'https://wbxpress.com/class-accommodation-htc-ltc/', 'https://wbxpress.com/extension-current-block-period-ltc-htc/']
  }
];
