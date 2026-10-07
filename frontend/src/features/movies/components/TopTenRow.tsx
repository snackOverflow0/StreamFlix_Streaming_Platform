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
      className="mx-auto max-w-[1500px] px-4 sm:px-6"
      aria-label="Top 10 on StreamFlix"
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.3em] text-violet-300">
            Top 10
          </p>
          <h2 className="mt-1 text-lg font-bold sm:text-xl">
            Top 10 on StreamFlix
          </h2>
        </div>
        <span className="hidden text-xs text-slate-500 sm:block">1–10 ranked titles</span>
      </div>

      <div className="relative -my-5">
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
          className="scrollbar-none flex snap-x gap-3 overflow-x-auto px-1 py-5 pr-4 sm:gap-4 sm:px-2"
        >
          {topTen.map((item, index) => (
            <div
              key={`top-ten-${item.id}`}
              className="relative min-w-0 shrink-0 snap-start pl-14 sm:pl-16"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-.2rem] left-0 z-0 select-none text-[8rem] font-black leading-[.72] tracking-[-.1em] text-white/[.16] sm:text-[10rem] lg:text-[11rem]"
              >
                {index + 1}
              </span>

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
