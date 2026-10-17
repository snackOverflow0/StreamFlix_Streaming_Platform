import { useMemo, useState } from 'react';
import type { ManagementData, ManagedRow } from './ManagementWorkspace';
import { subBadge, subState } from './ManagementWorkspace';
import { Ic } from './proto-icons';
import { Av, B, Chips, Empty, Search, fmtMonth, fmtShort, str, usePaged } from './proto-ui';

/* Subscribers page in the prototype layout: filters, table and a detail panel with plan and profiles. */
type F = 'all' | 'active' | 'expiring' | 'none' | 'restricted';
const acctBadge = (s: unknown) => str(s) === 'suspended' ? <B tone="warn">Suspended</B> : str(s) === 'deactivated' ? <B tone="bad">Deactivated</B> : <B tone="ok">Active</B>;

export default function UsersWorkspace({ data, query, onQuery, onEdit, onPage }: { data: ManagementData; query: string; onQuery: (q: string) => void; onEdit: (row: ManagedRow) => void; onPage: (p: string, q?: string) => void }) {
  const [f, setF] = useState<F>('all');
  const [sel, setSel] = useState('');
  const m = useMemo(() => {
    const latest = new Map<string, ManagedRow>();
    for (const s of [...(data.subscriptions || [])].sort((a, b) => str(a.start_date).localeCompare(str(b.start_date)))) latest.set(str(s.subscription_user_id), s);
    const plans = new Map((data.plans || []).map(p => [str(p.plan_id), p]));
    const profiles = (data.profiles || []);
    const users = (data.users || []).filter(u => !u.deleted_at).map(u => { const s = latest.get(str(u.user_id)); const st = subState(s); return { u, s, st, plan: s ? plans.get(str(s.plan_id)) : undefined, profiles: profiles.filter(p => str(p.user_id) === str(u.user_id)) }; });
    return { users };
  }, [data]);
  type U = (typeof m.users)[number];
  const inF = (x: U, k: F) => k === 'all' || (k === 'restricted' ? str(x.u.account_status) !== 'active' : k === 'none' ? ['none', 'cancelled', 'expired'].includes(x.st) : x.st === k);
  const counts = (k: F) => m.users.filter(x => inF(x, k)).length;
  const rows = m.users.filter(x => inF(x, f)).filter(x => `${str(x.u.full_name)} ${str(x.u.email)}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => str(b.u.created_at).localeCompare(str(a.u.created_at)));
  const P = usePaged(rows, 8, `${f}|${query}`);
  const cur = rows.find(x => str(x.u.user_id) === sel) || P.rows[0];
  const max = Number(cur?.plan?.max_members) || 1;
  return <div className="split">
    <section className="sec">
      <div className="toolbar"><Search value={query} onChange={onQuery} label="Search name or email…" /><Chips label="Filter" value={f} onChange={setF} options={[['all', 'All', counts('all')], ['active', 'Subscribed', counts('active')], ['expiring', 'Expiring', counts('expiring')], ['none', 'No active plan', counts('none')], ['restricted', 'Restricted', counts('restricted')]]} /></div>
      <div className="tw"><table className="cards-m"><thead><tr><th>User</th><th>Account</th><th>Subscription</th><th>Plan</th><th>Profiles</th><th>Joined</th></tr></thead><tbody>{P.rows.map(x => <tr key={str(x.u.user_id)} className={cur === x ? 'sel' : ''}>
        <td className="main"><button type="button" className="cell-main" onClick={() => setSel(str(x.u.user_id))}><Av name={x.u.full_name || x.u.email} /><span>{str(x.u.full_name) || 'No name'}<small>{str(x.u.email)}</small></span></button></td>
        <td data-label="Account">{acctBadge(x.u.account_status)}</td><td data-label="Subscription">{subBadge(x.st)}</td>
        <td data-label="Plan">{str(x.plan?.plan_name) || 'None'}</td><td data-label="Profiles" className="num">{x.profiles.length}</td><td data-label="Joined">{fmtMonth(x.u.created_at)}</td>
      </tr>)}</tbody></table>{rows.length ? null : <Empty icon="users" title="No subscribers match" text="Try a different filter." />}</div>
      {P.pager}
    </section>
    {cur ? <aside className="sec inspector">
      <div className="ucard-hero"><Av name={cur.u.full_name || cur.u.email} /><div style={{ minWidth: 0 }}><h3>{str(cur.u.full_name) || 'No name'}</h3><small style={{ color: 'var(--t3)', fontSize: 12 }}>{str(cur.u.email)}</small></div></div>
      <div className="two-status"><div><small>Account</small>{acctBadge(cur.u.account_status)}</div><div><small>Subscription</small>{subBadge(cur.st)}</div></div>
      <dl className="dl" style={{ paddingTop: 0 }}><dt>Plan</dt><dd>{str(cur.plan?.plan_name) || 'None'}</dd><dt>{['active', 'expiring'].includes(cur.st) ? 'Renews' : 'Ended'}</dt><dd>{cur.s ? fmtShort(cur.s.end_date) : '—'}</dd>{cur.u.phone_number ? <><dt>Phone</dt><dd>{str(cur.u.phone_number)}</dd></> : null}</dl>
      <div className="ins-sec"><h4>Profiles · {cur.profiles.length} of {max} allowed</h4>{cur.profiles.length ? <div className="profiles">{cur.profiles.map(p => <div key={str(p.profile_id)} className="profile"><Av name={p.profile_name} /><span>{str(p.profile_name)}</span>{p.is_kids === true && <span className="tag-kid">KIDS</span>}</div>)}</div> : <small style={{ color: 'var(--t3)' }}>No profiles yet.</small>}</div>
      <div className="ins-acts"><button type="button" className="btn btn-g" onClick={() => onEdit(cur.u)}><Ic n="edit" s={15} />Edit account</button><button type="button" className="btn btn-g" onClick={() => onPage('Subscriptions', str(cur.u.full_name))}><Ic n="card" s={15} />Subscription</button></div>
    </aside> : <aside className="sec inspector"><Empty icon="users" title="No subscriber selected" text="Pick someone from the list." /></aside>}
  </div>;
}
