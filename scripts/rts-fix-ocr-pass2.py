"""Pass 2: clean up remaining OCR errors in release-the-sun.json."""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'C:/Users/Admin/bahai-library/public/books/release-the-sun.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

FIXES = [
    # Brace artifacts (OCR mis-read of á)
    (r"Qurb\{m", "Qurbán", "Qurb{m -> Qurbán"),
    (r"Qurbán[\- ]'AH", "Qurbán-‘Alí", "Qurbán 'AH -> Qurbán-'Alí"),
    # Stray brace á
    (r"\{m\b", "án", "{m -> án (Persian á+n OCR error)"),

    # Bracketed and edge 'AH cases
    (r"\['AH\]", "[‘Alí]", "['AH] -> ['Alí]"),
    (r"Mírzá Siyyid\s+'AH\b", "Mírzá Siyyid ‘Alí", "Mírzá Siyyid 'AH (with extra space)"),
    (r"Muḥammad-'AH\b", "Muḥammad-‘Alí", "Muḥammad-'AH -> Muḥammad-‘Alí"),

    # Catch-all final pass
    (r"\b'AH\b", "‘Alí", "stray 'AH -> 'Alí"),
]

per_pattern = {}
for chap_id in list(data.keys()):
    if chap_id == '__chapters':
        continue
    if not isinstance(data[chap_id], dict) or 'content' not in data[chap_id]:
        continue
    content = data[chap_id]['content']
    for pat, repl, desc in FIXES:
        new_content, n = re.subn(pat, repl, content)
        if n:
            per_pattern[desc] = per_pattern.get(desc, 0) + n
            content = new_content
    data[chap_id]['content'] = content

print('Pass 2 fix counts:')
for desc, n in sorted(per_pattern.items(), key=lambda x: -x[1]):
    print(f'  {n:4}  {desc}')
print(f'\nTotal: {sum(per_pattern.values())}')

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
