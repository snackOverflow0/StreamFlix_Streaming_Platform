import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Ic } from './proto-icons';
import { createPortal } from 'react-dom';

/* Building blocks that reproduce the approved admin prototype's markup one-to-one.
   Every page composes these, so a status badge, poster, pager or dialog looks identical everywhere. */
type Row = Record<string, unknown>;
export const str = (v: unknown) => String(v ?? '');
export const peso = (n: unknown) => '₱' + Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 });
export const fmtDate = (v: unknown) => { const d = new Date(str(v)); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); };
export const fmtShort = (v: unknown) => { const d = new Date(str(v)); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }); };
export const fmtMonth = (v: unknown) => { const d = new Date(str(v)); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
export const fmtStamp = (v: unknown) => { const d = new Date(str(v)); return isNaN(d.getTime()) ? '—' : `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`; };
export const initials = (name: unknown) => str(name).split(/\s+/).filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase() || '?';
export const hueOf = (seed: unknown) => { let h = 0; for (const c of str(seed)) h = (h * 31 + c.charCodeAt(0)) % 360; return 230 + (h % 80); };
export const cap = (s: unknown) => str(s).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'mute' | 'acc';
export const B = ({ tone, children }: { tone: Tone; children: ReactNode }) => <span className={`bdg b-${tone}`}><i />{children}</span>;

export function Av({ name, size }: { name: unknown; size?: number }) {
  return <span className="av" style={{ background: `hsl(${hueOf(name)} 24% 26%)`, ...(size ? { width: size, height: size } : {}) }}>{initials(name)}</span>;
}

/* Poster tile: real artwork when the title has one, the prototype's striped "missing artwork" tile otherwise. */
export function Poster({ src, title, className = '' }: { src?: string; title?: unknown; className?: string }) {
  if (!src) return <span className={`poster noart ${className}`} title="No poster uploaded"><Ic n="image" s={16} /></span>;
  return <span className={`poster has-img ${className}`}><img src={src} alt="" loading="lazy" decoding="async" />{title ? <span className="sr-only">{str(title)}</span> : null}</span>;
}

export function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="empty"><span className="ic-chip"><Ic n={icon} s={22} /></span><b>{title}</b><span>{text}</span></div>;
}

export function Search({ value, onChange, label, id }: { value: string; onChange: (v: string) => void; label: string; id?: string }) {
  return <label className="search"><Ic n="search" s={16} /><input id={id} placeholder={label} aria-label={label} value={value} maxLength={60} onChange={e => onChange(e.target.value.slice(0, 60))} /></label>;
}

export function Switch({ on, onClick, label, disabled }: { on: boolean; onClick?: () => void; label: string; disabled?: boolean }) {
  return <button type="button" className="switch" role="switch" aria-checked={on} aria-label={label} disabled={disabled} style={disabled ? { opacity: .4 } : undefined} onClick={e => { e.stopPropagation(); onClick?.(); }} />;
}

/* Paging identical to the prototype's paged(): "1–8 of 24" on the left, ‹ 1 / 3 › on the right. */
export function usePaged<T>(rows: T[], per: number, resetKey: unknown = '') {
  const [pg, setPg] = useState(0);
  useEffect(() => setPg(0), [resetKey, per]);
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const cur = Math.min(pg, pages - 1);
  const pager = <div className="pager"><span>{rows.length ? cur * per + 1 : 0}–{Math.min(rows.length, cur * per + per)} of {rows.length}</span><div>
    <button type="button" className="btn btn-g btn-sm" disabled={cur === 0} aria-label="Previous page" onClick={() => setPg(cur - 1)}><Ic n="left" s={14} /></button>
    <span className="mono">{cur + 1} / {pages}</span>
    <button type="button" className="btn btn-g btn-sm" disabled={cur >= pages - 1} aria-label="Next page" onClick={() => setPg(cur + 1)}><Ic n="right" s={14} /></button>
  </div></div>;
  return { rows: rows.slice(cur * per, cur * per + per), pager, page: cur };
}

