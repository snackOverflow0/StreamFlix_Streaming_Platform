import { useMemo, useState } from 'react';
import { licenseStatus } from './licenseAccess';
import { manilaDate } from './subscriptionAccess';
import AssetPreview from './AssetPreview';
import type { ManagedRow, ManagementData } from './ManagementWorkspace';
import { Ic } from './proto-icons';
import { B, Chips, Empty, Modal, Poster, Search, cap, fmtDate, str, usePaged } from './proto-ui';

/* Genres, Licensing and Media Assets in the prototype layouts, using live rows only. */
type Props = { page: string; rows: ManagedRow[]; data: ManagementData; query: string; onQuery: (v: string) => void; onEdit?: (row: ManagedRow) => void; onDelete?: (row: ManagedRow) => void; onView?: (row: ManagedRow) => void; onCreate?: () => void; media?: (url: unknown) => string };
const KIND_IC: Record<string, string> = { image: 'image', video: 'film', audio: 'play', document: 'list' };

export default function ResourceCards({ page, rows, data, query, onQuery, onEdit, onDelete, onView, onCreate, media = u => str(u) }: Props) {
  const [folder, setFolder] = useState('all');
  const [detail, setDetail] = useState<ManagedRow | null>(null);
  const content = (data.content || []).filter(c => !c.deleted_at);

  if (page === 'Genres') {
    return <div className="genres">{rows.map(g => { const ts = content.filter(c => str(c.genre_id) === str(g.genre_id)); return <div key={str(g.genre_id)} className="genre" style={{ background: 'var(--s1)' }}>
      <button type="button" style={{ textAlign: 'left', position: 'relative', zIndex: 1 }} onClick={() => onView?.(g)} aria-label={`View titles in ${str(g.genre_name)}`}><b>{str(g.genre_name)}</b><br /><small>{ts.length} title{ts.length === 1 ? '' : 's'}</small></button>
      <span style={{ display: 'flex', gap: 4, position: 'relative', zIndex: 1 }}>{onEdit && <button type="button" className="icon-act" aria-label={`Edit ${str(g.genre_name)}`} onClick={() => onEdit(g)}><Ic n="edit" s={14} /></button>}{onDelete && !ts.length && <button type="button" className="icon-act danger" aria-label={`Delete ${str(g.genre_name)}`} onClick={() => onDelete(g)}><Ic n="trash" s={14} /></button>}</span>
      <span className="genre-posters" aria-hidden="true">{ts.filter(t => t.poster_url).slice(0, 3).map(t => <Poster key={str(t.content_id)} src={media(t.poster_url)} />)}</span>
    </div>; })}{!rows.length && <section className="sec" style={{ gridColumn: '1/-1' }}><Empty icon="tag" title={query ? 'No matching genres' : 'No genres yet'} text="Add a genre to organize the catalog." /></section>}</div>;
  }

  if (page === 'Licensing') return <Licensing rows={rows} content={content} onEdit={onEdit} onDelete={onDelete} />;

  /* Media assets */
  const folders = ['all', ...Array.from(new Set(rows.map(a => str(a.folder)).filter(Boolean)))];
  const list = rows.filter(a => folder === 'all' || str(a.folder) === folder);
  const P = usePaged(list, 8, `${folder}|${query}`);
  const kinds = ['Image', 'Video', 'Audio', 'Document'].map(k => [k, rows.filter(a => str(a.kind).toLowerCase() === k.toLowerCase()).length] as const);
  return <div className="split">
    <section className="sec"><div className="toolbar"><Search value={query} onChange={onQuery} label="Search files…" /><Chips label="Folder" value={folder} onChange={setFolder} options={folders.map(f => [f, f === 'all' ? 'All' : cap(f)] as [string, string])} /></div>
      {list.length ? <><div className="agrid">{P.rows.map(a => { const k = str(a.kind).toLowerCase(); return <button type="button" key={str(a.asset_id)} className="asset" onClick={() => setDetail(a)}>
        <div className="thumb" style={{ background: 'var(--s3)', position: 'relative', overflow: 'hidden' }}>{k === 'image' && a.url && !str(a.url).startsWith('storage://') ? <img src={media(a.url)} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <Ic n={KIND_IC[k] || 'list'} s={26} />}</div>
        <div className="meta"><b>{str(a.name)}</b><small>{cap(a.kind)} · /{str(a.folder || 'root').toLowerCase()}</small></div>
      </button>; })}</div>{P.pager}</> : <Empty icon="image" title="No files here" text="Upload artwork or trailers to this folder." />}
    </section>
    <aside className="sec inspector"><div className="sec-head"><h3>Library</h3><span className="sub">{rows.length} file{rows.length === 1 ? '' : 's'}</span></div>
      <div className="sec-pad storage">{kinds.map(([k, n]) => <div key={k} className="mix-row" style={{ gridTemplateColumns: '90px 1fr 40px' }}><span>{k}</span><div className="track" style={{ height: 5 }}><span style={{ width: `${rows.length ? n / rows.length * 100 : 0}%` }} /></div><b className="num" style={{ textAlign: 'right' }}>{n}</b></div>)}</div>
      <div className="ins-sec"><button type="button" className="drop" style={{ width: '100%' }} onClick={onCreate}><Ic n="upload" s={22} /><b style={{ color: 'var(--t1)' }}>Upload files</b>JPG, PNG, WebP, MP4, WebM, MOV</button></div>
    </aside>
    {detail && <Modal size="sm" title={str(detail.name)} sub={`${cap(detail.kind)} · /${str(detail.folder || 'root').toLowerCase()}`} onClose={() => setDetail(null)} foot={<>{onDelete && <button type="button" className="btn btn-g" style={{ marginRight: 'auto', color: 'var(--bad)' }} onClick={() => { setDetail(null); onDelete(detail); }}><Ic n="trash" s={15} />Delete</button>}<button type="button" className="btn btn-g" onClick={() => setDetail(null)}>Close</button>{onEdit && <button type="button" className="btn btn-p" onClick={() => { setDetail(null); onEdit(detail); }}><Ic n="edit" s={15} />Edit</button>}</>}>
      <AssetPreview id={Number(detail.asset_id)} kind={str(detail.kind)} name={str(detail.name)} url={media(detail.url)} />
      <dl className="dl" style={{ padding: 0 }}><dt>Uploaded</dt><dd>{fmtDate(detail.created_at)}</dd><dt>Reference</dt><dd className="mono" style={{ fontSize: 11.5 }}>{str(detail.url) || '—'}</dd></dl>
    </Modal>}
  </div>;
}

