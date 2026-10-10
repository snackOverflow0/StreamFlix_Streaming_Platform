import ClientNotifications from './ClientNotifications';
import { ChevronDown, Search, ShoppingBag, X } from "lucide-react";
import { backendAsset } from "@/lib/backend-asset";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { DesktopNavigation, IconButton } from "./Navigation";

type AppHeaderProps = {
  state: StreamFlixController;
};

export default function AppHeader({ state }: AppHeaderProps) {
  const {
    view,
    navigate,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    cartCount,
    setCartOpen,
    activeProfile,
    setAccountOpen,
  } = state;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#090d20]/90 backdrop-blur-xl">
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
          <span className="hidden bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-lg font-black tracking-tight text-transparent sm:block">
            streamflix
          </span>
        </button>

        <DesktopNavigation view={view} onNavigate={navigate} />

        <div className="ml-auto flex items-center gap-2">
          <div className={`overflow-hidden transition-all ${searchOpen ? "w-[calc(100vw-5.75rem)] sm:w-[260px]" : "w-9"}`}>
            {searchOpen ? (
              <div className="flex h-9 items-center rounded-full border border-violet-400/40 bg-white/8 px-3">
                <Search className="mr-2 size-4 text-violet-300" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search titles or genres"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
                  aria-label="Search titles or genres"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <IconButton label="Search" onClick={() => setSearchOpen(true)}>
                <Search />
              </IconButton>
            )}
          </div>

          <div className={searchOpen ? "hidden sm:block" : "block"}>
            <ClientNotifications/>
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
