import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, Search, Download, MessageSquare } from 'lucide-react';
import { getAllLetters, runAutoDiscovery } from '../data/letterDiscovery';
import type { LetterEntry } from '../data/letterIndex';
import { isLetterCached } from '../data/letterFetcher';
import { useApp } from '../context/AppContext';
import { SkeletonCard } from '../components/Skeleton';

export default function LettersPage() {
  const { getAnnotationsForDocument } = useApp();
  const [filter, setFilter] = useState('');
  const [allLetters, setAllLetters] = useState<LetterEntry[]>(() => getAllLetters());
  const [discovering, setDiscovering] = useState(true);

  useEffect(() => {
    runAutoDiscovery().then(({ found }) => {
      if (found > 0) setAllLetters(getAllLetters());
      setDiscovering(false);
    });
  }, []);

  const filtered = allLetters
    .filter(l =>
      l.title.toLowerCase().includes(filter.toLowerCase()) ||
      l.recipient.toLowerCase().includes(filter.toLowerCase()) ||
      l.date.includes(filter)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto stagger-enter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ScrollText size={22} className="text-heading" />
          <h1 className="page-title text-xl sm:text-2xl">Universal House of Justice Letters</h1>
        </div>
        <p className="text-sm text-secondary m-0 ml-9 font-body">
          {allLetters.length} letters from 1963 to present &mdash; the complete record since the House of Justice was first established
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter letters..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-input-bg focus:outline-none focus:border-gold font-body"
        />
      </div>

      {/* Loading skeleton */}
      {discovering && allLetters.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Letter list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(letter => {
          const cached = isLetterCached(letter.id);
          const noteCount = getAnnotationsForDocument(letter.id).length;
          return (
            <Link
              key={letter.id}
              to={`/letters/${letter.urlCode}`}
              className="card-elevated p-5 border border-border no-underline hover:border-gold/40 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-primary m-0 mb-1 group-hover:text-heading transition-colors line-clamp-2 font-body">
                    {letter.title}
                  </h3>
                  <p className="text-xs text-secondary m-0 truncate font-body">{letter.recipient}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {noteCount > 0 && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[0.55rem] font-body font-bold"
                      style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                      {noteCount}
                      <MessageSquare size={9} />
                    </span>
                  )}
                  {!cached && (
                    <Download size={13} className="text-gold" />
                  )}
                  <span className="text-xs text-muted whitespace-nowrap font-body">
                    {formatDate(letter.date)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && !discovering && (
        <div className="text-center mt-16">
          <ScrollText size={48} className="text-border mx-auto mb-4" />
          <p className="text-muted font-body">No letters match your search.</p>
        </div>
      )}
    </div>
  );
}
