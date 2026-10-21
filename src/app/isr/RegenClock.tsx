'use client';

import { useEffect, useState } from 'react';

export function RegenClock({ generatedAt, revalidate }: { generatedAt: number; revalidate: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  const age = now === null ? 0 : Math.max(0, (now - generatedAt) / 1000);
  const frac = Math.min(age / revalidate, 1);
  const stale = age >= revalidate;
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <div className="regen">
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r={R} fill="none" stroke="#ffffff12" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke={stale ? '#f472b6' : '#34d399'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          transform="rotate(-90 65 65)"
        />
        <text x="65" y="62" textAnchor="middle" className="regen-num">
          {age.toFixed(1)}s
        </text>
        <text x="65" y="80" textAnchor="middle" className="regen-sub">
          old
        </text>
      </svg>
      <div>
        <p className={stale ? 'state stale' : 'state fresh'}>{stale ? 'Stale' : 'Fresh'}</p>
        <p className="muted small">
          Rendered at <code>{new Date(generatedAt).toISOString().slice(11, 19)}Z</code>.{' '}
          {stale ? 'Reload once to trigger regeneration, then again to see it.' : `Cached for ${revalidate}s.`}
        </p>
      </div>
    </div>
  );
}
