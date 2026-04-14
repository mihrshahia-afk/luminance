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
    <div className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto stagger-enter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Star size={22} className="text-gold" />
          <h1 className="page-title text-2xl">Favorites</h1>
        </div>
        <p className="text-sm text-secondary m-0 ml-9 font-body">{total} item{total !== 1 ? 's' : ''} saved</p>
      </div>

      {total === 0 && (
        <div className="text-center mt-16">
          <Star size={48} className="text-border mx-auto mb-4" />
          <p className="text-muted font-body">No favorites yet. Star items you love to find them here.</p>
        </div>
      )}

      {favBooks.length > 0 && (
        <div className="mb-8">
          <div className="category-divider text-teal">
            <span><BookOpen size={14} className="inline mr-1.5 -mt-0.5" />Books</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favBooks.map(b => (
              <Link key={b.id} to={`/books/${b.id}`} className="card-elevated p-4 border border-border no-underline hover:border-gold/40 transition-all">
                <h3 className="text-sm font-semibold text-primary m-0 font-body">{b.title}</h3>
                <p className="text-xs text-secondary m-0 mt-1 font-body">{b.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {favPrayers.length > 0 && (
        <div className="mb-8">
          <div className="category-divider text-sage">
            <span><Heart size={14} className="inline mr-1.5 -mt-0.5" />Prayers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favPrayers.map(p => (
              <Link key={p.id} to={`/prayers/${p.id}`} className="card-elevated p-4 border border-border no-underline hover:border-gold/40 transition-all">
                <span className="text-xs text-gold font-body">{p.topic}</span>
                <p className="text-sm text-primary m-0 mt-1 line-clamp-2 font-body">{p.text.slice(0, 100)}...</p>
                <p className="text-xs text-secondary m-0 mt-1 font-reading italic">&mdash; {p.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {favLetters.length > 0 && (
        <div className="mb-8">
          <div className="category-divider text-brown">
            <span><ScrollText size={14} className="inline mr-1.5 -mt-0.5" />Letters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {favLetters.map(l => (
              <Link key={l.id} to={`/letters/${l.urlCode}`} className="card-elevated p-4 border border-border no-underline hover:border-gold/40 transition-all">
                <h3 className="text-sm font-semibold text-primary m-0 font-body">{l.title}</h3>
                <p className="text-xs text-secondary m-0 mt-1 font-body">{l.date} &mdash; {l.recipient}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
