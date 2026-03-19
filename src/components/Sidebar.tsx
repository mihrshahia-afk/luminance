import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Heart, ScrollText, Search, Star, X } from 'lucide-react';

const NinePointedStar = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="currentColor" opacity={0.9}>
    <polygon points="50,2 56.8,31.2 80.9,13.2 67.3,40 97.3,41.7 69.7,53.5 91.6,74 62.9,65.3 66.4,95.1 50,70 33.6,95.1 37.1,65.3 8.4,74 30.3,53.5 2.7,41.7 32.7,40 19.1,13.2 43.2,31.2" />
  </svg>
);

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/prayers', icon: Heart, label: 'Prayers' },
  { to: '/letters', icon: ScrollText, label: 'Letters' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/favorites', icon: Star, label: 'Favorites' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] flex flex-col z-50
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:shrink-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'var(--sidebar-gradient)' }}
      >
        {/* Logo */}
        <div style={{ padding: '1.75rem 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <NavLink to="/home" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#E8D5A0' }}>
              <NinePointedStar size={30} />
              <div>
                <h1 style={{
                  fontFamily: 'Crimson Pro, serif',
                  fontSize: '1.2rem', fontWeight: 400,
                  letterSpacing: '0.12em', margin: 0,
                  textTransform: 'uppercase', color: '#FAF7F0',
                }}>
                  Luminance
                </h1>
                <p style={{
                  fontSize: '0.62rem', color: '#C9A84C',
                  margin: '2px 0 0', letterSpacing: '0.18em',
                  textTransform: 'uppercase', opacity: 0.8,
                }}>
                  Bahá'í Library
                </p>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5E8A9A', padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem 0.6rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                color: isActive ? '#E8D5A0' : 'var(--nav-inactive)',
                fontWeight: isActive ? 500 : 400,
                paddingLeft: isActive ? '0.75rem' : '0.875rem',
              })}
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

        {/* Divider + quote */}
        <div style={{ padding: '1.25rem 1.5rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{
            fontFamily: 'Crimson Pro, serif',
            fontSize: '0.85rem', fontStyle: 'italic',
            color: '#4A7080', lineHeight: 1.6, margin: '0 0 0.5rem',
          }}>
            "The earth is but one country, and mankind its citizens."
          </p>
          <p style={{ fontSize: '0.72rem', color: '#2E5060', margin: 0, letterSpacing: '0.04em' }}>
            — Bahá'u'lláh
          </p>
        </div>
      </aside>
    </>
  );
}
