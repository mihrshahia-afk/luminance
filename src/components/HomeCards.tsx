import { useState, useRef, useCallback, useEffect } from 'react';
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
   3. LETTERS — floating letters drifting in the wind
   ═══════════════════════════════════════════════════════════════ */

interface LetterState {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  phase: number;    // sinusoidal wobble offset
  freq: number;     // wobble frequency
  amp: number;      // wobble amplitude
  size: number;     // 0.7–1.1 scale
  variant: number;  // which SVG scribble pattern (0–3)
  opacity: number;
}

const LETTER_COUNT = 12;
const WIND_RADIUS = 130;   // px — mouse influence radius
const WIND_STRENGTH = 0.4;
const DRIFT_SPEED = 0.25;
const FRICTION = 0.985;
const ROT_FRICTION = 0.97;

function spawnLetter(w: number, h: number, edge?: number): LetterState {
  // Spawn from a random edge (0=left, 1=right, 2=top, 3=bottom)
  const e = edge ?? Math.floor(Math.random() * 4);
  let x: number, y: number;
  if (e === 0) { x = -30; y = Math.random() * h; }
  else if (e === 1) { x = w + 30; y = Math.random() * h; }
  else if (e === 2) { x = Math.random() * w; y = -30; }
  else { x = Math.random() * w; y = h + 30; }

  return {
    x, y,
    vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
    vy: (Math.random() - 0.5) * DRIFT_SPEED,
    rot: (Math.random() - 0.5) * 30,
    rotV: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
    freq: 0.015 + Math.random() * 0.01,
    amp: 8 + Math.random() * 6,
    size: 0.6 + Math.random() * 0.45,
    variant: Math.floor(Math.random() * 4),
    opacity: 0.7 + Math.random() * 0.25,
  };
}

