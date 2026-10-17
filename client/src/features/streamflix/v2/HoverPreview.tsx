import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Play, Star } from "lucide-react";
import { TrailerPreview } from "@/features/movies/components/TrailerPreview";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { FavButton, ListButton, backdropOf, isSeries } from "./ui";

/* Desktop hover preview, as in the prototype: hovering a title card for ~0.55s opens a larger card
   with a muted trailer, Play / My List / Favorite / More info and the title's details. One at a time;
   it closes when the pointer leaves, on scroll, or when a dialog or the player opens. Touch devices skip it. */
const DELAY = 550;
export default function HoverPreview({ state }: { state: StreamFlixController }) {
  const [cur, setCur] = useState<{ id: number; rect: DOMRect } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const timer = useRef(0); const box = useRef<HTMLDivElement>(null);
  const hide = () => { window.clearTimeout(timer.current); setCur(null); setPos(null); };

  useEffect(() => {
    const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !canHover()) return;
      const card = (e.target as HTMLElement).closest?.("[data-card]") as HTMLElement | null;
      if (!card || card.closest(".v-detail,.v-preview")) return;
      const id = Number(card.dataset.card);
      if (cur?.id === id) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { const pst = card.querySelector(".v-pst") ?? card; const rect = pst.getBoundingClientRect(); if (rect.bottom < 0 || rect.top > window.innerHeight) return; setPos(null); setCur({ id, rect }); }, DELAY);
    };
    const out = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.("[data-card]");
      const to = e.relatedTarget as HTMLElement | null;
      if (card && !card.contains(to) && !to?.closest?.(".v-preview")) { window.clearTimeout(timer.current); if (cur && Number((card as HTMLElement).dataset.card) === cur.id) hide(); }
    };
    const scroll = () => hide();
    document.addEventListener("pointerover", over); document.addEventListener("pointerout", out);
    window.addEventListener("scroll", scroll, { passive: true }); document.addEventListener("scroll", scroll, { capture: true, passive: true });
    return () => { document.removeEventListener("pointerover", over); document.removeEventListener("pointerout", out); window.removeEventListener("scroll", scroll); document.removeEventListener("scroll", scroll, { capture: true }); };
  }, [cur]);
  useEffect(() => { if (state.detailOpen || state.watchOpen) hide(); }, [state.detailOpen, state.watchOpen]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!cur || !box.current) return;
    const w = box.current.offsetWidth, h = box.current.offsetHeight, r = cur.rect;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    const top = Math.max(76, Math.min(window.innerHeight - h - 12, r.top + r.height / 2 - h / 2));
    setPos({ left, top });
  }, [cur]);

  const item = cur ? state.catalog.find(c => c.id === cur.id) : undefined;
  if (!cur || !item) return null;
  return <div ref={box} className="v-preview" role="dialog" aria-label={`${item.title} preview`} style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 }}
    onPointerLeave={e => { const to = e.relatedTarget as HTMLElement | null; if (!to?.closest?.(`[data-card="${item.id}"]`)) hide(); }}>
    <div className="v-pv-media"><TrailerPreview key={item.id} url={item.trailerUrl} poster={item.preview ?? backdropOf(item)} title={item.title} delay={250} className="absolute inset-0" /><span className="v-pv-tag">Preview · muted</span></div>
    <div className="v-pv-body">
      <div className="v-pv-acts">
        <button type="button" className="v-circ play" aria-label={`Play ${item.title}`} onClick={() => { hide(); void state.play(item); }}><Play size={18} fill="currentColor" /></button>
        <ListButton state={state} item={item} /><FavButton state={state} item={item} />
        <button type="button" className="v-circ more" aria-label={`More info about ${item.title}`} onClick={() => { hide(); state.openTitle(item); }}><ChevronDown size={18} /></button>
      </div>
      <h3>{item.title}</h3>
      <div className="v-meta" style={{ margin: 0, fontSize: 12.5 }}>{item.reviewCount > 0 && <span className="v-rate"><Star size={12} fill="currentColor" />{item.rating.toFixed(1)}</span>}<span className="v-age">{item.maturity}</span><span>{isSeries(item) && /feature film/i.test(item.duration) ? "TV series" : item.duration}</span>{item.progress ? <span>{Math.round(item.progress)}% watched</span> : null}</div>
      <div className="v-pv-gen">{item.genre.split(/,\s*/).filter(Boolean).map(g => <span key={g}>{g}</span>)}<span>{isSeries(item) ? "Series" : "Movie"}</span></div>
    </div>
  </div>;
}
