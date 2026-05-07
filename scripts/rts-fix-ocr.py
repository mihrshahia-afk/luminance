"""Fix OCR errors in release-the-sun.json."""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'C:/Users/Admin/bahai-library/public/books/release-the-sun.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Each entry: (regex pattern, replacement, description)
# Order matters - more specific patterns first.
FIXES = [
    # Composite name fixes (most specific first)
    (r"Mírzá ([A-Za-z]+ )?Siyyid 'AH\b", r"Mírzá \1Siyyid 'Alí", "Mírzá Siyyid 'AH -> 'Alí"),
    (r"Siyyid 'AH-Mu[hḥ]ammad\b", "Siyyid 'Alí-Muḥammad", "Siyyid 'AH-Muhammad -> 'Alí-Muḥammad"),
    (r"Mírzá 'AH-Asghar", "Mírzá ‘Alí-Aṣghar", "Mírzá 'AH-Asghar -> 'Alí-Aṣghar"),
    (r"'AH-Asghar", "‘Alí-Aṣghar", "'AH-Asghar -> 'Alí-Aṣghar"),
    (r"Mihr[- ]'AH Kh[aá]n", "Mihr-‘Alí Khán", "Mihr 'AH Khan -> Mihr-'Alí Khán"),
    (r"Qurban[- ]'AH", "Qurbán-‘Alí", "Qurban-'AH -> Qurbán-'Alí"),
    (r"Mu[hḥ]am[- ]?mad-'AH", "Muḥammad-‘Alí", "Muhammad-'AH -> Muḥammad-‘Alí"),
    (r"Ḥusayn 'AH\b", "Ḥusayn-‘Alí", "Ḥusayn 'AH -> Ḥusayn-'Alí"),
    (r"'AH-Askar", "‘Alí-‘Askar", "'AH-Askar -> 'Alí-'Askar"),
    (r"'AH[- ]Khan", "‘Alí Khán", "'AH Khan -> 'Alí Khán"),
    (r"'AH l\\?1uhammad", "‘Alí-Muḥammad", "'AH l1uhammad -> 'Alí-Muḥammad"),
    (r"~1ulla 'AH", "Mullá ‘Alí", "~1ulla 'AH -> Mullá 'Alí"),
    (r":t-\.1ulla", "Mullá", ":t-.1ulla -> Mullá"),
    (r"11ulla 'AH", "Mullá ‘Alí", "11ulla 'AH -> Mullá 'Alí"),
    (r"Mullá[ ]?'AH(?:,)?Mullá", "Mullá ‘Alí, Mullá", "Mullá'AH,Mullá -> Mullá 'Alí, Mullá"),
    (r"Mullá 'AH\b", "Mullá ‘Alí", "Mullá 'AH -> Mullá 'Alí"),

    # Generic OCR garbles for Mullá / Muḥammad
    (r":Mullá\b", "Mullá", ":Mullá -> Mullá"),
    (r"\bl\\fulla\b", "Mullá", "l\\fulla -> Mullá"),
    (r"\bl\\1uhammad\b", "Muḥammad", "l\\1uhammad -> Muḥammad"),
    (r":Muḥammad\b", "Muḥammad", ":Muḥammad -> Muḥammad"),
    (r"~1uhammad", "Muḥammad", "~1uhammad -> Muḥammad"),

    # Vaḥíd OCR errors
    (r"\bVahfd\b", "Vaḥíd", "Vahfd -> Vaḥíd"),
    (r"\bVahíd\b", "Vaḥíd", "Vahíd (no dot) -> Vaḥíd"),
    (r"\bVah\.id\b", "Vaḥíd", "Vah.id -> Vaḥíd"),

    # Nayríz
    (r"\bNayrfz\b", "Nayríz", "Nayrfz -> Nayríz"),

    # Manúchihr / Khán
    (r"\bManuchihr Khan\b", "Manúchihr Khán", "Manuchihr Khan -> Manúchihr Khán"),
    (r"\bManuchihr\b", "Manúchihr", "Manuchihr -> Manúchihr"),

    # Raḍaví
    (r"\bRaduvf\b", "Raḍaví", "Raduvf -> Raḍaví"),

    # Period inside words
    (r"\bl\.ast\b", "last", "l.ast -> last"),

    # Missing space artifacts
    (r"Askarwould", "Askar would", "Askarwould -> Askar would"),

    # Hyphenation artifacts (line break leftovers)
    (r"Muham- mad", "Muḥammad", "Muham- mad -> Muḥammad"),

    # Tidy any remaining stray 'AH that we haven't caught (be cautious)
    # Leaving these last for safety.
    (r"\b'AH\b", "‘Alí", "stray 'AH -> 'Alí"),
]

total_changes = 0
per_pattern = {}

for chap_id in list(data.keys()):
    if chap_id == '__chapters':
        continue
    if not isinstance(data[chap_id], dict) or 'content' not in data[chap_id]:
        continue
    content = data[chap_id]['content']
    original = content
    for pat, repl, desc in FIXES:
        new_content, n = re.subn(pat, repl, content)
        if n:
            per_pattern[desc] = per_pattern.get(desc, 0) + n
            content = new_content
    if content != original:
        # Count total changes
        total_changes += sum(1 for a, b in zip(original, content) if a != b) // 1  # rough
        data[chap_id]['content'] = content

print('Fix counts by pattern:')
for desc, n in sorted(per_pattern.items(), key=lambda x: -x[1]):
    print(f'  {n:4}  {desc}')
print(f'\nTotal patterns matched: {sum(per_pattern.values())}')

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nWrote updated file to {PATH}')
