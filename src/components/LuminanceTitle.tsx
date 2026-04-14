import { useState, useRef, useCallback } from 'react';

interface Props {
  className?: string;
}

const LETTERS = 'LUMINANCE'.split('');

export default function LuminanceTitle({ className = '' }: Props) {
  const [lit, setLit] = useState<number[]>([]);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const containerRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const levels: number[] = new Array(LETTERS.length).fill(-1);
    letterRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(clientX - center);
      if (dist < 20) levels[i] = 3;
      else if (dist < 50) levels[i] = 2;
      else if (dist < 90) levels[i] = 1;
      else if (dist < 130) levels[i] = 0;
    });
    setLit(levels);

    // Position the radial glow relative to the container
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setGlowPos({
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true,
      });
    }
  }, []);

  const handleLeave = useCallback(() => {
    setLit([]);
    setGlowPos(prev => ({ ...prev, active: false }));
  }, []);

  return (
    <span
      ref={containerRef}
      className={`luminance-title inline-flex ${className}`}
      style={{ position: 'relative' }}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
      onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleLeave}
    >
      {/* Radial glow that follows the cursor */}
      <span
        className="pointer-events-none absolute"
        style={{
          left: glowPos.x,
          top: glowPos.y,
          width: 200,
          height: 200,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.08) 35%, transparent 70%)',
          opacity: glowPos.active ? 1 : 0,
          transition: 'opacity 0.2s ease',
          borderRadius: '50%',
        }}
      />
      {LETTERS.map((ch, i) => (
        <span
          key={i}
          ref={el => { letterRefs.current[i] = el; }}
          className={`luminance-letter${lit[i] >= 0 ? ` lit-${lit[i]}` : ''}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
