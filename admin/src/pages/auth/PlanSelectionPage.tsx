import { useState } from "react";
import { Check, UsersRound } from "lucide-react";
import { ASSETS, PLANS } from "@/features/streamflix/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";

const authBackground = {
  background:
    "radial-gradient(circle at 88% 12%, rgba(35, 72, 137, 0.48) 0%, rgba(20, 36, 78, 0.2) 28%, transparent 58%), radial-gradient(circle at 22% 100%, rgba(76, 24, 112, 0.55) 0%, rgba(38, 17, 68, 0.24) 34%, transparent 62%), linear-gradient(135deg, #07091b 0%, #090b24 48%, #050611 100%)",
};

type PlanSelectionPageProps = {
  currentPlan: string;
  onSelectPlan: (id: string) => void;
  onBackToRegistration: () => void;
};

export default function PlanSelectionPage({ currentPlan, onSelectPlan, onBackToRegistration }: PlanSelectionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

    const activePlan =
      PLANS.find((item) => item.id === selectedPlan) ?? PLANS[1];

    return (
      <main
        className="relative min-h-screen overflow-hidden bg-[#07091b] px-5 py-8 text-white sm:px-10"
        style={authBackground}
      >
        <DeferredToaster richColors position="bottom-right" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.025),transparent_42%)]" />
        <header className="relative z-10 flex items-center gap-2">
          <img
            src={ASSETS.logo}
            alt="StreamFlix"
            width={256}
            height={256}
            loading="eager"
            decoding="async"
            className="h-12 w-12 object-contain"
          />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-xl font-black tracking-tight text-transparent">
            streamflix
          </span>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSelectPlan(selectedPlan);
          }}
          className="relative z-10 mx-auto flex min-h-[calc(100vh-112px)] w-full max-w-5xl flex-col justify-center py-10"
        >
          <div className="text-center">
            <Badge className="border-violet-400/25 bg-violet-500/15 text-violet-200">
              Step 2 of 4
            </Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Choose your StreamFlix plan
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Get the full catalog with no long-term commitment. You can change
              or cancel your plan anytime.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {PLANS.map((item) => {
              const isSelected = selectedPlan === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPlan(item.id)}
                  aria-pressed={isSelected}
                  className={`relative rounded-3xl border p-6 text-left shadow-xl transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isSelected
                      ? "border-violet-400 bg-violet-500/15 shadow-violet-950/30"
                      : "border-white/10 bg-[#090d20]/75 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    {isSelected && (
                      <Badge className="border-0 bg-violet-600 text-white">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="mt-5 text-4xl font-black">
                    ₱{item.price}
                    <span className="text-sm font-normal text-slate-400">
                      /mo
                    </span>
                  </p>
                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <p className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-400" />
                      {item.quality} streaming
                    </p>
                    <p className="flex items-center gap-2">
                      <UsersRound className="size-4 text-violet-300" />
                      {item.memberText}
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-400" />
                      Full StreamFlix catalog
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-8 w-full max-w-md">
            <Button
              type="submit"
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-base font-bold text-white hover:from-blue-500 hover:to-violet-500"
            >
              Continue with {activePlan.name}
            </Button>
            <button
              type="button"
              onClick={onBackToRegistration}
              className="mt-4 w-full text-sm text-slate-500 hover:text-slate-300"
            >
              Back to registration
            </button>
          </div>
        </form>
      </main>
    );
}
