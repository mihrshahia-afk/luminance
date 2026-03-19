import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Heart, ScrollText } from 'lucide-react';
import { books } from '../data/books';
import { prayers } from '../data/prayers';
import { letterIndex } from '../data/letterIndex';
import { getLettersAsUHJ } from '../data/letterFetcher';

// ─── 9-pointed star ──────────────────────────────────────────────────────────

function NineStar({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50,2 56.8,31.2 80.9,13.2 67.3,40 97.3,41.7 69.7,53.5 91.6,74 62.9,65.3 66.4,95.1 50,70 33.6,95.1 37.1,65.3 8.4,74 30.3,53.5 2.7,41.7 32.7,40 19.1,13.2 43.2,31.2" />
    </svg>
  );
}

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = {
  aurora: {
    label: 'Aurora',
    swatch: '#083D54',
    header: 'bg-gradient-to-br from-[#031824] via-[#062D3F] to-[#0B5075]',
    title: 'text-[#E8D5A0]',
    subtitle: 'text-[#7BAFC4]',
    inputBg: 'bg-white',
    inputText: 'text-[#1a1a1a]',
    inputBorder: 'border-transparent focus:border-[#C9A84C]',
    iconColor: 'text-[#9CA3AF]',
    placeholderColor: 'text-[#9CA3AF]',
    activeFilter: 'bg-white text-[#083D54] font-semibold shadow-sm',
    inactiveFilter: 'text-white/60 border border-white/20 hover:text-white hover:border-white/50',
    starColor: 'text-white',
  },
  parchment: {
    label: 'Parchment',
    swatch: '#F5ECD7',
    header: 'bg-gradient-to-br from-[#F9F1E2] to-[#F0E4C8] border-b-2 border-[#C9A84C]',
    title: 'text-[#083D54]',
    subtitle: 'text-[#6B7280]',
    inputBg: 'bg-white border border-[#C9A84C]/50 focus-within:border-[#C9A84C]',
    inputText: 'text-[#2D2D2D]',
    inputBorder: 'border-transparent',
    iconColor: 'text-[#C9A84C]',
    placeholderColor: 'text-[#B0A090]',
    activeFilter: 'bg-[#083D54] text-white font-semibold shadow-sm',
    inactiveFilter: 'text-[#6B7280] border border-[#C9A84C]/40 hover:border-[#C9A84C] hover:text-[#083D54]',
    starColor: 'text-[#C9A84C]',
  },
  midnight: {
    label: 'Midnight',
    swatch: '#060D1C',
    header: 'bg-gradient-to-br from-[#020810] via-[#060D1C] to-[#0A1428]',
    title: 'text-[#D4AF6A]',
    subtitle: 'text-[#6B8AA0]',
    inputBg: 'bg-white/8 border border-white/15 backdrop-blur-md',
    inputText: 'text-white',
    inputBorder: 'border-transparent focus:border-[#C9A84C]/60',
    iconColor: 'text-white/40',
    placeholderColor: 'text-white/35',
    activeFilter: 'bg-[#C9A84C] text-[#060D1C] font-semibold shadow-sm',
    inactiveFilter: 'text-white/50 border border-white/15 hover:border-[#C9A84C]/50 hover:text-[#C9A84C]',
    starColor: 'text-[#C9A84C]',
  },
} as const;

type ThemeKey = keyof typeof THEMES;
type Source = 'all' | 'books' | 'prayers' | 'letters';

// ─── Animated placeholder suggestions ────────────────────────────────────────

const suggestions = [
  'justice', 'unity', 'love', 'gratitude', 'patience',
  'wisdom', 'prayer', 'service', 'light', 'peace',
  'kindness', 'faith', 'certitude', 'detachment', 'radiance',
  'courage', 'joy', 'humility', 'compassion', 'truth',
  'forgiveness', 'steadfastness', 'beauty', 'knowledge', 'hope',
];

// ─── Highlight helper ─────────────────────────────────────────────────────────

function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-[#C9A84C]/25 text-inherit rounded px-0.5">$1</mark>');
}

function getExcerpt(text: string, query: string, radius = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2) + '…';
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

// ─── Search result types ──────────────────────────────────────────────────────

