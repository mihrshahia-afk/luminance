"""Pass 3: comprehensive OCR cleanup for release-the-sun.json."""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

PATH = 'C:/Users/Admin/bahai-library/public/books/release-the-sun.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Order matters!
FIXES = [
    # 1. ABRlZ / TABARSi running headers and similar (must run BEFORE word repairs)
    # Match all-caps chapter-title fragments followed by page number, e.g.:
    #   "  THE SCOURGING AT TABRiz 73 with"
    #   "  THE MASSACRE AT THE FORT OF SHAYKH TABARSi 87 courage"
    #   "  THE TUMULT IN TABRiz 63 such"
    #   "  THE DEATH OF THE WISEST PERSIAi:J 125 the"
    (r"\s+(?:THE\s+)?[A-Z][A-Z' ]{8,}(?:TABRiz|T ABRlZ|TABARSi|PERSIAi:J|TABRfZ)\s+\d+\s+",
     " ", "Remove embedded chapter-page running headers"),

    # 2. Specific OCR garbles for proper nouns
    (r"\bTabrfz\b", "Tabríz", "Tabrfz -> Tabríz"),
    (r"\bChirfq\b", "Chihríq", "Chirfq -> Chihríq"),
    (r"\bUrumfyyih\b", "Urúmíyyih", "Urumfyyih -> Urúmíyyih"),
    (r"\bMuhft\b", "Muḥíṭ", "Muhft -> Muḥíṭ"),
    (r"\bHajf\b", "Ḥájí", "Hajf -> Ḥájí"),
    (r"\bBabu1-Bab\b", "Bábu'l-Báb", "Babu1-Bab -> Bábu'l-Báb"),
    (r"\bIsma'il\b", "Ismá‘íl", "Isma'il -> Ismá‘íl"),

    # 3. l\1ulla / l\\1ulla -> Mullá
    (r"l\\1ulla", "Mullá", "l\\1ulla -> Mullá"),

    # 4. Restore bad ligature OCR (lf -> IB)
    (r"\benguIBng\b", "engulfing", "enguIBng -> engulfing"),
    (r"\bsacrIBce\b", "sacrifice", "sacrIBce -> sacrifice"),
    (r"\bs·uperb\b", "superb", "s·uperb -> superb"),
    (r":figure", "figure", ":figure -> figure"),

    # 5. Standalone Bab -> Báb (after specific names handled above)
    (r"\bBab\b", "Báb", "Bab -> Báb"),

    # 6. Hyphen-line-break artifacts: rejoin words split by "- "
    # Conservative: only when both sides are lowercase letters of length>=2.
    (r"\b([a-z]{2,})-\s+([a-z]{2,})\b", r"\1\2", "Rejoin hyphen-broken words"),

    # 7. Collapse multiple spaces created by removals
    (r"  +", " ", "Collapse double-spaces"),
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

print('Pass 3 fix counts:')
for desc, n in sorted(per_pattern.items(), key=lambda x: -x[1]):
    print(f'  {n:5}  {desc}')
print(f'\nTotal: {sum(per_pattern.values())}')

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
