import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MERCH } from "@/features/streamflix/data";
import { notify } from "@/features/streamflix/utils";
import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";

export default function StorePage({ state }: { state: StreamFlixController }) {
  return (
    <section className="mx-auto min-h-[72vh] max-w-[1300px] px-4 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">Official merchandise</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Bring the story home.</h1>
          <p className="mt-4 max-w-xl text-slate-400">Collect pieces inspired by the StreamFlix universe.</p>
        </div>
        <Button onClick={() => state.setCartOpen(true)} variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <ShoppingBag /> Bag ({state.cartCount})
        </Button>
      </div>

      <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3">
        {MERCH.map((item) => (
          <article key={item.id} className="rise-hover group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            <div className="aspect-square w-full bg-white p-5">
              <img src={item.image} alt={item.name} width={640} height={640} loading="lazy" decoding="async" className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-widest text-violet-300">{item.category}</p>
              <h2 className="mt-2 line-clamp-3 h-[5.25rem] text-xl font-bold leading-7">{item.name}</h2>
              <div className="mt-2 h-7">
                {item.stockLabel && (
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.stockStatus === "sold-out" ? "border-rose-400/30 bg-rose-500/10 text-rose-300" : "border-sky-400/30 bg-sky-500/10 text-sky-300"}`}>{item.stockLabel}</span>
                )}
              </div>
              <div className="mt-3 flex h-11 items-center justify-between gap-4">
                <span className="text-lg font-semibold">₱{item.price.toLocaleString()}</span>
                <Button
                  disabled={item.stockStatus === "sold-out"}
                  onClick={() => {
                    if (item.stockStatus === "sold-out") return;
                    state.setCart((items) => ({ ...items, [item.id]: (items[item.id] ?? 0) + 1 }));
                    void notify("success", "Added to merchandise bag");
                  }}
                  className="min-w-[104px] rounded-full bg-violet-600 text-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                >
                  <ShoppingBag /> {item.stockStatus === "sold-out" ? "Sold out" : "Add"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
