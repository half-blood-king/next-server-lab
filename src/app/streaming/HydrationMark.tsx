'use client';

import { useEffect, useState } from 'react';

/** Reports when React hydrated this client island, relative to navigation start. */
export function HydrationMark() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => setMs(Math.round(performance.now())), []);
  return (
    <p className="note">
      {ms === null ? 'Hydrating…' : `This client component hydrated ${ms} ms after navigation started. It did not wait for the slow panels.`}
    </p>
  );
}
