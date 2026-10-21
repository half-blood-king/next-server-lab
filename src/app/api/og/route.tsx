import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const THEMES = {
  aurora: { bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)', a: '#38bdf8', b: '#34d399' },
  sunset: { bg: 'linear-gradient(135deg, #1c1917 0%, #7c2d12 55%, #831843 100%)', a: '#fbbf24', b: '#f472b6' },
  mono: { bg: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)', a: '#fafafa', b: '#a1a1aa' },
} as const;

type Theme = keyof typeof THEMES;

/** GET /api/og?title=...&theme=aurora renders a 1200×630 PNG from JSX at the edge. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Server Lab').slice(0, 90);
  const themeKey = (searchParams.get('theme') ?? 'aurora') as Theme;
  const t = THEMES[themeKey] ?? THEMES.aurora;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: t.bg,
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: t.a,
            opacity: 0.18,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 140,
            bottom: -180,
            width: 380,
            height: 380,
            borderRadius: 9999,
            background: t.b,
            opacity: 0.16,
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, opacity: 0.85 }}>
          <div style={{ width: 22, height: 22, borderRadius: 9999, background: t.a, display: 'flex' }} />
          Server Lab
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 40 ? 64 : 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 24 }}>
          {['Next.js', 'Edge', 'next/og'].map((tag) => (
            <div
              key={tag}
              style={{
                display: 'flex',
                padding: '8px 18px',
                borderRadius: 999,
                border: `2px solid ${t.b}`,
                color: t.b,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
