import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, Check, ChevronRight, Clapperboard, CreditCard, Info, Lock, MessageSquareText, Minus, Package, PlayCircle, Plus, Search, ShoppingBag, Star, UserRound, X } from "lucide-react";
import { PasswordResetLink } from "@/services/password-recovery";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import type { AppNotification, Content, MerchProduct } from "../types";
import { Crumbs, backdropOf, isSeries, peso } from "./ui";

type P = { state: StreamFlixController };

/* ---------------- Preferences (per device, local) ---------------- */
const PREF_KEY = "streamflix-prefs";
type Prefs = { autoplay: boolean; previews: boolean; lang: string; subs: string; releases: boolean; email: boolean; feedback: boolean };
const DEFAULT_PREFS: Prefs = { autoplay: true, previews: true, lang: "English", subs: "English", releases: true, email: true, feedback: true };
function readPrefs(): Prefs { try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; } catch { return DEFAULT_PREFS; } }
function savePrefs(p: Prefs) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* private mode */ } }

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`x-tog ${on ? "on" : ""}`} onClick={() => onChange(!on)}><i /></button>;
}
function Row({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return <div className="x-row"><div><b>{title}</b>{sub && <small>{sub}</small>}</div>{children}</div>;
}

/* ================= ACCOUNT ================= */
type Tab = "profile" | "security" | "plan" | "playback" | "notifications";
const TABS: [Tab, string, typeof UserRound][] = [["profile", "Profile", UserRound], ["security", "Sign-in & security", Lock], ["plan", "Plan & billing", CreditCard], ["playback", "Playback & language", PlayCircle], ["notifications", "Notifications", Bell]];

export function AccountPage({ state }: P) {
  const [tab, setTab] = useState<Tab>(() => { try { return (sessionStorage.getItem("sf-acc-tab") as Tab) || "profile"; } catch { return "profile"; } });
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [saved, setSaved] = useState("");
  useEffect(() => { try { sessionStorage.removeItem("sf-acc-tab"); } catch { /* ignore */ } }, []);
  useEffect(() => { document.body.classList.add("x-fit"); return () => document.body.classList.remove("x-fit"); }, []);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => { const n = { ...prefs, [k]: v }; setPrefs(n); savePrefs(n); setSaved("Setting saved"); window.setTimeout(() => setSaved(""), 1600); };
  const acc = state.account; const plan = state.currentPlan; const me = state.activeProfile;
  const paid = (state.transactions ?? []).slice(0, 4);
  return <div className="v-page x-acc">
    <Crumbs onGo={() => state.navigate("home")} items={[["Account", null]]} />
    <div className="v-page-h"><div><h1>Account</h1><p>Manage your profile, security, plan and preferences.</p></div></div>
    <div className="x-accwrap">
      <nav className="x-accnav" aria-label="Account sections">{TABS.map(([k, l, Icon]) => <button type="button" key={k} className={tab === k ? "on" : ""} aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}><Icon size={18} /><span>{l}</span></button>)}</nav>
      <section className="x-accpanel" key={tab} aria-live="polite">
        {tab === "profile" && <>
          <h2>Profile</h2><p className="x-sub">This is how you appear on StreamFlix.</p>
          <div className="x-id"><img src={me?.image} alt="" /><div><b>{acc.name || me?.name}</b><small>{acc.email}</small></div><button type="button" className="x-btn ghost" onClick={() => state.setAuthStage("profiles")}>Manage profiles</button></div>
          <div className="x-list">
            <Row title="Full name" sub={acc.name || "—"} />
            <Row title="Email" sub={acc.email || "—"} />
            <Row title="Mobile number" sub={acc.phone || "Not added"} />
            <Row title="Date of birth" sub={acc.dateOfBirth ? new Date(acc.dateOfBirth + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "Not added"} />
            <Row title="Profiles on this account" sub={state.profiles.map(p => p.name).join(" · ")}><button type="button" className="x-btn ghost" onClick={() => state.setAccountOpen(true)}>Edit details</button></Row>
          </div>
        </>}
        {tab === "security" && <>
          <h2>Sign-in & security</h2><p className="x-sub">Keep your account safe.</p>
          <div className="x-list">
            <Row title="Password" sub="We’ll email you a secure link to set a new password."><span className="x-reset"><PasswordResetLink email={acc.email} /></span></Row>
            <Row title="This device" sub={me ? `${me.deviceType} · ${me.deviceName}` : "This browser"} />
            <Row title="Sign out" sub="Sign out of StreamFlix on this device."><button type="button" className="x-btn ghost" onClick={() => void state.logout()}>Sign out</button></Row>
          </div>
        </>}
        {tab === "plan" && <>
          <h2>Plan & billing</h2><p className="x-sub">Manage your subscription and payments. Payments are processed by Stripe.</p>
          <div className="x-plan"><div><span className="x-pill">Current plan</span><b>{plan?.name ?? "No active plan"}</b>{plan && <small>{peso(plan.price)}/month · {plan.quality} · {plan.maxMembers} {plan.maxMembers > 1 ? "members" : "member"}</small>}</div><button type="button" className="x-btn" onClick={() => state.setPlansOpen(true)}>{plan ? "Change plan" : "Choose a plan"}</button></div>
          <div className="x-list">
            <Row title="Recent payments & orders" sub={paid.length ? <>{paid.map(t => <span key={t.id} className="x-line">{t.id} · {peso(t.total)} · {t.status}</span>)}</> : "No payments yet."}><button type="button" className="x-btn ghost" onClick={() => state.navigate("cart")}>View all</button></Row>
            <Row title="Receipts" sub="A receipt is emailed to you (via Brevo) after every successful payment." />
          </div>
        </>}
        {tab === "playback" && <>
          <h2>Playback & language</h2><p className="x-sub">Saved on this device for {me?.name ?? "this profile"}.</p>
          <div className="x-list">
            <Row title="Autoplay next episode" sub="Start the next episode automatically."><Toggle on={prefs.autoplay} label="Autoplay next episode" onChange={v => set("autoplay", v)} /></Row>
            <Row title="Autoplay previews" sub="Play previews while browsing."><Toggle on={prefs.previews} label="Autoplay previews" onChange={v => set("previews", v)} /></Row>
            <Row title="Display language"><select className="x-sel" aria-label="Display language" value={prefs.lang} onChange={e => set("lang", e.target.value)}>{["English", "Filipino"].map(x => <option key={x}>{x}</option>)}</select></Row>
            <Row title="Subtitles" sub="Default subtitle language."><select className="x-sel" aria-label="Subtitles" value={prefs.subs} onChange={e => set("subs", e.target.value)}>{["Off", "English", "Filipino"].map(x => <option key={x}>{x}</option>)}</select></Row>
          </div>
        </>}
        {tab === "notifications" && <>
          <h2>Notifications</h2><p className="x-sub">Choose what we tell you about.</p>
          <div className="x-list">
            <Row title="New releases" sub="Episodes and films from your list."><Toggle on={prefs.releases} label="New releases" onChange={v => set("releases", v)} /></Row>
            <Row title="Email updates" sub="Receipts, order shipping and account alerts."><Toggle on={prefs.email} label="Email updates" onChange={v => set("email", v)} /></Row>
            <Row title="Feedback replies" sub="When the team responds to your feedback."><Toggle on={prefs.feedback} label="Feedback replies" onChange={v => set("feedback", v)} /></Row>
          </div>
        </>}
        {saved && <p className="x-saved" role="status"><Check size={15} />{saved}</p>}
      </section>
    </div>
  </div>;
}

/* ================= VIEWING HISTORY with date filters ================= */
type Range = "all" | "today" | "7" | "30" | "date";
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function HistoryPage({ state }: P) {
  const [range, setRange] = useState<Range>("all");
  const [date, setDate] = useState("");
  const rows = useMemo(() => {
    const seen = new Set<string>(); const out: { item: Content; at: Date; progress: number }[] = [];
    for (const r of [...(state.historyRows ?? [])].sort((a, b) => new Date(b.watch_date).getTime() - new Date(a.watch_date).getTime())) {
      const at = new Date(r.watch_date); const k = r.content_id + "|" + dayKey(at); if (seen.has(k)) continue; seen.add(k);
      const item = state.catalog.find(c => c.id === r.content_id); if (item) out.push({ item, at, progress: Number(r.progress_percentage) || 0 });
    }
    return out;
  }, [state.historyRows, state.catalog]);
  const now = new Date(); const today = dayKey(now);
  const ageDays = (d: Date) => Math.floor((new Date(today + "T00:00").getTime() - new Date(dayKey(d) + "T00:00").getTime()) / 864e5);
  const keep = (r: { at: Date }, k: Range = range) => k === "all" || (k === "today" && ageDays(r.at) === 0) || (k === "7" && ageDays(r.at) < 7) || (k === "30" && ageDays(r.at) < 30) || (k === "date" && dayKey(r.at) === date);
  const shown = rows.filter(r => keep(r));
  const groups: [string, typeof shown][] = [];
  for (const r of shown) { const a = ageDays(r.at); const g = a === 0 ? "Today" : a === 1 ? "Yesterday" : r.at.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }); const last = groups[groups.length - 1]; if (last && last[0] === g) last[1].push(r); else groups.push([g, [r]]); }
  const chips: [Range, string][] = [["all", "All time"], ["today", "Today"], ["7", "Last 7 days"], ["30", "Last 30 days"]];
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate("home")} items={[["Viewing history", null]]} />
    <div className="v-page-h"><div><h1>Viewing history</h1><p>Everything this profile has watched, newest first.</p></div></div>
    <div className="x-hf" role="group" aria-label="Filter by date">
      {chips.map(([k, l]) => <button type="button" key={k} className={`v-chip ${range === k ? "on" : ""}`} aria-pressed={range === k} onClick={() => { setRange(k); setDate(""); }}>{l}<em>{rows.filter(r => keep(r, k)).length}</em></button>)}
      <label className={`x-date ${range === "date" ? "on" : ""}`}><CalendarDays size={16} /><span>{range === "date" && date ? new Date(date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pick a date"}</span><input type="date" max={today} value={date} aria-label="Show history for a specific date" onChange={e => { setDate(e.target.value); setRange(e.target.value ? "date" : "all"); }} /></label>
      {range !== "all" && <button type="button" className="x-link" onClick={() => { setRange("all"); setDate(""); }}>Reset</button>}
    </div>
    {shown.length ? groups.map(([g, list]) => <section key={g} className="x-hg"><h3>{g}</h3>{list.map(({ item, at, progress }) => <div key={item.id + at.toISOString()} className="x-hrow">
      <button type="button" className="x-hthumb" onClick={() => void state.play(item)} aria-label={`Play ${item.title}`}><img src={item.preview ?? backdropOf(item)} alt="" loading="lazy" /><span className="v-prog"><i style={{ width: `${Math.min(100, progress)}%` }} /></span></button>
      <div className="x-hinfo"><b>{item.title}</b><small>{isSeries(item) ? "TV Show" : "Movie"} · {item.genre}</small><small className="t">{progress >= 100 ? "Finished" : `${Math.round(progress)}% watched`} · {at.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</small></div>
      <button type="button" className="v-ib" aria-label={`Details for ${item.title}`} onClick={() => state.openTitle(item)}><Info size={18} /></button>
    </div>)}</section>)
      : <div className="v-empty"><span className="ic"><Clapperboard size={28} /></span><b>{rows.length ? (range === "date" ? "Nothing watched on that day" : "Nothing watched in this period") : "No viewing history yet"}</b><span>{rows.length ? "Try another date range." : "Titles you watch will show up here."}</span>{rows.length > 0 && <button type="button" className="v-btn v-glass sm" onClick={() => { setRange("all"); setDate(""); }}>Show all history</button>}</div>}
  </div>;
}

/* ================= SEARCH DROPDOWN ================= */
const RECENT_KEY = "streamflix-recent-searches";
export function SearchDropdown({ state, onClose }: P & { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } });
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);
  const term = q.trim().toLowerCase();
  const results = term ? state.catalog.filter(i => `${i.title} ${i.genre} ${(i.cast ?? []).join(" ")} ${i.director ?? ""}`.toLowerCase().includes(term)).slice(0, 8) : [];
  const trending = state.topTenItems.slice(0, 6);
  const remember = (s: string) => { const v = s.trim(); if (!v) return; const n = [v, ...recent.filter(r => r.toLowerCase() !== v.toLowerCase())].slice(0, 5); setRecent(n); try { localStorage.setItem(RECENT_KEY, JSON.stringify(n)); } catch { /* ignore */ } };
  const open = (i: Content) => { remember(q); onClose(); state.openTitle(i); };
  const item = (i: Content) => <button type="button" key={i.id} className="x-sit" onClick={() => open(i)}><img src={i.poster} alt="" loading="lazy" /><span><b>{i.title}</b><small>{isSeries(i) ? "TV Show" : "Movie"} · {i.year}</small></span><ChevronRight size={16} /></button>;
  return <><div className="x-sscrim" onClick={onClose} /><div className="x-sd" role="dialog" aria-label="Search">
    <form className="x-sbar" onSubmit={e => { e.preventDefault(); if (results[0]) open(results[0]); }}><Search size={19} /><input ref={input} value={q} maxLength={55} onChange={e => setQ(e.target.value)} placeholder="Search titles, genres, people…" aria-label="Search" autoComplete="off" />{q && <button type="button" className="x-sx" aria-label="Clear" onClick={() => { setQ(""); input.current?.focus(); }}><X size={16} /></button>}</form>
    <div className="x-spanel">{term ? (results.length ? <><div className="x-sh"><span>{results.length} result{results.length > 1 ? "s" : ""}</span></div>{results.map(item)}</> : <div className="x-sempty"><b>No matches for “{q.trim()}”</b><small>Try a title, genre or cast name.</small></div>)
      : <>{recent.length > 0 && <><div className="x-sh"><span>Recent</span><button type="button" onClick={() => { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ } }}>Clear</button></div><div className="x-chips">{recent.map(r => <button type="button" key={r} className="x-chip" onClick={() => setQ(r)}><Search size={13} />{r}</button>)}</div></>}<div className="x-sh"><span>Trending today</span></div>{trending.map(item)}</>}</div>
  </div></>;
}

