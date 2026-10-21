import { NextResponse, type NextRequest } from 'next/server';

/**
 * Runs before every page request. Stamps the request with a start time and an
 * ID that Server Components read through `headers()`, and exposes timing to
 * the browser via Server-Timing.
 */
export function middleware(req: NextRequest) {
  const start = Date.now();
  const id = crypto.randomUUID().slice(0, 8);

  const headers = new Headers(req.headers);
  headers.set('x-request-start', String(start));
  headers.set('x-request-id', id);

  const res = NextResponse.next({ request: { headers } });
  res.headers.set('x-request-id', id);
  res.headers.set('Server-Timing', `mw;desc="middleware";dur=${Date.now() - start}`);
  return res;
}

export const config = {
  matcher: ['/((?!_next/|api/|favicon.ico).*)'],
};
