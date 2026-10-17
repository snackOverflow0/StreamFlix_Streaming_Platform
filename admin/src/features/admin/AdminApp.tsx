import { subscribeChanges } from '@/services/change-events';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { API_URL, apiRequest } from '@/services/api-client';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import ResourceCards from './ResourceCards';
import ContentWorkspace from './ContentWorkspace';
import { previewData } from './design-preview';
import ManagementWorkspace, { managementSpecs, type ManagementData, type ManagedRow } from './ManagementWorkspace';
import { managementPreview } from './management-preview';
import Dashboard from './Dashboard';
import DesignSystem from './DesignSystem';
import AnalyticsPage from './AnalyticsPage';
import AdminLogin from './AdminLogin';
import MediaUpload from './MediaUpload';
import UsersWorkspace from './UsersWorkspace';
import CommunityWorkspace from './CommunityWorkspace';
import DeliveryWorkspace from './DeliveryWorkspace';
import SettingsPage from './SettingsPage';
import TitlePreview from './TitlePreview';
import { Ic } from './proto-icons';
import { ConfirmHost, Field, Modal, Poster, askConfirm, download, str } from './proto-ui';
import './admin-proto.css';

type Row = Record<string, string | number | boolean | null>;
export type Data = { content: Row[]; genres: Row[]; licenses: Row[]; users: Row[]; assets: Row[]; subscriptions?: Row[]; plans?: Row[]; settings: Record<string, string | boolean> };
type Resource = 'content' | 'genres' | 'licenses' | 'users' | 'assets';

/* Navigation exactly as the prototype: six groups, prototype icons; the Users page is labelled "Subscribers". */
const NAV: { g: string; items: [string, string][] }[] = [
  { g: 'Workspace', items: [['Dashboard', 'home'], ['Analytics', 'chart']] },
  { g: 'Catalog', items: [['Catalog', 'lib'], ['Movies', 'film'], ['TV Series', 'tv'], ['Seasons', 'layers'], ['Episodes', 'list'], ['Media Assets', 'image'], ['Archived Content', 'archive']] },
  { g: 'Audience', items: [['Users', 'users'], ['Subscriptions', 'card'], ['Subscription Plans', 'crown']] },
  { g: 'Community', items: [['Feedback', 'msg'], ['Reviews', 'star']] },
  { g: 'Commerce', items: [['Merchandise', 'bag'], ['Orders', 'receipt'], ['Email Delivery', 'mail']] },
  { g: 'Administration', items: [['Settings', 'settings'], ['Genres', 'tag'], ['Licensing', 'shield'], ['Design System', 'grid']] },
];
const label = (p: string) => p === 'Users' ? 'Subscribers' : p;
const groupOf = (p: string) => NAV.find(n => n.items.some(([x]) => x === p))?.g ?? 'Workspace';
/* Contextual primary action shown in the top bar, per page (prototype CTX table). */
const CTX: Record<string, [string, string]> = { Dashboard: ['Add content', 'plus'], Catalog: ['Add content', 'plus'], Movies: ['Add movie', 'plus'], 'TV Series': ['Add series', 'plus'], Seasons: ['Add season', 'plus'], Episodes: ['Add episode', 'plus'], 'Media Assets': ['Upload', 'upload'], Subscriptions: ['Assign plan', 'plus'], 'Subscription Plans': ['New plan', 'plus'], Users: ['Export', 'download'], Orders: ['Export', 'download'], Merchandise: ['Add product', 'plus'], Genres: ['Add genre', 'plus'], Licensing: ['Add license', 'plus'], Analytics: ['Export report', 'download'] };

