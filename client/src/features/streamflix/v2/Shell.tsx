import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard, House, Info, ListVideo, LogOut, MessageSquareText, Play, Search, ShoppingBag, UserRound } from "lucide-react";
import { usePlatform } from "@/services/platform";
import { backendAsset } from "@/lib/backend-asset";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import type { Content, View } from "../types";
import { FavButton, ListButton, Meta, backdropOf, isSeries } from "./ui";

const LINKS: [View, string][] = [["home", "Home"], ["movies", "Movies"], ["shows", "TV Shows"], ["my-list", "My List"], ["store", "Merch"]];

export function Nav({ state }: { state: StreamFlixController }) {
  const platform = usePlatform();
  const [solid, setSolid] = useState(false);
  useEffect(() => { const u = () => setSolid(window.scrollY > 40); u(); window.addEventListener("scroll", u, { passive: true }); return () => window.removeEventListener("scroll", u); }, []);
  const { view, navigate, cartCount, activeProfile } = state;
  const [menu, setMenu] = useState<"" | "me" | "notes">("");
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".v-menu,[data-menu]")) setMenu(""); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(""); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key); };
  }, [menu]);
  const unread = state.notifications.filter(n => n.unread).length;
  const pick = (fn: () => void) => () => { setMenu(""); fn(); };
  return <><header className={`v-nav ${solid || view !== "home" || menu ? "solid" : ""}`}>
    <button type="button" className="v-logo" onClick={() => navigate("home")} aria-label={`${platform.platformName} home`}><img src={backendAsset("/streamflix/logo-optimized.webp")} alt="" width={34} height={34} />{platform.platformName.toLowerCase()}</button>
    <nav className="v-links" aria-label="Main">{LINKS.map(([k, l]) => <button type="button" key={k} className={view === k ? "on" : ""} aria-current={view === k ? "page" : undefined} onClick={() => navigate(k)}>{l}</button>)}</nav>
    <div className="v-act">
      <button type="button" className="v-ib" aria-label="Search" onClick={() => navigate("search")}><Search size={19} /></button>
      <button type="button" className="v-ib" aria-label={`Cart, ${cartCount} items`} onClick={() => navigate("cart")}><ShoppingBag size={19} />{cartCount > 0 && <span className="v-count">{cartCount}</span>}</button>
      <button type="button" className="v-ib" data-menu aria-haspopup="menu" aria-expanded={menu === "notes"} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} onClick={() => setMenu(m => m === "notes" ? "" : "notes")}><Bell size={19} />{unread > 0 && <span className="v-dot" />}</button>
      <button type="button" className="v-me" data-menu aria-haspopup="menu" aria-expanded={menu === "me"} aria-label={`Profile: ${activeProfile?.name ?? "Viewer"}`} onClick={() => setMenu(m => m === "me" ? "" : "me")}><img src={activeProfile?.image ?? backendAsset("/streamflix/logo.png")} alt="" width={34} height={34} /><ChevronDown size={14} /></button>
    </div>
  </header>
    {menu && <div className="v-scrim" onClick={() => setMenu("")} />}
    {menu === "me" && <div className="v-menu" role="menu">
      <h4>Switch profile</h4>
      {state.profiles.map(p => { const on = p.backendId === activeProfile?.backendId; return <button type="button" key={p.id} role="menuitemradio" aria-checked={on} className={`row ${on ? "on" : ""}`} onClick={pick(() => { if (!on) state.selectProfile(p); })}><img className="pav" src={p.image} alt="" /><span>{p.name}<small>{p.isKids ? "Kids profile · G and PG only" : p.deviceName || "Member profile"}</small></span>{p.isKids ? <span className="v-kid">KIDS</span> : on ? <span style={{ marginLeft: "auto", color: "var(--violet)" }}><Check size={16} /></span> : null}</button>; })}
      <button type="button" className="row" onClick={pick(() => state.setAuthStage("profiles"))}><UserRound size={17} />Manage profiles</button>
      <hr />
      <button type="button" className="row" onClick={pick(() => state.setAccountOpen(true))}><UserRound size={17} />Account</button>
      <button type="button" className="row" onClick={pick(() => state.setPlansOpen(true))}><CreditCard size={17} />Subscription<small style={{ marginLeft: "auto" }}>{state.currentPlan?.name ?? ""}</small></button>
      <button type="button" className="row" onClick={pick(() => state.navigate("feedback"))}><MessageSquareText size={17} />Send feedback</button>
      <button type="button" className="row" onClick={pick(() => void state.logout())}><LogOut size={17} />Sign out</button>
    </div>}
    {menu === "notes" && <div className="v-menu wide" role="menu">
      <div className="v-menu-h"><h4>Notifications{unread ? ` · ${unread} new` : ""}</h4>{unread > 0 && <button type="button" onClick={() => void state.markNotificationsRead()}>Mark all read</button>}</div>
      {state.notifications.length ? state.notifications.slice(0, 8).map(n => <button type="button" key={n.id} className={`row note ${n.unread ? "unread" : ""}`} onClick={() => void state.markNotification(n.backendId)}><i /><span>{n.title}<small>{n.message}</small><small className="t">{n.time}</small></span></button>) : <p className="v-menu-empty">You’re all caught up.</p>}
    </div>}
  </>;
}

