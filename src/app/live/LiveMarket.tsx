'use client';

import { useEffect, useRef, useState } from 'react';

interface Meta {
  symbol: string;
  color: string;
}
interface Point {
  t: number;
  prices: number[];
}

const WINDOW_MS = 45_000;

export function LiveMarket() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const series = useRef<Point[]>([]);
  const base = useRef<number[]>([]);
  const [meta, setMeta] = useState<Meta[]>([]);
  const [latest, setLatest] = useState<{ prices: number[]; prev: number[]; seq: number; lag: number } | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [paused, setPaused] = useState(false);

  // One EventSource per mount; the browser reconnects on its own if the stream drops.
  useEffect(() => {
    if (paused) {
      setStatus('closed');
      return;
    }
    const es = new EventSource('/api/ticker');
    es.onopen = () => setStatus('open');
    es.onerror = () => setStatus(es.readyState === EventSource.CLOSED ? 'closed' : 'connecting');
    es.addEventListener('hello', (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { symbols: Meta[]; prices: number[]; t: number };
      setMeta(data.symbols);
      base.current = data.prices;
      series.current = [{ t: data.t, prices: data.prices }];
    });
    es.addEventListener('tick', (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { seq: number; t: number; prices: number[] };
      const prev = series.current.at(-1)?.prices ?? data.prices;
      series.current.push({ t: data.t, prices: data.prices });
      const cutoff = Date.now() - WINDOW_MS - 2000;
      while (series.current.length > 2 && series.current[0].t < cutoff) series.current.shift();
      setLatest({ prices: data.prices, prev, seq: data.seq, lag: Date.now() - data.t });
    });
    return () => es.close();
  }, [paused]);

  // Time-based x axis drawn every animation frame, so the chart scrolls smoothly between ticks.
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas || meta.length === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== Math.round(width * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const pts = series.current;
      const now = paused ? (pts.at(-1)?.t ?? Date.now()) : Date.now();
      const x = (t: number) => ((t - (now - WINDOW_MS)) / WINDOW_MS) * (width - 70);
      const pct = (p: number, i: number) => (p / base.current[i] - 1) * 100;

      let lo = -0.5;
      let hi = 0.5;
      for (const p of pts) p.prices.forEach((v, i) => ((lo = Math.min(lo, pct(v, i))), (hi = Math.max(hi, pct(v, i)))));
      const padY = (hi - lo) * 0.15;
      lo -= padY;
      hi += padY;
      const y = (v: number) => 12 + (1 - (v - lo) / (hi - lo)) * (height - 24);

      // Grid and zero line
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = '#6b7799';
      ctx.strokeStyle = '#ffffff10';
      const step = Math.max(0.25, Math.ceil(((hi - lo) / 5) * 4) / 4);
      for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
        ctx.beginPath();
        ctx.moveTo(0, y(v));
        ctx.lineTo(width - 70, y(v));
        ctx.strokeStyle = Math.abs(v) < 1e-9 ? '#ffffff33' : '#ffffff10';
        ctx.stroke();
        ctx.fillText(`${v > 0 ? '+' : ''}${v.toFixed(2)}%`, width - 64, y(v) + 4);
      }

      meta.forEach((m, i) => {
        ctx.beginPath();
        pts.forEach((p, k) => {
          const px = x(p.t);
          const py = y(pct(p.prices[i], i));
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
        const last = pts.at(-1);
        if (last) {
          ctx.beginPath();
          ctx.arc(x(last.t), y(pct(last.prices[i], i)), 3.5, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        }
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [meta, paused]);

  return (
    <div className="live">
      <div className="live-bar">
        <span className={`pill ${status}`}>{status === 'open' ? '● streaming' : status}</span>
        <span className="muted">
          ticks <code>{latest?.seq ?? 0}</code> · server→browser <code>{latest ? `${latest.lag} ms` : '–'}</code>
        </span>
        <button className="btn ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Reconnect' : 'Disconnect'}
        </button>
      </div>

      <div className="tickers">
        {meta.map((m, i) => {
          const p = latest?.prices[i] ?? base.current[i];
          const change = base.current[i] ? (p / base.current[i] - 1) * 100 : 0;
          const dir = latest ? Math.sign(latest.prices[i] - latest.prev[i]) : 0;
          return (
            <div key={`${m.symbol}-${latest?.seq ?? 0}`} className={`ticker ${dir > 0 ? 'up' : dir < 0 ? 'down' : ''}`}>
              <span className="sym" style={{ color: m.color }}>
                {m.symbol}
              </span>
              <b>{p?.toFixed(2)}</b>
              <small className={change >= 0 ? 'pos' : 'neg'}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </small>
            </div>
          );
        })}
      </div>

      <canvas ref={canvasRef} className="live-canvas" />
    </div>
  );
}
