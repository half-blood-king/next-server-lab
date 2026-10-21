# Server Lab

Six small, readable demos of what the Next.js App Router server can do. Each is a single route you can read in a minute.

![stack](https://img.shields.io/badge/Next.js-15-black) ![stack](https://img.shields.io/badge/React-19-61dafb) ![stack](https://img.shields.io/badge/zero-extra%20deps-34d399)

| Demo | Concepts | Code |
| --- | --- | --- |
| **Streaming waterfall**: three slow async Server Components resolve in random order over one HTTP response, and bars show when each chunk landed | `Suspense`, chunked HTML, `force-dynamic`, client island hydrating before the slow data | `src/app/streaming` |
| **Sequential vs parallel fetching**: the same four server-side calls awaited one by one and then with `Promise.all`, drawn as two timelines | async Server Components, request waterfalls, independent `Suspense` boundaries | `src/app/parallel` |
| **Server Actions poll**: vote without any API route, with instant bars and real numbers replacing the guess once the server answers | `'use server'`, `useActionState`, `useOptimistic`, `cookies()`, `revalidatePath` | `src/app/actions` |
| **Live market over SSE**: an endless `text/event-stream` from a `ReadableStream`, drawn on a canvas that scrolls smoothly between ticks | Route Handlers, `ReadableStream`, `AbortSignal` cleanup, `EventSource`, `requestAnimationFrame` | `src/app/api/ticker`, `src/app/live` |
| **ISR snapshot**: generative art seeded by render time, cached for 20 s, with a countdown ring and an on-demand revalidate button | `export const revalidate`, stale-while-revalidate, inline Server Action | `src/app/isr` |
| **OG image studio**: social cards rendered from JSX to PNG on the Edge runtime, with a live preview | `next/og` `ImageResponse`, `runtime = 'edge'`, `useDeferredValue` | `src/app/api/og`, `src/app/og-studio` |

There is also **middleware** that stamps every page request with an ID and start time (read in Server Components through `headers()`) and adds a `Server-Timing` header. See `src/middleware.ts`.

## Run it

```bash
npm install
npm run dev
```

To see ISR caching behave like production:

```bash
npm run build && npm start
```

> The poll keeps its votes in memory on purpose, so it resets when the server restarts.
