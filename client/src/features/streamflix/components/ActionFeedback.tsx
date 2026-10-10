import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";

type ActionType = "success" | "error" | "warning" | "info";
type ActionEventDetail = { type: ActionType; message: string; timestamp: number };

type ActionItem = ActionEventDetail & { id: number };

const ACTION_EVENT = "streamflix:action";

export function emitActionFeedback(type: ActionType, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ActionEventDetail>(ACTION_EVENT, {
      detail: {
        type,
        message,
        timestamp: Date.now(),
      },
    }),
  );
}

export default function ActionFeedback() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handleAction = (event: Event) => {
      const customEvent = event as CustomEvent<ActionEventDetail>;
      const detail = customEvent.detail;
      if (!detail?.message) return;

      idRef.current += 1;
      const id = detail.timestamp * 100 + idRef.current;
      setItems((current) => [
        { ...detail, id },
        ...current,
      ].slice(0, 4));

      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 4500);
    };

    window.addEventListener(ACTION_EVENT, handleAction);
    return () => window.removeEventListener(ACTION_EVENT, handleAction);
  }, []);

  if (!items.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-[min(92vw,390px)] flex-col gap-2.5"
    >
      {items.map((item) => {
        const config =
          item.type === "success"
            ? {
                Icon: CheckCircle2,
                title: "Action completed",
                border: "border-emerald-400/25",
                bg: "bg-emerald-950/90",
                icon: "text-emerald-300",
              }
            : item.type === "error"
              ? {
                  Icon: XCircle,
                  title: "Action failed",
                  border: "border-rose-400/25",
                  bg: "bg-rose-950/90",
                  icon: "text-rose-300",
                }
              : item.type === "warning"
                ? {
                    Icon: TriangleAlert,
                    title: "Action warning",
                    border: "border-amber-400/25",
                    bg: "bg-amber-950/90",
                    icon: "text-amber-300",
                  }
                : {
                    Icon: Info,
                    title: "StreamFlix",
                    border: "border-blue-400/25",
                    bg: "bg-blue-950/90",
                    icon: "text-blue-300",
                  };
        const Icon = config.Icon;

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 sf-glass-panel rounded-2xl border ${config.border} ${config.bg} p-4 shadow-2xl shadow-black/40 backdrop-blur-xl`}
          >
            <Icon className={`mt-0.5 size-5 shrink-0 ${config.icon}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                {config.title}
              </p>
              <p className="mt-1 text-sm font-medium leading-5 text-white">
                {item.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
              className="rounded-full p-1 text-white/45 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss action notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
