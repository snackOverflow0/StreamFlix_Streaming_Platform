import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Play, Plus, Star } from "lucide-react";
import type { Content } from "../types";
import type { StreamFlixController } from "../hooks/useStreamFlix";

export const peso = (n: number) => `₱${Number(n || 0).toLocaleString("en-PH")}`;
export const backdropOf = (item: Content) => item.hero ?? item.preview ?? item.poster;
export const isSeries = (item: Content) => item.type === "Series";

export function Meta({ item }: { item: Content }) {
  return <div className="v-meta">
    {item.reviewCount > 0 && <><span className="v-rate"><Star size={13} fill="currentColor" />{item.rating.toFixed(1)}</span><span className="sep" /></>}
    <span>{item.year}</span><span className="v-age">{item.maturity}</span>
    <span>{isSeries(item) && /feature film/i.test(item.duration) ? "TV series" : item.duration}</span>
    {item.genre && <><span className="sep" /><span>{item.genre}</span></>}
  </div>;
}

export function ListButton({ state, item }: { state: StreamFlixController; item: Content }) {
  const on = state.watchlist.includes(item.id);
  return <button type="button" className={`v-circ ${on ? "on" : ""}`} aria-pressed={on} aria-label={on ? "Remove from My List" : "Add to My List"} title="My List" onClick={e => { e.stopPropagation(); void state.toggleWatchlist(item.id); }}>{on ? <Check size={20} /> : <Plus size={20} />}</button>;
}
export function FavButton({ state, item }: { state: StreamFlixController; item: Content }) {
  const on = state.favorites.includes(item.id);
  return <button type="button" className={`v-circ fav ${on ? "on" : ""}`} aria-pressed={on} aria-label={on ? "Remove from Favorites" : "Add to Favorites"} title="Favorite" onClick={e => { e.stopPropagation(); void state.toggleFavorite(item.id); }}><Heart size={19} fill={on ? "currentColor" : "none"} /></button>;
}

export function PosterCard({ item, onOpen, tag, sub }: { item: Content; onOpen: (item: Content) => void; tag?: string; sub?: string }) {
  return <button type="button" className="v-card" data-card={item.id} onClick={() => onOpen(item)} aria-label={`${item.title}, ${item.year}`}>
    <span className="v-pst">{tag && <span className="v-tag">{tag}</span>}<img src={item.poster} alt="" loading="lazy" decoding="async" /></span>
    <span className="v-cap"><b>{item.title}</b><small>{sub ?? `${item.year} · ${isSeries(item) ? "Series" : "Movie"}`}</small></span>
  </button>;
}

export function LandCard({ item, onPlay, label }: { item: Content; onPlay: (item: Content) => void; label?: string }) {
  return <button type="button" className="v-card land" data-card={item.id} onClick={() => onPlay(item)} aria-label={`Resume ${item.title}`}>
    <span className="v-pst"><img src={item.preview ?? backdropOf(item)} alt="" loading="lazy" decoding="async" /><span className="v-playov"><span><Play size={20} fill="currentColor" /></span></span>{item.progress ? <span className="v-prog"><i style={{ width: `${Math.min(100, item.progress)}%` }} /></span> : null}</span>
    <span className="v-cap"><b>{item.title}</b><small>{label ?? (item.progress ? `${Math.round(item.progress)}% watched` : item.genre)}</small></span>
  </button>;
}

export function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ l: false, r: false });
  const update = () => { const el = ref.current; if (!el) return; setEdges({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }); };
  useEffect(() => { update(); const el = ref.current; if (!el) return; const ro = new ResizeObserver(update); ro.observe(el); return () => ro.disconnect(); }, []);
  const step = (d: number) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * .85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  /* Drag-to-scroll with a mouse (touch already scrolls natively). A drag never opens a card. */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const down = (e: RPointerEvent) => { if (e.pointerType !== "mouse" || !ref.current) return; drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }; };
  const move = (e: RPointerEvent) => { const d = drag.current, el = ref.current; if (!d || !el) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 5) { d.moved = true; el.classList.add("dragging"); } if (d.moved) el.scrollLeft = d.left - dx; };
  const up = () => { const el = ref.current; window.setTimeout(() => { drag.current = null; }, 0); el?.classList.remove("dragging"); };
  return <div className="v-rail-wrap">
    {edges.l && <button type="button" className="v-edge l" aria-label={`Scroll ${label} left`} onClick={() => step(-1)}><ChevronLeft size={30} /></button>}
    <div ref={ref} className="v-rail" onScroll={update} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onClickCapture={e => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); } }} onDragStart={e => e.preventDefault()}>{children}</div>
    {edges.r && <button type="button" className="v-edge r" aria-label={`Scroll ${label} right`} onClick={() => step(1)}><ChevronRight size={30} /></button>}
  </div>;
}

export function Row({ title, sub, items, onOpen, empty, onSeeAll }: { title: string; sub?: string; items: Content[]; onOpen: (item: Content) => void; empty?: string; onSeeAll?: () => void }) {
  if (!items.length && !empty) return null;
  return <section className="v-row" aria-label={title}>
    <div className="v-row-head"><h2>{title}</h2>{sub && <span className="sub">{sub}</span>}{onSeeAll && items.length > 0 && <button type="button" className="see" onClick={onSeeAll}>See all<ChevronRight size={15} /></button>}</div>
    {items.length ? <Rail label={title}>{items.map(item => <PosterCard key={item.id} item={item} onOpen={onOpen} />)}</Rail> : <p className="v-row-empty">{empty}</p>}
  </section>;
}

export function Stars({ value, onChange, size = 22 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return <div className="v-stars" role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} role="radio" aria-checked={value === n} className={value >= n ? "on" : ""} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}><Star size={size} /></button>)}</div>;
}

/* Breadcrumb trail shown above page titles: Home / Section / Page. */
export function Crumbs({ items, onGo }: { items: [string, (() => void) | null][]; onGo: () => void }) {
  return <nav className="v-crumbs" aria-label="Breadcrumb"><ol><li><button type="button" onClick={onGo}>Home</button></li>{items.map(([label, go], i) => <li key={label + i}><span aria-hidden="true">/</span>{go && i < items.length - 1 ? <button type="button" onClick={go}>{label}</button> : <span aria-current={i === items.length - 1 ? "page" : undefined}>{label}</span>}</li>)}</ol></nav>;
}
