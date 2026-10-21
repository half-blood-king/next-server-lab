'use client';

import { useDeferredValue, useState } from 'react';

const THEMES = ['aurora', 'sunset', 'mono'] as const;

export function Studio() {
  const [title, setTitle] = useState('Streaming HTML from the server');
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('aurora');
  const [loaded, setLoaded] = useState('');
  const deferredTitle = useDeferredValue(title);
  const src = `/api/og?title=${encodeURIComponent(deferredTitle)}&theme=${theme}`;

  return (
    <div className="studio">
      <div className="card studio-controls">
        <label>
          Title
          <input value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="chips">
          {THEMES.map((t) => (
            <button key={t} className={t === theme ? 'chip on' : 'chip'} onClick={() => setTheme(t)}>
              {t}
            </button>
          ))}
        </div>
        <code className="url">{src}</code>
        <a className="btn ghost" href={src} target="_blank" rel="noreferrer">
          Open PNG ↗
        </a>
      </div>
      <div className={loaded === src ? 'og-frame' : 'og-frame loading'}>
        <img src={src} alt="Generated social card" width={1200} height={630} onLoad={() => setLoaded(src)} />
      </div>
    </div>
  );
}
