import { Link } from 'react-router-dom';
import { bookConfigs } from '../data/bookConfig';

const categoryMeta: Record<string, { label: string; color: string }> = {
  bahaullah:  { label: "Bahá'u'lláh",   color: 'var(--text-heading)' },
  abdulbaha:  { label: "'Abdu'l-Bahá",  color: '#7D9B8A' },
  other:      { label: 'Other Authors', color: 'var(--text-author)' },
};

const categoryOrder = ['bahaullah', 'abdulbaha', 'other'];

export default function BooksPage() {
  const grouped = categoryOrder.map(cat => ({
    cat,
    ...categoryMeta[cat],
    items: bookConfigs.filter(b => b.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '0.6rem',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          color: '#C9A84C', margin: '0 0 0.5rem',
        }}>
          Sacred Writings
        </p>
        <h1 style={{
          fontFamily: 'Crimson Pro, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 300, color: 'var(--text-heading)', margin: '0 0 0.25rem', letterSpacing: '0.02em',
        }}>
          Sacred Texts
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {bookConfigs.length} books in your library
        </p>
      </div>

      {grouped.map(({ cat, label, color, items }) => (
        <div key={cat} style={{ marginBottom: '3rem' }}>

          {/* Category header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 20, height: 1, background: color, opacity: 0.7 }} />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color, fontWeight: 600,
            }}>
              {label}
            </span>
            <div style={{ flex: 1, height: 1, background: `${color}22` }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(book => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                style={{
                  display: 'flex',
                  background: 'var(--bg-card)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px var(--card-shadow-hover)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px var(--card-shadow)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Spine accent */}
                <div style={{ width: '4px', background: `linear-gradient(to bottom, ${color}, ${color}55)`, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: '1.25rem 1.375rem' }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.6rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color, margin: '0 0 0.4rem', fontWeight: 500,
                  }}>
                    {book.author}
                  </p>
                  <h3 style={{
                    fontFamily: 'Crimson Pro, serif',
                    fontSize: '1.1rem', fontWeight: 600,
                    color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.3,
                  }}>
                    {book.title}
                  </h3>
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--text-secondary)',
                    margin: '0 0 0.75rem', lineHeight: 1.55,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>
                    {book.description}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#B0B8C1', margin: 0 }}>
                    {book.seedChapters.length}+ chapters
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
