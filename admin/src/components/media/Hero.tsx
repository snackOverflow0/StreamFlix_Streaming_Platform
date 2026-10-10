import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Play } from "lucide-react";
import type { Content } from "@/features/streamflix/types";

export function Hero({
  content,
  onPlay,
  onInfo,
}: {
  content: Content;
  onPlay: () => void;
  onInfo: () => void;
}) {
  return (
    <section className="relative min-h-[560px] pt-16 sm:min-h-[760px] sm:pt-[72px]">
      <img
        src={content.preview ?? content.poster}
        alt={`${content.title} artwork`}
        width={1000}
        height={541}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b1a]/95 via-[#070b1a]/45 to-transparent sm:from-[#070b1a] sm:via-[#070b1a]/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b1a] via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[520px] max-w-[1500px] items-end px-5 pb-20 pt-14 sm:min-h-[650px] sm:items-center sm:px-10 lg:px-16">
        <div className="max-w-xl">
          <Badge className="mb-5 border-violet-400/30 bg-violet-500/15 text-violet-200">
            Featured on StreamFlix
          </Badge>
          <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] min-[380px]:text-5xl sm:text-7xl">
            {content.title.toUpperCase()}
          </h1>
          <p className="mt-4 line-clamp-3 max-w-md text-sm leading-6 text-slate-200 sm:mt-6 sm:text-lg sm:leading-7">
            {content.description}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Button
              onClick={onPlay}
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-white shadow-xl shadow-violet-900/30 sm:w-auto sm:px-7"
            >
              <Play className="fill-current" /> Play now
            </Button>
            <Button
              onClick={onInfo}
              size="lg"
              variant="outline"
              className="w-full rounded-xl border-white/20 bg-black/35 px-4 text-white backdrop-blur hover:bg-white/10 hover:text-white sm:w-auto sm:px-7"
            >
              <Info /> More info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
