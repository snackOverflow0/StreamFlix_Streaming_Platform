import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Film, ListVideo, MessageSquareText, Search, ShoppingBag, X } from "lucide-react";
import { usePaymentAvailability } from "@/services/use-payment-availability";
import { getMyFeedback, type Feedback } from "@/services/feedback.service";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import type { Content } from "../types";
import { HeroCarousel } from "./Shell";
import { Crumbs, LandCard, PosterCard, Rail, Row, peso } from "./ui";

type P = { state: StreamFlixController };

export function HomePage({ state }: P) {
  const { sections, continueWatching, topTenItems, openTitle, play } = state;
  return <>
    <HeroCarousel state={state} />
    <div className="v-rows">
      {continueWatching.length > 0 && <section className="v-row" aria-label="Continue watching"><div className="v-row-head"><h2>Continue watching{state.activeProfile?.name ? ` for ${state.activeProfile.name}` : ""}</h2></div><Rail label="Continue watching">{continueWatching.map(item => <LandCard key={item.id} item={item} onPlay={i => void play(i)} />)}</Rail></section>}
      {sections.preTopSections.map(s => <Row key={s.title} title={s.title} items={s.items} onOpen={openTitle} />)}
      {topTenItems.length > 0 && <section className="v-row" aria-label="Top 10 today"><div className="v-row-head"><h2>Top 10 on StreamFlix</h2><span className="sub">{topTenItems.some(item => (item.weeklyViews ?? 0) > 0) ? "Based on this week’s viewing" : "Most watched"}</span></div><Rail label="Top 10">{topTenItems.map((item, n) => <div key={item.id} className="v-top"><span className="v-rank" aria-hidden="true">{n + 1}</span><PosterCard item={item} onOpen={openTitle} /></div>)}</Rail></section>}
      {sections.newReleases.length > 0 && <Row title="New releases" items={sections.newReleases} onOpen={openTitle} onSeeAll={() => state.navigate("new-releases")} />}
      {sections.genreSections.map(s => <Row key={`g-${s.title}`} title={s.title} items={s.items} onOpen={openTitle} />)}
    </div>
  </>;
}

function GridOrEmpty({ items, onOpen, empty, icon = Film }: { items: Content[]; onOpen: (i: Content) => void; empty: string; icon?: typeof Film }) {
  const Icon = icon;
  return items.length ? <div className="v-grid">{items.map(item => <PosterCard key={item.id} item={item} onOpen={onOpen} />)}</div>
    : <div className="v-empty"><span className="ic"><Icon size={28} /></span><b>{empty}</b></div>;
}

export function CatalogPage({ state }: P) {
  const [genre, setGenre] = useState("All");
  const isNew = state.view === "new-releases";
  const type = state.view === "shows" ? "Series" : state.view === "movies" ? "Movie" : null;
  const base = useMemo(() => isNew ? [...state.catalog].sort((a, b) => b.year - a.year) : state.catalog.filter(item => item.type === type), [state.catalog, type, isNew]);
  const genres = ["All", ...[...new Set(base.map(item => item.genre).filter(Boolean))].sort()];
  const list = genre === "All" ? base : base.filter(item => item.genre === genre);
  const title = isNew ? "New releases" : type === "Series" ? "TV shows" : "Movies";
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate('home')} items={[[title, null]]} />
    <div className="v-page-h"><h1>{title}</h1>{genres.length > 2 && <div className="v-chips" role="group" aria-label="Filter by genre">{genres.map(g => <button type="button" key={g} className={`v-chip ${genre === g ? "on" : ""}`} aria-pressed={genre === g} onClick={() => setGenre(g)}>{g}</button>)}</div>}</div>
    <GridOrEmpty items={list} onOpen={state.openTitle} empty="No titles in this genre yet" />
  </div>;
}

