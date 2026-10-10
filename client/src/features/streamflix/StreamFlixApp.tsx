import AuthGate from "./components/AuthGate";
import AppHeader from "./components/AppHeader";
import AppOverlays from "./components/AppOverlays";
import MainContent from "./components/MainContent";
import ActionFeedback from "./components/ActionFeedback";
import { useStreamFlix } from "./hooks/useStreamFlix";

export default function StreamFlixApp() {
  const state = useStreamFlix();

  return (
    <>
      <ActionFeedback />
      {state.authStage !== "app" ? (
        <AuthGate state={state} />
      ) : (
        <main className="sf-client min-h-screen overflow-x-clip bg-[#070b1a] pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-white sm:pb-0">
          <AppHeader state={state} />
          <MainContent state={state} />
          <AppOverlays state={state} />
        </main>
      )}
    </>
  );
}
