import type { Metadata } from 'next';
import { Studio } from './Studio';

export const metadata: Metadata = {
  title: 'OG Studio',
  openGraph: { images: ['/api/og?title=OG%20Studio&theme=sunset'] },
};

export default function OgStudioPage() {
  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">next/og · ImageResponse · Edge runtime</p>
        <h1>OG image studio</h1>
        <p className="lede">
          <code>/api/og</code> turns JSX into a PNG at request time (Satori + Resvg on the Edge runtime). This page&apos;s
          own <code>og:image</code> meta tag points to it. Type to regenerate. The preview is debounced with{' '}
          <code>useDeferredValue</code>.
        </p>
      </header>
      <Studio />
    </main>
  );
}
