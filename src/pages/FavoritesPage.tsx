import { Link } from 'react-router-dom';
import { Star, BookOpen, Heart, ScrollText } from 'lucide-react';
import { books } from '../data/books';
import { prayers } from '../data/prayers';
import { letterIndex } from '../data/letterIndex';
import { useApp } from '../context/AppContext';

export default function FavoritesPage() {
  const { favorites } = useApp();

  const favBooks = books.filter(b => favorites.includes(b.id));
  const favPrayers = prayers.filter(p => favorites.includes(p.id));
  const favLetters = letterIndex.filter(l => favorites.includes(l.id));
  const total = favBooks.length + favPrayers.length + favLetters.length;

  return (
    <div className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Star size={22} className="text-[#C9A84C]" />
          <h1 className="text-2xl font-semibold text-[#0B4F6C] m-0">Favorites</h1>
        </div>
        <p className="text-sm text-[#6B7280] m-0 ml-9">{total} item{total !== 1 ? 's' : ''} saved</p>
      </div>

      {total === 0 && (
        <div className="text-center mt-16">
          <Star size={48} className="text-[#E5DDD0] mx-auto mb-4" />
          <p className="text-[#9CA3AF]">No favorites yet. Star items you love to find them here.</p>
        </div>
      )}

      {favBooks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-[#0B4F6C]" />
            <h2 className="text-sm font-semibold text-[#0B4F6C] uppercase tracking-wider m-0">Books</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favBooks.map(b => (
              <Link key={b.id} to={`/books/${b.id}`} className="bg-white rounded-lg p-4 border border-[#E5DDD0] no-underline hover:shadow-sm transition-shadow">
                <h3 className="text-sm font-semibold text-[#2D2D2D] m-0">{b.title}</h3>
                <p className="text-xs text-[#6B7280] m-0 mt-1">{b.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {favPrayers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-[#7D9B8A]" />
            <h2 className="text-sm font-semibold text-[#7D9B8A] uppercase tracking-wider m-0">Prayers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favPrayers.map(p => (
              <Link key={p.id} to={`/prayers/${p.id}`} className="bg-white rounded-lg p-4 border border-[#E5DDD0] no-underline hover:shadow-sm transition-shadow">
                <span className="text-xs text-[#C9A84C]">{p.topic}</span>
                <p className="text-sm text-[#2D2D2D] m-0 mt-1 line-clamp-2">{p.text.slice(0, 100)}...</p>
                <p className="text-xs text-[#6B7280] m-0 mt-1">— {p.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {favLetters.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText size={16} className="text-[#8B6F47]" />
            <h2 className="text-sm font-semibold text-[#8B6F47] uppercase tracking-wider m-0">Universal House of Justice Letters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favLetters.map(l => (
              <Link key={l.id} to={`/letters/${l.urlCode}`} className="bg-white rounded-lg p-4 border border-[#E5DDD0] no-underline hover:shadow-sm transition-shadow">
                <h3 className="text-sm font-semibold text-[#2D2D2D] m-0">{l.title}</h3>
                <p className="text-xs text-[#6B7280] m-0 mt-1">{l.date} — {l.recipient}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