export function BottomBar({ state }: { state: StreamFlixController }) {
  const items: [View, typeof House, string][] = [["home", House, "Home"], ["search", Search, "Search"], ["my-list", ListVideo, "My List"], ["store", ShoppingBag, "Merch"]];
  return <nav className="v-bbar" aria-label="Quick">{items.map(([k, Icon, l]) => <button type="button" key={k} className={state.view === k || (k === "store" && state.view === "cart") ? "on" : ""} onClick={() => state.navigate(k)}><Icon size={21} />{l}{k === "store" && state.cartCount > 0 && <span className="v-count">{state.cartCount}</span>}</button>)}</nav>;
}

export function Footer({ state }: { state: StreamFlixController }) {
  const platform = usePlatform();
  return <footer className="v-foot">
    <button type="button" onClick={() => state.setPlansOpen(true)}>Plans</button>
    <button type="button" onClick={() => state.setAuthStage("profiles")}>Profiles</button>
    <button type="button" onClick={() => state.navigate("feedback")}>Send feedback</button>
    <button type="button" onClick={() => state.setFooterPanel("help")}>Help center</button>
    <button type="button" onClick={() => state.setFooterPanel("accessibility")}>Accessibility</button>
    <button type="button" onClick={() => state.setFooterPanel("legal")}>Legal</button>
    <span>© {new Date().getFullYear()} {platform.platformName}{state.visitorCount ? ` · ${state.visitorCount.toLocaleString()} visitors` : ""}</span>
  </footer>;
}

/* Cinematic carousel: featured titles from Supabase (is_featured), else the top-ranked titles.
   Auto-advances every 7s; pauses on hover, keyboard focus, hidden tab, open dialogs or reduced motion. */
const SLIDE_MS = 7000;
export function HeroCarousel({ state }: { state: StreamFlixController }) {
  const slides = useMemo(() => {
    const featured = state.catalog.filter(item => item.isFeatured);
    const pool = featured.length >= 3 ? featured : [...featured, ...state.topTenItems.filter(item => !item.isFeatured)];
    return pool.slice(0, 6);
  }, [state.catalog, state.topTenItems]);
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const touch = useRef<number | null>(null);
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true, []);
  const paused = hover || focus || hidden || state.detailOpen || state.watchOpen || reduce;
  const len = slides.length;
  const go = (n: number) => len && setI((n + len) % len);
  useEffect(() => { const v = () => setHidden(document.hidden); document.addEventListener("visibilitychange", v); return () => document.removeEventListener("visibilitychange", v); }, []);
  useEffect(() => { if (paused || len < 2) return; const t = window.setTimeout(() => setI(n => (n + 1) % len), SLIDE_MS); return () => window.clearTimeout(t); }, [i, paused, len]);
  useEffect(() => { if (i >= len) setI(0); }, [len, i]);
  if (!len) return <section className="v-hero"><div className="v-hero-empty">Featured titles will appear here.</div></section>;
  const cur: Content = slides[Math.min(i, len - 1)];
  return <section className={`v-hero ${hover || focus ? "paused" : ""}`} role="region" aria-roledescription="carousel" aria-label="Featured titles"
    onPointerEnter={e => { if (e.pointerType === "mouse") setHover(true); }} onPointerLeave={() => setHover(false)}
    onFocus={() => setFocus(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
    onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); }}
    onKeyDown={e => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}>
    {slides.map((s, n) => <div key={s.id} className={`v-slide ${n === i ? "on" : ""}`} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${len}: ${s.title}`} aria-hidden={n !== i}><img src={backdropOf(s)} alt="" loading={n === 0 ? "eager" : "lazy"} decoding="async" /></div>)}
    <div className="v-copy" key={cur.id}>
      <span className="v-eyebrow"><i />{cur.isFeatured ? (isSeries(cur) ? "StreamFlix series" : "Featured film") : "Trending now"}</span>
      <h1>{cur.title}</h1>
      <Meta item={cur} />
      <p className="v-syn">{cur.description || cur.synopsis}</p>
      <div className="v-actions">
        <button type="button" className="v-btn v-play" disabled={state.playbackBusy} onClick={() => void state.play(cur)}><Play size={20} fill="currentColor" />{cur.progress && cur.progress < 100 ? "Resume" : "Play"}</button>
        <button type="button" className="v-btn v-glass" onClick={() => state.openTitle(cur)}><Info size={19} />More info</button>
        <ListButton state={state} item={cur} /><FavButton state={state} item={cur} />
      </div>
    </div>
    {len > 1 && <div className="v-ctrl">
      <button type="button" className="v-arrow" aria-label="Previous title" onClick={() => go(i - 1)}><ChevronLeft size={20} /></button>
      <div className="v-dots" style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms` }}>{slides.map((s, n) => <button type="button" key={`${s.id}-${n === i ? i : "x"}`} className={n === i ? "on" : ""} aria-label={`Show ${s.title}`} aria-current={n === i} onClick={() => go(n)}><i /></button>)}</div>
      <button type="button" className="v-arrow" aria-label="Next title" onClick={() => go(i + 1)}><ChevronRight size={20} /></button>
    </div>}
  </section>;
}
