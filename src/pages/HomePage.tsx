import { Link } from 'react-router-dom';
import { BookOpen, Heart, ScrollText, Search } from 'lucide-react';
import { bookConfigs } from '../data/bookConfig';
import { prayers } from '../data/prayers';
import { letterIndex } from '../data/letterIndex';
import { useApp, type Theme } from '../context/AppContext';

const THEME_BUBBLES: { id: Theme; color: string; label: string }[] = [
  { id: 'blue',  color: '#0B4F6C', label: 'Blue'  },
  { id: 'black', color: '#1A1A1A', label: 'Dark'  },
  { id: 'cream', color: '#C8A97A', label: 'Cream' },
];

const STAR_POINTS = '100,10 115.4,57.7 157.8,31.1 138.9,77.5 188.6,84.3 144.3,107.8 177.9,145 128.9,134.5 130.8,184.6 100,145 69.2,184.6 71.1,134.5 22.1,145 55.7,107.8 11.4,84.3 61.1,77.5 42.1,31.1 84.6,57.7';

const quotes = [
  { text: 'Be generous in prosperity, and thankful in adversity.', author: "Bahá'u'lláh" },
  { text: 'The best beloved of all things in My sight is Justice.', author: "Bahá'u'lláh" },
  { text: 'So powerful is the light of unity that it can illuminate the whole earth.', author: "Bahá'u'lláh" },
  { text: 'Let your vision be world-embracing, rather than confined to your own self.', author: "Bahá'u'lláh" },
  { text: 'My love is My stronghold; he that entereth therein is safe and secure.', author: "Bahá'u'lláh" },
  { text: 'The earth is but one country, and mankind its citizens.', author: "Bahá'u'lláh" },
  { text: 'Breathe not the sins of others so long as thou art thyself a sinner.', author: "Bahá'u'lláh" },
  { text: 'Regard man as a mine rich in gems of inestimable value.', author: "Bahá'u'lláh" },
  { text: 'Cleanse ye your eyes, so that ye behold no man as different from yourselves.', author: "Bahá'u'lláh" },
  { text: 'A kindly tongue is the lodestone of the hearts of men.', author: "Bahá'u'lláh" },
  { text: 'The source of all good is trust in God, submission unto His command, and contentment with His holy will and pleasure.', author: "Bahá'u'lláh" },
  { text: 'O Son of Being! Bring thyself to account each day ere thou art summoned to a reckoning.', author: "Bahá'u'lláh" },
  { text: 'We desire but the good of the world and the happiness of the nations.', author: "Bahá'u'lláh" },
  { text: 'He Who is your Lord, the All-Merciful, cherisheth in His heart the desire of beholding the entire human race as one soul and one body.', author: "Bahá'u'lláh" },
  { text: 'Consort with all religions with amity and concord.', author: "Bahá'u'lláh" },
  { text: 'Do not be content with showing friendship in words alone, let your heart burn with loving kindness for all who may cross your path.', author: "'Abdu'l-Bahá" },
  { text: 'Be in perfect unity. Never become angry with one another.', author: "'Abdu'l-Bahá" },
  { text: 'The gift of God to this enlightened age is the knowledge of the oneness of mankind and of the fundamental oneness of religion.', author: "'Abdu'l-Bahá" },
  { text: 'In the world of existence there is no more powerful magnet than the magnet of love.', author: "'Abdu'l-Bahá" },
  { text: 'Service to humanity is service to God.', author: "'Abdu'l-Bahá" },
  { text: 'Truly, the greatest gift to man is that of intellect or understanding.', author: "'Abdu'l-Bahá" },
];

function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return quotes[day % quotes.length];
}

const sections = [
  { to: '/books', icon: BookOpen, label: 'Sacred Texts', desc: `${bookConfigs.length} books`, color: '#0B4F6C' },
  { to: '/prayers', icon: Heart, label: 'Prayers', desc: `${prayers.length} prayers`, color: '#7D9B8A' },
  { to: '/letters', icon: ScrollText, label: 'Letters', desc: `${letterIndex.length} letters`, color: '#8B6F47' },
  { to: '/search', icon: Search, label: 'Search', desc: 'All writings', color: '#6B5B8A' },
];