interface SearchResult {
  type: 'book' | 'prayer' | 'letter';
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  link: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<Source>('all');
  const [theme, setTheme] = useState<ThemeKey>('aurora');
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = THEMES[theme];

  // Cycle placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionVisible(false);
      setTimeout(() => {
        setSuggestionIdx(i => (i + 1) % suggestions.length);
        setSuggestionVisible(true);
      }, 600);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const hits: SearchResult[] = [];

    if (source === 'all' || source === 'books') {
      for (const book of books) {
        for (const ch of book.chapters) {
          const plain = ch.content.replace(/<[^>]+>/g, '');
          if (plain.toLowerCase().includes(q)) {
            hits.push({
              type: 'book',
              id: `${book.id}-${ch.id}`,
              title: book.title,
              subtitle: ch.title,
              excerpt: getExcerpt(plain, query),
              link: `/books/${book.id}/${ch.id}`,
            });
          }
        }
      }
    }

    if (source === 'all' || source === 'prayers') {
      for (const prayer of prayers) {
        if (prayer.text.toLowerCase().includes(q) || prayer.topic.toLowerCase().includes(q)) {
          hits.push({
            type: 'prayer',
            id: prayer.id,
            title: prayer.title || prayer.topic,
            subtitle: prayer.author,
            excerpt: getExcerpt(prayer.text, query),
            link: `/prayers/${prayer.id}`,
          });
        }
      }
    }

    if (source === 'all' || source === 'letters') {
      const cached = getLettersAsUHJ();
      for (const letter of cached) {
        const plain = letter.content ? letter.content.replace(/<[^>]+>/g, '') : '';
        const titleMatch = letter.title.toLowerCase().includes(q) || letter.recipient.toLowerCase().includes(q);
        const contentMatch = plain.toLowerCase().includes(q);
        if (titleMatch || contentMatch) {
          const entry = letterIndex.find(e => e.id === letter.id);
          hits.push({
            type: 'letter',
            id: letter.id,
            title: letter.title,
            subtitle: letter.date,
            excerpt: contentMatch ? getExcerpt(plain, query) : letter.recipient,
            link: `/letters/${entry?.urlCode || letter.id}`,
          });
        }
      }
    }

