import { useMemo, useState } from 'react';
import type { ManagementData, ManagedRow } from './ManagementWorkspace';
import { manilaDate } from './subscriptionAccess';
import { Poster, Seg, peso, str } from './proto-ui';
import { LineChart, lastMonths } from './proto-charts';

/* Analytics in the prototype layout. Every figure is computed from loaded rows:
   subscriptions + plans (subscribers, revenue, churn), view stats (views, genres, top titles). */
const COLS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
export default function AnalyticsPage({ data, media = u => str(u) }: { data: ManagementData; media?: (u: unknown) => string }) {
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('12m');
  const m = useMemo(() => {
    const today = manilaDate();
    const subs = (data.subscriptions || []).filter(s => str(s.status).toLowerCase() === 'cancelled');
    const price = new Map((data.plans || []).map(p => [str(p.plan_id), Number(p.monthly_price) || 0]));
    const activeOn = (d: string) => (data.subscriptions || []).filter(s => str(s.status) === 'active' && str(s.start_date) <= d && (!s.end_date || str(s.end_date) >= d));
    const months = lastMonths(12);
    const endOf = (mo: { end: string; key: string }) => mo.key === today.slice(0, 7) ? today : mo.end;
    const activeSeries = months.map(mo => activeOn(endOf(mo)).length);
    const churnSeries = months.map(mo => { const base = (data.subscriptions || []).filter(s => str(s.start_date) <= mo.start && (!s.end_date || str(s.end_date) >= mo.start)).length; const ended = subs.filter(s => str(s.cancelled_at || s.updated_at || s.end_date) >= mo.start && str(s.cancelled_at || s.updated_at || s.end_date) <= endOf(mo)).length; return base ? +(ended / base * 100).toFixed(1) : 0; });
    const nowActive = activeOn(today); const d30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const prevActive = activeOn(d30);
    const rev = (list: ManagedRow[]) => list.reduce((a, s) => a + (price.get(str(s.plan_id)) || 0), 0);
    const views = (data.viewStats || []) as ManagedRow[];
    const content = (data.content || []).filter(c => !c.deleted_at);
    const byId = new Map(content.map(c => [str(c.content_id), c]));
    const totalViews = views.reduce((a, v) => a + (Number(v.views) || 0), 0);
    const top = views.map(v => ({ c: byId.get(str(v.content_id)), v: Number(v.views) || 0 })).filter(x => x.c && x.v > 0).sort((a, b) => b.v - a.v).slice(0, 4);
    const g = new Map<string, number>(); for (const v of views) { const c = byId.get(str(v.content_id)); if (c) g.set(str(c.genre_name) || 'Other', (g.get(str(c.genre_name) || 'Other') || 0) + (Number(v.views) || 0)); }
    const genres = [...g.entries()].filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const churnNow = churnSeries[churnSeries.length - 1], churnPrev = churnSeries[churnSeries.length - 2] ?? 0;
    return { months, activeSeries, churnSeries, nowActive, prevActive, revNow: rev(nowActive), revPrev: rev(prevActive), totalViews, top, genres, churnNow, churnPrev };
  }, [data]);
  const n = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const pct = (a: number, b: number) => b ? `${a >= b ? '+' : '−'}${Math.abs((a - b) / b * 100).toFixed(1)}%` : a ? 'new' : '—';
  const gt = m.genres.reduce((a, x) => a + x[1], 0); let acc = 0;
  const mx = m.top[0]?.v || 1;
  const kpis: [string, string, string, 'up' | 'down' | ''][] = [
    ['Paying subscribers', m.nowActive.length.toLocaleString(), pct(m.nowActive.length, m.prevActive.length), m.nowActive.length >= m.prevActive.length ? 'up' : 'down'],
    ['Monthly revenue', peso(m.revNow), pct(m.revNow, m.revPrev), m.revNow >= m.revPrev ? 'up' : 'down'],
    ['Total views', m.totalViews.toLocaleString(), '', ''],
    ['Cancellation rate', `${m.churnNow}%`, `${m.churnNow <= m.churnPrev ? '−' : '+'}${Math.abs(m.churnNow - m.churnPrev).toFixed(1)} pt`, m.churnNow <= m.churnPrev ? 'up' : 'down'],
  ];
  return <>
    <div className="kpis">{kpis.map(([l, v, d, dir]) => <div key={l} className="kpi"><div className="kpi-l">{l}{d && <span className={`delta ${dir}`}>{d}</span>}</div><div className="kpi-v"><strong className="num">{v}</strong></div></div>)}</div>
    <div className="grid">
      <section className="sec c8"><div className="sec-head"><h3>Subscriber growth<span className="sub">active subscribers</span></h3><Seg role="group" label="Date range" value={range} onChange={setRange} options={[['3m', '3m'], ['6m', '6m'], ['12m', '12m']]} /></div><div className="chart-box"><LineChart series={[{ v: m.activeSeries.slice(-n), c: 'var(--chart-1)' }]} labels={m.months.slice(-n).map(x => x.label)} h={150} /></div></section>
      <section className="sec c4"><div className="sec-head"><h3>Views by genre<span className="sub">plays</span></h3></div>{m.genres.length ? <div className="mix"><div className="donut" style={{ width: 128, height: 128, background: `conic-gradient(${m.genres.map(([, v], i) => { const s = acc; acc += v / gt * 100; return `${COLS[i]} ${s}% ${acc}%`; }).join(',')})` }}><div><span><strong className="num">{gt.toLocaleString()}</strong><small>views</small></span></div></div><div className="mix-list">{m.genres.map(([x, v], i) => <div key={x} className="mix-row"><i style={{ background: COLS[i] }} /><span>{x}</span><b className="num">{Math.round(v / gt * 100)}%</b></div>)}</div></div> : <div className="empty"><b>No views yet</b><span>Views appear once users start watching.</span></div>}</section>
      <section className="sec c6"><div className="sec-head"><h3>Most watched titles<span className="sub">plays from view history</span></h3></div>{m.top.length ? m.top.map(({ c, v }) => <div key={str(c!.content_id)} className="hbar"><span className="tl"><Poster src={c!.poster_url ? media(c!.poster_url) : undefined} /><b>{str(c!.title)}</b></span><div className="track"><span style={{ width: `${v / mx * 100}%` }} /></div><span className="v num">{v.toLocaleString()}</span></div>) : <div className="empty"><b>No views yet</b><span>Views appear once users start watching.</span></div>}</section>
      <section className="sec c6"><div className="sec-head"><h3>Cancellation rate<span className="sub">cancelled subscriptions by end date (estimated; no cancellation timestamp)</span></h3></div><div className="chart-box"><LineChart series={[{ v: m.churnSeries, c: 'var(--chart-2)' }]} labels={m.months.map(x => x.label)} h={140} dec={1} /></div></section>
    </div>
  </>;
}
