import type { ReactNode } from "react";
import { Film, House, ListPlus, ShoppingBag, Tv } from "lucide-react";
import type { View } from "../types";
import { NAV_ITEMS } from "../data/navigation";
import useGlideIndicator from "../hooks/useGlideIndicator";

export function DesktopNavigation({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (view: View) => void;
}) {
  const { containerRef, itemRefs, glide, moveTo } = useGlideIndicator(view);

  return (
    <nav
      ref={containerRef}
      onMouseLeave={() => moveTo(view)}
      className="relative hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.025] p-1 text-sm text-slate-300 shadow-lg shadow-black/10 backdrop-blur-xl lg:flex"
      aria-label="Main navigation"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-1 top-1 rounded-full border border-white/20 bg-white/[0.09] shadow-[0_8px_28px_rgba(124,58,237,0.18)] backdrop-blur-xl transition-[transform,width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
        style={{
          width: glide.width,
          opacity: glide.visible ? 1 : 0,
          transform: `translate3d(${glide.left}px, 0, 0)`,
        }}
      />
      {NAV_ITEMS.map((item) => {
        const active = view === item.id;
        return (
          <button
            key={item.id}
            ref={(element) => {
              itemRefs.current[item.id] = element;
            }}
            type="button"
            onClick={() => onNavigate(item.id)}
            onMouseEnter={() => moveTo(item.id)}
            onFocus={() => moveTo(item.id)}
            aria-current={active ? "page" : undefined}
            className={`relative z-10 rounded-full px-4 py-2 transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 ${active ? "font-semibold text-white" : "hover:text-white"}`}
          >
            {item.label}

          </button>
        );
      })}
    </nav>
  );
}
export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/10 hover:text-white hover:shadow-[0_6px_20px_rgba(124,58,237,0.14)] motion-reduce:transition-none [&>svg]:size-5"
    >
      {children}
    </button>
  );
}
export function MobileBottomNav({
  view,
  cartCount,
  onNavigate,
}: {
  view: View;
  cartCount: number;
  onNavigate: (view: View) => void;
}) {
  const { containerRef, itemRefs, glide, moveTo } = useGlideIndicator(view);
  const items: Array<{
    id: View;
    label: string;
    icon: typeof House;
  }> = [
    { id: "home", label: "Home", icon: House },
    { id: "shows", label: "Shows", icon: Tv },
    { id: "movies", label: "Movies", icon: Film },
    { id: "my-list", label: "My List", icon: ListPlus },
    { id: "store", label: "Merch", icon: ShoppingBag },
  ];

  return (
    <nav
      ref={containerRef}
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080c1d]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <div className="relative mx-auto grid h-[72px] max-w-md grid-cols-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 top-1 sf-glass-panel rounded-2xl border border-violet-400/20 bg-white/[0.08] shadow-[0_6px_20px_rgba(124,58,237,0.16)] backdrop-blur-xl transition-[transform,width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
          style={{
            width: glide.width,
            opacity: glide.visible ? 1 : 0,
            transform: `translate3d(${glide.left}px, 0, 0)`,
          }}
        />
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[item.id] = element;
              }}
              type="button"
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => moveTo(item.id)}
              onFocus={() => moveTo(item.id)}
              aria-current={active ? "page" : undefined}
              className={`group relative z-10 mx-0.5 my-1 flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none ${active ? "text-violet-300" : "text-slate-500 hover:text-white"}`}
            >
              <span className={`relative z-10 grid size-8 place-items-center rounded-full transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${active ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"}`}>
                <Icon className={`size-5 ${active ? "stroke-[2.4]" : ""}`} />
                {item.id === "store" && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