export default function HomePage() {
  const { annotations, theme, setTheme } = useApp();
  const quote = getDailyQuote();

  return (
    <div className="flex-1 flex flex-col w-full">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden text-center" style={{
        background: 'var(--hero-gradient)',
        padding: 'clamp(2.5rem, 6vw, 5rem) 2rem clamp(2rem, 5vw, 4rem)',
      }}>
        {/* Watermark star — top right */}
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          opacity: 0.05, pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 200 200" width="440" height="440" fill="white">
            <polygon points={STAR_POINTS} />
          </svg>
        </div>
        {/* Watermark star — bottom left, smaller */}
        <div style={{
          position: 'absolute', left: '-60px', bottom: '-60px',
          opacity: 0.03, pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 200 200" width="280" height="280" fill="white">
            <polygon points={STAR_POINTS} />
          </svg>
        </div>

        <p style={{
          color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.45em',
          textTransform: 'uppercase', margin: '0 0 1.25rem', opacity: 0.85,
          fontFamily: 'Inter, sans-serif',
        }}>
          Bahá'í Library
        </p>
        <h1 style={{
          fontFamily: 'Crimson Pro, serif',
          fontSize: 'clamp(2.6rem, 7vw, 4.8rem)',
          fontWeight: 200,
          color: '#FAF7F0',
          letterSpacing: '0.2em',
          margin: '0 0 1.5rem',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Luminance
        </h1>
        <div style={{
          width: 48, height: 1,
          background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
          margin: '0 auto 1.5rem',
        }} />

        {/* Theme bubbles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {THEME_BUBBLES.map(({ id, color, label }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={`${label} theme`}
              style={{
                width: 18, height: 18,
                borderRadius: '50%',
                background: color,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                outline: theme === id ? '2px solid #C9A84C' : '2px solid transparent',
                outlineOffset: '2px',
                transition: 'outline-color 0.2s ease, transform 0.15s ease',
                transform: theme === id ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '0 clamp(1rem, 4vw, 4rem)', maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

        {/* Daily Quote */}
        <div style={{ textAlign: 'center', padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(2rem, 4vw, 3rem)' }}>
          <p style={{
            color: '#C9A84C', fontSize: '0.6rem', letterSpacing: '0.4em',
            textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif',
          }}>
            Daily Reflection
          </p>
          <p style={{
            fontFamily: 'Crimson Pro, serif',
            fontSize: 'clamp(1.2rem, 2.8vw, 1.65rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--text-primary)',
            lineHeight: 1.75,
            maxWidth: '36rem',
            margin: '0 auto 1.25rem',
          }}>
            "{quote.text}"
          </p>
          <p style={{
            fontFamily: 'Crimson Pro, serif',
            color: 'var(--text-author)',
            fontSize: '0.95rem',
            letterSpacing: '0.06em',
            margin: 0,
          }}>
            — {quote.author}
          </p>
          <div style={{
            width: 40, height: 1,
            background: 'rgba(201,168,76,0.35)',
            margin: '2rem auto 0',
          }} />
        </div>

        {/* Section Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          {sections.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="group"
              style={{
                background: 'var(--bg-card)',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 1px 4px var(--card-shadow)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                display: 'block',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px var(--card-shadow-hover)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px var(--card-shadow)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Colored accent top bar */}
              <div style={{ height: '3px', background: `linear-gradient(to right, ${color}, ${color}99)` }} />
              <div style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '0.5rem',
                  background: `${color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.875rem',
                }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p style={{
                  fontFamily: 'Crimson Pro, serif',
                  fontSize: '1.05rem', fontWeight: 600,
                  color: 'var(--text-primary)', margin: '0 0 0.25rem',
                }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: 'clamp(2rem, 4vw, 3rem)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { value: bookConfigs.length, label: 'Sacred Texts' },
              { value: prayers.length, label: 'Prayers' },
              { value: letterIndex.length, label: 'Letters' },
              { value: annotations.length, label: 'My Notes' },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                textAlign: 'center',
                padding: '1.25rem 1rem',
                borderLeft: i > 0 ? '1px solid #E5DDD0' : 'none',
              }}>
                <p style={{
                  fontFamily: 'Crimson Pro, serif',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 300,
                  color: 'var(--text-heading)',
                  margin: '0 0 0.25rem',
                }}>
                  {value}
                </p>
                <p style={{
                  fontSize: '0.65rem', color: '#9CA3AF',
                  margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
