import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { DEMOS } from './demos';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Server Lab', template: '%s · Server Lab' },
  description: 'Hands-on demos of what the Next.js server can do.',
  openGraph: { images: ['/api/og?title=Server%20Lab'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="dot" /> Server<b>Lab</b>
          </Link>
          <div className="links">
            {DEMOS.map((d) => (
              <Link key={d.href} href={d.href}>
                {d.short}
              </Link>
            ))}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