function LetterSVG({ variant, time }: { variant: number; time: number }) {
  // 1800s scroll — fully wavy body with 3D curvature shading, no crossing lines
  const heights = [78, 88, 72, 82];
  const h = heights[variant % 4];
  const w = 38;
  const gid = `pg${variant}`;

  // Animated wave function — drives all edge undulation + 3D shading
  const wt = time * 0.03 + variant * 2.5;
  const wave = (i: number, amp: number) => Math.sin(wt + i * 0.9) * amp;

  // Aged parchment tones
  const fills = ['#C8B078', '#BFA86C', '#C4AA70', '#B8A068'];
  const darks = ['#A08050', '#988048', '#9C8450', '#907848'];
  const paper = fills[variant % 4];
  const edge = darks[variant % 4];

  // Fully wavy body path — all 4 edges undulate
  const lw1 = wave(0, 2.5), lw2 = wave(1, 3), lw3 = wave(2, 2.5);
  const rw1 = wave(3, 2.5), rw2 = wave(4, 3), rw3 = wave(5, 2.5);
  const tw1 = wave(6, 2), tw2 = wave(7, 1.5);
  const bw1 = wave(8, 2), bw2 = wave(9, 1.5);

  const bodyPath = `
    M ${4 + lw1} ${10 + tw1}
    Q ${3 + lw1} ${h * 0.3} ${3.5 + lw2} ${h * 0.5}
    Q ${3 + lw2} ${h * 0.7} ${4 + lw3} ${h - 8 + bw1}
    Q ${w * 0.3} ${h - 5 + bw1} ${w * 0.5} ${h - 6 + bw2}
    Q ${w * 0.7} ${h - 5 + bw2} ${w - 2 + rw3} ${h - 8 + bw1}
    Q ${w - 1 + rw2} ${h * 0.7} ${w - 1.5 + rw2} ${h * 0.5}
    Q ${w - 1 + rw1} ${h * 0.3} ${w - 2 + rw1} ${10 + tw2}
    Q ${w * 0.7} ${8 + tw2} ${w * 0.5} ${9 + tw1}
    Q ${w * 0.3} ${8 + tw1} ${4 + lw1} ${10 + tw1}
    Z
  `;

  // 3D curvature bands — light/dark strips that follow the wave to simulate paper curling
  const curveBands = [];
  for (let i = 0; i < 4; i++) {
    const frac = 0.2 + i * 0.2;
    const y = 10 + frac * (h - 18);
    const waveOffset = wave(i + 10, 2);
    const isLight = i % 2 === 0;
    curveBands.push(
      <path key={i}
        d={`M ${4 + wave(i, 2)} ${y + waveOffset} Q ${w * 0.5} ${y + waveOffset + wave(i + 5, 3)} ${w - 2 + wave(i + 3, 2)} ${y + waveOffset}`}
        fill="none"
        stroke={isLight ? 'rgba(255,255,240,0.12)' : 'rgba(80,60,30,0.08)'}
        strokeWidth={isLight ? 8 : 6}
        strokeLinecap="round"
      />
    );
  }

  // Scroll roll height
  const rollH = 5;
  const topY = 10 + (tw1 + tw2) * 0.5;
  const botY = h - 7 + (bw1 + bw2) * 0.5;

  // Wax seal — only on some variants, no crossing lines
  const seals = [
    <><circle cx={w - 10} cy={h - 16} r="4" fill="#8B2020" opacity="0.55" />
      <circle cx={w - 10} cy={h - 16} r="2.2" fill="#A03030" opacity="0.45" /></>,
    <><circle cx={w - 10} cy={h - 16} r="3.5" fill="#B8963C" opacity="0.5" />
      <circle cx={w - 10} cy={h - 16} r="1.8" fill="#C9A84C" opacity="0.45" /></>,
    null,
    <><circle cx={w - 10} cy={h - 16} r="3" fill="#8B2020" opacity="0.5" />
      <circle cx={w - 10} cy={h - 16} r="1.5" fill="#A03030" opacity="0.4" /></>,
  ];

  return (
    <svg viewBox={`0 0 ${w + 4} ${h + 4}`} width={w + 4} height={h + 4} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="40%" stopColor={fills[(variant + 1) % 4]} />
          <stop offset="60%" stopColor={paper} />
          <stop offset="100%" stopColor={darks[(variant + 2) % 4]} />
        </linearGradient>
        <clipPath id={`clip${variant}`}><path d={bodyPath} /></clipPath>
      </defs>

      {/* Drop shadow */}
      <path d={bodyPath} fill="rgba(0,0,0,0.15)" transform="translate(2.5, 3)" />

      {/* Main parchment body */}
      <path d={bodyPath} fill={`url(#${gid})`} stroke={edge} strokeWidth="0.5" />

      {/* 3D curvature shading bands (clipped to body) */}
      <g clipPath={`url(#clip${variant})`}>
        {curveBands}
        {/* Age spots */}
        <circle cx={12 + variant * 3} cy={25 + variant * 6} r={5} fill={edge} opacity="0.05" />
        <circle cx={w - 6 - variant * 2} cy={h - 22} r={3.5} fill={darks[(variant + 1) % 4]} opacity="0.04" />
      </g>

      {/* Top scroll roll */}
      <ellipse cx={w / 2 + 1} cy={topY} rx={w / 2} ry={rollH / 2 + 0.5}
        fill={edge} opacity="0.55" />
      <ellipse cx={w / 2 + 1} cy={topY} rx={w / 2} ry={rollH / 2}
        fill={paper} opacity="0.75" />
      <ellipse cx={w / 2 + 1} cy={topY - 0.8} rx={w / 2 - 3} ry={1.2}
        fill="rgba(255,255,240,0.2)" />

      {/* Bottom scroll roll */}
      <ellipse cx={w / 2 + 1} cy={botY} rx={w / 2} ry={rollH / 2 + 0.5}
        fill={edge} opacity="0.55" />
      <ellipse cx={w / 2 + 1} cy={botY} rx={w / 2} ry={rollH / 2}
        fill={paper} opacity="0.75" />
      <ellipse cx={w / 2 + 1} cy={botY + 0.8} rx={w / 2 - 3} ry={1.2}
        fill="rgba(255,255,240,0.15)" />

      {/* Wax seal (some variants only) */}
      {seals[variant % 4]}
    </svg>
  );
}

