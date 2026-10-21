import Link from 'next/link';
import { requestInfo } from '@/lib/request';
import { DEMOS } from './demos';

export default async function Home() {
  const req = await requestInfo();

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Next.js 15 · React 19 · App Router</p>
        <h1>
          What the <span>server</span> can do.
        </h1>
        <p className="lede">
          Five small working demos of rendering on the server, streaming, mutations without APIs, live data and
          cached regeneration. Each page is a few dozen lines you can read in a minute.
        </p>
        <div className="req">
          <span>request</span> <code>{req.id}</code>
          <span>stamped by middleware at</span> <code>{new Date(req.start).toISOString().slice(11, 23)}Z</code>
        </div>
      </section>

      <section className="cards">
        {DEMOS.map((d, i) => (
          <Link key={d.href} href={d.href} className="demo" style={{ '--hue': d.hue } as React.CSSProperties}>
            <div className="art" aria-hidden>
              {Array.from({ length: 12 }, (_, k) => (
                <i key={k} style={{ animationDelay: `${(k * 0.13 + i * 0.4).toFixed(2)}s` }} />
              ))}
            </div>
            <span className="tag">{d.tag}</span>
            <h2>{d.title}</h2>
            <p>{d.blurb}</p>
            <span className="go">Open demo →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
