import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

// Shrine of Bahá'u'lláh (Bahjí, near 'Akká, Israel)
const QIBLIH_LAT = 32.9432;
const QIBLIH_LNG = 35.0924;

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

function calcBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearingLabel(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Nine-pointed star SVG
const StarSVG = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="currentColor">
    <polygon points="50,2 56.8,31.2 80.9,13.2 67.3,40 97.3,41.7 69.7,53.5 91.6,74 62.9,65.3 66.4,95.1 50,70 33.6,95.1 37.1,65.3 8.4,74 30.3,53.5 2.7,41.7 32.7,40 19.1,13.2 43.2,31.2" />
  </svg>
);

type Phase = 'idle' | 'loading' | 'active' | 'no-compass' | 'error' | 'denied';

export default function QiblihPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bearing, setBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // Raw compass heading from sensor (degrees from true north)
  const rawHeading = useRef(0);
  // Smoothed heading for display
  const [smoothHeading, setSmoothHeading] = useState(0);
  const smoothRef = useRef(0);
  const animFrameRef = useRef(0);
  const orientationHandler = useRef<((e: Event) => void) | null>(null);

  // Smooth animation loop
  useEffect(() => {
    const loop = () => {
      let diff = rawHeading.current - smoothRef.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      smoothRef.current = (smoothRef.current + diff * 0.15 + 360) % 360;
      setSmoothHeading(smoothRef.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Orientation event handler
  const onOrientation = useCallback((e: Event) => {
    const evt = e as DeviceOrientationEvent;

    // iOS: webkitCompassHeading gives degrees from magnetic north (0 = north)
    const webkit = (evt as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
    if (webkit !== undefined && webkit !== null) {
      rawHeading.current = webkit;
      return;
    }

    // Android with deviceorientationabsolute: alpha is degrees from true north
    // alpha = 0 means device points north, increases counter-clockwise
    if (evt.absolute && evt.alpha !== null) {
      rawHeading.current = (360 - evt.alpha) % 360;
      return;
    }

    // Fallback: regular deviceorientation alpha (may not be absolute)
    if (evt.alpha !== null) {
      rawHeading.current = (360 - evt.alpha) % 360;
    }
  }, []);

  const startCompass = useCallback(async () => {
    setPhase('loading');

    // 1. Get GPS
    if (!navigator.geolocation) {
      setPhase('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserPos({ lat, lng });
      setBearing(calcBearing(lat, lng, QIBLIH_LAT, QIBLIH_LNG));
      setDistance(calcDistance(lat, lng, QIBLIH_LAT, QIBLIH_LNG));
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr.code === 1) {
        // PERMISSION_DENIED
        setPhase('denied');
      } else {
        setPhase('error');
        setErrorMsg(geoErr.message || 'Could not get your location.');
      }
      return;
    }

    // 2. Set up compass
    let compassWorking = false;

    // iOS 13+ requires explicit permission
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === 'function') {
      try {
        const perm = await DOE.requestPermission();
        if (perm === 'granted') {
          orientationHandler.current = onOrientation;
          window.addEventListener('deviceorientation', onOrientation);
          compassWorking = true;
        }
      } catch {
        // Permission denied or error
      }
    } else {
      // Android / desktop: try deviceorientationabsolute first (true north)
      orientationHandler.current = onOrientation;

      // Check if we get any orientation events
      const w = window as unknown as EventTarget & { ondeviceorientationabsolute?: unknown };
      const hasAbsolute = 'ondeviceorientationabsolute' in window;
      const eventName = hasAbsolute ? 'deviceorientationabsolute' : 'deviceorientation';

      // Listen for compass events
      w.addEventListener(eventName, onOrientation as EventListener);
      orientationHandler.current = onOrientation;

      // Also listen on regular deviceorientation as fallback
      if (hasAbsolute) {
        window.addEventListener('deviceorientation', onOrientation);
      }

      // Wait to see if we actually receive events
      const gotEvent = await new Promise<boolean>((resolve) => {
        let received = false;
        const check = (e: Event) => {
          const evt = e as DeviceOrientationEvent;
          if (evt.alpha !== null) { received = true; resolve(true); }
        };
        w.addEventListener(eventName, check as EventListener);
        window.addEventListener('deviceorientation', check);
        setTimeout(() => {
          w.removeEventListener(eventName, check as EventListener);
          window.removeEventListener('deviceorientation', check);
          if (!received) resolve(false);
        }, 1500);
      });

      compassWorking = gotEvent;
    }

    setPhase(compassWorking ? 'active' : 'no-compass');
  }, [onOrientation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (orientationHandler.current) {
        const handler = orientationHandler.current as EventListener;
        window.removeEventListener('deviceorientation', handler);
        (window as EventTarget).removeEventListener('deviceorientationabsolute', handler);
      }
    };
  }, []);

  // Arrow rotation: point from current heading toward the Qiblih bearing
  const arrowDeg = bearing - smoothHeading;

  // Compass ring rotation: rotate so N stays at true north
  const ringDeg = -smoothHeading;

  const compassSize = 'w-64 h-64 sm:w-72 sm:h-72';

  return (
    <div className="flex-1 flex flex-col items-center w-full px-4 py-6 sm:py-12">
      <div className="max-w-md w-full text-center">

        <p className="section-label mb-2">Direction of Prayer</p>
        <h1 className="page-title text-[clamp(1.6rem,4vw,2.4rem)] mb-1">Qiblih</h1>
        <p className="text-xs text-muted font-body m-0 mb-6 sm:mb-8">
          Shrine of Bah&aacute;&rsquo;u&rsquo;ll&aacute;h &middot; Bahj&iacute;, &rsquo;Akk&aacute;
        </p>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div>
            <div className={`${compassSize} mx-auto rounded-full border-2 border-border flex items-center justify-center mb-6`} style={{ background: 'var(--bg-card)' }}>
              <StarSVG size={40} className="text-gold/20" />
            </div>
            <button
              onClick={startCompass}
              className="px-8 py-3.5 font-body text-sm font-medium rounded-xl border-none cursor-pointer transition-opacity text-white"
              style={{ background: 'linear-gradient(135deg, #0B4F6C, #083D54)', boxShadow: '0 2px 8px rgba(8,61,84,0.3)' }}
            >
              Enable Compass
            </button>
            <p className="text-[0.65rem] text-muted font-body mt-3">Requires location &amp; motion permissions</p>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === 'loading' && (
          <div>
            <div className={`${compassSize} mx-auto rounded-full border-2 border-border flex items-center justify-center`} style={{ background: 'var(--bg-card)' }}>
              <Loader2 size={32} className="text-gold animate-spin" />
            </div>
            <p className="text-sm text-muted font-body mt-4">Locating you&hellip;</p>
          </div>
        )}

        {/* ── ACTIVE COMPASS ── */}
        {(phase === 'active' || phase === 'no-compass') && (
          <div>
            <div
              className={`${compassSize} mx-auto rounded-full relative flex items-center justify-center mb-5`}
              style={{
                background: 'var(--bg-card)',
                border: '2px solid rgba(201,168,76,0.25)',
                boxShadow: '0 0 30px rgba(201,168,76,0.06), inset 0 0 20px rgba(201,168,76,0.03)',
              }}
            >
              {/* Rotating ring — N/S/E/W stay aligned to true north */}
              <div className="absolute inset-0 rounded-full" style={{ transform: `rotate(${ringDeg}deg)` }}>
                {/* Cardinal labels */}
                <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[0.75rem] font-body font-bold text-gold">N</span>
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[0.6rem] font-body text-muted/60">S</span>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.6rem] font-body text-muted/60">E</span>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[0.6rem] font-body text-muted/60">W</span>

                {/* Degree ticks */}
                {Array.from({ length: 36 }).map((_, i) => {
                  const major = i % 9 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1"
                      style={{
                        width: major ? 2 : 1,
                        height: major ? 12 : 6,
                        background: major ? '#C9A84C' : 'var(--border)',
                        transformOrigin: '50% calc(50vmin - 4px)',
                        transform: `translateX(-50%) rotate(${i * 10}deg)`,
                        opacity: major ? 0.8 : 0.3,
                      }}
                    />
                  );
                })}
              </div>

              {/* Qiblih arrow — always points toward Bahjí */}
              <div className="absolute inset-0 rounded-full" style={{ transform: `rotate(${arrowDeg}deg)` }}>
                {/* Arrow head (pointing up = toward Qiblih) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: '8%' }}>
                  <StarSVG size={16} className="text-gold mb-0.5" />
                  <div className="w-0 h-0" style={{
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '14px solid #C9A84C',
                  }} />
                </div>
                {/* Arrow shaft */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[3px] bg-gold/70 rounded"
                  style={{ top: 'calc(8% + 30px)', bottom: '50%' }} />
                {/* Tail */}
                <div className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-muted/20 rounded"
                  style={{ top: '52%', bottom: '25%' }} />
              </div>

              {/* Center dot */}
              <div className="w-4 h-4 rounded-full border-2 z-10"
                style={{ background: '#C9A84C', borderColor: 'var(--bg-card)', boxShadow: '0 0 8px rgba(201,168,76,0.5)' }} />
            </div>

            {/* Bearing info */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} className="text-gold" />
                <span className="text-sm font-body text-primary font-medium">
                  {Math.round(bearing)}&deg; {getBearingLabel(bearing)}
                </span>
              </div>
              <p className="text-xs text-muted font-body">
                {Math.round(distance).toLocaleString()} km to Bahj&iacute;
              </p>
              {userPos && (
                <p className="text-[0.6rem] text-muted/50 font-body">
                  {userPos.lat.toFixed(4)}&deg;, {userPos.lng.toFixed(4)}&deg;
                </p>
              )}
            </div>

            {phase === 'no-compass' && (
              <div className="p-3 rounded-lg bg-gold/5 border border-gold/15 text-xs text-secondary font-body max-w-xs mx-auto">
                Compass sensor not detected. Face {Math.round(bearing)}&deg; {getBearingLabel(bearing)} from North.
              </div>
            )}

            {phase === 'active' && (
              <p className="text-[0.6rem] text-muted/40 font-body">
                Hold your device flat and rotate to align the arrow
              </p>
            )}
          </div>
        )}

        {/* ── ERROR ── */}
        {/* ── PERMISSION DENIED ── */}
        {phase === 'denied' && (
          <div>
            <div className={`${compassSize} mx-auto rounded-full border-2 border-border flex items-center justify-center mb-5`} style={{ background: 'var(--bg-card)' }}>
              <MapPin size={36} className="text-muted/20" />
            </div>
            <p className="text-sm text-secondary font-body font-medium mb-3">Location permission denied</p>
            <div className="text-left p-4 rounded-xl border border-border max-w-xs mx-auto mb-5" style={{ background: 'var(--bg-card)' }}>
              <p className="text-xs text-secondary font-body font-medium mb-2">To enable on iPhone (Safari):</p>
              <ol className="text-[0.7rem] text-muted font-body space-y-1.5 pl-4 m-0 list-decimal">
                <li>Open <b>Settings</b> &gt; <b>Safari</b></li>
                <li>Tap <b>Settings for Websites</b> &gt; <b>Location</b></li>
                <li>Set to <b>Ask</b> or delete this site</li>
                <li>Come back and tap the button below</li>
              </ol>
              <p className="text-xs text-secondary font-body font-medium mt-3 mb-2">On Android (Chrome):</p>
              <ol className="text-[0.7rem] text-muted font-body space-y-1.5 pl-4 m-0 list-decimal">
                <li>Tap the <b>lock icon</b> in the address bar</li>
                <li>Tap <b>Permissions</b> &gt; <b>Location</b></li>
                <li>Set to <b>Allow</b></li>
              </ol>
            </div>
            <button onClick={startCompass} className="px-6 py-3 font-body text-sm font-medium rounded-xl border-none cursor-pointer text-white"
              style={{ background: 'linear-gradient(135deg, #0B4F6C, #083D54)' }}>
              Try Again
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <div>
            <div className={`${compassSize} mx-auto rounded-full border-2 border-border flex items-center justify-center mb-5`} style={{ background: 'var(--bg-card)' }}>
              <StarSVG size={40} className="text-muted/15" />
            </div>
            <p className="text-sm text-secondary font-body mb-4">{errorMsg}</p>
            <button onClick={startCompass} className="px-5 py-2.5 bg-accent text-white font-body text-sm rounded-xl border-none cursor-pointer">
              Try Again
            </button>
          </div>
        )}

        {/* About */}
        <div className="border-t border-border pt-5 mt-6">
          <p className="text-[0.7rem] text-muted font-body leading-relaxed max-w-sm mx-auto">
            The Qiblih is the point of adoration to which Bah&aacute;&rsquo;&iacute;s turn when reciting obligatory prayers. It is the resting place of Bah&aacute;&rsquo;u&rsquo;ll&aacute;h at Bahj&iacute;.
          </p>
        </div>
      </div>
    </div>
  );
}
