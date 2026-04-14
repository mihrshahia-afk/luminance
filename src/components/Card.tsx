import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  to?: string;
  accentColor?: string;
  accentPosition?: 'top' | 'left';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  to,
  accentColor,
  accentPosition = 'top',
  children,
  className = '',
  onClick,
}: CardProps) {
  const accent = accentColor ? (
    accentPosition === 'top'
      ? <div className="h-[3px] w-full" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}99)` }} />
      : <div className="w-1 shrink-0" style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}55)` }} />
  ) : null;

  const inner = (
    <>
      {accentPosition === 'top' && accent}
      <div className={`flex ${accentPosition === 'left' ? 'flex-row' : 'flex-col'}`}>
        {accentPosition === 'left' && accent}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </>
  );

  const baseClass = `card-elevated block text-decoration-none ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${baseClass} no-underline`}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} text-left w-full border border-border`} style={{ cursor: 'pointer' }}>
        {inner}
      </button>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}
