"""Split the West Bengal Service Rules Part I and Part II (text copies) into searchable rule entries.

Usage: python3 scripts/build-rules.py <WBSR-I.txt> <WBSR-II.txt> www/rules-data.js

Each entry: {b: 'I'|'II', r: rule / paragraph no., ch: chapter, sec: section, ap: appendix, t: text, h: side-headings on its page, p: page}
The text is kept exactly as printed (only page headers, page numbers and the side-heading blocks are taken out of the flow).
"""
import json, re, sys

HDR = re.compile(r'^\s*Compendium on Acts and Rules\s*$')
PAGENO = re.compile(r'^\s*\d{1,3}\s*$')
CHAP = re.compile(r'^\s*CHAPTER\s+([IVXL]+)\s*[.,]?\s*[—–-]+\s*(.*)$', re.I)
SECT = re.compile(r'^\s*SECTIONS?\s*[-–—]*\s*([IVX]+|\d+|[A-Z])\s*[.,]?\s*[-–—.]*\s*(.*)$', re.I)
APPX = re.compile(r'^\s*\**\s*(APPENDIX|Annexure|SCHEDULE)\s+(No\.?\s*)?([0-9IVX]+[A-Z]?)\b\.?\s*(.*)$', re.I)
RULE = re.compile(r'^\s*\**\s*(\d{1,5}[A-Z]{0,2}\d{0,2}(?:\s*[-–]\s*\d{1,3}[A-Z]{0,2})?)\s*\.\s*(?:[-—–]\s*)?(\S.*)$')
FOOT = re.compile(r'^(\d{1,3})([A-Z]{0,2})(\d{1,2})$')   # rule number with a footnote number printed on it, e.g. 16828 = 168 + note 28
SHORT = 24


def is_short(l):
    s = l.strip().lstrip('*').strip()
    return 0 < len(s) <= SHORT and not s.startswith('(') and not re.match(r'^\d', s)


def load(path):
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    # cut the concordance (source of each rule) at the end - not rules
    for i, l in enumerate(lines):
        if 'Concordance showing the source of each rule' in l and i > len(lines) * 0.5:
            j = i
            while j > i - 6 and not APPX.match(lines[j]): j -= 1
            lines = lines[:j if APPX.match(lines[j]) else i]
            break
    return lines


def parse(path, book):
    lines = load(path)
    out = []
    page = 1
    ch = sec = ap = ''
    cur = None
    last_no = 0
    page_heads = []          # side-headings seen on the current page
    page_entries = []
    buf_short = []

    def num(r):
        m = re.match(r'(\d+)', r)
        return int(m.group(1)) if m else 0

    def top(r):
        m = re.findall(r'(\d+)', r)
        return int(m[-1]) if m else 0

    def flush_short():
        nonlocal buf_short
        if len(buf_short) >= 2:
            head = ' '.join(s.strip() for s in buf_short)
            page_heads.append(head)
        elif buf_short and cur is not None:
            cur['t'].append(buf_short[0].strip())
        buf_short = []

    def end_page():
        nonlocal page_heads, page_entries
        hs = ' '.join(page_heads)
        for e in page_entries:
            e['h'] = (e.get('h', '') + ' ' + hs).strip()
        if cur is not None and cur not in page_entries:
            cur['h'] = (cur.get('h', '') + ' ' + hs).strip()
        page_heads, page_entries = [], []

    for raw in lines:
        l = raw.rstrip()
        if HDR.match(l):
            flush_short(); end_page(); continue
        if PAGENO.match(l):
            m = re.match(r'\s*(\d+)', l); page = int(m.group(1)); continue
        if not l.strip():
            continue
        hdr = (CHAP.match(l) and len(l) < 110) or (APPX.match(l) and len(l) < 120 and not re.match(r'^\s*[a-z(]', APPX.match(l).group(4) or 'X'))
        if is_short(l) and not hdr:
            buf_short.append(l); continue
        flush_short()
        m = CHAP.match(l)
        if m and len(l) < 110:
            ch = ('Chapter ' + m.group(1).upper() + ' — ' + m.group(2).strip(' .')).strip(' —')
            sec = ''; ap = ''; continue
        m = SECT.match(l)
        if m and len(l) < 90 and not RULE.match(l):
            sec = ('Section ' + m.group(1) + ' — ' + m.group(2).strip(' .-—')).strip(' —'); continue
        m = APPX.match(l)
        if m and len(l) < 120 and not re.match(r'^\s*[a-z(]', m.group(4) or 'X'):
            ap = m.group(1).title() + ' ' + m.group(3) + ((' — ' + m.group(4).strip(' .[]')) if m.group(4).strip(' .[]') else '')
            ch = ap; sec = ''; last_no = 0
            continue
        m = RULE.match(l)
        if m:
            cands = [m.group(1)]
            raw_no = m.group(1).replace(' ', '')
            for k in (1, 2):   # strip a glued footnote number
                if re.fullmatch(r'\d+[A-Z]{0,2}\d+', raw_no) and len(re.sub(r'\D', '', raw_no)) > k:
                    cands.append(raw_no[:-k])
            rno = None
            for c in cands:
                if not re.fullmatch(r'\d{1,3}[A-Z]{0,2}(?:\s*[-–]\s*\d{1,3}[A-Z]{0,2})?', c): continue
                n = num(c)
                if (last_no == 0 and n <= 5) or (last_no < n <= last_no + 25) or (n == last_no and re.search(r'[A-Z]$', c)):
                    rno = c; break
            if rno:
                cur = {'b': book, 'r': rno, 'ch': ch, 'sec': sec, 'ap': ap, 'p': page, 't': [m.group(2).strip()]}
                out.append(cur); page_entries.append(cur); last_no = top(rno)
                continue
        m2 = re.match(r'^\s*\**\s*(\d{1,3})\s+([A-Z][a-z].*)$', l)   # rule number printed without its full stop
        if m2 and int(m2.group(1)) == last_no + 1 and last_no > 0:
            cur = {'b': book, 'r': m2.group(1), 'ch': ch, 'sec': sec, 'ap': ap, 'p': page, 't': [m2.group(2).strip()]}
            out.append(cur); page_entries.append(cur); last_no += 1
            continue
        if cur is None:
            continue
        cur['t'].append(l.strip())
    flush_short(); end_page()
    for e in out:
        t = ' '.join(e['t'])
        t = re.sub(r'\s+', ' ', t).replace(' ,', ',').replace(' ;', ';').strip()
        e['t'] = t
        e['h'] = re.sub(r'\s+', ' ', e.get('h', '')).strip()
    return out


def main():
    a = parse(sys.argv[1], 'I')
    b = parse(sys.argv[2], 'II')
    allr = a + b
    js = '// West Bengal Service Rules Part I & Part II, split rule by rule (generated by scripts/build-rules.py - do not edit).\nwindow.WBSR = ' + json.dumps(allr, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(sys.argv[3], 'w', encoding='utf-8').write(js)
    print('Part I', len(a), 'Part II', len(b), 'bytes', len(js))


if __name__ == '__main__':
    main()
