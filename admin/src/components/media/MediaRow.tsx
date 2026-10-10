import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Content as ContentType } from "@/features/streamflix/types";
import { TitleCard } from "./TitleCard";

export function MediaRow({
  title,
  items,
  episodeLabels,
  onSelect,
}: {
  title: string;
  icon?: string;
  items: ContentType[];
  episodeLabels?: Record<number, string>;
  onSelect: (item: ContentType) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const landscape = title === "Continue Watching";
  const updateScrollState = () => {
    const row = rowRef.current;
    if (!row) return;
    setCanScrollLeft(row.scrollLeft > 8);
    setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 8);
  };
  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [items.length]);
  return (
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold sm:text-2xl">
          {title}
        </h2>
        <button
          type="button"
          onClick={() =>
            rowRef.current?.scrollBy({
              left: Math.max(rowRef.current.clientWidth * 0.85, 320),
              behavior: "smooth",
            })
          }
          aria-label={`See more ${title}`}
          className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-white"
        >
          See all <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() =>
              rowRef.current?.scrollBy({
                left: -Math.max(rowRef.current.clientWidth * 0.85, 320),
                behavior: "smooth",
              })
            }
            aria-label={`Scroll ${title} left`}
            className="absolute inset-y-0 left-0 z-20 hidden w-16 items-center bg-gradient-to-r from-[#070b1a]/95 via-[#070b1a]/65 to-transparent pl-1 sm:flex"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:bg-black/70">
              <ChevronLeft className="size-6" />
            </span>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() =>
              rowRef.current?.scrollBy({
                left: Math.max(rowRef.current.clientWidth * 0.85, 320),
                behavior: "smooth",
              })
            }
            aria-label={`Scroll ${title} right`}
            className="absolute inset-y-0 right-0 z-20 hidden w-16 items-center justify-end bg-gradient-to-l from-[#070b1a]/95 via-[#070b1a]/65 to-transparent pr-1 sm:flex"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:bg-black/70">
              <ChevronRight className="size-6" />
            </span>
          </button>
        )}
        <div
          ref={rowRef}
          onScroll={updateScrollState}
          className="scrollbar-none flex snap-x gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4"
        >
          {items.map((item) => (
            <TitleCard
              key={`${title}-${item.id}`}
              item={item}
              landscape={landscape}
              metaText={episodeLabels?.[item.id]}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
