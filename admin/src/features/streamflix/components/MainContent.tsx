import LazySection from "@/components/lazy-section";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { Hero, MediaRow } from "./Content";
import { LibraryView, MyListView, StoreView } from "./Views";
import { Footer, SubscriptionBanner } from "./Layout";
import { MobileBottomNav } from "./Navigation";

type MainContentProps = { state: StreamFlixController };
export default function MainContent({ state }: MainContentProps) {
  const { view, query, setFeedbackOpen, setPlansOpen, setAuthStage, setFooterPanel, cart, setCart, cartCount, setCartOpen, watchlistItems, continueWatching, recentlyWatched, favoriteItems, favoriteLabels, watchlistLabels, recentlyWatchedLabels, myList, visibleCatalog, openTitle, play, navigate, sections, featuredTitle, products } = state;
  const libraryTitle = query ? `Search results for “${query}”` : view === "my-list" ? "My List" : view === "shows" ? "TV Shows" : view === "new-releases" ? "New Releases" : "Movies";
  return (
    <>
      {view === "home" && !query ? <>
        <Hero item={featuredTitle} onPlay={() => featuredTitle && play(featuredTitle)} onInfo={() => featuredTitle && openTitle(featuredTitle)} />
        <div className="relative z-10 -mt-10 space-y-12 pb-20 sm:-mt-16">{sections.map((section, index) => <LazySection key={section.title} minHeight={index === 0 ? 280 : 340}><MediaRow title={section.title} items={section.items} onSelect={openTitle} /></LazySection>)}</div>
      </> : view === "store" ? <StoreView cart={cart} setCart={setCart} cartCount={cartCount} openCart={() => setCartOpen(true)} products={products} /> : view === "my-list" && !query ? <MyListView watchlistItems={watchlistItems} continueWatching={continueWatching} recentlyWatched={recentlyWatched} favorites={favoriteItems} favoriteLabels={favoriteLabels} watchlistLabels={watchlistLabels} recentlyWatchedLabels={recentlyWatchedLabels} onSelect={openTitle} /> : <LibraryView title={libraryTitle} items={view === "my-list" ? myList : visibleCatalog} onSelect={openTitle} emptyText={view === "my-list" ? "Save favorites and watchlist titles to see them here." : "No titles match your search."} />}
      <LazySection minHeight={220}><SubscriptionBanner onOpen={() => setPlansOpen(true)} /></LazySection>
      <LazySection minHeight={300}><Footer onFeedback={() => setFeedbackOpen(true)} onAction={(link) => { if (link === "Shows") navigate("shows"); if (link === "Movies") navigate("movies"); if (link === "New releases") navigate("new-releases"); if (link === "Plans") setPlansOpen(true); if (link === "Profiles") setAuthStage("profiles"); if (link === "Devices") setFooterPanel("devices"); if (link === "Help center") setFooterPanel("help"); if (link === "Accessibility") setFooterPanel("accessibility"); if (link === "Legal") setFooterPanel("legal"); }} /></LazySection>
      <MobileBottomNav view={view} cartCount={cartCount} onNavigate={navigate} />
    </>
  );
}
