import { useState } from 'react';
import { Ic } from './proto-icons';
import { download } from './proto-ui';

type Settings = Record<string, string | boolean>;
/* Settings in the prototype's layout (sub-navigation + one form). Only settings stored in Supabase are shown. */
export default function SettingsPage({ values, onSave, onError }: { values: Settings; onSave: (v: Settings) => Promise<void>; onError: (s: string) => void }) {
  const [tab, setTab] = useState('platform');
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const def = (f: string) => String(values[f] || (f === 'platformName' ? 'StreamFlix' : f === 'timezone' ? 'Asia/Manila' : f === 'language' ? 'English' : f === 'primaryColor' ? '#7c5cff' : f === 'secondaryColor' ? '#c58cf5' : ''));
  const [c1, setC1] = useState(def('primaryColor')); const [c2, setC2] = useState(def('secondaryColor'));
  const tabs: [string, string, string][] = [['platform', 'Platform', 'settings'], ['branding', 'Branding', 'image'], ['backup', 'Backup', 'download']];
  const langs = Array.from(new Set(['English', 'Filipino', def('language')]));
  const zones = Array.from(new Set(['Asia/Manila', 'America/Los_Angeles', def('timezone')]));
  return <div className="set-wrap">
    <nav className="subnav" aria-label="Settings sections">{tabs.map(([k, l, i]) => <button type="button" key={k} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'true' : undefined} onClick={() => setTab(k)}><Ic n={i} s={16} />{l}</button>)}</nav>
    <form className="sec" key={formKey} onSubmit={async e => { e.preventDefault(); setSaving(true); try { await onSave(Object.fromEntries(new FormData(e.currentTarget)) as Settings); } catch (err) { onError((err as Error).message); } finally { setSaving(false); } }}>
      <div hidden={tab !== 'platform'}><div className="set-sec"><div><h3>Platform details</h3></div><div className="fgrid">
        <label className="f">Platform name<input name="platformName" defaultValue={def('platformName')} required /></label>
        <label className="f">Tagline<input name="tagline" defaultValue={def('tagline')} /></label>
        <label className="f">Support email<input name="supportEmail" type="email" defaultValue={def('supportEmail')} /></label>
        <label className="f">Language<select name="language" defaultValue={def('language')}>{langs.map(l => <option key={l}>{l}</option>)}</select></label>
        <label className="f">Timezone<select name="timezone" defaultValue={def('timezone')}>{zones.map(z => <option key={z}>{z}</option>)}</select></label>
      </div></div></div>
      <div hidden={tab !== 'branding'}>
        <div className="set-sec"><div><h3>Colors</h3></div><div className="fgrid">
          <label className="f">Primary<span className="color-in"><input type="color" name="primaryColor" value={c1} onChange={e => setC1(e.target.value)} aria-label="Primary color" /><input type="text" value={c1.toUpperCase()} onChange={e => /^#[0-9a-f]{6}$/i.test(e.target.value) && setC1(e.target.value)} aria-label="Primary color hex" /></span></label>
          <label className="f">Secondary<span className="color-in"><input type="color" name="secondaryColor" value={c2} onChange={e => setC2(e.target.value)} aria-label="Secondary color" /><input type="text" value={c2.toUpperCase()} onChange={e => /^#[0-9a-f]{6}$/i.test(e.target.value) && setC2(e.target.value)} aria-label="Secondary color hex" /></span></label>
        </div></div>
        <div className="set-sec"><div><h3>Logo</h3></div><div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}><span className="mark" style={{ width: 64, height: 64, borderRadius: 18 }}><img src="/streamflix/logo-optimized.webp" alt="" width={40} height={40} style={{ objectFit: 'contain' }} /></span><span style={{ color: 'var(--t2)', fontSize: 13 }}>{def('platformName')} logo, used in the client app and emails.</span></div></div>
      </div>
      <div hidden={tab !== 'backup'}><div className="set-sec"><div><h3>Export settings</h3></div><div><button type="button" className="btn btn-g" onClick={() => download(values, 'streamflix-settings.json')}><Ic n="download" s={15} />Export settings</button></div></div></div>
      {tab !== 'backup' && <div className="m-foot" style={{ borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}><span className="left">Changes apply to the client app right away.</span><button type="button" className="btn btn-g" disabled={saving} onClick={() => { setC1(def('primaryColor')); setC2(def('secondaryColor')); setFormKey(k => k + 1); }}>Discard</button><button className="btn btn-p" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>}
    </form>
  </div>;
}
