import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { Menu, Home, BookOpen, Heart, ScrollText, Search, Compass } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useApp();

  const mobileNavItems = [
    { to: '/home', icon: Home, label: t.navHome },
    { to: '/books', icon: BookOpen, label: t.navLiteratureShort },
    { to: '/prayers', icon: Heart, label: t.navPrayers },
    { to: '/letters', icon: ScrollText, label: t.navLetters },
    { to: '/search', icon: Search, label: t.navSearch },
    { to: '/qiblih', icon: Compass, label: t.navQiblih },
  ];

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
            className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-nav-inactive"
          >
            <Menu size={22} />
          </button>
          <span className="font-display font-normal tracking-wide text-[#E8D5A0] text-lg">Luminance</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col bg-page">
          <div key={location.pathname} className="page-enter flex-1 flex flex-col w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex pb-[env(safe-area-inset-bottom)]" style={{
          background: 'var(--mobile-nav-bg)',
          borderTop: '1px solid var(--mobile-nav-border)',
        }}>
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline text-[10px] font-medium font-body transition-colors ${
                  isActive ? 'text-heading' : 'text-muted'
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
