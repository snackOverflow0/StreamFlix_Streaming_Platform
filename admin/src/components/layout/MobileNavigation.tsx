import { Film, House, ListPlus, ShoppingBag, Tv } from "lucide-react";
import type { View } from "@/features/streamflix/types";
import useGlideIndicator from "@/features/streamflix/hooks/useGlideIndicator";

export function MobileNavigation({
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
          className="pointer-events-none absolute bottom-1 top-1 rounded-2xl border border-violet-400/20 bg-white/[0.08] shadow-[0_6px_20px_rgba(124,58,237,0.16)] backdrop-blur-xl transition-[transform,width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
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
