'use client';

import { useActionState, useOptimistic } from 'react';
import { vote, type VoteState } from './actions';

interface Option {
  id: string;
  label: string;
  color: string;
}

export function Poll({
  options,
  votes,
  lastChoice,
}: {
  options: readonly Option[];
  votes: Record<string, number>;
  lastChoice: string | null;
}) {
  // Bumps the bar the moment you click; React drops it once the server's fresh `votes` arrive.
  const [optimistic, bump] = useOptimistic(votes, (state, id: string) => ({ ...state, [id]: state[id] + 1 }));

  const [state, formAction, pending] = useActionState<VoteState, FormData>(async (prev, fd) => {
    bump(String(fd.get('option')));
    return vote(prev, fd);
  }, { message: '' });

  const total = Object.values(optimistic).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(optimistic));

  return (
    <form action={formAction} className="poll">
      {options.map((o) => {
        const n = optimistic[o.id];
        const pct = total ? (n / total) * 100 : 0;
        return (
          <button key={o.id} name="option" value={o.id} className="poll-row" disabled={pending}>
            <span className="poll-bar" style={{ width: `${(n / max) * 100}%`, background: o.color }} />
            <span className="poll-label">
              {o.label}
              {lastChoice === o.id && <em> · your last vote</em>}
            </span>
            <span className="poll-num">
              {n} <small>{pct.toFixed(0)}%</small>
            </span>
          </button>
        );
      })}
      <p className={state.error ? 'status error' : 'status'} aria-live="polite">
        {pending ? 'Sending to the server…' : state.message || 'Click an option to vote. Each click is a Server Action call.'}
      </p>
    </form>
  );
}
