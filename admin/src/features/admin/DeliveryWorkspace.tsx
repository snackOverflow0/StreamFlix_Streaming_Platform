import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api-client';
import { Ic } from './proto-icons';
import { B, Empty, askConfirm, cap, usePaged } from './proto-ui';

/* Email delivery (Brevo outbox) in the prototype layout: KPI strip, email table, preview panel with retry. */
type Job = { id: string; kind: string; recipient: string; status: string; attempts: number; last_error: string | null; created_at: string; sent_at: string | null; provider_message_id: string | null };
type Data = { configured: boolean; provider: string; jobs: Job[] };
const kindLabel = (k: string) => ({ subscription_receipt: 'Subscription receipt', merchandise_receipt: 'Order receipt', order_receipt: 'Order receipt', welcome: 'Welcome' } as Record<string, string>)[k] ?? cap(k.replace(/_/g, ' '));
const subject = (k: string) => /merch|order/i.test(k) ? 'Your StreamFlix order receipt' : /subscription|plan/i.test(k) ? 'Your StreamFlix subscription receipt' : /welcome/i.test(k) ? 'Welcome to StreamFlix' : 'A message from StreamFlix';
const body = (k: string) => /merch|order/i.test(k) ? 'Thanks for shopping with us. We’ll keep you posted on delivery.' : /subscription|plan/i.test(k) ? 'Your payment was received and your plan is active. Enjoy watching.' : /welcome/i.test(k) ? 'Your account is ready. Pick a plan and start watching.' : 'Reply to this email if you have any questions.';
const badge = (s: string) => s === 'sent' ? <B tone="ok">Accepted</B> : s === 'failed' ? <B tone="bad">Failed</B> : s === 'uncertain' ? <B tone="warn">Needs review</B> : <B tone="info">Queued</B>;
const when = (v: string | null) => { if (!v) return '—'; const d = new Date(v); return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }); };

export default function DeliveryWorkspace() {
  const [data, setData] = useState<Data | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [picked, setPicked] = useState<string | null>(null);
  async function load() { try { setData(await apiRequest<Data>('/admin/email-delivery')); setError(''); } catch (e) { setError((e as Error).message); } }
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 15000); return () => clearInterval(timer); }, []);
  async function retry(job: Job) {
    if (job.status === 'uncertain' && !(await askConfirm({ title: 'Retry this email?', body: 'Check Brevo’s transactional logs first and confirm this message was NOT accepted or sent. Retrying a sent email may deliver a duplicate.', label: 'I checked — retry', icon: 'send', tone: 'p' }))) return;
    setBusy(true); try { await apiRequest(`/admin/email-delivery/${job.id}/retry`, { method: 'POST', body: JSON.stringify({ confirmed_not_sent: job.status === 'uncertain' }) }); await load(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const jobs = data?.jobs || [];
  const week = Date.now() - 7 * 864e5;
  const P = usePaged(jobs, 8, jobs.length);
  const cur = jobs.find(j => j.id === picked) || P.rows[0];
  return <>
    {error && <p className="form-err" role="alert" style={{ marginBottom: 14 }}>{error}</p>}
    <div className="kpis cards3">{([['Accepted (7 days)', jobs.filter(j => j.status === 'sent' && new Date(j.sent_at || j.created_at).getTime() >= week).length], ['Queued', jobs.filter(j => ['pending', 'sending'].includes(j.status)).length], ['Failed or needs review', jobs.filter(j => ['failed', 'uncertain'].includes(j.status)).length]] as const).map(([l, v]) => <div key={l} className="kpi"><div className="kpi-l">{l}</div><div className="kpi-v"><strong className="num">{v}</strong></div></div>)}</div>
    <div className="split al al-8">
      <section className="sec">
        <div className="sec-head"><h3>Receipts &amp; notices<span className="sub">{data ? (data.configured ? 'Brevo connected' : 'Brevo not configured — set BREVO_API_KEY and BREVO_SENDER_EMAIL in backend/.env') : 'Loading…'}</span></h3><button type="button" className="btn btn-g btn-sm" onClick={() => void load()}><Ic n="refresh" s={14} />Refresh</button></div>
        {jobs.length ? <div className="tw"><table className="cards-m"><thead><tr><th>Email</th><th>Recipient</th><th>Status</th><th>Sent</th></tr></thead><tbody>{P.rows.map(j => <tr key={j.id} className={cur === j ? 'sel' : ''}><td className="main"><button type="button" className="cell-main" onClick={() => setPicked(j.id)}><span>{subject(j.kind)}<small>{kindLabel(j.kind)}</small></span></button></td><td data-label="To">{j.recipient}</td><td data-label="Status">{badge(j.status)}</td><td data-label="Sent" className="mono" style={{ fontSize: 12 }}>{when(j.sent_at || j.created_at)}</td></tr>)}</tbody></table></div>
          : <Empty icon="mail" title={data ? 'No emails yet' : 'Loading emails…'} text="Receipts for completed payments and merchandise orders appear here." />}
        {jobs.length > 0 && P.pager}
      </section>
      {cur ? <aside className="sec inspector"><div className="sec-head"><h3>Preview</h3>{badge(cur.status)}</div>
        <div className="mail-prev"><div className="mh">streamflix</div><div className="mb"><b>{subject(cur.kind)}</b><p style={{ marginTop: 8 }}>{body(cur.kind)}</p><span className="cta">Open StreamFlix</span></div></div>
        <dl className="dl" style={{ paddingTop: 0 }}><dt>To</dt><dd>{cur.recipient}</dd><dt>Attempts</dt><dd>{cur.attempts}</dd><dt>Brevo ID</dt><dd className="mono" style={{ fontSize: 11.5 }}>{cur.provider_message_id || '—'}</dd></dl>
        {cur.last_error && <p style={{ margin: '0 20px 12px', fontSize: 12, color: 'var(--bad)' }}>{cur.last_error}</p>}
        {['failed', 'uncertain'].includes(cur.status) && <div className="ins-acts" style={{ borderTop: 0, paddingTop: 0 }}><button type="button" className="btn btn-p" style={{ gridColumn: '1/-1' }} disabled={busy || !data?.configured} onClick={() => void retry(cur)}><Ic n="send" s={15} />{cur.status === 'uncertain' ? 'Review and retry' : 'Retry send'}</button></div>}
      </aside> : <aside className="sec inspector"><Empty icon="mail" title="Nothing selected" text="Pick an email to preview it." /></aside>}
    </div>
  </>;
}

