import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

      <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)',
        animation: 'starGlow 5s ease-in-out 2s infinite',
      }} />

      <div className={exiting ? 'splash-star splash-star-exit' : 'splash-star'}>
        <svg className="w-[180px] h-[180px] sm:w-[260px] sm:h-[260px]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="95" stroke="#C9A84C" strokeWidth="0.6" fill="none" className="star-circle" />
          <circle cx="100" cy="100" r="70" stroke="#C9A84C" strokeWidth="0.35" strokeDasharray="2 6" fill="none" opacity="0" style={{ animation: 'fadeIn 1s ease-out 2.6s forwards' }} />
          <polygon points={STAR_POINTS} fill="#C9A84C" className="star-fill" />
          <polygon points={STAR_POINTS} fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round" className="star-outline" />
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (-90 + i * 40) * (Math.PI / 180);
            return (
              <circle key={i} cx={100 + 95 * Math.cos(angle)} cy={100 + 95 * Math.sin(angle)} r="2" fill="#C9A84C" opacity="0" style={{ animation: `fadeIn 0.6s ease-out ${2.3 + i * 0.06}s forwards` }} />
            );
          })}
          <image href="/greatest-name.svg" x="52.5" y="77.5" width="95" height="45" opacity="0" style={{ animation: 'fadeIn 1.2s ease-out 2.4s forwards' }} />
        </svg>
      </div>

      <div className="splash-title mt-5 text-center">
        <h1 className="font-display text-[clamp(2.2rem,10vw,3.8rem)] font-light text-[#FAF7F0] tracking-[0.15em] sm:tracking-[0.22em] m-0 uppercase">
          Luminance
        </h1>
      </div>

      <div className="splash-subtitle mt-2 text-center">
        <p className="font-display text-[clamp(0.7rem,2.5vw,0.9rem)] text-gold tracking-[0.15em] sm:tracking-[0.28em] m-0 uppercase opacity-75 px-4">
          A Personal Bah&aacute;&rsquo;&iacute; Library
        </p>
      </div>

      <div className="splash-line mt-5 sm:mt-[26px] w-[70px] sm:w-[100px] h-px origin-center" style={{
        background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)',
      }} />

      <p className="splash-prompt mt-5 sm:mt-7 font-body text-[0.65rem] sm:text-[0.7rem] text-[rgba(250,247,240,0.35)] tracking-[0.15em] sm:tracking-[0.22em] uppercase">
        All&aacute;h-u-Abh&aacute;!
      </p>
    </div>
  );
}
