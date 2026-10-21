import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getPoll, OPTIONS } from '@/lib/poll';
import { resetPoll } from './actions';
import { Poll } from './Poll';

export const metadata: Metadata = { title: 'Server Actions' };
export const dynamic = 'force-dynamic';

export default async function ActionsPage() {
  const { votes, log } = getPoll();
  const lastChoice = (await cookies()).get('lab-vote')?.value ?? null;
  const label = (id: string) => OPTIONS.find((o) => o.id === id)?.label;

  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">Server Actions · useOptimistic · useActionState · cookies()</p>
        <h1>Which rendering strategy do you reach for first?</h1>
        <p className="lede">
          Voting calls a <code>&apos;use server&apos;</code> function directly from the form, with no fetch and no API
          route. The bar moves instantly (optimistic), the server waits 700 ms, writes, sets an httpOnly cookie and
          revalidates this page, and the real numbers replace the guess.
        </p>
      </header>

      <div className="split">
        <section className="card">
          <Poll options={OPTIONS} votes={votes} lastChoice={lastChoice} />
        </section>

        <aside className="card">
          <h2 className="card-title">Server log</h2>
          {log.length === 0 ? (
            <p className="muted">No votes since the server started.</p>
          ) : (
            <ul className="log">
              {log.map((e) => (
                <li key={e.at}>
                  <code>{new Date(e.at).toISOString().slice(11, 19)}</code> {label(e.option)}
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">
            This list is rendered on the server. It updates because the action calls <code>revalidatePath</code>.
          </p>
          <form action={resetPoll}>
            <button className="btn ghost">Reset poll</button>
          </form>
        </aside>
      </div>
    </main>
  );
}
