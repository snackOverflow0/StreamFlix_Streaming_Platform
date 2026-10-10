import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";
import { MediaRow } from "@/components/media/MediaRow";

type WatchListPageProps = { state: StreamFlixController };

export default function WatchListPage({ state }: WatchListPageProps) {
  return (
    <section className="min-h-[72vh] pb-14 pt-24 sm:pb-20 sm:pt-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">StreamFlix Library</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">My List</h1>
      </div>
      <div className="mt-10 space-y-12">
        <MediaRow title="Watchlist" items={state.watchlistItems} episodeLabels={state.watchlistLabels} onSelect={state.openTitle} />
        <MediaRow title="Favorites" items={state.favoriteItems} episodeLabels={state.favoriteLabels} onSelect={state.openTitle} />
        <MediaRow title="Continue Watching" items={state.continueWatching} onSelect={state.openTitle} />
        <MediaRow title="Recently Watched" items={state.recentlyWatched} episodeLabels={state.recentlyWatchedLabels} onSelect={state.openTitle} />
      </div>
    </section>
  );
}
