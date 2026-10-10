import { Button } from "@/components/ui/button";

export function SubscriptionBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="mx-auto mb-14 max-w-[1410px] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-r from-[#111736] via-[#201653] to-[#111736] px-6 py-9 sm:px-12">
        <div className="absolute -right-12 -top-20 size-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-2xl font-black">
              Unlimited movies, TV shows, and more.
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Watch anywhere. Cancel anytime. Up to four member profiles.
            </p>
          </div>
          <Button
            onClick={onOpen}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 text-white"
          >
            Manage your plan
          </Button>
        </div>
      </div>
    </section>
  );
}
