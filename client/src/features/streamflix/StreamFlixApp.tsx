import { lazy, Suspense, useEffect } from "react";
import AuthGate from "./components/AuthGate";
import AppOverlays from "./components/AppOverlays";
import ActionFeedback from "./components/ActionFeedback";
import { useStreamFlix } from "./hooks/useStreamFlix";
import { BottomBar, Footer, Nav } from "./v2/Shell";
import { CartPage, CatalogPage, FeedbackPage, HomePage, MyListPage, SearchPage, StorePage } from "./v2/Pages";
import "@/client-v2.css";
const Detail = lazy(() => import("./v2/Detail"));
import HoverPreview from "./v2/HoverPreview";

export default function StreamFlixApp() {
  const state = useStreamFlix();
  const { view, navigate, cartOpen, setCartOpen, feedbackOpen, setFeedbackOpen, reviewOpen, setReviewOpen, setDetailOpen } = state;

  // Older entry points (Stripe return, account menu) still open the bag/feedback/review dialogs; route them to the new pages instead.
  useEffect(() => { if (cartOpen) { setCartOpen(false); navigate("cart"); } }, [cartOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (feedbackOpen) { setFeedbackOpen(false); navigate("feedback"); } }, [feedbackOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (reviewOpen) { setReviewOpen(false); setDetailOpen(true); } }, [reviewOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = state.contentLoading && !state.catalog.length;
  const failed = state.contentError && !state.catalog.length;
  const page = view === "home" ? <HomePage state={state} />
    : view === "movies" || view === "shows" || view === "new-releases" ? <CatalogPage key={view} state={state} />
    : view === "my-list" ? <MyListPage state={state} />
    : view === "store" ? <StorePage state={state} />
    : view === "cart" ? <CartPage state={state} />
    : view === "feedback" ? <FeedbackPage state={state} />
    : <SearchPage state={state} />;

  return (
    <>
      <ActionFeedback />
      {state.authStage !== "app" ? (
        <AuthGate state={state} />
      ) : (
        <div className="v-app">
          <Nav state={state} />
          {loading ? <div className="v-page"><div className="v-sk" style={{ height: "52vh", marginBottom: 28 }} /><div className="v-grid">{Array.from({ length: 6 }).map((_, n) => <div key={n} className="v-sk" style={{ aspectRatio: "2/3" }} />)}</div></div>
            : failed ? <div className="v-page"><div className="v-empty"><b>We couldn’t load StreamFlix</b><span>{state.contentError}</span><button type="button" className="v-btn v-glass sm" onClick={() => void state.refreshBootstrap(false).catch(() => undefined)}>Try again</button></div></div>
            : <main>{page}</main>}
          <Footer state={state} />
          <BottomBar state={state} />
          <HoverPreview state={state} />
          <Suspense fallback={null}><Detail state={state} /></Suspense>
          <AppOverlays state={state} />
        </div>
      )}
    </>
  );
}
