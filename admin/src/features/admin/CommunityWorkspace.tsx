import { useState, type ReactNode } from 'react';
import { hasProfanity } from './profanity';
import type { ManagementData, ManagedRow } from './ManagementWorkspace';
import { Ic } from './proto-icons';
import { Av, B, Chips, Empty, Poster, askConfirm, cap, fmtShort, str, usePaged } from './proto-ui';

/* Feedback inbox and Reviews in the prototype layout. Status changes and removals go through the same API as before. */
type Props = { page: string; data: ManagementData; query: string; onQuery: (q: string) => void; onMutate: (resource: string, method: string, row: ManagedRow, payload?: ManagedRow) => Promise<void>; onPage: (p: string, q?: string) => void; media: (u: unknown) => string };
const GROUPS: Record<'open' | 'resolved', string[]> = { open: ['pending', 'in_progress'], resolved: ['resolved', 'closed'] };
const fbBadge = (s: unknown) => ({ pending: <B tone="acc">New</B>, in_progress: <B tone="info">In progress</B>, resolved: <B tone="ok">Resolved</B>, closed: <B tone="mute">Closed</B> } as Record<string, ReactNode>)[str(s)] ?? <B tone="mute">{cap(s)}</B>;

export default function CommunityWorkspace({ page, data, query, onMutate, onPage, media }: Props) {
  const [ff, setFf] = useState<'open' | 'resolved'>('open');
  const [sel, setSel] = useState('');
  const [rf, setRf] = useState<'all' | 'flag' | 'low' | 'comment'>('all');
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const userOf = (id: unknown) => (data.users || []).find(u => str(u.user_id) === str(id));
  const titleOf = (id: unknown) => (data.content || []).find(c => str(c.content_id) === str(id)) || (data.archived || []).find(c => str(c.content_id) === str(id));
  async function run(method: string, key: string, row: ManagedRow, payload?: ManagedRow) { setBusy(str(row.feedback_id ?? row.rev_id)); setError(''); try { await onMutate(key, method, row, payload); } catch (e) { setError((e as Error).message); } finally { setBusy(''); } }
  const flash = error ? <p className="form-err" role="alert" style={{ marginBottom: 14 }}>{error}</p> : null;

  if (page === 'Feedback') {
    const all = [...(data.feedback || [])].sort((a, b) => str(b.created_date).localeCompare(str(a.created_date)));
    const q = query.toLowerCase();
    const rows = all.filter(f => GROUPS[ff].includes(str(f.status))).filter(f => `${str(f.subject)} ${str(f.message)} ${str(userOf(f.user_id)?.full_name)}`.toLowerCase().includes(q));
    const cur = rows.find(f => str(f.feedback_id) === sel) || rows[0];
    const u = cur && userOf(cur.user_id);
    return <>{flash}<section className="sec inbox">
      <div className="inbox-list"><div className="toolbar"><div className="seg"><button type="button" className={ff === 'open' ? 'on' : ''} onClick={() => setFf('open')}>Open · {all.filter(f => GROUPS.open.includes(str(f.status))).length}</button><button type="button" className={ff === 'resolved' ? 'on' : ''} onClick={() => setFf('resolved')}>Done · {all.filter(f => GROUPS.resolved.includes(str(f.status))).length}</button></div></div>
        <div className="list-scroll">{rows.length ? rows.map(f => { const fu = userOf(f.user_id); return <button type="button" key={str(f.feedback_id)} className={`list-item ${cur === f ? 'sel' : ''} ${str(f.status) === 'pending' ? 'unread' : ''}`} onClick={() => setSel(str(f.feedback_id))}><Av name={fu?.full_name || fu?.email || 'User'} /><span className="tt"><b>{str(f.subject)}</b><small>{str(fu?.full_name || fu?.email || 'Unknown user')} · {cap(f.type || 'general')} · {fmtShort(f.created_date)}</small></span></button>; }) : <Empty icon="msg" title="All caught up" text="Nothing waiting here." />}</div></div>
      {cur ? <div className="msg">
        <div className="msg-head"><Av name={u?.full_name || u?.email || 'User'} /><div style={{ flex: 1, minWidth: 0 }}><h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{str(cur.subject)}</h3><small style={{ color: 'var(--t3)' }}>{str(u?.full_name || 'Unknown user')}{u?.email ? ` · ${str(u.email)}` : ''} · {fmtShort(cur.created_date)}</small><div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}><B tone="mute">{cap(cur.type || 'general')}</B>{fbBadge(cur.status)}</div></div></div>
        <p className="msg-body">{str(cur.message)}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <label className="f" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>Status<select value={str(cur.status)} disabled={busy === str(cur.feedback_id)} onChange={e => void run('PATCH', 'feedback', cur, { status: e.target.value })}>{['pending', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{cap(s)}</option>)}</select></label>
          <span style={{ flex: 1 }} />
          {u && <button type="button" className="btn btn-g" onClick={() => onPage('Users', str(u.full_name || u.email))}><Ic n="users" s={15} />View subscriber</button>}
        </div>
      </div> : <div className="msg"><Empty icon="msg" title="No message selected" text="Pick a message from the list." /></div>}
    </section></>;
  }

  /* Reviews */
  const reviews = [...(data.reviews || [])].sort((a, b) => str(b.review_date).localeCompare(str(a.review_date)));
  const stars = (r: ManagedRow) => Math.round(Number(r.rating_value) || 0);
  const bad = (r: ManagedRow) => hasProfanity(str(r.review_comment));
  const rows = reviews.filter(r => rf === 'all' || (rf === 'flag' ? bad(r) : rf === 'low' ? stars(r) <= 2 : !!str(r.review_comment).trim())).filter(r => `${str(titleOf(r.content_id)?.title)} ${str(r.review_comment)}`.toLowerCase().includes(query.toLowerCase()));
  const RP = usePaged(rows, 6, `${rf}|${query}`);
  const dist = [5, 4, 3, 2, 1].map(s => reviews.filter(r => stars(r) === s).length);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + Number(r.rating_value || 0), 0) / reviews.length).toFixed(1) : '—';
  const remove = async (r: ManagedRow) => { if (await askConfirm({ title: 'Remove this review?', body: 'The review is removed from the title page. This can’t be undone.', label: 'Remove', icon: 'trash' })) void run('DELETE', 'reviews', r); };
  return <>{flash}<div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
    <div style={{ minWidth: 0 }}><div style={{ marginBottom: 16 }}><Chips label="Filter" value={rf} onChange={setRf} options={[['all', 'All', reviews.length], ['flag', 'Flagged words', reviews.filter(bad).length], ['low', '1–2 stars', reviews.filter(r => stars(r) <= 2).length], ['comment', 'With comments', reviews.filter(r => str(r.review_comment).trim()).length]]} /></div>
      {rows.length ? <><div className="rgrid">{RP.rows.map(r => { const t = titleOf(r.content_id); const u = userOf(r.user_id); const n = stars(r); return <article key={str(r.rev_id)} className={`review ${bad(r) || n <= 2 ? 'flag' : ''}`}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Poster src={t?.poster_url ? media(t.poster_url) : undefined} /><div style={{ minWidth: 0, flex: 1 }}><b style={{ fontSize: 13.5 }}>{str(t?.title) || 'Removed title'}</b><div className="stars" aria-label={`${n} of 5 stars`}>{[1, 2, 3, 4, 5].map(i => <span key={i} className={i > n ? 'off' : 'on'}><Ic n="star" s={13} /></span>)}</div></div>{bad(r) ? <B tone="bad">Flagged</B> : n <= 2 ? <B tone="warn">Low rating</B> : null}</div>
        <p>{str(r.review_comment).trim() ? `“${str(r.review_comment)}”` : <span style={{ color: 'var(--t3)' }}>Rating only, no comment.</span>}</p>
        <div className="review-foot"><span>{str(u?.full_name || 'Subscriber')} · {fmtShort(r.review_date)}</span><button type="button" className="icon-act danger" disabled={busy === str(r.rev_id)} aria-label="Remove review" onClick={() => void remove(r)}><Ic n="trash" s={15} /></button></div>
      </article>; })}</div>{rows.length > 6 && <div className="rpager">{RP.pager}</div>}</> : <section className="sec"><Empty icon="star" title="No reviews here" text="Nothing matches this filter." /></section>}
    </div>
    <aside className="sec inspector"><div className="sec-head"><h3>Rating summary</h3></div><div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'baseline', gap: 8 }}><strong className="num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.04em' }}>{avg}</strong><span style={{ color: 'var(--t3)' }}>/ 5 · {reviews.length} review{reviews.length === 1 ? '' : 's'}</span></div>
      <div className="dist">{dist.map((n, i) => <div key={i} className="dist-row"><span>{5 - i}★</span><div className="track"><span style={{ width: `${reviews.length ? n / reviews.length * 100 : 0}%` }} /></div><span className="num" style={{ textAlign: 'right' }}>{n}</span></div>)}</div></aside>
  </div></>;
}
