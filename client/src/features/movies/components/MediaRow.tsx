import { useCarouselDrag } from "@/hooks/useCarouselDrag";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TitleCard } from "./TitleCard";
import type { Content } from "@/features/streamflix/types";

export type MediaRowProps = {
  title: string;
  emptyText?: string;
  items: Content[];
  episodeLabels?: Record<number, string>;
  onSelect: (item: Content) => void;
  onPlay?: (item: Content) => void;
  onFavorite?: (item: Content) => void;
  onWatchlist?: (item: Content) => void;
  favorites?: number[];
  watchlist?: number[];
};

export function MediaRow({ title, emptyText, items, episodeLabels, onSelect, onPlay, onFavorite, onWatchlist, favorites, watchlist }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  useCarouselDrag(rowRef);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const landscape = true;

  const updateScrollState = () => {
    const row = rowRef.current;
    if (!row) return;
    setCanScrollLeft(row.scrollLeft > 8);
    setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 8);
  };

  useEffect(() => {
    updateScrollState();
    const row = rowRef.current;
    const observer = row ? new ResizeObserver(updateScrollState) : null;
    if (row && observer) observer.observe(row);
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items.length]);

  const scroll = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * Math.max(row.clientWidth * 0.82, 320), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  if (!items.length) return emptyText ? <section className="sf-media-row sf-library-empty" aria-label={title}><h2 className="sf-row-heading">{title}</h2><p>{emptyText}</p></section> : null;

  return (
    <section data-resume={title === "Continue Watching"} data-short={items.length <= 3} className="sf-media-row mx-auto max-w-[1500px] px-4 sm:px-6" aria-label={title}>
      <div className="sf-row-header">
        <div>{title !== "Continue Watching" && <p className="sf-row-eyebrow">{title === "Continue Watching" ? "PICK UP WHERE YOU LEFT OFF" : title === "New Releases" ? "FRESH FINDS" : title === "Recommended For You" ? "CURATED FOR YOU" : "EXPLORE THE COLLECTION"}</p>}<h2 className="sf-row-heading">{title}</h2></div>{title !== "Continue Watching" && <span className="sf-row-count">{items.length} {items.length === 1 ? "title" : "titles"}</span>}
      </div>
      <div className="sf-carousel-shell relative -my-5" data-left={canScrollLeft} data-right={canScrollRight}>
        {canScrollLeft && <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="absolute inset-y-0 left-0 z-30 hidden w-20 items-center bg-gradient-to-r from-[#070b1a] via-[#070b1a]/70 to-transparent sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 shadow-xl backdrop-blur-md"><ChevronLeft className="size-5" /></span></button>}
        {canScrollRight && <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="absolute inset-y-0 right-0 z-30 hidden w-20 items-center justify-end bg-gradient-to-l from-[#070b1a] via-[#070b1a]/70 to-transparent sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 shadow-xl backdrop-blur-md"><ChevronRight className="size-5" /></span></button>}
        <div ref={rowRef} onScroll={updateScrollState} className="sf-carousel-track scrollbar-none flex snap-x gap-3 overflow-x-auto px-1 py-5 sm:gap-4 sm:px-2">
          {items.map((item) => (
            <TitleCard
              key={`${title}-${item.id}`}
              item={item}
              landscape={landscape}
              metaText={episodeLabels?.[item.id]}
              onClick={() => onSelect(item)}
              onPlay={() => onPlay?.(item)}
              onFavorite={() => onFavorite?.(item)}
              onWatchlist={() => onWatchlist?.(item)}
              isFavorite={favorites?.includes(item.id)}
              isWatchlisted={watchlist?.includes(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
