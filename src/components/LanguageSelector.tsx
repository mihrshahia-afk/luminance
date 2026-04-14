import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { languageMeta } from '../locales/translations';

export default function LanguageSelector() {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languageMeta.find(l => l.code === language) || languageMeta[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-transparent cursor-pointer font-body text-xs text-secondary transition-all duration-200 hover:border-gold/40 hover:text-heading hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(201,168,76,0.1)]"
      >
        <Globe size={14} className="text-gold/60" />
        <span>{current.nativeName}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 min-w-[160px] rounded-xl border border-border overflow-hidden z-50 shadow-lg"
          style={{ background: 'var(--bg-card)' }}>
          {languageMeta.map((lang, i) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer font-body text-sm transition-all duration-150 ${
                language === lang.code
                  ? 'text-gold font-medium'
                  : 'text-secondary hover:text-heading'
              }`}
              style={{
                background: language === lang.code ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderBottom: i < languageMeta.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span className="text-xs font-bold w-6 text-center opacity-50">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.nativeName}</span>
              {language === lang.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