const keys = { content: 'content_id', genres: 'genre_id', licenses: 'license_id', users: 'user_id', assets: 'asset_id' } as const;
const titles: Record<Resource, string> = { content: 'content', genres: 'genre', licenses: 'license', users: 'account', assets: 'media' };
function media(url: unknown) { const value = String(url || ''); return /^\/(admin-design|streamflix)\//.test(value) ? value : value.startsWith('/') ? API_URL.replace(/\/api$/, '') + value : value; }

function Skeleton() {
  return <div style={{ display: 'grid', gap: 20 }} role="status" aria-label="Loading admin data"><div className="grid"><div className="sk c8" style={{ height: 300 }} /><div className="sk c4" style={{ height: 300 }} /><div className="sk c12" style={{ height: 200 }} /></div></div>;
}

export default function AdminApp() {
  const preview = false;
  const [genreOpen, setGenreOpen] = useState<Row | null>(null); const [uploadBusy, setUploadBusy] = useState(0);
  const [navOpen, setNavOpen] = useState(false); const [collapsed, setCollapsed] = useState(false);
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [management, setManagement] = useState<ManagementData>({});
  const [pop, setPop] = useState<'' | 'notes' | 'me'>('');
  const [page, setPage] = useState('Dashboard'); const [data, setData] = useState<Data | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Row | null>(null); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState('');
  const [createSignal, setCreateSignal] = useState(0); const [logoutAsk, setLogoutAsk] = useState(false);
  const [preset, setPreset] = useState(''); const [previewRow, setPreviewRow] = useState<Row | null>(null);
  const gsearch = useRef<HTMLInputElement>(null);

  async function load(background = false) { if (preview) { setData(structuredClone(previewData) as unknown as Data); setManagement(managementPreview(previewData as unknown as ManagementData)); setError(''); setLoading(false); return; } if (!background) setLoading(true); setError(''); try { const [base, extra] = await Promise.all([apiRequest<Data>('/admin/bootstrap'), apiRequest<ManagementData>('/admin/management')]); setData(base); setManagement(extra); } catch (e) { if (!background) setData(null); setError((e as Error).message); } finally { if (!background) setLoading(false); } }
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (!data || preview) return; let busy = false, queued = false; let debounce: number | undefined; const reload = async () => { if (document.hidden) return; if (busy) { queued = true; return; } busy = true; try { await load(true); } finally { busy = false; if (queued) { queued = false; window.setTimeout(() => void reload(), 0); } } }; const unsubscribe = subscribeChanges(() => { window.clearTimeout(debounce); debounce = window.setTimeout(() => void reload(), 500); }); const timer = window.setInterval(() => void reload(), 60000); window.addEventListener('focus', reload); return () => { unsubscribe(); window.clearTimeout(debounce); window.clearInterval(timer); window.removeEventListener('focus', reload); }; }, [Boolean(data)]);
  useEffect(() => { if (!notice) return; toast.success(notice); setNotice(''); }, [notice]);
  useEffect(() => { if (!error || editing) return; toast.error(error); setError(''); }, [error, editing]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { if (genreOpen) { setGenreOpen(null); return; } if (pop) { setPop(''); return; } if (navOpen) setNavOpen(false); return; }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement | null)?.tagName ?? '')) { e.preventDefault(); gsearch.current?.focus(); }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [genreOpen, pop, navOpen]);
  useEffect(() => { if (!pop) return; const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.pop,[data-pop]')) setPop(''); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, [pop]);

  function go(next: string, q = '', p = '') { setNavOpen(false); setPop(''); setPage(next); setQuery(q); setPreset(p); window.scrollTo({ top: 0 }); }
  const resource: Resource = page === 'Genres' ? 'genres' : page === 'Licensing' ? 'licenses' : page === 'Users' ? 'users' : page === 'Media Assets' ? 'assets' : 'content';

  async function save(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setSaving(true); setError(''); const values = Object.fromEntries(new FormData(e.currentTarget)); const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' && ['director', 'cast', 'trailer_url', 'poster_url', 'preview_url', 'hero_url', 'video_url', 'duration_label', 'phone_number'].includes(k) ? null : v]).filter(([, v]) => v !== '')); if (resource === 'content') payload.is_kids_suitable = values.is_kids_suitable === 'on'; try { const id = editing?.[keys[resource]]; if (preview) { const list = data?.[resource] || []; const row = { ...editing, ...payload, [keys[resource]]: id || Math.max(0, ...list.map(r => Number(r[keys[resource]]))) + 1, created_at: editing?.created_at || new Date().toISOString() } as Row; setData(old => old ? { ...old, [resource]: id ? old[resource].map(r => r[keys[resource]] === id ? row : r) : [row, ...old[resource]] } : old); setEditing(null); setNotice('Preview updated. Changes reset on refresh.'); return; } await apiRequest(`/admin/${resource}${id ? '/' + id : ''}`, { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); setEditing(null); setNotice('Changes saved'); await load(); } catch (e) { setError((e as Error).message); } finally { setSaving(false); } }
  async function toggleContent(row: Row) {
    const active = row.is_active === false;
    try {
      if (!preview) await apiRequest(`/admin/content/${row.content_id}/visibility`, { method: 'PATCH', body: JSON.stringify({ is_active: active }) });
      setData(old => old ? { ...old, content: old.content.map(item => item.content_id === row.content_id ? { ...item, is_active: active } : item) } : old);
      setNotice(`${row.title} is now ${active ? 'visible to users' : 'hidden from users'}`);
    } catch (e) { setError((e as Error).message); throw e; }
  }
  async function remove(row: Row, res: Resource = resource) {
    const name = str(row.title || row.genre_name || row.name || row.licensor_name);
    const archive = res === 'content';
    const ok = await askConfirm(archive ? { title: `Archive “${name}”?`, body: 'It will be hidden from users and moved to Archived Content. You can restore it at any time.', label: 'Archive', icon: 'archive' } : { title: `Delete this ${titles[res]}?`, body: 'This can’t be undone.', label: 'Delete', icon: 'trash' });
    if (!ok) return;
    try { await apiRequest(`/admin/${res}/${row[keys[res]]}`, { method: 'DELETE' }); setNotice(archive ? `${name} archived` : 'Deleted'); await load(); if (archive) { setEditing(null); setPreviewRow(null); go('Archived Content'); } } catch (e) { setError((e as Error).message); }
  }
  async function manageRecord(resourceName: string, method: string, row: ManagedRow, payload?: ManagedRow) {
    const id = managementSpecs[page]?.id ?? 'content_id';
    await apiRequest(method === 'RESTORE' ? `/admin/content/${row.content_id}/restore` : `/admin/${resourceName}${method === 'POST' ? '' : '/' + row[id]}`, { method: method === 'RESTORE' ? 'PATCH' : method, ...(payload ? { body: JSON.stringify(payload) } : {}) }); await load(); setNotice(method === 'RESTORE' ? 'Title restored' : method === 'DELETE' ? 'Deleted' : 'Changes saved');
  }
  function ctxAction() {
    if (page === 'Users') return download(data?.users ?? [], 'streamflix-subscribers.json');
    if (page === 'Orders') return download(management.orders ?? [], 'streamflix-orders.json');
    if (page === 'Analytics') return download({ ...data, ...management }, 'streamflix-report.json');
    if (managementSpecs[page]) return setCreateSignal(n => n + 1);
    setEditing(page === 'Movies' ? { type: 'movie' } : page === 'TV Series' ? { type: 'series' } : {});
  }

  /* Counts for sidebar pills and the bell menu, from live rows only. */
  const counts = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10), in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const fb = (management.feedback || []).filter(r => str(r.status) === 'pending');
    const orders = (management.orders || []).filter(r => str(r.order_status) === 'pending');
    const lic = (data?.licenses || []).filter(l => str(l.expiration_date) && str(l.expiration_date) <= in30);
    const expired = lic.filter(l => str(l.expiration_date) < today);
    const low = (management.reviews || []).filter(r => Number(r.rating_value) <= 2);
    return { fb, orders, lic, expired, low };
  }, [management, data]);
  const pill: Record<string, number> = { Feedback: counts.fb.length, Orders: counts.orders.length };

  const loginDesignPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('login') === '1';
  if ((!loading && !data) || loginDesignPreview) return <AdminLogin error={loginDesignPreview ? '' : error} demo={loginDesignPreview} onPassword={async (email, password) => { if (loginDesignPreview) throw new Error('Design preview only. Use localhost /admin to sign in.'); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; await load(); }} onGoogle={async () => { if (loginDesignPreview) throw new Error('Design preview only. Use localhost /admin to sign in.'); const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin', queryParams: { prompt: 'select_account' } } }); if (error) throw error; }} onSwitch={async () => { if (loginDesignPreview) return; await supabase.auth.signOut(); setError(''); }} />;

  const g = groupOf(page); const first = NAV.find(n => n.g === g)!.items[0][0]; const ctx = CTX[page];
  const mediaFn = (url: unknown) => preview ? String(url || '') : media(url);
  const managed = { ...data, ...management, subscriptions: data?.subscriptions || [], plans: data?.plans || management.plans || [], content: data?.content || [], users: data?.users || [] } as unknown as ManagementData;
  const rows = (data?.[resource] || []).filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));

  const body = !data ? null
    : page === 'Dashboard' ? <Dashboard content={data.content} licenses={data.licenses} management={management} subscriptions={data.subscriptions || []} users={data.users} plans={data.plans || []} onPage={go} onPreview={r => setPreviewRow(r as Row)} media={mediaFn} />
    : page === 'Design System' ? <DesignSystem onPage={go} />
    : page === 'Email Delivery' ? <DeliveryWorkspace />
    : page === 'Settings' ? <SettingsPage values={data.settings} onSave={async values => { await apiRequest('/admin/settings', { method: 'PATCH', body: JSON.stringify(values) }); setNotice('Settings saved'); await load(); }} onError={setError} />
    : ['Reviews', 'Feedback'].includes(page) ? <CommunityWorkspace key={page} page={page} data={managed} query={query} onQuery={setQuery} onMutate={manageRecord} onPage={go} media={mediaFn} />
    : managementSpecs[page] ? <ManagementWorkspace key={page} page={page} preview={preview} data={managed} query={query} onQuery={setQuery} onMutate={manageRecord} createSignal={createSignal} preset={preset} media={mediaFn} />
    : page === 'Analytics' ? <AnalyticsPage data={managed} media={mediaFn} />
    : page === 'Users' ? <UsersWorkspace data={managed} query={query} onQuery={setQuery} onEdit={row => setEditing(row as Row)} onPage={go} />
    : ['Catalog', 'Movies', 'TV Series'].includes(page) ? <ContentWorkspace key={page} content={data.content} licenses={data.licenses} genres={data.genres} management={management} page={page} query={query} onQuery={setQuery} onPage={go} onEdit={r => setEditing(r as Row)} onArchive={r => void remove(r as Row, 'content')} onToggle={r => toggleContent(r as Row)} onPreview={r => setPreviewRow(r as Row)} preset={preset} media={mediaFn} />
    : ['Genres', 'Licensing', 'Media Assets'].includes(page) ? <ResourceCards key={page} page={page} rows={rows as unknown as ManagedRow[]} data={data as unknown as ManagementData} query={query} onQuery={setQuery} onEdit={row => setEditing(row as Row)} onDelete={row => void remove(row as Row)} onView={page === 'Genres' ? row => setGenreOpen(row as Row) : undefined} onCreate={() => setEditing({})} media={mediaFn} />
    : null;

  return <div className="sfx">
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${navOpen ? 'nav-open' : ''}`}>
      <aside className="rail" aria-label="Admin navigation">
        <div className="brand"><span className="mark"><Ic n="owl" s={22} /></span><span className="brand-text"><b>{str(data?.settings?.platformName || 'streamflix').toLowerCase()}</b><small>Operations</small></span></div>
        <nav>{NAV.map(n => {
          const cur = n.items.some(([x]) => x === page); const closed = cur ? false : opened.has(n.g) ? false : n.g !== 'Workspace';
          const cnt = n.items.reduce((a, [x]) => a + (pill[x] || 0), 0);
          return <section key={n.g} className={`ng ${closed ? 'closed' : ''}`}>
            <button type="button" className="nav-label" aria-expanded={!closed} onClick={() => { if (!cur) setOpened(s => { const next = new Set(s); if (next.has(n.g)) next.delete(n.g); else next.add(n.g); return next; }); }}><span>{n.g}</span>{closed && cnt > 0 && <b className="pill hot" style={{ marginLeft: 'auto', marginRight: 6 }}>{cnt}</b>}<Ic n="chev" s={12} /></button>
            <div className="ng-items"><div>{n.items.map(([x, i]) => <button type="button" key={x} className={`ni ${page === x ? 'on' : ''}`} data-tip={label(x)} aria-current={page === x ? 'page' : undefined} tabIndex={closed ? -1 : undefined} onClick={() => go(x)}><Ic n={i} s={18} /><span>{label(x)}</span>{pill[x] ? <b className="pill hot">{pill[x]}</b> : null}</button>)}</div></div>
          </section>;
        })}</nav>
        <div className="rail-foot">
          <button type="button" className="ni collapse-btn" data-tip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={`${collapsed ? 'Expand' : 'Collapse'} sidebar`} onClick={() => setCollapsed(v => !v)}><Ic n="collapse" s={18} /><span className="lbl">Collapse</span></button>
          <button type="button" className="ni" data-tip="Log out" onClick={() => setLogoutAsk(true)}><Ic n="logout" s={18} /><span className="lbl">Log out</span></button>
        </div>
      </aside>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <button type="button" className="ibtn menu-btn" aria-label="Open navigation" aria-expanded={navOpen} onClick={() => setNavOpen(v => !v)}><Ic n="menu" s={20} /></button>
          <div className="tb-title"><ol className="crumbs" aria-label="Breadcrumb"><li><button type="button" onClick={() => go('Dashboard')}>Admin</button></li>{g !== 'Workspace' && g !== page && <li><span className="sep">/</span>{first !== page ? <button type="button" onClick={() => go(first)}>{g}</button> : <span>{g}</span>}</li>}</ol><h1>{label(page)}</h1></div>
          <label className="gsearch"><Ic n="search" s={16} /><input ref={gsearch} maxLength={60} placeholder="Search titles…" aria-label="Search titles" onKeyDown={e => { const v = e.currentTarget.value.trim(); if (e.key === 'Enter' && v) { go('Catalog', v); e.currentTarget.value = ''; e.currentTarget.blur(); } }} /><span className="kbd">/</span></label>
          {ctx && <button type="button" className="btn btn-p btn-sm tb-ctx" onClick={ctxAction}><Ic n={ctx[1]} s={15} />{ctx[0]}</button>}
          <button type="button" className="ibtn" data-pop aria-label="Notifications" aria-expanded={pop === 'notes'} onClick={() => setPop(p => p === 'notes' ? '' : 'notes')}><Ic n="bell" s={19} />{(counts.fb.length + counts.orders.length + counts.lic.length) > 0 && <span className="dot" />}</button>
          <button type="button" className="me" data-pop aria-label="Account menu" aria-expanded={pop === 'me'} onClick={() => setPop(p => p === 'me' ? '' : 'me')}><span className="av" style={{ background: 'hsl(265 24% 26%)' }}>AD</span><span className="me-t">Admin<small>Administrator</small></span></button>
          {pop === 'notes' && <div className="pop"><h3>Notifications</h3>
            {counts.lic.length > 0 && <button type="button" className="pop-row" onClick={() => go('Licensing')}><span className="ic-chip"><Ic n="shield" s={15} /></span><span>{counts.lic.length - counts.expired.length} license{counts.lic.length - counts.expired.length === 1 ? '' : 's'} expire within 30 days{counts.expired.length ? ` · ${counts.expired.length} expired` : ''}<small>{counts.lic.slice(0, 3).map(l => str(l.licensor_name)).join(', ')}</small></span></button>}
            {counts.fb.length > 0 && <button type="button" className="pop-row" onClick={() => go('Feedback')}><span className="ic-chip"><Ic n="msg" s={15} /></span><span>{counts.fb.length} new feedback message{counts.fb.length === 1 ? '' : 's'}<small>{counts.fb.slice(0, 3).map(f => str(f.full_name || f.email || f.subject)).join(', ')}</small></span></button>}
            {counts.orders.length > 0 && <button type="button" className="pop-row" onClick={() => go('Orders')}><span className="ic-chip"><Ic n="receipt" s={15} /></span><span>{counts.orders.length} order{counts.orders.length === 1 ? '' : 's'} waiting to be processed<small>{counts.orders.slice(0, 3).map(o => `SF-${str(o.transaction_id)}`).join(', ')}</small></span></button>}
            {counts.low.length > 0 && <button type="button" className="pop-row" onClick={() => go('Reviews')}><span className="ic-chip"><Ic n="flag" s={15} /></span><span>{counts.low.length} low-rated review{counts.low.length === 1 ? '' : 's'}<small>1–2 stars</small></span></button>}
            {!(counts.lic.length + counts.fb.length + counts.orders.length + counts.low.length) && <div className="pop-row" style={{ cursor: 'default' }}><span className="ic-chip"><Ic n="ok" s={15} /></span><span>You’re all caught up<small>Nothing needs action right now</small></span></div>}
          </div>}
          {pop === 'me' && <div className="pop" style={{ width: 240 }}>
            <button type="button" className="pop-row" onClick={() => { setPop(''); void load(true).then(() => setNotice('Data refreshed')); }}><span className="ic-chip"><Ic n="refresh" s={15} /></span><span>Refresh data</span></button>
            <button type="button" className="pop-row" onClick={() => go('Settings')}><span className="ic-chip"><Ic n="settings" s={15} /></span><span>Platform settings</span></button>
            <button type="button" className="pop-row" onClick={() => { setPop(''); setLogoutAsk(true); }}><span className="ic-chip"><Ic n="logout" s={15} /></span><span>Log out</span></button>
          </div>}
        </header>
        <main className="content" id="main"><div className="view" key={page}>{loading ? <Skeleton /> : body}</div></main>
      </div>
      <nav className="bbar" aria-label="Quick navigation">{([['Dashboard', 'home', 'Home'], ['Catalog', 'lib', 'Catalog'], ['Users', 'users', 'People'], ['Orders', 'receipt', 'Orders']] as const).map(([p, i, l]) => <button type="button" key={p} className={page === p ? 'on' : ''} onClick={() => go(p)}><Ic n={i} s={20} />{l}</button>)}<button type="button" aria-label="More pages" onClick={() => setNavOpen(true)}><Ic n="menu" s={20} />More</button></nav>

      {editing && <Editor resource={resource} row={editing} data={data!} saving={saving} uploadBusy={uploadBusy} error={error} preview={preview} media={mediaFn} onBusy={b => setUploadBusy(n => Math.max(0, n + (b ? 1 : -1)))} onPatch={patch => setEditing(old => old ? { ...old, ...patch } : old)} onClose={() => { if (!saving && !uploadBusy) { setEditing(null); setError(''); } }} onSubmit={save} />}
      {genreOpen && <Modal size="sm" title={`${str(genreOpen.genre_name)} · Titles`} onClose={() => setGenreOpen(null)} foot={<button type="button" className="btn btn-g" onClick={() => setGenreOpen(null)}>Close</button>}>
        {data?.content.filter(c => String(c.genre_id) === String(genreOpen.genre_id)).map(c => <button type="button" key={String(c.content_id)} className="list-item" onClick={() => { setGenreOpen(null); go(String(c.type).toLowerCase() === 'movie' ? 'Movies' : 'TV Series', String(c.title)); }}><Poster src={c.poster_url ? mediaFn(c.poster_url) : undefined} /><span className="tt"><b>{c.title}</b><small>{String(c.type).toLowerCase() === 'movie' ? 'Movie' : 'TV Series'} · {String(c.release_date || '').slice(0, 4)}</small></span><Ic n="right" s={14} /></button>)}
        {!data?.content.some(c => String(c.genre_id) === String(genreOpen.genre_id)) && <p style={{ color: 'var(--t3)' }}>No titles in this genre yet.</p>}
      </Modal>}
      {logoutAsk && <Modal size="sm" title="Log out?" onClose={() => setLogoutAsk(false)} foot={<><button type="button" className="btn btn-g" onClick={() => setLogoutAsk(false)}>Stay</button><button type="button" className="btn btn-p" onClick={async () => { setLogoutAsk(false); await supabase.auth.signOut(); setData(null); }}><Ic n="logout" s={15} />Log out</button></>}><p style={{ color: 'var(--t2)' }}>You’ll need to sign in again with your admin account.</p></Modal>}
      {previewRow && <TitlePreview row={previewRow} media={mediaFn} onClose={() => setPreviewRow(null)} onEdit={r => { setPreviewRow(null); setEditing(r as Row); }} />}
      <ConfirmHost />
    </div>
    <Toaster theme="dark" closeButton position="bottom-right" toastOptions={{ className: 'sfx-toast' }} />
  </div>;
}

/* Add / edit dialog for content, genres, licenses, accounts and media assets (prototype modal layouts). */
const MEDIA_FIELDS = ['trailer_url', 'poster_url', 'preview_url', 'hero_url', 'url'];
function Editor({ resource, row, data, saving, uploadBusy, error, preview, media, onBusy, onPatch, onClose, onSubmit }: { resource: Resource; row: Row; data: Data; saving: boolean; uploadBusy: number; error: string; preview: boolean; media: (u: unknown) => string; onBusy: (b: boolean) => void; onPatch: (p: Row) => void; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const id = row[keys[resource]];
  const v = (f: string) => String(row[f] ?? '');
  const upload = (f: string, accept: string) => <MediaUpload key={String(id || 'new') + f} name={f} value={v(f)} accept={accept} preview={preview} onBusy={onBusy}
    onUploaded={resource === 'assets' && !row.asset_id ? async (url, asset) => { if (asset) onPatch({ asset_id: asset.asset_id, name: row.name || asset.name, kind: asset.kind, url } as Row); } : id ? async url => { await apiRequest(`/admin/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify({ [f]: url }) }); onPatch({ [f]: url }); } : undefined} />;
  const busy = saving || uploadBusy > 0;
  const foot = <><span className="left">{uploadBusy ? 'Uploading…' : 'Saves to Supabase'}</span><button type="button" className="btn btn-g" disabled={busy} onClick={onClose}>Cancel</button><button className="btn btn-p" disabled={busy}>{uploadBusy ? 'Uploading…' : saving ? 'Saving…' : 'Save changes'}</button></>;
  const err = error ? <p className="form-err" role="alert">{error}</p> : null;

  if (resource === 'content') {
    const ratings = Array.from(new Set(['G', 'PG', 'PG-13', 'R-16', 'R-18', ...data.content.map(c => String(c.age_rating || '')).filter(Boolean)]));
    return <Modal title={id ? 'Edit content' : 'Add content'} sub={id ? v('title') : 'New titles stay hidden until you turn on “Visible to users”.'} onClose={onClose} busy={busy} onSubmit={onSubmit} foot={foot}>
      <div className="m-cols">
        <div className="m-side"><Poster src={v('poster_url') ? media(v('poster_url')) : undefined} /><div style={{ display: 'grid', gap: 8 }}><span className="fs-t">Poster</span>{upload('poster_url', 'image/jpeg,image/png,image/webp')}<span className="fs-t">Trailer</span>{upload('trailer_url', 'video/mp4,video/webm,video/quicktime')}</div></div>
        <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
          <div className="fs"><div className="fs-t">Basics</div><div className="fgrid">
            <Field label="Title" full><input name="title" required defaultValue={v('title')} placeholder="e.g. Midnight Harbor" /></Field>
            <Field label="Type"><select name="type" defaultValue={v('type') || 'movie'}>{Array.from(new Set(['movie', 'series', ...data.content.map(r => String(r.type))])).map(t => <option key={t} value={t}>{t === 'movie' ? 'Movie' : t === 'series' ? 'Series' : t}</option>)}</select></Field>
            <Field label="Genre"><select name="genre_id" defaultValue={v('genre_id')} required><option value="">Select genre</option>{data.genres.map(r => <option key={String(r.genre_id)} value={String(r.genre_id)}>{r.genre_name}</option>)}</select></Field>
            <Field label="Release date"><input name="release_date" type="date" defaultValue={v('release_date').slice(0, 10)} required /></Field>
            <Field label="Age rating"><select name="age_rating" defaultValue={v('age_rating') || 'PG-13'} required>{ratings.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Duration label"><input name="duration_label" defaultValue={v('duration_label')} placeholder="e.g. 1h 52m" /></Field>
            <label className="f" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'end', minHeight: 40 }}><input type="checkbox" className="chk" name="is_kids_suitable" defaultChecked={row.is_kids_suitable === true} />Approved for Kids profiles</label>
          </div></div>
          <div className="fs"><div className="fs-t">Story &amp; credits</div><div className="fgrid">
            <Field label="Description" full><textarea name="description" required defaultValue={v('description')} placeholder="One line for cards and search" /></Field>
            <Field label="Synopsis" full><textarea name="synopsis" required defaultValue={v('synopsis')} placeholder="A short paragraph for the title page" /></Field>
            <Field label="Director"><input name="director" defaultValue={v('director')} /></Field>
            <Field label="Cast"><input name="cast" defaultValue={v('cast')} placeholder="Comma-separated" /></Field>
          </div></div>
          <div className="fs"><div className="fs-t">Rights &amp; artwork</div><div className="fgrid">
            <Field label="License" full><select name="license_id" defaultValue={v('license_id')} required><option value="">Select license</option>{data.licenses.map(r => <option key={String(r.license_id)} value={String(r.license_id)}>{r.licensor_name}</option>)}</select></Field>
            <Field label="Hero image" full>{upload('hero_url', 'image/jpeg,image/png,image/webp')}</Field>
            <Field label="Preview (landscape)" full>{upload('preview_url', 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime')}</Field>
          </div></div>
          {err}
        </div>
      </div>
    </Modal>;
  }
  const sm = (title: string, sub: string, children: ReactNode) => <Modal size="sm" title={title} sub={sub} onClose={onClose} busy={busy} onSubmit={onSubmit} foot={foot}>{children}{err}</Modal>;
  if (resource === 'genres') return sm(id ? 'Edit genre' : 'Genre', '', <Field label="Genre name" full><input name="genre_name" required defaultValue={v('genre_name')} placeholder="e.g. Anime" autoFocus /></Field>);
  if (resource === 'licenses') return sm(id ? 'Edit license' : 'Add license', '', <div className="fgrid"><Field label="Licensor" full><input name="licensor_name" required defaultValue={v('licensor_name')} /></Field><Field label="Region"><input name="region" required defaultValue={v('region')} placeholder="e.g. PH, SEA" /></Field><Field label="Expiration date"><input name="expiration_date" type="date" required defaultValue={v('expiration_date').slice(0, 10)} /></Field></div>);
  if (resource === 'users') return sm('Edit account', v('email'), <><div className="fgrid"><Field label="Full name" full><input name="full_name" required defaultValue={v('full_name')} /></Field><Field label="Phone number"><input name="phone_number" defaultValue={v('phone_number')} placeholder="+63" /></Field><Field label="Account status"><select name="account_status" defaultValue={v('account_status') || 'active'}>{['active', 'suspended', 'deactivated'].map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select></Field></div><p style={{ fontSize: 12, color: 'var(--t3)' }}>Suspending blocks sign-in but keeps the subscription record. Manage plan access on the Subscriptions page.</p></>);
  return sm(id ? 'Edit media' : 'Upload media', 'Files go to your Supabase media bucket.', <>{upload('url', 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime')}<div className="fgrid"><Field label="Name" full><input name="name" required defaultValue={v('name')} /></Field><Field label="Folder"><input name="folder" defaultValue={v('folder')} placeholder="e.g. posters" /></Field><Field label="Kind"><select name="kind" defaultValue={v('kind') || 'Image'}>{['Image', 'Video', 'Audio', 'Document'].map(t => <option key={t}>{t}</option>)}</select></Field></div></>);
}
