"""Final scan for remaining OCR errors."""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'C:/Users/Admin/bahai-library/public/books/release-the-sun.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# More patterns
patterns = [
    (r"'AH", "'AH still exists"),
    (r"Vahfd", "Vahfd"),
    (r"Vah\.id", "Vah.id"),
    (r"\{m", "{m brace artifact"),
    (r"\bf[íi]\s+[A-Z]", "orphan fí"),
    (r"l\\[a-z0-9]", "l\\X garble"),
    (r"\bIs[hḥ]aq\b|\bIs[hḥ]raq", "Ishraq variants"),
    (r"\bMull[áa]\s+[bcdfgjklmpqrstvwxz]\.\s", "Mullá X. (single letter)"),
    (r"\bManuchihr\b", "Manuchihr without dot"),
    (r"\bNayriz\b|\bNayrfz\b", "Nayriz without dot"),
    (r"\bShira[zs]\b", "Shiraz without dot"),
    (r"\bIsfahan\b", "Isfahan without dot"),
    (r"\bMashhad\b(?!\s+[A-Z])", "Mashhad - check context"),
    (r"\bTabrlz\b|\bTabrfz\b", "Tabriz OCR variants"),
    (r"\bBab\b(?=[\s,.])", "Bab without dot - context check"),
    (r"\b[A-Za-z]+\\f[a-z]+\b", "X\\fY backslash"),
    (r"  +", "double-space (formatting)"),
    (r"\b[a-z]{2,}-\s+[a-z]", "hyphen-line-break artifact (X- y)"),
    (r"\b[a-z]\d[a-z]\b", "letter-digit-letter (typo?)"),
    (r"[A-Za-z][A-Z][a-z]", "weird capitalization (CamelCase mid-word)"),
    (r"\bḤusayn[- ]'Alí?\b", "OK form"),
]

# Skip "OK form"
for chap_id in ['foreword', 'prologue'] + [str(i) for i in range(1, 20)]:
    if chap_id not in data:
        continue
    content = data[chap_id]['content']
    title = data[chap_id]['title']
    findings = []
    for pat, desc in patterns:
        if 'OK form' in desc:
            continue
        matches = list(re.finditer(pat, content))
        if matches:
            findings.append((desc, matches))
    if findings:
        print(f'\n=== Chapter {chap_id}: {title} ===')
        for desc, matches in findings:
            print(f'  [{desc}] count={len(matches)}')
            for m in matches[:2]:
                start = max(0, m.start()-50)
                end = min(len(content), m.end()+50)
                snippet = content[start:end].replace('\n', ' ')
                print(f'      ...{snippet}...')
