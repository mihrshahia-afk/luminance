"""Scan release-the-sun.json for OCR error patterns."""
import json
import re
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/Admin/bahai-library/public/books/release-the-sun.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

patterns = [
    (r"'AH\b", "'AH for 'Alí"),
    (r'\b\d+[A-Z][a-z]+', 'digit-letter garble'),
    (r'\bVa[hf][íi]?d?\b', 'Vahid variants (broken)'),
    (r'\bV[a]?[h][f]d?\b', 'Vahfd'),
    (r'[A-Za-z]\\[A-Za-z]', 'backslash inside word'),
    (r'\bf[íi]\s+[A-Z]', 'orphan fí'),
    (r'\bMull[áa]\s+f[íi]', 'Mullá fí'),
    (r'Bah[áa][íi]?\s*\\', 'Bahá backslash'),
    (r'\b[A-Za-z]\.[a-z]{2,}', 'period inside word'),
    (r'\bH[a-z]j[íi]\b', "Hájí variants"),
    (r'1[A-Z][a-z]', '1 prefix instead of letter'),
    (r'0[A-Z][a-z]', '0 prefix instead of letter'),
]

for chap_id in ['foreword', 'prologue'] + [str(i) for i in range(1, 20)]:
    if chap_id not in data:
        continue
    content = data[chap_id]['content']
    title = data[chap_id]['title']
    print(f'\n=== Chapter {chap_id}: {title} ===')
    found_any = False
    for pat, desc in patterns:
        matches = list(re.finditer(pat, content))
        if matches:
            print(f'  [{desc}] count={len(matches)}')
            for m in matches[:3]:
                start = max(0, m.start()-40)
                end = min(len(content), m.end()+40)
                snippet = content[start:end].replace('\n', ' ')
                print(f'      ...{snippet}...')
            found_any = True
    if not found_any:
        print('  (no obvious patterns found)')
