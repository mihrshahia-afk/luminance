import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { languageMeta } from '../locales/translations';
import type { Theme } from '../context/AppContext';

const THEMES: { id: Theme; label: string; labelKey: 'themeBlue' | 'themeDark' | 'themeCream'; color: string }[] = [
  { id: 'blue', label: 'Blue', labelKey: 'themeBlue', color: '#0B4F6C' },
  { id: 'black', label: 'Dark', labelKey: 'themeDark', color: '#1A1A1A' },
  { id: 'cream', label: 'Cream', labelKey: 'themeCream', color: '#C8A97A' },
];

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, t } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 max-w-3xl mx-auto stagger-enter">
      <div className="mb-10">
        <p className="section-label">{t.appName}</p>
        <h1 className="page-title text-[clamp(1.8rem,4vw,2.6rem)]">Settings</h1>
      </div>

      {/* ── Language ── */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-heading m-0 mb-4">{t.commonLanguage}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languageMeta.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer font-body text-sm transition-all duration-200"
              style={{
                background: language === lang.code ? 'rgba(201,168,76,0.08)' : 'var(--bg-card)',
                borderColor: language === lang.code ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                color: language === lang.code ? 'var(--text-heading)' : 'var(--text-secondary)',
              }}
            >
              <span className="text-base font-bold opacity-50">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs opacity-50">{lang.name}</span>
              </div>
              {language === lang.code && (
                <span className="ml-auto w-2 h-2 rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Theme ── */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-heading m-0 mb-4">{t.themeBlue === 'Blue' ? 'Theme' : t.themeCream === 'Cream' ? 'Theme' : '\u0627\u0644\u0645\u0638\u0647\u0631'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer font-body text-sm transition-all duration-200"
              style={{
                background: theme === th.id ? 'rgba(201,168,76,0.08)' : 'var(--bg-card)',
                borderColor: theme === th.id ? 'rgba(201,168,76,0.4)' : 'var(--border)',
                color: theme === th.id ? 'var(--text-heading)' : 'var(--text-secondary)',
              }}
            >
              <div className="w-8 h-8 rounded-full" style={{ background: th.color, border: theme === th.id ? '2px solid #C9A84C' : '2px solid var(--border)' }} />
              <span>{t[th.labelKey]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Account ── */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-heading m-0 mb-4">Account</h2>
        {user ? (
          <div className="p-4 rounded-xl border border-border" style={{ background: 'var(--bg-card)' }}>
            <p className="text-sm text-primary font-body m-0 mb-1">{user.email}</p>
            <p className="text-xs text-muted font-body m-0 mb-4">
              {user.user_metadata?.display_name || 'Signed in'}
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-body font-medium rounded-lg border border-border bg-transparent cursor-pointer text-secondary hover:text-heading hover:border-gold/40 transition-all duration-200"
            >
              {t.authSignOut}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border" style={{ background: 'var(--bg-card)' }}>
            <p className="text-sm text-secondary font-body m-0 mb-3">Sign in to sync your favorites, notes, and reading progress across devices.</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-body font-medium rounded-lg border border-gold/30 bg-transparent cursor-pointer text-gold hover:bg-gold/5 transition-all duration-200"
            >
              {t.authSignIn}
            </button>
          </div>
        )}
      </section>

      {/* ── About ── */}
      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-heading m-0 mb-4">About</h2>
        <div className="p-4 rounded-xl border border-border text-sm text-secondary font-body leading-relaxed" style={{ background: 'var(--bg-card)' }}>
          <p className="m-0 mb-2"><strong className="text-heading">Luminance</strong> &mdash; {t.appSubtitle}</p>
          <p className="m-0 mb-2">All sacred texts sourced from the <a href="https://www.bahai.org/library/" target="_blank" rel="noopener noreferrer" className="text-gold no-underline hover:underline">Bah&aacute;&rsquo;&iacute; Reference Library</a>.</p>
          <p className="m-0 text-xs text-muted">For personal use only. Not an official Bah&aacute;&rsquo;&iacute; publication.</p>
        </div>
      </section>
    </div>
  );
}
