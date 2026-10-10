import { Progress } from "@/components/ui/progress";
import { getViewingMeta } from "@/features/streamflix/utils";
import type { Content as ContentType } from "@/features/streamflix/types";

export function TitleCard({
  item,
  landscape = false,
  metaText,
  onClick,
}: {
  item: ContentType;
  landscape?: boolean;
  metaText?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative shrink-0 snap-start overflow-hidden rounded-xl border border-white/8 bg-[#10162f] text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-950/40 ${landscape ? "aspect-video w-[78vw] max-w-[320px] sm:h-[205px] sm:w-[360px] sm:max-w-none" : "aspect-[2/3] w-[calc((100vw-3.5rem)/2)] sm:h-[310px] sm:w-[185px]"}`}
    >
      <img
        src={landscape ? item.preview ?? item.poster : item.poster}
        alt={`${item.title} ${landscape ? "preview" : "poster"}`}
        width={landscape ? 1280 : 520}
        height={landscape ? 720 : 780}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent ${landscape ? "opacity-90" : "opacity-75"}`} />
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-3 ${landscape ? "pt-14" : "pt-12"}`}>
        <p className="truncate font-semibold">{item.title}</p>
        <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-300">
          {metaText ?? getViewingMeta(item)}
        </p>
        {item.progress && (
          <Progress
            value={item.progress}
            className="mt-3 h-1 bg-white/30 [&_[data-slot=progress-indicator]]:bg-violet-500"
          />
        )}
      </div>
    </button>
  );
}
