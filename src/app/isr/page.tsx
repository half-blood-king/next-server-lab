import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { RegenClock } from './RegenClock';

export const metadata: Metadata = { title: 'ISR' };

// Cache the rendered HTML; regenerate in the background at most every 20 s.
export const revalidate = 20;

/** Tiny seeded PRNG so the artwork is a pure function of the generation time. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function revalidateNow() {
  'use server';
  revalidatePath('/isr');
}

export default function IsrPage() {
  const generatedAt = Date.now();
  const rand = mulberry32(generatedAt);
  const hue = Math.floor(rand() * 360);
  const blobs = Array.from({ length: 7 }, () => ({
    cx: 40 + rand() * 320,
    cy: 40 + rand() * 220,
    r: 30 + rand() * 90,
    h: (hue + rand() * 120) % 360,
  }));

  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">revalidate = 20 · revalidatePath · stale-while-revalidate</p>
        <h1>This page is a cached snapshot</h1>
        <p className="lede">
          The artwork below is generated from the time the server rendered this page. Reloading serves the same
          cached HTML until it is 20 seconds old. The next request after that still gets the old copy instantly while
          Next regenerates in the background, and the request after <em>that</em> sees new art. The button skips the
          wait with on-demand revalidation. (Run <code>npm run build &amp;&amp; npm start</code>, since dev mode
          renders every request.)
        </p>
      </header>

      <div className="split">
        <section className="card art-card">
          <svg viewBox="0 0 400 300" className="snapshot" role="img" aria-label="Generated artwork">
            <defs>
              <filter id="blur">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <rect width="400" height="300" fill={`hsl(${hue} 50% 8%)`} />
            <g filter="url(#blur)">
              {blobs.map((b, i) => (
                <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`hsl(${b.h} 85% 60%)`} fillOpacity={0.7} />
              ))}
            </g>
            <text x="20" y="280" className="snap-label">
              snapshot #{generatedAt.toString(36).slice(-6)}
            </text>
          </svg>
        </section>

        <aside className="card">
          <RegenClock generatedAt={generatedAt} revalidate={revalidate} />
          <form action={revalidateNow}>
            <button className="btn">Revalidate now</button>
          </form>
          <p className="muted small">
            After clicking, the action purges the cache entry and the router refetches, so you get fresh art at once.
          </p>
        </aside>
      </div>
    </main>
  );
}
