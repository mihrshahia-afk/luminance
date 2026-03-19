import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Menu, Home, BookOpen, Heart, ScrollText, Search, Star } from 'lucide-react';
import Sidebar from './Sidebar';

const mobileNavItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/books', icon: BookOpen, label: 'Books' },
  { to: '/prayers', icon: Heart, label: 'Prayers' },
  { to: '/letters', icon: ScrollText, label: 'Letters' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/favorites', icon: Star, label: 'Saved' },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header */}
        <header className="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center gap-3" style={{
          background: 'var(--mobile-header-bg)',
          borderBottom: '1px solid var(--mobile-header-border)',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--nav-inactive)' }}
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold tracking-wide" style={{ color: '#E8D5A0' }}>Luminance</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col" style={{ background: 'var(--bg-page)' }}>
          <div key={location.pathname} className="page-enter flex-1 flex flex-col w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex" style={{
          background: 'var(--mobile-nav-bg)',
          borderTop: '1px solid var(--mobile-nav-border)',
        }}>
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#0B4F6C]' : 'text-[#9CA3AF]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
