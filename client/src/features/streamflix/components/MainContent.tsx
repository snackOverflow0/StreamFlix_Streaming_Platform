import CategoryView from "./CategoryView";
import LazySection from "@/components/LazySection";
import { getViewTitle } from "@/app/router";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { Hero, MediaRow } from "./Content";
import { TopTenRow } from "@/features/movies/components/TopTenRow";
import { LibraryView, MyListView, StoreView } from "./Views";
import { Footer, SubscriptionBanner } from "./Layout";
import { MobileBottomNav } from "./Navigation";

type MainContentProps = { state: StreamFlixController };
export default function MainContent({ state }: MainContentProps) {
  const { contentLoading, contentError, view, query, setFeedbackOpen, setPlansOpen, setAuthStage, setFooterPanel, cartCount, setCartOpen, watchlistItems, continueWatching, recentlyWatched, favoriteItems, favoriteLabels, watchlistLabels, recentlyWatchedLabels, myList, visibleCatalog, openTitle, play, navigate, sections, featuredTitle, topTenItems, products, visitorCount, favorites, watchlist, toggleFavorite, toggleWatchlist, addToCart } = state;
  const libraryTitle = getViewTitle(view, query);
  if (contentLoading && !state.catalog.length) {
    return (
      <div className="pb-20 pt-16 sm:pt-[72px]">
        <div className="min-h-[560px] animate-pulse bg-gradient-to-b from-white/[.04] to-transparent sm:min-h-[680px]" />
        <div className="mx-auto -mt-12 max-w-[1500px] space-y-10 px-4 sm:px-6">
          {[0, 1, 2].map((row) => <section key={row}><div className="mb-3 h-6 w-48 animate-pulse rounded bg-white/10" /><div className="flex gap-3 overflow-hidden">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[2/3] w-[calc((100vw-3.5rem)/2)] shrink-0 animate-pulse rounded-xl bg-white/[.06] sm:w-[185px]" />)}</div></section>)}
        </div>
      </div>
    );
  }
  if (contentError && !state.catalog.length) {
    return <section className="grid min-h-[72vh] place-items-center px-5 pt-20"><div className="max-w-lg sf-glass-panel rounded-3xl border border-rose-400/20 bg-rose-500/5 p-8 text-center"><h1 className="text-2xl font-black">We couldn’t load StreamFlix</h1><p className="mt-3 text-sm leading-6 text-slate-400">{contentError}</p><button className="sf-retry-button" onClick={() => void state.refreshBootstrap(false).catch(() => undefined)}>Try again</button></div></section>;
  }
  return (
    <>
      {view === "home" && !query ? <>
        <Hero item={featuredTitle} onPlay={() => featuredTitle && play(featuredTitle)} onInfo={() => featuredTitle && openTitle(featuredTitle)} onWatchlist={() => featuredTitle && void toggleWatchlist(featuredTitle.id)} isWatchlisted={featuredTitle ? watchlist.includes(featuredTitle.id) : false} />
        <div className="sf-home-rows relative z-10 mt-8 space-y-12 pb-20 sm:mt-10">
          <section className="sf-discover-strip" aria-label="Explore genres"><div><p>YOUR NEXT GREAT STORY</p><h2>A world worth getting lost in.</h2></div><div className="sf-genre-chips">{Array.from(new Set(state.catalog.map(item=>item.genre))).filter(Boolean).slice(0,6).map(genre=><button key={genre} onClick={()=>state.setQuery(genre)}>{genre}</button>)}</div></section>
          {continueWatching.length ? <MediaRow title="Continue Watching" items={continueWatching} onSelect={openTitle} onPlay={play} onFavorite={item => void toggleFavorite(item.id)} onWatchlist={item => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist}/> : <section className="sf-media-row sf-continue-empty" aria-label="Continue Watching"><h2 className="sf-row-heading">Continue Watching</h2><p>Your saved trailers will appear here.</p></section>}
          {sections.preTopSections.map((section) => <LazySection key={section.title} minHeight={240}><MediaRow title={section.title} items={section.items} onSelect={openTitle} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist} /></LazySection>)}{topTenItems.length > 0 && <LazySection minHeight={280}><TopTenRow items={topTenItems} onSelect={openTitle} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist} /></LazySection>}{sections.newReleases.length > 0 && <LazySection minHeight={240}><MediaRow title="New Releases" items={sections.newReleases} onSelect={openTitle} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist} /></LazySection>}{sections.genreSections.map((section) => <LazySection key={`genre-${section.title}`} minHeight={240}><MediaRow title={section.title} items={section.items} onSelect={openTitle} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist} /></LazySection>)}</div>
      </> : (view === "shows" || view === "movies") && !query ? <CategoryView key={view} state={state} /> : view === "store" ? <StoreView cartCount={cartCount} openCart={() => setCartOpen(true)} products={products} onAddToCart={addToCart} /> : view === "my-list" && !query ? <MyListView watchlistItems={watchlistItems} continueWatching={continueWatching} recentlyWatched={recentlyWatched} favorites={favoriteItems} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favoritesIds={favorites} watchlistIds={watchlist} favoriteLabels={favoriteLabels} watchlistLabels={watchlistLabels} recentlyWatchedLabels={recentlyWatchedLabels} onSelect={openTitle} /> : <LibraryView title={libraryTitle} items={view === "my-list" ? myList : visibleCatalog} onSelect={openTitle} onPlay={play} onFavorite={(item) => void toggleFavorite(item.id)} onWatchlist={(item) => void toggleWatchlist(item.id)} favorites={favorites} watchlist={watchlist} emptyText={view === "my-list" ? "Save favorites and watchlist titles to see them here." : "No titles match your search."} />}
      <LazySection minHeight={220}><SubscriptionBanner onOpen={() => setPlansOpen(true)} /></LazySection>
      <LazySection minHeight={300}><Footer visitorCount={visitorCount} onFeedback={() => setFeedbackOpen(true)} onAction={(link) => { if (link === "Shows") navigate("shows"); if (link === "Movies") navigate("movies"); if (link === "New releases") navigate("new-releases"); if (link === "Plans") setPlansOpen(true); if (link === "Profiles") setAuthStage("profiles"); if (link === "Devices") setFooterPanel("devices"); if (link === "Help center") setFooterPanel("help"); if (link === "Accessibility") setFooterPanel("accessibility"); if (link === "Legal") setFooterPanel("legal"); }} /></LazySection>
      <MobileBottomNav view={view} cartCount={cartCount} onNavigate={navigate} />
    </>
  );
}