/* ================= NOTIFICATIONS PANEL ================= */
const kindOf = (n: AppNotification) => { const t = `${n.type} ${n.title}`.toLowerCase(); return /order|ship|deliver|merch/.test(t) ? "order" : /pay|bill|receipt|subscri|plan/.test(t) ? "billing" : /feedback|resolved|reply/.test(t) ? "feedback" : /episode|new|release|season/.test(t) ? "new" : "other"; };
const KIND: Record<string, [string, typeof Bell]> = { new: ["#b9b0f0", Star], order: ["#e2bf8e", Package], billing: ["#cfc8b4", CreditCard], feedback: ["#9fd0b6", MessageSquareText], other: ["#93a8dc", Bell] };
export function NotificationsPanel({ state, onClose }: P & { onClose: () => void }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = state.notifications.filter(n => n.unread).length;
  const list = state.notifications.filter(n => filter === "all" || n.unread);
  return <div className="v-menu wide x-np" role="dialog" aria-label="Notifications">
    <div className="x-nph"><b>Notifications</b>{unread > 0 && <button type="button" className="x-link" onClick={() => void state.markNotificationsRead()}>Mark all as read</button>}</div>
    <div className="x-nptabs" role="tablist">{(["all", "unread"] as const).map(k => <button type="button" role="tab" key={k} aria-selected={filter === k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{k === "all" ? "All" : "Unread"}{k === "unread" && unread > 0 && <em>{unread}</em>}</button>)}</div>
    <div className="x-nplist">{list.length ? list.slice(0, 20).map(n => { const [c, Icon] = KIND[kindOf(n)]; return <button type="button" key={n.id} className={`x-npit ${n.unread ? "un" : ""}`} style={{ ["--c" as string]: c }} onClick={() => { void state.markNotification(n.backendId); const k = kindOf(n); if (k === "order") { onClose(); state.navigate("cart"); } else if (k === "feedback") { onClose(); state.navigate("feedback"); } else if (k === "billing") { onClose(); try { sessionStorage.setItem("sf-acc-tab", "plan"); } catch { /* ignore */ } state.setAccountOpen(true); } }}><span className="x-npic"><Icon size={17} /></span><span className="x-nptx"><b>{n.title}</b><small>{n.message}</small><em>{n.time}</em></span></button>; })
      : <div className="x-npempty"><Bell size={26} /><b>You’re all caught up</b><small>New releases and updates will show up here.</small></div>}</div>
    <button type="button" className="x-npfoot" onClick={() => { onClose(); try { sessionStorage.setItem("sf-acc-tab", "notifications"); } catch { /* ignore */ } state.setAccountOpen(true); }}>Notification settings</button>
  </div>;
}

/* ================= MERCH PRODUCT WINDOW (size + quantity) ================= */
const SIZE_KEY = "streamflix-cart-sizes";
export const readSizes = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(SIZE_KEY) || "{}"); } catch { return {}; } };
const isApparel = (p: MerchProduct) => /apparel|shirt|hoodie|tee|jacket|clothing|wear/i.test(`${p.category} ${p.name}`);
export function ProductWindow({ state, product, onClose }: P & { product: MerchProduct; onClose: () => void }) {
  const inCart = state.cart[product.id] ?? 0; const left = Math.max(0, product.stockQuantity - inCart);
  const sizes = isApparel(product) ? ["XS", "S", "M", "L", "XL", "XXL"] : null;
  const [size, setSize] = useState<string | null>(readSizes()[product.id] ?? null);
  const [qty, setQty] = useState(1); const [err, setErr] = useState("");
  const out = product.stockStatus === "sold-out" || left === 0;
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; }; }, [onClose]);
  const add = (thenCart: boolean) => {
    if (sizes && !size) { setErr("Please choose a size."); return; }
    if (sizes && size) { const m = readSizes(); m[product.id] = size; try { localStorage.setItem(SIZE_KEY, JSON.stringify(m)); } catch { /* ignore */ } }
    state.setLocalCartQuantity(product.id, inCart + qty); onClose(); if (thenCart) state.navigate("cart");
  };
  return <div className="v-backdrop x-pmback" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="x-pm" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <button type="button" className="x-pmx" aria-label="Close" onClick={onClose}><X size={20} /></button>
      <div className="x-pmimg"><span className="x-pmcat">{product.category}</span><img src={product.image} alt={product.name} /></div>
      <div className="x-pmbody">
        <h2 id="pm-title">{product.name}</h2>
        <div className="x-pmprice">{peso(product.price)}</div>
        {product.stockLabel && <span className={`v-stock ${product.stockStatus === "sold-out" ? "out" : ""}`}>{product.stockLabel}</span>}
        <p className="x-pmdesc">Official StreamFlix {product.category.toLowerCase()} merchandise. Ships anywhere in the Philippines, or pick it up in store.</p>
        {sizes && <div className="x-pmsec"><div className="x-pmlab"><b>Size</b><small>Unisex fit</small></div><div className="x-sizes" role="radiogroup" aria-label="Size">{sizes.map(z => <button type="button" key={z} role="radio" aria-checked={size === z} className={size === z ? "on" : ""} onClick={() => { setSize(z); setErr(""); }}>{z}</button>)}</div>{err && <p className="x-pmerr" role="alert">⚠ {err}</p>}</div>}
        <div className="x-pmsec"><div className="x-pmlab"><b>Quantity</b><small>{out ? "Not available" : `${left} available`}</small></div>
          <div className="v-qty x-qty" role="group" aria-label="Quantity"><button type="button" aria-label="Decrease" disabled={qty <= 1} onClick={() => setQty(q => q - 1)}><Minus size={16} /></button><span aria-live="polite">{qty}</span><button type="button" aria-label="Increase" disabled={qty >= Math.min(10, left)} onClick={() => setQty(q => q + 1)}><Plus size={16} /></button></div></div>
        <div className="x-pmbtns"><button type="button" className="x-btn ghost" disabled={out} onClick={() => add(false)}><ShoppingBag size={17} />{out ? "Sold out" : `Add to cart · ${peso(product.price * qty)}`}</button><button type="button" className="x-btn" disabled={out} onClick={() => add(true)}>Buy now</button></div>
      </div>
    </div>
  </div>;
}
