import { MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { backendAsset } from "@/lib/backend-asset";

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
              Watch anywhere. Cancel anytime. Multiple member profiles based on your plan.
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
export function Footer({
  visitorCount,
  onFeedback,
  onAction,
}: {
  visitorCount: number | null;
  onFeedback: () => void;
  onAction: (link: string) => void;
}) {
  return (
    <footer className="border-t border-white/5 bg-[#060916] px-6 py-12">
      <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-4">
        <div>
          <img
            src={backendAsset("/streamflix/logo-optimized.webp")}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            className="size-14 object-contain"
          />
          <p className="mt-3 text-sm text-slate-500">Stories without limits.</p>
          {visitorCount !== null && <p className="mt-3 text-xs text-slate-600">{visitorCount.toLocaleString()} unique visitors</p>}
        </div>
        {[
          ["Browse", "Shows", "Movies", "New releases"],
          ["Account", "Plans", "Profiles", "Devices"],
          ["Support", "Help center", "Accessibility", "Legal"],
        ].map(([head, ...links]) => (
          <div key={head}>
            <h3 className="font-semibold">{head}</h3>
            <div className="mt-3 space-y-2">
              {links.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => onAction(link)}
                  className="block rounded-md text-sm text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-9 flex max-w-[1200px] items-center justify-between border-t border-white/5 pt-6 text-xs text-slate-600">
        <span>© 2026 StreamFlix</span>
        <button
          onClick={onFeedback}
          className="flex items-center gap-2 hover:text-white"
        >
          <MessageSquareText className="size-4" /> Send feedback
        </button>
      </div>
    </footer>
  );
}
