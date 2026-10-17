import { useMemo, useState } from 'react';
import type { ManagementData, ManagedRow } from './ManagementWorkspace';
import { Ic } from './proto-icons';
import { Poster, Seg, peso, str, fmtShort } from './proto-ui';
import { LineChart, lastMonths } from './proto-charts';

/* Dashboard in the prototype layout. Every number is counted from the rows already loaded
   from /admin/bootstrap and /admin/management; nothing is invented. */
type Row = Record<string, unknown>;
type Props = { content: Row[]; licenses: Row[]; management: ManagementData; subscriptions: Row[]; users: Row[]; plans: Row[]; onPage: (page: string, q?: string, preset?: string) => void; onPreview: (row: Row) => void; media: (url: unknown) => string };
const DAY = 864e5;
const today = () => new Date().toISOString().slice(0, 10);
const daysUntil = (d: unknown) => (new Date(str(d) + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime()) / DAY;
const ago = (v: unknown) => { const m = Math.max(1, Math.round((Date.now() - new Date(str(v)).getTime()) / 60000)); return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };

export default function Dashboard({ content, licenses, management, subscriptions, users, plans, onPage, onPreview, media }: Props) {
  const [tab, setTab] = useState<'recent' | 'top' | 'activity'>('recent');
  const m = useMemo(() => {
    const t = today();
    const live = content.filter(c => !c.deleted_at);
    const visible = live.filter(c => c.is_active !== false);
    const hidden = live.filter(c => c.is_active === false);
    const noArt = live.filter(c => !c.poster_url);
    const lic = licenses.filter(l => str(l.expiration_date) && daysUntil(l.expiration_date) <= 30);
    const orders = (management.orders || []) as ManagedRow[];
    const fb = ((management.feedback || []) as ManagedRow[]).filter(f => str(f.status) === 'pending');
    const isActive = (s: Row) => str(s.status) === 'active' && str(s.start_date) <= t && (!s.end_date || str(s.end_date) >= t);
    const active = subscriptions.filter(isActive);
    const ending = active.filter(s => daysUntil(s.end_date) <= 7);
    const cancelled = subscriptions.filter(s => str(s.status) === 'cancelled');
    const expired = subscriptions.filter(s => str(s.status) !== 'cancelled' && !isActive(s) && str(s.end_date) < t);
    const price = new Map(plans.map(p => [str(p.plan_id), Number(p.monthly_price) || 0]));
    const revenue = active.reduce((a, s) => a + (price.get(str(s.plan_id)) || 0), 0);
    const months = lastMonths(12);
    const activeAt = months.map(mo => subscriptions.filter(s => str(s.status) !== 'cancelled' && str(s.start_date) <= mo.end && (!s.end_date || str(s.end_date) >= (mo.key === t.slice(0, 7) ? t : mo.end))).length);
    const started = months.map(mo => subscriptions.filter(s => str(s.start_date).slice(0, 7) === mo.key).length);
    const recent = [...live].sort((a, b) => str(b.created_at).localeCompare(str(a.created_at))).slice(0, 5);
    const views = new Map(((management.viewStats || []) as ManagedRow[]).map(v => [str(v.content_id), Number(v.views) || 0]));
    const top = live.map(c => ({ c, v: views.get(str(c.content_id)) || 0 })).filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 5);
    const userName = new Map(users.map(u => [str(u.user_id), str(u.full_name || u.email)]));
    const titleOf = new Map(content.map(c => [str(c.content_id), str(c.title)]));
    const feed = [
      ...live.map(c => ({ at: str(c.created_at), c: 'g', html: <><b>{str(c.title)}</b> was added</> })),
      ...subscriptions.map(s => ({ at: str(s.created_at || s.start_date), c: '', html: <><b>{userName.get(str(s.subscription_user_id)) || 'A subscriber'}</b> subscribed</> })),
      ...orders.map(o => ({ at: str(o.created_at), c: 'p', html: <>Order <b>SF-{str(o.transaction_id)}</b> placed{str(o.payment_method) ? ` (${str(o.payment_method) === 'Cash on Delivery' ? 'COD' : str(o.payment_method)})` : ''}</> })),
      ...((management.feedback || []) as ManagedRow[]).map(f => ({ at: str(f.created_date), c: 'g', html: <><b>{userName.get(str(f.user_id)) || 'A user'}</b> sent feedback</> })),
      ...((management.reviews || []) as ManagedRow[]).map(r => ({ at: str(r.review_date), c: '', html: <><b>{titleOf.get(str(r.content_id)) || 'A title'}</b> got a {Number(r.rating_value)}-star review</> })),
    ].filter(e => e.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
    return { live, visible, hidden, noArt, lic, pendingOrders: orders.filter(o => str(o.order_status) === 'pending'), fb, active, ending, cancelled, expired, revenue, months, activeAt, started, recent, top, feed };
  }, [content, licenses, management, subscriptions, users, plans]);

  const todo: [string, number, string, string, string][] = [
    ['Titles hidden from users', m.hidden.length, 'Catalog', 'hidden', 'b-acc'],
    ['Missing artwork', m.noArt.length, 'Catalog', 'noart', 'b-warn'],
    ['Licenses expiring', m.lic.length, 'Licensing', '', 'b-warn'],
    ['Subscriptions ending in 7 days', m.ending.length, 'Subscriptions', '', 'b-acc'],
    ['Orders to process', m.pendingOrders.length, 'Orders', 'pending', 'b-acc'],
    ['Feedback awaiting reply', m.fb.length, 'Feedback', '', 'b-acc'],
  ];
  const open = todo.filter(t => t[1] > 0).slice(0, 5);
  const sc = { active: m.active.length - m.ending.length, expiring: m.ending.length, cancelled: m.cancelled.length, expired: m.expired.length };
  const tot = sc.active + sc.expiring + sc.cancelled + sc.expired;
  const mx = m.top[0]?.v || 1;

  return <div className="grid">
    <section className="sec c8">
      <div className="sec-head"><div className="head-stats"><div><small>Paying subscribers</small><strong className="num">{m.active.length.toLocaleString()}</strong></div><div><small>Monthly revenue</small><strong className="num">{peso(m.revenue)}</strong></div><div><small>Titles live</small><strong className="num">{m.visible.length}</strong></div></div>
        <div className="legend"><span><i style={{ background: 'var(--chart-1)' }} />Active subscribers</span><span><i style={{ background: 'var(--chart-2)' }} />New subscriptions</span></div></div>
      <div className="chart-box fill"><LineChart series={[{ v: m.activeAt, c: 'var(--chart-1)' }, { v: m.started, c: 'var(--chart-2)', dash: true }]} labels={m.months.map(x => x.label)} h={210} /></div>
    </section>
    <section className="sec c4"><div className="sec-head"><h3>Needs your attention</h3></div>
      {open.length ? <div className="todo fill">{open.map(([a, n, p, f, k]) => <button type="button" key={a} className="todo-row" onClick={() => onPage(p, '', f)}><span className={`n bdg ${k}`} style={{ height: 36, padding: 0, justifyContent: 'center' }}>{n}</span><span className="tt"><b>{a}</b></span><Ic n="right" s={16} className="go" /></button>)}</div>
        : <div className="empty fill"><span className="ic-chip"><Ic n="ok" s={22} /></span><b>All caught up</b><span>Nothing needs action right now.</span></div>}
    </section>
    <section className="sec c8">
      <div className="sec-head"><Seg value={tab} onChange={setTab} options={[['recent', 'Recently added'], ['top', 'Top titles'], ['activity', 'Activity']]} /><button type="button" className="lnk" onClick={() => onPage(tab === 'top' ? 'Analytics' : 'Catalog')}>{tab === 'top' ? 'Analytics' : 'Open catalog'}<Ic n="right" s={13} /></button></div>
      <div className="tabbody">
        {tab === 'recent' ? (m.recent.length ? <div className="rail-row fill">{m.recent.map(c => <button type="button" key={str(c.content_id)} className="rail-card" onClick={() => onPreview(c)}><Poster src={c.poster_url ? media(c.poster_url) : undefined} title={c.title} /><b>{str(c.title)}</b><small>{c.is_active === false ? 'Hidden' : /series|show/i.test(str(c.type)) ? 'Series' : 'Movie'} · {fmtShort(c.created_at)}</small></button>)}</div> : <div className="empty fill"><span className="ic-chip"><Ic n="film" s={22} /></span><b>No titles yet</b><span>Add your first title from the Catalog.</span></div>)
          : tab === 'top' ? (m.top.length ? <div className="fill">{m.top.map(({ c, v }) => <div key={str(c.content_id)} className="hbar"><span className="tl"><Poster src={c.poster_url ? media(c.poster_url) : undefined} className="sm" /><b>{str(c.title)}</b></span><div className="track"><span style={{ width: `${v / mx * 100}%` }} /></div><span className="v num">{v.toLocaleString()}</span></div>)}</div> : <div className="empty fill"><span className="ic-chip"><Ic n="chart" s={22} /></span><b>No views yet</b><span>Views appear once users start watching.</span></div>)
            : (m.feed.length ? <div className="feed fill">{m.feed.map((e, i) => <div key={i} className="feed-row"><i className={e.c} /><span>{e.html}</span><time>{ago(e.at)} ago</time></div>)}</div> : <div className="empty fill"><span className="ic-chip"><Ic n="list" s={22} /></span><b>No activity yet</b><span>New titles, subscriptions and orders show up here.</span></div>)}
      </div>
    </section>
    <section className="sec c4"><div className="sec-head"><h3>Subscription status</h3><button type="button" className="lnk" onClick={() => onPage('Subscriptions')}>Manage<Ic n="right" s={13} /></button></div>
      <div className="fill status-box"><strong className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>{tot.toLocaleString()}</strong>
        <div className="statusbar">{([['active', 'var(--ok)'], ['expiring', 'var(--warn)'], ['cancelled', 'var(--s4)'], ['expired', 'var(--bad)']] as const).map(([k, c]) => <span key={k} style={{ width: `${tot ? sc[k] / tot * 100 : 0}%`, background: c }} />)}</div>
        <div className="status-list">{([['Active', 'var(--ok)', sc.active], ['Expiring', 'var(--warn)', sc.expiring], ['Cancelled', 'var(--s4)', sc.cancelled], ['Expired', 'var(--bad)', sc.expired]] as const).map(([l, c, n]) => <div key={l}><i style={{ background: c }} />{l}<b className="num">{n.toLocaleString()}</b></div>)}</div>
      </div>
    </section>
  </div>;
}

