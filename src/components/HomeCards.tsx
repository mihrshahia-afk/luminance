import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookCovers } from '../data/bookCovers';
import { bookConfigs } from '../data/bookConfig';

/* ═══════════════════════════════════════════════════════════════
   1. LITERATURE — title LEFT, double doors in CENTRE
   ═══════════════════════════════════════════════════════════════ */

// Every book appears in the carousel. Books with a cover image use it; books
// without fall back to a stylized title/author card (same look as BookReader).
const coverList = bookConfigs.map(b => ({
  id: b.id,
  src: bookCovers[b.id] || null,
  title: b.title,
  author: b.author,
}));

export function LiteratureCard({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to="/books"
      className="home-card no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Book covers carousel behind the doors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`flex gap-1.5 absolute inset-0 items-center px-2 ${hovered ? 'lit-carousel-scroll' : ''}`}
          style={{ width: 'max-content' }}>
          {[...coverList, ...coverList].map((c, i) => (
            c.src ? (
              <img key={i} src={c.src} alt={c.title}
                className="h-[80%] w-auto rounded-sm object-cover"
                style={{ opacity: hovered ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.015}s` }}
                loading="lazy" />
            ) : (
              <div key={i}
                className="h-[80%] rounded-sm flex flex-col items-center justify-center text-center px-3 py-4 shrink-0"
                style={{
                  aspectRatio: '2 / 3',
                  background: 'linear-gradient(145deg, var(--bg-card), rgba(201,168,76,0.04))',
                  border: '1.5px solid rgba(201,168,76,0.3)',
                  opacity: hovered ? 1 : 0,
                  transition: `opacity 0.4s ease ${i * 0.015}s`,
                }}>
                <p className="text-[0.45rem] tracking-[0.2em] uppercase text-gold/60 font-body m-0 mb-2 leading-tight">{c.author}</p>
                <h4 className="font-display text-[0.85rem] font-semibold text-heading leading-tight m-0">{c.title}</h4>
              </div>
            )
          ))}
        </div>
      </div>

      {/* LEFT DOOR — slides left */}
      <div className="absolute top-0 bottom-0 z-2 transition-transform duration-[600ms]"
        style={{
          left: '0',
          width: '50%',
          background: 'var(--bg-card)',
          transform: hovered ? 'translateX(-85%)' : 'translateX(0)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          borderRight: '1px solid var(--border)',
        }}>
        {/* Title on the left door */}
        <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
          <p className="font-body text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-semibold m-0 mb-1"
            style={{ color: '#0B4F6C', opacity: 0.6 }}>
            {label.includes('Literature') ? "Bah\u00e1'\u00ed" : ''}
          </p>
          <h3 className="font-display text-[1.2rem] sm:text-[1.7rem] font-semibold m-0 leading-tight"
            style={{ color: 'var(--text-heading)' }}>
            {label.includes('Literature') ? 'Literature' : label}
          </h3>
        </div>
        {/* Handle on right edge */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded bg-border" />
      </div>

      {/* RIGHT DOOR — slides right */}
      <div className="absolute top-0 bottom-0 z-2 transition-transform duration-[600ms]"
        style={{
          right: '0',
          width: '50%',
          background: 'var(--bg-card)',
          transform: hovered ? 'translateX(85%)' : 'translateX(0)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          borderLeft: '1px solid var(--border)',
        }}>
        {/* Handle on left edge */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded bg-border" />
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. SEARCH — virtues fill entire card, smaller magnifying glass
   ═══════════════════════════════════════════════════════════════ */

const VIRTUES = [
  'Justice', 'Unity', 'Love', 'Truthfulness', 'Trustworthiness', 'Compassion',
  'Courage', 'Humility', 'Patience', 'Generosity', 'Kindness', 'Faithfulness',
  'Detachment', 'Wisdom', 'Gratitude', 'Forgiveness', 'Purity', 'Service',
  'Steadfastness', 'Radiance', 'Joy', 'Peace', 'Hope', 'Certitude',
  'Reverence', 'Excellence', 'Courtesy', 'Honour', 'Obedience', 'Devotion',
  'Mercy', 'Beauty', 'Knowledge', 'Understanding', 'Sincerity', 'Moderation',
  'Righteousness', 'Dignity', 'Nobility', 'Contentment', 'Resilience', 'Grace',
  'Empathy', 'Integrity', 'Fidelity', 'Piety', 'Benevolence', 'Equity',
  'Tenderness', 'Zeal', 'Chastity', 'Rectitude', 'Fortitude', 'Forbearance',
  'Magnanimity', 'Tolerance', 'Constancy', 'Valor', 'Ardour', 'Reverence',
];

const virtueText = (VIRTUES.join(' \u00b7 ') + ' \u00b7 ').repeat(4);

export function SearchCard({ label }: { label: string }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const R = 24; // smaller lens radius

  return (
    <Link
      ref={cardRef}
      to="/search"
      className="home-card no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: -200, y: -200 }); }}
      onMouseMove={handleMouseMove}
    >
      {/* Virtues filling ENTIRE card — larger text, dense */}
      <div className="absolute inset-0 p-2.5 sm:p-3 overflow-hidden">
        <p className="font-body text-[0.5rem] sm:text-[0.6rem] leading-[1.5] sm:leading-[1.6] m-0"
          style={{ color: 'var(--text-muted)', opacity: 0.25, wordSpacing: '0.12em' }}>
          {virtueText}
        </p>
      </div>

      {/* Magnified layer — clipped to lens circle, NO fill */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none z-4" style={{
          clipPath: `circle(${R}px at ${mousePos.x}px ${mousePos.y}px)`,
        }}>
          <div className="absolute inset-0 p-2.5 sm:p-3 overflow-hidden"
            style={{ transform: `scale(2.2)`, transformOrigin: `${mousePos.x}px ${mousePos.y}px` }}>
            <p className="font-body text-[0.5rem] sm:text-[0.6rem] leading-[1.5] sm:leading-[1.6] m-0"
              style={{ color: '#C9A84C', opacity: 1, wordSpacing: '0.12em', textShadow: '0 0 5px rgba(201,168,76,0.4)' }}>
              {virtueText}
            </p>
          </div>
        </div>
      )}

      {/* Magnifying glass SVG — just ring + handle, transparent centre */}
      {hovered && (
        <svg className="absolute pointer-events-none z-5"
          style={{ left: mousePos.x - R - 3, top: mousePos.y - R - 3 }}
          width={R * 2 + 22} height={R * 2 + 22}>
          <circle cx={R + 3} cy={R + 3} r={R}
            fill="none" stroke="#6B5B8A" strokeWidth="2" />
          <line
            x1={R + 3 + R * 0.7} y1={R + 3 + R * 0.7}
            x2={R + 3 + R * 0.7 + 12} y2={R + 3 + R * 0.7 + 12}
            stroke="#6B5B8A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      )}

      {/* Label */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10">
        <p className="font-body text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-semibold m-0 mb-1"
          style={{ color: '#6B5B8A', opacity: 0.7 }}>explore</p>
        <h3 className="font-display text-[1.2rem] sm:text-[1.7rem] font-semibold m-0"
          style={{ color: 'var(--text-heading)' }}>{label}</h3>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. LETTERS — 2 large scrolls that open fully with more text
   ═══════════════════════════════════════════════════════════════ */

const SCROLL_DATA = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

function LargeScroll({ open, delay }: { text?: unknown; open: boolean; delay: number }) {
  return (
    <div className="flex flex-col items-center" style={{ width: '60px' }}>
      {/* Top roll */}
      <div className="w-[120%] h-3 sm:h-[14px] rounded-full z-2 relative shrink-0"
        style={{
          background: 'linear-gradient(to bottom, #D8C080, #C4A86A, #A88A48, #C4A86A, #D8C080)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}>
        {/* Knob ends */}
        <div className="absolute -left-1 top-0 bottom-0 w-2 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #B8983C, #8B7030, #B8983C)' }} />
        <div className="absolute -right-1 top-0 bottom-0 w-2 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #B8983C, #8B7030, #B8983C)' }} />
      </div>

      {/* Paper body — fills entire space between rolls */}
      <div className="w-full overflow-hidden transition-all"
        style={{
          flex: open ? '1' : '0',
          maxHeight: open ? '100%' : '0px',
          opacity: open ? 1 : 0,
          transitionDuration: '0.8s',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${delay}ms`,
        }}>
        {/* Wavy edge + parchment */}
        <div className="relative" style={{
          background: 'var(--bg-card)',
          borderLeft: '2px solid rgba(200,180,120,0.2)',
          borderRight: '2px solid rgba(200,180,120,0.2)',
          padding: '6px 8px',
          boxShadow: 'inset 2px 0 6px rgba(180,160,100,0.06), inset -2px 0 6px rgba(180,160,100,0.06)',
        }}>
          {/* Wavy left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: 'repeating-linear-gradient(to bottom, rgba(180,160,100,0.12) 0px, rgba(180,160,100,0.04) 4px, rgba(180,160,100,0.12) 8px)' }} />
          {/* Wavy right edge */}
          <div className="absolute right-0 top-0 bottom-0 w-[3px]"
            style={{ background: 'repeating-linear-gradient(to bottom, rgba(180,160,100,0.04) 0px, rgba(180,160,100,0.12) 4px, rgba(180,160,100,0.04) 8px)' }} />

          {/* Letter content filling entire scroll height */}
          <div style={{
            height: '100%',
            overflow: 'hidden',
            padding: '2px 3px',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '6px',
            lineHeight: '1.5',
            color: 'var(--text-secondary)',
            opacity: 0.6,
          }}>
            <p style={{ margin: '0 0 2px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '6px', opacity: 0.85, color: 'var(--text-heading)' }}>
              Universal House of Justice
            </p>
            <p style={{ margin: '0 0 3px', fontSize: '5px', opacity: 0.65 }}>
              To the Bah&aacute;&rsquo;&iacute;s of the World
            </p>
            <div style={{ width: '40%', height: '0.5px', background: 'rgba(201,168,76,0.25)', margin: '2px 0 3px' }} />
            <p style={{ margin: 0 }}>
              Dearly loved friends, the community of the Greatest Name gathers at this time with hearts filled with gratitude and hope. The endeavours of the past year have borne remarkable fruit, and the signs of progress are evident in every corner of the globe. The capacity of individuals and communities to contribute to the betterment of society continues to grow. Young people everywhere are arising with energy and devotion to serve their fellow human beings. The institutions of the Faith are strengthening, and the processes of community building are advancing with ever greater momentum. Let us reflect upon the path ahead with confidence and resolve, knowing that the confirmations of the Blessed Beauty sustain every sincere effort. May each soul find renewed purpose in the service of humanity and the advancement of civilization. The challenges before us are great, yet the resources at our disposal, both material and spiritual, are more than sufficient to meet them.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom roll */}
      <div className="w-[120%] h-3 sm:h-[14px] rounded-full z-2 relative"
        style={{
          background: 'linear-gradient(to bottom, #D8C080, #C4A86A, #A88A48, #C4A86A, #D8C080)',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.15), inset 0 -1px 0 rgba(255,255,255,0.1)',
        }}>
        <div className="absolute -left-1 top-0 bottom-0 w-2 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #B8983C, #8B7030, #B8983C)' }} />
        <div className="absolute -right-1 top-0 bottom-0 w-2 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #B8983C, #8B7030, #B8983C)' }} />
      </div>
    </div>
  );
}

export function LettersCard({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to="/letters"
      className="home-card no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title on LEFT */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10">
        <p className="font-body text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-semibold m-0 mb-1"
          style={{ color: '#8B6F47', opacity: 0.7 }}>guidance</p>
        <h3 className="font-display text-[1.2rem] sm:text-[1.7rem] font-semibold m-0"
          style={{ color: 'var(--text-heading)' }}>{label}</h3>
      </div>

      {/* 5 scrolls — anchored to the right */}
      <div className="absolute top-0 bottom-0 right-2 sm:right-3 flex items-stretch gap-3 sm:gap-4 py-1">
        {SCROLL_DATA.map((s, i) => (
          <LargeScroll key={s.id} open={hovered} delay={i * 120} />
        ))}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PRAYERS — 3 large detailed temple silhouettes
   ═══════════════════════════════════════════════════════════════ */

// Prayers card — candles, musical notes, guitar, prayer book

// Audio — lazy init on first user interaction
let audioCtx: AudioContext | null = null;
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playChime(freq = 800) {
  try {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

function playStrum(variant = 0) {
  try {
    const ctx = ensureAudio();
    const chords = [
      [196, 247, 330, 392, 494, 587], // G major
      [262, 330, 392, 494, 587, 659], // C major
    ];
    const freqs = chords[variant % chords.length];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 1.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 1.0);
    });
  } catch {}
}

// SVG icons as components
function CandleSVG({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 20 40" width="16" height="32" className="sm:w-[20px] sm:h-[40px]">
      {/* Flame */}
      <path d="M10 2 Q12 6 12 10 Q12 14 10 15 Q8 14 8 10 Q8 6 10 2Z"
        fill={lit ? '#F0C040' : 'var(--text-muted)'}
        opacity={lit ? 1 : 0.15}
        style={{ transition: 'all 0.3s', filter: lit ? 'drop-shadow(0 0 4px rgba(240,192,64,0.6))' : 'none' }} />
      {/* Inner flame */}
      {lit && <path d="M10 5 Q11 8 11 10 Q11 13 10 14 Q9 13 9 10 Q9 8 10 5Z" fill="#FFF0A0" opacity="0.7" />}
      {/* Wick */}
      <line x1="10" y1="14" x2="10" y2="16" stroke="var(--text-muted)" strokeWidth="0.5" opacity="0.4" />
      {/* Candle body */}
      <rect x="7" y="16" width="6" height="20" rx="1" fill={lit ? '#E8D8B8' : 'var(--text-muted)'} opacity={lit ? 0.8 : 0.12} />
      {/* Wax drip */}
      <path d="M7 20 Q6 22 7 23" fill="none" stroke={lit ? '#E8D8B8' : 'var(--text-muted)'} strokeWidth="0.5" opacity={lit ? 0.5 : 0.08} />
      {/* Base */}
      <rect x="5" y="36" width="10" height="3" rx="1" fill={lit ? '#C9A84C' : 'var(--text-muted)'} opacity={lit ? 0.4 : 0.1} />
    </svg>
  );
}

function NoteSVG() {
  return (
    <svg viewBox="0 0 16 20" width="14" height="18" className="sm:w-[16px] sm:h-[20px]">
      <ellipse cx="5" cy="16" rx="4" ry="3" fill="currentColor" opacity="0.8" />
      <line x1="9" y1="3" x2="9" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 3 Q14 5 14 8 Q14 11 9 9" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function GuitarSVG() {
  return (
    <svg viewBox="0 0 30 56" width="28" height="52" className="sm:w-[34px] sm:h-[62px]">
      {/* Headstock */}
      <path d="M13 0 L13 3 Q11 3 11 5 L11 8 L13 8 L13 10 L17 10 L17 8 L19 8 L19 5 Q19 3 17 3 L17 0Z" fill="currentColor" opacity="0.6" />
      {/* Tuning pegs */}
      <rect x="9" y="3" width="2" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="9" y="6" width="2" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="19" y="3" width="2" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="19" y="6" width="2" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
      {/* Neck */}
      <rect x="13" y="10" width="4" height="16" fill="currentColor" opacity="0.65" />
      {/* Frets */}
      <line x1="13" y1="14" x2="17" y2="14" stroke="var(--bg-card)" strokeWidth="0.4" opacity="0.25" />
      <line x1="13" y1="18" x2="17" y2="18" stroke="var(--bg-card)" strokeWidth="0.4" opacity="0.25" />
      <line x1="13" y1="22" x2="17" y2="22" stroke="var(--bg-card)" strokeWidth="0.4" opacity="0.25" />
      {/* Classical guitar body — figure-8 / hourglass shape */}
      {/* Upper bout */}
      <path d="M15 26 Q8 28 6 32 Q4 36 6 38 Q8 40 12 40" fill="currentColor" opacity="0.7" />
      <path d="M15 26 Q22 28 24 32 Q26 36 24 38 Q22 40 18 40" fill="currentColor" opacity="0.7" />
      {/* Waist */}
      <path d="M12 40 Q10 41 10 42 Q10 43 12 44" fill="currentColor" opacity="0.7" />
      <path d="M18 40 Q20 41 20 42 Q20 43 18 44" fill="currentColor" opacity="0.7" />
      {/* Lower bout (wider) */}
      <path d="M12 44 Q4 46 2 50 Q2 54 6 55 Q10 56 15 56" fill="currentColor" opacity="0.7" />
      <path d="M18 44 Q26 46 28 50 Q28 54 24 55 Q20 56 15 56" fill="currentColor" opacity="0.7" />
      {/* Fill body centre */}
      <rect x="12" y="40" width="6" height="4" fill="currentColor" opacity="0.7" />
      {/* Sound hole */}
      <circle cx="15" cy="48" r="3.5" fill="var(--bg-card)" opacity="0.25" />
      {/* Rosette */}
      <circle cx="15" cy="48" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
      {/* Bridge */}
      <rect x="12" y="52" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      {/* Strings */}
      <line x1="14" y1="10" x2="14" y2="52" stroke="var(--bg-card)" strokeWidth="0.25" opacity="0.15" />
      <line x1="15" y1="10" x2="15" y2="52" stroke="var(--bg-card)" strokeWidth="0.25" opacity="0.15" />
      <line x1="16" y1="10" x2="16" y2="52" stroke="var(--bg-card)" strokeWidth="0.25" opacity="0.15" />
    </svg>
  );
}

function PrayerBookSVG({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 40 34" width="36" height="32" className="sm:w-[44px] sm:h-[38px]" style={{ overflow: 'visible' }}>
      {/* Back cover (visible when open) */}
      <rect x="3" y="2" width="22" height="30" rx="2" fill="currentColor"
        opacity={lit ? 0.4 : 0.15}
        style={{ transition: 'all 0.5s' }} />
      {/* Pages (visible when open) */}
      {lit && <>
        <rect x="5" y="3" width="19" height="28" rx="1" fill="#F5ECD5" opacity="0.5" />
        {/* Text lines on pages */}
        <line x1="8" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="8" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="8" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="8" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="8" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        <line x1="8" y1="23" x2="19" y2="23" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
      </>}
      {/* Front cover — swings open */}
      <g style={{
        transformOrigin: '3px 17px',
        transform: lit ? 'rotateY(-50deg)' : 'rotateY(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <rect x="2" y="1" width="22" height="30" rx="2" fill="currentColor"
          opacity={lit ? 0.7 : 0.15}
          style={{ transition: 'all 0.5s', filter: lit ? 'drop-shadow(0 0 8px rgba(201,168,76,0.5))' : 'none' }} />
        {/* Nine-pointed star on cover */}
        <polygon points="13,7 14.5,11 18.5,11 15.5,13.5 16.5,17.5 13,15 9.5,17.5 10.5,13.5 7.5,11 11.5,11"
          fill={lit ? '#F0D060' : 'var(--text-muted)'} opacity={lit ? 0.8 : 0.1} />
        <line x1="8" y1="21" x2="18" y2="21" stroke={lit ? '#F0D060' : 'var(--text-muted)'} strokeWidth="0.5" opacity={lit ? 0.4 : 0.08} />
        <line x1="9" y1="23.5" x2="17" y2="23.5" stroke={lit ? '#F0D060' : 'var(--text-muted)'} strokeWidth="0.5" opacity={lit ? 0.3 : 0.06} />
      </g>
      {/* Glow when open */}
      {lit && <ellipse cx="14" cy="16" rx="16" ry="18" fill="#C9A84C" opacity="0.04" />}
    </svg>
  );
}

// Items spread across card — avoiding bottom-left title zone (x<35 && y>55)
const ITEMS: { type: 'candle' | 'note' | 'guitar' | 'guitar2' | 'book' | 'book2'; x: number; y: number }[] = [
  // Row 1 (y 5-15) — no candle in top-left
  { type: 'note', x: 10, y: 10 },
  { type: 'note', x: 32, y: 12 },
  { type: 'candle', x: 54, y: 6 },
  { type: 'note', x: 76, y: 10 },
  { type: 'candle', x: 94, y: 8 },
  // Row 2 (y 25-38)
  { type: 'note', x: 16, y: 28 },
  { type: 'candle', x: 40, y: 32 },
  { type: 'guitar', x: 62, y: 26 },
  { type: 'note', x: 86, y: 34 },
  // Row 3 (y 45-55)
  { type: 'note', x: 10, y: 48 },
  { type: 'note', x: 34, y: 46 },
  { type: 'book2', x: 54, y: 50 },
  { type: 'candle', x: 76, y: 48 },
  { type: 'note', x: 94, y: 52 },
  // Candle next to Prayers title
  { type: 'candle', x: 28, y: 78 },
  // Row 4 (y 65-82) — nothing in bottom-left
  { type: 'guitar2', x: 42, y: 70 },
  { type: 'candle', x: 62, y: 66 },
  { type: 'note', x: 78, y: 72 },
  { type: 'book', x: 92, y: 68 },
  { type: 'candle', x: 52, y: 82 },
  { type: 'note', x: 88, y: 80 },
  { type: 'candle', x: 70, y: 78 },
];

const NOTE_FREQS = [523, 587, 659, 698, 784, 880, 988];

export function PrayersCard({ label }: { label: string }) {
  const [litCandles, setLitCandles] = useState<Set<number>>(new Set());
  const [bookOpen, setBookOpen] = useState(false);
  const [book2Open, setBook2Open] = useState(false);

  const lightCandle = useCallback((idx: number) => {
    setLitCandles(prev => new Set(prev).add(idx));
    setTimeout(() => {
      setLitCandles(prev => { const n = new Set(prev); n.delete(idx); return n; });
    }, 3000);
  }, []);

  const openBook = useCallback(() => {
    setBookOpen(true);
    setTimeout(() => setBookOpen(false), 2500);
  }, []);

  const openBook2 = useCallback(() => {
    setBook2Open(true);
    setTimeout(() => setBook2Open(false), 2500);
  }, []);

  let noteIdx = 0;

  return (
    <Link
      to="/prayers"
      className="home-card no-underline"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-interactive]')) e.preventDefault();
      }}
    >
      <div className="absolute inset-0">
        {ITEMS.map((item, i) => {
          if (item.type === 'candle') {
            const isLit = litCandles.has(i);
            return (
              <div key={i} data-interactive className="absolute cursor-pointer"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => lightCandle(i)}
              >
                <CandleSVG lit={isLit} />
              </div>
            );
          }
          if (item.type === 'note') {
            const freq = NOTE_FREQS[noteIdx % NOTE_FREQS.length];
            noteIdx++;
            return (
              <div key={i} data-interactive className="absolute cursor-pointer transition-all duration-200 hover:scale-125"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', opacity: 0.2 }}
                onMouseEnter={(e) => {
                  playChime(freq);
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#C9A84C';
                  el.style.opacity = '0.8';
                  el.style.filter = 'drop-shadow(0 0 4px rgba(201,168,76,0.4))';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--text-muted)';
                  el.style.opacity = '0.2';
                  el.style.filter = 'none';
                }}
              >
                <NoteSVG />
              </div>
            );
          }
          if (item.type === 'guitar') {
            return (
              <div key={i} data-interactive className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', opacity: 0.15 }}
                onMouseEnter={(e) => {
                  playStrum(0);
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#C9A84C';
                  el.style.opacity = '0.7';
                  el.style.filter = 'drop-shadow(0 0 6px rgba(201,168,76,0.3))';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--text-muted)';
                  el.style.opacity = '0.15';
                  el.style.filter = 'none';
                }}
              >
                <GuitarSVG />
              </div>
            );
          }
          if (item.type === 'guitar2') {
            return (
              <div key={i} data-interactive className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%) scaleX(-1)', color: 'var(--text-muted)', opacity: 0.15 }}
                onMouseEnter={(e) => {
                  playStrum(1);
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#8B6F47';
                  el.style.opacity = '0.7';
                  el.style.filter = 'drop-shadow(0 0 6px rgba(139,111,71,0.3))';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--text-muted)';
                  el.style.opacity = '0.15';
                  el.style.filter = 'none';
                }}
              >
                <GuitarSVG />
              </div>
            );
          }
          if (item.type === 'book') {
            return (
              <div key={i} data-interactive className="absolute cursor-pointer"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', color: '#7D9B8A' }}
                onMouseEnter={openBook}
              >
                <PrayerBookSVG lit={bookOpen} />
              </div>
            );
          }
          if (item.type === 'book2') {
            return (
              <div key={i} data-interactive className="absolute cursor-pointer"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', color: '#6B5B8A' }}
                onMouseEnter={openBook2}
              >
                <PrayerBookSVG lit={book2Open} />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10">
        <p className="font-body text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-semibold m-0 mb-1"
          style={{ color: '#7D9B8A', opacity: 0.7 }}>devotional</p>
        <h3 className="font-display text-[1.2rem] sm:text-[1.7rem] font-semibold m-0"
          style={{ color: 'var(--text-heading)' }}>{label}</h3>
      </div>
    </Link>
  );
}
