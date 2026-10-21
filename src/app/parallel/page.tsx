import type { Metadata } from 'next';
import { Suspense } from 'react';
import { sleep } from '@/lib/request';
import { ReloadButton } from '../streaming/ReloadButton';

export const metadata: Metadata = { title: 'Parallel fetching' };
export const dynamic = 'force-dynamic';

const CALLS = [
  { name: 'User profile', ms: 420, color: '#38bdf8' },
  { name: 'Order history', ms: 650, color: '#a78bfa' },
  { name: 'Recommendations', ms: 900, color: '#f472b6' },
  { name: 'Inventory', ms: 380, color: '#34d399' },
];
const SCALE = CALLS.reduce((a, c) => a + c.ms, 0) + 200;

interface Span {
  name: string;
  color: string;
  start: number;
  end: number;
}

/** Pretend backend call that records when it started and finished, relative to t0. */
async function call(c: (typeof CALLS)[number], t0: number): Promise<Span> {
  const start = performance.now() - t0;
  await sleep(c.ms);
  return { name: c.name, color: c.color, start, end: performance.now() - t0 };
}

async function Sequential() {
  const t0 = performance.now();
  const spans: Span[] = [];
  // Each await blocks the next request from starting: a server-side waterfall.
  for (const c of CALLS) spans.push(await call(c, t0));
  return <Timeline title="Sequential: await one by one" spans={spans} total={performance.now() - t0} />;
}

async function Parallel() {
  const t0 = performance.now();
  // Start every request first, then wait for all of them together.
  const spans = await Promise.all(CALLS.map((c) => call(c, t0)));
  return <Timeline title="Parallel: Promise.all" spans={spans} total={performance.now() - t0} />;
}

function Timeline({ title, spans, total }: { title: string; spans: Span[]; total: number }) {
  return (
    <section className="card waterfall">
      <h2 className="card-title">
        {title} <span className="total">{Math.round(total)} ms</span>
      </h2>
      {spans.map((s) => (
        <div key={s.name} className="wf-row arrived">
          <span className="wf-label">{s.name}</span>
          <div className="wf-track">
            <div
              className="wf-bar"
              style={{
                marginLeft: `${(s.start / SCALE) * 100}%`,
                width: `${((s.end - s.start) / SCALE) * 100}%`,
                background: s.color,
              }}
            />
            <span className="wf-ms">{Math.round(s.end - s.start)} ms</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function Pending({ title }: { title: string }) {
  return (
    <section className="card waterfall">
      <h2 className="card-title">{title}</h2>
      {CALLS.map((c) => (
        <div key={c.name} className="wf-row pending">
          <span className="wf-label">{c.name}</span>
          <div className="wf-track">
            <div className="wf-bar loading" />
          </div>
        </div>
      ))}
    </section>
  );
}

export default function ParallelPage() {
  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">async Server Components · Promise.all · request waterfalls</p>
        <h1>Sequential vs parallel data fetching</h1>
        <p className="lede">
          Both panels make the same four backend calls on the server. The first awaits each call before starting the
          next, so the total is the <em>sum</em> of the latencies. The second starts them all at once with{' '}
          <code>Promise.all</code>, so the total is roughly the <em>slowest</em> call. Each panel is its own Suspense
          boundary, so the faster one streams in first.
        </p>
        <ReloadButton />
      </header>

      <Suspense fallback={<Pending title="Parallel: Promise.all" />}>
        <Parallel />
      </Suspense>
      <Suspense fallback={<Pending title="Sequential: await one by one" />}>
        <Sequential />
      </Suspense>
    </main>
  );
}
