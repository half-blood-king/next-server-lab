'use client';

export function ReloadButton() {
  // A full reload, not router.refresh(), so you watch the real HTTP stream arrive.
  return (
    <button className="btn" onClick={() => window.location.reload()}>
      ↻ Stream it again
    </button>
  );
}