    return hits;
  }, [query, source]);

  const typeConfig = {
    book:   { icon: BookOpen,   color: '#0B4F6C', border: 'border-l-[#0B4F6C]', badge: 'bg-[#0B4F6C]/8 text-[#0B4F6C]', label: 'Book' },
    prayer: { icon: Heart,      color: '#7D9B8A', border: 'border-l-[#7D9B8A]', badge: 'bg-[#7D9B8A]/10 text-[#6B8A78]', label: 'Prayer' },
    letter: { icon: ScrollText, color: '#8B6F47', border: 'border-l-[#8B6F47]', badge: 'bg-[#8B6F47]/8 text-[#7A6040]', label: 'Letter' },
  };

  const sources: { key: Source; label: string; icon: typeof BookOpen }[] = [
    { key: 'all',     label: 'All Sources', icon: Search },
    { key: 'books',   label: 'Books',       icon: BookOpen },
    { key: 'prayers', label: 'Prayers',     icon: Heart },
    { key: 'letters', label: 'Letters',     icon: ScrollText },
  ];

  return (
    <div className="flex-1 flex flex-col w-full">

      {/* ── Hero Header ── */}
      <div className={`relative overflow-hidden w-full ${t.header} pt-8 pb-10 px-4`}>

        {/* Background star watermark — large, centre-right */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <NineStar className={`w-72 h-72 md:w-96 md:h-96 ${t.starColor} opacity-[0.05]`} />
        </div>
        {/* Small accent star — top-left */}
        <div className="absolute -left-6 -top-6 pointer-events-none select-none">
          <NineStar className={`w-32 h-32 ${t.starColor} opacity-[0.06]`} />
        </div>
        {/* Tiny accent star — bottom-right corner */}
        <div className="absolute right-8 bottom-4 pointer-events-none select-none hidden md:block">
          <NineStar className={`w-10 h-10 ${t.starColor} opacity-10`} />
        </div>

        {/* Theme selector — top right */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              title={cfg.label}
              className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                theme === key ? 'border-[#C9A84C] scale-125' : 'border-white/30 hover:border-white/70'
              }`}
              style={{ background: cfg.swatch }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="relative max-w-3xl mx-auto text-center mb-7">
          <p className={`text-xs tracking-[0.25em] uppercase mb-2 ${t.subtitle}`}>Bahá'í Reference Library</p>
          <h1 className={`text-3xl sm:text-4xl font-light mb-1 ${t.title}`} style={{ fontFamily: 'Crimson Pro, serif' }}>
            Search the Writings
          </h1>
          <div className={`w-10 h-0.5 mx-auto mt-3 ${t.starColor} opacity-30`} style={{ background: 'currentColor' }} />
        </div>

        {/* Search bar */}
        <div className="relative max-w-3xl mx-auto mb-5">
          <div className={`relative flex items-center rounded-2xl shadow-xl ${t.inputBg}`} style={{ boxShadow: theme === 'midnight' ? '0 8px 40px rgba(0,0,0,0.6)' : theme === 'aurora' ? '0 8px 40px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Search size={20} className={`absolute left-5 shrink-0 ${t.iconColor}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className={`w-full bg-transparent pl-14 pr-6 py-4 sm:py-5 text-base sm:text-lg focus:outline-none rounded-2xl ${t.inputText}`}
            />
            {/* Animated custom placeholder */}
            {!query && (
              <div className="absolute left-14 top-0 bottom-0 flex items-center pointer-events-none">
                <span
                  className={`text-base sm:text-lg transition-all duration-500 ${t.placeholderColor} ${suggestionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                >
                  Search for <em>"{suggestions[suggestionIdx]}"</em>…
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Source filters */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {sources.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSource(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm cursor-pointer transition-all duration-200 bg-transparent border-none ${
                source === key ? t.activeFilter : t.inactiveFilter
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">

        {query.length >= 2 && (
          <p className="text-sm text-[#6B7280] mb-5">
            {results.length} result{results.length !== 1 ? 's' : ''} for <strong className="text-[#2D2D2D]">"{query}"</strong>
            {source !== 'all' && <span className="text-[#9CA3AF]"> in {sources.find(s => s.key === source)?.label}</span>}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {results.map(r => {
            const cfg = typeConfig[r.type];
            const Icon = cfg.icon;
            return (
              <Link
                key={r.id}
                to={r.link}
                className={`bg-white rounded-xl border border-[#E5DDD0] border-l-4 ${cfg.border} no-underline hover:shadow-lg hover:border-[#C9A84C]/40 transition-all duration-300 group overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${cfg.badge} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={14} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-[#2D2D2D] m-0 group-hover:text-[#0B4F6C] transition-colors">
                          {r.title}
                        </h3>
                        <span className="text-xs text-[#9CA3AF] truncate">{r.subtitle}</span>
                      </div>
                      <p
                        className="text-sm text-[#6B7280] m-0 leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: highlight(r.excerpt, query) }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {query.length < 2 && (
          <div className="text-center mt-12 mb-8">
            {/* Decorative star */}
            <div className="flex justify-center mb-6">
              <NineStar className="w-16 h-16 text-[#E5DDD0]" />
            </div>
            <p className="text-[#9CA3AF] text-base mb-6">Search across all sacred texts, prayers, and letters</p>

            {/* Suggested searches */}
            <div className="max-w-lg mx-auto">
              <p className="text-xs text-[#B0B8C0] uppercase tracking-widest mb-3">Suggested searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['unity', 'justice', 'love', 'healing', 'prayer', 'light', 'peace', 'service', 'wisdom', 'faith'].map(term => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                    className="px-3.5 py-1.5 rounded-full text-sm bg-white border border-[#E5DDD0] text-[#6B7280] hover:border-[#C9A84C] hover:text-[#0B4F6C] transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div className="text-center mt-16">
            <NineStar className="w-12 h-12 text-[#E5DDD0] mx-auto mb-4" />
            <p className="text-[#9CA3AF]">No results found for "{query}"</p>
            <p className="text-sm text-[#B0B8C0] mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
