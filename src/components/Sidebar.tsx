import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Heart, ScrollText, Search, Star, X, User, LogOut, Compass, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import LuminanceTitle from './LuminanceTitle';

const NinePointedStar = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="currentColor" opacity={0.9}>
    <polygon points="50,2 56.8,31.2 80.9,13.2 67.3,40 97.3,41.7 69.7,53.5 91.6,74 62.9,65.3 66.4,95.1 50,70 33.6,95.1 37.1,65.3 8.4,74 30.3,53.5 2.7,41.7 32.7,40 19.1,13.2 43.2,31.2" />
  </svg>
);

function useNavItems() {
  const { t } = useApp();
  return [
    { to: '/home', icon: Home, label: t.navHome },
    { to: '/books', icon: BookOpen, label: t.navLiterature },
    { to: '/prayers', icon: Heart, label: t.navPrayers },
    { to: '/letters', icon: ScrollText, label: t.navLetters },
    { to: '/search', icon: Search, label: t.navSearch },
    { to: '/qiblih', icon: Compass, label: t.navQiblih },
    { to: '/favorites', icon: Star, label: t.navFavorites },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
}

const sidebarQuotes = [
  { text: 'The earth is but one country, and mankind its citizens.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h" },
  { text: 'So powerful is the light of unity that it can illuminate the whole earth.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h" },
  { text: 'Let your vision be world-embracing, rather than confined to your own self.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h" },
  { text: 'Service to humanity is service to God.', author: "\u2018Abdu\u2019l-Bah\u00e1" },
  { text: 'A kindly tongue is the lodestone of the hearts of men.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navItems = useNavItems();
  const [quoteIdx, setQuoteIdx] = useState(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return day % sidebarQuotes.length;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(i => (i + 1) % sidebarQuotes.length);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const quote = sidebarQuotes[quoteIdx];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] max-w-[85vw] flex flex-col z-50
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:shrink-0 md:max-w-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'var(--sidebar-gradient)' }}
      >
        {/* Logo */}
        <div className="py-7 px-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <NavLink to="/home" onClick={onClose} className="flex items-center gap-3 no-underline text-[#E8D5A0]">
              <NinePointedStar size={30} />
              <div>
                <h1 className="font-display text-[1.2rem] font-normal tracking-[0.12em] m-0 flex">
                  <LuminanceTitle />
                </h1>
                <p className="text-[0.62rem] text-gold m-0 mt-0.5 tracking-[0.18em] uppercase opacity-80 font-body">
                  Bah&aacute;&rsquo;&iacute; Library
                </p>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="md:hidden bg-transparent border-none cursor-pointer text-[#5E8A9A] p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-sm font-body no-underline transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'border-gold bg-nav-active-bg text-[#E8D5A0] font-medium pl-3'
                    : 'border-transparent text-nav-inactive font-normal pl-3.5 hover:-translate-y-0.5 hover:border-[#5E8A9A]/50 hover:bg-white/[0.04] hover:text-[#B0C8D4] hover:shadow-[0_0_0_1px_rgba(94,138,154,0.2)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.75} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-3 border-t border-white/5">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <User size={14} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#B0C8D4] m-0 truncate font-body">{user.user_metadata?.display_name || user.email}</p>
              </div>
              <button onClick={signOut} className="bg-transparent border-none cursor-pointer text-[#5E8A9A] hover:text-[#B0C8D4] p-1 transition-colors" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <NavLink to="/auth" onClick={onClose} className="flex items-center gap-2.5 text-[#5E8A9A] hover:text-[#B0C8D4] no-underline transition-colors font-body text-sm">
              <User size={15} />
              Sign in
            </NavLink>
          )}
        </div>

        {/* Divider + quote */}
        <div className="py-4 px-6 border-t border-white/5">
          <p className="font-reading text-[0.85rem] italic text-[#4A7080] leading-relaxed m-0 mb-2 transition-opacity duration-500">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[0.72rem] text-[#2E5060] m-0 tracking-[0.04em] font-body">
            &mdash; {quote.author}
          </p>
        </div>
      </aside>
    </>
  );
}
