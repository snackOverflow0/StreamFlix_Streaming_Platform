import { useEffect, useId, useState } from 'react';

/* Charts drawn exactly like the prototype's lineChart()/spark(): same padding, grid, gradient fill and end dots. */
const useWidth = () => {
  const pick = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);
  const [w, setW] = useState(pick);
  useEffect(() => { const r = () => setW(pick()); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  return w;
};
export type Series = { v: number[]; c: string; dash?: boolean };
export function LineChart({ series, labels, h = 240, dec = 0 }: { series: Series[]; labels: string[]; h?: number; dec?: number }) {
  const vw = useWidth(); const id = 'ga' + useId().replace(/:/g, '');
  const W = vw < 700 ? 380 : vw < 1300 ? 560 : 720; const step = W < 500 ? 3 : 1; const H = W < 500 ? Math.max(150, h * .8) : h;
  const pad = { l: 40, r: 16, t: 14, b: 28 };
  const all = series.flatMap(s => s.v); const mx = Math.max(1, ...all) * 1.15;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length < 2 ? 0 : i / (labels.length - 1) * iw), y = (v: number) => pad.t + ih - v / mx * ih;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Line chart">
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={series[0]?.c} stopOpacity=".28" /><stop offset="1" stopColor={series[0]?.c} stopOpacity="0" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map(k => { const v = mx * k / 4; return <g key={k}><line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" /><text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="JetBrains Mono,monospace">{v.toFixed(dec)}</text></g>; })}
    {labels.map((l, i) => i % step ? null : <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--chart-label)">{l}</text>)}
    {series.map((s, si) => { const d = s.v.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' '); const last = s.v.length - 1;
      return <g key={si}>{si === 0 && <path d={`${d} L${x(last)} ${pad.t + ih} L${pad.l} ${pad.t + ih}Z`} fill={`url(#${id})`} />}<path d={d} fill="none" stroke={s.c} strokeWidth={si === 0 ? 2.4 : 1.8} strokeDasharray={s.dash ? '5 5' : undefined} strokeLinejoin="round" strokeLinecap="round" /><circle cx={x(last)} cy={y(s.v[last] ?? 0)} r="4" fill={s.c} stroke="var(--s1)" strokeWidth="2" /></g>; })}
  </svg>;
}
export function Spark({ pts, color }: { pts: number[]; color: string }) {
  const w = 84, h = 30, mx = Math.max(...pts), mn = Math.min(...pts);
  const xy = pts.map((v, i) => [i / Math.max(1, pts.length - 1) * w, h - 3 - (v - mn) / (mx - mn || 1) * (h - 6)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '); const l = xy[xy.length - 1] ?? [0, 0];
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true"><path d={`${d} L${w} ${h} L0 ${h}Z`} fill={color} opacity=".12" /><path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" /><circle cx={l[0]} cy={l[1]} r="2.6" fill={color} /></svg>;
}
/* Last n calendar months as {key:'2026-10', label:'Oct'} */
export function lastMonths(n: number) {
  const out: { key: string; label: string; start: string; end: string }[] = []; const now = new Date();
  for (let i = n - 1; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    out.push({ key: f(d).slice(0, 7), label: d.toLocaleString('en-US', { month: 'short' }), start: f(d), end: f(e) }); }
  return out;
}
export const monthKey = (v: unknown) => String(v ?? '').slice(0, 7);
