import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";
import HomePage from "@/pages/HomePage";
import BrowsePage from "@/pages/BrowsePage";
import WatchListPage from "@/pages/WatchListPage";
import StorePage from "@/pages/StorePage";

type AppRoutesProps = { state: StreamFlixController };

function CatalogStatus({ message, detail }: { message: string; detail: string }) {
  return (
    <section className="min-h-[72vh] px-5 pb-20 pt-32 text-slate-300 sm:px-10">
      <div className="mx-auto max-w-[1500px] rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-2xl font-bold">{message}</h1>
        <p className="mt-2 text-slate-400">{detail}</p>
      </div>
    </section>
  );
}

export default function AppRoutes({ state }: AppRoutesProps) {
  if (state.contentLoading) {
    return (
      <CatalogStatus
        message="Loading StreamFlix content..."
        detail="Fetching the latest catalog from the backend."
      />
    );
  }

  if (state.contentError) {
    return (
      <CatalogStatus
        message="Unable to load content"
        detail={`${state.contentError} Make sure the backend is running on http://localhost:4000.`}
      />
    );
  }

  const libraryTitle = state.query
    ? `Search results for “${state.query}”`
    : state.view === "shows"
      ? "TV Shows"
      : state.view === "new-releases"
        ? "New Releases"
        : "Movies";

  if (state.view === "home" && !state.query) return <HomePage state={state} />;
  if (state.view === "my-list" && !state.query) return <WatchListPage state={state} />;
  if (state.view === "store") return <StorePage state={state} />;

  return (
    <BrowsePage
      title={state.view === "my-list" ? "My List" : libraryTitle}
      items={state.view === "my-list" ? state.myList : state.visibleCatalog}
      onSelect={state.openTitle}
      emptyText={
        state.view === "my-list"
          ? "Save favorites and watchlist titles to see them here."
          : "No titles match your search."
      }
    />
  );
}
