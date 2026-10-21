import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requestInfo, sleep } from '@/lib/request';
import { HydrationMark } from './HydrationMark';
import { ReloadButton } from './ReloadButton';

export const metadata: Metadata = { title: 'Streaming' };
export const dynamic = 'force-dynamic';

const SCALE = 3200; // ms represented by the full width of the waterfall

const SOURCES = [
  { name: 'Inventory service', icon: '📦', color: '#38bdf8' },
  { name: 'Recommendation model', icon: '🧠', color: '#a78bfa' },
  { name: 'Analytics warehouse', icon: '📊', color: '#f472b6' },
];

export default async function StreamingPage() {
  const { start } = await requestInfo();
  // Random latencies each request, so the boundaries resolve in a different order every time.
  const delays = [500 + Math.random() * 600, 1100 + Math.random() * 900, 1900 + Math.random() * 1100].sort(
    () => Math.random() - 0.5,
  );
  const shellAt = Date.now() - start;

  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">RSC · Suspense · chunked HTML</p>
        <h1>Streaming with Suspense</h1>
        <p className="lede">
          The page shell is flushed straight away. Each panel below is an <code>async</code> Server Component behind
          its own <code>&lt;Suspense&gt;</code>, and its HTML is streamed into the same response when its data
          resolves. Reload to see a different order.
        </p>
        <ReloadButton />
      </header>

      <div className="waterfall card">
        <div className="wf-row">
          <span className="wf-label">Shell flushed</span>
          <div className="wf-track">
            <div className="wf-bar shell" style={{ width: `${(shellAt / SCALE) * 100}%` }} />
            <span className="wf-ms">{shellAt} ms</span>
          </div>
        </div>
        {SOURCES.map((s, i) => (
          <Suspense key={s.name} fallback={<PendingRow name={s.name} />}>
            <SlowRow source={s} delay={delays[i]} start={start} />
          </Suspense>
        ))}
        <div className="wf-axis">
          {[0, 800, 1600, 2400, 3200].map((t) => (
            <span key={t} style={{ left: `${(t / SCALE) * 100}%` }}>
              {t}ms
            </span>
          ))}
        </div>
      </div>

      <HydrationMark />
    </main>
  );
}

function PendingRow({ name }: { name: string }) {
  return (
    <div className="wf-row pending">
      <span className="wf-label">{name}</span>
      <div className="wf-track">
        <div className="wf-bar loading" />
        <span className="wf-ms">waiting…</span>
      </div>
    </div>
  );
}

async function SlowRow({
  source,
  delay,
  start,
}: {
  source: (typeof SOURCES)[number];
  delay: number;
  start: number;
}) {
  await sleep(delay);
  const at = Date.now() - start;
  return (
    <div className="wf-row arrived">
      <span className="wf-label">
        {source.icon} {source.name}
      </span>
      <div className="wf-track">
        <div className="wf-bar" style={{ width: `${(at / SCALE) * 100}%`, background: source.color }} />
        <span className="wf-ms">{at} ms</span>
      </div>
    </div>
  );
}
