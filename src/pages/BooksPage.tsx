import { bookConfigs } from '../data/bookConfig';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import type { TranslationStrings } from '../locales/translations';

function getCategoryMeta(t: TranslationStrings): Record<string, { label: string; color: string }> {
  return {
    bahaullah:     { label: t.catBahaullah,     color: '#0B4F6C' },
    abdulbaha:     { label: t.catAbdulBaha,     color: '#7D9B8A' },
    shoghieffendi: { label: t.catShoghiEffendi, color: '#6B5B8A' },
    thebab:        { label: t.catTheBab,        color: '#C9A84C' },
    other:         { label: t.catOther,         color: '#8B6F47' },
  };
}

const categoryOrder = ['bahaullah', 'abdulbaha', 'shoghieffendi', 'thebab', 'other'];

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const isComplete = percent >= 100;

  return (
    <div className="progress-ring-wrapper group/ring relative shrink-0">
      <svg width="38" height="38" viewBox="0 0 38 38" className="block">
        {/* Background track */}
        <circle cx="19" cy="19" r={r} fill="none" stroke="var(--border)" strokeWidth="2.5" />
        {/* Progress arc */}
        <circle
          cx="19" cy="19" r={r}
          fill="none"
          stroke={isComplete ? '#C9A84C' : color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 19 19)"
          className="transition-all duration-500 ease-out"
          style={{
            filter: 'drop-shadow(0 0 0px transparent)',
          }}
        />
      </svg>
      {/* Percent text in center */}
      <span className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-body font-medium transition-all duration-300"
        style={{ color: isComplete ? '#C9A84C' : 'var(--text-muted)' }}>
        {Math.round(percent)}%
      </span>
    </div>
  );
}

export default function BooksPage() {
  const { getBookProgress, t } = useApp();
  const categoryMeta = getCategoryMeta(t);

  const grouped = categoryOrder.map(cat => ({
    cat,
    ...categoryMeta[cat],
    items: bookConfigs.filter(b => b.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto stagger-enter">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label">{t.booksLibrary}</p>
        <h1 className="page-title text-[clamp(1.8rem,4vw,2.6rem)]">{t.booksTitle}</h1>
        <p className="text-sm text-muted m-0">{bookConfigs.length} {t.booksInLibrary}</p>
      </div>

      {grouped.map(({ cat, label, color, items }) => (
        <div key={cat} className="mb-12">
          {/* Category header */}
          <div className="category-divider" style={{ color }}>
            <span>{label}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(book => {
              const progress = getBookProgress(book.id);
              // Use current seedChapters as the source of truth for total count
              const totalCh = book.seedChapters.length;
              // Only count chapters that exist in current book config
              const currentChapterIds = new Set(book.seedChapters.map(c => c.id));
              const validRead = progress
                ? progress.chaptersRead.filter(id => currentChapterIds.has(id)).length
                : 0;
              const pct = totalCh > 0 ? Math.min(100, Math.round((validRead / totalCh) * 100)) : 0;

              return (
                <Card key={book.id} to={`/books/${book.id}`} accentColor={color} accentPosition="left">
                  <div className="p-5 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[0.6rem] tracking-[0.2em] uppercase font-medium m-0 mb-1.5" style={{ color }}>
                        {book.author}
                      </p>
                      <h3 className="font-display text-[1.15rem] font-semibold text-primary m-0 mb-2 leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-sm text-secondary m-0 mb-3 leading-relaxed line-clamp-2">
                        {book.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-[0.7rem] text-muted m-0 font-body">
                          {totalCh} {totalCh === 1 ? t.booksChapter : t.booksChapters}
                        </p>
                        {validRead > 0 && (
                          <p className="text-[0.65rem] text-muted/60 m-0 font-body">
                            {validRead}/{totalCh} {t.booksRead}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Progress ring */}
                    <ProgressRing percent={pct} color={color} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
