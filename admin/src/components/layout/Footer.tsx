import { MessageSquareText } from "lucide-react";
import { ASSETS } from "@/features/streamflix/data";

export function Footer({
  onFeedback,
  onAction,
}: {
  onFeedback: () => void;
  onAction: (link: string) => void;
}) {
  return (
    <footer className="border-t border-white/5 bg-[#060916] px-6 py-12">
      <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-4">
        <div>
          <img
            src={ASSETS.logo}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            className="size-14 object-contain"
          />
          <p className="mt-3 text-sm text-slate-500">Stories without limits.</p>
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
