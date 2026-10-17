import { useState } from 'react';
import { toast } from 'sonner';
import { Ic } from './proto-icons';
import { Seg } from './proto-ui';

/* Design System reference page, identical to the prototype. Swatches read the live CSS tokens. */
const sw = (n: string, role: string) => <div className="sw" key={n}><span className="chip-c" style={{ background: `var(${n})` }} /><span><b className="mono">{n}</b><small>{role}</small></span></div>;
const gest: [string, string, string, string][] = [
  ['Proximity', 'Related controls sit together: search, sort and view toggle share one toolbar; a title’s actions sit in its own detail panel.', 'Catalog', 'Catalog'],
  ['Similarity', 'Same job, same look: every status uses one pill shape, every primary action is the same purple button, every row action is the same icon button.', 'Subscriptions', 'Subscriptions'],
  ['Alignment', 'One 12-column grid with 16px gutters. Stat cards and panels below them share column edges.', 'Dashboard', 'Dashboard'],
  ['Common region', 'Each task lives in one container: the billing box groups payment details; the detail panel groups everything about one record.', 'Users', 'Subscribers'],
  ['Figure–ground', 'Dark neutral page (ground) behind slightly lighter surfaces (figure); dialogs sit on a blurred, dimmed backdrop.', 'Catalog', 'Catalog'],
  ['Continuity', 'The order pipeline reads left to right (Pending → Completed); the license timeline runs along one axis with a “today” line.', 'Orders', 'Orders'],
  ['Prägnanz', 'Each page answers one question first: the dashboard opens with “Needs your attention” instead of raw totals.', 'Dashboard', 'Dashboard'],
];
export default function DesignSystem({ onPage }: { onPage: (p: string) => void }) {
  const [tb, setTb] = useState<'colors' | 'type' | 'gestalt' | 'toasts'>('colors');
  return <>
    <div className="ds-tabs"><Seg value={tb} onChange={setTb} options={[['colors', 'Colors · 60–30–10'], ['type', 'Type & spacing'], ['gestalt', 'Gestalt'], ['toasts', 'Toasts']]} /></div>
    <div className="grid">
      {tb === 'colors' && <section className="sec c12"><div className="sec-head"><h3>60–30–10 color rule</h3></div><div className="sec-pad" style={{ display: 'grid', gap: 16 }}>
        <div className="ratio"><span style={{ flex: 60, background: 'var(--bg)' }}><b>60%</b> Dominant · neutral background</span><span style={{ flex: 30, background: 'var(--s3)' }}><b>30%</b> Secondary · violet surfaces</span><span style={{ flex: 10, background: 'var(--accent)', color: 'var(--on-accent)' }}><b>10%</b> Accent</span></div>
        <div className="sw-grid"><div><h4 className="ds-h">60 · Dominant</h4>{sw('--bg', 'Page background')}{sw('--bg-2', 'Sidebar')}</div><div><h4 className="ds-h">30 · Secondary</h4>{sw('--s1', 'Cards, panels')}{sw('--s2', 'Raised cards')}{sw('--s3', 'Avatars, chips')}{sw('--s4', 'Off switches')}</div><div><h4 className="ds-h">10 · Accent</h4>{sw('--accent', 'Buttons, active nav, toggles')}{sw('--accent-soft', 'Selected rows, hover')}{sw('--violet', 'Icons on accent')}</div><div><h4 className="ds-h">Semantic (status only)</h4>{sw('--ok', 'Active, paid')}{sw('--warn', 'Expiring, low stock')}{sw('--bad', 'Expired, delete')}{sw('--info', 'Billing, info')}</div></div>
      </div></section>}
      {tb === 'type' && <><section className="sec c6"><div className="sec-head"><h3>Type scale</h3></div><div className="sec-pad" style={{ display: 'grid', gap: 12 }}>{([['--fs-2xl', '30 / 800', 'Page title'], ['--fs-xl', '22 / 800', 'Key number'], ['--fs-lg', '16 / 700', 'Section title'], ['--fs-md', '14 / 500', 'Body'], ['--fs-sm', '12.5 / 600', 'Labels'], ['--fs-xs', '11 / 700', 'Eyebrow, table head']] as const).map(([t, v, l]) => <div key={t} className="ts-row"><span style={{ fontSize: `var(${t})`, fontWeight: Number(v.split('/ ')[1]) }}>{l}</span><span className="mono">{t} · {v}</span></div>)}</div></section>
        <section className="sec c6"><div className="sec-head"><h3>Spacing, radius, motion</h3></div><div className="sec-pad" style={{ display: 'grid', gap: 18 }}>
          <div className="tok-row">{[4, 8, 12, 16, 20, 24, 32].map(n => <span key={n} className="sp"><i style={{ width: n, height: n }} /><small className="mono">{n}</small></span>)}</div>
          <div className="tok-row">{['--r-sm', '--r-md', '--r-lg', '--r-xl'].map(t => <span key={t} className="rad"><i style={{ borderRadius: `var(${t})` }} /><small className="mono">{t}</small></span>)}</div>
          <div className="tok-row mono" style={{ fontSize: 12, color: 'var(--t2)', gap: 16, flexWrap: 'wrap' }}><span>--fast 150ms</span><span>--dur 220ms</span><span>--slow 300ms</span><span>--ease cubic-bezier(.22,1,.36,1)</span></div>
        </div></section></>}
      {tb === 'gestalt' && <section className="sec c12"><div className="sec-head"><h3>Gestalt principles in this admin</h3></div><div className="gest">{gest.map(([n, d, p, l]) => <div key={n} className="g-card"><b>{n}</b><p>{d}</p><button type="button" className="lnk" onClick={() => onPage(p)}>See it on {l}<Ic n="right" s={13} /></button></div>)}</div></section>}
      {tb === 'toasts' && <section className="sec c12"><div className="sec-head"><h3>Toasts (Sonner)</h3><span style={{ color: 'var(--t3)', fontSize: 12 }}>Same <span className="mono">sonner</span> library the client app uses</span></div><div className="sec-pad" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-g" onClick={() => toast.success('Changes saved', { description: 'Synced to Supabase' })}><Ic n="ok" s={15} />Success</button>
        <button type="button" className="btn btn-g" onClick={() => toast.error('Couldn’t save', { description: 'Check your connection and try again.' })}><Ic n="err" s={15} />Error</button>
        <button type="button" className="btn btn-g" onClick={() => toast('Title archived', { description: 'Hidden from users', action: { label: 'Undo', onClick: () => toast.success('Restored') } })}><Ic n="restore" s={15} />With Undo</button>
        <button type="button" className="btn btn-g" onClick={() => { toast.success('Plan saved'); toast('Order SF-10481 marked shipped'); toast.error('Upload failed'); }}><Ic n="layers" s={15} />Stack 3</button>
      </div></section>}
    </div>
  </>;
}
