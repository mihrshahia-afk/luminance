import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, Search, Download } from 'lucide-react';
import { getAllLetters, runAutoDiscovery } from '../data/letterDiscovery';
import type { LetterEntry } from '../data/letterIndex';
import { isLetterCached } from '../data/letterFetcher';

export default function LettersPage() {
  const [filter, setFilter] = useState('');
  const [allLetters, setAllLetters] = useState<LetterEntry[]>(() => getAllLetters());

  useEffect(() => {
    runAutoDiscovery().then(({ found }) => {
      if (found > 0) setAllLetters(getAllLetters());
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
    <div className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ScrollText size={22} className="text-[#0B4F6C]" />
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0B4F6C] m-0">Universal House of Justice Letters</h1>
        </div>
        <p className="text-sm text-[#6B7280] m-0 ml-9">
          {allLetters.length} letters from 1963 to present — the complete record since the House of Justice was first established
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter letters..."
          className="w-full pl-10 pr-4 py-2.5 border border-[#E5DDD0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#C9A84C] text-[#2D2D2D] placeholder-[#9CA3AF]"
        />
      </div>

      {/* Letter list — 2 cols on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(letter => {
          const cached = isLetterCached(letter.id);
          return (
            <Link
              key={letter.id}
              to={`/letters/${letter.urlCode}`}
              className="bg-white rounded-xl p-5 border border-[#E5DDD0] no-underline hover:shadow-md hover:border-[#C9A84C]/40 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#2D2D2D] m-0 mb-1 group-hover:text-[#0B4F6C] transition-colors line-clamp-2">
                    {letter.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] m-0 truncate">{letter.recipient}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  {!cached && (
                    <Download size={13} className="text-[#C9A84C]" />
                  )}
                  <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
                    {formatDate(letter.date)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#6B7280] mt-10">No letters match your search.</p>
      )}
    </div>
  );
}
