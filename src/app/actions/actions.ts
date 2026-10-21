'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { addVote, isOption, OPTIONS, resetStore } from '@/lib/poll';
import { sleep } from '@/lib/request';

export interface VoteState {
  message: string;
  error?: boolean;
}

/**
 * A Server Action: a plain async function the client form calls over RPC.
 * It validates input, mutates server state, sets a cookie and revalidates the page.
 */
export async function vote(_prev: VoteState, formData: FormData): Promise<VoteState> {
  const option = formData.get('option');
  if (!isOption(option)) return { message: 'Unknown option.', error: true };

  await sleep(700); // pretend it's a database write, so the optimistic UI is visible
  addVote(option);

  (await cookies()).set('lab-vote', option, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 });
  revalidatePath('/actions');

  const label = OPTIONS.find((o) => o.id === option)!.label;
  return { message: `Counted a vote for ${label} at ${new Date().toISOString().slice(11, 19)} UTC.` };
}

export async function resetPoll() {
  resetStore();
  (await cookies()).delete('lab-vote');
  revalidatePath('/actions');
}
