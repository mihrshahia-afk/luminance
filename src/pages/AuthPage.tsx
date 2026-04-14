import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const STAR_POINTS = '50,2 56.8,31.2 80.9,13.2 67.3,40 97.3,41.7 69.7,53.5 91.6,74 62.9,65.3 66.4,95.1 50,70 33.6,95.1 37.1,65.3 8.4,74 30.3,53.5 2.7,41.7 32.7,40 19.1,13.2 43.2,31.2';

export default function AuthPage() {
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/splash');
  }, [user, navigate]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (!displayName.trim()) { setError('Please enter your name.'); return; }
    }

    setSubmitting(true);
    if (mode === 'signup') {
      const { error: err } = await signUp(email, password, displayName.trim());
      if (err) setError(err);
      else { setSuccess('Account created! Check your email to confirm, then sign in.'); setMode('signin'); }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
      else navigate('/splash');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">

      {/* ── Left panel: hero artwork (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #031520 0%, #062D3F 40%, #0A4A63 100%)',
      }}>
        {/* Watermark stars */}
        <div className="absolute -right-24 -top-24 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 100 100" width="500" height="500" fill="white"><polygon points={STAR_POINTS} /></svg>
        </div>
        <div className="absolute -left-16 bottom-20 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" width="320" height="320" fill="white"><polygon points={STAR_POINTS} /></svg>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-gold/20" style={{
              left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
              animation: `particleFloat ${5 + i}s ease-in-out infinite ${i * 0.8}s`,
            }} />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-12 xl:px-20 relative z-10">
          <div className="mb-8">
            <svg viewBox="0 0 100 100" width="48" height="48" fill="#C9A84C" opacity="0.85">
              <polygon points={STAR_POINTS} />
            </svg>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,4vw,4rem)] font-extralight text-[#FAF7F0] tracking-[0.15em] uppercase leading-none mb-4">
            Luminance
          </h1>
          <div className="w-16 h-px mb-6" style={{ background: 'linear-gradient(to right, #C9A84C, transparent)' }} />
          <p className="font-reading text-[1.15rem] text-[#7BAFC4] leading-relaxed max-w-md mb-8 italic">
            &ldquo;The earth is but one country, and mankind its citizens.&rdquo;
          </p>
          <p className="font-reading text-[0.85rem] text-[#4A7080] tracking-wide">
            &mdash; Bah&aacute;&rsquo;u&rsquo;ll&aacute;h
          </p>
        </div>

        {/* Bottom */}
        <div className="px-12 xl:px-20 pb-8">
          <p className="text-[0.7rem] text-[#3A6070] font-body tracking-wide">
            A personal Bah&aacute;&rsquo;&iacute; library for sacred texts, prayers, and letters
          </p>
        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex-1 flex flex-col relative overflow-y-auto" style={{ background: 'var(--bg-page)' }}>

        {/* Mobile hero (shown only on small screens) */}
        <div className="lg:hidden relative overflow-hidden text-center" style={{
          background: 'linear-gradient(160deg, #031520 0%, #062D3F 40%, #0A4A63 100%)',
          padding: 'clamp(2rem, 8vw, 3.5rem) 2rem clamp(1.5rem, 6vw, 2.5rem)',
        }}>
          <div className="absolute -right-12 -top-12 opacity-[0.04] pointer-events-none">
            <svg viewBox="0 0 100 100" width="240" height="240" fill="white"><polygon points={STAR_POINTS} /></svg>
          </div>
          <svg viewBox="0 0 100 100" width="36" height="36" fill="#C9A84C" opacity="0.85" className="mx-auto mb-3">
            <polygon points={STAR_POINTS} />
          </svg>
          <h1 className="font-display text-[clamp(1.8rem,6vw,2.8rem)] font-extralight text-[#FAF7F0] tracking-[0.15em] uppercase leading-none mb-2">
            Luminance
          </h1>
          <p className="text-[0.65rem] text-gold/70 font-body tracking-[0.3em] uppercase">
            Bah&aacute;&rsquo;&iacute; Library
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8 sm:py-12">
          <div className="w-full max-w-[380px]">

            {/* Title */}
            <div className="mb-8">
              <h2 className="font-display text-[clamp(1.6rem,4vw,2.2rem)] font-light text-heading m-0 mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-muted font-body m-0">
                {mode === 'signin'
                  ? 'Sign in to sync your notes and favorites across devices'
                  : 'Join to save your annotations and reading progress'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#C87878]/8 border border-[#C87878]/15 text-sm text-[#C87878] font-body">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 rounded-xl bg-sage/8 border border-sage/15 text-sm text-sage font-body">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === 'signup' && (
                <div>
                  <label className="block text-[0.7rem] text-secondary mb-1.5 font-body uppercase tracking-[0.12em]">Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="auth-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-[0.7rem] text-secondary mb-1.5 font-body uppercase tracking-[0.12em]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="auth-input"
                />
              </div>

              <div>
                <label className="block text-[0.7rem] text-secondary mb-1.5 font-body uppercase tracking-[0.12em]">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="auth-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary bg-transparent border-none cursor-pointer p-1 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[0.7rem] text-secondary mb-1.5 font-body uppercase tracking-[0.12em]">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className="auth-input"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 mt-2 font-body text-sm font-medium rounded-xl border-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{
                  background: 'linear-gradient(135deg, #0B4F6C 0%, #083D54 100%)',
                  boxShadow: '0 2px 8px rgba(8, 61, 84, 0.3)',
                }}
              >
                {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[0.65rem] text-muted font-body uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Toggle + guest */}
            <div className="space-y-3 text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
                className="w-full py-3 rounded-xl border border-border bg-transparent text-sm text-heading font-body cursor-pointer hover:border-gold/50 hover:text-gold transition-all"
              >
                {mode === 'signin' ? 'Create a new account' : 'I already have an account'}
              </button>
              <button
                onClick={() => navigate('/splash')}
                className="text-[0.75rem] text-muted bg-transparent border-none cursor-pointer font-body hover:text-secondary transition-colors"
              >
                Continue as guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
