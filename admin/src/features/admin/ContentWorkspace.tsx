import { useEffect, useMemo, useState } from 'react';
import type { ManagementData, ManagedRow } from './ManagementWorkspace';
import { licenseStatus } from './licenseAccess';
import { Ic } from './proto-icons';
import { B, Chips, Empty, Poster, Search, Seg, Switch, fmtDate, str, usePaged } from './proto-ui';

/* Catalog / Movies / TV Series in the prototype layout: toolbar, filter chips, poster grid or table, inspector. */
type Row = Record<string, unknown>;
type Props = { content: Row[]; licenses: Row[]; genres: Row[]; management: ManagementData; page: string; query: string; onQuery: (q: string) => void; onPage: (p: string, q?: string) => void; onEdit: (r: Row) => void; onArchive: (r: Row) => void; onToggle: (r: Row) => Promise<void>; onPreview: (r: Row) => void; preset?: string; media: (u: unknown) => string };
type Filter = 'all' | 'live' | 'hidden' | 'noart' | 'expired';
const isSeries = (r: Row) => /series|show/i.test(str(r.type));

export default function ContentWorkspace({ content, licenses, management, page, query, onQuery, onPage, onEdit, onArchive, onToggle, onPreview, preset, media }: Props) {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [sort, setSort] = useState('added');
  const [cf, setCf] = useState<Filter>(() => (['hidden', 'noart', 'live', 'expired'].includes(preset ?? '') ? preset as Filter : 'all'));
  const [sel, setSel] = useState<string>('');
  const [busy, setBusy] = useState('');
  useEffect(() => { if (preset && ['hidden', 'noart', 'live', 'expired'].includes(preset)) setCf(preset as Filter); }, [preset]);
  const licExp = useMemo(() => new Map(licenses.map(l => [str(l.license_id), l.expiration_date])), [licenses]);
  const views = useMemo(() => new Map(((management.viewStats || []) as ManagedRow[]).map(v => [str(v.content_id), Number(v.views) || 0])), [management]);
  const expired = (r: Row) => licenseStatus(licExp.get(str(r.license_id))) !== 'Active';
  const base = content.filter(r => !r.deleted_at && (page === 'Movies' ? !isSeries(r) : page === 'TV Series' ? isSeries(r) : true));
  const counts = { all: base.length, live: base.filter(r => r.is_active !== false).length, hidden: base.filter(r => r.is_active === false).length, noart: base.filter(r => !r.poster_url).length, expired: base.filter(expired).length };
  const all = useMemo(() => {
    let r = base;
    if (cf === 'live') r = r.filter(x => x.is_active !== false); if (cf === 'hidden') r = r.filter(x => x.is_active === false);
    if (cf === 'noart') r = r.filter(x => !x.poster_url); if (cf === 'expired') r = r.filter(expired);
    const q = query.trim().toLowerCase(); if (q) r = r.filter(x => `${str(x.title)} ${str(x.genre_name)} ${str(x.licensor_name)}`.toLowerCase().includes(q));
    return [...r].sort((a, b) => sort === 'title' ? str(a.title).localeCompare(str(b.title)) : sort === 'views' ? (views.get(str(b.content_id)) || 0) - (views.get(str(a.content_id)) || 0) : str(b.created_at).localeCompare(str(a.created_at)));
  }, [base, cf, query, sort, views]); // eslint-disable-line react-hooks/exhaustive-deps
  const P = usePaged(all, view === 'grid' ? 10 : 8, `${cf}|${query}|${sort}|${page}`);
  const cur = all.find(r => str(r.content_id) === sel) || P.rows[0];
  async function toggle(r: Row) { setBusy(str(r.content_id)); try { await onToggle(r); } catch { /* toast shown by AdminApp */ } finally { setBusy(''); } }
  const status = (r: Row) => r.is_active === false ? <B tone="warn">Hidden</B> : <B tone="ok">Live</B>;
  const acts = (r: Row) => <><button type="button" className="icon-act" aria-label={`Edit ${str(r.title)}`} onClick={() => onEdit(r)}><Ic n="edit" s={15} /></button><button type="button" className="icon-act" aria-label={`Preview ${str(r.title)}`} onClick={() => onPreview(r)}><Ic n="eye" s={15} /></button><button type="button" className="icon-act danger" aria-label={`Archive ${str(r.title)}`} onClick={() => onArchive(r)}><Ic n="archive" s={15} /></button></>;
  const seasons = ((management.seasons || []) as ManagedRow[]); const episodes = ((management.episodes || []) as ManagedRow[]);

  return <div className="split">
    <section className="sec">
      <div className="toolbar">
        <Search value={query} onChange={onQuery} label="Search titles, genres, licensors…" id="csearch" />
        <select aria-label="Sort by" value={sort} onChange={e => setSort(e.target.value)}><option value="added">Newest first</option><option value="title">Title A–Z</option><option value="views">Most watched</option></select>
        <Seg role="group" label="View" value={view} onChange={setView} options={[['grid', <Ic key="g" n="grid" s={15} />], ['table', <Ic key="t" n="rows" s={15} />]]} />
      </div>
      <div className="toolbar" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Chips label="Filter" value={cf} onChange={setCf} options={[['all', 'All', counts.all], ['live', 'Live', counts.live], ['hidden', 'Hidden', counts.hidden], ['noart', 'Missing artwork', counts.noart], ['expired', 'License issue', counts.expired]]} />
      </div>
      {!all.length ? <Empty icon="search" title="No titles match" text="Try another filter or search term." />
        : view === 'grid' ? <div className="pgrid">{P.rows.map(r => <div key={str(r.content_id)} className={`pcard ${cur === r ? 'on' : ''}`}>
          <button type="button" style={{ display: 'block', width: '100%' }} aria-label={`Select ${str(r.title)}`} onClick={() => setSel(str(r.content_id))}><Poster src={r.poster_url ? media(r.poster_url) : undefined} /></button>
          <div className="ov"><div className="ov-top">{status(r)}</div><div className="ov-acts">{acts(r)}</div></div>
          <div className="pcard-meta"><span style={{ minWidth: 0 }}><b>{str(r.title)}</b><small>{str(r.genre_name) || '—'} · {str(r.release_date).slice(0, 4)}</small></span></div>
        </div>)}</div>
          : <div className="tw"><table className="cards-m"><thead><tr><th>Title</th><th>Type</th><th>Genre</th><th>Status</th><th>Visible</th><th>Added</th><th /></tr></thead><tbody>{P.rows.map(r => <tr key={str(r.content_id)} className={cur === r ? 'sel' : ''}>
            <td className="main"><button type="button" className="cell-main" onClick={() => setSel(str(r.content_id))}><Poster src={r.poster_url ? media(r.poster_url) : undefined} /><span>{str(r.title)}<small>{str(r.licensor_name) || 'No license'}</small></span></button></td>
            <td data-label="Type">{isSeries(r) ? 'TV Series' : 'Movie'}</td><td data-label="Genre">{str(r.genre_name) || '—'}</td><td data-label="Status">{status(r)}</td>
            <td data-label="Visible"><Switch on={r.is_active !== false} disabled={busy === str(r.content_id)} label={`Visible to users: ${str(r.title)}`} onClick={() => void toggle(r)} /></td>
            <td data-label="Added">{fmtDate(r.created_at)}</td><td className="acts"><div className="row-acts">{acts(r)}</div></td>
          </tr>)}</tbody></table></div>}
      {P.pager}
    </section>
    {cur && <aside className="sec inspector" aria-label="Title details">
      <div className="ins-hero"><Poster src={cur.poster_url ? media(cur.poster_url) : undefined} /><div style={{ minWidth: 0, display: 'grid', gap: 8, alignContent: 'start' }}><h3>{str(cur.title)}</h3><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{status(cur)}{!cur.poster_url && <B tone="warn">No poster</B>}{expired(cur) && <B tone="bad">{licenseStatus(licExp.get(str(cur.license_id)))}</B>}</div></div></div>
      <dl className="dl"><dt>Type</dt><dd>{isSeries(cur) ? 'TV Series' : 'Movie'}</dd><dt>Genre</dt><dd>{str(cur.genre_name) || '—'}</dd><dt>Age rating</dt><dd>{str(cur.age_rating) || '—'}</dd><dt>License</dt><dd>{str(cur.licensor_name) || '—'}</dd></dl>
      {isSeries(cur) && <div className="ins-sec"><h4>Seasons</h4>{seasons.filter(s => str(s.content_id) === str(cur.content_id)).sort((a, b) => Number(a.season_number) - Number(b.season_number)).map(s => <button type="button" key={str(s.season_id)} className="list-item" style={{ padding: '8px 0', border: 0 }} onClick={() => onPage('Seasons', str(cur.title))}><span className="tt"><b>Season {str(s.season_number)}{s.season_title ? ` · ${str(s.season_title)}` : ''}</b><small>{episodes.filter(e => str(e.season_id) === str(s.season_id)).length} episodes · {fmtDate(s.release_date)}</small></span><Ic n="right" s={14} /></button>)}{!seasons.some(s => str(s.content_id) === str(cur.content_id)) && <small style={{ color: 'var(--t3)' }}>No seasons yet.</small>}</div>}
      <div className="ins-sec" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><b style={{ fontSize: 13 }}>Visible to users</b><Switch on={cur.is_active !== false} disabled={busy === str(cur.content_id)} label="Visible to users" onClick={() => void toggle(cur)} /></div>
      <div className="ins-acts"><button type="button" className="btn btn-g" onClick={() => onPreview(cur)}><Ic n="eye" s={15} />Preview</button><button type="button" className="btn btn-g" onClick={() => onEdit(cur)}><Ic n="edit" s={15} />Edit</button><button type="button" className="btn btn-g" style={{ gridColumn: '1/-1', color: 'var(--bad)' }} onClick={() => onArchive(cur)}><Ic n="archive" s={15} />Archive title</button></div>
    </aside>}
  </div>;
}
