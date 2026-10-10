import type { ReactNode } from "react";
import { Film, House, ListPlus, ShoppingBag, Tv } from "lucide-react";
import type { View } from "@/features/streamflix/types";
import { NAV_ITEMS } from "@/features/streamflix/data";
import useGlideIndicator from "@/features/streamflix/hooks/useGlideIndicator";

export function Navigation({
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
        className="pointer-events-none absolute bottom-1 top-1 rounded-full border border-white/20 bg-white/[0.09] shadow-[0_8px_28px_rgba(124,58,237,0.18)] backdrop-blur-xl transition-[transform,width,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none"
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
            {active && (
              <span className="absolute inset-x-4 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
