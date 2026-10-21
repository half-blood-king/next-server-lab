import 'server-only';

export const OPTIONS = [
  { id: 'rsc', label: 'Server Components', color: '#38bdf8' },
  { id: 'ssr', label: 'Classic SSR', color: '#a78bfa' },
  { id: 'ssg', label: 'Static generation', color: '#34d399' },
  { id: 'isr', label: 'ISR', color: '#fbbf24' },
  { id: 'spa', label: 'Client-side SPA', color: '#f472b6' },
] as const;

export type OptionId = (typeof OPTIONS)[number]['id'];

interface Store {
  votes: Record<OptionId, number>;
  log: { option: OptionId; at: number }[];
}

const seed = (): Store => ({ votes: { rsc: 12, ssr: 7, ssg: 9, isr: 5, spa: 4 }, log: [] });

// Kept on globalThis so dev-mode hot reloads don't wipe the tally. Demo only: resets on restart.
const g = globalThis as unknown as { __poll?: Store };
const store = (g.__poll ??= seed());

export function isOption(v: unknown): v is OptionId {
  return OPTIONS.some((o) => o.id === v);
}

export function getPoll() {
  return { votes: { ...store.votes }, log: store.log.slice(-6).reverse() };
}

export function addVote(option: OptionId) {
  store.votes[option]++;
  store.log.push({ option, at: Date.now() });
  if (store.log.length > 50) store.log.shift();
}

export function resetStore() {
  Object.assign(store, seed());
}