export function Seg<K extends string>({ value, options, onChange, label, role = 'tablist' }: { value: K; options: [K, ReactNode][]; onChange: (k: K) => void; label?: string; role?: string }) {
  return <div className="seg" role={role} aria-label={label}>{options.map(([k, l]) => <button type="button" key={k} role={role === 'tablist' ? 'tab' : undefined} aria-selected={role === 'tablist' ? value === k : undefined} aria-pressed={role !== 'tablist' ? value === k : undefined} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

export function Chips<K extends string>({ value, options, onChange, label }: { value: K; options: [K, string, number?][]; onChange: (k: K) => void; label: string }) {
  return <div className="chips" role="group" aria-label={label}>{options.map(([k, l, n]) => <button type="button" key={k} className={`chip ${value === k ? 'on' : ''}`} aria-pressed={value === k} onClick={() => onChange(k)}>{l}{n !== undefined && <span className="c">{n}</span>}</button>)}</div>;
}

/* Dialog shell from the prototype: blurred backdrop, header with close, scrolling body, footer. */
export function Modal({ title, sub, onClose, children, foot, size, onSubmit, busy, drawer, bodyStyle, portal = false }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; foot?: ReactNode; size?: 'sm' | ''; onSubmit?: (e: FormEvent<HTMLFormElement>) => void; busy?: boolean; drawer?: boolean; bodyStyle?: CSSProperties; portal?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose, busy]);
  const body = <><div className="m-body" style={bodyStyle}>{children}</div>{foot !== null && <div className="m-foot">{foot}</div>}</>;
  const dialog = <div className={`backdrop ${drawer ? 'drawer-bd' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
    <section className={`modal ${size ?? ''} ${drawer ? 'drawer' : ''}`} role="dialog" aria-modal="true" aria-labelledby="mt">
      <div className="m-head"><div><h2 id="mt">{title}</h2>{sub ? <p>{sub}</p> : null}</div><button type="button" className="icon-act" aria-label="Close" disabled={busy} onClick={onClose}><Ic n="x" s={17} /></button></div>
      {onSubmit ? <form onSubmit={onSubmit} style={{ display: 'contents' }}>{body}</form> : body}
    </section>
  </div>;
  // Dialogs rendered inside transformed / scrollable pages can be clipped.
  // The merchandise editor is portaled above the application layout.
  return portal ? createPortal(<div className="sfx sf-merch-portal" style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', background: 'transparent', minHeight: 0 }}>{dialog}</div>, document.body) : dialog;
}
export const Field = ({ label, full, children, hint }: { label: ReactNode; full?: boolean; children: ReactNode; hint?: ReactNode }) => <label className={`f ${full ? 'full' : ''}`}>{label}{children}{hint ? <span className="hint">{hint}</span> : null}</label>;

/* askConfirm(): the prototype's confirm dialog as a promise, replacing window.confirm everywhere. */
type Ask = { title: string; body: string; label: string; icon?: string; tone?: 'd' | 'p'; resolve: (ok: boolean) => void };
let push: ((a: Ask | null) => void) | null = null;
export function askConfirm(o: Omit<Ask, 'resolve'>): Promise<boolean> {
  return new Promise(resolve => { if (!push) { resolve(window.confirm(o.title)); return; } push({ ...o, resolve }); });
}
export function ConfirmHost() {
  const [ask, setAsk] = useState<Ask | null>(null);
  useEffect(() => { push = setAsk; return () => { push = null; }; }, []);
  if (!ask) return null;
  const done = (ok: boolean) => { ask.resolve(ok); setAsk(null); };
  return <Modal size="sm" title={ask.title} onClose={() => done(false)} foot={<><button type="button" className="btn btn-g" onClick={() => done(false)}>Cancel</button><button type="button" className={`btn btn-${ask.tone ?? 'd'}`} autoFocus onClick={() => done(true)}>{ask.icon && <Ic n={ask.icon} s={15} />}{ask.label}</button></>}>
    <p style={{ color: 'var(--t2)', lineHeight: 1.6 }}>{ask.body}</p>
  </Modal>;
}

export function download(data: unknown, name: string) { const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

export type { Row };
