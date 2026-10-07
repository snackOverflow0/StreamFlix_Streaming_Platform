import { useState } from 'react';
import { FileText, Film, Play, Tv, Folder, ShieldCheck, Search, SlidersHorizontal, Pencil, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export type ContentRow = Record<string, string | number | boolean | null>;
type Props = {
  content: ContentRow[]; licenses: ContentRow[]; assets: ContentRow[]; page: string;
  query: string; onQuery: (value: string) => void; onPage: (value: string) => void;
  onEdit: (row: ContentRow) => void; onView: (row: ContentRow) => void;
  onToggle: (row: ContentRow) => Promise<void>; media: (url: unknown) => string;
};
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'}) : '—';
export function DesignStats({content, licenses, assets}: Pick<Props, 'content'|'licenses'|'assets'>) {
  const movies = content.filter(row => String(row.type).toLowerCase() === 'movie').length;
  const series = content.filter(row => /series|show/i.test(String(row.type))).length;
  const active = licenses.filter(row => new Date(String(row.expiration_date)) >= new Date()).length;
  const soon = licenses.filter(row => {const days = (new Date(String(row.expiration_date)).getTime() - Date.now())/86400000;return days >= 0 && days <= 30;}).length;
  const stats = [
    {label: 'Total Titles', value: content.length.toLocaleString(), icon: Film, hint: 'Current catalog'},
    {label: 'Movies', value: movies.toLocaleString(), icon: Play, hint: 'Movie titles'},
    {label: 'TV Series', value: series.toLocaleString(), icon: Tv, hint: 'Series titles'},
    {label: 'Media Storage', value: '—', icon: Folder, hint: `${assets.length} registered assets`},
    {label: 'Active Licenses', value: active.toLocaleString(), icon: ShieldCheck, hint: `${soon} expiring soon`},
  ];
  return <div className="stats design-stats">{stats.map(({label, value, icon: Icon, hint}, i) => <section className="panel stat" key={label}>
    <div className="stat-top"><span className={`stat-icon tint-${i}`}><Icon size={20}/></span><div><strong>{value}</strong><small>{label}</small></div></div>
    
    <small className={`stat-hint hint-${i}`}>{hint}</small>
  </section>)}</div>;
}
export default function ContentWorkspace(props: Props) {
  const {content, licenses, page, query, onQuery, onPage, onEdit, onView, onToggle, media} = props;
  const [pending, setPending] = useState<number | null>(null);
  const visibility = (row:ContentRow) => row.is_active === false ? 'Inactive' : 'Active';
  async function toggle(row:ContentRow) {if(pending!==null)return;setPending(Number(row.content_id));try {await onToggle(row);}catch {/* Parent displays the error. */}finally {setPending(null);}}
  const [tabHighlight,setTabHighlight]=useState({left:0,width:70,visible:false});
  function highlightTab(target:EventTarget){if(!(target instanceof HTMLElement))return;const button=target.closest('button');if(button)setTabHighlight({left:button.offsetLeft-9,width:button.offsetWidth+18,visible:true});}
  const hideTabHighlight=()=>setTabHighlight(old=>({...old,visible:false}));
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [menu, setMenu] = useState<ContentRow | null>(null);
  const [viewing, setViewing] = useState<ContentRow | null>(null);
  const rows = content.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
    .filter(row => page === 'Movies' ? String(row.type).toLowerCase() === 'movie' : page === 'TV Series' ? /series|show/i.test(String(row.type)) : true)
    .filter(row => category === 'All' || row.category === category).filter(row => status === 'All' || visibility(row) === status);
  const movies = content.filter(row => String(row.type).toLowerCase() === 'movie').length;
  const series = content.filter(row => /series|show/i.test(String(row.type))).length;
  const total = content.length;
  const others = Math.max(0, total - movies - series);
  const count = rows.length;
  const pages = Math.max(1, Math.ceil(rows.length/10));
  const visibleOffset = Math.min(offset, (pages - 1) * 10);
  const expiring = licenses.map(license => {
    const title = content.find(row => row.license_id === license.license_id);
    return {title: String(title?.title || license.licensor_name), poster: title?.poster_url ? media(title.poster_url) : '', date: date(license.expiration_date), days: Math.ceil((new Date(String(license.expiration_date)).getTime()-Date.now())/86400000)};
  }).filter(row => row.days >= 0 && row.days <= 30).sort((a,b) => a.days-b.days).slice(0,3);
  function tab(name: string) {setOffset(0); setCategory('All'); setStatus('All'); onPage(name === 'All Content' ? 'Catalog' : name);}
  return <div className="workspace content-workspace">
    <section className="panel records">
      <div className="tabs" role="tablist" aria-label="Content sections" onPointerOver={event=>{if(event.pointerType==='mouse')highlightTab(event.target);}} onPointerLeave={hideTabHighlight} onFocusCapture={event=>highlightTab(event.target)} onBlurCapture={hideTabHighlight}><span aria-hidden="true" className={`tab-hover-pill ${tabHighlight.visible?'is-visible':''}`} style={{width:tabHighlight.width,transform:`translate(${tabHighlight.left}px,-50%)`}}/>{['All Content','Movies','TV Series','Genres','Licensing'].map(name => <button key={name} role="tab" aria-selected={name === page || (name === 'All Content' && ['Dashboard','Catalog','Content'].includes(page))} className={name === page || (name === 'All Content' && ['Dashboard','Catalog','Content'].includes(page)) ? 'active' : ''} onClick={() => tab(name)}>{name}</button>)}</div>
      <div className="tools"><label className="search"><input placeholder="Search content..." aria-label="Search content" value={query} onChange={e => {onQuery(e.target.value);setOffset(0);}}/><Search size={16}/></label>
        <div className="filter-controls"><select aria-label="Filter category" value={category} onChange={e => {setCategory(e.target.value);setOffset(0);}}><option value="All">All Categories</option>{Array.from(new Set(content.map(row => String(row.category || '')).filter(Boolean))).map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="Filter status" value={status} onChange={e => {setStatus(e.target.value);setOffset(0);}}><option value="All">All Status</option><option>Active</option><option>Inactive</option></select>
          <button className="filter-button" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16}/>Filters</button>
        </div>
      </div>
      {showFilters && <div className="filter-summary"><span>{rows.length} matching titles</span><button onClick={() => {setCategory('All');setStatus('All');onQuery('');setOffset(0);}}>Clear filters</button></div>}
      <div className="table-scroll"><table><thead><tr>{['Title','Type','Genre','Category','Status','Added On','Actions'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice(visibleOffset,visibleOffset+10).map(row => <tr key={String(row.content_id)}>
        <td><button className="title-cell" onClick={() => {onView(row);setViewing(row);}}>{row.poster_url && <img src={media(row.poster_url)} alt=""/>}<span>{row.title}<small>{String(row.release_date || '').slice(0,4)}</small></span></button></td>
        <td><span className={`content-type ${/series|show/i.test(String(row.type)) ? 'series' : ''}`}>{/series|show/i.test(String(row.type)) ? <Tv size={16}/> : <Film size={16}/>}<span>{/series|show/i.test(String(row.type)) ? 'TV Series' : row.type}</span></span></td>
        <td>{row.genre_name || '—'}</td><td>{row.category || '—'}</td><td><span className={`badge status-${visibility(row).toLowerCase()}`}><i/>{visibility(row)}</span></td><td>{date(row.created_at)}</td>
        <td><div className="actions"><button aria-label={`Edit ${row.title}`} onClick={() => onEdit(row)}><Pencil size={16}/></button><button aria-label={`View ${row.title}`} onClick={() => {onView(row);setViewing(row);}}><Eye size={16}/></button><Switch className="content-visibility-switch" aria-label={`Active content: ${row.title}`} checked={row.is_active !== false} disabled={pending !== null} onCheckedChange={() => void toggle(row)}/><button aria-label={`More actions for ${row.title}`} onClick={() => setMenu(menu === row ? null : row)}><MoreHorizontal size={16}/></button></div></td>
      </tr>)}</tbody></table>{!rows.length && <p className="empty">No content matches your filters.</p>}</div>
      <footer><small>Showing {rows.length ? visibleOffset+1 : 0} to {Math.min(visibleOffset+10,rows.length)} of {count.toLocaleString()} results</small><div><button aria-label="Previous page" disabled={visibleOffset === 0} onClick={() => setOffset(Math.max(0,visibleOffset-10))}><ChevronLeft size={16}/></button>{Array.from({length: pages},(_,i) => <button key={i} className={visibleOffset/10 === i ? 'current-page' : ''} onClick={() => setOffset(i*10)}>{i+1}</button>)}<button aria-label="Next page" disabled={visibleOffset+10 >= rows.length} onClick={() => setOffset(visibleOffset+10)}><ChevronRight size={16}/></button></div></footer>
    </section>
    <div className="details"><section className="panel overview"><h2>Content Overview</h2><div className="donut" style={{background: `conic-gradient(#6d4aff 0 ${total ? movies/total*100 : 100}%, #e0479e 0 ${total ? (movies+series)/total*100 : 100}%, #f0b429 0 100%)`}}><div><strong>{total.toLocaleString()}</strong><small>Total</small></div></div><div className="legend">{[['Movies',movies],['TV Series',series],['Others',others]].map(([label,value]) => <p key={label}><i/>{label}<strong>{Number(value).toLocaleString()} <small>({total ? (Number(value)/total*100).toFixed(1) : '0'}%)</small></strong></p>)}</div></section>
      <section className="panel expirations"><div className="panel-heading"><h2>Recent License Expirations</h2><button onClick={() => onPage('Licensing')}>View All</button></div><div className="expiration-list">{expiring.length ? expiring.map(item => <div className="expiration" key={item.title}>{item.poster ? <img src={item.poster} alt=""/> : <FileText size={24}/>}<div className="expiration-title"><strong>{item.title}</strong><small>{item.date}</small></div><div className="expiration-days"><small>License expires in</small><strong className={item.days <= 15 ? 'urgent' : ''}>{item.days} days</strong></div></div>) : <p className="empty">No licenses expiring in the next 30 days.</p>}</div><Button variant="outline" onClick={() => onPage('Licensing')}><FileText size={16}/>Manage Licenses</Button></section>
    </div>
    {menu && <div className="modal-backdrop"><section className="panel content-action-dialog" role="dialog" aria-modal="true" aria-label={`Actions for ${menu.title}`}><h2>{menu.title}</h2><Button onClick={() => {onEdit(menu);setMenu(null);}}><Pencil size={16}/>Edit content</Button><div className="content-visibility-setting"><div><strong>Active content</strong><p>Turn off to hide this title from users. Your content and details are kept.</p></div><Switch aria-label={`Active content: ${menu.title}`} checked={(content.find(row=>row.content_id===menu.content_id)||menu).is_active !== false} disabled={pending !== null} onCheckedChange={() => void toggle(content.find(row=>row.content_id===menu.content_id)||menu)}/></div><Button variant="outline" onClick={() => setMenu(null)}>Close</Button></section></div>}
    {viewing && <div className="modal-backdrop"><section className="panel content-detail-dialog" role="dialog" aria-modal="true" aria-label={`Details for ${viewing.title}`}><div className="panel-heading"><h2>{viewing.title}</h2><button onClick={() => setViewing(null)}>Close</button></div>{viewing.poster_url && <img src={media(viewing.poster_url)} alt={String(viewing.title)} />}<p>{viewing.synopsis || viewing.description || 'No synopsis available.'}</p><dl>{['type','genre_name','release_date','age_rating','director','cast'].map(key => <div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{viewing[key] || '—'}</dd></div>)}</dl></section></div>}
  </div>;
}
export function UploadContentIcon() {return <Upload size={16}/>;}
