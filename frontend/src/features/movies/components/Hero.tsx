import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, ListPlus, Play, Star } from "lucide-react";
import type { Content } from "@/features/streamflix/types";

export function Hero({ item, onPlay, onInfo, onWatchlist, isWatchlisted }: { item: Content | null; onPlay: () => void; onInfo: () => void; onWatchlist?: () => void; isWatchlisted?: boolean }) {
  if (!item) {
    return <section className="min-h-[600px] animate-pulse bg-[#070b1a] sm:min-h-[760px]" aria-label="Loading hero" />;
  }

  return (
    <section className="relative min-h-[600px] overflow-hidden pt-16 sm:min-h-[780px] sm:pt-[72px]">
      <img src={item.hero ?? item.poster} alt={`${item.title} artwork`} width={1600} height={900} loading="eager" decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,transparent_0%,rgba(7,11,26,.08)_32%,rgba(7,11,26,.82)_88%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b1a] via-[#070b1a]/72 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b1a] via-transparent to-[#070b1a]/10" />
      <div className="relative mx-auto flex min-h-[560px] max-w-[1500px] items-end px-5 pb-20 pt-14 sm:min-h-[680px] sm:items-center sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <Badge className="mb-5 border-white/15 bg-white/10 text-white backdrop-blur-md">{item.type}</Badge>
          <h1 className="max-w-2xl text-5xl font-black leading-[.9] tracking-[-.05em] text-white sm:text-7xl lg:text-8xl">{item.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-200 sm:mt-7">
            <span className="flex items-center gap-1 text-amber-300"><Star className="size-4 fill-current" /> {item.rating.toFixed(1)}</span>
            <span>{item.year}</span><span>{item.maturity}</span><span>{item.duration}</span><span>{item.genre}</span>
          </div>
          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-7">{item.description || item.synopsis}</p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Button onClick={onPlay} size="lg" className="rounded-md bg-white px-6 font-bold text-black hover:bg-slate-200"><Play className="fill-current" /> Play</Button>
            <Button onClick={onInfo} size="lg" variant="outline" className="rounded-md border-white/20 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"><Info /> More Info</Button>
            {onWatchlist && <Button onClick={onWatchlist} size="lg" variant="outline" className="rounded-md border-white/20 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/20 hover:text-white"><ListPlus /> {isWatchlisted ? "In My List" : "My List"}</Button>}
          </div>
        </div>
      </div>
    </section>
  );
}
