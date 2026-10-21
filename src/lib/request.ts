import { headers } from 'next/headers';

/** Values injected by middleware.ts, read from any Server Component. */
export async function requestInfo() {
  const h = await headers();
  return {
    start: Number(h.get('x-request-start') ?? Date.now()),
    id: h.get('x-request-id') ?? 'none',
    userAgent: h.get('user-agent') ?? 'unknown',
  };
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