export function MyListPage({ state }: P) {
  const { watchlistItems, favoriteItems, continueWatching, recentlyWatched, openTitle, play } = state;
  const nothing = !watchlistItems.length && !favoriteItems.length && !continueWatching.length && !recentlyWatched.length;
  return <div className="v-page" style={{ paddingInline: 0 }}>
    <div style={{ paddingInline: 'var(--gutter)' }}><Crumbs onGo={() => state.navigate('home')} items={[['My List', null]]} /></div>
    <div className="v-page-h" style={{ paddingInline: "var(--gutter)" }}><h1>{state.activeProfile?.name ? `${state.activeProfile.name}’s list` : "My List"}</h1></div>
    {nothing ? <div className="v-empty"><span className="ic"><ListVideo size={28} /></span><b>Your list is empty</b><span>Tap + on any title to save it here.</span></div> : <>
      <Row title="Watchlist" items={watchlistItems} onOpen={openTitle} empty="Tap + on any title to add it here." />
      <Row title="Favorites" items={favoriteItems} onOpen={openTitle} empty="Tap the heart on a title to keep it here." />
      {continueWatching.length > 0 && <section className="v-row"><div className="v-row-head"><h2>Continue watching</h2></div><Rail label="Continue watching">{continueWatching.map(item => <LandCard key={item.id} item={item} onPlay={i => void play(i)} />)}</Rail></section>}
      <Row title="Recently watched" items={recentlyWatched} onOpen={openTitle} />
    </>}
  </div>;
}

export function SearchPage({ state }: P) {
  const [draft, setDraft] = useState(state.query);
  const [type, setType] = useState<"All" | "Movie" | "Series">("All");
  useEffect(() => { const t = window.setTimeout(() => state.setQuery(draft.trim().slice(0, 55)), 250); return () => window.clearTimeout(t); }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = state.query.toLowerCase();
  const res = q ? state.catalog.filter(item => `${item.title} ${item.genre} ${(item.cast ?? []).join(" ")} ${item.director ?? ""}`.toLowerCase().includes(q)).filter(item => type === "All" || item.type === type) : [];
  const popular = state.topTenItems.slice(0, 12);
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate('home')} items={[['Search', null]]} />
    <label className="v-search"><Search size={22} /><input autoFocus value={draft} onChange={e => setDraft(e.target.value)} placeholder="Search titles, genres or cast" aria-label="Search" autoComplete="off" maxLength={55} />{draft && <button type="button" className="v-ib" aria-label="Clear search" onClick={() => setDraft("")}><X size={18} /></button>}</label>
    <div className="v-search-hint"><span>Search by title, genre, cast or director</span><span>{draft.length}/55</span></div>
    <div className="v-chips" style={{ marginBottom: 22 }} role="group" aria-label="Type">{(["All", "Movie", "Series"] as const).map(k => <button type="button" key={k} className={`v-chip ${type === k ? "on" : ""}`} onClick={() => setType(k)}>{k === "Series" ? "TV Shows" : k === "Movie" ? "Movies" : "All"}</button>)}</div>
    {!q ? <><h2 className="v-section-t" style={{ marginTop: 0 }}>Popular searches</h2><GridOrEmpty items={popular} onOpen={state.openTitle} empty="Nothing to show yet" /></>
      : res.length ? <><p style={{ color: "var(--t3)", fontWeight: 700, marginBottom: 14 }}>{res.length} result{res.length > 1 ? "s" : ""} for “{state.query}”</p><GridOrEmpty items={res} onOpen={state.openTitle} empty="" /></>
        : <div className="v-empty"><span className="ic"><Search size={28} /></span><b>No matches for “{state.query}”</b><span>Try a title, a genre, or an actor’s name.</span></div>}
  </div>;
}

export function StorePage({ state }: P) {
  const { products, cart, cartCount, addToCart } = state;
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate('home')} items={[['Merch hub', null]]} />
    <div className="v-page-h"><div><h1>Merch hub</h1><p>Official StreamFlix merchandise</p></div>{cartCount > 0 && <button type="button" className="v-btn v-glass sm" onClick={() => state.navigate("cart")}><ShoppingBag size={17} />View cart · {cartCount}</button>}</div>
    {products.length ? <div className="v-merch">{products.map(p => {
      const out = p.stockStatus === "sold-out"; const inCart = cart[p.id] ?? 0;
      return <article key={p.id}>
        <span className="v-merch-art"><img src={p.image} alt={p.name} loading="lazy" decoding="async" /></span>
        <p className="cat">{p.category}</p>
        <div className="v-cap"><b>{p.name}</b><span className="price">{peso(p.price)}</span></div>
        {p.stockLabel && <span className={`v-stock ${out ? "out" : ""}`}>{p.stockLabel}</span>}
        <button type="button" className="v-btn v-glass sm" disabled={out || inCart >= p.stockQuantity} onClick={() => addToCart(p.id)}><ShoppingBag size={17} />{out ? "Sold out" : inCart ? `In cart · ${inCart}` : "Add to cart"}</button>
      </article>;
    })}</div> : <div className="v-empty"><span className="ic"><ShoppingBag size={28} /></span><b>No merchandise yet</b></div>}
  </div>;
}

