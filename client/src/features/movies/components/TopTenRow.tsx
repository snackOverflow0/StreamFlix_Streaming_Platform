import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TitleCard } from "./TitleCard";
import type { Content } from "@/features/streamflix/types";

export type TopTenRowProps = {
  items: Content[];
  onSelect: (item: Content) => void;
  onPlay?: (item: Content) => void;
  onFavorite?: (item: Content) => void;
  onWatchlist?: (item: Content) => void;
  favorites?: number[];
  watchlist?: number[];
};

export function TopTenRow({
  items,
  onSelect,
  onPlay,
  onFavorite,
  onWatchlist,
  favorites = [],
  watchlist = [],
}: TopTenRowProps) {
  const topTen = items.slice(0, 10);
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [topTen.length]);

  if (topTen.length === 0) return null;

  const scroll = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({
      left: direction * Math.max(row.clientWidth * 0.82, 320),
      behavior: "smooth",
    });
  };

  return (
    <section
      className="sf-top-ten-section mx-auto max-w-[1500px] px-4 sm:px-6"
      aria-label="Top 10 on StreamFlix"
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="sf-row-eyebrow">THE COMMUNITY’S FAVORITES</p><h2 className="sf-row-heading">
            Top 10 on StreamFlix
          </h2>
          <p className="mb-3 text-xs text-slate-500">{items.some(item=>(item.weeklyViews??0)>0) ? "Based on this week’s viewing activity" : "Community picks · ranked by ratings and reviews"}</p>
        </div>
      </div>

      <div className="sf-top-ten-wrap relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll Top 10 left"
            className="absolute inset-y-0 left-0 z-40 hidden w-20 items-center bg-gradient-to-r from-[#070b1a] via-[#070b1a]/80 to-transparent sm:flex"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/60 shadow-xl backdrop-blur-md">
              <ChevronLeft className="size-5" />
            </span>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll Top 10 right"
            className="absolute inset-y-0 right-0 z-40 hidden w-20 items-center justify-end bg-gradient-to-l from-[#070b1a] via-[#070b1a]/80 to-transparent sm:flex"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/60 shadow-xl backdrop-blur-md">
              <ChevronRight className="size-5" />
            </span>
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={updateScrollState}
          className="sf-top-ten-scroll scrollbar-none flex snap-x gap-3 overflow-x-auto overflow-y-hidden px-1 py-5 pr-4 sm:gap-4 sm:px-2"
        >
          {topTen.map((item, index) => (
            <div
              key={`top-ten-${item.id}`}
              data-rank={index + 1}
              className="sf-ranked-card relative min-w-0 shrink-0 snap-start pl-14 sm:pl-16"
            >
              {index === 0 || index === 9 ? (
                <svg aria-hidden="true" viewBox={index === 9 ? "0 0 240 280" : "0 0 108 280"} className="sf-rank-number sf-rank-svg pointer-events-none absolute bottom-0 left-0 z-0 select-none">
                  <path d="M8 28 L98 5 L98 274 L40 274 L40 79 L8 89 Z" />
                  {index === 9 && <path fillRule="evenodd" d="M163 5 C106 5 83 63 83 140 C83 217 106 274 163 274 C220 274 239 217 239 140 C239 63 220 5 163 5 Z M163 63 C182 63 186 93 186 140 C186 187 182 216 163 216 C144 216 138 187 138 140 C138 93 144 63 163 63 Z" />}
                </svg>
              ) : (
                <span aria-hidden="true" className="sf-rank-number pointer-events-none absolute bottom-0 left-0 z-0 select-none">{index + 1}</span>
              )}

              
      <div className="relative z-10">
                <TitleCard
                  item={item}
                  onClick={() => onSelect(item)}
                  onPlay={() => onPlay?.(item)}
                  onFavorite={() => onFavorite?.(item)}
                  onWatchlist={() => onWatchlist?.(item)}
                  isFavorite={favorites.includes(item.id)}
                  isWatchlisted={watchlist.includes(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
