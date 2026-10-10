import {usePlatform} from '@/services/platform';
import { useEffect, useState } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { backendAsset } from "@/lib/backend-asset";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { DesktopNavigation } from "./Navigation";
import { SearchBox } from "@/features/search/components/SearchBox";
import { NotificationMenu } from "@/features/notifications/components/NotificationMenu";

type AppHeaderProps = {
  state: StreamFlixController;
};

export default function AppHeader({ state }: AppHeaderProps) {
  const platform=usePlatform();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const {
    view,
    navigate,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    catalog,
    notifications,
    markNotificationsRead,
    markNotification,
    cartCount,
    setCartOpen,
    activeProfile,
    setAccountOpen,
  } = state;

  return (
    <header data-scrolled={scrolled} className="sf-client-header fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#090d20]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-3 sm:h-[72px] sm:gap-6 sm:px-6">
        <button onClick={() => navigate("home")} className="flex items-center gap-2" aria-label="StreamFlix home">
          <img
            src={backendAsset("/streamflix/logo-optimized.webp")}
            alt="StreamFlix"
            width={256}
            height={256}
            loading="eager"
            decoding="async"
            className="h-10 w-10 object-contain sm:h-11 sm:w-11"
          />
          <span  className="hidden bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-lg font-black tracking-tight text-transparent sm:block">
            {platform.platformName}
          </span>
        </button>

        <DesktopNavigation view={view} onNavigate={navigate} />

        <div className="ml-auto flex items-center gap-2">
          <SearchBox open={searchOpen} query={query} catalog={catalog} onOpenChange={setSearchOpen} onQueryChange={setQuery} />

          <div className={searchOpen ? "hidden sm:block" : "block"}>
            <NotificationMenu key={activeProfile?.backendId} notifications={notifications} onMarkAll={() => void markNotificationsRead()} onMarkOne={(id) => void markNotification(id)} />
          </div>

          <button type="button" onClick={() => setCartOpen(true)} className={`relative rounded-full p-2 hover:bg-white/10 ${searchOpen ? "hidden sm:block" : "block"}`} aria-label="Open merchandise bag">
            <ShoppingBag className="size-5" />
            {cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-violet-500 text-[10px] font-bold">{cartCount}</span>}
          </button>

          <button type="button" onClick={() => setAccountOpen(true)} className={`items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 hover:bg-white/10 sm:pr-2 ${searchOpen ? "hidden sm:flex" : "flex"}`} aria-label="Open account">
            <img
              src={activeProfile?.image ?? backendAsset("/streamflix/logo.png")}
              alt={`${activeProfile?.name ?? "Viewer"} profile`}
              width={64}
              height={64}
              loading="eager"
              decoding="async"
              className="size-8 rounded-full object-cover"
            />
            <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
