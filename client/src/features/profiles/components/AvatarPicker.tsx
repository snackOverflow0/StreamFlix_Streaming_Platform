import { Check } from "lucide-react";
import { DEFAULT_PROFILES } from "@/features/streamflix/data";

type AvatarPickerProps = { value: string | null; onChange: (url: string) => void };

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {DEFAULT_PROFILES.map((avatar) => {
        const url = new URL(avatar.image, window.location.origin).toString();
        const selected = value === url || value === avatar.image;
        return (
          <button key={avatar.id} type="button" onClick={() => onChange(url)} aria-label={`Choose ${avatar.name} avatar`} aria-pressed={selected}
            className={`group/avatar relative overflow-visible rounded-2xl border-2 p-1 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${selected ? "border-violet-400 bg-violet-500/10" : "border-white/10 hover:border-violet-300/50"}`}>
            <span className="relative block overflow-visible rounded-xl">
              <img src={avatar.image} alt={`${avatar.name} avatar`} className="aspect-square w-full rounded-xl object-cover transition duration-200 group-hover/avatar:scale-[1.03]" />
              {selected && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-violet-600 text-white shadow-lg"><Check className="size-3.5" /></span>}
              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-[90] w-40 -translate-x-1/2 translate-y-1 rounded-2xl border border-violet-300/30 bg-[#090d20] p-2 text-left opacity-0 shadow-[0_20px_50px_rgba(0,0,0,.65)] transition duration-150 group-hover/avatar:translate-y-0 group-hover/avatar:opacity-100">
                <img src={avatar.image} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <span className="mt-2 block truncate px-1 text-xs font-bold text-white">{avatar.name}</span>
                <span className="mt-0.5 block px-1 text-[10px] text-slate-400">Available StreamFlix avatar</span>
              </span>
            </span>
            <span className="mt-2 block truncate px-1 text-xs font-medium text-slate-300">{avatar.name}</span>
          </button>
        );
      })}
    </div>
  );
}
