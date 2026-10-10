import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, ListPlus, Play, Star, ChevronDown, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Content } from "@/features/streamflix/types";

import {TrailerPreview} from "./TrailerPreview";
import {PLAYER_EVENT,PREVIEW_EVENT} from "../utils/trailer";

const HOVER_DELAY = 420;
const CLOSE_DELAY = 140;
const HOVER_WIDTH_MULTIPLIER = 1.7;

export type TitleCardProps = {
  item: Content;
  landscape?: boolean;
  metaText?: string;
  onClick: () => void;
  onPlay?: () => void;
  onFavorite?: () => void;
  onWatchlist?: () => void;
  isFavorite?: boolean;
  isWatchlisted?: boolean;
};

type HoverPosition = { left: number; top: number; width: number };

export function TitleCard({
  item,
  landscape = false,
  metaText,
  onClick,
  onPlay,
  onFavorite,
  onWatchlist,
  isFavorite = false,
  isWatchlisted = false,
}: TitleCardProps) {

  const instance = useId();
  const cardRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [position, setPosition] = useState<HoverPosition | null>(null);

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const updatePosition = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width * HOVER_WIDTH_MULTIPLIER, 300), 420, window.innerWidth - 20);
    const margin = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = rect.left + (rect.width - width) / 2;
    left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

    // Prefer expanding upward when the lower half would be clipped.
    const panelHeight = Math.min(panelRef.current?.getBoundingClientRect().height ?? width * 9 / 16 + 220, viewportHeight - 24);
    let top = rect.top + (rect.height - panelHeight) / 2;
    if (rect.bottom + 16 + panelHeight <= viewportHeight) top = rect.top + Math.min(10, rect.height * 0.06);
    if (top + panelHeight > viewportHeight - margin) top = viewportHeight - panelHeight - margin;
    top = Math.max(margin, top);

    setPosition({ left, top, width });
  };

  const scheduleOpen = () => {
    clearTimers();
    updatePosition();
    openTimer.current = window.setTimeout(() => {
      updatePosition();
      window.dispatchEvent(new CustomEvent("streamflix:card-open", {detail: instance}));
      window.dispatchEvent(new CustomEvent(PREVIEW_EVENT, {detail: "hover-intent"}));
      setExpanded(true);
    }, HOVER_DELAY);
  };

  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = null;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setExpanded(false), CLOSE_DELAY);
  };

  const keepOpen = () => {
    // Do not update the portal position while the pointer is interacting with
    // the panel. Re-rendering/repositioning the portal during pointerdown can
    // replace the button under the pointer before its click event fires.
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const handleCardLeave = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && panelRef.current?.contains(nextTarget)) return;
    scheduleClose();
  };

  const handlePanelLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && cardRef.current?.contains(nextTarget)) return;
    scheduleClose();
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!expanded) return;
    const handleViewportChange = () => updatePosition();
    const handleScroll = () => { clearTimers(); setExpanded(false); };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [expanded]);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let exitTimer = 0;
    if (expanded) {
      setPanelMounted(true);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setPanelVisible(true));
      });
    } else {
      setPanelVisible(false);
      exitTimer = window.setTimeout(() => setPanelMounted(false), 320);
    }
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(exitTimer);
    };
  }, [expanded]);

  useEffect(() => {
    const stop = () => setExpanded(false);
    const otherPreview = (event: Event) => {if ((event as CustomEvent).detail !== instance) setExpanded(false);};
    const escape = (event: KeyboardEvent) => {if(event.key === "Escape")setExpanded(false);};
    window.addEventListener(PLAYER_EVENT,stop);window.addEventListener("streamflix:card-open",otherPreview);window.addEventListener("keydown",escape);
    return () => {window.removeEventListener(PLAYER_EVENT,stop);window.removeEventListener("streamflix:card-open",otherPreview);window.removeEventListener("keydown",escape);};
  }, [instance]);

  const poster = landscape ? item.preview ?? item.poster : item.poster;
  const meta = metaText ?? `${item.rating.toFixed(1)} ★ • ${item.year} • ${item.duration}`;

  const hoverPanel = panelMounted && position && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={panelRef}
          className="sf-title-preview sf-cinema-preview fixed z-[120] overflow-hidden rounded-lg border border-white/10 bg-[#090d20] text-white shadow-[0_30px_90px_rgba(0,0,0,.78)] ring-1 ring-black/30"
          data-visible={panelVisible ? "true" : "false"}
          inert={!expanded}
          style={{ left: position.left, top: position.top, width: position.width }}
          onPointerEnter={keepOpen}
          onPointerLeave={handlePanelLeave}
          onFocusCapture={keepOpen}
          role="region"
          aria-label={`${item.title} preview`}
        >
          <div className="relative aspect-video overflow-hidden">
            <TrailerPreview url={item.trailerUrl} poster={item.hero ?? item.preview ?? item.poster} title={item.title} active={expanded} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090d20] via-transparent to-black/10" />
            <span className="pointer-events-none absolute bottom-3 left-5 right-14 text-xl font-black leading-tight text-white drop-shadow-lg">{item.title}</span>
          </div>
          <div className="px-5 pb-5 pt-4">
            <div className="flex items-center gap-2">
              <button type="button" onPointerDown={keepOpen} onClick={(event) => { event.preventDefault(); event.stopPropagation(); keepOpen(); setExpanded(false); onPlay?.(); }} className="grid size-10 place-items-center rounded-full bg-white text-black transition hover:scale-105" aria-label={`Play ${item.title}`}>
                <Play className="size-4 fill-current" />
              </button>
              {onWatchlist && <button type="button" onPointerDown={keepOpen} onClick={(event) => { event.preventDefault(); event.stopPropagation(); keepOpen(); onWatchlist(); }} className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:scale-105 hover:bg-white/20" aria-pressed={isWatchlisted} aria-label={isWatchlisted ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}>
                {isWatchlisted ? <Check className="size-4 text-violet-300" /> : <ListPlus className="size-4" />}
              </button>}
              {onFavorite && <button type="button" onPointerDown={keepOpen} onClick={(event) => { event.preventDefault(); event.stopPropagation(); keepOpen(); onFavorite(); }} className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:scale-105 hover:bg-white/20" aria-pressed={isFavorite} aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}>
                <Heart className={`size-4 ${isFavorite ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>}
              <button type="button" onPointerDown={keepOpen} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onClick(); }} className="ml-auto grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20" aria-label={`More information about ${item.title}`}>
                <ChevronDown className="size-5" />
              </button>
            </div>
            <button type="button" onClick={onClick} className="mt-3 block w-full text-left">
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span>{item.type === "Series" ? "Show" : "Movie"}</span>
                <span>{item.year}</span>
                <span>{item.duration}</span>
                {item.maturity && <span className="rounded border border-white/25 px-1">{item.maturity}</span>}
              </div>
              <p className="mt-2 text-xs text-slate-300">{item.genre}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{item.description || item.synopsis}</p>

            </button>
            {Number(item.progress) > 0 && <Progress value={item.progress} className="mt-3 h-1 bg-white/20 [&_[data-slot=progress-indicator]]:bg-violet-500" />}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <article
      ref={cardRef}
      data-landscape={landscape} className={`sf-title-card group relative shrink-0 snap-start ${landscape ? "aspect-video w-[82vw] max-w-[350px] sm:w-[360px]" : "aspect-[2/3] w-[calc((100vw-3.5rem)/2)] sm:w-[185px]"}`}
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !(event.target as Element).closest(".sf-card-quick-actions")) scheduleOpen(); }}
      onPointerLeave={handleCardLeave}
      onFocusCapture={(event) => { if ((event.target as Element).closest(".sf-card-quick-actions")) { clearTimers(); setExpanded(false); } else if (cardRef.current?.contains(event.target as Node)) scheduleOpen(); }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !panelRef.current?.contains(event.relatedTarget as Node | null)) scheduleClose(); }}
    >
      <button
        type="button"
        onClick={onClick}
        className={`sf-card-art absolute inset-0 z-10 h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#10162f] text-left shadow-xl transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${expanded ? "scale-[1.02] border-violet-400/50" : "hover:border-violet-400/30"}`}
        aria-label={`More info about ${item.title}`}
      >
        <img src={poster} alt={`${item.title} ${landscape ? "preview" : "poster"}`} width={landscape ? 1280 : 520} height={landscape ? 720 : 780} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
        {!landscape && <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />}
        <span className="sf-card-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-3 pt-20">
          <span className="block truncate text-sm font-bold sm:text-base">{item.title}</span>
          <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-300"><span className="flex items-center gap-1 text-amber-300"><Star className="size-3 fill-current" />{item.rating.toFixed(1)}</span><span>{item.year}</span><span>{item.duration}</span></span>
          {Number(item.progress) > 0 && <Progress value={item.progress} className="mt-2 h-1 bg-white/25 [&_[data-slot=progress-indicator]]:bg-violet-500" />}
        </span>
      </button>
      {landscape && <div className="sf-card-caption"><h3>{item.title}</h3><p>{metaText || `${item.year} · ${item.genre} · ${item.type === "Series" ? "Series" : "Film"}`}</p>{Number(item.progress)>0&&<><Progress value={item.progress} className="mt-2 h-1 bg-white/15 [&_[data-slot=progress-indicator]]:bg-violet-400"/><span className="sf-progress-label">{Math.round(item.progress!)}% watched · Resume trailer</span></>}</div>}
      {onPlay && <button type="button" className="sf-mobile-quickplay" aria-label={`Play ${item.title}`} onClick={onPlay}><Play size={14} fill="currentColor" /></button>}
      <div className="sf-card-quick-actions" role="group" aria-label={`${item.title} actions`}>
        {onFavorite && <button type="button" aria-pressed={isFavorite} aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Favorite ${item.title}`} onPointerDown={event => {event.stopPropagation();clearTimers();setExpanded(false);}} onClick={event => {event.stopPropagation(); onFavorite();}}><Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} /></button>}
        {onWatchlist && <button type="button" aria-pressed={isWatchlisted} aria-label={isWatchlisted ? `Remove ${item.title} from watchlist` : `Save ${item.title} to watchlist`} onPointerDown={event => {event.stopPropagation();clearTimers();setExpanded(false);}} onClick={event => {event.stopPropagation(); onWatchlist();}}>{isWatchlisted ? <Check size={15}/> : <ListPlus size={15}/>}</button>}
      </div>
      {hoverPanel}
    </article>
  );
}
