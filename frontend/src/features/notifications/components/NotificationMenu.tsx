import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AppNotification } from "@/features/streamflix/types";

export function NotificationMenu({ notifications, onMarkAll, onMarkOne }: { notifications: AppNotification[]; onMarkAll: () => void; onMarkOne: (id: number) => void }) {
  const unread = notifications.filter((item) => item.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="relative rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label={`Open notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute right-1 top-1 grid min-w-2.5 place-items-center rounded-full bg-violet-500 px-1 text-[8px] font-bold leading-3 text-white ring-2 ring-[#090d20]">{unread > 9 ? "9+" : unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] border-white/10 bg-[#0c1127] p-0 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3"><div><h3 className="font-semibold">Notifications</h3><p className="text-[11px] text-slate-500">{unread} unread</p></div><button type="button" onClick={onMarkAll} disabled={!unread} className="text-[11px] font-semibold text-violet-300 hover:text-violet-200 disabled:text-slate-700">Mark all read</button></div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {notifications.length ? notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => onMarkOne(notification.backendId)} className={`block w-full rounded-xl px-3 py-3 text-left transition hover:bg-white/5 ${notification.unread ? "bg-violet-500/5" : ""}`}>
              <div className="flex items-start gap-2"><span className={`mt-1 size-1.5 shrink-0 rounded-full ${notification.unread ? "bg-violet-400" : "bg-slate-700"}`} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{notification.message}</p><p className="mt-2 text-[11px] text-violet-300">{notification.time}</p></div></div>
            </button>
          )) : <p className="p-6 text-center text-sm text-slate-500">You’re all caught up.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
