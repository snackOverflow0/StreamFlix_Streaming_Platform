import MediaVisual from './MediaVisual';
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Content } from "../types";

export function Hero({ item, onPlay, onInfo }: { item: Content | null; onPlay: () => void; onInfo: () => void }) {
  if (!item) return <section className="min-h-[560px] bg-[#070b1a] sm:min-h-[760px]" />;
  return (
    <section className="relative min-h-[560px] pt-16 sm:min-h-[760px] sm:pt-[72px]">
      <MediaVisual src={item.hero ?? item.poster} poster={item.poster} alt={`${item.title} artwork`} className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b1a]/95 via-[#070b1a]/45 to-transparent sm:from-[#070b1a] sm:via-[#070b1a]/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b1a] via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[520px] max-w-[1500px] items-end px-5 pb-20 pt-14 sm:min-h-[650px] sm:items-center sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <Badge className="mb-5 border-violet-400/30 bg-violet-500/15 text-violet-200">{item.type} • {item.genre}</Badge>
          <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] min-[380px]:text-5xl sm:text-7xl">{item.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300 sm:mt-6">
            <span className="flex items-center gap-1 text-sky-300"><Star className="size-4 fill-current" /> {item.rating.toFixed(1)}</span>
            <span>{item.year}</span><span>{item.maturity}</span><span>{item.duration}</span>
          </div>
          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-7">{item.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Button onClick={onPlay} size="lg" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-white shadow-xl shadow-violet-900/30 sm:w-auto sm:px-7"><Play className="fill-current" /> Play now</Button>
            <Button onClick={onInfo} size="lg" variant="outline" className="w-full rounded-xl border-white/20 bg-black/35 px-4 text-white backdrop-blur hover:bg-white/10 hover:text-white sm:w-auto sm:px-7"><Info /> More info</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MediaRow({ title, items, episodeLabels, onSelect }: { title: string; icon?: string; items: Content[]; episodeLabels?: Record<number, string>; onSelect: (item: Content) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const landscape = title === "Continue Watching";
  const updateScrollState = () => { const row = rowRef.current; if (!row) return; setCanScrollLeft(row.scrollLeft > 8); setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 8); };
  useEffect(() => { updateScrollState(); window.addEventListener("resize", updateScrollState); return () => window.removeEventListener("resize", updateScrollState); }, [items.length]);
  return (
    <section className="mx-auto max-w-[1500px] px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold sm:text-xl">{title}</h2></div>
      <div className="relative">
        {canScrollLeft && <button type="button" onClick={() => rowRef.current?.scrollBy({ left: -Math.max(rowRef.current.clientWidth * 0.85, 320), behavior: "smooth" })} aria-label={`Scroll ${title} left`} className="absolute inset-y-0 left-0 z-20 hidden w-16 items-center bg-gradient-to-r from-[#070b1a]/95 via-[#070b1a]/65 to-transparent sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md"><ChevronLeft className="size-6" /></span></button>}
        {canScrollRight && <button type="button" onClick={() => rowRef.current?.scrollBy({ left: Math.max(rowRef.current.clientWidth * 0.85, 320), behavior: "smooth" })} aria-label={`Scroll ${title} right`} className="absolute inset-y-0 right-0 z-20 hidden w-16 items-center justify-end bg-gradient-to-l from-[#070b1a]/95 via-[#070b1a]/65 to-transparent pr-1 sm:flex"><span className="grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md"><ChevronRight className="size-6" /></span></button>}
        <div ref={rowRef} onScroll={updateScrollState} className="scrollbar-none flex snap-x gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4">{items.map((item) => <TitleCard key={`${title}-${item.id}`} item={item} landscape={landscape} metaText={episodeLabels?.[item.id]} onClick={() => onSelect(item)} />)}</div>
      </div>
    </section>
  );
}

export function TitleCard({ item, landscape = false, metaText, onClick }: { item: Content; landscape?: boolean; metaText?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`group relative shrink-0 snap-start overflow-hidden rounded-xl border border-white/8 bg-[#10162f] text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-950/40 ${landscape ? "aspect-video w-[78vw] max-w-[320px] sm:h-[205px] sm:w-[360px] sm:max-w-none" : "aspect-[2/3] w-[calc((100vw-3.5rem)/2)] sm:h-[310px] sm:w-[185px]"}`}>
      <MediaVisual src={landscape ? item.preview ?? item.poster : item.poster} poster={item.poster} alt={`${item.title} ${landscape ? "preview" : "poster"}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent ${landscape ? "opacity-90" : "opacity-75"}`} />
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-3 ${landscape ? "pt-14" : "pt-12"}`}>
        <p className="truncate font-semibold">{item.title}</p>
        <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-300">{metaText ?? `${item.rating.toFixed(1)} ★ • ${item.duration}`}</p>
        {Number(item.progress) > 0 && <Progress value={item.progress} className="mt-3 h-1 bg-white/30 [&_[data-slot=progress-indicator]]:bg-violet-500" />}
      </div>
    </button>
  );
}
