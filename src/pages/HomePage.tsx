import PhotoCarousel from '../components/PhotoCarousel';
import QuoteBook from '../components/QuoteBook';
import LuminanceTitle from '../components/LuminanceTitle';
import LanguageSelector from '../components/LanguageSelector';
import { LiteratureCard, SearchCard, LettersCard, PrayersCard } from '../components/HomeCards';
import { useApp, type Theme } from '../context/AppContext';

const THEME_BUBBLES: { id: Theme; color: string; label: string }[] = [
  { id: 'blue',  color: '#0B4F6C', label: 'Blue'  },
  { id: 'black', color: '#1A1A1A', label: 'Dark'  },
  { id: 'cream', color: '#C8A97A', label: 'Cream' },
];

const STAR_POINTS = '100,10 115.4,57.7 157.8,31.1 138.9,77.5 188.6,84.3 144.3,107.8 177.9,145 128.9,134.5 130.8,184.6 100,145 69.2,184.6 71.1,134.5 22.1,145 55.7,107.8 11.4,84.3 61.1,77.5 42.1,31.1 84.6,57.7';

export default function HomePage() {
  const { theme, setTheme, t } = useApp();

  const litLabel = t.navLiteratureShort === 'Literature' ? "Bah\u00e1'\u00ed Literature" : t.navLiterature;

  return (
    <div className="flex-1 flex flex-col w-full stagger-enter">

      {/* Hero Banner */}
      <div className="relative overflow-hidden text-center" style={{
        background: 'var(--hero-gradient)',
        padding: 'clamp(1.5rem, 5vw, 5rem) 1rem clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" width="440" height="440" fill="white">
            <polygon points={STAR_POINTS} />
          </svg>
        </div>
        <div className="absolute -left-15 -bottom-15 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 200 200" width="280" height="280" fill="white">
            <polygon points={STAR_POINTS} />
          </svg>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <p className="text-gold text-[0.65rem] tracking-[0.3em] sm:tracking-[0.45em] uppercase mb-5 opacity-85 font-body px-4">
          {t.bahaiLibrary}
        </p>
        <h1 className="font-display text-[clamp(2rem,8vw,4.8rem)] font-extralight tracking-[0.1em] sm:tracking-[0.2em] mb-6 leading-none flex justify-center px-2">
          <LuminanceTitle />
        </h1>
        <div className="w-12 h-px mx-auto mb-6" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />

        <div className="flex justify-center gap-2">
          {THEME_BUBBLES.map(({ id, color, label }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={`${label} theme`}
              className="w-[18px] h-[18px] rounded-full border-none p-0 cursor-pointer transition-all duration-200"
              style={{
                background: color,
                outline: theme === id ? '2px solid #C9A84C' : '2px solid transparent',
                outlineOffset: '2px',
                transform: theme === id ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-[clamp(1rem,4vw,4rem)] max-w-[72rem] mx-auto w-full">
        <QuoteBook />

        {/* Section Cards — 2x2 grid with bespoke interactions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          <LiteratureCard label={litLabel} />
          <PrayersCard label={t.navPrayers} />
          <LettersCard label={t.navLetters} />
          <SearchCard label={t.navSearch} />
        </div>
      </div>

      <PhotoCarousel />
    </div>
  );
}
