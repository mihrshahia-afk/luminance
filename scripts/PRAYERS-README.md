# Adding prayers to the app

The `prayers.ts` file currently holds the prayers that have been verified to exist
on bahaiprayers.org. To add more prayers from the three approved sources
(`bahaiprayers.org`, `bahai.org/library/authoritative-texts/prayers/`,
`thebahaiprayers.com`), use the workflow below.

## Quick path: scrape from bahaiprayers.org

The two scripts already exist:

1. **Index scraper** — already run; output at `scripts/prayers-index.json` (288 entries)
   ```bash
   node scripts/scrape-prayers-index.mjs
   ```

2. **Per-prayer content fetcher** — run on your own machine:
   ```bash
   node scripts/scrape-prayers-content.mjs
   ```
   This fetches all 288 prayer pages (about 4–5 minutes at the throttled rate)
   and writes structured prayer data to `scripts/prayers-content.json`. Resumes
   automatically if interrupted.

   Each entry looks like:
   ```json
   {
     "category": "Healing",
     "subcategory": null,
     "firstLineOrTitle": "Thy name is my healing...",
     "url": "https://www.bahaiprayers.org/healing1.htm",
     "slug": "healing1",
     "title": "...",
     "author": "Bahá'u'lláh",
     "rubric": null,
     "paragraphs": ["...", "..."]
   }
   ```

## Picking what to add

Open `scripts/prayers-content.json` in a JSON viewer or filter by category.
The bahaiprayers.org categories don't 1:1 match the app's topics — see the
mapping table below for how to map them.

| bahaiprayers.org category   | App topic            |
| --------------------------- | -------------------- |
| Obligatory Prayers          | Obligatory Prayers   |
| Morning                     | Morning              |
| Evening                     | Evening              |
| Praise and Gratitude        | Praise & Gratitude   |
| Aid and Assistance          | Reliance on God      |
| Tests and Difficulties      | Tests & Difficulties |
| Trials                      | Tests & Difficulties |
| Steadfastness               | Steadfastness        |
| Forgiveness                 | Forgiveness          |
| Detachment                  | Detachment           |
| Protection                  | Protection           |
| Healing                     | Healing              |
| Spiritual Growth            | Knowledge & Wisdom   |
| Teaching                    | Teaching             |
| Prayers for Teaching ...    | Service & Teaching   |
| Triumph of the Cause        | Service & Teaching   |
| Children                    | Children             |
| Marriage                    | Marriage             |
| The Departed                | Departed Souls       |
| The Fast / Naw-Rúz / Riḍván | Holy Days            |
| Special Tablets             | Special Tablets      |

## Integrating the prayers into the app

Once you have `scripts/prayers-content.json` with the prayers you want, run:

```bash
node scripts/integrate-prayers.mjs
```

(I'll write this script when you're ready — it reads the JSON, maps categories
to topics, joins paragraphs into `text` with `\n\n` separators, generates IDs,
and appends to `src/data/prayers.ts`.)

If you'd rather pick prayers manually, copy entries one at a time:

```ts
{
  id: 'healing-1',                   // unique within the file
  topic: 'Healing',                  // must be a value in PrayerTopic
  title: 'Thy name is my healing',   // optional; only set if there's a real title
  author: "Bahá'u'lláh",
  text: 'O God, my God! Thy name…\n\n…',  // paragraphs joined with \n\n
}
```

## Other approved sources

- **bahai.org**: `https://www.bahai.org/library/authoritative-texts/prayers/bahai-prayers/{2,3,4,5}` —
  the official compilation, paginated. No scraper exists yet.
- **thebahaiprayers.com**: `https://www.thebahaiprayers.com/subject/{slug}` —
  alphabetical subject index. No scraper exists yet.

If you want, I can write scrapers for these on request.

## How verification worked (for reference)

The current 112 prayers are the subset of the previous 263 that matched
content on bahaiprayers.org. The verifier:

1. Cached every bahaiprayers.org prayer page locally.
2. For each prayer in `prayers.ts`, picked five distinctive 6–8-word phrases
   from different positions in the prayer.
3. Searched the corpus for any of those phrases as an exact substring (after
   normalising punctuation, case, and diacritics).
4. Marked the prayer VERIFIED if any phrase matched, UNVERIFIED otherwise.

The 151 unverified prayers were removed because they were either fabricated
or came from a source not yet indexed. Re-add the latter via the workflow above.
