import LazySection from "@/components/LazySection";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionBanner } from "@/components/layout/SubscriptionBanner";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import AppModals from "@/components/modals/AppModals";
import AppRoutes from "./AppRoutes";
import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";

export default function AppLayout({ state }: { state: StreamFlixController }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b1a] pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-white sm:pb-0">
      <Header state={state} />
      <AppRoutes state={state} />
      <LazySection minHeight={220}>
        <SubscriptionBanner onOpen={() => state.setPlansOpen(true)} />
      </LazySection>
      <LazySection minHeight={300}>
        <Footer
          onFeedback={() => state.setFeedbackOpen(true)}
          onAction={(link) => {
            if (link === "Shows") state.navigate("shows");
            if (link === "Movies") state.navigate("movies");
            if (link === "New releases") state.navigate("new-releases");
            if (link === "Plans") state.setPlansOpen(true);
            if (link === "Profiles") state.setAuthStage("profiles");
            if (link === "Devices") state.setFooterPanel("devices");
            if (link === "Help center") state.setFooterPanel("help");
            if (link === "Accessibility") state.setFooterPanel("accessibility");
            if (link === "Legal") state.setFooterPanel("legal");
          }}
        />
      </LazySection>
      <MobileNavigation view={state.view} cartCount={state.cartCount} onNavigate={state.navigate} />
      <AppModals state={state} />
    </main>
  );
}
