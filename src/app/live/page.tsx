import type { Metadata } from 'next';
import { LiveMarket } from './LiveMarket';

export const metadata: Metadata = { title: 'Live SSE' };

export default function LivePage() {
  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">Route Handler · ReadableStream · Server-Sent Events</p>
        <h1>A market that never closes</h1>
        <p className="lede">
          <code>/api/ticker</code> returns a <code>text/event-stream</code> response backed by a{' '}
          <code>ReadableStream</code>. Every 350 ms the server pushes a new tick from a geometric random walk. When the
          tab closes, the request&apos;s <code>AbortSignal</code> stops the timer. Open it in two tabs and each one gets
          its own market.
        </p>
      </header>
      <section className="card">
        <LiveMarket />
      </section>
    </main>
  );
}
