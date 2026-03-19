import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 9-pointed star: outer r=90, inner r=38, center (100,100)
const STAR_POINTS = [
  [100, 10], [115.4, 57.7], [157.8, 31.1], [138.9, 77.5],
  [188.6, 84.3], [144.3, 107.8], [177.9, 145], [128.9, 134.5],
  [130.8, 184.6], [100, 145], [69.2, 184.6], [71.1, 134.5],
  [22.1, 145], [55.7, 107.8], [11.4, 84.3], [61.1, 77.5],
  [42.1, 31.1], [84.6, 57.7],
].map(([x, y]) => `${x},${y}`).join(' ');


export default function SplashPage() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleEnter() {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate('/home'), 900);
  }

  return (
    <div
      onClick={handleEnter}
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, #0d3d52 0%, #051929 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
        opacity: mounted && !exiting ? 1 : 0,
        transition: exiting ? 'opacity 0.9s ease-in' : 'opacity 0.5s ease-out',
        overflow: 'hidden',
      }}
    >
      <div className="splash-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`splash-particle-${i + 1}`} />
        ))}
      </div>

      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)',
        pointerEvents: 'none', animation: 'starGlow 5s ease-in-out 2s infinite',
      }} />

      <div className={exiting ? 'splash-star splash-star-exit' : 'splash-star'}>
        <svg width="260" height="260" viewBox="0 0 200 200" fill="none">

          {/* Outer ring — full circle */}
          <circle cx="100" cy="100" r="95"
            stroke="#C9A84C" strokeWidth="0.6" fill="none"
            className="star-circle"
          />

          {/* Inner dashed ring */}
          <circle cx="100" cy="100" r="70"
            stroke="#C9A84C" strokeWidth="0.35"
            strokeDasharray="2 6" fill="none" opacity="0"
            style={{ animation: 'fadeIn 1s ease-out 2.6s forwards' }}
          />

          {/* Star fill */}
          <polygon points={STAR_POINTS} fill="#C9A84C" className="star-fill" />

          {/* Star outline */}
          <polygon points={STAR_POINTS} fill="none"
            stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round"
            className="star-outline"
          />

          {/* 9 tip dots */}
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (-90 + i * 40) * (Math.PI / 180);
            return (
              <circle key={i}
                cx={100 + 95 * Math.cos(angle)} cy={100 + 95 * Math.sin(angle)}
                r="2" fill="#C9A84C" opacity="0"
                style={{ animation: `fadeIn 0.6s ease-out ${2.3 + i * 0.06}s forwards` }}
              />
            );
          })}

          {/* Greatest Name calligraphy — fade in after star is drawn */}
          <image
            href="/greatest-name.svg"
            x="52.5" y="77.5" width="95" height="45"
            opacity="0"
            style={{ animation: 'fadeIn 1.2s ease-out 2.4s forwards' }}
          />

        </svg>
      </div>

      <div className="splash-title" style={{ marginTop: 20, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Crimson Pro', serif", fontSize: '3.8rem', fontWeight: 300,
          color: '#FAF7F0', letterSpacing: '0.22em', margin: 0, textTransform: 'uppercase',
        }}>Luminance</h1>
      </div>

      <div className="splash-subtitle" style={{ marginTop: 8, textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem', color: '#C9A84C',
          letterSpacing: '0.28em', margin: 0, textTransform: 'uppercase', opacity: 0.75,
        }}>A Personal Bahá'í Library</p>
      </div>

      <div className="splash-line" style={{
        marginTop: 26, width: 100, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)',
        transformOrigin: 'center',
      }} />

      <p className="splash-prompt" style={{
        marginTop: 28, fontFamily: "'Inter', sans-serif", fontSize: '0.7rem',
        color: 'rgba(250,247,240,0.35)', letterSpacing: '0.22em', textTransform: 'uppercase',
      }}>Alláh-u-Abhá!</p>
    </div>
  );
}