export function LettersCard({ label }: { label: string }) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const stateRef = useRef<LetterState[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, prevX: -999, prevY: -999, inside: false });
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const [renderTick, setRenderTick] = useState(0);

  // Initialize letters
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    // Spawn letters scattered inside the card
    stateRef.current = Array.from({ length: LETTER_COUNT }, () => ({
      ...spawnLetter(w, h),
      x: 30 + Math.random() * (w - 60),
      y: 20 + Math.random() * (h - 40),
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }
      const { width: w, height: h } = el.getBoundingClientRect();
      const mouse = mouseRef.current;
      const letters = stateRef.current;
      timeRef.current++;
      const t = timeRef.current;

      // Compute mouse velocity (wind direction)
      const mvx = mouse.inside ? (mouse.x - mouse.prevX) * 0.5 : 0;
      const mvy = mouse.inside ? (mouse.y - mouse.prevY) * 0.5 : 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      for (const L of letters) {
        // Gentle ambient drift (slight rightward + downward)
        L.vx += (Math.random() - 0.48) * 0.02;
        L.vy += (Math.random() - 0.47) * 0.01;

        // Mouse wind force
        if (mouse.inside && (Math.abs(mvx) > 0.3 || Math.abs(mvy) > 0.3)) {
          const dx = L.x - mouse.x;
          const dy = L.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < WIND_RADIUS && dist > 5) {
            const falloff = 1 - dist / WIND_RADIUS;
            const force = falloff * falloff * WIND_STRENGTH;
            // Push letter in the direction the mouse is moving
            L.vx += mvx * force;
            L.vy += mvy * force;
            // Also slight rotational push
            L.rotV += (mvx > 0 ? 1 : -1) * force * 2;
          }
        }

        // Apply friction
        L.vx *= FRICTION;
        L.vy *= FRICTION;
        L.rotV *= ROT_FRICTION;

        // Clamp velocity
        const maxV = 3;
        const speed = Math.sqrt(L.vx * L.vx + L.vy * L.vy);
        if (speed > maxV) { L.vx *= maxV / speed; L.vy *= maxV / speed; }

        // Update position
        L.x += L.vx;
        L.y += L.vy + Math.sin(t * L.freq + L.phase) * 0.3; // gentle vertical wave
        L.rot += L.rotV;

        // Wrap around edges (with margin)
        const m = 50;
        if (L.x < -m) L.x = w + m * 0.5;
        if (L.x > w + m) L.x = -m * 0.5;
        if (L.y < -m) L.y = h + m * 0.5;
        if (L.y > h + m) L.y = -m * 0.5;
      }

      setRenderTick(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.inside = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.inside = false;
  }, []);

  // Touch support
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !e.touches[0]) return;
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    mouseRef.current.prevX = mouseRef.current.x;
    mouseRef.current.prevY = mouseRef.current.y;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.inside = true;
  }, []);

  void renderTick; // used for re-render trigger

  return (
    <Link
      to="/letters"
      className="home-card no-underline"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      {/* Title on LEFT */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10">
        <p className="font-body text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] uppercase font-semibold m-0 mb-1"
          style={{ color: '#8B6F47', opacity: 0.7 }}>guidance</p>
        <h3 className="font-display text-[1.2rem] sm:text-[1.7rem] font-semibold m-0"
          style={{ color: 'var(--text-heading)' }}>{label}</h3>
      </div>

      {/* Floating letters */}
      {stateRef.current.map((L, i) => {
        const t = timeRef.current;
        // Paper flutter: skewX/Y oscillation for wavy paper-in-wind effect
        const flutter = Math.sin(t * L.freq * 1.7 + L.phase) * 4;
        const tilt = Math.sin(t * L.freq * 0.8 + L.phase + 1) * 2.5;
        return (
          <div key={i} className="absolute pointer-events-none" style={{
            left: L.x,
            top: L.y,
            transform: `translate(-50%, -50%) rotate(${L.rot}deg) skewX(${flutter}deg) skewY(${tilt}deg) scale(${L.size})`,
            opacity: L.opacity,
            willChange: 'transform',
            filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.15))',
          }}>
            <LetterSVG variant={L.variant} time={t + i * 100} />
          </div>
        );
      })}
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
