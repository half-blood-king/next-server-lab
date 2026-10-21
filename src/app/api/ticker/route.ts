export const dynamic = 'force-dynamic';

const SYMBOLS = [
  { symbol: 'NEXT', price: 152, vol: 0.004, color: '#38bdf8' },
  { symbol: 'RSC', price: 88, vol: 0.006, color: '#a78bfa' },
  { symbol: 'EDGE', price: 41, vol: 0.009, color: '#34d399' },
  { symbol: 'NODE', price: 214, vol: 0.003, color: '#fbbf24' },
];

/** Standard normal sample (Box–Muller) for a geometric random walk. */
function gaussian() {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

/**
 * GET /api/ticker: an endless Server-Sent Events stream. Each connection gets
 * its own simulated market. The interval is cleared when the client disconnects.
 */
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const prices = SYMBOLS.map((s) => s.price);
  let timer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      send('hello', { symbols: SYMBOLS.map(({ symbol, color }) => ({ symbol, color })), prices, t: Date.now() });

      let seq = 0;
      timer = setInterval(() => {
        SYMBOLS.forEach((s, i) => {
          prices[i] = +(prices[i] * Math.exp(s.vol * gaussian())).toFixed(2);
        });
        send('tick', { seq: ++seq, t: Date.now(), prices });
      }, 350);

      req.signal.addEventListener('abort', () => {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