const DELIVERY = ["Standard Delivery (3-5 days)", "Store Pickup"];
const statusTone = (s: string) => s === "Completed" ? "ok" : s === "Cancelled" ? "bad" : "";

export function CartPage({ state }: P) {
  const { cartItems, cart, total, transactions, setLocalCartQuantity, checkout } = state;
  const availability = usePaymentAvailability();
  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState("Cash on Delivery");
  const [delivery, setDelivery] = useState(DELIVERY[0]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { void state.loadTransactions(); }, [state.currentUserId, state.activeProfile?.backendId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function submit() {
    if (!name.trim() || !phone.trim() || (delivery !== "Store Pickup" && !address.trim())) { setError("Please complete your delivery information."); return; }
    try { setBusy(true); setError(""); await checkout(payment, delivery, { name, phone, address }); setOpen(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Checkout failed"); } finally { setBusy(false); }
  }
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate('home')} items={[['Merch hub', () => state.navigate('store')], ['Cart', null]]} />
    <div className="v-page-h"><h1>Your cart</h1><button type="button" className="v-btn v-glass sm" onClick={() => state.navigate("store")}>Continue shopping</button></div>
    <div className="v-two">
      <div>{cartItems.length ? <div className="v-cart-list">{cartItems.map(p => { const q = cart[p.id] ?? 1; return <div key={p.id} className="v-cart-row">
        <span className="v-cart-th"><img src={p.image} alt="" /></span>
        <div className="v-cart-info"><b>{p.name}</b><small>{peso(p.price)} each</small></div>
        <div className="v-qty" role="group" aria-label={`Quantity for ${p.name}`}><button type="button" aria-label="Decrease" onClick={() => setLocalCartQuantity(p.id, q - 1)}>−</button><span>{q}</span><button type="button" aria-label="Increase" disabled={q >= p.stockQuantity} onClick={() => setLocalCartQuantity(p.id, Math.min(p.stockQuantity, q + 1))}>+</button></div>
        <b className="v-cart-amt">{peso(p.price * q)}</b>
        <button type="button" className="v-ib" aria-label={`Remove ${p.name}`} onClick={() => setLocalCartQuantity(p.id, 0)}><X size={17} /></button>
      </div>; })}</div>
        : <div className="v-empty"><span className="ic"><ShoppingBag size={28} /></span><b>Your cart is empty</b><span>Add something from the Merch hub.</span><button type="button" className="v-btn v-glass sm" onClick={() => state.navigate("store")}>Browse merch</button></div>}</div>
      <aside className="v-panel">
        <h3>Order summary</h3>
        <div className="v-sum-line"><span>Items</span><b>{state.cartCount}</b></div>
        <hr />
        <div className="v-sum-line tot"><span>Total</span><b>{peso(total)}</b></div>
        <button type="button" className="v-btn v-play" style={{ width: "100%" }} disabled={!cartItems.length} onClick={() => setOpen(true)}><CreditCard size={18} />Checkout</button>
        <small>Pay by card through Stripe, or Cash on Delivery.</small>
        {transactions.length > 0 && <div><h3 style={{ marginTop: 6 }}>Your orders</h3>{transactions.slice(0, 5).map(tx => <div key={tx.id} className="v-order"><div><b>Order {tx.id}</b><span className={`v-st ${statusTone(tx.status)}`}>{tx.status}</span></div><small>{tx.paymentMethod} · {tx.deliveryMethod}</small><b>{peso(tx.total)}</b></div>)}</div>}
      </aside>
    </div>
    {open && createPortal(<div className="v-app v-backdrop v-checkout-backdrop" onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false); }}>
      <div className="v-dialog" role="dialog" aria-modal="true" aria-labelledby="co-t">
        <h2 id="co-t">Checkout</h2>
        <div style={{ display: "grid", gap: 8 }}><span className="v-label">Payment</span>{["Card", "Cash on Delivery"].map(m => { const dis = m === "Card" && !availability.card; return <label key={m} className={`v-radio ${payment === m ? "on" : ""}`} style={dis ? { opacity: .5 } : undefined}><input type="radio" name="pay" checked={payment === m} disabled={dis} onChange={() => setPayment(m)} />{m === "Card" ? (availability.card ? "Credit / Debit card via Stripe" : "Card checkout unavailable") : m}</label>; })}</div>
        <div style={{ display: "grid", gap: 8 }}><span className="v-label">Delivery</span>{DELIVERY.map(m => <label key={m} className={`v-radio ${delivery === m ? "on" : ""}`}><input type="radio" name="del" checked={delivery === m} onChange={() => setDelivery(m)} />{m}</label>)}</div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <input className="v-input" value={name} onChange={e => setName(e.target.value)} placeholder="Recipient name" aria-label="Recipient name" />
          <input className="v-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" aria-label="Phone number" inputMode="tel" />
          <input className="v-input" style={{ gridColumn: "1 / -1" }} value={address} onChange={e => setAddress(e.target.value)} placeholder={delivery === "Store Pickup" ? "Pickup notes (optional)" : "Complete delivery address"} aria-label="Address" />
        </div>
        {error && <p className="v-err">{error}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" className="v-btn v-glass sm" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="v-btn v-play sm" disabled={busy || (payment === "Card" && !availability.card)} onClick={() => void submit()}>{busy ? "Processing…" : payment === "Card" ? `Continue to Stripe · ${peso(total)}` : `Place order · ${peso(total)}`}</button>
        </div>
      </div>
    </div>, document.body)}
  </div>;
}

const TOPICS: [string, string][] = [["general", "Suggestion"], ["bug", "Bug or problem"], ["playback", "Playback"], ["billing", "Billing"], ["other", "Other"]];
const topicLabel = (t: string) => TOPICS.find(([k]) => k === t)?.[1] ?? "General";
const fbTone = (s: string) => /resolv|done|closed/i.test(s) ? "ok" : "";
const cap = (s: string) => s ? s[0].toUpperCase() + s.slice(1).replace(/_/g, " ") : s;

export function FeedbackPage({ state }: P) {
  const [type, setType] = useState("general");
  const [subject, setSubject] = useState(""); const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Feedback[] | null>(null);
  const uid = state.currentUserId;
  const load = () => { if (uid) getMyFeedback(uid).then(setHistory).catch(() => setHistory([])); };
  useEffect(load, [uid]); // eslint-disable-line react-hooks/exhaustive-deps
  async function send(e: FormEvent) {
    e.preventDefault(); if (!subject.trim() || !message.trim()) return;
    setBusy(true);
    try { if (await state.submitFeedback(subject.trim(), message.trim(), type)) { setSubject(""); setMessage(""); load(); } } finally { setBusy(false); }
  }
  return <div className="v-page">
    <Crumbs onGo={() => state.navigate('home')} items={[['Account', null], ['Send feedback', null]]} />
    <div className="v-page-h"><div><h1>Send feedback</h1><p>Tell us what could make StreamFlix better.</p></div></div>
    <div className="v-two">
      <form className="v-form" onSubmit={send}>
        <span className="v-label">Topic</span>
        <div className="v-chips">{TOPICS.map(([k, l]) => <button type="button" key={k} className={`v-chip ${type === k ? "on" : ""}`} aria-pressed={type === k} onClick={() => setType(k)}>{l}</button>)}</div>
        <label htmlFor="fb-s">Subject</label>
        <input id="fb-s" className="v-input" maxLength={120} value={subject} disabled={busy} onChange={e => setSubject(e.target.value)} placeholder="A short summary" />
        <label htmlFor="fb-m">Message</label>
        <textarea id="fb-m" className="v-text" rows={6} maxLength={2000} value={message} disabled={busy} onChange={e => setMessage(e.target.value)} placeholder="Tell us what happened or what we can improve" />
        <div className="v-hint"><span>We’ll confirm once it’s received.</span><span>{message.length}/2000</span></div>
        <button type="submit" className="v-btn v-play sm" style={{ justifySelf: "start" }} disabled={busy || !subject.trim() || !message.trim()}><MessageSquareText size={17} />{busy ? "Sending…" : "Send feedback"}</button>
      </form>
      <aside className="v-panel">
        <h3>Your feedback</h3>
        {history === null ? <div className="v-sk" style={{ height: 80 }} /> : history.length ? history.slice(0, 6).map(f => <div key={f.feedback_id} className="v-fb-item"><div><b>{f.subject}</b><span className={`v-st ${fbTone(f.status)}`}>{cap(f.status)}</span></div><p>{f.message}</p><small>{topicLabel(f.type)} · {new Date(f.created_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</small></div>) : <p style={{ color: "var(--t3)" }}>Nothing sent yet.</p>}
      </aside>
    </div>
  </div>;
}