function Licensing({ rows, content, onEdit, onDelete }: { rows: ManagedRow[]; content: ManagedRow[]; onEdit?: (r: ManagedRow) => void; onDelete?: (r: ManagedRow) => void }) {
  const today = manilaDate();
  const t = useMemo(() => {
    const now = new Date(today + 'T00:00:00');
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1), end = new Date(now.getFullYear(), now.getMonth() + 7, 1);
    const span = end.getTime() - start.getTime();
    const pct = (d: Date) => Math.min(100, Math.max(0, (d.getTime() - start.getTime()) / span * 100));
    const months = Array.from({ length: 12 }, (_, k) => new Date(start.getFullYear(), start.getMonth() + k, 1));
    return { now, start, end, pct, months };
  }, [today]);
  const days = (r: ManagedRow) => (new Date(str(r.expiration_date) + 'T00:00:00').getTime() - t.now.getTime()) / 864e5;
  const expired = rows.filter(r => licenseStatus(r.expiration_date, today) !== 'Active');
  const soon = rows.filter(r => days(r) >= 0 && days(r) <= 30);
  const sorted = [...rows].sort((a, b) => str(a.expiration_date).localeCompare(str(b.expiration_date)));
  const label = `${t.months[0].toLocaleString('en-US', { month: 'short', year: 'numeric' })} – ${t.months[11].toLocaleString('en-US', { month: 'short', year: 'numeric' })}`;
  return <>
    <div className="kpis cards3"><div className="kpi"><div className="kpi-l">Active licenses</div><div className="kpi-v"><strong className="num">{rows.length - expired.length}</strong></div></div><div className="kpi"><div className="kpi-l">Expiring ≤ 30 days</div><div className="kpi-v"><strong className="num" style={soon.length ? { color: 'var(--warn)' } : undefined}>{soon.length}</strong></div></div><div className="kpi"><div className="kpi-l">Expired</div><div className="kpi-v"><strong className="num" style={expired.length ? { color: 'var(--bad)' } : undefined}>{expired.length}</strong></div></div></div>
    <section className="sec"><div className="sec-head"><h3>License timeline<span className="sub">{label}</span></h3><div className="legend"><span><i style={{ background: 'var(--accent)' }} />Active</span><span><i style={{ background: 'var(--warn)' }} />Expiring soon</span><span><i style={{ background: '#fff', width: 3, height: 10 }} />Today</span></div></div>
      <div className="tl-head"><span>Licensor</span><span className="tl-months">{t.months.map((m, k) => <span key={k}>{m.toLocaleString('en-US', { month: 'short' })}</span>)}</span><span style={{ textAlign: 'right' }}>Ends</span></div>
      {sorted.map(l => { const end = new Date(str(l.expiration_date) + 'T00:00:00'); const created = l.created_at ? new Date(str(l.created_at)) : t.start; const gone = days(l) < 0, near = !gone && days(l) <= 30; const n = content.filter(c => str(c.license_id) === str(l.license_id)).length; const left = t.pct(created < t.start ? t.start : created); const right = t.pct(end);
        return <div key={str(l.license_id)} className="tl-row">
          <span style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}><span className="av" style={{ background: 'var(--s3)', color: 'var(--violet)' }}><Ic n="shield" s={15} /></span><span style={{ minWidth: 0 }}><b style={{ fontWeight: 600 }}>{str(l.licensor_name)}</b><small style={{ display: 'block', color: 'var(--t3)', fontSize: 11.5 }}>{str(l.region) || 'All regions'} · {n} title{n === 1 ? '' : 's'}</small></span></span>
          <div className="tl-track" aria-hidden="true">{right > left && <span className={`tl-bar ${near ? 'soon' : gone ? 'gone' : ''}`} style={{ left: `${left}%`, width: `${right - left}%` }} />}<span className="tl-now" style={{ left: `${t.pct(t.now)}%` }} /></div>
          <span style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>{gone ? <B tone="bad">Expired</B> : near ? <B tone="warn">{end.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</B> : <span className="mono" style={{ fontSize: 12 }}>{end.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>}{onEdit && <button type="button" className="icon-act" aria-label={`Edit ${str(l.licensor_name)}`} onClick={() => onEdit(l)}><Ic n="edit" s={14} /></button>}{onDelete && !n && <button type="button" className="icon-act danger" aria-label={`Delete ${str(l.licensor_name)}`} onClick={() => onDelete(l)}><Ic n="trash" s={14} /></button>}</span>
        </div>; })}
      {!rows.length && <Empty icon="shield" title="No licenses yet" text="Add a license to track content rights." />}
    </section>
  </>;
}
