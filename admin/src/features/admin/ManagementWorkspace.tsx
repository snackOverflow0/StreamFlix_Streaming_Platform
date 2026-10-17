import { useEffect, useMemo, useState, type FormEvent } from 'react';
import MediaUpload from './MediaUpload';
import { Ic } from './proto-icons';
import { Av, B, Empty, Field, Modal, Poster, Search, Switch, askConfirm, cap, fmtDate, fmtShort, fmtStamp, peso, str, usePaged } from './proto-ui';

export type ManagedRow = Record<string, string | number | boolean | null | string[]>;
export type ManagementData = Record<string, ManagedRow[]>;
type FieldSpec = { key: string; label: string; kind?: string; options?: string[]; source?: string; required?: boolean };
type Spec = { key: string; id: string; label: string; columns: string[]; fields: FieldSpec[]; create?: boolean; remove?: boolean; help: string };
const field = (key: string, label: string, kind = 'text', required = true, source?: string): FieldSpec => ({ key, label, kind, required, source });
export const managementSpecs: Record<string, Spec> = {
  'Seasons': { key: 'seasons', id: 'season_id', label: 'Season', columns: ['content_id', 'season_number', 'season_title', 'release_date'], fields: [field('content_id', 'TV series', 'select', true, 'series'), field('season_number', 'Season number', 'number'), field('release_date', 'Release date', 'date'), field('season_title', 'Season title', 'text', false)], create: true, remove: true, help: '' },
  'Episodes': { key: 'episodes', id: 'episode_id', label: 'Episode', columns: ['season_id', 'episode_number', 'episode_title', 'duration', 'release_date'], fields: [field('season_id', 'Season', 'select', true, 'seasons'), field('episode_number', 'Episode number', 'number'), field('duration', 'Duration (minutes)', 'number'), field('episode_title', 'Episode title'), field('release_date', 'Release date', 'date'), field('video_url', 'Episode trailer', 'upload', false)], create: true, remove: true, help: '' },
  'Subscription Plans': { key: 'plans', id: 'plan_id', label: 'Plan', columns: ['plan_name', 'max_members', 'monthly_price', 'is_active'], fields: [field('plan_name', 'Plan name'), field('monthly_price', 'Monthly price (₱)', 'money'), field('max_members', 'Maximum members', 'number'), field('is_active', 'Available for new subscriptions', 'boolean')], create: true, help: '' },
  'Subscriptions': { key: 'subscriptions', id: 'subscription_id', label: 'Subscription', columns: ['subscription_user_id', 'plan_id', 'start_date', 'end_date', 'status'], fields: [field('subscription_user_id', 'Subscriber', 'select', true, 'users'), field('plan_id', 'Plan', 'select', true, 'plans'), field('start_date', 'Start date', 'date'), field('end_date', 'Expiry date', 'date'), { key: 'status', label: 'Access', options: ['active', 'cancelled'], required: true }], create: true, help: '' },
  'Feedback': { key: 'feedback', id: 'feedback_id', label: 'Feedback', columns: ['user_id', 'subject', 'type', 'status', 'created_date'], fields: [{ key: 'status', label: 'Status', options: ['pending', 'in_progress', 'resolved', 'closed'], required: true }], help: '' },
  'Reviews': { key: 'reviews', id: 'rev_id', label: 'Review', columns: ['content_id', 'user_id', 'rating_value', 'review_comment', 'review_date'], fields: [], remove: true, help: '' },
  'Merchandise': { key: 'products', id: 'product_id', label: 'Product', columns: ['image_url', 'product_name', 'category', 'price', 'stock', 'listing_status'], fields: [field('product_name', 'Product name'), field('category', 'Category'), field('price', 'Price (₱)', 'money'), field('stock', 'Available stock', 'stock'), { key: 'listing_status', label: 'Listing status', options: ['active', 'sold_out', 'removed'], required: true }, field('variants', 'Variants (one per line)', 'variants', false), field('description', 'Description', 'textarea', false), field('image_url', 'Product image', 'image', false)], create: true, remove: true, help: '' },
  'Orders': { key: 'orders', id: 'transaction_id', label: 'Order', columns: ['user_id', 'profile_name', 'product_id', 'quantity', 'total_amount', 'payment_status', 'order_status', 'created_at'], fields: [{ key: 'order_status', label: 'Order status', options: ['pending', 'processing', 'shipped', 'completed'], required: true }, { key: 'payment_status', label: 'Payment status', options: ['pending', 'paid'], required: true }], help: '' },
  'Archived Content': { key: 'archived', id: 'content_id', label: 'Archived title', columns: ['title', 'type', 'deleted_at'], fields: [], help: '' },
};
export function displayValue(key: string, value: unknown, data: ManagementData): string {
  const source = key === 'content_id' ? 'content' : key === 'user_id' || key === 'subscription_user_id' ? 'users' : key === 'plan_id' ? 'plans' : key === 'season_id' ? 'seasons' : key === 'product_id' ? 'products' : key === 'episode_id' ? 'episodes' : '';
  const row = source ? (data[source] || []).find(r => String(r[key === 'subscription_user_id' ? 'user_id' : key]) === String(value)) : undefined;
  if (row) { if (source === 'seasons') return `${displayValue('content_id', row.content_id, data)} · Season ${row.season_number}`; return String(row.title || row.full_name || row.plan_name || row.product_name || row.episode_title || value); }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'; return value === null || value === undefined || value === '' ? '—' : String(value);
}
export function exportRecords(rows: unknown, name: string) { const url = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

const today = () => new Date().toISOString().slice(0, 10);
const daysLeft = (d: unknown) => d ? Math.ceil((new Date(str(d) + 'T23:59:59').getTime() - Date.now()) / 864e5) : Infinity;
const isSeries = (r: ManagedRow) => /series|show/i.test(str(r.type));
/* Subscription status, derived only from status + dates (same rule the backend enforces). */
export function subState(s: ManagedRow | undefined): 'active' | 'expiring' | 'cancelled' | 'expired' | 'none' {
  if (!s) return 'none'; const t = today();
  if (str(s.status) === 'cancelled') return 'cancelled';
  if (str(s.status) === 'active' && str(s.start_date) <= t && (!s.end_date || str(s.end_date) >= t)) return daysLeft(s.end_date) <= 7 ? 'expiring' : 'active';
  return 'expired';
}
export const subBadge = (s: ReturnType<typeof subState>) => ({ active: <B tone="ok">Active</B>, expiring: <B tone="warn">Expiring soon</B>, cancelled: <B tone="mute">Cancelled</B>, expired: <B tone="bad">Expired</B>, none: <B tone="mute">No plan</B> })[s];

type Props = { preview?: boolean; page: string; data: ManagementData; query: string; onQuery: (v: string) => void; onMutate: (resource: string, method: string, row: ManagedRow, payload?: ManagedRow) => Promise<void>; createSignal?: number; preset?: string; media?: (u: unknown) => string };
export default function ManagementWorkspace({ page, data, query, onQuery, onMutate, preview = false, createSignal = 0, preset, media = u => str(u) }: Props) {
  const spec = managementSpecs[page];
  const [editing, setEditing] = useState<ManagedRow | null>(null);
  const [busy, setBusy] = useState(''); const [uploadBusy, setUploadBusy] = useState(0); const [error, setError] = useState('');
  const [seriesSel, setSeriesSel] = useState(''); const [openSeason, setOpenSeason] = useState('');
  const [sf, setSf] = useState('all'); const [subSel, setSubSel] = useState('');
  const [of, setOf] = useState(preset === 'pending' ? 'pending' : 'all');
  const [seen, setSeen] = useState(createSignal);
  useEffect(() => { if (createSignal !== seen) { setSeen(createSignal); openCreate(); } }, [createSignal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (preset === 'pending') setOf('pending'); }, [preset]);

  const series = useMemo(() => (data.content || []).filter(r => isSeries(r) && !r.deleted_at), [data.content]);
  const curSeries = series.find(s => str(s.content_id) === seriesSel) || (query ? series.find(s => str(s.title).toLowerCase() === query.toLowerCase()) : undefined) || series[0];
  const seasonsOf = (cid: unknown) => (data.seasons || []).filter(s => str(s.content_id) === str(cid)).sort((a, b) => Number(a.season_number) - Number(b.season_number));
  const episodesOf = (sid: unknown) => (data.episodes || []).filter(e => str(e.season_id) === str(sid)).sort((a, b) => Number(a.episode_number) - Number(b.episode_number));

  function openCreate() {
    if (page === 'Seasons') setEditing({ content_id: curSeries ? curSeries.content_id : null, season_number: seasonsOf(curSeries?.content_id).length + 1 });
    else if (page === 'Episodes') { const ss = seasonsOf(curSeries?.content_id); const sid = openSeason || str(ss[0]?.season_id); setEditing({ season_id: sid || null, episode_number: episodesOf(sid).length + 1 }); }
    else if (page === 'Subscriptions') setEditing({ start_date: today(), status: 'active' });
    else if (page === 'Subscription Plans') setEditing({ is_active: true, max_members: 1 });
    else if (page === 'Merchandise') setEditing({ listing_status: 'active', stock: 0 });
    else setEditing({});
  }
  async function mutate(method: string, row: ManagedRow, payload?: ManagedRow, key = spec.key) {
    setBusy(str(row[spec.id] ?? 'new')); setError('');
    try { await onMutate(key, method, row, payload); setEditing(null); return true; } catch (e) { setError((e as Error).message); return false; } finally { setBusy(''); }
  }
  const editingFields = spec.key === 'subscriptions' && editing?.[spec.id] ? spec.fields.filter(f => ['end_date', 'status'].includes(f.key)) : spec.fields;
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const values = Object.fromEntries(new FormData(e.currentTarget)); const payload: ManagedRow = {};
    for (const f of editingFields) { const v = values[f.key]; if (f.kind === 'upload' || f.kind === 'image') { if (v !== undefined && v !== '') payload[f.key] = String(v); continue; } if (v === '' || v === undefined) { if (!f.required && !['variants', 'textarea'].includes(f.kind || '')) continue; } payload[f.key] = f.kind === 'variants' ? String(v || '').split('\n').map(s => s.trim()).filter(Boolean) : f.kind === 'boolean' ? v === 'true' : ['number', 'money', 'stock'].includes(f.kind || '') || f.source ? Number(v) : String(v ?? ''); }
    await mutate(editing?.[spec.id] ? 'PATCH' : 'POST', editing || {}, payload);
  }
  function sourceRows(source?: string) {
    if (source === 'series') return series.map(r => [str(r.content_id), str(r.title)]);
    if (source === 'seasons') return (data.seasons || []).map(s => [str(s.season_id), `${displayValue('content_id', s.content_id, data)} · Season ${s.season_number}${s.season_title ? ' · ' + s.season_title : ''}`]);
    if (source === 'plans') return (data.plans || []).filter(r => r.is_active).map(r => [str(r.plan_id), `${str(r.plan_name)} · ${peso(r.monthly_price)}`]);
    if (source === 'users') return (data.users || []).filter(r => r.account_status === 'active' && !r.deleted_at).map(r => [str(r.user_id), str(r.full_name || r.email)]);
    return [];
  }
  const input = (f: FieldSpec) => {
    const v = editing?.[f.key];
    if (f.kind === 'upload' || f.kind === 'image') return <MediaUpload key={str(editing?.[spec.id] || 'new') + f.key} name={f.key} value={str(v)} accept={f.kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm,video/quicktime'} preview={preview} onBusy={b => setUploadBusy(n => Math.max(0, n + (b ? 1 : -1)))} onUploaded={editing?.[spec.id] ? url => onMutate(spec.key, 'PATCH', editing, { [f.key]: url }) : undefined} />;
    if (f.kind === 'textarea' || f.kind === 'variants') return <textarea name={f.key} defaultValue={Array.isArray(v) ? v.join('\n') : str(v)} placeholder={f.kind === 'variants' ? 'S\nM\nL' : undefined} />;
    if (f.kind === 'boolean') return <select name={f.key} defaultValue={v === false ? 'false' : 'true'}><option value="true">Yes</option><option value="false">No</option></select>;
    if (f.options) return <select name={f.key} defaultValue={str(v ?? f.options[0])}>{f.options.map(o => <option key={o} value={o}>{cap(o)}</option>)}</select>;
    if (f.source) return <select name={f.key} defaultValue={str(v)} required={f.required}><option value="">Select {f.label.toLowerCase()}</option>{sourceRows(f.source).map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>;
    return <input name={f.key} type={f.kind === 'date' ? 'date' : ['number', 'money', 'stock'].includes(f.kind || '') ? 'number' : 'text'} step={f.kind === 'money' ? '.01' : undefined} min={['number', 'money', 'stock'].includes(f.kind || '') ? (f.kind === 'number' ? 1 : 0) : f.key === 'end_date' ? today() : undefined} defaultValue={f.kind === 'date' ? str(v).slice(0, 10) : str(v)} required={f.required} />;
  };
  const full = (f: FieldSpec) => ['content_id', 'season_id', 'episode_title', 'plan_name', 'product_name', 'subscription_user_id', 'plan_id', 'description', 'variants', 'season_title', 'is_active', 'video_url'].includes(f.key) || (spec.key === 'subscriptions' && editing?.[spec.id] !== undefined);
  const foot = <><span className="left">{uploadBusy ? 'Uploading…' : 'Saves to Supabase'}</span><button type="button" className="btn btn-g" disabled={!!busy || uploadBusy > 0} onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-p" disabled={!!busy || uploadBusy > 0}>{busy ? 'Saving…' : 'Save changes'}</button></>;
  const err = error && editing ? <p className="form-err" role="alert">{error}</p> : null;
  const editorTitle = editing ? (page === 'Subscriptions' ? (editing[spec.id] ? 'Edit subscription' : 'Assign a plan') : page === 'Subscription Plans' ? (editing[spec.id] ? 'Edit plan' : 'New plan') : page === 'Merchandise' ? (editing[spec.id] ? 'Edit product' : 'Add product') : `${editing[spec.id] ? 'Edit' : 'Add'} ${spec.label.toLowerCase()}`) : '';
  const editorSub = page === 'Subscriptions' ? (editing?.[spec.id] ? displayValue('subscription_user_id', editing.subscription_user_id, data) : 'Only active plans and active accounts are listed.') : page === 'Seasons' ? 'Seasons belong to a TV series.' : '';
  const editor = editing && (page === 'Merchandise'
    ? <Modal portal title={editorTitle} onClose={() => setEditing(null)} busy={!!busy || uploadBusy > 0} onSubmit={save} foot={foot} bodyStyle={{ minHeight: 0 }}>
      <div className="m-cols sf-merch-editor"><div className="m-side"><div className="prod-art">{editing.image_url ? <img src={media(editing.image_url)} alt="" /> : <Ic n="bag" s={36} />}</div>{input(spec.fields.find(f => f.key === 'image_url')!)}</div>
        <div className="fgrid">{spec.fields.filter(f => f.key !== 'image_url').map(f => <Field key={f.key} label={f.label} full={full(f)} hint={f.key === 'stock' ? 'Excludes stock reserved by open card checkouts' : undefined}>{input(f)}</Field>)}</div></div>{err}
    </Modal>
    : <Modal size="sm" title={editorTitle} sub={editorSub} onClose={() => setEditing(null)} busy={!!busy || uploadBusy > 0} onSubmit={save} foot={foot}>
      <div className="fgrid">{editingFields.map(f => <Field key={f.key} label={f.label} full={full(f)}>{input(f)}</Field>)}</div>{err}
    </Modal>);
  const flash = error && !editing ? <p className="form-err" role="alert" style={{ marginBottom: 14 }}>{error}</p> : null;

  /* ---------- Archived content ---------- */
  if (page === 'Archived Content') {
    const rows = (data.archived || []).filter(r => str(r.title).toLowerCase().includes(query.toLowerCase()));
    const full = (r: ManagedRow) => (data.content || []).find(c => str(c.content_id) === str(r.content_id)) || r;
    return <>{flash}<section className="sec">{rows.length ? <div className="pgrid">{rows.map(r => { const f = full(r); return <div key={str(r.content_id)} className="pcard"><div style={{ filter: 'grayscale(.7)', opacity: .85 }}><Poster src={f.poster_url ? media(f.poster_url) : undefined} /></div><div className="pcard-meta"><span style={{ minWidth: 0 }}><b>{str(r.title)}</b><small>{isSeries(r) ? 'Series' : 'Movie'} · archived {fmtShort(r.deleted_at)}</small></span></div><button type="button" className="btn btn-g btn-sm" style={{ width: '100%', marginTop: 10 }} disabled={busy === str(r.content_id)} onClick={() => void mutate('RESTORE', r)}><Ic n="restore" s={14} />{busy === str(r.content_id) ? 'Restoring…' : 'Restore'}</button></div>; })}</div> : <Empty icon="archive" title="Nothing archived" text="Titles you archive will wait here, ready to restore." />}</section></>;
  }

  /* ---------- Seasons & Episodes ---------- */
  if (page === 'Seasons' || page === 'Episodes') {
    const isEp = page === 'Episodes';
    const ss = curSeries ? seasonsOf(curSeries.content_id) : [];
    const open = openSeason === '-' ? '' : openSeason && ss.some(s => str(s.season_id) === openSeason) ? openSeason : str(ss[ss.length - 1]?.season_id ?? '');
    const delSeason = async (s: ManagedRow) => { if (await askConfirm({ title: 'Delete this season?', body: 'Delete this season’s episodes first. This can’t be undone.', label: 'Delete', icon: 'trash' })) void mutate('DELETE', s, undefined, 'seasons'); };
    const delEp = async (e: ManagedRow) => { if (await askConfirm({ title: 'Delete this episode?', body: 'This can’t be undone.', label: 'Delete', icon: 'trash' })) void mutate('DELETE', e, undefined, 'episodes'); };
    const editSeason = (s: ManagedRow) => { if (isEp) return; setEditing(s); };
    const editEp = (e: ManagedRow) => { if (!isEp) return; setEditing(e); };
    return <>{flash}<div className="split-l">
      <section className="sec"><div className="sec-head"><h3>Series<span className="sub">{series.length}</span></h3></div><div className="list-scroll">{series.map(t => { const tss = seasonsOf(t.content_id); return <button type="button" key={str(t.content_id)} className={`list-item ${curSeries === t ? 'sel' : ''}`} onClick={() => { setSeriesSel(str(t.content_id)); setOpenSeason(''); }}><Poster src={t.poster_url ? media(t.poster_url) : undefined} /><span className="tt"><b>{str(t.title)}</b><small>{tss.length} season{tss.length === 1 ? '' : 's'} · {tss.reduce((a, s) => a + episodesOf(s.season_id).length, 0)} episodes</small></span><Ic n="right" s={14} /></button>; })}{!series.length && <Empty icon="tv" title="No series yet" text="Add a TV series from the Catalog first." />}</div></section>
      <section className="sec">{curSeries ? <>
        <div className="sec-head"><div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}><Poster src={curSeries.poster_url ? media(curSeries.poster_url) : undefined} /><div style={{ minWidth: 0 }}><h3>{str(curSeries.title)}</h3><small style={{ color: 'var(--t3)', fontSize: 12 }}>{ss.length} season{ss.length === 1 ? '' : 's'}{curSeries.genre_name ? ` · ${str(curSeries.genre_name)}` : ''}</small></div></div><button type="button" className="btn btn-g btn-sm" disabled={isEp && !ss.length} onClick={openCreate}><Ic n="plus" s={14} />{isEp ? 'Episode' : 'Season'}</button></div>
        {ss.length ? ss.map(s => { const eps = episodesOf(s.season_id); const on = open === str(s.season_id); return <div key={str(s.season_id)} className={`acc ${on ? 'open' : ''}`}>
          <div className="acc-row"><button type="button" className="acc-h" aria-expanded={on} onClick={() => setOpenSeason(on ? '-' : str(s.season_id))}><span className="num-badge">S{str(s.season_number)}</span><span className="tt"><b>{str(s.season_title) || `Season ${str(s.season_number)}`}</b><small>{eps.length} episode{eps.length === 1 ? '' : 's'} · released {fmtDate(s.release_date)}</small></span><Ic n="chev" s={18} /></button>
            {!isEp && <><button type="button" className="icon-act" aria-label={`Edit season ${str(s.season_number)}`} onClick={() => editSeason(s)}><Ic n="edit" s={15} /></button><button type="button" className="icon-act danger" aria-label={`Delete season ${str(s.season_number)}`} onClick={() => void delSeason(s)}><Ic n="trash" s={15} /></button></>}</div>
          <div className="acc-b"><div>{eps.map(e => <div key={str(e.episode_id)} className="ep"><span className="mono">E{str(e.episode_number).padStart(2, '0')}</span><b>{str(e.episode_title)}</b><span className="mono hide-m">{str(e.duration)} min</span><span className="row-acts">{isEp && <button type="button" className="icon-act" aria-label={`Edit episode ${str(e.episode_number)}`} onClick={() => editEp(e)}><Ic n="edit" s={14} /></button>}{(e.trailer_url || e.video_url) ? <a className="icon-act" href={media(e.trailer_url || e.video_url)} target="_blank" rel="noreferrer" aria-label="Play trailer"><Ic n="play" s={14} /></a> : null}{isEp && <button type="button" className="icon-act danger" aria-label={`Delete episode ${str(e.episode_number)}`} onClick={() => void delEp(e)}><Ic n="trash" s={14} /></button>}</span></div>)}{!eps.length && <div className="ep" style={{ color: 'var(--t3)' }}><span /><span>No episodes yet{isEp ? ' — use “Episode” above to add one.' : '.'}</span></div>}</div></div>
        </div>; }) : <Empty icon="layers" title="No seasons yet" text={isEp ? 'Add a season on the Seasons page first.' : 'Add the first season for this series.'} />}
      </> : <Empty icon="tv" title="No series selected" text="Pick a series from the list." />}</section>
    </div>{editor}</>;
  }

  /* ---------- Subscriptions ---------- */
  if (page === 'Subscriptions') {
    const userOf = (id: unknown) => (data.users || []).find(u => str(u.user_id) === str(id));
    const planOf = (id: unknown) => (data.plans || []).find(p => str(p.plan_id) === str(id));
    const pool = (data.subscriptions || []);
    const st = (s: ManagedRow) => subState(s);
    const counts = { all: pool.length, active: pool.filter(s => st(s) === 'active').length, expiring: pool.filter(s => st(s) === 'expiring').length, ended: pool.filter(s => ['cancelled', 'expired'].includes(st(s))).length };
    const rows = pool.filter(s => sf === 'all' || (sf === 'ended' ? ['cancelled', 'expired'].includes(st(s)) : st(s) === sf)).filter(s => `${str(userOf(s.subscription_user_id)?.full_name)} ${str(userOf(s.subscription_user_id)?.email)}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => str(b.start_date).localeCompare(str(a.start_date)));
    const P = usePagedLocal(rows, 8, `${sf}|${query}`);
    const cur = rows.find(s => str(s.subscription_id) === subSel) || P.rows[0];
    const on = (s: ManagedRow) => ['active', 'expiring'].includes(st(s));
    const used = (s: ManagedRow) => { const a = new Date(str(s.start_date)).getTime(), b = new Date(str(s.end_date)).getTime(); return b > a ? Math.min(100, Math.max(0, (Date.now() - a) / (b - a) * 100)) : 100; };
    const canOn = (s: ManagedRow) => str(s.start_date) <= today() && (!s.end_date || str(s.end_date) >= today());
    const toggle = (s: ManagedRow) => { if (on(s)) void mutate('PATCH', s, { status: 'cancelled' }); else if (!canOn(s)) setError('Update the expiry date before turning this subscription on.'); else void mutate('PATCH', s, { status: 'active' }); };
    const pl = cur && planOf(cur.plan_id); const u = cur && userOf(cur.subscription_user_id);
    return <>{flash}
      <div className="sub-strip cards4" role="tablist">{([['all', 'All records', counts.all], ['active', 'Active', counts.active], ['expiring', 'Expiring ≤ 7 days', counts.expiring], ['ended', 'Cancelled or expired', counts.ended]] as const).map(([k, l, n]) => <button type="button" key={k} className={sf === k ? 'on' : ''} role="tab" aria-selected={sf === k} onClick={() => setSf(k)}><small style={{ color: 'var(--t2)', fontSize: 12.5, fontWeight: 600 }}>{l}</small><strong className="num">{n}</strong></button>)}</div>
      <div className="split al al-9"><section className="sec"><div className="toolbar"><Search value={query} onChange={onQuery} label="Search subscriber…" /></div>
        <div className="tw"><table className="cards-m"><thead><tr><th>Subscriber</th><th>Status</th><th>Billing period</th><th>Access</th></tr></thead><tbody>{P.rows.map(s => { const us = userOf(s.subscription_user_id), p = planOf(s.plan_id), x = st(s); return <tr key={str(s.subscription_id)} className={cur === s ? 'sel' : ''}>
          <td className="main"><button type="button" className="cell-main" onClick={() => setSubSel(str(s.subscription_id))}><Av name={us?.full_name || us?.email} /><span>{str(us?.full_name || us?.email || 'Unknown user')}<small>{str(p?.plan_name || 'Plan')} · {peso(p?.monthly_price)}/mo</small></span></button></td>
          <td data-label="Status">{subBadge(x)}</td>
          <td data-label="Period"><div className="renew" style={{ minWidth: 130 }}><span style={{ fontSize: 12 }}>{on(s) ? 'Renews' : 'Ended'} {fmtShort(s.end_date)}</span><div className="track"><span style={{ width: `${on(s) ? used(s) : 100}%`, ...(x === 'expiring' ? { background: 'var(--warn)' } : !on(s) ? { background: 'var(--s4)' } : {}) }} /></div></div></td>
          <td data-label="Access" className="acts"><Switch on={on(s)} disabled={busy === str(s.subscription_id)} label={`Access for ${str(us?.full_name)}`} onClick={() => toggle(s)} /></td>
        </tr>; })}</tbody></table>{rows.length ? null : <Empty icon="card" title="No subscriptions here" text="Change the status filter above." />}</div>{P.pager}</section>
        {cur ? <aside className="sec inspector"><div className="sec-head"><h3>Subscription detail</h3>{subBadge(st(cur))}</div>
          <div className="ucard-hero" style={{ padding: '16px 20px' }}><Av name={u?.full_name || u?.email} /><div style={{ minWidth: 0 }}><h3 style={{ fontSize: 15 }}>{str(u?.full_name || u?.email || 'Unknown user')}</h3><small style={{ color: 'var(--t3)', fontSize: 12 }}>{str(pl?.plan_name || 'Plan')} plan · {str(pl?.max_members || 1)} member{Number(pl?.max_members) > 1 ? 's' : ''}</small></div></div>
          <dl className="dl"><dt>Monthly price</dt><dd className="num">{pl ? peso(pl.monthly_price) : '—'}</dd><dt>Started</dt><dd>{fmtDate(cur.start_date)}</dd><dt>{on(cur) ? 'Renews' : 'Ended'}</dt><dd>{fmtDate(cur.end_date)}</dd></dl>
          <div className="stripe-box"><div className="r"><b style={{ color: 'var(--info)' }}>Billing</b><span /></div><div className="r"><span>Record</span><span>#{str(cur.subscription_id)}</span></div><div className="r"><span>Account email</span><span>{str(u?.email) || '—'}</span></div></div>
          {!on(cur) && !canOn(cur) && <p style={{ margin: '0 20px 12px', fontSize: 12, color: 'var(--warn)' }}>Update the expiry date before turning this subscription on.</p>}
          <div className="ins-acts"><button type="button" className="btn btn-g" onClick={() => setEditing(cur)}><Ic n="edit" s={15} />Edit expiry</button><button type="button" className={`btn ${on(cur) ? 'btn-g' : 'btn-p'}`} disabled={busy === str(cur.subscription_id)} onClick={() => toggle(cur)}>{on(cur) ? 'Turn off' : 'Turn on'}</button></div>
        </aside> : <aside className="sec inspector"><Empty icon="card" title="Nothing selected" text="Pick a subscription to see details." /></aside>}
      </div>{editor}</>;
  }

  /* ---------- Plans ---------- */
  if (page === 'Subscription Plans') {
    const plans = [...(data.plans || [])].sort((a, b) => Number(a.monthly_price) - Number(b.monthly_price));
    const subsOf = (p: ManagedRow) => (data.subscriptions || []).filter(s => str(s.plan_id) === str(p.plan_id) && ['active', 'expiring'].includes(subState(s))).length;
    const top = plans.filter(p => p.is_active).reduce<ManagedRow | null>((best, p) => !best || subsOf(p) > subsOf(best) ? p : best, null);
    return <>{flash}<div className="plans">{plans.map(p => { const feat = top === p && subsOf(p) > 0; return <article key={str(p.plan_id)} className={`plan ${feat ? 'feat' : ''} ${p.is_active ? '' : 'off'}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><h3 style={{ fontSize: 17, fontWeight: 800 }}>{str(p.plan_name)}</h3>{p.is_active ? (feat ? <B tone="acc">Most popular</B> : <B tone="ok">Available</B>) : <B tone="mute">Not offered</B>}</div>
      <div className="plan-price"><strong className="num">{peso(p.monthly_price)}</strong><small>/ month</small></div>
      <ul><li><Ic n="check" s={15} />{str(p.max_members)} member{Number(p.max_members) > 1 ? 's' : ''} per account</li><li><Ic n="check" s={15} />{Number(p.max_members) > 1 ? 'Shared profiles for the household' : 'One personal profile'}</li></ul>
      <div className="plan-foot"><span><b className="num" style={{ color: 'var(--t1)' }}>{subsOf(p).toLocaleString()}</b> subscriber{subsOf(p) === 1 ? '' : 's'}</span><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Switch on={p.is_active === true} disabled={busy === str(p.plan_id)} label={`Offer ${str(p.plan_name)} plan`} onClick={() => void mutate('PATCH', p, { is_active: !p.is_active })} /><button type="button" className="icon-act" aria-label={`Edit ${str(p.plan_name)}`} onClick={() => setEditing(p)}><Ic n="edit" s={15} /></button></span></div>
    </article>; })}{!plans.length && <section className="sec"><Empty icon="crown" title="No plans yet" text="Create your first plan with “New plan”." /></section>}</div>{editor}</>;
  }

  /* ---------- Merchandise ---------- */
  if (page === 'Merchandise') {
    const live = (data.products || []).filter(p => p.listing_status !== 'removed').filter(p => `${str(p.product_name)} ${str(p.category)}`.toLowerCase().includes(query.toLowerCase()));
    const remove = async (p: ManagedRow) => { if (await askConfirm({ title: 'Remove this listing?', body: 'The listing is removed from the store. Existing orders are kept.', label: 'Remove', icon: 'trash' })) void mutate('DELETE', p); };
    return <>{flash}{live.length ? <div className="mgrid">{live.map(p => { const stock = Number(p.stock ?? p.stock_quantity ?? 0); return <article key={str(p.product_id)} className="prod">
      <div className="thumb">{p.image_url ? <img src={media(p.image_url)} alt="" loading="lazy" /> : <Ic n="bag" s={40} />}{p.listing_status === 'sold_out' || stock === 0 ? <B tone="bad">Sold out</B> : stock <= 6 ? <B tone="warn">Low stock</B> : <B tone="ok">Active</B>}</div>
      <div className="prod-b"><div className="r"><b style={{ fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{str(p.product_name)}</b><b className="num">{peso(p.price)}</b></div>
        <div className="r"><span className={`stock ${stock <= 6 ? 'low' : ''}`}>{stock} in stock · {str(p.category)}</span><span className="row-acts"><button type="button" className="icon-act" aria-label={`Edit ${str(p.product_name)}`} onClick={() => setEditing(p)}><Ic n="edit" s={15} /></button><button type="button" className="icon-act danger" aria-label={`Remove ${str(p.product_name)}`} onClick={() => void remove(p)}><Ic n="trash" s={15} /></button></span></div></div>
    </article>; })}</div> : <section className="sec"><Empty icon="bag" title="No products" text="Add your first product with “Add product”." /></section>}{editor}</>;
  }

  /* ---------- Orders ---------- */
  if (page === 'Orders') {
    const stages = ['pending', 'processing', 'shipped', 'completed'];
    const all = data.orders || [];
    const userOf = (id: unknown) => (data.users || []).find(u => str(u.user_id) === str(id));
    const prodOf = (id: unknown) => (data.products || []).find(p => str(p.product_id) === str(id));
    const rows = all.filter(o => of === 'all' || str(o.order_status) === of).filter(o => `SF-${str(o.transaction_id)} ${str(userOf(o.user_id)?.full_name)} ${str(o.delivery_name)}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => str(b.created_at).localeCompare(str(a.created_at)));
    const P = usePagedLocal(rows, 6, `${of}|${query}`);
    const method = (o: ManagedRow) => /cash|cod/i.test(str(o.payment_method)) ? 'COD' : str(o.payment_method) || 'Card';
    return <>{flash}
      <div className="pipeline">{stages.map(s => { const inS = all.filter(o => str(o.order_status) === s); return <button type="button" key={s} className={`stage ${of === s ? 'on' : ''}`} aria-pressed={of === s} onClick={() => setOf(of === s ? 'all' : s)}><small>{cap(s)}</small><strong className="num">{inS.length}</strong><small>{peso(inS.reduce((a, o) => a + Number(o.total_amount || 0), 0))}</small></button>; })}</div>
      <section className="sec"><div className="toolbar"><Search value={query} onChange={onQuery} label="Search order # or customer…" />{of !== 'all' && <button type="button" className="chip on" onClick={() => setOf('all')}>{cap(of)} only <Ic n="x" s={12} /></button>}</div>
        <div className="tw"><table className="cards-m"><thead><tr><th>Order</th><th>Customer</th><th>Item</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{P.rows.map(o => { const u = userOf(o.user_id), p = prodOf(o.product_id); const paid = str(o.payment_status) === 'paid'; const s = str(o.order_status); return <tr key={str(o.transaction_id)}>
          <td className="main"><span className="cell-main"><span><span className="mono">SF-{str(o.transaction_id)}</span><small>{fmtStamp(o.created_at)}</small></span></span></td>
          <td data-label="Customer"><span>{str(u?.full_name || o.delivery_name || 'Customer')}<small style={{ display: 'block', color: 'var(--t3)', fontSize: 11 }}>Profile: {str(o.profile_name) || 'Main'}</small></span></td>
          <td data-label="Item">{str(p?.product_name || 'Product')} × {str(o.quantity)}</td>
          <td data-label="Total" className="num" style={{ color: 'var(--t1)' }}>{peso(o.total_amount)}</td>
          <td data-label="Payment"><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{paid ? <B tone="ok">Paid · {method(o)}</B> : str(o.payment_status) === 'refunded' ? <B tone="mute">Refunded · {method(o)}</B> : <B tone="warn">Pending · {method(o)}</B>}{!paid && method(o) === 'COD' && s !== 'cancelled' && <button type="button" className="btn btn-g btn-sm" disabled={busy === str(o.transaction_id)} onClick={() => void mutate('PATCH', o, { payment_status: 'paid' })}>Mark paid</button>}</span></td>
          <td data-label="Status" className="acts">{s === 'cancelled' ? <B tone="bad">Cancelled</B> : <select aria-label={`Order status for SF-${str(o.transaction_id)}`} style={{ minHeight: 32, height: 32 }} value={s} disabled={busy === str(o.transaction_id)} onChange={e => void mutate('PATCH', o, { order_status: e.target.value })}>{stages.map(x => <option key={x} value={x}>{cap(x)}</option>)}</select>}</td>
        </tr>; })}</tbody></table>{rows.length ? null : <Empty icon="receipt" title="No orders here" text="Try another stage." />}</div>{P.pager}</section></>;
  }
  return null;
}
/* Local alias so hooks stay unconditional per page branch. */
function usePagedLocal<T>(rows: T[], per: number, key: string) { return usePaged(rows, per, key); }
