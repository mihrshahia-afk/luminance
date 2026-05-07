"""Pass 4: final cleanup."""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'C:/Users/Admin/bahai-library/public/books/release-the-sun.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

FIXES = [
    # H/f confusions in last spots
    (r"<Abbas-QuHKhan himseH", "‘Abbás-Qulí Khán himself", "<Abbas-QuHKhan himseH"),
    (r"<Abbas-QuH ?Khan", "‘Abbás-Qulí Khán", "<Abbas-QuH Khan"),
    (r"\bAbbas-Quli\b", "‘Abbás-Qulí", "Abbas-Quli -> ‘Abbás-Qulí"),
    (r"himseH\b", "himself", "himseH -> himself"),
    (r"\bquH\b", "qulí", "quH -> qulí"),

    # In case any hyphen-broken Bab/Báb cases remain after rejoin
    (r"\bRefer- ence\b", "Reference", "Refer- ence"),

    # Stray center dot near letters
    (r"·([A-Za-z])", r"\1", "stray center dot before letter"),
    (r"([A-Za-z])·", r"\1", "stray center dot after letter"),
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

print('Pass 4 fix counts:')
for desc, n in sorted(per_pattern.items(), key=lambda x: -x[1]):
    print(f'  {n:4}  {desc}')
print(f'\nTotal: {sum(per_pattern.values())}')

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
