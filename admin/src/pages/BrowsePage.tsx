import { Film } from "lucide-react";
import { TitleCard } from "@/components/media/TitleCard";
import type { Content } from "@/features/streamflix/types";

type BrowsePageProps = {
  title: string;
  items: Content[];
  onSelect: (item: Content) => void;
  emptyText: string;
};

export default function BrowsePage({ title, items, onSelect, emptyText }: BrowsePageProps) {
  return (
    <section className="mx-auto min-h-[72vh] max-w-[1500px] px-4 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-32">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">StreamFlix Library</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1>
      {items.length ? (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <TitleCard key={item.id} item={item} onClick={() => onSelect(item)} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-12 text-center">
          <Film className="mx-auto size-10 text-slate-500" />
          <p className="mt-4 text-slate-400">{emptyText}</p>
        </div>
      )}
    </section>
  );
}
