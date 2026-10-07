import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TitleCard } from "./TitleCard";
import type { Content } from "@/features/streamflix/types";

export type MediaRowProps = {
  title: string;
  items: Content[];
  episodeLabels?: Record<number, string>;
  onSelect: (item: Content) => void;
  onPlay?: (item: Content) => void;
  onFavorite?: (item: Content) => void;
  onWatchlist?: (item: Content) => void;
  favorites?: number[];
  watchlist?: number[];
};

export function MediaRow({ title, items, episodeLabels, onSelect, onPlay, onFavorite, onWatchlist, favorites, watchlist }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const landscape = title === "Continue Watching";

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
    row.scrollBy({ left: direction * Math.max(row.clientWidth * 0.82, 320), behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6" aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        <span className="hidden text-xs text-slate-500 sm:block">{items.length} titles</span>
      </div>
      <div className="relative -my-5">
        {canScrollLeft && <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`} className="absolute inset-y-0 left-0 z-30 hidden w-20 items-center bg-gradient-to-r from-[#070b1a] via-[#070b1a]/70 to-transparent sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 shadow-xl backdrop-blur-md"><ChevronLeft className="size-5" /></span></button>}
        {canScrollRight && <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`} className="absolute inset-y-0 right-0 z-30 hidden w-20 items-center justify-end bg-gradient-to-l from-[#070b1a] via-[#070b1a]/70 to-transparent sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/55 shadow-xl backdrop-blur-md"><ChevronRight className="size-5" /></span></button>}
        <div ref={rowRef} onScroll={updateScrollState} className="scrollbar-none flex snap-x gap-3 overflow-x-auto px-1 py-5 sm:gap-4 sm:px-2">
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
